# BBTI Team Review

## Scope

- Project improved in this pass: `/Users/happytang/Documents/New project/kobe-vs-lebron`
- Explicitly excluded: `/Users/happytang/Documents/New project/lebron-rebuttal-miniapp`
- Football comparison target checked: `/Users/happytang/Documents/New project/messi-vs-ronaldo`
- Football source recovered from sourcemaps: `/Users/happytang/Documents/fmbti/messi-vs-ronaldo`

## Agent Team Notes

### Basketball MBTI reviewer

Focus: BBTI route, quiz flow, result screen, reusable data helpers, replay value.

Immediate direction:

1. Make the result page feel less like a static certificate and more like a post-game report.
2. Show decisive answer replay so players understand why they got the type.
3. Add friend challenge hooks around compatibility and nemesis types.
4. Persist the previous result so returning players have continuity.

### Football MBTI advisor

Status: `messi-vs-ronaldo` in this workspace currently contains only `.next` cache files. The usable football source is at `/Users/happytang/Documents/fmbti/messi-vs-ronaldo`; it is useful for ideas, but that source currently has a broken `Landing.tsx` import and should not be treated as a clean runnable upstream.

Borrowed cross-sport ideas:

1. Use derby framing: every personality result should create an obvious rival matchup.
2. Add home/away context: the same personality can behave differently as a home-team loyalist, neutral viewer, or finals-only viewer.
3. Treat the result as a lineup card or tactical report instead of only a personality label.
4. Add shareable conflict prompts so users can challenge friends with opposite types.
5. Add a blitz test mode for low-friction sharing.
6. Use a VAR-style reveal after voting; basketball should translate it as Replay Center / Coach's Challenge.

### Follow-up Agent Team Round

Basketball reviewer notes implemented:

1. Matchup cards needed clearer "what this tests" chips.
2. BattleArena needed explicit post-vote controls so users can read Replay Center and vote reveal.
3. Vote stats needed matchup-scoped keys because generic topic ids can repeat across matchups.
4. Custom matchup selection needed search, filters, and a random high-heat entry point.

Football advisor notes implemented:

1. Basketball borrowed football's shareable result query pattern as `?bbti=CODE`.
2. Basketball borrowed football's result-to-debate advisor as "你的命定对线".
3. Basketball tightened BBTI mode naming into stronger sports metaphors.

Latest agent round implemented:

1. Landing now uses a Featured Clash panel with shared matchup heat/lane/axes data.
2. Landing CTA priority is tightened around 科詹 GOAT 法庭, BBTI, and 自选两位球星.
3. BBTI Entry now marks 常规赛版 as the recommended first run and lets users reopen the last saved result.
4. BattleArena voting cards now have button semantics, keyboard shortcuts, read mode, reduced-motion aware auto-advance, and clearer vote instructions.
5. Vote reveal and Replay Center now expose more useful accessibility regions and summaries.

Newest agent feedback:

1. Football comparison agent recommended clearer result-page information architecture, explicit challenge-link consumption, richer matchup receipts, and BBTI-only draft/session continuity.
2. Basketball review agent prioritized the share-return loop: compare links should open directly, challenge deep links should produce an explicit CTA, and action areas should stay easy to find.
3. Latest session agents recommended a BBTI-only draft helper rather than a full store migration, with `mode`, `questionIds`, `answers`, `openText`, and `updatedAt` used to validate resume safety.
4. Football UX comparison recommended putting the draft bench above Return Bench and changing the quiz exit dialog into a timeout/save flow.
5. Result-page agents recommended a lightweight section nav and Next Play action order: 命定开战 first, 自选审判 second, 双人对比 third, Share Kit as support, and 重测 as low-priority footer.
6. Challenge-fixture agents recommended football-style "handwritten first, heuristic fallback" routing so every BBTI type gets a distinct three-lane matchup script.
7. Evidence-pack agents recommended turning each命定对线 into a factual receipt board with `pressureQuestion`, `iconicMoment`, `receiptA`, `receiptB`, `evidenceLens`, and share-ready group-chat prompts.
8. Fact-risk review recommended using verifiable NBA event anchors and avoiding hard verdict phrases like "唯一", "碾压", or unprovable player-ranking claims.
9. Basketball UI review flagged that the Action Dock challenge anchor landed on the wrong section and that long challenge cards should not be one giant button.
10. Football comparison recommended upgrading static compatibility/nemesis display into basketball-native "王朝双核 / 首轮死敌" chemistry with copyable invites and direct compare links.
11. Football comparison also recommended future Coach Timeout answer reveals and a tabbed post-game show structure once the result page grows further.
12. Coach Timeout agents recommended a pure display helper that reuses BBTI scoring, avoids draft-schema changes, does not slow blitz mode, and skips final-question interruption.
13. Football feedback warned not to copy VAR/penalty language; the quiz reveal should feel like a basketball tactics note and should never imply fake crowd percentages.
14. Film Room agents recommended turning decisive answers into three basketball possession clips, reusing Coach Timeout semantics instead of repeating axis summaries.
15. Football comparison recommended single-clip sharing with basketball language like "录像室点评" and "发群包", not football-style verdict or appeal copy.
16. Clip-deeplink agents warned that `clip=QID` alone cannot rebuild answer-level Film Room on another device; shared links need a lightweight answer key such as `q13-a` or `q2-m0.2`.
17. Deep-link review recommended keeping `clip` as result-page internal state only, preserving the existing `bbti` before `a/b` routing priority.
18. Football source review found no screenshot export library to copy directly; if basketball adds image export, start with a manual scouting/2K-style share card, keep buttons outside the card, and avoid football/FUT copy.
19. Basketball share review warned that a `?bbti=CODE` result cannot recover answer-derived details such as overall score or Film Room clips, so the visible share card should only show code-stable fields and use a canonical result URL.
20. Basketball follow-up review prioritized a one-click "compare with me" invite loop using `?a=CODE` only, so friends can fill the second code without seeing an invalid empty `b`.
21. Basketball follow-up review also recommended turning Film Room clips into future "opening-court ammo" that can carry one chosen answer into the challenge board.
22. Football comparison recommended a basketball-only second-layer report with locker-room role, coach usage note, group-chat trigger, and clutch-possession tendency instead of football life-mapping copy.
23. Football comparison suggested a simulated "看台风向" answer meter only if it is clearly labeled as simulated and does not slow blitz mode.
24. Film Room ammo review recommended keeping ammo as a low-coupling child of Film Room: current active clip plus one primary challenge, not the full challenge board.
25. Film Room ammo review warned not to reuse `shareCopy` as the evidence body; use structured fields such as receipts, iconic moment, pressure question, and evidence lens instead.
26. Football comparison recommended translating its evidence-chain pattern into basketball "证物链", plus three basketball seats: 数据席, 录像席, 战术席.
27. Football comparison also reinforced the social rule: attack the vote or standard, not the user's identity.
28. Cross-exam review recommended keeping question-specific prompts in a pure data resolver, with fallback from exact question/pole to pole generic to challenge pressure question.
29. Football comparison recommended "论点 -> 证据点 -> 反击句" as the shape of Film Room ammo, while keeping all output deterministic for shared clip links.
30. Basketball Film Room review recommended using `coachTimeout.poles[]` rather than parsing `impact`, because pole labels and points are already structured and deterministic.
31. Basketball Film Room review warned that contradictions must be framed as current Film Room sample tension, not a claim about the player's full BBTI answer sheet.
32. Football comparison recommended the shape "证据句 -> 矛盾句 -> 质询句 -> 洞察句", translated into basketball language without football, VAR, or FUT copy.
33. Challenge-lane review recommended keeping selected matchup state inside `BbtiFilmRoomClips`, because it only affects the active clip's Opening Ammo.
34. Challenge-lane review recommended restoring the selected lane from copied `bbti+clip+challenge` URLs, while leaving `BbtiFilmRoomAmmo` as a consumer-only component.
35. Football comparison recommended future反方证据 cards, but warned not to mix "换对位" and "换证据类型" into the same switcher.
36. Counter-evidence review recommended a pure display card that consumes current clip, selected challenge lane, and the already resolved cross-exam, without owning lane state.
37. Football comparison recommended the smallest useful反证 shape: one opponent evidence line, one coaching question, and one坚持/改判 prompt.
38. Counter-evidence review warned not to invent new player facts; use only existing challenge receipts, iconic moments, pressure questions, and cross-exam text.
39. Counter-evidence preset review recommended a pure resolver with source tracing for evidence and question fields, keeping URL, clipboard, and identity copy in the component layer.
40. Basketball review warned not to use generic `reason`, `shareCopy`, or `groupChatPrompt` as evidence; evidence must come from receipts, iconic moments, or cross-exam counterpunches.
41. Football comparison recommended future topic meta and sourced fact records for true vote-level counter evidence, while keeping presets limited to tone and template framing.
42. Counter-evidence fact review recommended treating facts as a provenance wrapper over existing receipts, not as a new unsourced NBA fact library.
43. Football comparison recommended using `sourceId` and a future verified-source registry instead of scattering guessed `sourceUrl` strings into fact records.
44. Basketball review recommended marking `iconicMoment` as matchup-level evidence instead of forcing it to support player A or player B.
45. Verified-source review recommended an empty fail-closed registry: no verified source means no clickable URL and no official-source language in UI.
46. Football comparison found no source registry to copy directly, but recommended future `evidenceType`, `sourceTier`, `riskLevel`, and freshness fields for basketball facts.
47. Result-trend agents recommended keeping answer-poll aggregation as a lightweight supplement under the four-dimension report, not another large result module.
48. Basketball UX review recommended showing only simulated label, average tendency, and顺风/拉锯/逆风 counts in UI, while keeping most顺/最硬 details in copied text.
49. Share-target agents recommended treating Share Kit targets as explicit contracts: intended audience, link kind, link label, copy action, and boundary note should live in data rather than component conditionals.
50. Football comparison reinforced stable result links, direct challenge回流, and compare invites as separate basketball-native targets, without copying football terminology or implying live/global vote data.
51. Football Film Room comparison recommended the cross-exam chain "题目元数据 -> 用户选择证据 -> 矛盾检测 -> 结果页回顾 -> 再进下一场", with each prompt anchored to the exact basketball question instead of generic pole fallback.
52. Football comparison recommended the next larger result-page layout as a basketball-native赛后节目单 with 球探卡, 录像室, 开庭挑战, and发群包 views, while avoiding football terms such as VAR, pitch, derby, or penalty language.

Current implementation round:

1. Extracted debate-side rendering into a dedicated card component so BattleArena can keep owning only flow and timers.
2. Upgraded BBTI challenge routing from a loose list into three repeatable lanes: 同温层局, 反向审判, 破防加赛.
3. Added Shaq/Yao into BBTI challenge routing so defensive individual types have a stronger paint-war recommendation.
4. Added a BBTI arena-event simulator so the same type can be reinterpreted under Game 7, trade deadline, and rebuild-year pressure.
5. Closed the arena-event loop with copied group-chat prompts, persisted active scenario, and direct challenge-matchup CTA.
6. Added a BBTI deep-link helper so result URLs can carry `bbti`, `event`, and `challenge` parameters.
7. Upgraded the BBTI entry recovery area into a Return Bench with the last result, a deterministic daily arena event, copyable group-chat prompt, and challenge-lane CTAs.
8. Prevented shared/reopened BBTI result pages with empty answers from overwriting the user's real last-result history.
9. Added a BBTI Share Kit so results can be copied as a scoreboard post, court bait, challenge invite, or social receipt instead of only using one generic share button.
10. Wired BBTI compare deep links so shared `?a=CODE&b=CODE` links open the dual report instead of landing on the homepage.
11. Added an explicit shared-challenge notice for `?bbti=CODE&challenge=matchup` links so users see who they were invited to debate before choosing to open the matchup.
12. Added a BBTI draft/session helper so unfinished 12/30/50-question tests can resume safely after leaving the quiz.
13. Added an entry-page "Saved Timeout" bench above Return Bench for continuing or discarding local draft progress.
14. Changed the BBTI quiz exit flow from "progress will not save" to a timeout dialog with continue, save-and-return, and discard options.
15. Added a lightweight BBTI result action dock with section jumps for 球探卡, 四维诊断, 开庭挑战, and 分享包.
16. Added a direct 自选审判局 route beside the generated 命定对线 recommendations.
17. Replaced generic letter-based challenge routing with explicit 16-type BBTI challenge fixtures, while preserving the previous heuristic as fallback for unknown codes.
18. Added matchup-level evidence packs so every fixed BBTI challenge can carry a pressure question, iconic moment, two receipts, evidence lenses, group-chat prompt, and share copy.
19. Surfaced evidence packs inside result challenge cards so each recommendation becomes playable debate material instead of only a routing button.
20. Extracted the challenge evidence UI into a dedicated receipt-board component with separate copy and open-matchup actions.
21. Replaced static best-buddy/nemesis tiles with a lineup chemistry component that opens prefilled duo compare reports and copies invite text.
22. Added Coach Timeout answer reveals during the BBTI quiz so selected answers produce immediate tactical feedback without changing draft persistence.
23. Upgraded result-page key-answer replay into Film Room clips that show the exact answer evidence, Coach Timeout summary, tactical note, blind spot, and copyable clip text.
24. Added Film Room clip deep links that can select a specific clip locally and reconstruct shared-only clips from answer keys when possible.
25. Added a compact BBTI share-card preview inside the existing Share Kit section, using only code-stable scouting fields and a canonical `?bbti=CODE` result URL.
26. Removed the duplicate bottom generic share CTA so the Action Dock's 分享包 target lands on one combined share-card and copy-kit area.
27. Tightened Share Kit copied URLs to the same canonical base used by the visual share card, avoiding stale compare, clip, or unrelated query state.
28. Added small-screen guards to the share card and share-kit controls so longer future labels do not easily overflow the card.
29. Added 16 code-stable share-card presets so every BBTI type gets a card headline, badge, caption, and group-chat hook that survives reopened `?bbti=CODE` links.
30. Added compare-invite URLs, result-page compare routing, a Share Kit duo invite, and a Return Bench copy action so BBTI results can pull friends directly into a two-code report.
31. Added Film Room opening-court ammo so one answer clip can become a copyable evidence pack with its primary challenge link.
32. Added a 录像室 anchor to the result action dock because Film Room is now a first-class source of shareable debate material.
33. Added question-specific Film Room cross-exams so ammo can challenge the selected standard instead of only repeating the user's answer.
34. Added a deterministic Film Room consistency matrix that scans the visible clip poles for hard basketball tensions: 数据 vs 名场面, 巨星 vs 体系, 忠诚 vs 冠军窗口, and 进攻 vs 防守.
35. Kept the matrix scoped to current Film Room clips and placed it before Opening Ammo so the self-check does not couple itself to challenge routing.
36. Added copyable consistency-check packs that include the two clips, both standards, the review question, and a stable `bbti+clip` Film Room URL.
37. Added a Film Room challenge-lane switcher so the same answer clip can feed 同温层局, 反向审判, or 破防加赛 ammo.
38. Kept challenge-lane state local to Film Room and restored copied `challenge` deep links before building Opening Ammo copy.
39. Added a compact反方证据 card between lane selection and Opening Ammo, so every selected lane now produces a主张, 证据, 反方追问, and坚持/改判 prompt.
40. Reused the active Film Room cross-exam across the counter-evidence card and Opening Ammo instead of resolving separate challenge interpretations.
41. Extracted counter-evidence wording into a pure preset resolver that traces whether evidence came from a receipt, iconic moment, or cross-exam fallback.
42. Kept counter-evidence presets to framing and decision prompts only; no new player facts, rankings, scores, or source claims were added.
43. Added a counter-evidence facts layer that mechanically wraps existing `iconicMoment`, `receiptA`, and `receiptB` fields with provenance metadata.
44. Kept future source URLs out of fact records; facts now have an optional `sourceId` placeholder for a later verified-source registry.
45. Added an empty verified-source registry with helper lookups, URL host allowlisting, and source-record validation for future manual source review.
46. Kept the current product fail-closed: no verified source IDs are registered, so no URL is exposed or implied.

