import { getPlayerById, players, type Player } from "./player-database";

type RivalryTag =
  | "canon"
  | "goat"
  | "teammate"
  | "position"
  | "era"
  | "style"
  | "rings"
  | "data"
  | "what-if";

interface RivalryEdge {
  pair: [string, string];
  weight: number;
  tag: RivalryTag;
  label: string;
  reason: string;
}

export interface RivalRecommendation {
  player: Player;
  score: number;
  label: string;
  heat: string;
  reason: string;
  chips: string[];
}

const RIVALRY_EDGES: RivalryEdge[] = [
  { pair: ["jordan", "lebron"], weight: 20, tag: "goat", label: "GOAT 法庭", reason: "完美总决赛 vs 超长巅峰，历史第一标准之争。" },
  { pair: ["jordan", "kobe"], weight: 18, tag: "style", label: "门徒弑神", reason: "技术谱系最像，曼巴是否接近飞人。" },
  { pair: ["kobe", "lebron"], weight: 18, tag: "goat", label: "时代公案", reason: "曼巴精神和全能霸主，两套价值观最容易吵翻。" },
  { pair: ["kobe", "shaq"], weight: 20, tag: "teammate", label: "王朝归属", reason: "湖人三连冠到底谁是第一核心。" },
  { pair: ["magic", "bird"], weight: 20, tag: "canon", label: "宿命主线", reason: "80年代黑白双雄，阵营、风格、荣誉全对位。" },
  { pair: ["curry", "lebron"], weight: 18, tag: "era", label: "十年主线", reason: "2010年代总决赛主线，体系革命对抗全能霸主。" },
  { pair: ["curry", "durant"], weight: 16, tag: "teammate", label: "王朝归因", reason: "勇士王朝是体系胜利还是死神降临。" },
  { pair: ["duncan", "garnett"], weight: 18, tag: "position", label: "大前锋正统", reason: "基本功秩序 vs 情绪燃烧。" },
  { pair: ["iverson", "tmac"], weight: 16, tag: "what-if", label: "无冠天才", reason: "个人能力、观赏性和遗憾值都拉满。" },
  { pair: ["shaq", "yao"], weight: 16, tag: "position", label: "巨兽对撞", reason: "传统巨无霸 vs 中国长城。" },
  { pair: ["wilt", "russell"], weight: 20, tag: "data", label: "数据戒指", reason: "数据天花板 vs 戒指天花板。" },
  { pair: ["jokic", "embiid"], weight: 18, tag: "position", label: "现代中锋", reason: "MVP、打法和季后赛含金量争议。" },
  { pair: ["durant", "giannis"], weight: 14, tag: "style", label: "锋线答案", reason: "极致投射天赋 vs 身体冲击统治。" },
  { pair: ["hakeem", "shaq"], weight: 15, tag: "position", label: "中锋天花板", reason: "梦幻脚步和物理碾压谁更无解。" },
  { pair: ["malone", "barkley"], weight: 14, tag: "rings", label: "无冠大前", reason: "无冠巨星里谁的历史地位更硬。" },
  { pair: ["kawhi", "lebron"], weight: 14, tag: "era", label: "攻防审判", reason: "小卡的季后赛峰值能否压住詹姆斯叙事。" },
  { pair: ["hakeem", "robinson"], weight: 14, tag: "position", label: "梦幻审判", reason: "MVP中锋被梦幻脚步点名，名场面自带证据。" },
  { pair: ["pippen", "jordan"], weight: 12, tag: "teammate", label: "皮蓬命题", reason: "乔丹神话里，皮蓬到底是配角还是体系支柱。" },
  { pair: ["nowitzki", "garnett"], weight: 14, tag: "style", label: "欧洲火力", reason: "投射大前和防守全能，谁更接近现代答案。" },
  { pair: ["wade", "iverson"], weight: 12, tag: "style", label: "矮个杀器", reason: "突破、硬解、观赏性，后卫浪漫主义互撕。" },
];

