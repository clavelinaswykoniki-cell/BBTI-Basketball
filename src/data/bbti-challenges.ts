import { enrichBbtiChallengeMatchup, type BbtiEvidenceLens } from "./bbti-challenge-evidence";
import { BBTI_CHALLENGE_FIXTURES } from "./bbti-challenge-fixtures";

export interface BbtiChallengeMatchup {
  matchupId: string;
  category: "同温层局" | "反向审判" | "破防加赛";
  label: string;
  title: string;
  reason: string;
  pressureQuestion?: string;
  iconicMoment?: string;
  receiptA?: string;
  receiptB?: string;
  groupChatPrompt?: string;
  shareCopy?: string;
  scriptOpener?: string;
  scriptConflict?: string;
  scriptCounter?: string;
  evidenceLens?: BbtiEvidenceLens[];
}

export const BBTI_CHALLENGE_LANE_SCOREBOARD_VERSION = "bbti-challenge-lane-scoreboard-v1" as const;
export const BBTI_CHALLENGE_LANE_SCOREBOARD_BOUNDARY =
  "本地开庭路线板，只复用当前 BBTI 结果、三条推荐对线和短挑战入口，不代表真实赛程、热度或外部来源。" as const;

export type BbtiChallengeLaneScoreboardRowId = "same-court" | "counter-court" | "overtime-court";
export type BbtiChallengeLaneScoreboardTarget = "same-temperature" | "counter-judgment" | "overtime";

export interface BbtiChallengeLaneScoreboardRow {
  id: BbtiChallengeLaneScoreboardRowId;
  target: BbtiChallengeLaneScoreboardTarget;
  category: BbtiChallengeMatchup["category"];
  matchupId: string;
  routeLabel: string;
  label: string;
  title: string;
  body: string;
  pressureQuestion?: string;
  reason: string;
  shareCopy?: string;
}

export interface BbtiChallengeLaneScoreboard {
  version: typeof BBTI_CHALLENGE_LANE_SCOREBOARD_VERSION;
  boundary: typeof BBTI_CHALLENGE_LANE_SCOREBOARD_BOUNDARY;
  code: string;
  laneCount: number;
  rows: BbtiChallengeLaneScoreboardRow[];
  copyText: string;
}

interface ResolveBbtiChallengeLaneScoreboardInput {
  code: string;
  challengeMatchups?: BbtiChallengeMatchup[];
}

const BBTI_CHALLENGE_LANE_META: Record<
  BbtiChallengeMatchup["category"],
  {
    id: BbtiChallengeLaneScoreboardRowId;
    target: BbtiChallengeLaneScoreboardTarget;
    routeLabel: string;
    bodyPrefix: string;
  }
> = {
  "同温层局": {
    id: "same-court",
    target: "same-temperature",
    routeLabel: "同温主场",
    bodyPrefix: "先打最顺手的主场局，确认你的篮球底层信仰。",
  },
  "反向审判": {
    id: "counter-court",
    target: "counter-judgment",
    routeLabel: "反向客场",
    bodyPrefix: "故意走进相反标准，看看你的判断能不能离开舒适区。",
  },
  "破防加赛": {
    id: "overtime-court",
    target: "overtime",
    routeLabel: "破防加时",
    bodyPrefix: "最后用加赛把忠诚、荣誉和情绪一起拉到台面。",
  },
};

const BBTI_CHALLENGE_LANE_ORDER: BbtiChallengeMatchup["category"][] = ["同温层局", "反向审判", "破防加赛"];

type ChallengeTemplate = Omit<BbtiChallengeMatchup, "category">;

const CHALLENGE_LIBRARY: Record<string, ChallengeTemplate> = {
  "kobe-vs-lebron": {
    matchupId: "kobe-vs-lebron",
    label: "核心价值审判",
    title: "科比 vs 詹姆斯",
    reason: "英雄球、忠诚、全能系统一次全打包，最适合检验你的篮球底层信仰。",
  },
  "kobe-vs-jordan": {
    matchupId: "kobe-vs-jordan",
    label: "美学镜像战",
    title: "科比 vs 乔丹",
    reason: "适合进攻/个人倾向玩家，直接审判技术、杀手本能和峰值神话。",
  },
  "lebron-vs-jordan": {
    matchupId: "lebron-vs-jordan",
    label: "历史第一标准",
    title: "詹姆斯 vs 乔丹",
    reason: "适合数据派或戒指路线玩家，把峰值、长度和历史地位标准摆上桌。",
  },
  "magic-vs-bird": {
    matchupId: "magic-vs-bird",
    label: "团队叙事宿命局",
    title: "魔术师 vs 大鸟",
    reason: "适合团队/情怀倾向玩家，看你更吃体系发动还是宿命阵营。",
  },
  "curry-vs-durant": {
    matchupId: "curry-vs-durant",
    label: "体系与硬解",
    title: "库里 vs 杜兰特",
    reason: "适合数据派和团队派，空间引力、效率和王朝归因会逼你选边。",
  },
  "duncan-vs-garnett": {
    matchupId: "duncan-vs-garnett",
    label: "防守地基对线",
    title: "邓肯 vs 加内特",
    reason: "适合防守/团队倾向玩家，用最硬的内线价值观拆掉花哨叙事。",
  },
  "ai-vs-tmac": {
    matchupId: "ai-vs-tmac",
    label: "情怀遗憾局",
    title: "艾弗森 vs 麦迪",
    reason: "适合情怀派和个人天赋派，戒指缺席时你还愿不愿意投票给记忆。",
  },
  "shaq-vs-yao": {
    matchupId: "shaq-vs-yao",
    label: "禁区肉搏战",
    title: "奥尼尔 vs 姚明",
    reason: "适合防守/对位洁癖玩家，把吨位、脚步、犯规和时代环境全摆进禁区。",
  },
};