## Implemented This Pass

1. Added `src/data/bbti-playbook.ts` as a structured BBTI insight layer.
2. Added a result-page playbook with arena role, debate weapon, blind-spot drill, squad fit, cross-project idea, axis snapshots, decisive answers, and rival challenge.
3. Stored the last BBTI result in localStorage and surfaced it on the BBTI entry page.
4. Fixed stale 12-question copy on the landing page and metadata.
5. Made the BBTI quiz progress bar reflect the current question instead of starting at 0%.
6. Added shared BBTI scoring helpers in `src/data/bbti.ts` so result percentages and playbook insights reuse the same logic.
7. Sorted the open question to the end of quick/full modes so the "final open question" promise is true.
8. Added 12-question BBTI blitz mode.
9. Added `src/data/stat-bombs.ts` for matchup-aware stat bombs across fixed and custom matchups.
10. Added `src/lib/matchupSlots.ts` to keep legacy vote slots aligned with matchup content, including the LeBron/Jordan inverted authoring case.
11. Reworked the vote reveal as Replay Center / Coach's Challenge.
12. Fixed React lint issues and configured `turbopack.root` for this project.
13. Added `src/data/bbti-rivalries.ts` and `src/components/BbtiCompare.tsx` for two-code BBTI chemistry reports.
14. Added strict BBTI code validation and paste extraction for shared result text.
15. Extracted `src/components/ReplayCenter.tsx` from `BattleArena`.
16. Added football-inspired derby tags to fixed basketball matchup cards.
17. Added `src/data/matchup-rivals.ts` and a Rivalry Advisor panel in custom matchup selection.
18. Added `src/components/MyTeamResultCard.tsx` and surfaced a MyTEAM-style debate result card.
19. Refactored `MyTeamResultCard` into a generic collectible result card and reused it on the BBTI result page.
20. Upgraded Rivalry Advisor scoring to use undirected rivalry edges, decade overlap, position buckets, legacy parity, stat contrast, debate fuel, and stable tie-breakers.
21. Added recommendation chips and mobile horizontal scrolling to the custom matchup Rivalry Advisor.
22. Added `src/data/matchup-memes.ts` and `src/components/CourtAgenda.tsx` for matchup-specific court agenda, banned lazy takes, pressure questions, chants, and group-chat prompts.
23. Surfaced Court Agenda on Pick Side and BattleArena, and added group-chat ammo to the result page share text.
24. Scoped local vote stats by matchup id while preserving the original global war baseline.
25. Added explicit post-vote controls: next round, more review time, and pause auto-advance.
26. Added "what this tests" axes chips to fixed matchup cards.
27. Added search, position/honor filters, and random high-heat matchup entry to custom matchup selection.
28. Added `src/data/bbti-challenges.ts` and BBTI result "你的命定对线" cards that jump directly into selected matchups.
29. Added `?bbti=CODE` result bootstrap and share URLs so BBTI results can be reopened directly.
30. Updated BBTI entry mode labels to 快攻版 / 常规赛版 / 抢七长卷 and made dimension chips more basketball-native.
31. Added `src/data/matchup-tags.ts` so Landing and MatchupSelect share heat/lane/axes language.
32. Reworked Landing into a stronger first screen with Featured Clash and direct CTAs for GOAT court, BBTI, and custom matchup.
33. Added direct "查看上次结果" recovery from the BBTI entry page.
34. Added read mode, keyboard voting, event-repeat guards, and reduced-motion aware auto-advance in BattleArena.
35. Converted debate cards to accessible button controls with pressed state and focus rings.
36. Added Replay Center and Vote Reveal accessibility metadata, including a single polite summary for screen readers.
37. Clarified the top war banner as the 科詹主战场 vote count to avoid misleading names in non-Kobe/LeBron matchups.
38. Added `src/components/DebateSideCard.tsx` and refactored BattleArena to use it for both debate sides.
39. Refined `src/data/bbti-challenges.ts` into three challenge categories for every BBTI code.
40. Added `src/data/bbti-arena-events.ts` and `src/components/BbtiArenaEvents.tsx` for replayable post-result scenarios.
41. Added copyable arena-event group-chat prompts and "拿这个题开战" routing into BBTI challenge matchups.
42. Added `src/lib/bbti-deep-links.ts` and wired BBTI result/event sharing through shared URL helpers.
43. Added `src/components/BbtiReturnBench.tsx` so returning BBTI players can reopen the last result, play today's arena event, copy a prompt, or jump into the three challenge lanes.
44. Guarded BBTI last-result persistence so direct result links and recovery views do not refresh `savedAt` or downgrade mode to blitz.
45. Added `src/data/bbti-share-kits.ts` for typed, reusable BBTI share scripts.
46. Added `src/components/BbtiShareKits.tsx` and surfaced four copyable share tones on the BBTI result page.
47. Extended `src/lib/bbti-deep-links.ts` with compare-link parsing and URL builders.
48. Updated `src/app/page.tsx` so compare links bootstrap into `bbti-compare` when no BBTI result code is present.
49. Updated `src/components/BbtiCompare.tsx` to use the shared compare URL helper.
50. Added `src/components/BbtiDeepLinkNotice.tsx` so challenge deep links become visible, explicit result-page CTAs.
51. Added `src/lib/bbti-session.ts` for local BBTI draft read/write/validation/clear helpers.
52. Updated `src/components/BbtiQuiz.tsx` to save draft progress for binary, multi, and open answers, clear drafts on completion, and stabilize the question-card height.
53. Updated `src/components/BbtiEntry.tsx` with a Saved Timeout panel that shows mode, completed count, resume position, and last saved time.
54. Reworked the BBTI quiz exit confirmation into a timeout/save dialog with an explicit discard path.
55. Added `src/components/BbtiResultActionDock.tsx` for result-page section navigation and high-priority next-play actions.
56. Updated `src/components/BbtiResult.tsx` with action-dock anchors and a secondary 自选审判局 card in the challenge section.
57. Extended `src/components/BbtiShareKits.tsx` with an optional section id so the result action dock can jump directly to share tools.
58. Added `src/data/bbti-challenge-fixtures.ts` with hand-written three-lane challenge recommendations for all 16 BBTI codes.
59. Updated `src/data/bbti-challenges.ts` so fixtures are used first and the previous algorithm only handles missing or future codes.
60. Verified the fixture table has 16 codes, 48 slots, no repeated three-matchup combos, and no unknown matchup ids.
61. Added `src/data/bbti-challenge-evidence.ts` to merge fixed-matchup evidence packs into fixture and fallback challenge recommendations.
62. Extended `BbtiChallengeMatchup` with optional evidence fields while preserving fixture-specific overrides for future per-type customization.
63. Updated the BBTI result challenge section and Share Kit challenge copy to include pressure questions, iconic moments, receipts, and evidence lenses.
64. Added `src/components/BbtiChallengeReceiptBoard.tsx` so challenge recommendations have standalone evidence layout, copyable receipt packs, and explicit开战 actions.
65. Fixed the `bbti-challenges` section anchor so the Action Dock jumps to the actual challenge board instead of the personality description card.
66. Added `src/components/BbtiLineupChemistry.tsx` to turn compatibility and nemesis into 王朝双核/首轮死敌 cards with copyable duo invites and prefilled compare links.
67. Added `src/data/bbti-answer-reveals.ts` to derive Coach Timeout copy from `scoreBbtiAnswer` and BBTI pole metadata.
68. Added `src/components/BbtiAnswerReveal.tsx` as a pointer-events-free Coach Timeout toast with compact blitz mode and expanded tactical notes for longer modes.
69. Updated `src/components/BbtiQuiz.tsx` so binary and multi answers show short tactical feedback, final answers still go straight to results, and save-on-exit uses the latest submitted draft snapshot.
70. Extended `src/data/bbti-playbook.ts` with `filmRoomClips`, built from decisive answers plus `getBbtiAnswerReveal` data while keeping the older `decisiveAnswers` field available.
71. Added `src/components/BbtiFilmRoomClips.tsx` and replaced the inline key-answer list with selectable Film Room clips and a copyable single-clip share action.
72. Extended `src/lib/bbti-deep-links.ts` with validated `clip` parsing/building, while clearing stale `clip` state from compare links.
73. Added compact Film Room clip keys such as `q13-a` and `q2-m0.2`, plus shared-clip reconstruction from the BBTI question bank.
74. Added `src/components/BbtiShareCard.tsx` as a compact scouting-style preview for BBTI result sharing.
75. Extended `src/components/BbtiShareKits.tsx` with a `preview` slot so card preview and copy kits share the same anchored section.
76. Updated `src/components/BbtiResult.tsx` to embed the share card inside `bbti-share` and removed the old standalone bottom share button.
77. Kept the share card to code-stable fields: code, emoji, type name, tagline, spirit player, debate weapon, primary challenge title, and canonical `?bbti=CODE` URL.
78. Updated `src/components/BbtiShareKits.tsx` so copied links use a clean page base instead of inheriting unrelated query parameters.
79. Added `minmax(0, 1fr)`, `min-w-0`, truncation, and break-word guards around the share-card and share-kit text areas.
80. Added `src/data/bbti-share-card-presets.ts` with hand-written card headlines, badges, captions, and group-chat hooks for all 16 BBTI codes.
81. Updated `src/components/BbtiShareCard.tsx` so card visuals and copied text include the code-stable preset identity and 发群问题.
82. Added `buildBbtiCompareInviteUrl(codeA)` in `src/lib/bbti-deep-links.ts` so invite links use `?a=CODE` without an invalid empty `b`.
83. Added a Share Kit "拉朋友对比" option and made Share Kit link generation choose between result URLs and compare-invite URLs.
84. Updated `src/components/BbtiCompare.tsx` invite copying to use canonical compare-invite URLs and clipboard failure handling.
85. Added a Return Bench "拉朋友双人对比" copy action for returning BBTI players.
86. Added `src/components/BbtiFilmRoomAmmo.tsx` to package the active Film Room clip, Coach Timeout notes, primary challenge, structured receipts, and a `bbti+clip+challenge` URL.
87. Updated `src/components/BbtiFilmRoomClips.tsx` to render opening-court ammo under the active clip without owning challenge selection.
88. Updated `src/components/BbtiResult.tsx` to pass the result type identity, primary challenge, and challenge opener into Film Room.
89. Updated `src/components/BbtiResultActionDock.tsx` with a 录像室 jump target.
90. Kept Film Room ammo copy on existing URL parameters only, avoiding fake crowd percentages or new deep-link protocol.
91. Added `src/data/bbti-film-room-cross-exams.ts` as a pure resolver for question-specific and pole-fallback cross-exam prompts.
92. Covered high-share Film Room questions across highlight, evidence, hero-vs-system, loyalty, and ring-window debates.
93. Updated `src/components/BbtiFilmRoomAmmo.tsx` to show the reviewed standard, cross-exam question, and counterpunch in both UI and copied ammo text.
94. Added `src/data/bbti-film-room-contradictions.ts` as a pure resolver for Film Room sample tensions, using `coachTimeout.poles[]` instead of string parsing.
95. Added `src/components/BbtiFilmRoomContradictions.tsx` to render copyable self-check cards between Coach Timeout and Opening Ammo.
96. Updated `src/components/BbtiFilmRoomClips.tsx` so the Film Room flow is clip evidence, sample-tension self-check, then shareable opening ammo.
97. Added `src/components/BbtiChallengeAmmoSwitcher.tsx` as a controlled lane selector for the three BBTI challenge recommendations.
98. Updated `src/components/BbtiResult.tsx` to pass all challenge lanes into Film Room, while preserving the primary challenge for Share Kit and scouting card copy.
99. Updated `src/components/BbtiFilmRoomClips.tsx` so copied `bbti+clip+challenge` links restore the selected lane and feed it into `BbtiFilmRoomAmmo`.
100. Added `src/components/BbtiCounterEvidenceCard.tsx` to render a compact opponent-evidence card from the active clip, selected challenge, and resolved cross-exam.
101. Updated `src/components/BbtiFilmRoomClips.tsx` so the flow is lane selector, counter evidence, then Opening Ammo.
102. Updated `src/components/BbtiFilmRoomAmmo.tsx` to accept an optional pre-resolved cross-exam, keeping Film Room's active clip interpretation consistent across cards.
103. Added `src/data/bbti-counter-evidence-presets.ts` as a pure resolver for counter-evidence framing, evidence fallback, question fallback, and source tracing.
104. Updated `src/components/BbtiCounterEvidenceCard.tsx` to consume the resolver and display a source label instead of owning evidence-selection logic.
105. Changed counter-evidence question fallback to prefer the active Film Room cross-exam, keeping it aligned with Opening Ammo's standard review.
106. Added `src/data/bbti-counter-evidence-facts.ts` as a provenance wrapper around existing structured challenge evidence.
107. Updated `src/data/bbti-counter-evidence-presets.ts` to pick evidence through fact records and preserve `factId`, `sourceId`, and original challenge field tracing.
108. Avoided adding any new NBA facts or source URLs while preparing the data shape for future manual source review.
109. Added `src/data/bbti-counter-evidence-sources.ts` as an empty verified-source registry for future `sourceId` lookup.
110. Added source metadata types for `sourceTier`, `evidenceType`, `riskLevel`, `verificationStatus`, freshness dates, and manual/script review.
111. Added a pure source-record validator that rejects non-HTTPS URLs, non-allowlisted hosts, invalid dates, and non-verified records.
112. Added `scripts/validate-bbti-counter-evidence-sources.mjs` and `npm run validate:bbti-sources` as an offline AST-based validator for duplicate source IDs, source metadata, allowlisted HTTPS hosts, stale moving-total dates, and fact `sourceId` references.
113. Added `src/data/bbti-persona-extension.ts` as a deterministic second-layer report for locker-room role, coach usage, group-chat trigger, and clutch-possession tendency.
114. Added `src/components/BbtiPersonaExtension.tsx` and placed it on the result page between the base personality report and lineup chemistry, with copyable二层球探报告 text.
115. Added `src/data/courtside-advisor.ts` and `src/components/CourtSideAdvisor.tsx` so every post-vote debate round now gets a basketball-native sideline read, replay counterpoint, next-question prompt, and copyable text.
116. Rewrote Vote Reveal minority/majority callouts away from generic insults and into basketball language such as 少数派替补席, 教练挑战, 包夹论点, and 加时.
117. Added a stable `bbti-persona-extension` result-page anchor and Action Dock entry so the new二层报告 is reachable from the sticky navigation.
118. Added `src/data/bbti-challenge-case.ts` as a lightweight Film Room case-context model with copy text for Q-level BBTI evidence, cross-exam standard, counterpunch, and selected challenge matchup.
119. Added `src/components/BbtiChallengeCaseBanner.tsx` and surfaced it on Pick Side and BattleArena so "用这题开战" carries the original BBTI录像室案由 into the real vote flow.
120. Extended `GameProvider.selectMatchup` and `BbtiFilmRoomAmmo` so only Film Room challenge launches carry case context, while normal matchup, custom matchup, return, and BBTI navigation clear it.
121. Updated `CourtSideAdvisor` to read Film Room case context when present, turning post-vote feedback into a self-consistency check against the original BBTI cross-exam standard.
122. Added `src/components/BbtiShareTargetPicker.tsx` as a Share Kit control surface with target switching, exact URL preview, native share fallback, copy-current, and copy-all actions.
123. Updated `BbtiShareKits.tsx` so result-card, challenge, and compare-invite links all reuse the same URL builder before rendering both the target picker and individual copy cards.
124. Added visible Share Target link labels so users can distinguish stable code-only result links, challenge links, and compare-invite links before sharing.
125. Football comparison confirmed the share pattern should keep `?bbti=CODE` as the canonical result link, reserve `challenge` for约战回流, and use system share with clipboard fallback.
126. Extended BBTI challenge case context into a source-discriminated model for Film Room cases and result-page challenge cases, avoiding fake Q fields on result-origin recommendations.
127. Updated `BbtiChallengeReceiptBoard.tsx` so result-page "命定对线" launches carry赛后报告案由, recommendation reason, pressure question, evidence lens, and challenge matchup into Pick Side and BattleArena.
128. Cleared basketball-facing football residue by replacing visible "足球 MBTI" and "球友" copy with basketball-native cross-project and搭档 language.
129. Updated `BbtiDeepLinkNotice.tsx` so shared `?bbti=CODE&challenge=...` links can rebuild a result-origin case context from the current code's challenge fixture before "接受挑战".
130. Kept the shared challenge回流 fail-safe: if the challenge fixture cannot be rebuilt, the notice still opens the matchup ID-only instead of inventing or serializing case JSON in the URL.
131. Basketballized the shared challenge notice copy into 赛后约战/接受加赛 language and surfaced pressure questions plus evidence tags when a result case context is recoverable.
132. Extended `BbtiChallengeCaseContext` with `source: "arena-event"` so Game 7, trade-deadline, and rebuild-year scenarios can carry their pressure test into Pick Side and BattleArena.
133. Updated `BbtiArenaEvents.tsx` so "拿这个题开战" passes event-derived case context only when the recommended challenge lane matches the active event category; fallback launches remain ID-only.
134. Added `src/data/bbti-shared-challenge-hydration.ts` to centralize `bbti + event + challenge` recovery, preferring arena-event context and safely degrading to result-origin context.
135. Updated `BbtiDeepLinkNotice.tsx`, `BbtiChallengeCaseBanner.tsx`, `CourtSideAdvisor.tsx`, and `courtside-advisor.ts` to switch on all case sources instead of treating non-Film-Room cases as one shape.
136. Replaced the playbook's cross-project field with `nextPlayChallenge`, turning the result-page fourth tactical card into a basketball-native主场/客场/抢七 challenge prompt.
137. Removed the remaining user-facing code residue that asked whether the user was watching basketball or football.
138. Added `src/lib/debate-deep-links.ts` as a separate ordinary-debate deep-link parser/builder for `mode=debate&matchup=ID`, with fixed and custom matchup ID validation.
139. Updated `src/app/page.tsx` so ordinary debate links open directly to Pick Side after BBTI result and BBTI compare links get first priority.
140. Updated `src/components/Result.tsx` with a same-match replay card, stable replay URL preview, system share/copy text, and lighter "同场复盘" language that stays separate from BBTI case context.
141. Updated BBTI URL builders to delete `mode` and `matchup`, preventing ordinary debate replay parameters from leaking into BBTI result or compare share links.
142. Added `src/data/bbti-answer-polls.ts` as a deterministic local-simulation layer for BBTI answer feedback, with `source: "local-simulation"` and no real vote claims.
143. Extended Coach Timeout answer reveals with an explicitly labeled 模拟看台风向 meter, approximate percentages, basketball seat labels, and compact blitz behavior that hides longer callouts.
144. Verified the answer-poll layer has no football/VAR/FUT copy and only mentions real-user language inside the required "本地模拟，不代表真实用户投票" disclaimer.
145. Added `src/data/bbti-answer-poll-presets.ts` with hand-written local-simulation poll copy for high-share BBTI questions Q1, Q2, Q5, Q13, Q14, Q15, Q16, Q22, Q25, Q26, Q29, Q38, Q39, Q42, and Q44.
146. Updated `bbti-answer-polls.ts` so presets resolve before the generic hash generator, while keeping the same `source: "local-simulation"` and disclaimer contract.
147. Kept poll preset copy basketball-native and deterministic: no real counts, no全站/实时/user-count language, and no football/VAR/FUT residue.
148. Changed binary fallback answer polls to use a shared question-level split, so A/B answers mirror each other instead of both independently looking like majority or minority choices.
149. Tightened preset semantics after Agent review: Q1 now uses火力高光席, Q2/Q14/Q29/Q42 multi-choice dissent labels are grouped as "other answers", and Q25 now frames personal peak versus team title instead of last-shot responsibility.
150. Added `src/components/BbtiAnswerPollTrend.tsx` for a result-page aggregate local-simulation trend, hidden when no answer history is available so reopened `?bbti=CODE` links do not fake a trend.
151. Placed the trend under the four-dimension report as a compact supplement with simulated label, average tendency, and顺风/拉锯/逆风 counts.
152. Added a copyable看台报告 that includes the strongest and toughest simulated rounds plus top seat distribution, keeping those details out of the visual UI.
153. Added `src/data/bbti-share-target-presets.ts` as the Share Kit target contract layer for群聊战报, 挑衅开场, 直接约战, 双人对比, 个人动态, 今日复盘, and回访对比 metadata.
154. Moved Share Kit copy generation and link labels into the preset/data layer so `BbtiShareKits` no longer hard-codes target-specific link semantics.
155. Updated `BbtiShareTargetPicker` with audience chips, intent copy, action-specific button labels, boundary notes, and a cleaner native-share cancel fallback.
156. Fixed Return Bench daily-event sharing to build URLs from a clean page base instead of inheriting stale query parameters from the current URL.
157. Compressed the Share Kit's secondary cards into a compact快速复制替补席 so the target picker remains the primary share composer instead of showing two competing share systems.
158. Kept quick-copy entries to target name, link badge, one-line intent, and copy status, reducing result-page height without removing one-tap copy paths.
159. Tightened the Share Kit hierarchy after Agent review: the section is now a分享战术板, `BbtiShareTargetPicker` is the主分享目标, and quick copy is a low-height chip row without intent text.
160. Extended `src/data/bbti-film-room-cross-exams.ts` with question-level Film Room cross-exams for Q10, Q12, Q23, Q31, Q33, Q41, Q45, Q48, and Q50.
161. Verified the previous P1 Film Room target list now has question-level coverage for Q10, Q12, Q17, Q19, Q23, Q31, Q33, Q41, Q45, Q48, and Q50.
162. Kept the new Film Room prompts deterministic and source-free: no new NBA facts, external URLs, live data, or real-vote claims were added.
163. Agent review confirmed the new prompts are framed as question-specific录像室案由, including最后两分钟账本, 中锋证据互审, 第一选择责任书, 奖项定义开庭, 路线成本账, and制度题分账.
164. Completed question-level Film Room cross-exam coverage for every non-open BBTI question, including the remaining Q2, Q4, Q6, Q7, Q8, Q9, Q11, Q18, Q21, Q24, Q26, Q28, Q34, Q36, Q44, Q46, and Q47 gaps.
165. Added `scripts/validate-bbti-film-room-cross-exams.mjs` and `npm run validate:bbti-film-room` to enforce that every binary/multi question has a valid question-level Film Room cross-exam.
166. Extended `src/data/bbti-arena-events.ts` beyond the original three events with finals adjustment, media-day pressure, road back-to-back, and locker-room conflict scenarios.
167. Added deterministic daily Arena Event selection with `getBbtiTodayArenaEventId`, plus `court`, `stakes`, and context metadata so result-page events feel like playable cases rather than static copy.
168. Updated `BbtiArenaEvents` with compact context filters, a 今日复盘 entry, stable `event+challenge` copy links, and visible court/stakes tags while continuing to reject invalid event ids.
169. Unified `BbtiReturnBench` with the same daily-event selector so returning users, result-page replay, and shared event links use one deterministic source of truth.
170. Football MBTI comparison recommended keeping the basketball side more advanced and only borrowing structural ideas: Featured Clash style entry points, venue/pressure framing, and event-aware share回流, without importing football/FUT/VAR language.
171. Added machine-readable Arena Event fields: `venue`, `pressureTier`, and `audienceFrame`, separating space, pressure level, and audience lens from display copy.
172. Added Arena Event lens filters for主场身份, 客场质疑, 淘汰压力, and舆论复盘 so the result page can be replayed by basketball pressure angle, not only by event type.
173. Agent review tightened the new taxonomy: `finals-adjustment` is high-pressure road skepticism rather than an elimination game, and detail chips now use pure venue labels plus separate audience-frame labels to avoid duplicate phrasing.
174. Added an `arena-event` Share Kit target that uses the current Arena Event plus its matching challenge lane to produce a `bbti+event+challenge`回流 link.
175. Updated `BbtiArenaEvents` to report the active share event to `BbtiResult`, and guarded the report so only category-matched event/challenge pairs can become Arena Event share links.
176. Updated `BbtiResult` and `BbtiShareKits` so the main share composer prioritizes事件约战 when a valid active Arena Event exists, while ordinary result, challenge, duo, and receipt targets remain available.
177. Football comparison confirmed the right structure is result identity card -> share text -> next-game recommendation -> result-page回流, not direct entry into complex battle state or football/FUT/VAR copy.
178. Added `scripts/validate-bbti-arena-events.mjs` and `npm run validate:bbti-arena-events` to statically validate Arena Event ids, required fields, label coverage, lens filters, recommended categories, key semantic pairings, and forbidden football/live-vote copy.
179. Agent review tightened the validator rules: group-chat prompts must carry `code`, elimination pressure is bidirectional with the elimination audience frame, off-court events cannot use主场/客场/中立球馆 court copy, and canonical events retain fixed basketball semantics.
180. Added a compact分享同步 micro-state inside `BbtiArenaEvents` so users can see when the current event has been written into the Share Kit's事件约战 target.
181. Added a secondary 查看分享包 jump from the active Arena Event card to `#bbti-share`, while unmatched event/challenge lanes show a non-promissory fallback state instead of implying event回流 exists.
182. Football comparison recommended short, local, reversible feedback: borrow the structure of copied/share status, but keep basketball wording such as分享战术板, 加赛, 回合, and球探报告.
183. Updated `BbtiShareTargetPicker` with stable Share Kit status labels, target `aria-pressed`, a labelled target group, and a polite atomic status region for copied/shared/failed feedback.
184. Added operation-id guards and timeout cleanup in `BbtiShareTargetPicker` so stale native-share or clipboard callbacks cannot repaint the wrong target after the user switches share lanes.
185. Football comparison confirmed the Share Kit should keep the basketball structure and vocabulary: 战术板, 战报, 出手, 命中, 加赛, 复盘, and球探报告, without importing football/FUT/VAR semantics.
186. Updated `BbtiCompare` with guarded clipboard feedback, timeout cleanup, and a polite copy-status region for duo reports and compare-invite links.
187. Added a one-click交换 A/B 对位 control to the BBTI duo report so friends can flip perspective without retyping both codes.
188. Tightened compare-share URLs to use the canonical page base before adding `a` and `b`, keeping duo links separate from stale result, event, clip, or matchup query state.
189. Agent review found the `?a=CODE` invite path was identity-sensitive: receivers should see `TA` already on court and fill their own code, not see the inviter labelled as `你`.
190. Updated `BbtiCompare` invite handling so single-code deep links label A as `TA`, label the empty slot as `你`, show the inviter's type in the empty state, and offer last-result fill or retest for the receiver.
191. Restricted compare swapping to two valid codes and made the swap also exchange the visible owners, preventing single-code invite links from losing their invite CTA.
192. Added an explicit Quick Fill target selector in `BbtiCompare`, so code chips write to `你`, `TA`, or `朋友` intentionally instead of silently switching once A becomes valid.
193. Football comparison recommended the compare page rhythm "化学反应 -> 更衣室复盘 -> 四维对位复盘 -> 邀请分享"; the basketball page now uses that structure without importing football/FUT/VAR language.
194. Added per-link dismissal to `BbtiDeepLinkNotice`, keyed by BBTI code, challenge matchup, event id, and clip key, so dismissed shared加赛 banners do not keep reappearing for the same canonical URL.
195. Capped dismissed deep-link notice history and made storage failure non-blocking, keeping the接受加赛 CTA available even in private-mode or restricted-storage browsers.
196. Added an accessible close control to the shared加赛 notice while preserving the event pressure line, evidence lenses, and explicit进场 action.
197. Moved `BbtiDeepLinkNotice` ahead of the MyTEAM card so shared challenge/event links surface the next-play CTA before the ordinary result collectible card.
198. Added a compact Case Preview to `BbtiDeepLinkNotice` that shows event scenario plus pressure test, Film Room cross-exam prompt, or result challenge案由 before users enter the matchup.
199. Football comparison confirmed the right deep-link loop is minimal URL state -> result bootstrap -> clear basketball CTA, using球探报告, 录像室, 对位加赛, and教练挑战 rather than football/FUT/VAR language.
200. Added `aria-labelledby` and `aria-describedby` wiring to `BbtiDeepLinkNotice`, binding the shared加赛 section to its title, explanation, and Case Preview.
201. Moved the shared notice close button after the content in DOM order while keeping it visually pinned, so keyboard users encounter the case text and进场 CTA before the dismiss control.
202. Added focus handoff after dismissing `BbtiDeepLinkNotice`, sending focus to the next actionable element instead of leaving it on a removed button.
203. Made the shared加赛 notice respect `prefers-reduced-motion` by skipping its fade-up animation when reduced motion is requested.
204. Extended `BbtiDeepLinkNotice` descriptions to include the pressure line, so assistive tech gets the same decision-critical context as sighted users.
205. Tightened shared notice CTA copy and `aria-label`s to read as standalone actions such as接这场情境加赛 and带案由接加赛 with the matchup title included.
206. Enlarged shared notice touch targets to at least 44px and added filtered focus fallback handling, skipping hidden/inert elements before focusing the next control or the result card.
207. Added a collapsed恢复入口 for dismissed `BbtiDeepLinkNotice` banners, so users can reopen the shared加赛案由 instead of permanently losing the deep-link context.
208. Restoring a dismissed shared notice removes only the current canonical key from local storage and moves focus back to the restored notice heading.
209. Agent review tightened the dismissed-state UI into a lower-priority pill, changed the restore action to显示加赛提示, and moved post-dismiss focus directly to that restore button.
210. Upgraded dismissed notice storage to a v2 URL-encoded canonical key so future custom matchup ids such as `custom:*` do not collapse into the same dismissed state.
211. Added a secondary进场选边 action to the dismissed shared notice pill, so users can directly accept the recovered deep-link matchup without reopening the full案由 first.
212. Updated `BbtiResultActionDock` with active-section highlighting, so the sticky result nav tracks whether users are reading球探卡, 四维诊断, 二层报告, 录像室, 开庭挑战, or分享包.
213. Agent review replaced the initial observer approach with dock-bottom scroll tracking, avoiding stale or jittery active states when multiple sections intersect during fast scrolling.
214. Added `aria-current="location"`, `aria-controls`, a labelled section nav, and active-chip auto-centering to the Action Dock so the current section is visible and readable on mobile.
215. Added dynamic Action Dock offset measurement with `ResizeObserver` and CSS variable scroll margins, so jumps account for the sticky dock's actual height rather than a fixed guess.
216. Extracted reduced-motion-aware `scrollToSection` into `src/lib/scroll-to-section.ts` and reused it from both the Action Dock and Arena Event share jump.
217. Added `src/lib/use-guarded-clipboard.ts` as a shared guarded clipboard hook with operation ids, timeout cleanup, copied/failed action ids, and manual fallback text for blocked clipboard writes.
218. Refactored `BbtiShareKits` quick-copy chips to use the shared guarded clipboard hook instead of maintaining separate copied/failed timers.
219. Refactored `BbtiCompare` report and invite copying to use the shared guarded clipboard hook while preserving manual-copy fallback text for failed copy attempts.
220. Added a Quick Copy manual fallback textarea in `BbtiShareKits`, so blocked clipboard writes still expose the exact战术板文案 for long-press copy.
221. Football comparison confirmed the copy-feedback rhythm should stay short, local, and reversible, borrowing timing structure from FBTI while keeping basketball copy such as战术板, 加赛, and球探报告.
222. Added `src/components/BbtiManualCopyFallback.tsx` so blocked clipboard writes share one basketball-native manual-copy textarea instead of each copy surface owning duplicate fallback markup.
223. Refactored `BbtiShareCard` to use the guarded clipboard hook for both球探卡战报文案 and result-link copying, with visible fallback text when clipboard access is blocked.
224. Refactored `BbtiFilmRoomClips` clip-copy action to use the guarded clipboard hook and clear stale copy feedback when switching clips.
225. Updated `BbtiShareKits` Quick Copy to reuse the shared manual-copy fallback component while keeping its existing战术板 fallback wording.
226. Added `src/components/BbtiResultTabs.tsx` as a basketball-native赛后节目单 that groups the result page into 球探卡, 录像室, 开庭挑战, and发群包 without hiding or renaming existing section anchors.
227. Refactored `BbtiResultActionDock` to use the赛后节目单 as the primary sticky navigator, while preserving high-priority next-play actions for命定开战, 自选审判局, 双人对比, and分享包.
228. Added deep-link-aware initial section activation so hash links win first, Film Room clip links activate录像室, event links activate情境加赛, and challenge links activate开庭挑战.
229. Added a stable `bbti-arena-events` anchor and kept result section tracking in DOM order so the active节目单 state stays aligned while scrolling.
230. Replaced remaining BBTI/matchup-facing football carryover labels such as德比 and主客场 with basketball-native wording like宿命局 and场馆.
231. Added a shared-clip return state to `BbtiFilmRoomClips`, so `?bbti=CODE&clip=...` links reconstructed without local answers visibly show分享回放, do not imply a full answer sheet, and include that source boundary in copied clip text.
232. Added one-time result-page entry scrolling for explicit section hash links and Film Room `clip` links, so shared录像室回放 links land on the reconstructed clip area after SPA bootstrap without forcing plain `?bbti=CODE` result links away from the top.
233. Football comparison confirmed basketball should keep the granular `bbti + clip + optional challenge + #bbti-film-room` return loop instead of copying football's broader share-return-to-debate pattern.
234. Extended BBTI deep-link parsing with `hasClipParam` and `rawClip`, so malformed Film Room links can still render a recovery explanation instead of silently dropping the录像室 section.
235. Updated `BbtiFilmRoomClips` unrecovered-link state to distinguish bare question links from malformed clip keys, while keeping the copy explicit that missing answer options cannot rebuild a full clip.
236. Split Film Room clip parsing into recoverable full keys such as `q12-a`/`q12-m0.2` and question-only hints such as `clip=12`/`clip=q12`, so bare question links can select local clips without pretending to reconstruct shared answer data.
237. Added `scripts/validate-bbti-deep-links.mjs` and `npm run validate:bbti-deep-links` to lock the parser contract for full clip keys, question-only links, malformed clips, and ordinary result URLs.
238. Added a visible manual-copy fallback to `BbtiShareTargetPicker`, so main share targets and full战术板 copy still expose the exact payload when clipboard fallback fails after native share is unavailable or rejected.
239. Extended `BbtiManualCopyFallback` with neutral and error tones, letting the main Share Target picker show an always-available manual-copy panel without presenting the normal fallback path as an error.
240. Football comparison confirmed basketball's main share fallback now exceeds football's button-label-only failure pattern by exposing the actual share payload while keeping `AbortError` as a silent cancellation.
241. Refactored `BbtiReturnBench` daily-event and duo-invite copy actions onto the shared guarded clipboard hook, with per-action status and manual-copy fallback text for returning-player share failures.
242. Added `type="button"` and an `aria-live` status region to `BbtiReturnBench`, so returning-player copy feedback is announced without relying only on button text changes.
243. Extended `validate:bbti-deep-links` with URL-builder cases that assert Return Bench daily-event and duo-invite links strip stale `a`, `b`, `clip`, `mode`, and matchup parameters.
244. Football comparison confirmed Return Bench should stay basketball-native: last-result identity, daily event, challenge lane, and duo invite remain separate intents rather than a generic football-style result share.

