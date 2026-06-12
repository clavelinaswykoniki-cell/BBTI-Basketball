"use client";

import { useMemo, useState } from "react";
import {
  buildSharedFilmRoomClipFromKey,
  getBbtiFilmRoomDimensionLabel,
  type BbtiFilmRoomClip,
} from "@/data/bbti-playbook";
import type { BbtiChallengeMatchup } from "@/data/bbti-challenges";
import type { BbtiChallengeCaseContext } from "@/data/bbti-challenge-case";
import { getBbtiFilmRoomCrossExam } from "@/data/bbti-film-room-cross-exams";
import { resolveBbtiFilmRoomDrill } from "@/data/bbti-film-room-drills";
import { buildBbtiResultUrl, parseBbtiDeepLink } from "@/lib/bbti-deep-links";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiChallengeAmmoSwitcher from "./BbtiChallengeAmmoSwitcher";
import BbtiCounterEvidenceCard from "./BbtiCounterEvidenceCard";
import BbtiFilmRoomAmmo from "./BbtiFilmRoomAmmo";
import BbtiFilmRoomDrillCard from "./BbtiFilmRoomDrillCard";
import BbtiFilmRoomContradictions from "./BbtiFilmRoomContradictions";
import BbtiFilmRoomRemixBench from "./BbtiFilmRoomRemixBench";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiFilmRoomTrendForBench {
  label: string;
  tone: string;
  average: number;
  readCount: number;
  strongest: { questionId: number };
  toughest: { questionId: number };
}

interface BbtiFilmRoomClipsProps {
  code: string;
  clips: BbtiFilmRoomClip[];
  primaryChallenge?: BbtiChallengeMatchup;
  challengeMatchups?: BbtiChallengeMatchup[];
  onChallengeMatchup?: (matchupId: string, caseContext?: BbtiChallengeCaseContext | null) => void;
  typeName?: string;
  emoji?: string;
  trendSummary?: BbtiFilmRoomTrendForBench | null;
}

function clipCopy(code: string, clip: BbtiFilmRoomClip, isSharedClipMode = false): string {
  const poles = clip.coachTimeout.poles
    .map((pole) => `${pole.label}+${pole.points}`)
    .join(" / ");
  const clipUrl = new URL(buildBbtiResultUrl(code, { clipKey: clip.clipKey }));
  clipUrl.hash = "bbti-film-room";

  return [
    `BBTI 录像室 Clip：Q${clip.questionId}｜${getBbtiFilmRoomDimensionLabel(clip.dimension)}`,
    isSharedClipMode ? "来源：分享链接复原的单段录像，不代表完整答卷。" : null,
    `我这题暴露了：${poles}`,
    `我的答案：${clip.answerText}`,
    `教练点评：${clip.coachTimeout.summary}`,
    `复盘提醒：${clip.coachTimeout.blindSpot}`,
    clipUrl.toString(),
  ].filter(Boolean).join("\n");
}

function readRequestedFilmRoomState(code: string): {
  hasClipParam: boolean;
  rawClip: string | null;
  key: string | null;
  questionId: number | null;
  challengeMatchupId: string | null;
} {
  if (typeof window === "undefined") {
    return {
      hasClipParam: false,
      rawClip: null,
      key: null,
      questionId: null,
      challengeMatchupId: null,
    };
  }
  const deepLink = parseBbtiDeepLink(window.location.search);
  if (deepLink.code && deepLink.code !== code) {
    return {
      hasClipParam: false,
      rawClip: null,
      key: null,
      questionId: null,
      challengeMatchupId: null,
    };
  }
  return {
    hasClipParam: deepLink.hasClipParam,
    rawClip: deepLink.rawClip,
    key: deepLink.clipKey,
    questionId: deepLink.clipQuestionId,
    challengeMatchupId: deepLink.challengeMatchupId,
  };
}

