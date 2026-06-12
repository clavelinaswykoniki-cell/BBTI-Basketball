import type { PoleKey } from "./bbti";
import type { BbtiFilmRoomClip } from "./bbti-playbook";

export interface BbtiFilmRoomContradictionClip {
  clipKey: string;
  questionId: number;
  label: string;
  prompt: string;
  answerText: string;
  tag: string;
}

export interface BbtiFilmRoomContradiction {
  id: string;
  axis: string;
  title: string;
  question: string;
  standardA: string;
  standardB: string;
  shareLine: string;
  primaryClipKey: string;
  clipA: BbtiFilmRoomContradictionClip;
  clipB: BbtiFilmRoomContradictionClip;
  poles: readonly [PoleKey, PoleKey];
}

interface PoleSignal {
  clip: BbtiFilmRoomClip;
  clipIndex: number;
  pole: PoleKey;
  label: string;
  points: number;
}

interface TensionPair {
  id: string;
  priority: number;
  axis: string;
  poles: readonly [PoleKey, PoleKey];
  title: string;
  question: string;
  standards: readonly [string, string];
  shareLine: string;
}

type SortableContradiction = BbtiFilmRoomContradiction & {
  sortKey: string;
};

const TENSION_PAIRS: TensionPair[] = [
  {
    id: "AE",
    priority: 1,
    axis: "证据方式",
    poles: ["A", "E"],
    title: "数据证据 vs 名场面记忆",
    question: "当一题让你先查表，另一题又被镜头点燃，最终判案时你愿意把样本和高光各给多少权重？",
    standards: [
      "数据派要交代样本、对手、时代和可复制性，不能只甩有利截图。",
      "名场面派要说明那个镜头为什么能代表长期价值，不能只靠情绪封口。",
    ],
    shareLine: "这组矛盾不是谁懂不懂球，而是表格证据和录像记忆谁先上庭。",
  },
  {
    id: "IT",
    priority: 2,
    axis: "赢球逻辑",
    poles: ["I", "T"],
    title: "巨星接管 vs 体系解题",
    question: "你既相信最后有人硬解，又承认五个人能把题解开；到了最后两分钟，到底谁拥有第一责任？",
    standards: [
      "个人硬解要证明它能穿透包夹和错位，而不是把坏出手包装成担当。",
      "体系解题要证明它能处理最高压回合，而不是把终结责任藏进战术板。",
    ],
    shareLine: "这组矛盾的审查点是：篮球是五个人的游戏，但最后一球常常逼出一个名字。",
  },
  {
    id: "LR",
    priority: 3,
    axis: "球迷身份",
    poles: ["L", "R"],
    title: "主队忠诚 vs 冠军窗口",
    question: "你一边把城市和陪伴算进伟大，一边又承认冠军窗口很残酷；球星什么时候可以离开？",
    standards: [
      "忠诚派要说明坚守的赢球成本由谁承担，不能让球员替管理层无限背锅。",
      "冠军派要说明路线成本和身份代价，不能让戒指数量自动删除过程差异。",
    ],
    shareLine: "这组矛盾适合发群：忠诚很贵，但冠军窗口也不会等人。",
  },
  {
    id: "OD",
    priority: 4,
    axis: "攻防成本",
    poles: ["O", "D"],
    title: "进攻高光 vs 防守账单",
    question: "你既会被爆分点燃，也会奖励锁死对手；同一场抢七里，哪种价值先决定比赛？",
    standards: [
      "进攻派要证明高光能持续改写防守，而不是只留下一个炸裂镜头。",
      "防守派要证明控制能兑换胜负闭环，而不是只把比赛拖进低比分。",
    ],
    shareLine: "这组矛盾的核心账本是：得分能杀人，防守也能改命。",
  },
];

function clipRef(signal: PoleSignal): BbtiFilmRoomContradictionClip {
  return {
    clipKey: signal.clip.clipKey,
    questionId: signal.clip.questionId,
    label: signal.label,
    prompt: signal.clip.prompt,
    answerText: signal.clip.answerText,
    tag: signal.clip.coachTimeout.tag,
  };
}

function signalsByPole(clips: BbtiFilmRoomClip[]): Map<PoleKey, PoleSignal[]> {
  const map = new Map<PoleKey, PoleSignal[]>();

  clips.forEach((clip, clipIndex) => {
    clip.coachTimeout.poles.forEach((impact) => {
      const next: PoleSignal = {
        clip,
        clipIndex,
        pole: impact.pole,
        label: impact.label,
        points: impact.points,
      };
      map.set(impact.pole, [...(map.get(impact.pole) ?? []), next]);
    });
  });

  return map;
}

function bestSignalPair(
  leftSignals: PoleSignal[],
  rightSignals: PoleSignal[],
): { left: PoleSignal; right: PoleSignal } | null {
  const candidates = leftSignals
    .flatMap((left) => rightSignals.map((right) => ({ left, right })))
    .sort((a, b) => {
      const sameClipDiff =
        Number(a.left.clip.questionId !== a.right.clip.questionId) -
        Number(b.left.clip.questionId !== b.right.clip.questionId);
      if (sameClipDiff !== 0) return sameClipDiff;
      const balanceDiff =
        Math.min(b.left.points, b.right.points) - Math.min(a.left.points, a.right.points);
      if (balanceDiff !== 0) return balanceDiff;
      const totalDiff = (b.left.points + b.right.points) - (a.left.points + a.right.points);
      if (totalDiff !== 0) return totalDiff;
      const aMinQuestion = Math.min(a.left.clip.questionId, a.right.clip.questionId);
      const bMinQuestion = Math.min(b.left.clip.questionId, b.right.clip.questionId);
      if (aMinQuestion !== bMinQuestion) return aMinQuestion - bMinQuestion;
      return a.left.clipIndex - b.left.clipIndex || a.right.clipIndex - b.right.clipIndex;
    });

  return candidates[0] ?? null;
}

export function getBbtiFilmRoomContradictions(
  clips: BbtiFilmRoomClip[],
): BbtiFilmRoomContradiction[] {
  if (clips.length < 2) return [];

  const signals = signalsByPole(clips);
  const contradictions: SortableContradiction[] = [];

  TENSION_PAIRS.forEach((pair) => {
    const [leftPole, rightPole] = pair.poles;
    const picked = bestSignalPair(signals.get(leftPole) ?? [], signals.get(rightPole) ?? []);
    if (!picked) return;

    const clipA = clipRef(picked.left);
    const clipB = clipRef(picked.right);
    const minQuestion = Math.min(clipA.questionId, clipB.questionId);
    const maxQuestion = Math.max(clipA.questionId, clipB.questionId);

    contradictions.push({
      id: `${pair.id}-${minQuestion}-${maxQuestion}`,
      axis: pair.axis,
      title: pair.title,
      question: pair.question,
      standardA: pair.standards[0],
      standardB: pair.standards[1],
      shareLine: pair.shareLine,
      primaryClipKey: clipA.clipKey,
      clipA,
      clipB,
      poles: pair.poles,
      sortKey: `${pair.priority}-${minQuestion}-${maxQuestion}`,
    });
  });

  return contradictions
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      axis: item.axis,
      title: item.title,
      question: item.question,
      standardA: item.standardA,
      standardB: item.standardB,
      shareLine: item.shareLine,
      primaryClipKey: item.primaryClipKey,
      clipA: item.clipA,
      clipB: item.clipB,
      poles: item.poles,
    }));
}
