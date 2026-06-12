import {
  bbtiQuestions,
  getBbtiType,
  scoreBbtiAnswer,
  scoreBbtiAnswers,
  type BbtiAnswer,
  type BbtiQuestion,
  type DimensionKey,
  type PoleKey,
} from "./bbti";
import {
  getBbtiAnswerReveal,
  type BbtiAnswerReveal,
} from "./bbti-answer-reveals";

export const BBTI_LAST_RESULT_STORAGE_KEY = "bbti:last-result-v2";
export const BBTI_RESULT_SCOUTING_VERSION = "bbti-result-scouting-refresh-v1" as const;
export const BBTI_RESULT_SCOUTING_BOUNDARY = "本地球探复盘，只复用本次答题、四维坐标和战术手册，不代表外部排名、真实球探报告或外部结论。" as const;
export const BBTI_RESULT_SCOUTING_COPY_KIT_VERSION = "bbti-result-scouting-copy-kit-v1" as const;
export const BBTI_RESULT_SCOUTING_COPY_KIT_BOUNDARY = "本地球探话术包，只复用本次四维复盘、答题证据和战术手册，不代表外部排名、真实球探报告、真实热度或用户行为。" as const;

export interface StoredBbtiResult {
  code: string;
  name: string;
  emoji: string;
  mode: "blitz" | "quick" | "full";
  savedAt: string;
  challenge: string;
}

export interface BbtiAxisSnapshot {
  key: DimensionKey;
  chosenLetter: PoleKey;
  chosenLabel: string;
  oppositeLabel: string;
  score: number;
  headline: string;
  tactic: string;
  risk: string;
}

export type BbtiResultScoutingLaneId = "pace-read" | "proof-read" | "usage-read" | "stakes-read";
export type BbtiResultScoutingTarget = "tempo" | "evidence" | "usage" | "identity";
export type BbtiResultScoutingCopyKitItemId = "group-recap" | "counter-read" | "next-workout";
export type BbtiResultScoutingCopyKitTarget = "group-chat" | "counter" | "workout";

export interface BbtiResultScoutingLane {
  id: BbtiResultScoutingLaneId;
  axisKey: DimensionKey;
  target: BbtiResultScoutingTarget;
  chosenLetter: PoleKey;
  chosenLabel: string;
  oppositeLabel: string;
  score: number;
  badge: string;
  headline: string;
  read: string;
  workout: string;
  risk: string;
  evidence: string[];
}

export interface BbtiResultScoutingReport {
  version: typeof BBTI_RESULT_SCOUTING_VERSION;
  boundary: typeof BBTI_RESULT_SCOUTING_BOUNDARY;
  code: string;
  typeName: string;
  laneCount: number;
  lanes: BbtiResultScoutingLane[];
  copyText: string;
}

export interface BbtiResultScoutingCopyKitItem {
  id: BbtiResultScoutingCopyKitItemId;
  target: BbtiResultScoutingCopyKitTarget;
  sourceLaneId: BbtiResultScoutingLaneId;
  sourceAxis: DimensionKey;
  label: string;
  title: string;
  body: string;
  copyText: string;
}

export interface BbtiResultScoutingCopyKit {
  version: typeof BBTI_RESULT_SCOUTING_COPY_KIT_VERSION;
  boundary: typeof BBTI_RESULT_SCOUTING_COPY_KIT_BOUNDARY;
  sourceReportVersion: typeof BBTI_RESULT_SCOUTING_VERSION;
  code: string;
  typeName: string;
  itemCount: number;
  items: BbtiResultScoutingCopyKitItem[];
  copyText: string;
}

export interface BbtiDecisiveAnswer {
  questionId: number;
  dimension: DimensionKey | "all";
  prompt: string;
  answerText: string;
  impact: string;
}

export interface BbtiFilmRoomClip extends BbtiDecisiveAnswer {
  clipKey: string;
  coachTimeout: BbtiAnswerReveal;
}

