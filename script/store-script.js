document.addEventListener('DOMContentLoaded', () => {
    loadToysProductCards();
    loadFoodProductCards();
    loadCollarsProductCards();
    loadGroomingProductCards();
        document.getElementById('regispopup_form').addEventListener('submit', submitRegistration);
    document.getElementById('loginpopup_form').addEventListener('submit', submitlogin);
    checkLoginStatus();
    });
    

    /*     document.getElementById('auth-buttons').style.display = 'none';
     document.getElementById('profile-icon').style.display = 'block';
*/
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

      if (product.stock_quantity < 1) {
        card.innerHTML = `
          <img src="${imgSrc}" alt="${product.name}">
          <div class="info">
            <h4>${product.name}</h4>
            <p>₪${formattedPrice}</p>
            <p>${product.description}</p>
            <span class="badge-out-of-stock">אזל מהמלאי</span> <!-- Out of stock badge -->
          </div>
        `;
      } else {

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
              <button class="add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-img="${product.img_path}">
      ➕ הוסף לעגלה
    </button>

        </div>
      `;
        }
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
      if (product.stock_quantity < 1) {
        card.innerHTML = `
          <img src="${imgSrc}" alt="${product.name}">
          <div class="info">
            <h4>${product.name}</h4>
            <p>₪${formattedPrice}</p>
            <p>${product.description}</p>
            <span class="badge-out-of-stock">אזל מהמלאי</span> <!-- Out of stock badge -->
          </div>
        `;
      } else {

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
              <button class="add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-img="${product.img_path}">
      ➕ הוסף לעגלה
    </button>

        </div>
      `;
        }
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

      if (product.stock_quantity < 1) {
        card.innerHTML = `
          <img src="${imgSrc}" alt="${product.name}">
          <div class="info">
            <h4>${product.name}</h4>
            <p>₪${formattedPrice}</p>
            <p>${product.description}</p>
            <span class="badge-out-of-stock">אזל מהמלאי</span> <!-- Out of stock badge -->
          </div>
        `;
      } else {

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
              <button class="add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-img="${product.img_path}">
      ➕ הוסף לעגלה
    </button>

        </div>
      `;
        }

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

      if (product.stock_quantity < 1) {
        card.innerHTML = `
          <img src="${imgSrc}" alt="${product.name}">
          <div class="info">
            <h4>${product.name}</h4>
            <p>₪${formattedPrice}</p>
            <p>${product.description}</p>
            <span class="badge-out-of-stock">אזל מהמלאי</span> <!-- Out of stock badge -->
          </div>
        `;
      } else {

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
     <button class="add-to-cart-btn"
             data-id="${product.id}"
             data-name="${product.name}"
             data-price="${product.price}"
             data-img="${product.img_path}"
             data-stock="${product.stock_quantity}">
      ➕ הוסף לעגלה
    </button>

        </div>
      `;
        }
      container.appendChild(card);
    });

  } catch (err) {
    console.error('שגיאה בטעינת מוצרים:', err);
  }
}
// ============= popup functions ==============
function openPopup(popupId) {
    document.getElementById(popupId).style.display = "flex";
}
function closePopup(popupId) {
    //document.getElementById(popupId).style.display = "none";
    const pop = document.getElementById(popupId).querySelector('.popup-content');
  pop.classList.add('closing');
  pop.addEventListener('animationend', ()=>{
    document.getElementById(popupId).style.display = 'none';
    pop.classList.remove('closing');
  }, { once: true });
}

