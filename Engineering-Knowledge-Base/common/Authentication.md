# Authentication

All auth patterns in use across the portfolio. Organized from simplest to most complex.

---

## Auth Decision Tree

```
Does the project need auth?
├─ No → Skip (elghaly-vr)
├─ Single admin user?
│  ├─ VPS/PM2 hosted → Cookie with plaintext password (Ahmed-Elakad)
│  └─ Vercel hosted → Jose JWT, password vs env var (Montelle)
├─ Admin + customers?
│  └─ Multi-role + bcrypt → Jose JWT dual sessions (zahrtelkhlig)
└─ Admin only, no server verification needed?
   └─ Client-side sessionStorage (webistrydev — acceptable for low-traffic admin)
```

---

## Pattern 1: Cookie-Based (Ahmed-Elakad)

Simplest possible auth. Single admin user, cookie stores literal string.

```typescript
// app/api/auth/route.ts
import { cookies } from "next/headers";
import { readConfig } from "@/lib/config";

export async function POST(req: Request) {
  const { password } = await req.json();
  const config = readConfig();
  
  if (password !== config.password) {
    return Response.json({ error: 'Invalid password' }, { status: 401 });
  }
  
  (await cookies()).set('admin_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,  // 30 days
    path: '/',
  });
  
  return Response.json({ ok: true });
}

export async function DELETE() {
  (await cookies()).delete('admin_session');
  return Response.json({ ok: true });
}

// Check in any protected route:
const session = (await cookies()).get('admin_session')?.value;
if (session !== 'authenticated') {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**When to use:** Single VPS instance, single admin user, low attack surface, infrastructure-level protection (Nginx IP whitelist) as primary security.

---

## Pattern 2: Jose JWT (Montelle — standard)

Industry-standard approach. Password vs env var, JWT in httpOnly cookie.

### Installation
```bash
npm install jose
```

### Implementation
```typescript
// lib/session.ts
import "server-only";  // prevents client-side import
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);
const COOKIE_NAME = 'admin_session';

export async function createAdminSession(): Promise<void> {
  const token = await new SignJWT({ role: 'ADMIN' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret);
  
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  });
}

export async function getAdminSession() {
  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;  // expired, invalid signature, etc.
  }
}

export async function deleteAdminSession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
```

### Login Route
```typescript
// app/api/admin/login/route.ts
import { createAdminSession } from "@/lib/session";

export async function POST(req: Request) {
  const { password } = await req.json();
  
  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Invalid password' }, { status: 401 });
  }
  
  await createAdminSession();
  return Response.json({ ok: true });
}
```

### Admin Layout Gate
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

### API Route Guard
```typescript
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  // ... proceed
}
```

---

## Pattern 3: Multi-Role Auth with bcryptjs (zahrtelkhlig)

Full auth system with 4 roles and 2 separate session cookies.

### Session Payloads
```typescript
interface SessionPayload {
  userId: string;
  role: 'USER' | 'STAFF' | 'OWNER' | 'ADMIN';
  name?: string;
  iat?: number;
  exp?: number;
}
```

### Two Separate Cookies
```typescript
// Regular session: customers, staff (7 days)
cookies().set('session', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7 });

// Admin session: system admin (8 hours)
cookies().set('admin_session', token, { httpOnly: true, maxAge: 60 * 60 * 8 });
```

### Server Actions for Login
```typescript
// app/actions/auth.ts
"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function login(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: 'Invalid email or password' };
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { error: 'Invalid email or password' };
  
  await createSession({ userId: user.id, role: user.role, name: user.name });
  redirect('/');
}

export async function register(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  
  if (password.length < 6) return { error: 'Password must be at least 6 characters' };
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: 'Email already in use' };
  
  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashed, name, role: 'USER' },
  });
  
  await createSession({ userId: user.id, role: user.role, name: user.name });
  redirect('/');
}

export async function adminLogin(formData: FormData): Promise<{ error?: string }> {
  const password = formData.get('password') as string;
  if (password !== '114891') return { error: 'Invalid password' };  // hardcoded
  await createAdminSession();
  redirect('/admin');
}

