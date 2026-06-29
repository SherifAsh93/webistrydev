# 04 — Coding Standards

## Rule 1: Server Actions, Not API Routes

There are zero files under `app/api/`. Every database operation is a Next.js Server Action.

**Pattern:**

```typescript
// app/actions/some-action.ts
"use server";

import { db } from "@/db";
import { leads } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function doSomething(id: number) {
  await db.update(leads).set({ status: "contacted" }).where(eq(leads.id, id));
}
```

**Calling from a client component:**

```typescript
// No fetch(), no URL, no JSON.parse() — just call the function
import { doSomething } from "@/app/actions/some-action";

await doSomething(lead.id);
```

Never add a new `app/api/route.ts` file. If you need a new database operation, create or extend a file in `app/actions/`.

---

## Rule 2: Drizzle Query Patterns

All queries follow Drizzle's fluent builder API. These are the exact patterns used in this codebase:

**SELECT all (ordered):**
```typescript
const rows = await db.select().from(leads).orderBy(desc(leads.createdAt));
```

**SELECT with WHERE:**
```typescript
const [lead] = await db
  .select({ id: leads.id, name: leads.name })
  .from(leads)
  .where(eq(leads.chatToken, token));
```

Note the array destructuring `const [lead] = ...` — this gets the first (and expected only) result. After destructuring, check `if (!lead)` before using it.

**SELECT with JOIN (messages + leads):** Not yet used — prefer two sequential queries (find lead, then find messages). This keeps queries explicit and the pattern consistent.

**INSERT:**
```typescript
await db.insert(leads).values({
  name: formData.name,
  phone: formData.phone || null,
  chatToken,
});
```

**UPDATE with WHERE:**
```typescript
await db.update(leads).set({ status }).where(eq(leads.id, id));
```

**DELETE with WHERE:**
```typescript
await db.delete(leads).where(eq(leads.id, id));
```

**Imports required:**
```typescript
import { db } from "@/db";
import { leads, messages } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
```

---

## Rule 3: TypeScript in Server Actions

Server actions have typed parameters and typed return shapes:

```typescript
// Explicit parameter object type
export async function submitInquiry(formData: {
  name: string;
  phone: string;
  message?: string;
  voiceNote?: string | null;
}): Promise<{ success: boolean; chatToken: string | null }> {
  // ...
  return { success: true, chatToken };
}
```

Status unions are typed:
```typescript
export async function updateLeadStatus(id: number, status: "new" | "contacted" | "archived") { ... }
```

Return early with a typed failure shape on error:
```typescript
try {
  await db.insert(leads).values({ ... });
} catch (error) {
  console.error("[leads] DB insert failed:", error);
  return { success: false, chatToken: null };
}
```

---

## Rule 4: `useLang()` Hook Usage in Every Component

Every component that renders user-visible text calls `useLang()` at the top:

```typescript
import { useLang } from "@/lib/language-context";

export default function MyComponent() {
  const { t } = useLang();  // or: const { lang, toggle, t } = useLang();

  return <h2>{t.section.title}</h2>;
}
```

**Never hardcode user-visible strings in components.** The only exception is the chat page (`ChatPage.tsx`), which is Arabic-only by design and contains hardcoded Arabic strings inline.

**Never use `t` from one language key for the wrong section.** The `t` object is structured by section (`t.nav`, `t.hero`, `t.portfolio`, `t.pricing`, `t.services`, `t.howItWorks`, `t.startProject`, `t.chat`, `t.footer`). Match the key to the component.

---

## Rule 5: Framer Motion Variant Patterns

### Rotating Words (Hero pattern)

```typescript
<AnimatePresence mode="wait">
  <motion.span
    key={wordIdx}
    initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
    transition={{ duration: 0.45 }}
  >
    {words[wordIdx]}
  </motion.span>
</AnimatePresence>
```

`mode="wait"` ensures the exit animation completes before the enter animation starts.

### Stagger Pattern (section cards)

```typescript
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// Usage
<motion.div
  variants={containerVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-80px" }}
>
  {items.map((item) => (
    <motion.div key={item.id} variants={itemVariants}>
      {/* card content */}
    </motion.div>
  ))}
</motion.div>
```

