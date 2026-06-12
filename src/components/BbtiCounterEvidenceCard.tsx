"use client";

import { useMemo } from "react";
import type { BbtiChallengeMatchup } from "@/data/bbti-challenges";
import {
  getBbtiCounterEvidence,
  type BbtiCounterEvidence,
} from "@/data/bbti-counter-evidence-presets";
import type { BbtiFilmRoomClip } from "@/data/bbti-playbook";
import type { BbtiFilmRoomCrossExam } from "@/data/bbti-film-room-cross-exams";
import { buildBbtiResultUrl } from "@/lib/bbti-deep-links";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiCounterEvidenceCardProps {
  code: string;
  clip: BbtiFilmRoomClip;
  crossExam: BbtiFilmRoomCrossExam;
  dimensionLabel: string;
  challenge?: BbtiChallengeMatchup;
  typeName?: string;
  emoji?: string;
}

function cleanBaseHref(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}${window.location.pathname}`;
}

function buildCounterUrl(
  code: string,
  clip: BbtiFilmRoomClip,
  challenge?: BbtiChallengeMatchup,
  baseHref?: string,
): string {
  const url = new URL(buildBbtiResultUrl(code, {
    clipKey: clip.clipKey,
    challengeMatchupId: challenge?.matchupId,
  }, baseHref));
  url.hash = "bbti-film-room";
  return url.toString();
}

function buildCounterCopy(
  code: string,
  clip: BbtiFilmRoomClip,
  crossExam: BbtiFilmRoomCrossExam,
  counter: BbtiCounterEvidence,
  challenge?: BbtiChallengeMatchup,
  typeName?: string,
  emoji?: string,
  baseHref?: string,
): string {
  const identity = typeName ? `${emoji ? `${emoji} ` : ""}${typeName}（${code}）` : code;

  return [
    `BBTI 反方证据：${identity} · Q${clip.questionId}`,
    challenge ? `对线：${challenge.category} · ${challenge.title}｜${challenge.label}` : null,
    `主张：${counter.claim}`,
    `证据来源：${counter.sourceLabel}`,
    `证据：${counter.evidence}`,
    `反方追问：${counter.question}`,
    `审查标准：${crossExam.standard}`,
    `坚持/改判：${counter.decisionPrompt}`,
    buildCounterUrl(code, clip, challenge, baseHref),
  ].filter(Boolean).join("\n");
}

export default function BbtiCounterEvidenceCard({
  code,
  clip,
  crossExam,
  dimensionLabel,
  challenge,
  typeName,
  emoji,
}: BbtiCounterEvidenceCardProps) {
  const copyFeedback = useGuardedClipboard<"counter">();
  const counter = useMemo(
    () => getBbtiCounterEvidence({ clip, crossExam, dimensionLabel, challenge }),
    [challenge, clip, crossExam, dimensionLabel],
  );
  const copyCounter = () => {
    copyFeedback.copyText(
      buildCounterCopy(code, clip, crossExam, counter, challenge, typeName, emoji, cleanBaseHref()),
      "counter",
    );
  };
  const copied = copyFeedback.isCopied("counter");
  const failed = copyFeedback.isFailed("counter");

  return (
    <div className="mt-3 rounded-xl border border-lebron-gold/20 bg-lebron-wine/12 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-lebron-gold/72">
            Counter Evidence
          </p>
          <h4 className="mt-1 text-sm font-black text-white">
            战术板反证
          </h4>
        </div>
        <span className="shrink-0 rounded-full border border-lebron-gold/25 px-2 py-0.5 text-[10px] font-black text-lebron-gold/70">
          {counter.sourceLabel}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {[
          { label: "主张", value: counter.claim },
          { label: "证据", value: counter.evidence },
          { label: "反方追问", value: counter.question },
          { label: "坚持 / 改判", value: counter.decisionPrompt },
        ].map((item) => (
          <div key={item.label} className="min-w-0 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
            <p className="text-[10px] font-black text-lebron-gold/66 mb-1">
              {item.label}
            </p>
            <p className="text-[11px] text-white/62 leading-relaxed">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={copyCounter}
        className="mt-3 w-full rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-black text-white/62 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
      >
        {failed
          ? "复制失败，可手动复制"
          : copied
            ? "已复制反方证据"
            : "复制反方证据"}
      </button>

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copied ? "已复制反方证据" : failed ? "反方证据自动复制失败，可手动复制" : ""}
      </p>

      <BbtiManualCopyFallback
        text={copyFeedback.feedback.manualCopyText}
        title="自动复制失败，长按下方反方证据复制。"
        className="mt-3"
      />
    </div>
  );
}
