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

    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countSpan.textContent = totalItems;

    // If the cart is empty
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>העגלה ריקה</p>';
        return;
    }

    // Populate the cart sidebar with items
    let total = 0;
    cartItemsContainer.innerHTML = `
        <table>
            <thead>
                <tr>
                 <th>תמונה</th>
                <th>מוצר</th>
                <th>כמות</th>
                <th>סה"כ</th></tr>
            </thead>
            <tbody>
                ${cart.map(item => {
                    const subtotal = item.quantity * item.price;
                    total += subtotal;
                    return `<tr>
                        <td>
                          ${item.image ? `<img src="/uploads/${item.image}" alt="${item.name}" style="width:50px;height:auto;border-radius:4px;">` : ''}
                        </td>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>₪${subtotal.toFixed(2)}</td>
                    </tr>`;
                }).join('')}
            </tbody>
            <tfoot>
                <tr><td colspan="2">סה"כ</td><td>₪${total.toFixed(2)}</td></tr>
            </tfoot>
        </table>
    `;

    // Add checkout button
    cartItemsContainer.innerHTML += `
        <div style="text-align: center; margin-top: 10px;">
            <a href="/checkout.html" class="checkout-btn">המשך לתשלום</a>
        </div>
    `;
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
