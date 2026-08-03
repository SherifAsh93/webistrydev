# Feature Workflow

How to plan, implement, and ship any feature in this stack. Based on observed patterns across 5 projects.

---

## The 5-Step Feature Loop

```
1. PLAN      → Define routes, data shape, UI mockup
2. DATA      → Schema change (if needed) + seed/migrate
3. API       → Write API routes or server actions
4. UI        → Components + pages
5. VERIFY    → Test in browser, check edge cases
```

Never jump from step 1 to step 4. The data shape drives everything.

---

## Step 1: Plan

Before writing a single line:

**Define the data:**
```
What entity does this feature operate on?
What fields does it need?
What are the relationships?
Does this need a new DB table, or can it use existing data?
```

**Define the routes:**
```
URL: /admin/banners
Public: GET /api/banners → list
Admin: POST /api/admin/banners → create
       PUT  /api/admin/banners/[id] → update
       DELETE /api/admin/banners/[id] → delete
```

**Define the UI:**
```
List view: table or grid?
Create/Edit: modal or page?
What validation is needed?
```

---

## Step 2: Data

### Adding a Prisma Field
```prisma
// 1. Add to schema.prisma
model Product {
  // existing fields...
  comparePrice  Float?   // new optional field
}

// 2. Push (local dev)
npx prisma db push

// 3. Regenerate client
npx prisma generate
```

### Adding a Prisma Model
```prisma
model Review {
  id         String   @id @default(cuid())
  productId  String
  rating     Int
  body       String
  createdAt  DateTime @default(now())
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}
// Don't forget to add: reviews Review[] to Product model
```

### Adding a Drizzle Table (webistrydev)
```typescript
// db/schema.ts — add new table
export const reviews = pgTable('reviews', {
  id:        serial('id').primaryKey(),
  leadId:    integer('lead_id').references(() => leads.id, { onDelete: 'cascade' }),
  rating:    integer('rating').notNull(),
  body:      text('body'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Push to DB
// npx drizzle-kit push
```

### Adding to Flat-file JSON (Ahmed-Elakad)
```typescript
// lib/content.ts — extend the type
interface SiteContent {
  // existing...
  awards?: AwardItem[];  // new section
}

interface AwardItem {
  id: string;
  title: string;
  year: string;
  description?: string;
}
```

---

## Step 3: API

### New Public Endpoint
```typescript
// app/api/reviews/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  
  const reviews = await prisma.review.findMany({
    where: productId ? { productId } : undefined,
    orderBy: { createdAt: 'desc' },
  });
  
  return Response.json({ reviews });
}
```

### New Admin Endpoint
```typescript
// app/api/admin/reviews/route.ts
import { getAdminSession } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const body = await req.json();
  if (!body.productId || !body.rating) {
    return Response.json({ error: 'Product ID and rating are required' }, { status: 400 });
  }
  
  const review = await prisma.review.create({ data: body });
  return Response.json(review, { status: 201 });
}
```

### New Server Action
```typescript
// app/actions/reviews.ts
"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function submitReview(formData: FormData) {
  const productId = formData.get('productId') as string;
  const rating = parseInt(formData.get('rating') as string);
  const body = formData.get('body') as string;
  
  if (!productId || !rating) return { error: 'Missing fields' };
  
  await prisma.review.create({ data: { productId, rating, body } });
  revalidatePath(`/products/${productId}`);
  return { success: true };
}
```

---

## Step 4: UI

### New Admin Page
```typescript
// app/admin/reviews/page.tsx
"use client";
import { useEffect, useState } from "react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetch('/api/admin/reviews')
      .then(r => r.json())
      .then(data => setReviews(data.reviews))
      .catch(() => setError('Failed to load reviews'))
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Reviews</h1>
      {/* table/grid of reviews */}
    </div>
  );
}
```

### New Store Page (Server Component)
```typescript
// app/(store)/products/[id]/reviews/page.tsx
import { prisma } from "@/lib/prisma";
export const revalidate = 60;

export default async function ReviewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reviews = await prisma.review.findMany({
    where: { productId: id },
    orderBy: { createdAt: 'desc' },
  });
  
  return (
    <div>
      {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
    </div>
  );
}
```

### Adding to Existing Component
When adding to an existing component (e.g., ProductCard gets a review count):
1. Query the extra data in the parent Server Component
2. Pass as prop to the Client Component
3. Never fetch data inside a Client Component unless necessary

---

## Step 5: Verify

```
□ Load the page in browser (desktop)
□ Load the page on mobile (resize or real device)
□ Test empty state (no data)
□ Test error state (disconnect DB temporarily)
□ Test validation (submit invalid data)
□ Test admin auth (try without session)
□ Check that existing features still work
```

---

## Adding a New Product Field (Complete Example)

This is the most common task in ecommerce projects. Follow exactly:

**1. Schema**
```prisma
model Product {
  // ...existing
  material  String?  // new field
}
```

**2. Push & Regenerate**
```bash
npx prisma db push
npx prisma generate
```

**3. Update API (create endpoint)**
```typescript
// No change needed if using body passthrough
// But explicit validation if required:
const { name, price, material } = body;
```

**4. Update Product Form (admin UI)**
```tsx
// Add input to form
<label>Material</label>
<input
  value={form.material ?? ''}
  onChange={e => setForm(f => ({ ...f, material: e.target.value }))}
  placeholder="e.g., Silk, Chiffon"
/>
```

**5. Display on Product Page**
```tsx
{product.material && (
  <p><span className="font-medium">Material:</span> {product.material}</p>
)}
```

**6. Update TypeScript types**
```typescript
// If using manual types (not Prisma-generated)
interface Product {
  // ...
  material?: string;
}
```

---

## Homepage Section Pattern (zahrtelkhlig)

To add a new configurable homepage section:

**1. Define type in `lib/homepage.ts`**
```typescript
type HomepageSectionType = 
  | 'features-bar' | 'new-arrivals' | 'featured-products' 
  | 'brand-story' | 'your-new-section';  // ← add here
```

**2. Add default config**
```typescript
const defaultConfig: HomepageConfig = {
  sections: [
    // ...existing
    { type: 'your-new-section', enabled: false, sortOrder: 99 }
  ]
};
```

**3. Create the component**
```typescript
// components/store/YourNewSection.tsx
export default function YourNewSection({ config }: { config: HomepageSection }) {
  // ...
}
```

**4. Wire in homepage page**
```typescript
// app/(store)/page.tsx
{sections.find(s => s.type === 'your-new-section')?.enabled && (
  <YourNewSection config={...} />
)}
```

**5. Add editor in admin homepage page**
```typescript
// app/admin/homepage/HomepageSettingsForm.tsx
// Add case for new section type in the section editor
```

---

## Common Pitfalls

| Mistake | Result | Fix |
|---------|--------|-----|
| Forget `prisma generate` after schema change | Runtime error on model access | Always run after schema push |
| Use `force-dynamic` in store pages | Never ISR, always server-render | Use `revalidate = 60` for store |
| Fetch data in client component on admin | Extra network round-trip | Use API route + useEffect |
| Forget `revalidatePath` after mutation | Stale cache on public pages | Add after every write that affects public route |
| Add field to DB but not to form | Data never saved | Update form + API + type in same PR |
| Delete product with existing orders | Cascade issue | Check onDelete behavior before deleting |
| Add new OrderItem field without snapshot | Historical orders break | Always snapshot denormalized data at create time |
