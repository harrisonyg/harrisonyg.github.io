# Ultimate Mind System / Personal vault

**[upgrade.html](upgrade.html)** — private workspace in the browser: part **Obsidian** (vault, `[[wiki links]]`, backlinks, daily notes, tags), part **Notion** (table view, structured list), part **your tracker** (Today, streak, problem log).

## Login

Passphrase is verified with SHA-256 (`EXPECTED_SHA256` in the HTML) when the page is served over **HTTPS** or **localhost**. Current default passphrase is **`check`** (change both `EXPECTED_SHA256` and `PLAINTEXT_FALLBACK` in the HTML if you use something else).

**Opening `upgrade.html` as `file://`:** browsers block `crypto.subtle`, so the page falls back to **`PLAINTEXT_FALLBACK`** in the script. Keep it identical to your real passphrase for local file use, or serve over HTTPS.

To set a new passphrase: `echo -n 'your-password' | shasum -a 256` → paste hex into `EXPECTED_SHA256`, and set `PLAINTEXT_FALLBACK` to the same string.

Session: `sessionStorage` until you log out or close the tab.

## Assistant (next + calendar)

The **Assistant** tab is your “what do I do next” view:

- **Suggested next** picks, in order: next **calendar** event → first open **assistant todo** → first unchecked **Today** habit.
- **What I’m going through** — freeform context (stored in your browser).
- **Assistant todos** — one-off tasks (not the daily habit list).
- **Calendar** — loads upcoming events from a Netlify function that reads a **secret iCal URL** (so the browser never hits Google directly and avoids CORS issues).

### Enable calendar sync (Netlify)

1. In [Google Calendar](https://calendar.google.com) → **Settings** → your calendar → **Integrate calendar** → copy the **secret address in iCal format** (do not share or commit it).
2. In Netlify: **Site configuration → Environment variables** → add:
   - `GOOGLE_ICAL_URL` = that full `https://calendar.google.com/calendar/ical/.../private-.../basic.ics` URL
3. Deploy the site so `/.netlify/functions/calendar-feed` is live.

GitHub Pages **alone** (no Netlify) cannot read that URL from the server; use Netlify for the repo or another host that can run the function and set the env var.

## What’s inside

| Area | Role |
|------|------|
| **Today** | Habits, quick capture, problem/music fields, Focus & Fast timer |
| **Assistant** | Suggested next, going-through notes, todos, calendar (with Netlify + `GOOGLE_ICAL_URL`) |
| **Vault** | Pages with search, **List / Table** toggle, Edit/Preview, `[[links]]`, **Linked mentions** (backlinks) |
| **Daily** | One note **per calendar day** (like a daily note) |
| **Goals** | Editable goal list |
| **Log / Review** | Completed-day history and simple stats |
| **Graph** | Light stats (page / link / tag counts) — not a full force graph |

Data lives in **`localStorage`** under `upgrade-v3` (tracker + `vault` + `dailyNotes`).

## Tips

- Use `[[Exact page title]]` to link; clicking a link in **Preview** opens or creates the page.
- Tags on a page: use the tags field (`#idea` style) or type `#tag` in the body (highlighted in preview).
- **Quick capture** on Today is separate from **Daily** — Daily is dated longform.

## Security

Static client-side login is **obfuscation only**. Anyone with the file can still inspect code. For real secrets, use a proper backend or host this off the public web.