export interface BbtiPlaybook {
  arenaRole: string;
  debateWeapon: string;
  blindSpotDrill: string;
  squadFit: string;
  challengeTitle: string;
  challengeCopy: string;
  nextPlayChallenge: string;
  axes: BbtiAxisSnapshot[];
  scoutingReport: BbtiResultScoutingReport;
  decisiveAnswers: BbtiDecisiveAnswer[];
  filmRoomClips: BbtiFilmRoomClip[];
}

type AxisDefinition = {
  key: DimensionKey;
  letters: readonly [PoleKey, PoleKey];
  labels: readonly [string, string];
  headline: Record<PoleKey, string>;
  tactic: Record<PoleKey, string>;
  risk: Record<PoleKey, string>;
};

export const BBTI_FILM_ROOM_DIMENSION_LABELS: Record<DimensionKey | "all", string> = {
  OD: "攻防取向",
  AE: "证据方式",
  IT: "赢球逻辑",
  LR: "球迷身份",
  all: "综合宣言",
};

export function getBbtiFilmRoomDimensionLabel(dimension: DimensionKey | "all"): string {
  return BBTI_FILM_ROOM_DIMENSION_LABELS[dimension];
}

const AXES: AxisDefinition[] = [
  {
    key: "OD",
    letters: ["O", "D"],
    labels: ["进攻", "防守"],
    headline: {
      O: "先把比分打穿",
      D: "先把对手锁死",
      A: "",
      E: "",
      I: "",
      T: "",
      L: "",
      R: "",
    },
    tactic: {
      O: "适合当开局点火的人：先丢一个能炸群的进攻观点。",
      D: "适合当反击防线的人：先拆对方逻辑漏洞，再给结论。",
      A: "",
      E: "",
      I: "",
      T: "",
      L: "",
      R: "",
    },
    risk: {
      O: "容易忽略防守和失误成本。",
      D: "容易低估进攻爆发带来的情绪价值。",
      A: "",
      E: "",
      I: "",
      T: "",
      L: "",
      R: "",
    },
  },
  {
    key: "AE",
    letters: ["A", "E"],
    labels: ["数据", "情怀"],
    headline: {
      O: "",
      D: "",
      A: "证据先行",
      E: "名场面先行",
      I: "",
      T: "",
      L: "",
      R: "",
    },
    tactic: {
      O: "",
      D: "",
      A: "适合拿高阶数据、系列赛样本和对位背景压场。",
      E: "适合用镜头、叙事和现场记忆把讨论拉回热血。",
      I: "",
      T: "",
      L: "",
      R: "",
    },
    risk: {
      O: "",
      D: "",
      A: "容易把真实球感和时代语境算成噪音。",
      E: "容易被一两个剪辑回合带走判断。",
      I: "",
      T: "",
      L: "",
      R: "",
    },
  },
  {
    key: "IT",
    letters: ["I", "T"],
    labels: ["个人", "团队"],
    headline: {
      O: "",
      D: "",
      A: "",
      E: "",
      I: "巨星单点破局",
      T: "体系全队解题",
      L: "",
      R: "",
    },
    tactic: {
      O: "",
      D: "",
      A: "",
      E: "",
      I: "适合聊谁能在最高压回合自己创造答案。",
      T: "适合聊空间、轮转、队友适配和教练组方案。",
      L: "",
      R: "",
    },
    risk: {
      O: "",
      D: "",
      A: "",
      E: "",
      I: "容易把五人运动压缩成单挑表。",
      T: "容易淡化超级球星真正改变系列赛的能力。",
      L: "",
      R: "",
    },
  },
  {
    key: "LR",
    letters: ["L", "R"],
    labels: ["忠诚", "冠军"],
    headline: {
      O: "",
      D: "",
      A: "",
      E: "",
      I: "",
      T: "",
      L: "陪一座城熬到底",
      R: "结果就是硬通货",
    },
    tactic: {
      O: "",
      D: "",
      A: "",
      E: "",
      I: "",
      T: "",
      L: "适合用坚守、身份认同和球队文化打动人。",
      R: "适合用最高舞台、冠军窗口和资源配置讲道理。",
    },
    risk: {
      O: "",
      D: "",
      A: "",
      E: "",
      I: "",
      T: "",
      L: "容易把忠诚神圣化，忽略职业选择现实。",
      R: "容易被朋友质疑只跟赢球走。",
    },
  },
];

