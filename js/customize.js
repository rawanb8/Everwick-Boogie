(function () {
  'use strict';

  // small helpers
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));
  const slugify = s => String(s || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');

  // selectors used in HTML
  let selectors = {
    colors: '#colors',
    scentSelect: '#scent-select',
    sizes: '#sizes',
    containers: '#containers',
    wicks: '#wicks',
    labels: '#labels',
    additions: '#additions',
    price: '#custom-price',
    addToCartBtn: '#add-to-cart',
    preview: {
      base: '#layer-base',
      color: '#layer-color',
      label: '#layer-label',
      additions: '#layer-additions',
      name: '#preview-name',
      scent: '#preview-scent'
    }
  };

  // local mutable state
  let state = {
    color: null,
    scent: null,
    size: null,
    container: null,
    wick: null,
    labelStyle: null,
    additions: new Set()
  };

  // image paths based on image name that will be sluged to be added to path
  const IMAGE_PATHS = {
    base: '/media/custom/base-candle.png',
    colors: name => `/media/custom/colors/${slugify(name)}.png`,
    labels: name => `/media/custom/labels/${slugify(name)}.png`,
    additions: id => `/media/custom/additions/${slugify(id)}.png`
  };

  // adding to the catalogue custome additions 
  let AVAILABLE_ADDITIONS = [
    { id: 'dried-flowers', name: 'Dried flowers', price: 3 },
    { id: 'gold-fleck', name: 'Gold fleck', price: 2.5 },
    { id: 'glitter', name: 'Glitter', price: 2 }
  ];
// adding labels to the catalogue
  let LABEL_STYLES = [
    { id: 'minimal', name: 'Minimal' },
    { id: 'script', name: 'Script' },
    { id: 'stamp', name: 'Stamped' }
  ];

  // initialization after DOM load
  async function init() {
    if (typeof app === 'undefined' || typeof app.loadData !== 'function') {
      console.error('customize.js: global `app` with loadData() required.');
      return;
    }

    await app.loadData();

    let colors = Array.isArray(app.color) ? app.color : [];
    let scents = Array.isArray(app.scents) ? app.scents : [];
    let sizes = Array.isArray(app.size) ? app.size : [];
    let containers = Array.isArray(app.container) ? app.container : [];
    let wicks = Array.isArray(app.wick) ? app.wick : [];

    let colorsRoot = $(selectors.colors);
    let scentSelect = $(selectors.scentSelect);
    let sizesRoot = $(selectors.sizes);
    let containersRoot = $(selectors.containers);
    let wicksRoot = $(selectors.wicks);
    let labelsRoot = $(selectors.labels);
    let additionsRoot = $(selectors.additions);
    let addToCartBtn = $(selectors.addToCartBtn);
    let priceEl = $(selectors.price);

    if (!colorsRoot || !scentSelect || !sizesRoot || !containersRoot || !wicksRoot || !labelsRoot || !additionsRoot || !priceEl || !addToCartBtn) {
      console.error('customize.js: required DOM nodes missing.');
      return;
    }

    renderColors(colorsRoot, colors);
    renderScentSelect(scentSelect, scents);
    renderSizes(sizesRoot, sizes);
    renderContainers(containersRoot, containers);
    renderWicks(wicksRoot, wicks);
    renderLabelStyles(labelsRoot, LABEL_STYLES);
    renderAdditions(additionsRoot, AVAILABLE_ADDITIONS);

    // defaults
    state.color = colors[0] || null;
    state.scent = scents[0] || null;
    state.size = sizes[0] || null;
    state.container = containers[0] || null;
    state.wick = wicks[0] || null;
    state.labelStyle = LABEL_STYLES[0] || null;

    syncUIToState();

    // events
    scentSelect.addEventListener('change', (e) => {
      let id = e.target.value;
      state.scent = scents.find(s => String(s.id) === String(id)) || null;
      updatePreviewDetails();
    });

    addToCartBtn.addEventListener('click', handleAddToCart);

    // initial render
    updatePreview();
    updatePrice();
    updatePreviewDetails();
  }

  /* ---------- Render functions ---------- */

  function renderColors(root, colors) {
    root.innerHTML = '';
    if (!colors.length) {
      root.textContent = 'No colors available';
      return;
    }
    colors.forEach(c => {
      let btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'color-swatch';
      btn.dataset.colorId = c.id;
      btn.title = c.name;
      // visual swatch via background if hex present
      if (c.hex) btn.style.background = c.hex;
      btn.addEventListener('click', () => {
        state.color = c;
        $$('.color-swatch', root).forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        updatePreview();
        updatePrice();
      });
      root.appendChild(btn);
    });
  }

  function renderScentSelect(selectEl, scents) {
    selectEl.innerHTML = '';
    scents.forEach(s => {
      let opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name;
      selectEl.appendChild(opt);
    });
  }

  function renderSizes(root, sizes) {
    root.innerHTML = '';
    sizes.forEach(s => {
      let btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'size-option';
      btn.dataset.sizeId = s.id;
      btn.textContent = `${s.name} (${s.volume || ''}) - ${formatCurrency(s.price)}`;
      btn.addEventListener('click', () => {
        state.size = s;
        $$('.size-option', root).forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        updatePrice();
      });
      root.appendChild(btn);
    });
  }

  function renderContainers(root, containers) {
    root.innerHTML = '';
    containers.forEach(c => {
      let btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'container-option';
      btn.dataset.containerId = c.id;
      let priceMod = c.price_modifier || 0;
      btn.textContent = priceMod ? `${c.name} (+${formatCurrency(priceMod)})` : c.name;
      btn.addEventListener('click', () => {
        state.container = c;
        $$('.container-option', root).forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        updatePrice();
      });
      root.appendChild(btn);
    });
  }

  function renderWicks(root, wicks) {
    root.innerHTML = '';
    wicks.forEach(w => {
      let btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wick-option';
      btn.dataset.wickId = w.id;
      let priceMod = w.price_modifier || 0;
      btn.textContent = priceMod ? `${w.name} (+${formatCurrency(priceMod)})` : w.name;
      btn.addEventListener('click', () => {
        state.wick = w;
        $$('.wick-option', root).forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        updatePrice();
      });
      root.appendChild(btn);
    });
  }

  function renderLabelStyles(root, labelStyles) {
    root.innerHTML = '';
    labelStyles.forEach(l => {
      let btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'label-option';
      btn.dataset.labelId = l.id;
      btn.textContent = l.name;
      btn.addEventListener('click', () => {
        state.labelStyle = l;
        $$('.label-option', root).forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        updatePreview();
      });
      root.appendChild(btn);
    });
  }

  function renderAdditions(root, additions) {
    root.innerHTML = '';
    additions.forEach(a => {
      let wrapper = document.createElement('div');
      wrapper.className = 'addition-item';
      let chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.id = `add-${a.id}`;
      chk.dataset.addId = a.id;
      let label = document.createElement('label');
      label.htmlFor = chk.id;
      label.textContent = `${a.name} (+${formatCurrency(a.price)})`;
      chk.addEventListener('change', () => {
        if (chk.checked) state.additions.add(a.id);
        else state.additions.delete(a.id);
        updatePreview();
        updatePrice();
      });
      wrapper.appendChild(chk);
      wrapper.appendChild(label);
      root.appendChild(wrapper);
    });
  }

  /* ---------- Preview & pricing ---------- */

  function syncUIToState() {
    $$('.color-swatch').forEach(b => b.classList.toggle('active', String(b.dataset.colorId) === String(state.color && state.color.id)));
    let scentSelect = $(selectors.scentSelect);
    if (state.scent && scentSelect) scentSelect.value = state.scent.id;
    $$('.size-option').forEach(b => b.classList.toggle('active', String(b.dataset.sizeId) === String(state.size && state.size.id)));
    $$('.container-option').forEach(b => b.classList.toggle('active', String(b.dataset.containerId) === String(state.container && state.container.id)));
    $$('.wick-option').forEach(b => b.classList.toggle('active', String(b.dataset.wickId) === String(state.wick && state.wick.id)));
    $$('.label-option').forEach(b => b.classList.toggle('active', String(b.dataset.labelId) === String(state.labelStyle && state.labelStyle.id)));
    AVAILABLE_ADDITIONS.forEach(a => {
      let cb = document.getElementById(`add-${a.id}`);
      if (cb) cb.checked = state.additions.has(a.id);
    });
  }

  function updatePreviewDetails() {
    let nameEl = $(selectors.preview.name);
    let scentEl = $(selectors.preview.scent);
    if (nameEl) nameEl.textContent = state.scent ? `${state.scent.name} Candle` : 'Custom Candle';
    if (scentEl) scentEl.textContent = state.scent ? state.scent.description || state.scent.name : 'Choose a scent';
  }

  function updatePreview() {
    let base = $(selectors.preview.base);
    let colorLayer = $(selectors.preview.color);
    let labelLayer = $(selectors.preview.label);
    let additionsLayer = $(selectors.preview.additions);

    if (base) base.src = IMAGE_PATHS.base;

    if (state.color && colorLayer) {
      colorLayer.src = IMAGE_PATHS.colors(state.color.name);
      colorLayer.alt = state.color.name;
      colorLayer.style.display = 'block';
    } else if (colorLayer) {
      colorLayer.src = '';
      colorLayer.style.display = 'none';
    }

    if (state.labelStyle && labelLayer) {
      labelLayer.src = IMAGE_PATHS.labels(state.labelStyle.name);
      labelLayer.alt = state.labelStyle.name;
      labelLayer.style.display = 'block';
    } else if (labelLayer) {
      labelLayer.src = '';
      labelLayer.style.display = 'none';
    }

    if (additionsLayer) {
      let chosen = Array.from(state.additions)[0];
      if (chosen) {
        additionsLayer.src = IMAGE_PATHS.additions(chosen);
        additionsLayer.alt = chosen;
        additionsLayer.style.display = 'block';
      } else {
        additionsLayer.src = '';
        additionsLayer.style.display = 'none';
      }
    }

    updatePreviewDetails();
  }

  function updatePrice() {
    let total = 0;
    if (state.size && typeof state.size.price === 'number') total += Number(state.size.price);
    if (state.container && typeof state.container.price_modifier === 'number') total += Number(state.container.price_modifier || 0);
    if (state.wick && typeof state.wick.price_modifier === 'number') total += Number(state.wick.price_modifier || 0);
    if (state.color && typeof state.color.price_modifier === 'number') total += Number(state.color.price_modifier || 0);

    AVAILABLE_ADDITIONS.forEach(a => {
      if (state.additions.has(a.id)) total += Number(a.price || 0);
    });

    let priceEl = $(selectors.price);
    if (priceEl) priceEl.textContent = formatCurrency(total);
  }

  function formatCurrency(n) {
    return (typeof n === 'number' ? n : Number(n || 0)).toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
  }

  /* ---------- Cart ---------- */

  function handleAddToCart() {
    let priceText = $(selectors.price).textContent;
    let priceVal = parseFloat(String(priceText || '').replace(/[^0-9.-]+/g, '')) || 0;

    let cartItem = {
      id: `custom-${Date.now()}`,
      type: 'custom-candle',
      name: state.scent ? `${state.scent.name} (custom)` : 'Custom candle',
      options: {
        color: state.color ? { id: state.color.id, name: state.color.name } : null,
        scent: state.scent ? { id: state.scent.id, name: state.scent.name } : null,
        size: state.size ? { id: state.size.id, name: state.size.name } : null,
        container: state.container ? { id: state.container.id, name: state.container.name } : null,
        wick: state.wick ? { id: state.wick.id, name: state.wick.name } : null,
        labelStyle: state.labelStyle ? { id: state.labelStyle.id, name: state.labelStyle.name } : null,
        additions: Array.from(state.additions)
      },
      price: priceVal,
      qty: 1,
      preview: {
        base: IMAGE_PATHS.base,
        colorImg: state.color ? IMAGE_PATHS.colors(state.color.name) : null,
        labelImg: state.labelStyle ? IMAGE_PATHS.labels(state.labelStyle.name) : null,
        additionsImg: Array.from(state.additions)[0] ? IMAGE_PATHS.additions(Array.from(state.additions)[0]) : null
      }
    };

    try {
      let raw = localStorage.getItem('cart') || '[]';
      let cart = JSON.parse(raw);
      cart.push(cartItem);
      localStorage.setItem('cart', JSON.stringify(cart));
      let addBtn = $(selectors.addToCartBtn);
      if (addBtn) {
        addBtn.textContent = 'Added ✓';
        addBtn.disabled = true;
        setTimeout(() => { addBtn.textContent = 'Add to cart'; addBtn.disabled = false; }, 900);
      }
      if (typeof updateCartCount === 'function') updateCartCount();
    } catch (err) {
      console.error('Failed to add to cart', err);
      alert('Could not add to cart. Try again.');
    }
  }

  // start
  document.addEventListener('DOMContentLoaded', init);
})();
