# BBTI Add Files Roadmap

This file tracks concrete follow-up slices for future agents. Keep items small, source-aware, and validated before expanding the product surface.

## Current BBTI Slice

The latest shipped Add Files slice is `result-scouting-copy-kit`: the result scouting section now exposes `bbti-result-scouting-copy-kit-v1`, a local three-item copy package for group recap, counter read, and next workout prompts. `resolveBbtiAddFilesSuggestions(...)` keeps shipped slices in the backlog for traceability and continues returning only `stage: "next"` cards in the visible top three. Treat the panel as a living product backlog, not as a changelog or release notes surface.

## Next High-Leverage Slices

1. Shared Challenge Source Preview
   - Baseline shipped as `resolveBbtiShareReturnPrompt(...)` plus `npm run validate:bbti-share-return-prompts`.
   - QA selectors now ship on `BbtiDeepLinkNotice`: expanded/collapsed state, source, source version, preview label, CTA, dismiss/restore, and invalid-clip fallback are covered by `npm run validate:bbti-qa-selectors`.
   - `npm run render:bbti-visual-qa` generates ignored fixtures in `out/bbti-visual-qa/` for Film Room, Arena Event, Result, invalid clip, and collapsed restore states.
   - Next upgrade: visual QA screenshots for `?bbti=OAIL&clip=q12-m0&challenge=kobe-vs-jordan`, `?bbti=OAIL&event=game-7&challenge=lebron-vs-jordan`, and `?bbti=OAIL&challenge=kobe-vs-jordan`.

2. Add Files Suggestion Panel
   - Baseline shipped as `BbtiNextPlayPanel` plus `resolveBbtiNextPlayActions(...)`.
   - Source-copy runtime checks now ship through `npm run validate:bbti-next-play`, including pending compare, Film Room return, Arena Event return, normal result return, lightweight result, and forbidden-copy boundaries.
   - Mobile now keeps the top-priority action as the full card and compresses secondary actions into compact rows; `data-next-play-mobile-layout` and `data-next-play-position` make that layout checkable in fixtures.
   - `result-action-stack` visual QA now renders the sticky `BbtiResultActionDock` immediately above `BbtiNextPlayPanel`, so future Add Files changes can check that the two action areas remain one sticky navigator plus one non-sticky router.
   - `BbtiAddFilesSuggestionPanel` now productizes future Add Files ideas as a separate coach queue below Next Play, using `bbti-add-files-v1`, stable `data-bbti-add-files-*` selectors, CTA scroll targets, and copyable handoff payloads.
   - `npm run validate:bbti-add-files-suggestions` locks suggestion priority, target sections, visible-copy boundaries, and validator-backed payloads.
   - `film-room-quality` now has its first shipped slice: `BbtiFilmRoomDrillCard` renders a copyable four-step drill for the active Film Room clip, and `npm run validate:bbti-film-room-drills` locks the drill shape and copy boundaries.
   - `rivalry-scripts` now has its first shipped slice: challenge evidence packs carry `scriptOpener`, `scriptConflict`, and `scriptCounter`, and the result challenge board renders them with stable copy/open selectors.
   - `share-card-export` now has its first shipped slice: `BbtiShareCard` renders a screenshot-ready poster surface with code, type, four axes, badges, challenge, and copy controls outside the card.
   - `duo-chemistry` now has its first shipped slice: `bbti-lineup-chemistry-v1` creates role split, friction plan, and fit action briefs for compatibility/nemesis cards while keeping full reports in `BbtiCompare`.
   - `coach-queue-refresh` now marks shipped suggestions with `stage: "shipped"` and returns only `stage: "next"` cards in the visible top three, so the queue keeps moving after Add Files slices land.
   - `compare-report-polish` now ships as `bbti-compare-report-v1`: the full compare page shows local score framing, three ordered program segments, a rematch plan, replay cards, axis selectors, and copy payloads without expanding the `a/b` URL schema.
   - `answer-poll-trend` now ships as `bbti-answer-poll-trend-v1`: result pages with local answer history show simulated average tendency, 顺风/拉锯/逆风 buckets, strongest/toughest rounds, and top seats without claiming real votes.
   - `case-postgame-recap` now ships as `bbti-case-postgame-v1`: BattleArena results return to the BBTI report with source-aware recap copy, session score/stand/winner fields, short case return URLs, and no real win-rate or heat claims.
   - `return-streaks` now ships as `bbti-return-streaks-v1`: Entry return surfaces connect the local last result, deterministic daily event, featured challenge, and arena-event case context without claiming real streaks or activity.
   - `case-postgame-replay-index` now ships as `bbti-case-postgame-replay-index-v1`: Case Postgame exposes four ordered replay rows and `ReplayCenter` exposes source/matchup/topic/round selectors without turning either into an external archive.
   - `daily-return-remix` now ships as `bbti-daily-return-remix-v1`: Featured Daily Return exposes a three-lane local switcher for daily event, Film Room return, and featured challenge.
   - `battle-replay-lens` now ships as `bbti-battle-replay-lens-v1`: BattleArena exposes four ordered post-vote lens steps that bind current topic, replay counter, courtside read, next topic, and optional BBTI case context.
   - `visual-regression-pack` now ships as `bbti-visual-regression-pack-v1`: the visual fixture manifest groups scenes into screenshot packs, marks mobile/long-copy/sticky/source risks, and validates every audit selector without adding browser dependencies.
   - `arena-event-bracket` now ships as `bbti-arena-event-bracket-v1`: the Arena Event card exposes a three-step route tree for copying the event prompt, carrying the case into a challenge, and returning through the Share Kit.
   - `replay-copy-kit` now ships as `bbti-battle-replay-copy-kit-v1`: the post-vote lens exposes three copyable group-chat replay packets for recap, counterpunch, and next-question handoff.
   - `duo-rematch-prompts` now ships as `bbti-duo-rematch-prompts-v1`: the full compare report exposes three local复赛追问 without expanding the `a/b` URL schema.
   - `film-room-remix-bench` now ships as `bbti-film-room-remix-bench-v1`: Film Room clips expose a compact local回看替补席 that links the current clip, drill card, and local poll read.
   - `challenge-replay-seeds` now ships as `bbti-challenge-replay-seeds-v1`: shared returns, result challenge cards, and Battle Replay Lens expose the same local开庭种子.
   - `share-kit-locker-room` now ships as `bbti-share-kit-locker-room-v1`: Share Kit exposes a local result/rematch/case routing board without adding a new URL schema.
   - `result-scouting-refresh` now ships as `bbti-result-scouting-refresh-v1`: the result scouting section shows four local lanes with playbook reads and answer evidence.
   - `challenge-lane-scoreboard` now ships as `bbti-challenge-lane-scoreboard-v1`: the result challenge board shows three ordered local routes before opening a matchup.
   - `share-return-lane-check` now ships as `bbti-share-return-lane-check-v1`: Share Kit shows a local four-row short-link health strip before players copy a route.
   - `result-scouting-copy-kit` now ships as `bbti-result-scouting-copy-kit-v1`: Result Scouting exposes three local copy prompts without adding share URL metadata.
   - Next upgrade: `challenge-pick-replay-kit`, `share-target-mobile-polish`, and `scouting-lane-compare-bridge`.