## Next Add Files Suggestions

1. `src/data/bbti-rivalries.ts`
   - Add richer type-vs-type matchup scripts.
   - Include compatibility, rivalry, and group-chat conflict lines for all 16 x 16 pairings.

2. `src/components/BbtiShareImageExport.tsx` or `src/lib/share-card-export.ts`
   - Add only after choosing a browser-safe image export library or native screenshot strategy.
   - Keep export/copy controls outside the visual card so screenshots stay clean.
   - Preserve basketball scouting-card language instead of importing football/FUT copy.

3. `src/data/bbti-share-target-presets.ts`
   - Extend the existing target contract with optional platform variants for group chat, profile feed, and direct challenge after the compact Share Target picker stabilizes.
   - Keep URLs code-stable unless the target is explicitly a clip, event, challenge, or compare-invite link.
   - Avoid platform-specific claims that require runtime detection; keep output deterministic and basketball-native.
   - Consider adding a display-order field if quick-copy priority should differ from the main composer order.

4. `src/data/bbti-film-room-cross-exams.ts`
   - Coverage is now complete for all binary/multi BBTI questions; use `npm run validate:bbti-film-room` to prevent regressions.
   - Next step is quality review rather than raw coverage: tighten overly generic prompts and add optional matchup hooks only when a question has a natural challenge matchup.
   - Keep every prompt deterministic, source-free, and tied to the exact question scenario rather than a generic pole fallback.

