import { bbtiTypes, getBbtiType, type BbtiType, type DimensionKey } from "./bbti";

export const BBTI_CODES = Object.keys(bbtiTypes).sort();
export const BBTI_COMPARE_REPORT_VERSION = "bbti-compare-report-v1" as const;
export const BBTI_DUO_REMATCH_PROMPTS_VERSION = "bbti-duo-rematch-prompts-v1" as const;
export const BBTI_DUO_REMATCH_PROMPTS_BOUNDARY = "本地复赛追问，只复用两个 BBTI Code、分歧轴和赛后节目单，不代表真实关系、胜率或外部来源。" as const;

export type BbtiCompareProgramId = "opening-read" | "swing-point" | "closing-challenge";
export type BbtiDuoRematchPromptId = "standard-lock" | "receipt-swap" | "last-shot";
export type BbtiDuoRematchPromptAxisKey = DimensionKey | "mirror";

export interface BbtiCompareProgramSegment {
  id: BbtiCompareProgramId;
  qaKey: string;
  kicker: string;
  title: string;
  body: string;
}

export interface BbtiCompareRematchPlan {
  title: string;
  setup: string;
  firstPossession: string;
  counter: string;
  copyCue: string;
}

export interface BbtiDuoRematchPrompt {
  id: BbtiDuoRematchPromptId;
  qaKey: string;
  axisKey: BbtiDuoRematchPromptAxisKey;
  label: string;
  title: string;
  question: string;
  constraint: string;
  copyLine: string;
}

export interface BbtiAxisMatch {
  key: DimensionKey;
  label: string;
  left: string;
  right: string;
  verdict: string;
}

export interface BbtiCompareReport {
  codeA: string;
  codeB: string;
  typeA: BbtiType;
  typeB: BbtiType;
  score: number;
  tier: string;
  title: string;
  oneLiner: string;
  sharedAxes: BbtiAxisMatch[];
  clashAxes: BbtiAxisMatch[];
  courtChemistry: string;
  groupChat: string;
  coachNote: string;
  danger: string;
  challenge: string;
  program: BbtiCompareProgramSegment[];
  rematchPlan: BbtiCompareRematchPlan;
  rematchPrompts: BbtiDuoRematchPrompt[];
  rematchPromptsVersion: typeof BBTI_DUO_REMATCH_PROMPTS_VERSION;
  rematchPromptsBoundary: typeof BBTI_DUO_REMATCH_PROMPTS_BOUNDARY;
  shareText: string;
  version: typeof BBTI_COMPARE_REPORT_VERSION;
}

const AXES = [
  {
    key: "OD" as const,
    index: 0,
    label: "攻防取向",
    values: {
      O: "进攻先开火",
      D: "防守先上锁",
    },
    same: "节奏一致，第一句话就知道这场球该怎么打。",
    clash: "一个想提速开火，一个想先把回合按住。",
  },
  {
    key: "AE" as const,
    index: 1,
    label: "证据方式",
    values: {
      A: "数据查表",
      E: "名场面上头",
    },
    same: "证据语言一致，吵起来也知道对方吃哪套。",
    clash: "一个贴高阶数据，一个甩集锦名场面。",
  },
  {
    key: "IT" as const,
    index: 2,
    label: "赢球逻辑",
    values: {
      I: "巨星接管",
      T: "体系解题",
    },
    same: "战术哲学同频，谁来收尾这事很少吵崩。",
    clash: "一个喊球星硬解，一个喊全队空间和轮转。",
  },
  {
    key: "LR" as const,
    index: 3,
    label: "球迷身份",
    values: {
      L: "一城一队",
      R: "冠军窗口",
    },
    same: "身份认同接近，换队和追冠话题不容易爆炸。",
    clash: "忠诚和冠军一碰就炸，群聊最容易进入加时。",
  },
] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function normalizeBbtiCode(value: string): string {
  return value.toUpperCase().replace(/[^ODAEITLR]/g, "").slice(0, 4);
}

export function isBbtiCode(value: string): boolean {
  const code = normalizeBbtiCode(value);
  return /^[OD][AE][IT][LR]$/.test(code) && Object.prototype.hasOwnProperty.call(bbtiTypes, code);
}

export function extractBbtiCode(value: string): string {
  const match = value.toUpperCase().match(/[OD][AE][IT][LR]/);
  return match ? match[0] : normalizeBbtiCode(value);
}

function axisValue(code: string, axis: (typeof AXES)[number]): string {
  const letter = code[axis.index] as keyof typeof axis.values;
  return axis.values[letter] ?? letter;
}

