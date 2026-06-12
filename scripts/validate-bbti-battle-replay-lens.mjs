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

function loadDataModule(relativePath) {
  return loadRuntimeTsModule(path.join(ROOT, relativePath));
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
    addError(`${label}: expected ${JSON.stringify(value)} to include ${JSON.stringify(expected)}`);
  }
}

function assertNotIncludes(label, value, forbidden) {
  if (String(value ?? "").includes(forbidden)) {
    addError(`${label}: expected ${JSON.stringify(value)} not to include ${JSON.stringify(forbidden)}`);
  }
}

function assertTruthy(label, value) {
  if (!value) addError(`${label}: expected a non-empty value`);
}

function assertCopyBoundaries(label, lens) {
  const text = [
    lens.boundary,
    lens.copyText,
    ...(lens.steps ?? []).flatMap((step) => [
      step.label,
      step.title,
      step.body,
    ]),
  ].filter(Boolean).join("\n");

  for (const term of FORBIDDEN_COPY_TERMS) {
    assertNotIncludes(`${label} forbidden copy term`, text, term);
  }
}

const {
  BBTI_BATTLE_REPLAY_COPY_KIT_BOUNDARY,
  BBTI_BATTLE_REPLAY_COPY_KIT_VERSION,
  BBTI_BATTLE_REPLAY_LENS_BOUNDARY,
  BBTI_BATTLE_REPLAY_LENS_VERSION,
  resolveBbtiBattleReplayCopyKit,
  resolveBbtiBattleReplayLens,
} = loadDataModule("src/data/bbti-battle-replay-lens.ts");
const {
  getDebatesForMatchup,
} = loadDataModule("src/data/debate-loader.ts");
const {
  getStatBombsForMatchup,
} = loadDataModule("src/data/stat-bombs.ts");
const {
  hydrateBbtiSharedChallenge,
} = loadDataModule("src/data/bbti-shared-challenge-hydration.ts");

const component = read("src/components/BbtiBattleReplayLens.tsx");
const battleArena = read("src/components/BattleArena.tsx");

assertEqual("battle replay lens version", BBTI_BATTLE_REPLAY_LENS_VERSION, "bbti-battle-replay-lens-v1");
assertEqual("battle replay lens boundary", BBTI_BATTLE_REPLAY_LENS_BOUNDARY, "本地单回合战术镜头，只是本场阅读，不代表外部结论或用户热度。");
assertEqual("battle replay copy kit version", BBTI_BATTLE_REPLAY_COPY_KIT_VERSION, "bbti-battle-replay-copy-kit-v1");
assertEqual("battle replay copy kit boundary", BBTI_BATTLE_REPLAY_COPY_KIT_BOUNDARY, "本地复盘话术包，只复用本场镜头，不代表真实赢面、外部排名或用户热度。");
if (typeof resolveBbtiBattleReplayLens !== "function") {
  addError("resolveBbtiBattleReplayLens must be exported");
}
if (typeof resolveBbtiBattleReplayCopyKit !== "function") {
  addError("resolveBbtiBattleReplayCopyKit must be exported");
}

for (const expected of [
  'data-testid="bbti-battle-replay-lens"',
  "data-bbti-battle-replay-lens-version={lens.version}",
  "data-bbti-battle-replay-lens-matchup-id={lens.matchupId}",
  "data-bbti-battle-replay-lens-topic-id={lens.topicId}",
  "data-bbti-battle-replay-lens-next-topic-id={lens.nextTopicId}",
  "data-bbti-battle-replay-lens-round={lens.roundNumber}",
  "data-bbti-battle-replay-lens-side={lens.votedSide}",
  "data-bbti-battle-replay-lens-case-source={lens.caseSource}",
  "data-bbti-battle-replay-lens-replay-source={lens.replaySource}",
  "data-bbti-battle-replay-lens-count={lens.stepCount}",
  'data-testid="bbti-battle-replay-lens-step"',
  "data-bbti-battle-replay-lens-step={step.id}",
  "data-bbti-battle-replay-lens-target={step.target}",
  "data-bbti-battle-replay-lens-position={index + 1}",
  'data-testid="bbti-battle-replay-lens-copy"',
  'data-bbti-battle-replay-lens-action="copy-lens"',
  'data-testid="bbti-battle-replay-copy-kit"',
  "data-bbti-battle-replay-copy-kit-version={copyKit.version}",
  "data-bbti-battle-replay-copy-kit-source-version={copyKit.sourceLensVersion}",
  "data-bbti-battle-replay-copy-kit-matchup-id={copyKit.matchupId}",
  "data-bbti-battle-replay-copy-kit-topic-id={copyKit.topicId}",
  "data-bbti-battle-replay-copy-kit-round={copyKit.roundNumber}",
  "data-bbti-battle-replay-copy-kit-count={copyKit.itemCount}",
  'data-testid="bbti-battle-replay-copy-kit-item"',
  "data-bbti-battle-replay-copy-kit-item={item.id}",
  "data-bbti-battle-replay-copy-kit-position={index + 1}",
  'data-bbti-battle-replay-copy-kit-action="copy"',
  'data-testid="bbti-battle-replay-copy-kit-boundary"',
  'data-testid="bbti-battle-replay-lens-boundary"',
]) {
  assertIncludes("battle replay lens UI contract", component, expected);
}

