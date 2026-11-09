#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(ROOT, '..', '..');
const PAGE_ID = '1126001733940519';
const GRAPH = 'https://graph.facebook.com/v21.0';
const DEFAULT_LINK = 'https://www.webistrydev.com/start';
const ENV_FILE = path.join(ROOT, '.env.facebook');
const REPO_ENV = path.join(REPO, '.env.local');
const QUEUE_FILE = path.join(ROOT, 'queue.json');
const STATE_FILE = path.join(ROOT, 'state.json');
const LOCK_FILE = path.join(ROOT, '.publisher.lock');
const ALERT_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const CAIRO_WINDOW_HOUR = 20;
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' };

const redact = (s) => String(s)
  .replace(/access_token=[^&\s"']+/gi, 'access_token=[redacted]')
  .replace(/EAAB[A-Za-z0-9]+/g, '[redacted]');
const errText = (e) => redact(e?.stack || e?.message || String(e));
const makeLogger = (sink) => (...args) => {
  const line = `[${new Date().toISOString()}] ${args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')}`;
  if (Array.isArray(sink)) sink.push(redact(line));
  else console.log(redact(line));
};

function parseEnvFile(p) {
  const out = {};
  let text;
  try { text = fs.readFileSync(p, 'utf8'); } catch { return out; }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (v) out[m[1]] = v;
  }
  return out;
}

function cairoHourMinute(d = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(d);
  const get = (t) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { hour: get('hour'), minute: get('minute') };
}

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function writeJson(p, data) {
  const tmp = `${p}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
  fs.renameSync(tmp, p);
}

function classify(res, body) {
  const code = body?.error?.code;
  const type = body?.error?.type;
  if (res.status === 401 || code === 190 || type === 'OAuthException') return 'token';
  if (res.status >= 500 || body?.error?.is_transient === true) return 'server';
  return 'client';
}

async function graphCall(url, opts, deps) {
  const { fetchImpl, retries, backoffMs, sleep } = deps;
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      deps.log(`retry ${attempt}/${retries} after ${backoffMs * 2 ** (attempt - 1)}ms backoff`);
      await sleep(backoffMs * 2 ** (attempt - 1));
    }
    let res;
    try {
      res = await fetchImpl(url, opts);
    } catch (e) {
      lastErr = { kind: 'network', message: errText(e) };
      continue;
    }
    let body = null;
    try { body = await res.json(); } catch { body = null; }
    if (res.ok && body && !body.error) return body;
    const kind = classify(res, body);
    if (kind === 'token') {
      const err = new Error(`Page token rejected: HTTP ${res.status}, Graph code ${body?.error?.code ?? 'n/a'}, type ${body?.error?.type ?? 'n/a'}`);
      err.fatal = 'token';
      throw err;
    }
    lastErr = { kind, status: res.status, message: body?.error?.message || `HTTP ${res.status}` };
    if (kind === 'client') break;
  }
  const err = new Error(lastErr.message);
  err.kind = lastErr.kind;
  err.status = lastErr.status;
  throw err;
}

async function sendTokenAlert(state, deps) {
  const { botToken, chatId, fetchImpl, log } = deps;
  const prev = state.alerts?.tokenInvalid;
  if (prev && Date.now() - Date.parse(prev.at) < ALERT_COOLDOWN_MS) {
    log(`token-invalid alert already sent at ${prev.at}; suppressed (one alert per ${ALERT_COOLDOWN_MS / 3600000}h)`);
    return 'suppressed';
  }
  const text = 'WebistryDev Facebook publisher — CRITICAL: Page access token rejected (401/190). Auto-posting stopped. Fix PAGE_ACCESS_TOKEN in facebook/publisher/.env.facebook, then rerun.';
  state.alerts = { ...(state.alerts || {}) };
  if (!botToken || !chatId) {
    log('telegram not configured; critical alert logged only:', text);
    state.alerts.tokenInvalid = { at: new Date().toISOString(), delivered: 'log-only' };
    return 'log-only';
  }
  try {
    const res = await fetchImpl(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json();
    if (!res.ok || data.ok !== true) throw new Error(`telegram HTTP ${res.status}`);
    state.alerts.tokenInvalid = { at: new Date().toISOString(), delivered: 'telegram', messageId: data.result.message_id };
    log('critical telegram alert delivered (message id redacted from log detail)');
    return 'telegram';
  } catch (e) {
    state.alerts.tokenInvalid = { at: new Date().toISOString(), delivered: 'telegram-failed' };
    log('telegram alert delivery failed:', errText(e));
    return 'telegram-failed';
  }
}

function buildCaption(item) {
  return `${item.lines.join('\n')}\n\n${item.link || DEFAULT_LINK}`;
}

async function run(opts = {}) {
  const deps = {
    fetchImpl: opts.fetchImpl || globalThis.fetch,
    sleep: opts.sleep || ((ms) => new Promise((r) => setTimeout(r, ms))),
    retries: opts.retries ?? 2,
    backoffMs: opts.backoffMs ?? 2000,
    statePath: opts.statePath || STATE_FILE,
    queuePath: opts.queuePath || QUEUE_FILE,
    log: opts.logger || makeLogger(opts.sink || null),
    enforceWindow: Boolean(opts.enforceWindow),
  };

  const fileEnv = opts.fileEnv || parseEnvFile(ENV_FILE);
  const repoEnv = opts.repoEnv || parseEnvFile(REPO_ENV);
  const env = opts.env || process.env;
  const token = env.PAGE_ACCESS_TOKEN || fileEnv.PAGE_ACCESS_TOKEN || '';
  const botToken = env.TELEGRAM_BOT_TOKEN || fileEnv.TELEGRAM_BOT_TOKEN || repoEnv.TELEGRAM_BOT_TOKEN || '';
  const chatId = env.TELEGRAM_CHAT_ID || fileEnv.TELEGRAM_CHAT_ID || repoEnv.TELEGRAM_CHAT_ID || '';
  Object.assign(deps, { botToken, chatId });

  const queue = readJson(deps.queuePath);
  if (!queue?.items?.length) {
    deps.log(`queue file missing or empty at ${deps.queuePath}; nothing to do`);
    return { mode: 'noop', reason: 'queue-empty' };
  }
  let state = readJson(deps.statePath);
  if (!state) state = { version: 1, published: [], alerts: {} };
  if (!Array.isArray(state.published)) state.published = [];

  if (deps.enforceWindow) {
    const { hour } = cairoHourMinute();
    if (hour !== CAIRO_WINDOW_HOUR) {
      deps.log(`outside 20:00-20:59 Africa/Cairo window (Cairo hour ${hour}); skipped`);
      return { mode: 'skip', reason: 'outside-window', hour };
    }
  }

  const publishedIds = new Set(state.published.map((p) => p.queueId));
  const next = queue.items.find((i) => !publishedIds.has(i.id));
  if (!next) {
    deps.log(`queue fully published (${state.published.length} posts); nothing to do`);
    return { mode: 'noop', reason: 'queue-exhausted', publishedCount: state.published.length };
  }

  const slot = state.published.length + 1;
  const mediaAbs = path.isAbsolute(next.media) ? next.media : path.join(REPO, next.media);
  const caption = buildCaption(next);
  deps.log(`next queue slot ${slot}: id=${next.id} lang=${next.lang} media=${mediaAbs}`);

  if (!token) {
    deps.log('mode=dry-run (no PAGE_ACCESS_TOKEN in .env.facebook) — posting nothing');
    deps.log(`[dry-run] would publish slot ${slot} (queue id ${next.id}, lang ${next.lang}):`);
    for (const line of next.lines) deps.log(`[dry-run]   ${line}`);
    deps.log(`[dry-run]   ${next.link || DEFAULT_LINK}`);
    deps.log(`[dry-run] media: ${mediaAbs} (exists=${fs.existsSync(mediaAbs)})`);
    deps.log('[dry-run] state unchanged; no Graph API call made');
    return { mode: 'dry-run', slot, queueId: next.id, media: mediaAbs, caption, link: next.link || DEFAULT_LINK };
  }

  if (!fs.existsSync(mediaAbs)) {
    deps.log(`ERROR: media file not found: ${mediaAbs}; nothing published, state unchanged`);
    return { mode: 'error', reason: 'media-missing', media: mediaAbs };
  }

  const form = new FormData();
  const buf = fs.readFileSync(mediaAbs);
  const ext = path.extname(mediaAbs).toLowerCase();
  form.append('source', new File([buf], path.basename(mediaAbs), { type: MIME[ext] || 'application/octet-stream' }));
  form.append('message', caption);
  form.append('access_token', token);
  const photosUrl = `${GRAPH}/${PAGE_ID}/photos`;

  deps.log(`publishing slot ${slot} (queue id ${next.id}) via POST /${PAGE_ID}/photos ...`);
  let postId;
  try {
    const body = await graphCall(photosUrl, { method: 'POST', body: form, signal: AbortSignal.timeout(60000) }, deps);
    postId = body?.id;
    if (!postId) throw new Error('Graph returned no post id');
  } catch (e) {
    if (e.fatal === 'token') {
      deps.log(`FATAL: ${e.message}`);
      await sendTokenAlert(state, deps);
      writeJson(deps.statePath, state);
      return { mode: 'error', reason: 'token-invalid', message: e.message };
    }
    deps.log(`publish failed (no retry beyond policy): ${e.message}; state unchanged — rerun will retry this slot`);
    return { mode: 'error', reason: 'publish-failed', message: e.message };
  }

  let permalink = null;
  let verified = false;
  try {
    const fetched = await graphCall(`${GRAPH}/${postId}?fields=id,permalink_url&access_token=${encodeURIComponent(token)}`, { method: 'GET', signal: AbortSignal.timeout(30000) }, { ...deps, retries: 1 });
    permalink = fetched?.permalink_url || null;
    verified = Boolean(fetched?.id && permalink);
  } catch (e) {
    deps.log(`WARNING: published post ${postId} but fetch-back verification failed: ${e.message}`);
  }

  const entry = {
    queueId: next.id,
    slot,
    postId,
    permalink,
    verified,
    publishedAt: new Date().toISOString(),
    lang: next.lang,
    media: next.media,
  };
  state.published.push(entry);
  writeJson(deps.statePath, state);
  if (verified) deps.log(`PUBLISHED slot ${slot}: post id ${postId} · permalink ${permalink}`);
  else deps.log(`PUBLISHED slot ${slot}: post id ${postId} (permalink unverified — recorded so it is never re-posted)`);
  return { mode: 'published', slot, queueId: next.id, postId, permalink, verified };
}

async function withLock(fn) {
  let handle;
  try {
    handle = fs.openSync(LOCK_FILE, 'wx');
  } catch (e) {
    if (e.code === 'EEXIST') {
      const stat = fs.statSync(LOCK_FILE);
      if (Date.now() - stat.mtimeMs < 10 * 60 * 1000) return { mode: 'noop', reason: 'locked' };
      fs.unlinkSync(LOCK_FILE);
      handle = fs.openSync(LOCK_FILE, 'wx');
    } else throw e;
  }
  try {
    return await fn();
  } finally {
    fs.closeSync(handle);
    fs.unlinkSync(LOCK_FILE);
  }
}

async function selftest() {
  const results = [];
  const assert = (name, cond, detail = '') => {
    results.push({ name, pass: Boolean(cond), detail });
    console.log(`${cond ? 'PASS' : 'FAIL'} — ${name}${detail ? ` (${detail})` : ''}`);
  };
  const tmpDir = path.join(ROOT, '.selftest');
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });
  const sink = [];
  const base = { sink, retries: 2, backoffMs: 1, sleep: async () => {}, fileEnv: {}, repoEnv: {}, env: {} };

  {
    let calls = 0;
    const r = await run({ ...base, statePath: path.join(tmpDir, 'state-dry.json'), fetchImpl: async () => { calls++; throw new Error('must not be called'); } });
    assert('no token -> dry-run, zero Graph calls', r.mode === 'dry-run' && calls === 0 && r.slot === 1);
    assert('dry-run leaves state file untouched', !fs.existsSync(path.join(tmpDir, 'state-dry.json')));
  }

  {
    let photoCalls = 0;
    const fetchImpl = async (url) => {
      if (url.includes('/photos')) {
        photoCalls++;
        return { ok: true, status: 200, json: async () => ({ id: `PAGE_${100 + photoCalls}` }) };
      }
      const id = String(url).split('/').pop().split('?')[0];
      return { ok: true, status: 200, json: async () => ({ id, permalink_url: `https://www.facebook.com/WebistryDev/posts/${id}` }) };
    };
    const statePath = path.join(tmpDir, 'state-pub.json');
    const r1 = await run({ ...base, statePath, fetchImpl, env: { PAGE_ACCESS_TOKEN: 'test-token-not-real' } });
    const r2 = await run({ ...base, statePath, fetchImpl, env: { PAGE_ACCESS_TOKEN: 'test-token-not-real' } });
    const st = readJson(statePath);
    assert('mock publish records post id + permalink', r1.mode === 'published' && r1.postId === 'PAGE_101' && r1.verified === true);
    assert('rerun never re-posts slot 1: advances to slot 2 only', r1.slot === 1 && r2.slot === 2 && r2.queueId !== r1.queueId && st.published.length === 2);
    assert('each queue id published at most once', st.published.map((p) => p.queueId).length === new Set(st.published.map((p) => p.queueId)).size);
    const full = { version: 1, alerts: {}, published: (readJson(QUEUE_FILE)?.items || []).map((i, n) => ({ queueId: i.id, slot: n + 1, postId: `P${i.id}`, permalink: 'x', verified: true })) };
    writeJson(statePath, full);
    const photoCallsBefore = photoCalls;
    const r3 = await run({ ...base, statePath, fetchImpl, env: { PAGE_ACCESS_TOKEN: 'test-token-not-real' } });
    assert('fully published queue -> noop, zero Graph calls', r3.mode === 'noop' && r3.reason === 'queue-exhausted' && photoCalls === photoCallsBefore);
  }

  {
    let calls = 0;
    const fetchImpl = async () => {
      calls++;
      return { ok: false, status: 401, json: async () => ({ error: { message: 'Error validating access token', type: 'OAuthException', code: 190 } }) };
    };
    const statePath = path.join(tmpDir, 'state-token.json');
    const r1 = await run({ ...base, statePath, fetchImpl, env: { PAGE_ACCESS_TOKEN: 'expired-token' } });
    const r2 = await run({ ...base, statePath, fetchImpl, env: { PAGE_ACCESS_TOKEN: 'expired-token' } });
    const st = readJson(statePath);
    assert('401/190: no retry, single Graph call per run', calls === 2, `2 runs -> ${calls} calls`);
    assert('401/190: fatal token error surfaced', r1.reason === 'token-invalid' && r2.reason === 'token-invalid');
    assert('401/190: one alert logged, second run suppressed', st.alerts?.tokenInvalid?.delivered === 'log-only' && sink.some((l) => l.includes('suppressed')));
    assert('401/190: nothing recorded as published', st.published.length === 0);
  }

  {
    let calls = 0;
    const fetchImpl = async (url) => {
      if (url.includes('/photos')) {
        calls++;
        if (calls < 3) return { ok: false, status: 500, json: async () => ({ error: { message: 'transient', is_transient: true } }) };
        return { ok: true, status: 200, json: async () => ({ id: 'PAGE_333' }) };
      }
      return { ok: true, status: 200, json: async () => ({ id: 'PAGE_333', permalink_url: 'https://www.facebook.com/WebistryDev/posts/333' }) };
    };
    const r = await run({ ...base, statePath: path.join(tmpDir, 'state-5xx.json'), fetchImpl, env: { PAGE_ACCESS_TOKEN: 't' } });
    assert('5xx: retries twice with backoff then succeeds', r.mode === 'published' && calls === 3, `calls=${calls}`);
  }

  {
    let calls = 0;
    const fetchImpl = async () => {
      calls++;
      return { ok: false, status: 400, json: async () => ({ error: { message: '(#100) invalid param', code: 100 } }) };
    };
    const statePath = path.join(tmpDir, 'state-4xx.json');
    const r = await run({ ...base, statePath, fetchImpl, env: { PAGE_ACCESS_TOKEN: 't' } });
    const st = readJson(statePath) || { published: [] };
    assert('4xx client error: no retry, no publish, no token alert', calls === 1 && r.mode === 'error' && !st.alerts?.tokenInvalid, `calls=${calls}`);
  }

  fs.rmSync(tmpDir, { recursive: true, force: true });
  const failed = results.filter((r) => !r.pass);
  console.log(`selftest: ${results.length - failed.length}/${results.length} passed`);
  return failed.length === 0 ? 0 : 1;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) {
    process.exit(await selftest());
  }
  const enforceWindow = args.includes('--window');
  const result = await withLock(() => run({ enforceWindow }));
  if (result.mode === 'error') process.exitCode = 1;
}

main().catch((e) => {
  console.error(`[${new Date().toISOString()}] publisher crashed: ${errText(e)}`);
  process.exitCode = 2;
});