function tierFor(score: number, sameCode: boolean): string {
  if (sameCode) return "镜像同盟";
  if (score >= 82) return "王朝双核";
  if (score >= 68) return "季后赛搭档";
  if (score >= 50) return "常规赛能用";
  if (score >= 35) return "更衣室拉扯";
  return "交易截止日前夜";
}

function titleFor(score: number, same: BbtiAxisMatch[], clash: BbtiAxisMatch[]): string {
  if (same.length === 4) return "同款球脑，像照镜子吵球";
  if (score >= 82) return "一个挡拆就能打穿朋友圈";
  if (score >= 68) return "能一起赢，但要先分清谁控球";
  if (score >= 50) return "能组队，别让群聊进入最后两分钟";
  if (clash.length >= 3) return "四维拉扯，适合互怼不适合当同桌";
  return "有化学反应，也有更衣室新闻";
}

function chemistryLine(score: number, typeA: BbtiType, typeB: BbtiType): string {
  if (score >= 82) {
    return `${typeA.name}和${typeB.name}适合当双核：一个开局定调，一个把优势滚到终场。`;
  }
  if (score >= 68) {
    return `${typeA.name}和${typeB.name}能打季后赛强度，但关键回合要提前约定谁说了算。`;
  }
  if (score >= 50) {
    return `${typeA.name}和${typeB.name}像临时拼队，赢球时很快乐，输球时会复盘到凌晨。`;
  }
  return `${typeA.name}和${typeB.name}不是不能一起玩，是每次聊到标准都会像抢七最后一攻。`;
}

function groupChatLine(sharedAxes: BbtiAxisMatch[], clashAxes: BbtiAxisMatch[]): string {
  if (clashAxes.length === 0) {
    return "群聊里你们会互相补刀外人，最大问题是太像，容易一起上头。";
  }

  const firstClash = clashAxes[0];
  const firstShared = sharedAxes[0];
  if (firstShared) {
    return `你们在「${firstShared.label}」同频，但「${firstClash.label}」一开麦就容易互相截图挂人。`;
  }

  return `你们四个维度全在拉扯，适合做节目效果，别一起当版主。`;
}

function buildCompareProgram({
  clashAxes,
  codeA,
  codeB,
  score,
  sharedAxes,
  tier,
  typeA,
  typeB,
}: {
  clashAxes: BbtiAxisMatch[];
  codeA: string;
  codeB: string;
  score: number;
  sharedAxes: BbtiAxisMatch[];
  tier: string;
  typeA: BbtiType;
  typeB: BbtiType;
}): BbtiCompareProgramSegment[] {
  const firstShared = sharedAxes[0];
  const firstClash = clashAxes[0];
  const openingBody = firstShared
    ? `${typeA.name}和${typeB.name}先用「${firstShared.label}」建立共同语言，开场不用解释太久。`
    : `${codeA}和${codeB}先各说一句自己的篮球标准，别一上来抢最终结论。`;
  const swingBody = firstClash
    ? `节目第二段只拆「${firstClash.label}」：${codeA}坚持${firstClash.left}，${codeB}拿${firstClash.right}反打。`
    : "第二段故意设置一个反方标准，测试这组同频是不是经得起压力。";
  const closingBody = score >= 68
    ? `收官看你们能不能把${tier}兑现成合作：一人给结论，一人补反方漏洞。`
    : `收官别急着判输赢，先把最大分歧压成一个 30 秒互怼题。`;

  return [
    {
      id: "opening-read",
      qaKey: `${codeA}-${codeB}-opening-read`,
      kicker: "第一节",
      title: "先给共同语言",
      body: openingBody,
    },
    {
      id: "swing-point",
      qaKey: `${codeA}-${codeB}-swing-point`,
      kicker: "第三节",
      title: firstClash ? `锁定${firstClash.label}` : "主动造一个反方标准",
      body: swingBody,
    },
    {
      id: "closing-challenge",
      qaKey: `${codeA}-${codeB}-closing-challenge`,
      kicker: "最后两分钟",
      title: score >= 68 ? "把默契变成分工" : "把冲突压成题目",
      body: closingBody,
    },
  ];
}

