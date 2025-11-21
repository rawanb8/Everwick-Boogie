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
    const featured = products.filter(p => p.featured === true);
    const perPage = 4;
    let currentPage = 0;
    const totalPages = Math.max(1, Math.ceil(featured.length / perPage));

    // build controls
    const controls = document.createElement('div');
    controls.className = 'featured-controls';
    controls.style.display = 'flex';
    controls.style.alignItems = 'center';
    controls.style.justifyContent = 'center';
    controls.style.gap = '0.5rem';
    controls.style.marginTop = '1rem';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'btn btn-outline btn-small';
    prevBtn.setAttribute('aria-label', 'Previous featured products');
    prevBtn.textContent = '← Prev';
    prevBtn.addEventListener('click', () => {
      currentPage = (currentPage - 1 + totalPages) % totalPages;
      renderPage();
    });

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'btn btn-outline btn-small';
    nextBtn.setAttribute('aria-label', 'Next featured products');
    nextBtn.textContent = 'Next →';
    nextBtn.addEventListener('click', () => {
      currentPage = (currentPage + 1) % totalPages;
      renderPage();
    });

    const pageIndicator = document.createElement('div');
    pageIndicator.className = 'featured-page-indicator';
    pageIndicator.style.padding = '0.35rem 0.6rem';
    pageIndicator.style.color = 'var(--text-light)';
    pageIndicator.style.fontSize = '0.95rem';

    controls.appendChild(prevBtn);
    controls.appendChild(pageIndicator);
    controls.appendChild(nextBtn);

    // insert controls after the grid (if there's a container)
    featuredGrid.parentNode && featuredGrid.parentNode.insertBefore(controls, featuredGrid.nextSibling);

    function renderPage() {
      featuredGrid.innerHTML = '';
      if (!featured.length) {
        featuredGrid.innerHTML = '<p class="text-center">No featured products.</p>';
        pageIndicator.textContent = '';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
      }

      const start = currentPage * perPage;
      const pageItems = featured.slice(start, start + perPage);

      pageItems.forEach(p => featuredGrid.appendChild(buildProductCard(p)));

      pageIndicator.textContent = `Page ${currentPage + 1} / ${totalPages}`;
      prevBtn.disabled = totalPages <= 1;
      nextBtn.disabled = totalPages <= 1;
    }

    renderPage();
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
      // leave existing static category cards (if any) — helpful if you prefer static content
      if (!categoryList.children.length) {
        categoryList.innerHTML = '<p class="text-center">No categories found.</p>';
      }
    }
  })();

  /* ========== MODAL (single reusable) ========== */
  (function ensureModal() {
    if (document.getElementById('product-modal')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'product-modal';
    wrapper.className = 'modal';
    wrapper.setAttribute('role', 'dialog');
    wrapper.setAttribute('aria-modal', 'true');
    wrapper.style.display = 'none';
    wrapper.innerHTML = `
      <div class="modal-content" role="document" style="max-width:760px;">
        <div class="modal-header">
          <h3 id="pm-title"></h3>
          <button class="modal-close" id="pm-close" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body" id="pm-body">
          <div class="pm-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;align-items:center">
            <div class="pm-image-wrap"><img id="pm-image" loading="lazy" alt="" style="width:100%;height:auto;border-radius:8px"></div>
            <div class="pm-details">
              <p id="pm-desc"></p>
              <p class="pm-price" id="pm-price" style="font-weight:700;margin-top:8px"></p>
              <div id="pm-extra"></div>
              <div style="margin-top:1rem;"><a id="pm-link" class="btn btn-primary" href="#">View full product</a></div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);

    wrapper.querySelector('#pm-close').addEventListener('click', () => closeModal());
    wrapper.addEventListener('click', (e) => { if (e.target === wrapper) closeModal(); });

    function closeModal() {
      wrapper.style.display = 'none';
      document.body.classList.remove('modal-open');
    }

    // expose for other functions (not global, closure only)
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
    img.loading = 'lazy';
    img.src = Array.isArray(p.images) && p.images.length ? p.images[0] : '/media/placeholder/product-placeholder.png';

    const title = document.createElement('h3');
    title.className = 'product-title';
    title.textContent = p.name || 'Untitled';

    const price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = typeof app.formatPrice === 'function' ? app.formatPrice(p.price) : `$${Number(p.price || 0).toFixed(2)}`;

    const actions = document.createElement('div');
    actions.className = 'product-actions';

    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.className = 'btn btn-outline';
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openProductPreview(p);
    });

    const shopLink = document.createElement('a');
    shopLink.className = 'btn btn-primary';
    const slug = p.slug || encodeURIComponent(String(p.id || p.name || '').toLowerCase().replace(/\s+/g, '-'));
    shopLink.href = `/html/product.html?slug=${slug}`;
    shopLink.textContent = 'Go to product';

    actions.appendChild(viewBtn);
    actions.appendChild(shopLink);

    imgWrap.appendChild(img);
    article.appendChild(imgWrap);
    article.appendChild(title);
    article.appendChild(price);
    article.appendChild(actions);

    return article;
  }

  function openProductPreview(product) {
    const modal = document.getElementById('product-modal');
    if (!modal) return;

    modal.style.display = 'flex';
    document.body.classList.add('modal-open');

    const img = modal.querySelector('#pm-image');
    const title = modal.querySelector('#pm-title');
    const desc = modal.querySelector('#pm-desc');
    const priceEl = modal.querySelector('#pm-price');
    const link = modal.querySelector('#pm-link');

    if (img) img.src = (Array.isArray(product.images) && product.images.length) ? product.images[0] : '/media/placeholder/product-placeholder.png';
    if (img) img.alt = product.name || 'Product';
    if (title) title.textContent = product.name || '';
    if (desc) desc.textContent = product.shortDescription || product.description || '';
    if (priceEl) priceEl.textContent = typeof app.formatPrice === 'function' ? app.formatPrice(product.price) : `$${Number(product.price || 0).toFixed(2)}`;
    if (link) {
      const slug = product.slug || encodeURIComponent(String(product.id || product.name || '').toLowerCase().replace(/\s+/g, '-'));
      link.href = `/html/product.html?slug=${slug}`;
    }
  }

  function prettyCollectionName(raw) {
    return (raw || '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

})();
