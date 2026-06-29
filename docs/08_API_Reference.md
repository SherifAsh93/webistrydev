# 08 — API Reference (Server Actions)

There are no API route files in this project (`app/api/` does not exist). All database operations are Next.js Server Actions in `app/actions/`. This document describes every action as the public backend interface of the application.

---

## `submitInquiry`

**File**: `app/actions/submit-inquiry.ts`

**Signature**:
```typescript
async function submitInquiry(formData: {
  name: string;
  phone: string;
  message?: string;
  voiceNote?: string | null;
}): Promise<{ success: boolean; chatToken: string | null }>
```

**Called by**: `components/StartProject.tsx` on form submit

**Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Lead's display name |
| `phone` | `string` | Yes | Phone number (any format, stored as-is) |
| `message` | `string` | No | Text message from textarea |
| `voiceNote` | `string \| null` | No | Base64 data URL from MediaRecorder blob |

**Database operation**: `db.insert(leads).values({ name, phone, message, voiceNote, chatToken })`

**Side effects**:
- Generates a UUID v4 via `randomUUID()` before the insert
- `chatToken` column gets the generated UUID (UNIQUE constraint)
- All other legacy fields (`email`, `projectType`, `reference`, `budget`) are left null

**Return values**:

| Scenario | Return |
|----------|--------|
| Insert succeeds | `{ success: true, chatToken: "<uuid>" }` |
| Insert fails (DB error) | `{ success: false, chatToken: null }` |

**Caller behavior**: `StartProject.tsx` checks `result.chatToken` and displays a success screen with the chat URL `https://webistrydev.com/m/{chatToken}`.

---

## `getLeads`

**File**: `app/actions/get-leads.ts`

**Signature**:
```typescript
async function getLeads(): Promise<Lead[]>
```

**Called by**: `app/admin/page.tsx` on mount and on Refresh button click

**Parameters**: None

**Database operation**: `db.select().from(leads).orderBy(desc(leads.createdAt))`

**Return value**: Array of all lead rows, ordered newest-first. Returns `[]` on error.

**Notes**: Fetches all columns including `voiceNote` (base64 string). For large numbers of leads with voice notes, this response can be large. Consider pagination if lead volume grows significantly.

---

## `updateLeadStatus`

**File**: `app/actions/update-lead.ts`

**Signature**:
```typescript
async function updateLeadStatus(
  id: number,
  status: "new" | "contacted" | "archived"
): Promise<void>
```

**Called by**: `app/admin/page.tsx` in `handleStatusChange()`

**Parameters**:

| Param | Type | Description |
|-------|------|-------------|
| `id` | `number` | Lead primary key |
| `status` | `"new" \| "contacted" \| "archived"` | New status value |

**Database operation**: `db.update(leads).set({ status }).where(eq(leads.id, id))`

**Return value**: `void` (no return)

**Side effects**: None. The calling component applies an optimistic update to local state after the action resolves.

---

## `deleteLead`

**File**: `app/actions/delete-lead.ts`

**Signature**:
```typescript
async function deleteLead(id: number): Promise<void>
```

**Called by**: `app/admin/page.tsx` in `handleDelete()`, after a `confirm()` dialog

**Parameters**:

| Param | Type | Description |
|-------|------|-------------|
| `id` | `number` | Lead primary key |

**Database operation**: `db.delete(leads).where(eq(leads.id, id))`

**Cascade effect**: All `messages` rows with `lead_id = id` are deleted by Postgres `ON DELETE CASCADE`. The action itself only deletes the lead row.

**Return value**: `void`

---

## `getMessagesByToken`

**File**: `app/actions/get-messages.ts`

**Signature**:
```typescript
async function getMessagesByToken(
  token: string
): Promise<{ lead: { id: number; name: string }; messages: Message[] } | null>
```

**Called by**: `app/m/[token]/ChatPage.tsx` on mount and every 5 seconds via `setInterval`

**Parameters**:

| Param | Type | Description |
|-------|------|-------------|
| `token` | `string` | The UUID chat token from the URL |

**Database operations** (two sequential queries):
1. `db.select({ id: leads.id, name: leads.name }).from(leads).where(eq(leads.chatToken, token))`
2. `db.select().from(messages).where(eq(messages.leadId, lead.id)).orderBy(asc(messages.createdAt))`

**Return values**:

| Scenario | Return |
|----------|--------|
| Token matches a lead | `{ lead: { id, name }, messages: [...] }` |
| Token not found | `null` |
| DB error | `null` |

**Caller behavior**: `ChatPage.tsx` checks `if (!result)` → sets `notFound = true` → renders Arabic invalid-link screen.

