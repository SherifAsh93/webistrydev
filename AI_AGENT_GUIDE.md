# Webistrydev Portfolio — AI Agent Guide

## Architecture Overview

A **Next.js 16 App Router** single-page portfolio with a PostgreSQL-backed lead capture system. Deployed on Vercel.

```
Browser → Vercel CDN → Next.js (App Router)
                           ├── Static sections (React Server Components)
                           ├── Interactive sections (Client Components)
                           └── Server Actions → Neon PostgreSQL (Drizzle ORM)
```

The entire site is one page (`app/page.tsx`) that renders all section components in sequence. Navigation is anchor-link based. The only "real" route besides `/` is `/admin`.

---

## Important Files

| Priority | File | What it does |
|----------|------|-------------|
| Critical | `lib/data.ts` | All portfolio content: projects, services, pricing |
| Critical | `db/schema.ts` | Drizzle leads table definition |
| Critical | `db/index.ts` | Neon + Drizzle client initialization |
| Critical | `app/actions/submit-inquiry.ts` | Server action: save lead to DB |
| Critical | `app/actions/get-leads.ts` | Server action: fetch all leads |
| High | `components/StartProject.tsx` | Multi-step inquiry form (main conversion point) |
| High | `components/Portfolio.tsx` | Project showcase cards |
| High | `components/Pricing.tsx` | Pricing tiers |
| High | `app/admin/page.tsx` | Admin dashboard |
| Medium | `components/Hero.tsx` | Animated hero section |
| Medium | `components/Navbar.tsx` | Navigation |
| Medium | `app/globals.css` | Design system (tokens, animations) |
| Config | `drizzle.config.ts` | Drizzle + Neon config |
| Config | `next.config.ts` | Next.js config (empty) |
| Config | `tsconfig.json` | TypeScript + path alias |

---

## Coding Conventions

- **Path alias:** `@/*` maps to the root — use `@/components/...`, `@/lib/...`, `@/db/...`
- **Server components by default** — only add `"use client"` for interactivity
- **Server Actions** (`"use server"`) for all database operations — no HTTP API routes
- **Static data** lives in `lib/data.ts` — components import from there, not inline
- **Tailwind CSS v4** — PostCSS only, no `tailwind.config.js`, utility classes only
- **No external state library** — use `useState`/`useEffect`/`useCallback` only
- **TypeScript strict mode** — all props must be typed
- **Framer Motion** for complex animations (Hero, Portfolio sections only)
- **Lucide React** for all icons

---

## Where to Modify Common Features

### Update portfolio projects
→ `lib/data.ts` — `projects` array. Add/edit/remove objects.  
→ `public/projects/` — Add corresponding screenshot image.

### Update pricing
→ `lib/data.ts` — `pricing` array. Change prices, features, timeline.

### Update services
→ `lib/data.ts` — `services` array.

### Change contact info (WhatsApp number, email, phone)
→ Search across `components/Footer.tsx`, `components/FloatingWhatsApp.tsx`, `components/StartProject.tsx`

### Change admin password
→ `app/admin/page.tsx` — find the password constant and change it.

### Add a form field to the inquiry form
1. `components/StartProject.tsx` — add input in the appropriate step
2. `app/actions/submit-inquiry.ts` — add field to the insert values
3. `db/schema.ts` — add column to the leads table
4. `npx drizzle-kit push` — push schema change to Neon
5. `app/admin/page.tsx` — add field to the lead display

### Add a new section to the homepage
1. Create `components/NewSection.tsx`
2. Import and add to `app/page.tsx`
3. Add anchor link in `components/Navbar.tsx` if needed

### Change brand colors
→ `app/globals.css` — the `@theme` block. Key vars: `--color-violet`, `--color-bg`, `--color-text`

---

## Common Pitfalls

### 1. Neon free tier cold starts
Neon pauses inactive databases. The first DB request after idle takes 2–5 seconds. This is normal. Don't add artificial timeouts — just let it retry. In production, Vercel keeps the function warm enough that this rarely affects real users.

### 2. Server Action vs API route
This project uses **Server Actions exclusively** (no `app/api/` routes). When adding new database operations, create them in `app/actions/` with `"use server"`, not as API routes.

### 3. drizzle.config.ts has hardcoded connection string
The Drizzle config contains a hardcoded Neon connection string for CLI operations. This is a security issue but doesn't affect runtime (runtime uses `DATABASE_URL` env var). Don't commit updated credentials here.

### 4. Admin auth is client-side only
The admin panel uses `sessionStorage` for authentication — this is entirely client-side. There's no server-side session for the admin. This means anyone with DevTools can bypass it by setting `sessionStorage["wc-admin"] = "true"`. For a production admin panel with sensitive data, this should be upgraded to server-side auth.

### 5. `lib/data.ts` is the single source of truth for content
The Portfolio, Services, Pricing, and StartProject components all import from `lib/data.ts`. Never inline content data in the components — always put it in `lib/data.ts`.

### 6. `"use client"` boundary
`app/page.tsx` renders both server and client components. Server components (Services, Pricing, HowItWorks) run at build time. Client components (Hero, Portfolio, StartProject, Navbar, BottomNav) run in the browser. Don't import server-only modules (like `db/index.ts`) from client components — it will throw.

---

## Project-Specific Patterns

### Pattern: Section component structure
Most section components follow this pattern:
```tsx
// Server component: reads from lib/data.ts
import { services } from "@/lib/data";
export default function Services() {
  return <section id="services">...</section>;
}
```
The `id` attribute on the section matches the anchor link in Navbar.

### Pattern: Server Action for DB write
```typescript
// app/actions/submit-inquiry.ts
"use server";
import { db } from "@/db";
import { leads } from "@/db/schema";

export async function submitInquiry(data: InquiryData) {
  await db.insert(leads).values(data);
  return { success: true };
}
```

### Pattern: Static data structure in lib/data.ts
```typescript
export const projects = [
  {
    id: "unique-slug",     // Used as URL param and reference key
    name: "Project Name",
    // ...
  }
] as const;
```

### Pattern: "Build Like This" button in Portfolio
Clicking the "Build Like This" button on a project card sets `?type=ecommerce` in the URL. `StartProject.tsx` reads this param on mount via `useSearchParams()` and pre-selects the matching project type in step 1 of the form.

---

## Safe Areas for Modifications

- `lib/data.ts` — Update all portfolio content here
- `components/Services.tsx` — Layout and styling
- `components/Pricing.tsx` — Layout and styling
- `components/HowItWorks.tsx` — Content and layout
- `components/Footer.tsx` — Layout and contact info
- `components/FloatingWhatsApp.tsx` — Phone number
- `public/` — Add static images
- `app/globals.css` — Styling and theme tokens

---

## Areas Requiring Caution

### `db/schema.ts` + Neon DB
Schema changes must be pushed to Neon. Use `npx drizzle-kit push` for dev or generate migrations for production. Dropping columns loses data.

### `app/actions/submit-inquiry.ts`
This is the core business logic — it saves leads. Test thoroughly after any change. A broken server action means lost leads.

### `components/StartProject.tsx`
The main conversion form. Multi-step with validation. Test all 4 steps and the success state after any changes.

### `app/admin/page.tsx`
Contains the hardcoded admin password. Don't accidentally log it or expose it in client-side errors.
