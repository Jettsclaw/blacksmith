/* Fallback Q&A relay — unmatched questions go to the Mac, which answers them
   with a small Claude model primed on SHOP-KNOWLEDGE.md + the live snapshot.
   No model keys live in the cloud; this endpoint only ferries text. */
import { put, head } from '@vercel/blob';

const hits = new Map();
function limited(key) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter(t => now - t < 600000);
  arr.push(now); hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 8; // 8 hard questions / 10 min / origin
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://blacksmith-ten.vercel.app');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const id = String(req.query.id || '');
    if (!/^[a-z0-9-]{8,40}$/.test(id)) return res.status(400).json({ error: 'bad id' });
    try {
      const meta = await head(`res-ask/${id}.json`);
      const data = await (await fetch(meta.downloadUrl)).json();
      return res.status(200).json({ done: true, ...data });
    } catch { return res.status(200).json({ done: false }); }
  }

  if (req.method !== 'POST') return res.status(405).end();
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || 'x';
  if (limited(ip)) return res.status(429).json({ error: 'Slow down a touch — or call us on 0479 087 782.' });
  const q = String((req.body || {}).q || '').slice(0, 240).trim();
  if (q.length < 4) return res.status(400).json({ error: 'Ask me a question!' });
  const id = globalThis.crypto.randomUUID().toLowerCase();
  await put(`ask/${id}.json`, JSON.stringify({
    q, tg_chat: typeof (req.body || {}).tg_chat === 'number' ? req.body.tg_chat : undefined,
    at: new Date().toISOString()
  }), { access: 'public', addRandomSuffix: false, contentType: 'application/json' });
  return res.status(200).json({ id });
}
