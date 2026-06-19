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

const SCOUTING_STATS = [
  { value: "12", label: "quick read" },
  { value: "16", label: "BBTI types" },
  { value: "08", label: "classic courts" },
];

const COURT_READS = [
  { label: "最后一攻信仰", value: 92 },
  { label: "体系最优解", value: 84 },
  { label: "生涯叙事浓度", value: 78 },
  { label: "建队工程偏好", value: 68 },
];

export default function Landing() {
  const { startGame, openBbtiEntry, selectMatchup } = useGame();
  const heroMatchup = matchups.find((matchup) => matchup.id === HERO_MATCHUP_ID) ?? matchups[0];
  const heroTags = heroMatchup ? MATCHUP_TAGS[heroMatchup.id] : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-white">
      <div className="bbti-arena-bg pointer-events-none" />
      <div className="bbti-court-lines pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,.96),rgba(10,10,10,.58)_52%,rgba(10,10,10,.92))]" />

      <section className="relative z-10 flex min-h-screen flex-col px-5 py-5 sm:px-8 lg:px-12">
        <nav className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 text-[10px] font-black uppercase tracking-[0.24em] text-white/45">
          <span className="text-white/70">BBTI</span>
          <span className="hidden sm:inline text-kobe-gold/80">Basketball Brain Type Indicator</span>
          <span className="rounded-full border border-kobe-gold/25 bg-kobe-gold/10 px-3 py-1 text-kobe-gold">Season 01</span>
        </nav>

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)]">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-kobe-gold/25 bg-black/28 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-kobe-gold backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-kobe-gold shadow-[0_0_18px_rgba(253,185,39,.8)]" />
              Arena Scouting Report
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.94] tracking-tight sm:text-7xl lg:text-8xl">
              篮球 MBTI
              <span className="block bg-gradient-to-r from-kobe-gold via-white to-lebron-gold bg-clip-text text-transparent">
                球迷人格开场
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
              用经典球星对决和 BBTI 题组，把你的篮球判断拆成性格画像：
              你相信最后一攻、体系篮球、历史地位，还是长期建队工程。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={openBbtiEntry}
                className="min-h-[48px] rounded-full bg-kobe-gold px-8 py-4 text-sm font-black text-black shadow-[0_18px_60px_rgba(253,185,39,.2)] transition hover:-translate-y-0.5 hover:bg-lebron-gold active:scale-[0.98] cursor-pointer"
              >
                开始 BBTI 测试
              </button>
              <button
                onClick={() => selectMatchup(HERO_MATCHUP_ID)}
                className="min-h-[48px] rounded-full border border-white/18 bg-white/[0.08] px-8 py-4 text-sm font-black text-white backdrop-blur transition hover:border-kobe-gold/50 hover:bg-white/[0.12] active:scale-[0.98] cursor-pointer"
              >
                科詹 GOAT 法庭
              </button>
              <button
                onClick={() => selectMatchup("custom")}
                className="min-h-[48px] rounded-full border border-lebron-gold/25 bg-lebron-wine/20 px-8 py-4 text-sm font-black text-lebron-gold backdrop-blur transition hover:border-lebron-gold/55 hover:bg-lebron-wine/30 active:scale-[0.98] cursor-pointer"
              >
                自选两位球星
              </button>
            </div>

            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-2">
              {SCOUTING_STATS.map((item) => (
                <div key={item.label} className="border border-white/10 bg-black/30 px-3 py-3 backdrop-blur-sm">
                  <div className="text-2xl font-black leading-none text-white sm:text-3xl">{item.value}</div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-2">
              {FEATURED_LINKS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.id === "matchup-select" ? startGame() : selectMatchup(item.id)}
                  className="rounded-full border border-white/[0.12] bg-black/28 px-3.5 py-2 text-xs font-bold text-white/58 backdrop-blur transition hover:border-kobe-gold/45 hover:text-kobe-gold cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <aside className="bbti-broadcast-panel p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-white/38">Live Scouting</span>
              <span className="bbti-shot-clock rounded-full px-2.5 py-1 text-[10px] font-black text-black">Q4 00.8</span>
            </div>

            <div className="py-7">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="bg-kobe-gold px-2.5 py-1 text-[10px] font-black text-black">FEATURED CLASH</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">{heroTags?.heat ?? "99 HEAT"}</span>
                <span className="border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/45">{heroTags?.lane ?? "GOAT 法庭"}</span>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <div>
                  <div className="text-6xl font-black leading-none text-kobe-gold">{heroMatchup?.playerA.number ?? "#24"}</div>
                  <div className="mt-2 text-xl font-black">{heroMatchup?.playerA.nameZh ?? "科比"}</div>
                  <div className="text-xs text-white/42">{heroMatchup?.playerA.nickname ?? "Black Mamba"}</div>
                </div>
                <div className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-2 text-lg font-black text-white/70">VS</div>
                <div className="text-right">
                  <div className="text-6xl font-black leading-none text-lebron-gold">{heroMatchup?.playerB.number ?? "#23"}</div>
                  <div className="mt-2 text-xl font-black">{heroMatchup?.playerB.nameZh ?? "詹姆斯"}</div>
                  <div className="text-xs text-white/42">{heroMatchup?.playerB.nickname ?? "King James"}</div>
                </div>
              </div>

              <p className="mt-6 text-sm leading-6 text-white/58">
                {heroTags?.advisor ?? "这局会暴露你到底相信最后一攻、忠诚叙事，还是相信最优解、长期统治和建队工程。"}
              </p>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {(heroTags?.axes ?? ["英雄球", "忠诚/冠军", "Eye Test"]).map((axis) => (
                  <span key={axis} className="border border-white/10 bg-black/24 px-2.5 py-1 text-[10px] font-bold text-white/48">
                    {axis}
                  </span>
                ))}
              </div>

              <div className="mt-6 space-y-2">
                {COURT_READS.map((item) => (
                  <div key={item.label} className="grid grid-cols-[108px_1fr_auto] items-center gap-3 text-xs">
                    <span className="font-bold text-white/48">{item.label}</span>
                    <span className="h-1.5 overflow-hidden bg-white/10">
                      <span
                        className="block h-full bg-gradient-to-r from-kobe-gold to-lebron-gold"
                        style={{ width: `${item.value}%` }}
                      />
                    </span>
                    <span className="font-black text-white/62">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => selectMatchup(HERO_MATCHUP_ID)}
              className="w-full border border-white/10 bg-gradient-to-r from-kobe-gold to-lebron-gold px-5 py-4 text-sm font-black text-black transition hover:brightness-110 cursor-pointer"
            >
              直接进入科詹对决
            </button>
          </aside>
        </div>

        <div className="grid gap-2 border-y border-white/10 bg-black/24 py-3 text-xs font-bold text-white/42 backdrop-blur sm:grid-cols-3">
          <span>人格测试 · 快速版和完整版</span>
          <span>经典法庭 · 8 组球星争议</span>
          <span>AI 分析 · 娱乐向篮球画像</span>
        </div>
      </section>
    </main>
  );
}
