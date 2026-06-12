"use client";

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import type { DebateTopic } from "@/data/debates";
import { getMatchupById, type Matchup } from "@/data/matchups";
import { getDebatesForMatchup, buildCustomMatchupId } from "@/data/debate-loader";
import type { BbtiAnswer } from "@/data/bbti";
import type { BbtiChallengeCaseContext } from "@/data/bbti-challenge-case";

type Side = "kobe" | "lebron";
type BbtiMode = "blitz" | "quick" | "full";

type Phase =
  | "landing"
  | "matchup-select"
  | "custom-select"
  | "pick"
  | "battle"
  | "bonus-intro"
  | "bonus"
  | "result"
  | "quiz"
  | "quiz-result"
  | "bbti-entry"
  | "bbti-quiz"
  | "bbti-result"
  | "bbti-compare";

interface Vote {
  topicId: string;
  winner: Side;
}

interface GameState {
  phase: Phase;
  matchupId: string | null;
  side: Side | null;
  currentRound: number;
  votes: Vote[];
  kobeScore: number;
  lebronScore: number;
  gameStartTime: number | null;
  elapsedSeconds: number;
  quizCode: string | null;
  bbtiMode: BbtiMode;
  bbtiCode: string | null;
  bbtiAnswers: BbtiAnswer[];
  bbtiChallengeCase: BbtiChallengeCaseContext | null;
}

interface GameContextType extends GameState {
  pickSide: (side: Side) => void;
  vote: (winner: Side) => void;
  nextRound: () => void;
  restart: () => void;
  currentTopic: DebateTopic | null;
  totalRounds: number;
  mainRounds: number;
  isBonus: boolean;
  startGame: () => void;
  startQuiz: () => void;
  submitQuiz: (code: string) => void;
  selectMatchup: (id: string, caseContext?: BbtiChallengeCaseContext | null) => void;
  selectCustomMatchup: (playerAId: string, playerBId: string) => void;
  currentMatchup: Matchup | null;
  startBonus: () => void;
  skipToResult: () => void;
  backToMatchupSelect: () => void;
  elapsedSeconds: number;
  openBbtiEntry: () => void;
  openBbtiCompare: () => void;
  openBbtiResult: (code: string) => void;
  startBbti: (mode: BbtiMode) => void;
  submitBbti: (code: string, answers: BbtiAnswer[]) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be inside GameProvider");
  return ctx;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>({
    phase: "landing",
    matchupId: null,
    side: null,
    currentRound: 0,
    votes: [],
    kobeScore: 0,
    lebronScore: 0,
    gameStartTime: null,
    elapsedSeconds: 0,
    quizCode: null,
    bbtiMode: "quick",
    bbtiCode: null,
    bbtiAnswers: [],
    bbtiChallengeCase: null,
  });

  const { main: debates, bonus: bonusDebates } = useMemo(
    () => getDebatesForMatchup(state.matchupId),
    [state.matchupId],
  );
  const allTopics = useMemo(() => [...debates, ...bonusDebates], [debates, bonusDebates]);

  const startGame = useCallback(() => {
    setState((s) => ({ ...s, phase: "matchup-select", bbtiChallengeCase: null }));
  }, []);

  const startQuiz = useCallback(() => {
    setState((s) => ({ ...s, phase: "quiz", bbtiChallengeCase: null }));
  }, []);

  const submitQuiz = useCallback((code: string) => {
    setState((s) => ({ ...s, quizCode: code, phase: "quiz-result", bbtiChallengeCase: null }));
  }, []);

  const selectMatchup = useCallback((id: string, caseContext?: BbtiChallengeCaseContext | null) => {
    if (id === "custom") {
      setState((s) => ({ ...s, phase: "custom-select", bbtiChallengeCase: null }));
      return;
    }
    setState((s) => ({
      ...s,
      matchupId: id,
      side: null,
      currentRound: 0,
      votes: [],
      kobeScore: 0,
      lebronScore: 0,
      gameStartTime: null,
      elapsedSeconds: 0,
      bbtiChallengeCase: caseContext?.challengeMatchupId === id ? caseContext : null,
      phase: "pick",
    }));
  }, []);

  const selectCustomMatchup = useCallback((playerAId: string, playerBId: string) => {
    const id = buildCustomMatchupId(playerAId, playerBId);
    setState((s) => ({
      ...s,
      matchupId: id,
      side: null,
      currentRound: 0,
      votes: [],
      kobeScore: 0,
      lebronScore: 0,
      gameStartTime: null,
      elapsedSeconds: 0,
      bbtiChallengeCase: null,
      phase: "pick",
    }));
  }, []);

  const pickSide = useCallback((side: Side) => {
    setState((s) => ({
      ...s,
      side,
      phase: "battle",
      currentRound: 0,
      gameStartTime: Date.now(),
      elapsedSeconds: 0,
    }));
  }, []);

