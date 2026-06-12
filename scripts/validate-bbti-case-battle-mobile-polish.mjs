#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const errors = [];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function addError(message) {
  errors.push(message);
}

function assertIncludes(label, source, expected) {
  if (!source.includes(expected)) {
    addError(`${label}: missing ${JSON.stringify(expected)}`);
  }
}

function assertOrdered(label, source, expected) {
  let cursor = -1;
  for (const item of expected) {
    const next = source.indexOf(item, cursor + 1);
    if (next < 0) {
      addError(`${label}: missing ordered item ${JSON.stringify(item)}`);
      return;
    }
    if (next <= cursor) {
      addError(`${label}: ${JSON.stringify(item)} is out of order`);
      return;
    }
    cursor = next;
  }
}

function assertNotIncludes(label, source, forbidden) {
  if (source.includes(forbidden)) {
    addError(`${label}: must not include ${JSON.stringify(forbidden)}`);
  }
}

const battleArena = read("src/components/BattleArena.tsx");
const stack = read("src/components/BbtiCaseBattleMobileStack.tsx");
const replayCenter = read("src/components/ReplayCenter.tsx");
const courtSideAdvisor = read("src/components/CourtSideAdvisor.tsx");
const battleReplayLens = read("src/components/BbtiBattleReplayLens.tsx");
const caseTrail = read("src/components/BbtiChallengeCaseTrail.tsx");
const visualFixtures = read("scripts/render-bbti-visual-qa-fixtures.mjs");
const factRules = read("docs/BBTI_FACT_RULES.md");
const visualQa = read("docs/BBTI_VISUAL_QA.md");

[
  'BBTI_CASE_BATTLE_MOBILE_STACK_VERSION = "bbti-case-battle-mobile-polish-v1"',
  "BBTI_CASE_BATTLE_MOBILE_STEPS",
  '"replay"',
  '"advisor"',
  '"controls"',
  '"lens"',
  '"trail"',
  'data-testid="bbti-case-battle-mobile-stack"',
  "data-bbti-case-battle-mobile-version={BBTI_CASE_BATTLE_MOBILE_STACK_VERSION}",
  'data-bbti-case-battle-mobile-source={caseContext?.source ?? "none"}',
  "data-bbti-case-battle-mobile-round={roundNumber}",
  "data-bbti-case-battle-mobile-side={votedFor}",
  "data-bbti-case-battle-mobile-auto-advance={autoAdvanceState}",
  "data-bbti-case-battle-mobile-step-count={BBTI_CASE_BATTLE_MOBILE_STEPS.length}",
  'data-testid="bbti-case-battle-mobile-rhythm"',
  'data-testid="bbti-case-battle-mobile-step"',
  "data-bbti-case-battle-mobile-step={step.id}",
  "data-bbti-case-battle-mobile-target={step.target}",
  "data-bbti-case-battle-mobile-position={index + 1}",
  'data-testid="bbti-case-battle-mobile-controls"',
  "data-bbti-case-battle-mobile-auto-advance={autoAdvanceState}",
  'data-testid="bbti-case-battle-mobile-action"',
  'data-bbti-case-battle-mobile-action="next"',
  'data-bbti-case-battle-mobile-action="extend"',
  'data-bbti-case-battle-mobile-action="pause"',
  'data-testid="bbti-case-battle-mobile-countdown"',
  'data-bbti-case-battle-mobile-stack-layout="mobile-controls-before-lens"',
].forEach((expected) => assertIncludes("BbtiCaseBattleMobileStack contract", stack, expected));

assertOrdered("BbtiCaseBattleMobileStack step order", stack, [
  '{ id: "replay", label: "回放", target: "bbti-replay-center" }',
  '{ id: "advisor", label: "场边", target: "bbti-courtside-advisor" }',
  '{ id: "controls", label: "控场", target: "bbti-case-battle-mobile-controls" }',
  '{ id: "lens", label: "镜头", target: "bbti-battle-replay-lens" }',
  '{ id: "trail", label: "案由", target: "bbti-case-trail" }',
]);

