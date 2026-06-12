# BBTI Visual QA

Use this when a future agent needs repeatable UI fixtures without adding a browser dependency to the default validation gate.

## Fixture Render

```bash
npm run render:bbti-visual-qa
```

The command writes ignored output to `out/bbti-visual-qa/`:

- `index.html` renders the current React components, not copied static markup.
- `manifest.json` lists scene ids, target selectors, mobile/desktop viewport targets, audit packs, scene groups, risk tags, and selector-backed mobile checklists.

The same renderer is exposed as:

```bash
npm run validate:bbti-visual-qa-fixtures
```

It validates that the fixture HTML includes stable selectors for shared challenge prompts, the result Action Dock, Result Scouting Refresh, Result Scouting Copy Kit, Next Play states, Add Files suggestions, Answer Poll Trend, Film Room Remix Bench, Challenge Replay Seeds, Challenge Lane Scoreboard, Return Streaks, Daily Return Remix, Lineup Chemistry, full Compare Report program states, Duo Rematch Prompts, Film Room drills, Challenge rivalry scripts, Share Card poster state, Share Kit Locker Room state, Share Route Scoreboard state, Share Return Lane Check state, Case Postgame states, ReplayCenter state, Case Battle Mobile Stack state, Battle Replay Lens state, and Case Trail states, while blocking internal/fake-heat copy such as `Q-level` and `真实全网热度`.
Challenge Pick Replay Kit is also included in the fixture coverage checks.

## Visual Regression Pack

```bash
npm run validate:bbti-visual-regression-pack
```

The visual regression pack is a deterministic manifest contract, not a browser screenshot runner. It keeps the default gate dependency-free while making screenshots easier to assign and review.

Required manifest fields:

- `manifestVersion: "bbti-visual-qa-manifest-v1"`
- `visualRegressionPack.version: "bbti-visual-regression-pack-v1"`
- `visualRegressionPack.viewportMatrix` with mobile `390x844` and desktop `1280x900`
- `visualRegressionPack.auditPacks` for fixed screenshot batches
- `visualRegressionPack.groups`, `riskPacks`, and `riskCounts`
- Each scene has `group`, `risks`, `priority`, `auditSelectors`, `mobileChecklist`, and `viewports`

Audit packs:

- `mobile-core`: `result-action-stack`, `result-scouting-refresh`, `result-scouting-copy-kit`, `next-play-long-copy-stress`, `add-files-suggestion-panel`, `film-room-remix-bench`
- `return-loop`: `arena-event-bracket`, `featured-daily-return-arena-context`, `return-bench-streaks`, `entry-return-stack-with-last-result`, `return-streaks-long-copy-stress`
- `challenge-case`: `challenge-replay-seeds`, `challenge-pick-replay-kit`, `challenge-lane-scoreboard`, `case-postgame-*`, `case-battle-mobile-polish`, `replay-center-coach-challenge`, `battle-replay-lens-case`, `case-trail-*`
- `share-duo`: `share-card-poster`, `share-kit-locker-room`, `share-route-scoreboard`, `share-return-lane-check`, `duo-chemistry`, `compare-report-program`, `compare-report-clash`, `duo-rematch-prompts`
- `shared-challenge`: all `deep-link-*` states

Risk tags currently used by the manifest:

- `mobile-wrap`
- `mobile-compact`
- `long-copy`
- `sticky-dock`
- `poster-surface`
- `source-boundary`
- `case-source`
- `return-state`
- `card-density`
- `copy-controls`
- `fallback-state`

`auditSelectors` are screenshot and manual-check entrypoints. They must be stable attribute selectors present inside the rendered scene HTML; they are not visible UI copy and they should not become Playwright/Puppeteer dependency hooks.

## Screenshot Scope

Capture screenshots from `out/bbti-visual-qa/index.html` when a browser or dev server is available. Use the selectors in `manifest.json`; do not add Playwright or Puppeteer to the app just for this step.

Required viewport targets:

- mobile: `390x844`
- desktop: `1280x900`

First scenes to inspect by pack:

