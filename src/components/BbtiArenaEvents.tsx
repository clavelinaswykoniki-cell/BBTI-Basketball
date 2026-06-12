"use client";

import { useEffect, useMemo, useState } from "react";
import type { BbtiChallengeMatchup } from "@/data/bbti-challenges";
import {
  BBTI_ARENA_AUDIENCE_FRAME_LABELS,
  BBTI_ARENA_EVENT_CONTEXTS,
  BBTI_ARENA_LENS_FILTERS,
  BBTI_ARENA_PRESSURE_LABELS,
  BBTI_ARENA_VENUE_LABELS,
  resolveBbtiArenaEventBracket,
  getBbtiArenaEventDateKey,
  getBbtiArenaEventStorageKey,
  getBbtiArenaEvents,
  getBbtiTodayArenaEventId,
  type BbtiArenaEventContext,
  type BbtiArenaLensFilterId,
} from "@/data/bbti-arena-events";
import {
  buildBbtiArenaEventChallengeCaseContext,
  type BbtiChallengeCaseContext,
} from "@/data/bbti-challenge-case";
import { buildBbtiResultUrl, parseBbtiDeepLink } from "@/lib/bbti-deep-links";
import { scrollToSection } from "@/lib/scroll-to-section";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiArenaEventsProps {
  code: string;
  typeName: string;
  emoji: string;
  challengeMatchups: BbtiChallengeMatchup[];
  initialEventId?: string;
  onChallengeMatchup: (matchupId: string, caseContext?: BbtiChallengeCaseContext | null) => void;
  onActiveShareEvent?: (event: BbtiArenaShareEvent | null) => void;
}

export interface BbtiArenaShareEvent {
  code: string;
  eventId: string;
  eventTitle: string;
  eventTag: string;
  eventScenario: string;
  eventGroupChatPrompt: string;
  eventCourt: string;
  eventStakes: string;
  challengeMatchupId: string;
  challengeTitle: string;
  challengeCopy?: string;
}

type ArenaEventFilter =
  | "all"
  | "today"
  | `context:${BbtiArenaEventContext}`
  | `lens:${BbtiArenaLensFilterId}`;

interface StoredArenaEventSelection {
  id: string;
  dateKey: string;
}

function hasEventId(events: ReturnType<typeof getBbtiArenaEvents>, eventId: string | null): eventId is string {
  return Boolean(eventId && events.some((event) => event.id === eventId));
}

function readInitialEvent(
  code: string,
  events: ReturnType<typeof getBbtiArenaEvents>,
  todayEventId: string,
  fallback: string,
): string {
  if (typeof window === "undefined") return fallback;
  const deepLink = parseBbtiDeepLink(window.location.search);
  if (deepLink.code === code && hasEventId(events, deepLink.eventId)) return deepLink.eventId;

  if (hasEventId(events, todayEventId)) return todayEventId;

  try {
    const raw = localStorage.getItem(getBbtiArenaEventStorageKey(code));
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<StoredArenaEventSelection>;
    const storedId = parsed.id ?? null;
    if (hasEventId(events, storedId)) {
      return storedId;
    }
  } catch {
    // Older builds stored only the id. Ignore invalid shapes and fall back safely.
  }
  return fallback;
}

function contextFilterKey(context: BbtiArenaEventContext): ArenaEventFilter {
  return `context:${context}`;
}

function lensFilterKey(id: BbtiArenaLensFilterId): ArenaEventFilter {
  return `lens:${id}`;
}

function filterEvents(
  events: ReturnType<typeof getBbtiArenaEvents>,
  filter: ArenaEventFilter,
  todayEventId: string,
): ReturnType<typeof getBbtiArenaEvents> {
  if (filter === "all") return events;
  if (filter === "today") return events.filter((event) => event.id === todayEventId);

  if (filter.startsWith("context:")) {
    const context = filter.replace("context:", "") as BbtiArenaEventContext;
    return events.filter((event) => event.context === context);
  }

  const lensId = filter.replace("lens:", "") as BbtiArenaLensFilterId;
  const lens = BBTI_ARENA_LENS_FILTERS.find((item) => item.id === lensId);
  if (!lens) return events;

  return events.filter((event) => event[lens.kind] === lens.value);
}

function scrollToShareKit() {
  scrollToSection("bbti-share");
}

