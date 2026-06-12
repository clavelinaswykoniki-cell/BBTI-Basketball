export const BBTI_FILM_ROOM_REMIX_BENCH_VERSION = "bbti-film-room-remix-bench-v1" as const;
export const BBTI_FILM_ROOM_REMIX_BENCH_BOUNDARY = "本地录像室回看替补席，只复用当前答题录像、加练卡和本地模拟看台，不代表外部热度、真实投票或真实活跃。" as const;

export type BbtiFilmRoomRemixBenchRowId = "clip-read" | "drill-card" | "poll-read";
export type BbtiFilmRoomRemixBenchTarget = "clip" | "drill" | "poll";

export interface BbtiFilmRoomRemixTrendInput {
  label: string;
  tone: string;
  average: number;
  readCount: number;
  strongestQuestionId: number;
  toughestQuestionId: number;
}

export interface BbtiFilmRoomRemixBenchInput {
  code: string;
  activeClipNo: number;
  clipCount: number;
  questionId: number;
  dimensionLabel: string;
  clipTitle: string;
  answerText: string;
  drillTitle: string;
  drillStepCount: number;
  trend?: BbtiFilmRoomRemixTrendInput | null;
  isSharedClipMode?: boolean;
}

export interface BbtiFilmRoomRemixBenchRow {
  id: BbtiFilmRoomRemixBenchRowId;
  target: BbtiFilmRoomRemixBenchTarget;
  label: string;
  title: string;
  body: string;
  meta: string;
}

export interface BbtiFilmRoomRemixBench {
  version: typeof BBTI_FILM_ROOM_REMIX_BENCH_VERSION;
  boundary: typeof BBTI_FILM_ROOM_REMIX_BENCH_BOUNDARY;
  code: string;
  source: "local-answer-history" | "shared-clip" | "local-fallback";
  activeQuestionId: number;
  clipCount: number;
  rowCount: number;
  rows: BbtiFilmRoomRemixBenchRow[];
  copyText: string;
}

function trendBody(trend: BbtiFilmRoomRemixTrendInput | null | undefined): string {
  if (!trend) {
    return "这次只有单段回放，先用当前 clip 和加练卡复盘；完整答卷会补上本地模拟看台趋势。";
  }

  return `${trend.label}｜${trend.tone}｜约 ${trend.average}% 模拟同路，最顺手 Q${trend.strongestQuestionId}，最硬 Q${trend.toughestQuestionId}。`;
}

export function resolveBbtiFilmRoomRemixBench(
  input: BbtiFilmRoomRemixBenchInput,
): BbtiFilmRoomRemixBench {
  const source = input.isSharedClipMode
    ? "shared-clip"
    : input.trend
      ? "local-answer-history"
      : "local-fallback";
  const rows: BbtiFilmRoomRemixBenchRow[] = [
    {
      id: "clip-read",
      target: "clip",
      label: "1Q",
      title: `Q${input.questionId} · ${input.dimensionLabel}`,
      body: input.isSharedClipMode
        ? "分享链接复原的单段选择，只回看这一球，不推断完整答卷。"
        : `${input.clipTitle}｜${input.answerText}`,
      meta: `${input.activeClipNo}/${input.clipCount} clips`,
    },
    {
      id: "drill-card",
      target: "drill",
      label: "2Q",
      title: input.drillTitle,
      body: "按证据句、矛盾句、质询句、洞察句四步加练，把这题从结论变成可反打的问题。",
      meta: `${input.drillStepCount} steps`,
    },
    {
      id: "poll-read",
      target: "poll",
      label: "OT",
      title: input.trend ? "接模拟看台" : "等待完整趋势",
      body: trendBody(input.trend),
      meta: input.trend ? `${input.trend.readCount} reads` : "local only",
    },
  ];

  return {
    version: BBTI_FILM_ROOM_REMIX_BENCH_VERSION,
    boundary: BBTI_FILM_ROOM_REMIX_BENCH_BOUNDARY,
    code: input.code,
    source,
    activeQuestionId: input.questionId,
    clipCount: input.clipCount,
    rowCount: rows.length,
    rows,
    copyText: [
      "BBTI 录像室回看替补席",
      `${input.code} · Q${input.questionId} · ${input.dimensionLabel}`,
      ...rows.map((row, index) => `${index + 1}. ${row.label} ${row.title}：${row.body}`),
      `边界：${BBTI_FILM_ROOM_REMIX_BENCH_BOUNDARY}`,
    ].join("\n"),
  };
}

export function buildBbtiFilmRoomRemixBenchCopy(bench: BbtiFilmRoomRemixBench): string {
  return bench.copyText;
}
