"use client";

import type { BbtiFilmRoomDrill } from "@/data/bbti-film-room-drills";
import {
  buildBbtiFilmRoomRemixBenchCopy,
  resolveBbtiFilmRoomRemixBench,
  type BbtiFilmRoomRemixTrendInput,
} from "@/data/bbti-film-room-remix-bench";
import type { BbtiFilmRoomClip } from "@/data/bbti-playbook";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiFilmRoomRemixBenchProps {
  code: string;
  activeClipNo: number;
  clip: BbtiFilmRoomClip;
  clipCount: number;
  dimensionLabel: string;
  drill: BbtiFilmRoomDrill;
  isSharedClipMode?: boolean;
  trend?: BbtiFilmRoomRemixTrendInput | null;
}

export default function BbtiFilmRoomRemixBench({
  code,
  activeClipNo,
  clip,
  clipCount,
  dimensionLabel,
  drill,
  isSharedClipMode = false,
  trend = null,
}: BbtiFilmRoomRemixBenchProps) {
  const copyFeedback = useGuardedClipboard<"bench">();
  const bench = resolveBbtiFilmRoomRemixBench({
    activeClipNo,
    answerText: clip.answerText,
    clipCount,
    clipTitle: clip.coachTimeout.title,
    code,
    dimensionLabel,
    drillStepCount: drill.steps.length,
    drillTitle: drill.title,
    isSharedClipMode,
    questionId: clip.questionId,
    trend,
  });
  const copied = copyFeedback.isCopied("bench");
  const failed = copyFeedback.isFailed("bench");

  const copyBench = () => {
    copyFeedback.copyText(buildBbtiFilmRoomRemixBenchCopy(bench), "bench");
  };

  return (
    <div
      data-testid="bbti-film-room-remix-bench"
      data-bbti-film-room-remix-version={bench.version}
      data-bbti-film-room-remix-source={bench.source}
      data-bbti-film-room-remix-code={bench.code}
      data-bbti-film-room-remix-question={bench.activeQuestionId}
      data-bbti-film-room-remix-count={bench.rowCount}
      className="mb-3 rounded-xl border border-emerald-300/18 bg-emerald-300/[0.055] p-3"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100/58">
            Remix Bench
          </p>
          <h4 className="mt-1 text-sm font-black text-white">回看替补席</h4>
          <p className="mt-1 text-xs font-bold leading-relaxed text-white/42">
            当前片段、加练四连和本地模拟趋势放在同一张小抄里。
          </p>
        </div>
        <button
          type="button"
          onClick={copyBench}
          data-testid="bbti-film-room-remix-copy"
          data-bbti-film-room-remix-action="copy-bench"
          className="shrink-0 rounded-full border border-emerald-100/15 bg-white/[0.04] px-3 py-2 text-[11px] font-black text-emerald-100/72 transition-colors hover:bg-emerald-100/10 hover:text-white"
        >
          {failed ? "复制失败" : copied ? "已复制" : "复制小抄"}
        </button>
      </div>

      <div className="grid gap-2">
        {bench.rows.map((row, index) => (
          <div
            key={row.id}
            data-testid="bbti-film-room-remix-row"
            data-bbti-film-room-remix-row={row.id}
            data-bbti-film-room-remix-position={index + 1}
            data-bbti-film-room-remix-target={row.target}
            className="rounded-lg border border-white/10 bg-black/18 px-3 py-2"
          >
            <div className="mb-1 flex items-start justify-between gap-3">
              <p className="text-[10px] font-black text-emerald-100/58">
                {row.label} · {row.title}
              </p>
              <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-black text-white/34">
                {row.meta}
              </span>
            </div>
            <p className="text-[11px] font-bold leading-relaxed text-white/58">
              {row.body}
            </p>
          </div>
        ))}
      </div>

      <p
        data-testid="bbti-film-room-remix-boundary"
        className="mt-2 text-[10px] font-bold leading-relaxed text-white/34"
      >
        {bench.boundary}
      </p>

      <BbtiManualCopyFallback
        text={copyFeedback.feedback.manualCopyText}
        title="自动复制失败，长按下方回看小抄复制。"
        className="mt-3"
        tone="neutral"
      />
    </div>
  );
}
