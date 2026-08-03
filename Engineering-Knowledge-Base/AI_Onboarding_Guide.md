# AI Onboarding Guide

The minimum set of documents a new AI assistant should read before starting a completely new project, in the recommended order.

Reading time: ~25 minutes. After this sequence, you will be able to build a new project that matches the architecture, code style, and quality of all existing projects.

---

## Reading Order

### Phase 1: Who and Why (5 min)
Read `Master_AI_Context.md` sections:
- "Who Am I Building For" — understand the client, market, scale
- "Engineering Philosophy" — understand the decision-making approach
- "Non-Negotiable Technology Choices" — never deviate from these
- "Things That Will Break If Done Wrong" — memorize before writing code

**After this:** You know what you're building for and the hard constraints.

---

### Phase 2: How the Code is Organized (5 min)
Read `common/Folder_Structure.md`:
- "Standard Next.js App Router Structure" — the canonical layout
- "Component Placement Rules" — where every file belongs
- "Naming Rules Summary" — every convention in one table

Read `common/Coding_Standards.md`:
- "TypeScript Patterns" — interface vs type, string literals, optional fields
- "Import Order" — how imports are organized
- "API Route Patterns" — the guard pattern + error handling

**After this:** You can create files in the right places with the right names.

---

### Phase 3: Authentication (5 min)
Read `common/Authentication.md`:
- "Auth Decision Tree" — pick the right pattern for the project type
- "Pattern 2: Jose JWT" — the standard pattern (copy verbatim)
- "Admin Layout Gate" — how to protect admin routes
- "Secret Admin Navigation" — the triple-click pattern

**After this:** You can implement auth correctly on the first try.

---

### Phase 4: Database (5 min)
Read `common/Database_Standards.md`:
- "When to Use Which Approach" — Prisma vs Drizzle vs flat-file
- "Prisma Standards" — ID strategy, timestamps, enums, JSON fields, cascades
- "Complete Reference Schema" — the zahrtelkhlig schema covers every common case
- "Migration Strategy" — db push + seed

**After this:** You can write a correct Prisma schema for any ecommerce project.

---

### Phase 5: Frontend (5 min)
Read `common/Frontend_Patterns.md`:
- "Design System Tokens" — Tailwind v4 @theme setup
- "Responsive Grid Patterns" — the standard grids to use
- "Cart Drawer Pattern" — copy this for any ecommerce cart
- "Product Card Pattern" — copy this for any product grid
- "Admin Dashboard Pattern" — login gate + sidebar + status colors

Read `common/Design_System.md`:
- "Mobile-Specific Patterns" — safe area, touch targets, custom scrollbar
- "Standard Animations" — all keyframes to add to globals.css
- "Fallback States" — never show broken state

**After this:** You can build the UI with correct responsive behavior.

---

### Phase 6: Backend & API (5 min)
Read `common/Backend_Patterns.md`:
- "Prisma Singleton Pattern" — copy verbatim, always
- "Image Upload Patterns" — GitHub CDN pattern
- "OrderItem Snapshot Pattern" — always denormalize
- "Action Dispatch Pattern" — for complex entity APIs

Read `common/API_Design.md`:
- "Route Organization" — URL hierarchy
- "HTTP Method Conventions" — which method for what
- "Response Format" — exact shapes for success and error
- "API vs Server Actions: Decision Rules" — when to use each

**After this:** You can write any API route or server action correctly.

---

## Quick-Start for New Project Types

### Starting a New Ecommerce Project
Read in order:
1. `Master_AI_Context.md` (full)
2. `common/Folder_Structure.md`
3. `common/Authentication.md` → Pattern 2 or 3
4. `common/Database_Standards.md` → Prisma section + Reference Schema
5. `common/Reusable_Patterns.md` (full — all patterns apply)
6. `Blueprints/database_blueprint.md` → Blueprint A (starter Prisma schema)
7. `Blueprints/auth_blueprint.md` → Blueprint A or B
8. `Blueprints/crud_blueprint.md` → product admin structure
9. `Blueprints/dashboard_blueprint.md` → admin panel layout

Reference project: **zahrtelkhlig** (most complete ecommerce implementation)

---

