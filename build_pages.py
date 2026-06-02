#!/usr/bin/env python3
"""Generate Blacksmith multi-page site (site-v5). Identical shared chrome, per-page body."""
import json, os, pathlib

ROOT = pathlib.Path(__file__).resolve().parent

# ---- booking / app links (exact) ----
BARBER = "https://web.slikr.com.au/shop/1121/res"
QUEUE  = "https://web.slikr.com.au/shop/421/res"
SALON  = "https://web.slikr.com.au/blackrosesalon"
WALKIN = "https://web.slikr.com.au/blacksmithbarbers"
APP    = "https://apps.apple.com/au/app/blacksmith-barbers-salon/id1454355905"
SHOPALL= "https://blacksmithbarbers.com.au/blacksmith-barbers-shop/"

APP_SVG = '<svg width="20" height="24" viewBox="0 0 24 28" fill="#fff" aria-hidden="true"><path d="M17.05 14.86c-.03-2.86 2.34-4.23 2.44-4.3-1.33-1.95-3.4-2.22-4.14-2.25-1.76-.18-3.44 1.04-4.33 1.04-.9 0-2.27-1.02-3.74-.99-1.92.03-3.7 1.12-4.69 2.84-2 3.47-.51 8.6 1.43 11.42.95 1.38 2.08 2.93 3.56 2.87 1.43-.06 1.97-.93 3.7-.93 1.72 0 2.21.93 3.72.9 1.54-.03 2.51-1.4 3.45-2.79 1.09-1.6 1.54-3.15 1.56-3.23-.03-.01-2.99-1.15-3.02-4.55zM14.2 6.55c.79-.96 1.32-2.29 1.18-3.62-1.14.05-2.52.76-3.33 1.71-.73.85-1.37 2.21-1.2 3.5 1.27.1 2.57-.64 3.35-1.59z"/></svg>'

def app_badge(extra=""):
    return (f'<a class="app-badge" href="{APP}" aria-label="Get the Blacksmith Barbers app on the App Store"{extra}>'
            f'{APP_SVG}<span class="ab-txt"><span class="ab-small">Get the</span><span class="ab-big">App</span></span></a>')

NAV = [
    ("index.html",   "Home"),
    ("shop.html",    "Shop"),
    ("academy.html", "Academy"),
    ("blackrose.html","Blackrose"),
    ("barbers.html", "Barbers"),
    ("about.html",   "About"),
    ("visit.html",   "Visit"),
]

def header(active):
    desk, mob = [], []
    for href, label in NAV:
        cls = ' class="active" aria-current="page"' if href == active else ''
        mcls = ' class="active"' if href == active else ''
        desk.append(f'    <a href="{href}"{cls}>{label}</a>')
        mob.append(f'    <a href="{href}"{mcls} data-close>{label}</a>')
    desk = "\n".join(desk)
    mob = "\n".join(mob)
    return f'''<a href="#main" class="skip-link">Skip to content</a>

<!-- ============ TOPBAR ============ -->
<header class="topbar" id="topbar">
  <a href="index.html" class="topbar-logo" aria-label="Blacksmith Barbers home"><img src="assets/logo-white.png" alt="Blacksmith Barbers"></a>
  <nav class="nav-desktop" aria-label="Primary">
{desk}
  </nav>
  <div class="nav-actions">
    {app_badge()}
    <a class="btn btn-gold" href="{BARBER}">Book a Cut</a>
  </div>
  <button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="drawer">
    <span></span><span></span><span></span>
  </button>
</header>

<!-- ============ MOBILE DRAWER ============ -->
<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Site menu">
  <nav aria-label="Mobile">
{mob}
  </nav>
  <div class="drawer-actions">
    <a class="btn btn-gold btn-block" href="{BARBER}" data-close>Book a Cut</a>
    {app_badge(' data-close')}
  </div>
</div>
'''

