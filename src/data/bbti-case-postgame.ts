import {
  buildBbtiChallengeCaseCopy,
  type BbtiChallengeCaseContext,
} from "./bbti-challenge-case";

export const BBTI_CASE_POSTGAME_VERSION = "bbti-case-postgame-v1" as const;
export const BBTI_CASE_POSTGAME_REPLAY_INDEX_VERSION = "bbti-case-postgame-replay-index-v1" as const;
export const BBTI_CASE_POSTGAME_SESSION_BOUNDARY = "仅记录本次会话复盘，不代表真实胜率或外部排名。" as const;

export interface BbtiCasePostgameSourceMeta {
  badge: string;
  title: string;
  origin: string;
  bodyLabel: string;
  body: string;
}

export interface ResolveBbtiCasePostgameRecapInput {
  context: BbtiChallengeCaseContext;
  playerAName: string;
  playerBName: string;
  kobeScore: number;
  lebronScore: number;
  selectedSideName?: string;
  winnerName: string;
  replayUrl: string;
  caseReturnUrl: string;
}

export interface BbtiCasePostgameRecap {
  postgameVersion: typeof BBTI_CASE_POSTGAME_VERSION;
  source: BbtiChallengeCaseContext["source"];
  caseVersion: BbtiChallengeCaseContext["caseVersion"];
  caseSourceVersion: BbtiChallengeCaseContext["caseSourceVersion"];
  code: string;
  challengeMatchupId: string;
  scoreLine: string;
  scoreQa: string;
  selectedSideName: string;
  winnerName: string;
  identity: string;
  sourceMeta: BbtiCasePostgameSourceMeta;
  caseReason: string;
  caseReturnUrl: string;
  compactCaseReturnUrl: string;
  replayUrl: string;
  evidenceLens: string[];
  sessionBoundary: typeof BBTI_CASE_POSTGAME_SESSION_BOUNDARY;
  copyText: string;
  replayIndex: BbtiCaseReplayIndex;
}

export type BbtiCaseReplayIndexItemId = "coach-challenge" | "case-source" | "session-verdict" | "return-link";
export type BbtiCaseReplayIndexTarget = "replay" | "case-source" | "verdict" | "bbti-result";

export interface BbtiCaseReplayIndexItem {
  id: BbtiCaseReplayIndexItemId;
  target: BbtiCaseReplayIndexTarget;
  label: string;
  title: string;
  body: string;
  href?: string;
  compactHref?: string;
}

export interface BbtiCaseReplayIndex {
  version: typeof BBTI_CASE_POSTGAME_REPLAY_INDEX_VERSION;
  code: string;
  source: BbtiChallengeCaseContext["source"];
  caseVersion: BbtiChallengeCaseContext["caseVersion"];
  caseSourceVersion: BbtiChallengeCaseContext["caseSourceVersion"];
  challengeMatchupId: string;
  itemCount: number;
  items: BbtiCaseReplayIndexItem[];
}

export function resolveBbtiCasePostgameSourceMeta(
  context: BbtiChallengeCaseContext,
): BbtiCasePostgameSourceMeta {
  switch (context.source) {
    case "film-room":
      return {
        badge: "Film Room",
        title: "这场胜负来自你的录像室案件",
        origin: `Q${context.questionId} · ${context.dimensionLabel}`,
        bodyLabel: "原始选择",
        body: context.answerText,
      };
    case "result":
      return {
        badge: "Result Case",
        title: "这场胜负来自你的命定对线",
        origin: context.originLabel,
        bodyLabel: "推荐理由",
        body: context.recommendationReason,
      };
    case "arena-event":
      return {
        badge: "Arena Event",
        title: "这场胜负来自你的情境加赛",
        origin: `${context.eventTag} · ${context.originLabel}`,
        bodyLabel: "赛事情境",
        body: context.eventScenario,
      };
  }
}

export function compactBbtiCasePostgameUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

