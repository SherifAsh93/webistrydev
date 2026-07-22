# Webistrydev — Portfolio & Lead Generation Site

Sherif's freelance portfolio. Collects client inquiries, stores them in Neon PostgreSQL, and sends instant notifications via email (Resend) and Telegram.

**Live:** https://www.webistrydev.com  
**Admin panel:** https://www.webistrydev.com/admin (password: `114891`)  
**GitHub:** https://github.com/SherifAsh93/webistrydev  
**Stack:** Next.js 16 · TypeScript · Tailwind CSS 4 · Neon PostgreSQL · Drizzle ORM · Resend · Telegram Bot API  
**Deploy:** VPS + PM2 (port 3001)

---

## Environment Variables

All vars go in `.env.local` on the VPS:

```env
DATABASE_URL=...          # Neon PostgreSQL connection string
RESEND_API_KEY=...        # Email notifications (resend.com)
TELEGRAM_BOT_TOKEN=...    # Telegram bot token (from @BotFather)
TELEGRAM_CHAT_ID=...      # Your Telegram chat/user ID
```

---

## Telegram Notification Setup

When a customer submits the contact form, a Telegram message is sent instantly with their name, phone, message, and a direct link to the admin panel.

### Step 1 — Create a bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Choose a name (e.g. `Webistry Leads`) and username (e.g. `WebistryLeadsBot`)
4. BotFather replies with your **bot token** — looks like `7123456789:AAHdqTcvCH1vGWJxfSeofSPs0MkLPhnDHpg`

### Step 2 — Get your chat ID

1. Search for your new bot on Telegram and send it any message (e.g. `hi`)
2. Open this URL in your browser (replace `TOKEN` with your bot token):
   ```
   https://api.telegram.org/botTOKEN/getUpdates
   ```
3. Find `"chat":{"id":` in the response — that number is your **chat ID**

### Step 3 — Add to environment

```bash
echo "TELEGRAM_BOT_TOKEN=your_token_here" >> /home/sherif/sites/webistrydev/.env.local
echo "TELEGRAM_CHAT_ID=your_chat_id_here" >> /home/sherif/sites/webistrydev/.env.local
```

Then rebuild and restart:

```bash
cd /home/sherif/sites/webistrydev
npm run build
pm2 restart webistrydev
```

---

## Email Notification Setup (Resend)

1. Sign up free at https://resend.com (100 emails/day, no credit card)
2. Create an API key
3. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_...
   ```
4. Rebuild and restart PM2

---

## Local Development

```bash
cd /home/sherif/sites/webistrydev
npm install
cp .env.local.example .env.local   # fill in DATABASE_URL at minimum
npm run dev
```

---

## Deploy

```bash
npm run build
pm2 restart webistrydev
```

---

## Admin Panel

Visit `/admin` and enter password `114891`.

- View all leads (new / contacted / archived)
- Chat with clients via their private link (`/m/[token]`)
- WhatsApp / call shortcuts per lead
- Auto-refreshes every 30 seconds with browser push notification when a new lead arrives
