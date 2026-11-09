'use strict';
const fs = require('fs');
const path = require('path');

function parseEnv(file, keys) {
  const out = {};
  let txt;
  try { txt = fs.readFileSync(file, 'utf8'); } catch { return out; }
  for (const k of keys) {
    const m = txt.match(new RegExp('^' + k + '=(.*)$', 'm'));
    if (m) out[k] = m[1].trim();
  }
  return out;
}

function log(line) {
  console.log('[' + new Date().toISOString() + '] ' + line);
}

async function tgSend(token, chatId, text) {
  const r = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
  const j = await r.json().catch(() => ({}));
  if (!j.ok) throw new Error('telegram sendMessage failed: ' + (j.description || r.status));
  return j;
}

async function graph(pathAndQuery) {
  const r = await fetch('https://graph.facebook.com/v21.0' + pathAndQuery);
  const j = await r.json().catch(() => ({}));
  if (j.error) throw new Error('graph ' + j.error.code + ' ' + String(j.error.message || '').slice(0, 150));
  return j;
}

// Ephemeral Telegram cleanup (owner, 21 Oct 2026): status REPORTS are deleted from the
// chat once seen (default TTL 1h). Action-required alerts (new PM, failures) are never queued.
const CLEANUP_FILE = path.join(__dirname, 'tg-cleanup.json');
const CLEANUP_TTL_MIN = 60;
const CLEANUP_MAX_AGE_MS = 48 * 3600 * 1000; // Telegram's own delete window — give up after this

function loadCleanup() {
  try { const v = JSON.parse(fs.readFileSync(CLEANUP_FILE, 'utf8')); return Array.isArray(v) ? v : []; } catch { return []; }
}

function saveCleanup(entries) {
  const tmp = CLEANUP_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(entries, null, 2) + '\n');
  fs.renameSync(tmp, CLEANUP_FILE);
}

// Call after tgSend() for a report message. Ignores dry-runs / missing ids.
function queueEphemeral(chatId, messageId, ttlMin) {
  if (!chatId || !messageId) return;
  const entries = loadCleanup();
  entries.push({ chatId: String(chatId), messageId: String(messageId), dueAt: Date.now() + (ttlMin || CLEANUP_TTL_MIN) * 60000 });
  saveCleanup(entries);
}

// Deletes due ephemeral messages. Returns count deleted. Never throws.
async function runCleanup(token) {
  if (!token) return 0;
  const entries = loadCleanup();
  if (!entries.length) return 0;
  const now = Date.now();
  const keep = [];
  let deleted = 0;
  for (const e of entries) {
    if (now < e.dueAt) { keep.push(e); continue; }
    if (now - e.dueAt > CLEANUP_MAX_AGE_MS) continue; // unfixable — stop retrying
    try {
      const r = await fetch('https://api.telegram.org/bot' + token + '/deleteMessage', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: e.chatId, message_id: Number(e.messageId) }),
      });
      const j = await r.json().catch(() => ({}));
      if (j.ok) { deleted++; continue; }
      // "message to delete not found" = already gone; anything else retries until max age
      if (/message to delete not found|message can't be deleted/i.test(String(j.description || ''))) continue;
      keep.push(e);
    } catch { keep.push(e); }
  }
  if (keep.length !== entries.length) saveCleanup(keep);
  if (deleted) log('ephemeral cleanup: deleted ' + deleted + ' report message(s), ' + keep.length + ' pending');
  return deleted;
}

module.exports = { parseEnv, log, tgSend, graph, queueEphemeral, runCleanup };
