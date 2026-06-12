"use client";

import type { DebateSide } from "@/data/debates";

type LegacySide = "kobe" | "lebron";

interface DebateSideCardProps {
  side: LegacySide;
  playerNumber: string;
  playerName: string;
  content: DebateSide;
  voted: LegacySide | null;
  onChoose: (side: LegacySide) => void;
}

const SIDE_STYLES: Record<LegacySide, {
  border: string;
  selected: string;
  dimmed: string;
  idle: string;
  text: string;
  focus: string;
  flash: string;
  animation: string;
}> = {
  kobe: {
    border: "border-kobe-gold/20",
    selected: "border-kobe-gold bg-kobe-purple/30 scale-[1.02]",
    dimmed: "border-white/10 bg-white/5 opacity-60",
    idle: "border-kobe-gold/20 bg-kobe-purple/10 hover:border-kobe-gold/60 hover:bg-kobe-purple/20",
    text: "text-kobe-gold",
    focus: "focus-visible:ring-kobe-gold/80",
    flash: "vote-flash-kobe",
    animation: "card-enter 0.5s ease-out",
  },
  lebron: {
    border: "border-lebron-gold/20",
    selected: "border-lebron-gold bg-lebron-wine/30 scale-[1.02]",
    dimmed: "border-white/10 bg-white/5 opacity-60",
    idle: "border-lebron-gold/20 bg-lebron-wine/10 hover:border-lebron-gold/60 hover:bg-lebron-wine/20",
    text: "text-lebron-gold",
    focus: "focus-visible:ring-lebron-gold/80",
    flash: "vote-flash-lebron",
    animation: "card-enter-right 0.5s ease-out 0.1s both",
  },
};

export default function DebateSideCard({
  side,
  playerNumber,
  playerName,
  content,
  voted,
  onChoose,
}: DebateSideCardProps) {
  const styles = SIDE_STYLES[side];
  const isSelected = voted === side;
  const isDimmed = voted !== null && !isSelected;
  const stateClass = isSelected
    ? `${styles.selected} ${styles.flash}`
    : isDimmed
      ? styles.dimmed
      : styles.idle;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={voted ? `已选择${playerName}。按下进入下一题。` : `选择${playerName}`}
      className={`rounded-2xl p-5 sm:p-6 border-2 transition-all duration-300 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 ${styles.focus} ${styles.border} ${stateClass}`}
      onClick={() => onChoose(side)}
      style={{ animation: styles.animation }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className={`${styles.text} font-black text-lg`}>{playerNumber}</span>
        <span className="text-white font-bold text-sm sm:text-base">{playerName}说：</span>
        {isSelected && (
          <span className={`ml-auto ${styles.text} text-sm font-bold`}>✓ 你的选择</span>
        )}
      </div>

      <p className="text-white/90 font-semibold mb-4 text-sm sm:text-base leading-relaxed">
        {content.claim}
      </p>

      <ul className="space-y-2 mb-4">
        {content.points.map((point, index) => (
          <li key={index} className="flex gap-2 text-white/70 text-xs sm:text-sm leading-relaxed">
            <span className={`${styles.text} mt-0.5 shrink-0`}>•</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <div className={`border-t ${side === "kobe" ? "border-kobe-gold/20" : "border-lebron-gold/20"} pt-3 mt-auto`}>
        <p className={`${styles.text} font-bold text-xs sm:text-sm italic`}>
          &ldquo;{content.punchline}&rdquo;
        </p>
      </div>
    </button>
  );
}
