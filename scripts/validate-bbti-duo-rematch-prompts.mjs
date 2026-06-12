#!/usr/bin/env node
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const nodeRequire = createRequire(path.join(ROOT, "package.json"));
const runtimeModuleCache = new Map();
const errors = [];

const EXPECTED_PROMPT_IDS = ["standard-lock", "receipt-swap", "last-shot"];
const FORBIDDEN_TERMS = [
  "FBTI",
  "football",
  "soccer",
  "足球",
  "VAR",
  "FUT",
  "点球",
  "德比",
  "12+3",
  "梅西",
  "C罗",
  "世界杯",
  "欧冠",
  "金球",
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
  "sourceId",
  "sourceVersion",
  "caseVersion",
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

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

function assertIncludes(label, source, expected) {
  if (!source.includes(expected)) {
    addError(`${label}: missing ${JSON.stringify(expected)}`);
  }
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
      addError(`${label} contains forbidden term ${JSON.stringify(term)}`);
    }
  }
  if (value.includes("胜率") && !value.includes("不") && !value.includes("本地")) {
    addError(`${label} mentions win-rate without a local/negative boundary`);
  }
}

const {
  BBTI_CODES,
  BBTI_DUO_REMATCH_PROMPTS_BOUNDARY,
  BBTI_DUO_REMATCH_PROMPTS_VERSION,
  buildBbtiDuoRematchPromptCopy,
  getBbtiCompareReport,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-rivalries.ts"));

if (BBTI_DUO_REMATCH_PROMPTS_VERSION !== "bbti-duo-rematch-prompts-v1") {
  addError(`wrong duo rematch prompt version ${JSON.stringify(BBTI_DUO_REMATCH_PROMPTS_VERSION)}`);
}
if (!BBTI_DUO_REMATCH_PROMPTS_BOUNDARY?.includes("本地复赛追问")) {
  addError("duo rematch prompt boundary must mark the feature as local");
}

let pairCount = 0;
for (const codeA of BBTI_CODES) {
  for (const codeB of BBTI_CODES) {
    const report = getBbtiCompareReport(codeA, codeB);
    const label = `${codeA}-${codeB}`;
    pairCount += 1;

    if (report.rematchPromptsVersion !== BBTI_DUO_REMATCH_PROMPTS_VERSION) {
      addError(`${label}: wrong rematch prompt version ${JSON.stringify(report.rematchPromptsVersion)}`);
    }
    if (report.rematchPromptsBoundary !== BBTI_DUO_REMATCH_PROMPTS_BOUNDARY) {
      addError(`${label}: wrong rematch prompt boundary`);
    }
    if (report.rematchPrompts.length !== 3) {
      addError(`${label}: expected 3 rematch prompts, got ${report.rematchPrompts.length}`);
    }

    const ids = report.rematchPrompts.map((prompt) => prompt.id);
    if (JSON.stringify(ids) !== JSON.stringify(EXPECTED_PROMPT_IDS)) {
      addError(`${label}: expected prompt ids ${EXPECTED_PROMPT_IDS.join(",")}, got ${ids.join(",")}`);
    }

    for (const [index, prompt] of report.rematchPrompts.entries()) {
      const promptLabel = `${label}.${prompt.id}`;
      if (!prompt.qaKey.includes(codeA) || !prompt.qaKey.includes(codeB) || !prompt.qaKey.includes(prompt.id)) {
        addError(`${promptLabel}: qaKey must include both codes and prompt id`);
      }
      if (index !== EXPECTED_PROMPT_IDS.indexOf(prompt.id)) {
        addError(`${promptLabel}: prompt order must stay stable`);
      }
      checkText(`${promptLabel}.label`, prompt.label, 12);
      checkText(`${promptLabel}.title`, prompt.title, 36);
      checkText(`${promptLabel}.question`, prompt.question, 140);
      checkText(`${promptLabel}.constraint`, prompt.constraint, 120);
      checkText(`${promptLabel}.copyLine`, prompt.copyLine, 120);
      if (!prompt.axisKey) {
        addError(`${promptLabel}: axisKey must be present`);
      }
    }

    const copy = buildBbtiDuoRematchPromptCopy({
      report,
      url: `https://example.test/?a=${report.codeA}&b=${report.codeB}`,
    });
    checkText(`${label}.copy`, copy, 760);
    for (const expected of [
      "BBTI 双人复赛追问",
      report.rematchPrompts[0]?.copyLine,
      report.rematchPrompts[1]?.copyLine,
      report.rematchPrompts[2]?.copyLine,
      BBTI_DUO_REMATCH_PROMPTS_BOUNDARY,
      `?a=${report.codeA}&b=${report.codeB}`,
    ]) {
      if (!copy.includes(expected)) {
        addError(`${label}.copy missing ${JSON.stringify(expected)}`);
      }
    }
  }
}

const compare = read("src/components/BbtiCompare.tsx");
for (const expected of [
  'data-testid="bbti-duo-rematch-prompts"',
  "data-bbti-duo-rematch-version={report.rematchPromptsVersion}",
  "data-bbti-duo-rematch-code-a={report.codeA}",
  "data-bbti-duo-rematch-code-b={report.codeB}",
  "data-bbti-duo-rematch-anchor-axis={report.rematchPrompts[0]?.axisKey ?? \"mirror\"}",
  "data-bbti-duo-rematch-count={report.rematchPrompts.length}",
  'data-testid="bbti-duo-rematch-prompt"',
  "data-bbti-duo-rematch-prompt={prompt.id}",
  "data-bbti-duo-rematch-prompt-axis={prompt.axisKey}",
  "data-bbti-duo-rematch-prompt-qa={prompt.qaKey}",
  "data-bbti-duo-rematch-position={index + 1}",
  'data-testid="bbti-duo-rematch-prompts-action"',
  'data-bbti-duo-rematch-action="copy-prompts"',
  'data-testid="bbti-duo-rematch-boundary"',
  "buildBbtiDuoRematchPromptCopy",
]) {
  assertIncludes("BbtiCompare duo rematch selectors", compare, expected);
}

const fixtureRenderer = read("scripts/render-bbti-visual-qa-fixtures.mjs");
for (const expected of [
  '"duo-rematch-prompts"',
  '[data-testid="bbti-duo-rematch-prompts"]',
  'data-bbti-duo-rematch-version="bbti-duo-rematch-prompts-v1"',
  'data-bbti-duo-rematch-prompt="standard-lock"',
  'data-bbti-duo-rematch-prompt="receipt-swap"',
  'data-bbti-duo-rematch-prompt="last-shot"',
]) {
  assertIncludes("visual fixture duo rematch coverage", fixtureRenderer, expected);
}

const factRules = read("docs/BBTI_FACT_RULES.md");
assertIncludes("fact rules duo rematch boundary", factRules, "bbti-duo-rematch-prompts-v1");
assertIncludes("fact rules duo rematch local boundary", factRules, "本地 BBTI 双人报告");

const roadmap = read("docs/BBTI_ADD_FILES_ROADMAP.md");
assertIncludes("roadmap duo rematch shipped note", roadmap, "bbti-duo-rematch-prompts-v1");

if (errors.length) {
  console.error("BBTI duo rematch prompt validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI Duo Rematch Prompt validation");
console.log(`- contract: ${BBTI_DUO_REMATCH_PROMPTS_VERSION}`);
console.log(`- report pairs: ${pairCount}`);
console.log(`- prompt ids: ${EXPECTED_PROMPT_IDS.join(", ")}`);
console.log("OK: Duo rematch prompts stay local, basketball-native, and share-duo ready.");
