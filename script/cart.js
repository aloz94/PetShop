let addresses = [];      // יטען מהשרת
let addressId = null;    // תעודכן אחרי fetch
const checkoutCart = loadCart();   // מתוך localStorage


const cart = [];

async function checkLogin() {
    try {
        const res = await fetch('/profile', { credentials: 'include' });
        if (!res.ok) throw new Error('Not authenticated');
    } catch (err) {
        window.location.href = '/index.html'; // Redirect to login if not authenticated
    }
}

      //alert 
      function showCustomAlert(message) {
  document.getElementById('custom-alert-message').textContent = message;
  document.getElementById('custom-alert').style.display = 'flex';
}

function closeCustomAlert() {
  document.getElementById('custom-alert').style.display = 'none';
}

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

    showCustomAlert(`✔️ המוצר "${name}" נוסף לעגלה`);
    updateCartCount();
        updateCartDropdown(); // <-- Add this line to refresh the cart sidebar

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
                                <button class="qty-btn plus" title="הוסף כמות"><i class="fas fa-plus"></i></button>

                            <span class="qty">${item.quantity}</span>
                                    <button class="qty-btn minus" title="הפחת כמות"><i class="fas fa-minus"></i></button>

                        </td>
                        <td>₪${subtotal.toFixed(2)}</td>
    <td><button class="remove-btn" title="הסר מהמוצר"><i class="fas fa-trash-alt"></i></button></td>
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
        <div id="checkoutButtonContainer" style="text-align: center; margin-top: 15px;">
            <a href="/checkout.html" class="checkout-btn">המשך לתשלום</a>
        </div>
    `;
// finally: if we are on checkout.html, nuke the button container
if (window.location.pathname.endsWith('/checkout.html')) {
  const btnDiv = document.getElementById('checkoutButtonContainer');
  if (btnDiv) btnDiv.remove();
  const closebtn = document.getElementsByClassName('close-sidebar');
  if (closebtn.length > 0) {
    closebtn[0].style.display = 'none'; // Hide the close button on checkout page
  }
}

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
    const cart = loadCart();//let
    const item = cart.find(i => i.id == id);
    if (item) {
        item.quantity += delta;
        if (item.quantity < 1) item.quantity = 1;
        saveCart(cart);
        updateCartDropdown();
    }
}

function removeItemFromCart(id) {
    const cart = loadCart().filter(i => i.id != id);//let
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
// === checkout.html ===


/* ------------- הכרזות גלובליות אחת ויחידה -------------- */

/* ------------- פונקציות -------------- */
async function fetchAddresses() {
  try {
    const res = await fetch('/home/addresses', { credentials: 'include' });
    addresses = await res.json();                     // משתמש בגלובלי
    addressId = addresses[0]?.id ?? null;
    renderAddress();
  } catch (err) {
    console.error('Failed to fetch addresses', err);
  }
}

function renderAddress() {
  const a = addresses.find(x => x.id === addressId);
  document.getElementById('addressSummary').textContent =
    a ? `${a.street} ${a.house_number}, ${a.city}` : 'אין כתובת';
}


/* כפתור פתיחת סייד-בר */
document.getElementById('cartToggle')
        .addEventListener('click', () => {
  const bar = document.getElementById('cartSidebar');
  bar.style.display = 'block';
  bar.classList.add('open');
});

/* בחירת כתובת (modal) */
/* -----------------------------------------------------
   כפתור “בחר / ערוך כתובת” – יצירת מודאל בחירה / הוספה
----------------------------------------------------- */
document.getElementById('chooseAddressBtn').onclick = () => {
    let customerId;

  // אם המודאל כבר קיים – פשוט הצג
  let modal = document.getElementById('addrModal');
  if (!modal) {
    // Build the modal once
    modal = document.createElement('div');
    modal.id = 'addrModal';
    modal.innerHTML = `
      <div class="addr-backdrop"></div>
      <div class="addr-dialog">
        <h3>בחר כתובת</h3>
        <div id="addrList"></div>
        <h4>הוסף כתובת חדשה</h4>
        <input id="newCity"      placeholder="עיר">
        <input id="newStreet"    placeholder="רחוב">
        <input id="newHouseNum"  placeholder="מספר בית">
        <button id="addAddrBtn"  class="btn-primary-sm" ">הוסף</button>
        <button id="closeAddr"   class="btn-default-sm">סגור</button>
      </div>`;
    document.body.appendChild(modal);

    // Inject basic styles (or move to your CSS file)
    const style = document.createElement('style');
    style.textContent = `
      #addrModal { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; z-index:6000; }
      .addr-backdrop { position:absolute; inset:0; background:#0003; }
      .addr-dialog   { position:relative; background:#fff; padding:24px 26px; border-radius:12px; width:320px; max-height:80vh; overflow:auto;     overflow-x: hidden;  
}
      #addrList label { display:block; padding:6px 2px; cursor:pointer; }
      .btn-primary-sm { margin-top:10px; background:#4c45bf; color:#fff; border:none; padding:6px 12px; border-radius:8px; }
      .btn-default-sm { margin-top:10px; background:#ddd; border:none; padding:6px 12px; border-radius:8px; }
      input { width:100%; padding:6px 8px; margin-top:6px; box-sizing:border-box; }`;
    document.head.appendChild(style);

    // Close button handler
    modal.querySelector('#closeAddr').onclick = () => {
      modal.style.display = 'none';
    };

    // "Add address" handler
    modal.querySelector('#addAddrBtn').onclick = async () => {
      const profileRes = await fetch('/profile', { credentials: 'include' });
      if (!profileRes.ok) {
        alert('נא להתחבר');
        return;
      }
      const { user } = await profileRes.json();
      const city   = modal.querySelector('#newCity').value.trim();
      const street = modal.querySelector('#newStreet').value.trim();
      const num    = modal.querySelector('#newHouseNum').value.trim();
      if (!city || !street || !num) {
        alert('נא למלא את כל השדות');
        return;
      }
      const r = await fetch('/set/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ city, street, house_number: num, customer_id: user.userId })
      });
      if (!r.ok) return alert('שגיאה בהוספת כתובת');
      const newAddr = await r.json();
      addresses.unshift(newAddr);
      addressId = newAddr.id;
      renderAddrList();
      renderAddress();
      modal.style.display = 'none';
    };
  }

  // Helper to render the list of addresses each time
  function renderAddrList() {
    const list = modal.querySelector('#addrList');
    list.innerHTML = addresses.map(a => `
      <label class="addr-card">
        <input type="radio" name="addr" value="${a.id}" ${a.id == addressId ? 'checked' : ''}>
        <div class="addr-body">
          <span class="addr-icon"></span>
          <span class="addr-text">${a.street} ${a.house_number}, ${a.city}</span>
        </div>
      </label>
    `).join('');
    list.querySelectorAll('input[name="addr"]').forEach(inp => {
      inp.onchange = () => {
        addressId = Number(inp.value);        
        renderAddress();
        modal.style.display = 'none';
      };
    });
  }

  // Always re-render the list and show the modal
  renderAddrList();
  modal.style.display = 'flex';
};

// כפתור "בחר כתובת" – בחר את הכתובת הנוכחית


/* ביצוע הזמנה */
document.getElementById('placeOrderBtn').onclick = async () => {
  if (!addressId) { alert('בחר כתובת'); return; }

  // Fetch the logged-in customer's ID
  let customerId;
  try {
    const profileRes = await fetch('/profile', { credentials: 'include' });
    if (!profileRes.ok) throw new Error('Failed to fetch customer profile');
    const profileData = await profileRes.json();
    customerId = profileData.user.userId; // Extract the customer ID from the response
  } catch (err) {
    alert('נא להתחבר');
    return;
  }

  if (checkoutCart.length === 0) { alert('העגלה ריקה'); return; }

  const body = {
    address_id: addressId,
    payment_method: document.querySelector('input[name="pay"]:checked').value,
    cart: checkoutCart,
  };
console.log(body);
  const res = await fetch('/orders/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (res.ok) {
    localStorage.removeItem('cart');
const { orderId } = await res.json();
location.href = `/thanks.html?id=${orderId}`;
  } else {
    alert(await res.text());
  }
};
/* ---------- add-to-cart buttons (delegated) ---------- */
document.addEventListener('click', e => {
  if (!e.target.classList.contains('add-to-cart-btn')) return;

  const id    = e.target.dataset.id;
  const stock = parseInt(e.target.dataset.stock, 10);   // ← מלאי נוכחי
  const cart  = loadCart();
  const existing = cart.find(item => item.id === id);

  // אם כבר בעגלה: לוודא שלא עברנו את המלאי
  if (existing) {
    if (existing.quantity + 1 > stock) {
      alert('לא ניתן להזמין יותר מהמלאי הקיים');
      return;
    }
    existing.quantity += 1;
  } else {
    if (stock < 1) {
      alert('אין מלאי זמין למוצר זה');
      return;
    }
    cart.push({ id, 
                name: e.target.dataset.name, 
                price: +e.target.dataset.price, 
                quantity: 1, 
                image: e.target.dataset.img 
              });
  }

  saveCart(cart);
  showCustomAlert(`✔️ המוצר "${e.target.dataset.name}" נוסף לעגלה`);
  updateCartCount();
  updateCartDropdown();
});


//module.exports = router;

/* ---------- DOM events ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  /* טעינת כתובות + ספירת עגלה */
  await checkLogin();
  fetchAddresses();
  updateCartCount();
  updateCartDropdown();
});
