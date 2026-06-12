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
const ALLOWED_CASE_SOURCE_VERSIONS = [
  "film-room-v1",
  "arena-event-v1",
  "result-v1",
];
const EXPECTED_REPLAY_SEED_ROWS = ["source-lock", "opening-pressure", "replay-lens"];

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

function assertTruthy(label, value) {
  if (!value) addError(`${label}: expected a non-empty value`);
}

function assertCaseVersion(label, value, expected) {
  assertEqual(`${label} caseVersion`, value.caseVersion, expected);
  assertTruthy(`${label} caseVersion`, value.caseVersion);
  if (value.caseContext) {
    assertEqual(`${label} caseContext caseVersion`, value.caseContext.caseVersion, expected);
  }
}

function assertCaseSourceVersion(label, value, expected) {
  assertEqual(`${label} caseSourceVersion`, value.caseSourceVersion, expected);
  if (expected && !ALLOWED_CASE_SOURCE_VERSIONS.includes(value.caseSourceVersion)) {
    addError(`${label} caseSourceVersion must be one of ${ALLOWED_CASE_SOURCE_VERSIONS.join(", ")}`);
  }
  if (value.caseContext) {
    assertEqual(`${label} caseContext caseSourceVersion`, value.caseContext.caseSourceVersion, expected);
  }
}

function assertCaseRegistryKey(label, actual, expected) {
  assertEqual(`${label} caseRegistryKey`, actual, expected);

  if (!actual) return;
  if (!/^(film-room|arena-event|result):[A-Z]{4}:[a-z0-9-]+(?::[a-z0-9.-]+)?$/.test(actual)) {
    addError(`${label} caseRegistryKey must stay identifier-only, got ${JSON.stringify(actual)}`);
  }

  for (const forbidden of ["录像室", "压力", "球探", "报告", "推荐", " ", "\n"]) {
    if (actual.includes(forbidden)) {
      addError(`${label} caseRegistryKey must not carry prose term ${JSON.stringify(forbidden)}`);
    }
  }
}

function assertReplaySeeds(label, value, expectedSource, expectedCaseSource) {
  assertEqual(`${label} replay seed version`, value.challengeReplaySeeds?.version, "bbti-challenge-replay-seeds-v1");
  assertEqual(`${label} replay seed source`, value.challengeReplaySeeds?.source, expectedSource);
  assertEqual(`${label} replay seed case source`, value.challengeReplaySeeds?.caseSource, expectedCaseSource);
  assertEqual(`${label} replay seed row count`, value.challengeReplaySeeds?.rowCount, 3);
  if (JSON.stringify(value.challengeReplaySeeds?.rows.map((row) => row.id)) !== JSON.stringify(EXPECTED_REPLAY_SEED_ROWS)) {
    addError(`${label} replay seed row order: expected ${EXPECTED_REPLAY_SEED_ROWS.join(",")}, got ${value.challengeReplaySeeds?.rows.map((row) => row.id).join(",")}`);
  }
}

const {
  BBTI_SHARED_CHALLENGE_CASE_VERSION,
  hydrateBbtiSharedChallenge,
} = loadDataModule("src/data/bbti-shared-challenge-hydration.ts");
const {
  getBbtiArenaEvents,
} = loadDataModule("src/data/bbti-arena-events.ts");
const {
  getBbtiChallengeMatchups,
} = loadDataModule("src/data/bbti-challenges.ts");

if (typeof hydrateBbtiSharedChallenge !== "function") {
  addError("hydrateBbtiSharedChallenge must be exported");
}
assertEqual("BBTI shared case version constant", BBTI_SHARED_CHALLENGE_CASE_VERSION, "bbti-case-v1");

const code = "OAIL";
const challenges = getBbtiChallengeMatchups(code);
const challenge = challenges[0];
const event = getBbtiArenaEvents(code)[0];
const eventChallenge = challenges.find((item) => item.category === event?.recommendedCategory);
const mismatchChallenge = challenges.find((item) => event && item.category !== event.recommendedCategory);

if (!challenge) addError(`${code}: expected at least one challenge matchup`);
if (!event) addError(`${code}: expected at least one Arena Event`);
if (!eventChallenge) addError(`${code}: expected an event-matching challenge matchup`);
if (!mismatchChallenge) addError(`${code}: expected a challenge that does not match the event category`);

