import type { BbtiFilmRoomCrossExam } from "./bbti-film-room-cross-exams";
import type { BbtiFilmRoomClip } from "./bbti-playbook";

export type BbtiFilmRoomDrillStepId = "evidence" | "tension" | "cross-exam" | "insight";

export interface BbtiFilmRoomDrillStep {
  id: BbtiFilmRoomDrillStepId;
  label: string;
  text: string;
}

export interface BbtiFilmRoomDrill {
  qaKey: string;
  title: string;
  steps: BbtiFilmRoomDrillStep[];
}

function seatQaKey(seat: BbtiFilmRoomCrossExam["seat"]): string {
  if (seat === "数据席") return "data";
  if (seat === "录像席") return "film";
  return "tactic";
}

export function resolveBbtiFilmRoomDrill({
  clip,
  crossExam,
  dimensionLabel,
}: {
  clip: BbtiFilmRoomClip;
  crossExam: BbtiFilmRoomCrossExam;
  dimensionLabel: string;
}): BbtiFilmRoomDrill {
  return {
    qaKey: `q${clip.questionId}-${crossExam.source}-${seatQaKey(crossExam.seat)}`,
    title: `${dimensionLabel}加练四连`,
    steps: [
      {
        id: "evidence",
        label: "证据句",
        text: `${clip.answerText}；这说明你这题先押了「${clip.coachTimeout.title}」。`,
      },
      {
        id: "tension",
        label: "矛盾句",
        text: clip.coachTimeout.blindSpot,
      },
      {
        id: "cross-exam",
        label: "质询句",
        text: crossExam.question,
      },
      {
        id: "insight",
        label: "洞察句",
        text: `真正要判的是：${crossExam.standard}。`,
      },
    ],
  };
}

export function buildBbtiFilmRoomDrillCopy({
  code,
  drill,
  typeName,
}: {
  code: string;
  drill: BbtiFilmRoomDrill;
  typeName?: string;
}): string {
  return [
    `BBTI 录像室加练：${typeName ? `${typeName}（${code}）` : code}`,
    drill.title,
    ...drill.steps.map((step) => `${step.label}：${step.text}`),
  ].join("\n");
}
