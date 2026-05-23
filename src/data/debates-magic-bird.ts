import type { DebateSide } from "./debates";
type MagicBirdSide = "magic" | "bird";

export interface MagicBirdDebate {
  id: string;
  title: string;
  emoji: string;
  magic: DebateSide;
  bird: DebateSide;
}

export interface MagicBirdStatBomb {
  stat: string;
  source: string;
  side: MagicBirdSide;
}

// ──────────────────────────────────────────
// 8 Main Debates
// ──────────────────────────────────────────

export const magicBirdDebates: MagicBirdDebate[] = [
  {
    id: "goat-of-era",
    title: "80年代谁才是真GOAT",
    emoji: "🐐",
    magic: {
      claim: "Showtime湖人=80年代NBA的代名词。没有Magic就没有80年代的联盟复兴。",
      points: [
        "5冠+3FMVP+3MVP——80年代最全面的荣誉收割机，数据和戒指双杀",
        "新秀赛季总决赛G6顶替贾巴尔打中锋还拿42+15+7——历史第一新秀表演",
        "是Magic把NBA从地区体育变成全美现象——收视率翻倍、球迷文化全是他带的",
      ],
      punchline: "80年代的NBA叫Showtime。不叫Bird Time。",
    },
    bird: {
      claim: "Bird来之前凯尔特人26胜。Bird来之后61胜。一个人拯救了一支球队和整个联盟。",
      points: [
        "3连MVP（84-86）——NBA历史上只有拉塞尔做到过连续3年MVP，Bird是第二个",
        "新秀赛季直接把凯尔特人从26胜拉到61胜——+35胜是NBA史上最恐怖的个人提升",
        "Bird的到来让NBC的收视率起死回生——先有Bird救市，后有Magic加入对决",
      ],
      punchline: "3连MVP。NBA历史只有两个人做到。Magic不是其中之一。",
    },
  },
  {
    id: "rings",
    title: "冠军戒指",
    emoji: "💍",
    magic: {
      claim: "5冠3FMVP。80年代总冠军最多的球员，没有之一。",
      points: [
        "5个冠军，9次打进总决赛——80年代总决赛就是Magic的主场",
        "3个FMVP证明他是3次无可争议的核心——Bird只有2个FMVP",
        "最后一冠1988年背靠背夺冠——80年代唯一完成连冠的人",
      ],
      punchline: "5比3。FMVP 3比2。这数学不需要PhD吧？",
    },
    bird: {
      claim: "Bird的3冠含金量更高——每次都是死磕到最后的真刀真枪。",
      points: [
        "1986年那支凯尔特人被公认为NBA历史最强球队——Bird是核心中的核心",
        "3冠都是硬碰硬杀出来的——不像Magic有贾巴尔、沃西全明星阵容保底",
        "1984年总决赛从1-3落后到翻盘——那个年代没有人做过，这叫冠军底色",
      ],
      punchline: "冠军不是比谁多。是比谁硬。Bird的冠军每个都带血。",
    },
  },
  {
    id: "rivalry",
    title: "世纪对决",
    emoji: "⚔️",
    magic: {
      claim: "总决赛交手3次，Magic赢了2次。对决战绩说明一切。",
      points: [
        "1985、1987两次总决赛击败Bird的凯尔特人——大场面上Magic就是Bird的克星",
        "1987总决赛baby sky hook绝杀——历史最经典的总决赛画面之一，对手就是Bird",
        "Magic在对决中的总决赛战绩2-1——赢的永远是最终的王者",
      ],
      punchline: "世纪对决？对决完了还是我赢得多。",
    },
    bird: {
      claim: "1984年总决赛Bird从2-3落后G6G7连赢——在Magic面前打出了系列赛最伟大的逆转。",
      points: [
        "1984总决赛Bird场均27+14——统治力在Magic面前碾压，G7在波士顿花园封神",
        "Bird让Magic在84总决赛G7只拿16分——把Showtime变成了No-time",
        "Bird是唯一一个在总决赛里让Magic怀疑自己的人——Magic自己都说过",
      ],
      punchline: "Magic赢了2次系列赛。但整个80年代最伟大的一轮总决赛是Bird赢的那次。",
    },
  },
  {
    id: "versatility",
    title: "全能性",
    emoji: "🎯",
    magic: {
      claim: "2米06的控卫，打过1-5号位全部位置——NBA历史独一份。",
      points: [
        "新秀年总决赛G6客串中锋拿42+15+7——人类历史上没有第二个控卫能这么做",
        "场均triple-double级别的全面数据——11.2助攻+19.5分+7.2篮板，控卫届巅峰",
        "1号位身高打5号位的事情，后来没有任何人复制成功过",
      ],
      punchline: "1-5号位全能打的控卫。Bird？锋线就是锋线。",
    },
    bird: {
      claim: "Bird才是真正的全能——得分、传球、篮板、防守、领袖，全是顶级。",
      points: [
        "场均24.3+10+6.3——前锋能做到这种传球数据的只有Bird和詹姆斯",
        "不粘球、不占球权就能统治比赛——Bird的无球和有球一样恐怖",
        "攻防两端都是精英——Magic的防守你敢提吗？Bird至少是正资产",
      ],
      punchline: "Magic全能？防守那一端全能吗？别选择性失明。",
    },
  },
  {
    id: "clutch",
    title: "关键球 & 大心脏",
    emoji: "🗡️",
    magic: {
      claim: "总决赛9次出场，每次都在最关键的时刻兑现——大场面就是Magic的舞台。",
      points: [
        "1987总决赛G4 Magic的baby sky hook绝杀——NBA历史top 5名场面",
        "1980新秀年G6 42分15板7助——在总决赛最大的舞台上打出史诗级表现",
        "季后赛生涯场均19.5+12.3+7.7——越到大场面数据越夸张",
      ],
      punchline: "关键球看总决赛。总决赛看Magic。逻辑闭环。",
    },
    bird: {
      claim: "Larry Bird的关键球是带着垃圾话一起送的——不光进绝杀，还要提前告诉你。",
      points: [
        "1988东决G7 20分逆转——Bird那场第四节单手宰了活塞整支球队",
        "左手投篮日打全明星三分赛——提前跟对手说「你们争第二吧」然后真赢了",
        "Bird的绝杀从来不是安静的——进球前必须垃圾话，进球后必须瞪你",
      ],
      punchline: "Magic的关键球是赢球。Bird的关键球是赢球+侮辱你。",
    },
  },
  {
    id: "leadership",
    title: "领袖力",
    emoji: "👑",
    magic: {
      claim: "Showtime的灵魂。队友们说在Magic身边打球是职业生涯最快乐的事。",
      points: [
        "让沃西、库珀、斯科特这些角色球员都超水平发挥——体系化领导力的巅峰",
        "笑着打球、笑着赢球——队友为他拼命不是因为怕，是因为爱",
        "1991年HIV确诊后全联盟为他流泪——他的人格魅力超越了篮球本身",
      ],
      punchline: "让所有人变更好、让所有人更开心。这才是领袖。",
    },
    bird: {
      claim: "Bird的领袖力是用恐惧驱动的——队友怕他、对手怕他、裁判都怕他。",
      points: [
        "更衣室里Bird说什么没人敢反驳——他用表现赢得了绝对话语权",
        "凯尔特人的防守强度全靠Bird的态度带动——他不偷懒，别人就不敢偷懒",
        "Bird受伤了还要打——背伤折磨了他整个生涯后半段，但从不缺席关键比赛",
      ],
      punchline: "快乐篮球赢常规赛。杀手篮球赢总冠军。",
    },
  },
  {
    id: "entertainment",
    title: "观赏性 & 娱乐价值",
    emoji: "🎪",
    magic: {
      claim: "Showtime不是名字，是一种篮球哲学——快乐、华丽、不可复制。",
      points: [
        "不看人传球、no-look pass是Magic发明的标签——后来每个控卫都在模仿他",
        "Showtime快攻是NBA历史上最具观赏性的进攻体系——比赛就是表演",
        "Magic让篮球变成了娱乐产业——球迷来看球不是看比分，是看他变魔术",
      ],
      punchline: "NBA是Entertainment。Entertainment的代名词是Showtime。Showtime的代名词是Magic。",
    },
    bird: {
      claim: "Bird的娱乐价值在于他是全场最不该赢的人——然后每次都赢了。",
      points: [
        "白人、不能跑不能跳、慢半拍——但就是打爆所有人。这比华丽传球更娱乐",
        "垃圾话本身就是NBA最好的综艺——Bird是trash talk的乔丹",
        "左手三分赛的故事至今是NBA全明星赛最传奇的名场面——自信就是最大的娱乐",
      ],
      punchline: "华丽是一种娱乐。用最笨的方式打爆你是另一种——更爽的那种。",
    },
  },
  {
    id: "legacy",
    title: "历史遗产",
    emoji: "🏛️",
    magic: {
      claim: "Magic和Bird一起拯救了NBA——但Showtime的文化影响力比凯尔特人大10倍。",
      points: [
        "洛杉矶+好莱坞+Showtime=NBA商业化的起点——没有Magic就没有后来的乔丹时代",
        "控卫位置的定义被Magic永久改写——从纯助攻到全能控卫，后来的人都在走他的路",
        "HIV公开后推动了全美对AIDS的认知——他的影响力早就超出了篮球",
      ],
      punchline: "Magic拯救了NBA。然后NBA拯救了美国体育。传承就是这么算的。",
    },
    bird: {
      claim: "Bird证明了天赋可以被努力击败——这个故事比任何华丽传球都永恒。",
      points: [
        "蓝领出身、印第安纳小镇来的穷小子打到联盟第一人——这是美国梦本身",
        "Bird退役后当教练拿年度最佳教练、当GM当年度最佳管理层——全方位篮球天才",
        "「天赋vs努力」的永恒辩题——Bird是「努力」那一边最有力的证据",
      ],
      punchline: "Magic的遗产是一段录像。Bird的遗产是一种信仰：不够强就练到够强。",
    },
  },
];

