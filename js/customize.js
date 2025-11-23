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

        let testImg = new Image();
        testImg.onload = function () {
            $combined.attr('src', path).removeClass('hidden').fadeIn(120);
            $base.addClass('hidden');
        };
        testImg.onerror = function () {
            let fallback = '/media/custom/candles/' + state.color + '-no-label.png';
            let fb = new Image();
            fb.onload = function () {
                $combined.attr('src', fallback).removeClass('hidden').fadeIn(120);
                $base.addClass('hidden');
            };
            fb.onerror = function () {
                $combined.addClass('hidden');
                $base.removeClass('hidden');
            };
            fb.src = fallback;
        };
        testImg.src = path;

        let labelName = (state.label === 'no-label') ? '' : (' — ' + (LABELS.find(l => l.slug === state.label) || {}).name || '');
        $('#preview-name').text(capitalizeWords(state.color.replace(/-/g, ' ')) + labelName);
        let s = scentsList.find(x => x.id === state.scentId);
        $('#preview-scent').text(s ? s.name : 'Choose a scent');

        updateReceipt();
    }

    function capitalizeWords(s) {
        return (s || '').toString().replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }

    // --- Price logic ---
    function updatePriceDisplay() {
        let basePrice = 0;
        let sizeObj = sizesList.find(sz => String(sz.id) === String(state.sizeId));
        if (sizeObj) basePrice = toNumber(sizeObj.price || 0);

        let containerExtra = 0;
        let containerObj = containersList.find(c => String(c.id) === String(state.containerId));
        if (containerObj) containerExtra = toNumber(containerObj.price_modifier || containerObj.price || 0);

        let wickExtra = 0;
        let wickObj = wicksList.find(w => String(w.id) === String(state.wickId));
        if (wickObj) wickExtra = toNumber(wickObj.price_modifier || wickObj.price || 0);

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

        DEFAULT_ADDITIONS.forEach(a => {
            let $btn = $('<button type="button" class="addition-toggle" aria-pressed="false"></button>');
            $btn.attr('data-key', a.key).attr('data-price', a.price).attr('title', a.name + ' (+$' + toNumber(a.price).toFixed(2) + ')');

            let svgPath = '/media/custom/additions/' + a.key + '.svg';
            let $img = $('<img class="addition-icon" alt="">').attr('src', svgPath).on('error', function () {
                let png = '/media/custom/additions/' + a.key + '.png';
                if ($(this).attr('src') !== png) $(this).attr('src', png);
            });

            $btn.append($img).append($('<span class="add-label" />').text(a.name));
            $btn.append($('<span class="add-price" />').text(' + $' + toNumber(a.price).toFixed(2)));

            $root.append($btn);
        });

        $root.find('.addition-toggle').each(function () {
            let k = $(this).data('key');
            if (state.additions.has(k)) $(this).addClass('active').attr('aria-pressed', 'true');
        });
    }

    function renderOtherControls() {
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

        let $containers = $('#containers');
        if ($containers.length) {
            $containers.empty();
            containersList.forEach(c => {
                let $b = $('<label class="container-item"></label>');
                let $radio = $('<input type="radio" name="container-select">')
                    .val(c.id)
                    .attr('data-price', c.price_modifier || c.price || 0);
                let $title = $('<div class="container-title" />').text(c.name);

                let priceText = (c.price_modifier || c.price || 0);
                let priceLabel = priceText ? ('+ $' + toNumber(priceText).toFixed(2)) : '';
                let descText = c.description ? (' • ' + c.description) : '';

                let $meta = $('<div class="container-meta small muted" />')
                    .text((priceLabel + (descText ? (descText) : '')).trim());

                $b.append($radio).append($title).append($meta);
                $containers.append($b);

                if (/classic/i.test(c.name)) $radio.prop('checked', true);
            });
        }

        let $wicks = $('#wicks');
        if ($wicks.length) {
            $wicks.empty();
            wicksList.forEach((w, idx) => {
                let $b = $('<label class="wick-item"></label>');
                let $radio = $('<input type="radio" name="wick-select" aria-label="' + (w.name || 'Wick') + '">')
                    .val(w.id)
                    .attr('data-price', w.price_modifier || w.price || 0);
                let $title = $('<div class="wick-title" />').text(w.name);

                let priceVal = (w.price_modifier || w.price || 0);
                let priceLabel = priceVal ? ('+ $' + toNumber(priceVal).toFixed(2)) : '';
                let descText = w.description || ('Burn quality: ' + (w.burn_quality || 'standard'));

                let $meta = $('<div class="container-meta small muted wick-meta" />').text(
                    (priceLabel ? (priceLabel + (descText ? (' • ' + descText) : '')) : descText)
                );

                $b.append($radio).append($title).append($meta);
                $wicks.append($b);

                if (idx === 0) $radio.prop('checked', true);
            });
        }
    }

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

    //compute total price
    function computeTotalPrice() {
        state.sizeId = $('input[name="size-select"]:checked').val() || state.sizeId;
        state.containerId = $('input[name="container-select"]:checked').val() || state.containerId;
        state.wickId = $('input[name="wick-select"]:checked').val() || state.wickId;

        let basePrice = 0;
        let sizeObj = sizesList.find(sz => String(sz.id) === String(state.sizeId));
        if (sizeObj) basePrice = toNumber(sizeObj.price || 0);

        let containerExtra = 0;
        let containerObj = containersList.find(c => String(c.id) === String(state.containerId));
        if (containerObj) containerExtra = toNumber(containerObj.price_modifier || containerObj.price || 0);

        let wickExtra = 0;
        let wickObj = wicksList.find(w => String(w.id) === String(state.wickId));
        if (wickObj) wickExtra = toNumber(wickObj.price_modifier || wickObj.price || 0);

        let additionsSum = 0;
        state.additions.forEach(k => {
            let a = DEFAULT_ADDITIONS.find(x => x.key === k);
            if (a) additionsSum += toNumber(a.price);
        });

        return basePrice + containerExtra + wickExtra + additionsSum;
    }

    //add to cart
    $(document).on('click', '#add-to-cart, #add-to-cart-bottom', function (e) {
        e.preventDefault();

        if (!state.label || state.label === 'no-label') {
            showLabelWarning('Please choose a label before adding to cart.', 4500);
            $('#labels').get(0)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        } else {
            hideLabelWarning();
        }

        state.sizeId = $('input[name="size-select"]:checked').val() || state.sizeId;
        state.containerId = $('input[name="container-select"]:checked').val() || state.containerId;
        state.wickId = $('input[name="wick-select"]:checked').val() || state.wickId;

        let price = computeTotalPrice();

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

        showAddToCartToast(name, price);
        setAddedButtonState($(this));
        $('#add-to-cart, #add-to-cart-bottom').not(this).each(function () { setAddedButtonState($(this)); });

        try { $(document).trigger('cart:updated'); } catch (e) { }
    });

    // show a left-column red warning using Font Awesome icon
    function showLabelWarning(message, duration = 4500) {
        // prefer existing element if present
        let $existing = $('#label-warning');
        let $root = $('.custom-controls').first();
        if (!$root.length) $root = $('body');

        if (!$existing.length) {
            $existing = $('<div id="label-warning" role="alert" aria-live="assertive"></div>');
        }

        //font awsome triangle warning
        const html = '<i class="fa-solid fa-triangle-exclamation warn-icon" aria-hidden="true"></i>' +
            '<span class="warn-text"></span>' +
            '<button class="warn-close" aria-label="Close warning">&times;</button>';

        $existing.html(html);
        $existing.find('.warn-text').text(message);

        // style / place it at top of left controls
        $existing.removeClass('hidden').addClass('left-warning');
        // ensure it appears as the first child in the controls column
        $root.prepend($existing);

        // show (allow animation frame to ensure transition)
        requestAnimationFrame(() => $existing.addClass('show'));

        // close handler
        $existing.find('.warn-close').off('click').on('click', function () {
            hideLabelWarning();
        });

        // auto-hide (clear previous)
        clearTimeout($existing.data('warnTid'));
        let tid = setTimeout(() => hideLabelWarning(), duration);
        $existing.data('warnTid', tid);
    }

    function hideLabelWarning() {
        let $existing = $('#label-warning');
        if (!$existing.length) return;
        $existing.removeClass('show');
        clearTimeout($existing.data('warnTid'));
        setTimeout(() => {
            $existing.addClass('hidden');
        }, 200); // let transition finish
    }


    // green toast message
    function showAddToCartToast(itemName, price) {
        let $region = $('.preview-details');
        if (!$region.length) $region = $('body');

        let $toast = $('#custom-add-toast');
        if (!$toast.length) {
            $toast = $('<div id="custom-add-toast" role="status"></div>');
            $region.prepend($toast);
        }

        $toast.stop(true, true)
            .removeClass('hide')
            .addClass('show')
            .html(
                '<strong>Added to cart</strong>' +
                '<div class="toast-sub">' + itemName + ' — $' + Number(price).toFixed(2) + '</div>'
            );

        clearTimeout($toast.data('timeoutId'));
        let tid = setTimeout(function () {
            $toast.removeClass('show').addClass('hide');
        }, 3000);
        $toast.data('timeoutId', tid);
    }

    // set button to "added" and reset after time delay
    function setAddedButtonState($btn, duration = 3000) {
        if (!$btn || !$btn.length) return;
        if (!$btn.data('orig-text')) $btn.data('orig-text', $btn.html());

        $btn.addClass('btn-added').attr('aria-pressed', 'true').prop('disabled', true);
        $btn.html('<i class="fa-solid fa-check" aria-hidden="true"></i> Added');

        clearTimeout($btn.data('revertTid'));
        let tid = setTimeout(() => {
            $btn.removeClass('btn-added').attr('aria-pressed', 'false').prop('disabled', false);
            $btn.html($btn.data('orig-text') || 'Add to cart');
        }, duration);
        $btn.data('revertTid', tid);
    }

    // receipt preview
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
        let s = sizesList.find(x => String(x.id) === String(state.sizeId));
        $('#rc-size').text(s ? s.name : '—');

        let c = containersList.find(x => String(x.id) === String(state.containerId));
        $('#rc-container').text(c ? c.name : '—');

        let w = wicksList.find(x => String(x.id) === String(state.wickId));
        $('#rc-wick').text(w ? w.name : '—');

        let names = Array.from(state.additions).map(k => {
            let a = DEFAULT_ADDITIONS.find(x => x.key === k);
            return a ? a.name : k;
        });
        $('#rc-additions').text(names.length ? names.join(', ') : 'None');
    }

    // load data from app & init
    $(function () {
        if (typeof app === 'undefined' || typeof app.loadData !== 'function') {
            console.debug('customize.js: app not available — rendering fallback UI (sizes/containers/wicks empty).');
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
                    let sorted = sizesList.slice().sort((a, b) => (toNumber(a.price) - toNumber(b.price)));
                    state.sizeId = sorted[0].id;
                }
            }

            if (!state.containerId && containersList.length) {
                let classic = containersList.find(x => /classic/i.test(x.name || ''));
                state.containerId = classic ? classic.id : containersList[0].id;
            }

            if (!state.wickId && wicksList.length) state.wickId = wicksList[0].id;
            if (!state.scentId && scentsList.length) state.scentId = scentsList[0].id;

            renderColorControls();
            renderLabelControls();
            renderAdditionsControls();
            renderOtherControls();

            if (state.sizeId) $('input[name="size-select"][value="' + state.sizeId + '"]').prop('checked', true);
            if (state.containerId) $('input[name="container-select"][value="' + state.containerId + '"]').prop('checked', true);
            if (state.wickId) $('input[name="wick-select"][value="' + state.wickId + '"]').prop('checked', true);
            if (state.scentId) $('#scent-select').val(state.scentId);

            updatePreviewImage();
            updatePreviewBurnTime();
            updatePriceDisplay();
            updateReceipt();

        }).catch(function (err) {
            console.error('app.loadData() failed in customize.js', err);
            renderColorControls();
            renderLabelControls();
            renderAdditionsControls();
            renderOtherControls();
            updatePreviewImage();
            updatePriceDisplay();
            updateReceipt();
        });
    });

})(jQuery);
