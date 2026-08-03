# Master AI Context

The complete engineering reference for building new projects that match Sherif's (Webistry Dev) architecture, style, and quality standards. Read this before starting any new project.

---

## Who Am I Building For

**Sherif** — Egyptian freelance web developer and agency owner (Webistry Dev). Builds:
- Ecommerce platforms for Egyptian small businesses (fashion, bridal wear)
- Portfolio and lead-gen sites for service businesses
- Specialized tools (VR visualization, booking systems)
- All projects are production-grade, customer-facing, revenue-generating

**Markets:** Egypt-first. Arabic RTL is required for customer-facing ecommerce. Egyptian payment methods (Vodafone Cash, InstaPay, COD). Egyptian cities for shipping. Arabic product names with English secondary.

**Scale:** Each project serves hundreds to low thousands of users. Not enterprise scale. Single admin user. Simple deployments. Cost-efficiency matters.

---

## Engineering Philosophy

### Simplicity Over Cleverness
- Use the simplest solution that works in production
- No abstractions for hypothetical future requirements
- Three similar lines > premature abstraction
- If it fits in one file, keep it in one file (see: elghaly-vr, webistrydev admin)

### Server-First
- Default to Server Components — only go client when required
- Move business logic to the server (API routes, server actions)
- Never trust client-side for auth, pricing, or stock

### Permanence
- Every piece of code must survive months without the original developer
- No magic, no undocumented tricks, no implicit knowledge requirements
- Code names explain the what; comments explain the non-obvious why

### Production = Immediate
- Every project launches production-ready, not "MVP with plans to improve"
- Mobile-first always (Egyptian users are mobile-dominant)
- Admin panels built for non-technical users

---

## Non-Negotiable Technology Choices

| Layer | Technology | Never Substitute |
|-------|-----------|-----------------|
| Framework | Next.js 16 App Router | — |
| Language | TypeScript strict | — |
| Styling | Tailwind CSS v4 | — |
| Icons | lucide-react | — |
| Deployment | Vercel (or VPS+PM2) | — |
| Auth | Jose JWT (HS256, httpOnly) | NextAuth, Clerk, Auth0 |
| ORM (complex) | Prisma + pg adapter | TypeORM, Sequelize |
| ORM (simple) | Drizzle + Neon HTTP | — |
| DB | Neon PostgreSQL | MySQL, MongoDB |
| Cart state | Zustand + localStorage persist | Redux, Context API |
| Password hash | bcryptjs | argon2, bcrypt |
| Image CDN | GitHub + jsDelivr | S3 (unless VPS) |

---

## Architecture Patterns (Memorize These)

### 1. Route Group Layout Isolation
```
app/
  (store)/     # Customer layout (navbar+footer+cart)
  admin/       # Admin layout (auth gate + sidebar)
  owner/       # Analytics layout (read-only, dark)
  pos/         # POS layout (staff only)
  api/         # No layout
  actions/     # Server actions ("use server")
```

### 2. The Auth Stack
```
Customer: email + bcryptjs → Jose JWT → "session" cookie (7 days)
Admin:    password → Jose JWT → "admin_session" cookie (8 hours)
Staff:    username + bcryptjs → "session" cookie with role=STAFF
Owner:    password from DB → "session" cookie with role=OWNER
```

### 3. Data Fetching Hierarchy
```
Server Components → Direct Prisma queries (zero network)
Client Components → fetch('/api/...') on mount
Server Actions → Direct Prisma + redirect/return (mutations)
```

### 4. Image Storage Decision
```
Vercel-hosted project → GitHub API → jsDelivr CDN
VPS-hosted project → Nginx /media/ → Node.js _next/image
```

### 5. Cart Architecture
```
Shopping: Zustand (client) → localStorage persist
Checkout: Serialize cart → FormData → Server Action → Prisma Order + OrderItems
After order: clearCart()
```

### 6. Admin Access
```
URL: Never advertise /admin
Navigation: Triple-click logo (3 clicks within 800ms) → router.push('/admin')
Auth: One-field password form → JWT → 8-hour session
```

---

## Complete Project Blueprint

When starting a new ecommerce project, initialize this exact structure:

```bash
npx create-next-app@16 project-name --typescript --tailwind --app --src-dir
cd project-name
npm install prisma @prisma/client @prisma/adapter-pg pg jose bcryptjs zustand lucide-react server-only sharp
npm install -D @types/bcryptjs @types/pg @tailwindcss/postcss dotenv
```