3. Case Registry Versioning
   - Baseline shipped as `bbti-case-v1` on `BbtiChallengeCaseContext` plus hydration output, with source versions `film-room-v1`, `result-v1`, and `arena-event-v1`.
   - `npm run validate:bbti-shared-challenge-hydration` confirms all hydrated sources, fallbacks, and invalid challenge cases carry the same version contract.
   - `npm run validate:bbti-deep-links` confirms shared links stay short and strip internal case/prose params instead of embedding fragile report text in URLs.
   - Next upgrade: visual QA for old shared links after a future version bump, making sure no-version links still hydrate as `bbti-case-v1`.

4. Session-Local Case Trail
   - Baseline shipped as `BbtiChallengeCaseTrail` plus `resolveBbtiChallengeCaseTrail(...)`.
   - It renders only inside BattleArena after a vote, uses existing session votes, and copies only a session-local trail plus the existing short `buildBbtiCaseReturnUrl(...)`.
   - `npm run validate:bbti-case-trail` confirms Film Room, Result, Arena Event, null-context paths, and after-vote next-step state stay source-aware and basketball-native.
   - `npm run validate:bbti-qa-selectors` locks Case Trail source/version/progress and per-step state markers for mobile screenshots.
   - Next upgrade: mobile visual QA in a real case launch, checking the trail does not duplicate Banner/CourtSideAdvisor copy or crowd the next-round controls.

5. Case Postgame Recap
   - Baseline shipped as `bbti-case-postgame-v1` in `src/data/bbti-case-postgame.ts` plus `BbtiCasePostgame`.
   - It renders after a BattleArena result and records only this session's source, score, selected side, winner, case reason, short return URL, and recap copy.
   - `npm run validate:bbti-case-postgame` confirms Film Room, Result, and Arena Event sources, short URL invariants, copy boundaries, and hard-verdict wording.
   - `npm run validate:bbti-visual-qa-fixtures` renders `case-postgame-film-room`, `case-postgame-result`, and `case-postgame-arena-event` scenes.
   - `case-postgame-replay-index` now adds four ordered rows: `coach-challenge`, `case-source`, `session-verdict`, and `return-link`.
   - `npm run validate:bbti-case-replay-index` locks the replay-index version, row order, target order, link boundaries, and ordinary `ReplayCenter` QA selectors.
   - Next upgrade: `case-battle-mobile-polish`, a mobile pass that makes the postgame recap, replay index, Battle Replay Lens, copy kit, and Case Trail scan better together.

