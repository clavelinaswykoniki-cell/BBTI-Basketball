import { getMatchupById } from "@/data/matchups";

export interface DebateDeepLink {
  mode: "debate" | null;
  matchupId: string | null;
}

function paramsFrom(search: string | URLSearchParams): URLSearchParams {
  return typeof search === "string" ? new URLSearchParams(search) : search;
}

function validMatchupIdFrom(raw: string | null | undefined): string | null {
  const value = raw?.trim().toLowerCase() ?? "";
  if (!value || value.length > 96) return null;
  if (!/^(?:[a-z0-9]+(?:-[a-z0-9]+)*|custom:[a-z0-9]+(?:-[a-z0-9]+)*-vs-[a-z0-9]+(?:-[a-z0-9]+)*)$/.test(value)) {
    return null;
  }
  return getMatchupById(value) ? value : null;
}

export function parseDebateDeepLink(search: string | URLSearchParams): DebateDeepLink {
  const params = paramsFrom(search);
  const mode = params.get("mode")?.trim().toLowerCase() === "debate" ? "debate" : null;
  const matchupId = mode ? validMatchupIdFrom(params.get("matchup")) : null;

  return { mode: matchupId ? mode : null, matchupId };
}

export function buildDebateMatchupUrl(matchupId: string, baseHref?: string): string {
  const href = baseHref ?? (typeof window !== "undefined" ? window.location.href : "http://localhost:3000");
  const url = new URL(href);

  url.hash = "";
  url.searchParams.delete("bbti");
  url.searchParams.delete("event");
  url.searchParams.delete("challenge");
  url.searchParams.delete("clip");
  url.searchParams.delete("a");
  url.searchParams.delete("b");
  url.searchParams.set("mode", "debate");
  url.searchParams.set("matchup", validMatchupIdFrom(matchupId) ?? "kobe-vs-lebron");

  return url.toString();
}
