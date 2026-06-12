#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const errors = [];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function addError(message) {
  errors.push(message);
}

function assertIncludes(label, source, expected) {
  if (!source.includes(expected)) {
    addError(`${label}: missing ${JSON.stringify(expected)}`);
  }
}

function assertNotIncludes(label, source, forbidden) {
  if (source.includes(forbidden)) {
    addError(`${label}: must not include ${JSON.stringify(forbidden)}`);
  }
}

const deepLinkNotice = read("src/components/BbtiDeepLinkNotice.tsx");
const caseTrail = read("src/components/BbtiChallengeCaseTrail.tsx");
const casePostgame = read("src/components/BbtiCasePostgame.tsx");
const replayCenter = read("src/components/ReplayCenter.tsx");
const caseBattleMobileStack = read("src/components/BbtiCaseBattleMobileStack.tsx");
const courtSideAdvisor = read("src/components/CourtSideAdvisor.tsx");
const battleReplayLens = read("src/components/BbtiBattleReplayLens.tsx");
const bbtiResult = read("src/components/BbtiResult.tsx");
const myTeamResultCard = read("src/components/MyTeamResultCard.tsx");
const actionDock = read("src/components/BbtiResultActionDock.tsx");
const resultTabs = read("src/components/BbtiResultTabs.tsx");
const nextPlayPanel = read("src/components/BbtiNextPlayPanel.tsx");
const addFilesPanel = read("src/components/BbtiAddFilesSuggestionPanel.tsx");
const compare = read("src/components/BbtiCompare.tsx");
const answerPollTrend = read("src/components/BbtiAnswerPollTrend.tsx");
const entry = read("src/components/BbtiEntry.tsx");
const featuredDailyReturn = read("src/components/BbtiFeaturedDailyReturn.tsx");
const dailyReturnRemix = read("src/components/BbtiDailyReturnRemix.tsx");
const returnBench = read("src/components/BbtiReturnBench.tsx");
const arenaEvents = read("src/components/BbtiArenaEvents.tsx");
const lineupChemistry = read("src/components/BbtiLineupChemistry.tsx");
const filmRoomClips = read("src/components/BbtiFilmRoomClips.tsx");
const filmRoomRemixBench = read("src/components/BbtiFilmRoomRemixBench.tsx");
const filmRoomDrillCard = read("src/components/BbtiFilmRoomDrillCard.tsx");
const challengeReceiptBoard = read("src/components/BbtiChallengeReceiptBoard.tsx");
const challengeReplaySeeds = read("src/components/BbtiChallengeReplaySeeds.tsx");
const challengePickReplayKit = read("src/components/BbtiChallengePickReplayKit.tsx");
const shareCard = read("src/components/BbtiShareCard.tsx");
const shareKits = read("src/components/BbtiShareKits.tsx");
const shareTargetPicker = read("src/components/BbtiShareTargetPicker.tsx");
const shareKitsData = read("src/data/bbti-share-kits.ts");
const shareReturnPrompts = read("src/data/bbti-share-return-prompts.ts");
const shareCardPresets = read("src/data/bbti-share-card-presets.ts");
const playbookData = read("src/data/bbti-playbook.ts");
const nextPlayData = read("src/data/bbti-next-play.ts");
const addFilesData = read("src/data/bbti-add-files-suggestions.ts");
const battleReplayLensData = read("src/data/bbti-battle-replay-lens.ts");
const challengeData = read("src/data/bbti-challenges.ts");
const challengeReplaySeedsData = read("src/data/bbti-challenge-replay-seeds.ts");
const casePostgameData = read("src/data/bbti-case-postgame.ts");
const compareData = read("src/data/bbti-rivalries.ts");
const answerPollData = read("src/data/bbti-answer-polls.ts");
const answerPollPresets = read("src/data/bbti-answer-poll-presets.ts");
const dailyReturnData = read("src/data/bbti-daily-return.ts");
const arenaEventsData = read("src/data/bbti-arena-events.ts");
const lineupChemistryData = read("src/data/bbti-lineup-chemistry.ts");
const filmRoomRemixBenchData = read("src/data/bbti-film-room-remix-bench.ts");
const filmRoomDrillData = read("src/data/bbti-film-room-drills.ts");
const challengeEvidenceData = read("src/data/bbti-challenge-evidence.ts");

[
  'data-testid="bbti-deep-link-notice"',
  'data-bbti-notice-state="expanded"',
  'data-bbti-notice-state="collapsed"',
  "data-bbti-source={qaSource}",
  "data-bbti-source-version={qaSourceVersion}",
  'data-bbti-clip-fallback={notice.clipFallbackLine ? "true" : "false"}',
  'data-testid="bbti-deep-link-preview"',
  'data-bbti-preview-label={prompt.previewLabel}',
  'data-testid="bbti-deep-link-cta"',
  'data-testid="bbti-deep-link-dismiss"',
  'data-testid="bbti-deep-link-restore"',
  "BbtiDeepLinkNoticeCard",
  "notice.replaySeeds",
  "bbti.dismissedDeepLinkNotices.v4",
  "clipDismissKeyPart",
  "clipFallbackLineFor",
  "缺少具体选择",
  "无法识别",
].forEach((expected) => assertIncludes("BbtiDeepLinkNotice QA contract", deepLinkNotice, expected));

[
  "BbtiChallengeReplaySeeds",
].forEach((expected) => assertIncludes("BbtiDeepLinkNotice replay seed mount", deepLinkNotice, expected));

[
  'data-testid="bbti-case-trail"',
  "data-bbti-case-source={context.source}",
  "data-bbti-case-source-version={trail.caseSourceVersion}",
  "data-bbti-case-version={trail.caseVersion}",
  "data-bbti-case-progress={trail.progressLabel}",
  'data-testid="bbti-case-trail-copy"',
  'data-testid="bbti-case-trail-step"',
  "data-bbti-step-state={step.state}",
  "data-bbti-step-topic={step.topicId}",
].forEach((expected) => assertIncludes("BbtiChallengeCaseTrail QA contract", caseTrail, expected));

