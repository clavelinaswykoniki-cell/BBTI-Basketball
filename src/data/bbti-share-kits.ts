import {
  getBbtiShareTargetPreset,
  type BbtiShareLinkKind,
  type BbtiShareTargetCopyInput,
  type BbtiShareTargetId,
  type BbtiShareTargetTone,
} from "@/data/bbti-share-target-presets";

export type BbtiShareKitInput = BbtiShareTargetCopyInput;

export const BBTI_SHARE_ROUTE_SCOREBOARD_VERSION = "bbti-share-route-scoreboard-v1" as const;
export const BBTI_SHARE_ROUTE_SCOREBOARD_BOUNDARY = "本地分享路线比分牌，只复用当前结果、情境和推荐对线，不代表真实赛程、热度或用户行为。" as const;
export const BBTI_SHARE_LOCKER_ROOM_VERSION = "bbti-share-kit-locker-room-v1" as const;
export const BBTI_SHARE_LOCKER_ROOM_BOUNDARY = "本地分享更衣室，只把当前结果、双人复赛入口和开庭案由分流，不代表真实用户行为、热度或外部来源。" as const;
export const BBTI_SHARE_RETURN_LANE_CHECK_VERSION = "bbti-share-return-lane-check-v1" as const;
export const BBTI_SHARE_RETURN_LANE_CHECK_BOUNDARY =
  "本地分享回流体检，只检查当前短链接会回到结果、双人对比、开庭案由或事件案由，不代表真实点击、活跃或用户行为。" as const;

export type BbtiShareRouteScoreboardRowId = "event-tipoff" | "challenge-branch" | "share-return";
export type BbtiShareRouteScoreboardTarget = "daily-event" | "challenge" | "share";
export type BbtiShareLockerRoomRowId = "result-door" | "rematch-door" | "case-door";
export type BbtiShareLockerRoomTarget = "result" | "duo" | "challenge";
export type BbtiShareReturnLaneCheckRowId = "result-return" | "duo-return" | "challenge-return" | "event-return";
export type BbtiShareReturnLaneCheckTarget = "result" | "duo" | "challenge" | "event-challenge";
export type BbtiShareReturnLaneCheckStatus = "ready" | "fallback";

export interface BbtiShareRouteScoreboardRow {
  id: BbtiShareRouteScoreboardRowId;
  target: BbtiShareRouteScoreboardTarget;
  label: string;
  scoreLabel: string;
  title: string;
  body: string;
}

export interface BbtiShareRouteScoreboard {
  version: typeof BBTI_SHARE_ROUTE_SCOREBOARD_VERSION;
  boundary: typeof BBTI_SHARE_ROUTE_SCOREBOARD_BOUNDARY;
  code: string;
  sourceKitId: BbtiShareTargetId;
  eventId: string;
  eventTitle: string;
  challengeMatchupId: string;
  challengeTitle: string;
  routeCount: number;
  rows: BbtiShareRouteScoreboardRow[];
  copyText: string;
}

export interface BbtiShareLockerRoomRow {
  id: BbtiShareLockerRoomRowId;
  target: BbtiShareLockerRoomTarget;
  sourceKitId: BbtiShareTargetId;
  linkKind: BbtiShareLinkKind;
  label: string;
  title: string;
  body: string;
}

export interface BbtiShareLockerRoom {
  version: typeof BBTI_SHARE_LOCKER_ROOM_VERSION;
  boundary: typeof BBTI_SHARE_LOCKER_ROOM_BOUNDARY;
  code: string;
  rowCount: number;
  rows: BbtiShareLockerRoomRow[];
  copyText: string;
}

export interface BbtiShareReturnLaneCheckRow {
  id: BbtiShareReturnLaneCheckRowId;
  target: BbtiShareReturnLaneCheckTarget;
  status: BbtiShareReturnLaneCheckStatus;
  sourceKitId: BbtiShareTargetId | "none";
  linkKind: BbtiShareLinkKind | "none";
  label: string;
  title: string;
  body: string;
}

