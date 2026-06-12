"use client";

import { useMemo, useState } from "react";
import { BBTI_LAST_RESULT_STORAGE_KEY, type StoredBbtiResult } from "@/data/bbti-playbook";
import {
  BBTI_CODES,
  buildBbtiDuoRematchPromptCopy,
  buildBbtiCompareReportCopy,
  extractBbtiCode,
  getBbtiCompareReport,
  isBbtiCode,
  normalizeBbtiCode,
  type BbtiCompareReport,
} from "@/data/bbti-rivalries";
import { getBbtiType } from "@/data/bbti";
import {
  type BbtiCompareDeepLink,
  buildBbtiCompareInviteUrl,
  buildBbtiCompareUrl,
  parseBbtiCompareDeepLink,
} from "@/lib/bbti-deep-links";
import { writePendingBbtiCompareInvite } from "@/lib/bbti-session";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";

function readLastCode(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem(BBTI_LAST_RESULT_STORAGE_KEY);
    if (!raw) return "";
    const result = JSON.parse(raw) as StoredBbtiResult;
    return normalizeBbtiCode(result.code);
  } catch {
    return "";
  }
}

function readInitialCompareDeepLink(): BbtiCompareDeepLink {
  if (typeof window === "undefined") {
    return { codeA: null, codeB: null, hasCompareParams: false };
  }
  return parseBbtiCompareDeepLink(window.location.search);
}

interface BbtiCompareProps {
  onBack: () => void;
  onRetake: () => void;
}

type CompareCopyState = "idle" | "report" | "invite" | "rematch" | "failed";

const COPY_STATE_LABELS: Record<CompareCopyState, string> = {
  idle: "待复制",
  report: "双人报告已复制",
  invite: "邀请链接已复制",
  rematch: "复赛追问已复制",
  failed: "复制失败，请重试",
};

export function BbtiCompareProgramPanel({ report }: { report: BbtiCompareReport }) {
  return (
    <section
      data-testid="bbti-compare-report-program"
      data-bbti-compare-report-version={report.version}
      data-bbti-compare-report-code-a={report.codeA}
      data-bbti-compare-report-code-b={report.codeB}
      data-bbti-compare-report-score={report.score}
      data-bbti-compare-program-count={report.program.length}
      className="mb-5"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/25">
          Postgame Program
        </p>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-black text-white/35">
          LOCAL
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {report.program.map((segment, index) => (
          <article
            key={segment.id}
            data-testid="bbti-compare-program-row"
            data-bbti-compare-program={segment.id}
            data-bbti-compare-program-qa={segment.qaKey}
            data-bbti-compare-program-position={index + 1}
            className="rounded-xl border border-white/10 bg-black/18 p-3"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-kobe-gold/70">
              {segment.kicker}
            </p>
            <h3 className="mt-1 text-sm font-black text-white">{segment.title}</h3>
            <p className="mt-2 text-[11px] leading-relaxed text-white/62">{segment.body}</p>
          </article>
        ))}
      </div>

      <article
        data-testid="bbti-compare-rematch-plan"
        data-bbti-compare-rematch-version={report.version}
        data-bbti-compare-rematch-code-a={report.codeA}
        data-bbti-compare-rematch-code-b={report.codeB}
        className="mt-3 rounded-xl border border-kobe-gold/20 bg-kobe-gold/[0.06] p-4"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-sm font-black text-white">{report.rematchPlan.title}</h3>
          <span className="shrink-0 rounded-full bg-black/24 px-2.5 py-1 text-[10px] font-black text-kobe-gold/80">
            REMATCH
          </span>
        </div>
        <p className="text-xs leading-relaxed text-white/70">{report.rematchPlan.setup}</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <p className="rounded-lg border border-white/10 bg-black/18 px-3 py-2 text-[11px] leading-relaxed text-white/62">
            {report.rematchPlan.firstPossession}
          </p>
          <p className="rounded-lg border border-white/10 bg-black/18 px-3 py-2 text-[11px] leading-relaxed text-white/62">
            {report.rematchPlan.counter}
          </p>
        </div>
        <p className="mt-2 text-[11px] font-bold text-white/38">{report.rematchPlan.copyCue}</p>
      </article>
    </section>
  );
}

