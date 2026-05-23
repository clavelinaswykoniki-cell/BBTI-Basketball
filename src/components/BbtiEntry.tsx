"use client";

import { useGame } from "./GameProvider";

export default function BbtiEntry() {
  const { startBbti, backToMatchupSelect } = useGame();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative">
      <button
        onClick={backToMatchupSelect}
        className="absolute top-6 left-6 text-white/40 hover:text-white text-sm transition-colors cursor-pointer"
      >
        &larr; 返回
      </button>

      <div className="text-center mb-12 fade-up">
        <div className="inline-block text-7xl sm:text-8xl font-black tracking-tighter mb-3 text-glow"
          style={{
            background: "linear-gradient(135deg, #FDB927 0%, #FDBB30 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          BBTI
        </div>
        <p className="text-white/60 text-base sm:text-lg mb-2">
          Basketball Brain Type Indicator
        </p>
        <p className="text-white/40 text-sm">
          16 种篮球人格类型 &middot; 你是哪一种？
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl">
        {/* Quick mode */}
        <button
          onClick={() => startBbti("quick")}
          className="group relative overflow-hidden rounded-2xl border-2 border-kobe-gold/30
            hover:border-kobe-gold transition-all duration-300 cursor-pointer
            hover:scale-[1.02] active:scale-[0.98] p-8 text-left min-h-[280px] flex flex-col"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-kobe-purple/30 via-transparent to-kobe-purple/10 group-hover:from-kobe-purple/50 transition-all" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="text-5xl mb-4">⚡</div>
            <div className="text-2xl sm:text-3xl font-black text-white mb-1">
              精简版
            </div>
            <div className="text-kobe-gold text-sm font-bold mb-4">
              30 题 &middot; 约 5 分钟
            </div>
            <p className="text-white/60 text-sm leading-relaxed flex-1">
              覆盖 4 大维度的核心题目，快速得出你的篮球人格类型。
              适合第一次玩或时间紧的朋友。
            </p>
            <div className="mt-6 text-kobe-gold text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              开始测试 &rarr;
            </div>
          </div>
        </button>

        {/* Full mode */}
        <button
          onClick={() => startBbti("full")}
          className="group relative overflow-hidden rounded-2xl border-2 border-lebron-gold/30
            hover:border-lebron-gold transition-all duration-300 cursor-pointer
            hover:scale-[1.02] active:scale-[0.98] p-8 text-left min-h-[280px] flex flex-col"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-lebron-wine/30 via-transparent to-lebron-wine/10 group-hover:from-lebron-wine/50 transition-all" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="text-5xl mb-4">🔬</div>
            <div className="text-2xl sm:text-3xl font-black text-white mb-1">
              完整版
            </div>
            <div className="text-lebron-gold text-sm font-bold mb-4">
              50 题 &middot; 约 10 分钟
            </div>
            <p className="text-white/60 text-sm leading-relaxed flex-1">
              更深度的灵魂拷问，准确度更高。
              最后还有一道开放题让你写下自己的篮球故事。
            </p>
            <div className="mt-6 text-lebron-gold text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              深度测试 &rarr;
            </div>
          </div>
        </button>
      </div>

      <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl w-full">
        {[
          { emoji: "⚔️", label: "进攻 vs 防守" },
          { emoji: "📊", label: "数据 vs 情怀" },
          { emoji: "🐺", label: "个人 vs 团队" },
          { emoji: "🏠", label: "忠诚 vs 冠军" },
        ].map((d) => (
          <div key={d.label} className="text-center">
            <div className="text-2xl mb-1">{d.emoji}</div>
            <div className="text-white/40 text-xs">{d.label}</div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-xs text-white/30 text-center max-w-md">
        每个选择都暴露你的真实篮球性格 &middot; 完成后可分享你的类型给朋友
      </p>
    </div>
  );
}
