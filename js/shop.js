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

// Initialize shop
function initializeShop() {
<<<<<<< HEAD
  allProducts = app.getProducts();
  filteredProducts = [...allProducts];
  setupFilters();
  displayProducts();
  updateResultsCount();
}

function setupEventListeners() {
  // Search input with debounce
  // Search input with debounce
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', app.debounce(searchProducts, 300));
  }
  if (searchInput) {
    searchInput.addEventListener('input', app.debounce(searchProducts, 300));
  }

  // Price range sliders
  const priceMin = document.getElementById('price-min');
  const priceMax = document.getElementById('price-max');

  if (priceMin && priceMax) {
    priceMin.addEventListener('input', updatePriceLabels);
    priceMax.addEventListener('input', updatePriceLabels);
    priceMin.addEventListener('change', applyFilters);
    priceMax.addEventListener('change', applyFilters);
  }
  if (priceMin && priceMax) {
    priceMin.addEventListener('input', updatePriceLabels);
    priceMax.addEventListener('input', updatePriceLabels);
    priceMin.addEventListener('change', applyFilters);
    priceMax.addEventListener('change', applyFilters);
  }
}

function setupFilters() {
  setupScentCategoryFilters();
  setupSizeFilters();
  setupColorFilters();
  setupContainerFilters();
  setupWickFilters();
  setupColorFilters();
  setupContainerFilters();
  setupWickFilters();
  setupMoodFilters();
  updatePriceLabels();
}

// Populate scent family filters
// Populate scent family filters
function setupScentCategoryFilters() {
  const container = document.getElementById('scent-category-filters');
  if (!container) return;

  const families = [...new Set(app.getScents().map(s => s.family))];
  const families = [...new Set(app.getScents().map(s => s.family))];

  container.innerHTML = families.map(family => `
  container.innerHTML = families.map(family => `
    <label class="filter-checkbox">
      <input type="checkbox" value="${family}" onchange="applyFilters()">
      <span>${family.charAt(0).toUpperCase() + family.slice(1)}</span>
      <input type="checkbox" value="${family}" onchange="applyFilters()">
      <span>${family.charAt(0).toUpperCase() + family.slice(1)}</span>
    </label>
  `).join('');
}

// Populate size filters
// Populate size filters
function setupSizeFilters() {
  const container = document.getElementById('size-filters');
  if (!container) return;

  if (!container) return;

  const sizes = app.getSizes();
  container.innerHTML = sizes.map(size => `
    <label class="filter-checkbox">
      <input type="checkbox" value="${size.id}" onchange="applyFilters()">
      <span>${size.name} (${size.volume})</span>
    </label>
  `).join('');
    <label class="filter-checkbox">
      <input type="checkbox" value="${size.id}" onchange="applyFilters()">
      <span>${size.name} (${size.volume})</span>
    </label>
  `).join('');
}

// Populate color filters
function setupColorFilters() {
  let container = document.getElementById('color-filters');
  if (!container) {
    // Create color filter section if it doesn't exist
    const filtersSection = document.querySelector('.filters-sidebar');
    if (filtersSection) {
      const html = `
        <div class="filter-section">
          <h4>Color</h4>
          <div class="filter-options" id="color-filters"></div>
        </div>
      `;
      filtersSection.insertAdjacentHTML('beforeend', html);
      container = document.getElementById('color-filters');
    }
  }

  if (!container) return;

  const colors = app.getColors();
  container.innerHTML = colors.map(color => `
    <label class="filter-checkbox">
      <input type="checkbox" value="${color.id}" onchange="applyFilters()">
      <span>${color.name}</span>
    </label>
  `).join('');
}

// Populate container filters
function setupContainerFilters() {
  let container = document.getElementById('container-filters');
  if (!container) {
    const filtersSection = document.querySelector('.filters-sidebar');
    if (filtersSection) {
      const html = `
        <div class="filter-section">
          <h4>Container</h4>
          <div class="filter-options" id="container-filters"></div>
        </div>
      `;
      filtersSection.insertAdjacentHTML('beforeend', html);
      container = document.getElementById('container-filters');
    }
  }

  if (!container) return;

  const containers = app.getContainers();
  container.innerHTML = containers.map(cont => `
    <label class="filter-checkbox">
      <input type="checkbox" value="${cont.id}" onchange="applyFilters()">
      <span>${cont.name}</span>
    </label>
  `).join('');
}

