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
  "唯一",
  "碾压",
  "公认第一",
  "官方认证",
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

function assertArrayIncludes(label, values, expected) {
  if (!values.includes(expected)) {
    addError(`${label}: expected ${JSON.stringify(values)} to include ${JSON.stringify(expected)}`);
  }
}

function assertNonEmptyArray(label, values) {
  if (!Array.isArray(values) || values.length === 0) {
    addError(`${label}: expected a non-empty array`);
  }
}

function assertDistinct(label, values) {
  if (new Set(values).size !== values.length) {
    addError(`${label}: expected distinct values, got ${JSON.stringify(values)}`);
  }
}

function promptText(prompt) {
  return [
    prompt.collapsedDescription,
    prompt.ctaLabel,
    prompt.description,
    prompt.previewLabel,
    ...prompt.metaChips,
    ...prompt.evidenceChips,
    ...prompt.previewLines,
  ].join("\n");
}

function assertCopyBoundaries(label, prompt) {
  const text = promptText(prompt);

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

const {
  resolveBbtiShareReturnPrompt,
} = loadDataModule("src/data/bbti-share-return-prompts.ts");
const {
  hydrateBbtiSharedChallenge,
} = loadDataModule("src/data/bbti-shared-challenge-hydration.ts");
const {
  getBbtiArenaEvents,
} = loadDataModule("src/data/bbti-arena-events.ts");
const {
  getBbtiChallengeMatchups,
} = loadDataModule("src/data/bbti-challenges.ts");

if (typeof resolveBbtiShareReturnPrompt !== "function") {
  addError("resolveBbtiShareReturnPrompt must be exported");
}

const code = "OAIL";
const challenges = getBbtiChallengeMatchups(code);
const event = getBbtiArenaEvents(code)[0];
const resultChallenge = challenges[0];
const eventChallenge = challenges.find((challenge) => challenge.category === event?.recommendedCategory);

if (!resultChallenge) addError(`${code}: missing result challenge`);
if (!event) addError(`${code}: missing Arena Event`);
if (!eventChallenge) addError(`${code}: missing challenge matching event recommendation`);

if (
  typeof resolveBbtiShareReturnPrompt === "function"
  && typeof hydrateBbtiSharedChallenge === "function"
  && resultChallenge
  && event
  && eventChallenge
) {
  const filmRoomContext = hydrateBbtiSharedChallenge({
    code,
    challengeMatchupId: resultChallenge.matchupId,
    eventId: event.id,
    clipKey: "q12-m0",
  });
  const filmRoomCaseContext = filmRoomContext.caseContext;
  const filmRoomPrompt = resolveBbtiShareReturnPrompt(filmRoomCaseContext, event.title);

  assertEqual("film-room source", filmRoomCaseContext?.source, "film-room");
  assertEqual("film-room sourceLabel", filmRoomContext.sourceLabel, "录像室案由");
  assertIncludes("film-room pressureLine", filmRoomContext.pressureLine, "录像室追问：");
  assertEqual("film-room cta", filmRoomPrompt.ctaLabel, "用录像室案由接加赛");
  assertEqual("film-room preview label", filmRoomPrompt.previewLabel, "录像室案由预览");
  assertIncludes("film-room description restores only one clip", filmRoomPrompt.description, "只复原 Q12");
  assertIncludes("film-room description blocks full-answer claim", filmRoomPrompt.description, "不恢复对方完整答卷");
  assertIncludes("film-room description blocks external-heat data", filmRoomPrompt.description, "不携带任何外部热度数据");
  assertArrayIncludes("film-room meta chips", filmRoomPrompt.metaChips, "Q12");
  assertArrayIncludes("film-room preview lines", filmRoomPrompt.previewLines, "Q12｜攻防取向");
  assertNonEmptyArray("film-room evidence chips", filmRoomPrompt.evidenceChips);
  assertCopyBoundaries("film-room prompt", filmRoomPrompt);

  const arenaContext = hydrateBbtiSharedChallenge({
    code,
    challengeMatchupId: eventChallenge.matchupId,
    eventId: event.id,
  });
  const arenaCaseContext = arenaContext.caseContext;
  const arenaPrompt = resolveBbtiShareReturnPrompt(arenaCaseContext, event.title);

  assertEqual("arena challenge category", eventChallenge.category, event.recommendedCategory);
  assertEqual("arena source", arenaCaseContext?.source, "arena-event");
  assertEqual("arena sourceLabel", arenaContext.sourceLabel, "情境加赛");
  assertIncludes("arena pressureLine", arenaContext.pressureLine, "压力测试：");
  assertEqual("arena cta", arenaPrompt.ctaLabel, "接这场情境加赛");
  assertEqual("arena preview label", arenaPrompt.previewLabel, "情境案由预览");
  assertIncludes("arena description uses event title", arenaPrompt.description, event.title);
  assertArrayIncludes("arena meta chips", arenaPrompt.metaChips, event.tag);
  assertArrayIncludes("arena preview lines", arenaPrompt.previewLines, event.scenario);
  assertNonEmptyArray("arena evidence chips", arenaPrompt.evidenceChips);
  assertCopyBoundaries("arena prompt", arenaPrompt);

  const resultContext = hydrateBbtiSharedChallenge({
    code,
    challengeMatchupId: resultChallenge.matchupId,
  });
  const resultCaseContext = resultContext.caseContext;
  const resultPrompt = resolveBbtiShareReturnPrompt(resultCaseContext, null);

  assertEqual("result source", resultCaseContext?.source, "result");
  assertEqual("result sourceLabel", resultContext.sourceLabel, "赛后约战");
  assertIncludes("result pressureLine", resultContext.pressureLine, "压力题：");
  assertEqual("result cta", resultPrompt.ctaLabel, "接赛后约战");
  assertEqual("result preview label", resultPrompt.previewLabel, "案由预览");
  assertIncludes("result description uses code", resultPrompt.description, code);
  assertArrayIncludes("result meta chips", resultPrompt.metaChips, "赛后推荐");
  assertNonEmptyArray("result evidence chips", resultPrompt.evidenceChips);
  assertCopyBoundaries("result prompt", resultPrompt);

  const plainPrompt = resolveBbtiShareReturnPrompt(null, null);
  assertEqual("plain cta", plainPrompt.ctaLabel, "进入普通约战");
  assertEqual("plain preview label", plainPrompt.previewLabel, "案由预览");
  assertEqual("plain preview lines length", plainPrompt.previewLines.length, 0);
  assertEqual("plain meta chips length", plainPrompt.metaChips.length, 0);
  assertEqual("plain evidence chips length", plainPrompt.evidenceChips.length, 0);
  assertCopyBoundaries("plain prompt", plainPrompt);

  assertDistinct("source descriptions", [
    filmRoomPrompt.description,
    arenaPrompt.description,
    resultPrompt.description,
    plainPrompt.description,
  ]);
  assertDistinct("source cta labels", [
    filmRoomPrompt.ctaLabel,
    arenaPrompt.ctaLabel,
    resultPrompt.ctaLabel,
    plainPrompt.ctaLabel,
  ]);
  assertDistinct("source preview labels", [
    filmRoomPrompt.previewLabel,
    arenaPrompt.previewLabel,
    resultPrompt.previewLabel,
  ]);
}

if (errors.length) {
  console.error("BBTI share return prompt validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI share return prompt validation");
console.log("- source prompt cases: 4");
console.log(`- forbidden copy terms: ${FORBIDDEN_COPY_TERMS.length}`);
console.log(`- heat boundary terms: ${HEAT_TERMS.length}`);
console.log("OK: Film Room, Arena Event, Result, and plain return prompts stay source-aware and boundary-safe.");