FOOTER = f'''<!-- ============ FOOTER ============ -->
<footer class="footer">
  <div class="wrap">
    <div class="footer-top">
      <div class="footer-col footer-logo">
        <img src="assets/logo-white.png" alt="Blacksmith Barbers">
        <p class="footer-tag">Est. 2015 &mdash; Biggera Waters, Gold Coast. More than a barbershop. We're family.</p>
        {app_badge()}
      </div>
      <div class="footer-col">
        <h4>Explore</h4>
        <ul>
          <li><a href="shop.html">Shop</a></li>
          <li><a href="academy.html">Academy</a></li>
          <li><a href="blackrose.html">Blackrose Salon</a></li>
          <li><a href="barbers.html">Our Barbers</a></li>
          <li><a href="about.html">About</a></li>
          <li><a href="visit.html">Visit</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Book</h4>
        <ul>
          <li><a href="{BARBER}">Book a Barber</a></li>
          <li><a href="{QUEUE}">Join the Queue</a></li>
          <li><a href="{SALON}">Book Blackrose</a></li>
          <li><a href="{WALKIN}">Walk-ins</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Visit</h4>
        <address>
          9 Gateway Drive<br>
          Biggera Waters QLD 4216<br>
          <a href="tel:+61755638960">(07) 5563 8960</a><br>
          <a class="mail" href="mailto:blacksmithbarbers@gmail.com">blacksmithbarbers@gmail.com</a><br><br>
          Mon&ndash;Fri 9:00&ndash;5:30<br>
          Sat&ndash;Sun 9:00&ndash;3:30
        </address>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 Blacksmith Barbers. Biggera Waters, Gold Coast.</p>
      <p>Your chair. Your barber. Every time.</p>
    </div>
  </div>
</footer>

<!-- ============ STICKY MOBILE BOOKING BAR ============ -->
<div class="book-bar" id="bookBar">
  <a class="btn btn-gold btn-block" href="{BARBER}">Book a Cut</a>
</div>

<script src="assets/site.js"></script>
</body>
</html>
'''

def head(title, desc):
    return f'''<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#0b0b0d">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:locale" content="en_AU">
<link rel="apple-touch-icon" href="assets/logo-white.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Blacksmith">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/site.css">
</head>
<body>
'''

def page(active, title, desc, body):
    return head(title, desc) + header(active) + "\n<main id=\"main\">\n" + body + "\n</main>\n\n" + FOOTER

def page_hero(eyebrow, h1, lead, bg=None, ctas=""):
    bgcls = " has-bg" if bg else ""
    bgdiv = f'<div class="page-hero-bg" style="background-image:url(\'{bg}\');background-position:center 35%" aria-hidden="true"></div>' if bg else ""
    crumb = f'<p class="crumb"><a href="index.html">Home</a> &nbsp;/&nbsp; <span>{eyebrow}</span></p>'
    return f'''<section class="page-hero{bgcls}">
  {bgdiv}
  <div class="wrap page-hero-inner">
    {crumb}
    <p class="eyebrow reveal">{eyebrow}</p>
    <h1 class="h1 reveal">{h1}</h1>
    <p class="lead reveal">{lead}</p>
    {('<div class="hero-cta reveal">'+ctas+'</div>') if ctas else ''}
  </div>
</section>
'''

# =====================================================================
# SHOP
# =====================================================================
def cat(icon, tag, h, p):
    return f'''      <article class="cat-card">
        <span class="cat-icon">{icon}</span>
        <span class="tag">{tag}</span>
        <h3 class="h3">{h}</h3>
        <p>{p}</p>
      </article>'''

ic_shampoo = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 8h8v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V8z"/><path d="M9 8V5h6v3"/><path d="M10 5V3h4v2"/></svg>'
ic_style = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.5 15.5"/><path d="M14.5 14 20 20"/></svg>'
ic_beard = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 5c0 7 3 13 8 13s8-6 8-13"/><path d="M9 9c1 1 5 1 6 0"/></svg>'
ic_shave = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 3 21 10"/><path d="M17.5 6.5 7 17l-4 1 1-4L14.5 3.5z"/></svg>'