---

## `getMessagesByLeadId`

**File**: `app/actions/get-messages.ts`

**Signature**:
```typescript
async function getMessagesByLeadId(leadId: number): Promise<Message[]>
```

**Called by**: `app/admin/page.tsx` in `loadChat(leadId)`, triggered when a lead card is expanded and after sending a reply

**Parameters**:

| Param | Type | Description |
|-------|------|-------------|
| `leadId` | `number` | Lead primary key |

**Database operation**: `db.select().from(messages).where(eq(messages.leadId, leadId)).orderBy(asc(messages.createdAt))`

**Return value**: Array of message rows ordered oldest-first. Returns `[]` on error.

---

## `sendClientMessage`

**File**: `app/actions/send-message.ts`

**Signature**:
```typescript
async function sendClientMessage(
  token: string,
  body: string
): Promise<{ success: true } | { error: string }>
```

**Called by**: `app/m/[token]/ChatPage.tsx` in `handleSend()`

**Parameters**:

| Param | Type | Description |
|-------|------|-------------|
| `token` | `string` | UUID chat token (from URL, not lead ID) |
| `body` | `string` | Message text |

**Database operations** (two sequential):
1. `db.select({ id: leads.id }).from(leads).where(eq(leads.chatToken, token))` — resolve token to leadId
2. `db.insert(messages).values({ leadId: lead.id, sender: "client", body })`

**Return values**:

| Scenario | Return |
|----------|--------|
| Insert succeeds | `{ success: true }` |
| Token not found | `{ error: "Invalid token" }` |
| DB error | `{ error: "Failed" }` |

**Security note**: The token is re-resolved on every message send. A client cannot send a message to another lead's thread by guessing an integer ID — they must have the valid token.

---

## `sendAdminMessage`

**File**: `app/actions/send-message.ts`

**Signature**:
```typescript
async function sendAdminMessage(
  leadId: number,
  body: string
): Promise<{ success: true } | { error: string }>
```

**Called by**: `app/admin/page.tsx` in `handleAdminReply()`

**Parameters**:

| Param | Type | Description |
|-------|------|-------------|
| `leadId` | `number` | Lead primary key (admin already knows the ID) |
| `body` | `string` | Reply text |

**Database operation**: `db.insert(messages).values({ leadId, sender: "admin", body })`

**Return values**:

| Scenario | Return |
|----------|--------|
| Insert succeeds | `{ success: true }` |
| DB error | `{ error: "Failed" }` |

---

## End-to-End Inquiry Submission Flow

This is the complete flow from user interaction to database record to chat URL:

```
1. User opens webistrydev.com
   └─ Scrolls to #start-project

2. StartProject.tsx (client component)
   ├─ (voice) User clicks mic button
   │     ├─ startRecording()
   │     │     └─ navigator.mediaDevices.getUserMedia({ audio: true })
   │     │     → MediaRecorder starts with audio/webm or audio/mp4
   │     │     → chunks accumulate in chunksRef.current
   │     └─ stopRecording() (manual or auto at 60s)
   │           → recorder.onstop fires
   │           → new Blob(chunks, { type: mimeType })
   │           → setAudioBlob(blob), setAudioUrl(URL.createObjectURL(blob))
   │           → recordState = "recorded"
   └─ (text) User toggles textarea, types message

3. User enters name + phone → clicks Submit

4. handleSubmit(e)
   ├─ e.preventDefault()
   ├─ Validation: name.trim(), phone.trim(), (audioBlob || textMessage.trim())
   ├─ setFormStatus("sending")
   ├─ (if voice) voiceNote = await blobToDataUrl(audioBlob)
   │         → FileReader.readAsDataURL() → "data:audio/webm;base64,..."
   └─ result = await submitInquiry({ name, phone, message, voiceNote })

5. submitInquiry() [server action — runs on server]
   ├─ chatToken = randomUUID()
   ├─ db.insert(leads).values({ name, phone, message, voiceNote, chatToken })
   └─ return { success: true, chatToken }

6. Back in StartProject.tsx
   ├─ setChatToken(result.chatToken)
   └─ setFormStatus("success")

7. Success screen renders
   ├─ Shows: "https://webistrydev.com/m/{chatToken}"
   ├─ Copy button → navigator.clipboard.writeText(chatUrl)
   └─ Open chat button → opens /m/{chatToken} in new tab

8. /m/{chatToken} (ChatPage.tsx)
   ├─ getMessagesByToken(token) → finds lead, loads messages
   ├─ setInterval(load, 5000)   → polls for new admin replies
   └─ sendClientMessage(token, body) → on each client message
```
