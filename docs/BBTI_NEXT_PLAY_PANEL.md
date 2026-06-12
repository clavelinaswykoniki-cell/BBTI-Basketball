# BBTI Next Play Panel

## Goal

`BbtiNextPlayPanel` is the result page's action router. It should help the player decide what to do next without reading the whole page.

It is not a second sticky dock and not a marketing explainer. Keep it compact, action-first, and source-aware.

On mobile, the first available action stays as the full decision card; secondary actions render as compact rows so the result page does not become a second content wall. At `sm` and above, all visible actions return to the three-card layout.

## Priority

The resolver keeps the first three available actions in this order:

1. Pending compare invite
2. Incoming shared challenge return
3. Daily Arena Event
4. Primary challenge
5. Film Room review
6. Share Kit

The resolver lives in `src/data/bbti-next-play.ts`. UI rendering lives in `src/components/BbtiNextPlayPanel.tsx`.

## Source Boundaries

- `result`: use only BBTI code, local scoring, type copy, playbook, and local challenge fixtures.
- `film-room`: use only the restored clip, answer text, Coach Timeout, cross-exam, and selected matchup.
- `arena-event`: use local Arena Event scenario and pressure test. Do not imply a real NBA event or real user poll.
- `compare`: use only local pending invite state and the two BBTI codes. Do not prefill an empty `b` code.
- `share`: jump to existing Share Kit; do not generate extra external facts.

No Next Play action should claim real community heat, official ranking, verified NBA fact, or external source unless a future verified source registry explicitly provides it.

## Validation

`npm run validate:bbti-next-play` locks resolver priority, source-specific incoming return copy, `qaKey` coverage, forbidden football terms, hard-claim wording, heat-claim boundaries, and the pending compare secondary action.

`BbtiNextPlayPanel` exposes `data-testid="bbti-next-play-panel"`, `data-next-play-count`, per-action `data-next-play-qa`, `data-next-play-mobile-layout`, and `data-next-play-position` markers so future visual QA can target pending compare, Film Room return, Arena Event return, result return, lightweight result, long-copy stress, and mobile compact-row states. The `result-action-stack` fixture renders it below `BbtiResultActionDock`; repeated challenge/share destinations are allowed only because the dock is sticky navigation while Next Play is a non-sticky ranked router.

`npm run validate:bbti-qa-selectors` also confirms those screenshot selectors remain present, and blocks internal copy such as `Q-level` from returning to user-facing Next Play text.

Run it with the normal BBTI gate before closing changes.
