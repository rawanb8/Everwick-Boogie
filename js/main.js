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
      isOpen ? closeMenu() : openMenu(); // another if else notation
      // > if isOpen is true then closeMenu; else openMenu
    });

    if (mobileClose) mobileClose.addEventListener('click', closeMenu); //close using X button
    if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMenu); //close by clicking outside the menu

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
  // update cart count from localStorage
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
});

/*================== NEWSLETTER in footer ==================*/
function initNewsletterForm() {
  let form = document.getElementById('newsletter-form');
  if (!form) return;

  let input = document.getElementById('newsletter-email');
  let submitBtn = document.getElementById('newsletter-submit');
  let msgRegion = document.getElementById('newsletter-msg-region'); // aria-live region for feedback messages

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
    d.className = `newsletter-msg newsletter-msg--${type}`; // use backticks for template literal
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
      submitBtn.textContent = prevText; // restore button text
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-disabled');
      input.value = '';
      input.focus(); // ready for next entry
    }, 800);
  });
}

/*================== CANDLES APP ==================*/
class CandlesWeb {

  constructor() {
    this.scents = []; // populate with your actual scents data or fetch from JSON
  }

   getScents() {
    return this.scents;
  }

  getScentById(id) {
    return this.getScents().find(s => s.id === id);
  }

  formatPrice(price) {
    return `$${Number(price).toFixed(2)}`;
  }

  // Quiz functionality
  calculateQuizResults(answers) {
    const scents = this.getScents();
    const scores = scents.map(scent => ({
      scent: scent,
      score: 0
    }));

    // Score each scent based on quiz answers
    answers.forEach((answer, questionIndex) => {
      scores.forEach(item => {
        const scent = item.scent;
        
        switch (questionIndex) {
          case 0: // Mood question
            if (scent.mood === answer) item.score += 3;
            break;
          case 1: // Scent family question
            if (scent.category === answer) item.score += 3;
            break;
          case 2: // Strength question
            const strengthDiff = Math.abs(scent.aggressiveness - parseInt(answer));
            item.score += Math.max(3 - strengthDiff, 0);
            break;
          case 3: // Season question
            if (scent.season === answer || scent.season === 'all-year') {
              item.score += scent.season === answer ? 2 : 1;
            }
            break;
        }
      });
    });

    // Sort by score and return top recommendations
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.scent);
  }
}


