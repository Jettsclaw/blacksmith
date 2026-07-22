/* Blacksmith — Spin the Chair.
   An LMCT-style prize wheel, reskinned mono (near-black + paper, thin gold rim).
   Self-contained: injects its own CSS, a floating trigger over the live shop,
   a bottom-sheet that glides up, AND a smaller inline wheel embedded in the
   gap just below the stage. Both surfaces share ONE spin per guest
   (localStorage); reopen / reload shows the prize they won. */
(function () {
  var host = document.getElementById('living-shop');
  if (!host) return;

  var GOLD = '#c8a44d', INK = '#0b0b0d', PAPER = '#f5f3ee';
  var LS_KEY = 'bs_wheel_prize_v1';

  // Prize set — weighted (w). Higher = lands more often. Kept realistic for a
  // barbershop floor; the "big" ones sit rare so the game stays honest.
  var PRIZES = [
    { label: 'Free\nHot Towel',      note: 'A hot-towel finish on the house with your next cut.', w: 5 },
    { label: '10% Off\nYour Cut',    note: '10% off your next Blacksmith cut. Show this at the counter.', w: 6 },
    { label: 'Free Beard\nLine-Up',  note: 'A sharp beard line-up added free to your next visit.', w: 4 },
    { label: '$10 Off\nProducts',    note: '$10 off any Blacksmith product in-store.', w: 4 },
    { label: 'Free\nCoffee',         note: 'A coffee on us while you wait in the chair.', w: 6 },
    { label: 'Skip the\nQueue',      note: 'One VIP queue-skip on a walk-in day. Show this at the desk.', w: 2 },
    { label: 'Free Neck\nShave',     note: 'A clean straight-razor neck shave, added free.', w: 4 },
    { label: 'Mystery\nGift',        note: 'A little something from the Blacksmith bench — ask the barber.', w: 3 }
  ];
  var N = PRIZES.length, SEG = 360 / N;

  /* ---------- styles ---------- */
  var css = '' +
  '.bsw-trigger{position:absolute;right:14px;bottom:14px;z-index:40;display:inline-flex;align-items:center;gap:9px;' +
    'padding:11px 16px 11px 12px;border:1px solid ' + GOLD + ';border-radius:999px;cursor:pointer;' +
    'background:rgba(11,11,13,.82);color:' + PAPER + ';font-family:Oswald,sans-serif;text-transform:uppercase;' +
    'letter-spacing:.14em;font-size:.72rem;font-weight:600;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);' +
    'box-shadow:0 10px 30px rgba(0,0,0,.5);transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s,border-color .25s}' +
  '.bsw-trigger:hover{transform:translateY(-2px);border-color:' + GOLD + ';box-shadow:0 14px 40px rgba(200,164,77,.28)}' +
  '.bsw-trigger .bsw-badge{width:12px;height:12px;border-radius:50%;background:' + GOLD + ';flex:0 0 auto;' +
    'box-shadow:0 0 0 0 rgba(200,164,77,.6);animation:bsw-pulse 2.2s infinite}' +
  '.bsw-trigger .bsw-ico{width:22px;height:22px;flex:0 0 auto;animation:bsw-spin 9s linear infinite}' +
  '@keyframes bsw-pulse{0%{box-shadow:0 0 0 0 rgba(200,164,77,.55)}70%{box-shadow:0 0 0 12px rgba(200,164,77,0)}100%{box-shadow:0 0 0 0 rgba(200,164,77,0)}}' +
  '@keyframes bsw-spin{to{transform:rotate(360deg)}}' +
  '.bsw-trigger.won .bsw-ico{animation:none}' +
  '@media(max-width:640px){.bsw-trigger{right:10px;bottom:10px;font-size:.66rem;padding:9px 13px 9px 10px}}' +

  /* mini wheel — compact, sits in the live card beside the status ("Lights off").
     Uses .bsw-mini descendant selectors so it beats the base rules regardless of order. */
  '.bsw-mini{display:flex;flex-direction:column;align-items:center;gap:10px;flex:0 0 auto;' +
    'font-family:Inter,system-ui,sans-serif;color:' + PAPER + '}' +
  '.bsw-mini .bsw-wheelwrap{width:132px}' +
  '.bsw-mini .bsw-pointer{border-left-width:9px;border-right-width:9px;border-top-width:16px;top:-3px}' +
  '.bsw-mini .bsw-hub{font-size:.9rem;border-width:1.5px}' +
  '.bsw-mini .bsw-wheel{box-shadow:0 0 0 4px ' + INK + ',0 0 0 6px ' + GOLD + ',0 12px 26px rgba(0,0,0,.5)}' +
  '.bsw-mini .bsw-spin{width:132px;margin:0;padding:9px 12px;font-size:.68rem;letter-spacing:.12em;border-radius:9px}' +
  '.bsw-mini .bsw-result{margin:0;max-width:150px}' +
  '.bsw-mini .bsw-result .rl{font-size:.92rem;margin:0 0 4px}' +
  '.bsw-mini .bsw-result .rn{display:none}' +
  '.bsw-mini .bsw-result .rc{padding:8px 14px;font-size:.68rem}' +

  '.bsw-scrim{position:fixed;inset:0;z-index:9998;background:rgba(4,4,6,.72);backdrop-filter:blur(3px);' +
    '-webkit-backdrop-filter:blur(3px);opacity:0;transition:opacity .3s;pointer-events:none}' +
  '.bsw-scrim.open{opacity:1;pointer-events:auto}' +
  '.bsw-sheet{position:fixed;left:50%;bottom:0;z-index:9999;width:min(460px,100vw);transform:translate(-50%,102%);' +
    'background:linear-gradient(180deg,#161618 0%,#0c0c0e 100%);border:1px solid #2a2a30;border-bottom:none;' +
    'border-radius:22px 22px 0 0;box-shadow:0 -24px 70px rgba(0,0,0,.6);padding:10px 20px 26px;' +
    'transition:transform .42s cubic-bezier(.2,.9,.2,1);font-family:Inter,system-ui,sans-serif;color:' + PAPER + '}' +
  '.bsw-sheet.open{transform:translate(-50%,0)}' +
  '.bsw-grip{width:44px;height:5px;border-radius:3px;background:#3a3a42;margin:2px auto 12px;cursor:grab}' +
  '.bsw-x{position:absolute;top:12px;right:14px;width:34px;height:34px;border-radius:50%;border:1px solid #34343c;' +
    'background:transparent;color:' + PAPER + ';font-size:20px;line-height:1;cursor:pointer;transition:border-color .2s,color .2s}' +
  '.bsw-x:hover{border-color:' + GOLD + ';color:' + GOLD + '}' +
  '.bsw-eyebrow{font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:.28em;font-size:.66rem;' +
    'color:' + GOLD + ';text-align:center;margin:0 0 2px}' +
  '.bsw-title{font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:.04em;font-weight:600;' +
    'font-size:1.5rem;text-align:center;margin:0 0 14px;color:' + PAPER + '}' +
  '.bsw-wheelwrap{position:relative;width:min(320px,74vw);aspect-ratio:1;margin:0 auto}' +
  '.bsw-pointer{position:absolute;top:-4px;left:50%;transform:translateX(-50%);z-index:3;width:0;height:0;' +
    'border-left:15px solid transparent;border-right:15px solid transparent;border-top:26px solid ' + GOLD + ';' +
    'filter:drop-shadow(0 3px 4px rgba(0,0,0,.6))}' +
  '.bsw-wheel{width:100%;height:100%;border-radius:50%;transform:rotate(0deg);' +
    'transition:transform 5.2s cubic-bezier(.16,.84,.28,1);will-change:transform;' +
    'box-shadow:0 0 0 6px ' + INK + ',0 0 0 8px ' + GOLD + ',0 22px 50px rgba(0,0,0,.55)}' +
  '.bsw-hub{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2;width:20%;height:20%;' +
    'border-radius:50%;background:' + INK + ';border:2px solid ' + GOLD + ';display:flex;align-items:center;' +
    'justify-content:center;font-family:Oswald,sans-serif;font-weight:700;font-size:1.4rem;color:' + GOLD + ';' +
    'box-shadow:0 6px 18px rgba(0,0,0,.5)}' +
  '.bsw-spin{display:block;width:min(320px,74vw);margin:20px auto 0;padding:15px 20px;border:none;cursor:pointer;' +
    'border-radius:12px;background:' + GOLD + ';color:' + INK + ';font-family:Oswald,sans-serif;text-transform:uppercase;' +
    'letter-spacing:.18em;font-weight:700;font-size:1rem;transition:transform .2s,filter .2s}' +
  '.bsw-spin:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.06)}' +
  '.bsw-spin:disabled{opacity:.45;cursor:default}' +
  '.bsw-result{text-align:center;margin:16px auto 0;max-width:340px;overflow:hidden;max-height:0;opacity:0;' +
    'transition:max-height .5s ease,opacity .5s ease}' +
  '.bsw-result.show{max-height:260px;opacity:1}' +
  '.bsw-result .rl{font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:.03em;font-size:1.5rem;' +
    'color:' + GOLD + ';margin:0 0 6px}' +
  '.bsw-result .rn{font-size:.92rem;line-height:1.5;color:#cfcfcf;margin:0 0 14px}' +
  '.bsw-result .rc{display:inline-block;padding:12px 22px;border-radius:10px;background:' + PAPER + ';color:' + INK + ';' +
    'font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:.14em;font-weight:600;font-size:.82rem;' +
    'text-decoration:none;transition:transform .2s}' +
  '.bsw-result .rc:hover{transform:translateY(-2px)}' +
  '.bsw-fine{text-align:center;font-size:.68rem;color:#77777f;margin:14px 0 0;letter-spacing:.02em}' +
  '@media(prefers-reduced-motion:reduce){.bsw-wheel{transition-duration:2.4s}.bsw-trigger .bsw-ico{animation:none}.bsw-trigger .bsw-badge{animation:none}}';

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- trigger (over the stage) ---------- */
  var wrap = host.querySelector('.wrap') || host;
  var trigger = document.createElement('button');
  trigger.className = 'bsw-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.innerHTML =
    '<svg class="bsw-ico" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="10" stroke="' + GOLD + '" stroke-width="1.6"/>' +
      '<path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1" stroke="' + GOLD + '" stroke-width="1.1"/>' +
      '<circle cx="12" cy="12" r="2.4" fill="' + GOLD + '"/></svg>' +
    '<span class="bsw-label">Spin to win</span>' +
    '<span class="bsw-badge" aria-hidden="true"></span>';
  wrap.appendChild(trigger);

  /* ---------- mini wheel (in the live card, beside the status) ---------- */
  var mini = document.createElement('div');
  mini.className = 'bsw-mini';
  mini.innerHTML =
    '<div class="bsw-wheelwrap bsw-wheelwrap--mini">' +
      '<div class="bsw-pointer" aria-hidden="true"></div>' +
      '<canvas class="bsw-wheel" width="640" height="640"></canvas>' +
      '<div class="bsw-hub" aria-hidden="true">B</div>' +
    '</div>' +
    '<button class="bsw-spin bsw-spin--mini" type="button">Spin to win</button>' +
    '<div class="bsw-result bsw-result--mini" aria-live="polite">' +
      '<p class="rl"></p><p class="rn"></p><a class="rc" href="#book">Book &rarr;</a></div>';
  // sit it in the gap next to "Lights off" inside the live-wait card; fall back
  // to just under the stage if the live card isn't present.
  var lwMain = document.querySelector('#live-wait .lw-main');
  if (lwMain) lwMain.appendChild(mini);
  else {
    var stage = wrap.querySelector('.ls-stage');
    if (stage && stage.parentNode) stage.parentNode.insertBefore(mini, stage.nextSibling);
    else wrap.appendChild(mini);
  }

  /* ---------- sheet ---------- */
  var scrim = document.createElement('div'); scrim.className = 'bsw-scrim';
  var sheet = document.createElement('div');
  sheet.className = 'bsw-sheet'; sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', 'Spin the Chair prize wheel');
  sheet.innerHTML =
    '<button class="bsw-x" type="button" aria-label="Close">&times;</button>' +
    '<div class="bsw-grip" aria-hidden="true"></div>' +
    '<p class="bsw-eyebrow">Blacksmith &middot; on the house</p>' +
    '<h2 class="bsw-title">Spin the Chair</h2>' +
    '<div class="bsw-wheelwrap">' +
      '<div class="bsw-pointer" aria-hidden="true"></div>' +
      '<canvas class="bsw-wheel" width="640" height="640"></canvas>' +
      '<div class="bsw-hub" aria-hidden="true">B</div>' +
    '</div>' +
    '<button class="bsw-spin" type="button">Spin the wheel</button>' +
    '<div class="bsw-result" aria-live="polite">' +
      '<p class="rl"></p><p class="rn"></p><a class="rc" href="#book">Book your chair &rarr;</a></div>' +
    '<p class="bsw-fine">One spin per guest &middot; prizes redeemable in-store at Blacksmith Barbers.</p>';
  document.body.appendChild(scrim);
  document.body.appendChild(sheet);

  /* ---------- build a "face" for each surface (inline + sheet) ---------- */
  function makeFace(root) {
    var f = {
      canvas: root.querySelector('.bsw-wheel'),
      spinBtn: root.querySelector('.bsw-spin'),
      resultBox: root.querySelector('.bsw-result')
    };
    f.rl = f.resultBox.querySelector('.rl');
    f.rn = f.resultBox.querySelector('.rn');
    return f;
  }
  var faces = [makeFace(mini), makeFace(sheet)];

  /* ---------- draw each wheel ---------- */
  function drawWheel(canvas) {
    var ctx = canvas.getContext('2d');
    var S = canvas.width, R = S / 2, cx = R, cy = R;
    ctx.clearRect(0, 0, S, S);
    for (var i = 0; i < N; i++) {
      var a0 = (-90 + i * SEG) * Math.PI / 180;
      var a1 = (-90 + (i + 1) * SEG) * Math.PI / 180;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R - 6, a0, a1); ctx.closePath();
      var dark = i % 2 === 0;
      ctx.fillStyle = dark ? '#141416' : PAPER; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = GOLD; ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((a0 + a1) / 2);
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillStyle = dark ? PAPER : INK;
      var lines = PRIZES[i].label.split('\n');
      var fs = 27; ctx.font = '700 ' + fs + 'px Oswald, sans-serif';
      var lh = fs + 3, y0 = -((lines.length - 1) * lh) / 2;
      for (var l = 0; l < lines.length; l++) {
        ctx.fillText(lines[l], R - 26, y0 + l * lh);
      }
      ctx.restore();
    }
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.20 + 4, 0, Math.PI * 2);
    ctx.fillStyle = INK; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = GOLD; ctx.stroke();
  }
  faces.forEach(function (f) { drawWheel(f.canvas); });

  /* ---------- shared spin logic ---------- */
  var spinning = false, hasWon = false;

  function pickIndex() {
    var total = 0, i; for (i = 0; i < N; i++) total += PRIZES[i].w;
    var r = Math.random() * total, acc = 0;
    for (i = 0; i < N; i++) { acc += PRIZES[i].w; if (r <= acc) return i; }
    return N - 1;
  }

  function landAngle(i) { return 360 * 2 - (i * SEG + SEG / 2); }

  // Show the win on a face. If it's not the face that animated, snap it to the
  // landed position instantly so both wheels agree.
  function reflectWin(f, i, animatedFace) {
    var p = PRIZES[i];
    f.rl.textContent = p.label.replace(/\n/g, ' ');
    f.rn.textContent = p.note;
    f.resultBox.classList.add('show');
    f.spinBtn.disabled = true;
    f.spinBtn.textContent = 'You won!';
    if (f !== animatedFace) {
      f.canvas.style.transition = 'none';
      f.canvas.style.transform = 'rotate(' + landAngle(i) + 'deg)';
      requestAnimationFrame(function () { f.canvas.style.transition = ''; });
    }
  }

  function commitWin(i, animatedFace) {
    hasWon = true;
    try { localStorage.setItem(LS_KEY, String(i)); } catch (e) {}
    faces.forEach(function (f) { reflectWin(f, i, animatedFace); });
    trigger.classList.add('won');
    trigger.querySelector('.bsw-label').textContent = 'Prize won';
  }

  function spinFace(f) {
    if (spinning || hasWon) return;
    spinning = true;
    faces.forEach(function (x) { x.spinBtn.disabled = true; });
    f.spinBtn.textContent = 'Spinning…';
    var i = pickIndex();
    var jitter = (Math.random() - 0.5) * SEG * 0.6;
    var target = 360 * 6 - (i * SEG + SEG / 2) + jitter;
    f.canvas.style.transform = 'rotate(' + target + 'deg)';
    var done = false;
    function finish() { if (done) return; done = true; spinning = false; commitWin(i, f); }
    f.canvas.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 5600); // fallback if transitionend misfires
  }
  faces.forEach(function (f) {
    f.spinBtn.addEventListener('click', function () { spinFace(f); });
  });

  /* ---------- restore prior win (both surfaces) ---------- */
  (function restore() {
    var saved = null; try { saved = localStorage.getItem(LS_KEY); } catch (e) {}
    if (saved === null || saved === '') return;
    var i = parseInt(saved, 10); if (isNaN(i) || i < 0 || i >= N) return;
    hasWon = true;
    faces.forEach(function (f) {
      f.canvas.style.transition = 'none';
      f.canvas.style.transform = 'rotate(' + landAngle(i) + 'deg)';
      requestAnimationFrame(function () { f.canvas.style.transition = ''; });
      f.rl.textContent = PRIZES[i].label.replace(/\n/g, ' ');
      f.rn.textContent = PRIZES[i].note;
      f.resultBox.classList.add('show');
      f.spinBtn.disabled = true;
      f.spinBtn.textContent = 'Already spun';
    });
    trigger.classList.add('won');
    trigger.querySelector('.bsw-label').textContent = 'Prize won';
  })();

  /* ---------- open / close sheet ---------- */
  var lastFocus = null;
  function open() {
    lastFocus = document.activeElement;
    scrim.classList.add('open'); sheet.classList.add('open');
    document.body.style.overflow = 'hidden';
    var sheetBtn = faces[1].spinBtn;
    setTimeout(function () { (hasWon ? sheet.querySelector('.bsw-x') : sheetBtn).focus(); }, 300);
  }
  function close() {
    scrim.classList.remove('open'); sheet.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  trigger.addEventListener('click', open);
  scrim.addEventListener('click', close);
  sheet.querySelector('.bsw-x').addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sheet.classList.contains('open')) close();
  });

  /* ---------- swipe-down to close (touch) ---------- */
  var y0t = null;
  sheet.addEventListener('touchstart', function (e) { y0t = e.touches[0].clientY; }, { passive: true });
  sheet.addEventListener('touchmove', function (e) {
    if (y0t === null) return;
    var dy = e.touches[0].clientY - y0t;
    if (dy > 0) sheet.style.transform = 'translate(-50%,' + dy + 'px)';
  }, { passive: true });
  sheet.addEventListener('touchend', function (e) {
    if (y0t === null) return;
    var dy = e.changedTouches[0].clientY - y0t;
    sheet.style.transform = '';
    if (dy > 90) close();
    y0t = null;
  });
})();
