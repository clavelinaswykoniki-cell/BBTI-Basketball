import type { BbtiChallengeCaseContext } from "./bbti-challenge-case";
import type {
  BbtiChallengeLaneScoreboard,
  BbtiChallengeLaneScoreboardRow,
} from "./bbti-challenges";

export const BBTI_CHALLENGE_REPLAY_SEEDS_VERSION = "bbti-challenge-replay-seeds-v1" as const;
export const BBTI_CHALLENGE_REPLAY_SEEDS_BOUNDARY = "本地开庭种子，只复用本地结果、回流案由和本场镜头，不代表外部结论或用户行为。" as const;
export const BBTI_CHALLENGE_PICK_REPLAY_KIT_VERSION = "bbti-challenge-pick-replay-kit-v1" as const;
export const BBTI_CHALLENGE_PICK_REPLAY_KIT_BOUNDARY = "本地选边回看卡，只复用当前 BBTI 推荐对线、路线板、案由、压力题和开庭种子，不代表真实赛程、热度、外部来源或用户行为。" as const;

export type BbtiChallengeReplaySeedSource =
  | "result-card"
  | "shared-return"
  | "battle-replay";

export type BbtiChallengeReplaySeedRowId =
  | "source-lock"
  | "opening-pressure"
  | "replay-lens";

export type BbtiChallengeReplaySeedTarget =
  | "return"
  | "case"
  | "replay";

export type BbtiChallengePickReplayKitItemId =
  | "case-lock"
  | "pressure-check"
  | "first-possession";

export type BbtiChallengePickReplayKitTarget =
  | "case"
  | "pressure"
  | "tipoff";

export interface BbtiChallengeReplaySeedRow {
  id: BbtiChallengeReplaySeedRowId;
  target: BbtiChallengeReplaySeedTarget;
  label: string;
  title: string;
  body: string;
  meta: string;
}

export interface ResolveBbtiChallengeReplaySeedsInput {
  caseContext?: BbtiChallengeCaseContext | null;
  challengeCategory?: string | null;
  challengeLabel?: string | null;
  challengeMatchupId: string;
  challengeTitle: string;
  code: string;
  pressureLine?: string | null;
  replayBody?: string | null;
  replayTitle?: string | null;
  returnHref?: string | null;
  source: BbtiChallengeReplaySeedSource;
}

export interface BbtiChallengeReplaySeeds {
  version: typeof BBTI_CHALLENGE_REPLAY_SEEDS_VERSION;
  boundary: typeof BBTI_CHALLENGE_REPLAY_SEEDS_BOUNDARY;
  caseSource: BbtiChallengeCaseContext["source"] | "none";
  challengeMatchupId: string;
  challengeTitle: string;
  code: string;
  returnHref: string | null;
  rowCount: number;
  rows: BbtiChallengeReplaySeedRow[];
  source: BbtiChallengeReplaySeedSource;
}

export interface BbtiChallengePickReplayKitItem {
  id: BbtiChallengePickReplayKitItemId;
  target: BbtiChallengePickReplayKitTarget;
  sourceLaneId: BbtiChallengeLaneScoreboardRow["id"];
  sourceMatchupId: string;
  category: BbtiChallengeLaneScoreboardRow["category"];
  label: string;
  title: string;
  body: string;
  copyText: string;
}

export interface BbtiChallengePickReplayKit {
  version: typeof BBTI_CHALLENGE_PICK_REPLAY_KIT_VERSION;
  boundary: typeof BBTI_CHALLENGE_PICK_REPLAY_KIT_BOUNDARY;
  sourceLaneScoreboardVersion: BbtiChallengeLaneScoreboard["version"];
  code: string;
  itemCount: number;
  items: BbtiChallengePickReplayKitItem[];
  copyText: string;
}

function sourceLabel(source: BbtiChallengeReplaySeedSource): string {
  switch (source) {
    case "result-card":
      return "赛后挑战";
    case "shared-return":
      return "分享回流";
    case "battle-replay":
      return "单回合镜头";
  }
}

