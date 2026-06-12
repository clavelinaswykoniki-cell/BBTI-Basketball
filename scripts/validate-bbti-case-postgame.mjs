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
const INTERNAL_CASE_QUERY_PARAMS = [
  "caseVersion",
  "caseSourceVersion",
  "caseRegistryVersion",
  "caseRegistryKey",
  "caseContext",
  "caseCopy",
  "caseText",
  "caseQuestion",
  "cv",
  "evidenceLine",
  "evidenceLens",
  "eventScenario",
  "eventTitle",
  "pressureLine",
  "pressureQuestion",
  "reason",
  "recommendationReason",
  "shareCopy",
  "sourceLabel",
  "sourceId",
  "sourceUrl",
];
const FORBIDDEN_COPY_TERMS = [
  "VAR",
  "点球",
  "德比",
  "FUT",
  "足球",
  "官方",
  "官方认证",
  "公认第一",
  "唯一",
  "碾压",
  "真实热度",
  "实时热度",
  "全网",
  "用户投票",
  "播放量",
  "热搜",
  "多数球迷",
  "大家都选",
  "sourceUrl",
  "sourceId",
];
const EXPECTED_SOURCE_META = {
  "arena-event": {
    badge: "Arena Event",
    sourceVersion: "arena-event-v1",
  },
  "film-room": {
    badge: "Film Room",
    sourceVersion: "film-room-v1",
  },
  result: {
    badge: "Result Case",
    sourceVersion: "result-v1",
  },
};
const EXPECTED_CODES = ["O", "D"].flatMap((style) =>
  ["A", "E"].flatMap((evidence) =>
    ["I", "T"].flatMap((role) => ["L", "R"].map((ambition) => `${style}${evidence}${role}${ambition}`)),
  ),
);

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

function assertCopyBoundaries(label, recap) {
  const text = [
    recap.sourceMeta?.badge,
    recap.sourceMeta?.title,
    recap.sourceMeta?.origin,
    recap.sourceMeta?.bodyLabel,
    recap.sourceMeta?.body,
    recap.scoreLine,
    recap.selectedSideName,
    recap.winnerName,
    recap.caseReason,
    recap.sessionBoundary,
    recap.copyText,
    ...(recap.evidenceLens ?? []),
  ].filter(Boolean).join("\n");

  for (const term of FORBIDDEN_COPY_TERMS) {
    assertNotIncludes(`${label} forbidden copy term`, text, term);
  }
}

function assertShortCaseReturnUrl(label, context, url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    addError(`${label}: return URL must be a valid URL, got ${JSON.stringify(url)}`);
    return;
  }

  assertEqual(`${label} return bbti`, parsed.searchParams.get("bbti"), context.code);
  assertEqual(`${label} return challenge`, parsed.searchParams.get("challenge"), context.challengeMatchupId);
  assertEqual(`${label} return event`, parsed.searchParams.get("event"), context.source === "arena-event" ? context.eventId : null);
  assertEqual(`${label} return clip`, parsed.searchParams.get("clip"), context.source === "film-room" ? context.clipKey : null);

  for (const key of INTERNAL_CASE_QUERY_PARAMS) {
    if (parsed.searchParams.has(key)) {
      addError(`${label}: return URL must not include internal case param ${JSON.stringify(key)}`);
    }
  }
  for (const forbidden of ["录像室", "推荐理由", "赛事情境", "案由", "审查标准", "bbti-case-v1"]) {
    assertNotIncludes(`${label} return URL prose`, url, forbidden);
  }
}

