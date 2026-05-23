"use client";

import { useEffect, useState } from "react";

type Side = "kobe" | "lebron";

interface Vote {
  topicId: string;
  winner: Side;
}

interface PersonalityProfile {
  type: string;
  emoji: string;
  traits: string[];
  decisionStyle: string;
  inRelationship: string;
  atWork: string;
  spiritAnimal: string;
}

interface JudgeResult {
  verdict: string;
  analysis: string;
  confidence: number;
  prescription: string;
  challenge: string;
  fanFiction: string;
  personality: PersonalityProfile;
}

interface AiJudgeProps {
  votes: Vote[];
  side: Side;
  kobeScore: number;
  lebronScore: number;
}

export default function AiJudge({ votes, side, kobeScore, lebronScore }: AiJudgeProps) {
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/judge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ votes, side, kobeScore, lebronScore }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("judge failed");
        return res.json();
      })
      .then((data: JudgeResult) => {
        if (!cancelled) {
          setResult(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [votes, side, kobeScore, lebronScore]);

  const toggle = (key: string) => {
    setExpandedSection((prev) => (prev === key ? null : key));
  };

  const accentColor = side === "kobe" ? "text-kobe-gold" : "text-lebron-gold";
  const accentBorder = side === "kobe" ? "border-kobe-gold/20" : "border-lebron-gold/20";
  const borderGlow =
    side === "kobe"
      ? "border-kobe-gold/30 shadow-[0_0_20px_rgba(253,185,39,0.15)]"
      : "border-lebron-gold/30 shadow-[0_0_20px_rgba(253,187,48,0.15)]";

  if (loading) {
    return (
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 text-center"
        style={{ animation: "fade-up 0.5s ease-out" }}
      >
        <div className="text-4xl mb-3 animate-bounce">🤖</div>
        <h3 className="text-lg font-bold text-white/70 mb-2">AI 裁判 审理中...</h3>
        <div className="flex justify-center gap-1">
          <span className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-white/40 animate-pulse [animation-delay:0.2s]" />
          <span className="w-2 h-2 rounded-full bg-white/40 animate-pulse [animation-delay:0.4s]" />
        </div>
        <p className="text-xs text-white/30 mt-3">正在扫描你的投票DNA、分析人格、编写判决书...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div
        className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-red-900/10 p-6 sm:p-8 text-center"
        style={{ animation: "fade-up 0.5s ease-out" }}
      >
        <div className="text-3xl mb-2">&#x26A0;&#xFE0F;</div>
        <p className="text-white/60 text-sm">AI 裁判暂时罢工了，可能是被你的投票气到了。</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg space-y-4">
      {/* ── Main Verdict Card ── */}
      <div
        className={`rounded-2xl border-2 ${borderGlow} bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 sm:p-8`}
        style={{ animation: "fade-up 0.7s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-3xl">🤖</span>
          <h3 className={`text-xl sm:text-2xl font-black ${accentColor}`}>AI 裁判</h3>
        </div>

        {/* Confidence bar */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs text-white/40 shrink-0">确信度</span>
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                result.confidence >= 80
                  ? "bg-gradient-to-r from-green-500 to-emerald-400"
                  : result.confidence >= 60
                    ? "bg-gradient-to-r from-yellow-500 to-amber-400"
                    : "bg-gradient-to-r from-red-500 to-orange-400"
              }`}
              style={{ width: `${result.confidence}%` }}
            />
          </div>
          <span className="text-xs font-mono text-white/50 shrink-0">{result.confidence}%</span>
        </div>

        {/* Verdict */}
        <div className="bg-white/5 rounded-xl p-4 sm:p-5 mb-4 border border-white/5">
          <div className="text-xs text-white/30 font-bold tracking-widest mb-2 uppercase">
            判决
          </div>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed font-medium">
            {result.verdict}
          </p>
        </div>

        {/* Analysis */}
        <div className="bg-white/5 rounded-xl p-4 sm:p-5 border border-white/5">
          <div className="text-xs text-white/30 font-bold tracking-widest mb-2 uppercase">
            分析报告
          </div>
          <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
            {result.analysis}
          </p>
        </div>
      </div>

      {/* ── Personality Profile Card ── */}
      <div
        className={`rounded-2xl border ${accentBorder} bg-gradient-to-b from-purple-900/20 to-indigo-900/10 p-6 sm:p-8`}
        style={{ animation: "fade-up 0.9s ease-out" }}
      >
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">{result.personality.emoji}</div>
          <h4 className="text-lg sm:text-xl font-black text-white mb-1">
            球迷性格报告
          </h4>
          <p className={`text-sm sm:text-base font-black ${accentColor}`}>
            {result.personality.type}
          </p>
        </div>

        {/* Traits */}
        <div className="flex flex-wrap gap-2 justify-center mb-5">
          {result.personality.traits.map((trait, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-white/70 border border-white/5"
            >
              {trait}
            </span>
          ))}
        </div>

        {/* Expandable sections */}
        <div className="space-y-2">
          <ExpandBlock
            label="🧠 决策风格"
            content={result.personality.decisionStyle}
            isOpen={expandedSection === "decision"}
            onToggle={() => toggle("decision")}
          />
          <ExpandBlock
            label="💕 恋爱中的你"
            content={result.personality.inRelationship}
            isOpen={expandedSection === "relationship"}
            onToggle={() => toggle("relationship")}
          />
          <ExpandBlock
            label="💼 职场中的你"
            content={result.personality.atWork}
            isOpen={expandedSection === "work"}
            onToggle={() => toggle("work")}
          />
          <ExpandBlock
            label="🐾 灵魂动物"
            content={result.personality.spiritAnimal}
            isOpen={expandedSection === "animal"}
            onToggle={() => toggle("animal")}
          />
        </div>
      </div>

      {/* ── Prescription Card ── */}
      <div
        className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-900/15 to-teal-900/10 p-5 sm:p-6"
        style={{ animation: "fade-up 1.1s ease-out" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">💊</span>
          <h4 className="text-sm font-black text-emerald-400 tracking-wider uppercase">AI 处方笺</h4>
        </div>
        <p className="text-white/80 text-sm leading-relaxed">
          {result.prescription}
        </p>
      </div>

      {/* ── Challenge Card ── */}
      <div
        className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-900/15 to-orange-900/10 p-5 sm:p-6"
        style={{ animation: "fade-up 1.3s ease-out" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">&#x2753;</span>
          <h4 className="text-sm font-black text-amber-400 tracking-wider uppercase">灵魂拷问</h4>
        </div>
        <p className="text-white/80 text-sm leading-relaxed italic">
          {result.challenge}
        </p>
      </div>

      {/* ── Fan Fiction Card ── */}
      <div
        className="rounded-2xl border border-pink-500/20 bg-gradient-to-b from-pink-900/15 to-rose-900/10 p-5 sm:p-6"
        style={{ animation: "fade-up 1.5s ease-out" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">&#x1F30C;</span>
          <h4 className="text-sm font-black text-pink-400 tracking-wider uppercase">平行宇宙</h4>
        </div>
        <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
          {result.fanFiction}
        </p>
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] text-white/20 pt-2">
        * 以上判决、处方、性格分析均由 AI 在 0.003 秒内生成，不代表任何篮球权威机构或心理学权威立场
      </p>
    </div>
  );
}

// ── Expandable block sub-component ────────────────────────────────────

function ExpandBlock({
  label,
  content,
  isOpen,
  onToggle,
}: {
  label: string;
  content: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/5 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-white/5 transition-colors"
      >
        <span className="text-sm text-white/70 font-medium">{label}</span>
        <span
          className="text-white/30 text-xs transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4" style={{ animation: "fade-up 0.3s ease-out" }}>
          <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
            {content}
          </p>
        </div>
      )}
    </div>
  );
}
