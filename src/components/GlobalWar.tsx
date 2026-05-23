"use client";

import { useState, useEffect } from "react";
import { getGlobalStats, type GlobalStats } from "@/lib/voteStats";
import { useGame } from "./GameProvider";

/**
 * Compact one-line banner showing the overall Kobe vs LeBron war status.
 * Designed to sit at the top of the battle arena.
 * Reads from localStorage on mount — no props needed.
 */
export default function GlobalWar() {
  const { currentMatchup } = useGame();
  const nameA = currentMatchup?.playerA.nameZh ?? "科比";
  const nameB = currentMatchup?.playerB.nameZh ?? "詹姆斯";
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<GlobalStats | null>(null);

  useEffect(() => {
    setMounted(true);
    setStats(getGlobalStats());
  }, []);

  // SSR / pre-mount: neutral skeleton to avoid hydration mismatch
  if (!mounted || !stats) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-2">
        <div className="h-8 rounded-full bg-white/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-2">
      <div className="relative flex items-center h-8 rounded-full overflow-hidden bg-white/5 border border-white/10">
        {/* Kobe side */}
        <div
          className="h-full flex items-center justify-start pl-3 transition-all duration-700 ease-out"
          style={{
            width: `${stats.kobePercent}%`,
            background: "linear-gradient(90deg, #552583 0%, #FDB927 100%)",
          }}
        >
          <span className="text-[11px] sm:text-xs font-black text-white drop-shadow-md whitespace-nowrap">
            {nameA}军团 {stats.kobePercent}%
          </span>
        </div>

        {/* LeBron side */}
        <div
          className="h-full flex items-center justify-end pr-3 transition-all duration-700 ease-out"
          style={{
            width: `${stats.lebronPercent}%`,
            background: "linear-gradient(90deg, #FDBB30 0%, #860038 100%)",
          }}
        >
          <span className="text-[11px] sm:text-xs font-black text-white drop-shadow-md whitespace-nowrap">
            {stats.lebronPercent}% {nameB}军团
          </span>
        </div>

        {/* Center VS divider */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] font-black text-white/60 bg-black/60 px-1.5 py-0.5 rounded-full">
            VS
          </span>
        </div>
      </div>

      {/* Total count */}
      <div className="text-center mt-1">
        <span className="text-[10px] text-white/25">
          🌍 全球 {stats.total.toLocaleString()} 票
        </span>
      </div>
    </div>
  );
}
