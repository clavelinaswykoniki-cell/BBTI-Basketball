# Handoff

## 2026-06-19 GitHub + Railway Release

Current public basketball BBTI release is complete.

### Live State

- GitHub remote: `https://github.com/clavelinaswykoniki-cell/BBTI-Basketball.git`
- Branch: `main`
- Release commit: `159b7a3` (`Ship basketball BBTI Railway-ready polish`)
- Public URL: https://bbti-web-production.up.railway.app/
- Railway project/service: `hopeful-light` / `bbti-web`
- Railway deployment: `db4ed7b3-05c1-4006-93b8-f7c2799115db`
- Deployment status checked with `railway deployment list --json`: `SUCCESS`
- Public HTTP check: `HTTP/2 200`
- Public page title checked: `BBTI | 篮球人格测试`

### Rollback Point

- Backup branch pushed before this release: `origin/backup/pre-basketball-current-push-20260619-153746`
- Backup branch points to previous remote `main` commit: `dde7c95`
- Prefer testing rollback with:

```bash
git switch -c rollback-test-basketball origin/backup/pre-basketball-current-push-20260619-153746
```

- If production needs rollback while preserving Git history, revert the runtime release commit and redeploy:

```bash
git switch main
git revert 159b7a3
git push origin main
railway up --detach --message "Rollback basketball release"
```

### Verification Used

```bash
npm run lint
npm run build
PORT=3101 npm start
curl -sS -D - https://bbti-web-production.up.railway.app/ -o /tmp/bbti-current.html
rg -n "<title>|篮球|BBTI|MBTI|Kobe|LeBron" /tmp/bbti-current.html | head -30
railway deployment list --json
```

### Notes For Next Session

- Do not create a duplicate Railway service; continue using `hopeful-light` / `bbti-web`.
- The app is configured for Railway standalone serving with `output: "standalone"` and `npm run start`.
- `/api/judge` has a local fallback, so the public site still works without `DEEPSEEK_API_KEY`.
