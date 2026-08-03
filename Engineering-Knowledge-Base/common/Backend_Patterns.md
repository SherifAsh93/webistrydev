# Backend Patterns

Server-side patterns extracted from 5 production projects. These cover API design, data access, auth, file handling, and server actions.

---

## Auth Implementation

### Jose JWT Session (standard pattern — Montelle, zahrtelkhlig)

```typescript
// lib/session.ts
import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function createAdminSession() {
  const token = await new SignJWT({ role: 'ADMIN' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret);
  
  (await cookies()).set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,  // 8 hours in seconds
    path: '/',
  });
}

export async function getAdminSession() {
  try {
    const token = (await cookies()).get('admin_session')?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function deleteAdminSession() {
  (await cookies()).delete('admin_session');
}
```

### Multi-Role Session (zahrtelkhlig — 2 separate cookies)
```typescript
// Regular user session — 7 days
export async function createSession(payload: { userId: string; role: UserRole; name: string }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
  
  (await cookies()).set('session', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get('session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch { return null; }
}
```

### bcryptjs Password Hashing (zahrtelkhlig)
```typescript
import bcrypt from "bcryptjs";
const SALT_ROUNDS = 12;

// Hash on register
const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

// Compare on login
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

---

## API Route Guard Pattern

Every admin API route starts with the same guard:
```typescript
export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  // ... handler
}
```

For multi-role (zahrtelkhlig):
```typescript
// Admin-only guard
async function adminGuard() {
  const session = await getAdminSession();
  if (!session) return null;
  return session;
}

// POS guard (ADMIN or STAFF)
async function posGuard() {
  const session = await getSession();
  if (!session) return null;
  if (!['ADMIN', 'STAFF'].includes(session.role)) return null;
  return session;
}
```

---

## Prisma Singleton Pattern

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Why the global:** In development, Next.js hot-reloads modules. Without the global cache, each reload creates a new PrismaClient, exhausting DB connection pools quickly.

---

## Image Upload Patterns

### GitHub CDN Upload (Montelle, zahrtelkhlig)
```typescript
// app/api/admin/upload/route.ts
import { getAdminSession } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const contentType = req.headers.get('content-type') ?? '';
  let base64: string;
  let ext: string;
  
  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const buffer = await file.arrayBuffer();
    base64 = Buffer.from(buffer).toString('base64');
    ext = file.name.split('.').pop() ?? 'jpg';
  } else {
    // URL-based upload
    const { url } = await req.json();
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    base64 = Buffer.from(buffer).toString('base64');
    ext = url.split('.').pop()?.split('?')[0] ?? 'jpg';
  }
  
  const filename = `img_${Date.now()}.${ext}`;
  const path = `public/images/products/${filename}`;
  
  const githubRes = await fetch(
    `https://api.github.com/repos/SherifAsh93/${process.env.GITHUB_REPO}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload ${filename}`,
        content: base64,
      }),
    }
  );
  
  if (!githubRes.ok) {
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
  
  const cdnUrl = `https://cdn.jsdelivr.net/gh/SherifAsh93/${process.env.GITHUB_REPO}@main/${path}`;
  return Response.json({ url: cdnUrl, filename });
}
```

### Local Disk Upload (Ahmed-Elakad)
```typescript
import { writeFile } from "fs/promises";
import path from "path";
import busboy from "busboy";

const DATA_DIR = "/home/sherif/data/ahmed-elakad/images";

// Using busboy for streaming multipart parsing
const bb = busboy({ headers: req.headers });
bb.on('file', async (field, fileStream, { filename, mimeType }) => {
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const fullPath = path.join(DATA_DIR, safeName);
  const chunks: Buffer[] = [];
  for await (const chunk of fileStream) chunks.push(chunk);
  await writeFile(fullPath, Buffer.concat(chunks));
  const url = `https://ahmedelakad.com/media/${safeName}`;
});
```

---

## Atomic Write Pattern (Ahmed-Elakad)

Prevents data corruption from concurrent writes or process crashes:

```typescript
// lib/atomicWrite.ts
import { writeFileSync, renameSync } from "fs";
import path from "path";

export function atomicWriteJSON(filePath: string, data: unknown): void {
  const tmpPath = filePath + '.tmp';
  try {
    writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
    renameSync(tmpPath, filePath);  // POSIX atomic operation
  } catch (e) {
    try { unlinkSync(tmpPath); } catch {}  // cleanup tmp on error
    throw e;
  }
}
```

**When to use:** Any time you write a JSON file that might be read concurrently. The `rename` syscall is atomic on the same filesystem — readers either get the old file or the new file, never a partial write.

---

## Drizzle Query Patterns (webistrydev)

```typescript
import { db } from "@/db";
import { leads, messages } from "@/db/schema";
import { eq, desc, asc, and } from "drizzle-orm";

// Select all with order
const allLeads = await db
  .select()
  .from(leads)
  .orderBy(desc(leads.createdAt));

