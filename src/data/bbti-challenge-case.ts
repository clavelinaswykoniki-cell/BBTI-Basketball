import type { BbtiChallengeMatchup } from "./bbti-challenges";
import type { BbtiArenaEvent } from "./bbti-arena-events";
import type { BbtiFilmRoomCrossExam } from "./bbti-film-room-cross-exams";
import type { BbtiFilmRoomClip } from "./bbti-playbook";

export const BBTI_CHALLENGE_CASE_VERSION = "bbti-case-v1" as const;

export type BbtiChallengeCaseVersion = typeof BBTI_CHALLENGE_CASE_VERSION;
export type BbtiChallengeCaseSourceVersion =
  | "film-room-v1"
  | "result-v1"
  | "arena-event-v1";

interface BbtiChallengeCaseBase {
  caseVersion: BbtiChallengeCaseVersion;
  caseSourceVersion: BbtiChallengeCaseSourceVersion;
  code: string;
  typeName?: string;
  emoji?: string;
  challengeMatchupId: string;
  challengeTitle: string;
  challengeCategory: string;
  challengeLabel: string;
  pressureQuestion?: string;
  evidenceLine?: string;
  evidenceLens: string[];
}

export interface BbtiFilmRoomChallengeCaseContext extends BbtiChallengeCaseBase {
  source: "film-room";
  caseSourceVersion: "film-room-v1";
  clipKey: string;
  questionId: number;
  dimensionLabel: string;
  answerText: string;
  coachTitle: string;
  coachSummary: string;
  coachBlindSpot: string;
  crossExamTitle: string;
  crossExamStandard: string;
  crossExamQuestion: string;
  counterPunch: string;
}

export interface BbtiResultChallengeCaseContext extends BbtiChallengeCaseBase {
  source: "result";
  caseSourceVersion: "result-v1";
  originLabel: "赛后报告";
  recommendationReason: string;
  caseQuestion: string;
  groupChatPrompt?: string;
  shareCopy?: string;
}

export interface BbtiArenaEventChallengeCaseContext extends BbtiChallengeCaseBase {
  source: "arena-event";
  caseSourceVersion: "arena-event-v1";
  originLabel: "情境加赛";
  eventId: string;
  eventTitle: string;
  eventTag: string;
  eventScenario: string;
  eventInstinct: string;
  eventPressureTest: string;
  eventBlindSpot: string;
  caseQuestion: string;
}

export type BbtiChallengeCaseContext =
  | BbtiFilmRoomChallengeCaseContext
  | BbtiResultChallengeCaseContext
  | BbtiArenaEventChallengeCaseContext;

interface BuildBbtiChallengeCaseContextInput {
  code: string;
  clip: BbtiFilmRoomClip;
  dimensionLabel: string;
  crossExam: BbtiFilmRoomCrossExam;
  challenge: BbtiChallengeMatchup;
  typeName?: string;
  emoji?: string;
}

interface BuildBbtiResultChallengeCaseContextInput {
  code: string;
  challenge: BbtiChallengeMatchup;
  typeName?: string;
  emoji?: string;
}

interface BuildBbtiArenaEventChallengeCaseContextInput {
  code: string;
  event: BbtiArenaEvent;
  challenge: BbtiChallengeMatchup;
  typeName?: string;
  emoji?: string;
}

function getChallengeEvidenceLine(challenge: BbtiChallengeMatchup): string | undefined {
  return challenge.iconicMoment ?? challenge.receiptA ?? challenge.receiptB;
}

export function buildBbtiChallengeCaseContext({
  code,
  clip,
  dimensionLabel,
  crossExam,
  challenge,
  typeName,
  emoji,
}: BuildBbtiChallengeCaseContextInput): BbtiFilmRoomChallengeCaseContext {
  return {
    source: "film-room",
    caseVersion: BBTI_CHALLENGE_CASE_VERSION,
    caseSourceVersion: "film-room-v1",
    code,
    typeName,
    emoji,
    clipKey: clip.clipKey,
    questionId: clip.questionId,
    dimensionLabel,
    answerText: clip.answerText,
    coachTitle: clip.coachTimeout.title,
    coachSummary: clip.coachTimeout.summary,
    coachBlindSpot: clip.coachTimeout.blindSpot,
    crossExamTitle: crossExam.title,
    crossExamStandard: crossExam.standard,
    crossExamQuestion: crossExam.question,
    counterPunch: crossExam.counterPunch,
    challengeMatchupId: challenge.matchupId,
    challengeTitle: challenge.title,
    challengeCategory: challenge.category,
    challengeLabel: challenge.label,
    pressureQuestion: challenge.pressureQuestion,
    evidenceLine: getChallengeEvidenceLine(challenge),
    evidenceLens: challenge.evidenceLens ?? [],
  };
}

