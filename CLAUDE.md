@AGENTS.md

# Kobe vs LeBron — GOAT Debate

## Scope
Interactive debate website: Kobe vs LeBron, pick-a-side PK format.
Deploy target: Railway (web, not WeChat miniprogram).

## Current State (v0.2)
- 12 main debate topics + 3 bonus "What If" hypothetical rounds
- Full game flow: Landing → Pick Side → 12-round Battle → Bonus Intro → 3 Bonus → Result
- Persona system: assigns trash-talk label based on voting pattern
- Personalized roast: calls out contradictions in votes
- Stat bomb reveals: cherry-picked provocative stats after each vote
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
- `src/data/debates.ts` — 12 main + 3 bonus debate topics (both perspectives)
- `src/data/personas.ts` — persona logic, roast generator, stat bombs
- `src/components/GameProvider.tsx` — game state (Context + hooks)
- `src/components/Landing.tsx` — hero landing page
- `src/components/PickSide.tsx` — side selection
- `src/components/BattleArena.tsx` — debate voting + stat bomb reveal
- `src/components/BonusIntro.tsx` — transition screen after 12 main rounds
- `src/components/Result.tsx` — persona + roast + score + vote breakdown

## Phase 2 (planned, needs backend)
1. AI Judge via DeepSeek API (server route + rate limiting)
2. Live global vote counter (Upstash Redis + SSE)
3. Radar chart data visualization (recharts)
4. OG image generation for share cards (next/og)

## Constraints
- No API keys in code — future DeepSeek key goes in `.env` only
- Keep it fun and provocative — this is entertainment, not ESPN analysis
- Content in Chinese, code/commits in English
- Sister project to `../lebron-rebuttal-miniapp/` but fully independent codebase