[
  'data-testid="bbti-case-postgame"',
  "data-bbti-case-postgame-version={recap.postgameVersion}",
  "data-bbti-case-postgame-source={recap.source}",
  "data-bbti-case-postgame-source-version={recap.caseSourceVersion}",
  "data-bbti-case-postgame-case-version={recap.caseVersion}",
  "data-bbti-case-postgame-code={recap.code}",
  "data-bbti-case-postgame-matchup-id={recap.challengeMatchupId}",
  "data-bbti-case-postgame-score={recap.scoreQa}",
  'data-bbti-case-postgame-selected-side={selectedSideName ?? "none"}',
  "data-bbti-case-postgame-winner={recap.winnerName}",
  'data-testid="bbti-case-postgame-source"',
  "data-bbti-case-postgame-source-label={recap.sourceMeta.badge}",
  'data-testid="bbti-case-postgame-title"',
  'data-testid="bbti-case-postgame-origin"',
  'data-testid="bbti-case-postgame-score"',
  'data-testid="bbti-case-postgame-source-body"',
  'data-testid="bbti-case-postgame-session-card"',
  'data-bbti-case-postgame-session="selected-side"',
  'data-bbti-case-postgame-session="winner"',
  'data-testid="bbti-case-postgame-case-reason"',
  'data-testid="bbti-case-postgame-return"',
  'data-testid="bbti-case-postgame-return-url"',
  "data-bbti-case-postgame-return-url={recap.caseReturnUrl}",
  'data-testid="bbti-case-postgame-lens"',
  "data-bbti-case-postgame-lens={lens}",
  "data-bbti-case-postgame-lens-position={index + 1}",
  'data-testid="bbti-case-postgame-boundary"',
  'data-testid="bbti-case-postgame-action"',
  'data-bbti-case-postgame-action="copy-recap"',
  'data-bbti-case-postgame-action="open-bbti-result"',
  'data-testid="bbti-case-postgame-replay-index"',
  "data-bbti-case-postgame-replay-index-version={recap.replayIndex.version}",
  "data-bbti-case-postgame-replay-index-source={recap.replayIndex.source}",
  "data-bbti-case-postgame-replay-index-source-version={recap.replayIndex.caseSourceVersion}",
  "data-bbti-case-postgame-replay-index-case-version={recap.replayIndex.caseVersion}",
  "data-bbti-case-postgame-replay-index-code={recap.replayIndex.code}",
  "data-bbti-case-postgame-replay-index-matchup-id={recap.replayIndex.challengeMatchupId}",
  "data-bbti-case-postgame-replay-index-count={recap.replayIndex.itemCount}",
  'data-testid="bbti-case-postgame-replay-row"',
  "data-bbti-case-postgame-replay-row={item.id}",
  "data-bbti-case-postgame-replay-target={item.target}",
  "data-bbti-case-postgame-replay-position={index + 1}",
].forEach((expected) => assertIncludes("BbtiCasePostgame QA contract", casePostgame, expected));

[
  'BBTI_CASE_POSTGAME_VERSION = "bbti-case-postgame-v1"',
  'BBTI_CASE_POSTGAME_REPLAY_INDEX_VERSION = "bbti-case-postgame-replay-index-v1"',
  "BBTI_CASE_POSTGAME_SESSION_BOUNDARY",
  "resolveBbtiCaseReplayIndex",
  '"coach-challenge"',
  '"case-source"',
  '"session-verdict"',
  '"return-link"',
  "resolveBbtiCasePostgameSourceMeta",
  "compactBbtiCasePostgameUrl",
  "buildBbtiCasePostgameCopy",
  "resolveBbtiCasePostgameRecap",
  "不代表真实胜率或外部排名",
].forEach((expected) => assertIncludes("BBTI Case Postgame data contract", casePostgameData, expected));

[
  'BBTI_REPLAY_CENTER_VERSION = "bbti-replay-center-v1"',
  'data-testid="bbti-replay-center"',
  "data-bbti-replay-center-version={BBTI_REPLAY_CENTER_VERSION}",
  "data-bbti-replay-center-matchup-id={matchupId}",
  "data-bbti-replay-center-topic-id={topicId}",
  "data-bbti-replay-center-round={roundNumber}",
  "data-bbti-replay-center-side={bomb.side}",
  "data-bbti-replay-center-source={bomb.source}",
  'data-testid="bbti-replay-center-source"',
].forEach((expected) => assertIncludes("ReplayCenter QA contract", replayCenter, expected));

[
  'BBTI_CASE_BATTLE_MOBILE_STACK_VERSION = "bbti-case-battle-mobile-polish-v1"',
  'data-testid="bbti-case-battle-mobile-stack"',
  "data-bbti-case-battle-mobile-version={BBTI_CASE_BATTLE_MOBILE_STACK_VERSION}",
  'data-bbti-case-battle-mobile-source={caseContext?.source ?? "none"}',
  "data-bbti-case-battle-mobile-round={roundNumber}",
  "data-bbti-case-battle-mobile-side={votedFor}",
  "data-bbti-case-battle-mobile-auto-advance={autoAdvanceState}",
  "data-bbti-case-battle-mobile-step-count={BBTI_CASE_BATTLE_MOBILE_STEPS.length}",
  'data-testid="bbti-case-battle-mobile-rhythm"',
  'data-testid="bbti-case-battle-mobile-step"',
  "data-bbti-case-battle-mobile-step={step.id}",
  "data-bbti-case-battle-mobile-target={step.target}",
  "data-bbti-case-battle-mobile-position={index + 1}",
  'data-testid="bbti-case-battle-mobile-controls"',
  'data-testid="bbti-case-battle-mobile-action"',
  'data-bbti-case-battle-mobile-action="next"',
  'data-bbti-case-battle-mobile-action="extend"',
  'data-bbti-case-battle-mobile-action="pause"',
  'data-testid="bbti-case-battle-mobile-countdown"',
].forEach((expected) => assertIncludes("BbtiCaseBattleMobileStack QA contract", caseBattleMobileStack, expected));

[
  'data-testid="bbti-courtside-advisor"',
  'data-bbti-courtside-advisor-case-source={caseContext?.source ?? "none"}',
  "data-bbti-courtside-advisor-side={votedFor}",
].forEach((expected) => assertIncludes("CourtSideAdvisor QA contract", courtSideAdvisor, expected));

[
  'data-testid="bbti-battle-replay-lens"',
  "data-bbti-battle-replay-lens-version={lens.version}",
  "data-bbti-battle-replay-lens-matchup-id={lens.matchupId}",
  "data-bbti-battle-replay-lens-topic-id={lens.topicId}",
  "data-bbti-battle-replay-lens-next-topic-id={lens.nextTopicId}",
  "data-bbti-battle-replay-lens-round={lens.roundNumber}",
  "data-bbti-battle-replay-lens-side={lens.votedSide}",
  "data-bbti-battle-replay-lens-case-source={lens.caseSource}",
  "data-bbti-battle-replay-lens-replay-source={lens.replaySource}",
  "data-bbti-battle-replay-lens-count={lens.stepCount}",
  'data-testid="bbti-battle-replay-lens-step"',
  "data-bbti-battle-replay-lens-step={step.id}",
  "data-bbti-battle-replay-lens-target={step.target}",
  "data-bbti-battle-replay-lens-position={index + 1}",
  'data-testid="bbti-battle-replay-lens-copy"',
  'data-bbti-battle-replay-lens-action="copy-lens"',
  'data-testid="bbti-battle-replay-copy-kit"',
  "data-bbti-battle-replay-copy-kit-version={copyKit.version}",
  "data-bbti-battle-replay-copy-kit-source-version={copyKit.sourceLensVersion}",
  "data-bbti-battle-replay-copy-kit-matchup-id={copyKit.matchupId}",
  "data-bbti-battle-replay-copy-kit-topic-id={copyKit.topicId}",
  "data-bbti-battle-replay-copy-kit-round={copyKit.roundNumber}",
  "data-bbti-battle-replay-copy-kit-count={copyKit.itemCount}",
  'data-testid="bbti-battle-replay-copy-kit-item"',
  "data-bbti-battle-replay-copy-kit-item={item.id}",
  "data-bbti-battle-replay-copy-kit-position={index + 1}",
  'data-bbti-battle-replay-copy-kit-action="copy"',
  'data-testid="bbti-battle-replay-copy-kit-boundary"',
  'data-testid="bbti-battle-replay-lens-boundary"',
  "BbtiChallengeReplaySeeds",
  'source: "battle-replay"',
].forEach((expected) => assertIncludes("BbtiBattleReplayLens QA contract", battleReplayLens, expected));

