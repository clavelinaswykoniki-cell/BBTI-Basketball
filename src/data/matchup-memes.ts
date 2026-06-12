export interface MatchupMemePack {
  heat: string;
  headline: string;
  court: string;
  stakes: string;
  bannedPhrase: string;
  pressureQuestion: string;
  chant: string;
  groupChatPrompt: string;
  tags: string[];
}

type MatchupMemeTemplate = Omit<MatchupMemePack, "tags"> & {
  tags: string[];
};

const FIXED_PACKS: Record<string, MatchupMemeTemplate> = {
  "kobe-vs-lebron": {
    heat: "99 HEAT",
    headline: "{A}精神法庭 vs {B}全能工程",
    court: "GOAT Debate Supreme Court",
    stakes: "输的一方今晚群聊只能发集锦，不能发长文。",
    bannedPhrase: "别只说“效率”和“曼巴精神”，必须给出一条能落地的比赛证据。",
    pressureQuestion: "最后 5 秒落后 1 分，你到底要英雄球还是最优解？",
    chant: "凌晨四点派和历史得分王派，准备开庭。",
    groupChatPrompt: "我站{A}/{B}不是因为粉籍，是因为最后一攻的篮球哲学不一样。",
    tags: ["GOAT 法庭", "英雄球", "全能系统"],
  },
  "kobe-vs-jordan": {
    heat: "96 HEAT",
    headline: "原版杀手和终极门徒的镜像审判",
    court: "Fadeaway Mirror Room",
    stakes: "这不是谁更像谁，是继承者有没有资格挑战原型。",
    bannedPhrase: "不能只喊“乔丹六冠”或“科比技术更细”，必须解释时代防守和技术迁移。",
    pressureQuestion: "如果把两个人互换时代，谁的武器库更不怕版本更新？",
    chant: "后仰跳投没有版权，但神格需要证据。",
    groupChatPrompt: "{A}和{B}最难吵的不是荣誉，是同一套动作背后谁更接近完美。",
    tags: ["师徒镜像", "中距离", "杀手本能"],
  },
  "lebron-vs-jordan": {
    heat: "100 HEAT",
    headline: "完美履历对撞累计宇宙",
    court: "Legacy Tribunal",
    stakes: "这局决定你评历史地位时，是先看峰值还是先看长度。",
    bannedPhrase: "不能只丢“6-0”或“411工程”，要说清楚你用的历史第一标准。",
    pressureQuestion: "一整个职业生涯只选一个建队核心，你要无瑕峰值还是二十年不断电？",
    chant: "神话派和工程派别抢话筒，先定义标准。",
    groupChatPrompt: "{A}和{B}这题真正吵点是：历史第一到底是最完美，还是最不可替代。",
    tags: ["历史第一", "峰值长度", "标准之争"],
  },
  "magic-vs-bird": {
    heat: "91 HEAT",
    headline: "Showtime 和绿军宿命主线",
    court: "80s Derby Forum",
    stakes: "你选的不只是球员，是阵营、地域和篮球审美。",
    bannedPhrase: "不能只说“传球大师”或“白人射手”，要讲他们怎么改写联盟叙事。",
    pressureQuestion: "如果没有对方，谁的传奇会缩水更多？",
    chant: "黑白双雄一开庭，现代 NBA 的开场哨才响。",
    groupChatPrompt: "{A}和{B}不是单挑题，是联盟如何被双主角救活的题。",
    tags: ["宿命主线", "阵营感", "联盟叙事"],
  },
  "curry-vs-durant": {
    heat: "94 HEAT",
    headline: "体系引力和死神单挑的王朝归因",
    court: "Warriors Civil Court",
    stakes: "这局输了，勇士王朝叙事的主语就要换人。",
    bannedPhrase: "不能只说“老大冠军”或“投敌”，必须解释体系、空间和季后赛硬解。",
    pressureQuestion: "一支争冠队只能保留一个，你保留体系发动机还是无差别终结点？",
    chant: "挡拆上线和肘区单挑，谁才是王朝底层代码？",
    groupChatPrompt: "{A}和{B}的核心争议是：篮球更需要改变防守，还是惩罚所有防守。",
    tags: ["王朝归因", "体系引力", "硬解"],
  },
  "shaq-vs-yao": {
    heat: "88 HEAT",
    headline: "巨兽物理课撞上移动长城",
    court: "Paint Battle Dome",
    stakes: "禁区里没有抽象话术，只有吨位、脚步和犯规麻烦。",
    bannedPhrase: "不能只说“巅峰无解”或“中国情怀”，要讲真实对位和时代环境。",
    pressureQuestion: "传统中锋的终极答案，是碾压篮筐还是改变全球篮球想象？",
    chant: "低位要球，裁判退后，禁区开始地震。",
    groupChatPrompt: "{A}和{B}这题别空谈，先回答谁能让对面教练最早叫暂停。",
    tags: ["中锋肉搏", "全球影响", "禁区统治"],
  },
  "duncan-vs-garnett": {
    heat: "90 HEAT",
    headline: "基本功秩序对抗情绪燃烧",
    court: "Power Forward Hall",
    stakes: "这局决定你心中的大前锋模板：安静赢球还是燃烧全场。",
    bannedPhrase: "不能只说“体系加成”或“队友太差”，必须讲攻防职责和季后赛可复制性。",
    pressureQuestion: "如果你是 GM，要一支球队的地基，选稳定答案还是全能火山？",
    chant: "一个不说话，一个不闭嘴，但都能把比赛拖进泥地。",
    groupChatPrompt: "{A}和{B}最狠的点是：一个证明安静也能统治，一个证明失败也能伟大。",
    tags: ["大前锋正统", "防守地基", "气质冲突"],
  },
  "ai-vs-tmac": {
    heat: "86 HEAT",
    headline: "无冠天才的青春遗憾局",
    court: "What-if Arena",
    stakes: "这不是冠军论，这是你愿不愿意为天赋和记忆投票。",
    bannedPhrase: "不能只说“没冠军”，必须解释观赏性、伤病、阵容和时代防守。",
    pressureQuestion: "如果只能保留一盘录像给新球迷，你给 01 费城还是 35 秒 13 分？",
    chant: "戒指缺席，但青春站上证人席。",
    groupChatPrompt: "{A}和{B}这题适合问：篮球记忆里，遗憾能不能算一种历史地位。",
    tags: ["无冠天才", "青春滤镜", "What-if"],
  },
};

