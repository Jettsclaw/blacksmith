/* Living Shop Phase 1 — live wait card.
   Feature flag: hidden until ?livewait is in the URL (or LIVE_WAIT_ON = true
   once Jett approves). Data: PII-free snapshot published from the shop every
   60s. Staleness rule: >5 min old = never show the number as live. */
(function () {
  var LIVE_WAIT_ON = true; // approved by Jett 2026-06-11 (numbers verified vs the room)
  var FEED = 'https://raw.githubusercontent.com/automaitions/blacksmith-queue-feed/main/queue.json';
  var PHONE = '0479 087 782';
  // raw.githubusercontent's CDN ignores query strings and caches 300s, so a
  // healthy feed can legitimately read up to ~6 min old (300s CDN + 60s poll).
  // 8 min = genuinely dead feed, not CDN lag. (True 60s freshness needs the
  // Vercel KV endpoint — swap FEED + tighten this when that lands.)
  var STALE_MS = 8 * 60 * 1000;

  var section = document.getElementById('live-wait');
  if (!section) return;
  if (!LIVE_WAIT_ON && !/[?&]livewait/.test(location.search)) return;

  var el = function (id) { return document.getElementById(id); };

  function fmtHours(h) {
    if (!h || h === 'closed today') return h;
    return h.split('–').map(function (t) {
      var p = t.split(':'), hr = +p[0], ap = hr >= 12 ? 'pm' : 'am';
      return (hr % 12 || 12) + (p[1] !== '00' ? ':' + p[1] : '') + ap;
    }).join(' – ');
  }

  function fmtAsOf(d) {
    var h = d.getHours(), m = ('0' + d.getMinutes()).slice(-2);
    var ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12;
    return 'as of ' + h + ':' + m + ap;
  }

  function fmtClock(d) {
    var h = d.getHours(), m = ('0' + d.getMinutes()).slice(-2);
    var ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12;
    return h + ':' + m + ap;
  }

  function render(snap) {
    var asOf = new Date(snap.as_of.replace(/(\d{2})(\d{2})$/, '$1:$2'));
    var stale = isNaN(asOf) || (Date.now() - asOf.getTime()) > STALE_MS;
    var cta = el('lw-cta'), join = el('lw-join');
    section.hidden = false;
    section.classList.toggle('lw-closed', !snap.open);

    if (!snap.open) {
      el('lw-big').textContent = 'Lights off';
      el('lw-sub').textContent = 'Back ' + (snap.hours_today === 'closed today'
        ? 'tomorrow' : fmtHours(snap.hours_today).split(' – ')[0]) + ' — see you then.';
      el('lw-asof').textContent = '';
      el('lw-barbers').innerHTML = '';
      el('lw-hours').textContent = snap.hours_today === 'closed today'
        ? 'Closed today' : 'Today: ' + fmtHours(snap.hours_today);
      // CLOSED matrix: primary reveals Book Now, secondary reveals tomorrow's queue.
      cta.textContent = 'Book Now';
      cta.setAttribute('aria-controls', 'lw-book');
      join.innerHTML = 'Join tomorrow&rsquo;s queue &rarr;';
      join.setAttribute('aria-controls', 'lw-queue');
      return;
    }

    // OPEN matrix: primary joins the walk-in queue, secondary reveals Book Now.
    cta.textContent = 'Join the Queue';
    cta.removeAttribute('aria-controls');
    cta.setAttribute('aria-expanded', 'false');
    join.innerHTML = 'Book Now &rarr;';
    join.setAttribute('aria-controls', 'lw-book');

    if (stale) {
      el('lw-big').textContent = 'Call for wait time';
      el('lw-sub').textContent = PHONE;
      el('lw-asof').textContent = '';
      el('lw-barbers').innerHTML = '';
      el('lw-hours').textContent = 'Today: ' + fmtHours(snap.hours_today);
      return;
    }

    // The walk-in headline uses walkin_wait ONLY (wait_mins counts book-ahead too).
    var ww = snap.walkin_wait;
    var walkinBarbers = (snap.barbers || []).filter(function (b) { return b.walkin === true; });

    el('lw-big').textContent = ww === 0 ? 'No wait right now'
      : ww == null ? 'Book ahead'
      : '~' + ww + ' min till next walk-in';
    el('lw-sub').textContent = ww === 0 ? 'Walk straight in'
      : ww == null ? 'No walk-in barbers on right now'
      : walkinBarbers.length + (walkinBarbers.length === 1
          ? ' barber on walk-ins' : ' barbers on walk-ins');
    el('lw-asof').textContent = fmtAsOf(asOf);
    el('lw-hours').textContent = 'Today: ' + fmtHours(snap.hours_today);
    el('lw-barbers').innerHTML = walkinBarbers.map(function (b) {
      var status;
      if (b.cutting) {
        var freeAt = new Date(asOf.getTime() + (b.free_in || 0) * 60000);
        status = 'cutting · free ~' + fmtClock(freeAt);
      } else {
        status = 'free now';
      }
      return '<span class="lw-chip' + (b.cutting ? ' is-cutting' : '') + '">' +
        '<span class="lw-chip-dot"></span>' +
        b.name.replace(/&/g, '&amp;').replace(/</g, '&lt;') +
        '<em>' + status + '</em></span>';
    }).join('');
  }

  window.__lwRender = render; // test hook

  var lastSnap = null;
  function tick() {
    fetch(FEED + '?t=' + Math.floor(Date.now() / 30000), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (snap) { lastSnap = snap; render(snap); })
      .catch(function () {
        // Re-render the last snapshot so the staleness check keeps running:
        // a dead feed must decay to "call for wait time", never freeze live.
        if (lastSnap) render(lastSnap);
      });
  }
  tick();
  setInterval(tick, 60000);

  // Card foot: two reveal panels driven by the open/closed button matrix.
  //  • Book Now panel (lw-book) — book-ahead options; revealed by the OPEN
  //    secondary link, and by the CLOSED primary button.
  //  • Join tomorrow's queue panel (lw-queue) — the walk-in barbers rostered for
  //    the next open day (from SLIKR via the feed's walkin_next); revealed by the
  //    CLOSED secondary link, then continue on Telegram.
  var ctaBtn = el('lw-cta'), joinBtn = el('lw-join');
  var queuePanel = el('lw-queue'), bookPanel = el('lw-book');
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function fmtDate(iso){
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return '';
    return d.toLocaleDateString('en-AU', { weekday:'short', day:'numeric', month:'short' });
  }

  function togglePanel(panel, trigger, other) {
    if (!panel) return;
    if (other && !other.hidden) other.hidden = true;
    var show = panel.hidden;
    panel.hidden = !show;
    if (trigger) trigger.setAttribute('aria-expanded', show ? 'true' : 'false');
    if (show) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function revealBook(trigger) {
    togglePanel(bookPanel, trigger, queuePanel);
  }

  function revealQueue(trigger) {
    var w = lastSnap && lastSnap.walkin_next;
    if (!w) { window.open(joinBtn.href, '_blank'); return; }
    var label = w.label || 'the next open day';
    var names = w.barbers || [];
    el('lw-queue-head').innerHTML =
      '<span class="eyebrow">Walk-ins ' + esc(label) + '</span>' +
      (w.date ? '<span class="lw-queue-date">' + esc(fmtDate(w.date)) + '</span>' : '');
    el('lw-queue-barbers').innerHTML = names.length
      ? names.map(function (n) {
          return '<span class="lw-chip"><span class="lw-chip-dot"></span>' + esc(n) + '</span>';
        }).join('')
      : '';
    el('lw-queue-note').textContent = names.length
      ? names.length + (names.length === 1 ? ' barber' : ' barbers') +
        ' on walk-ins ' + label + ' · a spot every hour, 9am–4pm.'
      : 'Walk-in barbers for ' + label + ' are set each morning — tap below and we’ll sort you a spot.';
    togglePanel(queuePanel, trigger, bookPanel);
  }

  if (ctaBtn) {
    ctaBtn.addEventListener('click', function (e) {
      // CLOSED: primary becomes "Book Now" → reveal the book panel (no navigation).
      // OPEN: primary stays a real link to the walk-in queue — let it through.
      if (lastSnap && !lastSnap.open) { e.preventDefault(); revealBook(ctaBtn); }
    });
  }
  if (joinBtn) {
    joinBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (lastSnap && !lastSnap.open) revealQueue(joinBtn); // CLOSED → tomorrow's queue
      else revealBook(joinBtn);                             // OPEN → Book Now
    });
  }
})();