// Populate wick filters
function setupWickFilters() {
  let container = document.getElementById('wick-filters');
  if (!container) {
    const filtersSection = document.querySelector('.filters-sidebar');
    if (filtersSection) {
      const html = `
        <div class="filter-section">
          <h4>Wick Type</h4>
          <div class="filter-options" id="wick-filters"></div>
        </div>
      `;
      filtersSection.insertAdjacentHTML('beforeend', html);
      container = document.getElementById('wick-filters');
    }
  }

  if (!container) return;

  const wicks = app.getWicks();
  container.innerHTML = wicks.map(wick => `
    <label class="filter-checkbox">
      <input type="checkbox" value="${wick.id}" onchange="applyFilters()">
      <span>${wick.name}</span>
    </label>
  `).join('');
}

// Populate mood filters
// Populate color filters
function setupColorFilters() {
  let container = document.getElementById('color-filters');
  if (!container) {
    // Create color filter section if it doesn't exist
    const filtersSection = document.querySelector('.filters-sidebar');
    if (filtersSection) {
      const html = `
        <div class="filter-section">
          <h4>Color</h4>
          <div class="filter-options" id="color-filters"></div>
        </div>
      `;
      filtersSection.insertAdjacentHTML('beforeend', html);
      container = document.getElementById('color-filters');
    }
  }

  if (!container) return;

  const colors = app.getColors();
  container.innerHTML = colors.map(color => `
    <label class="filter-checkbox">
      <input type="checkbox" value="${color.id}" onchange="applyFilters()">
      <span>${color.name}</span>
    </label>
  `).join('');
}

// Populate container filters
function setupContainerFilters() {
  let container = document.getElementById('container-filters');
  if (!container) {
    const filtersSection = document.querySelector('.filters-sidebar');
    if (filtersSection) {
      const html = `
        <div class="filter-section">
          <h4>Container</h4>
          <div class="filter-options" id="container-filters"></div>
        </div>
      `;
      filtersSection.insertAdjacentHTML('beforeend', html);
      container = document.getElementById('container-filters');
    }
  }

  if (!container) return;

  const containers = app.getContainers();
  container.innerHTML = containers.map(cont => `
    <label class="filter-checkbox">
      <input type="checkbox" value="${cont.id}" onchange="applyFilters()">
      <span>${cont.name}</span>
    </label>
  `).join('');
}

// Populate wick filters
function setupWickFilters() {
  let container = document.getElementById('wick-filters');
  if (!container) {
    const filtersSection = document.querySelector('.filters-sidebar');
    if (filtersSection) {
      const html = `
        <div class="filter-section">
          <h4>Wick Type</h4>
          <div class="filter-options" id="wick-filters"></div>
        </div>
      `;
      filtersSection.insertAdjacentHTML('beforeend', html);
      container = document.getElementById('wick-filters');
    }
  }

  if (!container) return;

  const wicks = app.getWicks();
  container.innerHTML = wicks.map(wick => `
    <label class="filter-checkbox">
      <input type="checkbox" value="${wick.id}" onchange="applyFilters()">
      <span>${wick.name}</span>
    </label>
  `).join('');
}