[
  'BBTI_BATTLE_REPLAY_LENS_VERSION = "bbti-battle-replay-lens-v1"',
  "BBTI_BATTLE_REPLAY_LENS_BOUNDARY",
  'BBTI_BATTLE_REPLAY_COPY_KIT_VERSION = "bbti-battle-replay-copy-kit-v1"',
  "BBTI_BATTLE_REPLAY_COPY_KIT_BOUNDARY",
  "resolveBbtiBattleReplayLens",
  "resolveBbtiBattleReplayCopyKit",
  '"current-claim"',
  '"counter-replay"',
  '"coach-cue"',
  '"next-pressure"',
  '"group-recap"',
  '"counter-punch"',
  '"next-question"',
  "本地单回合战术镜头，只是本场阅读，不代表外部结论或用户热度。",
  "本地复盘话术包，只复用本场镜头，不代表真实赢面、外部排名或用户热度。",
].forEach((expected) => assertIncludes("BBTI Battle Replay Lens data contract", battleReplayLensData, expected));

[
  'data-testid="bbti-result-action-dock"',
  "data-bbti-action-dock-active-section={activeSectionId}",
  'data-bbti-action-dock-compare-mode={compareLabel === "生成对比" ? "pending" : "default"}',
  'data-bbti-action-dock-primary-mode={primaryChallengeTitle ? "matchup" : "default"}',
  'data-bbti-action-dock-sticky="true"',
  'data-testid="bbti-action-dock-primary-challenge"',
  'data-bbti-action-dock-action="primary-challenge"',
  'data-testid="bbti-action-dock-custom-challenge"',
  'data-bbti-action-dock-action="custom-challenge"',
  'data-testid="bbti-action-dock-compare"',
  'data-bbti-action-dock-action="compare"',
  'data-testid="bbti-action-dock-share"',
  'data-bbti-action-dock-action="share"',
  'data-bbti-scroll-target="bbti-share"',
  "--bbti-action-dock-offset",
  "ResizeObserver",
  "sticky top-3 z-40",
].forEach((expected) => assertIncludes("BbtiResultActionDock QA contract", actionDock, expected));

[
  'data-testid="bbti-result-program-nav"',
  'data-testid="bbti-result-program-tab"',
  "data-bbti-action-dock-program={program.id}",
  "data-bbti-scroll-target={program.anchorId}",
  'data-testid="bbti-result-section-nav"',
  'data-testid="bbti-result-section-chip"',
  "data-bbti-action-dock-section={section.id}",
  "data-bbti-scroll-target={section.id}",
].forEach((expected) => assertIncludes("BbtiResultTabs QA contract", resultTabs, expected));

[
  'data-testid="bbti-next-play-panel"',
  "data-next-play-count={actions.length}",
  "data-next-play-id={action.id}",
  "data-next-play-qa={action.qaKey}",
  'data-next-play-mobile-layout={isPrimary ? "primary" : "compact"}',
  "data-next-play-position={index + 1}",
  'sm:min-h-[176px]',
  'hidden sm:block',
].forEach((expected) => assertIncludes("BbtiNextPlayPanel QA contract", nextPlayPanel, expected));

[
  'data-testid="bbti-add-files-suggestion-panel"',
  "data-bbti-add-files-version={BBTI_ADD_FILES_CONTRACT_VERSION}",
  "data-bbti-add-files-count={suggestions.length}",
  "data-bbti-add-files-code={code}",
  'data-bbti-add-files-next-count={suggestions.filter((suggestion) => suggestion.stage === "next").length}',
  'data-testid="bbti-add-files-suggestion-card"',
  "data-bbti-add-files-id={suggestion.id}",
  "data-bbti-add-files-qa={suggestion.qaKey}",
  "data-bbti-add-files-position={index + 1}",
  "data-bbti-add-files-stage={suggestion.stage}",
  "data-bbti-add-files-target={suggestion.targetSectionId}",
  "data-bbti-add-files-files={targetFilesForQa(suggestion)}",
  'data-testid="bbti-add-files-suggestion-stage"',
  "data-bbti-add-files-stage-label={suggestion.stage}",
  'data-testid="bbti-add-files-suggestion-cta"',
  "data-bbti-scroll-target={suggestion.targetSectionId}",
  'data-testid="bbti-add-files-copy"',
  "data-bbti-add-files-copy-id={suggestion.id}",
].forEach((expected) => assertIncludes("BbtiAddFilesSuggestionPanel QA contract", addFilesPanel, expected));

[
  'BBTI_ADD_FILES_CONTRACT_VERSION = "bbti-add-files-v1"',
  "BBTI_SHIPPED_ADD_FILES_IDS",
  "resolveBbtiAddFilesSuggestions",
  "buildBbtiAddFilesSuggestionCopy",
  "stage",
  "targetFiles",
  "validators",
].forEach((expected) => assertIncludes("BBTI Add Files suggestion data contract", addFilesData, expected));

[
  'data-testid="bbti-compare-shell"',
  "data-bbti-compare-state={compareState}",
  "data-bbti-compare-code-a={validA ? normalizedA : \"\"}",
  "data-bbti-compare-code-b={validB ? normalizedB : \"\"}",
  'data-testid="bbti-compare-code-input"',
  "data-bbti-compare-slot={item.field}",
  'data-testid="bbti-compare-code-chip"',
  "data-bbti-compare-code-chip={code}",
  "data-bbti-compare-target-slot={activeSlot}",
  'data-testid="bbti-compare-report"',
  "data-bbti-compare-report-version={report.version}",
  "data-bbti-compare-report-code-a={report.codeA}",
  "data-bbti-compare-report-code-b={report.codeB}",
  "data-bbti-compare-report-score={report.score}",
  'data-testid="bbti-compare-report-program"',
  "data-bbti-compare-program-count={report.program.length}",
  'data-testid="bbti-compare-program-row"',
  "data-bbti-compare-program={segment.id}",
  "data-bbti-compare-program-qa={segment.qaKey}",
  "data-bbti-compare-program-position={index + 1}",
  'data-testid="bbti-compare-rematch-plan"',
  "data-bbti-compare-rematch-version={report.version}",
  'data-testid="bbti-duo-rematch-prompts"',
  "data-bbti-duo-rematch-version={report.rematchPromptsVersion}",
  "data-bbti-duo-rematch-code-a={report.codeA}",
  "data-bbti-duo-rematch-code-b={report.codeB}",
  "data-bbti-duo-rematch-anchor-axis={report.rematchPrompts[0]?.axisKey ?? \"mirror\"}",
  "data-bbti-duo-rematch-count={report.rematchPrompts.length}",
  'data-testid="bbti-duo-rematch-prompt"',
  "data-bbti-duo-rematch-prompt={prompt.id}",
  "data-bbti-duo-rematch-prompt-axis={prompt.axisKey}",
  "data-bbti-duo-rematch-prompt-qa={prompt.qaKey}",
  "data-bbti-duo-rematch-position={index + 1}",
  'data-testid="bbti-duo-rematch-prompts-action"',
  'data-bbti-duo-rematch-action="copy-prompts"',
  'data-testid="bbti-duo-rematch-boundary"',
  'data-testid="bbti-compare-replay-card"',
  "data-bbti-compare-replay={item.id}",
  'data-testid="bbti-compare-axis"',
  "data-bbti-compare-axis={axis.key}",
  "data-bbti-compare-axis-state={shared ? \"shared\" : \"clash\"}",
  'data-testid="bbti-compare-action"',
  'data-bbti-compare-action="copy-report"',
].forEach((expected) => assertIncludes("BbtiCompare QA contract", compare, expected));

