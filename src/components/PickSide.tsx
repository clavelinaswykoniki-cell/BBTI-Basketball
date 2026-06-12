"use client";

import { useGame } from "./GameProvider";
import { getMatchupSlots } from "@/lib/matchupSlots";
import BbtiChallengeCaseBanner from "./BbtiChallengeCaseBanner";
import CourtAgenda from "./CourtAgenda";

export default function PickSide() {
  const { pickSide, currentMatchup, matchupId, bbtiChallengeCase, backToMatchupSelect } = useGame();

  const slots = getMatchupSlots(matchupId, currentMatchup);
  const pA = slots.kobe;
  const pB = slots.lebron;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      <button
        onClick={backToMatchupSelect}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 text-xs sm:text-sm text-white/40 hover:text-white/80 transition-colors cursor-pointer"
      >
        ← 换个对决
      </button>
      <h2 className="text-2xl sm:text-4xl font-black mb-2 text-white text-center">
        先选一边站
      </h2>
      <p className="text-white/50 mb-6 text-center">
        选完之后开始12道灵魂拷问
      </p>

      <BbtiChallengeCaseBanner context={bbtiChallengeCase} />

      <CourtAgenda
        matchupId={matchupId}
        nameA={pA.nameZh ?? pA.name}
        nameB={pB.nameZh ?? pB.name}
      />

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-3xl">
        <button
          onClick={() => pickSide("kobe")}
          className="flex-1 group relative overflow-hidden rounded-2xl border-2 border-kobe-gold/30
            hover:border-kobe-gold transition-all duration-300 cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-kobe-purple/40 to-kobe-purple/80 group-hover:from-kobe-purple/60 group-hover:to-kobe-purple transition-all" />
          <div className="relative z-10 p-8 sm:p-12 text-center">
            <div className="text-6xl sm:text-8xl font-black text-kobe-gold mb-4">
              {pA.number}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {pA.name}
            </div>
            <div className="text-kobe-gold font-semibold mb-4">
              {pA.nickname}
            </div>
            <div className="mt-6 text-kobe-gold text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              我站{pA.nameZh ?? pA.name} →
            </div>
          </div>
        </button>

        <div className="flex items-center justify-center text-3xl font-black text-white/30 sm:text-4xl">
          VS
        </div>

        <button
          onClick={() => pickSide("lebron")}
          className="flex-1 group relative overflow-hidden rounded-2xl border-2 border-lebron-gold/30
            hover:border-lebron-gold transition-all duration-300 cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-lebron-wine/40 to-lebron-wine/80 group-hover:from-lebron-wine/60 group-hover:to-lebron-wine transition-all" />
          <div className="relative z-10 p-8 sm:p-12 text-center">
            <div className="text-6xl sm:text-8xl font-black text-lebron-gold mb-4">
              {pB.number}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {pB.name}
            </div>
            <div className="text-lebron-gold font-semibold mb-4">
              {pB.nickname}
            </div>
            <div className="mt-6 text-lebron-gold text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              我站{pB.nameZh ?? pB.name} →
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
