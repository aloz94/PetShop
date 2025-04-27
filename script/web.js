process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});



function submitRegistration() {
    const data = {
        customerId: document.getElementById("customerId").value,
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        dogName: document.getElementById("dogName").value,
        dogBreed: document.getElementById("dogBreed").value,
        dogAge: document.getElementById("dogAge").value,
        dogSize: document.getElementById("dogSize").value
    };
    console.log(data);

    fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
   .then(response => {
        alert("Registration successful!");
        // console.log(response);
   })
    .catch(err => {
        alert("Error submitting form.");
        console.error(err);
    });
}

/* carousel(images) script*/
let index = 0;
const images = document.querySelector(".carousel-images");
const totalImages = images.children.length;

function showSlide() {
    images.style.transform = `translateX(${-index * 100}%)`;
}

function nextSlide() {
    index = (index + 1) % totalImages;
    showSlide();
}

function prevSlide() {
    index = (index - 1 + totalImages) % totalImages;
    showSlide();
}

setInterval(nextSlide, 3000);

 /* popup  script*/
function openPopup(popupId) {
    document.getElementById(popupId).style.display = "flex";
}

function closePopup(popupId) {
    document.getElementById(popupId).style.display = "none";
}

// registration  validation
function submitRegistration() {
    const form = document.getElementById('regispopup_form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = parseInt(document.getElementById('customerId').value);
        const first_name = document.getElementById('firstName').value;
        const last_name = document.getElementById('lastName').value;
        const phone = parseInt(document.getElementById('telephone').value);
        const address = document.getElementById('address').value;
        const email = document.getElementById('email').value;  
        const password = document.getElementById('pass').value;
        const name = document.getElementById('dogName').value;
        const breed = document.getElementById('dogBreed').value;
        const age = parseInt(document.getElementById('dogAge').value);
        const size = document.getElementById('dogSize').value;
        const gender = document.querySelector('input[name="dogGender"]:checked').value;
      //  console.log(id, first_name, last_name, phone, address, email, password, name, breed, age, size  )
        //console.log({ id, first_name, last_name, phone, address, email, password, name, breed, age, size, gender });
        console.log(JSON.stringify({ id, first_name , last_name , phone, address, email, password, name, breed, age, size, gender }))
        
try{
        const response = await fetch('http://localhost:3000/postData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, first_name , last_name , phone, address, email, password, name, breed, age, size, gender }),
        });
        console.log('fetched');

        const result = await response.text();
        alert(result);
        console.log(result);
    } catch (error) {
        console.error('Error during registration:', error);
        alert('An error occurred while registering. Please try again.');
    }
});
}

// login validation
function submitlogin() {
    const logform = document.getElementById('loginpopup_form')
    logform.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Login form submitted');

    const id2 = document.getElementById('log_id').value;
    const password = document.getElementById('log_pass').value;
    
    //const loginresult  = await con.query(login_query, [id2, password]);

    console.log('id and password is valued', id2, password);
    try {

//changed here was response
    const loginresponse = await fetch('http://localhost:3000/login', {
      
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            
        },
        body: JSON.stringify({ id:id2,password }),
    });  console.log('fetched');

    console.log('Response received:', loginresponse);

    const loginresult = await loginresponse.json(); // 🔥 נכון לקרוא JSON עכשיו
    alert(loginresult);
    console.log('Parsed response:', loginresult);

    console.log('Login result:', loginresult);
    console.log(typeof loginresult)

    if (loginresponse.ok) {
        alert('התחברת בהצלחה!');
        localStorage.setItem('token', loginresult.token);

        
            // 🔥 להסתיר את כפתורי ההתחברות
    document.getElementById('auth-buttons').style.display = 'none';

    // 🔥 להציג את אייקון הפרופיל
    document.getElementById('profile-icon').style.display = 'block';

        // ✅ לשמור את הטוקן

        

    } else {
        alert(loginresult.message || 'שגיאה בהתחברות');
    }

    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred while logging in. Please try again.');
    }
    

});
     
   }


   document.getElementById('tryRegForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('id').value;
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('http://localhost:3000/tryregister', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, name, phone, password })
      });

      const result = await response.text();
      alert(result);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while registering.');
    }
  });