[
  'BBTI_COMPARE_REPORT_VERSION = "bbti-compare-report-v1"',
  "buildBbtiCompareReportCopy",
  "buildBbtiDuoRematchPromptCopy",
  "program",
  "rematchPlan",
  "rematchPrompts",
  "BBTI_DUO_REMATCH_PROMPTS_VERSION",
  "BBTI_DUO_REMATCH_PROMPTS_BOUNDARY",
  '"opening-read"',
  '"swing-point"',
  '"closing-challenge"',
  '"standard-lock"',
  '"receipt-swap"',
  '"last-shot"',
].forEach((expected) => assertIncludes("BBTI Compare data contract", compareData, expected));

[
  'data-testid="bbti-answer-poll-trend"',
  "data-bbti-answer-poll-trend-version={summary.version}",
  'data-bbti-answer-poll-trend-source="local-simulation"',
  "data-bbti-answer-poll-trend-code={code}",
  "data-bbti-answer-poll-trend-label={summary.label}",
  "data-bbti-answer-poll-trend-average={summary.average}",
  "data-bbti-answer-poll-trend-read-count={summary.readCount}",
  'data-testid="bbti-answer-poll-trend-copy"',
  'data-bbti-answer-poll-trend-action="copy"',
  'data-testid="bbti-answer-poll-trend-summary"',
  'data-testid="bbti-answer-poll-trend-stat"',
  "data-bbti-answer-poll-trend-stat={item.id}",
  'data-testid="bbti-answer-poll-trend-round"',
  "data-bbti-answer-poll-trend-round={item.id}",
  "data-bbti-answer-poll-trend-question={item.read.questionId}",
  "data-bbti-answer-poll-trend-percent={item.read.poll.selectedPercent}",
  'data-testid="bbti-answer-poll-trend-seats"',
  "data-bbti-answer-poll-trend-seat-count={summary.seats.length}",
  'data-testid="bbti-answer-poll-trend-seat"',
  "data-bbti-answer-poll-trend-seat-position={index + 1}",
].forEach((expected) => assertIncludes("BbtiAnswerPollTrend QA contract", answerPollTrend, expected));

[
  'BBTI_ANSWER_POLL_TREND_VERSION = "bbti-answer-poll-trend-v1"',
  "buildBbtiAnswerPollTrendReads",
  "resolveBbtiAnswerPollTrendSummary",
  "buildBbtiAnswerPollTrendCopy",
  "local-simulation",
].forEach((expected) => assertIncludes("BBTI Answer Poll Trend contract", answerPollTrend, expected));

[
  'source: "local-simulation"',
  "selectedPercent",
  "dissentPercent",
  "本地模拟，不代表真实用户投票。",
].forEach((expected) => assertIncludes("BBTI Answer Poll data contract", answerPollData, expected));

[
  'data-testid="bbti-entry-return-stack"',
  'data-bbti-entry-return-stack="last-result"',
  "data-bbti-entry-return-code={lastResult.code}",
].forEach((expected) => assertIncludes("BbtiEntry return stack QA contract", entry, expected));

[
  'data-testid="bbti-featured-daily-return"',
  "data-bbti-return-streak-version={returnStreak.version}",
  "data-bbti-return-streak-code={returnStreak.code}",
  "data-bbti-return-streak-date={returnStreak.dateKey}",
  'data-bbti-return-streak-event={returnStreak.eventId ?? "none"}',
  'data-bbti-return-streak-featured={returnStreak.featuredChallengeId ?? "none"}',
  'data-bbti-return-streak-case-source={returnStreak.caseContextSource ?? "none"}',
  'data-testid="bbti-return-streak-rail"',
  "data-bbti-return-streak-step-count={returnStreak.steps.length}",
  'data-testid="bbti-return-streak-step"',
  "data-bbti-return-streak-step={step.id}",
  "data-bbti-return-streak-target={step.target}",
  "data-bbti-return-streak-position={index + 1}",
  'data-testid="bbti-return-streak-boundary"',
  'data-testid="bbti-featured-daily-return-action"',
  'data-bbti-featured-daily-return-action="open-daily-event"',
  'data-bbti-featured-daily-return-action="open-featured-challenge"',
  'data-bbti-featured-daily-return-action="copy-daily-prompt"',
].forEach((expected) => assertIncludes("BbtiFeaturedDailyReturn QA contract", featuredDailyReturn, expected));

[
  'data-testid="bbti-daily-return-remix"',
  "data-bbti-daily-return-remix-version={remix.version}",
  "data-bbti-daily-return-remix-code={remix.code}",
  "data-bbti-daily-return-remix-date={remix.dateKey}",
  'data-bbti-daily-return-remix-event={remix.eventId ?? "none"}',
  'data-bbti-daily-return-remix-featured={remix.featuredChallengeId ?? "none"}',
  "data-bbti-daily-return-remix-clip={remix.filmRoomClipKey}",
  "data-bbti-daily-return-remix-lane={activeLane.id}",
  "data-bbti-daily-return-remix-count={remix.laneCount}",
  'data-testid="bbti-daily-return-remix-tab"',
  "data-bbti-daily-return-remix-tab={lane.id}",
  "data-bbti-daily-return-remix-target={lane.target}",
  "data-bbti-daily-return-remix-position={index + 1}",
  'data-bbti-daily-return-remix-active={active ? "true" : "false"}',
  'data-testid="bbti-daily-return-remix-detail"',
  "data-bbti-daily-return-remix-detail={activeLane.id}",
  'data-testid="bbti-daily-return-remix-action"',
  "data-bbti-daily-return-remix-action={activeLane.id}",
].forEach((expected) => assertIncludes("BbtiDailyReturnRemix QA contract", dailyReturnRemix, expected));

[
  'data-testid="bbti-return-bench"',
  "data-bbti-return-streak-version={returnStreak.version}",
  "data-bbti-return-streak-code={returnStreak.code}",
  "data-bbti-return-streak-date={returnStreak.dateKey}",
  'data-bbti-return-streak-event={returnStreak.eventId ?? "none"}',
  'data-bbti-return-streak-featured={returnStreak.featuredChallengeId ?? "none"}',
  'data-bbti-return-streak-case-source={returnStreak.caseContextSource ?? "none"}',
  'data-testid="bbti-return-streak-summary"',
  "data-bbti-return-streak-step-count={returnStreak.steps.length}",
  'data-testid="bbti-return-streak-step"',
  "data-bbti-return-streak-step={step.id}",
  "data-bbti-return-streak-target={step.target}",
  "data-bbti-return-streak-position={index + 1}",
  'data-testid="bbti-return-bench-action"',
  'data-bbti-return-bench-action="open-last-result"',
  'data-bbti-return-bench-action="copy-compare-invite"',
  'data-bbti-return-bench-action="copy-return-streak"',
  'data-testid="bbti-return-bench-challenge"',
  "data-bbti-return-bench-challenge={challenge.matchupId}",
  'data-bbti-return-bench-featured={isFeaturedChallenge ? "true" : "false"}',
  'data-bbti-return-bench-action="open-challenge-lane"',
].forEach((expected) => assertIncludes("BbtiReturnBench QA contract", returnBench, expected));

