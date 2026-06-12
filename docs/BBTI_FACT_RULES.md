# BBTI Fact Rules

These rules apply to BBTI UI copy, share prompts, source labels, validators, and future Add Files work.

## Source Labels

- `录像室案由`, `情境加赛`, and `赛后约战` describe the entry path, not an external fact source.
- Do not call a source label an official source, verified source, or evidence source.
- Shared links should stay lightweight: code, challenge id, event id, or clip key only. Rebuild context from local data.

## Heat And Poll Claims

- Do not claim real user votes, real heat, real playback counts, real trending status, or majority fan opinion.
- If a local simulation uses heat-style language, it must say it is local/simulated and does not represent real users.
- Forbidden unqualified claims include: `真实热度`, `实时热度`, `全网`, `用户投票`, `播放量`, `热搜`, `多数球迷`, `大家都选`.

## External Facts

- No external NBA fact should be shown as verified unless a future source registry contains an explicit verified record.
- Without a verified `sourceId`, do not show source URLs or write `官方`, `官方认证`, `公认第一`, `唯一`, or `碾压`.
- Community language can shape tone, but it cannot become factual authority.

## Football Boundary

- Football MBTI is a process reference only. Do not copy football vocabulary into BBTI UI.
- Keep football-only terms out of BBTI copy, including `足球`, `VAR`, `点球`, `德比`, and `FUT`.

## Case Versioning

- `bbti-case-v1` is the local BBTI challenge-case contract. It describes how the app rebuilds case context from local data, not an official fact source.
- Valid source versions are `film-room-v1`, `result-v1`, and `arena-event-v1`.
- Shared URLs must stay short: `bbti`, `challenge`, optional `event`, and optional `clip`. Do not put case prose, source URLs, evidence lines, recommendations, pressure questions, or version metadata into shared links.
- A version bump means the local hydration contract changed. It does not mean NBA facts, rankings, or community consensus changed.

## Case Trail Boundary

- `BbtiChallengeCaseTrail` is a session-local BattleArena breadcrumb. It is not a verified source, user analytics feed, or full factual evidence chain.
- Trail copy may summarize the current session's case source, round title, selected side, and return URL. It must not create a new deep-link schema or persist round-by-round prose.
- The trail can point back to `buildBbtiCaseReturnUrl(...)`, but it must keep using the short BBTI URL contract above.

## Case Postgame Boundary

- `bbti-case-postgame-v1` is a session-local BattleArena result recap. It is not a real win-rate model, prediction model, official source, user analytics feed, or external ranking.
- Postgame copy may include the case source path, current session score, selected side, winner label, replay URL, case reason, evidence lens labels, and short return URL.
- The copied recap must keep the explicit boundary: `仅记录本次会话复盘，不代表真实胜率或外部排名。`
- Case return URLs must continue using `bbti`, `challenge`, optional `event`, and optional `clip`; do not add case prose, source URLs, evidence lines, recommendations, score explanations, or version metadata.

## Case Replay Index Boundary

- `bbti-case-postgame-replay-index-v1` is a session-local index inside Case Postgame. It is not a true replay archive, analytics view, official source, or external ranking.
- The four allowed rows are `coach-challenge`, `case-source`, `session-verdict`, and `return-link`.
- Ordinary `ReplayCenter` links return to the matchup and local vote result only; they do not verify the case source or carry case prose.
- Replay-index and ReplayCenter copy may show local replay labels, source path labels, score, selected side, winner, and short return links. They must not claim real win rates, real user behavior, player heat, official verification, or majority fan opinion.

## Battle Replay Lens Boundary

