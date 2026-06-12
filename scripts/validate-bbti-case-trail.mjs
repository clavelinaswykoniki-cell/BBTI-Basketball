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
  "真实热度",
  "用户投票",
  "全网",
  "播放量",
  "热搜",
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

function assertTruthy(label, value) {
  if (!value) addError(`${label}: expected a non-empty value`);
}

function assertCopyBoundaries(label, trail) {
  const text = [
    trail?.sourceLabel,
    trail?.sourceDetail,
    trail?.title,
    trail?.standardLabel,
    trail?.standard,
    trail?.reviewQuestion,
    trail?.progressLabel,
    trail?.copyText,
    ...(trail?.steps ?? []).flatMap((step) => [
      step.roundLabel,
      step.topicTitle,
      step.selectedSideName,
      step.responseLine,
    ]),
  ].filter(Boolean).join("\n");

  for (const term of FORBIDDEN_COPY_TERMS) {
    assertNotIncludes(`${label} forbidden term`, text, term);
  }
}

const {
  resolveBbtiChallengeCaseTrail,
} = loadDataModule("src/data/bbti-challenge-case-trail.ts");
const {
  hydrateBbtiSharedChallenge,
} = loadDataModule("src/data/bbti-shared-challenge-hydration.ts");
const {
  getBbtiArenaEvents,
} = loadDataModule("src/data/bbti-arena-events.ts");
const {
  getBbtiChallengeMatchups,
} = loadDataModule("src/data/bbti-challenges.ts");

if (typeof resolveBbtiChallengeCaseTrail !== "function") {
  addError("resolveBbtiChallengeCaseTrail must be exported");
}

const topics = [
  {
    id: "rings",
    title: "冠军戒指",
    emoji: "💍",
    kobe: { claim: "A", points: [], punchline: "A" },
    lebron: { claim: "B", points: [], punchline: "B" },
  },
  {
    id: "clutch",
    title: "最后两分钟",
    emoji: "🗡️",
    kobe: { claim: "A", points: [], punchline: "A" },
    lebron: { claim: "B", points: [], punchline: "B" },
  },
  {
    id: "defense",
    title: "防守回合",
    emoji: "🛡️",
    kobe: { claim: "A", points: [], punchline: "A" },
    lebron: { claim: "B", points: [], punchline: "B" },
  },
];

const code = "OAIL";
const challenges = getBbtiChallengeMatchups(code);
const challenge = challenges[0];
const event = getBbtiArenaEvents(code)[0];
const eventChallenge = challenges.find((item) => item.category === event?.recommendedCategory);

if (!challenge) addError(`${code}: expected a challenge matchup`);
if (!event) addError(`${code}: expected an Arena Event`);
if (!eventChallenge) addError(`${code}: expected an event-matching challenge matchup`);

if (
  typeof resolveBbtiChallengeCaseTrail === "function"
  && typeof hydrateBbtiSharedChallenge === "function"
  && challenge
  && event
  && eventChallenge
) {
  const noContext = resolveBbtiChallengeCaseTrail({
    context: null,
    currentRound: 0,
    nameA: "科比",
    nameB: "乔丹",
    topics,
    votes: [],
  });
  assertEqual("no context trail", noContext, null);

  const filmRoom = hydrateBbtiSharedChallenge({
    code,
    challengeMatchupId: challenge.matchupId,
    eventId: event.id,
    clipKey: "q12-m0",
  });
  const filmRoomTrail = resolveBbtiChallengeCaseTrail({
    context: filmRoom.caseContext,
    currentRound: 1,
    nameA: "科比",
    nameB: "乔丹",
    topics,
    votes: [{ topicId: "rings", winner: "kobe" }],
  });

  assertTruthy("film-room trail", filmRoomTrail);
  assertEqual("film-room trail version", filmRoomTrail?.caseVersion, "bbti-case-v1");
  assertEqual("film-room trail source version", filmRoomTrail?.caseSourceVersion, "film-room-v1");
  assertEqual("film-room trail source label", filmRoomTrail?.sourceLabel, "录像室案由");
  assertEqual("film-room trail progress", filmRoomTrail?.progressLabel, "1/3 回合已回应");
  assertEqual("film-room first step state", filmRoomTrail?.steps[0]?.state, "completed");
  assertEqual("film-room second step state", filmRoomTrail?.steps[1]?.state, "current");
  assertEqual("film-room third step state", filmRoomTrail?.steps[2]?.state, "upcoming");
  assertIncludes("film-room completed response", filmRoomTrail?.steps[0]?.responseLine, "科比");
  assertIncludes("film-room copy text", filmRoomTrail?.copyText, "bbti-case-v1");
  assertCopyBoundaries("film-room trail", filmRoomTrail);

  const filmRoomAfterVoteTrail = resolveBbtiChallengeCaseTrail({
    context: filmRoom.caseContext,
    currentRound: 0,
    nameA: "科比",
    nameB: "乔丹",
    topics,
    votes: [{ topicId: "rings", winner: "kobe" }],
  });

  assertEqual("film-room after-vote first step state", filmRoomAfterVoteTrail?.steps[0]?.state, "completed");
  assertEqual("film-room after-vote next step state", filmRoomAfterVoteTrail?.steps[1]?.state, "current");
  assertIncludes("film-room after-vote next response", filmRoomAfterVoteTrail?.steps[1]?.responseLine, "当前回合");

  const arenaEvent = hydrateBbtiSharedChallenge({
    code,
    challengeMatchupId: eventChallenge.matchupId,
    eventId: event.id,
  });
  const arenaTrail = resolveBbtiChallengeCaseTrail({
    context: arenaEvent.caseContext,
    currentRound: 0,
    nameA: "勒布朗",
    nameB: "乔丹",
    topics,
    votes: [],
  });

  assertEqual("arena trail source version", arenaTrail?.caseSourceVersion, "arena-event-v1");
  assertEqual("arena trail source label", arenaTrail?.sourceLabel, "情境加赛");
  assertIncludes("arena trail source detail", arenaTrail?.sourceDetail, event.tag);
  assertCopyBoundaries("arena trail", arenaTrail);

  const result = hydrateBbtiSharedChallenge({
    code,
    challengeMatchupId: challenge.matchupId,
  });
  const resultTrail = resolveBbtiChallengeCaseTrail({
    context: result.caseContext,
    currentRound: 5,
    nameA: "科比",
    nameB: "乔丹",
    topics,
    votes: [
      { topicId: "rings", winner: "kobe" },
      { topicId: "clutch", winner: "lebron" },
      { topicId: "defense", winner: "kobe" },
    ],
  });

  assertEqual("result trail source version", resultTrail?.caseSourceVersion, "result-v1");
  assertEqual("result trail source label", resultTrail?.sourceLabel, "赛后报告");
  assertEqual("result trail progress", resultTrail?.progressLabel, "3/3 回合已回应");
  assertEqual("result trail last step state", resultTrail?.steps[2]?.state, "completed");
  assertCopyBoundaries("result trail", resultTrail);
}

if (errors.length) {
  console.error("BBTI case trail validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI case trail validation");
console.log("- source trail cases: 3");
console.log("- null-context cases: 1");
console.log(`- forbidden copy terms: ${FORBIDDEN_COPY_TERMS.length}`);
console.log("OK: Case Trail stays session-local, source-aware, and basketball-native.");
