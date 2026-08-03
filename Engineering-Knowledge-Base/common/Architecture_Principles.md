# Architecture Principles

These principles are extracted from 5 production projects and represent consistent decisions across the entire portfolio. Every new project should default to these unless a documented reason overrides them.

---

## Core Stack (Non-Negotiable)

Every project uses:

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js App Router | 16.x |
| UI | React | 19.x |
| Language | TypeScript (strict mode) | 5.x |
| Styling | Tailwind CSS v4 | 4.x |
| Deployment | Vercel | — |
| Icons | lucide-react | latest |

This stack is proven across: Ahmed-Elakad, Montelle, zahrtelkhlig, webistrydev, elghaly-vr.

---

## App Router Patterns

### Route Groups
Use parenthesized route groups to isolate layout boundaries:
```
app/
  (store)/          # Customer-facing layout (navbar + footer)
    layout.tsx
    page.tsx
  admin/            # Admin layout (minimal, no store chrome)
    layout.tsx
  owner/            # Analytics layout (read-only, dark theme)
  pos/              # POS terminal layout
```
**Used in:** Montelle `(store)`, zahrtelkhlig `(store)` + `admin/` + `owner/` + `pos/`

### Dynamic Routes
Always implement `generateStaticParams()` for known dynamic segments:
```typescript
export async function generateStaticParams() {
  return [{ year: '2022' }, { year: '2023' }, ...];
}
```
**Used in:** Ahmed-Elakad `/bridal/[year]`, `/couture/[year]`

### Caching Strategy

| Use Case | Strategy | Code |
|----------|----------|------|
| Content changes frequently (CMS, always-fresh data) | force-dynamic | `export const dynamic = "force-dynamic"` |
| Store pages (products, categories) | ISR 60s | `export const revalidate = 60` |
| Static content (portfolio, landing) | Default (static) | No export needed |
| After admin mutation | On-demand revalidate | `revalidatePath('/')` |

**Rule:** Never mix force-dynamic and revalidate in the same project. Choose one strategy and apply it consistently to a route group.

---

## Server vs Client Components

**Default:** All components are Server Components unless they need:
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window, MediaRecorder)
- React hooks (useState, useEffect, useRef)
- Third-party client libraries (Three.js, Framer Motion, Zustand)

**Pattern in every project:**
```typescript
// Server component — no directive needed
export default function ProductList({ products }) { ... }

// Client component — must declare
"use client";
import { useState } from "react";
export default function AddToCartButton() { ... }
```

**Large pages (admin dashboards):** Admin pages are `"use client"` monoliths because they are highly interactive. This is intentional — splitting admin UIs into server/client fragments adds complexity without benefit at this scale.

---

## Data Fetching Patterns

### Server Components → Direct DB/File Access
```typescript
// In a Server Component page
import { getContent } from "@/lib/content";
export default async function Page() {
  const content = await getContent();  // direct DB or file read
  return <Component data={content} />;
}
```

### Client Components → API Routes or Server Actions
```typescript
// API route approach (used in Ahmed-Elakad admin dashboard)
const data = await fetch('/api/admin/products').then(r => r.json());

// Server action approach (used in webistrydev, zahrtelkhlig)
"use server";
export async function createOrder(formData: FormData) { ... }
```

**Decision rule:**
- Ecommerce checkout, auth flows → **Server Actions** (type-safe, no HTTP overhead)
- Admin dashboards with heavy client state → **API routes** (explicit REST, easier to debug)
- Static data reads → **Direct in Server Component** (no network round-trip)

---

## Auth Architecture

### Simple Admin (1 person)
**Pattern:** Single password → Jose JWT → httpOnly cookie
```typescript
// Used in: Montelle, zahrtelkhlig (admin), Ahmed-Elakad (cookie only)
const token = await new SignJWT({ role: 'ADMIN' })
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('8h')
  .sign(secret);
cookies().set('admin_session', token, { httpOnly: true, secure: true });
```

### Multi-Role Auth
**Pattern:** bcryptjs hash + Jose JWT + role in payload + separate session cookies
```typescript
// Used in: zahrtelkhlig (USER/STAFF/OWNER/ADMIN)
// Cookie "session" → regular users (7-day)
// Cookie "admin_session" → admin (8-hour)
```

### Guard Pattern (in every admin API route)
```typescript
const session = await getAdminSession();
if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
```

### Secret Admin Access
All projects with an admin panel use the **triple-click/triple-tap logo** to navigate to `/admin`:
- Navbar click counter resets after 800ms
- 3 clicks within window → `router.push('/admin')`
- Normal single click → `href="/"`

---

## API Design

### REST Structure
```
GET    /api/products          → list (with filters as query params)
GET    /api/products/[id]     → single record
POST   /api/products          → create
PUT    /api/products/[id]     → full update
PATCH  /api/products/[id]     → partial update
DELETE /api/products/[id]     → delete
DELETE /api/products          → bulk delete (IDs in body)
```

