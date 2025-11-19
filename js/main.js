const app = {
  data: {},
  scents: [],
  products: [],
  cart: [],
  colors: [],
  sizes: [],
  containers: [],
  wicks:[],

  // Utility: debounce for search
  debounce(fn, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  getSizes() {
    return this.sizes || [];
  },
  getColors() { return this.colors || []; },
  getContainers() { return this.containers || []; },
  getWicks() { return this.wicks || []; },
  getScents() { return this.scents; },
  getScentById(id) { return this.scents.find(s => s.id === id) || null; },
  getSizeById(id) { return this.sizes.find(s => s.id === id) || null; },
  getColorById(id) { return this.colors.find(c => c.id === id) || null; },
  getContainerById(id) { return this.containers.find(c => c.id === id) || null; },
  getWickById(id) { return this.wicks.find(w => w.id === id) || null; },
  formatPrice(price) { return `$${Number(price).toFixed(2)}`; },

  async loadData() {
    try {
      // fetch products/scents if not already loaded
      if (!this.scents.length) {
        const response = await fetch('../json/products.json');
        const data = await response.json();
        this.scents = data.scents.map(s => ({
          ...s,
          aggressiveness: s.aggressiveness || 2
        }));
        this.products = data.products || [];
        this.colors = data.color || [];
        this.sizes = data.size || [];
        this.containers = data.container || [];
        this.wicks = data.wick || [];
      }
    } catch (err) {
      console.error('Failed to load data in app.loadData():', err);
    }
  },

  calculateQuizResults(answers) {
    const scents = this.getScents();
    const scores = scents.map(scent => ({ scent, score: 0 }));

    answers.forEach((answer, questionIndex) => {
      scores.forEach(item => {
        const scent = item.scent;
        switch (questionIndex) {
          case 0: // Mood
            if (scent.mood === answer) item.score += 3;
            break;
          case 1: // Category / family
            if (scent.family === answer) item.score += 3;
            break;
          case 2: // Strength
            const strengthDiff = Math.abs(scent.aggressiveness - parseInt(answer));
            item.score += Math.max(3 - strengthDiff, 0);
            break;
          case 3: // Season
            if (scent.season === answer || scent.season === 'all-year') {
              item.score += scent.season === answer ? 2 : 1;
            }
            break;
        }
      });
    });

    // Return **only the top 3 scoring scents**, sorted by score
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)         // top 3
      .map(item => item.scent);
  },


  openModal(id) { document.getElementById(id).style.display = 'block'; },
  closeModal(id) { document.getElementById(id).style.display = 'none'; },
  showNotification(msg, type) { alert(msg); },


  getProducts() {
    return this.products || [];
  },

  getProductById(id) {
    return this.products.find(p => p.id === id) || null;
  },

  // Search products by name or scent name
  searchProducts(query) {
    const q = query.toLowerCase();
    return this.products.filter(product => {
      const scent = this.getScentById(product.scentId);
      return (
        product.name.toLowerCase().includes(q) ||
        (scent && scent.name.toLowerCase().includes(q))
      );
    });
  },

  // Add to cart (stored in localStorage)
  addToCart(productId, quantity = 1) {
    try {
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (!Array.isArray(cart)) cart = [];
      
      const product = this.getProductById(productId);
      if (!product) return false;
      
      for (let i = 0; i < quantity; i++) {
        cart.push({ productId: productId, addedAt: new Date().toISOString() });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      return true;
    } catch (err) {
      console.error('Failed to add to cart:', err);
      return false;
    }
  },

  // Get total price of cart
  getCartTotal() {
    try {
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (!Array.isArray(cart)) cart = [];
      
      let total = 0;
      cart.forEach(item => {
        const product = this.getProductById(item.productId);
        if (product) total += product.price;
      });
      return total;
    } catch (err) {
      console.error('Failed to calculate cart total:', err);
      return 0;
    }
  }

};

(function () {
  // Run when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    updateCartCount(); // keep cart count in sync across tabs
    initNewsletterForm(); //initialize footer newsletter
    window.addEventListener('storage', (e) => {
      if (e.key === 'cart') updateCartCount();
    });
  });

  /*================== NAVBAR ==================*/
  function initNavbar() {
    let siteNav = document.querySelector('.site-nav');
    let hamburger = document.getElementById('hamburger-btn');
    let mobileMenu = document.getElementById('mobile-menu');
    let mobileClose = document.getElementById('mobile-close');
    let mobileBackdrop = document.getElementById('mobile-backdrop');

    if (!siteNav || !hamburger || !mobileMenu) return;

    // ensure dataset initial state
    mobileMenu.dataset.open = mobileMenu.dataset.open || "false";

    function openMenu() {
      mobileMenu.dataset.open = "true";
      // prevent background scrolling
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      // focus first interactive item
      let first = mobileMenu.querySelector('a, button');
      if (first) first.focus();
    }

    function closeMenu() {
      mobileMenu.dataset.open = "false";
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      // return focus to hamburger if it exists
      if (hamburger.focus) hamburger.focus();
    }

    // toggle on click
    hamburger.addEventListener('click', (e) => {
      let isOpen = mobileMenu.dataset.open === "true";
      isOpen ? closeMenu() : openMenu();
    });

    if (mobileClose) mobileClose.addEventListener('click', closeMenu);
    if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMenu);

    // close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.dataset.open === "true") {
        closeMenu();
      }
    });

    // scroll behaviour: add class .scrolled when past threshold
    // when scrolling past 60px -> add a CSS class .scrolled that changes styling
    let threshold = 60;
    window.addEventListener('scroll', () => {
      if (window.scrollY > threshold) siteNav.classList.add('scrolled');
      else siteNav.classList.remove('scrolled');
    });
  }

  /*================== CART COUNT ==================*/
  function updateCartCount() {
    try {
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      let els = document.querySelectorAll('#cart-count, #mobile-cart-count');
      els.forEach(e => { e.textContent = Array.isArray(cart) ? cart.length : 0; });
      //update cart count for both full screen and mobile screen display
    } catch (err) {
      console.error('Failed to read cart from localStorage', err);
    }
  }

})();

