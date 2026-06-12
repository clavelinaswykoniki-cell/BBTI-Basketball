#!/usr/bin/env node
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const nodeRequire = createRequire(path.join(ROOT, "package.json"));
const runtimeModuleCache = new Map();
const errors = [];

const REQUIRED_DISCLAIMER = "本地模拟，不代表真实用户投票。";
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
  if (request.startsWith("@/")) return resolveWithExt(path.join(ROOT, "src", request.slice(2)));
  if (request.startsWith(".")) return resolveWithExt(path.resolve(path.dirname(fromPath), request));
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

  const withoutDisclaimer = value.replaceAll(REQUIRED_DISCLAIMER, "");
  for (const term of FORBIDDEN_TERMS) {
    if (withoutDisclaimer.includes(term)) {
      addError(`${label} contains forbidden term "${term}"`);
    }
  }
}

const {
  bbtiQuestions,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti.ts"));
const {
  getBbtiAnswerPoll,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-answer-polls.ts"));
const {
  BBTI_ANSWER_POLL_TREND_VERSION,
  buildBbtiAnswerPollTrendCopy,
  buildBbtiAnswerPollTrendReads,
  resolveBbtiAnswerPollTrendSummary,
} = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiAnswerPollTrend.tsx"));

if (BBTI_ANSWER_POLL_TREND_VERSION !== "bbti-answer-poll-trend-v1") {
  addError(`wrong trend version ${JSON.stringify(BBTI_ANSWER_POLL_TREND_VERSION)}`);
}

let pollCases = 0;
let openCases = 0;

for (const question of bbtiQuestions) {
  const answers = [];
  if (question.type === "binary") {
    answers.push({ questionId: question.id, selected: "A" });
    answers.push({ questionId: question.id, selected: "B" });
  } else if (question.type === "multi") {
    answers.push({ questionId: question.id, selectedIndices: [0] });
  } else {
    answers.push({ questionId: question.id, text: "open answer" });
  }

  for (const answer of answers) {
    const label = `Q${question.id}.${answer.selected ?? answer.selectedIndices?.join(".") ?? "open"}`;
    const poll = getBbtiAnswerPoll(question, answer);

    if (question.type === "open") {
      openCases += 1;
      if (poll !== null) addError(`${label}: open questions must not create a local simulation poll`);
      continue;
    }

    pollCases += 1;
    if (!poll) {
      addError(`${label}: expected a local simulation poll`);
      continue;
    }
    if (poll.source !== "local-simulation") {
      addError(`${label}: source must be local-simulation`);
    }
    if (poll.selectedPercent < 20 || poll.selectedPercent > 80) {
      addError(`${label}: selectedPercent out of bounded local range ${poll.selectedPercent}`);
    }
    if (poll.selectedPercent + poll.dissentPercent !== 100) {
      addError(`${label}: selected and dissent percent must sum to 100`);
    }
    if (poll.detail !== REQUIRED_DISCLAIMER) {
      addError(`${label}: poll detail must be the required disclaimer`);
    }
    checkText(`${label}.selectedLabel`, poll.selectedLabel, 32);
    checkText(`${label}.dissentLabel`, poll.dissentLabel, 32);
    checkText(`${label}.callout`, poll.callout, 120);
    checkText(`${label}.detail`, poll.detail, 32);
  }
}

const fixtureAnswers = [
  { questionId: 1, selected: "A" },
  { questionId: 2, selectedIndices: [0] },
  { questionId: 5, selected: "B" },
  { questionId: 13, selected: "A" },
  { questionId: 14, selectedIndices: [1] },
  { questionId: 22, selected: "B" },
  { questionId: 26, selected: "A" },
  { questionId: 29, selectedIndices: [3] },
];
const reads = buildBbtiAnswerPollTrendReads(fixtureAnswers);
const summary = resolveBbtiAnswerPollTrendSummary(reads);
if (!summary) {
  addError("fixture trend: expected a summary");
} else {
  if (summary.version !== BBTI_ANSWER_POLL_TREND_VERSION) {
    addError(`fixture trend: wrong summary version ${summary.version}`);
  }
  if (summary.readCount !== reads.length) {
    addError(`fixture trend: readCount ${summary.readCount} must equal reads ${reads.length}`);
  }
  if (summary.mainstreamCount + summary.tossupCount + summary.minorityCount !== summary.readCount) {
    addError("fixture trend: count buckets must sum to readCount");
  }
  if (summary.seats.length < 1 || summary.seats.length > 3) {
    addError(`fixture trend: seats must have 1-3 entries, got ${summary.seats.length}`);
  }
  checkText("fixture trend label", summary.label, 24);
  checkText("fixture trend tone", summary.tone, 24);
  checkText("fixture trend headline", summary.headline, 180);
  const copy = buildBbtiAnswerPollTrendCopy(summary, "OAIL", "空间捕食者", "BBTI");
  checkText("fixture trend copy", copy, 760);
  for (const expected of [
    "BBTI 模拟看台趋势",
    "样本：本次作答",
    "顺风",
    "拉锯",
    "逆风",
    REQUIRED_DISCLAIMER,
  ]) {
    if (!copy.includes(expected)) addError(`fixture trend copy missing ${JSON.stringify(expected)}`);
  }
}

if (resolveBbtiAnswerPollTrendSummary([]) !== null) {
  addError("empty trend: expected null summary");
}

console.log("BBTI Answer Poll Trend validation");
console.log(`- contract: ${BBTI_ANSWER_POLL_TREND_VERSION}`);
console.log(`- poll cases: ${pollCases}`);
console.log(`- open question cases: ${openCases}`);
console.log(`- fixture reads: ${reads.length}`);
console.log(`- forbidden terms: ${FORBIDDEN_TERMS.length}`);

if (errors.length) {
  console.error("\nErrors:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("OK: Answer Poll Trend stays local-simulation, answer-history-aware, and copy-safe.");
