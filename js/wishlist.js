document.addEventListener('DOMContentLoaded', async () => {
    await app.loadData();
    renderWishlist();
});

function renderWishlist() {
    const container = document.getElementById('wishlist-grid');
    const emptyMessage = document.getElementById('empty-message');
    if (!container || !emptyMessage) return;

    const wishlistIds = app.getWishlist();
    const products = wishlistIds.map(id => app.getProductById(id)).filter(p => p);

    if (products.length === 0) {
        container.style.display = 'none';
        emptyMessage.style.display = 'block';
        return;
    }

    container.style.display = 'grid';
    emptyMessage.style.display = 'none';

    container.innerHTML = products.map(product => {
        const scent = app.getScentById(product.scentId);
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
                    <button class="btn btn-primary btn-small" onclick="moveToCart('${product.id}')" ${product.stock <= 0 ? 'disabled' : ''}>
                        ${product.stock > 0 ? 'Move to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
}

function removeFromWishlistPage(productId) {
    if (confirm('Remove this item from your wishlist?')) {
        app.removeFromWishlist(productId);
        renderWishlist();
    }
}

function moveToCart(productId) {
    if (app.addToCart(productId)) {
        app.removeFromWishlist(productId);
        renderWishlist();
        alert('Moved to cart!');
        // Update cart count if needed (main.js handles storage event usually)
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            cartCount.textContent = cart.length;
        }
    }
}