[
  'BBTI_RETURN_STREAK_VERSION = "bbti-return-streaks-v1"',
  'BBTI_DAILY_RETURN_REMIX_VERSION = "bbti-daily-return-remix-v1"',
  "BBTI_RETURN_STREAK_BOUNDARY",
  "BBTI_DAILY_RETURN_REMIX_BOUNDARY",
  "getBbtiDailyReturnFilmRoomClipKey",
  "resolveBbtiDailyReturnCaseContext",
  "resolveBbtiDailyReturnRemix",
  "resolveBbtiReturnStreak",
  '"last-report"',
  '"daily-event"',
  '"film-room-return"',
  '"featured-challenge"',
  "本地回访连线，不代表连续登录或真实活跃。",
  "本地每日主场切换，不代表真实赛程、真实回访或用户行为。",
].forEach((expected) => assertIncludes("BBTI Return Streak data contract", dailyReturnData, expected));

[
  'data-testid="bbti-arena-event-card"',
  "data-bbti-arena-event-id={event.id}",
  'data-bbti-arena-event-active={active.id === event.id ? "true" : "false"}',
  'data-bbti-arena-event-today={event.id === todayEventId ? "true" : "false"}',
  'data-testid="bbti-arena-event-bracket"',
  "data-bbti-arena-event-bracket-version={eventBracket.version}",
  "data-bbti-arena-event-bracket-code={eventBracket.code}",
  "data-bbti-arena-event-bracket-event={eventBracket.eventId}",
  "data-bbti-arena-event-bracket-challenge={eventBracket.challengeMatchupId}",
  "data-bbti-arena-event-bracket-category={eventBracket.recommendedCategory}",
  "data-bbti-arena-event-bracket-count={eventBracket.routeCount}",
  'data-testid="bbti-arena-event-bracket-route"',
  "data-bbti-arena-event-bracket-route={route.id}",
  "data-bbti-arena-event-bracket-target={route.target}",
  "data-bbti-arena-event-bracket-position={index + 1}",
  'data-testid="bbti-arena-event-bracket-action"',
  "data-bbti-arena-event-bracket-action={route.id}",
  "data-bbti-arena-event-bracket-action-target={route.target}",
  'data-testid="bbti-arena-event-bracket-boundary"',
].forEach((expected) => assertIncludes("BbtiArenaEvents bracket QA contract", arenaEvents, expected));

[
  'BBTI_ARENA_EVENT_BRACKET_VERSION = "bbti-arena-event-bracket-v1"',
  "BBTI_ARENA_EVENT_BRACKET_BOUNDARY",
  "resolveBbtiArenaEventBracket",
  '"event-tipoff"',
  '"challenge-branch"',
  '"share-return"',
  "本地情境路线树，不代表真实赛程、真实热度或用户行为。",
].forEach((expected) => assertIncludes("BBTI Arena Event bracket data contract", arenaEventsData, expected));

[
  'data-testid="bbti-lineup-chemistry"',
  "data-bbti-lineup-chemistry-version={BBTI_LINEUP_CHEMISTRY_VERSION}",
  "data-bbti-lineup-chemistry-code={code}",
  "data-bbti-lineup-chemistry-card-count={cards.length}",
  'data-testid="bbti-lineup-chemistry-card"',
  "data-bbti-lineup-chemistry-id={card.id}",
  "data-bbti-lineup-chemistry-qa={card.brief.qaKey}",
  "data-bbti-lineup-chemistry-position={index + 1}",
  "data-bbti-lineup-chemistry-target-code={card.report.codeB}",
  "data-bbti-lineup-chemistry-score={card.report.score}",
  'data-testid="bbti-lineup-chemistry-brief"',
  'data-bbti-lineup-chemistry-brief-count="3"',
  'data-testid="bbti-lineup-chemistry-brief-row"',
  "data-bbti-lineup-chemistry-brief={item.id}",
  "data-bbti-lineup-chemistry-brief-position={itemIndex + 1}",
  'data-testid="bbti-lineup-chemistry-copy"',
  'data-bbti-lineup-chemistry-action="copy-invite"',
  'data-testid="bbti-lineup-chemistry-open"',
  'data-bbti-lineup-chemistry-action="open-compare"',
].forEach((expected) => assertIncludes("BbtiLineupChemistry QA contract", lineupChemistry, expected));

[
  "BbtiFilmRoomRemixBench",
  "trendSummary",
].forEach((expected) => assertIncludes("BbtiFilmRoomClips remix bench mount", filmRoomClips, expected));

[
  'data-testid="bbti-film-room-remix-bench"',
  "data-bbti-film-room-remix-version={bench.version}",
  "data-bbti-film-room-remix-source={bench.source}",
  "data-bbti-film-room-remix-code={bench.code}",
  "data-bbti-film-room-remix-question={bench.activeQuestionId}",
  "data-bbti-film-room-remix-count={bench.rowCount}",
  'data-testid="bbti-film-room-remix-row"',
  "data-bbti-film-room-remix-row={row.id}",
  "data-bbti-film-room-remix-position={index + 1}",
  "data-bbti-film-room-remix-target={row.target}",
  'data-testid="bbti-film-room-remix-copy"',
  'data-bbti-film-room-remix-action="copy-bench"',
  'data-testid="bbti-film-room-remix-boundary"',
].forEach((expected) => assertIncludes("BbtiFilmRoomRemixBench QA contract", filmRoomRemixBench, expected));

[
  'data-testid="bbti-film-room-drill"',
  "data-bbti-film-room-drill-qa={drill.qaKey}",
  "data-bbti-film-room-drill-question={clip.questionId}",
  "data-bbti-film-room-drill-step-count={drill.steps.length}",
  'data-testid="bbti-film-room-drill-step"',
  "data-bbti-film-room-drill-step={step.id}",
  "data-bbti-film-room-drill-position={index + 1}",
  'data-testid="bbti-film-room-drill-copy"',
].forEach((expected) => assertIncludes("BbtiFilmRoomDrillCard QA contract", filmRoomDrillCard, expected));

