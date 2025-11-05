(function () {
  // Run when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    updateCartCount();
    // keep cart count in sync across tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'cart') updateCartCount();
    });
  });

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
});

class CandlesWeb {


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


