# Reusable Patterns

Code patterns that appear in multiple projects and can be directly copied to new projects.

---

## Cart Store (Zustand + localStorage)

```typescript
// store/cart.ts
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;         // product ID
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => set(state => {
        const existing = state.items.find(i => i.id === item.id);
        if (existing) {
          return {
            items: state.items.map(i =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
            isOpen: true,
          };
        }
        return { items: [...state.items, { ...item, quantity: 1 }], isOpen: true };
      }),

      removeItem: (id) => set(state => ({
        items: state.items.filter(i => i.id !== id),
      })),

      updateQuantity: (id, qty) => set(state => ({
        items: qty <= 0
          ? state.items.filter(i => i.id !== id)
          : state.items.map(i => i.id === id ? { ...i, quantity: qty } : i),
      })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'cart-storage' }  // localStorage key
  )
);
```

---

## Prisma Singleton

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function makePrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? makePrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

## Jose JWT Session

```typescript
// lib/session.ts
import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export type SessionPayload = {
  userId: string;
  role: string;
  name?: string;
};

export async function createSession(payload: SessionPayload, maxAge = 60 * 60 * 24 * 7) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(maxAge === 28800 ? "8h" : "7d")
    .sign(secret);

  (await cookies()).set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const token = (await cookies()).get("session")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  (await cookies()).delete("session");
}
```

---

## Admin Layout Gate

```typescript
// app/admin/layout.tsx
import { getAdminSession } from "@/lib/session";
import AdminLoginView from "@/components/admin/AdminLoginView";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) return <AdminLoginView />;
  return <>{children}</>;
}
```

---

## Triple-Click Logo → Admin

```typescript
// Inside Navbar component
import { useRouter } from "next/navigation";
import { useRef } from "react";

function LogoWithAdminAccess({ href = "/" }: { href?: string }) {
  const router = useRouter();
  const count = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    count.current++;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { count.current = 0; }, 800);
    if (count.current >= 3) { count.current = 0; router.push("/admin"); return; }
    if (count.current === 1) router.push(href);
  }

  return (
    <a href={href} onClick={handleClick}>
      <Logo />
    </a>
  );
}
```

---

## Announcement Bar (Marquee)

```tsx
// components/layout/AnnouncementBar.tsx
const MESSAGES = [
  "Free shipping on orders over 800 EGP",
  "Handcrafted in Egypt",
  "New collection arriving soon",
];

export default function AnnouncementBar() {
  const doubled = [...MESSAGES, ...MESSAGES];
  return (
    <div className="overflow-hidden bg-dark-900 py-2 text-white text-[11px] tracking-widest">
      <div className="flex animate-marquee whitespace-nowrap will-change-transform">
        {doubled.map((m, i) => <span key={i} className="mx-8">{m}</span>)}
      </div>
    </div>
  );
}
```

```css
/* globals.css */
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.animate-marquee { animation: marquee 25s linear infinite; }
```

---

## Zustand Store Hydration (prevents SSR mismatch)

```typescript
// components/StoreHydration.tsx — mount in root layout
"use client";
import { useEffect } from "react";
import { useCart } from "@/store/cart";

export function StoreHydration() {
  const rehydrate = useCart.persist.rehydrate;
  useEffect(() => { rehydrate(); }, [rehydrate]);
  return null;
}
```

---

## Order Number Generator

```typescript
// lib/utils.ts

// Compact base-36 (Montelle style): MT-J5KR7D-XF2
export function generateOrderNumber(prefix = 'ORD'): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

// Sequential POS style
export function generatePOSNumber(seq: number): string {
  return `POS-${String(seq).padStart(5, '0')}`;
}
```

---

## Shipping Calculator

```typescript
// lib/utils.ts
export const FREE_SHIPPING_THRESHOLD = 800;  // EGP
export const STANDARD_SHIPPING = 60;          // EGP

export function calcShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
}

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('ar-EG')} ج.م`;
}
```

---

## GitHub CDN Upload

```typescript
// lib/github-upload.ts
interface UploadResult { url: string; filename: string; }

