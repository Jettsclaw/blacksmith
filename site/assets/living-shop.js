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

  // Two rooms, one engine: landscape for desktop, a portrait recomposition
  // for phones (fills the screen, no zoom/pan). Anchors are per-layout.
  var LAYOUTS = {
    landscape: {
      room: 'room', W: 1584, H: 672,
      CHAIR_SPAN: { x0: 300, x1: 950, y: 545, h: 150 }, // chairs are sprites, spaced by live count
      BARBER_OFF: { x: 72, y: 12 }, CAPE_OFF: { x: 0, y: -6 },
      COUCH: [{ x: 1118, y: 505 }, { x: 1208, y: 505 }, { x: 1295, y: 505 }],
      DOOR: { x: 1500, y: 640 }, SIGN: { x: 620, y: 118, font: 34 }, CAT_Y: 650,
      MASSAGE: { x: 118, y: 534 },
      HOST: { x: 1336, y: 466, h: 64 }, IDLE_SPOT: { x: 1060, y: 560 },
      SCALE: { barber: 210, cape: 165, couch: 140, walk: 185, cat: 64 }
    },
    portrait: {
      room: 'room-p', W: 768, H: 1376,
      CHAIR_SPAN: { x0: 130, x1: 640, y: 880, h: 190 },
      FIT: true, // scale people down as more chairs slide in
      BARBER_OFF: { x: 64, y: 6 }, CAPE_OFF: { x: 0, y: -52 },
      COUCH: [{ x: 170, y: 1305 }, { x: 350, y: 1305 }, { x: 520, y: 1305 }],
      DOOR: { x: 740, y: 1100 }, SIGN: { x: 384, y: 238, font: 30 },
      HOST: { x: 655, y: 1308, h: 150, sprite: 'host-couch' },
      IDLE_SPOT: { x: 660, y: 1000 },
      CAT_Y: 1110,
      SCALE: { barber: 235, cape: 185, couch: 150, walk: 165, cat: 56 }
    }
  };
  var LAY = LAYOUTS[window.innerWidth <= 640 ? 'portrait' : 'landscape'];
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
  ['client-cape-1','client-cape-2','client-cape-3','client-salon-1','client-salon-2','client-salon-3','client-walk','client-couch','cat','sweep-1','sweep-2','host-1','host-2','host-couch','host-stand','chair']
    .forEach(function (n) { toLoad.push(n); });

  var loaded = 0, failed = false;
  toLoad.forEach(function (n) {
    var im = new Image();
    im.onload = function () { if (++loaded === toLoad.length) start(); };
    im.onerror = function () { failed = true; };
    im.src = A + n + '.webp?v=8';
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
  var nextSweepAt = 25000; // first sweep ~25s in, then every few minutes
  var bubbleUntil = 0, bubbleText = '', nextBubbleAt = 5000;
  var HOST = LAY.HOST;


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

  // ---------- barber hit areas + status card ----------
  var hits = [];
  var card = host.querySelector('.ls-card-pop');
  canvas.addEventListener('click', function (e) {
    var r = canvas.getBoundingClientRect();
    var sx = W / r.width, sy = H / r.height;
    var x = (e.clientX - r.left) * sx, y = (e.clientY - r.top) * sy;
    for (var i = 0; i < hits.length; i++) {
      var h = hits[i];
      if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) {
        if (h.host) {
          if (window.__scOpen) window.__scOpen();
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
      if (LAY.FIT) chairN = Math.max(chairN, Math.min(4, stable.length));
      var fit = LAY.FIT ? Math.min(1, 3.6 / chairN) : 1;
      var CHAIRS = [];
      if (LAY.CHAIR_SPAN) {
        var sp = LAY.CHAIR_SPAN;
        for (var ci = 0; ci < chairN; ci++)
          CHAIRS.push({ x: sp.x0 + (sp.x1 - sp.x0) * (chairN === 1 ? 0.5 : ci / (chairN - 1)), y: sp.y });
        CHAIRS.forEach(function (c) { drawSprite('chair', c.x, c.y, sp.h * fit, false); });
      } else {
        CHAIRS = LAY.CHAIRS.slice(0, chairN);
      }
      // cutting barbers claim chairs first, then free barbers fill the rest
      var seated = stable.filter(function (b) { return b.cutting; })
        .concat(stable.filter(function (b) { return !b.cutting; }));
      var bs = seated.slice(0, CHAIRS.length);
      bs.forEach(function (b, i) {
        var c = CHAIRS[i], key = spriteKey(b.name) || 'ben';
        var p = easeTo(key, c.x + BARBER_OFF.x * fit, c.y + BARBER_OFF.y);
        var bob = Math.round(Math.sin(t / 700 + i * 1.7)); // 1px idle life
        if (b.cutting) {
          var capes = b.cutting_at === 'salon'
            ? ['client-salon-1', 'client-salon-2', 'client-salon-3'] : capeCycle;
          drawSprite(capes[i % 3], c.x + CAPE_OFF.x * fit, c.y + CAPE_OFF.y * fit, SCALE.cape * fit, false);
          var frame = key + '-' + (1 + anim);
          var bb = drawSprite(frame, p.x, p.y, SCALE.barber * fit, true);
          hits.push({ x: bb.x, y: bb.y, w: bb.w, h: bb.h, name: b.name, cutting: true, free_in: b.free_in, cutting_at: b.cutting_at, book: b.book });
        } else {
          var sw = sweeps[b.name];
          var bb2;
          if (sw && t < sw.until) {
            var drift = Math.sin(t / 1800 + sw.seed) * 26;
            var sx2 = p.x + 40 + drift;
            bb2 = drawSprite(key + '-0', sx2, p.y + 8, SCALE.barber, false);
            drawSprite('broom', sx2 - SCALE.barber * fit * 0.34 + drift * 0.25, p.y + 10, SCALE.barber * fit * 0.82, false);
          } else {
            if (sw) delete sweeps[b.name];
            bb2 = drawSprite(key + '-3', p.x, p.y + bob, SCALE.barber * fit, false);
          }
          hits.push({ x: bb2.x, y: bb2.y, w: bb2.w, h: bb2.h, name: b.name, cutting: false, free_in: b.free_in, cutting_at: b.cutting_at, book: b.book });
        }
      });
      // overflow barbers idle by the shelf
      stable.slice(4).forEach(function (b, i) {
        var key = spriteKey(b.name) || 'ben';
        var bb = drawSprite(key + '-0', LAY.IDLE_SPOT.x + i * 60, LAY.IDLE_SPOT.y, SCALE.barber * 0.95, false);
        hits.push({ x: bb.x, y: bb.y, w: bb.w, h: bb.h, name: b.name, cutting: b.cutting, free_in: b.free_in, cutting_at: b.cutting_at, book: b.book });
      });

      // intermittent idle work: a free barber sweeps near his chair
      if (t > nextSweepAt && !reduced) {
        nextSweepAt = t + 150000 + Math.random() * 150000; // every 2.5-5 min
        var free = bs.filter(function (b) { return !b.cutting; });
        if (free.length) {
          var pick = free[Math.floor(Math.random() * free.length)];
          sweeps[pick.name] = { until: t + 16000, seed: Math.random() * 6 };
        }
      }

      // waiting queue on the chesterfield
      var waitN = Math.min(snap.waiting, 3);
      for (var i2 = 0; i2 < waitN; i2++)
        drawSprite('client-couch', COUCH[i2].x,
          COUCH[i2].y + Math.round(Math.sin(t / 900 + i2 * 2.3)), SCALE.couch, i2 === 1);
      // 4th waiter scores the massage chair — just his head peeking over
      // the backrest, watching the cuts (the chair faces the mirrors now)
      if (snap.waiting > 3 && LAY.MASSAGE)
        drawTorso('client-couch', LAY.MASSAGE.x, LAY.MASSAGE.y, 42, 0.32);
      if (snap.waiting > 4) {
        ctx.font = '600 26px Oswald, sans-serif';
        ctx.fillStyle = '#e3c578';
        ctx.fillText('+' + (snap.waiting - 4), COUCH[2].x + 70, COUCH[2].y - 90);
      }

      // walk-in animation: door -> couch
      walkers = walkers.filter(function (wk) {
        wk.t += 1 / 160;
        wk.x = DOOR.x + (COUCH[Math.min(snap.waiting, 3) - 1 < 0 ? 0 : Math.min(snap.waiting, 3) - 1].x - DOOR.x) * Math.min(wk.t, 1);
        drawSprite('client-walk', wk.x, DOOR.y, SCALE.walk, true);
        return wk.t < 1;
      });

      // shop cat: rare amble (roughly every 6-12 min of open watching)
      if (catX === null && t - lastCat > 360000 && Math.random() < 0.0006) catX = -80;
      if (catX !== null) {
        catX += 0.9;
        drawSprite('cat', catX, LAY.CAT_Y, SCALE.cat, false);
        if (catX > W + 80) { catX = null; lastCat = t; }
      }
    }

    // the host at the till — tap him to open the shop chat
    if (snap) {
      var wave = Math.floor(t / 700) % 6 === 0; // occasional wave
      var hb = HOST.sprite
        ? drawSprite(HOST.sprite, HOST.x, HOST.y, HOST.h, false)
        : drawTorso(wave ? 'host-2' : 'host-1', HOST.x, HOST.y, HOST.h);
      // true occlusion: repaint the desk's own pixels over his lower half
      if (LAY.HOST_COVER) {
        var hc = LAY.HOST_COVER;
        ctx.drawImage(IMGS[LAY.room], hc.x, hc.y, hc.w, hc.h, hc.x, hc.y, hc.w, hc.h);
      }
      // bobbing gold "?" so people know he's tappable
      var qy = HOST.y - HOST.h - 16 + Math.round(Math.sin(t / 450) * 4);
      ctx.save();
      ctx.font = '700 26px Oswald, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(200,164,77,.8)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#e3c578';
      ctx.fillText('?', HOST.x, qy);
      ctx.restore();
      hb = { x: hb.x - 12, y: qy - 30, w: hb.w + 24, h: (HOST.y - (qy - 30)) }; // generous hit area incl. the marker
      hits.push({ x: hb.x, y: hb.y, w: hb.w, h: hb.h, host: true });
      if (!reduced && t > nextBubbleAt) {
        nextBubbleAt = t + 40000 + Math.random() * 50000;
        bubbleUntil = t + 6500;
        bubbleText = !snap.open ? 'We\u2019re closed \u2014 book ahead?'
          : snap.wait_mins === 0 ? 'No wait right now \u2014 jump in!'
          : snap.wait_mins != null ? '~' + snap.wait_mins + ' min wait \u2014 need a hand?'
          : 'Need a hand?';
      }
      if (t < bubbleUntil && bubbleText) {
        ctx.save();
        ctx.font = '500 ' + (W < 900 ? 19 : 22) + 'px Inter, sans-serif';
        var tw = ctx.measureText(bubbleText).width;
        var bx = Math.min(HOST.x, W - tw / 2 - 40), by = HOST.y - HOST.h - 26;
        ctx.fillStyle = '#f3f1ea';
        ctx.beginPath();
        ctx.roundRect(bx - tw / 2 - 14, by - 22, tw + 28, 38, 10);
        ctx.fill();
        ctx.moveTo(bx + 2, by + 16); ctx.lineTo(bx + 16, by + 16); ctx.lineTo(bx + 4, by + 30);
        ctx.fill();
        ctx.fillStyle = '#141417';
        ctx.textAlign = 'center';
        ctx.fillText(bubbleText, bx, by + 5);
        ctx.restore();
      }
    }

    drawSign(t);

    if (snap && !snap.open) {
      ctx.fillStyle = 'rgba(5,5,8,0.62)';
      ctx.fillRect(0, 0, W, H);
      // the host at the till — tap him to open the shop chat
    if (snap) {
      var wave = Math.floor(t / 700) % 6 === 0; // occasional wave
      var hb = HOST.sprite
        ? drawSprite(HOST.sprite, HOST.x, HOST.y, HOST.h, false)
        : drawTorso(wave ? 'host-2' : 'host-1', HOST.x, HOST.y, HOST.h);
      // true occlusion: repaint the desk's own pixels over his lower half
      if (LAY.HOST_COVER) {
        var hc = LAY.HOST_COVER;
        ctx.drawImage(IMGS[LAY.room], hc.x, hc.y, hc.w, hc.h, hc.x, hc.y, hc.w, hc.h);
      }
      // bobbing gold "?" so people know he's tappable
      var qy = HOST.y - HOST.h - 16 + Math.round(Math.sin(t / 450) * 4);
      ctx.save();
      ctx.font = '700 26px Oswald, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(200,164,77,.8)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#e3c578';
      ctx.fillText('?', HOST.x, qy);
      ctx.restore();
      hb = { x: hb.x - 12, y: qy - 30, w: hb.w + 24, h: (HOST.y - (qy - 30)) }; // generous hit area incl. the marker
      hits.push({ x: hb.x, y: hb.y, w: hb.w, h: hb.h, host: true });
      if (!reduced && t > nextBubbleAt) {
        nextBubbleAt = t + 40000 + Math.random() * 50000;
        bubbleUntil = t + 6500;
        bubbleText = !snap.open ? 'We\u2019re closed \u2014 book ahead?'
          : snap.wait_mins === 0 ? 'No wait right now \u2014 jump in!'
          : snap.wait_mins != null ? '~' + snap.wait_mins + ' min wait \u2014 need a hand?'
          : 'Need a hand?';
      }
      if (t < bubbleUntil && bubbleText) {
        ctx.save();
        ctx.font = '500 ' + (W < 900 ? 19 : 22) + 'px Inter, sans-serif';
        var tw = ctx.measureText(bubbleText).width;
        var bx = Math.min(HOST.x, W - tw / 2 - 40), by = HOST.y - HOST.h - 26;
        ctx.fillStyle = '#f3f1ea';
        ctx.beginPath();
        ctx.roundRect(bx - tw / 2 - 14, by - 22, tw + 28, 38, 10);
        ctx.fill();
        ctx.moveTo(bx + 2, by + 16); ctx.lineTo(bx + 16, by + 16); ctx.lineTo(bx + 4, by + 30);
        ctx.fill();
        ctx.fillStyle = '#141417';
        ctx.textAlign = 'center';
        ctx.fillText(bubbleText, bx, by + 5);
        ctx.restore();
      }
    }

    drawSign(t); // sign stays readable above the dimmer
    }
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
    host.classList.add('ls-full');
    host.querySelector('.ls-stage').classList.add('ls-portrait');
  }

  function start() {
    if (failed) { host.hidden = true; return; }
    immersiveMobile();
    canvas.width = W * dpr / 2; // scene is pixel art upscaled in CSS; half-res buffer keeps it crisp + cheap
    canvas.height = H * dpr / 2;
    ctx = canvas.getContext('2d');
    ctx.scale(dpr / 2, dpr / 2);
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
