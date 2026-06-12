import { scoreBbtiAnswer, type BbtiAnswer, type BbtiQuestion, type PoleKey } from "./bbti";
import { getBbtiAnswerPoll, type BbtiAnswerPoll } from "./bbti-answer-polls";

export interface BbtiAnswerRevealPole {
  pole: PoleKey;
  label: string;
  points: number;
}

export interface BbtiAnswerReveal {
  tag: string;
  title: string;
  summary: string;
  tacticalNote: string;
  blindSpot: string;
  poll: BbtiAnswerPoll | null;
  poles: BbtiAnswerRevealPole[];
}

export interface BbtiPoleMeta {
  label: string;
  tag: string;
  title: string;
  summary: string;
  tacticalNote: string;
  blindSpot: string;
}

const POLE_META: Record<PoleKey, BbtiPoleMeta> = {
  O: {
    label: "进攻先手",
    tag: "火力回合",
    title: "你先把防守打变形",
    summary: "你的第一反应是用得分威胁改变对方站位，让比赛先进入自己的节奏。",
    tacticalNote: "适合快攻、单点爆破和连续追分，能把犹豫的回合直接打成优势。",
    blindSpot: "别让高难度出手替代回合管理，火力不是每次都等于好球。",
  },
  D: {
    label: "防守地基",
    tag: "上锁回合",
    title: "你先把对手的舒服点拆掉",
    summary: "你的篮球直觉更相信防守、篮板和回合控制，先让对面难受再谈反击。",
    tacticalNote: "适合抢七、客场和低比分局，能把比赛拖进自己能读懂的泥地。",
    blindSpot: "只守不攻会把主动权交出去，关键时刻也要准备终结方案。",
  },
  A: {
    label: "数据证据",
    tag: "查表回合",
    title: "你要先看证据链再表态",
    summary: "你会把效率、产量、样本和可复制性放在前面，讨厌只靠滤镜定案。",
    tacticalNote: "适合拆 GOAT 论战和冠军归因，能把群聊情绪拉回评价标准。",
    blindSpot: "数据能解释很多事，但有些压力回合需要结合录像和语境。",
  },
  E: {
    label: "名场面记忆",
    tag: "高光回合",
    title: "你会被比赛的瞬间击中",
    summary: "你的判断更容易被名场面、情绪和时代记忆点燃，因为篮球不只是表格。",
    tacticalNote: "适合讲述球员为何被记住，能把冷冰冰的比较变成有温度的故事。",
    blindSpot: "别让一场高光吞掉长期样本，记忆很强，但也会偏心。",
  },
  I: {
    label: "巨星接管",
    tag: "单核回合",
    title: "你相信最后有人能硬解",
    summary: "你更愿意把关键回合交给最高天赋，相信超巨能在混乱里制造答案。",
    tacticalNote: "适合最后一攻、逆风局和系列赛单点惩罚，能把责任压到最强点。",
    blindSpot: "英雄球会吸走全队参与感，队友站太久也会让战术变窄。",
  },
  T: {
    label: "体系解题",
    tag: "战术回合",
    title: "你相信五个人一起把题解开",
    summary: "你更看重空间、轮转、无球和教练设计，认为好体系能持续制造好机会。",
    tacticalNote: "适合长系列赛和建队讨论，能解释为什么一套打法会反复赢球。",
    blindSpot: "体系需要终结点，最后两分钟不能只把锅甩给战术板。",
  },
  L: {
    label: "主队忠诚",
    tag: "主场回合",
    title: "你把时间和城市也算进伟大",
    summary: "你更在意陪伴、坚守和共同记忆，冠军之外还有身份认同。",
    tacticalNote: "适合讨论一城一队、主队文化和球迷关系，能守住篮球的情感面。",
    blindSpot: "忠诚不该替管理层背锅，浪漫也需要现实阵容支撑。",
  },
  R: {
    label: "冠军窗口",
    tag: "争冠回合",
    title: "你会优先计算夺冠概率",
    summary: "你更看重窗口期、阵容配置和最终结果，愿意为了冠军接受路线变化。",
    tacticalNote: "适合讨论交易、抱团和争冠工程，能把职业选择放进现实成本里。",
    blindSpot: "只看戒指会抹平过程差异，也容易低估球迷为什么会生气。",
  },
};

export function getBbtiPoleMeta(pole: PoleKey): BbtiPoleMeta {
  return POLE_META[pole];
}

export function getBbtiAnswerReveal(
  question: BbtiQuestion,
  answer: BbtiAnswer,
): BbtiAnswerReveal | null {
  const scoredPoles = Object.entries(scoreBbtiAnswer(question, answer))
    .map(([pole, points]) => ({
      pole: pole as PoleKey,
      label: POLE_META[pole as PoleKey].label,
      points: points ?? 0,
    }))
    .filter((item) => item.points > 0)
    .sort((a, b) => b.points - a.points);

  const primary = scoredPoles[0];
  if (!primary) return null;

  const secondary = scoredPoles[1];
  const meta = POLE_META[primary.pole];
  const title = secondary
    ? `${meta.title}，同时带一点${POLE_META[secondary.pole].label}`
    : meta.title;
  const tacticalNote = secondary
    ? `${meta.tacticalNote} 这次选择还把你轻推向「${POLE_META[secondary.pole].label}」。`
    : meta.tacticalNote;

  return {
    tag: meta.tag,
    title,
    summary: meta.summary,
    tacticalNote,
    blindSpot: meta.blindSpot,
    poll: getBbtiAnswerPoll(question, answer),
    poles: scoredPoles,
  };
}
