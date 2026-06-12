import { scoreBbtiAnswer, type BbtiAnswer, type BbtiQuestion, type PoleKey } from "./bbti";
import { getBbtiAnswerPollPreset } from "./bbti-answer-poll-presets";

export interface BbtiAnswerPoll {
  source: "local-simulation";
  selectedPercent: number;
  dissentPercent: number;
  selectedLabel: string;
  dissentLabel: string;
  callout: string;
  detail: string;
}

const POLE_LABELS: Record<PoleKey, string> = {
  O: "进攻看台",
  D: "防守看台",
  A: "数据席",
  E: "高光席",
  I: "巨星席",
  T: "体系席",
  L: "主队席",
  R: "争冠席",
};

function stableHash(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function answerFingerprint(answer: BbtiAnswer): string {
  if (answer.selected) return answer.selected;
  if (answer.selectedIndices?.length) return answer.selectedIndices.join(".");
  return answer.text ? "open" : "unknown";
}

function choiceLabel(question: BbtiQuestion, answer: BbtiAnswer): string {
  if (answer.selected === "A" && question.optionA?.pole) {
    return POLE_LABELS[question.optionA.pole];
  }
  if (answer.selected === "B" && question.optionB?.pole) {
    return POLE_LABELS[question.optionB.pole];
  }

  const firstIndex = answer.selectedIndices?.[0];
  if (typeof firstIndex === "number") {
    const scores = question.options?.[firstIndex]?.scores ?? {};
    const pole = Object.entries(scores).sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))[0]?.[0] as PoleKey | undefined;
    if (pole) return POLE_LABELS[pole];
  }

  return "你的看台";
}

function dissentLabel(question: BbtiQuestion, answer: BbtiAnswer): string {
  if (answer.selected === "A" && question.optionB?.pole) {
    return POLE_LABELS[question.optionB.pole];
  }
  if (answer.selected === "B" && question.optionA?.pole) {
    return POLE_LABELS[question.optionA.pole];
  }
  return "反方看台";
}

function pollCallout(percent: number): string {
  if (percent <= 37) return "少数派回合，适合发群让朋友正面反驳。";
  if (percent <= 48) return "看台分歧很大，这题没有轻松过半。";
  if (percent <= 60) return "略占上风，但对面还有足够空间追问。";
  return "顺风回合，不过下一句最好补上你的篮球标准。";
}

function fallbackSelectedPercent(question: BbtiQuestion, answer: BbtiAnswer, totalStrength: number): number {
  if (question.type === "binary" && answer.selected) {
    const sideAPercent = clamp(34 + (stableHash(`${question.id}:binary-split`) % 33), 26, 74);
    return answer.selected === "A" ? sideAPercent : 100 - sideAPercent;
  }

  const hash = stableHash(`${question.id}:${question.type}:${answerFingerprint(answer)}`);
  const base = 40 + (hash % 29);
  const direction = ((hash >>> 7) % 3) - 1;
  const swing = Math.min(8, totalStrength * 2);
  return clamp(base + direction * swing, 26, 74);
}

export function getBbtiAnswerPoll(question: BbtiQuestion, answer: BbtiAnswer): BbtiAnswerPoll | null {
  if (question.type === "open") return null;

  const preset = getBbtiAnswerPollPreset(question, answer);
  if (preset) return preset;

  const scored = Object.values(scoreBbtiAnswer(question, answer)).filter((points) => points > 0);
  if (!scored.length) return null;

  const totalStrength = scored.reduce((sum, points) => sum + points, 0);
  const selectedPercent = fallbackSelectedPercent(question, answer, totalStrength);
  const dissentPercent = 100 - selectedPercent;

  return {
    source: "local-simulation",
    selectedPercent,
    dissentPercent,
    selectedLabel: choiceLabel(question, answer),
    dissentLabel: dissentLabel(question, answer),
    callout: pollCallout(selectedPercent),
    detail: "本地模拟，不代表真实用户投票。",
  };
}
