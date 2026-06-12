export type BbtiShareTargetId =
  | "scoreboard"
  | "court-bait"
  | "challenge"
  | "duo-invite"
  | "receipt"
  | "arena-event"
  | "daily-event"
  | "return-duo";

export type BbtiShareTargetTone = "gold" | "purple" | "wine" | "blue";
export type BbtiShareLinkKind = "result" | "challenge" | "compare-invite" | "event-challenge";

export interface BbtiShareTargetCopyInput {
  code: string;
  emoji: string;
  typeName: string;
  tagline: string;
  spiritPlayer: string;
  compatibility: string;
  nemesis: string;
  debateWeapon: string;
  challengeTitle: string;
  challengeCopy: string;
  challengeMatchupId?: string;
  challengeMatchupTitle?: string;
  eventId?: string;
  eventTitle?: string;
  eventTag?: string;
  eventScenario?: string;
  eventGroupChatPrompt?: string;
  eventCourt?: string;
  eventStakes?: string;
  eventChallengeMatchupId?: string;
  eventChallengeMatchupTitle?: string;
  eventChallengeCopy?: string;
}

export interface BbtiShareTargetPreset {
  id: BbtiShareTargetId;
  title: string;
  tag: string;
  tone: BbtiShareTargetTone;
  linkKind: BbtiShareLinkKind;
  linkLabel: string;
  requires?: {
    challengeMatchupId?: boolean;
    eventId?: boolean;
  };
  fallbackLinkBadge?: string;
  channelLabel: string;
  audience: string;
  intent: string;
  composerHint: string;
  actionLabel: string;
  copyButtonLabel: string;
  linkBadge: string;
  boundaryNote: string;
  copyLines?: (input: BbtiShareTargetCopyInput) => string[];
}

function challengeLine(input: BbtiShareTargetCopyInput): string {
  return input.challengeMatchupTitle
    ? [`下一场我被系统安排去打：${input.challengeMatchupTitle}`, input.challengeCopy].join("\n")
    : input.challengeCopy;
}

