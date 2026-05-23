// ─────────────────────────────────────────────────────────────
// Basketball Personality Quiz — 10 questions, 4 dimensions
//
// 4 scoring dimensions (maps to TYPE_TABLE keys):
//   Dim 1: "持球大核" vs "角色球员"   (hero ball vs system/team)
//   Dim 2: "数据党"   vs "情怀党"     (stats vs narrative/vibes)
//   Dim 3: "头条派"   vs "冷门派"     (mainstream vs contrarian)
//   Dim 4: "一城派"   vs "冠军派"     (loyalty vs ring-chasing)
// ─────────────────────────────────────────────────────────────

export type Dim = "持球大核" | "角色球员" | "数据党" | "情怀党" | "头条派" | "冷门派" | "一城派" | "冠军派";

export interface QuizOption {
  id: string;
  text: string;
  /** Each selected option adds these points to the named dimensions. */
  scores: Partial<Record<Dim, number>>;
}

export interface QuizQuestion {
  id: string;
  type: "binary" | "multi";
  emoji: string;
  question: string;
  hint?: string;          // shown below question for multi
  minSelect?: number;     // multi only, default 1
  maxSelect?: number;     // multi only, default unlimited
  options: QuizOption[];
}

export const quizQuestions: QuizQuestion[] = [
  // ── Q1  Binary · Dim 1 ─────────────────────────────────────
  {
    id: "q1",
    type: "binary",
    emoji: "🏀",
    question: "打球最爽的一刻是？",
    options: [
      {
        id: "q1a",
        text: "急停跳投，空心入网，全场沸腾",
        scores: { "持球大核": 2 },
      },
      {
        id: "q1b",
        text: "挡拆配合，传球助攻，完美的化学反应",
        scores: { "角色球员": 2 },
      },
    ],
  },

  // ── Q2  Binary · Dim 2 ─────────────────────────────────────
  {
    id: "q2",
    type: "binary",
    emoji: "📊",
    question: "评价一个球员，你第一步会看？",
    options: [
      {
        id: "q2a",
        text: "打开数据网站，PER、真实命中率、胜利贡献值",
        scores: { "数据党": 2 },
      },
      {
        id: "q2b",
        text: "回忆他高光时刻，精神力和视觉统治感",
        scores: { "情怀党": 2 },
      },
    ],
  },

  // ── Q3  Multi · Dim 1+2 ────────────────────────────────────
  {
    id: "q3",
    type: "multi",
    emoji: "🏆",
    question: "以下哪些最能让你觉得一个球员真的很伟大？",
    hint: "选 2–3 个",
    minSelect: 2,
    maxSelect: 3,
    options: [
      {
        id: "q3a",
        text: "连续多年得分王，持球进攻无解",
        scores: { "持球大核": 1, "数据党": 1 },
      },
      {
        id: "q3b",
        text: "让队友场均得分明显提升",
        scores: { "角色球员": 2 },
      },
      {
        id: "q3c",
        text: "第四节关键球必进，越来越冷静",
        scores: { "持球大核": 1, "情怀党": 1 },
      },
      {
        id: "q3d",
        text: "DPOY级别防守，数据+眼球双重统治",
        scores: { "角色球员": 1, "数据党": 1 },
      },
      {
        id: "q3e",
        text: "没天赋也没名气，靠凌晨4点的训练室逆袭",
        scores: { "情怀党": 2 },
      },
    ],
  },

  // ── Q4  Binary · Dim 3 ─────────────────────────────────────
  {
    id: "q4",
    type: "binary",
    emoji: "🗣️",
    question: "你在群里发的篮球观点通常是？",
    options: [
      {
        id: "q4a",
        text: "大家都点赞，「说得有道理」",
        scores: { "头条派": 2 },
      },
      {
        id: "q4b",
        text: "有人怼你，「你在说什么离谱的东西」",
        scores: { "冷门派": 2 },
      },
    ],
  },

  // ── Q5  Binary · Dim 4 ─────────────────────────────────────
  {
    id: "q5",
    type: "binary",
    emoji: "✈️",
    question: "如果你是超级球星，你会选择？",
    options: [
      {
        id: "q5a",
        text: "去冠军最近的球队，赢才是唯一证明",
        scores: { "冠军派": 2 },
      },
      {
        id: "q5b",
        text: "留在起步的城市，陪球迷走到最后",
        scores: { "一城派": 2 },
      },
    ],
  },

  // ── Q6  Multi · Dim 2+4 ────────────────────────────────────
  {
    id: "q6",
    type: "multi",
    emoji: "💬",
    question: "以下哪些说法，你点头最多次？",
    hint: "选 2–3 个",
    minSelect: 2,
    maxSelect: 3,
    options: [
      {
        id: "q6a",
        text: "冠军数量是最终评判标准，说别的都是输家的借口",
        scores: { "冠军派": 1, "数据党": 1 },
      },
      {
        id: "q6b",
        text: "一城终老的球员值得额外的敬意",
        scores: { "一城派": 1, "情怀党": 1 },
      },
      {
        id: "q6c",
        text: "大多数球迷根本不懂球，人云亦云而已",
        scores: { "冷门派": 2 },
      },
      {
        id: "q6d",
        text: "组建超级球队完全合理，商业社会规则如此",
        scores: { "冠军派": 1 },
      },
      {
        id: "q6e",
        text: "城市球队是球迷身份认同的一部分，不只是娱乐",
        scores: { "一城派": 1, "情怀党": 1 },
      },
    ],
  },

  // ── Q7  Multi · Dim 1+3 ────────────────────────────────────
  {
    id: "q7",
    type: "multi",
    emoji: "🎬",
    question: "哪种场面最容易让你热血沸腾？",
    hint: "选 2–3 个",
    minSelect: 2,
    maxSelect: 3,
    options: [
      {
        id: "q7a",
        text: "球员单独扛压，第四节大爆发20分",
        scores: { "持球大核": 1, "情怀党": 1 },
      },
      {
        id: "q7b",
        text: "传球如行云流水，连续12次助攻，没有一次失误",
        scores: { "角色球员": 1 },
      },
      {
        id: "q7c",
        text: "低效率数据显示球队赢了，体系的胜利",
        scores: { "数据党": 1, "角色球员": 1 },
      },
      {
        id: "q7d",
        text: "黑马打败豪门，每个人都以为他们没机会",
        scores: { "冷门派": 1, "情怀党": 1 },
      },
      {
        id: "q7e",
        text: "老将谢幕战，全城泪目，十几年的陪伴落幕",
        scores: { "一城派": 1, "情怀党": 1 },
      },
    ],
  },

  // ── Q8  Binary · Dim 1+2 ───────────────────────────────────
  {
    id: "q8",
    type: "binary",
    emoji: "🌟",
    question: "你更欣赏哪种球员传奇？",
    options: [
      {
        id: "q8a",
        text: "一个人扛队，无人能防，孤胆英雄",
        scores: { "持球大核": 1, "情怀党": 1 },
      },
      {
        id: "q8b",
        text: "悄无声息提升全队，数据让人信服",
        scores: { "角色球员": 1, "数据党": 1 },
      },
    ],
  },

  // ── Q9  Multi · Dim 3+4 ────────────────────────────────────
  {
    id: "q9",
    type: "multi",
    emoji: "🔮",
    question: "穿越回去，你最想体验哪种瞬间？",
    hint: "选 2–3 个",
    minSelect: 2,
    maxSelect: 3,
    options: [
      {
        id: "q9a",
        text: "科比2006年单场81分，一个人对抗全世界",
        scores: { "持球大核": 1, "情怀党": 1, "一城派": 1 },
      },
      {
        id: "q9b",
        text: "乔丹六冠王朝，每个对手都已折服",
        scores: { "数据党": 1, "冠军派": 1 },
      },
      {
        id: "q9c",
        text: "邓肯马刺20年体系，低调制造王朝",
        scores: { "角色球员": 1, "一城派": 1, "冷门派": 1 },
      },
      {
        id: "q9d",
        text: "库里2016年73胜，三分革命颠覆篮球",
        scores: { "数据党": 1, "冷门派": 1 },
      },
      {
        id: "q9e",
        text: "艾弗森1米83，无视规则，纯粹的自由意志",
        scores: { "持球大核": 1, "情怀党": 1, "一城派": 1 },
      },
      {
        id: "q9f",
        text: "詹姆斯三度绝地逢生，弱旅夺冠",
        scores: { "冠军派": 1, "数据党": 1 },
      },
    ],
  },

  // ── Q10  Binary · Dim 3+4 ──────────────────────────────────
  {
    id: "q10",
    type: "binary",
    emoji: "🏁",
    question: "你心目中球员最完美的谢幕是？",
    options: [
      {
        id: "q10a",
        text: "用冠军和数据盖棺定论，清清白白离开",
        scores: { "冠军派": 1, "数据党": 1 },
      },
      {
        id: "q10b",
        text: "在这座城市退役，哪怕没有冠军，球迷不会忘记",
        scores: { "一城派": 1, "情怀党": 1 },
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Scoring
// ─────────────────────────────────────────────────────────────

export type QuizAnswers = Record<string, string[]>; // questionId → selectedOptionIds

export function computeQuizCode(answers: QuizAnswers): string {
  const totals: Record<Dim, number> = {
    "持球大核": 0, "角色球员": 0,
    "数据党": 0,   "情怀党": 0,
    "头条派": 0,   "冷门派": 0,
    "一城派": 0,   "冠军派": 0,
  };

  for (const q of quizQuestions) {
    const selected = answers[q.id] ?? [];
    for (const optId of selected) {
      const opt = q.options.find((o) => o.id === optId);
      if (!opt) continue;
      for (const [dim, pts] of Object.entries(opt.scores) as [Dim, number][]) {
        totals[dim] += pts;
      }
    }
  }

  const a = totals["持球大核"] >= totals["角色球员"] ? "持球大核" : "角色球员";
  const b = totals["数据党"]   >= totals["情怀党"]   ? "数据党"   : "情怀党";
  const c = totals["头条派"]   >= totals["冷门派"]   ? "头条派"   : "冷门派";
  const d = totals["一城派"]   >= totals["冠军派"]   ? "一城派"   : "冠军派";

  return `${a}-${b}-${c}-${d}`;
}
