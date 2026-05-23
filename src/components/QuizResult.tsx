"use client";

import { useGame } from "./GameProvider";
import { lookupBasketballType } from "@/data/personality-analysis";

const DIM_PAIRS: { a: string; b: string; label: string }[] = [
  { a: "持球大核", b: "角色球员", label: "球场角色" },
  { a: "数据党",   b: "情怀党",   label: "评球方式" },
  { a: "头条派",   b: "冷门派",   label: "观点立场" },
  { a: "一城派",   b: "冠军派",   label: "忠诚取向" },
];

function AxisTag({ value }: { value: string }) {
  return (
    <span className="inline-block px-2.5 py-1 rounded-full bg-white/10 text-white/80 text-xs font-bold">
      {value}
    </span>
  );
}

export default function QuizResult() {
  const { quizCode, restart, startGame } = useGame();

  if (!quizCode) {
    restart();
    return null;
  }

  const type = lookupBasketballType(quizCode);
  const dims = quizCode.split("-");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div
        className="w-full max-w-lg"
        style={{ animation: "fade-up 0.6s ease-out" }}
      >
        {/* Type header */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4" style={{ animation: "fade-up 0.5s ease-out" }}>
            {type.emoji}
          </div>
          <p className="text-white/40 text-sm uppercase tracking-widest mb-2">
            你的篮球人格是
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            {type.name}
          </h1>
          <p className="text-white/60 text-base leading-relaxed max-w-sm mx-auto">
            {type.tagline}
          </p>
        </div>

        {/* Soul player */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 mb-5 text-center">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-1">灵魂球员</p>
          <p className="text-xl font-black text-kobe-gold">{type.soulPlayer}</p>
          <p className="text-white/40 text-xs mt-1">最像你看篮球方式的那个人</p>
        </div>

        {/* Axis breakdown */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 mb-6">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-4">你的四维坐标</p>
          <div className="space-y-3">
            {DIM_PAIRS.map((pair, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-white/30 w-14 text-right flex-shrink-0">{pair.label}</span>
                <div className="flex-1 flex items-center gap-2">
                  <span
                    className={`text-xs font-bold transition-all ${
                      dims[i] === pair.a ? "text-kobe-gold" : "text-white/20"
                    }`}
                  >
                    {pair.a}
                  </span>
                  <div className="flex-1 h-1 rounded-full bg-white/10 relative">
                    <div
                      className={`absolute inset-y-0 rounded-full ${
                        dims[i] === pair.a
                          ? "left-0 w-3/4 bg-gradient-to-r from-kobe-gold to-kobe-gold/40"
                          : "right-0 w-3/4 bg-gradient-to-l from-lebron-gold to-lebron-gold/40"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-bold transition-all ${
                      dims[i] === pair.b ? "text-lebron-gold" : "text-white/20"
                    }`}
                  >
                    {pair.b}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Axis tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {dims.map((d) => <AxisTag key={d} value={d} />)}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button
            onClick={startGame}
            className="w-full py-4 bg-gradient-to-r from-kobe-purple to-lebron-wine text-white text-base font-bold rounded-full
              hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            去辩论验证你的人格 🏀
          </button>
          <button
            onClick={restart}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/50 font-bold rounded-full
              transition-all duration-200 cursor-pointer text-sm"
          >
            重新测试
          </button>
        </div>
      </div>
    </div>
  );
}
