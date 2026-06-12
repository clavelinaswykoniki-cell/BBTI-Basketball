import type { Matchup, MatchupPlayer } from "@/data/matchups";

export interface MatchupSlots {
  kobe: MatchupPlayer;
  lebron: MatchupPlayer;
}

const FALLBACK_KOBE: MatchupPlayer = {
  name: "Kobe Bryant",
  nameZh: "科比",
  number: "#24",
  nickname: "Black Mamba",
  color: "kobe-gold",
};

const FALLBACK_LEBRON: MatchupPlayer = {
  name: "LeBron James",
  nameZh: "詹姆斯",
  number: "#23",
  nickname: "King James",
  color: "lebron-gold",
};

/**
 * The UI vote slots are still named "kobe" and "lebron" for legacy reasons.
 * Most matchups map playerA -> kobe and playerB -> lebron, but LeBron/Jordan
 * was authored with Jordan in the kobe slot and LeBron in the lebron slot.
 */
export function getMatchupSlots(matchupId: string | null, matchup: Matchup | null): MatchupSlots {
  const playerA = matchup?.playerA ?? FALLBACK_KOBE;
  const playerB = matchup?.playerB ?? FALLBACK_LEBRON;

  if (matchupId === "lebron-vs-jordan") {
    return {
      kobe: playerB,
      lebron: playerA,
    };
  }

  return {
    kobe: playerA,
    lebron: playerB,
  };
}
