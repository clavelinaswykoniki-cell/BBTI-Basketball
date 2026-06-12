import type { BbtiChallengeMatchup } from "./bbti-challenges";

export type BbtiEvidenceLens =
  | "数据"
  | "名场面"
  | "峰值"
  | "长度"
  | "戒指"
  | "体系"
  | "单挑"
  | "时代"
  | "防守";

interface BbtiChallengeEvidencePack {
  pressureQuestion: string;
  iconicMoment: string;
  receiptA: string;
  receiptB: string;
  scriptOpener: string;
  scriptConflict: string;
  scriptCounter: string;
  evidenceLens: BbtiEvidenceLens[];
}

const MATCHUP_EVIDENCE: Record<string, BbtiChallengeEvidencePack> = {
  "kobe-vs-lebron": {
    pressureQuestion: "生死回合，你要把球交给单挑终结者，还是交给能读出最优解的全能核心？",
    iconicMoment: "证物镜头：2006 年科比对猛龙 81 分，对上 2016 年总决赛 G7 詹姆斯的 The Block。",
    receiptA: "科比侧证词：2006 年对猛龙 81 分，NBA 历史第二高单场得分；20 年湖人生涯，5 次总冠军。",
    receiptB: "詹姆斯侧证词：2016 年总决赛 G7 The Block；骑士成为首支总决赛 1-3 逆转夺冠球队。",
    scriptOpener: "先别喊情怀，最后一攻你到底要单挑答案还是全能读秒？",
    scriptConflict: "忠诚、效率、长度三张牌不能同时当王牌，先说你押哪张。",
    scriptCounter: "如果只看一球定生死，体系最优解和英雄球谁更像总冠军解法？",
    evidenceLens: ["峰值", "长度", "单挑", "体系", "戒指"],
  },
  "kobe-vs-jordan": {
    pressureQuestion: "同一套后仰和脚步，继承者到底是在接近原型，还是永远被原型压一头？",
    iconicMoment: "证物镜头：后仰镜像审判，乔丹 1998 年 G6 最后一投对上科比 81 分和退役战 60 分。",
    receiptA: "科比侧证词：81 分、退役战 60 分、20 年湖人生涯。",
    receiptB: "乔丹侧证词：1997 总决赛“流感之战”38 分、1998 G6 最后一投、6 次 Finals MVP。",
    scriptOpener: "同样是后仰和脚步，模仿到极致算接近原型还是被原型锁死？",
    scriptConflict: "技术美学能不能抵过 6 次 Finals MVP 这种荣誉硬证？",
    scriptCounter: "别只喊杀手本能，先把峰值名场面和奖杯标准放同一张表。",
    evidenceLens: ["名场面", "峰值", "单挑", "戒指", "时代"],
  },
  "lebron-vs-jordan": {
    pressureQuestion: "历史第一到底是最完美的峰值，还是二十年不断电的不可替代？",
    iconicMoment: "证物镜头：The Block vs The Last Shot，2016 年逆转对上 1998 年封冠一投。",
    receiptA: "詹姆斯侧证词：历史得分王、首位 40,000 分球员、2016 年总决赛 1-3 逆转。",
    receiptB: "乔丹侧证词：6 冠、6 次 Finals MVP、1998 年 G6 最后一投封冠。",
    scriptOpener: "历史第一不是口号，先选峰值无解还是二十年不断电。",
    scriptConflict: "6 冠完美履历和长度数据，谁才是更难复制的篮球资产？",
    scriptCounter: "如果总决赛逆转也算历史证物，完美战绩还能不能一票封案？",
    evidenceLens: ["长度", "峰值", "戒指", "数据", "时代"],
  },
  "magic-vs-bird": {
    pressureQuestion: "如果没有对方作为宿敌，谁的传奇会缩水更多？",
    iconicMoment: "证物镜头：1979 NCAA 决赛开场，80 年代湖人和凯尔特人三次总决赛续篇。",
    receiptA: "魔术师侧证词：1979 NCAA 决赛击败伯德，湖人在 1985/1987 总决赛赢凯尔特人。",
    receiptB: "伯德侧证词：1984 总决赛凯尔特人赢湖人，80 年代绿军核心和关键球门面。",
    scriptOpener: "这局别只选阵营，先说谁更需要对方才变成传奇。",
    scriptConflict: "传球发动机和关键球门面，团队叙事里谁才是主角？",
    scriptCounter: "如果宿敌本身就是证物，冠军和时代影响要一起算账。",
    evidenceLens: ["体系", "时代", "戒指", "名场面"],
  },
  "curry-vs-durant": {
    pressureQuestion: "王朝底层代码到底是改变防守的体系引力，还是惩罚一切防守的无差别硬解？",
    iconicMoment: "证物镜头：体系引力 vs 总决赛硬解，2022 Curry FMVP 对上 Durant 勇士两连 FMVP。",
    receiptA: "库里侧证词：2022 Finals MVP，勇士 2022 冠军没有杜兰特在阵。",
    receiptB: "杜兰特侧证词：2017、2018 连续 Finals MVP；2017 总决赛场均 35.2 分。",
    scriptOpener: "勇士王朝先别急着归功，底层代码到底是空间引力还是硬解？",
    scriptConflict: "一个改变防守站位，一个惩罚所有对位，价值不能混着算。",
    scriptCounter: "如果没有体系牵引，顶级单挑还能不能这么轻松进总决赛？",
    evidenceLens: ["体系", "数据", "峰值", "戒指", "时代"],
  },
  "shaq-vs-yao": {
    pressureQuestion: "传统中锋的终极答案，是冲击篮筐，还是用技术和全球影响改变禁区想象？",
    iconicMoment: "证物镜头：2003 年首次正面对位，三连冠中锋遇上刚进联盟的移动长城。",
    receiptA: "奥尼尔侧证词：三连冠核心、三连 Finals MVP，首次对位拿到 31 分 13 板。",
    receiptB: "姚明侧证词：首次对位拿到 10 分 10 板 6 帽，并推动 NBA 在中国的关注度。",
    scriptOpener: "禁区肉搏别只看吨位，先问技术、犯规尺度和时代环境怎么折算。",
    scriptConflict: "三连冠禁区统治和移动长城想象，哪个更能定义中锋答案？",
    scriptCounter: "如果对位样本不等于历史结论，禁区统治力要看峰值还是影响力？",
    evidenceLens: ["峰值", "时代", "单挑", "名场面"],
  },
  "duncan-vs-garnett": {
    pressureQuestion: "一支球队的地基，你要安静稳定的答案，还是能把全队点燃的全能火山？",
    iconicMoment: "证物镜头：安静地基 vs 燃烧防线，2003 邓肯争冠跑对上 2008 加内特防守核心。",
    receiptA: "邓肯侧证词：2003 总决赛 G6 近四双，21 分 20 板 10 助 8 帽。",
    receiptB: "加内特侧证词：2004 MVP、2008 DPOY、2008 凯尔特人冠军核心。",
    scriptOpener: "大前锋之争别只看火花，先看谁能当一支球队的防守地基。",
    scriptConflict: "安静稳定和全能燃烧，哪个更像长期冠军资产？",
    scriptCounter: "如果情绪感染不能换成季后赛轮次，防守价值该怎么定价？",
    evidenceLens: ["体系", "防守", "长度", "戒指", "时代"],
  },
  "ai-vs-tmac": {
    pressureQuestion: "没有冠军兜底时，记忆、观赏性和天赋遗憾能不能进入历史地位讨论？",
    iconicMoment: "证物镜头：艾弗森 2001 年总决赛跨过泰伦卢，对上麦迪 35 秒 13 分。",
    receiptA: "艾弗森侧证词：2001 总决赛 G1 48 分，跨过 Tyronn Lue。",
    receiptB: "麦迪侧证词：2004 年对马刺最后 35 秒 13 分，最后一记三分完成反超。",
    scriptOpener: "无冠天才也能开庭，先说记忆和奖杯谁更有历史发言权。",
    scriptConflict: "一个总决赛强行破局，一个 35 秒逆天改命，但履历都缺硬冠。",
    scriptCounter: "如果观感不能进账，那名场面为什么还能让球迷反复翻案？",
    evidenceLens: ["名场面", "峰值", "单挑", "时代"],
  },
};