export interface BbtiShareReturnLaneCheck {
  version: typeof BBTI_SHARE_RETURN_LANE_CHECK_VERSION;
  boundary: typeof BBTI_SHARE_RETURN_LANE_CHECK_BOUNDARY;
  code: string;
  rowCount: number;
  rows: BbtiShareReturnLaneCheckRow[];
  copyText: string;
}

export interface BbtiShareKit {
  id: BbtiShareTargetId;
  title: string;
  tag: string;
  tone: BbtiShareTargetTone;
  channelLabel: string;
  audience: string;
  intent: string;
  composerHint: string;
  actionLabel: string;
  copyButtonLabel: string;
  linkBadge: string;
  linkLabel: string;
  boundaryNote: string;
  copy: string;
  linkKind: BbtiShareLinkKind;
  linkOptions?: {
    challengeMatchupId?: string;
    eventId?: string;
  };
  routeScoreboard?: BbtiShareRouteScoreboard;
}

const BASE_SHARE_TARGET_IDS: BbtiShareTargetId[] = [
  "scoreboard",
  "court-bait",
  "challenge",
  "duo-invite",
  "receipt",
];

export function resolveBbtiShareRouteScoreboard(
  input: BbtiShareKitInput,
): BbtiShareRouteScoreboard | null {
  const eventId = input.eventId;
  const challengeMatchupId = input.eventChallengeMatchupId ?? input.challengeMatchupId;
  if (!eventId || !challengeMatchupId) return null;

  const eventTitle = input.eventTitle ?? "情境加赛";
  const eventTag = input.eventTag ?? "Arena";
  const challengeTitle = input.eventChallengeMatchupTitle ?? input.challengeMatchupTitle ?? input.challengeTitle;
  const challengeCopy = input.eventChallengeCopy ?? input.challengeCopy;
  const rows: BbtiShareRouteScoreboardRow[] = [
    {
      id: "event-tipoff",
      target: "daily-event",
      label: "1Q",
      scoreLabel: eventTag,
      title: eventTitle,
      body: input.eventCourt && input.eventStakes
        ? `${input.eventCourt}｜${input.eventStakes}`
        : input.eventScenario ?? "同一人格，换个赛事情境再审一次。",
    },
    {
      id: "challenge-branch",
      target: "challenge",
      label: "2Q",
      scoreLabel: "MATCHUP",
      title: challengeTitle,
      body: challengeCopy,
    },
    {
      id: "share-return",
      target: "share",
      label: "OT",
      scoreLabel: "SHARE",
      title: "发群回流",
      body: `把 ${eventTag} 情境、${challengeTitle} 和结果链接打包给朋友，让下一轮从同一个案由接上。`,
    },
  ];

  return {
    version: BBTI_SHARE_ROUTE_SCOREBOARD_VERSION,
    boundary: BBTI_SHARE_ROUTE_SCOREBOARD_BOUNDARY,
    code: input.code,
    sourceKitId: "arena-event",
    eventId,
    eventTitle,
    challengeMatchupId,
    challengeTitle,
    routeCount: rows.length,
    rows,
    copyText: [
      "BBTI 路线比分牌",
      `${input.code} · ${eventTitle} · ${challengeTitle}`,
      ...rows.map((row, index) => `${index + 1}. ${row.label} ${row.scoreLabel}：${row.title}｜${row.body}`),
      `边界：${BBTI_SHARE_ROUTE_SCOREBOARD_BOUNDARY}`,
    ].join("\n"),
  };
}

function findShareKit(
  kits: BbtiShareKit[],
  predicate: (kit: BbtiShareKit) => boolean,
): BbtiShareKit {
  return kits.find(predicate) ?? kits[0];
}

function compactKitBody(kit: BbtiShareKit): string {
  return kit.intent || kit.composerHint || kit.copy.split("\n")[0] || kit.title;
}

function optionalShareKit(
  kits: BbtiShareKit[],
  predicate: (kit: BbtiShareKit) => boolean,
): BbtiShareKit | null {
  return kits.find(predicate) ?? null;
}

