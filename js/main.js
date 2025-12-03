// ---- fix paths when we're on index.html (root) ----
function isRootIndexPage() {
  let path = window.location.pathname;
  // works for /index.html, /Everwick-Boogee/index.html, or just "/"
  return path === "/" || path.endsWith("/") || path.includes("index.html");
}
let isalreadyrunned = false;
function fixIndexHtmlLinks(rootEl) {
  if (!rootEl || !isRootIndexPage()) return;
  
  // if(document.querySelectorAll(".brand-logo") && !isalreadyrunned){
  //   isalreadyrunned=true
  //   document.querySelector(".brand-logo").setAttribute('src',document.querySelector(".brand-logo").getAttribute('src').slice(1))
  // }

  
  let isalreadyrunned = false;

function fixBrandLogoSrc() {
  if (isalreadyrunned) return;
  let logo = document.querySelector('.brand-logo');
  if (!logo) return;

  let src = logo.getAttribute('src') || '';
  // If src points up a level ("../..."), convert to a safe relative path that works from the site root page.
  // Convert "../media/..."  => "./media/..."
  // Convert "/media/..."   => "./media/..."  (avoid creating absolute paths)
  // Leave already-relative "./..." or "media/..." alone.
  if (src.startsWith('../')) {
    src = src.replace(/^\.\.\//, './');
  } else if (src.startsWith('/')) {
    src = src.replace(/^\//, './');
  }
  // finally set it once
  logo.setAttribute('src', src);
  isalreadyrunned = true;
}



  rootEl.querySelectorAll("a[href]").forEach((a) => {
    let href = a.getAttribute("href");
    if (!href) return;
    if(href=="../"){
      return a.setAttribute("href", "./")
    }
    // ignore external / special URLs
    if (
      href.startsWith("#") ||
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("//") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return;
    }

    // only touch .html files
    if (!/\.html($|[?#])/.test(href)) return;

    // already has a folder prefix or absolute path → leave it
    if (
      href.startsWith("html/") ||
      href.startsWith("../") ||
      href.startsWith("/")
    ) {
      return;
    }
    if(href=='./' && isRootIndexPage()){return alert("homeee")}
    // don't break the home link
    if (a.textContent == "Home")  return;

    // final rewrite: "page.html" -> "html/page.html"
    a.setAttribute("href", "html/" + href);
  });
}

// Unified loader for nav + footer that works from root or /html/ pages
document.addEventListener("DOMContentLoaded", async function () {
  // helper to detect if current page is inside /html/ folder
  let isInsideHtmlFolder = window.location.pathname.includes("/html/");

  // --- NAVBAR ---
  let navbarContainer = document.getElementById("navbar");
  if (navbarContainer) {
    let navPath = isInsideHtmlFolder ? "nav.html" : "html/nav.html";
    try {
      let res = await fetch(navPath);
      if (!res.ok) throw new Error("nav fetch not ok: " + res.status);
      navbarContainer.innerHTML = await res.text();
      
      // if we're on index.html, rewrite relative *.html links in the injected nav
      fixIndexHtmlLinks(navbarContainer);

      // move login modal to body so it's global
      let injectedModal = document.querySelector(".login-modal-wrapper");
      if (injectedModal && injectedModal.parentElement !== document.body) {
        document.body.appendChild(injectedModal);
      }

      // ensure login trigger buttons open the modal
      let loginTriggers = document.querySelectorAll(".open-login");
      let loginModal = document.querySelector(".login-modal-wrapper");
      if (loginTriggers && loginTriggers.length && loginModal) {
        loginTriggers.forEach(btn => {
          // avoid attaching duplicate listeners
          if (!btn.dataset.loginAttached) {
            btn.addEventListener("click", function (e) {
              e.preventDefault();
              loginModal.style.display = "flex";
            });
            btn.dataset.loginAttached = "true";
          }
        });
      }

      // call optional init functions if present
      if (typeof window.initNavbar === "function") {
        try { window.initNavbar(); } catch (e) { console.error("initNavbar() failed:", e); }
      }
      if (typeof window.updateCartCount === "function") {
        try { window.updateCartCount(); } catch (e) { console.error("updateCartCount() failed:", e); }
      }
      if (typeof handleLoginUI === "function") {
        try { handleLoginUI(); } catch (e) { console.error("handleLoginUI() failed:", e); }
      }

      // attach logout handlers (guarded)
      document.querySelector("#logout-btn")?.addEventListener("click", logout);
      document.querySelector(".mobile-logout-btn")?.addEventListener("click", logout);

    } catch (err) {
      console.error("Failed to load nav:", err);
    }
  }

  // --- FOOTER ---
  let footerContainer = document.getElementById("footer");
  if (footerContainer) {
    let footerPath = isInsideHtmlFolder ? "footer.html" : "html/footer.html";
    try {
      let res2 = await fetch(footerPath);
      if (!res2.ok) throw new Error("footer fetch not ok: " + res2.status);
      footerContainer.innerHTML = await res2.text();

      // adjust paths only when footer is injected into index.html
      fixIndexHtmlLinks(footerContainer);
      // call newsletter init if available in your script
      if (typeof initNewsletterForm === "function") {
        try { initNewsletterForm(); } catch (e) { console.error("initNewsletterForm() failed:", e); }
      }
    } catch (err) {
      console.error("Failed to load footer:", err);
    }
  }

  // --- Generic login modal handlers (only if modal exists after injection) ---
  // Close button and escape/click-outside handlers
  let loginModalAfter = document.querySelector(".login-modal-wrapper");
  if (loginModalAfter) {
    let closeBtn = document.querySelector(".login-modal-close");
    if (closeBtn && !closeBtn.dataset.closeAttached) {
      closeBtn.addEventListener("click", function () {
        loginModalAfter.style.display = "none";
      });
      closeBtn.dataset.closeAttached = "true";
    }

    if (!window._loginWindowListener) {
      window.addEventListener("click", function (e) {
        if (e.target === loginModalAfter) loginModalAfter.style.display = "none";
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && loginModalAfter.style.display === "flex") {
          loginModalAfter.style.display = "none";
        }
      });
      window._loginWindowListener = true;
    }
  }
});

function handleLoginUI() {
  let loginBtn = document.querySelector("#login-btn");
  let mobileLoginBtn = document.querySelector(".mobile-login-btn");
  let logoutBtn = document.querySelector("#logout-btn");
  let mobileLogoutBtn = document.querySelector(".mobile-logout-btn");

  if (localStorage.getItem("currentUser")) {
    // User logged in → show logout
    loginBtn.style.display = 'none';
    mobileLoginBtn.style.display = 'none';

    logoutBtn.style.display = 'block';
    mobileLogoutBtn.style.display = 'block';
  } else {
    // User logged out → show login
    loginBtn.style.display = 'block';
    mobileLoginBtn.style.display = 'block';

    logoutBtn.style.display = 'none';
    mobileLogoutBtn.style.display = 'none';
  }
}

function logout() {
  // Save current user's wishlist before logging out
  if (window.currentUser) {
    let userWishlist = app.getWishlist();
    app.saveWishlistForUser(window.currentUser, userWishlist);
  }

  // Remove currentUser
  window.currentUser = null;
  localStorage.removeItem('currentUser');

  // Update UI
  handleLoginUI();

  // Trigger event so wishlist re-renders for anonymous
  document.dispatchEvent(new Event('userChanged'));
}



let currentUser = null;
let app = {
  data: {},
  scents: [],
  products: [],
  cart: [],
  colors: [],
  sizes: [],
  containers: [],
  wicks: [],
  wishlist: [],

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
    let response;
    try {
      if (!this.scents.length || !this.products.length) {
        // adjust path if necessary
        if (isRootIndexPage()) {response = await fetch('./json/products.json'); }
        else {response = await fetch('../json/products.json');}
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

  addToCart: function (productId, quantity = 1) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let product = this.getProductById(productId);
    if (!product) return false;

    cart.push({
      id: Date.now() + '-' + productId, 
      productId: productId,
      quantity: quantity,
      price: product.price
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    return true;
  },

  removeFromCart: function (itemId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => String(item.id) !== String(itemId));
    localStorage.setItem('cart', JSON.stringify(cart));
    return cart;
  },

  clearCart: function () {
    localStorage.setItem('cart', JSON.stringify([]));
    return [];
  },

  getCart: function () {
    try {
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (!Array.isArray(cart)) cart = [];
      return cart;
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  // getCartTotal: function () {
  //   try {
  //     let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  //     if (!Array.isArray(cart)) cart = [];
  //     let total = 0;
  //     cart.forEach(function (item) {
  //       let product = app.getProductById(item.productId);
  //       if (product) total += (Number(product.price || 0) * (item.quantity || 1));
  //     });
  //     return total;
  //   } catch (err) {
  //     console.error('Failed to calculate cart total:', err);
  //     return 0;
  //   }
  // },
// rawan's edited getCartTotal to for customized candles
getCartTotal: function () {
  try {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!Array.isArray(cart)) cart = [];

    let total = 0;
    cart.forEach(function (item) {
      let qty = Number(item.quantity || 1) || 1;

      // If the item has an explicit price (custom item or saved item), use it.
      // Otherwise, try to look up the product and use its price.
      let itemPrice = 0;

      if (typeof item.price !== 'undefined' && item.price !== null && !isNaN(Number(item.price))) {
        itemPrice = Number(item.price);
      } else if (item.productId) {
        let product = app.getProductById(item.productId);
        if (product && !isNaN(Number(product.price))) {
          itemPrice = Number(product.price);
        }
      }

      total += itemPrice * qty;
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
  // Wishlist Logic
  // Per-user wishlist wrappers (use currentUser global or anonymous)
  // NOTE: currentUser may be null when anonymous.
  addToWishlist: function (productId) {
    // delegate to user-aware function
    this.addToWishlistForUser(productId, window.currentUser || null);
    return true;
  },

  removeFromWishlist: function (productId) {
    let user = window.currentUser || localStorage.getItem('currentUser') || null;
    this.removeFromWishlistForUser(productId, user);
    return true;
  },

  getWishlist: function () {
    return this.getWishlistForUser(window.currentUser || null);
  },

  isInWishlist: function (productId) {
    let wishlist = this.getWishlist();
    return (Array.isArray(wishlist) ? wishlist.map(String).includes(String(productId)) : false);
  },

  // Migration helper - converts legacy 'wishlists' or 'wishlist' keys into the
  // new per-user storage under "wishlist_anonymous" so old data is preserved.
  migrateOldWishlist: function () {
    try {
      // Old possible keys
      let legacyKeys = ['wishlists', 'wishlist'];
      legacyKeys.forEach(key => {
        let raw = localStorage.getItem(key);
        if (!raw) return;
        try {
          let arr = JSON.parse(raw);
          if (!Array.isArray(arr)) return;
          // Read current anonymous wishlist (if any)
          let anon = this.getWishlistForUser(null) || [];
          // Merge avoiding duplicates
          let merged = Array.from(new Set([...anon.map(String), ...arr.map(String)])).map(String);
          this.saveWishlistForUser(null, merged);
          // Remove old key so migration is idempotent
          localStorage.removeItem(key);
          console.info(`Migrated legacy wishlist key "${key}" into anonymous wishlist.`);
        } catch (e) {
          // ignore parse errors
        }
      });
    } catch (e) {
      console.error('Wishlist migration failed:', e);
    }
  },



};

app.saveWishlistForUser = function (username = null, wishlist = []) {
  let key = username ? 'wishlist_' + username : 'wishlist_anonymous';
  let obj = { username: username || 'anonymous', wishlist: wishlist };
  localStorage.setItem(key, JSON.stringify(obj));
};



app.getWishlistForUser = function (username = null) {
  let key = username ? 'wishlist_' + username : 'wishlist_anonymous';
  let obj = JSON.parse(localStorage.getItem(key) || '{}');
  return obj.wishlist || [];
};


// add to wishlist for a user
app.addToWishlistForUser = function (productId, username = null) {
  let wishlist = this.getWishlistForUser(username);
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    this.saveWishlistForUser(username, wishlist);
  }
};

// remove from wishlist for a user
app.removeFromWishlistForUser = function (productId, username = null) {
  let wishlist = this.getWishlistForUser(username);
  wishlist = wishlist.filter(id => String(id) !== String(productId));
  this.saveWishlistForUser(username, wishlist);
};

// check if a product is in a user's wishlist
app.isInWishlistForUser = function (productId, username = null) {
  let wishlist = this.getWishlistForUser(username);
  return wishlist.map(String).includes(String(productId));
};


(function () {
  document.addEventListener('DOMContentLoaded', function () {
    try {
      initNavbar();
      updateLoginUI();
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

    // Guard: required elements
    if (!siteNav || !hamburger || !mobileMenu) return;

    // Prevent double-init
    if (siteNav.dataset.inited === "true") return;
    siteNav.dataset.inited = "true";

    // Ensure initial dataset state and ARIA
    mobileMenu.dataset.open = mobileMenu.dataset.open || "false";
    hamburger.setAttribute('aria-controls', mobileMenu.id || 'mobile-menu');
    hamburger.setAttribute('aria-expanded', mobileMenu.dataset.open === "true" ? "true" : "false");
    mobileMenu.setAttribute('aria-hidden', mobileMenu.dataset.open === "true" ? "false" : "true");

    function setMenuOpen(open) {
      open = !!open;
      mobileMenu.dataset.open = open ? "true" : "false";
      mobileMenu.setAttribute('aria-hidden', open ? "false" : "true");
      hamburger.setAttribute('aria-expanded', open ? "true" : "false");

      if (open) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        siteNav.classList.add('menu-open');

        // focus first focusable element inside menu (accessibility)
        let focusable = mobileMenu.querySelector('a, button, input, [tabindex]:not([tabindex="-1"])');
        if (focusable && typeof focusable.focus === 'function') focusable.focus();
      } else {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        siteNav.classList.remove('menu-open');
        try { hamburger.focus(); } catch (e) { }
      }
    }

    function toggleMenu() {
      setMenuOpen(mobileMenu.dataset.open !== "true");
    }

    // Click handlers
    hamburger.addEventListener('click', function (e) {
      e.preventDefault();
      toggleMenu();
    });

    if (mobileClose) {
      mobileClose.addEventListener('click', function (e) { e.preventDefault(); setMenuOpen(false); });
    }

    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', function () { setMenuOpen(false); });
    }

    // close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.dataset.open === "true") {
        setMenuOpen(false);
      }
    });

    // close when clicking a link inside the mobile menu (common UX)
    mobileMenu.addEventListener('click', function (e) {
      let el = e.target;
      if (el && (el.tagName === 'A' || (el.closest && el.closest('a')))) {
        setMenuOpen(false);
      }
    });

    // Add/remove "scrolled" class on scroll
    let threshold = 60;
    window.addEventListener('scroll', function () {
      if (window.scrollY > threshold) siteNav.classList.add('scrolled');
      else siteNav.classList.remove('scrolled');
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

  // expose to global so other scripts can call them after nav injection
  window.initNavbar = initNavbar;
  window.updateCartCount = updateCartCount;

})();

/* load navbar/footer + app data */
/* load app data + migrate wishlist */
document.addEventListener('DOMContentLoaded', async function () {
  await app.loadData();
  if (typeof app.migrateOldWishlist === 'function') {
    app.migrateOldWishlist();
  }
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
async function attachLoginHandler() {
  // Wait until navbar is loaded and modal moved
  let loginModal = document.querySelector('.login-modal-wrapper');
  let loginForm = document.getElementById('loginForm');
  let closeBtn = document.querySelector('.login-modal-close');

  if (!loginModal || !loginForm) return;

  let allowedUsers = [
    { username: 'rama', password: '12345' },
    { username: 'maryam', password: '6789' },
    { username: 'rawan', password: '1011' }
  ];

  // Ensure all buttons have the correct trigger class
  let loginTriggers = document.querySelectorAll('.open-login');
  if (!loginTriggers.length) {
    let btn = document.getElementById('login-btn');
    if (btn) btn.classList.add('open-login');
    loginTriggers = document.querySelectorAll('.open-login');
  }

  // Open modal on click
  loginTriggers.forEach(btn => {
    if (!btn.dataset.listenerAttached) {
      btn.addEventListener('click', e => {
        e.preventDefault();
        loginModal.style.display = 'flex';
      });
      btn.dataset.listenerAttached = "true";
    }
  });

  if (closeBtn && !closeBtn.dataset.listenerAttached) {
    closeBtn.addEventListener('click', () => loginModal.style.display = 'none');
    closeBtn.dataset.listenerAttached = "true";
  }
  if (!window._loginWindowListener) {
    window.addEventListener('click', e => {
      if (e.target === loginModal) loginModal.style.display = 'none';
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && loginModal.style.display === 'flex') loginModal.style.display = 'none';
    });
    window._loginWindowListener = true;
  }

  // Handle login submit — attach only once
  if (!loginForm.dataset.listenerAttached) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      let username = loginForm.querySelector('#username')?.value.trim() || '';
      let password = loginForm.querySelector('#password')?.value.trim() || '';

      // Only allow exact matches
      let user = allowedUsers.find(u => u.username === username && u.password === password);

      if (!user) {
        alert('Incorrect username or password.');
        return;
      }

      // Login success
      currentUser = user.username;
      localStorage.setItem('currentUser', currentUser);
      alert('Login successful! Welcome, ' + currentUser);
      handleLoginUI()
      // Merge anonymous wishlist
      let anonWishlist = app.getWishlistForUser(null);
      let userWishlist = app.getWishlistForUser(currentUser);
      let mergedWishlist = Array.from(new Set([...anonWishlist.map(String), ...userWishlist.map(String)]));
      app.saveWishlistForUser(currentUser, mergedWishlist);
      app.saveWishlistForUser(null, []); // clear anonymous

      if (typeof renderWishlist === 'function') renderWishlist();
      if (typeof displayProducts === 'function') displayProducts();

      loginModal.style.display = 'none';
      loginForm.reset();
      document.dispatchEvent(new Event('userChanged'));
    });
    loginForm.dataset.listenerAttached = "true";
  }
}
function updateLoginUI() {
  let loginBtn = document.querySelector('#loginForm button[type="submit"]');
  if (!loginBtn) return;

  if (currentUser || localStorage.getItem('currentUser')) {
    loginBtn.style.display = 'none'; // hide login button once logged in
  } else {
    loginBtn.style.display = 'inline-block'; // show if not logged in
  }
}


/* call after navbar and modal are fully loaded */
document.addEventListener('DOMContentLoaded', async function () {
  // wait for nav injection
  let checkNavLoaded = setInterval(() => {
    let loginModal = document.querySelector('.login-modal-wrapper');
    let loginForm = document.getElementById('loginForm');
    if (loginModal && loginForm) {
      clearInterval(checkNavLoaded);
      attachLoginHandler();
    }
  }, 100); // check every 100ms
});