**Required files to create immediately:**
1. `prisma/schema.prisma` — full schema
2. `src/lib/prisma.ts` — singleton with PG adapter
3. `src/lib/session.ts` — Jose JWT with `import "server-only"`
4. `src/lib/utils.ts` — formatPrice, calcShipping, generateOrderNumber
5. `src/store/cart.ts` — Zustand + persist
6. `src/types/index.ts` — all shared interfaces
7. `src/components/StoreHydration.tsx` — Zustand rehydration
8. `src/app/globals.css` — @theme tokens + custom animations
9. `.env.local` + `.env.example`
10. `prisma/seed.cjs` — idempotent category seed

---

## Naming Conventions (Every File, Every Variable)

### Files
- React components → `PascalCase.tsx` (ProductCard, CartDrawer, AdminSidebar)
- Utilities → `camelCase.ts` (prisma.ts, session.ts, utils.ts)
- Pages → lowercase `page.tsx`
- Routes → lowercase segments (`app/admin/products/page.tsx`)
- Stores → `camelStore.ts` (cartStore.ts, wishlistStore.ts)

### Database Fields
- Standard: camelCase (`customerPhone`, `createdAt`, `sortOrder`)
- Bilingual: `nameAr` + `nameEn`, `titleAr` + `titleEn`, `descriptionAr` + `descriptionEn`
- IDs: `id` (CUID), `userId`, `productId`, `categoryId`
- Flags: `active`, `featured`, `seasonal` (boolean, no prefix)
- Enums: SCREAMING_SNAKE_CASE values

### TypeScript
- Interfaces (not type) for object shapes
- String literals for enums: `'PENDING' | 'CONFIRMED'`
- Optional with `?`: `description?: string`
- Record for dynamic keys: `Record<string, Collection[]>`

### CSS Classes (Tailwind)
- Never introduce new font sizes — use the established scale
- Never introduce new colors — use CSS variables or existing palette
- Responsive prefix order: `base → sm → md → lg → xl`

---

## Quality Standards

### Every Feature Must Have
- Mobile layout tested (≤375px, 390px, 428px)
- Loading state (spinner or skeleton)
- Error state (inline message, never empty or broken)
- Empty state (intentional design, never blank)
- Auth protection if behind admin

### Every API Route Must Have
- Auth check as first line
- try/catch around DB operations
- Structured error response: `{ error: 'message' }`
- Correct status codes (401 not authed, 403 wrong role, 400 bad input, 500 server)

### Every Order Must
- Snapshot product name, price, image in OrderItem
- Have a unique order number (generated, not DB auto-increment)
- Track order source (ONLINE vs POS)
- Never reduce stock on creation (admin manually processes online orders)

### Every Admin UI Must
- Work fully without a mouse (keyboard navigation)
- Show success/error feedback after every action
- Confirm before destructive actions (delete)
- Log admin out cleanly (session cookie deleted)

---

## Known Differences Between Projects (Decision Map)

### When to use force-dynamic vs ISR

| Situation | Caching |
|-----------|---------|
| Content driven by JSON file (CMS) | `force-dynamic` |
| Store product pages | `revalidate = 60` |
| Portfolio/landing page | Static (no export) |
| Admin pages | `force-dynamic` (always fresh) |

### When to use Server Actions vs API Routes

| Situation | Choice |
|-----------|--------|
| Form submission with redirect | Server Action |
| Auth (login, logout) | Server Action |
| Admin CRUD that client fetches | API Route |
| Dashboard data (client component) | API Route |
| Config/settings updates | Server Action + revalidatePath |

### When to use flat-file vs Prisma

| Situation | Choice |
|-----------|--------|
| VPS-only, ≤50MB data, single admin | Flat-file JSON + atomic write |
| Multiple tables, relations, Vercel | Prisma + Neon |
| ≤5 tables, simple CRUD, serverless | Drizzle + Neon |

---

## Recurring Implementation Patterns

### Guard Pattern (copy verbatim)
```typescript
// Top of every admin API route
const session = await getAdminSession();
if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
```

