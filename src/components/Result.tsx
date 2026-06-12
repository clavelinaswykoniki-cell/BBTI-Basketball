"use client";

import { useMemo, useState, useEffect } from "react";
import { useGame } from "./GameProvider";
import { getDebatesForMatchup } from "@/data/debate-loader";
import { getPersona, getRoast } from "@/data/personas";
import { generatePersonalityReport } from "@/data/personality-analysis";
import { getMatchupMemePack } from "@/data/matchup-memes";
import { buildDebateMatchupUrl } from "@/lib/debate-deep-links";
import { getMatchupSlots } from "@/lib/matchupSlots";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import AiJudge from "./AiJudge";
import BbtiCasePostgame from "./BbtiCasePostgame";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";
import PersonalityReportCard from "./PersonalityReport";
import MyTeamResultCard from "./MyTeamResultCard";

const CONFETTI_COLORS = ["#FDB927", "#552583", "#860038", "#FDBB30", "#ffffff", "#FFD700"];
const CONFETTI_PIECES = Array.from({ length: 28 }, (_, i) => ({
  left: `${3 + (i * 3.4) % 94}%`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: `${(i * 0.12) % 2}s`,
  duration: `${2.5 + (i % 4) * 0.5}s`,
}));

function compactReplayUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

export default function Result() {
  const {
    kobeScore,
    lebronScore,
    votes,
    side,
    restart,
    backToMatchupSelect,
    totalRounds,
    elapsedSeconds,
    matchupId,
    currentMatchup,
    bbtiChallengeCase,
    openBbtiResult,
  } = useGame();
  const slots = getMatchupSlots(matchupId, currentMatchup);
  const pA = slots.kobe;
  const pB = slots.lebron;
  const nameA = pA.nameZh;
  const nameB = pB.nameZh;

  const { main: debates, bonus: bonusDebates } = useMemo(
    () => getDebatesForMatchup(matchupId),
    [matchupId],
  );

  const winner = kobeScore > lebronScore ? "kobe" : lebronScore > kobeScore ? "lebron" : "tie";
  const persona = side ? getPersona(side, votes, totalRounds, elapsedSeconds) : null;
  const roast = side ? getRoast(side, votes) : "";
  const loyalty = side && votes.length > 0
    ? Math.round((votes.filter((v) => v.winner === side).length / votes.length) * 100)
    : 0;
  const sideName = side === "kobe" ? nameA : nameB;
  const opponentName = side === "kobe" ? nameB : nameA;
  const sideNumber = side === "kobe" ? pA.number : pB.number;
  const scoreFor = side === "kobe" ? kobeScore : lebronScore;
  const scoreAgainst = side === "kobe" ? lebronScore : kobeScore;
  const personalityReport = useMemo(
    () => side ? generatePersonalityReport(side, votes, elapsedSeconds, matchupId ?? undefined) : null,
    [side, votes, elapsedSeconds, matchupId],
  );
  const matchupPack = useMemo(
    () => getMatchupMemePack(matchupId, nameA, nameB),
    [matchupId, nameA, nameB],
  );
  const replayUrl = useMemo(
    () => buildDebateMatchupUrl(matchupId ?? "kobe-vs-lebron"),
    [matchupId],
  );
  const copyReplayFeedback = useGuardedClipboard<"replay">();
  const winnerLabel = winner === "tie" ? "平局待加赛" : winner === "kobe" ? `${nameA}胜出` : `${nameB}胜出`;

  const getTitle = () => {
    if (winner === "tie") return "平局！两位都是传奇";
    if (winner === "kobe") return `${nameA}胜出！`;
    return `${nameB}胜出！`;
  };

  const shareText = persona
    ? `我刚打完一场 ${nameA} vs ${nameB}，被测成【${persona.title}】${persona.emoji}\n比分：${nameA} ${kobeScore} : ${lebronScore} ${nameB}\n站队忠诚度：${loyalty}%\n"${roast}"\n群聊题：${matchupPack.groupChatPrompt}\n复盘入口：点开同一场，从选边开始重打 🏀`
    : `${nameA} ${kobeScore} : ${lebronScore} ${nameB}\n${matchupPack.groupChatPrompt}\n复盘入口：点开同一场，从选边开始重打 🏀`;
  const replayShareText = `${shareText}\n${replayUrl}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `${nameA} vs ${nameB} · 赛后战报`, text: shareText, url: replayUrl }).catch((error) => {
        if (error?.name !== "AbortError") {
          copyReplayFeedback.copyText(replayShareText, "replay");
        }
      });
      return;
    } else {
      copyReplayFeedback.copyText(replayShareText, "replay");
    }
  };

  const copyReplayLink = () => {
    copyReplayFeedback.copyText(replayShareText, "replay");
  };

  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 relative overflow-hidden">
      {/* Confetti celebration */}
      {showConfetti && winner !== "tie" && (
        <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
          {CONFETTI_PIECES.map((c, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: c.left,
                backgroundColor: c.color,
                animationDelay: c.delay,
                animationDuration: c.duration,
              }}
            />
          ))}
        </div>
      )}

      {/* Score */}
      <div className="text-center mb-6" style={{ animation: "fade-up 0.5s ease-out" }}>
        <div className="flex items-center justify-center gap-4 sm:gap-8 mb-4">
          <div className="text-center">
            <div className={`text-6xl sm:text-8xl font-black ${winner === "kobe" ? "text-kobe-gold score-glow" : "text-white/40"}`}>
              {kobeScore}
            </div>
            <div className="text-sm text-white/50 mt-1">{nameA}</div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white/20">:</div>
          <div className="text-center">
            <div className={`text-6xl sm:text-8xl font-black ${winner === "lebron" ? "text-lebron-gold score-glow" : "text-white/40"}`}>
              {lebronScore}
            </div>
            <div className="text-sm text-white/50 mt-1">{nameB}</div>
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white mb-1">{getTitle()}</h2>
      </div>

      {persona && side && (
        <MyTeamResultCard
          tier={loyalty >= 92 ? "darkMatter" : loyalty >= 84 ? "galaxyOpal" : "pinkDiamond"}
          overall={loyalty}
          code={sideNumber}
          title={persona.title}
          subtitle={persona.description}
          emoji={persona.emoji}
          edition="GOAT DEBATE"
          sideLabel={`${sideName}阵营 · ${scoreFor}:${scoreAgainst} · 对手 ${opponentName}`}
          attributes={[
            { key: "LOY", label: "忠诚", value: loyalty },
            { key: "IQ", label: "球商", value: 72 + scoreFor * 3 },
            { key: "RING", label: "冠军", value: 68 + scoreFor * 4 },
            { key: "FIRE", label: "火力", value: 74 + Math.abs(scoreFor - scoreAgainst) * 5 },
            { key: "DEF", label: "防守", value: 70 + Math.min(scoreAgainst, scoreFor) * 3 },
          ]}
          badges={[
            { label: persona.title, tone: "gold" },
            { label: `${nameA} vs ${nameB}`, tone: "purple" },
            { label: winner === "tie" ? "抢七待定" : winner === side ? "赢球方" : "逆风输出", tone: winner === side ? "blue" : "red" },
          ]}
          footerLeft={`站队 ${sideName}`}
          footerRight={`对手 ${opponentName}`}
          signature={roast || persona.description}
        />
      )}

      {/* Persona card */}
      {persona && (
        <div
          className="w-full max-w-lg rounded-2xl glass p-6 sm:p-8 mb-6 text-center"
          style={{ animation: "fade-up 0.7s ease-out" }}
        >
          <div className="text-5xl mb-3">{persona.emoji}</div>
          <h3 className={`text-2xl sm:text-3xl font-black mb-2 ${persona.color}`}>
            {persona.title}
          </h3>
          <p className="text-white/70 mb-4 text-sm sm:text-base">
            {persona.description}
          </p>
          <div className="border-t border-white/10 pt-4 mt-4">
            <p className="text-xs text-white/40 mb-1">忠诚度 {loyalty}% · {side === "kobe" ? `${nameA}粉` : `${nameB}粉`}</p>
          </div>
        </div>
      )}

      {/* Roast */}
      {roast && (
        <div
          className="w-full max-w-lg rounded-xl bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/20 p-5 mb-6 text-center"
          style={{ animation: "fade-up 0.9s ease-out" }}
        >
          <div className="text-sm text-red-400/80 font-bold mb-2">🔥 个性化毒舌</div>
          <p className="text-white/80 text-sm sm:text-base italic">
            &ldquo;{roast}&rdquo;
          </p>
        </div>
      )}

      <div
        className="w-full max-w-lg rounded-xl border border-yellow-400/20 bg-yellow-400/[0.06] p-5 mb-6"
        style={{ animation: "fade-up 0.95s ease-out" }}
      >
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="rounded-full bg-yellow-300 px-2.5 py-1 text-[10px] font-black text-black">
            {matchupPack.heat}
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-yellow-200/75">
            Group Chat Ammo
          </span>
        </div>
        <p className="text-sm sm:text-base font-bold text-white/84 leading-relaxed mb-2">
          {matchupPack.groupChatPrompt}
        </p>
        <p className="text-xs text-white/42 leading-relaxed">
          下次开庭禁句：{matchupPack.bannedPhrase}
        </p>
      </div>

      <div
        className="w-full max-w-lg rounded-xl border border-kobe-gold/20 bg-kobe-gold/[0.07] p-5 mb-6"
        style={{ animation: "fade-up 0.98s ease-out" }}
      >
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-kobe-gold/75">
              Replay Link
            </p>
            <h3 className="text-base font-black text-white">同场复盘链接</h3>
            <p className="mt-1 text-xs leading-relaxed text-white/52">
              好友点开会进入同一组 {nameA} vs {nameB}，从选边开始重新打 {totalRounds} 轮。
            </p>
          </div>
          <button
            type="button"
            onClick={copyReplayLink}
            className="min-h-[38px] shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black text-white/68 transition-colors hover:border-kobe-gold/40 hover:text-kobe-gold"
          >
            {copyReplayFeedback.isCopied("replay") ? "已复制" : copyReplayFeedback.isFailed("replay") ? "复制失败" : "复制同场复盘"}
          </button>
        </div>
        <div className="min-w-0 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
          <p className="break-all text-[11px] font-bold text-white/42">{compactReplayUrl(replayUrl)}</p>
        </div>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {copyReplayFeedback.isCopied("replay") ? "已复制同场复盘" : copyReplayFeedback.isFailed("replay") ? "同场复盘自动复制失败，可手动复制" : ""}
        </p>
        <BbtiManualCopyFallback
          text={copyReplayFeedback.feedback.manualCopyText}
          title="自动复制失败，长按下方同场复盘文案复制。"
          className="mt-3"
        />
      </div>

      <BbtiCasePostgame
        context={bbtiChallengeCase}
        playerAName={nameA}
        playerBName={nameB}
        kobeScore={kobeScore}
        lebronScore={lebronScore}
        selectedSideName={side ? sideName : undefined}
        winnerName={winnerLabel}
        replayUrl={replayUrl}
        onOpenBbtiResult={openBbtiResult}
      />

      {/* AI Judge */}
      {side && (
        <div className="w-full flex justify-center mb-6" style={{ animation: "fade-up 1.0s ease-out" }}>
          <AiJudge votes={votes} side={side} kobeScore={kobeScore} lebronScore={lebronScore} />
        </div>
      )}

      {/* Personality Report */}
      <div className="w-full flex flex-col items-center mb-8" style={{ animation: "fade-up 1.1s ease-out" }}>
        <h3 className="text-lg sm:text-xl font-bold text-white/70 mb-5 text-center">
          &#x1F9EC; 深度人格分析
        </h3>
        {personalityReport && <PersonalityReportCard report={personalityReport} />}
      </div>

      {/* Vote breakdown */}
      <div className="w-full max-w-2xl mb-8" style={{ animation: "fade-up 1.5s ease-out" }}>
        <h3 className="text-lg font-bold text-white/70 mb-4 text-center">本场投票回放</h3>
        <div className="space-y-2">
          {votes.map((v) => {
            const topic = debates.find((d) => d.id === v.topicId) ?? bonusDebates.find((d) => d.id === v.topicId);
            if (!topic) return null;
            return (
              <div
                key={v.topicId}
                className="flex items-center gap-3 py-2 px-4 rounded-lg bg-white/5"
              >
                <span className="text-lg">{topic.emoji}</span>
                <span className="text-white/80 text-sm flex-1">{topic.title}</span>
                <span
                  className={`text-sm font-bold ${v.winner === "kobe" ? "text-kobe-gold" : "text-lebron-gold"}`}
                >
                  {v.winner === "kobe" ? `${pA.number} ${nameA}` : `${pB.number} ${nameB}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 items-center w-full max-w-md" style={{ animation: "fade-up 1.7s ease-out" }}>
        <button
          type="button"
          onClick={handleShare}
          className="w-full px-8 py-4 min-h-[48px] bg-gradient-to-r from-kobe-purple to-lebron-wine text-white text-lg font-bold rounded-full
            hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          style={{ animation: "pulse-glow 2.5s ease-in-out infinite" }}
        >
          {copyReplayFeedback.isCopied("replay") ? "已复制赛后战报" : copyReplayFeedback.isFailed("replay") ? "复制失败，可手动复制" : "分享赛后战报"}
        </button>
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={backToMatchupSelect}
            className="flex-1 px-6 py-3 min-h-[48px] bg-gradient-to-r from-kobe-gold/80 to-lebron-gold/80 text-black font-bold rounded-full
              hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            换个对决 →
          </button>
          <button
            type="button"
            onClick={restart}
            className="flex-1 px-6 py-3 min-h-[48px] bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 font-bold rounded-full
              transition-all duration-200 cursor-pointer"
          >
            再来一遍 🔄
          </button>
        </div>
      </div>

      <p className="mt-10 text-xs text-white/20 text-center max-w-sm">
        以上内容纯属篮球讨论，两位都是传奇。Respect the game. 🏀
      </p>
    </div>
  );
}
