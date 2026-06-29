# 06 — Backend Patterns

## Why No API Routes

This codebase has no `app/api/` directory. All backend logic uses Next.js Server Actions (`"use server"`). See `04_Coding_Standards.md` Rule 1 and `02_Architecture.md` for rationale. The short version: server actions give type-safe direct function calls from client components, no `fetch()` boilerplate, and simpler deployment.

---

## Server Actions Architecture

All action files live in `app/actions/`. Each file has `"use server"` at the top, which tells Next.js to bundle the file for server-only execution and creates serialized remote procedure call endpoints automatically.

### File Inventory

| File | Exported functions |
|------|--------------------|
| `submit-inquiry.ts` | `submitInquiry` |
| `get-leads.ts` | `getLeads` |
| `update-lead.ts` | `updateLeadStatus` |
| `delete-lead.ts` | `deleteLead` |
| `get-messages.ts` | `getMessagesByToken`, `getMessagesByLeadId` |
| `send-message.ts` | `sendClientMessage`, `sendAdminMessage` |
| `index.ts` | Legacy `submitLead` — early prototype, not used in production UI |

---

## `submitInquiry` — Lead Creation with Token

```typescript
// app/actions/submit-inquiry.ts
"use server";
import { randomUUID } from "crypto";

export async function submitInquiry(formData: {
  name: string;
  phone: string;
  message?: string;
  voiceNote?: string | null;
}): Promise<{ success: boolean; chatToken: string | null }> {
  const chatToken = randomUUID();  // Node.js crypto, UUID v4

  try {
    await db.insert(leads).values({
      name: formData.name,
      phone: formData.phone || null,
      message: formData.message || null,
      voiceNote: formData.voiceNote || null,
      chatToken,
    });
  } catch (error) {
    console.error("[leads] DB insert failed:", error);
    return { success: false, chatToken: null };
  }

  return { success: true, chatToken };
}
```

**Key behaviors:**
- `randomUUID()` from Node's built-in `crypto` module — no library needed.
- The token is generated before the insert so that it can be returned even if the insert unexpectedly fails (though in the failure path, `chatToken: null` is returned).
- `voiceNote` is stored as a full base64 data URL string (see Voice Note Storage below).
- The `chatToken` column has a `UNIQUE` constraint in the schema — UUID collision is astronomically unlikely but the constraint provides a safety net.

---

## `getLeads` — Lead List for Admin

```typescript
export async function getLeads() {
  try {
    const rows = await db.select().from(leads).orderBy(desc(leads.createdAt));
    return rows;
  } catch {
    return [];
  }
}
```

Returns all leads ordered newest-first. On error returns an empty array (admin sees empty state, not a crash).

---

## `updateLeadStatus` — Status Tracking

```typescript
export async function updateLeadStatus(id: number, status: "new" | "contacted" | "archived") {
  await db.update(leads).set({ status }).where(eq(leads.id, id));
}
```

The three status values are the full set. The admin dashboard does an optimistic UI update in parallel:

```typescript
await updateLeadStatus(id, status);
setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
```

---

## `deleteLead` — Cascade Delete

```typescript
export async function deleteLead(id: number) {
  await db.delete(leads).where(eq(leads.id, id));
}
```

This is a single delete on the `leads` table. The schema defines:

```typescript
leadId: integer("lead_id")
  .references(() => leads.id, { onDelete: "cascade" })
  .notNull()
```

So all messages belonging to the deleted lead are automatically deleted by Postgres. No application-level cleanup code is needed.

---

## `getMessagesByToken` — Chat Loading (Client Route)

```typescript
export async function getMessagesByToken(token: string) {
  try {
    const [lead] = await db
      .select({ id: leads.id, name: leads.name })
      .from(leads)
      .where(eq(leads.chatToken, token));

    if (!lead) return null;

    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.leadId, lead.id))
      .orderBy(asc(messages.createdAt));

    return { lead, messages: msgs };
  } catch {
    return null;
  }
}
```

Two sequential queries: first find the lead by token, then fetch its messages. Returns `null` on bad token (chat page shows Arabic "invalid link" screen) or on DB error.

Messages ordered `asc(messages.createdAt)` — oldest first, so the chat thread reads top-to-bottom chronologically.

---

## `getMessagesByLeadId` — Chat Loading (Admin Route)

```typescript
export async function getMessagesByLeadId(leadId: number) {
  try {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.leadId, leadId))
      .orderBy(asc(messages.createdAt));
  } catch {
    return [];
  }
}
```

Admin side knows the `leadId` directly (no token resolution needed). Also ordered oldest-first.

---

## `sendClientMessage` — Message from Chat Page

```typescript
export async function sendClientMessage(token: string, body: string) {
  try {
    const [lead] = await db
      .select({ id: leads.id })
      .from(leads)
      .where(eq(leads.chatToken, token));

    if (!lead) return { error: "Invalid token" };

    await db.insert(messages).values({ leadId: lead.id, sender: "client", body });
    return { success: true };
  } catch {
    return { error: "Failed" };
  }
}
```

