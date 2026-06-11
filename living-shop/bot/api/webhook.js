/* Blacksmith wait-time bot — Phase 4 V1. Templates only, NO LLM.
   SECURITY MANIFEST (non-negotiable, see ../../STRATEGY-SPEC.md):
   This bot's entire universe is (1) the public PII-free queue.json,
   (2) the static copy below, (3) the sender's chat id for replying.
   It has NO SLIKR access, NO path to the Mac, NO connection to any
   other bot/bridge. Separate token, separate runtime, zero shared state. */

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
    [{ text: '✂️ Join the queue', url: BOOK_URL }],
    [{ text: '🕐 Hours & parking', callback_data: 'hours' }]
  ]
};

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
      if (!limited(cq.message.chat.id)) {
        const text = await answerFor(cq.data);
        await tg(token, 'sendMessage', { chat_id: cq.message.chat.id, text, reply_markup: KEYBOARD, disable_web_page_preview: true });
      }
      await tg(token, 'answerCallbackQuery', { callback_query_id: cq.id });
    } else if (u.message && u.message.chat) {
      const chatId = u.message.chat.id;
      if (!limited(chatId)) {
        const t = (u.message.text || '').toLowerCase();
        const kind = t.includes('wait') ? 'wait' : (t.includes('who') || t.includes('barber')) ? 'who'
          : (t.includes('hour') || t.includes('park') || t.includes('open')) ? 'hours'
          : (t.includes('book') || t.includes('queue') || t.includes('join')) ? 'book' : 'menu';
        const text = kind === 'menu' ? menuText() : await answerFor(kind);
        await tg(token, 'sendMessage', { chat_id: chatId, text, reply_markup: KEYBOARD, disable_web_page_preview: true });
      }
    }
  } catch (e) { /* never leak errors to Telegram */ }
  return res.status(200).send('ok');
}
