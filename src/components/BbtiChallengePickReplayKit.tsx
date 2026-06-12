"use client";

import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import type {
  BbtiChallengePickReplayKit as BbtiChallengePickReplayKitData,
} from "@/data/bbti-challenge-replay-seeds";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiChallengePickReplayKitProps {
  pickReplayKit: BbtiChallengePickReplayKitData;
}

const PICK_REPLAY_KIT_ACTION_ID = "challenge-pick-replay-kit";

export default function BbtiChallengePickReplayKit({
  pickReplayKit,
}: BbtiChallengePickReplayKitProps) {
  const copyFeedback = useGuardedClipboard<string>();
  const showManualCopy = copyFeedback.feedback.manualCopyText === pickReplayKit.copyText
    || pickReplayKit.items.some((item) => item.copyText === copyFeedback.feedback.manualCopyText);

  return (
    <section
      data-testid="bbti-challenge-pick-replay-kit"
      data-bbti-challenge-pick-replay-kit-version={pickReplayKit.version}
      data-bbti-challenge-pick-replay-kit-code={pickReplayKit.code}
      data-bbti-challenge-pick-replay-kit-count={pickReplayKit.itemCount}
      className="mt-4 rounded-2xl border border-kobe-gold/18 bg-black/15 p-3 sm:p-4"
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-kobe-gold/70">
            Pick Replay Kit
          </p>
          <h3 className="mt-0.5 text-base font-black text-white">
            赛前回看清单
          </h3>
          <p className="mt-1 text-[11px] font-bold leading-relaxed text-white/42">
            案由先落定，再按压力题和第一球接着打。
          </p>
        </div>
        <button
          type="button"
          onClick={() => copyFeedback.copyText(pickReplayKit.copyText, PICK_REPLAY_KIT_ACTION_ID)}
          className="min-h-[36px] shrink-0 rounded-full border border-kobe-gold/25 bg-kobe-gold/10 px-4 py-2 text-[11px] font-black text-kobe-gold transition-colors hover:bg-kobe-gold/20"
          data-bbti-challenge-pick-replay-kit-action="copy-kit"
        >
          {copyFeedback.isFailed(PICK_REPLAY_KIT_ACTION_ID)
            ? "复制失败"
            : copyFeedback.isCopied(PICK_REPLAY_KIT_ACTION_ID)
              ? "已复制回看清单"
              : "复制整包"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {pickReplayKit.items.map((item, index) => {
          const itemCopied = copyFeedback.isCopied(item.id);
          const itemFailed = copyFeedback.isFailed(item.id);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => copyFeedback.copyText(item.copyText, item.id)}
              data-testid="bbti-challenge-pick-replay-kit-item"
              data-bbti-challenge-pick-replay-kit-item={item.id}
              data-bbti-challenge-pick-replay-kit-target={item.target}
              data-bbti-challenge-pick-replay-kit-source-lane={item.sourceLaneId}
              data-bbti-challenge-pick-replay-kit-matchup={item.sourceMatchupId}
              data-bbti-challenge-pick-replay-kit-position={index + 1}
              data-bbti-challenge-pick-replay-kit-action="copy"
              className="min-h-[108px] rounded-lg border border-white/10 bg-black/18 px-3 py-2 text-left transition-colors hover:border-kobe-gold/25 hover:bg-kobe-gold/8 sm:min-h-[118px]"
            >
              <p className="text-[10px] font-black text-kobe-gold/65">
                {item.label}
              </p>
              <p className="mt-1 text-xs font-black leading-snug text-white/78">
                {item.title}
              </p>
              <p className="mt-1 line-clamp-3 text-[11px] font-bold leading-relaxed text-white/48">
                {item.body}
              </p>
              <p className="mt-2 text-[10px] font-black text-kobe-gold/58">
                {itemFailed ? "复制失败" : itemCopied ? "已复制" : "复制话术"}
              </p>
            </button>
          );
        })}
      </div>

      <p
        data-testid="bbti-challenge-pick-replay-kit-boundary"
        className="mt-2 text-[10px] font-bold leading-relaxed text-white/34"
      >
        {pickReplayKit.boundary}
      </p>

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copyFeedback.feedback.status === "copied"
          ? copyFeedback.feedback.actionId === PICK_REPLAY_KIT_ACTION_ID
            ? "已复制赛前回看清单"
            : "已复制赛前回看话术"
          : copyFeedback.feedback.status === "failed"
            ? copyFeedback.feedback.actionId === PICK_REPLAY_KIT_ACTION_ID
              ? "赛前回看清单复制失败，可手动复制"
              : "赛前回看话术复制失败，可手动复制"
            : ""}
      </p>
      {showManualCopy && (
        <BbtiManualCopyFallback
          text={copyFeedback.feedback.manualCopyText}
          title="自动复制失败，长按下方赛前回看复制。"
          className="mt-3"
        />
      )}
    </section>
  );
}