### Prisma Singleton (copy verbatim)
```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
function make() { return new PrismaClient({ adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })) }); }
export const prisma = globalForPrisma.prisma ?? make();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Order Creation with Snapshot (copy verbatim)
```typescript
const order = await prisma.order.create({
  data: {
    ...orderHeader,
    items: {
      createMany: {
        data: cartItems.map(item => ({
          productId: item.id,
          name: item.name,      // snapshot — NOT FK-only
          price: item.price,    // snapshot
          image: item.image,    // snapshot
          quantity: item.quantity,
        })),
      },
    },
  },
});
```

### Triple-Click Admin (copy verbatim)
```typescript
const count = useRef(0);
const timer = useRef<ReturnType<typeof setTimeout>>();
function handleClick(e: React.MouseEvent) {
  e.preventDefault();
  count.current++;
  clearTimeout(timer.current);
  timer.current = setTimeout(() => { count.current = 0; }, 800);
  if (count.current >= 3) { count.current = 0; router.push('/admin'); return; }
  if (count.current === 1) router.push('/');
}
```

---

## Feature Implementation Checklist

### New Resource (e.g., Reviews, Testimonials, FAQ)
```
1. □ Add Prisma model to schema.prisma
2. □ Run prisma db push && prisma generate
3. □ Add to types/index.ts if using manual types
4. □ Create /api/[resource]/route.ts (public GET)
5. □ Create /api/admin/[resource]/route.ts (admin CRUD)
6. □ Create /admin/[resource]/page.tsx
7. □ Add to admin sidebar navigation
8. □ Create store component if needed
9. □ Add to appropriate store page
10. □ Test: create, read, update, delete in admin
11. □ Test: display on store page
12. □ Test: mobile layout
```

### New Payment Method
```
1. □ Add to PaymentMethod enum in Prisma schema
2. □ Push schema
3. □ Add to checkout form radio options
4. □ Add to translations if Arabic project
5. □ Add admin instructions for new method
6. □ Test: order created with new method appears in admin
```

### New Homepage Section
```
1. □ Add type to HomepageSectionType in lib/homepage.ts
2. □ Add default config entry
3. □ Create components/store/NewSection.tsx
4. □ Add to app/(store)/page.tsx render
5. □ Add editor in app/admin/homepage/HomepageSettingsForm.tsx
6. □ Test: enable/disable in admin, verify on homepage
```

---

## Things That Will Break If Done Wrong

| Anti-Pattern | What Breaks |
|--------------|-------------|
| Import PrismaClient directly (not singleton) | DB connection pool exhausted in dev |
| Create Three.js materials in render body (not useMemo) | Memory leak, performance degradation |
| Unlayered CSS reset after `@import "tailwindcss"` | All Tailwind utilities broken by specificity |
| Store only FK in OrderItem (no snapshot) | Historical orders show wrong price/name |
| Forget `prisma generate` after schema change | Runtime type errors on new fields |
| Use `--accept-data-loss` with column drops in production | Data permanently lost |
| Run seed without `upsert` (use `create`) | Build fails on second deploy (duplicate error) |
| Forget `revalidatePath` after settings/config write | Stale homepage shows old config |
| Set cart state in server component | Hydration mismatch, React crash |
| Forget `.convertSRGBToLinear()` on Three.js color set | Wrong color rendering in PBR scene |
| Force push to main on Vercel project | Build webhook confusion, possible data loss |
| Missing `not-found.tsx` + `error.tsx` | Next.js default error pages expose framework details |
| No inline script for lang direction in root layout | Flash of wrong text direction (RTL→LTR flicker) on bilingual sites |
| `await Promise.all()` for notifications | One notification failure silently kills the form submission — use `allSettled` |

---

## Decision-Making Process

When encountering an ambiguous implementation decision:

1. **Check if we've solved this before** — Look in `/common/Reusable_Patterns.md`
2. **Find the nearest analogous feature** — Read the existing implementation in the most similar project
3. **Apply the most conservative approach** — Simpler, more explicit, fewer abstractions
4. **If no precedent exists** — Choose based on:
   - Will this run on Vercel? → Use serverless-compatible patterns
   - Is this user-visible? → Mobile-first, always fallback state
   - Is this a mutation? → Server action + revalidation
   - Is this admin-only? → API route + client fetch

---

## Project Handoff Checklist

Before reporting any feature as complete:

```
□ Tested in browser (not just via TypeScript check)
□ Tested on mobile viewport (390px)
□ Empty state tested (no data in DB)
□ Error state tested (invalid input, server down)
□ Auth tested (tried without session, got 401)
□ Admin UI updates after action (no stale state)
□ No console errors or TypeScript warnings
□ Existing features still work (didn't break anything)
□ Environment variables documented in .env.example
□ README or PROJECT_CONTEXT.md updated if architecture changed
```

---

## Contact / Identity

- **Developer:** Sherif (Webistry Dev)
- **Email:** sherif.ash93@gmail.com
- **GitHub:** SherifAsh93
- **Business:** webistrydev.com (freelance web development, Egypt)
- **Projects:** All under github.com/SherifAsh93
