# 01 — Project Overview

## What This Project Is

**Webistrydev** is Sherif's freelance web developer portfolio and lead-capture system. It is live at [www.webistrydev.com](https://www.webistrydev.com), deployed on a VPS managed by PM2, with Nginx handling HTTPS and proxying to the Next.js process on port 3000.

The project has three distinct concerns living in one codebase:

1. **Portfolio**: A bilingual (Arabic/English) single-page marketing site that showcases past work, services, and pricing to prospective clients.
2. **Lead capture**: A contact section where visitors can send a voice note or text message along with their name and phone number. Submissions create a database record and generate a unique chat token.
3. **Follow-up chat**: Each lead gets a private chat URL (`/m/[token]`) where the client and Sherif can exchange messages. Sherif manages all leads and replies from `/admin`.

There are no third-party CMS tools, no auth library, no i18n library, and no WebSocket server. Everything is built from first principles using Next.js server actions, Drizzle ORM, and a custom React Context for language switching.

---

## Annotated Folder Tree

```
webistrydev/
├── app/
│   ├── layout.tsx            # Root layout: LanguageProvider wrapper, Google Fonts, blocking RTL script
│   ├── page.tsx              # Home page: imports all sections in render order
│   ├── globals.css           # Tailwind v4 @theme tokens, utility classes, @keyframes
│   ├── actions/
│   │   ├── submit-inquiry.ts # Creates lead + generates chatToken
│   │   ├── get-leads.ts      # Fetches all leads ordered by createdAt DESC
│   │   ├── update-lead.ts    # Updates lead status (new/contacted/archived)
│   │   ├── delete-lead.ts    # Deletes lead (messages cascade)
│   │   ├── get-messages.ts   # Fetches messages by token or by leadId
│   │   ├── send-message.ts   # Inserts client or admin message
│   │   └── index.ts          # Legacy file — early submitLead prototype, not used in production
│   ├── admin/
│   │   └── page.tsx          # 514-line client admin dashboard
│   └── m/[token]/
│       ├── page.tsx          # Server wrapper: awaits params, passes token to ChatPage
│       └── ChatPage.tsx      # Client chat UI with 5-second polling, Arabic only
├── components/
│   ├── Navbar.tsx            # Glassmorphism navbar, language toggle, 3-click Easter egg to /admin
│   ├── Hero.tsx              # Rotating headline words (Framer Motion AnimatePresence + blur fade)
│   ├── TechStack.tsx         # Infinite marquee of tech logos
│   ├── Portfolio.tsx         # Bento grid (desktop) + snap carousel (mobile), 6 projects
│   ├── HireCTA.tsx           # Purple full-width CTA banner between portfolio and services
│   ├── Services.tsx          # 6 service cards
│   ├── Pricing.tsx           # 4 pricing tiers, "popular" badge on Business tier
│   ├── HowItWorks.tsx        # 4-step process section
│   ├── StartProject.tsx      # Voice recorder + text fallback + name/phone, form submission
│   ├── Footer.tsx            # Contact buttons: WhatsApp, phone, email, Facebook
│   ├── FloatingWhatsApp.tsx  # Fixed bottom-right WhatsApp button visible on all pages
│   ├── BottomNav.tsx         # Mobile-only sticky bottom navigation, scroll-spy
│   ├── Logo.tsx              # SVG logo with bracket motif and violet gradient
│   └── ContactForm.tsx       # Legacy component, not mounted anywhere in production
├── db/
│   ├── schema.ts             # Drizzle pgTable definitions for leads and messages
│   └── index.ts              # Neon HTTP driver + drizzle() instance export
├── lib/
│   ├── data.ts               # Static data: projects[], services[], pricing[]
│   ├── language-context.tsx  # LanguageProvider, detectLang(), useLang() hook
│   ├── translations.ts       # All AR and EN strings (single source of truth)
│   └── projects.ts           # Legacy duplicate of project data — not imported anywhere active
├── drizzle.config.ts         # Drizzle Kit config: schema path, out dir, Neon connection URL
├── next.config.ts            # Redirect: webistrydev.vercel.app → www.webistrydev.com
└── package.json              # Dependencies: next 16.1.0, react 19, drizzle-orm, framer-motion
```

---

## Module Breakdown

### Home Page Sections (render order in `app/page.tsx`)

| Order | Component | Section ID | Description |
|-------|-----------|-----------|-------------|
| 1 | `Navbar` | — | Fixed top, glassmorphism on scroll |
| 2 | `Hero` | (first viewport) | Rotating headline, stats, two CTAs |
| 3 | `TechStack` | — | Marquee of technology logos |
| 4 | `Portfolio` | `#portfolio` | 6 projects, bento grid / snap carousel |
| 5 | `HireCTA` | — | Mid-page CTA banner |
| 6 | `Services` | `#services` | 6 service cards |
| 7 | `Pricing` | `#pricing` | 4 tiers with timelines |
| 8 | `HowItWorks` | `#how-it-works` | 4-step process |
| 9 | `StartProject` | `#start-project` | Voice/text form with lead submission |
| 10 | `Footer` | — | Social and contact links |

`FloatingWhatsApp` and `BottomNav` are mounted outside `<main>` and persist across scroll.

### Separate Routes

| Route | Files | Purpose |
|-------|-------|---------|
| `/admin` | `app/admin/page.tsx` | Lead management dashboard |
| `/m/[token]` | `app/m/[token]/page.tsx` + `ChatPage.tsx` | Per-client chat thread |

### Server Actions (all in `app/actions/`)

| File | Exported function(s) |
|------|---------------------|
| `submit-inquiry.ts` | `submitInquiry({ name, phone, message?, voiceNote? })` |
| `get-leads.ts` | `getLeads()` |
| `update-lead.ts` | `updateLeadStatus(id, status)` |
| `delete-lead.ts` | `deleteLead(id)` |
| `get-messages.ts` | `getMessagesByToken(token)`, `getMessagesByLeadId(leadId)` |
| `send-message.ts` | `sendClientMessage(token, body)`, `sendAdminMessage(leadId, body)` |

### Static Data (`lib/data.ts`)

Exports three typed arrays consumed directly by components:
- `projects: Project[]` — 6 portfolio items with screenshot paths, tags, live URLs
- `services: ServiceItem[]` — 6 service categories with icons and descriptions
- `pricing: PricingTier[]` — 4 tiers with EGP + USD price ranges and feature lists

### Language System (`lib/`)

- `translations.ts` — single object with `ar` and `en` keys covering every user-visible string
- `language-context.tsx` — `LanguageProvider` + `useLang()` hook; detects language from localStorage then browser then defaults to English

---

## Technology Summary

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16.1.0 (App Router) |
| UI | React 19, TypeScript 5, Tailwind CSS v4 |
| Animation | Framer Motion 12 |
| Icons | lucide-react |
| Database | Neon PostgreSQL (serverless HTTP driver) |
| ORM | Drizzle ORM with neon-http adapter |
| i18n | Custom React Context (no library) |
| Auth | sessionStorage key check (no library) |
| Deployment | VPS + PM2 + Nginx |
