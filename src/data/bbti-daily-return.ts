import {
  getBbtiArenaEventDateKey,
  getBbtiArenaEvents,
  getBbtiTodayArenaEventId,
  type BbtiArenaEvent,
} from "./bbti-arena-events";
import type { BbtiChallengeCaseContext } from "./bbti-challenge-case";
import { getBbtiChallengeMatchups, type BbtiChallengeMatchup } from "./bbti-challenges";
import {
  buildSharedFilmRoomClipFromKey,
  getBbtiFilmRoomDimensionLabel,
  type StoredBbtiResult,
} from "./bbti-playbook";
import { hydrateBbtiSharedChallenge } from "./bbti-shared-challenge-hydration";

export const BBTI_RETURN_STREAK_VERSION = "bbti-return-streaks-v1" as const;
export const BBTI_DAILY_RETURN_REMIX_VERSION = "bbti-daily-return-remix-v1" as const;
export const BBTI_RETURN_STREAK_BOUNDARY = "本地回访连线，不代表连续登录或真实活跃。" as const;
export const BBTI_DAILY_RETURN_REMIX_BOUNDARY = "本地每日主场切换，不代表真实赛程、真实回访或用户行为。" as const;

export interface BbtiDailyReturnPlay {
  dateKey: string;
  event: BbtiArenaEvent | null;
  challenges: BbtiChallengeMatchup[];
  featuredChallenge: BbtiChallengeMatchup | null;
  caseContext: BbtiChallengeCaseContext | null;
}

export type BbtiReturnStreakStepId = "last-report" | "daily-event" | "featured-challenge";
export type BbtiReturnStreakTarget = "result" | "daily-event" | "challenge";

export interface BbtiReturnStreakStep {
  id: BbtiReturnStreakStepId;
  target: BbtiReturnStreakTarget;
  label: string;
  title: string;
  body: string;
  ctaLabel: string;
}

export interface BbtiReturnStreak {
  version: typeof BBTI_RETURN_STREAK_VERSION;
  code: string;
  dateKey: string;
  eventId: string | null;
  featuredChallengeId: string | null;
  caseContextSource: BbtiChallengeCaseContext["source"] | null;
  label: string;
  headline: string;
  summary: string;
  boundary: typeof BBTI_RETURN_STREAK_BOUNDARY;
  steps: BbtiReturnStreakStep[];
  copyText: string;
}

export type BbtiDailyReturnRemixLaneId = "daily-event" | "film-room-return" | "featured-challenge";
export type BbtiDailyReturnRemixTarget = "daily-event" | "film-room" | "challenge";

export interface BbtiDailyReturnRemixLane {
  id: BbtiDailyReturnRemixLaneId;
  target: BbtiDailyReturnRemixTarget;
  label: string;
  title: string;
  body: string;
  ctaLabel: string;
}

export interface BbtiDailyReturnRemix {
  version: typeof BBTI_DAILY_RETURN_REMIX_VERSION;
  code: string;
  dateKey: string;
  eventId: string | null;
  featuredChallengeId: string | null;
  filmRoomClipKey: string;
  laneCount: number;
  lanes: BbtiDailyReturnRemixLane[];
  boundary: typeof BBTI_DAILY_RETURN_REMIX_BOUNDARY;
  copyText: string;
}

const BBTI_DAILY_RETURN_FILM_ROOM_CLIP_KEYS = [
  "q12-m0",
  "q14-m1",
  "q24-m2",
  "q29-m3",
] as const;

function modeLabel(mode: StoredBbtiResult["mode"]): string {
  if (mode === "full") return "抢七长卷";
  if (mode === "quick") return "常规赛版";
  return "快攻版";
}

export function getBbtiDailyReturnFilmRoomClipKey(code: string): string {
  const normalized = code.trim().toUpperCase();
  const seed = normalized.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return BBTI_DAILY_RETURN_FILM_ROOM_CLIP_KEYS[seed % BBTI_DAILY_RETURN_FILM_ROOM_CLIP_KEYS.length];
}

export function getBbtiDailyReturnPlay(code: string, date = new Date()): BbtiDailyReturnPlay {
  const dateKey = getBbtiArenaEventDateKey(date);
  const events = getBbtiArenaEvents(code);
  const challenges = getBbtiChallengeMatchups(code);
  const todayEventId = getBbtiTodayArenaEventId(code, date);
  const event = events.find((item) => item.id === todayEventId) ?? events[0] ?? null;
  const featuredChallenge = event
    ? challenges.find((item) => item.category === event.recommendedCategory) ?? challenges[0] ?? null
    : challenges[0] ?? null;
  const hydratedChallenge = event && featuredChallenge
    ? hydrateBbtiSharedChallenge({
      code,
      challengeMatchupId: featuredChallenge.matchupId,
      eventId: event.id,
    })
    : null;

  return {
    dateKey,
    event,
    challenges,
    featuredChallenge,
    caseContext: hydratedChallenge?.caseContext ?? null,
  };
}

