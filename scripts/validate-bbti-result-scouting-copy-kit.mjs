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
  "真实热度领先",
  "实时热度",
  "全网",
  "用户投票",
  "播放量",
  "热搜",
  "多数球迷",
  "大家都选",
  "sourceId",
  "sourceVersion",
  "http://",
  "https://",
  "?bbti=",
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
  BBTI_RESULT_SCOUTING_COPY_KIT_BOUNDARY,
  BBTI_RESULT_SCOUTING_COPY_KIT_VERSION,
  BBTI_RESULT_SCOUTING_VERSION,
  getBbtiPlaybook,
  resolveBbtiResultScoutingCopyKit,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-playbook.ts"));

const resultComponent = read("src/components/BbtiResult.tsx");
const playbookData = read("src/data/bbti-playbook.ts");
const packageJson = read("package.json");
const visualFixtures = read("scripts/render-bbti-visual-qa-fixtures.mjs");
const visualPack = read("scripts/validate-bbti-visual-regression-pack.mjs");
const factRules = read("docs/BBTI_FACT_RULES.md");
const visualQa = read("docs/BBTI_VISUAL_QA.md");
const roadmap = read("docs/BBTI_ADD_FILES_ROADMAP.md");
const addFilesData = read("src/data/bbti-add-files-suggestions.ts");

assertEqual("copy kit version", BBTI_RESULT_SCOUTING_COPY_KIT_VERSION, "bbti-result-scouting-copy-kit-v1");
assertEqual(
  "copy kit boundary",
  BBTI_RESULT_SCOUTING_COPY_KIT_BOUNDARY,
  "本地球探话术包，只复用本次四维复盘、答题证据和战术手册，不代表外部排名、真实球探报告、真实热度或用户行为。",
);
if (typeof getBbtiPlaybook !== "function") addError("getBbtiPlaybook must be exported");
if (typeof resolveBbtiResultScoutingCopyKit !== "function") addError("resolveBbtiResultScoutingCopyKit must be exported");

const sampleAnswers = bbtiQuestions.map((question) => {
  if (question.type === "binary") return { questionId: question.id, selected: "A" };
  if (question.type === "multi") return { questionId: question.id, selectedIndices: [0] };
  return { questionId: question.id, text: "我会先看回合质量，再看情绪价值。" };
});

if (typeof getBbtiPlaybook === "function" && typeof resolveBbtiResultScoutingCopyKit === "function") {
  const codes = Object.keys(bbtiTypes);
  assertEqual("BBTI code count", codes.length, 16);

  for (const code of codes) {
    const report = getBbtiPlaybook(code, sampleAnswers).scoutingReport;
    const copyKit = resolveBbtiResultScoutingCopyKit(report);
    assertEqual(`${code} copy kit version`, copyKit.version, BBTI_RESULT_SCOUTING_COPY_KIT_VERSION);
    assertEqual(`${code} source report version`, copyKit.sourceReportVersion, BBTI_RESULT_SCOUTING_VERSION);
    assertEqual(`${code} copy kit boundary`, copyKit.boundary, BBTI_RESULT_SCOUTING_COPY_KIT_BOUNDARY);
    assertEqual(`${code} copy kit code`, copyKit.code, code);
    assertEqual(`${code} copy kit count`, copyKit.itemCount, 3);
    assertEqual(`${code} copy kit ids`, copyKit.items.map((item) => item.id).join(","), "group-recap,counter-read,next-workout");
    assertEqual(`${code} copy kit targets`, copyKit.items.map((item) => item.target).join(","), "group-chat,counter,workout");
    assertEqual(`${code} copy kit source lanes`, copyKit.items.map((item) => item.sourceLaneId).join(","), "pace-read,proof-read,usage-read");
    assertEqual(`${code} copy kit source axes`, copyKit.items.map((item) => item.sourceAxis).join(","), "OD,AE,IT");
    assertIncludes(`${code} full copy title`, copyKit.copyText, "BBTI 球探话术包");
    assertIncludes(`${code} full copy code`, copyKit.copyText, code);
    assertIncludes(`${code} full copy boundary`, copyKit.copyText, BBTI_RESULT_SCOUTING_COPY_KIT_BOUNDARY);

    for (const item of copyKit.items) {
      assertTruthy(`${code} ${item.id} label`, item.label);
      assertTruthy(`${code} ${item.id} title`, item.title);
      assertTruthy(`${code} ${item.id} body`, item.body);
      assertIncludes(`${code} ${item.id} copy boundary`, item.copyText, BBTI_RESULT_SCOUTING_COPY_KIT_BOUNDARY);
      for (const term of FORBIDDEN_COPY_TERMS) {
        assertNotIncludes(`${code} ${item.id} copy`, [
          item.label,
          item.title,
          item.body,
          item.copyText,
        ].join("\n"), term);
      }
    }
  }
}

