import type { BbtiChallengeCaseContext } from "./bbti-challenge-case";

export interface BbtiShareReturnPrompt {
  collapsedDescription: string;
  ctaLabel: string;
  description: string;
  evidenceChips: string[];
  metaChips: string[];
  previewLabel: string;
  previewLines: string[];
}

function casePreviewLines(caseContext: BbtiChallengeCaseContext | null): string[] {
  if (!caseContext) return [];

  if (caseContext.source === "arena-event") {
    return [
      caseContext.eventScenario,
      caseContext.eventBlindSpot,
    ];
  }

  if (caseContext.source === "film-room") {
    return [
      `Q${caseContext.questionId}｜${caseContext.dimensionLabel}`,
      caseContext.crossExamStandard || caseContext.counterPunch,
    ].filter((line): line is string => Boolean(line));
  }

  return [
    caseContext.recommendationReason,
    caseContext.evidenceLine ?? caseContext.caseQuestion,
  ].filter((line): line is string => Boolean(line));
}

function caseMetaChips(caseContext: BbtiChallengeCaseContext | null): string[] {
  if (!caseContext) return [];

  if (caseContext.source === "film-room") {
    return [
      `Q${caseContext.questionId}`,
      caseContext.dimensionLabel,
      caseContext.coachTitle,
    ];
  }

  if (caseContext.source === "arena-event") {
    return [
      caseContext.eventTag,
      caseContext.challengeCategory,
      "情境题",
    ];
  }

  return [
    caseContext.originLabel,
    caseContext.challengeCategory,
    "赛后推荐",
  ];
}

function descriptionForNotice(
  caseContext: BbtiChallengeCaseContext | null,
  eventTitle: string | null,
): string {
  if (caseContext?.source === "film-room") {
    return `这条链接只复原 Q${caseContext.questionId}「${caseContext.dimensionLabel}」这一段录像室案由，不恢复对方完整答卷，也不携带任何外部热度数据。先看标准，再决定要不要带案由进场。`;
  }

  if (caseContext?.source === "arena-event") {
    return `这条链接来自「${eventTitle ?? caseContext.eventTitle}」事件题。先看完球探报告，再决定要不要接这场情境加赛。`;
  }

  if (caseContext?.source === "result") {
    return `这条链接来自 ${caseContext.code} 的赛后推荐对线。进场会带上推荐理由、压力题和证据标签。`;
  }

  return "这条链接会先恢复你的 BBTI 球探报告，再带你进教练挑战。";
}

function collapsedDescriptionFor(caseContext: BbtiChallengeCaseContext | null): string {
  if (caseContext?.source === "film-room") {
    return `保留 Q${caseContext.questionId} 录像室案由和证据标签。`;
  }

  if (caseContext?.source === "arena-event") {
    return `保留 ${caseContext.eventTag} 情境、压力题和证据标签。`;
  }

  return "回流链接仍保留案由、压力题和证据标签。";
}

function previewLabelFor(caseContext: BbtiChallengeCaseContext | null): string {
  if (caseContext?.source === "film-room") return "录像室案由预览";
  if (caseContext?.source === "arena-event") return "情境案由预览";
  return "案由预览";
}

function ctaLabelFor(caseContext: BbtiChallengeCaseContext | null): string {
  if (!caseContext) return "进入普通约战";
  if (caseContext.source === "film-room") return "用录像室案由接加赛";
  return caseContext.source === "arena-event" ? "接这场情境加赛" : "接赛后约战";
}

export function resolveBbtiShareReturnPrompt(
  caseContext: BbtiChallengeCaseContext | null,
  eventTitle: string | null = null,
): BbtiShareReturnPrompt {
  return {
    collapsedDescription: collapsedDescriptionFor(caseContext),
    ctaLabel: ctaLabelFor(caseContext),
    description: descriptionForNotice(caseContext, eventTitle),
    evidenceChips: caseContext?.evidenceLens ?? [],
    metaChips: caseMetaChips(caseContext),
    previewLabel: previewLabelFor(caseContext),
    previewLines: casePreviewLines(caseContext),
  };
}