- `bbti-battle-replay-lens-v1` is a local single-round tactical lens inside BattleArena. It is not a replay archive, verified evidence source, prediction model, user analytics feed, or external ranking.
- The four allowed steps are `current-claim`, `counter-replay`, `coach-cue`, and `next-pressure`.
- It may combine only the current debate topic, current vote, local ReplayStatBomb, CourtSideAdvisor read, next local topic, and optional BBTI case context.
- It must keep the explicit boundary `本地单回合战术镜头，只是本场阅读，不代表外部结论或用户热度。`
- Do not add source URLs, official verification language, real user behavior, heat, poll results, majority fan opinion, external ranking, or real win-probability language.

## Replay Copy Kit Boundary

- `bbti-battle-replay-copy-kit-v1` is a local group-chat copy package derived from one Battle Replay Lens. It is not a replay archive, verified evidence source, prediction model, user analytics feed, or external ranking.
- The three allowed copy items are `group-recap`, `counter-punch`, and `next-question`.
- It may reuse only the current lens steps, current matchup/topic/round metadata, and the existing local boundary.
- It must keep the explicit boundary `本地复盘话术包，只复用本场镜头，不代表真实赢面、外部排名或用户热度。`
- Do not add source URLs, official verification language, real user behavior, heat, poll results, majority fan opinion, external ranking, or real win-probability language.

## Case Battle Mobile Polish Boundary

- `bbti-case-battle-mobile-polish-v1` is a local mobile-readability shell around the BattleArena post-vote stack. It is not a new evidence source, replay archive, analytics feed, prediction model, or external ranking.
- The five allowed read steps are `replay`, `advisor`, `controls`, `lens`, and `trail`.
- It may reorder visible mobile reading surfaces and expose selectors for QA, but it must not change vote semantics, result logic, source hydration, or shared URL schema.
- Source labels remain entry paths such as Film Room, Result, and Arena Event; they are not official verification or external fact sources.
- Do not add source URLs, official verification language, real user behavior, heat, poll results, majority fan opinion, external ranking, or real win-probability language.

## Rivalry Script Boundary

- `scriptOpener`, `scriptConflict`, and `scriptCounter` are开庭话术, not evidence.
- Script lines should stay short, matchup-specific, and basketball-native.
- Do not add new stats, source URLs, official claims, real-heat claims, or version metadata to script copy.

## Share Card Boundary

- `BbtiShareCard` is a local BBTI战报卡, not an official player card, verified ranking, or external fact source.
- Card metrics such as本地球脑稳定度 and四维速写 come from this quiz result only.
- Keep screenshot/export controls outside the visual card surface, and do not show real heat, playback, poll, or official-claim language on the card.

## Result Scouting Refresh Boundary

- `bbti-result-scouting-refresh-v1` is a local result-page scouting layer derived from this quiz's answers, four-axis scores, and BBTI playbook copy. It is not a real scouting report, verified ranking, user analytics feed, prediction model, or external fact source.
- The four allowed lanes are `pace-read`, `proof-read`, `usage-read`, and `stakes-read`, mapped to axes `OD`, `AE`, `IT`, and `LR`.
- Each lane may show the chosen letter, local score, playbook read, workout reminder, blind spot, and one to two local answer evidence lines.
- It must keep the explicit boundary `本地球探复盘，只复用本次答题、四维坐标和战术手册，不代表外部排名、真实球探报告或外部结论。`
- Do not add source URLs, official verification language, real user behavior, heat, poll results, external rankings, football vocabulary, or result-scouting metadata into shared links.

## Result Scouting Copy Kit Boundary

- `bbti-result-scouting-copy-kit-v1` is a local copy package derived from the current result scouting report. It is not a share analytics feature, real scouting report, ranking, official source, or user-behavior feed.
- The three allowed items are `group-recap`, `counter-read`, and `next-workout`, mapped to targets `group-chat`, `counter`, and `workout`.
- It may reuse only the current four-axis scouting lanes, local answer evidence, playbook read, workout reminder, and blind spot copy.
- It must keep the explicit boundary `本地球探话术包，只复用本次四维复盘、答题证据和战术手册，不代表外部排名、真实球探报告、真实热度或用户行为。`
- Do not add source URLs, official language, real heat, real user behavior, external rankings, football vocabulary, share URL params, qa keys, or version metadata into copied user-facing links.

