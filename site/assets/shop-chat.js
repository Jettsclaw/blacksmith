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
  var NAMES = ['bayli','jarred','jayden','locky','ben','cam','mubarak','sami'];
  function barberIn(t) {
    for (var i = 0; i < NAMES.length; i++) if (t.indexOf(NAMES[i]) >= 0) return NAMES[i];
    return null;
  }
  function route(text) {
    var t = text.toLowerCase();
    if (/cancel|reschedule|change my/.test(t)) return 'cancel';
    if (/(have to|need to|gotta).*(wait|stand|come in)|wait (in|at) the shop|remote|from home|without (coming|walking)/.test(t)) return 'remote';
    if (/book|appoint|reserve|lock in|get in/.test(t)) return 'book';
    if (/price|cost|how much|\$|charge/.test(t)) return 'prices';
    if (/service|menu|fade|beard|shave|what do you (do|offer)|kids|child/.test(t)) return 'services';
    if (/cancel|reschedule|change my/.test(t)) return 'cancel';
    if (/(have to|need to|gotta).*(wait|stand|come in)|wait (in|at) the shop|remote|from home|without (coming|walking)/.test(t)) return 'remote';
    if (/pay|card|cash|eftpos|afterpay/.test(t)) return 'pay';
    if (/walk.?in|queue work|how does/.test(t)) return 'how';
    if (/app\b|app store|iphone app/.test(t)) return 'app';
    if (/salon|colour|color|women|ladies|blackrose/.test(t)) return 'salon';
    if (/job|apprentice|hiring|work (here|with)/.test(t)) return 'jobs';
    if (/gift|voucher/.test(t)) return 'gift';
    if (/human|real person|someone|call/.test(t)) return 'human';
    if (/^(hi|hey|hello|yo|g'?day|sup)\b/.test(t)) return 'hi';
    if (/thank|cheers|legend|perfect/.test(t)) return 'thanks';
    if (/sunday|monday|tuesday|wednesday|thursday|friday|saturday|weekend|tomorrow|hour|open|close/.test(t)) return 'hours';
    if (/park|address|where|located|directions/.test(t)) return 'hours';
    if (/wait|long|busy|queue/.test(t)) return 'wait';
    if (/who|barber|on today|working/.test(t) || barberIn(t)) return 'who';
    return 'menu';
  }
  function dayHours(t) {
    if (!snap || !snap.week) return null;
    var days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    var ask = null;
    for (var i = 0; i < days.length; i++) if (t.indexOf(days[i]) >= 0) ask = days[i];
    if (t.indexOf('weekend') >= 0) ask = 'saturday';
    if (t.indexOf('tomorrow') >= 0) ask = days[(new Date().getDay() + 1) % 7];
    if (!ask) return null;
    var key = ask.slice(0, 3); key = key.charAt(0).toUpperCase() + key.slice(1);
    for (var j = 0; j < snap.week.length; j++) {
      if (snap.week[j].day.split(',').indexOf(key) >= 0)
        return ask.charAt(0).toUpperCase() + ask.slice(1) + ': ' + fmtT(snap.week[j].start) + ' – ' + fmtT(snap.week[j].close) + '.';
    }
    return ask.charAt(0).toUpperCase() + ask.slice(1) + ': closed.';
  }
  function answer(kind, s) {
    if (!s) return 'Can’t reach the shop feed right now — call us on ' + PHONE + '.';
    var stale = !fresh(s);
    if (kind === 'prices' || kind === 'services') {
      var menu = (s.services && s.services.barber) || [];
      if (!menu.length) return 'Call us for the menu: ' + PHONE;
      return 'The menu:\n' + menu.map(function (m) { return m.name + ' — $' + m.cost; }).join('\n') + '\nTap Book and I’ll lock one in.';
    }
    if (kind === 'remote') return 'You never have to stand around — join the queue from right here, watch your spot live, and walk in when it’s your turn. Tap Book and I’ll set you up.';
    if (kind === 'cancel') return 'To change or cancel a booking, give us a quick call on ' + PHONE + ' and we’ll sort it.';
    if (kind === 'pay') return 'You pay at the shop after your cut — card or cash both sweet.';
    if (kind === 'how') return 'Two ways in: join the live queue (walk-in, I’ll show you the wait) or book a time with Jarred or Locky. Tap Book and I’ll walk you through it.';
    if (kind === 'app') return 'The Blacksmith app has booking + queue too: https://apps.apple.com/au/app/blacksmith-barbers-salon/id1454355905';
    if (kind === 'salon') return 'Blackrose Salon Co. is our salon side — colour, styling, the lot. Book it here: https://web.slikr.com.au/blackrosesalon';
    if (kind === 'jobs') return 'Keen to join the trade? Call the shop on ' + PHONE + ' or drop in and have a yarn — we also run the Blacksmith Academy.';
    if (kind === 'gift') return 'Ask at the counter or call ' + PHONE + ' — they’ll sort you out.';
    if (kind === 'human') return 'Easy — call the shop: ' + PHONE + '. Open ' + fmtHours(s.hours_today) + ' today.';
    if (kind === 'hi') return 'G’day! I can tell you the live wait, who’s on, prices, or book you in — what do you need?';
    if (kind === 'thanks') return 'Easy as. Anything else — wait, prices, booking?';
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
        var st = fi === 0 ? 'free now' : b.cutting ? 'cutting' + (b.cutting_at === 'salon' ? ' (in the salon)' : '') + ', free in ~' + fi + ' min'
          : fi > 90 ? 'booked up today' : 'booked, free in ~' + fi + ' min';
        return (b.cutting ? '✂️ ' : fi === 0 ? '🟢 ' : '📅 ') + b.name + ' — ' + st;
      }).join('\n');
    }
    return 'I can help with the live wait, who’s on, prices, hours & parking, or booking you in — tap a chip below or just ask.';
  }

  // ---------- booking wizard ----------
  var BOOK_API = 'https://blacksmith-wait-bot.vercel.app/api/book';
  var ASK_API = 'https://blacksmith-wait-bot.vercel.app/api/ask';

  function askTheMac(q) {
    bubble('Let me check that for you…', 'bot');
    fetch(ASK_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: q }) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.id) { bubble(d.error || 'Hmm — best to call us on 0479 087 782.', 'bot'); return; }
        var tries = 0;
        var poll = setInterval(function () {
          tries++;
          fetch(ASK_API + '?id=' + d.id).then(function (r) { return r.json(); }).then(function (st) {
            if (st.done) { clearInterval(poll); bubble(st.answer, 'bot'); }
            else if (tries > 14) { clearInterval(poll); bubble('That one needs a human — call us on 0479 087 782.', 'bot'); }
          }).catch(function () {});
        }, 2500);
      })
      .catch(function () { bubble('Network hiccup — try again or call 0479 087 782.', 'bot'); });
  }
  var wiz = null; // {step, barber, shop, service, slot}

  function chipRow(opts, onPick, grid) {
    var row = el('div', 'sc-msg bot sc-choices' + (grid ? ' sc-grid' : ''));
    opts.forEach(function (o) {
      var c = el('button', 'sc-chip', o.label);
      c.onclick = function () { row.remove(); onPick(o); };
      row.appendChild(c);
    });
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  function setWizUI(on) {
    if (chipsEl) chipsEl.style.display = on ? 'none' : '';
    if (ctxEl) ctxEl.style.display = on ? 'flex' : 'none';
  }

  function startBooking(pref) {
    setWizUI(true);
    if (!snap) { setTimeout(function () { startBooking(pref); }, 800); return; }
    if (!snap.open) {
      if (snap.slots_next && snap.next_label) { startBookAhead(pref); return; }
      bubble('We\u2019re closed and tomorrow\u2019s book isn\u2019t open yet \u2014 try again in the morning or call 0479 087 782.', 'bot');
      setWizUI(false); return;
    }
    wiz = { step: 'barber' };
    if (pref) {
      var match = snap.barbers.filter(function (b) { return b.name.split(' ')[0].toLowerCase() === String(pref).toLowerCase(); })[0];
      if (match) {
        bubble('Book with ' + match.name.split(' ')[0], 'me');
        wiz.barber = match.name;
        wiz.shop = ((match.book || [])[0] === 'bookings') ? 'bookings' : 'barber';
        askService();
        return;
      }
    }
    bubble('Let’s get you booked. Who with?', 'bot');
    var opts = snap.barbers.map(function (b) {
      return { label: b.name.split(' ')[0], barber: b.name, book: b.book || ['barber'] };
    });
    opts.push({ label: 'Anyone', barber: 'any', book: ['barber'] });
    opts.push({ label: '🌹 Blackrose Salon', salon: true });
    chipRow(opts, function (o) {
      if (o.salon) { bubble('Blackrose Salon', 'me'); bubble('Blackrose runs its own book — tap to book the salon.', 'bot'); var a = el('a', 'sc-book', 'Book Blackrose →'); a.href = 'https://web.slikr.com.au/blackrosesalon'; a.target = '_blank'; a.rel='noopener'; body.lastChild.appendChild(document.createElement('br')); body.lastChild.appendChild(a); return; }
      bubble(o.label, 'me');
      wiz.barber = o.barber;
      wiz.shop = (o.book[0] === 'bookings') ? 'bookings' : 'barber';
      askService();
    });
  }

  function startBookAhead(pref) {
    var names = Object.keys(snap.slots_next || {}).filter(function (n) { return (snap.slots_next[n] || []).length; });
    if (!names.length) { bubble('Tomorrow\u2019s book isn\u2019t open yet \u2014 try again in the morning.', 'bot'); setWizUI(false); return; }
    wiz = { step: 'barber', ahead: true, date: snap.next_date };
    if (pref && names.map(function (n) { return n.toLowerCase(); }).indexOf(String(pref).toLowerCase()) < 0) {
      bubble(String(pref).charAt(0).toUpperCase() + String(pref).slice(1) + ' runs the live queue rather than timed slots — when we open I can put you straight in the queue from here (no standing around in the shop). Right now you can lock in ' + snap.next_label + ' with one of these:', 'bot');
    } else {
      bubble('We\u2019re closed right now, but you can lock in ' + snap.next_label + '. Who with?', 'bot');
    }
    var opts = names.map(function (n) { return { label: n, barber: n }; });
    chipRow(opts, function (o) {
      bubble(o.label, 'me');
      wiz.barber = o.barber;
      wiz.shop = 'bookings';
      askService();
    });
    if (pref && names.indexOf(String(pref)) >= 0) { /* keep simple: user taps */ }
  }

  function askService() {
    var menu = (snap.services && snap.services[wiz.shop]) || [];
    if (!menu.length) { bubble('Menu’s offline — tap Join the queue instead.', 'bot', true); wiz = null; setWizUI(false); return; }
    bubble('What are we doing?', 'bot');
    chipRow(menu.map(function (s) {
      return { label: s.name + ' · $' + s.cost, service: s.id };
    }), function (o) {
      bubble(o.label, 'me');
      wiz.service = o.service;
      askTime();
    });
  }

  function askTime() {
    if (wiz.ahead) {
      var slots2 = (snap.slots_next && snap.slots_next[wiz.barber]) || [];
      bubble('What time ' + snap.next_label + '?', 'bot');
      chipRow(slots2.map(function (t) { return { label: fmtT(t), slot: t }; }), function (o) {
        bubble(o.label, 'me'); wiz.slot = o.slot; askDetails();
      }, true);
      return;
    }
    if (wiz.shop === 'bookings') {
      var b = snap.barbers.filter(function (x) { return x.name === wiz.barber; })[0];
      var slots = (b && b.slots) || [];
      if (!slots.length) {
        bubble((wiz.barber.split(' ')[0]) + ' is booked out today — pick someone else or join the walk-in queue.', 'bot');
        wiz = null; setWizUI(false); return;
      }
      bubble('What time today?', 'bot');
      chipRow(slots.map(function (t) { return { label: fmtT(t), slot: t }; }), function (o) {
        bubble(o.label, 'me'); wiz.slot = o.slot; askDetails();
      }, true);
    } else {
      wiz.slot = 'now';
      bubble('You’ll join the live queue — current wait ~' + (snap.wait_mins || 0) + ' min.', 'bot');
      askDetails();
    }
  }

  function askDetails() {
    wiz.step = 'details';
    bubble('Last bit — type your name and mobile.\nLike: Jack Smith, 0400 123 456', 'bot');
  }

  function submitBooking(name, phone) {
    bubble('Locking it in…', 'bot');
    fetch(BOOK_API, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop: wiz.shop, service_id: wiz.service, barber: wiz.barber, slot: wiz.slot, name: name, phone: phone, date: wiz.date || undefined }) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.id) { bubble(d.error || 'That didn’t go through — try again.', 'bot'); wiz = null; setWizUI(false); return; }
        var tries = 0;
        var poll = setInterval(function () {
          tries++;
          fetch(BOOK_API + '?id=' + d.id).then(function (r) { return r.json(); }).then(function (st) {
            if (st.done) {
              clearInterval(poll);
              if (st.ok && window.__lsYou) window.__lsYou(name); // your sprite walks into the living shop
              bubble(st.ok ? '✅ Booked! ' + (st.time === 'now' ? 'You’re in the queue — head in.' :
                (wizDateLabel() + fmtT(st.time) + ' with ' + st.barber + '. You’ll get an SMS confirmation.')) :
                '❌ ' + (st.msg || 'Couldn’t book that — try another time.'), 'bot');
              wiz = null; setWizUI(false);
            } else if (tries > 25) { clearInterval(poll); bubble('Taking longer than usual — you’ll get an SMS if it landed, or call 0479 087 782.', 'bot'); wiz = null; setWizUI(false); }
          }).catch(function () {});
        }, 2500);
      })
      .catch(function () { bubble('Network hiccup — try again.', 'bot'); wiz = null; setWizUI(false); });
  }

  function wizDateLabel() {
    return (wiz && wiz.ahead && snap.next_label) ? snap.next_label + ' ' : '';
  }

  function handleDetails(text) {
    var m = text.match(/^\s*([a-zA-Z][a-zA-Z '\-]{1,39}?)[,\s]+((?:04|\+?61 ?4)[\d ]{8,12})\s*$/);
    if (!m) { bubble('Almost — send it like: Jack Smith, 0400 123 456', 'bot'); return; }
    var phone = m[2].replace(/\D/g, '').replace(/^61/, '0');
    submitBooking(m[1].trim(), phone);
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

  var panel = null, body = null, opened = false, chipsEl = null, ctxEl = null;

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
    chipsEl = chips;
    [['wait', '⏱ Wait time'], ['who', '💈 Who’s on'], ['hours', '🕐 Hours & parking'], ['book', '✂️ Book']].forEach(function (c) {
      var ch = el('button', 'sc-chip', c[1]);
      ch.onclick = function () {
        if (c[0] === 'book') { bubble('Book me in', 'me'); startBooking(); }
        else ask(c[0], c[1].replace(/^\S+\s/, ''));
      };
      chips.appendChild(ch);
    });
    panel.appendChild(chips);

    ctxEl = el('div', 'sc-chips sc-ctx');
    var again = el('button', 'sc-chip', '↩ Start over');
    again.onclick = function () { wiz = null; bubble('Start over', 'me'); startBooking(); };
    var call = el('a', 'sc-chip', '📞 0479 087 782');
    call.href = 'tel:0479087782';
    ctxEl.appendChild(again); ctxEl.appendChild(call);
    ctxEl.style.display = 'none';
    panel.appendChild(ctxEl);

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
      if (wiz && wiz.step === 'details') { handleDetails(t); return; }
      var lower = t.toLowerCase();
      var kind = route(lower);
      if (kind === 'book') { startBooking(barberIn(lower)); return; }
      if (kind === 'hours') {
        var dh = dayHours(lower);
        if (dh) { setTimeout(function () { bubble(dh, 'bot'); }, 250); return; }
      }
      if (kind === 'who' && barberIn(lower)) {
        var nm = barberIn(lower);
        setTimeout(function () {
          var b = snap && snap.barbers.filter(function (x) { return x.name.toLowerCase().indexOf(nm) === 0; })[0];
          if (!b) { bubble(nm.charAt(0).toUpperCase() + nm.slice(1) + ' isn’t on today. Want to see who is? Tap Who’s on.', 'bot'); return; }
          var fi = +b.free_in || 0;
          bubble(b.name.split(' ')[0] + ' is on — ' + (b.cutting ? 'cutting now' + (b.cutting_at === 'salon' ? ' (in the salon)' : '') : 'free') + (fi > 0 ? ', free in ~' + fi + ' min' : ' now') + '. Want me to book you in with ' + (b.name.split(' ')[0]) + '?', 'bot');
        }, 250);
        return;
      }
      if (kind === 'menu' && lower.length > 12) { askTheMac(t); return; }
      setTimeout(function () {
        bubble(answer(kind, snap), 'bot', kind === 'wait' || (snap && !snap.open));
      }, 300);
    };
    panel.appendChild(form);
    document.body.appendChild(panel);
  }

  window.__scOpen = function () { fab.onclick(); if (panel) panel.classList.add('open'); };
  window.__scBook = function (pref) {
    window.__scOpen();
    setTimeout(function () { startBooking(pref); }, 350);
  };

  // Never send people to SLIKR from the site: any booking link opens the
  // in-chat wizard instead (Blackrose salon links stay external).
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="slikr.com.au"]');
    if (!a) return;
    if (/blackrosesalon/.test(a.href)) return;
    if (/\/res/.test(a.href) || /shop\/(421|1121)/.test(a.href)) {
      e.preventDefault();
      window.__scBook();
    }
  }, true);

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
