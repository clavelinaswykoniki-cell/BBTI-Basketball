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
  bbtiQuestions,
  bbtiTypes,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti.ts"));
const {
  BBTI_RESULT_SCOUTING_BOUNDARY,
  BBTI_RESULT_SCOUTING_VERSION,
  getBbtiPlaybook,
  resolveBbtiResultScoutingReport,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-playbook.ts"));

const resultComponent = read("src/components/BbtiResult.tsx");
const myTeamCard = read("src/components/MyTeamResultCard.tsx");
const playbookData = read("src/data/bbti-playbook.ts");
const visualFixtures = read("scripts/render-bbti-visual-qa-fixtures.mjs");
const factRules = read("docs/BBTI_FACT_RULES.md");
const visualQa = read("docs/BBTI_VISUAL_QA.md");
const roadmap = read("docs/BBTI_ADD_FILES_ROADMAP.md");

assertEqual("result scouting version", BBTI_RESULT_SCOUTING_VERSION, "bbti-result-scouting-refresh-v1");
assertEqual(
  "result scouting boundary",
  BBTI_RESULT_SCOUTING_BOUNDARY,
  "本地球探复盘，只复用本次答题、四维坐标和战术手册，不代表外部排名、真实球探报告或外部结论。",
);

if (typeof getBbtiPlaybook !== "function") addError("getBbtiPlaybook must be exported");
if (typeof resolveBbtiResultScoutingReport !== "function") addError("resolveBbtiResultScoutingReport must be exported");

const sampleAnswers = bbtiQuestions.map((question) => {
  if (question.type === "binary") return { questionId: question.id, selected: "A" };
  if (question.type === "multi") return { questionId: question.id, selectedIndices: [0] };
  return { questionId: question.id, text: "我会先看回合质量，再看情绪价值。" };
});

if (typeof getBbtiPlaybook === "function") {
  const codes = Object.keys(bbtiTypes);
  assertEqual("BBTI code count", codes.length, 16);

  for (const code of codes) {
    const playbook = getBbtiPlaybook(code, sampleAnswers);
    const report = playbook.scoutingReport;
    assertTruthy(`${code} scouting report`, report);
    assertEqual(`${code} report version`, report?.version, BBTI_RESULT_SCOUTING_VERSION);
    assertEqual(`${code} report boundary`, report?.boundary, BBTI_RESULT_SCOUTING_BOUNDARY);
    assertEqual(`${code} report code`, report?.code, code);
    assertEqual(`${code} lane count`, report?.laneCount, 4);
    assertEqual(`${code} lane ids`, report?.lanes.map((lane) => lane.id).join(","), "pace-read,proof-read,usage-read,stakes-read");
    assertEqual(`${code} axis order`, report?.lanes.map((lane) => lane.axisKey).join(","), "OD,AE,IT,LR");
    assertEqual(`${code} target order`, report?.lanes.map((lane) => lane.target).join(","), "tempo,evidence,usage,identity");
    assertIncludes(`${code} copy title`, report?.copyText, "BBTI 本地球探复盘");
    assertIncludes(`${code} copy boundary`, report?.copyText, BBTI_RESULT_SCOUTING_BOUNDARY);

    for (const lane of report?.lanes ?? []) {
      if (lane.score < 0 || lane.score > 100) {
        addError(`${code} lane ${lane.id}: score must be 0-100, got ${lane.score}`);
      }
      if (!lane.evidence.length || lane.evidence.length > 2) {
        addError(`${code} lane ${lane.id}: expected 1-2 evidence lines, got ${lane.evidence.length}`);
      }
      const copySurface = [
        lane.badge,
        lane.headline,
        lane.read,
        lane.workout,
        lane.risk,
        ...lane.evidence,
      ].join("\n");
      for (const term of FORBIDDEN_COPY_TERMS) {
        assertNotIncludes(`${code} lane ${lane.id} copy`, copySurface, term);
      }
    }
  }
}

[
  'BBTI_RESULT_SCOUTING_VERSION = "bbti-result-scouting-refresh-v1"',
  "BBTI_RESULT_SCOUTING_BOUNDARY",
  "resolveBbtiResultScoutingReport",
  "buildAxisEvidence",
  '"pace-read"',
  '"proof-read"',
  '"usage-read"',
  '"stakes-read"',
].forEach((expected) => assertIncludes("result scouting data contract", playbookData, expected));

[
  'data-testid="bbti-result-scouting-report"',
  "data-bbti-result-scouting-version={report.version}",
  "data-bbti-result-scouting-code={report.code}",
  "data-bbti-result-scouting-count={report.laneCount}",
  'data-testid="bbti-result-scouting-lane"',
  "data-bbti-result-scouting-lane={lane.id}",
  "data-bbti-result-scouting-axis={lane.axisKey}",
  "data-bbti-result-scouting-target={lane.target}",
  "data-bbti-result-scouting-letter={lane.chosenLetter}",
  "data-bbti-result-scouting-score={lane.score}",
  "data-bbti-result-scouting-position={index + 1}",
  'data-testid="bbti-result-scouting-evidence"',
  "data-bbti-result-scouting-evidence-axis={lane.axisKey}",
  "data-bbti-result-scouting-evidence-position={evidenceIndex + 1}",
  'data-testid="bbti-result-scouting-boundary"',
].forEach((expected) => assertIncludes("result scouting UI contract", resultComponent, expected));

[
  'BBTI_MY_TEAM_RESULT_CARD_VERSION = "bbti-myteam-result-card-v1"',
  'data-testid={qaTestId}',
  "data-myteam-card-context={qaContext}",
  "data-myteam-card-version={qaVersion}",
  "data-bbti-myteam-card-code={qaContext ? code : undefined}",
  'data-testid={qaContext ? "bbti-myteam-scouting-attribute" : undefined}',
].forEach((expected) => assertIncludes("MyTeam BBTI QA contract", myTeamCard, expected));

[
  'id: "result-scouting-refresh"',
  '[data-testid="bbti-result-scouting-report"]',
  'data-bbti-result-scouting-version="bbti-result-scouting-refresh-v1"',
  'data-bbti-result-scouting-lane="pace-read"',
  'data-bbti-result-scouting-lane="proof-read"',
  'data-bbti-result-scouting-lane="usage-read"',
  'data-bbti-result-scouting-lane="stakes-read"',
  'data-testid="bbti-myteam-scouting-card"',
].forEach((expected) => assertIncludes("visual QA result scouting coverage", visualFixtures, expected));

assertIncludes("fact rules result scouting boundary", factRules, "Result Scouting Refresh Boundary");
assertIncludes("fact rules result scouting boundary", factRules, "bbti-result-scouting-refresh-v1");
assertIncludes("visual QA result scouting docs", visualQa, "Result Scouting Refresh checks");
assertIncludes("roadmap result scouting shipped", roadmap, "Result Scouting Refresh");
assertIncludes("roadmap validation baseline", roadmap, "npm run validate:bbti-result-scouting-refresh");

if (errors.length) {
  console.error("BBTI result scouting refresh validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI result scouting refresh validation");
console.log(`- contract: ${BBTI_RESULT_SCOUTING_VERSION}`);
console.log("- lanes: pace-read, proof-read, usage-read, stakes-read");
console.log(`- codes checked: ${Object.keys(bbtiTypes).length}`);
console.log("OK: result scouting stays answer-derived, local, basketball-native, and selector-backed.");
