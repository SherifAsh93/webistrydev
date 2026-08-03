# Authentication Blueprint

Copy-paste ready authentication implementations.

---

## Blueprint A: Simple Admin (Single User, Jose JWT)

**Use for:** Montelle, any single-admin Vercel project

```typescript
// src/lib/session.ts
import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function createAdminSession(): Promise<void> {
  const token = await new SignJWT({ role: "ADMIN" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
  (await cookies()).set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 28800,
    path: "/",
  });
}

export async function getAdminSession() {
  try {
    const token = (await cookies()).get("admin_session")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch { return null; }
}

export async function deleteAdminSession(): Promise<void> {
  (await cookies()).delete("admin_session");
}
```

```typescript
// src/app/api/admin/login/route.ts
import { createAdminSession } from "@/lib/session";

export async function POST(req: Request) {
  const { password } = await req.json();
  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }
  await createAdminSession();
  return Response.json({ ok: true });
}
```

```typescript
// src/app/api/admin/logout/route.ts
import { deleteAdminSession } from "@/lib/session";

export async function POST() {
  await deleteAdminSession();
  return Response.json({ ok: true });
}
```

```typescript
// src/app/admin/layout.tsx
import { getAdminSession } from "@/lib/session";
import AdminLoginView from "@/components/admin/AdminLoginView";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) return <AdminLoginView />;
  return <>{children}</>;
}
```

```typescript
// src/components/admin/AdminLoginView.tsx
"use client";
import { useState } from "react";

export default function AdminLoginView() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.href = "/admin";
    } else {
      const data = await res.json();
      setError(data.error || "Login failed");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-6">Admin Login</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border rounded-lg px-4 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "..." : "Login"}
        </button>
      </form>
    </div>
  );
}
```

---

## Blueprint B: Multi-Role Auth (zahrtelkhlig pattern)

**Use for:** Any project with customers + staff + admin

```typescript
// src/lib/session.ts
import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export type SessionPayload = {
  userId: string;
  role: "USER" | "STAFF" | "OWNER" | "ADMIN";
  name?: string;
};

// Regular session (customers, staff) — 7 days
export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  (await cookies()).set("session", token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const token = (await cookies()).get("session")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch { return null; }
}

// Admin session (admin only) — 8 hours
export async function createAdminSession(): Promise<void> {
  const token = await new SignJWT({ role: "ADMIN", userId: "admin" } as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(secret);
  (await cookies()).set("admin_session", token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", maxAge: 28800, path: "/",
  });
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  try {
    const token = (await cookies()).get("admin_session")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "ADMIN") return null;
    return payload as SessionPayload;
  } catch { return null; }
}

export async function deleteSession() { (await cookies()).delete("session"); }
export async function deleteAdminSession() { (await cookies()).delete("admin_session"); }
```

```typescript
// src/app/actions/auth.ts
"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, createAdminSession } from "@/lib/session";

export async function login(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !await bcrypt.compare(password, user.password)) return { error: "Invalid credentials" };
  await createSession({ userId: user.id, role: user.role as any, name: user.name });
  redirect("/");
}

export async function register(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  if (password.length < 6) return { error: "Password must be at least 6 characters" };
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already registered" };
  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email, password: hashed, name } });
  await createSession({ userId: user.id, role: "USER", name: user.name });
  redirect("/");
}

export async function logout() {
  const { deleteSession } = await import("@/lib/session");
  await deleteSession();
  redirect("/");
}

export async function adminLogin(formData: FormData): Promise<{ error?: string }> {
  const password = formData.get("password") as string;
  if (password !== process.env.ADMIN_PASSWORD) return { error: "Invalid password" };
  await createAdminSession();
  redirect("/admin");
}
```

---

## Blueprint C: Client-Side Admin (webistrydev pattern)

**Use for:** Low-stakes admin panels, single trusted device

```typescript
// app/admin/page.tsx (excerpt)
"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("admin-auth") === "ok") setAuthed(true);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === "114891") {
      sessionStorage.setItem("admin-auth", "ok");
      setAuthed(true);
    } else {
      setError("Wrong password");
    }
  }

  if (!authed) return (
    <form onSubmit={handleLogin} className="max-w-sm mx-auto mt-32 p-8">
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit">Login</button>
    </form>
  );

  return <div>{/* admin content */}</div>;
}
```

---

## API Route Guard (copy for every admin route)

```typescript
// Always first lines of admin route handler
const session = await getAdminSession();
if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
```

## Triple-Click Logo (copy for Navbar)

```typescript
const count = useRef(0);
const timer = useRef<ReturnType<typeof setTimeout>>();
function handleLogoClick(e: React.MouseEvent) {
  e.preventDefault();
  count.current++;
  clearTimeout(timer.current);
  timer.current = setTimeout(() => { count.current = 0; }, 800);
  if (count.current >= 3) { count.current = 0; router.push("/admin"); }
  else if (count.current === 1) router.push("/");
}
```
