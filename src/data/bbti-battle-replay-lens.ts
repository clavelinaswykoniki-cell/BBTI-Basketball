import type { BbtiChallengeCaseContext } from "./bbti-challenge-case";
import type { DebateTopic } from "./debates";
import {
  getCourtSideAdvisorRead,
  type CourtSideAdvisorRead,
} from "./courtside-advisor";
import type { ReplayStatBomb, VoteSide } from "./stat-bombs";

export const BBTI_BATTLE_REPLAY_LENS_VERSION = "bbti-battle-replay-lens-v1" as const;
export const BBTI_BATTLE_REPLAY_LENS_BOUNDARY = "本地单回合战术镜头，只是本场阅读，不代表外部结论或用户热度。" as const;
export const BBTI_BATTLE_REPLAY_COPY_KIT_VERSION = "bbti-battle-replay-copy-kit-v1" as const;
export const BBTI_BATTLE_REPLAY_COPY_KIT_BOUNDARY = "本地复盘话术包，只复用本场镜头，不代表真实赢面、外部排名或用户热度。" as const;

export type BbtiBattleReplayLensStepId =
  | "current-claim"
  | "counter-replay"
  | "coach-cue"
  | "next-pressure";

export type BbtiBattleReplayLensTarget =
  | "current-topic"
  | "replay"
  | "advisor"
  | "next-topic";

export type BbtiBattleReplayCopyKitItemId =
  | "group-recap"
  | "counter-punch"
  | "next-question";

export interface BbtiBattleReplayLensStep {
  id: BbtiBattleReplayLensStepId;
  target: BbtiBattleReplayLensTarget;
  label: string;
  title: string;
  body: string;
}

export interface ResolveBbtiBattleReplayLensInput {
  caseContext?: BbtiChallengeCaseContext | null;
  matchupId?: string | null;
  nameA: string;
  nameB: string;
  nextTopic?: DebateTopic | null;
  roundNumber: number;
  statBomb?: ReplayStatBomb | null;
  topic: DebateTopic;
  votedFor: VoteSide;
}

export interface BbtiBattleReplayLens {
  version: typeof BBTI_BATTLE_REPLAY_LENS_VERSION;
  boundary: typeof BBTI_BATTLE_REPLAY_LENS_BOUNDARY;
  caseSource: BbtiChallengeCaseContext["source"] | "none";
  matchupId: string;
  nextTopicId: string;
  replaySource: string;
  roundNumber: number;
  stepCount: number;
  steps: BbtiBattleReplayLensStep[];
  topicId: string;
  votedSide: VoteSide;
  copyText: string;
}

export interface BbtiBattleReplayCopyKitItem {
  id: BbtiBattleReplayCopyKitItemId;
  label: string;
  title: string;
  body: string;
  copyText: string;
}

export interface BbtiBattleReplayCopyKit {
  version: typeof BBTI_BATTLE_REPLAY_COPY_KIT_VERSION;
  boundary: typeof BBTI_BATTLE_REPLAY_COPY_KIT_BOUNDARY;
  sourceLensVersion: typeof BBTI_BATTLE_REPLAY_LENS_VERSION;
  matchupId: string;
  topicId: string;
  roundNumber: number;
  itemCount: number;
  items: BbtiBattleReplayCopyKitItem[];
}

function caseOrigin(context: BbtiChallengeCaseContext | null): string {
  if (!context) return "普通对线";
  switch (context.source) {
    case "film-room":
      return `Q${context.questionId} 录像室案由`;
    case "result":
      return "BBTI 报告案由";
    case "arena-event":
      return `${context.eventTag} 情境案由`;
  }
}

function votedClaim(topic: DebateTopic, votedFor: VoteSide): string {
  return votedFor === "kobe" ? topic.kobe.claim : topic.lebron.claim;
}

function replayLine(statBomb: ReplayStatBomb | null | undefined, advisorRead: CourtSideAdvisorRead): string {
  if (statBomb) return statBomb.stat;
  return advisorRead.counterRead;
}