### Starting a New Portfolio/Lead-Gen Site
Read in order:
1. `Master_AI_Context.md` (first 4 sections)
2. `common/Folder_Structure.md`
3. `common/Database_Standards.md` → Drizzle section
4. `common/Frontend_Patterns.md` → Single-page patterns
5. `Blueprints/database_blueprint.md` → Blueprint B (Drizzle schema)
6. `Blueprints/landing_page_blueprint.md`

Reference project: **webistrydev** (canonical portfolio implementation)

---

### Starting a New Admin-Only CMS
Read in order:
1. `Master_AI_Context.md` (philosophy + non-negotiables)
2. `common/Authentication.md` → Patterns 1 or 2
3. `common/Backend_Patterns.md` → Atomic write or Prisma
4. `common/Frontend_Patterns.md` → Admin Dashboard Pattern
5. `Blueprints/dashboard_blueprint.md`

Reference project: **Ahmed-Elakad** (flat-file CMS) or **Montelle** (Prisma CMS)

---

### Starting a New Interactive Tool (3D, VR, Canvas)
Read in order:
1. `Master_AI_Context.md` (philosophy section only)
2. `common/Frontend_Patterns.md` → any relevant patterns
3. Study `elghaly-vr` project directly for Three.js + React Three Fiber patterns

Reference project: **elghaly-vr** (100% client-side, no backend, procedural 3D scene)

---

## Before Writing Any Code — Verify

After reading, answer these before your first line:

```
1. What is the DB approach? (Prisma / Drizzle / flat-file)
2. What is the auth approach? (cookie / Jose JWT / client-side)
3. Where do images go? (GitHub CDN / VPS /media/)
4. What is the caching strategy? (force-dynamic / revalidate 60 / static)
5. Is this Arabic RTL? (dir="rtl" + Cairo font required)
6. What port does dev run on? (3000 / 3002 / other)
7. What is the admin password pattern? (env var / hardcoded / DB setting)
```

Then check:
```
□ Opened the nearest analogous project and read one similar feature
□ Copied session.ts template (not writing from scratch)
□ Copied prisma.ts singleton (not writing from scratch)
□ globals.css has @import "tailwindcss" (NOT @tailwind directives)
□ All admin routes have getAdminSession() as first line
```

---

## What to NEVER Do

```
✗ Add features not in the spec — even if "obviously useful"
✗ Refactor surrounding code when adding a feature
✗ Create an API route when a server action suffices (or vice versa)
✗ Invent a new folder structure — use the established one
✗ Use any auth library other than bare Jose JWT
✗ Import PrismaClient directly — always use the singleton
✗ Set cart state on the server
✗ Write bare CSS reset rules outside @layer
✗ Add comments that describe WHAT code does (names do that)
✗ Use type instead of interface for object shapes
✗ Hardcode pixel values — use Tailwind utilities
✗ Add loading states for things that load instantly
✗ Add validation for impossible inputs
```

---

## What to ALWAYS Do

```
✓ Read the existing similar file before implementing anything new
✓ Use the guard pattern on every admin API route (copy verbatim)
✓ Snapshot price/name/image in OrderItem at creation time
✓ Use mobile-first responsive classes (base → sm → md → lg)
✓ Provide a fallback state for every image and empty list
✓ Call revalidatePath() after any mutation that affects public routes
✓ Return { error: 'message' } never throw in API routes
✓ Run prisma generate after every schema change
✓ Use the @theme block for all custom design tokens
✓ Test in browser before reporting a task as done
```

---

## Emergency Reference Card

```
Auth check:          const s = await getAdminSession(); if (!s) return 401;
Order number:        `MT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,5)}`
Shipping:            subtotal >= 800 ? 0 : 60
Price format:        amount.toLocaleString('ar-EG') + ' ج.م'
CDN URL:             https://cdn.jsdelivr.net/gh/SherifAsh93/{repo}@main/public/images/products/{file}
ISR store pages:     export const revalidate = 60
CMS pages:           export const dynamic = "force-dynamic"
Atomic write:        writeFileSync(tmp, json); renameSync(tmp, dest)
Cart clear:          useCart.getState().clearCart()
Triple-click admin:  count.current++; if(count.current>=3) router.push('/admin')
Zustand persist:     create(persist(fn, { name: 'cart-storage' }))
```
