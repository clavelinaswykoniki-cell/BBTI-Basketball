"use client";

import {
  getBbtiDraftSummary,
  modeDisplayName,
  type BbtiDraft,
  type BbtiMode,
} from "@/lib/bbti-session";

interface BbtiDraftReplaceDialogProps {
  draft: BbtiDraft;
  nextMode: BbtiMode;
  onCancel: () => void;
  onContinueDraft: () => void;
  onReplaceDraft: () => void;
}

export default function BbtiDraftReplaceDialog({
  draft,
  nextMode,
  onCancel,
  onContinueDraft,
  onReplaceDraft,
}: BbtiDraftReplaceDialogProps) {
  const summary = getBbtiDraftSummary(draft);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 px-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="bbti-replace-draft-title"
        className="w-full max-w-md rounded-2xl border border-kobe-gold/20 bg-neutral-950 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.42)] sm:p-6"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-kobe-gold/75">
          Saved Timeout
        </p>
        <h2 id="bbti-replace-draft-title" className="mt-2 text-xl font-black text-white">
          要替换当前暂停进度吗？
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/58">
          你还有 {summary.modeLabel} 的 {summary.completed}/{summary.total} 题进度，
          下次会回到第 {summary.resumeQuestion} 题。开始 {modeDisplayName(nextMode)} 会清掉这份草稿。
        </p>

        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={onContinueDraft}
            className="min-h-[46px] w-full rounded-full bg-gradient-to-r from-kobe-gold to-lebron-gold px-5 py-2.5 text-xs font-black text-black transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            继续第 {summary.resumeQuestion}/{summary.total} 题
          </button>
          <button
            type="button"
            onClick={onReplaceDraft}
            className="min-h-[46px] w-full rounded-full border border-red-300/20 bg-red-300/[0.06] px-5 py-2.5 text-xs font-black text-red-100/72 transition-colors hover:border-red-300/35 hover:text-red-100 cursor-pointer"
          >
            清掉草稿，开始{modeDisplayName(nextMode)}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[42px] w-full rounded-full border border-white/10 px-5 py-2 text-xs font-black text-white/45 transition-colors hover:border-white/25 hover:text-white/70 cursor-pointer"
          >
            取消
          </button>
        </div>
      </section>
    </div>
  );
}