const RESULT_SCOUTING_META: Record<DimensionKey, {
  id: BbtiResultScoutingLaneId;
  target: BbtiResultScoutingTarget;
  badge: string;
  workout: Partial<Record<PoleKey, string>>;
}> = {
  OD: {
    id: "pace-read",
    target: "tempo",
    badge: "攻防节奏",
    workout: {
      O: "复盘时先问：这次开火有没有留下回防成本。",
      D: "复盘时先问：这次稳守有没有错过反击窗口。",
    },
  },
  AE: {
    id: "proof-read",
    target: "evidence",
    badge: "证据节奏",
    workout: {
      A: "复盘时补一条画面记忆，避免只剩表格压人。",
      E: "复盘时补一个样本条件，避免名场面盖过全局。",
    },
  },
  IT: {
    id: "usage-read",
    target: "usage",
    badge: "用球分配",
    workout: {
      I: "复盘时写清楚：哪一回合必须交给单点解法。",
      T: "复盘时写清楚：哪一回合需要体系先把空间做出来。",
    },
  },
  LR: {
    id: "stakes-read",
    target: "identity",
    badge: "身份筹码",
    workout: {
      L: "复盘时同时列出坚守带来的情绪价值和赢球成本。",
      R: "复盘时同时列出冠军窗口带来的收益和身份代价。",
    },
  },
};

function answerScores(question: BbtiQuestion, answer: BbtiAnswer): Partial<Record<PoleKey, number>> {
  return scoreBbtiAnswer(question, answer);
}

function answerText(question: BbtiQuestion, answer: BbtiAnswer): string {
  if (question.type === "binary" && answer.selected) {
    const option = answer.selected === "A" ? question.optionA : question.optionB;
    return option?.text ?? "未记录选项";
  }

  if (question.type === "multi" && answer.selectedIndices && question.options) {
    return answer.selectedIndices
      .map((index) => question.options?.[index]?.text)
      .filter(Boolean)
      .join(" / ");
  }

  if (question.type === "open" && answer.text) {
    return answer.text.length > 70 ? `${answer.text.slice(0, 70)}...` : answer.text;
  }

  return "未记录选项";
}

function impactText(scores: Partial<Record<PoleKey, number>>, question: BbtiQuestion): string {
  const scored = Object.entries(scores)
    .filter(([, value]) => (value ?? 0) > 0)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));

  if (scored.length === 0) {
    return question.type === "open" ? "开放题宣言，影响分享记忆点" : "轻微摇摆题";
  }

  return scored
    .map(([pole, value]) => `${pole}+${value}`)
    .join(" / ");
}

function buildDecisiveAnswers(answers: BbtiAnswer[]): BbtiDecisiveAnswer[] {
  const rows = answers
    .map((answer) => {
      const question = bbtiQuestions.find((item) => item.id === answer.questionId);
      if (!question) return null;
      const scores = answerScores(question, answer);
      const weight = Object.values(scores).reduce((sum, value) => sum + (value ?? 0), 0);

      return {
        row: {
          questionId: question.id,
          dimension: question.dimension,
          prompt: question.question,
          answerText: answerText(question, answer),
          impact: impactText(scores, question),
        },
        weight,
      };
    })
    .filter(Boolean) as Array<{ row: BbtiDecisiveAnswer; weight: number }>;

  return rows
    .sort((a, b) => b.weight - a.weight || a.row.questionId - b.row.questionId)
    .slice(0, 3)
    .map(({ row }) => row);
}

function buildAxisEvidence(answers: BbtiAnswer[]): Record<DimensionKey, string[]> {
  const evidence: Record<DimensionKey, Array<{ line: string; weight: number }>> = {
    OD: [],
    AE: [],
    IT: [],
    LR: [],
  };

  for (const answer of answers) {
    const question = bbtiQuestions.find((item) => item.id === answer.questionId);
    if (!question || question.dimension === "all") continue;

    const scores = answerScores(question, answer);
    const weight = Object.values(scores).reduce((sum, value) => sum + (value ?? 0), 0);
    if (weight <= 0) continue;

    evidence[question.dimension].push({
      line: `Q${question.id}：${answerText(question, answer)}｜${impactText(scores, question)}`,
      weight,
    });
  }

  return Object.fromEntries(
    Object.entries(evidence).map(([key, rows]) => [
      key,
      rows
        .sort((a, b) => b.weight - a.weight || a.line.localeCompare(b.line))
        .slice(0, 2)
        .map((row) => row.line),
    ]),
  ) as Record<DimensionKey, string[]>;
}