### Response Format
```typescript
// Success
Response.json({ data }, { status: 200 | 201 })

// Error
Response.json({ error: 'Human-readable message' }, { status: 400 | 401 | 403 | 404 | 500 })
```

### Auth Check Pattern (every admin route)
```typescript
export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  // ... handler logic
}
```

---

## State Management

### Global Client State → Zustand
Used for cart and wishlist (Montelle, zahrtelkhlig):
```typescript
// Always use persist middleware for cart
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCart = create(persist(
  (set, get) => ({ items: [], addItem: ..., clearCart: ... }),
  { name: 'cart-storage' }  // localStorage key
));
```

### Rehydration Pattern
Zustand persist requires client-side rehydration after SSR:
```typescript
// StoreHydration.tsx — mounted once in root layout
"use client";
import { useEffect } from "react";
export function StoreHydration() {
  useEffect(() => { /* Zustand auto-rehydrates on mount */ }, []);
  return null;
}
```

### Local Component State → useState
For form inputs, modals, loading states, pagination. No global state for these.

### No Redux, No Context for data
React Context is used only for: language selection (webistrydev), never for server data.

---

## Image Architecture

Two patterns across projects:

### Pattern A: GitHub CDN (Montelle, zahrtelkhlig)
```
Upload → GitHub REST API PUT → repo: public/images/products/
Access → https://cdn.jsdelivr.net/gh/{org}/{repo}@main/public/images/products/{file}
```
**Cost:** Free. **Limit:** 5000 API req/hr (authenticated). **Best for:** Vercel-hosted projects.

### Pattern B: VPS Local Disk (Ahmed-Elakad)
```
Upload → /api/upload → /home/sherif/data/{project}/images/
Access → Nginx /media/ → Node.js _next/image → AVIF/WebP
```
**Cost:** VPS disk space. **Best for:** VPS-hosted projects with heavy media (1000+ images).

### Image Optimization (both patterns)
Always route images through `/_next/image`:
```typescript
// next.config.ts — allow CDN domain
images: {
  remotePatterns: [{ hostname: 'cdn.jsdelivr.net' }],
  minimumCacheTTL: 2592000,  // 30 days
  formats: ['image/avif', 'image/webp'],
}
```

---

## Error Handling Philosophy

**API routes:** Return structured JSON errors, never throw:
```typescript
try {
  const result = await prisma.product.create({ data });
  return Response.json(result, { status: 201 });
} catch (e) {
  return Response.json({ error: 'Failed to create product' }, { status: 500 });
}
```

**Server actions:** Return `{ error: string }` or `{ success: true }`, redirect on success:
```typescript
export async function createOrder(formData: FormData) {
  if (!name) return { error: 'Name is required' };
  await prisma.order.create({ data });
  redirect(`/orders/${id}?success=true`);
}
```

**Client components:** Store error in state, display inline:
```typescript
const [error, setError] = useState<string | null>(null);
// On catch: setError(data.error || 'Something went wrong');
// In JSX: {error && <p className="text-red-500">{error}</p>}
```

---

## TypeScript Conventions

```typescript
// Prefer interface over type (extensible)
interface Product { id: string; name: string; price: number; }

// String literals as enums (no runtime enum overhead)
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

// Record for dynamic keys
type YearCollections = Record<string, Collection[]>;

// Partial for updates
type ProductUpdate = Partial<Omit<Product, 'id' | 'createdAt'>>;

// Always optional with ?
interface SiteContent { hero?: HeroContent; about?: AboutContent; }
```

**Path alias:** Always `@/*` → `./src/*` or `./` (root). Import as `@/components/Navbar` never `../../components/Navbar`.

---

## Folder Conventions

```
src/ or root/
  app/              # Routes (Next.js)
  components/
    ui/             # Generic reusable (Button, Badge, Spinner)
    layout/         # Site-wide (Navbar, Footer)
    store/          # Customer-facing features
    admin/          # Admin-only features
  lib/              # Pure utilities (no components)
    prisma.ts       # DB singleton
    session.ts      # Auth helpers (server-only)
    utils.ts        # Business logic helpers
  store/            # Zustand stores (cart, wishlist)
  types/            # TypeScript interfaces (index.ts)
  generated/        # Auto-generated (Prisma client — never edit)
```

---

## Deployment Model

| Project Type | Host | Process |
|-------------|------|---------|
| Ecommerce (Montelle, zahrtelkhlig) | Vercel | Auto-deploy on push to main |
| Portfolio (Ahmed-Elakad, webistrydev) | VPS + PM2 + Nginx | Manual deploy or PM2 ecosystem |
| Tools (elghaly-vr) | Vercel | Auto-deploy on push |

**Vercel build commands:**
- Simple: `next build`
- With DB: `prisma generate && prisma db push --accept-data-loss && next build`
- With seed: `prisma generate && prisma db push --accept-data-loss && node prisma/seed.cjs && next build`