`viewport={{ once: true }}` ensures the animation only fires once when the section enters the viewport. `margin: "-80px"` triggers it slightly before the element reaches the visible area.

### Simple State Transitions (StartProject pattern)

```typescript
<AnimatePresence mode="wait">
  {recordState === "idle" && (
    <motion.div
      key="idle"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
    >
      {/* idle state UI */}
    </motion.div>
  )}
  {recordState === "recording" && (
    <motion.div key="recording" ...>
      {/* recording state UI */}
    </motion.div>
  )}
</AnimatePresence>
```

Each state gets a unique `key` so AnimatePresence can track enter/exit.

---

## Rule 6: Client vs Server Components

**Default to server components.** A component is a server component unless it explicitly needs:
- Event handlers (`onClick`, `onChange`, `onSubmit`)
- Browser APIs (`localStorage`, `sessionStorage`, `navigator`, `MediaRecorder`)
- React hooks (`useState`, `useEffect`, `useRef`, `useContext`)
- Framer Motion (which uses browser animation APIs)

**Components that are client components** (have `"use client"` at the top):
- `Navbar.tsx` — scroll listener, menu state, language toggle
- `Hero.tsx` — rotating word state + Framer Motion
- `TechStack.tsx` — (uses CSS animation, but also `useLang`)
- `Portfolio.tsx` — tab state, scroll snap
- `HireCTA.tsx`, `Services.tsx`, `Pricing.tsx`, `HowItWorks.tsx` — Framer Motion
- `StartProject.tsx` — form state, MediaRecorder, file reading
- `Footer.tsx`, `FloatingWhatsApp.tsx`, `BottomNav.tsx` — interactive
- `admin/page.tsx` — full interactive dashboard
- `app/m/[token]/ChatPage.tsx` — polling, form state

**Server components** (no `"use client"`):
- `app/layout.tsx` — wraps with LanguageProvider
- `app/page.tsx` — assembles sections
- `app/m/[token]/page.tsx` — awaits params, passes to ChatPage

---

## Rule 7: Static Data Goes in `lib/data.ts`

Portfolio projects, services, and pricing tiers are static — they do not come from the database. They are exported from `lib/data.ts` as typed arrays and imported directly by components.

```typescript
// lib/data.ts
export const projects: Project[] = [ ... ];
export const services: ServiceItem[] = [ ... ];
export const pricing: PricingTier[] = [ ... ];
```

**Do not fetch static content from the database.** If content needs editing, edit `data.ts` and redeploy.

---

## Rule 8: All UI Text Goes in `lib/translations.ts`

The translations file is the single source of truth for every user-visible string. Structure:

```typescript
export const translations = {
  ar: {
    dir: "rtl" as const,
    lang: "ar",
    nav: { ... },
    hero: { ... },
    portfolio: { ... },
    services: { ... },
    pricing: { ... },
    howItWorks: { ... },
    startProject: { ... },
    chat: { ... },
    footer: { ... },
  },
  en: {
    dir: "ltr" as const,
    lang: "en",
    // same keys
  }
};
```

**When adding new text:** always add the key to both `ar` and `en` before using it in a component. TypeScript will catch mismatches because `T = (typeof translations)[Lang]` must satisfy both language shapes.

---

## Rule 9: Component File Structure

Each component file follows this order:

1. `"use client"` directive (if needed)
2. Imports: React hooks, Framer Motion, lucide-react, local imports (`@/lib/...`, `@/app/actions/...`)
3. Type definitions local to the component
4. Helper functions and constants (e.g., `WAVE_CONFIG`, `formatTime`)
5. `export default function ComponentName()`
6. Hook calls at the top of the function body
7. Event handlers
8. Early return for loading/error states
9. Main JSX return

---

## Rule 10: Error Handling in Actions

Wrap database calls in `try/catch` and return a typed failure shape:

```typescript
try {
  await db.insert(messages).values({ ... });
  return { success: true };
} catch {
  return { error: "Failed" };
}
```

For actions used in fire-and-forget patterns (like `updateLeadStatus`, `deleteLead`), no return value is needed — the error is surfaced by the calling component's UI state.

Log errors to console with a bracketed prefix: `console.error("[leads] DB insert failed:", error)`.
