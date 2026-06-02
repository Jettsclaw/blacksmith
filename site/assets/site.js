/* Blacksmith Barbers — shared site behaviour (site-v5) */
(function(){
  var prm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Topbar scrolled state + sticky book bar */
  var topbar = document.getElementById('topbar');
  var bookBar = document.getElementById('bookBar');
  function onScroll(){
    var y = window.scrollY || window.pageYOffset;
    if(topbar) topbar.classList.toggle('scrolled', y > 24);
    if(bookBar) bookBar.classList.toggle('show', y > 480);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* Hamburger drawer */
  var ham = document.getElementById('hamburger');
  var drawer = document.getElementById('drawer');
  function setMenu(open){
    if(!ham || !drawer) return;
    ham.classList.toggle('open', open);
    drawer.classList.toggle('open', open);
    ham.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if(ham && drawer){
    ham.addEventListener('click', function(){ setMenu(!drawer.classList.contains('open')); });
    drawer.querySelectorAll('[data-close]').forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') setMenu(false); });
  }
  document.body.style.overflow = '';

  /* Reviews marquee — build cards from reviews.json, duplicate the row for a seamless -50% loop */
  var mq = document.querySelectorAll('.marquee-track[data-reviews]');
  if(mq.length){
    fetch('assets/reviews.json').then(function(r){ return r.json(); }).then(function(list){
      if(!Array.isArray(list) || !list.length) return;
      function esc(s){ var d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
      function cardHTML(rv){
        var n = Math.max(0, Math.min(5, rv.stars|0));
        var stars = '★'.repeat(n) + '☆'.repeat(5-n);
        return '<article class="review-card">'+
          '<div class="review-stars" aria-label="'+n+' out of 5 stars">'+stars+'</div>'+
          '<p class="review-quote">'+esc(rv.text)+'</p>'+
          '<p class="review-name">'+esc(rv.name)+'<span class="src">Google review</span></p>'+
          '</article>';
      }
      mq.forEach(function(track, i){
        var order = track.getAttribute('data-reviews') === 'reverse'
          ? list.slice().reverse() : list;
        var row = order.map(cardHTML).join('');
        track.innerHTML = row + row; /* two identical halves -> -50% loops seamlessly */
      });
    }).catch(function(){});
  }

  /* Scroll reveals */
  if(prm){
    document.querySelectorAll('.reveal,.stagger').forEach(function(el){ el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal,.stagger').forEach(function(el){ io.observe(el); });
})();
