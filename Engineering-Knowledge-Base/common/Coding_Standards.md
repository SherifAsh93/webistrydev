# Coding Standards

Extracted from 5 production projects. These are not aspirational guidelines — they are observed patterns applied consistently.

---

## File Naming

| Type | Convention | Examples |
|------|-----------|---------|
| React components | PascalCase | `ProductCard.tsx`, `CartDrawer.tsx`, `AdminSidebar.tsx` |
| Pages | lowercase `page.tsx` | `app/admin/products/page.tsx` |
| Layouts | lowercase `layout.tsx` | `app/(store)/layout.tsx` |
| API routes | lowercase `route.ts` | `app/api/products/route.ts` |
| Utilities | camelCase | `prisma.ts`, `session.ts`, `utils.ts` |
| Store files | camelCase | `cartStore.ts`, `wishlistStore.ts` |
| Type files | camelCase | `index.ts` (inside `types/`) |
| Config files | camelCase | `drizzle.config.ts`, `prisma.config.ts` |
| CSS | `globals.css` | Always this name, always at root of `app/` |

---

## Component Patterns

### Server Component (default)
```typescript
// No directive needed
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/store/ProductCard";

export default async function ShopPage() {
  const products = await prisma.product.findMany({ where: { active: true } });
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

### Client Component
```typescript
"use client";
import { useState } from "react";
import { useCart } from "@/store/cart";

interface Props {
  product: Product;
}

export default function AddToCartButton({ product }: Props) {
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();
  return (
    <button onClick={() => addItem(product)} disabled={loading}>
      Add to Bag
    </button>
  );
}
```

### Component Hierarchy
- `components/ui/` → stateless, no business logic, no API calls
- `components/layout/` → site chrome, uses data from parent via props
- `components/store/` → customer features, may use Zustand
- `components/admin/` → admin features, client-side, may fetch directly

---

## TypeScript Patterns

### Interfaces (always over `type` for object shapes)
```typescript
// Good — extensible, IDE-friendly
interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  active: boolean;
  createdAt: Date;
}

// Bad — use only for unions
type ProductId = string;  // OK for aliases
type Status = 'active' | 'inactive';  // OK for unions
```

### Optional Properties
```typescript
// Use ? for any field that might not be present
interface SiteContent {
  hero?: HeroSection;
  about?: AboutSection;
  contact?: ContactSection;
}
// Always provide fallback when consuming: content.hero?.title ?? 'Default Title'
```

### Enums → String Literals
```typescript
// Good — no runtime overhead, clear in DB/JSON
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
type UserRole = 'USER' | 'STAFF' | 'OWNER' | 'ADMIN';

// In Prisma — use Prisma enum (maps to above)
enum OrderStatus { PENDING CONFIRMED PROCESSING SHIPPED DELIVERED CANCELLED }
```

### Record Types
```typescript
// For dynamic key objects
type YearCollections = Record<string, Collection[]>;
// Usage: content.bridal.years['2025']

type SizeStock = Record<string, number>;
// Usage: product.sizeStock['M'] === 8
```

### Partial for Updates
```typescript
type ProductUpdate = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>;
```

### Function Return Types
Always annotate server action return types:
```typescript
export async function createProduct(data: ProductCreate): Promise<{ error?: string; product?: Product }> {
  if (!data.name) return { error: 'Name required' };
  const product = await prisma.product.create({ data });
  return { product };
}
```

---

## Import Order

```typescript
// 1. Next.js built-ins
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// 2. React
import { useState, useEffect, useRef, useMemo, useCallback } from "react";

// 3. Third-party libraries
import { jwtVerify, SignJWT } from "jose";
import { create } from "zustand";
import { motion } from "framer-motion";

// 4. Internal — absolute paths via @/ alias
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