// Populate mood filters
function setupMoodFilters() {
  const container = document.getElementById('mood-filters');
  if (!container) return;
  if (!container) return;

  const moods = [...new Set(app.getScents().map(s => s.mood))];
  const moods = [...new Set(app.getScents().map(s => s.mood))];
  container.innerHTML = moods.map(mood => `
    <label class="filter-checkbox">
      <input type="checkbox" value="${mood}" onchange="applyFilters()">
      <span>${mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
    </label>
  `).join('');
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

  if (!minSlider || !maxSlider || !minLabel || !maxLabel) return;

  if (!minSlider || !maxSlider || !minLabel || !maxLabel) return;

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
    // Scent family filters
    const scentFilters = Array.from(document.querySelectorAll('#scent-category-filters input:checked')).map(cb => cb.value);
    if (scentFilters.length > 0) {
      const scent = app.getScentById(product.scentId);
      if (!scent || !scentFilters.includes(scent.family)) return false;
    // Scent family filters
    const scentFilters = Array.from(document.querySelectorAll('#scent-category-filters input:checked')).map(cb => cb.value);
    if (scentFilters.length > 0) {
      const scent = app.getScentById(product.scentId);
      if (!scent || !scentFilters.includes(scent.family)) return false;
    }

    // Price range filter
    const minPrice = parseInt(document.getElementById('price-min').value);
    const maxPrice = parseInt(document.getElementById('price-max').value);
    if (product.price < minPrice || product.price > maxPrice) return false;

    // Size filters
    const sizeFilters = Array.from(document.querySelectorAll('#size-filters input:checked')).map(cb => parseInt(cb.value));
    if (sizeFilters.length > 0 && !sizeFilters.includes(product.sizeId)) return false;

    // Color filters
    const colorFilters = Array.from(document.querySelectorAll('#color-filters input:checked')).map(cb => parseInt(cb.value));
    if (colorFilters.length > 0 && !colorFilters.includes(product.colorId)) return false;

    // Container filters
    const containerFilters = Array.from(document.querySelectorAll('#container-filters input:checked')).map(cb => parseInt(cb.value));
    if (containerFilters.length > 0 && !containerFilters.includes(product.containerId)) return false;

    // Wick filters
    const wickFilters = Array.from(document.querySelectorAll('#wick-filters input:checked')).map(cb => parseInt(cb.value));
    if (wickFilters.length > 0 && !wickFilters.includes(product.wickId)) return false;
    if (sizeFilters.length > 0 && !sizeFilters.includes(product.sizeId)) return false;

    // Color filters
    const colorFilters = Array.from(document.querySelectorAll('#color-filters input:checked')).map(cb => parseInt(cb.value));
    if (colorFilters.length > 0 && !colorFilters.includes(product.colorId)) return false;

    // Container filters
    const containerFilters = Array.from(document.querySelectorAll('#container-filters input:checked')).map(cb => parseInt(cb.value));
    if (containerFilters.length > 0 && !containerFilters.includes(product.containerId)) return false;

    // Wick filters
    const wickFilters = Array.from(document.querySelectorAll('#wick-filters input:checked')).map(cb => parseInt(cb.value));
    if (wickFilters.length > 0 && !wickFilters.includes(product.wickId)) return false;

    // FIXED scent_id → scentId
    const moodFilters = Array.from(document.querySelectorAll('#mood-filters input:checked')).map(cb => cb.value);
    if (moodFilters.length > 0) {
      const scent = app.getScentById(product.scentId);
      const scent = app.getScentById(product.scentId);
      if (!scent || !moodFilters.includes(scent.mood)) return false;
    }

    // In stock filter
    const inStockOnly = document.getElementById('in-stock-filter')?.checked;
    const inStockOnly = document.getElementById('in-stock-filter')?.checked;
    if (inStockOnly && product.stock <= 0) return false;

    return true;
  });

  currentPage = 1;
  displayProducts();
  updateResultsCount();
}

function searchProducts() {
  const query = document.getElementById('search-input')?.value.trim();
  const query = document.getElementById('search-input')?.value.trim();

  if (!query) {
  if (!query) {
=======
    allProducts = app.getProducts();
>>>>>>> caca705 (fized merge errors)
    filteredProducts = [...allProducts];
    setupFilters();
    displayProducts();
    updateResultsCount();
}

// Setup global event listeners
function setupEventListeners() {
    // Search input with debounce
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.addEventListener('input', app.debounce(searchProducts, 300));

    // Price range sliders
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    if (priceMin && priceMax) {
        priceMin.addEventListener('input', updatePriceLabels);
        priceMax.addEventListener('input', updatePriceLabels);
        priceMin.addEventListener('change', applyFilters);
        priceMax.addEventListener('change', applyFilters);
    }

    // Close modal buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        });
    });
}

