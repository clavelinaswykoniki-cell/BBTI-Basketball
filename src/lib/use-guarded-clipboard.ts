"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ClipboardFeedbackStatus = "idle" | "copied" | "failed";

export interface ClipboardFeedback<ActionId extends string> {
  actionId: ActionId | null;
  manualCopyText: string;
  status: ClipboardFeedbackStatus;
}

const EMPTY_FEEDBACK = {
  actionId: null,
  manualCopyText: "",
  status: "idle",
} as const;

export function useGuardedClipboard<ActionId extends string>(resetDelayMs = 1800) {
  const [feedback, setFeedback] = useState<ClipboardFeedback<ActionId>>(EMPTY_FEEDBACK);
  const operationRef = useRef(0);
  const resetTimerRef = useRef<number | null>(null);

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const beginOperation = useCallback(() => {
    operationRef.current += 1;
    clearResetTimer();
    return operationRef.current;
  }, [clearResetTimer]);

  const setFeedbackForOperation = useCallback((
    operationId: number,
    nextFeedback: ClipboardFeedback<ActionId>,
  ) => {
    if (operationRef.current === operationId) {
      setFeedback(nextFeedback);
    }
  }, []);

  const scheduleReset = useCallback((operationId: number) => {
    clearResetTimer();
    resetTimerRef.current = window.setTimeout(() => {
      if (operationRef.current === operationId) {
        setFeedback((current) => ({
          ...current,
          actionId: null,
          status: "idle",
        }));
      }
      resetTimerRef.current = null;
    }, resetDelayMs);
  }, [clearResetTimer, resetDelayMs]);

  useEffect(() => {
    return () => clearResetTimer();
  }, [clearResetTimer]);

  const clearFeedback = useCallback(() => {
    beginOperation();
    setFeedback(EMPTY_FEEDBACK);
  }, [beginOperation]);

  const copyText = useCallback((text: string, actionId: ActionId) => {
    const operationId = beginOperation();
    setFeedback(EMPTY_FEEDBACK);

    if (!navigator.clipboard?.writeText) {
      setFeedbackForOperation(operationId, {
        actionId,
        manualCopyText: text,
        status: "failed",
      });
      scheduleReset(operationId);
      return;
    }

    navigator.clipboard.writeText(text).then(
      () => {
        setFeedbackForOperation(operationId, {
          actionId,
          manualCopyText: "",
          status: "copied",
        });
        scheduleReset(operationId);
      },
      () => {
        setFeedbackForOperation(operationId, {
          actionId,
          manualCopyText: text,
          status: "failed",
        });
        scheduleReset(operationId);
      },
    );
  }, [beginOperation, scheduleReset, setFeedbackForOperation]);

  const isCopied = useCallback((actionId: ActionId) => (
    feedback.status === "copied" && feedback.actionId === actionId
  ), [feedback]);

  const isFailed = useCallback((actionId: ActionId) => (
    feedback.status === "failed" && feedback.actionId === actionId
  ), [feedback]);

  return {
    clearFeedback,
    copyText,
    feedback,
    isCopied,
    isFailed,
  };
}
