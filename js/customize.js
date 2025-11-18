(function ($) {
  // use IIFE with jQuery passed in
  'use strict';

  // --- Config / constants ---
  // The six colors you asked for (slug used in filenames)
  let COLORS = [
    { slug: 'pure-white', name: 'Pure White', hex: '#FFFFFF' },
    { slug: 'soft-pink', name: 'Soft Pink', hex: '#FFB6C1' },
    { slug: 'ocean-blue', name: 'Ocean Blue', hex: '#4682B4' },
    { slug: 'lavender', name: 'Lavender', hex: '#E6E6FA' },
    { slug: 'golden-yellow', name: 'Golden Yellow', hex: '#FFD700' },
    { slug: 'forest-green', name: 'Forest Green', hex: '#228B22' }
  ];

  // Available label options we will support (filename suffix)
  let LABELS = [
    { slug: 'no-label', name: 'No label' },
    { slug: 'label1', name: 'Label style 1' },
    { slug: 'label2', name: 'Label style 2' }
  ];

  // Additions default set (glitter $2 included)
  let DEFAULT_ADDITIONS = [
    { key: 'glitter', name: 'Glitter', price: 2 },
    { key: 'gold-flecks', name: 'Gold flecks', price: 3 },
    { key: 'dried-flowers', name: 'Dried flowers', price: 4 }
  ];

  // Image path pattern 
  // filenames: /media/custom/candles/{colorSlug}-{labelSlug}.png
  function candleImagePath(colorSlug, labelSlug) {
    colorSlug = (colorSlug || 'pure-white').toString();
    labelSlug = (labelSlug || 'none').toString();
    return '/media/custom/candles/' + colorSlug + '-' + labelSlug + '.png';
  }

  // Fallback base image -> if image not available display the base candke
  let BASE_IMAGE = '/media/custom/base-candle.png';

  // --- State ---
  let state = {
    color: 'pure-white',      // selected color slug
    label: 'none',            // 'none' | 'label1' | 'label2'
    scentId: null,
    sizeId: null,
    containerId: null,
    wickId: null,
    additions: new Set()
  };

  // Data loaded from app
  let sizesList = [];      // from app.data.size if present
  let containersList = []; // from app.data.container
  let wicksList = [];      // from app.data.wick
  let scentsList = [];     // app.scents

  // Safe number helper
  function toNumber(v) {
    let n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  // Update preview image: picks file by color + label
  function updatePreviewImage() {
    let path = candleImagePath(state.color, state.label);
    // set the main preview image (replace base candle with image we want)
    let $layerBase = $('#layer-base');
    if ($layerBase.length) {
      // attempt to load file and fallback to base image if missing
      // create temporary image to test existence
      let testImg = new Image();
      testImg.onload = function () {
        $layerBase.attr('src', path);
      };
      testImg.onerror = function () {
        // fallback: try color-none variant
        let fallback = '/media/custom/candles/' + state.color + '-none.png';
        let fb = new Image();
        fb.onload = function () {
          $layerBase.attr('src', fallback);
        };
        fb.onerror = function () {
          // ultimate fallback
          $layerBase.attr('src', BASE_IMAGE);
        };
        fb.src = fallback;
      };
      testImg.src = path;
    }

    // update preview text (name + scent)
    $('#preview-name').text((state.label === 'none' ? capitalizeWords(state.color.replace(/-/g,' ')) : (capitalizeWords(state.color.replace(/-/g,' ')) + ' — ' + LABELS.find(l=>l.slug===state.label).name)));
    let scentObj = scentsList.find(s => s.id === state.scentId) || null;
    $('#preview-scent').text(scentObj ? scentObj.name : 'Choose a scent');
  }

  // Capitalize helper
  function capitalizeWords(s) {
    return (s || '').toString().replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  // Recalculate price and write to #custom-price
  function updatePriceDisplay() {
    // base price from size
    let basePrice = 0;
    let sizeObj = sizesList.find(sz => String(sz.id) === String(state.sizeId));
    if (sizeObj) basePrice = toNumber(sizeObj.price || sizeObj.price || 0);

    // container price modifier (some JSON uses price_modifier)
    let containerExtra = 0;
    let containerObj = containersList.find(c => String(c.id) === String(state.containerId));
    if (containerObj) containerExtra = toNumber(containerObj.price_modifier || containerObj.price || 0);

    // wick price_modifier or price
    let wickExtra = 0;
    let wickObj = wicksList.find(w => String(w.id) === String(state.wickId));
    if (wickObj) wickExtra = toNumber(wickObj.price_modifier || wickObj.price || 0);

    // additions
    let additionsSum = 0;
    state.additions.forEach(k => {
      // try to find in DEFAULT_ADDITIONS
      let a = DEFAULT_ADDITIONS.find(x => x.key === k);
      if (a) additionsSum += toNumber(a.price);
    });

    let total = basePrice + containerExtra + wickExtra + additionsSum;
    // show price
    $('#custom-price').text('$' + total.toFixed(2));
  }

  // Render UI controls for colors
  function renderColorControls() {
    let $root = $('#colors');
    if (!$root.length) return;
    $root.empty();

    COLORS.forEach(c => {
      let $btn = $('<button type="button" class="color-option" aria-pressed="false"></button>');
      $btn.attr('data-color', c.slug);
      $btn.attr('title', c.name);
      $btn.css({
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        gap: '0.5rem',
        padding: '0.4rem',
        margin: '0.25rem',
        cursor: 'pointer',
        border: '1px solid transparent',
        'border-radius': '8px',
        'min-width': '110px',
        'background': 'var(--secondary-color)'
      });
      // inner content (color swatch + name)
      let $sw = $('<span class="color-swatch"></span>');
      $sw.css({
        width: '28px',
        height: '28px',
        'border-radius': '6px',
        display: 'inline-block',
        'background-color': c.hex,
        border: '1px solid rgba(0,0,0,0.06)'
      });
      let $lbl = $('<span class="color-name"></span>').text(c.name).css({ 'margin-left': '0.6rem' });
      $btn.append($sw).append($lbl);
      // attach
      $root.append($btn);
    });

    // initial active
    setActiveColorButton();
  }

  function setActiveColorButton() {
    $('#colors .color-option').each(function () {
      let $b = $(this);
      if ($b.data('color') === state.color) {
        $b.attr('aria-pressed', 'true').addClass('active');
      } else {
        $b.attr('aria-pressed', 'false').removeClass('active');
      }
    });
  }

  // Render label options
  function renderLabelControls() {
    let $root = $('#labels');
    if (!$root.length) return;
    $root.empty();

    LABELS.forEach(l => {
      let $btn = $('<button type="button" class="label-option" aria-pressed="false"></button>');
      $btn.attr('data-label', l.slug);
      $btn.text(l.name);
      $btn.css({
        padding: '0.4rem 0.6rem',
        margin: '0.25rem',
        cursor: 'pointer',
        borderRadius: '8px',
        background: 'var(--secondary-color)'
      });
      $root.append($btn);
    });

    setActiveLabelButton();
  }

  function setActiveLabelButton() {
    $('#labels .label-option').each(function () {
      let $b = $(this);
      if ($b.data('label') === state.label) {
        $b.attr('aria-pressed', 'true').addClass('active');
      } else {
        $b.attr('aria-pressed', 'false').removeClass('active');
      }
    });
  }

  // Render additions (use defaults)
  function renderAdditionsControls() {
    let $root = $('#additions');
    if (!$root.length) return;
    $root.empty();

    DEFAULT_ADDITIONS.forEach(a => {
      let $btn = $('<button type="button" class="addition-toggle" aria-pressed="false"></button>');
      $btn.attr('data-key', a.key);
      $btn.attr('data-price', a.price);
      $btn.html('<span class="add-label">' + a.name + '</span> <span class="add-price">+ $' + toNumber(a.price).toFixed(2) + '</span>');
      $btn.css({
        display: 'inline-flex',
        gap: '0.6rem',
        padding: '0.35rem 0.6rem',
        margin: '0.25rem',
        cursor: 'pointer',
        borderRadius: '8px',
        background: 'var(--secondary-color)'
      });
      $root.append($btn);
    });

    // set active for preselected
    $('#additions .addition-toggle').each(function () {
      let k = $(this).data('key');
      if (state.additions.has(k)) $(this).attr('aria-pressed', 'true');
    });
  }

  // Render sizes/containers/wicks selects from app.data if present
  function renderOtherControls() {
    // sizes into #sizes (radio list)
    let $sizesRoot = $('#sizes');
    if ($sizesRoot.length && sizesList.length) {
      $sizesRoot.empty();
      sizesList.forEach(sz => {
        let id = 'size-' + sz.id;
        let $label = $('<label style="display:block;margin:0.35rem 0;cursor:pointer"></label>');
        let $radio = $('<input type="radio" name="size-select">').val(sz.id).attr('data-price', sz.price || 0);
        $label.append($radio).append(' ' + (sz.name || sz.id) + ' — $' + toNumber(sz.price).toFixed(2));
        $sizesRoot.append($label);
      });
    }

    // containers
    let $containersRoot = $('#containers');
    if ($containersRoot.length && containersList.length) {
      $containersRoot.empty();
      containersList.forEach(c => {
        let $label = $('<label style="display:block;margin:0.35rem 0;cursor:pointer"></label>');
        let $radio = $('<input type="radio" name="container-select">').val(c.id).attr('data-price', c.price_modifier || c.price || 0);
        $label.append($radio).append(' ' + (c.name || c.id) + (c.price_modifier ? (' — +' + '$' + toNumber(c.price_modifier).toFixed(2)) : ''));
        $containersRoot.append($label);
      });
    }

    // wicks
    let $wicksRoot = $('#wicks');
    if ($wicksRoot.length && wicksList.length) {
      $wicksRoot.empty();
      wicksList.forEach(w => {
        let $label = $('<label style="display:block;margin:0.35rem 0;cursor:pointer"></label>');
        let $radio = $('<input type="radio" name="wick-select">').val(w.id).attr('data-price', w.price_modifier || w.price || 0);
        $label.append($radio).append(' ' + (w.name || w.id) + (w.price_modifier ? (' — +' + '$' + toNumber(w.price_modifier).toFixed(2)) : ''));
        $wicksRoot.append($label);
      });
    }

    // scents into select
    let $scentSelect = $('#scent-select');
    if ($scentSelect.length && scentsList.length) {
      $scentSelect.empty();
      $scentSelect.append($('<option value="">Choose scent</option>'));
      scentsList.forEach(s => {
        $scentSelect.append($('<option></option>').val(s.id).text(s.name));
      });
    }
  }

  // --- Event wiring ---

  // color click (delegated)
  $(document).on('click', '#colors .color-option', function () {
    let $btn = $(this);
    let selected = $btn.data('color');
    if (!selected) return;
    state.color = selected;
    setActiveColorButton();
    updatePreviewImage();
  });

  // label click
  $(document).on('click', '#labels .label-option', function () {
    let $btn = $(this);
    let selectedLabel = $btn.data('label');
    if (!selectedLabel) return;

    // if label chosen and color not explicitly chosen different than pure-white AND user hasn't chosen a color yet,
    // requirement: if label chosen before color then auto-select pure-white
    if (!state.color || state.color === '') {
      state.color = 'pure-white';
    }

    state.label = selectedLabel;
    setActiveLabelButton();
    // if label selected before color and color wasn't chosen -> set pure-white active visually
    setActiveColorButton();
    updatePreviewImage();
  });

  // additions toggle
  $(document).on('click', '#additions .addition-toggle', function () {
    let $btn = $(this);
    let key = $btn.data('key');
    if (!key) return;
    let pressed = $btn.attr('aria-pressed') === 'true';
    if (pressed) {
      $btn.attr('aria-pressed', 'false');
      state.additions.delete(key);
    } else {
      $btn.attr('aria-pressed', 'true');
      state.additions.add(key);
    }
    updatePriceDisplay();
    renderSelectedAdditionsText();
  });

  // sizes radio change
  $(document).on('change', 'input[name="size-select"]', function () {
    state.sizeId = $(this).val();
    updatePriceDisplay();
  });

  // container radio change
  $(document).on('change', 'input[name="container-select"]', function () {
    state.containerId = $(this).val();
    updatePriceDisplay();
  });

  // wick radio change
  $(document).on('change', 'input[name="wick-select"]', function () {
    state.wickId = $(this).val();
    updatePriceDisplay();
  });

  // scent select change
  $(document).on('change', '#scent-select', function () {
    let v = $(this).val();
    state.scentId = v ? Number(v) : null;
    updatePreviewImage();
  });

  // add-to-cart click
  $(document).on('click', '#add-to-cart', function (e) {
    e.preventDefault();

    // require user to choose a label before adding — per your request
    if (!state.label || state.label === 'none') {
      // show inline warning inside preview-details
      let $warn = $('#customize-warning');
      if (!$warn.length) {
        $warn = $('<div id="customize-warning" style="color:var(--error-color);margin-top:.5rem;font-weight:700">Please choose a label before adding to cart.</div>');
        $('.preview-details').append($warn);
      }
      // flash or focus label area
      $('#labels').get(0)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    } else {
      // remove warning if present
      $('#customize-warning').remove();
    }

    // calculate price to include in item record
    let priceText = $('#custom-price').text().replace(/[^0-9\.\-]/g, '');
    let price = toNumber(priceText);

    // determine image (the photo representing this configuration)
    let imgPath = candleImagePath(state.color, state.label);

    // build cart item
    let cartItem = {
      id: 'custom-' + Date.now(),
      name: (capitalizeWords(state.color.replace(/-/g,' ')) + (state.label !== 'none' ? (' — ' + LABELS.find(l => l.slug === state.label).name) : '')),
      price: price,
      qty: 1,
      image: imgPath,
      custom: {
        color: state.color,
        label: state.label,
        scentId: state.scentId,
        sizeId: state.sizeId,
        containerId: state.containerId,
        wickId: state.wickId,
        additions: Array.from(state.additions)
      }
    };

    // push to localStorage cart
    let cart = [];
    try {
      cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (!Array.isArray(cart)) cart = [];
    } catch (err) {
      cart = [];
    }
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));

    // simple user feedback
    alert('Added to cart: ' + cartItem.name + ' — $' + price.toFixed(2));
    // optionally redirect to cart or update cart counter
    try { $(document).trigger('cart:updated'); } catch (e) {}
  });

  // show selected additions text under preview
  function renderSelectedAdditionsText() {
    let $list = $('#preview-selected-additions');
    if (!$list.length) {
      $list = $('<div id="preview-selected-additions" class="preview-selected-additions"></div>');
      $('.preview-details').append($list);
    }
    let names = Array.from(state.additions).map(k => {
      let a = DEFAULT_ADDITIONS.find(x => x.key === k);
      return a ? a.name : k;
    });
    $list.text(names.length ? ('Additions: ' + names.join(', ')) : 'No additions selected');
  }

  // --- Initialization: load data (app) and render controls ---
  $(function () {
    // ensure app exists and is loaded
    if (typeof app === 'undefined' || typeof app.loadData !== 'function') {
      console.error('Global `app` object missing — customize.js requires main.js to be loaded first.');
      // still render static color/label/additions controls
      sizesList = [];
      containersList = [];
      wicksList = [];
      scentsList = [];
      renderColorControls();
      renderLabelControls();
      renderAdditionsControls();
      renderOtherControls();
      updatePreviewImage();
      updatePriceDisplay();
      renderSelectedAdditionsText();
      return;
    }

    // load data then render UI
    app.loadData().then(function () {
      // read lists from app.data (if available)
      sizesList = (app.data && Array.isArray(app.data.size)) ? app.data.size : (app.data && app.size ? app.size : []);
      containersList = (app.data && Array.isArray(app.data.container)) ? app.data.container : (app.data && app.container ? app.container : []);
      wicksList = (app.data && Array.isArray(app.data.wick)) ? app.data.wick : (app.data && app.wick ? app.wick : []);
      scentsList = Array.isArray(app.scents) ? app.scents : [];

      // default state selections (try to pick sensible defaults)
      if (!state.sizeId && sizesList.length) state.sizeId = sizesList[0].id;
      if (!state.containerId && containersList.length) state.containerId = containersList[0].id;
      if (!state.wickId && wicksList.length) state.wickId = wicksList[0].id;
      if (!state.scentId && scentsList.length) state.scentId = scentsList[0].id;

      // render controls
      renderColorControls();
      renderLabelControls();
      renderAdditionsControls();
      renderOtherControls();

      // pre-check radio inputs by state values
      if (state.sizeId) $('input[name="size-select"][value="' + state.sizeId + '"]').prop('checked', true);
      if (state.containerId) $('input[name="container-select"][value="' + state.containerId + '"]').prop('checked', true);
      if (state.wickId) $('input[name="wick-select"][value="' + state.wickId + '"]').prop('checked', true);
      if (state.scentId) $('#scent-select').val(state.scentId);

      // initial UI updates
      updatePreviewImage();
      updatePriceDisplay();
      renderSelectedAdditionsText();
    }).catch(function (err) {
      console.error('app.loadData() failed in customize.js', err);
      // still render minimal UI so dev can continue
      renderColorControls();
      renderLabelControls();
      renderAdditionsControls();
      renderOtherControls();
      updatePreviewImage();
      updatePriceDisplay();
      renderSelectedAdditionsText();
    });
  });

  // Expose some helpers for debugging / integration
  window.customizeState = state;
  window.getCustomizePrice = function () {
    // return numeric price currently displayed
    let raw = $('#custom-price').text().replace(/[^0-9\.]/g, '');
    return toNumber(raw);
  };

})(jQuery);