export function BbtiDuoRematchPromptsPanel({
  copyState = "idle",
  onCopy,
  report,
}: {
  copyState?: "idle" | "copied" | "failed";
  onCopy?: () => void;
  report: BbtiCompareReport;
}) {
  return (
    <section
      data-testid="bbti-duo-rematch-prompts"
      data-bbti-duo-rematch-prompts-version={report.rematchPromptsVersion}
      data-bbti-duo-rematch-version={report.rematchPromptsVersion}
      data-bbti-duo-rematch-prompts-code-a={report.codeA}
      data-bbti-duo-rematch-code-a={report.codeA}
      data-bbti-duo-rematch-prompts-code-b={report.codeB}
      data-bbti-duo-rematch-code-b={report.codeB}
      data-bbti-duo-rematch-anchor-axis={report.rematchPrompts[0]?.axisKey ?? "mirror"}
      data-bbti-duo-rematch-prompts-count={report.rematchPrompts.length}
      data-bbti-duo-rematch-count={report.rematchPrompts.length}
      className="mb-5 rounded-2xl border border-lebron-gold/15 bg-lebron-gold/[0.045] p-4"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-lebron-gold/55">
            Rematch Prompts
          </p>
          <h3 className="mt-1 text-base font-black text-white">
            复赛追问板
          </h3>
          <p className="mt-1 text-xs font-bold leading-relaxed text-white/45">
            把分歧轴压成三句能继续开战的群聊题。
          </p>
        </div>
        <button
          type="button"
          onClick={onCopy}
          data-testid="bbti-duo-rematch-prompts-action"
          data-bbti-duo-rematch-prompts-action="copy-prompts"
          data-bbti-duo-rematch-action="copy-prompts"
          className="shrink-0 rounded-full border border-lebron-gold/18 bg-white/[0.04] px-3 py-2 text-[11px] font-black text-lebron-gold/75 transition-colors hover:bg-lebron-gold/10 hover:text-white"
        >
          {copyState === "failed" ? "复制失败" : copyState === "copied" ? "已复制" : "复制追问"}
        </button>
      </div>

      <div className="grid gap-2">
        {report.rematchPrompts.map((prompt, index) => (
          <article
            key={prompt.id}
            data-testid="bbti-duo-rematch-prompt"
            data-bbti-duo-rematch-prompt={prompt.id}
            data-bbti-duo-rematch-prompt-axis={prompt.axisKey}
            data-bbti-duo-rematch-prompt-qa={prompt.qaKey}
            data-bbti-duo-rematch-prompt-position={index + 1}
            data-bbti-duo-rematch-position={index + 1}
            className="rounded-xl border border-white/10 bg-black/18 p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[10px] font-black text-lebron-gold/60">
                {prompt.label} · {prompt.title}
              </p>
              <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-black text-white/34">
                {index + 1}
              </span>
            </div>
            <p className="text-xs font-bold leading-relaxed text-white/72">
              {prompt.question}
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-white/42">
              {prompt.constraint}
            </p>
          </article>
        ))}
      </div>

      <p
        data-testid="bbti-duo-rematch-boundary"
        data-bbti-duo-rematch-boundary={report.rematchPromptsVersion}
        className="mt-2 text-[10px] font-bold leading-relaxed text-white/34"
      >
        {report.rematchPromptsBoundary}
      </p>
    </section>
  );
}