function pushUnique(
  items: BbtiChallengeMatchup[],
  category: BbtiChallengeMatchup["category"],
  matchupId: string,
): void {
  const next = CHALLENGE_LIBRARY[matchupId];
  if (!next || items.some((item) => item.matchupId === matchupId)) return;
  items.push({ ...next, category });
}

function firstUnique(
  items: BbtiChallengeMatchup[],
  category: BbtiChallengeMatchup["category"],
  matchupIds: string[],
): void {
  for (const matchupId of matchupIds) {
    const before = items.length;
    pushUnique(items, category, matchupId);
    if (items.length > before) return;
  }
}

export function getBbtiChallengeMatchups(code: string): BbtiChallengeMatchup[] {
  const fixture = BBTI_CHALLENGE_FIXTURES[code];
  if (fixture) return fixture.map(enrichBbtiChallengeMatchup);

  const [style, evidence, role, ambition] = code;
  const items: BbtiChallengeMatchup[] = [];

  if (style === "O" && role === "I") {
    firstUnique(items, "同温层局", ["kobe-vs-jordan", "kobe-vs-lebron"]);
  } else if (style === "O" && role === "T") {
    firstUnique(items, "同温层局", ["curry-vs-durant", "magic-vs-bird"]);
  } else if (style === "D" && role === "T") {
    firstUnique(items, "同温层局", ["duncan-vs-garnett", "magic-vs-bird"]);
  } else {
    firstUnique(items, "同温层局", ["shaq-vs-yao", "kobe-vs-lebron"]);
  }

  if (evidence === "A") {
    firstUnique(items, "反向审判", ["ai-vs-tmac", "magic-vs-bird", "kobe-vs-jordan"]);
  } else if (role === "I") {
    firstUnique(items, "反向审判", ["magic-vs-bird", "curry-vs-durant", "duncan-vs-garnett"]);
  } else {
    firstUnique(items, "反向审判", ["lebron-vs-jordan", "kobe-vs-jordan", "kobe-vs-lebron"]);
  }

  if (ambition === "L") {
    firstUnique(items, "破防加赛", ["lebron-vs-jordan", "curry-vs-durant", "kobe-vs-lebron"]);
  } else if (evidence === "E") {
    firstUnique(items, "破防加赛", ["lebron-vs-jordan", "duncan-vs-garnett", "curry-vs-durant"]);
  } else {
    firstUnique(items, "破防加赛", ["kobe-vs-lebron", "lebron-vs-jordan", "ai-vs-tmac"]);
  }

  firstUnique(items, "破防加赛", ["magic-vs-bird", "kobe-vs-lebron", "lebron-vs-jordan"]);

  return items.slice(0, 3).map(enrichBbtiChallengeMatchup);
}

export function resolveBbtiChallengeLaneScoreboard({
  challengeMatchups,
  code,
}: ResolveBbtiChallengeLaneScoreboardInput): BbtiChallengeLaneScoreboard {
  const matchups = challengeMatchups?.length ? challengeMatchups : getBbtiChallengeMatchups(code);
  const rows = BBTI_CHALLENGE_LANE_ORDER.flatMap((category) => {
    const matchup = matchups.find((item) => item.category === category);
    if (!matchup) return [];

    const meta = BBTI_CHALLENGE_LANE_META[category];
    return [{
      id: meta.id,
      target: meta.target,
      category,
      matchupId: matchup.matchupId,
      routeLabel: meta.routeLabel,
      label: matchup.label,
      title: matchup.title,
      body: `${meta.bodyPrefix} ${matchup.reason}`,
      pressureQuestion: matchup.pressureQuestion,
      reason: matchup.reason,
      shareCopy: matchup.shareCopy,
    }];
  });

  return {
    version: BBTI_CHALLENGE_LANE_SCOREBOARD_VERSION,
    boundary: BBTI_CHALLENGE_LANE_SCOREBOARD_BOUNDARY,
    code,
    laneCount: rows.length,
    rows,
    copyText: [
      `BBTI 开庭选边板｜${code}`,
      ...rows.map((row, index) => `${index + 1}. ${row.routeLabel}：${row.title}｜${row.label}｜${row.reason}`),
      BBTI_CHALLENGE_LANE_SCOREBOARD_BOUNDARY,
    ].join("\n"),
  };
}
