'use strict';
const fs = require('fs');
const path = require('path');
const { parseEnv, log, tgSend, graph, queueEphemeral } = require('./util');

const PUB = path.resolve(__dirname, '..');
const REPO = path.resolve(PUB, '..', '..');
const PAGE_ID = '1126001733940519';
const MODE = String(process.argv[2] || '').toLowerCase();
const DRY = process.argv.includes('--dry-run');

if (MODE !== 'daily' && MODE !== 'weekly') {
  console.error('usage: report.js daily|weekly [--dry-run]');
  process.exit(2);
}

const WINDOW_H = MODE === 'daily' ? 24 : 168;
const WINDOW_LABEL = MODE === 'daily' ? '24h' : '7d';
const since = new Date(Date.now() - WINDOW_H * 3600 * 1000);

function fmtLead(l) {
  const name = String(l.name || 'Unnamed').replace(/\s+/g, ' ').trim().slice(0, 40);
  const kind = String(l.project_type || '—').replace(/\s+/g, ' ').slice(0, 24);
  const when = new Date(l.created_at).toISOString().slice(5, 16).replace('T', ' ');
  return `· ${name} — ${kind} (${when} UTC)`;
}

async function collect() {
  const local = parseEnv(path.join(REPO, '.env.local'), ['DATABASE_URL', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']);
  if (!local.DATABASE_URL) throw new Error('DATABASE_URL missing in .env.local');

  // leads (new in window + all-time)
  const mod = require(path.join(REPO, 'node_modules', '@neondatabase/serverless'));
  const sql = (mod.neon || mod.default.neon)(local.DATABASE_URL);
  const newLeads = await sql`select name, project_type, created_at from leads where created_at >= ${since.toISOString()} order by created_at desc limit 20`;
  const totalRow = await sql`select count(*)::int as n from leads`;

  // page metrics + PM threads (fields that actually work with the stored token)
  const fbTok = parseEnv(path.join(PUB, '.env.facebook'), ['PAGE_ACCESS_TOKEN']).PAGE_ACCESS_TOKEN;
  if (!fbTok) throw new Error('PAGE_ACCESS_TOKEN missing in .env.facebook');
  const page = await graph(`/${PAGE_ID}?fields=name,followers_count,fan_count,talking_about_count&access_token=${encodeURIComponent(fbTok)}`);
  const convs = (await graph(`/${PAGE_ID}/conversations?fields=id,updated_time&limit=50&access_token=${encodeURIComponent(fbTok)}`)).data || [];
  const active = convs.filter(c => new Date(c.updated_time) >= since).length;

  // posts published by the cron queue in window
  let pubInWin = 0, queueLeft = '—';
  try {
    const st = JSON.parse(fs.readFileSync(path.join(PUB, 'state.json'), 'utf8'));
    pubInWin = (st.published || []).filter(p => new Date(p.publishedAt) >= since).length;
    const queue = JSON.parse(fs.readFileSync(path.join(PUB, 'queue.json'), 'utf8'));
    const total = Array.isArray(queue) ? queue.length : (queue.items || []).length;
    queueLeft = Math.max(0, total - (st.published || []).length) + ' of ' + total;
  } catch { /* publisher state unreadable — report keeps '—' */ }

  return { local, newLeads, total: totalRow[0].n, page, convs: convs.length, active, pubInWin, queueLeft };
}

function compose(d) {
  const date = new Date().toISOString().slice(0, 10);
  const head = `WebistryDev ${MODE} report — ${date}`;
  const leadLine = `New leads (${WINDOW_LABEL}): ${d.newLeads.length} · all-time: ${d.total}`;
  const leadList = d.newLeads.slice(0, 8).map(fmtLead);
  const pageLine = `Page: ${d.page.followers_count} followers · ${d.page.fan_count} fans · ${d.page.talking_about_count} talking about`;
  const postLine = `Posts: ${d.pubInWin} published in ${WINDOW_LABEL} · ${d.queueLeft} queue left`;
  const pmLine = `Private messages: ${d.convs} thread(s) · ${d.active} active in ${WINDOW_LABEL}`;
  return [head, '', leadLine, ...leadList, pageLine, postLine, pmLine].join('\n');
}

async function main() {
  const data = await collect();
  const text = compose(data);
  if (DRY) { log('[dry-run] report:\n' + text); return; }
  const res = await tgSend(data.local.TELEGRAM_BOT_TOKEN, data.local.TELEGRAM_CHAT_ID, text);
  // Owner rule: status reports are ephemeral — auto-deleted from the chat 1h after sending.
  queueEphemeral(data.local.TELEGRAM_CHAT_ID, res && res.result && res.result.message_id);
  log('sent (' + MODE + ', auto-delete in 1h)');
}

main().catch(async e => {
  console.error('[' + new Date().toISOString() + '] ERROR ' + e.message);
  // A silently missing report is worse than a failure ping; notify unless dry-run or Telegram itself is broken.
  if (!DRY) {
    try {
      const local = parseEnv(path.join(REPO, '.env.local'), ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']);
      if (local.TELEGRAM_BOT_TOKEN && local.TELEGRAM_CHAT_ID) {
        await tgSend(local.TELEGRAM_BOT_TOKEN, local.TELEGRAM_CHAT_ID, `WebistryDev ${MODE} report FAILED\n${e.message.slice(0, 200)}`);
      }
    } catch (te) { console.error('[' + new Date().toISOString() + '] error-notify failed: ' + te.message); }
  }
  process.exit(1);
});