const TAG_LABELS: Record<RivalryTag, string> = {
  canon: "宿命主线",
  goat: "GOAT 法庭",
  teammate: "王朝归属",
  position: "同位置互撕",
  era: "时代穿越",
  style: "打法冲突",
  rings: "无冠拷问",
  data: "数据怪物",
  "what-if": "遗憾值拉满",
};

const PLAYER_ORDER = new Map(players.map((player, index) => [player.id, index]));

function findEdge(a: string, b: string): RivalryEdge | undefined {
  return RIVALRY_EDGES.find((edge) => (
    (edge.pair[0] === a && edge.pair[1] === b) ||
    (edge.pair[0] === b && edge.pair[1] === a)
  ));
}

function decadeSet(era: string): Set<string> {
  return new Set(era.match(/\d{4}s/g) ?? []);
}

function eraOverlapScore(a: Player, b: Player): number {
  const aDecades = decadeSet(a.era);
  const bDecades = decadeSet(b.era);
  let shared = 0;
  aDecades.forEach((decade) => {
    if (bDecades.has(decade)) shared += 1;
  });
  return Math.min(shared * 3, 8);
}

function positionBuckets(position: string): string[] {
  const buckets = position.split("/").map((pos) => {
    if (pos === "PG" || pos === "SG") return "guard";
    if (pos === "SF") return "wing";
    if (pos === "PF" || pos === "C") return "big";
    return pos.toLowerCase();
  });
  return Array.from(new Set(buckets));
}

function positionScore(a: Player, b: Player): number {
  const aBuckets = positionBuckets(a.position);
  const bBuckets = positionBuckets(b.position);
  return aBuckets.some((bucket) => bBuckets.includes(bucket)) ? 5 : 0;
}

function legacyScore(player: Player): number {
  return (
    player.stats.rings * 4 +
    player.stats.fmvps * 4 +
    player.stats.mvps * 3 +
    player.stats.allNBA * 0.8 +
    player.stats.allStar * 0.2 +
    player.stats.dpoy * 2 +
    player.stats.scoringTitles * 1.5
  );
}

function legacyParityScore(a: Player, b: Player): number {
  const diff = Math.abs(legacyScore(a) - legacyScore(b));
  if (diff < 8) return 6;
  if (diff < 16) return 3;
  return 0;
}

function statContrastScore(a: Player, b: Player): number {
  const scoringGap = Math.abs(a.stats.ppg - b.stats.ppg);
  const creationGap = Math.abs(a.stats.apg - b.stats.apg);
  const reboundGap = Math.abs(a.stats.rpg - b.stats.rpg);
  const defenseGap = Math.abs(a.stats.dpoy - b.stats.dpoy);
  let score = 0;

  if (scoringGap >= 4 && (creationGap >= 2 || reboundGap >= 3 || defenseGap >= 1)) score += 3;
  if (defenseGap >= 1 && scoringGap >= 3) score += 1;

  return Math.min(score, 4);
}

function debateFuelScore(a: Player, b: Player): number {
  const controversyFuel = Math.min(a.controversies.length + b.controversies.length, 6) * 0.75;
  const achievementFuel = Math.min(a.achievements.length + b.achievements.length, 12) * 0.2;
  return controversyFuel + achievementFuel;
}

function isGreatNoRing(player: Player): boolean {
  return player.stats.rings === 0 && (
    player.stats.mvps > 0 ||
    player.stats.allNBA >= 5 ||
    player.stats.scoringTitles > 0
  );
}

function specialTensionScore(a: Player, b: Player): number {
  const aVsDynasty = isGreatNoRing(a) && b.stats.rings >= 3;
  const bVsDynasty = isGreatNoRing(b) && a.stats.rings >= 3;
  return aVsDynasty || bVsDynasty ? 3 : 0;
}