shop_body = page_hero(
    "Shop",
    "Take the shop home<br>with you.",
    "The same barbershop-grade gear we reach for behind the chair &mdash; shampoos, styling, beard care and shave essentials. Made to make the cut last past your appointment.",
    bg="assets/photos/TLB_4414-1.jpg",
    ctas=f'<a class="btn btn-gold" href="{SHOPALL}">Shop all products</a><a class="btn btn-ghost" href="{BARBER}">Book a Cut</a>'
) + f'''
<section class="services section-pad">
  <div class="wrap">
    <div class="section-head reveal">
      <p class="eyebrow">By category</p>
      <h2 class="h2">Grooming gear, barber-grade.</h2>
      <p>No drugstore filler. Everything on the shelf is what our barbers actually use &mdash; chosen to hold, condition and finish the way a proper cut deserves.</p>
    </div>
    <div class="cat-grid stagger">
{cat(ic_shampoo,"Wash","Shampoos &amp; Conditioners","Salon-strength cleansing and conditioning that won&rsquo;t strip your hair or your colour. The base every good style sits on.")}
{cat(ic_style,"Finish","Styling Gear","Pomades, clays, pastes and sprays &mdash; matte to high-shine, light hold to all-day lock. Get the chair finish at home.")}
{cat(ic_beard,"Beard","Beard Care","Beard oils, balms and washes to keep it soft, shaped and itch-free between trims. Looked-after, not just grown.")}
{cat(ic_shave,"Shave","Shave Essentials","Pre-shave, creams and post-shave care for a close, comfortable shave &mdash; the hot-towel feel, your bathroom.")}
    </div>
    <div class="reveal" style="text-align:center;margin-top:clamp(40px,6vw,64px)">
      <a class="btn btn-gold" href="{SHOPALL}">Shop all products</a>
    </div>
  </div>
</section>

<section class="story section-pad">
  <div class="wrap">
    <div class="story-grid">
      <div class="story-copy reveal">
        <p class="eyebrow">Why it matters</p>
        <h2 class="h2">A good cut is only half the job.</h2>
        <p class="lead">The other half is what you do with it for the next three weeks. The right product is the difference between &ldquo;fresh out of the chair&rdquo; and &ldquo;due for a trim&rdquo; by Wednesday.</p>
        <p>Ask your barber what they used on you &mdash; then take it home. We stock it on the shelf and online, no guesswork. Same gear, same finish, every morning.</p>
        <p><a class="svc-link" href="{SHOPALL}">Browse the full range &rarr;</a></p>
      </div>
      <div class="story-media reveal">
        <img src="assets/photos/TLB_4414-1.jpg" alt="Product shelf and leather lounge inside Blacksmith Barbers" loading="lazy">
      </div>
    </div>
  </div>
</section>

<section class="cta-band section-pad">
  <div class="wrap reveal">
    <p class="eyebrow">In-store &amp; online</p>
    <h2 class="h2">Pick it up in the chair, or order online.</h2>
    <p>Grab your gear next time you&rsquo;re in, or shop the full range and have it sent to you.</p>
    <div class="hero-cta">
      <a class="btn btn-gold" href="{SHOPALL}">Shop all products</a>
      <a class="btn btn-ghost" href="visit.html">Visit the shop</a>
    </div>
  </div>
</section>
'''

# =====================================================================
# ACADEMY
# =====================================================================
def feat(num, h, p):
    return f'''      <article class="feature-card">
        <div class="num">{num}</div>
        <h3 class="h3">{h}</h3>
        <p>{p}</p>
      </article>'''

