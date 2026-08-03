# Database Standards

Two ORM strategies across the portfolio: Prisma (Montelle, zahrtelkhlig) and Drizzle (webistrydev). One flat-file strategy (Ahmed-Elakad). All PostgreSQL on Neon (serverless) for DB projects.

---

## When to Use Which Approach

| Situation | Choice | Reason |
|-----------|--------|--------|
| Ecommerce with complex relations | Prisma | Type-safe relations, migrations, nested creates |
| Simple CRUD (≤5 tables) | Drizzle | Lightweight, explicit SQL, less config |
| VPS-hosted, no DB needed | Flat-file JSON | Simple, no infrastructure, atomic writes |
| Complex multi-role with lots of queries | Prisma | Easier relation loading, better DX |

---

## Prisma Standards

### Schema Conventions

```prisma
// Field naming: camelCase
// Model naming: PascalCase
// Enum values: SCREAMING_SNAKE_CASE

generator client {
  provider        = "prisma-client-js"
  output          = "../src/generated/prisma"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### ID Strategy: CUID (always)
```prisma
id String @id @default(cuid())
```
Why CUID over UUID: shorter, URL-safe, time-sortable. Over serial: distributed-safe, no info leakage.

### Timestamps: Always Both
```prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

### Soft Deletes: NOT Used
Current projects use hard deletes. `OrderItem` snapshots protect history even when products are deleted.

### Enum Pattern
```prisma
enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
```
Prisma enums map to PostgreSQL native enums. Fast index-able. TypeScript type generated automatically.

### JSON Fields (flexible sub-schemas)
```prisma
model Product {
  variants  Json?   // [{ size: "M", color: "Black", qty: 5 }]
  sizeStock Json?   // { "S": 10, "M": 8, "L": 5 }
}
```
Use JSON when:
- Schema is variable (product variant combinations differ per product)
- Data is always read/written together with parent
- No need to query individual JSON fields via SQL

Do NOT use JSON when:
- You need to query or filter by sub-field (use a separate table)
- Data has many-to-many relations

### Self-Referential (Categories)
```prisma
model Category {
  id       String     @id @default(cuid())
  name     String
  slug     String     @unique
  parentId String?
  parent   Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children Category[] @relation("CategoryHierarchy")
}
```

### Cascade Delete
```prisma
model OrderItem {
  orderId String
  order   Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
}
```
Always cascade-delete child records when parent is deleted (OrderItems from Orders, messages from leads).

---

## Complete Reference Schema (zahrtelkhlig — most complete)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String?  @unique           // STAFF login via username
  password  String                     // bcrypt(cost=12)
  name      String
  phone     String?
  address   String?
  city      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  orders    Order[]
  cartItems CartItem[]
  wishlist  Wishlist[]
}

model Product {
  id            String    @id @default(cuid())
  nameAr        String
  nameEn        String
  descriptionAr String
  descriptionEn String
  sku           String?   @unique
  price         Float
  season        Season    @default(WINTER)
  sizes         String[]  @default([])
  sizeStock     Json?                      // { "S": 10, "M": 8 }
  variants      Json?                      // [{ size, color, qty }]
  stock         Int       @default(0)      // aggregate total
  images        String[]                   // CDN URLs
  featured      Boolean   @default(false)
  active        Boolean   @default(true)
  categoryId    String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  category      Category? @relation(fields: [categoryId], references: [id])
  cartItems     CartItem[]
  orderItems    OrderItem[]
  wishlist      Wishlist[]
}

model Category {
  id        String    @id @default(cuid())
  nameAr    String
  nameEn    String
  slug      String    @unique
  image     String?
  seasonal  Boolean   @default(false)
  sortOrder Int       @default(0)
  products  Product[]
}

model Order {
  id            String        @id @default(cuid())
  orderNumber   String        @unique
  userId        String?
  customerName  String
  customerEmail String?
  customerPhone String
  address       String
  city          String
  notes         String?
  status        OrderStatus   @default(PENDING)
  source        OrderSource   @default(ONLINE)
  paymentMethod PaymentMethod @default(CASH_ON_DELIVERY)
  subtotal      Float
  shipping      Float         @default(0)
  total         Float
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  user          User?         @relation(fields: [userId], references: [id])
  items         OrderItem[]
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  nameAr    String                        // snapshot
  nameEn    String                        // snapshot
  price     Float                         // snapshot
  quantity  Int
  size      String?
  color     String?
  image     String?                       // snapshot
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])
}

model CartItem {
  id        String   @id @default(cuid())
  userId    String
  productId String
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])     // one record per product per user
}

model Wishlist {
  id        String   @id @default(cuid())
  userId    String
  productId String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
}

model Banner {
  id         String   @id @default(cuid())
  titleAr    String
  titleEn    String
  subtitleAr String?
  subtitleEn String?
  image      String
  link       String?
  active     Boolean  @default(true)
  sortOrder  Int      @default(0)
  createdAt  DateTime @default(now())
}

