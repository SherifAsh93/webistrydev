# API Design

REST API conventions, response shapes, versioning, and decision rules extracted from 5 production projects.

---

## Route Organization

### URL Hierarchy Pattern
```
/api/                         # Public read-only
  products/                   # Resource collection
  products/[id]/              # Resource item
  categories/
  banners/
  orders/                     # Authenticated (user's own orders)

/api/admin/                   # Admin-only (JWT guard on every handler)
  products/                   # Admin product CRUD
  products/[id]/
  orders/
  orders/[id]/
  categories/
  categories/[id]/
  banners/
  banners/[id]/
  upload/                     # Image upload
  stats/                      # Dashboard metrics
  reports/                    # Analytics

/api/pos/                     # POS terminal (STAFF or ADMIN)
  products/                   # Product search
  sale/                       # Create POS order

/api/owner/                   # Owner analytics (read-only)
  stats/
  activity/
  orders/
  products/
```

---

## HTTP Method Conventions

| Method | Use Case | Notes |
|--------|----------|-------|
| `GET` | Fetch data | Never modifies state |
| `POST` | Create resource | Returns 201 on success |
| `PUT` | Full update | Replace entire resource |
| `PATCH` | Partial update | Update specific fields |
| `DELETE` | Remove resource | Body for bulk delete |

### Bulk Operations
```typescript
// Bulk delete via DELETE with body
export async function DELETE(req: Request) {
  const { ids } = await req.json();  // string[]
  await prisma.product.deleteMany({ where: { id: { in: ids } } });
  return Response.json({ deleted: ids.length });
}
```

---

## Response Format

### Success Responses

```typescript
// Single resource (GET by ID or POST)
Response.json(resource, { status: 200 })
Response.json(resource, { status: 201 })  // Created

// List
Response.json({ products, total, page, limit }, { status: 200 })

// Simple confirmation
Response.json({ ok: true }, { status: 200 })
Response.json({ deleted: 3 }, { status: 200 })
```

### Error Responses

```typescript
// Always use this shape
Response.json({ error: 'Human-readable message' }, { status: 400 | 401 | 403 | 404 | 500 })

// Examples:
Response.json({ error: 'Name and price are required' }, { status: 400 })
Response.json({ error: 'Unauthorized' }, { status: 401 })
Response.json({ error: 'Admin access required' }, { status: 403 })
Response.json({ error: 'Product not found' }, { status: 404 })
Response.json({ error: 'Failed to save product' }, { status: 500 })
```

### Status Code Map
| Code | When |
|------|------|
| 200 | Successful GET, PUT, PATCH, DELETE |
| 201 | Resource created (POST) |
| 400 | Missing/invalid input |
| 401 | Not authenticated (no session) |
| 403 | Authenticated but insufficient role |
| 404 | Resource not found |
| 500 | Unexpected server error |

---

## Complete Route Handler Template

```typescript
// app/api/admin/products/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  
  if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });
  return Response.json(product);
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { id } = await params;
  const body = await req.json();
  
  try {
    const product = await prisma.product.update({
      where: { id },
      data: body,
    });
    return Response.json(product);
  } catch (e) {
    if ((e as any).code === 'P2025') {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }
    return Response.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return Response.json({ ok: true });
}
```

---

## Query Parameter Conventions

```typescript
// Pagination (consistent across all list endpoints)
const page = parseInt(searchParams.get('page') ?? '1');
const limit = parseInt(searchParams.get('limit') ?? '20');
const skip = (page - 1) * limit;

// Filtering
const category = searchParams.get('category') ?? undefined;
const search = searchParams.get('q') ?? undefined;
const status = searchParams.get('status') ?? undefined;

// Prisma where object built from params
const where = {
  active: true,
  categoryId: category || undefined,  // undefined = omit from where clause
  status: status as OrderStatus || undefined,
  ...(search ? {
    OR: [
      { name: { contains: search, mode: 'insensitive' as const } },
      { sku: { contains: search, mode: 'insensitive' as const } },
    ]
  } : {}),
};
```

---

## API vs Server Actions: Decision Rules

| Use Case | Use API Route | Use Server Action |
|----------|--------------|------------------|
| Form submission | — | ✓ (type-safe, no HTTP) |
| Auth (login, register) | — | ✓ (server-side redirect) |
| Admin dashboard fetch | ✓ (easier to debug) | — |
| Data that needs to be fetched from client component | ✓ | — |
| Mutations from client component | ✓ | — |
| Creating an order (checkout) | — | ✓ (redirect after) |
| Public read endpoints (products, categories) | ✓ | — |
| Settings/config saves | — | ✓ (+ revalidatePath) |

**Rule of thumb:** Server actions for user-initiated mutations. API routes for admin dashboards and data fetching.

---

## Action Dispatch Pattern (for complex entities)

When one resource has many sub-operations, use an `action` field in the body:

```typescript
// app/api/admin/clients/route.ts
export async function PUT(req: Request) {
  const { id, action, ...data } = await req.json();
  
  switch (action) {
    case 'addPayment':    return handleAddPayment(id, data);
    case 'deletePayment': return handleDeletePayment(id, data.paymentId);
    case 'addDress':      return handleAddDress(id, data);
    case 'addVoiceNote':  return handleAddVoiceNote(id, data);
    default:              return handleFullUpdate(id, data);
  }
}
```

**When to use:** Entity has 5+ distinct sub-operations (like a client record with payments, dresses, voice notes). Avoids creating 5 separate endpoints.

---

## Pagination Response Shape

```typescript
// Consistent across all list endpoints
{
  products: Product[],  // (or orders, users, etc.)
  total: number,        // total matching records (before pagination)
  page: number,         // current page
  limit: number,        // items per page
  totalPages: number,   // Math.ceil(total / limit)
}
```

```typescript
// Server implementation
const [items, total] = await Promise.all([
  prisma.product.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
  prisma.product.count({ where }),
]);

return Response.json({
  products: items,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});
```

---

## Image Upload API Pattern

```typescript
// app/api/admin/upload/route.ts
// Accepts both file upload (multipart) and URL (JSON)

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const contentType = req.headers.get('content-type') ?? '';
  
  if (contentType.includes('multipart')) {
    const form = await req.formData();
    const file = form.get('file') as File;
    
    // Validate type
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowed.includes(file.type)) {
      return Response.json({ error: 'Invalid file type' }, { status: 400 });
    }
    
    // Process and upload...
    return Response.json({ url: cdnUrl });
  }
  
  // URL-based upload
  const { url } = await req.json();
  // Fetch and re-upload...
  return Response.json({ url: newCdnUrl });
}
```

---

## Stats/Dashboard API Pattern

```typescript
// app/api/admin/stats/route.ts
export async function GET() {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const [totalOrders, totalRevenue, pendingOrders, totalProducts] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.product.count({ where: { active: true } }),
  ]);
  
  return Response.json({
    totalOrders,
    totalRevenue: totalRevenue._sum.total ?? 0,
    pendingOrders,
    totalProducts,
  });
}
```

---

## Public vs Protected Endpoint Rules

**Public (no auth):**
- Product listings and detail
- Category tree
- Active banners
- Any content that appears on the public website

**User-authenticated:**
- User's own orders
- User's own profile
- Cart (if DB-backed)
- Wishlist (if DB-backed)

**Admin-only:**
- Creating/editing/deleting products
- Order status management
- Category/banner management
- Stats and reports
- Media upload
- User management

**Never mix:** A public endpoint that also returns admin data based on a session check is a mistake. Separate endpoints for public vs admin views.
