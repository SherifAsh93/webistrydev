# 02 — Architecture

## Single-Page Architecture with Anchor Navigation

The entire public marketing surface lives at `/`. There are no separate `/portfolio`, `/services`, or `/pricing` routes. Navigation links are anchor links that scroll the page:

```
#portfolio   → <Portfolio />
#services    → <Services />
#pricing     → <Pricing />
#how-it-works → <HowItWorks />
#start-project → <StartProject />
```

`Navbar.tsx` builds its link array from the translation object (`t.nav.portfolio`, etc.), so the labels change with the language but the anchors are always static English IDs. `BottomNav.tsx` independently does scroll-spy by querying these same section IDs on `scroll` events.

This is a deliberate choice for a freelance portfolio: there are no subpages to SEO-rank individually, and having a single URL means sharing the page always lands at the top, where the full pitch plays out in sequence.

---

## Lead Capture Data Flow

```
Visitor fills StartProject.tsx form
    │
    ├─ (voice path) MediaRecorder → Blob → FileReader.readAsDataURL()
    │                                          → base64 data URL string
    │
    └─ (text path) plain textarea value
    │
    ↓
submitInquiry({ name, phone, message?, voiceNote? })  [server action]
    │
    ├─ randomUUID()  →  chatToken (UUID v4 string)
    │
    ├─ db.insert(leads).values({ name, phone, message, voiceNote, chatToken })
    │
    └─ return { success: true, chatToken }
    │
    ↓
StartProject.tsx receives chatToken
    │
    ├─ formStatus set to "success"
    │
    └─ Shows success screen with:
           • chat URL:  https://webistrydev.com/m/{chatToken}
           • Copy link button
           • "Open chat" button (target="_blank")
```

The client never needs to register or log in. The UUID token is the only credential. If a client loses the URL, they cannot retrieve it — they must contact Sherif directly.

---

## Chat Architecture

### Why 5-Second Polling (Not WebSocket)

`ChatPage.tsx` polls on a 5-second interval:

```typescript
useEffect(() => {
  load();
  const t = setInterval(load, 5000);
  return () => clearInterval(t);
}, []);
```

Each `load()` call invokes `getMessagesByToken(token)` — a server action that makes two sequential Neon HTTP requests (find lead by token, then fetch messages ordered by `createdAt ASC`).

**Why this is acceptable for this use case:**
- Chat sessions are asynchronous by design. Sherif replies when available, not in real time.
- Neon's serverless HTTP driver has no persistent connection to maintain — a WebSocket would require a separate infrastructure layer (e.g., Pusher, Ably, or a custom Socket.io server).
- The portfolio runs on a single VPS + PM2 process; adding stateful WebSocket handling would complicate deployment.
- Client chat sessions are short and infrequent (one per lead, not concurrent real-time users).

The 5-second lag is unnoticeable in an async support-style conversation.

### Chat State Flow

```
ChatPage mounts
    │
    ├─ load() → getMessagesByToken(token)
    │       ├─ Not found: setNotFound(true) → shows Arabic error screen
    │       └─ Found: setClientName(lead.name), setMsgs(messages), setLoaded(true)
    │
    ├─ setInterval(load, 5000)  [polling]
    │
    └─ On new message sent:
           sendClientMessage(token, body)  [server action]
               ├─ Resolves leadId from token
               └─ db.insert(messages).values({ leadId, sender: "client", body })
           → load() called again to refresh
```

---

## Admin Dashboard Flow

```
/admin page loads
    │
    ├─ useEffect: check sessionStorage["wc-admin"] === "114891"
    │       ├─ Match: setAuthed(true), load()
    │       └─ No match: show password form
    │
    ↓
load() → getLeads()
    │
    └─ db.select().from(leads).orderBy(desc(leads.createdAt))
       → setLeads(rows)
    │
    ↓
Admin clicks a lead card (expand)
    │
    └─ useEffect on [expanded] → loadChat(leadId)
           → getMessagesByLeadId(leadId)
           → setChatMsgs({ [leadId]: messages })
    │
    ↓
Admin types reply, presses Enter or Send
    │
    └─ handleAdminReply(leadId)
           → sendAdminMessage(leadId, body)
               → db.insert(messages).values({ leadId, sender: "admin", body })
           → loadChat(leadId)  [refresh thread]
    │
    ↓
Admin changes status
    │
    └─ handleStatusChange(id, status)
           → updateLeadStatus(id, status)
               → db.update(leads).set({ status }).where(eq(leads.id, id))
           → optimistic update: setLeads(prev.map(...))
```

