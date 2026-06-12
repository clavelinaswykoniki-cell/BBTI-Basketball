"use client";

import {
  getBbtiDraftSummary,
  type BbtiDraft,
} from "@/lib/bbti-session";

interface BbtiPauseBenchProps {
  draft: BbtiDraft;
  onDiscard: () => void;
  onResume: () => void;
}

export default function BbtiPauseBench({
  draft,
  onDiscard,
  onResume,
}: BbtiPauseBenchProps) {
  const summary = getBbtiDraftSummary(draft);

  return (
    <section className="w-full max-w-5xl mb-6 rounded-2xl border border-kobe-gold/20 bg-kobe-gold/10 px-4 py-4 sm:px-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-kobe-gold/80 mb-1">
            Saved Timeout
          </p>
          <h2 className="text-lg sm:text-xl font-black text-white">
            暂停回来继续：{summary.modeLabel}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-white/58 leading-relaxed">
            已完成 {summary.completed}/{summary.total} 题，
            回到第 {summary.resumeQuestion} 题继续。
            上次保存：{summary.savedAtLabel}
          </p>
          <p className="mt-1 text-[11px] text-white/32">
            进度自动保存，只保存在本机
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:w-[300px]">
          <button
            type="button"
            onClick={onResume}
            className="rounded-full bg-gradient-to-r from-kobe-gold to-lebron-gold px-5 py-2.5 text-xs font-black text-black hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            继续第 {summary.resumeQuestion}/{summary.total} 题
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="rounded-full border border-white/10 px-5 py-2.5 text-xs font-black text-white/55 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
          >
            放弃进度
          </button>
        </div>
      </div>
    </section>
  );
}