- Run `mobile-core` first when changing Result actions, Result Scouting, Result Scouting Copy Kit, Next Play, or the Coach Queue.
- Run `challenge-case` first when changing BattleArena, challenge routes, Case Postgame, ReplayCenter, Case Battle Mobile Stack, Battle Replay Lens, or Case Trail.
- Run `return-loop` first when changing Entry return, Featured Daily Return, Return Bench, or Daily Return Remix.
- Run `return-loop` first when changing Arena Event route trees, Entry return, Featured Daily Return, Return Bench, or Daily Return Remix.
- Run `share-duo` first when changing Share Card, Share Kits, Share Kit Locker Room, Share Route Scoreboard, Share Return Lane Check, Lineup Chemistry, Compare Report, or Duo Rematch Prompts.
- Run `shared-challenge` first when changing deep-link hydration or dismiss/restore behavior.

Next Play checks:

- Every scene must have one `data-next-play-qa` marker per rendered action.
- `data-next-play-position` must be ordered from `1`.
- The first action must use `data-next-play-mobile-layout="primary"`.
- Secondary actions must use `data-next-play-mobile-layout="compact"`.
- Compact rows must still show source intent through eyebrow, title, and CTA because body copy is hidden on mobile.

Action Dock + Next Play handoff checks:

- The `result-action-stack` scene must include exactly one `bbti-result-action-dock` and exactly one `bbti-next-play-panel`.
- DOM order must be Action Dock first, Next Play second, matching the real result page.
- Action Dock must stay the sticky section navigator and quick-action dock; Next Play must stay a non-sticky ranked action router below it.
- Shared destinations such as challenge/share are allowed, but tests must use scoped markers such as `data-bbti-action-dock-action`, `data-bbti-action-dock-program`, `data-bbti-action-dock-section`, and `data-next-play-qa` instead of visible button copy.
- The fixture should keep a long `primaryChallengeTitle` and pending compare state to expose mobile dock height and repeated CTA intent.

Result Scouting Refresh checks:

- The `result-scouting-refresh` scene must include one `bbti-myteam-scouting-card` and one `bbti-result-scouting-report` section with `data-bbti-result-scouting-version="bbti-result-scouting-refresh-v1"`.
- It must expose exactly four ordered scouting lanes: `pace-read`, `proof-read`, `usage-read`, and `stakes-read`.
- Lane axes must stay ordered as `OD`, `AE`, `IT`, and `LR`, with targets `tempo`, `evidence`, `usage`, and `identity`.
- Each lane must expose local answer evidence through `bbti-result-scouting-evidence`; evidence is a local answer reference, not an external source.
- The section must include one `bbti-result-scouting-boundary` marker and must not imply external rankings, real scouting, heat, polls, or official verification.

Result Scouting Copy Kit checks:

- The `result-scouting-copy-kit` scene must include one `bbti-result-scouting-copy-kit` section with `data-bbti-result-scouting-copy-kit-version="bbti-result-scouting-copy-kit-v1"` and `data-bbti-result-scouting-copy-kit-source-version="bbti-result-scouting-refresh-v1"`.
- It must expose exactly three ordered copy items: `group-recap`, `counter-read`, and `next-workout`.
- Item targets must stay ordered as `group-chat`, `counter`, and `workout`; source lanes must stay ordered as `pace-read`, `proof-read`, and `usage-read`.
- The copy actions must use `copy-kit` for the whole package and `copy` for each item; the section must include one local boundary marker.
- Copy Kit text must stay derived from the local scouting report and must not imply external rankings, real scouting, heat, user behavior, official sources, or football vocabulary.

Add Files suggestion checks:

- The `add-files-suggestion-panel` scene must include one `bbti-add-files-suggestion-panel` with `data-bbti-add-files-version="bbti-add-files-v1"`.
- It must render three ordered suggestion cards with unique `data-bbti-add-files-id` and `data-bbti-add-files-qa` markers.
- The visible queue must use `data-bbti-add-files-stage="next"` on all three cards; shipped slice ids such as `duo-chemistry`, `film-room-quality`, `rivalry-scripts`, `share-card-export`, `compare-report-polish`, `answer-poll-trend`, `case-postgame-recap`, `return-streaks`, `case-postgame-replay-index`, `daily-return-remix`, `battle-replay-lens`, `visual-regression-pack`, `arena-event-bracket`, `replay-copy-kit`, `case-battle-mobile-polish`, `share-route-scoreboard`, `duo-rematch-prompts`, `film-room-remix-bench`, `challenge-replay-seeds`, `share-kit-locker-room`, `result-scouting-refresh`, `result-scouting-copy-kit`, `challenge-lane-scoreboard`, and `share-return-lane-check` must stay out of the top queue.
- Every CTA target must match the card's `data-bbti-add-files-target`, and targets must stay inside existing result-page sections.
- Visible card copy must stay basketball-native; file paths and validator commands belong in the copy payload and data contract, not as normal card prose.

