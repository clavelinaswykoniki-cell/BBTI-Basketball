import { getBbtiArenaEvents, type BbtiArenaEvent } from "./bbti-arena-events";
import {
  BBTI_CHALLENGE_CASE_VERSION,
  buildBbtiArenaEventChallengeCaseContext,
  buildBbtiChallengeCaseContext,
  buildBbtiResultChallengeCaseContext,
  type BbtiChallengeCaseSourceVersion,
  type BbtiChallengeCaseVersion,
  type BbtiChallengeCaseContext,
} from "./bbti-challenge-case";
import { getBbtiChallengeMatchups, type BbtiChallengeMatchup } from "./bbti-challenges";
import { getBbtiType } from "./bbti";
import { getBbtiFilmRoomCrossExam } from "./bbti-film-room-cross-exams";
import {
  buildSharedFilmRoomClipFromKey,
  getBbtiFilmRoomDimensionLabel,
} from "./bbti-playbook";
import {
  resolveBbtiChallengeReplaySeeds,
  type BbtiChallengeReplaySeeds,
} from "./bbti-challenge-replay-seeds";

export const BBTI_SHARED_CHALLENGE_CASE_VERSION = BBTI_CHALLENGE_CASE_VERSION;

export type BbtiSharedChallengeCaseVersion = BbtiChallengeCaseVersion;
export type BbtiSharedChallengeCaseSourceVersion = BbtiChallengeCaseSourceVersion;
export type BbtiSharedChallengeCaseRegistryKey =
  | `film-room:${string}:${string}:${string}`
  | `arena-event:${string}:${string}:${string}`
  | `result:${string}:${string}`;

export interface HydratedBbtiSharedChallenge {
  caseVersion: BbtiSharedChallengeCaseVersion;
  caseSourceVersion: BbtiSharedChallengeCaseSourceVersion | null;
  caseRegistryKey: BbtiSharedChallengeCaseRegistryKey | null;
  challenge: BbtiChallengeMatchup | null;
  event: BbtiArenaEvent | null;
  caseContext: BbtiChallengeCaseContext | null;
  challengeReplaySeeds: BbtiChallengeReplaySeeds | null;
  sourceLabel: "录像室案由" | "情境加赛" | "赛后约战";
  pressureLine: string | null;
}

interface HydrateBbtiSharedChallengeInput {
  code: string;
  challengeMatchupId: string;
  eventId?: string | null;
  clipKey?: string | null;
}

function filmRoomCaseRegistryKey(
  code: string,
  challengeMatchupId: string,
  clipKey: string,
): BbtiSharedChallengeCaseRegistryKey {
  return `film-room:${code}:${challengeMatchupId}:${clipKey}`;
}

function arenaEventCaseRegistryKey(
  code: string,
  eventId: string,
  challengeMatchupId: string,
): BbtiSharedChallengeCaseRegistryKey {
  return `arena-event:${code}:${eventId}:${challengeMatchupId}`;
}

function resultCaseRegistryKey(
  code: string,
  challengeMatchupId: string,
): BbtiSharedChallengeCaseRegistryKey {
  return `result:${code}:${challengeMatchupId}`;
}

export function hydrateBbtiSharedChallenge({
  code,
  challengeMatchupId,
  eventId,
  clipKey,
}: HydrateBbtiSharedChallengeInput): HydratedBbtiSharedChallenge {
  const challenge = getBbtiChallengeMatchups(code).find(
    (item) => item.matchupId === challengeMatchupId,
  ) ?? null;
  const event = eventId
    ? getBbtiArenaEvents(code).find((item) => item.id === eventId) ?? null
    : null;

  if (!challenge) {
    return {
      caseVersion: BBTI_SHARED_CHALLENGE_CASE_VERSION,
      caseSourceVersion: null,
      caseRegistryKey: null,
      challenge: null,
      event,
      caseContext: null,
      challengeReplaySeeds: null,
      sourceLabel: "赛后约战",
      pressureLine: null,
    };
  }

  const type = getBbtiType(code);
  const filmRoomClip = clipKey ? buildSharedFilmRoomClipFromKey(clipKey) : null;
  if (filmRoomClip) {
    const caseContext = buildBbtiChallengeCaseContext({
      code,
      emoji: type.emoji,
      typeName: type.name,
      clip: filmRoomClip,
      dimensionLabel: getBbtiFilmRoomDimensionLabel(filmRoomClip.dimension),
      crossExam: getBbtiFilmRoomCrossExam(filmRoomClip),
      challenge,
    });

    return {
      caseVersion: BBTI_SHARED_CHALLENGE_CASE_VERSION,
      caseSourceVersion: caseContext.caseSourceVersion,
      caseRegistryKey: filmRoomCaseRegistryKey(code, challenge.matchupId, filmRoomClip.clipKey),
      challenge,
      event: null,
      caseContext,
      challengeReplaySeeds: resolveBbtiChallengeReplaySeeds({
        caseContext,
        challengeCategory: challenge.category,
        challengeLabel: challenge.label,
        challengeMatchupId: challenge.matchupId,
        challengeTitle: challenge.title,
        code,
        pressureLine: caseContext.crossExamQuestion,
        source: "shared-return",
      }),
      sourceLabel: "录像室案由",
      pressureLine: `录像室追问：${caseContext.crossExamQuestion}`,
    };
  }

  if (event && challenge.category === event.recommendedCategory) {
    const caseContext = buildBbtiArenaEventChallengeCaseContext({
      code,
      emoji: type.emoji,
      typeName: type.name,
      event,
      challenge,
    });

    return {
      caseVersion: BBTI_SHARED_CHALLENGE_CASE_VERSION,
      caseSourceVersion: caseContext.caseSourceVersion,
      caseRegistryKey: arenaEventCaseRegistryKey(code, event.id, challenge.matchupId),
      challenge,
      event,
      caseContext,
      challengeReplaySeeds: resolveBbtiChallengeReplaySeeds({
        caseContext,
        challengeCategory: challenge.category,
        challengeLabel: challenge.label,
        challengeMatchupId: challenge.matchupId,
        challengeTitle: challenge.title,
        code,
        pressureLine: caseContext.eventPressureTest,
        source: "shared-return",
      }),
      sourceLabel: "情境加赛",
      pressureLine: `压力测试：${caseContext.eventPressureTest}`,
    };
  }

  const caseContext = buildBbtiResultChallengeCaseContext({
    code,
    emoji: type.emoji,
    typeName: type.name,
    challenge,
  });

  return {
    caseVersion: BBTI_SHARED_CHALLENGE_CASE_VERSION,
    caseSourceVersion: caseContext.caseSourceVersion,
    caseRegistryKey: resultCaseRegistryKey(code, challenge.matchupId),
    challenge,
    event,
    caseContext,
    challengeReplaySeeds: resolveBbtiChallengeReplaySeeds({
      caseContext,
      challengeCategory: challenge.category,
      challengeLabel: challenge.label,
      challengeMatchupId: challenge.matchupId,
      challengeTitle: challenge.title,
      code,
      pressureLine: caseContext.caseQuestion,
      source: "shared-return",
    }),
    sourceLabel: "赛后约战",
    pressureLine: `压力题：${caseContext.caseQuestion}`,
  };
}