function assertRecap(label, context, recap) {
  const expectedMeta = EXPECTED_SOURCE_META[context.source];
  assertTruthy(`${label} recap`, recap);
  assertEqual(`${label} postgame version`, recap.postgameVersion, "bbti-case-postgame-v1");
  assertEqual(`${label} source`, recap.source, context.source);
  assertEqual(`${label} case version`, recap.caseVersion, "bbti-case-v1");
  assertEqual(`${label} case source version`, recap.caseSourceVersion, expectedMeta.sourceVersion);
  assertEqual(`${label} source badge`, recap.sourceMeta?.badge, expectedMeta.badge);
  assertEqual(`${label} code`, recap.code, context.code);
  assertEqual(`${label} matchup`, recap.challengeMatchupId, context.challengeMatchupId);
  assertEqual(`${label} score qa`, recap.scoreQa, "2-1");
  assertIncludes(`${label} score line`, recap.scoreLine, "2 : 1");
  assertIncludes(`${label} selected side`, recap.selectedSideName, "Kobe");
  assertIncludes(`${label} winner`, recap.winnerName, "Kobe");
  assertIncludes(`${label} copy score`, recap.copyText, "赛后比分：Kobe 2 : 1 LeBron");
  assertIncludes(`${label} copy selected`, recap.copyText, "我的站队：Kobe");
  assertIncludes(`${label} copy winner`, recap.copyText, "赛后判定：Kobe 胜出");
  assertIncludes(`${label} copy replay`, recap.copyText, "同场复盘：https://bbti.test/replay?matchup=case-postgame");
  assertIncludes(`${label} copy return`, recap.copyText, "案件回流：");
  assertIncludes(`${label} copy boundary`, recap.copyText, "不代表真实胜率或外部排名");
  assertEqual(`${label} lens cap`, recap.evidenceLens.length <= 5, true);
  assertEqual(`${label} replay index version`, recap.replayIndex?.version, "bbti-case-postgame-replay-index-v1");
  assertEqual(`${label} replay index source`, recap.replayIndex?.source, context.source);
  assertEqual(`${label} replay index source version`, recap.replayIndex?.caseSourceVersion, expectedMeta.sourceVersion);
  assertEqual(`${label} replay index count`, recap.replayIndex?.itemCount, 4);
  assertEqual(`${label} replay index row ids`, recap.replayIndex?.items?.map((item) => item.id).join(","), "coach-challenge,case-source,session-verdict,return-link");
  assertEqual(`${label} replay index targets`, recap.replayIndex?.items?.map((item) => item.target).join(","), "replay,case-source,verdict,bbti-result");
  assertEqual(`${label} replay index replay href`, recap.replayIndex?.items?.[0]?.href, recap.replayUrl);
  assertEqual(`${label} replay index return href`, recap.replayIndex?.items?.[3]?.href, recap.caseReturnUrl);
  assertIncludes(`${label} replay index boundary`, recap.replayIndex?.items?.[3]?.body, "不代表真实胜率或外部排名");
  assertShortCaseReturnUrl(label, context, recap.caseReturnUrl);
  assertCopyBoundaries(label, recap);
}

const {
  BBTI_CASE_POSTGAME_REPLAY_INDEX_VERSION,
  BBTI_CASE_POSTGAME_SESSION_BOUNDARY,
  BBTI_CASE_POSTGAME_VERSION,
  buildBbtiCasePostgameCopy,
  resolveBbtiCaseReplayIndex,
  resolveBbtiCasePostgameRecap,
  resolveBbtiCasePostgameSourceMeta,
} = loadDataModule("src/data/bbti-case-postgame.ts");
const {
  buildBbtiCaseReturnUrl,
} = loadDataModule("src/lib/bbti-deep-links.ts");
const {
  hydrateBbtiSharedChallenge,
} = loadDataModule("src/data/bbti-shared-challenge-hydration.ts");
const {
  getBbtiArenaEvents,
} = loadDataModule("src/data/bbti-arena-events.ts");
const {
  getBbtiChallengeMatchups,
} = loadDataModule("src/data/bbti-challenges.ts");

assertEqual("BBTI case postgame version", BBTI_CASE_POSTGAME_VERSION, "bbti-case-postgame-v1");
assertEqual("BBTI case postgame replay index version", BBTI_CASE_POSTGAME_REPLAY_INDEX_VERSION, "bbti-case-postgame-replay-index-v1");
assertEqual("BBTI case postgame boundary", BBTI_CASE_POSTGAME_SESSION_BOUNDARY, "仅记录本次会话复盘，不代表真实胜率或外部排名。");

for (const [name, fn] of [
  ["buildBbtiCasePostgameCopy", buildBbtiCasePostgameCopy],
  ["resolveBbtiCaseReplayIndex", resolveBbtiCaseReplayIndex],
  ["resolveBbtiCasePostgameRecap", resolveBbtiCasePostgameRecap],
  ["resolveBbtiCasePostgameSourceMeta", resolveBbtiCasePostgameSourceMeta],
]) {
  if (typeof fn !== "function") addError(`${name} must be exported`);
}