for (const expected of [
  "BbtiBattleReplayLens",
  "nextTopic={nextTopic}",
  "caseContext={bbtiChallengeCase}",
  "statBomb={statBomb}",
  "votedFor={voted}",
]) {
  assertIncludes("BattleArena replay lens mount", battleArena, expected);
}

if (typeof resolveBbtiBattleReplayLens === "function" && typeof resolveBbtiBattleReplayCopyKit === "function") {
  const { main } = getDebatesForMatchup("kobe-vs-jordan");
  const topic = main[0];
  const nextTopic = main[1];
  const statBomb = getStatBombsForMatchup("kobe-vs-jordan", topic.id)[0];
  const hydrated = hydrateBbtiSharedChallenge({
    challengeMatchupId: "kobe-vs-jordan",
    clipKey: "q12-m0",
    code: "OAIL",
  });
  const lens = resolveBbtiBattleReplayLens({
    caseContext: hydrated.caseContext,
    matchupId: "kobe-vs-jordan",
    nameA: "Kobe",
    nameB: "Jordan",
    nextTopic,
    roundNumber: 1,
    statBomb,
    topic,
    votedFor: "kobe",
  });
  const finalLens = resolveBbtiBattleReplayLens({
    caseContext: null,
    matchupId: "kobe-vs-jordan",
    nameA: "Kobe",
    nameB: "Jordan",
    nextTopic: null,
    roundNumber: 2,
    statBomb: null,
    topic: nextTopic,
    votedFor: "lebron",
  });

  assertEqual("lens version", lens.version, BBTI_BATTLE_REPLAY_LENS_VERSION);
  assertEqual("lens matchup", lens.matchupId, "kobe-vs-jordan");
  assertEqual("lens topic", lens.topicId, topic.id);
  assertEqual("lens next topic", lens.nextTopicId, nextTopic.id);
  assertEqual("lens round", lens.roundNumber, 1);
  assertEqual("lens side", lens.votedSide, "kobe");
  assertEqual("lens case source", lens.caseSource, "film-room");
  assertEqual("lens replay source", lens.replaySource, statBomb.source);
  assertEqual("lens step count", lens.stepCount, 4);
  assertEqual("lens step ids", lens.steps.map((step) => step.id).join(","), "current-claim,counter-replay,coach-cue,next-pressure");
  assertEqual("lens targets", lens.steps.map((step) => step.target).join(","), "current-topic,replay,advisor,next-topic");
  assertIncludes("lens copy", lens.copyText, "BBTI 单回合战术镜头");
  assertIncludes("lens boundary", lens.copyText, BBTI_BATTLE_REPLAY_LENS_BOUNDARY);
  assertCopyBoundaries("case lens", lens);
  const copyKit = resolveBbtiBattleReplayCopyKit(lens);
  assertEqual("copy kit version", copyKit.version, BBTI_BATTLE_REPLAY_COPY_KIT_VERSION);
  assertEqual("copy kit source version", copyKit.sourceLensVersion, BBTI_BATTLE_REPLAY_LENS_VERSION);
  assertEqual("copy kit matchup", copyKit.matchupId, lens.matchupId);
  assertEqual("copy kit topic", copyKit.topicId, lens.topicId);
  assertEqual("copy kit round", copyKit.roundNumber, lens.roundNumber);
  assertEqual("copy kit count", copyKit.itemCount, 3);
  assertEqual("copy kit item ids", copyKit.items.map((item) => item.id).join(","), "group-recap,counter-punch,next-question");
  for (const item of copyKit.items) {
    assertTruthy(`copy kit ${item.id} title`, item.title);
    assertTruthy(`copy kit ${item.id} body`, item.body);
    assertIncludes(`copy kit ${item.id} boundary`, item.copyText, BBTI_BATTLE_REPLAY_COPY_KIT_BOUNDARY);
  }
  assertCopyBoundaries("copy kit", {
    boundary: copyKit.boundary,
    copyText: copyKit.items.map((item) => item.copyText).join("\n"),
    steps: copyKit.items,
  });

  assertEqual("final lens next", finalLens.nextTopicId, "complete");
  assertEqual("final lens case source", finalLens.caseSource, "none");
  assertEqual("final lens replay source", finalLens.replaySource, "none");
  assertTruthy("final lens next pressure body", finalLens.steps.find((step) => step.id === "next-pressure")?.body);
  assertCopyBoundaries("final lens", finalLens);
}

if (errors.length) {
  console.error("BBTI battle replay lens validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI battle replay lens validation");
console.log(`- contract: ${BBTI_BATTLE_REPLAY_LENS_VERSION}`);
console.log(`- copy kit: ${BBTI_BATTLE_REPLAY_COPY_KIT_VERSION}`);
console.log("- steps: current-claim, counter-replay, coach-cue, next-pressure");
console.log("- copy items: group-recap, counter-punch, next-question");
console.log("- source: local stat bomb + courtside advisor + current/next topic + optional case context");
console.log("OK: battle replay lens stays local, basketball-native, and selector-backed.");
