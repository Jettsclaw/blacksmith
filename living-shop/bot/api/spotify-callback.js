/* One-time Spotify OAuth callback for the shop's "now playing".
   Beau taps the authorize link → Spotify redirects here with ?code →
   we swap it for a refresh token and stash it in the private blob store.
   Beatrice then reads it and sets SPOTIFY_REFRESH_TOKEN on the bot. */
import { put } from '@vercel/blob';

export default async function handler(req, res) {
  const id = process.env.SPOTIFY_CLIENT_ID, secret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirect = 'https://blacksmith-wait-bot.vercel.app/api/spotify-callback';
  const code = (req.query && req.query.code) || '';
  if (!id || !secret) return res.status(200).send('Not configured yet — client id/secret missing.');
  if (!code) return res.status(400).send('No code — start from the authorize link.');
  try {
    const tok = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded',
                 'Authorization': 'Basic ' + Buffer.from(id + ':' + secret).toString('base64') },
      body: 'grant_type=authorization_code&code=' + encodeURIComponent(code) +
            '&redirect_uri=' + encodeURIComponent(redirect)
    }).then(r => r.json());
    if (!tok.refresh_token) return res.status(200).send('No refresh token returned: ' + JSON.stringify(tok));
    await put('spotify/refresh.json', JSON.stringify({ refresh_token: tok.refresh_token, at: new Date().toISOString() }),
      { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json',
        token: process.env.BLOB_READ_WRITE_TOKEN });
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send('<body style="font-family:system-ui;background:#0d0d0f;color:#c8a44d;display:grid;place-items:center;height:100vh;margin:0"><div style="text-align:center"><h1>✓ Spotify connected</h1><p style="color:#f3f1ea">You can close this tab — the live shop will show now playing.</p></div></body>');
  } catch (e) {
    return res.status(200).send('Error: ' + String(e));
  }
}
