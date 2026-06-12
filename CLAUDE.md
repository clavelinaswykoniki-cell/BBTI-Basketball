@AGENTS.md

# Kobe vs LeBron — BBTI / GOAT Debate

## Scope
Interactive debate website and basketball MBTI / BBTI result experience, pick-a-side PK format.
Deploy target: Railway (web, not WeChat miniprogram).

## Active BBTI Handoff
Current product work is the BBTI layer. Do not rely on old chat context first; read:
- `docs/BBTI_ADD_FILES_ROADMAP.md`
- `docs/BBTI_FACT_RULES.md`
- `docs/BBTI_VISUAL_QA.md`
- `docs/BBTI_NEXT_PLAY_PANEL.md`
- `docs/BBTI_TEAM_REVIEW.md`

Football MBTI is a process reference only. Keep visible BBTI copy basketball-native.

## Current State (v0.3)
- 12 main debate topics + 3 bonus "What If" hypothetical rounds
- Full game flow: Landing → Pick Side → 12-round Battle → Bonus Intro → 3 Bonus → Result
- Persona system: 12+ personas based on voting patterns (speed-runner, traitor, split personality, etc.)
- Personalized roast: 14+ patterns calling out contradictions in votes
- Stat bomb reveals: cherry-picked provocative stats after each vote
- AI Judge: template-based verdict engine analyzing voting patterns (/api/judge)
- Global vote counter: localStorage-based with seeded baseline data (~2000-5000 per topic)
- Vote reveal: animated bar chart showing "global" vote split after each round
- Global war banner: Kobe army vs LeBron army percentage at top of battle arena
- Speed-runner detection: roasts users who finish too fast (<90s)
- Share text includes persona + roast for viral screenshots
- Production build passes, dev server at localhost:3000

## Tech Stack
- Next.js 16 (App Router, Turbopack)
- Tailwind CSS v4
- TypeScript
- Deploy: Railway (planned)

## Commands
```bash
npm run dev      # dev server
npm run build    # production build
```

## File Structure
- `src/data/debates.ts` — 12 main + 3 bonus debate topics (both perspectives, 虎扑 trash-talk style)
- `src/data/personas.ts` — 12+ persona types, 14+ roast patterns, stat bombs per topic
- `src/lib/voteStats.ts` — localStorage vote counter with seeded baseline data
- `src/components/GameProvider.tsx` — game state (Context + hooks, tracks elapsed time)
- `src/components/Landing.tsx` — hero landing page
- `src/components/PickSide.tsx` — side selection
- `src/components/BattleArena.tsx` — debate voting + stat bomb + vote reveal + global war
- `src/components/BonusIntro.tsx` — transition screen after 12 main rounds
- `src/components/Result.tsx` — persona + roast + AI judge + score + vote breakdown
- `src/components/AiJudge.tsx` — AI verdict card with confidence bar
- `src/components/VoteReveal.tsx` — animated vote split bar chart per topic
- `src/components/GlobalWar.tsx` — Kobe vs LeBron army percentage banner
- `src/app/api/judge/route.ts` — POST endpoint for AI verdict generation

## Phase 2 (planned enhancements)
1. AI Judge → real DeepSeek API (currently template-based, swap to LLM for richer verdicts)
2. Live global vote counter → Upstash Redis + SSE (currently localStorage fake data)
3. Radar chart data visualization (recharts)
4. OG image generation for share cards (next/og)
5. Railway deployment

## Constraints
- No API keys in code — future DeepSeek key goes in `.env` only
- Keep it fun and provocative — this is entertainment, not ESPN analysis
- Content in Chinese, code/commits in English
- Sister project to `../lebron-rebuttal-miniapp/` but fully independent codebase