export function buildBbtiResultChallengeCaseContext({
  code,
  challenge,
  typeName,
  emoji,
}: BuildBbtiResultChallengeCaseContextInput): BbtiResultChallengeCaseContext {
  const evidenceLine = getChallengeEvidenceLine(challenge);
  const caseQuestion = challenge.pressureQuestion
    ?? `如果这场是 ${challenge.title}，你的人格报告到底会先保护哪条篮球标准？`;

  return {
    source: "result",
    caseVersion: BBTI_CHALLENGE_CASE_VERSION,
    caseSourceVersion: "result-v1",
    code,
    typeName,
    emoji,
    originLabel: "赛后报告",
    recommendationReason: challenge.reason,
    caseQuestion,
    groupChatPrompt: challenge.groupChatPrompt,
    shareCopy: challenge.shareCopy,
    challengeMatchupId: challenge.matchupId,
    challengeTitle: challenge.title,
    challengeCategory: challenge.category,
    challengeLabel: challenge.label,
    pressureQuestion: challenge.pressureQuestion,
    evidenceLine,
    evidenceLens: challenge.evidenceLens ?? [],
  };
}

export function buildBbtiArenaEventChallengeCaseContext({
  code,
  event,
  challenge,
  typeName,
  emoji,
}: BuildBbtiArenaEventChallengeCaseContextInput): BbtiArenaEventChallengeCaseContext {
  return {
    source: "arena-event",
    caseVersion: BBTI_CHALLENGE_CASE_VERSION,
    caseSourceVersion: "arena-event-v1",
    code,
    typeName,
    emoji,
    originLabel: "情境加赛",
    eventId: event.id,
    eventTitle: event.title,
    eventTag: event.tag,
    eventScenario: event.scenario,
    eventInstinct: event.instinct,
    eventPressureTest: event.pressureTest,
    eventBlindSpot: event.blindSpot,
    caseQuestion: event.groupChatPrompt,
    challengeMatchupId: challenge.matchupId,
    challengeTitle: challenge.title,
    challengeCategory: challenge.category,
    challengeLabel: challenge.label,
    pressureQuestion: challenge.pressureQuestion,
    evidenceLine: getChallengeEvidenceLine(challenge),
    evidenceLens: challenge.evidenceLens ?? [],
  };
}

export function buildBbtiChallengeCaseCopy(context: BbtiChallengeCaseContext): string {
  const identity = context.typeName
    ? `${context.emoji ? `${context.emoji} ` : ""}${context.typeName}（${context.code}）`
    : context.code;
  const sourceLabel = (() => {
    switch (context.source) {
      case "film-room":
        return "录像室 Film Room";
      case "result":
        return "赛后报告 命定对线";
      case "arena-event":
        return `情境加赛 ${context.eventTag}`;
    }
  })();
  const standard = (() => {
    switch (context.source) {
      case "film-room":
        return context.crossExamStandard;
      case "result":
        return context.recommendationReason;
      case "arena-event":
        return context.eventPressureTest;
    }
  })();
  const question = context.source === "film-room" ? context.crossExamQuestion : context.caseQuestion;
  const counter = (() => {
    switch (context.source) {
      case "film-room":
        return context.counterPunch;
      case "result":
        return context.shareCopy ?? context.groupChatPrompt;
      case "arena-event":
        return context.eventBlindSpot;
    }
  })();

  return [
    `BBTI 案件带入：${identity}`,
    `来源：${sourceLabel}`,
    context.source === "film-room" ? `录像室：Q${context.questionId}｜${context.dimensionLabel}` : null,
    context.source === "film-room" ? `我的选择：${context.answerText}` : null,
    context.source === "film-room" ? `教练点评：${context.coachTitle}｜${context.coachSummary}` : null,
    context.source === "result" ? `推荐理由：${context.recommendationReason}` : null,
    context.source === "arena-event" ? `赛事情境：${context.eventTitle}｜${context.eventScenario}` : null,
    context.source === "arena-event" ? `本能反应：${context.eventInstinct}` : null,
    `审查标准：${standard}`,
    `反证追问：${question}`,
    counter ? `反击角度：${counter}` : null,
    `本场对线：${context.challengeCategory} · ${context.challengeTitle}`,
    context.pressureQuestion ? `案由：${context.pressureQuestion}` : null,
    context.evidenceLine ? `证据线：${context.evidenceLine}` : null,
  ].filter(Boolean).join("\n");
}
