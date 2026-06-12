"use client";

import { useMemo } from "react";
import {
  buildBbtiChallengeCaseCopy,
  type BbtiChallengeCaseContext,
} from "@/data/bbti-challenge-case";
import { buildBbtiCaseReturnUrl } from "@/lib/bbti-deep-links";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiChallengeCaseBannerProps {
  context: BbtiChallengeCaseContext | null;
  compact?: boolean;
}

function currentResultBaseHref(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}${window.location.pathname}`;
}

function buildCaseCopyWithUrl(context: BbtiChallengeCaseContext, baseHref?: string): string {
  return [
    buildBbtiChallengeCaseCopy(context),
    buildBbtiCaseReturnUrl(context, baseHref),
  ].join("\n");
}

export default function BbtiChallengeCaseBanner({
  context,
  compact = false,
}: BbtiChallengeCaseBannerProps) {
  const copyFeedback = useGuardedClipboard<"case">();
  const previewCopyText = useMemo(() => (
    context ? buildCaseCopyWithUrl(context, currentResultBaseHref()) : ""
  ), [context]);

  if (!context) return null;

  const copyCase = () => {
    copyFeedback.copyText(buildCaseCopyWithUrl(context, currentResultBaseHref()), "case");
  };
  const copied = copyFeedback.isCopied("case");
  const failed = copyFeedback.isFailed("case");
  const identity = context.typeName ?? context.code;
  const caseMeta = (() => {
    switch (context.source) {
      case "film-room":
        return {
          sourceLabel: "录像室案件",
          originLabel: `Q${context.questionId} · ${context.dimensionLabel}`,
          originTitle: `这场开战来自 ${identity} 的录像室案件`,
          originBody: context.answerText,
          originBodyLabel: "录像室原题",
          standard: context.crossExamStandard,
          question: context.crossExamQuestion,
          extra: null,
        };
      case "result":
        return {
          sourceLabel: "赛后报告案由",
          originLabel: "命定对线 · 证物包",
          originTitle: `这场开战来自 ${identity} 的赛后报告`,
          originBody: context.evidenceLine ?? context.recommendationReason,
          originBodyLabel: "赛后证物",
          standard: context.recommendationReason,
          question: context.caseQuestion,
          extra: null,
        };
      case "arena-event":
        return {
          sourceLabel: "情境加赛",
          originLabel: `${context.eventTag} · ${context.originLabel}`,
          originTitle: `这场开战来自 ${identity} 的${context.eventTitle}情境`,
          originBody: context.eventScenario,
          originBodyLabel: "赛事情境",
          standard: context.eventPressureTest,
          question: context.caseQuestion,
          extra: context.eventBlindSpot,
        };
    }
  })();

  return (
    <section
      aria-label="BBTI录像室案件上下文"
      className={`w-full max-w-3xl rounded-2xl border border-kobe-gold/25 bg-gradient-to-r from-kobe-gold/10 via-white/[0.04] to-lebron-wine/20 p-4 ${
        compact ? "mb-5" : "mb-6"
      }`}
      style={{ animation: "fade-up 0.45s ease-out" }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-kobe-gold/30 bg-kobe-gold/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-kobe-gold">
              BBTI Case
            </span>
            <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-bold text-white/48">
              {caseMeta.originLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-bold text-white/48">
              {caseMeta.sourceLabel}
            </span>
          </div>
          <h3 className="text-base font-black leading-snug text-white sm:text-lg">
            {caseMeta.originTitle}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-white/56 sm:text-sm">
            {context.challengeTitle} · {context.challengeLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={copyCase}
          className="min-h-[38px] shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black text-white/68 transition-colors hover:border-kobe-gold/40 hover:text-kobe-gold"
        >
          {failed ? "复制失败，可手动复制" : copied ? "已复制" : "复制案件"}
        </button>
      </div>

      <div className={`mt-3 grid grid-cols-1 gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="mb-1 text-[11px] uppercase tracking-widest text-white/30">{caseMeta.originBodyLabel}</p>
          <p className="text-xs font-bold leading-relaxed text-white/72">{caseMeta.originBody}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="mb-1 text-[11px] uppercase tracking-widest text-white/30">审查标准</p>
          <p className="text-xs leading-relaxed text-white/72">{caseMeta.standard}</p>
        </div>
        {!compact && (
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="mb-1 text-[11px] uppercase tracking-widest text-white/30">对方追问</p>
            <p className="text-xs leading-relaxed text-white/72">{caseMeta.question}</p>
          </div>
        )}
      </div>

      {context.pressureQuestion && (
        <p className="mt-3 rounded-xl border border-lebron-gold/20 bg-lebron-wine/16 px-3 py-2 text-xs font-bold leading-relaxed text-lebron-gold/78">
          本场案由：{context.pressureQuestion}
        </p>
      )}

      {context.evidenceLine && !compact && context.source === "film-room" && (
        <p className="mt-2 text-xs leading-relaxed text-white/42">
          证据线：{context.evidenceLine}
        </p>
      )}

      {caseMeta.extra && !compact && (
        <p className="mt-2 text-xs leading-relaxed text-white/42">
          盲点提醒：{caseMeta.extra}
        </p>
      )}

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copied ? "已复制案件" : failed ? "案件自动复制失败，可手动复制" : ""}
      </p>

      <BbtiManualCopyFallback
        text={copyFeedback.feedback.manualCopyText === previewCopyText ? copyFeedback.feedback.manualCopyText : failed ? previewCopyText : ""}
        title="自动复制失败，长按下方案件文案复制。"
        className="mt-3"
      />
    </section>
  );
}
