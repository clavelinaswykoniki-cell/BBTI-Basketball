"use client";

import type { BbtiChallengeMatchup } from "@/data/bbti-challenges";

interface BbtiChallengeAmmoSwitcherProps {
  challenges: BbtiChallengeMatchup[];
  selectedMatchupId?: string;
  onSelect: (matchupId: string) => void;
}

export default function BbtiChallengeAmmoSwitcher({
  challenges,
  selectedMatchupId,
  onSelect,
}: BbtiChallengeAmmoSwitcherProps) {
  if (challenges.length < 2) return null;

  const selected = challenges.find((challenge) => challenge.matchupId === selectedMatchupId) ?? challenges[0];

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/34">
            Challenge Lane
          </p>
          <h4 className="mt-1 text-sm font-black text-white">
            选这段录像要打哪一庭
          </h4>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-black text-white/38">
          {challenges.length} Lanes
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {challenges.map((challenge) => {
          const isSelected = selected.matchupId === challenge.matchupId;

          return (
            <button
              key={`${challenge.category}-${challenge.matchupId}`}
              type="button"
              onClick={() => onSelect(challenge.matchupId)}
              className={`min-w-0 rounded-lg border px-3 py-2 text-left transition-colors cursor-pointer ${
                isSelected
                  ? "border-kobe-gold/70 bg-kobe-gold/12"
                  : "border-white/10 bg-black/18 hover:border-white/20 hover:bg-white/[0.05]"
              }`}
            >
              <span className={`text-[10px] font-black ${isSelected ? "text-kobe-gold" : "text-white/38"}`}>
                {challenge.category}
              </span>
              <span className="mt-1 block truncate text-xs font-black text-white/78">
                {challenge.title}
              </span>
              <span className="mt-0.5 block truncate text-[10px] font-bold text-white/38">
                {challenge.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-lg border border-kobe-gold/15 bg-kobe-gold/8 px-3 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-kobe-gold/15 px-2 py-0.5 text-[10px] font-black text-kobe-gold">
            当前弹药
          </span>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-black text-white/42">
            {selected.category}
          </span>
        </div>
        <p className="mt-2 text-xs font-black text-white/78 leading-relaxed">
          {selected.title}
        </p>
        <p className="mt-1 text-[11px] text-white/56 leading-relaxed">
          {selected.pressureQuestion ?? selected.reason}
        </p>
        {selected.evidenceLens && (
          <div className="mt-2 flex flex-wrap gap-1">
            {selected.evidenceLens.slice(0, 4).map((lens) => (
              <span
                key={lens}
                className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] font-black text-white/38"
              >
                {lens}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
