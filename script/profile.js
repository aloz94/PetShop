

async function checkLogin() {
    try {
        const response = await fetch('/profile', {
            method: 'GET',
            credentials: 'include'   // 🔥 חשוב מאוד כדי שהקוקי יישלח אוטומטית
        });

        if (response.ok) {
            const data = await response.json();
           // document.getElementById('username').innerText = `ברוך הבא, ${data.user.name}!`;
        } else {
            alert('ההתחברות שלך פגה תוקפה. נא להתחבר שוב.');
            window.location.href = '/index.html';
        }
    } catch (error) {
        console.error('Error checking token:', error);
        alert('בעיה באימות ההתחברות. נא להתחבר שוב.');
        window.location.href = '/index.html';
    }
}



async function logout() {
    await fetch('/logout', {
        method: 'POST',
        credentials: 'include'
    });
    window.location.href = '/index.html';
}

function openPopup(popupId) {
    document.getElementById(popupId).style.display = "flex";
}

function closePopup(popupId) {
    document.getElementById(popupId).style.display = "none";
}
window.onload = checkLogin;

document.addEventListener('DOMContentLoaded', function() {
    loadUserDetails();
    loadUserDogs();  // call on page load
    document.getElementById('AddDog_form').addEventListener('submit', handleAddDogForm);
    //loadGroomingAppointments();
    //loadAllAppointments(); // load all appointments on page load
    loadReports();
   // loadFutureAppointments(); // load future appointments on page load

})


  
  // Fetch personal details from server
  async function loadUserDetails() {
    try {
      const res = await fetch('/profile/details', {
        method: 'GET',
        credentials: 'include'  // send cookie
      });
  
      if (!res.ok) {
        throw new Error('Not authorized or server error');
      }
  
      const user = await res.json();
      // user = { id, name, email, phone, address }
  
      document.getElementById('info-id').textContent      = user.id;
      document.getElementById('info-name').textContent    = user.name;
      document.getElementById('info-email').textContent   = user.email;
      document.getElementById('info-phone').textContent   = user.phone;
      document.getElementById('info-address').textContent = user.address;
      document.getElementById('username').innerText = `ברוך הבא, ${user.name}!`;


    } catch (err) {
      console.error('Failed to load user details:', err);
      // Optionally redirect to login
      // window.location.href = '/index.html';
    }
  }
  
  async function loadUserDogs() {
    const res = await fetch('/my-dogs', { credentials: 'include' });
  const dogs = await res.json();

  const container = document.getElementById('dog-list');
  container.innerHTML = '';
  dogs.forEach(dog => {
    const card = document.createElement('div');
    card.className = 'dog-card';
    card.innerHTML = `
      <div class="dog-name">${dog.name}</div>
      <ul class="dog-info">
        <li><span>גזע:</span><span>${dog.breed}</span></li>
        <li><span>גודל:</span><span>${dog.size}</span></li>
        <li><span>מין:</span><span>${dog.gender}</span></li>
      </ul>
    `;
    container.appendChild(card);
  });
}

async function handleAddDogForm(e) {
    e.preventDefault();
  
    // איסוף ערכים
    const name  = document.getElementById('dogName').value.trim();
    const breed = document.getElementById('dogBreed').value.trim();
    const age   = parseInt(document.getElementById('dogAge').value);
    const size  = document.getElementById('dogSize').value;
    const gender = document.querySelector('input[name="dogGender"]:checked')?.value;
  
    // בדיקה בסיסית
    if (!name || !breed || isNaN(age) || !size || !gender) {
      alert('נא למלא את כל השדות המסומנים בכוכבית');
      return;
    }
  
    try {
      const res = await fetch('/add-dog', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, breed, age, size, gender })
      });
  
      const data = await res.json();
      if (res.ok) {
        alert('הכלב נוסף בהצלחה!');
        // רענון רשימת הכלבים בפרופיל
        loadUserDogs();
        //closeAddDogPopup({ target: document.getElementById('AddDog_popup') });
        closePopup('AddDog_popup');
      } else {
        alert(data.message || 'שגיאה בהוספת הכלב');
      }
    } catch (err) {
      console.error(err);
      alert('שגיאה בהוספת הכלב');
    }
  }

  // 1) לאחר loadUserDogs הוסף את הפונקציות הבאות:

