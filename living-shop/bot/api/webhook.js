/* Blacksmith wait-time bot — Phase 4 V1. Templates only, NO LLM.
   SECURITY MANIFEST (non-negotiable, see ../../STRATEGY-SPEC.md):
   This bot's entire universe is (1) the public PII-free queue.json,
   (2) the static copy below, (3) the sender's chat id for replying.
   It has NO SLIKR access, NO path to the Mac, NO connection to any
   other bot/bridge. Separate token, separate runtime, zero shared state. */

import { put, head, del } from '@vercel/blob';

const FEED = 'https://raw.githubusercontent.com/automaitions/blacksmith-queue-feed/main/queue.json';
const BOOK_URL = 'https://web.slikr.com.au/shop/421/res';
const PHONE = '0479 087 782';
const ADDRESS = '9 Gateway Drive, Biggera Waters — 1 min from Harbour Town';
// Closed-hours walk-ins hand off to the Blacksmith After Hours crew group —
// same destination the website chat uses, so both surfaces behave identically.
const AFTERHOURS_TG = 'https://t.me/+FdP08AnnO3swZmJl';
const STALE_MS = 8 * 60 * 1000;

// naive per-instance rate limit: 8 msgs / chat / minute
const hits = new Map();
function limited(chatId) {
  const now = Date.now();
  const arr = (hits.get(chatId) || []).filter(t => now - t < 60000);
  arr.push(now);
  hits.set(chatId, arr);
  if (hits.size > 5000) hits.clear(); // memory guard
  return arr.length > 8;
}

async function feed() {
  const r = await fetch(FEED + '?t=' + Math.floor(Date.now() / 30000), { cache: 'no-store' });
  return r.json();
}

function asOf(s) {
  const m = s.as_of.match(/T(\d{2}):(\d{2})/);
  if (!m) return '';
  let h = +m[1]; const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12;
  return `as of ${h}:${m[2]}${ap}`;
}
function freshEnough(s) {
  const d = new Date(s.as_of.replace(/(\d{2})(\d{2})$/, '$1:$2'));
  return !isNaN(d) && Date.now() - d.getTime() <= STALE_MS;
}
function fmtT(t) {
  if (!t) return 'soon';
  const p = t.trim().split(':'); const h = +p[0]; const ap = h >= 12 ? 'pm' : 'am';
  return (h % 12 || 12) + (p[1] && p[1] !== '00' ? ':' + p[1] : '') + ap;
}

const KEYBOARD = {
  inline_keyboard: [
    [{ text: '⏱ Wait time', callback_data: 'wait' }, { text: '💈 Who\'s on', callback_data: 'who' }],
    [{ text: '✂️ Book me in', callback_data: 'bk' }],
    [{ text: '🕐 Hours & parking', callback_data: 'hours' }]
  ]
};
// Persistent docked keyboard — always sits above the text box no matter how deep the
// chat is, so the customer can never get lost. Taps send the label as a normal message,
// which the classifier below already routes. "↩️ Start over" clears any half-finished flow.
// Front door leads with the Walk-in / Book fork (Beau 2026-07-06) — the two
// clean paths that mirror the website chat. Utility taps sit below.
const MENU_KB = {
  keyboard: [
    [{ text: '📅 Bookings' }, { text: '💈 Walk-in' }],
    [{ text: '⏱ Wait time' }, { text: '💈 Who\'s on' }],
    [{ text: '🕐 Hours & parking' }, { text: '↩️ Start over' }]
  ],
  resize_keyboard: true, is_persistent: true
};
// One escape phrase set — typing any of these (or tapping Start over) always bails you
// out of a wizard back to a clean menu, from ANY state (incl. force_reply prompts).
const ESCAPE_RE = /^\s*\/?(menu|start ?over|restart|home|back to start|nvm|never ?mind|exit|quit|stop)\s*$/i;
// tolerant test: strips a leading emoji/space (e.g. the "↩️ Start over" button label) then matches
function isEscape(x) { return ESCAPE_RE.test(String(x || '').replace(/^[^a-zA-Z/]+/, '')); }
async function sendMenu(token, chat, msg) {
  await clearState(chat);
  await tg(token, 'sendMessage', { chat_id: chat, text: msg || menuText(), reply_markup: MENU_KB, disable_web_page_preview: true });
}

