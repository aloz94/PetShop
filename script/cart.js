const cart = [];

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('add-to-cart-btn')) {
    const id = e.target.dataset.id;
    const name = e.target.dataset.name;
    const price = parseFloat(e.target.dataset.price);

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id, name, price, quantity: 1 });
    }

    alert(`✔️ המוצר "${name}" נוסף לעגלה`);
    console.log('🛒 עגלה:', cart);
  }
});

// טען את העגלה מה-localStorage (אם קיימת)
function loadCart() {
  const saved = localStorage.getItem('cart');
  return saved ? JSON.parse(saved) : [];
}

// שמור את העגלה ל-localStorage
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// מחק את העגלה (לשימוש אחרי רכישה)
function clearCart() {
  localStorage.removeItem('cart');
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('add-to-cart-btn')) {
    const id = e.target.dataset.id;
    const name = e.target.dataset.name;
    const price = parseFloat(e.target.dataset.price);
const image = e.target.dataset.img; // new attribute for the image filename


    const cart = loadCart();
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id, name, price, quantity: 1, image });
    }

    saveCart(cart);

    alert(`✔️ המוצר "${name}" נוסף לעגלה`);
    console.log('🛒 עגלה:', cart);
  }
});

function updateCartCount() {
  const cart = loadCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const span = document.getElementById('cartCount');
  if (span) {
    span.textContent = count;
  }
}

// מריץ כשהדף נטען
document.addEventListener('DOMContentLoaded', updateCartCount);

function updateCartDropdown() {
    const cart = loadCart();
    const cartSidebar = document.getElementById('cartSidebar');
    const cartItemsContainer = document.getElementById('cartItems');
    const countSpan = document.getElementById('cartCount');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countSpan.textContent = totalItems;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>העגלה ריקה</p>';
        return;
    }

    let total = 0;
    cartItemsContainer.innerHTML = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>תמונה</th>
                    <th>מוצר</th>
                    <th>כמות</th>
                    <th>סה"כ</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${cart.map(item => {
                    const subtotal = item.quantity * item.price;
                    total += subtotal;
                    return `
                    <tr data-id="${item.id}">
                        <td>${item.image ? `<img src="/uploads/${item.image}" alt="${item.name}" class="cart-thumb">` : ''}</td>
                        <td>${item.name}</td>
                        <td>
                            <button class="qty-btn minus">-</button>
                            <span class="qty">${item.quantity}</span>
                            <button class="qty-btn plus">+</button>
                        </td>
                        <td>₪${subtotal.toFixed(2)}</td>
                        <td><button class="remove-btn">❌</button></td>
                    </tr>`;
                }).join('')}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3"><strong>סה"כ</strong></td>
                    <td colspan="2">₪${total.toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>
        <div style="text-align: center; margin-top: 15px;">
            <a href="/checkout.html" class="checkout-btn">המשך לתשלום</a>
        </div>
    `;

    // Add event listeners for buttons
    document.querySelectorAll('.qty-btn.plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = getRowId(e.target);
            updateItemQuantity(id, 1);
        });
    });

    document.querySelectorAll('.qty-btn.minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = getRowId(e.target);
            updateItemQuantity(id, -1);
        });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = getRowId(e.target);
            removeItemFromCart(id);
        });
    });
}

// Utility to get row item ID
function getRowId(element) {
    return element.closest('tr').getAttribute('data-id');
}

// These functions should already exist or be implemented:
function updateItemQuantity(id, delta) {
    let cart = loadCart();
    const item = cart.find(i => i.id == id);
    if (item) {
        item.quantity += delta;
        if (item.quantity < 1) item.quantity = 1;
        saveCart(cart);
        updateCartDropdown();
    }
}

function removeItemFromCart(id) {
    let cart = loadCart().filter(i => i.id != id);
    saveCart(cart);
    updateCartDropdown();
}
// Open the cart sidebar
document.getElementById('cartToggle').addEventListener('click', () => {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.add('open');
    cartSidebar.style.display = 'block';
});

// Close the cart sidebar
function closeCartSidebar() {
    const cartSidebar = document.getElementById('cartSidebar');
        cartSidebar.style.display = 'none';

    cartSidebar.classList.remove('open');

}
  document.addEventListener('DOMContentLoaded', updateCartDropdown);
