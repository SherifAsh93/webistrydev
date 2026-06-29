# 07 — Database

## Connection

**Provider**: Neon PostgreSQL (serverless, hosted on AWS us-east-1)
**Driver**: `@neondatabase/serverless` — HTTP-based, no persistent TCP connection
**ORM**: Drizzle ORM with `neon-http` adapter

```typescript
// db/index.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

`db` is the single exported instance used by all server actions. It is imported as `import { db } from "@/db"`.

The `{ schema }` option passed to `drizzle()` enables relational query helpers (though they are not currently used — all queries use the explicit builder API).

---

## Schema

Defined in `db/schema.ts` using Drizzle's `pgTable` builders.

### `leads` Table

```typescript
export const leads = pgTable("leads", {
  id:          serial("id").primaryKey(),
  name:        varchar("name", { length: 100 }).notNull(),
  email:       varchar("email", { length: 255 }),
  phone:       varchar("phone", { length: 30 }),
  projectType: varchar("project_type", { length: 50 }),
  reference:   varchar("reference", { length: 100 }),
  budget:      varchar("budget", { length: 100 }),
  message:     text("message"),
  voiceNote:   text("voice_note"),
  chatToken:   varchar("chat_token", { length: 64 }).unique(),
  createdAt:   timestamp("created_at").defaultNow(),
  status:      varchar("status", { length: 20 }).notNull().default("new"),
});
```

| Column | DB Name | Type | Constraints | Notes |
|--------|---------|------|-------------|-------|
| `id` | `id` | serial | PRIMARY KEY | Auto-incrementing integer |
| `name` | `name` | varchar(100) | NOT NULL | Required — only mandatory field |
| `email` | `email` | varchar(255) | nullable | Legacy — not collected by current form |
| `phone` | `phone` | varchar(30) | nullable | Collected by current StartProject form |
| `projectType` | `project_type` | varchar(50) | nullable | Legacy — not collected by current form |
| `reference` | `reference` | varchar(100) | nullable | Legacy — not collected by current form |
| `budget` | `budget` | varchar(100) | nullable | Legacy — not collected by current form |
| `message` | `message` | text | nullable | Text message from StartProject |
| `voiceNote` | `voice_note` | text | nullable | Base64 data URL of recorded audio |
| `chatToken` | `chat_token` | varchar(64) | UNIQUE, nullable | UUID v4, generated on insert |
| `createdAt` | `created_at` | timestamp | DEFAULT NOW() | Auto-set by Postgres |
| `status` | `status` | varchar(20) | NOT NULL, DEFAULT 'new' | Values: 'new' | 'contacted' | 'archived' |

### `messages` Table

```typescript
export const messages = pgTable("messages", {
  id:        serial("id").primaryKey(),
  leadId:    integer("lead_id")
               .references(() => leads.id, { onDelete: "cascade" })
               .notNull(),
  sender:    varchar("sender", { length: 10 }).notNull(),
  body:      text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

| Column | DB Name | Type | Constraints | Notes |
|--------|---------|------|-------------|-------|
| `id` | `id` | serial | PRIMARY KEY | Auto-incrementing integer |
| `leadId` | `lead_id` | integer | NOT NULL, FK → leads.id | Foreign key with cascade delete |
| `sender` | `sender` | varchar(10) | NOT NULL | Values: 'client' \| 'admin' |
| `body` | `body` | text | NOT NULL | Message content |
| `createdAt` | `created_at` | timestamp | DEFAULT NOW() | Auto-set by Postgres |

---

## Foreign Key and Cascade

```typescript
.references(() => leads.id, { onDelete: "cascade" })
```

This creates a `FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE` constraint in Postgres. When a lead is deleted (via `deleteLead(id)` server action), all messages with that `lead_id` are automatically deleted by the database engine. No application-level cleanup is needed.

---

## Legacy Fields (Still in Schema)

The `leads` table contains fields that the current `StartProject.tsx` form does not collect:

| Field | Why It Still Exists |
|-------|---------------------|
| `email` | Collected by the original `ContactForm.tsx` (now unused). Old database records may have values here. Kept to avoid breaking existing data. |
| `projectType` | Same as above — was a dropdown in the original form. |
| `reference` | Was a "how did you find us?" field. |
| `budget` | Was a budget range selector. |

The admin dashboard still renders these fields if they have values (the expanded lead card shows Budget and Reference sections conditionally). They should not be removed from the schema until old data is confirmed gone or migrated.

**The current `submitInquiry` action does not set these fields:**
```typescript
await db.insert(leads).values({
  name: formData.name,
  phone: formData.phone || null,
  message: formData.message || null,
  voiceNote: formData.voiceNote || null,
  chatToken,
  // email, projectType, reference, budget — NOT included
});
```

---

## Drizzle Config

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://neondb_owner:...@ep-steep-resonance-ahctbjr8-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require",
  },
});
```

- `schema`: path to the schema file that Drizzle Kit introspects
- `out`: directory where migration SQL files would be generated (by `drizzle-kit generate`). Not actively used — only `push` is used.
- `dialect`: must be `"postgresql"` for Neon
- `dbCredentials.url`: the **pooled** Neon connection string. The pooler endpoint (`-pooler.` in the hostname) uses PgBouncer for connection pooling, which is appropriate for serverless environments.

---

## Schema Management: `drizzle-kit push`

This project uses `drizzle-kit push` rather than `drizzle-kit generate` + `drizzle-kit migrate`:

```bash
npx drizzle-kit push
```

What this does:
1. Reads `db/schema.ts`
2. Introspects the live Neon database schema
3. Computes the diff
4. Applies changes directly to the database

No migration files are created. No migration history is maintained. This is the appropriate workflow for:
- A solo developer with a single environment
- Infrequent schema changes
- Cases where migration rollback is not a business requirement

**Warning**: `drizzle-kit push` will prompt before making destructive changes (column drops, table drops). Always review the diff before confirming.

---

## Drizzle vs Prisma: Concrete Comparison for This Project

| Concern | Drizzle (used here) | Prisma (used in Montelle, Zahrtelhlig) |
|---------|--------------------|-----------------------------------------|
| Neon HTTP driver | First-class `neon-http` adapter | Requires Prisma Accelerate or custom setup |
| Query syntax | `db.select().from(leads).where(eq(...))` | `prisma.leads.findMany({ where: { ... } })` |
| Migration files | Optional — `push` skips them | Required for production workflows |
| Schema file | TypeScript in `db/schema.ts` | Prisma Schema Language in `schema.prisma` |
| Type generation | Types inferred from schema at compile time | Types generated by `prisma generate` |
| Bundle size | Smaller | Larger (includes Prisma Client binary) |
| SQL visibility | Explicit (query shape is clear from code) | Abstracted (need to know Prisma's translation) |

For this project, Drizzle is the better fit because the Neon HTTP driver alignment and the absence of migration management needs outweigh any Prisma convenience features.

---

## Neon Serverless HTTP vs Pooled TCP

Neon offers two connection modes:

1. **HTTP (used here)**: Each query is an HTTPS POST to Neon's API. No persistent connection. Used via `@neondatabase/serverless`'s `neon()` function.
2. **Pooled TCP**: Standard PostgreSQL connection through PgBouncer. Used by traditional Node.js apps with `pg` or `postgres` libraries.

For Next.js App Router + Server Actions:
- Server actions may run in serverless edge environments or short-lived Node.js processes.
- HTTP mode requires no connection handshake — each query is independent.
- This means slightly higher per-query overhead but no "too many connections" errors from connection pool exhaustion.

The `drizzle.config.ts` uses the pooler URL (which uses PgBouncer) for `drizzle-kit push` operations, which is standard practice. The runtime `db/index.ts` uses `DATABASE_URL` from environment, which should also point to the pooler endpoint.
