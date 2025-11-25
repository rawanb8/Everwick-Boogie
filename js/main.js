/* main.js — cleaned, using `let` only */
/* Drop this in place of your current main.js */

let app = {
  data: {},
  scents: [],
  products: [],
  cart: [],
  colors: [],
  sizes: [],
  containers: [],
  wicks: [],

  // getters
  getSizes: function () { return this.sizes || []; },
  getColors: function () { return this.colors || []; },
  getContainers: function () { return this.containers || []; },
  getWicks: function () { return this.wicks || []; },
  getScents: function () { return this.scents || []; },

  getScentById: function (id) { return this.scents.find(function (s) { return s.id === Number(id); }) || null; },
  getSizeById: function (id) { return this.sizes.find(function (s) { return s.id === Number(id); }) || null; },
  getColorById: function (id) { return this.colors.find(function (c) { return c.id === Number(id); }) || null; },
  getContainerById: function (id) { return this.containers.find(function (c) { return c.id === Number(id); }) || null; },
  getWickById: function (id) { return this.wicks.find(function (w) { return w.id === Number(id); }) || null; },

  formatPrice: function (price) { return "$" + Number(price).toFixed(2); },

  debounce: function (fn, delay) {
    let timeout;
    return function () {
      let args = Array.prototype.slice.call(arguments);
      clearTimeout(timeout);
      timeout = setTimeout(function () { fn.apply(this, args); }.bind(this), delay);
    };
  },

  async loadData() {
    try {
      if (!this.scents.length || !this.products.length) {
        // adjust path if necessary (see checklist below)
        let response = await fetch('../json/products.json');
        if (!response.ok) throw new Error("Fetch failed: " + response.status);
        let data = await response.json();

        this.scents = Array.isArray(data.scents) ? data.scents.map(function (s) {
          return Object.assign({}, s, { aggressiveness: s.aggressiveness || 2 });
        }) : [];

        this.products = Array.isArray(data.products) ? data.products : [];
        this.colors = Array.isArray(data.color) ? data.color : [];
        this.sizes = Array.isArray(data.size) ? data.size : [];
        this.containers = Array.isArray(data.container) ? data.container : [];
        this.wicks = Array.isArray(data.wick) ? data.wick : [];
      }
      return true;
    } catch (err) {
      console.error('Failed to load data in app.loadData():', err);
      return false;
    }
  },

  calculateQuizResults: function (answers) {
    let scents = this.getScents();
    let scores = scents.map(function (scent) { return { scent: scent, score: 0 }; });

    answers.forEach(function (answer, questionIndex) {
      scores.forEach(function (item) {
        let scent = item.scent;
        switch (questionIndex) {
          case 0:
            if (scent.mood === answer) item.score += 3;
            break;
          case 1:
            if (scent.family === answer) item.score += 3;
            break;
          case 2:
            let strengthDiff = Math.abs((scent.aggressiveness || 0) - parseInt(answer, 10));
            item.score += Math.max(3 - strengthDiff, 0);
            break;
          case 3:
            if (scent.season === answer || scent.season === 'all-year') {
              item.score += (scent.season === answer) ? 2 : 1;
            }
            break;
        }
      });
    });

    return scores.sort(function (a, b) { return b.score - a.score; })
      .slice(0, 3)
      .map(function (it) { return it.scent; });
  },

  openModal: function (id) { let el = document.getElementById(id); if (el) el.style.display = 'block'; },
  closeModal: function (id) { let el = document.getElementById(id); if (el) el.style.display = 'none'; },
  showNotification: function (msg, type) { alert(msg); },

  getProducts: function () { return this.products || []; },
  getProductById: function (id) { return this.products.find(function (p) { return p.id === id; }) || null; },

  searchProducts: function (query) {
    let q = (query || '').toLowerCase();
    return this.products.filter(function (product) {
      let scent = app.getScentById(product.scentId);
      return (product.name && product.name.toLowerCase().includes(q)) || (scent && scent.name && scent.name.toLowerCase().includes(q));
    });
  },

 addToCart: function(productId, quantity = 1) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let product = this.getProductById(productId);
  if (!product) return false;

  cart.push({
    id: Date.now() + '-' + productId, // ✅ unique id
    productId: productId,
    quantity: quantity,
    price: product.price
  });

  localStorage.setItem('cart', JSON.stringify(cart));
  return true;
},

 removeFromCart: function(itemId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
     cart = cart.filter(item => String(item.id) !== String(itemId));
  localStorage.setItem('cart', JSON.stringify(cart));
    return cart; // optional, if you want
  },


  getCart: function() {
  try {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!Array.isArray(cart)) cart = [];
    return cart;
  } catch (err) {
    console.error(err);
    return [];
  }
},

  getCartTotal: function () {
    try {
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (!Array.isArray(cart)) cart = [];
      let total = 0;
      cart.forEach(function (item) {
        let product = app.getProductById(item.productId);
       if (product) total += (Number(product.price || 0) * (item.quantity || 1));
      });
      return total;
    } catch (err) {
      console.error('Failed to calculate cart total:', err);
      return 0;
    }
  },

  

  // small storage helpers
  getFromStorage: function (key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (e) { console.error(e); return null; }
  },
  saveToStorage: function (key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.error(e); }
  },
  

};

