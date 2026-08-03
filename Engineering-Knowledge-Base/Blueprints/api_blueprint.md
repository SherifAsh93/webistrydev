# API Blueprint

Standard patterns for every API route type. Copy these and substitute your entity.

---

## Route Template: List + Create

```typescript
// app/api/admin/[resource]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const items = await prisma.RESOURCE.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.REQUIRED_FIELD) {
      return NextResponse.json({ error: "REQUIRED_FIELD is required" }, { status: 400 });
    }
    const item = await prisma.RESOURCE.create({ data: body });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
```

---

## Route Template: Get One + Update + Delete

```typescript
// app/api/admin/[resource]/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await prisma.RESOURCE.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const item = await prisma.RESOURCE.update({ where: { id }, data: body });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.RESOURCE.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
```

---

## Route Template: Public List (Store)

```typescript
// app/api/[resource]/route.ts
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const cursor = searchParams.get("cursor") ?? undefined;

  const items = await prisma.RESOURCE.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return Response.json({ items: data, nextCursor });
}
```

---

## Route Template: Bulk Update (e.g., sortOrder)

```typescript
// app/api/admin/[resource]/sort/route.ts
export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { items } = await req.json();
  // items = [{ id: string, sortOrder: number }]

  await prisma.$transaction(
    items.map((item: { id: string; sortOrder: number }) =>
      prisma.RESOURCE.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      })
    )
  );

  return Response.json({ ok: true });
}
```

---

## Route Template: Stats Dashboard

```typescript
// app/api/admin/stats/route.ts
export async function GET() {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalOrders, monthOrders, totalRevenue, monthRevenue, productCount] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.aggregate({ where: { status: { notIn: ["CANCELLED"] } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { status: { notIn: ["CANCELLED"] }, createdAt: { gte: startOfMonth } }, _sum: { total: true } }),
    prisma.product.count({ where: { active: true } }),
  ]);

  return Response.json({
    totalOrders,
    monthOrders,
    totalRevenue: totalRevenue._sum.total ?? 0,
    monthRevenue: monthRevenue._sum.total ?? 0,
    productCount,
  });
}
```

---

## Route Template: Site Settings (Key-Value)

```typescript
// app/api/admin/settings/route.ts
export async function GET() {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await prisma.siteSettings.findMany();
  return Response.json({ settings });
}

export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { settings } = await req.json();
  // settings = Record<string, string>

  await prisma.$transaction(
    Object.entries(settings as Record<string, string>).map(([key, value]) =>
      prisma.siteSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  );

  revalidatePath("/");
  return Response.json({ ok: true });
}
```

---

## Response Format Reference

```typescript
// Success (single resource)
return Response.json(item);                          // 200
return Response.json(item, { status: 201 });         // 201 Created

// Success (collection)
return Response.json({ items });                     // 200
return Response.json({ products, categories });      // 200 multiple

// Success (mutation)
return Response.json({ ok: true });                  // 200

// Error
return Response.json({ error: "Unauthorized" }, { status: 401 });
return Response.json({ error: "Not found" }, { status: 404 });
return Response.json({ error: "Bad input" }, { status: 400 });
return Response.json({ error: "Server error" }, { status: 500 });
```

---

## Client-Side Fetch Patterns

### useEffect data load
```typescript
const [data, setData] = useState<Item[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch("/api/admin/items")
    .then(r => r.json())
    .then(d => setData(d.items ?? []))
    .finally(() => setLoading(false));
}, []);
```

### Mutation with optimistic update
```typescript
async function handleDelete(id: string) {
  if (!confirm("Delete?")) return;
  setData(prev => prev.filter(item => item.id !== id));  // optimistic
  const res = await fetch(`/api/admin/items/${id}`, { method: "DELETE" });
  if (!res.ok) {
    // Revert on failure
    loadData();
    setError("Delete failed");
  }
}
```

### Form submit
```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setSubmitting(true);
  const res = await fetch(editing ? `/api/admin/items/${editing}` : "/api/admin/items", {
    method: editing ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  if (res.ok) {
    setForm({});
    setEditing(null);
    await loadData();
    setMessage({ type: "success", text: "Saved!" });
  } else {
    const err = await res.json();
    setMessage({ type: "error", text: err.error ?? "Failed" });
  }
  setSubmitting(false);
  setTimeout(() => setMessage(null), 3000);
}
```
