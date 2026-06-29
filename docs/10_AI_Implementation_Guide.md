# 10 — AI Implementation Guide

This document is written specifically for AI agents (Claude, etc.) continuing development on this codebase. It covers rules that must always be followed, patterns to replicate, pitfalls to avoid, and concrete implementation checklists.

---

## Absolute Rules

These rules reflect deliberate architectural decisions. Never violate them without explicit confirmation from Sherif.

### Rule 1: Translations First

Before using any user-visible text in a component, add it to `lib/translations.ts` in **both** `ar` and `en` sections. Then reference it via `useLang()`.

```typescript
// WRONG — hardcoded string
<h2>My New Section</h2>

// WRONG — only added to 'en', forgot 'ar'
// TypeScript may not catch this if the key is optional

// RIGHT
// 1. In translations.ts:
//    ar: { mySection: { title: "قسمي الجديد" } }
//    en: { mySection: { title: "My New Section" } }
// 2. In component:
const { t } = useLang();
<h2>{t.mySection.title}</h2>
```

**Exception**: `ChatPage.tsx` (`app/m/[token]/ChatPage.tsx`) is Arabic-only by design. It has hardcoded Arabic strings and does not use `useLang()`. Do not change this.

### Rule 2: Server Actions Only, No API Routes

Never create `app/api/` routes. All database operations must be Server Actions in `app/actions/`.

```typescript
// WRONG — create app/api/leads/route.ts
export async function GET() { ... }

// RIGHT — create or extend a file in app/actions/
"use server";
export async function myNewAction(param: string) {
  return await db.select()...;
}
```

### Rule 3: Never Add an Auth Library

The admin uses `sessionStorage["wc-admin"] === "114891"` for auth. This is intentional. Do not add NextAuth, Clerk, Auth.js, or any auth library to this project. The complexity is not warranted for a single-admin personal portfolio.

### Rule 4: Static Content Stays in `lib/data.ts`

Portfolio projects, services, and pricing tiers are not in the database. They are static arrays in `lib/data.ts`. Do not create database tables for them.

### Rule 5: No New Package Installs Without Justification

The dependency list is intentionally minimal. Before installing any new package:
1. Check if the functionality can be achieved with existing dependencies
2. Check if Next.js or the standard library already provides it (e.g., `crypto.randomUUID()` instead of `uuid` package)
3. Confirm with Sherif if uncertain

---

## Implementation Checklist

Use this when adding any new feature to the project:

- [ ] New user-visible text added to both `ar` and `en` in `translations.ts`
- [ ] Component uses `useLang()` for all text (not hardcoded strings)
- [ ] Database operations use Server Actions in `app/actions/` (not API routes)
- [ ] New schema columns pushed via `npx drizzle-kit push` (not migration files)
- [ ] `"use client"` directive added only if the component needs browser APIs or React hooks
- [ ] Static content added to `lib/data.ts`, not fetched from DB
- [ ] Framer Motion used for entrance animations (stagger pattern for multiple items, blur-fade for word cycling)
- [ ] Utility classes from `globals.css` used (`.card`, `.btn-primary`, `.field`, etc.) instead of inline styles
- [ ] RTL tested — check that new layout elements work in both LTR (English) and RTL (Arabic)

---

## Patterns to Replicate

### Pattern: Drizzle Server Action

```typescript
"use server";

import { db } from "@/db";
import { myTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getMyItems(filter: string) {
  try {
    return await db
      .select()
      .from(myTable)
      .where(eq(myTable.someField, filter))
      .orderBy(desc(myTable.createdAt));
  } catch {
    return [];
  }
}
```

### Pattern: Client Component with useLang

```typescript
"use client";
import { useLang } from "@/lib/language-context";
import { motion } from "framer-motion";

export default function MySection() {
  const { t } = useLang();

  return (
    <section id="my-section" className="py-16 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <p className="section-label justify-center mb-4">{t.mySection.label}</p>
        <h2 className="text-4xl font-extrabold text-slate-900">
          {t.mySection.title1}{" "}
          <span className="text-gradient">{t.mySection.title2}</span>
        </h2>
      </div>
    </section>
  );
}
```

### Pattern: Framer Motion Stagger (copy this exactly)

```typescript
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

<motion.div
  variants={containerVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-80px" }}
  className="grid ..."
>
  {items.map((item) => (
    <motion.div key={item.id} variants={itemVariants} className="card rounded-2xl p-6">
      {/* content */}
    </motion.div>
  ))}
</motion.div>
```

### Pattern: Form with Server Action

```typescript
"use client";
import { useState } from "react";
import { myAction } from "@/app/actions/my-action";

export default function MyForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const result = await myAction({ field: value });
    if (result.success) setStatus("success");
    else setStatus("idle");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input className="field w-full rounded-xl px-4 py-3 text-sm" />
      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-primary py-3 disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : "Submit"}
      </button>
    </form>
  );
}
```

---

## Pitfalls and How to Avoid Them

### Pitfall 1: RTL Flash for Arabic Users

**Problem**: The server renders `<html dir="ltr">`. Arabic users see an LTR flash.

**How it's solved**: The blocking inline script in `app/layout.tsx` sets `dir="rtl"` synchronously before paint. Do not remove this script. Do not move it to `useEffect` (that runs after paint).

**If you add a new page**: Make sure `app/layout.tsx` wraps it (it wraps all routes via the root layout). The RTL detection is global.

