// ============================================================================
// Personality Analysis System — Multi-dimensional personality report
// based on voting patterns in a debate game.
//
// Architecture: matchup-agnostic. All matchup-specific knowledge lives in
// MATCHUP_CONFIGS. The analysis functions operate on generic vote arrays
// and derive everything from config lookups.
//
// Psychology dimension uses an original basketball-native taxonomy
// (not MBTI). Four axes capture distinctive fan/decision behavior:
//
//   AXIS A — 持球大核 vs 角色球员 (Hero / RolePlayer)
//     Hero-axis votes for own side → 持球大核 (hero ball mindset)
//     Team-axis preference → 角色球员 (system mindset)
//   AXIS B — 数据党 vs 情怀党 (Stat / Soul)
//     Stats-topic alignment → 数据党
//     Emotional-topic alignment → 情怀党
//   AXIS C — 头条派 vs 冷门派 (Headline / DeepCut)
//     Mainstream conformity → 头条派
//     Contrarian → 冷门派
//   AXIS D — 一城派 vs 冠军派 (HomeCity / RingChaser)
//     Loyalty to picked side → 一城派
//     Easy abandonment → 冠军派
//
// 16 type combinations each map to a real NBA player archetype / hupu meme
// (灵魂球员). Codes are short two-character Chinese tags, not MBTI letters.
// ============================================================================

import { getDebatesForMatchup } from "./debate-loader";

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface PhilosophyEvidence {
  /** 1-based round number */
  round: number;
  topicTitle: string;
  votedFor: string;        // displayed side name
  interpretation: string;  // 1-line take on this vote
}

export interface PhilosophyReport {
  school: string;            // e.g. "结果主义功利派"
  archetype: string;         // culturally resonant subtitle, e.g. "尼采式超人崇拜者"
  description: string;       // 3-4 sentences referencing actual votes
  quote: string;             // philosophical quote
  signatureMove: string;     // distinctive voting pattern label + 1-liner
  contradiction: string | null; // detected contradiction call-out, or null
  evidence: PhilosophyEvidence[];
  killerInsight: string;     // single-sentence ties philosophy + psychology together
}

/**
 * Basketball-native psychology report — two-layer system.
 *
 * Layer 1: a 4-letter code in BASKETBALL semantics (not MBTI). Letters:
 *   pos 1: O (Offense进攻派) / D (Defense防守派)
 *   pos 2: T (Talent天赋派) / W (Work努力派)
 *   pos 3: S (Super-team抱团派) / L (Loyalty一城派)
 *   pos 4: N (Numbers数据党) / E (Eye-test直觉党)
 *
 * Layer 2: each of the 16 codes maps to a named fan archetype with a
 * 灵魂球员 (soul player), emoji, tagline, and basketball-language
 * description / lifestyle sections.
 */
export interface PsychologyReport {
  /** Type key used internally by analyzePsychology (e.g. "持球大核-数据党-头条派-一城派") */
  type?: string;
  /** 4-letter code, e.g. "OTSE" — the wow-factor headline */
  code: string;
  /** Plain-language expansion of code, e.g. "进攻派·天赋派·抱团派·直觉党" */
  codeMeaning: string;
  /** Per-letter breakdown for UI — 4 entries */
  axes: {
    letter?: string;    // single uppercase letter (optional — Chinese-axis system omits)
    label: string;      // axis label e.g. "球场角色取向"
    value: string;      // chosen end e.g. "进攻派 (Offense)"
    explanation: string;
  }[];
  /** Memorable basketball archetype name, e.g. "好莱坞之子" */
  name: string;
  /** Emoji anchor for the card */
  emoji: string;
  /** NBA player who embodies this archetype */
  soulPlayer: string;
  /** 1-line tagline for the type */
  tagline: string;
  /** 3-5 basketball-flavored trait tags citing real votes where possible */
  traits: string[];
  /** 3-4 specific behavioral patterns concatenated */
  decisionStyle: string;
  /** 恋爱中的你 — basketball-language */
  inRelationship: string;
  /** 职场中的你 — basketball-language */
  atWork: string;
  /** Spirit-animal-style aside (not the soul player) */
  spiritAnimal: string;

  // ---- Legacy compatibility for older UI callers ----
  /** @deprecated — equals `inRelationship` */
  inLove: string;
}

export interface SpecificCall {
  topicId: string;
  topicTitle: string;
  userVoted: string;        // user's vote on this topic (slot id)
  expertSide: string;       // which side experts favor (slot id)
  verdict: "right" | "wrong" | "contrarian-correct" | "fell-for-misconception" | "close";
  analysis: string;         // one-line Chinese analysis
}

export interface PersonalityReport {
  philosophy: PhilosophyReport;
  psychology: PsychologyReport;
  basketballIQ: {
    score: number;          // 0-100 — overall basketball IQ
    grade: string;          // backward-compat alias of `level`
    level: string;          // canonical level label
    analysis: string;       // 1-2 sentence summary
    // --- Richer breakdown (v0.4) ---
    dataSense: number;      // 0-100 — alignment with statistical consensus
    eyeTest: number;        // 0-100 — alignment with popular-side calls
    contrarian: number;     // 0-100 — willingness to break from crowd correctly
    specificCalls: SpecificCall[]; // 2-3 notable picks with one-line analyses
  };
  overall: string;          // comprehensive narrative paragraph
}

// ---------------------------------------------------------------------------
// Expert consensus types — per-matchup, per-topic factual judgments
// ---------------------------------------------------------------------------
//
// CRITICAL slot mapping note:
//   For most matchups, playerA goes into the "kobe" slot, playerB → "lebron".
//   BUT lebron-vs-jordan is INVERTED:
//     - "lebron-vs-jordan": kobe slot = Jordan, lebron slot = LeBron
//     - "magic-vs-bird":    kobe slot = Magic,  lebron slot = Bird
//     - All others follow playerA → kobe slot.
//
// `expertSide` is whichever slot id holds the player favored by analytics/
// historical consensus. `popularSide` is who the crowd generally picks
// (gut/narrative answer) — used for contrarian/misconception scoring.

export type ConsensusConfidence = "strong" | "moderate" | "split";

export interface ConsensusEntry {
  /** Which slot id expert consensus favors. null = genuinely 50/50. */
  expertSide: string | null;
  /** How clear the consensus is. */
  confidence: ConsensusConfidence;
  /** One-sentence Chinese explanation of the factual basis. */
  keyEvidence: string;
  /** The popular-but-flawed take (one Chinese sentence). */
  commonMisconception: string;
  /** Which slot most fans/crowds tend to pick. null = even split. */
  popularSide: string | null;
}

// ---------------------------------------------------------------------------
// Matchup configuration types
// ---------------------------------------------------------------------------

type TopicCategory = "emotional" | "stats" | "mixed";
type TopicAxis = "hero" | "team";
/** Higher-order "tribe" a topic belongs to. Used for contradiction detection. */
type TopicTribe = "talent" | "effort" | "winning" | "loyalty" | "aesthetics" | "underdog";

interface TopicMeta {
  /** Which side expert consensus favors. Omitted = genuinely debatable. */
  consensus?: string;
  /** Emotional (heart) vs stats (data) vs mixed */
  category: TopicCategory;
  /** Individual-hero vs team-oriented lens. Omitted = neutral */
  axis?: TopicAxis;
  /** Map each side to the "tribe" voting that side signals. Used for contradiction detection. */
  tribeMap?: Record<string, TopicTribe>;
  /** Which side represents the underdog/non-consensus pick. */
  underdog?: string;
  /** Mainstream / popular pick (based on seeded global stats). */
  mainstream?: string;
}

interface MatchupConfig {
  /** Display labels per side identifier */
  sideLabels: Record<string, string>;
  /** Per-topic metadata for analysis */
  topics: Record<string, TopicMeta>;
}

// ---------------------------------------------------------------------------
// Matchup configs — extend this record for new matchups
// ---------------------------------------------------------------------------

const MATCHUP_CONFIGS: Record<string, MatchupConfig> = {
  "kobe-vs-lebron": {
    sideLabels: {
      kobe: "科比",
      lebron: "詹姆斯",
    },
    topics: {
      // --- Clear expert consensus ---
      rings: {
        consensus: "lebron", category: "stats", axis: "hero",
        tribeMap: { kobe: "loyalty", lebron: "winning" },
        underdog: "kobe", mainstream: "lebron",
      },
      mvp: {
        consensus: "lebron", category: "stats", axis: "hero",
        tribeMap: { kobe: "effort", lebron: "winning" },
        underdog: "kobe", mainstream: "lebron",
      },
      finals: {
        consensus: "lebron", category: "stats", axis: "hero",
        tribeMap: { kobe: "effort", lebron: "winning" },
        underdog: "kobe", mainstream: "lebron",
      },
      loyalty: {
        consensus: "kobe", category: "emotional", axis: "team",
        tribeMap: { kobe: "loyalty", lebron: "winning" },
        underdog: "lebron", mainstream: "kobe",
      },
      goat: {
        consensus: "lebron", category: "stats", axis: "hero",
        tribeMap: { kobe: "aesthetics", lebron: "winning" },
        underdog: "kobe", mainstream: "lebron",
      },

      // --- Genuinely debatable (no IQ penalty) ---
      clutch: {
        category: "emotional", axis: "hero",
        tribeMap: { kobe: "effort", lebron: "winning" },
        underdog: "lebron", mainstream: "kobe",
      },
      skill: {
        category: "mixed", axis: "hero",
        tribeMap: { kobe: "aesthetics", lebron: "winning" },
        underdog: "lebron", mainstream: "kobe",
      },
      mentality: {
        category: "emotional", axis: "hero",
        tribeMap: { kobe: "effort", lebron: "talent" },
        underdog: "lebron", mainstream: "kobe",
      },
      defense: {
        category: "mixed", axis: "hero",
        tribeMap: { kobe: "effort", lebron: "talent" },
        underdog: "lebron", mainstream: "kobe",
      },
      era: {
        category: "mixed", axis: "team",
        tribeMap: { kobe: "aesthetics", lebron: "winning" },
        underdog: "lebron", mainstream: "kobe",
      },
      iconic: {
        category: "emotional", axis: "hero",
        tribeMap: { kobe: "aesthetics", lebron: "winning" },
        underdog: "lebron", mainstream: "kobe",
      },
      teammates: {
        category: "stats", axis: "team",
        tribeMap: { kobe: "loyalty", lebron: "winning" },
        underdog: "lebron", mainstream: "kobe",
      },

      // Bonus "What If" topics — all debatable
      whatif_swap: { category: "mixed", axis: "team" },
      whatif_era:  { category: "mixed", axis: "hero" },
      whatif_1v1:  { category: "mixed", axis: "hero" },
    },
  },
};

const DEFAULT_MATCHUP = "kobe-vs-lebron";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getConfig(matchupId?: string): MatchupConfig | null {
  return MATCHUP_CONFIGS[matchupId ?? DEFAULT_MATCHUP] ?? null;
}

function sideLabel(config: MatchupConfig | null, side: string): string {
  return config?.sideLabels[side] ?? side;
}

function otherSide(config: MatchupConfig | null, side: string): string {
  if (!config) return "对手";
  const sides = Object.keys(config.sideLabels);
  return sides.find((s) => s !== side) ?? "对手";
}

function buildTitleMap(matchupId?: string): Map<string, string> {
  const map = new Map<string, string>();
  try {
    const { main, bonus } = getDebatesForMatchup(matchupId ?? null);
    for (const t of [...main, ...bonus]) {
      map.set(t.id, t.title);
    }
  } catch {
    // ignore — fallback to ids
  }
  return map;
}

// ---------------------------------------------------------------------------
// Dimension 1: Philosophy (哲学倾向)
// ---------------------------------------------------------------------------

interface PhiloInput {
  emotionalOwnRate: number;
  statsOwnRate: number;
  loyalty: number;
  underdogPickRate: number;
  underdogVotes: number;
  tribeCounts: Record<TopicTribe, number>;
  evidenceVotes: PhilosophyEvidence[];
  contradictionLine: string | null;
  sideName: string;
  otherName: string;
}

const PHILO_QUOTES: Record<string, string> = {
  功利主义: "边沁说过：最大多数人的最大幸福。你的幸福就是赢。",
  浪漫主义: "尼采说：没有音乐，生命将是一个错误。没有美感的篮球，对你来说也是。",
  斯多葛主义: "马可奥勒留说：你有力量承受这一切。你确实在承受——承受自己偶像数据不如人的事实。",
  存在主义: "萨特说：人是被判定为自由的。你用投票证明了这一点——连自己选的阵营都敢背叛。",
};