## Duo Chemistry Boundary

- `BbtiLineupChemistry` is a local handoff into the full compare report, not a real locker-room source or a prediction model.
- Role split, friction plan, and fit action must be derived from local BBTI axes and compare reports only.
- Compare links should keep using short `a` and `b` code params; do not embed role prose, qa keys, source metadata, or version metadata in URLs.

## Compare Report Boundary

- `bbti-compare-report-v1` is a local duo-report contract, not a prediction model, verified relationship record, or real win-probability score.
- The visible percentage must be framed as a local BBTI chemistry score, derived only from BBTI axes, compatibility/nemesis metadata, and same-code handling.
- Program segments, replay cards, and rematch plans are local debate prompts. They may help friends start a basketball argument, but they must not add external NBA facts, source URLs, official claims, real heat, or real-user poll language.
- Full compare URLs must remain `?a=CODE&b=CODE`; do not embed program prose, score explanations, version metadata, qa keys, or source metadata in links.

## Duo Rematch Prompts Boundary

- `bbti-duo-rematch-prompts-v1` is a local rematch prompt layer derived from the 本地 BBTI 双人报告. It is not a real relationship model, prediction model, user poll, external fact source, or win-rate model.
- The three allowed prompts are `standard-lock`, `receipt-swap`, and `last-shot`.
- It may reuse only the local BBTI codes, type names, shared/clash axes, compare report framing, and short `?a=CODE&b=CODE` compare link.
- It must keep the explicit boundary `本地复赛追问，只复用两个 BBTI Code、分歧轴和赛后节目单，不代表真实关系、胜率或外部来源。`
- Do not add source URLs, official language, real heat, real user behavior, external rankings, real relationship judgments, football vocabulary, or version metadata into shared links.

## Answer Poll Trend Boundary

- `bbti-answer-poll-trend-v1` is a local-simulation result supplement, not a real poll, analytics feed, real heat source, or majority fan conclusion.
- It may use simulated stand language only when the UI and copied text keep the explicit disclaimer `本地模拟，不代表真实用户投票。`
- Trend percentages, 顺风/拉锯/逆风 buckets, strongest/toughest rounds, and seat counts must come only from the current local answer history and deterministic local presets.
- Reopened lightweight `?bbti=CODE` result links without answer history must not synthesize a trend.

## Film Room Remix Bench Boundary

- `bbti-film-room-remix-bench-v1` is a local Film Room organization layer, not a fact source, trend source, official source, user analytics feature, or prediction model.
- The three allowed rows are `clip-read`, `drill-card`, and `poll-read`.
- It may reuse only the current Film Room clip, cross-exam, drill card, local answer-poll trend summary, and short result/clip links.
- It must keep the explicit boundary `本地录像室回看替补席，只复用当前答题录像、加练卡和本地模拟看台，不代表外部热度、真实投票或真实活跃。`
- Shared-clip mode must stay local to that one recovered clip and must not infer the full answer history, result score, trend summary, external source, real activity, or version metadata in URLs.

## Challenge Replay Seeds Boundary

- `bbti-challenge-replay-seeds-v1` is a local opening-seed layer for challenge return paths, not a fact source, real behavior model, analytics feed, official source, or prediction model.
- The three allowed rows are `source-lock`, `opening-pressure`, and `replay-lens`.
- It may reuse only the current BBTI result, short shared challenge return, local case context, and current Battle Replay Lens read.
- It must keep the explicit boundary `本地开庭种子，只复用本地结果、回流案由和本场镜头，不代表外部结论或用户行为。`
- Shared links must stay identifier-only with short `bbti`, `event`, `challenge`, and `clip` params; do not serialize seed rows, user answers, report prose, version metadata, source URLs, heat, poll, official claims, or football vocabulary into URLs.

## Challenge Lane Scoreboard Boundary