async function submitRegistration(e) {
        e.preventDefault();

        const id = document.getElementById('customerId').value  ;
        const first_name = document.getElementById('firstName').value;
        const last_name = document.getElementById('lastName').value;
        const phone = document.getElementById('telephone').value;
        const address = document.getElementById('address').value;
        const email = document.getElementById('email').value;  
        const password = document.getElementById('pass').value;
        const confirmPassword = document.getElementById('passconfirm').value;
        const name = document.getElementById('dogName').value;
        const breed = document.getElementById('dogBreed').value;
        const age = parseInt(document.getElementById('dogAge').value);
        const size = document.getElementById('dogSize').value;
        const gender = document.querySelector('input[name="dogGender"]:checked').value;
      //  console.log(id, first_name, last_name, phone, address, email, password, name, breed, age, size  )
        //console.log({ id, first_name, last_name, phone, address, email, password, name, breed, age, size, gender });
        console.log(JSON.stringify({ id, first_name , last_name , phone, address, email, password, name, breed, age, size, gender }))
        if(password !== confirmPassword) {
            showCustomAlert('סיסמאות אינן תואמות');
            return;
        }
    

try{
        const response = await fetch('/postData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, first_name , last_name , phone, address, email, password, name, breed, age, size, gender }),
        });
        console.log('fetched');

        const result = await response.text();
        showCustomAlert('נרשמת בהצלחה! ✅');
        console.log(result);
setTimeout(() => {
  window.location.reload();
}, 3000);
    } catch (error) {
        console.error('Error during registration:', error);
        showCustomAlert('אירעה שגיאה בעת ההרשמה. נא לנסות שוב');
    }

}

// login validation
async function submitlogin(e) {
    e.preventDefault();
    console.log('Login form submitted');

    const id2 = document.getElementById('log_id').value;
    const password = document.getElementById('log_pass').value;
    
    //const loginresult  = await con.query(login_query, [id2, password]);

    console.log('id and password is valued', id2, password);
    try {

//changed here was response
    const loginresponse = await fetch('/login', {
      
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            
        },
        body: JSON.stringify({ id:id2,password }),
        credentials: 'include' // 🔥 חשוב מאוד כדי שהקוקי יישלח אוטומטית
    });  console.log('fetched');

    console.log('Response received:', loginresponse);

    const loginresult = await loginresponse.json(); // 🔥 נכון לקרוא JSON עכשיו
   // alert(loginresult);
    console.log('Login result:', loginresult);
    console.log(typeof loginresult)

    if (loginresponse.ok) {
       // showCustomAlert('התחברת בהצלחה!');
        //localStorage.setItem('token', loginresult.token);

      const now = Date.now();
      const expiry = now + (60 * 60 * 1000); // 1 hour in milliseconds
     localStorage.setItem('expiry', expiry);
     
      if (loginresult.role === 'handler') {
        showCustomAlert('התחברת בהצלחה - מועבר לדשבורד שליח'); // 🔥 הודעה למשתמש
                setTimeout(() => {
                  window.location.href = 'handlerDash.html';
                  return;
                }, 3000);
            }
     
     if (loginresponse.ok) {
      if (loginresult.role === 'customer') {
     document.getElementById('auth-buttons').style.display = 'none';
     document.getElementById('profile-icon').style.display = 'block';
      showCustomAlert('התחברת בהצלחה!'); // 🔥 הודעה למשתמש
     setTimeout(() => {
       window.location.reload(); // 🔥 רענון הדף
     }, 3000);
      } else {
showCustomAlert('התחברת בהצלחה - מועבר לדשבורד '); // 🔥 הודעה למשתמש
        setTimeout(() => {

        window.location.href = 'dashboard.html';
        }, 3000);
      }
    } 
  

    } else {
      showCustomAlert(loginresult.message || 'שגיאה בהתחברות');
    }

    } catch (error) {
        console.error('Error during login:', error);
        showCustomAlert('אירעה שגיאה בעת ההתחברות. נא לנסות שוב.');
    }

   }

   // check if user is logged in
   async function checkLoginStatus() {
    try {
        const response = await fetch('/profile', {
            method: 'GET',
            credentials: 'include' // 🔥 חשוב
        });

        if (response.ok) {
            const data = await response.json();
            console.log('User is logged in:', data);
            currentUserId = data.user.userId; // 🔥 שמרי את ה-ID בזיכרון


            document.getElementById('auth-buttons').style.display = 'none';
            document.getElementById('profile-icon').style.display = 'block';
        } else {
            throw new Error('Unauthorized');
        }
    } catch (error) {
        console.log('User not logged in');
        document.getElementById('auth-buttons').style.display = 'block';
        document.getElementById('profile-icon').style.display = 'none';
    }
}