// ──────────────────────────────────────────
// 2 Bonus "What If" Debates
// ──────────────────────────────────────────

export const magicBirdBonusDebates: MagicBirdDebate[] = [
  {
    id: "whatif-same-team",
    title: "🔮 如果Magic和Bird在同一支球队...",
    emoji: "🤝",
    magic: {
      claim: "Magic是控卫——他会让Bird变成史上最恐怖的定点射手。体系核心是Magic。",
      points: [
        "Magic的传球+Bird的投射=人类篮球进攻的天花板——每次no-look pass都是Bird的空位三分",
        "进攻由Magic组织、Bird终结——角色分工天然互补，不像两个锋线那样冲突",
        "Showtime体系+Bird的无球能力=快攻+阵地战全覆盖的完美进攻",
      ],
      punchline: "Magic是发动机，Bird是武器。发动机决定了车怎么跑。",
    },
    bird: {
      claim: "Bird的全面性决定了他才是建队核心——Magic围绕Bird打才是最优解。",
      points: [
        "Bird能投、能传、能抢板、能防——他一个人就覆盖了除控球外的所有需求",
        "Bird在低位的单打会让对手必须包夹——然后Magic的传球才有空间施展",
        "86凯尔特人被公认最强球队，核心是Bird不是DJ——证明Bird才是真正的建队基石",
      ],
      punchline: "核心是谁离了谁球队更惨。Magic没Bird能赢，Bird没Magic一样能赢。",
    },
  },
  {
    id: "whatif-modern-era",
    title: "🔮 如果他们打现代篮球...",
    emoji: "⏳",
    magic: {
      claim: "2米06的控卫+小球时代=无限可能——Magic就是为现代篮球设计的模板。",
      points: [
        "现代篮球追求的position-less basketball就是Magic的打法——他80年代就在做2020年的事",
        "Magic+三分线外的空间=Showtime快攻无限升级版——想象一下配4个射手的Magic",
        "没有hand check的时代，Magic的突破和传球会更加无解——他的助攻数要上15+",
      ],
      punchline: "现代篮球就是Magic篮球。他只是早生了40年。",
    },
    bird: {
      claim: "Bird在三分时代？场均8个三分出手，命中率40%+——这就是白人版库里。",
      points: [
        "Bird的三分在80年代就是37.6%——给他现代训练和更多出手？稳定40%+",
        "Bird的传球视野+现代挡拆体系=每场15+助攻的组织前锋——约基奇的原型就是Bird",
        "现代联盟不允许身体对抗——Bird在80年代的伤病问题不会那么严重",
      ],
      punchline: "Bird就是80年代的约基奇+库里合体。你告诉我这不恐怖？",
    },
  },
];

