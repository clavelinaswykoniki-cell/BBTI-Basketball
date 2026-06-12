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
const ALLOWED_TARGETS = new Set([
  "bbti-scouting",
  "bbti-film-room",
  "bbti-arena-events",
  "bbti-challenges",
  "bbti-share",
]);
const ALLOWED_STAGES = new Set(["next", "shipped"]);
const SHIPPED_IDS = new Set([
  "duo-chemistry",
  "film-room-quality",
  "rivalry-scripts",
  "share-card-export",
  "compare-report-polish",
  "answer-poll-trend",
  "case-postgame-recap",
  "return-streaks",
  "case-postgame-replay-index",
  "daily-return-remix",
  "battle-replay-lens",
  "visual-regression-pack",
  "arena-event-bracket",
  "replay-copy-kit",
  "case-battle-mobile-polish",
  "share-route-scoreboard",
  "duo-rematch-prompts",
  "film-room-remix-bench",
  "challenge-replay-seeds",
  "share-kit-locker-room",
  "result-scouting-refresh",
  "result-scouting-copy-kit",
  "challenge-lane-scoreboard",
  "share-return-lane-check",
]);
const FORBIDDEN_VISIBLE_TERMS = [
  "VAR",
  "点球",
  "德比",
  "FUT",
  "足球",
  "官方",
  "官方认证",
  "公认第一",
  "唯一",
  "碾压",
  "真实热度",
  "实时热度",
  "全网",
  "用户投票",
  "播放量",
  "热搜",
  "多数球迷",
  "大家都选",
  "Add Files",
  "QA",
  "selector",
  "Q-level",
  "sourceId",
  "sourceVersion",
  "caseVersion",
  "CLAUDE",
  "validator",
  "npm run",
];

