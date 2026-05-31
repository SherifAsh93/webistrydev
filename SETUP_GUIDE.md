# Webistrydev Portfolio — Setup Guide

## Prerequisites

- Node.js 18+ (Node 24 recommended)
- npm
- A Neon account (free tier works) at neon.tech

---

## Installation Steps

```bash
# 1. Navigate to project
cd /home/sherif/sites/web-corner

# 2. Install dependencies
npm install

# 3. Create .env.local with your database URL
echo 'DATABASE_URL="postgresql://..."' > .env.local

# 4. Push the schema to Neon (creates the leads table)
npx drizzle-kit push

# 5. Start development server
npm run dev
# Visit http://localhost:3000
```

---

## Required Environment Variables

Create `.env.local` in the project root:

```bash
# Neon PostgreSQL connection string
DATABASE_URL="postgresql://username:password@ep-xyz.us-east-1.aws.neon.tech/dbname?sslmode=require"
```

**How to get your DATABASE_URL:**
1. Sign up at neon.tech
2. Create a new project
3. Click "Connection Details"
4. Copy the connection string (use the "pooled" variant for Vercel)

**On Vercel:** Add `DATABASE_URL` in Project Settings → Environment Variables → Production.

---

## All Dependencies and Why They Are Used

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.1.0 | React framework: SSR, App Router, Server Actions |
| `react` | 19.2.3 | UI component library |
| `react-dom` | 19.2.3 | React DOM renderer |
| `@neondatabase/serverless` | 1.0.2 | Neon HTTP driver — required for serverless (Vercel) PostgreSQL connections |
| `drizzle-orm` | 0.45.1 | Type-safe SQL ORM — write SQL as TypeScript |
| `framer-motion` | 12.40.0 | Declarative animations — rotating words, scroll-triggered section reveals |
| `lucide-react` | 0.562.0 | Icon library used throughout components |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | 4 | Utility-first CSS framework |
| `@tailwindcss/postcss` | 4 | Tailwind v4 PostCSS integration |
| `typescript` | 5 | Static type checking |
| `drizzle-kit` | 0.31.8 | Drizzle CLI: schema push, migrations, Drizzle Studio |
| `eslint` | 9 | Code linting |
| `eslint-config-next` | 16.1.0 | Next.js ESLint rules |
| `@types/node` | 20 | TypeScript types for Node.js |
| `@types/react` | 19 | TypeScript types for React |
| `@types/react-dom` | 19 | TypeScript types for React DOM |

---

## Development Workflow

```bash
# Start dev server (hot reload)
npm run dev
# → http://localhost:3000

# Lint TypeScript and ESLint errors
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

**Admin dashboard:**
- Visit `/admin`
- Password: `114891` (hardcoded in `app/admin/page.tsx`)

**Database tools:**
```bash
# Push schema changes to Neon (dev only, no migration files)
npx drizzle-kit push

# Generate migration files (production-safe)
npx drizzle-kit generate
npx drizzle-kit migrate

# Open Drizzle Studio (visual DB browser)
npx drizzle-kit studio
```

---

## Build and Deployment Commands

### Vercel (automatic on push)
```bash
# Deploy preview
npx vercel

# Deploy to production
npx vercel --prod
```

Vercel auto-detects Next.js. Build command: `next build`. No `vercel.json` needed.

### Local production build
```bash
npm run build   # Creates .next/ folder
npm start       # Starts on port 3000
```

---

## Project Screenshots

Screenshots used in the Portfolio section are in `public/projects/`. To add a new project screenshot:

1. Place the image at `public/projects/your-project.jpg` (or `.png`, `.webp`)
2. Update the `screenshot` field in `lib/data.ts`
3. Next.js serves `public/` files at the root URL: `/projects/your-project.jpg`
