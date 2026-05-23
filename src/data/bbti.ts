// ============================================================================
// BBTI — Basketball Brain Type Indicator
//
// 4 dimensions, 2 poles each → 16 personality types:
//   O/D — Offense vs Defense (进攻 vs 防守)
//   A/E — Analytics vs Emotion (数据 vs 情怀)
//   I/T — Individual vs Team (个人 vs 团队)
//   L/R — Loyalty vs Ring (忠诚 vs 冠军)
//
// 50 questions total. First 30 are core (精简版). #30 is open-ended.
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QuestionType = "binary" | "multi" | "open";
export type DimensionKey = "OD" | "AE" | "IT" | "LR";
export type PoleKey = "O" | "D" | "A" | "E" | "I" | "T" | "L" | "R";

export interface BbtiQuestion {
  id: number;
  type: QuestionType;
  dimension: DimensionKey | "all";
  core: boolean;
  question: string;
  optionA?: { text: string; pole: PoleKey };
  optionB?: { text: string; pole: PoleKey };
  options?: Array<{ text: string; scores: Partial<Record<PoleKey, number>> }>;
  placeholder?: string;
}

export interface BbtiAnswer {
  questionId: number;
  selected?: "A" | "B";
  selectedIndices?: number[];
  text?: string;
}

export interface BbtiType {
  code: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  spiritPlayer: string;
  spiritPlayerWhy: string;
  strengths: string[];
  weaknesses: string[];
  compatibility: string;
  nemesis: string;
  shareText?: string;
}

// ---------------------------------------------------------------------------
// Questions (50 total, 30 core)
// ---------------------------------------------------------------------------

