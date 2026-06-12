"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import {
  resolveBbtiShareLockerRoom,
  resolveBbtiShareReturnLaneCheck,
  type BbtiShareKit,
} from "@/data/bbti-share-kits";
import { buildBbtiCompareInviteUrl, buildBbtiResultUrl } from "@/lib/bbti-deep-links";
import { useGuardedClipboard } from "@/lib/use-guarded-clipboard";
import BbtiManualCopyFallback from "./BbtiManualCopyFallback";
import BbtiShareTargetPicker, { type BbtiShareTarget } from "./BbtiShareTargetPicker";

interface BbtiShareKitsProps {
  code: string;
  kits: BbtiShareKit[];
  sectionId?: string;
  preview?: ReactNode;
}

const TONE_CLASS: Record<BbtiShareKit["tone"], string> = {
  gold: "border-kobe-gold/35 bg-kobe-gold/10 text-kobe-gold hover:bg-kobe-gold/15",
  purple: "border-kobe-purple/45 bg-kobe-purple/20 text-white hover:bg-kobe-purple/28",
  wine: "border-lebron-wine/55 bg-lebron-wine/20 text-lebron-gold hover:bg-lebron-wine/28",
  blue: "border-sky-400/30 bg-sky-400/10 text-sky-200 hover:bg-sky-400/15",
};

function buildKitUrl(code: string, kit: BbtiShareKit, baseHref?: string): string {
  return kit.linkKind === "compare-invite"
    ? buildBbtiCompareInviteUrl(code, baseHref)
    : buildBbtiResultUrl(code, kit.linkOptions, baseHref);
}

function quickCopyFilesForQa(kit: BbtiShareKit): string {
  return [
    kit.id,
    kit.linkKind,
    kit.linkOptions?.challengeMatchupId,
    kit.linkOptions?.eventId,
  ].filter(Boolean).join(":");
}