5. `src/data/bbti-film-room-standard-map.ts`
   - Add question-level standard metadata only if the result page later stores or reconstructs more than the top three Film Room clips.
   - Use fields like category, axis, tribeMap, mainstream, and underdog to detect full-answer standard drift without overloading current clip copy.
   - Keep basketball-native language: 数据证据, 名场面记忆, 巨星接管, 体系解题, 主队忠诚, 冠军窗口.

6. `src/data/bbti-persona-extension-presets.ts`
   - Add hand-written overrides for the most shareable BBTI codes once the deterministic二层报告 pattern is proven.
   - Keep the default generator as fallback so reopened `?bbti=CODE` links still work without answer history.
   - Add only basketball-native language: 更衣室, 教练板, 最后两分钟, 主队身份, 冠军窗口.

7. `scripts/check-bbti-counter-evidence-source-urls.mjs`
   - Add only after verified source records are registered.
   - Keep this separate from `npm run validate:bbti-sources` because it needs network access and should check status codes, redirects, and canonical hosts.
   - Use official NBA, Basketball Reference, or other allowlisted source pages only; never auto-fill URLs from search snippets.

8. `src/data/bbti-answer-poll-trend-presets.ts`
   - Add only if result-page trend labels need hand-written overrides beyond the current deterministic aggregation.
   - Keep presets scoped to local-simulation framing, such as逆风硬解, 顺风主场, 拉锯体质, and弱侧埋伏.
   - Do not add live, global, real-user, or full-site vote language; keep shared `?bbti=CODE` pages answer-history safe.

9. `src/data/courtside-advisor-presets.ts`
   - Add matchup-specific sideline reads for fixed debates after the generic topic-lens helper proves useful.
   - Keep presets as tactical prompts, not new factual claims; reuse Replay Center and source registries for any hard evidence.

10. `src/components/BbtiChallengeCaseTrail.tsx`
   - Baseline now ships as a session-local BattleArena breadcrumb after each case-context vote.
   - It shows which BattleArena votes are responding to the original Film Room, Result, or Arena Event案由 and allows returning through the existing short `bbti+clip/event+challenge` URL.
   - Keep it session-local unless a future deep-link schema explicitly supports full case recovery.

11. `src/components/DebateReplayShareCard.tsx`
   - Extract the ordinary result-page replay-link card if more share targets or visual variants are added.
   - Keep copy short: score, persona label, one group-chat question, and the same-match replay URL.
   - Do not mix BBTI case context into ordinary debate replay cards.

12. `src/data/bbti-arena-events.ts`
   - Event coverage now includes finals pressure, media day, road back-to-back, and locker-room conflict, with deterministic daily rotation via `getBbtiTodayArenaEventId`.
   - Machine fields now cover `venue`, `pressureTier`, and `audienceFrame`; use these instead of parsing display copy for future filters.
   - Validation now exists through `npm run validate:bbti-arena-events`; run it after changing event data, labels, lens filters, or recommended categories.
   - Keep event URLs explicit with `event` and `challenge`; never rely on receiver-side daily rotation to reconstruct a shared case.

11. `src/components/BbtiCompare.tsx`
   - Let two friends enter BBTI codes and generate a head-to-head chemistry report.

12. `src/data/football-mbti-imports.ts`
   - Create this only after the football MBTI source files are restored or copied into this workspace.
   - Map football concepts such as derby, captain, ultras, and tournament pressure into basketball-native equivalents.

13. `src/store/gameStore.ts`
   - Migrate `GameProvider` state to a persisted store.
   - Derive scores from votes instead of storing score counters separately.

12. `src/components/ReplayCenter.tsx`
   - Next step: add tabs for stat bomb, film-room note, and crowd vote.

13. `src/data/matchup-rivals.ts`
   - Next step: expand known-rival notes into matchup-specific opening lines and suggested first debate topic.
   - Add more metadata for teammate history and playoff meeting history.

14. `src/components/MyTeamResultCard.tsx`
   - Next step: add screenshot/export affordance and optional compact mobile share variant.
   - Consider adding a back-of-card view with decisive answers, type axes, and debate receipts.

15. `src/data/matchup-memes.ts`
   - Add fixed matchup taglines, banned phrases, and roast seeds by matchup.
   - Replace remaining Kobe/LeBron-specific generic roast wording for custom matchups.

16. `src/components/Landing.tsx`
   - Add a Featured Clash first-screen panel inspired by football MBTI.
   - Provide direct CTAs for 科詹 GOAT 法庭, BBTI, and 自选两位球星.

17. `src/data/bbti-challenges.ts`
   - Add more nuanced challenge selection for all 16 BBTI codes.
   - Include one同温层 matchup, one反向审判 matchup, and one破防加赛 matchup per type.

18. `src/components/BattleArena.tsx`
   - Add keyboard shortcuts for vote left/right and next round.
   - Add a compact "read mode" toggle that freezes all timers.

19. `src/components/BattleArena.tsx`
   - Next step: extract the two debate side cards into `DebateSideCard.tsx`.
   - This would keep accessibility, shortcut labels, and card layout in one reusable place.

20. `src/data/matchup-tags.ts`
   - Add `featuredCopy`, `primaryCta`, and `shareSeed` fields so Landing, MatchupSelect, and Result can share the same matchup language.

21. `src/components/VoteReveal.tsx`
   - Add a compact "本局 vs 主战场" toggle once enough scoped matchup votes exist.

22. `src/components/DebateSideCard.tsx`
   - Next step: add optional evidence drawer for stat bombs, quote receipts, and matchup-specific banned phrases.
   - Keep the card responsible for side visuals and accessibility semantics only.

23. `src/data/bbti-challenges.ts`
   - Next step: make all 16 BBTI codes explicit fixtures with hand-written reasons.
   - Add share copy per lane so each recommendation can be posted directly into a group chat.

24. `scripts/validate-bbti-fixtures.ts`
   - Convert the current manual fixture check into a repeatable validation script.
   - Assert 16 codes, 48 lanes, three unique categories per code, valid matchup ids, and evidence coverage for every fixed challenge.

25. `src/components/BbtiChallengeReceiptBoard.tsx`
   - Extract the challenge-card evidence UI once the card grows beyond the result page.
   - Reuse it in Return Bench, shared challenge notices, and future compare reports.

26. `src/data/bbti-challenge-sources.ts`
   - Track official or stable source URLs for iconic moments and receipts.
   - Keep source notes outside the UI while making future fact review faster.

27. `src/components/BbtiArenaEvents.tsx`
   - Event-aware Share Kit handoff now exists and only reports category-matched event/challenge pairs.
   - The visual分享同步 micro-state now exists and can jump to the Share Kit without auto-scrolling.
   - Keep filter state local unless there is a specific need to share a filtered list; deep links should continue to share concrete events rather than UI filter state.
   - Next step: let event-specific share URLs hydrate the active event directly from router state instead of only local component bootstrap.

28. `src/lib/bbti-deep-links.ts`
   - Extend parsing to debate-mode links such as `?mode=debate&matchup=kobe-vs-lebron&from=bbti`.
   - Add helpers for share kits, arena events, and direct challenge links.

29. `src/components/BbtiReturnBench.tsx`
   - Daily-event and duo-invite copy actions now use the shared guarded clipboard hook and expose manual-copy fallback text when clipboard access fails.
   - Copy status is now announced through a small `aria-live` region, and buttons are explicitly typed as buttons.
   - Add return-player streaks and last opened challenge receipts.
   - Consider surfacing the daily event deep link as a visible compact share pill.

