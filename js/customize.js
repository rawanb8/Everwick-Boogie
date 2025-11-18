(function ($) {
    'use strict';

    // --- Config / constants ---
    let COLORS = [
        { slug: 'pure-white', name: 'Pure White', hex: '#FFFFFF' },
        { slug: 'soft-pink', name: 'Soft Pink', hex: '#FFB6C1' },
        { slug: 'ocean-blue', name: 'Ocean Blue', hex: '#4682B4' },
        { slug: 'lavender', name: 'Lavender', hex: '#E6E6FA' },
        { slug: 'golden-yellow', name: 'Golden Yellow', hex: '#FFD700' },
        { slug: 'forest-green', name: 'Forest Green', hex: '#228B22' }
    ];

    let LABELS = [
        { slug: 'no-label', name: 'No label' },
        { slug: 'label1', name: 'Label style 1' },
        { slug: 'label2', name: 'Label style 2' }
    ];

    let DEFAULT_ADDITIONS = [
        { key: 'glitter', name: 'Glitter', price: 2 },
        { key: 'gold-flecks', name: 'Gold flecks', price: 3 },
        { key: 'dried-flowers', name: 'Dried flowers', price: 4 }
    ];

    function candleImagePath(colorSlug, labelSlug) {
        colorSlug = (colorSlug || 'pure-white').toString();
        labelSlug = (labelSlug || 'no-label').toString();
        return '/media/custom/candles/' + colorSlug + '-' + labelSlug + '.png';
    }

    let BASE_IMAGE = '/media/custom/base-candle.png';

    // --- State ---
    let state = {
        color: 'pure-white',
        label: 'no-label',
        scentId: null,
        sizeId: null,
        containerId: null,
        wickId: null,
        additions: new Set()
    };

    // Data lists (filled from app.data)
    let sizesList = [];
    let containersList = [];
    let wicksList = [];
    let scentsList = [];

    function toNumber(v) {
        let n = Number(v);
        return Number.isFinite(n) ? n : 0;
    }

    // --- Preview updates ---
    function updatePreviewImage() {
        let path = candleImagePath(state.color, state.label);
        let $base = $('#layer-base');
        let $combined = $('#layer-combined');

        // try to load requested combined image (color+label). If loads, show it; otherwise show base.
        let testImg = new Image();
        testImg.onload = function () {
            $combined.attr('src', path).removeClass('hidden').fadeIn(120);
            $base.addClass('hidden');
        };
        testImg.onerror = function () {
            // fallback: try color + no-label
            let fallback = '/media/custom/candles/' + state.color + '-no-label.png';
            let fb = new Image();
            fb.onload = function () {
                $combined.attr('src', fallback).removeClass('hidden').fadeIn(120);
                $base.addClass('hidden');
            };
            fb.onerror = function () {
                // ultimate: show base
                $combined.addClass('hidden');
                $base.removeClass('hidden');
            };
            fb.src = fallback;
        };
        testImg.src = path;

        // text updates
        let labelName = (state.label === 'no-label') ? '' : (' — ' + (LABELS.find(l => l.slug === state.label) || {}).name || '');
        $('#preview-name').text(capitalizeWords(state.color.replace(/-/g, ' ')) + labelName);
        let s = scentsList.find(x => x.id === state.scentId);
        $('#preview-scent').text(s ? s.name : 'Choose a scent');

        // update receipt visuals
        updateReceipt();
    }

    function capitalizeWords(s) {
        return (s || '').toString().replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }

    // --- Price logic ---
    function updatePriceDisplay() {
        // size base price
        let basePrice = 0;
        let sizeObj = sizesList.find(sz => String(sz.id) === String(state.sizeId));
        if (sizeObj) basePrice = toNumber(sizeObj.price || 0);

        // container extra
        let containerExtra = 0;
        let containerObj = containersList.find(c => String(c.id) === String(state.containerId));
        if (containerObj) containerExtra = toNumber(containerObj.price_modifier || containerObj.price || 0);

        // wick extra
        let wickExtra = 0;
        let wickObj = wicksList.find(w => String(w.id) === String(state.wickId));
        if (wickObj) wickExtra = toNumber(wickObj.price_modifier || wickObj.price || 0);

        // additions sum
        let additionsSum = 0;
        state.additions.forEach(k => {
            let a = DEFAULT_ADDITIONS.find(x => x.key === k);
            if (a) additionsSum += toNumber(a.price);
        });

        let total = basePrice + containerExtra + wickExtra + additionsSum;
        $('#custom-price').text('$' + total.toFixed(2));
        $('#rc-total').text('$' + total.toFixed(2));
    }

    // --- Render controls ---
    function renderColorControls() {
        let $root = $('#colors');
        if (!$root.length) return;
        $root.empty();

        COLORS.forEach(c => {
            let $b = $('<button type="button" class="color-option" aria-pressed="false"></button>');
            $b.attr('data-color', c.slug).attr('title', c.name);
            $b.append($('<span class="swatch" />').css('background-color', c.hex));
            $b.append($('<span class="cname" />').text(c.name));
            $root.append($b);
        });
        setActiveColorButton();
    }

    function setActiveColorButton() {
        $('#colors .color-option').each(function () {
            let $t = $(this);
            if ($t.data('color') === state.color) {
                $t.addClass('active').attr('aria-pressed', 'true');
            } else {
                $t.removeClass('active').attr('aria-pressed', 'false');
            }
        });
    }

    function renderLabelControls() {
        let $root = $('#labels');
        if (!$root.length) return;
        $root.empty();
        LABELS.forEach(l => {
            let $b = $('<button type="button" class="label-option" aria-pressed="false"></button>');
            $b.attr('data-label', l.slug).text(l.name);
            $root.append($b);
        });
        setActiveLabelButton();
    }

    function setActiveLabelButton() {
        $('#labels .label-option').each(function () {
            let $t = $(this);
            if ($t.data('label') === state.label) $t.addClass('active').attr('aria-pressed', 'true');
            else $t.removeClass('active').attr('aria-pressed', 'false');
        });
    }

    function renderAdditionsControls() {
        let $root = $('#additions');
        if (!$root.length) return;
        $root.empty();

        let PLACEHOLDER_SVG = '/media/custom/additions/placeholder.svg';

        DEFAULT_ADDITIONS.forEach(a => {
            let $btn = $('<button type="button" class="addition-toggle" aria-pressed="false"></button>');
            $btn.attr('data-key', a.key).attr('data-price', a.price).attr('title', a.name + ' (+$' + toNumber(a.price).toFixed(2) + ')');

            let svgPath = '/media/custom/additions/' + a.key + '.svg';
            let $img = $('<img class="addition-icon" alt="">').attr('src', svgPath).on('error', function () {
                // fallback to png if svg missing
                let png = '/media/custom/additions/' + a.key + '.png';
                if ($(this).attr('src') !== png) $(this).attr('src', png);
            });

            $btn.append($img).append($('<span class="add-label" />').text(a.name));
            $btn.append($('<span class="add-price" />').text(' + $' + toNumber(a.price).toFixed(2)));

            $root.append($btn);
        });

        // restore pressed state if already in state
        $root.find('.addition-toggle').each(function () {
            let k = $(this).data('key');
            if (state.additions.has(k)) $(this).addClass('active').attr('aria-pressed', 'true');
        });
    }

    function renderOtherControls() {
        // --- Sizes ---
        let $sizes = $('#sizes');
        if ($sizes.length) {
            $sizes.empty();
            sizesList.forEach(sz => {
                let $b = $('<label class="size-item"></label>');
                let $radio = $('<input type="radio" name="size-select">')
                    .val(sz.id)
                    .attr('data-price', sz.price || 0);
                let $title = $('<div class="size-title" />').text(sz.name + ' ');
                let $meta = $('<div class="size-meta small muted" />')
                    .text('$' + toNumber(sz.price).toFixed(2) + ' • ' + (sz.volume || ''));
                $b.append($radio).append($title).append($meta);
                $sizes.append($b);

                if (/small/i.test(sz.name)) $radio.prop('checked', true);
            });
        }

        // containers
        let $containers = $('#containers');
        if ($containers.length) {
            $containers.empty();
            containersList.forEach(c => {
                let $b = $('<label class="container-item"></label>');
                let priceText = c.price_modifier ? (' + $' + toNumber(c.price_modifier).toFixed(2)) : '';
                let $radio = $('<input type="radio" name="container-select">')
                    .val(c.id)
                    .attr('data-price', c.price_modifier || c.price || 0);
                let $title = $('<div class="container-title" />').text(c.name + (priceText ? (' — ' + priceText) : ''));
                $b.append($radio).append($title);
                $containers.append($b);

                // Default selection
                if (/classic/i.test(c.name)) $radio.prop('checked', true);
            });
        }

        // wicks (creative display with description)
        let $wicks = $('#wicks');
        if ($wicks.length) {
            $wicks.empty();
            wicksList.forEach((w, idx) => {
                let $b = $('<label class="wick-item"></label>');
                let $radio = $('<input type="radio" name="wick-select">')
                    .val(w.id)
                    .attr('data-price', w.price_modifier || w.price || 0);
                let $wrap = $('<div class="wick-wrap"></div>');
                let $title = $('<div class="wick-title" />')
                    .text(w.name + (w.price_modifier ? (' • +$' + toNumber(w.price_modifier).toFixed(2)) : ''));
                let $desc = $('<div class="wick-desc small muted" />')
                    .text(w.description || ('Burn quality: ' + (w.burn_quality || 'standard')));
                $wrap.append($title).append($desc);
                $b.append($radio).append($wrap);
                $wicks.append($b);

                // Default selection: first wick
                if (idx === 0) $radio.prop('checked', true);
            });
        }

        // scents select already handled in renderOtherControls caller
    }

    // Trigger initial state update
    // state.sizeId = $('input[name="size-select"]:checked').val();
    // state.containerId = $('input[name="container-select"]:checked').val();
    // state.wickId = $('input[name="wick-select"]:checked').val();
    // updatePriceDisplay();
    // updatePreviewBurnTime();
    // updateReceipt();

    // --- Events ---
    $(document).on('click', '#colors .color-option', function () {
        let selected = $(this).data('color');
        if (!selected) return;
        state.color = selected;
        setActiveColorButton();
        updatePreviewImage();
    });

    $(document).on('click', '#labels .label-option', function () {
        let selected = $(this).data('label');
        if (!selected) return;
        // if label chosen before color, ensure color default stays pure-white
        if (!state.color) state.color = 'pure-white';
        state.label = selected;
        setActiveLabelButton();
        setActiveColorButton();
        updatePreviewImage();
    });

    $(document).on('click', '#additions .addition-toggle', function () {
        let key = $(this).data('key');
        if (!key) return;
        let pressed = $(this).attr('aria-pressed') === 'true' || $(this).hasClass('active');
        if (pressed) {
            $(this).removeClass('active').attr('aria-pressed', 'false');
            state.additions.delete(key);
        } else {
            $(this).addClass('active').attr('aria-pressed', 'true');
            state.additions.add(key);
        }
        updatePriceDisplay();
        updateReceipt();
    });

    $(document).on('change', 'input[name="size-select"]', function () {
        state.sizeId = $(this).val();
        // update preview meta (burn time)
        updatePreviewBurnTime();
        updatePriceDisplay();
        updateReceipt();
    });

    $(document).on('change', 'input[name="container-select"]', function () {
        state.containerId = $(this).val();
        updatePriceDisplay();
        updateReceipt();
    });

    $(document).on('change', 'input[name="wick-select"]', function () {
        state.wickId = $(this).val();
        updatePriceDisplay();
        updateReceipt();
    });

    $(document).on('change', '#scent-select', function () {
        let v = $(this).val();
        state.scentId = v ? Number(v) : null;
        updatePreviewImage();
    });

    // Add-to-cart (top and bottom buttons)
    $(document).on('click', '#add-to-cart, #add-to-cart-bottom', function (e) {
        e.preventDefault();
        // require label
        if (!state.label || state.label === 'no-label') {
            $('#label-warning').removeClass('hidden').text('Please choose a label before adding to cart.');
            $('#labels').get(0)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        } else {
            $('#label-warning').addClass('hidden').text('');
        }

        // compute price and build item
        let priceText = $('#custom-price').text().replace(/[^0-9\.]/g, '');
        let price = toNumber(priceText);
        let img = candleImagePath(state.color, state.label);

        let name = capitalizeWords(state.color.replace(/-/g, ' ')) + (state.label !== 'no-label' ? (' — ' + (LABELS.find(l => l.slug === state.label) || {}).name) : '');

        let cartItem = {
            id: 'custom-' + Date.now(),
            name: name,
            price: price,
            qty: 1,
            image: img,
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

        let cart = [];
        try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); if (!Array.isArray(cart)) cart = []; } catch (err) { cart = []; }
        cart.push(cartItem);
        localStorage.setItem('cart', JSON.stringify(cart));

        alert('Added to cart: ' + cartItem.name + ' — $' + price.toFixed(2));
        try { $(document).trigger('cart:updated'); } catch (e) { }
    });

    // --- Receipt & preview burn time helpers ---
    function updatePreviewBurnTime() {
        let s = sizesList.find(x => String(x.id) === String(state.sizeId));
        if (s) {
            $('#preview-size-text').text((s.name || 'Size') + ' • ' + (s.volume || ''));
            $('#preview-burning').text('Burn time: ' + (s.burn_time || '—'));
            $('#rc-size').text((s.name || '—'));
        } else {
            $('#preview-size-text').text('Size: —');
            $('#preview-burning').text('Burn time: —');
            $('#rc-size').text('—');
        }
    }

    function updateReceipt() {
        // size
        let s = sizesList.find(x => String(x.id) === String(state.sizeId));
        $('#rc-size').text(s ? s.name : '—');

        // container
        let c = containersList.find(x => String(x.id) === String(state.containerId));
        $('#rc-container').text(c ? c.name : '—');

        // wick
        let w = wicksList.find(x => String(x.id) === String(state.wickId));
        $('#rc-wick').text(w ? w.name : '—');

        // additions
        let names = Array.from(state.additions).map(k => {
            let a = DEFAULT_ADDITIONS.find(x => x.key === k);
            return a ? a.name : k;
        });
        $('#rc-additions').text(names.length ? names.join(', ') : 'None');

        // total already updated by updatePriceDisplay
    }

    // --- Init: load data from app ====
    $(function () {
        // fallback render if app isn't there
        if (typeof app === 'undefined' || typeof app.loadData !== 'function') {
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
            return;
        }

        app.loadData().then(function () {
            // load lists from app.data
            sizesList = Array.isArray(app.sizes) ? app.sizes : [];
            containersList = Array.isArray(app.containers) ? app.containers : [];
            wicksList = Array.isArray(app.wicks) ? app.wicks : [];
            scentsList = Array.isArray(app.scents) ? app.scents : [];

            let $scent = $('#scent-select');
            if ($scent.length && scentsList.length) {
                $scent.empty();
                scentsList.forEach(s => {
                    $scent.append($('<option/>').val(s.id).text(s.name));
                });
                state.scentId = state.scentId || scentsList[0].id;
                $scent.val(state.scentId);
            }

            if (!state.sizeId && sizesList.length) {
                let small = sizesList.find(x => String(x.name || '').toLowerCase().includes('small'));
                if (small) state.sizeId = small.id;
                else {
                    // fallback choose smallest price
                    let sorted = sizesList.slice().sort((a, b) => (toNumber(a.price) - toNumber(b.price)));
                    state.sizeId = sorted[0].id;
                }
            }

            // container default: prefer 'Classic Glass Jar' or first
            if (!state.containerId && containersList.length) {
                let classic = containersList.find(x => /classic/i.test(x.name || ''));
                state.containerId = classic ? classic.id : containersList[0].id;
            }

            // wick default: first available
            if (!state.wickId && wicksList.length) state.wickId = wicksList[0].id;

            // scent default: first available
            if (!state.scentId && scentsList.length) state.scentId = scentsList[0].id;

            // render UI
            renderColorControls();
            renderLabelControls();
            renderAdditionsControls();
            renderOtherControls();

            // pre-select radio inputs visually
            if (state.sizeId) $('input[name="size-select"][value="' + state.sizeId + '"]').prop('checked', true);
            if (state.containerId) $('input[name="container-select"][value="' + state.containerId + '"]').prop('checked', true);
            if (state.wickId) $('input[name="wick-select"][value="' + state.wickId + '"]').prop('checked', true);
            if (state.scentId) $('#scent-select').val(state.scentId);

            // initial updates
            updatePreviewImage();
            updatePreviewBurnTime();
            updatePriceDisplay();
            updateReceipt();
        }).catch(function (err) {
            console.error('app.loadData() failed in customize.js', err);
            // still render minimal interface
            renderColorControls();
            renderLabelControls();
            renderAdditionsControls();
            renderOtherControls();
            updatePreviewImage();
            updatePriceDisplay();
            updateReceipt();
        });
    });

    // expose for debugging
    window.customizeState = state;
    window.getCustomizePrice = function () {
        let raw = $('#custom-price').text().replace(/[^0-9\.]/g, '');
        return toNumber(raw);
    };

})(jQuery);