academy_body = page_hero(
    "Academy",
    "Learn the trade<br>on the floor.",
    "Not a classroom &mdash; a working barbershop. Real chairs, real paying clients, and barbers with decades on the tools standing beside you. You learn the craft the way it&rsquo;s actually done.",
    bg="assets/photos/TLB_4063.jpg",
    ctas=f'<a class="btn btn-gold" href="{WALKIN}">Enquire</a><a class="btn btn-ghost" href="barbers.html">Meet your mentors</a>'
) + f'''
<section class="trust">
  <div class="wrap">
    <div class="trust-grid stagger">
      <div class="trust-cell"><div class="trust-num">2015</div><div class="trust-label">Training since</div></div>
      <div class="trust-cell"><div class="trust-num">Live</div><div class="trust-label">Shop-floor learning</div></div>
      <div class="trust-cell"><div class="trust-num">Real</div><div class="trust-label">Paying clients</div></div>
      <div class="trust-cell"><div class="trust-num">Cert.</div><div class="trust-label">Recognised finish</div></div>
    </div>
  </div>
</section>

<section class="services section-pad">
  <div class="wrap">
    <div class="section-head reveal">
      <p class="eyebrow">How it works</p>
      <h2 class="h2">Education is what we&rsquo;re known for.</h2>
      <p>Blacksmith is an industry leader in barber education on the northern Gold Coast. Here&rsquo;s how a student becomes a barber under our roof.</p>
    </div>
    <div class="feature-grid stagger">
{feat("01","On the live floor","You train in the room, not a back classroom. From day one you&rsquo;re around real cuts, real clients and the pace of a working shop.")}
{feat("02","Mentored by working barbers","Every student is paired with barbers who are on the tools every day. You watch it done right, then do it with someone right beside you.")}
{feat("03","Real certification, real clients","You finish with a recognised qualification &mdash; earned on real heads, not mannequins. Walk out ready to hold a chair of your own.")}
    </div>
  </div>
</section>

<section class="detail">
  <div class="wrap section-pad">
    <div class="detail-grid">
      <div class="detail-media reveal">
        <img src="assets/photos/TLB_4234.jpg" alt="A Blacksmith Academy barber working on a client by the shopfront" loading="lazy">
      </div>
      <div class="detail-copy reveal">
        <p class="eyebrow">What you&rsquo;ll learn</p>
        <h2 class="h2">From first fade to a chair of your own.</h2>
        <p>We don&rsquo;t teach theory and hope it sticks. You learn by doing, on real clients, with a mentor checking every line.</p>
        <ul class="detail-list">
          <li>Clipper work, fades and tapers</li>
          <li>Scissor-over-comb &amp; texture</li>
          <li>Beard shaping &amp; hot-towel shaves</li>
          <li>Consultation &amp; reading the client</li>
          <li>Shop floor pace, hygiene &amp; chair management</li>
        </ul>
        <a class="btn btn-gold" href="{WALKIN}">Enquire</a>
      </div>
    </div>
  </div>
</section>

<section class="cta-band section-pad">
  <div class="wrap reveal">
    <p class="eyebrow">Start your trade</p>
    <h2 class="h2">Ready to learn it from people who live it?</h2>
    <p>Tell us a bit about you and we&rsquo;ll be in touch about the next intake at the Blacksmith Academy.</p>
    <div class="hero-cta">
      <a class="btn btn-gold" href="{WALKIN}">Enquire now</a>
      <a class="btn btn-ghost" href="visit.html">Visit us</a>
    </div>
  </div>
</section>
'''