async function getState(chat) {
  try {
    const m = await head(`state/${chat}.json`);
    return await (await fetch(m.downloadUrl)).json();
  } catch { return null; }
}
async function setState(chat, st) {
  await put(`state/${chat}.json`, JSON.stringify(st),
    { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
}
async function clearState(chat) {
  try { await del(`state/${chat}.json`); } catch {}
}

async function bkStart(token, chat) {
  const s = await feed().catch(() => null);
  if (!s) return;
  if (!s.open) {
    const names = Object.keys(s.slots_next || {}).filter(n => (s.slots_next[n] || []).length);
    if (names.length) await setState(chat, { step: 'barber', ahead: true, date: s.next_date });
    // Closed → hand the walk-in to the Blacksmith After Hours crew (mirrors the
    // website chat, Beau 2026-07-06). Book-ahead stays available below.
    const rows = [[{ text: '🚶 After-hours walk-in · message the crew', url: AFTERHOURS_TG }]];
    names.forEach(n => rows.push([{ text: '📅 Book ahead · ' + n, callback_data: 'bk1:' + n }]));
    const tail = names.length ? ` Or lock a set time ${s.next_label} with a barber below.` : '';
    await tg(token, 'sendMessage', { chat_id: chat, text: `We're closed right now — but you can still get on the list. Leave your walk-in with the Blacksmith After Hours crew and they'll sort you first thing when we open.${tail}`,
      reply_markup: { inline_keyboard: rows } });
    return;
  }
  await setState(chat, { step: 'barber' });
  const rows = s.barbers.map(b => [{ text: b.name.split(' ')[0], callback_data: 'bk1:' + b.name.split(' ')[0] }]);
  rows.push([{ text: 'Anyone', callback_data: 'bk1:any' }]);
  rows.push([{ text: '🌹 Blackrose Salon', callback_data: 'bks' }]);
  await tg(token, 'sendMessage', { chat_id: chat, text: 'Let’s get you booked. Who with?', reply_markup: { inline_keyboard: rows } });
}

async function bkSalon(token, chat) {
  const s = await feed().catch(() => null);
  if (!s) return;
  const sal = s.salon || {};
  let stylist = null, slots = [];
  for (const k of Object.keys(sal.slots || {})) {
    if ((sal.slots[k] || []).length) { stylist = k; slots = sal.slots[k]; break; }
  }
  if (!(sal.services || []).length || !stylist) {
    await tg(token, 'sendMessage', { chat_id: chat, text: `Blackrose's book is closed right now — call ${PHONE}, or book online: https://web.slikr.com.au/blackrosesalon` });
    return;
  }
  await setState(chat, { step: 'service', shop: 'salon', barber: stylist, date: sal.date, label: sal.label });
  await tg(token, 'sendMessage', { chat_id: chat, text: `🌹 Blackrose Salon — ${stylist} has times ${sal.label || 'today'}. What are we doing?`,
    reply_markup: { inline_keyboard: sal.services.map(m => [{ text: `${m.name} · $${m.cost}`, callback_data: 'bk2:' + m.id }]) } });
}

async function bkStep(token, chat, data) {
  const s = await feed().catch(() => null);
  if (!s) return clearState(chat);
  const st = (await getState(chat)) || {};
  if (data.startsWith('bk1:')) {
    const first = data.slice(4);
    const b = s.barbers.find(x => x.name.split(' ')[0] === first);
    st.barber = first === 'any' ? 'any' : (b ? b.name : first);
    st.shop = st.ahead ? 'bookings' : (b && (b.book || [])[0] === 'bookings' ? 'bookings' : 'barber');
    st.step = 'service';
    await setState(chat, st);
    const menu = (s.services && s.services[st.shop]) || [];
    await tg(token, 'sendMessage', { chat_id: chat, text: 'What are we doing?',
      reply_markup: { inline_keyboard: menu.map(m => [{ text: `${m.name} · $${m.cost}`, callback_data: 'bk2:' + m.id }]) } });
  } else if (data.startsWith('bk2:')) {
    st.service = parseInt(data.slice(4), 10);
    // Book-ahead (walk-in/book fork): the chosen day's own times ride in state,
    // so offer those directly — no slots_next lookup. (Beau 2026-07-06)
    if (st.times) {
      if (!st.times.length) { await tg(token, 'sendMessage', { chat_id: chat, text: `No times left ${st.label || 'then'} — pick another day or barber.` }); return clearState(chat); }
      st.step = 'slot';
      await setState(chat, st);
      await tg(token, 'sendMessage', { chat_id: chat, text: `What time ${st.label || 'then'}?`,
        reply_markup: { inline_keyboard: st.times.map(t => [{ text: fmtT(t), callback_data: 'bk3:' + t }]) } });
      return;
    }
    if (st.shop === 'salon') {
      const slots = ((s.salon || {}).slots || {})[st.barber] || [];
      if (!slots.length) { await tg(token, 'sendMessage', { chat_id: chat, text: `No salon times left — call ${PHONE}.` }); return clearState(chat); }
      st.step = 'slot';
      await setState(chat, st);
      await tg(token, 'sendMessage', { chat_id: chat, text: `What time ${st.label || 'today'}?`,
        reply_markup: { inline_keyboard: slots.map(t => [{ text: t, callback_data: 'bk3:' + t }]) } });
      return;
    }
    if (st.ahead) {
      const slots = (s.slots_next && s.slots_next[st.barber.split(' ')[0]]) || [];
      if (!slots.length) { await tg(token, 'sendMessage', { chat_id: chat, text: `No times left ${s.next_label} — try another barber.` }); return clearState(chat); }
      st.step = 'slot';
      await setState(chat, st);
      await tg(token, 'sendMessage', { chat_id: chat, text: `What time ${s.next_label}?`,
        reply_markup: { inline_keyboard: slots.map(t => [{ text: t, callback_data: 'bk3:' + t }]) } });
      return;
    }
    if (st.shop === 'bookings') {
      const b = s.barbers.find(x => x.name === st.barber);
      const slots = (b && b.slots) || [];
      if (!slots.length) {
        await tg(token, 'sendMessage', { chat_id: chat, text: `${st.barber} is booked out today — tap Book me in and pick someone else.`, reply_markup: KEYBOARD });
        return clearState(chat);
      }
      st.step = 'slot';
      await setState(chat, st);
      await tg(token, 'sendMessage', { chat_id: chat, text: 'What time today?',
        reply_markup: { inline_keyboard: slots.map(t => [{ text: t, callback_data: 'bk3:' + t }]) } });
    } else {
      st.slot = 'now'; st.step = 'details';
      await setState(chat, st);
      await tg(token, 'sendMessage', { chat_id: chat, text: `You'll join the live queue (~${s.wait_mins || 0} min). Last bit — reply with your name and mobile, like:\nJack Smith, 0400 123 456` });
    }
  } else if (data.startsWith('bk3:')) {
    st.slot = data.slice(4); st.step = 'details';
    await setState(chat, st);
    await tg(token, 'sendMessage', { chat_id: chat, text: 'Last bit — reply with your name and mobile, like:\nJack Smith, 0400 123 456' });
  }
}

async function bkDetails(token, chat, text) {
  const st = await getState(chat);
  if (!st || st.step !== 'details') return false;
  // escape hatch: commands/greetings break out of the details trap instead of looping
  if (text.trim().startsWith('/') || /\b(cancel|stop|restart|start over|menu|nvm|never ?mind|exit|quit|book|hi|hey|hello|help)\b/i.test(text)) {
    await clearState(chat);
    return false; // fall through to normal menu handling
  }
  const m = text.match(/^\s*([a-zA-Z][a-zA-Z '\-]{1,39}?)[,\s]+((?:04|\+?61 ?4)[\d ]{8,12})\s*$/);
  if (!m) {
    st.tries = (st.tries || 0) + 1;
    if (st.tries >= 2) {
      await clearState(chat);
      await tg(token, 'sendMessage', { chat_id: chat, text: 'No worries — cancelled that. Tap ✂️ Book me in whenever you’re ready.', reply_markup: KEYBOARD });
      return true;
    }
    await setState(chat, st);
    await tg(token, 'sendMessage', { chat_id: chat, text: 'Almost — send it like: Jack Smith, 0400 123 456' });
    return true;
  }
  const phone = m[2].replace(/\D/g, '').replace(/^61/, '0');
  const id = globalThis.crypto.randomUUID().toLowerCase();
  await put(`req/${id}.json`, JSON.stringify({
    service_id: st.service, shop: st.shop, barber: st.barber, slot: st.slot,
    date: st.date || undefined,
    name: m[1].trim(), phone, tg_chat: chat, at: new Date().toISOString()
  }), { access: 'public', addRandomSuffix: false, contentType: 'application/json' });
  await clearState(chat);
  await tg(token, 'sendMessage', { chat_id: chat, text: 'Locking it in… you’ll get a confirmation here in a few seconds.' });
  return true;
}

// ================= Walk-in / Book fork — mirrors the website shop-chat =========
// The front door: the customer always picks Walk-in (join the live queue) or
// Book (a set time), then continues exactly like the site chat. (Beau 2026-07-06)
async function sendFork(token, chat, greet) {
  await clearState(chat);
  await tg(token, 'sendMessage', { chat_id: chat, text: greet || 'Lock a time, or join the walk-in queue?',
    reply_markup: { inline_keyboard: [[
      { text: '📅 Bookings', callback_data: 'book' },
      { text: '💈 Walk-in', callback_data: 'walk' }
    ]] } });
}

// --- Walk-in: join the live queue with a walk-in barber (open only) ---
async function walkinStart(token, chat) {
  await clearState(chat);
  const s = await feed().catch(() => null);
  if (!s) return;
  if (!s.open) {
    // Closed → hand off to the Blacksmith After Hours crew (mirrors the website).
    await tg(token, 'sendMessage', { chat_id: chat,
      text: "We're closed right now — but you can still get on the list. Leave your walk-in with the Blacksmith After Hours crew and they'll sort you first thing when we open.",
      reply_markup: { inline_keyboard: [[{ text: '🚶 Blacksmith After Hours →', url: AFTERHOURS_TG }]] } });
    return;
  }
  const wb = (s.barbers || []).filter(b => b.walkin === true);
  if (!wb.length) {
    await tg(token, 'sendMessage', { chat_id: chat, text: `No barbers on walk-ins right now — tap 📅 Book to lock a time, or call ${PHONE}.` });
    return;
  }
  const rows = wb.map(b => [{ text: b.name.split(' ')[0], callback_data: 'wb:' + b.name.split(' ')[0] }]);
  rows.push([{ text: 'Any barber', callback_data: 'wb:any' }]);
  await tg(token, 'sendMessage', { chat_id: chat,
    text: `On walk-ins ${asOf(s)}: ${wb.map(b => b.name.split(' ')[0]).join(', ')}.\nWho would you like? I'll pop you in the live queue.`,
    reply_markup: { inline_keyboard: rows } });
}
async function walkinBarber(token, chat, first) {
  const s = await feed().catch(() => null);
  if (!s) return clearState(chat);
  const b = s.barbers.find(x => x.name.split(' ')[0] === first);
  await setState(chat, { flow: 'walk', shop: 'barber', barber: first === 'any' ? 'any' : (b ? b.name : first), slot: 'now', step: 'service' });
  const menu = (s.services && s.services.barber) || [];
  await tg(token, 'sendMessage', { chat_id: chat, text: 'What are we doing?',
    reply_markup: { inline_keyboard: menu.map(m => [{ text: `${m.name} · $${m.cost}`, callback_data: 'bk2:' + m.id }]) } });
}

// --- Book ahead: pick a barber, then any day they actually work, then time ---
export function dcode(iso) { return String(iso || '').replace(/-/g, '').slice(4); } // MMDD
export function bookSchedules(s) {
  // Invert book_days → each barber's own working days (mirrors the website).
  const byBarber = {}, order = [];
  (s.book_days || []).forEach(d => {
    Object.keys(d.barbers || {}).forEach(n => {
      if (!(d.barbers[n] || []).length) return;
      if (!byBarber[n]) { byBarber[n] = []; order.push(n); }
      byBarber[n].push({ code: dcode(d.date), date: d.date, label: d.label, times: d.barbers[n] });
    });
  });
  // Sami books off the Blackrose schedule but shows as just another barber.
  const sal = s.salon || {};
  let samiDays = (sal.days || []).map(d => {
    const k = Object.keys(d.slots || {}).find(x => /^sam/i.test(x) && (d.slots[x] || []).length);
    return k ? { code: dcode(d.date), date: d.date, label: d.label, times: d.slots[k], stylist: k } : null;
  }).filter(Boolean);
  if (!samiDays.length) {
    const lk = Object.keys(sal.slots || {}).find(x => /^sam/i.test(x) && (sal.slots[x] || []).length);
    if (lk) samiDays = [{ code: dcode(sal.date), date: sal.date, label: sal.label, times: sal.slots[lk], stylist: lk }];
  }
  return { byBarber, order, samiDays };
}
async function bookStart(token, chat) {
  await clearState(chat);
  const s = await feed().catch(() => null);
  if (!s) return;
  const { order, samiDays } = bookSchedules(s);
  if (!order.length && !samiDays.length) {
    await tg(token, 'sendMessage', { chat_id: chat, text: `Tomorrow's book isn't open yet — try again in the morning or call ${PHONE}.` });
    return;
  }
  const rows = order.map(n => [{ text: n.split(' ')[0], callback_data: 'bb:' + n.split(' ')[0] }]);
  if (samiDays.length) rows.push([{ text: 'Sami', callback_data: 'bb:Sami' }]);
  await tg(token, 'sendMessage', { chat_id: chat,
    text: s.open ? 'Book ahead — who with?' : "We're closed now — book ahead. Who with?",
    reply_markup: { inline_keyboard: rows } });
}
async function bookBarber(token, chat, first) {
  const s = await feed().catch(() => null);
  if (!s) return clearState(chat);
  const { byBarber, samiDays } = bookSchedules(s);
  if (first === 'Sami') {
    if (!samiDays.length) { await tg(token, 'sendMessage', { chat_id: chat, text: `Sami's book is closed right now — call ${PHONE}.` }); return; }
    return bookOfferDays(token, chat, { shop: 'salon', barber: samiDays[0].stylist || 'Sami', name: 'Sami', days: samiDays });
  }
  const key = Object.keys(byBarber).find(k => k.split(' ')[0] === first);
  const days = key ? byBarber[key] : [];
  if (!days.length) { await tg(token, 'sendMessage', { chat_id: chat, text: `${first}'s book isn't open yet — try the morning or call ${PHONE}.` }); return; }
  return bookOfferDays(token, chat, { shop: 'bookings', barber: key, name: first, days });
}
async function bookOfferDays(token, chat, ctx) {
  if (ctx.days.length === 1) return bookDayPicked(token, chat, ctx, ctx.days[0]);
  await setState(chat, { flow: 'book', shop: ctx.shop, barber: ctx.barber, name: ctx.name, days: ctx.days });
  await tg(token, 'sendMessage', { chat_id: chat, text: `${ctx.name.split(' ')[0]}'s schedule — which day?`,
    reply_markup: { inline_keyboard: ctx.days.map(d => [{ text: d.label, callback_data: 'bd:' + d.code }]) } });
}
async function bookDay(token, chat, code) {
  const st = await getState(chat);
  if (!st || st.flow !== 'book' || !st.days) return;
  const day = st.days.find(d => d.code === code) || st.days[0];
  if (!day) return;
  return bookDayPicked(token, chat, st, day);
}
async function bookDayPicked(token, chat, ctx, day) {
  const s = await feed().catch(() => null);
  if (!s) return clearState(chat);
  await setState(chat, { flow: 'book', step: 'service', shop: ctx.shop, barber: ctx.barber,
    date: day.date, label: day.label, times: day.times, ahead: true });
  const menu = ctx.shop === 'salon' ? ((s.salon || {}).services || []) : ((s.services && s.services.bookings) || []);
  if (!menu.length) { await tg(token, 'sendMessage', { chat_id: chat, text: `Menu's offline for a moment — call ${PHONE}.` }); return clearState(chat); }
  await tg(token, 'sendMessage', { chat_id: chat, text: 'What are we doing?',
    reply_markup: { inline_keyboard: menu.map(m => [{ text: `${m.name} · $${m.cost}`, callback_data: 'bk2:' + m.id }]) } });
}

// ---- "Join tomorrow's walk-in queue" — STATELESS. The chosen service rides
//      Telegram's own reply chain (force_reply → the customer's reply comes back
//      with reply_to_message = our prompt), so there is NO server state to read
//      stale. Posts a card to QUEUE_CHAT for Bayli. (Winston 2026-07-03) ----
const WQ_MARK = "on tomorrow's walk-in list"; // unique phrase in the prompt = our marker
async function wqMenu() {
  const s = await feed().catch(() => null);
  return (s && s.services && s.services.barber && s.services.barber.length) ? s.services.barber : [];
}
async function wqStart(token, chat) {
  const menu = await wqMenu();
  if (!menu.length) { await tg(token, 'sendMessage', { chat_id: chat, text: `Our menu's offline for a moment — try again shortly, or call ${PHONE}.` }); return; }
  await tg(token, 'sendMessage', { chat_id: chat, text: "Tomorrow's walk-in list 🚶 — what are you after?",
    reply_markup: { inline_keyboard: menu.map(m => [{ text: m.cost ? `${m.name} · $${m.cost}` : m.name, callback_data: 'wqs:' + m.id }]) } });
}
// Dates offered: Tomorrow + next 6 days (shop's open every day). code = MMDD.
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function wqDates() {
  const out = [], base = Date.now();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(base + i * 86400000);
    const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    out.push({ iso, code: String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'),
      label: i === 1 ? 'Tomorrow' : `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}` });
  }
  return out;
}
// Half-hourly slots for a date, using that day's real hours from feed.week.
async function wqDayTimes(iso) {
  const s = await feed().catch(() => null);
  const dow = DOW[new Date(iso + 'T12:00:00').getDay()];
  let start = '09:00', close = '17:30';
  ((s && s.week) || []).forEach(w => { if (String(w.day).split(',').indexOf(dow) >= 0) { start = w.start; close = w.close; } });
  const sMin = +start.slice(0, 2) * 60 + +start.slice(3, 5), eMin = +close.slice(0, 2) * 60 + +close.slice(3, 5);
  const out = [{ code: 'fa', label: 'First available' }];
  for (let m = sMin; m <= eMin - 30; m += 30) {
    const h = Math.floor(m / 60), mn = m % 60, ap = h >= 12 ? 'pm' : 'am', hh = h % 12 || 12;
    out.push({ code: String(h).padStart(2, '0') + String(mn).padStart(2, '0'), label: hh + (mn === 0 ? '' : ':' + String(mn).padStart(2, '0')) + ap });
  }
  return out;
}
async function wqService(token, chat, data) {
  const id = parseInt(data.slice(4), 10);
  const menu = await wqMenu();
  const svc = menu.find(x => x.id === id) || { id, name: 'Cut' };
  const dates = wqDates(); const rows = []; let row = [];
  dates.forEach((dt, i) => { row.push({ text: dt.label, callback_data: `wqd:${id}:${dt.code}` }); if (row.length === 2 || i === dates.length - 1) { rows.push(row); row = []; } });
  await tg(token, 'sendMessage', { chat_id: chat, text: `${svc.name} 🚶 — which day?`, reply_markup: { inline_keyboard: rows } });
}
async function wqDate(token, chat, data) {
  const p = data.split(':'); const id = parseInt(p[1], 10), code = p[2];
  const menu = await wqMenu();
  const svc = menu.find(x => x.id === id) || { id, name: 'Cut' };
  const dt = wqDates().find(x => x.code === code) || wqDates()[0];
  const times = await wqDayTimes(dt.iso); const rows = []; let row = [];
  times.forEach((t, i) => { row.push({ text: t.label, callback_data: `wqt:${id}:${code}:${t.code}` }); if (row.length === 3 || i === times.length - 1) { rows.push(row); row = []; } });
  await tg(token, 'sendMessage', { chat_id: chat, text: `${svc.name} · ${dt.label} — what time?`, reply_markup: { inline_keyboard: rows } });
}
async function wqTime(token, chat, data) {
  const p = data.split(':'); const id = parseInt(p[1], 10), dcode = p[2], tcode = p[3];
  const menu = await wqMenu();
  const svc = menu.find(x => x.id === id) || { id, name: 'Cut' };
  const dt = wqDates().find(x => x.code === dcode) || wqDates()[0];
  const t = (await wqDayTimes(dt.iso)).find(x => x.code === tcode) || { label: 'First available' };
  // force_reply carries svc + date + time (recovered from reply_to_message) — stateless
  await tg(token, 'sendMessage', { chat_id: chat,
    text: `${svc.name} · ${dt.label} · ${t.label} — you're going ${WQ_MARK}.\nLast bit — reply with your name and mobile.\nLike: Jack Smith, 0400 123 456`,
    reply_markup: { force_reply: true } });
}
async function wqSubmit(token, chat, promptText, userText) {
  if (isEscape(userText)) { await sendMenu(token, chat, 'No worries — back to the start. What do you need?'); return; }
  const menu = await wqMenu();
  // recover the service = the LONGEST menu name that appears in the prompt
  let svc = null;
  menu.slice().sort((a, b) => b.name.length - a.name.length).forEach(m => { if (!svc && promptText.indexOf(m.name) >= 0) svc = m; });
  // recover chosen date (match a day label) + time (token right before "—")
  let dt = null; wqDates().forEach(x => { if (!dt && promptText.indexOf(x.label) >= 0) dt = x; });
  const tmm = promptText.match(/·\s*([^·]+?)\s*—/);
  const time = (tmm ? tmm[1] : 'First available').trim().slice(0, 20);
  const m = userText.match(/^\s*([a-zA-Z][a-zA-Z '\-]{1,39}?)[,\s]+((?:04|\+?61 ?4)[\d ]{8,12})\s*$/);
  if (!m) {
    await tg(token, 'sendMessage', { chat_id: chat,
      text: `Almost — reply with your name and mobile.\nLike: Jack Smith, 0400 123 456\n\n${svc ? svc.name : 'Cut'} · ${dt ? dt.label : 'Tomorrow'} · ${time} — you're going ${WQ_MARK}.`,
      reply_markup: { force_reply: true } });
    return;
  }
  const name = m[1].trim();
  const phone = m[2].replace(/\D/g, '').replace(/^61/, '0');
  const svcName = svc ? svc.name : 'Cut';
  const fs = await feed().catch(() => null);
  const date = (dt && dt.iso) || (fs && fs.next_date);
  const dayLabel = dt ? dt.label : 'Tomorrow';
  const daySentence = dayLabel === 'Tomorrow' ? 'tomorrow' : dayLabel;
  const id = globalThis.crypto.randomUUID().toLowerCase();
  await put(`queue/${id}.json`, JSON.stringify({ id, name, phone, service: (svc ? svc.id : 0), service_name: svcName, barber: 'First available', time, date: date || undefined, at: new Date().toISOString() }),
    { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
  const card = `🆕 *Walk-in* (via Telegram)\n\n👤 ${name}\n📱 ${phone}\n✂️ ${svcName}\n💈 First available\n🗓 ${dayLabel}\n🕐 Preferred: ${time}`;
  await tg(token, 'sendMessage', { chat_id: process.env.QUEUE_CHAT, text: card, parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: [[{ text: '✅ Add to SLIKR', callback_data: 'qadd:' + id }, { text: '✕ Dismiss', callback_data: 'qdis:' + id }]] } });
  await tg(token, 'sendMessage', { chat_id: chat, text: `✅ You're on the walk-in list for ${daySentence}, ${name.split(' ')[0]} — we'll text you to confirm your time. See you then! ✂️` });
  await saveCustomer(chat, { name, phone, last_service: svcName, last_time: time });
}

// ---- Cancel via the bot — stateless force_reply → creq for the Mac executor ----
const CANCEL_MARK = "cancel your booking";
async function cancelStart(token, chat) {
  await tg(token, 'sendMessage', { chat_id: chat,
    text: `No worries — reply with the name and mobile you booked with and I'll cancel your booking.\nLike: Jack Smith, 0400 123 456`,
    reply_markup: { force_reply: true } });
}
async function cancelSubmit(token, chat, userText) {
  if (isEscape(userText)) { await sendMenu(token, chat, 'All good — nothing cancelled. What do you need?'); return; }
  const m = userText.match(/^\s*([a-zA-Z][a-zA-Z '\-]{1,39}?)[,\s]+((?:04|\+?61 ?4)[\d ]{8,12})\s*$/);
  if (!m) { await tg(token, 'sendMessage', { chat_id: chat, text: `Almost — send the name + mobile you booked with.\nLike: Jack Smith, 0400 123 456\n\n(to ${CANCEL_MARK})`, reply_markup: { force_reply: true } }); return; }
  const name = m[1].trim(), phone = m[2].replace(/\D/g, '').replace(/^61/, '0');
  const id = globalThis.crypto.randomUUID().toLowerCase();
  await put(`creq/${id}.json`, JSON.stringify({ name, phone, tg_chat: chat, ts: Date.now() }),
    { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
  await tg(token, 'sendMessage', { chat_id: chat, text: `Done ${name.split(' ')[0]} — I've sent your cancellation to the shop and you won't be marked a no-show. ✂️` });
}
// ---- Customer memory: remember returning customers. Written on booking, read on a
//      later visit (always days apart) so head() is fully consistent here. ----
async function getCustomer(chat) {
  try { const m = await head(`cust/${chat}.json`); return await (await fetch(m.downloadUrl, { cache: 'no-store' })).json(); }
  catch { return null; }
}
async function saveCustomer(chat, prof) {
  try {
    const prev = (await getCustomer(chat)) || {};
    await put(`cust/${chat}.json`, JSON.stringify({ ...prev, ...prof, chat, visits: (prev.visits || 0) + 1, updated: new Date().toISOString() }),
      { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
  } catch {}
}

async function answerFor(kind) {
  let s;
  try { s = await feed(); } catch { return `Couldn't reach the shop feed — call us on ${PHONE}.`; }
  const stale = !freshEnough(s);

  if (kind === 'hours') {
    return `📍 ${ADDRESS}\n🕐 Today: ${s.hours_today === 'closed today' ? 'closed' : fmtHours(s.hours_today)}\n🅿️ Free parking out front.\n📞 ${PHONE}`;
  }
  // Closed + "who's on" → show who's rostered the next open day (mirrors the website).
  if (kind === 'who' && !s.open) {
    const wtm = ((s.walkin_next && s.walkin_next.barbers) || []).map(n => n.split(' ')[0]);
    const bkm = Object.keys(s.slots_next || {}).map(n => n.split(' ')[0]);
    if (Object.keys((s.salon && s.salon.slots) || {}).some(k => ((s.salon.slots[k]) || []).length)) bkm.push('Sami');
    if (!wtm.length && !bkm.length)
      return `Lights are off — back ${s.hours_today === 'closed today' ? 'tomorrow' : fmtT(s.hours_today.split('–')[0])}. Book ahead any time: ${BOOK_URL}`;
    const lbl = (s.walkin_next && s.walkin_next.label) || s.next_label || 'tomorrow';
    let out = `On ${lbl}:`;
    if (wtm.length) out += `\n💈 Walk-ins — ${wtm.join(', ')}`;
    if (bkm.length) out += `\n📅 Booking — ${bkm.join(', ')}`;
    return out + `\nBook: ${BOOK_URL}`;
  }
  if (!s.open) {
    return `Lights are off — we're back ${s.hours_today === 'closed today' ? 'tomorrow' : fmtT(s.hours_today.split('–')[0])}. Book ahead any time: ${BOOK_URL}`;
  }
  if (kind === 'wait') {
    if (stale || s.wait_mins == null) return `Live feed's catching its breath — call us for the wait: ${PHONE}`;
    if (s.wait_mins === 0) return `🟢 No wait right now — ${s.barbers_on} barbers on, walk straight in (${asOf(s)})\nOr lock a chair: ${BOOK_URL}`;
    return `⏱ ~${s.wait_mins} min wait · ${s.waiting} waiting · ${s.barbers_on} barbers on (${asOf(s)})\nJump in: ${BOOK_URL}`;
  }
  if (kind === 'book') {
    return `Lock your chair: ${BOOK_URL}` + (s.open ? '' : `\n(We're closed right now — book ahead for ${fmtT(s.hours_today.split('–')[0])}.)`);
  }
  if (kind === 'who') {
    if (stale || !s.barbers.length) return `Can't see the floor right now — call us: ${PHONE}`;
    const lines = s.barbers.map(b => {
      const fi = +b.free_in || 0;
      const st = fi === 0 ? 'free now' : b.cutting ? `cutting${b.cutting_at === 'salon' ? ' (in the salon)' : ''}, free in ~${fi} min` : fi > 90 ? 'booked up today' : `booked, free in ~${fi} min`;
      return `${b.cutting ? '✂️' : fi === 0 ? '🟢' : '📅'} ${b.name} — ${st}`;
    });
    return `On the floor ${asOf(s)}:\n` + lines.join('\n') + `\nBook: ${BOOK_URL}`;
  }
  return menuText();
}
function fmtHours(h) { return h.split('–').map(fmtT).join(' – '); }
function menuText() {
  return `💈 Blacksmith Barbers — live from the shop.\nWhat do you need?`;
}

async function tg(token, method, body) {
  await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

// ---- "Join tomorrow's queue" shop-side actions (qadd / qdis) ----
async function readQueue(id) {
  try { const m = await head(`queue/${id}.json`); return await (await fetch(m.downloadUrl)).json(); }
  catch { return null; }
}
async function qAction(token, cq) {
  const chat = cq.message.chat.id, mid = cq.message.message_id;
  const who = (cq.from && cq.from.first_name) || 'shop';
  const [act, id] = cq.data.split(':');
  const rec = await readQueue(id);
  // keep the original detail lines, swap the header line
  const body = cq.message.text ? cq.message.text.split('\n').slice(1).join('\n').trim() : '';
  if (act === 'qdis') {
    await tg(token, 'editMessageText', { chat_id: chat, message_id: mid,
      text: `✕ Dismissed by ${who}\n\n${body}`, reply_markup: { inline_keyboard: [] } });
    return;
  }
  if (!rec) {
    await tg(token, 'editMessageText', { chat_id: chat, message_id: mid,
      text: `⚠️ Couldn't find that request to book — enter it into SLIKR manually.\n\n${body}`, reply_markup: { inline_keyboard: [] } });
    return;
  }
  // map preferred time → SLIKR slot ("now" or 24h HH:MM)
  let slot = 'now';
  const tm = String(rec.time || '').match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (tm) { let h = +tm[1]; const mn = tm[2] || '00'; const ap = tm[3].toLowerCase();
    if (ap === 'pm' && h < 12) h += 12; if (ap === 'am' && h === 12) h = 0;
    slot = String(h).padStart(2, '0') + ':' + mn; }
  const barber = rec.barber === 'First available' ? 'any' : rec.barber;
  // Walk-in cards are for the NEXT OPEN DAY, so book with that date — otherwise the
  // executor books TODAY and SLIKR rejects "Date Time is in the past" once that time
  // has passed. Prefer the date stored on the card; else the feed's next_date.
  let date = rec.date;
  if (!date) { const s = await feed().catch(() => null); date = (s && s.next_date) || undefined; }
  // hand the booking to the Mac executor (it creates the real SLIKR reservation
  // + SLIKR texts the customer). Result/▒fail comes back to THIS shop chat.
  await put(`req/${id}.json`, JSON.stringify({
    service_id: rec.service, shop: 'barber', barber, slot, date,
    name: rec.name, phone: rec.phone, tg_chat: chat, at: new Date().toISOString()
  }), { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
  await tg(token, 'editMessageText', { chat_id: chat, message_id: mid,
    text: `⏳ Booking ${rec.name} into SLIKR (by ${who})…\n\n${body}`, reply_markup: { inline_keyboard: [] } });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('ok');
  if (req.headers['x-telegram-bot-api-secret-token'] !== process.env.WEBHOOK_SECRET)
    return res.status(401).send('no');
  const token = process.env.BOT_TOKEN;
  const u = req.body || {};

  try {
    if (u.callback_query) {
      const cq = u.callback_query;
      const chat = cq.message.chat.id;
      if (!limited(chat)) {
        if (cq.data === 'walk') await walkinStart(token, chat);
        else if (cq.data === 'book') await bookStart(token, chat);
        else if (cq.data.startsWith('wb:')) await walkinBarber(token, chat, cq.data.slice(3));
        else if (cq.data.startsWith('bb:')) await bookBarber(token, chat, cq.data.slice(3));
        else if (cq.data.startsWith('bd:')) await bookDay(token, chat, cq.data.slice(3));
        else if (cq.data === 'bk') await bkStart(token, chat);
        else if (cq.data === 'bks') await bkSalon(token, chat);
        else if (cq.data === 'wq') await wqStart(token, chat);
        else if (cq.data.startsWith('wqs:')) await wqService(token, chat, cq.data);
        else if (cq.data.startsWith('wqd:')) await wqDate(token, chat, cq.data);
        else if (cq.data.startsWith('wqt:')) await wqTime(token, chat, cq.data);
        else if (cq.data.startsWith('bk')) await bkStep(token, chat, cq.data);
        else if (cq.data.startsWith('qadd:') || cq.data.startsWith('qdis:')) await qAction(token, cq);
        else {
          const text = await answerFor(cq.data);
          await tg(token, 'sendMessage', { chat_id: chat, text, reply_markup: MENU_KB, disable_web_page_preview: true });
        }
      }
      await tg(token, 'answerCallbackQuery', { callback_query_id: cq.id });
    } else if (u.message && u.message.chat) {
      const chatId = u.message.chat.id;
      if (!limited(chatId)) {
        const raw = u.message.text || '';
        // walk-in: reply to our force_reply prompt → post the card (no state read)
        const rtm = u.message.reply_to_message;
        if (rtm && rtm.text && rtm.text.indexOf(WQ_MARK) >= 0) {
          await wqSubmit(token, chatId, rtm.text, raw);
          return res.status(200).send('ok');
        }
        if (rtm && rtm.text && rtm.text.indexOf(CANCEL_MARK) >= 0) {
          await cancelSubmit(token, chatId, raw);
          return res.status(200).send('ok');
        }
        if (await bkDetails(token, chatId, raw)) return res.status(200).send('ok');
        // Always-available reset: "/start", "/menu", "start over", tapping ↩️ Start over, etc.
        if (/^\/(start|menu)\b/i.test(raw) || isEscape(raw)) {
          const c0 = await getCustomer(chatId);
          await sendMenu(token, chatId, (c0 && c0.name)
            ? `G’day ${c0.name.split(' ')[0]}! 👋 Lock a time, or join the walk-in queue?`
            : 'G’day! 👋 Lock a time, or join the walk-in queue?');
          return res.status(200).send('ok');
        }
        // Front-door fork buttons (persistent keyboard). Strip the emoji, match label.
        const flbl = raw.replace(/[^\x00-\x7F]/g, '').trim().toLowerCase();
        if (flbl === 'walk-in' || flbl === 'walkin') { await walkinStart(token, chatId); return res.status(200).send('ok'); }
        if (flbl === 'book' || flbl === 'bookings') { await bookStart(token, chatId); return res.status(200).send('ok'); }
        const t = raw.toLowerCase();
        const NAMES = ['bayli','jarred','jayden','locky','ben','cam','mubarak','sami'];
        const nm = NAMES.find(n => t.includes(n));
        let kind = 'menu';
        if (/cancel|reschedule|change my/.test(t)) kind = 'cancel';
        else if (/salon|colour|color|women|ladies|blackrose/.test(t)) kind = 'salon';
        else if (/book|appoint|reserve|lock in|get in/.test(t)) kind = 'book';
        else if (/price|cost|how much|\$|charge|service|menu|fade|beard|shave/.test(t)) kind = 'prices';
        else if (/how (does|do i|do you|to book|it works|this works)|how'?s it work/.test(t)) kind = 'how';
        else if (/remotely|from home|hold my spot|save my spot|skip the (queue|wait)|watch my spot/.test(t)) kind = 'remote';
        else if (/pay|card|cash|eftpos/.test(t)) kind = 'pay';
        else if (/app\b|app store/.test(t)) kind = 'app';
        else if (/salon|colour|color|women|ladies|blackrose/.test(t)) kind = 'salon';
        else if (/job|apprentice|hiring/.test(t)) kind = 'jobs';
        else if (/gift|voucher/.test(t)) kind = 'gift';
        else if (/human|real person|someone|call/.test(t)) kind = 'human';
        else if (/^(hi|hey|hello|yo|g'?day|sup)\b/.test(t)) kind = 'hi';
        else if (/thank|cheers|legend/.test(t)) kind = 'thanks';
        else if (/sunday|monday|tuesday|wednesday|thursday|friday|saturday|weekend|tomorrow|hour|open|close|park|address|where/.test(t)) kind = 'hours';
        else if (/wait|long|busy|queue/.test(t)) kind = 'wait';
        else if (/who|on today|working/.test(t) || nm) kind = 'who';
        if (kind === 'book') { await sendMenu(token, chatId, 'Lock a time, or join the walk-in queue?'); return res.status(200).send('ok'); }
        if (kind === 'cancel') { await cancelStart(token, chatId); return res.status(200).send('ok'); }
        let text;
        const s2 = await feed().catch(() => null);
        if (kind === 'prices') {
          const menu = (s2 && s2.services && s2.services.barber) || [];
          text = menu.length ? 'The menu:\n' + menu.map(m => `${m.name} — $${m.cost}`).join('\n') + '\nTap Book me in and I\u2019ll lock one in.' : `Call us for the menu: ${PHONE}`;
        }
        else if (kind === 'how') text = 'Two ways in: join the live queue (walk-in — I’ll show you the wait) or book a set time with a barber. Tap ✂️ Book me in and I’ll walk you through it.';
        else if (kind === 'remote') text = 'You never have to stand around — join the queue from right here, watch your spot, and walk in when it’s your turn. Tap ✂️ Book me in and I’ll set you up.';
        else if (kind === 'pay') text = 'You pay at the shop after your cut — card or cash both sweet.';
        else if (kind === 'app') text = 'The Blacksmith app: https://apps.apple.com/au/app/blacksmith-barbers-salon/id1454355905';
        else if (kind === 'salon') {
          await tg(token, 'sendMessage', { chat_id: chatId, text: 'Blackrose Salon Co. is our salon side — colour, styling, cuts. I can book you in right here:',
            reply_markup: { inline_keyboard: [[{ text: '🌹 Book Blackrose', callback_data: 'bks' }]] } });
          return res.status(200).send('ok');
        }
        else if (kind === 'jobs') text = `Keen to join the trade? Call ${PHONE} or drop in — we also run the Blacksmith Academy.`;
        else if (kind === 'gift') text = `Ask at the counter or call ${PHONE}.`;
        else if (kind === 'human') text = `Call the shop: ${PHONE}.`;
        else if (kind === 'hi') { const c = await getCustomer(chatId); text = (c && c.name) ? `G\u2019day ${c.name.split(' ')[0]}! 👋 Live wait, who\u2019s on, prices, or a booking — what do you need?` : 'G\u2019day! Live wait, who\u2019s on, prices, or a booking — what do you need?'; }
        else if (kind === 'thanks') text = 'Easy as. Anything else?';
        else if (kind === 'who' && nm && s2) {
          const b = s2.barbers.find(x => x.name.toLowerCase().startsWith(nm));
          text = b ? `${b.name.split(' ')[0]} is on — ${b.cutting ? 'cutting now' : 'free'}${(+b.free_in||0) > 0 ? `, free in ~${b.free_in} min` : ' now'}. Tap Book me in!`
                   : `${nm[0].toUpperCase()+nm.slice(1)} isn't on today — tap Who's on to see the floor.`;
        }
        else if (kind === 'menu' && raw.trim().length > 12) {
          const id = globalThis.crypto.randomUUID().toLowerCase();
          await put(`ask/${id}.json`, JSON.stringify({ q: raw.slice(0, 240), tg_chat: chatId, at: new Date().toISOString() }),
            { access: 'public', addRandomSuffix: false, contentType: 'application/json' });
          text = 'Let me check that for you — one sec…';
        }
        else if (kind === 'menu') text = menuText();
        else text = await answerFor(kind);
        await tg(token, 'sendMessage', { chat_id: chatId, text, reply_markup: MENU_KB, disable_web_page_preview: true });
      }
    }
  } catch (e) { /* never leak errors to Telegram */ }
  return res.status(200).send('ok');
}
