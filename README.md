# Logit

Personal timesheet. Use it as a website on your iPhone — no App Store.

Needs **Node.js 20+**.

## Run locally

```bash
npm install
npm run web
```

## Put it on your phone

1. Host the site:

```bash
npm run export:web
npx vercel --yes
```

First time, Vercel asks you to log in (free). It prints a URL.

2. Open that URL in **Safari** (not Chrome).
3. Share → **Add to Home Screen**.
4. Open the new icon.

Hours stay on that phone. Save a backup from Settings now and then — Safari can forget website data if you don’t open it for a long time.

## Tests

```bash
npm test
```

## Folders

- `App.js` — shell
- `src/features/` — screens
- `src/shared/` — UI pieces
- `public/` — website / home-screen icons