[
  'BBTI_RESULT_SCOUTING_COPY_KIT_VERSION = "bbti-result-scouting-copy-kit-v1"',
  "BBTI_RESULT_SCOUTING_COPY_KIT_BOUNDARY",
  "resolveBbtiResultScoutingCopyKit",
  '"group-recap"',
  '"counter-read"',
  '"next-workout"',
  '"group-chat"',
  '"counter"',
  '"workout"',
].forEach((expected) => assertIncludes("copy kit data contract", playbookData, expected));

[
  "resolveBbtiResultScoutingCopyKit",
  "useGuardedClipboard",
  "BbtiManualCopyFallback",
  'data-testid="bbti-result-scouting-copy-kit"',
  "data-bbti-result-scouting-copy-kit-version={copyKit.version}",
  "data-bbti-result-scouting-copy-kit-source-version={copyKit.sourceReportVersion}",
  "data-bbti-result-scouting-copy-kit-code={copyKit.code}",
  "data-bbti-result-scouting-copy-kit-count={copyKit.itemCount}",
  'data-testid="bbti-result-scouting-copy-kit-action"',
  'data-bbti-result-scouting-copy-kit-action="copy-kit"',
  'data-testid="bbti-result-scouting-copy-kit-item"',
  "data-bbti-result-scouting-copy-kit-item={item.id}",
  "data-bbti-result-scouting-copy-kit-target={item.target}",
  "data-bbti-result-scouting-copy-kit-source-lane={item.sourceLaneId}",
  "data-bbti-result-scouting-copy-kit-source-axis={item.sourceAxis}",
  "data-bbti-result-scouting-copy-kit-position={index + 1}",
  'data-bbti-result-scouting-copy-kit-action="copy"',
  'data-testid="bbti-result-scouting-copy-kit-boundary"',
].forEach((expected) => assertIncludes("copy kit UI contract", resultComponent, expected));

[
  '"validate:bbti-result-scouting-copy-kit": "node scripts/validate-bbti-result-scouting-copy-kit.mjs"',
].forEach((expected) => assertIncludes("package script", packageJson, expected));

[
  'id: "result-scouting-copy-kit"',
  '[data-testid="bbti-result-scouting-copy-kit"]',
  'data-bbti-result-scouting-copy-kit-version="bbti-result-scouting-copy-kit-v1"',
  'data-bbti-result-scouting-copy-kit-item="group-recap"',
  'data-bbti-result-scouting-copy-kit-item="counter-read"',
  'data-bbti-result-scouting-copy-kit-item="next-workout"',
  'data-bbti-result-scouting-copy-kit-target="group-chat"',
  'data-bbti-result-scouting-copy-kit-target="counter"',
  'data-bbti-result-scouting-copy-kit-target="workout"',
  'data-bbti-result-scouting-copy-kit-action="copy-kit"',
  'data-bbti-result-scouting-copy-kit-action="copy"',
  'data-testid="bbti-result-scouting-copy-kit-boundary"',
].forEach((expected) => assertIncludes("visual QA copy kit coverage", visualFixtures, expected));

assertIncludes("visual regression copy-controls risk", visualPack, 'assertSceneRisk(manifest, "result-scouting-copy-kit", "copy-controls")');
assertIncludes("fact rules copy kit boundary", factRules, "Result Scouting Copy Kit Boundary");
assertIncludes("fact rules copy kit contract", factRules, "bbti-result-scouting-copy-kit-v1");
assertIncludes("visual QA copy kit docs", visualQa, "Result Scouting Copy Kit checks");
assertIncludes("roadmap copy kit shipped", roadmap, "Result Scouting Copy Kit");
assertIncludes("roadmap copy kit validator", roadmap, "npm run validate:bbti-result-scouting-copy-kit");
assertIncludes("Add Files shipped copy kit", addFilesData, '"result-scouting-copy-kit"');

if (errors.length) {
  console.error("BBTI result scouting copy kit validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI result scouting copy kit validation");
console.log(`- contract: ${BBTI_RESULT_SCOUTING_COPY_KIT_VERSION}`);
console.log("- items: group-recap, counter-read, next-workout");
console.log(`- codes checked: ${Object.keys(bbtiTypes).length}`);
console.log("OK: result scouting copy kit stays local, basketball-native, and selector-backed.");