function buildRematchPlan({
  clashAxes,
  codeA,
  codeB,
  sharedAxes,
  typeA,
  typeB,
}: {
  clashAxes: BbtiAxisMatch[];
  codeA: string;
  codeB: string;
  sharedAxes: BbtiAxisMatch[];
  typeA: BbtiType;
  typeB: BbtiType;
}): BbtiCompareRematchPlan {
  const firstClash = clashAxes[0];
  const firstShared = sharedAxes[0];
  const anchor = firstClash ?? firstShared;
  const anchorLabel = anchor?.label ?? "篮球标准";
  const leftRead = anchor?.left ?? typeA.name;
  const rightRead = anchor?.right ?? typeB.name;

  return {
    title: "三回合复盘玩法",
    setup: `只围绕「${anchorLabel}」打一轮，不扩散到历史排名或阵营身份。`,
    firstPossession: `${codeA}先用${leftRead}开场，给出一句自己最硬的判断。`,
    counter: `${codeB}再用${rightRead}反打，只能拆标准，不能换题。`,
    copyCue: "复制报告后，直接把这三回合丢进群聊开打。",
  };
}

function selectPromptAxis(
  clashAxes: BbtiAxisMatch[],
  sharedAxes: BbtiAxisMatch[],
  index: number,
): BbtiAxisMatch | null {
  return clashAxes[index] ?? sharedAxes[index] ?? clashAxes[0] ?? sharedAxes[0] ?? null;
}

function axisPressureLine(axis: BbtiAxisMatch | null, codeA: string, codeB: string): string {
  if (!axis) {
    return `${codeA}和${codeB}各用一句话定义自己的篮球标准。`;
  }

  if (axis.left === axis.right) {
    return `${codeA}和${codeB}都认同「${axis.left}」，但必须各找一个反方漏洞。`;
  }

  return `${codeA}坚持「${axis.left}」，${codeB}坚持「${axis.right}」。`;
}

function buildDuoRematchPrompts({
  clashAxes,
  codeA,
  codeB,
  score,
  sharedAxes,
  typeA,
  typeB,
}: {
  clashAxes: BbtiAxisMatch[];
  codeA: string;
  codeB: string;
  score: number;
  sharedAxes: BbtiAxisMatch[];
  typeA: BbtiType;
  typeB: BbtiType;
}): BbtiDuoRematchPrompt[] {
  const firstAxis = selectPromptAxis(clashAxes, sharedAxes, 0);
  const secondAxis = selectPromptAxis(clashAxes, sharedAxes, 1);
  const thirdAxis = selectPromptAxis(clashAxes, sharedAxes, 2);
  const firstLabel = firstAxis?.label ?? "篮球标准";
  const secondLabel = secondAxis?.label ?? firstLabel;
  const thirdLabel = thirdAxis?.label ?? firstLabel;
  const chemistryFrame = score >= 68 ? "默契" : "拉扯";

  return [
    {
      id: "standard-lock",
      qaKey: `${codeA}-${codeB}-standard-lock`,
      axisKey: firstAxis?.key ?? "mirror",
      label: "G1",
      title: `${firstLabel}复赛`,
      question: `只打「${firstLabel}」：${axisPressureLine(firstAxis, codeA, codeB)}谁的标准更能解释关键回合？`,
      constraint: "不能换题到历史排名，只能拆这个维度的判断标准。",
      copyLine: `G1 ${firstLabel}：${axisPressureLine(firstAxis, codeA, codeB)}谁的标准更硬？`,
    },
    {
      id: "receipt-swap",
      qaKey: `${codeA}-${codeB}-receipt-swap`,
      axisKey: secondAxis?.key ?? "mirror",
      label: "G2",
      title: "换边防守",
      question: `${codeA}先替${typeB.name}说一句最强理由，${codeB}再替${typeA.name}补一个反方漏洞。`,
      constraint: `必须围绕「${secondLabel}」，先复述对方逻辑，再反击。`,
      copyLine: `G2 换边：${codeA}先替${typeB.name}辩护，${codeB}再替${typeA.name}找漏洞。`,
    },
    {
      id: "last-shot",
      qaKey: `${codeA}-${codeB}-last-shot`,
      axisKey: thirdAxis?.key ?? "mirror",
      label: "OT",
      title: `${chemistryFrame}加时题`,
      question: `把「${thirdLabel}」压成一句群聊选择题：这组双人球脑该合作开火，还是分边互怼？`,
      constraint: "只允许基于本地 BBTI 报告回答，不添加真实关系、真实胜率或外部来源。",
      copyLine: `OT ${thirdLabel}：合作开火，还是分边互怼？只看这份本地 BBTI 报告。`,
    },
  ];
}