const PHILO_ARCHETYPES: Record<string, string[]> = {
  功利主义: ["尼采式超人崇拜者", "韩非式结果论者", "孙子兵法实战派", "黑格尔历史正确派"],
  浪漫主义: ["庄子式逍遥派", "李白式诗酒英雄", "屈原式悲剧美学家", "村上春树式仪式感信徒"],
  斯多葛主义: ["王阳明式知行者", "苏轼式豁达执拗派", "陶渊明式归隐忠诚客", "罗马军团式残兵"],
  存在主义: ["苏格拉底式怀疑者", "加缪式荒诞英雄", "鲁迅式独行者", "竹林七贤式反骨"],
};

function pickArchetype(school: string, seed: number): string {
  const list = PHILO_ARCHETYPES[school] ?? ["未命名流派"];
  return list[seed % list.length] ?? list[0]!;
}

function analyzePhilosophy(input: PhiloInput): PhilosophyReport {
  const {
    statsOwnRate, emotionalOwnRate, loyalty, underdogPickRate, underdogVotes,
    tribeCounts, evidenceVotes, contradictionLine, sideName, otherName,
  } = input;

  let schoolKey: string;
  let school: string;

  if (statsOwnRate >= 0.6 && loyalty >= 0.65) {
    schoolKey = "功利主义";
    school = "结果主义功利派";
  } else if (emotionalOwnRate >= 0.6 && loyalty >= 0.5) {
    schoolKey = "浪漫主义";
    school = "感性浪漫主义者";
  } else if (statsOwnRate < 0.5 && loyalty >= 0.6) {
    schoolKey = "斯多葛主义";
    school = "理性斯多葛派";
  } else {
    schoolKey = "存在主义";
    school = "自由存在主义者";
  }

  const archetypeSeed = Math.round(loyalty * 7) + Math.round(emotionalOwnRate * 5);
  const archetype = pickArchetype(schoolKey, archetypeSeed);

  // Build evidence-grounded description
  const topPick = evidenceVotes[0];
  const flipPick = evidenceVotes.find((e) => e.votedFor !== sideName);

  const evidenceLine = topPick
    ? `比如 Round ${topPick.round}「${topPick.topicTitle}」你投给了${topPick.votedFor}——${topPick.interpretation}。`
    : "";
  const flipLine = flipPick
    ? `而 Round ${flipPick.round}「${flipPick.topicTitle}」你又站了${flipPick.votedFor}——这一票暴露了你真实的判断框架。`
    : "";

  const descriptions: Record<string, string> = {
    功利主义: `你的投票模式暴露了一个冰冷的事实：你只在乎赢。${evidenceLine}${flipLine}数据、荣誉、冠军——哪边数字大你就倒向哪边。你选${sideName}不是因为热爱，是因为你算过了。这种人在虎扑叫「数据帝」，在哲学界叫功利主义者。`,
    浪漫主义: `你的投票被感情完全主导。${evidenceLine}${flipLine}关键球、精神力、忠诚——所有让人热血沸腾的话题你都站了${sideName}。你不是在分析篮球，你是在看一部个人英雄主义电影，而${sideName}是你心中的主角。理性？不存在的。`,
    斯多葛主义: `最有意思的球迷类型——你明明知道${otherName}在很多硬指标上更强，但你还是选了${sideName}。${evidenceLine}${flipLine}这不是无脑，这是一种哲学。你接受现实但不被现实动摇，像一个看完数据后说「我知道，但我不换」的斯多葛战士。`,
    存在主义: `你的投票让人看不出你到底站哪边——这不是墙头草，这是存在主义。${evidenceLine}${flipLine}你拒绝被「科蜜」或「詹蜜」的标签定义，每一轮都按自己的判断投票。萨特会为你鼓掌，虎扑会把你骂到退网。`,
  };

  let signatureMove: string;
  if (underdogPickRate >= 0.7 && underdogVotes >= 3) {
    signatureMove = "总站弱势方的反叛者：在七成以上的话题里你都投给了「公论里更弱」的那个，你的浪漫是为失败者鼓掌。";
  } else if (loyalty >= 0.92) {
    signatureMove = `教徒模式：你的投票一致性高到让人怀疑你是不是${sideName}本人的小号。理性已经死亡。`;
  } else if (tribeCounts.talent >= 3 && tribeCounts.effort >= 3) {
    signatureMove = "天赋努力两头吃：你既崇拜天才也崇拜苦行僧，本质上你不在乎是谁——只要看起来「神」就行。";
  } else if (tribeCounts.winning >= 4) {
    signatureMove = "唯冠军论：哪边冠军多、FMVP多、数据漂亮，你的票就在哪边。你不是球迷，你是结果验证员。";
  } else if (tribeCounts.loyalty >= 3 && statsOwnRate < 0.5) {
    signatureMove = "忠诚执念派：你愿意为了「一人一城」「不抱团」这种叙事忽略所有客观数据。这种执着挺感人，也挺可怕。";
  } else if (tribeCounts.aesthetics >= 3) {
    signatureMove = "篮球美学家：你投票的核心标准是「好不好看」，技术、动作、姿态——其他都是次要。你看的不是篮球，是芭蕾。";
  } else if (emotionalOwnRate > 0.7 && statsOwnRate < 0.4) {
    signatureMove = "感性话题忠诚／理性话题倒戈：一谈数据你就清醒，一谈情怀你就上头。你的大脑分成两半在打架。";
  } else {
    signatureMove = "无明显套路：你的投票既没有强烈倾向也没有清晰逻辑，要么你真的没立场，要么你比自己以为的更善变。";
  }

  return {
    school,
    archetype,
    description: descriptions[schoolKey] ?? descriptions.功利主义!,
    quote: PHILO_QUOTES[schoolKey] ?? PHILO_QUOTES.功利主义!,
    signatureMove,
    contradiction: contradictionLine,
    evidence: evidenceVotes.slice(0, 3),
    killerInsight: "",
  };
}

// ---------------------------------------------------------------------------
// Dimension 2: Psychology (心理画像) — 4-letter basketball code (NOT MBTI)
// ---------------------------------------------------------------------------

/**
 * 4 axes, each one binary letter. Letters chosen because they actually
 * mean something in basketball:
 *   pos 1  O (Offense)     vs  D (Defense)
 *   pos 2  T (Talent)      vs  W (Work)
 *   pos 3  S (Super-team)  vs  L (Loyalty)
 *   pos 4  N (Numbers)     vs  E (Eye-test)
 *
 * 16 combinations → 16 named archetypes with 灵魂球员 + emoji.
 */

type LetterO = "O" | "D";
type LetterT = "T" | "W";
type LetterS = "S" | "L";
type LetterN = "N" | "E";

// Axis literal types used by analyzePsychology (4-axis Chinese-name system)
type AxisA = "持球大核" | "角色球员";
type AxisB = "数据党" | "情怀党";
type AxisC = "头条派" | "冷门派";
type AxisD = "一城派" | "冠军派";

interface BasketballType {
  name: string;
  emoji: string;
  soulPlayer: string;
  tagline: string;
}

/**
 * Lookup key format: `${A}-${B}-${C}-${D}`
 * 16 total combinations — each maps to a distinct fan archetype.
 */
const TYPE_TABLE: Record<string, BasketballType> = {
  // 持球大核 × 数据党 × ...
  "持球大核-数据党-头条派-一城派": {
    name: "曼巴信徒",
    emoji: "🐍",
    soulPlayer: "科比·布莱恩特",
    tagline: "数据、传奇、一人一城——你信的不是篮球，是教科书。",
  },
  "持球大核-数据党-头条派-冠军派": {
    name: "总冠军绑定者",
    emoji: "💍",
    soulPlayer: "凯文·杜兰特",
    tagline: "你只信冠军，谁赢你就成为谁的人——KD路线的真信徒。",
  },
  "持球大核-数据党-冷门派-一城派": {
    name: "数据极客",
    emoji: "📊",
    soulPlayer: "尼古拉·约基奇",
    tagline: "Win Shares、BPM、True Shooting——你看球像看财报，且你只爱低估值股票。",
  },
  "持球大核-数据党-冷门派-冠军派": {
    name: "总经理思维",
    emoji: "🧠",
    soulPlayer: "萨姆·普雷斯蒂",
    tagline: "你像 GM 一样看球：长远价值、资产管理、合同效率。情怀？砸盘信号。",
  },
  "持球大核-情怀党-头条派-一城派": {
    name: "情怀守门员",
    emoji: "🕯️",
    soulPlayer: "德克·诺维茨基",
    tagline: "你不是在投票，你是在守一段记忆——任何数据都打不动你。",
  },
  "持球大核-情怀党-头条派-冠军派": {
    name: "Bandwagon 跟风党",
    emoji: "🚌",
    soulPlayer: "勒布朗·詹姆斯（迁徙版）",
    tagline: "谁夺冠粉谁，今年的T恤明年就压箱底——你不否认，你只是「喜欢赢家」。",
  },
  "持球大核-情怀党-冷门派-一城派": {
    name: "底层逆袭信徒",
    emoji: "🥊",
    soulPlayer: "阿伦·艾弗森",
    tagline: "你为悲剧英雄掉过眼泪——身高1米83的勇气比任何数据都重。",
  },
  "持球大核-情怀党-冷门派-冠军派": {
    name: "黑马猎人",
    emoji: "🐎",
    soulPlayer: "贾马尔·穆雷",
    tagline: "你押注没人看好的那个，他赢了你就成神，他输了你假装没发过推。",
  },
  // 角色球员 × ...
  "角色球员-数据党-头条派-一城派": {
    name: "体系篮球美学家",
    emoji: "🎼",
    soulPlayer: "蒂姆·邓肯",
    tagline: "你信体系、信传切、信「正确的篮球」——任何单打都让你皱眉。",
  },
  "角色球员-数据球-头条派-冠军派": {
    name: "勇士小球信徒",
    emoji: "🌊",
    soulPlayer: "斯蒂芬·库里（无球版）",
    tagline: "你信化学反应、空间、跑位——一个英雄打死所有人？过时了。",
  },
  "角色球员-数据党-头条派-冠军派": {
    name: "勇士小球信徒",
    emoji: "🌊",
    soulPlayer: "斯蒂芬·库里（无球版）",
    tagline: "你信化学反应、空间、跑位——一个英雄打死所有人？过时了。",
  },
  "角色球员-数据党-冷门派-一城派": {
    name: "蓝领指标党",
    emoji: "🔧",
    soulPlayer: "德雷蒙德·格林",
    tagline: "你专挑别人不看的统计项（防守效率、+/-、二次助攻）——你比球评更懂球队怎么赢。",
  },
  "角色球员-数据党-冷门派-冠军派": {
    name: "总冠军拼图猎人",
    emoji: "🧩",
    soulPlayer: "罗伯特·霍利",
    tagline: "你看的是「这块拼图能不能让冠军成立」——巨星无用，能合适就行。",
  },
  "角色球员-情怀党-头条派-一城派": {
    name: "OG 守旧派",
    emoji: "📼",
    soulPlayer: "查尔斯·巴克利",
    tagline: "「现在的篮球都是垃圾」——你嘴上这么说，但每场都还在看。",
  },
  "角色球员-情怀党-头条派-冠军派": {
    name: "全队信徒",
    emoji: "🛡️",
    soulPlayer: "马努·吉诺比利",
    tagline: "你信团队荣耀高于一切——巨星单飞夺冠？你不屑，你只投给「整体」。",
  },
  "角色球员-情怀党-冷门派-一城派": {
    name: "悲剧美学派",
    emoji: "🌧️",
    soulPlayer: "特雷西·麦克格雷迪",
    tagline: "你爱的人都输得很惨——你不是不懂赢，你是觉得输得漂亮才动人。",
  },
  "角色球员-情怀党-冷门派-冠军派": {
    name: "嘴炮型球迷",
    emoji: "🗣️",
    soulPlayer: "德雷蒙德·格林（场外版）",
    tagline: "杠就完事了——你不是来分析的，你是来打嘴炮的。虎扑老哥本哥。",
  },
};

const FALLBACK_TYPE: BasketballType = {
  name: "薛定谔球迷",
  emoji: "🌀",
  soulPlayer: "拉沙德·刘易斯",
  tagline: "你的组合罕见到系统也分不清你站哪边——观测前你既忠又叛。",
};

export type { BasketballType };

/** Look up the archetype card for a quiz-computed code like "持球大核-数据党-冷门派-一城派". */
export function lookupBasketballType(code: string): BasketballType {
  return TYPE_TABLE[code] ?? FALLBACK_TYPE;
}

interface PsychInput {
  emotionalOwnRate: number;
  statsOwnRate: number;
  heroOwnRate: number;
  teamOwnRate: number;
  loyalty: number;
  elapsedSeconds: number;
  totalVotes: number;
  mainstreamRate: number;
  mainstreamScored: number;
  evidenceVotes: PhilosophyEvidence[];
  highLoyaltyTopic: PhilosophyEvidence | null;
  flipTopic: PhilosophyEvidence | null;
  sideName: string;
  otherName: string;
  configKnown: boolean;
}

