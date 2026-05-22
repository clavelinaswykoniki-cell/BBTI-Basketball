"use client";

import { useState, useEffect } from "react";
import { useGame } from "./GameProvider";

export default function BattleArena() {
  const { currentTopic, currentRound, totalRounds, vote, nextRound, kobeScore, lebronScore, side } =
    useGame();
  const [voted, setVoted] = useState<"kobe" | "lebron" | null>(null);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setVoted(null);
    setAnimKey((k) => k + 1);
  }, [currentRound]);

  if (!currentTopic) return null;

  const handleVote = (winner: "kobe" | "lebron") => {
    if (voted) return;
    setVoted(winner);
    vote(winner);
  };

  const handleNext = () => {
    nextRound();
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 sm:py-10 max-w-5xl mx-auto" key={animKey}>
      {/* Header: score + progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-kobe-gold font-bold text-lg">{kobeScore}</span>
          <span className="text-white/30 text-sm">科比</span>
        </div>
        <div className="text-center">
          <span className="text-white/50 text-sm">
            Round {currentRound + 1}/{totalRounds}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/30 text-sm">詹姆斯</span>
          <span className="text-lebron-gold font-bold text-lg">{lebronScore}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-kobe-gold to-lebron-gold rounded-full transition-all duration-500"
          style={{ width: `${((currentRound + 1) / totalRounds) * 100}%` }}
        />
      </div>

      {/* Topic title */}
      <div className="text-center mb-8" style={{ animation: "fade-up 0.5s ease-out" }}>
        <span className="text-3xl sm:text-4xl mr-3">{currentTopic.emoji}</span>
        <h2 className="inline text-2xl sm:text-3xl font-black text-white">
          {currentTopic.title}
        </h2>
      </div>

      {/* Debate cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 flex-1">
        {/* Kobe card */}
        <div
          className={`rounded-2xl p-5 sm:p-6 border-2 transition-all duration-300 cursor-pointer
            ${voted === "kobe"
              ? "border-kobe-gold bg-kobe-purple/30 scale-[1.02]"
              : voted === "lebron"
                ? "border-white/10 bg-white/5 opacity-60"
                : "border-kobe-gold/20 bg-kobe-purple/10 hover:border-kobe-gold/60 hover:bg-kobe-purple/20"
            }`}
          onClick={() => handleVote("kobe")}
          style={{ animation: "slide-in-left 0.6s ease-out" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-kobe-gold font-black text-lg">#24</span>
            <span className="text-white font-bold">科比说：</span>
            {voted === "kobe" && (
              <span className="ml-auto text-kobe-gold text-sm font-bold">✓ 你的选择</span>
            )}
          </div>
          <p className="text-white/90 font-semibold mb-4 text-sm sm:text-base">
            {currentTopic.kobe.claim}
          </p>
          <ul className="space-y-2 mb-4">
            {currentTopic.kobe.points.map((p, i) => (
              <li key={i} className="flex gap-2 text-white/70 text-sm">
                <span className="text-kobe-gold mt-0.5 shrink-0">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-kobe-gold/20 pt-3 mt-auto">
            <p className="text-kobe-gold font-bold text-sm italic">
              &ldquo;{currentTopic.kobe.punchline}&rdquo;
            </p>
          </div>
        </div>

        {/* LeBron card */}
        <div
          className={`rounded-2xl p-5 sm:p-6 border-2 transition-all duration-300 cursor-pointer
            ${voted === "lebron"
              ? "border-lebron-gold bg-lebron-wine/30 scale-[1.02]"
              : voted === "kobe"
                ? "border-white/10 bg-white/5 opacity-60"
                : "border-lebron-gold/20 bg-lebron-wine/10 hover:border-lebron-gold/60 hover:bg-lebron-wine/20"
            }`}
          onClick={() => handleVote("lebron")}
          style={{ animation: "slide-in-right 0.6s ease-out" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lebron-gold font-black text-lg">#23</span>
            <span className="text-white font-bold">詹姆斯说：</span>
            {voted === "lebron" && (
              <span className="ml-auto text-lebron-gold text-sm font-bold">✓ 你的选择</span>
            )}
          </div>
          <p className="text-white/90 font-semibold mb-4 text-sm sm:text-base">
            {currentTopic.lebron.claim}
          </p>
          <ul className="space-y-2 mb-4">
            {currentTopic.lebron.points.map((p, i) => (
              <li key={i} className="flex gap-2 text-white/70 text-sm">
                <span className="text-lebron-gold mt-0.5 shrink-0">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-lebron-gold/20 pt-3 mt-auto">
            <p className="text-lebron-gold font-bold text-sm italic">
              &ldquo;{currentTopic.lebron.punchline}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Next button */}
      {voted && (
        <div className="flex justify-center mt-8" style={{ animation: "fade-up 0.3s ease-out" }}>
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full
              transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
          >
            {currentRound + 1 < totalRounds ? "下一轮 →" : "查看结果 🏆"}
          </button>
        </div>
      )}

      {!voted && (
        <p className="text-center text-white/30 text-sm mt-6">
          {side === "kobe" ? "科蜜" : "詹蜜"}，点击你认为更有道理的一方
        </p>
      )}
    </div>
  );
}
