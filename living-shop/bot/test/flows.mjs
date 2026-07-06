// End-to-end flow test for the Walk-in / Book fork. Stubs Telegram + feed via
// global fetch; blob is the in-memory stub (via loader.mjs). Drives synthetic
// Telegram updates through the real handler and asserts the message sequence
// + final req/ booking payload.
import { readFileSync } from 'node:fs';
import { _store } from '@vercel/blob';

process.env.WEBHOOK_SECRET = 't';
process.env.BOT_TOKEN = 'x';
process.env.QUEUE_CHAT = '0';

const FEED = JSON.parse(readFileSync(new URL('./feed-open.json', import.meta.url)));
const sent = [];
function jsonResp(x) { return { ok: true, status: 200, json: async () => (typeof x === 'string' ? JSON.parse(x) : x) }; }
globalThis.fetch = async (url, opts) => {
  url = String(url);
  if (url.startsWith('blob://')) { const p = url.slice(7); return jsonResp(_store.get(p) || 'null'); }
  if (url.includes('raw.githubusercontent')) return jsonResp(FEED);
  if (url.includes('api.telegram.org')) {
    const method = url.split('/').pop();
    const body = opts && opts.body ? JSON.parse(opts.body) : {};
    sent.push({ method, body });
    return jsonResp({ ok: true, result: { message_id: sent.length } });
  }
  return jsonResp({});
};

const handler = (await import('../api/webhook.js')).default;
// Fresh chat id per scenario — the bot rate-limits 8 msgs/min/chat, and the
// test fires far faster than any human would. (Not a product concern.)
let CHAT = 501;
function res() { return { _c: 200, status(c) { this._c = c; return this; }, send() { return this; }, json() { return this; }, end() { return this; } }; }
async function fire(update) {
  sent.length = 0;
  await handler({ method: 'POST', headers: { 'x-telegram-bot-api-secret-token': 't' }, body: update }, res());
  return sent.slice();
}
const msg = (text) => ({ message: { message_id: 1, chat: { id: CHAT }, text } });
const cb = (data) => ({ callback_query: { id: 'c', data, message: { message_id: 1, chat: { id: CHAT } }, from: { first_name: 'X' } } });
function cbs(out) { // all callback_datas across a batch of sendMessage
  return out.flatMap(m => (((m.body.reply_markup || {}).inline_keyboard) || []).flat().map(b => b.callback_data || ('url:' + (b.url || ''))));
}
function kbRows(out) {
  const m = out.find(x => x.body.reply_markup && x.body.reply_markup.keyboard);
  return m ? m.body.reply_markup.keyboard.flat().map(b => b.text) : null;
}
function texts(out) { return out.map(m => m.body.text || '').join(' ⏎ '); }

let fails = 0, n = 0;
function ok(cond, label) { n++; if (!cond) { fails++; console.log('  ✗ ' + label); } else console.log('  ✓ ' + label); }

console.log('\n— /start front door —');
CHAT = 501;
let o = await fire(msg('/start'));
ok(JSON.stringify(kbRows(o)) === JSON.stringify(['🚶 Walk-in', '📅 Book', '⏱ Wait time', "💈 Who's on", '🕐 Hours & parking', '↩️ Start over']), 'persistent keyboard leads with Walk-in / Book');