30. `src/data/bbti-share-kits.ts`
   - `arena-event` now takes priority when the result page has a valid active event and matching challenge lane.
   - Next step: add type-specific hand-written share scripts for all 16 BBTI codes.
   - Add separate copy variants for group chat, profile captions, and direct challenge invite without platform-specific runtime claims.

31. `src/components/BbtiShareKits.tsx`
   - The target picker now remounts when the available share target set changes, so an active Arena Event can become the first main target.
   - The main Share Target picker now exposes the active target payload in a neutral manual-copy panel, so URL and copy transparency are already visible in the primary share flow.
   - Next step: add a collapsed/compact mode only if the always-visible manual-copy panel proves too tall on smaller phones.

32. `src/components/BbtiShareTargetPicker.tsx`
   - Current feedback uses guarded operation ids, timeout cleanup, target reset on lane switch, and a live status region.
   - Clipboard fallback failures now render the shared manual-copy textarea while preserving native share cancellation behavior.
   - A neutral manual-copy panel is now visible even before failure, so users can copy the current主分享目标 when system share is unreliable.
   - A shared guarded clipboard hook now exists for simpler copy-only flows; keep this component's native share fallback separate unless it can adopt the hook without weakening target-switch guards.
   - Keep status labels short and reversible; avoid football/FUT/VAR language when borrowing feedback patterns from the football MBTI project.

33. `src/components/BbtiDeepLinkNotice.tsx`
   - Dismissal now exists per URL-encoded concrete `bbti+challenge+event+clip` notice and is remembered locally with a bounded history.
   - A compact dismissed-state restore pill now lets users reopen the same shared加赛提示 or go straight to进场选边 after hiding it, and post-dismiss focus lands on the restore button.
   - Case Preview now gives shared links event, Film Room, or result-case context before users enter the matchup.
   - Accessibility wiring now includes labelled/described section semantics including pressure context, standalone CTA labels, 44px touch targets, DOM-order-friendly dismiss placement, post-dismiss focus fallback, and reduced-motion handling.
   - Next step: track whether users prefer显示加赛提示 or进场选边 before adding more actions to this low-priority pill.
   - Add richer matchup receipts once `matchup-memes.ts` gains iconic moments.

34. `src/lib/bbti-deep-links.ts`
   - Add unit-style coverage for parsing precedence between `bbti`, `event`, `challenge`, `a`, and `b`.
   - Extend result URLs with optional source labels such as `from=share-kit` or `from=return-bench`.

35. `src/components/BbtiCompare.tsx`
   - Clipboard failure handling and guarded feedback now exist for copied duo reports and invite links.
   - A one-click交换 A/B 对位 control now lets users flip compare perspective without retyping both codes.
   - Invite receivers now see `TA` as the prefilled side and `你` as the open slot, with single-code swap disabled until both codes are valid.
   - Quick Fill now has an explicit target selector, and clipboard failures expose a manual copy textarea.
   - Current report layout is split into化学反应, 更衣室复盘, 四维对位复盘, and邀请分享 for a stronger result-to-share rhythm.
   - Duo report and invite copy now use the shared guarded clipboard hook.
   - Next step: migrate other single-action copy modules to the hook only when doing nearby feature work, not as a standalone churn pass.

36. `src/lib/use-guarded-clipboard.ts`
   - Shared hook now centralizes copy-only status, operation guards, timeout cleanup, action ids, and manual fallback text.
   - Quick Copy, duo compare, Share Card, and Film Room clip copy now all preserve exact manual-copy fallback text when clipboard writes fail.
   - `src/components/BbtiManualCopyFallback.tsx` now owns the repeated fallback textarea markup; next copy-only migration should reuse the hook plus this component instead of adding local timers.

37. `src/lib/bbti-session.ts`
   - Add expiry handling for stale drafts and a small schema version migration path.
   - Add a draft summary helper so Entry and future action docks share the same display math.

38. `src/components/BbtiEntry.tsx`
   - Extract the Saved Timeout panel into `src/components/BbtiPauseBench.tsx` if the entry page continues to grow.
   - Add a confirmation before replacing an existing draft when starting a different mode.

38. `src/components/BbtiQuiz.tsx`
   - Extract the timeout dialog into `src/components/BbtiExitPauseDialog.tsx`.
   - Add a true debounce for open-text draft writes if longer essay prompts are added later.

39. `src/components/BbtiResultActionDock.tsx`
   - Active-section highlighting now uses dock-bottom scroll tracking, with `aria-current` on the current result section.
   - Dock jumps now respect reduced-motion preferences and target sections use the measured dock-height offset for scroll margins.
   - Mobile section chips auto-center the active item and expose `aria-controls` for their target sections.
   - Consider merging the bottom footer actions into this component once mobile spacing is proven stable.

40. `src/components/BbtiResult.tsx`
   - Next step: split the long result page into `BbtiScoutingReport`, `BbtiChallengeBoard`, and `BbtiResultFooterActions`.
   - Move Share Kit closer to challenge context if analytics show users rarely reach the bottom.

41. `src/data/bbti-challenge-fixtures.ts`
   - Extend each fixture with football-inspired fields such as `pressureQuestion`, `iconicMoment`, `receiptA`, `receiptB`, `groupChatPrompt`, and `evidenceLens`.
   - Add more matchup variety when the fixed matchup roster expands beyond the current eight.

42. `src/data/validate-bbti-fixtures.ts`
   - Add a small validation script that checks every BBTI code has three lanes, no duplicate matchup in a code, and every `matchupId` exists.
   - Reuse it in future content-heavy fixture edits before running the full build.

43. `src/data/bbti-lineup-chemistry.ts`
   - Move lineup chemistry labels, invite copy, and risk notes out of the component once more relationship types are added.
   - Add hand-written chemistry presets for common pairs instead of relying only on the generic compare report.

44. `src/data/bbti-answer-reveals.ts`
   - Add question-specific Coach Timeout overrides for the most viral BBTI questions.
   - Add optional before/after axis summaries for quick/full modes without inventing crowd percentages.

45. `src/components/BbtiResultTabs.tsx`
   - The basketball-native赛后节目单 now exists as navigation metadata, not hidden tab panels, so existing anchors and deep links stay intact.
   - Next step: add optional URL hash sync for manual节目切换 only if it does not pollute shared result links or interfere with clip/challenge parameters.
   - Keep the current no-hide approach until analytics or manual testing proves users need true tab panels.

46. `src/components/BbtiFilmRoomClips.tsx`
   - Shared clip links now show a visible分享回放 badge and a boundary note when the clip is reconstructed from `clip` rather than local answers.
   - Bare or malformed clip links now render a clear未复原 explanation instead of disappearing from the result page.
   - Consider a collapsed third clip or compact mode if mobile scroll depth gets too long.
   - Next step: add a one-click "重新复制正确录像室链接" hint only if users start sharing malformed clip keys frequently.

47. `src/components/BbtiCoachTimeoutSettings.tsx`
   - Add a small speed/control surface only if user testing shows the toast is too quick or too distracting.
   - Keep blitz default fast and avoid adding settings before the interaction proves useful.

48. `src/components/BbtiResultActionDock.tsx`
   - The sticky dock now hosts both the赛后节目单 and next-play action buttons.
   - Explicit section hashes and Film Room clip links now trigger a one-time post-mount scroll to the target section; plain result links and challenge/event notices stay top-first.
   - Next step: test whether the four quick actions should collapse behind one "下一回合" menu on smaller phones after the节目单 settles.

49. `src/lib/bbti-deep-links.ts`
   - `npm run validate:bbti-deep-links` now covers full answer-bearing clip keys, question-only clip hints, malformed clips, plain result URLs, and stale-query cleanup for result and compare-invite builders.
   - `parseBbtiDeepLink` now preserves whether `clip` was present and the raw clip text, enabling UI recovery states without loosening the validated `clipKey` contract.
   - Next step: extend the validator with precedence cases among `bbti`, `event`, `challenge`, `clip`, `a`, and `b`.
   - Consider signing or versioning compact clip keys if future question ids/options change.

50. `src/data/bbti-playbook.ts`
   - Add a clip-key schema version before changing quiz option ordering.
   - Consider exporting a validation helper for shared Film Room clip reconstruction.

51. `scripts/validate-bbti-challenge-fixtures.mjs`
   - New fixture guard checks all 16 BBTI codes, 48 challenge slots, exact lane order, unique three-matchup combos, canonical matchup titles, challenge library ids, evidence-pack coverage, and evidence lens values.
   - The validator also blocks football/fake-live residue while allowing basketball-native history, honor, loyalty, and efficiency language that the challenge copy intentionally uses.
   - `package.json` now exposes both `validate:bbti-fixtures` and `validate:bbti-challenge-fixtures` so future Add Files/content edits can run the short alias or explicit script.
   - Football comparison: this borrows FBTI's fixture-validation discipline but makes it basketball-specific by protecting challenge lanes, evidence receipts, and matchup identity instead of generic recommendation counts.

52. `src/components/BbtiCasePostgame.tsx`
   - New postgame case recap keeps BBTI-origin battles connected through the normal debate result page, including source badge, code/type, challenge lane, score, selected side, pressure question, evidence lens, and return-to-BBTI CTA.
   - `src/components/Result.tsx` now uses guarded clipboard plus manual-copy fallback for copied replay/share text and BBTI case war reports instead of dropping to alerts or silent clipboard failure.
   - `src/components/BbtiResult.tsx` now renders Film Room before the Challenge Receipt Board so sticky program highlighting follows the same order as `BBTI_RESULT_SECTIONS`.
   - Football comparison: FBTI's recommendation cards end at debate entry; basketball now preserves the richer case context after the debate result, which should be the stronger pattern for future football parity work.

53. `src/components/BbtiChallengeReceiptBoard.tsx`
   - Challenge证物包 copy now uses `useGuardedClipboard` and renders `BbtiManualCopyFallback` inside the exact failed matchup card, so blocked clipboard permissions no longer lose the payload.
   - Challenge links are built from `window.location.origin + window.location.pathname` before `buildBbtiResultUrl(...)`, keeping stale result query/hash state out of copied证物包 links.
   - Buttons now declare `type="button"` and each card exposes an `aria-live` copy status for copied/failed states.

54. `src/components/BbtiChallengeCaseBanner.tsx`
   - Case banner copy now uses the shared guarded clipboard path, exposes manual fallback text, and appends a clean BBTI report return link for the same challenge matchup.
   - The migration aligns pre-battle, in-battle, postgame, Film Room, Share Kit, and Return Bench copy failure behavior around one manual-copy fallback component.

55. `src/components/BbtiFilmRoomAmmo.tsx`
   - Opening Ammo copy now uses `useGuardedClipboard`, `BbtiManualCopyFallback`, button `type="button"`, and an `aria-live` status while keeping the independent "用这题开战" CTA unblocked by copy failures.
   - Ammo URLs are built with a clean `origin + pathname` base at click time, then pinned back to `#bbti-film-room`.

56. `src/components/BbtiCounterEvidenceCard.tsx`
   - Counter Evidence copy now shares the same guarded clipboard and manual-copy fallback path as Film Room clips, case banners, share kits, and return bench actions.
   - Counter URLs are also generated at click time from a clean base so stale query/hash state does not leak into反方证据 copy.

57. `src/components/BbtiFilmRoomContradictions.tsx`
   - Multi-card自查矩阵 copy now uses keyed `useGuardedClipboard` actions and shows the manual fallback only under the matching failed contradiction card.

58. `src/components/BbtiAnswerPollTrend.tsx`
   - 模拟看台趋势 copy now uses the guarded clipboard and manual fallback, preserving the full local-simulation caveat when clipboard access is blocked.

59. `src/components/BbtiPersonaExtension.tsx`
   - 二层球探报告 copy now shares the same fallback path and screen-reader copy status as the rest of the BBTI result-page share surfaces.

60. `src/components/BbtiArenaEvents.tsx`
   - 情境加赛群聊题 copy now uses `useGuardedClipboard`, a visible manual fallback, and click-time clean result URLs for event/challenge return links.
   - Event filter, lens, event-card, and challenge buttons now explicitly declare `type="button"`.

61. `src/components/BbtiLineupChemistry.tsx`
   - 组队化学反应 invite copy now uses keyed guarded clipboard actions, manual fallback per compatibility/nemesis card, and clean compare URLs.
   - Next step: audit non-BBTI legacy helpers like `CourtSideAdvisor` separately; the main BBTI result, Film Room, challenge, share, compare, and return-bench copy loop now follows the same failure model.

62. Duo Invite handoff
   - `src/lib/bbti-session.ts` now stores a short-lived pending compare invite with the sender's BBTI code, validation, TTL, and safe localStorage fallbacks.
   - `src/components/BbtiCompare.tsx` saves that pending invite and strips the `?a=` query before sending receivers to take their own BBTI, so refreshes do not bounce them back into compare mode.
   - `src/components/BbtiEntry.tsx` shows a lightweight "TA 已上场" banner while the receiver is still testing, and `src/components/BbtiResult.tsx` turns the completed result into a direct `TA vs 我的报告` CTA before clearing the pending invite.
   - `src/components/BbtiResultActionDock.tsx` can relabel the compare action for pending duo reports, and `scripts/validate-bbti-deep-links.mjs` now covers clean full compare-report URLs in addition to compare invites.

63. `src/components/BbtiFeaturedDailyReturn.tsx`
   - New entry-page "今日主场加赛" card promotes the returning-player loop into the first screen: last BBTI code, today's deterministic Arena Event, pressure test, group prompt, recommended challenge, and three actions.
   - `src/data/bbti-daily-return.ts` centralizes the daily return view-model so Entry and Return Bench share the same event date key, deterministic event, challenge lanes, and featured challenge selection.
   - `src/components/BbtiReturnBench.tsx` no longer duplicates the daily event UI; it now supports the featured card with last-result reopen, return-duo copy, and challenge lanes with the same featured challenge highlighted.
   - Football comparison: this borrows the FBTI Featured Clash entry pattern but keeps the basketball flow event-first. The primary CTA opens the BBTI result/Arena Event path so richer event context can still carry into "拿这个题开战".

64. `src/data/bbti-daily-return.ts`
   - The daily return view-model now hydrates `caseContext` through `hydrateBbtiSharedChallenge`, so the entry-page "带案由接加赛" button can enter a matchup with the same BBTI Arena Event context used by result-page event challenges.
   - `src/components/BbtiFeaturedDailyReturn.tsx` widens `onChallengeMatchup` to pass that hydrated context only after confirming `source`, `eventId`, and `challengeMatchupId` match the visible daily event and featured challenge; otherwise it falls back to a plain challenge.
   - This keeps the fast entry path from becoming a plain matchup shortcut: postgame can still show source, event title, pressure test, evidence lens, and return-to-BBTI framing.
   - `scripts/validate-bbti-arena-events.mjs` now runtime-checks all 16 codes against `getBbtiDailyReturnPlay(...)`, requiring the daily featured challenge category to match the event recommendation and the hydrated case context to remain `arena-event`.

