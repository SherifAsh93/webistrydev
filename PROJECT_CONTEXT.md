# Webistrydev Portfolio — PROJECT_CONTEXT

## What It Does

Sherif's freelance developer portfolio and lead capture platform. Showcases services, past projects, and pricing. Prospective clients submit project inquiries via a multi-step form; submissions are stored in PostgreSQL and viewable in an admin dashboard.

**Live URL:** https://webistrydev.com  
**GitHub:** https://github.com/SherifAsh93/webistrydev  
**Local:** `/home/sherif/sites/webistrydev`  
**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Neon PostgreSQL · Drizzle ORM · Framer Motion · Vercel

---

## Structure

```
webistrydev/
├── app/
│   ├── layout.tsx           # Root layout (fonts, metadata)
│   ├── page.tsx             # Homepage (all sections in sequence)
│   ├── globals.css          # Tailwind base + design tokens + animations
│   ├── actions/
│   │   ├── submit-inquiry.ts # Server action: insert lead into DB
│   │   └── get-leads.ts     # Server action: fetch all leads
│   └── admin/page.tsx       # Admin dashboard — view leads
├── components/
│   ├── Navbar.tsx           # Sticky top nav
│   ├── Hero.tsx             # Animated intro + stats
│   ├── TechStack.tsx        # Scrolling tech marquee
│   ├── Portfolio.tsx        # 6 project cards
│   ├── Services.tsx         # 6 service categories
│   ├── Pricing.tsx          # 4 pricing tiers
│   ├── HowItWorks.tsx       # 4-step process
│   ├── StartProject.tsx     # Multi-step inquiry form
│   ├── Footer.tsx
│   ├── FloatingWhatsApp.tsx # Fixed WhatsApp button
│   └── BottomNav.tsx        # Mobile-only bottom nav
├── db/
│   ├── schema.ts            # Drizzle table: leads
│   └── index.ts             # Neon + Drizzle client
├── lib/
│   ├── data.ts              # Static: projects, services, pricing tiers
│   └── translations.ts      # AR/EN strings (unused)
├── public/projects/         # Project screenshots
├── drizzle.config.ts
├── next.config.ts
└── package.json
```

---

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Single-page portfolio (all sections, anchor nav) |
| `/admin` | Lead viewer — password: `114891` (client-side only, sessionStorage) |

Nav links are anchor links: `#portfolio`, `#services`, `#pricing`, `#start-project`.

---

## How to Run

```bash
cd /home/sherif/sites/webistrydev
npm install
# Create .env.local with DATABASE_URL
npm run dev    # http://localhost:3000
npm run build
npm start
```

**Required env var:**
- `DATABASE_URL` — Neon PostgreSQL connection string

**Schema push (first time or after schema changes):**
```bash
npx drizzle-kit push
```

---

## How to Continue

- **Update portfolio projects:** `lib/data.ts` → `projects` array
- **Update pricing:** `lib/data.ts` → `pricing` array
- **Update services:** `lib/data.ts` → `services` array
- **Change contact info:** Search for phone number in `Footer.tsx`, `FloatingWhatsApp.tsx`, `StartProject.tsx`
- **Change admin password:** `app/admin/page.tsx` → `ADMIN_PASSWORD` constant
- **Change brand colors:** `app/globals.css` → `@theme` block
- **Add section:** Create component, render in `app/page.tsx`, add anchor to `Navbar.tsx`
- **Deploy:** Push to `main` → Vercel auto-deploys

---

## Known Issues

- Admin auth is purely client-side (`sessionStorage`) — no server-side protection on `/admin`.
- Neon free tier pauses after inactivity — first request after pause may be slow (~500ms cold start).

---

## Next Steps

- No active issues as of 2026-06-14.