6. Battle Replay Lens
   - Baseline shipped as `bbti-battle-replay-lens-v1` in `src/data/bbti-battle-replay-lens.ts`.
   - It renders after a vote in BattleArena and connects four local steps: `current-claim`, `counter-replay`, `coach-cue`, and `next-pressure`.
   - `resolveBbtiBattleReplayLens(...)` reuses local ReplayStatBomb and CourtSideAdvisor reads, plus optional case context, without adding outside evidence or behavior tracking.
   - `npm run validate:bbti-battle-replay-lens` confirms the pure resolver, component selectors, BattleArena mount, step order, target order, copy boundaries, and final-round fallback.
   - `npm run validate:bbti-visual-qa-fixtures` renders `battle-replay-lens-case`.
   - `replay-copy-kit` now ships as `bbti-battle-replay-copy-kit-v1`: Battle Replay Lens resolves three copy items, `group-recap`, `counter-punch`, and `next-question`, from the current local lens.
   - `npm run validate:bbti-battle-replay-lens` now locks copy-kit version, item order, selector contract, and copy boundaries.
   - Next upgrade: `case-battle-mobile-polish`, a mobile pass that makes BattleArena replay lens, copy kit, Case Trail, and next-round controls scan better on 390px screens.

7. Return Streaks
   - Baseline shipped as `bbti-return-streaks-v1` in `src/data/bbti-daily-return.ts`.
   - It builds a local three-step return mainline: last report, deterministic daily event, and featured challenge.
   - `resolveBbtiDailyReturnCaseContext(...)` centralizes the featured arena-event case-context guard, so Featured Daily and Return Bench do not drift.
   - `npm run validate:bbti-return-streaks` confirms all 16 BBTI codes resolve event/challenge/caseContext at a fixed date, keep short result URLs, and avoid fake activity, heat, poll, official, or football copy.
   - `npm run validate:bbti-visual-qa-fixtures` renders `featured-daily-return-arena-context`, `return-bench-streaks`, `entry-return-stack-with-last-result`, and `return-streaks-long-copy-stress`.
   - `daily-return-remix` now ships as `bbti-daily-return-remix-v1`: Featured Daily Return lets players switch between today event, Film Room return, and featured challenge without adding global state or real schedule claims.
   - `npm run validate:bbti-daily-return-remix` confirms all 16 BBTI codes resolve stable lanes, valid local Film Room clip keys, short Film Room URLs, and copy boundaries.
   - `arena-event-bracket` now ships as `bbti-arena-event-bracket-v1`: the selected local event, recommended challenge, and share return path become an ordered route tree without real schedule or analytics language.
   - `share-route-scoreboard` now ships as `bbti-share-route-scoreboard-v1`: active Arena Event context becomes a shareable local scoreboard without adding schedule or source claims.
   - `duo-rematch-prompts` now ships as `bbti-duo-rematch-prompts-v1`, turning duo-report friction into replayable rematch questions.
   - `film-room-remix-bench` now ships as `bbti-film-room-remix-bench-v1`, tying the active Film Room clip, drill card, and local trend read into one compact local回看替补席.
   - `challenge-replay-seeds` now ships as the return-path bridge into challenge starts.
   - Next upgrade: `challenge-pick-replay-kit`, then `share-target-mobile-polish`, then `scouting-lane-compare-bridge`.

8. Arena Event Bracket
   - Baseline shipped as `bbti-arena-event-bracket-v1` in `src/data/bbti-arena-events.ts`.
   - `resolveBbtiArenaEventBracket(...)` resolves three ordered routes: `event-tipoff`, `challenge-branch`, and `share-return`.
   - `src/components/BbtiArenaEvents.tsx` renders the route tree inside the active event card with stable version/event/challenge/category/count selectors plus route/action/target/position markers.
   - `npm run validate:bbti-arena-events` confirms all 16 BBTI codes and all Arena Events resolve route trees with local-only boundaries, stable route order, target order, and no football/live-heat copy.
   - `npm run validate:bbti-visual-qa-fixtures` renders the `arena-event-bracket` scene.
   - `duo-rematch-prompts` now ships as a duo-report layer that turns compare-report tension into safer rematch prompts.
   - `film-room-remix-bench` now ships as a Film Room layer that turns the active clip, drill, and local trend into a compact回看替补席.
   - `challenge-replay-seeds` now ships as the challenge return bridge for shared result/event/clip links.
   - Next upgrade: `challenge-pick-replay-kit`, then `share-target-mobile-polish`, then `scouting-lane-compare-bridge`.

9. Football MBTI Cross-Pollination
   - Keep borrowing FBTI's handoff discipline: repo-local docs, fact boundaries, source-aware state, and small validators.
   - Do not copy football terms into BBTI UI; use football only as product/process reference.

10. Visual QA Pass
   - Baseline shipped as `bbti-visual-regression-pack-v1` in `scripts/render-bbti-visual-qa-fixtures.mjs`.
   - `manifest.json` now exposes `mobile-core`, `return-loop`, `challenge-case`, `share-duo`, and `shared-challenge` audit packs.
   - `npm run validate:bbti-visual-regression-pack` confirms audit packs, risk tags, viewport matrix, selector density, and critical long-copy/sticky/poster/case-source coverage.
   - Capture mobile and desktop screenshots from the manifest packs when a browser is available.
   - Check for overlapping sticky dock, long Chinese labels, CTA text wrapping, card density, poster controls, and source-boundary copy.

