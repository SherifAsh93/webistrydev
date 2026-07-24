# Project Overview

Sherif's freelance developer portfolio and lead capture platform (brand: **Webistrydev**). Showcases services, past projects, and pricing. Prospective clients submit inquiries via a **voice recorder or free-text form** (3 fields: voice/text + name + phone). Each submission gets a unique private chat link. Admin can reply from the dashboard; client sees replies on their link — no registration needed.

**Live URL:** https://webistrydev.com  
**Admin panel:** https://webistrydev.com/admin (password: `114891`)  
**GitHub:** https://github.com/SherifAsh93/webistrydev  
**Local path:** `/home/sherif/sites/webistrydev`  
**Process manager:** PM2 (id: 2) — port 3001

---

## Features

- **Bilingual (AR/EN):** Full Arabic (RTL, Egyptian dialect) + English. Language toggle in navbar. Arabic is the default; detected from browser/localStorage.
- **Portfolio grid:** 9+ real client projects with screenshots, categories, tags, and live links.
- **Services section:** 6 service categories with icons and descriptions.
- **Pricing tiers:** 4 tiers (Starter / Business / Online Store / Custom App) in EGP + USD.
- **HowItWorks:** Step-by-step process walkthrough.
- **StartProject form:** Voice recorder (MediaRecorder API, 60s max) + free-text mode. Project-type quick-picker (6 types). Trust badges. Submit glow animation.
- **Client chat page** (`/m/[token]`): Arabic-only private page per lead. Polls every 5 seconds for admin replies.
- **Admin dashboard** (`/admin`): Password-protected. View/filter leads (new/contacted/archived). Chat thread inline. Voice note playback. WhatsApp/email shortcuts. Browser push notifications for new leads. Auto-refresh every 30 seconds.
- **Lead notifications:** Email via Resend + Telegram Bot API — both fire on form submit.
- **Floating WhatsApp button** and **mobile bottom nav** for UX on phones.
- **SEO:** OpenGraph, Twitter card, Apple Web App meta, `metadataBase`.
- **PWA-ready:** `apple-icon.tsx` + theme color + viewport fit.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.0 (App Router, Turbopack) |
| UI Library | React 19.2.3 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| Database | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM 0.45 |
| Email | Resend |
| Notifications | Telegram Bot API |
| Fonts | Plus Jakarta Sans (EN) + Cairo (AR) via `next/font/google` |
| Hosting | VPS + PM2 (port 3001) |

---

## Folder Structure

