# Ultimate Mind System

ADHD-friendly personal growth app: **execution** (Today) and **reflection** (problem log, notes, taste, review) with everything stored in **localStorage**.

### ADHD-oriented UX

- **One thing right now** — single field for the next *physical* step (reduces working-memory load).
- **Energy check-in** — Low / OK / High (optional); nudges get gentler on low-energy days.
- **Gentle list** — Shows 3 tasks first; expand for the full list anytime. Progress % and streak still use all tasks.
- **Timer presets** — 2 / 5 / 10 / 25 minutes (default 2m) to beat paralysis without a huge commitment.
- **Coaching copy** — Shame-free language; skipped tasks framed as normal, not failure.

## Run locally

```bash
cd ultimate-mind
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
```

Static files go to `dist/`. Deploy that folder to any static host, or copy into your GitHub Pages site.

## Keyboard shortcuts

| Key | Action        |
|-----|---------------|
| 1–4 | Jump to tab   |
| F   | Focus mode    |
| G   | Fast 60s mode |
| D   | Dark / light  |
| ?   | Shortcut help |

## Storage

Key: `ums-v1` in `localStorage` (separate from `upgrade.html`’s `upgrade-v3`).