Token is resolved on every send — this prevents a client from sending messages to another lead's thread by guessing an ID. The `sender` field is hardcoded to `"client"`.

---

## `sendAdminMessage` — Reply from Admin Dashboard

```typescript
export async function sendAdminMessage(leadId: number, body: string) {
  try {
    await db.insert(messages).values({ leadId, sender: "admin", body });
    return { success: true };
  } catch {
    return { error: "Failed" };
  }
}
```

Admin side already has the `leadId`, so no token resolution. The `sender` field is hardcoded to `"admin"`.

---

## Voice Note Storage as Base64

Voice notes are not stored as files on disk or in object storage (S3, Cloudinary, etc.). They are stored as base64 data URLs in the `voice_note` text column of the `leads` table.

### Encoding Pipeline

```
navigator.mediaDevices.getUserMedia()
    ↓
MediaRecorder API
    ↓  chunks accumulated in useRef
Blob ({ type: "audio/webm;codecs=opus" or "audio/mp4" })
    ↓
FileReader.readAsDataURL(blob)
    ↓
"data:audio/webm;codecs=opus;base64,AAAA..."  (string)
    ↓
submitInquiry({ voiceNote: dataUrl })
    ↓
db.insert(leads).values({ voiceNote: dataUrl })
```

### Decoding / Playback

In the admin dashboard, the stored data URL is passed directly to an `<audio>` element:

```typescript
<audio controls src={lead.voiceNote} className="w-full rounded-xl h-10" />
```

The browser can play `data:audio/...;base64,...` URLs natively. No decoding step needed.

### Mime Type Fallback

```typescript
const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
  ? "audio/webm;codecs=opus"
  : MediaRecorder.isTypeSupported("audio/webm")
  ? "audio/webm"
  : "audio/mp4";
```

Desktop Chrome/Firefox support `audio/webm;codecs=opus`. Safari uses `audio/mp4`. The fallback chain handles both.

### Size Considerations

A 60-second voice note at typical MediaRecorder bitrates produces approximately 500–900 KB of binary data. As a base64 string this is roughly 700 KB–1.2 MB. Neon's text columns have no practical length limit for this use case, but very long recordings will slow down the `getLeads()` response since voice notes are fetched with every lead. This is acceptable for low-volume personal use.

---

## Chat Token Generation

```typescript
import { randomUUID } from "crypto";
const chatToken = randomUUID();
```

`randomUUID()` from Node's built-in `crypto` module generates a UUID v4 string (e.g., `"550e8400-e29b-41d4-a716-446655440000"`). It is cryptographically random. No external library is needed.

The token is stored in the `chat_token` column (max 64 chars, UNIQUE constraint). UUID v4 is 36 characters.

---

## 5-Second Polling Implementation

`ChatPage.tsx` polls `getMessagesByToken` every 5 seconds:

```typescript
useEffect(() => {
  load();                              // immediate first load
  const t = setInterval(load, 5000);  // then every 5 seconds
  return () => clearInterval(t);       // cleanup on unmount
}, []);
```

The interval reference uses the variable name `t` (shadowing the `t` translation object — a minor naming collision to be aware of). The cleanup function prevents memory leaks when the page is closed.

After sending a message, the client calls `load()` immediately in addition to waiting for the next poll interval:

```typescript
await sendClientMessage(token, body);
await load();  // immediate refresh so user sees their own message
```

---

## Admin Reply System

The admin dashboard does not poll. It loads messages once when a lead card is expanded:

```typescript
useEffect(() => {
  if (expanded !== null) loadChat(expanded);
}, [expanded]);
```

After sending a reply, it reloads the thread:

```typescript
async function handleAdminReply(leadId: number) {
  const body = (chatInput[leadId] || "").trim();
  if (!body) return;
  setChatSending(leadId);
  setChatInput((prev) => ({ ...prev, [leadId]: "" }));
  await sendAdminMessage(leadId, body);
  await loadChat(leadId);
  setChatSending(null);
}
```

The input is cleared optimistically before the network request completes. The thread refreshes after the send completes.

**Enter key support:**

```typescript
onKeyDown={(e) => e.key === "Enter" && handleAdminReply(lead.id)}
```

---

## Lead Status Tracking

Status values in the schema: `varchar("status", { length: 20 }).notNull().default("new")`

Three valid values:

| Status | Meaning |
|--------|---------|
| `"new"` | Default on creation — shown with green left border in admin |
| `"contacted"` | Admin has responded or reached out |
| `"archived"` | Lead is closed / not pursuing |

The admin dashboard shows filter tabs for each status and a count badge. Status can be changed via buttons in the expanded lead card. Changing status does an optimistic local update immediately after the server action completes.
