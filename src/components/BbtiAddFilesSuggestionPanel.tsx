"use client";

import { useMemo } from "react";
import {
  BBTI_ADD_FILES_CONTRACT_VERSION,
  buildBbtiAddFilesSuggestionCopy,
  resolveBbtiAddFilesSuggestions,
  type BbtiAddFilesSuggestion,
  type BbtiAddFilesSuggestionTone,
} from "@/data/bbti-add-files-suggestions";
import { scrollToSection } from "@/lib/scroll-to-section";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiAddFilesSuggestionPanelProps {
  code: string;
  typeName: string;
  hasFilmRoomClips: boolean;
  hasPendingCompare: boolean;
  primaryChallengeTitle?: string | null;
}

const TONE_CLASS: Record<BbtiAddFilesSuggestionTone, {
  badge: string;
  button: string;
  card: string;
}> = {
  gold: {
    badge: "border-kobe-gold/30 bg-kobe-gold/10 text-kobe-gold",
    button: "bg-gradient-to-r from-kobe-gold to-lebron-gold text-black",
    card: "border-kobe-gold/24 bg-kobe-gold/[0.07]",
  },
  purple: {
    badge: "border-kobe-purple/40 bg-kobe-purple/20 text-white/72",
    button: "bg-white/[0.08] text-white",
    card: "border-kobe-purple/30 bg-kobe-purple/[0.10]",
  },
  blue: {
    badge: "border-sky-300/25 bg-sky-300/[0.08] text-sky-100/72",
    button: "bg-sky-200 text-black",
    card: "border-sky-300/18 bg-sky-300/[0.055]",
  },
  wine: {
    badge: "border-lebron-gold/25 bg-lebron-wine/18 text-lebron-gold/78",
    button: "bg-gradient-to-r from-lebron-gold to-kobe-gold text-black",
    card: "border-lebron-gold/20 bg-lebron-wine/[0.12]",
  },
};

function targetFilesForQa(suggestion: BbtiAddFilesSuggestion): string {
  return suggestion.targetFiles.join("|");
}

export default function BbtiAddFilesSuggestionPanel({
  code,
  typeName,
  hasFilmRoomClips,
  hasPendingCompare,
  primaryChallengeTitle,
}: BbtiAddFilesSuggestionPanelProps) {
  const clipboard = useGuardedClipboard<string>();
  const suggestions = useMemo(() => resolveBbtiAddFilesSuggestions({
    code,
    hasFilmRoomClips,
    hasPendingCompare,
    primaryChallengeTitle,
  }), [code, hasFilmRoomClips, hasPendingCompare, primaryChallengeTitle]);

  if (!suggestions.length) return null;

  const copySuggestion = (suggestion: BbtiAddFilesSuggestion, copyText: string) => {
    clipboard.copyText(copyText, suggestion.id);
  };

  return (
    <section
      data-testid="bbti-add-files-suggestion-panel"
      data-bbti-add-files-version={BBTI_ADD_FILES_CONTRACT_VERSION}
      data-bbti-add-files-count={suggestions.length}
      data-bbti-add-files-code={code}
      data-bbti-add-files-next-count={suggestions.filter((suggestion) => suggestion.stage === "next").length}
      className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5 mb-6"
      style={{
        animation: "fade-up 0.5s ease-out",
        animationDelay: "0.78s",
        animationFillMode: "both",
      }}
      aria-labelledby="bbti-add-files-suggestion-title"
    >
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-kobe-gold/72">
            Coach Queue
          </p>
          <h2 id="bbti-add-files-suggestion-title" className="mt-1 text-lg font-black text-white">
            下次加练板
          </h2>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-black/18 px-2.5 py-1 text-[10px] font-black text-white/38">
          {suggestions.length} plays
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {suggestions.map((suggestion, index) => {
          const tone = TONE_CLASS[suggestion.tone];
          const copied = clipboard.isCopied(suggestion.id);
          const failed = clipboard.isFailed(suggestion.id);
          const copyText = buildBbtiAddFilesSuggestionCopy({
            code,
            suggestion,
            typeName,
          });
          const showManualCopy = clipboard.feedback.manualCopyText === copyText;

          return (
            <article
              key={suggestion.id}
              data-testid="bbti-add-files-suggestion-card"
              data-bbti-add-files-id={suggestion.id}
              data-bbti-add-files-qa={suggestion.qaKey}
              data-bbti-add-files-position={index + 1}
              data-bbti-add-files-stage={suggestion.stage}
              data-bbti-add-files-target={suggestion.targetSectionId}
              data-bbti-add-files-files={targetFilesForQa(suggestion)}
              className={`rounded-xl border ${tone.card} p-3`}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${tone.badge}`}>
                    {suggestion.tag}
                  </span>
                  <span
                    data-testid="bbti-add-files-suggestion-stage"
                    data-bbti-add-files-stage-label={suggestion.stage}
                    className="ml-1.5 inline-flex rounded-full border border-white/10 bg-black/18 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white/38"
                  >
                    {suggestion.stage === "shipped" ? "SHIPPED" : "NEXT"}
                  </span>
                  <h3 className="mt-2 text-sm font-black leading-snug text-white">
                    {suggestion.title}
                  </h3>
                </div>
                <span className="shrink-0 text-[10px] font-black text-white/30">
                  #{index + 1}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-white/58">
                {suggestion.body}
              </p>
              <p className="mt-2 rounded-lg border border-white/10 bg-black/18 px-2.5 py-2 text-[11px] leading-relaxed text-white/45">
                过线：{suggestion.acceptance}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  data-testid="bbti-add-files-suggestion-cta"
                  data-bbti-scroll-target={suggestion.targetSectionId}
                  onClick={() => scrollToSection(suggestion.targetSectionId)}
                  className={`min-h-[36px] rounded-full px-3 py-2 text-[11px] font-black transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${tone.button}`}
                >
                  {suggestion.ctaLabel}
                </button>
                <button
                  type="button"
                  data-testid="bbti-add-files-copy"
                  data-bbti-add-files-copy-id={suggestion.id}
                  onClick={() => copySuggestion(suggestion, copyText)}
                  className="min-h-[36px] rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-[11px] font-black text-white/50 transition-colors hover:text-white/75 cursor-pointer"
                >
                  {failed ? "复制失败" : copied ? "已复制" : "复制加练单"}
                </button>
              </div>

              {showManualCopy && (
                <BbtiManualCopyFallback
                  text={copyText}
                  title="自动复制失败，长按下方加练单复制。"
                  className="mt-3"
                  tone="neutral"
                />
              )}
            </article>
          );
        })}
      </div>

    </section>
  );
}
