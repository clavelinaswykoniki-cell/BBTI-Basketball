"use client";

import { useMemo } from "react";
import {
  resolveBbtiChallengeCaseTrail,
  type BbtiCaseTrailVote,
} from "@/data/bbti-challenge-case-trail";
import type { BbtiChallengeCaseContext } from "@/data/bbti-challenge-case";
import type { DebateTopic } from "@/data/debates";
import { buildBbtiCaseReturnUrl } from "@/lib/bbti-deep-links";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiChallengeCaseTrailProps {
  context: BbtiChallengeCaseContext | null;
  currentRound: number;
  nameA: string;
  nameB: string;
  topics: DebateTopic[];
  votes: BbtiCaseTrailVote[];
}

const STEP_STYLES = {
  completed: "border-kobe-gold/24 bg-kobe-gold/[0.08] text-kobe-gold/78",
  current: "border-sky-300/24 bg-sky-300/[0.08] text-sky-100/78",
  upcoming: "border-white/10 bg-white/[0.03] text-white/38",
};

function currentResultBaseHref(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}${window.location.pathname}`;
}

function compactUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

export default function BbtiChallengeCaseTrail({
  context,
  currentRound,
  nameA,
  nameB,
  topics,
  votes,
}: BbtiChallengeCaseTrailProps) {
  const copyFeedback = useGuardedClipboard<"trail">();
  const trail = useMemo(
    () => resolveBbtiChallengeCaseTrail({
      context,
      currentRound,
      nameA,
      nameB,
      topics,
      votes,
    }),
    [context, currentRound, nameA, nameB, topics, votes],
  );
  const caseReturnUrl = useMemo(
    () => (context ? buildBbtiCaseReturnUrl(context, currentResultBaseHref()) : ""),
    [context],
  );

  if (!trail || !context) return null;

  const currentIndex = Math.min(Math.max(currentRound, 0), Math.max(trail.steps.length - 1, 0));
  const visibleSteps = trail.steps.slice(
    Math.max(0, currentIndex - 2),
    Math.min(trail.steps.length, currentIndex + 2),
  );
  const copyText = [
    trail.copyText,
    caseReturnUrl ? `案由回流：${caseReturnUrl}` : null,
  ].filter(Boolean).join("\n");
  const copied = copyFeedback.isCopied("trail");
  const failed = copyFeedback.isFailed("trail");

  return (
    <section
      data-testid="bbti-case-trail"
      data-bbti-case-source={context.source}
      data-bbti-case-source-version={trail.caseSourceVersion}
      data-bbti-case-version={trail.caseVersion}
      data-bbti-case-progress={trail.progressLabel}
      aria-labelledby="bbti-case-trail-title"
      className="mx-auto mt-3 w-full max-w-2xl rounded-2xl border border-kobe-gold/20 bg-gradient-to-r from-kobe-gold/[0.07] via-white/[0.035] to-sky-400/[0.06] p-3 sm:mt-4 sm:p-4"
      style={{ animation: "fade-up 0.5s ease-out" }}
    >
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-kobe-gold/25 bg-kobe-gold/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-kobe-gold">
              Case Trail
            </span>
            <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-bold text-white/50">
              {trail.sourceLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-bold text-white/38">
              {trail.caseVersion}
            </span>
          </div>
          <h3 id="bbti-case-trail-title" className="text-base font-black text-white">
            {trail.title}
          </h3>
          <p className="mt-1 text-xs font-bold leading-relaxed text-white/52">
            {trail.sourceDetail} · {context.challengeTitle}
          </p>
        </div>
        <button
          data-testid="bbti-case-trail-copy"
          type="button"
          onClick={() => copyFeedback.copyText(copyText, "trail")}
          className="min-h-[38px] shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black text-white/68 transition-colors hover:border-kobe-gold/40 hover:text-kobe-gold"
        >
          {failed ? "复制失败，可手动复制" : copied ? "已复制轨迹" : "复制轨迹"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1.2fr] sm:gap-3">
        <div className="rounded-xl border border-white/10 bg-black/20 p-2.5 sm:p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
              {trail.standardLabel}
            </p>
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-black text-white/42">
              {trail.progressLabel}
            </span>
          </div>
          <p className="text-xs font-bold leading-relaxed text-white/72">
            {trail.standard}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-kobe-gold/72">
            追问：{trail.reviewQuestion}
          </p>
        </div>

        <div className="space-y-2">
          {visibleSteps.map((step) => (
            <div
              key={step.topicId}
              data-testid="bbti-case-trail-step"
              data-bbti-step-state={step.state}
              data-bbti-step-topic={step.topicId}
              className={`rounded-xl border px-3 py-2 ${STEP_STYLES[step.state]}`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {step.roundLabel}
                </span>
                <span className="truncate text-[10px] font-black">
                  {step.selectedSideName ?? "待选择"}
                </span>
              </div>
              <p className="text-xs font-black leading-snug text-white">
                {step.topicTitle}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-white/52">
                {step.responseLine}
              </p>
            </div>
          ))}
        </div>
      </div>

      {caseReturnUrl && (
        <p className="mt-3 break-all rounded-xl border border-white/10 bg-black/18 px-3 py-2 text-[11px] font-bold leading-relaxed text-white/38">
          案由回流：{compactUrl(caseReturnUrl)}
        </p>
      )}

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copied ? "已复制BBTI案件轨迹" : failed ? "BBTI案件轨迹自动复制失败，可手动复制" : ""}
      </p>

      <BbtiManualCopyFallback
        text={copyFeedback.feedback.manualCopyText}
        title="自动复制失败，长按下方轨迹文案复制。"
        className="mt-3"
      />
    </section>
  );
}