function buildShareReturnLaneRow({
  bodyWhenMissing,
  kit,
  label,
  readyBody,
  target,
  title,
  id,
}: {
  bodyWhenMissing: string;
  kit: BbtiShareKit | null;
  label: string;
  readyBody: string;
  target: BbtiShareReturnLaneCheckTarget;
  title: string;
  id: BbtiShareReturnLaneCheckRowId;
}): BbtiShareReturnLaneCheckRow {
  return {
    id,
    target,
    status: kit ? "ready" : "fallback",
    sourceKitId: kit?.id ?? "none",
    linkKind: kit?.linkKind ?? "none",
    label,
    title,
    body: kit ? readyBody : bodyWhenMissing,
  };
}

export function resolveBbtiShareReturnLaneCheck(input: {
  code: string;
  kits: BbtiShareKit[];
}): BbtiShareReturnLaneCheck | null {
  if (!input.kits.length) return null;

  const resultKit = optionalShareKit(input.kits, (kit) => kit.linkKind === "result");
  const duoKit = optionalShareKit(input.kits, (kit) => kit.linkKind === "compare-invite");
  const challengeKit = optionalShareKit(input.kits, (kit) => kit.linkKind === "challenge");
  const eventKit = optionalShareKit(input.kits, (kit) => kit.linkKind === "event-challenge");
  const rows: BbtiShareReturnLaneCheckRow[] = [
    buildShareReturnLaneRow({
      bodyWhenMissing: "缺少稳定结果链接时，回流只能退回当前结果页入口。",
      id: "result-return",
      kit: resultKit,
      label: "结果",
      readyBody: resultKit ? `稳定回到 ${input.code} 结果页：${compactKitBody(resultKit)}` : "",
      target: "result",
      title: "结果页回流",
    }),
    buildShareReturnLaneRow({
      bodyWhenMissing: "缺少双人邀请时，朋友不能直接补第二份 BBTI 报告。",
      id: "duo-return",
      kit: duoKit,
      label: "双人",
      readyBody: duoKit ? `只预填你的 code，不预设朋友人格：${compactKitBody(duoKit)}` : "",
      target: "duo",
      title: "双人报告入口",
    }),
    buildShareReturnLaneRow({
      bodyWhenMissing: "缺少命定对线时，约战链接会退回普通结果页。",
      id: "challenge-return",
      kit: challengeKit,
      label: "开庭",
      readyBody: challengeKit ? `带本地 challenge id 回到案由入口：${compactKitBody(challengeKit)}` : "",
      target: "challenge",
      title: "普通约战入口",
    }),
    buildShareReturnLaneRow({
      bodyWhenMissing: "当前没有事件约战上下文，事件回流不显示为可用。",
      id: "event-return",
      kit: eventKit,
      label: "事件",
      readyBody: eventKit ? `带 event + challenge 短标识回到同一个情境：${compactKitBody(eventKit)}` : "",
      target: "event-challenge",
      title: "事件约战入口",
    }),
  ];

  return {
    version: BBTI_SHARE_RETURN_LANE_CHECK_VERSION,
    boundary: BBTI_SHARE_RETURN_LANE_CHECK_BOUNDARY,
    code: input.code,
    rowCount: rows.length,
    rows,
    copyText: [
      "BBTI 分享回流体检",
      `类型：${input.code}`,
      ...rows.map((row, index) => `${index + 1}. ${row.label}｜${row.status === "ready" ? "可回流" : "缺上下文"}｜${row.title}｜${row.body}`),
      `边界：${BBTI_SHARE_RETURN_LANE_CHECK_BOUNDARY}`,
    ].join("\n"),
  };
}

