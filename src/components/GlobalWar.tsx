"use client";

import { useState } from "react";
import { getGlobalStats, type GlobalStats } from "@/lib/voteStats";

/**
 * Compact one-line banner showing the overall Kobe vs LeBron war status.
 * Designed to sit at the top of the battle arena.
 * Reads from localStorage on mount — no props needed.
 */
export default function GlobalWar() {
  const [stats] = useState<GlobalStats>(() => getGlobalStats());

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
            科比军团 {stats.kobePercent}%
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
            {stats.lebronPercent}% 詹姆斯军团
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
          🌍 科詹主战场 {stats.total.toLocaleString()} 票
        </span>
      </div>
    </div>
  );
}
