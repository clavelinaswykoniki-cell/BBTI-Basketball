"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { debates, type DebateTopic } from "@/data/debates";

type Side = "kobe" | "lebron";

interface Vote {
  topicId: string;
  winner: Side;
}

interface GameState {
  phase: "landing" | "pick" | "battle" | "result";
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
  startGame: () => void;
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
    setState((s) => ({
      ...s,
      votes: [...s.votes, { topicId: debates[s.currentRound].id, winner }],
      kobeScore: s.kobeScore + (winner === "kobe" ? 1 : 0),
      lebronScore: s.lebronScore + (winner === "lebron" ? 1 : 0),
    }));
  }, []);

  const nextRound = useCallback(() => {
    setState((s) => {
      const next = s.currentRound + 1;
      if (next >= debates.length) {
        return { ...s, phase: "result" };
      }
      return { ...s, currentRound: next };
    });
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

  const currentTopic =
    state.phase === "battle" ? debates[state.currentRound] : null;

  return (
    <GameContext.Provider
      value={{
        ...state,
        pickSide,
        vote,
        nextRound,
        restart,
        currentTopic,
        totalRounds: debates.length,
        startGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