export function resolveBbtiBattleReplayLens(
  input: ResolveBbtiBattleReplayLensInput,
): BbtiBattleReplayLens {
  const caseContext = input.caseContext ?? null;
  const advisorRead = getCourtSideAdvisorRead({
    caseContext,
    nameA: input.nameA,
    nameB: input.nameB,
    statBomb: input.statBomb,
    topic: input.topic,
    votedFor: input.votedFor,
  });
  const nextTopicTitle = input.nextTopic?.title ?? "准备进入赛后结算";
  const nextTopicBody = input.nextTopic
    ? `下一问是「${nextTopicTitle}」。先带着这句反问继续：${advisorRead.reviewQuestion}`
    : `这轮之后进入结算。先保留这句反问：${advisorRead.reviewQuestion}`;
  const steps: BbtiBattleReplayLensStep[] = [
    {
      id: "current-claim",
      target: "current-topic",
      label: "当前站队",
      title: `${advisorRead.votedName} 的回合`,
      body: votedClaim(input.topic, input.votedFor),
    },
    {
      id: "counter-replay",
      target: "replay",
      label: "回放反证",
      title: input.statBomb ? `偏向 ${advisorRead.opponentName}` : "等待反证",
      body: replayLine(input.statBomb, advisorRead),
    },
    {
      id: "coach-cue",
      target: "advisor",
      label: "场边助教",
      title: advisorRead.tag,
      body: advisorRead.coachCue,
    },
    {
      id: "next-pressure",
      target: "next-topic",
      label: "下一问压力",
      title: `${caseOrigin(caseContext)} · ${nextTopicTitle}`,
      body: nextTopicBody,
    },
  ];

  return {
    version: BBTI_BATTLE_REPLAY_LENS_VERSION,
    boundary: BBTI_BATTLE_REPLAY_LENS_BOUNDARY,
    caseSource: caseContext?.source ?? "none",
    matchupId: input.matchupId ?? "unknown",
    nextTopicId: input.nextTopic?.id ?? "complete",
    replaySource: input.statBomb?.source ?? "none",
    roundNumber: input.roundNumber,
    stepCount: steps.length,
    steps,
    topicId: input.topic.id,
    votedSide: input.votedFor,
    copyText: [
      `BBTI 单回合战术镜头：${input.topic.title}`,
      `Round ${input.roundNumber} · ${advisorRead.votedName}`,
      ...steps.map((step, index) => `${index + 1}. ${step.label}：${step.title}｜${step.body}`),
      `边界：${BBTI_BATTLE_REPLAY_LENS_BOUNDARY}`,
    ].join("\n"),
  };
}

function lensStep(lens: BbtiBattleReplayLens, id: BbtiBattleReplayLensStepId): BbtiBattleReplayLensStep {
  const step = lens.steps.find((item) => item.id === id);
  if (!step) {
    throw new Error(`Missing Battle Replay Lens step: ${id}`);
  }

  return step;
}

export function resolveBbtiBattleReplayCopyKit(
  lens: BbtiBattleReplayLens,
): BbtiBattleReplayCopyKit {
  const currentClaim = lensStep(lens, "current-claim");
  const counterReplay = lensStep(lens, "counter-replay");
  const coachCue = lensStep(lens, "coach-cue");
  const nextPressure = lensStep(lens, "next-pressure");
  const items: BbtiBattleReplayCopyKitItem[] = [
    {
      id: "group-recap",
      label: "发群复盘",
      title: `${currentClaim.title} · Round ${lens.roundNumber}`,
      body: `先贴站队，再贴回放反证：${counterReplay.title}`,
      copyText: [
        `BBTI 发群复盘｜Round ${lens.roundNumber}`,
        `站队：${currentClaim.title}｜${currentClaim.body}`,
        `反证：${counterReplay.title}｜${counterReplay.body}`,
        `边界：${BBTI_BATTLE_REPLAY_COPY_KIT_BOUNDARY}`,
      ].join("\n"),
    },
    {
      id: "counter-punch",
      label: "反打一句",
      title: counterReplay.title,
      body: coachCue.body,
      copyText: [
        "BBTI 反打话术",
        `对方会抓：${counterReplay.body}`,
        `我的场边提醒：${coachCue.body}`,
        `边界：${BBTI_BATTLE_REPLAY_COPY_KIT_BOUNDARY}`,
      ].join("\n"),
    },
    {
      id: "next-question",
      label: "接下一问",
      title: nextPressure.title,
      body: nextPressure.body,
      copyText: [
        "BBTI 下一问接球",
        `${nextPressure.title}`,
        `${nextPressure.body}`,
        `边界：${BBTI_BATTLE_REPLAY_COPY_KIT_BOUNDARY}`,
      ].join("\n"),
    },
  ];

  return {
    version: BBTI_BATTLE_REPLAY_COPY_KIT_VERSION,
    boundary: BBTI_BATTLE_REPLAY_COPY_KIT_BOUNDARY,
    sourceLensVersion: lens.version,
    matchupId: lens.matchupId,
    topicId: lens.topicId,
    roundNumber: lens.roundNumber,
    itemCount: items.length,
    items,
  };
}