11. Case Battle Mobile Polish
   - Baseline shipped as `bbti-case-battle-mobile-polish-v1` in `BbtiCaseBattleMobileStack`.
   - `BattleArena` now wraps the post-vote stack in a stable mobile read-order shell: ReplayCenter, CourtSideAdvisor, controls, Battle Replay Lens, Case Trail, and VoteReveal.
   - Mobile visual order brings `下一题 / 多看 10 秒 / 暂停自动继续` ahead of the dense Lens and Trail blocks, while desktop keeps the old replay-first reading rhythm.
   - `npm run validate:bbti-case-battle-mobile-polish` locks the wrapper version, step order, slot markers, mobile ordering classes, child selectors, and football/fake-heat boundary.
   - `npm run validate:bbti-visual-qa-fixtures` now renders `case-battle-mobile-polish` inside the `challenge-case` audit pack.
   - `share-route-scoreboard` now moves Arena Event route context into the Share Kit without changing BattleArena semantics.
   - `duo-rematch-prompts` now ships under the Compare report without changing BattleArena semantics.
   - `film-room-remix-bench` now ships under Film Room without changing BattleArena semantics.
   - `challenge-replay-seeds` now ships under challenge return paths without changing BattleArena vote semantics.
   - Next upgrade: `challenge-pick-replay-kit`, then `share-target-mobile-polish`, then `scouting-lane-compare-bridge`.

12. Share Route Scoreboard
   - Baseline shipped as `bbti-share-route-scoreboard-v1` in `src/data/bbti-share-kits.ts`.
   - `resolveBbtiShareRouteScoreboard(...)` turns active Arena Event context and its recommended challenge into three local rows: `event-tipoff`, `challenge-branch`, and `share-return`.
   - `src/components/BbtiShareKits.tsx` renders the route scoreboard only when an event-challenge share kit exists, with stable event/challenge/count selectors and a copy action.
   - `npm run validate:bbti-share-route-scoreboard` locks the pure resolver, Share Kit selectors, row order, target order, visual scene, and local-only boundary.
   - `npm run validate:bbti-visual-qa-fixtures` now renders `share-route-scoreboard` inside the `share-duo` audit pack.
   - `film-room-remix-bench` now ships in Film Room, so Share Kit can stay focused on route/copy polish.
   - `challenge-replay-seeds` now ships, so Share Kit can connect the return-path bridge into the locker-room routing polish.
   - `share-kit-locker-room` now ships as the local result/rematch/case routing board.
   - Next upgrade: `challenge-pick-replay-kit`, then `share-target-mobile-polish`, then `scouting-lane-compare-bridge`.

13. Duo Rematch Prompts
   - Baseline shipped as `bbti-duo-rematch-prompts-v1` in `src/data/bbti-rivalries.ts`.
   - `getBbtiCompareReport(...)` now derives three ordered local prompts: `standard-lock`, `receipt-swap`, and `last-shot`.
   - `src/components/BbtiCompare.tsx` renders the复赛追问板 below the program/rematch plan, with stable code/count/axis/position selectors and a copy-prompts action.
   - `npm run validate:bbti-duo-rematch-prompts` locks all 256 code pairs, prompt order, qa keys, copy payloads, visual scene coverage, and the local-only boundary.
   - `npm run validate:bbti-visual-qa-fixtures` now renders `duo-rematch-prompts` inside the `share-duo` audit pack.
   - `film-room-remix-bench` now ships in Film Room; Compare keeps only duo-report replay prompts.
   - `challenge-replay-seeds` now ships as a challenge-return layer separate from Compare rematch prompts.
   - Next upgrade: `challenge-pick-replay-kit`, then `share-target-mobile-polish`, then `scouting-lane-compare-bridge`.

14. Film Room Remix Bench
   - Baseline shipped as `bbti-film-room-remix-bench-v1` in `src/data/bbti-film-room-remix-bench.ts`.
   - `src/components/BbtiFilmRoomRemixBench.tsx` renders three compact rows in fixed order: `clip-read`, `drill-card`, and `poll-read`.
   - `BbtiFilmRoomClips` mounts the bench beside the active Film Room clip and drill card, while `BbtiResult` passes the local answer-poll summary when local answers exist.
   - `npm run validate:bbti-film-room-remix-bench` locks version, row order, target order, copy payloads, source labels, selectors, visual fixture coverage, and the local boundary.
   - `npm run validate:bbti-visual-qa-fixtures` renders `film-room-remix-bench` inside the `mobile-core` audit pack.
   - `challenge-replay-seeds` now ships after Film Room Remix Bench and connects shared returns to challenge starts.
   - Next upgrade: `challenge-pick-replay-kit`, then `share-target-mobile-polish`, then `scouting-lane-compare-bridge`.

15. Challenge Replay Seeds
   - Baseline shipped as `bbti-challenge-replay-seeds-v1` in `src/data/bbti-challenge-replay-seeds.ts`.
   - `src/components/BbtiChallengeReplaySeeds.tsx` renders three ordered rows: `source-lock`, `opening-pressure`, and `replay-lens`.
   - `BbtiChallengeReceiptBoard`, `BbtiDeepLinkNotice`, and `BbtiBattleReplayLens` each mount the same local seed strip without expanding shared URLs or changing BattleArena vote state.
   - `npm run validate:bbti-challenge-replay-seeds` locks version, row order, target order, copy payloads, hydration output, component selectors, visual fixture coverage, and local-only boundaries.
   - `npm run validate:bbti-visual-qa-fixtures` renders `challenge-replay-seeds` inside the `challenge-case` audit pack.
   - Next upgrade: `challenge-pick-replay-kit`, then `share-target-mobile-polish`, then `scouting-lane-compare-bridge`.