### Pitfall 2: Voice Recording MIME Type on Safari

**Problem**: Safari does not support `audio/webm;codecs=opus`. It supports `audio/mp4`.

**How it's solved**: The MIME type fallback chain in `StartProject.tsx`:
```typescript
const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
  ? "audio/webm;codecs=opus"
  : MediaRecorder.isTypeSupported("audio/webm")
  ? "audio/webm"
  : "audio/mp4";
```

**If you refactor voice recording**: Always keep this fallback chain. Never hardcode a single MIME type.

### Pitfall 3: Base64 Size Limits for Long Recordings

**Problem**: A 60-second voice note base64-encoded is approximately 700 KB–1.2 MB as a string. Storing many of these in the `leads` table and fetching them all in `getLeads()` can make the admin dashboard slow to load.

**Current limit**: 60 seconds enforced in `StartProject.tsx` via a timer that calls `stopRecording()` at 60s.

**If you increase the limit**: Consider fetching voice notes separately (lazy-load on card expand) rather than with `getLeads()`. This would require splitting the admin's data fetch.

**Do not increase the recording limit without addressing the fetch performance.**

### Pitfall 4: Neon Cold Starts on Free Tier

**Problem**: Neon's free tier may exhibit cold-start latency (200–500ms) if the database hasn't been queried recently. The first request after idle may feel slow.

**Current mitigation**: None — the project accepts this trade-off.

**If latency becomes an issue**: Upgrade to Neon's paid tier (no cold starts) or implement a lightweight keep-alive ping. Do not add a complex caching layer for this use case.

### Pitfall 5: sessionStorage Auth Is Client-Side Only

**Problem**: The admin password check (`sessionStorage.getItem("wc-admin") === "114891"`) is purely client-side. The password string `"114891"` is visible in the JavaScript bundle.

**This is a known trade-off** (see `03_Tech_Stack.md`). Do not add server-side auth middleware for this page without Sherif's explicit request. The current setup is intentional.

**If someone reports unauthorized access**: Change the `ADMIN_PW` constant in `app/admin/page.tsx`. This requires a rebuild and redeploy.

### Pitfall 6: Missing Translation Key in One Language

**Problem**: If you add `t.newSection.title` to `en` but forget to add it to `ar`, the Arabic UI will show `undefined` or crash.

**Prevention**: TypeScript catches this if the `translations` object is properly typed. The type `T = (typeof translations)[Lang]` is inferred from the literal object shape. If the key exists in `en` but not `ar`, TypeScript may not error (depending on exact typing) — always manually verify both sections.

**Pattern**: Add both together, never separately:
```typescript
// translations.ts
ar: { newSection: { title: "..." } },
en: { newSection: { title: "..." } },
```

### Pitfall 7: `lib/projects.ts` — Do Not Import This

`lib/projects.ts` is a legacy duplicate of the project data that also exists in `lib/data.ts`. It is not imported by any active component. Do not import it in new work. If you see it imported somewhere, it's an error — switch to `lib/data.ts`.

### Pitfall 8: `app/actions/index.ts` Is a Legacy File

The file `app/actions/index.ts` contains the original `submitLead` function from the prototype, which uses the old form fields (`email`, `projectType`). It is not imported by any active component. Do not confuse it with the re-export barrel that the name suggests — it is just a legacy file that was never cleaned up.

When importing actions, always import directly from their specific files:
```typescript
import { submitInquiry } from "@/app/actions/submit-inquiry";
import { getLeads } from "@/app/actions/get-leads";
```

---

## How to Add New Lead Fields

If Sherif wants to collect a new piece of data from leads (e.g., "preferred timeline"):

**Step 1**: Add to schema (`db/schema.ts`):
```typescript
preferredTimeline: varchar("preferred_timeline", { length: 100 }),
```

**Step 2**: Push to database:
```bash
npx drizzle-kit push
```

**Step 3**: Update `submitInquiry` (`app/actions/submit-inquiry.ts`):
```typescript
export async function submitInquiry(formData: {
  name: string;
  phone: string;
  message?: string;
  voiceNote?: string | null;
  preferredTimeline?: string;  // ← add parameter
}) {
  // ...
  await db.insert(leads).values({
    // existing...
    preferredTimeline: formData.preferredTimeline || null,  // ← add to insert
  });
}
```

**Step 4**: Add translation strings for the field label:
```typescript
// translations.ts — both ar and en
startProject: {
  // existing...
  timelineLabel: "الجدول الزمني المفضل" // ar
  timelineLabel: "Preferred Timeline"    // en
}
```

**Step 5**: Add field to `StartProject.tsx` form (name + phone card or new card).

**Step 6**: Add field display to `app/admin/page.tsx` expanded card view.

---

## Summary: What Makes This Codebase Distinctive

1. **No library i18n** — custom React Context with a single `translations.ts` file
2. **No auth library** — `sessionStorage` + hardcoded password, intentionally simple
3. **No WebSocket** — 5-second polling in `ChatPage.tsx`, acceptable for async support chat
4. **No API routes** — all DB ops are Server Actions
5. **No Prisma** — Drizzle ORM with Neon HTTP driver
6. **Voice notes as base64** — stored as text in Postgres, played back via `<audio src="data:...">` natively
7. **RTL via blocking script** — prevents flash without middleware or server-side locale detection
8. **Static data in TS files** — portfolio, services, pricing never touch the database