[
  'data-testid="bbti-challenge-receipt-board"',
  "data-bbti-challenge-count={challengeMatchups.length}",
  'data-testid="bbti-challenge-lane-scoreboard"',
  "data-bbti-challenge-lane-scoreboard-version={laneScoreboard.version}",
  "data-bbti-challenge-lane-scoreboard-code={laneScoreboard.code}",
  "data-bbti-challenge-lane-scoreboard-count={laneScoreboard.laneCount}",
  'data-testid="bbti-challenge-lane-scoreboard-row"',
  "data-bbti-challenge-lane-scoreboard-row={row.id}",
  "data-bbti-challenge-lane-scoreboard-target={row.target}",
  "data-bbti-challenge-lane-scoreboard-category={row.category}",
  "data-bbti-challenge-lane-scoreboard-matchup={row.matchupId}",
  "data-bbti-challenge-lane-scoreboard-position={index + 1}",
  'data-bbti-challenge-lane-scoreboard-action="open-lane"',
  'data-testid="bbti-challenge-lane-scoreboard-action"',
  'data-bbti-challenge-lane-scoreboard-action="copy-scoreboard"',
  'data-testid="bbti-challenge-lane-scoreboard-boundary"',
  'data-testid="bbti-challenge-card"',
  "data-bbti-challenge-matchup-id={matchup.matchupId}",
  "data-bbti-challenge-category={matchup.category}",
  "data-bbti-challenge-position={index + 1}",
  'data-testid="bbti-challenge-rivalry-scripts"',
  "data-bbti-rivalry-script-count={rivalryScripts.length}",
  'data-testid="bbti-challenge-rivalry-script"',
  "data-bbti-rivalry-script={script.id}",
  "data-bbti-rivalry-script-position={index + 1}",
  'data-testid="bbti-challenge-copy"',
  'data-bbti-challenge-action="copy"',
  'data-testid="bbti-challenge-open"',
  'data-bbti-challenge-action="open-matchup"',
  "BbtiChallengeReplaySeeds",
  "BbtiChallengePickReplayKit",
  "pickReplayKit",
].forEach((expected) => assertIncludes("BbtiChallengeReceiptBoard QA contract", challengeReceiptBoard, expected));

[
  'data-testid="bbti-challenge-replay-seeds"',
  "data-bbti-challenge-replay-seeds-version={seeds.version}",
  "data-bbti-challenge-replay-seeds-source={seeds.source}",
  "data-bbti-challenge-replay-seeds-case-source={seeds.caseSource}",
  "data-bbti-challenge-replay-seeds-code={seeds.code}",
  "data-bbti-challenge-replay-seeds-matchup={seeds.challengeMatchupId}",
  "data-bbti-challenge-replay-seeds-count={seeds.rowCount}",
  'data-testid="bbti-challenge-replay-seed-row"',
  "data-bbti-challenge-replay-seed={row.id}",
  "data-bbti-challenge-replay-seed-target={row.target}",
  "data-bbti-challenge-replay-seed-position={index + 1}",
  'data-testid="bbti-challenge-replay-seeds-copy"',
  'data-bbti-challenge-replay-seeds-action="copy-seeds"',
  'data-testid="bbti-challenge-replay-seeds-boundary"',
].forEach((expected) => assertIncludes("BbtiChallengeReplaySeeds QA contract", challengeReplaySeeds, expected));

[
  'data-testid="bbti-challenge-pick-replay-kit"',
  "data-bbti-challenge-pick-replay-kit-version={pickReplayKit.version}",
  "data-bbti-challenge-pick-replay-kit-code={pickReplayKit.code}",
  "data-bbti-challenge-pick-replay-kit-count={pickReplayKit.itemCount}",
  'data-testid="bbti-challenge-pick-replay-kit-item"',
  "data-bbti-challenge-pick-replay-kit-item={item.id}",
  "data-bbti-challenge-pick-replay-kit-target={item.target}",
  "data-bbti-challenge-pick-replay-kit-source-lane={item.sourceLaneId}",
  "data-bbti-challenge-pick-replay-kit-matchup={item.sourceMatchupId}",
  "data-bbti-challenge-pick-replay-kit-position={index + 1}",
  'data-bbti-challenge-pick-replay-kit-action="copy-kit"',
  'data-bbti-challenge-pick-replay-kit-action="copy"',
  'data-testid="bbti-challenge-pick-replay-kit-boundary"',
].forEach((expected) => assertIncludes("BbtiChallengePickReplayKit QA contract", challengePickReplayKit, expected));

[
  'BBTI_CHALLENGE_REPLAY_SEEDS_VERSION = "bbti-challenge-replay-seeds-v1"',
  "BBTI_CHALLENGE_REPLAY_SEEDS_BOUNDARY",
  "resolveBbtiChallengeReplaySeeds",
  "buildBbtiChallengeReplaySeedsCopy",
  '"source-lock"',
  '"opening-pressure"',
  '"replay-lens"',
].forEach((expected) => assertIncludes("BBTI Challenge Replay Seeds data contract", challengeReplaySeedsData, expected));

[
  'BBTI_CHALLENGE_PICK_REPLAY_KIT_VERSION = "bbti-challenge-pick-replay-kit-v1"',
  "BBTI_CHALLENGE_PICK_REPLAY_KIT_BOUNDARY",
  "resolveBbtiChallengePickReplayKit",
  '"case-lock"',
  '"pressure-check"',
  '"first-possession"',
  '"case"',
  '"pressure"',
  '"tipoff"',
].forEach((expected) => assertIncludes("BBTI Challenge Pick Replay Kit data contract", challengeReplaySeedsData, expected));

[
  'BBTI_CHALLENGE_LANE_SCOREBOARD_VERSION = "bbti-challenge-lane-scoreboard-v1"',
  "BBTI_CHALLENGE_LANE_SCOREBOARD_BOUNDARY",
  "resolveBbtiChallengeLaneScoreboard",
  '"same-court"',
  '"counter-court"',
  '"overtime-court"',
  '"same-temperature"',
  '"counter-judgment"',
  '"overtime"',
].forEach((expected) => assertIncludes("BBTI Challenge Lane Scoreboard data contract", challengeData, expected));

[
  'data-testid="bbti-result-scouting-report"',
  "data-bbti-result-scouting-version={report.version}",
  "data-bbti-result-scouting-code={report.code}",
  "data-bbti-result-scouting-count={report.laneCount}",
  'data-testid="bbti-result-scouting-lane"',
  "data-bbti-result-scouting-lane={lane.id}",
  "data-bbti-result-scouting-axis={lane.axisKey}",
  "data-bbti-result-scouting-target={lane.target}",
  "data-bbti-result-scouting-letter={lane.chosenLetter}",
  "data-bbti-result-scouting-score={lane.score}",
  "data-bbti-result-scouting-position={index + 1}",
  'data-testid="bbti-result-scouting-evidence"',
  "data-bbti-result-scouting-evidence-axis={lane.axisKey}",
  "data-bbti-result-scouting-evidence-position={evidenceIndex + 1}",
  'data-testid="bbti-result-scouting-copy-kit"',
  "data-bbti-result-scouting-copy-kit-version={copyKit.version}",
  "data-bbti-result-scouting-copy-kit-source-version={copyKit.sourceReportVersion}",
  "data-bbti-result-scouting-copy-kit-code={copyKit.code}",
  "data-bbti-result-scouting-copy-kit-count={copyKit.itemCount}",
  'data-testid="bbti-result-scouting-copy-kit-action"',
  'data-bbti-result-scouting-copy-kit-action="copy-kit"',
  'data-testid="bbti-result-scouting-copy-kit-item"',
  "data-bbti-result-scouting-copy-kit-item={item.id}",
  "data-bbti-result-scouting-copy-kit-target={item.target}",
  "data-bbti-result-scouting-copy-kit-source-lane={item.sourceLaneId}",
  "data-bbti-result-scouting-copy-kit-source-axis={item.sourceAxis}",
  "data-bbti-result-scouting-copy-kit-position={index + 1}",
  'data-bbti-result-scouting-copy-kit-action="copy"',
  'data-testid="bbti-result-scouting-copy-kit-boundary"',
  'data-testid="bbti-result-scouting-boundary"',
].forEach((expected) => assertIncludes("BbtiResult scouting QA contract", bbtiResult, expected));