# =====================================================================
# BLACKROSE
# =====================================================================
blackrose_body = page_hero(
    "Blackrose Salon",
    "The salon side<br>of the room.",
    "Launched in 2025, Blackrose is the ladies&rsquo; lounge beside the barbershop &mdash; soft lighting, refined timber, and the same eye for detail pointed at precision cuts, colour and full transformations.",
    bg="assets/photos/TLB_4870.jpg",
    ctas=f'<a class="btn btn-gold" href="{SALON}">Book salon</a><a class="btn btn-ghost" href="#blackrose-services">See services</a>'
) + f'''
<section class="story section-pad">
  <div class="wrap">
    <div class="story-grid">
      <div class="story-copy reveal">
        <p class="eyebrow">Est. 2025</p>
        <h2 class="h2">A calmer room. The same craft.</h2>
        <p class="lead">Blackrose opened in 2025 as the salon side of the Blacksmith world &mdash; a refined, relaxed lounge with soft lighting and warm timber, built for women who want their hair done properly.</p>
        <p>It&rsquo;s the same standard that built the barbershop, turned toward colour, styling and transformation. Unhurried, considered, and finished to the detail.</p>
      </div>
      <div class="story-media reveal">
        <img src="assets/photos/TLB_4423.jpg" alt="Arched doorway through to the Blackrose salon" loading="lazy">
      </div>
    </div>
  </div>
</section>

<section class="services section-pad" id="blackrose-services">
  <div class="wrap">
    <div class="section-head reveal">
      <p class="eyebrow">What we do</p>
      <h2 class="h2">Precision, colour &amp; transformation.</h2>
    </div>
    <div class="feature-grid stagger">
{feat("&mdash;","Precision Cuts","Considered, tailored cutting and styling &mdash; shaped to you, finished to the detail.")}
{feat("&mdash;","Colour","Foils, balayage, all-over colour and correction. Rich, lasting, looked-after.")}
{feat("&mdash;","Transformations","Big-change appointments where colour, cut and styling come together as one result.")}
    </div>
  </div>
</section>

<section class="detail">
  <div class="wrap section-pad">
    <div class="detail-grid rev">
      <div class="detail-media reveal">
        <img src="assets/photos/TLB_3866.jpg" alt="Blackrose Salon Co frosted glass signage" loading="lazy">
      </div>
      <div class="detail-copy reveal">
        <p class="eyebrow">Your stylist</p>
        <h2 class="h2">Sammi runs Blackrose.</h2>
        <p>From foils to precision cuts, Sammi heads up the salon side of the Blacksmith world &mdash; the same care and craft, a calmer pace, the full transformation.</p>
        <ul class="detail-list">
          <li>Soft lighting &amp; refined timber lounge</li>
          <li>Precision cutting &amp; styling</li>
          <li>Colour, balayage &amp; correction</li>
          <li>Biggera Waters &mdash; beside Blacksmith Barbers</li>
        </ul>
        <a class="btn btn-gold" href="{SALON}">Book salon</a>
      </div>
    </div>
  </div>
</section>

<section class="cta-band section-pad">
  <div class="wrap reveal">
    <p class="eyebrow">Now booking</p>
    <h2 class="h2">Book your seat in the Blackrose lounge.</h2>
    <p>Cut, colour or the full transformation &mdash; lock in your appointment with Sammi.</p>
    <div class="hero-cta">
      <a class="btn btn-gold" href="{SALON}">Book salon</a>
      <a class="btn btn-ghost" href="visit.html">Find us</a>
    </div>
  </div>
</section>
'''

# =====================================================================
# BARBERS
# =====================================================================
with open(ROOT / "assets/barbers/barbers.json") as f:
    barbers = json.load(f)

# order: owner first, then head barbers, barbers, apprentices, salon stylist last
def rank(b):
    r = b["role"].lower()
    if "owner" in r: return 0
    if "head" in r: return 1
    if "apprentice" in r: return 3
    if "stylist" in r: return 4
    return 2
barbers_sorted = sorted(barbers, key=rank)

