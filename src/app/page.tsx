"use client";

import { useEffect, useRef } from "react";
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
import BbtiCompare from "@/components/BbtiCompare";
import { parseBbtiCompareDeepLink, parseBbtiDeepLink } from "@/lib/bbti-deep-links";
import { parseDebateDeepLink } from "@/lib/debate-deep-links";

function GameRouter() {
  const {
    phase,
    bbtiMode,
    bbtiCode,
    bbtiAnswers,
    submitBbti,
    restart,
    openBbtiEntry,
    openBbtiCompare,
    openBbtiResult,
    startGame,
    selectMatchup,
  } = useGame();
  const bootstrappedDeepLink = useRef(false);

  useEffect(() => {
    if (bootstrappedDeepLink.current) return;
    bootstrappedDeepLink.current = true;

    const deepLink = parseBbtiDeepLink(window.location.search);
    if (deepLink.code) {
      openBbtiResult(deepLink.code);
      return;
    }

    const compareDeepLink = parseBbtiCompareDeepLink(window.location.search);
    if (compareDeepLink.hasCompareParams) {
      openBbtiCompare();
      return;
    }

    const debateDeepLink = parseDebateDeepLink(window.location.search);
    if (debateDeepLink.matchupId) {
      selectMatchup(debateDeepLink.matchupId);
    }
  }, [openBbtiCompare, openBbtiResult, selectMatchup]);

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
          onCompare={openBbtiCompare}
          onChallengeMatchup={selectMatchup}
          onSwitchToDebate={() => { restart(); startGame(); }}
        />
      );
    case "bbti-compare":
      return <BbtiCompare onBack={openBbtiEntry} onRetake={() => { restart(); openBbtiEntry(); }} />;
  }
}

export default function Home() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}
