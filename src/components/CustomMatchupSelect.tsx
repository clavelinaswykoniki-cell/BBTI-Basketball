"use client";

import { useMemo, useState } from "react";
import { useGame } from "./GameProvider";
import { players } from "@/data/player-database";
import { getRivalRecommendations } from "@/data/matchup-rivals";

type PlayerFilter = "all" | "guard" | "wing" | "big" | "no-ring" | "champion";

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
  const primary = pos.split("/")[0];
  return POS_COLOR[primary] ?? "#94a3b8";
}

function positionBuckets(position: string): string[] {
  return position.split("/").map((pos) => {
    if (pos === "PG" || pos === "SG") return "guard";
    if (pos === "SF") return "wing";
    if (pos === "PF" || pos === "C") return "big";
    return pos.toLowerCase();
  });
}

function matchesFilter(player: (typeof players)[0], filter: PlayerFilter): boolean {
  if (filter === "all") return true;
  if (filter === "no-ring") return player.stats.rings === 0;
  if (filter === "champion") return player.stats.rings >= 3 || player.stats.fmvps > 0;
  return positionBuckets(player.position).includes(filter);
}

const FILTERS: Array<{ key: PlayerFilter; label: string }> = [
  { key: "all", label: "全部" },
  { key: "guard", label: "后卫" },
  { key: "wing", label: "锋线" },
  { key: "big", label: "内线" },
  { key: "no-ring", label: "无冠遗憾" },
  { key: "champion", label: "冠军收割" },
];

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
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PlayerFilter>("all");

  const step = playerA === null ? 1 : 2;
  const selectedA = playerA ? players.find((p) => p.id === playerA) : null;
  const selectedB = playerB ? players.find((p) => p.id === playerB) : null;
  const recommendations = useMemo(
    () => (selectedA ? getRivalRecommendations(selectedA.id) : []),
    [selectedA],
  );
  const visiblePlayers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return players.filter((player) => {
      if (!matchesFilter(player, filter)) return false;
      if (!normalizedQuery) return true;

      const searchText = [
        player.name,
        player.nameCN,
        player.nickname,
        player.nicknameCN,
        shortCN(player.id, player.nameCN),
        player.position,
        player.era,
      ].join(" ").toLowerCase();

      return searchText.includes(normalizedQuery);
    });
  }, [filter, query]);

  function handleSelect(id: string) {
    if (step === 1) {
      setPlayerA(id);
    } else {
      if (id === playerA) return;
      setPlayerB(id);
      selectCustomMatchup(playerA!, id);
    }
  }

  function handleRandomHotMatchup() {
    const pool = visiblePlayers.length > 0 ? visiblePlayers : players;
    const base = pool[Math.floor(Math.random() * pool.length)];
    if (!base) return;

    const rival = getRivalRecommendations(base.id, 1)[0];
    if (!rival) return;

    selectCustomMatchup(base.id, rival.player.id);
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

      {step === 2 && selectedA && recommendations.length > 0 && (
        <div className="w-full max-w-5xl mx-auto mb-6 rounded-2xl border border-kobe-gold/20 bg-white/[0.04] p-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
            <div>
              <p className="text-[10px] font-black text-kobe-gold tracking-[0.22em] uppercase mb-1">
                Rivalry Advisor
              </p>
              <h3 className="text-lg sm:text-xl font-black text-white">
                给{shortCN(selectedA.id, selectedA.nameCN)}找一个最适合吵的对手
              </h3>
            </div>
            <p className="text-xs text-white/35">
              按时代、位置、荣誉差和争议热度排序
            </p>
          </div>

          <div className="-mx-4 px-4 overflow-x-auto sm:mx-0 sm:px-0 sm:overflow-visible">
            <div className="flex gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4">
              {recommendations.map((item) => (
                <button
                  key={item.player.id}
                  onClick={() => handleSelect(item.player.id)}
                  className="group min-w-[230px] sm:min-w-0 rounded-xl border border-white/10 bg-black/20 p-3 text-left hover:border-kobe-gold/50 hover:bg-kobe-purple/20 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded-full bg-kobe-gold/15 px-2 py-0.5 text-[10px] font-black text-kobe-gold">
                      {item.label}
                    </span>
                    <span className="text-[10px] font-black text-white/45">{item.heat}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-lg font-black text-lebron-gold">{item.player.number}</span>
                    <span className="text-sm font-black text-white">
                      {shortCN(item.player.id, item.player.nameCN)}
                    </span>
                  </div>
                  <div className="text-[10px] text-white/35 mb-2">
                    {item.player.nicknameCN} · {item.player.position}
                  </div>
                  <p className="text-xs text-white/45 leading-relaxed min-h-[48px]">
                    {item.reason}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold text-white/45"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-xs font-bold text-kobe-gold opacity-0 group-hover:opacity-100 transition-opacity">
                    直接开战 &rarr;
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl mx-auto mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="flex-1">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索球星、外号、位置、时代..."
              className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-kobe-gold/50"
            />
          </div>
          <button
            onClick={handleRandomHotMatchup}
            className="rounded-xl border border-kobe-gold/25 bg-kobe-gold/10 px-4 py-3 text-sm font-black text-kobe-gold hover:bg-kobe-gold/18 transition-colors cursor-pointer"
          >
            随机高热对局
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                filter === item.key
                  ? "border-kobe-gold bg-kobe-gold text-black"
                  : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white/75 hover:border-white/25"
              }`}
            >
              {item.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-white/25 self-center">
            {visiblePlayers.length}/{players.length} 位
          </span>
        </div>
      </div>

      {/* Player grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 w-full max-w-5xl mx-auto">
        {visiblePlayers.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            selected={player.id === playerA || player.id === playerB}
            dimmed={step === 2 && player.id === playerA}
            onClick={() => handleSelect(player.id)}
          />
        ))}
      </div>

      {visiblePlayers.length === 0 && (
        <div className="mt-6 text-center text-sm text-white/35">
          没找到这个球星，换个外号、位置或时代试试。
        </div>
      )}

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
