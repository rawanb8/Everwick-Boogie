// Checkout functionality
let currentCheckoutStep = 0;
let selectedShippingMethod = null;
let orderData = {};

let checkoutSteps = ['cart', 'shipping', 'payment', 'confirmation'];
let shippingOptions = [
  { id: 1, name: 'Standard Shipping', price: 5.99, time: '5-7 business days', freeThreshold: 50 },
  { id: 2, name: 'Express Shipping', price: 12.99, time: '2-3 business days', freeThreshold: 100 },
  { id: 3, name: 'Overnight Shipping', price: 24.99, time: 'Next business day', freeThreshold: 150 }
];

document.addEventListener('DOMContentLoaded', async () => {
  await app.loadData();

  // Check if cart is empty
  let cart = app.getCart();
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
  setupPaymentMethodClickHandlers();
  updateCheckoutProgress();
}

// function loadCartReview() {
//   let container = document.getElementById('cart-review');
//   let cart = app.getCart();

//   if (cart.length === 0) {
//     container.innerHTML = '<p class="text-center">Your cart is empty.</p>';
//     return;
//   }

//   container.innerHTML = cart.map(item => {
//     let product = app.getProductById(item.productId);
//     if (!product) return '';

//     let scent = app.getScentById(product.scentId);
//     let itemQuantity = parseInt(item.quantity) || 1;
//     // Use product price if item price is 0 or missing
//     let itemPrice = parseFloat(item.price) || parseFloat(product.price) || 0;
//     let itemTotal = itemPrice * itemQuantity;

//     return `
//       <div class="cart-review-item">
//         <div class="item-image">
//           <img src="${product.images?.[0] || 'https://images.unsplash.com/photo-1602574968595-52bdc47de83c?w=100&h=100&fit=crop'}" 
//                alt="${product.name}">
//         </div>
//         <div class="item-details">
//           <h4>${product.name}</h4>
//           <p>${scent?.name || 'Custom scent'}</p>
//         </div>
//         <div class="item-quantity">
//           <label>Qty:</label>
//           <input type="number" value="${itemQuantity}" min="1" max="10" 
//                  onchange="updateCartItemQuantity('${item.id}', this.value)">
//         </div>
//         <div class="item-price">
//           ${app.formatPrice(itemTotal)}
//         </div>
//         <button class="remove-item-btn" onclick="removeCartItem('${item.id}')">×</button>
//       </div>
//     `;
//   }).join('');
// }
//rawan:edited loadCartReview for customize products
function loadCartReview() {
  let container = document.getElementById('cart-review');
  let cart = app.getCart();

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<p class="text-center">Your cart is empty.</p>';
    return;
  }

  container.innerHTML = cart.map(item => {
    // determine display values (support custom items and normal products)
    let isCustom = !!item.custom || !item.productId;
    let name = item.name || '';
    let image = item.image || '';
    let itemPrice = Number(item.price || 0);
    let itemQuantity = parseInt(item.quantity || item.qty) || 1;
    let itemTotal = itemPrice * itemQuantity;
    let scentName = '';

    if (!isCustom && item.productId) {
      let product = app.getProductById(item.productId);
      if (product) {
        name = name || product.name;
        image = image || (product.images && product.images[0]) || '';
        // if item.price missing, derive from product
        if (!itemPrice) {
          itemPrice = Number(product.price || 0);
          itemTotal = itemPrice * itemQuantity;
        }
        scentName = app.getScentById(product.scentId)?.name || '';
      }
    } else {
      // custom item: try to get scent display from custom payload
      if (item.custom && item.custom.scentId) {
        scentName = app.getScentById(item.custom.scentId)?.name || '';
      }
    }

    return `
      <div class="cart-review-item" data-cart-id="${item.id}">
        <div class="item-image">
          <img src="${image}" alt="${escapeHtml(name)}">
        </div>
        <div class="item-details">
          <h4>${escapeHtml(name)}</h4>
          <p>${escapeHtml(scentName || (isCustom ? 'Custom scent' : '—'))}</p>
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

// function loadOrderSummary() {
//   let itemsContainer = document.getElementById('summary-items');
//   let cart = app.getCart();

//   if (!itemsContainer) return;

//   itemsContainer.innerHTML = cart.map(item => {
//     let product = app.getProductById(item.productId);
//     if (!product) return '';

//     let itemQuantity = parseInt(item.quantity) || 1;
//     // Use product price if item price is 0 or missing
//     let itemPrice = parseFloat(item.price) || parseFloat(product.price) || 0;
//     let itemTotal = itemPrice * itemQuantity;

//     return `
//       <div class="summary-item">
//         <div class="item-info">
//           <span class="item-name">${product.name}</span>
//           <span class="item-qty">Qty: ${itemQuantity}</span>
//         </div>
//         <span class="item-total">${app.formatPrice(itemTotal)}</span>
//       </div>
//     `;
//   }).join('');

//   updateOrderTotals();
// }

//rawan: edited loadOrderSummary for customized candles
function loadOrderSummary() {
  let itemsContainer = document.getElementById('summary-items');
  let cart = app.getCart();

  if (!itemsContainer) return;

  if (!cart.length) {
    itemsContainer.innerHTML = '<p class="text-center">No items in summary.</p>';
    return;
  }

  itemsContainer.innerHTML = cart.map(item => {
    let isCustom = !!item.custom || !item.productId;
    let name = item.name || '';
    let itemQuantity = parseInt(item.quantity || item.qty) || 1;
    let itemPrice = Number(item.price || 0);

    if (!isCustom && item.productId) {
      let product = app.getProductById(item.productId);
      if (product) {
        name = name || product.name;
        if (!itemPrice) itemPrice = Number(product.price || 0);
      }
    }

    let itemTotal = itemPrice * itemQuantity;

    return `
      <div class="summary-item">
        <div class="item-info">
          <span class="item-name">${escapeHtml(name)}</span>
          <span class="item-qty">Qty: ${itemQuantity}</span>
        </div>
        <span class="item-total">${app.formatPrice(itemTotal)}</span>
      </div>
    `;
  }).join('');

  updateOrderTotals();
}


function updateOrderTotals() {
  let totalsContainer = document.getElementById('summary-totals');
  if (!totalsContainer) return;

  let subtotal = app.getCartTotal();
  let shippingCost = calculateShippingCost(subtotal) || 0;
  let tax = 0; // Tax calculation - currently 0%
  let total = (subtotal || 0) + shippingCost + tax;

  totalsContainer.innerHTML = `
    <div class="total-line">
      <span>Subtotal:</span>
      <span>${app.formatPrice(subtotal || 0)}</span>
    </div>
    <div class="total-line">
      <span>Shipping:</span>
      <span>${shippingCost === 0 ? 'FREE' : app.formatPrice(shippingCost)}</span>
    </div>
    <div class="total-line">
      <span>Tax:</span>
      <span>${app.formatPrice(tax)}</span>
    </div>
    <div class="total-line total-final">
      <span>Total:</span>
      <span>${app.formatPrice(total)}</span>
    </div>
  `;
}

function loadShippingOptions() {
  let container = document.getElementById('shipping-options');
  if (!container) return;

  let subtotal = app.getCartTotal();

  container.innerHTML = shippingOptions.map(option => {
    let isFree = subtotal >= option.freeThreshold;
    let price = isFree ? 0 : option.price;

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
//rawan's edits:
// small helper to safely escape user-provided strings used in templates
function escapeHtml(str) {
  if (str === null || typeof str === 'undefined') return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
function loadCartShippingOptions() {
  let container = document.getElementById('cart-shipping-options');
  if (!container) return;

  let subtotal = app.getCartTotal();

  let optionsHTML = shippingOptions.map(option => {
    let isFree = subtotal >= option.freeThreshold;
    let price = isFree ? 0 : option.price;

    return `
      <div class="shipping-option" data-method-id="${option.id}" onclick="selectCartShippingMethod(${option.id})">
        <input type="radio" name="cart-shipping-method" value="${option.id}" 
             ${option.id === 1 ? 'checked' : ''}>
        <div class="shipping-details">
          <div class="shipping-name">${option.name}</div>
          <div class="shipping-time">${option.time}</div>
          ${isFree ? '<div class="free-shipping">FREE</div>' : ''}
        </div>
        <div class="shipping-price">
          ${isFree ? 'FREE' : app.formatPrice(price)}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = '<h3>Shipping Method</h3>' + optionsHTML;
  selectedShippingMethod = 1;
}

function selectCartShippingMethod(methodId) {
  selectedShippingMethod = methodId;

  // Update radio button
  let radioBtn = document.querySelector(`input[name="cart-shipping-method"][value="${methodId}"]`);
  if (radioBtn) radioBtn.checked = true;

  // Update visual selection - remove active class from all, add to selected
  document.querySelectorAll('#cart-shipping-options .shipping-option').forEach(opt => {
    opt.classList.remove('active');
  });
  let selectedBox = document.querySelector(`#cart-shipping-options .shipping-option[data-method-id="${methodId}"]`);
  if (selectedBox) selectedBox.classList.add('active');

  updateOrderTotals();
}

function calculateShippingCost(subtotal) {
  if (!selectedShippingMethod || !subtotal) return 0;

  let method = shippingOptions.find(opt => opt.id === selectedShippingMethod);
  if (!method) return 0;

  return subtotal >= method.freeThreshold ? 0 : method.price;
}

function selectShippingMethod(methodId) {
  selectedShippingMethod = methodId;

  // Update radio button
  let radioBtn = document.querySelector(`#shipping-options input[value="${methodId}"]`);
  if (radioBtn) radioBtn.checked = true;

  // Update visual selection
  document.querySelectorAll('#shipping-options .shipping-option').forEach(opt => {
    opt.classList.remove('active');
  });
  let selectedBox = document.querySelector(`#shipping-options .shipping-option[data-method-id="${methodId}"]`);
  if (selectedBox) selectedBox.classList.add('active');

  updateOrderTotals();
}

function setupFormValidation() {
  let forms = document.querySelectorAll('form');

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  });

  // Format card number - exactly 16 digits with spaces
  let cardNumberInput = document.getElementById('card-number');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      // Limit to 16 digits
      value = value.substring(0, 16);
      let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
      e.target.value = formattedValue;
    });
  }

  // Format expiry date - MM/YY format
  let expiryInput = document.getElementById('expiry');
  if (expiryInput) {
    expiryInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      // Limit to 4 digits
      value = value.substring(0, 4);
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      e.target.value = value;
    });
  }
}

function setupPaymentMethodClickHandlers() {
  // Make payment method boxes clickable anywhere
  document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', function () {
      // Remove active class from all payment methods
      document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
      // Add active to clicked one
      this.classList.add('active');
      // Check the radio button
      let radio = this.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });
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
    let stepElement = document.getElementById(`step-${step}`);

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
  let currentStep = checkoutSteps[currentCheckoutStep];
  let cart = app.getCart();

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
  let requiredFields = ['first-name', 'last-name', 'email', 'phone', 'address', 'city', 'zip'];
  let isValid = true;
  let firstInvalidFieldName = '';

  requiredFields.forEach(fieldId => {
    let field = document.getElementById(fieldId);
    if (!field || !field.value.trim()) {
      if (field) field.classList.add('error');
      isValid = false;
      if (!firstInvalidFieldName) {
        firstInvalidFieldName = fieldId.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
    } else {
      field.classList.remove('error');
    }
  });

  if (!isValid) {
    if (firstInvalidFieldName) {
      app.showNotification(`Please fill in the '${firstInvalidFieldName}' field`, 'error');
    } else {
      app.showNotification('Please fill in all required fields', 'error');
    }
  }

  return isValid;
}

function validatePaymentForm() {
  let requiredFields = ['card-number', 'expiry', 'cvv', 'card-name'];
  let isValid = true;

  requiredFields.forEach(fieldId => {
    let field = document.getElementById(fieldId);
    if (!field || !field.value.trim()) {
      if (field) field.classList.add('error');
      isValid = false;
    } else {
      field.classList.remove('error');
    }
  });

  // Validate card number - must be exactly 16 digits
  let cardNumberField = document.getElementById('card-number');
  if (cardNumberField) {
    let cardNumber = cardNumberField.value.replace(/\s/g, '');
    if (cardNumber.length !== 16) {
      cardNumberField.classList.add('error');
      isValid = false;
      app.showNotification('Card number must be exactly 16 digits', 'error');
      return false;
    }
  }

  // Validate expiry date - must be MM/YY format (5 characters total)
  let expiryField = document.getElementById('expiry');
  if (expiryField) {
    let expiry = expiryField.value;
    if (expiry.length !== 5 || !expiry.includes('/')) {
      expiryField.classList.add('error');
      isValid = false;
      app.showNotification('Expiry date must be in MM/YY format', 'error');
      return false;
    }
  }

  if (!isValid) {
    app.showNotification('Please check your payment information', 'error');
  }

  return isValid;
}

function processOrder() {
  let cart = app.getCart();
  let subtotal = app.getCartTotal() || 0;
  let shippingCost = calculateShippingCost(subtotal) || 0;
  let tax = 0; // Tax calculation - currently 0%
  let total = subtotal + shippingCost + tax;

  orderData = {
    orderId: 'CW' + Date.now(),
    items: cart,
    subtotal: subtotal,
    shipping: shippingCost,
    tax: tax,
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
    state: document.getElementById('state')?.value || '',
    zip: document.getElementById('zip')?.value || ''
  };
}

// function displayOrderConfirmation() {
//   let container = document.getElementById('order-confirmation-details');

//   if (!container) return;

//   container.innerHTML = `
//     <div class="order-summary-final">
//       <div class="order-number">
//         <strong>Order #${orderData.orderId}</strong>
//       </div>
      
//       <div class="order-items">
//         <h4>Items Ordered:</h4>
//         ${orderData.items.map(item => {
//     let product = app.getProductById(item.productId);
//     if (!product) return '';
//     let itemQuantity = parseInt(item.quantity) || 1;
//     return `<div class="confirmation-item">${product.name} (Qty: ${itemQuantity})</div>`;
//   }).join('')}
//       </div>
      
//       <div class="order-total">
//         <strong>Total: ${app.formatPrice(orderData.total)}</strong>
//       </div>
      
//       <div class="shipping-info">
//         <h4>Shipping To:</h4>
//         <p>${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}</p>
//         <p>${orderData.shippingAddress.address}</p>
//         <p>${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zip}</p>
//       </div>
      
//       <div class="order-date">
//         <p>Order Date: ${orderData.orderDate}</p>
//       </div>
//     </div>
//   `;
// }
//rawan:edited display order for custumize candle
function displayOrderConfirmation() {
  let container = document.getElementById('order-confirmation-details');

  if (!container) return;

  let itemsHtml = (orderData.items || []).map(item => {
    // try to find product name, fallback to item.name (custom)
    let productName = item.name || '';
    if (item.productId && !productName) {
      let product = app.getProductById(item.productId);
      if (product) productName = product.name;
    }
    let qty = parseInt(item.quantity || item.qty) || 1;
    return `<div class="confirmation-item">${escapeHtml(productName || 'Item')} (Qty: ${qty})</div>`;
  }).join('');

  container.innerHTML = `
    <div class="order-summary-final">
      <div class="order-number">
        <strong>Order #${orderData.orderId}</strong>
      </div>
      
      <div class="order-items">
        <h4>Items Ordered:</h4>
        ${itemsHtml}
      </div>
      
      <div class="order-total">
        <strong>Total: ${app.formatPrice(orderData.total)}</strong>
      </div>
      
      <div class="shipping-info">
        <h4>Shipping To:</h4>
        <p>${escapeHtml(orderData.shippingAddress.firstName)} ${escapeHtml(orderData.shippingAddress.lastName)}</p>
        <p>${escapeHtml(orderData.shippingAddress.address)}</p>
        <p>${escapeHtml(orderData.shippingAddress.city)}, ${escapeHtml(orderData.shippingAddress.state)} ${escapeHtml(orderData.shippingAddress.zip)}</p>
      </div>
      
      <div class="order-date">
        <p>Order Date: ${escapeHtml(orderData.orderDate)}</p>
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
  let cart = app.getCart();

  if (cart.length === 0) {
    redirectToShop();
  } else {
    loadCartReview();
    loadOrderSummary();
  }
}

function toggleBillingAddress() {
  let checkbox = document.getElementById('same-as-shipping');
  let billingForm = document.getElementById('billing-form');

  if (checkbox && billingForm) {
    billingForm.style.display = checkbox.checked ? 'none' : 'block';
  }
}

function printOrder() {
  window.print();
}
