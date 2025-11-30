(async () => {
  // wait for DOM ready
  if (document.readyState === 'loading') {
    await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
  }

  // ensure global app exists (main.js should create it); if missing, create minimal shell
  window.app = window.app || {};
  const app = window.app;

  // safe loader: call existing app.loadData if present; otherwise fetch JSON ourselves
  async function ensureDataLoaded() {
    // if app already has products array with items, skip
    if (Array.isArray(app.products) && app.products.length) return;

    // if main offered loadData, use it (it should populate app.products)
    if (typeof app.loadData === 'function') {
      try {
        await app.loadData();
      } catch (err) {
        console.warn('app.loadData() threw — falling back to fetch:', err);
      }
      if (Array.isArray(app.products) && app.products.length) return;
    }

    // fallback fetch (absolute path)
    try {
      const res = await fetch('/json/products.json');
      if (!res.ok) throw new Error(`Failed to fetch products.json (${res.status})`);
      const data = await res.json();
      app.data = data || {};
      app.products = Array.isArray(data.products) ? data.products : [];
      app.scents = Array.isArray(data.scents) ? data.scents : [];
    } catch (err) {
      console.error('Could not load /json/products.json:', err);
      app.products = app.products || [];
      app.scents = app.scents || [];
    }
  }

  await ensureDataLoaded();

  // DOM containers
  const featuredGrid = document.getElementById('featured-grid');
  const categoryList = document.getElementById('category-list');

  if (!featuredGrid) {
    console.warn('No #featured-grid found — skipping featured render.');
    return;
  }
  if (!categoryList) {
    console.warn('No #category-list found — skipping categories render.');
    // we still render featured products
  }

  const products = Array.isArray(app.products) ? app.products : [];

  /* ========== FEATURED PRODUCTS (pagination) ========== */
  (function initFeatured() {
    const container = document.getElementById('featured-grid');
    if (!container) {
      console.warn('initFeatured: #featured-grid not found');
      return;
    }

    // Use outer-scoped 'products' (already defined above from app.products)
    const featuredItems = products.filter(p => p && p.featured === true);

    // Nothing to show
    if (!featuredItems.length) {
      container.innerHTML = '<p class="text-center">No featured products.</p>';
      return;
    }

    // Clear and build track
    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    const track = document.createElement('div');
    track.className = 'featured-track';
    track.style.display = 'flex';
    track.style.gap = '1rem';
    track.style.alignItems = 'stretch';
    track.style.flexWrap = 'nowrap';
    track.style.transition = 'transform 420ms cubic-bezier(.2,.9,.3,1)';
    track.style.willChange = 'transform';
    track.style.padding = '0.25rem 0';

    // Helper to make card via user's buildProductCard if available
    function makeCard(p) {
      if (typeof buildProductCard === 'function') {
        return buildProductCard(p);
      }
      // fallback minimal card
      const a = document.createElement('article');
      a.className = 'product-card';
      a.innerHTML = `
      <div class="product-image"><img src="${(Array.isArray(p.images) && p.images[0]) || ''}" alt="${p.name || ''}"></div>
      <h3 class="product-title">${p.name || 'Untitled'}</h3>
      <p class="product-price">${typeof window.app?.formatPrice === 'function' ? window.app.formatPrice(p.price) : ('$' + (Number(p.price || 0).toFixed(2)))}</p>
    `;
      return a;
    }

    // Append cards
    featuredItems.forEach(p => {
      const card = makeCard(p);
      card.style.flexShrink = '0';
      card.style.margin = '0';
      track.appendChild(card);
    });

    container.appendChild(track);

    // Controls
    const controls = document.createElement('div');
    controls.className = 'featured-controls';
    controls.style.display = 'flex';
    controls.style.gap = '.6rem';
    controls.style.justifyContent = 'center';
    controls.style.alignItems = 'center';
    controls.style.marginTop = '1rem';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'featured-arrow';
    prevBtn.setAttribute('aria-label', 'Previous featured');
    prevBtn.innerHTML = '<i class="fa-solid fa-caret-left" aria-hidden="true"></i>';

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'featured-arrow';
    nextBtn.setAttribute('aria-label', 'Next featured');
    nextBtn.innerHTML = '<i class="fa-solid fa-caret-right" aria-hidden="true"></i>';

    const pageIndicator = document.createElement('div');
    pageIndicator.className = 'featured-page-indicator';
    pageIndicator.style.padding = '0.35rem 0.6rem';
    pageIndicator.style.color = 'var(--text-light)';
    pageIndicator.style.fontSize = '0.95rem';

    controls.appendChild(prevBtn);
    controls.appendChild(pageIndicator);
    controls.appendChild(nextBtn);

    // Insert controls after container
    container.parentNode && container.parentNode.insertBefore(controls, container.nextSibling);

    // Carousel state
    let index = 0; // index of left-most visible card
    const cards = Array.from(track.querySelectorAll('.product-card'));

    // Measure function
    function getMetrics() {
      const firstCard = track.querySelector('.product-card');
      if (!firstCard) return { cardW: 0, gap: 0, visibleCount: 1, containerW: container.clientWidth };
      const cardRect = firstCard.getBoundingClientRect();
      const cs = getComputedStyle(track);
      const gap = parseFloat(cs.gap) || 0;
      const cardW = Math.round(cardRect.width);
      const containerW = container.clientWidth;
      const visibleCount = Math.max(1, Math.floor((containerW + gap) / (cardW + gap)));
      return { cardW, gap, visibleCount, containerW };
    }

    // Update buttons / transform
    function update() {
      const { cardW, gap, visibleCount } = getMetrics();
      const total = cards.length;
      const maxIndex = Math.max(0, total - visibleCount);

      if (index > maxIndex) index = maxIndex;
      if (index < 0) index = 0;

      if (total <= visibleCount) {
        track.style.transform = 'translateX(0px)';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        pageIndicator.textContent = `${total} item${total === 1 ? '' : 's'}`;
        return;
      }

      prevBtn.disabled = false;
      nextBtn.disabled = false;

      const translateX = -Math.round(index * (cardW + gap));
      track.style.transform = `translateX(${translateX}px)`;

      pageIndicator.textContent = `Showing ${index + 1}–${Math.min(index + visibleCount, total)} of ${total}`;
    }

    // Next / Prev handlers (wrap-around)
    function next() {
      const { visibleCount } = getMetrics();
      const total = cards.length;
      const maxIndex = Math.max(0, total - visibleCount);

      if (total <= visibleCount) {
        index = 0;
      } else {
        index = index + 1;
        if (index > maxIndex) index = 0; // wrap
      }
      update();
    }

    function prev() {
      const { visibleCount } = getMetrics();
      const total = cards.length;
      const maxIndex = Math.max(0, total - visibleCount);

      if (total <= visibleCount) {
        index = 0;
      } else {
        index = index - 1;
        if (index < 0) index = maxIndex; // wrap to end
      }
      update();
    }

    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    // Keyboard support
    controls.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });

    // Resize handling (debounced)
    let resizeTimer = null;
    function onResize() {
      const { visibleCount } = getMetrics();
      const total = cards.length;
      const maxIndex = Math.max(0, total - visibleCount);
      if (index > maxIndex) index = maxIndex;
      update();
    }

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(onResize, 120);
    });

    // Ensure images load before initial measure
    const imgs = track.querySelectorAll('img');
    let imgsToLoad = imgs.length;
    if (!imgsToLoad) {
      cards.forEach(c => c.classList.add('visible'));
      update();
    } else {
      imgs.forEach(img => {
        if (img.complete) {
          imgsToLoad--;
          if (imgsToLoad === 0) {
            cards.forEach(c => c.classList.add('visible'));
            update();
          }
        } else {
          img.addEventListener('load', () => {
            imgsToLoad--;
            if (imgsToLoad === 0) {
              cards.forEach(c => c.classList.add('visible'));
              update();
            }
          });
        }
        img.style.maxWidth = '100%';
        img.style.display = 'block';
      });
    }

    // expose a small API on the container for debug if needed
    container.__carousel = { next, prev, update, track, cards };
  })();

  // Select all review cards
  const reviewCards = document.querySelectorAll('.review-card');

  const observerOptions = {
    threshold: 0.1 // triggers when 10% of card is visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target); // only animate once
      }
    });
  }, observerOptions);

  reviewCards.forEach(card => observer.observe(card));


  /* ========== CATEGORY CARDS ========== */
  (function initCategories() {
    if (!categoryList) return;

    const collections = new Set();
    products.forEach(p => {
      if (Array.isArray(p.collections)) p.collections.forEach(c => collections.add(c));
    });

    const collectionsArr = Array.from(collections).sort();

    // optional priority order
    const preferred = ['best-sellers', 'seasonal', 'everyday', 'luxury'];
    preferred.reverse().forEach(name => {
      const idx = collectionsArr.indexOf(name);
      if (idx > -1) collectionsArr.unshift(collectionsArr.splice(idx, 1)[0]);
    });

    categoryList.innerHTML = '';
    // If you prefer static cards in HTML, you can skip this dynamic filling — this is dynamic by collections
    collectionsArr.forEach(col => {
      const card = document.createElement('a');
      card.className = 'category-card';
      card.href = `/html/shop.html?collection=${encodeURIComponent(col)}`;
      card.innerHTML = `
        <div class="category-card-inner" aria-hidden="true">
          <h3>${prettyCollectionName(col)}</h3>
          <p>Shop ${prettyCollectionName(col)} candles</p>
          <div class="category-cta">Explore</div>
        </div>
      `;
      categoryList.appendChild(card);
    });

    // if there were no collections, do nothing (don't overwrite any static HTML)
    if (!collectionsArr.length) {
      // leave static cards if any
      if (!categoryList.children.length) {
        categoryList.innerHTML = '<p class="text-center">No categories found.</p>';
      }
    }
  })();


  /* ========== HELPERS ========== */
  function buildProductCard(p) {
    const article = document.createElement('article');
    article.className = 'product-card';
    article.dataset.productId = p.id || '';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'product-image';

    // actual image
    const img = document.createElement('img');
    img.alt = p.name || 'Product';
    img.src = Array.isArray(p.images) && p.images.length ? p.images[0] : '';

    const title = document.createElement('h3');
    title.className = 'product-title';
    title.textContent = p.name || 'Untitled';

    const price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = typeof app.formatPrice === 'function' ? app.formatPrice(p.price) : `$${Number(p.price || 0).toFixed(2)}`;

    const actions = document.createElement('div');
    actions.className = 'product-actions';

    // "Go to product" now navigates to shop page and pre-fills search query with the product name
    const shopLink = document.createElement('a');
    shopLink.className = 'btn btn-primary';
    const searchQuery = encodeURIComponent(String(p.name || '').trim());
    shopLink.href = `/html/shop.html?q=${searchQuery}`;
    shopLink.textContent = 'Go to shop';

    actions.appendChild(shopLink);

    imgWrap.appendChild(img);
    article.appendChild(imgWrap);
    article.appendChild(title);
    article.appendChild(price);
    article.appendChild(actions);

    return article;
  }

  function prettyCollectionName(raw) {
    return (raw || '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  // ensure orientationchange triggers a reflow/update of the carousel
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      const container = document.getElementById('featured-grid');
      if (container && container.__carousel && typeof container.__carousel.update === 'function') {
        container.__carousel.update();
      }
    }, 160);
  });

})();
