# CRUD Blueprint

Complete implementation for any admin-managed resource. Uses Product as the example — substitute your entity name.

---

## File Structure

```
app/
  api/
    products/
      route.ts          ← Public GET (list) — no auth
    admin/
      products/
        route.ts        ← Admin GET (full list) + POST (create)
        [id]/
          route.ts      ← Admin PUT (update) + DELETE (delete)
      upload/
        route.ts        ← Image upload → GitHub CDN
  admin/
    products/
      page.tsx          ← Admin product list + management
      [id]/
        page.tsx        ← Product edit form (optional)
components/
  admin/
    ImageUpload.tsx     ← Reusable image uploader (admin only)
```

---

## 1. Prisma Model

```prisma
model Product {
  id          String    @id @default(cuid())
  name        String
  description String?
  price       Float
  comparePrice Float?
  images      String[]  @default([])
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])
  active      Boolean   @default(true)
  featured    Boolean   @default(false)
  sortOrder   Int       @default(0)
  stock       Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  orderItems  OrderItem[]
}
```

---

## 2. API Routes

### `app/api/admin/products/route.ts`

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.name || body.price === undefined) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
    }
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        price: parseFloat(body.price),
        comparePrice: body.comparePrice ? parseFloat(body.comparePrice) : null,
        images: body.images ?? [],
        categoryId: body.categoryId ?? null,
        active: body.active ?? true,
        featured: body.featured ?? false,
        stock: parseInt(body.stock ?? "0"),
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
```

### `app/api/admin/products/[id]/route.ts`

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { category: true } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: Request, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description ?? null,
        price: parseFloat(body.price),
        comparePrice: body.comparePrice ? parseFloat(body.comparePrice) : null,
        images: body.images ?? [],
        categoryId: body.categoryId ?? null,
        active: body.active ?? true,
        featured: body.featured ?? false,
        stock: parseInt(body.stock ?? "0"),
      },
    });
    return NextResponse.json(product);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
```

### `app/api/products/route.ts` (Public)

```typescript
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const featured = searchParams.get("featured") === "true";
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(categoryId ? { categoryId } : {}),
      ...(featured ? { featured: true } : {}),
    },
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
  return Response.json({ products });
}
```

---

## 3. Admin Page

```typescript
// app/admin/products/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Product { id: string; name: string; price: number; active: boolean; stock: number; images: string[] }

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Product> & { categoryId?: string; comparePrice?: number }>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/admin/products/${editing}` : "/api/admin/products";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage({ type: "success", text: editing ? "Updated!" : "Created!" });
        setForm({});
        setEditing(null);
        await loadProducts();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error ?? "Failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
    setSubmitting(false);
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) { await loadProducts(); }
    else setMessage({ type: "error", text: "Failed to delete" });
  }

  function startEdit(p: Product) {
    setEditing(p.id);
    setForm(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-6">Products</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 mb-8 space-y-4">
        <h2 className="font-medium">{editing ? "Edit Product" : "New Product"}</h2>
        {message && (
          <p className={`text-sm p-3 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
            {message.text}
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Name *</label>
            <input value={form.name ?? ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Price *</label>
            <input type="number" value={form.price ?? ""} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))} required
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Stock</label>
            <input type="number" value={form.stock ?? 0} onChange={e => setForm(f => ({ ...f, stock: parseInt(e.target.value) }))}
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active ?? true} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
            Active
          </label>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={submitting}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50">
            {submitting ? "Saving..." : editing ? "Update" : "Create"}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setForm({}); }}
              className="border px-6 py-2 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500 text-sm">No products yet.</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">Stock</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4">{p.name}</td>
                  <td className="p-4">{p.price.toLocaleString('ar-EG')} ج.م</td>
                  <td className="p-4">{p.stock}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(p)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

---

## 4. Image Upload API

```typescript
// app/api/admin/upload/route.ts
import { getAdminSession } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const token = process.env.GITHUB_TOKEN!;
  const repo = process.env.GITHUB_REPO!;
  const path = `public/images/products/${filename}`;

  const res = await fetch(`https://api.github.com/repos/SherifAsh93/${repo}/contents/${path}`, {
    method: "PUT",
    headers: { Authorization: `token ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message: `Upload ${filename}`, content: base64 }),
  });

  if (!res.ok) {
    const err = await res.text();
    return Response.json({ error: "Upload failed", details: err }, { status: 500 });
  }

  const url = `https://cdn.jsdelivr.net/gh/SherifAsh93/${repo}@main/${path.replace("public/", "")}`;
  return Response.json({ url });
}
```