// Setup all filters
function setupFilters() {
    setupScentCategoryFilters();
    setupSizeFilters();
    setupColorFilters();
    setupContainerFilters();
    setupWickFilters();
    setupMoodFilters();
    updatePriceLabels();
}

// Filter population functions
function setupScentCategoryFilters() {
    const container = document.getElementById('scent-category-filters');
    if (!container) return;
    const families = [...new Set(app.getScents().map(s => s.family))];
    container.innerHTML = families.map(f => `
        <label class="filter-checkbox">
            <input type="checkbox" value="${f}" onchange="applyFilters()">
            <span>${f.charAt(0).toUpperCase() + f.slice(1)}</span>
        </label>`).join('');
}

function setupSizeFilters() {
    const container = document.getElementById('size-filters');
    if (!container) return;
    const sizes = app.getSizes();
    container.innerHTML = sizes.map(size => `
        <label class="filter-checkbox">
            <input type="checkbox" value="${size.id}" onchange="applyFilters()">
            <span>${size.name} (${size.volume})</span>
        </label>`).join('');
}

function setupColorFilters() {
    let container = document.getElementById('color-filters');
    if (!container) {
        const filtersSection = document.querySelector('.filters-sidebar');
        if (filtersSection) {
            filtersSection.insertAdjacentHTML('beforeend', `
                <div class="filter-section">
                    <h4>Color</h4>
                    <div class="filter-options" id="color-filters"></div>
                </div>`);
            container = document.getElementById('color-filters');
        }
    }
    if (!container) return;
    const colors = app.getColors();
    container.innerHTML = colors.map(color => `
        <label class="filter-checkbox">
            <input type="checkbox" value="${color.id}" onchange="applyFilters()">
            <span>${color.name}</span>
        </label>`).join('');
}

function setupContainerFilters() {
    let container = document.getElementById('container-filters');
    if (!container) {
        const filtersSection = document.querySelector('.filters-sidebar');
        if (filtersSection) {
            filtersSection.insertAdjacentHTML('beforeend', `
                <div class="filter-section">
                    <h4>Container</h4>
                    <div class="filter-options" id="container-filters"></div>
                </div>`);
            container = document.getElementById('container-filters');
        }
    }
    if (!container) return;
    const containers = app.getContainers();
    container.innerHTML = containers.map(c => `
        <label class="filter-checkbox">
            <input type="checkbox" value="${c.id}" onchange="applyFilters()">
            <span>${c.name}</span>
        </label>`).join('');
}

function setupWickFilters() {
    let container = document.getElementById('wick-filters');
    if (!container) {
        const filtersSection = document.querySelector('.filters-sidebar');
        if (filtersSection) {
            filtersSection.insertAdjacentHTML('beforeend', `
                <div class="filter-section">
                    <h4>Wick Type</h4>
                    <div class="filter-options" id="wick-filters"></div>
                </div>`);
            container = document.getElementById('wick-filters');
        }
    }
    if (!container) return;
    const wicks = app.getWicks();
    container.innerHTML = wicks.map(w => `
        <label class="filter-checkbox">
            <input type="checkbox" value="${w.id}" onchange="applyFilters()">
            <span>${w.name}</span>
        </label>`).join('');
}

function setupMoodFilters() {
    const container = document.getElementById('mood-filters');
    if (!container) return;
    const moods = [...new Set(app.getScents().map(s => s.mood))];
    container.innerHTML = moods.map(mood => `
        <label class="filter-checkbox">
            <input type="checkbox" value="${mood}" onchange="applyFilters()">
            <span>${mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
        </label>`).join('');
}

// Price label update
function updatePriceLabels() {
    const minSlider = document.getElementById('price-min');
    const maxSlider = document.getElementById('price-max');
    const minLabel = document.getElementById('price-min-label');
    const maxLabel = document.getElementById('price-max-label');
    if (!minSlider || !maxSlider || !minLabel || !maxLabel) return;

    const minValue = parseInt(minSlider.value);
    const maxValue = parseInt(maxSlider.value);
    if (minValue >= maxValue) minSlider.value = maxValue - 1;

    minLabel.textContent = `$${minSlider.value}`;
    maxLabel.textContent = `$${maxSlider.value}`;
}

