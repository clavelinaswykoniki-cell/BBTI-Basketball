"use client";

import type { BbtiAnswerReveal as BbtiAnswerRevealData } from "@/data/bbti-answer-reveals";

interface BbtiAnswerRevealProps {
  reveal: BbtiAnswerRevealData | null;
  compact?: boolean;
}

export default function BbtiAnswerReveal({ reveal, compact = false }: BbtiAnswerRevealProps) {
  if (!reveal) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-40 mx-auto max-w-xl rounded-2xl border border-kobe-gold/30 bg-black/88 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      style={{
        animation: "fade-up 0.22s ease-out",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-kobe-gold/75">
            Coach Timeout
          </p>
          <h3 className="mt-1 text-sm sm:text-base font-black text-white leading-snug">
            {reveal.title}
          </h3>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-[10px] font-black text-white/45">
          {reveal.tag}
        </span>
      </div>

      <p className="text-xs sm:text-sm text-white/68 leading-relaxed">
        {reveal.summary}
      </p>

      {reveal.poll && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/36">
              模拟看台风向
            </p>
            <p className="shrink-0 text-[10px] font-bold text-white/32">{reveal.poll.detail}</p>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-kobe-gold to-lebron-gold"
              style={{ width: `${reveal.poll.selectedPercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-[10px] font-black">
            <span className="min-w-0 truncate text-kobe-gold/80">
              {reveal.poll.selectedLabel} 约 {reveal.poll.selectedPercent}%
            </span>
            <span className="min-w-0 truncate text-white/42">
              约 {reveal.poll.dissentPercent}% {reveal.poll.dissentLabel}
            </span>
          </div>
          {!compact && (
            <p className="mt-2 text-[11px] leading-relaxed text-white/56">
              {reveal.poll.callout}
            </p>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1">
        {reveal.poles.map((item) => (
          <span
            key={item.pole}
            className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] font-black text-white/58"
          >
            +{item.points} {item.label}
          </span>
        ))}
      </div>

      {!compact && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="rounded-lg bg-kobe-gold/8 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-kobe-gold/70 mb-1">
              战术收益
            </p>
            <p className="text-[11px] text-white/62 leading-relaxed">{reveal.tacticalNote}</p>
          </div>
          <div className="rounded-lg bg-lebron-wine/18 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-lebron-gold/70 mb-1">
              盲点提醒
            </p>
            <p className="text-[11px] text-white/62 leading-relaxed">{reveal.blindSpot}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
