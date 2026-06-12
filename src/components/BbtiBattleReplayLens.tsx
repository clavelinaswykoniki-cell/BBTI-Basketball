"use client";

import { useMemo } from "react";
import type { BbtiChallengeCaseContext } from "@/data/bbti-challenge-case";
import {
  resolveBbtiBattleReplayCopyKit,
  resolveBbtiBattleReplayLens,
} from "@/data/bbti-battle-replay-lens";
import { resolveBbtiChallengeReplaySeeds } from "@/data/bbti-challenge-replay-seeds";
import type { DebateTopic } from "@/data/debates";
import type { ReplayStatBomb, VoteSide } from "@/data/stat-bombs";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiChallengeReplaySeeds from "./BbtiChallengeReplaySeeds";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiBattleReplayLensProps {
  caseContext?: BbtiChallengeCaseContext | null;
  matchupId?: string | null;
  nameA: string;
  nameB: string;
  nextTopic?: DebateTopic | null;
  roundNumber: number;
  statBomb?: ReplayStatBomb | null;
  topic: DebateTopic;
  votedFor: VoteSide;
}

export default function BbtiBattleReplayLens({
  caseContext,
  matchupId,
  nameA,
  nameB,
  nextTopic,
  roundNumber,
  statBomb,
  topic,
  votedFor,
}: BbtiBattleReplayLensProps) {
  const copyFeedback = useGuardedClipboard<string>();
  const lens = useMemo(
    () => resolveBbtiBattleReplayLens({
      caseContext,
      matchupId,
      nameA,
      nameB,
      nextTopic,
      roundNumber,
      statBomb,
      topic,
      votedFor,
    }),
    [caseContext, matchupId, nameA, nameB, nextTopic, roundNumber, statBomb, topic, votedFor],
  );
  const copyKit = useMemo(() => resolveBbtiBattleReplayCopyKit(lens), [lens]);
  const replaySeeds = useMemo(() => {
    const currentClaim = lens.steps.find((step) => step.id === "current-claim");
    const nextPressure = lens.steps.find((step) => step.id === "next-pressure");

    return resolveBbtiChallengeReplaySeeds({
      caseContext,
      challengeCategory: caseContext?.challengeCategory ?? "开庭",
      challengeLabel: caseContext?.challengeLabel ?? `Round ${lens.roundNumber}`,
      challengeMatchupId: lens.matchupId,
      challengeTitle: caseContext?.challengeTitle ?? `${nameA} vs ${nameB}`,
      code: caseContext?.code ?? "BBTI",
      pressureLine: nextPressure?.body,
      replayBody: nextPressure?.body,
      replayTitle: currentClaim?.title ?? `Round ${lens.roundNumber}`,
      source: "battle-replay",
    });
  }, [caseContext, lens.matchupId, lens.roundNumber, lens.steps, nameA, nameB]);
  const copied = copyFeedback.isCopied("lens");
  const failed = copyFeedback.isFailed("lens");

  return (
    <section
      aria-label="BBTI单回合战术镜头"
      data-testid="bbti-battle-replay-lens"
      data-bbti-battle-replay-lens-version={lens.version}
      data-bbti-battle-replay-lens-matchup-id={lens.matchupId}
      data-bbti-battle-replay-lens-topic-id={lens.topicId}
      data-bbti-battle-replay-lens-next-topic-id={lens.nextTopicId}
      data-bbti-battle-replay-lens-round={lens.roundNumber}
      data-bbti-battle-replay-lens-side={lens.votedSide}
      data-bbti-battle-replay-lens-case-source={lens.caseSource}
      data-bbti-battle-replay-lens-replay-source={lens.replaySource}
      data-bbti-battle-replay-lens-count={lens.stepCount}
      className="mx-auto mt-3 w-full max-w-2xl rounded-xl border border-kobe-gold/20 bg-gradient-to-br from-kobe-gold/10 via-black/20 to-sky-500/10 p-3 sm:mt-4 sm:p-4"
      style={{ animation: "fade-up 0.5s ease-out" }}
    >
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-kobe-gold/25 bg-kobe-gold/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-kobe-gold">
              Replay Lens
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold text-white/42">
              Round {lens.roundNumber}
            </span>
          </div>
          <h3 className="text-base font-black text-white">
            这一票该怎么接着打
          </h3>
        </div>
        <button
          type="button"
          data-testid="bbti-battle-replay-lens-copy"
          data-bbti-battle-replay-lens-action="copy-lens"
          onClick={() => copyFeedback.copyText(lens.copyText, "lens")}
          className="min-h-[36px] shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/65 transition-colors hover:border-kobe-gold/40 hover:text-kobe-gold"
        >
          {failed ? "复制失败" : copied ? "已复制" : "复制镜头"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {lens.steps.map((step, index) => (
          <div
            key={step.id}
            data-testid="bbti-battle-replay-lens-step"
            data-bbti-battle-replay-lens-step={step.id}
            data-bbti-battle-replay-lens-target={step.target}
            data-bbti-battle-replay-lens-position={index + 1}
            className="min-h-[92px] rounded-lg border border-white/10 bg-black/18 px-3 py-2 sm:min-h-[104px]"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
              {step.label}
            </p>
            <p className="mt-1 text-xs font-black leading-snug text-white/78">
              {step.title}
            </p>
            <p className="mt-1 line-clamp-3 text-[11px] font-bold leading-relaxed text-white/48">
              {step.body}
            </p>
          </div>
        ))}
      </div>

      <div
        className="mt-3 rounded-lg border border-sky-200/15 bg-sky-200/[0.045] p-3"
        data-testid="bbti-battle-replay-copy-kit"
        data-bbti-battle-replay-copy-kit-version={copyKit.version}
        data-bbti-battle-replay-copy-kit-source-version={copyKit.sourceLensVersion}
        data-bbti-battle-replay-copy-kit-matchup-id={copyKit.matchupId}
        data-bbti-battle-replay-copy-kit-topic-id={copyKit.topicId}
        data-bbti-battle-replay-copy-kit-round={copyKit.roundNumber}
        data-bbti-battle-replay-copy-kit-count={copyKit.itemCount}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-sky-100/62">
              Replay Copy Kit
            </p>
            <h4 className="mt-0.5 text-sm font-black text-white">
              发群复盘包
            </h4>
          </div>
          <span className="rounded-full border border-sky-100/15 px-2 py-0.5 text-[9px] font-black text-sky-100/45">
            {copyKit.itemCount} 条
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {copyKit.items.map((item, index) => {
            const itemCopied = copyFeedback.isCopied(item.id);
            const itemFailed = copyFeedback.isFailed(item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => copyFeedback.copyText(item.copyText, item.id)}
                className="min-h-[96px] rounded-lg border border-white/10 bg-black/18 px-3 py-2 text-left transition-colors hover:border-sky-100/25 hover:bg-sky-100/[0.055] sm:min-h-[108px]"
                data-testid="bbti-battle-replay-copy-kit-item"
                data-bbti-battle-replay-copy-kit-item={item.id}
                data-bbti-battle-replay-copy-kit-position={index + 1}
                data-bbti-battle-replay-copy-kit-action="copy"
              >
                <span className="text-[10px] font-black text-sky-100/45">
                  {item.label}
                </span>
                <span className="mt-1 block text-xs font-black leading-snug text-white/78">
                  {item.title}
                </span>
                <span className="mt-1 line-clamp-2 block text-[11px] font-bold leading-relaxed text-white/48">
                  {item.body}
                </span>
                <span className="mt-2 block text-[10px] font-black text-sky-100/58">
                  {itemFailed ? "复制失败" : itemCopied ? "已复制" : "复制话术"}
                </span>
              </button>
            );
          })}
        </div>
        <p
          data-testid="bbti-battle-replay-copy-kit-boundary"
          className="mt-2 text-[10px] font-bold leading-relaxed text-white/34"
        >
          {copyKit.boundary}
        </p>
      </div>

      <p
        data-testid="bbti-battle-replay-lens-boundary"
        className="mt-3 text-[11px] font-bold leading-relaxed text-white/32"
      >
        {lens.boundary}
      </p>
      <BbtiChallengeReplaySeeds
        compact
        seeds={replaySeeds}
        className="mt-3"
      />
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copied ? "已复制单回合战术镜头" : failed ? "单回合战术镜头自动复制失败，可手动复制" : ""}
      </p>
      <BbtiManualCopyFallback
        text={copyFeedback.feedback.manualCopyText}
        title="自动复制失败，长按下方战术镜头复制。"
        className="mt-3"
      />
    </section>
  );
}
