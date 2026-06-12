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
  "回访率",
  "真实回访",
  "真实活跃用户",
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

function assertCopyBoundaries(label, streak) {
  const text = [
    streak.label,
    streak.headline,
    streak.summary,
    streak.boundary,
    streak.copyText,
    ...(streak.steps ?? []).flatMap((step) => [
      step.label,
      step.title,
      step.body,
      step.ctaLabel,
    ]),
  ].filter(Boolean).join("\n");

  for (const term of FORBIDDEN_COPY_TERMS) {
    assertNotIncludes(`${label} forbidden copy term`, text, term);
  }
}

const {
  BBTI_RETURN_STREAK_BOUNDARY,
  BBTI_RETURN_STREAK_VERSION,
  getBbtiDailyReturnPlay,
  resolveBbtiDailyReturnCaseContext,
  resolveBbtiReturnStreak,
} = loadDataModule("src/data/bbti-daily-return.ts");
const {
  getBbtiType,
} = loadDataModule("src/data/bbti.ts");
const {
  buildBbtiResultUrl,
} = loadDataModule("src/lib/bbti-deep-links.ts");

assertEqual("return streak version", BBTI_RETURN_STREAK_VERSION, "bbti-return-streaks-v1");
assertEqual("return streak boundary", BBTI_RETURN_STREAK_BOUNDARY, "本地回访连线，不代表连续登录或真实活跃。");

for (const [name, fn] of [
  ["getBbtiDailyReturnPlay", getBbtiDailyReturnPlay],
  ["resolveBbtiDailyReturnCaseContext", resolveBbtiDailyReturnCaseContext],
  ["resolveBbtiReturnStreak", resolveBbtiReturnStreak],
]) {
  if (typeof fn !== "function") addError(`${name} must be exported`);
}

if (
  typeof getBbtiDailyReturnPlay === "function"
  && typeof resolveBbtiDailyReturnCaseContext === "function"
  && typeof resolveBbtiReturnStreak === "function"
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
    const streak = resolveBbtiReturnStreak(result, dailyReturn);

    assertEqual(`${code} date key`, dailyReturn.dateKey, "2026-05-30");
    assertTruthy(`${code} daily event`, dailyReturn.event);
    assertTruthy(`${code} featured challenge`, dailyReturn.featuredChallenge);
    assertTruthy(`${code} case context`, caseContext);
    assertEqual(`${code} featured category`, dailyReturn.featuredChallenge?.category, dailyReturn.event?.recommendedCategory);
    assertEqual(`${code} case context source`, caseContext?.source, "arena-event");
    assertEqual(`${code} case context code`, caseContext?.code, code);
    assertEqual(`${code} case context event`, caseContext?.eventId, dailyReturn.event?.id);
    assertEqual(`${code} case context matchup`, caseContext?.challengeMatchupId, dailyReturn.featuredChallenge?.matchupId);
    assertEqual(`${code} streak version`, streak.version, BBTI_RETURN_STREAK_VERSION);
    assertEqual(`${code} streak code`, streak.code, code);
    assertEqual(`${code} streak event`, streak.eventId, dailyReturn.event?.id);
    assertEqual(`${code} streak featured`, streak.featuredChallengeId, dailyReturn.featuredChallenge?.matchupId);
    assertEqual(`${code} streak case source`, streak.caseContextSource, "arena-event");
    assertEqual(`${code} step count`, streak.steps.length, 3);
    assertEqual(`${code} step ids`, streak.steps.map((step) => step.id).join(","), "last-report,daily-event,featured-challenge");
    assertEqual(`${code} step targets`, streak.steps.map((step) => step.target).join(","), "result,daily-event,challenge");
    assertIncludes(`${code} summary`, streak.summary, code);
    assertIncludes(`${code} copy`, streak.copyText, "BBTI 回访主线");
    assertIncludes(`${code} copy boundary`, streak.copyText, BBTI_RETURN_STREAK_BOUNDARY);
    assertCopyBoundaries(code, streak);

    const returnUrl = buildBbtiResultUrl(code, {
      eventId: dailyReturn.event?.id,
      challengeMatchupId: dailyReturn.featuredChallenge?.matchupId,
    }, "https://bbti.test/result?caseCopy=too-heavy&sourceUrl=https%3A%2F%2Fexample.test");
    const parsed = new URL(returnUrl);
    assertEqual(`${code} return URL bbti`, parsed.searchParams.get("bbti"), code);
    assertEqual(`${code} return URL event`, parsed.searchParams.get("event"), dailyReturn.event?.id);
    assertEqual(`${code} return URL challenge`, parsed.searchParams.get("challenge"), dailyReturn.featuredChallenge?.matchupId);
    for (const forbidden of ["caseCopy", "sourceUrl", "sourceId", "caseVersion"]) {
      if (parsed.searchParams.has(forbidden)) {
        addError(`${code}: return URL must strip ${forbidden}`);
      }
    }
  }
}

if (errors.length) {
  console.error("BBTI return streak validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI return streak validation");
console.log(`- contract: ${BBTI_RETURN_STREAK_VERSION}`);
console.log(`- codes: ${EXPECTED_BBTI_CODES.length}`);
console.log("- steps: last-report, daily-event, featured-challenge");
console.log("- source: local last result + deterministic daily event + featured challenge");
console.log("OK: return streaks stay local, deterministic, and copy-safe.");
