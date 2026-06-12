"use client";

import { useGame } from "./GameProvider";
import { matchups } from "@/data/matchups";
import { MATCHUP_TAGS } from "@/data/matchup-tags";

const HERO_MATCHUP_ID = "kobe-vs-lebron";

const FEATURED_LINKS = [
  { id: "matchup-select", label: "全部经典对决" },
  { id: "kobe-vs-jordan", label: "乔科 · 师徒镜像" },
  { id: "lebron-vs-jordan", label: "詹乔 · 历史第一" },
  { id: "magic-vs-bird", label: "魔鸟 · 宿命主线" },
  { id: "curry-vs-durant", label: "杜库 · 王朝归因" },
];

const BALLS = Array.from({ length: 10 }, (_, i) => ({
  left: `${8 + i * 9}%`,
  delay: `${i * 1.7}s`,
  duration: `${10 + (i % 4) * 3}s`,
  emoji: i % 3 === 0 ? "\u{1F3C0}" : i % 3 === 1 ? "⭐" : "\u{1F525}",
}));

export default function Landing() {
  const { startGame, openBbtiEntry, selectMatchup } = useGame();
  const heroMatchup = matchups.find((matchup) => matchup.id === HERO_MATCHUP_ID) ?? matchups[0];
  const heroTags = heroMatchup ? MATCHUP_TAGS[heroMatchup.id] : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
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

      <div className="relative z-10 text-center w-full max-w-4xl">
        <div
          className="inline-flex items-center gap-2 rounded-full border border-kobe-gold/25 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-kobe-gold mb-4"
          style={{ animation: "fade-up 0.65s ease-out" }}
        >
          <span>NBA 人格审判</span>
          <span className="text-white/20">/</span>
          <span>Season 01</span>
        </div>

        <h1
          className="text-5xl sm:text-7xl font-black mb-2 bg-gradient-to-r from-kobe-gold via-white to-lebron-gold bg-clip-text text-transparent"
          style={{ animation: "fade-up 0.8s ease-out" }}
        >
          篮球 MBTI
        </h1>
        <p
          className="text-lg sm:text-xl text-white/60 mb-6 tracking-wide"
          style={{ animation: "fade-up 1s ease-out" }}
        >
          Basketball Brain Type Indicator
        </p>

        <p
          className="text-lg sm:text-xl text-white/60 mb-2"
          style={{ animation: "fade-up 1s ease-out" }}
        >
          12/30/50 道选择题，揭示你的篮球人格
        </p>
        <p className="text-sm text-white/40 mb-2">
          8组经典对决 · 16种BBTI类型 · AI人格分析
        </p>
        <p className="text-xs text-white/25 mb-10">
          科比vs詹姆斯 · 科比vs乔丹 · 詹姆斯vs乔丹 · 魔术师vs大鸟 · 库里vs杜兰特 · 奥尼尔vs姚明 · 邓肯vs加内特 · 艾弗森vs麦迪
        </p>

        <div
          className="flex flex-col sm:flex-row items-center gap-3 justify-center"
          style={{ animation: "fade-up 1.2s ease-out" }}
        >
          <button
            onClick={() => selectMatchup(HERO_MATCHUP_ID)}
            className="px-8 py-4 min-h-[48px] bg-kobe-gold text-black text-lg font-black rounded-full
              hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            科詹 GOAT 法庭
          </button>
          <button
            onClick={openBbtiEntry}
            className="px-10 py-4 min-h-[48px] bg-gradient-to-r from-kobe-purple to-lebron-wine text-white text-xl font-bold rounded-full
              hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
          >
            🧠 开始 BBTI 测试
          </button>
          <button
            onClick={() => selectMatchup("custom")}
            className="px-8 py-4 min-h-[48px] border-2 border-white/20 hover:border-white/50 text-white/70 hover:text-white text-lg font-bold rounded-full
              hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            自选两位球星
          </button>
        </div>

        <div
          className="mt-8 w-full rounded-2xl border border-kobe-gold/25 bg-white/[0.04] p-4 sm:p-5 text-left"
          style={{ animation: "fade-up 1.35s ease-out" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="rounded-full bg-kobe-gold px-2.5 py-1 text-[10px] font-black text-black">
                  FEATURED CLASH
                </span>
                <span className="text-[10px] font-black text-white/35 tracking-[0.2em] uppercase">
                  {heroTags?.heat ?? "99 HEAT"}
                </span>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/45">
                  {heroTags?.lane ?? "GOAT 法庭"}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl sm:text-4xl font-black text-kobe-gold tracking-tighter text-glow">
                  {heroMatchup?.playerA.number ?? "#24"}
                </span>
                <span className="text-lg font-black text-white/30">VS</span>
                <span className="text-3xl sm:text-4xl font-black text-lebron-gold tracking-tighter text-glow">
                  {heroMatchup?.playerB.number ?? "#23"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mb-1">
                {heroMatchup?.title ?? "科比 vs 詹姆斯"}：英雄球和全能系统的终极审判
              </h2>
              <p className="text-sm text-white/50 leading-relaxed">
                {heroTags?.advisor ?? "这局会暴露你到底相信最后一攻、忠诚叙事，还是相信最优解、长期统治和建队工程。"}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(heroTags?.axes ?? ["英雄球", "忠诚/冠军", "Eye Test"]).map((axis) => (
                  <span
                    key={axis}
                    className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] font-bold text-white/45"
                  >
                    {axis}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => selectMatchup(HERO_MATCHUP_ID)}
              className="shrink-0 rounded-xl bg-gradient-to-r from-kobe-gold to-lebron-gold px-5 py-3 text-sm font-black text-black hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              直接开庭
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {FEATURED_LINKS.map((item) => (
              <button
                key={item.id}
                onClick={() => item.id === "matchup-select" ? startGame() : selectMatchup(item.id)}
                className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-bold text-white/55 hover:border-kobe-gold/45 hover:text-kobe-gold transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-xs text-white/30">
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
