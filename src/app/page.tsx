"use client";

import { GameProvider, useGame } from "@/components/GameProvider";
import Landing from "@/components/Landing";
import PickSide from "@/components/PickSide";
import BattleArena from "@/components/BattleArena";
import Result from "@/components/Result";

function GameRouter() {
  const { phase } = useGame();
  switch (phase) {
    case "landing":
      return <Landing />;
    case "pick":
      return <PickSide />;
    case "battle":
      return <BattleArena />;
    case "result":
      return <Result />;
  }
}

export default function Home() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}
