"use client";

import { useMemo } from "react";
import {
  getBbtiPersonaExtension,
  type BbtiPersonaExtensionCard,
} from "@/data/bbti-persona-extension";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiPersonaExtensionProps {
  code: string;
}

function PersonaExtensionCard({ card }: { card: BbtiPersonaExtensionCard }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-white/30">{card.label}</p>
          <h3 className="mt-1 text-sm font-black leading-snug text-white sm:text-base">
            {card.title}
          </h3>
        </div>
        <span className="shrink-0 rounded-full border border-kobe-gold/25 bg-kobe-gold/10 px-2.5 py-1 text-[10px] font-bold text-kobe-gold">
          {card.tag}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-white/65 sm:text-sm">{card.body}</p>
    </div>
  );
}

export default function BbtiPersonaExtension({ code }: BbtiPersonaExtensionProps) {
  const report = useMemo(() => getBbtiPersonaExtension(code), [code]);
  const copyFeedback = useGuardedClipboard<"report">();

  const cards = [
    report.cards.lockerRoomRole,
    report.cards.coachUsage,
    report.cards.groupChatTrigger,
    report.cards.clutchPossession,
  ];

  const copyReport = () => copyFeedback.copyText(report.copyText, "report");
  const copied = copyFeedback.isCopied("report");
  const failed = copyFeedback.isFailed("report");

  return (
    <section
      id="bbti-persona-extension"
      className="w-full max-w-lg scroll-mt-[var(--bbti-action-dock-offset,9rem)] rounded-2xl glass p-5 sm:p-6 mb-6"
      aria-labelledby="bbti-persona-extension-title"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/30">Second Layer Report</p>
          <h2 id="bbti-persona-extension-title" className="mt-1 text-xl font-black text-white">
            二层球探报告
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-white/45">
            把 {report.typeName} 翻译成更衣室、教练板和最后两分钟的使用说明。
          </p>
        </div>
        <button
          type="button"
          onClick={copyReport}
          className="min-h-[40px] shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/75 transition-colors hover:border-kobe-gold/40 hover:text-kobe-gold"
        >
          {failed ? "复制失败，可手动复制" : copied ? "已复制" : "复制报告"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {cards.map((card) => (
          <PersonaExtensionCard key={card.label} card={card} />
        ))}
      </div>

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copied ? "已复制二层球探报告" : failed ? "二层球探报告自动复制失败，可手动复制" : ""}
      </p>

      <BbtiManualCopyFallback
        text={copyFeedback.feedback.manualCopyText}
        title="自动复制失败，长按下方二层球探报告复制。"
        className="mt-3"
      />
    </section>
  );
}
