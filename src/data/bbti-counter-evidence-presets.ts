import type { PoleKey } from "./bbti";
import type { BbtiChallengeMatchup } from "./bbti-challenges";
import {
  pickBbtiCounterEvidenceFact,
  type BbtiCounterEvidenceFactField,
} from "./bbti-counter-evidence-facts";
import type { BbtiFilmRoomCrossExam } from "./bbti-film-room-cross-exams";
import type { BbtiFilmRoomClip } from "./bbti-playbook";

export interface BbtiCounterEvidence {
  claim: string;
  evidence: string;
  question: string;
  decisionPrompt: string;
  sourceLabel: string;
  sources: {
    presetKey?: string;
    evidence:
      | "challenge.receiptA"
      | "challenge.receiptB"
      | "challenge.iconicMoment"
      | "crossExam.counterPunch";
    question: "crossExam.question" | "challenge.pressureQuestion" | "generic";
    factId?: string;
    sourceId?: string;
  };
}

interface CounterEvidenceInput {
  clip: BbtiFilmRoomClip;
  crossExam: BbtiFilmRoomCrossExam;
  dimensionLabel: string;
  challenge?: BbtiChallengeMatchup;
}

interface MatchupCounterFrame {
  frame: string;
  receiptOrder: BbtiCounterEvidenceFactField[];
  sourceLabel: string;
}

const MATCHUP_FRAMES: Record<string, MatchupCounterFrame> = {
  "kobe-vs-lebron": {
    frame: "单挑终结和全能解题的反证",
    receiptOrder: ["iconicMoment", "receiptB", "receiptA"],
    sourceLabel: "核心价值证词",
  },
  "kobe-vs-jordan": {
    frame: "技术继承和原型压迫的反证",
    receiptOrder: ["iconicMoment", "receiptB", "receiptA"],
    sourceLabel: "美学镜像证词",
  },
  "lebron-vs-jordan": {
    frame: "峰值和长度互相拉扯的反证",
    receiptOrder: ["iconicMoment", "receiptB", "receiptA"],
    sourceLabel: "历史第一证词",
  },
  "magic-vs-bird": {
    frame: "体系发动和宿敌叙事的反证",
    receiptOrder: ["iconicMoment", "receiptB", "receiptA"],
    sourceLabel: "团队叙事证词",
  },
  "curry-vs-durant": {
    frame: "体系引力和无差别硬解的反证",
    receiptOrder: ["iconicMoment", "receiptB", "receiptA"],
    sourceLabel: "王朝归因证词",
  },
  "duncan-vs-garnett": {
    frame: "稳定地基和防守火山的反证",
    receiptOrder: ["iconicMoment", "receiptB", "receiptA"],
    sourceLabel: "内线地基证词",
  },
  "ai-vs-tmac": {
    frame: "记忆价值和履历缺口的反证",
    receiptOrder: ["iconicMoment", "receiptB", "receiptA"],
    sourceLabel: "情怀遗憾证词",
  },
  "shaq-vs-yao": {
    frame: "禁区碾压和技术想象的反证",
    receiptOrder: ["iconicMoment", "receiptB", "receiptA"],
    sourceLabel: "禁区对位证词",
  },
};

const DECISION_PROMPT_BY_POLE: Record<PoleKey, string> = {
  O: "坚持就说明为什么进攻爆点足够覆盖回合成本；改判就承认防守账单也能改变胜负。",
  D: "坚持就说明防守控制如何直接兑换胜利；改判就承认有些进攻火力会把防线打穿。",
  A: "坚持就把样本、时代和对手范围说清楚；改判就承认录像语境会修正表格结论。",
  E: "坚持就说明这个镜头为什么能代表长期价值；改判就承认高光不能自动删除完整样本。",
  I: "坚持就证明巨星硬解能穿透包夹；改判就承认最高压回合也需要队友和结构。",
  T: "坚持就证明体系能处理最后两分钟；改判就承认系列赛终点常常逼出第一选择。",
  L: "坚持就说明忠诚加成的上限；改判就承认巅峰窗口不会永远等管理层。",
  R: "坚持就说明冠军路径的成本；改判就承认戒指数量不能抹平身份和过程。",
};

function pickEvidence(
  challenge: BbtiChallengeMatchup | undefined,
  frame: MatchupCounterFrame | undefined,
  crossExam: BbtiFilmRoomCrossExam,
): {
  evidence: string;
  sourceLabel: string;
  evidenceSource: BbtiCounterEvidence["sources"]["evidence"];
  factId?: string;
  sourceId?: string;
} {
  if (!challenge) {
    return {
      evidence: crossExam.counterPunch,
      sourceLabel: crossExam.source === "question" ? "题目反证" : "倾向反证",
      evidenceSource: "crossExam.counterPunch",
    };
  }

  const fact = pickBbtiCounterEvidenceFact(
    challenge,
    frame?.receiptOrder ?? ["iconicMoment", "receiptB", "receiptA"],
  );

  if (fact) {
    return {
      evidence: fact.text,
      sourceLabel: frame?.sourceLabel ?? fact.sourceLabel,
      evidenceSource: fact.evidenceSource,
      factId: fact.id,
      sourceId: fact.sourceId,
    };
  }

  return {
    evidence: crossExam.counterPunch,
    sourceLabel: frame?.sourceLabel ?? "命定对线证词",
    evidenceSource: "crossExam.counterPunch",
  };
}

export function getBbtiCounterEvidence({
  clip,
  crossExam,
  dimensionLabel,
  challenge,
}: CounterEvidenceInput): BbtiCounterEvidence {
  const primaryPole = clip.coachTimeout.poles[0];
  const poleLabel = primaryPole?.label ?? dimensionLabel;
  const frame = challenge ? MATCHUP_FRAMES[challenge.matchupId] : undefined;
  const { evidence, sourceLabel, evidenceSource, factId, sourceId } = pickEvidence(
    challenge,
    frame,
    crossExam,
  );
  const frameLabel = frame?.frame ?? crossExam.title;
  const question = crossExam.question || challenge?.pressureQuestion || "如果换到另一位球星或另一轮系列赛，你还会保持同一套标准吗？";
  const questionSource: BbtiCounterEvidence["sources"]["question"] = crossExam.question
    ? "crossExam.question"
    : challenge?.pressureQuestion
      ? "challenge.pressureQuestion"
      : "generic";

  return {
    claim: challenge
      ? `你准备用 Q${clip.questionId} 的「${poleLabel}」去打 ${challenge.title}，战术板先摆出${frameLabel}。`
      : `你准备用 Q${clip.questionId} 的「${poleLabel}」开这段录像室，对面先按「${crossExam.standard}」复核。`,
    evidence,
    question,
    decisionPrompt: primaryPole
      ? DECISION_PROMPT_BY_POLE[primaryPole.pole]
      : "坚持就把同一套标准换到另一位球星身上；改判就承认这条证据改变了你的权重。",
    sourceLabel,
    sources: {
      presetKey: challenge?.matchupId,
      evidence: evidenceSource,
      question: questionSource,
      factId,
      sourceId,
    },
  };
}