16. Share Kit Locker Room
   - Baseline shipped as `bbti-share-kit-locker-room-v1` in `src/data/bbti-share-kits.ts`.
   - `resolveBbtiShareLockerRoom(...)` resolves three ordered rows: `result-door`, `rematch-door`, and `case-door`.
   - `src/components/BbtiShareKits.tsx` renders the local routing board inside Share Kit with stable version/code/count, row, target, source-kit, link-kind, position, action, and boundary selectors.
   - `npm run validate:bbti-share-kit-locker-room` locks ordinary and event-context source kits, row order, target order, copy boundaries, component selectors, docs coverage, and visual fixture coverage.
   - `npm run validate:bbti-visual-qa-fixtures` renders `share-kit-locker-room` inside the `share-duo` audit pack.
   - Next upgrade: `challenge-pick-replay-kit`, then `share-target-mobile-polish`, then `scouting-lane-compare-bridge`.

17. Result Scouting Refresh
   - Baseline shipped as `bbti-result-scouting-refresh-v1` in `src/data/bbti-playbook.ts`.
   - `resolveBbtiResultScoutingReport(...)` resolves four ordered lanes: `pace-read`, `proof-read`, `usage-read`, and `stakes-read`.
   - `src/components/BbtiResult.tsx` renders the four-lane scouting section at the existing `bbti-scouting` anchor, with local score bars, playbook reads, workout/counter prompts, answer evidence, and a boundary marker.
   - `src/components/MyTeamResultCard.tsx` now supports optional BBTI QA selectors only when the BBTI result page passes a QA context, so the shared card component does not force BBTI selectors onto other result surfaces.
   - `npm run validate:bbti-result-scouting-refresh` locks all 16 BBTI codes, lane order, axis order, evidence counts, copy boundaries, component selectors, docs coverage, and visual fixture coverage.
   - `npm run validate:bbti-visual-qa-fixtures` renders `result-scouting-refresh` inside the `mobile-core` audit pack.
   - `challenge-lane-scoreboard` now ships as the next challenge-board slice, so Result Scouting can stay focused on four-axis interpretation.
   - Next upgrade: `challenge-pick-replay-kit`, then `share-target-mobile-polish`, then `scouting-lane-compare-bridge`.

18. Challenge Lane Scoreboard
   - Baseline shipped as `bbti-challenge-lane-scoreboard-v1` in `src/data/bbti-challenges.ts`.
   - `resolveBbtiChallengeLaneScoreboard(...)` resolves three ordered local routes: `same-court`, `counter-court`, and `overtime-court`.
   - `src/components/BbtiChallengeReceiptBoard.tsx` renders the route picker above the challenge cards, with stable version/code/count, row, target, category, matchup, position, copy, open-lane, and boundary selectors.
   - `scripts/validate-bbti-challenge-lane-scoreboard.mjs`, `scripts/validate-bbti-qa-selectors.mjs`, `scripts/render-bbti-visual-qa-fixtures.mjs`, and `scripts/validate-bbti-visual-regression-pack.mjs` lock all 16 BBTI codes, route order, target order, visual scene coverage, audit-pack placement, and local-only boundaries.
   - `npm run validate:bbti-visual-qa-fixtures` renders `challenge-lane-scoreboard` inside the `challenge-case` audit pack.
   - `share-return-lane-check` now ships as the next Share Kit slice, so the challenge board can stay focused on route picking.
   - Next upgrade: `challenge-pick-replay-kit`, then `share-target-mobile-polish`, then `scouting-lane-compare-bridge`.

19. Share Return Lane Check
   - Baseline shipped as `bbti-share-return-lane-check-v1` in `src/data/bbti-share-kits.ts`.
   - `resolveBbtiShareReturnLaneCheck(...)` resolves four ordered local rows: `result-return`, `duo-return`, `challenge-return`, and `event-return`.
   - `src/components/BbtiShareKits.tsx` renders the return health strip above the locker-room board, with stable version/code/count, row, target, status, source-kit, link-kind, position, copy-check, copy-lane, and boundary selectors.
   - `scripts/validate-bbti-share-return-lane-check.mjs`, `scripts/validate-bbti-qa-selectors.mjs`, `scripts/render-bbti-visual-qa-fixtures.mjs`, and `scripts/validate-bbti-visual-regression-pack.mjs` lock ordinary fallback status, event-context ready status, visual scene coverage, audit-pack placement, and local-only boundaries.
   - `npm run validate:bbti-visual-qa-fixtures` renders `share-return-lane-check` inside the `share-duo` audit pack.
   - `result-scouting-copy-kit` now ships as the next result-page slice, so Share Kit can stay focused on route and mobile share polish.
   - Next upgrade: `challenge-pick-replay-kit`, then `share-target-mobile-polish`, then `scouting-lane-compare-bridge`.

