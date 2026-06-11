/* Living Shop Phase 1 — live wait card.
   Feature flag: hidden until ?livewait is in the URL (or LIVE_WAIT_ON = true
   once Jett approves). Data: PII-free snapshot published from the shop every
   60s. Staleness rule: >5 min old = never show the number as live. */
(function () {
  var LIVE_WAIT_ON = false; // flip true on Jett's approval
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

  function render(snap) {
    var asOf = new Date(snap.as_of.replace(/(\d{2})(\d{2})$/, '$1:$2'));
    var stale = isNaN(asOf) || (Date.now() - asOf.getTime()) > STALE_MS;
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
      el('lw-cta').textContent = 'Book ahead';
      return;
    }

    if (stale || snap.wait_mins == null) {
      el('lw-big').textContent = 'Call for wait time';
      el('lw-sub').textContent = PHONE;
      el('lw-asof').textContent = '';
      el('lw-barbers').innerHTML = '';
      el('lw-hours').textContent = 'Today: ' + fmtHours(snap.hours_today);
      return;
    }

    el('lw-big').textContent = '~' + snap.wait_mins + ' min wait';
    el('lw-sub').textContent = snap.waiting + ' waiting · ' +
      snap.barbers_on + (snap.barbers_on === 1 ? ' barber on' : ' barbers on');
    el('lw-asof').textContent = fmtAsOf(asOf);
    el('lw-hours').textContent = 'Today: ' + fmtHours(snap.hours_today);
    el('lw-barbers').innerHTML = snap.barbers.map(function (b) {
      return '<span class="lw-chip' + (b.cutting ? ' is-cutting' : '') + '">' +
        '<span class="lw-chip-dot"></span>' +
        b.name.replace(/&/g, '&amp;').replace(/</g, '&lt;') +
        '<em>' + (b.cutting ? 'cutting' : 'free') + '</em></span>';
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
})();
