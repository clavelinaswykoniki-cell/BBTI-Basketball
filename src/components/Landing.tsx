"use client";

import { useGame } from "./GameProvider";

const BALLS = Array.from({ length: 10 }, (_, i) => ({
  left: `${8 + i * 9}%`,
  delay: `${i * 1.7}s`,
  duration: `${10 + (i % 4) * 3}s`,
  emoji: i % 3 === 0 ? "\u{1F3C0}" : i % 3 === 1 ? "⭐" : "\u{1F525}",
}));

export default function Landing() {
  const { startGame, openBbtiEntry } = useGame();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background split */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-gradient-to-br from-[#552583]/30 to-[#552583]/10" />
        <div className="w-1/2 bg-gradient-to-bl from-[#860038]/30 to-[#860038]/10" />
      </div>

      {/* Floating basketball emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {BALLS.map((b, i) => (
          <span
            key={i}
            className="floating-ball"
            style={{
              left: b.left,
              animationDelay: b.delay,
              animationDuration: b.duration,
            }}
          >
            {b.emoji}
          </span>
        ))}
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        <h1
          className="text-5xl sm:text-7xl font-black mb-2 bg-gradient-to-r from-kobe-gold via-white to-lebron-gold bg-clip-text text-transparent"
          style={{ animation: "fade-up 0.8s ease-out" }}
        >
          BBTI
        </h1>
        <p
          className="text-lg sm:text-xl text-white/60 mb-6 tracking-wide"
          style={{ animation: "fade-up 1s ease-out" }}
        >
          Basketball Brain Type Indicator
        </p>

        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6">
          <span className="text-4xl sm:text-5xl font-black text-kobe-gold tracking-tighter text-glow">
            #24
          </span>
          <span
            className="text-3xl sm:text-4xl font-black text-white/80"
            style={{
              animation: "vs-pulse 2s ease-in-out infinite",
              textShadow: "0 0 30px rgba(255,255,255,0.3), 0 0 60px rgba(255,255,255,0.1)",
            }}
          >
            VS
          </span>
          <span className="text-4xl sm:text-5xl font-black text-lebron-gold tracking-tighter text-glow">
            #23
          </span>
        </div>

        <p
          className="text-lg sm:text-xl text-white/60 mb-2"
          style={{ animation: "fade-up 1s ease-out" }}
        >
          12 道选择题，揭示你的篮球人格
        </p>
        <p className="text-sm text-white/40 mb-2">
          8组经典对决 · 12道灵魂拷问 · AI人格分析
        </p>
        <p className="text-xs text-white/25 mb-10">
          科比vs詹姆斯 · 科比vs乔丹 · 詹姆斯vs乔丹 · 魔术师vs大鸟 · 库里vs杜兰特 · 奥尼尔vs姚明 · 邓肯vs加内特 · 艾弗森vs麦迪
        </p>

        <div
          className="flex flex-col sm:flex-row items-center gap-4 justify-center"
          style={{ animation: "fade-up 1.2s ease-out" }}
        >
          <button
            onClick={openBbtiEntry}
            className="px-10 py-4 min-h-[48px] bg-gradient-to-r from-kobe-purple to-lebron-wine text-white text-xl font-bold rounded-full
              hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
          >
            🧠 开始 BBTI 测试
          </button>
          <button
            onClick={startGame}
            className="px-8 py-4 min-h-[48px] border-2 border-white/20 hover:border-white/50 text-white/70 hover:text-white text-lg font-bold rounded-full
              hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            🏀 辩论模式
          </button>
        </div>

        <p className="mt-8 text-xs text-white/30">
          你的选择暴露你的性格，每位球迷都是独一无二的
        </p>

        {/* Scroll indicator */}
        <div
          className="mt-6 flex flex-col items-center text-white/20"
          style={{ animation: "bounce-down 2s ease-in-out infinite" }}
        >
          <span className="text-xs mb-1">向下滑动</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-40">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
