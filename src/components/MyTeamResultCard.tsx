"use client";

export const BBTI_MY_TEAM_RESULT_CARD_VERSION = "bbti-myteam-result-card-v1" as const;

export type MyTeamTier = "darkMatter" | "galaxyOpal" | "pinkDiamond" | "diamond" | "amethyst";

export interface MyTeamAttribute {
  key: string;
  label: string;
  value: number;
}

export interface MyTeamBadge {
  label: string;
  tone?: "gold" | "purple" | "red" | "blue";
}

interface MyTeamResultCardProps {
  tier?: MyTeamTier;
  overall: number;
  code: string;
  title: string;
  subtitle: string;
  emoji: string;
  edition: string;
  sideLabel?: string;
  attributes: MyTeamAttribute[];
  badges?: MyTeamBadge[];
  footerLeft: string;
  footerRight: string;
  signature?: string;
  qaContext?: string;
  qaTestId?: string;
  qaVersion?: string;
}

function clampStat(value: number): number {
  return Math.max(60, Math.min(99, value));
}

const TIER_STYLES: Record<MyTeamTier, { label: string; frame: string; chip: string; glow: string }> = {
  darkMatter: {
    label: "DARK MATTER",
    frame: "border-fuchsia-300/40 bg-[linear-gradient(145deg,rgba(236,72,153,0.24),rgba(85,37,131,0.28),rgba(14,165,233,0.18))]",
    chip: "bg-fuchsia-300 text-black",
    glow: "shadow-[0_0_38px_rgba(217,70,239,0.18)]",
  },
  galaxyOpal: {
    label: "GALAXY OPAL",
    frame: "border-cyan-300/35 bg-[linear-gradient(145deg,rgba(34,211,238,0.2),rgba(85,37,131,0.28),rgba(253,185,39,0.18))]",
    chip: "bg-cyan-200 text-black",
    glow: "shadow-[0_0_36px_rgba(34,211,238,0.16)]",
  },
  pinkDiamond: {
    label: "PINK DIAMOND",
    frame: "border-pink-300/35 bg-[linear-gradient(145deg,rgba(244,114,182,0.22),rgba(85,37,131,0.28),rgba(134,0,56,0.2))]",
    chip: "bg-pink-300 text-black",
    glow: "shadow-[0_0_34px_rgba(244,114,182,0.16)]",
  },
  diamond: {
    label: "DIAMOND",
    frame: "border-sky-300/35 bg-[linear-gradient(145deg,rgba(125,211,252,0.22),rgba(15,23,42,0.48),rgba(85,37,131,0.2))]",
    chip: "bg-sky-200 text-black",
    glow: "shadow-[0_0_34px_rgba(125,211,252,0.14)]",
  },
  amethyst: {
    label: "AMETHYST",
    frame: "border-purple-300/35 bg-[linear-gradient(145deg,rgba(168,85,247,0.22),rgba(15,23,42,0.52),rgba(134,0,56,0.18))]",
    chip: "bg-purple-300 text-black",
    glow: "shadow-[0_0_34px_rgba(168,85,247,0.14)]",
  },
};

const BADGE_STYLES: Required<Record<NonNullable<MyTeamBadge["tone"]>, string>> = {
  gold: "border-yellow-300/35 bg-yellow-300/12 text-yellow-100",
  purple: "border-purple-300/35 bg-purple-300/12 text-purple-100",
  red: "border-red-300/35 bg-red-300/12 text-red-100",
  blue: "border-sky-300/35 bg-sky-300/12 text-sky-100",
};

