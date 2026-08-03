# AI Session Guide

How to start and direct AI coding sessions on these projects effectively. Works with any AI model (Claude, Qwen, DeepSeek, Gemma, Llama, etc.). Based on patterns that produced correct first-try code vs. patterns that caused rework.

---

## The Golden Rule

**Give context, not commands.**

A command: "Add a product form."
Context: "Add a product creation form at `/admin/products/new`. It should have fields for name (required), price (required), comparePrice (optional), category (dropdown fetched from /api/categories), featured (checkbox), active (checkbox, default true), and images (use the ImageUpload component from components/admin/ImageUpload.tsx). On submit, POST to /api/admin/products. Use the same pattern as the edit form at /admin/products/[id]/page.tsx."

The second version produces working code immediately. The first requires 3-4 back-and-forths.

---

## Session-Start Prompt Template

Use this at the start of every new AI session:

```
I'm working on [PROJECT_NAME], a [brief description].

Tech stack: Next.js 16 App Router, React 19, TypeScript 5 strict, Tailwind v4, 
[Prisma + Neon PostgreSQL / Drizzle + Neon / flat-file JSON on VPS], 
[Jose JWT auth / bcryptjs + Jose], 
[Zustand cart], Vercel deployment.

Key patterns:
- Admin auth: [describe auth pattern]
- Image storage: [GitHub CDN / VPS local disk]
- [Any other non-standard pattern]

Before you write anything:
1. Read the existing [relevant file paths]
2. Follow the exact same patterns you see there
3. Don't add features I didn't ask for
4. Don't refactor surrounding code
```

---

## Reading the Codebase First

Always instruct the AI to read before writing:

```
Before writing any code, read:
- [relevant page/component the new feature is similar to]
- [the API route pattern from an existing route]
- The Prisma schema at prisma/schema.prisma

Then follow the exact same patterns.
```

---

## Feature Request Template

```
Task: Add [feature name]

Files to create/modify:
- [exact file paths]

Data: [describe what data is needed, what fields, what relationships]

Behavior: [exact user flow, step by step]

DO:
- Follow the pattern from [existing similar file]
- Use the existing [component/utility] for [functionality]

DON'T:
- Add validation beyond what I described
- Refactor any existing code
- Add loading states I didn't mention
```

---

## Bug Fix Template

```
Bug: [exact description of what's wrong]

Expected: [what should happen]
Actual: [what happens instead]

Relevant files:
- [file where bug is]
- [file where related logic is]

I think the issue is in [specific function/line] because [your theory].
Please read the file first and confirm before fixing.
```

---

## Database Schema Change Template

```
Add a [field/table] to support [feature].

Schema change needed:
- Model: [ModelName]
- Field: [fieldName], type: [String/Int/Boolean/etc.], [required/optional]
- Default: [if any]
- [Relationship: belongs to X via xId field]

After schema change, also update:
- The API route at [path] to accept/return the new field
- The form at [path] to include the new input
- The type in [path] if using manual types

Use prisma db push (not migrations).
```

---

## Prompts That Work Well

### Adding an API route
```
Add a GET endpoint at /api/admin/reviews that:
1. Checks getAdminSession() — return 401 if not authenticated
2. Fetches all reviews from prisma.review.findMany, ordered by createdAt desc
3. Returns { reviews } as JSON

Follow the exact same pattern as /api/admin/orders/route.ts
```

### Adding an admin page
```
Add an admin page at /admin/reviews/page.tsx that:
1. Is a "use client" component
2. On mount, fetches /api/admin/reviews
3. Shows reviews in a table with columns: customer name, rating (1-5 stars), body, date
4. Has a delete button for each row that calls DELETE /api/admin/reviews/[id]

Use the same layout pattern as /admin/orders/page.tsx
Do not add features I didn't list (no search, no filters, no pagination yet)
```

### Fixing a style issue
```
The ProductCard component at components/store/ProductCard.tsx
is not responsive on mobile — the text overlaps the image on screens < 375px.

Fix only the text/image layout for small screens.
Don't touch the hover animation, badges, or desktop layout.
Use Tailwind responsive prefixes only (no new CSS).
```

---

## Prompts That Cause Problems

### Too vague
```
❌ "Add product reviews"
❌ "Make the site faster"
❌ "Fix the mobile layout"
```

### Too broad
```
❌ "Refactor the cart to use server-side sessions"
   (This touches Prisma schema, API routes, session handling, 
    multiple components — describe which specific part to change)
```

### Missing context
```
❌ "Add an upload component"
   (Which upload? For what? To where? Which CDN pattern?)
```

---

## Architectural Constraints to Always Include

When asking an AI to add features to ecommerce projects:

```
Constraints:
- Admin routes must call getAdminSession() and return 401 if null
- Product images use GitHub CDN: upload → /api/admin/upload → returns CDN URL
- Cart state is Zustand (useCart hook) + localStorage persist
- Order creation snapshots price/name/image in OrderItem (not FK-only)
- All mutations call revalidatePath('/') or relevant path after write
- Dev port is [3000/3002] — `npm run dev` to start
```

---

## Asking for Code Review

```
Review this code before I ship it:
[paste code]

Check for:
1. Does it follow the auth pattern (getAdminSession check)?
2. Does it handle errors and return proper status codes?
3. Does it match the TypeScript patterns in the rest of the project?
4. Are there any edge cases I'm missing?

Project context: [brief description]
```

---

## Asking for a New Project

When starting a new project, reference this knowledge base:

```
Build a new Next.js 16 + TypeScript + Tailwind v4 + Prisma + Neon project.

Follow the patterns from my engineering knowledge base:
- Folder structure: src/app/, src/components/{ui,layout,store,admin}/, src/lib/, src/store/
- Auth: Jose JWT, HS256, httpOnly cookie, SESSION_SECRET env var
- Admin: getAdminSession() guard on every admin API route
- Cart: Zustand + persist to localStorage
- Images: GitHub CDN (POST to /api/admin/upload → returns jsDelivr URL)
- Build: "prisma generate && prisma db push --accept-data-loss && next build"
- All store pages: export const revalidate = 60

Project requirements:
[describe your project]
```

---

## Common Instructions to Include

**Always append to prompts involving UI:**
```
- Mobile-first (default styles for mobile, sm:/md:/lg: for larger)
- No hardcoded colors — use the existing CSS variables or Tailwind classes already in use
- Match the exact typography scale already in use (don't introduce new font sizes)
- Image fallbacks are required — never show broken states
```

**Always append to prompts involving API routes:**
```
- Auth check is first line (before any DB query)
- Wrap DB calls in try/catch, return 500 on failure
- Return { error: 'message' } for all error responses (not throw)
- Status 201 for creation, 200 for other successes
```

**Always append to prompts involving Prisma:**
```
- Use the existing prisma singleton from @/lib/prisma
- Don't import PrismaClient directly
- Use include for relations (not select for complex shapes)
- Remember: OrderItem must snapshot price, name, image at creation time
```
