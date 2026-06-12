"use client";

import { type Ref, useCallback, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { BbtiChallengeCaseContext } from "@/data/bbti-challenge-case";
import type { BbtiChallengeReplaySeeds as BbtiChallengeReplaySeedsModel } from "@/data/bbti-challenge-replay-seeds";
import {
  resolveBbtiShareReturnPrompt,
  type BbtiShareReturnPrompt,
} from "@/data/bbti-share-return-prompts";
import { hydrateBbtiSharedChallenge } from "@/data/bbti-shared-challenge-hydration";
import { getMatchupById, type Matchup } from "@/data/matchups";
import { parseBbtiDeepLink } from "@/lib/bbti-deep-links";
import BbtiChallengeReplaySeeds from "./BbtiChallengeReplaySeeds";

interface BbtiDeepLinkNoticeProps {
  code: string;
  onChallengeMatchup: (matchupId: string, caseContext?: BbtiChallengeCaseContext | null) => void;
}

interface NoticeState {
  clipFallbackLine: string | null;
  eventTitle: string | null;
  sourceLabel: string;
  pressureLine: string | null;
  matchup: Matchup;
  caseContext: BbtiChallengeCaseContext | null;
  replaySeeds: BbtiChallengeReplaySeedsModel;
  canonicalKey: string;
}

interface BbtiDeepLinkNoticeCardIds {
  clipFallbackId: string;
  collapsedHeadingId: string;
  descriptionId: string;
  headingId: string;
  pressureId: string;
  previewId: string;
}

interface BbtiDeepLinkNoticeCardProps {
  describedBy: string;
  ids: BbtiDeepLinkNoticeCardIds;
  isDismissed: boolean;
  notice: NoticeState;
  noticeRef?: Ref<HTMLElement>;
  onChallengeMatchup: (matchupId: string, caseContext?: BbtiChallengeCaseContext | null) => void;
  onDismissNotice: () => void;
  onRestoreNotice: () => void;
  prefersReducedMotion: boolean;
  prompt: BbtiShareReturnPrompt;
}

const EMPTY_NOTICE = "";
const DISMISSED_NOTICE_STORAGE_KEY = "bbti.dismissedDeepLinkNotices.v4";
const MAX_DISMISSED_NOTICE_KEYS = 24;
const RESTORE_FOCUS_DELAY_MS = 40;
const RESTORE_BUTTON_ID = "bbti-restore-shared-challenge";
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function subscribeToLocation() {
  return () => {};
}

function subscribeToReducedMotion(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function readReducedMotionSnapshot(): boolean {
  return typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

function readDismissedNoticeKeys(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(DISMISSED_NOTICE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeDismissedNoticeKeys(keys: string[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      DISMISSED_NOTICE_STORAGE_KEY,
      JSON.stringify(keys.slice(0, MAX_DISMISSED_NOTICE_KEYS)),
    );
  } catch {
    // Dismissal is a convenience only; private-mode storage failures should not block the CTA.
  }
}

function encodeDismissKeyPart(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? "";
  return trimmed ? encodeURIComponent(trimmed).slice(0, 160) : "";
}

function buildDismissKey(input: {
  code: string;
  matchupId: string;
  eventId?: string | null;
  clipState?: string | null;
}): string {
  return [
    encodeDismissKeyPart(input.code),
    encodeDismissKeyPart(input.matchupId),
    encodeDismissKeyPart(input.eventId) || "-",
    encodeDismissKeyPart(input.clipState) || "none",
  ].join("|");
}

function clipDismissKeyPart(rawClip: string | null, clipKey: string | null): string {
  if (clipKey) return `valid:${clipKey}`;
  return rawClip ? "invalid" : "none";
}

function clipFallbackLineFor(rawClip: string | null, clipKey: string | null): string | null {
  if (!rawClip || clipKey) return null;
  const normalized = rawClip.trim().toLowerCase();

  if (/^(?:q)?\d+$/.test(normalized)) {
    return "这条录像室链接缺少具体选择，只能先按当前加赛来源接入。";
  }

  return "这条录像室 clip 标记无法识别，已按当前加赛来源接入。";
}

function findNextFocusableAfter(element: HTMLElement | null): HTMLElement | null {
  if (!element || typeof document === "undefined") return null;

  const focusableElements = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return focusableElements.find((candidate) => {
    if (element.contains(candidate)) return false;
    if (candidate.closest("[hidden], [inert], [aria-hidden='true']")) return false;
    const styles = window.getComputedStyle(candidate);
    if (styles.display === "none" || styles.visibility === "hidden") return false;
    if (candidate.getClientRects().length === 0) return false;
    return Boolean(element.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING);
  }) ?? null;
}

function focusResultFallback() {
  if (typeof document === "undefined") return;

  const fallback = document.getElementById("bbti-card");
  if (fallback instanceof HTMLElement) {
    fallback.focus({ preventScroll: true });
  }
}

function focusElementById(id: string) {
  if (typeof document === "undefined") return;

  const element = document.getElementById(id);
  if (element instanceof HTMLElement) {
    element.focus({ preventScroll: true });
  }
}

function readNoticeSnapshot(code: string): string {
  if (typeof window === "undefined") return EMPTY_NOTICE;

  const deepLink = parseBbtiDeepLink(window.location.search);
  if (deepLink.code !== code || !deepLink.challengeMatchupId) return EMPTY_NOTICE;

  const matchup = getMatchupById(deepLink.challengeMatchupId);
  if (!matchup) return EMPTY_NOTICE;

  return [
    matchup.id,
    deepLink.eventId ?? "",
    deepLink.clipKey ?? "",
    deepLink.hasClipParam ? deepLink.rawClip ?? "" : "",
  ].join("\n");
}

export function BbtiDeepLinkNoticeCard({
  describedBy,
  ids,
  isDismissed,
  notice,
  noticeRef,
  onChallengeMatchup,
  onDismissNotice,
  onRestoreNotice,
  prefersReducedMotion,
  prompt,
}: BbtiDeepLinkNoticeCardProps) {
  const qaSource = notice.caseContext?.source ?? "plain";
  const qaSourceVersion = notice.caseContext?.caseSourceVersion ?? "none";

  if (isDismissed) {
    return (
      <section
        data-testid="bbti-deep-link-notice"
        data-bbti-notice-state="collapsed"
        data-bbti-source={qaSource}
        data-bbti-source-version={qaSourceVersion}
        data-bbti-clip-fallback={notice.clipFallbackLine ? "true" : "false"}
        aria-labelledby={ids.collapsedHeadingId}
        className="w-full max-w-lg rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 mb-6"
        style={prefersReducedMotion ? undefined : {
          animation: "fade-up 0.28s ease-out both",
        }}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 id={ids.collapsedHeadingId} className="truncate text-xs font-black text-white/62">
              已隐藏加赛提示 · {notice.matchup.title}
            </h2>
            <p className="mt-0.5 truncate text-[10px] font-bold text-white/32">
              {prompt.collapsedDescription}
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-1.5 sm:w-auto sm:grid-cols-2">
            <button
              id={RESTORE_BUTTON_ID}
              data-testid="bbti-deep-link-restore"
              type="button"
              onClick={onRestoreNotice}
              className="min-h-[44px] rounded-full border border-kobe-gold/25 bg-kobe-gold/10 px-4 py-2 text-xs font-black text-kobe-gold transition-colors hover:bg-kobe-gold/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kobe-gold"
            >
              显示加赛提示
            </button>
            <button
              data-testid="bbti-deep-link-cta"
              type="button"
              aria-label={`${prompt.ctaLabel}：${notice.matchup.title}`}
              onClick={() => onChallengeMatchup(notice.matchup.id, notice.caseContext)}
              className="min-h-[44px] rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-black text-white/48 transition-colors hover:bg-white/[0.07] hover:text-white/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
            >
              {prompt.ctaLabel}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={noticeRef}
      data-testid="bbti-deep-link-notice"
      data-bbti-notice-state="expanded"
      data-bbti-source={qaSource}
      data-bbti-source-version={qaSourceVersion}
      data-bbti-clip-fallback={notice.clipFallbackLine ? "true" : "false"}
      aria-labelledby={ids.headingId}
      aria-describedby={describedBy}
      className="relative w-full max-w-lg rounded-2xl border border-kobe-gold/25 bg-kobe-gold/10 p-4 pr-14 sm:p-5 sm:pr-16 mb-6"
      style={prefersReducedMotion ? undefined : {
        animation: "fade-up 0.5s ease-out 0.72s both",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-kobe-gold/80 mb-1">
            {notice.sourceLabel}
          </p>
          <h2 id={ids.headingId} tabIndex={-1} className="text-lg font-black text-white break-words outline-none">
            有人把这场加赛发给你：{notice.matchup.title}
          </h2>
          <p id={ids.descriptionId} className="mt-1 text-xs text-white/58 leading-relaxed">
            {prompt.description}
          </p>
          {notice.pressureLine && (
            <p id={ids.pressureId} className="mt-2 text-xs font-bold text-kobe-gold/75 leading-relaxed">
              {notice.pressureLine}
            </p>
          )}
          {notice.clipFallbackLine && (
            <p
              id={ids.clipFallbackId}
              className="mt-2 rounded-xl border border-white/10 bg-black/18 px-3 py-2 text-[11px] font-bold leading-relaxed text-white/42"
            >
              {notice.clipFallbackLine}
            </p>
          )}
          {prompt.metaChips.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {prompt.metaChips.slice(0, 4).map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/10 bg-white/[0.055] px-2 py-0.5 text-[10px] font-black text-white/52"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
          {prompt.evidenceChips.length ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {prompt.evidenceChips.slice(0, 4).map((lens) => (
                <span
                  key={lens}
                  className="rounded-full border border-kobe-gold/20 bg-kobe-gold/10 px-2 py-0.5 text-[10px] font-bold text-kobe-gold/70"
                >
                  {lens}
                </span>
              ))}
            </div>
          ) : !notice.caseContext ? (
            <p className="mt-2 text-xs text-white/38 leading-relaxed">
              这是普通约战链接，进场后不会附带赛后报告案由。
            </p>
          ) : null}
          {prompt.previewLines.length > 0 && (
            <div
              id={ids.previewId}
              data-testid="bbti-deep-link-preview"
              data-bbti-preview-label={prompt.previewLabel}
              className="mt-3 rounded-xl border border-kobe-gold/15 bg-black/18 p-3"
            >
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-kobe-gold/60">
                {prompt.previewLabel}
              </p>
              {prompt.previewLines.slice(0, 2).map((line) => (
                <p key={line} className="text-xs font-bold leading-relaxed text-white/62">
                  {line}
                </p>
              ))}
            </div>
          )}
          <BbtiChallengeReplaySeeds
            compact
            seeds={notice.replaySeeds}
            className="mt-3"
          />
        </div>
        <button
          data-testid="bbti-deep-link-cta"
          type="button"
          aria-label={`${prompt.ctaLabel}：${notice.matchup.title}`}
          onClick={() => onChallengeMatchup(notice.matchup.id, notice.caseContext)}
          className="min-h-[44px] shrink-0 rounded-full bg-gradient-to-r from-kobe-gold to-lebron-gold px-5 py-2.5 text-xs font-black text-black transition-transform hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kobe-gold cursor-pointer"
        >
          {prompt.ctaLabel}
        </button>
      </div>
      <button
        data-testid="bbti-deep-link-dismiss"
        type="button"
        aria-label="隐藏这条加赛提示"
        title="隐藏这条加赛提示"
        onClick={onDismissNotice}
        className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full border border-kobe-gold/20 bg-black/18 text-base font-black text-kobe-gold/60 transition-colors hover:bg-black/28 hover:text-kobe-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kobe-gold sm:right-3 sm:top-3"
      >
        ×
      </button>
    </section>
  );
}

export default function BbtiDeepLinkNotice({
  code,
  onChallengeMatchup,
}: BbtiDeepLinkNoticeProps) {
  const noticeRef = useRef<HTMLElement | null>(null);
  const headingId = useId();
  const descriptionId = useId();
  const pressureId = useId();
  const clipFallbackId = useId();
  const previewId = useId();
  const collapsedHeadingId = useId();
  const [dismissedNoticeKeys, setDismissedNoticeKeys] = useState(() => readDismissedNoticeKeys());
  const snapshot = useSyncExternalStore(
    subscribeToLocation,
    () => readNoticeSnapshot(code),
    () => EMPTY_NOTICE,
  );
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    readReducedMotionSnapshot,
    () => false,
  );
  const notice = useMemo<NoticeState | null>(() => {
    if (!snapshot) return null;
    const [matchupId, eventId = "", clipKey = "", rawClip = ""] = snapshot.split("\n");
    const canonicalKey = buildDismissKey({
      code,
      matchupId,
      eventId,
      clipState: clipDismissKeyPart(rawClip, clipKey),
    });

    const matchup = getMatchupById(matchupId);
    if (!matchup) return null;

    const hydrated = hydrateBbtiSharedChallenge({
      code,
      challengeMatchupId: matchupId,
      eventId,
      clipKey,
    });
    if (!hydrated.challengeReplaySeeds) return null;

    return {
      clipFallbackLine: clipFallbackLineFor(rawClip, clipKey),
      eventTitle: hydrated.event?.title ?? null,
      sourceLabel: hydrated.sourceLabel,
      pressureLine: hydrated.pressureLine,
      matchup,
      caseContext: hydrated.caseContext,
      replaySeeds: hydrated.challengeReplaySeeds,
      canonicalKey,
    };
  }, [code, snapshot]);

  const isDismissed = Boolean(notice && dismissedNoticeKeys.includes(notice.canonicalKey));

  const dismissNotice = useCallback(() => {
    if (!notice?.canonicalKey) return;

    setDismissedNoticeKeys((currentKeys) => {
      const nextKeys = [
        notice.canonicalKey,
        ...currentKeys.filter((key) => key !== notice.canonicalKey),
      ].slice(0, MAX_DISMISSED_NOTICE_KEYS);
      writeDismissedNoticeKeys(nextKeys);
      return nextKeys;
    });

    window.requestAnimationFrame(() => {
      const restoreButton = document.getElementById(RESTORE_BUTTON_ID);
      if (restoreButton instanceof HTMLElement) {
        restoreButton.focus();
      } else {
        const nextFocusable = findNextFocusableAfter(noticeRef.current);
        if (nextFocusable) {
          nextFocusable.focus();
        } else {
          focusResultFallback();
        }
      }
    });
  }, [notice]);

  const restoreNotice = useCallback(() => {
    if (!notice?.canonicalKey) return;

    setDismissedNoticeKeys((currentKeys) => {
      const nextKeys = currentKeys.filter((key) => key !== notice.canonicalKey);
      writeDismissedNoticeKeys(nextKeys);
      return nextKeys;
    });

    window.setTimeout(() => focusElementById(headingId), RESTORE_FOCUS_DELAY_MS);
  }, [headingId, notice]);

  if (!notice) return null;

  const prompt = resolveBbtiShareReturnPrompt(notice.caseContext, notice.eventTitle);
  const describedBy = [
    descriptionId,
    notice.pressureLine ? pressureId : null,
    notice.clipFallbackLine ? clipFallbackId : null,
    prompt.previewLines.length > 0 ? previewId : null,
  ].filter(Boolean).join(" ");

  return (
    <BbtiDeepLinkNoticeCard
      describedBy={describedBy}
      ids={{
        clipFallbackId,
        collapsedHeadingId,
        descriptionId,
        headingId,
        pressureId,
        previewId,
      }}
      isDismissed={isDismissed}
      notice={notice}
      noticeRef={noticeRef}
      onChallengeMatchup={onChallengeMatchup}
      onDismissNotice={dismissNotice}
      onRestoreNotice={restoreNotice}
      prefersReducedMotion={prefersReducedMotion}
      prompt={prompt}
    />
  );
}
