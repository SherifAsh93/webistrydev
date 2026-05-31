# Webistrydev Portfolio — Database Guide

## Database Provider

**Neon** — Serverless PostgreSQL  
**ORM:** Drizzle ORM v0.45.1  
**Driver:** `@neondatabase/serverless` (HTTP-based, no persistent TCP connection)

The database stores only one thing: project inquiry leads submitted via the contact form.

---

## Schema Overview

Single table: `leads`

---

## Tables

### `leads`

Stores every form submission from the "Start a Project" form.

```typescript
// db/schema.ts
export const leads = pgTable("leads", {
  id:          serial("id").primaryKey(),
  name:        varchar("name", { length: 100 }).notNull(),
  email:       varchar("email", { length: 255 }),     // nullable
  phone:       varchar("phone", { length: 30 }),      // nullable
  projectType: varchar("project_type", { length: 50 }).notNull(),
  reference:   varchar("reference", { length: 100 }), // nullable (project ID from portfolio)
  budget:      varchar("budget", { length: 100 }),    // nullable
  message:     text("message").notNull(),
  createdAt:   timestamp("created_at").defaultNow(),
});
```

**Field notes:**
- `id` — Auto-incrementing integer primary key
- `name` — Required full name
- `email` or `phone` — At least one is required (validated in the form, not in DB)
- `projectType` — One of: `ecommerce`, `website`, `web-app`, `system`, `landing`, `other`
- `reference` — ID from the `projects` array in `lib/data.ts` (e.g., `ahmed-elakad`)
- `budget` — One of 6 predefined EGP/USD ranges (stored as a string label)
- `message` — The client's project description
- `createdAt` — Automatically set to `NOW()` on insert

---

## Relationships

No foreign keys. Single flat table. No relationships.

---

## Important Queries

All queries use Drizzle ORM:

```typescript
// Insert a new lead (app/actions/submit-inquiry.ts)
await db.insert(leads).values({
  name, email, phone, projectType, reference, budget, message
});

// Get all leads ordered newest first (app/actions/get-leads.ts)
const allLeads = await db
  .select()
  .from(leads)
  .orderBy(desc(leads.createdAt));
```

---

## Migration Process

### Push schema (no migration files — development only):
```bash
npx drizzle-kit push
```
This compares `db/schema.ts` against the live Neon database and applies changes directly. **Use only in development.** This can cause data loss on existing tables.

### Generate + run migration (production-safe):
```bash
npx drizzle-kit generate   # Creates migration file in drizzle/
npx drizzle-kit migrate    # Applies pending migrations
```

### View database in browser:
```bash
npx drizzle-kit studio     # Opens Drizzle Studio at localhost:4983
```

### Add a new column example:
1. Edit `db/schema.ts` to add the new column
2. Run `npx drizzle-kit generate` to create a migration
3. Run `npx drizzle-kit migrate` to apply it
4. Update `app/actions/submit-inquiry.ts` to pass the new value
5. Update the admin dashboard in `app/admin/page.tsx` to display it

---

## Backup Considerations

- **Neon free tier** includes automatic backups with 7-day retention
- The `leads` table is the only data that matters — it's all business-critical contact info
- Export all leads as CSV from Neon dashboard → Branches → your branch → Tables → Export

**Manual backup via psql:**
```bash
pg_dump "$DATABASE_URL" --table=leads --data-only --format=csv > leads_backup.csv
```

**Important:** Neon free tier databases **pause after 5 minutes of inactivity**. The first request after a pause takes a few seconds to cold-start. This is normal behavior.
