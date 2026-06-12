"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

export interface BbtiShareTarget {
  id: string;
  title: string;
  tag: string;
  copy: string;
  url: string;
  linkLabel: string;
  channelLabel?: string;
  audience?: string;
  intent?: string;
  composerHint?: string;
  actionLabel?: string;
  copyButtonLabel?: string;
  linkBadge?: string;
  boundaryNote?: string;
}

interface BbtiShareTargetPickerProps {
  targets: BbtiShareTarget[];
}

const SHARE_STATE_LABELS: Record<"idle" | "shared" | "copied", string> = {
  idle: "待分享",
  shared: "已交给系统分享",
  copied: "已复制，可直接粘贴",
};

function shortUrl(value: string): string {
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function sharePayload(target: BbtiShareTarget): string {
  return `${target.copy}\n${target.url}`;
}

export default function BbtiShareTargetPicker({ targets }: BbtiShareTargetPickerProps) {
  const [activeId, setActiveId] = useState(targets[0]?.id ?? "");
  const [shareState, setShareState] = useState<"idle" | "shared" | "copied" | "failed">("idle");
  const [manualCopyText, setManualCopyText] = useState("");
  const operationIdRef = useRef(0);
  const resetTimerRef = useRef<number | null>(null);
  const active = useMemo(
    () => targets.find((target) => target.id === activeId) ?? targets[0],
    [activeId, targets],
  );
  const activeManualCopyText = useMemo(
    () => active ? sharePayload(active) : "",
    [active],
  );

  const clearResetTimer = () => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  };

  const beginOperation = () => {
    operationIdRef.current += 1;
    clearResetTimer();
    return operationIdRef.current;
  };

  const setOperationState = (
    operationId: number,
    nextState: "idle" | "shared" | "copied" | "failed",
  ) => {
    if (operationIdRef.current === operationId) {
      setShareState(nextState);
    }
  };

  const resetState = (operationId: number) => {
    clearResetTimer();
    resetTimerRef.current = window.setTimeout(() => {
      setOperationState(operationId, "idle");
      resetTimerRef.current = null;
    }, 1700);
  };

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  if (!active) return null;

  const copyText = (text: string, operationId = beginOperation()) => {
    if (operationIdRef.current !== operationId) return;
    setManualCopyText("");

    if (!navigator.clipboard?.writeText) {
      setOperationState(operationId, "failed");
      if (operationIdRef.current === operationId) {
        setManualCopyText(text);
      }
      resetState(operationId);
      return;
    }

    navigator.clipboard.writeText(text).then(
      () => {
        setOperationState(operationId, "copied");
        if (operationIdRef.current === operationId) {
          setManualCopyText("");
        }
        resetState(operationId);
      },
      () => {
        setOperationState(operationId, "failed");
        if (operationIdRef.current === operationId) {
          setManualCopyText(text);
        }
        resetState(operationId);
      },
    );
  };

  const shareActive = () => {
    const operationId = beginOperation();
    const target = active;

    if (navigator.share) {
      navigator.share({
        title: target.title,
        text: target.copy,
        url: target.url,
      })
        .then(() => {
          setOperationState(operationId, "shared");
          resetState(operationId);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            setOperationState(operationId, "idle");
            return;
          }

          copyText(sharePayload(target), operationId);
        });
      return;
    }

    copyText(sharePayload(target), operationId);
  };

  const copyAll = () => {
    copyText(
      targets
        .map((target) => [`【${target.channelLabel ?? target.title}】`, sharePayload(target)].join("\n"))
        .join("\n\n"),
    );
  };

  const selectTarget = (targetId: string) => {
    beginOperation();
    setActiveId(targetId);
    setShareState("idle");
    setManualCopyText("");
  };

  return (
    <div
      data-testid="bbti-share-target-picker"
      data-bbti-share-target-count={targets.length}
      data-bbti-share-target-active={active.id}
      className="mb-4 rounded-2xl border border-white/10 bg-black/24 p-3"
    >
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
            Main Target
          </p>
          <h3 className="mt-1 text-base font-black text-white">主分享目标</h3>
          <p className="mt-0.5 text-xs text-white/38">这次发给谁？</p>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black text-white/38">
          {targets.length} TARGETS
        </span>
      </div>

      <div
        role="group"
        aria-label="选择分享目标"
        className="mb-3 flex gap-1.5 overflow-x-auto pb-1"
      >
        {targets.map((target, index) => (
          <button
            key={target.id}
            type="button"
            data-testid="bbti-share-target-option"
            data-bbti-share-target-id={target.id}
            data-bbti-share-target-position={index + 1}
            data-bbti-share-target-selected={active.id === target.id ? "true" : "false"}
            aria-pressed={active.id === target.id}
            onClick={() => selectTarget(target.id)}
            className={`shrink-0 rounded-full border px-3 py-2 text-[10px] font-black transition-colors ${
              active.id === target.id
                ? "border-kobe-gold bg-kobe-gold text-black"
                : "border-white/10 bg-white/[0.04] text-white/48 hover:text-white/78"
            }`}
          >
            {target.channelLabel ?? target.title}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="min-w-0 truncate rounded-full bg-black/24 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-kobe-gold/80">
            {active.tag}
          </span>
          <span
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={`shrink-0 text-[10px] font-black ${
              shareState === "failed"
                ? "text-red-200/70"
                : shareState === "idle"
                  ? "text-white/34"
                  : "text-kobe-gold/80"
            }`}
          >
            {shareState === "failed"
              ? manualCopyText
                ? "自动复制失败，可手动复制"
                : "复制失败，请重试"
              : SHARE_STATE_LABELS[shareState]}
          </span>
        </div>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {[
            active.audience,
            active.linkBadge,
          ].filter(Boolean).map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-black/18 px-2 py-0.5 text-[10px] font-bold text-white/44"
            >
              {item}
            </span>
          ))}
        </div>
        <p className="mb-1 text-sm font-black text-white">{active.title}</p>
        {active.intent && (
          <p className="mb-2 text-[11px] font-bold leading-relaxed text-white/52">
            {active.intent}
          </p>
        )}
        <p className="mb-2 text-[11px] font-bold text-white/34">{active.linkLabel}</p>
        <p className="line-clamp-4 whitespace-pre-line text-xs leading-relaxed text-white/68">
          {active.copy}
        </p>
        {active.composerHint && (
          <p className="mt-2 text-[11px] leading-relaxed text-white/34">
            {active.composerHint}
          </p>
        )}
        {active.boundaryNote && (
          <p className="mt-1 text-[10px] font-bold leading-relaxed text-white/28">
            {active.boundaryNote}
          </p>
        )}
        <div className="mt-3 rounded-lg border border-white/10 bg-black/24 px-3 py-2">
          <p className="truncate font-mono text-[11px] text-white/42">{shortUrl(active.url)}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          data-testid="bbti-share-target-action"
          data-bbti-share-target-action="system-share"
          onClick={shareActive}
          className="rounded-full bg-white/90 px-4 py-2.5 text-xs font-black text-black transition-colors hover:bg-white"
        >
          {active.actionLabel ?? "发出去"}
        </button>
        <button
          type="button"
          data-testid="bbti-share-target-action"
          data-bbti-share-target-action="copy-active"
          onClick={() => copyText(sharePayload(active))}
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-black text-white/65 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          {active.copyButtonLabel ?? "复制当前"}
        </button>
        <button
          type="button"
          data-testid="bbti-share-target-action"
          data-bbti-share-target-action="copy-all"
          onClick={copyAll}
          className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-black text-white/45 transition-colors hover:bg-white/[0.07] hover:text-white/75"
        >
          复制整套战术板
        </button>
      </div>
      <BbtiManualCopyFallback
        text={manualCopyText || activeManualCopyText}
        title={manualCopyText
          ? "自动复制失败，长按下方主分享文案复制。"
          : "系统分享打不开时，也可以手动复制这段。"}
        tone={manualCopyText ? "error" : "neutral"}
        className="mt-3"
      />
    </div>
  );
}
