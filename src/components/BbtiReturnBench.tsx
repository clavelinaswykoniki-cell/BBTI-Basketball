"use client";

import { useMemo } from "react";
import type { BbtiChallengeCaseContext } from "@/data/bbti-challenge-case";
import {
  getBbtiDailyReturnPlay,
  resolveBbtiDailyReturnCaseContext,
  resolveBbtiReturnStreak,
} from "@/data/bbti-daily-return";
import type { StoredBbtiResult } from "@/data/bbti-playbook";
import { getBbtiShareTargetPreset } from "@/data/bbti-share-target-presets";
import { buildBbtiCompareInviteUrl, buildBbtiResultUrl } from "@/lib/bbti-deep-links";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiReturnBenchProps {
  result: StoredBbtiResult;
  onOpenResult: (code: string) => void;
  onChallengeMatchup: (matchupId: string, caseContext?: BbtiChallengeCaseContext | null) => void;
}

function modeLabel(mode: StoredBbtiResult["mode"]): string {
  if (mode === "full") return "抢七长卷";
  if (mode === "quick") return "常规赛版";
  return "快攻版";
}

function formatSavedAt(savedAt: string): string {
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("zh-CN");
}

export default function BbtiReturnBench({
  result,
  onOpenResult,
  onChallengeMatchup,
}: BbtiReturnBenchProps) {
  const copyFeedback = useGuardedClipboard<"compare" | "streak">();
  const dailyReturn = useMemo(() => getBbtiDailyReturnPlay(result.code), [result.code]);
  const returnStreak = useMemo(
    () => resolveBbtiReturnStreak(result, dailyReturn),
    [dailyReturn, result],
  );
  const challenges = dailyReturn.challenges;
  const returnDuoPreset = getBbtiShareTargetPreset("return-duo");
  const featuredChallenge = dailyReturn.featuredChallenge;
  const featuredCaseContext = useMemo(
    () => resolveBbtiDailyReturnCaseContext(dailyReturn),
    [dailyReturn],
  );
  const savedAt = formatSavedAt(result.savedAt);
  const resultMeta = savedAt ? `${modeLabel(result.mode)} · ${savedAt}` : modeLabel(result.mode);
  const copyStatusText = copyFeedback.isCopied("compare")
    ? "已复制对比邀请"
    : copyFeedback.isFailed("compare")
      ? "对比邀请自动复制失败，可手动复制"
      : copyFeedback.isCopied("streak")
        ? "已复制回访主线"
        : copyFeedback.isFailed("streak")
          ? "回访主线自动复制失败，可手动复制"
          : "";

  const copyCompareInvite = () => {
    const baseHref = `${window.location.origin}${window.location.pathname}`;
    const inviteUrl = buildBbtiCompareInviteUrl(result.code, baseHref);
    const prompt = `${result.emoji} 我上次测出 ${result.code} ${result.name}。你也测一个 BBTI，跟我生成双人球脑化学反应报告。`;

    copyFeedback.copyText(`${prompt}\n${inviteUrl}`, "compare");
  };

  const copyReturnStreak = () => {
    const baseHref = `${window.location.origin}${window.location.pathname}`;
    const returnUrl = buildBbtiResultUrl(result.code, {
      eventId: dailyReturn.event?.id,
      challengeMatchupId: featuredChallenge?.matchupId,
    }, baseHref);

    copyFeedback.copyText(`${returnStreak.copyText}\n回访入口：${returnUrl}`, "streak");
  };

  return (
    <section
      data-testid="bbti-return-bench"
      data-bbti-return-streak-version={returnStreak.version}
      data-bbti-return-streak-code={returnStreak.code}
      data-bbti-return-streak-date={returnStreak.dateKey}
      data-bbti-return-streak-event={returnStreak.eventId ?? "none"}
      data-bbti-return-streak-featured={returnStreak.featuredChallengeId ?? "none"}
      data-bbti-return-streak-case-source={returnStreak.caseContextSource ?? "none"}
      className="w-full max-w-5xl mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5"
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-kobe-gold/75">
            {returnStreak.label}
          </p>
          <h2 className="mt-1 text-xl sm:text-2xl font-black text-white">
            {returnStreak.headline}
          </h2>
        </div>
        <p className="text-xs font-bold text-white/35">
          {returnStreak.boundary}
        </p>
      </div>
      <div
        data-testid="bbti-return-streak-summary"
        data-bbti-return-streak-step-count={returnStreak.steps.length}
        className="mb-4 rounded-2xl border border-kobe-gold/15 bg-kobe-gold/[0.06] p-3"
      >
        <p className="text-xs font-bold leading-relaxed text-white/58">
          {returnStreak.summary}
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {returnStreak.steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              data-testid="bbti-return-streak-step"
              data-bbti-return-streak-step={step.id}
              data-bbti-return-streak-target={step.target}
              data-bbti-return-streak-position={index + 1}
              onClick={() => {
                if (step.target === "result") {
                  onOpenResult(result.code);
                  return;
                }
                if (step.target === "daily-event") {
                  onOpenResult(result.code);
                  return;
                }
                if (featuredChallenge) {
                  onChallengeMatchup(featuredChallenge.matchupId, featuredCaseContext);
                }
              }}
              className="min-h-[112px] rounded-xl border border-white/10 bg-black/16 p-3 text-left transition-colors hover:border-kobe-gold/35 hover:bg-kobe-gold/[0.08]"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-white/32">
                {step.label}
              </span>
              <span className="mt-1 block text-sm font-black leading-snug text-white">
                {step.title}
              </span>
              <span className="mt-1 block text-[11px] font-bold leading-relaxed text-white/48">
                {step.body}
              </span>
              <span className="mt-2 block text-[10px] font-black text-kobe-gold/70">
                {step.ctaLabel}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-4">
        <div className="min-w-0">
          <p className="text-xs text-white/35 uppercase tracking-widest mb-2">
            Last Scouting Report
          </p>
          <div className="flex items-start gap-3">
            <span className="shrink-0 text-4xl">{result.emoji}</span>
            <div className="min-w-0">
              <p className="text-xs text-white/38">上次球探报告 · {resultMeta}</p>
              <h2 className="mt-1 text-xl font-black text-white break-words">
                {result.code} · {result.name}
              </h2>
              <p className="mt-2 text-xs text-kobe-gold/75 leading-relaxed">
                下次挑战：{result.challenge}
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="bbti-return-bench-action"
            data-bbti-return-bench-action="open-last-result"
            onClick={() => onOpenResult(result.code)}
            className="mt-4 w-full rounded-full border border-kobe-gold/25 px-4 py-2.5 text-xs font-black text-kobe-gold hover:bg-kobe-gold/10 transition-colors cursor-pointer"
          >
            查看上次结果
          </button>
          <button
            type="button"
            data-testid="bbti-return-bench-action"
            data-bbti-return-bench-action="copy-compare-invite"
            onClick={copyCompareInvite}
            className="mt-2 w-full rounded-full bg-white/[0.06] px-4 py-2.5 text-xs font-black text-white/62 hover:bg-white/[0.1] hover:text-white transition-colors cursor-pointer"
          >
            {copyFeedback.isFailed("compare")
              ? "复制失败"
              : copyFeedback.isCopied("compare")
                ? "已复制对比邀请"
                : returnDuoPreset?.copyButtonLabel ?? "拉朋友双人对比"}
          </button>
          <button
            type="button"
            data-testid="bbti-return-bench-action"
            data-bbti-return-bench-action="copy-return-streak"
            onClick={copyReturnStreak}
            className="mt-2 w-full rounded-full border border-white/10 px-4 py-2.5 text-xs font-black text-white/56 hover:border-kobe-gold/35 hover:text-kobe-gold transition-colors cursor-pointer"
          >
            {copyFeedback.isFailed("streak")
              ? "复制失败"
              : copyFeedback.isCopied("streak")
                ? "已复制回访主线"
                : "复制回访主线"}
          </button>
          <BbtiManualCopyFallback
            text={copyFeedback.feedback.manualCopyText}
            title="自动复制失败，长按下方文案复制。"
            className="mt-3"
          />
        </div>

        <div className="min-w-0">
          <p className="text-xs text-white/35 uppercase tracking-widest mb-2">
            Challenge Lanes
          </p>
          <div className="space-y-2">
            {challenges.map((challenge) => {
              const isFeaturedChallenge = featuredChallenge?.matchupId === challenge.matchupId;

              return (
                <button
                  key={`${challenge.category}-${challenge.matchupId}`}
                  type="button"
                  data-testid="bbti-return-bench-challenge"
                  data-bbti-return-bench-challenge={challenge.matchupId}
                  data-bbti-return-bench-featured={isFeaturedChallenge ? "true" : "false"}
                  data-bbti-return-bench-action="open-challenge-lane"
                  onClick={() => onChallengeMatchup(
                    challenge.matchupId,
                    isFeaturedChallenge ? featuredCaseContext : null,
                  )}
                  className={`w-full rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                    isFeaturedChallenge
                      ? "border-kobe-gold/45 bg-kobe-gold/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/25"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-black text-white/55">
                      {challenge.category}
                    </span>
                    <span className="shrink-0 text-[10px] font-black text-white/32">
                      {isFeaturedChallenge && featuredCaseContext ? "带案由 →" : "开战 →"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-black text-white break-words">
                    {challenge.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/42 leading-relaxed">
                    {challenge.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copyStatusText}
      </p>
    </section>
  );
}
