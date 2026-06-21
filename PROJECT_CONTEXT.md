# Webistrydev Portfolio — PROJECT_CONTEXT

## What It Does

Sherif's freelance developer portfolio and lead capture platform. Showcases services, past projects, and pricing. Prospective clients submit inquiries via a **voice recorder or free-text form** (3 fields: voice/text + name + phone). Each submission gets a unique private chat link. Admin can reply from the dashboard; client sees replies on their link — no registration needed.

**Live URL:** https://webistrydev.com  
**GitHub:** https://github.com/SherifAsh93/webistrydev  
**Local:** `/home/sherif/sites/webistrydev`  
**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Neon PostgreSQL · Drizzle ORM · Framer Motion  
**Process:** PM2 (id: 2) — `npm run build && pm2 restart webistrydev` to deploy  
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
│   │   ├── submit-inquiry.ts   # Insert lead + generate chat_token → returns token
│   │   ├── get-leads.ts        # Fetch all leads for admin
│   │   ├── update-lead.ts      # Update lead status
│   │   ├── delete-lead.ts      # Delete lead (cascades messages)
│   │   ├── get-messages.ts     # getMessagesByToken (client) / getMessagesByLeadId (admin)
│   │   └── send-message.ts     # sendClientMessage (by token) / sendAdminMessage (by leadId)
│   ├── admin/page.tsx          # Admin dashboard — leads + voice player + chat thread
│   └── m/[token]/
│       ├── page.tsx            # Server wrapper — awaits params
│       └── ChatPage.tsx        # Client chat page (Arabic, polls every 5s)
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── TechStack.tsx
│   ├── Portfolio.tsx
│   ├── HireCTA.tsx
│   ├── Services.tsx
│   ├── Pricing.tsx
│   ├── HowItWorks.tsx
│   ├── StartProject.tsx        # Voice recorder + free-text form + success screen with chat link
│   ├── Footer.tsx
│   ├── FloatingWhatsApp.tsx
│   └── BottomNav.tsx
├── db/
│   ├── schema.ts               # leads table + messages table
│   └── index.ts                # Neon + Drizzle client
├── lib/
│   ├── data.ts
│   ├── language-context.tsx
│   ├── projects.ts
│   └── translations.ts         # Full AR/EN strings incl. chatSaveTitle/chatSaveDesc/chatCopy/chatCopied/chatOpen
├── public/projects/
├── drizzle.config.ts
└── package.json
```

---

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Single-page portfolio (all sections, anchor nav) |
| `/admin` | Lead viewer — password: `114891` (sessionStorage only) |
| `/m/[token]` | Client chat page — Arabic only, no auth, polls every 5s |

Page section order: Hero → TechStack → Portfolio → HireCTA → Services → Pricing → HowItWorks → StartProject → Footer

---

## DB Schema

### `leads` table

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| name | varchar(100) NOT NULL | |
| phone | varchar(30) | |
| email | varchar(255) | legacy, no longer collected |
| project_type | varchar(50) | legacy, nullable |
| reference | varchar(100) | legacy |
| budget | varchar(100) | legacy |
| message | text | nullable — empty when voice only |
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

**DB connection (Neon):**
`postgresql://neondb_owner:npg_wYHleQ5MGX9N@ep-steep-resonance-ahctbjr8-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require`

---

## Messaging Flow

1. Client submits form → `submit-inquiry.ts` generates `crypto.randomUUID()` as `chat_token` → stored on lead row → returned to client
2. Success screen shows the chat link card with warm Egyptian copy ("احتفظ بالرابط ده كويس!") + Copy + Open buttons
3. Client visits `webistrydev.com/m/[token]` → sees conversation in Arabic → can send messages anytime
4. `/m/[token]` polls `getMessagesByToken` every 5 seconds for new replies
5. Admin expands any lead → sees "CONVERSATION" section inline with full thread → types reply → hits Send or Enter
6. Admin can also "Copy Client Link" from the conversation header to share the link via WhatsApp/SMS

---

## Voice Recorder (StartProject.tsx)

- Uses browser `MediaRecorder` API — no external library
- Prefers `audio/webm;codecs=opus`, falls back to `audio/webm` then `audio/mp4`
- Max 60 seconds — auto-stops
- Mic denied: falls back to text textarea
- Blob → `FileReader.readAsDataURL()` → stored as data URL in `voice_note`
- Admin plays back via `<audio src={lead.voiceNote} controls />`
- States: `idle → requesting → recording → recorded`

---

## Language System

- **Arabic (default):** RTL, Cairo font, warm Egyptian dialect
- **English:** LTR, toggled via EN button in navbar
- All strings in `lib/translations.ts`
- Key tone: "فكرة/idea" everywhere — no "project/مشروع"
  - Nav CTA: "قولّي فكرتك ←" / "Share Your Idea →"
  - Hero CTA: "احكيلي فكرتك" / "Share Your Idea"
  - HireCTA badge: "⚡ متاح دلوقتي — مكانين فاضيين"
- `/m/[token]` is Arabic-only (hardcoded, no language toggle)

---

## How to Deploy

```bash
cd /home/sherif/sites/webistrydev
npm run build
pm2 restart webistrydev
```

**Required env var (`.env.local`):**
- `DATABASE_URL` — Neon PostgreSQL connection string

---

## How to Continue

- **Update portfolio:** `lib/data.ts` → `projects` + screenshot in `public/projects/`
- **Update pricing:** `lib/data.ts` → `pricing`
- **Change UI text:** `lib/translations.ts` — both `ar` and `en`
- **Change admin password:** `app/admin/page.tsx` → `ADMIN_PW`
- **Change scarcity badge:** `lib/translations.ts` → `hireCTA.badge`
- **Change brand colors:** `app/globals.css` → `@theme`
- **DB direct access:** `psql "postgresql://neondb_owner:npg_..."` then SQL
- **Add DB column:** `ALTER TABLE ... ADD COLUMN ...` → update `db/schema.ts`

---

## Known Issues / Notes

- Admin auth is client-side only (`sessionStorage`) — no server-side protection on `/admin`
- Neon free tier cold start ~500ms after inactivity
- Voice notes stored as base64 in text column — 60s ≈ 1–1.5MB. Fine for current volume
- `email`, `project_type`, `reference`, `budget` exist in DB but are no longer collected — kept for historical leads
- Existing leads before 2026-06-21 had `chat_token` auto-generated by migration (`gen_random_uuid()`)

---

## Audit Status — 2026-06-21 ✓

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
| StartProject (voice) | ✓ | ✓ | ✓ |
| StartProject (text) | ✓ | ✓ | ✓ |
| Form submission → DB | ✓ | — | — |
| Success screen + chat link | ✓ | ✓ | — |
| Client chat page /m/[token] | ✓ | — | — |
| Admin panel + chat thread | ✓ | — | — |
| Footer | ✓ | ✓ | ✓ |
| WhatsApp button | ✓ | ✓ | ✓ |
