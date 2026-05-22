"use client";

import { useGame } from "./GameProvider";
import { debates } from "@/data/debates";

export default function Result() {
  const { kobeScore, lebronScore, votes, side, restart, totalRounds } = useGame();

  const winner = kobeScore > lebronScore ? "kobe" : lebronScore > kobeScore ? "lebron" : "tie";
  const votedForOwn =
    side && votes.filter((v) => v.winner === side).length;
  const loyalty = side
    ? Math.round(((votedForOwn || 0) / totalRounds) * 100)
    : 0;

  const getTitle = () => {
    if (winner === "tie") return "平局！两位都是传奇";
    if (winner === "kobe") return "科比胜出！曼巴永不落幕";
    return "詹姆斯胜出！King 就是 King";
  };

  const getVerdict = () => {
    if (winner === "tie") return "你心中科比和詹姆斯同样伟大——这本身就是最好的答案。";
    if (winner === side) {
      if (loyalty >= 80) return `你是铁杆${side === "kobe" ? "科蜜" : "詹蜜"}——${loyalty}% 的轮次都站了自己人。坚定！`;
      return `虽然站了${side === "kobe" ? "科比" : "詹姆斯"}，但你也承认了对面的实力。理性球迷！`;
    }
    return `你选了${side === "kobe" ? "科比" : "詹姆斯"}，但投票给了对面更多——你是真正尊重事实的球迷。`;
  };

  const shareText = `科比 ${kobeScore} : ${lebronScore} 詹姆斯\n我是${side === "kobe" ? "科蜜" : "詹蜜"}，忠诚度 ${loyalty}%\n来 GOAT Debate 投票决定谁更强 🏀`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "GOAT Debate", text: shareText, url: window.location.href });
    } else {
      navigator.clipboard.writeText(shareText + "\n" + window.location.href);
      alert("已复制到剪贴板！");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      {/* Final score */}
      <div className="text-center mb-8" style={{ animation: "fade-up 0.6s ease-out" }}>
        <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6">
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

        <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
          {getTitle()}
        </h2>
        <p className="text-white/60 max-w-md mx-auto mb-2">
          {getVerdict()}
        </p>
      </div>

      {/* Vote breakdown */}
      <div className="w-full max-w-2xl mb-8" style={{ animation: "fade-up 0.8s ease-out" }}>
        <h3 className="text-lg font-bold text-white/70 mb-4 text-center">逐轮回顾</h3>
        <div className="space-y-2">
          {votes.map((v, i) => {
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
      <div className="flex flex-col sm:flex-row gap-4" style={{ animation: "fade-up 1s ease-out" }}>
        <button
          onClick={handleShare}
          className="px-8 py-3 bg-gradient-to-r from-kobe-purple to-lebron-wine text-white font-bold rounded-full
            hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          分享结果 📤
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
        两位都是篮球历史上最伟大的球员之一。
        辩论是为了乐趣，不是为了分出高下。
        Respect the game. 🏀
      </p>
    </div>
  );
}
