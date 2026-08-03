# Prompt Templates for AI

Ready-to-use prompts for common development tasks. Copy and fill in the brackets.

---

## New Project Bootstrap

```
Build a new Next.js 16 + TypeScript + Tailwind v4 ecommerce project.

Tech stack (non-negotiable):
- Next.js 16 App Router with src/ directory
- TypeScript strict mode
- Tailwind CSS v4 with @tailwindcss/postcss
- Prisma ORM + Neon PostgreSQL
- Jose JWT auth (HS256, httpOnly cookies)
- Zustand cart (localStorage persist)
- GitHub CDN for images
- lucide-react for icons
- Vercel deployment

Required files to create first (in this order):
1. postcss.config.mjs — { "@tailwindcss/postcss": {} }
2. src/app/globals.css — @import "tailwindcss" + @theme tokens
3. prisma/schema.prisma — full schema
4. src/lib/prisma.ts — singleton with PG adapter
5. src/lib/session.ts — Jose JWT with "server-only"
6. src/lib/utils.ts — formatPrice, calcShipping, generateOrderNumber
7. src/store/cartStore.ts — Zustand + persist
8. src/components/StoreHydration.tsx
9. .env.example

Project: [describe what you're building]
Color palette: [describe or reference a palette]
Language: [Arabic RTL / English LTR / Bilingual]
```

---

## Add a New Page

```
Add a new page at [URL path] to the [PROJECT_NAME] project.

Page type: [Server Component / Client Component]
Caching: [force-dynamic / revalidate=60 / static]

Data needed:
- [what to fetch from DB, which Prisma model]

UI:
- [describe layout, components, content]

Follow the exact same pattern as [similar existing page path].
Read that file before writing.

DO NOT:
- Add features not listed
- Refactor surrounding code
- Import anything new — use existing utilities
```

---

## Add CRUD Resource

```
Add full CRUD for [ResourceName] to the admin panel.

Prisma model:
[paste or describe the model fields]

Files to create:
1. prisma/schema.prisma — add model (I'll run prisma db push manually)
2. src/app/api/admin/[resource]/route.ts — GET (list) + POST (create)
3. src/app/api/admin/[resource]/[id]/route.ts — PUT (update) + DELETE
4. src/app/admin/[resource]/page.tsx — admin UI (list + inline form)

Auth guard: getAdminSession() must be first line in every route.

Follow the exact pattern from [similar admin page, e.g. /admin/products/page.tsx].
Read that file before writing.
```

---

## Fix a Bug

```
Bug in [PROJECT_NAME]:

File: [exact file path:line number if known]
Problem: [exact description of what's wrong]
Expected: [what should happen]
Actual: [what currently happens]

Reproduce: [step-by-step]

Please:
1. Read the file first
2. Identify the root cause
3. Show me the fix (don't refactor surrounding code)
4. Explain what caused it in one line
```

---

## Add Database Field

```
Add a new field to the [ModelName] Prisma model in [PROJECT_NAME].

Field: [fieldName]
Type: [String / Int / Boolean / Float / DateTime]
Required: [yes / no — if no, use ?]
Default: [default value if any]

After adding:
1. Update the field in the create API at [path]
2. Update the field in the update API at [path]  
3. Add the input to the admin form at [path]
4. Display it on the store page at [path]

I will run prisma db push myself after reviewing the schema change.
```

---

## Style Fix

```
Fix the mobile layout of [ComponentName] at [file path].

Issue: [describe what looks wrong on mobile]
Viewport: [375px / 390px / 428px]

Fix ONLY:
- [specific CSS/Tailwind change]

DO NOT touch:
- Desktop layout (md: and above classes)
- Any animations
- Any JS/logic
- Any other component

Use only Tailwind responsive prefixes. No new CSS files.
```

---

## Add Admin Statistics

```
Add a statistics dashboard section to [PROJECT_NAME].

Metrics to show:
- [metric 1]: [how to calculate from which model]
- [metric 2]: [how to calculate]
- [metric 3]: [how to calculate]

Create:
1. GET /api/admin/stats — fetch all metrics in one request (Promise.all)
2. Add stats cards to /admin/page.tsx

Auth guard required. Force-dynamic caching.
Follow the same card pattern as existing stats on that page (if any).
```

---

## Add Image Upload

```
Add image upload to [form/page] in [PROJECT_NAME].

Images go to: [GitHub CDN / VPS /media/ path]
Upload API: /api/admin/upload (already exists / create it)
Storage field: [which model.field stores the URLs]

Add the ImageUpload component to:
[file path] — [describe where in the form]

The component should:
- Accept multiple images (max [N])
- Show previews with delete buttons
- Upload on file select (not on form submit)
- Return CDN URLs to the parent form state

Use the ImageUpload component pattern from components/admin/ImageUpload.tsx.
Read it first before modifying.
```

---

## Deployment Help

```
Help me deploy [PROJECT_NAME] to [Vercel / VPS].

Project location: [local path]
GitHub repo: [SherifAsh93/repo-name]

Current issue: [describe what's failing]

Environment variables needed:
[list them]

Build command: [current package.json build script]

[For VPS:] PM2 process name: [name], port: [port]
[For Vercel:] vercel.json exists: [yes/no]
```

---

## Code Review Request

```
Review this code from [PROJECT_NAME] before I ship it.

Context: This is [what it does].

[paste code]

Check specifically:
1. Auth pattern — does it call getAdminSession() before any DB query?
2. Error handling — does every DB call have try/catch with proper status codes?
3. TypeScript — does it match the strict patterns used elsewhere?
4. Edge cases — what inputs could break this?
5. Performance — any unnecessary awaits or N+1 queries?

Don't suggest refactoring beyond what's needed for correctness.
```

---

## New Project Onboarding Prompt

Use this when starting a session on an existing project:

```
I need you to continue work on [PROJECT_NAME].

Before anything, read:
1. [PROJECT_NAME]/docs/01_Project_Overview.md
2. [PROJECT_NAME]/docs/10_AI_Implementation_Guide.md
3. [PROJECT_NAME]/prisma/schema.prisma (or db/schema.ts for Drizzle)
4. [PROJECT_NAME]/src/lib/session.ts

Then tell me in 3 bullet points what this project is and its key patterns,
so I know you understand the codebase.

After that, I'll give you the task.
```