function analyzePsychology(input: PsychInput): PsychologyReport {
  const {
    emotionalOwnRate, statsOwnRate, heroOwnRate, teamOwnRate, loyalty,
    elapsedSeconds, totalVotes, mainstreamRate, mainstreamScored,
    highLoyaltyTopic, flipTopic, sideName, otherName, configKnown,
  } = input;

  // --- Axis A: 持球大核 vs 角色球员 ---
  // Hero rate vs team rate. Tie → fall back to whether they value emotional one-man-show topics
  let axisA: AxisA;
  if (heroOwnRate > teamOwnRate + 0.05) axisA = "持球大核";
  else if (teamOwnRate > heroOwnRate + 0.05) axisA = "角色球员";
  else axisA = emotionalOwnRate >= 0.5 ? "持球大核" : "角色球员";

  // --- Axis B: 数据党 vs 情怀党 ---
  const axisB: AxisB = statsOwnRate > emotionalOwnRate ? "数据党" : "情怀党";

  // --- Axis C: 头条派 vs 冷门派 ---
  let axisC: AxisC;
  if (mainstreamScored >= 3) {
    axisC = mainstreamRate >= 0.55 ? "头条派" : "冷门派";
  } else {
    axisC = loyalty >= 0.6 ? "头条派" : "冷门派";
  }

  // --- Axis D: 一城派 vs 冠军派 ---
  const axisD: AxisD = loyalty >= 0.65 ? "一城派" : "冠军派";

  const typeKey = `${axisA}-${axisB}-${axisC}-${axisD}`;
  const archetype = TYPE_TABLE[typeKey] ?? FALLBACK_TYPE;

  const secsPerVote = totalVotes > 0 ? elapsedSeconds / totalVotes : 10;

  // --- Axis breakdowns (for UI rendering) ---
  const axes: PsychologyReport["axes"] = [
    {
      label: "进攻哲学",
      value: axisA,
      explanation: axisA === "持球大核"
        ? `你投票时偏爱"个人英雄"叙事——${Math.round(heroOwnRate * 100)}%的英雄类话题你都站了${sideName}`
        : `你投票时偏爱"团队拼图"叙事——团队话题里你${Math.round(teamOwnRate * 100)}%站${sideName}`,
    },
    {
      label: "判断依据",
      value: axisB,
      explanation: axisB === "数据党"
        ? `理性话题你的命中率(${Math.round(statsOwnRate * 100)}%)高于情绪话题(${Math.round(emotionalOwnRate * 100)}%)——数字说话`
        : `情绪话题你的投入度(${Math.round(emotionalOwnRate * 100)}%)高于数据话题(${Math.round(statsOwnRate * 100)}%)——情感优先`,
    },
    {
      label: "舆论关系",
      value: axisC,
      explanation: mainstreamScored >= 3
        ? (axisC === "头条派"
            ? `${Math.round(mainstreamRate * 100)}%的票跟随主流——你信群众的眼睛`
            : `${Math.round(mainstreamRate * 100)}%跟主流，逆主流为主——大众越一边倒你越警惕`)
        : (axisC === "头条派"
            ? "你倾向于跟集体走，懒得对抗大众"
            : "你天生有逆反心理，看见所有人都同意一件事就开始怀疑"),
    },
    {
      label: "忠诚模式",
      value: axisD,
      explanation: axisD === "一城派"
        ? `${Math.round(loyalty * 100)}%的票给${sideName}——你认定了就不挪窝，Dirk式忠诚`
        : `只有${Math.round(loyalty * 100)}%给${sideName}——剩下都跑去${otherName}，你比你自己以为的更"冠军派"`,
    },
  ];

  // --- Traits ---
  const traits: string[] = [];

  if (loyalty >= 0.9 && highLoyaltyTopic) {
    traits.push(`盲信型铁粉：连「${highLoyaltyTopic.topicTitle}」这种本该犹豫的话题你都没换边`);
  } else if (loyalty >= 0.65) {
    traits.push(`理性主队球迷：大部分站${sideName}${flipTopic ? `，但 Round ${flipTopic.round}「${flipTopic.topicTitle}」你诚实地把票给了${flipTopic.votedFor}` : ""}`);
  } else if (loyalty >= 0.4) {
    traits.push(`独立选手：${Math.round(loyalty * 100)}%站${sideName}，剩下都跑去对面——拒绝被阵营定义`);
  } else {
    traits.push(`反骨派：选了${sideName}却把多数票投给${otherName}——你的叛逆比你的球商更突出`);
  }

  if (secsPerVote < 5) {
    traits.push(`冲动出手型：平均每轮${Math.round(secsPerVote)}秒，快到让人怀疑你根本没读论点——投篮选择毫不犹豫`);
  } else if (secsPerVote > 20) {
    traits.push(`过度运球型：平均每轮${Math.round(secsPerVote)}秒，你做选择像在打24秒到底——决断力是你的短板`);
  } else {
    traits.push(`正常节奏型：平均${Math.round(secsPerVote)}秒/轮，至少读完了论点——在互联网球迷里已经算优秀`);
  }

  if (mainstreamScored >= 3) {
    if (mainstreamRate >= 0.75) {
      traits.push(`主流回音壁：${Math.round(mainstreamRate * 100)}%跟随大众——你是社交平台最爱的那种"理中客"`);
    } else if (mainstreamRate <= 0.35) {
      traits.push(`逆向投资者：${Math.round(mainstreamRate * 100)}%逆主流而投——你不是没看舆论，你是看了之后偏要反着来`);
    }
  }

  if (loyalty >= 0.9 && axisC === "头条派") {
    traits.push(`确认偏见重症：你只看支持自己观点的信息——跟你辩论等于跟回音壁说话`);
  } else if (axisC === "冷门派" && loyalty < 0.4) {
    traits.push(`反向投射型：嘴上站${sideName}，但每次都投${otherName}——你支持的不是球员，是「对立面」`);
  }

  // --- Decision style (3-4 specific patterns concatenated) ---
  const decisionPatterns: string[] = [];

  if (axisB === "情怀党" && secsPerVote < 5) {
    decisionPatterns.push("你的投票完全被情绪驱动，速度快到大脑来不及参与");
  } else if (axisB === "情怀党") {
    decisionPatterns.push("你内心感性但又想表现得理性，每一轮都在跟自己打架");
  } else if (axisB === "数据党" && secsPerVote < 5) {
    decisionPatterns.push("你用数据做判断但速度极快，像一台没有感情的投票机器");
  } else {
    decisionPatterns.push("你慢、冷静、用数据说话——你不是来玩游戏的，你是来做尽调的");
  }

  if (axisC === "冷门派") {
    decisionPatterns.push("你天生不信「主流」，看到大众一边倒就开始警惕");
  } else {
    decisionPatterns.push("你的判断高度参考集体共识，你信群众的眼睛");
  }

  if (axisD === "冠军派" && flipTopic) {
    decisionPatterns.push(`一旦对面话题占优你就跳船——比如「${flipTopic.topicTitle}」那票你毫不犹豫`);
  } else if (axisD === "一城派") {
    decisionPatterns.push(`一旦选定${sideName}，再多反例都很难撼动你`);
  }

  if (axisA === "持球大核") {
    decisionPatterns.push("你的投票模式像后卫持球：所有决定都要经过自己的手");
  } else {
    decisionPatterns.push("你像一个空间型角色球员：投票时优先看「这个选择对整体逻辑是否成立」");
  }

  const decisionStyle = decisionPatterns.join("；") + "。";

  // --- Lifestyle sections ---
  const lifeInput: LifeInput = {
    axisA, axisB, axisC, axisD,
    flipTopic, highLoyaltyTopic, configKnown, sideName, otherName,
  };

  const inRelationship = buildInRelationship(lifeInput);
  const atWork = buildAtWork(lifeInput);
  const spiritAnimal = buildSpiritAnimal(lifeInput);

  return {
    type: typeKey,
    name: archetype.name,
    emoji: archetype.emoji,
    soulPlayer: archetype.soulPlayer,
    tagline: archetype.tagline,
    axes,
    traits,
    decisionStyle,
    inRelationship,
    atWork,
    spiritAnimal,
    // Backwards-compatible legacy fields
    code: `${archetype.emoji} ${archetype.name}`,
    codeMeaning: archetype.tagline,
    inLove: inRelationship,
  };
}

interface LifeInput {
  axisA: AxisA;
  axisB: AxisB;
  axisC: AxisC;
  axisD: AxisD;
  flipTopic: PhilosophyEvidence | null;
  highLoyaltyTopic: PhilosophyEvidence | null;
  configKnown: boolean;
  sideName: string;
  otherName: string;
}

function buildInRelationship(i: LifeInput): string {
  const flipRef = i.flipTopic ? `——就像「${i.flipTopic.topicTitle}」那票你说跑就跑` : "";
  const heroFlavor = i.axisA === "持球大核" ? "在感情里你也要球权" : "在感情里你愿意做配角";
  const dataFlavor = i.axisB === "数据党" ? "约会前会比 ROI" : "约会全凭一时心动";

  if (i.axisD === "一城派" && i.axisB === "情怀党") {
    return `${heroFlavor}，认定了就死守。Dirk 式忠诚，但伴侣得忍受你的情绪化——你的爱来得猛，吵架也一样。`;
  }
  if (i.axisD === "一城派" && i.axisB === "数据党") {
    return `${heroFlavor}，${dataFlavor}。一旦认定你就长期持有——但你的关系经常被「对方哭你递纸巾然后继续讲道理」这一幕摧毁。`;
  }
  if (i.axisD === "冠军派" && i.axisB === "情怀党") {
    return `你的爱像 KD 转会——感觉对就跳，感觉淡了就走${flipRef}。你需要的不是某个人，而是「心动的感觉」。`;
  }
  return `${heroFlavor}，${dataFlavor}——每段关系你都在评估"换队"的可能性${flipRef}。你的关系大多在3个月内被你自己「优化」掉。`;
}

function buildAtWork(i: LifeInput): string {
  const role = i.axisA === "持球大核"
    ? "你想做团队里那个持球大核——所有决定都得过你手"
    : "你甘做体系拼图——但你抱怨自己被低估的频率比谁都高";
  const stance = i.axisC === "冷门派"
    ? "你天生看不上「主流方案」，开会经常一个人投反对票"
    : "你跟主流走，信集体智慧——升职最快的方式是别太冒头";
  const loyalty = i.axisD === "一城派"
    ? "对老板/团队忠诚度极高，离职都得纠结半年"
    : "你随时准备跳槽，公司也别对你抱太大期望——你是「冠军派」，谁能让你赢你就跟谁";
  return `${role}。${stance}。${loyalty}。`;
}

function buildSpiritAnimal(i: LifeInput): string {
  const key = `${i.axisA}-${i.axisB}-${i.axisC}-${i.axisD}`;
  const animals: Record<string, string> = {
    "持球大核-数据党-头条派-一城派": "孤狼——独行、精准、咬定就不松口",
    "持球大核-数据党-头条派-冠军派": "鲨鱼——追逐血腥味，永远朝赢的方向游",
    "持球大核-数据党-冷门派-一城派": "猫头鹰——夜里独自看数据，白天对所有人不屑",
    "持球大核-数据党-冷门派-冠军派": "黑天鹅——所有人都没预测到你，包括你自己",
    "持球大核-情怀党-头条派-一城派": "金毛犬——热情、忠诚、看见喜欢的就摇尾巴",
    "持球大核-情怀党-头条派-冠军派": "蜂鸟——心跳极快，永远在追下一朵花",
    "持球大核-情怀党-冷门派-一城派": "野马——为自由奔跑，认定方向就一路狂奔",
    "持球大核-情怀党-冷门派-冠军派": "猴子——好奇、反叛、永远不在原地",
    "角色球员-数据党-头条派-一城派": "乌龟——慢、稳、活得长",
    "角色球员-数据党-头条派-冠军派": "海豚——聪明、敏捷、容易换池子",
    "角色球员-数据党-冷门派-一城派": "黑猫——独立、警觉、对群体兴趣不大",
    "角色球员-数据党-冷门派-冠军派": "豹子——快、独行、目标永远在变",
    "角色球员-情怀党-头条派-一城派": "天鹅——慢慢爱上一个人然后一辈子",
    "角色球员-情怀党-头条派-冠军派": "兔子——多疑、敏感、跑得纠结",
    "角色球员-情怀党-冷门派-一城派": "孤雁——长途独飞，落地就不再起飞",
    "角色球员-情怀党-冷门派-冠军派": "幽灵章鱼——感性、敏锐、变色、最后消失在深海",
  };
  return animals[key] ?? "薛定谔的猫——你存在的方式取决于谁在看你";
}

// ---------------------------------------------------------------------------
// Contradiction detection
// ---------------------------------------------------------------------------

interface Contradiction {
  line: string;
}