export function buildBbtiCasePostgameCopy(input: ResolveBbtiCasePostgameRecapInput): string {
  const scoreLine = `${input.playerAName} ${input.kobeScore} : ${input.lebronScore} ${input.playerBName}`;

  return [
    buildBbtiChallengeCaseCopy(input.context),
    `赛后比分：${scoreLine}`,
    input.selectedSideName ? `我的站队：${input.selectedSideName}` : null,
    `赛后判定：${input.winnerName}`,
    `同场复盘：${input.replayUrl}`,
    `案件回流：${input.caseReturnUrl}`,
    `边界：${BBTI_CASE_POSTGAME_SESSION_BOUNDARY}`,
  ].filter(Boolean).join("\n");
}

export function resolveBbtiCaseReplayIndex(
  input: ResolveBbtiCasePostgameRecapInput,
): BbtiCaseReplayIndex {
  const { context } = input;
  const sourceMeta = resolveBbtiCasePostgameSourceMeta(context);
  const scoreLine = `${input.playerAName} ${input.kobeScore} : ${input.lebronScore} ${input.playerBName}`;
  const selectedSideLine = input.selectedSideName
    ? `你的站队是 ${input.selectedSideName}。`
    : "这场没有记录站队。";
  const items: BbtiCaseReplayIndexItem[] = [
    {
      id: "coach-challenge",
      target: "replay",
      label: "Coach Challenge",
      title: "先回看本场同场复盘",
      body: "普通复盘链接只回到本场对线和投票结果，不携带案件正文。",
      href: input.replayUrl,
      compactHref: compactBbtiCasePostgameUrl(input.replayUrl),
    },
    {
      id: "case-source",
      target: "case-source",
      label: "案件来源",
      title: "确认这场从哪里开战",
      body: `${sourceMeta.badge} · ${sourceMeta.origin}。${context.pressureQuestion ?? context.challengeTitle}`,
    },
    {
      id: "session-verdict",
      target: "verdict",
      label: "本场判定",
      title: "只记录这一次会话结果",
      body: `${scoreLine}，赛后判定：${input.winnerName}。${selectedSideLine}`,
    },
    {
      id: "return-link",
      target: "bbti-result",
      label: "案由回流",
      title: "回到 BBTI 案件来源",
      body: BBTI_CASE_POSTGAME_SESSION_BOUNDARY,
      href: input.caseReturnUrl,
      compactHref: compactBbtiCasePostgameUrl(input.caseReturnUrl),
    },
  ];

  return {
    version: BBTI_CASE_POSTGAME_REPLAY_INDEX_VERSION,
    code: context.code,
    source: context.source,
    caseVersion: context.caseVersion,
    caseSourceVersion: context.caseSourceVersion,
    challengeMatchupId: context.challengeMatchupId,
    itemCount: items.length,
    items,
  };
}

export function resolveBbtiCasePostgameRecap(
  input: ResolveBbtiCasePostgameRecapInput,
): BbtiCasePostgameRecap {
  const { context } = input;
  const sourceMeta = resolveBbtiCasePostgameSourceMeta(context);
  const identity = context.typeName
    ? `${context.emoji ? `${context.emoji} ` : ""}${context.typeName}（${context.code}）`
    : context.code;

  return {
    postgameVersion: BBTI_CASE_POSTGAME_VERSION,
    source: context.source,
    caseVersion: context.caseVersion,
    caseSourceVersion: context.caseSourceVersion,
    code: context.code,
    challengeMatchupId: context.challengeMatchupId,
    scoreLine: `${input.playerAName} ${input.kobeScore} : ${input.lebronScore} ${input.playerBName}`,
    scoreQa: `${input.kobeScore}-${input.lebronScore}`,
    selectedSideName: input.selectedSideName ?? "未记录站队",
    winnerName: input.winnerName,
    identity,
    sourceMeta,
    caseReason: context.pressureQuestion ?? context.challengeTitle,
    caseReturnUrl: input.caseReturnUrl,
    compactCaseReturnUrl: compactBbtiCasePostgameUrl(input.caseReturnUrl),
    replayUrl: input.replayUrl,
    evidenceLens: context.evidenceLens.slice(0, 5),
    sessionBoundary: BBTI_CASE_POSTGAME_SESSION_BOUNDARY,
    copyText: buildBbtiCasePostgameCopy(input),
    replayIndex: resolveBbtiCaseReplayIndex(input),
  };
}