function shortName(player: Player): string {
  if (player.id === "kobe") return "科比";
  if (player.id === "lebron") return "詹姆斯";
  if (player.id === "shaq") return "奥尼尔";
  if (player.id === "yao") return "姚明";
  if (player.id === "magic") return "魔术师";
  if (player.id === "bird") return "大鸟";
  if (player.id === "iverson") return "艾弗森";
  if (player.id === "tmac") return "麦迪";
  return player.nameCN.includes("·") ? player.nameCN.split("·").pop() ?? player.nameCN : player.nameCN;
}

function labelFor(edge: RivalryEdge | undefined, position: number, era: number, statContrast: number, special: number): string {
  if (edge) return edge.label;
  if (special > 0) return TAG_LABELS.rings;
  if (position > 0) return TAG_LABELS.position;
  if (statContrast >= 3) return TAG_LABELS.style;
  if (era > 0) return TAG_LABELS.era;
  return "破防候选";
}

function reasonFor(base: Player, candidate: Player, edge: RivalryEdge | undefined, position: number, era: number, statContrast: number, special: number): string {
  if (edge) return edge.reason;
  if (special > 0) {
    return `${shortName(base)}和${shortName(candidate)}能直接开庭：天赋、荣誉和戒指含金量都绕不开。`;
  }
  if (position > 0) {
    return "同位置/同功能区对比，标准最难统一。";
  }
  if (statContrast >= 3) {
    return "打法画像互相拉扯，一个指标压不住另一套篮球价值观。";
  }
  if (era > 0) {
    return "时代重叠，直接拿同时代语境开吵。";
  }
  return "荣誉、风格和争议点足够拉出一组新辩题。";
}

function chipsFor(edge: RivalryEdge | undefined, position: number, era: number, parity: number, statContrast: number, special: number): string[] {
  const chips: string[] = [];

  if (edge) chips.push(TAG_LABELS[edge.tag]);
  if (position > 0) chips.push("同功能区");
  if (era > 0) chips.push("时代重叠");
  if (parity > 0) chips.push("荣誉接近");
  if (statContrast >= 3) chips.push("打法冲突");
  if (special > 0) chips.push("无冠拷问");

  return (chips.length > 0 ? chips : ["争议热度"]).slice(0, 3);
}

function heat(score: number): string {
  if (score >= 42) return "99 HEAT";
  if (score >= 34) return "94 HEAT";
  if (score >= 26) return "88 HEAT";
  return "82 HEAT";
}

export function getRivalRecommendations(playerId: string, limit = 4): RivalRecommendation[] {
  const base = getPlayerById(playerId);
  return players
    .filter((player) => player.id !== playerId)
    .map((player) => {
      const edge = findEdge(base.id, player.id);
      const era = eraOverlapScore(base, player);
      const position = positionScore(base, player);
      const parity = legacyParityScore(base, player);
      const statContrast = statContrastScore(base, player);
      const special = specialTensionScore(base, player);
      const score = (
        (edge?.weight ?? 0) +
        era +
        position +
        parity +
        statContrast +
        debateFuelScore(base, player) +
        special
      );

      return {
        player,
        score: Math.round(score * 10) / 10,
        label: labelFor(edge, position, era, statContrast, special),
        heat: heat(score),
        reason: reasonFor(base, player, edge, position, era, statContrast, special),
        chips: chipsFor(edge, position, era, parity, statContrast, special),
        hasKnownEdge: Boolean(edge),
        legacy: legacyScore(player),
        order: PLAYER_ORDER.get(player.id) ?? 999,
      };
    })
    .sort((a, b) => (
      b.score - a.score ||
      Number(b.hasKnownEdge) - Number(a.hasKnownEdge) ||
      b.legacy - a.legacy ||
      a.order - b.order
    ))
    .slice(0, limit)
    .map((item) => ({
      player: item.player,
      score: Math.round(item.score),
      label: item.label,
      heat: item.heat,
      reason: item.reason,
      chips: item.chips,
    }));
}