document.addEventListener('DOMContentLoaded', async () => {
  const navbarContainer = document.getElementById('navbar');

  if (navbarContainer) {
    try {
      const response = await fetch('nav.html');
      const navbarHTML = await response.text();

      navbarContainer.innerHTML = navbarHTML;
    } catch (error) {
      console.error('Error loading navbar:', error);
    }
  }

  const footerContainer = document.getElementById('footer');

  if (footerContainer) {
    try {
      const response = await fetch('footer.html');
      const footerHTML = await response.text();
      footerContainer.innerHTML = footerHTML;

      // Optional: initialize footer JS (newsletter form)
      initNewsletterForm();

    } catch (error) {
      console.error('Error loading footer:', error);
    }
  }

  // ----------------- NEW: Load scents data for quiz -----------------
  await app.loadData();
});

/*================== NEWSLETTER in footer ==================*/
function initNewsletterForm() {
  let form = document.getElementById('newsletter-form');
  if (!form) return;

  let input = document.getElementById('newsletter-email');
  let submitBtn = document.getElementById('newsletter-submit');
  let msgRegion = document.getElementById('newsletter-msg-region');

  // Create aria-live region if not in DOM
  if (!msgRegion) {
    msgRegion = document.createElement('div');
    msgRegion.id = 'newsletter-msg-region';
    msgRegion.setAttribute('aria-live', 'polite');
    msgRegion.setAttribute('aria-atomic', 'true');
    msgRegion.style.marginTop = '0.5rem';
    form.parentNode.insertBefore(msgRegion, form.nextSibling);
  }

  // Helper to show success or error messages
  function showMessage(type, text) {
    msgRegion.innerHTML = '';
    let d = document.createElement('div');
    d.className = `newsletter-msg newsletter-msg--${type}`;
    d.textContent = text;
    msgRegion.appendChild(d);

    if (type === 'error') {
      setTimeout(() => {
        if (msgRegion.contains(d)) msgRegion.removeChild(d);
      }, 4000);
    }
  }

  // Email validation
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!input) return;

    let email = (input.value || '').trim();
    if (!email) {
      showMessage('error', 'Please enter your email address.');
      input.focus();
      return;
    }

    if (!isValidEmail(email)) {
      showMessage('error', 'Please enter a valid email address.');
      input.focus();
      return;
    }

    // Simulate sending
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-disabled', 'true');
    let prevText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';

    // Short simulated delay
    setTimeout(() => {
      showMessage('success', 'Thank you for subscribing to our newsletter!');
      submitBtn.textContent = prevText;
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-disabled'); // restore button text
      input.value = '';
      input.focus();
    }, 800);
  });
}

let modalLoaded = false;

// Load login modal from login.html
async function loadLoginModal() {
  const response = await fetch('/html/login.html');
  const modalHTML = await response.text();

  // Create a wrapper div
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = modalHTML;
  document.body.appendChild(modalContainer);

  modalLoaded = true;

  // Attach close functionality to close button & overlay
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal-overlay')) {
      closeLoginModal();
    }
  });

  // Attach form submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Handle login logic here
      console.log('Login submitted', {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
      });
      closeLoginModal();
    });
  }
}

// Show modal
function openLoginModal() {
  if (!modalLoaded) {
    console.warn('Modal not loaded yet!');
    return;
  }
  const modal = document.getElementById('login-modal');
  if (modal) modal.style.display = 'flex';
}

// Hide modal
function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.style.display = 'none';
}

// Load modal on page load
window.addEventListener('DOMContentLoaded', loadLoginModal);

// Optional: attach "Proceed to Payment" dynamically after modal loaded
window.addEventListener('DOMContentLoaded', async () => {
  await loadLoginModal();

  const proceedBtn = document.getElementById('proceed-to-payment');
  if (proceedBtn) proceedBtn.addEventListener('click', openLoginModal);
});