Lineup Chemistry checks:

- The `duo-chemistry` scene must include one `bbti-lineup-chemistry` section with `data-bbti-lineup-chemistry-version="bbti-lineup-chemistry-v1"`.
- It must render exactly two cards in this order: `compatibility`, `nemesis`.
- Each card must expose three ordered brief rows: `role-split`, `friction-plan`, `fit-action`.
- Copy/open actions must be scoped as `copy-invite` and `open-compare`, and the full report must remain in `BbtiCompare`.
- Links must stay compare-code based; do not add brief prose, qa keys, source metadata, or version metadata into shared URLs.

Compare Report checks:

- The `compare-report-program` and `compare-report-clash` scenes must each include one `bbti-compare-report` shell and one `bbti-compare-report-program` panel with `data-bbti-compare-report-version="bbti-compare-report-v1"`.
- Each compare program must expose exactly three ordered rows: `opening-read`, `swing-point`, and `closing-challenge`.
- Each scene must expose one `bbti-compare-rematch-plan` and a visible local score label such as `本地 BBTI 化学反应分`.
- Compare links must remain short `a` and `b` code links; do not add report prose, program ids, qa keys, score explanation, source metadata, or version metadata to URLs.

Duo Rematch Prompts checks:

- The `duo-rematch-prompts` scene must include one `bbti-duo-rematch-prompts` section with `data-bbti-duo-rematch-version="bbti-duo-rematch-prompts-v1"`.
- It must expose exactly three ordered prompt rows: `standard-lock`, `receipt-swap`, and `last-shot`.
- Each row must expose an axis marker, qa key, and stable position; the copy action must use `data-bbti-duo-rematch-action="copy-prompts"`.
- The scene must include one `bbti-duo-rematch-boundary` marker and keep the local boundary visible.
- Compare links must remain short `a` and `b` code links; do not add prompt prose, qa keys, source metadata, or version metadata to URLs.

Answer Poll Trend checks:

- The `answer-poll-trend-result` scene must include one `bbti-answer-poll-trend` section with `data-bbti-answer-poll-trend-version="bbti-answer-poll-trend-v1"` and `data-bbti-answer-poll-trend-source="local-simulation"`.
- It must expose exactly three stat buckets in order: `mainstream`, `tossup`, and `minority`.
- It must expose exactly two round cards in order: `strongest` and `toughest`.
- It must expose one to three ordered seat rows and one copy action.
- Trend copy must keep the explicit local-simulation disclaimer and must not imply real votes, real heat, real playback, or majority fan opinion.

Film Room Remix Bench checks:

- The `film-room-remix-bench` scene must include one `bbti-film-room-remix-bench` section with `data-bbti-film-room-remix-version="bbti-film-room-remix-bench-v1"`.
- It must expose exactly three ordered rows: `clip-read`, `drill-card`, and `poll-read`.
- Row targets must stay ordered as `clip`, `drill`, and `poll`; positions must be `1`, `2`, and `3`.
- The copy action must use `data-bbti-film-room-remix-action="copy-bench"` and the section must include one local boundary marker.
- Shared-clip mode may show local fallback copy, but it must not infer full answer history, result score, external sources, or real trend data.

Challenge Replay Seeds checks:

- The `challenge-replay-seeds` scene must include one `bbti-challenge-replay-seeds` section with `data-bbti-challenge-replay-seeds-version="bbti-challenge-replay-seeds-v1"`.
- It must expose exactly three ordered rows: `source-lock`, `opening-pressure`, and `replay-lens`.
- Row targets must stay ordered as `return`, `case`, and `replay`; positions must be `1`, `2`, and `3`.
- The copy action must use `data-bbti-challenge-replay-seeds-action="copy-seeds"` and the section must include one local boundary marker.
- Deep-link, challenge-card, and Battle Replay Lens mounts may reuse the seed strip, but shared URLs must stay short and must not include seed prose, version metadata, source URLs, real behavior claims, or football vocabulary.