function sourceBody(input: ResolveBbtiChallengeReplaySeedsInput): string {
  if (input.source === "shared-return") {
    return `先进 ${input.challengeTitle}，保留这条链接能复原的案由。`;
  }

  if (input.source === "battle-replay") {
    return `这轮已经有镜头素材，下一步接回 ${input.challengeTitle} 的同一场辩论。`;
  }

  return `从 ${input.code} 的赛后报告进入 ${input.challengeTitle}，先把开庭入口定住。`;
}

function caseAngle(context: BbtiChallengeCaseContext | null, fallbackLine: string | null | undefined): {
  body: string;
  meta: string;
  title: string;
} {
  if (!context) {
    return {
      body: fallbackLine ?? "普通约战链接只保留对线入口，进场后按本场题目继续。",
      meta: "普通约战",
      title: "先按普通对线开庭",
    };
  }

  switch (context.source) {
    case "film-room":
      return {
        body: context.crossExamQuestion,
        meta: `Q${context.questionId} · ${context.dimensionLabel}`,
        title: context.crossExamTitle,
      };
    case "arena-event":
      return {
        body: context.eventPressureTest,
        meta: context.eventTag,
        title: context.eventTitle,
      };
    case "result":
      return {
        body: context.caseQuestion,
        meta: context.originLabel,
        title: context.recommendationReason,
      };
  }
}

function replaySeed(input: ResolveBbtiChallengeReplaySeedsInput, context: BbtiChallengeCaseContext | null): {
  body: string;
  meta: string;
  title: string;
} {
  if (input.replayTitle || input.replayBody) {
    return {
      body: input.replayBody ?? "用上一回合的站队和反证，先抛出下一句追问。",
      meta: "本场镜头",
      title: input.replayTitle ?? "接上一回合",
    };
  }

  if (context?.evidenceLine) {
    return {
      body: context.evidenceLine,
      meta: "证据线",
      title: "先贴证物再开打",
    };
  }

  return {
    body: input.pressureLine ?? "开场先问对方这一局到底用什么标准判胜负。",
    meta: "开场球",
    title: "第一句追问",
  };
}

export function resolveBbtiChallengeReplaySeeds(
  input: ResolveBbtiChallengeReplaySeedsInput,
): BbtiChallengeReplaySeeds {
  const caseContext = input.caseContext ?? null;
  const angle = caseAngle(caseContext, input.pressureLine);
  const replay = replaySeed(input, caseContext);
  const category = input.challengeCategory ?? caseContext?.challengeCategory ?? "开庭";
  const label = input.challengeLabel ?? caseContext?.challengeLabel ?? sourceLabel(input.source);
  const rows: BbtiChallengeReplaySeedRow[] = [
    {
      id: "source-lock",
      target: "return",
      label: "入口",
      title: `${sourceLabel(input.source)} · ${category}`,
      body: sourceBody(input),
      meta: label,
    },
    {
      id: "opening-pressure",
      target: "case",
      label: "案由",
      title: angle.title,
      body: angle.body,
      meta: angle.meta,
    },
    {
      id: "replay-lens",
      target: "replay",
      label: "第一球",
      title: replay.title,
      body: replay.body,
      meta: replay.meta,
    },
  ];

  return {
    version: BBTI_CHALLENGE_REPLAY_SEEDS_VERSION,
    boundary: BBTI_CHALLENGE_REPLAY_SEEDS_BOUNDARY,
    caseSource: caseContext?.source ?? "none",
    challengeMatchupId: input.challengeMatchupId,
    challengeTitle: input.challengeTitle,
    code: input.code,
    returnHref: input.returnHref ?? null,
    rowCount: rows.length,
    rows,
    source: input.source,
  };
}

export function buildBbtiChallengeReplaySeedsCopy(seeds: BbtiChallengeReplaySeeds): string {
  return [
    `BBTI 开庭种子：${seeds.challengeTitle}`,
    `类型：${seeds.code}`,
    `来源：${sourceLabel(seeds.source)}｜${seeds.caseSource}`,
    ...seeds.rows.map((row, index) => `${index + 1}. ${row.label}：${row.title}｜${row.body}`),
    seeds.returnHref ? `入口：${seeds.returnHref}` : null,
    `边界：${BBTI_CHALLENGE_REPLAY_SEEDS_BOUNDARY}`,
  ].filter(Boolean).join("\n");
}