// א. פותח popup עריכה וממלא את השדות
function openEditDog(id, name, breed, age, size, gender) {
    openPopup('EditDog_popup');
  
    document.getElementById('editDogId').value    = id;
    document.getElementById('editDogName').value  = name;
    document.getElementById('editDogBreed').value = breed;
    document.getElementById('editDogAge').value   = age;
    document.getElementById('editDogSize').value  = size;
  
    // ערכי ה-gender צריכים להיות "male" או "female"
    const radio = document.querySelector(
      `input[name="editDogGender"][value="${gender}"]`
    );
    if (radio) {
      radio.checked = true;
    } else {
      console.warn(`No radio found for gender="${gender}"`);
    }
  }
  
  
  // ב. שולח את השינויים לשרת ומרענן את הרשימה
  async function submitEditDog() {
    const id     = document.getElementById('editDogId').value;
    const name   = document.getElementById('editDogName').value.trim();
    const breed  = document.getElementById('editDogBreed').value.trim();
    const age    = parseInt(document.getElementById('editDogAge').value, 10);
    const size   = document.getElementById('editDogSize').value;
    const gender = document.querySelector('input[name="editDogGender"]:checked').value;
  
    // בדיקות
    if (!name || !breed || isNaN(age) || !size || !gender) {
      alert('נא למלא את כל השדות');
      return;
    }
  
    try {
      const res = await fetch(`/dogs/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, breed, age, size, gender })
      });
  
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error updating dog');
      }
  
      alert('הכלב עודכן בהצלחה!');
      closePopup('EditDog_popup');
      loadUserDogs(); // טריגר לרענון הכרטיסים
    } catch (err) {
      console.error('Error editing dog:', err);
      alert('שגיאה בעדכון הכלב');
    }
  }
  
  
  // 2) בתום loadUserDogs: הוסף כפתור עריכה יחד עם מחיקה לכל כרטיס
async function loadUserDogs() {
  const res = await fetch('/my-dogs', {
    credentials: 'include'
  });
  const dogs = await res.json();

  const container = document.getElementById('dog-list');
  container.innerHTML = '';

  dogs.forEach(dog => {
    const card = document.createElement('div');
    card.className =
      'dog-card ';

    card.innerHTML = `
      <div >
        <img
          src="${dog.image ? `/uploads/${dog.image}` : 'https://cdn-icons-png.flaticon.com/512/616/616408.png'}"
          alt="${dog.name}"
          class="w-16 h-16 rounded-full object-cover border textalign-center mx-auto mb-2"
        />
        <div>
          <h4 class="text-lg font-semibold text-gray-800">${dog.name}</h4>
          <p class="text-sm text-gray-600">גזע: ${dog.breed}</p>
        </div>
      </div>

      <ul class="text-sm text-gray-600 mb-4 space-y-1">
        <li>גודל: ${dog.size}</li>
        <li>מין: ${dog.gender === 'male' ? 'זכר' : 'נקבה'}</li>
        <li>גיל: ${dog.age}</li>
      </ul>

      <div class="flex justify-center mt-4 gap-2">
        <button
          class="edit-btn bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition "
          onclick="openEditDog(${dog.id}, '${dog.name}', '${dog.breed}', ${dog.age}, '${dog.size}', '${dog.gender}')"
        >
          ✏ ערוך
        </button>
        <button
          class="delete-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition textalign-center"
          onclick="deleteDog(${dog.id})"
        >
          🗑 מחק
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}
  
  // 3) מדגם פונקציית deleteDog  
  async function deleteDog(id) {
    if (!confirm('למחוק כלב זה?')) return;
  
    try {
      const res = await fetch(`/dogs/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error deleting dog');
      }
      alert('הכלב נמחק בהצלחה');
      loadUserDogs();  // רענון הכרטיסים
    } catch (err) {
      console.error('Error deleting dog:', err);
      alert('שגיאה במחיקת הכלב');
    }
  }
  
  function formatHebrewDate(isoDateStr) {
    // יוצרים אובייקט Date
    const date = new Date(isoDateStr);
    // מחזירים מחרוזת dd/mm/yyyy
    return date.toLocaleDateString('he-IL', {
      day  : '2-digit',
      month: '2-digit',
      year : 'numeric'
    });
  }
  
 /* async function loadGroomingAppointments() {
    try {
      const response = await fetch('http://localhost:3000/profile/grooming', {
        credentials: 'include'
      });
      const grooming = response.ok ? await response.json() : [];
  
      const container = document.getElementById('grooming-list');
      container.innerHTML = '';
  
      if (grooming.length === 0) {
        container.innerHTML = '<li>אין תורי טיפוח</li>';
        return;
      }
  
      grooming.forEach(app => {
        // נניח שיש גם app.service_name, app.dog_name, app.slot_time
        const timeParts = app.slot_time.split(':');                  // ["11","30","00"]
      const formattedTime = `${timeParts[0].padStart(2,'0')}:${timeParts[1].padStart(2,'0')}`;
        const formattedDate = formatHebrewDate(app.appointment_date);
        const li = document.createElement('li');
        li.textContent = 
        `${app.service_name} לכלב ${app.dog_name} בתאריך ${formattedDate} בשעה ${formattedTime}`;
        container.appendChild(li);
      });
    } catch (err) {
      console.error('Error loading grooming appointments:', err);
    }
  }*/
    
    
    // פורמט שעה מ־"2025-05-15T21:00:00.000Z" ל-"21:00"
    function formatHebTime(isoString) {
      const d = new Date(isoString);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    }
    
    function formatHebDate(isoString) {
      const d = new Date(isoString);
      const day   = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year  = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
    
   
    
async function loadAllAppointments() {
  const container = document.getElementById('appointments-list');
  container.innerHTML = '';

  try {
    // 1) Fetch both endpoints
    const [groomRes, boardRes] = await Promise.all([
      fetch('/profile/grooming', { credentials: 'include' }),
      fetch('/profile/boarding', { credentials: 'include' }),
    ]);
    if (!groomRes.ok || !boardRes.ok) throw new Error('Fetch failed');

    const [grooming, boarding] = await Promise.all([
      groomRes.json(),
      boardRes.json(),
    ]);

    // 2) Build unified list
    const all = [];

    // Grooming: appointment_date + slot_time
    grooming.forEach(app => {
      if (!app.appointment_date || !app.slot_time) return;
      const dt = new Date(app.appointment_date);
      const [h, m] = app.slot_time.split(':').map(Number);
      dt.setHours(h, m, 0, 0);
      if (isNaN(dt)) return;
      all.push({
        datetime: dt,
        type:     'grooming',
        text:     `${app.service_name} לכלב ${app.dog_name} בתאריך ` +
                  `${dt.toLocaleDateString('he-IL')} בשעה ${app.slot_time.slice(0,5)}`
      });
    });

    // Boarding: use startdate directly (already ISO)
    boarding.forEach(b => {
      if (!b.startdate) return;
      const dt = new Date(b.startdate);
      if (isNaN(dt)) return;
      all.push({
        datetime: dt,
        type:     'boarding',
        text:     `פנסיון לכלב ${b.dogname} בתאריך ` +
                  `${dt.toLocaleDateString('he-IL')} ל־${b.durationdays} ימים בשעה ` +
                  `${dt.toLocaleTimeString('he-IL',{hour:'2-digit',minute:'2-digit'})}`
      });
    });

    // 3) Sort newest-first
    all.sort((a, b) => b.datetime - a.datetime);

      const maxToShow = 20;
  const toRender  = all.slice(0, maxToShow);

  // 5) Render those
toRender.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = item.text;
      if (index === 0) {
    li.classList.add('latest');
  }

    container.appendChild(li);
  });



  } catch (err) {
    console.error('Failed to load appointments:', err);
    container.innerHTML = '<li class="error">שגיאה בטעינת תורים</li>';
  }
}
//-------------------------------------------------------------------------------------------------------------


// invoke on load
document.addEventListener('DOMContentLoaded', loadAllAppointments);
        // griding appointments
document.addEventListener('DOMContentLoaded', loadFutureAppointments);

async function loadFutureAppointments() {
  const container = document.getElementById('Upcoming-appointments');
  container.innerHTML = '';

  try {
    // 1) Fetch grooming & boarding in parallel
    const [groomRes, boardRes] = await Promise.all([
      fetch('/profile/Upcoming/grooming', { credentials: 'include' }),
      fetch('/profile/Upcoming/boarding', { credentials: 'include' }),
    ]);
    if (!groomRes.ok || !boardRes.ok) {
      throw new Error('Failed to fetch upcoming appointments');
    }
    const [grooming, boarding] = await Promise.all([ groomRes.json(), boardRes.json() ]);

    // 2) Build unified array
    const all = [];
    const now = new Date();

    // 2a) Grooming: combine date + slot_time
    grooming.forEach(app => {
      if (!app.appointment_date || !app.slot_time) return;
      const dt = new Date(app.appointment_date);
      const [h, m] = app.slot_time.split(':').map(Number);
      dt.setHours(h, m, 0, 0);
      if (isNaN(dt) || dt < now) return;
      all.push({
        datetime: dt,
        text:     `${app.service_name} לכלב ${app.dog_name} בתאריך ` +
                  `${dt.toLocaleDateString('he-IL')} בשעה ${app.slot_time.slice(0,5)}`
      });
    });

    // 2b) Boarding: use check_in
    boarding.forEach(b => {
      if (!b.check_in) return;
      const dt = new Date(b.check_in);
      if (isNaN(dt) || dt < now) return;
      all.push({
        datetime: dt,
        text:     `פנסיון לכלב ${b.dog_name} בתאריך ${dt.toLocaleDateString('he-IL')} ל־${b.durationdays} ימים ${b.check_out ? 'עד ' + new Date(b.check_out).toLocaleDateString('he-IL') : ''}`
      });
    });

    // 3) Sort ascending (soonest first)
    all.sort((a, b) => a.datetime - b.datetime);

    // 4) Render into grid, tagging the very first as “next-up”
    all.forEach((item, idx) => {
      const li = document.createElement('li');
      li.textContent = item.text;
      if (idx === 0) li.classList.add('next-up');
      container.appendChild(li);
    });

  } catch (err) {
    console.error('Failed to load upcoming appointments:', err);
    container.innerHTML = '<li class="error">שגיאה בטעינת תורים עתידיים</li>';
  }
}



    async function loadReports() {
      const abandonedStatusLabels = {
  open:       'חדש',
  inprogress: 'בטיפול',
accepted: '  בטיפול - נקבע שליח ',
rejected: 'בטיפול - מתאם שליח אחר',
  ontheway:   'בדרך',
  completed:  'הושלם',
  cancelled:  'בוטל'
};
      const res = await fetch('/profile/reports', { credentials: 'include' });
        console.log('Loading reports...');

        const reports = await res.json();
        
        const container = document.getElementById('reports-list');
        container.innerHTML = '';
        reports.forEach(r => {
            console.log('Abandoned report status:', r.status); // Debug line

          const html = `
            <div class="report-card"  >
              <div class="report-image">
<img src="${r.image_path ? 'uploads/' + r.image_path : 'res/placeholder.png'}" alt="תמונה">              </div>
              <div class="report-info">
              <p><strong>מזהה דיווח:</strong> ${r.id}</p>
                <p><strong>גודל כלב:</strong> ${r.dog_size}</p>
                <p><strong>מצב בריאותי:</strong> ${r.health_status}</p>
                <p><strong>כתובת:</strong> ${r.address}</p>
                <p><strong>הערות:</strong> ${r.notes}</p>
                <p><strong>שליח:</strong> ${r.handler_name ? r.handler_name : 'לא נקבע'}</p>
                <p><strong>גורם סיוע:</strong> ${r.care_provider_name ? r.care_provider_name : 'לא נקבע'}</p>
                <p><strong>סטטוס:</strong> <span class="status-badge status-${r.status}">${abandonedStatusLabels[r.status] || r.status}</span></p>              </div>
              <div class="report-actions">
                <button class="btn-edit" onclick="openEditReport(${r.id})">ערוך</button>
               
              </div>
            </div>`;
          container.insertAdjacentHTML('beforeend', html);
        });
      }
// <button class="btn-delete" onclick="deleteReport(${r.id})">מחק</button>
  /*      const abandonedStatusLabels = {
  open:       'חדש',
  inprogress: 'בטיפול',
  accepted:   'נקבע שליח',
  rejected:   'בטיפול',
  ontheway:   'בדרך',
  completed:  'הושלם',
  cancelled:  'בוטל'
};

        async function loadReports() {
          const response = await fetch('http://localhost:3000/profile/reports', {
            credentials: 'include'
          });
          const reports = await response.json();

          if (response.ok) {
            // Render reports to the page here
            console.log(reports); // For debugging
          } else {
            alert('שגיאה בטעינת הדיווחים');
          }
          
          const container = document.getElementById('reports-list');
        container.innerHTML = '';
        reports.forEach(r => {
          const html = `
            <div class="report-card">
              <div class="report-image">
                <img src="uploads/${r.image_path || 'placeholder.png'}" alt="תמונה">
              </div>
              <div class="report-info">
                <p><strong>גודל כלב:</strong> ${r.dog_size}</p>
                <p><strong>מצב בריאותי:</strong> ${r.health_status}</p>
                <p><strong>כתובת:</strong> ${r.address}</p>
                <p><strong>הערות:</strong> ${r.notes}</p>
<p><strong>סטטוס:</strong> <span class="status-badge status-${r.status}">${abandonedStatusLabels[r.status] || r.status}</span></p>              </div>
              <div class="report-actions">
                <button class="btn-edit" onclick="openEditReport(${r.id})">ערוך</button>
                <button class="btn-delete" onclick="deleteReport(${r.id})">מחק</button>
              </div>
            </div>`;
          container.insertAdjacentHTML('beforeend', html);
        });

        }*/
      
      // next appoitment grooming
        document.addEventListener('DOMContentLoaded', loadNextGrooming);

  async function loadNextGrooming() {
    const statusLabels = {
  scheduled:    'נקבע',
  arrived:      'הגיע',
  in_treatment: 'בטיפול',
  waiting_pick: 'ממתין לאיסוף',
  completed:    'הושלם',
  cancelled:    'בוטל'
};
    try {
      // לקרוא ל־endpoint שמחזיר את התור הבא של הלקוח המחובר
      const res = await fetch('/api/customers/me/grooming/next', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const appt = await res.json();
    if (!res.ok) throw new Error(data.error || res.message || res.statusText);

      // השדות שצריך למלא
      const dateEl    = document.getElementById('grooming-date');
      const timeEl    = document.getElementById('grooming-time');
      const servEl    = document.getElementById('grooming-service');
      const dogEl     = document.getElementById('grooming-dog');
      const statusEl  = document.getElementById('grooming-status');
      const cancelBtn = document.getElementById('grooming-cancel');
      const editBtn   = document.getElementById('grooming-edit');

      if (appt) {
        dateEl.innerText   = `תאריך: ${new Date(appt.date).toLocaleDateString('he-IL')}`;
timeEl.innerText = `שעה: ${appt.time.slice(0, 5)}`;
        servEl.innerText   = `שירות: ${appt.service_type}`;
        dogEl.innerText    = `כלב: ${appt.dog_name}`;
statusEl.innerHTML = `סטטוס: <span class="status-badge status-${appt.status}">${statusLabels[appt.status] || appt.status}</span>`;
        // אופציונלי: טיפול בביטול תור
      } else {
        // אין תור מתוזמן
        dateEl.innerText = 'אין תורים מתוזמנים';
        dateEl.style.textAlign = 'center';
        timeEl.style.display =
        servEl.style.display =
        dogEl.style.display =
        statusEl.style.display =
        cancelBtn.style.display = 'none';
      editBtn.style.display = 'none'; // Hide edit button if no appointment
      }
  editingGroomingId = appt.id; // Save ID for cancellation

      document.getElementById('grooming-cancel').addEventListener('click', async () => {
  if (!confirm('האם אתה בטוח שברצונך לבטל את התור?')) return;

  try {
    const res = await fetch(`/appointments/${editingGroomingId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' })
    });

    if (!res.ok) throw new Error(await res.text());

    alert('התור בוטל בהצלחה');
  } catch (err) {
    console.error('Error cancelling appointment:', err);
    alert('אירעה שגיאה בביטול התור. נסה שנית.');
  }
});


    } catch (err) {
      console.error(err);
    }
  }


  
  //abandoned latest 
  document.addEventListener('DOMContentLoaded', loadAbandonedReports);

  async function loadAbandonedReports() {
    const url  = '/api/customers/me/abandoned-reports';
    const list = document.getElementById('report-list');
    const none = document.getElementById('no-reports');

const abandonedStatusLabels = {
open: 'חדש',
inprogress: 'בטיפול',
accepted: '  בטיפול - נקבע שליח ',
rejected: 'בטיפול - מתאם שליח אחר',
ontheway: 'בדרך',
completed: 'הושלם',
cancelled: 'בוטל'
};
    try {
      const res     = await fetch(url, { credentials: 'include' });
      const reports = await res.json();
      if (!res.ok) throw new Error(reports.error || res.statusText);

      list.innerHTML = '';

      if (reports.length) {
        none.style.display = 'none';
reports.forEach(r => {
  const date = new Date(r.report_date)
                 .toLocaleDateString('he-IL', {
                   day:   '2-digit',
                   month: '2-digit',
                   year:  'numeric'
                 });

  // Build an array of each line you want to show
  const lines = [
    `תאריך: ${date}`,
    `גודל כלב: ${r.dog_size}`,
    `מצב בריאות: ${r.health_status}`,
    'שליח :' + (r.handler_name ? r.handler_name : 'לא נקבע'),
    'גורם סיוע: ' + (r.care_provider_name ? r.care_provider_name : 'לא נקבע'),
    `סטטוס: <span class="status-badge status-${r.status}">${abandonedStatusLabels[r.status] || r.status}</span>`

  ];

  // For each line, create its own <li>
  lines.forEach(text => {
    const li = document.createElement('li');
  li.innerHTML = text; // Use innerHTML to render the badge
    list.appendChild(li);
  });
});
      } else {
        none.style.display = '';
        none.style.textAlign = 'center';
      }
    } catch (err) {
      console.error('Failed to load abandoned reports:', err);
    }
  }

    
