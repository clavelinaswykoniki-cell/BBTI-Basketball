import type { BbtiChallengeMatchup } from "./bbti-challenges";
import type { BbtiCounterEvidenceSourceId } from "./bbti-counter-evidence-sources";

export type BbtiCounterEvidenceFactField = "iconicMoment" | "receiptA" | "receiptB";

export type BbtiCounterEvidenceFactSource =
  | "challenge.iconicMoment"
  | "challenge.receiptA"
  | "challenge.receiptB";

export interface BbtiCounterEvidenceFact {
  id: string;
  matchupId: string;
  matchupTitle: string;
  field: BbtiCounterEvidenceFactField;
  evidenceSource: BbtiCounterEvidenceFactSource;
  text: string;
  scope: "matchup";
  metricLabel?: string;
  metricValue?: string;
  sourceKey: "bbti-challenge-evidence";
  sourceLabel: string;
  sourceId?: BbtiCounterEvidenceSourceId;
  supportsSide: "playerA" | "playerB" | "matchup";
  provenance: {
    sourceFile: "src/data/bbti-challenge-evidence.ts";
    sourceField: BbtiCounterEvidenceFactField;
  };
}

const FACT_FIELD_META: Record<
  BbtiCounterEvidenceFactField,
  Pick<BbtiCounterEvidenceFact, "evidenceSource" | "sourceLabel" | "supportsSide">
> = {
  iconicMoment: {
    evidenceSource: "challenge.iconicMoment",
    sourceLabel: "证物镜头",
    supportsSide: "matchup",
  },
  receiptA: {
    evidenceSource: "challenge.receiptA",
    sourceLabel: "证词 A",
    supportsSide: "playerA",
  },
  receiptB: {
    evidenceSource: "challenge.receiptB",
    sourceLabel: "证词 B",
    supportsSide: "playerB",
  },
};

const DEFAULT_FACT_ORDER: BbtiCounterEvidenceFactField[] = ["iconicMoment", "receiptB", "receiptA"];

export function getBbtiCounterEvidenceFacts(
  challenge?: BbtiChallengeMatchup,
): BbtiCounterEvidenceFact[] {
  if (!challenge) return [];

  return DEFAULT_FACT_ORDER.map((field) => {
    const text = challenge[field];
    if (!text) return null;
    const meta = FACT_FIELD_META[field];

    return {
      id: `${challenge.matchupId}:${field}`,
      matchupId: challenge.matchupId,
      matchupTitle: challenge.title,
      field,
      evidenceSource: meta.evidenceSource,
      text,
      scope: "matchup" as const,
      sourceKey: "bbti-challenge-evidence" as const,
      sourceLabel: `${challenge.title} · ${meta.sourceLabel}`,
      supportsSide: meta.supportsSide,
      provenance: {
        sourceFile: "src/data/bbti-challenge-evidence.ts" as const,
        sourceField: field,
      },
    };
  }).filter((fact): fact is BbtiCounterEvidenceFact => Boolean(fact));
}

export function pickBbtiCounterEvidenceFact(
  challenge: BbtiChallengeMatchup | undefined,
  preferredFields: BbtiCounterEvidenceFactField[] = DEFAULT_FACT_ORDER,
): BbtiCounterEvidenceFact | null {
  const facts = getBbtiCounterEvidenceFacts(challenge);

  for (const field of preferredFields) {
    const fact = facts.find((item) => item.field === field);
    if (fact) return fact;
  }

  return facts[0] ?? null;
}