/* DOM bootstrap and helpers */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    try {
      initNavbar();
      updateCartCount();
      initNewsletterForm();
      window.addEventListener('storage', function (e) { if (e.key === 'cart') updateCartCount(); });
    } catch (err) { console.error('Boot error:', err); }
  });

  function initNavbar() {
    let siteNav = document.querySelector('.site-nav');
    let hamburger = document.getElementById('hamburger-btn');
    let mobileMenu = document.getElementById('mobile-menu');
    let mobileClose = document.getElementById('mobile-close');
    let mobileBackdrop = document.getElementById('mobile-backdrop');

    if (!siteNav || !hamburger || !mobileMenu) {
      // missing pieces — bail safely
      return;
    }

    mobileMenu.dataset.open = mobileMenu.dataset.open || "false";

    function openMenu() {
      mobileMenu.dataset.open = "true";
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      let first = mobileMenu.querySelector('a, button');
      if (first) { try { first.focus(); } catch (e) { } }
    }

    function closeMenu() {
      mobileMenu.dataset.open = "false";
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      try { hamburger.focus(); } catch (e) { }
    }

    hamburger.addEventListener('click', function () {
      let isOpen = mobileMenu.dataset.open === "true";
      if (isOpen) closeMenu(); else openMenu();
    });

      if (mobileClose) mobileClose.addEventListener('click', closeMenu);
      if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMenu);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.dataset.open === "true") closeMenu();
    });

    let threshold = 60;
    window.addEventListener('scroll', function () {
      if (window.scrollY > threshold) siteNav.classList.add('scrolled'); else siteNav.classList.remove('scrolled');
    });
  }

  function updateCartCount() {
    try {
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setTimeout(function () {
        let els = document.querySelectorAll('#cart-count, #mobile-cart-count');
        Array.prototype.forEach.call(els, function (e) {
          let count = Array.isArray(cart) ? cart.length : 0;
          e.textContent = count;
        });
      }, 300);
    } catch (err) { console.error('Failed to update cart count', err); }
  }
})();

/* load navbar/footer + app data */
document.addEventListener('DOMContentLoaded', async function () {
  let navbarContainer = document.getElementById('navbar');
  if (navbarContainer) {
    try {
      let response = await fetch('nav.html');
      if (response.ok) navbarContainer.innerHTML = await response.text();
      else console.warn('nav.html fetch not ok', response.status);
    } catch (err) { console.error('Error loading navbar:', err); }
  }

  // login modal handlers (guarded)
  let loginModal = document.querySelector('.login-modal-wrapper');
  let closeBtn = document.querySelector('.login-modal-close');
  let loginTriggers = document.querySelectorAll('.open-login');
  if (loginTriggers && loginTriggers.length && loginModal) {
    Array.prototype.forEach.call(loginTriggers, function (btn) {
      btn.addEventListener('click', function () { loginModal.style.display = 'flex'; });
    });
  }
  if (closeBtn && loginModal) {
    closeBtn.addEventListener('click', function () { loginModal.style.display = 'none'; });
  }
  window.addEventListener('click', function (e) { if (loginModal && e.target === loginModal) loginModal.style.display = 'none'; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && loginModal && loginModal.style.display === 'flex') loginModal.style.display = 'none'; });

  let footerContainer = document.getElementById('footer');
  if (footerContainer) {
    try {
      let response = await fetch('footer.html');
      if (response.ok) {
        footerContainer.innerHTML = await response.text();
        initNewsletterForm();
      } else console.warn('footer.html fetch not ok', response.status);
    } catch (err) { console.error('Error loading footer:', err); }
  }

  // finally, load data for customize page and others
  await app.loadData();
});

/* newsletter init */
function initNewsletterForm() {
  let form = document.getElementById('newsletter-form');
  if (!form) return;
  let input = document.getElementById('newsletter-email');
  let submitBtn = document.getElementById('newsletter-submit');
  let msgRegion = document.getElementById('newsletter-msg-region');
  if (!msgRegion) {
    msgRegion = document.createElement('div');
    msgRegion.id = 'newsletter-msg-region';
    msgRegion.setAttribute('aria-live', 'polite');
    msgRegion.setAttribute('aria-atomic', 'true');
    msgRegion.style.marginTop = '.5rem';
    form.parentNode.insertBefore(msgRegion, form.nextSibling);
  }
  function showMessage(type, text) {
    msgRegion.innerHTML = '';
    let d = document.createElement('div');
    d.className = 'newsletter-msg newsletter-msg--' + type;
    d.textContent = text;
    msgRegion.appendChild(d);
    if (type === 'error') setTimeout(function () { if (msgRegion.contains(d)) msgRegion.removeChild(d); }, 4000);
  }
  function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!input) return;
    let email = (input.value || '').trim();
    if (!email) { showMessage('error', 'Please enter your email address.'); input.focus(); return; }
    if (!isValidEmail(email)) { showMessage('error', 'Please enter a valid email address.'); input.focus(); return; }
    if (submitBtn) {
      submitBtn.disabled = true;
      let prevText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      setTimeout(function () {
        showMessage('success', 'Thank you for subscribing to our newsletter!');
        submitBtn.textContent = prevText;
        submitBtn.disabled = false;
        input.value = '';
        input.focus();
      }, 800);
    }
  });
}

/* login form handler (if present) */
(function attachLoginHandlerIfPresent() {
  let loginForm = document.getElementById('loginForm');
  if (!loginForm) return;
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    let username = (document.getElementById('username') && document.getElementById('username').value) ? document.getElementById('username').value.trim() : '';
    let password = (document.getElementById('password') && document.getElementById('password').value) ? document.getElementById('password').value.trim() : '';
    let loginModal = document.querySelector('.login-modal-wrapper');
    let allowedUsers = [
      { username: 'rama', password: '12345' },
      { username: 'maryam', password: '6789' },
      { username: 'rawan', password: '1011' }
    ];
    let user = allowedUsers.find(function (u) { return u.username === username && u.password === password; });
    if (user) {
      alert('Login successful! Welcome, ' + user.username);
      if (loginModal) loginModal.style.display = 'none';
      try { loginForm.reset(); } catch (e) { }
    } else {
      alert('Incorrect username or password.');
    }
  });
})();
