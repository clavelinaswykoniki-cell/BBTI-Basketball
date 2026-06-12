"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { parseBbtiDeepLink } from "@/lib/bbti-deep-links";
import { scrollToSection } from "@/lib/scroll-to-section";
import BbtiResultTabs, { BBTI_RESULT_SECTIONS } from "./BbtiResultTabs";

interface BbtiResultActionDockProps {
  primaryChallengeTitle?: string;
  compareLabel?: string;
  onPrimaryChallenge: () => void;
  onCustomChallenge: () => void;
  onCompare: () => void;
}

const ACTIVE_SECTION_BUFFER = 12;
const SECTION_IDS = BBTI_RESULT_SECTIONS.map((section) => section.id);

interface InitialSectionState {
  sectionId: string;
  shouldAutoScroll: boolean;
}

function readInitialSectionState(): InitialSectionState {
  if (typeof window === "undefined") {
    return {
      sectionId: BBTI_RESULT_SECTIONS[0].id,
      shouldAutoScroll: false,
    };
  }

  const hashId = window.location.hash.replace(/^#/, "");
  if (SECTION_IDS.includes(hashId)) {
    return {
      sectionId: hashId,
      shouldAutoScroll: true,
    };
  }

  const deepLink = parseBbtiDeepLink(window.location.search);
  if (deepLink.hasClipParam || deepLink.clipKey || deepLink.clipQuestionId) {
    return {
      sectionId: "bbti-film-room",
      shouldAutoScroll: true,
    };
  }
  if (deepLink.eventId) {
    return {
      sectionId: "bbti-arena-events",
      shouldAutoScroll: false,
    };
  }
  if (deepLink.challengeMatchupId) {
    return {
      sectionId: "bbti-challenges",
      shouldAutoScroll: false,
    };
  }
  return {
    sectionId: BBTI_RESULT_SECTIONS[0].id,
    shouldAutoScroll: false,
  };
}

export default function BbtiResultActionDock({
  primaryChallengeTitle,
  compareLabel = "双人对比",
  onPrimaryChallenge,
  onCustomChallenge,
  onCompare,
}: BbtiResultActionDockProps) {
  const dockRef = useRef<HTMLElement | null>(null);
  const [initialSectionState] = useState<InitialSectionState>(() => readInitialSectionState());
  const [activeSectionId, setActiveSectionId] = useState<string>(() => initialSectionState.sectionId);
  const sectionIds = useMemo(() => SECTION_IDS, []);

  useEffect(() => {
    const updateDockHeight = () => {
      const height = dockRef.current?.getBoundingClientRect().height ?? 0;
      document.documentElement.style.setProperty("--bbti-action-dock-offset", `${Math.ceil(height + 24)}px`);
    };

    updateDockHeight();

    if (typeof ResizeObserver === "undefined" || !dockRef.current) {
      window.addEventListener("resize", updateDockHeight);
      return () => window.removeEventListener("resize", updateDockHeight);
    }

    const resizeObserver = new ResizeObserver(updateDockHeight);
    resizeObserver.observe(dockRef.current);
    window.addEventListener("resize", updateDockHeight);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateDockHeight);
    };
  }, []);

  useEffect(() => {
    if (!initialSectionState.shouldAutoScroll) return;

    const targetId = initialSectionState.sectionId;
    let frameId = window.requestAnimationFrame(() => {
      setActiveSectionId(targetId);
      scrollToSection(targetId);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    };
  }, [initialSectionState]);

  useEffect(() => {
    const sectionElements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!sectionElements.length) return;

    let frameId = 0;
    const updateActiveSection = () => {
      frameId = 0;
      const dockBottom = dockRef.current?.getBoundingClientRect().bottom ?? 0;
      const activationLine = dockBottom + ACTIVE_SECTION_BUFFER;
      const currentSection = sectionElements.reduce<HTMLElement>((current, section) => {
        return section.getBoundingClientRect().top <= activationLine ? section : current;
      }, sectionElements[0]);

      setActiveSectionId(currentSection.id);
    };

    const scheduleUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [sectionIds]);

  return (
    <section
      ref={dockRef}
      data-testid="bbti-result-action-dock"
      data-bbti-action-dock-active-section={activeSectionId}
      data-bbti-action-dock-compare-mode={compareLabel === "生成对比" ? "pending" : "default"}
      data-bbti-action-dock-primary-mode={primaryChallengeTitle ? "matchup" : "default"}
      data-bbti-action-dock-sticky="true"
      className="sticky top-3 z-40 w-full max-w-lg rounded-2xl border border-white/10 bg-black/78 p-3 shadow-[0_14px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl mb-6"
      style={{
        animation: "fade-up 0.45s ease-out",
        animationDelay: "0.68s",
        animationFillMode: "both",
      }}
    >
      <BbtiResultTabs
        activeSectionId={activeSectionId}
        onSectionSelect={(sectionId) => {
          setActiveSectionId(sectionId);
          scrollToSection(sectionId);
        }}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        <button
          type="button"
          data-testid="bbti-action-dock-primary-challenge"
          data-bbti-action-dock-action="primary-challenge"
          onClick={onPrimaryChallenge}
          className="rounded-xl bg-gradient-to-r from-kobe-gold to-lebron-gold px-3 py-2.5 text-[11px] font-black text-black hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer"
        >
          {primaryChallengeTitle ? `开战 ${primaryChallengeTitle}` : "命定开战"}
        </button>
        <button
          type="button"
          data-testid="bbti-action-dock-custom-challenge"
          data-bbti-action-dock-action="custom-challenge"
          onClick={onCustomChallenge}
          className="rounded-xl border border-kobe-gold/25 bg-kobe-gold/10 px-3 py-2.5 text-[11px] font-black text-kobe-gold hover:bg-kobe-gold/15 transition-colors cursor-pointer"
        >
          自选审判局
        </button>
        <button
          type="button"
          data-testid="bbti-action-dock-compare"
          data-bbti-action-dock-action="compare"
          onClick={onCompare}
          className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-[11px] font-black text-white/65 hover:text-white hover:bg-white/[0.09] transition-colors cursor-pointer"
        >
          {compareLabel}
        </button>
        <button
          type="button"
          data-testid="bbti-action-dock-share"
          data-bbti-action-dock-action="share"
          data-bbti-scroll-target="bbti-share"
          onClick={() => {
            setActiveSectionId("bbti-share");
            scrollToSection("bbti-share");
          }}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[11px] font-black text-white/45 hover:text-white/75 hover:bg-white/[0.07] transition-colors cursor-pointer"
        >
          分享包
        </button>
      </div>
    </section>
  );
}