console.log('\n— WALK-IN flow —');
CHAT = 502;
o = await fire(msg('🚶 Walk-in'));
ok(/On walk-ins/.test(texts(o)), 'walk-in shows the on-walk-ins line');
const wbtn = cbs(o);
ok(wbtn.includes('wb:Bayli') && wbtn.includes('wb:Ben') && wbtn.includes('wb:any'), 'walk-in barbers = Bayli, Ben, Any (' + wbtn.join(',') + ')');
o = await fire(cb('wb:Bayli'));
ok(/What are we doing/.test(texts(o)), 'walk-in → service menu');
const wsvc = cbs(o).filter(c => c.startsWith('bk2:'));
ok(wsvc.length > 0, 'service chips present (' + wsvc.length + ')');
o = await fire(cb(wsvc[0]));
ok(/name and mobile/i.test(texts(o)) && /live queue/i.test(texts(o)), 'walk-in service → live-queue details prompt (no time step)');
o = await fire(msg('Jack Smith, 0400 123 456'));
ok(/Locking it in/i.test(texts(o)), 'details accepted → locking in');
const wreq = [..._store.keys()].filter(k => k.startsWith('req/'));
ok(wreq.length === 1, 'one req/ blob written');
const wpay = JSON.parse(_store.get(wreq[0]));
ok(wpay.shop === 'barber' && wpay.barber === 'Bayli' && wpay.slot === 'now' && wpay.name === 'Jack Smith' && wpay.phone === '0400123456', 'walk-in payload correct: ' + JSON.stringify({ shop: wpay.shop, barber: wpay.barber, slot: wpay.slot, phone: wpay.phone }));
_store.clear();

console.log('\n— BOOK (set time) flow —');
CHAT = 503;
o = await fire(msg('📅 Book'));
ok(/who with/i.test(texts(o)), 'book → who with');
const bbtn = cbs(o);
ok(bbtn.includes('bb:Jarred') && bbtn.includes('bb:Locky'), 'book barbers include Jarred + Locky (' + bbtn.join(',') + ')');
o = await fire(cb('bb:Locky'));
ok(/which day/i.test(texts(o)), "Locky → day picker (multi-day)");
const dbtn = cbs(o).filter(c => c.startsWith('bd:'));
ok(dbtn.length >= 2, 'multiple day chips (' + dbtn.length + ')');
o = await fire(cb(dbtn[0]));
ok(/What are we doing/.test(texts(o)), 'day → service menu');
const bsvc = cbs(o).filter(c => c.startsWith('bk2:'));
ok(bsvc.length > 0, 'bookings service chips present (' + bsvc.length + ')');
o = await fire(cb(bsvc[0]));
ok(/What time/i.test(texts(o)), 'service → time picker');
const tbtn = cbs(o).filter(c => c.startsWith('bk3:'));
ok(tbtn.length > 0, 'time chips present (' + tbtn.length + ')');
o = await fire(cb(tbtn[0]));
ok(/name and mobile/i.test(texts(o)), 'time → details prompt');
o = await fire(msg('Jane Doe, 0411 222 333'));
ok(/Locking it in/i.test(texts(o)), 'book details accepted');
const breq = [..._store.keys()].filter(k => k.startsWith('req/'));
const bpay = JSON.parse(_store.get(breq[0]));
const wantSlot = tbtn[0].slice(4);
ok(bpay.shop === 'bookings' && bpay.barber === 'Locky' && bpay.slot === wantSlot && /^\d{4}-\d{2}-\d{2}$/.test(bpay.date || ''), 'book payload correct: ' + JSON.stringify({ shop: bpay.shop, barber: bpay.barber, slot: bpay.slot, date: bpay.date }));
_store.clear();

console.log('\n— CLOSED walk-in → After Hours handoff —');
CHAT = 504;
FEED.open = false;
o = await fire(msg('🚶 Walk-in'));
const urls = o.flatMap(m => (((m.body.reply_markup || {}).inline_keyboard) || []).flat().map(b => b.url).filter(Boolean));
ok(urls.some(u => /t\.me\//.test(u)), 'closed walk-in offers the After Hours Telegram link');
FEED.open = true;

console.log('\n— typed "book" → fork —');
CHAT = 505;
o = await fire(msg('can i book'));
ok(cbs(o).includes('walk') && cbs(o).includes('book'), 'typed book intent shows the Walk-in/Book fork');

console.log('\n' + (fails ? '❌ ' + fails + '/' + n + ' FAILED' : '✅ ALL ' + n + ' PASSED'));
process.exit(fails ? 1 : 0);
