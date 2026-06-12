export interface MatchupTagInfo {
  heat: string;
  lane: string;
  advisor: string;
  axes: string[];
}

export const MATCHUP_TAGS: Record<string, MatchupTagInfo> = {
  "kobe-vs-lebron": {
    heat: "99 HEAT",
    lane: "GOAT 法庭",
    advisor: "最容易吵到全员禁言",
    axes: ["英雄球", "忠诚/冠军", "Eye Test"],
  },
  "kobe-vs-jordan": {
    heat: "96 HEAT",
    lane: "师徒镜像战",
    advisor: "原版和继承者的美学冲突",
    axes: ["技术美学", "峰值", "杀手本能"],
  },
  "lebron-vs-jordan": {
    heat: "100 HEAT",
    lane: "历史第一席位",
    advisor: "完美履历 vs 累计宇宙",
    axes: ["峰值/长度", "数据/神话", "建队核心"],
  },
  "magic-vs-bird": {
    heat: "91 HEAT",
    lane: "80年代宿命局",
    advisor: "Showtime 撞上凯尔特人铁血",
    axes: ["阵营感", "团队发动", "时代叙事"],
  },
  "curry-vs-durant": {
    heat: "94 HEAT",
    lane: "勇士内战",
    advisor: "硬路和简单路互相拷问",
    axes: ["体系/硬解", "空间", "王朝归因"],
  },
  "shaq-vs-yao": {
    heat: "88 HEAT",
    lane: "中锋东西战",
    advisor: "物理碾压对上全球影响力",
    axes: ["禁区统治", "对位", "时代环境"],
  },
  "duncan-vs-garnett": {
    heat: "90 HEAT",
    lane: "大前锋铁笼战",
    advisor: "安静王朝和怒吼防线",
    axes: ["防守地基", "体系", "气质冲突"],
  },
  "ai-vs-tmac": {
    heat: "86 HEAT",
    lane: "青春遗憾局",
    advisor: "矮个战神和天赋诗人",
    axes: ["无冠遗憾", "观赏性", "What-if"],
  },
};
