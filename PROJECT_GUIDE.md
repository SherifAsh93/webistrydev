# Webistrydev Portfolio — Project Guide

## Project Overview

A full-stack developer portfolio and lead capture platform for Sherif (Webistrydev). It showcases services, past projects, and pricing, and lets prospective clients submit project inquiries that are stored in a PostgreSQL database and viewable in an admin dashboard.

**Live URL:** webistrydev.vercel.app  
**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Neon PostgreSQL · Drizzle ORM · Framer Motion · Vercel

---

## Purpose and Business Goals

- Attract freelance clients as a full-stack web developer
- Convert website visitors into leads via the multi-step inquiry form
- Showcase six completed client projects with context and tech stack
- Display transparent pricing in EGP and USD
- Allow Sherif to review and respond to inquiries via the admin dashboard

---

## Complete Folder Structure

```
web-corner/                            # Root directory
├── app/                               # Next.js App Router
│   ├── layout.tsx                     # Root layout (fonts, metadata, globals)
│   ├── page.tsx                       # Home page (renders all sections in order)
│   ├── globals.css                    # Tailwind base + design tokens + animations
│   ├── actions/
│   │   ├── submit-inquiry.ts          # Server action: insert lead into DB
│   │   ├── get-leads.ts               # Server action: fetch all leads
│   │   └── index.ts                   # Legacy form handler (alias of submit-inquiry)
│   └── admin/
│       └── page.tsx                   # Admin dashboard (leads viewer)
├── components/
│   ├── Logo.tsx                       # SVG gradient logo mark
│   ├── Navbar.tsx                     # Sticky top nav with mobile hamburger
│   ├── Hero.tsx                       # Hero section with animated rotating words
│   ├── TechStack.tsx                  # Horizontal scrolling tech marquee
│   ├── Portfolio.tsx                  # 6 featured project cards
│   ├── Services.tsx                   # 6 service category cards
│   ├── Pricing.tsx                    # 4 pricing tier cards
│   ├── HowItWorks.tsx                 # 4-step process explanation
│   ├── StartProject.tsx               # Multi-step inquiry form
│   ├── ContactForm.tsx                # Legacy single-step contact form (unused)
│   ├── Footer.tsx                     # Footer with contact links
│   ├── FloatingWhatsApp.tsx           # Always-visible floating WhatsApp button
│   └── BottomNav.tsx                  # Mobile-only bottom navigation bar
├── db/
│   ├── schema.ts                      # Drizzle table definitions (leads table)
│   └── index.ts                       # Neon + Drizzle client setup
├── lib/
│   ├── data.ts                        # Static data: projects, services, pricing tiers
│   ├── projects.ts                    # Legacy project definitions
│   └── translations.ts                # Arabic/English i18n strings (unused)
├── public/
│   ├── favicon.svg
│   ├── projects/                      # Project screenshot images
│   └── *.svg                          # SVG assets
├── playwright-scripts/                # Automation scripts (DNS, domain setup)
├── screenshots/                       # Website screenshots
├── drizzle.config.ts                  # Drizzle ORM + Neon DB config
├── next.config.ts                     # Next.js config (empty)
├── tsconfig.json                      # TypeScript (path alias @/*)
├── postcss.config.mjs                 # Tailwind PostCSS
├── eslint.config.mjs                  # ESLint with Next.js rules
└── package.json
```

---

## Main Pages and Routes

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Single-page portfolio (all sections on one page) |
| `/admin` | `app/admin/page.tsx` | Admin dashboard — view leads (password: 114891) |

The home page renders every section component in sequence. Navigation links are anchor links (`#portfolio`, `#services`, `#pricing`, `#start-project`).

---

## Component Hierarchy

```
RootLayout (app/layout.tsx)
└── Home Page (app/page.tsx)
    ├── Navbar (sticky header, desktop + mobile)
    ├── Hero (animated intro, stats, CTAs)
    ├── TechStack (scrolling marquee)
    ├── Portfolio (6 project cards with type filters)
    ├── Services (6 service categories)
    ├── Pricing (4 pricing tiers)
    ├── HowItWorks (4-step process)
    ├── StartProject (multi-step inquiry form)
    ├── Footer
    ├── FloatingWhatsApp (position:fixed, always visible)
    └── BottomNav (mobile-only, position:fixed)

Admin Page (app/admin/page.tsx)
└── Standalone client component (no layout wrapper)
```

