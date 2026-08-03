# Feature Implementation Checklist

Step-by-step process for implementing any feature correctly.

---

## Universal Pre-Implementation (Every Feature)

```
□ Read the nearest analogous existing feature (not just the spec)
□ Identify which files to create vs modify
□ Decide: API route vs server action?
□ Decide: server component vs client component?
□ Note: which existing utilities to reuse (don't re-implement)
```

---

## New CRUD Resource

```
SCHEMA
□ Add Prisma model to schema.prisma
□ Add relations in parent models (e.g., product: Product @relation...)
□ Run prisma db push
□ Run prisma generate
□ Verify in prisma studio: table created

API
□ /api/admin/[resource]/route.ts — GET (list) + POST (create)
□ /api/admin/[resource]/[id]/route.ts — GET (one) + PUT + DELETE
□ /api/[resource]/route.ts (if public) — GET with active:true filter
□ Auth guard (getAdminSession) on every admin handler
□ Validation on required fields
□ try/catch on all DB calls

ADMIN UI
□ /admin/[resource]/page.tsx — list + inline form (client component)
□ Add link to AdminSidebar
□ Form: all fields with labels
□ Submit: POST or PUT based on editing state
□ Delete: confirm dialog + DELETE request
□ Success/error feedback message (auto-dismiss)

STORE UI (if public-facing)
□ Component in components/store/
□ Use data in appropriate page
□ Handle empty state (no data)
□ Handle image fallback

VERIFICATION
□ Create item → appears in list
□ Edit item → changes saved
□ Delete item → removed from list (with confirm)
□ Public page shows item
□ Mobile layout correct
□ No TypeScript errors (npx tsc --noEmit)
```

---

## New Database Field

```
□ Add field to Prisma schema (? for optional, default for required)
□ Run prisma db push && prisma generate
□ Update create API route to accept field
□ Update update API route to accept field
□ Update admin form to include input for field
□ Update store display if field is public
□ Update TypeScript types if using manual interfaces
□ Verify: create with field → shows in DB → displays correctly
```

---

## Authentication Flow

```
□ session.ts written with server-only import
□ createSession/getSession/deleteSession functions
□ Admin: createAdminSession/getAdminSession/deleteAdminSession (if separate)
□ Login API route (POST) — verify password, create session, return ok
□ Logout API route (POST) — delete session cookie, return ok
□ Admin layout: getAdminSession() → show login form if null
□ Protected API routes: first line is auth check + 401
□ Test: login → cookie set → refresh → still logged in
□ Test: logout → cookie gone → refresh → login form shown
□ Test: API without session → 401 response
□ Test: session expires → redirect to login (check maxAge)
```

---

## Image Upload Feature

```
□ /api/admin/upload/route.ts exists (or create)
□ Reads file from FormData
□ Uploads to GitHub CDN (or VPS disk for VPS projects)
□ Returns { url: string }
□ ImageUpload component in components/admin/
□ Wired to parent form state (images: string[])
□ Test: upload small JPEG → URL returned → preview shows
□ Test: upload large file → no timeout (GitHub has 1MB base64 limit)
□ Verify CDN URL loads in browser
□ Add CDN hostname to next.config.ts remotePatterns if not already there
```

---

## Order Checkout Flow

```
□ Cart state: Zustand + localStorage (DO NOT use server state)
□ Checkout page: server or client component
□ Form: customerName, customerPhone, city (dropdown), paymentMethod
□ Server action (preferred) or POST to /api/orders
□ Order creation: generateOrderNumber() first
□ OrderItem snapshot: name, price, image (NOT just productId)
□ Stock: DO NOT reduce on checkout (admin confirms later)
□ After creation: clearCart() + redirect to confirmation page
□ Admin notification: optional WhatsApp link or badge
□ Test: full flow: add to cart → checkout → order appears in admin
□ Test: cart clears after successful order
□ Test: order shows correct prices (not live prices)
```

---

## Homepage Config Section

```
□ Add type to HomepageSectionType
□ Add default config to defaultConfig
□ Create component: components/store/[SectionName].tsx
□ Wire into app/(store)/page.tsx conditional render
□ Add editor in admin homepage form
□ Test: enable in admin → appears on homepage
□ Test: disable in admin → hidden on homepage
□ revalidatePath('/') called after settings save
□ Test: after toggle, homepage refreshes correctly (check revalidate)
```

---

## Admin Stats Card

```
□ Identify which Prisma queries to run
□ Use Promise.all for parallel execution
□ Create GET /api/admin/stats (if not exists)
□ Add stats to /admin/page.tsx
□ Cards show: label, value, optional trend
□ Graceful fallback if query returns null/0
□ Test: stats show correct numbers (verify against DB)
□ Test: page loads fast (all queries run in parallel)
```

---

## Arabic RTL Feature

```
□ Root html tag has dir="rtl" lang="ar"
□ Cairo font imported + applied
□ Use logical CSS properties: start/end instead of left/right
□ Tailwind: ps-4 (padding-start) not pl-4, ms-2 not ml-2, text-start not text-left
□ RTL-specific Tailwind: rtl:rotate-180 for directional icons
□ Line-height for Arabic: leading-loose or specific px
□ Test on real Arabic text (not Lorem Ipsum)
□ Test: long Arabic words don't overflow containers
□ Test: numbers display correctly (Arabic-Indic vs Western numerals)
```

---

## Deployment Verification

```
□ npm run build — passes locally
□ npx tsc --noEmit — no errors
□ .env.example committed with all required keys
□ .env.local NOT committed
□ git log — commit message is descriptive
□ git push origin main

VERCEL:
□ Vercel env vars set (all keys from .env.example)
□ Build completes in Vercel dashboard
□ Production URL loads
□ Admin panel accessible
□ One full user flow tested (create order, see in admin)
□ Mobile tested on actual URL (not localhost)

VPS:
□ git pull on VPS
□ npm install (if new deps)
□ npm run build
□ pm2 restart [name]
□ pm2 logs [name] --lines 20 (no errors)
□ Site loads on HTTPS
□ SSL cert valid (certbot status)
```

---

## Pre-Commit Checklist

```
□ No console.log left in code
□ No TODO comments left unresolved
□ No hardcoded passwords, tokens, or secrets
□ TypeScript: npx tsc --noEmit passes
□ All new env vars added to .env.example
□ git diff — review changes make sense
□ Commit message: clear, present tense ("Add product reviews page")
□ git push — pushed to GitHub
```