```
webistrydev/
├── app/
│   ├── layout.tsx              # Root layout — fonts, metadata, lang-detect script, LanguageProvider
│   ├── page.tsx                # Homepage — all sections in sequence
│   ├── globals.css             # Tailwind base + design tokens + custom animations
│   ├── apple-icon.tsx          # PWA Apple icon (generated)
│   ├── opengraph-image.tsx     # OG image (generated)
│   ├── actions/
│   │   ├── index.ts            # Re-exports all actions
│   │   ├── submit-inquiry.ts   # Insert lead + generate chat_token + fire email/Telegram
│   │   ├── get-leads.ts        # Fetch all leads for admin
│   │   ├── update-lead.ts      # Update lead status (new/contacted/archived)
│   │   ├── delete-lead.ts      # Delete lead — cascades messages
│   │   ├── get-messages.ts     # getMessagesByToken (client) + getMessagesByLeadId (admin)
│   │   └── send-message.ts     # sendClientMessage (by token) + sendAdminMessage (by leadId)
│   ├── admin/
│   │   └── page.tsx            # Admin dashboard — leads list + voice player + chat thread
│   └── m/[token]/
│       ├── page.tsx            # Server wrapper — awaits params
│       └── ChatPage.tsx        # Client chat page (Arabic, polls every 5s)
├── components/
│   ├── Navbar.tsx              # Sticky nav with language toggle + anchor links
│   ├── Hero.tsx                # Animated hero with rotating text and stats
│   ├── TechStack.tsx           # Tech icons/logos strip
│   ├── Portfolio.tsx           # Project grid with bento layout + category filters
│   ├── HireCTA.tsx             # Scarcity banner ("2 spots open")
│   ├── Services.tsx            # 6 service category cards
│   ├── Pricing.tsx             # 4 pricing tier cards in EGP + USD
│   ├── HowItWorks.tsx          # Step-by-step process section
│   ├── StartProject.tsx        # Contact form — voice recorder + text + project type picker
│   ├── Footer.tsx              # Footer with links and copyright
│   ├── FloatingWhatsApp.tsx    # Fixed WhatsApp button (bottom-right)
│   ├── BottomNav.tsx           # Mobile-only bottom navigation bar
│   ├── Logo.tsx                # SVG brand logo component
│   ├── ContactForm.tsx         # (legacy contact form — superseded by StartProject)
│   └── ProjectInquiryModal.tsx # (legacy modal — not used in current page.tsx)
├── db/
│   ├── schema.ts               # Drizzle schema: leads + messages tables
│   └── index.ts                # Neon serverless + Drizzle client
├── lib/
│   ├── data.ts                 # Project data, services array, pricing tiers
│   ├── projects.ts             # Alternate projects list (used in Portfolio component)
│   ├── language-context.tsx    # React context for AR/EN toggle + localStorage persistence
│   └── translations.ts         # Full AR/EN string map for all sections
├── public/
│   └── projects/               # Project screenshots (.png) — referenced in lib/data.ts
├── drizzle.config.ts           # Drizzle Kit config for migrations
├── next.config.ts              # Redirects: webistrydev.vercel.app → webistrydev.com
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

**Page section order (homepage):**
Hero → TechStack → Portfolio → HireCTA → Services → Pricing → HowItWorks → StartProject → Footer

**Routes:**

| Route | Purpose |
|-------|---------|
| `/` | Single-page portfolio (all sections, anchor nav) |
| `/admin` | Lead dashboard — password: `114891` (sessionStorage only) |
| `/m/[token]` | Client chat page — Arabic only, no auth, polls every 5s |

---

## Database

**Provider:** Neon PostgreSQL (serverless, pooled connection via `@neondatabase/serverless`)  
**ORM:** Drizzle ORM

### `leads` table

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| name | varchar(100) NOT NULL | |
| phone | varchar(30) | |
| email | varchar(255) | legacy, no longer collected by form |
| project_type | varchar(50) | legacy, nullable |
| reference | varchar(100) | legacy |
| budget | varchar(100) | legacy |
| message | text | nullable — empty when voice-only submission |
| voice_note | text | base64 data URL `data:audio/webm;base64,...` |
| chat_token | varchar(64) UNIQUE | UUID generated on insert — powers `/m/[token]` |
| created_at | timestamp | defaultNow() |
| status | varchar(20) | `new` / `contacted` / `archived` |

### `messages` table

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| lead_id | integer FK → leads.id ON DELETE CASCADE | |
| sender | varchar(10) | `admin` or `client` |
| body | text NOT NULL | |
| created_at | timestamp | defaultNow() |

**Migrations:** Run manually via `drizzle-kit push` or raw SQL on Neon console.

---

## Environment Variables

All set in `.env.local` on the VPS at `/home/sherif/sites/webistrydev/.env.local`:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string (required) |
| `RESEND_API_KEY` | Resend email API key — lead email notifications |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token from @BotFather |
| `TELEGRAM_CHAT_ID` | Telegram user/chat ID for notifications |

Only `DATABASE_URL` is strictly required. Email and Telegram notifications degrade gracefully if keys are missing (silent catch).

---

## Local Development

```bash
cd /home/sherif/sites/webistrydev
npm install
# Create .env.local with at minimum DATABASE_URL
npm run dev       # http://localhost:3000
```

To run a build test:

```bash
npm run build
```

---

## Deployment (VPS + PM2)

- **Server:** VPS running Ubuntu
- **Process manager:** PM2 (process name: `webistrydev`, id: 2)
- **Port:** 3001
- **Domain:** webistrydev.com → reverse-proxied to port 3001

**Deploy steps:**

```bash
cd /home/sherif/sites/webistrydev
git pull origin main
npm install
npm run build
pm2 restart webistrydev
```

**Do NOT use `next start` directly** — PM2 handles restarts and crash recovery.

**Old Vercel deployment** (`webistrydev.vercel.app`) redirects permanently to `webistrydev.com` via `next.config.ts`.

---

## Current Status

- **Build:** Passing (Next.js 16.1.0, exit 0, no errors, no warnings) — verified 2026-07-24
- **Live site:** Active at https://webistrydev.com
- **PM2:** Running (do not restart without intent to deploy)
- **Features complete:** All sections, bilingual, voice form, admin panel, client chat, Telegram + email notifications
- **Last portfolio update:** 2026-07-21 — Mr. Mohammed project added (9 projects total), hero stats updated to 8+

---

## Known Issues

- **Admin auth is client-side only** — password checked in browser (`sessionStorage`), no server-side protection on `/admin` route. Anyone who knows the endpoint can try brute force.
- **Neon free-tier cold start** — ~500ms latency after periods of inactivity (no keepalive ping set up).
- **Voice notes stored as base64 text** — 60s audio ≈ 1–1.5 MB per lead. Fine at current scale but will bloat the DB if lead volume grows significantly.
- **Legacy DB columns** — `email`, `project_type`, `reference`, `budget` exist in the `leads` table but are no longer collected by the form. Kept for historical records.
- **No rate limiting** on form submissions — could be spammed without CAPTCHA.
- **`/m/[token]` is Arabic-only** — no language toggle on client chat page.
- **`ContactForm.tsx` and `ProjectInquiryModal.tsx`** — legacy components in `components/` not used in current page layout.

---

## Future Improvements

- Add server-side session/JWT auth for `/admin` instead of client-side password
- Implement rate limiting on `submit-inquiry` action (e.g., 1 submission per IP per 10 min)
- Move voice notes to object storage (e.g., R2 or S3) instead of base64 in Postgres
- Add Neon connection keepalive ping to eliminate cold-start delay
- Add `/admin` notification badge in browser tab title (`document.title`)
- Add unread message count badge per lead in admin
- Add pagination to admin leads list when volume grows
- Add `/m/[token]` English language option
- Add a "Project Brief" multi-step wizard as an alternative to the simple form
- Olympia Beach Club project screenshot missing from portfolio list in `lib/data.ts`

---

## Reusable Assets

| Asset | File | Reuse Potential |
|-------|------|-----------------|
| Lead capture form with voice recorder | `components/StartProject.tsx` | High — can drop into any portfolio site |
| Admin dashboard (leads + chat) | `app/admin/page.tsx` | High — generic CRM-lite for any project |
| Client chat page | `app/m/[token]/ChatPage.tsx` | High — anonymous chat via token pattern |
| Telegram + email notifications | `app/actions/submit-inquiry.ts` | High — copy notification block to any form |
| Language context (AR/EN toggle) | `lib/language-context.tsx` | High — works in any bilingual Next.js app |
| Translations map pattern | `lib/translations.ts` | Medium — needs per-project string updates |
| Neon + Drizzle DB setup | `db/index.ts` + `db/schema.ts` | High — standard pattern used across projects |
| Portfolio bento grid | `components/Portfolio.tsx` | Medium — tied to project data shape |
| Pricing section | `components/Pricing.tsx` | Medium — reusable with updated tiers |
| Floating WhatsApp button | `components/FloatingWhatsApp.tsx` | High — plug-and-play |
| Bottom mobile nav | `components/BottomNav.tsx` | Medium — reusable with anchor updates |
| Lang-detect blocking script | `app/layout.tsx` | High — eliminates RTL flash, copy anywhere |

---

## Lessons Learned

- **Blocking lang-detect script** in `<head>` (before React hydration) is the correct way to eliminate RTL/LTR flash — `suppressHydrationWarning` on `<html>` + `<body>` handles the hydration mismatch cleanly.
- **Base64 voice notes in Postgres** work for MVP but don't scale — should move to object storage for any production system expecting high volume.
- **Drizzle ORM on Neon serverless** requires the `neon-http` driver (not `neon-serverless`) in Next.js server actions to avoid WebSocket issues at build time.
- **Client-side admin auth** is acceptable for a personal portfolio (security through obscurity + low-value target) but should never be used for multi-user or sensitive data apps.
- **`/m/[token]` polling (5s interval)** is simple and reliable for low-traffic personal use but adds unnecessary Neon queries at scale — WebSockets or SSE would be better at higher volume.
- **Next.js 16 params are now Promises** — `params: Promise<{ token: string }>` must be awaited, not destructured directly. Critical breaking change from Next.js 15.

---

## WebistryDev Metadata

| Field | Value |
|-------|-------|
| **Category** | Portfolio / Agency |
| **Complexity** | Medium |
| **Template Candidate** | Yes — strong portfolio template with bilingual support |
| **Priority** | Active (main business asset) |
| **Similar Projects** | `/home/sherif/sites/Montelle` (Vercel, fashion), `/home/sherif/sites/zahrtelkhlig` (Vercel, ecommerce), `/home/sherif/sites/webistrydev` (VPS, portfolio) |

**Reusable Modules:**

- Contact form with voice recorder (`StartProject.tsx`)
- CRM-lite admin panel with chat (`app/admin/page.tsx`, `app/m/[token]/`)
- Telegram + Resend dual notification pattern (`actions/submit-inquiry.ts`)
- Bilingual AR/EN language system (`lib/language-context.tsx`, `lib/translations.ts`)
- Anonymous token-based client chat (`app/m/[token]/ChatPage.tsx`)
- Portfolio project grid with category filters (`components/Portfolio.tsx`)
- Pricing section with EGP + USD tiers (`components/Pricing.tsx`)
- Floating WhatsApp CTA (`components/FloatingWhatsApp.tsx`)
- Mobile bottom navigation bar (`components/BottomNav.tsx`)
- Neon + Drizzle DB bootstrap (`db/index.ts`, `db/schema.ts`)

---

## Update Log

### 2026-07-24 — Audit
- Build verified: passing, exit 0, no errors
- PROJECT_CONTEXT.md rewritten to full structured format

### 2026-07-21 — Mr. Mohammed project added
- Screenshot saved to `/public/projects/mr-mohammed.png`
- Added to `lib/data.ts` — category `web-app`, tags: Next.js, PostgreSQL, Mobile-First, Arabic RTL
- Arabic description added to `lib/translations.ts` → `projectDescs["mr-mohammed"]`
- Hero stats updated to 8+
- Facebook post published to WebistryDev page

### 2026-07-15 — QOYA Furniture + StartProject UX overhaul
- QOYA Furniture project added to portfolio (screenshot + data + translations)
- Furniture Studio added as horizontal card
- Hero stats updated to 7+
- StartProject form: trust badges bar, project-type quick-picker, submit glow animation, "What happens next" card, WhatsApp fallback link

### 2026-06-21 — Audit baseline
- All sections verified AR/EN/mobile
- Chat link + client page confirmed working
- Voice recorder confirmed working on mobile

### Earlier — Initial build
- Telegram Bot API notifications added
- Client chat page `/m/[token]` added
- Voice recorder added to StartProject form
- Neon PostgreSQL + Drizzle ORM setup
- Admin dashboard built
