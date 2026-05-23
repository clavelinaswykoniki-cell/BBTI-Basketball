"use client";

import { GameProvider, useGame } from "@/components/GameProvider";
import Landing from "@/components/Landing";
import MatchupSelect from "@/components/MatchupSelect";
import CustomMatchupSelect from "@/components/CustomMatchupSelect";
import PickSide from "@/components/PickSide";
import BattleArena from "@/components/BattleArena";
import BonusIntro from "@/components/BonusIntro";
import Result from "@/components/Result";
import BasketballQuiz from "@/components/BasketballQuiz";
import QuizResult from "@/components/QuizResult";
import BbtiEntry from "@/components/BbtiEntry";
import BbtiQuiz from "@/components/BbtiQuiz";
import BbtiResult from "@/components/BbtiResult";

function GameRouter() {
  const { phase, bbtiMode, bbtiCode, bbtiAnswers, submitBbti, restart, openBbtiEntry } = useGame();
  switch (phase) {
    case "landing":
      return <Landing />;
    case "matchup-select":
      return <MatchupSelect />;
    case "custom-select":
      return <CustomMatchupSelect />;
    case "pick":
      return <PickSide />;
    case "battle":
    case "bonus":
      return <BattleArena />;
    case "bonus-intro":
      return <BonusIntro />;
    case "result":
      return <Result />;
    case "quiz":
      return <BasketballQuiz />;
    case "quiz-result":
      return <QuizResult />;
    case "bbti-entry":
      return <BbtiEntry />;
    case "bbti-quiz":
      return (
        <BbtiQuiz
          mode={bbtiMode}
          onComplete={({ code, answers }) => submitBbti(code, answers)}
          onExit={openBbtiEntry}
        />
      );
    case "bbti-result":
      return (
        <BbtiResult
          code={bbtiCode ?? "OAIL"}
          answers={bbtiAnswers}
          onRestart={() => { restart(); openBbtiEntry(); }}
          onSwitchToDebate={restart}
        />
      );
  }
}

export default function Home() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}