The admin dashboard never polls — it refreshes only on explicit user action (expand, reply, Refresh button). This is intentional: the admin is the active party who decides when to look.

---

## Bilingual System Architecture

### Detection Order

```
1. localStorage.getItem('lang')   →  'en' | 'ar' | null
        ↓ (if null)
2. navigator.languages[0]         →  check .startsWith('ar')
        ↓ (if not Arabic)
3. Default: 'en'
```

This logic runs in two places:

**A. Blocking inline script in `app/layout.tsx`** — runs synchronously before React hydrates, sets `document.documentElement.dir` and `lang` attributes immediately. This prevents a flash of LTR layout for Arabic users, because the browser applies CSS `[dir="rtl"]` rules before painting:

```html
<script dangerouslySetInnerHTML={{ __html: langDetectScript }} />
```

**B. `LanguageProvider` in `lib/language-context.tsx`** — runs after hydration using `useState` lazy initializer:

```typescript
const [lang, setLang] = useState<Lang>(() => {
  if (typeof window === "undefined") return "en";
  return detectLang();
});
```

This keeps the runtime React state in sync with the DOM attributes.

### Context Shape

```typescript
type LangCtx = { lang: Lang; toggle: () => void; t: T }
```

Every component that needs text calls `const { t } = useLang()` and reads from `t` (the full translation object for the current language). No string is hardcoded in a component — they all go through `t`.

### Toggle Flow

```
User clicks language button in Navbar
    │
    └─ toggle()
           ├─ Computes next: 'en' → 'ar' or 'ar' → 'en'
           ├─ document.documentElement.lang = next
           ├─ document.documentElement.dir = translations[next].dir
           ├─ localStorage.setItem('lang', next)
           └─ setLang(next)  →  re-render with new t object
```

### Font Switching

`layout.tsx` loads both fonts at build time:

- `Plus_Jakarta_Sans` with `--font-plus-jakarta` CSS variable
- `Cairo` (Arabic + Latin subsets) with `--font-cairo` CSS variable

The global CSS rule `[dir="rtl"] { font-family: var(--font-cairo), sans-serif; }` activates Cairo automatically when the document direction switches to RTL. No JavaScript font-loading code is needed.

---

## Why Server Actions Instead of API Routes

This project has **no files under `app/api/`**. All database operations use Next.js Server Actions (`"use server"` directive).

Reasons:

1. **Colocation**: Each action file is a focused single-responsibility module. `submit-inquiry.ts` is the canonical place to read when you want to understand what happens on form submission.
2. **No manual fetch**: Client components (`StartProject.tsx`, `ChatPage.tsx`, `admin/page.tsx`) call action functions directly — no `fetch('/api/...')`, no manual JSON parsing, no error-status handling.
3. **Type safety end-to-end**: The action function signature is TypeScript. The caller and the implementation share types without a schema-generation step.
4. **Simpler deployment**: No route handlers to configure. PM2 starts `next start` and everything is handled by the Next.js runtime.

The only trade-off is that server actions cannot be called from outside the Next.js app (e.g., from a mobile app or a third-party webhook). For a personal portfolio this is not a requirement.

---

## Why Drizzle Over Prisma

Drizzle ORM is used rather than Prisma for the following concrete reasons:

1. **HTTP driver alignment**: Neon provides a serverless HTTP driver (`@neondatabase/serverless`). Drizzle has a first-class `neon-http` adapter. Prisma's serverless support requires the Prisma Accelerate proxy service or a different driver configuration.
2. **No separate migration files**: `drizzle-kit push` applies schema changes directly to the database without generating migration SQL files. For a personal project with infrequent schema changes, migration file management is unnecessary overhead.
3. **Explicit query builders**: Drizzle queries are plain TypeScript expressions (`db.select().from(leads).where(eq(...))`) rather than Prisma's abstracted `prisma.leads.findMany({ where: { ... } })`. The SQL shape is visible in the code without reading documentation.
4. **Smaller bundle**: Drizzle is lighter than Prisma, which matters for serverless/edge cold start times.
