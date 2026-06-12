import type { ReplayStatBomb } from "@/data/stat-bombs";

export const BBTI_REPLAY_CENTER_VERSION = "bbti-replay-center-v1" as const;

interface ReplayCenterProps {
  bomb: ReplayStatBomb;
  matchupId?: string;
  nameA: string;
  nameB: string;
  roundNumber?: number;
  topicId?: string;
}

export default function ReplayCenter({
  bomb,
  matchupId = "unknown",
  nameA,
  nameB,
  roundNumber = 0,
  topicId = "unknown",
}: ReplayCenterProps) {
  const sideName = bomb.side === "kobe" ? nameA : nameB;

  return (
    <section
      data-testid="bbti-replay-center"
      data-bbti-replay-center-version={BBTI_REPLAY_CENTER_VERSION}
      data-bbti-replay-center-matchup-id={matchupId}
      data-bbti-replay-center-topic-id={topicId}
      data-bbti-replay-center-round={roundNumber}
      data-bbti-replay-center-side={bomb.side}
      data-bbti-replay-center-source={bomb.source}
      aria-labelledby="replay-title"
      className="mt-4 mx-auto w-full max-w-2xl rounded-xl bg-gradient-to-r from-yellow-900/20 to-red-900/20 border border-yellow-500/30 p-3 text-left sm:mt-6 sm:p-4 sm:text-center"
      style={{ animation: "fade-up 0.4s ease-out" }}
    >
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-yellow-400/80 font-bold mb-2">
        <h3 id="replay-title" className="text-xs font-bold">REPLAY CENTER</h3>
        <span className="text-white/20">/</span>
        <span>COACH&apos;S CHALLENGE</span>
      </div>
      <p className="text-white/90 text-sm sm:text-base font-semibold mb-1">
        {bomb.stat}
      </p>
      <p
        data-testid="bbti-replay-center-source"
        className="text-white/40 text-xs"
      >
        来源：{bomb.source} · 偏向{sideName}
      </p>
    </section>
  );
}