// Apply filters
function applyFilters() {
    filteredProducts = allProducts.filter(product => {
        const scentFilters = Array.from(document.querySelectorAll('#scent-category-filters input:checked')).map(cb => cb.value);
        const sizeFilters = Array.from(document.querySelectorAll('#size-filters input:checked')).map(cb => parseInt(cb.value));
        const colorFilters = Array.from(document.querySelectorAll('#color-filters input:checked')).map(cb => parseInt(cb.value));
        const containerFilters = Array.from(document.querySelectorAll('#container-filters input:checked')).map(cb => parseInt(cb.value));
        const wickFilters = Array.from(document.querySelectorAll('#wick-filters input:checked')).map(cb => parseInt(cb.value));
        const moodFilters = Array.from(document.querySelectorAll('#mood-filters input:checked')).map(cb => cb.value);
        const minPrice = parseInt(document.getElementById('price-min')?.value || 0);
        const maxPrice = parseInt(document.getElementById('price-max')?.value || 100);
        const inStockOnly = document.getElementById('in-stock-filter')?.checked;

        const scent = app.getScentById(product.scentId);

        if (scentFilters.length && (!scent || !scentFilters.includes(scent.family))) return false;
        if (moodFilters.length && (!scent || !moodFilters.includes(scent.mood))) return false;
        if (sizeFilters.length && !sizeFilters.includes(product.sizeId)) return false;
        if (colorFilters.length && !colorFilters.includes(product.colorId)) return false;
        if (containerFilters.length && !containerFilters.includes(product.containerId)) return false;
        if (wickFilters.length && !wickFilters.includes(product.wickId)) return false;
        if (product.price < minPrice || product.price > maxPrice) return false;
        if (inStockOnly && product.stock <= 0) return false;

        return true;
    });
    currentPage = 1;
    displayProducts();
    updateResultsCount();
}

// Search products
function searchProducts() {
    const query = document.getElementById('search-input')?.value.trim();
    filteredProducts = query ? app.searchProducts(query) : [...allProducts];
    currentPage = 1;
    displayProducts();
    updateResultsCount();
}