function resolveRuntimeModule(fromPath, request) {
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

function addError(message) {
  errors.push(message);
}

function assertEqual(label, actual, expected) {
  if (actual !== expected) {
    addError(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertTruthy(label, value) {
  if (!value) addError(`${label}: expected a non-empty value`);
}

function assertOrdered(label, items) {
  const priorities = items.map((item) => item.priority);
  const sorted = [...priorities].sort((a, b) => b - a);
  if (JSON.stringify(priorities) !== JSON.stringify(sorted)) {
    addError(`${label}: priorities must be descending, got ${priorities.join(",")}`);
  }
}

function visibleText(suggestion) {
  return [
    suggestion.tag,
    suggestion.title,
    suggestion.body,
    suggestion.ctaLabel,
    suggestion.acceptance,
  ].join("\n");
}

function assertVisibleBoundaries(label, suggestion) {
  const text = visibleText(suggestion);
  for (const term of FORBIDDEN_VISIBLE_TERMS) {
    if (text.includes(term)) {
      addError(`${label}: visible copy must not include ${JSON.stringify(term)}`);
    }
  }
}

function assertSuggestion(label, suggestion) {
  assertTruthy(`${label} id`, suggestion.id);
  assertTruthy(`${label} qaKey`, suggestion.qaKey);
  assertEqual(`${label} contractVersion`, suggestion.contractVersion, "bbti-add-files-v1");
  if (!ALLOWED_STAGES.has(suggestion.stage)) {
    addError(`${label}: invalid stage ${JSON.stringify(suggestion.stage)}`);
  }
  if (SHIPPED_IDS.has(suggestion.id) && suggestion.stage !== "shipped") {
    addError(`${label}: shipped suggestion ${suggestion.id} must have stage "shipped"`);
  }
  if (!SHIPPED_IDS.has(suggestion.id) && suggestion.stage !== "next") {
    addError(`${label}: active suggestion ${suggestion.id} must have stage "next"`);
  }
  if (!ALLOWED_TARGETS.has(suggestion.targetSectionId)) {
    addError(`${label}: invalid targetSectionId ${JSON.stringify(suggestion.targetSectionId)}`);
  }
  if (!Array.isArray(suggestion.targetFiles) || suggestion.targetFiles.length === 0) {
    addError(`${label}: targetFiles must be non-empty`);
  }
  if (!Array.isArray(suggestion.validators) || suggestion.validators.length === 0) {
    addError(`${label}: validators must be non-empty`);
  }
  assertVisibleBoundaries(label, suggestion);
}

const {
  BBTI_ADD_FILES_CONTRACT_VERSION,
  BBTI_SHIPPED_ADD_FILES_IDS,
  buildBbtiAddFilesSuggestionCopy,
  resolveBbtiAddFilesSuggestions,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-add-files-suggestions.ts"));

assertEqual("contract version export", BBTI_ADD_FILES_CONTRACT_VERSION, "bbti-add-files-v1");
assertEqual("shipped id count", BBTI_SHIPPED_ADD_FILES_IDS?.length, SHIPPED_IDS.size);
for (const id of BBTI_SHIPPED_ADD_FILES_IDS ?? []) {
  if (!SHIPPED_IDS.has(id)) addError(`unexpected shipped id export ${JSON.stringify(id)}`);
}

if (typeof resolveBbtiAddFilesSuggestions !== "function") {
  addError("resolveBbtiAddFilesSuggestions must be exported");
}
if (typeof buildBbtiAddFilesSuggestionCopy !== "function") {
  addError("buildBbtiAddFilesSuggestionCopy must be exported");
}

if (typeof resolveBbtiAddFilesSuggestions === "function") {
  const fullContext = resolveBbtiAddFilesSuggestions({
    code: "OAIL",
    hasFilmRoomClips: true,
    hasPendingCompare: true,
    primaryChallengeTitle: "Kobe vs Jordan",
  });
  const normalContext = resolveBbtiAddFilesSuggestions({
    code: "DATR",
    hasFilmRoomClips: true,
    hasPendingCompare: false,
    primaryChallengeTitle: "LeBron vs Jordan",
  });
  const lightweightContext = resolveBbtiAddFilesSuggestions({
    code: "DATR",
    hasFilmRoomClips: false,
    hasPendingCompare: false,
  });

  assertEqual("full context suggestion count", fullContext.length, 3);
  assertEqual("normal context suggestion count", normalContext.length, 3);
  assertEqual("lightweight context suggestion count", lightweightContext.length, 3);
  assertOrdered("full context", fullContext);
  assertOrdered("normal context", normalContext);
  assertOrdered("lightweight context", lightweightContext);
  assertEqual("full context first id", fullContext[0]?.id, "challenge-pick-replay-kit");
  assertEqual("full context second id", fullContext[1]?.id, "share-target-mobile-polish");
  assertEqual("full context third id", fullContext[2]?.id, "scouting-lane-compare-bridge");
  assertEqual("normal context first id", normalContext[0]?.id, "challenge-pick-replay-kit");
  assertEqual("normal context second id", normalContext[1]?.id, "share-target-mobile-polish");
  assertEqual("normal context third id", normalContext[2]?.id, "scouting-lane-compare-bridge");
  assertEqual("lightweight context first id", lightweightContext[0]?.id, "challenge-pick-replay-kit");
  assertEqual("lightweight context second id", lightweightContext[1]?.id, "share-target-mobile-polish");
  assertEqual("lightweight context third id", lightweightContext[2]?.id, "scouting-lane-compare-bridge");
  for (const [label, suggestions] of [
    ["full context", fullContext],
    ["normal context", normalContext],
    ["lightweight context", lightweightContext],
  ]) {
    if (suggestions.some((item) => item.stage !== "next")) {
      addError(`${label}: top suggestions must all be next-stage, got ${suggestions.map((item) => `${item.id}:${item.stage}`).join(",")}`);
    }
    if (suggestions.some((item) => SHIPPED_IDS.has(item.id))) {
      addError(`${label}: shipped suggestions must be demoted out of top 3, got ${suggestions.map((item) => item.id).join(",")}`);
    }
  }

  for (const [label, suggestions] of [
    ["full context", fullContext],
    ["normal context", normalContext],
    ["lightweight context", lightweightContext],
  ]) {
    const ids = suggestions.map((item) => item.id);
    const qaKeys = suggestions.map((item) => item.qaKey);
    if (new Set(ids).size !== ids.length) addError(`${label}: duplicate ids ${ids.join(",")}`);
    if (new Set(qaKeys).size !== qaKeys.length) addError(`${label}: duplicate qaKeys ${qaKeys.join(",")}`);
    suggestions.forEach((suggestion, index) => assertSuggestion(`${label} suggestion ${index + 1}`, suggestion));
  }

  if (typeof buildBbtiAddFilesSuggestionCopy === "function") {
    const payload = buildBbtiAddFilesSuggestionCopy({
      code: "OAIL",
      suggestion: fullContext[0],
      typeName: "空间捕食者",
    });
    for (const expected of [
      "BBTI 下次加练单",
      "类型：OAIL 空间捕食者",
      "建议文件：",
      "验证：",
    ]) {
      if (!payload.includes(expected)) {
        addError(`copy payload: missing ${JSON.stringify(expected)}`);
      }
    }
  }
}

if (errors.length) {
  console.error("BBTI Add Files suggestion validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI Add Files suggestion validation");
console.log("- resolver contexts: 3");
console.log(`- allowed targets: ${ALLOWED_TARGETS.size}`);
console.log(`- shipped suggestions demoted: ${SHIPPED_IDS.size}`);
console.log(`- forbidden visible terms: ${FORBIDDEN_VISIBLE_TERMS.length}`);
console.log("OK: Add Files suggestions stay basketball-native, actionable, and validator-backed.");