// Select with filter
const lead = await db
  .select({ id: leads.id, name: leads.name })
  .from(leads)
  .where(eq(leads.chatToken, token))
  .limit(1);

// Insert
await db.insert(messages).values({
  leadId: lead[0].id,
  sender: 'admin',
  body: messageText,
});

// Update
await db.update(leads)
  .set({ status: 'contacted' })
  .where(eq(leads.id, id));

// Delete (cascade handled by FK constraint)
await db.delete(leads).where(eq(leads.id, id));
```

---

## Order Number Generation

Two patterns across projects:

### Encoded Timestamp (Montelle)
```typescript
export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();  // compact base-36 timestamp
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `MT-${ts}-${rand}`;  // e.g., MT-J5KR7D-XF2
}
```

### Plain Timestamp (zahrtelkhlig)
```typescript
function generateOrderNumber(): string {
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ZH-${Date.now()}-${rand}`;  // e.g., ZH-1719412234567-XF2K
}

function generatePOSNumber(sequence: number): string {
  return `POS-${String(sequence).padStart(4, '0')}`;  // e.g., POS-0042
}
```

---

## Shipping Calculation Pattern

```typescript
// lib/utils.ts

const FREE_SHIPPING_THRESHOLD = 800;  // Montelle: 800 EGP
const SHIPPING_COST = 60;             // Montelle: 60 EGP

// zahrtelkhlig: threshold=500, cost=50

export function calcShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}
```

---

## OrderItem Snapshot Pattern

Never store only a foreign key to `Product` in `OrderItem`. Always denormalize price, name, and image:

```typescript
// Why: Products change (price, name, images). Orders must reflect what was purchased.
await prisma.order.create({
  data: {
    ...orderHeader,
    items: {
      createMany: {
        data: cartItems.map(item => ({
          productId: item.id,
          name: item.name,        // ← snapshot
          price: item.price,      // ← snapshot
          image: item.image,      // ← snapshot
          quantity: item.quantity,
          size: item.size ?? null,
          color: item.color ?? null,
        })),
      },
    },
  },
});
```

---

## Homepage Config Pattern (zahrtelkhlig)

Dynamic homepage sections stored in database:

```typescript
// lib/homepage.ts
interface HomepageSection {
  type: 'features-bar' | 'new-arrivals' | 'featured-products' | 'at-a-glance' | 'brand-story';
  enabled: boolean;
  sortOrder: number;
  mode?: 'auto' | 'manual';
  productIds?: string[];
}

interface HomepageConfig {
  sections: HomepageSection[];
}

// Save
await prisma.siteSettings.upsert({
  where: { key: 'homepage_config' },
  update: { value: JSON.stringify(config) },
  create: { key: 'homepage_config', value: JSON.stringify(config) },
});
revalidatePath('/');

// Read
const setting = await prisma.siteSettings.findUnique({ where: { key: 'homepage_config' } });
const config: HomepageConfig = setting ? JSON.parse(setting.value) : defaultConfig;
```

---

## In-Memory Cache Pattern (Ahmed-Elakad)

For expensive operations that don't need freshness on every request:

```typescript
// app/api/images/route.ts
let imageCache: { data: string[]; timestamp: number } | null = null;
const CACHE_TTL = 30_000;  // 30 seconds

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bustCache = searchParams.has('nocache');
  
  if (!bustCache && imageCache && Date.now() - imageCache.timestamp < CACHE_TTL) {
    return Response.json({ images: imageCache.data });
  }
  
  const images = await scanImagesDirectory();
  imageCache = { data: images, timestamp: Date.now() };
  return Response.json({ images });
}
```

---

## Action Dispatch Pattern (Ahmed-Elakad)

For entities with many sub-operations, use a single PUT endpoint with `action` parameter:

```typescript
// app/api/admin/clients/route.ts
export async function PUT(req: Request) {
  const session = cookies().get("admin_session")?.value;
  if (session !== "authenticated") return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const body = await req.json();
  const { id, action } = body;
  
  const clients = readClients();
  const clientIdx = clients.findIndex(c => c.id === id);
  if (clientIdx === -1) return Response.json({ error: 'Not found' }, { status: 404 });
  
  switch (action) {
    case 'addPayment': {
      const payment: Payment = { id: randomUUID(), amount: body.amount, date: body.date, note: body.note };
      clients[clientIdx].payments.push(payment);
      break;
    }
    case 'deletePayment': {
      clients[clientIdx].payments = clients[clientIdx].payments.filter(p => p.id !== body.paymentId);
      break;
    }
    case 'addDress': {
      const dress: Dress = { id: randomUUID(), label: body.label, images: [], createdAt: new Date().toISOString() };
      clients[clientIdx].dresses.push(dress);
      break;
    }
    // ... more actions
    default: {
      // Full client update
      Object.assign(clients[clientIdx], body);
    }
  }
  
  atomicWriteJSON(CLIENTS_FILE, clients);
  return Response.json(clients[clientIdx]);
}
```

---

## Voice Note Storage (webistrydev)

```typescript
// Client-side: MediaRecorder → Blob → base64 DataURL
async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// In server action:
export async function submitInquiry({ voiceNote }: { voiceNote?: string }) {
  await db.insert(leads).values({
    voiceNote,  // stored as "data:audio/webm;base64,..." — can be played back directly
    // ...
  });
}

// In admin — play back directly from DB value:
<audio src={lead.voiceNote ?? undefined} controls />
```

**Trade-off:** Base64 inflates size 33%. A 60-second webm recording ≈ 600KB → 800KB in DB. Acceptable for low-frequency inquiry submissions. For high volume, switch to object storage (S3, Cloudinary) and store URLs instead.

---

## Email + Telegram Notifications (webistrydev)

Dual notification fired on every form submission. Resend handles email; Telegram Bot API sends to a channel.

### Installation
```bash
npm install resend
```

### `.env.local` variables needed
```bash
RESEND_API_KEY=re_xxxx
TELEGRAM_BOT_TOKEN=123456:ABC-xxxx
TELEGRAM_CHAT_ID=-100xxxxxxxxxxxx   # negative for group/channel
NOTIFICATION_EMAIL=sherif.ash93@gmail.com
```

### Implementation
```typescript
// lib/notify.ts
export async function sendEmailNotification(subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'noreply@webistrydev.com',
      to: process.env.NOTIFICATION_EMAIL!,
      subject,
      html,
    }),
  });
}

export async function sendTelegramNotification(text: string) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return;
  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
      }),
    }
  );
}
```

### Usage in API route
```typescript
// In form submission handler — fire both in parallel, don't await errors
await Promise.allSettled([
  sendEmailNotification(
    `New lead from ${name}`,
    `<p><strong>Name:</strong> ${name}</p><p><strong>Phone:</strong> ${phone}</p>`
  ),
  sendTelegramNotification(
    `🔔 <b>New Lead</b>\nName: ${name}\nPhone: ${phone}`
  ),
]);
```

**Why `allSettled`:** Notification failure must never fail the main form submission. The lead is saved to DB first; notifications fire after.

---

## Video/Media Handling (Ahmed-Elakad)

### ffmpeg Video Transcoding
```typescript
// app/api/admin/transcode/route.ts
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);
const FFMPEG = '/usr/bin/ffmpeg';
const DATA_DIR = '/home/sherif/data/ahmed-elakad/images';

export async function POST(req: Request) {
  const { filename } = await req.json();
  const input = path.join(DATA_DIR, filename);
  const output = path.join(DATA_DIR, filename.replace(/\.[^.]+$/, '.mp4'));

  await execAsync(
    `${FFMPEG} -i "${input}" -c:v libx264 -crf 23 -preset fast -c:a aac "${output}" -y`
  );
  return Response.json({ output: path.basename(output) });
}
```

### Instagram Video Download (yt-dlp)
```typescript
// app/api/ig-video/route.ts
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const YT_DLP = '/home/sherif/yt-dlp';
const COOKIES = '/home/sherif/ig-cookies.txt';   // Netscape format cookies

export async function POST(req: Request) {
  const { url } = await req.json();
  const outTemplate = `/home/sherif/data/ahmed-elakad/images/ig_%(id)s.%(ext)s`;

  const { stdout } = await execAsync(
    `${YT_DLP} --cookies "${COOKIES}" -o "${outTemplate}" --print filename "${url}"`
  );
  const filename = stdout.trim().split('\n').pop()!;
  return Response.json({ filename: path.basename(filename) });
}
```

**These patterns are VPS-only** — ffmpeg and yt-dlp must be installed on the server. Not applicable to Vercel-hosted projects.

---

## POS Stock Reduction (zahrtelkhlig)

Immediate, synchronous stock reduction when POS creates a sale:

```typescript
// app/api/pos/sale/route.ts
export async function POST(req: Request) {
  const session = await posGuard();
  if (!session) return Response.json({ error: 'Forbidden' }, { status: 403 });
  
  const { items } = await req.json();
  
  // Validate and reduce stock in a transaction
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error(`Product ${item.productId} not found`);
      
      // Update aggregate stock
      const newStock = product.stock - item.quantity;
      if (newStock < 0) throw new Error(`Insufficient stock for ${product.nameAr}`);
      
      // Update variants/sizeStock if applicable
      let updatedVariants = product.variants as any[];
      if (item.size && updatedVariants?.length) {
        updatedVariants = updatedVariants.map(v =>
          v.size === item.size && v.color === item.color
            ? { ...v, qty: v.qty - item.quantity }
            : v
        );
      }
      
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: newStock,
          variants: updatedVariants ?? undefined,
        },
      });
    }
    
    // Create order with POS source
    await tx.order.create({
      data: {
        orderNumber: generatePOSNumber(),
        source: 'POS',
        status: 'DELIVERED',  // POS = immediate fulfillment
        // ...items as OrderItems
      },
    });
  });
  
  return Response.json({ success: true });
}
```
