"use client";

import { useState, useEffect, useMemo } from "react";
import { getBbtiType, bbtiQuestions, type BbtiAnswer, type PoleKey } from "../data/bbti";

// ── Dimension config (single source of truth) ───────────────────────────
const DIMENSIONS = [
  {
    pos: 0,
    letters: ["O", "D"] as const,
    labels: ["进攻", "防守"],
    colors: ["bg-orange-500", "bg-blue-500"],
    textColors: ["text-orange-400", "text-blue-400"],
    barColor: ["from-orange-500 to-orange-400", "from-blue-500 to-blue-400"],
    key: "OD",
  },
  {
    pos: 1,
    letters: ["A", "E"] as const,
    labels: ["数据", "情怀"],
    colors: ["bg-green-500", "bg-pink-500"],
    textColors: ["text-green-400", "text-pink-400"],
    barColor: ["from-green-500 to-green-400", "from-pink-500 to-pink-400"],
    key: "AE",
  },
  {
    pos: 2,
    letters: ["I", "T"] as const,
    labels: ["个人", "团队"],
    colors: ["bg-purple-500", "bg-teal-500"],
    textColors: ["text-purple-400", "text-teal-400"],
    barColor: ["from-purple-500 to-purple-400", "from-teal-500 to-teal-400"],
    key: "IT",
  },
  {
    pos: 3,
    letters: ["L", "R"] as const,
    labels: ["忠诚", "冠军"],
    colors: ["bg-yellow-500", "bg-gray-400"],
    textColors: ["text-yellow-400", "text-gray-400"],
    barColor: ["from-yellow-500 to-yellow-400", "from-gray-400 to-gray-300"],
    key: "LR",
  },
] as const;

// ── Confetti (reused from Result.tsx) ────────────────────────────────────
const CONFETTI_COLORS = ["#FDB927", "#552583", "#860038", "#FDBB30", "#ffffff", "#FFD700"];
const CONFETTI_PIECES = Array.from({ length: 28 }, (_, i) => ({
  left: `${3 + (i * 3.4) % 94}%`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: `${(i * 0.12) % 2}s`,
  duration: `${2.5 + (i % 4) * 0.5}s`,
}));

// ── Helpers ──────────────────────────────────────────────────────────────

/** Compute per-dimension percentage from answers by replaying the scoring logic. Falls back to 75/25. */
function computeDimensionPercents(code: string, answers: BbtiAnswer[]): number[] {
  if (!answers || answers.length === 0) return [50, 50, 50, 50];

  // Replay scores exactly like computeBbtiCode
  const scores: Record<PoleKey, number> = { O: 0, D: 0, A: 0, E: 0, I: 0, T: 0, L: 0, R: 0 };

  for (const answer of answers) {
    const question = bbtiQuestions.find((q) => q.id === answer.questionId);
    if (!question || question.type === "open") continue;

    if (question.type === "binary" && answer.selected) {
      if (answer.selected === "A" && question.optionA) {
        scores[question.optionA.pole] += 2;
      } else if (answer.selected === "B" && question.optionB) {
        scores[question.optionB.pole] += 2;
      }
    }

    if (question.type === "multi" && answer.selectedIndices && question.options) {
      for (const idx of answer.selectedIndices) {
        const option = question.options[idx];
        if (!option) continue;
        for (const [pole, value] of Object.entries(option.scores)) {
          scores[pole as PoleKey] += value;
        }
      }
    }
  }

  // Compute percentage for the chosen letter on each dimension
  const letters = code.split("") as PoleKey[];
  const axes: [PoleKey, PoleKey][] = [["O", "D"], ["A", "E"], ["I", "T"], ["L", "R"]];

  return axes.map((axis, i) => {
    const total = scores[axis[0]] + scores[axis[1]];
    if (total === 0) return 75;
    const chosen = letters[i];
    const chosenScore = scores[chosen] ?? 0;
    return Math.round((chosenScore / total) * 100);
  });
}

// ── Component ───────────────────────────────────────────────────────────

interface BbtiResultProps {
  code: string;
  answers: BbtiAnswer[];
  onRestart: () => void;
  onSwitchToDebate: () => void;
}