function clipKeyFromAnswer(question: BbtiQuestion, answer: BbtiAnswer): string | null {
  if (question.type === "binary" && answer.selected) {
    return `q${question.id}-${answer.selected.toLowerCase()}`;
  }

  if (question.type === "multi" && answer.selectedIndices && answer.selectedIndices.length > 0) {
    return `q${question.id}-m${answer.selectedIndices.join(".")}`;
  }

  return null;
}

function buildFilmRoomClip(question: BbtiQuestion, answer: BbtiAnswer): BbtiFilmRoomClip | null {
  const clipKey = clipKeyFromAnswer(question, answer);
  if (!clipKey) return null;
  const scores = answerScores(question, answer);
  const coachTimeout = getBbtiAnswerReveal(question, answer);
  if (!coachTimeout) return null;

  return {
    clipKey,
    questionId: question.id,
    dimension: question.dimension,
    prompt: question.question,
    answerText: answerText(question, answer),
    impact: impactText(scores, question),
    coachTimeout,
  };
}

function buildFilmRoomClips(answers: BbtiAnswer[]): BbtiFilmRoomClip[] {
  const rows = answers
    .map((answer) => {
      const question = bbtiQuestions.find((item) => item.id === answer.questionId);
      if (!question) return null;
      const scores = answerScores(question, answer);
      const weight = Object.values(scores).reduce((sum, value) => sum + (value ?? 0), 0);
      const row = buildFilmRoomClip(question, answer);
      if (!row || weight <= 0) return null;

      return {
        row,
        weight,
      };
    })
    .filter(Boolean) as Array<{ row: BbtiFilmRoomClip; weight: number }>;

  const sorted = rows.sort((a, b) => b.weight - a.weight || a.row.questionId - b.row.questionId);
  const picked: BbtiFilmRoomClip[] = [];
  const usedDimensions = new Set<DimensionKey | "all">();

  for (const item of sorted) {
    if (picked.length >= 3) break;
    if (usedDimensions.has(item.row.dimension)) continue;
    picked.push(item.row);
    usedDimensions.add(item.row.dimension);
  }

  for (const item of sorted) {
    if (picked.length >= 3) break;
    if (picked.some((clip) => clip.questionId === item.row.questionId)) continue;
    picked.push(item.row);
  }

  return picked;
}

export function resolveBbtiResultScoutingReport({
  axes,
  code,
  evidence,
  typeName,
}: {
  axes: BbtiAxisSnapshot[];
  code: string;
  evidence: Record<DimensionKey, string[]>;
  typeName: string;
}): BbtiResultScoutingReport {
  const lanes = axes.map((axis): BbtiResultScoutingLane => {
    const meta = RESULT_SCOUTING_META[axis.key];

    return {
      id: meta.id,
      axisKey: axis.key,
      target: meta.target,
      chosenLetter: axis.chosenLetter,
      chosenLabel: axis.chosenLabel,
      oppositeLabel: axis.oppositeLabel,
      score: axis.score,
      badge: meta.badge,
      headline: axis.headline,
      read: axis.tactic,
      workout: meta.workout[axis.chosenLetter] ?? axis.tactic,
      risk: axis.risk,
      evidence: evidence[axis.key] ?? [],
    };
  });

  return {
    version: BBTI_RESULT_SCOUTING_VERSION,
    boundary: BBTI_RESULT_SCOUTING_BOUNDARY,
    code,
    typeName,
    laneCount: lanes.length,
    lanes,
    copyText: [
      "BBTI 本地球探复盘",
      `${code} · ${typeName}`,
      ...lanes.map((lane, index) => (
        `${index + 1}. ${lane.badge}｜${lane.chosenLetter} ${lane.chosenLabel} ${lane.score}%：${lane.headline}｜${lane.workout}｜证据：${lane.evidence.join("；") || "本地答题倾向"}`
      )),
      `边界：${BBTI_RESULT_SCOUTING_BOUNDARY}`,
    ].join("\n"),
  };
}

