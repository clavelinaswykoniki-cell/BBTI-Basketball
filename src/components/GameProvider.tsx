"use client";

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import { debates, bonusDebates, type DebateTopic } from "@/data/debates";

type Side = "kobe" | "lebron";

type Phase = "landing" | "pick" | "battle" | "bonus-intro" | "bonus" | "result";

interface Vote {
  topicId: string;
  winner: Side;
}

interface GameState {
  phase: Phase;
  side: Side | null;
  currentRound: number;
  votes: Vote[];
  kobeScore: number;
  lebronScore: number;
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
  startBonus: () => void;
  skipToResult: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be inside GameProvider");
  return ctx;
}

const allTopics = [...debates, ...bonusDebates];

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>({
    phase: "landing",
    side: null,
    currentRound: 0,
    votes: [],
    kobeScore: 0,
    lebronScore: 0,
  });

  const startGame = useCallback(() => {
    setState((s) => ({ ...s, phase: "pick" }));
  }, []);

  const pickSide = useCallback((side: Side) => {
    setState((s) => ({ ...s, side, phase: "battle", currentRound: 0 }));
  }, []);

  const vote = useCallback((winner: Side) => {
    setState((s) => {
      const topic = s.phase === "bonus"
        ? bonusDebates[s.currentRound - debates.length]
        : debates[s.currentRound];
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
      const next = s.currentRound + 1;
      if (s.phase === "battle" && next >= debates.length) {
        return { ...s, phase: "bonus-intro" };
      }
      if (s.phase === "bonus" && next >= allTopics.length) {
        return { ...s, phase: "result" };
      }
      return { ...s, currentRound: next };
    });
  }, []);

  const startBonus = useCallback(() => {
    setState((s) => ({ ...s, phase: "bonus", currentRound: debates.length }));
  }, []);

  const skipToResult = useCallback(() => {
    setState((s) => ({ ...s, phase: "result" }));
  }, []);

  const restart = useCallback(() => {
    setState({
      phase: "landing",
      side: null,
      currentRound: 0,
      votes: [],
      kobeScore: 0,
      lebronScore: 0,
    });
  }, []);

  const currentTopic = useMemo(() => {
    if (state.phase === "battle") return debates[state.currentRound] ?? null;
    if (state.phase === "bonus") return allTopics[state.currentRound] ?? null;
    return null;
  }, [state.phase, state.currentRound]);

  const isBonus = state.phase === "bonus";
  const totalRounds = state.phase === "bonus" ? allTopics.length : debates.length;

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
        startBonus,
        skipToResult,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
