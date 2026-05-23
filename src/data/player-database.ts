// ─────────────────────────────────────────────────────────────
// Player Database — 30 NBA Legends for Custom Matchup System
// ─────────────────────────────────────────────────────────────
// Each entry has structured data for universal debate generation.
// Stats are career averages / career totals (well-known values).
// All descriptive content in Chinese; code/comments in English.

export interface PlayerStats {
  ppg: number;
  rpg: number;
  apg: number;
  rings: number;
  mvps: number;
  fmvps: number;
  allStar: number;
  allNBA: number;
  dpoy: number;
  scoringTitles: number;
}

export interface Player {
  id: string;
  name: string;
  nameCN: string;
  number: string;
  nickname: string;
  nicknameCN: string;
  color: string;
  era: string;
  position: string;
  stats: PlayerStats;
  achievements: string[];
  style: string;
  strengths: string[];
  controversies: string[];
  quote: string;
  philosophicalAngle: string;
}

// ─────────────────────────────────────────────────────────────
// The 30 Legends
// ─────────────────────────────────────────────────────────────

export const players: Player[] = [
  // ── 1. Michael Jordan ──
  {
    id: "jordan",
    name: "Michael Jordan",
    nameCN: "迈克尔·乔丹",
    number: "#23",
    nickname: "His Airness",
    nicknameCN: "飞人",
    color: "jordan-red",
    era: "1980s-1990s",
    position: "SG",
    stats: { ppg: 30.1, rpg: 6.2, apg: 5.3, rings: 6, mvps: 5, fmvps: 6, allStar: 14, allNBA: 11, dpoy: 1, scoringTitles: 10 },
    achievements: [
      "6次总冠军6次FMVP，从未打过抢七",
      "10次得分王，历史最高场均30.1分",
      "1988年同时获得MVP+DPOY+得分王+全明星MVP",
      "两个三连冠王朝，中间还退役打了棒球",
      "大学绝杀夺冠，季后赛场均33.4分历史第一",
      "5次常规赛MVP，3次全明星MVP",
    ],
    style: "中距离之神，后仰跳投教科书，攻防两端统治力无与伦比。拥有篮球史上最完美的脚步和最冷酷的杀手本能。",
    strengths: [
      "杀手本能——关键时刻从不手软，季后赛场均33.4分",
      "中距离跳投——后仰、急停、转身，每一种都是标准教学",
      "防守端统治力——1次DPOY+9次防守一阵，攻防一体",
      "意志力——用垃圾话摧毁对手心理，再用表现钉死棺材",
    ],
    controversies: [
      "赌博成瘾、第一次退役疑云重重",
      "队友心理虐待——打哭科尔、逼走格兰特",
      "时代红利——90年代扩军稀释人才，东部弱旅遍地",
    ],
    quote: "我职业生涯投丢了9000多个球，输了近300场比赛。有26次我被信任投出制胜球但没投中。我一次又一次地失败。这就是我成功的原因。",
    philosophicalAngle: "完美主义杀手——篮球是战争，赢是唯一目标，用恐惧统治对手",
  },

  // ── 2. LeBron James ──
  {
    id: "lebron",
    name: "LeBron James",
    nameCN: "勒布朗·詹姆斯",
    number: "#23",
    nickname: "King James",
    nicknameCN: "皇帝",
    color: "lebron-gold",
    era: "2000s-2020s",
    position: "SF",
    stats: { ppg: 27.1, rpg: 7.5, apg: 7.3, rings: 4, mvps: 4, fmvps: 4, allStar: 20, allNBA: 20, dpoy: 0, scoringTitles: 1 },
    achievements: [
      "历史总得分王——40000+分，超越贾巴尔",
      "唯一40000分+11000助攻+11000篮板的球员",
      "4冠4FMVP，3支不同球队夺冠",
      "20次全明星+20次最佳阵容，22年不断电",
      "2016年1-3翻盘73胜勇士，NBA史上最伟大的冠军",
      "I Promise School改变阿克伦教育生态",
    ],
    style: "全能坦克型巨星，1-5号位全能打，控卫视野+中锋身体+后卫得分。一个人就是一支球队的建队核心。",
    strengths: [
      "全能——场均27+7+7，历史唯一一人做到",
      "篮球智商——全场视野顶级，带队能力历史最强",
      "身体天赋——6尺9/250磅却有后卫速度和耐久度",
      "长寿——22年巅峰级输出，40岁仍是全明星",
      "建队核心——到哪支球队都能立刻变成争冠球队",
    ],
    controversies: [
      "抱团文化开创者——Decision之夜全国直播换队",
      "4支球队夺冠，忠诚度存疑",
      "2011年总决赛第四节隐身，被达拉斯逆转",
    ],
    quote: "我不是来这里交朋友的。我是来这里赢球的。但如果赢球的过程中交到了朋友，那更好。",
    philosophicalAngle: "全能霸主——篮球是系统工程，一个人就是一支球队",
  },

  // ── 3. Kobe Bryant ──
  {
    id: "kobe",
    name: "Kobe Bryant",
    nameCN: "科比·布莱恩特",
    number: "#24",
    nickname: "Black Mamba",
    nicknameCN: "黑曼巴",
    color: "kobe-gold",
    era: "1990s-2010s",
    position: "SG",
    stats: { ppg: 25.0, rpg: 5.2, apg: 4.7, rings: 5, mvps: 1, fmvps: 2, allStar: 18, allNBA: 15, dpoy: 0, scoringTitles: 2 },
    achievements: [
      "5次总冠军——3连冠+2连冠两个王朝周期",
      "单场81分——现代篮球单场得分纪录",
      "退役战60分，最后一场还在绝杀",
      "12次最佳阵容一阵+9次防守一阵",
      "06年场均35.4分，21世纪最变态得分赛季",
      "曼巴精神成为跨越篮球的全球文化现象",
      "20年紫金一人一城，湖人历史最伟大球员之一",
    ],
    style: "武器库最全面的得分手，后仰跳投、梦幻脚步、蛇形突破、低位转身——12种以上得分方式，每种都是教学片级别。",
    strengths: [
      "得分技术——12种以上武器，后仰跳投教科书",
      "杀手本能——关键时刻永远要球，绝杀数历史前五",
      "意志力——跟腱断裂罚完球才走，凌晨4点的球馆",
      "攻防两端——9次防守一阵，后卫位置历史级",
    ],
    controversies: [
      "前3冠是给鲨鱼打工——FMVP都是奥尼尔的",
      "07年逼宫要求交易，一人一城叙事有裂缝",
      "效率偏低——职业生涯真实命中率54.1%",
    ],
    quote: "英雄之所以是英雄，不是因为他们赢了。是因为他们从来不怕输。",
    philosophicalAngle: "曼巴精神——篮球是修行，永远选Hard Mode，技术和意志力的极致追求",
  },

  // ── 4. Shaquille O'Neal ──
  {
    id: "shaq",
    name: "Shaquille O'Neal",
    nameCN: "沙奎尔·奥尼尔",
    number: "#34",
    nickname: "The Diesel",
    nicknameCN: "大鲨鱼",
    color: "shaq-purple",
    era: "1990s-2000s",
    position: "C",
    stats: { ppg: 23.7, rpg: 10.9, apg: 2.5, rings: 4, mvps: 1, fmvps: 3, allStar: 15, allNBA: 14, dpoy: 0, scoringTitles: 2 },
    achievements: [
      "湖人三连冠绝对核心——3连FMVP",
      "2000年季后赛场均30.7分15.4板，史上最统治的季后赛",
      "巅峰期场均30+14，联盟无人可挡",
      "4次总冠军，跨湖人和热火两个王朝",
      "8次最佳阵容一阵，巅峰统治力无与伦比",
      "NBA75大巨星+50大巨星双入选",
    ],
    style: "物理碾压型中锋，巅峰期是篮球史上最无解的进攻武器。不靠技术不靠投篮，纯粹的力量和体型统治篮下。",
    strengths: [
      "物理天赋——7尺1/325磅，篮下终结无法防守",
      "巅峰统治力——00-02年季后赛统治力历史顶级",
      "FMVP——3连FMVP证明他才是湖人王朝老大",
      "场上威慑——砍鲨战术就是对他统治力的最高致敬",
    ],
    controversies: [
      "懒散——体重管理差，夏天不训练，靠天赋吃饭",
      "罚球灾难——职业生涯罚球命中率52.7%",
      "与科比内讧导致湖人王朝提前崩塌",
    ],
    quote: "我不是来适应你们的联盟的。你们的联盟要来适应我。",
    philosophicalAngle: "天赋碾压——当上帝给你地球上最好的身体，篮球就是物理课",
  },

  // ── 5. Hakeem Olajuwon ──
  {
    id: "hakeem",
    name: "Hakeem Olajuwon",
    nameCN: "哈基姆·奥拉朱旺",
    number: "#34",
    nickname: "The Dream",
    nicknameCN: "大梦",
    color: "hakeem-red",
    era: "1980s-1990s",
    position: "C",
    stats: { ppg: 21.8, rpg: 11.1, apg: 2.5, rings: 2, mvps: 1, fmvps: 2, allStar: 12, allNBA: 12, dpoy: 2, scoringTitles: 0 },
    achievements: [
      "1994年单赛季MVP+DPOY+FMVP+总冠军，史上唯一",
      "2次总冠军——趁乔丹退役？不，是实力碾压全联盟",
      "历史盖帽王——3830次封盖遥遥领先",
      "梦幻脚步——篮球史上最华丽的低位技术",
      "2次DPOY，攻防两端的完美中锋",
      "连续淘汰四大中锋夺冠（大猩猩、巴克利、尤因、鲨鱼）",
    ],
    style: "梦幻脚步之王，低位转身、假动作、勾手——中锋里技术最华丽的存在。攻防两端都是历史级统治力。",
    strengths: [
      "梦幻脚步——低位技术篮球史上最华丽",
      "攻防一体——2次DPOY+场均21.8分，完美中锋模板",
      "盖帽——历史盖帽王，护框能力无人能及",
      "季后赛大心脏——94年一路淘汰四大中锋夺冠",
    ],
    controversies: [
      "趁乔丹退役偷冠——两个冠军含金量被质疑",
      "只拿了2冠，火箭王朝未能延续",
      "晚年在猛龙的结局不体面",
    ],
    quote: "脚步是一切的基础。当你的脚知道该去哪里，你的手自然知道该做什么。",
    philosophicalAngle: "优雅技术——篮球是舞蹈，低位是艺术，用脚步把对手晃晕",
  },

  // ── 6. Tim Duncan ──
  {
    id: "duncan",
    name: "Tim Duncan",
    nameCN: "蒂姆·邓肯",
    number: "#21",
    nickname: "The Big Fundamental",
    nicknameCN: "石佛",
    color: "duncan-silver",
    era: "1990s-2010s",
    position: "PF/C",
    stats: { ppg: 19.0, rpg: 10.8, apg: 3.0, rings: 5, mvps: 2, fmvps: 3, allStar: 15, allNBA: 15, dpoy: 0, scoringTitles: 0 },
    achievements: [
      "5次总冠军横跨3个十年——唯一做到的球员",
      "历史唯一一个新秀赛季就以核心身份夺冠的大前锋",
      "3次FMVP，2次MVP",
      "15次最佳阵容+15次防守阵容",
      "马刺19年不间断50胜，团队篮球的基石",
      "NBA75大巨星，历史最伟大大前锋",
    ],
    style: "基本功教科书，45度打板跳投、低位背身、挡拆掩护——没有任何花哨动作，每一球都是最正确的选择。",
    strengths: [
      "基本功——擦板跳投、低位背身，教科书级别",
      "稳定性——19年如一日的输出，从不大起大落",
      "防守——内线防守支柱，改变对手投篮决策",
      "团队领袖——安静地赢，让队友变得更好",
      "大赛球员——季后赛表现从不缩水",
    ],
    controversies: [
      "太无聊——打法枯燥，没有观赏性",
      "1号签运气——马刺摆烂摆出来的历史级选秀",
      "波波维奇体系加成——离开体系能否同样伟大？",
    ],
    quote: "好的，好的。（Good, good.）",
    philosophicalAngle: "基本功至上——篮球不需要华丽，正确的选择重复一万次就是伟大",
  },

  // ── 7. Kevin Garnett ──
  {
    id: "garnett",
    name: "Kevin Garnett",
    nameCN: "凯文·加内特",
    number: "#21",
    nickname: "The Big Ticket",
    nicknameCN: "狼王",
    color: "garnett-green",
    era: "1990s-2010s",
    position: "PF",
    stats: { ppg: 17.8, rpg: 10.0, apg: 3.7, rings: 1, mvps: 1, fmvps: 0, allStar: 15, allNBA: 9, dpoy: 1, scoringTitles: 0 },
    achievements: [
      "2004年MVP——场均24.2+13.9+5.0，全面数据历史级",
      "2008年凯尔特人夺冠核心，防守端灵魂",
      "1次DPOY，12次防守阵容",
      "高中生直接进NBA的先驱之一",
      "15次全明星，攻防两端全能大前锋",
      "森林狼忠诚12年，独自扛队从未离开",
    ],
    style: "全能型大前锋，能投能防能传，防守端指挥全队的战术核心。激情四射，垃圾话之王，用情绪感染整支球队。",
    strengths: [
      "全能——大前锋打出控卫级助攻和中锋级篮板",
      "防守——改变整支球队防守体系的核心",
      "激情——用怒吼和垃圾话点燃全队士气",
      "忠诚——森林狼12年不离不弃",
    ],
    controversies: [
      "只有1个冠军——巅峰在森林狼浪费",
      "08年夺冠是三巨头抱团——跟皮尔斯雷阿伦组队才赢",
      "打法脏——肘击、垃圾话、故意挑衅",
    ],
    quote: "Anything is possible!!!（一切皆有可能!!!）",
    philosophicalAngle: "战斗意志——篮球是战争，用热血和嘶吼燃烧每一秒",
  },

  // ── 8. Magic Johnson ──
  {
    id: "magic",
    name: "Magic Johnson",
    nameCN: "埃尔文·约翰逊",
    number: "#32",
    nickname: "Magic",
    nicknameCN: "魔术师",
    color: "magic-purple",
    era: "1980s",
    position: "PG",
    stats: { ppg: 19.5, rpg: 7.2, apg: 11.2, rings: 5, mvps: 3, fmvps: 3, allStar: 12, allNBA: 10, dpoy: 0, scoringTitles: 0 },
    achievements: [
      "5次总冠军3次FMVP——新秀赛季就以中锋身份夺FMVP",
      "3次MVP，场均11.2助攻历史级",
      "Showtime湖人灵魂——定义了80年代篮球",
      "新秀赛季总决赛G6顶替贾巴尔打中锋拿42+15+7",
      "身高2米06的控卫——重新定义了控卫这个位置",
      "与大鸟的宿命对决拯救了NBA收视率",
    ],
    style: "6尺9的控卫，传球魔术师，Showtime快攻的发动机。看他打球就像看一场精心编排的表演，每一个传球都是艺术品。",
    strengths: [
      "传球视野——不看人传球之王，场均11.2助攻",
      "身体错位——6尺9打控卫，任何防守者都是错位",
      "关键先生——3次FMVP，大场面从不怯场",
      "领导力——让队友变得更好的极致体现",
    ],
    controversies: [
      "HIV事件导致职业生涯被迫缩短",
      "依赖贾巴尔和名人堂级别队友",
      "防守端存在明显短板",
    ],
    quote: "当我需要自己得分的时候我能得分。但我更喜欢把球传给队友看他们得分时脸上的笑容。",
    philosophicalAngle: "传球是最高艺术——篮球是五个人的游戏，最好的得分是助攻",
  },

  // ── 9. Larry Bird ──
  {
    id: "bird",
    name: "Larry Bird",
    nameCN: "拉里·伯德",
    number: "#33",
    nickname: "Larry Legend",
    nicknameCN: "大鸟",
    color: "bird-green",
    era: "1980s",
    position: "SF",
    stats: { ppg: 24.3, rpg: 10.0, apg: 6.3, rings: 3, mvps: 3, fmvps: 2, allStar: 12, allNBA: 10, dpoy: 0, scoringTitles: 0 },
    achievements: [
      "3次MVP连庄（1984-86），历史仅3人做到",
      "3次总冠军2次FMVP",
      "连续三年三分大赛冠军——穿着外套热身就宣布要赢",
      "12次全明星，攻防全能的小前锋",
      "与魔术师的对决拯救了80年代NBA",
      "NBA50大+75大巨星",
    ],
    style: "篮球智商天花板，投篮精准如机器，传球华丽如魔术师。身体素质不出众，全靠脑子和手感统治联盟。",
    strengths: [
      "投篮——中远距离无死角，三分大赛三连冠",
      "篮球智商——预判对手行动、创造空位的能力历史顶级",
      "垃圾话——赛前告诉你怎么打你，然后真的做到",
      "全面性——场均24+10+6，小前锋里的全能战士",
    ],
    controversies: [
      "身体素质差——纯靠技术和智商，没有运动天赋优势",
      "背伤缩短巅峰——如果健康能拿更多冠军",
      "时代局限——80年代竞争强度争议",
    ],
    quote: "我上场之前就已经告诉你我要怎么打你了。然后我就那么打了。你还是防不住。",
    philosophicalAngle: "智商碾压——篮球是脑力运动，我比你聪明就比你强",
  },

  // ── 10. Stephen Curry ──
  {
    id: "curry",
    name: "Stephen Curry",
    nameCN: "斯蒂芬·库里",
    number: "#30",
    nickname: "Chef Curry",
    nicknameCN: "萌神",
    color: "curry-blue",
    era: "2010s-2020s",
    position: "PG",
    stats: { ppg: 24.3, rpg: 4.7, apg: 6.4, rings: 4, mvps: 2, fmvps: 1, allStar: 10, allNBA: 10, dpoy: 0, scoringTitles: 2 },
    achievements: [
      "改变了篮球运动本身——三分革命的发起者",
      "4次总冠军，2022年终于拿到FMVP",
      "史上唯一全票MVP（2016赛季）",
      "73胜赛季的核心——NBA单赛季最佳战绩",
      "三分总数历史第一——彻底重写纪录簿",
      "引力值常年联盟第一，站半场就能拉开空间",
    ],
    style: "三分革命之王，无球跑动+体系核心。把三分线从辅助武器变成了主战场，一个人改变了整个联盟的战术体系。",
    strengths: [
      "三分——历史最伟大射手，改变篮球的人",
      "引力——站在logo区就能创造队友空位",
      "控球——眼花缭乱的运球让防守者失去重心",
      "无球跑动——绕掩护跑位艺术的巅峰",
    ],
    controversies: [
      "2016年总决赛3-1领先被翻盘",
      "身体对抗差——季后赛被锁防是常态",
      "前3冠没有FMVP——杜兰特拿走了那两个",
    ],
    quote: "我能做到任何人都说我做不到的事。",
    philosophicalAngle: "革命者——篮球需要被颠覆，用三分线重新定义比赛的距离",
  },

  // ── 11. Kevin Durant ──
  {
    id: "durant",
    name: "Kevin Durant",
    nameCN: "凯文·杜兰特",
    number: "#35",
    nickname: "Slim Reaper",
    nicknameCN: "死神",
    color: "durant-blue",
    era: "2010s-2020s",
    position: "SF/PF",
    stats: { ppg: 27.3, rpg: 7.1, apg: 4.3, rings: 2, mvps: 1, fmvps: 2, allStar: 14, allNBA: 10, dpoy: 0, scoringTitles: 4 },
    achievements: [
      "7尺长人拥有后卫级别的投篮手感",
      "2次总冠军2次FMVP，总决赛从未输过",
      "4次得分王，场均27.3分",
      "2014年MVP赛季场均32分——「你不是好人」演讲封神",
      "14次全明星，得分能力历史前五级别",
      "跟腱断裂后复出依然是联盟顶级得分手",
    ],
    style: "7尺身高+后卫手感+中距离精准=无法防守的得分机器。不需要体系不需要挡拆，拔起来就投是他的终极武器。",
    strengths: [
      "得分——7尺身高无死角出手，中距离历史级",
      "效率——真实命中率长期60%+，越困难越准",
      "多面手——能投能突能传，攻防全面",
      "大赛球员——总决赛2战2冠2FMVP",
    ],
    controversies: [
      "加入73胜勇士——史上最软弱的巨星选择",
      "2冠含金量被质疑——没有杜兰特勇士照样夺冠",
      "跳队频繁——雷霆、勇士、篮网、太阳，没有忠诚度",
    ],
    quote: "你不是好人，你是MVP。（You the real MVP, mom.）",
    philosophicalAngle: "纯粹得分——篮球最终是把球放进篮筐，我是历史上最无解的得分方式",
  },

  // ── 12. Allen Iverson ──
  {
    id: "iverson",
    name: "Allen Iverson",
    nameCN: "阿伦·艾弗森",
    number: "#3",
    nickname: "The Answer",
    nicknameCN: "答案",
    color: "iverson-blue",
    era: "1990s-2000s",
    position: "SG/PG",
    stats: { ppg: 26.7, rpg: 3.7, apg: 6.2, rings: 0, mvps: 1, fmvps: 0, allStar: 11, allNBA: 7, dpoy: 0, scoringTitles: 4 },
    achievements: [
      "身高6尺——以最矮体型杀入历史级得分手行列",
      "2001年独扛76人杀入总决赛，G1击败OK组合",
      "4次得分王，3次抢断王",
      "2001年MVP——场均31.1分6.0助攻",
      "Crossover成为篮球文化标志——晃倒乔丹那一幕永恒",
      "改变了NBA着装文化和嘻哈文化",
    ],
    style: "以小博大的极致代表，1米83的身体扛着整支球队前进。crossover是他的注册商标，每次突破都像在刀尖上跳舞。",
    strengths: [
      "速度+变向——crossover晃飞所有人，包括乔丹",
      "得分爆发力——4次得分王，6尺身高的得分机器",
      "战斗精神——从不怕任何人，身体越小心越大",
      "文化影响——改变了NBA的穿着和态度",
    ],
    controversies: [
      "0冠——一辈子没拿到戒指",
      "训练态度——「We're talking about practice?」",
      "效率低——投篮命中率42.5%，铁王之王",
    ],
    quote: "我们在说训练？不是比赛？训练？（We talking about practice?）",
    philosophicalAngle: "以小博大——篮球不看身高体重，看的是你有多大的心脏",
  },

  // ── 13. Tracy McGrady ──
  {
    id: "tmac",
    name: "Tracy McGrady",
    nameCN: "特雷西·麦克格雷迪",
    number: "#1",
    nickname: "T-Mac",
    nicknameCN: "麦迪",
    color: "tmac-blue",
    era: "2000s",
    position: "SG/SF",
    stats: { ppg: 19.6, rpg: 5.6, apg: 4.4, rings: 0, mvps: 0, fmvps: 0, allStar: 7, allNBA: 7, dpoy: 0, scoringTitles: 2 },
    achievements: [
      "35秒13分——NBA史上最不可思议的单节逆转",
      "2次得分王——巅峰期场均32.1分",
      "7次全明星，巅峰期得分能力历史级",
      "03年场均32.1+6.5+5.5，攻防全能",
      "高中生直接进NBA，天赋异禀",
      "入选篮球名人堂",
    ],
    style: "天赋型得分手，打球行云流水毫不费力。干拔跳投、后仰三分、梦幻转身——打球的美感可能是所有球员里最高的。",
    strengths: [
      "天赋——打球毫不费力，最优雅的得分方式",
      "巅峰爆发——32.1分的赛季得分王",
      "全面性——6尺8打后卫，能投能突能传",
      "35秒13分——单一时刻的统治力历史最佳",
    ],
    controversies: [
      "0冠0MVP——季后赛首轮从未突破",
      "伤病毁了巅峰——膝盖和背伤让他过早衰退",
      "巅峰期太短——真正顶级只有3-4年",
    ],
    quote: "35秒能发生什么？能发生改变历史的事。",
    philosophicalAngle: "天赋无敌——篮球是天才的游戏，巅峰麦迪就是上帝在打球",
  },

  // ── 14. Yao Ming ──
  {
    id: "yao",
    name: "Yao Ming",
    nameCN: "姚明",
    number: "#11",
    nickname: "The Great Wall",
    nicknameCN: "移动长城",
    color: "yao-red",
    era: "2000s",
    position: "C",
    stats: { ppg: 19.0, rpg: 9.2, apg: 1.6, rings: 0, mvps: 0, fmvps: 0, allStar: 8, allNBA: 5, dpoy: 0, scoringTitles: 0 },
    achievements: [
      "NBA状元——中国篮球历史第一人",
      "8次全明星首发——票王中的票王",
      "巅峰期场均25+9.4，真正的内线统治者",
      "入选篮球名人堂——亚洲球员第一人",
      "为NBA打开中国市场立下不世之功",
      "07-08赛季带火箭22连胜",
    ],
    style: "2米29的技术型中锋，拥有出色的中距离投篮和低位脚步。不是纯靠身高的笨重中锋，而是有细腻手感的全面内线。",
    strengths: [
      "身高优势——2米29的绝对高度统治篮下",
      "技术——中距离投篮柔和，低位脚步出色",
      "文化影响——为NBA打开13亿人口的市场",
      "篮球智商——传球意识好，团队配合出色",
    ],
    controversies: [
      "伤病——职业生涯只打了8个赛季，巅峰太短",
      "0冠0MVP——从未真正进入过争冠行列",
      "数据——场均只有19分9.2板，是否够得上历史级？",
    ],
    quote: "我不想成为中国的迈克尔·乔丹。我要成为NBA的姚明。",
    philosophicalAngle: "文化桥梁——篮球超越国界，一个人能改变一个国家对一项运动的理解",
  },

  // ── 15. Wilt Chamberlain ──
  {
    id: "wilt",
    name: "Wilt Chamberlain",
    nameCN: "威尔特·张伯伦",
    number: "#13",
    nickname: "The Big Dipper",
    nicknameCN: "篮球皇帝",
    color: "wilt-gold",
    era: "1960s-1970s",
    position: "C",
    stats: { ppg: 30.1, rpg: 22.9, apg: 4.4, rings: 2, mvps: 4, fmvps: 1, allStar: 13, allNBA: 10, dpoy: 0, scoringTitles: 7 },
    achievements: [
      "单场100分——人类篮球史上最不可思议的纪录",
      "场均50.4分的赛季——没有人能接近这个数字",
      "职业生涯场均30.1分22.9板——数据外星人",
      "4次MVP，7次得分王，11次篮板王",
      "单赛季场均48.5分钟——比比赛时间还长",
      "1968赛季场均24.3助攻证明他不只会得分",
    ],
    style: "篮球史上最强的物理存在，数据远超同时代任何人。单场100分、场均50分——这些数字可能永远不会被打破。",
    strengths: [
      "得分——单场100分、场均50分，人类极限",
      "篮板——场均22.9板，统治力无可匹敌",
      "体能——整赛季几乎不下场休息",
      "全面——想传球就拿助攻王证明自己",
    ],
    controversies: [
      "时代——60年代竞争水平和现代不可同日而语",
      "只有2冠——数据怪兽却输给拉塞尔多次",
      "关键时刻软——季后赛屡次被拉塞尔压制",
    ],
    quote: "没有人能跟我比。因为从来没有人做到过我做到的事。",
    philosophicalAngle: "数据极限——篮球是个人能力的展示场，数字说明一切",
  },

  // ── 16. Bill Russell ──
  {
    id: "russell",
    name: "Bill Russell",
    nameCN: "比尔·拉塞尔",
    number: "#6",
    nickname: "Mr. Eleven Rings",
    nicknameCN: "指环王",
    color: "russell-green",
    era: "1950s-1960s",
    position: "C",
    stats: { ppg: 15.1, rpg: 22.5, apg: 4.3, rings: 11, mvps: 5, fmvps: 0, allStar: 12, allNBA: 11, dpoy: 0, scoringTitles: 0 },
    achievements: [
      "11枚总冠军戒指——NBA历史之最，可能永远无法被超越",
      "5次MVP，凯尔特人王朝的绝对基石",
      "NBA历史上第一位黑人主教练——球员兼教练夺冠",
      "与张伯伦的宿命对决定义了60年代NBA",
      "FMVP奖杯以他命名——终极认证",
      "改变了篮球防守的定义——盖帽和护框的开创者",
    ],
    style: "防守至上的赢家，不追求个人数据只追求胜利。11枚戒指就是他的篮球哲学——赢才是唯一的标准。",
    strengths: [
      "赢——11冠，历史上最终极的赢家",
      "防守——重新定义了中锋防守的方式",
      "领导力——球员兼教练，用智慧领导球队",
      "大赛基因——季后赛从不掉链子，输给张伯伦的次数远少于赢",
    ],
    controversies: [
      "时代——50-60年代NBA只有8-14支球队，竞争烈度存疑",
      "个人进攻能力弱——场均15.1分，完全靠防守",
      "没有FMVP——他那个年代还没设立这个奖",
    ],
    quote: "最重要的数据只有一个：胜利。",
    philosophicalAngle: "胜利至上——篮球不是个人秀场，赢才是唯一有意义的事",
  },

  // ── 17. Kareem Abdul-Jabbar ──
  {
    id: "kareem",
    name: "Kareem Abdul-Jabbar",
    nameCN: "卡里姆·阿卜杜勒-贾巴尔",
    number: "#33",
    nickname: "Cap",
    nicknameCN: "天勾",
    color: "kareem-purple",
    era: "1970s-1980s",
    position: "C",
    stats: { ppg: 24.6, rpg: 11.2, apg: 3.6, rings: 6, mvps: 6, fmvps: 2, allStar: 19, allNBA: 15, dpoy: 0, scoringTitles: 2 },
    achievements: [
      "6次MVP——历史最多，超过乔丹和詹姆斯",
      "6次总冠军，横跨雄鹿和湖人两个时代",
      "天勾绝技——篮球史上最无法防守的单一招式",
      "前总得分王——纪录保持了近40年直到被詹姆斯打破",
      "19次全明星——历史最多之一",
      "20年职业生涯始终保持高水准输出",
    ],
    style: "天勾之神，单一招式统治联盟20年。不需要12种武器，一招天勾就够——因为没有人能防住。",
    strengths: [
      "天勾——历史上最无法防守的技能，成功率极高",
      "长寿——20年巅峰级输出，42岁还在拿冠军",
      "MVP——6个MVP历史第一",
      "全面——得分+篮板+防守全部历史级",
    ],
    controversies: [
      "个性冷淡——不配合媒体，不够有魅力",
      "依赖魔术师——后期冠军离不开Showtime体系",
      "打法无聊——一招天勾20年，观赏性差",
    ],
    quote: "天勾无法被封盖。因为你根本够不到。",
    philosophicalAngle: "一招鲜吃遍天——把一件事做到极致比会一百件事更可怕",
  },

  // ── 18. Julius Erving ──
  {
    id: "drj",
    name: "Julius Erving",
    nameCN: "朱利叶斯·欧文",
    number: "#6",
    nickname: "Dr. J",
    nicknameCN: "J博士",
    color: "drj-red",
    era: "1970s-1980s",
    position: "SF",
    stats: { ppg: 22.0, rpg: 6.7, apg: 3.9, rings: 1, mvps: 1, fmvps: 0, allStar: 11, allNBA: 7, dpoy: 0, scoringTitles: 0 },
    achievements: [
      "ABA+NBA双料传奇——定义了扣篮和空中表演",
      "1983年76人夺冠，终获NBA总冠军",
      "ABA 3次MVP+3次得分王",
      "NBA 1次MVP，11次全明星",
      "扣篮从罚球线起飞——乔丹致敬的原版",
      "NBA50大+75大巨星，篮球飞行先驱",
    ],
    style: "空中飞人的原始版本，在乔丹之前定义了什么叫扣篮艺术。优雅的空中姿态、创造性的上篮——篮球美学的开创者。",
    strengths: [
      "扣篮艺术——从罚球线起飞，乔丹的老师",
      "空中技巧——定义了篮球的视觉美学",
      "ABA统治力——联盟最具统治力的球员",
      "文化影响——让篮球从地面运动变成空中表演",
    ],
    controversies: [
      "ABA数据含金量——那是一个次级联盟",
      "NBA只有1冠——进入NBA后统治力下降",
      "被乔丹完全超越——所有J博士的标签都被乔丹夺走",
    ],
    quote: "我不是在打篮球。我是在飞。",
    philosophicalAngle: "篮球美学——扣篮是艺术，空中是自由，篮球应该让人屏住呼吸",
  },

  // ── 19. Scottie Pippen ──
  {
    id: "pippen",
    name: "Scottie Pippen",
    nameCN: "斯科蒂·皮蓬",
    number: "#33",
    nickname: "Pip",
    nicknameCN: "蝙蝠侠",
    color: "pippen-red",
    era: "1990s",
    position: "SF",
    stats: { ppg: 16.1, rpg: 6.4, apg: 5.2, rings: 6, mvps: 0, fmvps: 0, allStar: 7, allNBA: 7, dpoy: 0, scoringTitles: 0 },
    achievements: [
      "6次总冠军——与乔丹并肩作战的完美二当家",
      "10次防守阵容——历史级外线防守者",
      "1994年没有乔丹带公牛55胜进东决",
      "攻防全面的小前锋——控球、传球、防守全部顶级",
      "NBA50大+75大巨星",
      "梦一队成员，奥运金牌得主",
    ],
    style: "历史最伟大的二当家，攻防全面的瑞士军刀。防守端能锁全场最佳，进攻端能控球组织——乔丹王朝不可或缺的另一半。",
    strengths: [
      "防守——外线防守历史级，能锁1-3号位",
      "全面——控球、传球、防守、篮板全部出色",
      "关键拼图——没有皮蓬就没有公牛6冠",
      "1994——独自带队证明自己不是配角",
    ],
    controversies: [
      "永远的二当家——没有乔丹就是二轮游",
      "拒绝上场事件——1994季后赛最后1.8秒拒绝出场",
      "自传撕乔丹——晚年言论争议不断",
    ],
    quote: "没有我，乔丹只有3个冠军。",
    philosophicalAngle: "完美配角——伟大不一定是主角，让系统更好就是最大的价值",
  },

  // ── 20. Karl Malone ──
  {
    id: "malone",
    name: "Karl Malone",
    nameCN: "卡尔·马龙",
    number: "#32",
    nickname: "The Mailman",
    nicknameCN: "邮差",
    color: "malone-purple",
    era: "1980s-2000s",
    position: "PF",
    stats: { ppg: 25.0, rpg: 10.1, apg: 3.6, rings: 0, mvps: 2, fmvps: 0, allStar: 14, allNBA: 14, dpoy: 0, scoringTitles: 0 },
    achievements: [
      "历史总得分第三——36928分",
      "2次MVP——97、99年力压乔丹",
      "14次最佳阵容一阵——历史级持续输出",
      "14次全明星，连续18年场均20+",
      "与斯托克顿组成历史最强挡拆组合",
      "NBA50大+75大巨星",
    ],
    style: "铁人型大前锋，力量和持久力的完美结合。挡拆后接球中距离跳投是他的招牌，铁肘开路无人敢挡。",
    strengths: [
      "铁人——19年不间断高产输出，几乎从不缺席",
      "得分——历史第三得分手，中距离极其稳定",
      "挡拆——与斯托克顿的挡拆配合史上最强",
      "力量——铁肘开路，内线对抗无人能敌",
    ],
    controversies: [
      "0冠——两次总决赛都输给乔丹，关键时刻消失",
      "97年总决赛邮差不在周日送信——皮蓬经典垃圾话",
      "场外丑闻——未成年人事件是不可磨灭的污点",
    ],
    quote: "我每天都在工作。邮差每天都要送信。",
    philosophicalAngle: "铁人精神——篮球是19年如一日的坚持，稳定就是伟大",
  },

  // ── 21. John Stockton ──
  {
    id: "stockton",
    name: "John Stockton",
    nameCN: "约翰·斯托克顿",
    number: "#12",
    nickname: "Stock",
    nicknameCN: "白影",
    color: "stockton-purple",
    era: "1980s-2000s",
    position: "PG",
    stats: { ppg: 13.1, rpg: 2.7, apg: 10.5, rings: 0, mvps: 0, fmvps: 0, allStar: 10, allNBA: 11, dpoy: 0, scoringTitles: 0 },
    achievements: [
      "历史助攻王——15806次助攻，远超第二名",
      "历史抢断王——3265次抢断，同样遥遥领先",
      "连续出场纪录——19年几乎不缺席",
      "9次助攻王，2次抢断王",
      "与马龙组成历史最强双人组",
      "NBA50大+75大巨星",
    ],
    style: "控卫教科书，挡拆大师，助攻艺术家。不追求华丽，每一次传球都是最正确最精准的选择。",
    strengths: [
      "传球——历史助攻王，场均10.5助攻",
      "持久力——19年铁人，几乎不伤不病",
      "挡拆——与马龙的挡拆组合定义了这项战术",
      "抢断——历史抢断王，防守端同样出色",
    ],
    controversies: [
      "0冠0MVP——和马龙一样被乔丹挡在门外",
      "得分太低——场均13.1分，纯辅助型控卫",
      "小动作多——暗肘、绊脚、拉人是常态",
    ],
    quote: "我的工作是让队友得分。如果他们都得分了，我的工作就做好了。",
    philosophicalAngle: "助攻是艺术——控卫不需要得分，把球传到最正确的人手里就是完美",
  },

  // ── 22. Dirk Nowitzki ──
  {
    id: "nowitzki",
    name: "Dirk Nowitzki",
    nameCN: "德克·诺维茨基",
    number: "#41",
    nickname: "Dirk",
    nicknameCN: "德国战车",
    color: "nowitzki-blue",
    era: "2000s-2010s",
    position: "PF",
    stats: { ppg: 20.7, rpg: 7.5, apg: 2.4, rings: 1, mvps: 1, fmvps: 1, allStar: 14, allNBA: 12, dpoy: 0, scoringTitles: 0 },
    achievements: [
      "2011年独扛小牛击败热火三巨头——最伟大的夺冠之一",
      "MVP+FMVP——国际球员第一人",
      "金鸡独立——独创7尺身高的后仰跳投",
      "21年一人一城——达拉斯之魂",
      "14次全明星，历史最伟大国际球员",
      "31560分——历史级得分手",
    ],
    style: "7尺大个子的投射革命者，金鸡独立后仰跳投是他的注册商标。在库里改变三分线之前，诺维茨基先改变了大个子的定义。",
    strengths: [
      "金鸡独立——7尺身高的无解后仰跳投",
      "忠诚——21年达拉斯一人一城",
      "2011年——独自击败詹姆斯+韦德+波什三巨头",
      "投射革命——改变了大前锋的打法定义",
    ],
    controversies: [
      "只有1冠——生涯大部分时间季后赛早退",
      "2007年MVP赛季首轮被8号种子淘汰",
      "防守差——一直是球队防守端的漏洞",
    ],
    quote: "达拉斯是我的家。我哪儿也不去。",
    philosophicalAngle: "一人一城——忠诚不是无能，是选择。21年的坚守比任何戒指都重",
  },

  // ── 23. Dwyane Wade ──
  {
    id: "wade",
    name: "Dwyane Wade",
    nameCN: "德怀恩·韦德",
    number: "#3",
    nickname: "Flash",
    nicknameCN: "闪电侠",
    color: "wade-red",
    era: "2000s-2010s",
    position: "SG",
    stats: { ppg: 22.0, rpg: 4.7, apg: 5.4, rings: 3, mvps: 0, fmvps: 1, allStar: 13, allNBA: 8, dpoy: 0, scoringTitles: 1 },
    achievements: [
      "2006年总决赛逆转独行侠——史诗级FMVP表现",
      "3次总冠军，热火队史最伟大球员",
      "2009年场均30.2分——生涯最高得分赛季",
      "13次全明星，3次防守阵容",
      "2006年总决赛场均34.7分——历史级表现",
      "热火之魂——迈阿密永远退役的3号",
    ],
    style: "爆发力型得分后卫，突破速度极快，上篮姿态华丽。巅峰韦德的突破就像闪电劈开防线——你看到的时候已经来不及了。",
    strengths: [
      "突破——闪电般的第一步，防守者反应不过来",
      "大赛球员——2006总决赛一人打崩独行侠",
      "盖帽——后卫里的盖帽机器",
      "领袖——热火队史第一人，从里到外的领导者",
    ],
    controversies: [
      "0MVP——巅峰够亮但从未拿过常规赛MVP",
      "2006年总决赛靠罚球——裁判争议至今",
      "后两冠是詹姆斯的冠军——从老大变成二当家",
    ],
    quote: "这是我的城市。（This is my house.）",
    philosophicalAngle: "闪电一击——篮球是瞬间的爆发，一步就能决定胜负",
  },

  // ── 24. Charles Barkley ──
  {
    id: "barkley",
    name: "Charles Barkley",
    nameCN: "查尔斯·巴克利",
    number: "#34",
    nickname: "Sir Charles",
    nicknameCN: "空中飞猪",
    color: "barkley-orange",
    era: "1980s-1990s",
    position: "PF",
    stats: { ppg: 22.1, rpg: 11.7, apg: 3.9, rings: 0, mvps: 1, fmvps: 0, allStar: 11, allNBA: 11, dpoy: 0, scoringTitles: 0 },
    achievements: [
      "1993年MVP——力压乔丹当选",
      "6尺5打大前锋场均11.7篮板——以小博大的极致",
      "5次篮板王，11次最佳阵容",
      "1992年梦一队核心成员",
      "NBA50大+75大巨星",
      "退役后成为最受欢迎的篮球评论员",
    ],
    style: "6尺5的大前锋，用屁股和力量在内线碾压比自己高半头的对手。巅峰巴克利打球就像一辆失控的推土机——你只能让开。",
    strengths: [
      "力量——6尺5在内线打出中锋级数据",
      "篮板——以小博大的篮板怪兽",
      "全面——能得分能传球能抢板，全能大前锋",
      "娱乐性——打球和说话都是最具娱乐性的",
    ],
    controversies: [
      "0冠——一辈子没拿到戒指，总决赛输给乔丹",
      "「我不是榜样」——这句话争议了30年",
      "赌博成瘾——公开承认输了千万美元",
    ],
    quote: "我不是榜样。父母才是榜样。（I am not a role model.）",
    philosophicalAngle: "对抗一切——篮球是不服输的游戏，身高不够就用态度补",
  },

  // ── 25. Patrick Ewing ──
  {
    id: "ewing",
    name: "Patrick Ewing",
    nameCN: "帕特里克·尤因",
    number: "#33",
    nickname: "The Franchise",
    nicknameCN: "大猩猩",
    color: "ewing-blue",
    era: "1980s-1990s",
    position: "C",
    stats: { ppg: 21.0, rpg: 9.8, apg: 1.9, rings: 0, mvps: 0, fmvps: 0, allStar: 11, allNBA: 7, dpoy: 0, scoringTitles: 0 },
    achievements: [
      "纽约尼克斯队史最伟大球员",
      "1994年带尼克斯杀入总决赛",
      "11次全明星，攻防两端的顶级中锋",
      "NBA50大+75大巨星",
      "1984年奥运金牌得主",
      "生涯24815分——顶级得分中锋",
    ],
    style: "90年代硬派中锋的代表，中距离跳投+内线对抗+防守护框。不华丽但极其扎实，是尼克斯铁血防守的核心。",
    strengths: [
      "中距离——中锋里顶级的跳投手感",
      "防守——90年代硬派中锋的护框支柱",
      "得分——生涯24815分，攻防两端可靠",
      "忠诚——纽约之王，尼克斯精神象征",
    ],
    controversies: [
      "0冠0MVP——90年代被乔丹完全压制",
      "94年总决赛第七场关键失误",
      "冻结信封——选秀阴谋论至今",
    ],
    quote: "纽约属于我。即使没有戒指。",
    philosophicalAngle: "坚守——篮球是在最艰难的地方不放弃，即使没有冠军也不离开",
  },

  // ── 26. David Robinson ──
  {
    id: "robinson",
    name: "David Robinson",
    nameCN: "大卫·罗宾逊",
    number: "#50",
    nickname: "The Admiral",
    nicknameCN: "海军上将",
    color: "robinson-silver",
    era: "1990s-2000s",
    position: "C",
    stats: { ppg: 21.1, rpg: 10.6, apg: 2.5, rings: 2, mvps: 1, fmvps: 0, allStar: 10, allNBA: 10, dpoy: 1, scoringTitles: 1 },
    achievements: [
      "1995年MVP——场均27.6分10.8板3.2助",
      "1994年得分王——单场71分冲击得分王",
      "2次总冠军（1999、2003），DPOY",
      "10次全明星，4次防守一阵",
      "NBA50大+75大巨星",
      "海军军官出身——从军人到NBA巨星",
    ],
    style: "运动能力炸裂的技术型中锋，速度和弹跳远超同位置球员。7尺1的身高加上后卫级别的运动能力——90年代内线的终极武器。",
    strengths: [
      "运动能力——7尺1却有后卫级速度和弹跳",
      "攻防全面——得分王+DPOY双料",
      "军人品格——纪律性和职业精神无可挑剔",
      "接班传承——主动让位给邓肯，赢得最后2冠",
    ],
    controversies: [
      "季后赛缩水——被大梦碾压是生涯最大污点",
      "0FMVP——2冠都是邓肯的核心",
      "需要邓肯才能夺冠——单核时期从未突破西决",
    ],
    quote: "纪律是自由的前提。在球场上和在军队里都一样。",
    philosophicalAngle: "军人纪律——篮球是纪律和身体素质的完美结合",
  },

  // ── 27. Giannis Antetokounmpo ──
  {
    id: "giannis",
    name: "Giannis Antetokounmpo",
    nameCN: "扬尼斯·安特托昆博",
    number: "#34",
    nickname: "Greek Freak",
    nicknameCN: "字母哥",
    color: "giannis-green",
    era: "2010s-2020s",
    position: "PF/C",
    stats: { ppg: 23.4, rpg: 9.8, apg: 4.9, rings: 1, mvps: 2, fmvps: 1, allStar: 8, allNBA: 8, dpoy: 1, scoringTitles: 0 },
    achievements: [
      "2021年总决赛50分封神——G6独砍50+14+5夺冠",
      "2次MVP+DPOY——攻防一体的现代怪兽",
      "从15号秀到2次MVP——NBA历史最励志逆袭",
      "2020年同时获得MVP+DPOY",
      "一人一城——拒绝离开密尔沃基",
      "8次全明星，巅峰仍在持续",
    ],
    style: "从三分线起步用三步就能杀到篮下的物理怪兽。7尺身高+7尺3臂展+后卫速度——像是实验室里制造的完美篮球机器。",
    strengths: [
      "身体天赋——7尺+后卫速度+怪兽力量",
      "攻防一体——MVP+DPOY双料",
      "冲击力——从三分线三步上篮是无解BUG",
      "成长性——从15号秀逆袭成2次MVP",
      "忠诚——拒绝超级球队，留在小市场夺冠",
    ],
    controversies: [
      "半场进攻——投篮不稳定，罚球差",
      "只有1冠——2次MVP但仍需证明更多",
      "碰瓷打法——靠冲撞而非技术得分",
    ],
    quote: "我两年前还在想下一顿饭从哪来。现在我是MVP。这就是我的故事。",
    philosophicalAngle: "草根逆袭——篮球是证明不可能可以变成可能的舞台",
  },

  // ── 28. Nikola Jokic ──
  {
    id: "jokic",
    name: "Nikola Jokic",
    nameCN: "尼古拉·约基奇",
    number: "#15",
    nickname: "The Joker",
    nicknameCN: "约老师",
    color: "jokic-blue",
    era: "2020s",
    position: "C",
    stats: { ppg: 21.0, rpg: 10.4, apg: 7.3, rings: 1, mvps: 3, fmvps: 1, allStar: 6, allNBA: 7, dpoy: 0, scoringTitles: 0 },
    achievements: [
      "3次MVP——追平伯德、比肩乔丹/詹姆斯",
      "2023年总冠军+FMVP——带掘金首冠",
      "历史唯一场均三双级别的中锋",
      "2次41号签——NBA历史最低顺位MVP",
      "多次赛季三双——中锋里前所未有",
      "完全重新定义了中锋这个位置",
    ],
    style: "7尺中锋打出控卫的传球+后卫的得分+前锋的全面。不靠速度不靠弹跳，全靠篮球智商和手感——最另类的超级巨星。",
    strengths: [
      "传球——中锋里历史最佳传球手，没有之一",
      "篮球智商——全场视野和比赛理解力天花板",
      "全面——场均三双级别的中锋，历史唯一",
      "效率——真实命中率常年65%+，极致高效",
    ],
    controversies: [
      "身材不像球星——看起来像你隔壁的水管工",
      "时代弱——西部对手强度被质疑",
      "运动能力差——如果放在90年代能否统治？",
    ],
    quote: "我不在乎人们怎么看我。我只在乎赢球和我的马。",
    philosophicalAngle: "反常规——篮球不需要你跑得最快跳得最高，用脑子打球才是最高境界",
  },

  // ── 29. Joel Embiid ──
  {
    id: "embiid",
    name: "Joel Embiid",
    nameCN: "乔尔·恩比德",
    number: "#21",
    nickname: "The Process",
    nicknameCN: "大帝",
    color: "embiid-blue",
    era: "2020s",
    position: "C",
    stats: { ppg: 24.3, rpg: 10.6, apg: 3.1, rings: 0, mvps: 1, fmvps: 0, allStar: 7, allNBA: 5, dpoy: 0, scoringTitles: 1 },
    achievements: [
      "2023年MVP——场均33.1分碾压全联盟",
      "得分王赛季场均33.1分——中锋最高",
      "7次全明星，攻防两端统治力",
      "2024年奥运金牌——为美国队夺冠",
      "16岁才开始打篮球——天赋异禀",
      "信任过程——从摆烂到MVP的逆袭故事",
    ],
    style: "7尺+280磅的技术型中锋，拥有低位脚步+中距离+三分+罚球全套武器。是传统中锋和现代篮球的完美结合体。",
    strengths: [
      "得分技术——低位脚步+中距离+三分全面开花",
      "力量——280磅的内线碾压",
      "防守——盖帽和护框能力顶级",
      "全面——中锋里的全能进攻武器库",
    ],
    controversies: [
      "伤病——职业生涯缺席比赛太多，铁人精神为零",
      "0冠——季后赛一直无法突破",
      "碰瓷王——靠制造犯规而非真实得分",
    ],
    quote: "相信过程。（Trust the process.）",
    philosophicalAngle: "信任过程——篮球是漫长的建设，从废墟到MVP需要信念",
  },

  // ── 30. Kawhi Leonard ──
  {
    id: "kawhi",
    name: "Kawhi Leonard",
    nameCN: "科怀·伦纳德",
    number: "#2",
    nickname: "The Klaw",
    nicknameCN: "小卡",
    color: "kawhi-red",
    era: "2010s-2020s",
    position: "SF",
    stats: { ppg: 20.0, rpg: 6.5, apg: 3.0, rings: 2, mvps: 0, fmvps: 2, allStar: 6, allNBA: 5, dpoy: 2, scoringTitles: 0 },
    achievements: [
      "2次FMVP——跨马刺和猛龙两支不同球队",
      "2次DPOY——历史级外线防守者",
      "2019年独扛猛龙夺冠——击败勇士王朝",
      "2019季后赛——连续淘汰76人和雄鹿两大强敌",
      "总决赛0败——打过的总决赛全部夺冠",
      "那记绝杀76人的四连弹——NBA历史最揪心的进球",
    ],
    style: "攻防两端的终极机器人——防守端能锁全场最佳，进攻端中距离精准如手术刀。不说话不庆祝不社交，只会打球。",
    strengths: [
      "防守——2次DPOY，大手锁死一切",
      "关键球——2019四连弹绝杀，大赛从不手软",
      "攻防一体——攻防两端都是顶级的稀有物种",
      "效率——季后赛越打越猛，越关键越准",
    ],
    controversies: [
      "伤病管理——长期轮休，出勤率极低",
      "沉默性格——不与媒体互动，没有个人品牌",
      "离开马刺的方式——强行要求交易，不够体面",
    ],
    quote: "（沉默）……哈哈哈哈哈。",
    philosophicalAngle: "沉默杀手——篮球不需要说话，让防守和得分替你发声",
  },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

export function getPlayerById(id: string): Player {
  const p = players.find((pl) => pl.id === id);
  if (!p) throw new Error(`Player not found: ${id}`);
  return p;
}