function scoutingLane(
  report: BbtiResultScoutingReport,
  laneId: BbtiResultScoutingLaneId,
): BbtiResultScoutingLane {
  return report.lanes.find((lane) => lane.id === laneId) ?? report.lanes[0];
}

function primaryEvidence(lane: BbtiResultScoutingLane): string {
  return lane.evidence[0] ?? "本地答题倾向形成这一轴读法。";
}

function resultScoutingCopyItem({
  body,
  id,
  label,
  sourceLane,
  target,
  title,
  copyLines,
}: {
  body: string;
  id: BbtiResultScoutingCopyKitItemId;
  label: string;
  sourceLane: BbtiResultScoutingLane;
  target: BbtiResultScoutingCopyKitTarget;
  title: string;
  copyLines: string[];
}): BbtiResultScoutingCopyKitItem {
  return {
    id,
    target,
    sourceLaneId: sourceLane.id,
    sourceAxis: sourceLane.axisKey,
    label,
    title,
    body,
    copyText: [
      ...copyLines,
      `边界：${BBTI_RESULT_SCOUTING_COPY_KIT_BOUNDARY}`,
    ].join("\n"),
  };
}

export function resolveBbtiResultScoutingCopyKit(
  report: BbtiResultScoutingReport,
): BbtiResultScoutingCopyKit {
  const paceLane = scoutingLane(report, "pace-read");
  const proofLane = scoutingLane(report, "proof-read");
  const usageLane = scoutingLane(report, "usage-read");
  const items: BbtiResultScoutingCopyKitItem[] = [
    resultScoutingCopyItem({
      id: "group-recap",
      target: "group-chat",
      sourceLane: paceLane,
      label: "发群钩子",
      title: `${report.code} 先亮 ${paceLane.badge}`,
      body: `我这型会先打「${paceLane.headline}」，别只看结论，先看 ${paceLane.chosenLetter} ${paceLane.chosenLabel} 这一轴。`,
      copyLines: [
        `BBTI 球探发群钩子｜${report.code} · ${report.typeName}`,
        `${paceLane.badge}：${paceLane.chosenLetter} ${paceLane.chosenLabel} ${paceLane.score}%｜${paceLane.headline}`,
        `回合提醒：${paceLane.workout}`,
      ],
    }),
    resultScoutingCopyItem({
      id: "counter-read",
      target: "counter",
      sourceLane: proofLane,
      label: "反打收据",
      title: `盯住 ${proofLane.badge}`,
      body: `如果朋友要反驳，先抓我的盲点：${proofLane.risk}`,
      copyLines: [
        `BBTI 反打收据｜${report.code} · ${report.typeName}`,
        `盲点：${proofLane.risk}`,
        `本地证据：${primaryEvidence(proofLane)}`,
      ],
    }),
    resultScoutingCopyItem({
      id: "next-workout",
      target: "workout",
      sourceLane: usageLane,
      label: "下一回合",
      title: `加练 ${usageLane.badge}`,
      body: usageLane.workout,
      copyLines: [
        `BBTI 下一回合加练｜${report.code} · ${report.typeName}`,
        `${usageLane.badge}：${usageLane.workout}`,
        `别忽略：${usageLane.risk}`,
      ],
    }),
  ];

  return {
    version: BBTI_RESULT_SCOUTING_COPY_KIT_VERSION,
    boundary: BBTI_RESULT_SCOUTING_COPY_KIT_BOUNDARY,
    sourceReportVersion: report.version,
    code: report.code,
    typeName: report.typeName,
    itemCount: items.length,
    items,
    copyText: [
      `BBTI 球探话术包｜${report.code} · ${report.typeName}`,
      ...items.map((item, index) => `${index + 1}. ${item.label}：${item.title}｜${item.body}`),
      `边界：${BBTI_RESULT_SCOUTING_COPY_KIT_BOUNDARY}`,
    ].join("\n"),
  };
}

