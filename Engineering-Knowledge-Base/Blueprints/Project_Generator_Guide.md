# Project Generator Guide

How an AI assistant should combine blueprints to build a new project from scratch.

---

## Step 1: Classify the Project

**Ecommerce?**
→ Use: `auth_blueprint.md` + `crud_blueprint.md` + `database_blueprint.md` + `dashboard_blueprint.md` + `landing_page_blueprint.md`
→ Reference: zahrtelkhlig (most complete), Montelle (luxury)

**Portfolio / Lead Gen?**
→ Use: `landing_page_blueprint.md` + `database_blueprint.md` (simple) + `auth_blueprint.md` (simple)
→ Reference: webistrydev

**CMS / Content Site?**
→ Use: `dashboard_blueprint.md` + `auth_blueprint.md` + `api_blueprint.md`
→ Reference: Ahmed-Elakad

**Interactive Tool (3D, Canvas)?**
→ Use: `landing_page_blueprint.md` (shell only, fill with tool)
→ Reference: elghaly-vr

---

## Step 2: Initialize Project

```bash
# Create Next.js 16 with TypeScript + Tailwind + App Router + src dir
npx create-next-app@16 project-name --typescript --tailwind --app --src-dir --no-eslint
cd project-name

# Install core dependencies
npm install jose lucide-react server-only

# For ecommerce (full stack):
npm install prisma @prisma/client @prisma/adapter-pg pg bcryptjs zustand sharp
npm install -D @types/bcryptjs @types/pg @tailwindcss/postcss dotenv

# For portfolio/lead-gen:
npm install drizzle-orm @neondatabase/serverless framer-motion
npm install -D drizzle-kit @tailwindcss/postcss

# Fix Tailwind v4 PostCSS
```

```javascript
// postcss.config.mjs
export default { plugins: { "@tailwindcss/postcss": {} } };
```

---

## Step 3: Configure globals.css

Replace the generated globals.css with the project-appropriate design system:

```css
@import "tailwindcss";

@theme {
  /* CHOOSE ONE palette and customize */
  
  /* Option A: Luxury (fashion, bridal) */
  --color-cream-50: #fdfaf6;
  --color-cream-100: #faf5ee;
  --color-gold-400: #d4b96a;
  --color-gold-500: #c4a35a;
  --color-dark-900: #1c1510;
  --font-serif: "Cormorant Garamond", Georgia, serif;
  --font-sans: "Montserrat", system-ui;
  
  /* Option B: Modern Tech (portfolio, tools) */
  --color-bg: #f7f6ff;
  --color-surface: #ffffff;
  --color-primary: #7c3aed;
  --color-accent: #0ea5e9;
  --color-text: #0f172a;
  --color-muted: #64748b;
  --font-sans: "Plus Jakarta Sans", system-ui;
}

/* Standard animations */
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes fade-in-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }

.animate-marquee { animation: marquee 25s linear infinite; }
.animate-fade-in-up { animation: fade-in-up 0.5s ease forwards; }
.animate-slide-in-right { animation: slide-in-right 0.3s ease forwards; }
.animate-slide-in-left { animation: slide-in-left 0.3s ease forwards; }

/* Safe area for mobile */
.pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }

/* Custom scrollbar (mouse only) */
@media (hover: hover) and (pointer: fine) {
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: var(--color-primary, #7c3aed); border-radius: 9999px; }
}
```

---

## Step 4: Create Core Library Files

### Always create these first:

**`src/lib/session.ts`** → Copy from `common/Reusable_Patterns.md` (Jose JWT section)

**`src/lib/utils.ts`**:
```typescript
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('ar-EG')} ج.م`;
}
export const FREE_SHIPPING_THRESHOLD = 800;
export const STANDARD_SHIPPING = 60;
export function calcShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
}
export function generateOrderNumber(prefix = 'ORD'): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}
```

**`src/types/index.ts`** → Define CartItem and other shared types

---

## Step 5: Apply Blueprints

### For Ecommerce:
1. **`database_blueprint.md`** → Set up Prisma schema + seed
2. **`auth_blueprint.md`** → Customer + admin sessions
3. **`crud_blueprint.md`** → Admin product management
4. **`dashboard_blueprint.md`** → Admin panel structure
5. **`landing_page_blueprint.md`** → Public store layout

### For Portfolio:
1. **`database_blueprint.md`** → Drizzle schema (leads + messages)
2. **`auth_blueprint.md`** → Simple admin (sessionStorage)
3. **`landing_page_blueprint.md`** → Single-page layout

---

## Step 6: Configure package.json Scripts

### Ecommerce (Vercel + Prisma):
```json
{
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "prisma generate && prisma db push --accept-data-loss && node prisma/seed.cjs && next build",
    "start": "next start",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  }
}
```

### Portfolio (VPS + Drizzle):
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:push": "npx drizzle-kit push"
  }
}
```

---

## Step 7: Configure next.config.ts

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "cdn.jsdelivr.net" },   // GitHub CDN
      { hostname: "raw.githubusercontent.com" },
      // Add your domain:
      { hostname: "your-domain.com" },
    ],
    minimumCacheTTL: 2592000,  // 30 days
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
```

---

## Step 8: Environment Variables

Create `.env.example` immediately (fill values in `.env.local`):

```bash
# Database
DATABASE_URL=

# Auth
SESSION_SECRET=
ADMIN_PASSWORD=

# Image CDN (GitHub)
GITHUB_TOKEN=
GITHUB_REPO=

# Public
NEXT_PUBLIC_SITE_URL=
```

---

## Step 9: Verify Before Launching

```bash
# Type check
npx tsc --noEmit

# Build locally first
npm run build

# Start
npm start

# Browser checks:
# 1. Homepage loads
# 2. Admin login works (logo triple-click → /admin)
# 3. Admin CRUD works (create product, update, delete)
# 4. Customer flow works (browse → add to cart → checkout)
# 5. Mobile layout correct (use DevTools 390px)
```

---

## Step 10: Deploy

```bash
# Vercel (ecommerce)
vercel --prod

# VPS (portfolio/CMS)
git push origin main
# On VPS: git pull && npm install && npm run build && pm2 restart project-name
```

---

## Project Naming Convention

GitHub repos: `PascalCase` (Montelle-Couture, zahrtelkhlig, webistrydev)
Local directories: same name as GitHub repo
PM2 process: kebab-case (`ahmed-elakad`, `webistrydev`)
