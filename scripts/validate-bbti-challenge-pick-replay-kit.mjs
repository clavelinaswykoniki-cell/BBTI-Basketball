#!/usr/bin/env node
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const nodeRequire = createRequire(path.join(ROOT, "package.json"));
const runtimeModuleCache = new Map();
const errors = [];
const EXPECTED_BBTI_CODES = ["O", "D"].flatMap((style) =>
  ["A", "E"].flatMap((evidence) =>
    ["I", "T"].flatMap((role) => ["L", "R"].map((ambition) => `${style}${evidence}${role}${ambition}`)),
  ),
);
const EXPECTED_PICK_ROW_IDS = ["case-lock", "pressure-check", "first-possession"];
const EXPECTED_PICK_TARGETS = ["case", "pressure", "tipoff"];
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
  "sourceId",
  "sourceVersion",
  "caseVersion",
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
      path.join(basePath, "index.tsx"),
      path.join(basePath, "index.js"),
    ];

    return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
  }

  if (request.startsWith(".")) {
    const basePath = path.resolve(path.dirname(fromPath), request);
    const candidates = [
      basePath,
      `${basePath}.ts`,
      `${basePath}.tsx`,
      `${basePath}.js`,
      path.join(basePath, "index.ts"),
      path.join(basePath, "index.tsx"),
      path.join(basePath, "index.js"),
    ];

    return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
  }

  return null;
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
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.Node10,
      target: ts.ScriptTarget.ES2020,
      verbatimModuleSyntax: false,
    },
    fileName: absolutePath,
  });

  const localRequire = (request) => {
    const runtimePath = resolveRuntimeModule(absolutePath, request);
    return runtimePath ? loadRuntimeTsModule(runtimePath) : nodeRequire(request);
  };

  const wrapper = new Function("require", "module", "exports", "__filename", "__dirname", compiled.outputText);
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

function assertIncludes(label, source, expected) {
  if (!source.includes(expected)) {
    addError(`${label}: missing ${JSON.stringify(expected)}`);
  }
}

function assertNotIncludes(label, source, forbidden) {
  if (source.includes(forbidden)) {
    addError(`${label}: must not include ${JSON.stringify(forbidden)}`);
  }
}

function assertTruthy(label, value) {
  if (!value) addError(`${label}: expected a non-empty value`);
}

