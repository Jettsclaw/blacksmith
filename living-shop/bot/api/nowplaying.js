/* Blacksmith — live "now playing" from the shop's Spotify.
   Refreshes an access token from the stored refresh token (server-side secrets),
   returns the current track. No secrets ever reach the browser. */
function cors(res){res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Cache-Control','no-store');}

export default async function handler(req, res){
  cors(res);
  const id=process.env.SPOTIFY_CLIENT_ID, secret=process.env.SPOTIFY_CLIENT_SECRET, refresh=process.env.SPOTIFY_REFRESH_TOKEN;
  if(!id||!secret||!refresh) return res.status(200).json({playing:false});
  try{
    const tok=await fetch('https://accounts.spotify.com/api/token',{
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded','Authorization':'Basic '+Buffer.from(id+':'+secret).toString('base64')},
      body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(refresh)
    }).then(r=>r.json());
    if(!tok.access_token) return res.status(200).json({playing:false});
    const r=await fetch('https://api.spotify.com/v1/me/player/currently-playing',{headers:{Authorization:'Bearer '+tok.access_token}});
    if(r.status===204||r.status>=400) return res.status(200).json({playing:false});
    const d=await r.json();
    const it=d.item||{};
    return res.status(200).json({
      playing: !!d.is_playing && !!it.name,
      track: it.name||'',
      artist: (it.artists||[]).map(a=>a.name).join(', '),
      art: ((it.album||{}).images||[]).slice(-1)[0]?.url || ((it.album||{}).images||[])[0]?.url || '',
      url: (it.external_urls||{}).spotify || '',
      progress: d.progress_ms||0, duration: it.duration_ms||0
    });
  }catch(e){ return res.status(200).json({playing:false}); }
}
