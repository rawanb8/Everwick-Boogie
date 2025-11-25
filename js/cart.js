// Checkout functionality
let currentCheckoutStep = 0;
let selectedShippingMethod = null;
let orderData = {};

const checkoutSteps = ['cart', 'shipping', 'payment', 'confirmation'];
const shippingOptions = [
  { id: 1, name: 'Standard Shipping', price: 5.99, time: '5-7 business days', freeThreshold: 50 },
  { id: 2, name: 'Express Shipping', price: 12.99, time: '2-3 business days', freeThreshold: 100 },
  { id: 3, name: 'Overnight Shipping', price: 24.99, time: 'Next business day', freeThreshold: 150 }
];

document.addEventListener('DOMContentLoaded', async () => {
  await app.loadData();
  
  // Check if cart is empty
  const cart = app.getCart();
  if (cart.length === 0) {
    redirectToShop();
    return;
  }
  
  initializeCheckout();
});

function redirectToShop() {
  app.showNotification('Your cart is empty. Redirecting to shop...', 'info');
  setTimeout(() => {
    window.location.href = 'shop.html';
  }, 2000);
}

function initializeCheckout() {
  loadCartReview();
  loadOrderSummary();
  loadShippingOptions();
  setupFormValidation();
  updateCheckoutProgress();
}

function loadCartReview() {
  const container = document.getElementById('cart-review');
  const cart = app.getCart();
  
  if (cart.length === 0) {
    container.innerHTML = '<p class="text-center">Your cart is empty.</p>';
    return;
  }
  
  container.innerHTML = cart.map(item => {
    const product = app.getProductById(item.productId);
    if (!product) return '';
    
    const scent = app.getScentById(product.scentId);
    const itemQuantity = parseInt(item.quantity) || 1;
    // Use product price if item price is 0 or missing
    const itemPrice = parseFloat(item.price) || parseFloat(product.price) || 0;
    const itemTotal = itemPrice * itemQuantity;
    
    return `
      <div class="cart-review-item">
        <div class="item-image">
          <img src="${product.images?.[0] || 'https://images.unsplash.com/photo-1602574968595-52bdc47de83c?w=100&h=100&fit=crop'}" 
               alt="${product.name}">
        </div>
        <div class="item-details">
          <h4>${product.name}</h4>
          <p>${scent?.name || 'Custom scent'}</p>
        </div>
        <div class="item-quantity">
          <label>Qty:</label>
          <input type="number" value="${itemQuantity}" min="1" max="10" 
                 onchange="updateCartItemQuantity('${item.id}', this.value)">
        </div>
        <div class="item-price">
          ${app.formatPrice(itemTotal)}
        </div>
        <button class="remove-item-btn" onclick="removeCartItem('${item.id}')">×</button>
      </div>
    `;
  }).join('');
}

function loadOrderSummary() {
  const itemsContainer = document.getElementById('summary-items');
  const cart = app.getCart();
  
  if (!itemsContainer) return;
  
  itemsContainer.innerHTML = cart.map(item => {
    const product = app.getProductById(item.productId);
    if (!product) return '';
    
    const itemQuantity = parseInt(item.quantity) || 1;
    // Use product price if item price is 0 or missing
    const itemPrice = parseFloat(item.price) || parseFloat(product.price) || 0;
    const itemTotal = itemPrice * itemQuantity;
    
    return `
      <div class="summary-item">
        <div class="item-info">
          <span class="item-name">${product.name}</span>
          <span class="item-qty">Qty: ${itemQuantity}</span>
        </div>
        <span class="item-total">${app.formatPrice(itemTotal)}</span>
      </div>
    `;
  }).join('');
  
  updateOrderTotals();
}

function updateOrderTotals() {
  const totalsContainer = document.getElementById('summary-totals');
  if (!totalsContainer) return;
  
  const subtotal = app.getCartTotal();
  const shippingCost = calculateShippingCost(subtotal) || 0;
  const total = (subtotal || 0) + shippingCost;
  
  totalsContainer.innerHTML = `
    <div class="total-line">
      <span>Subtotal:</span>
      <span>${app.formatPrice(subtotal || 0)}</span>
    </div>
    <div class="total-line">
      <span>Shipping:</span>
      <span>${shippingCost === 0 ? 'FREE' : app.formatPrice(shippingCost)}</span>
    </div>
    <div class="total-line total-final">
      <span>Total:</span>
      <span>${app.formatPrice(total)}</span>
    </div>
  `;
}

