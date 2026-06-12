import type { BbtiChallengeMatchup } from "./bbti-challenges";

export interface BbtiArenaEvent {
  id: string;
  title: string;
  tag: string;
  context: BbtiArenaEventContext;
  venue: BbtiArenaVenue;
  pressureTier: BbtiArenaPressureTier;
  audienceFrame: BbtiArenaAudienceFrame;
  court: string;
  stakes: string;
  recommendedCategory: "同温层局" | "反向审判" | "破防加赛";
  scenario: string;
  instinct: string;
  pressureTest: string;
  blindSpot: string;
  groupChatPrompt: string;
}

export const BBTI_ARENA_EVENT_BRACKET_VERSION = "bbti-arena-event-bracket-v1" as const;
export const BBTI_ARENA_EVENT_BRACKET_BOUNDARY = "本地情境路线树，不代表真实赛程、真实热度或用户行为。" as const;

export type BbtiArenaEventContext =
  | "clutch"
  | "front-office"
  | "development"
  | "finals"
  | "media"
  | "road"
  | "locker-room";

export type BbtiArenaVenue = "home" | "away" | "neutral" | "off-court";

export type BbtiArenaPressureTier = "medium" | "high" | "elimination";

export type BbtiArenaAudienceFrame =
  | "home-identity"
  | "road-skepticism"
  | "elimination-pressure"
  | "public-opinion"
  | "front-office-table"
  | "development-patience"
  | "locker-room-trust";

export type BbtiArenaEventBracketRouteId = "event-tipoff" | "challenge-branch" | "share-return";
export type BbtiArenaEventBracketTarget = "daily-event" | "challenge" | "share";

export interface BbtiArenaEventBracketRoute {
  id: BbtiArenaEventBracketRouteId;
  target: BbtiArenaEventBracketTarget;
  label: string;
  title: string;
  body: string;
  ctaLabel: string;
}

export interface BbtiArenaEventBracket {
  version: typeof BBTI_ARENA_EVENT_BRACKET_VERSION;
  code: string;
  eventId: string;
  eventTitle: string;
  challengeMatchupId: string;
  challengeTitle: string;
  recommendedCategory: BbtiArenaEvent["recommendedCategory"];
  routeCount: number;
  boundary: typeof BBTI_ARENA_EVENT_BRACKET_BOUNDARY;
  routes: BbtiArenaEventBracketRoute[];
  copyText: string;
}

export const BBTI_ARENA_EVENT_CONTEXTS: Array<{
  id: BbtiArenaEventContext;
  label: string;
  shortLabel: string;
}> = [
  { id: "clutch", label: "生死球", shortLabel: "Clutch" },
  { id: "front-office", label: "管理层", shortLabel: "Front Office" },
  { id: "development", label: "养成局", shortLabel: "Rebuild" },
  { id: "finals", label: "总决赛", shortLabel: "Finals" },
  { id: "media", label: "媒体日", shortLabel: "Media" },
  { id: "road", label: "客场连战", shortLabel: "Road" },
  { id: "locker-room", label: "更衣室", shortLabel: "Locker Room" },
];

export type BbtiArenaLensFilterId =
  | "home-identity"
  | "road-skepticism"
  | "elimination-pressure"
  | "public-opinion";

export type BbtiArenaLensFilter =
  | {
    id: BbtiArenaLensFilterId;
    label: string;
    kind: "venue";
    value: BbtiArenaVenue;
  }
  | {
    id: BbtiArenaLensFilterId;
    label: string;
    kind: "pressureTier";
    value: BbtiArenaPressureTier;
  }
  | {
    id: BbtiArenaLensFilterId;
    label: string;
    kind: "audienceFrame";
    value: BbtiArenaAudienceFrame;
  };

export const BBTI_ARENA_VENUE_LABELS: Record<BbtiArenaVenue, string> = {
  home: "主场",
  away: "客场",
  neutral: "中立",
  "off-court": "场外",
};

