"use client";

import { useMemo } from "react";
import { getBbtiAnswerPoll, type BbtiAnswerPoll } from "@/data/bbti-answer-polls";
import { bbtiQuestions, type BbtiAnswer } from "@/data/bbti";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiAnswerPollTrendProps {
  answers: BbtiAnswer[];
  code: string;
  typeName: string;
  emoji: string;
}

export const BBTI_ANSWER_POLL_TREND_VERSION = "bbti-answer-poll-trend-v1" as const;

export interface BbtiAnswerPollTrendRead {
  questionId: number;
  poll: BbtiAnswerPoll;
}

export interface BbtiAnswerPollTrendSummary {
  version: typeof BBTI_ANSWER_POLL_TREND_VERSION;
  label: string;
  tone: string;
  headline: string;
  average: number;
  mainstreamCount: number;
  minorityCount: number;
  tossupCount: number;
  readCount: number;
  strongest: BbtiAnswerPollTrendRead;
  toughest: BbtiAnswerPollTrendRead;
  seats: Array<{ label: string; count: number }>;
}

function questionById(questionId: number) {
  return bbtiQuestions.find((question) => question.id === questionId);
}

export function buildBbtiAnswerPollTrendReads(answers: BbtiAnswer[]): BbtiAnswerPollTrendRead[] {
  return answers
    .map((answer) => {
      const question = questionById(answer.questionId);
      if (!question) return null;
      const poll = getBbtiAnswerPoll(question, answer);
      return poll ? { questionId: question.id, poll } : null;
    })
    .filter((item): item is BbtiAnswerPollTrendRead => Boolean(item));
}