// Sort products
function sortProducts() {
    const sortBy = document.getElementById('sort-select')?.value;
    filteredProducts.sort((a, b) => {
        switch (sortBy) {
            case 'price-low': return a.price - b.price;
            case 'price-high': return b.price - a.price;
            case 'name': return a.name.localeCompare(b.name);
            case 'popularity': 
            case 'featured':
            default: return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
    });
    displayProducts();
}

// Display products
function displayProducts() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    const startIndex = 0;
    const endIndex = currentPage * productsPerPage;
    displayedProducts = filteredProducts.slice(startIndex, endIndex);

    container.className = `products-grid ${currentView === 'grid' ? 'grid grid-3' : 'products-list'}`;
    container.innerHTML = displayedProducts.map(product => {
        const scent = app.getScentById(product.scentId);
        const size = app.getSizeById(product.sizeId);
        const color = app.getColorById(product.colorId);

        if (currentView === 'grid') {
            return `
            <div class="product-card" onclick="showProductDetails('${product.id}')">
                <div class="product-image" style="background-image: url('${product.images[0]}')">
                    ${product.featured ? '<div class="featured-badge">Featured</div>' : ''}
                    ${product.stock <= 5 && product.stock > 0 ? '<div class="stock-badge">Low Stock</div>' : ''}
                    ${product.stock <= 0 ? '<div class="stock-badge">Out of Stock</div>' : ''}
                </div>
                <div class="card-content">
                    <h3 class="card-title">${product.name}</h3>
                    <p class="card-description">${scent?.description || ''}</p>
                    <div class="scent-details">
                        <div class="scent-mood">Mood: ${scent?.mood || 'N/A'}</div>
                        <div class="scent-strength">Strength: <span class="strength-bar">${'●'.repeat(Math.min(10, scent?.aggressiveness || 0)) + '○'.repeat(10 - Math.min(10, scent?.aggressiveness || 0))}</span></div>
                        <div class="scent-price">${app.formatPrice(product.price)}</div>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-outline btn-small" onclick="event.stopPropagation(); showProductDetails('${product.id}')">View</button>
                        <button class="btn btn-primary btn-small open-login" onclick="event.stopPropagation(); addProductToCart('${product.id}')" ${product.stock <= 0 ? 'disabled' : ''}>Add</button>
                    </div>
                </div>
            </div>`;
        } else {
            return `
            <div class="product-list-item" onclick="showProductDetails('${product.id}')">
                <div class="product-image" style="background-image: url('${product.images[0]}'); width:120px; height:80px; background-size:cover;"></div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${scent?.description || ''}</p>
                    <div class="product-specs">
                        <span>Size: ${size?.name || 'N/A'}</span>
                        <span>Family: ${scent?.family || 'N/A'}</span>
                        <span>Stock: ${product.stock}</span>
                    </div>
                </div>
                <div class="product-price">
                    <span class="price">${app.formatPrice(product.price)}</span>
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); addProductToCart('${product.id}')" ${product.stock <= 0 ? 'disabled' : ''}>${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</button>
                </div>
            </div>`;
        }
    }).join('');

<<<<<<< HEAD
  container.innerHTML = displayedProducts.map(product => {
    const scent = app.getScentById(product.scentId);
    const size = app.getSizeById(product.sizeId);
    const color = app.getColorById(product.colorId);
    const scent = app.getScentById(product.scentId);
    const size = app.getSizeById(product.sizeId);
    const color = app.getColorById(product.colorId);

    if (currentView === 'grid') {
      return `
        <div class="product-card" onclick="showProductDetails('${product.id}')">
          <div class="product-image" style="background-image: url('${product.images[0]}')">
            ${product.featured ? '<div class="featured-badge">Featured</div>' : ''}
            ${product.stock <= 5 && product.stock > 0 ? '<div class="stock-badge">Low Stock</div>' : ''}
            ${product.stock <= 0 ? '<div class="stock-badge">Out of Stock</div>' : ''}
          </div>
          <div class="card-content">
            <h3 class="card-title">${product.name}</h3>
            <p class="card-description">${scent?.description || ''}</p>
            <div class="scent-details">
              <div class="scent-mood">Mood: ${scent?.mood || 'N/A'}</div>
              <div class="scent-strength">Strength: <span class="strength-bar">${'●'.repeat(Math.min(10, scent?.aggressiveness || 0)) + '○'.repeat(10 - Math.min(10, scent?.aggressiveness || 0))}</span></div>
              <div class="scent-price">${app.formatPrice(product.price)}</div>
            </div>
            <div class="product-actions">
              <button class="btn btn-outline btn-small" onclick="event.stopPropagation(); showProductDetails('${product.id}')">
                View
              </button>
              <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); addProductToCart('${product.id}')" 
                      ${product.stock <= 0 ? 'disabled' : ''}>
                Add
              </button>
            </div>
          </div>
        </div>
      `;
        <div class="product-card" onclick="showProductDetails('${product.id}')">
          <div class="product-image" style="background-image: url('${product.images[0]}')">
            ${product.featured ? '<div class="featured-badge">Featured</div>' : ''}
            ${product.stock <= 5 && product.stock > 0 ? '<div class="stock-badge">Low Stock</div>' : ''}
            ${product.stock <= 0 ? '<div class="stock-badge">Out of Stock</div>' : ''}
          </div>
          <div class="card-content">
            <h3 class="card-title">${product.name}</h3>
            <p class="card-description">${scent?.description || ''}</p>
            <div class="scent-details">
              <div class="scent-mood">Mood: ${scent?.mood || 'N/A'}</div>
              <div class="scent-strength">Strength: <span class="strength-bar">${'●'.repeat(Math.min(10, scent?.aggressiveness || 0)) + '○'.repeat(10 - Math.min(10, scent?.aggressiveness || 0))}</span></div>
              <div class="scent-price">${app.formatPrice(product.price)}</div>
            </div>
            <div class="product-actions">
              <button class="btn btn-outline btn-small" onclick="event.stopPropagation(); showProductDetails('${product.id}')">
                View
              </button>
              <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); addProductToCart('${product.id}')" 
                      ${product.stock <= 0 ? 'disabled' : ''}>
                Add
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="product-list-item" onclick="showProductDetails('${product.id}')">
          <div class="product-image" style="background-image: url('${product.images[0]}'); width: 120px; height: 80px; background-size: cover;">
          </div>
          <div class="product-info">
            <h3>${product.name}</h3>
            <p>${scent?.description || ''}</p>
            <div class="product-specs">
              <span>Size: ${size?.name || 'N/A'}</span>
              <span>Family: ${scent?.family || 'N/A'}</span>
              <span>Family: ${scent?.family || 'N/A'}</span>
              <span>Stock: ${product.stock}</span>
            </div>
          </div>
          <div class="product-price">
            <span class="price">${app.formatPrice(product.price)}</span>
          </div>
          <div class="product-actions">
            <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); addProductToCart('${product.id}')" 
            <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); addProductToCart('${product.id}')" 
                    ${product.stock <= 0 ? 'disabled' : ''}>
              ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      `;
        <div class="product-list-item" onclick="showProductDetails('${product.id}')">
          <div class="product-image" style="background-image: url('${product.images[0]}'); width: 120px; height: 80px; background-size: cover;">
          </div>
          <div class="product-info">
            <h3>${product.name}</h3>
            <p>${scent?.description || ''}</p>
            <div class="product-specs">
              <span>Size: ${size?.name || 'N/A'}</span>
              <span>Family: ${scent?.family || 'N/A'}</span>
              <span>Stock: ${product.stock}</span>
            </div>
          </div>
          <div class="product-price">
            <span class="price">${app.formatPrice(product.price)}</span>
          </div>
          <div class="product-actions">
            <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); addProductToCart('${product.id}')" 
                    ${product.stock <= 0 ? 'disabled' : ''}>
              ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      `;
        <div class="product-list-item" onclick="showProductDetails('${product.id}')">
          <div class="product-image" style="background-image: url('${product.images[0]}'); width: 120px; height: 80px; background-size: cover;">
          </div>
          <div class="product-info">
            <h3>${product.name}</h3>
            <p>${scent?.description || ''}</p>
            <div class="product-specs">
              <span>Size: ${size?.name || 'N/A'}</span>
              <span>Family: ${scent?.family || 'N/A'}</span>
              <span>Stock: ${product.stock}</span>
            </div>
          </div>
          <div class="product-price">
            <span class="price">${app.formatPrice(product.price)}</span>
          </div>
          <div class="product-actions">
            <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); addProductToCart('${product.id}')" 
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
  if (loadMoreSection) {
    const hasMore = filteredProducts.length > displayedProducts.length;
    loadMoreSection.style.display = hasMore ? 'block' : 'none';
  }
  if (loadMoreSection) {
    const hasMore = filteredProducts.length > displayedProducts.length;
    loadMoreSection.style.display = hasMore ? 'block' : 'none';
  }
