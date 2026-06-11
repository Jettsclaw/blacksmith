/* In-chat booking — request intake.
   Validates and drops the request into the PRIVATE relay store. No SLIKR
   credentials live here: the Mac executor (which holds the key) picks the
   request up within seconds and writes a result blob this API serves back. */
import { put, head } from '@vercel/blob';

const SERVICES = {
  barber: [1391, 4910, 1437, 1517],
  bookings: [5542, 5588, 5553, 5589, 5551, 5549],
  salon: [5297, 5300, 5301, 5302, 5303, 5304, 5305, 5306, 5307, 5308, 5309,
          5310, 5311, 5312, 5313, 5314, 5316, 5317, 5318, 5319, 5320, 5321,
          5322, 5323, 5324, 5353, 5354, 5355, 5356, 5357, 5358, 5452, 5453,
          5454, 5455, 5456, 5457]
};
const hits = new Map();
function limited(key) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter(t => now - t < 600000);
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 5; // 5 booking attempts / 10 min / origin
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://blacksmith-ten.vercel.app');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') { // status poll: /api/book?id=...
    const id = String(req.query.id || '');
    if (!/^[a-z0-9-]{8,40}$/.test(id)) return res.status(400).json({ error: 'bad id' });
    try {
      const meta = await head(`res/${id}.json`);
      const data = await (await fetch(meta.downloadUrl)).json();
      return res.status(200).json({ done: true, ...data });
    } catch {
      return res.status(200).json({ done: false });
    }
  }

  if (req.method !== 'POST') return res.status(405).end();
  const b = req.body || {};
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || 'x';
  const phone = String(b.phone || '').replace(/\D/g, '');
  if (limited(ip) || limited(phone)) return res.status(429).json({ error: 'Too many attempts — call us on 0479 087 782.' });

  const shop = String(b.shop || '');
  const sid = parseInt(b.service_id, 10);
  const name = String(b.name || '').slice(0, 40);
  const slot = String(b.slot || 'now').slice(0, 5);
  const barber = String(b.barber || 'any').slice(0, 30);
  if (!SERVICES[shop] || !SERVICES[shop].includes(sid))
    return res.status(400).json({ error: 'Pick a service from the menu.' });
  if (!/^[a-zA-Z '\-]{2,40}$/.test(name))
    return res.status(400).json({ error: 'Add your name (letters only).' });
  if (!/^04\d{8}$/.test(phone))
    return res.status(400).json({ error: 'Mobile should look like 04xx xxx xxx.' });
  if (slot !== 'now' && !/^\d{2}:\d{2}$/.test(slot))
    return res.status(400).json({ error: 'Pick a time from the list.' });
  const date = String(b.date || '');
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ error: 'Bad date.' });

  const id = (globalThis.crypto?.randomUUID?.() || String(Date.now())).toLowerCase();
  await put(`req/${id}.json`, JSON.stringify({
    service_id: sid, shop, barber, slot, name, phone, date: date || undefined,
    tg_chat: typeof b.tg_chat === 'number' ? b.tg_chat : undefined,
    at: new Date().toISOString()
  }), { access: 'public', addRandomSuffix: false, contentType: 'application/json' });
  return res.status(200).json({ id });
}