export default function BbtiCompare({ onBack, onRetake }: BbtiCompareProps) {
  const [initialDeepLink] = useState(() => readInitialCompareDeepLink());
  const [lastSavedCode] = useState(() => readLastCode());
  const [codeA, setCodeA] = useState(() => initialDeepLink.codeA ?? lastSavedCode);
  const [codeB, setCodeB] = useState(() => initialDeepLink.codeB ?? "");
  const [ownerA, setOwnerA] = useState(() => (initialDeepLink.codeA && !initialDeepLink.codeB ? "TA" : "你"));
  const [ownerB, setOwnerB] = useState(() => (initialDeepLink.codeA && !initialDeepLink.codeB ? "你" : "朋友"));
  const [activeSlot, setActiveSlot] = useState<"a" | "b">(() =>
    initialDeepLink.codeA && !initialDeepLink.codeB ? "b" : "a",
  );
  const copyFeedback = useGuardedClipboard<Exclude<CompareCopyState, "idle" | "failed">>();

  const normalizedA = normalizeBbtiCode(codeA);
  const normalizedB = normalizeBbtiCode(codeB);
  const validA = isBbtiCode(normalizedA);
  const validB = isBbtiCode(normalizedB);
  const validLastSavedCode = isBbtiCode(lastSavedCode);
  const canSwapCodes = validA && validB;
  const waitingForReceiverCode = validA && !validB && ownerA !== "你";
  const canCopyInvite = validA && !validB && ownerA === "你";
  const waitingForReceiverTitle = validA
    ? `${ownerA} 已上场：${normalizedA} · ${getBbtiType(normalizedA).name}`
    : "等两个有效 Code";
  const shareBaseHref = useMemo(() => {
    return typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}`
      : undefined;
  }, []);
  const report = useMemo(
    () => (validA && validB ? getBbtiCompareReport(normalizedA, normalizedB) : null),
    [normalizedA, normalizedB, validA, validB],
  );
  const compareState = report ? "report" : waitingForReceiverCode ? "invite" : "empty";
  const copyState: CompareCopyState = copyFeedback.feedback.status === "copied" && copyFeedback.feedback.actionId
    ? copyFeedback.feedback.actionId
    : copyFeedback.feedback.status === "failed"
      ? "failed"
      : "idle";

  const clearCopyFeedback = () => {
    copyFeedback.clearFeedback();
  };

  const updateCodeA = (value: string) => {
    clearCopyFeedback();
    setActiveSlot("a");
    setCodeA(value);
  };

  const updateCodeB = (value: string) => {
    clearCopyFeedback();
    setActiveSlot("b");
    setCodeB(value);
  };

  const swapCodes = () => {
    if (!canSwapCodes) return;

    clearCopyFeedback();
    setCodeA(codeB);
    setCodeB(codeA);
    setOwnerA(ownerB);
    setOwnerB(ownerA);
    setActiveSlot(activeSlot === "a" ? "b" : "a");
  };

  const clearCodes = () => {
    clearCopyFeedback();
    setCodeA("");
    setCodeB("");
    setOwnerA(initialDeepLink.codeA && !initialDeepLink.codeB ? "TA" : "你");
    setOwnerB(initialDeepLink.codeA && !initialDeepLink.codeB ? "你" : "朋友");
    setActiveSlot(initialDeepLink.codeA && !initialDeepLink.codeB ? "b" : "a");
  };

  const cleanCompareInviteQuery = () => {
    if (typeof window === "undefined") return;

    window.history.replaceState(null, "", `${window.location.origin}${window.location.pathname}`);
  };

  const startReceiverQuizFromInvite = () => {
    if (validA) {
      writePendingBbtiCompareInvite(normalizedA);
      cleanCompareInviteQuery();
    }
    onRetake();
  };

  const fillReceiverFromLastResult = () => {
    if (!validLastSavedCode) {
      startReceiverQuizFromInvite();
      return;
    }

    updateCodeB(lastSavedCode);
  };

  const copyText = (text: string, successState: Exclude<CompareCopyState, "idle" | "failed">) => {
    copyFeedback.copyText(text, successState);
  };

  const copyShare = () => {
    if (!report) return;
    const url = buildBbtiCompareUrl(report.codeA, report.codeB, shareBaseHref);
    copyText(buildBbtiCompareReportCopy({ report, url }), "report");
  };

  const copyRematchPrompts = () => {
    if (!report) return;
    const url = buildBbtiCompareUrl(report.codeA, report.codeB, shareBaseHref);
    copyText(buildBbtiDuoRematchPromptCopy({ report, url }), "rematch");
  };

  const copyInvite = () => {
    if (!validA) return;

    const inviteUrl = buildBbtiCompareInviteUrl(normalizedA, shareBaseHref);
    copyText(`来测你的 BBTI，测完跟我生成双人球脑化学反应报告：\n${inviteUrl}`, "invite");
  };

  const renderManualCopyFallback = () =>
    copyFeedback.feedback.manualCopyText ? (
      <div className="mt-3 rounded-xl border border-red-300/15 bg-red-300/[0.05] p-3">
        <p className="mb-2 text-[11px] font-bold text-red-100/70">
          自动复制失败，长按下方文案复制。
        </p>
        <textarea
          readOnly
          value={copyFeedback.feedback.manualCopyText}
          className="h-24 w-full resize-none rounded-lg border border-white/10 bg-black/30 p-2 text-[11px] leading-relaxed text-white/65 outline-none"
        />
      </div>
    ) : null;

  return (
    <div
      data-testid="bbti-compare-shell"
      data-bbti-compare-state={compareState}
      data-bbti-compare-code-a={validA ? normalizedA : ""}
      data-bbti-compare-code-b={validB ? normalizedB : ""}
      className="min-h-screen flex flex-col items-center px-4 py-10 relative overflow-hidden"
    >
      <button
        onClick={onBack}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 text-xs sm:text-sm text-white/40 hover:text-white/80 transition-colors cursor-pointer"
      >
        &larr; 返回
      </button>

      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <p className="text-kobe-gold text-xs font-black tracking-[0.22em] uppercase mb-2">
            BBTI DUO REPORT
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-3">
            双人球脑化学反应
          </h1>
          <p className="text-white/45 text-sm sm:text-base">
            输入两个 BBTI Code，看你们适合当王朝双核，还是适合在群聊互怼到加时
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { field: "a", label: ownerA, value: codeA, valid: validA, placeholder: "OAIL" },
                { field: "b", label: ownerB, value: codeB, valid: validB, placeholder: "DETR" },
              ].map((item) => (
                <label key={item.label} className="block">
                  <span className="block text-xs text-white/35 mb-2">{item.label}的 Code</span>
                  <input
                    data-testid="bbti-compare-code-input"
                    data-bbti-compare-slot={item.field}
                    data-bbti-compare-valid={item.valid ? "true" : "false"}
                    value={item.value}
                    onChange={(event) => {
                      const nextCode = normalizeBbtiCode(event.target.value);
                      if (item.field === "a") {
                        updateCodeA(nextCode);
                      } else {
                        updateCodeB(nextCode);
                      }
                    }}
                    onPaste={(event) => {
                      event.preventDefault();
                      const pastedCode = extractBbtiCode(event.clipboardData.getData("text"));
                      if (item.field === "a") {
                        updateCodeA(pastedCode);
                      } else {
                        updateCodeB(pastedCode);
                      }
                    }}
                    placeholder={item.placeholder}
                    onFocus={() => setActiveSlot(item.field as "a" | "b")}
                    className={`w-full h-14 rounded-xl border bg-black/25 px-3 text-center text-2xl font-black tracking-widest text-white outline-none transition-colors ${
                      item.value.length === 0
                        ? "border-white/10 focus:border-white/35"
                        : item.valid
                          ? "border-kobe-gold/60"
                          : "border-red-400/60"
                    }`}
                  />
                </label>
              ))}
            </div>

            <button
              type="button"
              data-testid="bbti-compare-action"
              data-bbti-compare-action="swap"
              onClick={swapCodes}
              disabled={!canSwapCodes}
              title={canSwapCodes ? "交换你/TA位置" : "两边都有有效 Code 后再交换"}
              className="mb-4 h-10 w-full rounded-full border border-white/10 bg-white/[0.03] text-xs font-black text-white/48 transition-colors hover:border-kobe-gold/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            >
              {canSwapCodes ? "交换你/TA位置" : "两边都有 Code 后再交换"}
            </button>

            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/25">
                Quick Fill
              </span>
              <div className="grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-black/18 p-1">
                {[
                  { slot: "a" as const, label: ownerA },
                  { slot: "b" as const, label: ownerB },
                ].map((item) => (
                  <button
                    key={item.slot}
                    type="button"
                    data-testid="bbti-compare-slot-toggle"
                    data-bbti-compare-slot={item.slot}
                    aria-pressed={activeSlot === item.slot}
                    onClick={() => setActiveSlot(item.slot)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-black transition-colors ${
                      activeSlot === item.slot
                        ? "bg-kobe-gold text-black"
                        : "text-white/38 hover:text-white/70"
                    }`}
                  >
                    写入{item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-5">
              {BBTI_CODES.map((code) => {
                const type = getBbtiType(code);
                return (
                  <button
                    key={code}
                    type="button"
                    data-testid="bbti-compare-code-chip"
                    data-bbti-compare-code-chip={code}
                    data-bbti-compare-target-slot={activeSlot}
                    onClick={() => (activeSlot === "a" ? updateCodeA(code) : updateCodeB(code))}
                    className="h-10 rounded-lg border border-white/10 bg-white/[0.03] text-[11px] font-black text-white/70 hover:border-kobe-gold/50 hover:text-white transition-colors cursor-pointer"
                    title={type.name}
                  >
                    {code}
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl bg-black/20 border border-white/10 p-4 mb-4">
              <p className="text-xs text-white/35 mb-1">输入规则</p>
              <p className="text-xs text-white/65 leading-relaxed">
                第1位 O/D，第二位 A/E，第三位 I/T，第四位 L/R。可直接粘贴朋友分享文案，系统会提取第一个合法 Code。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                data-testid="bbti-compare-action"
                data-bbti-compare-action={canCopyInvite ? "copy-invite" : waitingForReceiverCode ? "fill-receiver" : "retake"}
                onClick={canCopyInvite ? copyInvite : waitingForReceiverCode ? fillReceiverFromLastResult : onRetake}
                className="h-12 rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white font-bold transition-colors cursor-pointer"
              >
                {canCopyInvite
                  ? copyState === "failed"
                    ? "复制失败"
                    : copyState === "invite"
                      ? "已复制邀请"
                      : "邀请朋友"
                  : waitingForReceiverCode
                    ? validLastSavedCode
                      ? "用上次结果补位"
                      : "先测我的 BBTI"
                  : "重新测试"}
              </button>
              <button
                type="button"
                data-testid="bbti-compare-action"
                data-bbti-compare-action="clear"
                onClick={clearCodes}
                className="h-12 rounded-full border border-white/10 text-white/50 hover:border-white/35 hover:text-white font-bold transition-colors cursor-pointer"
              >
                清空
              </button>
            </div>

            {!report && (
              <p
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className={`mt-3 text-center text-[11px] font-bold ${
                  copyState === "failed"
                    ? "text-red-200/70"
                    : copyState === "idle"
                      ? "text-white/28"
                      : "text-kobe-gold/80"
                }`}
              >
                {COPY_STATE_LABELS[copyState]}
              </p>
            )}
            {!report && renderManualCopyFallback()}
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 min-h-[520px]">
            {!report ? (
              <div className="h-full min-h-[440px] flex flex-col items-center justify-center text-center">
                <div className="text-6xl mb-5">🏀</div>
                <p className="text-xl font-black text-white mb-2">
                  {waitingForReceiverCode ? waitingForReceiverTitle : "等两个有效 Code"}
                </p>
                <p className="text-white/40 text-sm max-w-sm">
                  {waitingForReceiverCode
                    ? `填${ownerB}的 Code，生成双人球脑化学反应。`
                    : "例：OAIL vs DETR。你可以先完成一次测试，也可以直接输入朋友截图里的四字母。"}
                </p>
              </div>
            ) : (
              <div
                data-testid="bbti-compare-report"
                data-bbti-compare-report-version={report.version}
                data-bbti-compare-report-code-a={report.codeA}
                data-bbti-compare-report-code-b={report.codeB}
                data-bbti-compare-report-score={report.score}
              >
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/25">
                  Chemistry
                </p>
                <div className="grid grid-cols-1 items-center gap-2 mb-6 sm:grid-cols-[1fr_auto_1fr] sm:gap-3">
                  <div className="rounded-2xl border border-kobe-gold/20 bg-kobe-purple/20 p-3 text-center sm:p-4">
                    <div className="text-3xl mb-1">{report.typeA.emoji}</div>
                    <p className="text-xl font-black text-kobe-gold sm:text-2xl">{report.codeA}</p>
                    <p className="text-xs font-bold text-white sm:text-sm">{report.typeA.name}</p>
                  </div>
                  <div className="text-center text-white/30 text-xl font-black">VS</div>
                  <div className="rounded-2xl border border-lebron-gold/20 bg-lebron-wine/20 p-3 text-center sm:p-4">
                    <div className="text-3xl mb-1">{report.typeB.emoji}</div>
                    <p className="text-xl font-black text-lebron-gold sm:text-2xl">{report.codeB}</p>
                    <p className="text-xs font-bold text-white sm:text-sm">{report.typeB.name}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 mb-5 text-center">
                  <p className="text-xs text-white/35 mb-1">本地 BBTI 化学反应分 · {report.tier}</p>
                  <p className="text-5xl sm:text-6xl font-black text-white mb-2">{report.score}%</p>
                  <h2 className="text-xl sm:text-2xl font-black text-kobe-gold mb-2">{report.title}</h2>
                  <p className="text-white/65 text-sm leading-relaxed">{report.courtChemistry}</p>
                </div>

                <BbtiCompareProgramPanel report={report} />
                <BbtiDuoRematchPromptsPanel
                  copyState={copyState === "rematch" ? "copied" : copyState === "failed" ? "failed" : "idle"}
                  onCopy={copyRematchPrompts}
                  report={report}
                />

                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/25">
                  Locker Room Replay
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  {[
                    { id: "group-chat", label: "群聊剧本", value: report.groupChat },
                    { id: "coach-note", label: "教练提醒", value: report.coachNote },
                    { id: "danger", label: "危险点", value: report.danger },
                    { id: "challenge", label: "互怼挑战", value: report.challenge },
                  ].map((item) => (
                    <div
                      key={item.id}
                      data-testid="bbti-compare-replay-card"
                      data-bbti-compare-replay={item.id}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <p className="text-[11px] text-white/30 mb-1">{item.label}</p>
                      <p className="text-xs sm:text-sm text-white/75 leading-relaxed">{item.value}</p>
                    </div>
                  ))}
                </div>

                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/25">
                  Four-Axis Matchup
                </p>
                <div className="space-y-2 mb-5">
                  {[...report.sharedAxes, ...report.clashAxes].map((axis, index) => {
                    const shared = report.sharedAxes.includes(axis);
                    return (
                      <div
                        key={axis.key}
                        data-testid="bbti-compare-axis"
                        data-bbti-compare-axis={axis.key}
                        data-bbti-compare-axis-position={index + 1}
                        data-bbti-compare-axis-state={shared ? "shared" : "clash"}
                        className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="text-sm font-black text-white">{axis.label}</span>
                          <span className={`text-[11px] font-bold ${shared ? "text-green-400" : "text-yellow-300"}`}>
                            {shared ? "同频" : "拉扯"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs text-white/50 mb-1">
                          <span>{axis.left}</span>
                          <span>{axis.right}</span>
                        </div>
                        <p className="text-xs text-white/65 leading-relaxed">{axis.verdict}</p>
                      </div>
                    );
                  })}
                </div>

                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/25">
                  Invite Share
                </p>
                <button
                  type="button"
                  data-testid="bbti-compare-action"
                  data-bbti-compare-action="copy-report"
                  onClick={copyShare}
                  className="w-full min-h-[52px] rounded-full bg-gradient-to-r from-kobe-purple to-lebron-wine text-white font-black hover:scale-[1.01] active:scale-[0.99] transition-transform cursor-pointer"
                >
                  {copyState === "failed" ? "复制失败，请重试" : copyState === "report" ? "已复制对比报告" : "复制双人报告"}
                </button>
                <p
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  className={`mt-2 text-center text-[11px] font-bold ${
                    copyState === "failed"
                      ? "text-red-200/70"
                      : copyState === "idle"
                        ? "text-white/28"
                        : "text-kobe-gold/80"
                  }`}
                >
                  {COPY_STATE_LABELS[copyState]}
                </p>
                {renderManualCopyFallback()}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