- `bbti-challenge-lane-scoreboard-v1` is a local route-picking layer inside the result challenge board. It is not a schedule, real heat board, user analytics feed, official source, or prediction model.
- The three allowed rows are `same-court`, `counter-court`, and `overtime-court`, mapped to `同温层局`, `反向审判`, and `破防加赛`.
- It may reuse only the current BBTI code and the three local recommended challenge matchups from `getBbtiChallengeMatchups(...)`.
- It must keep the explicit boundary `本地开庭路线板，只复用当前 BBTI 结果、三条推荐对线和短挑战入口，不代表真实赛程、热度或外部来源。`
- Shared links must stay on the existing challenge matchup path; do not add lane row ids, route prose, version metadata, source URLs, real schedule claims, heat, polls, official claims, or football vocabulary into URLs.

## Challenge Pick Replay Kit Boundary

- `bbti-challenge-pick-replay-kit-v1` is a local pre-match recall kit inside the challenge board. It is not a replay archive, schedule, real user behavior feed, prediction model, or external fact source.
- The three allowed rows are `case-lock`, `pressure-check`, and `first-possession`, mapped to targets `case`, `pressure`, and `tipoff`.
- It must reuse only the current local lane scoreboard context and its three matchup rows: category, matchup id, source lane label, and pressure text.
- It must keep the explicit boundary `本地选边回看卡，只复用当前 BBTI 推荐对线、路线板、案由、压力题和开庭种子，不代表真实赛程、热度、外部来源或用户行为。`
- The full-kit copy and item copies must stay local and must not introduce external source references, schedule claims, real user behavior claims, or football vocabulary.

## Return Streaks Boundary

- `bbti-return-streaks-v1` is a local return view-model, not a real streak counter, activity feed, user analytics feature, official schedule, or external trend source.
- It may connect only the local last result, deterministic daily Arena Event, featured challenge, and optional arena-event case context.
- It must keep the explicit boundary `本地回访连线，不代表连续登录或真实活跃。`
- Do not claim login days, real retention, real activity, real user behavior, live schedule status, official event status, heat, poll results, or majority fan opinion.

## Daily Return Remix Boundary

- `bbti-daily-return-remix-v1` is a local return switcher, not a real schedule card, real activity feed, user analytics feature, official event route, or external trend source.
- It may connect only the local last result, deterministic daily Arena Event, deterministic local Film Room clip key, featured challenge, and optional arena-event case context.
- It must keep the explicit boundary `本地每日主场切换，不代表真实赛程、真实回访或用户行为。`
- Film Room return links may carry only `bbti`, `challenge`, and `clip`; do not add remix prose, source URLs, score explanations, user behavior, or version metadata to links.
- Do not claim real schedule status, real return behavior, real activity, live events, official events, heat, poll results, majority fan opinion, or retained users.

## Arena Event Bracket Boundary

- `bbti-arena-event-bracket-v1` is a local route tree for the current deterministic Arena Event. It is not a real schedule bracket, real activity feed, official event route, analytics feature, or external trend source.
- It may connect only the selected local Arena Event, its recommended local challenge lane, copied group-chat prompt, and Share Kit return path.
- It must keep the explicit boundary `本地情境路线树，不代表真实赛程、真实热度或用户行为。`
- Route targets are limited to `daily-event`, `challenge`, and `share`; do not add source URLs, real schedule status, user behavior, heat, poll results, official verification, external ranking, or version metadata into shared links.

## Share Route Scoreboard Boundary

- `bbti-share-route-scoreboard-v1` is a local share package derived from the active Arena Event and its recommended challenge. It is not a real scoreboard, real schedule card, analytics feed, official event route, or external trend source.
- The three allowed rows are `event-tipoff`, `challenge-branch`, and `share-return`.
- It may reuse only the current BBTI result, active local Arena Event, recommended local challenge, and short event-challenge link.
- It must keep the explicit boundary `本地分享路线比分牌，只复用当前结果、情境和推荐对线，不代表真实赛程、热度或用户行为。`
- Do not add source URLs, real schedule status, user behavior, heat, poll results, official verification, external ranking, or version metadata into shared links.