// 5. Types
import type { Product, Order } from "@/types";
```

---

## API Route Patterns

### Standard Route Handler
```typescript
// app/api/products/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '20');
  
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return Response.json({ products });
  } catch {
    return Response.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const body = await req.json();
  if (!body.name || !body.price) {
    return Response.json({ error: 'Name and price are required' }, { status: 400 });
  }
  
  const product = await prisma.product.create({ data: body });
  return Response.json(product, { status: 201 });
}
```

### Parameterized Route Handler
```typescript
// app/api/products/[id]/route.ts
interface RouteContext { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const body = await req.json();
  const product = await prisma.product.update({ where: { id }, data: body });
  return Response.json(product);
}
```

---

## Server Action Patterns

```typescript
// app/actions/orders.ts
"use server";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function createOrder(formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/login?redirect=/checkout');
  
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  
  if (!name || !phone) return { error: 'Name and phone are required' };
  
  const order = await prisma.order.create({
    data: {
      customerName: name,
      customerPhone: phone,
      // ... other fields
    }
  });
  
  redirect(`/orders/${order.id}?success=true`);
}
```

---

## Prisma Patterns

### Singleton Client
```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Common Query Patterns
```typescript
// List with pagination and filters
const products = await prisma.product.findMany({
  where: {
    active: true,
    categoryId: categoryId || undefined,
    name: search ? { contains: search, mode: 'insensitive' } : undefined,
  },
  include: { category: true },
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * limit,
  take: limit,
});

// Create with nested relations (Order + OrderItems in one transaction)
const order = await prisma.order.create({
  data: {
    ...orderData,
    items: {
      createMany: {
        data: items.map(i => ({
          productId: i.productId,
          name: i.name,      // snapshot
          price: i.price,    // snapshot
          quantity: i.quantity,
        })),
      },
    },
  },
  include: { items: true },
});

// Upsert (used for SiteSettings)
await prisma.siteSettings.upsert({
  where: { key: 'homepage_config' },
  update: { value: JSON.stringify(config) },
  create: { key: 'homepage_config', value: JSON.stringify(config) },
});
```

---

## Drizzle Patterns (webistrydev)

```typescript
// db/schema.ts
import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  chatToken: varchar('chat_token', { length: 64 }).unique(),
  status: varchar('status', { length: 20 }).default('new').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// db/index.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
export const db = drizzle(neon(process.env.DATABASE_URL!));

// Query patterns
import { eq, desc, asc } from "drizzle-orm";
const allLeads = await db.select().from(leads).orderBy(desc(leads.createdAt));
const lead = await db.select().from(leads).where(eq(leads.chatToken, token));
await db.update(leads).set({ status: 'contacted' }).where(eq(leads.id, id));
await db.delete(leads).where(eq(leads.id, id));
```

---

## Styling Conventions

### Class Order (Tailwind)
```
layout → position → display → sizing → spacing → typography → color → border → effect → responsive → state
```
Example: `relative flex h-full w-full flex-col gap-4 p-6 text-sm text-gray-900 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow md:flex-row md:gap-8`

### Responsive Pattern (mobile-first)
```typescript
// Always mobile first, scale up
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
className="text-[11px] sm:text-[13px] md:text-[16px]"
className="px-4 sm:px-8 md:px-16 lg:px-20"
```

### Component Variants (no library — plain objects)
```typescript
const variants = {
  primary: 'bg-dark-900 text-white hover:bg-dark-800',
  outline: 'border border-dark-900 text-dark-900 hover:bg-dark-900 hover:text-white',
  ghost: 'text-dark-900 hover:bg-gray-100',
} as const;

type Variant = keyof typeof variants;
```

---

## Comments Policy

**Write no comments unless the WHY is non-obvious.**

Write a comment for:
- Non-obvious constraints: `// Must use readFileSync — async read causes race condition in PM2 single-instance`
- Workarounds for bugs: `// Tailwind v4: unlayered CSS overrides @layer utilities — never add bare resets`
- Surprising behavior: `// convertSRGBToLinear required after .set() for correct PBR color rendering`

Do NOT write:
- What the code does (names explain it)
- TODO comments in committed code
- JSDoc for simple functions

---

## Error Handling Hierarchy

```
1. Validation (catch before DB): if (!name) return { error: 'Required' }
2. Auth check (before any work): if (!session) return 401
3. DB operation (in try/catch): try { await prisma... } catch { return 500 }
4. Client display: setError(data.error || 'Something went wrong')
```

Never let uncaught exceptions propagate to the user. Always return a structured error object.

---

## TypeScript Configuration (`tsconfig.json`)

Standard config used across all projects. Generated by `create-next-app` — do not deviate.

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**If the project has no `src/` directory** (webistrydev pattern), change the path alias:
```json
"paths": { "@/*": ["./*"] }
```

**`strict: true` is non-negotiable.** It enables: `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`. Never disable it.

---

## ESLint Configuration (`eslint.config.mjs`)

Next.js 16 generates a flat config by default:

```javascript
// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
```

Do not add plugins or rules beyond this baseline. ESLint in these projects is a safety net, not a style enforcer (Tailwind handles styling).
