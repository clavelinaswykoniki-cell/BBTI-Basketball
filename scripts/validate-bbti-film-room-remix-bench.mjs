#!/usr/bin/env node
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const nodeRequire = createRequire(path.join(ROOT, "package.json"));
const runtimeModuleCache = new Map();
const errors = [];

const EXPECTED_ROWS = ["clip-read", "drill-card", "poll-read"];
const EXPECTED_TARGETS = ["clip", "drill", "poll"];
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

function assertIncludes(label, source, expected) {
  if (!source.includes(expected)) {
    addError(`${label}: missing ${JSON.stringify(expected)}`);
  }
}

function assertEqual(label, actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    addError(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function checkText(label, value, maxLength = 220) {
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
}

const {
  buildSharedFilmRoomClipFromKey,
  getBbtiFilmRoomDimensionLabel,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-playbook.ts"));
const {
  getBbtiFilmRoomCrossExam,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-film-room-cross-exams.ts"));
const {
  resolveBbtiFilmRoomDrill,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-film-room-drills.ts"));
const {
  BBTI_FILM_ROOM_REMIX_BENCH_BOUNDARY,
  BBTI_FILM_ROOM_REMIX_BENCH_VERSION,
  buildBbtiFilmRoomRemixBenchCopy,
  resolveBbtiFilmRoomRemixBench,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-film-room-remix-bench.ts"));

if (BBTI_FILM_ROOM_REMIX_BENCH_VERSION !== "bbti-film-room-remix-bench-v1") {
  addError(`wrong remix bench version ${JSON.stringify(BBTI_FILM_ROOM_REMIX_BENCH_VERSION)}`);
}
if (!BBTI_FILM_ROOM_REMIX_BENCH_BOUNDARY?.includes("本地录像室回看替补席")) {
  addError("remix bench boundary must mark the feature as local");
}

const trend = {
  average: 63,
  label: "顺风主场",
  readCount: 8,
  strongestQuestionId: 12,
  tone: "模拟顺风",
  toughestQuestionId: 22,
};
let benchCount = 0;

for (const fixture of [
  { clipKey: "q12-m0", source: "local-answer-history", trend, isSharedClipMode: false },
  { clipKey: "q3-a", source: "shared-clip", trend: null, isSharedClipMode: true },
  { clipKey: "q13-b", source: "local-fallback", trend: null, isSharedClipMode: false },
]) {
  const clip = buildSharedFilmRoomClipFromKey(fixture.clipKey);
  if (!clip) {
    addError(`${fixture.clipKey}: expected a fixture clip`);
    continue;
  }
  const crossExam = getBbtiFilmRoomCrossExam(clip);
  const dimensionLabel = getBbtiFilmRoomDimensionLabel(clip.dimension);
  const drill = resolveBbtiFilmRoomDrill({ clip, crossExam, dimensionLabel });
  const bench = resolveBbtiFilmRoomRemixBench({
    activeClipNo: 1,
    answerText: clip.answerText,
    clipCount: 3,
    clipTitle: clip.coachTimeout.title,
    code: "OAIL",
    dimensionLabel,
    drillStepCount: drill.steps.length,
    drillTitle: drill.title,
    isSharedClipMode: fixture.isSharedClipMode,
    questionId: clip.questionId,
    trend: fixture.trend,
  });
  benchCount += 1;

  assertEqual(`${fixture.clipKey} version`, bench.version, BBTI_FILM_ROOM_REMIX_BENCH_VERSION);
  assertEqual(`${fixture.clipKey} source`, bench.source, fixture.source);
  assertEqual(`${fixture.clipKey} row count`, bench.rowCount, 3);
  assertEqual(`${fixture.clipKey} row order`, bench.rows.map((row) => row.id), EXPECTED_ROWS);
  assertEqual(`${fixture.clipKey} target order`, bench.rows.map((row) => row.target), EXPECTED_TARGETS);
  assertEqual(`${fixture.clipKey} active question`, bench.activeQuestionId, clip.questionId);
  checkText(`${fixture.clipKey}.boundary`, bench.boundary);

  for (const row of bench.rows) {
    checkText(`${fixture.clipKey}.${row.id}.title`, row.title, 48);
    checkText(`${fixture.clipKey}.${row.id}.body`, row.body, 180);
    checkText(`${fixture.clipKey}.${row.id}.meta`, row.meta, 36);
  }

  const copy = buildBbtiFilmRoomRemixBenchCopy(bench);
  checkText(`${fixture.clipKey}.copy`, copy, 820);
  for (const expected of [
    "BBTI 录像室回看替补席",
    `Q${clip.questionId}`,
    BBTI_FILM_ROOM_REMIX_BENCH_BOUNDARY,
  ]) {
    if (!copy.includes(expected)) addError(`${fixture.clipKey}.copy missing ${JSON.stringify(expected)}`);
  }
}

const component = read("src/components/BbtiFilmRoomRemixBench.tsx");
for (const expected of [
  'data-testid="bbti-film-room-remix-bench"',
  "data-bbti-film-room-remix-version={bench.version}",
  "data-bbti-film-room-remix-source={bench.source}",
  "data-bbti-film-room-remix-code={bench.code}",
  "data-bbti-film-room-remix-question={bench.activeQuestionId}",
  "data-bbti-film-room-remix-count={bench.rowCount}",
  'data-testid="bbti-film-room-remix-row"',
  "data-bbti-film-room-remix-row={row.id}",
  "data-bbti-film-room-remix-position={index + 1}",
  "data-bbti-film-room-remix-target={row.target}",
  'data-testid="bbti-film-room-remix-copy"',
  'data-bbti-film-room-remix-action="copy-bench"',
  'data-testid="bbti-film-room-remix-boundary"',
]) {
  assertIncludes("BbtiFilmRoomRemixBench selectors", component, expected);
}

const filmRoomClips = read("src/components/BbtiFilmRoomClips.tsx");
assertIncludes("Film Room Clips mounts remix bench", filmRoomClips, "BbtiFilmRoomRemixBench");
assertIncludes("Film Room Clips passes trend", filmRoomClips, "trendSummary");

const fixtureRenderer = read("scripts/render-bbti-visual-qa-fixtures.mjs");
for (const expected of [
  '"film-room-remix-bench"',
  '[data-testid="bbti-film-room-remix-bench"]',
  'data-bbti-film-room-remix-version="bbti-film-room-remix-bench-v1"',
  'data-bbti-film-room-remix-row="clip-read"',
  'data-bbti-film-room-remix-row="drill-card"',
  'data-bbti-film-room-remix-row="poll-read"',
]) {
  assertIncludes("visual fixture remix bench coverage", fixtureRenderer, expected);
}

const factRules = read("docs/BBTI_FACT_RULES.md");
assertIncludes("fact rules remix bench boundary", factRules, "bbti-film-room-remix-bench-v1");
const roadmap = read("docs/BBTI_ADD_FILES_ROADMAP.md");
assertIncludes("roadmap remix bench shipped note", roadmap, "bbti-film-room-remix-bench-v1");

if (errors.length) {
  console.error("BBTI Film Room Remix Bench validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI Film Room Remix Bench validation");
console.log(`- contract: ${BBTI_FILM_ROOM_REMIX_BENCH_VERSION}`);
console.log(`- bench cases: ${benchCount}`);
console.log(`- rows: ${EXPECTED_ROWS.join(", ")}`);
console.log("OK: Film Room remix bench stays local, compact, and selector-backed.");