[
  'BBTI_MY_TEAM_RESULT_CARD_VERSION = "bbti-myteam-result-card-v1"',
  "data-testid={qaTestId}",
  "data-myteam-card-context={qaContext}",
  "data-myteam-card-version={qaVersion}",
  "data-bbti-myteam-card-code={qaContext ? code : undefined}",
  "data-bbti-myteam-card-overall={qaContext ? ovr : undefined}",
  'data-testid={qaContext ? "bbti-myteam-scouting-attribute" : undefined}',
  "data-bbti-myteam-attribute={qaContext ? item.key : undefined}",
  "data-bbti-myteam-attribute-position={qaContext ? index + 1 : undefined}",
].forEach((expected) => assertIncludes("MyTeamResultCard BBTI QA contract", myTeamResultCard, expected));

[
  'BBTI_RESULT_SCOUTING_VERSION = "bbti-result-scouting-refresh-v1"',
  "BBTI_RESULT_SCOUTING_BOUNDARY",
  'BBTI_RESULT_SCOUTING_COPY_KIT_VERSION = "bbti-result-scouting-copy-kit-v1"',
  "BBTI_RESULT_SCOUTING_COPY_KIT_BOUNDARY",
  "resolveBbtiResultScoutingReport",
  "resolveBbtiResultScoutingCopyKit",
  "buildAxisEvidence",
  '"pace-read"',
  '"proof-read"',
  '"usage-read"',
  '"stakes-read"',
  '"group-recap"',
  '"counter-read"',
  '"next-workout"',
].forEach((expected) => assertIncludes("BBTI result scouting data contract", playbookData, expected));

[
  'data-testid="bbti-share-card"',
  'data-bbti-share-card-version="bbti-share-card-v1"',
  'data-bbti-share-card-surface="visual"',
  "data-bbti-share-card-code={code}",
  "data-bbti-share-card-axis-count={axisCount}",
  "data-bbti-share-card-badge-count={badgeCount}",
  'data-testid="bbti-share-card-overall"',
  "data-bbti-share-card-overall={overall}",
  'data-testid="bbti-share-card-axis"',
  "data-bbti-share-card-axis={axis.key}",
  "data-bbti-share-card-axis-position={index + 1}",
  "data-bbti-share-card-axis-value={axis.value}",
  'data-testid="bbti-share-card-badge"',
  "data-bbti-share-card-badge-position={index + 1}",
  "data-bbti-share-card-badge-tone={badge.tone}",
  'data-testid="bbti-share-card-copy"',
  'data-bbti-share-card-action="copy-card"',
  'data-testid="bbti-share-card-copy-url"',
  'data-bbti-share-card-action="copy-url"',
  'data-testid="bbti-share-card-controls"',
  'data-bbti-share-card-control-count="2"',
].forEach((expected) => assertIncludes("BbtiShareCard QA contract", shareCard, expected));

[
  'data-testid="bbti-share-route-scoreboard"',
  "data-bbti-share-route-scoreboard-version={routeScoreboard.version}",
  "data-bbti-share-route-scoreboard-kit={routeScoreboard.sourceKitId}",
  "data-bbti-share-route-scoreboard-code={routeScoreboard.code}",
  "data-bbti-share-route-scoreboard-event={routeScoreboard.eventId}",
  "data-bbti-share-route-scoreboard-challenge={routeScoreboard.challengeMatchupId}",
  "data-bbti-share-route-scoreboard-count={routeScoreboard.routeCount}",
  'data-testid="bbti-share-route-scoreboard-row"',
  "data-bbti-share-route-scoreboard-row={row.id}",
  "data-bbti-share-route-scoreboard-target={row.target}",
  "data-bbti-share-route-scoreboard-position={index + 1}",
  'data-testid="bbti-share-route-scoreboard-action"',
  'data-bbti-share-route-scoreboard-action="copy-scoreboard"',
  'data-testid="bbti-share-route-scoreboard-boundary"',
  'data-testid="bbti-share-locker-room"',
  "data-bbti-share-locker-room-version={lockerRoom.version}",
  "data-bbti-share-locker-room-code={lockerRoom.code}",
  "data-bbti-share-locker-room-count={lockerRoom.rowCount}",
  'data-testid="bbti-share-locker-room-row"',
  "data-bbti-share-locker-room-row={row.id}",
  "data-bbti-share-locker-room-target={row.target}",
  "data-bbti-share-locker-room-kit={row.sourceKitId}",
  "data-bbti-share-locker-room-link-kind={row.linkKind}",
  "data-bbti-share-locker-room-position={index + 1}",
  'data-testid="bbti-share-locker-room-action"',
  'data-bbti-share-locker-room-action="copy-locker-room"',
  'data-bbti-share-locker-room-action="copy-route"',
  'data-testid="bbti-share-locker-room-boundary"',
  'data-testid="bbti-share-return-lane-check"',
  "data-bbti-share-return-lane-check-version={returnLaneCheck.version}",
  "data-bbti-share-return-lane-check-code={returnLaneCheck.code}",
  "data-bbti-share-return-lane-check-count={returnLaneCheck.rowCount}",
  'data-testid="bbti-share-return-lane-check-row"',
  "data-bbti-share-return-lane-check-row={row.id}",
  "data-bbti-share-return-lane-check-target={row.target}",
  "data-bbti-share-return-lane-check-status={row.status}",
  "data-bbti-share-return-lane-check-kit={row.sourceKitId}",
  "data-bbti-share-return-lane-check-link-kind={row.linkKind}",
  "data-bbti-share-return-lane-check-position={index + 1}",
  'data-testid="bbti-share-return-lane-check-action"',
  'data-bbti-share-return-lane-check-action="copy-check"',
  'data-bbti-share-return-lane-check-action="copy-lane"',
  'data-testid="bbti-share-return-lane-check-boundary"',
  'data-testid="bbti-share-kits"',
  "data-bbti-share-kit-count={kits.length}",
  'data-bbti-share-kit-has-preview={preview ? "true" : "false"}',
  'data-testid="bbti-share-kit-quick-copy"',
  "data-bbti-share-kit-id={kit.id}",
  "data-bbti-share-kit-position={index + 1}",
  "data-bbti-share-kit-link-kind={kit.linkKind}",
  "data-bbti-share-kit-qa={quickCopyFilesForQa(kit)}",
].forEach((expected) => assertIncludes("BbtiShareKits QA contract", shareKits, expected));

[
  'BBTI_SHARE_ROUTE_SCOREBOARD_VERSION = "bbti-share-route-scoreboard-v1"',
  "BBTI_SHARE_ROUTE_SCOREBOARD_BOUNDARY",
  "resolveBbtiShareRouteScoreboard",
  'BBTI_SHARE_LOCKER_ROOM_VERSION = "bbti-share-kit-locker-room-v1"',
  "BBTI_SHARE_LOCKER_ROOM_BOUNDARY",
  "resolveBbtiShareLockerRoom",
  'BBTI_SHARE_RETURN_LANE_CHECK_VERSION = "bbti-share-return-lane-check-v1"',
  "BBTI_SHARE_RETURN_LANE_CHECK_BOUNDARY",
  "resolveBbtiShareReturnLaneCheck",
  '"result-door"',
  '"rematch-door"',
  '"case-door"',
  '"result-return"',
  '"duo-return"',
  '"challenge-return"',
  '"event-return"',
].forEach((expected) => assertIncludes("BBTI Share Route Scoreboard data contract", shareKitsData, expected));

