"use client";

import { useMemo, useState } from "react";
import { getBbtiArenaEventStorageKey } from "@/data/bbti-arena-events";
import type { BbtiChallengeCaseContext } from "@/data/bbti-challenge-case";
import {
  resolveBbtiDailyReturnCaseContext,
  resolveBbtiDailyReturnRemix,
  type BbtiDailyReturnPlay,
  type BbtiDailyReturnRemixLaneId,
} from "@/data/bbti-daily-return";
import type { StoredBbtiResult } from "@/data/bbti-playbook";
import { buildBbtiResultUrl } from "@/lib/bbti-deep-links";

interface BbtiDailyReturnRemixProps {
  dailyReturn: BbtiDailyReturnPlay;
  result: StoredBbtiResult;
  onChallengeMatchup: (matchupId: string, caseContext?: BbtiChallengeCaseContext | null) => void;
  onOpenResult: (code: string) => void;
}

function currentBaseHref(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}${window.location.pathname}`;
}

export default function BbtiDailyReturnRemix({
  dailyReturn,
  result,
  onChallengeMatchup,
  onOpenResult,
}: BbtiDailyReturnRemixProps) {
  const remix = useMemo(
    () => resolveBbtiDailyReturnRemix(result, dailyReturn),
    [dailyReturn, result],
  );
  const [activeLaneId, setActiveLaneId] = useState<BbtiDailyReturnRemixLaneId>("daily-event");
  const activeLane = remix.lanes.find((lane) => lane.id === activeLaneId) ?? remix.lanes[0];
  const featuredCaseContext = useMemo(
    () => resolveBbtiDailyReturnCaseContext(dailyReturn),
    [dailyReturn],
  );

  const openDailyEvent = () => {
    if (dailyReturn.event) {
      try {
        localStorage.setItem(getBbtiArenaEventStorageKey(result.code), JSON.stringify({
          id: dailyReturn.event.id,
          dateKey: dailyReturn.dateKey,
        }));
      } catch {
        // Opening the result is still useful when storage is unavailable.
      }
    }

    onOpenResult(result.code);
  };

  const openFilmRoomReturn = () => {
    if (typeof window !== "undefined") {
      const url = new URL(buildBbtiResultUrl(result.code, {
        challengeMatchupId: dailyReturn.featuredChallenge?.matchupId,
        clipKey: remix.filmRoomClipKey,
      }, currentBaseHref()));
      url.hash = "bbti-film-room";
      window.history.replaceState(null, "", url.toString());
    }

    onOpenResult(result.code);
  };

  const openFeaturedChallenge = () => {
    if (!dailyReturn.featuredChallenge) return;
    onChallengeMatchup(dailyReturn.featuredChallenge.matchupId, featuredCaseContext);
  };

  const openActiveLane = () => {
    if (activeLane.id === "daily-event") {
      openDailyEvent();
      return;
    }
    if (activeLane.id === "film-room-return") {
      openFilmRoomReturn();
      return;
    }
    openFeaturedChallenge();
  };

  return (
    <section
      data-testid="bbti-daily-return-remix"
      data-bbti-daily-return-remix-version={remix.version}
      data-bbti-daily-return-remix-code={remix.code}
      data-bbti-daily-return-remix-date={remix.dateKey}
      data-bbti-daily-return-remix-event={remix.eventId ?? "none"}
      data-bbti-daily-return-remix-featured={remix.featuredChallengeId ?? "none"}
      data-bbti-daily-return-remix-clip={remix.filmRoomClipKey}
      data-bbti-daily-return-remix-lane={activeLane.id}
      data-bbti-daily-return-remix-count={remix.laneCount}
      className="mt-3 rounded-xl border border-white/10 bg-black/18 p-3"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
          回访切换
        </p>
        <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-black text-white/34">
          {remix.laneCount} 路
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {remix.lanes.map((lane, index) => {
          const active = lane.id === activeLane.id;
          return (
            <button
              key={lane.id}
              type="button"
              data-testid="bbti-daily-return-remix-tab"
              data-bbti-daily-return-remix-tab={lane.id}
              data-bbti-daily-return-remix-target={lane.target}
              data-bbti-daily-return-remix-position={index + 1}
              data-bbti-daily-return-remix-active={active ? "true" : "false"}
              onClick={() => setActiveLaneId(lane.id)}
              className={`min-h-[44px] rounded-lg border px-2 py-2 text-[10px] font-black leading-tight transition-colors ${
                active
                  ? "border-kobe-gold bg-kobe-gold text-black"
                  : "border-white/10 bg-white/[0.035] text-white/46 hover:text-white/75"
              }`}
            >
              {lane.label}
            </button>
          );
        })}
      </div>

      <div
        data-testid="bbti-daily-return-remix-detail"
        data-bbti-daily-return-remix-detail={activeLane.id}
        className="mt-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2"
      >
        <p className="text-xs font-black leading-snug text-white/80">
          {activeLane.title}
        </p>
        <p className="mt-1 text-[11px] font-bold leading-relaxed text-white/48">
          {activeLane.body}
        </p>
        <p className="mt-1 text-[10px] font-bold leading-relaxed text-white/30">
          {remix.boundary}
        </p>
      </div>

      <button
        type="button"
        data-testid="bbti-daily-return-remix-action"
        data-bbti-daily-return-remix-action={activeLane.id}
        onClick={openActiveLane}
        disabled={activeLane.id === "featured-challenge" && !dailyReturn.featuredChallenge}
        className="mt-2 w-full rounded-full border border-kobe-gold/25 bg-kobe-gold/[0.08] px-4 py-2 text-xs font-black text-kobe-gold transition-colors hover:bg-kobe-gold/15 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {activeLane.ctaLabel}
      </button>
    </section>
  );
}
