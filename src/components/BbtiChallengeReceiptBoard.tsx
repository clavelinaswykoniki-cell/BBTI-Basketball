"use client";

import {
  buildBbtiResultChallengeCaseContext,
  type BbtiChallengeCaseContext,
} from "@/data/bbti-challenge-case";
import {
  resolveBbtiChallengeLaneScoreboard,
  type BbtiChallengeMatchup,
} from "@/data/bbti-challenges";
import {
  resolveBbtiChallengePickReplayKit,
  resolveBbtiChallengeReplaySeeds,
} from "@/data/bbti-challenge-replay-seeds";
import { buildBbtiResultUrl } from "@/lib/bbti-deep-links";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiChallengeReplaySeeds from "./BbtiChallengeReplaySeeds";
import BbtiChallengePickReplayKit from "./BbtiChallengePickReplayKit";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiChallengeReceiptBoardProps {
  code: string;
  emoji: string;
  typeName: string;
  challengeMatchups: BbtiChallengeMatchup[];
  onChallengeMatchup: (matchupId: string, caseContext?: BbtiChallengeCaseContext | null) => void;
  onCustomChallenge: () => void;
}

interface RivalryScriptLine {
  id: "opener" | "conflict" | "counter";
  label: string;
  text: string;
}

function rivalryScriptsFor(matchup: BbtiChallengeMatchup): RivalryScriptLine[] {
  const scripts = [
    { id: "opener", label: "开场陈词", text: matchup.scriptOpener },
    { id: "conflict", label: "群聊冲突", text: matchup.scriptConflict },
    { id: "counter", label: "赛后反击", text: matchup.scriptCounter },
  ] as const;

  return scripts.flatMap((script) => (
    script.text ? [{ id: script.id, label: script.label, text: script.text }] : []
  ));
}

function buildChallengeCopy(
  code: string,
  emoji: string,
  typeName: string,
  matchup: BbtiChallengeMatchup,
  baseHref?: string,
): string {
  const rivalryScripts = rivalryScriptsFor(matchup);

  return [
    `${emoji} ${typeName}（${code}）命定对线：${matchup.title}`,
    `${matchup.category}｜${matchup.label}`,
    matchup.reason,
    matchup.pressureQuestion ? `压力题：${matchup.pressureQuestion}` : null,
    matchup.groupChatPrompt ? `群聊题：${matchup.groupChatPrompt}` : null,
    matchup.iconicMoment ?? null,
    matchup.receiptA ? `证词 A：${matchup.receiptA}` : null,
    matchup.receiptB ? `证词 B：${matchup.receiptB}` : null,
    rivalryScripts.length === 3 ? "开庭脚本：" : null,
    ...rivalryScripts.map((script) => `${script.label}：${script.text}`),
    buildBbtiResultUrl(code, { challengeMatchupId: matchup.matchupId }, baseHref),
  ].filter(Boolean).join("\n");
}

