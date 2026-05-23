"use client";

import { useState } from "react";
import { useGame } from "./GameProvider";
import { players } from "@/data/player-database";

const SHORT_NAMES: Record<string, string> = {
  kobe: "科比",
  shaq: "奥尼尔",
  yao: "姚明",
  magic: "魔术师",
  bird: "大鸟",
  ai: "艾弗森",
  tmac: "麦迪",
  wilt: "张伯伦",
  russell: "拉塞尔",
  kareem: "贾巴尔",
  drj: "J博士",
};

function shortCN(id: string, nameCN: string): string {
  if (SHORT_NAMES[id]) return SHORT_NAMES[id];
  if (nameCN.includes("·")) return nameCN.split("·").pop() ?? nameCN;
  return nameCN;
}

const POS_COLOR: Record<string, string> = {
  PG: "#38bdf8",
  SG: "#a78bfa",
  SF: "#34d399",
  PF: "#fb923c",
  C: "#f87171",
};

function posColor(pos: string): string {
  return POS_COLOR[pos] ?? "#94a3b8";
}

interface PlayerCardProps {
  player: (typeof players)[0];
  selected?: boolean;
  dimmed?: boolean;
  onClick: () => void;
}

function PlayerCard({ player, selected, dimmed, onClick }: PlayerCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={dimmed}
      className={`relative rounded-xl border-2 transition-all duration-200 text-left cursor-pointer
        ${selected
          ? "border-kobe-gold scale-[1.03] bg-kobe-purple/40"
          : dimmed
            ? "border-white/5 opacity-30 cursor-not-allowed"
            : "border-white/10 hover:border-white/30 hover:scale-[1.02] active:scale-[0.98] bg-white/[0.03] hover:bg-white/[0.06]"
        }`}
    >
      {selected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-kobe-gold flex items-center justify-center text-xs font-black text-black z-10">
          ✓
        </div>
      )}
      <div className="p-3 sm:p-4">
        {/* Number + position */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-lg sm:text-xl font-black text-kobe-gold">
            {player.number}
          </span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ color: posColor(player.position), background: posColor(player.position) + "22" }}
          >
            {player.position}
          </span>
        </div>

        {/* Chinese name */}
        <div className="text-sm sm:text-base font-bold text-white leading-tight mb-0.5">
          {shortCN(player.id, player.nameCN)}
        </div>

        {/* English name */}
        <div className="text-[10px] text-white/30 mb-2 truncate">
          {player.name}
        </div>

        {/* Key stats */}
        <div className="flex gap-2 text-[10px] text-white/50">
          <span>{player.stats.ppg} PPG</span>
          <span>·</span>
          <span>{player.stats.rings}💍</span>
          {player.stats.mvps > 0 && (
            <>
              <span>·</span>
              <span>{player.stats.mvps} MVP</span>
            </>
          )}
        </div>

        {/* Era */}
        <div className="mt-1.5 text-[10px] text-white/25">{player.era}</div>
      </div>
    </button>
  );
}

export default function CustomMatchupSelect() {
  const { selectCustomMatchup, backToMatchupSelect } = useGame();
  const [playerA, setPlayerA] = useState<string | null>(null);
  const [playerB, setPlayerB] = useState<string | null>(null);

  const step = playerA === null ? 1 : 2;
  const selectedA = playerA ? players.find((p) => p.id === playerA) : null;
  const selectedB = playerB ? players.find((p) => p.id === playerB) : null;

  function handleSelect(id: string) {
    if (step === 1) {
      setPlayerA(id);
    } else {
      if (id === playerA) return;
      setPlayerB(id);
      selectCustomMatchup(playerA!, id);
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={backToMatchupSelect}
          className="text-xs sm:text-sm text-white/40 hover:text-white/80 transition-colors cursor-pointer"
        >
          ← 返回
        </button>
        <div className="flex-1">
          <h2 className="text-xl sm:text-3xl font-black text-white">
            自选对比
          </h2>
          <p className="text-white/40 text-sm mt-0.5">
            {step === 1 ? "第一步：选择第一位球员" : "第二步：选择第二位球员"}
          </p>
        </div>
      </div>

      {/* Step indicator + preview */}
      <div className="flex items-center gap-3 mb-6 max-w-5xl mx-auto w-full">
        {/* Player A slot */}
        <div
          className={`flex-1 rounded-xl border-2 p-3 sm:p-4 text-center transition-all ${
            selectedA
              ? "border-kobe-gold/60 bg-kobe-purple/20"
              : "border-white/10 border-dashed"
          }`}
        >
          {selectedA ? (
            <>
              <div className="text-lg font-black text-kobe-gold">{selectedA.number}</div>
              <div className="text-sm font-bold text-white">{shortCN(selectedA.id, selectedA.nameCN)}</div>
            </>
          ) : (
            <div className="text-white/20 text-sm">球员 A</div>
          )}
        </div>

        <div className="text-2xl font-black text-white/20">VS</div>

        {/* Player B slot */}
        <div
          className={`flex-1 rounded-xl border-2 p-3 sm:p-4 text-center transition-all ${
            selectedB
              ? "border-lebron-gold/60 bg-lebron-wine/20"
              : step === 2
                ? "border-white/20 border-dashed animate-pulse"
                : "border-white/10 border-dashed"
          }`}
        >
          {selectedB ? (
            <>
              <div className="text-lg font-black text-lebron-gold">{selectedB.number}</div>
              <div className="text-sm font-bold text-white">{shortCN(selectedB.id, selectedB.nameCN)}</div>
            </>
          ) : (
            <div className={`text-sm ${step === 2 ? "text-white/50" : "text-white/20"}`}>
              {step === 2 ? "👆 再选一位" : "球员 B"}
            </div>
          )}
        </div>
      </div>

      {/* Player grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 w-full max-w-5xl mx-auto">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            selected={player.id === playerA || player.id === playerB}
            dimmed={step === 2 && player.id === playerA}
            onClick={() => handleSelect(player.id)}
          />
        ))}
      </div>

      {/* Reset button if in step 2 */}
      {step === 2 && (
        <button
          onClick={() => setPlayerA(null)}
          className="mt-6 mx-auto text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer"
        >
          ← 重新选第一位
        </button>
      )}
    </div>
  );
}
