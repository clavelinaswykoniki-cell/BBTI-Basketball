"use client";

import type { BbtiFilmRoomCrossExam } from "@/data/bbti-film-room-cross-exams";
import {
  buildBbtiFilmRoomDrillCopy,
  resolveBbtiFilmRoomDrill,
} from "@/data/bbti-film-room-drills";
import type { BbtiFilmRoomClip } from "@/data/bbti-playbook";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiFilmRoomDrillCardProps {
  code: string;
  clip: BbtiFilmRoomClip;
  crossExam: BbtiFilmRoomCrossExam;
  dimensionLabel: string;
  typeName?: string;
}

export default function BbtiFilmRoomDrillCard({
  code,
  clip,
  crossExam,
  dimensionLabel,
  typeName,
}: BbtiFilmRoomDrillCardProps) {
  const copyFeedback = useGuardedClipboard<"drill">();
  const drill = resolveBbtiFilmRoomDrill({ clip, crossExam, dimensionLabel });
  const copied = copyFeedback.isCopied("drill");
  const failed = copyFeedback.isFailed("drill");

  const copyDrill = () => {
    copyFeedback.copyText(buildBbtiFilmRoomDrillCopy({
      code,
      drill,
      typeName,
    }), "drill");
  };

  return (
    <div
      data-testid="bbti-film-room-drill"
      data-bbti-film-room-drill-qa={drill.qaKey}
      data-bbti-film-room-drill-question={clip.questionId}
      data-bbti-film-room-drill-step-count={drill.steps.length}
      className="mt-3 rounded-xl border border-sky-300/20 bg-sky-300/[0.06] p-3"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-sky-100/62">
            Drill Card
          </p>
          <h4 className="mt-1 text-sm font-black text-white">
            {drill.title}
          </h4>
        </div>
        <span className="shrink-0 rounded-full border border-sky-200/20 px-2 py-0.5 text-[10px] font-black text-sky-100/62">
          {crossExam.seat}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {drill.steps.map((step, index) => (
          <div
            key={step.id}
            data-testid="bbti-film-room-drill-step"
            data-bbti-film-room-drill-step={step.id}
            data-bbti-film-room-drill-position={index + 1}
            className="min-w-0 rounded-lg border border-white/10 bg-black/18 px-3 py-2"
          >
            <p className="text-[10px] font-black text-sky-100/62">
              {step.label}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/62">
              {step.text}
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        data-testid="bbti-film-room-drill-copy"
        onClick={copyDrill}
        className="mt-3 w-full rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs font-black text-white/62 transition-colors hover:bg-white/[0.09] hover:text-white cursor-pointer"
      >
        {failed ? "复制失败，可手动复制" : copied ? "已复制加练四连" : "复制加练四连"}
      </button>

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copied ? "已复制录像室加练四连" : failed ? "录像室加练四连自动复制失败，可手动复制" : ""}
      </p>

      <BbtiManualCopyFallback
        text={copyFeedback.feedback.manualCopyText}
        title="自动复制失败，长按下方加练四连复制。"
        className="mt-3"
        tone="neutral"
      />
    </div>
  );
}