export function buildSharedFilmRoomClipFromKey(clipKeyInput: string): BbtiFilmRoomClip | null {
  const match = clipKeyInput.toLowerCase().match(/^q(\d+)(?:-(a|b|m\d+(?:\.\d+)*))?$/);
  if (!match) return null;

  const questionId = Number(match[1]);
  const answerKey = match[2];
  const question = bbtiQuestions.find((item) => item.id === questionId);
  if (!question || !answerKey) return null;

  const answer: BbtiAnswer = { questionId };

  if ((answerKey === "a" || answerKey === "b") && question.type === "binary") {
    answer.selected = answerKey.toUpperCase() as "A" | "B";
  } else if (answerKey.startsWith("m") && question.type === "multi") {
    const selectedIndices = answerKey
      .slice(1)
      .split(".")
      .map((item) => Number(item))
      .filter((item) => Number.isInteger(item) && question.options?.[item]);
    if (selectedIndices.length === 0) return null;
    answer.selectedIndices = selectedIndices;
  } else {
    return null;
  }

  return buildFilmRoomClip(question, answer);
}

export function getBbtiPlaybook(code: string, answers: BbtiAnswer[]): BbtiPlaybook {
  const { scores } = scoreBbtiAnswers(answers);
  const letters = code.split("") as PoleKey[];
  const type = getBbtiType(code);
  const compatible = getBbtiType(type.compatibility);
  const nemesis = getBbtiType(type.nemesis);

  const axes = AXES.map((axis, index): BbtiAxisSnapshot => {
    const chosenLetter = letters[index] ?? axis.letters[0];
    const isLeft = chosenLetter === axis.letters[0];
    const chosenLabel = isLeft ? axis.labels[0] : axis.labels[1];
    const oppositeLabel = isLeft ? axis.labels[1] : axis.labels[0];
    const total = scores[axis.letters[0]] + scores[axis.letters[1]];
    const score = total > 0 ? Math.round(((scores[chosenLetter] ?? 0) / total) * 100) : 50;

    return {
      key: axis.key,
      chosenLetter,
      chosenLabel,
      oppositeLabel,
      score,
      headline: axis.headline[chosenLetter],
      tactic: axis.tactic[chosenLetter],
      risk: axis.risk[chosenLetter],
    };
  });

  const [style, evidenceLetter, role, ambition] = letters;
  const arenaRole =
    style === "O"
      ? role === "I"
        ? "终结回合的第一进攻点"
        : "点燃全队的空间发动机"
      : role === "I"
        ? "专门处理王牌对位的防守尖兵"
        : "把阵型站稳的体系指挥官";

  const debateWeapon =
    evidenceLetter === "A"
      ? "先亮样本、效率和系列赛背景，再给结论。"
      : "先抓名场面和情绪记忆，再把观点打成一句能传播的话。";

  const blindSpotDrill =
    ambition === "L"
      ? "每次替忠诚辩护时，补一句这段坚守有没有真实赢球成本。"
      : "每次替冠军辩护时，补一句这条路有没有牺牲身份认同。";

  const squadFit = `最适合和 ${compatible.name} 组队互补；最容易和 ${nemesis.name} 在群聊里打成加时。`;
  const decisiveAnswers = buildDecisiveAnswers(answers);
  const filmRoomClips = buildFilmRoomClips(answers);
  const evidence = buildAxisEvidence(answers);

  return {
    arenaRole,
    debateWeapon,
    blindSpotDrill,
    squadFit,
    challengeTitle: `${type.name} vs ${nemesis.name}`,
    challengeCopy: `把这个结果发给一个${nemesis.name}，让 TA 用三句话反驳你的篮球世界观。`,
    nextPlayChallenge:
      `把 ${type.name} 放进主场、客场和抢七三个回合里重测一次：主场先守住身份，客场先回答质疑，抢七必须给出最后一球标准。`,
    axes,
    scoutingReport: resolveBbtiResultScoutingReport({
      axes,
      code,
      evidence,
      typeName: type.name,
    }),
    decisiveAnswers,
    filmRoomClips,
  };
}