function loadShippingOptions() {
  const container = document.getElementById('shipping-options');
  if (!container) return;
  
  const subtotal = app.getCartTotal();
  
  container.innerHTML = shippingOptions.map(option => {
    const isFree = subtotal >= option.freeThreshold;
    const price = isFree ? 0 : option.price;
    
    return `
      <label class="shipping-option">
      <input type="radio" name="shipping-method" value="${option.id}" 
           onchange="selectShippingMethod(${option.id})"
           ${option.id === 1 ? 'checked' : ''}>
      <div class="shipping-details">
        <div class="shipping-name">${option.name}</div>
        <div class="shipping-time">${option.time}</div>
        ${isFree ? '<div class="free-shipping">FREE</div>' : ''}
      </div>
      <div class="shipping-price">
        ${isFree ? 'FREE' : app.formatPrice(price)}
      </div>
      </label>
    `;
  }).join('');
  
  selectedShippingMethod = 1;
}

function calculateShippingCost(subtotal) {
  if (!selectedShippingMethod || !subtotal) return 0;
  
  const method = shippingOptions.find(opt => opt.id === selectedShippingMethod);
  if (!method) return 0;
  
  return subtotal >= method.freeThreshold ? 0 : method.price;
}

function selectShippingMethod(methodId) {
  selectedShippingMethod = methodId;
  
  const radioBtn = document.querySelector(`input[value="${methodId}"]`);
  if (radioBtn) radioBtn.checked = true;
  
  updateOrderTotals();
}

function setupFormValidation() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  });
  
  // Format card number
  const cardNumberInput = document.getElementById('card-number');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
      e.target.value = formattedValue;
    });
  }
  
  // Format expiry date
  const expiryInput = document.getElementById('expiry');
  if (expiryInput) {
    expiryInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      e.target.value = value;
    });
  }
}

function nextCheckoutStep() {
  if (!validateCurrentStep()) {
    return;
  }
  
  if (currentCheckoutStep < checkoutSteps.length - 1) {
    document.getElementById(`checkout-step-${checkoutSteps[currentCheckoutStep]}`).classList.remove('active');
    
    currentCheckoutStep++;
    
    document.getElementById(`checkout-step-${checkoutSteps[currentCheckoutStep]}`).classList.add('active');
    
    updateCheckoutProgress();
    
    // Scroll to top to focus on the container
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (checkoutSteps[currentCheckoutStep] === 'confirmation') {
      processOrder();
    }
  }
}

function previousCheckoutStep() {
  if (currentCheckoutStep > 0) {
    document.getElementById(`checkout-step-${checkoutSteps[currentCheckoutStep]}`).classList.remove('active');
    
    currentCheckoutStep--;
    
    document.getElementById(`checkout-step-${checkoutSteps[currentCheckoutStep]}`).classList.add('active');
    
    updateCheckoutProgress();
  }
}

function updateCheckoutProgress() {
  checkoutSteps.forEach((step, index) => {
    const stepElement = document.getElementById(`step-${step}`);
    
    if (stepElement) {
      if (index <= currentCheckoutStep) {
        stepElement.classList.add('active');
      } else {
        stepElement.classList.remove('active');
      }
    }
  });
}

function validateCurrentStep() {
  const currentStep = checkoutSteps[currentCheckoutStep];
  const cart = app.getCart();
  
  switch (currentStep) {
    case 'cart':
      if (cart.length === 0) {
        app.showNotification('Your cart is empty', 'error');
        return false;
      }
      return true;
      
    case 'shipping':
      return validateShippingForm();
      
    case 'payment':
      return validatePaymentForm();
      
    default:
      return true;
  }
}