20. Result Scouting Copy Kit
   - Baseline shipped as `bbti-result-scouting-copy-kit-v1` in `src/data/bbti-playbook.ts`.
   - `resolveBbtiResultScoutingCopyKit(...)` resolves three ordered local copy items from the current scouting report: `group-recap`, `counter-read`, and `next-workout`.
   - `src/components/BbtiResult.tsx` renders the copy package inside the Result Scouting section with stable version/source/code/count, item, target, source-lane, source-axis, copy action, and boundary selectors.
   - `scripts/validate-bbti-result-scouting-copy-kit.mjs`, `scripts/validate-bbti-qa-selectors.mjs`, `scripts/render-bbti-visual-qa-fixtures.mjs`, and `scripts/validate-bbti-visual-regression-pack.mjs` lock all 16 BBTI codes, item order, visual scene coverage, audit-pack placement, and local-only boundaries.
   - `npm run validate:bbti-visual-qa-fixtures` renders `result-scouting-copy-kit` inside the `mobile-core` audit pack.
   - Next upgrade: `challenge-pick-replay-kit`, then `share-target-mobile-polish`, then `scouting-lane-compare-bridge`.

## Add Files QA Matrix

| Scenario | Target component | File scope | Viewport | Pass condition | Validator |
| --- | --- | --- | --- | --- | --- |
| `?bbti=OAIL&clip=q12-m0&challenge=kobe-vs-jordan` | Shared Challenge / Film Room | `BbtiDeepLinkNotice`, `render-bbti-visual-qa-fixtures.mjs` | 390x844, 1280x900 | Shows `film-room-v1`, preview, CTA, no fake heat copy | `validate:bbti-share-return-prompts`, `validate:bbti-visual-qa-fixtures` |
| `?bbti=OAIL&event=game-7&challenge=lebron-vs-jordan` | Shared Challenge / Arena Event | `BbtiDeepLinkNotice`, hydration data | 390x844, 1280x900 | Shows Arena Event source and pressure test | `validate:bbti-shared-challenge-hydration`, `validate:bbti-visual-qa-fixtures` |
| `?bbti=OAIL&challenge=kobe-vs-jordan` | Shared Challenge / Result | `BbtiDeepLinkNotice`, prompt resolver | 390x844, 1280x900 | Shows result return, not Film Room/Event copy | `validate:bbti-share-return-prompts`, `validate:bbti-visual-qa-fixtures` |
| `?bbti=OAIL&clip=q12&challenge=kobe-vs-jordan` | Invalid clip fallback | `BbtiDeepLinkNotice` | 390x844 | Shows invalid-clip fallback; dismiss key does not collide with no-clip link | `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Pending compare + incoming return | Next Play Panel | `BbtiNextPlayPanel`, `bbti-next-play.ts` | 390x844 | First action has `data-next-play-mobile-layout="primary"`; secondary actions have compact layout and stable `data-next-play-qa` | `validate:bbti-next-play`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Long-copy result router | Next Play Panel | `BbtiNextPlayPanel`, fixture renderer | 390x844 | Long invite/event/matchup copy keeps one DOM node per action, unique `data-next-play-qa`, and ordered positions | `validate:bbti-visual-qa-fixtures` |
| Result action stack | Action Dock + Next Play | `BbtiResultActionDock`, `BbtiResultTabs`, `BbtiNextPlayPanel`, fixture renderer | 390x844, 1280x900 | Exactly one sticky Action Dock renders before exactly one non-sticky Next Play panel; dock actions expose `primary-challenge`, `custom-challenge`, `compare`, and `share`; overlapping destinations are allowed, but sticky navigation and ranked recommendations must stay separate | `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Result scouting refresh | Result scouting | `BbtiResult`, `MyTeamResultCard`, `bbti-playbook.ts`, fixture renderer | 390x844, 1280x900 | MyTeam card and four scouting lanes expose local scores, playbook reads, answer evidence, and the local-only boundary | `validate:bbti-result-scouting-refresh`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Result scouting copy kit | Result scouting | `BbtiResult`, `bbti-playbook.ts`, fixture renderer | 390x844, 1280x900 | Result Scouting exposes three ordered copy prompts for group recap, counter read, and next workout without adding share URL metadata or external-source claims | `validate:bbti-result-scouting-copy-kit`, `validate:bbti-result-scouting-refresh`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Coach queue Add Files panel | Add Files suggestions | `BbtiAddFilesSuggestionPanel`, `bbti-add-files-suggestions.ts`, fixture renderer | 390x844, 1280x900 | Shows three basketball-native next-stage improvement cards with `bbti-add-files-v1`, ordered positions, valid scroll targets, copy controls, target files, validators, and no shipped suggestions in the visible top queue | `validate:bbti-add-files-suggestions`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| `?a=OAIL&b=DAIR` full duo report | Compare report program | `BbtiCompare`, `bbti-rivalries.ts`, fixture renderer | 390x844, 1280x900 | Shows local BBTI score framing, three ordered program segments, one rematch plan, stable axis/replay/action selectors, and no report prose in the URL | `validate:bbti-compare-report`, `validate:bbti-deep-links`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| `?a=OAIL&b=DETR` duo rematch prompts | Compare report rematch | `BbtiCompare`, `bbti-rivalries.ts`, fixture renderer | 390x844, 1280x900 | Shows three ordered复赛追问 rows, axis markers, copy-prompts action, short compare URL boundary, and no external relationship or win-rate claims | `validate:bbti-duo-rematch-prompts`, `validate:bbti-compare-report`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Local result answer history | Answer Poll Trend | `BbtiAnswerPollTrend`, `bbti-answer-polls.ts`, fixture renderer | 390x844, 1280x900 | Shows only when local answers exist; source is `local-simulation`; exposes average tendency, three buckets, strongest/toughest rounds, top seats, copy action, and the local-simulation disclaimer | `validate:bbti-answer-poll-trend`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Film Room drill card | Film Room quality | `BbtiFilmRoomDrillCard`, `bbti-film-room-drills.ts`, `BbtiFilmRoomClips`, fixture renderer | 390x844, 1280x900 | Active clip exposes one four-step drill with evidence, tension, cross-exam, and insight steps; copy payload stays basketball-native and source-safe | `validate:bbti-film-room`, `validate:bbti-film-room-drills`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Film Room remix bench | Film Room quality | `BbtiFilmRoomRemixBench`, `bbti-film-room-remix-bench.ts`, `BbtiFilmRoomClips`, fixture renderer | 390x844, 1280x900 | Active clip exposes three ordered local回看 rows: `clip-read`, `drill-card`, and `poll-read`; source labels stay local and copy payload includes the boundary | `validate:bbti-film-room-remix-bench`, `validate:bbti-film-room`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Challenge replay seeds | Challenge return paths | `BbtiChallengeReplaySeeds`, `bbti-challenge-replay-seeds.ts`, `BbtiChallengeReceiptBoard`, `BbtiDeepLinkNotice`, `BbtiBattleReplayLens`, fixture renderer | 390x844, 1280x900 | Result cards, shared returns, and Battle Replay Lens expose three ordered seed rows without putting seed prose into URLs | `validate:bbti-challenge-replay-seeds`, `validate:bbti-shared-challenge-hydration`, `validate:bbti-battle-replay-lens`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Challenge lane scoreboard | Challenge route picker | `BbtiChallengeReceiptBoard`, `bbti-challenges.ts`, fixture renderer | 390x844, 1280x900 | Result challenge board exposes three ordered local routes before opening a matchup, with copy/open-lane actions and the local-only boundary | `validate:bbti-challenge-lane-scoreboard`, `validate:bbti-fixtures`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Rivalry scripts challenge board | Challenge receipts | `BbtiChallengeReceiptBoard`, `bbti-challenge-evidence.ts`, fixture renderer | 390x844, 1280x900 | Each visible challenge card exposes three ordered脚本 lines and copy/open actions; scripts stay short, basketball-native, and separate from evidence receipts | `validate:bbti-fixtures`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures`, `validate:bbti-sources` |
| Share card poster | Share card export | `BbtiShareCard`, `BbtiResult`, fixture renderer | 390x844, 1280x900 | Card surface exposes code, overall, four axes, three badges, and next challenge while copy/link buttons remain outside the card | `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Share Kit locker room | Share Kits routing | `BbtiShareKits`, `bbti-share-kits.ts`, fixture renderer | 390x844, 1280x900 | Share Kit exposes result, duo rematch, and challenge entry lanes without adding a new URL schema or external source claims | `validate:bbti-share-kit-locker-room`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Share route scoreboard | Share Kits + Arena Event route | `BbtiShareKits`, `bbti-share-kits.ts`, `bbti-arena-events.ts`, fixture renderer | 390x844, 1280x900 | Event-context Share Kit exposes three ordered scoreboard rows, event/challenge selectors, event-challenge links, and the local-only scoreboard boundary | `validate:bbti-share-route-scoreboard`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Share return lane check | Share Kits return health | `BbtiShareKits`, `bbti-share-kits.ts`, fixture renderer | 390x844, 1280x900 | Share Kit exposes result, duo, challenge, and event return rows with ready/fallback status without adding analytics or new URL schema | `validate:bbti-share-return-lane-check`, `validate:bbti-share-kit-locker-room`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Duo chemistry cards | Lineup Chemistry | `BbtiLineupChemistry`, `bbti-lineup-chemistry.ts`, fixture renderer | 390x844, 1280x900 | Compatibility and nemesis cards each expose role split, friction plan, fit action, copy invite, and open-compare actions without putting prose into URLs | `validate:bbti-lineup-chemistry`, `validate:bbti-deep-links`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| After-vote case battle | Case Trail | `BbtiChallengeCaseTrail`, `bbti-challenge-case-trail.ts`, `BattleArena.tsx` | 390x844 | Case mode pauses auto-advance and marks next unanswered round as current | `validate:bbti-case-trail`, `validate:bbti-visual-qa-fixtures` |
| Battle result case recap | Case Postgame | `BbtiCasePostgame`, `bbti-case-postgame.ts`, `Result.tsx`, fixture renderer | 390x844, 1280x900 | Film Room, Result, and Arena Event recaps expose version/source/session/return/action selectors, short return URLs, and the session-local boundary | `validate:bbti-case-postgame`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Case replay index | Case Postgame + ReplayCenter | `BbtiCasePostgame`, `ReplayCenter`, `bbti-case-postgame.ts`, fixture renderer | 390x844, 1280x900 | Postgame exposes four ordered replay-index rows and ReplayCenter exposes version/source/side/matchup/topic/round selectors without leaking case prose into links | `validate:bbti-case-replay-index`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Post-vote replay lens | Battle Replay Lens | `BbtiBattleReplayLens`, `BattleArena`, `bbti-battle-replay-lens.ts`, fixture renderer | 390x844, 1280x900 | After-vote lens exposes current claim, counter replay, coach cue, and next pressure with local-only boundary and optional case source | `validate:bbti-battle-replay-lens`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Replay copy kit | Battle Replay Lens | `BbtiBattleReplayLens`, `bbti-battle-replay-lens.ts`, fixture renderer | 390x844, 1280x900 | After-vote lens exposes three copyable replay packets: `group-recap`, `counter-punch`, and `next-question`, with local-only copy boundary | `validate:bbti-battle-replay-lens`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Case Battle mobile stack | BattleArena post-vote stack | `BbtiCaseBattleMobileStack`, `BattleArena`, `ReplayCenter`, `CourtSideAdvisor`, `BbtiBattleReplayLens`, `BbtiChallengeCaseTrail`, fixture renderer | 390x844, 1280x900 | Post-vote mobile stack exposes five ordered read steps, moves controls before the dense Lens/Trail blocks on mobile, and keeps source labels local | `validate:bbti-case-battle-mobile-polish`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Entry returning-player mainline | Return Streaks | `BbtiEntry`, `BbtiFeaturedDailyReturn`, `BbtiReturnBench`, `bbti-daily-return.ts` | 390x844, 1280x900 | Entry stack exposes one Featured Daily card and one Return Bench, both using `bbti-return-streaks-v1` and the same arena-event case context | `validate:bbti-return-streaks`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Daily return remix | Featured Daily Return | `BbtiDailyReturnRemix`, `BbtiFeaturedDailyReturn`, `bbti-daily-return.ts`, fixture renderer | 390x844, 1280x900 | Featured return card exposes three ordered lanes: `daily-event`, `film-room-return`, and `featured-challenge`; default lane is daily event and boundary says local switch only | `validate:bbti-daily-return-remix`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Arena event bracket | Arena Events | `BbtiArenaEvents`, `bbti-arena-events.ts`, fixture renderer | 390x844, 1280x900 | Active event card exposes three ordered local routes: `event-tipoff`, `challenge-branch`, and `share-return`, with targets `daily-event`, `challenge`, and `share` plus local-only boundary | `validate:bbti-arena-events`, `validate:bbti-qa-selectors`, `validate:bbti-visual-qa-fixtures` |
| Visual regression pack | Visual QA manifest | `render-bbti-visual-qa-fixtures.mjs`, `validate-bbti-visual-regression-pack.mjs`, `BBTI_VISUAL_QA.md` | 390x844, 1280x900 | Manifest exposes fixed audit packs, scene groups, risk packs, mobile checklists, and selector-backed audit points without browser dependencies | `validate:bbti-visual-regression-pack`, `validate:bbti-visual-qa-fixtures` |