=======
    const loadMoreSection = document.getElementById('load-more-section');
    if (loadMoreSection) loadMoreSection.style.display = filteredProducts.length > displayedProducts.length ? 'block' : 'none';
>>>>>>> caca705 (fized merge errors)
}

// Load more
function loadMoreProducts() {
    currentPage++;
    displayProducts();
}

// Update results count
function updateResultsCount() {
    const container = document.getElementById('results-count');
    if (!container) return;
    const total = filteredProducts.length;
    const showing = Math.min(displayedProducts.length, total);
    container.textContent = `Showing ${showing} of ${total} products`;
}

<<<<<<< HEAD
    function setView(viewType) {
      currentView = viewType;
      
      // Update view buttons
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      document.querySelector(`[data-view="${viewType}"]`).classList.add('active');
      
      displayProducts();
    }
=======
// Set view (grid/list)
function setView(viewType) {
    currentView = viewType;
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-view="${viewType}"]`)?.classList.add('active');
    displayProducts();
}
>>>>>>> caca705 (fized merge errors)

// Toggle filters sidebar
function toggleFilters() {
    const sidebar = document.getElementById('filters-sidebar');
    if (sidebar) sidebar.classList.toggle('active');
}

<<<<<<< HEAD
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
=======
// Clear all filters
function clearAllFilters() {
    document.querySelectorAll('.filter-checkbox input').forEach(cb => cb.checked = false);
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    if (priceMin) priceMin.value = 0;
    if (priceMax) priceMax.value = 100;
    updatePriceLabels();

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'featured';

    filteredProducts = [...allProducts];
    currentPage = 1;
    displayProducts();
    updateResultsCount();
}

// Show product details modal
function showProductDetails(productId) {
    const product = app.getProductById(productId);
    if (!product) return;

    const scent = app.getScentById(product.scentId);
    const size = app.getSizeById(product.sizeId);
    const color = app.getColorById(product.colorId);
    const containerObj = app.getContainerById(product.containerId);
    const wick = app.getWickById(product.wickId);

    const modalTitle = document.getElementById('product-modal-title');
    const modalBody = document.getElementById('product-modal-body');

    if (modalTitle) modalTitle.textContent = product.name;

    if (modalBody) {
        modalBody.innerHTML = `
        <div class="product-details-full">
            <div class="product-images">
                <img src="${product.images[0]}" alt="${product.name}" class="main-product-image" style="width:100%;border-radius:8px;">
            </div>
            <div class="product-info-full">
                <div class="product-price-full">
                    <span class="price-large">${app.formatPrice(product.price)}</span>
                    ${product.featured ? '<span class="featured-tag">Featured</span>' : ''}
                </div>
                <div class="product-description"><p>${scent?.description || 'Premium handcrafted candle'}</p></div>
                <div class="product-specifications">
                    <h4>Specifications</h4>
                    <div class="specs-grid">
                        ${scent ? `<div class="spec-item"><strong>Scent:</strong> ${scent.name}</div>` : ''}
                        ${color ? `<div class="spec-item"><strong>Color:</strong> ${color.name}</div>` : ''}
                        ${size ? `<div class="spec-item"><strong>Size:</strong> ${size.volume}</div>` : ''}
                        ${size ? `<div class="spec-item"><strong>Burn Time:</strong> ${size.burn_time}</div>` : ''}
                        ${containerObj ? `<div class="spec-item"><strong>Container:</strong> ${containerObj.name}</div>` : ''}
                        ${wick ? `<div class="spec-item"><strong>Wick:</strong> ${wick.name}</div>` : ''}
                        <div class="spec-item"><strong>Stock:</strong> ${product.stock} available</div>
                    </div>
                </div>
                ${scent ? `<div class="scent-details">
                    <h4>Scent Profile</h4>
                    <div class="scent-properties">
                        <div class="scent-mood">Mood: ${scent.mood}</div>
                        <div class="scent-strength">Strength: ${scent.aggressiveness}/10</div>
                        <div class="scent-category">Family: ${scent.family}</div>
                    </div>
                    <div class="scent-notes"><strong>Notes:</strong> ${scent.notes.map(note => `<span class="note-tag">${note}</span>`).join('')}</div>
                </div>` : ''}
                <div class="product-actions-full">
                    <div class="quantity-selector">
                        <label for="quantity">Quantity:</label>
                        <input type="number" id="quantity" min="1" max="${product.stock || 1}" value="1" class="form-input">
                    </div>
                    <button class="btn btn-primary btn-large" onclick="addProductToCart('${product.id}', document.getElementById('quantity').value)" ${product.stock <= 0 ? 'disabled' : ''}>
                        ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>`;
    }

    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }
}

// Add to cart
function addProductToCart(productId, quantity = 1) {
    const product = app.getProductById(productId);
    if (!product) return alert('Product not found');
    if (product.stock <= 0) return alert('Product is out of stock');

    const qty = Math.min(parseInt(quantity) || 1, product.stock);
    if (app.addToCart(productId, qty)) {
        alert(`Added ${qty} ${product.name} to cart`);
        updateCartCountDisplay();

        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    } else alert('Failed to add to cart');
}

// Update cart count
function updateCartCountDisplay() {
    try {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = Array.isArray(cart) ? cart.length : 0;
        document.querySelectorAll('#cart-count, #mobile-cart-count').forEach(el => el.textContent = count);
    } catch (err) {
        console.error('Failed to update cart count:', err);
    }
}
>>>>>>> caca705 (fized merge errors)