export async function posLogin(formData: FormData): Promise<{ error?: string }> {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  
  if (username === 'admin') {
    if (password !== '114891') return { error: 'Invalid credentials' };
    await createSession({ userId: 'admin', role: 'ADMIN', name: 'Admin' });
    redirect('/pos');
  }
  
  const staff = await prisma.user.findUnique({ where: { username } });
  if (!staff || staff.role !== 'STAFF') return { error: 'Invalid credentials' };
  
  const valid = await bcrypt.compare(password, staff.password);
  if (!valid) return { error: 'Invalid credentials' };
  
  await createSession({ userId: staff.id, role: 'STAFF', name: staff.name });
  redirect('/pos');
}

export async function ownerLogin(formData: FormData): Promise<{ error?: string }> {
  const password = formData.get('password') as string;
  const setting = await prisma.siteSettings.findUnique({ where: { key: 'owner_password' } });
  const ownerPassword = setting?.value ?? 'ashraf2024';
  
  if (password !== ownerPassword) return { error: 'Invalid password' };
  await createSession({ userId: 'owner', role: 'OWNER', name: 'Owner' });
  redirect('/owner');
}
```

### Staff Account Creation
```typescript
export async function createStaffAccount(formData: FormData): Promise<{ error?: string; success?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized' };
  
  const username = formData.get('username') as string;
  if (!/^[a-z0-9_]+$/.test(username)) return { error: 'Username: lowercase letters, numbers, underscores only' };
  
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return { error: 'Username already taken' };
  
  const hashed = await bcrypt.hash(formData.get('password') as string, 12);
  await prisma.user.create({
    data: {
      name: formData.get('name') as string,
      username,
      email: `${username}@staff.zahrtelkhlig`,  // synthetic email
      password: hashed,
      role: 'STAFF',
    },
  });
  
  return { success: 'Staff account created' };
}
```

---

## Pattern 4: Client-Side sessionStorage (webistrydev)

Minimal admin auth for low-sensitivity single-user panels:

```typescript
// app/admin/page.tsx (client component)
"use client";
const [authed, setAuthed] = useState(false);
const [pw, setPw] = useState('');

useEffect(() => {
  if (sessionStorage.getItem('wc-admin') === 'ok') setAuthed(true);
}, []);

function handleLogin(e: FormEvent) {
  e.preventDefault();
  if (pw === '114891') {
    sessionStorage.setItem('wc-admin', 'ok');
    setAuthed(true);
  } else {
    setError('Wrong password');
  }
}
```

**When acceptable:**
- Admin is a single person on a trusted device
- No sensitive PII in admin panel
- Low-traffic site
- Infrastructure-level access restrictions (VPS, VPN, Nginx)

**When NOT acceptable:**
- Multiple admin users
- Handling payments or sensitive customer data
- Public-facing admin URL without IP restriction

---

## Secret Admin Navigation (all projects)

```typescript
// components/layout/Navbar.tsx
import { useRouter } from "next/navigation";
import { useRef } from "react";

const router = useRouter();
const clickCount = useRef(0);
const clickTimer = useRef<ReturnType<typeof setTimeout>>();

function handleLogoClick(e: React.MouseEvent) {
  e.preventDefault();
  clickCount.current += 1;
  clearTimeout(clickTimer.current);
  clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 800);
  
  if (clickCount.current >= 3) {
    clickCount.current = 0;
    router.push('/admin');
    return;
  }
  
  if (clickCount.current === 1) router.push('/');  // normal single click = home
}

// JSX
<a href="/" onClick={handleLogoClick}>
  <Logo />
</a>
```

---

## Environment Variables Required

| Variable | Purpose | Projects |
|----------|---------|---------|
| `SESSION_SECRET` | JWT signing key (32+ chars) | Montelle, zahrtelkhlig |
| `ADMIN_PASSWORD` | Plain text admin password | Montelle |
| `DATABASE_URL` | Neon PostgreSQL URL | Montelle, zahrtelkhlig, webistrydev |
| `NODE_ENV` | `production` enables secure cookie | All |

---

## Security Notes

| Risk | Current Mitigation | Ideal |
|------|------------------|-------|
| Plaintext password in config.json | VPS-only access | bcrypt hash |
| Client-side admin auth (webistrydev) | Low-traffic, trusted device | Server sessions |
| No rate limiting on login | PM2 single instance | Rate limiting middleware |
| Admin passwords hardcoded | In env vars or DB (not source) | Rotate regularly |
| `--accept-data-loss` on migration | Additive changes only | Migration files + review |
