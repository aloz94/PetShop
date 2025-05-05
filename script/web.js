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
     if (loginresponse.ok) {
      if (loginresult.role === 'customer') {
     document.getElementById('auth-buttons').style.display = 'none';
     document.getElementById('profile-icon').style.display = 'block';
     window.location.href = 'index.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    } 
  

    } else {
        alert(loginresult.message || 'שגיאה בהתחברות');
    }

    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred while logging in. Please try again.');
    }
     
   }

   function triggerHourLoad() {
    const selectedDate = document.getElementById('appointmentDate').value;
    const serviceSelect = document.getElementById('serviceSelect');
    const selectedOption = serviceSelect.selectedOptions[0];
  
    if (!selectedDate || !selectedOption || !selectedOption.dataset.duration) {
      return;
    }
  
    const selectedDuration = parseInt(selectedOption.dataset.duration);
    loadAvailableHours(selectedDate, selectedDuration);
  }
  

   //wehn page loads
   document.addEventListener('DOMContentLoaded', function() {
   /* document.getElementById('regispopup_form').addEventListener('submit', submitRegistration);
    document.getElementById('loginpopup_form').addEventListener('submit', submitlogin);
    document.getElementById('serviceSelect').addEventListener('change', updatePriceLabel);
    document.getElementById('groomingpopup_form').addEventListener('submit', submitGroomingAppointment);*/
  
    document.getElementById('regispopup_form').addEventListener('submit', submitRegistration);
    document.getElementById('loginpopup_form').addEventListener('submit', submitlogin);
    document.getElementById('serviceSelect').addEventListener('change', triggerHourLoad);
    document.getElementById('appointmentDate').addEventListener('change', triggerHourLoad);
    document.getElementById('groomingpopup_form').addEventListener('submit', submitGroomingAppointment);
    document.getElementById('boardingpopup_form').addEventListener('submit', submitBoardingAppointment);


    checkLoginStatus(); // 🔥 בדיקה אמיתית דרך השרת
    loadServices(); //load services from the server
     loadUserDogs();//load dogs from the server
   // loadAvailableHours(); //load available hours from the server
   loadUserDogsForBoarding(); // 🚀 קריאה לטעינת הכלבים לטופס הפנסיון

    
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
let currentUserId = null; // משתנה גלובלי


async function checkLoginStatus() {
    try {
        const response = await fetch('http://localhost:3000/profile', {
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

async function loadServices() {
    try {
        const response = await fetch('http://localhost:3000/services');
        const services = await response.json();

        const serviceSelect = document.getElementById('serviceSelect');
        const priceLabel = document.querySelector('.price-label');

        // קודם מנקה את התפריט (אם כבר קיים)
        serviceSelect.innerHTML = '<option value="">בחר שירות</option>';

        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id; // רק ה-ID!
            option.dataset.price = service.price; // 🔥 שומר את המחיר בתוך data attribute
            option.textContent = service.name; // רק את שם השירות
            option.dataset.duration = service.duration; // 🔥 זה השורה החשובה

            serviceSelect.appendChild(option);
        });

        // מוסיפה האזנה לשינוי — כדי להציג מחיר בזמן בחירה
        serviceSelect.addEventListener('change', function () {
            const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
            const price = selectedOption.dataset.price;

            if (price) {
                priceLabel.textContent = `עלות - ₪${price}`;
            } else {
                priceLabel.textContent = 'עלות - ₪0'; // או טקסט ברירת מחדל
            }
        });

    } catch (error) {
        console.error('Error loading services:', error);
    }
}

// 🐶 טען את רשימת הכלבים של המשתמש
async function loadUserDogs() {
    try {
      const res = await fetch('http://localhost:3000/my-dogs', {
        credentials: 'include'
      });
      const dogs = await res.json();
  
      const dogSelect = document.getElementById('dogSelect');
      dogSelect.innerHTML = '<option value="">בחר כלב</option>';
  
      dogs.forEach(dog => {
        const option = document.createElement('option');
        option.value = dog.id;
        option.textContent = dog.name;
        dogSelect.appendChild(option);
      });
    } catch (err) {
      console.error('שגיאה בטעינת הכלבים:', err);
    }
  }

  async function submitGroomingAppointment(e) {
    e.preventDefault();
    console.log("submitGroomingAppointment הופעלה");

    const appointment_date = document.getElementById('appointmentDate').value;
    const start_time = document.getElementById('hourSelect').value;
    const service_id = document.getElementById('serviceSelect').value;
    const dog_id = document.getElementById('dogSelect').value;
    const notes = document.getElementById('notes').value;
    const slot_time = document.getElementById('hourSelect').value;

    if (!appointment_date || !start_time || !service_id || !dog_id) {
      alert('נא למלא את כל השדות');
      return;
    }
  
    try {
      const res = await fetch('http://localhost:3000/grooming-appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
body: JSON.stringify({ appointment_date, slot_time, service_id, dog_id, notes })
      });
  
      const result = await res.json();
      
      alert(result.message || 'התור נקבע בהצלחה!');
    } catch (err) {
      console.error('שגיאה בשליחת התור:', err);
      alert('שגיאה בשליחת הטופס');
    }
  }
  // 💰 עדכן תצוגת מחיר
function updatePriceLabel() {
    const serviceSelect = document.getElementById('serviceSelect');
    const price = serviceSelect.selectedOptions[0]?.dataset.price || '0';
    document.getElementById('priceDisplay').textContent = price;
  }

  function generateWorkingHours() {
    const hours = [];
    const startHour = 9;
    const endHour = 17;
  
    for (let hour = startHour; hour < endHour; hour++) {
      hours.push(`${hour.toString().padStart(2, '0')}:00`);
      hours.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  
    return hours; // ['09:00', '09:30', ..., '16:30']
  }
  

  async function loadAvailableHours(selectedDate, selectedDuration) {
    if (!selectedDate || !selectedDuration) return;
  
    try {
      const response = await fetch(`http://localhost:3000/appointments?date=${selectedDate}`, {
        credentials: 'include'
      });
      const appointments = await response.json();
  
      if (!Array.isArray(appointments)) return;
  
      const workingHours = generateWorkingHours();
      const availableHours = [];
  
      workingHours.forEach(hour => {
        const startDateTime = new Date(`1970-01-01T${hour}:00`);
        const endDateTime = new Date(startDateTime.getTime() + selectedDuration * 60000);
  
        const start = startDateTime.toTimeString().substring(0, 5);
        const end = endDateTime.toTimeString().substring(0, 5);
  
        const conflict = appointments.some(app => {
          const appStart = new Date(`1970-01-01T${app.slot_time}`);
          const appEnd = new Date(appStart.getTime() + app.duration * 60000);
  
          const appStartStr = appStart.toTimeString().substring(0, 5);
          const appEndStr = appEnd.toTimeString().substring(0, 5);
  
          return !(end <= appStartStr || start >= appEndStr);
        });
  
        if (!conflict) {
          availableHours.push(hour);
        }
      });
  
      const hourSelect = document.getElementById('hourSelect');
      hourSelect.innerHTML = '<option value="">בחר שעה</option>';
      availableHours.forEach(h => {
        const option = document.createElement('option');
        option.value = h;
        option.textContent = h;
        hourSelect.appendChild(option);
      });
  
      /*document.addEventListener('DOMContentLoaded', function () {
        // מאזין לשליחת טופס הדיווח
        document.getElementById('abandentpopup_form').addEventListener('submit', async function (e) {
          e.preventDefault(); // מונע ריענון של הדף
          console.log("i entered abandoned form");
      
          const form = document.getElementById('abandentpopup_form');
          const formData = new FormData(form); // כולל גם את הקובץ אם צורף
      
          try {
            const response = await fetch('http://localhost:3000/report-dog', {
              method: 'POST',
              body: formData,
              credentials: 'include'
            });
      
            const result = await response.json();
            alert(result.message || 'הפנייה נשלחה בהצלחה!');
          } catch (err) {
            console.error('שגיאה בשליחת הפנייה:', err);
            alert('שגיאה בשליחת הטופס');
          }
        });
        }); 
        */
      } catch (error) {
        console.error('Error in loadAvailableHours:', error);
      }
    }
  async function submitAbandonedDogForm() {
    const size = document.getElementById('dogSizeSelect').value;
    const health = document.getElementById('healthStatusSelect').value;
    const address = document.getElementById('abandon_address').value;
    const notes = document.getElementById('abandon_notes').value;
    const image = document.getElementById('picupload').files[0];
  
    const formData = new FormData();
    formData.append('size', size);
    formData.append('health', health);
    formData.append('address', address);
    formData.append('notes', notes);
    if (image) formData.append('image', image);
  
    try {
      const res = await fetch('http://localhost:3000/report-dog', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
  
    //  const result = await res.json();
      //alert(result.message || 'הדיווח נשלח בהצלחה!');
      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'הפנייה נשלחה בהצלחה!');
        
      } else {
        const errorText = await response.json(); // מנסה לקרוא את הטקסט של השגיאה
        console.error('Server error:', errorText);
      }
      
    } catch (error) {
     console.error('שגיאה בשליחת הדיווח:', error);
      alert('שגיאה בשליחת הדיווח'); // למ רות שהנתונים נשמרים , ההודעה מוצגת
    }
  }
  
  
  document.querySelector('.file-upload span').addEventListener('click', () => {
    document.getElementById('picupload').click();

  //  document.querySelector('.popup-button').addEventListener('click', submitAbandonedDogForm);

  });
  

  async function loadUserDogsForBoarding() {
    try {
      const res = await fetch('http://localhost:3000/my-dogs', {
        credentials: 'include'
      });
      const dogs = await res.json();
  
      const dogSelect = document.getElementById('boardingDogSelect');
      dogSelect.innerHTML = '<option value="">בחר כלב</option>';
  
      dogs.forEach(dog => {
        const option = document.createElement('option');
        option.value = dog.id;
        option.textContent = dog.name;
        dogSelect.appendChild(option);
      });
    } catch (err) {
      console.error('שגיאה בטעינת הכלבים לטופס הפנסיון:', err);
    }
  }
  
  async function checkBoardingAvailability(startDate, endDate) {
    console.log('Check-in:', startDate, 'Check-out:', endDate);

    try {
      const response = await fetch(`http://localhost:3000/boarding-availability?start_date=${startDate}&end_date=${endDate}`, {
        credentials: 'include'
      });
      const result = await response.json();
      console.log('Availability result:', result);
  
      if (result.available) {
        return true;
      } else {
        alert('אין תאים פנויים בכל התאריכים שנבחרו. ימים לא זמינים:\n' + result.unavailableDates.join('\n'));
        return false;
      }
    } catch (error) {
      console.error('שגיאה בבדיקת זמינות:', error);
      alert('שגיאה בבדיקת זמינות הפנסיון');
      return false;
    }
  }

  async function submitBoardingAppointment(e) {
    e.preventDefault();
 // async function submitBoardingAppointment() {
    const startDate = document.getElementById('checkinDate').value;
    const endDate = document.getElementById('checkoutDate').value;
    const dogId = document.getElementById('boardingDogSelect').value;
    const notes = document.getElementById('boardingNotes').value;
  
    if (!startDate || !endDate || !dogId) {
      alert('נא למלא את כל השדות');
      return;
    }
  
    const available = await checkBoardingAvailability(startDate, endDate);
    if (!available) return;
  
    try {
      const response = await fetch('http://localhost:3000/boarding-appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
body: JSON.stringify({
  check_in: startDate,
  check_out: endDate,
  dog_id: dogId,
  notes: notes
})
      });
  
      const result = await response.json();
      console.log('Boarding appointment result:', result);
      alert(result.message || 'התור נקבע בהצלחה!');
    } catch (error) {
      console.error('שגיאה בשליחת התור:', error);
      alert('שגיאה בשליחת הטופס');
    }
  }
  
      