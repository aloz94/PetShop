document.addEventListener('DOMContentLoaded', () => {
    loadToysProductCards();
    loadFoodProductCards();
    loadCollarsProductCards();
    loadGroomingProductCards();
    });
    
async function loadToysProductCards() {
  try {
    const res = await fetch('/products/toys');
    const data = await res.json();
    const container = document.getElementById('toysProductGrid');
    container.innerHTML = '';

    data.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';

      const imgSrc = `/uploads/${product.img_path}`;
const price = Number(product.price);
const formattedPrice = !isNaN(price) ? price.toFixed(2) : 'לא זמין';

      card.innerHTML = `
        <img src="${imgSrc}" alt="${product.name}">
        <div class="info">
          <h4>${product.name}</h4>
<p>₪${Number(product.price).toFixed(2)}</p>
          <p>${product.description}</p>
          ${product.stock_quantity < product.min_quantity
            ? '<span class="badge-alert">מלאי נמוך</span>' 
            : ''
          }
        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error('שגיאה בטעינת מוצרים:', err);
  }
}

async function loadFoodProductCards() {
  try {
    const res = await fetch('/products/food');
    const data = await res.json();
    const container = document.getElementById('foodProductGrid');
    container.innerHTML = '';

    data.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';

      const imgSrc = `/uploads/${product.img_path}`;
const price = Number(product.price);
const formattedPrice = !isNaN(price) ? price.toFixed(2) : 'לא זמין';

      card.innerHTML = `
        <img src="${imgSrc}" alt="${product.name}">
        <div class="info">
          <h4>${product.name}</h4>
<p>₪${Number(product.price).toFixed(2)}</p>
          <p>${product.description}</p>
          ${product.stock_quantity < product.min_quantity
            ? '<span class="badge-alert">מלאי נמוך</span>' 
            : ''
          }
        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error('שגיאה בטעינת מוצרים:', err);
  }
}

async function loadCollarsProductCards() {
  try {
    const res = await fetch('/products/collars');
    const data = await res.json();
    const container = document.getElementById('collarsProductGrid');
    container.innerHTML = 
    data.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';

      const imgSrc = `/uploads/${product.img_path}`;
const price = Number(product.price);
const formattedPrice = !isNaN(price) ? price.toFixed(2) : 'לא זמין';

      card.innerHTML = `
        <img src="${imgSrc}" alt="${product.name}">
        <div class="info">
          <h4>${product.name}</h4>
<p>₪${Number(product.price).toFixed(2)}</p>
          <p>${product.description}</p>
          ${product.stock_quantity < product.min_quantity
            ? '<span class="badge-alert">מלאי נמוך</span>' 
            : ''
          }
        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error('שגיאה בטעינת מוצרים:', err);
  }
}

async function loadGroomingProductCards() {
  try {
    const res = await fetch('/products/grooming');
    const data = await res.json();
    const container = document.getElementById('groomingProductGrid');
    container.innerHTML = '';

    data.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';

      const imgSrc = `/uploads/${product.img_path}`;
const price = Number(product.price);
const formattedPrice = !isNaN(price) ? price.toFixed(2) : 'לא זמין';

      card.innerHTML = `
        <img src="${imgSrc}" alt="${product.name}">
        <div class="info">
          <h4>${product.name}</h4>
<p>₪${Number(product.price).toFixed(2)}</p>
          <p>${product.description}</p>
          ${product.stock_quantity < product.min_quantity
            ? '<span class="badge-alert">מלאי נמוך</span>' 
            : ''
          }
        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error('שגיאה בטעינת מוצרים:', err);
  }
}
