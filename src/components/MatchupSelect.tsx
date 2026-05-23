"use client";

import { useGame } from "./GameProvider";
import { matchups } from "@/data/matchups";

// Map color token names to CSS variable values so Tailwind JIT isn't needed
// for dynamic class construction.
const COLOR_MAP: Record<string, string> = {
  "kobe-gold": "var(--kobe-gold)",
  "lebron-gold": "var(--lebron-gold)",
};

function playerColor(token: string): string {
  return COLOR_MAP[token] ?? "#FDB927";
}

export default function MatchupSelect() {
  const { selectMatchup, openBbtiEntry } = useGame();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      {/* BBTI Hero Entry Card */}
      <button
        onClick={openBbtiEntry}
        className="group relative overflow-hidden rounded-3xl border-2 border-kobe-gold/40
          hover:border-kobe-gold transition-all duration-300 cursor-pointer
          hover:scale-[1.01] active:scale-[0.99] w-full max-w-5xl mb-10 p-6 sm:p-8 text-left"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-kobe-purple/40 via-black/40 to-lebron-wine/40 group-hover:from-kobe-purple/60 group-hover:to-lebron-wine/60 transition-all duration-500" />
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 30% 50%, rgba(253,185,39,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(253,187,48,0.3) 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl sm:text-4xl">🧠</span>
              <span className="text-3xl sm:text-5xl font-black tracking-tighter"
                style={{
                  background: "linear-gradient(135deg, #FDB927 0%, #FDBB30 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >BBTI</span>
              <span className="text-white/50 text-xs sm:text-sm font-mono">v1.0</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-white mb-1">
              篮球人格测试 &middot; Basketball Brain Type Indicator
            </h3>
            <p className="text-white/60 text-sm sm:text-base">
              30 题精简版 / 50 题完整版 &middot; 4 维度 &middot; 16 种人格 &middot; 含 1 道深度开放题
            </p>
          </div>
          <div className="text-kobe-gold font-bold text-sm sm:text-base whitespace-nowrap group-hover:text-white transition-colors flex items-center gap-2">
            开始 BBTI <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </div>
      </button>

      <h2 className="text-2xl sm:text-4xl font-black mb-2 text-white text-center">
        或选一组对决开始辩论
      </h2>
      <p className="text-white/50 mb-10 text-center">
        不同对决揭示不同人格维度
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-5xl">
        {matchups.map((matchup) => (
          <button
            key={matchup.id}
            onClick={() => selectMatchup(matchup.id)}
            className="group relative overflow-hidden rounded-2xl border-2 border-white/10
              hover:border-kobe-gold/60 transition-all duration-300 cursor-pointer
              hover:scale-[1.03] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/[0.02] group-hover:from-kobe-purple/30 group-hover:to-lebron-wine/30 transition-all duration-300" />
            <div className="relative z-10 p-6 sm:p-8 text-center">
              {/* Emoji */}
              <div className="text-3xl sm:text-4xl mb-4">
                {matchup.emoji}
              </div>

              {/* Player numbers */}
              <div className="flex items-center justify-center gap-3 mb-3">
                <span
                  className="text-2xl sm:text-3xl font-black"
                  style={{ color: playerColor(matchup.playerA.color) }}
                >
                  {matchup.playerA.number}
                </span>
                <span className="text-lg font-black text-white/30">VS</span>
                <span
                  className="text-2xl sm:text-3xl font-black"
                  style={{ color: playerColor(matchup.playerB.color) }}
                >
                  {matchup.playerB.number}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                {matchup.title}
              </h3>

              {/* Subtitle */}
              <p className="text-white/40 text-sm">
                {matchup.subtitle}
              </p>

              {/* Player names on hover */}
              <div className="mt-4 text-white/50 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {matchup.playerA.name} vs {matchup.playerB.name}
              </div>

              {/* CTA */}
              <div className="mt-3 text-kobe-gold text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                开始测试 &rarr;
              </div>
            </div>
          </button>
        ))}

        {/* Custom matchup card */}
        <button
          onClick={() => selectMatchup("custom")}
          className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-white/20
            hover:border-white/50 transition-all duration-300 cursor-pointer
            hover:scale-[1.03] active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent group-hover:from-white/10 group-hover:to-white/[0.03] transition-all duration-300" />
          <div className="relative z-10 p-6 sm:p-8 text-center flex flex-col items-center justify-center h-full">
            {/* Plus icon */}
            <div className="text-4xl sm:text-5xl mb-4 text-white/30 group-hover:text-white/60 transition-colors duration-300">
              +
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-bold text-white/50 group-hover:text-white/80 mb-1 transition-colors duration-300">
              自选对比
            </h3>

            {/* Subtitle */}
            <p className="text-white/30 text-sm group-hover:text-white/50 transition-colors duration-300">
              选你心中的对决
            </p>

            {/* CTA */}
            <div className="mt-5 text-white/40 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              自定义 &rarr;
            </div>
          </div>
        </button>
      </div>

      <p className="mt-10 text-xs text-white/30">
        每组对决测一个人格维度 &middot; 自选对比：30 位球星任选
      </p>
    </div>
  );
}
