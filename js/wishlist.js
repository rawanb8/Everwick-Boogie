$('document').ready(async function () {
    await app.loadData();
    renderWishlist();
});

function renderWishlist() {
    let $container = $('#wishlist-grid');
    let $emptyMessage = $('#empty-message');
    if ($container.length === 0 || $emptyMessage.length === 0) return;

    let wishlistIds = app.getWishlist();
    let products = wishlistIds
        .map(id => app.getProductById(id))
        .filter(p => p);

    if (products.length === 0) {
        $container.hide();
        $emptyMessage.show();
        return;
    }

    $container.css('display', 'grid');
    $emptyMessage.hide();

    let html = products.map(product => {
        let scent = app.getScentById(product.scentId);
        return `
        <div class="product-card">
            <div class="product-image" style="background-image: url('${product.images[0]}')">
                <button class="wishlist-btn active" onclick="removeFromWishlistPage('${product.id}')" title="Remove from Wishlist">
                    <i class="fa-solid fa-heart"></i>
                </button>
            </div>
            <div class="card-content">
                <h3 class="card-title">${product.name}</h3>
                <p class="card-description">${scent?.description || ''}</p>
                <div class="scent-details">
                    <div class="scent-price">${app.formatPrice(product.price)}</div>
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-small" onclick="addToCartFromWishlist(this, '${product.id}')" ${product.stock <= 0 ? 'disabled' : ''}>
                        ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');

    $container.html(html);
}

function removeFromWishlistPage(productId) {
    app.removeFromWishlist(productId);
    renderWishlist();
}

function addToCartFromWishlist(btnElement, productId) {
    if (app.addToCart(productId)) {
        // Visual feedback
        let originalText = btnElement.innerText;
        btnElement.innerText = 'Added';
        btnElement.disabled = true;

        setTimeout(() => {
            btnElement.innerText = originalText;
            btnElement.disabled = false;
        }, 2000);

        // Update cart count if needed
        let $cartCount = $('#cart-count');
        if ($cartCount.length) {
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            $cartCount.text(cart.length);
        }
    }
}
