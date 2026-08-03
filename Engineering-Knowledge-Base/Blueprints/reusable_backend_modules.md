# Reusable Backend Modules

Copy-paste server-side utilities used across projects.

---

## Zustand Cart Store

```typescript
// src/store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  slug: string;
  variantLabel?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (item) => {
        const existing = get().items.find(i => i.id === item.id);
        if (existing) {
          set({ items: get().items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i), isOpen: true });
        } else {
          set({ items: [...get().items, { ...item, quantity: item.quantity ?? 1 }], isOpen: true });
        }
      },
      removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),
      updateQty: (id, qty) => {
        if (qty <= 0) { set({ items: get().items.filter(i => i.id !== id) }); return; }
        set({ items: get().items.map(i => i.id === id ? { ...i, quantity: qty } : i) });
      },
      clearCart: () => set({ items: [] }),
      get total() { return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0); },
    }),
    { name: "cart-storage", skipHydration: true }
  )
);
```

```typescript
// src/components/StoreHydration.tsx
"use client";
import { useEffect } from "react";
import { useCart } from "@/store/cartStore";

export default function StoreHydration() {
  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);
  return null;
}
```

---

## GitHub CDN Upload

```typescript
// src/lib/upload.ts
export async function uploadToGitHub(
  file: File,
  folder = "images/products"
): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const token = process.env.GITHUB_TOKEN!;
  const repo = process.env.GITHUB_REPO!;
  const path = `public/${folder}/${filename}`;

  const res = await fetch(
    `https://api.github.com/repos/SherifAsh93/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Upload ${filename}`,
        content: base64,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub upload failed: ${err}`);
  }

  return `https://cdn.jsdelivr.net/gh/SherifAsh93/${repo}@main/${folder}/${filename}`;
}
```

---

## Prisma Singleton

```typescript
// src/lib/prisma.ts
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

## Atomic File Write (Flat-file CMS)

```typescript
// src/lib/atomicWrite.ts
import fs from "fs";

export function atomicWrite(filePath: string, data: unknown): void {
  const tmp = filePath + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, filePath);
}
```

---

## In-Memory Cache with TTL

```typescript
// src/lib/cache.ts
const cache = new Map<string, { data: unknown; expires: number }>();

export function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) { cache.delete(key); return null; }
  return entry.data as T;
}

export function setCache(key: string, data: unknown, ttlMs = 60_000): void {
  cache.set(key, { data, expires: Date.now() + ttlMs });
}

export function invalidateCache(key: string): void {
  cache.delete(key);
}
```

Usage:
```typescript
// In an API route
let data = getFromCache<Product[]>("products");
if (!data) {
  data = await prisma.product.findMany();
  setCache("products", data, 60_000);  // 1 minute
}
return Response.json({ data });
```

---

## Order Number Generator

```typescript
// Timestamp-based (sortable)
export function generateOrderNumber(prefix = "ORD"): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

// Sequential-style (short)
export function generateShortOrderNumber(prefix = "MT"): string {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${rand}`;
}
```

---

## Shipping Calculator

```typescript
// src/lib/utils.ts
export const FREE_SHIPPING_THRESHOLD = 800;
export const STANDARD_SHIPPING = 60;

export function calcShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
}

export function formatPrice(amount: number, locale = "ar-EG"): string {
  return `${amount.toLocaleString(locale)} ج.م`;
}

export function formatDate(date: Date | string, locale = "ar-EG"): string {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric", month: "long", day: "numeric",
  });
}
```

---

## Server Action Result Pattern

```typescript
// Pattern for server actions that return errors (no redirect)
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Usage in action
export async function submitForm(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const email = formData.get("email") as string;
  if (!email) return { success: false, error: "Email is required" };
  try {
    const record = await prisma.lead.create({ data: { email } });
    return { success: true, data: { id: record.id.toString() } };
  } catch {
    return { success: false, error: "Failed to submit. Please try again." };
  }
}

// Usage in component
const result = await submitForm(formData);
if (!result.success) {
  setError(result.error);
  return;
}
// success — redirect or show confirmation
```

---

## Egyptian Cities List

```typescript
// src/lib/cities.ts
export const EGYPTIAN_CITIES = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "الشرقية",
  "الدقهلية",
  "البحيرة",
  "المنوفية",
  "الغربية",
  "القليوبية",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "الفيوم",
  "بني سويف",
  "قنا",
  "الأقصر",
  "أسوان",
  "الإسماعيلية",
  "السويس",
  "بورسعيد",
  "كفر الشيخ",
  "دمياط",
  "شمال سيناء",
  "جنوب سيناء",
  "البحر الأحمر",
  "مطروح",
  "الوادي الجديد",
] as const;

export type EgyptianCity = (typeof EGYPTIAN_CITIES)[number];
```

---

## WhatsApp Order Link Builder

```typescript
// src/lib/whatsapp.ts
export function buildWhatsAppOrderLink(order: {
  orderNumber: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  city: string;
  phone: string;
}): string {
  const STORE_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "201000000000";

  const itemsList = order.items
    .map(i => `- ${i.name} × ${i.quantity} = ${(i.price * i.quantity).toLocaleString("ar-EG")} ج.م`)
    .join("\n");

  const message = `طلب جديد #${order.orderNumber}
الاسم: ${order.customerName}
المدينة: ${order.city}
الهاتف: ${order.phone}

المنتجات:
${itemsList}

الإجمالي: ${order.total.toLocaleString("ar-EG")} ج.م`;

  return `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
```
