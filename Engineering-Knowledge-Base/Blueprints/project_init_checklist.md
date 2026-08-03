# Project Initialization Checklist

Complete this before writing any feature code.

---

## Phase 1: Repository Setup

```
□ Create GitHub repo: github.com/SherifAsh93/[ProjectName]
□ Clone to: /home/sherif/sites/[ProjectName]
□ Initialize: npx create-next-app@16 . --typescript --tailwind --app --src-dir --no-eslint
□ Create .gitignore (ensure .env.local is ignored)
□ Create .env.example with all required keys (empty values)
□ Create .env.local with actual values (never commit)
```

---

## Phase 2: Dependencies

### Ecommerce (Vercel + Prisma)
```bash
□ npm install prisma @prisma/client @prisma/adapter-pg pg jose bcryptjs zustand lucide-react server-only sharp
□ npm install -D @types/bcryptjs @types/pg @tailwindcss/postcss dotenv
□ npx prisma init
```

### Portfolio (VPS + Drizzle)
```bash
□ npm install drizzle-orm @neondatabase/serverless jose lucide-react framer-motion server-only
□ npm install -D drizzle-kit @tailwindcss/postcss
```

---

## Phase 3: Configuration Files

```
□ postcss.config.mjs → { "@tailwindcss/postcss": {} }
□ next.config.ts → images.remotePatterns for CDN hostnames
□ tsconfig.json → verify "strict": true + "@/*": ["./src/*"] path alias
□ package.json → update build script for DB
```

### Build Scripts
```json
// Ecommerce with seed:
"build": "prisma generate && prisma db push --accept-data-loss && node prisma/seed.cjs && next build"

// Simple with Prisma:
"build": "prisma generate && prisma db push --accept-data-loss && next build"

// Drizzle (VPS):
"build": "next build"
```

---

## Phase 4: Core Library Files

```
□ src/lib/prisma.ts — singleton (Ecommerce)
   OR src/db/client.ts — Drizzle (Portfolio)
   OR src/lib/content.ts — flat-file (CMS)

□ src/lib/session.ts — Jose JWT (import "server-only" at top)
□ src/lib/utils.ts — formatPrice, calcShipping, generateOrderNumber

□ src/types/index.ts — CartItem + shared interfaces
□ src/store/cartStore.ts — Zustand + persist (Ecommerce only)
□ src/components/StoreHydration.tsx — Zustand rehydration (Ecommerce only)
```

---

## Phase 5: Database

```
□ Write prisma/schema.prisma with all models
□ Run: npx prisma db push
□ Run: npx prisma generate
□ Write prisma/seed.cjs with upsert (not create) for all seeds
□ Run: node prisma/seed.cjs to verify seed works
□ Verify in Neon console that tables exist
```

---

## Phase 6: Globals CSS

```
□ Replace generated globals.css content
□ @import "tailwindcss" (NOT @tailwind base/components/utilities)
□ @theme block with color tokens, font tokens
□ @keyframes: marquee, fade-in-up, slide-in-right
□ Custom classes: .animate-marquee, .animate-fade-in-up, etc.
□ .pb-safe for mobile safe area
□ Custom scrollbar (inside @media (hover: hover))
```

---

## Phase 7: Authentication

```
□ src/lib/session.ts written with correct pattern
□ src/app/api/admin/login/route.ts
□ src/app/api/admin/logout/route.ts
□ src/app/admin/layout.tsx — auth gate
□ src/components/admin/AdminLoginView.tsx
□ Test: login works, logout works, 401 on protected routes without session
```

---

## Phase 8: Admin Panel Structure

```
□ src/app/admin/page.tsx — stats dashboard
□ src/components/admin/AdminSidebar.tsx
□ First resource CRUD (e.g., products)
□ Test: admin login → see dashboard → navigate sidebar
```

---

## Phase 9: Store Layout (Ecommerce)

```
□ src/app/(store)/layout.tsx — with Navbar, Footer, CartDrawer, StoreHydration
□ src/components/layout/Navbar.tsx — with triple-click logo
□ src/components/layout/Footer.tsx
□ src/components/store/CartDrawer.tsx
□ src/app/(store)/page.tsx — homepage
□ Test: homepage loads, navbar visible, cart icon, footer correct
```

---

## Phase 10: Final Checks Before First Push

```
□ npx tsc --noEmit — no TypeScript errors
□ npm run build — build succeeds locally
□ Browser: homepage loads
□ Browser: admin login works (logo triple-click → /admin)
□ Browser: mobile layout (390px)
□ No .env.local in git: git status
□ .env.example committed with empty values
□ README.md updated with: project description, local setup steps, env vars needed
□ git add -A && git commit -m "Initial commit"
□ git push origin main
```

---

## Phase 11: Production Deployment

### Vercel
```
□ Connect repo in Vercel dashboard
□ Add all env vars in Vercel project settings
□ Deploy: vercel --prod
□ Verify: site loads on production URL
□ Verify: admin panel accessible
□ Verify: DB connected (check Neon dashboard for connections)
```

### VPS (PM2)
```
□ Clone repo on VPS: git clone ...
□ npm install
□ Create .env.local with production values
□ npm run build
□ pm2 start npm --name "[project-name]" -- start
□ pm2 save
□ Configure Nginx reverse proxy
□ certbot --nginx for SSL
□ Test: https://[domain] loads correctly
```

---

## Environment Variables Checklist

| Variable | Required For | Notes |
|----------|-------------|-------|
| `DATABASE_URL` | All DB projects | Neon connection string |
| `SESSION_SECRET` | All auth | Min 32 chars, random |
| `ADMIN_PASSWORD` | All admin panels | Set to something strong |
| `GITHUB_TOKEN` | Image CDN | PAT with repo scope |
| `GITHUB_REPO` | Image CDN | Repo name only (not full URL) |
| `NEXT_PUBLIC_SITE_URL` | SEO, absolute URLs | https://... |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp checkout | Country code + number |
