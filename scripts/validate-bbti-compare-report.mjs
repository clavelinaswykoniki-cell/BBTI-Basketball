#!/usr/bin/env node
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const nodeRequire = createRequire(path.join(ROOT, "package.json"));
const runtimeModuleCache = new Map();
const errors = [];

const EXPECTED_PROGRAM_IDS = ["opening-read", "swing-point", "closing-challenge"];
const EXPECTED_REMATCH_PROMPT_IDS = ["standard-lock", "receipt-swap", "last-shot"];
const FORBIDDEN_TERMS = [
  "FBTI",
  "football",
  "soccer",
  "足球",
  "VAR",
  "FUT",
  "点球",
  "德比",
  "真实热度",
  "实时热度",
  "全网",
  "用户投票",
  "播放量",
  "热搜",
  "多数球迷",
  "大家都选",
  "官方",
  "官方认证",
  "公认第一",
  "唯一",
  "碾压",
  "sourceId",
  "sourceVersion",
  "caseVersion",
];

function resolveWithExt(basePath) {
  const candidates = [
    basePath,
    `${basePath}.tsx`,
    `${basePath}.ts`,
    `${basePath}.jsx`,
    `${basePath}.js`,
    path.join(basePath, "index.tsx"),
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.js"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
}

function resolveRuntimeModule(fromPath, request) {
  if (request.endsWith(".css")) return null;
  if (request.startsWith("@/")) {
    return resolveWithExt(path.join(ROOT, "src", request.slice(2)));
  }
  if (request.startsWith(".")) {
    return resolveWithExt(path.resolve(path.dirname(fromPath), request));
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
    if (request.endsWith(".css")) return {};
    const runtimePath = resolveRuntimeModule(absolutePath, request);
    return runtimePath ? loadRuntimeTsModule(runtimePath) : nodeRequire(request);
  };

  const wrapper = new Function("require", "module", "exports", "__filename", "__dirname", compiled.outputText);
  wrapper(localRequire, runtimeModule, runtimeModule.exports, absolutePath, path.dirname(absolutePath));
  return runtimeModule.exports;
}

function addError(message) {
  errors.push(message);
}

function checkText(label, value, maxLength = 180) {
  if (!value?.trim()) {
    addError(`${label} must be non-empty`);
    return;
  }
  if (value.length > maxLength) {
    addError(`${label} is too long (${value.length} > ${maxLength})`);
  }
  for (const term of FORBIDDEN_TERMS) {
    if (value.includes(term)) {
      addError(`${label} contains forbidden term "${term}"`);
    }
  }
}

const {
  BBTI_CODES,
  BBTI_COMPARE_REPORT_VERSION,
  BBTI_DUO_REMATCH_PROMPTS_BOUNDARY,
  BBTI_DUO_REMATCH_PROMPTS_VERSION,
  buildBbtiDuoRematchPromptCopy,
  buildBbtiCompareReportCopy,
  getBbtiCompareReport,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-rivalries.ts"));

if (BBTI_COMPARE_REPORT_VERSION !== "bbti-compare-report-v1") {
  addError(`wrong compare report version ${JSON.stringify(BBTI_COMPARE_REPORT_VERSION)}`);
}
if (BBTI_DUO_REMATCH_PROMPTS_VERSION !== "bbti-duo-rematch-prompts-v1") {
  addError(`wrong duo rematch prompt version ${JSON.stringify(BBTI_DUO_REMATCH_PROMPTS_VERSION)}`);
}

let caseCount = 0;
const seenQaKeys = new Set();

for (const codeA of BBTI_CODES) {
  for (const codeB of BBTI_CODES) {
    const label = `${codeA}-${codeB}`;
    const report = getBbtiCompareReport(codeA, codeB);
    caseCount += 1;

    if (report.version !== BBTI_COMPARE_REPORT_VERSION) {
      addError(`${label}: report has wrong version ${JSON.stringify(report.version)}`);
    }
    if (report.codeA !== codeA || report.codeB !== codeB) {
      addError(`${label}: report code mismatch ${report.codeA}-${report.codeB}`);
    }
    if (report.score < 18 || report.score > 98) {
      addError(`${label}: score out of range ${report.score}`);
    }
    if (codeA === codeB && report.score !== 96) {
      addError(`${label}: same-code report must score 96, got ${report.score}`);
    }
    if (!report.oneLiner.includes("本地")) {
      addError(`${label}: oneLiner must mark the score as local`);
    }

    const axisRows = [...report.sharedAxes, ...report.clashAxes];
    if (axisRows.length !== 4) {
      addError(`${label}: expected 4 axis rows, got ${axisRows.length}`);
    }
    const axisKeys = axisRows.map((axis) => axis.key);
    if (new Set(axisKeys).size !== 4) {
      addError(`${label}: duplicate axis keys ${axisKeys.join(",")}`);
    }

    const programIds = report.program.map((segment) => segment.id);
    if (JSON.stringify(programIds) !== JSON.stringify(EXPECTED_PROGRAM_IDS)) {
      addError(`${label}: expected program ids ${EXPECTED_PROGRAM_IDS.join(",")}, got ${programIds.join(",")}`);
    }
    for (const [index, segment] of report.program.entries()) {
      const segmentLabel = `${label}.program.${segment.id}`;
      if (!segment.qaKey.includes(codeA) || !segment.qaKey.includes(codeB) || !segment.qaKey.includes(segment.id)) {
        addError(`${segmentLabel}: qaKey must include both codes and segment id`);
      }
      if (seenQaKeys.has(segment.qaKey)) {
        addError(`${segmentLabel}: duplicate qaKey ${segment.qaKey}`);
      }
      seenQaKeys.add(segment.qaKey);
      checkText(`${segmentLabel}.kicker`, segment.kicker, 24);
      checkText(`${segmentLabel}.title`, segment.title, 48);
      checkText(`${segmentLabel}.body`, segment.body, 130);
      if (index !== programIds.indexOf(segment.id)) {
        addError(`${segmentLabel}: program order must stay stable`);
      }
    }

    checkText(`${label}.courtChemistry`, report.courtChemistry);
    checkText(`${label}.groupChat`, report.groupChat);
    checkText(`${label}.coachNote`, report.coachNote);
    checkText(`${label}.danger`, report.danger);
    checkText(`${label}.challenge`, report.challenge);
    checkText(`${label}.rematch.title`, report.rematchPlan.title, 48);
    checkText(`${label}.rematch.setup`, report.rematchPlan.setup, 120);
    checkText(`${label}.rematch.firstPossession`, report.rematchPlan.firstPossession, 120);
    checkText(`${label}.rematch.counter`, report.rematchPlan.counter, 120);
    checkText(`${label}.rematch.copyCue`, report.rematchPlan.copyCue, 80);
    if (report.rematchPromptsVersion !== BBTI_DUO_REMATCH_PROMPTS_VERSION) {
      addError(`${label}: wrong rematch prompts version ${JSON.stringify(report.rematchPromptsVersion)}`);
    }
    if (report.rematchPromptsBoundary !== BBTI_DUO_REMATCH_PROMPTS_BOUNDARY) {
      addError(`${label}: wrong rematch prompts boundary`);
    }
    const promptIds = report.rematchPrompts.map((prompt) => prompt.id);
    if (JSON.stringify(promptIds) !== JSON.stringify(EXPECTED_REMATCH_PROMPT_IDS)) {
      addError(`${label}: expected rematch prompt ids ${EXPECTED_REMATCH_PROMPT_IDS.join(",")}, got ${promptIds.join(",")}`);
    }
    for (const [index, prompt] of report.rematchPrompts.entries()) {
      const promptLabel = `${label}.rematchPrompt.${prompt.id}`;
      if (!prompt.qaKey.includes(codeA) || !prompt.qaKey.includes(codeB) || !prompt.qaKey.includes(prompt.id)) {
        addError(`${promptLabel}: qaKey must include both codes and prompt id`);
      }
      if (index !== EXPECTED_REMATCH_PROMPT_IDS.indexOf(prompt.id)) {
        addError(`${promptLabel}: prompt order must stay stable`);
      }
      checkText(`${promptLabel}.label`, prompt.label, 12);
      checkText(`${promptLabel}.title`, prompt.title, 36);
      checkText(`${promptLabel}.question`, prompt.question, 140);
      checkText(`${promptLabel}.constraint`, prompt.constraint, 120);
      checkText(`${promptLabel}.copyLine`, prompt.copyLine, 120);
    }
    checkText(`${label}.shareText`, report.shareText, 360);

    const copy = buildBbtiCompareReportCopy({
      report,
      url: `https://example.test/?a=${report.codeA}&b=${report.codeB}`,
    });
    checkText(`${label}.copy`, copy, 980);
    for (const expected of [
      "赛后节目单：",
      report.program[0]?.body,
      report.program[1]?.body,
      report.program[2]?.body,
      report.rematchPlan.setup,
      report.rematchPrompts[0]?.copyLine,
      `?a=${report.codeA}&b=${report.codeB}`,
    ]) {
      if (!copy.includes(expected)) {
        addError(`${label}.copy missing ${JSON.stringify(expected)}`);
      }
    }

    const rematchCopy = buildBbtiDuoRematchPromptCopy({
      report,
      url: `https://example.test/?a=${report.codeA}&b=${report.codeB}`,
    });
    checkText(`${label}.rematchCopy`, rematchCopy, 760);
    for (const expected of [
      "BBTI 双人复赛追问",
      report.rematchPrompts[0]?.copyLine,
      report.rematchPrompts[1]?.copyLine,
      report.rematchPrompts[2]?.copyLine,
      BBTI_DUO_REMATCH_PROMPTS_BOUNDARY,
      `?a=${report.codeA}&b=${report.codeB}`,
    ]) {
      if (!rematchCopy.includes(expected)) {
        addError(`${label}.rematchCopy missing ${JSON.stringify(expected)}`);
      }
    }
  }
}

console.log("BBTI Compare Report validation");
console.log(`- contract: ${BBTI_COMPARE_REPORT_VERSION}`);
console.log(`- report pairs: ${caseCount}`);
console.log(`- program segments per report: ${EXPECTED_PROGRAM_IDS.length}`);
console.log(`- rematch prompts per report: ${EXPECTED_REMATCH_PROMPT_IDS.length}`);
console.log(`- forbidden terms: ${FORBIDDEN_TERMS.length}`);

if (errors.length) {
  console.error("\nErrors:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("OK: Compare reports stay local, basketball-native, and link-light.");