cards = []
for b in barbers_sorted:
    photo = b["photo"]
    is_ph = photo.endswith(".svg") or b.get("needsHeadshot")
    book = SALON if b.get("shop") == "Blackrose Salon" else BARBER
    book_label = "Book salon" if b.get("shop") == "Blackrose Salon" else "Book with " + b["name"]
    if is_ph:
        media = (f'<div class="barber-photo placeholder">'
                 f'<span class="initial" aria-hidden="true">{b["name"][0]}</span>'
                 f'<span class="pending">Headshot coming soon</span></div>')
    else:
        media = f'<div class="barber-photo"><img src="{photo}" alt="{b["name"]}, {b["role"]} at Blacksmith" loading="lazy"></div>'
    cards.append(f'''      <article class="barber-card">
        {media}
        <div class="barber-info">
          <span class="role">{b["role"]}</span>
          <h3>{b["name"]}</h3>
          <p>{b["blurb"]}</p>
          <a class="btn btn-gold btn-block" href="{book}">{book_label}</a>
        </div>
      </article>''')
cards_html = "\n".join(cards)

barbers_body = page_hero(
    "Our Barbers",
    "Your barber.<br>Not just a barber.",
    "The crew behind the chairs at Blacksmith. Find your barber, then lock them in &mdash; so the person who knows your cut is the one holding the clippers.",
    bg="assets/photos/TLB_3394.jpg",
    ctas=f'<a class="btn btn-gold" href="{BARBER}">Book a Cut</a><a class="btn btn-ghost" href="{QUEUE}">Check the wait</a>'
) + f'''
<section class="services section-pad">
  <div class="wrap">
    <div class="section-head reveal">
      <p class="eyebrow">The crew</p>
      <h2 class="h2">Meet the chairs.</h2>
      <p>From head barbers to academy apprentices coming up the right way &mdash; every chair at Blacksmith is held to one standard.</p>
    </div>
    <div class="barber-grid stagger">
{cards_html}
    </div>
  </div>
</section>

<section class="cta-band section-pad">
  <div class="wrap reveal">
    <p class="eyebrow">Found your barber?</p>
    <h2 class="h2">Lock them in on the app.</h2>
    <p>Book your barber directly, check the wait, or download the app and never take a number again.</p>
    <div class="hero-cta">
      <a class="btn btn-gold" href="{BARBER}">Book a Cut</a>
      {app_badge()}
    </div>
  </div>
</section>
'''

