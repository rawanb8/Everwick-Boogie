
(async () => {
  // wait for DOM ready
  if (document.readyState === 'loading') {
    await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
  }

  window.app = window.app || {};
  let app = window.app;

  async function ensureDataLoaded() {
    if (Array.isArray(app.products) && app.products.length) return;

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
      let res = await fetch('./json/products.json');
      if (!res.ok) throw new Error(`Failed to fetch products.json (${res.status})`);
      let data = await res.json();
      app.data = data || {};
      app.scents = Array.isArray(data.scents) ? data.scents : [];
      app.sizes = Array.isArray(data.size) ? data.size : [];
      app.colors = Array.isArray(data.color) ? data.color : [];
      app.containers = Array.isArray(data.container) ? data.container : [];
      app.wicks = Array.isArray(data.wick) ? data.wick : [];
      app.products = Array.isArray(data.products) ? data.products : [];

      initAppHelpers();

      function initAppHelpers() {



        // formatPrice fallback
        if (!app.formatPrice) {
          app.formatPrice = function (n) {
            n = Number(n || 0);
            if (isNaN(n)) n = 0;
            return '$' + n.toFixed(2);
          };
        }

        // lookup helpers (no typeof used — use presence check)
        if (!app.getScentById) {
          app.getScentById = function (id) {
            let num = Number(id);
            if (isNaN(num)) return null;
            if (!Array.isArray(app.scents)) return null;
            for (let i = 0; i < app.scents.length; i++) {
              if (app.scents[i] && app.scents[i].id === num) return app.scents[i];
            }
            return null;
          };
        }

        if (!app.getSizeById) {
          app.getSizeById = function (id) {
            let num = Number(id);
            if (isNaN(num)) return null;
            if (!Array.isArray(app.sizes)) return null;
            for (let i = 0; i < app.sizes.length; i++) {
              if (app.sizes[i] && app.sizes[i].id === num) return app.sizes[i];
            }
            return null;
          };
        }

        if (!app.getColorById) {
          app.getColorById = function (id) {
            let num = Number(id);
            if (isNaN(num)) return null;
            if (!Array.isArray(app.colors)) return null;
            for (let i = 0; i < app.colors.length; i++) {
              if (app.colors[i] && app.colors[i].id === num) return app.colors[i];
            }
            return null;
          };
        }

        if (!app.getContainerById) {
          app.getContainerById = function (id) {
            let num = Number(id);
            if (isNaN(num)) return null;
            if (!Array.isArray(app.containers)) return null;
            for (let i = 0; i < app.containers.length; i++) {
              if (app.containers[i] && app.containers[i].id === num) return app.containers[i];
            }
            return null;
          };
        }

        if (!app.getWickById) {
          app.getWickById = function (id) {
            let num = Number(id);
            if (isNaN(num)) return null;
            if (!Array.isArray(app.wicks)) return null;
            for (let i = 0; i < app.wicks.length; i++) {
              if (app.wicks[i] && app.wicks[i].id === num) return app.wicks[i];
            }
            return null;
          };
        }

        if (!app.getProductById) {
          app.getProductById = function (id) {
            if (!Array.isArray(app.products)) return null;
            let sid = String(id);
            for (let i = 0; i < app.products.length; i++) {
              if (String(app.products[i].id) === sid) return app.products[i];
            }
            return null;
          };
        }

        // basic cart & wishlist fallbacks
        if (!app.addToCart) {
          app.addToCart = function (productId, qty) {
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            cart.push({ id: Date.now() + '-' + productId, productId: productId, quantity: qty || 1 });
            localStorage.setItem('cart', JSON.stringify(cart));
            return true;
          };
        }

        if (!app.isInWishlist) {
          app.isInWishlist = function (productId) {
            let wl = JSON.parse(localStorage.getItem('wishlist') || '[]');
            for (let i = 0; i < wl.length; i++) if (String(wl[i]) === String(productId)) return true;
            return false;
          };
        }
        if (!app.addToWishlist) {
          app.addToWishlist = function (productId) {
            let wl = JSON.parse(localStorage.getItem('wishlist') || '[]');
            if (!app.isInWishlist(productId)) wl.push(productId);
            localStorage.setItem('wishlist', JSON.stringify(wl));
          };
        }
        if (!app.removeFromWishlist) {
          app.removeFromWishlist = function (productId) {
            let wl = JSON.parse(localStorage.getItem('wishlist') || '[]');
            wl = wl.filter(function (x) { return String(x) !== String(productId); });
            localStorage.setItem('wishlist', JSON.stringify(wl));
          };
        }
      }
    } catch (err) {
      console.error('Could not load ./json/products.json:', err);

    }
  }

  await ensureDataLoaded();

  // DOM containers
  let featuredGrid = document.getElementById('featured-grid');
  let categoryList = document.getElementById('category-list');

  if (!featuredGrid) {
    console.warn('No #featured-grid found — skipping featured render.');
    return;
  }
  if (!categoryList) {
    console.warn('No #category-list found — skipping categories render.');
    // we still render featured products
  }

  let products = Array.isArray(app.products) ? app.products : [];

  /* ========== FEATURED PRODUCTS========== */
  (function initFeatured() {
    let container = document.getElementById('featured-grid');
    if (!container) {
      console.warn('initFeatured: #featured-grid not found');
      return;
    }
    let featuredItems = products.filter(p => p && p.featured === true);

    // Nothing to show
    if (!featuredItems.length) {
      container.innerHTML = '<p class="text-center">No featured products.</p>';
      return;
    }
    if (isRootIndexPage()) {
      featuredItems.forEach(item => {
        if (item.images && Array.isArray(item.images)) {
          item.images = item.images.map(img => {
            if (typeof img === "string" && img.length > 0) {
              return img.slice(1);   // remove first character
            }
            return img;
          });
        }
      });
    }

    // Clear and build track
    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    let track = document.createElement('div');
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
      let a = document.createElement('article');
      a.className = 'product-card';
      a.innerHTML = `
      <div class="product-image"><img src="../${(Array.isArray(p.images) && p.images[0]) || ''}" alt="${p.name || ''}"></div>
      <h3 class="product-title">${p.name || 'Untitled'}</h3>
      <p class="product-price">${typeof window.app?.formatPrice === 'function' ? window.app.formatPrice(p.price) : ('$' + (Number(p.price || 0).toFixed(2)))}</p>
    `;
      return a;
    }

    // Append cards
    featuredItems.forEach(p => {
      let card = makeCard(p);
      card.style.flexShrink = '0';
      card.style.margin = '0';
      track.appendChild(card);
    });

    container.appendChild(track);

    // Controls
    let controls = document.createElement('div');
    controls.className = 'featured-controls';
    controls.style.display = 'flex';
    controls.style.gap = '.6rem';
    controls.style.justifyContent = 'center';
    controls.style.alignItems = 'center';
    controls.style.marginTop = '1rem';

    let prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'featured-arrow';
    prevBtn.setAttribute('aria-label', 'Previous featured');
    prevBtn.innerHTML = '<i class="fa-solid fa-caret-left" aria-hidden="true"></i>';

    let nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'featured-arrow';
    nextBtn.setAttribute('aria-label', 'Next featured');
    nextBtn.innerHTML = '<i class="fa-solid fa-caret-right" aria-hidden="true"></i>';

    let pageIndicator = document.createElement('div');
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
    let cards = Array.from(track.querySelectorAll('.product-card'));

    // Measure function
    function getMetrics() {
      let firstCard = track.querySelector('.product-card');
      if (!firstCard) return { cardW: 0, gap: 0, visibleCount: 1, containerW: container.clientWidth };
      let cardRect = firstCard.getBoundingClientRect();
      let cs = getComputedStyle(track);
      let gap = parseFloat(cs.gap) || 0;
      let cardW = Math.round(cardRect.width);
      let containerW = container.clientWidth;
      let visibleCount = Math.max(1, Math.floor((containerW + gap) / (cardW + gap)));
      return { cardW, gap, visibleCount, containerW };
    }

    // Update buttons / transform
    function update() {
      let metrics = getMetrics();
      let cardW = metrics.cardW, gap = metrics.gap, visibleCount = metrics.visibleCount;
      let total = cards.length;
      let maxIndex = Math.max(0, total - visibleCount);

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

      let translateX = -Math.round(index * (cardW + gap));
      track.style.transform = `translateX(${translateX}px)`;

      pageIndicator.textContent = `Showing ${index + 1}–${Math.min(index + visibleCount, total)} of ${total}`;
    }

    // Next / Prev handlers (wrap-around)
    function next() {
      let metrics = getMetrics();
      let visibleCount = metrics.visibleCount;
      let total = cards.length;
      let maxIndex = Math.max(0, total - visibleCount);

      if (total <= visibleCount) {
        index = 0;
      } else {
        index = index + 1;
        if (index > maxIndex) index = 0; // wrap
      }
      update();
    }

    function prev() {
      let metrics = getMetrics();
      let visibleCount = metrics.visibleCount;
      let total = cards.length;
      let maxIndex = Math.max(0, total - visibleCount);

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
      let metrics = getMetrics();
      let visibleCount = metrics.visibleCount;
      let total = cards.length;
      let maxIndex = Math.max(0, total - visibleCount);
      if (index > maxIndex) index = maxIndex;
      update();
    }

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(onResize, 120);
    });

    // Ensure images load before initial measure
    let imgs = track.querySelectorAll('img');
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
  let reviewCards = document.querySelectorAll('.review-card');

  let observerOptions = {
    threshold: 0.1 // triggers when 10% of card is visible
  };

  let observer = new IntersectionObserver((entries, observer) => {
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

    let collections = new Set();
    products.forEach(p => {
      if (Array.isArray(p.collections)) p.collections.forEach(c => collections.add(c));
    });

    let collectionsArr = Array.from(collections).sort();

    // optional priority order
    let preferred = ['best-sellers', 'seasonal', 'everyday', 'luxury'];
    preferred.reverse().forEach(name => {
      let idx = collectionsArr.indexOf(name);
      if (idx > -1) collectionsArr.unshift(collectionsArr.splice(idx, 1)[0]);
    });

    categoryList.innerHTML = '';
    // If you prefer static cards in HTML, you can skip this dynamic filling — this is dynamic by collections
    collectionsArr.forEach(col => {
      let card = document.createElement('a');
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
    let article = document.createElement('article');
    article.className = 'product-card';
    article.dataset.productId = p.id || '';

    let imgWrap = document.createElement('div');
    imgWrap.className = 'product-image';

    // actual image
    let img = document.createElement('img');
    img.alt = p.name || 'Product';
    img.src = Array.isArray(p.images) && p.images.length ? p.images[0] : '';

    let title = document.createElement('h3');
    title.className = 'product-title';
    title.textContent = p.name || 'Untitled';

    let price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = typeof app.formatPrice === 'function' ? app.formatPrice(p.price) : `$${Number(p.price || 0).toFixed(2)}`;

    let actions = document.createElement('div');
    actions.className = 'product-actions';

    // NEW EDITTTTT: "View" button opens the modal 
    let viewBtn = document.createElement('button');
    viewBtn.className = 'btn btn-outline btn-small';
    viewBtn.type = 'button';
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      showProductModalById(p.id);
    });
    actions.appendChild(viewBtn);


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
      let container = document.getElementById('featured-grid');
      if (container && container.__carousel && typeof container.__carousel.update === 'function') {
        container.__carousel.update();
      }
    }, 160);
  });



  function showProductModalById(productId) {

    let product = (app.getProductById ? app.getProductById(productId) : (app.products || []).find(p => String(p.id) === String(productId)));
    if (!product) return console.warn('No product found for modal:', productId);

    // Create modal overlay if it doesn't exist
    let overlay = document.querySelector('.product-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'product-modal-overlay';
      overlay.style.display = 'none';
      overlay.innerHTML = `
      <div class="product-modal" role="dialog" aria-modal="true" aria-labelledby="modal-product-title">
        <div class="modal-image-container"><img src="" alt=""></div>
        <div class="modal-info-container">
          <button class="modal-close-custom" aria-label="Close product modal">×</button>
          <h2 id="modal-product-title" class="modal-product-title"></h2>
          <div class="modal-product-price"></div>
          <div class="modal-section-title">Description</div>
          <p class="modal-description"></p>
          <div class="modal-specs-grid"></div>
          <div class="modal-actions">
            <button class="btn btn-primary modal-add-btn">Add to Cart</button>
            <button class="btn-wishlist-modal modal-wishlist-btn" aria-pressed="false"><i class="fa-regular fa-heart"></i></button>
          </div>
        </div>
      </div>
    `;
      document.body.appendChild(overlay);

      // Close handlers
      overlay.querySelector('.modal-close-custom').addEventListener('click', () => {
        overlay.style.display = 'none';
        document.body.classList.remove('modal-open'); //remove the class no scroll
      });

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.style.display = 'none';
          document.body.classList.remove('modal-open');
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.style.display !== 'none') {
          overlay.style.display = 'none';
          document.body.classList.remove('modal-open');
        }
      });
    }

    // Populate modal content
    let img = overlay.querySelector('.modal-image-container img');
    let title = overlay.querySelector('#modal-product-title');
    let price = overlay.querySelector('.modal-product-price');
    let desc = overlay.querySelector('.modal-description');
    let specs = overlay.querySelector('.modal-specs-grid');
    let addBtn = overlay.querySelector('.modal-add-btn');
    let wishBtn = overlay.querySelector('.modal-wishlist-btn');

    // Image — match carousel style
    // img.src = Array.isArray(product.images) && product.images.length ? `../${product.images[0]}` : '';
    //trying to fix host link issue
    img.src = Array.isArray(product.images) && product.images.length
      ? (isRootIndexPage() ? product.images[0] : `../${product.images[0]}`)
      : '';
    img.alt = product.name || 'Product image';

    // Basic info
    title.textContent = product.name || '';
    price.textContent = (app.formatPrice ? app.formatPrice(product.price) : `$${Number(product.price || 0).toFixed(2)}`);
    desc.textContent = product.shortDescription || '';

    // Specs (example: size, container, wick, scent)
    specs.innerHTML = '';
    let scent = app.getScentById ? app.getScentById(product.scentId) : null;
    let size = app.getSizeById ? app.getSizeById(product.sizeId) : null;
    let containerObj = app.getContainerById ? app.getContainerById(product.containerId) : null;
    let wickObj = app.getWickById ? app.getWickById(product.wickId) : null;

    let rows = [
      ['Mood', (scent && scent.mood) ? scent.mood : '—'],
      ['Family', (scent && scent.family) ? scent.family : '—'],
      ['Size', size ? (size.name || size.volume) : '—'],
      ['Burn Time', size ? (size.burn_time || size.burnTime) || '—' : '—'],
      ['Container', containerObj ? (containerObj.name || containerObj.description) : '—'],
      ['Wick', wickObj ? (wickObj.name || wickObj.description) : '—']
    ];

    rows.forEach(([k, v]) => {
      let el = document.createElement('div');
      el.className = 'spec-item';
      el.innerHTML = `<strong>${k}</strong> <span>${v}</span>`;
      specs.appendChild(el);
    });

    // Wishlist button
    let wishlisted = app.isInWishlist ? app.isInWishlist(product.id) : false;
    wishBtn.setAttribute('aria-pressed', wishlisted ? 'true' : 'false');
    wishBtn.innerHTML = wishlisted ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';

    // Add to cart button
    addBtn.disabled = product.stock <= 0;
    addBtn.classList.remove('btn--added');
    addBtn.innerHTML = product.stock <= 0 ? 'Out of Stock' : 'Add to Cart';

    addBtn.onclick = (e) => {
      e.stopPropagation();
      if (app.addToCart) app.addToCart(product.id, 1);
      addBtn.classList.add('btn--added');
      addBtn.innerHTML = 'Added <i class="fa fa-check"></i>';
      document.dispatchEvent(new Event('cartChanged'));
    };

    wishBtn.onclick = (e) => {
      e.stopPropagation();
      if (wishlisted) {
        if (app.removeFromWishlist) app.removeFromWishlist(product.id);
        wishBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
        wishBtn.setAttribute('aria-pressed', 'false');
      } else {
        if (app.addToWishlist) app.addToWishlist(product.id);
        wishBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
        wishBtn.style.color = "red";
        wishBtn.setAttribute('aria-pressed', 'true');
      }
      document.dispatchEvent(new Event('wishlistChanged'));
    };

    // Show modal
    overlay.style.display = 'flex';
    overlay.querySelector('.modal-close-custom').focus();

    document.body.classList.add('modal-open');
  }



  //scroll animations
  function observeScrollAnimations() {
    let elements = document.querySelectorAll('.animate-on-scroll');

    if (!elements.length) return;

    let scrollObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    elements.forEach(function (el) { scrollObserver.observe(el); });
  }
  observeScrollAnimations();
})();
