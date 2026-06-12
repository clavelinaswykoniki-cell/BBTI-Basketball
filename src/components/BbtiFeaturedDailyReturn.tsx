"use client";

import { useMemo } from "react";
import { getBbtiArenaEventStorageKey } from "@/data/bbti-arena-events";
import type { BbtiChallengeCaseContext } from "@/data/bbti-challenge-case";
import {
  getBbtiDailyReturnPlay,
  resolveBbtiDailyReturnCaseContext,
  resolveBbtiReturnStreak,
} from "@/data/bbti-daily-return";
import type { StoredBbtiResult } from "@/data/bbti-playbook";
import { getBbtiShareTargetPreset } from "@/data/bbti-share-target-presets";
import { buildBbtiResultUrl } from "@/lib/bbti-deep-links";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiDailyReturnRemix from "./BbtiDailyReturnRemix";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiFeaturedDailyReturnProps {
  result: StoredBbtiResult;
  onOpenResult: (code: string) => void;
  onChallengeMatchup: (matchupId: string, caseContext?: BbtiChallengeCaseContext | null) => void;
}

export default function BbtiFeaturedDailyReturn({
  result,
  onOpenResult,
  onChallengeMatchup,
}: BbtiFeaturedDailyReturnProps) {
  const copyFeedback = useGuardedClipboard<"daily">();
  const dailyReturn = useMemo(() => getBbtiDailyReturnPlay(result.code), [result.code]);
  const returnStreak = useMemo(
    () => resolveBbtiReturnStreak(result, dailyReturn),
    [dailyReturn, result],
  );
  const dailySharePreset = getBbtiShareTargetPreset("daily-event");
  const dailyEvent = dailyReturn.event;
  const featuredChallenge = dailyReturn.featuredChallenge;
  const featuredCaseContext = useMemo(
    () => resolveBbtiDailyReturnCaseContext(dailyReturn),
    [dailyReturn],
  );
  const copyStatusText = copyFeedback.isCopied("daily")
    ? "已复制今日复盘题"
    : copyFeedback.isFailed("daily")
      ? "今日复盘题自动复制失败，可手动复制"
      : "";

  if (!dailyEvent) return null;

  const openDailyEvent = () => {
    try {
      localStorage.setItem(getBbtiArenaEventStorageKey(result.code), JSON.stringify({
        id: dailyEvent.id,
        dateKey: dailyReturn.dateKey,
      }));
    } catch {
      // Opening the result is still useful when storage is unavailable.
    }

    onOpenResult(result.code);
  };

  const openFeaturedChallenge = () => {
    if (featuredChallenge) {
      onChallengeMatchup(featuredChallenge.matchupId, featuredCaseContext);
    }
  };

  const copyDailyPrompt = () => {
    const prompt = `${result.emoji} ${result.name}（${result.code}）事件题：${dailyEvent.groupChatPrompt}`;
    const baseHref = `${window.location.origin}${window.location.pathname}`;
    const url = buildBbtiResultUrl(result.code, {
      eventId: dailyEvent.id,
      challengeMatchupId: featuredChallenge?.matchupId,
    }, baseHref);

    copyFeedback.copyText(`${prompt}\n${url}`, "daily");
  };

  return (
    <section
      data-testid="bbti-featured-daily-return"
      data-bbti-return-streak-version={returnStreak.version}
      data-bbti-return-streak-code={returnStreak.code}
      data-bbti-return-streak-date={returnStreak.dateKey}
      data-bbti-return-streak-event={returnStreak.eventId ?? "none"}
      data-bbti-return-streak-featured={returnStreak.featuredChallengeId ?? "none"}
      data-bbti-return-streak-case-source={returnStreak.caseContextSource ?? "none"}
      className="w-full max-w-5xl mb-6 overflow-hidden rounded-2xl border border-kobe-gold/25 bg-gradient-to-br from-kobe-gold/14 via-white/[0.045] to-lebron-wine/18 p-4 sm:p-5"
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <div className="min-w-0">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-kobe-gold/75">
                {returnStreak.label}
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white">
                今日主场加赛
              </h2>
            </div>
            <span className="w-fit shrink-0 rounded-full border border-white/10 bg-black/18 px-3 py-1 text-[10px] font-black text-white/45">
              {dailyReturn.dateKey}
            </span>
          </div>

          <div className="mb-3 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] font-black text-white/45">
              {result.code} · {result.name}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] font-black text-white/45">
              {dailyEvent.court}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] font-black text-white/45">
              {dailyEvent.stakes}
            </span>
            {featuredChallenge && (
              <span className="rounded-full border border-kobe-gold/20 bg-kobe-gold/10 px-2 py-0.5 text-[10px] font-black text-kobe-gold/70">
                {featuredChallenge.category}
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white">
            {dailyEvent.title}
          </h3>
          <p className="mt-2 text-sm text-white/65 leading-relaxed">
            {dailyEvent.scenario}
          </p>
          <p className="mt-3 rounded-xl border border-kobe-gold/15 bg-black/18 px-3 py-2 text-xs font-bold text-kobe-gold/78 leading-relaxed">
            {dailyEvent.pressureTest}
          </p>

          <BbtiDailyReturnRemix
            dailyReturn={dailyReturn}
            result={result}
            onOpenResult={onOpenResult}
            onChallengeMatchup={onChallengeMatchup}
          />

          <div
            data-testid="bbti-return-streak-rail"
            data-bbti-return-streak-step-count={returnStreak.steps.length}
            className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3"
          >
            {returnStreak.steps.map((step, index) => (
              <div
                key={step.id}
                data-testid="bbti-return-streak-step"
                data-bbti-return-streak-step={step.id}
                data-bbti-return-streak-target={step.target}
                data-bbti-return-streak-position={index + 1}
                className="min-h-[96px] rounded-xl border border-white/10 bg-black/16 px-3 py-2"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-white/32">
                  {step.label}
                </p>
                <p className="mt-1 text-xs font-black leading-snug text-white/78">
                  {step.title}
                </p>
                <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-relaxed text-white/42">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between rounded-xl border border-white/10 bg-black/22 p-4">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/35">
                Group Prompt
              </p>
              <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-black text-white/40">
                {dailyEvent.tag}
              </span>
            </div>
            <p className="rounded-lg border border-lebron-gold/20 bg-lebron-wine/12 px-3 py-2 text-xs sm:text-sm font-bold text-white/78 leading-relaxed">
              {dailyEvent.groupChatPrompt}
            </p>
            {featuredChallenge && (
              <p className="mt-2 text-[11px] text-white/42 leading-relaxed">
                推荐开战：{featuredChallenge.title} · {featuredChallenge.label}
              </p>
            )}
            <p
              data-testid="bbti-return-streak-boundary"
              className="mt-2 text-[11px] font-bold leading-relaxed text-white/32"
            >
              {returnStreak.boundary}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
            <button
              type="button"
              data-testid="bbti-featured-daily-return-action"
              data-bbti-featured-daily-return-action="open-daily-event"
              onClick={openDailyEvent}
              className="rounded-full bg-gradient-to-r from-kobe-gold to-lebron-gold px-4 py-2.5 text-xs font-black text-black transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              带结果入场
            </button>
            <button
              type="button"
              data-testid="bbti-featured-daily-return-action"
              data-bbti-featured-daily-return-action="open-featured-challenge"
              onClick={openFeaturedChallenge}
              disabled={!featuredChallenge}
              className="rounded-full bg-white/[0.06] px-4 py-2.5 text-xs font-black text-white/72 transition-colors hover:bg-white/[0.1] hover:text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
              {featuredCaseContext ? "带案由接加赛" : "接推荐加赛"}
            </button>
            <button
              type="button"
              data-testid="bbti-featured-daily-return-action"
              data-bbti-featured-daily-return-action="copy-daily-prompt"
              onClick={copyDailyPrompt}
              className="rounded-full border border-white/10 px-4 py-2.5 text-xs font-black text-white/62 transition-colors hover:border-kobe-gold/40 hover:text-white cursor-pointer"
            >
              {copyFeedback.isCopied("daily")
                ? "已复制"
                : copyFeedback.isFailed("daily")
                  ? "复制失败"
                  : dailySharePreset?.copyButtonLabel ?? "复制群聊题"}
            </button>
          </div>
          <BbtiManualCopyFallback
            text={copyFeedback.isFailed("daily") ? copyFeedback.feedback.manualCopyText : ""}
            title="自动复制失败，长按下方今日复盘题复制。"
            className="mt-3"
          />
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copyStatusText}
      </p>
    </section>
  );
}
