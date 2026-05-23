export interface MatchupPlayer {
  name: string;
  nameZh: string;
  number: string;
  nickname: string;
  color: string;
}

export interface Matchup {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  playerA: MatchupPlayer;
  playerB: MatchupPlayer;
  debateFile: string;
}

export const matchups: Matchup[] = [
  {
    id: "kobe-vs-lebron",
    title: "科比 vs 詹姆斯",
    subtitle: "史上最大争议",
    emoji: "🐍👑",
    playerA: {
      name: "Kobe Bryant",
      nameZh: "科比",
      number: "#24",
      nickname: "Black Mamba",
      color: "kobe-gold",
    },
    playerB: {
      name: "LeBron James",
      nameZh: "詹姆斯",
      number: "#23",
      nickname: "King James",
      color: "lebron-gold",
    },
    debateFile: "kobe-vs-lebron",
  },
  {
    id: "kobe-vs-jordan",
    title: "科比 vs 乔丹",
    subtitle: "师徒还是传承？",
    emoji: "🐍🐐",
    playerA: {
      name: "Kobe Bryant",
      nameZh: "科比",
      number: "#24",
      nickname: "Black Mamba",
      color: "kobe-gold",
    },
    playerB: {
      name: "Michael Jordan",
      nameZh: "乔丹",
      number: "#23",
      nickname: "His Airness",
      color: "lebron-gold",
    },
    debateFile: "kobe-vs-jordan",
  },
  {
    id: "lebron-vs-jordan",
    title: "詹姆斯 vs 乔丹",
    subtitle: "谁才是真GOAT？",
    emoji: "👑🐐",
    playerA: {
      name: "LeBron James",
      nameZh: "詹姆斯",
      number: "#23",
      nickname: "King James",
      color: "lebron-gold",
    },
    playerB: {
      name: "Michael Jordan",
      nameZh: "乔丹",
      number: "#23",
      nickname: "His Airness",
      color: "kobe-gold",
    },
    debateFile: "lebron-vs-jordan",
  },
  {
    id: "magic-vs-bird",
    title: "魔术师 vs 大鸟",
    subtitle: "80年代宿命对决",
    emoji: "🎩🦅",
    playerA: {
      name: "Magic Johnson",
      nameZh: "魔术师",
      number: "#32",
      nickname: "Magic",
      color: "kobe-gold",
    },
    playerB: {
      name: "Larry Bird",
      nameZh: "大鸟",
      number: "#33",
      nickname: "Larry Legend",
      color: "lebron-gold",
    },
    debateFile: "magic-vs-bird",
  },
  {
    id: "curry-vs-durant",
    title: "库里 vs 杜兰特",
    subtitle: "勇士内战谁是老大？",
    emoji: "🍛🐍",
    playerA: {
      name: "Stephen Curry",
      nameZh: "库里",
      number: "#30",
      nickname: "Chef Curry",
      color: "kobe-gold",
    },
    playerB: {
      name: "Kevin Durant",
      nameZh: "杜兰特",
      number: "#35",
      nickname: "Slim Reaper",
      color: "lebron-gold",
    },
    debateFile: "curry-vs-durant",
  },
  {
    id: "shaq-vs-yao",
    title: "奥尼尔 vs 姚明",
    subtitle: "东西方中锋之王",
    emoji: "🦈🐉",
    playerA: {
      name: "Shaquille O'Neal",
      nameZh: "奥尼尔",
      number: "#34",
      nickname: "Diesel",
      color: "kobe-gold",
    },
    playerB: {
      name: "Yao Ming",
      nameZh: "姚明",
      number: "#11",
      nickname: "移动长城",
      color: "lebron-gold",
    },
    debateFile: "shaq-vs-yao",
  },
  {
    id: "duncan-vs-garnett",
    title: "邓肯 vs 加内特",
    subtitle: "大前锋之争",
    emoji: "🗿🐺",
    playerA: {
      name: "Tim Duncan",
      nameZh: "邓肯",
      number: "#21",
      nickname: "The Big Fundamental",
      color: "kobe-gold",
    },
    playerB: {
      name: "Kevin Garnett",
      nameZh: "加内特",
      number: "#21",
      nickname: "The Big Ticket",
      color: "lebron-gold",
    },
    debateFile: "duncan-vs-garnett",
  },
  {
    id: "ai-vs-tmac",
    title: "艾弗森 vs 麦迪",
    subtitle: "青春永不散场",
    emoji: "💎🌟",
    playerA: {
      name: "Allen Iverson",
      nameZh: "艾弗森",
      number: "#3",
      nickname: "The Answer",
      color: "kobe-gold",
    },
    playerB: {
      name: "Tracy McGrady",
      nameZh: "麦迪",
      number: "#1",
      nickname: "T-Mac",
      color: "lebron-gold",
    },
    debateFile: "ai-vs-tmac",
  },
];

export function getMatchupById(id: string): Matchup | undefined {
  if (id.startsWith("custom:")) {
    return buildCustomMatchup(id);
  }
  return matchups.find((m) => m.id === id);
}

// Override short Chinese names where the natural "last segment" feels wrong
// (e.g., 科比 is the convention, not 布莱恩特).
const SHORT_NAME_OVERRIDES: Record<string, string> = {
  kobe: "科比",
  shaq: "奥尼尔",
  yao: "姚明",
  magic: "魔术师",
  bird: "大鸟",
  ai: "艾弗森",
  tmac: "麦迪",
};

function shortChineseName(playerId: string, nameCN: string): string {
  if (SHORT_NAME_OVERRIDES[playerId]) return SHORT_NAME_OVERRIDES[playerId];
  if (nameCN.includes("·")) {
    return nameCN.split("·").pop() ?? nameCN;
  }
  return nameCN;
}

function buildCustomMatchup(id: string): Matchup | undefined {
  // Lazy import to avoid circular dependency at module load.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getPlayerById } = require("./player-database") as typeof import("./player-database");
  const body = id.slice("custom:".length);
  const [aId, bId] = body.split("-vs-");
  if (!aId || !bId) return undefined;
  try {
    const pA = getPlayerById(aId);
    const pB = getPlayerById(bId);
    const shortA = shortChineseName(pA.id, pA.nameCN);
    const shortB = shortChineseName(pB.id, pB.nameCN);
    return {
      id,
      title: `${shortA} vs ${shortB}`,
      subtitle: "自选对决",
      emoji: "⚡️",
      playerA: {
        name: pA.name,
        nameZh: shortA,
        number: pA.number,
        nickname: pA.nickname,
        color: "kobe-gold",
      },
      playerB: {
        name: pB.name,
        nameZh: shortB,
        number: pB.number,
        nickname: pB.nickname,
        color: "lebron-gold",
      },
      debateFile: id,
    };
  } catch {
    return undefined;
  }
}