65. `src/lib/bbti-deep-links.ts`
   - New `buildBbtiCaseReturnUrl(...)` centralizes BBTI case return links for result, Film Room, and Arena Event origins.
   - `src/components/BbtiChallengeCaseBanner.tsx` now uses that helper, so copied Arena Event案件 links preserve both `event` and `challenge` instead of degrading to a plain result challenge link; Film Room案件 links also keep their clip key.
   - `scripts/validate-bbti-deep-links.mjs` now covers all three case-return URL shapes and verifies stale compare/event/clip params are stripped where they should be.

66. `src/components/BbtiCasePostgame.tsx`
   - BBTI case postgame reports now reuse `buildBbtiCaseReturnUrl(...)` instead of ending with a bare BBTI code.
   - The copied战报 includes both the normal debate replay link and a source-aware案件回流 link, and the card shows a compact preview of that BBTI return URL.
   - This keeps postgame sharing aligned with pre-battle case banners: Arena Event cases preserve `event + challenge`, Film Room cases preserve `clip + challenge`, and normal result cases stay lightweight.

67. `src/components/BbtiPauseBench.tsx`
   - Saved Timeout is now extracted out of `BbtiEntry.tsx`, keeping the entry page readable as pending duo, daily return, and mode-selection surfaces grow.
   - `src/components/BbtiDraftReplaceDialog.tsx` adds an explicit confirmation before a user replaces an existing BBTI draft with a different mode; clicking the same mode resumes the saved draft instead of clearing it.
   - Pending Duo Invite behavior stays intact: if a receiver has a draft, the invite path continues that draft; only the explicit replace confirmation clears progress.
   - Mode-card action hints now show "重新开测需确认" when a different saved draft is present, reducing accidental progress loss.

68. Draft summary and Return Bench case parity
   - `src/lib/bbti-session.ts` now centralizes Saved Timeout summary math and clears stale local drafts after 14 days, so pause and replace surfaces no longer repeat progress-count or resume-question logic.
   - `src/components/BbtiPauseBench.tsx` and `src/components/BbtiDraftReplaceDialog.tsx` both read the same `getBbtiDraftSummary(...)` helper, keeping mode labels, completed count, saved time, and resume copy consistent.
   - `src/components/BbtiReturnBench.tsx` now gives the highlighted daily challenge lane the same guarded Arena Event case context used by the featured daily return card; non-featured lanes still enter as plain challenges.
   - Football comparison: the guarded context handoff mirrors the strongest FBTI state-preservation pattern; the follow-up Film Room shared-link hydration work is tracked as completed in item 69.

69. Film Room shared-link hydration
   - `src/data/bbti-shared-challenge-hydration.ts` now accepts `clipKey` and hydrates valid `clip + challenge` links as `source: "film-room"` before falling back to Arena Event or result cases.
   - `src/components/BbtiDeepLinkNotice.tsx` passes the parsed clip key into hydration and bumps dismissed notice storage to v3 so old result-style dismissals do not hide upgraded Film Room案由 prompts.
   - `src/data/bbti-playbook.ts` exports the Film Room dimension-label helper used by both the UI and hydration layer, avoiding duplicated label tables.
   - `scripts/validate-bbti-shared-challenge-hydration.mjs` checks Film Room hydration, stale-event stripping, and invalid/question-only clip fallback; `npm run validate:bbti-film-room` now runs it after the cross-exam validator.
   - Football comparison: this follows the FBTI handoff rule that links stay lightweight while structured source-aware state is rebuilt from local data, not copied as fragile prose inside the URL.

70. Deep-link source-aware prompt polish
   - `src/components/BbtiDeepLinkNotice.tsx` now gives Film Room, Arena Event, and Result return links separate descriptions, CTA copy, preview labels, and source chips.
   - Film Room shared links now expose Q number, dimension, coach title, source boundary, and non-real-heat caveat in the prompt surface, so the user understands this is a specific录像室案由 instead of a generic result challenge.
   - `docs/BBTI_ADD_FILES_ROADMAP.md` adds a future-agent queue for shared challenge source preview checks, an Add Files suggestion panel, case registry versioning, FBTI cross-pollination rules, and visual QA.
   - Football comparison: this keeps the FBTI discipline of writing handoff state into repo-local docs while preserving basketball-native UI language.

71. Next Play action router
   - `src/data/bbti-next-play.ts` now resolves the result page's top three next actions in priority order: pending compare, incoming shared return, daily event, primary challenge, Film Room, then Share Kit.
   - `src/components/BbtiNextPlayPanel.tsx` renders a compact non-sticky action panel below the Action Dock and reuses existing result handlers instead of owning storage or navigation state.
   - `src/components/BbtiResult.tsx` now feeds the panel with pending compare state, source-aware incoming return hydration, today's daily return, primary challenge, Film Room availability, and Share Kit navigation.
   - `scripts/validate-bbti-next-play.mjs` locks resolver priority and the pending compare secondary dismiss action; `package.json` exposes `validate:bbti-next-play`.
   - `docs/BBTI_NEXT_PLAY_PANEL.md` records the source boundaries and action priority, while `docs/BBTI_ADD_FILES_ROADMAP.md` marks the baseline panel shipped and keeps visual/source-copy QA as the next upgrade.

72. Share return prompt resolver
   - `src/data/bbti-share-return-prompts.ts` now owns the source-aware copy contract for shared return prompts: Film Room, Arena Event, Result, and plain challenge fallback.
   - `src/components/BbtiDeepLinkNotice.tsx` now renders that resolver output instead of carrying its own copy branches, so UI and validation share one contract.
   - `scripts/validate-bbti-share-return-prompts.mjs` validates real hydration outputs for source label, pressure line, CTA, preview, chips, evidence chips, denylisted football terms, hard-claim wording, and heat-claim boundaries.
   - `scripts/validate-bbti-shared-challenge-hydration.mjs` now also covers Arena Event hydration, category mismatch fallback, and invalid challenge fallback.
   - `docs/BBTI_FACT_RULES.md` records the FBTI-derived boundaries: source labels are entry paths, local heat is not real heat, and external NBA facts must fail closed without a verified registry.

73. Next Play source-copy QA
   - `src/data/bbti-next-play.ts` now assigns a stable `qaKey` to every action, separating Film Room, Arena Event, Result, pending compare, daily event, primary challenge, Film Room review, and Share Kit states without adding URL state.
   - `src/components/BbtiNextPlayPanel.tsx` now renders the real action count instead of hard-coding `3 plays`, and exposes `data-next-play-count` plus per-action `data-next-play-qa` markers for future visual QA.
   - `scripts/validate-bbti-next-play.mjs` now validates six resolver states, source-specific incoming return copy, pending compare dismissal, denylisted football terms, hard-claim wording, and heat-claim boundaries.
   - Football comparison: this follows FBTI's "lock the source-aware contract with small validators" discipline while keeping all visible copy basketball-native.

74. Case Registry Versioning
   - `src/data/bbti-challenge-case.ts` now stamps every Film Room, Result, and Arena Event case context with `caseVersion: "bbti-case-v1"` plus a source-version literal: `film-room-v1`, `result-v1`, or `arena-event-v1`.
   - `src/data/bbti-shared-challenge-hydration.ts` mirrors that version contract on every hydration output, including invalid challenge fallbacks where `caseContext` stays `null`.
   - `src/lib/bbti-deep-links.ts` now strips internal case/prose query params such as `caseCopy`, `caseQuestion`, `evidenceLine`, `pressureLine`, `sourceUrl`, and `cv` before building shared BBTI URLs.
   - `scripts/validate-bbti-shared-challenge-hydration.mjs` locks version/source-version coverage and identifier-only registry keys; `scripts/validate-bbti-deep-links.mjs` locks short URL output and forbidden internal case params.
   - Football comparison: this keeps FBTI's handoff rule that links carry identifiers only, while BBTI rebuilds the basketball case locally from fixtures and source-aware hydration.

75. Session-local Case Trail
   - `src/data/bbti-challenge-case-trail.ts` now resolves Film Room, Result, and Arena Event case contexts into a session-local round trail: version, source detail, standard, current review question, per-round vote state, and copy text.
   - `src/components/BbtiChallengeCaseTrail.tsx` renders that trail in BattleArena after a vote, between CourtSideAdvisor and VoteReveal, without adding persistence or any new deep-link schema.
   - `src/components/BattleArena.tsx` now feeds the trail with current matchup topics and in-session votes, so it can show how each round is responding to the original BBTI案由.
   - `scripts/validate-bbti-case-trail.mjs` and `package.json` now expose `npm run validate:bbti-case-trail`, covering null context, all three source versions, completed/current/upcoming states, and forbidden football/live-heat wording.
   - Football comparison: this adopts FBTI's handoff discipline only as a session breadcrumb; it does not claim to be a verified source, user analytics feed, or full fact chain.

76. Visual QA selector hardening
   - `src/components/BbtiDeepLinkNotice.tsx` now exposes stable QA selectors for expanded/collapsed shared-challenge prompts, source/source-version, preview labels, CTA, dismiss/restore, and invalid `clip` fallback state.
   - `src/components/BbtiChallengeCaseTrail.tsx` now exposes source/version/progress and per-step state markers so mobile BattleArena screenshots can target the case trail without relying on dynamic React ids.
   - `src/data/bbti-share-return-prompts.ts` replaced the Film Room "真实全网热度" wording with a cleaner external-heat-data boundary, and `src/data/bbti-next-play.ts` replaced internal "Q-level" copy with "录像室证据".
   - `scripts/validate-bbti-qa-selectors.mjs` plus `npm run validate:bbti-qa-selectors` locks the screenshot selectors and the two copy-boundary fixes.
   - Football comparison: this keeps the FBTI-style small-validator discipline, but the actual UI contract stays basketball-native and does not import football terms.

77. Visual QA fixture generator and case-readability pass
   - `src/components/BbtiDeepLinkNotice.tsx` now exports `BbtiDeepLinkNoticeCard`, letting fixture scripts render the real shared-challenge card without duplicating JSX or touching browser-only location/localStorage behavior.
   - Invalid or bare `clip` links now get a v4 dismiss key bucket through `clipDismissKeyPart(...)`, so an invalid Film Room link no longer shares the same hidden state as a normal no-clip challenge link.
   - `scripts/render-bbti-visual-qa-fixtures.mjs` and `npm run render:bbti-visual-qa` generate ignored `out/bbti-visual-qa/index.html` plus `manifest.json` for Film Room, Arena Event, Result, invalid clip, collapsed restore, Next Play, and Case Trail scenes.
   - `npm run validate:bbti-visual-qa-fixtures` runs the same renderer as a dependency-free fixture check; real screenshots remain a manual/browser-enabled step rather than a default validation gate.
   - `src/data/bbti-challenge-case-trail.ts` now marks the first unanswered round as `current` when the displayed round has already been voted, and `BattleArena` pauses auto-advance by default when a BBTI case context is active so users can read the trail.
   - Football comparison: this follows FBTI's durable handoff habit by making Add Files/visual QA repeatable through repo-local fixtures and manifest selectors, while keeping output ignored and basketball-native.

78. Next Play mobile compaction
   - `src/components/BbtiNextPlayPanel.tsx` now treats the first resolved action as the full mobile card and compresses secondary actions into compact mobile rows, while preserving the existing three-card layout at `sm` and wider.
   - Each action keeps `data-next-play-qa` and now also exposes `data-next-play-mobile-layout` plus `data-next-play-position`, so visual fixtures can distinguish primary-card and compact-row states without duplicating DOM.
   - `scripts/render-bbti-visual-qa-fixtures.mjs` now includes a long-copy stress scene and checks each Next Play scene for unique `data-next-play-qa` markers, ordered positions, and primary/compact mobile layout markers.
   - `scripts/validate-bbti-qa-selectors.mjs` locks the layout markers alongside the existing source-aware action QA keys.
   - Football comparison: this borrows FBTI's action-router discipline only at the product level; the visible copy and interaction remain basketball-native.

79. Result Action Dock / Next Play handoff QA
   - `src/components/BbtiResultActionDock.tsx` now exposes stable root, mode, sticky, and per-action selectors for primary challenge, custom challenge, compare, and share.
   - `src/components/BbtiResultTabs.tsx` now exposes scoped program-nav and section-chip selectors, so future tests do not have to rely on duplicate `aria-current="location"` markers or visible Chinese labels.
   - `scripts/render-bbti-visual-qa-fixtures.mjs` now includes a `result-action-stack` scene that renders the sticky Action Dock immediately above the non-sticky Next Play panel with a long challenge title and pending compare state.
   - `npm run validate:bbti-visual-qa-fixtures` coverage through the renderer now checks exactly one dock, exactly one Next Play panel, dock-first DOM order, dock action/program/section markers, and Next Play primary/compact markers in the combined scene.
   - Football comparison: this follows FBTI's repo-local handoff habit by documenting the current slice and selector contract, while keeping BBTI's copy and fact boundaries in `docs/BBTI_FACT_RULES.md`.

80. Add Files coach queue
   - `src/data/bbti-add-files-suggestions.ts` now defines `bbti-add-files-v1`, resolving the top three future upgrade suggestions from pending compare, Film Room availability, and primary challenge context.
   - `src/components/BbtiAddFilesSuggestionPanel.tsx` renders those suggestions as a basketball-native `下次加练板` after Next Play, with CTA scroll targets and copyable handoff payloads for future work.
   - `scripts/validate-bbti-add-files-suggestions.mjs` plus `npm run validate:bbti-add-files-suggestions` lock priority order, valid result-page targets, target files, validators, unique QA keys, and visible-copy boundaries.
   - `scripts/render-bbti-visual-qa-fixtures.mjs` now includes an `add-files-suggestion-panel` scene and checks version, card count, ordered positions, matching scroll targets, and target coverage.
   - Football comparison: this borrows FBTI's Immediate Task / Data Contract discipline, but the user-facing surface stays basketball language and does not expose football terms, source metadata, or fake heat claims.

81. Film Room drill quality slice
   - `src/data/bbti-film-room-drills.ts` now resolves each active Film Room clip into a four-step drill: 证据句, 矛盾句, 质询句, and洞察句.
   - `src/components/BbtiFilmRoomDrillCard.tsx` renders that drill inside Film Room and lets users copy the加练四连 without turning it into an external fact source.
   - `scripts/validate-bbti-film-room-drills.mjs` plus `npm run validate:bbti-film-room-drills` lock shared-clip fixtures, step order, copy payloads, and forbidden football/fake-heat/source-metadata terms.
   - `npm run validate:bbti-film-room` now includes the drill validator before shared-challenge hydration, so Film Room coverage and Film Room quality gate together.
   - `scripts/render-bbti-visual-qa-fixtures.mjs` now includes a `film-room-drill-card` scene and checks the four ordered drill steps.
   - Football comparison: this implements the FBTI-style quality rubric as a basketball-native training card rather than copying football vocabulary or adding unsupported facts.

