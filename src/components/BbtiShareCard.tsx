"use client";

import { useMemo } from "react";
import { getBbtiShareCardPreset } from "@/data/bbti-share-card-presets";
import { buildBbtiResultUrl } from "@/lib/bbti-deep-links";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";

interface BbtiShareCardProps {
  code: string;
  emoji: string;
  typeName: string;
  tagline: string;
  spiritPlayer: string;
  debateWeapon: string;
  primaryChallengeTitle?: string;
  axes?: BbtiShareCardAxis[];
  badges?: BbtiShareCardBadge[];
  overall?: number;
}

interface BbtiShareCardAxis {
  key: string;
  label: string;
  value: number;
}

interface BbtiShareCardBadge {
  label: string;
  tone: "blue" | "gold" | "purple" | "wine";
}

function shortenUrl(value: string): string {
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export default function BbtiShareCard({
  code,
  emoji,
  typeName,
  tagline,
  spiritPlayer,
  debateWeapon,
  primaryChallengeTitle,
  axes = [],
  badges = [],
  overall,
}: BbtiShareCardProps) {
  const copyFeedback = useGuardedClipboard<"card" | "url">();
  const preset = useMemo(() => getBbtiShareCardPreset(code), [code]);
  const shareUrl = useMemo(() => {
    const baseHref = typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}`
      : undefined;
    return buildBbtiResultUrl(code, {}, baseHref);
  }, [code]);
  const cardCopy = useMemo(
    () => [
      `我的 BBTI 球探卡：${code} ${emoji} ${typeName}`,
      `本场身份：${preset.headline}`,
      tagline,
      preset.caption,
      `灵魂球员：${spiritPlayer}`,
      `对线武器：${debateWeapon}`,
      typeof overall === "number" ? `球脑稳定度：${overall}` : null,
      axes.length > 0 ? `四维速写：${axes.map((axis) => `${axis.label}${axis.value}`).join(" / ")}` : null,
      badges.length > 0 ? `强项徽章：${badges.map((badge) => badge.label).join("、")}` : null,
      `群聊开战：${preset.groupHook}`,
      primaryChallengeTitle ? `下一场开庭：${primaryChallengeTitle}` : null,
      shareUrl,
    ].filter(Boolean).join("\n"),
    [
      code,
      debateWeapon,
      emoji,
      axes,
      badges,
      preset.caption,
      preset.groupHook,
      preset.headline,
      primaryChallengeTitle,
      shareUrl,
      spiritPlayer,
      tagline,
      typeName,
      overall,
    ],
  );
  const axisCount = Math.min(axes.length, 4);
  const badgeCount = Math.min(badges.length, 3);

  return (
    <div>
      <div
        data-testid="bbti-share-card"
        data-bbti-share-card-version="bbti-share-card-v1"
        data-bbti-share-card-surface="visual"
        data-bbti-share-card-code={code}
        data-bbti-share-card-axis-count={axisCount}
        data-bbti-share-card-badge-count={badgeCount}
        className="relative overflow-hidden rounded-2xl border border-kobe-gold/25 bg-[linear-gradient(145deg,rgba(85,37,131,0.42),rgba(5,5,12,0.94),rgba(134,0,56,0.34))] p-4"
      >
        <div className="absolute inset-0 opacity-24 pointer-events-none bg-[radial-gradient(circle_at_18%_15%,rgba(253,185,39,0.45),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.28),transparent_24%)]" />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-kobe-gold/75">
                BBTI Scouting Report
              </p>
              <p className="mt-1 text-3xl font-black text-white">
                {code}
              </p>
              {typeof overall === "number" && (
                <p
                  data-testid="bbti-share-card-overall"
                  data-bbti-share-card-overall={overall}
                  className="mt-1 text-[10px] font-black text-white/42"
                >
                  本地球脑稳定度 {overall}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-5xl leading-none">{emoji}</p>
              <p className="mt-1 text-[10px] font-black text-white/42">SEASON 01</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="break-words text-2xl font-black text-white leading-tight">
              {typeName}
            </h3>
            <p className="mt-1 break-words text-xs sm:text-sm text-white/62 leading-relaxed">
              {tagline}
            </p>
            <div className="mt-3 rounded-xl border border-kobe-gold/20 bg-kobe-gold/8 px-3 py-2">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-kobe-gold/70">
                  {preset.badge}
                </p>
                <p className="shrink-0 text-[10px] font-black text-white/34">
                  群聊引线
                </p>
              </div>
              <p className="break-words text-sm font-black text-white">
                {preset.headline}
              </p>
              <p className="mt-1 break-words text-[11px] text-white/56 leading-relaxed">
                {preset.caption}
              </p>
            </div>
          </div>

          {(axes.length > 0 || badges.length > 0) && (
            <div className="mb-4 rounded-xl border border-white/10 bg-black/22 p-3">
              {axes.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/32">
                      四维速写
                    </p>
                    <p className="text-[10px] font-black text-white/32">
                      {axisCount}/4
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {axes.slice(0, 4).map((axis, index) => (
                      <div
                        key={axis.key}
                        data-testid="bbti-share-card-axis"
                        data-bbti-share-card-axis={axis.key}
                        data-bbti-share-card-axis-position={index + 1}
                        data-bbti-share-card-axis-value={axis.value}
                        className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] px-2.5 py-2"
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="truncate text-[10px] font-black text-white/52">{axis.label}</p>
                          <p className="shrink-0 text-[10px] font-black text-kobe-gold">{axis.value}</p>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-kobe-gold to-lebron-gold"
                            style={{ width: `${Math.max(8, Math.min(axis.value, 100))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {badges.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {badges.slice(0, 3).map((badge, index) => (
                    <span
                      key={`${badge.label}-${index}`}
                      data-testid="bbti-share-card-badge"
                      data-bbti-share-card-badge-position={index + 1}
                      data-bbti-share-card-badge-tone={badge.tone}
                      className={`rounded-full border px-2 py-1 text-[10px] font-black ${
                        badge.tone === "gold"
                          ? "border-kobe-gold/30 bg-kobe-gold/10 text-kobe-gold"
                          : badge.tone === "wine"
                            ? "border-lebron-gold/25 bg-lebron-wine/20 text-lebron-gold"
                            : badge.tone === "blue"
                              ? "border-sky-400/25 bg-sky-400/10 text-sky-200"
                              : "border-kobe-purple/35 bg-kobe-purple/25 text-white/78"
                      }`}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 mb-4 sm:grid-cols-[86px_minmax(0,1fr)]">
            <div className="rounded-xl border border-white/10 bg-black/28 p-3 text-center">
              <p className="text-2xl font-black tracking-tight text-kobe-gold leading-none">BBTI</p>
              <p className="mt-1 text-[10px] font-black text-white/40">TYPE</p>
            </div>
            <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/32 mb-1">
                灵魂球员
              </p>
              <p className="break-words text-sm font-black text-white">{spiritPlayer}</p>
              <p className="mt-2 break-words text-[11px] text-white/50 leading-relaxed line-clamp-2">
                {debateWeapon}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <div className="rounded-xl border border-kobe-gold/20 bg-kobe-gold/8 px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-kobe-gold/70 mb-1">
                下一场
              </p>
              <p className="break-words text-xs font-bold text-white/78 leading-relaxed">
                {primaryChallengeTitle ?? "等朋友测完来开庭"}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/32 mb-1">
                发群问题
              </p>
              <p className="break-words text-xs font-bold text-white/66 leading-relaxed">
                {preset.groupHook}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-black/25 px-3 py-2">
            <p className="truncate text-[11px] font-mono text-white/38">
              {shortenUrl(shareUrl)}
            </p>
          </div>
        </div>
      </div>

      <div
        data-testid="bbti-share-card-controls"
        data-bbti-share-card-control-count="2"
        className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2"
      >
        <button
          type="button"
          data-testid="bbti-share-card-copy"
          data-bbti-share-card-action="copy-card"
          onClick={() => copyFeedback.copyText(cardCopy, "card")}
          className="rounded-full bg-white/90 px-4 py-2.5 text-xs font-black text-black hover:bg-white transition-colors cursor-pointer"
        >
          {copyFeedback.isFailed("card") ? "复制失败" : copyFeedback.isCopied("card") ? "已复制战报" : "复制战报文案"}
        </button>
        <button
          type="button"
          data-testid="bbti-share-card-copy-url"
          data-bbti-share-card-action="copy-url"
          onClick={() => copyFeedback.copyText(shareUrl, "url")}
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-black text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          {copyFeedback.isFailed("url") ? "复制失败" : copyFeedback.isCopied("url") ? "已复制链接" : "复制结果链接"}
        </button>
      </div>
      <BbtiManualCopyFallback
        text={copyFeedback.feedback.manualCopyText}
        title="自动复制失败，长按下方球探卡文案复制。"
        className="mt-3"
      />
    </div>
  );
}
