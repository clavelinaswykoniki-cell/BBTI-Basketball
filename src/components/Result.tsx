"use client";

import { useGame } from "./GameProvider";
import { debates } from "@/data/debates";
import { getPersona, getRoast } from "@/data/personas";

export default function Result() {
  const { kobeScore, lebronScore, votes, side, restart, totalRounds } = useGame();

  const winner = kobeScore > lebronScore ? "kobe" : lebronScore > kobeScore ? "lebron" : "tie";
  const persona = side ? getPersona(side, votes, totalRounds) : null;
  const roast = side ? getRoast(side, votes) : "";
  const loyalty = side
    ? Math.round((votes.filter((v) => v.winner === side).length / totalRounds) * 100)
    : 0;

  const getTitle = () => {
    if (winner === "tie") return "平局！两位都是传奇";
    if (winner === "kobe") return "科比胜出！曼巴永不落幕";
    return "詹姆斯胜出！King 就是 King";
  };

  const shareText = persona
    ? `我是「${persona.title}」${persona.emoji}\n科比 ${kobeScore} : ${lebronScore} 詹姆斯\n忠诚度 ${loyalty}%\n"${roast}"\n来 GOAT Debate 测测你是什么球迷 🏀`
    : `科比 ${kobeScore} : ${lebronScore} 詹姆斯\n来 GOAT Debate 投票 🏀`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "GOAT Debate", text: shareText, url: window.location.href });
    } else {
      navigator.clipboard.writeText(shareText + "\n" + window.location.href);
      alert("已复制到剪贴板！分享给你的球友看看");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10">
      {/* Score */}
      <div className="text-center mb-6" style={{ animation: "fade-up 0.5s ease-out" }}>
        <div className="flex items-center justify-center gap-4 sm:gap-8 mb-4">
          <div className="text-center">
            <div className={`text-5xl sm:text-7xl font-black ${winner === "kobe" ? "text-kobe-gold" : "text-white/40"}`}>
              {kobeScore}
            </div>
            <div className="text-sm text-white/50 mt-1">科比</div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white/20">:</div>
          <div className="text-center">
            <div className={`text-5xl sm:text-7xl font-black ${winner === "lebron" ? "text-lebron-gold" : "text-white/40"}`}>
              {lebronScore}
            </div>
            <div className="text-sm text-white/50 mt-1">詹姆斯</div>
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white mb-1">{getTitle()}</h2>
      </div>

      {/* Persona card */}
      {persona && (
        <div
          className="w-full max-w-lg rounded-2xl border-2 border-white/20 bg-white/5 p-6 sm:p-8 mb-6 text-center"
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
            <p className="text-xs text-white/40 mb-1">忠诚度 {loyalty}% · {side === "kobe" ? "科蜜" : "詹蜜"}</p>
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

      {/* Vote breakdown */}
      <div className="w-full max-w-2xl mb-8" style={{ animation: "fade-up 1.1s ease-out" }}>
        <h3 className="text-lg font-bold text-white/70 mb-4 text-center">逐轮回顾</h3>
        <div className="space-y-2">
          {votes.map((v) => {
            const topic = debates.find((d) => d.id === v.topicId)!;
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
                  {v.winner === "kobe" ? "#24 科比" : "#23 詹姆斯"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4" style={{ animation: "fade-up 1.3s ease-out" }}>
        <button
          onClick={handleShare}
          className="px-8 py-3 bg-gradient-to-r from-kobe-purple to-lebron-wine text-white font-bold rounded-full
            hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          分享人格 + 结果 📤
        </button>
        <button
          onClick={restart}
          className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full
            transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
        >
          再来一局 🔄
        </button>
      </div>

      <p className="mt-10 text-xs text-white/20 text-center max-w-sm">
        以上毒舌纯属娱乐，两位都是篮球传奇。Respect the game. 🏀
      </p>
    </div>
  );
}
