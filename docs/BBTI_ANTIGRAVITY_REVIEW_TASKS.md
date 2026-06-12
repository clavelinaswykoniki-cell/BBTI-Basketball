# BBTI Antigravity Review Tasks

Use Antigravity as a read-only reviewer. Do not let it edit files directly in this repo while Codex is implementing the current Add Files slice.

## Role

You are a product QA reviewer for the Basketball MBTI / BBTI Next.js app in:

`/Users/happytang/Documents/New project/kobe-vs-lebron`

Your job is to find concrete UI, copy, interaction, and validation risks. Do not rewrite code. Return findings with file paths, selectors, screenshots if available, and clear reproduction steps.

## Hard Rules

- Read only. Do not modify files.
- Do not import football terms or football UI language into BBTI.
- Treat the app as local basketball personality/replay content, not official data, real rankings, real heat, analytics, schedules, or user behavior.
- Do not recommend adding source URLs, live data, poll claims, official verification, or real popularity language.
- Prioritize issues visible to a player on mobile first, then desktop.

## Current Main Slice

Codex is implementing `challenge-pick-replay-kit`.

Inspect the challenge-entry area around:

- `src/components/BbtiChallengeReceiptBoard.tsx`
- `src/components/BbtiChallengeReplaySeeds.tsx`
- `src/data/bbti-challenges.ts`
- `src/data/bbti-challenge-replay-seeds.ts`
- `src/data/bbti-add-files-suggestions.ts`
- `scripts/render-bbti-visual-qa-fixtures.mjs`
- `docs/BBTI_FACT_RULES.md`
- `docs/BBTI_VISUAL_QA.md`
- `docs/BBTI_ADD_FILES_ROADMAP.md`

## Task 1: Mobile Visual Pass

Review the BBTI result page at 390px width and find:

- Text overflow or cramped Chinese copy.
- Buttons with labels that wrap badly or look too dense.
- Cards that feel stacked without enough hierarchy.
- Sticky Action Dock overlap with section anchors.
- Challenge board density around route picker, replay seeds, and challenge cards.
- Share Kit density after return lane check and locker room panels.

Return each finding with:

- Page/scene.
- Screenshot or exact selector if possible.
- What looks wrong.
- Recommended fix in one sentence.

## Task 2: Challenge Board Replay Flow

Focus on the challenge board and answer:

- Is the order easy to understand: route picker -> replay/pick prep -> challenge cards -> open matchup?
- Does the user understand what to do before tapping "开战"?
- Are `Replay Seeds`, pressure questions, scripts, and receipts too repetitive?
- Is there one obvious next action on mobile?
- Does any copy imply real schedule, heat, official proof, or user analytics?

Return a short ranked list of UX problems.

## Task 3: Long Copy Stress

Find copy that might overflow or dominate cards:

- Long matchup titles.
- Long pressure questions.
- Long challenge reasons.
- Long return/challenge labels.
- Long Share Kit target text.
- Long Add Files suggestion titles or bodies.

For each problem, say whether it needs truncation, line-clamp, smaller text, or layout change.

## Task 4: Add Files Queue Audit

Inspect the Add Files suggestion panel and data file:

- Verify only `stage: "next"` items are visible in the top queue.
- Confirm shipped slices do not still appear as top suggestions.
- Confirm the top three next items are coherent and target different useful surfaces.
- Flag if any suggestion is too vague, too internal, or not player-facing enough.

Do not change the queue. Return a proposed next-three order if you disagree.

## Task 5: Fact Boundary / Vocabulary Cleanup

Search visible copy and copied text for forbidden or risky language:

- Football terms: `足球`, `VAR`, `点球`, `FUT`, `德比`.
- Official/external terms: `官方`, `认证`, `公认`, `全网`, `真实热度`, `实时热度`, `用户投票`, `播放量`, `热搜`, `多数球迷`.
- Internal QA terms in user-facing UI: `selector`, `sourceVersion`, `sourceId`, `Q-level`, `validator`, `Add Files`.

Return exact files/lines and the safer basketball-native replacement.

## Task 6: Interaction Bugs

Manually check:

- Copy buttons show copied/failed state clearly.
- Manual copy fallback appears only when needed.
- Challenge row clicks open the expected matchup.
- Share target picker selected state is obvious.
- Compare invite links do not carry prose or internal metadata.
- Deep links keep short params only.

Return repro steps and expected vs actual behavior.

## Task 7: Visual QA Artifact Review

If fixtures are available under `out/bbti-visual-qa/`, inspect:

- `index.html`
- `manifest.json`

Check whether the scenes cover:

- `mobile-core`
- `challenge-case`
- `share-duo`
- `shared-challenge`
- `return-loop`

Flag any missing scene that should exist for `challenge-pick-replay-kit`.

## Output Format

Return findings like this:

```md
## P0 / Must Fix
- [file:line or selector] Problem. Why it matters. Suggested fix.

## P1 / Should Fix
- ...

## P2 / Polish
- ...

## No Issue Found
- Areas checked with no problems.
```

Keep the report factual. Do not make code changes.