// ──────────────────────────────────────────
// Stat Bombs
// ──────────────────────────────────────────

export const magicBirdStatBombs: Record<string, MagicBirdStatBomb[]> = {
  "goat-of-era": [
    { stat: "Bird是NBA历史上唯一连续3年拿MVP的非中锋球员（84-86）。", source: "NBA官方记录", side: "bird" },
    { stat: "Magic的9次总决赛出场是NBA历史上除比尔·拉塞尔外最多的。", source: "Basketball Reference", side: "magic" },
  ],
  rings: [
    { stat: "Magic的5冠中有3次FMVP（1980、1982、1987）——Bird只有2次（1984、1986）。", source: "NBA官方记录", side: "magic" },
    { stat: "1986凯尔特人67胜15负被ESPN评为NBA史上最强球队——Bird是核心。", source: "ESPN历史排名", side: "bird" },
  ],
  rivalry: [
    { stat: "Magic vs Bird总决赛交手3次，Magic 2-1领先——但Bird在1984系列赛场均27+14。", source: "Basketball Reference", side: "bird" },
    { stat: "1979年NCAA决赛Magic vs Bird是美国体育转播史上收视率最高的大学篮球比赛。", source: "NCAA记录", side: "magic" },
  ],
  versatility: [
    { stat: "Magic生涯场均11.2次助攻——NBA历史第一。同时场均7.2个篮板——控卫位置史无前例。", source: "Basketball Reference", side: "magic" },
    { stat: "Bird是NBA历史上唯一一个场均20+10+6且罚球命中率88%+的球员。", source: "Basketball Reference", side: "bird" },
  ],
  clutch: [
    { stat: "Magic在1987年总决赛G4投中baby sky hook绝杀——被评为80年代最伟大的一球。", source: "NBA 50周年评选", side: "magic" },
    { stat: "Bird在1985-86赛季第四节场均得分联盟第一——关键时刻的Bird是另一个物种。", source: "Basketball Reference", side: "bird" },
  ],
  leadership: [
    { stat: "Magic时代的湖人更衣室满意度NBA最高——队友们称他为「最快乐的领袖」。", source: "球员采访合集", side: "magic" },
    { stat: "Bird的凯尔特人在他加入后第一年就从26胜变61胜——+35胜是NBA史上最大单人提升。", source: "NBA战绩记录", side: "bird" },
  ],
  entertainment: [
    { stat: "Showtime湖人的场均得分在80年代领跑全联盟——最高赛季场均115.6分。", source: "Basketball Reference", side: "magic" },
    { stat: "Bird在1986全明星三分赛走进更衣室问：「你们谁争第二？」然后夺冠。", source: "NBA全明星赛记录", side: "bird" },
  ],
  legacy: [
    { stat: "Magic公开HIV阳性后推动了全美AIDS认知——被TIME评为80年代最具影响力的体育人物。", source: "TIME杂志", side: "magic" },
    { stat: "Bird退役后当步行者教练拿年度最佳教练、当GM拿年度最佳管理层——三栖全能历史唯一。", source: "NBA管理层记录", side: "bird" },
  ],
  "whatif-same-team": [
    { stat: "1992梦之队Magic和Bird首次同队——教练组称那是「训练赛最无解的2人组合」。", source: "Dream Team纪录片", side: "magic" },
    { stat: "Bird在86凯尔特人体系中+/-值全队最高——任何体系的核心都该是Bird。", source: "Basketball Reference", side: "bird" },
  ],
  "whatif-modern-era": [
    { stat: "Magic的身材（206cm控卫）在80年代独一无二——现代联盟有更多类似模板（西蒙斯、东契奇）。", source: "NBA体测数据", side: "bird" },
    { stat: "Bird的三分命中率37.6%在80年代三分线更远、出手更少的背景下极为恐怖。", source: "Basketball Reference", side: "bird" },
  ],
};