[
  'import BbtiCaseBattleMobileStack, { BbtiCaseBattleMobileControls } from "./BbtiCaseBattleMobileStack";',
  "<BbtiCaseBattleMobileStack",
  'autoAdvanceState={autoAdvance && countdown !== null ? "running" : "paused"}',
  "caseContext={bbtiChallengeCase}",
  "roundNumber={currentRound + 1}",
  "votedFor={voted}",
  'data-bbti-case-battle-mobile-slot="replay"',
  'data-bbti-case-battle-mobile-slot="advisor"',
  'data-bbti-case-battle-mobile-slot="controls"',
  'data-bbti-case-battle-mobile-slot="lens"',
  'data-bbti-case-battle-mobile-slot="trail"',
  "order-3 sm:order-6",
  "order-4 sm:order-3",
  "order-5 sm:order-4",
  "order-6 sm:order-5",
].forEach((expected) => assertIncludes("BattleArena mobile stack mount", battleArena, expected));

assertOrdered("BattleArena mobile slot order", battleArena, [
  'data-bbti-case-battle-mobile-slot="replay"',
  'data-bbti-case-battle-mobile-slot="advisor"',
  'data-bbti-case-battle-mobile-slot="lens"',
  'data-bbti-case-battle-mobile-slot="trail"',
  'data-bbti-case-battle-mobile-slot="vote-reveal"',
  'data-bbti-case-battle-mobile-slot="controls"',
]);

[
  'data-testid="bbti-replay-center"',
  "sm:mt-6",
].forEach((expected) => assertIncludes("ReplayCenter mobile density", replayCenter, expected));

[
  'data-testid="bbti-courtside-advisor"',
  'data-bbti-courtside-advisor-case-source={caseContext?.source ?? "none"}',
  "p-3 sm:p-4",
].forEach((expected) => assertIncludes("CourtSideAdvisor mobile density", courtSideAdvisor, expected));

[
  "min-h-[92px]",
  "sm:min-h-[104px]",
  "min-h-[96px]",
  "sm:min-h-[108px]",
].forEach((expected) => assertIncludes("BattleReplayLens mobile density", battleReplayLens, expected));

assertIncludes("Case Trail mobile density", caseTrail, "p-3 sm:mt-4 sm:p-4");
assertIncludes("Case Trail mobile density", caseTrail, "gap-2 sm:grid-cols-[1fr_1.2fr] sm:gap-3");

[
  'id: "case-battle-mobile-polish"',
  '[data-testid="bbti-case-battle-mobile-stack"]',
  '[data-testid="bbti-case-battle-mobile-controls"]',
  'data-bbti-case-battle-mobile-version="bbti-case-battle-mobile-polish-v1"',
  'data-bbti-case-battle-mobile-step="replay"',
  'data-bbti-case-battle-mobile-step="advisor"',
  'data-bbti-case-battle-mobile-step="controls"',
  'data-bbti-case-battle-mobile-step="lens"',
  'data-bbti-case-battle-mobile-step="trail"',
].forEach((expected) => assertIncludes("Visual QA fixture coverage", visualFixtures, expected));

[
  "Case Battle Mobile Stack checks",
  "bbti-case-battle-mobile-polish",
].forEach((expected) => assertIncludes("Visual QA docs", visualQa, expected));

assertIncludes("Fact rules mobile boundary", factRules, "Case Battle Mobile Polish Boundary");
assertIncludes("Fact rules mobile boundary", factRules, "bbti-case-battle-mobile-polish-v1");

for (const [label, source] of [
  ["stack component", stack],
  ["BattleArena", battleArena],
  ["CourtSideAdvisor", courtSideAdvisor],
]) {
  for (const forbidden of [
    "VAR",
    "点球",
    "德比",
    "FUT",
    "足球",
    "真实热度",
    "实时热度",
    "全网",
    "用户投票",
    "官方认证",
    "公认第一",
    "真实胜率",
  ]) {
    assertNotIncludes(label, source, forbidden);
  }
}

if (errors.length > 0) {
  console.error("BBTI case-battle-mobile-polish validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("BBTI case-battle-mobile-polish validation passed.");