const code = "OAIL";
const challenges = getBbtiChallengeMatchups(code);
const events = getBbtiArenaEvents(code);
const filmChallenge = challenges.find((challenge) => challenge.matchupId === "kobe-vs-jordan") ?? challenges[0];
const event = events.find((item) => item.id === "game-7") ?? events[0];
const arenaChallenge = challenges.find((challenge) => challenge.category === event?.recommendedCategory) ?? challenges[0];

if (!filmChallenge) addError("expected an OAIL challenge for postgame validation");
if (!event) addError("expected an OAIL arena event for postgame validation");
if (!arenaChallenge) addError("expected an arena-matching challenge for postgame validation");

if (
  typeof hydrateBbtiSharedChallenge === "function"
  && typeof buildBbtiCaseReturnUrl === "function"
  && typeof resolveBbtiCasePostgameRecap === "function"
  && filmChallenge
  && event
  && arenaChallenge
) {
  const sharedCases = [
    hydrateBbtiSharedChallenge({
      code,
      challengeMatchupId: filmChallenge.matchupId,
      eventId: event.id,
      clipKey: "q12-m0",
    }).caseContext,
    hydrateBbtiSharedChallenge({
      code,
      challengeMatchupId: filmChallenge.matchupId,
    }).caseContext,
    hydrateBbtiSharedChallenge({
      code,
      challengeMatchupId: arenaChallenge.matchupId,
      eventId: event.id,
    }).caseContext,
  ].filter(Boolean);

  for (const context of sharedCases) {
    const caseReturnUrl = buildBbtiCaseReturnUrl(
      context,
      "https://bbti.test/result?caseCopy=too-heavy&sourceUrl=https%3A%2F%2Fexample.test&mode=legacy",
    );
    const recap = resolveBbtiCasePostgameRecap({
      context,
      playerAName: "Kobe",
      playerBName: "LeBron",
      kobeScore: 2,
      lebronScore: 1,
      selectedSideName: "Kobe",
      winnerName: "Kobe 胜出",
      replayUrl: "https://bbti.test/replay?matchup=case-postgame",
      caseReturnUrl,
    });

    assertRecap(context.source, context, recap);
  }

  for (const codeUnderTest of EXPECTED_CODES) {
    for (const challenge of getBbtiChallengeMatchups(codeUnderTest)) {
      const context = hydrateBbtiSharedChallenge({
        code: codeUnderTest,
        challengeMatchupId: challenge.matchupId,
      }).caseContext;
      if (!context) {
        addError(`${codeUnderTest} ${challenge.matchupId}: expected result case context`);
        continue;
      }
      const recap = resolveBbtiCasePostgameRecap({
        context,
        playerAName: "Kobe",
        playerBName: "LeBron",
        kobeScore: 2,
        lebronScore: 1,
        selectedSideName: "Kobe",
        winnerName: "Kobe 胜出",
        replayUrl: "https://bbti.test/replay?matchup=case-postgame",
        caseReturnUrl: buildBbtiCaseReturnUrl(context, "https://bbti.test/result"),
      });

      assertCopyBoundaries(`${codeUnderTest} ${challenge.matchupId}`, recap);
      assertShortCaseReturnUrl(`${codeUnderTest} ${challenge.matchupId}`, context, recap.caseReturnUrl);
      assertEqual(`${codeUnderTest} ${challenge.matchupId} replay index count`, recap.replayIndex?.itemCount, 4);
    }
  }
}

if (errors.length) {
  console.error("BBTI case postgame validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI case postgame validation");
console.log("- Contract: bbti-case-postgame-v1 with all three source versions");
console.log("- Replay index: bbti-case-postgame-replay-index-v1 with four ordered rows");
console.log("- Copy: session-local score, selected side, winner, replay, return URL, and boundary");
console.log("- URL: short bbti/challenge/event/clip schema with internal case params stripped");
console.log("- Boundaries: no football, official-source, real-heat, real-poll, or hard-verdict copy");
console.log("OK: case postgame recap contract is stable.");
