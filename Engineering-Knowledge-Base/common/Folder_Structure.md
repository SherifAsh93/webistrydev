# Folder Structure

The canonical folder organization used across all projects. Variations are documented with rationale.

---

## Standard Next.js App Router Structure

```
project-root/
├── src/                          # Source root (most projects)
│   ├── app/                      # Next.js routing
│   │   ├── layout.tsx            # Root layout (fonts, metadata, providers)
│   │   ├── globals.css           # Tailwind v4 + design tokens
│   │   ├── page.tsx              # Homepage
│   │   │
│   │   ├── (store)/              # Route group: customer store
│   │   │   ├── layout.tsx        # Store layout (navbar + footer + cart)
│   │   │   ├── page.tsx          # Store homepage
│   │   │   ├── products/
│   │   │   │   ├── page.tsx      # Product list
│   │   │   │   └── [id]/page.tsx # Product detail
│   │   │   ├── checkout/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   └── [auth-pages]/
│   │   │
│   │   ├── admin/                # Admin dashboard
│   │   │   ├── layout.tsx        # Admin layout (auth gate + sidebar)
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── products/
│   │   │   │   ├── page.tsx      # Product list
│   │   │   │   ├── new/page.tsx  # Create product
│   │   │   │   └── [id]/page.tsx # Edit product
│   │   │   ├── orders/
│   │   │   ├── categories/
│   │   │   └── banners/
│   │   │
│   │   ├── api/                  # API routes
│   │   │   ├── products/
│   │   │   │   ├── route.ts      # GET list, POST create
│   │   │   │   └── [id]/route.ts # GET, PATCH, DELETE
│   │   │   ├── admin/
│   │   │   │   ├── products/route.ts
│   │   │   │   ├── orders/route.ts
│   │   │   │   └── upload/route.ts
│   │   │   └── [public-routes]/
│   │   │
│   │   └── actions/              # Server actions (mutations)
│   │       ├── auth.ts           # Login, register, logout
│   │       ├── orders.ts         # Create order
│   │       └── settings.ts       # Config mutations
│   │
│   ├── components/               # React components
│   │   ├── ui/                   # Generic, reusable design system
│   │   │   ├── Button.tsx        # Reusable button (variants)
│   │   │   ├── Badge.tsx
│   │   │   └── Spinner.tsx
│   │   ├── layout/               # Site-wide layout components
│   │   │   ├── Navbar.tsx        # Top navigation
│   │   │   ├── Footer.tsx        # Site footer
│   │   │   ├── AnnouncementBar.tsx
│   │   │   └── MobileBottomNav.tsx
│   │   ├── store/                # Customer-facing feature components
│   │   │   ├── ProductCard.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── HeroBanner.tsx
│   │   │   └── CategoryGrid.tsx
│   │   └── admin/                # Admin-only components
│   │       ├── AdminSidebar.tsx
│   │       ├── ProductForm.tsx
│   │       ├── ImageUpload.tsx
│   │       └── MediaPickerModal.tsx
│   │
│   ├── lib/                      # Utilities and services (no components)
│   │   ├── prisma.ts             # DB client singleton
│   │   ├── session.ts            # Auth session (server-only)
│   │   └── utils.ts              # Business logic helpers
│   │
│   ├── store/                    # Zustand stores
│   │   ├── cart.ts               # Cart store (Zustand + persist)
│   │   └── wishlist.ts           # Wishlist store
│   │
│   ├── types/                    # TypeScript types
│   │   └── index.ts              # All shared interfaces
│   │
│   └── generated/                # Auto-generated (never edit)
│       └── prisma/               # Prisma client
│
├── prisma/                       # Prisma ORM files
│   ├── schema.prisma             # Data schema
│   ├── seed.cjs                  # Seed script (runs on every build)
│   └── migrations/               # Migration files (if used)
│
├── public/                       # Static assets
│   ├── images/                   # Product images (if GitHub CDN not used)
│   └── logo.png
│
├── .env.local                    # Local environment variables (never commit)
├── .env.example                  # Template for env vars (commit this)
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript config
├── postcss.config.mjs            # Tailwind v4 PostCSS plugin
├── package.json                  # Dependencies + scripts
├── prisma.config.ts              # Prisma configuration (optional)
└── drizzle.config.ts             # Drizzle configuration (if using Drizzle)
```