Challenge Lane Scoreboard checks:

- The `challenge-lane-scoreboard` scene must include one `bbti-challenge-lane-scoreboard` section with `data-bbti-challenge-lane-scoreboard-version="bbti-challenge-lane-scoreboard-v1"`.
- It must expose exactly three ordered rows: `same-court`, `counter-court`, and `overtime-court`.
- Row targets must stay ordered as `same-temperature`, `counter-judgment`, and `overtime`; positions must be `1`, `2`, and `3`.
- Each row must expose the local challenge category and matchup id, plus `data-bbti-challenge-lane-scoreboard-action="open-lane"`.
- The copy action must use `data-bbti-challenge-lane-scoreboard-action="copy-scoreboard"` and the section must include one local boundary marker.
- Route copy must stay local to the current BBTI result and three recommended matchups; it must not imply real schedules, real heat, user behavior, official sources, or football vocabulary.

Challenge Pick Replay Kit checks:

- The `challenge-pick-replay-kit` scene must include one `bbti-challenge-pick-replay-kit` section with `data-bbti-challenge-pick-replay-kit-version="bbti-challenge-pick-replay-kit-v1"`.
- It must expose exactly three ordered rows: `case-lock`, `pressure-check`, and `first-possession`.
- Row targets must stay ordered as `case`, `pressure`, and `tipoff`; positions must be `1`, `2`, and `3`.
- It must expose source lane and source matchup ids per row and one local boundary marker.
- The copy action must use `data-bbti-challenge-pick-replay-kit-action="copy-kit"` and each item must use `data-bbti-challenge-pick-replay-kit-action="copy"`.
- The copy section must remain local only and must not imply real schedules, user behavior, external sources, or football vocabulary.

Return Streaks checks:

- The `featured-daily-return-arena-context` scene must include one `bbti-featured-daily-return` section with `data-bbti-return-streak-version="bbti-return-streaks-v1"`.
- The `return-bench-streaks` and `return-streaks-long-copy-stress` scenes must each include one `bbti-return-bench` section with the same return-streak version marker.
- The `entry-return-stack-with-last-result` scene must include one `bbti-entry-return-stack`, one Featured Daily card, and one Return Bench.
- Featured Daily and Return Bench must expose three ordered return steps: `last-report`, `daily-event`, and `featured-challenge`, with targets `result`, `daily-event`, and `challenge`.
- Featured Daily actions must be scoped as `open-daily-event`, `open-featured-challenge`, and `copy-daily-prompt`; Return Bench actions must include `open-last-result`, `copy-compare-invite`, `copy-return-streak`, and one `open-challenge-lane` per visible challenge.
- Return copy must keep the local boundary `本地回访连线，不代表连续登录或真实活跃。` and must not imply real streaks, real activity, real heat, user analytics, or an official schedule.

Daily Return Remix checks:

- Each Featured Daily Return scene must include one `bbti-daily-return-remix` switcher with `data-bbti-daily-return-remix-version="bbti-daily-return-remix-v1"`.
- It must expose exactly three ordered lanes: `daily-event`, `film-room-return`, and `featured-challenge`.
- Lane targets must stay ordered as `daily-event`, `film-room`, and `challenge`; positions must be `1`, `2`, and `3`.
- The default active lane should be `daily-event`.
- Remix copy must keep the local boundary `本地每日主场切换，不代表真实赛程、真实回访或用户行为。` and must not imply real schedule status, real activity, real heat, user analytics, or official events.

Arena Event Bracket checks:

- The `arena-event-bracket` scene must include one `bbti-arena-event-bracket` section with `data-bbti-arena-event-bracket-version="bbti-arena-event-bracket-v1"`.
- It must expose exactly three ordered routes: `event-tipoff`, `challenge-branch`, and `share-return`.
- Route targets must stay ordered as `daily-event`, `challenge`, and `share`; positions must be `1`, `2`, and `3`.
- Each route must expose a matching action with `data-bbti-arena-event-bracket-action` and `data-bbti-arena-event-bracket-action-target`.
- Bracket copy must keep the local boundary `本地情境路线树，不代表真实赛程、真实热度或用户行为。` and must not imply real schedules, real user behavior, real heat, official events, or external sources.

