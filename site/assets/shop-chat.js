/* Blacksmith shop chat — the wait-bot's brain, embedded on the site.
   Pure client-side: answers come from the public PII-free feed + static copy.
   No backend, no LLM, nothing to inject. Same templates as the Telegram bot. */
(function () {
  var FEED = 'https://raw.githubusercontent.com/automaitions/blacksmith-queue-feed/main/queue.json';
  var BOOK_URL = 'https://web.slikr.com.au/shop/421/res?ref=shopchat';
  var TG_URL = 'https://t.me/Blacksmithbarbers_bot';
  var PHONE = '0479 087 782';
  var ADDRESS = '9 Gateway Drive, Biggera Waters — 1 min from Harbour Town';
  var STALE_MS = 8 * 60 * 1000;

  // ---------- shared brain (mirrors the Telegram bot) ----------
  function fmtT(t) {
    if (!t) return 'soon';
    var p = t.trim().split(':'), h = +p[0], ap = h >= 12 ? 'pm' : 'am';
    return (h % 12 || 12) + (p[1] && p[1] !== '00' ? ':' + p[1] : '') + ap;
  }
  function fmtHours(h) {
    return h === 'closed today' ? 'closed today' : h.split('–').map(fmtT).join(' – ');
  }
  function fresh(s) {
    var d = new Date(s.as_of.replace(/(\d{2})(\d{2})$/, '$1:$2'));
    return !isNaN(d) && Date.now() - d.getTime() <= STALE_MS;
  }
  function asOf(s) {
    var m = s.as_of.match(/T(\d{2}):(\d{2})/);
    if (!m) return '';
    var h = +m[1], ap = h >= 12 ? 'pm' : 'am';
    return 'as of ' + (h % 12 || 12) + ':' + m[2] + ap;
  }
  function route(text) {
    var t = text.toLowerCase();
    if (/wait|long|queue length|busy|how long/.test(t)) return 'wait';
    if (/who|barber|on today|working|locky|bayli|jarred|jayden|ben|cam|mubarak|sami/.test(t)) return 'who';
    if (/hour|open|close|park|address|where|located/.test(t)) return 'hours';
    if (/book|join|cut|appoint|reserve/.test(t)) return 'book';
    return 'menu';
  }
  function answer(kind, s) {
    if (!s) return 'Can’t reach the shop feed right now — call us on ' + PHONE + '.';
    var stale = !fresh(s);
    if (kind === 'hours')
      return '📍 ' + ADDRESS + '\n🕐 Today: ' + fmtHours(s.hours_today) + '\n🅿️ Free parking out front.\n📞 ' + PHONE;
    if (!s.open)
      return 'Lights are off — we’re back ' + (s.hours_today === 'closed today' ? 'tomorrow' : fmtT(s.hours_today.split('–')[0])) + '. You can book ahead any time.';
    if (kind === 'wait') {
      if (stale || s.wait_mins == null) return 'Live feed’s catching its breath — call us for the wait: ' + PHONE;
      if (s.wait_mins === 0) return '🟢 No wait right now — ' + s.barbers_on + ' barbers on, walk straight in (' + asOf(s) + ')';
      return '⏱ ~' + s.wait_mins + ' min wait · ' + s.waiting + ' waiting · ' + s.barbers_on + ' barbers on (' + asOf(s) + ')';
    }
    if (kind === 'book') return 'Lock your chair — tap below.';
    if (kind === 'who') {
      if (stale || !s.barbers.length) return 'Can’t see the floor right now — call us: ' + PHONE;
      return 'On the floor ' + asOf(s) + ':\n' + s.barbers.map(function (b) {
        var fi = +b.free_in || 0;
        var st = fi === 0 ? 'free now' : b.cutting ? 'cutting, free in ~' + fi + ' min'
          : fi > 90 ? 'booked up today' : 'booked, free in ~' + fi + ' min';
        return (b.cutting ? '✂️ ' : fi === 0 ? '🟢 ' : '📅 ') + b.name + ' — ' + st;
      }).join('\n');
    }
    return 'I’ve got live answers for the wait, who’s on, hours & parking, or booking — tap a chip below.';
  }

  // ---------- UI ----------
  var snap = null;
  function tick() {
    fetch(FEED + '?t=' + Math.floor(Date.now() / 30000), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (s) { snap = s; })
      .catch(function () {});
  }

  var fab = document.createElement('button');
  fab.className = 'sc-fab';
  fab.setAttribute('aria-label', 'Chat with the shop — live wait times');
  fab.innerHTML = '<img src="assets/living-shop/bot-mark.webp" alt="">';
  document.body.appendChild(fab);

  // One-time nudge so people know the bubble exists.
  if (!sessionStorage.getItem('scNudged')) {
    sessionStorage.setItem('scNudged', '1');
    var pill = document.createElement('button');
    pill.className = 'sc-pill';
    pill.textContent = 'Live wait times — tap to ask';
    pill.onclick = function () { pill.remove(); fab.click(); };
    document.body.appendChild(pill);
    setTimeout(function () {
      pill.classList.add('show');
      fab.classList.add('pulse');
      setTimeout(function () {
        pill.classList.remove('show');
        fab.classList.remove('pulse');
        setTimeout(function () { pill.remove(); }, 400);
      }, 7000);
    }, 3000);
  }

  var panel = null, body = null, opened = false;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function bubble(text, who, withBook) {
    var b = el('div', 'sc-msg ' + who);
    text.split('\n').forEach(function (line, i) {
      if (i) b.appendChild(document.createElement('br'));
      b.appendChild(document.createTextNode(line));
    });
    if (withBook) {
      b.appendChild(document.createElement('br'));
      var a = el('a', 'sc-book', 'Join the queue →');
      a.href = BOOK_URL; a.target = '_blank'; a.rel = 'noopener';
      b.appendChild(a);
    }
    body.appendChild(b);
    body.scrollTop = body.scrollHeight;
  }

  function ask(kind, label) {
    bubble(label, 'me');
    var reply = answer(kind, snap);
    setTimeout(function () {
      bubble(reply, 'bot', kind === 'book' || kind === 'wait' || (snap && !snap.open));
    }, 260);
  }

  function build() {
    panel = el('div', 'sc-panel');
    var head = el('div', 'sc-head');
    var dot = el('span', 'sc-dot');
    head.appendChild(dot);
    head.appendChild(el('strong', null, 'Blacksmith — live from the shop'));
    var tg = el('a', 'sc-tg', 'Telegram →');
    tg.href = TG_URL; tg.target = '_blank'; tg.rel = 'noopener';
    head.appendChild(tg);
    var x = el('button', 'sc-x', '×');
    x.setAttribute('aria-label', 'Close chat');
    x.onclick = function () { panel.classList.remove('open'); };
    head.appendChild(x);
    panel.appendChild(head);

    body = el('div', 'sc-body');
    panel.appendChild(body);

    var chips = el('div', 'sc-chips');
    [['wait', '⏱ Wait time'], ['who', '💈 Who’s on'], ['hours', '🕐 Hours & parking'], ['book', '✂️ Book']].forEach(function (c) {
      var ch = el('button', 'sc-chip', c[1]);
      ch.onclick = function () { ask(c[0], c[1].replace(/^\S+\s/, '')); };
      chips.appendChild(ch);
    });
    panel.appendChild(chips);

    var form = el('form', 'sc-form');
    var input = el('input', 'sc-input');
    input.placeholder = 'Ask about the wait…';
    input.maxLength = 120;
    var send = el('button', 'sc-send', '↑');
    send.type = 'submit';
    form.appendChild(input); form.appendChild(send);
    form.onsubmit = function (e) {
      e.preventDefault();
      var t = input.value.trim();
      if (!t) return;
      input.value = '';
      bubble(t, 'me');
      var kind = route(t);
      setTimeout(function () {
        bubble(answer(kind, snap), 'bot', kind === 'book' || kind === 'wait' || (snap && !snap.open));
      }, 300);
    };
    panel.appendChild(form);
    document.body.appendChild(panel);
  }

  fab.onclick = function () {
    if (!opened) {
      opened = true;
      tick();
      setInterval(tick, 60000);
      build();
      setTimeout(function () {
        panel.classList.add('open');
        setTimeout(function () { ask('wait', 'How long’s the wait?'); }, 350);
      }, 30);
    } else {
      panel.classList.toggle('open');
    }
  };
})();
