import type { BbtiChallengeCaseContext } from "./bbti-challenge-case";
import type { DebateTopic } from "./debates";
import type { VoteSide } from "./stat-bombs";

export interface BbtiCaseTrailVote {
  topicId: string;
  winner: VoteSide;
}

export type BbtiCaseTrailStepState = "completed" | "current" | "upcoming";

export interface BbtiCaseTrailStep {
  roundLabel: string;
  topicId: string;
  topicTitle: string;
  state: BbtiCaseTrailStepState;
  selectedSideName: string | null;
  responseLine: string;
}

export interface BbtiChallengeCaseTrail {
  caseVersion: string;
  caseSourceVersion: string;
  sourceLabel: string;
  sourceDetail: string;
  title: string;
  standardLabel: string;
  standard: string;
  reviewQuestion: string;
  progressLabel: string;
  steps: BbtiCaseTrailStep[];
  copyText: string;
}

interface ResolveBbtiChallengeCaseTrailInput {
  context: BbtiChallengeCaseContext | null;
  currentRound: number;
  nameA: string;
  nameB: string;
  topics: DebateTopic[];
  votes: BbtiCaseTrailVote[];
}

function caseMeta(context: BbtiChallengeCaseContext) {
  switch (context.source) {
    case "film-room":
      return {
        sourceLabel: "录像室案由",
        sourceDetail: `Q${context.questionId} · ${context.dimensionLabel}`,
        title: "录像室案件轨迹",
        standardLabel: "录像室标准",
        standard: context.crossExamStandard,
        reviewQuestion: context.crossExamQuestion,
      };
    case "result":
      return {
        sourceLabel: "赛后报告",
        sourceDetail: context.originLabel,
        title: "赛后报告案由轨迹",
        standardLabel: "推荐理由",
        standard: context.recommendationReason,
        reviewQuestion: context.caseQuestion,
      };
    case "arena-event":
      return {
        sourceLabel: "情境加赛",
        sourceDetail: `${context.eventTag} · ${context.eventTitle}`,
        title: "情境加赛案由轨迹",
        standardLabel: "压力测试",
        standard: context.eventPressureTest,
        reviewQuestion: context.caseQuestion,
      };
  }
}

function sideName(winner: VoteSide, nameA: string, nameB: string): string {
  return winner === "kobe" ? nameA : nameB;
}

export function resolveBbtiChallengeCaseTrail({
  context,
  currentRound,
  nameA,
  nameB,
  topics,
  votes,
}: ResolveBbtiChallengeCaseTrailInput): BbtiChallengeCaseTrail | null {
  if (!context || topics.length === 0) return null;

  const meta = caseMeta(context);
  const voteByTopicId = new Map(votes.map((vote) => [vote.topicId, vote]));
  const boundedCurrentRound = Math.min(Math.max(currentRound, 0), topics.length - 1);
  const activeRoundIndex = voteByTopicId.has(topics[boundedCurrentRound]?.id ?? "")
    ? topics.findIndex((topic) => !voteByTopicId.has(topic.id))
    : boundedCurrentRound;
  const completedCount = topics.filter((topic) => voteByTopicId.has(topic.id)).length;
  const progressLabel = `${completedCount}/${topics.length} 回合已回应`;
  const steps: BbtiCaseTrailStep[] = topics.map((topic, index) => {
    const vote = voteByTopicId.get(topic.id) ?? null;
    const selectedSideName = vote ? sideName(vote.winner, nameA, nameB) : null;
    const state: BbtiCaseTrailStepState = vote
      ? "completed"
      : index === activeRoundIndex
        ? "current"
        : "upcoming";

    return {
      roundLabel: `R${index + 1}`,
      topicId: topic.id,
      topicTitle: topic.title,
      state,
      selectedSideName,
      responseLine: vote
        ? `这一票交给 ${selectedSideName}，下一句要回应「${meta.reviewQuestion}」。`
        : state === "current"
          ? `当前回合先看 ${topic.title}，再用原案由校准选择。`
          : "未开球，等前一回合完成后再接案由。",
    };
  });

  const copyText = [
    `BBTI案件轨迹：${meta.title}`,
    `版本：${context.caseVersion} · ${context.caseSourceVersion}`,
    `来源：${meta.sourceLabel} · ${meta.sourceDetail}`,
    `本场对线：${context.challengeTitle}`,
    `${meta.standardLabel}：${meta.standard}`,
    `追问：${meta.reviewQuestion}`,
    `进度：${progressLabel}`,
    ...steps
      .filter((step) => step.state !== "upcoming")
      .map((step) => `${step.roundLabel} ${step.topicTitle}：${step.selectedSideName ?? "待选择"}`),
  ].join("\n");

  return {
    caseVersion: context.caseVersion,
    caseSourceVersion: context.caseSourceVersion,
    sourceLabel: meta.sourceLabel,
    sourceDetail: meta.sourceDetail,
    title: meta.title,
    standardLabel: meta.standardLabel,
    standard: meta.standard,
    reviewQuestion: meta.reviewQuestion,
    progressLabel,
    steps,
    copyText,
  };
}
