"use client";

import { useState } from "react";
import { useGame } from "./GameProvider";
import { getBbtiType } from "@/data/bbti";
import { BBTI_LAST_RESULT_STORAGE_KEY, type StoredBbtiResult } from "@/data/bbti-playbook";
import {
  clearPendingBbtiCompareInvite,
  clearBbtiDraft,
  modeDisplayName,
  readPendingBbtiCompareInvite,
  readBbtiDraft,
  type BbtiDraft,
  type BbtiMode,
  type PendingBbtiCompareInvite,
} from "@/lib/bbti-session";
import BbtiDraftReplaceDialog from "./BbtiDraftReplaceDialog";
import BbtiFeaturedDailyReturn from "./BbtiFeaturedDailyReturn";
import BbtiPauseBench from "./BbtiPauseBench";
import BbtiReturnBench from "./BbtiReturnBench";

function readLastResult(): StoredBbtiResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BBTI_LAST_RESULT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredBbtiResult) : null;
  } catch {
    return null;
  }
}

export default function BbtiEntry() {
  const {
    startBbti,
    openBbtiCompare,
    openBbtiResult,
    selectMatchup,
    backToMatchupSelect,
  } = useGame();
  const [lastResult] = useState<StoredBbtiResult | null>(() => readLastResult());
  const [draft, setDraft] = useState<BbtiDraft | null>(() => readBbtiDraft());
  const [pendingCompareInvite, setPendingCompareInvite] = useState<PendingBbtiCompareInvite | null>(
    () => readPendingBbtiCompareInvite(),
  );
  const [replacementMode, setReplacementMode] = useState<BbtiMode | null>(null);
  const pendingCompareType = pendingCompareInvite ? getBbtiType(pendingCompareInvite.codeA) : null;

  const replaceDraftAndStart = (mode: BbtiMode) => {
    clearBbtiDraft();
    setDraft(null);
    setReplacementMode(null);
    startBbti(mode);
  };

  const requestStartMode = (mode: BbtiMode) => {
    if (!draft) {
      replaceDraftAndStart(mode);
      return;
    }

    if (draft.mode === mode) {
      startBbti(draft.mode);
      return;
    }

    setReplacementMode(mode);
  };

  const discardDraft = () => {
    clearBbtiDraft();
    setDraft(null);
    setReplacementMode(null);
  };

  const startPendingCompareQuiz = () => {
    if (draft) {
      startBbti(draft.mode);
      return;
    }

    replaceDraftAndStart("quick");
  };

  const dismissPendingCompareInvite = () => {
    clearPendingBbtiCompareInvite();
    setPendingCompareInvite(null);
  };

  const modeCardActionLabel = (mode: BbtiMode, defaultLabel: string) => {
    if (!draft) return defaultLabel;
    return draft.mode === mode ? "继续原进度 →" : "重新开测需确认";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative">
      {draft && replacementMode && (
        <BbtiDraftReplaceDialog
          draft={draft}
          nextMode={replacementMode}
          onCancel={() => setReplacementMode(null)}
          onContinueDraft={() => {
            setReplacementMode(null);
            startBbti(draft.mode);
          }}
          onReplaceDraft={() => replaceDraftAndStart(replacementMode)}
        />
      )}

      <button
        onClick={backToMatchupSelect}
        className="absolute top-6 left-6 text-white/40 hover:text-white text-sm transition-colors cursor-pointer"
      >
        &larr; 返回
      </button>

      <div className="text-center mb-12 fade-up">
        <div className="inline-block text-7xl sm:text-8xl font-black tracking-tighter mb-3 text-glow"
          style={{
            background: "linear-gradient(135deg, #FDB927 0%, #FDBB30 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          BBTI
        </div>
        <p className="text-white/60 text-base sm:text-lg mb-2">
          Basketball Brain Type Indicator
        </p>
        <p className="text-white/40 text-sm">
          12/30/50 题三档 &middot; 16 种篮球人格类型
        </p>
      </div>

      {draft && (
        <BbtiPauseBench
          draft={draft}
          onDiscard={discardDraft}
          onResume={() => startBbti(draft.mode)}
        />
      )}

      {pendingCompareInvite && pendingCompareType && (
        <section className="w-full max-w-5xl mb-6 rounded-2xl border border-blue-300/20 bg-blue-300/[0.06] px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-200/70 mb-1">
                Duo Invite
              </p>
              <h2 className="text-lg sm:text-xl font-black text-white">
                TA 已上场：{pendingCompareInvite.codeA} · {pendingCompareType.name}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-white/58 leading-relaxed">
                测完你的 BBTI，结果页会直接生成双人球脑化学反应报告。
                {draft ? " 你也可以继续当前暂停进度。" : " 默认用常规赛版补位。"}
              </p>
              <p className="mt-1 text-[11px] text-white/32">
                只保存对方 Code，不保存你的答题内容
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:w-[320px]">
              <button
                type="button"
                onClick={startPendingCompareQuiz}
                className="rounded-full bg-gradient-to-r from-kobe-gold to-lebron-gold px-5 py-2.5 text-xs font-black text-black hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                {draft ? `继续${modeDisplayName(draft.mode)}` : "常规赛版补位"}
              </button>
              <button
                type="button"
                onClick={dismissPendingCompareInvite}
                className="rounded-full border border-white/10 px-5 py-2.5 text-xs font-black text-white/55 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
              >
                先不接这个邀请
              </button>
            </div>
          </div>
        </section>
      )}

      {lastResult && (
        <section
          data-testid="bbti-entry-return-stack"
          data-bbti-entry-return-stack="last-result"
          data-bbti-entry-return-code={lastResult.code}
          className="contents"
        >
          <BbtiFeaturedDailyReturn
            result={lastResult}
            onOpenResult={openBbtiResult}
            onChallengeMatchup={selectMatchup}
          />
          <BbtiReturnBench
            result={lastResult}
            onOpenResult={openBbtiResult}
            onChallengeMatchup={selectMatchup}
          />
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl">
        {/* Blitz mode */}
        <button
          onClick={() => requestStartMode("blitz")}
          className="group relative overflow-hidden rounded-2xl border-2 border-white/20
            hover:border-white/50 transition-all duration-300 cursor-pointer
            hover:scale-[1.02] active:scale-[0.98] p-7 text-left min-h-[260px] flex flex-col"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-kobe-gold/10 group-hover:from-white/15 transition-all" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="text-5xl mb-4">🏃</div>
            <div className="text-2xl sm:text-3xl font-black text-white mb-1">
              快攻版
            </div>
            <div className="mb-2 w-fit rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-black text-white/45">
              群聊快测
            </div>
            <div className="text-white/70 text-sm font-bold mb-4">
              12 题 &middot; 约 90 秒
            </div>
            <p className="text-white/60 text-sm leading-relaxed flex-1">
              每个维度 3 道高压选择，不写开放题，适合发群里快速互测。
            </p>
            <div className="mt-6 text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {modeCardActionLabel("blitz", "快速开测 →")}
            </div>
          </div>
        </button>

        {/* Quick mode */}
        <button
          onClick={() => requestStartMode("quick")}
          className="group relative overflow-hidden rounded-2xl border-2 border-kobe-gold/30
            hover:border-kobe-gold transition-all duration-300 cursor-pointer
            hover:scale-[1.02] active:scale-[0.98] p-8 text-left min-h-[280px] flex flex-col"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-kobe-purple/30 via-transparent to-kobe-purple/10 group-hover:from-kobe-purple/50 transition-all" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="text-5xl mb-4">⚡</div>
            <div className="text-2xl sm:text-3xl font-black text-white mb-1">
              常规赛版
            </div>
            <div className="mb-2 w-fit rounded-full bg-kobe-gold px-2.5 py-1 text-[10px] font-black text-black">
              推荐第一次
            </div>
            <div className="text-kobe-gold text-sm font-bold mb-4">
              30 题 &middot; 约 5 分钟
            </div>
            <p className="text-white/60 text-sm leading-relaxed flex-1">
              覆盖 4 大维度的核心题目，测你的核心篮球人格。
              适合第一次认真开测。
            </p>
            <div className="mt-6 text-kobe-gold text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {modeCardActionLabel("quick", "开始测试 →")}
            </div>
          </div>
        </button>

        {/* Full mode */}
        <button
          onClick={() => requestStartMode("full")}
          className="group relative overflow-hidden rounded-2xl border-2 border-lebron-gold/30
            hover:border-lebron-gold transition-all duration-300 cursor-pointer
            hover:scale-[1.02] active:scale-[0.98] p-8 text-left min-h-[280px] flex flex-col"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-lebron-wine/30 via-transparent to-lebron-wine/10 group-hover:from-lebron-wine/50 transition-all" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="text-5xl mb-4">🔬</div>
            <div className="text-2xl sm:text-3xl font-black text-white mb-1">
              抢七长卷
            </div>
            <div className="mb-2 w-fit rounded-full border border-lebron-gold/25 px-2.5 py-1 text-[10px] font-black text-lebron-gold">
              深度长卷
            </div>
            <div className="text-lebron-gold text-sm font-bold mb-4">
              50 题 &middot; 约 10 分钟
            </div>
            <p className="text-white/60 text-sm leading-relaxed flex-1">
              更深度的灵魂拷问，连开放题一起审判。
              适合想把篮球世界观测到底的玩家。
            </p>
            <div className="mt-6 text-lebron-gold text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {modeCardActionLabel("full", "深度测试 →")}
            </div>
          </div>
        </button>
      </div>

      <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl w-full">
        {[
          { emoji: "⚔️", label: "火力 vs 防守" },
          { emoji: "📊", label: "Box Score vs Eye Test" },
          { emoji: "🐺", label: "单打接管 vs 体系发动" },
          { emoji: "🏠", label: "一城信仰 vs 戒指路线" },
        ].map((d) => (
          <div key={d.label} className="text-center">
            <div className="text-2xl mb-1">{d.emoji}</div>
            <div className="text-white/40 text-xs">{d.label}</div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-xs text-white/30 text-center max-w-md">
        每个选择都暴露你的真实篮球性格 &middot; 完成后可分享你的类型给朋友
      </p>

      <button
        onClick={openBbtiCompare}
        className="mt-5 px-6 py-3 rounded-full border border-white/10 bg-white/[0.03] text-white/65 hover:text-white hover:border-kobe-gold/50 transition-colors cursor-pointer text-sm font-bold"
      >
        双人 BBTI 对比
      </button>
    </div>
  );
}