## Validation Baseline

Run this before closing any BBTI feature slice:

```bash
npx tsc --noEmit
npm run lint
npm run validate:bbti-deep-links
npm run validate:bbti-arena-events
npm run validate:bbti-fixtures
npm run validate:bbti-film-room
npm run validate:bbti-film-room-drills
npm run validate:bbti-film-room-remix-bench
npm run validate:bbti-challenge-replay-seeds
npm run validate:bbti-challenge-lane-scoreboard
npm run validate:bbti-lineup-chemistry
npm run validate:bbti-compare-report
npm run validate:bbti-duo-rematch-prompts
npm run validate:bbti-answer-poll-trend
npm run validate:bbti-result-scouting-refresh
npm run validate:bbti-result-scouting-copy-kit
npm run validate:bbti-share-route-scoreboard
npm run validate:bbti-share-kit-locker-room
npm run validate:bbti-share-return-lane-check
npm run validate:bbti-share-return-prompts
npm run validate:bbti-next-play
npm run validate:bbti-add-files-suggestions
npm run validate:bbti-case-trail
npm run validate:bbti-case-postgame
npm run validate:bbti-case-replay-index
npm run validate:bbti-battle-replay-lens
npm run validate:bbti-case-battle-mobile-polish
npm run validate:bbti-return-streaks
npm run validate:bbti-daily-return-remix
npm run validate:bbti-visual-regression-pack
npm run validate:bbti-qa-selectors
npm run validate:bbti-visual-qa-fixtures
npm run validate:bbti-sources
git diff --check
npm run build -- --webpack
```