function cleanBaseHref(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}${window.location.pathname}`;
}

export default function BbtiArenaEvents({
  code,
  typeName,
  emoji,
  challengeMatchups,
  initialEventId,
  onChallengeMatchup,
  onActiveShareEvent,
}: BbtiArenaEventsProps) {
  const events = useMemo(() => getBbtiArenaEvents(code), [code]);
  const todayEventId = useMemo(() => getBbtiTodayArenaEventId(code), [code]);
  const initialActiveId = initialEventId && hasEventId(events, initialEventId)
    ? initialEventId
    : todayEventId || events[0]?.id || "";
  const [storedActiveId, setStoredActiveId] = useState(() => (
    readInitialEvent(code, events, todayEventId, initialActiveId)
  ));
  const [activeFilter, setActiveFilter] = useState<ArenaEventFilter>("all");
  const copyFeedback = useGuardedClipboard<"prompt">();
  const activeId = hasEventId(events, storedActiveId)
    ? storedActiveId
    : readInitialEvent(code, events, todayEventId, todayEventId || events[0]?.id || "");
  const active = events.find((event) => event.id === activeId) ?? events[0];
  const contextOptions = useMemo(
    () => BBTI_ARENA_EVENT_CONTEXTS.filter((context) => (
      events.some((event) => event.context === context.id)
    )),
    [events],
  );
  const filteredEvents = useMemo(
    () => filterEvents(events, activeFilter, todayEventId),
    [activeFilter, events, todayEventId],
  );
  const matchingChallenge = active
    ? challengeMatchups.find((matchup) => matchup.category === active.recommendedCategory) ?? null
    : null;
  const activeChallenge = matchingChallenge ?? challengeMatchups[0] ?? null;
  const eventCaseContext = active && matchingChallenge
    ? buildBbtiArenaEventChallengeCaseContext({
      code,
      typeName,
      emoji,
      event: active,
      challenge: matchingChallenge,
    })
    : null;
  const eventBracket = active && activeChallenge
    ? resolveBbtiArenaEventBracket({
      challenge: activeChallenge,
      code,
      event: active,
    })
    : null;

  useEffect(() => {
    if (!active || !matchingChallenge) {
      onActiveShareEvent?.(null);
      return;
    }

    onActiveShareEvent?.({
      code,
      eventId: active.id,
      eventTitle: active.title,
      eventTag: active.tag,
      eventScenario: active.scenario,
      eventGroupChatPrompt: active.groupChatPrompt,
      eventCourt: active.court,
      eventStakes: active.stakes,
      challengeMatchupId: matchingChallenge.matchupId,
      challengeTitle: matchingChallenge.title,
      challengeCopy: matchingChallenge.shareCopy,
    });
  }, [active, code, matchingChallenge, onActiveShareEvent]);

  useEffect(() => {
    if (!active?.id) return;
    try {
      const selection: StoredArenaEventSelection = {
        id: active.id,
        dateKey: getBbtiArenaEventDateKey(),
      };
      localStorage.setItem(getBbtiArenaEventStorageKey(code), JSON.stringify(selection));
    } catch {
      // Result page still works when storage is blocked.
    }
  }, [active?.id, code]);

  if (!active) return null;

  const prompt = `${emoji} ${typeName}（${code}）事件题：${active.groupChatPrompt}`;
  const activeContextMeta = contextOptions.find((context) => context.id === active.context);
  const isTodayEvent = active.id === todayEventId;
  const copied = copyFeedback.isCopied("prompt");
  const failed = copyFeedback.isFailed("prompt");

  const buildEventUrl = () => buildBbtiResultUrl(code, {
    eventId: active.id,
    challengeMatchupId: activeChallenge?.matchupId,
  }, cleanBaseHref());

  const copyPrompt = () => {
    copyFeedback.copyText(`${prompt}\n${buildEventUrl()}`, "prompt");
  };

  const handleBracketAction = (routeId: string) => {
    if (routeId === "event-tipoff") {
      copyPrompt();
      return;
    }
    if (routeId === "challenge-branch" && activeChallenge) {
      onChallengeMatchup(activeChallenge.matchupId, eventCaseContext);
      return;
    }
    if (routeId === "share-return") {
      scrollToShareKit();
    }
  };

  const selectFilter = (filter: ArenaEventFilter) => {
    setActiveFilter(filter);
    const nextEvents = filterEvents(events, filter, todayEventId);
    if (!nextEvents.length || nextEvents.some((event) => event.id === active.id)) return;
    setStoredActiveId(nextEvents[0].id);
  };

  return (
    <div
      id="bbti-arena-events"
      className="w-full max-w-lg scroll-mt-[var(--bbti-action-dock-offset,9rem)] rounded-2xl glass p-5 sm:p-6 mb-6"
      style={{
        animation: "fade-up 0.5s ease-out",
        animationDelay: "1.28s",
        animationFillMode: "both",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-1">
            Arena Event Simulator
          </p>
          <h2 className="text-xl font-black text-white">
            {emoji} {typeName} 二次上场
          </h2>
          <p className="text-xs text-white/35 mt-1">
            同一人格，换个赛事情境再审一次
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-kobe-gold/30 px-2.5 py-1 text-[10px] font-black text-kobe-gold">
          {isTodayEvent ? "TODAY" : "REPLAYABLE"}
        </span>
      </div>

      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => selectFilter("all")}
          className={`shrink-0 rounded-full border px-3 py-2 text-[10px] font-black transition-colors cursor-pointer ${
            activeFilter === "all"
              ? "border-white bg-white text-black"
              : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white/75"
          }`}
        >
          全部情境
        </button>
        <button
          type="button"
          onClick={() => selectFilter("today")}
          className={`shrink-0 rounded-full border px-3 py-2 text-[10px] font-black transition-colors cursor-pointer ${
            activeFilter === "today"
              ? "border-lebron-gold bg-lebron-gold text-black"
              : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white/75"
          }`}
        >
          今日复盘
        </button>
        {contextOptions.map((context) => (
          <button
            key={context.id}
            type="button"
            onClick={() => selectFilter(contextFilterKey(context.id))}
            className={`shrink-0 rounded-full border px-3 py-2 text-[10px] font-black transition-colors cursor-pointer ${
              activeFilter === contextFilterKey(context.id)
                ? "border-kobe-gold bg-kobe-gold text-black"
                : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white/75"
            }`}
          >
            {context.label}
          </button>
        ))}
      </div>

      <div className="mb-3 rounded-xl border border-white/10 bg-black/18 p-2">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/28">
            观察角度
          </p>
          <span className="text-[10px] font-black text-white/25">
            场馆 / 压力 / 舆论
          </span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {BBTI_ARENA_LENS_FILTERS.map((lens) => (
            <button
              key={lens.id}
              type="button"
              onClick={() => selectFilter(lensFilterKey(lens.id))}
              className={`shrink-0 rounded-full border px-3 py-2 text-[10px] font-black transition-colors cursor-pointer ${
                activeFilter === lensFilterKey(lens.id)
                  ? "border-sky-200 bg-sky-200 text-black"
                  : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white/75"
              }`}
            >
              {lens.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 sm:grid-cols-3">
        {filteredEvents.map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => setStoredActiveId(event.id)}
            data-testid="bbti-arena-event-card"
            data-bbti-arena-event-id={event.id}
            data-bbti-arena-event-active={active.id === event.id ? "true" : "false"}
            data-bbti-arena-event-today={event.id === todayEventId ? "true" : "false"}
            className={`rounded-xl border px-2 py-2 text-center transition-colors cursor-pointer ${
              active.id === event.id
                ? "border-kobe-gold bg-kobe-gold text-black"
                : "border-white/10 bg-white/[0.03] text-white/48 hover:text-white/78"
            }`}
          >
            <span className="flex min-h-[14px] items-center justify-center gap-1 text-[9px] font-black uppercase">
              <span>{event.tag}</span>
              {event.id === todayEventId && (
                <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[8px]">
                  今日
                </span>
              )}
            </span>
            <span className="block text-[11px] font-bold mt-0.5">{event.title}</span>
            <span className="mt-0.5 block truncate text-[9px] font-bold opacity-58">{event.stakes}</span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-black text-white">{active.title}</p>
            <p className="mt-1 text-[11px] font-bold text-white/35">
              {activeContextMeta?.label ?? "情境"} · {active.court} · {active.stakes}
            </p>
          </div>
          {isTodayEvent && (
            <span className="shrink-0 rounded-full border border-lebron-gold/30 bg-lebron-wine/16 px-2 py-1 text-[10px] font-black text-lebron-gold">
              今日上场
            </span>
          )}
        </div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {[
            BBTI_ARENA_VENUE_LABELS[active.venue],
            BBTI_ARENA_PRESSURE_LABELS[active.pressureTier],
            BBTI_ARENA_AUDIENCE_FRAME_LABELS[active.audienceFrame],
          ].map((label) => (
            <span
              key={label}
              className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 text-[10px] font-bold text-white/42"
            >
              {label}
            </span>
          ))}
        </div>
        <div className="mb-3 flex flex-col gap-2 border-y border-white/10 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/28">
              分享同步
            </p>
            {matchingChallenge ? (
              <div className="mt-0.5">
                <p className="text-xs font-black text-white/68">
                  已写入分享战术板 · {matchingChallenge.title}
                </p>
                <p className="mt-0.5 text-[11px] font-bold text-white/36">
                  链接会带回这场 {active.tag} 加赛
                </p>
              </div>
            ) : (
              <p className="mt-0.5 text-xs font-black text-white/46">
                仅保留事件题 · 暂未挂上推荐对线
              </p>
            )}
          </div>
          {matchingChallenge && (
            <button
              type="button"
              onClick={scrollToShareKit}
              className="shrink-0 rounded-full border border-lebron-gold/30 bg-lebron-wine/12 px-3 py-1.5 text-[11px] font-black text-lebron-gold transition-colors hover:bg-lebron-wine/20 cursor-pointer"
            >
              查看分享包
            </button>
          )}
        </div>
        <p className="text-xs text-white/55 leading-relaxed mb-3">{active.scenario}</p>

        {eventBracket && (
          <div
            className="mb-3 rounded-xl border border-sky-200/15 bg-sky-200/[0.045] p-3"
            data-testid="bbti-arena-event-bracket"
            data-bbti-arena-event-bracket-version={eventBracket.version}
            data-bbti-arena-event-bracket-code={eventBracket.code}
            data-bbti-arena-event-bracket-event={eventBracket.eventId}
            data-bbti-arena-event-bracket-challenge={eventBracket.challengeMatchupId}
            data-bbti-arena-event-bracket-category={eventBracket.recommendedCategory}
            data-bbti-arena-event-bracket-count={eventBracket.routeCount}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-sky-100/70">
                情境路线树
              </p>
              <span className="rounded-full border border-sky-100/15 px-2 py-0.5 text-[9px] font-black text-sky-100/45">
                3-Step
              </span>
            </div>
            <div className="grid gap-2">
              {eventBracket.routes.map((route, index) => (
                <div
                  key={route.id}
                  className="rounded-lg border border-white/10 bg-black/18 p-2.5"
                  data-testid="bbti-arena-event-bracket-route"
                  data-bbti-arena-event-bracket-route={route.id}
                  data-bbti-arena-event-bracket-target={route.target}
                  data-bbti-arena-event-bracket-position={index + 1}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-sky-100/45">
                        {route.label}
                      </p>
                      <p className="mt-0.5 text-xs font-black text-white/78">
                        {route.title}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleBracketAction(route.id)}
                      className="shrink-0 rounded-full border border-sky-100/15 bg-white/[0.035] px-2.5 py-1 text-[10px] font-black text-sky-100/70 transition-colors hover:bg-sky-100/10 hover:text-white cursor-pointer"
                      data-testid="bbti-arena-event-bracket-action"
                      data-bbti-arena-event-bracket-action={route.id}
                      data-bbti-arena-event-bracket-action-target={route.target}
                    >
                      {route.ctaLabel}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] font-bold leading-relaxed text-white/48">
                    {route.body}
                  </p>
                </div>
              ))}
            </div>
            <p
              className="mt-2 text-[10px] font-bold leading-relaxed text-white/34"
              data-testid="bbti-arena-event-bracket-boundary"
            >
              {eventBracket.boundary}
            </p>
          </div>
        )}

        <div className="space-y-2">
          {[
            { label: "本能反应", value: active.instinct },
            { label: "压力测试", value: active.pressureTest },
            { label: "盲点提醒", value: active.blindSpot },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-white/[0.03] px-3 py-2">
              <p className="text-[10px] font-black text-kobe-gold/75 uppercase tracking-widest mb-1">
                {item.label}
              </p>
              <p className="text-xs sm:text-sm text-white/72 leading-relaxed">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-lg border border-lebron-gold/20 bg-lebron-wine/12 px-3 py-2">
          <p className="text-[10px] font-black text-lebron-gold/80 uppercase tracking-widest mb-1">
            群聊题
          </p>
          <p className="text-xs sm:text-sm font-bold text-white/82 leading-relaxed">
            {prompt}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={copyPrompt}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-black text-white/65 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            {failed ? "复制失败，可手动复制" : copied ? "已复制群聊题" : "复制群聊题"}
          </button>
          {activeChallenge && (
            <button
              type="button"
              onClick={() => onChallengeMatchup(activeChallenge.matchupId, eventCaseContext)}
              className="rounded-full bg-gradient-to-r from-kobe-gold to-lebron-gold px-4 py-2.5 text-xs font-black text-black hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              拿这个题开战：{activeChallenge.title}
            </button>
          )}
        </div>

        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {copied ? "已复制情境加赛群聊题" : failed ? "情境加赛群聊题自动复制失败，可手动复制" : ""}
        </p>

        <BbtiManualCopyFallback
          text={copyFeedback.feedback.manualCopyText}
          title="自动复制失败，长按下方情境群聊题复制。"
          className="mt-3"
        />
      </div>
    </div>
  );
}