export default function BbtiFilmRoomClips({
  code,
  clips,
  primaryChallenge,
  challengeMatchups,
  onChallengeMatchup,
  typeName,
  emoji,
  trendSummary,
}: BbtiFilmRoomClipsProps) {
  const [manualActiveIndex, setManualActiveIndex] = useState<number | null>(null);
  const [manualChallengeId, setManualChallengeId] = useState<string | null>(null);
  const clipCopyFeedback = useGuardedClipboard<"clip">();
  const [requestedFilmRoom] = useState(() => readRequestedFilmRoomState(code));
  const sharedClip = useMemo(
    () => requestedFilmRoom.key ? buildSharedFilmRoomClipFromKey(requestedFilmRoom.key) : null,
    [requestedFilmRoom.key],
  );
  const isSharedClipMode = clips.length === 0 && Boolean(sharedClip);
  const clipModels = useMemo(
    () => {
      const visibleClips = clips.length > 0 ? clips : sharedClip ? [sharedClip] : [];
      return visibleClips.map((clip, index) => ({
        ...clip,
        clipNo: index + 1,
      }));
    },
    [clips, sharedClip],
  );
  const challengeOptions = useMemo(
    () => {
      const options = challengeMatchups && challengeMatchups.length > 0
        ? challengeMatchups
        : primaryChallenge
          ? [primaryChallenge]
          : [];

      return options.filter(
        (challenge, index, items) => (
          items.findIndex((item) => item.matchupId === challenge.matchupId) === index
        ),
      );
    },
    [challengeMatchups, primaryChallenge],
  );
  const selectedChallenge = useMemo(() => {
    const preferredId = manualChallengeId ?? requestedFilmRoom.challengeMatchupId ?? primaryChallenge?.matchupId;
    return (
      challengeOptions.find((challenge) => challenge.matchupId === preferredId) ??
      challengeOptions[0] ??
      primaryChallenge
    );
  }, [challengeOptions, manualChallengeId, primaryChallenge, requestedFilmRoom.challengeMatchupId]);
  const requestedIndex = useMemo(() => {
    if (!requestedFilmRoom.questionId || clipModels.length === 0) return 0;
    const index = clipModels.findIndex((clip) => clip.questionId === requestedFilmRoom.questionId);
    return index >= 0 ? index : 0;
  }, [clipModels, requestedFilmRoom.questionId]);

  if (clipModels.length === 0) {
    if (!requestedFilmRoom.hasClipParam) return null;

    const hasQuestionOnly = Boolean(requestedFilmRoom.questionId);

    return (
      <section id="bbti-film-room" className="scroll-mt-[var(--bbti-action-dock-offset,9rem)] border-t border-white/10 pt-4">
        <div className="rounded-xl border border-kobe-gold/20 bg-kobe-gold/8 p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-kobe-gold/25 bg-kobe-gold/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-kobe-gold/80">
              Film Room Link
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-black text-white/38">
              未复原
            </span>
          </div>
          <h3 className="text-base font-black text-white mb-2">
            {hasQuestionOnly
              ? `这条链接指向 Q${requestedFilmRoom.questionId} 录像室点评`
              : "这条录像室链接暂时不能复原"}
          </h3>
          <p className="text-xs sm:text-sm text-white/62 leading-relaxed">
            {hasQuestionOnly
              ? "这条 clip key 只带回题号，没有携带可复原的答案选项。你可以先看分享文案里的录像室点评，或者自己完成一次 BBTI 生成你的 Film Room clips。"
              : "这个链接里的 clip 参数格式不完整，无法确认是哪一段选择。请让对方重新复制完整的录像室链接，或完成一次 BBTI 生成新的 Film Room clips。"}
          </p>
          {requestedFilmRoom.rawClip && (
            <p className="mt-2 max-w-full truncate rounded-lg border border-white/10 bg-black/24 px-3 py-2 font-mono text-[11px] text-white/34">
              clip={requestedFilmRoom.rawClip}
            </p>
          )}
        </div>
      </section>
    );
  }

  const activeIndex = Math.min(manualActiveIndex ?? requestedIndex, clipModels.length - 1);
  const active = clipModels[activeIndex];
  const activeCrossExam = getBbtiFilmRoomCrossExam(active);
  const activeDimensionLabel = getBbtiFilmRoomDimensionLabel(active.dimension);
  const activeDrill = resolveBbtiFilmRoomDrill({
    clip: active,
    crossExam: activeCrossExam,
    dimensionLabel: activeDimensionLabel,
  });
  const activeTrend = trendSummary
    ? {
      average: trendSummary.average,
      label: trendSummary.label,
      readCount: trendSummary.readCount,
      strongestQuestionId: trendSummary.strongest.questionId,
      tone: trendSummary.tone,
      toughestQuestionId: trendSummary.toughest.questionId,
    }
    : null;

  const copyActiveClip = () => {
    clipCopyFeedback.copyText(clipCopy(code, active, isSharedClipMode), "clip");
  };

  return (
    <section id="bbti-film-room" className="scroll-mt-[var(--bbti-action-dock-offset,9rem)] border-t border-white/10 pt-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-1">
            Film Room
          </p>
          <h3 className="text-base font-black text-white">
            关键选择录像室
          </h3>
          {isSharedClipMode && (
            <p className="mt-1 text-xs font-bold text-kobe-gold/70">
              分享链接复原 · 只回放这一段选择
            </p>
          )}
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black ${
          isSharedClipMode
            ? "border-kobe-gold/30 bg-kobe-gold/10 text-kobe-gold/80"
            : "border-white/10 text-white/38"
        }`}>
          {isSharedClipMode ? "SHARED CLIP" : `${clipModels.length} CLIPS`}
        </span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
        {clipModels.map((clip, index) => (
          <button
            key={clip.questionId}
            onClick={() => {
              setManualActiveIndex(index);
              clipCopyFeedback.clearFeedback();
            }}
            className={`shrink-0 rounded-full border px-3 py-2 text-[10px] font-black transition-colors cursor-pointer ${
              activeIndex === index
                ? "border-kobe-gold bg-kobe-gold text-black"
                : "border-white/10 bg-white/[0.03] text-white/46 hover:text-white/78"
            }`}
          >
            {isSharedClipMode ? "分享链接" : `Clip ${clip.clipNo}`} · Q{clip.questionId}
          </button>
        ))}
      </div>

      <article className="rounded-xl border border-white/10 bg-black/20 p-4">
        {isSharedClipMode && (
          <div className="mb-3 rounded-xl border border-kobe-gold/20 bg-kobe-gold/8 px-3 py-2">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-kobe-gold/15 px-2 py-0.5 text-[10px] font-black text-kobe-gold">
                分享回放
              </span>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold text-white/42">
                不覆盖本地结果
              </span>
            </div>
            <p className="text-xs leading-relaxed text-white/64">
              这段录像室点评由链接里的 clip key 复原，只带回这道选择和对应教练暂停；完整分数、其他答案和上次结果不会被推断。
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="rounded-full bg-kobe-gold/15 px-2 py-0.5 text-[10px] font-black text-kobe-gold">
            {activeDimensionLabel}
          </span>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-black text-white/38">
            {active.coachTimeout.tag}
          </span>
        </div>

        <p className="text-sm font-black text-white leading-snug">
          {active.coachTimeout.title}
        </p>
        <p className="mt-1 text-xs text-white/45 leading-relaxed">{active.prompt}</p>
        <p className="mt-2 rounded-lg bg-white/[0.04] px-3 py-2 text-xs sm:text-sm text-white/74 leading-relaxed">
          {active.answerText}
        </p>

        <div className="mt-3 flex flex-wrap gap-1">
          {active.coachTimeout.poles.map((impact) => (
            <span
              key={`${active.questionId}-${impact.pole}`}
              className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] font-black text-white/56"
            >
              +{impact.points} {impact.label}
            </span>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="rounded-lg bg-kobe-gold/8 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-kobe-gold/72 mb-1">
              教练暂停
            </p>
            <p className="text-[11px] text-white/64 leading-relaxed">
              {active.coachTimeout.tacticalNote}
            </p>
          </div>
          <div className="rounded-lg bg-lebron-wine/18 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-lebron-gold/72 mb-1">
              复盘提醒
            </p>
            <p className="text-[11px] text-white/64 leading-relaxed">
              {active.coachTimeout.blindSpot}
            </p>
          </div>
        </div>

        <button
          onClick={copyActiveClip}
          className="mt-3 w-full rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-black text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          {clipCopyFeedback.isFailed("clip")
            ? "复制失败"
            : clipCopyFeedback.isCopied("clip")
              ? "已复制录像室点评"
              : "复制这段录像室点评"}
        </button>
        <BbtiManualCopyFallback
          text={clipCopyFeedback.feedback.manualCopyText}
          title="自动复制失败，长按下方录像室点评复制。"
          className="mt-3"
        />

        <BbtiFilmRoomRemixBench
          activeClipNo={active.clipNo}
          clip={active}
          clipCount={clipModels.length}
          code={code}
          dimensionLabel={activeDimensionLabel}
          drill={activeDrill}
          isSharedClipMode={isSharedClipMode}
          trend={activeTrend}
        />

        <BbtiFilmRoomDrillCard
          code={code}
          clip={active}
          crossExam={activeCrossExam}
          dimensionLabel={activeDimensionLabel}
          typeName={typeName}
        />

        <BbtiFilmRoomContradictions
          code={code}
          clips={clipModels}
          typeName={typeName}
          emoji={emoji}
        />

        <BbtiChallengeAmmoSwitcher
          challenges={challengeOptions}
          selectedMatchupId={selectedChallenge?.matchupId}
          onSelect={setManualChallengeId}
        />

        <BbtiCounterEvidenceCard
          code={code}
          clip={active}
          crossExam={activeCrossExam}
          dimensionLabel={activeDimensionLabel}
          challenge={selectedChallenge}
          typeName={typeName}
          emoji={emoji}
        />

        <BbtiFilmRoomAmmo
          code={code}
          clip={active}
          dimensionLabel={activeDimensionLabel}
          crossExam={activeCrossExam}
          challenge={selectedChallenge}
          onChallengeMatchup={onChallengeMatchup}
          typeName={typeName}
          emoji={emoji}
        />
      </article>
    </section>
  );
}
