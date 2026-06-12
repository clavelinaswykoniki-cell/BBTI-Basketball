export type BbtiIncomingReturnSource = "film-room" | "arena-event" | "result";

export type BbtiNextPlayActionId =
  | "pending-compare"
  | "incoming-return"
  | "daily-event"
  | "primary-challenge"
  | "film-room"
  | "share";

export type BbtiNextPlayTone = "gold" | "blue" | "wine" | "purple";

export type BbtiNextPlayQaKey =
  | "pending-compare"
  | "incoming-film-room"
  | "incoming-arena-event"
  | "incoming-result"
  | "daily-event"
  | "primary-challenge"
  | "film-room"
  | "share";

export interface BbtiNextPlayAction {
  id: BbtiNextPlayActionId;
  qaKey: BbtiNextPlayQaKey;
  eyebrow: string;
  title: string;
  body: string;
  buttonLabel: string;
  secondaryButtonLabel?: string;
  tone: BbtiNextPlayTone;
}

export interface ResolveBbtiNextPlayActionsInput {
  hasFilmRoomClips: boolean;
  incomingReturn?: {
    source: BbtiIncomingReturnSource;
    title: string;
  } | null;
  pendingCompare?: {
    code: string;
    name: string;
  } | null;
  dailyEvent?: {
    title: string;
    tag: string;
  } | null;
  primaryChallengeTitle?: string | null;
}

function incomingCopy(source: BbtiIncomingReturnSource, title: string): BbtiNextPlayAction {
  if (source === "film-room") {
    return {
      id: "incoming-return",
      qaKey: "incoming-film-room",
      eyebrow: "INBOUND CLIP",
      title: "先接这段录像室案由",
      body: `${title} 已经带着录像室证据进场，点开后直接选边。`,
      buttonLabel: "现在接球",
      tone: "gold",
    };
  }

  if (source === "arena-event") {
    return {
      id: "incoming-return",
      qaKey: "incoming-arena-event",
      eyebrow: "ARENA RETURN",
      title: "接这场情境加赛",
      body: `${title} 带着事件压力题回流，适合马上开战。`,
      buttonLabel: "现在接球",
      tone: "wine",
    };
  }

  return {
    id: "incoming-return",
    qaKey: "incoming-result",
    eyebrow: "CHALLENGE LINK",
    title: "接赛后约战",
    body: `${title} 是这份球探报告的回流对线，先选边再开庭。`,
    buttonLabel: "现在接球",
    tone: "gold",
  };
}

function pushUnique(actions: BbtiNextPlayAction[], action: BbtiNextPlayAction): void {
  if (actions.some((item) => item.id === action.id)) return;
  actions.push(action);
}

export function resolveBbtiNextPlayActions({
  dailyEvent,
  hasFilmRoomClips,
  incomingReturn,
  pendingCompare,
  primaryChallengeTitle,
}: ResolveBbtiNextPlayActionsInput): BbtiNextPlayAction[] {
  const actions: BbtiNextPlayAction[] = [];

  if (pendingCompare) {
    pushUnique(actions, {
      id: "pending-compare",
      qaKey: "pending-compare",
      eyebrow: "DUO REPORT",
      title: "生成双人球脑报告",
      body: `TA 是 ${pendingCompare.code} ${pendingCompare.name}，你已经测完，可以直接合成对比。`,
      buttonLabel: "生成对比",
      secondaryButtonLabel: "不接邀请",
      tone: "blue",
    });
  }

  if (incomingReturn) {
    pushUnique(actions, incomingCopy(incomingReturn.source, incomingReturn.title));
  }

  if (dailyEvent) {
    pushUnique(actions, {
      id: "daily-event",
      qaKey: "daily-event",
      eyebrow: dailyEvent.tag,
      title: "今日主场加赛",
      body: `${dailyEvent.title} 正在等你用这份 BBTI 结果入场。`,
      buttonLabel: "看今日题",
      tone: "wine",
    });
  }

  if (primaryChallengeTitle) {
    pushUnique(actions, {
      id: "primary-challenge",
      qaKey: "primary-challenge",
      eyebrow: "PLAY NEXT",
      title: "命定开战",
      body: `${primaryChallengeTitle} 是系统给这份球探报告安排的第一场对线。`,
      buttonLabel: "命定开战",
      tone: "gold",
    });
  }

  if (hasFilmRoomClips) {
    pushUnique(actions, {
      id: "film-room",
      qaKey: "film-room",
      eyebrow: "FILM ROOM",
      title: "复盘补强",
      body: "回看关键选择、教练暂停和反证弹药，再决定怎么开口。",
      buttonLabel: "看录像室",
      tone: "purple",
    });
  }

  pushUnique(actions, {
    id: "share",
    qaKey: "share",
    eyebrow: "SHARE KIT",
    title: "拉朋友进局",
    body: "复制战报、约战或双人邀请，把下一回合丢进群里。",
    buttonLabel: "去分享包",
    tone: "blue",
  });

  return actions.slice(0, 3);
}
