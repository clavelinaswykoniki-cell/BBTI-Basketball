"use client";

import { useGame } from "./GameProvider";

export default function Landing() {
  const { startGame } = useGame();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background split */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-gradient-to-br from-[#552583]/30 to-[#552583]/10" />
        <div className="w-1/2 bg-gradient-to-bl from-[#860038]/30 to-[#860038]/10" />
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        <div className="flex items-center justify-center gap-6 mb-8">
          <span className="text-6xl sm:text-8xl font-black text-kobe-gold tracking-tighter">
            #24
          </span>
          <span
            className="text-4xl sm:text-6xl font-black text-white/60"
            style={{ animation: "vs-pulse 2s ease-in-out infinite" }}
          >
            VS
          </span>
          <span className="text-6xl sm:text-8xl font-black text-lebron-gold tracking-tighter">
            #23
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black mb-4 bg-gradient-to-r from-kobe-gold via-white to-lebron-gold bg-clip-text text-transparent">
          GOAT DEBATE
        </h1>
        <p className="text-lg sm:text-xl text-white/60 mb-2">
          科比 vs 詹姆斯 — 史上最大争议，你来投票
        </p>
        <p className="text-sm text-white/40 mb-10">
          12 个最热争议话题 · 选边站 · 逐轮 PK · 最终裁决
        </p>

        <button
          onClick={startGame}
          className="px-10 py-4 bg-gradient-to-r from-kobe-purple to-lebron-wine text-white text-xl font-bold rounded-full
            hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
        >
          开始辩论
        </button>

        <p className="mt-8 text-xs text-white/30">
          纯粹为了好玩 · 拒绝上纲上线 · 两位都是传奇
        </p>
      </div>
    </div>
  );
}
