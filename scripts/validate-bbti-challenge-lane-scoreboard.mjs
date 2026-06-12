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
const EXPECTED_BBTI_CODES = ["O", "D"].flatMap((style) =>
  ["A", "E"].flatMap((evidence) =>
    ["I", "T"].flatMap((role) => ["L", "R"].map((ambition) => `${style}${evidence}${role}${ambition}`)),
  ),
);
const EXPECTED_ROW_IDS = ["same-court", "counter-court", "overtime-court"];
const EXPECTED_TARGETS = ["same-temperature", "counter-judgment", "overtime"];
const EXPECTED_CATEGORIES = ["同温层局", "反向审判", "破防加赛"];
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

const {
  BBTI_CHALLENGE_LANE_SCOREBOARD_BOUNDARY,
  BBTI_CHALLENGE_LANE_SCOREBOARD_VERSION,
  getBbtiChallengeMatchups,
  resolveBbtiChallengeLaneScoreboard,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-challenges.ts"));

const challengeData = read("src/data/bbti-challenges.ts");
const challengeComponent = read("src/components/BbtiChallengeReceiptBoard.tsx");
const visualFixtures = read("scripts/render-bbti-visual-qa-fixtures.mjs");
const qaSelectors = read("scripts/validate-bbti-qa-selectors.mjs");
const packageJson = read("package.json");
const addFilesData = read("src/data/bbti-add-files-suggestions.ts");
const addFilesValidator = read("scripts/validate-bbti-add-files-suggestions.mjs");
const factRules = read("docs/BBTI_FACT_RULES.md");
const visualQa = read("docs/BBTI_VISUAL_QA.md");
const roadmap = read("docs/BBTI_ADD_FILES_ROADMAP.md");

assertEqual("challenge lane scoreboard version", BBTI_CHALLENGE_LANE_SCOREBOARD_VERSION, "bbti-challenge-lane-scoreboard-v1");
assertEqual(
  "challenge lane scoreboard boundary",
  BBTI_CHALLENGE_LANE_SCOREBOARD_BOUNDARY,
  "本地开庭路线板，只复用当前 BBTI 结果、三条推荐对线和短挑战入口，不代表真实赛程、热度或外部来源。",
);

if (typeof resolveBbtiChallengeLaneScoreboard !== "function") {
  addError("resolveBbtiChallengeLaneScoreboard must be exported");
}
if (typeof getBbtiChallengeMatchups !== "function") {
  addError("getBbtiChallengeMatchups must be exported");
}

if (typeof resolveBbtiChallengeLaneScoreboard === "function" && typeof getBbtiChallengeMatchups === "function") {
  for (const code of EXPECTED_BBTI_CODES) {
    const matchups = getBbtiChallengeMatchups(code);
    const scoreboard = resolveBbtiChallengeLaneScoreboard({ code, challengeMatchups: matchups });
    const fallbackScoreboard = resolveBbtiChallengeLaneScoreboard({ code });

    assertEqual(`${code} matchup count`, matchups.length, 3);
    assertEqual(`${code} version`, scoreboard.version, BBTI_CHALLENGE_LANE_SCOREBOARD_VERSION);
    assertEqual(`${code} boundary`, scoreboard.boundary, BBTI_CHALLENGE_LANE_SCOREBOARD_BOUNDARY);
    assertEqual(`${code} lane count`, scoreboard.laneCount, 3);
    assertEqual(`${code} row ids`, scoreboard.rows.map((row) => row.id), EXPECTED_ROW_IDS);
    assertEqual(`${code} row targets`, scoreboard.rows.map((row) => row.target), EXPECTED_TARGETS);
    assertEqual(`${code} row categories`, scoreboard.rows.map((row) => row.category), EXPECTED_CATEGORIES);
    assertEqual(`${code} fallback rows`, fallbackScoreboard.rows.map((row) => row.matchupId), scoreboard.rows.map((row) => row.matchupId));

    const matchupIds = scoreboard.rows.map((row) => row.matchupId);
    if (new Set(matchupIds).size !== matchupIds.length) {
      addError(`${code}: lane scoreboard must use unique matchup ids, got ${matchupIds.join(",")}`);
    }
    for (const row of scoreboard.rows) {
      const matchup = matchups.find((item) => item.matchupId === row.matchupId && item.category === row.category);
      if (!matchup) {
        addError(`${code}: row ${row.id} must point to a local challenge matchup`);
        continue;
      }
      assertEqual(`${code} ${row.id} title`, row.title, matchup.title);
      assertIncludes(`${code} ${row.id} body`, row.body, matchup.reason);
    }

    assertIncludes(`${code} copy`, scoreboard.copyText, "BBTI 开庭选边板");
    assertIncludes(`${code} copy`, scoreboard.copyText, code);
    assertIncludes(`${code} copy boundary`, scoreboard.copyText, BBTI_CHALLENGE_LANE_SCOREBOARD_BOUNDARY);

    const copySurface = [
      scoreboard.copyText,
      ...scoreboard.rows.flatMap((row) => [
        row.routeLabel,
        row.label,
        row.title,
        row.body,
        row.pressureQuestion,
        row.reason,
      ]),
    ].join("\n");
    for (const term of FORBIDDEN_COPY_TERMS) {
      assertNotIncludes(`${code} scoreboard copy surface`, copySurface, term);
    }
  }
}

[
  'BBTI_CHALLENGE_LANE_SCOREBOARD_VERSION = "bbti-challenge-lane-scoreboard-v1"',
  "BBTI_CHALLENGE_LANE_SCOREBOARD_BOUNDARY",
  "resolveBbtiChallengeLaneScoreboard",
  '"same-court"',
  '"counter-court"',
  '"overtime-court"',
  '"same-temperature"',
  '"counter-judgment"',
  '"overtime"',
].forEach((expected) => assertIncludes("challenge lane scoreboard data contract", challengeData, expected));

[
  'data-testid="bbti-challenge-lane-scoreboard"',
  "data-bbti-challenge-lane-scoreboard-version={laneScoreboard.version}",
  "data-bbti-challenge-lane-scoreboard-code={laneScoreboard.code}",
  "data-bbti-challenge-lane-scoreboard-count={laneScoreboard.laneCount}",
  'data-testid="bbti-challenge-lane-scoreboard-row"',
  "data-bbti-challenge-lane-scoreboard-row={row.id}",
  "data-bbti-challenge-lane-scoreboard-target={row.target}",
  "data-bbti-challenge-lane-scoreboard-category={row.category}",
  "data-bbti-challenge-lane-scoreboard-matchup={row.matchupId}",
  "data-bbti-challenge-lane-scoreboard-position={index + 1}",
  'data-bbti-challenge-lane-scoreboard-action="open-lane"',
  'data-testid="bbti-challenge-lane-scoreboard-action"',
  'data-bbti-challenge-lane-scoreboard-action="copy-scoreboard"',
  'data-testid="bbti-challenge-lane-scoreboard-boundary"',
].forEach((expected) => assertIncludes("challenge lane scoreboard UI contract", challengeComponent, expected));

[
  'id: "challenge-lane-scoreboard"',
  '[data-testid="bbti-challenge-lane-scoreboard"]',
  'data-bbti-challenge-lane-scoreboard-version="bbti-challenge-lane-scoreboard-v1"',
  'data-bbti-challenge-lane-scoreboard-row="same-court"',
  'data-bbti-challenge-lane-scoreboard-row="counter-court"',
  'data-bbti-challenge-lane-scoreboard-row="overtime-court"',
].forEach((expected) => assertIncludes("visual QA challenge lane coverage", visualFixtures, expected));

assertIncludes("QA selector coverage", qaSelectors, "bbti-challenge-lane-scoreboard");
assertIncludes("package script", packageJson, '"validate:bbti-challenge-lane-scoreboard"');
assertIncludes("Add Files shipped id", addFilesData, '"challenge-lane-scoreboard"');
assertIncludes("Add Files validator shipped id", addFilesValidator, '"challenge-lane-scoreboard"');
assertIncludes("fact rules challenge lane boundary", factRules, "Challenge Lane Scoreboard Boundary");
assertIncludes("fact rules challenge lane boundary", factRules, "bbti-challenge-lane-scoreboard-v1");
assertIncludes("visual QA challenge lane docs", visualQa, "Challenge Lane Scoreboard checks");
assertIncludes("roadmap challenge lane shipped", roadmap, "Challenge Lane Scoreboard");

if (errors.length) {
  console.error("BBTI challenge lane scoreboard validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI challenge lane scoreboard validation");
console.log(`- contract: ${BBTI_CHALLENGE_LANE_SCOREBOARD_VERSION}`);
console.log("- rows: same-court, counter-court, overtime-court");
console.log("- source: local BBTI result + three recommended challenge matchups");
console.log("OK: challenge lane scoreboard stays local, basketball-native, and selector-backed.");
