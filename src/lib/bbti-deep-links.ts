import type { BbtiChallengeCaseContext } from "@/data/bbti-challenge-case";

export const BBTI_CODE_PATTERN = /^[OD][AE][IT][LR]$/;

export interface BbtiDeepLink {
  code: string | null;
  eventId: string | null;
  challengeMatchupId: string | null;
  hasClipParam: boolean;
  rawClip: string | null;
  clipQuestionId: number | null;
  clipKey: string | null;
}

export interface BbtiCompareDeepLink {
  codeA: string | null;
  codeB: string | null;
  hasCompareParams: boolean;
}

const BBTI_INTERNAL_CASE_QUERY_PARAMS = [
  "caseVersion",
  "caseSourceVersion",
  "caseRegistryVersion",
  "caseRegistryKey",
  "caseContext",
  "caseCopy",
  "caseText",
  "caseQuestion",
  "cv",
  "evidenceLine",
  "evidenceLens",
  "eventScenario",
  "eventTitle",
  "pressureLine",
  "pressureQuestion",
  "reason",
  "recommendationReason",
  "shareCopy",
  "sourceLabel",
  "sourceId",
  "sourceUrl",
];

function paramsFrom(search: string | URLSearchParams): URLSearchParams {
  return typeof search === "string" ? new URLSearchParams(search) : search;
}

function validCodeFrom(raw: string | null | undefined): string | null {
  const code = raw?.trim().toUpperCase() ?? null;
  return code && BBTI_CODE_PATTERN.test(code) ? code : null;
}

function validPositiveIntFrom(raw: string | null | undefined): number | null {
  const value = raw?.trim() ?? "";
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function validFullClipKeyFrom(raw: string | null | undefined): string | null {
  const value = raw?.trim().toLowerCase() ?? "";
  return /^q\d+-(?:a|b|m\d+(?:\.\d+)*)$/.test(value) ? value : null;
}

function clipQuestionIdFrom(rawClip: string | null, clipKey: string | null): number | null {
  const rawValue = rawClip?.trim().toLowerCase() ?? "";
  const fullKeyMatch = clipKey?.match(/^q(\d+)-/);
  const bareMatch = rawValue.match(/^(?:q)?(\d+)$/);
  return validPositiveIntFrom(fullKeyMatch?.[1] ?? bareMatch?.[1]);
}

function stripInternalCaseParams(url: URL) {
  for (const key of BBTI_INTERNAL_CASE_QUERY_PARAMS) {
    url.searchParams.delete(key);
  }
}

export function parseBbtiDeepLink(search: string | URLSearchParams): BbtiDeepLink {
  const params = paramsFrom(search);
  const hasClipParam = params.has("clip");
  const rawClip = hasClipParam ? params.get("clip")?.trim() ?? "" : null;
  const clipKey = validFullClipKeyFrom(rawClip);

  return {
    code: validCodeFrom(params.get("bbti")),
    eventId: params.get("event")?.trim() || null,
    challengeMatchupId: params.get("challenge")?.trim() || null,
    hasClipParam,
    rawClip: rawClip || null,
    clipQuestionId: clipQuestionIdFrom(rawClip, clipKey),
    clipKey,
  };
}

export function parseBbtiCompareDeepLink(search: string | URLSearchParams): BbtiCompareDeepLink {
  const params = paramsFrom(search);

  return {
    codeA: validCodeFrom(params.get("a")),
    codeB: validCodeFrom(params.get("b")),
    hasCompareParams: params.has("a") || params.has("b"),
  };
}

export function buildBbtiResultUrl(
  code: string,
  options: {
    eventId?: string | null;
    challengeMatchupId?: string | null;
    clipQuestionId?: number | string | null;
    clipKey?: string | null;
  } = {},
  baseHref?: string,
): string {
  const href = baseHref ?? (typeof window !== "undefined" ? window.location.href : "http://localhost:3000");
  const url = new URL(href);

  stripInternalCaseParams(url);
  url.searchParams.delete("a");
  url.searchParams.delete("b");
  url.searchParams.delete("mode");
  url.searchParams.delete("matchup");
  url.searchParams.set("bbti", code);

  if (options.eventId) {
    url.searchParams.set("event", options.eventId);
  } else {
    url.searchParams.delete("event");
  }

  if (options.challengeMatchupId) {
    url.searchParams.set("challenge", options.challengeMatchupId);
  } else {
    url.searchParams.delete("challenge");
  }

  if (options.clipKey) {
    url.searchParams.set("clip", options.clipKey);
  } else if (options.clipQuestionId) {
    url.searchParams.set("clip", String(options.clipQuestionId));
  } else {
    url.searchParams.delete("clip");
  }

  return url.toString();
}

export function buildBbtiCaseReturnUrl(
  context: BbtiChallengeCaseContext,
  baseHref?: string,
): string {
  return buildBbtiResultUrl(context.code, {
    eventId: context.source === "arena-event" ? context.eventId : null,
    challengeMatchupId: context.challengeMatchupId,
    clipKey: context.source === "film-room" ? context.clipKey : null,
  }, baseHref);
}

export function buildBbtiCompareUrl(codeA: string, codeB: string, baseHref?: string): string {
  const href = baseHref ?? (typeof window !== "undefined" ? window.location.href : "http://localhost:3000");
  const url = new URL(href);

  stripInternalCaseParams(url);
  url.searchParams.delete("bbti");
  url.searchParams.delete("event");
  url.searchParams.delete("challenge");
  url.searchParams.delete("clip");
  url.searchParams.delete("mode");
  url.searchParams.delete("matchup");
  url.searchParams.set("a", codeA);
  url.searchParams.set("b", codeB);

  return url.toString();
}

export function buildBbtiCompareInviteUrl(codeA: string, baseHref?: string): string {
  const href = baseHref ?? (typeof window !== "undefined" ? window.location.href : "http://localhost:3000");
  const url = new URL(href);

  stripInternalCaseParams(url);
  url.searchParams.delete("bbti");
  url.searchParams.delete("event");
  url.searchParams.delete("challenge");
  url.searchParams.delete("clip");
  url.searchParams.delete("mode");
  url.searchParams.delete("matchup");
  url.searchParams.set("a", codeA);
  url.searchParams.delete("b");

  return url.toString();
}
