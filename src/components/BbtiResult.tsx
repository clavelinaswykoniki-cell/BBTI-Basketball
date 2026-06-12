"use client";

import { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from "react";
import { getBbtiType, scoreBbtiAnswers, type BbtiAnswer } from "../data/bbti";
import {
  BBTI_LAST_RESULT_STORAGE_KEY,
  getBbtiPlaybook,
  resolveBbtiResultScoutingCopyKit,
  type BbtiResultScoutingReport as BbtiResultScoutingReportData,
  type StoredBbtiResult,
} from "@/data/bbti-playbook";
import type { BbtiChallengeCaseContext } from "@/data/bbti-challenge-case";
import { getBbtiChallengeMatchups, type BbtiChallengeMatchup } from "@/data/bbti-challenges";
import { getBbtiDailyReturnPlay } from "@/data/bbti-daily-return";
import {
  resolveBbtiNextPlayActions,
  type BbtiIncomingReturnSource,
  type BbtiNextPlayActionId,
} from "@/data/bbti-next-play";
import { getBbtiShareKits } from "@/data/bbti-share-kits";
import { hydrateBbtiSharedChallenge } from "@/data/bbti-shared-challenge-hydration";
import MyTeamResultCard from "./MyTeamResultCard";
import BbtiAnswerPollTrend, {
  buildBbtiAnswerPollTrendReads,
  resolveBbtiAnswerPollTrendSummary,
} from "./BbtiAnswerPollTrend";
import BbtiArenaEvents, { type BbtiArenaShareEvent } from "./BbtiArenaEvents";
import BbtiAddFilesSuggestionPanel from "./BbtiAddFilesSuggestionPanel";
import BbtiChallengeReceiptBoard from "./BbtiChallengeReceiptBoard";
import BbtiDeepLinkNotice from "./BbtiDeepLinkNotice";
import BbtiFilmRoomClips from "./BbtiFilmRoomClips";
import BbtiLineupChemistry from "./BbtiLineupChemistry";
import BbtiNextPlayPanel from "./BbtiNextPlayPanel";
import BbtiPersonaExtension from "./BbtiPersonaExtension";
import BbtiResultActionDock from "./BbtiResultActionDock";
import BbtiShareCard from "./BbtiShareCard";
import BbtiShareKits from "./BbtiShareKits";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";
import { buildBbtiCompareInviteUrl, buildBbtiCompareUrl, parseBbtiDeepLink } from "@/lib/bbti-deep-links";
import {
  clearPendingBbtiCompareInvite,
  readPendingBbtiCompareInvite,
  type PendingBbtiCompareInvite,
} from "@/lib/bbti-session";
import { scrollToSection } from "@/lib/scroll-to-section";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";

// ── Dimension config (single source of truth) ───────────────────────────
const DIMENSIONS = [
  {
    pos: 0,
    letters: ["O", "D"] as const,
    labels: ["进攻", "防守"],
    colors: ["bg-orange-500", "bg-blue-500"],
    textColors: ["text-orange-400", "text-blue-400"],
    barColor: ["from-orange-500 to-orange-400", "from-blue-500 to-blue-400"],
    key: "OD",
  },
  {
    pos: 1,
    letters: ["A", "E"] as const,
    labels: ["数据", "情怀"],
    colors: ["bg-green-500", "bg-pink-500"],
    textColors: ["text-green-400", "text-pink-400"],
    barColor: ["from-green-500 to-green-400", "from-pink-500 to-pink-400"],
    key: "AE",
  },
  {
    pos: 2,
    letters: ["I", "T"] as const,
    labels: ["个人", "团队"],
    colors: ["bg-purple-500", "bg-teal-500"],
    textColors: ["text-purple-400", "text-teal-400"],
    barColor: ["from-purple-500 to-purple-400", "from-teal-500 to-teal-400"],
    key: "IT",
  },
  {
    pos: 3,
    letters: ["L", "R"] as const,
    labels: ["忠诚", "冠军"],
    colors: ["bg-yellow-500", "bg-gray-400"],
    textColors: ["text-yellow-400", "text-gray-400"],
    barColor: ["from-yellow-500 to-yellow-400", "from-gray-400 to-gray-300"],
    key: "LR",
  },
] as const;

// ── Confetti (reused from Result.tsx) ────────────────────────────────────
const CONFETTI_COLORS = ["#FDB927", "#552583", "#860038", "#FDBB30", "#ffffff", "#FFD700"];
const CONFETTI_PIECES = Array.from({ length: 28 }, (_, i) => ({
  left: `${3 + (i * 3.4) % 94}%`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: `${(i * 0.12) % 2}s`,
  duration: `${2.5 + (i % 4) * 0.5}s`,
}));

const BBTI_BADGE_TONES = ["gold", "purple", "blue"] as const;

// ── Helpers ──────────────────────────────────────────────────────────────

/** Compute per-dimension percentage from answers by replaying the scoring logic. Falls back to 75/25. */
function computeDimensionPercents(answers: BbtiAnswer[]): number[] {
  const result = scoreBbtiAnswers(answers);
  return [
    result.percentages.OD,
    result.percentages.AE,
    result.percentages.IT,
    result.percentages.LR,
  ];
}

interface BbtiResultScoutingReportProps {
  report: BbtiResultScoutingReportData;
}

export function BbtiResultScoutingReport({ report }: BbtiResultScoutingReportProps) {
  const copyFeedback = useGuardedClipboard<string>();
  const copyKit = useMemo(() => resolveBbtiResultScoutingCopyKit(report), [report]);
  const copyKitActionId = "result-scouting-copy-kit";

  return (
    <section
      id="bbti-scouting"
      data-testid="bbti-result-scouting-report"
      data-bbti-result-scouting-version={report.version}
      data-bbti-result-scouting-code={report.code}
      data-bbti-result-scouting-count={report.laneCount}
      className="w-full max-w-lg scroll-mt-[var(--bbti-action-dock-offset,9rem)] rounded-2xl glass p-5 sm:p-6 mb-6"
      style={{
        animation: "fade-up 0.5s ease-out",
        animationDelay: "0.8s",
        animationFillMode: "both",
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-1">
            Scouting Report
          </p>
          <h2 className="text-xl font-black text-white">
            四维球探复盘
          </h2>
          <p className="mt-1 text-xs font-bold leading-relaxed text-white/42">
            {report.code} · {report.typeName} 的打法倾向、训练提醒和盲点。
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-[10px] font-black text-sky-100/70">
          {report.laneCount} LANES
        </span>
      </div>

      <div className="grid gap-2.5">
        {report.lanes.map((lane, index) => {
          const dim = DIMENSIONS.find((item) => item.key === lane.axisKey) ?? DIMENSIONS[0];
          const isFirst = lane.chosenLetter === dim.letters[0];
          const pct = lane.score;

          return (
            <article
              key={lane.id}
              data-testid="bbti-result-scouting-lane"
              data-bbti-result-scouting-lane={lane.id}
              data-bbti-result-scouting-axis={lane.axisKey}
              data-bbti-result-scouting-target={lane.target}
              data-bbti-result-scouting-letter={lane.chosenLetter}
              data-bbti-result-scouting-score={lane.score}
              data-bbti-result-scouting-position={index + 1}
              className="rounded-xl border border-white/10 bg-black/18 p-3"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-sky-100/45">
                    {lane.badge}
                  </p>
                  <h3 className="mt-0.5 text-sm font-black text-white">
                    {lane.chosenLetter} · {lane.chosenLabel}
                  </h3>
                </div>
                <span className="shrink-0 rounded-full border border-kobe-gold/20 bg-kobe-gold/10 px-2 py-0.5 text-[10px] font-black text-kobe-gold/80">
                  {lane.score}%
                </span>
              </div>

              <div className="mb-2">
                <div className="mb-1 flex items-center justify-between text-[10px] font-bold">
                  <span className={isFirst ? dim.textColors[0] : "text-white/30"}>
                    {dim.labels[0]}
                  </span>
                  <span className={!isFirst ? dim.textColors[1] : "text-white/30"}>
                    {dim.labels[1]}
                  </span>
                </div>
                <div className="relative h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`absolute inset-y-0 ${isFirst ? "left-0 bg-gradient-to-r" : "right-0 bg-gradient-to-l"} ${isFirst ? dim.barColor[0] : dim.barColor[1]} rounded-full`}
                    style={{ width: `${pct}%` }}
                  />
                  <div
                    className="absolute top-1/2 z-10 h-2.5 w-2.5 rounded-full border-2 border-white/80 bg-white shadow-lg"
                    style={{
                      left: isFirst ? `${pct}%` : `${100 - pct}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </div>
              </div>

              <p className="text-xs font-black leading-relaxed text-white/78">
                {lane.headline}
              </p>
              <p className="mt-1 text-[11px] font-bold leading-relaxed text-white/50">
                {lane.read}
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-white/8 bg-white/[0.03] p-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/28">
                    Workout
                  </p>
                  <p className="mt-1 text-[11px] font-bold leading-relaxed text-white/62">
                    {lane.workout}
                  </p>
                </div>
                <div className="rounded-lg border border-white/8 bg-white/[0.03] p-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/28">
                    Counter
                  </p>
                  <p className="mt-1 text-[11px] font-bold leading-relaxed text-white/62">
                    {lane.risk}
                  </p>
                </div>
              </div>
              <div className="mt-2 rounded-lg border border-sky-200/10 bg-sky-200/[0.035] p-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-sky-100/35">
                  Evidence
                </p>
                <div className="mt-1 grid gap-1">
                  {(lane.evidence.length ? lane.evidence : ["本地答题倾向形成这一轴读法。"]).map((item, evidenceIndex) => (
                    <p
                      key={`${lane.id}-${evidenceIndex}`}
                      data-testid="bbti-result-scouting-evidence"
                      data-bbti-result-scouting-evidence-axis={lane.axisKey}
                      data-bbti-result-scouting-evidence-position={evidenceIndex + 1}
                      className="text-[11px] font-bold leading-relaxed text-white/56"
                    >
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div
        className="mt-3 rounded-xl border border-kobe-gold/18 bg-kobe-gold/[0.055] p-3"
        data-testid="bbti-result-scouting-copy-kit"
        data-bbti-result-scouting-copy-kit-version={copyKit.version}
        data-bbti-result-scouting-copy-kit-source-version={copyKit.sourceReportVersion}
        data-bbti-result-scouting-copy-kit-code={copyKit.code}
        data-bbti-result-scouting-copy-kit-count={copyKit.itemCount}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-kobe-gold/68">
              Scouting Copy Kit
            </p>
            <h3 className="mt-1 text-base font-black text-white">
              发群球探话术
            </h3>
            <p className="mt-1 text-xs font-bold leading-relaxed text-white/42">
              把四维复盘压成三句能接着反驳的回合提醒。
            </p>
          </div>
          <button
            type="button"
            onClick={() => copyFeedback.copyText(copyKit.copyText, copyKitActionId)}
            data-testid="bbti-result-scouting-copy-kit-action"
            data-bbti-result-scouting-copy-kit-action="copy-kit"
            className="min-h-[36px] shrink-0 rounded-full border border-kobe-gold/20 bg-white/[0.04] px-3 py-2 text-[11px] font-black text-kobe-gold/75 transition-colors hover:bg-kobe-gold/10 hover:text-white"
          >
            {copyFeedback.isFailed(copyKitActionId)
              ? "复制失败"
              : copyFeedback.isCopied(copyKitActionId)
                ? "已复制"
                : "复制整包"}
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {copyKit.items.map((item, index) => {
            const itemCopied = copyFeedback.isCopied(item.id);
            const itemFailed = copyFeedback.isFailed(item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => copyFeedback.copyText(item.copyText, item.id)}
                className="min-h-[118px] rounded-lg border border-white/10 bg-black/18 p-3 text-left transition-colors hover:border-kobe-gold/35 hover:bg-kobe-gold/10"
                data-testid="bbti-result-scouting-copy-kit-item"
                data-bbti-result-scouting-copy-kit-item={item.id}
                data-bbti-result-scouting-copy-kit-target={item.target}
                data-bbti-result-scouting-copy-kit-source-lane={item.sourceLaneId}
                data-bbti-result-scouting-copy-kit-source-axis={item.sourceAxis}
                data-bbti-result-scouting-copy-kit-position={index + 1}
                data-bbti-result-scouting-copy-kit-action="copy"
              >
                <span className="text-[10px] font-black text-kobe-gold/65">
                  {item.label}
                </span>
                <span className="mt-1 block text-xs font-black leading-snug text-white/80">
                  {item.title}
                </span>
                <span className="mt-1 line-clamp-3 block text-[11px] font-bold leading-relaxed text-white/48">
                  {item.body}
                </span>
                <span className="mt-2 block text-[10px] font-black text-kobe-gold/58">
                  {itemFailed ? "复制失败" : itemCopied ? "已复制" : "复制话术"}
                </span>
              </button>
            );
          })}
        </div>

        <p
          data-testid="bbti-result-scouting-copy-kit-boundary"
          className="mt-2 text-[10px] font-bold leading-relaxed text-white/34"
        >
          {copyKit.boundary}
        </p>
      </div>

      <p
        data-testid="bbti-result-scouting-boundary"
        className="mt-3 text-[10px] font-bold leading-relaxed text-white/34"
      >
        {report.boundary}
      </p>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copyFeedback.feedback.status === "copied"
          ? "已复制球探话术"
          : copyFeedback.feedback.status === "failed"
            ? "球探话术自动复制失败，可手动复制"
            : ""}
      </p>
      <BbtiManualCopyFallback
        text={copyFeedback.feedback.manualCopyText}
        title="自动复制失败，长按下方球探话术复制。"
        className="mt-3"
      />
    </section>
  );
}

// ── Component ───────────────────────────────────────────────────────────

interface BbtiResultProps {
  code: string;
  answers: BbtiAnswer[];
  onRestart: () => void;
  onCompare: () => void;
  onChallengeMatchup: (matchupId: string, caseContext?: BbtiChallengeCaseContext | null) => void;
  onSwitchToDebate: () => void;
}

interface BbtiIncomingReturn {
  caseContext: BbtiChallengeCaseContext | null;
  matchupId: string;
  source: BbtiIncomingReturnSource;
  title: string;
}

const EMPTY_INCOMING_RETURN = "";

function subscribeToLocation() {
  return () => {};
}

function readIncomingReturnSnapshot(code: string): string {
  if (typeof window === "undefined") return EMPTY_INCOMING_RETURN;

  const deepLink = parseBbtiDeepLink(window.location.search);
  if (deepLink.code !== code || !deepLink.challengeMatchupId) return EMPTY_INCOMING_RETURN;

  return [
    deepLink.challengeMatchupId,
    deepLink.eventId ?? "",
    deepLink.clipKey ?? "",
  ].join("\n");
}

function hydrateBbtiIncomingReturn(
  code: string,
  challengeMatchups: BbtiChallengeMatchup[],
  snapshot: string,
): BbtiIncomingReturn | null {
  if (!snapshot) return null;

  const [challengeMatchupId, eventId = "", clipKey = ""] = snapshot.split("\n");

  const hydrated = hydrateBbtiSharedChallenge({
    code,
    challengeMatchupId,
    eventId,
    clipKey,
  });
  if (!hydrated.challenge) return null;

  const fallbackChallenge = challengeMatchups.find(
    (challenge) => challenge.matchupId === challengeMatchupId,
  );
  const challenge = hydrated.challenge ?? fallbackChallenge;
  const source: BbtiIncomingReturnSource = hydrated.caseContext?.source === "film-room"
    ? "film-room"
    : hydrated.caseContext?.source === "arena-event"
      ? "arena-event"
      : "result";
  const title = hydrated.caseContext?.source === "film-room"
    ? `Q${hydrated.caseContext.questionId} · ${challenge.title}`
    : hydrated.caseContext?.source === "arena-event"
      ? `${hydrated.caseContext.eventTag} · ${challenge.title}`
      : challenge.title;

  return {
    caseContext: hydrated.caseContext,
    matchupId: challenge.matchupId,
    source,
    title,
  };
}

export default function BbtiResult({
  code,
  answers,
  onRestart,
  onCompare,
  onChallengeMatchup,
  onSwitchToDebate,
}: BbtiResultProps) {
  const type = useMemo(() => getBbtiType(code), [code]);
  const playbook = useMemo(() => getBbtiPlaybook(code, answers), [code, answers]);
  const challengeMatchups = useMemo(() => getBbtiChallengeMatchups(code), [code]);
  const primaryChallenge = challengeMatchups[0];
  const dailyReturn = useMemo(() => getBbtiDailyReturnPlay(code), [code]);
  const incomingReturnSnapshot = useSyncExternalStore(
    subscribeToLocation,
    () => readIncomingReturnSnapshot(code),
    () => EMPTY_INCOMING_RETURN,
  );
  const [activeArenaShareEvent, setActiveArenaShareEvent] = useState<BbtiArenaShareEvent | null>(null);
  const [pendingCompareInvite, setPendingCompareInvite] = useState<PendingBbtiCompareInvite | null>(
    () => readPendingBbtiCompareInvite(),
  );
  const activeArenaShare = activeArenaShareEvent?.code === code ? activeArenaShareEvent : null;
  const pendingCompareType = pendingCompareInvite ? getBbtiType(pendingCompareInvite.codeA) : null;
  const updateActiveArenaShareEvent = useCallback((event: BbtiArenaShareEvent | null) => {
    setActiveArenaShareEvent(event);
  }, []);
  const incomingReturn = useMemo(
    () => hydrateBbtiIncomingReturn(code, challengeMatchups, incomingReturnSnapshot),
    [challengeMatchups, code, incomingReturnSnapshot],
  );

  const percents = useMemo(() => computeDimensionPercents(answers), [answers]);
  const letters = useMemo(() => code.split(""), [code]);
  const bbtiAttributes = useMemo(
    () => DIMENSIONS.map((dim, i) => {
      const letter = letters[i] ?? dim.letters[0];
      const isFirst = letter === dim.letters[0];
      return {
        key: dim.key,
        label: isFirst ? dim.labels[0] : dim.labels[1],
        value: percents[i] ?? 70,
      };
    }),
    [letters, percents],
  );
  const bbtiOverall = useMemo(
    () => Math.round(percents.reduce((sum, pct) => sum + pct, 0) / Math.max(percents.length, 1)),
    [percents],
  );
  const bbtiBadges = useMemo(
    () => type
      ? type.strengths.slice(0, 3).map((label, index) => ({
        label,
        tone: BBTI_BADGE_TONES[index] ?? "gold",
      }))
      : [],
    [type],
  );
  const shareKits = useMemo(
    () => type
      ? getBbtiShareKits({
        code,
        emoji: type.emoji,
        typeName: type.name,
        tagline: type.tagline,
        spiritPlayer: type.spiritPlayer,
        compatibility: type.compatibility,
        nemesis: type.nemesis,
        debateWeapon: playbook.debateWeapon,
        challengeTitle: playbook.challengeTitle,
        challengeCopy: primaryChallenge?.shareCopy ?? playbook.challengeCopy,
        challengeMatchupId: primaryChallenge?.matchupId,
        challengeMatchupTitle: primaryChallenge?.title,
        eventId: activeArenaShare?.eventId,
        eventTitle: activeArenaShare?.eventTitle,
        eventTag: activeArenaShare?.eventTag,
        eventScenario: activeArenaShare?.eventScenario,
        eventGroupChatPrompt: activeArenaShare?.eventGroupChatPrompt,
        eventCourt: activeArenaShare?.eventCourt,
        eventStakes: activeArenaShare?.eventStakes,
        eventChallengeMatchupId: activeArenaShare?.challengeMatchupId,
        eventChallengeMatchupTitle: activeArenaShare?.challengeTitle,
        eventChallengeCopy: activeArenaShare?.challengeCopy,
      })
      : [],
    [activeArenaShare, code, playbook.challengeCopy, playbook.challengeTitle, playbook.debateWeapon, primaryChallenge, type],
  );
  const nextPlayActions = useMemo(
    () => resolveBbtiNextPlayActions({
      dailyEvent: dailyReturn.event
        ? {
          title: dailyReturn.event.title,
          tag: dailyReturn.event.tag,
        }
        : null,
      hasFilmRoomClips: playbook.filmRoomClips.length > 0,
      incomingReturn: incomingReturn
        ? {
          source: incomingReturn.source,
          title: incomingReturn.title,
        }
        : null,
      pendingCompare: pendingCompareInvite && pendingCompareType
        ? {
          code: pendingCompareInvite.codeA,
          name: pendingCompareType.name,
        }
        : null,
      primaryChallengeTitle: primaryChallenge?.title,
    }),
    [
      dailyReturn.event,
      incomingReturn,
      pendingCompareInvite,
      pendingCompareType,
      playbook.filmRoomClips.length,
      primaryChallenge?.title,
    ],
  );
  const answerPollTrendSummary = useMemo(
    () => resolveBbtiAnswerPollTrendSummary(buildBbtiAnswerPollTrendReads(answers)),
    [answers],
  );

  useEffect(() => {
    if (!type || answers.length === 0) return;

    const payload: StoredBbtiResult = {
      code,
      name: type.name,
      emoji: type.emoji,
      mode: answers.length <= 12 ? "blitz" : answers.length >= 45 ? "full" : "quick",
      savedAt: new Date().toISOString(),
      challenge: playbook.challengeTitle,
    };

    try {
      localStorage.setItem(BBTI_LAST_RESULT_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Browsers can block storage in private contexts; the result screen still works.
    }
  }, [answers.length, code, playbook.challengeTitle, type]);

  // Confetti
  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Bail out if type not found
  if (!type) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-white/60 mb-4">未找到类型：{code}</p>
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-white/10 text-white rounded-full cursor-pointer hover:bg-white/20 transition-colors"
        >
          重新测试
        </button>
      </div>
    );
  }

  const openPrimaryChallenge = () => {
    if (primaryChallenge) {
      onChallengeMatchup(primaryChallenge.matchupId);
    } else {
      onChallengeMatchup("custom");
    }
  };

  const openPendingCompareReport = () => {
    if (!pendingCompareInvite) return;

    if (typeof window !== "undefined") {
      const baseHref = `${window.location.origin}${window.location.pathname}`;
      window.history.pushState(
        null,
        "",
        buildBbtiCompareUrl(pendingCompareInvite.codeA, code, baseHref),
      );
    }

    clearPendingBbtiCompareInvite();
    setPendingCompareInvite(null);
    onCompare();
  };

  const openCompareInvite = () => {
    if (pendingCompareInvite) {
      openPendingCompareReport();
      return;
    }

    if (typeof window !== "undefined") {
      const baseHref = `${window.location.origin}${window.location.pathname}`;
      window.history.pushState(null, "", buildBbtiCompareInviteUrl(code, baseHref));
    }
    onCompare();
  };

  const dismissPendingCompareInvite = () => {
    clearPendingBbtiCompareInvite();
    setPendingCompareInvite(null);
  };

  const openIncomingReturn = () => {
    if (!incomingReturn) {
      openPrimaryChallenge();
      return;
    }

    onChallengeMatchup(incomingReturn.matchupId, incomingReturn.caseContext);
  };

  const openDailyReturn = () => {
    if (dailyReturn.featuredChallenge) {
      onChallengeMatchup(dailyReturn.featuredChallenge.matchupId, dailyReturn.caseContext);
      return;
    }

    scrollToSection("bbti-arena-events");
  };

  const handleNextPlayAction = (actionId: BbtiNextPlayActionId) => {
    switch (actionId) {
      case "pending-compare":
        openPendingCompareReport();
        break;
      case "incoming-return":
        openIncomingReturn();
        break;
      case "daily-event":
        openDailyReturn();
        break;
      case "primary-challenge":
        openPrimaryChallenge();
        break;
      case "film-room":
        scrollToSection("bbti-film-room");
        break;
      case "share":
        scrollToSection("bbti-share");
        break;
    }
  };

  const handleNextPlaySecondaryAction = (actionId: BbtiNextPlayActionId) => {
    if (actionId === "pending-compare") {
      dismissPendingCompareInvite();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 relative overflow-hidden">
      {/* ── Confetti ── */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
          {CONFETTI_PIECES.map((c, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: c.left,
                backgroundColor: c.color,
                animationDelay: c.delay,
                animationDuration: c.duration,
              }}
            />
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          HERO CARD — the shareable screenshot
         ════════════════════════════════════════════════════════════════ */}
      <div
        id="bbti-card"
        tabIndex={-1}
        className="w-full max-w-lg scroll-mt-[var(--bbti-action-dock-offset,9rem)] rounded-2xl glass p-6 sm:p-8 mb-6"
        style={{ animation: "fade-up 0.5s ease-out" }}
      >
        {/* Code letter boxes */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
          {letters.map((letter, i) => {
            const dim = DIMENSIONS[i];
            const isFirst = letter === dim.letters[0];
            const bgColor = isFirst ? dim.colors[0] : dim.colors[1];
            return (
              <div
                key={i}
                className={`${bgColor} w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center`}
                style={{
                  animation: "fade-up 0.4s ease-out",
                  animationDelay: `${i * 0.15}s`,
                  animationFillMode: "both",
                }}
              >
                <span className="text-5xl sm:text-7xl font-black text-white drop-shadow-lg">
                  {letter}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dimension labels */}
        <div className="flex items-center justify-center gap-1 text-white/50 text-xs sm:text-sm mb-5">
          {letters.map((letter, i) => {
            const dim = DIMENSIONS[i];
            const isFirst = letter === dim.letters[0];
            const label = isFirst ? dim.labels[0] : dim.labels[1];
            return (
              <span key={i}>
                {i > 0 && <span className="mx-1">·</span>}
                {label}
              </span>
            );
          })}
        </div>

        {/* Type name + emoji */}
        <div
          className="text-center"
          style={{
            animation: "fade-up 0.5s ease-out",
            animationDelay: "0.6s",
            animationFillMode: "both",
          }}
        >
          <div className="text-5xl mb-2">{type.emoji}</div>
          <h1 className="text-3xl sm:text-4xl font-black text-white text-glow mb-2">
            {type.name}
          </h1>
          <p className="text-white/60 text-sm sm:text-base max-w-sm mx-auto">
            {type.tagline}
          </p>
        </div>
      </div>

      <BbtiDeepLinkNotice code={code} onChallengeMatchup={onChallengeMatchup} />

      <MyTeamResultCard
        tier={bbtiOverall >= 90 ? "darkMatter" : bbtiOverall >= 82 ? "galaxyOpal" : "pinkDiamond"}
        overall={bbtiOverall}
        code={code}
        title={type.name}
        subtitle={type.tagline}
        emoji={type.emoji}
        edition="BBTI SEASON 01"
        sideLabel="Basketball Brain Type Indicator"
        attributes={bbtiAttributes}
        badges={bbtiBadges}
        footerLeft={`灵魂球员 ${type.spiritPlayer}`}
        footerRight={`宿敌 ${type.nemesis}`}
        signature={playbook.debateWeapon}
        qaContext="bbti-result"
        qaTestId="bbti-myteam-scouting-card"
        qaVersion="bbti-myteam-result-card-v1"
      />

      <BbtiResultActionDock
        primaryChallengeTitle={primaryChallenge?.title}
        compareLabel={pendingCompareInvite ? "生成对比" : "双人对比"}
        onPrimaryChallenge={openPrimaryChallenge}
        onCustomChallenge={() => onChallengeMatchup("custom")}
        onCompare={openCompareInvite}
      />

      <BbtiNextPlayPanel
        actions={nextPlayActions}
        onAction={handleNextPlayAction}
        onSecondaryAction={handleNextPlaySecondaryAction}
      />

      <BbtiAddFilesSuggestionPanel
        code={code}
        typeName={type.name}
        hasFilmRoomClips={playbook.filmRoomClips.length > 0}
        hasPendingCompare={Boolean(pendingCompareInvite)}
        primaryChallengeTitle={primaryChallenge?.title}
      />

      <BbtiArenaEvents
        code={code}
        typeName={type.name}
        emoji={type.emoji}
        challengeMatchups={challengeMatchups}
        onChallengeMatchup={onChallengeMatchup}
        onActiveShareEvent={updateActiveArenaShareEvent}
      />

      <BbtiResultScoutingReport report={playbook.scoutingReport} />

      <BbtiAnswerPollTrend
        answers={answers}
        code={code}
        typeName={type.name}
        emoji={type.emoji}
      />

      {/* ════════════════════════════════════════════════════════════════
          PERSONALITY DESCRIPTION
         ════════════════════════════════════════════════════════════════ */}
      <div
        className="w-full max-w-lg rounded-2xl glass p-5 sm:p-6 mb-6"
        style={{
          animation: "fade-up 0.5s ease-out",
          animationDelay: "1.0s",
          animationFillMode: "both",
        }}
      >
        {/* Description */}
        <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-5">
          {type.description}
        </p>

        {/* Spirit Player */}
        <div className="rounded-xl bg-gradient-to-r from-kobe-purple/20 to-lebron-wine/20 border border-white/10 p-4 mb-5">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-1">灵魂球员</p>
          <p className="text-xl font-black text-kobe-gold mb-1">{type.spiritPlayer}</p>
          <p className="text-white/60 text-xs sm:text-sm leading-relaxed">{type.spiritPlayerWhy}</p>
        </div>

        {/* Strengths */}
        <div className="mb-4">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-2">优势</p>
          <div className="space-y-1.5">
            {type.strengths.map((s: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-sm text-white/80">
                <span className="shrink-0 mt-0.5">{"✅"}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-2">弱点</p>
          <div className="space-y-1.5">
            {type.weaknesses.map((w: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-sm text-white/80">
                <span className="shrink-0 mt-0.5">{"😅"}</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BbtiPersonaExtension code={code} />

      <BbtiLineupChemistry code={code} onCompare={onCompare} />

      {/* ════════════════════════════════════════════════════════════════
          PLAYBOOK — replay value and friend challenge
         ════════════════════════════════════════════════════════════════ */}
      <div
        className="w-full max-w-lg rounded-2xl glass p-5 sm:p-6 mb-6"
        style={{
          animation: "fade-up 0.5s ease-out",
          animationDelay: "1.3s",
          animationFillMode: "both",
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-1">
              赛后战术手册
            </p>
            <h2 className="text-xl font-black text-white">
              {playbook.arenaRole}
            </h2>
          </div>
          <span className="shrink-0 rounded-full border border-kobe-gold/30 px-3 py-1 text-[11px] font-bold text-kobe-gold">
            可对线
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {[
            { label: "对线武器", value: playbook.debateWeapon },
            { label: "补强训练", value: playbook.blindSpotDrill },
            { label: "组队适配", value: playbook.squadFit },
            { label: "下一回合挑战", value: playbook.nextPlayChallenge },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[11px] text-white/30 mb-1">{item.label}</p>
              <p className="text-xs sm:text-sm text-white/75 leading-relaxed">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2 mb-5">
          {playbook.axes.map((axis) => (
            <div key={axis.key} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-sm font-black text-white">
                  {axis.chosenLetter} · {axis.chosenLabel}
                </span>
                <span className="text-xs text-kobe-gold font-bold">{axis.score}%</span>
              </div>
              <p className="text-xs text-white/65 leading-relaxed">{axis.headline}：{axis.tactic}</p>
              <p className="text-[11px] text-white/35 mt-1">盲点：{axis.risk}</p>
            </div>
          ))}
        </div>

        <BbtiFilmRoomClips
          code={code}
          clips={playbook.filmRoomClips}
          primaryChallenge={primaryChallenge}
          challengeMatchups={challengeMatchups}
          onChallengeMatchup={onChallengeMatchup}
          typeName={type.name}
          emoji={type.emoji}
          trendSummary={answerPollTrendSummary}
        />

        <div className="mt-5 rounded-xl border border-lebron-gold/20 bg-lebron-wine/15 p-4">
          <p className="text-xs text-lebron-gold font-bold mb-1">{playbook.challengeTitle}</p>
          <p className="text-sm text-white/75 leading-relaxed">{playbook.challengeCopy}</p>
        </div>
      </div>

      <BbtiChallengeReceiptBoard
        code={code}
        emoji={type.emoji}
        typeName={type.name}
        challengeMatchups={challengeMatchups}
        onChallengeMatchup={onChallengeMatchup}
        onCustomChallenge={() => onChallengeMatchup("custom")}
      />

      <BbtiShareKits
        code={code}
        kits={shareKits}
        sectionId="bbti-share"
        preview={(
          <BbtiShareCard
            code={code}
            emoji={type.emoji}
            typeName={type.name}
            tagline={type.tagline}
            spiritPlayer={type.spiritPlayer}
            debateWeapon={playbook.debateWeapon}
            primaryChallengeTitle={primaryChallenge?.title}
            axes={bbtiAttributes}
            badges={bbtiBadges}
            overall={bbtiOverall}
          />
        )}
      />

      {/* ════════════════════════════════════════════════════════════════
          ACTION BUTTONS
         ════════════════════════════════════════════════════════════════ */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg"
        style={{
          animation: "fade-up 0.5s ease-out",
          animationDelay: "1.6s",
          animationFillMode: "both",
        }}
      >
        <button
          onClick={onRestart}
          className="flex-1 px-6 py-3 min-h-[48px] bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 font-bold rounded-full
            transition-all duration-200 cursor-pointer"
        >
          重新测试
        </button>
        <button
          onClick={openCompareInvite}
          className="px-6 py-3 min-h-[48px] bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 font-bold rounded-full
            transition-all duration-200 cursor-pointer"
        >
          {pendingCompareInvite ? "生成双人报告" : "双人对比"}
        </button>
        <button
          onClick={onSwitchToDebate}
          className="px-6 py-3 min-h-[48px] bg-gradient-to-r from-kobe-gold/80 to-lebron-gold/80 text-black font-bold rounded-full
            hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          去辩论大厅
        </button>
      </div>

      <p className="mt-10 text-xs text-white/20 text-center max-w-sm">
        BBTI 篮球人格类型 — 纯属娱乐，每个球迷都是独一无二的。
      </p>
    </div>
  );
}
