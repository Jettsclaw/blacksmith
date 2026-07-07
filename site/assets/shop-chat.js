/* Blacksmith shop chat — the wait-bot's brain, embedded on the site.
   Pure client-side: answers come from the public PII-free feed + static copy.
   No backend, no LLM, nothing to inject. Same templates as the Telegram bot. */
(function () {
  var FEED = 'https://raw.githubusercontent.com/automaitions/blacksmith-queue-feed/main/queue.json';
  var TG_URL = 'https://t.me/Blacksmithbarbers_bot';
  // After-hours walk-in queue — customers leave their details here for the
  // morning crew to enter into SLIKR. (Beau 2026-07-03)
  var AFTERHOURS_TG = 'https://t.me/+FdP08AnnO3swZmJl';
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
  // Tidy SLIKR service labels — Beau: apprentice cut lists Jayden only, drop "Jay".
  function svcName(n) { return String(n || '').replace(/,\s*Jay\b/i, ''); }
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
    if (/salon|colour|color|women|ladies|blackrose/.test(t)) return 'salon';
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
      return 'The menu:\n' + menu.map(function (m) { return svcName(m.name) + ' — $' + m.cost; }).join('\n') + '\nTap Book and I’ll lock one in.';
    }
    if (kind === 'remote') return 'You never have to stand around — join the queue from right here, watch your spot live, and walk in when it’s your turn. Tap Book and I’ll set you up.';
    if (kind === 'cancel') { cancelMode = true; return 'No worries — type the name and mobile you booked with and I’ll cancel it.\nLike: Jack Smith, 0400 123 456'; }
    if (kind === 'pay') return 'You pay at the shop after your cut — card or cash both sweet.';
    if (kind === 'how') return 'Two ways in: join the live queue (walk-in, I’ll show you the wait) or book a time with Jarred or Locky. Tap Book and I’ll walk you through it.';
    if (kind === 'app') return 'The Blacksmith app has booking + queue too: https://apps.apple.com/au/app/blacksmith-barbers-salon/id1454355905';
    if (kind === 'salon') return 'Blackrose Salon Co. is our salon side — colour, styling, the lot. Tap Book and I’ll set you up.';
    if (kind === 'jobs') return 'Keen to join the trade? Call the shop on ' + PHONE + ' or drop in and have a yarn — we also run the Blacksmith Academy.';
    if (kind === 'gift') return 'Ask at the counter or call ' + PHONE + ' — they’ll sort you out.';
    if (kind === 'human') return 'Easy — call the shop: ' + PHONE + '. Open ' + fmtHours(s.hours_today) + ' today.';
    if (kind === 'hi') return 'G’day! I can tell you the live wait, who’s on, prices, or book you in — what do you need?';
    if (kind === 'thanks') return 'Easy as. Anything else — wait, prices, booking?';
    if (kind === 'hours')
      return !s.open
        ? 'We’ll be in-store at 9am. 🅿️ Parking’s just out front and around the side.\n📞 ' + PHONE
        : '📍 ' + ADDRESS + '\n🕐 Today: ' + fmtHours(s.hours_today) + '\n🅿️ Free parking out front.\n📞 ' + PHONE;
    if (!s.open) {
      // Closed-state chip answers (Beau 2026-07-03).
      if (kind === 'wait')
        return 'We’re closed right now — no wait, we open at 9am. Get on tomorrow’s walk-in list or book ahead.';
      if (kind === 'who') {
        var wtm = ((s.walkin_next && s.walkin_next.barbers) || []).map(function (n) { return n.split(' ')[0]; });
        var bkm = Object.keys(s.slots_next || {}).map(function (n) { return n.split(' ')[0]; });
        if (Object.keys((s.salon && s.salon.slots) || {}).some(function (k) { return ((s.salon.slots[k]) || []).length; }))
          bkm.push('Sami');
        if (!wtm.length && !bkm.length)
          return 'Lights are off — back 9am. Tap Book to lock a chair, or Join the queue to get on tomorrow’s walk-in list.';
        var lbl = (s.walkin_next && s.walkin_next.label) || 'tomorrow';
        var lines = 'On ' + lbl + ':';
        if (wtm.length) lines += '\n💈 Walk-ins — ' + wtm.join(', ');
        if (bkm.length) lines += '\n📅 Booking — ' + bkm.join(', ');
        return lines;
      }
      return 'Lights are off — we’re back ' + (s.hours_today === 'closed today' ? 'tomorrow' : fmtT(s.hours_today.split('–')[0])) + '. You can book ahead any time.';
    }
    if (kind === 'wait') {
      // Walk-ins ONLY — never fold in bookings or Blackrose (Beau 2026-07-03).
      // Those are referenced only under Book Now.
      if (stale) return 'Live feed’s catching its breath — call us for the wait: ' + PHONE;
      if (s.walkin_wait == null) return 'No barbers on walk-ins right now — you can book ahead any time. Tap Book and I’ll set you up.';
      var won = s.barbers.filter(function (b) { return b.walkin; }).length;
      if (s.walkin_wait === 0) return '🟢 No wait right now — walk straight in (' + asOf(s) + ')';
      return '⏱ ~' + s.walkin_wait + ' min till the next walk-in · ' + won + (won === 1 ? ' barber' : ' barbers') + ' on walk-ins (' + asOf(s) + ')';
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
  var QUEUE_API = 'https://blacksmith-wait-bot.vercel.app/api/queue';
  var twq = null; // tomorrow-walk-in intake (browser-side state; no server round-trip)
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
    opts.push({ label: 'Walk-In’s 💈', walk: true }); // Beau 2026-07-07: jump to the join-the-queue flow
    opts.push({ label: 'Anyone', barber: 'any', book: ['barber'] });
    opts.push({ label: '🌹 Blackrose Salon', salon: true });
    chipRow(opts, function (o) {
      if (o.walk) { bubble('Walk-In’s', 'me'); scWaitList(); return; }
      if (o.salon) { bubble('Blackrose Salon', 'me'); startSalon(); return; }
      bubble(o.label, 'me');
      wiz.barber = o.barber;
      wiz.shop = (o.book[0] === 'bookings') ? 'bookings' : 'barber';
      askService();
    });
  }

  // In-chat "Book" = a clean fork: lock a time (Bookings) vs join the live
  // queue (Walk-in). The card's split buttons stay separate. (Beau 2026-07-03)
  function startBookMenu() {
    setWizUI(false);
    if (!snap) { setTimeout(startBookMenu, 800); return; }
    if (!snap.open) { scBookNames(); return; } // closed: no walk-ins to join
    bubble('Lock a time, or join the walk-in queue?', 'bot');
    chipRow([
      { label: '📅 Bookings', cat: 'book' },
      { label: '💈 Walk-in', cat: 'walk' }
    ], function (o) {
      if (o.cat === 'book') { bubble('Bookings', 'me'); scBookNames(); return; }
      bubble('Walk-in', 'me'); startWalkin();
    });
  }

  function startWalkin() {
    setWizUI(false);
    if (!snap) { setTimeout(startWalkin, 800); return; }
    if (!snap.open) {
      bubble('We’re closed right now — walk-ins run when we’re open. Tap Book to lock a time, or call ' + PHONE + '.', 'bot');
      return;
    }
    var wb = (snap.barbers || []).filter(function (b) { return b.walkin === true; });
    if (!wb.length) {
      bubble('No barbers on walk-ins right now — tap Book to lock a time instead, or call ' + PHONE + '.', 'bot');
      return;
    }
    bubble('On walk-ins ' + asOf(snap) + ': ' + wb.map(function (b) { return b.name.split(' ')[0]; }).join(', ') +
      '.\nWho would you like? I’ll pop you in the live queue.', 'bot');
    var opts = wb.map(function (b) { return { label: b.name.split(' ')[0], barber: b.name, sami: /^sam/i.test(b.name) }; });
    opts.push({ label: 'Any barber', barber: 'any' });
    chipRow(opts, function (o) {
      bubble(o.label, 'me');
      // Sami's on the walk-in list to keep waits low, but she's bookings — pick
      // her and we book her, not queue her. (Beau 2026-07-07)
      if (o.sami) { bookSami(); return; }
      setWizUI(true);
      wiz = { step: 'service', shop: 'barber', barber: o.barber };
      askService();
    });
  }

  function bookSami() {
    if (!snap) { setTimeout(bookSami, 500); return; }
    var sal = snap.salon || {};
    var samiDays = (sal.days || []).map(function (d) {
      var k = Object.keys(d.slots || {}).filter(function (x) { return /^sam/i.test(x) && (d.slots[x] || []).length; })[0];
      return k ? { date: d.date, label: d.label, times: d.slots[k], stylist: k } : null;
    }).filter(Boolean);
    if (!samiDays.length) {
      var lk = Object.keys(sal.slots || {}).filter(function (x) { return /^sam/i.test(x) && (sal.slots[x] || []).length; })[0];
      if (lk) samiDays = [{ date: sal.date, label: sal.label, times: sal.slots[lk], stylist: lk }];
    }
    if (!samiDays.length) { bubble('Sami’s book is closed right now — call ' + PHONE + '.', 'bot'); setWizUI(false); return; }
    scSamiDays(samiDays);
  }

  function startSalon(heading) {
    setWizUI(true);
    if (!snap) { setTimeout(function () { startSalon(heading); }, 800); return; }
    var sal = snap.salon || {};
    var stylist = null, slots = [];
    Object.keys(sal.slots || {}).forEach(function (k) {
      if (!stylist && (sal.slots[k] || []).length) { stylist = k; slots = sal.slots[k]; }
    });
    if (!(sal.services || []).length || !stylist) {
      bubble('Blackrose’s book is closed right now — call 0479 087 782 and we’ll sort you out.', 'bot');
      setWizUI(false); return;
    }
    wiz = { step: 'service', shop: 'salon', barber: stylist, salonSlots: slots, date: sal.date, salonLabel: sal.label };
    bubble((heading || '🌹 Blackrose Salon') + ' — what are we doing?', 'bot');
    chipRow(sal.services.map(function (s) {
      return { label: svcName(s.name) + ' · $' + s.cost, service: s.id };
    }), function (o) {
      bubble(o.label, 'me');
      wiz.service = o.service;
      bubble('What time ' + (wiz.salonLabel || 'today') + ' with ' + stylist + '?', 'bot');
      chipRow(wiz.salonSlots.map(function (t) { return { label: fmtT(t), slot: t }; }), function (o2) {
        bubble(o2.label, 'me'); wiz.slot = o2.slot; askDetails();
      }, true);
    });
  }

  function startBookAhead(pref) {
    var names = Object.keys(snap.slots_next || {}).filter(function (n) { return (snap.slots_next[n] || []).length; });
    if (!names.length) { bubble(snap.next_label === 'today' ? 'No times left today \u2014 call 0479 087 782.' : 'Tomorrow\u2019s book isn\u2019t open yet \u2014 try again in the morning.', 'bot'); setWizUI(false); return; }
    wiz = { step: 'barber', ahead: true, date: snap.next_date };
    if (pref && names.map(function (n) { return n.toLowerCase(); }).indexOf(String(pref).toLowerCase()) < 0) {
      bubble(String(pref).charAt(0).toUpperCase() + String(pref).slice(1) + ' runs the live queue rather than timed slots — when we open I can put you straight in the queue from here (no standing around in the shop). Right now you can lock in ' + snap.next_label + ' with one of these:', 'bot');
    } else {
      bubble('We\u2019re closed right now, but you can lock in ' + snap.next_label + '. Who with?', 'bot');
    }
    var opts = names.map(function (n) { return { label: n, barber: n }; });
    opts.push({ label: 'Walk-In’s 💈', walk: true }); // Beau 2026-07-07: jump to the join-the-queue flow
    chipRow(opts, function (o) {
      if (o.walk) { bubble('Walk-In’s', 'me'); scWaitList(); return; }
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
      return { label: svcName(s.name) + ' · $' + s.cost, service: s.id };
    }), function (o) {
      bubble(o.label, 'me');
      wiz.service = o.service;
      askTime();
    });
  }

  function askTime() {
    if (wiz.ahead) {
      var slots2 = (wiz.dayBarbers && wiz.dayBarbers[wiz.barber]) ||
                   (snap.slots_next && snap.slots_next[wiz.barber]) || [];
      bubble('What time ' + (wiz.label || snap.next_label) + '?', 'bot');
      chipRow(slots2.map(function (t) { return { label: fmtT(t), slot: t }; }), function (o) {
        bubble(o.label, 'me'); wiz.slot = o.slot; askDetails();
      }, true);
      return;
    }
    if (wiz.shop === 'bookings') {
      var b = snap.barbers.filter(function (x) { return x.name === wiz.barber; })[0];
      var slots = (b && b.slots) || [];
      if (!slots.length) {
        bubbleLink((wiz.barber.split(' ')[0]) + ' is booked out today — pick someone else or join the walk-in queue.', 'join the walk-in queue', function () {
          bubble('Join the walk-in queue', 'me'); startWalkin();
        });
        wiz = null; setWizUI(false); return;
      }
      bubble('What time today?', 'bot');
      chipRow(slots.map(function (t) { return { label: fmtT(t), slot: t }; }), function (o) {
        bubble(o.label, 'me'); wiz.slot = o.slot; askDetails();
      }, true);
    } else {
      wiz.slot = 'now';
      bubble((snap && snap.barbers && snap.barbers.length) ? 'You’ll join the live queue — current wait ~' + (snap.wait_mins || 0) + ' min.' : 'You’ll join the live queue — I can’t see anyone clocked on right now, so the shop will confirm your spot.', 'bot');
      askDetails();
    }
  }

  function askDetails() {
    wiz.step = 'details';
    bubble('Last bit — type your name and mobile.\nLike: Jack Smith, 0400 123 456', 'bot');
  }

  var cancelMode = false;
  function submitCancel(name, phone) {
    bubble('One sec — cancelling…', 'bot');
    fetch(BOOK_API, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel', name: name, phone: phone }) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.id) { bubble(d.error || 'That didn’t go through — call us on ' + PHONE + '.', 'bot'); cancelMode = false; return; }
        var tries = 0;
        var poll = setInterval(function () {
          tries++;
          fetch(BOOK_API + '?id=' + d.id).then(function (r) { return r.json(); }).then(function (st) {
            if (st.done) {
              clearInterval(poll);
              bubble((st.ok ? '✅ ' : '❌ ') + (st.msg || 'All sorted.'), 'bot');
              cancelMode = false;
            } else if (tries > 25) { clearInterval(poll); bubble('Taking longer than usual — call ' + PHONE + ' and we’ll sort it.', 'bot'); cancelMode = false; }
          }).catch(function () {});
        }, 2500);
      })
      .catch(function () { bubble('Network hiccup — try again.', 'bot'); cancelMode = false; });
  }

  function submitBooking(name, phone, email) {
    bubble('Locking it in…', 'bot');
    fetch(BOOK_API, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop: wiz.shop, service_id: wiz.service, barber: wiz.barber, slot: wiz.slot, name: name, phone: phone, email: email || '', date: wiz.date || undefined }) })
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
                '❌ ' + ((st.msg || '').indexOf('not available') >= 0 ? 'That barber isn’t taking that slot right now — try “any barber” or another time.' : (st.msg || 'Couldn’t book that — try another time.')), 'bot');
              wiz = null; setWizUI(false);
            } else if (tries > 25) { clearInterval(poll); bubble('Taking longer than usual — you’ll get an SMS if it landed, or call 0479 087 782.', 'bot'); wiz = null; setWizUI(false); }
          }).catch(function () {});
        }, 2500);
      })
      .catch(function () { bubble('Network hiccup — try again.', 'bot'); wiz = null; setWizUI(false); });
  }

  function wizDateLabel() {
    var lbl = wiz && wiz.ahead && (wiz.label || snap.next_label);
    return lbl ? lbl + ' ' : '';
  }

  // Simple email check — good enough to catch typos, not to gatekeep. (Beau 2026-07-03)
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function handleDetails(text) {
    var m = text.match(/^\s*([a-zA-Z][a-zA-Z '\-]{1,39}?)[,\s]+((?:04|\+?61 ?4)[\d ]{8,12})\s*$/);
    if (!m) {
      if (cancelMode && /book|menu|price|wait|never ?mind|stop/i.test(text)) { cancelMode = false; bubble('No worries — cancelled the cancel. What next?', 'bot'); return; }
      bubble('Almost — send it like: Jack Smith, 0400 123 456', 'bot'); return;
    }
    var phone = m[2].replace(/\D/g, '').replace(/^61/, '0');
    if (cancelMode) { submitCancel(m[1].trim(), phone); return; }
    // Stash name + mobile, then ask for email before locking it in.
    wiz.name = m[1].trim();
    wiz.phone = phone;
    wiz.step = 'email';
    bubble('And your email? (so we can send your booking confirmation)\nOr type “skip”.', 'bot');
  }

  function handleEmail(text) {
    var e = text.trim();
    if (/^skip$/i.test(e)) { submitBooking(wiz.name, wiz.phone, ''); return; }
    if (!EMAIL_RE.test(e)) { bubble('Hmm — that email doesn’t look right. Try again, or type “skip”.', 'bot'); return; }
    submitBooking(wiz.name, wiz.phone, e);
  }

  // ---- CLOSED-hours "join tomorrow's walk-in list" (in-chat → /api/queue) ----
  var WQ_DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var WQ_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function wqDateChips() {
    var out = [];
    for (var i = 1; i <= 7; i++) {
      var d = new Date(Date.now() + i * 86400000);
      var iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      out.push({ label: i === 1 ? 'Tomorrow' : WQ_DOW[d.getDay()] + ' ' + d.getDate() + ' ' + WQ_MON[d.getMonth()], date: iso });
    }
    return out;
  }
  function wqTimeChips(iso) {
    var start = '09:00', close = '17:30';
    if (iso && snap && snap.week) {
      var dow = WQ_DOW[new Date(iso + 'T12:00:00').getDay()];
      for (var k = 0; k < snap.week.length; k++) if (snap.week[k].day.split(',').indexOf(dow) >= 0) { start = snap.week[k].start; close = snap.week[k].close; }
    }
    var sMin = (+start.slice(0, 2)) * 60 + (+start.slice(3, 5)), eMin = (+close.slice(0, 2)) * 60 + (+close.slice(3, 5));
    var out = [{ label: 'First available', time: 'First available' }];
    for (var m = sMin; m <= eMin - 30; m += 30) {
      var h = Math.floor(m / 60), mn = m % 60, ap = h >= 12 ? 'pm' : 'am', hh = (h % 12) || 12;
      var lab = hh + (mn === 0 ? '' : ':' + String(mn).padStart(2, '0')) + ap;
      out.push({ label: lab, time: lab });
    }
    return out;
  }
  // Closed shop → capture the walk-in right in chat (service → day → time → name
  // + mobile → email) and relay it to the After Hours crew's Telegram via
  // /api/queue. Mirrors the Telegram bot exactly. (Beau 2026-07-07)
  function startTomorrowWalkin() {
    setWizUI(false);
    if (!snap) { setTimeout(startTomorrowWalkin, 500); return; }
    twq = { step: 'service' };
    bubble('We’re closed right now — but I can get you on the walk-in list and the crew will sort you first thing. What are you after?', 'bot');
    var menu = (snap.services && snap.services.barber) || [];
    if (!menu.length) { bubble('A word’s fine — Cut, Fade, Beard, etc.', 'bot'); return; } // typed → handleWalkinService
    chipRow(menu.map(function (s) { return { label: svcName(s.name) + ' · $' + s.cost, id: s.id, name: svcName(s.name) }; }), function (o) {
      bubble(o.label, 'me');
      twq.serviceId = o.id; twq.request = o.name;
      askWalkinDay();
    });
  }

  function handleWalkinService(text) { // typed instead of tapping a service chip
    var s = text.trim().slice(0, 40);
    if (!s) { bubble('Just a word’s fine — Cut, Fade, Beard…', 'bot'); return; }
    twq.request = s;
    askWalkinDay();
  }

  function askWalkinDay() {
    twq.step = 'day';
    bubble('Which day?', 'bot');
    chipRow(wqDateChips().map(function (d) { return { label: d.label, date: d.date }; }), function (d) {
      bubble(d.label, 'me');
      twq.date = d.date;
      askWalkinTime(d.label);
    }, true);
  }

  function askWalkinTime(dayLabel) {
    twq.step = 'time';
    bubble('What time ' + (dayLabel === 'Tomorrow' ? 'tomorrow' : dayLabel) + '?', 'bot');
    chipRow(wqTimeChips(twq.date).map(function (t) { return { label: t.label, time: t.time }; }), function (t) {
      bubble(t.label, 'me');
      twq.time = t.time;
      twq.step = 'details';
      bubble('And your name + mobile?\nLike: Jack Smith, 0400 123 456', 'bot');
    }, true);
  }

  function handleWalkinDetails(text) {
    var m = text.match(/^\s*([a-zA-Z][a-zA-Z '\-]{1,39}?)[,\s]+((?:04|\+?61 ?4)[\d ]{8,12})\s*$/);
    if (!m) { bubble('Almost — send it like: Jack Smith, 0400 123 456', 'bot'); return; }
    var phone = m[2].replace(/\D/g, '').replace(/^61/, '0');
    // Stash name + mobile, then ask for email before submitting.
    twq.name = m[1].trim();
    twq.phone = phone;
    twq.step = 'email';
    bubble('And your email? (so we can send your booking confirmation)\nOr type “skip”.', 'bot');
  }

  function handleWalkinEmail(text) {
    var e = text.trim();
    if (/^skip$/i.test(e)) { submitQueue(twq.name, twq.phone, twq.time || 'First available', ''); return; }
    if (!EMAIL_RE.test(e)) { bubble('Hmm — that email doesn’t look right. Try again, or type “skip”.', 'bot'); return; }
    submitQueue(twq.name, twq.phone, twq.time || 'First available', e);
  }

  function submitQueue(name, phone, time, email) {
    bubble('Popping you on tomorrow’s list…', 'bot');
    fetch(QUEUE_API, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, phone: phone, email: email || '', request: twq.request || '', service: twq.serviceId, barber: 'First available', time: time, date: twq.date || undefined }) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.ok) bubble('✅ You’re on the walk-in list, ' + name.split(' ')[0] + ' — we’ll text you to confirm your time. See you then! ✂️', 'bot');
        else bubble('Hmm, that didn’t go through — give us a call on ' + PHONE + ' and we’ll pop you down.', 'bot');
        twq = null; setWizUI(false);
      })
      .catch(function () { bubble('Network hiccup — try that again, or call ' + PHONE + '.', 'bot'); twq = null; setWizUI(false); });
  }

  // ---------- UI ----------
  var snap = null;
  // Hero button label follows the shop: "Live Queue" when open, "Tomorrow's
  // Queue" when closed (lights off — no live queue to join). (Beau 2026-07-04)
  function updateHeroLabel() {
    var b = document.getElementById('hero-live-queue');
    if (!b || !snap) return;
    var txt = snap.open ? 'Live Queue' : 'Walk-In Queue';
    var big = b.querySelector('.hero-app-big');
    if (big) { if (big.textContent !== txt) big.textContent = txt; }
    else if (b.textContent !== txt) b.textContent = txt;
    b.setAttribute('aria-label', txt + ' — join the walk-in queue');
  }
  function tick() {
    fetch(FEED + '?t=' + Math.floor(Date.now() / 15000), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (s) { snap = s; updateHeroLabel(); })
      .catch(function () {});
  }

  // Bottom-right launcher opens the in-site chat (Beau 2026-07-07: Telegram
  // option hidden until the TG bot is fully ready). Icon = scissors, pill = Book.
  var fab = document.createElement('button');
  fab.className = 'sc-fab';
  fab.setAttribute('aria-label', 'Book a cut');
  fab.innerHTML = '<img src="assets/bs-logo.png" alt="Blacksmith" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:50%;height:50%;object-fit:contain">';
  document.body.appendChild(fab);

  // Persistent label beside the launcher.
  var pill = document.createElement('button');
  pill.className = 'sc-pill show';
  pill.textContent = 'Click Here';
  pill.setAttribute('aria-label', 'Click Here');
  pill.onclick = function () { fab.onclick(); };
  document.body.appendChild(pill);

  // Pill shows when scrolling up, hides when scrolling down (Beau 2026-07-07).
  var _lastY = window.scrollY || 0;
  window.addEventListener('scroll', function () {
    var y = window.scrollY || 0;
    if (y > _lastY && y > 40) pill.classList.remove('show');
    else pill.classList.add('show');
    _lastY = y;
  }, { passive: true });

  var panel = null, body = null, opened = false, chipsEl = null, ctxEl = null;

  // clear chat: manual button + 3-min inactivity auto-clear (Jett 2026-06-12)
  var idleT = null;
  function pokeIdle() {
    clearTimeout(idleT);
    idleT = setTimeout(function () {
      if (body && body.childNodes.length) clearChat();
    }, 180000);
  }
  function clearChat() {
    if (!body) return;
    body.innerHTML = '';
    wiz = null;
    setWizUI(false);
    bubble('G\u2019day! I can tell you the live wait, who\u2019s on, prices, or book you in \u2014 what do you need?', 'bot');
  }

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
      // In-chat walk-in path — never a SLIKR redirect. Closed → tomorrow's
      // walk-in list; open → live queue. Same chain as "Join tomorrow's
      // queue". (Beau 2026-07-05)
      a.href = '#';
      a.onclick = function (e) {
        e.preventDefault();
        if (snap && !snap.open) startTomorrowWalkin();
        else startWalkin();
      };
      b.appendChild(a);
    }
    body.appendChild(b);
    body.scrollTop = body.scrollHeight;
    pokeIdle();
  }

  // Bot bubble with one inline tappable phrase that runs onTap.
  function bubbleLink(text, phrase, onTap) {
    var b = el('div', 'sc-msg bot');
    var i = text.indexOf(phrase);
    if (i < 0) { bubble(text, 'bot'); return; }
    b.appendChild(document.createTextNode(text.slice(0, i)));
    var link = el('span', 'sc-link', phrase);
    link.setAttribute('role', 'button');
    link.setAttribute('tabindex', '0');
    link.onclick = onTap;
    link.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap(); } };
    b.appendChild(link);
    b.appendChild(document.createTextNode(text.slice(i + phrase.length)));
    body.appendChild(b);
    body.scrollTop = body.scrollHeight;
    pokeIdle();
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
    head.appendChild(el('strong', null, 'Queue or Book'));
    head.appendChild(el('span', 'sc-live', 'Live'));
    // "Telegram →" header link hidden — the bot needs work before customers use it (Beau 2026-07-04).
    var clr = el('button', 'sc-clear', 'Clear');
    clr.setAttribute('aria-label', 'Clear chat');
    clr.title = 'Clear chat';
    clr.onclick = function () { clearChat(); };
    head.appendChild(clr);
    var x = el('button', 'sc-close', 'Close');
    x.setAttribute('aria-label', 'Close chat');
    x.onclick = function () { panel.classList.remove('open'); syncSheet(); };
    head.appendChild(x);
    panel.appendChild(head);

    body = el('div', 'sc-body');
    panel.appendChild(body);

    var chips = el('div', 'sc-chips');
    chipsEl = chips;
    [['wait', '⏱ Wait time'], ['who', '💈 Who’s on'], ['hours', '🕐 Hours & parking'], ['book', '✂️ Book']].forEach(function (c) {
      var ch = el('button', 'sc-chip', c[1]);
      ch.onclick = function () {
        if (c[0] === 'book') { bubble('Book me in', 'me'); startBookMenu(); }
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
      if (twq && twq.step === 'service') { handleWalkinService(t); return; }
      if (twq && twq.step === 'details') { handleWalkinDetails(t); return; }
      if (twq && twq.step === 'email') { handleWalkinEmail(t); return; }
      if (cancelMode || (wiz && wiz.step === 'details')) { handleDetails(t); return; }
      if (wiz && wiz.step === 'email') { handleEmail(t); return; }
      var lower = t.toLowerCase();
      var kind = route(lower);
      if (kind === 'book') { startBookMenu(); return; }
      if (kind === 'salon') { startSalon(); return; }
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
    wireSwipe();
  }

  // phone: bottom-sheet behaviour — dimmed backdrop, slide-up, swipe-down to dismiss
  var dim = null;
  function syncSheet() {
    var open = panel && panel.classList.contains('open');
    var phone = window.innerWidth <= 640;
    document.documentElement.classList.toggle('sc-lock', !!(open && phone && !panel.closest('.ls-fsw')));
    if (!dim && panel) {
      dim = document.createElement('div');
      dim.className = 'sc-dim';
      dim.addEventListener('click', function () { panel.classList.remove('open'); syncSheet(); });
      document.body.appendChild(dim);
    }
    if (dim) dim.classList.toggle('show', !!(open && phone && !panel.closest('.ls-fsw')));
    fitSheet();
  }
  function wireSwipe() { // drag the sheet down to dismiss (header, or body when scrolled to top)
    var startY = null, dy = 0, fromHead = false;
    panel.addEventListener('touchstart', function (e) {
      if (window.innerWidth > 640 || panel.closest('.ls-fsw')) return;
      fromHead = !!e.target.closest('.sc-head');
      var inBody = !!e.target.closest('.sc-body');
      if (!fromHead && !(inBody && body.scrollTop <= 0)) { startY = null; return; }
      startY = e.touches[0].clientY; dy = 0;
    }, { passive: true });
    panel.addEventListener('touchmove', function (e) {
      if (startY == null) return;
      dy = e.touches[0].clientY - startY;
      if (dy > 0 && (fromHead || body.scrollTop <= 0)) {
        panel.style.transition = 'none';
        panel.style.transform = 'translateY(' + dy + 'px)';
      }
    }, { passive: true });
    panel.addEventListener('touchend', function () {
      if (startY == null) return;
      panel.style.transition = '';
      panel.style.transform = '';
      if (dy > 90) { panel.classList.remove('open'); syncSheet(); }
      startY = null; dy = 0;
    });
  }
  function fitSheet() {
    if (!panel) return;
    if (!window.visualViewport || window.innerWidth > 640 || panel.closest('.ls-fsw')) { panel.style.height = ''; return; }
    var kb = window.innerHeight - window.visualViewport.height > 60; // keyboard actually up
    if (panel.classList.contains('open') && kb) {
      panel.style.height = window.visualViewport.height + 'px';
      if (body) body.scrollTop = body.scrollHeight;
    } else panel.style.height = '';
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', fitSheet);
  }

  window.__scOpen = function () { openPanel(); };
  window.__scClose = function () { if (panel) panel.classList.remove('open'); syncSheet(); };
  // Site-wide "Book a Cut" CTAs (intercepted SLIKR /res links) now mimic the
  // card's "Book Now" button exactly → the in-chat book-ahead names view.
  // (Beau 2026-07-03) — no old full picker, no SLIKR redirect.
  window.__scBook = function () { window.__scBookAhead(); };

  // ---------- live-wait card → in-chat views (Beau 2026-07-03) ----------
  // Flow A (Join the Queue): the walk-in wait line + walk-in barbers ONLY,
  // then a real walk-in reservation link. Flow B (Book Now): book-ahead names
  // (bookings barbers + Sami) → the existing slot wizard. The two never mix.
  function fmtClock(d) {
    var h = d.getHours(), m = ('0' + d.getMinutes()).slice(-2);
    var ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12;
    return h + ':' + m + ap;
  }

  function scWaitList() {
    if (!body) return;
    setWizUI(false);
    if (!snap) { setTimeout(scWaitList, 500); return; }
    if (!snap.open) {
      // CLOSED walk-in path: capture them onto tomorrow's walk-in list right in chat.
      // Posts to /api/queue → a card for Bayli to add to SLIKR in the morning; SLIKR
      // sends the confirmation SMS. No call, no missed lead. (Winston 2026-07-03)
      startTomorrowWalkin();
      return;
    }
    bubble(answer('wait', snap), 'bot');
    if (snap.open && fresh(snap) && snap.walkin_wait != null) {
      var asOfD = new Date(snap.as_of.replace(/(\d{2})(\d{2})$/, '$1:$2'));
      var wb = (snap.barbers || []).filter(function (b) { return b.walkin === true; });
      if (wb.length) {
        bubble('On walk-ins ' + asOf(snap) + ':\n' + wb.map(function (b) {
          var st = b.cutting
            ? 'cutting · free ~' + fmtClock(new Date(asOfD.getTime() + (+b.free_in || 0) * 60000))
            : 'free now';
          return (b.cutting ? '✂️ ' : '🟢 ') + b.name.split(' ')[0] + ' — ' + st;
        }).join('\n'), 'bot');
      }
      // CTA → in-chat walk-in queue join (barber/Any picker → details → relay),
      // never a SLIKR redirect. (Beau 2026-07-03)
      chipRow([{ label: 'Join the queue →' }], function () { startWalkin(); });
    }
  }

  // Barber-first book-ahead: pick who you want, THEN that barber's own
  // schedule (only the days they're actually on — Jarred Tue–Sun, Locky
  // Wed–Sun, etc.), then a time. Driven off SLIKR's book_days, inverted to
  // a per-barber view so each chair shows its real roster. (Beau/Jett 2026-07-05)
  function dayChip(d) {
    var t = new Date(); t.setHours(0, 0, 0, 0);
    var dd = new Date(d.date + 'T00:00:00');
    var diff = Math.round((dd - t) / 86400000);
    if (diff <= 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    var wk = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dd.getDay()];
    var mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dd.getMonth()];
    return wk + ' ' + dd.getDate() + ' ' + mo;
  }

  function scPickBookDay() {
    setWizUI(false);
    var days = (snap.book_days || []).filter(function (d) {
      return d.barbers && Object.keys(d.barbers).some(function (n) { return (d.barbers[n] || []).length; });
    });
    // Invert book_days → barber : [{date,label,times}] so we can show each
    // barber's own working days.
    var byBarber = {}, order = [];
    days.forEach(function (d) {
      Object.keys(d.barbers).forEach(function (n) {
        if (!(d.barbers[n] || []).length) return;
        if (!byBarber[n]) { byBarber[n] = []; order.push(n); }
        byBarber[n].push({ date: d.date, label: d.label, times: d.barbers[n] });
      });
    });
    // Sami books off her own Blackrose schedule but shows as just another
    // barber in the list — no "salon" tag. Her week comes from salon.days;
    // fall back to the legacy single-day salon feed. (Beau 2026-07-05)
    var sal = snap.salon || {};
    var samiDays = (sal.days || []).map(function (d) {
      var k = Object.keys(d.slots || {}).filter(function (x) { return /^sam/i.test(x) && (d.slots[x] || []).length; })[0];
      return k ? { date: d.date, label: d.label, times: d.slots[k], stylist: k } : null;
    }).filter(Boolean);
    if (!samiDays.length) {
      var lk = Object.keys(sal.slots || {}).filter(function (x) { return /^sam/i.test(x) && (sal.slots[x] || []).length; })[0];
      if (lk) samiDays = [{ date: sal.date, label: sal.label, times: sal.slots[lk], stylist: lk }];
    }
    if (!order.length && !samiDays.length) {
      bubble('Tomorrow’s book isn’t open yet — try again in the morning or call ' + PHONE + '.', 'bot', true);
      return;
    }
    bubble(snap.open ? 'Who would you like to book with?' : 'We’re closed now — book ahead. Who with?', 'bot');
    var opts = order.map(function (n) { return { label: n.split(' ')[0], barber: n }; });
    if (samiDays.length) opts.push({ label: 'Sami', sami: true });
    opts.push({ label: 'Walk-In’s 💈', walk: true }); // Beau 2026-07-07: jump to the join-the-queue flow
    chipRow(opts, function (o) {
      bubble(o.label, 'me');
      if (o.walk) { scWaitList(); return; }
      if (o.sami) { scSamiDays(samiDays); return; }
      scBarberDays(o.barber, byBarber[o.barber]);
    });
  }

  // Sami's day-picker → salon booking, seeded with the chosen day's slots.
  // Mirrors startSalon but for one specific day so she behaves like a barber.
  function scSamiDays(days) {
    function go(day) {
      setWizUI(true);
      var sal = snap.salon || {};
      if (!(sal.services || []).length || !(day.times || []).length) {
        bubble('Sami’s book is closed right now — call ' + PHONE + '.', 'bot', true);
        setWizUI(false); return;
      }
      wiz = { step: 'service', shop: 'salon', barber: day.stylist || 'Sami',
              salonSlots: day.times, date: day.date, salonLabel: dayChip(day) };
      bubble('Sami — what are we doing?', 'bot');
      chipRow(sal.services.map(function (s) { return { label: svcName(s.name) + ' · $' + s.cost, service: s.id }; }), function (o) {
        bubble(o.label, 'me'); wiz.service = o.service;
        bubble('What time ' + dayChip(day) + '?', 'bot');
        chipRow(wiz.salonSlots.map(function (t) { return { label: fmtT(t), slot: t }; }), function (o2) {
          bubble(o2.label, 'me'); wiz.slot = o2.slot; askDetails();
        }, true);
      });
    }
    if (days.length === 1) { bubble(dayChip(days[0]), 'me'); go(days[0]); return; }
    bubble('Sami’s schedule — which day?', 'bot');
    chipRow(days.map(function (s) { return { label: dayChip(s), day: s }; }), function (o) {
      bubble(o.label, 'me'); go(o.day);
    }, true);
  }

  function scBarberDays(barber, sched) {
    function go(day) {
      setWizUI(true);
      wiz = { step: 'service', shop: 'bookings', barber: barber, ahead: true,
              date: day.date, label: dayChip(day), dayBarbers: {} };
      wiz.dayBarbers[barber] = day.times;
      askService();
    }
    if (sched.length === 1) { bubble(dayChip(sched[0]), 'me'); go(sched[0]); return; }
    bubble(barber.split(' ')[0] + '’s schedule — which day?', 'bot');
    chipRow(sched.map(function (s) { return { label: dayChip(s), day: s }; }), function (o) {
      bubble(o.label, 'me'); go(o.day);
    }, true);
  }

  function scBookNames() {
    if (!body) return;
    setWizUI(false);
    if (!snap) { setTimeout(scBookNames, 500); return; }
    if ((snap.book_days || []).length) { scPickBookDay(); return; }
    var opts = [];
    if (snap.open) {
      (snap.barbers || []).forEach(function (b) {
        if ((b.book || []).indexOf('bookings') >= 0)
          opts.push({ label: b.name.split(' ')[0], barber: b.name });
      });
    } else {
      // CLOSED: list EVERY barber on tomorrow's bookings roster (all slots_next
      // keys) even if their times array is momentarily empty, so the list never
      // collapses to whoever happens to be loaded. (Beau 2026-07-03)
      Object.keys(snap.slots_next || {}).forEach(function (n) {
        opts.push({ label: n.split(' ')[0], barber: n, ahead: true });
      });
    }
    // Sami — the salon stylist. Shown as just "Sami" (never "Blackrose"/"salon").
    // Appears ONLY when she's actually on the Blackrose schedule that day —
    // i.e. the salon feed has real slots (today when open, next-day when closed).
    // No salon schedule → no Sami. (Beau 2026-07-03)
    var sal = snap.salon || {};
    var hasSalon = Object.keys(sal.slots || {}).some(function (k) { return (sal.slots[k] || []).length; });
    if (hasSalon) opts.push({ label: 'Sami', salon: true });

    if (!opts.length) {
      if (snap.open) {
        bubble('No book-ahead chairs open right now — tap ⏱ Wait time to join the walk-in queue, or call ' + PHONE + '.', 'bot');
      } else {
        // Closed + no roster loaded → don't dead-end them; offer the walk-in
        // list. withBook link runs startTomorrowWalkin. (Beau 2026-07-05)
        bubble('Tomorrow’s book isn’t open yet — try again in the morning or call ' + PHONE + '.', 'bot', true);
      }
      return;
    }
    bubble('Book ahead — who with?', 'bot');
    chipRow(opts, function (o) {
      if (o.salon) { bubble('Sami', 'me'); startSalon('Sami'); return; }
      bubble(o.label, 'me');
      // On tomorrow's roster but times not loaded yet → graceful, not a dead end.
      if (o.ahead && !((snap.slots_next && snap.slots_next[o.barber]) || []).length) {
        bubble(o.label + '’s ' + (snap.next_label || 'tomorrow') + ' times load closer to the day — check back in the morning, or call us to lock a spot.', 'bot');
        var tg2 = el('div', 'sc-msg bot');
        var ta2 = el('a', 'sc-book', '📞 Call to lock a spot');
        ta2.href = 'tel:' + PHONE.replace(/\s/g, ''); ta2.rel = 'noopener';
        tg2.appendChild(ta2);
        body.appendChild(tg2); body.scrollTop = body.scrollHeight;
        return;
      }
      setWizUI(true);
      wiz = { step: 'service', shop: 'bookings', barber: o.barber };
      if (o.ahead) { wiz.ahead = true; wiz.date = snap.next_date; }
      askService();
    });
  }

  // Open the panel (building it on first use) then render the requested card
  // view — without the default auto "wait" ask that the bubble/FAB fires.
  function scCardOpen(cb) {
    if (!opened) {
      opened = true;
      tick();
      setInterval(tick, 30000);
      build();
      setTimeout(function () {
        panel.classList.add('open');
        syncSheet();
        setTimeout(cb, 60);
      }, 30);
    } else {
      if (body) { body.innerHTML = ''; wiz = null; setWizUI(false); }
      panel.classList.add('open');
      syncSheet();
      setTimeout(cb, 50);
    }
  }
  window.__scWalkins = function () { scCardOpen(scWaitList); };
  window.__scBookAhead = function () { scCardOpen(scBookNames); };
  window.__scSalon = function () { scCardOpen(function () { startSalon(); }); };

  // Hero "Live Queue" button → same walk-in flow as the card's Join the Queue.
  var heroLQ = document.getElementById('hero-live-queue');
  if (heroLQ) heroLQ.addEventListener('click', function (e) { e.preventDefault(); window.__scWalkins(); });

  // Never send people to SLIKR from the site: any booking link opens the
  // in-chat wizard instead (Blackrose salon links stay external).
  document.addEventListener('click', function (e) {
    // Live-wait card foot: route its buttons into the in-chat views instead of
    // SLIKR / the static reveal panels. Decide by the live label (set by
    // live-wait.js): "Book Now" = book-ahead view; "Join the Queue" (open) and
    // "Join tomorrow's queue" (closed) both = the walk-in path (__scWalkins,
    // which branches open/closed itself). (Beau 2026-07-03)
    var lw = e.target.closest && e.target.closest('#lw-cta, #lw-join, #lw-queue-go');
    if (lw) {
      var txt = (lw.textContent || '').toLowerCase();
      if (txt.indexOf('book now') >= 0) {
        e.preventDefault(); e.stopImmediatePropagation(); window.__scBookAhead(); return;
      }
      if (txt.indexOf('join the queue') >= 0 || txt.indexOf('tomorrow') >= 0) {
        e.preventDefault(); e.stopImmediatePropagation(); window.__scWalkins(); return;
      }
      return;
    }
    // In-chat booking convention (replaces all SLIKR links, Beau 2026-07-07):
    // #book → book flow, #book-salon → Blackrose salon flow.
    var bk = e.target.closest && e.target.closest('a[href$="#book"], a[href$="#book-salon"]');
    if (bk) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (/#book-salon$/.test(bk.getAttribute('href') || '')) window.__scSalon(); else window.__scBook();
      return;
    }
    // Legacy safety net: any stray SLIKR link still opens the in-chat flow, never navigates out.
    var a = e.target.closest && e.target.closest('a[href*="slikr.com.au"]');
    if (!a) return;
    e.preventDefault();
    if (/blackrosesalon/.test(a.href)) window.__scSalon(); else window.__scBook();
  }, true);

  // Launcher opens the in-site chat and RESETS to the book fork every time
  // (Telegram hidden until the bot's ready, Beau 2026-07-07).
  function openPanel() {
    scCardOpen(function () {
      bubble('Lock a time, or join the walk-in queue?', 'bot');
      chipRow([{ label: '📅 Bookings', cat: 'book' }, { label: '💈 Walk-in', cat: 'walk' }], function (o) {
        if (o.cat === 'book') { bubble('Bookings', 'me'); scBookNames(); return; }
        bubble('Walk-in', 'me'); scWaitList();
      });
    });
  }
  fab.onclick = openPanel;
})();