  const vote = useCallback((winner: Side) => {
    setState((s) => {
      const { main: d, bonus: bd } = getDebatesForMatchup(s.matchupId);
      const topic = s.phase === "bonus"
        ? bd[s.currentRound - d.length]
        : d[s.currentRound];
      return {
        ...s,
        votes: [...s.votes, { topicId: topic.id, winner }],
        kobeScore: s.kobeScore + (winner === "kobe" ? 1 : 0),
        lebronScore: s.lebronScore + (winner === "lebron" ? 1 : 0),
      };
    });
  }, []);

  const nextRound = useCallback(() => {
    setState((s) => {
      const { main: d, bonus: bd } = getDebatesForMatchup(s.matchupId);
      const all = [...d, ...bd];
      const next = s.currentRound + 1;
      if (s.phase === "battle" && next >= d.length) {
        return {
          ...s,
          phase: bd.length > 0 ? "bonus-intro" : "result" as Phase,
          elapsedSeconds: bd.length > 0 || !s.gameStartTime
            ? s.elapsedSeconds
            : Math.round((Date.now() - s.gameStartTime) / 1000),
        };
      }
      if (s.phase === "bonus" && next >= all.length) {
        return {
          ...s,
          phase: "result",
          elapsedSeconds: s.gameStartTime
            ? Math.round((Date.now() - s.gameStartTime) / 1000)
            : s.elapsedSeconds,
        };
      }
      return { ...s, currentRound: next };
    });
  }, []);

  const startBonus = useCallback(() => {
    setState((s) => {
      const { main: d } = getDebatesForMatchup(s.matchupId);
      return { ...s, phase: "bonus", currentRound: d.length };
    });
  }, []);

  const skipToResult = useCallback(() => {
    setState((s) => ({
      ...s,
      phase: "result",
      elapsedSeconds: s.gameStartTime
        ? Math.round((Date.now() - s.gameStartTime) / 1000)
        : s.elapsedSeconds,
    }));
  }, []);

  const backToMatchupSelect = useCallback(() => {
    setState((s) => ({
      ...s,
      phase: "matchup-select",
      side: null,
      currentRound: 0,
      votes: [],
      kobeScore: 0,
      lebronScore: 0,
      gameStartTime: null,
      elapsedSeconds: 0,
      bbtiChallengeCase: null,
    }));
  }, []);

  const restart = useCallback(() => {
    setState({
      phase: "landing",
      matchupId: null,
      side: null,
      currentRound: 0,
      votes: [],
      kobeScore: 0,
      lebronScore: 0,
      gameStartTime: null,
      elapsedSeconds: 0,
      quizCode: null,
      bbtiMode: "quick",
      bbtiCode: null,
      bbtiAnswers: [],
      bbtiChallengeCase: null,
    });
  }, []);

  const openBbtiEntry = useCallback(() => {
    setState((s) => ({ ...s, phase: "bbti-entry", bbtiChallengeCase: null }));
  }, []);

  const openBbtiCompare = useCallback(() => {
    setState((s) => ({ ...s, phase: "bbti-compare", bbtiChallengeCase: null }));
  }, []);

  const openBbtiResult = useCallback((code: string) => {
    setState((s) => ({
      ...s,
      bbtiCode: code,
      bbtiAnswers: [],
      bbtiChallengeCase: null,
      phase: "bbti-result",
    }));
  }, []);

  const startBbti = useCallback((mode: BbtiMode) => {
    setState((s) => ({ ...s, bbtiMode: mode, phase: "bbti-quiz", bbtiChallengeCase: null }));
  }, []);

  const submitBbti = useCallback((code: string, answers: BbtiAnswer[]) => {
    setState((s) => ({ ...s, bbtiCode: code, bbtiAnswers: answers, phase: "bbti-result", bbtiChallengeCase: null }));
  }, []);

  const currentTopic = useMemo(() => {
    if (state.phase === "battle") return debates[state.currentRound] ?? null;
    if (state.phase === "bonus") return allTopics[state.currentRound] ?? null;
    return null;
  }, [state.phase, state.currentRound, debates, allTopics]);

  const isBonus = state.phase === "bonus";
  const totalRounds = state.phase === "bonus" ? allTopics.length : debates.length;

  const currentMatchup = useMemo(
    () => (state.matchupId ? getMatchupById(state.matchupId) ?? null : null),
    [state.matchupId],
  );

  return (
    <GameContext.Provider
      value={{
        ...state,
        pickSide,
        vote,
        nextRound,
        restart,
        currentTopic,
        totalRounds,
        mainRounds: debates.length,
        isBonus,
        startGame,
        startQuiz,
        submitQuiz,
        selectMatchup,
        selectCustomMatchup,
        currentMatchup,
        startBonus,
        skipToResult,
        backToMatchupSelect,
        openBbtiEntry,
        openBbtiCompare,
        openBbtiResult,
        startBbti,
        submitBbti,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
