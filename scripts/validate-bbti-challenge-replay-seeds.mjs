#!/usr/bin/env node
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const nodeRequire = createRequire(path.join(ROOT, "package.json"));
const runtimeModuleCache = new Map();
const errors = [];

const EXPECTED_ROWS = ["source-lock", "opening-pressure", "replay-lens"];
const EXPECTED_TARGETS = ["return", "case", "replay"];
const FORBIDDEN_TERMS = [
  "FBTI",
  "football",
  "soccer",
  "足球",
  "梅西",
  "C罗",
  "VAR",
  "FUT",
  "点球",
  "德比",
  "懂球帝",
  "虎扑",
  "football-mbti",
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

function assertEqual(label, actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    addError(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertIncludes(label, source, expected) {
  if (!source.includes(expected)) {
    addError(`${label}: missing ${JSON.stringify(expected)}`);
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
  buildBbtiArenaEventChallengeCaseContext,
  buildBbtiChallengeCaseContext,
  buildBbtiResultChallengeCaseContext,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-challenge-case.ts"));
const {
  BBTI_CHALLENGE_REPLAY_SEEDS_BOUNDARY,
  BBTI_CHALLENGE_REPLAY_SEEDS_VERSION,
  buildBbtiChallengeReplaySeedsCopy,
  resolveBbtiChallengeReplaySeeds,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-challenge-replay-seeds.ts"));
const {
  getBbtiArenaEvents,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-arena-events.ts"));
const {
  getBbtiChallengeMatchups,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-challenges.ts"));
const {
  getBbtiType,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti.ts"));
const {
  getBbtiFilmRoomCrossExam,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-film-room-cross-exams.ts"));
const {
  buildSharedFilmRoomClipFromKey,
  getBbtiFilmRoomDimensionLabel,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-playbook.ts"));
const {
  hydrateBbtiSharedChallenge,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-shared-challenge-hydration.ts"));

if (BBTI_CHALLENGE_REPLAY_SEEDS_VERSION !== "bbti-challenge-replay-seeds-v1") {
  addError(`wrong challenge replay seeds version ${JSON.stringify(BBTI_CHALLENGE_REPLAY_SEEDS_VERSION)}`);
}
if (!BBTI_CHALLENGE_REPLAY_SEEDS_BOUNDARY?.includes("本地开庭种子")) {
  addError("challenge replay seeds boundary must mark the feature as local");
}

const code = "OAIL";
const type = getBbtiType(code);
const challenges = getBbtiChallengeMatchups(code);
const challenge = challenges[0];
const event = getBbtiArenaEvents(code)[0];
const eventChallenge = challenges.find((item) => item.category === event?.recommendedCategory) ?? challenge;
const clip = buildSharedFilmRoomClipFromKey("q12-m0");

if (!type) addError(`${code}: expected a BBTI type`);
if (!challenge) addError(`${code}: expected at least one challenge matchup`);
if (!event) addError(`${code}: expected at least one Arena Event`);
if (!clip) addError("expected shared Film Room clip q12-m0");

const cases = [];
if (type && challenge) {
  const resultContext = buildBbtiResultChallengeCaseContext({
    challenge,
    code,
    emoji: type.emoji,
    typeName: type.name,
  });
  cases.push({
    label: "result-card",
    expectedCaseSource: "result",
    expectedSource: "result-card",
    seeds: resolveBbtiChallengeReplaySeeds({
      caseContext: resultContext,
      challengeCategory: challenge.category,
      challengeLabel: challenge.label,
      challengeMatchupId: challenge.matchupId,
      challengeTitle: challenge.title,
      code,
      pressureLine: resultContext.caseQuestion,
      returnHref: "https://bbti.test/?bbti=OAIL&challenge=kobe-vs-jordan",
      source: "result-card",
    }),
  });
}

if (type && challenge && clip) {
  const filmContext = buildBbtiChallengeCaseContext({
    challenge,
    clip,
    code,
    dimensionLabel: getBbtiFilmRoomDimensionLabel(clip.dimension),
    crossExam: getBbtiFilmRoomCrossExam(clip),
    emoji: type.emoji,
    typeName: type.name,
  });
  cases.push({
    label: "shared-film-room",
    expectedCaseSource: "film-room",
    expectedSource: "shared-return",
    seeds: resolveBbtiChallengeReplaySeeds({
      caseContext: filmContext,
      challengeCategory: challenge.category,
      challengeLabel: challenge.label,
      challengeMatchupId: challenge.matchupId,
      challengeTitle: challenge.title,
      code,
      pressureLine: filmContext.crossExamQuestion,
      source: "shared-return",
    }),
  });
}

if (type && event && eventChallenge) {
  const arenaContext = buildBbtiArenaEventChallengeCaseContext({
    challenge: eventChallenge,
    code,
    emoji: type.emoji,
    event,
    typeName: type.name,
  });
  cases.push({
    label: "shared-arena-event",
    expectedCaseSource: "arena-event",
    expectedSource: "shared-return",
    seeds: resolveBbtiChallengeReplaySeeds({
      caseContext: arenaContext,
      challengeCategory: eventChallenge.category,
      challengeLabel: eventChallenge.label,
      challengeMatchupId: eventChallenge.matchupId,
      challengeTitle: eventChallenge.title,
      code,
      pressureLine: arenaContext.eventPressureTest,
      source: "shared-return",
    }),
  });
}

if (challenge) {
  cases.push({
    label: "battle-replay",
    expectedCaseSource: "none",
    expectedSource: "battle-replay",
    seeds: resolveBbtiChallengeReplaySeeds({
      challengeMatchupId: challenge.matchupId,
      challengeTitle: challenge.title,
      code,
      replayBody: "下一问先把刚才的站队和反证接起来。",
      replayTitle: "Kobe 的回合",
      source: "battle-replay",
    }),
  });
}

for (const item of cases) {
  const seeds = item.seeds;
  assertEqual(`${item.label} version`, seeds.version, BBTI_CHALLENGE_REPLAY_SEEDS_VERSION);
  assertEqual(`${item.label} source`, seeds.source, item.expectedSource);
  assertEqual(`${item.label} case source`, seeds.caseSource, item.expectedCaseSource);
  assertEqual(`${item.label} row count`, seeds.rowCount, 3);
  assertEqual(`${item.label} row order`, seeds.rows.map((row) => row.id), EXPECTED_ROWS);
  assertEqual(`${item.label} target order`, seeds.rows.map((row) => row.target), EXPECTED_TARGETS);
  checkText(`${item.label}.boundary`, seeds.boundary);

  for (const row of seeds.rows) {
    checkText(`${item.label}.${row.id}.title`, row.title, 80);
    checkText(`${item.label}.${row.id}.body`, row.body, 180);
    checkText(`${item.label}.${row.id}.meta`, row.meta, 48);
  }

  const copy = buildBbtiChallengeReplaySeedsCopy(seeds);
  checkText(`${item.label}.copy`, copy, 900);
  for (const expected of [
    "BBTI 开庭种子",
    BBTI_CHALLENGE_REPLAY_SEEDS_BOUNDARY,
  ]) {
    if (!copy.includes(expected)) addError(`${item.label}.copy missing ${JSON.stringify(expected)}`);
  }
}

if (typeof hydrateBbtiSharedChallenge === "function" && challenge && event && eventChallenge) {
  const hydratedCases = [
    hydrateBbtiSharedChallenge({ code, challengeMatchupId: challenge.matchupId, clipKey: "q12-m0" }),
    hydrateBbtiSharedChallenge({ code, challengeMatchupId: eventChallenge.matchupId, eventId: event.id }),
    hydrateBbtiSharedChallenge({ code, challengeMatchupId: challenge.matchupId }),
  ];

  for (const [index, hydrated] of hydratedCases.entries()) {
    assertEqual(`hydrated ${index + 1} seed version`, hydrated.challengeReplaySeeds?.version, BBTI_CHALLENGE_REPLAY_SEEDS_VERSION);
    assertEqual(`hydrated ${index + 1} seed rows`, hydrated.challengeReplaySeeds?.rows.map((row) => row.id), EXPECTED_ROWS);
  }

  const invalid = hydrateBbtiSharedChallenge({ code, challengeMatchupId: "not-a-real-matchup", clipKey: "q12-m0" });
  assertEqual("invalid challenge has no replay seeds", invalid.challengeReplaySeeds, null);
}

const component = read("src/components/BbtiChallengeReplaySeeds.tsx");
for (const expected of [
  'data-testid="bbti-challenge-replay-seeds"',
  "data-bbti-challenge-replay-seeds-version={seeds.version}",
  "data-bbti-challenge-replay-seeds-source={seeds.source}",
  "data-bbti-challenge-replay-seeds-case-source={seeds.caseSource}",
  "data-bbti-challenge-replay-seeds-code={seeds.code}",
  "data-bbti-challenge-replay-seeds-matchup={seeds.challengeMatchupId}",
  "data-bbti-challenge-replay-seeds-count={seeds.rowCount}",
  'data-testid="bbti-challenge-replay-seed-row"',
  "data-bbti-challenge-replay-seed={row.id}",
  "data-bbti-challenge-replay-seed-target={row.target}",
  "data-bbti-challenge-replay-seed-position={index + 1}",
  'data-testid="bbti-challenge-replay-seeds-copy"',
  'data-bbti-challenge-replay-seeds-action="copy-seeds"',
  'data-testid="bbti-challenge-replay-seeds-boundary"',
]) {
  assertIncludes("BbtiChallengeReplaySeeds selectors", component, expected);
}

for (const [label, filePath, expected] of [
  ["ChallengeReceiptBoard mount", "src/components/BbtiChallengeReceiptBoard.tsx", "BbtiChallengeReplaySeeds"],
  ["DeepLinkNotice mount", "src/components/BbtiDeepLinkNotice.tsx", "notice.replaySeeds"],
  ["BattleReplayLens mount", "src/components/BbtiBattleReplayLens.tsx", "source: \"battle-replay\""],
  ["shared hydration seed", "src/data/bbti-shared-challenge-hydration.ts", "challengeReplaySeeds"],
  ["visual fixture scene", "scripts/render-bbti-visual-qa-fixtures.mjs", '"challenge-replay-seeds"'],
]) {
  assertIncludes(label, read(filePath), expected);
}

const roadmap = read("docs/BBTI_ADD_FILES_ROADMAP.md");
assertIncludes("roadmap replay seeds note", roadmap, "bbti-challenge-replay-seeds-v1");
const factRules = read("docs/BBTI_FACT_RULES.md");
assertIncludes("fact rules replay seeds boundary", factRules, "bbti-challenge-replay-seeds-v1");

if (errors.length) {
  console.error("BBTI Challenge Replay Seeds validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI Challenge Replay Seeds validation");
console.log(`- contract: ${BBTI_CHALLENGE_REPLAY_SEEDS_VERSION}`);
console.log(`- seed cases: ${cases.length}`);
console.log(`- rows: ${EXPECTED_ROWS.join(", ")}`);
console.log("OK: challenge replay seeds stay local, identifier-backed, and selector-covered.");
