/* Blacksmith — "Join tomorrow's queue" intake.
   Web form (walk-in shop) POSTs here → we drop a queue/<id> record and post a
   clean card into the shop Telegram so whoever opens up sees the overnight list
   and can one-tap it into SLIKR (handled in webhook.js → qadd:<id>).
   No SLIKR access here — same security posture as the bot. */
import { put } from '@vercel/blob';

const SERVICES = {
  1391: "Men's Cut", 4910: "Men's Cut + Beard", 2114: "Zero/Skin Fade",
  4911: "Zero/Skin Fade + Beard", 1435: "Pensioner's Cut", 5499: "Scissor / Long Hair",
  2113: "Buzz cut", 5041: "Apprentice/Student Cut", 1517: "Beard trim"
};
// walk-in four (default Bayli); Sami always displays "Sammi"
const WALKIN = new Set(["First available", "Bayli", "Ben", "Mubarak", "Jayden"]);

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
async function tg(token, method, body) {
  return fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const token = process.env.BOT_TOKEN;
  const chat = process.env.QUEUE_CHAT;           // shop chat (Jett's id while testing)
  const b = req.body || {};

  // ---- validate ----
  const name = String(b.name || '').trim().slice(0, 40);
  const phone = String(b.phone || '').replace(/\D/g, '').replace(/^61/, '0');
  const service = parseInt(b.service, 10);
  const barber = WALKIN.has(b.barber) ? b.barber : 'First available';
  const time = String(b.time || 'First available').trim().slice(0, 20);
  if (!/^[a-zA-Z][a-zA-Z '\-]{1,39}$/.test(name)) return res.status(400).json({ ok: false, err: 'name' });
  if (!/^04\d{8}$/.test(phone)) return res.status(400).json({ ok: false, err: 'phone' });
  if (!SERVICES[service]) return res.status(400).json({ ok: false, err: 'service' });

  // the day this walk-in is for = the shop's next open day → carried through so the
  // Add-to-SLIKR booking uses the right date (not today → "Date Time is in the past").
  let nextDate;
  try { const fr = await fetch('https://raw.githubusercontent.com/automaitions/blacksmith-queue-feed/main/queue.json?t=' + Math.floor(Date.now() / 30000), { cache: 'no-store' }); const fs = await fr.json(); nextDate = fs && fs.next_date; } catch {}

  const id = globalThis.crypto.randomUUID().toLowerCase();
  const rec = { id, name, phone, service, service_name: SERVICES[service], barber, time, date: nextDate || undefined, at: new Date().toISOString() };

  try {
    await put(`queue/${id}.json`, JSON.stringify(rec),
      { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });

    const card =
      `🆕 *Tomorrow's walk-in* (via website)\n\n` +
      `👤 ${name}\n📱 ${phone}\n✂️ ${SERVICES[service]}\n💈 ${barber}\n🕐 Preferred: ${time}`;
    await tg(token, 'sendMessage', {
      chat_id: chat, text: card, parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[
        { text: '✅ Add to SLIKR', callback_data: 'qadd:' + id },
        { text: '✕ Dismiss', callback_data: 'qdis:' + id }
      ]] }
    });
  } catch (e) {
    return res.status(500).json({ ok: false, err: 'send' });
  }
  return res.status(200).json({ ok: true });
}
