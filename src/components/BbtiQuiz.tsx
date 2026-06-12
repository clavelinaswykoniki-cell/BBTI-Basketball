"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  bbtiQuestions,
  computeBbtiCode,
  type BbtiAnswer,
  type BbtiQuestion,
} from "../data/bbti";
import {
  getBbtiAnswerReveal,
  type BbtiAnswerReveal as BbtiAnswerRevealData,
} from "@/data/bbti-answer-reveals";
import {
  clearBbtiDraft,
  modeDisplayName,
  readValidBbtiDraft,
  writeBbtiDraft,
  type BbtiMode,
} from "@/lib/bbti-session";
import BbtiAnswerReveal from "./BbtiAnswerReveal";

interface BbtiQuizProps {
  mode: BbtiMode; // 12, 30, or 50 questions
  onComplete: (result: { code: string; answers: BbtiAnswer[] }) => void;
  onExit: () => void;
}

const BLITZ_QUESTION_IDS = new Set([1, 2, 5, 13, 14, 15, 25, 26, 29, 38, 39, 42]);

interface DraftSnapshot {
  answers: BbtiAnswer[];
  current: number;
  openText: string;
}

// ────────────────────────────────────────────────────────────
export default function BbtiQuiz({ mode, onComplete, onExit }: BbtiQuizProps) {
  // Filter questions once based on mode
  const questions: BbtiQuestion[] = useMemo(
    () =>
      (bbtiQuestions ?? []).filter((q: BbtiQuestion) => {
        if (mode === "blitz") return BLITZ_QUESTION_IDS.has(q.id);
        return mode === "full" || q.core;
      }).sort((a: BbtiQuestion, b: BbtiQuestion) => {
        if (a.type === "open" && b.type !== "open") return 1;
        if (a.type !== "open" && b.type === "open") return -1;
        return a.id - b.id;
      }),
    [mode],
  );

  const total = questions.length;
  const questionIds = useMemo(() => questions.map((question) => question.id), [questions]);
  const initialDraft = useMemo(() => readValidBbtiDraft(mode, questionIds), [mode, questionIds]);

  const [current, setCurrent] = useState(() => initialDraft?.current ?? 0);
  const [answers, setAnswers] = useState<BbtiAnswer[]>(() => initialDraft?.answers ?? []);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(true);
  const [confirmExit, setConfirmExit] = useState(false);
  const [openText, setOpenText] = useState(() => initialDraft?.openText ?? "");
  const [selectedFlash, setSelectedFlash] = useState<string | null>(null);
  const [answerReveal, setAnswerReveal] = useState<BbtiAnswerRevealData | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef = useRef(false);
  const latestDraftRef = useRef<DraftSnapshot>({
    answers: initialDraft?.answers ?? [],
    current: initialDraft?.current ?? 0,
    openText: initialDraft?.openText ?? "",
  });

  const saveDraftSnapshot = useCallback(
    (nextAnswers: BbtiAnswer[], nextCurrent: number, nextOpenText: string) => {
      if (completedRef.current || total === 0) return;
      writeBbtiDraft({
        mode,
        current: Math.min(Math.max(nextCurrent, 0), Math.max(total - 1, 0)),
        total,
        questionIds,
        answers: nextAnswers,
        openText: nextOpenText,
      });
    },
    [mode, questionIds, total],
  );

  // Clean up any pending advance timeout on unmount
  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  useEffect(() => {
    latestDraftRef.current = { answers, current, openText };

    if (completedRef.current) return;
    const hasProgress = current > 0 || answers.length > 0 || openText.trim().length > 0;
    if (!hasProgress || total === 0) return;

    saveDraftSnapshot(
      answers,
      Math.max(current, answers.length),
      openText,
    );
  }, [answers, current, openText, saveDraftSnapshot, total]);

  const q = questions[current] as BbtiQuestion | undefined;
  const progress = total > 0 ? ((current + 1) / total) * 100 : 0;
  const isLast = current + 1 >= total;
  const revealDuration = mode === "blitz" ? 500 : 860;

  // ── Advance to next question or finish ────────────────────
  const advance = useCallback(
    (newAnswers: BbtiAnswer[], reveal: BbtiAnswerRevealData | null = null) => {
      if (animating) return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setAnswerReveal(reveal);
      setAnimating(true);
      setVisible(false);

      timeoutRef.current = setTimeout(() => {
        if (current + 1 >= total) {
          const code = computeBbtiCode(newAnswers);
          completedRef.current = true;
          clearBbtiDraft();
          onComplete({ code, answers: newAnswers });
        } else {
          setCurrent((c) => c + 1);
          setVisible(true);
          setOpenText("");
          setSelectedFlash(null);
          setAnswerReveal(null);
          setAnimating(false);
        }
      }, reveal ? revealDuration : 500);
    },
    [animating, current, total, onComplete, revealDuration],
  );

  function commitAnswer(answer: BbtiAnswer, revealAllowed: boolean) {
    if (!q) return;
    const newAnswers = [...answers, answer];
    const nextCurrent = current + 1;
    latestDraftRef.current = {
      answers: newAnswers,
      current: nextCurrent,
      openText: "",
    };
    saveDraftSnapshot(newAnswers, nextCurrent, "");
    setAnswers(newAnswers);
    advance(newAnswers, revealAllowed && !isLast ? getBbtiAnswerReveal(q, answer) : null);
  }

  // ── Binary handler ────────────────────────────────────────
  function handleBinaryClick(which: "A" | "B") {
    if (animating || !q) return;
    const pole = which === "A" ? q.optionA?.pole : q.optionB?.pole;
    setSelectedFlash(pole ?? null);
    const answer: BbtiAnswer = {
      questionId: q.id,
      selected: which,
    };
    commitAnswer(answer, true);
  }

  // ── Multi handler (single-select, auto-advance) ──────────
  function handleMultiClick(index: number) {
    if (animating || !q) return;
    setSelectedFlash(String(index));
    const answer: BbtiAnswer = {
      questionId: q.id,
      selectedIndices: [index],
    };
    commitAnswer(answer, true);
  }

  // ── Open-ended handler ────────────────────────────────────
  function handleOpenSubmit() {
    if (animating || !q || openText.trim().length < 20) return;
    const answer: BbtiAnswer = {
      questionId: q.id,
      text: openText.trim(),
    };
    commitAnswer(answer, false);
  }

  function saveAndExit() {
    const latest = latestDraftRef.current;
    const shouldUseLatest = latest.answers.length > answers.length || latest.current > current;
    saveDraftSnapshot(
      shouldUseLatest ? latest.answers : answers,
      shouldUseLatest ? latest.current : Math.max(current, answers.length),
      shouldUseLatest ? latest.openText : openText,
    );
    onExit();
  }

  function discardAndExit() {
    clearBbtiDraft();
    onExit();
  }

  // ── Empty state ───────────────────────────────────────────
  if (total === 0 || !q) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-white/50 text-lg">题目加载中...</p>
        <button
          onClick={onExit}
          className="mt-6 text-white/30 hover:text-white/60 text-sm transition-colors cursor-pointer"
        >
          返回
        </button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative">
      {/* ─── Exit button ────────────────────────────────── */}
      <button
        onClick={() => setConfirmExit(true)}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 min-h-[48px] min-w-[48px] flex items-center justify-center text-white/30 hover:text-white/60 transition-colors cursor-pointer text-lg"
        aria-label="退出测试"
      >
        ✕
      </button>

      {/* ─── Exit confirmation overlay ──────────────────── */}
      {confirmExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass rounded-2xl p-8 max-w-sm mx-4 text-center">
            <p className="text-white text-lg font-bold mb-2">叫个暂停？</p>
            <p className="text-white/50 text-sm mb-6">
              进度已自动保存，回到入口页可继续第 {Math.min(current + 1, total)}/{total} 题。
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setConfirmExit(false)}
                className="w-full py-3 min-h-[48px] rounded-xl border border-white/10 text-white/65 hover:text-white hover:border-white/30 transition-all cursor-pointer"
              >
                继续答题
              </button>
              <button
                onClick={saveAndExit}
                className="w-full py-3 min-h-[48px] rounded-xl bg-gradient-to-r from-kobe-gold to-lebron-gold text-black font-black hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                保存并返回入口
              </button>
              <button
                onClick={discardAndExit}
                className="w-full py-2 text-xs font-bold text-white/32 hover:text-red-300 transition-colors cursor-pointer"
              >
                放弃本次进度
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Progress bar ───────────────────────────────── */}
      <div className="w-full max-w-xl mb-8">
        <div className="flex justify-between text-xs text-white/30 mb-2">
          <span>{modeDisplayName(mode)}</span>
          <span>第 {current + 1}/{total} 题</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-kobe-gold to-lebron-gold transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <BbtiAnswerReveal reveal={answerReveal} compact={mode === "blitz"} />

      {/* ─── Question card ──────────────────────────────── */}
      <div
        className="w-full max-w-xl min-h-[420px] flex flex-col justify-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-16px)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
        }}
      >
        {/* Question text */}
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
            {q.question}
          </h2>
          {q.type === "open" && (
            <p className="text-white/40 text-sm mt-2">
              请用自己的话回答（不少于 20 字）
            </p>
          )}
        </div>

        {/* ── Binary options ──────────────────────────────── */}
        {q.type === "binary" && q.optionA && q.optionB && (
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Option A — purple side */}
            <button
              onClick={() => handleBinaryClick("A")}
              className={`flex-1 group relative overflow-hidden rounded-2xl border-2 min-h-[48px]
                transition-all duration-300 cursor-pointer p-6 text-left
                ${
                  selectedFlash === q.optionA!.pole
                    ? "border-kobe-gold scale-[0.97]"
                    : "border-kobe-gold/20 hover:border-kobe-gold/60"
                }`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-kobe-purple/30 to-kobe-purple/60 group-hover:from-kobe-purple/50 group-hover:to-kobe-purple/80 transition-all" />
              <div className="relative z-10">
                <p className="text-white font-semibold text-sm sm:text-base leading-snug">
                  {q.optionA.text}
                </p>
                <div className="mt-3 text-kobe-gold text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  选这个 →
                </div>
              </div>
              {selectedFlash === q.optionA!.pole && (
                <div className="absolute inset-0 vote-flash-kobe rounded-2xl" />
              )}
            </button>

            {/* VS divider */}
            <div className="flex items-center justify-center text-lg font-black text-white/20 sm:text-xl">
              VS
            </div>

            {/* Option B — wine side */}
            <button
              onClick={() => handleBinaryClick("B")}
              className={`flex-1 group relative overflow-hidden rounded-2xl border-2 min-h-[48px]
                transition-all duration-300 cursor-pointer p-6 text-left
                ${
                  selectedFlash === q.optionB!.pole
                    ? "border-lebron-gold scale-[0.97]"
                    : "border-lebron-gold/20 hover:border-lebron-gold/60"
                }`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-lebron-wine/30 to-lebron-wine/60 group-hover:from-lebron-wine/50 group-hover:to-lebron-wine/80 transition-all" />
              <div className="relative z-10">
                <p className="text-white font-semibold text-sm sm:text-base leading-snug">
                  {q.optionB.text}
                </p>
                <div className="mt-3 text-lebron-gold text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  选这个 →
                </div>
              </div>
              {selectedFlash === q.optionB!.pole && (
                <div className="absolute inset-0 vote-flash-lebron rounded-2xl" />
              )}
            </button>
          </div>
        )}

        {/* ── Multi options (single-select, auto-advance) ─── */}
        {q.type === "multi" && q.options && (
          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              const isSelected = selectedFlash === String(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleMultiClick(idx)}
                  className={`w-full rounded-xl border-2 px-5 py-4 min-h-[48px] text-left transition-all duration-200 cursor-pointer
                    ${
                      isSelected
                        ? "border-kobe-gold bg-kobe-gold/10 text-white scale-[0.98]"
                        : "border-white/10 text-white/80 hover:border-white/30 hover:bg-white/[0.04]"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
                        ${isSelected ? "border-kobe-gold bg-kobe-gold" : "border-white/20"}`}
                    >
                      {isSelected && (
                        <span className="text-black text-xs font-black">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className="text-sm sm:text-base font-medium leading-snug">
                      {opt.text}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Open-ended question ─────────────────────────── */}
        {q.type === "open" && (
          <div className="relative">
            {/* Special background for the last question */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-kobe-purple/15 via-transparent to-lebron-wine/15 pointer-events-none" />

            <div className="relative space-y-4">
              <textarea
                value={openText}
                onChange={(e) => setOpenText(e.target.value)}
                placeholder={q.placeholder ?? "说说你的想法..."}
                rows={5}
                className="w-full rounded-xl border-2 border-white/10 bg-white/[0.03] text-white placeholder-white/25
                  px-5 py-4 text-sm sm:text-base leading-relaxed resize-none
                  focus:outline-none focus:border-kobe-gold/50 focus:bg-white/[0.05]
                  transition-all duration-200"
              />
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs transition-colors ${
                    openText.trim().length >= 20
                      ? "text-kobe-gold/70"
                      : "text-white/30"
                  }`}
                >
                  {openText.trim().length} / 20+
                </span>
                <button
                  onClick={handleOpenSubmit}
                  disabled={openText.trim().length < 20}
                  className={`px-8 py-3 min-h-[48px] rounded-2xl text-base font-bold transition-all duration-200
                    ${
                      openText.trim().length >= 20
                        ? "bg-gradient-to-r from-kobe-purple to-lebron-wine text-white hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        : "bg-white/5 text-white/20 cursor-not-allowed"
                    }`}
                >
                  {isLast ? "查看结果 🧬" : "提交"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