// Call this once after your DOM has loaded (or put it in a <script defer> at the bottom)
document.addEventListener('DOMContentLoaded', loadNextBoarding);

async function loadNextBoarding() {
  const boardingStatusLabels = {
  pending:    'נקבע',
  inprogress: 'בתהליך',
  completed:  'הושלם',
  cancelled:  'בוטל'
};

  const url = '/api/customers/me/boarding/next';
  try {
    const res  = await fetch(url, { credentials: 'include' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.statusText);

    const startEl   = document.getElementById('boarding-start');
    const durEl     = document.getElementById('boarding-duration');
    const dogEl     = document.getElementById('boarding-dog');
    const statusEl  = document.getElementById('boarding-status');
    const cancelBtn = document.getElementById('boarding-cancel');
   const editBtn   = document.getElementById('boarding-edit');
    if (data) {
      // Parse & format start date
      const sd = new Date(data.startdate);
startEl.innerText  = `מתחיל: ${sd.toLocaleDateString('he-IL')}`;
durEl.innerText    = `למשך: ${data.durationdays} ימים`;
dogEl.innerText    = `כלב: ${data.dogname}`;
      // Status
statusEl.innerHTML = `סטטוס: <span class="status-badge status-${data.status}">${boardingStatusLabels[data.status] || data.status}</span>`;
      // Show cancel button if hidden
      cancelBtn.style.display = 'inline-block';
      editBtn.style.display = 'inline-block';

    } else {
      // No upcoming booking
      startEl.innerText = 'אין הזמנות מתוזמנות';
      startEl.style.textAlign = 'center';
      [durEl, dogEl, statusEl, cancelBtn, editBtn].forEach(el => el.style.display = 'none');
    }
    editingBoardingId = data.id; // Save ID for cancellation
document.getElementById('boarding-cancel').addEventListener('click', async () => {
  // 1) Confirm with the user
  if (!confirm('האם אתה בטוח שברצונך לבטל את תור הפנסיון?')) return;

  try {
    // 2) Send PATCH to your boarding endpoint
    const res = await fetch(`/boarding/${editingBoardingId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' })
    });

    // 3) Handle errors
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    // 4) Success feedback
    alert('תור הפנסיון בוטל בהצלחה');
    // …here you might also close the modal and refresh your list…
  } catch (err) {
    console.error('Error cancelling boarding appointment:', err);
    alert('אירעה שגיאה בביטול תור הפנסיון. נסה שנית.');
  }
});

  } catch (err) {
    console.error('loadNextBoarding error:', err);
  }
}

  // מפה של סטטוסים לעברית
const orderStatusLabels = {
  new:        'חדש',
  pending:    'בהמתנה',
  on_the_way: 'בדרך',
  cancelled:  'בוטל',
  completed:  'הושלם'
};

async function loadMyStoreOrders() {
  try {
    const res = await fetch('/api/customers/me/orders', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);

    const orders = await res.json();
    const pendingEl   = document.getElementById('storeOrdersPending');
    const completedEl = document.getElementById('storeOrdersCompleted');
    const nonePend    = document.getElementById('noPendingOrders');
    const noneComp    = document.getElementById('noCompletedOrders');

    // נקה קודם
    pendingEl.innerHTML   = '';
    completedEl.innerHTML = '';

    // פצל להזמנות בתהליך/הושלמו
    const pending   = orders.filter(o => o.status !== 'completed');
    const completed = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');

    // בנה אלמנט לכל הזמנה
    function makeLi(o) {
      const date = new Date(o.created_at).toLocaleDateString('he-IL');
      const label = orderStatusLabels[o.status] || o.status;
      const li = document.createElement('li');
      li.innerHTML = `
        הזמנה #<strong>${o.id}</strong> — ${date} — 
        סה״כ: <strong>₪${Number(o.total).toFixed(2)}</strong> — 
        סטטוס: <span class="status-badge status-${o.status}">${label}</span>
<button 
  type="button"
  class="order-details-btn ml-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
  data-id="${o.id}">
  פרטים
</button>

      `;
      return li;
    }

    // מלא pending
    if (pending.length) {
      nonePend.classList.add('hidden');
      pending.forEach(o => pendingEl.appendChild(makeLi(o)));
    } else {
      nonePend.classList.remove('hidden');
    }

    // מלא completed
    if (completed.length) {
      noneComp.classList.add('hidden');
      completed.forEach(o => completedEl.appendChild(makeLi(o)));
    } else {
      noneComp.classList.remove('hidden');
    }
    
    console.log('Loaded store orders:', orders);
  } catch (err) {
    console.error('Error loading store orders:', err);
    alert('שגיאה בטעינת הזמנות החנות');
  }
}

// קרא לפונקציה אחרי שהדף נטען:
document.addEventListener('DOMContentLoaded', loadMyStoreOrders);


document.addEventListener('DOMContentLoaded', () => {
  // 1) Delegate clicks on any .order-details-btn
  document.body.addEventListener('click', e => {
    const btn = e.target.closest('.order-details-btn');
    if (!btn) return;
    const id = btn.dataset.id;
    openOrderDetailsModal(id);
  });

  // 2) Close when clicking the × 
  document
    .getElementById('orderDetailsModal')
    .querySelector('.modal-close')
    .addEventListener('click', closeOrderDetailsModal);
});

async function openOrderDetailsModal(orderId) {
  const modal = document.getElementById('orderDetailsModal');
  const body  = document.getElementById('orderDetailsBody');

  // show loading
  body.innerHTML = `<p>טוען פרטי הזמנה #${orderId}…</p>`;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');

  try {
    const res = await fetch(`/api/orders/${orderId}/full`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const o = await res.json();

    // build your HTML however you like—here’s an example:
    let html = `
  <!-- 1) כותרת ההזמנה -->
  <div class="order-header">
    <h2 style="font-weight: bold;">הזמנה #${o.id}</h2>
    <div class="order-meta">
      <p><strong>נוצר ב:</strong> ${o.created_at}</p>
      <p><strong>סה״כ:</strong> ₪${Number(o.total).toFixed(2)}</p>
    </div>
  </div>

  <!-- 2) פרטי לקוח -->
  <!-- <div class="section">
    <h3>פרטי לקוח</h3>
    <p>${o.customer_name} — ${o.customer_phone} — ${o.customer_email}</p>
  </div> -->

  <!-- 3) כתובת למשלוח -->
  <div class="section">
    <h3 style="text-align: center;">כתובת למשלוח</h3>
    <p>
   ${o.address.city} , ${o.address.street} - ${o.address.house_number}
 
</p>

  </div>

  <!-- 4) פרטי מוצרים -->
  <div class="section">
    <h3 style="text-align: center;">פרטי מוצרים</h3>
    <table>
      <thead>
        <tr>
          <th>מוצר</th>
          <th>כמות</th>
          <th>יחידה</th>
          <th>סה״כ</th>
        </tr>
      </thead>
      <tbody>
        ${o.items.map(it => `
          <tr>
            <td>${it.product_name}</td>
            <td>${it.quantity}</td>
            <td>₪${it.unit_price.toFixed(2)}</td>
            <td>₪${it.line_total.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot class="total-row">
        <tr>
          <td colspan="3">סה״כ הכל</td>
          <td>₪${Number(o.total).toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
  </div>
`;
    body.innerHTML = html;

  } catch (err) {
    console.error('Failed to load order details:', err);
    body.innerHTML = `<p style="color:red;">שגיאה בטעינת פרטי ההזמנה.</p>`;
  }
}

function closeOrderDetailsModal() {
  const modal = document.getElementById('orderDetailsModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
}
