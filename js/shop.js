// Shop page functionality
let allProducts = [];
let filteredProducts = [];
let displayedProducts = [];
let currentView = 'grid';
let productsPerPage = 9;
let currentPage = 1;

document.addEventListener('DOMContentLoaded', async () => {
  await app.loadData();
  initializeShop();
  setupEventListeners();
});

function renderProductsInGrid(products) {
  const container = document.getElementById('products-grid');
  if (!container) return;

  container.innerHTML = '';

  products.forEach(product => {
    const scent = app.getScentById(product.scentId);
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
      <img src="${product.images[0]}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>${scent?.description || ''}</p>
      <p>Price: ${app.formatPrice(product.price)}</p>
      <button onclick="addProductToCart(${product.id})">Add to Cart</button>
    `;
    container.appendChild(div);
  });
}


function initializeShop() {
  allProducts = app.getProducts();
  filteredProducts = [...allProducts];
  setupFilters();
  renderProductsInGrid(filteredProducts);
  displayProducts();
  updateResultsCount();
}

function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', app.debounce(searchProducts, 300));

  // Price range sliders
  const priceMin = document.getElementById('price-min');
  const priceMax = document.getElementById('price-max');

  priceMin.addEventListener('input', updatePriceLabels);
  priceMax.addEventListener('input', updatePriceLabels);
  priceMin.addEventListener('change', applyFilters);
  priceMax.addEventListener('change', applyFilters);
}

function setupFilters() {
  setupScentCategoryFilters();
  setupSizeFilters();
  setupMoodFilters();
  updatePriceLabels();
}

function setupScentCategoryFilters() {
  const container = document.getElementById('scent-category-filters');
  if (!container) return;

  const categories = [...new Set(app.getScents().map(scent => scent.family))];

  container.innerHTML = categories.map(category => `
    <label class="filter-checkbox">
      <input type="checkbox" value="${category}" onchange="applyFilters()">
      <span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>
    </label>
  `).join('');
}

function setupSizeFilters() {
  const container = document.getElementById('size-filters');
  const sizes = app.getSizes();

  container.innerHTML = sizes.map(size => `
        <label class="filter-checkbox">
          <input type="checkbox" value="${size.id}" onchange="applyFilters()">
          <span>${size.name} (${size.volume})</span>
        </label>
      `).join('');
}

function setupMoodFilters() {
  const container = document.getElementById('mood-filters');
  const moods = [...new Set(app.getScents().map(scent => scent.mood))];

  container.innerHTML = moods.map(mood => `
        <label class="filter-checkbox">
          <input type="checkbox" value="${mood}" onchange="applyFilters()">
          <span>${mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
        </label>
      `).join('');
}

function updatePriceLabels() {
  const minSlider = document.getElementById('price-min');
  const maxSlider = document.getElementById('price-max');
  const minLabel = document.getElementById('price-min-label');
  const maxLabel = document.getElementById('price-max-label');

  const minValue = parseInt(minSlider.value);
  const maxValue = parseInt(maxSlider.value);

  // Ensure min doesn't exceed max
  if (minValue >= maxValue) {
    minSlider.value = maxValue - 1;
  }

  minLabel.textContent = `$${minSlider.value}`;
  maxLabel.textContent = `$${maxSlider.value}`;
}

function applyFilters() {
  filteredProducts = allProducts.filter(product => {
    // Category filters
    const categoryFilters = Array.from(document.querySelectorAll('#category-filters input:checked')).map(cb => cb.value);
    if (categoryFilters.length > 0) {
      const hasCategory = categoryFilters.some(category => {
        if (category === 'best-sellers') return product.featured;
        if (category === 'seasonal') return false; // Could implement seasonal logic
        if (category === 'custom') return product.type === 'custom';
        return false;
      });
      if (!hasCategory) return false;
    }

    // Scent category filters
    const scentCategoryFilters = Array.from(document.querySelectorAll('#scent-category-filters input:checked')).map(cb => cb.value);
    if (scentCategoryFilters.length > 0) {
      const scent = app.getScentById(product.scent_id);
      if (!scent || !scentCategoryFilters.includes(scent.category)) return false;
    }

    // Price range filter
    const minPrice = parseInt(document.getElementById('price-min').value);
    const maxPrice = parseInt(document.getElementById('price-max').value);
    if (product.price < minPrice || product.price > maxPrice) return false;

    // Size filters
    const sizeFilters = Array.from(document.querySelectorAll('#size-filters input:checked')).map(cb => parseInt(cb.value));
    if (sizeFilters.length > 0 && !sizeFilters.includes(product.size_id)) return false;

    // Mood filters
    const moodFilters = Array.from(document.querySelectorAll('#mood-filters input:checked')).map(cb => cb.value);
    if (moodFilters.length > 0) {
      const scent = app.getScentById(product.scent_id);
      if (!scent || !moodFilters.includes(scent.mood)) return false;
    }

    // In stock filter
    const inStockOnly = document.getElementById('in-stock-filter').checked;
    if (inStockOnly && product.stock <= 0) return false;

    return true;
  });

  currentPage = 1;
  displayProducts();
  updateResultsCount();
}

function searchProducts() {
  const query = document.getElementById('search-input').value.trim();

  if (query === '') {
    filteredProducts = [...allProducts];
  } else {
    filteredProducts = app.searchProducts(query);
  }

  currentPage = 1;
  displayProducts();
  updateResultsCount();
}

function sortProducts() {
  const sortBy = document.getElementById('sort-select').value;

  filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'popularity':
        const scentA = app.getScentById(a.scent_id);
        const scentB = app.getScentById(b.scent_id);
        return (scentB?.popularity || 0) - (scentA?.popularity || 0);
      case 'featured':
      default:
        return b.featured - a.featured;
    }
  });

  displayProducts();
}

function displayProducts() {
  const container = document.getElementById('products-grid');
  const startIndex = 0;
  const endIndex = currentPage * productsPerPage;
  displayedProducts = filteredProducts.slice(startIndex, endIndex);

  container.className = `products-grid ${currentView === 'grid' ? 'grid grid-3' : 'products-list'}`;

  container.innerHTML = displayedProducts.map(product => {
    const scent = app.getScentById(product.scent_id);
    const size = app.getSizeById(product.size_id);
    const color = app.getColorById(product.color_id);

    if (currentView === 'grid') {
      return `
            <div class="product-card card" onclick="showProductDetails(${product.id})">
              <div class="product-image">
                <img src="https://images.unsplash.com/photo-1602574968595-52bdc47de83c?w=300&h=200&fit=crop" 
                     alt="${product.name}" class="card-image">
                ${product.featured ? '<div class="featured-badge">Featured</div>' : ''}
                ${product.stock <= 5 ? '<div class="stock-badge">Low Stock</div>' : ''}
              </div>
              <div class="card-content">
                <h3 class="card-title">${product.name}</h3>
                <p class="card-description">${scent?.description || ''}</p>
                <div class="product-details">
                  <div class="product-specs">
                    <span class="spec">Size: ${size?.name || 'N/A'}</span>
                    <span class="spec">Scent: ${scent?.category || 'N/A'}</span>
                  </div>
                  <div class="product-price">
                    <span class="price">${app.formatPrice(product.price)}</span>
                  </div>
                </div>
                <div class="product-actions">
                  <button class="btn btn-outline btn-small" onclick="event.stopPropagation(); showProductDetails(${product.id})">
                    View Details
                  </button>
                  <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); addProductToCart(${product.id})" 
                          ${product.stock <= 0 ? 'disabled' : ''}>
                    ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          `;
    } else {
      return `
            <div class="product-list-item" onclick="showProductDetails(${product.id})">
              <div class="product-image">
                <img src="https://images.unsplash.com/photo-1602574968595-52bdc47de83c?w=150&h=100&fit=crop" 
                     alt="${product.name}">
              </div>
              <div class="product-info">
                <h3>${product.name}</h3>
                <p>${scent?.description || ''}</p>
                <div class="product-specs">
                  <span>Size: ${size?.name || 'N/A'}</span>
                  <span>Scent: ${scent?.category || 'N/A'}</span>
                  <span>Stock: ${product.stock}</span>
                </div>
              </div>
              <div class="product-price">
                <span class="price">${app.formatPrice(product.price)}</span>
              </div>
              <div class="product-actions">
                <button class="btn btn-primary" onclick="event.stopPropagation(); addProductToCart(${product.id})" 
                        ${product.stock <= 0 ? 'disabled' : ''}>
                  ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          `;
    }
  }).join('');

  // Show/hide load more button
  const loadMoreSection = document.getElementById('load-more-section');
  const hasMore = filteredProducts.length > displayedProducts.length;
  loadMoreSection.style.display = hasMore ? 'block' : 'none';
}

function loadMoreProducts() {
  currentPage++;
  displayProducts();
}

function updateResultsCount() {
  const container = document.getElementById('results-count');
  const total = filteredProducts.length;
  const showing = Math.min(displayedProducts.length, total);

  container.textContent = `Showing ${showing} of ${total} products`;
}

    function setView(viewType) {
      currentView = viewType;
      
      // Update view buttons
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      document.querySelector(`[data-view="${viewType}"]`).classList.add('active');
      
      displayProducts();
    }

function toggleFilters() {
  const sidebar = document.getElementById('filters-sidebar');
  sidebar.classList.toggle('active');
}

    function clearAllFilters() {
      // Clear all checkboxes
      document.querySelectorAll('.filter-checkbox input').forEach(cb => cb.checked = false);
      
      // Reset price sliders
      document.getElementById('price-min').value = 0;
      document.getElementById('price-max').value = 100;
      updatePriceLabels();
      
      // Clear search
      document.getElementById('search-input').value = '';
      
      // Reset sort
      document.getElementById('sort-select').value = 'featured';
      
      // Reapply (which will show all products)
      filteredProducts = [...allProducts];
      currentPage = 1;
      displayProducts();
      updateResultsCount();
    }

    function showProductDetails(productId) {
      const product = app.getProductById(productId);
      if (!product) return;
      
      const scent = app.getScentById(product.scent_id);
      const size = app.getSizeById(product.size_id);
      const color = app.getColorById(product.color_id);
      const container = app.getContainerById(product.container_id);
      const wick = app.getWickById(product.wick_id);
      
      document.getElementById('product-modal-title').textContent = product.name;
      document.getElementById('product-modal-body').innerHTML = `
        <div class="product-details-full">
          <div class="product-images">
            <img src="https://images.unsplash.com/photo-1602574968595-52bdc47de83c?w=400&h=300&fit=crop" 
                 alt="${product.name}" class="main-product-image">
          </div>
          <div class="product-info-full">
            <div class="product-price-full">
              <span class="price-large">${app.formatPrice(product.price)}</span>
              ${product.featured ? '<span class="featured-tag">Featured</span>' : ''}
            </div>
            
            <div class="product-description">
              <p>${scent?.description || 'Custom candle creation'}</p>
            </div>
            
            <div class="product-specifications">
              <h4>Specifications</h4>
              <div class="specs-grid">
                ${scent ? `<div class="spec-item"><strong>Scent:</strong> ${scent.name}</div>` : ''}
                ${color ? `<div class="spec-item"><strong>Color:</strong> ${color.name}</div>` : ''}
                ${size ? `<div class="spec-item"><strong>Size:</strong> ${size.volume}</div>` : ''}
                ${size ? `<div class="spec-item"><strong>Burn Time:</strong> ${size.burn_time}</div>` : ''}
                ${container ? `<div class="spec-item"><strong>Container:</strong> ${container.name}</div>` : ''}
                ${wick ? `<div class="spec-item"><strong>Wick:</strong> ${wick.name}</div>` : ''}
                <div class="spec-item"><strong>Stock:</strong> ${product.stock} available</div>
              </div>
            </div>
            
            ${scent ? `
              <div class="scent-details">
                <h4>Scent Profile</h4>
                <div class="scent-properties">
                  <div class="scent-mood">Mood: ${scent.mood}</div>
                  <div class="scent-strength">Strength: ${scent.aggressiveness}/10</div>
                  <div class="scent-category">Category: ${scent.category}</div>
                </div>
                <div class="scent-notes">
                  <strong>Notes:</strong>
                  ${scent.notes.map(note => `<span class="note-tag">${note}</span>`).join('')}
                </div>
              </div>
            ` : ''}
            
            <div class="product-actions-full">
              <div class="quantity-selector">
                <label for="quantity">Quantity:</label>
                <input type="number" id="quantity" min="1" max="${product.stock}" value="1" class="form-input">
              </div>
              <button class="btn btn-primary btn-large" onclick="addProductToCart(${product.id}, document.getElementById('quantity').value)" 
                      ${product.stock <= 0 ? 'disabled' : ''}>
                ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              ${product.type === 'custom' ? `
                <a href="customize.html" class="btn btn-outline btn-large">Customize</a>
              ` : ''}
            </div>
          </div>
        </div>
      `;
      
      app.openModal('product-modal');
    }

    function addProductToCart(productId, quantity = 1) {
      const product = app.getProductById(productId);
      if (!product || product.stock <= 0) {
        app.showNotification('Product is out of stock', 'error');
        return;
      }
      
      for (let i = 0; i < quantity; i++) {
        app.addToCart(productId);
      }
    }

function openCartModal() {
  loadCartItems();
  app.openModal('cart-modal');
}

function loadCartItems() {
  const container = document.getElementById('cart-items');
  const totalElement = document.getElementById('cart-total');

      if (app.cart.length === 0) {
        container.innerHTML = '<p class="text-center">Your cart is empty</p>';
      } else {
        container.innerHTML = app.cart.map(item => {
          const product = app.getProductById(item.productId);
          const scent = app.getScentById(product.scent_id);
          
          return `
            <div class="cart-item flex">
              <div class="cart-item-info flex-1">
                <h4>${product.name}</h4>
                <p>${scent?.name || ''}</p>
                <p>Quantity: ${item.quantity}</p>
              </div>
              <div class="cart-item-price">
                ${app.formatPrice(item.price * item.quantity)}
              </div>
              <button class="btn btn-small btn-secondary" onclick="app.removeFromCart(${item.id}); loadCartItems();">
                Remove
              </button>
            </div>
          `;
        }).join('');
      }

      totalElement.textContent = app.formatPrice(app.getCartTotal());
    }