"use client";

import { useState, useEffect } from "react";
import { useGame } from "./GameProvider";
import { quizQuestions, computeQuizCode, type QuizAnswers } from "@/data/basketball-quiz";

export default function BasketballQuiz() {
  const { submitQuiz, restart } = useGame();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(true);

  const q = quizQuestions[current]!;
  const total = quizQuestions.length;
  const progress = ((current) / total) * 100;

  // Reset multi-selection when question changes
  useEffect(() => {
    setMultiSelected([]);
    setVisible(true);
  }, [current]);

  function advance(newAnswers: QuizAnswers) {
    if (animating) return;
    setAnimating(true);
    setVisible(false);

    setTimeout(() => {
      if (current + 1 >= total) {
        const code = computeQuizCode(newAnswers);
        submitQuiz(code);
      } else {
        setCurrent((c) => c + 1);
        setAnimating(false);
      }
    }, 280);
  }

  function handleBinaryClick(optId: string) {
    const newAnswers = { ...answers, [q.id]: [optId] };
    setAnswers(newAnswers);
    advance(newAnswers);
  }

  function toggleMulti(optId: string) {
    const max = q.maxSelect ?? q.options.length;
    setMultiSelected((prev) => {
      if (prev.includes(optId)) return prev.filter((id) => id !== optId);
      if (prev.length >= max) return prev; // cap at max
      return [...prev, optId];
    });
  }

  function confirmMulti() {
    const min = q.minSelect ?? 1;
    if (multiSelected.length < min) return;
    const newAnswers = { ...answers, [q.id]: multiSelected };
    setAnswers(newAnswers);
    advance(newAnswers);
  }

  const multiMin = q.minSelect ?? 1;
  const canConfirm = multiSelected.length >= multiMin;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative">
      {/* Exit button */}
      <button
        onClick={restart}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer"
      >
        ✕ 退出
      </button>

      {/* Progress bar */}
      <div className="w-full max-w-xl mb-8">
        <div className="flex justify-between text-xs text-white/30 mb-2">
          <span>篮球人格自测</span>
          <span>{current + 1} / {total}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-kobe-gold to-lebron-gold transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div
        className="w-full max-w-xl"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-16px)",
          transition: "opacity 0.28s ease, transform 0.28s ease",
        }}
      >
        {/* Question */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">{q.emoji}</div>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
            {q.question}
          </h2>
          {q.hint && (
            <p className="text-white/40 text-sm mt-2">{q.hint}</p>
          )}
        </div>

        {/* Binary options */}
        {q.type === "binary" && (
          <div className="flex flex-col sm:flex-row gap-4">
            {q.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleBinaryClick(opt.id)}
                className="flex-1 group relative overflow-hidden rounded-2xl border-2 border-white/10
                  hover:border-kobe-gold/60 hover:bg-kobe-purple/20 active:scale-[0.97]
                  transition-all duration-200 cursor-pointer p-6 text-left"
              >
                <p className="text-white font-semibold text-sm sm:text-base leading-snug group-hover:text-white/90">
                  {opt.text}
                </p>
                <div className="mt-3 text-kobe-gold text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  选这个 →
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Multi options */}
        {q.type === "multi" && (
          <div className="space-y-3">
            {q.options.map((opt) => {
              const selected = multiSelected.includes(opt.id);
              const maxReached = multiSelected.length >= (q.maxSelect ?? q.options.length);
              const disabled = !selected && maxReached;
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleMulti(opt.id)}
                  disabled={disabled}
                  className={`w-full rounded-xl border-2 px-5 py-4 text-left transition-all duration-150 cursor-pointer
                    ${selected
                      ? "border-kobe-gold bg-kobe-purple/30 text-white"
                      : disabled
                        ? "border-white/5 text-white/20 cursor-not-allowed"
                        : "border-white/10 text-white/80 hover:border-white/30 hover:bg-white/[0.04]"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 mt-0.5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all
                        ${selected ? "border-kobe-gold bg-kobe-gold" : "border-white/20"}`}
                    >
                      {selected && <span className="text-black text-xs font-black">✓</span>}
                    </div>
                    <span className="text-sm sm:text-base font-medium leading-snug">{opt.text}</span>
                  </div>
                </button>
              );
            })}

            {/* Confirm button */}
            <button
              onClick={confirmMulti}
              disabled={!canConfirm}
              className={`w-full mt-2 py-4 rounded-2xl text-base font-bold transition-all duration-200
                ${canConfirm
                  ? "bg-gradient-to-r from-kobe-purple to-lebron-wine text-white hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  : "bg-white/5 text-white/20 cursor-not-allowed"
                }`}
            >
              {current + 1 < total ? "下一题 →" : "查看我的人格 🧬"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