function validateShippingForm() {
  const requiredFields = ['first-name', 'last-name', 'email', 'address', 'city', 'zip'];
  let isValid = true;
  
  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field || !field.value.trim()) {
      if (field) field.classList.add('error');
      isValid = false;
    } else {
      field.classList.remove('error');
    }
  });
  
  if (!isValid) {
    app.showNotification('Please fill in all required fields', 'error');
  }
  
  return isValid;
}

function validatePaymentForm() {
  const requiredFields = ['card-number', 'expiry', 'cvv', 'card-name'];
  let isValid = true;
  
  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field || !field.value.trim()) {
      if (field) field.classList.add('error');
      isValid = false;
    } else {
      field.classList.remove('error');
    }
  });
  
  const cardNumberField = document.getElementById('card-number');
  if (cardNumberField) {
    const cardNumber = cardNumberField.value.replace(/\s/g, '');
    if (cardNumber.length < 3 || cardNumber.length > 22) {
      cardNumberField.classList.add('error');
      isValid = false;
    }
  }
  
  if (!isValid) {
    app.showNotification('Please check your payment information', 'error');
  }
  
  return isValid;
}

function processOrder() {
  app.showNotification('Processing your order...', 'info');
  
  const cart = app.getCart();
  const subtotal = app.getCartTotal() || 0;
  const shippingCost = calculateShippingCost(subtotal) || 0;
  const total = subtotal + shippingCost;
  
  orderData = {
    orderId: 'CW' + Date.now(),
    items: cart,
    subtotal: subtotal,
    shipping: shippingCost,
    total: total,
    shippingAddress: getShippingAddress(),
    orderDate: new Date().toLocaleDateString()
  };
  
  setTimeout(() => {
    displayOrderConfirmation();
    app.clearCart();
    document.querySelectorAll('#cart-count, #mobile-cart-count').forEach(el => {
      el.textContent = '0';
    });
    app.showNotification('Order placed successfully!', 'success');
  }, 2000);
}

function getShippingAddress() {
  return {
    firstName: document.getElementById('first-name')?.value || '',
    lastName: document.getElementById('last-name')?.value || '',
    email: document.getElementById('email')?.value || '',
    address: document.getElementById('address')?.value || '',
    address2: document.getElementById('address2')?.value || '',
    city: document.getElementById('city')?.value || '',
    zip: document.getElementById('zip')?.value || ''
  };
}

function displayOrderConfirmation() {
  const container = document.getElementById('order-confirmation-details');
  
  if (!container) return;
  
  container.innerHTML = `
    <div class="order-summary-final">
      <div class="order-number">
        <strong>Order #${orderData.orderId}</strong>
      </div>
      
      <div class="order-items">
        <h4>Items Ordered:</h4>
        ${orderData.items.map(item => {
          const product = app.getProductById(item.productId);
          if (!product) return '';
          const itemQuantity = parseInt(item.quantity) || 1;
          return `<div class="confirmation-item">${product.name} (Qty: ${itemQuantity})</div>`;
        }).join('')}
      </div>
      
      <div class="order-total">
        <strong>Total: ${app.formatPrice(orderData.total)}</strong>
      </div>
      
      <div class="shipping-info">
        <h4>Shipping To:</h4>
        <p>${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}</p>
        <p>${orderData.shippingAddress.address}</p>
        <p>${orderData.shippingAddress.city}, ${orderData.shippingAddress.zip}</p>
      </div>
      
      <div class="order-date">
        <p>Order Date: ${orderData.orderDate}</p>
      </div>
    </div>
  `;
}

function updateCartItemQuantity(itemId, quantity) {
  app.updateCartQuantity(itemId, parseInt(quantity));
  loadCartReview();
  loadOrderSummary();
}

function removeCartItem(itemId) {
  app.removeFromCart(itemId);
  const cart = app.getCart();
  
  if (cart.length === 0) {
    redirectToShop();
  } else {
    loadCartReview();
    loadOrderSummary();
  }
}

function toggleBillingAddress() {
  const checkbox = document.getElementById('same-as-shipping');
  const billingForm = document.getElementById('billing-form');
  
  if (checkbox && billingForm) {
    billingForm.style.display = checkbox.checked ? 'none' : 'block';
  }
}

function printOrder() {
  window.print();
}