# =====================================================================
# ABOUT
# =====================================================================
cameron = next(b for b in barbers if b["name"] == "Cameron")
about_body = page_hero(
    "About",
    "More than a barbershop.<br>We&rsquo;re family.",
    "Established 2015. One of the longest-standing, most trusted family-owned barbershops on the northern Gold Coast &mdash; and an industry leader in barber education.",
    bg="assets/photos/TLB_3394.jpg",
    ctas=f'<a class="btn btn-gold" href="{BARBER}">Book a Cut</a><a class="btn btn-ghost" href="academy.html">The Academy</a>'
) + f'''
<section class="story section-pad">
  <div class="wrap">
    <div class="story-grid">
      <div class="story-copy reveal">
        <p class="eyebrow">Our story</p>
        <h2 class="h2">Ten years, one room, one family.</h2>
        <p class="lead">Blacksmith opened in Biggera Waters in 2015 and never moved. A decade on, it&rsquo;s one of the longest-standing and most trusted family-owned barbershops on the northern Gold Coast.</p>
        <p>We&rsquo;ve grown from one room into a large-format warehouse beside the Harbour Town carpark &mdash; but the feeling never changed. You&rsquo;re not a number here. You&rsquo;re looked after, by people who know your name.</p>
        <p>We&rsquo;re also an industry leader in education, training the next generation of barbers on our own shop floor through the Blacksmith Academy.</p>
      </div>
      <div class="story-media reveal">
        <img src="assets/photos/TLB_3868.jpg" alt="Blacksmith Barber Co frosted signage at the entrance" loading="lazy">
      </div>
    </div>
  </div>
</section>

<section class="detail">
  <div class="wrap section-pad">
    <div class="detail-grid rev">
      <div class="detail-media reveal">
        <img src="{cameron["photo"]}" alt="Cameron, owner and head barber of Blacksmith Barbers" loading="lazy" style="aspect-ratio:4/5;object-fit:cover;object-position:center top">
      </div>
      <div class="detail-copy reveal">
        <p class="eyebrow">The owner</p>
        <h2 class="h2">Cameron.</h2>
        <p>{cameron["blurb"]}</p>
        <p>What started as one chair is now a Gold Coast institution &mdash; still family-owned, still obsessed with the craft, still treating every client like they belong here.</p>
        <a class="btn btn-gold" href="{BARBER}">Book a Cut</a>
      </div>
    </div>
  </div>
</section>

<section class="services section-pad">
  <div class="wrap">
    <div class="section-head reveal">
      <p class="eyebrow">The experience</p>
      <h2 class="h2">Built to be more than a haircut.</h2>
      <p>A large-format warehouse beside the Harbour Town carpark &mdash; room to relax, not a waiting line.</p>
    </div>
    <div class="feature-grid stagger">
{feat("&mdash;","Massage chairs","Sink in while you wait or while you&rsquo;re in the chair. The visit is meant to feel good, not rushed.")}
{feat("&mdash;","Complimentary drinks","A cold drink in your hand the moment you walk in. On us, every time.")}
{feat("&mdash;","Merch &amp; gifts","Blacksmith merch, grooming gear and gift options &mdash; take a bit of the shop home with you.")}
    </div>
  </div>
</section>

<section class="gallery section-pad">
  <div class="wrap">
    <div class="gallery-head reveal">
      <p class="eyebrow">The room</p>
      <h2 class="h2">The room does half the talking.</h2>
    </div>
    <div class="gallery-grid stagger">
      <figure><img src="assets/photos/TLB_3868.jpg" alt="Blacksmith signage at the entrance" loading="lazy"></figure>
      <figure><img src="assets/photos/TLB_3394.jpg" alt="The Blacksmith warehouse floor with barbers at work" loading="lazy"></figure>
      <figure><img src="assets/photos/TLB_4814.jpg" alt="A barber finishing a client&rsquo;s cut" loading="lazy"></figure>
      <figure><img src="assets/photos/TLB_4414-1.jpg" alt="Product shelf and leather lounge inside Blacksmith" loading="lazy"></figure>
      <figure><img src="assets/photos/TLB_4429.jpg" alt="Barber chair against reclaimed timber" loading="lazy"></figure>
      <figure><img src="assets/photos/TLB_4063.jpg" alt="A senior barber guiding an apprentice" loading="lazy"></figure>
      <figure><img src="assets/photos/TLB_4423.jpg" alt="Arched doorway through to the Blackrose salon" loading="lazy"></figure>
      <figure><img src="assets/photos/TLB_4870.jpg" alt="Backlit mirrors in the Blackrose salon" loading="lazy"></figure>
    </div>
  </div>
</section>

<section class="cta-band section-pad">
  <div class="wrap reveal">
    <p class="eyebrow">Come see for yourself</p>
    <h2 class="h2">Pull up a chair. You&rsquo;re family here.</h2>
    <p>Book your barber on the app, or walk in &mdash; one minute from Harbour Town.</p>
    <div class="hero-cta">
      <a class="btn btn-gold" href="{BARBER}">Book a Cut</a>
      <a class="btn btn-ghost" href="visit.html">Visit us</a>
    </div>
  </div>
</section>
'''