export default function BbtiShareKits({ code, kits, sectionId, preview }: BbtiShareKitsProps) {
  const quickCopy = useGuardedClipboard<string>();
  const shareBaseHref = useMemo(() => {
    return typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}`
      : undefined;
  }, []);
  const shareTargets = useMemo<BbtiShareTarget[]>(
    () => kits.map((kit) => ({
      id: kit.id,
      title: kit.title,
      tag: kit.tag,
      copy: kit.copy,
      url: buildKitUrl(code, kit, shareBaseHref),
      linkLabel: kit.linkLabel,
      channelLabel: kit.channelLabel,
      audience: kit.audience,
      intent: kit.intent,
      composerHint: kit.composerHint,
      actionLabel: kit.actionLabel,
      copyButtonLabel: kit.copyButtonLabel,
      linkBadge: kit.linkBadge,
      boundaryNote: kit.boundaryNote,
    })),
    [code, kits, shareBaseHref],
  );
  const routeScoreboardKit = useMemo(
    () => kits.find((kit) => kit.routeScoreboard),
    [kits],
  );
  const routeScoreboard = routeScoreboardKit?.routeScoreboard ?? null;
  const lockerRoom = useMemo(
    () => resolveBbtiShareLockerRoom({ code, kits }),
    [code, kits],
  );
  const returnLaneCheck = useMemo(
    () => resolveBbtiShareReturnLaneCheck({ code, kits }),
    [code, kits],
  );
  const routeScoreboardCopyId = routeScoreboard
    ? `route-scoreboard:${routeScoreboard.eventId}`
    : "route-scoreboard";
  const lockerRoomCopyId = "share-locker-room";
  const returnLaneCheckCopyId = "share-return-lane-check";

  const copyKit = (kit: BbtiShareKit) => {
    const shareUrl = buildKitUrl(code, kit, shareBaseHref);
    quickCopy.copyText(`${kit.copy}\n${shareUrl}`, kit.id);
  };
  const copyLockerRoom = () => {
    if (!lockerRoom) return;
    quickCopy.copyText(lockerRoom.copyText, lockerRoomCopyId);
  };
  const copyLockerRoomRow = (sourceKitId: string) => {
    const kit = kits.find((item) => item.id === sourceKitId);
    if (!kit) return;
    const shareUrl = buildKitUrl(code, kit, shareBaseHref);
    quickCopy.copyText(`${kit.copy}\n${shareUrl}`, `locker-room:${sourceKitId}`);
  };
  const copyRouteScoreboard = () => {
    if (!routeScoreboard || !routeScoreboardKit) return;
    const shareUrl = buildKitUrl(code, routeScoreboardKit, shareBaseHref);
    quickCopy.copyText(`${routeScoreboard.copyText}\n${shareUrl}`, routeScoreboardCopyId);
  };
  const copyReturnLaneCheck = () => {
    if (!returnLaneCheck) return;
    quickCopy.copyText(returnLaneCheck.copyText, returnLaneCheckCopyId);
  };
  const copyReturnLane = (sourceKitId: string) => {
    const kit = kits.find((item) => item.id === sourceKitId);
    if (!kit) return;
    const shareUrl = buildKitUrl(code, kit, shareBaseHref);
    quickCopy.copyText(`${kit.copy}\n${shareUrl}`, `return-lane:${sourceKitId}`);
  };

  return (
    <section
      id={sectionId}
      data-testid="bbti-share-kits"
      data-bbti-share-kit-count={kits.length}
      data-bbti-share-kit-has-preview={preview ? "true" : "false"}
      className="w-full max-w-lg scroll-mt-[var(--bbti-action-dock-offset,9rem)] rounded-2xl glass p-5 sm:p-6 mb-6"
      style={{
        animation: "fade-up 0.5s ease-out",
        animationDelay: "1.36s",
        animationFillMode: "both",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-1">
            Share Kit
          </p>
          <h2 className="text-xl font-black text-white">
            分享战术板
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-white/42">
            先选主目标；下面是快捷复制替补席。
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-black text-white/40">
          {kits.length} TONES
        </span>
      </div>

      {preview && <div className="mb-4">{preview}</div>}

      {returnLaneCheck && (
        <div
          className="mb-4 rounded-2xl border border-kobe-gold/16 bg-kobe-gold/[0.055] p-3"
          data-testid="bbti-share-return-lane-check"
          data-bbti-share-return-lane-check-version={returnLaneCheck.version}
          data-bbti-share-return-lane-check-code={returnLaneCheck.code}
          data-bbti-share-return-lane-check-count={returnLaneCheck.rowCount}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-kobe-gold/70">
                Return Check
              </p>
              <h3 className="mt-1 text-base font-black text-white">
                分享回流体检
              </h3>
              <p className="mt-1 text-xs font-bold leading-relaxed text-white/42">
                复制前先看这条链接会把朋友带回哪里。
              </p>
            </div>
            <button
              type="button"
              onClick={copyReturnLaneCheck}
              data-testid="bbti-share-return-lane-check-action"
              data-bbti-share-return-lane-check-action="copy-check"
              className="shrink-0 rounded-full border border-kobe-gold/20 bg-white/[0.04] px-3 py-2 text-[11px] font-black text-kobe-gold/75 transition-colors hover:bg-kobe-gold/10 hover:text-white"
            >
              {quickCopy.isFailed(returnLaneCheckCopyId)
                ? "复制失败"
                : quickCopy.isCopied(returnLaneCheckCopyId)
                  ? "已复制"
                  : "复制体检"}
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {returnLaneCheck.rows.map((row, index) => {
              const isReady = row.status === "ready";
              const rowCopyId = `return-lane:${row.sourceKitId}`;

              return (
                <button
                  key={row.id}
                  type="button"
                  data-testid="bbti-share-return-lane-check-row"
                  data-bbti-share-return-lane-check-row={row.id}
                  data-bbti-share-return-lane-check-target={row.target}
                  data-bbti-share-return-lane-check-status={row.status}
                  data-bbti-share-return-lane-check-kit={row.sourceKitId}
                  data-bbti-share-return-lane-check-link-kind={row.linkKind}
                  data-bbti-share-return-lane-check-position={index + 1}
                  data-bbti-share-return-lane-check-action="copy-lane"
                  disabled={!isReady}
                  onClick={() => copyReturnLane(row.sourceKitId)}
                  className="min-h-[112px] rounded-xl border border-white/10 bg-black/18 p-3 text-left transition-colors enabled:hover:border-kobe-gold/30 enabled:hover:bg-kobe-gold/10 disabled:cursor-not-allowed disabled:opacity-58"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="rounded-full border border-kobe-gold/18 bg-kobe-gold/10 px-2 py-0.5 text-[10px] font-black text-kobe-gold/72">
                      {index + 1}. {row.label}
                    </span>
                    <span
                      data-testid="bbti-share-return-lane-check-status"
                      className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-black text-white/38"
                    >
                      {isReady
                        ? quickCopy.isFailed(rowCopyId)
                          ? "失败"
                          : quickCopy.isCopied(rowCopyId)
                            ? "已复制"
                            : "可回流"
                        : "缺上下文"}
                    </span>
                  </div>
                  <p className="text-xs font-black leading-snug text-white/82">
                    {row.title}
                  </p>
                  <p className="mt-1 line-clamp-3 text-[11px] font-bold leading-relaxed text-white/48">
                    {row.body}
                  </p>
                </button>
              );
            })}
          </div>
          <p
            data-testid="bbti-share-return-lane-check-boundary"
            className="mt-2 text-[10px] font-bold leading-relaxed text-white/34"
          >
            {returnLaneCheck.boundary}
          </p>
        </div>
      )}

      {lockerRoom && (
        <div
          className="mb-4 rounded-2xl border border-lebron-gold/15 bg-lebron-wine/[0.055] p-3"
          data-testid="bbti-share-locker-room"
          data-bbti-share-locker-room-version={lockerRoom.version}
          data-bbti-share-locker-room-code={lockerRoom.code}
          data-bbti-share-locker-room-count={lockerRoom.rowCount}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-lebron-gold/70">
                Locker Room
              </p>
              <h3 className="mt-1 text-base font-black text-white">
                更衣室分流入口
              </h3>
              <p className="mt-1 text-xs font-bold leading-relaxed text-white/42">
                先分清发给谁：看结果、拉双人复赛、还是直接进开庭案由。
              </p>
            </div>
            <button
              type="button"
              onClick={copyLockerRoom}
              data-testid="bbti-share-locker-room-action"
              data-bbti-share-locker-room-action="copy-locker-room"
              className="shrink-0 rounded-full border border-lebron-gold/20 bg-white/[0.04] px-3 py-2 text-[11px] font-black text-lebron-gold/75 transition-colors hover:bg-lebron-gold/10 hover:text-white"
            >
              {quickCopy.isFailed(lockerRoomCopyId)
                ? "复制失败"
                : quickCopy.isCopied(lockerRoomCopyId)
                  ? "已复制"
                  : "复制分流板"}
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {lockerRoom.rows.map((row, index) => {
              const rowCopyId = `locker-room:${row.sourceKitId}`;

              return (
                <button
                  key={row.id}
                  type="button"
                  data-testid="bbti-share-locker-room-row"
                  data-bbti-share-locker-room-row={row.id}
                  data-bbti-share-locker-room-target={row.target}
                  data-bbti-share-locker-room-kit={row.sourceKitId}
                  data-bbti-share-locker-room-link-kind={row.linkKind}
                  data-bbti-share-locker-room-position={index + 1}
                  data-bbti-share-locker-room-action="copy-route"
                  onClick={() => copyLockerRoomRow(row.sourceKitId)}
                  className="min-h-[108px] rounded-xl border border-white/10 bg-black/18 p-3 text-left transition-colors hover:border-lebron-gold/25 hover:bg-lebron-wine/10"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="rounded-full border border-lebron-gold/18 bg-lebron-gold/10 px-2 py-0.5 text-[10px] font-black text-lebron-gold/72">
                      {index + 1}. {row.label}
                    </span>
                    <span className="text-[9px] font-black text-white/30">
                      {quickCopy.isFailed(rowCopyId)
                        ? "失败"
                        : quickCopy.isCopied(rowCopyId)
                          ? "已复制"
                          : "复制"}
                    </span>
                  </div>
                  <p className="text-xs font-black leading-snug text-white/80">
                    {row.title}
                  </p>
                  <p className="mt-1 line-clamp-3 text-[11px] font-bold leading-relaxed text-white/48">
                    {row.body}
                  </p>
                </button>
              );
            })}
          </div>
          <p
            data-testid="bbti-share-locker-room-boundary"
            className="mt-2 text-[10px] font-bold leading-relaxed text-white/34"
          >
            {lockerRoom.boundary}
          </p>
        </div>
      )}

      {routeScoreboard && routeScoreboardKit && (
        <div
          className="mb-4 rounded-2xl border border-sky-200/15 bg-sky-200/[0.045] p-3"
          data-testid="bbti-share-route-scoreboard"
          data-bbti-share-route-scoreboard-version={routeScoreboard.version}
          data-bbti-share-route-scoreboard-kit={routeScoreboard.sourceKitId}
          data-bbti-share-route-scoreboard-code={routeScoreboard.code}
          data-bbti-share-route-scoreboard-event={routeScoreboard.eventId}
          data-bbti-share-route-scoreboard-challenge={routeScoreboard.challengeMatchupId}
          data-bbti-share-route-scoreboard-count={routeScoreboard.routeCount}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-sky-100/62">
                Route Scoreboard
              </p>
              <h3 className="mt-1 text-base font-black text-white">
                路线比分牌
              </h3>
              <p className="mt-1 text-xs font-bold leading-relaxed text-white/42">
                {routeScoreboard.eventTitle} · {routeScoreboard.challengeTitle}
              </p>
            </div>
            <button
              type="button"
              onClick={copyRouteScoreboard}
              data-testid="bbti-share-route-scoreboard-action"
              data-bbti-share-route-scoreboard-action="copy-scoreboard"
              className="shrink-0 rounded-full border border-sky-100/15 bg-white/[0.04] px-3 py-2 text-[11px] font-black text-sky-100/70 transition-colors hover:bg-sky-100/10 hover:text-white"
            >
              {quickCopy.isFailed(routeScoreboardCopyId)
                ? "复制失败"
                : quickCopy.isCopied(routeScoreboardCopyId)
                  ? "已复制"
                  : "复制比分牌"}
            </button>
          </div>

          <div className="grid gap-2">
            {routeScoreboard.rows.map((row, index) => (
              <div
                key={row.id}
                data-testid="bbti-share-route-scoreboard-row"
                data-bbti-share-route-scoreboard-row={row.id}
                data-bbti-share-route-scoreboard-target={row.target}
                data-bbti-share-route-scoreboard-position={index + 1}
                className="rounded-xl border border-white/10 bg-black/18 p-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-sky-100/45">
                      {row.label} · {row.scoreLabel}
                    </p>
                    <p className="mt-0.5 text-xs font-black text-white/80">
                      {row.title}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-black text-white/34">
                    {index + 1}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-[11px] font-bold leading-relaxed text-white/50">
                  {row.body}
                </p>
              </div>
            ))}
          </div>

          <p
            data-testid="bbti-share-route-scoreboard-boundary"
            className="mt-2 text-[10px] font-bold leading-relaxed text-white/34"
          >
            {routeScoreboard.boundary}
          </p>
        </div>
      )}

      <BbtiShareTargetPicker
        key={shareTargets.map((target) => target.id).join(":")}
        targets={shareTargets}
      />

      <div className="rounded-xl border border-white/10 bg-black/18 px-3 py-2.5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/28">
              Quick Copy
            </p>
            <h3 className="mt-0.5 text-sm font-black text-white">不看预览，直接复制一句能发的</h3>
          </div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0">
          {kits.map((kit, index) => {
            const copied = quickCopy.isCopied(kit.id);
            const failed = quickCopy.isFailed(kit.id);

            return (
              <button
                key={kit.id}
                type="button"
                data-testid="bbti-share-kit-quick-copy"
                data-bbti-share-kit-id={kit.id}
                data-bbti-share-kit-position={index + 1}
                data-bbti-share-kit-link-kind={kit.linkKind}
                data-bbti-share-kit-qa={quickCopyFilesForQa(kit)}
                onClick={() => copyKit(kit)}
                className={`min-h-[44px] min-w-[132px] rounded-full border px-3 py-2 text-left transition-colors cursor-pointer sm:min-w-0 ${TONE_CLASS[kit.tone]}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-[11px] font-black text-white">
                    {kit.channelLabel}
                  </span>
                  <span className="shrink-0 text-[10px] font-black opacity-70">
                    {failed ? "失败" : copied ? "已复制" : "复制"}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-[10px] font-bold opacity-58">
                  {kit.linkBadge}
                </div>
              </button>
            );
          })}
        </div>
        <BbtiManualCopyFallback
          text={quickCopy.feedback.manualCopyText}
          title="自动复制失败，长按下方战术板文案复制。"
          className="mt-3"
        />
      </div>
    </section>
  );
}
