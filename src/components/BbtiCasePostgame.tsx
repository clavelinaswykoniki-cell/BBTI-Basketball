"use client";

import { useMemo } from "react";
import type { BbtiChallengeCaseContext } from "@/data/bbti-challenge-case";
import { resolveBbtiCasePostgameRecap } from "@/data/bbti-case-postgame";
import { buildBbtiCaseReturnUrl } from "@/lib/bbti-deep-links";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiCasePostgameProps {
  context: BbtiChallengeCaseContext | null;
  playerAName: string;
  playerBName: string;
  kobeScore: number;
  lebronScore: number;
  selectedSideName?: string;
  winnerName: string;
  replayUrl: string;
  onOpenBbtiResult: (code: string) => void;
}

function currentResultBaseHref(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}${window.location.pathname}`;
}

export default function BbtiCasePostgame({
  context,
  playerAName,
  playerBName,
  kobeScore,
  lebronScore,
  selectedSideName,
  winnerName,
  replayUrl,
  onOpenBbtiResult,
}: BbtiCasePostgameProps) {
  const copyFeedback = useGuardedClipboard<"case">();

  const caseReturnUrl = useMemo(() => (
    context ? buildBbtiCaseReturnUrl(context, currentResultBaseHref()) : ""
  ), [context]);
  const recap = useMemo(() => {
    if (!context) return null;

    return resolveBbtiCasePostgameRecap({
      context,
      playerAName,
      playerBName,
      kobeScore,
      lebronScore,
      selectedSideName,
      winnerName,
      replayUrl,
      caseReturnUrl,
    });
  }, [
    caseReturnUrl,
    context,
    kobeScore,
    lebronScore,
    playerAName,
    playerBName,
    replayUrl,
    selectedSideName,
    winnerName,
  ]);

  if (!context || !recap) return null;

  const copied = copyFeedback.isCopied("case");
  const failed = copyFeedback.isFailed("case");

  return (
    <section
      aria-label="BBTI案件赛后战报"
      data-testid="bbti-case-postgame"
      data-bbti-case-postgame-version={recap.postgameVersion}
      data-bbti-case-postgame-source={recap.source}
      data-bbti-case-postgame-source-version={recap.caseSourceVersion}
      data-bbti-case-postgame-case-version={recap.caseVersion}
      data-bbti-case-postgame-code={recap.code}
      data-bbti-case-postgame-matchup-id={recap.challengeMatchupId}
      data-bbti-case-postgame-score={recap.scoreQa}
      data-bbti-case-postgame-selected-side={selectedSideName ?? "none"}
      data-bbti-case-postgame-winner={recap.winnerName}
      className="w-full max-w-lg rounded-2xl border border-kobe-gold/25 bg-gradient-to-b from-kobe-gold/12 via-white/[0.035] to-lebron-wine/16 p-5 mb-6"
      style={{ animation: "fade-up 1.02s ease-out" }}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-kobe-gold px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-black">
              BBTI Case Postgame
            </span>
            <span
              data-testid="bbti-case-postgame-source"
              data-bbti-case-postgame-source-label={recap.sourceMeta.badge}
              className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-black text-white/45"
            >
              {recap.sourceMeta.badge}
            </span>
          </div>
          <h3
            data-testid="bbti-case-postgame-title"
            className="text-lg font-black leading-snug text-white"
          >
            {recap.sourceMeta.title}
          </h3>
          <p
            data-testid="bbti-case-postgame-origin"
            className="mt-1 text-xs font-bold leading-relaxed text-white/52"
          >
            {recap.identity} · {recap.sourceMeta.origin}
          </p>
        </div>
        <span
          data-testid="bbti-case-postgame-score"
          className="shrink-0 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-black text-white/62"
        >
          {recap.scoreLine}
        </span>
      </div>

      <div className="space-y-3">
        <div
          data-testid="bbti-case-postgame-source-body"
          className="border-t border-white/10 pt-3"
        >
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/30">
            {recap.sourceMeta.bodyLabel}
          </p>
          <p className="text-xs leading-relaxed text-white/72">
            {recap.sourceMeta.body}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div
            data-testid="bbti-case-postgame-session-card"
            data-bbti-case-postgame-session="selected-side"
            className="rounded-xl border border-white/10 bg-black/18 px-3 py-2"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-white/28">
              本场站队
            </p>
            <p className="mt-1 text-xs font-black text-white/72">
              {recap.selectedSideName}
            </p>
          </div>
          <div
            data-testid="bbti-case-postgame-session-card"
            data-bbti-case-postgame-session="winner"
            className="rounded-xl border border-white/10 bg-black/18 px-3 py-2"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-white/28">
              赛后判定
            </p>
            <p className="mt-1 text-xs font-black text-white/72">
              {recap.winnerName}
            </p>
          </div>
        </div>

        <div
          data-testid="bbti-case-postgame-case-reason"
          className="rounded-xl border border-lebron-gold/20 bg-lebron-wine/14 px-3 py-2"
        >
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-lebron-gold/70">
            本场案由
          </p>
          <p className="text-xs font-bold leading-relaxed text-white/72">
            {recap.caseReason}
          </p>
        </div>

        <div
          data-testid="bbti-case-postgame-return"
          className="rounded-xl border border-kobe-gold/20 bg-kobe-gold/[0.08] px-3 py-2"
        >
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-kobe-gold/70">
            案件回流
          </p>
          <p
            data-testid="bbti-case-postgame-return-url"
            data-bbti-case-postgame-return-url={recap.caseReturnUrl}
            className="break-all text-[11px] font-bold leading-relaxed text-white/48"
          >
            {recap.compactCaseReturnUrl}
          </p>
        </div>

        <div
          data-testid="bbti-case-postgame-replay-index"
          data-bbti-case-postgame-replay-index-version={recap.replayIndex.version}
          data-bbti-case-postgame-replay-index-source={recap.replayIndex.source}
          data-bbti-case-postgame-replay-index-source-version={recap.replayIndex.caseSourceVersion}
          data-bbti-case-postgame-replay-index-case-version={recap.replayIndex.caseVersion}
          data-bbti-case-postgame-replay-index-code={recap.replayIndex.code}
          data-bbti-case-postgame-replay-index-matchup-id={recap.replayIndex.challengeMatchupId}
          data-bbti-case-postgame-replay-index-count={recap.replayIndex.itemCount}
          className="rounded-xl border border-white/10 bg-black/18 p-3"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
              复盘索引
            </p>
            <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-black text-white/36">
              {recap.replayIndex.itemCount} 段
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {recap.replayIndex.items.map((item, index) => {
              const content = (
                <>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-kobe-gold/62">
                      {item.label}
                    </span>
                    <span className="text-[10px] font-black text-white/30">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-xs font-black leading-snug text-white/76">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[11px] font-bold leading-relaxed text-white/46">
                    {item.body}
                  </p>
                  {item.compactHref && (
                    <p className="mt-1 break-all text-[10px] font-bold leading-relaxed text-white/30">
                      {item.compactHref}
                    </p>
                  )}
                </>
              );

              return item.href ? (
                <a
                  key={item.id}
                  href={item.href}
                  data-testid="bbti-case-postgame-replay-row"
                  data-bbti-case-postgame-replay-row={item.id}
                  data-bbti-case-postgame-replay-target={item.target}
                  data-bbti-case-postgame-replay-position={index + 1}
                  className="block rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 transition-colors hover:border-kobe-gold/30"
                >
                  {content}
                </a>
              ) : (
                <div
                  key={item.id}
                  data-testid="bbti-case-postgame-replay-row"
                  data-bbti-case-postgame-replay-row={item.id}
                  data-bbti-case-postgame-replay-target={item.target}
                  data-bbti-case-postgame-replay-position={index + 1}
                  className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2"
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        {recap.evidenceLens.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recap.evidenceLens.map((lens, index) => (
              <span
                key={lens}
                data-testid="bbti-case-postgame-lens"
                data-bbti-case-postgame-lens={lens}
                data-bbti-case-postgame-lens-position={index + 1}
                className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] font-black text-white/42"
              >
                {lens}
              </span>
            ))}
          </div>
        )}

        <p
          data-testid="bbti-case-postgame-boundary"
          className="text-[11px] font-bold leading-relaxed text-white/34"
        >
          {recap.sessionBoundary}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          data-testid="bbti-case-postgame-action"
          data-bbti-case-postgame-action="copy-recap"
          onClick={() => copyFeedback.copyText(recap.copyText, "case")}
          className="min-h-[42px] rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs font-black text-white/68 transition-colors hover:border-kobe-gold/40 hover:text-kobe-gold"
        >
          {failed ? "复制失败，可手动复制" : copied ? "已复制案件战报" : "复制BBTI案件战报"}
        </button>
        <button
          type="button"
          data-testid="bbti-case-postgame-action"
          data-bbti-case-postgame-action="open-bbti-result"
          onClick={() => onOpenBbtiResult(context.code)}
          className="min-h-[42px] rounded-full bg-gradient-to-r from-kobe-gold to-lebron-gold px-4 py-2.5 text-xs font-black text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          回到我的BBTI报告
        </button>
      </div>

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copied ? "已复制BBTI案件战报" : failed ? "BBTI案件战报自动复制失败，可手动复制" : ""}
      </p>

      <BbtiManualCopyFallback
        text={copyFeedback.feedback.manualCopyText}
        title="自动复制失败，长按下方案件战报复制。"
        className="mt-3"
      />
    </section>
  );
}