[
  'data-testid="bbti-share-target-picker"',
  "data-bbti-share-target-count={targets.length}",
  "data-bbti-share-target-active={active.id}",
  'data-testid="bbti-share-target-option"',
  "data-bbti-share-target-id={target.id}",
  "data-bbti-share-target-position={index + 1}",
  'data-bbti-share-target-selected={active.id === target.id ? "true" : "false"}',
  'data-testid="bbti-share-target-action"',
  'data-bbti-share-target-action="system-share"',
  'data-bbti-share-target-action="copy-active"',
  'data-bbti-share-target-action="copy-all"',
].forEach((expected) => assertIncludes("BbtiShareTargetPicker QA contract", shareTargetPicker, expected));

[
  'BBTI_LINEUP_CHEMISTRY_VERSION = "bbti-lineup-chemistry-v1"',
  "resolveBbtiLineupChemistryBrief",
  "buildBbtiLineupChemistryCopy",
  '"role-split"',
  '"friction-plan"',
  '"fit-action"',
].forEach((expected) => assertIncludes("BBTI Lineup Chemistry data contract", lineupChemistryData, expected));

[
  'BBTI_FILM_ROOM_REMIX_BENCH_VERSION = "bbti-film-room-remix-bench-v1"',
  "BBTI_FILM_ROOM_REMIX_BENCH_BOUNDARY",
  "resolveBbtiFilmRoomRemixBench",
  "buildBbtiFilmRoomRemixBenchCopy",
  '"clip-read"',
  '"drill-card"',
  '"poll-read"',
].forEach((expected) => assertIncludes("BBTI Film Room remix bench data contract", filmRoomRemixBenchData, expected));

[
  "resolveBbtiFilmRoomDrill",
  "buildBbtiFilmRoomDrillCopy",
  '"evidence"',
  '"tension"',
  '"cross-exam"',
  '"insight"',
].forEach((expected) => assertIncludes("BBTI Film Room drill data contract", filmRoomDrillData, expected));

[
  "scriptOpener",
  "scriptConflict",
  "scriptCounter",
].forEach((expected) => assertIncludes("BBTI rivalry script evidence contract", challengeEvidenceData, expected));

assertNotIncludes("share return user-facing copy", shareReturnPrompts, "真实全网热度");
assertNotIncludes("case postgame user-facing copy", casePostgameData, "真实热度");
assertNotIncludes("case postgame user-facing copy", casePostgameData, "用户投票");
assertNotIncludes("case postgame user-facing copy", casePostgameData, "全网");
assertNotIncludes("case postgame user-facing copy", casePostgameData, "官方");
assertNotIncludes("battle replay lens user-facing copy", battleReplayLensData, "真实胜率");
assertNotIncludes("battle replay lens user-facing copy", battleReplayLensData, "官方");
assertNotIncludes("battle replay lens user-facing copy", battleReplayLensData, "用户投票");
assertNotIncludes("battle replay lens user-facing copy", battleReplayLensData, "全网");
assertNotIncludes("next play user-facing copy", nextPlayData, "Q-level");
assertNotIncludes("add files user-facing copy", addFilesData, "VAR");
assertNotIncludes("add files user-facing copy", addFilesData, "FUT");
assertNotIncludes("add files user-facing copy", addFilesData, "用户投票");
assertNotIncludes("compare user-facing copy", compareData, "VAR");
assertNotIncludes("compare user-facing copy", compareData, "FUT");
assertNotIncludes("compare user-facing copy", compareData, "用户投票");
assertNotIncludes("compare user-facing copy", compareData, "全网");
assertNotIncludes("answer poll preset copy", answerPollPresets, "多数人愿意");
assertNotIncludes("answer poll preset copy", answerPollPresets, "大多数选择");
assertNotIncludes("answer poll preset copy", answerPollPresets, "真实热度");
assertNotIncludes("answer poll preset copy", answerPollPresets, "全网");
assertNotIncludes("return streak user-facing copy", dailyReturnData, "真实热度");
assertNotIncludes("return streak user-facing copy", dailyReturnData, "用户投票");
assertNotIncludes("return streak user-facing copy", dailyReturnData, "全网");
assertNotIncludes("return streak user-facing copy", dailyReturnData, "官方");
assertNotIncludes("arena event bracket user-facing copy", arenaEventsData, "用户投票");
assertNotIncludes("arena event bracket user-facing copy", arenaEventsData, "全网");
assertNotIncludes("arena event bracket user-facing copy", arenaEventsData, "官方");
assertNotIncludes("lineup chemistry user-facing copy", lineupChemistryData, "VAR");
assertNotIncludes("lineup chemistry user-facing copy", lineupChemistryData, "用户投票");
assertNotIncludes("film room drill user-facing copy", filmRoomDrillData, "VAR");
assertNotIncludes("film room drill user-facing copy", filmRoomDrillData, "用户投票");
assertNotIncludes("challenge rivalry script user-facing copy", challengeEvidenceData, "VAR");
assertNotIncludes("challenge rivalry script user-facing copy", challengeEvidenceData, "用户投票");
assertNotIncludes("challenge lane scoreboard user-facing copy", challengeData, "VAR");
assertNotIncludes("challenge lane scoreboard user-facing copy", challengeData, "用户投票");
assertNotIncludes("share card user-facing copy", shareCardPresets, "VAR");
assertNotIncludes("share card user-facing copy", shareCardPresets, "用户投票");

if (errors.length) {
  console.error("BBTI QA selector validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI QA selector validation");
console.log("- DeepLinkNotice: expanded/collapsed/source/clip fallback selectors");
console.log("- CaseTrail: source/version/progress/step selectors");
console.log("- CasePostgame: version/source/session/return/action selectors");
console.log("- CaseReplayIndex: postgame replay row and ReplayCenter selectors");
console.log("- BattleReplayLens: current/replay/advisor/next selectors");
console.log("- ResultScouting/MyTeamCard: local scouting lane/evidence/card selectors");
console.log("- ResultActionDock: sticky dock/action/program/section selectors");
console.log("- NextPlayPanel: panel/count/action QA selectors");
console.log("- AddFilesSuggestionPanel: version/count/card/CTA/copy selectors");
console.log("- BbtiCompare: report/program/rematch prompt/axis/action selectors");
console.log("- BbtiAnswerPollTrend: local simulation/stat/round/seat selectors");
console.log("- ReturnStreaks/DailyReturnRemix: entry/featured/bench selectors and local return contract");
console.log("- ArenaEvents: route tree selectors and local bracket contract");
console.log("- LineupChemistry: duo card/brief/copy/open selectors");
console.log("- FilmRoomRemixBench/DrillCard: remix row/drill/step/copy selectors");
console.log("- ChallengeReceiptBoard/ReplaySeeds/PickReplayKit: card/rivalry script/seed/pick-kit/copy/open selectors");
console.log("- ShareCard: screenshot card/axis/badge/copy selectors");
console.log("- ShareKits: locker room/route scoreboard/target picker/quick copy selectors");
console.log("OK: visual QA selectors and copy boundaries are stable.");
