"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useGame } from "./GameProvider";
import { getDebatesForMatchup } from "@/data/debate-loader";
import { recordVote } from "@/lib/voteStats";
import { getMatchupSlots } from "@/lib/matchupSlots";
import { getStatBombsForMatchup } from "@/data/stat-bombs";
import VoteReveal from "./VoteReveal";
import GlobalWar from "./GlobalWar";
import BbtiBattleReplayLens from "./BbtiBattleReplayLens";
import BbtiCaseBattleMobileStack, { BbtiCaseBattleMobileControls } from "./BbtiCaseBattleMobileStack";
import BbtiChallengeCaseBanner from "./BbtiChallengeCaseBanner";
import BbtiChallengeCaseTrail from "./BbtiChallengeCaseTrail";
import ReplayCenter from "./ReplayCenter";
import CourtAgenda from "./CourtAgenda";
import CourtSideAdvisor from "./CourtSideAdvisor";
import DebateSideCard from "./DebateSideCard";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export default function BattleArena() {
  const { currentTopic, currentRound, totalRounds, mainRounds, isBonus, vote, votes, nextRound, kobeScore, lebronScore, currentMatchup, matchupId, bbtiChallengeCase, restart } =
    useGame();
  const slots = getMatchupSlots(matchupId, currentMatchup);
  const pA = slots.kobe;
  const pB = slots.lebron;
  const nameA = pA.nameZh;
  const nameB = pB.nameZh;
  const [voted, setVoted] = useState<"kobe" | "lebron" | null>(null);
  const votedRef = useRef<"kobe" | "lebron" | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [readMode, setReadMode] = useState(false);
  const caseTrailTopics = useMemo(() => {
    const { main, bonus } = getDebatesForMatchup(matchupId);
    return [...main, ...bonus];
  }, [matchupId]);

  const goNextRound = useCallback(() => {
    setVoted(null);
    votedRef.current = null;
    setAnimKey((k) => k + 1);
    setCountdown(null);
    setAutoAdvance(true);
    setReadMode(false);
    nextRound();
  }, [nextRound]);

  useEffect(() => {
    if (!voted || !autoAdvance || countdown === null) return;
    const timer = setTimeout(() => {
      if (countdown <= 1) {
        goNextRound();
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [autoAdvance, countdown, voted, goNextRound]);

  const statBomb = useMemo(() => {
    if (!voted || !currentTopic) return null;
    const bombs = getStatBombsForMatchup(matchupId, currentTopic.id);
    if (bombs.length === 0) return null;
    const opposing = bombs.find((b) => b.side !== voted);
    return opposing || bombs[0];
  }, [voted, currentTopic, matchupId]);
  const nextTopic = caseTrailTopics[currentRound + 1] ?? null;

  const voteForSide = useCallback((winner: "kobe" | "lebron") => {
    if (!currentTopic || votedRef.current) return;
    const shouldPause = readMode || Boolean(bbtiChallengeCase) || prefersReducedMotion();
    votedRef.current = winner;
    setVoted(winner);
    setCountdown(shouldPause ? null : 8);
    setAutoAdvance(!shouldPause);
    vote(winner);
    recordVote(currentTopic.id, winner, matchupId);
  }, [bbtiChallengeCase, currentTopic, matchupId, readMode, vote]);

  const handleCardClick = (winner: "kobe" | "lebron") => {
    if (votedRef.current) {
      goNextRound();
      return;
    }
    voteForSide(winner);
  };

  const handleExtendReview = useCallback(() => {
    setReadMode(false);
    setAutoAdvance(true);
    setCountdown((current) => (current ?? 0) + 10);
  }, []);

  const handlePauseAutoAdvance = useCallback(() => {
    setReadMode(true);
    setAutoAdvance(false);
    setCountdown(null);
  }, []);

  const toggleReadMode = useCallback(() => {
    setReadMode((current) => {
      const next = !current;
      if (next) {
        setAutoAdvance(false);
        setCountdown(null);
      } else if (votedRef.current) {
        setAutoAdvance(true);
        setCountdown(8);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.repeat) return;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.key === "l" || event.key === "L") {
        event.preventDefault();
        toggleReadMode();
        return;
      }

      if (!currentTopic) return;

      if (!votedRef.current) {
        if (event.key === "ArrowLeft" || event.key === "1") {
          event.preventDefault();
          voteForSide("kobe");
        }
        if (event.key === "ArrowRight" || event.key === "2") {
          event.preventDefault();
          voteForSide("lebron");
        }
        return;
      }

      if (event.key === "Enter" || event.key === "n" || event.key === "N") {
        event.preventDefault();
        goNextRound();
      }
      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        handleExtendReview();
      }
      if (event.key === "p" || event.key === "P") {
        event.preventDefault();
        handlePauseAutoAdvance();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentTopic, goNextRound, handleExtendReview, handlePauseAutoAdvance, toggleReadMode, voteForSide]);

  if (!currentTopic) return null;

  const handleExit = () => {
    if (window.confirm("确定要退出当前对决？进度将不会保存。")) {
      restart();
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 sm:py-10 max-w-5xl mx-auto relative" key={animKey}>
      <button
        onClick={handleExit}
        className="absolute top-3 right-3 sm:top-5 sm:right-5 text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer z-20"
      >
        ✕ 退出
      </button>
      {/* Global war banner */}
      <GlobalWar />

      <BbtiChallengeCaseBanner context={bbtiChallengeCase} compact />

      <div className="mb-4 flex justify-center">
        <button
          onClick={toggleReadMode}
          title="L 切换读报模式，1/← 选左，2/→ 选右，N/Enter 下一题"
          className={`rounded-full border px-4 py-2 text-xs font-black transition-colors cursor-pointer ${
            readMode
              ? "border-kobe-gold bg-kobe-gold text-black"
              : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white/75"
          }`}
        >
          {readMode ? "读报模式 ON" : "读报模式"}
        </button>
      </div>

      {/* Header: score + progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-kobe-gold font-bold text-lg">{kobeScore}</span>
          <span className="text-white/30 text-sm">{nameA}</span>
        </div>
        <div className="text-center">
          <span className="text-white/50 text-sm">
            {isBonus ? `Bonus ${currentRound - mainRounds + 1}/3` : `Round ${currentRound + 1}/${mainRounds}`}
          </span>
          {isBonus && <span className="block text-yellow-400/60 text-xs">🔮 假设题</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/30 text-sm">{nameB}</span>
          <span className="text-lebron-gold font-bold text-lg">{lebronScore}</span>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-8 flex-wrap">
        {Array.from({ length: totalRounds }, (_, i) => {
          const isCompleted = i < currentRound;
          const isCurrent = i === currentRound;
          const isBonusRound = i >= mainRounds;
          return (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                isCurrent
                  ? "w-4 h-2.5 sm:w-5 sm:h-3 bg-gradient-to-r from-kobe-gold to-lebron-gold"
                  : isCompleted
                    ? `w-2 h-2 sm:w-2.5 sm:h-2.5 ${isBonusRound ? "bg-yellow-400/60" : "bg-white/40"}`
                    : `w-2 h-2 sm:w-2.5 sm:h-2.5 ${isBonusRound ? "bg-yellow-400/15" : "bg-white/10"}`
              }`}
            />
          );
        })}
      </div>

      {/* Topic title */}
      <div className="text-center mb-8" style={{ animation: "fade-up 0.5s ease-out" }}>
        <span className="text-3xl sm:text-4xl mr-3">{currentTopic.emoji}</span>
        <h2 className="inline text-2xl sm:text-3xl font-black text-white">
          {currentTopic.title}
        </h2>
      </div>

      <CourtAgenda
        matchupId={matchupId}
        nameA={nameA}
        nameB={nameB}
        topicTitle={currentTopic.title}
        compact
      />

      {/* Debate cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <DebateSideCard
          side="kobe"
          playerNumber={pA.number}
          playerName={nameA}
          content={currentTopic.kobe}
          voted={voted}
          onChoose={handleCardClick}
        />

        <DebateSideCard
          side="lebron"
          playerNumber={pB.number}
          playerName={nameB}
          content={currentTopic.lebron}
          voted={voted}
          onChoose={handleCardClick}
        />
      </div>

      {voted && (
        <BbtiCaseBattleMobileStack
          autoAdvanceState={autoAdvance && countdown !== null ? "running" : "paused"}
          caseContext={bbtiChallengeCase}
          roundNumber={currentRound + 1}
          votedFor={voted}
        >
          {statBomb && (
            <div className="order-1" data-bbti-case-battle-mobile-slot="replay">
              <ReplayCenter
                bomb={statBomb}
                matchupId={matchupId ?? undefined}
                nameA={nameA}
                nameB={nameB}
                roundNumber={currentRound + 1}
                topicId={currentTopic.id}
              />
            </div>
          )}

          <div className="order-2" data-bbti-case-battle-mobile-slot="advisor">
            <CourtSideAdvisor
              topic={currentTopic}
              votedFor={voted}
              nameA={nameA}
              nameB={nameB}
              statBomb={statBomb}
              caseContext={bbtiChallengeCase}
            />
          </div>

          <div className="order-4 sm:order-3" data-bbti-case-battle-mobile-slot="lens">
            <BbtiBattleReplayLens
              caseContext={bbtiChallengeCase}
              matchupId={matchupId}
              nameA={nameA}
              nameB={nameB}
              nextTopic={nextTopic}
              roundNumber={currentRound + 1}
              statBomb={statBomb}
              topic={currentTopic}
              votedFor={voted}
            />
          </div>

          <div className="order-5 sm:order-4" data-bbti-case-battle-mobile-slot="trail">
            <BbtiChallengeCaseTrail
              context={bbtiChallengeCase}
              currentRound={currentRound}
              nameA={nameA}
              nameB={nameB}
              topics={caseTrailTopics}
              votes={votes}
            />
          </div>

          <div className="order-6 sm:order-5" data-bbti-case-battle-mobile-slot="vote-reveal">
            <VoteReveal topicId={currentTopic.id} votedFor={voted} />
          </div>

          <div className="order-3 sm:order-6" data-bbti-case-battle-mobile-slot="controls">
            <BbtiCaseBattleMobileControls
              autoAdvance={autoAdvance}
              countdown={countdown}
              onExtendReview={handleExtendReview}
              onNextRound={goNextRound}
              onPauseAutoAdvance={handlePauseAutoAdvance}
              readMode={readMode}
            />
          </div>
        </BbtiCaseBattleMobileStack>
      )}

      {!voted && (
        <p className="text-center text-white/30 text-sm mt-6">
          选择你认为更有道理的一方 · 1/← 选左 · 2/→ 选右
        </p>
      )}
    </div>
  );
}