function summarizeSeats(reads: BbtiAnswerPollTrendRead[]): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>();
  reads.forEach(({ poll }) => {
    counts.set(poll.selectedLabel, (counts.get(poll.selectedLabel) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "zh-Hans"))
    .slice(0, 3);
}

export function resolveBbtiAnswerPollTrendSummary(
  reads: BbtiAnswerPollTrendRead[],
): BbtiAnswerPollTrendSummary | null {
  if (!reads.length) return null;

  const average = Math.round(
    reads.reduce((sum, item) => sum + item.poll.selectedPercent, 0) / reads.length,
  );
  const mainstreamCount = reads.filter((item) => item.poll.selectedPercent >= 60).length;
  const minorityCount = reads.filter((item) => item.poll.selectedPercent <= 40).length;
  const tossupCount = reads.filter((item) => item.poll.selectedPercent > 40 && item.poll.selectedPercent < 60).length;
  const strongest = reads.reduce((best, item) => (
    item.poll.selectedPercent > best.poll.selectedPercent ? item : best
  ), reads[0]);
  const toughest = reads.reduce((best, item) => (
    item.poll.selectedPercent < best.poll.selectedPercent ? item : best
  ), reads[0]);

  const base = {
    average,
    mainstreamCount,
    minorityCount,
    readCount: reads.length,
    tossupCount,
    strongest,
    toughest,
    seats: summarizeSeats(reads),
    version: BBTI_ANSWER_POLL_TREND_VERSION,
  };

  if (minorityCount >= 3 && minorityCount >= mainstreamCount) {
    return {
      ...base,
      label: "逆风硬解",
      tone: "模拟逆风",
      headline: "你不是安全牌玩家。几次选择都顶着模拟看台反方向出手，这种票型不靠嗓门赢，靠下一句证据能不能站住。",
    };
  }

  if (average >= 66 && mainstreamCount >= 2) {
    return {
      ...base,
      label: "全场起立",
      tone: "模拟压倒顺风",
      headline: "模拟看台大面积和你同路。顺风很明显，但多数派也不能免检，下一句最好说明为什么这不是跟风。",
    };
  }

  if (mainstreamCount >= 3 && mainstreamCount > minorityCount) {
    return {
      ...base,
      label: "顺风主场",
      tone: "模拟顺风",
      headline: "你的篮球直觉多次站在模拟多数派一边。结论很顺，但别只吃主场哨，最好补上你的评价标准。",
    };
  }

  if (tossupCount >= Math.ceil(reads.length / 2)) {
    return {
      ...base,
      label: "拉锯体质",
      tone: "模拟拉锯",
      headline: "你的选择经常落在拉锯区。群聊很难一锤定音，这类结果最适合继续追问：你到底看重峰值、样本、冠军，还是记忆点？",
    };
  }

  if (average < 48 || minorityCount >= 2) {
    return {
      ...base,
      label: "弱侧埋伏",
      tone: "模拟小众",
      headline: "你有几票站在小众侧，但不是乱投。更像弱侧埋伏等空位，问题是你得证明这次出手真的合理。",
    };
  }

  return {
    ...base,
    label: "混合看台",
    tone: "模拟混合",
    headline: "你既有顺风直觉，也有逆风坚持，赛后报告最好按题拆开看。",
  };
}

export function buildBbtiAnswerPollTrendCopy(
  summary: BbtiAnswerPollTrendSummary,
  code: string,
  typeName: string,
  emoji: string,
): string {
  const seatLine = summary.seats.length
    ? `看台席位：${summary.seats.map((seat) => `${seat.label} x${seat.count}`).join("｜")}`
    : null;

  return [
    `${emoji} BBTI 模拟看台趋势：${typeName}（${code}）`,
    `趋势标签：${summary.label}｜${summary.tone}`,
    `约 ${summary.average}% 的模拟看台倾向与我同路`,
    `样本：本次作答 ${summary.readCount} 题`,
    `顺风 ${summary.mainstreamCount} 题｜拉锯 ${summary.tossupCount} 题｜逆风 ${summary.minorityCount} 题`,
    `最顺手回合：Q${summary.strongest.questionId} · ${summary.strongest.poll.selectedLabel} 约 ${summary.strongest.poll.selectedPercent}%`,
    `最硬回合：Q${summary.toughest.questionId} · ${summary.toughest.poll.selectedLabel} 约 ${summary.toughest.poll.selectedPercent}%`,
    seatLine,
    "说明：本地模拟，不代表真实用户投票。",
  ].filter((line): line is string => Boolean(line)).join("\n");
}

export default function BbtiAnswerPollTrend({
  answers,
  code,
  typeName,
  emoji,
}: BbtiAnswerPollTrendProps) {
  const summary = useMemo(
    () => resolveBbtiAnswerPollTrendSummary(buildBbtiAnswerPollTrendReads(answers)),
    [answers],
  );
  const copyFeedback = useGuardedClipboard<"trend">();

  if (!summary) return null;

  const copyText = buildBbtiAnswerPollTrendCopy(summary, code, typeName, emoji);
  const copyTrend = () => copyFeedback.copyText(copyText, "trend");
  const copied = copyFeedback.isCopied("trend");
  const failed = copyFeedback.isFailed("trend");

  return (
    <section
      data-testid="bbti-answer-poll-trend"
      data-bbti-answer-poll-trend-version={summary.version}
      data-bbti-answer-poll-trend-source="local-simulation"
      data-bbti-answer-poll-trend-code={code}
      data-bbti-answer-poll-trend-label={summary.label}
      data-bbti-answer-poll-trend-average={summary.average}
      data-bbti-answer-poll-trend-read-count={summary.readCount}
      className="mb-6 w-full max-w-lg rounded-lg border border-sky-300/20 bg-sky-950/20 p-4"
      style={{
        animation: "fade-up 0.5s ease-out",
        animationDelay: "1.12s",
        animationFillMode: "both",
      }}
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase text-sky-200/70">
            Local Simulation
          </p>
          <h2 className="mt-0.5 text-base font-black text-white">模拟看台趋势</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-white/48">
            本地模拟，不代表真实用户投票。
          </p>
        </div>
        <button
          type="button"
          data-testid="bbti-answer-poll-trend-copy"
          data-bbti-answer-poll-trend-action="copy"
          onClick={copyTrend}
          className="min-h-[38px] shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black text-white/68 transition-colors hover:border-sky-300/40 hover:text-sky-200"
        >
          {failed ? "复制失败，可手动复制" : copied ? "已复制" : "复制看台报告"}
        </button>
      </div>

      <div
        data-testid="bbti-answer-poll-trend-summary"
        className="rounded-lg border border-white/10 bg-black/24 p-3"
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-black text-white">{summary.label}</p>
            <p className="mt-0.5 text-xs font-bold text-sky-200/62">{summary.tone}</p>
          </div>
          <span className="shrink-0 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs font-black text-sky-100">
            约 {summary.average}%
          </span>
        </div>
        <p className="text-xs leading-relaxed text-white/68">{summary.headline}</p>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        {[
          { id: "mainstream", label: "顺风", value: summary.mainstreamCount },
          { id: "tossup", label: "拉锯", value: summary.tossupCount },
          { id: "minority", label: "逆风", value: summary.minorityCount },
        ].map((item) => (
          <div
            key={item.id}
            data-testid="bbti-answer-poll-trend-stat"
            data-bbti-answer-poll-trend-stat={item.id}
            className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-center"
          >
            <p className="text-lg font-black text-white">{item.value}</p>
            <p className="mt-0.5 text-[10px] font-bold text-white/40">{item.label}题</p>
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {[
          { id: "strongest", title: "最顺手回合", read: summary.strongest },
          { id: "toughest", title: "最硬回合", read: summary.toughest },
        ].map((item) => (
          <article
            key={item.id}
            data-testid="bbti-answer-poll-trend-round"
            data-bbti-answer-poll-trend-round={item.id}
            data-bbti-answer-poll-trend-question={item.read.questionId}
            data-bbti-answer-poll-trend-percent={item.read.poll.selectedPercent}
            className="rounded-lg border border-white/10 bg-black/18 px-3 py-2"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-sky-200/55">{item.title}</p>
            <p className="mt-1 text-xs font-black text-white">
              Q{item.read.questionId} · {item.read.poll.selectedLabel}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/50">
              约 {item.read.poll.selectedPercent}% 模拟倾向同路
            </p>
          </article>
        ))}
      </div>

      {summary.seats.length > 0 && (
        <div
          data-testid="bbti-answer-poll-trend-seats"
          data-bbti-answer-poll-trend-seat-count={summary.seats.length}
          className="mt-2 grid grid-cols-1 gap-2"
        >
          {summary.seats.map((seat, index) => (
            <div
              key={seat.label}
              data-testid="bbti-answer-poll-trend-seat"
              data-bbti-answer-poll-trend-seat-position={index + 1}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
            >
              <span className="text-[11px] font-bold text-white/58">{seat.label}</span>
              <span className="text-xs font-black text-sky-100">{seat.count} 题</span>
            </div>
          ))}
        </div>
      )}

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copied ? "已复制看台报告" : failed ? "看台报告自动复制失败，可手动复制" : ""}
      </p>

      <BbtiManualCopyFallback
        text={copyFeedback.feedback.manualCopyText}
        title="自动复制失败，长按下方看台报告复制。"
        className="mt-3"
      />
    </section>
  );
}