## Share Kit Locker Room Boundary

- `bbti-share-kit-locker-room-v1` is a local share-routing layer inside Share Kit. It is not analytics, a heat source, a user-behavior feed, an official source, or a prediction model.
- The three allowed rows are `result-door`, `rematch-door`, and `case-door`, with targets `result`, `duo`, and `challenge`.
- It may reuse only existing Share Kit entries: current result links, compare-invite links, challenge links, and event-challenge links.
- It must keep the explicit boundary `本地分享更衣室，只把当前结果、双人复赛入口和开庭案由分流，不代表真实用户行为、热度或外部来源。`
- Shared URLs must stay short and identifier-only. Do not add locker-room row ids, report prose, source metadata, qa keys, version metadata, heat, poll claims, official language, football vocabulary, or external sources into links.

## Share Return Lane Check Boundary

- `bbti-share-return-lane-check-v1` is a local Share Kit health strip. It is not analytics, a click tracker, a real activity feed, an official source, or a prediction model.
- The four allowed rows are `result-return`, `duo-return`, `challenge-return`, and `event-return`, with targets `result`, `duo`, `challenge`, and `event-challenge`.
- Row statuses are limited to `ready` and `fallback`, derived only from the currently available Share Kit short-link kinds.
- It must keep the explicit boundary `本地分享回流体检，只检查当前短链接会回到结果、双人对比、开庭案由或事件案由，不代表真实点击、活跃或用户行为。`
- Do not add source URLs, hidden analytics, click counters, real activity claims, heat, poll language, official verification, football vocabulary, or row metadata into shared URLs.

## Visual Regression Pack Boundary

- `bbti-visual-regression-pack-v1` is a local QA manifest for screenshots and manual checks. It is not a product feature, analytics feed, official source, or external verification layer.
- Manifest groups, risks, audit selectors, and mobile checklist items describe how to inspect local UI scenes; they must not be surfaced as BBTI user-facing claims.
- Visual QA source labels remain entry-path labels only. A screenshot pack never makes Film Room, Arena Event, Result, ReplayCenter, or Case Postgame copy official or externally verified.
- Do not add football vocabulary, real heat, real user behavior, official verification, external ranking, or source URL claims to visual regression metadata or screenshot instructions.

## Validation

Current validators that protect these rules:

```bash
npm run validate:bbti-case-trail
npm run validate:bbti-deep-links
npm run validate:bbti-fixtures
npm run validate:bbti-film-room-drills
npm run validate:bbti-lineup-chemistry
npm run validate:bbti-compare-report
npm run validate:bbti-duo-rematch-prompts
npm run validate:bbti-answer-poll-trend
npm run validate:bbti-result-scouting-refresh
npm run validate:bbti-result-scouting-copy-kit
npm run validate:bbti-film-room-remix-bench
npm run validate:bbti-challenge-replay-seeds
npm run validate:bbti-challenge-lane-scoreboard
npm run validate:bbti-share-route-scoreboard
npm run validate:bbti-share-kit-locker-room
npm run validate:bbti-share-return-lane-check
npm run validate:bbti-return-streaks
npm run validate:bbti-daily-return-remix
npm run validate:bbti-arena-events
npm run validate:bbti-visual-regression-pack
npm run validate:bbti-qa-selectors
npm run validate:bbti-visual-qa-fixtures
npm run validate:bbti-add-files-suggestions
npm run validate:bbti-case-postgame
npm run validate:bbti-case-replay-index
npm run validate:bbti-battle-replay-lens
npm run validate:bbti-case-battle-mobile-polish
npm run validate:bbti-share-return-prompts
npm run validate:bbti-shared-challenge-hydration
npm run validate:bbti-sources
```
