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
  "官方",
  "官方认证",
  "公认第一",
  "唯一",
  "碾压",
];
const HEAT_TERMS = [
  "真实热度",
  "实时热度",
  "全网",
  "用户投票",
  "播放量",
  "热搜",
  "多数球迷",
  "大家都选",
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

function assertIds(label, actions, expectedIds) {
  const actualIds = actions.map((action) => action.id);
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    addError(`${label}: expected ${expectedIds.join(", ")}, got ${actualIds.join(", ")}`);
  }
}

function assertQaKeys(label, actions, expectedQaKeys) {
  const actualQaKeys = actions.map((action) => action.qaKey);
  if (JSON.stringify(actualQaKeys) !== JSON.stringify(expectedQaKeys)) {
    addError(`${label}: expected ${expectedQaKeys.join(", ")}, got ${actualQaKeys.join(", ")}`);
  }
}

function assertEqual(label, actual, expected) {
  if (actual !== expected) {
    addError(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertTruthy(label, value) {
  if (!value) addError(`${label}: expected a non-empty value`);
}

function assertIncludes(label, value, expected) {
  if (!String(value ?? "").includes(expected)) {
    addError(`${label}: expected ${JSON.stringify(value)} to include ${JSON.stringify(expected)}`);
  }
}

function assertNotIncludes(label, value, forbidden) {
  if (String(value ?? "").includes(forbidden)) {
    addError(`${label}: expected ${JSON.stringify(value)} not to include ${JSON.stringify(forbidden)}`);
  }
}

function actionText(action) {
  return [
    action?.eyebrow,
    action?.title,
    action?.body,
    action?.buttonLabel,
    action?.secondaryButtonLabel,
    action?.qaKey,
  ].filter(Boolean).join("\n");
}

function assertCopyBoundaries(label, action) {
  const text = actionText(action);

  for (const term of FORBIDDEN_COPY_TERMS) {
    assertNotIncludes(`${label} forbidden copy term`, text, term);
  }

  for (const term of HEAT_TERMS) {
    if (
      text.includes(term)
      && !text.includes("不代表")
      && !text.includes("本地模拟")
    ) {
      addError(`${label}: heat term "${term}" must carry an explicit local/non-real boundary`);
    }
  }
}

function assertAction(label, action, expected) {
  assertTruthy(`${label} action`, action);
  if (!action) return;

  if (expected.id) assertEqual(`${label} id`, action.id, expected.id);
  if (expected.qaKey) assertEqual(`${label} qaKey`, action.qaKey, expected.qaKey);

  const text = actionText(action);
  for (const item of expected.includes ?? []) {
    assertIncludes(`${label} copy`, text, item);
  }
  for (const item of expected.notIncludes ?? []) {
    assertNotIncludes(`${label} copy`, text, item);
  }
  assertCopyBoundaries(label, action);
}

const {
  resolveBbtiNextPlayActions,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-next-play.ts"));

if (typeof resolveBbtiNextPlayActions !== "function") {
  addError("resolveBbtiNextPlayActions must be exported");
}

if (typeof resolveBbtiNextPlayActions === "function") {
  const fullStack = resolveBbtiNextPlayActions({
    dailyEvent: {
      tag: "Game 7",
      title: "抢七最后 90 秒",
    },
    hasFilmRoomClips: true,
    incomingReturn: {
      source: "film-room",
      title: "Q12 · 科比 vs 乔丹",
    },
    pendingCompare: {
      code: "DAIR",
      name: "禁区冷血法医",
    },
    primaryChallengeTitle: "科比 vs 乔丹",
  });

  assertIds("full stack action priority", fullStack, [
    "pending-compare",
    "incoming-return",
    "daily-event",
  ]);
  assertQaKeys("full stack qa priority", fullStack, [
    "pending-compare",
    "incoming-film-room",
    "daily-event",
  ]);
  assertTruthy("pending compare secondary action", fullStack[0]?.secondaryButtonLabel);
  assertAction("pending compare action", fullStack[0], {
    id: "pending-compare",
    qaKey: "pending-compare",
    includes: ["DAIR", "禁区冷血法医", "生成双人球脑报告"],
    notIncludes: ["clip", "event", "全网", "热搜"],
  });
  fullStack.forEach((action) => assertCopyBoundaries(`full stack ${action.id}`, action));

  const noInbound = resolveBbtiNextPlayActions({
    dailyEvent: {
      tag: "Game 7",
      title: "抢七最后 90 秒",
    },
    hasFilmRoomClips: true,
    primaryChallengeTitle: "科比 vs 乔丹",
  });

  assertIds("normal result priority", noInbound, [
    "daily-event",
    "primary-challenge",
    "film-room",
  ]);
  assertQaKeys("normal result qa priority", noInbound, [
    "daily-event",
    "primary-challenge",
    "film-room",
  ]);

  const lightweight = resolveBbtiNextPlayActions({
    hasFilmRoomClips: false,
    primaryChallengeTitle: "魔术师 vs 大鸟",
  });

  assertIds("lightweight result fallback", lightweight, [
    "primary-challenge",
    "share",
  ]);
  assertQaKeys("lightweight result qa fallback", lightweight, [
    "primary-challenge",
    "share",
  ]);
  lightweight.forEach((action) => assertCopyBoundaries(`lightweight ${action.id}`, action));

  const filmRoomReturn = resolveBbtiNextPlayActions({
    hasFilmRoomClips: true,
    incomingReturn: {
      source: "film-room",
      title: "Q12 · 科比 vs 乔丹",
    },
    primaryChallengeTitle: "科比 vs 乔丹",
  });

  assertIds("film-room return priority", filmRoomReturn, [
    "incoming-return",
    "primary-challenge",
    "film-room",
  ]);
  assertAction("film-room return action", filmRoomReturn[0], {
    id: "incoming-return",
    qaKey: "incoming-film-room",
    includes: ["INBOUND CLIP", "录像室案由", "录像室证据", "直接选边"],
    notIncludes: ["Q-level", "赛后约战", "事件压力题", "真实热度"],
  });

  const arenaReturn = resolveBbtiNextPlayActions({
    dailyEvent: {
      tag: "Game 7",
      title: "抢七最后 90 秒",
    },
    hasFilmRoomClips: true,
    incomingReturn: {
      source: "arena-event",
      title: "Game 7 · 勒布朗 vs 乔丹",
    },
    primaryChallengeTitle: "勒布朗 vs 乔丹",
  });

  assertIds("arena-event return priority", arenaReturn, [
    "incoming-return",
    "daily-event",
    "primary-challenge",
  ]);
  assertAction("arena-event return action", arenaReturn[0], {
    id: "incoming-return",
    qaKey: "incoming-arena-event",
    includes: ["ARENA RETURN", "情境加赛", "事件压力题"],
    notIncludes: ["Q-level", "赛后约战", "真实热度", "用户投票"],
  });

  const resultReturn = resolveBbtiNextPlayActions({
    hasFilmRoomClips: false,
    incomingReturn: {
      source: "result",
      title: "科比 vs 乔丹",
    },
    primaryChallengeTitle: "科比 vs 乔丹",
  });

  assertIds("result return priority", resultReturn, [
    "incoming-return",
    "primary-challenge",
    "share",
  ]);
  assertAction("result return action", resultReturn[0], {
    id: "incoming-return",
    qaKey: "incoming-result",
    includes: ["CHALLENGE LINK", "赛后约战", "球探报告"],
    notIncludes: ["Q-level", "事件压力题", "clip", "event"],
  });
}

if (errors.length) {
  console.error("BBTI Next Play validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI Next Play validation");
console.log("- resolver priority cases: 6");
console.log(`- forbidden copy terms: ${FORBIDDEN_COPY_TERMS.length}`);
console.log(`- heat boundary terms: ${HEAT_TERMS.length}`);
console.log("OK: Next Play actions stay action-first, source-aware, and boundary-safe.");