export function enrichBbtiChallengeMatchup(matchup: BbtiChallengeMatchup): BbtiChallengeMatchup {
  const evidence = MATCHUP_EVIDENCE[matchup.matchupId];
  if (!evidence) return matchup;
  const pressureQuestion = matchup.pressureQuestion ?? evidence.pressureQuestion;
  const iconicMoment = matchup.iconicMoment ?? evidence.iconicMoment;
  const receiptA = matchup.receiptA ?? evidence.receiptA;
  const receiptB = matchup.receiptB ?? evidence.receiptB;
  const scriptOpener = matchup.scriptOpener ?? evidence.scriptOpener;
  const scriptConflict = matchup.scriptConflict ?? evidence.scriptConflict;
  const scriptCounter = matchup.scriptCounter ?? evidence.scriptCounter;
  const evidenceLens = matchup.evidenceLens ?? evidence.evidenceLens;
  const groupChatPrompt = matchup.groupChatPrompt
    ?? `${matchup.category}：${matchup.title}。${pressureQuestion}`;

  return {
    ...matchup,
    pressureQuestion,
    iconicMoment,
    receiptA,
    receiptB,
    scriptOpener,
    scriptConflict,
    scriptCounter,
    evidenceLens,
    groupChatPrompt,
    shareCopy: matchup.shareCopy
      ?? `我的 BBTI 命定对线是「${matchup.title}」：${matchup.reason}\n压力题：${pressureQuestion}`,
  };
}