82. Rivalry scripts challenge card
   - `src/data/bbti-challenge-evidence.ts` now gives every canonical challenge matchup three short script lines: `scriptOpener`, `scriptConflict`, and `scriptCounter`.
   - `src/components/BbtiChallengeReceiptBoard.tsx` renders those lines as开庭脚本 between evidence receipts and CTAs, and includes them in the copied challenge pack without adding URL state.
   - `scripts/validate-bbti-challenge-fixtures.mjs` now requires the script triad on matchup evidence packs and blocks long, fake-live, source-metadata, or football-language script copy.
   - `scripts/validate-bbti-qa-selectors.mjs` and `scripts/render-bbti-visual-qa-fixtures.mjs` now lock challenge board/card/script/copy/open selectors through the `challenge-rivalry-scripts` scene.
   - Football comparison: this uses FBTI's shareable debate-prompt discipline while keeping the actual words basketball-native and separate from verified evidence receipts.

83. Share Card poster stabilization
   - `src/components/BbtiShareCard.tsx` now accepts result axes, strength badges, and local overall score so the share preview reads like a screenshot-ready BBTI战报卡 instead of only a text card.
   - `src/components/BbtiResult.tsx` passes the existing `bbtiAttributes`, `bbtiBadges`, and `bbtiOverall` into the card, keeping copy derived from the current result rather than URL state.
   - `src/components/BbtiShareKits.tsx` and `src/components/BbtiShareTargetPicker.tsx` now expose shell, target, action, and quick-copy selectors so visual QA can prove the card surface and controls stay separate.
   - `scripts/render-bbti-visual-qa-fixtures.mjs` now renders a real `BbtiShareKits` shell with `BbtiShareCard` preview in the `share-card-poster` scene, checking four axes, three badges, external controls, five share targets, and five quick-copy chips.
   - Football comparison: this borrows FBTI's screenshot-handoff and fact-boundary discipline, not football terms or external fact claims.

84. Duo Chemistry locker-room briefs
   - `src/data/bbti-lineup-chemistry.ts` adds `bbti-lineup-chemistry-v1`, deriving role split, friction plan, and fit action from existing compare reports without expanding URL state.
   - `src/components/BbtiLineupChemistry.tsx` now renders three brief rows on both 王朝双核 and 首轮死敌 cards, while leaving the full compare report in `BbtiCompare`.
   - `scripts/validate-bbti-lineup-chemistry.mjs` validates all 16 BBTI codes across compatibility and nemesis cards for complete copy, unique QA keys, and football/fake-heat/source-metadata boundaries.
   - `scripts/validate-bbti-qa-selectors.mjs` and `scripts/render-bbti-visual-qa-fixtures.mjs` now lock the `duo-chemistry` scene, including two ordered cards, three brief rows per card, copy invite, and open-compare actions.
   - Football comparison: this follows FBTI's fixed-content plus validator discipline, but all user-facing phrasing stays basketball-native and link-light.

85. Coach Queue backlog refresh
   - `src/data/bbti-add-files-suggestions.ts` now marks shipped Add Files slices with `stage: "shipped"` and exports `BBTI_SHIPPED_ADD_FILES_IDS` for validators.
   - The resolver now demotes shipped slices out of the visible top three and prioritizes next-stage work such as compare report polish, local answer trends, case postgame recap, return streaks, and visual regression.
   - `src/components/BbtiAddFilesSuggestionPanel.tsx` now exposes next-count, card stage, and stage-label selectors while keeping file paths and validator commands inside copied handoff payloads.
   - `scripts/validate-bbti-add-files-suggestions.mjs` now verifies shipped ids are demoted, top suggestions are next-stage, and visible copy stays basketball-native.
   - Football comparison: this borrows FBTI's backlog hygiene and handoff discipline, while keeping BBTI's Coach Queue as a living next-work surface instead of a changelog.

86. Compare Report program polish
   - `src/data/bbti-rivalries.ts` now exports `bbti-compare-report-v1`, adding three ordered program segments and a rematch plan to every local duo report.
   - `src/components/BbtiCompare.tsx` now renders the full report as a赛后节目单 with local score framing, program rows, rematch plan, replay cards, axis markers, and scoped copy/action selectors.
   - `scripts/validate-bbti-compare-report.mjs` plus `npm run validate:bbti-compare-report` validate all 16x16 code pairs for score range, same-code handling, four-axis coverage, stable segment ids, copy length, and forbidden football/fake-heat/official wording.
   - `scripts/validate-bbti-qa-selectors.mjs` and `scripts/render-bbti-visual-qa-fixtures.mjs` now cover compare report selectors through `compare-report-program` and `compare-report-clash` scenes.
   - `src/data/bbti-add-files-suggestions.ts` now marks `compare-report-polish` as shipped, keeping it traceable while moving the visible Coach Queue to the next playable slices.
   - Football comparison: this borrows FBTI's docs-first, fixed-contract, small-validator discipline; it does not borrow football terms, football facts, or external-source language.

87. Answer Poll Trend contract hardening
   - `src/components/BbtiAnswerPollTrend.tsx` now exports `bbti-answer-poll-trend-v1`, pure resolver/copy helpers, and stable selectors for local source, average, read count, three buckets, strongest/toughest rounds, top seats, and copy action.
   - `scripts/validate-bbti-answer-poll-trend.mjs` plus `npm run validate:bbti-answer-poll-trend` cover non-open question poll cases, open-question null behavior, local-simulation source, bounded percentages, exact disclaimer, summary count math, and copy boundaries.
   - `scripts/validate-bbti-qa-selectors.mjs` now locks the trend selectors and data contract, while `scripts/render-bbti-visual-qa-fixtures.mjs` adds `answer-poll-trend-result` to the ignored visual fixture set.
   - `src/data/bbti-answer-poll-presets.ts` now avoids unqualified majority wording by using simulated-stand language, and `docs/BBTI_FACT_RULES.md` adds the Answer Poll Trend boundary.
   - `src/data/bbti-add-files-suggestions.ts` now marks `answer-poll-trend` as shipped, keeping it traceable while moving Coach Queue toward case postgame, return streaks, and visual regression work.
   - Football comparison: this borrows FBTI's fixed-contract and validator discipline only; it does not borrow football copy, real heat claims, or real fan-vote framing.

88. Case Postgame recap contract
   - `src/data/bbti-case-postgame.ts` now defines `bbti-case-postgame-v1`, source meta resolution, short URL display, session boundary copy, and a pure recap resolver shared by UI and validators.
   - `src/components/BbtiCasePostgame.tsx` now renders the existing BattleArena result recap through that resolver, with stable version/source/session/return/lens/action selectors for Film Room, Result, and Arena Event sources.
   - `scripts/validate-bbti-case-postgame.mjs` plus `npm run validate:bbti-case-postgame` lock the three source versions, score/stand/winner copy, short return URL invariants, and football/official/real-heat/real-poll/hard-verdict boundaries.
   - `scripts/validate-bbti-qa-selectors.mjs` and `scripts/render-bbti-visual-qa-fixtures.mjs` now cover `case-postgame-film-room`, `case-postgame-result`, and `case-postgame-arena-event`.
   - `src/data/bbti-add-files-suggestions.ts` now marks `case-postgame-recap` as shipped and moves the visible Coach Queue toward `return-streaks`, `case-postgame-replay-index`, and `visual-regression-pack`.
   - Football comparison: this borrows FBTI's handoff and validator discipline only; it does not copy football terms, football facts, or external-source language.

89. Return Streaks mainline
   - `src/data/bbti-daily-return.ts` now defines `bbti-return-streaks-v1`, a local three-step return mainline across last report, deterministic daily event, and featured challenge.
   - `resolveBbtiDailyReturnCaseContext(...)` centralizes the arena-event case-context guard shared by `BbtiFeaturedDailyReturn` and `BbtiReturnBench`.
   - `src/components/BbtiFeaturedDailyReturn.tsx`, `src/components/BbtiReturnBench.tsx`, and `src/components/BbtiEntry.tsx` now expose stable Entry/Featured/Bench return selectors, step markers, action markers, and the local-only boundary.
   - `scripts/validate-bbti-return-streaks.mjs` plus `npm run validate:bbti-return-streaks` cover all 16 BBTI codes at a fixed date, event/challenge/caseContext alignment, short return URL cleanup, and fake activity/fake heat/football/official wording boundaries.
   - `scripts/render-bbti-visual-qa-fixtures.mjs` now covers `featured-daily-return-arena-context`, `return-bench-streaks`, `entry-return-stack-with-last-result`, and `return-streaks-long-copy-stress`.
   - `src/data/bbti-add-files-suggestions.ts` now marks `return-streaks` as shipped and moves the visible Coach Queue toward `case-postgame-replay-index`, `daily-return-remix`, and `visual-regression-pack`.
   - Football comparison: this borrows FBTI's docs-first, fixed-contract, one-writer/read-only-helper discipline; it does not borrow football terms, football facts, or community-source authority.

90. Case Postgame replay index
   - `src/data/bbti-case-postgame.ts` now defines `bbti-case-postgame-replay-index-v1`, resolving four ordered session-local rows: `coach-challenge`, `case-source`, `session-verdict`, and `return-link`.
   - `src/components/BbtiCasePostgame.tsx` renders the replay index inside the existing postgame card with stable source/version/code/matchup/count selectors plus per-row target and position markers.
   - `src/components/ReplayCenter.tsx` and `src/components/BattleArena.tsx` now expose ordinary replay metadata selectors for version, matchup, topic, round, side, and local source label.
   - `scripts/validate-bbti-case-replay-index.mjs`, `scripts/validate-bbti-case-postgame.mjs`, `scripts/validate-bbti-qa-selectors.mjs`, and `scripts/render-bbti-visual-qa-fixtures.mjs` now lock replay-index order, link boundaries, and a standalone `replay-center-coach-challenge` visual scene.
   - `src/data/bbti-add-files-suggestions.ts` now marks `case-postgame-replay-index` as shipped and moves the visible Coach Queue toward `daily-return-remix`, `battle-replay-lens`, and `visual-regression-pack`.
   - Football comparison: this borrows FBTI's docs-first, source-boundary, and small-validator workflow only; BBTI copy stays basketball-native and session-local.

91. Daily Return Remix switcher
   - `src/data/bbti-daily-return.ts` now defines `bbti-daily-return-remix-v1`, resolving three deterministic local lanes: `daily-event`, `film-room-return`, and `featured-challenge`.
   - `src/components/BbtiDailyReturnRemix.tsx` renders the three-lane switcher inside `BbtiFeaturedDailyReturn`, with stable version/code/date/event/featured/clip/lane/count selectors.
   - Film Room return uses a deterministic local clip key plus the featured challenge id, and keeps links to short `bbti/challenge/clip` params without remix prose or version metadata.
   - `scripts/validate-bbti-daily-return-remix.mjs`, `scripts/validate-bbti-qa-selectors.mjs`, and `scripts/render-bbti-visual-qa-fixtures.mjs` now lock lane order, target order, active default lane, local-only boundary, and visual fixture coverage.
   - `src/data/bbti-add-files-suggestions.ts` now marks `daily-return-remix` as shipped and moves the visible Coach Queue toward `battle-replay-lens`, `visual-regression-pack`, and `arena-event-bracket`.
   - Football comparison: the FBTI lesson applied here is deterministic state, docs-first handoff, and fact-rule gating; no football vocabulary or external-source authority is imported.

92. Battle Replay Lens
   - `src/data/bbti-battle-replay-lens.ts` now defines `bbti-battle-replay-lens-v1`, resolving four local post-vote lens steps: `current-claim`, `counter-replay`, `coach-cue`, and `next-pressure`.
   - `src/components/BbtiBattleReplayLens.tsx` renders that lens after `CourtSideAdvisor` in `BattleArena`, exposing version, matchup, topic, next topic, round, voted side, case source, replay source, count, step, target, position, copy, and boundary selectors.
   - `resolveBbtiBattleReplayLens(...)` reuses local stat bombs and CourtSideAdvisor reads, plus optional BBTI case context, without creating a replay archive or treating local source labels as external verification.
   - `scripts/validate-bbti-battle-replay-lens.mjs`, `scripts/validate-bbti-qa-selectors.mjs`, and `scripts/render-bbti-visual-qa-fixtures.mjs` now lock resolver output, BattleArena mount, step order, visual scene `battle-replay-lens-case`, and copy boundaries.
   - `src/data/bbti-add-files-suggestions.ts` now marks `battle-replay-lens` as shipped and moves the visible Coach Queue toward `visual-regression-pack`, `arena-event-bracket`, and `replay-copy-kit`.
   - Football comparison: this follows FBTI's small contract plus docs-first validator pattern only; BBTI keeps basketball-native copy and local-only replay boundaries.

93. Visual Regression Pack
   - `scripts/render-bbti-visual-qa-fixtures.mjs` now emits `bbti-visual-regression-pack-v1` metadata inside `manifest.json`, including audit packs, scene groups, risk packs, priorities, audit selectors, mobile checklists, and the shared mobile/desktop viewport matrix.
   - `scripts/validate-bbti-visual-regression-pack.mjs` renders the fixtures into a temp directory and validates the manifest contract without adding Playwright, Puppeteer, or browser dependencies to the default gate.
   - `docs/BBTI_VISUAL_QA.md`, `docs/BBTI_ADD_FILES_ROADMAP.md`, and `docs/BBTI_FACT_RULES.md` now document the pack workflow, screenshot batches, risk tags, and local-only visual QA boundary.
   - `src/data/bbti-add-files-suggestions.ts` now marks `visual-regression-pack` as shipped and moves the visible Coach Queue toward `arena-event-bracket`, `replay-copy-kit`, and `case-battle-mobile-polish`.
   - Football comparison: this borrows FBTI's docs-first screenshot checklist and fact-boundary discipline only; BBTI visual metadata stays basketball-native and local to QA.

94. Arena Event Bracket
   - `src/data/bbti-arena-events.ts` now defines `bbti-arena-event-bracket-v1`, resolving three ordered local routes: `event-tipoff`, `challenge-branch`, and `share-return`.
   - `src/components/BbtiArenaEvents.tsx` renders the route tree inside the active Arena Event card, with actions for copying the event prompt, carrying the case into the recommended challenge, and opening the Share Kit return path.
   - `scripts/validate-bbti-arena-events.mjs`, `scripts/validate-bbti-qa-selectors.mjs`, and `scripts/render-bbti-visual-qa-fixtures.mjs` now lock bracket version, route order, target order, action selectors, local-only boundary, and the visual `arena-event-bracket` scene.
   - `src/data/bbti-add-files-suggestions.ts` now marks `arena-event-bracket` as shipped and moves the visible Coach Queue toward `replay-copy-kit`, `case-battle-mobile-polish`, and `share-route-scoreboard`.
   - Football comparison: this borrows FBTI's route-tree and fact-boundary workflow only; BBTI copy remains basketball-native and does not imply real schedules, official events, or user heat.

95. Replay Copy Kit
   - `src/data/bbti-battle-replay-lens.ts` now defines `bbti-battle-replay-copy-kit-v1`, resolving three local copy items from the current Battle Replay Lens: `group-recap`, `counter-punch`, and `next-question`.
   - `src/components/BbtiBattleReplayLens.tsx` now renders a compact发群复盘包 under the four lens steps, with stable version/source/matchup/topic/round/count selectors and one copy action per item.
   - `scripts/validate-bbti-battle-replay-lens.mjs`, `scripts/validate-bbti-qa-selectors.mjs`, and `scripts/render-bbti-visual-qa-fixtures.mjs` now lock copy-kit item order, positions, source version, visual selectors, and local-only copy boundaries.
   - `src/data/bbti-add-files-suggestions.ts` now marks `replay-copy-kit` as shipped and moves the visible Coach Queue toward `case-battle-mobile-polish`, `share-route-scoreboard`, and `duo-rematch-prompts`.
   - Football comparison: this borrows FBTI's shareable recap discipline only; BBTI copy stays basketball-native and does not imply real win rates, official evidence, rankings, or user heat.

