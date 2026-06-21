# Webistrydev Portfolio — PROJECT_CONTEXT

## What It Does

Sherif's freelance developer portfolio and lead capture platform. Showcases services, past projects, and pricing. Prospective clients submit inquiries via a **voice recorder or free-text form** (3 fields only: voice/text + name + phone). Submissions are stored in Neon PostgreSQL and viewable in an admin dashboard with audio playback for voice leads.

**Live URL:** https://webistrydev.com  
**GitHub:** https://github.com/SherifAsh93/webistrydev  
**Local:** `/home/sherif/sites/webistrydev`  
**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Neon PostgreSQL · Drizzle ORM · Framer Motion  
**Process:** PM2 (id: 2) — `pm2 restart webistrydev` to deploy after build  
**Admin password:** `114891`

---

## Structure

```
webistrydev/
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata)
│   ├── page.tsx                # Homepage (all sections in sequence)
│   ├── globals.css             # Tailwind base + design tokens + animations
│   ├── actions/
│   │   ├── submit-inquiry.ts   # Server action: insert lead (name, phone, message, voiceNote)
│   │   ├── get-leads.ts        # Server action: fetch all leads
│   │   ├── update-lead.ts      # Server action: update lead status
│   │   └── delete-lead.ts      # Server action: delete lead
│   └── admin/page.tsx          # Admin dashboard — leads list + voice player
├── components/
│   ├── Navbar.tsx              # Sticky top nav
│   ├── Hero.tsx                # Animated hero + rotating words + stats
│   ├── TechStack.tsx           # Scrolling tech marquee
│   ├── Portfolio.tsx           # 6 project cards + biz apps feature
│   ├── HireCTA.tsx             # Purple CTA banner with scarcity badge
│   ├── Services.tsx            # 6 service category cards
│   ├── Pricing.tsx             # 4 pricing tiers
│   ├── HowItWorks.tsx          # 4-step process
│   ├── StartProject.tsx        # Voice recorder + free-text form (3 fields)
│   ├── Footer.tsx
│   ├── FloatingWhatsApp.tsx    # Fixed WhatsApp button
│   └── BottomNav.tsx           # Mobile-only bottom nav
├── db/
│   ├── schema.ts               # Drizzle table: leads
│   └── index.ts                # Neon + Drizzle client
├── lib/
│   ├── data.ts                 # Static: projects, services, pricing tiers
│   ├── language-context.tsx    # AR/EN language context + toggle
│   ├── projects.ts             # Project list for portfolio
│   └── translations.ts         # Full AR/EN string map
├── public/projects/            # Project screenshots
├── drizzle.config.ts
└── package.json
```

---

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Single-page portfolio (all sections, anchor nav) |
| `/admin` | Lead viewer — password: `114891` (sessionStorage only) |

Page section order: Hero → TechStack → Portfolio → HireCTA → Services → Pricing → HowItWorks → StartProject → Footer

Nav anchor links: `#portfolio`, `#services`, `#pricing`, `#how-it-works`, `#start-project`

---

## DB Schema — `leads` table

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| name | varchar(100) NOT NULL | |
| phone | varchar(30) | |
| email | varchar(255) | legacy, no longer collected in form |
| project_type | varchar(50) | nullable — no longer collected |
| reference | varchar(100) | legacy |
| budget | varchar(100) | legacy |
| message | text | nullable — empty when voice only |
| voice_note | text | base64 data URL — `data:audio/webm;base64,...` |
| created_at | timestamp | defaultNow() |
| status | varchar(20) | `new` / `contacted` / `archived` |

**DB connection (Neon):**
`postgresql://neondb_owner:npg_wYHleQ5MGX9N@ep-steep-resonance-ahctbjr8-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require`

---

## Voice Recorder (StartProject.tsx)

- Uses browser `MediaRecorder` API — no external library
- Prefers `audio/webm;codecs=opus`, falls back to `audio/webm` then `audio/mp4`
- Max 60 seconds — auto-stops at 1 minute
- On mic permission denied: falls back gracefully to showing the text textarea
- Blob → `FileReader.readAsDataURL()` → stored as full data URL in `voice_note` column
- Admin plays back via `<audio src={lead.voiceNote} controls />`
- States: `idle → requesting → recording → recorded`

---

## Language System

- **Arabic (default):** RTL, Cairo font, warm Egyptian dialect throughout
- **English:** LTR, toggled via EN button in navbar
- All strings in `lib/translations.ts` — `ar` and `en` objects
- Language choice persists via `lib/language-context.tsx` (React context)
- Key tone: no "project/مشروع" language — replaced with "فكرة/idea" everywhere
  - Nav CTA: "قولّي فكرتك ←" / "Share Your Idea →"
  - Hero CTA: "احكيلي فكرتك" / "Share Your Idea"
  - HireCTA badge: "⚡ متاح دلوقتي — مكانين فاضيين" / "⚡ Available Now — 2 Spots Open"

---

## How to Run

```bash
cd /home/sherif/sites/webistrydev
npm run build
pm2 restart webistrydev
```

**Required env var (`.env.local`):**
- `DATABASE_URL` — Neon PostgreSQL connection string

---

## How to Continue

- **Update portfolio projects:** `lib/data.ts` → `projects` array + add screenshot to `public/projects/`
- **Update pricing tiers:** `lib/data.ts` → `pricing` array
- **Update services:** `lib/data.ts` → `services` array (icons defined in `services.tsx`)
- **Change any UI text:** `lib/translations.ts` — edit both `ar` and `en` objects
- **Change contact info (WhatsApp):** `components/FloatingWhatsApp.tsx` + `app/admin/page.tsx` WhatsApp link
- **Change admin password:** `app/admin/page.tsx` → `ADMIN_PW` constant
- **Change scarcity badge text:** `lib/translations.ts` → `hireCTA.badge`
- **Change brand colors:** `app/globals.css` → `@theme` block
- **DB direct access:** `psql "postgresql://neondb_owner:npg_..."` then SQL
- **Add new DB column:** Run `ALTER TABLE leads ADD COLUMN ...`, update `db/schema.ts`

---

## Known Issues / Notes

- Admin auth is client-side only (`sessionStorage`) — no server protection on `/admin` route
- Neon free tier cold start ~500ms after inactivity
- Voice notes are stored as base64 data URLs in text column — large (a 60s note ≈ 1–1.5MB as base64). Fine for current volume
- `email`, `project_type`, `reference`, `budget` columns exist in DB but are no longer collected by the form — kept for historical leads

---

## Audit Status — 2026-06-21 ✓

All sections verified working:

| Section | AR | EN | Mobile |
|---------|----|----|--------|
| Navbar | ✓ | ✓ | ✓ |
| Hero | ✓ | ✓ | ✓ |
| TechStack | ✓ | ✓ | ✓ |
| Portfolio | ✓ | ✓ | ✓ |
| HireCTA banner | ✓ | ✓ | ✓ |
| Services | ✓ | ✓ | ✓ |
| Pricing | ✓ | ✓ | ✓ |
| HowItWorks | ✓ | ✓ | ✓ |
| StartProject form (voice) | ✓ | ✓ | ✓ |
| StartProject form (text) | ✓ | ✓ | ✓ |
| Form submission → DB | ✓ | — | — |
| Success screen | ✓ | — | — |
| Admin panel | ✓ | — | — |
| Footer | ✓ | ✓ | ✓ |
| Bottom nav (mobile) | — | — | ✓ |
| WhatsApp button | ✓ | ✓ | ✓ |