export const BBTI_ARENA_PRESSURE_LABELS: Record<BbtiArenaPressureTier, string> = {
  medium: "常规压力",
  high: "高压回合",
  elimination: "淘汰压力",
};

export const BBTI_ARENA_AUDIENCE_FRAME_LABELS: Record<BbtiArenaAudienceFrame, string> = {
  "home-identity": "主场身份",
  "road-skepticism": "客场质疑",
  "elimination-pressure": "生死球审判",
  "public-opinion": "舆论复盘",
  "front-office-table": "管理层账本",
  "development-patience": "养成耐心",
  "locker-room-trust": "更衣室信任",
};

export const BBTI_ARENA_LENS_FILTERS: BbtiArenaLensFilter[] = [
  { id: "home-identity", label: "主场身份", kind: "venue", value: "home" },
  { id: "road-skepticism", label: "客场质疑", kind: "venue", value: "away" },
  { id: "elimination-pressure", label: "淘汰压力", kind: "pressureTier", value: "elimination" },
  { id: "public-opinion", label: "舆论复盘", kind: "audienceFrame", value: "public-opinion" },
];

export function getBbtiArenaEventStorageKey(code: string): string {
  return `bbti:arena-event:${code}`;
}

export function getBbtiArenaEventDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function stableHash(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function styleLine(style: string): string {
  return style === "O"
    ? "你会先问：这球谁能把比分打穿？"
    : "你会先问：这球谁能让对面彻底失速？";
}

function evidenceLine(evidence: string): string {
  return evidence === "A"
    ? "你的第一反应是翻样本、效率和回合质量。"
    : "你的第一反应是想起某个名场面和那一秒的情绪。";
}

function roleLine(role: string): string {
  return role === "I"
    ? "你更信一个巨星在最高压回合自己造答案。"
    : "你更信空间、轮转和队友适配一起解决比赛。";
}

function ambitionLine(ambition: string): string {
  return ambition === "L"
    ? "你会替身份认同、城市和一人一城多辩三句。"
    : "你会把冠军窗口、资源配置和最终结果摆在最前面。";
}

export function getBbtiArenaEvents(code: string): BbtiArenaEvent[] {
  const [style, evidence, role, ambition] = code;

  return [
    {
      id: "game-7",
      title: "抢七最后 90 秒",
      tag: "Game 7",
      context: "clutch",
      venue: "neutral",
      pressureTier: "elimination",
      audienceFrame: "elimination-pressure",
      court: "中立噪音",
      stakes: "一球定生死",
      recommendedCategory: "破防加赛",
      scenario: "落后 2 分，暂停回来，球馆只剩噪音和心跳。",
      instinct: `${styleLine(style)}${roleLine(role)}`,
      pressureTest: role === "I"
        ? "你要证明英雄球不是任性，而是最高压环境里最短的解题路径。"
        : "你要证明体系不是甩锅，而是让每个人都站在最正确的位置。",
      blindSpot: style === "O"
        ? "别忘了最后一攻之前，先要保证对面不能轻松拿两分。"
        : "别把防守正确性说满，落后时总得有人把球投进。",
      groupChatPrompt: `抢七最后 90 秒，我这个 ${code} 会把球给谁？别回避，直接选。`,
    },
    {
      id: "trade-deadline",
      title: "交易截止日会议",
      tag: "Front Office",
      context: "front-office",
      venue: "off-court",
      pressureTier: "high",
      audienceFrame: "front-office-table",
      court: "总经理办公室",
      stakes: "未来资产换现在",
      recommendedCategory: "反向审判",
      scenario: "球队只差最后一块拼图，但要动你喜欢的核心队友。",
      instinct: `${ambitionLine(ambition)}${evidenceLine(evidence)}`,
      pressureTest: ambition === "L"
        ? "你要说清楚：留下核心到底是文化价值，还是只是舍不得。"
        : "你要说清楚：换来冠军窗口时，牺牲身份认同的成本谁来付。",
      blindSpot: evidence === "A"
        ? "表格能告诉你胜率，但不能完全告诉你更衣室会不会裂。"
        : "情绪能保护记忆，但不能替球队解决轮换短板。",
      groupChatPrompt: `交易截止日到了，我这个 ${code} 是保留老班底，还是梭哈冠军窗口？`,
    },
    {
      id: "rebuild-year",
      title: "重建第三年",
      tag: "Rebuild",
      context: "development",
      venue: "home",
      pressureTier: "medium",
      audienceFrame: "development-patience",
      court: "年轻队更衣室",
      stakes: "耐心还是清算",
      recommendedCategory: "同温层局",
      scenario: "球队还在输，但年轻核心开始打出未来感。",
      instinct: `${evidenceLine(evidence)}${ambitionLine(ambition)}`,
      pressureTest: evidence === "A"
        ? "你要证明成长曲线和真实贡献不是两张漂亮趋势图。"
        : "你要证明陪伴感不是滤镜，而是球队文化真正能积累的资产。",
      blindSpot: ambition === "L"
        ? "忠诚不是无限续杯，管理层摆烂也需要被审判。"
        : "戒指路线不是万能答案，年轻核心也需要被允许犯错。",
      groupChatPrompt: `如果主队重建第三年还没进季后赛，我这个 ${code} 还愿不愿意陪？`,
    },
    {
      id: "finals-adjustment",
      title: "总决赛 G5 调整",
      tag: "Finals",
      context: "finals",
      venue: "away",
      pressureTier: "high",
      audienceFrame: "road-skepticism",
      court: "总决赛客场",
      stakes: "系列赛风向",
      recommendedCategory: "破防加赛",
      scenario: "系列赛 2-2，上一场对面已经破解你的第一套答案。",
      instinct: `${styleLine(style)}${evidenceLine(evidence)}`,
      pressureTest: evidence === "A"
        ? "你要证明样本趋势能指导下一场，而不是事后解释上一场。"
        : "你要证明名场面不是回忆滤镜，而是能逼出真实调整的比赛记忆。",
      blindSpot: role === "I"
        ? "别把所有调整都压在一个人的手感上，对面也会提前夹击。"
        : "别把战术复杂度说成万能钥匙，总决赛最后还是要有人终结回合。",
      groupChatPrompt: `总决赛 2-2 被对面摸透，我这个 ${code} 是换战术，还是继续信第一核心？`,
    },
    {
      id: "media-day-storm",
      title: "媒体日被追问",
      tag: "Media Day",
      context: "media",
      venue: "off-court",
      pressureTier: "high",
      audienceFrame: "public-opinion",
      court: "发布会长桌",
      stakes: "公开表态",
      recommendedCategory: "反向审判",
      scenario: "记者连续追问：你的标准到底是冠军、数据、忠诚，还是场面记忆？",
      instinct: `${ambitionLine(ambition)}${roleLine(role)}`,
      pressureTest: ambition === "R"
        ? "你要说明冠军标准不是墙头草，而是一套可复核的争冠逻辑。"
        : "你要说明忠诚不是拒绝现实，而是长期关系也能成为篮球价值。",
      blindSpot: evidence === "E"
        ? "发布会不能只靠情绪高光，反方会追你要可复述的标准。"
        : "发布会也不是论文答辩，标准太冷会失去球迷共鸣。",
      groupChatPrompt: `媒体日只给一句话，我这个 ${code} 会怎么解释自己的篮球标准？`,
    },
    {
      id: "road-back-to-back",
      title: "客场背靠背",
      tag: "Road B2B",
      context: "road",
      venue: "away",
      pressureTier: "high",
      audienceFrame: "road-skepticism",
      court: "第二晚客场",
      stakes: "体能和纪律",
      recommendedCategory: "同温层局",
      scenario: "上一晚刚打到加时，第二天又要在客场面对高强度防守。",
      instinct: `${styleLine(style)}${ambitionLine(ambition)}`,
      pressureTest: style === "O"
        ? "你要证明进攻爆点能穿过疲劳，而不是只在体能充足时好看。"
        : "你要证明防守纪律能撑过背靠背，而不是把疲劳当成失误借口。",
      blindSpot: role === "T"
        ? "轮换能保护体能，但关键时刻也要明确谁负责出手。"
        : "核心能硬扛一晚，但背靠背会放大每个队友的短板。",
      groupChatPrompt: `客场背靠背体能见底，我这个 ${code} 会先保进攻火力，还是先保防守纪律？`,
    },
    {
      id: "locker-room-friction",
      title: "更衣室意见分裂",
      tag: "Locker",
      context: "locker-room",
      venue: "off-court",
      pressureTier: "high",
      audienceFrame: "locker-room-trust",
      court: "赛后更衣室",
      stakes: "队内话语权",
      recommendedCategory: "反向审判",
      scenario: "连败之后，核心、教练组和老将对下一步打法各说各话。",
      instinct: `${roleLine(role)}${evidenceLine(evidence)}`,
      pressureTest: role === "T"
        ? "你要证明团队共识不是和稀泥，而是能真正改变下一场的执行。"
        : "你要证明核心拍板不是独断，而是在混乱时提供最清楚的责任线。",
      blindSpot: ambition === "L"
        ? "护住更衣室文化很重要，但输球会让每句老派价值观都被重新审问。"
        : "追冠军窗口很现实，但频繁清洗关系也会让球队失去信任底盘。",
      groupChatPrompt: `更衣室已经吵起来了，我这个 ${code} 会站核心、站体系，还是站管理层？`,
    },
  ];
}

export function getBbtiTodayArenaEventId(code: string, date = new Date()): string {
  const events = getBbtiArenaEvents(code);
  if (!events.length) return "";
  const dateKey = getBbtiArenaEventDateKey(date);
  return events[stableHash(`${code}:${dateKey}:arena-event`) % events.length].id;
}

export function resolveBbtiArenaEventBracket({
  challenge,
  code,
  event,
}: {
  challenge: BbtiChallengeMatchup;
  code: string;
  event: BbtiArenaEvent;
}): BbtiArenaEventBracket {
  const routes: BbtiArenaEventBracketRoute[] = [
    {
      id: "event-tipoff",
      target: "daily-event",
      label: "第一站",
      title: event.title,
      body: `${event.scenario} ${event.pressureTest}`,
      ctaLabel: "复制情境题",
    },
    {
      id: "challenge-branch",
      target: "challenge",
      label: "第二站",
      title: challenge.title,
      body: `按「${event.recommendedCategory}」进入 ${challenge.label}：${challenge.reason}`,
      ctaLabel: "带案由开战",
    },
    {
      id: "share-return",
      target: "share",
      label: "第三站",
      title: "发群回流",
      body: `把 ${event.tag} 情境、${challenge.title} 和盲点提醒打包给朋友，让下一轮从同一个案由接上。`,
      ctaLabel: "去分享包",
    },
  ];

  return {
    version: BBTI_ARENA_EVENT_BRACKET_VERSION,
    code,
    eventId: event.id,
    eventTitle: event.title,
    challengeMatchupId: challenge.matchupId,
    challengeTitle: challenge.title,
    recommendedCategory: event.recommendedCategory,
    routeCount: routes.length,
    boundary: BBTI_ARENA_EVENT_BRACKET_BOUNDARY,
    routes,
    copyText: [
      "BBTI 情境路线树",
      `${code} · ${event.title} · ${challenge.title}`,
      ...routes.map((route, index) => `${index + 1}. ${route.label}：${route.title}｜${route.body}`),
      `边界：${BBTI_ARENA_EVENT_BRACKET_BOUNDARY}`,
    ].join("\n"),
  };
}