export function resolveBbtiDailyReturnRemix(
  result: StoredBbtiResult,
  dailyReturn = getBbtiDailyReturnPlay(result.code),
): BbtiDailyReturnRemix {
  const eventTitle = dailyReturn.event?.title ?? "今日主场加赛";
  const featuredTitle = dailyReturn.featuredChallenge?.title ?? result.challenge;
  const filmRoomClipKey = getBbtiDailyReturnFilmRoomClipKey(result.code);
  const clip = buildSharedFilmRoomClipFromKey(filmRoomClipKey);
  const filmRoomTitle = clip
    ? `Q${clip.questionId} · ${getBbtiFilmRoomDimensionLabel(clip.dimension)}`
    : "录像室回流";
  const filmRoomBody = clip
    ? `用「${clip.answerText}」重开一段本地选择回放，不推断完整答题记录。`
    : "用一段本地选择回放重新进入录像室，不推断完整答题记录。";
  const lanes: BbtiDailyReturnRemixLane[] = [
    {
      id: "daily-event",
      target: "daily-event",
      label: "今日事件",
      title: eventTitle,
      body: dailyReturn.event?.pressureTest ?? "用今天的主场题重新打开这份球脑报告。",
      ctaLabel: "带结果入场",
    },
    {
      id: "film-room-return",
      target: "film-room",
      label: "录像室回流",
      title: filmRoomTitle,
      body: filmRoomBody,
      ctaLabel: "看录像室回流",
    },
    {
      id: "featured-challenge",
      target: "challenge",
      label: "推荐对线",
      title: featuredTitle,
      body: dailyReturn.featuredChallenge?.label ?? "从上次挑战直接接一场新对线。",
      ctaLabel: resolveBbtiDailyReturnCaseContext(dailyReturn) ? "带案由接加赛" : "接推荐加赛",
    },
  ];

  return {
    version: BBTI_DAILY_RETURN_REMIX_VERSION,
    code: result.code,
    dateKey: dailyReturn.dateKey,
    eventId: dailyReturn.event?.id ?? null,
    featuredChallengeId: dailyReturn.featuredChallenge?.matchupId ?? null,
    filmRoomClipKey,
    laneCount: lanes.length,
    lanes,
    boundary: BBTI_DAILY_RETURN_REMIX_BOUNDARY,
    copyText: [
      "BBTI 每日主场切换",
      `${result.emoji} ${result.code} ${result.name}`,
      ...lanes.map((lane, index) => `${index + 1}. ${lane.label}：${lane.title}｜${lane.body}`),
      `边界：${BBTI_DAILY_RETURN_REMIX_BOUNDARY}`,
    ].join("\n"),
  };
}

export function resolveBbtiDailyReturnCaseContext(
  dailyReturn: BbtiDailyReturnPlay,
): BbtiChallengeCaseContext | null {
  const { caseContext, event, featuredChallenge } = dailyReturn;
  if (
    caseContext?.source === "arena-event"
    && event
    && featuredChallenge
    && caseContext.eventId === event.id
    && caseContext.challengeMatchupId === featuredChallenge.matchupId
  ) {
    return caseContext;
  }

  return null;
}

export function resolveBbtiReturnStreak(
  result: StoredBbtiResult,
  dailyReturn = getBbtiDailyReturnPlay(result.code),
): BbtiReturnStreak {
  const eventTitle = dailyReturn.event?.title ?? "今日主场加赛";
  const featuredTitle = dailyReturn.featuredChallenge?.title ?? result.challenge;
  const featuredCaseContext = resolveBbtiDailyReturnCaseContext(dailyReturn);
  const summary = `从上次 ${modeLabel(result.mode)} 的 ${result.code} ${result.name}，接到今日「${eventTitle}」，再进入「${featuredTitle}」。`;
  const steps: BbtiReturnStreakStep[] = [
    {
      id: "last-report",
      target: "result",
      label: "上次报告",
      title: `${result.code} · ${result.name}`,
      body: `${modeLabel(result.mode)} · 下次挑战：${result.challenge}`,
      ctaLabel: "查看上次结果",
    },
    {
      id: "daily-event",
      target: "daily-event",
      label: "今日事件",
      title: eventTitle,
      body: dailyReturn.event?.pressureTest ?? "用今天的主场题重新打开这份球脑报告。",
      ctaLabel: "带结果入场",
    },
    {
      id: "featured-challenge",
      target: "challenge",
      label: "推荐对线",
      title: featuredTitle,
      body: dailyReturn.featuredChallenge?.label ?? "从上次挑战直接接一场新对线。",
      ctaLabel: featuredCaseContext ? "带案由接加赛" : "接推荐加赛",
    },
  ];

  return {
    version: BBTI_RETURN_STREAK_VERSION,
    code: result.code,
    dateKey: dailyReturn.dateKey,
    eventId: dailyReturn.event?.id ?? null,
    featuredChallengeId: dailyReturn.featuredChallenge?.matchupId ?? null,
    caseContextSource: featuredCaseContext?.source ?? null,
    label: "本地回访连线",
    headline: `${result.name} 的主场回访线`,
    summary,
    boundary: BBTI_RETURN_STREAK_BOUNDARY,
    steps,
    copyText: [
      "BBTI 回访主线",
      `${result.emoji} ${result.code} ${result.name}`,
      summary,
      ...steps.map((step, index) => `${index + 1}. ${step.label}：${step.title}｜${step.body}`),
      `边界：${BBTI_RETURN_STREAK_BOUNDARY}`,
    ].join("\n"),
  };
}
