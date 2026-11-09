'use strict';
const fs = require('fs');
const path = require('path');
const { parseEnv, log, tgSend, graph, runCleanup } = require('./util');

const PUB = path.resolve(__dirname, '..');
const REPO = path.resolve(PUB, '..', '..');
const PAGE_ID = '1126001733940519';
const STATE_FILE = path.join(__dirname, 'state.json');
const DRY = process.argv.includes('--dry-run');

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return null; }
}

function saveState(state) {
  const tmp = STATE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2) + '\n');
  fs.renameSync(tmp, STATE_FILE);
}

function openLink(c) {
  return 'https://www.facebook.com' + (c.link || '');
}

async function main() {
  const fb = parseEnv(path.join(PUB, '.env.facebook'), ['PAGE_ACCESS_TOKEN']);
  const local = parseEnv(path.join(REPO, '.env.local'), ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']);
  if (!fb.PAGE_ACCESS_TOKEN) throw new Error('PAGE_ACCESS_TOKEN missing in .env.facebook');
  if (!DRY && (!local.TELEGRAM_BOT_TOKEN || !local.TELEGRAM_CHAT_ID)) throw new Error('TELEGRAM_* missing in .env.local');

  // Owner rule (21 Oct): purge ephemeral status reports from the chat once seen (TTL 1h).
  // Runs every poll; never throws into the main poll path.
  if (!DRY) { try { await runCleanup(local.TELEGRAM_BOT_TOKEN); } catch (ce) { log('cleanup error (ignored): ' + ce.message); } }

  const convs = (await graph(`/${PAGE_ID}/conversations?fields=id,updated_time,message_count,link&limit=50&access_token=${encodeURIComponent(fb.PAGE_ACCESS_TOKEN)}`)).data || [];

  let state = loadState();
  if (!state) {
    // First run records the existing threads silently so only activity after setup alerts.
    state = { seededAt: new Date().toISOString(), lastRun: null, conversations: {} };
    for (const c of convs) state.conversations[c.id] = { mc: c.message_count, upd: c.updated_time, link: c.link || null };
    state.lastRun = new Date().toISOString();
    saveState(state);
    log('baseline seeded: ' + convs.length + ' thread(s), no alerts sent');
    return;
  }

  const alerts = [];
  for (const c of convs) {
    const prev = state.conversations[c.id];
    if (!prev) {
      alerts.push(`WebistryDev PM — new conversation\nMessages: ${c.message_count}\nOpen: ${openLink(c)}`);
      state.conversations[c.id] = { mc: c.message_count, upd: c.updated_time, link: c.link || null };
    } else {
      if (c.message_count > prev.mc) {
        alerts.push(`WebistryDev PM — message activity\nThread now ${c.message_count} messages (was ${prev.mc}), updated ${c.updated_time}\nOpen: ${openLink(c)}`);
      }
      prev.mc = c.message_count;
      prev.upd = c.updated_time;
      if (c.link) prev.link = c.link;
    }
  }
  state.lastRun = new Date().toISOString();
  saveState(state);

  for (const a of alerts) {
    if (DRY) { log('[dry-run] would send:\n' + a); continue; }
    await tgSend(local.TELEGRAM_BOT_TOKEN, local.TELEGRAM_CHAT_ID, a);
    log('alert sent: ' + a.split('\n')[0]);
  }
  if (!alerts.length) log('no changes (' + convs.length + ' thread(s))');
}

main().catch(e => {
  console.error('[' + new Date().toISOString() + '] ERROR ' + e.message);
  process.exit(1);
});
