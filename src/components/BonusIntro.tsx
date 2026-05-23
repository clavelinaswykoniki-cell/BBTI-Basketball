"use client";

import { useGame } from "./GameProvider";

export default function BonusIntro() {
  const { kobeScore, lebronScore, mainRounds, startBonus, skipToResult, restart } = useGame();

  const handleExit = () => {
    if (window.confirm("确定要退出？当前对决进度将不会保存。")) {
      restart();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      <button
        onClick={handleExit}
        className="absolute top-3 right-3 sm:top-5 sm:right-5 text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer"
      >
        ✕ 退出
      </button>
      <div className="text-center max-w-lg" style={{ animation: "fade-up 0.6s ease-out" }}>
        <div className="text-6xl mb-6">🔮</div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
          {mainRounds} 轮正赛结束！
        </h2>
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="text-kobe-gold font-bold text-2xl">{kobeScore}</span>
          <span className="text-white/30">:</span>
          <span className="text-lebron-gold font-bold text-2xl">{lebronScore}</span>
        </div>
        <p className="text-white/60 mb-2">
          但是，真正的争论从来不在数据和荣誉上——
        </p>
        <p className="text-white/80 font-semibold text-lg mb-8">
          如果他们互换人生呢？
        </p>

        <div className="space-y-3">
          <button
            onClick={startBonus}
            className="w-full max-w-xs mx-auto block px-8 py-4 bg-gradient-to-r from-kobe-purple to-lebron-wine text-white text-lg font-bold rounded-full
              hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
          >
            进入假设题 🔮
          </button>
          <button
            onClick={skipToResult}
            className="w-full max-w-xs mx-auto block px-8 py-3 bg-white/5 hover:bg-white/10 text-white/50 font-bold rounded-full
              transition-all duration-200 cursor-pointer text-sm"
          >
            跳过，直接看结果
          </button>
        </div>

        <p className="mt-8 text-xs text-white/30">
          3 道 &ldquo;如果&rdquo; 假设题 · 纯粹脑洞 · 没有对错
        </p>
      </div>
    </div>
  );
}
