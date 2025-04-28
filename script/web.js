// This script is for the website and includes the carousel, popup, registration, and login functionalities.
// It uses the Fetch API to send data to the server and handle responses.
// It also includes error handling for uncaught exceptions and unhandled promise rejections.
// It is important to ensure that the server is running and the endpoints are correctly set up to handle the requests.

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
async function submitRegistration(e) {
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
    const loginresponse = await fetch('http://localhost:3000/login', {
      
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            
        },
        body: JSON.stringify({ id:id2,password }),
        credentials: 'include' // 🔥 חשוב מאוד כדי שהקוקי יישלח אוטומטית
    });  console.log('fetched');

    console.log('Response received:', loginresponse);

    const loginresult = await loginresponse.json(); // 🔥 נכון לקרוא JSON עכשיו
    alert(loginresult);
    console.log('Login result:', loginresult);
    console.log(typeof loginresult)

    if (loginresponse.ok) {
        alert('התחברת בהצלחה!');
        //localStorage.setItem('token', loginresult.token);

      const now = Date.now();
      const expiry = now + (60 * 60 * 1000); // 1 hour in milliseconds
     localStorage.setItem('expiry', expiry);

     document.getElementById('auth-buttons').style.display = 'none';
     document.getElementById('profile-icon').style.display = 'block';

    } else {
        alert(loginresult.message || 'שגיאה בהתחברות');
    }

    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred while logging in. Please try again.');
    }
     
   }

   //wehn page loads
   document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('regispopup_form').addEventListener('submit', submitRegistration);
    document.getElementById('loginpopup_form').addEventListener('submit', submitlogin);

    checkLoginStatus(); // 🔥 בדיקה אמיתית דרך השרת

    // 🔥 Check login status
    //const token = localStorage.getItem('token');
    //const expiry = localStorage.getItem('expiry');

    /*if (token && expiry) {
        if (Date.now() > parseInt(expiry)) {
            // Token expired
            localStorage.removeItem('token');
            localStorage.removeItem('expiry');
            document.getElementById('auth-buttons').style.display = 'block';
            document.getElementById('profile-icon').style.display = 'none';
            alert('Session expired. Please login again.');
        } else {
            // Token still valid
            document.getElementById('auth-buttons').style.display = 'none';
            document.getElementById('profile-icon').style.display = 'block';
        }
    } else {
        document.getElementById('auth-buttons').style.display = 'block';
        document.getElementById('profile-icon').style.display = 'none';
    }*/
});

async function checkLoginStatus() {
    try {
        const response = await fetch('http://localhost:3000/profile', {
            method: 'GET',
            credentials: 'include' // 🔥 חשוב
        });

        if (response.ok) {
            const data = await response.json();
            console.log('User is logged in:', data);

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




         