export default function MyTeamResultCard({
  tier = "galaxyOpal",
  overall,
  code,
  title,
  subtitle,
  emoji,
  edition,
  sideLabel,
  attributes,
  badges = [],
  footerLeft,
  footerRight,
  signature,
  qaContext,
  qaTestId,
  qaVersion,
}: MyTeamResultCardProps) {
  const tierStyle = TIER_STYLES[tier];
  const cardAttributes = attributes.slice(0, 6).map((item) => ({
    ...item,
    value: clampStat(Math.round(item.value)),
  }));
  const ovr = clampStat(Math.round(overall));

  return (
    <div
      className="w-full max-w-lg mb-6"
      data-testid={qaTestId}
      data-myteam-card-context={qaContext}
      data-myteam-card-version={qaVersion}
      data-bbti-myteam-card-code={qaContext ? code : undefined}
      data-bbti-myteam-card-overall={qaContext ? ovr : undefined}
      data-bbti-myteam-card-tier={qaContext ? tier : undefined}
      data-bbti-myteam-card-attribute-count={qaContext ? cardAttributes.length : undefined}
      style={{ animation: "fade-up 0.65s ease-out" }}
    >
      <div className={`relative overflow-hidden rounded-2xl border p-5 ${tierStyle.frame} ${tierStyle.glow}`}>
        <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(253,185,39,0.38),transparent_26%)]" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <span className={`rounded-full px-3 py-1 text-[10px] font-black tracking-widest ${tierStyle.chip}`}>
              {tierStyle.label}
            </span>
            <span className="text-[10px] font-black text-yellow-200/70 tracking-[0.24em]">
              {edition}
            </span>
          </div>

          <div className="grid grid-cols-[78px_1fr_82px] sm:grid-cols-[96px_1fr_96px] gap-3 items-center mb-5">
            <div className="text-center border-r border-yellow-400/15 pr-3">
              <div className="text-5xl font-black text-yellow-300 leading-none">{ovr}</div>
              <div className="text-[10px] font-black text-white/45 tracking-widest mt-1">OVR</div>
              <div className="mt-3 text-base sm:text-lg font-black text-white break-words">{code}</div>
              <div className="text-[10px] text-white/35">CARD</div>
            </div>

            <div className="text-center min-w-0">
              <div className="text-6xl mb-2 drop-shadow-[0_0_18px_rgba(253,185,39,0.35)]">
                {emoji}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-1 leading-tight">
                {title}
              </h3>
              {sideLabel && <p className="text-xs text-white/55 mb-1">{sideLabel}</p>}
              <p className="text-xs text-white/42 leading-relaxed">{subtitle}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              {cardAttributes.map((item, index) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-2 text-xs"
                  data-testid={qaContext ? "bbti-myteam-scouting-attribute" : undefined}
                  data-bbti-myteam-attribute={qaContext ? item.key : undefined}
                  data-bbti-myteam-attribute-value={qaContext ? item.value : undefined}
                  data-bbti-myteam-attribute-position={qaContext ? index + 1 : undefined}
                >
                  <span className="font-black text-yellow-200">{item.value}</span>
                  <span className="text-white/50">{item.key}</span>
                </div>
              ))}
            </div>
          </div>

          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {badges.slice(0, 4).map((badge) => (
                <span
                  key={badge.label}
                  className={`max-w-full truncate rounded-full border px-2.5 py-1 text-[10px] font-bold ${BADGE_STYLES[badge.tone ?? "gold"]}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {cardAttributes.slice(0, 5).map((item) => (
              <div key={item.key} className="h-1.5 rounded-full bg-black/30 overflow-hidden" title={item.label}>
                <div
                  className="h-full rounded-full bg-yellow-300"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            ))}
          </div>

          <div className="border-t border-yellow-400/15 pt-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-[10px] text-white/35 mb-1">PRIMARY</p>
                <p className="text-xs sm:text-sm font-bold text-white/80 leading-relaxed">{footerLeft}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/35 mb-1">MATCHUP</p>
                <p className="text-xs sm:text-sm font-bold text-white/80 leading-relaxed">{footerRight}</p>
              </div>
            </div>
            {signature && (
              <>
                <p className="text-[10px] font-black text-yellow-200/70 tracking-widest mb-1">
                  SIGNATURE
                </p>
                <p className="text-xs sm:text-sm text-white/78 leading-relaxed">
                  {signature}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
