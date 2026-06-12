"use client";

import {
  buildBbtiChallengeReplaySeedsCopy,
  type BbtiChallengeReplaySeeds,
} from "@/data/bbti-challenge-replay-seeds";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiChallengeReplaySeedsProps {
  className?: string;
  compact?: boolean;
  seeds: BbtiChallengeReplaySeeds;
  showCopyAction?: boolean;
}

export default function BbtiChallengeReplaySeeds({
  className = "",
  compact = false,
  seeds,
  showCopyAction = true,
}: BbtiChallengeReplaySeedsProps) {
  const copyFeedback = useGuardedClipboard<"seeds">();
  const copyText = buildBbtiChallengeReplaySeedsCopy(seeds);
  const copied = copyFeedback.isCopied("seeds");
  const failed = copyFeedback.isFailed("seeds");
  const showManualCopy = copyFeedback.feedback.manualCopyText === copyText;

  return (
    <section
      data-testid="bbti-challenge-replay-seeds"
      data-bbti-challenge-replay-seeds-version={seeds.version}
      data-bbti-challenge-replay-seeds-source={seeds.source}
      data-bbti-challenge-replay-seeds-case-source={seeds.caseSource}
      data-bbti-challenge-replay-seeds-code={seeds.code}
      data-bbti-challenge-replay-seeds-matchup={seeds.challengeMatchupId}
      data-bbti-challenge-replay-seeds-count={seeds.rowCount}
      className={`${compact ? "rounded-xl p-3" : "rounded-2xl p-4"} border border-kobe-gold/16 bg-kobe-gold/[0.055] ${className}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-kobe-gold/70">
            Replay Seeds
          </p>
          <h3 className={`${compact ? "text-sm" : "text-base"} mt-0.5 font-black text-white`}>
            开庭种子 · {seeds.challengeTitle}
          </h3>
        </div>
        {showCopyAction && (
          <button
            type="button"
            data-testid="bbti-challenge-replay-seeds-copy"
            data-bbti-challenge-replay-seeds-action="copy-seeds"
            onClick={() => copyFeedback.copyText(copyText, "seeds")}
            className="min-h-[36px] shrink-0 rounded-full border border-white/10 bg-black/18 px-3 py-2 text-[11px] font-black text-white/58 transition-colors hover:border-kobe-gold/35 hover:text-kobe-gold"
          >
            {failed ? "复制失败" : copied ? "已复制" : "复制种子"}
          </button>
        )}
      </div>

      <div className={`${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"} grid gap-2`}>
        {seeds.rows.map((row, index) => (
          <article
            key={row.id}
            data-testid="bbti-challenge-replay-seed-row"
            data-bbti-challenge-replay-seed={row.id}
            data-bbti-challenge-replay-seed-target={row.target}
            data-bbti-challenge-replay-seed-position={index + 1}
            className="min-h-[84px] rounded-lg border border-white/10 bg-black/18 px-3 py-2"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-[10px] font-black text-kobe-gold/72">
                {index + 1}. {row.label}
              </span>
              <span className="truncate text-[9px] font-black text-white/30">
                {row.meta}
              </span>
            </div>
            <p className="text-xs font-black leading-snug text-white/78">{row.title}</p>
            <p className="mt-1 line-clamp-3 text-[11px] font-bold leading-relaxed text-white/48">
              {row.body}
            </p>
          </article>
        ))}
      </div>

      <p
        data-testid="bbti-challenge-replay-seeds-boundary"
        className="mt-2 text-[10px] font-bold leading-relaxed text-white/34"
      >
        {seeds.boundary}
      </p>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copied ? "已复制开庭种子" : failed ? "开庭种子自动复制失败，可手动复制" : ""}
      </p>
      {showManualCopy && (
        <BbtiManualCopyFallback
          text={copyFeedback.feedback.manualCopyText}
          title="自动复制失败，长按下方开庭种子复制。"
          className="mt-3"
        />
      )}
    </section>
  );
}