export const bbtiQuestions: BbtiQuestion[] = [
  // ═══════════════════════════════════════════════════════════
  // OD — 矛盾维度 (12 questions, 7 core)
  // ═══════════════════════════════════════════════════════════

  // Q1 — OD, binary, core
  {
    id: 1,
    type: "binary",
    dimension: "OD",
    core: true,
    question: "刷集锦的时候，哪种瞬间最能让你头皮发麻？",
    optionA: { text: "牢大式后仰干拔绝杀，全场起立尖叫", pole: "O" },
    optionB: { text: "莱昂纳德式死亡缠绕封盖，对面眼神涣散", pole: "D" },
  },

  // Q2 — OD, multi, core
  {
    id: 2,
    type: "multi",
    dimension: "OD",
    core: true,
    question: "上帝塞给你一项NBA超能力，你必选哪个？",
    options: [
      { text: "牢大同款不讲理后仰跳投", scores: { O: 2 } },
      { text: "锁死西独小白龙的防守脚步", scores: { D: 2 } },
      { text: "读秒绝杀大心脏（关键先生HIMaburton模式）", scores: { O: 1, I: 1 } },
      { text: "文班那种改变整个禁区的盖帽威慑", scores: { D: 1, T: 1 } },
    ],
  },

  // Q3 — OD, binary, core
  {
    id: 3,
    type: "binary",
    dimension: "OD",
    core: true,
    question: "你当教练，最后一攻怎么布置？",
    optionA: { text: "把球塞给球星，让他自己创造奇迹", pole: "O" },
    optionB: { text: "先布个防守战术，稳住别让对面打成再说", pole: "D" },
  },

  // Q4 — OD, multi, core
  {
    id: 4,
    type: "multi",
    dimension: "OD",
    core: true,
    question: "哪种画面最让你直接起鸡皮疙瘩？",
    options: [
      { text: "连续三个logo shot把比赛打花", scores: { O: 2 } },
      { text: "季后赛全场紧逼，把对面节奏整崩盘", scores: { D: 2 } },
      { text: "快攻一条龙暴扣把篮筐都晃了", scores: { O: 2 } },
      { text: "关键时刻一记抢断反击两分", scores: { D: 1, O: 1 } },
    ],
  },

  // Q5 — OD, binary, core
  {
    id: 5,
    type: "binary",
    dimension: "OD",
    core: true,
    question: "选你心中的历史最佳赛季：",
    optionA: { text: "牢大06赛季场均35.4分+81分之夜", pole: "O" },
    optionB: { text: "本华莱士04赛季DPOY，活塞铁血团灭F4", pole: "D" },
  },

  // Q6 — OD, binary, core
  {
    id: 6,
    type: "binary",
    dimension: "OD",
    core: true,
    question: "球队打法你站哪边？",
    optionA: { text: "纳什太阳七秒跑轰，看着血脉偾张", pole: "O" },
    optionB: { text: "灰熊那种慢节奏铁血篮球，磨死你", pole: "D" },
  },

  // Q7 — OD, multi, core
  {
    id: 7,
    type: "multi",
    dimension: "OD",
    core: true,
    question: "如果你能偷一个招牌技带回家野球场，选哪个？",
    options: [
      { text: "乔丹的中距离后仰", scores: { O: 2 } },
      { text: "库里那种半场logo三分", scores: { O: 2 } },
      { text: "莱昂纳德的死亡缠绕防守", scores: { D: 2 } },
      { text: "奥拉朱旺的梦幻脚步带盖帽", scores: { O: 1, D: 1 } },
    ],
  },

  // Q8 — OD, binary, non-core
  {
    id: 8,
    type: "binary",
    dimension: "OD",
    core: false,
    question: "你在野球场最常被夸的点是？",
    optionA: { text: "手感稳/能得分/进攻有招", pole: "O" },
    optionB: { text: "防守拼命/抢板凶/累活全包", pole: "D" },
  },

  // Q9 — OD, multi, non-core
  {
    id: 9,
    type: "multi",
    dimension: "OD",
    core: false,
    question: "让你投全明星MVP，你给谁？",
    options: [
      { text: "砍50分的得分王（不管几成命中率）", scores: { O: 2 } },
      { text: "打出全场花活扣篮的扣篮王", scores: { O: 2 } },
      { text: "防守最猛带队赢球的那个", scores: { D: 2 } },
      { text: "数据均衡的全能六边形战士", scores: { D: 1, O: 1 } },
    ],
  },

  // Q10 — OD, binary, non-core
  {
    id: 10,
    type: "binary",
    dimension: "OD",
    core: false,
    question: "哪种剧情最让你窒息？",
    optionA: { text: "麦迪35秒13分式的逆天改命", pole: "O" },
    optionB: { text: "马刺式最后两分钟一分不让的绞杀防守", pole: "D" },
  },

  // Q11 — OD, binary, non-core
  {
    id: 11,
    type: "binary",
    dimension: "OD",
    core: false,
    question: "下面哪句你更认？",
    optionA: { text: "进攻赢票房，防守赢冠军", pole: "D" },
    optionB: { text: "进攻就是最好的防守，得分能治百病", pole: "O" },
  },

  // Q12 — OD, multi, non-core
  {
    id: 12,
    type: "multi",
    dimension: "OD",
    core: false,
    question: "你最想看哪场一对一斗牛？",
    options: [
      { text: "牢大 vs 乔丹——进攻万花筒终极对决", scores: { O: 2 } },
      { text: "莱昂纳德 vs 皮蓬——攻防一体哪个更狠", scores: { D: 1, O: 1 } },
      { text: "佩顿 vs 贝弗利——最脏防守锦标赛", scores: { D: 2 } },
      { text: "艾弗森 vs 库里——小个子的天花板对决", scores: { O: 2 } },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // AE — 判断维度 (12 questions, 7 core)
  // ═══════════════════════════════════════════════════════════

  // Q13 — AE, binary, core
  {
    id: 13,
    type: "binary",
    dimension: "AE",
    core: true,
    question: "吵GOAT之前你第一个打开的是？",
    optionA: { text: "Basketball Reference查WS/BPM/PER", pole: "A" },
    optionB: { text: "YouTube翻名场面集锦和纪录片", pole: "E" },
  },

  // Q14 — AE, multi, core
  {
    id: 14,
    type: "multi",
    dimension: "AE",
    core: true,
    question: "哪种证据最能说服你「这哥们是真的强」？",
    options: [
      { text: "高阶数据炸裂：PER/WS-48/BPM三项联盟前三", scores: { A: 2 } },
      { text: "名场面顶天：季后赛绝杀+总决赛封神", scores: { E: 2 } },
      { text: "同时代球星和教练原话给的评价", scores: { E: 1, A: 1 } },
      { text: "MVP票数+赛季排名，硬实力摆这儿", scores: { A: 2 } },
    ],
  },

  // Q15 — AE, binary, core
  {
    id: 15,
    type: "binary",
    dimension: "AE",
    core: true,
    question: "A哥场均25+5+5但零名场面，B哥场均18但绝杀数不清。谁更牛？",
    optionA: { text: "A哥，数据不会骗人但你会", pole: "A" },
    optionB: { text: "B哥，伟大不是Excel能算出来的", pole: "E" },
  },

  // Q16 — AE, binary, core
  {
    id: 16,
    type: "binary",
    dimension: "AE",
    core: true,
    question: "有人说「拉塞尔11冠 > 乔丹6冠」，你的第一反应？",
    optionA: { text: "先看看那时候联盟才几支球队再说", pole: "A" },
    optionB: { text: "11冠就是11冠，冠军没水分这回事", pole: "E" },
  },

  // Q17 — AE, multi, core
  {
    id: 17,
    type: "multi",
    dimension: "AE",
    core: true,
    question: "虎扑/微博吵架，你最常掏出来的武器是？",
    options: [
      { text: "甩一张高阶数据截图，一图封口", scores: { A: 2 } },
      { text: "丢一段名场面视频，让对面闭嘴", scores: { E: 2 } },
      { text: "搬权威媒体或名宿的原话引用", scores: { E: 1, A: 1 } },
      { text: "列荣誉清单+历史排名直接糊脸", scores: { A: 2 } },
    ],
  },

  // Q18 — AE, binary, core
  {
    id: 18,
    type: "binary",
    dimension: "AE",
    core: true,
    question: "看球时你眼睛主要盯哪里？",
    optionA: { text: "投篮热图、回合占有率、正负值", pole: "A" },
    optionB: { text: "球员表情、庆祝动作、情绪起落", pole: "E" },
  },

  // Q19 — AE, multi, core
  {
    id: 19,
    type: "multi",
    dimension: "AE",
    core: true,
    question: "评价一个球星的生涯成就，你最看重哪条？",
    options: [
      { text: "总冠军数量——戒指就是硬通货", scores: { E: 1, A: 1 } },
      { text: "VORP——可替代价值才显含金量", scores: { A: 2 } },
      { text: "让你起鸡皮疙瘩的比赛有几场", scores: { E: 2 } },
      { text: "生涯Win Shares——综合贡献顶配指标", scores: { A: 2 } },
    ],
  },

  // Q20 — AE, binary, non-core
  {
    id: 20,
    type: "binary",
    dimension: "AE",
    core: false,
    question: "艾弗森生涯胜率不到五成，但「跨过泰伦卢」永载史册。你怎么看？",
    optionA: { text: "情怀不能当饭吃，数据摆这他就是二流", pole: "A" },
    optionB: { text: "那一画面比任何Excel都重要", pole: "E" },
  },

  // Q21 — AE, multi, non-core
  {
    id: 21,
    type: "multi",
    dimension: "AE",
    core: false,
    question: "哪种事实会让你重新评价一个球员？",
    options: [
      { text: "发现他真实命中率（TS%）其实拉跨", scores: { A: 2 } },
      { text: "看到他绑着绷带咬牙上场的纪录片", scores: { E: 2 } },
      { text: "得知他RPM/BPM都排联盟前五", scores: { A: 2 } },
      { text: "听说更衣室所有人都愿意为他拼命", scores: { E: 2 } },
    ],
  },

  // Q22 — AE, binary, non-core
  {
    id: 22,
    type: "binary",
    dimension: "AE",
    core: false,
    question: "「曼巴精神」到底是个啥？",
    optionA: { text: "营销话术罢了，看数据就完事", pole: "A" },
    optionB: { text: "真实存在的意志力，能感染一代人", pole: "E" },
  },

  // Q23 — AE, binary, non-core
  {
    id: 23,
    type: "binary",
    dimension: "AE",
    core: false,
    question: "中神通约基奇 vs 南僧恩比德，你站谁？",
    optionA: { text: "约妈，高阶数据降维打击", pole: "A" },
    optionB: { text: "恩比德，看比赛就是更猛更具统治力", pole: "E" },
  },

  // Q24 — AE, multi, non-core
  {
    id: 24,
    type: "multi",
    dimension: "AE",
    core: false,
    question: "退役球星最好的纪录片应该长啥样？",
    options: [
      { text: "用数据可视化还原他每赛季的统治力", scores: { A: 2 } },
      { text: "深入幕后，把他的泪水和挣扎全拍出来", scores: { E: 2 } },
      { text: "采访对手让他们承认「被支配的恐惧」", scores: { E: 1, A: 1 } },
      { text: "拆解战术，讲清他怎么改变了篮球", scores: { A: 2 } },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // IT — 信仰维度 (13 questions, 8 core)
  // ═══════════════════════════════════════════════════════════

  // Q25 — IT, binary, core
  {
    id: 25,
    type: "binary",
    dimension: "IT",
    core: true,
    question: "最伟大的赛季应该长啥样？",
    optionA: { text: "乔丹季后赛单场63分屠杀凯尔特人", pole: "I" },
    optionB: { text: "04活塞没全明星却团灭湖人F4夺冠", pole: "T" },
  },

  // Q26 — IT, binary, core
  {
    id: 26,
    type: "binary",
    dimension: "IT",
    core: true,
    question: "你打野球更想要哪种结局？",
    optionA: { text: "自己砍40分，输赢随缘", pole: "I" },
    optionB: { text: "全队配合丝滑，赢球才是正经事", pole: "T" },
  },

  // Q27 — IT, multi, core
  {
    id: 27,
    type: "multi",
    dimension: "IT",
    core: true,
    question: "你心目中「篮球之美」最炸的体现是？",
    options: [
      { text: "艾弗森一个人扛76人杀进总决赛", scores: { I: 2 } },
      { text: "14马刺行云流水的团队篮球", scores: { T: 2 } },
      { text: "牢大最后一场谢幕之夜砍60分", scores: { I: 2 } },
      { text: "勇士死亡五小的化学反应", scores: { T: 2 } },
    ],
  },

  // Q28 — IT, binary, core
  {
    id: 28,
    type: "binary",
    dimension: "IT",
    core: true,
    question: "你更欣赏哪种球星？",
    optionA: { text: "威少式一己之力刷三双那种", pole: "I" },
    optionB: { text: "纳什式组织大师让全队都变好", pole: "T" },
  },

  // Q29 — IT, multi, core
  {
    id: 29,
    type: "multi",
    dimension: "IT",
    core: true,
    question: "一个超巨最大的责任是啥？",
    options: [
      { text: "关键时刻一锤定音地接管比赛", scores: { I: 2 } },
      { text: "让身边每个队友都变得更强", scores: { T: 2 } },
      { text: "用个人表现点燃整支球队的士气", scores: { I: 1, T: 1 } },
      { text: "建立一种赢球的文化和体系", scores: { T: 2 } },
    ],
  },

  // ── Q30 — Open question, core (last core question) ──
  {
    id: 30,
    type: "open",
    dimension: "all",
    core: true,
    question: "如果能跟一个退役/去世的NBA球星吃顿饭，你选谁？想聊啥？为啥是他？",
    placeholder: "随便聊聊，骂街也行吹彩虹屁也行……（至少20字）",
  },

  // Q31 — IT, binary, core
  {
    id: 31,
    type: "binary",
    dimension: "IT",
    core: true,
    question: "「双核驱动」还是「一人独大」？",
    optionA: { text: "一队只需要一个绝对核心，多核必内讧", pole: "I" },
    optionB: { text: "顶级球队都得双核甚至三核才稳", pole: "T" },
  },

  // Q32 — IT, multi, core
  {
    id: 32,
    type: "multi",
    dimension: "IT",
    core: true,
    question: "总决赛G7，你最想看到啥？",
    options: [
      { text: "一个人砍50+封神，独狼模式", scores: { I: 2 } },
      { text: "首发五人每人15+，全员高效", scores: { T: 2 } },
      { text: "球星爆40+ + 角色球员关键三分", scores: { I: 1, T: 1 } },
      { text: "团队防守窒息全场，绞杀对手", scores: { T: 2 } },
    ],
  },

  // Q33 — IT, binary, core
  {
    id: 33,
    type: "binary",
    dimension: "IT",
    core: true,
    question: "MVP应该投给谁？",
    optionA: { text: "数据炸裂的个人表现者（北丐SGA那种）", pole: "I" },
    optionB: { text: "带队战绩第一的球队领袖（约妈那种）", pole: "T" },
  },

  // Q34 — IT, multi, non-core
  {
    id: 34,
    type: "multi",
    dimension: "IT",
    core: false,
    question: "你最爱看的进攻方式是？",
    options: [
      { text: "面框单打，一对一干拔", scores: { I: 2 } },
      { text: "挡拆后多次传导找空位", scores: { T: 2 } },
      { text: "无球跑动接球就投（库里那套）", scores: { T: 1, I: 1 } },
      { text: "快攻一条龙暴扣", scores: { I: 2 } },
    ],
  },

  // Q35 — IT, binary, non-core
  {
    id: 35,
    type: "binary",
    dimension: "IT",
    core: false,
    question: "2017勇士 vs 2001湖人，你想要哪支？",
    optionA: { text: "01湖人——奥尼尔就是答案，问题在哪？", pole: "I" },
    optionB: { text: "17勇士——四巨头化学反应直接打穿联盟", pole: "T" },
  },

  // Q36 — IT, binary, non-core
  {
    id: 36,
    type: "binary",
    dimension: "IT",
    core: false,
    question: "你打2K更爱玩哪个模式？",
    optionA: { text: "选个球星solo模式爆电脑", pole: "I" },
    optionB: { text: "MyGM经营球队建王朝", pole: "T" },
  },

  // Q37 — IT, multi, non-core
  {
    id: 37,
    type: "multi",
    dimension: "IT",
    core: false,
    question: "笨分王满膏蟹的「抱团」最该被骂的点是？",
    options: [
      { text: "超巨就该单核带队证明自己，不能打不过就加入", scores: { I: 2 } },
      { text: "没啥好骂的，聪明人找最优解叫智能腹股沟", scores: { T: 2 } },
      { text: "方式恶心，The Decision直播搞得跟综艺一样", scores: { E: 1, I: 1 } },
      { text: "队友太强，4个FMVP分三队拿的，冠军含金量打折", scores: { I: 2 } },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // LR — 忠诚维度 (12 questions, 7 core)
  // ═══════════════════════════════════════════════════════════

  // Q38 — LR, binary, core
  {
    id: 38,
    type: "binary",
    dimension: "LR",
    core: true,
    question: "杜兰特16年去勇士这事……",
    optionA: { text: "叛徒。打不过就加入这套谁认？", pole: "L" },
    optionB: { text: "聪明人。球员有权找最优路径", pole: "R" },
  },

  // Q39 — LR, binary, core
  {
    id: 39,
    type: "binary",
    dimension: "LR",
    core: true,
    question: "假设你是球星，母队顶薪但阵容拉跨 vs 争冠队降薪2000万但能夺冠：",
    optionA: { text: "留下。这是我的城市我的球迷", pole: "L" },
    optionB: { text: "走。冠军才是永恒的，钱也不能不要", pole: "R" },
  },

  // Q40 — LR, multi, core
  {
    id: 40,
    type: "multi",
    dimension: "LR",
    core: true,
    question: "下面谁的选择最让你竖大拇指？",
    options: [
      { text: "诺天王——一生达拉斯，一座冠军足够封神", scores: { L: 2 } },
      { text: "笨分王满膏蟹——哪能赢去哪，四队三冠", scores: { R: 2 } },
      { text: "牢大——差点走了但最终留下，五冠收尾", scores: { L: 1, R: 1 } },
      { text: "皮蓬——忍公牛多年低薪，终于拿到戒指", scores: { L: 1, T: 1 } },
    ],
  },

  // Q41 — LR, binary, core
  {
    id: 41,
    type: "binary",
    dimension: "LR",
    core: true,
    question: "镇长哈登雷霆→火箭→篮网→76人→快船，你怎么看？",
    optionA: { text: "没有忠诚的人不值得尊敬", pole: "L" },
    optionB: { text: "追冠没毛病，球队也在交易球员凭啥单方面要求忠诚", pole: "R" },
  },

  // Q42 — LR, multi, core
  {
    id: 42,
    type: "multi",
    dimension: "LR",
    core: true,
    question: "球员忠诚最大的敌人是啥？",
    options: [
      { text: "管理层不忠诚——球队随时把你交易出去", scores: { R: 2 } },
      { text: "时间——巅峰就那几年，等不起就废了", scores: { R: 2 } },
      { text: "没有敌人，忠诚就是一种信仰", scores: { L: 2 } },
      { text: "不匹配——这支球队根本配不上你的忠诚", scores: { R: 1, L: 1 } },
    ],
  },

  // Q43 — LR, binary, core
  {
    id: 43,
    type: "binary",
    dimension: "LR",
    core: true,
    question: "3冠+换3队 vs 1冠+只待1队，谁历史地位更高？",
    optionA: { text: "1冠1队，忠诚加成直接拉满", pole: "L" },
    optionB: { text: "3冠3队，冠军数量才是硬指标", pole: "R" },
  },

  // Q44 — LR, binary, core
  {
    id: 44,
    type: "binary",
    dimension: "LR",
    core: true,
    question: "你的球迷身份本质是？",
    optionA: { text: "某队死忠：球星来来走走，队永远在", pole: "L" },
    optionB: { text: "球星粉：他去哪我跟到哪", pole: "R" },
  },

  // Q45 — LR, binary, non-core
  {
    id: 45,
    type: "binary",
    dimension: "LR",
    core: false,
    question: "满膏蟹回骑士那年你啥感觉？",
    optionA: { text: "感动！浪子回头金不换", pole: "L" },
    optionB: { text: "精明。骑士有状元签他才回去的，智能腹股沟实锤", pole: "R" },
  },

  // Q46 — LR, multi, non-core
  {
    id: 46,
    type: "multi",
    dimension: "LR",
    core: false,
    question: "下面哪个球员你最心疼？",
    options: [
      { text: "纳什——太阳一生，从没碰过总决赛", scores: { L: 2 } },
      { text: "巴克利——有实力没冠军，宁可不抱团", scores: { L: 1, I: 1 } },
      { text: "瓜哥——明明可以去争冠却选择了钱", scores: { R: 1, I: 1 } },
      { text: "不心疼，没冠军是他自己选的", scores: { R: 2 } },
    ],
  },

  // Q47 — LR, binary, non-core
  {
    id: 47,
    type: "binary",
    dimension: "LR",
    core: false,
    question: "最爱的球星突然被交易到你最恨的球队，你会？",
    optionA: { text: "继续支持原球队，球星滚他的", pole: "L" },
    optionB: { text: "跟着球星走，球队算个啥", pole: "R" },
  },

  // Q48 — LR, multi, non-core
  {
    id: 48,
    type: "multi",
    dimension: "LR",
    core: false,
    question: "利拉德最终还是离开开拓者，你怎么看？",
    options: [
      { text: "惋惜，忠诚人设直接崩了", scores: { L: 2 } },
      { text: "理解。他给开拓者的时间已经够多了", scores: { R: 1, L: 1 } },
      { text: "早该走了，开拓者纯纯浪费他的巅峰", scores: { R: 2 } },
      { text: "无感，球员来来走走很正常", scores: { R: 2 } },
    ],
  },

  // Q49 — LR, binary, non-core
  {
    id: 49,
    type: "binary",
    dimension: "LR",
    core: false,
    question: "哪个冠军含金量更高？",
    optionA: { text: "诺天王2011——一城一队，逆天改命", pole: "L" },
    optionB: { text: "满膏蟹2016——回归故土3-1翻盘（顺便提一下24年雄鹿没逆转）", pole: "R" },
  },

  // Q50 — LR, multi, non-core
  {
    id: 50,
    type: "multi",
    dimension: "LR",
    core: false,
    question: "你当NBA总裁，会推哪条新政？",
    options: [
      { text: "忠诚条款：效力同队10年以上不占工资帽", scores: { L: 2 } },
      { text: "完全自由市场：取消一切限制，球员随便流动", scores: { R: 2 } },
      { text: "球队保护：每队可永久保留一名核心球员", scores: { L: 2 } },
      { text: "冠军激励：夺冠球员薪资加成50%", scores: { R: 2 } },
    ],
  },
];

// ---------------------------------------------------------------------------
// 16 Personality Types
// ---------------------------------------------------------------------------

export const bbtiTypes: Record<string, BbtiType> = {
  // ── Offense + Analytics + Individual + Loyalty ──
  OAIL: {
    code: "OAIL",
    name: "数据流独狼",
    emoji: "🐺",
    tagline: "拿Excel证明你家球星单核带队BPM正10",
    description:
      "你是那种在虎扑发帖一定要附十张数据图的人。一边死忠主队球星，一边用WS/PER/BPM冷冰冰的数字给他护体——「我不是粉，我是看数据」。你的热爱是理性的，但比任何饭圈都炽烈。",
    spiritPlayer: "科比·布莱恩特",
    spiritPlayerWhy:
      "牢大忠诚湖城20年，个人能力开挂，还是最早研究录像和高阶数据的球员之一——独狼信仰和数据偏执的完美合体。",
    strengths: [
      "辩论时数据列得明明白白，对面只能搬「你不懂篮球」",
      "看球能同时盯比分和正负值，多线程操作满级",
      "你家球星每个赛季的TS%你都背得出来",
    ],
    weaknesses: [
      "和别队球迷吵架直接变数据轰炸机，劝退一圈人",
      "「你看他的WS」说出口的瞬间，朋友已经退群了",
      "承认主队球星的弱点比让你删数据库还难",
    ],
    compatibility: "OATL",
    nemesis: "DETR",
    shareText: "BBTI测出来我是数据流独狼，BPM正10单核带队，谁来跟我聊聊高阶数据？",
  },

  // ── Offense + Analytics + Individual + Ring ──
  OAIR: {
    code: "OAIR",
    name: "效率至上杀手",
    emoji: "⚡",
    tagline: "不看你是谁，只看你Win Share够不够",
    description:
      "你是篮球世界的冷血会计。情怀？忠诚？「热爱」？统统是干扰判断的噪声。谁效率高谁就是爹，今年是约妈明年可能就是西独，你不在乎，反正你站的是「真实力」。",
    spiritPlayer: "詹姆斯·哈登",
    spiritPlayerWhy:
      "镇长是进攻效率怪兽，换过五支球队只为争冠，造犯规也是真本事——「税后得分」也是得分，BPM不会骗人。",
    strengths: [
      "看球最不容易被叙事和情怀带节奏",
      "一眼看穿谁是真大腿谁是吉祥物",
      "对NBA数据的理解吊打99%的微博键盘侠",
    ],
    weaknesses: [
      "朋友圈发球评零点赞，太冷冰冰像股评",
      "别人跟你聊浪漫，你跟人家聊BPM，话题死透",
      "心爱球星可能下个赛季就换人，毫无感情包袱",
    ],
    compatibility: "DAIR",
    nemesis: "OEIL",
    shareText: "BBTI说我是效率至上杀手，谁高阶数据炸我就站谁，今年站约妈明年看着办。",
  },

  // ── Offense + Analytics + Team + Loyalty ──
  OATL: {
    code: "OATL",
    name: "战术板教授",
    emoji: "📋",
    tagline: "你不是在看球，你是在上战术分析公开课",
    description:
      "你是球队体系的脑残粉，又懂数据又爱华丽进攻。每一次挡拆每一个跑位都能给你看出门道，朋友约你看球都怕你开口——一开口就是15分钟解说，比柯凡还卷。",
    spiritPlayer: "斯蒂芬·库里",
    spiritPlayerWhy:
      "金州卡点王改变篮球，勇士体系核心，从头到尾只效力一支球队——进攻+团队+忠诚三件套齐活。",
    strengths: [
      "对篮球比赛的理解深度吊打大部分纯吹流",
      "能用数据解释为啥你家球队的打法就是最优解",
      "从不被华丽个人表演骗到，永远盯着体系运转",
    ],
    weaknesses: [
      "看球时旁边人都在嗑瓜子，你在画战术板",
      "动不动就「其实欧洲篮球比NBA更纯粹」，把天聊死",
      "兄弟聚会聊球只有你在说，其他人都低头刷抖音",
    ],
    compatibility: "OAIL",
    nemesis: "DEIR",
    shareText: "BBTI鉴定我是战术板教授，看个球能讲半小时挡拆——朋友约我看NBA都自带耳塞。",
  },

  // ── Offense + Analytics + Team + Ring ──
  OATR: {
    code: "OATR",
    name: "冠军工程师",
    emoji: "🏗️",
    tagline: "用数据模型给你拼一支总冠军",
    description:
      "你是莫雷的精神门徒。你只信数据、只信体系、只信最优解。忠诚叙事？情怀加成？数据上算不出来的东西在你这都是噪声。你看球像看一个待优化的工程项目。",
    spiritPlayer: "勒布朗·詹姆斯",
    spiritPlayerWhy:
      "笨分王智能腹股沟，篮球智商满级，四队三冠纯属算计最优解——满膏蟹就是一台行走的团队进攻数据模型。",
    strengths: [
      "比任何人都清楚怎么建一支冠军球队",
      "分析交易和签约比真GM还准，亚当肖华看了都心慌",
      "永远站在赢球那一边，毫无情怀负担",
    ],
    weaknesses: [
      "被嘲「你不是球迷你是股评师」",
      "最怕别人问你到底是哪队的球迷",
      "聊球太理性，朋友觉得你没有感情",
    ],
    compatibility: "DATR",
    nemesis: "OEIL",
    shareText: "BBTI说我是冠军工程师——莫雷精神门徒，建队思路比真GM清晰，敢不敢用我管球队？",
  },

  // ── Offense + Emotion + Individual + Loyalty ──
  OEIL: {
    code: "OEIL",
    name: "浪漫曼巴",
    emoji: "🌹",
    tagline: "活在集锦里的牢粉，81分那场能让你哭三次",
    description:
      "你是最纯粹的篮球浪漫主义者。一个绝杀、一个谢幕、一段集锦就能把你眼泪逼出来。「阵前再亮旧时钳，蟹黄满满似当年」——你爱你家球星爱到骨子里，谁拿数据跟你聊命中率你就拉黑谁。",
    spiritPlayer: "阿伦·艾弗森",
    spiritPlayerWhy:
      "一个人扛76人，跨过泰伦卢，从不向任何人低头——AI是篮球浪漫主义最终图腾，没冠军又怎样。",
    strengths: [
      "看球的快乐指数永远是朋友圈最高的",
      "随便讲一场比赛能说得像史诗大片",
      "对篮球的热爱比任何人都纯，全靠真心",
    ],
    weaknesses: [
      "一看到「真实命中率」「税后得分」这种词就头疼",
      "你家球星的TS%是多少？「这重要吗这重要吗」",
      "黑他的都是酸都是嫉妒，他就算拉了也是队友不行",
    ],
    compatibility: "OEIR",
    nemesis: "OAIR",
    shareText: "BBTI鉴定我是浪漫曼巴：牢大81分能让我哭三次，黑他的都是酸——别拿你的Excel来教我看球。",
  },

  // ── Offense + Emotion + Individual + Ring ──
  OEIR: {
    code: "OEIR",
    name: "荣誉猎手",
    emoji: "🦅",
    tagline: "信英雄主义，但最后还是问一句：他几个戒指？",
    description:
      "你欣赏个人英雄主义的浪漫，但最后一关你还是会问「他拿了几个FMVP？」绝杀帅是真帅，没冠军也是真不行——你站在浪漫和冠军的拉扯之间，每年都被自己折磨。",
    spiritPlayer: "凯文·杜兰特",
    spiritPlayerWhy:
      "KD进攻天赋历史级，为了冠军敢做最「不受欢迎」的决定（去勇士被骂上天），个人能力和冠军追求的极致拉扯。",
    strengths: [
      "既能欣赏篮球的美感又有冠军格局",
      "看球永远盯最精彩的系列赛",
      "总能在大场面里找到最燃的瞬间",
    ],
    weaknesses: [
      "立场会跟着季后赛走势摇摆，被嘲是「真香警告本警」",
      "「冠军含金量」这五个字能让你精神内耗一整晚",
      "朋友觉得你有点「谁赢支持谁」，洗都洗不掉",
    ],
    compatibility: "OEIL",
    nemesis: "DATL",
    shareText: "BBTI说我是荣誉猎手——既要浪漫又要戒指，季后赛跟着风向摇摆，朋友说我是真香本香。",
  },

  // ── Offense + Emotion + Team + Loyalty ──
  OETL: {
    code: "OETL",
    name: "黄金年代守望者",
    emoji: "🌅",
    tagline: "现在的篮球都是软蛋，handcheck取消后得分都是水的",
    description:
      "你是老派球迷里最浪漫的那种。07太阳的跑轰、14马刺的传切、90年代公牛的三角进攻是你的精神食粮。你忠于自家球队，怀念那种「真正的篮球」，每次看现在的比赛都摇头。",
    spiritPlayer: "斯蒂夫·纳什",
    spiritPlayerWhy:
      "太阳七秒跑轰的灵魂，把华丽配合打成艺术，一生只忠于那种打法哲学——没冠军又怎样，球迷一辈子记得。",
    strengths: [
      "看球审美在线，懂得欣赏团队之美",
      "对篮球历史的了解深入骨髓，年代梗张口就来",
      "永远能找到一支球队让自己热爱",
    ],
    weaknesses: [
      "总觉得现在的NBA没有以前好看了，看比赛就开始念旧",
      "「现在的篮球都是软蛋」是你日常口头禅",
      "球队要是进入重建，你能难受半个赛季",
    ],
    compatibility: "DETL",
    nemesis: "OAIR",
    shareText: "BBTI说我是黄金年代守望者——现在的篮球都是软蛋，handcheck取消后得分都是水的，谁懂？",
  },

  // ── Offense + Emotion + Team + Ring ──
  OETR: {
    code: "OETR",
    name: "王朝追随者",
    emoji: "👑",
    tagline: "哪队又好看又赢球，下一秒我就是它球迷",
    description:
      "你爱团队篮球的美感，但你更爱赢。巅峰勇士、OK湖人、公牛王朝、热火三巨头——你永远在最强的那支队周围，下一场肯定能赢回来是你的口头禅。",
    spiritPlayer: "德怀恩·韦德",
    spiritPlayerWhy:
      "闪电侠在热火打出最华丽的团队进攻，又敢拉满膏蟹和波什来组三巨头——进攻美学和冠军追求的完美交集。",
    strengths: [
      "永远站在最精彩的篮球旁边",
      "朋友圈球评总是点赞最多的那个",
      "对每个时代最强的球队如数家珍",
    ],
    weaknesses: [
      "被嘲「你支持的球队永远在赢，球队Logo会变」",
      "没有一支从低谷陪到巅峰的球队，盲目乐观换队",
      "说不清自己到底是哪支球队的真球迷",
    ],
    compatibility: "OATR",
    nemesis: "DEIL",
    shareText: "BBTI鉴定我是王朝追随者——哪队又赢又好看下一秒我就是它球迷，「下一场肯定赢」是我口头禅。",
  },

  // ── Defense + Analytics + Individual + Loyalty ──
  DAIL: {
    code: "DAIL",
    name: "铁血忠犬",
    emoji: "🛡️",
    tagline: "用防守效率证明我家球星被低估了二十年",
    description:
      "你是最被忽视的那种球迷：用数据钻研防守，还死忠主队。你能告诉DPOY投票为啥不合理，你家球星的防守真实影响力远超主流认知——可惜没人爱听，handcheck取消后得分都是水的，咱不计较了。",
    spiritPlayer: "蒂姆·邓肯",
    spiritPlayerWhy:
      "石佛是历史最强防守内线之一，一生圣安东尼奥，用安静的统治力和完美的防守数据说话——铁血+忠诚+数据三合一。",
    strengths: [
      "看球视角比一般人深一层，能看到防守端的暗线",
      "能挖出那些「看不到的伟大」，比如对抗+无球协防",
      "忠诚且有理有据，朋友圈最可信的球评号",
    ],
    weaknesses: [
      "安利别人看防守数据时对方眼睛已经闭上了",
      "「现在的篮球都是软蛋」+「我家球星被低估了」组合拳天天打",
      "兄弟聚会一聊球大家就散了，太硬核了真的",
    ],
    compatibility: "DATL",
    nemesis: "OEIR",
    shareText: "BBTI说我是铁血忠犬——用防守效率给主队球星护体，handcheck取消后得分都是水的不用谢。",
  },

  // ── Defense + Analytics + Individual + Ring ──
  DAIR: {
    code: "DAIR",
    name: "暗杀星猎人",
    emoji: "🎯",
    tagline: "防守端数据怪，只认两端都打的冠军级球员",
    description:
      "你是最「冷血」的球迷类型。一切用数据衡量，偏爱防守端的个人统治力，还只认有冠军加持的。在你眼里，没冠军的DPOY都是浮云——「他配吗？」",
    spiritPlayer: "科怀·莱昂纳德",
    spiritPlayerWhy:
      "DPOY+FMVP，从马刺到猛龙用防守和冷血表现拿冠军——防守+数据+冠军的终极代言人，没废话。",
    strengths: [
      "评价球员最客观也最全面",
      "永远关注其他人忽视的防守端细节",
      "讨论GOAT时总能甩出冷门视角和数据",
    ],
    weaknesses: [
      "太冷门，能跟你聊得起来的人在虎扑都难找",
      "别人觉得你「懂球但不好玩」，约你看球都怕",
      "最喜欢的球星每年都换，因为标准太严苛",
    ],
    compatibility: "OAIR",
    nemesis: "OETL",
    shareText: "BBTI测出我是暗杀星猎人——只认两端都打的冠军级球员，没戒指的DPOY？「他配吗？」",
  },

  // ── Defense + Analytics + Team + Loyalty ──
  DATL: {
    code: "DATL",
    name: "防守体系原教旨",
    emoji: "🏰",
    tagline: "波波维奇是我的精神导师，04活塞是我心中NBA天花板",
    description:
      "你是马刺球迷本体。信体系、信防守效率、信忠诚。你看球第一眼是防守评级而不是得分，在你心里04活塞才是篮球的终极形态——什么超巨抱团那都是邪魔外道。",
    spiritPlayer: "鲁迪·戈贝尔",
    spiritPlayerWhy:
      "三届DPOY，用数据证明防守核心对球队的真实价值。常年被网友嘲笑但防守真实影响力排历史前列——他被低估你心知肚明。",
    strengths: [
      "对篮球战术的理解吊打大部分球迷",
      "不会被花哨的进攻数据带偏判断",
      "支持的球队往往有最稳定的常规赛战绩",
    ],
    weaknesses: [
      "全明星赛你看一秒就换台，「这玩意算篮球？」",
      "约朋友看球时没人想跟你一起看你喜欢的球队",
      "嘴上说着「看球有深度」其实看的场次比朋友少",
    ],
    compatibility: "DAIL",
    nemesis: "OEIR",
    shareText: "BBTI说我是防守体系原教旨——波波维奇是我精神导师，04活塞才是篮球天花板，超巨抱团滚远点。",
  },

  // ── Defense + Analytics + Team + Ring ──
  DATR: {
    code: "DATR",
    name: "冠军体系架构师",
    emoji: "🔧",
    tagline: "防守效率+团队体系+合理薪资=冠军公式",
    description:
      "你是最「理工科思维」的球迷。冠军是有公式的：防守效率+团队配合+合理薪资结构。你看球像看工程项目——下一个冠军是谁，你比拉斯维加斯赔率还准。",
    spiritPlayer: "拉希德·华莱士",
    spiritPlayerWhy:
      "04活塞的关键拼图，防守端的万金油，帮没超巨的球队赢下总冠军——团队防守+冠军的完美案例样本。",
    strengths: [
      "预测季后赛走势准得离谱，朋友都让你帮忙买竞猜",
      "能看透一支球队的真正实力（不被战绩骗）",
      "建队思路清晰到可以当真GM",
    ],
    weaknesses: [
      "看球像在看财报，缺乏激情，老婆/对象快要崩溃",
      "和朋友争论时永远「你看数据」，被拉黑过两次",
      "太理性以至于自己都不太享受比赛本身了",
    ],
    compatibility: "OATR",
    nemesis: "OEIL",
    shareText: "BBTI说我是冠军体系架构师：防守效率+团队+薪资合理=冠军公式，下个夺冠的是谁我比博彩还准。",
  },

  // ── Defense + Emotion + Individual + Loyalty ──
  DEIL: {
    code: "DEIL",
    name: "孤胆守城人",
    emoji: "🐻",
    tagline: "我家球星防守最强，谁说不是我跟谁急",
    description:
      "你是最感性的防守拥趸。一个盖帽就能让你热泪盈眶，球星的铁血防守是你最大的骄傲。「你可以骂我但不能骂我的球队」——一城一队，至死不渝。",
    spiritPlayer: "凯文·加内特",
    spiritPlayerWhy:
      "明尼苏达的狼王，用怒吼和防守强度定义忠诚与铁血——一个人扛起整座城市的防守图腾，KG才是真男人。",
    strengths: [
      "对篮球的热爱最纯粹也最深沉",
      "能看到防守端别人完全注意不到的美",
      "忠诚度感天动地，全队卖你也还在",
    ],
    weaknesses: [
      "被问「你家球星场均几分」时表情极度尴尬",
      "和进攻型球迷完全无法交流，鸡同鸭讲",
      "有时候忠诚到盲目，「他配不上你的忠诚」？不存在",
    ],
    compatibility: "DETL",
    nemesis: "OETR",
    shareText: "BBTI说我是孤胆守城人——我家球星防守最强谁说不是我跟谁急，你可以骂我但不能骂我的球队。",
  },

  // ── Defense + Emotion + Individual + Ring ──
  DEIR: {
    code: "DEIR",
    name: "暗夜刺客",
    emoji: "🗡️",
    tagline: "不声不响用防守杀死比赛，然后拿走奖杯",
    description:
      "你欣赏那种安静又致命的球员——不靠华丽进攻，靠防守端的统治力赢一切。你信冠军，也信「个人防守能改变一个系列赛」这件事。Thundertaker送葬者那一套你最爱。",
    spiritPlayer: "斯科蒂·皮蓬",
    spiritPlayerWhy:
      "公牛王朝的防守基石，个人防守能力历史级，用防守帮乔丹拿下6冠——最被低估的冠军功臣，绝对的二当家天花板。",
    strengths: [
      "能欣赏篮球里最被忽视的一面",
      "对「谁才是冠军真功臣」有独到见解",
      "不盲目追随主流GOAT话术",
    ],
    weaknesses: [
      "喜欢的球员都是二当家或防守悍将，主流话题插不进去",
      "和朋友看球时总在关注没有球的那一端",
      "有时候太小众，自己都觉得有点孤独",
    ],
    compatibility: "DAIR",
    nemesis: "OATL",
    shareText: "BBTI说我是暗夜刺客——不声不响用防守杀死比赛，最爱送葬者风格的二当家，懂的都懂。",
  },

  // ── Defense + Emotion + Team + Loyalty ──
  DETL: {
    code: "DETL",
    name: "铁血城池守护者",
    emoji: "⚔️",
    tagline: "我的城市我的球队，防守就是我的信仰",
    description:
      "你是最「硬核」的球迷类型。爱球队的防守强度，爱碉堡式团队防守，永远不会背叛城市。最美比分？85-79。看小球时代的飙分大战你觉得那都是软蛋玩的。",
    spiritPlayer: "本·华莱士",
    spiritPlayerWhy:
      "底特律活塞的铁血灵魂，史上最强未选秀球员，用纯粹的防守和团队精神带队夺冠——忠诚+防守+团队的极致化身。",
    strengths: [
      "对篮球的理解比大多数人都深一层",
      "是球队最铁杆最忠诚的球迷，下雪也去现场",
      "能在平淡的防守回合里看到史诗感",
    ],
    weaknesses: [
      "看全明星赛觉得是浪费时间，「这不是篮球」",
      "朋友圈发的防守集锦没人看，零点赞",
      "被人嘲笑「你看的是篮球还是足球？」",
    ],
    compatibility: "DEIL",
    nemesis: "OATR",
    shareText: "BBTI说我是铁血城池守护者——最美比分85-79，现在的小球时代都是软蛋玩的，你可以骂我但不能骂我的球队。",
  },

  // ── Defense + Emotion + Team + Ring ──
  DETR: {
    code: "DETR",
    name: "冠军体系信徒",
    emoji: "🏆",
    tagline: "团队防守+冠军=篮球的终极意义",
    description:
      "你信团队大于个人、防守大于进攻、冠军大于一切。04活塞、14马刺、那些用团队防守窒息对手的冠军球队是你的本命。其实就是管理层和球队文化的问题——没有冠军DNA的队你看都懒得看。",
    spiritPlayer: "罗伯特·霍里",
    spiritPlayerWhy:
      "7枚冠军戒指的团队球员，从火箭到湖人到马刺都是冠军拼图——永远站在赢球的防守体系里，大场面先生不是白叫的。",
    strengths: [
      "判断一支球队能不能夺冠你最准，下注必中",
      "看球最享受那种窒息式防守的快感",
      "对「冠军DNA」「球队文化」的理解超越常人",
    ],
    weaknesses: [
      "可能每年支持不同的夺冠热门，被嘲是「冠军收集者」",
      "「你不是球迷你是冠军跟班」是身边人最爱说的话",
      "不太能理解为什么有人爱看输球的弱队",
    ],
    compatibility: "DATR",
    nemesis: "OAIL",
    shareText: "BBTI说我是冠军体系信徒——团队防守+冠军才是篮球终极意义，「其实就是管理层的问题」是我口头禅。",
  },
};

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/**
 * Compute BBTI 4-letter code from a set of answers.
 *
 * Binary questions: chosen pole gets +2.
 * Multi questions: first selected option's scores are applied.
 * Open questions: ignored for scoring.
 */
export function computeBbtiCode(answers: BbtiAnswer[]): string {
  const scores: Record<PoleKey, number> = {
    O: 0,
    D: 0,
    A: 0,
    E: 0,
    I: 0,
    T: 0,
    L: 0,
    R: 0,
  };

  for (const answer of answers) {
    const question = bbtiQuestions.find((q) => q.id === answer.questionId);
    if (!question) continue;

    if (question.type === "open") continue;

    if (question.type === "binary" && answer.selected) {
      if (answer.selected === "A" && question.optionA) {
        scores[question.optionA.pole] += 2;
      } else if (answer.selected === "B" && question.optionB) {
        scores[question.optionB.pole] += 2;
      }
    }

    if (question.type === "multi" && answer.selectedIndices && question.options) {
      for (const idx of answer.selectedIndices) {
        const option = question.options[idx];
        if (!option) continue;
        for (const [pole, value] of Object.entries(option.scores)) {
          scores[pole as PoleKey] += value;
        }
      }
    }
  }

  const dim1 = scores.O >= scores.D ? "O" : "D";
  const dim2 = scores.A >= scores.E ? "A" : "E";
  const dim3 = scores.I >= scores.T ? "I" : "T";
  const dim4 = scores.L >= scores.R ? "L" : "R";

  return `${dim1}${dim2}${dim3}${dim4}`;
}

/**
 * Look up a BBTI type by its 4-letter code.
 * Falls back to OAIL if the code is unknown.
 */
export function getBbtiType(code: string): BbtiType {
  return bbtiTypes[code] ?? bbtiTypes["OAIL"];
}

/**
 * Get only the core questions (30 questions for 精简版).
 */
export function getCoreQuestions(): BbtiQuestion[] {
  return bbtiQuestions.filter((q) => q.core);
}
