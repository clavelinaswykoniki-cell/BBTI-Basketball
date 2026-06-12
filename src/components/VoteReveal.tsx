"use client";

import { useState, useEffect } from "react";
import { getTopicStats, type TopicStats } from "@/lib/voteStats";
import { useGame } from "./GameProvider";
import { getMatchupSlots } from "@/lib/matchupSlots";

// ── Provocative callouts based on how minority you are ─────────────────

/**
 * Deterministic "random" pick so the same vote always shows the same
 * callout line — important for screenshot sharing consistency.
 */
function deterministicPick<T>(items: T[], topicId: string, votedFor: string): T {
  let hash = 0;
  const seed = topicId + votedFor;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return items[Math.abs(hash) % items.length]!;
}

function getCallout(
  votedFor: "kobe" | "lebron",
  stats: TopicStats,
  topicId: string
): string | null {
  const myPercent =
    votedFor === "kobe" ? stats.kobePercent : stats.lebronPercent;

  if (myPercent <= 20) {
    return deterministicPick(
      [
        `只有 ${myPercent}% 站你这边——你现在坐在少数派替补席第一排。`,
        `${myPercent}% 的支持率，这票必须立刻申请教练挑战。`,
        `${myPercent}% 同意你——另外 ${100 - myPercent}% 已经在群聊等你的反证。`,
      ],
      topicId,
      votedFor
    );
  }

  if (myPercent <= 30) {
    return deterministicPick(
      [
        `只有 ${myPercent}% 的人同意你——这球要打加时才能说清。`,
        `${myPercent}% 的人站你这边。剩下 ${100 - myPercent}% 正准备包夹你的论点。`,
        `${100 - myPercent}% 的人不同意你——截图发群，让他们拿证据防你。`,
      ],
      topicId,
      votedFor
    );
  }

  if (myPercent <= 40) {
    return deterministicPick(
      [
        `${myPercent}% 的人和你一样——少数派，但不孤单。`,
        `只有 ${myPercent}% 站你这边——要不要截图证明你的勇气？`,
        `${100 - myPercent}% 的人不同意你。这是弱侧埋伏，还是强行出手？`,
      ],
      topicId,
      votedFor
    );
  }

  if (myPercent <= 55) {
    return `${myPercent}% vs ${100 - myPercent}%——势均力敌，这题真的撕不出结果。`;
  }

  if (myPercent <= 70) {
    return deterministicPick(
      [
        `${myPercent}% 的人和你一样——主流意见，但少数派不服。`,
        `你站在 ${myPercent}% 这边。安全出球，还是你真看穿了防守？`,
      ],
      topicId,
      votedFor
    );
  }

  // > 70% — dominant opinion
  return deterministicPick(
    [
      `${myPercent}% 压倒性支持——但领先方也要防最后一波反扑。`,
      `${myPercent}% 同意你。剩下那 ${100 - myPercent}% 需要一条真正能翻盘的反证。`,
      `你和 ${myPercent}% 的人想法一致——但真理不总在多数手中哦。`,
    ],
    topicId,
    votedFor
  );
}

// ── Component ──────────────────────────────────────────────────────────

interface VoteRevealProps {
  topicId: string;
  votedFor: "kobe" | "lebron";
}

export default function VoteReveal({ topicId, votedFor }: VoteRevealProps) {
  const { currentMatchup, matchupId } = useGame();
  const slots = getMatchupSlots(matchupId, currentMatchup);
  const nameA = slots.kobe.nameZh;
  const nameB = slots.lebron.nameZh;
  const [stats] = useState<TopicStats>(() => getTopicStats(topicId, matchupId));
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Trigger animation on next frame so the transition actually fires
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimating(true);
      });
    });
  }, []);

  const statScope = matchupId ? `${matchupId}:${topicId}` : topicId;
  const callout = getCallout(votedFor, stats, statScope);

  const kobeWidth = animating ? stats.kobePercent : 0;
  const lebronWidth = animating ? stats.lebronPercent : 0;

  const isMinority =
    (votedFor === "kobe" ? stats.kobePercent : stats.lebronPercent) < 45;
  const scopeLabel = matchupId ? "本对决投票" : "全球投票";
  const votedName = votedFor === "kobe" ? nameA : nameB;

  return (
    <div
      role="region"
      aria-label={`${scopeLabel}结果`}
      className="w-full max-w-2xl mx-auto mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
      style={{ animation: "fade-up 0.4s ease-out" }}
    >
      <p className="sr-only" aria-live="polite">
        {scopeLabel}共 {stats.total} 票，{nameA} {stats.kobePercent}%，{nameB} {stats.lebronPercent}%。你的选择是{votedName}。
      </p>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-white/40 tracking-wider uppercase">
          🌍 {scopeLabel}
        </span>
        <span className="text-xs text-white/30">
          {stats.total.toLocaleString()} 票
        </span>
      </div>

      {/* Bar chart */}
      <div className="relative w-full h-10 rounded-lg overflow-hidden bg-white/5 flex" aria-hidden="true">
        {/* Kobe bar */}
        <div
          className="h-full flex items-center justify-start pl-2 transition-all ease-out"
          style={{
            width: `${kobeWidth}%`,
            transitionDuration: "1200ms",
            background:
              "linear-gradient(90deg, #552583 0%, #FDB927 100%)",
          }}
        >
          {kobeWidth >= 15 && (
            <span className="text-xs font-black text-white drop-shadow-md whitespace-nowrap">
              {nameA} {stats.kobePercent}%
            </span>
          )}
        </div>

        {/* LeBron bar */}
        <div
          className="h-full flex items-center justify-end pr-2 transition-all ease-out"
          style={{
            width: `${lebronWidth}%`,
            transitionDuration: "1200ms",
            background:
              "linear-gradient(90deg, #FDBB30 0%, #860038 100%)",
          }}
        >
          {lebronWidth >= 15 && (
            <span className="text-xs font-black text-white drop-shadow-md whitespace-nowrap">
              {stats.lebronPercent}% {nameB}
            </span>
          )}
        </div>
      </div>

      {/* Labels if bars are too narrow */}
      {(kobeWidth < 15 || lebronWidth < 15) && (
        <div className="flex justify-between mt-1 text-xs font-bold">
          {kobeWidth < 15 && (
            <span className="text-kobe-gold">{nameA} {stats.kobePercent}%</span>
          )}
          {kobeWidth >= 15 && <span />}
          {lebronWidth < 15 && (
            <span className="text-lebron-gold">
              {stats.lebronPercent}% {nameB}
            </span>
          )}
        </div>
      )}

      {/* Callout */}
      {callout && (
        <div
          className={`mt-3 text-center text-sm font-bold ${
            isMinority ? "text-red-400" : "text-white/70"
          }`}
          style={{
            animation: "fade-up 0.6s ease-out 0.8s both",
          }}
        >
          {isMinority ? "🔥 " : ""}
          {callout}
        </div>
      )}
    </div>
  );
}
