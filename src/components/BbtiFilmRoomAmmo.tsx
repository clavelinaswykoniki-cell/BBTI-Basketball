"use client";

import { useMemo } from "react";
import type { BbtiFilmRoomClip } from "@/data/bbti-playbook";
import type { BbtiChallengeMatchup } from "@/data/bbti-challenges";
import {
  buildBbtiChallengeCaseContext,
  type BbtiChallengeCaseContext,
} from "@/data/bbti-challenge-case";
import {
  getBbtiFilmRoomCrossExam,
  type BbtiFilmRoomCrossExam,
} from "@/data/bbti-film-room-cross-exams";
import { buildBbtiResultUrl } from "@/lib/bbti-deep-links";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiFilmRoomAmmoProps {
  code: string;
  clip: BbtiFilmRoomClip;
  dimensionLabel: string;
  crossExam?: BbtiFilmRoomCrossExam;
  challenge?: BbtiChallengeMatchup;
  onChallengeMatchup?: (matchupId: string, caseContext?: BbtiChallengeCaseContext | null) => void;
  typeName?: string;
  emoji?: string;
}

function cleanBaseHref(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}${window.location.pathname}`;
}

function buildAmmoUrl(
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

function buildAmmoCopy(
  code: string,
  clip: BbtiFilmRoomClip,
  dimensionLabel: string,
  crossExam: BbtiFilmRoomCrossExam,
  challenge?: BbtiChallengeMatchup,
  typeName?: string,
  emoji?: string,
  baseHref?: string,
): string {
  const url = buildAmmoUrl(code, clip, challenge, baseHref);
  const identity = typeName ? `${emoji ? `${emoji} ` : ""}${typeName}（${code}）` : code;
  const poles = clip.coachTimeout.poles
    .map((pole) => `${pole.label}+${pole.points}`)
    .join(" / ");
  const lines = [
    `BBTI 开庭弹药：${identity} · Q${clip.questionId}｜${dimensionLabel}`,
    `我的选择：${clip.answerText}`,
    poles ? `暴露倾向：${poles}` : null,
    `审查标准：${crossExam.standard}`,
    `录像室判词：${clip.coachTimeout.title}｜${clip.coachTimeout.summary}`,
    `进攻论点：${clip.coachTimeout.tacticalNote}`,
    `对方可反击点：${clip.coachTimeout.blindSpot}`,
    `交叉询问：${crossExam.question}`,
    `反击角度：${crossExam.counterPunch}`,
    challenge ? `命定对线：${challenge.category} · ${challenge.title}｜${challenge.label}` : null,
    challenge?.pressureQuestion ? `下一案由：${challenge.pressureQuestion}` : null,
    challenge?.iconicMoment ?? null,
    challenge?.receiptA ? `证词 A：${challenge.receiptA}` : null,
    challenge?.receiptB ? `证词 B：${challenge.receiptB}` : null,
    challenge?.evidenceLens?.length ? `证据标签：${challenge.evidenceLens.join(" / ")}` : null,
    url,
  ];

  return lines.filter(Boolean).join("\n");
}

export default function BbtiFilmRoomAmmo({
  code,
  clip,
  dimensionLabel,
  crossExam,
  challenge,
  onChallengeMatchup,
  typeName,
  emoji,
}: BbtiFilmRoomAmmoProps) {
  const copyFeedback = useGuardedClipboard<"ammo">();
  const resolvedCrossExam = useMemo(
    () => crossExam ?? getBbtiFilmRoomCrossExam(clip),
    [clip, crossExam],
  );
  const caseContext = useMemo(
    () => challenge
      ? buildBbtiChallengeCaseContext({
        code,
        clip,
        dimensionLabel,
        crossExam: resolvedCrossExam,
        challenge,
        typeName,
        emoji,
      })
      : null,
    [challenge, clip, code, dimensionLabel, emoji, resolvedCrossExam, typeName],
  );
  const poles = clip.coachTimeout.poles
    .map((pole) => `${pole.label}+${pole.points}`)
    .join(" / ");

  const copyAmmo = () => {
    copyFeedback.copyText(
      buildAmmoCopy(code, clip, dimensionLabel, resolvedCrossExam, challenge, typeName, emoji, cleanBaseHref()),
      "ammo",
    );
  };
  const copied = copyFeedback.isCopied("ammo");
  const failed = copyFeedback.isFailed("ammo");

  return (
    <div className="mt-3 rounded-xl border border-kobe-gold/20 bg-kobe-gold/8 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-kobe-gold/72">
            Opening Ammo
          </p>
          <h4 className="mt-1 text-sm font-black text-white">
            用这段选择开庭
          </h4>
        </div>
        <span className="shrink-0 rounded-full border border-kobe-gold/25 px-2 py-0.5 text-[10px] font-black text-kobe-gold/70">
          Q{clip.questionId}
        </span>
      </div>

      <p className="mt-2 text-[11px] text-white/58 leading-relaxed">
        把你的具体选择、教练点评和命定对线打包发群，朋友不能只回一句“你不懂球”。
      </p>

      {poles && (
        <p className="mt-2 rounded-lg bg-white/[0.04] px-3 py-2 text-[11px] font-bold text-white/58">
          暴露倾向：{poles}
        </p>
      )}

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {[
          { label: "数据席", value: challenge?.evidenceLens?.slice(0, 2).join(" / ") ?? dimensionLabel },
          { label: "录像席", value: clip.coachTimeout.tag },
          { label: "战术席", value: resolvedCrossExam.seat === "战术席" ? resolvedCrossExam.title : challenge?.label ?? clip.coachTimeout.title },
        ].map((seat) => (
          <div key={seat.label} className="min-w-0 rounded-lg border border-white/10 bg-black/18 px-2 py-2">
            <p className="text-[9px] font-black text-white/30">{seat.label}</p>
            <p className="mt-0.5 truncate text-[10px] font-black text-white/58">{seat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-lebron-gold/20 bg-lebron-wine/12 px-3 py-2">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-[10px] font-black uppercase tracking-widest text-lebron-gold/72">
            Cross Exam
          </p>
          <span className="shrink-0 text-[10px] font-black text-white/32">
            {resolvedCrossExam.source === "question" ? "题目追问" : "倾向追问"}
          </span>
        </div>
        <p className="text-xs font-black text-white/78 leading-relaxed">
          {resolvedCrossExam.title}
        </p>
        <p className="mt-1 text-[11px] font-bold text-lebron-gold/70 leading-relaxed">
          审查标准：{resolvedCrossExam.standard}
        </p>
        <p className="mt-1 text-[11px] text-white/62 leading-relaxed">
          {resolvedCrossExam.question}
        </p>
        <p className="mt-2 text-[11px] text-white/42 leading-relaxed">
          反击角度：{resolvedCrossExam.counterPunch}
        </p>
      </div>

      {challenge && (
        <div className="mt-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-xs font-black text-white">
              {challenge.title}
            </p>
            <span className="shrink-0 text-[10px] font-black text-white/38">
              {challenge.category}
            </span>
          </div>
          <p className="text-[11px] text-white/56 leading-relaxed">
            {challenge.pressureQuestion ?? challenge.reason}
          </p>
          {challenge.iconicMoment && (
            <p className="mt-2 text-[11px] text-white/38 leading-relaxed">
              {challenge.iconicMoment}
            </p>
          )}
          {challenge.evidenceLens && (
            <div className="mt-2 flex flex-wrap gap-1">
              {challenge.evidenceLens.slice(0, 5).map((lens) => (
                <span
                  key={lens}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-black text-white/38"
                >
                  {lens}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={copyAmmo}
          className="rounded-full bg-white/90 px-4 py-2.5 text-xs font-black text-black hover:bg-white transition-colors cursor-pointer"
        >
          {failed ? "复制失败，可手动复制" : copied ? "已复制弹药" : "复制开庭弹药"}
        </button>
        <button
          type="button"
          onClick={() => challenge && onChallengeMatchup?.(challenge.matchupId, caseContext)}
          disabled={!challenge || !onChallengeMatchup}
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-black text-white/62 hover:text-white hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-45 transition-colors cursor-pointer"
        >
          用这题开战
        </button>
      </div>

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copied ? "已复制开庭弹药" : failed ? "开庭弹药自动复制失败，可手动复制" : ""}
      </p>

      <BbtiManualCopyFallback
        text={copyFeedback.feedback.manualCopyText}
        title="自动复制失败，长按下方开庭弹药复制。"
        className="mt-3"
      />
    </div>
  );
}
