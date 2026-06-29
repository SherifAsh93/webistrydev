# 09 — Development Workflow

## Environment Variables

Only one variable is required:

```bash
# .env.local (for local development)
DATABASE_URL=postgresql://neondb_owner:<password>@ep-steep-resonance-ahctbjr8-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

This is the Neon pooled connection string. It must include `?sslmode=require`. On the VPS, this is set in the PM2 ecosystem file or the shell environment before `pm2 start`.

There are no other environment variables. No API keys, no OAuth secrets, no email provider keys, no object storage keys.

---

## Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with DATABASE_URL (see above)

# 3. (First time only) Push schema to Neon
npx drizzle-kit push

# 4. Start dev server
npm run dev
# → runs on http://localhost:3000
```

The dev server starts on port 3000 (Next.js default, no `--port` flag is used). There is no Docker compose, no local Postgres instance — the dev environment connects directly to the live Neon database.

---

## Production Deployment (VPS + PM2)

The live site runs on a VPS with:
- PM2 managing the Node.js process
- Nginx as a reverse proxy (handles HTTPS, forwards to port 3000)

### Deploy Steps

```bash
# On the VPS, from /home/sherif/sites/webistrydev/

# 1. Pull latest code
git pull origin main

# 2. Install dependencies (if package.json changed)
npm install

# 3. Build the Next.js app
npm run build

# 4. Restart PM2 process
pm2 restart webistrydev
# or: pm2 reload webistrydev (zero-downtime reload)

# 5. Verify
pm2 status
pm2 logs webistrydev --lines 20
```

### PM2 Process Name

The PM2 process is named `webistrydev` (check with `pm2 list`). The start command is `next start`, which serves the production build on port 3000.

### Nginx Configuration

Nginx is configured to:
1. Handle SSL termination for `webistrydev.com` and `www.webistrydev.com`
2. Proxy all requests to `http://localhost:3000`

The `next.config.ts` redirect handles `webistrydev.vercel.app` → `www.webistrydev.com` at the Next.js layer.

---

## Adding a New Portfolio Project

Portfolio projects are static data in `lib/data.ts`. No database is involved.

**Step 1**: Add the screenshot to `public/projects/`:
```
public/projects/my-new-project.png
```
Use a 16:9 or 4:3 ratio screenshot at ~1200px wide. PNG preferred.

**Step 2**: Add an entry to `projects` array in `lib/data.ts`:
```typescript
{
  id: "my-new-project",               // URL-safe unique ID
  name: "My New Project",             // Display name
  description: "Short description.",  // 1-2 sentences
  category: "ecommerce",              // one of: "fashion" | "ecommerce" | "clinic" | "web-app" | "corporate" | "landing"
  categoryLabel: "E-Commerce",        // display label
  categoryColor: "from-amber-500 to-orange-600",  // Tailwind gradient
  tags: ["Next.js", "PostgreSQL"],    // 3-4 tech tags
  url: "https://my-new-project.vercel.app",
  screenshot: "/projects/my-new-project.png",
  featured: true,                     // true = appears in main grid; false = secondary
}
```

**Step 3**: The `Portfolio.tsx` component iterates `projects` from `lib/data.ts` directly — no other changes needed.

**Note**: `lib/projects.ts` is a legacy duplicate of this data. Do not update it — it is not imported anywhere active.

---

## Adding a New Pricing Tier

**Step 1**: Add an entry to `pricing` array in `lib/data.ts`:
```typescript
{
  name: "Enterprise",
  egp: "100,000+",
  usd: "$2,200+",
  description: "For large-scale enterprise projects.",
  features: [
    "Custom architecture",
    "Dedicated support",
  ],
  timeline: "3+ months",
  popular: false,
  color: "from-emerald-600 to-teal-700",
}
```

**Step 2**: Add the corresponding translation strings in `lib/translations.ts` under `pricing.tiers` (if the `Pricing.tsx` component reads tier names/features from translations rather than data.ts — check the component's implementation to confirm which source it uses for dynamic content).

**Step 3**: `Pricing.tsx` renders the array — no other changes needed.

---

## Adding a New Translation String

All user-visible text must go through `lib/translations.ts`.

**Step 1**: Identify the correct section in `translations.ts` (e.g., `startProject`, `hero`, `nav`).

**Step 2**: Add the key to **both** `ar` and `en` objects:
```typescript
// lib/translations.ts
export const translations = {
  ar: {
    // ...
    startProject: {
      // existing keys...
      newFeatureLabel: "ميزة جديدة",  // ← add here
    },
  },
  en: {
    // ...
    startProject: {
      // existing keys...
      newFeatureLabel: "New Feature",  // ← and here
    },
  },
};
```

**Step 3**: Use in the component:
```typescript
const { t } = useLang();
<p>{t.startProject.newFeatureLabel}</p>
```

TypeScript will catch if you add the key to one language but not the other, because the type `T = (typeof translations)[Lang]` is derived from the shape of both objects.

---

## Schema Changes: Drizzle Push

When you need to add a column, modify a type, or add a table:

**Step 1**: Edit `db/schema.ts`:
```typescript
export const leads = pgTable("leads", {
  // existing columns...
  newField: varchar("new_field", { length: 200 }),  // ← add here
});
```

**Step 2**: Push to the database:
```bash
npx drizzle-kit push
```

Drizzle Kit will show you the diff and prompt for confirmation before applying destructive changes (drops). Column additions are non-destructive and apply immediately.

**Step 3**: If the new field is set by `submitInquiry`, update the action:
```typescript
await db.insert(leads).values({
  // existing...
  newField: formData.newField || null,
});
```

**Step 4**: If the new field should appear in the admin dashboard, update `app/admin/page.tsx`.

**Note**: No migration files are generated. The change is applied directly. There is no rollback mechanism — if you need to revert, manually edit the schema and push again.

---

## Domain Redirect Configuration

The redirect from `webistrydev.vercel.app` → `www.webistrydev.com` is configured in `next.config.ts`:

```typescript
async redirects() {
  return [{
    source: "/:path*",
    has: [{ type: "host", value: "webistrydev.vercel.app" }],
    destination: "https://webistrydev.com/:path*",
    permanent: true,  // 308 permanent redirect
  }];
}
```

To add another redirect (e.g., `http://webistrydev.com` → `https://www.webistrydev.com`), add another object to the array. The `has` condition ensures redirects are specific — the `/:path*` source would otherwise match all requests.

The `permanent: true` flag issues a 308 Permanent Redirect. Browsers cache this aggressively. If you change the redirect destination, users may need to clear their browser cache.

---

## Available npm Scripts

```json
"scripts": {
  "dev":   "next dev",    // Start development server on :3000
  "build": "next build",  // Production build
  "start": "next start",  // Serve production build on :3000
  "lint":  "eslint"       // Run ESLint
}
```

---

## Common Maintenance Tasks

### Check which leads have voice notes
```sql
-- Run in Neon console or via drizzle query
SELECT id, name, phone, created_at
FROM leads
WHERE voice_note IS NOT NULL
ORDER BY created_at DESC;
```

### Check total message count
```sql
SELECT l.name, COUNT(m.id) as message_count
FROM leads l
LEFT JOIN messages m ON m.lead_id = l.id
GROUP BY l.id, l.name
ORDER BY message_count DESC;
```

### Restart PM2 after a config change
```bash
pm2 restart webistrydev --update-env
```

The `--update-env` flag re-reads environment variables, useful if `DATABASE_URL` changed.