---

## State Management Approach

No external state library. Uses React built-ins only:

- **`useState`** — Form step, form field values, navbar open/closed, admin auth state, expanded lead cards
- **`useEffect`** — Scroll listener (navbar shadow), auto-scroll on URL params, load leads on mount
- **`useRef`** — Logo click counter for Easter egg, form field refs
- **`useCallback`** — Memoized handlers in the inquiry form

**Data flow for inquiries:**
1. User fills multi-step form (local `useState`)
2. Submit calls `submitInquiry()` server action
3. Server inserts row into Neon PostgreSQL via Drizzle ORM
4. Admin visits `/admin`, loads leads via `getLeads()` server action
5. Admin contacts leads via WhatsApp deeplinks or email links

---

## API Integrations

### Database (Neon PostgreSQL via Drizzle ORM)
- **Provider:** Neon (serverless PostgreSQL)
- **ORM:** Drizzle ORM v0.45.1
- **Operations:** INSERT (submit inquiry), SELECT (get all leads)
- **Schema:** `db/schema.ts` — single `leads` table
- **Client:** `db/index.ts` — Neon serverless driver + Drizzle

### Server Actions (no HTTP API routes)
All data operations use Next.js Server Actions:
- `submitInquiry(data)` — `app/actions/submit-inquiry.ts`
- `getLeads()` — `app/actions/get-leads.ts`

### External Services
- **WhatsApp deeplinks** — `https://wa.me/{phone}` for admin to contact leads
- **Vercel** — Hosting and deployment

---

## Authentication Flow

### Admin Panel Only
1. Visit `/admin`
2. Enter password (`114891` — hardcoded in `app/admin/page.tsx`)
3. Correct password stored in `sessionStorage` as key `wc-admin`
4. Page checks `sessionStorage` on load to determine auth state
5. Logout: clears `sessionStorage`, shows login form

No user authentication (the portfolio is public). No server-side session — admin auth is purely client-side via `sessionStorage`.

---

## Deployment Process

### Vercel (primary)
```bash
# Auto-deploys on git push to main
# Manual deploy:
npx vercel --prod
```

**Required Vercel environment variable:**
- `DATABASE_URL` — Neon PostgreSQL connection string

### Local Development
```bash
cd /home/sherif/sites/web-corner
npm install
# Create .env.local with DATABASE_URL
npm run dev    # http://localhost:3000
npm run build  # Production build
npm start      # Start production server
```

---

## Common Modification Points

### Update portfolio projects
→ Edit `lib/data.ts` — the `projects` array. Each project has `id`, `name`, `description`, `category`, `tags`, `url`, `screenshot`, `featured`.

### Update pricing tiers
→ Edit `lib/data.ts` — the `pricing` array. Change `egp`, `usd`, `features`, `timeline`.

### Update services list
→ Edit `lib/data.ts` — the `services` array.

### Change contact info (WhatsApp, email, phone)
→ Search for the phone number in `components/Footer.tsx`, `components/FloatingWhatsApp.tsx`, and `components/StartProject.tsx`.

### Add a new section to the homepage
1. Create `components/NewSection.tsx`
2. Import and render it in `app/page.tsx` at the desired position
3. Add an anchor link in `components/Navbar.tsx` if needed

### Change brand colors
→ Edit `app/globals.css` — the `@theme` block with `--color-violet`, `--color-cyan`, etc.

### Change admin password
→ Edit `app/admin/page.tsx` — find the `ADMIN_PASSWORD` constant near the top.

---

## Troubleshooting Guide

**Admin can't log in:**
- Check `app/admin/page.tsx` for the hardcoded password constant
- Clear browser sessionStorage (`Application → Storage → sessionStorage`)

**Leads not saving:**
- Verify `DATABASE_URL` in `.env.local` or Vercel env settings
- Check Neon dashboard to confirm database is active (free tier pauses after inactivity)
- Run `npm run build` and check for Drizzle-related build errors

**Database schema not up to date:**
- Run `npx drizzle-kit push` to push schema changes to Neon
- Or use `npm run db:migrate` if you have migration files

**Project screenshots not showing:**
- Images in `public/projects/` are served statically
- Verify filename matches the `screenshot` field in `lib/data.ts`

**Build fails:**
- Run `npm run lint` to identify TypeScript/ESLint errors
- Ensure `DATABASE_URL` is set (required at build time for Drizzle)
