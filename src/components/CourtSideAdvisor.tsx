"use client";

import { useMemo, useState } from "react";
import type { DebateTopic } from "@/data/debates";
import type { BbtiChallengeCaseContext } from "@/data/bbti-challenge-case";
import type { ReplayStatBomb, VoteSide } from "@/data/stat-bombs";
import { getCourtSideAdvisorRead } from "@/data/courtside-advisor";

interface CourtSideAdvisorProps {
  topic: DebateTopic;
  votedFor: VoteSide;
  nameA: string;
  nameB: string;
  statBomb?: ReplayStatBomb | null;
  caseContext?: BbtiChallengeCaseContext | null;
}

function caseBadge(context: BbtiChallengeCaseContext): string {
  switch (context.source) {
    case "film-room":
      return `Q${context.questionId} 自洽检查`;
    case "result":
      return "报告自洽检查";
    case "arena-event":
      return `${context.eventTag} 情境检查`;
  }
}

export default function CourtSideAdvisor({
  topic,
  votedFor,
  nameA,
  nameB,
  statBomb,
  caseContext,
}: CourtSideAdvisorProps) {
  const read = useMemo(
    () => getCourtSideAdvisorRead({ topic, votedFor, nameA, nameB, statBomb, caseContext }),
    [caseContext, nameA, nameB, statBomb, topic, votedFor],
  );
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const copyRead = () => {
    navigator.clipboard.writeText(read.copyText).then(
      () => {
        setCopyState("copied");
        window.setTimeout(() => setCopyState("idle"), 1600);
      },
      () => {
        setCopyState("failed");
        window.setTimeout(() => setCopyState("idle"), 1600);
      },
    );
  };

  return (
    <section
      aria-labelledby="courtside-advisor-title"
      data-testid="bbti-courtside-advisor"
      data-bbti-courtside-advisor-case-source={caseContext?.source ?? "none"}
      data-bbti-courtside-advisor-side={votedFor}
      className="mx-auto mt-4 w-full max-w-2xl rounded-xl border border-sky-400/20 bg-sky-950/20 p-3 sm:p-4"
      style={{ animation: "fade-up 0.45s ease-out" }}
    >
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-sky-200">
              Court Side
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold text-white/45">
              {read.tag}
            </span>
            {caseContext && (
              <span className="rounded-full border border-kobe-gold/25 bg-kobe-gold/10 px-2.5 py-1 text-[10px] font-bold text-kobe-gold/80">
                {caseBadge(caseContext)}
              </span>
            )}
          </div>
          <h3 id="courtside-advisor-title" className="text-base font-black text-white">
            {read.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={copyRead}
          className="min-h-[36px] shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/65 transition-colors hover:border-sky-300/40 hover:text-sky-200"
        >
          {copyState === "copied" ? "已复制" : copyState === "failed" ? "复制失败" : "复制点评"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        <div className="rounded-lg border border-white/10 bg-black/20 p-2.5 sm:p-3">
          <p className="mb-1 text-[11px] uppercase tracking-widest text-white/30">助教提示</p>
          <p className="text-xs leading-relaxed text-white/70">{read.coachCue}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 p-2.5 sm:p-3">
          <p className="mb-1 text-[11px] uppercase tracking-widest text-white/30">回放反证</p>
          <p className="text-xs leading-relaxed text-white/70">{read.counterRead}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 p-2.5 sm:p-3">
          <p className="mb-1 text-[11px] uppercase tracking-widest text-white/30">下一句追问</p>
          <p className="text-xs leading-relaxed text-white/70">{read.reviewQuestion}</p>
        </div>
      </div>
    </section>
  );
}