if (typeof hydrateBbtiSharedChallenge === "function" && challenge && event) {
  const filmRoom = hydrateBbtiSharedChallenge({
    code,
    challengeMatchupId: challenge.matchupId,
    eventId: event.id,
    clipKey: "q12-m0",
  });

  assertEqual("film-room hydration source", filmRoom.caseContext?.source, "film-room");
  assertCaseVersion("film-room hydration", filmRoom, BBTI_SHARED_CHALLENGE_CASE_VERSION);
  assertCaseSourceVersion("film-room hydration", filmRoom, "film-room-v1");
  assertCaseRegistryKey(
    "film-room hydration",
    filmRoom.caseRegistryKey,
    `film-room:${code}:${challenge.matchupId}:q12-m0`,
  );
  assertEqual("film-room hydration sourceLabel", filmRoom.sourceLabel, "录像室案由");
  assertEqual("film-room hydration strips event identity", filmRoom.event, null);
  assertEqual("film-room hydration code", filmRoom.caseContext?.code, code);
  assertEqual("film-room hydration challengeMatchupId", filmRoom.caseContext?.challengeMatchupId, challenge.matchupId);
  assertEqual("film-room hydration clipKey", filmRoom.caseContext?.clipKey, "q12-m0");
  assertEqual("film-room hydration questionId", filmRoom.caseContext?.questionId, 12);
  assertTruthy("film-room hydration dimensionLabel", filmRoom.caseContext?.dimensionLabel);
  assertTruthy("film-room hydration crossExamQuestion", filmRoom.caseContext?.crossExamQuestion);
  assertTruthy("film-room hydration pressureLine", filmRoom.pressureLine);
  assertReplaySeeds("film-room hydration", filmRoom, "shared-return", "film-room");

  if (eventChallenge) {
    const arenaEvent = hydrateBbtiSharedChallenge({
      code,
      challengeMatchupId: eventChallenge.matchupId,
      eventId: event.id,
    });

    assertEqual("arena-event hydration source", arenaEvent.caseContext?.source, "arena-event");
    assertCaseVersion("arena-event hydration", arenaEvent, BBTI_SHARED_CHALLENGE_CASE_VERSION);
    assertCaseSourceVersion("arena-event hydration", arenaEvent, "arena-event-v1");
    assertCaseRegistryKey(
      "arena-event hydration",
      arenaEvent.caseRegistryKey,
      `arena-event:${code}:${event.id}:${eventChallenge.matchupId}`,
    );
    assertEqual("arena-event hydration sourceLabel", arenaEvent.sourceLabel, "情境加赛");
    assertEqual("arena-event hydration event identity", arenaEvent.event?.id, event.id);
    assertEqual("arena-event hydration challengeMatchupId", arenaEvent.caseContext?.challengeMatchupId, eventChallenge.matchupId);
    assertEqual("arena-event hydration pressureLine prefix", arenaEvent.pressureLine?.startsWith("压力测试："), true);
    assertReplaySeeds("arena-event hydration", arenaEvent, "shared-return", "arena-event");
  }

  if (mismatchChallenge) {
    const mismatchedEvent = hydrateBbtiSharedChallenge({
      code,
      challengeMatchupId: mismatchChallenge.matchupId,
      eventId: event.id,
    });

    assertEqual("mismatched event falls back to result source", mismatchedEvent.caseContext?.source, "result");
    assertCaseVersion("mismatched event", mismatchedEvent, BBTI_SHARED_CHALLENGE_CASE_VERSION);
    assertCaseSourceVersion("mismatched event", mismatchedEvent, "result-v1");
    assertCaseRegistryKey(
      "mismatched event",
      mismatchedEvent.caseRegistryKey,
      `result:${code}:${mismatchChallenge.matchupId}`,
    );
    assertEqual("mismatched event keeps event reference for UI context only", mismatchedEvent.event?.id, event.id);
    assertReplaySeeds("mismatched event", mismatchedEvent, "shared-return", "result");
  }

  const questionOnlyClip = hydrateBbtiSharedChallenge({
    code,
    challengeMatchupId: challenge.matchupId,
    clipKey: "q12",
  });
  assertEqual("question-only clip falls back to result source", questionOnlyClip.caseContext?.source, "result");
  assertCaseVersion("question-only clip fallback", questionOnlyClip, BBTI_SHARED_CHALLENGE_CASE_VERSION);
  assertCaseSourceVersion("question-only clip fallback", questionOnlyClip, "result-v1");
  assertCaseRegistryKey(
    "question-only clip fallback",
    questionOnlyClip.caseRegistryKey,
    `result:${code}:${challenge.matchupId}`,
  );
  assertReplaySeeds("question-only clip fallback", questionOnlyClip, "shared-return", "result");

  const invalidClip = hydrateBbtiSharedChallenge({
    code,
    challengeMatchupId: challenge.matchupId,
    clipKey: "q12-z",
  });
  assertEqual("invalid clip falls back to result source", invalidClip.caseContext?.source, "result");
  assertCaseVersion("invalid clip fallback", invalidClip, BBTI_SHARED_CHALLENGE_CASE_VERSION);
  assertCaseSourceVersion("invalid clip fallback", invalidClip, "result-v1");
  assertCaseRegistryKey(
    "invalid clip fallback",
    invalidClip.caseRegistryKey,
    `result:${code}:${challenge.matchupId}`,
  );

  const invalidChallenge = hydrateBbtiSharedChallenge({
    code,
    challengeMatchupId: "not-a-real-matchup",
    eventId: event.id,
    clipKey: "q12-m0",
  });
  assertEqual("invalid challenge has no challenge", invalidChallenge.challenge, null);
  assertEqual("invalid challenge has no case context", invalidChallenge.caseContext, null);
  assertEqual("invalid challenge has no replay seeds", invalidChallenge.challengeReplaySeeds, null);
  assertCaseVersion("invalid challenge", invalidChallenge, BBTI_SHARED_CHALLENGE_CASE_VERSION);
  assertCaseSourceVersion("invalid challenge", invalidChallenge, null);
  assertEqual("invalid challenge has no case registry key", invalidChallenge.caseRegistryKey, null);
}

if (errors.length) {
  console.error("BBTI shared challenge hydration validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI shared challenge hydration validation");
console.log("- film-room hydration cases: 1");
console.log("- arena-event hydration cases: 1");
console.log("- fallback hydration cases: 2");
console.log("- invalid challenge cases: 1");
console.log("- case registry version: bbti-case-v1");
console.log(`- replay seed rows: ${EXPECTED_REPLAY_SEED_ROWS.join(", ")}`);
console.log("OK: shared challenge links hydrate source-aware versioned case context without carrying stale state.");
