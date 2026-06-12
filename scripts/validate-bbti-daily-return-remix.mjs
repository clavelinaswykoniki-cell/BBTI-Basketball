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
const VALIDATION_DATE = new Date(2026, 4, 30, 12, 0, 0);
const EXPECTED_BBTI_CODES = ["O", "D"].flatMap((style) =>
  ["A", "E"].flatMap((evidence) =>
    ["I", "T"].flatMap((role) => ["L", "R"].map((ambition) => `${style}${evidence}${role}${ambition}`)),
  ),
);
const FORBIDDEN_COPY_TERMS = [
  "VAR",
  "点球",
  "德比",
  "FUT",
  "足球",
  "官方",
  "官方认证",
  "公认第一",
  "真实热度",
  "实时热度",
  "全网",
  "用户投票",
  "播放量",
  "热搜",
  "多数球迷",
  "大家都选",
  "登录天数",
  "活跃率",
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

function assertCopyBoundaries(label, remix) {
  const text = [
    remix.boundary,
    remix.copyText,
    ...(remix.lanes ?? []).flatMap((lane) => [
      lane.label,
      lane.title,
      lane.body,
      lane.ctaLabel,
    ]),
  ].filter(Boolean).join("\n");

  for (const term of FORBIDDEN_COPY_TERMS) {
    assertNotIncludes(`${label} forbidden copy term`, text, term);
  }
}

const {
  BBTI_DAILY_RETURN_REMIX_BOUNDARY,
  BBTI_DAILY_RETURN_REMIX_VERSION,
  getBbtiDailyReturnFilmRoomClipKey,
  getBbtiDailyReturnPlay,
  resolveBbtiDailyReturnCaseContext,
  resolveBbtiDailyReturnRemix,
} = loadDataModule("src/data/bbti-daily-return.ts");
const {
  getBbtiType,
} = loadDataModule("src/data/bbti.ts");
const {
  buildSharedFilmRoomClipFromKey,
} = loadDataModule("src/data/bbti-playbook.ts");
const {
  buildBbtiResultUrl,
} = loadDataModule("src/lib/bbti-deep-links.ts");

assertEqual("daily return remix version", BBTI_DAILY_RETURN_REMIX_VERSION, "bbti-daily-return-remix-v1");
assertEqual("daily return remix boundary", BBTI_DAILY_RETURN_REMIX_BOUNDARY, "本地每日主场切换，不代表真实赛程、真实回访或用户行为。");

for (const [name, fn] of [
  ["getBbtiDailyReturnFilmRoomClipKey", getBbtiDailyReturnFilmRoomClipKey],
  ["resolveBbtiDailyReturnRemix", resolveBbtiDailyReturnRemix],
]) {
  if (typeof fn !== "function") addError(`${name} must be exported`);
}

if (
  typeof getBbtiDailyReturnPlay === "function"
  && typeof resolveBbtiDailyReturnCaseContext === "function"
  && typeof resolveBbtiDailyReturnRemix === "function"
) {
  for (const code of EXPECTED_BBTI_CODES) {
    const type = getBbtiType(code);
    const dailyReturn = getBbtiDailyReturnPlay(code, VALIDATION_DATE);
    const result = {
      challenge: dailyReturn.featuredChallenge?.title ?? "今日主场加赛",
      code,
      emoji: type?.emoji ?? "BBTI",
      mode: "quick",
      name: type?.name ?? code,
      savedAt: "2026-05-30T12:00:00.000Z",
    };
    const caseContext = resolveBbtiDailyReturnCaseContext(dailyReturn);
    const remix = resolveBbtiDailyReturnRemix(result, dailyReturn);
    const clip = buildSharedFilmRoomClipFromKey(remix.filmRoomClipKey);

    assertEqual(`${code} remix version`, remix.version, BBTI_DAILY_RETURN_REMIX_VERSION);
    assertEqual(`${code} remix code`, remix.code, code);
    assertEqual(`${code} remix date`, remix.dateKey, "2026-05-30");
    assertEqual(`${code} remix event`, remix.eventId, dailyReturn.event?.id);
    assertEqual(`${code} remix featured`, remix.featuredChallengeId, dailyReturn.featuredChallenge?.matchupId);
    assertTruthy(`${code} remix film room clip`, clip);
    assertTruthy(`${code} remix case context`, caseContext);
    assertEqual(`${code} remix lane count`, remix.laneCount, 3);
    assertEqual(`${code} remix lane ids`, remix.lanes.map((lane) => lane.id).join(","), "daily-event,film-room-return,featured-challenge");
    assertEqual(`${code} remix targets`, remix.lanes.map((lane) => lane.target).join(","), "daily-event,film-room,challenge");
    assertIncludes(`${code} remix copy`, remix.copyText, "BBTI 每日主场切换");
    assertIncludes(`${code} remix boundary`, remix.copyText, BBTI_DAILY_RETURN_REMIX_BOUNDARY);
    assertCopyBoundaries(code, remix);

    const filmRoomUrl = buildBbtiResultUrl(code, {
      challengeMatchupId: dailyReturn.featuredChallenge?.matchupId,
      clipKey: remix.filmRoomClipKey,
    }, "https://bbti.test/result?caseCopy=too-heavy&sourceUrl=https%3A%2F%2Fexample.test&event=stale");
    const parsed = new URL(filmRoomUrl);
    assertEqual(`${code} film room URL bbti`, parsed.searchParams.get("bbti"), code);
    assertEqual(`${code} film room URL clip`, parsed.searchParams.get("clip"), remix.filmRoomClipKey);
    assertEqual(`${code} film room URL challenge`, parsed.searchParams.get("challenge"), dailyReturn.featuredChallenge?.matchupId);
    if (parsed.searchParams.has("event")) {
      addError(`${code}: film room URL must not keep stale event`);
    }
    for (const forbidden of ["caseCopy", "sourceUrl", "sourceId", "caseVersion"]) {
      if (parsed.searchParams.has(forbidden)) {
        addError(`${code}: film room URL must strip ${forbidden}`);
      }
    }
  }
}

if (errors.length) {
  console.error("BBTI daily return remix validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI daily return remix validation");
console.log(`- contract: ${BBTI_DAILY_RETURN_REMIX_VERSION}`);
console.log(`- codes: ${EXPECTED_BBTI_CODES.length}`);
console.log("- lanes: daily-event, film-room-return, featured-challenge");
console.log("- source: local last result + deterministic daily event + deterministic Film Room clip + featured challenge");
console.log("OK: daily return remix stays local, deterministic, and copy-safe.");
