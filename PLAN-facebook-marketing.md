# WebistryDev Facebook Marketing — Implementation Plan (owner-approved, execute directly)

Status: owner gave a one-time "go" (15 Oct 2026). Implement the waves below directly on the VPS
without asking for confirmation. Do not stop for permission inside this scope.

## Hard constraints (owner rules — non-negotiable)

- Write ONLY inside the site repo `/home/sherif/sites/webistrydev` and the new folder
  `/home/sherif/sites/webistrydev/facebook/publisher/`. No other paths.
- No git commits / pushes / tags. Preserve ALL existing uncommitted work: run `git status`
  before and after; never overwrite anything already modified.
- No changes to existing page content, CMS, database, or services.
- Free tiers only (budget rule). Never enable a paid plan or metered service.
- Facebook Page access token lives in a chmod 600 env file. Never print, log, or commit it.
- Telegram alerts: critical failures only (token invalid / scheduler dead / disk full).
  No test messages, no routine status. Log-only fallback is acceptable.
- Mobile-first UI. Verify with real browser screenshots at 390x844 and 1440x900,
  Arabic RTL check included, before calling anything done.

## Wave 1 — Lead funnel page `/start`

Goal: https://www.webistrydev.com/start — interactive 4-step quiz that ends in a personalized
phone mockup and a prefilled WhatsApp CTA.

Route: new route/page in the Next.js repo (follow the repo's existing route + i18n pattern —
inspect first: layout, locale segments, translation files). No new backend, no new DB tables,
zero new npm dependencies unless truly unavoidable.

Quiz flow (client-side state only, mobile-first):
1. Business type: furniture showroom / clinic / restaurant / online store / courses / other
2. What do you sell (short free text, optional presets)
3. Goal: more bookings / more sales / look premium / launch new brand
4. Style: luxury / clean / bold
Then: instant phone-frame mockup preview rendered from ~6 curated templates based on real
shipped projects (QOYA collections, Zahrtelkhlig store, clinic booking, portfolio).
Keep templates static/curated — no image generation, no API calls.
Final CTA screen: single WhatsApp button
`https://wa.me/201007526882?text=...` with the quiz answers URL-encoded in the text.
Full AR (RTL) + EN via existing i18n pattern. AR is primary.
Meta Pixel `Lead` event: fire ONLY if a Pixel already exists in the root layout — inspect first;
skip silently if absent. No new tracking scripts.

Media: repo may reuse existing project screenshots/assets. The owner-approved fresh phone
screenshots live on his laptop (not on VPS); if needed, capture equivalents with Playwright
before/after deploy. Do NOT use `launch-ar.png` (contains a misleading fake CTA button).

Verify (each step, evidence in your final message):
- `git status` first (preserve uncommitted work)
- `npx tsc --noEmit` and `next build` pass
- deploy through the repo's existing Vercel workflow (read the repo docs/AGENTS.md for the
  exact command — never hand-roll a deploy)
- live check: https://www.webistrydev.com/start loads
- screenshots at 390x844 (Arabic RTL) and 1440x900; no overflow/overlap; tap targets OK
- WhatsApp link opens with correct prefilled Arabic text

## Wave 2 — Auto-publisher (Graph API)

Folder: `/home/sherif/sites/webistrydev/facebook/publisher/` (create).

- Node script, no framework needed: posts via Graph API
  `POST /{page-id}/photos` (image posts) and `POST /{page-id}/feed` (link/text posts).
  Page ID: `1126001733940519` (facebook.com/WebistryDev, 69 followers).
- Env file `facebook/publisher/.env.facebook` (chmod 600) holds the Page access token.
  Read it at runtime; never echo it. Missing token = dry-run/log mode, NOT a crash.
- Error handling: retry twice with backoff on 5xx/timeouts; on 401/190 (expired/invalid token)
  send one critical Telegram alert and stop (do not retry-spam). Reference alert pattern:
  `/home/sherif/media-health-monitor.mjs` — reuse its pattern but NOT the Ahmed project bot
  token unless clearly same-scope; log-only fallback is acceptable.
- Idempotency: persist post state transitions (published post IDs + schedule slot) in a small
  JSON state file inside the publisher folder so a rerun never double-posts.
- Schedule: daily 8-9 PM Cairo (Africa/Cairo) — cron or systemd timer on the VPS.
  Check existing crontab first; add one entry, do not disturb existing jobs.

OWNER HANDOFF (blocker before first real post): owner must create a Meta app / OAuth step
(~5 min) and drop a long-lived Page token into `.env.facebook`. Until then the scheduler runs
in dry-run (log only). Surface this as ONE short message to the owner — do not redo the
Facebook browser login flow (VPS browser login is CAPTCHA-blocked; local Brave file upload is
extension-blocked; Graph API is the only supported path).

## Wave 3 — Seed content queue + first verified post

- Queue source (already on VPS): `facebook/fresh-launch/PLAN.md` (30-day plan),
  `facebook/fresh-launch/POSTS.md`, `facebook/qoya-announcement-posts.txt`,
  `facebook/conversion-posts.md`. Reformat into the teaser format, add to the queue file:
  - max 2 short lines, punchy, no essay
  - link: https://www.webistrydev.com/start
  - media: existing project screenshots/previews (never launch-ar.png)
- Stagger: one post per day at the scheduled slot.
- First live post must be verified: Graph API returns a post id, fetch it back, log the
  permalink. Report the permalink as evidence. If it fails, alert and leave state unchanged.

## Order of work

Wave 1 (funnel live + verified) -> Wave 2 (publisher built, dry-run scheduled) ->
owner Meta token handoff -> Wave 3 (queue seeded, first post verified).

## Verification bar (global)

Every wave ends with: commands actually run, real screenshots inspected, live URLs checked,
and an evidence report (what changed, what was verified, remaining risks). Never claim
completion without running the checks.
