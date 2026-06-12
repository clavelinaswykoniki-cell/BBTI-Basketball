#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const ROOT = process.cwd();
const SOURCE_RELATIVE_PATH = "src/lib/bbti-deep-links.ts";
const sourcePath = path.join(ROOT, SOURCE_RELATIVE_PATH);
const sourceText = fs.readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(sourceText, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});

const sandbox = {
  exports: {},
  module: { exports: {} },
  URL,
  URLSearchParams,
};
sandbox.exports = sandbox.module.exports;
vm.runInNewContext(compiled.outputText, sandbox, { filename: SOURCE_RELATIVE_PATH });

const {
  buildBbtiCaseReturnUrl,
  buildBbtiCompareInviteUrl,
  buildBbtiCompareUrl,
  buildBbtiResultUrl,
  parseBbtiCompareDeepLink,
  parseBbtiDeepLink,
} = sandbox.module.exports;
const errors = [];
const FORBIDDEN_CASE_URL_PARAMS = [
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

function assertEqual(label, actual, expected) {
  if (actual !== expected) {
    errors.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function checkCase(search, expected) {
  const parsed = parseBbtiDeepLink(search);

  for (const [key, value] of Object.entries(expected)) {
    assertEqual(`${search} ${key}`, parsed[key], value);
  }
}

function checkCompareCase(search, expected) {
  const parsed = parseBbtiCompareDeepLink(search);

  for (const [key, value] of Object.entries(expected)) {
    assertEqual(`${search} compare ${key}`, parsed[key], value);
  }
}

checkCase("?clip=q12-a", {
  hasClipParam: true,
  rawClip: "q12-a",
  clipKey: "q12-a",
  clipQuestionId: 12,
});

checkCase("?clip=q12-m0.2", {
  hasClipParam: true,
  rawClip: "q12-m0.2",
  clipKey: "q12-m0.2",
  clipQuestionId: 12,
});

checkCase("?clip=12", {
  hasClipParam: true,
  rawClip: "12",
  clipKey: null,
  clipQuestionId: 12,
});

checkCase("?clip=q12", {
  hasClipParam: true,
  rawClip: "q12",
  clipKey: null,
  clipQuestionId: 12,
});

checkCase("?clip=q12-z", {
  hasClipParam: true,
  rawClip: "q12-z",
  clipKey: null,
  clipQuestionId: null,
});

checkCase("?clip=-1", {
  hasClipParam: true,
  rawClip: "-1",
  clipKey: null,
  clipQuestionId: null,
});

checkCase("?clip=", {
  hasClipParam: true,
  rawClip: null,
  clipKey: null,
  clipQuestionId: null,
});

checkCase("?clip=q", {
  hasClipParam: true,
  rawClip: "q",
  clipKey: null,
  clipQuestionId: null,
});

checkCase("?bbti=OAIL&a=DAIR", {
  code: "OAIL",
  hasClipParam: false,
  rawClip: null,
  clipKey: null,
  clipQuestionId: null,
});

checkCompareCase("?bbti=OAIL&a=dair&b=oetr&event=game-7&challenge=old&clip=q12-a", {
  codeA: "DAIR",
  codeB: "OETR",
  hasCompareParams: true,
});

checkCompareCase("?a=xxxx&b=DETR", {
  codeA: null,
  codeB: "DETR",
  hasCompareParams: true,
});

function checkUrl(label, actual, expectedParams, forbiddenParams = []) {
  const parsed = new URL(actual);
  for (const [key, value] of Object.entries(expectedParams)) {
    assertEqual(`${label} ${key}`, parsed.searchParams.get(key), value);
  }
  for (const key of [...FORBIDDEN_CASE_URL_PARAMS, ...forbiddenParams]) {
    assertEqual(`${label} has no ${key}`, parsed.searchParams.has(key), false);
  }
}

const DIRTY_CASE_QUERY = FORBIDDEN_CASE_URL_PARAMS
  .map((param) => `${param}=dirty`)
  .join("&");

checkUrl(
  "result url strips stale params",
  buildBbtiResultUrl("OAIL", {
    eventId: "game-7",
    challengeMatchupId: "kobe-vs-jordan",
  }, `https://example.com/?a=DAIR&b=OETR&clip=q12-a&mode=debate&matchup=old&event=old&challenge=old&${DIRTY_CASE_QUERY}`),
  {
    bbti: "OAIL",
    event: "game-7",
    challenge: "kobe-vs-jordan",
  },
  ["a", "b", "clip", "mode", "matchup"],
);

checkUrl(
  "compare invite strips stale params",
  buildBbtiCompareInviteUrl("OAIL", `https://example.com/?bbti=DAIR&event=old&challenge=old&clip=q12-a&mode=debate&matchup=old&b=OETR&${DIRTY_CASE_QUERY}`),
  {
    a: "OAIL",
  },
  ["bbti", "event", "challenge", "clip", "mode", "matchup", "b"],
);

checkUrl(
  "compare report strips stale params",
  buildBbtiCompareUrl("OAIL", "DAIR", `https://example.com/?bbti=OETR&event=old&challenge=old&clip=q12-a&mode=debate&matchup=old&a=DETR&b=OAIR&${DIRTY_CASE_QUERY}`),
  {
    a: "OAIL",
    b: "DAIR",
  },
  ["bbti", "event", "challenge", "clip", "mode", "matchup"],
);

checkUrl(
  "arena-event case return preserves event and challenge",
  buildBbtiCaseReturnUrl({
    source: "arena-event",
    code: "OAIL",
    eventId: "game-7",
    challengeMatchupId: "kobe-vs-jordan",
  }, `https://example.com/?a=DAIR&b=OETR&clip=q12-a&mode=debate&matchup=old&event=old&challenge=old&${DIRTY_CASE_QUERY}`),
  {
    bbti: "OAIL",
    event: "game-7",
    challenge: "kobe-vs-jordan",
  },
  ["a", "b", "clip", "mode", "matchup"],
);

checkUrl(
  "film-room case return preserves clip and challenge",
  buildBbtiCaseReturnUrl({
    source: "film-room",
    code: "DAIR",
    clipKey: "q12-a",
    challengeMatchupId: "magic-vs-bird",
  }, `https://example.com/?bbti=OAIL&event=game-7&challenge=old&clip=q20-b&a=DETR&b=OAIR&${DIRTY_CASE_QUERY}`),
  {
    bbti: "DAIR",
    challenge: "magic-vs-bird",
    clip: "q12-a",
  },
  ["a", "b", "event", "mode", "matchup"],
);

checkUrl(
  "result case return strips event and clip",
  buildBbtiCaseReturnUrl({
    source: "result",
    code: "DETR",
    challengeMatchupId: "duncan-vs-garnett",
  }, `https://example.com/?bbti=OAIL&event=game-7&challenge=old&clip=q20-b&a=DETR&b=OAIR&${DIRTY_CASE_QUERY}`),
  {
    bbti: "DETR",
    challenge: "duncan-vs-garnett",
  },
  ["a", "b", "event", "clip", "mode", "matchup"],
);

if (errors.length) {
  console.error("BBTI deep-link validation failed");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("BBTI deep-link validation");
console.log("- result parser cases: 9");
console.log("- compare parser cases: 2");
console.log("- URL builder cases: 6");
console.log(`- forbidden internal case params: ${FORBIDDEN_CASE_URL_PARAMS.length}`);
console.log("OK: BBTI clip parsing and return-share URLs keep stale query state and case prose out of shared links.");
