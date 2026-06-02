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
