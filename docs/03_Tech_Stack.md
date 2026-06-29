# 03 — Tech Stack

## Runtime Dependencies (`dependencies` in `package.json`)

### Next.js 16.1.0

App Router, React Server Components, Server Actions. This is the core framework. Key choices made within Next.js:

- **App Router** (not Pages Router): enables `"use server"` actions, `async` page components, and nested layouts.
- **No `--port` flag**: `next dev` and `next start` both run on port 3000 (default). PM2 on the VPS starts `next start` directly.
- **Server components by default**: every component that does not have `"use client"` is a server component. Only interactive components are client components.
- **`next/font`**: Google Fonts loaded at build time, zero runtime network request. Variables `--font-plus-jakarta` and `--font-cairo` are injected on `<html>`.

### React 19.2.3

Standard React. No React Query, no Zustand, no Redux. State is local `useState` + shared `useContext` (for language). Server actions are called directly from client components without a data-fetching wrapper library.

### TypeScript 5

Strict mode. All action function signatures, schema types, and component props are typed. `Lang` type (`"en" | "ar"`) propagates from `translations.ts` through `language-context.tsx` to every component.

### Tailwind CSS v4

Configured via `@tailwindcss/postcss` plugin in `postcss.config.mjs`. The `@theme` block in `globals.css` defines the entire design token set. Tailwind v4 reads CSS variables directly — there is no separate `tailwind.config.js` file.

### Framer Motion 12.40.0

Used for all entrance animations and the hero rotating words. Specifically:

- `AnimatePresence` + `mode="wait"` for the rotating words in Hero and state transitions in StartProject.
- `motion.div` with `whileInView` and `viewport={{ once: true, margin: "-80px" }}` for scroll-triggered section animations.
- `variants` with `staggerChildren` for multi-item stagger (Portfolio cards, etc.).
- No Framer Motion is used for CSS-animatable things like the marquee or aurora blobs (those use `@keyframes` in `globals.css`).

### lucide-react 0.562.0

Icon library. Used throughout: `Mic`, `Square`, `RotateCcw`, `Send`, `Play`, `Pause`, `CheckCircle2` in StartProject; `LogOut`, `RefreshCw`, `MessageSquare`, `Phone`, `Mail`, `Trash2`, `Bell`, `Link2`, `MessageCircle`, `Archive`, `CheckCircle`, `Tag`, `DollarSign`, `Calendar` in Admin. Icons are tree-shaken — only imported icons are bundled.

### @neondatabase/serverless 1.0.2

Neon's HTTP driver. The `neon()` function creates an HTTP-based SQL executor. Unlike a standard pg client, it does not hold a persistent TCP connection — each query is an independent HTTPS request to Neon's endpoint. This is the right choice for serverless/edge environments where connections cannot be reused across invocations.

```typescript
// db/index.ts
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### drizzle-orm 0.45.1

ORM layer. Uses `drizzle-orm/neon-http` adapter, which accepts the `neon()` executor. Provides:

- `pgTable()`, `serial()`, `varchar()`, `text()`, `integer()`, `timestamp()` for schema definitions
- `eq()`, `desc()`, `asc()` query builders
- `db.select()`, `db.insert()`, `db.update()`, `db.delete()` fluent query API

---

## Dev Dependencies

### drizzle-kit 0.31.8

CLI tool for schema management. Only command used: `npx drizzle-kit push`, which introspects `db/schema.ts` and applies differences directly to the Neon database without generating migration files. Configuration in `drizzle.config.ts`.

### @tailwindcss/postcss v4

PostCSS plugin that processes Tailwind v4. Configured in `postcss.config.mjs`. No `tailwind.config.js` file exists because all configuration lives in `globals.css` via the `@theme` block.

### eslint 9 + eslint-config-next 16.1.0

Standard linting. `eslint.config.mjs` uses flat config format (ESLint 9+).

---

## Why No i18n Library

The project uses a hand-written React Context instead of a library like `next-intl`, `react-i18next`, or `next-i18next`.

Reasons:
1. **Only two languages**: Arabic and English. Library overhead (message catalogs, plural rules, number formatting, date formatting) is not needed.
2. **No URL-based locale**: The language is stored in `localStorage` and applied via DOM attributes. There are no `/ar/` or `/en/` URL prefixes to manage.
3. **Static content**: All translatable strings are defined at build time in a single `translations.ts` file. There is no CMS, no remote message catalog, no dynamic interpolation beyond a single `.replace("{name}", name)` call.
4. **Total control**: The detection logic (localStorage → browser lang → default) is specific to this project's UX requirements and is four lines of code.

---

## Why No Auth Library

The admin at `/admin` uses `sessionStorage` to persist the password string, checked against the hardcoded constant `ADMIN_PW = "114891"`:

```typescript
// On mount:
if (sessionStorage.getItem("wc-admin") === ADMIN_PW) { setAuthed(true); load(); }

// On successful login:
sessionStorage.setItem("wc-admin", ADMIN_PW);
```

This is **intentional** for this use case:

1. **Single user**: There is exactly one admin (Sherif). No roles, no multi-user access.
2. **Not a public admin**: The `/admin` route is not linked anywhere on the site. Access requires knowing the URL and the password.
3. **No library needed**: NextAuth, Clerk, etc. solve multi-user authentication with sessions, JWTs, refresh tokens, and provider callbacks. All of that complexity is unnecessary here.
4. **Acceptable risk profile**: Leads contain name, phone number, and chat messages — not payment data or personally sensitive medical records. The dashboard is for Sherif's personal workflow.

Note: The password check is entirely client-side. An attacker who can read JavaScript bundles could find the password string. This is a known trade-off.

---

## Configuration Files

### `drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://neondb_owner:...@ep-steep-resonance-...-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require",
  },
});
```

The `out: "./drizzle"` directory stores generated SQL artifacts from `drizzle-kit generate`. It is not used in production — only `push` is used, which skips migration files.

### `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  async redirects() {
    return [{
      source: "/:path*",
      has: [{ type: "host", value: "webistrydev.vercel.app" }],
      destination: "https://webistrydev.com/:path*",
      permanent: true,
    }];
  },
};
```

Redirects traffic coming from the old Vercel deployment URL to the canonical domain. The `has` condition ensures the redirect only fires when `Host: webistrydev.vercel.app` — it has no effect on normal traffic.

### `postcss.config.mjs`

Standard Tailwind v4 PostCSS config:

```javascript
export default {
  plugins: { "@tailwindcss/postcss": {} }
};
```

### `tsconfig.json`

Includes path alias `@/*` → `./*` (root), enabling imports like `@/db`, `@/lib/translations`, `@/components/Logo`.

---

## Environment Variables

Only one environment variable is required:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string (pooled endpoint, `?sslmode=require`) |

Set in `.env.local` for development. Set in the VPS PM2 ecosystem or shell environment for production. There is no `.env.example` file — the only required variable is `DATABASE_URL`.
