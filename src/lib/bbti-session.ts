import type { BbtiAnswer } from "@/data/bbti";

export const BBTI_DRAFT_STORAGE_KEY = "bbti:draft-v1";
export const BBTI_DRAFT_TTL_MS = 1000 * 60 * 60 * 24 * 14;
export const BBTI_PENDING_COMPARE_INVITE_STORAGE_KEY = "bbti:pending-compare-invite-v1";
export const BBTI_PENDING_COMPARE_INVITE_TTL_MS = 1000 * 60 * 60 * 48;
const BBTI_CODE_PATTERN = /^[OD][AE][IT][LR]$/;

export type BbtiMode = "blitz" | "quick" | "full";

export interface BbtiDraft {
  version: 1;
  mode: BbtiMode;
  current: number;
  total: number;
  questionIds: number[];
  answers: BbtiAnswer[];
  openText: string;
  updatedAt: string;
}

export interface PendingBbtiCompareInvite {
  version: 1;
  codeA: string;
  createdAt: string;
}

export interface BbtiDraftSummary {
  completed: number;
  modeLabel: string;
  resumeQuestion: number;
  savedAtLabel: string;
  total: number;
}

export function modeDisplayName(mode: BbtiMode): string {
  if (mode === "full") return "抢七长卷";
  if (mode === "quick") return "常规赛版";
  return "快攻版";
}

function isBbtiMode(value: unknown): value is BbtiMode {
  return value === "blitz" || value === "quick" || value === "full";
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

export function formatBbtiDraftTime(updatedAt: string): string {
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return "刚刚";
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isExpiredTimestamp(timestamp: string, ttlMs: number): boolean {
  const updatedAtTime = new Date(timestamp).getTime();
  return Number.isNaN(updatedAtTime) || Date.now() - updatedAtTime > ttlMs;
}

export function getBbtiDraftSummary(draft: BbtiDraft): BbtiDraftSummary {
  const total = Math.max(draft.total, 1);
  const completed = Math.min(Math.max(draft.answers.length, 0), total);

  return {
    completed,
    modeLabel: modeDisplayName(draft.mode),
    resumeQuestion: Math.min(Math.max(draft.current + 1, 1), total),
    savedAtLabel: formatBbtiDraftTime(draft.updatedAt),
    total,
  };
}

export function readBbtiDraft(): BbtiDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(BBTI_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as BbtiDraft;
    if (
      draft.version !== 1 ||
      !isBbtiMode(draft.mode) ||
      !isNonNegativeInteger(draft.current) ||
      !isPositiveInteger(draft.total) ||
      !Array.isArray(draft.answers) ||
      !Array.isArray(draft.questionIds) ||
      draft.questionIds.some((questionId) => !isPositiveInteger(questionId)) ||
      typeof draft.openText !== "string" ||
      typeof draft.updatedAt !== "string"
    ) {
      return null;
    }
    if (isExpiredTimestamp(draft.updatedAt, BBTI_DRAFT_TTL_MS)) {
      clearBbtiDraft();
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function readValidBbtiDraft(mode: BbtiMode, questionIds: number[]): BbtiDraft | null {
  const draft = readBbtiDraft();
  if (!draft || draft.mode !== mode) return null;

  const sameQuestions =
    draft.questionIds.length === questionIds.length &&
    draft.questionIds.every((id, index) => id === questionIds[index]);

  if (!sameQuestions) return null;

  const answersById = new Map(draft.answers.map((answer) => [answer.questionId, answer]));
  const answers = questionIds
    .map((questionId) => answersById.get(questionId))
    .filter((answer): answer is BbtiAnswer => Boolean(answer));
  const current = Math.min(Math.max(draft.current, answers.length, 0), Math.max(questionIds.length - 1, 0));

  return {
    ...draft,
    total: questionIds.length,
    answers,
    current,
    questionIds,
  };
}

export function writeBbtiDraft(draft: Omit<BbtiDraft, "updatedAt" | "version">): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      BBTI_DRAFT_STORAGE_KEY,
      JSON.stringify({
        ...draft,
        version: 1,
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch {
    // Quiz remains playable when storage is unavailable.
  }
}

export function clearBbtiDraft(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(BBTI_DRAFT_STORAGE_KEY);
  } catch {
    // Nothing to recover when storage is unavailable.
  }
}

function normalizeBbtiCode(raw: string | null | undefined): string | null {
  const code = raw?.trim().toUpperCase() ?? "";
  return BBTI_CODE_PATTERN.test(code) ? code : null;
}

export function readPendingBbtiCompareInvite(): PendingBbtiCompareInvite | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(BBTI_PENDING_COMPARE_INVITE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PendingBbtiCompareInvite;
    const codeA = normalizeBbtiCode(parsed.codeA);
    const createdAtTime = new Date(parsed.createdAt).getTime();
    const expired = Number.isNaN(createdAtTime)
      || Date.now() - createdAtTime > BBTI_PENDING_COMPARE_INVITE_TTL_MS;

    if (parsed.version !== 1 || !codeA || expired) {
      clearPendingBbtiCompareInvite();
      return null;
    }

    return {
      version: 1,
      codeA,
      createdAt: parsed.createdAt,
    };
  } catch {
    return null;
  }
}

export function writePendingBbtiCompareInvite(code: string): void {
  if (typeof window === "undefined") return;

  const codeA = normalizeBbtiCode(code);
  if (!codeA) return;

  try {
    localStorage.setItem(
      BBTI_PENDING_COMPARE_INVITE_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        codeA,
        createdAt: new Date().toISOString(),
      }),
    );
  } catch {
    // Compare invite handoff is optional; blocked storage falls back to the old flow.
  }
}

export function clearPendingBbtiCompareInvite(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(BBTI_PENDING_COMPARE_INVITE_STORAGE_KEY);
  } catch {
    // Nothing to recover when storage is unavailable.
  }
}
