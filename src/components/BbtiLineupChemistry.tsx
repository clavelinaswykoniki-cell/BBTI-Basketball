"use client";

import { useMemo } from "react";
import { getBbtiCompareReport, type BbtiCompareReport } from "@/data/bbti-rivalries";
import { getBbtiType } from "@/data/bbti";
import {
  BBTI_LINEUP_CHEMISTRY_VERSION,
  buildBbtiLineupChemistryCopy,
  resolveBbtiLineupChemistryBrief,
  type BbtiLineupChemistryBrief,
} from "@/data/bbti-lineup-chemistry";
import { buildBbtiCompareUrl } from "@/lib/bbti-deep-links";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiLineupChemistryProps {
  code: string;
  onCompare: () => void;
}

type ChemistryCard = {
  id: "compatibility" | "nemesis";
  label: string;
  kicker: string;
  toneClass: string;
  report: BbtiCompareReport;
  brief: BbtiLineupChemistryBrief;
};

function cleanBaseHref(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}${window.location.pathname}`;
}

function copyText(card: ChemistryCard, baseHref?: string): string {
  return buildBbtiLineupChemistryCopy({
    brief: card.brief,
    report: card.report,
    url: buildBbtiCompareUrl(card.report.codeA, card.report.codeB, baseHref),
  });
}

export default function BbtiLineupChemistry({ code, onCompare }: BbtiLineupChemistryProps) {
  const copyFeedback = useGuardedClipboard<ChemistryCard["id"]>();
  const type = useMemo(() => getBbtiType(code), [code]);
  const cards = useMemo<ChemistryCard[]>(() => {
    if (!type) return [];

    const compatibilityReport = getBbtiCompareReport(code, type.compatibility);
    const nemesisReport = getBbtiCompareReport(code, type.nemesis);

    return [
      {
        brief: resolveBbtiLineupChemistryBrief({ id: "compatibility", report: compatibilityReport }),
        id: "compatibility",
        label: "王朝双核",
        kicker: "最佳搭档",
        toneClass: "border-green-400/25 bg-green-400/8 text-green-300",
        report: compatibilityReport,
      },
      {
        brief: resolveBbtiLineupChemistryBrief({ id: "nemesis", report: nemesisReport }),
        id: "nemesis",
        label: "首轮死敌",
        kicker: "死对头",
        toneClass: "border-red-400/25 bg-red-400/8 text-red-300",
        report: nemesisReport,
      },
    ];
  }, [code, type]);

  if (!type || cards.length === 0) return null;

  const copyInvite = (card: ChemistryCard) => {
    copyFeedback.copyText(copyText(card, cleanBaseHref()), card.id);
  };

  const openCompare = (card: ChemistryCard) => {
    const nextUrl = buildBbtiCompareUrl(card.report.codeA, card.report.codeB, cleanBaseHref());
    window.history.pushState(null, "", nextUrl);
    onCompare();
  };

  return (
    <section
      data-testid="bbti-lineup-chemistry"
      data-bbti-lineup-chemistry-version={BBTI_LINEUP_CHEMISTRY_VERSION}
      data-bbti-lineup-chemistry-code={code}
      data-bbti-lineup-chemistry-card-count={cards.length}
      className="w-full max-w-lg rounded-2xl glass p-5 sm:p-6 mb-6"
      style={{
        animation: "fade-up 0.5s ease-out",
        animationDelay: "1.2s",
        animationFillMode: "both",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-1">
            Lineup Chemistry
          </p>
          <h2 className="text-xl font-black text-white">
            你的组队化学反应
          </h2>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-black text-white/42">
          DUO
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((card, index) => {
          const copied = copyFeedback.isCopied(card.id);
          const failed = copyFeedback.isFailed(card.id);
          const inviteCopy = copyText(card, cleanBaseHref());
          const showManualCopy = copyFeedback.feedback.manualCopyText === inviteCopy;
          const otherType = card.id === "compatibility"
            ? getBbtiType(type.compatibility)
            : getBbtiType(type.nemesis);

          return (
            <article
              key={card.id}
              data-testid="bbti-lineup-chemistry-card"
              data-bbti-lineup-chemistry-id={card.id}
              data-bbti-lineup-chemistry-qa={card.brief.qaKey}
              data-bbti-lineup-chemistry-position={index + 1}
              data-bbti-lineup-chemistry-target-code={card.report.codeB}
              data-bbti-lineup-chemistry-score={card.report.score}
              className={`rounded-xl border p-4 ${card.toneClass}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                    {card.kicker}
                  </p>
                  <h3 className="mt-1 text-lg font-black text-white">
                    {card.label}
                  </h3>
                </div>
                <span className="text-3xl">{otherType?.emoji ?? "🏀"}</span>
              </div>

              <p className="text-sm font-black text-white">
                {card.report.codeB} · {card.report.typeB.name}
              </p>
              <p className="mt-1 text-[11px] font-bold text-white/45">
                {card.report.oneLiner}
              </p>
              <p className="mt-3 text-xs text-white/68 leading-relaxed">
                {card.report.courtChemistry}
              </p>
              <p className="mt-2 text-[11px] text-white/42 leading-relaxed">
                {card.report.groupChat}
              </p>

              <div
                data-testid="bbti-lineup-chemistry-brief"
                data-bbti-lineup-chemistry-brief-count="3"
                className="mt-3 space-y-2"
              >
                {[
                  { id: "role-split", title: card.brief.roleTitle, text: card.brief.roleSplit },
                  { id: "friction-plan", title: card.brief.frictionTitle, text: card.brief.frictionPlan },
                  { id: "fit-action", title: card.brief.actionTitle, text: card.brief.fitAction },
                ].map((item, itemIndex) => (
                  <div
                    key={item.id}
                    data-testid="bbti-lineup-chemistry-brief-row"
                    data-bbti-lineup-chemistry-brief={item.id}
                    data-bbti-lineup-chemistry-brief-position={itemIndex + 1}
                    className="rounded-lg border border-white/10 bg-black/16 px-3 py-2"
                  >
                    <p className="text-[10px] font-black text-white/35 mb-1">{item.title}</p>
                    <p className="text-[11px] text-white/62 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2">
                <button
                  type="button"
                  data-testid="bbti-lineup-chemistry-copy"
                  data-bbti-lineup-chemistry-action="copy-invite"
                  onClick={() => copyInvite(card)}
                  className="rounded-full border border-white/10 bg-black/18 px-4 py-2.5 text-xs font-black text-white/62 hover:text-white hover:bg-black/28 transition-colors cursor-pointer"
                >
                  {failed ? "复制失败，可手动复制" : copied ? "已复制邀请" : "复制约战邀请"}
                </button>
                <button
                  type="button"
                  data-testid="bbti-lineup-chemistry-open"
                  data-bbti-lineup-chemistry-action="open-compare"
                  onClick={() => openCompare(card)}
                  className="rounded-full bg-white/90 px-4 py-2.5 text-xs font-black text-black hover:bg-white transition-colors cursor-pointer"
                >
                  打开双人对比
                </button>
              </div>

              <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {copied ? "已复制组队约战邀请" : failed ? "组队约战邀请自动复制失败，可手动复制" : ""}
              </p>

              {showManualCopy && (
                <BbtiManualCopyFallback
                  text={copyFeedback.feedback.manualCopyText}
                  title="自动复制失败，长按下方约战邀请复制。"
                  className="mt-3"
                />
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