export async function uploadToGithubCDN(
  buffer: Buffer,
  ext: string,
  repo: string = process.env.GITHUB_REPO!
): Promise<UploadResult> {
  const filename = `img_${Date.now()}.${ext}`;
  const path = `public/images/products/${filename}`;
  const base64 = buffer.toString('base64');

  const res = await fetch(
    `https://api.github.com/repos/SherifAsh93/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: `Upload ${filename}`, content: base64 }),
    }
  );

  if (!res.ok) throw new Error('GitHub upload failed');

  const url = `https://cdn.jsdelivr.net/gh/SherifAsh93/${repo}@main/${path}`;
  return { url, filename };
}
```

---

## Atomic File Write

```typescript
// lib/atomicWrite.ts
import { writeFileSync, renameSync, unlinkSync } from "fs";

export function atomicWriteJSON(filePath: string, data: unknown): void {
  const tmp = filePath + '.tmp';
  try {
    writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    renameSync(tmp, filePath);
  } catch (e) {
    try { unlinkSync(tmp); } catch {}
    throw e;
  }
}
```

---

## In-Memory Cache with TTL

```typescript
// For expensive operations where 30s staleness is acceptable

let cache: { data: unknown; ts: number } | null = null;
const TTL = 30_000;

export async function getCachedData(force = false) {
  if (!force && cache && Date.now() - cache.ts < TTL) return cache.data;
  const data = await expensiveOperation();
  cache = { data, ts: Date.now() };
  return data;
}
```

---

## Server Action Result Pattern

```typescript
// Always return { error } or { data } — never throw
type ActionResult<T = void> =
  | { error: string }
  | (T extends void ? { success: true } : { data: T });

export async function updateProduct(
  id: string,
  input: ProductUpdate
): Promise<ActionResult<Product>> {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized' };
  if (!input.name) return { error: 'Name is required' };

  try {
    const product = await prisma.product.update({ where: { id }, data: input });
    return { data: product };
  } catch {
    return { error: 'Failed to update product' };
  }
}
```

---

## Bilingual Field Naming (Arabic projects)

```typescript
// Database fields — always both languages
interface BilingualProduct {
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

// Banner with optional subtitle in both
interface BilingualBanner {
  titleAr: string;
  titleEn: string;
  subtitleAr?: string;
  subtitleEn?: string;
}

// Display in component (zahrtelkhlig)
const lang = 'ar';  // from session or context
<h1>{lang === 'ar' ? product.nameAr : product.nameEn}</h1>
```

---

## Status Badge Component

```typescript
// components/ui/Badge.tsx
type Status = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

const colors: Record<Status, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED:  'bg-blue-100   text-blue-800   border-blue-200',
  PROCESSING: 'bg-purple-100 text-purple-800 border-purple-200',
  SHIPPED:    'bg-orange-100 text-orange-800 border-orange-200',
  DELIVERED:  'bg-green-100  text-green-800  border-green-200',
  CANCELLED:  'bg-red-100    text-red-800    border-red-200',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
```

---

## Image Upload Component (Admin)

```typescript
// components/admin/ImageUpload.tsx
"use client";
import { useRef, useState } from "react";
import Image from "next/image";

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

export function ImageUpload({ value, onChange, max = 10 }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (value.length >= max) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
    const { url } = await res.json();
    onChange([...value, url]);
    setUploading(false);
  }

  async function handleUrl(url: string) {
    if (value.length >= max) return;
    setUploading(true);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const { url: newUrl } = await res.json();
    onChange([...value, newUrl]);
    setUploading(false);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((url, i) => (
          <div key={i} className="relative w-20 h-20">
            <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover rounded" />
            <button
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
            >×</button>
          </div>
        ))}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>
    </div>
  );
}
```

---

## Zod Form Validation (Qoya Furniture contact form pattern)

Use Zod for validating form data on the server before touching the database.

### Installation
```bash
npm install zod
```

### Schema definition
```typescript
// lib/validations.ts
import { z } from "zod";

