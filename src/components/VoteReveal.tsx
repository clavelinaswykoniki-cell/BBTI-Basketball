"use client";

import { useState, useEffect } from "react";
import { getTopicStats, type TopicStats } from "@/lib/voteStats";
import { useGame } from "./GameProvider";

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
        `全球只有 ${myPercent}% 的人同意你——你是来搞笑的吧？`,
        `${myPercent}%？恭喜你，你的观点比大熊猫还稀有。`,
        `${myPercent}% 同意你——另外 ${100 - myPercent}% 在笑。`,
      ],
      topicId,
      votedFor
    );
  }

  if (myPercent <= 30) {
    return deterministicPick(
      [
        `只有 ${myPercent}% 的人同意你——你确定？`,
        `${myPercent}% 的人站你这边。剩下 ${100 - myPercent}% 觉得你需要看眼科。`,
        `全网 ${100 - myPercent}% 的人觉得你离谱——截图发群让他们评评理？`,
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
        `${100 - myPercent}% 的人不同意你。这是勇敢还是固执？`,
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
        `你站在 ${myPercent}% 这边。安全牌？还是你真懂球？`,
      ],
      topicId,
      votedFor
    );
  }

  // > 70% — dominant opinion
  return deterministicPick(
    [
      `${myPercent}% 压倒性支持——这还用辩？`,
      `${myPercent}% 同意你。剩下那 ${100 - myPercent}% 建议回去补补课。`,
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
  const { currentMatchup } = useGame();
  const nameA = currentMatchup?.playerA.nameZh ?? "科比";
  const nameB = currentMatchup?.playerB.nameZh ?? "詹姆斯";
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<TopicStats | null>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
    const s = getTopicStats(topicId);
    setStats(s);
    // Trigger animation on next frame so the transition actually fires
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimating(true);
      });
    });
  }, [topicId]);

  // Pre-mount: render nothing to avoid hydration mismatch
  if (!mounted || !stats) return null;

  const callout = getCallout(votedFor, stats, topicId);

  const kobeWidth = animating ? stats.kobePercent : 0;
  const lebronWidth = animating ? stats.lebronPercent : 0;

  const isMinority =
    (votedFor === "kobe" ? stats.kobePercent : stats.lebronPercent) < 45;

  return (
    <div
      className="w-full max-w-2xl mx-auto mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
      style={{ animation: "fade-up 0.4s ease-out" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-white/40 tracking-wider uppercase">
          🌍 全球投票
        </span>
        <span className="text-xs text-white/30">
          {stats.total.toLocaleString()} 票
        </span>
      </div>

      {/* Bar chart */}
      <div className="relative w-full h-10 rounded-lg overflow-hidden bg-white/5 flex">
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
