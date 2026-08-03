# Database Blueprint

Starter schemas and configurations for common project types.

---

## Blueprint A: Ecommerce (Prisma + Neon)

### `prisma/schema.prisma`

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Enums ───────────────────────────────────────
enum Role           { USER STAFF OWNER }
enum OrderStatus    { PENDING CONFIRMED PROCESSING SHIPPED DELIVERED CANCELLED }
enum PaymentMethod  { VODAFONE_CASH INSTAPAY COD }
enum PaymentStatus  { PENDING PAID FAILED REFUNDED }
enum OrderSource    { ONLINE POS }

// ─── Users ───────────────────────────────────────
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String
  name      String
  phone     String?
  role      Role      @default(USER)
  createdAt DateTime  @default(now())
  orders    Order[]
  cart      CartItem[]
  wishlist  Wishlist[]
}

// ─── Categories ──────────────────────────────────
model Category {
  id        String     @id @default(cuid())
  name      String
  nameAr    String?
  slug      String     @unique
  image     String?
  parentId  String?
  parent    Category?  @relation("CategoryChildren", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryChildren")
  sortOrder Int        @default(0)
  active    Boolean    @default(true)
  products  Product[]
}

// ─── Products ─────────────────────────────────────
model Product {
  id           String      @id @default(cuid())
  name         String
  nameAr       String?
  slug         String      @unique
  description  String?
  price        Float
  comparePrice Float?
  images       String[]    @default([])
  categoryId   String?
  category     Category?   @relation(fields: [categoryId], references: [id])
  active       Boolean     @default(true)
  featured     Boolean     @default(false)
  stock        Int         @default(0)
  sortOrder    Int         @default(0)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  orderItems   OrderItem[]
  cartItems    CartItem[]
  wishlist     Wishlist[]
}

// ─── Cart (server-side) ──────────────────────────
model CartItem {
  id        String   @id @default(cuid())
  userId    String
  productId String
  quantity  Int      @default(1)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, productId])
}

// ─── Wishlist ────────────────────────────────────
model Wishlist {
  id        String  @id @default(cuid())
  userId    String
  productId String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
}

// ─── Orders ──────────────────────────────────────
model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique
  userId          String?
  user            User?         @relation(fields: [userId], references: [id])
  customerName    String
  customerEmail   String?
  customerPhone   String
  city            String
  address         String?
  subtotal        Float
  shipping        Float
  total           Float
  status          OrderStatus   @default(PENDING)
  paymentMethod   PaymentMethod
  paymentStatus   PaymentStatus @default(PENDING)
  notes           String?
  source          OrderSource   @default(ONLINE)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  items           OrderItem[]
}

// ─── Order Items (snapshot) ──────────────────────
model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  name      String  // snapshot at purchase time
  price     Float   // snapshot at purchase time
  image     String  // snapshot at purchase time
  quantity  Int
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])
}

// ─── Site Settings (key-value) ───────────────────
model SiteSettings {
  key       String @id
  value     String
}
```

### `prisma/seed.cjs`

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Dresses', nameAr: 'فساتين', slug: 'dresses' },
    { name: 'Tops', nameAr: 'توبات', slug: 'tops' },
    { name: 'Accessories', nameAr: 'إكسسوارات', slug: 'accessories' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: { ...cat, active: true, sortOrder: categories.indexOf(cat) },
    });
  }

  // Default site settings
  await prisma.siteSettings.upsert({
    where: { key: 'store_name' },
    update: {},
    create: { key: 'store_name', value: 'My Store' },
  });

  console.log('Seed complete');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
```

### `src/lib/prisma.ts`

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function make() {
  return new PrismaClient({
    adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })),
  });
}

export const prisma = globalForPrisma.prisma ?? make();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

## Blueprint B: Portfolio/Lead-Gen (Drizzle + Neon)

### `db/schema.ts`

```typescript
import {
  pgTable, serial, text, integer, timestamp, boolean, varchar,
} from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id:        serial("id").primaryKey(),
  name:      varchar("name", { length: 200 }).notNull(),
  email:     varchar("email", { length: 200 }).notNull(),
  phone:     varchar("phone", { length: 50 }),
  service:   varchar("service", { length: 100 }),
  budget:    varchar("budget", { length: 50 }),
  message:   text("message"),
  source:    varchar("source", { length: 50 }).default("contact-form"),
  status:    varchar("status", { length: 50 }).default("new"),
  archived:  boolean("archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id:        serial("id").primaryKey(),
  token:     varchar("token", { length: 100 }).notNull(),
  role:      varchar("role", { length: 20 }).notNull(), // 'user' | 'admin'
  body:      text("body").notNull(),
  read:      boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### `db/client.ts`

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### `drizzle.config.ts`

```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
} satisfies Config;
```

---

## Blueprint C: Flat-file JSON (VPS CMS)

### `lib/content.ts`

```typescript
import fs from "fs";
import path from "path";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

export interface SiteContent {
  hero: { title: string; subtitle: string; image: string };
  about: { text: string; image: string };
  collections: Collection[];
  works: WorkItem[];
  contact: { phone: string; email: string; instagram: string };
}

export interface Collection {
  id: string;
  name: string;
  image: string;
  description?: string;
}

export interface WorkItem {
  id: string;
  title: string;
  category: string;
  image: string;
}

const CONTENT_FILE = path.join(DATA_DIR, "content.json");

export function readContent(): SiteContent {
  const raw = fs.readFileSync(CONTENT_FILE, "utf8");
  return JSON.parse(raw);
}

export function writeContent(data: SiteContent): void {
  const tmp = CONTENT_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, CONTENT_FILE);
}
```

### Initial `data/content.json`

```json
{
  "hero": { "title": "Site Name", "subtitle": "Tagline here", "image": "" },
  "about": { "text": "About text", "image": "" },
  "collections": [],
  "works": [],
  "contact": { "phone": "", "email": "", "instagram": "" }
}
```