export function getBbtiCompareReport(codeAInput: string, codeBInput: string): BbtiCompareReport {
  const codeA = normalizeBbtiCode(codeAInput);
  const codeB = normalizeBbtiCode(codeBInput);
  if (!isBbtiCode(codeA) || !isBbtiCode(codeB)) {
    throw new Error("Invalid BBTI code");
  }
  const typeA = getBbtiType(codeA);
  const typeB = getBbtiType(codeB);

  const sharedAxes: BbtiAxisMatch[] = [];
  const clashAxes: BbtiAxisMatch[] = [];

  for (const axis of AXES) {
    const left = axisValue(codeA, axis);
    const right = axisValue(codeB, axis);
    const row = {
      key: axis.key,
      label: axis.label,
      left,
      right,
      verdict: codeA[axis.index] === codeB[axis.index] ? axis.same : axis.clash,
    };

    if (codeA[axis.index] === codeB[axis.index]) {
      sharedAxes.push(row);
    } else {
      clashAxes.push(row);
    }
  }

  let score = 54 + sharedAxes.length * 9 - clashAxes.length * 5;
  if (typeA.compatibility === codeB || typeB.compatibility === codeA) score += 18;
  if (typeA.nemesis === codeB || typeB.nemesis === codeA) score -= 16;
  if (codeA === codeB) score = 96;
  score = clamp(score, 18, 98);

  const tier = tierFor(score, codeA === codeB);
  const title = titleFor(score, sharedAxes, clashAxes);
  const courtChemistry = chemistryLine(score, typeA, typeB);
  const groupChat = groupChatLine(sharedAxes, clashAxes);
  const coachNote =
    clashAxes.length === 0
      ? "教练建议：别只抱团取暖，故意找一个反方观点练防守。"
      : `教练建议：先约定「${clashAxes[0].label}」的评价标准，再开始吵GOAT。`;
  const danger =
    score >= 68
      ? "危险点：太容易互相认同，可能一起忽略反方最强论据。"
      : "危险点：还没聊到球员，可能已经在聊谁更懂球。";
  const challenge = `挑战：${typeA.name}用30秒说服${typeB.name}接受自己的篮球标准，输的人重测闪电版。`;
  const oneLiner = `${tier} · 本地 ${score}% 化学反应`;
  const program = buildCompareProgram({
    clashAxes,
    codeA,
    codeB,
    score,
    sharedAxes,
    tier,
    typeA,
    typeB,
  });
  const rematchPlan = buildRematchPlan({
    clashAxes,
    codeA,
    codeB,
    sharedAxes,
    typeA,
    typeB,
  });
  const rematchPrompts = buildDuoRematchPrompts({
    clashAxes,
    codeA,
    codeB,
    score,
    sharedAxes,
    typeA,
    typeB,
  });

  return {
    codeA,
    codeB,
    typeA,
    typeB,
    score,
    tier,
    title,
    oneLiner,
    sharedAxes,
    clashAxes,
    courtChemistry,
    groupChat,
    coachNote,
    danger,
    challenge,
    program,
    rematchPlan,
    rematchPrompts,
    rematchPromptsVersion: BBTI_DUO_REMATCH_PROMPTS_VERSION,
    rematchPromptsBoundary: BBTI_DUO_REMATCH_PROMPTS_BOUNDARY,
    shareText: `BBTI双人对比：${codeA} ${typeA.name} vs ${codeB} ${typeB.name}\n${oneLiner}\n${title}\n${challenge}`,
    version: BBTI_COMPARE_REPORT_VERSION,
  };
}

export function buildBbtiDuoRematchPromptCopy({
  report,
  url,
}: {
  report: BbtiCompareReport;
  url: string;
}): string {
  return [
    "BBTI 双人复赛追问",
    `${report.codeA} ${report.typeA.name} vs ${report.codeB} ${report.typeB.name}`,
    `${report.oneLiner}｜${report.title}`,
    ...report.rematchPrompts.map((prompt, index) => `${index + 1}. ${prompt.copyLine}｜限制：${prompt.constraint}`),
    `边界：${report.rematchPromptsBoundary}`,
    url,
  ].join("\n");
}

export function buildBbtiCompareReportCopy({
  report,
  url,
}: {
  report: BbtiCompareReport;
  url: string;
}): string {
  return [
    report.shareText,
    "",
    "赛后节目单：",
    ...report.program.map((segment, index) => `${index + 1}. ${segment.title}：${segment.body}`),
    "",
    `${report.rematchPlan.title}：${report.rematchPlan.setup}`,
    report.rematchPlan.firstPossession,
    report.rematchPlan.counter,
    "",
    "复赛追问：",
    ...report.rematchPrompts.map((prompt, index) => `${index + 1}. ${prompt.copyLine}`),
    url,
  ].join("\n");
}
