import type { DebateTopic } from "./debates";
import { debates, bonusDebates } from "./debates";
import { kobeJordanDebates, kobeJordanBonusDebates } from "./debates-kobe-jordan";
import { lebronJordanDebates, lebronJordanBonusDebates } from "./debates-lebron-jordan";
import { magicBirdDebates, magicBirdBonusDebates } from "./debates-magic-bird";
import { curryDurantDebates, curryDurantBonusDebates } from "./debates-curry-durant";
import { shaqYaoDebates, shaqYaoBonusDebates } from "./debates-shaq-yao";
import { duncanGarnettDebates, duncanGarnettBonusDebates } from "./debates-duncan-garnett";
import { aiTmacDebates, aiTmacBonusDebates } from "./debates-ai-tmac";
import { getPlayerById } from "./player-database";
import { generateMatchupDebates } from "./universal-debates";

export const CUSTOM_PREFIX = "custom:";

export function isCustomMatchupId(id: string | null): boolean {
  return !!id && id.startsWith(CUSTOM_PREFIX);
}

export function parseCustomMatchupId(id: string): { playerAId: string; playerBId: string } | null {
  if (!id.startsWith(CUSTOM_PREFIX)) return null;
  const body = id.slice(CUSTOM_PREFIX.length);
  const [a, b] = body.split("-vs-");
  if (!a || !b) return null;
  return { playerAId: a, playerBId: b };
}

export function buildCustomMatchupId(playerAId: string, playerBId: string): string {
  return `${CUSTOM_PREFIX}${playerAId}-vs-${playerBId}`;
}

function adaptMagicBird(items: typeof magicBirdDebates): DebateTopic[] {
  return items.map((d) => ({
    id: d.id,
    title: d.title,
    emoji: d.emoji,
    kobe: d.magic,
    lebron: d.bird,
  }));
}

interface MatchupDebates {
  main: DebateTopic[];
  bonus: DebateTopic[];
}

const matchupData: Record<string, MatchupDebates> = {
  "kobe-vs-lebron": { main: debates, bonus: bonusDebates },
  "kobe-vs-jordan": { main: kobeJordanDebates, bonus: kobeJordanBonusDebates },
  "lebron-vs-jordan": { main: lebronJordanDebates, bonus: lebronJordanBonusDebates },
  "magic-vs-bird": { main: adaptMagicBird(magicBirdDebates), bonus: adaptMagicBird(magicBirdBonusDebates) },
  "curry-vs-durant": { main: curryDurantDebates, bonus: curryDurantBonusDebates },
  "shaq-vs-yao": { main: shaqYaoDebates, bonus: shaqYaoBonusDebates },
  "duncan-vs-garnett": { main: duncanGarnettDebates, bonus: duncanGarnettBonusDebates },
  "ai-vs-tmac": { main: aiTmacDebates, bonus: aiTmacBonusDebates },
};

export function getDebatesForMatchup(matchupId: string | null): MatchupDebates {
  if (!matchupId) return { main: debates, bonus: bonusDebates };
  if (isCustomMatchupId(matchupId)) {
    const parsed = parseCustomMatchupId(matchupId);
    if (!parsed) return { main: debates, bonus: bonusDebates };
    try {
      const pA = getPlayerById(parsed.playerAId);
      const pB = getPlayerById(parsed.playerBId);
      return generateMatchupDebates(pA, pB);
    } catch {
      return { main: debates, bonus: bonusDebates };
    }
  }
  return matchupData[matchupId] ?? { main: debates, bonus: bonusDebates };
}