const {
  BBTI_CHALLENGE_PICK_REPLAY_KIT_BOUNDARY,
  BBTI_CHALLENGE_PICK_REPLAY_KIT_VERSION,
  resolveBbtiChallengePickReplayKit,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-challenge-replay-seeds.ts"));
const { getBbtiChallengeMatchups, resolveBbtiChallengeLaneScoreboard } = loadRuntimeTsModule(
  path.join(ROOT, "src/data/bbti-challenges.ts"),
);

const challengeData = read("src/data/bbti-challenge-replay-seeds.ts");
const receiptBoardComponent = read("src/components/BbtiChallengeReceiptBoard.tsx");
const pickReplayKitComponent = read("src/components/BbtiChallengePickReplayKit.tsx");
const addFilesData = read("src/data/bbti-add-files-suggestions.ts");
const packageJson = read("package.json");
const qaSelectors = read("scripts/validate-bbti-qa-selectors.mjs");
const visualFixtures = read("scripts/render-bbti-visual-qa-fixtures.mjs");
const visualRegPack = read("scripts/validate-bbti-visual-regression-pack.mjs");
const factRules = read("docs/BBTI_FACT_RULES.md");
const visualQa = read("docs/BBTI_VISUAL_QA.md");

assertEqual(
  "challenge pick replay kit version",
  BBTI_CHALLENGE_PICK_REPLAY_KIT_VERSION,
  "bbti-challenge-pick-replay-kit-v1",
);
assertEqual(
  "challenge pick replay kit boundary",
  BBTI_CHALLENGE_PICK_REPLAY_KIT_BOUNDARY,
  "本地选边回看卡，只复用当前 BBTI 推荐对线、路线板、案由、压力题和开庭种子，不代表真实赛程、热度、外部来源或用户行为。",
);

if (typeof resolveBbtiChallengeLaneScoreboard !== "function") {
  addError("resolveBbtiChallengeLaneScoreboard must be exported");
}
if (typeof resolveBbtiChallengePickReplayKit !== "function") {
  addError("resolveBbtiChallengePickReplayKit must be exported");
}

if (typeof getBbtiChallengeMatchups === "function" && typeof resolveBbtiChallengeLaneScoreboard === "function") {
  for (const code of EXPECTED_BBTI_CODES) {
    const matchups = getBbtiChallengeMatchups(code);
    const scoreboard = resolveBbtiChallengeLaneScoreboard({ code, challengeMatchups: matchups });
    const pickReplayKit = resolveBbtiChallengePickReplayKit(scoreboard);

    assertEqual(`${code} lane scoreboard rows`, scoreboard.rows.length, 3);
    assertEqual(`${code} pick item count`, pickReplayKit.itemCount, 3);
    assertEqual(`${code} pick version`, pickReplayKit.version, BBTI_CHALLENGE_PICK_REPLAY_KIT_VERSION);
    assertEqual(`${code} pick boundary`, pickReplayKit.boundary, BBTI_CHALLENGE_PICK_REPLAY_KIT_BOUNDARY);
    assertEqual(`${code} pick source code`, pickReplayKit.code, code);
    assertEqual(`${code} pick source lane scoreboard version`, pickReplayKit.sourceLaneScoreboardVersion, scoreboard.version);
    assertEqual(`${code} pick item ids`, pickReplayKit.items.map((item) => item.id), EXPECTED_PICK_ROW_IDS);
    assertEqual(`${code} pick targets`, pickReplayKit.items.map((item) => item.target), EXPECTED_PICK_TARGETS);

    for (const [index, item] of pickReplayKit.items.entries()) {
      const expectedLane = scoreboard.rows[index];
      assertEqual(`${code} ${item.id} source lane`, item.sourceLaneId, expectedLane.id);
      assertEqual(`${code} ${item.id} source matchup`, item.sourceMatchupId, expectedLane.matchupId);
      assertEqual(`${code} ${item.id} source category`, item.category, expectedLane.category);
      assertTruthy(`${code} ${item.id} label`, item.label);
      assertTruthy(`${code} ${item.id} title`, item.title);
      assertTruthy(`${code} ${item.id} body`, item.body);
      assertTruthy(`${code} ${item.id} copy`, item.copyText);
      assertIncludes(`${code} ${item.id} copy`, item.copyText, BBTI_CHALLENGE_PICK_REPLAY_KIT_BOUNDARY);
      for (const term of FORBIDDEN_COPY_TERMS) {
        assertNotIncludes(`${code} ${item.id} copy`, item.copyText, term);
      }
    }

    assertIncludes(`${code} kit full copy`, pickReplayKit.copyText, BBTI_CHALLENGE_PICK_REPLAY_KIT_BOUNDARY);
    assertIncludes(`${code} kit full copy`, pickReplayKit.copyText, code);
    for (const term of FORBIDDEN_COPY_TERMS) {
      assertNotIncludes(`${code} full copy`, pickReplayKit.copyText, term);
    }
  }
}

[
  'BBTI_CHALLENGE_PICK_REPLAY_KIT_VERSION = "bbti-challenge-pick-replay-kit-v1"',
  "BBTI_CHALLENGE_PICK_REPLAY_KIT_BOUNDARY",
  "resolveBbtiChallengePickReplayKit",
  '"case-lock"',
  '"pressure-check"',
  '"first-possession"',
  '"case"',
  '"pressure"',
  '"tipoff"',
].forEach((expected) => assertIncludes("BBTI Challenge Pick Replay Kit data contract", challengeData, expected));

[
  "resolveBbtiChallengeLaneScoreboard",
  "resolveBbtiChallengePickReplayKit",
  "BbtiChallengeReceiptBoard",
  "resolveBbtiChallengePickReplayKit(laneScoreboard)",
  "BbtiChallengePickReplayKit",
  "pickReplayKit",
].forEach((expected) => assertIncludes("Challenge Pick Replay Kit UI contract", receiptBoardComponent, expected));

[
  'data-testid="bbti-challenge-pick-replay-kit"',
  "data-bbti-challenge-pick-replay-kit-version={pickReplayKit.version}",
  "data-bbti-challenge-pick-replay-kit-code={pickReplayKit.code}",
  "data-bbti-challenge-pick-replay-kit-count={pickReplayKit.itemCount}",
  'data-testid="bbti-challenge-pick-replay-kit-item"',
  "data-bbti-challenge-pick-replay-kit-item={item.id}",
  "data-bbti-challenge-pick-replay-kit-target={item.target}",
  "data-bbti-challenge-pick-replay-kit-source-lane={item.sourceLaneId}",
  "data-bbti-challenge-pick-replay-kit-matchup={item.sourceMatchupId}",
  "data-bbti-challenge-pick-replay-kit-position={index + 1}",
  'data-bbti-challenge-pick-replay-kit-action="copy-kit"',
  'data-bbti-challenge-pick-replay-kit-action="copy"',
  'data-testid="bbti-challenge-pick-replay-kit-boundary"',
].forEach((expected) => assertIncludes("BbtiChallengePickReplayKit component contract", pickReplayKitComponent, expected));

[
  'id: "challenge-pick-replay-kit"',
  '[data-testid="bbti-challenge-pick-replay-kit"]',
  'data-bbti-challenge-pick-replay-kit-version="bbti-challenge-pick-replay-kit-v1"',
  'data-bbti-challenge-pick-replay-kit-item="case-lock"',
  'data-bbti-challenge-pick-replay-kit-item="pressure-check"',
  'data-bbti-challenge-pick-replay-kit-item="first-possession"',
  'data-bbti-challenge-pick-replay-kit-target="case"',
  'data-bbti-challenge-pick-replay-kit-target="pressure"',
  'data-bbti-challenge-pick-replay-kit-target="tipoff"',
  'data-bbti-challenge-pick-replay-kit-action="copy-kit"',
  'data-bbti-challenge-pick-replay-kit-action="copy"',
  'data-testid="bbti-challenge-pick-replay-kit-boundary"',
].forEach((expected) => assertIncludes("Challenge Pick Replay Kit visual QA coverage", visualFixtures, expected));

assertIncludes("package script", packageJson, '"validate:bbti-challenge-pick-replay-kit": "node scripts/validate-bbti-challenge-pick-replay-kit.mjs"');
assertIncludes("QA selector coverage", qaSelectors, "BbtiChallengePickReplayKit");
assertIncludes("Add Files target", addFilesData, '"challenge-pick-replay-kit"');
assertIncludes("Add Files validator", addFilesData, "npm run validate:bbti-challenge-pick-replay-kit");
assertIncludes("visual QA pack risk", visualRegPack, 'assertSceneRisk(manifest, "challenge-pick-replay-kit", "source-boundary")');
assertIncludes("fact rules challenge pick boundary", factRules, "Challenge Pick Replay Kit Boundary");
assertIncludes("visual QA challenge pick checks", visualQa, "Challenge Pick Replay Kit checks");

if (errors.length) {
  console.error("BBTI challenge-pick-replay-kit validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI challenge pick replay kit validation");
console.log(`- version: ${BBTI_CHALLENGE_PICK_REPLAY_KIT_VERSION}`);
console.log(`- rows: ${EXPECTED_PICK_ROW_IDS.join(", ")}`);
console.log(`- targets: ${EXPECTED_PICK_TARGETS.join(", ")}`);