export function resolveBbtiShareLockerRoom(input: {
  code: string;
  kits: BbtiShareKit[];
}): BbtiShareLockerRoom | null {
  if (!input.kits.length) return null;

  const resultKit = findShareKit(input.kits, (kit) => kit.id === "scoreboard" || kit.linkKind === "result");
  const rematchKit = findShareKit(input.kits, (kit) => kit.id === "duo-invite" || kit.linkKind === "compare-invite");
  const caseKit = findShareKit(input.kits, (kit) => kit.id === "arena-event" || kit.id === "challenge" || kit.linkKind === "event-challenge" || kit.linkKind === "challenge");
  const rows: BbtiShareLockerRoomRow[] = [
    {
      id: "result-door",
      target: "result",
      sourceKitId: resultKit.id,
      linkKind: resultKit.linkKind,
      label: "结果",
      title: resultKit.title,
      body: compactKitBody(resultKit),
    },
    {
      id: "rematch-door",
      target: "duo",
      sourceKitId: rematchKit.id,
      linkKind: rematchKit.linkKind,
      label: "复赛",
      title: rematchKit.title,
      body: compactKitBody(rematchKit),
    },
    {
      id: "case-door",
      target: "challenge",
      sourceKitId: caseKit.id,
      linkKind: caseKit.linkKind,
      label: "开庭",
      title: caseKit.title,
      body: compactKitBody(caseKit),
    },
  ];

  return {
    version: BBTI_SHARE_LOCKER_ROOM_VERSION,
    boundary: BBTI_SHARE_LOCKER_ROOM_BOUNDARY,
    code: input.code,
    rowCount: rows.length,
    rows,
    copyText: [
      "BBTI 分享更衣室",
      `类型：${input.code}`,
      ...rows.map((row, index) => `${index + 1}. ${row.label}：${row.title}｜${row.body}`),
      `边界：${BBTI_SHARE_LOCKER_ROOM_BOUNDARY}`,
    ].join("\n"),
  };
}

function buildShareKit(id: BbtiShareTargetId, input: BbtiShareKitInput): BbtiShareKit {
  const preset = getBbtiShareTargetPreset(id);
  const challengeMatchupId = id === "arena-event"
    ? input.eventChallengeMatchupId ?? input.challengeMatchupId
    : input.challengeMatchupId;
  const hasRequiredChallenge = !preset?.requires?.challengeMatchupId || Boolean(challengeMatchupId);
  const hasRequiredEvent = !preset?.requires?.eventId || Boolean(input.eventId);
  const hasRequirements = hasRequiredChallenge && hasRequiredEvent;
  const linkKind: BbtiShareLinkKind = hasRequirements
    ? preset?.linkKind ?? "result"
    : "result";
  const routeScoreboard = id === "arena-event"
    ? resolveBbtiShareRouteScoreboard(input)
    : null;

  return {
    id,
    title: preset?.title ?? id,
    tag: preset?.tag ?? "Share",
    tone: preset?.tone ?? "gold",
    channelLabel: preset?.channelLabel ?? "分享",
    audience: preset?.audience ?? "发给朋友",
    intent: preset?.intent ?? "复制这份 BBTI 报告。",
    composerHint: preset?.composerHint ?? "稳定分享文本。",
    actionLabel: preset?.actionLabel ?? "系统分享",
    copyButtonLabel: preset?.copyButtonLabel ?? "复制当前",
    linkBadge: hasRequirements
      ? preset?.linkBadge ?? "稳定结果"
      : preset?.fallbackLinkBadge ?? "稳定结果",
    linkLabel: hasRequirements
      ? preset?.linkLabel ?? "稳定结果链接"
      : "稳定结果链接 · 这次没有有效事件或约战入口",
    boundaryNote: preset?.boundaryNote ?? "稳定结果链接。",
    copy: (preset?.copyLines?.(input) ?? []).join("\n"),
    linkKind,
    linkOptions: linkKind === "challenge" || linkKind === "event-challenge"
      ? {
        challengeMatchupId,
        eventId: linkKind === "event-challenge" ? input.eventId : undefined,
      }
      : undefined,
    routeScoreboard: routeScoreboard ?? undefined,
  };
}

export function getBbtiShareKits(input: BbtiShareKitInput): BbtiShareKit[] {
  const targetIds: BbtiShareTargetId[] = input.eventId && input.eventChallengeMatchupId
    ? ["arena-event", "scoreboard", "court-bait", "challenge", "duo-invite", "receipt"]
    : BASE_SHARE_TARGET_IDS;

  return targetIds.map((id) => buildShareKit(id, input));
}