export default function BbtiResult({ code, answers, onRestart, onSwitchToDebate }: BbtiResultProps) {
  const type = useMemo(() => getBbtiType(code), [code]);

  // Resolve compatibility and nemesis types
  const compatType = useMemo(
    () => (type ? getBbtiType(type.compatibility) : null),
    [type],
  );
  const nemesisType = useMemo(
    () => (type ? getBbtiType(type.nemesis) : null),
    [type],
  );

  const percents = useMemo(() => computeDimensionPercents(code, answers), [code, answers]);

  // Confetti
  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Share copied feedback
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  // Bail out if type not found
  if (!type) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-white/60 mb-4">未找到类型：{code}</p>
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-white/10 text-white rounded-full cursor-pointer hover:bg-white/20 transition-colors"
        >
          重新测试
        </button>
      </div>
    );
  }

  const letters = code.split("");

  const shareText = `BBTI测了我是【${code}】${type.emoji} ${type.name}，谁懂啊，被算法掌握了\n"${type.tagline}"\n灵魂球员对线：${type.spiritPlayer}\n\n发到主队群被骂了，但是是真的——来测你的篮球人格 🏀`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "我的 BBTI 篮球人格", text: shareText, url: window.location.href });
    } else {
      navigator.clipboard.writeText(shareText + "\n" + window.location.href).then(
        () => {
          setCopied(true);
          setCopyFailed(false);
          setTimeout(() => setCopied(false), 2000);
        },
        () => {
          setCopied(false);
          setCopyFailed(true);
          setTimeout(() => setCopyFailed(false), 2000);
        },
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 relative overflow-hidden">
      {/* ── Confetti ── */}
      {showConfetti && (
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

      {/* ════════════════════════════════════════════════════════════════
          HERO CARD — the shareable screenshot
         ════════════════════════════════════════════════════════════════ */}
      <div
        className="w-full max-w-lg rounded-2xl glass p-6 sm:p-8 mb-6"
        style={{ animation: "fade-up 0.5s ease-out" }}
      >
        {/* Code letter boxes */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
          {letters.map((letter, i) => {
            const dim = DIMENSIONS[i];
            const isFirst = letter === dim.letters[0];
            const bgColor = isFirst ? dim.colors[0] : dim.colors[1];
            return (
              <div
                key={i}
                className={`${bgColor} w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center`}
                style={{
                  animation: "fade-up 0.4s ease-out",
                  animationDelay: `${i * 0.15}s`,
                  animationFillMode: "both",
                }}
              >
                <span className="text-5xl sm:text-7xl font-black text-white drop-shadow-lg">
                  {letter}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dimension labels */}
        <div className="flex items-center justify-center gap-1 text-white/50 text-xs sm:text-sm mb-5">
          {letters.map((letter, i) => {
            const dim = DIMENSIONS[i];
            const isFirst = letter === dim.letters[0];
            const label = isFirst ? dim.labels[0] : dim.labels[1];
            return (
              <span key={i}>
                {i > 0 && <span className="mx-1">·</span>}
                {label}
              </span>
            );
          })}
        </div>

        {/* Type name + emoji */}
        <div
          className="text-center"
          style={{
            animation: "fade-up 0.5s ease-out",
            animationDelay: "0.6s",
            animationFillMode: "both",
          }}
        >
          <div className="text-5xl mb-2">{type.emoji}</div>
          <h1 className="text-3xl sm:text-4xl font-black text-white text-glow mb-2">
            {type.name}
          </h1>
          <p className="text-white/60 text-sm sm:text-base max-w-sm mx-auto">
            {type.tagline}
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DIMENSION BREAKDOWN — 4 horizontal bars
         ════════════════════════════════════════════════════════════════ */}
      <div
        className="w-full max-w-lg rounded-2xl glass p-5 sm:p-6 mb-6"
        style={{
          animation: "fade-up 0.5s ease-out",
          animationDelay: "0.8s",
          animationFillMode: "both",
        }}
      >
        <h3 className="text-xs text-white/30 uppercase tracking-widest mb-4 text-center">
          你的四维坐标
        </h3>
        <div className="space-y-4">
          {DIMENSIONS.map((dim, i) => {
            const letter = letters[i];
            const isFirst = letter === dim.letters[0];
            const pct = percents[i];
            return (
              <div key={dim.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-bold ${
                      isFirst ? dim.textColors[0] : "text-white/30"
                    }`}
                  >
                    {dim.labels[0]}
                  </span>
                  <span
                    className={`font-bold ${
                      !isFirst ? dim.textColors[1] : "text-white/30"
                    }`}
                  >
                    {dim.labels[1]}
                  </span>
                </div>
                <div className="relative h-3 rounded-full bg-white/10 overflow-hidden">
                  {/* Fill bar: pct is how much the user leans toward their chosen letter */}
                  {isFirst ? (
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${dim.barColor[0]} transition-all duration-700 ease-out`}
                      style={{ width: `${pct}%` }}
                    />
                  ) : (
                    <div
                      className={`absolute inset-y-0 right-0 rounded-full bg-gradient-to-l ${dim.barColor[1]} transition-all duration-700 ease-out`}
                      style={{ width: `${pct}%` }}
                    />
                  )}
                  {/* Dot marker: position from left. If first letter chosen, marker at pct% from left.
                      If second letter chosen, marker at (100-pct)% from left (i.e. toward the right). */}
                  <div
                    className="absolute top-1/2 w-3 h-3 rounded-full bg-white border-2 border-white/80 shadow-lg z-10 transition-all duration-700"
                    style={{
                      left: isFirst ? `${pct}%` : `${100 - pct}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-white/40">
                  {/* Left label = first letter %, Right label = second letter % */}
                  <span>{isFirst ? `${pct}%` : `${100 - pct}%`}</span>
                  <span>{isFirst ? `${100 - pct}%` : `${pct}%`}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          PERSONALITY DESCRIPTION
         ════════════════════════════════════════════════════════════════ */}
      <div
        className="w-full max-w-lg rounded-2xl glass p-5 sm:p-6 mb-6"
        style={{
          animation: "fade-up 0.5s ease-out",
          animationDelay: "1.0s",
          animationFillMode: "both",
        }}
      >
        {/* Description */}
        <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-5">
          {type.description}
        </p>

        {/* Spirit Player */}
        <div className="rounded-xl bg-gradient-to-r from-kobe-purple/20 to-lebron-wine/20 border border-white/10 p-4 mb-5">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-1">灵魂球员</p>
          <p className="text-xl font-black text-kobe-gold mb-1">{type.spiritPlayer}</p>
          <p className="text-white/60 text-xs sm:text-sm leading-relaxed">{type.spiritPlayerWhy}</p>
        </div>

        {/* Strengths */}
        <div className="mb-4">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-2">优势</p>
          <div className="space-y-1.5">
            {type.strengths.map((s: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-sm text-white/80">
                <span className="shrink-0 mt-0.5">{"✅"}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-2">弱点</p>
          <div className="space-y-1.5">
            {type.weaknesses.map((w: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-sm text-white/80">
                <span className="shrink-0 mt-0.5">{"😅"}</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          SOCIAL — compatibility & nemesis
         ════════════════════════════════════════════════════════════════ */}
      <div
        className="w-full max-w-lg grid grid-cols-2 gap-3 mb-6"
        style={{
          animation: "fade-up 0.5s ease-out",
          animationDelay: "1.2s",
          animationFillMode: "both",
        }}
      >
        {/* Best buddy */}
        <div className="rounded-xl glass p-4 text-center">
          <p className="text-xs text-white/40 mb-1">最佳球友</p>
          <p className="text-lg font-black text-green-400 mb-0.5">
            {compatType ? compatType.emoji : ""} {compatType?.name ?? type.compatibility}
          </p>
          <p className="text-[11px] text-white/30 font-mono">{type.compatibility}</p>
        </div>

        {/* Nemesis */}
        <div className="rounded-xl glass p-4 text-center">
          <p className="text-xs text-white/40 mb-1">死对头</p>
          <p className="text-lg font-black text-red-400 mb-0.5">
            {nemesisType ? nemesisType.emoji : ""} {nemesisType?.name ?? type.nemesis}
          </p>
          <p className="text-[11px] text-white/30 font-mono">{type.nemesis}</p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          SHARE SECTION
         ════════════════════════════════════════════════════════════════ */}
      <div
        className="w-full max-w-lg flex flex-col items-center mb-6"
        style={{
          animation: "fade-up 0.5s ease-out",
          animationDelay: "1.4s",
          animationFillMode: "both",
        }}
      >
        <button
          onClick={handleShare}
          className="w-full px-8 py-4 min-h-[48px] bg-gradient-to-r from-kobe-purple to-lebron-wine text-white text-lg font-bold rounded-full
            hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          style={{ animation: "pulse-glow 2.5s ease-in-out infinite" }}
        >
          {copyFailed ? "复制失败，请手动复制" : copied ? "已复制到剪贴板！" : "分享你的 BBTI"}
        </button>
        <p className="text-white/30 text-xs mt-2">发给朋友测一测</p>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          ACTION BUTTONS
         ════════════════════════════════════════════════════════════════ */}
      <div
        className="flex gap-3 w-full max-w-lg"
        style={{
          animation: "fade-up 0.5s ease-out",
          animationDelay: "1.6s",
          animationFillMode: "both",
        }}
      >
        <button
          onClick={onRestart}
          className="flex-1 px-6 py-3 min-h-[48px] bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 font-bold rounded-full
            transition-all duration-200 cursor-pointer"
        >
          重新测试
        </button>
        <button
          onClick={onSwitchToDebate}
          className="flex-1 px-6 py-3 min-h-[48px] bg-gradient-to-r from-kobe-gold/80 to-lebron-gold/80 text-black font-bold rounded-full
            hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          试试辩论模式
        </button>
      </div>

      <p className="mt-10 text-xs text-white/20 text-center max-w-sm">
        BBTI 篮球人格类型 — 纯属娱乐，每个球迷都是独一无二的。
      </p>
    </div>
  );
}