---

## Variations by Project

### Variation 1: No `src/` wrapper (webistrydev)
When the project is smaller or started without `src/`:
```
webistrydev/
├── app/         # Routes (same as src/app/)
├── components/  # Components
├── db/          # Database (instead of lib/)
│   ├── schema.ts
│   └── index.ts
├── lib/         # Language context, translations, data
└── public/
```
**Why:** Existing project structure. No `src/` wrapping when not needed.

### Variation 2: Flat-file (Ahmed-Elakad)
No Prisma, no db/ folder. Data lives on VPS disk:
```
Ahmed-Elakad/
├── src/
│   ├── app/
│   └── lib/
│       ├── content.ts    # Read/write content.json
│       ├── clients.ts    # Read/write clients.json
│       ├── atomicWrite.ts # Safe JSON writes
│       └── cloudinary.ts  # Legacy image handling
└── /home/sherif/data/ahmed-elakad/  # DATA DIRECTORY (VPS, not in repo)
    ├── content.json
    ├── clients.json
    └── images/
```

### Variation 3: Single-file 3D app (elghaly-vr)
When the entire app is one client-side component:
```
elghaly-vr/
├── app/
│   ├── page.tsx     # ENTIRE APP (19KB) — all components, all logic
│   ├── layout.tsx
│   └── globals.css
└── public/
    └── room.glb     # 3D model (unused — room is procedural)
```

### Variation 4: Multi-dashboard (zahrtelkhlig)
Largest project — 4 separate interfaces:
```
zahrtelkhlig/src/app/
├── (store)/          # Customer store
├── admin/            # Admin panel
├── admin-login/      # Admin login page
├── owner/            # Owner analytics (read-only)
├── pos/              # Point-of-sale terminal
├── actions/          # Server actions
└── api/              # 32 API route files
```

---

## Component Placement Rules

**Ask these questions in order:**

1. Is it generic enough to use in any project? → `components/ui/`
2. Is it a global site-chrome element (nav, footer)? → `components/layout/`
3. Is it specific to the customer-facing store? → `components/store/`
4. Is it specific to the admin panel? → `components/admin/`
5. Is it a full page with complex state? → Inline in `app/[route]/page.tsx`

---

## `lib/` Placement Rules

Only files with NO React go in `lib/`:
- Database singleton → `lib/prisma.ts`
- Auth functions → `lib/session.ts` (add `import "server-only"`)
- Business logic helpers → `lib/utils.ts`
- Static data → `lib/data.ts`
- Type-only files → `types/index.ts`

Never put React components in `lib/`.  
One exception: React Context providers may live in `lib/` (e.g., `lib/language-context.tsx` in webistrydev).

---

## Naming Rules Summary

| Thing | Convention | Example |
|-------|-----------|---------|
| Component files | PascalCase | `ProductCard.tsx` |
| Route segments | lowercase | `app/admin/products/` |
| Page files | always `page.tsx` | `app/shop/page.tsx` |
| Layout files | always `layout.tsx` | `app/(store)/layout.tsx` |
| API routes | always `route.ts` | `app/api/products/route.ts` |
| Lib utilities | camelCase | `session.ts`, `utils.ts` |
| Zustand stores | camelCase + Store | `cartStore.ts` |
| Type files | index.ts | `types/index.ts` |
| Config files | camelCase | `drizzle.config.ts` |

---

## What Goes Where (edge cases)

| File type | Where |
|-----------|-------|
| `"use server"` data functions | `app/actions/` |
| `"server-only"` auth functions | `lib/session.ts` |
| TypeScript interfaces | `types/index.ts` |
| Prisma queries for pages | Directly in Server Component or in `lib/` helper |
| Static copy / content | `lib/data.ts` or `lib/translations.ts` |
| CSS animations | `app/globals.css` |
| Design tokens | `app/globals.css` inside `@theme {}` |
| Zustand stores | `store/` at root |
| Seeding scripts | `prisma/seed.cjs` |
| Auto-generated Prisma | `src/generated/prisma/` (never edit) |
