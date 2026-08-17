# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sherif's freelance developer portfolio and lead-generation site (brand: **Webistrydev**). A single-page Next.js portfolio showcasing projects/services/pricing, with a voice-or-text inquiry form that writes leads to Neon PostgreSQL, notifies Sherif via email (Resend) and Telegram, and gives each lead a private token-based chat link with the admin.

- Live: https://www.webistrydev.com
- Admin panel: `/admin` (password hardcoded as `ADMIN_PW` in `app/admin/page.tsx`, currently `114891`)
- Deploy target: Vercel — auto-deploys on every push to `main`. (The project previously ran on a VPS + PM2; that migration is complete. `next.config.ts` still has a legacy redirect from the old `webistrydev.vercel.app` preview URL to the production domain — that redirect is unrelated to the current deploy setup and doesn't need to be removed.)

## Commands

```bash
npm run dev      # Start dev server (Turbopack) at http://localhost:3000
npm run build    # Production build — requires DATABASE_URL to be set (Drizzle needs it at build time)
npm start        # Start production server (only used outside PM2, e.g. local testing)
npm run lint     # ESLint (flat config: eslint-config-next core-web-vitals + typescript)
```

There is no test suite configured in this repo.

Database schema changes go through Drizzle Kit (not `npm run` scripts):

```bash
npx drizzle-kit push       # Push db/schema.ts changes straight to Neon (dev only — can lose data)
npx drizzle-kit generate   # Generate a migration file (production-safe path)
npx drizzle-kit migrate    # Apply generated migrations
npx drizzle-kit studio     # Visual DB browser at localhost:4983
```

`drizzle.config.ts` has a **hardcoded Neon connection string** for CLI use. This is a known/accepted issue — it doesn't affect runtime (which uses the `DATABASE_URL` env var), so don't try to "fix" it by wiring it to env vars in a way that breaks the CLI, and don't paste fresh credentials into it.

Deploy: automatic — Vercel builds and deploys on every push to `main`. Environment variables (`DATABASE_URL`, `RESEND_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `NEXT_PUBLIC_FB_PIXEL_ID`, etc.) are managed in the Vercel dashboard for production, and in `.env.local` (gitignored) for local dev.

## Architecture

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 (PostCSS-only, no `tailwind.config.js`, styled via the `@theme` block in `app/globals.css`). Path alias `@/*` → repo root.

The entire marketing site is **one route** (`app/page.tsx`) that renders section components in sequence: `Hero → TechStack → Portfolio → HireCTA → Services → Pricing → HowItWorks → StartProject → Footer`, plus fixed-position `FloatingWhatsApp` and `BottomNav`. Navigation is anchor-link based (`#portfolio`, `#services`, `#pricing`, `#start-project`), not multi-page routing. The only other routes are `/admin` and `/m/[token]`.

**Server vs Client components**: most content sections (`Services`, `Pricing`, `HowItWorks`, `TechStack`, `Footer`, `Logo`) are server components reading static data. `Hero`, `Navbar`, `Portfolio`, `StartProject`, `BottomNav`, `FloatingWhatsApp` are client components (`"use client"`) for interactivity/animation. Never import server-only modules (`db/index.ts`, anything under `app/actions/`) into a client component.

**Data flow for leads**:
1. `StartProject.tsx` (multi-step form: project type → reference project → description/budget → contact info; also supports a 60s voice recording via MediaRecorder) calls the `submitInquiry` server action.
2. `app/actions/submit-inquiry.ts` (`"use server"`) inserts a row into the `leads` table via Drizzle, generates a `chat_token` (UUID), and fires off Telegram + Resend email notifications (both fail silently if their env vars are missing).
3. The client is shown/linked their private chat page at `/m/[token]`, which polls `getMessagesByToken` every 5 seconds and lets them reply via `sendClientMessage` — no login.
4. Sherif works leads from `/admin` (`app/admin/page.tsx`): lists/filters leads by status (`new`/`contacted`/`archived`), plays voice notes, has an inline chat thread using `getMessagesByLeadId`/`sendAdminMessage`/`updateLead`, and gets browser push notifications on a 30s auto-refresh poll.

**All data operations are Server Actions under `app/actions/` — there are no `app/api/` HTTP routes.** When adding a DB operation, add a new `"use server"` function there rather than an API route. Note `app/actions/index.ts` contains an old legacy `submitLead(formData)` action (used only by the unused legacy `ContactForm.tsx`/`ProjectInquiryModal.tsx` components) — don't confuse it with the real `submitInquiry` in `submit-inquiry.ts`.

**Database** (`db/schema.ts`, Neon serverless via `drizzle-orm/neon-http` — must stay on `neon-http`, not `neon-serverless`, to avoid WebSocket issues at build time):
- `leads`: name, phone, message, voice_note (base64 `data:audio/webm;base64,...`), chat_token (unique), status, created_at. Also carries legacy nullable columns (`email`, `project_type`, `reference`, `budget`) no longer populated by the current form but kept for historical rows.
- `messages`: lead_id (FK → leads, cascade delete), sender (`admin`|`client`), body, created_at.

**Static content** (`lib/data.ts`) is the single source of truth for `projects`, `services`, and `pricing` — Portfolio, Services, Pricing, and StartProject all import from it. Don't inline content data into components. (`lib/projects.ts` is a separate/older project list — check which one a component actually imports before assuming; `Portfolio.tsx` is the canonical consumer of `lib/data.ts`.)

**Bilingual AR/EN**: `lib/language-context.tsx` provides a React context (persisted to `localStorage`) toggled from `Navbar`; `lib/translations.ts` holds the full AR/EN string map. Arabic is the default and RTL; `app/layout.tsx` runs a blocking inline script before hydration to set the correct `dir`/lang before paint (avoids RTL flash) and uses `suppressHydrationWarning` on `<html>`/`<body>` to tolerate the resulting mismatch. The `/m/[token]` client chat page is Arabic-only (no language toggle).

**Auth**: `/admin` is protected only by a client-side `sessionStorage` check (`wc-admin` key) against the hardcoded password — there is no server-side session. This is a known, accepted tradeoff for a low-value personal admin panel; do not present it as fixed unless asked to actually add server-side auth.

**Next.js 16 params are Promises** — route handlers/pages like `app/m/[token]/page.tsx` must `await params`, not destructure directly.

## Stale docs, read with caution

The repo root has several older Markdown guides (`PROJECT_GUIDE.md`, `COMPONENTS_GUIDE.md`, `DATABASE_GUIDE.md`, `SETUP_GUIDE.md`) plus a `docs/` folder that predate the current voice-form/chat/Telegram feature set — some describe a single-table schema with no `messages` table or `chat_token`, and 6 projects instead of 9+. (They also mention Vercel as the deploy target, which is coincidentally accurate again post-migration — don't take that as confirmation the rest of those docs are current.) **`PROJECT_CONTEXT.md`, `AI_AGENT_GUIDE.md`, and `README.md` are up to date** and should be treated as authoritative over the others when they conflict.
