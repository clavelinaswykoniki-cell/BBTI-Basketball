"use client";

import { useMemo, useState, useEffect } from "react";
import { useGame } from "./GameProvider";
import { getDebatesForMatchup } from "@/data/debate-loader";
import { getPersona, getRoast } from "@/data/personas";
import { generatePersonalityReport } from "@/data/personality-analysis";
import AiJudge from "./AiJudge";
import PersonalityReportCard from "./PersonalityReport";

const CONFETTI_COLORS = ["#FDB927", "#552583", "#860038", "#FDBB30", "#ffffff", "#FFD700"];
const CONFETTI_PIECES = Array.from({ length: 28 }, (_, i) => ({
  left: `${3 + (i * 3.4) % 94}%`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: `${(i * 0.12) % 2}s`,
  duration: `${2.5 + (i % 4) * 0.5}s`,
}));

export default function Result() {
  const { kobeScore, lebronScore, votes, side, restart, backToMatchupSelect, totalRounds, elapsedSeconds, matchupId, currentMatchup } = useGame();
  const pA = currentMatchup?.playerA;
  const pB = currentMatchup?.playerB;
  const nameA = pA?.nameZh ?? "科比";
  const nameB = pB?.nameZh ?? "詹姆斯";

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
  const personalityReport = useMemo(
    () => side ? generatePersonalityReport(side, votes, elapsedSeconds, matchupId ?? undefined) : null,
    [side, votes, elapsedSeconds, matchupId],
  );

  const getTitle = () => {
    if (winner === "tie") return "平局！两位都是传奇";
    if (winner === "kobe") return `${nameA}胜出！`;
    return `${nameB}胜出！`;
  };

  const shareText = persona
    ? `我玩牢大vs满膏蟹辩论，被定性为【${persona.title}】${persona.emoji}\n${nameA} ${kobeScore} : ${lebronScore} ${nameB}\n忠诚度 ${loyalty}%，AI直接给我开了处方\n"${roast}"\n谁懂啊，发到主队群被骂了，但是是真的 🏀`
    : `${nameA} ${kobeScore} : ${lebronScore} ${nameB}\n来辩一辩谁是山羊，别只在键盘上当GM 🏀`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "GOAT Debate", text: shareText, url: window.location.href });
    } else {
      navigator.clipboard.writeText(shareText + "\n" + window.location.href).then(
        () => alert("已复制到剪贴板！发给你的球友，看谁先破防"),
        () => alert("复制失败，请手动复制"),
      );
    }
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
        <h3 className="text-lg font-bold text-white/70 mb-4 text-center">逐轮回顾</h3>
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
                  {v.winner === "kobe" ? `${pA?.number ?? "#24"} ${nameA}` : `${pB?.number ?? "#23"} ${nameB}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 items-center w-full max-w-md" style={{ animation: "fade-up 1.7s ease-out" }}>
        <button
          onClick={handleShare}
          className="w-full px-8 py-4 min-h-[48px] bg-gradient-to-r from-kobe-purple to-lebron-wine text-white text-lg font-bold rounded-full
            hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          style={{ animation: "pulse-glow 2.5s ease-in-out infinite" }}
        >
          📤 分享到微信 / Twitter
        </button>
        <div className="flex gap-3 w-full">
          <button
            onClick={backToMatchupSelect}
            className="flex-1 px-6 py-3 min-h-[48px] bg-gradient-to-r from-kobe-gold/80 to-lebron-gold/80 text-black font-bold rounded-full
              hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            换个对决 →
          </button>
          <button
            onClick={restart}
            className="flex-1 px-6 py-3 min-h-[48px] bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 font-bold rounded-full
              transition-all duration-200 cursor-pointer"
          >
            再来一遍 🔄
          </button>
        </div>
      </div>

      <p className="mt-10 text-xs text-white/20 text-center max-w-sm">
        以上毒舌纯属娱乐，两位都是篮球传奇。Respect the game. 🏀
      </p>
    </div>
  );
}
