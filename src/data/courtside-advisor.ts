import type { DebateTopic } from "./debates";
import type { BbtiChallengeCaseContext } from "./bbti-challenge-case";
import type { ReplayStatBomb, VoteSide } from "./stat-bombs";

export interface CourtSideAdvisorInput {
  topic: DebateTopic;
  votedFor: VoteSide;
  nameA: string;
  nameB: string;
  statBomb?: ReplayStatBomb | null;
  caseContext?: BbtiChallengeCaseContext | null;
}

export interface CourtSideAdvisorRead {
  votedName: string;
  opponentName: string;
  tag: string;
  title: string;
  coachCue: string;
  reviewQuestion: string;
  counterRead: string;
  copyText: string;
}

interface TopicLens {
  tag: string;
  coachCue: string;
  reviewQuestion: string;
}

const TOPIC_LENSES: Record<string, TopicLens> = {
  rings: {
    tag: "荣誉回合",
    coachCue: "这票不是数戒指这么简单，要解释冠军里的角色、对手和建队成本。",
    reviewQuestion: "如果把队友、时代和核心身份一起算，你的标准还站得住吗？",
  },
  championships: {
    tag: "冠军窗口",
    coachCue: "先分清你是在奖励结果，还是在奖励带队穿过季后赛的路径。",
    reviewQuestion: "这个选择最怕被对方用哪一次季后赛履历反击？",
  },
  finals: {
    tag: "总决赛镜头",
    coachCue: "总决赛讨论要看最高舞台，也要看对手强度和系列赛任务。",
    reviewQuestion: "你押的是单场名场面，还是整个系列赛的稳定产出？",
  },
  clutch: {
    tag: "最后两分钟",
    coachCue: "关键球不是只看敢不敢投，还要看对方防线给了什么选择。",
    reviewQuestion: "落后一分时，你要英雄球、错位点名，还是最优解？",
  },
  skill: {
    tag: "录像师视角",
    coachCue: "打法美感要回到可复制的技术包：脚步、投射、处理球和防守惩罚。",
    reviewQuestion: "这套技术换到另一个时代，还能同样惩罚防守吗？",
  },
  dominance: {
    tag: "压制力测试",
    coachCue: "统治力要看对手有没有被迫改阵、夹击、换防或提前叫暂停。",
    reviewQuestion: "对面教练最先为谁改比赛计划？",
  },
  defense: {
    tag: "防守回合",
    coachCue: "防守票要说明防谁、怎么防、能不能在季后赛被针对。",
    reviewQuestion: "最后一防，你更相信单点锁人，还是体系轮转不犯错？",
  },
  mvp: {
    tag: "媒体票与价值",
    coachCue: "个人荣誉要拆成常规赛价值、叙事风向和球队战绩。",
    reviewQuestion: "如果只看当季不可替代性，你还会投同一个人吗？",
  },
  legacy: {
    tag: "历史地位",
    coachCue: "历史票先定义标准：峰值、长度、荣誉、影响力，不能每一句换一把尺。",
    reviewQuestion: "你的历史标准能不能同时解释你不喜欢的球员？",
  },
  impact: {
    tag: "影响力回合",
    coachCue: "影响力不只看粉丝声量，也要看联盟打法、商业版图和后辈模仿。",
    reviewQuestion: "离开球场数据后，谁真正改变了后来者的篮球想象？",
  },
  entertainment: {
    tag: "买票理由",
    coachCue: "观赏性票可以上头，但要说明你买票到底想看什么回合。",
    reviewQuestion: "如果只能留一盘录像给新球迷，你留哪种篮球美学？",
  },
  mentality: {
    tag: "精神属性",
    coachCue: "精神讨论要落到长期行为，不要只靠一句口号或一个镜头。",
    reviewQuestion: "这份意志力有没有在失败、伤病和低谷里持续出现？",
  },
  "peak-vs-peak": {
    tag: "巅峰互换",
    coachCue: "巅峰对巅峰要先限定版本，再讨论谁更不怕防守资源倾斜。",
    reviewQuestion: "只打一轮抢七系列赛，你押谁的技能包更难被拆？",
  },
};

const DEFAULT_LENS: TopicLens = {
  tag: "场边读秒",
  coachCue: "这票先别急着发群，先把你的评价标准说清楚。",
  reviewQuestion: "如果朋友只准你补一句证据，你会补比赛画面、数据，还是建队逻辑？",
};

function caseStandard(caseContext: BbtiChallengeCaseContext): string {
  switch (caseContext.source) {
    case "film-room":
      return caseContext.crossExamStandard;
    case "result":
      return caseContext.recommendationReason;
    case "arena-event":
      return caseContext.eventPressureTest;
  }
}

function caseQuestion(caseContext: BbtiChallengeCaseContext): string {
  switch (caseContext.source) {
    case "film-room":
      return caseContext.crossExamQuestion;
    case "result":
    case "arena-event":
      return caseContext.caseQuestion;
  }
}

function caseOrigin(caseContext: BbtiChallengeCaseContext): string {
  switch (caseContext.source) {
    case "film-room":
      return `Q${caseContext.questionId} 录像室`;
    case "result":
      return "赛后报告";
    case "arena-event":
      return `${caseContext.eventTag} 情境`;
  }
}

export function getCourtSideAdvisorRead(input: CourtSideAdvisorInput): CourtSideAdvisorRead {
  const { topic, votedFor, nameA, nameB, statBomb } = input;
  const caseContext = input.caseContext ?? null;
  const votedName = votedFor === "kobe" ? nameA : nameB;
  const opponentName = votedFor === "kobe" ? nameB : nameA;
  const lens = TOPIC_LENSES[topic.id] ?? DEFAULT_LENS;
  const chosenClaim = votedFor === "kobe" ? topic.kobe.claim : topic.lebron.claim;
  const hasCounterBomb = Boolean(statBomb && statBomb.side !== votedFor);
  const standard = caseContext ? caseStandard(caseContext) : null;
  const caseReviewQuestion = caseContext ? caseQuestion(caseContext) : null;
  const counterRead = hasCounterBomb
    ? `Replay Center 现在给了 ${opponentName} 一条反证，你需要补上比赛语境，不能只重复立场。`
    : caseContext
      ? `这场从${caseOrigin(caseContext)}带入。你这票要回应「${standard}」，否则会被对方抓住自洽漏洞。`
      : `你这票暂时没有被回放直接反打，但下一句最好补证据，不要只靠粉籍。`;
  const reviewQuestion = caseReviewQuestion ?? lens.reviewQuestion;
  const title = `你把球交给了 ${votedName}`;

  return {
    votedName,
    opponentName,
    tag: lens.tag,
    title,
    coachCue: lens.coachCue,
    reviewQuestion,
    counterRead,
    copyText: [
      `场边助教点评：${topic.title}`,
      `我的选择：${votedName}`,
      `主张：${chosenClaim}`,
      `教练提示：${lens.coachCue}`,
      caseContext ? `案件来源：${caseContext.code} · ${caseOrigin(caseContext)} · ${caseContext.challengeTitle}` : null,
      `反问：${reviewQuestion}`,
      `反证提醒：${counterRead}`,
    ].filter(Boolean).join("\n"),
  };
}
