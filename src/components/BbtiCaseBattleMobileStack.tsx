"use client";

import type { ReactNode } from "react";
import type { BbtiChallengeCaseContext } from "@/data/bbti-challenge-case";
import type { VoteSide } from "@/data/stat-bombs";

export const BBTI_CASE_BATTLE_MOBILE_STACK_VERSION = "bbti-case-battle-mobile-polish-v1" as const;

export type BbtiCaseBattleMobileAutoAdvanceState = "paused" | "running";

export const BBTI_CASE_BATTLE_MOBILE_STEPS = [
  { id: "replay", label: "回放", target: "bbti-replay-center" },
  { id: "advisor", label: "场边", target: "bbti-courtside-advisor" },
  { id: "controls", label: "控场", target: "bbti-case-battle-mobile-controls" },
  { id: "lens", label: "镜头", target: "bbti-battle-replay-lens" },
  { id: "trail", label: "案由", target: "bbti-case-trail" },
] as const;

interface BbtiCaseBattleMobileStackProps {
  autoAdvanceState: BbtiCaseBattleMobileAutoAdvanceState;
  caseContext?: BbtiChallengeCaseContext | null;
  children: ReactNode;
  roundNumber: number;
  votedFor: VoteSide;
}

interface BbtiCaseBattleMobileControlsProps {
  autoAdvance: boolean;
  countdown: number | null;
  onExtendReview: () => void;
  onNextRound: () => void;
  onPauseAutoAdvance: () => void;
  readMode: boolean;
}

function autoAdvanceLabel(state: BbtiCaseBattleMobileAutoAdvanceState): string {
  return state === "running" ? "自动继续" : "读报暂停";
}

export function BbtiCaseBattleMobileControls({
  autoAdvance,
  countdown,
  onExtendReview,
  onNextRound,
  onPauseAutoAdvance,
  readMode,
}: BbtiCaseBattleMobileControlsProps) {
  const autoAdvanceState = autoAdvance && countdown !== null ? "running" : "paused";

  return (
    <section
      aria-label="开庭读报控场"
      data-testid="bbti-case-battle-mobile-controls"
      data-bbti-case-battle-mobile-auto-advance={autoAdvanceState}
      className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-3 sm:mt-6 sm:border-transparent sm:bg-transparent sm:p-0"
      style={{ animation: "fade-up 0.6s ease-out" }}
    >
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-center">
        <button
          type="button"
          onClick={onNextRound}
          data-testid="bbti-case-battle-mobile-action"
          data-bbti-case-battle-mobile-action="next"
          className="col-span-2 rounded-full bg-gradient-to-r from-kobe-gold/90 to-lebron-gold/90 px-5 py-2.5 text-sm font-black text-black transition-transform hover:scale-105 active:scale-95 sm:col-span-1 sm:w-auto"
        >
          下一题
        </button>
        <button
          type="button"
          onClick={onExtendReview}
          data-testid="bbti-case-battle-mobile-action"
          data-bbti-case-battle-mobile-action="extend"
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-white/70 transition-colors hover:bg-white/[0.08] sm:px-5 sm:text-sm"
        >
          多看 10 秒
        </button>
        <button
          type="button"
          onClick={onPauseAutoAdvance}
          data-testid="bbti-case-battle-mobile-action"
          data-bbti-case-battle-mobile-action="pause"
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white/85 sm:px-5 sm:text-sm"
        >
          {readMode ? "读报中" : "暂停自动继续"}
        </button>
      </div>
      <p
        data-testid="bbti-case-battle-mobile-countdown"
        className="mt-2 text-center text-xs font-bold text-white/28"
      >
        {autoAdvance && countdown !== null ? `${countdown}s 后自动继续` : "已暂停，读完再走"}
      </p>
    </section>
  );
}

export default function BbtiCaseBattleMobileStack({
  autoAdvanceState,
  caseContext,
  children,
  roundNumber,
  votedFor,
}: BbtiCaseBattleMobileStackProps) {
  return (
    <section
      aria-label="开庭投票后读报顺序"
      data-testid="bbti-case-battle-mobile-stack"
      data-bbti-case-battle-mobile-version={BBTI_CASE_BATTLE_MOBILE_STACK_VERSION}
      data-bbti-case-battle-mobile-source={caseContext?.source ?? "none"}
      data-bbti-case-battle-mobile-round={roundNumber}
      data-bbti-case-battle-mobile-side={votedFor}
      data-bbti-case-battle-mobile-auto-advance={autoAdvanceState}
      data-bbti-case-battle-mobile-step-count={BBTI_CASE_BATTLE_MOBILE_STEPS.length}
      className="mx-auto mt-4 w-full max-w-2xl"
    >
      <div
        data-testid="bbti-case-battle-mobile-rhythm"
        className="rounded-2xl border border-white/10 bg-white/[0.025] p-2 sm:p-3"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[10px] font-black text-white/38">
            手机读报顺序
          </p>
          <div className="flex flex-wrap justify-end gap-1.5">
            <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] font-bold text-white/42">
              Round {roundNumber}
            </span>
            <span className="rounded-full border border-kobe-gold/20 bg-kobe-gold/10 px-2 py-0.5 text-[10px] font-bold text-kobe-gold/72">
              {caseContext ? "案由读报" : "普通读报"}
            </span>
            <span className="rounded-full border border-sky-200/15 bg-sky-200/[0.055] px-2 py-0.5 text-[10px] font-bold text-sky-100/60">
              {autoAdvanceLabel(autoAdvanceState)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {BBTI_CASE_BATTLE_MOBILE_STEPS.map((step, index) => (
            <span
              key={step.id}
              data-testid="bbti-case-battle-mobile-step"
              data-bbti-case-battle-mobile-step={step.id}
              data-bbti-case-battle-mobile-target={step.target}
              data-bbti-case-battle-mobile-position={index + 1}
              className="min-h-[38px] rounded-xl border border-white/10 bg-black/18 px-1.5 py-1 text-center"
            >
              <span className="block text-[9px] font-black text-white/25">
                {index + 1}
              </span>
              <span className="block text-[10px] font-black text-white/58">
                {step.label}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col" data-bbti-case-battle-mobile-stack-layout="mobile-controls-before-lens">
        {children}
      </div>
    </section>
  );
}
