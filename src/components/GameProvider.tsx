"use client";

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import type { DebateTopic } from "@/data/debates";
import { getMatchupById, type Matchup } from "@/data/matchups";
import { getDebatesForMatchup, buildCustomMatchupId } from "@/data/debate-loader";
import type { BbtiAnswer } from "@/data/bbti";

type Side = "kobe" | "lebron";
type BbtiMode = "quick" | "full";

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
  | "bbti-result";

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
  quizCode: string | null;
  bbtiMode: BbtiMode;
  bbtiCode: string | null;
  bbtiAnswers: BbtiAnswer[];
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
  selectMatchup: (id: string) => void;
  selectCustomMatchup: (playerAId: string, playerBId: string) => void;
  currentMatchup: Matchup | null;
  startBonus: () => void;
  skipToResult: () => void;
  backToMatchupSelect: () => void;
  elapsedSeconds: number;
  openBbtiEntry: () => void;
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
    quizCode: null,
    bbtiMode: "quick",
    bbtiCode: null,
    bbtiAnswers: [],
  });

  const { main: debates, bonus: bonusDebates } = useMemo(
    () => getDebatesForMatchup(state.matchupId),
    [state.matchupId],
  );
  const allTopics = useMemo(() => [...debates, ...bonusDebates], [debates, bonusDebates]);

  const startGame = useCallback(() => {
    setState((s) => ({ ...s, phase: "matchup-select" }));
  }, []);

  const startQuiz = useCallback(() => {
    setState((s) => ({ ...s, phase: "quiz" }));
  }, []);

  const submitQuiz = useCallback((code: string) => {
    setState((s) => ({ ...s, quizCode: code, phase: "quiz-result" }));
  }, []);

  const selectMatchup = useCallback((id: string) => {
    if (id === "custom") {
      setState((s) => ({ ...s, phase: "custom-select" }));
      return;
    }
    setState((s) => ({ ...s, matchupId: id, phase: "pick" }));
  }, []);

  const selectCustomMatchup = useCallback((playerAId: string, playerBId: string) => {
    const id = buildCustomMatchupId(playerAId, playerBId);
    setState((s) => ({ ...s, matchupId: id, phase: "pick" }));
  }, []);

  const pickSide = useCallback((side: Side) => {
    setState((s) => ({ ...s, side, phase: "battle", currentRound: 0, gameStartTime: Date.now() }));
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
        return { ...s, phase: bd.length > 0 ? "bonus-intro" : "result" as Phase };
      }
      if (s.phase === "bonus" && next >= all.length) {
        return { ...s, phase: "result" };
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
    setState((s) => ({ ...s, phase: "result" }));
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
      quizCode: null,
      bbtiMode: "quick",
      bbtiCode: null,
      bbtiAnswers: [],
    });
  }, []);

  const openBbtiEntry = useCallback(() => {
    setState((s) => ({ ...s, phase: "bbti-entry" }));
  }, []);

  const startBbti = useCallback((mode: BbtiMode) => {
    setState((s) => ({ ...s, bbtiMode: mode, phase: "bbti-quiz" }));
  }, []);

  const submitBbti = useCallback((code: string, answers: BbtiAnswer[]) => {
    setState((s) => ({ ...s, bbtiCode: code, bbtiAnswers: answers, phase: "bbti-result" }));
  }, []);

  const currentTopic = useMemo(() => {
    if (state.phase === "battle") return debates[state.currentRound] ?? null;
    if (state.phase === "bonus") return allTopics[state.currentRound] ?? null;
    return null;
  }, [state.phase, state.currentRound, debates, allTopics]);

  const isBonus = state.phase === "bonus";
  const totalRounds = state.phase === "bonus" ? allTopics.length : debates.length;
  const elapsedSeconds = state.gameStartTime ? Math.round((Date.now() - state.gameStartTime) / 1000) : 0;

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
        elapsedSeconds,
        openBbtiEntry,
        startBbti,
        submitBbti,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