model SiteSettings {
  key   String @id
  value String   // JSON string or plain value
}

enum Role           { USER STAFF OWNER ADMIN }
enum OrderStatus    { PENDING CONFIRMED PROCESSING SHIPPED DELIVERED CANCELLED }
enum OrderSource    { ONLINE POS }
enum Season         { WINTER SUMMER }
enum PaymentMethod  { CASH_ON_DELIVERY VODAFONE_CASH INSTAPAY BANK_TRANSFER }
```

---

## Drizzle Standards (webistrydev)

### Schema Declaration
```typescript
// db/schema.ts
import { pgTable, serial, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const leads = pgTable('leads', {
  id:         serial('id').primaryKey(),
  name:       varchar('name', { length: 100 }).notNull(),
  email:      varchar('email', { length: 255 }),
  phone:      varchar('phone', { length: 30 }),
  message:    text('message'),
  voiceNote:  text('voice_note'),           // base64 data URL
  chatToken:  varchar('chat_token', { length: 64 }).unique(),
  status:     varchar('status', { length: 20 }).default('new').notNull(),
  createdAt:  timestamp('created_at').defaultNow(),
});

export const messages = pgTable('messages', {
  id:        serial('id').primaryKey(),
  leadId:    integer('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  sender:    varchar('sender', { length: 10 }).notNull(),  // 'client' | 'admin'
  body:      text('body').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations (for type inference)
export const leadsRelations = relations(leads, ({ many }) => ({
  messages: many(messages),
}));
export const messagesRelations = relations(messages, ({ one }) => ({
  lead: one(leads, { fields: [messages.leadId], references: [leads.id] }),
}));
```

### Drizzle Config
```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Drizzle vs Prisma Decision

| Factor | Prisma | Drizzle |
|--------|--------|---------|
| Type safety | Auto-generated types | Manual but explicit |
| Relation loading | `.include` built-in | Manual joins or separate queries |
| Bundle size | Larger (generated client) | Smaller |
| Migration files | Yes (folder) | Optional (can push) |
| Raw SQL | Via `$queryRaw` | Via `.execute()` |
| Neon serverless | Via PG adapter | Native HTTP driver |
| Best for | Complex ecommerce | Simple CRUD, small APIs |

---

## Flat-File JSON Database (Ahmed-Elakad)

### File Layout
```
/home/sherif/data/ahmed-elakad/
├── content.json     # All site content (2-4 MB)
├── clients.json     # Client records array
├── messages.json    # Contact submissions array
├── config.json      # { "password": "plaintext" }
├── images/          # 1,700+ media files
└── voices/          # Voice note recordings
```

### Read Pattern
```typescript
// lib/content.ts
import fs from "fs";
const CONTENT_FILE = "/home/sherif/data/ahmed-elakad/content.json";

export function getContent(): SiteContent {
  try {
    return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
  } catch {
    return {};  // return empty if file missing
  }
}
```

### Write Pattern (always atomic)
```typescript
import { atomicWriteJSON } from "./atomicWrite";
export function saveContent(content: SiteContent): void {
  atomicWriteJSON(CONTENT_FILE, content);
}
```

### When Flat-File is Appropriate
- Single server instance (PM2 single process)
- Content rarely changes (CMS-style edits, not transactional)
- No complex querying needed (always full read)
- VPS already available (no Neon cost)
- Data fits in memory (≤ 10MB JSON)

### When to Switch to PostgreSQL
- Multiple server instances (concurrent writes)
- Need query filtering (search, pagination)
- Data exceeds 50MB
- Need transactions or foreign key constraints

---

## Migration Strategy

### Prisma (Vercel projects)
```bash
# Development: push schema without migration files
prisma db push

# Production build: run on every Vercel build
prisma generate && prisma db push --accept-data-loss && node prisma/seed.cjs && next build
```

**WARNING:** `--accept-data-loss` automatically accepts destructive changes (column drops, type changes). Safe for additive migrations, dangerous for breaking changes. Always test locally before deploying.

### Drizzle (webistrydev)
```bash
# Push schema to DB (no migration files)
npx drizzle-kit push

# Generate migration SQL (if needed for review)
npx drizzle-kit generate
```

---

## Seeding Pattern

### Idempotent Seed (Montelle, zahrtelkhlig)
```javascript
// prisma/seed.cjs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Accessories', slug: 'accessories', sortOrder: 1 },
    { name: 'Veils', slug: 'veils', sortOrder: 2, parentSlug: 'accessories' },
    // ...
  ];
  
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, sortOrder: cat.sortOrder },
      create: { name: cat.name, slug: cat.slug, sortOrder: cat.sortOrder },
    });
  }
}

main().finally(() => prisma.$disconnect());
```

This runs on **every build** — must be idempotent (upsert, not insert).