function laneAt(
  laneScoreboard: BbtiChallengeLaneScoreboard,
  index: number,
): BbtiChallengeLaneScoreboardRow {
  const row = laneScoreboard.rows[index] ?? laneScoreboard.rows[0];
  if (!row) {
    throw new Error("BBTI challenge pick replay kit requires at least one lane row.");
  }

  return row;
}

function pickReplayItem({
  body,
  id,
  label,
  row,
  target,
  title,
  copyLines,
}: {
  body: string;
  id: BbtiChallengePickReplayKitItemId;
  label: string;
  row: BbtiChallengeLaneScoreboardRow;
  target: BbtiChallengePickReplayKitTarget;
  title: string;
  copyLines: string[];
}): BbtiChallengePickReplayKitItem {
  return {
    id,
    target,
    sourceLaneId: row.id,
    sourceMatchupId: row.matchupId,
    category: row.category,
    label,
    title,
    body,
    copyText: [
      ...copyLines,
      `边界：${BBTI_CHALLENGE_PICK_REPLAY_KIT_BOUNDARY}`,
    ].join("\n"),
  };
}

export function resolveBbtiChallengePickReplayKit(
  laneScoreboard: BbtiChallengeLaneScoreboard,
): BbtiChallengePickReplayKit {
  const caseRow = laneAt(laneScoreboard, 0);
  const pressureRow = laneAt(laneScoreboard, 1);
  const tipoffRow = laneAt(laneScoreboard, 2);
  const pressureLine = pressureRow.pressureQuestion ?? "先问清楚：这一局到底用什么标准判胜负。";
  const tipoffLine = tipoffRow.shareCopy ?? tipoffRow.reason;
  const items: BbtiChallengePickReplayKitItem[] = [
    pickReplayItem({
      id: "case-lock",
      target: "case",
      row: caseRow,
      label: "案由锁定",
      title: `${caseRow.routeLabel} · ${caseRow.title}`,
      body: `先确认这局为什么要开：${caseRow.label}。${caseRow.reason}`,
      copyLines: [
        `BBTI 选边回看｜${laneScoreboard.code}`,
        `案由：${caseRow.routeLabel}｜${caseRow.title}`,
        `为什么开：${caseRow.reason}`,
      ],
    }),
    pickReplayItem({
      id: "pressure-check",
      target: "pressure",
      row: pressureRow,
      label: "压力题",
      title: `${pressureRow.routeLabel} · ${pressureRow.title}`,
      body: pressureLine,
      copyLines: [
        `BBTI 压力题回看｜${laneScoreboard.code}`,
        `${pressureRow.category}：${pressureRow.title}`,
        `压力题：${pressureLine}`,
      ],
    }),
    pickReplayItem({
      id: "first-possession",
      target: "tipoff",
      row: tipoffRow,
      label: "第一回合",
      title: `${tipoffRow.routeLabel} · ${tipoffRow.title}`,
      body: `进场第一句先贴：${tipoffLine}`,
      copyLines: [
        `BBTI 第一回合提醒｜${laneScoreboard.code}`,
        `${tipoffRow.category}：${tipoffRow.title}`,
        `先手：${tipoffLine}`,
      ],
    }),
  ];

  return {
    version: BBTI_CHALLENGE_PICK_REPLAY_KIT_VERSION,
    boundary: BBTI_CHALLENGE_PICK_REPLAY_KIT_BOUNDARY,
    sourceLaneScoreboardVersion: laneScoreboard.version,
    code: laneScoreboard.code,
    itemCount: items.length,
    items,
    copyText: [
      `BBTI 选边赛前回看｜${laneScoreboard.code}`,
      ...items.map((item, index) => `${index + 1}. ${item.label}：${item.title}｜${item.body}`),
      `边界：${BBTI_CHALLENGE_PICK_REPLAY_KIT_BOUNDARY}`,
    ].join("\n"),
  };
}
