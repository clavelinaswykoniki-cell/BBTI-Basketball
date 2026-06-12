export interface BbtiShareCardPreset {
  code: string;
  headline: string;
  badge: string;
  caption: string;
  groupHook: string;
}

const DEFAULT_PRESET: BbtiShareCardPreset = {
  code: "BBTI",
  headline: "球探报告已生成",
  badge: "SCOUT",
  caption: "这张卡只记录你的篮球脑回路，重开链接也能对上号。",
  groupHook: "把这张卡丢进群里，等对面交出自己的 BBTI 再开庭。",
};

export const bbtiShareCardPresets: Record<string, BbtiShareCardPreset> = {
  OAIL: {
    code: "OAIL",
    headline: "数据护城河",
    badge: "DATA ISO",
    caption: "你会先把高阶表摊开，再告诉别人这不是偏爱，是证据。",
    groupHook: "谁说单核叙事没证据，先把表格交出来再吵。",
  },
  OAIR: {
    code: "OAIR",
    headline: "效率裁判席",
    badge: "EFFICIENCY",
    caption: "你不太吃名气，只看每一回合到底值不值。",
    groupHook: "今晚别聊情怀，拿真实效率和季后赛产量说话。",
  },
  OATL: {
    code: "OATL",
    headline: "进攻体系讲师",
    badge: "PLAYBOOK",
    caption: "你看热闹之前先看跑位，队友空切比单打更容易让你点头。",
    groupHook: "来一局战术板审判，谁的体系能撑住七场系列赛。",
  },
  OATR: {
    code: "OATR",
    headline: "冠军建模师",
    badge: "MODEL",
    caption: "你会把天赋、空间、薪资和季后赛容错率一起算进去。",
    groupHook: "给你一支球队预算，你会先砍掉哪种低效配置？",
  },
  OEIL: {
    code: "OEIL",
    headline: "名场面信徒",
    badge: "HIGHLIGHT",
    caption: "你不否认数据，但真正让你上头的是一球定生死的画面。",
    groupHook: "别先甩表格，先说哪一个镜头让你入坑。",
  },
  OEIR: {
    code: "OEIR",
    headline: "戒指与浪漫拉扯",
    badge: "CLUTCH",
    caption: "你爱英雄球，也会在最后一秒追问这段传奇有没有结果。",
    groupHook: "名场面和冠军含金量只能留一个，你怎么判？",
  },
  OETL: {
    code: "OETL",
    headline: "黄金年代回放师",
    badge: "CLASSIC",
    caption: "你会把老比赛讲成连续剧，连一套传切都自带滤镜。",
    groupHook: "开一局年代审判，哪支老球队放到今天还能赢？",
  },
  OETR: {
    code: "OETR",
    headline: "王朝巡游位",
    badge: "DYNASTY",
    caption: "你要好看，也要赢球，最好还能让整座球馆一起沸腾。",
    groupHook: "王朝球队和单核神迹正面打，你先坐哪边？",
  },
  DAIL: {
    code: "DAIL",
    headline: "防守数据辩护席",
    badge: "STOP RATE",
    caption: "你会替那些不进集锦的防守回合做完整辩护。",
    groupHook: "别只看得分，今晚把防守影响力也拉上桌。",
  },
  DAIR: {
    code: "DAIR",
    headline: "两端价值审计官",
    badge: "TWO WAY",
    caption: "你偏爱能在攻防两端给出交代的冠军级答案。",
    groupHook: "只会得分和真正改变系列赛，差距到底有多大？",
  },
  DATL: {
    code: "DATL",
    headline: "体系防守讲师",
    badge: "SCHEME",
    caption: "你相信轮转、协防和纪律，比一记高难度进球更能决定比赛。",
    groupHook: "今晚不审个人高光，专审谁的防守体系更能打硬仗。",
  },
  DATR: {
    code: "DATR",
    headline: "冠军防线工程师",
    badge: "TITLE WALL",
    caption: "你看的是总冠军公式，防守底盘不稳的队先被你划掉。",
    groupHook: "哪支热门队只是纸面强，七场系列赛会露馅？",
  },
  DEIL: {
    code: "DEIL",
    headline: "一城防线守护位",
    badge: "HOME WALL",
    caption: "你会把一次盖帽、一次补防，看成整座主场的底气。",
    groupHook: "如果一名球员把城市防线扛住，他还需要多少进攻数据？",
  },
  DEIR: {
    code: "DEIR",
    headline: "沉默防守杀手",
    badge: "LOCKDOWN",
    caption: "你欣赏那种不抢镜却能把比赛慢慢锁死的人。",
    groupHook: "二当家、防守核心、冠军拼图，谁才最容易被低估？",
  },
  DETL: {
    code: "DETL",
    headline: "铁血主场看台",
    badge: "GRIT",
    caption: "你愿意陪一支队慢慢磨，哪怕比分丑一点也觉得踏实。",
    groupHook: "漂亮输球和难看赢球，你的主场会选哪一个？",
  },
  DETR: {
    code: "DETR",
    headline: "冠军文化委员",
    badge: "CULTURE",
    caption: "你相信团队防守和更衣室秩序，戒指不是偶然掉下来的。",
    groupHook: "真正的冠军 DNA 是球星天赋，还是球队文化？",
  },
};

export function getBbtiShareCardPreset(code: string): BbtiShareCardPreset {
  return bbtiShareCardPresets[code] ?? {
    ...DEFAULT_PRESET,
    code,
  };
}