const DEFAULT_PACK: MatchupMemeTemplate = {
  heat: "84 HEAT",
  headline: "{A}和{B}的民间开庭局",
  court: "Custom Matchup Court",
  stakes: "这局没有官方标准，只有你的篮球价值观会暴露。",
  bannedPhrase: "不能只报荣誉表，必须讲打法、时代和你真正愿意建队的理由。",
  pressureQuestion: "如果只能让一个人替你打一场生死局，你把球给谁？",
  chant: "自选对决没有标准答案，但群聊一定有输家。",
  groupChatPrompt: "{A} vs {B}，别先查排名，先说你愿意围绕谁建队。",
  tags: ["自选开庭", "建队核心", "价值观暴露"],
};

function fillTemplate(value: string, nameA: string, nameB: string): string {
  return value.replaceAll("{A}", nameA).replaceAll("{B}", nameB);
}

export function getMatchupMemePack(
  matchupId: string | null,
  nameA: string,
  nameB: string,
): MatchupMemePack {
  const template = matchupId ? FIXED_PACKS[matchupId] ?? DEFAULT_PACK : DEFAULT_PACK;

  return {
    heat: template.heat,
    headline: fillTemplate(template.headline, nameA, nameB),
    court: fillTemplate(template.court, nameA, nameB),
    stakes: fillTemplate(template.stakes, nameA, nameB),
    bannedPhrase: fillTemplate(template.bannedPhrase, nameA, nameB),
    pressureQuestion: fillTemplate(template.pressureQuestion, nameA, nameB),
    chant: fillTemplate(template.chant, nameA, nameB),
    groupChatPrompt: fillTemplate(template.groupChatPrompt, nameA, nameB),
    tags: template.tags,
  };
}