96. Case Battle Mobile Polish
   - `src/components/BbtiCaseBattleMobileStack.tsx` now defines `bbti-case-battle-mobile-polish-v1`, a local read-order shell for BattleArena's post-vote stack.
   - `src/components/BattleArena.tsx` wraps ReplayCenter, CourtSideAdvisor, Battle Replay Lens, Case Trail, VoteReveal, and next-round controls in the stack; mobile visual order now surfaces controls before the denser Lens/Trail blocks while desktop keeps the previous rhythm.
   - `src/components/CourtSideAdvisor.tsx`, `ReplayCenter.tsx`, `BbtiBattleReplayLens.tsx`, and `BbtiChallengeCaseTrail.tsx` now expose or tighten mobile selectors/density without changing resolver data, vote semantics, or URL state.
   - `scripts/validate-bbti-case-battle-mobile-polish.mjs`, `scripts/validate-bbti-qa-selectors.mjs`, and `scripts/render-bbti-visual-qa-fixtures.mjs` now lock the mobile stack version, five-step order, slot order, controls, visual scene, and local-only boundaries.
   - `src/data/bbti-add-files-suggestions.ts` now marks `case-battle-mobile-polish` as shipped and moves the visible Coach Queue toward `share-route-scoreboard`, `duo-rematch-prompts`, and `film-room-remix-bench`.
   - Football comparison: this borrows FBTI's route/read-rhythm and validator handoff discipline only; BBTI UI remains basketball-native and does not import football vocabulary or external-source authority.

97. Share Route Scoreboard
   - `src/data/bbti-share-kits.ts` now defines `bbti-share-route-scoreboard-v1`, resolving three local share rows from the active Arena Event and recommended challenge: `event-tipoff`, `challenge-branch`, and `share-return`.
   - `src/components/BbtiShareKits.tsx` now renders a route scoreboard inside Share Kit whenever an event-challenge share target exists, with stable kit/code/event/challenge/count selectors and a copy-scoreboard action.
   - `scripts/validate-bbti-share-route-scoreboard.mjs`, `scripts/validate-bbti-qa-selectors.mjs`, and `scripts/render-bbti-visual-qa-fixtures.mjs` now lock the resolver, row order, target order, route scoreboard visual scene, and local-only boundary.
   - `scripts/validate-bbti-visual-regression-pack.mjs`, `docs/BBTI_VISUAL_QA.md`, and `docs/BBTI_FACT_RULES.md` now include the `share-route-scoreboard` scene and boundary in the `share-duo` inspection path.
   - `src/data/bbti-add-files-suggestions.ts` now marks `share-route-scoreboard` as shipped and moves the visible Coach Queue toward `duo-rematch-prompts`, `film-room-remix-bench`, and `challenge-replay-seeds`.
   - Football comparison: this borrows FBTI's share-handoff and fact-boundary discipline only; BBTI keeps basketball-native route copy and short event-challenge identifiers.

98. Duo Rematch Prompts
   - `src/data/bbti-rivalries.ts` now defines `bbti-duo-rematch-prompts-v1`, deriving three local复赛追问 from the current duo report: `standard-lock`, `receipt-swap`, and `last-shot`.
   - `src/components/BbtiCompare.tsx` now renders a复赛追问板 below the compare program/rematch plan, with stable version/code/axis/count/row/position selectors and a copy-prompts action.
   - `scripts/validate-bbti-duo-rematch-prompts.mjs`, `scripts/validate-bbti-compare-report.mjs`, `scripts/validate-bbti-qa-selectors.mjs`, and `scripts/render-bbti-visual-qa-fixtures.mjs` now lock all code pairs, prompt order, copy payloads, visual scene coverage, and local-only boundaries.
   - `scripts/validate-bbti-visual-regression-pack.mjs`, `docs/BBTI_VISUAL_QA.md`, and `docs/BBTI_FACT_RULES.md` now include the `duo-rematch-prompts` scene and boundary in the `share-duo` inspection path.
   - `src/data/bbti-add-files-suggestions.ts` now marks `duo-rematch-prompts` as shipped and moves the visible Coach Queue toward `film-room-remix-bench`, `challenge-replay-seeds`, and `share-kit-locker-room`.
   - Football comparison: this borrows FBTI's fixed-shape prompt and fact-boundary workflow only; BBTI keeps basketball-native copy, short compare links, and no real relationship or win-rate claims.

99. Film Room Remix Bench
   - `src/data/bbti-film-room-remix-bench.ts` now defines `bbti-film-room-remix-bench-v1`, resolving three compact local回看 rows: `clip-read`, `drill-card`, and `poll-read`.
   - `src/components/BbtiFilmRoomRemixBench.tsx` renders the bench inside Film Room with stable version/source/code/question/count, row, copy, and boundary selectors.
   - `src/components/BbtiFilmRoomClips.tsx` mounts the bench beside the active clip and drill card, while `src/components/BbtiResult.tsx` passes the local answer-poll trend summary when answer history exists.
   - `scripts/validate-bbti-film-room-remix-bench.mjs`, `scripts/validate-bbti-qa-selectors.mjs`, `scripts/render-bbti-visual-qa-fixtures.mjs`, and `scripts/validate-bbti-visual-regression-pack.mjs` now lock source labels, row order, copy payloads, visual scene coverage, and local-only boundaries.
   - `src/data/bbti-add-files-suggestions.ts` now marks `film-room-remix-bench` as shipped and moves the visible Coach Queue toward `challenge-replay-seeds`, `share-kit-locker-room`, and `result-scouting-refresh`.
   - Football comparison: this borrows FBTI's docs-first, small-contract, and read-only helper workflow only; BBTI keeps basketball-native Film Room copy and does not claim real votes, live heat, or official authority.

100. Challenge Replay Seeds
   - `src/data/bbti-challenge-replay-seeds.ts` now defines `bbti-challenge-replay-seeds-v1`, resolving three local opening rows: `source-lock`, `opening-pressure`, and `replay-lens`.
   - `src/components/BbtiChallengeReplaySeeds.tsx` renders the seed strip with stable version/source/case-source/code/matchup/count, row, copy, and boundary selectors.
   - `src/components/BbtiChallengeReceiptBoard.tsx`, `src/components/BbtiDeepLinkNotice.tsx`, and `src/components/BbtiBattleReplayLens.tsx` now mount the seed strip so result cards, shared returns, and single-round replay reads share the same challenge-start language.
   - `src/data/bbti-shared-challenge-hydration.ts` now returns `challengeReplaySeeds` for valid Film Room, Arena Event, and Result returns while invalid challenges still fail closed.
   - `scripts/validate-bbti-challenge-replay-seeds.mjs`, `scripts/validate-bbti-shared-challenge-hydration.mjs`, `scripts/validate-bbti-qa-selectors.mjs`, `scripts/render-bbti-visual-qa-fixtures.mjs`, and `scripts/validate-bbti-visual-regression-pack.mjs` now lock seed order, sources, selectors, visual scene coverage, and local-only boundaries.
   - `src/data/bbti-add-files-suggestions.ts` now marks `challenge-replay-seeds` as shipped and moves the visible Coach Queue toward `share-kit-locker-room`, `result-scouting-refresh`, and `challenge-lane-scoreboard`.
   - Football comparison: this borrows FBTI's lightweight-id return and deterministic resolver discipline only; BBTI keeps basketball-native short links and does not import football vocabulary, fake activity, or external-source authority.

101. Share Kit Locker Room
   - `src/data/bbti-share-kits.ts` now defines `bbti-share-kit-locker-room-v1`, resolving three local Share Kit rows: `result-door`, `rematch-door`, and `case-door`.
   - `src/components/BbtiShareKits.tsx` now renders a更衣室分流入口 inside Share Kit, with stable version/code/count, row, target, source-kit, link-kind, position, copy-action, and boundary selectors.
   - `scripts/validate-bbti-share-kit-locker-room.mjs`, `scripts/validate-bbti-qa-selectors.mjs`, `scripts/render-bbti-visual-qa-fixtures.mjs`, and `scripts/validate-bbti-visual-regression-pack.mjs` now lock ordinary/event source kits, visual fixture coverage, audit-pack placement, and local-only copy boundaries.
   - `docs/BBTI_FACT_RULES.md`, `docs/BBTI_VISUAL_QA.md`, and `docs/BBTI_ADD_FILES_ROADMAP.md` now document the locker-room boundary and keep URLs limited to existing result, compare-invite, challenge, and event-challenge builders.
   - `src/data/bbti-add-files-suggestions.ts` now marks `share-kit-locker-room` as shipped and moves the visible Coach Queue toward `result-scouting-refresh`, `challenge-lane-scoreboard`, and `share-return-lane-check`.
   - Football comparison: this borrows FBTI's entrance-routing and result/share/replay layering only; BBTI keeps basketball-native copy, local boundaries, and short BBTI link identifiers.

102. Result Scouting Refresh
   - `src/data/bbti-playbook.ts` now defines `bbti-result-scouting-refresh-v1`, resolving four ordered local scouting lanes: `pace-read`, `proof-read`, `usage-read`, and `stakes-read`.
   - `src/components/BbtiResult.tsx` now replaces the plain four-axis bar block with a scouting report that keeps the `bbti-scouting` anchor while adding stable lane, axis, target, score, evidence, and boundary selectors.
   - `src/components/MyTeamResultCard.tsx` now exposes optional BBTI QA selectors only when the caller passes a QA context, so non-BBTI result surfaces do not inherit BBTI test ids.
   - `scripts/validate-bbti-result-scouting-refresh.mjs`, `scripts/validate-bbti-qa-selectors.mjs`, `scripts/render-bbti-visual-qa-fixtures.mjs`, and `scripts/validate-bbti-visual-regression-pack.mjs` now lock all 16 code reports, evidence counts, visual scene coverage, audit-pack placement, and local-only boundaries.
   - `src/data/bbti-add-files-suggestions.ts` now marks `result-scouting-refresh` as shipped and moves the visible Coach Queue toward `challenge-lane-scoreboard`, `share-return-lane-check`, and `result-scouting-copy-kit`.
   - Football comparison: this borrows FBTI's result-story plus evidence-replay discipline only; BBTI keeps basketball-native answer evidence and does not import football vocabulary, fake heat, or external-source authority.

103. Challenge Lane Scoreboard
   - `src/data/bbti-challenges.ts` now defines `bbti-challenge-lane-scoreboard-v1`, resolving three ordered local routes: `same-court`, `counter-court`, and `overtime-court`.
   - `src/components/BbtiChallengeReceiptBoard.tsx` now renders a challenge route picker above the matchup cards, with stable version/code/count, row, target, category, matchup, position, copy, open-lane, and boundary selectors.
   - `scripts/validate-bbti-challenge-lane-scoreboard.mjs`, `scripts/validate-bbti-qa-selectors.mjs`, `scripts/render-bbti-visual-qa-fixtures.mjs`, and `scripts/validate-bbti-visual-regression-pack.mjs` now lock all 16 code scoreboards, visual scene coverage, audit-pack placement, and local-only boundaries.
   - `docs/BBTI_FACT_RULES.md`, `docs/BBTI_VISUAL_QA.md`, and `docs/BBTI_ADD_FILES_ROADMAP.md` now document the local route boundary, challenge-case visual scene, QA matrix row, and validation baseline.
   - `src/data/bbti-add-files-suggestions.ts` now marks `challenge-lane-scoreboard` as shipped and moves the visible Coach Queue toward `share-return-lane-check`, `result-scouting-copy-kit`, and `challenge-pick-replay-kit`.
   - Football comparison: this borrows FBTI's explicit route-shape and validator discipline only; BBTI keeps basketball-native route copy and does not imply real schedules, user heat, official sources, or football vocabulary.

104. Share Return Lane Check
   - `src/data/bbti-share-kits.ts` now defines `bbti-share-return-lane-check-v1`, resolving four local short-link health rows: `result-return`, `duo-return`, `challenge-return`, and `event-return`.
   - `src/components/BbtiShareKits.tsx` now renders the return health strip inside Share Kit before the locker-room board, with stable version/code/count, row, target, status, source-kit, link-kind, position, copy-check, copy-lane, and boundary selectors.
   - `scripts/validate-bbti-share-return-lane-check.mjs`, `scripts/validate-bbti-qa-selectors.mjs`, `scripts/render-bbti-visual-qa-fixtures.mjs`, and `scripts/validate-bbti-visual-regression-pack.mjs` now lock ordinary fallback status, event-context ready status, visual scene coverage, audit-pack placement, and local-only boundaries.
   - `docs/BBTI_FACT_RULES.md`, `docs/BBTI_VISUAL_QA.md`, and `docs/BBTI_ADD_FILES_ROADMAP.md` now document the return-lane boundary, share-duo visual scene, QA matrix row, and validation baseline.
   - `src/data/bbti-add-files-suggestions.ts` now marks `share-return-lane-check` as shipped and moves the visible Coach Queue toward `result-scouting-copy-kit`, `challenge-pick-replay-kit`, and `share-target-mobile-polish`.
   - Football comparison: this borrows FBTI's short-link health-check and validator workflow only; BBTI keeps basketball-native Share Kit copy and does not imply real clicks, user activity, official sources, or football vocabulary.

105. Result Scouting Copy Kit
   - `src/data/bbti-playbook.ts` now defines `bbti-result-scouting-copy-kit-v1`, resolving three local copy prompts from the current result scouting report: `group-recap`, `counter-read`, and `next-workout`.
   - `src/components/BbtiResult.tsx` now renders a copyable发群球探话术 package inside Result Scouting, with stable version/source/code/count, item, target, source-lane, source-axis, copy-kit, copy-item, and boundary selectors.
   - `scripts/validate-bbti-result-scouting-copy-kit.mjs`, `scripts/validate-bbti-qa-selectors.mjs`, `scripts/render-bbti-visual-qa-fixtures.mjs`, and `scripts/validate-bbti-visual-regression-pack.mjs` now lock all 16 BBTI codes, item order, copy boundaries, visual scene coverage, and mobile-core audit-pack placement.
   - `docs/BBTI_FACT_RULES.md`, `docs/BBTI_VISUAL_QA.md`, and `docs/BBTI_ADD_FILES_ROADMAP.md` now document the copy-kit boundary, visual scene, QA matrix row, and validation baseline.
   - `src/data/bbti-add-files-suggestions.ts` now marks `result-scouting-copy-kit` as shipped and moves the visible Coach Queue toward `challenge-pick-replay-kit`, `share-target-mobile-polish`, and `scouting-lane-compare-bridge`.
   - Football comparison: the current FBTI folder had no usable source/docs/scripts evidence, so this slice borrows only the already-established BBTI validator discipline and keeps all copy basketball-native.