# =====================================================================
# VISIT
# =====================================================================
visit_body = page_hero(
    "Visit",
    "Walk in, or lock in<br>your chair on the app.",
    "9 Gateway Drive, Biggera Waters &mdash; one minute from Harbour Town, easy parking out front. Open seven days.",
    bg="assets/photos/TLB_3868.jpg",
    ctas=f'<a class="btn btn-gold" href="{BARBER}">Book a Cut</a><a class="btn btn-ghost" href="{QUEUE}">Join the queue</a>'
) + f'''
<section class="visit section-pad">
  <div class="wrap">
    <div class="visit-grid stagger">
      <div class="visit-card">
        <p class="eyebrow">Find us</p>
        <h3 class="h3">Biggera Waters</h3>
        <address>9 Gateway Drive<br>Biggera Waters QLD 4216</address>
        <p style="margin-top:12px">One minute from Harbour Town, beside the carpark. Easy parking out front.</p>
        <p style="margin-top:12px"><a class="tel" href="tel:+61755638960">(07) 5563 8960</a><br><a class="mail" href="mailto:blacksmithbarbers@gmail.com">blacksmithbarbers@gmail.com</a></p>
      </div>
      <div class="visit-card">
        <p class="eyebrow">Hours</p>
        <h3 class="h3">Open 7 days</h3>
        <div class="hours-row"><span>Mon &ndash; Fri</span><span>9:00 &ndash; 5:30</span></div>
        <div class="hours-row"><span>Sat &ndash; Sun</span><span>9:00 &ndash; 3:30</span></div>
      </div>
      <div class="visit-card">
        <p class="eyebrow">Book</p>
        <h3 class="h3">Skip the wait</h3>
        <p>Book your barber, check the wait or join the queue from your phone.</p>
        <div class="visit-cta">
          <a class="btn btn-gold btn-block" href="{BARBER}">Book a Cut</a>
          <a class="btn btn-ghost btn-block" href="{QUEUE}">Join the Queue</a>
          <a class="btn btn-ghost btn-block" href="{SALON}">Book Blackrose</a>
        </div>
      </div>
    </div>
    <div class="map-frame reveal">
      <iframe title="Map to Blacksmith Barbers, 9 Gateway Drive, Biggera Waters" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps?q=9+Gateway+Drive,+Biggera+Waters+QLD+4216&output=embed"></iframe>
    </div>
  </div>
</section>

<section class="cta-band section-pad">
  <div class="wrap reveal">
    <p class="eyebrow">See you in the chair</p>
    <h2 class="h2">Lock in your barber before you head down.</h2>
    <p>Download the app, book your barber and never take a number again.</p>
    <div class="hero-cta">
      <a class="btn btn-gold" href="{BARBER}">Book a Cut</a>
      {app_badge()}
    </div>
  </div>
</section>
'''

# =====================================================================
# WRITE
# =====================================================================
pages = {
    "shop.html":      ("shop.html","Shop — Barbershop-Grade Grooming Gear | Blacksmith Barbers","Barbershop-grade shampoos, styling gear, beard care and shave essentials. Shop the gear our barbers actually use — in-store and online.", shop_body),
    "academy.html":   ("academy.html","Academy — Learn the Trade on the Floor | Blacksmith Barbers","Train on a live barbershop floor, mentored by working Blacksmith barbers, with real certification on real clients. Enquire about the next intake.", academy_body),
    "blackrose.html": ("blackrose.html","Blackrose Salon — Precision, Colour & Transformation | Blacksmith","Blackrose is the ladies' salon beside Blacksmith Barbers — soft lighting, refined timber, precision cuts, colour and transformations with stylist Sammi.", blackrose_body),
    "barbers.html":   ("barbers.html","Our Barbers — Meet the Chairs | Blacksmith Barbers","Meet the barbers behind the chairs at Blacksmith Barbers, Biggera Waters. Find your barber and lock them in on the app.", barbers_body),
    "about.html":     ("about.html","About — More Than a Barbershop. We're Family. | Blacksmith Barbers","Established 2015. One of the longest-standing, most trusted family-owned barbershops on the northern Gold Coast — and an industry leader in education.", about_body),
    "visit.html":     ("visit.html","Visit — 9 Gateway Drive, Biggera Waters | Blacksmith Barbers","Visit Blacksmith Barbers at 9 Gateway Drive, Biggera Waters QLD 4216. Open 7 days, one minute from Harbour Town. Book a cut or join the queue.", visit_body),
}

for fname, (active, title, desc, body) in pages.items():
    out = page(active, title, desc, body)
    (ROOT / fname).write_text(out)
    print("wrote", fname, len(out), "bytes")
