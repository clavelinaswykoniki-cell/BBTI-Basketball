# BBTI Basketball

BBTI Basketball is a Chinese interactive basketball personality test built around a Kobe vs LeBron debate flow. Users pick a side, vote through debate rounds, get a basketball MBTI-style profile, and receive a shareable roast/verdict card.

## Features

- Pick-a-side Kobe vs LeBron debate experience.
- 12 core debate rounds plus bonus "What If" rounds.
- BBTI result profile with personality tags, contradictions, roast copy, and replay/share modules.
- Template-based AI judge fallback that works without an API key.
- Optional DeepSeek-powered judge via `DEEPSEEK_API_KEY`.
- Railway-ready Next.js deployment config.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4

## Local Development

Requirements:

- Node.js `>=20.9.0`
- npm

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

The app works without environment variables because `/api/judge` falls back to a local template verdict.

To enable the LLM-backed judge:

```bash
cp .env.example .env.local
```

Then set:

```bash
DEEPSEEK_API_KEY=your_deepseek_api_key
```

Never commit `.env.local`.

## Production Build

```bash
npm run lint
npm run build
npm run start
```

## Deploy on Railway

This repo includes `railway.toml`.

Current production:

- GitHub: `https://github.com/clavelinaswykoniki-cell/BBTI-Basketball.git`
- Public URL: https://bbti-web-production.up.railway.app/
- Railway project/service: `hopeful-light` / `bbti-web`
- 2026-06-19 release commit: `159b7a3` (`Ship basketball BBTI Railway-ready polish`)
- 2026-06-19 Railway deployment: `db4ed7b3-05c1-4006-93b8-f7c2799115db`
- Pre-release backup branch: `origin/backup/pre-basketball-current-push-20260619-153746`

Railway settings:

- Build command: `npm run build`
- Start command: `npm run start`
- Health check path: `/`
- Optional environment variable: `DEEPSEEK_API_KEY`

If you connect this GitHub repo to Railway, Railway can deploy from the pushed branch. Without `DEEPSEEK_API_KEY`, the public site still runs with the built-in judge fallback.

Rollback preference: preserve history. Test the backup branch first:

```bash
git switch -c rollback-test-basketball origin/backup/pre-basketball-current-push-20260619-153746
```

If production must be rolled back on `main`, prefer reverting the release commit and redeploying rather than force-pushing:

```bash
git switch main
git revert 159b7a3
git push origin main
railway up --detach --message "Rollback basketball release"
```

## Validation Commands

Useful checks before publishing:

```bash
npm run lint
npm run validate:bbti-fixtures
npm run validate:bbti-challenge-pick-replay-kit
npm run build -- --webpack
```

## Notes

- This is a web app, not a WeChat mini program.
- Vote/global counters are local/seeded unless a future backend is added.
- The product copy is intentionally Chinese, basketball-native, and entertainment-focused.