Film Room drill checks:

- The `film-room-drill-card` scene must include one `bbti-film-room-drill`.
- It must expose exactly four `bbti-film-room-drill-step` entries in this order: `evidence`, `tension`, `cross-exam`, `insight`.
- The drill copy surface must stay a local debate-training layer, not an external fact source.

Rivalry script checks:

- The `challenge-rivalry-scripts` scene must include one `bbti-challenge-receipt-board` and three `bbti-challenge-card` entries.
- Each card must expose exactly three `bbti-challenge-rivalry-script` rows in this order: `opener`, `conflict`, `counter`.
- Copy and open-matchup actions must use `data-bbti-challenge-action="copy"` and `data-bbti-challenge-action="open-matchup"` instead of visible button copy.
- Script copy must stay short and basketball-native; external facts still belong in receipts, not in the script lines.

Share Card poster checks:

- The `share-card-poster` scene must include one `bbti-share-kits` shell and one `bbti-share-card` visual surface with `data-bbti-share-card-version="bbti-share-card-v1"`.
- The card surface must expose exactly four `bbti-share-card-axis` rows and three `bbti-share-card-badge` chips.
- Copy/link controls must live outside the visual surface under `bbti-share-card-controls`; the visual surface must not include buttons or `data-bbti-share-card-action`.
- The Share Target picker must expose five ordered target options, exactly one selected target, and the three actions: `system-share`, `copy-active`, and `copy-all`.
- Quick Copy chips must expose five ordered `bbti-share-kit-quick-copy` actions with stable link-kind markers.

Share Kit Locker Room checks:

- The `share-kit-locker-room` scene must include one `bbti-share-locker-room` section with `data-bbti-share-locker-room-version="bbti-share-kit-locker-room-v1"`.
- It must expose exactly three ordered rows: `result-door`, `rematch-door`, and `case-door`.
- Row targets must stay ordered as `result`, `duo`, and `challenge`; ordinary source kits must resolve to `scoreboard`, `duo-invite`, and `challenge`.
- The copy actions must use `copy-locker-room` for the whole board and `copy-route` for each row; the section must include one local boundary marker.
- Links must reuse existing Share Kit link kinds only: result, compare-invite, challenge, and event-challenge. Do not add locker-room prose, row ids, source metadata, or version metadata to URLs.

Share Route Scoreboard checks:

- The `share-route-scoreboard` scene must include one `bbti-share-route-scoreboard` section with `data-bbti-share-route-scoreboard-version="bbti-share-route-scoreboard-v1"`.
- It must expose the source kit `arena-event`, active event id, recommended challenge id, and three ordered rows.
- Rows must stay ordered as `event-tipoff`, `challenge-branch`, and `share-return`, with targets `daily-event`, `challenge`, and `share`.
- The scene must include one copy action `copy-scoreboard`, one Share Target picker, and six quick-copy chips when active Arena Event context exists.
- The default share target should remain `arena-event`, so the copied URL carries only the short event-challenge identifiers.
- Scoreboard copy must keep the local-only boundary and must not imply real schedules, official events, real user behavior, or external heat.

Share Return Lane Check checks:

- The `share-return-lane-check` scene must include one `bbti-share-return-lane-check` section with `data-bbti-share-return-lane-check-version="bbti-share-return-lane-check-v1"`.
- It must expose exactly four ordered rows: `result-return`, `duo-return`, `challenge-return`, and `event-return`.
- Row targets must stay ordered as `result`, `duo`, `challenge`, and `event-challenge`; row statuses are `ready` or `fallback`.
- Ordinary Share Kit scenes should show `ready`, `ready`, `ready`, `fallback`; event-context scenes should show four `ready` rows.
- The copy actions must use `copy-check` for the whole strip and `copy-lane` for each row; the section must include one local boundary marker.
- Return-lane copy must keep the local-only boundary and must not imply real clicks, activity, user behavior, official sources, external heat, or football vocabulary.

