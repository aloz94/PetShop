// script/store.js

document.addEventListener('DOMContentLoaded', () => {
  // Grab DOM elements
  const productGrid    = document.getElementById('productGrid');
  const categoriesList = document.getElementById('categoriesList');
  const searchInput    = document.getElementById('searchInput');
  const sortSelect     = document.getElementById('sortSelect');

  // If any required element is missing, abort to avoid errors
  if (![productGrid, categoriesList, searchInput, sortSelect].every(el => el)) {
    console.error('store.js: Missing one or more required elements on the page.');
    return;
  }

  let allProducts      = [];
  let filteredProducts = [];
  let allCategories    = [];
  let activeCategory   = null;

  // ─── Fetch products & categories ───────────────────────────────────────────────
  async function initStore() {
    try {
      [ allProducts, allCategories ] = await Promise.all([
        fetch('/products',   { credentials: 'include' }).then(r => r.json()),
        fetch('/categories', { credentials: 'include' }).then(r => r.json())
      ]);
    } catch (err) {
      console.error('Error fetching store data:', err);
      productGrid.innerHTML = '<p>שגיאה בטעינת המוצרים</p>';
      return;
    }

    renderCategories();
    applyFilters();
  }

  // ─── Build category filter buttons ────────────────────────────────────────────
  function renderCategories() {
    categoriesList.innerHTML = '';

    const makeBtn = (text, catId) => {
      const li  = document.createElement('li');
      const btn = document.createElement('button');
      btn.textContent = text;
      btn.classList.toggle('active', activeCategory === catId);
      btn.addEventListener('click', () => {
        activeCategory = catId;
        applyFilters();
      });
      li.appendChild(btn);
      return li;
    };

    // "All" category
    categoriesList.appendChild(makeBtn('הכל', null));

    // Individual categories
    allCategories.forEach(cat => {
      categoriesList.appendChild(makeBtn(cat.name, cat.name));
    });
  }

  // ─── Filter and sort products ─────────────────────────────────────────────────
  function applyFilters() {
    const term = searchInput.value.trim().toLowerCase();

    filteredProducts = allProducts.filter(p => {
      const matchesCat  = !activeCategory || p.category === activeCategory;
      const matchesTerm = !term || p.name.toLowerCase().includes(term);
      return matchesCat && matchesTerm;
    });

    // Sort by name or price
    const [ key, dir ] = sortSelect.value.split('-');
    filteredProducts.sort((a, b) => {
      if (key === 'price') {
        const pa = Number(a.price) || 0;
        const pb = Number(b.price) || 0;
        return dir === 'asc' ? pa - pb : pb - pa;
      } else {
        return dir === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
    });

    renderProducts();
  }

  // ─── Render product cards ─────────────────────────────────────────────────────
  function renderProducts() {
    productGrid.innerHTML = '';

    if (filteredProducts.length === 0) {
      productGrid.innerHTML = '<p>לא נמצאו מוצרים</p>';
      return;
    }

    filteredProducts.forEach(p => {
      const priceNum = Number(p.price) || 0;

      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${p.img_path}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>${p.description || ''}</p>
        <div class="price">₪${priceNum.toFixed(2)}</div>
        <div class="buttons">
          <button
            class="buy-btn add-to-cart-btn"
            data-id="${p.id}"
            data-name="${p.name}"
            data-price="${priceNum}"
            data-img="${p.img_path}">
            קנה עכשיו
          </button>
          <button
            class="details-btn"
            onclick="location.href='/product.html?id=${p.id}'">
            פרטים
          </button>
        </div>
      `;
      productGrid.appendChild(card);
    });

    // Update the cart count badge if available
    if (typeof updateCartCount === 'function') {
      updateCartCount();
    }
  }

  // ─── Live event listeners ─────────────────────────────────────────────────────
  searchInput.addEventListener('input',  applyFilters);
  sortSelect .addEventListener('change', applyFilters);

  // ─── Initialize ───────────────────────────────────────────────────────────────
  initStore();
});
