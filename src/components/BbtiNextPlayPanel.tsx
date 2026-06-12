"use client";

import type {
  BbtiNextPlayAction,
  BbtiNextPlayActionId,
  BbtiNextPlayTone,
} from "@/data/bbti-next-play";

interface BbtiNextPlayPanelProps {
  actions: BbtiNextPlayAction[];
  onAction: (actionId: BbtiNextPlayActionId) => void;
  onSecondaryAction?: (actionId: BbtiNextPlayActionId) => void;
}

const TONE_STYLES: Record<BbtiNextPlayTone, {
  badge: string;
  button: string;
  card: string;
}> = {
  gold: {
    badge: "border-kobe-gold/25 bg-kobe-gold/10 text-kobe-gold/80",
    button: "bg-gradient-to-r from-kobe-gold to-lebron-gold text-black",
    card: "border-kobe-gold/25 bg-kobe-gold/[0.08]",
  },
  blue: {
    badge: "border-blue-300/25 bg-blue-300/[0.08] text-blue-100/72",
    button: "bg-blue-200 text-black",
    card: "border-blue-300/18 bg-blue-300/[0.055]",
  },
  wine: {
    badge: "border-lebron-gold/25 bg-lebron-wine/18 text-lebron-gold/78",
    button: "bg-gradient-to-r from-lebron-gold to-kobe-gold text-black",
    card: "border-lebron-gold/20 bg-lebron-wine/[0.12]",
  },
  purple: {
    badge: "border-kobe-purple/35 bg-kobe-purple/18 text-white/72",
    button: "bg-white/[0.08] text-white",
    card: "border-kobe-purple/30 bg-kobe-purple/[0.12]",
  },
};

export default function BbtiNextPlayPanel({
  actions,
  onAction,
  onSecondaryAction,
}: BbtiNextPlayPanelProps) {
  if (!actions.length) return null;

  const playCountLabel = `${actions.length} ${actions.length === 1 ? "play" : "plays"}`;

  return (
    <section
      data-testid="bbti-next-play-panel"
      data-next-play-count={actions.length}
      className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5 mb-6"
      style={{
        animation: "fade-up 0.5s ease-out",
        animationDelay: "0.74s",
        animationFillMode: "both",
      }}
      aria-labelledby="bbti-next-play-title"
    >
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-kobe-gold/72">
            Next Play
          </p>
          <h2 id="bbti-next-play-title" className="mt-1 text-lg font-black text-white">
            下一回合先打哪一球
          </h2>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-black/18 px-2.5 py-1 text-[10px] font-black text-white/38">
          {playCountLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {actions.map((action, index) => {
          const tone = TONE_STYLES[action.tone];
          const isPrimary = index === 0;

          return (
            <article
              key={action.id}
              data-next-play-id={action.id}
              data-next-play-qa={action.qaKey}
              data-next-play-mobile-layout={isPrimary ? "primary" : "compact"}
              data-next-play-position={index + 1}
              className={`flex rounded-xl border ${tone.card} ${
                isPrimary
                  ? "min-h-[176px] flex-col p-3"
                  : "min-h-[64px] flex-row items-center gap-3 p-2.5 sm:min-h-[176px] sm:flex-col sm:items-stretch sm:gap-0 sm:p-3"
              }`}
            >
              <span className={`w-fit shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                isPrimary ? "mb-2" : "mb-0 sm:mb-2"
              } ${tone.badge}`}>
                {action.eyebrow}
              </span>
              <div className={isPrimary ? "contents" : "min-w-0 flex-1 sm:contents"}>
                <h3 className={`text-sm font-black leading-snug text-white ${
                  isPrimary ? "" : "truncate sm:whitespace-normal"
                }`}>
                  {action.title}
                </h3>
                <p className={`mt-1 flex-1 text-[11px] leading-relaxed text-white/52 ${
                  isPrimary ? "" : "hidden sm:block"
                }`}>
                  {action.body}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onAction(action.id)}
                className={`shrink-0 rounded-full px-3 py-2 text-[11px] font-black transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                  isPrimary
                    ? "mt-3 min-h-[38px]"
                    : "min-h-[36px] sm:mt-3 sm:min-h-[38px]"
                } ${tone.button}`}
              >
                {action.buttonLabel}
              </button>
              {action.secondaryButtonLabel && onSecondaryAction && (
                <button
                  type="button"
                  onClick={() => onSecondaryAction(action.id)}
                  className={`mt-1 min-h-[34px] rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-black text-white/45 transition-colors hover:border-white/25 hover:text-white/72 cursor-pointer ${
                    isPrimary ? "" : "hidden sm:block"
                  }`}
                >
                  {action.secondaryButtonLabel}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