export const InquirySchema = z.object({
  name:    z.string().min(2, "Name must be at least 2 characters"),
  phone:   z.string().min(10, "Enter a valid phone number"),
  email:   z.string().email("Enter a valid email").optional().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
});

export type InquiryInput = z.infer<typeof InquirySchema>;
```

### In API route
```typescript
import { InquirySchema } from "@/lib/validations";

export async function POST(req: Request) {
  const body = await req.json();

  const result = InquirySchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.errors[0].message;
    return Response.json({ error: firstError }, { status: 400 });
  }

  const { name, phone, email, message } = result.data;
  await prisma.inquiry.create({ data: { name, phone, email, message } });
  return Response.json({ ok: true }, { status: 201 });
}
```

### In server action
```typescript
"use server";
import { InquirySchema } from "@/lib/validations";

export async function submitInquiry(formData: FormData) {
  const raw = {
    name:    formData.get("name"),
    phone:   formData.get("phone"),
    email:   formData.get("email"),
    message: formData.get("message"),
  };

  const result = InquirySchema.safeParse(raw);
  if (!result.success) return { error: result.error.errors[0].message };

  await prisma.inquiry.create({ data: result.data });
  return { ok: true };
}
```

---

## Jitsi Meet Live Video (mr-mohammed)

Browser-based video rooms without any backend or paid service. Uses public `meet.jit.si` infrastructure.

### Installation
```bash
# No npm package — uses CDN script via Next.js Script component
```

### `components/JitsiSession.tsx`
```typescript
"use client";
import { useEffect, useRef } from "react";
import Script from "next/script";

interface Props {
  roomName: string;          // unique per session, e.g. "mrm-abc123"
  displayName: string;       // teacher or student name
  onReadyToClose?: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (domain: string, options: object) => {
      dispose: () => void;
      addEventListener: (event: string, handler: () => void) => void;
    };
  }
}

export default function JitsiSession({ roomName, displayName, onReadyToClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ReturnType<typeof window.JitsiMeetExternalAPI.prototype.constructor> | null>(null);

  function initJitsi() {
    if (!containerRef.current || !window.JitsiMeetExternalAPI) return;

    apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", {
      roomName,
      parentNode: containerRef.current,
      width: "100%",
      height: "100%",
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableLobbyChat: false,
        prejoinPageEnabled: false,   // skip the "are you ready" screen
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
        TOOLBAR_BUTTONS: ["microphone", "camera", "chat", "hangup", "fullscreen"],
      },
      userInfo: { displayName },
    });

    if (onReadyToClose) {
      apiRef.current.addEventListener("readyToClose", onReadyToClose);
    }
  }

  useEffect(() => {
    return () => { apiRef.current?.dispose(); };
  }, []);

  return (
    <>
      <Script
        src="https://meet.jit.si/external_api.js"
        onReady={initJitsi}
      />
      <div ref={containerRef} className="w-full h-[calc(100vh-4rem)]" />
    </>
  );
}
```

### Usage
```typescript
// In student dashboard or admin session page
<JitsiSession
  roomName={session.meetingLink}   // e.g. "mrm-x7k2p9"
  displayName={user.name}
  onReadyToClose={() => router.push("/dashboard")}
/>
```

### Room name generation (server-side)
```typescript
// Generates a unique room name that won't collide with public rooms
function generateJitsiRoom(): string {
  return `mrm-${Math.random().toString(36).slice(2, 9)}`;
}
```

**Limitations:** Public Jitsi infrastructure. No SLA, no guaranteed uptime, no recording. For production use with SLA requirements, consider self-hosted Jitsi or 100ms/Agora.
