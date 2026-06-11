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

async function getState(chat) {
  try {
    const m = await head(`state/${chat}.json`);
    return await (await fetch(m.downloadUrl)).json();
  } catch { return null; }
}
async function setState(chat, st) {
  await put(`state/${chat}.json`, JSON.stringify(st),
    { access: 'public', addRandomSuffix: false, contentType: 'application/json' });
}
async function clearState(chat) {
  try { await del(`state/${chat}.json`); } catch {}
}

async function bkStart(token, chat) {
  const s = await feed().catch(() => null);
  if (!s) return;
  if (!s.open) {
    const names = Object.keys(s.slots_next || {}).filter(n => (s.slots_next[n] || []).length);
    if (!names.length) {
      await tg(token, 'sendMessage', { chat_id: chat, text: `We're closed and tomorrow's book isn't open yet — try again in the morning, or call ${PHONE}.` });
      return;
    }
    await setState(chat, { step: 'barber', ahead: true, date: s.next_date });
    await tg(token, 'sendMessage', { chat_id: chat, text: `We're closed right now, but you can lock in ${s.next_label}. Who with?`,
      reply_markup: { inline_keyboard: names.map(n => [{ text: n, callback_data: 'bk1:' + n }]) } });
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
  const m = text.match(/^\s*([a-zA-Z][a-zA-Z '\-]{1,39}?)[,\s]+((?:04|\+?61 ?4)[\d ]{8,12})\s*$/);
  if (!m) {
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

async function answerFor(kind) {
  let s;
  try { s = await feed(); } catch { return `Couldn't reach the shop feed — call us on ${PHONE}.`; }
  const stale = !freshEnough(s);

  if (kind === 'hours') {
    return `📍 ${ADDRESS}\n🕐 Today: ${s.hours_today === 'closed today' ? 'closed' : fmtHours(s.hours_today)}\n🅿️ Free parking out front.\n📞 ${PHONE}`;
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
        if (cq.data === 'bk') await bkStart(token, chat);
        else if (cq.data === 'bks') await bkSalon(token, chat);
        else if (cq.data.startsWith('bk')) await bkStep(token, chat, cq.data);
        else {
          const text = await answerFor(cq.data);
          await tg(token, 'sendMessage', { chat_id: chat, text, reply_markup: KEYBOARD, disable_web_page_preview: true });
        }
      }
      await tg(token, 'answerCallbackQuery', { callback_query_id: cq.id });
    } else if (u.message && u.message.chat) {
      const chatId = u.message.chat.id;
      if (!limited(chatId)) {
        const raw = u.message.text || '';
        if (await bkDetails(token, chatId, raw)) return res.status(200).send('ok');
        const t = raw.toLowerCase();
        const NAMES = ['bayli','jarred','jayden','locky','ben','cam','mubarak','sami'];
        const nm = NAMES.find(n => t.includes(n));
        let kind = 'menu';
        if (/cancel|reschedule|change my/.test(t)) kind = 'cancel';
        else if (/salon|colour|color|women|ladies|blackrose/.test(t)) kind = 'salon';
        else if (/book|appoint|reserve|lock in|get in/.test(t)) kind = 'book';
        else if (/price|cost|how much|\$|charge|service|menu|fade|beard|shave/.test(t)) kind = 'prices';
        else if (/cancel|reschedule|change my/.test(t)) kind = 'cancel';
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
        if (kind === 'book') { await bkStart(token, chatId); return res.status(200).send('ok'); }
        let text;
        const s2 = await feed().catch(() => null);
        if (kind === 'prices') {
          const menu = (s2 && s2.services && s2.services.barber) || [];
          text = menu.length ? 'The menu:\n' + menu.map(m => `${m.name} — $${m.cost}`).join('\n') + '\nTap Book me in and I\u2019ll lock one in.' : `Call us for the menu: ${PHONE}`;
        }
        else if (kind === 'cancel') text = `To change or cancel a booking, call us on ${PHONE} and we'll sort it.`;
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
        else if (kind === 'hi') text = 'G\u2019day! Live wait, who\u2019s on, prices, or a booking — what do you need?';
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
        await tg(token, 'sendMessage', { chat_id: chatId, text, reply_markup: KEYBOARD, disable_web_page_preview: true });
      }
    }
  } catch (e) { /* never leak errors to Telegram */ }
  return res.status(200).send('ok');
}
