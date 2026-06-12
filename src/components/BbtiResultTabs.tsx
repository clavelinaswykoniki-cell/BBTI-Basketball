"use client";

import { useEffect, useMemo, useRef } from "react";
import { prefersReducedMotion } from "@/lib/scroll-to-section";

export type BbtiResultProgramId = "scouting" | "film-room" | "challenge" | "share";

export interface BbtiResultSectionDef {
  id: string;
  label: string;
  programId: BbtiResultProgramId;
}

interface BbtiResultProgramDef {
  id: BbtiResultProgramId;
  label: string;
  tag: string;
  anchorId: string;
  summary: string;
}

export const BBTI_RESULT_PROGRAMS: BbtiResultProgramDef[] = [
  {
    id: "scouting",
    label: "球探卡",
    tag: "REPORT",
    anchorId: "bbti-card",
    summary: "身份、四维、二层报告",
  },
  {
    id: "film-room",
    label: "录像室",
    tag: "FILM",
    anchorId: "bbti-film-room",
    summary: "关键选择、反证、开场弹药",
  },
  {
    id: "challenge",
    label: "开庭挑战",
    tag: "NEXT",
    anchorId: "bbti-arena-events",
    summary: "情境加赛、阵容化学、命定对线",
  },
  {
    id: "share",
    label: "发群包",
    tag: "SHARE",
    anchorId: "bbti-share",
    summary: "战报卡、分享目标、对比邀请",
  },
];

export const BBTI_RESULT_SECTIONS: BbtiResultSectionDef[] = [
  { id: "bbti-card", label: "球探卡", programId: "scouting" },
  { id: "bbti-arena-events", label: "情境加赛", programId: "challenge" },
  { id: "bbti-scouting", label: "四维诊断", programId: "scouting" },
  { id: "bbti-persona-extension", label: "二层报告", programId: "scouting" },
  { id: "bbti-film-room", label: "录像室", programId: "film-room" },
  { id: "bbti-challenges", label: "开庭挑战", programId: "challenge" },
  { id: "bbti-share", label: "分享包", programId: "share" },
];

interface BbtiResultTabsProps {
  activeSectionId: string;
  onSectionSelect: (sectionId: string) => void;
}

export function getBbtiResultProgramForSection(sectionId: string): BbtiResultProgramDef {
  const section = BBTI_RESULT_SECTIONS.find((item) => item.id === sectionId);
  return (
    BBTI_RESULT_PROGRAMS.find((program) => program.id === section?.programId) ??
    BBTI_RESULT_PROGRAMS[0]
  );
}

export default function BbtiResultTabs({
  activeSectionId,
  onSectionSelect,
}: BbtiResultTabsProps) {
  const sectionButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const activeProgram = getBbtiResultProgramForSection(activeSectionId);
  const activeSections = useMemo(
    () => BBTI_RESULT_SECTIONS.filter((section) => section.programId === activeProgram.id),
    [activeProgram.id],
  );

  useEffect(() => {
    const activeButton = sectionButtonRefs.current[activeSectionId];
    if (!activeButton) return;

    activeButton.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeSectionId]);

  return (
    <div className="mb-2">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/28">
            Postgame Show
          </p>
          <p className="mt-0.5 truncate text-xs font-black text-white/62">
            赛后节目单 · {activeProgram.summary}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-kobe-gold/20 bg-kobe-gold/8 px-2 py-0.5 text-[10px] font-black text-kobe-gold/72">
          {activeProgram.tag}
        </span>
      </div>

      <nav
        aria-label="BBTI 赛后节目单"
        data-testid="bbti-result-program-nav"
        className="grid grid-cols-4 gap-1.5"
      >
        {BBTI_RESULT_PROGRAMS.map((program) => {
          const active = program.id === activeProgram.id;

          return (
            <button
              key={program.id}
              type="button"
              data-testid="bbti-result-program-tab"
              data-bbti-action-dock-program={program.id}
              data-bbti-scroll-target={program.anchorId}
              aria-current={active ? "location" : undefined}
              onClick={() => onSectionSelect(program.anchorId)}
              className={`min-h-[42px] min-w-0 rounded-xl border px-2 py-2 text-left transition-colors cursor-pointer ${
                active
                  ? "border-kobe-gold bg-kobe-gold text-black"
                  : "border-white/10 bg-white/[0.04] text-white/52 hover:border-kobe-gold/35 hover:text-white"
              }`}
            >
              <span className="block truncate text-[10px] font-black">
                {program.label}
              </span>
              <span className="mt-0.5 block truncate text-[8px] font-black opacity-62">
                {program.tag}
              </span>
            </button>
          );
        })}
      </nav>

      <nav
        aria-label={`${activeProgram.label}细分章节`}
        data-testid="bbti-result-section-nav"
        className="mt-2 flex snap-x gap-1.5 overflow-x-auto pb-1"
      >
        {activeSections.map((section) => {
          const active = activeSectionId === section.id;

          return (
            <button
              key={section.id}
              ref={(element) => {
                sectionButtonRefs.current[section.id] = element;
              }}
              type="button"
              data-testid="bbti-result-section-chip"
              data-bbti-action-dock-section={section.id}
              data-bbti-scroll-target={section.id}
              aria-current={active ? "location" : undefined}
              aria-controls={section.id}
              onClick={() => onSectionSelect(section.id)}
              className={`min-h-[38px] shrink-0 snap-center whitespace-nowrap rounded-full border px-3 py-2 text-[11px] font-black transition-colors cursor-pointer ${
                active
                  ? "border-white bg-white text-black"
                  : "border-white/10 bg-white/[0.03] text-white/48 hover:text-white/75"
              }`}
            >
              {section.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
