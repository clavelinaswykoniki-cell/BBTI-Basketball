import { parseCustomMatchupId } from "./debate-loader";
import { getPlayerById, type Player } from "./player-database";
import { statBombs as kobeLeBronStatBombs } from "./personas";
import { kobeJordanStatBombs } from "./debates-kobe-jordan";
import { lebronJordanStatBombs } from "./debates-lebron-jordan";
import { magicBirdStatBombs } from "./debates-magic-bird";
import { curryDurantStatBombs } from "./debates-curry-durant";
import { shaqYaoStatBombs } from "./debates-shaq-yao";
import { duncanGarnettStatBombs } from "./debates-duncan-garnett";
import { aiTmacStatBombs } from "./debates-ai-tmac";

export type VoteSide = "kobe" | "lebron";

export interface ReplayStatBomb {
  stat: string;
  source: string;
  side: VoteSide;
}

interface RawStatBomb {
  stat: string;
  source: string;
  side: string;
}

type BombMap = Record<string, ReplayStatBomb[]>;

function normalizeBombs(
  bombs: Record<string, RawStatBomb[]>,
  sideMap: Record<string, VoteSide>,
): BombMap {
  return Object.fromEntries(
    Object.entries(bombs).map(([topicId, items]) => [
      topicId,
      items
        .map((item) => {
          const side = sideMap[item.side];
          if (!side) return null;
          return {
            stat: item.stat,
            source: item.source,
            side,
          };
        })
        .filter(Boolean) as ReplayStatBomb[],
    ]),
  );
}

const FIXED_MATCHUP_BOMBS: Record<string, BombMap> = {
  "kobe-vs-lebron": kobeLeBronStatBombs,
  "kobe-vs-jordan": normalizeBombs(kobeJordanStatBombs, {
    kobe: "kobe",
    jordan: "lebron",
  }),
  "lebron-vs-jordan": normalizeBombs(lebronJordanStatBombs, {
    jordan: "kobe",
    lebron: "lebron",
  }),
  "magic-vs-bird": normalizeBombs(magicBirdStatBombs, {
    magic: "kobe",
    bird: "lebron",
  }),
  "curry-vs-durant": normalizeBombs(curryDurantStatBombs, {
    curry: "kobe",
    durant: "lebron",
  }),
  "shaq-vs-yao": normalizeBombs(shaqYaoStatBombs, {
    shaq: "kobe",
    yao: "lebron",
  }),
  "duncan-vs-garnett": normalizeBombs(duncanGarnettStatBombs, {
    duncan: "kobe",
    garnett: "lebron",
  }),
  "ai-vs-tmac": normalizeBombs(aiTmacStatBombs, {
    ai: "kobe",
    tmac: "lebron",
  }),
};

function playerLabel(player: Player): string {
  return player.nameCN.split("·").pop() ?? player.nameCN;
}

function ringsLine(player: Player): string {
  const label = playerLabel(player);
  if (player.stats.rings > 0) {
    return `${label}${player.stats.rings}冠${player.stats.fmvps > 0 ? `/${player.stats.fmvps}FMVP` : ""}，荣誉柜不是空话。`;
  }
  return `${label}没有总冠军，但${player.stats.allStar}次全明星和${player.stats.allNBA}次最佳阵容说明他不是普通无冠球星。`;
}

function customBombs(playerA: Player, playerB: Player, topicId: string): ReplayStatBomb[] {
  const a = playerLabel(playerA);
  const b = playerLabel(playerB);
  const matchupSource = "BBTI球员数据库";

  const byTopic: Record<string, ReplayStatBomb[]> = {
    dominance: [
      {
        stat: `${a}生涯场均${playerA.stats.ppg}分/${playerA.stats.rpg}板/${playerA.stats.apg}助，${playerA.era}的存在感摆在台面上。`,
        source: matchupSource,
        side: "kobe",
      },
      {
        stat: `${b}生涯场均${playerB.stats.ppg}分/${playerB.stats.rpg}板/${playerB.stats.apg}助，硬数据不怕换题。`,
        source: matchupSource,
        side: "lebron",
      },
    ],
    championships: [
      { stat: ringsLine(playerA), source: matchupSource, side: "kobe" },
      { stat: ringsLine(playerB), source: matchupSource, side: "lebron" },
    ],
    skill: [
      {
        stat: `${a}的招牌风格：${playerA.style}。别只看荣誉，打法本身就是论据。`,
        source: matchupSource,
        side: "kobe",
      },
      {
        stat: `${b}的招牌风格：${playerB.style}。技术讨论不能只套一个审美模板。`,
        source: matchupSource,
        side: "lebron",
      },
    ],
    clutch: [
      {
        stat: `${a}代表成就：${playerA.achievements[0] ?? "生涯高光足够进历史讨论"}。大场面不是只看最后一投。`,
        source: matchupSource,
        side: "kobe",
      },
      {
        stat: `${b}代表成就：${playerB.achievements[0] ?? "生涯高光足够进历史讨论"}。关键时刻也要看完整履历。`,
        source: matchupSource,
        side: "lebron",
      },
    ],
    legacy: [
      {
        stat: `${a}${playerA.stats.allStar}次全明星/${playerA.stats.allNBA}次最佳阵容，历史存在感不是一两场球能抹掉的。`,
        source: matchupSource,
        side: "kobe",
      },
      {
        stat: `${b}${playerB.stats.allStar}次全明星/${playerB.stats.allNBA}次最佳阵容，长期被联盟认可就是硬通货。`,
        source: matchupSource,
        side: "lebron",
      },
    ],
    entertainment: [
      {
        stat: `${a}最能点燃观众的卖点：${playerA.strengths[0] ?? playerA.nicknameCN}。这就是买票理由。`,
        source: matchupSource,
        side: "kobe",
      },
      {
        stat: `${b}最能点燃观众的卖点：${playerB.strengths[0] ?? playerB.nicknameCN}。观赏性不是只有一种。`,
        source: matchupSource,
        side: "lebron",
      },
    ],
    impact: [
      {
        stat: `${a}的历史角度：${playerA.philosophicalAngle}。影响力不只在技术统计里。`,
        source: matchupSource,
        side: "kobe",
      },
      {
        stat: `${b}的历史角度：${playerB.philosophicalAngle}。换一套标准看，答案会变。`,
        source: matchupSource,
        side: "lebron",
      },
    ],
    "peak-vs-peak": [
      {
        stat: `${a}巅峰标签：${playerA.achievements[1] ?? playerA.strengths[0] ?? playerA.nicknameCN}。单点爆发有自己的杀伤力。`,
        source: matchupSource,
        side: "kobe",
      },
      {
        stat: `${b}巅峰标签：${playerB.achievements[1] ?? playerB.strengths[0] ?? playerB.nicknameCN}。巅峰对巅峰才公平。`,
        source: matchupSource,
        side: "lebron",
      },
    ],
  };

  return byTopic[topicId] ?? byTopic.dominance;
}

export function getStatBombsForMatchup(
  matchupId: string | null,
  topicId: string,
): ReplayStatBomb[] {
  if (matchupId?.startsWith("custom:")) {
    const parsed = parseCustomMatchupId(matchupId);
    if (!parsed) return [];
    try {
      return customBombs(getPlayerById(parsed.playerAId), getPlayerById(parsed.playerBId), topicId);
    } catch {
      return [];
    }
  }

  const matchupBombs = FIXED_MATCHUP_BOMBS[matchupId ?? "kobe-vs-lebron"];
  return matchupBombs?.[topicId] ?? kobeLeBronStatBombs[topicId] ?? [];
}