function currentResultBaseHref(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}${window.location.pathname}`;
}

export default function BbtiChallengeReceiptBoard({
  code,
  emoji,
  typeName,
  challengeMatchups,
  onChallengeMatchup,
  onCustomChallenge,
}: BbtiChallengeReceiptBoardProps) {
  const copyFeedback = useGuardedClipboard<string>();
  const laneScoreboard = resolveBbtiChallengeLaneScoreboard({ code, challengeMatchups });
  const pickReplayKit = resolveBbtiChallengePickReplayKit(laneScoreboard);
  const laneScoreboardCopyKey = `challenge-lane-scoreboard-${code}`;
  const laneScoreboardCopied = copyFeedback.isCopied(laneScoreboardCopyKey);
  const laneScoreboardFailed = copyFeedback.isFailed(laneScoreboardCopyKey);
  const showLaneScoreboardManualCopy = copyFeedback.feedback.manualCopyText === laneScoreboard.copyText;

  const copyChallenge = (matchup: BbtiChallengeMatchup) => {
    const key = `${matchup.category}-${matchup.matchupId}`;
    copyFeedback.copyText(buildChallengeCopy(code, emoji, typeName, matchup, currentResultBaseHref()), key);
  };
  const copyLaneScoreboard = () => {
    copyFeedback.copyText(laneScoreboard.copyText, laneScoreboardCopyKey);
  };
  return (
    <section
      id="bbti-challenges"
      data-testid="bbti-challenge-receipt-board"
      data-bbti-challenge-count={challengeMatchups.length}
      className="w-full max-w-lg scroll-mt-[var(--bbti-action-dock-offset,9rem)] rounded-2xl glass p-5 sm:p-6 mb-6"
      style={{
        animation: "fade-up 0.5s ease-out",
        animationDelay: "1.25s",
        animationFillMode: "both",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-1">
            你的命定对线
          </p>
          <h2 className="text-xl font-black text-white">
            把人格结果带进球场开庭
          </h2>
        </div>
        <span className="shrink-0 rounded-full bg-kobe-gold px-2.5 py-1 text-[10px] font-black text-black">
          PLAY NEXT
        </span>
      </div>

      <div
        data-testid="bbti-challenge-lane-scoreboard"
        data-bbti-challenge-lane-scoreboard-version={laneScoreboard.version}
        data-bbti-challenge-lane-scoreboard-code={laneScoreboard.code}
        data-bbti-challenge-lane-scoreboard-count={laneScoreboard.laneCount}
        className="mb-4 rounded-xl border border-kobe-gold/18 bg-black/20 p-3"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-kobe-gold/70 mb-1">
              开庭选边板
            </p>
            <p className="text-sm font-black text-white">
              先选路线，再进场吵
            </p>
          </div>
          <button
            type="button"
            data-testid="bbti-challenge-lane-scoreboard-action"
            data-bbti-challenge-lane-scoreboard-action="copy-scoreboard"
            onClick={copyLaneScoreboard}
            className="rounded-full border border-kobe-gold/25 bg-kobe-gold/10 px-3 py-2 text-[11px] font-black text-kobe-gold hover:bg-kobe-gold/16 transition-colors cursor-pointer"
          >
            {laneScoreboardFailed ? "手动复制" : laneScoreboardCopied ? "已复制路线" : "复制路线板"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {laneScoreboard.rows.map((row, index) => (
            <div
              key={row.id}
              data-testid="bbti-challenge-lane-scoreboard-row"
              data-bbti-challenge-lane-scoreboard-row={row.id}
              data-bbti-challenge-lane-scoreboard-target={row.target}
              data-bbti-challenge-lane-scoreboard-category={row.category}
              data-bbti-challenge-lane-scoreboard-matchup={row.matchupId}
              data-bbti-challenge-lane-scoreboard-position={index + 1}
              data-bbti-challenge-lane-scoreboard-action="open-lane"
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left"
            >
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] font-black text-white/45">
                  {index + 1}
                </span>
                <span className="text-[10px] font-black text-kobe-gold/75">
                  {row.routeLabel}
                </span>
                <span className="text-[10px] font-bold text-white/35">
                  {row.category}
                </span>
              </div>
              <p className="text-xs font-black text-white">
                {row.title}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-white/46">
                {row.body}
              </p>
              {row.pressureQuestion && (
                <p className="mt-1 text-[11px] leading-relaxed text-kobe-gold/62">
                  压力题：{row.pressureQuestion}
                </p>
              )}
            </div>
          ))}
        </div>

        <p
          data-testid="bbti-challenge-lane-scoreboard-boundary"
          className="mt-3 text-[10px] leading-relaxed text-white/30"
        >
          {laneScoreboard.boundary}
        </p>

        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {laneScoreboardCopied ? "已复制开庭选边板" : laneScoreboardFailed ? "开庭选边板自动复制失败，可手动复制" : ""}
        </p>

        {showLaneScoreboardManualCopy && (
          <BbtiManualCopyFallback
            text={copyFeedback.feedback.manualCopyText}
            title="自动复制失败，长按下方路线板复制。"
            className="mt-3"
          />
        )}
      </div>

      <BbtiChallengePickReplayKit pickReplayKit={pickReplayKit} />

      <div className="space-y-3">
        {challengeMatchups.map((matchup, index) => {
          const key = `${matchup.category}-${matchup.matchupId}`;
          const copied = copyFeedback.isCopied(key);
          const failed = copyFeedback.isFailed(key);
          const challengeCopy = buildChallengeCopy(code, emoji, typeName, matchup, currentResultBaseHref());
          const showManualCopy = copyFeedback.feedback.manualCopyText === challengeCopy;
          const receipts = [matchup.receiptA, matchup.receiptB].filter(
            (receipt): receipt is string => Boolean(receipt),
          );
          const rivalryScripts = rivalryScriptsFor(matchup);
          const resultCaseContext = buildBbtiResultChallengeCaseContext({ code, emoji, typeName, challenge: matchup });
          const replaySeeds = resolveBbtiChallengeReplaySeeds({
            caseContext: resultCaseContext,
            challengeCategory: matchup.category,
            challengeLabel: matchup.label,
            challengeMatchupId: matchup.matchupId,
            challengeTitle: matchup.title,
            code,
            pressureLine: matchup.pressureQuestion,
            returnHref: buildBbtiResultUrl(code, { challengeMatchupId: matchup.matchupId }, currentResultBaseHref()),
            source: "result-card",
          });

          return (
            <article
              key={key}
              data-testid="bbti-challenge-card"
              data-bbti-challenge-matchup-id={matchup.matchupId}
              data-bbti-challenge-category={matchup.category}
              data-bbti-challenge-position={index + 1}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition-colors hover:border-kobe-gold/35 hover:bg-kobe-purple/12"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="rounded-full bg-kobe-gold/15 px-2 py-0.5 text-[10px] font-black text-kobe-gold">
                  {matchup.category}
                </span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold text-white/42">
                  {matchup.label}
                </span>
              </div>

              <p className="text-sm font-black text-white mb-1">{matchup.title}</p>
              <p className="text-[11px] line-clamp-2 overflow-hidden text-white/52 leading-relaxed">
                {matchup.reason}
              </p>

              {matchup.evidenceLens && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {matchup.evidenceLens.slice(0, 5).map((lens) => (
                    <span
                      key={lens}
                      className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] font-bold text-white/40"
                    >
                      {lens}
                    </span>
                  ))}
                </div>
              )}

              {matchup.pressureQuestion && (
                <div className="mt-3 rounded-lg border border-kobe-gold/15 bg-kobe-gold/8 px-3 py-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-kobe-gold/75 mb-1">
                    压力题
                  </p>
                  <p className="text-[11px] line-clamp-2 overflow-hidden text-white/72 leading-relaxed">
                    {matchup.pressureQuestion}
                  </p>
                </div>
              )}

              {matchup.iconicMoment && (
                <p className="mt-2 text-[11px] text-white/40 leading-relaxed">
                  {matchup.iconicMoment}
                </p>
              )}

              {receipts.length > 0 && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {receipts.map((receipt, index) => (
                    <div key={receipt} className="rounded-lg bg-white/[0.03] px-3 py-2">
                      <p className="text-[10px] font-black text-white/28 mb-1">
                        证词 {index + 1}
                      </p>
                      <p className="text-[11px] text-white/56 leading-relaxed">{receipt}</p>
                    </div>
                  ))}
                </div>
              )}

              {rivalryScripts.length === 3 && (
                <div
                  data-testid="bbti-challenge-rivalry-scripts"
                  data-bbti-rivalry-script-count={rivalryScripts.length}
                  className="mt-3 rounded-xl border border-lebron-gold/15 bg-lebron-gold/8 p-3"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-lebron-gold/75 mb-2">
                    开庭脚本
                  </p>
                  <div className="space-y-2">
                    {rivalryScripts.map((script, index) => (
                      <div
                        key={script.id}
                        data-testid="bbti-challenge-rivalry-script"
                        data-bbti-rivalry-script={script.id}
                        data-bbti-rivalry-script-position={index + 1}
                        className="rounded-lg bg-black/18 px-3 py-2"
                      >
                        <p className="text-[10px] font-black text-lebron-gold/70 mb-1">
                          {index + 1}. {script.label}
                        </p>
                        <p className="text-[11px] text-white/62 leading-relaxed">{script.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <BbtiChallengeReplaySeeds
                compact
                seeds={replaySeeds}
                className="mt-3"
                showCopyAction={false}
              />

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  data-testid="bbti-challenge-copy"
                  data-bbti-challenge-action="copy"
                  onClick={() => copyChallenge(matchup)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-black text-white/62 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  {failed ? "复制失败" : copied ? "已复制证物" : "复制证物包"}
                </button>
                <button
                  type="button"
                  data-testid="bbti-challenge-open"
                  data-bbti-challenge-action="open-matchup"
                  onClick={() => onChallengeMatchup(
                    matchup.matchupId,
                    resultCaseContext,
                  )}
                  className="rounded-full bg-gradient-to-r from-kobe-gold to-lebron-gold px-4 py-2.5 text-xs font-black text-black hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer"
                >
                  开战 {matchup.title}
                </button>
              </div>

              <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {copied ? `已复制${matchup.title}证物包` : failed ? `${matchup.title}证物包复制失败` : ""}
              </p>

              {showManualCopy && (
                <BbtiManualCopyFallback
                  text={copyFeedback.feedback.manualCopyText}
                  title="自动复制失败，长按下方证物包复制。"
                  className="mt-3"
                />
              )}
            </article>
          );
        })}

        <article className="rounded-xl border border-dashed border-kobe-gold/35 bg-kobe-gold/8 p-3 text-left">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="rounded-full bg-kobe-gold/15 px-2 py-0.5 text-[10px] font-black text-kobe-gold">
              自选审判局
            </span>
            <span className="text-[10px] font-bold text-white/35">CUSTOM</span>
          </div>
          <p className="text-sm font-black text-white mb-1">按你的人格自己点名两位球星</p>
          <p className="text-xs text-white/52 leading-relaxed">
            不想接受系统安排，就自己选一组最能吵起来的对线开庭。
          </p>
          <button
            type="button"
            onClick={onCustomChallenge}
            className="mt-3 w-full rounded-full border border-kobe-gold/30 px-4 py-2.5 text-xs font-black text-kobe-gold hover:bg-kobe-gold/12 transition-colors cursor-pointer"
          >
            造局 &rarr;
          </button>
        </article>
      </div>
    </section>
  );
}
