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
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
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
  BBTI_SHARE_RETURN_LANE_CHECK_BOUNDARY,
  BBTI_SHARE_RETURN_LANE_CHECK_VERSION,
  getBbtiShareKits,
  resolveBbtiShareReturnLaneCheck,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-share-kits.ts"));

const shareKitsComponent = read("src/components/BbtiShareKits.tsx");
const shareKitsData = read("src/data/bbti-share-kits.ts");
const visualFixtures = read("scripts/render-bbti-visual-qa-fixtures.mjs");
const factRules = read("docs/BBTI_FACT_RULES.md");
const visualQa = read("docs/BBTI_VISUAL_QA.md");
const roadmap = read("docs/BBTI_ADD_FILES_ROADMAP.md");
const packageJson = read("package.json");
const addFilesData = read("src/data/bbti-add-files-suggestions.ts");
const addFilesValidator = read("scripts/validate-bbti-add-files-suggestions.mjs");

assertEqual("share return lane check version", BBTI_SHARE_RETURN_LANE_CHECK_VERSION, "bbti-share-return-lane-check-v1");
assertEqual(
  "share return lane check boundary",
  BBTI_SHARE_RETURN_LANE_CHECK_BOUNDARY,
  "本地分享回流体检，只检查当前短链接会回到结果、双人对比、开庭案由或事件案由，不代表真实点击、活跃或用户行为。",
);

