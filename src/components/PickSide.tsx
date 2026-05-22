"use client";

import { useGame } from "./GameProvider";

export default function PickSide() {
  const { pickSide } = useGame();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h2 className="text-2xl sm:text-4xl font-black mb-2 text-white text-center">
        选择你的立场
      </h2>
      <p className="text-white/50 mb-12 text-center">
        选完之后你会看到双方论点，然后逐轮投票
      </p>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-3xl">
        {/* Kobe side */}
        <button
          onClick={() => pickSide("kobe")}
          className="flex-1 group relative overflow-hidden rounded-2xl border-2 border-kobe-gold/30
            hover:border-kobe-gold transition-all duration-300 cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-kobe-purple/40 to-kobe-purple/80 group-hover:from-kobe-purple/60 group-hover:to-kobe-purple transition-all" />
          <div className="relative z-10 p-8 sm:p-12 text-center">
            <div className="text-6xl sm:text-8xl font-black text-kobe-gold mb-4">
              #24
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Kobe Bryant
            </div>
            <div className="text-kobe-gold font-semibold mb-4">
              Black Mamba
            </div>
            <div className="text-white/60 text-sm">
              5x Champion · 1x MVP · 曼巴精神
            </div>
            <div className="mt-6 text-kobe-gold text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              我站科比 →
            </div>
          </div>
        </button>

        {/* VS */}
        <div className="flex items-center justify-center text-3xl font-black text-white/30 sm:text-4xl">
          VS
        </div>

        {/* LeBron side */}
        <button
          onClick={() => pickSide("lebron")}
          className="flex-1 group relative overflow-hidden rounded-2xl border-2 border-lebron-gold/30
            hover:border-lebron-gold transition-all duration-300 cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-lebron-wine/40 to-lebron-wine/80 group-hover:from-lebron-wine/60 group-hover:to-lebron-wine transition-all" />
          <div className="relative z-10 p-8 sm:p-12 text-center">
            <div className="text-6xl sm:text-8xl font-black text-lebron-gold mb-4">
              #23
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
              LeBron James
            </div>
            <div className="text-lebron-gold font-semibold mb-4">
              King James
            </div>
            <div className="text-white/60 text-sm">
              4x Champion · 4x MVP · 历史得分王
            </div>
            <div className="mt-6 text-lebron-gold text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              我站詹姆斯 →
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
