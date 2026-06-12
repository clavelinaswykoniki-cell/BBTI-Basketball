export type BbtiCounterEvidenceSourceId = string;

export type BbtiCounterEvidenceSourceTier = "official" | "database" | "media" | "video";

export type BbtiCounterEvidenceSourceType =
  | "boxScore"
  | "playByPlay"
  | "awardVoting"
  | "tracking"
  | "transaction"
  | "injuryReport"
  | "quote"
  | "video";

export type BbtiCounterEvidenceRiskLevel =
  | "hardNumber"
  | "movingTotal"
  | "quote"
  | "subjectiveBanter";

export interface BbtiCounterEvidenceSourceRecord {
  id: BbtiCounterEvidenceSourceId;
  label: string;
  url: string;
  publisher: string;
  sourceTier: BbtiCounterEvidenceSourceTier;
  evidenceType: BbtiCounterEvidenceSourceType;
  riskLevel: BbtiCounterEvidenceRiskLevel;
  verificationStatus: "verified";
  canonicalHost?: string;
  eventDate?: string;
  season?: string;
  asOfDate?: string;
  checkedAt: string;
  checkedBy: "manual" | "script";
  notes?: string;
}

const ALLOWED_COUNTER_EVIDENCE_SOURCE_HOSTS = [
  "www.nba.com",
  "stats.nba.com",
  "www.basketball-reference.com",
] as const;

const VERIFIED_COUNTER_EVIDENCE_SOURCES: Record<
  BbtiCounterEvidenceSourceId,
  BbtiCounterEvidenceSourceRecord
> = {};

export const BBTI_COUNTER_EVIDENCE_SOURCES = VERIFIED_COUNTER_EVIDENCE_SOURCES;

export function listBbtiCounterEvidenceSources(): BbtiCounterEvidenceSourceRecord[] {
  return Object.values(VERIFIED_COUNTER_EVIDENCE_SOURCES);
}

export function getBbtiCounterEvidenceSource(
  sourceId?: string,
): BbtiCounterEvidenceSourceRecord | null {
  if (!sourceId) return null;
  return VERIFIED_COUNTER_EVIDENCE_SOURCES[sourceId] ?? null;
}

export function hasBbtiCounterEvidenceSource(sourceId?: string): boolean {
  return Boolean(getBbtiCounterEvidenceSource(sourceId));
}

export function isAllowedBbtiCounterEvidenceSourceUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_COUNTER_EVIDENCE_SOURCE_HOSTS.includes(
      parsed.hostname as (typeof ALLOWED_COUNTER_EVIDENCE_SOURCE_HOSTS)[number],
    );
  } catch {
    return false;
  }
}

function isIsoDateLike(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

export function validateBbtiCounterEvidenceSourceRecord(
  source: BbtiCounterEvidenceSourceRecord,
): string[] {
  const errors: string[] = [];

  if (!source.id.trim()) errors.push("id is required");
  if (!source.label.trim()) errors.push("label is required");
  if (!source.publisher.trim()) errors.push("publisher is required");
  if (!source.url.startsWith("https://")) errors.push("url must be HTTPS");
  if (!isAllowedBbtiCounterEvidenceSourceUrl(source.url)) {
    errors.push("url host is not in the BBTI counter-evidence allowlist");
  }
  if (source.canonicalHost) {
    try {
      const parsed = new URL(source.url);
      if (parsed.hostname !== source.canonicalHost) {
        errors.push("canonicalHost must match url hostname");
      }
    } catch {
      errors.push("url must be parseable");
    }
  }
  if (source.verificationStatus !== "verified") {
    errors.push("verificationStatus must be verified before registration");
  }
  if (!isIsoDateLike(source.checkedAt)) errors.push("checkedAt must be a parseable date");
  if (source.asOfDate && !isIsoDateLike(source.asOfDate)) {
    errors.push("asOfDate must be a parseable date when present");
  }
  if (source.eventDate && !isIsoDateLike(source.eventDate)) {
    errors.push("eventDate must be a parseable date when present");
  }

  return errors;
}
