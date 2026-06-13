/* ============================================================
   BLACKSMITH BARBERS — client-side cart (cart-v1)
   - localStorage persistence across page navigation
   - slide-in drawer with qty +/- and remove
   - header count badge
   - "Add to cart" buttons wired via [data-add-to-cart]
   No payment backend — checkout is an enquiry / coming-soon CTA.
   ============================================================ */
(function(){
  var KEY = 'bs_cart_v1';
  var ENQUIRY_EMAIL = 'blacksmithbarbers@gmail.com';

  /* ---------- store ---------- */
  function read(){
    try{ var raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; }
    catch(e){ return []; }
  }
  function write(items){
    try{ localStorage.setItem(KEY, JSON.stringify(items)); }catch(e){}
  }
  var cart = read();

  function money(n){ return '$' + (Math.round(n*100)/100).toFixed(2); }
  function count(){ return cart.reduce(function(s,i){ return s + i.qty; }, 0); }
  function subtotal(){ return cart.reduce(function(s,i){ return s + i.price*i.qty; }, 0); }

  function add(item){
    var found = cart.filter(function(i){ return i.id === item.id; })[0];
    if(found){ found.qty += 1; }
    else{ cart.push({id:item.id, name:item.name, price:item.price, qty:1}); }
    write(cart); render(); open();
  }
  function setQty(id, qty){
    cart = cart.map(function(i){ if(i.id===id){ i.qty = qty; } return i; })
               .filter(function(i){ return i.qty > 0; });
    write(cart); render();
  }
  function remove(id){
    cart = cart.filter(function(i){ return i.id !== id; });
    write(cart); render();
  }

  /* ---------- drawer DOM ---------- */
  var overlay, drawer, listEl, subEl, countEls, emptyEl, footEl;

  function buildDrawer(){
    overlay = document.createElement('div');
    overlay.className = 'cart-overlay';
    overlay.id = 'cartOverlay';

    drawer = document.createElement('aside');
    drawer.className = 'cart-drawer';
    drawer.id = 'cartDrawer';
    drawer.setAttribute('role','dialog');
    drawer.setAttribute('aria-modal','true');
    drawer.setAttribute('aria-label','Your cart');
    drawer.innerHTML =
      '<div class="cart-head">' +
        '<h2 class="cart-title">Your Cart</h2>' +
        '<button class="cart-close" id="cartClose" aria-label="Close cart">&times;</button>' +
      '</div>' +
      '<div class="cart-empty" id="cartEmpty">' +
        '<p>Your cart is empty.</p>' +
        '<a class="btn btn-gold btn-block" href="shop.html">Shop the gear</a>' +
      '</div>' +
      '<div class="cart-items" id="cartItems"></div>' +
      '<div class="cart-foot" id="cartFoot">' +
        '<div class="cart-subtotal"><span>Subtotal</span><span id="cartSubtotal">$0.00</span></div>' +
        '<p class="cart-note">Checkout is coming soon. Lock in your gear and grab it in the chair, or send us an enquiry.</p>' +
        '<button class="btn btn-gold btn-block" id="cartCheckout">Checkout &mdash; coming soon</button>' +
        '<a class="btn btn-ghost btn-block" id="cartEnquiry" href="#">Enquire about these items</a>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    listEl = drawer.querySelector('#cartItems');
    subEl = drawer.querySelector('#cartSubtotal');
    emptyEl = drawer.querySelector('#cartEmpty');
    footEl = drawer.querySelector('#cartFoot');

    overlay.addEventListener('click', close);
    drawer.querySelector('#cartClose').addEventListener('click', close);
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') close(); });

    var checkout = drawer.querySelector('#cartCheckout');
    checkout.addEventListener('click', function(){
      checkout.textContent = 'Coming soon — grab it in the chair';
      checkout.classList.add('is-soon');
      setTimeout(function(){
        checkout.innerHTML = 'Checkout &mdash; coming soon';
        checkout.classList.remove('is-soon');
      }, 2600);
    });

    drawer.querySelector('#cartEnquiry').addEventListener('click', function(e){
      e.preventDefault();
      var lines = cart.map(function(i){ return '- ' + i.name + ' x' + i.qty; }).join('%0D%0A');
      var body = 'Hi Blacksmith,%0D%0A%0D%0AI\'d like to enquire about these items:%0D%0A' +
                 (lines || '(no items)') + '%0D%0A%0D%0AThanks,';
      window.location.href = 'mailto:' + ENQUIRY_EMAIL +
        '?subject=Shop%20enquiry&body=' + body;
    });
  }

  /* ---------- header trigger ---------- */
  function buildTrigger(){
    countEls = [];
    document.querySelectorAll('[data-cart-toggle]').forEach(function(btn){
      btn.addEventListener('click', function(e){ e.preventDefault(); toggle(); });
      var badge = btn.querySelector('[data-cart-count]');
      if(badge) countEls.push(badge);
    });
  }

  function render(){
    var c = count();
    (countEls||[]).forEach(function(b){
      b.textContent = c;
      b.classList.toggle('has-items', c > 0);
    });
    if(!listEl) return;
    if(cart.length === 0){
      listEl.innerHTML = '';
      emptyEl.style.display = 'block';
      footEl.style.display = 'none';
      return;
    }
    emptyEl.style.display = 'none';
    footEl.style.display = 'block';
    listEl.innerHTML = cart.map(function(i){
      return '<div class="cart-row" data-id="'+i.id+'">' +
        '<div class="cart-row-info">' +
          '<p class="cart-row-name">'+i.name+'</p>' +
          '<p class="cart-row-price">'+money(i.price)+'</p>' +
        '</div>' +
        '<div class="cart-qty">' +
          '<button class="qbtn" data-dec aria-label="Decrease quantity">&minus;</button>' +
          '<span class="qval">'+i.qty+'</span>' +
          '<button class="qbtn" data-inc aria-label="Increase quantity">+</button>' +
        '</div>' +
        '<button class="cart-remove" data-remove aria-label="Remove item">Remove</button>' +
      '</div>';
    }).join('');
    subEl.textContent = money(subtotal());

    listEl.querySelectorAll('.cart-row').forEach(function(row){
      var id = row.getAttribute('data-id');
      var item = cart.filter(function(i){ return i.id===id; })[0];
      row.querySelector('[data-inc]').addEventListener('click', function(){ setQty(id, item.qty+1); });
      row.querySelector('[data-dec]').addEventListener('click', function(){ setQty(id, item.qty-1); });
      row.querySelector('[data-remove]').addEventListener('click', function(){ remove(id); });
    });
  }

  /* ---------- open/close ---------- */
  function open(){
    if(!drawer) return;
    drawer.classList.add('open');
    overlay.classList.add('open');
    var bb = document.getElementById('bookBar'); if(bb) bb.classList.add('cart-open'); // keep the sticky bar out of the cart's way (replaces a :has() rule that broke on iOS)
    document.body.style.overflow = 'hidden';
  }
  function close(){
    if(!drawer) return;
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    var bb = document.getElementById('bookBar'); if(bb) bb.classList.remove('cart-open');
    document.body.style.overflow = '';
  }
  function toggle(){ drawer.classList.contains('open') ? close() : open(); }

  /* ---------- add-to-cart wiring ---------- */
  function wireProducts(){
    document.querySelectorAll('[data-add-to-cart]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = btn.getAttribute('data-id');
        var name = btn.getAttribute('data-name');
        var price = parseFloat(btn.getAttribute('data-price')) || 0;
        if(!id){ return; }
        add({id:id, name:name, price:price});
        var orig = btn.textContent;
        btn.textContent = 'Added ✓';
        btn.classList.add('added');
        setTimeout(function(){ btn.textContent = orig; btn.classList.remove('added'); }, 1100);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    buildDrawer();
    buildTrigger();
    wireProducts();
    render();
  });

  /* ---------- public API ----------
     Lets pages that render products AFTER load (e.g. the PDP, built
     from products.json via fetch) drive the same cart. */
  window.BSCart = {
    add: add,
    open: open,
    close: close,
    count: count,
    wire: wireProducts
  };
})();
