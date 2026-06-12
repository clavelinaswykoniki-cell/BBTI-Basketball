import { getMatchupMemePack } from "@/data/matchup-memes";

interface CourtAgendaProps {
  matchupId: string | null;
  nameA: string;
  nameB: string;
  topicTitle?: string;
  compact?: boolean;
}

export default function CourtAgenda({
  matchupId,
  nameA,
  nameB,
  topicTitle,
  compact = false,
}: CourtAgendaProps) {
  const pack = getMatchupMemePack(matchupId, nameA, nameB);

  if (compact) {
    return (
      <div
        className="mb-6 rounded-xl border border-yellow-400/20 bg-yellow-400/[0.06] px-4 py-3"
        style={{ animation: "fade-up 0.45s ease-out" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-yellow-300">
                Game Thread
              </span>
              <span className="rounded-full border border-yellow-300/25 px-2 py-0.5 text-[10px] font-black text-yellow-200">
                {pack.heat}
              </span>
              {topicTitle && <span className="text-[10px] text-white/30">本回合：{topicTitle}</span>}
            </div>
            <p className="text-sm font-bold text-white/85 leading-relaxed">
              {pack.pressureQuestion}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/50 sm:shrink-0">
            禁句：{pack.bannedPhrase}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-3xl mb-8 rounded-2xl border border-yellow-400/20 bg-[linear-gradient(135deg,rgba(253,185,39,0.11),rgba(85,37,131,0.18),rgba(134,0,56,0.12))] p-4 sm:p-5"
      style={{ animation: "fade-up 0.55s ease-out" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-yellow-300">
              Court Agenda
            </span>
            <span className="rounded-full bg-yellow-300 px-2.5 py-0.5 text-[10px] font-black text-black">
              {pack.heat}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
            {pack.headline}
          </h3>
          <p className="text-xs text-white/40 mt-1">{pack.court}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {pack.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold text-white/55"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-[10px] font-black text-yellow-200/70 uppercase tracking-widest mb-1">Stakes</p>
          <p className="text-xs sm:text-sm text-white/72 leading-relaxed">{pack.stakes}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-[10px] font-black text-yellow-200/70 uppercase tracking-widest mb-1">Pressure</p>
          <p className="text-xs sm:text-sm text-white/72 leading-relaxed">{pack.pressureQuestion}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-[10px] font-black text-yellow-200/70 uppercase tracking-widest mb-1">No Lazy Take</p>
          <p className="text-xs sm:text-sm text-white/72 leading-relaxed">{pack.bannedPhrase}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-yellow-400/15 pt-3">
        <p className="text-sm font-bold text-white/80 leading-relaxed">
          {pack.chant}
        </p>
        <p className="text-xs text-white/35 mt-1">
          群聊弹药：{pack.groupChatPrompt}
        </p>
      </div>
    </div>
  );
}
