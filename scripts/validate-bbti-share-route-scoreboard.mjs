#!/usr/bin/env node
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const ROOT = process.cwd();
const nodeRequire = createRequire(import.meta.url);
const runtimeModuleCache = new Map();
const errors = [];
const FORBIDDEN_COPY_TERMS = [
  "VAR",
  "点球",
  "德比",
  "FUT",
  "足球",
  "官方认证",
  "公认第一",
  "真实热度",
  "实时热度",
  "全网",
  "用户投票",
  "播放量",
  "热搜",
  "多数球迷",
  "大家都选",
  "真实胜率",
];

function resolveRuntimeModule(fromPath, request) {
  if (request.startsWith("@/")) {
    const basePath = path.join(ROOT, "src", request.slice(2));
    const candidates = [
      basePath,
      `${basePath}.ts`,
      `${basePath}.tsx`,
      `${basePath}.js`,
      path.join(basePath, "index.ts"),
    ];

    return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
  }

  if (!request.startsWith(".")) return null;

  const basePath = path.resolve(path.dirname(fromPath), request);
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    path.join(basePath, "index.ts"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function loadRuntimeTsModule(filePath) {
  const absolutePath = path.resolve(filePath);
  const cached = runtimeModuleCache.get(absolutePath);
  if (cached) return cached.exports;

  const runtimeModule = { exports: {} };
  runtimeModuleCache.set(absolutePath, runtimeModule);

  const sourceText = fs.readFileSync(absolutePath, "utf8");
  const compiled = ts.transpileModule(sourceText, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });

  const localRequire = (request) => {
    const runtimePath = resolveRuntimeModule(absolutePath, request);
    return runtimePath ? loadRuntimeTsModule(runtimePath) : nodeRequire(request);
  };
  const wrapper = vm.runInThisContext(
    `(function(require, module, exports, __filename, __dirname) {\n${compiled.outputText}\n})`,
    { filename: absolutePath },
  );
  wrapper(localRequire, runtimeModule, runtimeModule.exports, absolutePath, path.dirname(absolutePath));
  return runtimeModule.exports;
}

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function addError(message) {
  errors.push(message);
}

function assertEqual(label, actual, expected) {
  if (actual !== expected) {
    addError(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertIncludes(label, value, expected) {
  if (!String(value ?? "").includes(expected)) {
    addError(`${label}: missing ${JSON.stringify(expected)}`);
  }
}

function assertNotIncludes(label, value, forbidden) {
  if (String(value ?? "").includes(forbidden)) {
    addError(`${label}: must not include ${JSON.stringify(forbidden)}`);
  }
}

function assertTruthy(label, value) {
  if (!value) addError(`${label}: expected a non-empty value`);
}

const {
  BBTI_SHARE_ROUTE_SCOREBOARD_BOUNDARY,
  BBTI_SHARE_ROUTE_SCOREBOARD_VERSION,
  getBbtiShareKits,
  resolveBbtiShareRouteScoreboard,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-share-kits.ts"));

const shareKitsComponent = read("src/components/BbtiShareKits.tsx");
const shareKitsData = read("src/data/bbti-share-kits.ts");
const visualFixtures = read("scripts/render-bbti-visual-qa-fixtures.mjs");
const factRules = read("docs/BBTI_FACT_RULES.md");
const visualQa = read("docs/BBTI_VISUAL_QA.md");

assertEqual("share route scoreboard version", BBTI_SHARE_ROUTE_SCOREBOARD_VERSION, "bbti-share-route-scoreboard-v1");
assertEqual(
  "share route scoreboard boundary",
  BBTI_SHARE_ROUTE_SCOREBOARD_BOUNDARY,
  "本地分享路线比分牌，只复用当前结果、情境和推荐对线，不代表真实赛程、热度或用户行为。",
);

if (typeof resolveBbtiShareRouteScoreboard !== "function") {
  addError("resolveBbtiShareRouteScoreboard must be exported");
}
if (typeof getBbtiShareKits !== "function") {
  addError("getBbtiShareKits must be exported");
}

const baseInput = {
  challengeCopy: "下一场拿这个标准开战。",
  challengeMatchupId: "kobe-vs-jordan",
  challengeMatchupTitle: "Kobe vs Jordan",
  challengeTitle: "Kobe vs Jordan",
  code: "OAIL",
  compatibility: "DATR",
  debateWeapon: "把最后两分钟回合拆成出手质量、协防选择和冠军窗口。",
  emoji: "BBTI",
  nemesis: "OEIR",
  spiritPlayer: "Kobe Bryant",
  tagline: "你会先把高阶表摊开，再告诉别人这不是偏爱，是证据。",
  typeName: "空间捕食者",
};
const eventInput = {
  ...baseInput,
  eventChallengeCopy: "按抢七逻辑直接选边。",
  eventChallengeMatchupId: "lebron-vs-jordan",
  eventChallengeMatchupTitle: "LeBron vs Jordan",
  eventCourt: "中立噪音",
  eventGroupChatPrompt: "抢七最后 90 秒，我这个 OAIL 会把球给谁？",
  eventId: "game-7",
  eventScenario: "落后 2 分，暂停回来，球馆只剩噪音和心跳。",
  eventStakes: "一球定生死",
  eventTag: "Game 7",
  eventTitle: "抢七最后 90 秒",
};

if (typeof resolveBbtiShareRouteScoreboard === "function" && typeof getBbtiShareKits === "function") {
  const ordinaryKits = getBbtiShareKits(baseInput);
  const eventKits = getBbtiShareKits(eventInput);
  const scoreboard = resolveBbtiShareRouteScoreboard(eventInput);
  const ordinaryScoreboard = resolveBbtiShareRouteScoreboard(baseInput);
  const arenaKit = eventKits[0];

  assertEqual("ordinary kit count", ordinaryKits.length, 5);
  assertEqual("ordinary scoreboard", ordinaryScoreboard, null);
  assertEqual("event kit count", eventKits.length, 6);
  assertEqual("event first kit id", arenaKit?.id, "arena-event");
  assertEqual("arena kit link kind", arenaKit?.linkKind, "event-challenge");
  assertTruthy("arena kit route scoreboard", arenaKit?.routeScoreboard);
  assertEqual("scoreboard version", scoreboard?.version, BBTI_SHARE_ROUTE_SCOREBOARD_VERSION);
  assertEqual("scoreboard code", scoreboard?.code, "OAIL");
  assertEqual("scoreboard source kit", scoreboard?.sourceKitId, "arena-event");
  assertEqual("scoreboard event", scoreboard?.eventId, "game-7");
  assertEqual("scoreboard challenge", scoreboard?.challengeMatchupId, "lebron-vs-jordan");
  assertEqual("scoreboard route count", scoreboard?.routeCount, 3);
  assertEqual("scoreboard row ids", scoreboard?.rows.map((row) => row.id).join(","), "event-tipoff,challenge-branch,share-return");
  assertEqual("scoreboard row targets", scoreboard?.rows.map((row) => row.target).join(","), "daily-event,challenge,share");
  assertIncludes("scoreboard copy", scoreboard?.copyText, "BBTI 路线比分牌");
  assertIncludes("scoreboard copy boundary", scoreboard?.copyText, BBTI_SHARE_ROUTE_SCOREBOARD_BOUNDARY);
  assertEqual("arena kit scoreboard copy", arenaKit?.routeScoreboard?.copyText, scoreboard?.copyText);

  const copySurface = [
    scoreboard?.copyText,
    ...(scoreboard?.rows ?? []).flatMap((row) => [row.label, row.scoreLabel, row.title, row.body]),
  ].join("\n");
  for (const term of FORBIDDEN_COPY_TERMS) {
    assertNotIncludes("scoreboard copy surface", copySurface, term);
  }
}

[
  'BBTI_SHARE_ROUTE_SCOREBOARD_VERSION = "bbti-share-route-scoreboard-v1"',
  "BBTI_SHARE_ROUTE_SCOREBOARD_BOUNDARY",
  "resolveBbtiShareRouteScoreboard",
  '"event-tipoff"',
  '"challenge-branch"',
  '"share-return"',
  '"daily-event"',
  '"challenge"',
  '"share"',
].forEach((expected) => assertIncludes("share route scoreboard data contract", shareKitsData, expected));

[
  'data-testid="bbti-share-route-scoreboard"',
  "data-bbti-share-route-scoreboard-version={routeScoreboard.version}",
  "data-bbti-share-route-scoreboard-kit={routeScoreboard.sourceKitId}",
  "data-bbti-share-route-scoreboard-code={routeScoreboard.code}",
  "data-bbti-share-route-scoreboard-event={routeScoreboard.eventId}",
  "data-bbti-share-route-scoreboard-challenge={routeScoreboard.challengeMatchupId}",
  "data-bbti-share-route-scoreboard-count={routeScoreboard.routeCount}",
  'data-testid="bbti-share-route-scoreboard-row"',
  "data-bbti-share-route-scoreboard-row={row.id}",
  "data-bbti-share-route-scoreboard-target={row.target}",
  "data-bbti-share-route-scoreboard-position={index + 1}",
  'data-testid="bbti-share-route-scoreboard-action"',
  'data-bbti-share-route-scoreboard-action="copy-scoreboard"',
  'data-testid="bbti-share-route-scoreboard-boundary"',
].forEach((expected) => assertIncludes("share route scoreboard UI contract", shareKitsComponent, expected));

[
  'id: "share-route-scoreboard"',
  '[data-testid="bbti-share-route-scoreboard"]',
  'data-bbti-share-route-scoreboard-version="bbti-share-route-scoreboard-v1"',
  'data-bbti-share-route-scoreboard-row="event-tipoff"',
  'data-bbti-share-route-scoreboard-row="challenge-branch"',
  'data-bbti-share-route-scoreboard-row="share-return"',
].forEach((expected) => assertIncludes("visual QA share route coverage", visualFixtures, expected));

assertIncludes("fact rules share route boundary", factRules, "Share Route Scoreboard Boundary");
assertIncludes("fact rules share route boundary", factRules, "bbti-share-route-scoreboard-v1");
assertIncludes("visual QA share route docs", visualQa, "Share Route Scoreboard checks");

if (errors.length) {
  console.error("BBTI share route scoreboard validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI share route scoreboard validation");
console.log(`- contract: ${BBTI_SHARE_ROUTE_SCOREBOARD_VERSION}`);
console.log("- rows: event-tipoff, challenge-branch, share-return");
console.log("- source: local result + active Arena Event + recommended challenge");
console.log("OK: share route scoreboard stays local, basketball-native, and selector-backed.");