export const BBTI_SHARE_TARGET_PRESETS: BbtiShareTargetPreset[] = [
  {
    id: "scoreboard",
    title: "晒结果",
    tag: "Scoreboard",
    tone: "gold",
    linkKind: "result",
    linkLabel: "稳定结果链接 · 只依赖 BBTI code",
    channelLabel: "群聊战报",
    audience: "发给懂球群",
    intent: "先亮出人格，再逼朋友也测一次。",
    composerHint: "适合丢进群里当开场球，朋友点开后看到的是稳定结果页。",
    actionLabel: "发群聊战报",
    copyButtonLabel: "复制战报",
    linkBadge: "稳定结果",
    boundaryNote: "只带你的 BBTI code，不带答题历史。",
    copyLines: (input) => [
      `我刚测出 BBTI：${input.code} ${input.emoji} ${input.typeName}`,
      `我的看球底层逻辑：${input.debateWeapon}`,
      `最适合跟 ${input.compatibility} 组双核，最容易和 ${input.nemesis} 打到加时。`,
      "你也测一下，别只会说自己懂球。",
    ],
  },
  {
    id: "court-bait",
    title: "拉仇恨",
    tag: "Court Bait",
    tone: "purple",
    linkKind: "result",
    linkLabel: "稳定结果链接 · 只依赖 BBTI code",
    channelLabel: "挑衅开场",
    audience: "发给老对线对象",
    intent: "把自己的标准先摆出来，让对面挑刺。",
    composerHint: "适合熟人局，语气更冲，但只怼观点，不怼人。",
    actionLabel: "发挑衅开场",
    copyButtonLabel: "复制开场",
    linkBadge: "稳定结果",
    boundaryNote: "只回到结果页，不自动进入投票。",
    copyLines: (input) => [
      `我是 ${input.code} ${input.typeName}，我的对线武器是：${input.debateWeapon}`,
      `最佳搭档：${input.compatibility}，死对头：${input.nemesis}`,
      "谁不服，先测完再来开庭。",
    ],
  },
  {
    id: "challenge",
    title: "约战",
    tag: "Play Next",
    tone: "wine",
    linkKind: "challenge",
    linkLabel: "约战链接 · 带命定对线入口",
    requires: {
      challengeMatchupId: true,
    },
    fallbackLinkBadge: "稳定结果",
    channelLabel: "直接约战",
    audience: "发给想拉进辩论的人",
    intent: "让朋友点开后直接看到你的命定对线。",
    composerHint: "适合把结果页变成下一场选边开战。",
    actionLabel: "发起约战",
    copyButtonLabel: "复制约战",
    linkBadge: "约战回流",
    boundaryNote: "带命定对线入口，但不携带任何外部热度数据。",
    copyLines: (input) => [
      `${input.emoji} ${input.typeName} 的下一题：${input.challengeTitle}`,
      challengeLine(input),
      "别空喊 GOAT，直接进球场选边。",
    ],
  },
  {
    id: "duo-invite",
    title: "拉朋友对比",
    tag: "Duo",
    tone: "blue",
    linkKind: "compare-invite",
    linkLabel: "双人对比邀请链接 · 只带你的 BBTI code",
    channelLabel: "双人对比",
    audience: "发给固定搭档",
    intent: "只带你的 code，让对方填第二个 code 生成化学反应报告。",
    composerHint: "适合一对一私聊，不会伪造对方结果。",
    actionLabel: "发对比邀请",
    copyButtonLabel: "复制邀请",
    linkBadge: "对比邀请",
    boundaryNote: "只预填你的 code，不预设对方人格。",
    copyLines: (input) => [
      `我测出来是 ${input.code} ${input.emoji} ${input.typeName}`,
      "你也测一个 BBTI，直接跟我生成双人球脑化学反应报告。",
      `先提示：我的对线武器是「${input.debateWeapon}」。`,
    ],
  },
  {
    id: "receipt",
    title: "个人动态",
    tag: "Receipt",
    tone: "blue",
    linkKind: "result",
    linkLabel: "稳定结果链接 · 只依赖 BBTI code",
    channelLabel: "动态签名",
    audience: "发到个人动态",
    intent: "把结果写成短档案，适合截图或当状态文案。",
    composerHint: "语气收一点，像一条个人篮球档案。",
    actionLabel: "发动态文案",
    copyButtonLabel: "复制动态",
    linkBadge: "稳定结果",
    boundaryNote: "稳定结果链接，适合截图后再补一句自己的标准。",
    copyLines: (input) => [
      `篮球人格报告：${input.code}`,
      `${input.emoji} ${input.typeName}｜${input.tagline}`,
      `灵魂球员：${input.spiritPlayer}`,
      "我看球不是只看输赢，是先看标准。",
    ],
  },
  {
    id: "arena-event",
    title: "事件约战",
    tag: "Arena",
    tone: "wine",
    linkKind: "event-challenge",
    linkLabel: "事件回流链接 · 带当前情境和推荐对线",
    requires: {
      eventId: true,
      challengeMatchupId: true,
    },
    fallbackLinkBadge: "稳定结果",
    channelLabel: "事件约战",
    audience: "发给想接加赛的人",
    intent: "把当前 Arena Event 和推荐对线一起发出去，让朋友点开后回到同一个情境。",
    composerHint: "适合在结果页选完情境后发群，不靠每日轮换猜同一题。",
    actionLabel: "发事件约战",
    copyButtonLabel: "复制事件题",
    linkBadge: "事件回流",
    boundaryNote: "带当前事件和推荐对线，不携带答题历史或外部热度数据。",
    copyLines: (input) => [
      `${input.emoji} ${input.typeName} 的 Arena Event：${input.eventTitle ?? "情境加赛"}`,
      input.eventCourt && input.eventStakes
        ? `场景：${input.eventCourt}｜${input.eventStakes}`
        : input.eventScenario ?? "同一人格，换个赛事情境再审一次。",
      input.eventGroupChatPrompt ? `群聊题：${input.eventGroupChatPrompt}` : challengeLine(input),
      input.eventChallengeMatchupTitle
        ? `这题我直接开到：${input.eventChallengeMatchupTitle}`
        : `这题我直接开到：${input.challengeTitle}`,
      "别只看结果页，进来接这场加赛。",
    ],
  },
  {
    id: "daily-event",
    title: "今日复盘",
    tag: "Daily",
    tone: "wine",
    linkKind: "event-challenge",
    linkLabel: "事件回流链接 · 带今日事件和推荐对线",
    requires: {
      eventId: true,
      challengeMatchupId: true,
    },
    fallbackLinkBadge: "稳定结果",
    channelLabel: "群聊续盘",
    audience: "发给回访玩家",
    intent: "把上次人格带进今天的事件题，让朋友直接接加赛。",
    composerHint: "适合回访入口，不改写上次结果。",
    actionLabel: "发今日复盘",
    copyButtonLabel: "复制今日题",
    linkBadge: "事件回流",
    boundaryNote: "只带事件入口，不生成新的 BBTI 结果。",
  },
  {
    id: "return-duo",
    title: "回访对比",
    tag: "Return Duo",
    tone: "blue",
    linkKind: "compare-invite",
    linkLabel: "双人对比邀请链接 · 只带你的 BBTI code",
    channelLabel: "回访双人对比",
    audience: "发给还没测的朋友",
    intent: "用上次结果拉朋友补第二份报告。",
    composerHint: "适合 Return Bench，不预设对方人格。",
    actionLabel: "发回访对比",
    copyButtonLabel: "复制回访邀请",
    linkBadge: "对比邀请",
    boundaryNote: "只预填你的 code，不预设对方人格。",
  },
];

export function getBbtiShareTargetPreset(id: string): BbtiShareTargetPreset | null {
  return BBTI_SHARE_TARGET_PRESETS.find((preset) => preset.id === id) ?? null;
}