Case Postgame checks:

- The `case-postgame-film-room`, `case-postgame-result`, and `case-postgame-arena-event` scenes must each include one `bbti-case-postgame` section with `data-bbti-case-postgame-version="bbti-case-postgame-v1"`.
- The three scenes must expose source markers in order: `film-room-v1`, `result-v1`, and `arena-event-v1`.
- Each scene must expose exactly two session cards: `selected-side` and `winner`, plus exactly two actions: `copy-recap` and `open-bbti-result`.
- Each scene must expose one `bbti-case-postgame-replay-index` with `data-bbti-case-postgame-replay-index-version="bbti-case-postgame-replay-index-v1"` and four ordered rows: `coach-challenge`, `case-source`, `session-verdict`, and `return-link`.
- Replay-index targets must stay ordered as `replay`, `case-source`, `verdict`, and `bbti-result`; replay links must not carry case prose, source URLs, source ids, or version metadata.
- The return URL attribute must keep the short BBTI schema: `bbti`, `challenge`, optional `clip`, and optional `event`; it must not carry case prose, source URLs, or version metadata.
- Visible and copied recap copy must include the session-local boundary and must not imply real win rates, player heat, official sources, or real polls.

ReplayCenter checks:

- The `replay-center-coach-challenge` scene must include one `bbti-replay-center` section with `data-bbti-replay-center-version="bbti-replay-center-v1"`.
- It must expose `data-bbti-replay-center-matchup-id`, `data-bbti-replay-center-topic-id`, `data-bbti-replay-center-round`, `data-bbti-replay-center-side`, and `data-bbti-replay-center-source`.
- `ReplayCenter` source labels are local replay labels, not external verification; do not treat them as official evidence.

Case Battle Mobile Stack checks:

- The `case-battle-mobile-polish` scene must include one `bbti-case-battle-mobile-stack` section with `data-bbti-case-battle-mobile-version="bbti-case-battle-mobile-polish-v1"`.
- It must expose five ordered read steps: `replay`, `advisor`, `controls`, `lens`, and `trail`.
- Step targets must stay ordered as `bbti-replay-center`, `bbti-courtside-advisor`, `bbti-case-battle-mobile-controls`, `bbti-battle-replay-lens`, and `bbti-case-trail`.
- The fixture must include ReplayCenter, CourtSideAdvisor, Battle Replay Lens, Replay Copy Kit, Case Trail, and the mobile controls block in one composed post-vote scene.
- Mobile visual order should bring controls before Lens and Trail, while the DOM keeps child slots source-readable for validators.
- This stack is a local mobile-readability surface only; it must not create new facts, source authority, real behavior claims, or heat language.

Battle Replay Lens checks:

- The `battle-replay-lens-case` scene must include one `bbti-battle-replay-lens` section with `data-bbti-battle-replay-lens-version="bbti-battle-replay-lens-v1"`.
- It must expose the current matchup, topic, next topic, round, voted side, case source, replay source, and step count.
- It must expose exactly four ordered steps: `current-claim`, `counter-replay`, `coach-cue`, and `next-pressure`.
- Step targets must stay ordered as `current-topic`, `replay`, `advisor`, and `next-topic`.
- The lens boundary must read as local single-round reading only and must not imply a replay archive, external verification, real win probability, official conclusion, or user heat.

Replay Copy Kit checks:

- The `battle-replay-lens-case` scene must include one `bbti-battle-replay-copy-kit` section with `data-bbti-battle-replay-copy-kit-version="bbti-battle-replay-copy-kit-v1"`.
- It must expose the source lens version, matchup, topic, round, and item count.
- It must expose exactly three ordered copy items: `group-recap`, `counter-punch`, and `next-question`.
- Copy kit positions must stay ordered as `1`, `2`, and `3`, and each item must use `data-bbti-battle-replay-copy-kit-action="copy"`.
- The copy kit boundary must read as local replay wording only and must not imply real win rates, external rankings, official sources, user behavior, or heat.

## Boundaries

- Fixture output belongs in ignored `out/`, not committed source.
- Source labels are entry paths, not official fact sources.
- Football MBTI can inform process, but BBTI visual copy must stay basketball-native.
