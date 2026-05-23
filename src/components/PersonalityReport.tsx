"use client";

import type {
  PersonalityReport as PersonalityReportData,
  SpecificCall,
} from "@/data/personality-analysis";

// Re-export the canonical type from the data module so callers can import
// from either path. Local components reference the data-module type.
export type PersonalityReport = PersonalityReportData;

interface Props {
  report: PersonalityReportData;
}

function getScoreColor(score: number) {
  if (score >= 80) return { gradient: "url(#scoreGreen)", text: "text-emerald-400", bg: "from-emerald-500 to-green-400" };
  if (score >= 60) return { gradient: "url(#scoreYellow)", text: "text-amber-400", bg: "from-amber-500 to-yellow-400" };
  return { gradient: "url(#scoreRed)", text: "text-red-400", bg: "from-red-500 to-orange-400" };
}

function CircularProgress({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const colors = getScoreColor(score);

  return (
    <div className="relative w-36 h-36 mx-auto shimmer-ring">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="scoreGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
          <linearGradient id="scoreYellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>
          <linearGradient id="scoreRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />
        {/* Progress */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={colors.gradient}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-black ${colors.text}`}>
          {score}
        </span>
        <span className="text-xs text-white/40">/100</span>
      </div>
    </div>
  );
}

// Sub-bar for dataSense / eyeTest / contrarian breakdown
function SubScoreBar({ label, value, hint }: { label: string; value: number; hint: string }) {
  const colors = getScoreColor(value);
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-bold text-white/60 tracking-wider">{label}</span>
        <span className={`text-sm font-black ${colors.text}`}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colors.bg} transition-all duration-1000 ease-out`}
          style={{ width: `${Math.max(2, value)}%` }}
        />
      </div>
      <p className="text-[10px] text-white/30 leading-tight">{hint}</p>
    </div>
  );
}

// Render a verdict icon for a specific call
function verdictIcon(verdict: SpecificCall["verdict"]): string {
  switch (verdict) {
    case "contrarian-correct": return "\u{1F3AF}"; // 🎯
    case "fell-for-misconception": return "\u{1F4A5}"; // 💥
    case "right": return "\u{2705}"; // ✅
    case "wrong": return "\u{274C}"; // ❌
    default: return "\u{2022}";
  }
}

function verdictColor(verdict: SpecificCall["verdict"]): string {
  switch (verdict) {
    case "contrarian-correct": return "text-emerald-400";
    case "fell-for-misconception": return "text-red-400";
    case "right": return "text-emerald-400/80";
    case "wrong": return "text-red-400/80";
    default: return "text-white/40";
  }
}

export default function PersonalityReportCard({ report }: Props) {
  const iq = report.basketballIQ;
  // Optional richer fields (back-compat for older reports without them)
  const dataSense = typeof iq.dataSense === "number" ? iq.dataSense : iq.score;
  const eyeTest = typeof iq.eyeTest === "number" ? iq.eyeTest : iq.score;
  const contrarian = typeof iq.contrarian === "number" ? iq.contrarian : iq.score;
  const specificCalls: SpecificCall[] = Array.isArray(iq.specificCalls) ? iq.specificCalls : [];
  const levelLabel = iq.level ?? iq.grade;

  return (
    <div className="w-full max-w-2xl">
      {/* Top grid — Philosophy + Psychology */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1 - Philosophy */}
        <div
          className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-sm
            hover:border-white/20 hover:bg-white/[0.07] transition-colors duration-300"
          style={{ animation: "card-fade-in 0.6s ease-out 0.3s both" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">&#x1F9E0;</span>
            <h4 className="text-sm font-bold text-white/50 tracking-wider uppercase">
              哲学倾向
            </h4>
          </div>
          <p className="text-lg sm:text-xl font-black text-kobe-gold mb-2">
            {report.philosophy.school}
          </p>
          <p className="text-white/60 text-sm leading-relaxed mb-3">
            {report.philosophy.description}
          </p>
          <div className="border-t border-white/10 pt-3">
            <p className="text-white/40 text-xs italic leading-relaxed">
              &ldquo;{report.philosophy.quote}&rdquo;
            </p>
          </div>
        </div>

        {/* Card 2 - Psychology */}
        <div
          className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-sm
            hover:border-white/20 hover:bg-white/[0.07] transition-colors duration-300"
          style={{ animation: "card-fade-in 0.6s ease-out 0.5s both" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">&#x1F52E;</span>
            <h4 className="text-sm font-bold text-white/50 tracking-wider uppercase">
              心理画像
            </h4>
          </div>
          <p className="text-3xl sm:text-4xl font-black font-mono text-center text-white/90 mb-3 tracking-widest">
            {report.psychology.code}
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            {report.psychology.traits.map((trait) => (
              <span
                key={trait}
                className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/70 text-xs font-medium"
              >
                {trait}
              </span>
            ))}
          </div>
          <p className="text-center text-white/40 text-xs">
            决策风格: {report.psychology.decisionStyle}
          </p>
        </div>
      </div>

      {/* Card 3 - Basketball IQ (full-width, expanded layout) */}
      <div
        className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-sm
          hover:border-white/20 hover:bg-white/[0.07] transition-colors duration-300"
        style={{ animation: "card-fade-in 0.6s ease-out 0.7s both" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">&#x1F4CA;</span>
          <h4 className="text-sm font-bold text-white/50 tracking-wider uppercase">
            懂球指数
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5 sm:gap-6 items-center">
          {/* Left: circular score + level */}
          <div className="flex flex-col items-center">
            <CircularProgress score={iq.score} />
            <p className={`text-center text-base font-bold mt-3 ${getScoreColor(iq.score).text}`}>
              {levelLabel}
            </p>
          </div>

          {/* Right: 3 sub-score bars */}
          <div className="space-y-3 w-full">
            <SubScoreBar
              label="数据感 DATA"
              value={dataSense}
              hint="你的判断和统计/历史共识对齐的程度"
            />
            <SubScoreBar
              label="眼力 EYE TEST"
              value={eyeTest}
              hint="你和大众主流口径对齐的程度"
            />
            <SubScoreBar
              label="逆向 CONTRARIAN"
              value={contrarian}
              hint="敢逆大众且选对的能力"
            />
          </div>
        </div>

        {/* Analysis line */}
        <p className="text-white/60 text-sm leading-relaxed mt-4 border-t border-white/10 pt-4">
          {iq.analysis}
        </p>

        {/* Specific calls list */}
        {specificCalls.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-[11px] font-bold text-white/40 tracking-wider uppercase">
              关键判定 KEY CALLS
            </p>
            <div className="space-y-2">
              {specificCalls.map((call) => (
                <div
                  key={call.topicId}
                  className="flex gap-2 items-start text-xs leading-relaxed bg-white/[0.03] border border-white/5 rounded-lg p-3"
                >
                  <span className={`text-base shrink-0 ${verdictColor(call.verdict)}`}>
                    {verdictIcon(call.verdict)}
                  </span>
                  <p className="text-white/65">{call.analysis}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card 4 - Overall (full-width below the grid) */}
      <div
        className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.05] to-white/[0.03] p-6 sm:p-8 backdrop-blur-sm
          hover:border-white/20 transition-colors duration-300"
        style={{ animation: "card-fade-in 0.6s ease-out 0.9s both" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">&#x1F4CB;</span>
          <h4 className="text-sm font-bold text-white/50 tracking-wider uppercase">
            综合报告
          </h4>
        </div>
        <p className="text-white/80 text-sm sm:text-base leading-relaxed">
          {report.overall}
        </p>
      </div>
    </div>
  );
}