if (typeof resolveBbtiShareReturnLaneCheck !== "function") {
  addError("resolveBbtiShareReturnLaneCheck must be exported");
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

function validateLaneCheck(label, laneCheck, expectedStatuses, expectedKitIds, expectedLinkKinds) {
  assertTruthy(`${label} lane check`, laneCheck);
  assertEqual(`${label} version`, laneCheck?.version, BBTI_SHARE_RETURN_LANE_CHECK_VERSION);
  assertEqual(`${label} boundary`, laneCheck?.boundary, BBTI_SHARE_RETURN_LANE_CHECK_BOUNDARY);
  assertEqual(`${label} code`, laneCheck?.code, "OAIL");
  assertEqual(`${label} row count`, laneCheck?.rowCount, 4);
  assertEqual(`${label} row ids`, laneCheck?.rows.map((row) => row.id), [
    "result-return",
    "duo-return",
    "challenge-return",
    "event-return",
  ]);
  assertEqual(`${label} row targets`, laneCheck?.rows.map((row) => row.target), [
    "result",
    "duo",
    "challenge",
    "event-challenge",
  ]);
  assertEqual(`${label} row statuses`, laneCheck?.rows.map((row) => row.status), expectedStatuses);
  assertEqual(`${label} source kits`, laneCheck?.rows.map((row) => row.sourceKitId), expectedKitIds);
  assertEqual(`${label} link kinds`, laneCheck?.rows.map((row) => row.linkKind), expectedLinkKinds);
  assertIncludes(`${label} copy`, laneCheck?.copyText, "BBTI 分享回流体检");
  assertIncludes(`${label} copy code`, laneCheck?.copyText, "类型：OAIL");
  assertIncludes(`${label} copy boundary`, laneCheck?.copyText, BBTI_SHARE_RETURN_LANE_CHECK_BOUNDARY);

  const copySurface = [
    laneCheck?.copyText,
    ...(laneCheck?.rows ?? []).flatMap((row) => [
      row.id,
      row.target,
      row.status,
      row.label,
      row.title,
      row.body,
    ]),
  ].join("\n");
  for (const term of FORBIDDEN_COPY_TERMS) {
    assertNotIncludes(`${label} copy surface`, copySurface, term);
  }
}

if (typeof resolveBbtiShareReturnLaneCheck === "function" && typeof getBbtiShareKits === "function") {
  const ordinaryKits = getBbtiShareKits(baseInput);
  const eventKits = getBbtiShareKits(eventInput);
  const ordinaryLaneCheck = resolveBbtiShareReturnLaneCheck({ code: baseInput.code, kits: ordinaryKits });
  const eventLaneCheck = resolveBbtiShareReturnLaneCheck({ code: eventInput.code, kits: eventKits });

  assertEqual("ordinary kit count", ordinaryKits.length, 5);
  assertEqual("event kit count", eventKits.length, 6);
  validateLaneCheck(
    "ordinary",
    ordinaryLaneCheck,
    ["ready", "ready", "ready", "fallback"],
    ["scoreboard", "duo-invite", "challenge", "none"],
    ["result", "compare-invite", "challenge", "none"],
  );
  validateLaneCheck(
    "event",
    eventLaneCheck,
    ["ready", "ready", "ready", "ready"],
    ["scoreboard", "duo-invite", "challenge", "arena-event"],
    ["result", "compare-invite", "challenge", "event-challenge"],
  );
  assertEqual("empty kit lane check", resolveBbtiShareReturnLaneCheck({ code: "OAIL", kits: [] }), null);
}

[
  'BBTI_SHARE_RETURN_LANE_CHECK_VERSION = "bbti-share-return-lane-check-v1"',
  "BBTI_SHARE_RETURN_LANE_CHECK_BOUNDARY",
  "resolveBbtiShareReturnLaneCheck",
  '"result-return"',
  '"duo-return"',
  '"challenge-return"',
  '"event-return"',
  '"ready"',
  '"fallback"',
].forEach((expected) => assertIncludes("share return lane check data contract", shareKitsData, expected));

[
  'data-testid="bbti-share-return-lane-check"',
  "data-bbti-share-return-lane-check-version={returnLaneCheck.version}",
  "data-bbti-share-return-lane-check-code={returnLaneCheck.code}",
  "data-bbti-share-return-lane-check-count={returnLaneCheck.rowCount}",
  'data-testid="bbti-share-return-lane-check-row"',
  "data-bbti-share-return-lane-check-row={row.id}",
  "data-bbti-share-return-lane-check-target={row.target}",
  "data-bbti-share-return-lane-check-status={row.status}",
  "data-bbti-share-return-lane-check-kit={row.sourceKitId}",
  "data-bbti-share-return-lane-check-link-kind={row.linkKind}",
  "data-bbti-share-return-lane-check-position={index + 1}",
  'data-testid="bbti-share-return-lane-check-action"',
  'data-bbti-share-return-lane-check-action="copy-check"',
  'data-bbti-share-return-lane-check-action="copy-lane"',
  'data-testid="bbti-share-return-lane-check-boundary"',
].forEach((expected) => assertIncludes("share return lane check UI contract", shareKitsComponent, expected));

[
  'id: "share-return-lane-check"',
  '[data-testid="bbti-share-return-lane-check"]',
  'data-bbti-share-return-lane-check-version="bbti-share-return-lane-check-v1"',
  'data-bbti-share-return-lane-check-count="4"',
  'data-bbti-share-return-lane-check-row="result-return"',
  'data-bbti-share-return-lane-check-row="duo-return"',
  'data-bbti-share-return-lane-check-row="challenge-return"',
  'data-bbti-share-return-lane-check-row="event-return"',
].forEach((expected) => assertIncludes("visual QA share return lane coverage", visualFixtures, expected));

assertIncludes("package script", packageJson, '"validate:bbti-share-return-lane-check"');
assertIncludes("Add Files shipped id", addFilesData, '"share-return-lane-check"');
assertIncludes("Add Files validator shipped id", addFilesValidator, '"share-return-lane-check"');
assertIncludes("fact rules share return lane boundary", factRules, "Share Return Lane Check Boundary");
assertIncludes("fact rules share return lane boundary", factRules, "bbti-share-return-lane-check-v1");
assertIncludes("visual QA share return lane docs", visualQa, "Share Return Lane Check checks");
assertIncludes("roadmap share return lane shipped", roadmap, "Share Return Lane Check");
assertIncludes("roadmap validation baseline", roadmap, "npm run validate:bbti-share-return-lane-check");

if (errors.length) {
  console.error("BBTI share return lane check validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI share return lane check validation");
console.log(`- contract: ${BBTI_SHARE_RETURN_LANE_CHECK_VERSION}`);
console.log("- rows: result-return, duo-return, challenge-return, event-return");
console.log("- source: current Share Kit short links only");
console.log("OK: share return lane check stays local, basketball-native, short-link only, and selector-backed.");