function detectContradictions(
  votes: { topicId: string; winner: string }[],
  topicsMeta: Record<string, TopicMeta>,
  titleMap: Map<string, string>,
): Contradiction | null {
  const tribePicks: Record<string, { round: number; title: string; winner: string }[]> = {};

  votes.forEach((v, i) => {
    const meta = topicsMeta[v.topicId];
    if (!meta?.tribeMap) return;
    const tribe = meta.tribeMap[v.winner];
    if (!tribe) return;
    if (!tribePicks[tribe]) tribePicks[tribe] = [];
    tribePicks[tribe]!.push({
      round: i + 1,
      title: titleMap.get(v.topicId) ?? v.topicId,
      winner: v.winner,
    });
  });

  if ((tribePicks.talent?.length ?? 0) >= 1 && (tribePicks.effort?.length ?? 0) >= 1) {
    const t = tribePicks.talent![0]!;
    const e = tribePicks.effort![0]!;
    return {
      line: `🚨 矛盾检测：你在 Round ${e.round}「${e.title}」站了「努力派」，又在 Round ${t.round}「${t.title}」站了「天赋派」。你嘴上崇拜苦行僧，但每次关键票都给天才——你比自己以为的更精英主义。`,
    };
  }

  if ((tribePicks.loyalty?.length ?? 0) >= 1 && (tribePicks.winning?.length ?? 0) >= 2) {
    const l = tribePicks.loyalty![0]!;
    const w = tribePicks.winning![0]!;
    return {
      line: `🚨 矛盾检测：你在 Round ${l.round}「${l.title}」投了「忠诚派」，却在 Round ${w.round}「${w.title}」站了「赢家派」。忠诚听起来很美，赢家面前你妥协得也很快。`,
    };
  }

  if ((tribePicks.aesthetics?.length ?? 0) >= 2 && (tribePicks.winning?.length ?? 0) >= 2) {
    const a = tribePicks.aesthetics![0]!;
    const w = tribePicks.winning![0]!;
    return {
      line: `🚨 矛盾检测：你既要美感（Round ${a.round}「${a.title}」）又要胜利（Round ${w.round}「${w.title}」）——顶级竞技场上这两个常常不能共存，你的标准会让你两头都拿不到。`,
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Dimension 3: Basketball IQ (懂球指数) — REWRITTEN in v0.4
// ---------------------------------------------------------------------------
//
// Now driven by EXPERT_CONSENSUS (per-matchup, per-topic factual data) rather
// than only the old MATCHUP_CONFIGS consensus field. This gives matchup-
// specific evidence sentences, contrarian-vs-misconception detection, and
// 7-tier leveling gated by score AND minimum strong-confidence correct picks.

export const EXPERT_CONSENSUS: Record<string, Record<string, ConsensusEntry>> = {
  // ─────────────────────────────────────────────────────────────────────
  // Kobe vs LeBron — kobe slot = Kobe, lebron slot = LeBron
  // ─────────────────────────────────────────────────────────────────────
  "kobe-vs-lebron": {
    rings: {
      expertSide: "kobe",
      confidence: "moderate",
      keyEvidence: "科比5冠 vs 詹姆斯4冠——单论戒指数量科比领先；尽管詹姆斯4个FMVP > 科比2个FMVP，原始冠军数仍是更通用的判定标准。",
      commonMisconception: "「詹姆斯4个FMVP代表他独当一面，科比3冠是给奥尼尔打工」——FMVP差距是真的，但戒指数本身科比仍多一个。",
      popularSide: "kobe",
    },
    mvp: {
      expertSide: "lebron",
      confidence: "strong",
      keyEvidence: "詹姆斯4 MVP vs 科比1 MVP——MVP投票是常规赛全面性的最强单一指标，4比1没争议。",
      commonMisconception: "「科比06年场均35.4分，联盟欠他5个MVP」——情怀叙事，事实是球队战绩差导致MVP票低，这是规则不是阴谋。",
      popularSide: "lebron",
    },
    finals: {
      expertSide: "lebron",
      confidence: "strong",
      keyEvidence: "总决赛累计场均：詹姆斯28.4/10.2/7.8 vs 科比25.3/5.1/4.7——三项全面领先，且詹姆斯进了10次总决赛 vs 科比7次。",
      commonMisconception: "「詹姆斯总决赛输了6次，科比5-2更稳」——胜率确实科比高，但场均产出和进入总决赛的次数詹姆斯都更强。",
      popularSide: "kobe",
    },
    loyalty: {
      expertSide: "kobe",
      confidence: "strong",
      keyEvidence: "科比20年单队 vs 詹姆斯效力过4支球队——「一城一队」叙事数据上压倒性属于科比。",
      commonMisconception: "「2016年詹姆斯回克利夫兰兑现承诺，更难更值得」——情怀剧本好看，但严格意义上的「忠诚」指标仍是单队时长。",
      popularSide: "kobe",
    },
    goat: {
      expertSide: "lebron",
      confidence: "moderate",
      keyEvidence: "2024年以后主流排名（ESPN、The Athletic、球员投票）詹姆斯几乎全部排在科比之前——历史地位主流共识倾向詹姆斯。",
      commonMisconception: "「科比更接近乔丹模板所以更接近GOAT」——GOAT的衡量标准是产出和历史地位，不是和乔丹的相似度。",
      popularSide: "kobe",
    },
    clutch: {
      expertSide: "lebron",
      confidence: "moderate",
      keyEvidence: "「Clutch」按现代定义（最后5分钟分差5以内）詹姆斯效率全面领先；科比关键时刻投篮命中率约32-39%，并未显著优于联盟平均。",
      commonMisconception: "「最后一秒球给科比最稳」——叙事比数据强；科比关键球命中率实际处于「英雄球高出手低效率」区间。",
      popularSide: "kobe",
    },
    skill: {
      expertSide: "kobe",
      confidence: "moderate",
      keyEvidence: "技术武器库广度（后仰跳投种类、低位脚步、中距离）科比公认领先；詹姆斯效率更高但更依赖身体。技术细腻度科比胜。",
      commonMisconception: "「詹姆斯什么都能做所以技术更全面」——「全面」≠「精细」。詹姆斯是全能性领先，科比是技术精细度领先。",
      popularSide: "kobe",
    },
    mentality: {
      expertSide: null,
      confidence: "split",
      keyEvidence: "「曼巴精神」vs 詹姆斯22年保持顶级状态——两种竞技精神的具体定义不同，没有统一指标可比较。",
      commonMisconception: "把「受伤还在打」和「22年自律保养」放在同一个轴上比较——这两件事根本不在同一个维度。",
      popularSide: "kobe",
    },
    defense: {
      expertSide: "lebron",
      confidence: "moderate",
      keyEvidence: "詹姆斯巅峰期防守正负值常年联盟前列，且能换防1-5号位；科比9次防守一阵但其中后期为名声票，实际防守效率指标詹姆斯更优。",
      commonMisconception: "「科比9次防守一阵 = 历史级防守者」——防守一阵是媒体投的，对照RAPM等高阶数据时科比并不顶级。",
      popularSide: "kobe",
    },
    era: {
      expertSide: null,
      confidence: "split",
      keyEvidence: "时代影响力很难单一量化——科比的精神感召 vs 詹姆斯的商业+社会影响，两条不同维度。",
      commonMisconception: "「科比影响力 = 球迷哭得多」或「詹姆斯影响力 = 赚得多」——都只是单一指标。",
      popularSide: null,
    },
    iconic: {
      expertSide: null,
      confidence: "split",
      keyEvidence: "81分 vs 2016 G7翻盘——两类高光含金量不同：常规赛刷分极限 vs 季后赛逆转历史，按口味选。",
      commonMisconception: "把不同情境的高光直接比谁更「经典」——这是主观偏好问题。",
      popularSide: null,
    },
    teammates: {
      expertSide: "lebron",
      confidence: "moderate",
      keyEvidence: "詹姆斯多次扛烂阵容进总决赛（07骑士、18骑士）；科比绝大多数夺冠期身边有鲨鱼/加索尔级别球星。「队友难度」詹姆斯更高。",
      commonMisconception: "「詹姆斯抱团 = 队友更强」——他在迈阿密之外的多数时期独自带烂队，「抱团时期」只是生涯一段。",
      popularSide: "kobe",
    },
    whatif_swap: {
      expertSide: null, confidence: "split",
      keyEvidence: "What-if假设——没有事实答案。",
      commonMisconception: "把假设当作有标准答案的题目——没有。",
      popularSide: null,
    },
    whatif_era: {
      expertSide: null, confidence: "split",
      keyEvidence: "跨时代假设——所有答案都是推测。",
      commonMisconception: "认为「时代越早越硬 = 球员越强」或反之——都是简化叙事。",
      popularSide: null,
    },
    whatif_1v1: {
      expertSide: null, confidence: "split",
      keyEvidence: "1v1是虚构场景——NBA从未有真实测试数据。",
      commonMisconception: "把电影画面当数据——你的1v1偏好就是你的情感偏好。",
      popularSide: null,
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  // Kobe vs Jordan — kobe slot = Kobe, lebron slot = Jordan
  // ─────────────────────────────────────────────────────────────────────
  "kobe-vs-jordan": {
    "goat-proximity": {
      expertSide: "lebron",
      confidence: "strong",
      keyEvidence: "乔丹6冠6FMVP5MVP10次得分王 vs 科比5冠2FMVP1MVP2次得分王——任何单项乔丹都领先；ESPN球员匿名投票58%选乔丹GOAT，11.9%选科比。",
      commonMisconception: "「科比是乔丹的进化版」——技术上有继承但任何荣誉/数据维度都没超过乔丹。",
      popularSide: "lebron",
    },
    rings: {
      expertSide: "lebron",
      confidence: "strong",
      keyEvidence: "乔丹6-0总决赛+6 FMVP——从未在最大舞台输过；科比5-2，含一次场均22分的04年总决赛失利。",
      commonMisconception: "「科比5冠也是两个王朝周期」——是的，但乔丹6-0完美率不可比。",
      popularSide: "lebron",
    },
    "skill-clone": {
      expertSide: "lebron",
      confidence: "moderate",
      keyEvidence: "科比承认大量动作来自模仿乔丹，乔丹生涯TS% 56.9% > 科比54.1%——同样动作乔丹效率更高，原版更优。",
      commonMisconception: "「科比加了三分线和蛇形突破所以是2.0」——他确实扩展了射程，但原版在效率和巅峰输出上仍领先。",
      popularSide: "lebron",
    },
    clutch: {
      expertSide: "lebron",
      confidence: "moderate",
      keyEvidence: "乔丹季后赛关键时刻命中率约40%+ vs 科比约33%；乔丹有98年总决赛绝杀爵士这种总决赛级别的关键球，科比的绝杀多在常规赛。",
      commonMisconception: "「科比绝杀数更多所以关键球更强」——数量包含常规赛低杠杆场景，乔丹的关键球质量（舞台和概率）都更高。",
      popularSide: "lebron",
    },
    defense: {
      expertSide: "lebron",
      confidence: "moderate",
      keyEvidence: "乔丹1个DPOY+9次防守一阵+场均2.3抢断 vs 科比0 DPOY+9次防守一阵+1.4抢断——同样的防守一阵次数，DPOY和抢断乔丹有硬指标领先。",
      commonMisconception: "「防守一阵次数相同 = 防守水平相同」——DPOY是更高的认证，乔丹有科比没有。",
      popularSide: "lebron",
    },
    era: {
      expertSide: "lebron",
      confidence: "moderate",
      keyEvidence: "乔丹时代NBA总决赛收视率峰值3590万 vs 科比时代2670万——商业上乔丹定义了整个全球化时代；同时他打的是hand-check时代防守强度更高。",
      commonMisconception: "「科比18次全明星 > 乔丹14次 = 统治力更持久」——乔丹中间两次退役不算赛季，按出战质量他效率碾压。",
      popularSide: "lebron",
    },
    mentality: {
      expertSide: null, confidence: "split",
      keyEvidence: "跟腱断了罚完球 vs 流感之战38分——两种极端意志力的经典画面，没有统一标尺。",
      commonMisconception: "用一个画面判定一个人20年职业生涯的精神力——都是片段。",
      popularSide: null,
    },
    aesthetics: {
      expertSide: "lebron",
      confidence: "moderate",
      keyEvidence: "乔丹罚球线扣篮、空中漂移滞空、动作开创性公认是NBA「美学原型」——科比的动作大部分被定义为「乔丹2.0」。原创度乔丹胜。",
      commonMisconception: "「科比的后仰角度更大 = 美学超越」——这是细节优化，不改变原创者地位。",
      popularSide: "lebron",
    },
    "cultural-impact": {
      expertSide: "lebron",
      confidence: "strong",
      keyEvidence: "Air Jordan年营收超50亿美元，「Jordan」三个字是全球运动品牌头部——商业影响力科比无可比拟。",
      commonMisconception: "「科比去世后社交媒体提及量超乔丹全年 = 影响力更大」——情感峰值不等于持续商业/文化影响力。",
      popularSide: "lebron",
    },
    legacy: {
      expertSide: "lebron",
      confidence: "strong",
      keyEvidence: "乔丹定义了「超级巨星」和现代运动员商业模式；科比影响下一代球员但多通过模仿乔丹传递。开创者地位乔丹无可置疑。",
      commonMisconception: "「年轻一代偶像是科比所以科比影响力更大」——这是代际偏好，不是历史地位。",
      popularSide: "lebron",
    },
    "whatif-teammates": {
      expertSide: null, confidence: "split",
      keyEvidence: "What-if假设——没有事实答案。",
      commonMisconception: "用假设判断真实能力——逻辑断裂。",
      popularSide: null,
    },
    "whatif-1v1-prime": {
      expertSide: null, confidence: "split",
      keyEvidence: "1v1是虚构场景——单打数据有参考但无定论。",
      commonMisconception: "把1v1和真实比赛能力等同——它们不是同一回事。",
      popularSide: null,
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  // LeBron vs Jordan — INVERTED SLOTS: kobe slot = Jordan, lebron slot = LeBron
  // ─────────────────────────────────────────────────────────────────────
  "lebron-vs-jordan": {
    "lj-goat": {
      expertSide: "kobe", // Jordan
      confidence: "moderate",
      keyEvidence: "乔丹6-0+6FMVP+5MVP+10得分王 vs 詹姆斯4冠+4FMVP+4MVP+1得分王——任何主要荣誉指标乔丹都领先；ESPN球员匿名投票58.3%选乔丹GOAT。",
      commonMisconception: "「詹姆斯累计数据领先（40K+11K+11K）= GOAT」——累计要计入打满22年的因素，巅峰统治力乔丹仍领先。",
      popularSide: "kobe",
    },
    "lj-rings": {
      expertSide: "kobe", // Jordan
      confidence: "strong",
      keyEvidence: "乔丹总决赛6-0+6FMVP，从未抢七——胜率100% vs 詹姆斯4-6胜率40%。冠军含金量乔丹完胜。",
      commonMisconception: "「2016年1-3翻盘73胜勇士抵得过乔丹6个冠军」——这是一个单一伟大时刻，不是6比4的逆转。",
      popularSide: "kobe",
    },
    "lj-stats": {
      expertSide: null, confidence: "split",
      keyEvidence: "乔丹生涯场均30.12分（历史最高）vs 詹姆斯累计40000+分（历史最多）——平均效率乔丹胜，累计产出詹姆斯胜，两个维度。",
      commonMisconception: "认为「场均更高 = 更强」或「累计更多 = 更强」——都是片面。",
      popularSide: null,
    },
    "lj-clutch": {
      expertSide: "kobe", // Jordan
      confidence: "strong",
      keyEvidence: "乔丹季后赛最后30秒绝杀/扳平命中率约42%——历史顶级；98年总决赛绝杀拉塞尔等画面定义了「关键球」一词。詹姆斯的关键时刻有名场面但效率波动更大。",
      commonMisconception: "「2016 G7 the block + 三分 = 比乔丹任何时刻都强」——一个伟大瞬间，不是整个生涯关键时刻的平均水平。",
      popularSide: "kobe",
    },
    "lj-longevity": {
      expertSide: "lebron", // LeBron
      confidence: "strong",
      keyEvidence: "詹姆斯22年场均20+，40岁仍是全明星级别——乔丹15年+2年奇才衰退期。绝对生涯长度和晚期状态詹姆斯领先。",
      commonMisconception: "「乔丹两次退役还能回来夺冠 = 持久力相同」——退役不是持续输出，缺席年份不算生涯长度。",
      popularSide: "lebron",
    },
    "lj-versatility": {
      expertSide: "lebron", // LeBron
      confidence: "strong",
      keyEvidence: "詹姆斯1-5号位全能+史上唯一40K+11K+11K三项累计——全能性维度詹姆斯无可争议。乔丹是历史最强得分手，但维度更窄。",
      commonMisconception: "「乔丹同年得分王+DPOY = 比詹姆斯全能」——这是攻防双能巅峰认证，但「全能」按位置覆盖和组织能力詹姆斯领先。",
      popularSide: "lebron",
    },
    "lj-era": {
      expertSide: null, confidence: "split",
      keyEvidence: "Hand-check时代防守强度高 vs 现代换防体系复杂——两个时代难度不同维度，没有统一标尺。",
      commonMisconception: "「Hand-check = 唯一难度标准」或「现代换防 = 唯一难度标准」——都是片面。",
      popularSide: "kobe",
    },
    "lj-leadership": {
      expertSide: null, confidence: "split",
      keyEvidence: "恐惧式领导 vs 赋能式领导——两种风格都有冠军证明，主观偏好。",
      commonMisconception: "「乔丹打哭队友 = 最强领袖」或「詹姆斯让所有队友变强 = 最强领袖」——风格不同，效果都有。",
      popularSide: null,
    },
    "lj-impact": {
      expertSide: null, confidence: "split",
      keyEvidence: "Jordan Brand 51亿年营收 vs I Promise School改变阿克伦——商业 vs 社会影响，不同维度。",
      commonMisconception: "用其中一个完全压过另一个——它们都是真实影响。",
      popularSide: null,
    },
    "lj-playoff": {
      expertSide: "kobe", // Jordan
      confidence: "moderate",
      keyEvidence: "乔丹季后赛场均33.4分历史最高+6进总决赛全夺冠 vs 詹姆斯季后赛场均28.4分+10进总决赛4夺冠——巅峰统治力乔丹胜。",
      commonMisconception: "「詹姆斯10次总决赛 > 乔丹6次 = 更强」——次数多但胜率从100%降到40%。",
      popularSide: "kobe",
    },
    "lj-whatif-swap": {
      expertSide: null, confidence: "split",
      keyEvidence: "跨时代假设——所有答案都是推测。",
      commonMisconception: "认为「自己支持的球员 = 在任何时代都会赢」——这是信仰，不是论证。",
      popularSide: null,
    },
    "lj-whatif-team": {
      expertSide: null, confidence: "split",
      keyEvidence: "组队谁当老大——What-if场景，没有事实答案。",
      commonMisconception: "用「我喜欢谁」决定「谁是老大」——别假装这是分析。",
      popularSide: null,
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  // Magic vs Bird — kobe slot = Magic, lebron slot = Bird
  // ─────────────────────────────────────────────────────────────────────
  "magic-vs-bird": {
    "goat-of-era": {
      expertSide: "kobe", // Magic
      confidence: "moderate",
      keyEvidence: "Magic 5冠+3FMVP+3MVP vs Bird 3冠+2FMVP+3MVP——冠军和FMVP都Magic胜，MVP打平。综合80年代统治力Magic略胜。",
      commonMisconception: "「Bird连续3年MVP = 80年代第一人」——MVP打平，但戒指和FMVP Magic都更多。",
      popularSide: "kobe",
    },
    rings: {
      expertSide: "kobe", // Magic
      confidence: "strong",
      keyEvidence: "Magic 5冠+3FMVP vs Bird 3冠+2FMVP——冠军数和FMVP数Magic完胜。",
      commonMisconception: "「Bird的3冠每个都更硬」——可能更血腥，但5比3就是5比3。",
      popularSide: "kobe",
    },
    rivalry: {
      expertSide: "kobe", // Magic
      confidence: "moderate",
      keyEvidence: "总决赛对决Magic 2-1 Bird——直接对决战绩Magic领先；但1984年Bird场均27+14是史诗级单系列表现。",
      commonMisconception: "「1984年Bird翻盘Magic所以Bird赢了对决」——一次系列赛 vs 整体2-1战绩。",
      popularSide: "kobe",
    },
    versatility: {
      expertSide: "kobe", // Magic
      confidence: "moderate",
      keyEvidence: "Magic 2米06的控卫场均11.2助攻（历史最高）+1-5号位都打过——位置全能性独一份；Bird是史上最全面前锋但仍是前锋位置。",
      commonMisconception: "「Bird场均20+10+6 = 比Magic全能」——Bird确实全面，但Magic的位置跨度更极端。",
      popularSide: "kobe",
    },
    clutch: {
      expertSide: null, confidence: "split",
      keyEvidence: "Magic 1987 baby sky hook vs Bird连续3年MVP的第四节统治——都是关键时刻顶级球员。",
      commonMisconception: "「Magic赢2-1所以关键球更强」——多数对决是球队整体表现，不是个人关键球。",
      popularSide: null,
    },
    leadership: {
      expertSide: null, confidence: "split",
      keyEvidence: "快乐型 vs 恐惧型领袖——两种风格都有冠军，没有统一标准。",
      commonMisconception: "用其中一种领导风格否定另一种——两种都有效。",
      popularSide: null,
    },
    entertainment: {
      expertSide: "kobe", // Magic
      confidence: "moderate",
      keyEvidence: "Showtime湖人定义了80年代NBA娱乐化转型——快攻、no-look pass、好莱坞文化。Magic在「观赏性」品牌效应上领先。",
      commonMisconception: "「Bird的垃圾话 = 更娱乐」——垃圾话有趣，但联盟商业化转型是Magic + Showtime体系驱动。",
      popularSide: "kobe",
    },
    legacy: {
      expertSide: null, confidence: "split",
      keyEvidence: "Magic改变了控卫定义+推动AIDS认知；Bird定义了「白人努力打爆天赋」叙事+退役后教练GM全能——不同维度的遗产。",
      commonMisconception: "用其中一个完全压过另一个——两人共同拯救了80年代NBA。",
      popularSide: null,
    },
    "whatif-same-team": {
      expertSide: null, confidence: "split",
      keyEvidence: "假设场景——无事实答案。",
      commonMisconception: "假设题目没有标准答案。",
      popularSide: null,
    },
    "whatif-modern-era": {
      expertSide: null, confidence: "split",
      keyEvidence: "跨时代假设——推测无定论。",
      commonMisconception: "用今天的规则强行套用80年代的球员——丢失了大量context。",
      popularSide: null,
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  // Curry vs Durant — kobe slot = Curry, lebron slot = Durant
  // ─────────────────────────────────────────────────────────────────────
  "curry-vs-durant": {
    "cd-impact": {
      expertSide: "kobe", // Curry
      confidence: "strong",
      keyEvidence: "库里之前NBA场均三分18次 → 之后35次，整个联盟战术体系因他重写——历史上能用「打法分XX之前/之后」划分的球员极少，库里是其一。",
      commonMisconception: "「杜兰特2米08投三分也很影响篮球」——他是极致版高度+技术，但没有像库里那样改变联盟级战术。",
      popularSide: "kobe",
    },
    "cd-rings": {
      expertSide: null, confidence: "split",
      keyEvidence: "库里4冠1FMVP（含两次有杜兰特）vs 杜兰特2冠2FMVP（在勇士拿）——库里冠军多+无杜兰特也拿冠军；杜兰特两次FMVP在勇士全是真核心。两个维度。",
      commonMisconception: "「库里4冠 > 杜兰特2冠」或「杜兰特2FMVP > 库里1FMVP」——单独看都不准确。",
      popularSide: "kobe",
    },
    "cd-skill": {
      expertSide: null, confidence: "split",
      keyEvidence: "库里投篮历史最佳+引力联盟第一 vs 杜兰特历史顶级得分包+50-40-90俱乐部——两套不同的技术天花板。",
      commonMisconception: "「库里只会投三分」或「杜兰特只是高个投篮机」——两人都是技术上全面顶级。",
      popularSide: null,
    },
    "cd-clutch": {
      expertSide: "lebron", // Durant
      confidence: "moderate",
      keyEvidence: "杜兰特2017总决赛G3绝杀+2017、2018两次FMVP级别的关键场次输出 vs 库里2016 G7末段3投0中。最关键场次杜兰特更稳定。",
      commonMisconception: "「库里2022总决赛FMVP = 关键球更强」——那是一次顶级表现，但单点 vs 系统对比的话杜兰特生涯关键时刻样本更优。",
      popularSide: "kobe",
    },
    "cd-legacy": {
      expertSide: "kobe", // Curry
      confidence: "moderate",
      keyEvidence: "库里全票MVP+三分历史纪录+改变篮球打法——历史地位有「不可替代的开创者」标签；杜兰特是历史前列得分手但缺少「定义时代」的独特标签。",
      commonMisconception: "「杜兰特累计得分进史前」——是的，但开创者地位库里仍胜一筹。",
      popularSide: "kobe",
    },
    "cd-leadership": {
      expertSide: "kobe", // Curry
      confidence: "strong",
      keyEvidence: "库里从首轮第7顺位+脚踝伤病重建勇士到4冠王朝，homegrown冠军领袖 vs 杜兰特2016加入73胜勇士选择简单路——「领袖」核心定义之一是带烂队变冠军。",
      commonMisconception: "「杜兰特到哪都是老大 = 领袖力强」——是核心球员能力，但「带烂队变冠军」的难度库里完成得更好。",
      popularSide: "kobe",
    },
    "cd-efficiency": {
      expertSide: null, confidence: "split",
      keyEvidence: "库里2015-16 TS% 66.9%（场均30+史上最高效率）vs 杜兰特生涯TS% 63.4%（场均25+史上最高）——巅峰极致是库里，长期高位是杜兰特。",
      commonMisconception: "用其中一个数据完全否定另一个——两人在效率上都是历史级。",
      popularSide: null,
    },
    "cd-entertainment": {
      expertSide: null, confidence: "split",
      keyEvidence: "Logo三分 vs 高个后仰中投——两种风格的观赏性。",
      commonMisconception: "把美学偏好当作客观判定——这是品味题。",
      popularSide: null,
    },
    "cd-whatif-no-warriors": {
      expertSide: null, confidence: "split",
      keyEvidence: "假设场景——无事实答案。",
      commonMisconception: "用结果反推假设——逻辑错位。",
      popularSide: null,
    },
    "cd-whatif-1v1": {
      expertSide: null, confidence: "split",
      keyEvidence: "1v1虚构场景。",
      commonMisconception: "把身高优势或投射优势当作1v1的决定因素——实际1v1从未发生。",
      popularSide: null,
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  // Shaq vs Yao — kobe slot = Shaq, lebron slot = Yao
  // ─────────────────────────────────────────────────────────────────────
  "shaq-vs-yao": {
    "sy-dominance": {
      expertSide: "kobe", // Shaq
      confidence: "strong",
      keyEvidence: "奥尼尔2000年总决赛场均38/16.7+联盟为他改了防守规则——历史上极少球员逼联盟改规则。统治力维度奥尼尔完胜。",
      commonMisconception: "「姚明改变了篮球世界地图 = 统治力相同」——商业/文化影响和球场统治力是两个维度。",
      popularSide: "kobe",
    },
    "sy-rings": {
      expertSide: "kobe", // Shaq
      confidence: "strong",
      keyEvidence: "奥尼尔4冠3FMVP vs 姚明0冠——冠军数据无争议。",
      commonMisconception: "「姚明没冠军是阵容差，实际更强」——这是「如果」叙事，硬指标无争议。",
      popularSide: "kobe",
    },
    "sy-international": {
      expertSide: "lebron", // Yao
      confidence: "strong",
      keyEvidence: "姚明把NBA带入14亿人口的市场——NBA中国版权费从几百万美元到数十亿美元跨度。国际化商业影响姚明独一份。",
      commonMisconception: "「奥尼尔说唱+电影 = 国际影响更大」——奥尼尔的文化影响主要在北美，姚明开辟的是亚洲市场，规模量级不同。",
      popularSide: null,
    },
    "sy-skill": {
      expertSide: "lebron", // Yao
      confidence: "moderate",
      keyEvidence: "姚明罚球命中率83.3% vs 奥尼尔52.7%——中锋技术细腻度上姚明明显更全面；奥尼尔靠力量主导。",
      commonMisconception: "「奥尼尔篮下命中率58% = 技术更高效」——效率是力量+终结产物，「技术」的传统定义（手感、脚步、中距离）姚明胜。",
      popularSide: "kobe",
    },
    "sy-size": {
      expertSide: null, confidence: "split",
      keyEvidence: "147公斤+冲刺速度 vs 2米26高度——两种极端身体优势。",
      commonMisconception: "把其中一个完全压过另一个——它们解决的是不同的物理问题。",
      popularSide: "kobe",
    },
    "sy-legacy": {
      expertSide: "kobe", // Shaq
      confidence: "strong",
      keyEvidence: "奥尼尔历史得分前十+4冠3FMVP+15次全明星——任何历史排名都在前十；姚明因伤病只打8个完整赛季，名人堂级但历史地位无法相提并论。",
      commonMisconception: "「姚明改变了运动本身所以历史地位相当」——文化遗产很大，但「球员历史地位」按荣誉/数据排名奥尼尔领先。",
      popularSide: "kobe",
    },
    "sy-entertainment": {
      expertSide: null, confidence: "split",
      keyEvidence: "暴力扣篮美学 vs 巨人技术流——美学偏好。",
      commonMisconception: "把偏好当客观判定。",
      popularSide: null,
    },
    "sy-culture": {
      expertSide: null, confidence: "split",
      keyEvidence: "Shaq Diesel白金唱片+综艺帝国 vs 东西方文化破壁——两种文化影响维度。",
      commonMisconception: "「文化输出 = 个人品牌大小」或「文化输出 = 跨国影响」——两者都算。",
      popularSide: null,
    },
    "sy-whatif-healthy": {
      expertSide: null, confidence: "split",
      keyEvidence: "假设场景——无事实答案。",
      commonMisconception: "把「如果」当作真实记录。",
      popularSide: null,
    },
    "sy-whatif-teammates": {
      expertSide: null, confidence: "split",
      keyEvidence: "假设双塔——现代spacing理论上确实有问题，但属于推测。",
      commonMisconception: "用现代spacing否定所有大体型组合——也属简化。",
      popularSide: null,
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  // Duncan vs Garnett — kobe slot = Duncan, lebron slot = Garnett
  // ─────────────────────────────────────────────────────────────────────
  "duncan-vs-garnett": {
    "dg-rings": {
      expertSide: "kobe", // Duncan
      confidence: "strong",
      keyEvidence: "邓肯5冠3FMVP vs 加内特1冠——冠军和FMVP数完胜。",
      commonMisconception: "「KG明尼苏达12年阵容差，如果在马刺也能5冠」——这是反事实，不改变实际硬指标。",
      popularSide: "kobe",
    },
    "dg-defense": {
      expertSide: null, confidence: "split",
      keyEvidence: "邓肯15次防守阵容+3020盖帽 vs 加内特1次DPOY+换防1-5号位——长期稳定 vs 巅峰认证，两种顶级防守。",
      commonMisconception: "「DPOY数 = 防守谁更强」或「防守一阵次数 = 防守谁更强」——单一指标都不全面。",
      popularSide: "kobe",
    },
    "dg-leadership": {
      expertSide: null, confidence: "split",
      keyEvidence: "邓肯安静型领袖（多次降薪）vs 加内特激情型领袖（08凯尔特人防守DNA改造）——两种风格都有冠军证明。",
      commonMisconception: "把其中一种风格定义为「正确」——都work。",
      popularSide: "kobe",
    },
    "dg-longevity": {
      expertSide: "kobe", // Duncan
      confidence: "moderate",
      keyEvidence: "邓肯15次全明星+15次全NBA+15次全防守（历史唯一三个15）vs 加内特15次全明星+9次全NBA+12次全防守——三项联合统计邓肯独一份。",
      commonMisconception: "「加内特21年 > 邓肯19年 = 持久力更强」——年数多但顶级输出年份和荣誉密度邓肯胜。",
      popularSide: "kobe",
    },
    "dg-peak": {
      expertSide: null, confidence: "split",
      keyEvidence: "邓肯2003年MVP+FMVP+冠军同年 vs 加内特2003-04 MVP但首轮游——邓肯巅峰季更完整，但加内特单赛季统计更全面（24.2/13.9/5.0/1.5/2.2）。",
      commonMisconception: "「冠军季 = 巅峰更高」——这是结果论；KG那年的个人输出确实历史级。",
      popularSide: "kobe",
    },
    "dg-loyalty": {
      expertSide: "kobe", // Duncan
      confidence: "strong",
      keyEvidence: "邓肯19年一支球队从未离开 vs 加内特被交易+主动加盟篮网——单队时长邓肯完胜。",
      commonMisconception: "「KG明尼苏达12年才叫真忠诚（孤军作战）」——情绪化，但实际单队时长邓肯仍多7年。",
      popularSide: "kobe",
    },
    "dg-skill": {
      expertSide: null, confidence: "split",
      keyEvidence: "邓肯45度打板+低位脚步教科书 vs 加内特2米11能传球能投中距能换防——技术精度 vs 全能性。",
      commonMisconception: "「邓肯只会打板」或「加内特只是天赋」——两人技术都顶级，维度不同。",
      popularSide: null,
    },
    "dg-legacy": {
      expertSide: "kobe", // Duncan
      confidence: "strong",
      keyEvidence: "ESPN/NBA官方/Basketball Reference各类历史排名邓肯都是大前锋第一——5冠+3FMVP+2MVP的硬件加任何一个都比KG硬件强。",
      commonMisconception: "「加内特是现代大前锋鼻祖所以历史地位相当」——影响力深远，但「历史地位」按荣誉排名邓肯仍胜。",
      popularSide: "kobe",
    },
    "dg-whatif-kg-spurs": {
      expertSide: null, confidence: "split",
      keyEvidence: "假设场景——无事实答案。",
      commonMisconception: "假设题没有标准答案。",
      popularSide: null,
    },
    "dg-whatif-same-team": {
      expertSide: null, confidence: "split",
      keyEvidence: "双塔可行性属于战术推测。",
      commonMisconception: "用当下spacing理论否定历史双塔——简化。",
      popularSide: null,
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  // AI vs T-Mac — kobe slot = AI, lebron slot = T-Mac
  // ─────────────────────────────────────────────────────────────────────
  "ai-vs-tmac": {
    "at-scoring": {
      expertSide: "kobe", // AI
      confidence: "moderate",
      keyEvidence: "艾弗森4届得分王（1999、2001、2002、2005）+生涯场均26.7分 vs 麦迪2届得分王+生涯场均19.6分——得分王数量和生涯长期得分输出AI都领先。",
      commonMisconception: "「麦迪02-03场均32.1 > AI巅峰 = 得分能力更强」——单赛季巅峰麦迪更高，但持续输出+得分王累计AI胜。",
      popularSide: "lebron",
    },
    "at-crossover": {
      expertSide: "kobe", // AI
      confidence: "strong",
      keyEvidence: "艾弗森的crossover是NBA定义性技术动作，1997年晃倒乔丹是历史iconic画面；麦迪过人靠身高臂展+干拔，过人「技术」本身AI公认祖师爷。",
      commonMisconception: "「麦迪2米03过人更帅 = 过人技术更强」——视觉效果是另一回事，「过人技术」核心是变向能力，AI是分水岭级别。",
      popularSide: "kobe",
    },
    "at-clutch": {
      expertSide: null, confidence: "split",
      keyEvidence: "AI 2001总决赛G1跨过泰伦卢 vs 麦迪35秒13分——两种不可复制的经典时刻。",
      commonMisconception: "「跨过泰伦卢后输了系列赛」或「35秒13分不是季后赛」——都是单一片段，没法用一个否定另一个。",
      popularSide: null,
    },
    "at-heart": {
      expertSide: "kobe", // AI
      confidence: "moderate",
      keyEvidence: "AI生涯场均41.1分钟+1米83身高对抗、14年职业生涯——「战斗意志」按一般定义（不顾身体硬刚）AI更典型；麦迪是受伤维持，性质不同。",
      commonMisconception: "「麦迪带伤打 = 战斗意志更强」——是另一种意志，但「战士」叙事AI更贴合。",
      popularSide: "kobe",
    },
    "at-tragedy": {
      expertSide: null, confidence: "split",
      keyEvidence: "AI叛逆被联盟边缘化 vs 麦迪天赋被伤病吞噬——两种不同的遗憾叙事。",
      commonMisconception: "用其中一个完全压过另一个——都是真实的悲剧。",
      popularSide: null,
    },
    "at-culture": {
      expertSide: "kobe", // AI
      confidence: "moderate",
      keyEvidence: "AI让NBA出台着装令+定义嘻哈文化进入联盟，全球影响力跨越体育圈；麦迪在中国是现象级偶像但全球文化影响AI更广。",
      commonMisconception: "「麦迪在中国人气最高 = 文化影响最大」——区域人气vs全球文化结构性影响是不同尺度。",
      popularSide: "lebron",
    },
    "at-peak": {
      expertSide: null, confidence: "split",
      keyEvidence: "AI 2001 MVP+总决赛+场均31.1（1米83打MVP独一份）vs 麦迪02-03 PER 30.3（21世纪极致天赋）——两种巅峰难度。",
      commonMisconception: "用一项指标（MVP vs PER）完全否定另一方——它们度量不同维度。",
      popularSide: null,
    },
    "at-entertainment": {
      expertSide: null, confidence: "split",
      keyEvidence: "战士美学 vs 诗人美学——审美偏好。",
      commonMisconception: "把偏好当客观判定。",
      popularSide: null,
    },
    "at-whatif-healthy": {
      expertSide: null, confidence: "split",
      keyEvidence: "假设场景——无事实答案。",
      commonMisconception: "「如果麦迪健康会进历史前十」——属推测。",
      popularSide: "lebron",
    },
    "at-whatif-sameteam": {
      expertSide: null, confidence: "split",
      keyEvidence: "假设组合——无事实答案。",
      commonMisconception: "假设题没标答。",
      popularSide: null,
    },
  },
};

// Topic title lookup for specificCalls display
const TOPIC_TITLES: Record<string, string> = {
  // kobe-vs-lebron
  rings: "冠军戒指", clutch: "关键球", skill: "技术", mvp: "个人荣誉", mentality: "竞技精神",
  defense: "防守", finals: "总决赛", teammates: "队友", era: "时代影响力", iconic: "经典时刻",
  goat: "历史地位", loyalty: "忠诚",
  whatif_swap: "互换球队", whatif_era: "互换时代", whatif_1v1: "1v1单挑",
  // kobe-vs-jordan
  "goat-proximity": "GOAT接近度", "skill-clone": "技术相似度", aesthetics: "打球美感",
  "cultural-impact": "文化影响力", legacy: "传承",
  "whatif-teammates": "互换队友", "whatif-1v1-prime": "巅峰1v1",
  // lebron-vs-jordan
  "lj-goat": "GOAT", "lj-rings": "冠军含金量", "lj-stats": "数据统治", "lj-clutch": "关键时刻",
  "lj-longevity": "生涯长度", "lj-versatility": "全能性", "lj-era": "时代难度",
  "lj-leadership": "领导力", "lj-impact": "场外影响", "lj-playoff": "季后赛统治力",
  "lj-whatif-swap": "互换时代", "lj-whatif-team": "组队老大",
  // magic-vs-bird
  "goat-of-era": "80年代GOAT", rivalry: "世纪对决", versatility: "全能性",
  leadership: "领袖力", entertainment: "观赏性",
  "whatif-same-team": "同队", "whatif-modern-era": "现代篮球",
  // curry-vs-durant
  "cd-impact": "改变篮球", "cd-rings": "冠军含金量", "cd-skill": "技术天花板",
  "cd-clutch": "关键时刻", "cd-legacy": "历史地位", "cd-leadership": "领袖气质",
  "cd-efficiency": "效率之王", "cd-entertainment": "观赏性",
  "cd-whatif-no-warriors": "如果KD没来勇士", "cd-whatif-1v1": "巅峰1v1",
  // shaq-vs-yao
  "sy-dominance": "统治力", "sy-rings": "冠军戒指", "sy-international": "国际影响力",
  "sy-skill": "技术天花板", "sy-size": "体型对决", "sy-legacy": "历史地位",
  "sy-entertainment": "观赏性", "sy-culture": "文化输出",
  "sy-whatif-healthy": "姚明健康", "sy-whatif-teammates": "双塔",
  // duncan-vs-garnett
  "dg-rings": "冠军戒指", "dg-defense": "防守能力", "dg-leadership": "领导力",
  "dg-longevity": "持久力", "dg-peak": "巅峰对决", "dg-loyalty": "忠诚",
  "dg-skill": "技术", "dg-legacy": "历史地位",
  "dg-whatif-kg-spurs": "KG在马刺", "dg-whatif-same-team": "双塔",
  // ai-vs-tmac
  "at-scoring": "得分能力", "at-crossover": "过人技术", "at-clutch": "经典时刻",
  "at-heart": "战斗意志", "at-tragedy": "遗憾", "at-culture": "文化影响",
  "at-peak": "巅峰能力", "at-entertainment": "观赏性",
  "at-whatif-healthy": "麦迪健康", "at-whatif-sameteam": "AI+TMac同队",
};

// IQ level gating — each level requires a min score AND a min fraction of
// strong-confidence topics correctly called. Fraction (not absolute count)
// keeps the system fair across matchups with different strong-topic densities.
//
//   kobe-vs-lebron     → 3 strong topics
//   kobe-vs-jordan     → 4 strong topics
//   lebron-vs-jordan   → 4 strong topics
//   magic-vs-bird      → 1 strong topic
//   curry-vs-durant    → 2 strong topics
//   shaq-vs-yao        → 4 strong topics
//   duncan-vs-garnett  → 3 strong topics
//   ai-vs-tmac         → 1 strong topic
interface IQLevel {
  level: string;
  minScore: number;
  /** Min fraction of available strong-confidence topics that must be correct (0-1). */
  minStrongFraction: number;
}
const IQ_LEVELS: IQLevel[] = [
  { level: "篮球教授",   minScore: 90, minStrongFraction: 1.0  },
  { level: "数据极客",   minScore: 80, minStrongFraction: 0.75 },
  { level: "战术分析师", minScore: 70, minStrongFraction: 0.5  },
  { level: "资深球迷",   minScore: 55, minStrongFraction: 0.5  },
  { level: "球场观察者", minScore: 40, minStrongFraction: 0    },
  { level: "新手球迷",   minScore: 20, minStrongFraction: 0    },
  { level: "篮球门外汉", minScore: 0,  minStrongFraction: 0    },
];

function getIQLevel(score: number, strongCorrect: number, strongAvailable: number): string {
  const strongFrac = strongAvailable > 0 ? strongCorrect / strongAvailable : 1;
  for (const lvl of IQ_LEVELS) {
    if (score >= lvl.minScore && strongFrac >= lvl.minStrongFraction) {
      return lvl.level;
    }
  }
  return "篮球门外汉";
}

interface IQInput {
  votes: { topicId: string; winner: string }[];
  matchupId: string | undefined;
  elapsedSeconds: number;
  sideName: string;
}

function analyzeBasketballIQ(input: IQInput): PersonalityReport["basketballIQ"] {
  const { votes, matchupId, elapsedSeconds } = input;
  const consensusMap = EXPERT_CONSENSUS[matchupId ?? DEFAULT_MATCHUP] ?? {};
  const consensusTopicIds = Object.keys(consensusMap);

  // No consensus data for this matchup at all
  if (consensusTopicIds.length === 0) {
    return {
      score: 50,
      grade: "未知领域探索者",
      level: "未知领域探索者",
      analysis: "这个对决暂无系统的专家共识数据，懂球指数无法精确评估。恭喜你逃过一劫。",
      dataSense: 50,
      eyeTest: 50,
      contrarian: 50,
      specificCalls: [],
    };
  }

  // Count strong topics available across the whole matchup (not just voted)
  // so level gating reflects real ceiling, not partial play.
  const strongAvailable = consensusTopicIds.reduce((n, id) => {
    return n + (consensusMap[id].confidence === "strong" ? 1 : 0);
  }, 0);

  // Tally
  let dataAlignedWeighted = 0;     // strong = 2x, moderate = 1x
  let totalWeight = 0;
  let strongCorrect = 0;
  let popularTopics = 0;
  let eyeTestAligned = 0;
  let contrarianOpportunities = 0;
  let contrarianCorrect = 0;
  let misconceptionFell = 0;

  const callCandidates: SpecificCall[] = [];

  for (const v of votes) {
    const entry = consensusMap[v.topicId];
    if (!entry) continue;

    const title = TOPIC_TITLES[v.topicId] ?? v.topicId;

    if (entry.popularSide) {
      popularTopics++;
      if (v.winner === entry.popularSide) eyeTestAligned++;
    }

    // Split-confidence topics don't affect the score
    if (entry.confidence === "split" || !entry.expertSide) continue;

    const weight = entry.confidence === "strong" ? 2 : 1;
    totalWeight += weight;
    const aligned = v.winner === entry.expertSide;
    if (aligned) {
      dataAlignedWeighted += weight;
      if (entry.confidence === "strong") strongCorrect++;
    }

    if (entry.popularSide && entry.popularSide !== entry.expertSide) {
      contrarianOpportunities++;
      if (aligned) {
        contrarianCorrect++;
        callCandidates.push({
          topicId: v.topicId, topicTitle: title, userVoted: v.winner,
          expertSide: entry.expertSide, verdict: "contrarian-correct",
          analysis: `「${title}」你逆潮流选对了——${entry.keyEvidence}`,
        });
      } else if (v.winner === entry.popularSide) {
        misconceptionFell++;
        callCandidates.push({
          topicId: v.topicId, topicTitle: title, userVoted: v.winner,
          expertSide: entry.expertSide, verdict: "fell-for-misconception",
          analysis: `「${title}」你中了大众误区——${entry.commonMisconception}`,
        });
      }
    } else {
      // popular = expert (or no popular defined). Track right/wrong on both
      // strong and moderate to give specificCalls something to show.
      if (aligned) {
        callCandidates.push({
          topicId: v.topicId, topicTitle: title, userVoted: v.winner,
          expertSide: entry.expertSide, verdict: "right",
          analysis: `「${title}」你的选择和专家共识一致——${entry.keyEvidence}`,
        });
      } else {
        callCandidates.push({
          topicId: v.topicId, topicTitle: title, userVoted: v.winner,
          expertSide: entry.expertSide, verdict: "wrong",
          analysis: `「${title}」你选错了——${entry.keyEvidence}`,
        });
      }
    }
  }

  const dataSense = totalWeight > 0
    ? Math.round((dataAlignedWeighted / totalWeight) * 100) : 50;
  const eyeTest = popularTopics > 0
    ? Math.round((eyeTestAligned / popularTopics) * 100) : 50;
  const contrarian = contrarianOpportunities > 0
    ? Math.round((contrarianCorrect / contrarianOpportunities) * 100) : 50;

  // Base score = dataSense + up to +10 contrarian bonus - up to -10 misconception penalty
  let baseScore = dataSense;
  if (contrarianOpportunities > 0) {
    baseScore += Math.round((contrarianCorrect / contrarianOpportunities) * 10);
    baseScore -= Math.round((misconceptionFell / contrarianOpportunities) * 10);
  }

  // Speed cap: avg secs per vote < 4 → cap at 75 (rate-based to handle different round counts)
  const secsPerVote = votes.length > 0 ? elapsedSeconds / votes.length : 999;
  let speedCapped = false;
  if (secsPerVote < 4 && baseScore > 75) {
    baseScore = 75;
    speedCapped = true;
  }

  const score = Math.max(0, Math.min(100, baseScore));
  const level = getIQLevel(score, strongCorrect, strongAvailable);

  // Build specificCalls: prioritize variety (contrarian-correct → fell → wrong → right)
  const specificCalls: SpecificCall[] = [];
  const contrarianRight = callCandidates.filter(c => c.verdict === "contrarian-correct");
  const fellForBait = callCandidates.filter(c => c.verdict === "fell-for-misconception");
  const wrongOnStrong = callCandidates.filter(c => c.verdict === "wrong");
  const rightOnStrong = callCandidates.filter(c => c.verdict === "right");

  if (contrarianRight.length > 0) specificCalls.push(contrarianRight[0]);
  if (fellForBait.length > 0) specificCalls.push(fellForBait[0]);
  if (specificCalls.length < 3 && wrongOnStrong.length > 0) specificCalls.push(wrongOnStrong[0]);
  if (specificCalls.length < 3 && rightOnStrong.length > 0) specificCalls.push(rightOnStrong[0]);
  while (specificCalls.length < 2) {
    const pool = [...rightOnStrong, ...wrongOnStrong].filter(c =>
      !specificCalls.some(s => s.topicId === c.topicId)
    );
    if (pool.length === 0) break;
    specificCalls.push(pool[0]);
  }

  // Compose analysis sentence
  let analysis: string;
  if (score >= 90) {
    analysis = `投票与专家共识高度吻合（数据感${dataSense}/逆向${contrarian}）——${contrarianCorrect > 0 ? "尤其敢逆潮流选对的能力，证明你不是看脸投票。" : "稳定到怀疑你打开了别的tab。"}`;
  } else if (score >= 70) {
    analysis = `大部分关键问题你的判断是对的（数据感${dataSense}/眼力${eyeTest}/逆向${contrarian}）——${misconceptionFell > 0 ? "但有几次跟着大众跑偏了。" : "整体判断结构成熟。"}`;
  } else if (score >= 50) {
    analysis = `一半对一半错（数据感${dataSense}/眼力${eyeTest}/逆向${contrarian}）——${misconceptionFell >= 2 ? "你常常被流行叙事带走。" : "你的篮球知识够用但不够精。"}`;
  } else if (score >= 30) {
    analysis = `投票和专家共识有明显分歧（数据感${dataSense}/眼力${eyeTest}）——${misconceptionFell > 0 ? "落进了好几个大众误区。" : "建议把硬数据再看一遍。"}`;
  } else {
    analysis = `你的投票与专家共识几乎相反（数据感${dataSense}）——你不是不懂球，你是反向懂球。建议把所有选择反过来再看一眼。`;
  }
  if (speedCapped) {
    analysis += `（速度过快被限分75：每题平均不到4秒，没思考。）`;
  }

  return {
    score, grade: level, level, analysis,
    dataSense, eyeTest, contrarian, specificCalls,
  };
}

// ---------------------------------------------------------------------------
// Dimension 4: Overall Profile (综合报告)
// ---------------------------------------------------------------------------

function generateOverall(
  philosophy: PhilosophyReport,
  psychology: PsychologyReport,
  basketballIQ: PersonalityReport["basketballIQ"],
  sideName: string,
  otherName: string,
  loyalty: number,
  totalVotes: number,
): string {
  const loyaltyPct = Math.round(loyalty * 100);

  let opener: string;
  if (loyalty >= 0.9) {
    opener = `你是一个${sideName}的狂热信徒，${totalVotes}轮投票中${loyaltyPct}%都给了自己人。`;
  } else if (loyalty >= 0.65) {
    opener = `你是一个有主见的${sideName}支持者，忠诚但不盲从。`;
  } else if (loyalty >= 0.4) {
    opener = `你是一个摇摆不定的伪${sideName}粉丝，选了${sideName}但心里住着一个${otherName}。`;
  } else {
    opener = `你嘴上说站${sideName}，但投票数据出卖了你——你内心深处是${otherName}的人。`;
  }

  const philoPart = `哲学上你属于「${philosophy.school}」（${philosophy.archetype}）。`;
  const psychPart = `心理画像：${psychology.emoji}${psychology.name}（灵魂球员：${psychology.soulPlayer}）。`;
  const iqPart = `懂球指数${basketballIQ.score}分（${basketballIQ.grade}级别）。`;

  let closer: string;
  const score = basketballIQ.score;
  if (loyalty >= 0.9 && score < 40) {
    closer = `总结：你是那种在虎扑被禁言还要换号继续喷的人——热情有余，认知不足。`;
  } else if (loyalty >= 0.9 && score >= 70) {
    closer = `总结：你很懂球但完全不客观。最可惜的球迷类型。`;
  } else if (loyalty < 0.4 && score >= 70) {
    closer = `总结：你懂球，但你站错了队。或者说你根本没有队。`;
  } else if (loyalty < 0.4 && score < 40) {
    closer = `总结：不忠诚也不懂球，你参加这个游戏纯属凑热闹。`;
  } else if (philosophy.school.includes("浪漫") && score < 50) {
    closer = `总结：被情怀蒙蔽双眼的浪漫主义者。你看篮球像在看言情小说。`;
  } else if (philosophy.school.includes("斯多葛")) {
    closer = `总结：最让人尊敬也最让人心疼的球迷类型——明知数据不站自己这边，还是选了信仰。`;
  } else {
    closer = `总结：你的篮球世界观还算完整。但别得意——这个测试的标准比虎扑低多了。`;
  }

  return `${opener}${philoPart}${psychPart}${iqPart}${closer}`;
}

// ---------------------------------------------------------------------------
// Killer insight — ties philosophy + psychology + voting record together
// ---------------------------------------------------------------------------

function generateKillerInsight(args: {
  philosophy: PhilosophyReport;
  psychology: PsychologyReport;
  loyalty: number;
  statsOwnRate: number;
  emotionalOwnRate: number;
  contradictionDetected: boolean;
  sideName: string;
  otherName: string;
}): string {
  const { philosophy, psychology, loyalty, statsOwnRate, emotionalOwnRate, contradictionDetected, sideName, otherName } = args;

  if (contradictionDetected) {
    return `致命洞察：你嘴上崇拜${philosophy.school.includes("浪漫") ? "情怀和精神" : "数据和冠军"}，但每次关键票都暴露了相反的偏好——你比自己以为的更${philosophy.school.includes("浪漫") ? "功利" : "感性"}。`;
  }

  if (loyalty >= 0.9 && philosophy.school.includes("斯多葛")) {
    return `致命洞察：你以为自己「理性看球」，但${Math.round(loyalty * 100)}%的票都给了${sideName}——你的理性只是给信仰穿了件外套。`;
  }

  if (loyalty < 0.4 && psychology.axes.some((a) => a.value === "情怀党")) {
    return `致命洞察：你选${sideName}是出于感情，但你的票一直在${otherName}身上落——你爱的是「自己选了某一边」这个姿态，不是${sideName}本人。`;
  }

  if (psychology.axes.some((a) => a.value === "一城派") && statsOwnRate >= 0.7) {
    return `致命洞察：你的忠诚是结果导向的——只要${sideName}数据漂亮你就站，哪天数据反转你大概也会跟着跑路。`;
  }

  if (psychology.axes.some((a) => a.value === "冠军派") && emotionalOwnRate >= 0.7) {
    return `致命洞察：在情绪话题上你站${sideName}站得很猛，但一谈数据你就投降——你的篮球世界观靠的是「故事」，不是「事实」。`;
  }

  if (psychology.axes.some((a) => a.value === "冷门派") && loyalty >= 0.6) {
    return `致命洞察：你以为自己反主流、独立思考，但你的票其实牢牢锁定${sideName}——你的「反叛」只对外部世界生效，对自己的偶像没用。`;
  }

  if (psychology.axes.some((a) => a.value === "数据党") && emotionalOwnRate > statsOwnRate + 0.2) {
    return `致命洞察：你嘴上「用数据说话」，但情绪话题你都站${sideName}、数据话题反而冷静——你的理性是有选择的，专门用来攻击你不喜欢的论点。`;
  }

  return `致命洞察：你的投票模式说明——你以为自己在为${sideName}辩护，其实你是在为「自己当年选边的那个决定」辩护。换个球员你也会做一样的事。`;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function generatePersonalityReport(
  side: string,
  votes: { topicId: string; winner: string }[],
  elapsedSeconds: number,
  matchupId?: string,
): PersonalityReport {
  const config = getConfig(matchupId);
  const configKnown = config !== null;

  if (votes.length === 0) {
    const emptyType = "未参与";
    return {
      philosophy: {
        school: "虚无主义者",
        archetype: "加缪式空椅子",
        description: "你还没投票就跑来看报告？过程不重要，结果也不重要，姿态才重要——这就是典型的虚无主义。",
        quote: "尼采说：凝视深渊时，深渊也在凝视你。你连深渊都懒得凝视。",
        signatureMove: "零参与：你来这里不是为了辩论，是为了拿一个标签。",
        contradiction: null,
        evidence: [],
        killerInsight: "致命洞察：你连选边都不肯，却想要一个深度人格分析——你要的不是了解自己，是一份带着权威感的肯定。",
      },
      psychology: {
        type: emptyType,
        name: "未上场球员",
        emoji: "🪑",
        soulPlayer: "板凳席",
        tagline: "你把「不选择」当成了一种选择。",
        axes: [],
        traits: ["数据不足：你需要至少投一轮票才能生成心理画像"],
        decisionStyle: "决策风格：不决策。",
        inRelationship: "你不进入关系，因为进入就意味着可能失败。",
        atWork: "你永远在「考虑机会」，但从不真的接受。",
        spiritAnimal: "看戏的观众——存在但不参与",
        code: "🪑 未上场球员",
        codeMeaning: "你把「不选择」当成了一种选择。",
        inLove: "你不进入关系，因为进入就意味着可能失败。",
      },
      basketballIQ: {
        score: 0,
        grade: "弃权选手",
        level: "弃权选手",
        analysis: "零轮投票，零分。",
        dataSense: 0,
        eyeTest: 0,
        contrarian: 0,
        specificCalls: [],
      },
      overall: "你什么都没投就来看报告了。你的篮球人格是：不存在。",
    };
  }

  const sideName = sideLabel(config, side);
  const otherKey = otherSide(config, side);
  const otherName = sideLabel(config, otherKey);
  const topicsMeta = config?.topics ?? {};
  const titleMap = buildTitleMap(matchupId);

  // --- Compute derived stats ---

  const totalVotes = votes.length;
  const ownVotes = votes.filter((v) => v.winner === side).length;
  const loyalty = totalVotes > 0 ? ownVotes / totalVotes : 0;

  let emotionalTotal = 0, emotionalOwn = 0;
  let statsTotal = 0, statsOwn = 0;
  let heroTotal = 0, heroOwn = 0;
  let teamTotal = 0, teamOwn = 0;
  let underdogVotes = 0, underdogTotal = 0;
  let mainstreamMatches = 0, mainstreamScored = 0;
  const tribeCounts: Record<TopicTribe, number> = {
    talent: 0, effort: 0, winning: 0, loyalty: 0, aesthetics: 0, underdog: 0,
  };

  for (const v of votes) {
    const meta = topicsMeta[v.topicId];
    if (!meta) continue;

    if (meta.category === "emotional") {
      emotionalTotal++;
      if (v.winner === side) emotionalOwn++;
    } else if (meta.category === "stats") {
      statsTotal++;
      if (v.winner === side) statsOwn++;
    } else {
      emotionalTotal += 0.5;
      statsTotal += 0.5;
      if (v.winner === side) {
        emotionalOwn += 0.5;
        statsOwn += 0.5;
      }
    }

    if (meta.axis === "hero") {
      heroTotal++;
      if (v.winner === side) heroOwn++;
    } else if (meta.axis === "team") {
      teamTotal++;
      if (v.winner === side) teamOwn++;
    }

    if (meta.underdog) {
      underdogTotal++;
      if (v.winner === meta.underdog) underdogVotes++;
    }

    if (meta.mainstream) {
      mainstreamScored++;
      if (v.winner === meta.mainstream) mainstreamMatches++;
    }

    if (meta.tribeMap) {
      const t = meta.tribeMap[v.winner];
      if (t) tribeCounts[t] = (tribeCounts[t] ?? 0) + 1;
    }
  }

  const emotionalOwnRate = emotionalTotal > 0 ? emotionalOwn / emotionalTotal : 0.5;
  const statsOwnRate = statsTotal > 0 ? statsOwn / statsTotal : 0.5;
  const heroOwnRate = heroTotal > 0 ? heroOwn / heroTotal : 0.5;
  const teamOwnRate = teamTotal > 0 ? teamOwn / teamTotal : 0.5;
  const underdogPickRate = underdogTotal > 0 ? underdogVotes / underdogTotal : 0;
  const mainstreamRate = mainstreamScored > 0 ? mainstreamMatches / mainstreamScored : 0.5;

  // --- Build evidence votes ---
  const evidenceVotes: PhilosophyEvidence[] = [];
  votes.forEach((v, i) => {
    if (!titleMap.has(v.topicId)) return;
    const meta = topicsMeta[v.topicId];
    const votedLabel = sideLabel(config, v.winner);
    const isFlip = v.winner !== side;
    const isConsensusAlign = meta?.consensus === v.winner;
    const isUnderdog = meta?.underdog === v.winner;

    let interpretation = "中规中矩的一票";
    if (isFlip && isConsensusAlign) {
      interpretation = `承认对面在这块更强（专家共识也是${votedLabel}）`;
    } else if (isFlip) {
      interpretation = `跳出阵营投了${votedLabel}，说明这题你被对面说服了`;
    } else if (isUnderdog) {
      interpretation = `站在公论里更弱的一方（${votedLabel}），你在为弱者鼓掌`;
    } else if (isConsensusAlign) {
      interpretation = `跟随专家共识，安全牌`;
    } else if (meta?.category === "emotional") {
      interpretation = `情绪话题里你站${votedLabel}，符合你的情感本能`;
    } else if (meta?.category === "stats") {
      interpretation = `数据话题里你站${votedLabel}，说明你在用数字思考`;
    }

    evidenceVotes.push({
      round: i + 1,
      topicTitle: titleMap.get(v.topicId)!,
      votedFor: votedLabel,
      interpretation,
    });
  });

  evidenceVotes.sort((a, b) => {
    const aFlip = a.votedFor !== sideName ? 1 : 0;
    const bFlip = b.votedFor !== sideName ? 1 : 0;
    if (aFlip !== bFlip) return bFlip - aFlip;
    return a.round - b.round;
  });

  const flipTopic = evidenceVotes.find((e) => e.votedFor !== sideName) ?? null;
  const highLoyaltyTopic = evidenceVotes.find((e) => e.votedFor === sideName) ?? null;

  // IQ scoring now lives in analyzeBasketballIQ — driven by EXPERT_CONSENSUS
  const contradiction = detectContradictions(votes, topicsMeta, titleMap);

  // --- Generate each dimension ---

  const philosophy = analyzePhilosophy({
    emotionalOwnRate,
    statsOwnRate,
    loyalty,
    underdogPickRate,
    underdogVotes,
    tribeCounts,
    evidenceVotes,
    contradictionLine: contradiction?.line ?? null,
    sideName,
    otherName,
  });

  const psychology = analyzePsychology({
    emotionalOwnRate,
    statsOwnRate,
    heroOwnRate,
    teamOwnRate,
    loyalty,
    elapsedSeconds,
    totalVotes,
    mainstreamRate,
    mainstreamScored,
    evidenceVotes,
    highLoyaltyTopic,
    flipTopic,
    sideName,
    otherName,
    configKnown,
  });

  const basketballIQ = analyzeBasketballIQ({
    votes,
    matchupId,
    elapsedSeconds,
    sideName,
  });

  philosophy.killerInsight = generateKillerInsight({
    philosophy,
    psychology,
    loyalty,
    statsOwnRate,
    emotionalOwnRate,
    contradictionDetected: contradiction !== null,
    sideName,
    otherName,
  });

  const overall = generateOverall(
    philosophy,
    psychology,
    basketballIQ,
    sideName,
    otherName,
    loyalty,
    totalVotes,
  );

  return { philosophy, psychology, basketballIQ, overall };
}
