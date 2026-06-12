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
  "football",
  "soccer",
  "梅西",
  "C罗",
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
  BBTI_SHARE_LOCKER_ROOM_BOUNDARY,
  BBTI_SHARE_LOCKER_ROOM_VERSION,
  getBbtiShareKits,
  resolveBbtiShareLockerRoom,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-share-kits.ts"));

const shareKitsComponent = read("src/components/BbtiShareKits.tsx");
const shareKitsData = read("src/data/bbti-share-kits.ts");
const visualFixtures = read("scripts/render-bbti-visual-qa-fixtures.mjs");
const factRules = read("docs/BBTI_FACT_RULES.md");
const visualQa = read("docs/BBTI_VISUAL_QA.md");
const roadmap = read("docs/BBTI_ADD_FILES_ROADMAP.md");

assertEqual("share locker room version", BBTI_SHARE_LOCKER_ROOM_VERSION, "bbti-share-kit-locker-room-v1");
assertEqual(
  "share locker room boundary",
  BBTI_SHARE_LOCKER_ROOM_BOUNDARY,
  "本地分享更衣室，只把当前结果、双人复赛入口和开庭案由分流，不代表真实用户行为、热度或外部来源。",
);

if (typeof resolveBbtiShareLockerRoom !== "function") {
  addError("resolveBbtiShareLockerRoom must be exported");
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

function validateLockerRoom(label, lockerRoom, expectedKitIds, expectedLinkKinds) {
  assertTruthy(`${label} locker room`, lockerRoom);
  assertEqual(`${label} version`, lockerRoom?.version, BBTI_SHARE_LOCKER_ROOM_VERSION);
  assertEqual(`${label} boundary`, lockerRoom?.boundary, BBTI_SHARE_LOCKER_ROOM_BOUNDARY);
  assertEqual(`${label} code`, lockerRoom?.code, "OAIL");
  assertEqual(`${label} row count`, lockerRoom?.rowCount, 3);
  assertEqual(`${label} row ids`, lockerRoom?.rows.map((row) => row.id).join(","), "result-door,rematch-door,case-door");
  assertEqual(`${label} row targets`, lockerRoom?.rows.map((row) => row.target).join(","), "result,duo,challenge");
  assertEqual(`${label} source kits`, lockerRoom?.rows.map((row) => row.sourceKitId).join(","), expectedKitIds);
  assertEqual(`${label} link kinds`, lockerRoom?.rows.map((row) => row.linkKind).join(","), expectedLinkKinds);
  assertIncludes(`${label} copy`, lockerRoom?.copyText, "BBTI 分享更衣室");
  assertIncludes(`${label} copy code`, lockerRoom?.copyText, "类型：OAIL");
  assertIncludes(`${label} copy boundary`, lockerRoom?.copyText, BBTI_SHARE_LOCKER_ROOM_BOUNDARY);

  const copySurface = [
    lockerRoom?.copyText,
    ...(lockerRoom?.rows ?? []).flatMap((row) => [row.id, row.target, row.label, row.title, row.body]),
  ].join("\n");
  for (const term of FORBIDDEN_COPY_TERMS) {
    assertNotIncludes(`${label} copy surface`, copySurface, term);
  }
}

if (typeof resolveBbtiShareLockerRoom === "function" && typeof getBbtiShareKits === "function") {
  const ordinaryKits = getBbtiShareKits(baseInput);
  const eventKits = getBbtiShareKits(eventInput);
  const ordinaryLockerRoom = resolveBbtiShareLockerRoom({ code: baseInput.code, kits: ordinaryKits });
  const eventLockerRoom = resolveBbtiShareLockerRoom({ code: eventInput.code, kits: eventKits });

  assertEqual("ordinary kit count", ordinaryKits.length, 5);
  assertEqual("event kit count", eventKits.length, 6);
  validateLockerRoom("ordinary", ordinaryLockerRoom, "scoreboard,duo-invite,challenge", "result,compare-invite,challenge");
  validateLockerRoom("event", eventLockerRoom, "scoreboard,duo-invite,arena-event", "result,compare-invite,event-challenge");
  assertEqual("empty kit locker room", resolveBbtiShareLockerRoom({ code: "OAIL", kits: [] }), null);
}

[
  'BBTI_SHARE_LOCKER_ROOM_VERSION = "bbti-share-kit-locker-room-v1"',
  "BBTI_SHARE_LOCKER_ROOM_BOUNDARY",
  "resolveBbtiShareLockerRoom",
  '"result-door"',
  '"rematch-door"',
  '"case-door"',
  '"result"',
  '"duo"',
  '"challenge"',
].forEach((expected) => assertIncludes("share locker room data contract", shareKitsData, expected));

[
  'data-testid="bbti-share-locker-room"',
  "data-bbti-share-locker-room-version={lockerRoom.version}",
  "data-bbti-share-locker-room-code={lockerRoom.code}",
  "data-bbti-share-locker-room-count={lockerRoom.rowCount}",
  'data-testid="bbti-share-locker-room-row"',
  "data-bbti-share-locker-room-row={row.id}",
  "data-bbti-share-locker-room-target={row.target}",
  "data-bbti-share-locker-room-kit={row.sourceKitId}",
  "data-bbti-share-locker-room-link-kind={row.linkKind}",
  "data-bbti-share-locker-room-position={index + 1}",
  'data-testid="bbti-share-locker-room-action"',
  'data-bbti-share-locker-room-action="copy-locker-room"',
  'data-bbti-share-locker-room-action="copy-route"',
  'data-testid="bbti-share-locker-room-boundary"',
].forEach((expected) => assertIncludes("share locker room UI contract", shareKitsComponent, expected));

[
  'id: "share-kit-locker-room"',
  '[data-testid="bbti-share-locker-room"]',
  'data-bbti-share-locker-room-version="bbti-share-kit-locker-room-v1"',
  'data-bbti-share-locker-room-count="3"',
  'data-bbti-share-locker-room-row="result-door"',
  'data-bbti-share-locker-room-row="rematch-door"',
  'data-bbti-share-locker-room-row="case-door"',
  'data-bbti-share-locker-room-target="result"',
  'data-bbti-share-locker-room-target="duo"',
  'data-bbti-share-locker-room-target="challenge"',
].forEach((expected) => assertIncludes("visual QA share locker room coverage", visualFixtures, expected));

assertIncludes("fact rules share locker room boundary", factRules, "Share Kit Locker Room Boundary");
assertIncludes("fact rules share locker room boundary", factRules, "bbti-share-kit-locker-room-v1");
assertIncludes("visual QA share locker room docs", visualQa, "Share Kit Locker Room checks");
assertIncludes("roadmap share locker room shipped", roadmap, "Share Kit Locker Room");
assertIncludes("roadmap validation baseline", roadmap, "npm run validate:bbti-share-kit-locker-room");

if (errors.length) {
  console.error("BBTI share kit locker room validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI share kit locker room validation");
console.log(`- contract: ${BBTI_SHARE_LOCKER_ROOM_VERSION}`);
console.log("- rows: result-door, rematch-door, case-door");
console.log("- sources: result link + compare invite + challenge/event challenge");
console.log("OK: share locker room stays local, basketball-native, short-link only, and selector-backed.");
