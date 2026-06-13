/* Living Shop — Phase 2 scene engine.
   A real-time pixel miniature of the shop, driven by the same PII-free feed
   as the wait card. Plain Canvas 2D (no WebGL: dodges the iOS hidden-video /
   context-loss gotchas), one render loop, pauses offscreen & when tab hidden.
   Feature flag: renders only with ?livingshop until Jett's reveal approval. */
(function () {
  var LIVING_SHOP_ON = true; // revealed — authorised by Jett 2026-06-11
  var FEED = 'https://raw.githubusercontent.com/automaitions/blacksmith-queue-feed/main/queue.json';
  // ref param ignored by SLIKR today; future measurement hook
  var BOOK_URLS = {
    barber:   'https://web.slikr.com.au/shop/421/res?ref=livingshop',
    bookings: 'https://web.slikr.com.au/shop/1121/res?ref=livingshop',
    salon:    'https://web.slikr.com.au/blackrosesalon?ref=livingshop'
  };
  var STALE_MS = 8 * 60 * 1000;
  var A = 'assets/living-shop/';

  var host = document.getElementById('living-shop');
  if (!host) return;
  if (!LIVING_SHOP_ON && !/[?&]livingshop/.test(location.search)) return;
  host.hidden = false;

  // cinema mode: the scene owns the viewport; the wait/booking panel folds
  // away behind an arrow (phones keep the stacked flow)
  var reveal = host.querySelector('.ls-reveal');
  if (reveal && window.innerWidth > 640) {
    var lw = document.getElementById('live-wait');
    if (lw) {
      reveal.hidden = false;
      lw.classList.add('lw-collapsed');
      reveal.addEventListener('click', function () {
        var open = !lw.classList.contains('lw-collapsed');
        lw.classList.toggle('lw-collapsed', open);
        reveal.classList.toggle('open', !open);
        reveal.setAttribute('aria-expanded', String(!open));
        if (!open) setTimeout(function () { // glide just enough: arrow tucks under the nav, panel fills below
          var anchor = host.querySelector('.ls-info') || reveal;
          var el = anchor, y = 0;
          while (el) { y += el.offsetTop; el = el.offsetParent; }
          window.scrollTo({ top: y - 100, behavior: 'smooth' });
        }, 60);
      });
    }
  }

  // Two rooms, one engine: landscape for desktop, a portrait recomposition
  // for phones (fills the screen, no zoom/pan). Anchors are per-layout.
  var ROOM_V2 = true;
  var ROOM_V3 = true; // Jett's 2026-06-12 remodel: couch to the left corner, floor-to-top split SHOP cabinet (products|merch, tappable), Jett = floating head at the till, 2nd free barber leans at the desk. REVERT = false (checkpoint-jett-20260612 layout).
  var ROOM_V5 = true; // 2026-06-13 full room REDRAW (room-v5.webp, 1584x672): ONE continuous evenly-lit bench (no mirror seam, no light-pool gaps, no ceiling beams), 5 pendant downlights kept but overlapped into an even wash, NEUTRAL daylight base so the moodlight does the day/night shift. SHOP sign baked above the cabinet, reeded frosted door. Chairs re-gridded to spread the FULL bench + hold 6 with no overlap. REVERT = false (back to ROOM_V3 / room-v4 layout).
  var HOST_JETT = true; // Jett as the concierge (test) — false restores the original host // Jett's 2026-06-11 refresh: honey bench, left plant corner, sprite massage chair (reclines). false = original room.
  var LAYOUTS = {
    landscape: ROOM_V5 ? {
      // measured off a labelled grid of room-v5.webp (couch x40-230, clear bench x240-1090, cabinet x1100+)
      room: 'room-v5', W: 1584, H: 672,
      CHAIR_SPAN: { x0: 355, x1: 1012, y: 545, h: 150 }, // x0 pinned WELL right of the couch keep-out so the leftmost chair/cape/barber can NEVER overlap the couch at any count or fit
      SOFTFIT: true, // gently shrink barbers+chairs at 5/6 so real gaps open (no shoulder overlap), full size at <=4
      BARBER_OFF: { x: 46, y: 12 }, CAPE_OFF: { x: 0, y: -6 }, // tighter X offset (was 72) so a 6th barber never leans into the next chair
      COUCH: [{ x: 95, y: 556 }, { x: 145, y: 552 }, { x: 195, y: 548 }], // waiting clients on the baked left-corner chesterfield (kept left so they don't reach the bench)
      DOOR: { x: 1440, y: 600 }, SIGN: { x: 645, y: 116, font: 34 }, CAT_Y: 652,
      MASSAGE: { x: 72, y: 668, h: 210, sprite: true }, // far bottom-left corner — where it sits on the live shop
      FRIDGE: null,
      HOST: { x: 1318, y: 498, h: 150, sprite: 'jett-bust', float: false, flip: false, qoff: 0 }, // Jett waist-up in the pine Blacksmith hoodie, standing BEHIND the till
      HOST_OCCLUDE: { sprite: 'till-front', x: 1260, y: 462 }, // desk front re-drawn OVER Jett so his waist cut-off hides behind the counter
      LEAN: { x: 1182, y: 560 }, // 2nd spare barber leans at the bench end by the cabinet
      SHOP_SIGN: null, // the SHOP sign is BAKED into room-v5 above the cabinet — don't double-draw it
      SHOPZONES: [{ x: 1100, y: 220, w: 78, h: 300, tag: 'products' },
                  { x: 1178, y: 220, w: 76, h: 300, tag: 'merch' }],
      IDLE_SPOT: { x: 1130, y: 560 },
      SCALE: { barber: 210, cape: 165, couch: 140, walk: 185, cat: 64 }
    } : ROOM_V3 ? {
      room: 'room-v4', W: 1784, H: 672, // EXTENDED +200px (slat-wall insert) so 6 chairs never meet the couch
      CHAIR_SPAN: { x0: 615, x1: 1150, y: 545, h: 150 },
      BARBER_OFF: { x: 72, y: 12 }, CAPE_OFF: { x: 0, y: -6 },
      COUCH: [{ x: 140, y: 568 }, { x: 190, y: 560 }, { x: 238, y: 552 }], // purpose-built seated sprites, bums on the cushion line
      DOOR: { x: 1700, y: 640 }, SIGN: { x: 820, y: 118, font: 34 }, CAT_Y: 650,
      MASSAGE: { x: 70, y: 672, h: 218, sprite: true }, // back in the corner, properly sized
      FRIDGE: null,
      HOST: { x: 1582, y: 402, h: 70, sprite: 'jett-head', float: true, flip: false, qoff: 0 }, // hovers just above the till
      LEAN: { x: 1424, y: 589 }, // 2nd free barber leans at the desk (Jett's old spot)
      SHOP_SIGN: { x: 1372, y: 196, font: 26 },
      SHOPZONES: [{ x: 1248, y: 225, w: 122, h: 350, tag: 'products' },
                  { x: 1370, y: 225, w: 122, h: 350, tag: 'merch' }],
      IDLE_SPOT: { x: 1260, y: 560 },
      SCALE: { barber: 210, cape: 165, couch: 150, walk: 185, cat: 64 }
    } : {
      room: ROOM_V2 ? 'room-v2' : 'room', W: 1584, H: 672,
      CHAIR_SPAN: ROOM_V2 ? { x0: 380, x1: 950, y: 545, h: 150 } : { x0: 300, x1: 950, y: 545, h: 150 }, // chairs are sprites, spaced by live count
      BARBER_OFF: { x: 72, y: 12 }, CAPE_OFF: { x: 0, y: -6 },
      COUCH: [{ x: 1118, y: 505 }, { x: 1208, y: 505 }, { x: 1295, y: 505 }],
      DOOR: { x: 1500, y: 640 }, SIGN: { x: 620, y: 118, font: 34 }, CAT_Y: 650,
      MASSAGE: ROOM_V2 ? { x: 74, y: 656, h: 172, sprite: true } : { x: 118, y: 534 },
      FRIDGE: null,
      HOST: { x: 1224, y: 589, h: 206, sprite: HOST_JETT ? 'jett-lean' : 'host-lean', flip: false, qoff: HOST_JETT ? -8 : 0 }, IDLE_SPOT: { x: 1060, y: 560 },
      SCALE: { barber: 210, cape: 165, couch: 140, walk: 185, cat: 64 }
    },
    portrait: ROOM_V2 ? { // the REAL shop corridor: chairs recede down the mirror run
      room: 'room-p7', W: 768, H: 1376,
      CHAIR_SPAN: { x0: 430, y: 1230, x1: 256, y1: 790, h: 205, s1: 0.52 },
      FIT: true, CAP: 3,
      BARBER_OFF: { x: 60, y: 6 }, CAPE_OFF: { x: 0, y: -46 },
      COUCH: [{ x: 540, y: 856, s: 0.56 }, { x: 596, y: 880, s: 0.6 }, { x: 652, y: 906, s: 0.64 }],
      MASSAGE: { x: 660, y: 1185, h: 198, sprite: true }, WPILL: { x: 640, y: 742 },
      DOOR: { x: 384, y: 700 }, SIGN: { x: 384, y: 130, font: 26 },
      HOST: { x: 552, y: 1300, h: 250, sprite: HOST_JETT ? 'jett-lean' : 'host-lean', flip: false, qoff: HOST_JETT ? -8 : 0 },
      IDLE_SPOT: { x: 460, y: 880 },
      CAT_Y: 1330,
      SCALE: { barber: 225, cape: 178, couch: 195, walk: 95, cat: 52 }
    } : {
      room: 'room-p', W: 768, H: 1376,
      CHAIR_SPAN: { x0: 130, x1: 640, y: 880, h: 190 },
      FIT: true, // scale people down as more chairs slide in
      BARBER_OFF: { x: 64, y: 6 }, CAPE_OFF: { x: 0, y: -52 },
      COUCH: [{ x: 170, y: 1305 }, { x: 350, y: 1305 }, { x: 520, y: 1305 }],
      DOOR: { x: 740, y: 1100 }, SIGN: { x: 384, y: 238, font: 30 },
      HOST: { x: 175, y: 1345, h: 238, sprite: HOST_JETT ? 'jett-couch' : 'host-couch', qoff: HOST_JETT ? -17 : 0 },
      IDLE_SPOT: { x: 660, y: 1000 },
      CAT_Y: 1110,
      SCALE: { barber: 235, cape: 185, couch: 172, walk: 165, cat: 56 }
    }
  };
  var MOBILE_V1 = true; // Jett 2026-06-12: phone shows the full landscape scene as a card (the first mobile version)
  var MOBILE_PAN = /[?&]lsmob/.test(location.search); // Jett 2026-06-12: pan rejected as default ("not screen height — the desktop shop in the box"). Card is the look; ?lsmob=1 keeps the pan preview.
  var LAY = LAYOUTS[(!MOBILE_V1 && !MOBILE_PAN && window.innerWidth <= 640) ? 'portrait' : 'landscape'];
  var W = LAY.W, H = LAY.H, BARBER_OFF = LAY.BARBER_OFF, CAPE_OFF = LAY.CAPE_OFF,
      COUCH = LAY.COUCH, DOOR = LAY.DOOR, SIGN = LAY.SIGN, SCALE = LAY.SCALE;

  var canvas = document.createElement('canvas');
  canvas.className = 'ls-canvas';
  host.querySelector('.ls-stage').appendChild(canvas);
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- assets ----------
  var IMGS = {}, toLoad = [LAY.room], BARBER_KEYS = {};
  // barber sprite frames: 0 stand, 1+2 cutting, 3 idle
  var BARBER_NAMES = ['bayli','ben','cam','jarred','jayden','locky','mubarak','sami'];
  BARBER_NAMES.forEach(function (n) {
    for (var i = 0; i < 4; i++) toLoad.push(n + '-' + i);
  });
  ['client-cape-1','client-cape-2','client-cape-3','client-salon-1','client-salon-2','client-salon-3','client-walk','client-couch','cat','sweep-1','sweep-2','host-1','host-2','host-couch','host-stand','host-lean','host-walk-1','host-walk-2','host-walk-3','host-walk-4','chair']
    .forEach(function (n) { toLoad.push(n); });
  if (LAY.MASSAGE && LAY.MASSAGE.sprite) toLoad.push('massage-up', 'massage-lay');
  if (ROOM_V3) toLoad.push('sit-1', 'sit-2', 'sit-3');
  if (LAY.FRIDGE) toLoad.push('fridge');
  if (HOST_JETT) toLoad.push(LAY.HOST.sprite);
  if (LAY.HOST_OCCLUDE) toLoad.push(LAY.HOST_OCCLUDE.sprite);

  var loaded = 0, failed = false;
  toLoad.forEach(function (n) {
    var im = new Image();
    im.onload = function () { if (++loaded === toLoad.length) start(); };
    im.onerror = function () { failed = true; };
    im.src = A + n + '.webp?v=22';
    IMGS[n] = im;
  });

  // Map a feed name ("Jayden (Apprentice)") to a sprite key.
  function spriteKey(name) {
    var k = name.toLowerCase();
    for (var i = 0; i < BARBER_NAMES.length; i++)
      if (k.indexOf(BARBER_NAMES[i]) === 0) return BARBER_NAMES[i];
    return null; // unknown barber -> generic idle silhouette (use 'ben' tinted)
  }

  // ---------- live state ----------
  var snap = null, lastWaiting = 0, walkers = [], catX = null, lastCat = 0;
  var sweeps = {};        // name -> {until, x0} active sweep
  var stroll = null, nextStrollAt = 25000; // host takes a wander now and then
  var nextSweepAt = 25000; // first sweep ~25s in, then every few minutes
  var bubbleUntil = 0, bubbleText = '', nextBubbleAt = 5000;
  var hostAsk = null; // tap the head -> 'book in?' with Yes/No chips
  var HOST = LAY.HOST;

  // Habbo lesson: rooms feel alive when the people in them mutter.
  var chat = null, nextChatAt = 18000;  // {until, who|couch, text}
  var people = {}, couchPos = [];       // positions resolved each frame
  var catSay = 0;
  var CUT_LINES = ['Keeping it sharp ✂', 'Loving this fade', 'Clean as always', 'Almost done here'];
  var FREE_LINES = ['Walk right in', 'Chair’s ready', 'No wait — come down', 'I’m free — tap me to book ✂'];
  var LOUNGE_LINES = ['I’m free — tap me to book in ✂', 'Catching a breather — tap me to book', 'Chair’s open, I’m ready — tap to book'];
  var WAIT_LINES = ['Worth the wait', 'Best cut on the coast', 'Massage chair’s mine next', 'Love this place'];
  // Jett at the till — rotating helpful/playful prompts (shown every ~20-45s)
  var HOST_LINES = ['Want to browse the shop? 🛍', 'Need a hand booking? Tap me', 'Tap me to book your cut ✂',
    'After a fresh fade? Let’s sort it', 'Check out our merch — tap me 👀', 'Questions? Tap me, I’m right here',
    'Grab some gear while you’re here', 'New here? Tap me, I’ll help you book'];
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  // "That's me!" — your own sprite in the room once you book through the chat
  var you = null;
  try { you = JSON.parse(sessionStorage.getItem('ls-you') || 'null'); } catch (e) {}
  if (you && Date.now() - you.at > 2.5 * 3600 * 1000) { you = null; sessionStorage.removeItem('ls-you'); }
  window.__lsYou = function (name) {
    you = { name: String(name || '').split(' ')[0].slice(0, 12), at: Date.now() };
    try { sessionStorage.setItem('ls-you', JSON.stringify(you)); } catch (e) {}
    walkers.push({ x: DOOR.x, t: 0, you: true });
  };

  // moodlight: the room's tint follows the real shop clock
  var mood = { at: 0, tint: null };
  function moodTint() {
    if (Date.now() - mood.at > 60000) {
      mood.at = Date.now();
      var hr = 12;
      try { hr = +new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Brisbane', hour: 'numeric', hour12: false }).format(new Date()); } catch (e) {}
      mood.tint = hr < 10 ? 'rgba(170,200,255,0.05)'
        : hr >= 17 ? 'rgba(255,140,60,0.10)'
        : hr >= 15 ? 'rgba(255,190,90,0.06)'
        : null;
    }
    return mood.tint;
  }


  function fmtT(t) {
    if (!t) return 'soon';
    var p = t.trim().split(':'), h = +p[0], ap = h >= 12 ? 'pm' : 'am';
    return (h % 12 || 12) + (p[1] && p[1] !== '00' ? ':' + p[1] : '') + ap;
  }

  function fresh(s) {
    if (!s) return false;
    var d = new Date(s.as_of.replace(/(\d{2})(\d{2})$/, '$1:$2'));
    return !isNaN(d) && (Date.now() - d.getTime()) <= STALE_MS;
  }

  function tick() {
    fetch(FEED + '?t=' + Math.floor(Date.now() / 30000), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (s) {
        if (frozen) return;
        if (snap && s.waiting > lastWaiting && s.open && !reduced) spawnWalker();
        lastWaiting = s.waiting;
        snap = s;
        renderInfo();
      })
      .catch(function () { /* keep last; fresh() decays the sign */ });
  }

  function spawnWalker() {
    walkers.push({ x: DOOR.x, t: 0 });
  }

  // ---------- fullscreen takeover (phones) ----------
  // The exact desktop scene, rotated to fill the screen — you hold the phone
  // sideways. CSS-rotates a wrapper (works under iOS rotation lock); if the
  // device really rotates to landscape we drop the rotation and just fill.
  var fs = { on: false, rot: false, overlay: null, wrap: null, anchor: null };
  function fsLayout() {
    if (!fs.on) return;
    var landscape = window.innerWidth > window.innerHeight;
    // Rotation-lock OFF flow: once the device has really gone landscape,
    // turning it back upright exits to the normal page (Jett 2026-06-12).
    if (landscape) fs.wasLandscape = true;
    else if (fs.wasLandscape) { fsClose(); return; }
    fs.rot = !landscape;
    fs.wrap.style.width = (landscape ? window.innerWidth : window.innerHeight) + 'px';
    fs.wrap.style.height = (landscape ? window.innerHeight : window.innerWidth) + 'px';
    fs.wrap.style.transform = 'translate(-50%,-50%)' + (landscape ? '' : ' rotate(90deg)');
  }
  function fsOpen() {
    if (fs.on) return;
    fs.on = true;
    fs.wasLandscape = false;
    fs.savedScroll = window.scrollY; // seamless return to the same spot
    card.hidden = true;
    var stage = host.querySelector('.ls-stage');
    fs.anchor = host.querySelector('.ls-info');
    fs.overlay = document.createElement('div'); fs.overlay.className = 'ls-fso';
    fs.wrap = document.createElement('div'); fs.wrap.className = 'ls-fsw';
    // landscape site chrome — looks like the desktop site when the phone is
    // held sideways: real header (hamburger + wordmark + exit) along the top,
    // sticky gold Book a Cut along the bottom.
    var bar = document.createElement('div'); bar.className = 'ls-fshead';
    bar.innerHTML = '<button class="ls-fsburger" aria-label="Open menu"><span></span><span></span><span></span></button>' +
      '<a class="ls-fslogo" href="index.html" aria-label="Blacksmith Barbers home"><img src="assets/logo-white.png" alt="Blacksmith"></a>' +
      '<button class="ls-fsx" aria-label="Exit full screen">&#10005;</button>' +
      '<nav class="ls-fsnav" hidden>' +
        [['index.html', 'Home'], ['shop.html', 'Shop'], ['academy.html', 'Academy'],
         ['blackrose.html', 'Blackrose'], ['barbers.html', 'Barbers'],
         ['quiz.html', 'Find Your Barber'], ['about.html', 'About'],
         ['visit.html', 'Visit'], ['events.html', 'Events']]
          .map(function (l) { return '<a href="' + l[0] + '">' + l[1] + '</a>'; }).join('') +
      '</nav>';
    bar.querySelector('.ls-fsx').addEventListener('click', fsClose);
    bar.querySelector('.ls-fsburger').addEventListener('click', function (e) {
      e.stopPropagation();
      var n = bar.querySelector('.ls-fsnav');
      n.hidden = !n.hidden;
    });
    var body = document.createElement('div'); body.className = 'ls-fsbody';
    body.appendChild(stage);
    var foot = document.createElement('a');
    foot.className = 'btn btn-gold ls-fsfoot';
    foot.href = BOOK_URLS.barber;
    foot.textContent = 'Book a Cut';
    fs.wrap.appendChild(body);
    fs.wrap.appendChild(bar);
    fs.wrap.appendChild(foot);
    fs.wrap.appendChild(card);
    fs.overlay.appendChild(fs.wrap);
    document.body.appendChild(fs.overlay);
    document.documentElement.classList.add('ls-noscroll');
    fsSettle();
    window.addEventListener('resize', fsSettle);
    window.addEventListener('orientationchange', fsSettle);
  }

  // iOS reports viewport dimensions in dribs mid-rotation — lay out now AND
  // again once it settles, so the view can never wedge half-rotated.
  var settleT = null;
  function fsSettle() {
    clearTimeout(settleT);
    fsLayout();
    settleT = setTimeout(fsLayout, 340);
  }
  // Pull the site chat INTO the rotated wrapper so booking happens without
  // flipping the phone back. Inside a transformed ancestor its fixed
  // positioning anchors to the wrapper, i.e. landscape coords.

  function fsClose() {
    if (!fs.on) return;
    fs.on = false; fs.rot = false;
    card.hidden = true;
    var stage = fs.overlay.querySelector('.ls-stage');
    fs.anchor.parentNode.insertBefore(stage, fs.anchor);
    fs.anchor.parentNode.insertBefore(card, fs.anchor);
    document.body.removeChild(fs.overlay);
    fs.overlay = fs.wrap = null;
    document.documentElement.classList.remove('ls-noscroll');
    window.removeEventListener('resize', fsSettle);
    window.removeEventListener('orientationchange', fsSettle);
    clearTimeout(settleT);
    window.scrollTo(0, fs.savedScroll || 0); // continue the scroll where they left it
  }

  // Rotation lock OFF: physically turning the phone IS the expand gesture —
  // landscape enters the locked takeover, back to portrait exits seamlessly.
  if (!MOBILE_PAN) { // min-dimension check below keeps desktops out
    var autoT = null;
    var autoEnter = function () {
      clearTimeout(autoT);
      autoT = setTimeout(function () {
        if (fs.on) return;
        if (Math.min(window.innerWidth, window.innerHeight) > 640) return; // phones only
        if (window.innerWidth > window.innerHeight) fsOpen();
      }, 240);
    };
    window.addEventListener('resize', autoEnter);
    window.addEventListener('orientationchange', autoEnter);
  }

  // ---------- barber hit areas + status card ----------
  var hits = [];
  var card = host.querySelector('.ls-card-pop');
  canvas.addEventListener('click', function (e) {
    var r = canvas.getBoundingClientRect(), x, y;
    if (fs.rot) { // invert the 90° wrapper rotation (AABB swaps css w/h)
      var cx0 = r.left + r.width / 2, cy0 = r.top + r.height / 2;
      var cw = r.height, ch = r.width;
      x = ((e.clientY - cy0) + cw / 2) * (W / cw);
      y = ((cx0 - e.clientX) + ch / 2) * (H / ch);
    } else {
      x = (e.clientX - r.left) * (W / r.width);
      y = (e.clientY - r.top) * (H / r.height);
    }
    for (var i = 0; i < hits.length; i++) {
      var h = hits[i];
      if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) {
        if (h.host) {
          hostAsk = { until: performance.now() + 9000 };
          bubbleText = 'Would you like to book in?';
          bubbleUntil = performance.now() + 9000;
          return;
        }
        if (h.yes) {
          var toShop = hostAsk && hostAsk.shop;
          hostAsk = null; bubbleUntil = 0;
          if (toShop) { window.location.href = 'shop.html?src=livingshop-' + toShop; return; }
          if (fs.on) fsClose(); // chat is a portrait activity — back to the page first
          if (window.__scBook) window.__scBook();
          return;
        }
        if (h.no) {
          var wasShop = hostAsk && hostAsk.shop;
          hostAsk = null;
          bubbleText = wasShop ? 'No worries — it\u2019s all here when you want it ✂'
                               : 'No worries — sing out if you need me ✂';
          bubbleUntil = performance.now() + 4000;
          return;
        }
        if (h.shop) { // shop cabinet → Jett asks first, no yanking people out of the room
          hostAsk = { until: performance.now() + 9000, shop: h.shop };
          bubbleText = h.shop === 'merch'
            ? 'Keen on some Blacksmith merch? I\u2019ll take you to the shop.'
            : 'Want to browse our products? I\u2019ll take you to the shop.';
          bubbleUntil = performance.now() + 9000;
          return;
        }
        if (h.toy) {
          var t0 = performance.now();
          if (h.toy === 'cat') catSay = t0 + 3200;
          else if (h.toy === 'you') {
            chat = { until: t0 + 5200, ax: h.x + h.w / 2, ay: h.y, text: 'That’s you — booked in ✂' };
          } else {
            bubbleText = h.toy === 'massage' ? 'Massage chair’s all yours while you wait.'
              : h.toy === 'bike' ? 'The lowrider? Shop legend — ask about it.'
              : h.toy === 'fridge' ? 'Cold FlipSide on us — help yourself.'
              : 'Best seat in the house — cold drink while you wait.';
            bubbleUntil = t0 + 5200;
          }
          return;
        }
        var safe = function (s) {
          return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        };
        var fi = +h.free_in || 0;
        var status = fi === 0 ? 'Free now — walk in'
          : h.cutting ? ('Cutting now' + (h.cutting_at === 'salon' ? ' (in the salon)' : '') + ' · free in ~' + fi + ' min')
          : fi > 90 ? 'Booked up today — try another barber'
          : 'Booked — free in ~' + fi + ' min';
        var book = h.book && h.book.length ? h.book : ['barber'];
        var first = safe(h.name.split(' ')[0]);
        var btns = book[0] === 'salon'
          ? '<a class="btn btn-gold" href="' + BOOK_URLS.salon + '">Book salon</a>'
          : '<button class="btn btn-gold ls-book" data-b="' + first + '">Book with ' + first + '</button>';
        if (book.length > 1)
          btns += book[1] === 'salon'
            ? '<a class="btn btn-gold ls-alt" href="' + BOOK_URLS.salon + '">Book salon</a>'
            : '<button class="btn btn-gold ls-alt ls-book" data-b="' + first + '">Book barber</button>';
        card.innerHTML = '<button class="ls-x" aria-label="Close">&times;</button>' +
          '<strong>' + safe(h.name) + '</strong><span>' + status + '</span>' + btns;
        card.querySelector('.ls-x').onclick = function (ev) { ev.stopPropagation(); card.hidden = true; };
        card.querySelectorAll('.ls-book').forEach(function (btn) {
          btn.onclick = function (ev) {
            ev.stopPropagation();
            card.hidden = true;
            if (fs.on) fsClose(); // chat is a portrait activity — back to the page first
            if (window.__scBook) window.__scBook(btn.getAttribute('data-b'));
          };
        });
        card.style.left = Math.min(86, Math.max(4, (h.x / W) * 100)) + '%';
        card.hidden = false;
        e.stopPropagation();
        return;
      }
    }
    card.hidden = true;
  });
  // pointerdown (not click): iOS Safari doesn't deliver document-level
  // clicks for taps on non-interactive elements, so "tap anywhere to close"
  // must hook the pointer itself. Taps on the card keep it open; a tap on
  // another barber closes-then-reopens via the canvas click handler.
  document.addEventListener('pointerdown', function (e) {
    if (!card.hidden && !card.contains(e.target)) card.hidden = true;
  }, true);

  // expand button on the phone card → fullscreen takeover
  if (window.innerWidth <= 640 && !MOBILE_PAN) {
    var xbtn = document.createElement('button');
    xbtn.className = 'ls-expand';
    xbtn.setAttribute('aria-label', 'Full screen');
    xbtn.innerHTML = '&#x2922;';
    xbtn.addEventListener('click', function (e) { e.stopPropagation(); fsOpen(); });
    host.querySelector('.ls-stage').appendChild(xbtn);
  }

  // ---------- info line under the canvas ----------
  function renderInfo() {
    var el = host.querySelector('.ls-info');
    if (!snap) return;
    if (!snap.open) { el.textContent = 'Lights off — back ' + fmtT(snap.hours_today.split('–')[0]) + '.'; return; }
    if (!fresh(snap) || snap.wait_mins == null) { el.textContent = 'Call for wait time — 0479 087 782'; return; }
    el.textContent = (snap.wait_mins === 0 ? 'No wait right now · ' :
      '~' + snap.wait_mins + ' min wait · ' + snap.waiting + ' waiting · ') +
      snap.barbers_on + ' on — tap a barber to book';
  }

  // ---------- drawing ----------
  function px(n) { return Math.round(n); }

  function drawSprite(key, cx, baseY, targetH, flip) {
    var im = IMGS[key];
    if (!im || !im.naturalWidth) return { x: 0, y: 0, w: 0, h: 0 };
    var s = targetH / im.naturalHeight;
    var w = im.naturalWidth * s, h = targetH;
    var x = cx - w / 2, y = baseY - h;
    ctx.save();
    if (flip) { ctx.translate(px(cx), 0); ctx.scale(-1, 1); ctx.translate(-px(cx), 0); }
    ctx.drawImage(im, px(x), px(y), px(w), px(h));
    ctx.restore();
    return { x: x, y: y, w: w, h: h };
  }

  // top portion of a sprite only — lets the desk occlude the host's legs
  function drawTorso(key, cx, baseY, targetH, frac) {
    var im = IMGS[key];
    if (!im || !im.naturalWidth) return { x: 0, y: 0, w: 0, h: 0 };
    frac = frac || 0.58;
    var sh = im.naturalHeight * frac;
    var s = targetH / sh;
    var w = im.naturalWidth * s;
    var x = cx - w / 2, y = baseY - targetH;
    ctx.drawImage(im, 0, 0, im.naturalWidth, sh, px(x), px(y), px(w), px(targetH));
    return { x: x, y: y, w: w, h: targetH };
  }

  // one bubble style for everyone — host, barbers, clients, the cat
  function drawBubble(text, cx, topY, gold, small) {
    ctx.save();
    ctx.font = '500 ' + (small ? 17 : (W < 900 ? 19 : 22)) + 'px Inter, sans-serif';
    var tw = ctx.measureText(text).width;
    var bx = Math.max(tw / 2 + 20, Math.min(cx, W - tw / 2 - 20));
    var by = Math.max(60, topY - 26);
    ctx.fillStyle = gold ? '#e3c578' : '#f3f1ea';
    ctx.beginPath();
    ctx.roundRect(bx - tw / 2 - 14, by - 22, tw + 28, small ? 32 : 38, 10);
    ctx.fill();
    ctx.moveTo(cx - 6, by + (small ? 9 : 15)); ctx.lineTo(cx + 10, by + (small ? 9 : 15)); ctx.lineTo(cx - 1, by + (small ? 23 : 29));
    ctx.fill();
    ctx.fillStyle = '#141417';
    ctx.textAlign = 'center';
    ctx.fillText(text, bx, by + (small ? 3 : 5));
    ctx.restore();
  }

  function drawSign(t) {
    var live = snap && snap.open && fresh(snap) && snap.wait_mins != null;
    var line = !snap ? '' :
      !snap.open ? 'CLOSED — BACK ' + fmtT(snap.hours_today.split('–')[0]).toUpperCase() :
      !live ? 'CALL FOR WAIT TIME' :
      snap.wait_mins === 0 ? 'NO WAIT · WALK IN' :
      '~' + snap.wait_mins + ' MIN WAIT · ' + snap.waiting + ' WAITING';
    if (!line) return;
    ctx.save();
    ctx.font = '600 ' + SIGN.font + 'px Oswald, sans-serif';
    ctx.textAlign = 'center';
    var w = ctx.measureText(line).width + 56;
    var glow = live ? 0.55 + 0.08 * Math.sin(t / 600) : 0.35;
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = '#15130c';
    ctx.fillRect(SIGN.x - w / 2, SIGN.y - 34, w, 56);
    ctx.strokeStyle = 'rgba(200,164,77,' + glow + ')';
    ctx.lineWidth = 3;
    ctx.strokeRect(SIGN.x - w / 2, SIGN.y - 34, w, 56);
    ctx.shadowColor = 'rgba(200,164,77,' + glow + ')';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#e3c578';
    ctx.fillText(line, SIGN.x, SIGN.y + 6);
    ctx.restore();
  }

  var capeCycle = ['client-cape-1', 'client-cape-2', 'client-cape-3'];

  // Eased positions: people glide (~2s) to a new chair instead of teleporting.
  var eased = {};
  function easeTo(key, tx, ty) {
    var p = eased[key] || (eased[key] = { x: tx, y: ty });
    p.x += (tx - p.x) * 0.035;
    p.y += (ty - p.y) * 0.035;
    if (Math.abs(tx - p.x) < 1) p.x = tx;
    if (Math.abs(ty - p.y) < 1) p.y = ty;
    return p;
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(IMGS[LAY.room], 0, 0, W, H);
    hits = [];
    if (LAY.FRIDGE) drawSprite('fridge', LAY.FRIDGE.x, LAY.FRIDGE.y, LAY.FRIDGE.h, false);
    if (LAY.SHOP_SIGN) { // glowing SHOP sign over the cabinet (tap = shop page)
      var S2 = LAY.SHOP_SIGN;
      ctx.save();
      ctx.font = '600 ' + S2.font + 'px Oswald, sans-serif';
      ctx.textAlign = 'center';
      var sw2 = ctx.measureText('SHOP').width + 36;
      var glow2 = 0.5 + 0.08 * Math.sin(t / 700);
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = '#15130c';
      ctx.fillRect(S2.x - sw2 / 2, S2.y - 24, sw2, 40);
      ctx.strokeStyle = 'rgba(200,164,77,' + glow2 + ')';
      ctx.lineWidth = 2;
      ctx.strokeRect(S2.x - sw2 / 2, S2.y - 24, sw2, 40);
      ctx.shadowColor = 'rgba(200,164,77,' + glow2 + ')';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#e3c578';
      ctx.fillText('SHOP', S2.x, S2.y + 4);
      ctx.restore();
    }

    var open = snap && snap.open;
    var anim = Math.floor(t / 480) % 2; // 2-frame cutting cadence

    if (open && snap.barbers) {
      // Stable order so people don't teleport between chairs on sort flips.
      var stable = snap.barbers.slice().sort(function (a, b) {
        return a.name < b.name ? -1 : 1;
      });
      // Jett's rotation: chairs belong to whoever is CUTTING. 4 chairs by
      // default; a 5th/6th slides in only when that many cuts run at once.
      var cuttingN = stable.filter(function (b) { return b.cutting; }).length;
      var chairN = Math.max(LAY.FIT ? 3 : 4, Math.min(6, cuttingN));
      var cap = LAY.CAP || 4;
      if (LAY.FIT) chairN = Math.min(cap, Math.max(chairN, Math.min(cap, stable.length)));
      var depth = LAY.CHAIR_SPAN && LAY.CHAIR_SPAN.y1 != null;
      var fit = (LAY.FIT && !depth) ? Math.min(1, 3.6 / chairN)
        : (LAY.SOFTFIT ? (chairN >= 6 ? 0.84 : chairN === 5 ? 0.92 : 1) : 1);
      var CHAIRS = [];
      if (LAY.CHAIR_SPAN) {
        var sp = LAY.CHAIR_SPAN;
        // The whole row sits 55px left of the original span at EVERY count —
        // hugs the bench, Sami clears the couch, 6 still fit (same spacing).
        // (Jett 2026-06-12, v2: "always cleaner".) REVERT = shx5 to 0.
        var shx5 = 55;
        var shx = (!LAY.FIT && !ROOM_V3) ? shx5 : 0; // v3 room spaces chairs itself
        for (var ci = 0; ci < chairN; ci++) {
          var t = chairN === 1 ? 0.5 : ci / (chairN - 1);
          CHAIRS.push({ x: sp.x0 - shx + (sp.x1 - sp.x0) * t,
                        y: depth ? sp.y + (sp.y1 - sp.y) * t : sp.y,
                        s: depth ? 1 + ((sp.s1 || 1) - 1) * t : 1 });
        }
        // far chairs first so the near ones overlap them correctly
        CHAIRS.slice().reverse().forEach(function (c) { drawSprite('chair', c.x, c.y, sp.h * fit * c.s, false); });
      } else {
        CHAIRS = LAY.CHAIRS.slice(0, chairN);
        CHAIRS.forEach(function (c) { c.s = 1; });
      }
      // cutting barbers claim chairs first, then free barbers fill the rest
      var seated = stable.filter(function (b) { return b.cutting; })
        .concat(stable.filter(function (b) { return !b.cutting; }));
      var bs = seated.slice(0, CHAIRS.length);
      var order = bs.map(function (_, i) { return i; }).reverse();
      order.forEach(function (i) {
        var b = bs[i];
        var c = CHAIRS[i], key = spriteKey(b.name) || 'ben';
        var ds = c.s || 1;
        var p = easeTo(key, c.x + BARBER_OFF.x * fit * ds, c.y + BARBER_OFF.y * ds);
        var bob = Math.round(Math.sin(t / 700 + i * 1.7)); // 1px idle life
        if (b.cutting) {
          var capes = b.cutting_at === 'salon'
            ? ['client-salon-1', 'client-salon-2', 'client-salon-3'] : capeCycle;
          drawSprite(capes[i % 3], c.x + CAPE_OFF.x * fit * ds, c.y + CAPE_OFF.y * fit * ds, SCALE.cape * fit * ds, false);
          var frame = key + '-' + (1 + anim);
          var bb = drawSprite(frame, p.x, p.y, SCALE.barber * fit * ds, true);
          people[b.name] = { cx: bb.x + bb.w / 2, top: bb.y };
          hits.push({ x: bb.x, y: bb.y, w: bb.w, h: bb.h, name: b.name, cutting: true, free_in: b.free_in, cutting_at: b.cutting_at, book: b.book });
        } else {
          var sw = sweeps[b.name];
          var bb2;
          if (sw && t < sw.until) {
            var drift = Math.sin(t / 1800 + sw.seed) * 26;
            var sx2 = p.x + 40 + drift;
            bb2 = drawSprite('sweep-' + (1 + Math.floor(t / 420) % 2), sx2, p.y + 8, SCALE.barber * fit * 0.92 * ds, drift < 0);
          } else {
            if (sw) delete sweeps[b.name];
            bb2 = drawSprite(key + '-3', p.x, p.y + bob, SCALE.barber * fit * ds, false);
          }
          people[b.name] = { cx: bb2.x + bb2.w / 2, top: bb2.y };
          hits.push({ x: bb2.x, y: bb2.y, w: bb2.w, h: bb2.h, name: b.name, cutting: false, free_in: b.free_in, cutting_at: b.cutting_at, book: b.book });
        }
      });
      void 0;
      // phone: extra cutting barbers beyond the 4 chairs -> gold pill
      var extraCut = LAY.FIT ? Math.max(0, cuttingN - (LAY.CAP || 4)) : 0;
      if (extraCut > 0) {
        ctx.save();
        ctx.font = '700 24px Oswald, sans-serif';
        var pt = '+' + extraCut + ' CUTTING';
        var pw = ctx.measureText(pt).width + 36;
        var px2 = LAY.CHAIR_SPAN.y1 != null ? 200 : W / 2, py2 = LAY.CHAIR_SPAN.y1 != null ? LAY.CHAIR_SPAN.y1 - 115 : LAY.CHAIR_SPAN.y + 62;
        ctx.fillStyle = 'rgba(16,16,19,.88)';
        ctx.beginPath(); ctx.roundRect(px2 - pw / 2, py2 - 22, pw, 40, 20); ctx.fill();
        ctx.strokeStyle = 'rgba(200,164,77,.8)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(px2 - pw / 2, py2 - 22, pw, 40, 20); ctx.stroke();
        ctx.fillStyle = '#e3c578'; ctx.textAlign = 'center';
        ctx.fillText(pt, px2, py2 + 6);
        ctx.restore();
      }
      // overflow = whoever didn't get a chair (was stable.slice(4) — that
      // re-drew a chaired barber as a double, Jett's "2 Samis" glitch).
      // First spare barber lounges in the massage chair if it's free.
      var overflow = LAY.FIT ? [] : seated.slice(CHAIRS.length);
      var lounger = null, leaner = null;
      if (overflow.length && snap.waiting <= 3 && LAY.MASSAGE && LAY.MASSAGE.sprite)
        lounger = overflow.shift();
      if (overflow.length && LAY.LEAN) leaner = overflow.shift(); // 2nd spare leans at the desk
      if (leaner) {
        var lkey = spriteKey(leaner.name) || 'ben';
        var lb = drawSprite(lkey + '-3', LAY.LEAN.x, LAY.LEAN.y + Math.round(Math.sin(t / 800)), SCALE.barber * 0.98, false);
        people[leaner.name] = { cx: lb.x + lb.w / 2, top: lb.y };
        hits.push({ x: lb.x, y: lb.y, w: lb.w, h: lb.h, name: leaner.name, cutting: false, free_in: leaner.free_in, cutting_at: leaner.cutting_at, book: leaner.book });
      }
      overflow.forEach(function (b, i) {
        var key = spriteKey(b.name) || 'ben';
        var bb = drawSprite(key + '-0', LAY.IDLE_SPOT.x + i * 60, LAY.IDLE_SPOT.y, SCALE.barber * 0.95, false);
        hits.push({ x: bb.x, y: bb.y, w: bb.w, h: bb.h, name: b.name, cutting: b.cutting, free_in: b.free_in, cutting_at: b.cutting_at, book: b.book });
      });

      // intermittent idle work: a free barber sweeps near his chair
      if (t > nextSweepAt && !reduced) {
        nextSweepAt = t + 150000 + Math.random() * 150000; // every 2.5-5 min
        var free = bs.filter(function (b) { return !b.cutting; });
        if (free.length) {
          var pk = free[Math.floor(Math.random() * free.length)]; // NOT 'pick' — that shadowed the pick() helper across draw() and broke banter + host bubbles
          sweeps[pk.name] = { until: t + 16000, seed: Math.random() * 6 };
        }
      }

      // waiting queue on the chesterfield (last seat is yours if you booked)
      var youHere = you && you.arrived;
      var waitN = Math.min(snap.waiting, youHere ? COUCH.length - 1 : 3);
      couchPos = [];
      for (var i2 = 0; i2 < waitN; i2++) {
        drawSprite(ROOM_V3 ? 'sit-' + (i2 + 1) : 'client-couch', COUCH[i2].x,
          COUCH[i2].y + Math.round(Math.sin(t / 900 + i2 * 2.3)), SCALE.couch * (COUCH[i2].s || 1), !ROOM_V3 && i2 === 1);
        couchPos[i2] = { cx: COUCH[i2].x, top: COUCH[i2].y - SCALE.couch };
      }
      if (youHere) {
        var ys = COUCH[COUCH.length - 1];
        var yb = drawSprite(ROOM_V3 ? 'sit-3' : 'client-couch', ys.x, ys.y + Math.round(Math.sin(t / 900 + 5)), SCALE.couch * (ys.s || 1), !ROOM_V3);
        ctx.save(); // floating gold YOU tag — Habbo's "that's my guy" hook
        ctx.font = '700 20px Oswald, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(200,164,77,.9)'; ctx.shadowBlur = 8;
        ctx.fillStyle = '#e3c578';
        ctx.fillText('YOU', ys.x, yb.y - 10 + Math.round(Math.sin(t / 500) * 3));
        ctx.restore();
        hits.push({ x: yb.x, y: yb.y - 34, w: yb.w, h: yb.h + 34, toy: 'you' });
      }
      // 4th waiter scores the massage chair
      if (LAY.MASSAGE && LAY.MASSAGE.sprite) {
        // v2: the chair is its own layer — reclines with a client in it
        // (or a spare barber having a breather; tap them to book)
        var occupied = snap.waiting > 3 || !!lounger;
        var mkey = occupied ? 'massage-lay' : 'massage-up';
        if (lounger) { // each barber has his OWN reclined art, lazy-loaded on first need
          var lk = 'lay-' + (spriteKey(lounger.name) || 'ben');
          if (!IMGS[lk]) { var lim = new Image(); lim.src = A + lk + '.webp?v=22'; IMGS[lk] = lim; }
          if (IMGS[lk].naturalWidth) mkey = lk; // generic until his art arrives
        }
        var mb = drawSprite(mkey,
          LAY.MASSAGE.x + (occupied ? (LAY.FIT ? 8 : 26) : 0) * (LAY.MASSAGE.flip ? -1 : 1), LAY.MASSAGE.y, LAY.MASSAGE.h * (occupied ? 0.88 : 1), !!LAY.MASSAGE.flip);
        if (lounger) {
          hits.push({ x: LAY.MASSAGE.x - 95, y: LAY.MASSAGE.y - 175, w: 230, h: 185,
                      name: lounger.name, cutting: false, free_in: lounger.free_in,
                      cutting_at: lounger.cutting_at, book: lounger.book });
          people[lounger.name] = { cx: mb.x + mb.w / 2, top: mb.y }; // bubble anchor
        }
      } else if (snap.waiting > 3 && LAY.MASSAGE)
        drawTorso('client-couch', LAY.MASSAGE.x, LAY.MASSAGE.y, 42, 0.32);
      var mOcc = LAY.MASSAGE && LAY.MASSAGE.sprite && snap.waiting > 3;
      var overflowW = snap.waiting - waitN - (mOcc ? 1 : 0) - (youHere ? 1 : 0);
      if (LAY.WPILL && overflowW > 0) {
        ctx.save();
        ctx.font = '700 22px Oswald, sans-serif';
        var wt = '+' + overflowW + ' WAITING';
        var ww = ctx.measureText(wt).width + 32;
        ctx.fillStyle = 'rgba(16,16,19,.88)';
        ctx.beginPath(); ctx.roundRect(LAY.WPILL.x - ww / 2, LAY.WPILL.y, ww, 36, 18); ctx.fill();
        ctx.strokeStyle = 'rgba(200,164,77,.8)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(LAY.WPILL.x - ww / 2, LAY.WPILL.y, ww, 36, 18); ctx.stroke();
        ctx.fillStyle = '#e3c578'; ctx.textAlign = 'center';
        ctx.fillText(wt, LAY.WPILL.x, LAY.WPILL.y + 25);
        ctx.restore();
      } else if (!LAY.WPILL && snap.waiting > 4) {
        ctx.font = '600 26px Oswald, sans-serif';
        ctx.fillStyle = '#e3c578';
        ctx.fillText('+' + (snap.waiting - 4), COUCH[2].x + 70, COUCH[2].y - 90);
      }

      // walk-in animation: door -> couch
      walkers = walkers.filter(function (wk) {
        wk.t += 1 / 160;
        var dest = wk.you ? COUCH[COUCH.length - 1]
          : COUCH[Math.min(snap.waiting, 3) - 1 < 0 ? 0 : Math.min(snap.waiting, 3) - 1];
        wk.x = DOOR.x + (dest.x - DOOR.x) * Math.min(wk.t, 1);
        drawSprite('client-walk', wk.x, DOOR.y, SCALE.walk, true);
        if (wk.t >= 1 && wk.you && you) {
          you.arrived = true;
          try { sessionStorage.setItem('ls-you', JSON.stringify(you)); } catch (e) {}
        }
        return wk.t < 1;
      });
      // booked-before-this-pageload: already seated, no entrance
      if (you && !you.arrived && !walkers.some(function (w) { return w.you; })) you.arrived = true;

      // room banter — one mutter at a time, grounded in what's really happening
      if (!reduced && t > nextChatAt && t > bubbleUntil) {
        nextChatAt = t + 30000 + Math.random() * 40000;
        var lines = [];
        bs.forEach(function (b) {
          if (b.cutting && b.cutting_at !== 'salon') lines.push({ who: b.name, text: pick(CUT_LINES) });
          else if (!b.cutting) lines.push({ who: b.name, text: snap.waiting > 0 ? 'Next!' : pick(FREE_LINES) });
        });
        // the massage-chair lounger pitches himself (twice the odds — he's the free one)
        if (lounger) { var ll = { who: lounger.name, text: pick(LOUNGE_LINES) }; lines.push(ll, ll); }
        if (leaner) lines.push({ who: leaner.name, text: pick(FREE_LINES) });
        for (var li = 0; li < waitN; li++) lines.push({ couch: li, text: pick(WAIT_LINES) });
        if (lines.length) {
          var L = pick(lines);
          chat = { until: t + 5200, who: L.who, couch: L.couch, text: L.text };
        }
      }
      if (chat && t < chat.until) {
        var anchor = chat.ax != null ? { cx: chat.ax, top: chat.ay }
          : chat.who != null ? people[chat.who] : couchPos[chat.couch];
        if (anchor) drawBubble(chat.text, anchor.cx, anchor.top, false, true);
      }

      // shop cat: rare amble (roughly every 6-12 min of open watching)
      if (catX === null && t - lastCat > 360000 && Math.random() < 0.0006) catX = -80;
      if (catX !== null) {
        catX += 0.9;
        drawSprite('cat', catX, LAY.CAT_Y, SCALE.cat, false);
        hits.push({ x: catX - 45, y: LAY.CAT_Y - 70, w: 90, h: 75, toy: 'cat' });
        if (t < catSay) drawBubble('miaow~', catX, LAY.CAT_Y - 64, false, true);
        if (catX > W + 80) { catX = null; lastCat = t; }
      }
    }

    // tap-toys: bits of the room that talk back (lowest hit priority)
    if (LAY.MASSAGE) hits.push(LAY.MASSAGE.sprite
      ? { x: LAY.MASSAGE.x - 95, y: LAY.MASSAGE.y - 175, w: 230, h: 185, toy: 'massage' }
      : { x: 20, y: 450, w: 185, h: 200, toy: 'massage' });
    if (!LAY.FIT) hits.push({ x: 25, y: 330, w: 205, h: 105, toy: 'bike' });
    if (LAY.FRIDGE) hits.push({ x: LAY.FRIDGE.x - 45, y: LAY.FRIDGE.y - LAY.FRIDGE.h, w: 90, h: LAY.FRIDGE.h, toy: 'fridge' });
    if (LAY.SHOPZONES) LAY.SHOPZONES.forEach(function (z) {
      hits.push({ x: z.x, y: z.y - 70, w: z.w, h: z.h + 70, shop: z.tag }); // incl. the sign above
    });

    if (!open && LAY.MASSAGE && LAY.MASSAGE.sprite)
      drawSprite('massage-up', LAY.MASSAGE.x, LAY.MASSAGE.y, LAY.MASSAGE.h, !!LAY.MASSAGE.flip);

    // the host at the till — tap him to open the shop chat
    if (snap) {
      var hb;
      if (HOST.stroll && !reduced) {
        if (!stroll && t > nextStrollAt) {
          stroll = { dir: -1, x: HOST.stroll.x1 };
          nextStrollAt = t + 150000 + Math.random() * 150000;
        }
        if (stroll) {
          stroll.x += stroll.dir * 0.8;
          if (stroll.x <= HOST.stroll.x0) stroll.dir = 1;
          if (stroll.dir === 1 && stroll.x >= HOST.stroll.x1) stroll = null;
        }
      }
      if (stroll) {
        var wf = 'host-walk-' + (1 + Math.floor(t / 160) % 4);
        var wy = HOST.stroll.y + Math.round(Math.sin(t / 160 * Math.PI) * 1.5);
        if (stroll.dir === 1) { // coming home — drift up to the lean spot
          var left = HOST.stroll.x1 - stroll.x;
          if (left < 120) wy = HOST.y + (HOST.stroll.y - HOST.y) * (left / 120) + Math.round(Math.sin(t / 160 * Math.PI) * 1.5);
        }
        hb = drawSprite(wf, stroll.x, wy, HOST.h * 0.97, stroll.dir === -1);
      } else {
        var hostY = HOST.y + (HOST.float ? Math.round(Math.sin(t / 450) * 4) : 0); // floating head bobs
        hb = HOST.sprite
          ? drawSprite(HOST.sprite, HOST.x, hostY, HOST.h, !!HOST.flip)
          : drawTorso('host-1', HOST.x, HOST.y, HOST.h);
      }
      // draw the till counter front OVER him so his waist cut-off hides behind it
      if (LAY.HOST_OCCLUDE) {
        var occ = IMGS[LAY.HOST_OCCLUDE.sprite];
        if (occ && occ.naturalWidth)
          ctx.drawImage(occ, px(LAY.HOST_OCCLUDE.x), px(LAY.HOST_OCCLUDE.y), px(occ.naturalWidth), px(occ.naturalHeight));
      }
      // bobbing gold "?" so people know he's tappable
      var qx = (stroll ? stroll.x : HOST.x) + (HOST.qoff || 0);
      var qy = (stroll ? HOST.stroll.y : HOST.y) - HOST.h - 14 + Math.round(Math.sin(t / 450) * 4);
      ctx.save();
      ctx.font = '700 26px Oswald, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(200,164,77,.8)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#e3c578';
      ctx.fillText('?', qx, qy);
      ctx.restore();
      hb = { x: hb.x - 30, y: qy - 34, w: hb.w + 60, h: ((stroll ? HOST.stroll.y : HOST.y) - (qy - 34)) }; // generous hit area incl. the marker
      hits.push({ x: hb.x, y: hb.y, w: hb.w, h: hb.h, host: true });
      if (!reduced && t > nextBubbleAt) {
        nextBubbleAt = t + 20000 + Math.random() * 25000; // every ~20-45s
        bubbleUntil = t + 6500;
        var pool = HOST_LINES.slice();
        if (!snap.open) pool.push('We\u2019re closed \u2014 book ahead?', 'Closed now \u2014 lock in your next cut', 'Shop\u2019s open online 24/7 \ud83d\udecd');
        else if (snap.wait_mins === 0) pool.push('No wait right now \u2014 jump in!', 'Chair\u2019s free \u2014 tap me to book');
        else if (snap.wait_mins != null) pool.push('~' + snap.wait_mins + ' min wait \u2014 need a hand?');
        bubbleText = pick(pool);
      }
      if (t < bubbleUntil && bubbleText)
        drawBubble(bubbleText, stroll ? stroll.x : HOST.x, (stroll ? HOST.stroll.y : HOST.y) - HOST.h, false, false);
      if (hostAsk && t >= hostAsk.until) hostAsk = null;
      if (hostAsk) {
        [['Yes', -52, true], ['No', 52, false]].forEach(function (cfg) {
          var bx2 = HOST.x + cfg[1], by2 = HOST.y + 38, bw2 = 86, bh2 = 40;
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(bx2 - bw2 / 2, by2 - bh2 / 2, bw2, bh2, 20);
          if (cfg[2]) { ctx.fillStyle = '#e3c578'; ctx.fill(); }
          else {
            ctx.fillStyle = 'rgba(16,16,19,.9)'; ctx.fill();
            ctx.strokeStyle = 'rgba(200,164,77,.85)'; ctx.lineWidth = 2; ctx.stroke();
          }
          ctx.font = '700 22px Oswald, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = cfg[2] ? '#141417' : '#e3c578';
          ctx.fillText(cfg[0], bx2, by2 + 8);
          ctx.restore();
          hits.unshift({ x: bx2 - bw2 / 2 - 8, y: by2 - bh2 / 2 - 8, w: bw2 + 16, h: bh2 + 16, yes: cfg[2], no: !cfg[2] });
        });
      }
    }

    // moodlight — golden arvo, warm evening; applies open OR closed so the
    // shop is always warmly lit (Jett: keep the lights on even when closed).
    var tint = snap && moodTint();
    if (tint) { ctx.fillStyle = tint; ctx.fillRect(0, 0, W, H); }

    drawSign(t); // the "CLOSED — BACK 9AM" banner still shows the hours, no dimmer
  }

  // ---------- loop ----------
  var running = false, rafId = null;
  function frame(t) {
    if (!running) return;
    try { draw(t); } catch (e) { /* one bad frame must never kill the shop */ }
    rafId = requestAnimationFrame(frame);
  }
  function setRunning(on) {
    if (on === running) return;
    running = on;
    if (on) rafId = requestAnimationFrame(frame);
    else if (rafId) cancelAnimationFrame(rafId);
  }

  function immersiveMobile() {
    if (window.innerWidth > 640) return;
    if (MOBILE_PAN) { // desktop room, phone-height, finger-pan — opens on the chairs
      host.classList.add('ls-full');
      var st = host.querySelector('.ls-stage');
      st.classList.add('ls-immersive');
      requestAnimationFrame(function () {
        st.scrollLeft = Math.max(0, (660 / W) * st.scrollWidth - st.clientWidth / 2);
      });
      return;
    }
    if (MOBILE_V1) return;
    host.classList.add('ls-full');
    host.querySelector('.ls-stage').classList.add('ls-portrait');
  }

  function start() {
    if (failed) { host.hidden = true; return; }
    immersiveMobile();
    canvas.width = W * dpr; // full-res buffer — half-res read as blur on large desktops
    canvas.height = H * dpr;
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    tick();
    setInterval(tick, 60000);

    if (reduced) { // one static frame, no loop
      var once = function () { draw(0); };
      setTimeout(once, 600); setInterval(once, 60000);
      return;
    }
    var io = new IntersectionObserver(function (es) {
      setRunning(es[0].isIntersecting && !document.hidden);
    }, { threshold: 0.05 });
    io.observe(host);
    document.addEventListener('visibilitychange', function () {
      setRunning(!document.hidden);
    });
    setRunning(true);
  }

  var frozen = false;
  window.__lsState = function (s) { snap = s; frozen = true; renderInfo(); try { draw(performance.now()); } catch (e) {} }; // test hook (freezes ticks, forces a frame)
})();
