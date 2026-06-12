"use client";

import { useMemo } from "react";
import type { BbtiFilmRoomClip } from "@/data/bbti-playbook";
import {
  getBbtiFilmRoomContradictions,
  type BbtiFilmRoomContradiction,
} from "@/data/bbti-film-room-contradictions";
import { buildBbtiResultUrl } from "@/lib/bbti-deep-links";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiFilmRoomContradictionsProps {
  code: string;
  clips: BbtiFilmRoomClip[];
  typeName?: string;
  emoji?: string;
}

function cleanBaseHref(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}${window.location.pathname}`;
}

function contradictionUrl(code: string, contradiction: BbtiFilmRoomContradiction, baseHref?: string): string {
  const url = new URL(buildBbtiResultUrl(code, {
    clipKey: contradiction.primaryClipKey,
  }, baseHref));
  url.hash = "bbti-film-room";
  return url.toString();
}

function buildContradictionCopy(
  code: string,
  contradiction: BbtiFilmRoomContradiction,
  typeName?: string,
  emoji?: string,
  baseHref?: string,
): string {
  const identity = typeName ? `${emoji ? `${emoji} ` : ""}${typeName}（${code}）` : code;

  return [
    `BBTI 自查矩阵：${identity} · ${contradiction.title}`,
    `审查问题：${contradiction.question}`,
    `Clip A：Q${contradiction.clipA.questionId}｜${contradiction.clipA.label}｜${contradiction.clipA.answerText}`,
    `标准 A：${contradiction.standardA}`,
    `Clip B：Q${contradiction.clipB.questionId}｜${contradiction.clipB.label}｜${contradiction.clipB.answerText}`,
    `标准 B：${contradiction.standardB}`,
    contradiction.shareLine,
    contradictionUrl(code, contradiction, baseHref),
  ].join("\n");
}

export default function BbtiFilmRoomContradictions({
  code,
  clips,
  typeName,
  emoji,
}: BbtiFilmRoomContradictionsProps) {
  const contradictions = useMemo(() => getBbtiFilmRoomContradictions(clips), [clips]);
  const copyFeedback = useGuardedClipboard<string>();

  if (contradictions.length === 0) return null;

  const copyContradiction = (contradiction: BbtiFilmRoomContradiction) => {
    copyFeedback.copyText(
      buildContradictionCopy(code, contradiction, typeName, emoji, cleanBaseHref()),
      contradiction.id,
    );
  };

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-black/22 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/34">
            Consistency Check
          </p>
          <h4 className="mt-1 text-sm font-black text-white">
            自查矩阵：录像室标准拉扯
          </h4>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-black text-white/38">
          {contradictions.length} 组
        </span>
      </div>
      <p className="mt-2 text-[11px] text-white/42 leading-relaxed">
        只基于当前 Film Room clips，检查你在不同题目或同一复合选择里同时点亮的两套评判标准。
      </p>

      <div className="mt-3 space-y-2">
        {contradictions.map((contradiction) => {
          const isCopied = copyFeedback.isCopied(contradiction.id);
          const isFailed = copyFeedback.isFailed(contradiction.id);
          const contradictionCopy = buildContradictionCopy(code, contradiction, typeName, emoji, cleanBaseHref());
          const showManualCopy = copyFeedback.feedback.manualCopyText === contradictionCopy;

          return (
            <article
              key={contradiction.id}
              className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-lebron-wine/25 px-2 py-0.5 text-[10px] font-black text-lebron-gold/78">
                  {contradiction.axis}
                </span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-black text-white/40">
                  {contradiction.clipA.questionId === contradiction.clipB.questionId
                    ? `Q${contradiction.clipA.questionId} 同题拉扯`
                    : `Q${contradiction.clipA.questionId} vs Q${contradiction.clipB.questionId}`}
                </span>
              </div>

              <p className="mt-2 text-xs font-black text-white/82 leading-relaxed">
                {contradiction.title}
              </p>
              <p className="mt-1 text-[11px] text-white/55 leading-relaxed">
                {contradiction.question}
              </p>

              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    clip: contradiction.clipA,
                    standard: contradiction.standardA,
                  },
                  {
                    clip: contradiction.clipB,
                    standard: contradiction.standardB,
                  },
                ].map((item, itemIndex) => (
                  <div
                    key={`${contradiction.id}-${item.clip.questionId}-${itemIndex}`}
                    className="min-w-0 rounded-lg bg-black/24 px-2.5 py-2"
                  >
                    <p className="text-[10px] font-black text-kobe-gold/70">
                      Q{item.clip.questionId} · {item.clip.label}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] font-bold text-white/68 leading-relaxed">
                      {item.clip.answerText}
                    </p>
                    <p className="mt-1 text-[10px] text-white/38 leading-relaxed">
                      {item.standard}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-white/44 leading-relaxed">
                  {contradiction.shareLine}
                </p>
                <button
                  type="button"
                  onClick={() => copyContradiction(contradiction)}
                  className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-black text-white/58 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                >
                  {isFailed ? "复制失败，可手动复制" : isCopied ? "已复制自查" : "复制自查"}
                </button>
              </div>

              <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {isCopied ? "已复制自查矩阵" : isFailed ? "自查矩阵自动复制失败，可手动复制" : ""}
              </p>

              {showManualCopy && (
                <BbtiManualCopyFallback
                  text={copyFeedback.feedback.manualCopyText}
                  title="自动复制失败，长按下方自查矩阵复制。"
                  className="mt-3"
                />
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
