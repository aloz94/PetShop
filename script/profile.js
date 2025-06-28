

async function checkLogin() {
    try {
        const response = await fetch('http://localhost:3000/profile', {
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
    await fetch('http://localhost:3000/logout', {
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
    loadAllAppointments(); // load all appointments on page load
    loadReports();
    loadFutureAppointments(); // load future appointments on page load

})


  
  // Fetch personal details from server
  async function loadUserDetails() {
    try {
      const res = await fetch('http://localhost:3000/profile/details', {
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
    const res = await fetch('http://localhost:3000/my-dogs', { credentials: 'include' });
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
      const res = await fetch('http://localhost:3000/add-dog', {
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
      const res = await fetch(`http://localhost:3000/dogs/${id}`, {
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
    const res = await fetch('http://localhost:3000/my-dogs', { credentials: 'include' });
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
          <li><span>גיל:</span><span>${dog.age}</span></li>

        </ul>
        <div class="card-buttons">
          <button class="edit-btn"
                  onclick="openEditDog(${dog.id},
                                       '${dog.name}',
                                       '${dog.breed}',
                                       ${dog.age},
                                       '${dog.size}',
                                       '${dog.gender}')">
            ✏ ערוך
          </button>
          <button class="delete-btn" onclick="deleteDog(${dog.id})">
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
      const res = await fetch(`http://localhost:3000/dogs/${id}`, {
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
        // 1. load grooming
        const groomRes = await fetch('http://localhost:3000/profile/grooming', {
          credentials: 'include'
        });
        const grooming = await groomRes.json();
    
        // 2. load boarding
        const boardRes = await fetch('http://localhost:3000/profile/boarding', {
          credentials: 'include'
        });
        const boarding = await boardRes.json();
    
        // 3. merge
        const all = [];
    
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
        boarding.forEach(b => {
          all.push({
            type:       'boarding',
            start:      b.check_in,
            end:        b.check_out,
            dog:        b.dog_name
          });
        });
    
        // 4. sort by date
        all.sort((a, b) => {
          const dateA = new Date(a.type==='grooming' ? a.datetime : a.start);
          const dateB = new Date(b.type==='grooming' ? b.datetime : b.start);
          return dateA - dateB;
        });
    
        // 5. display
        all.forEach(item => {
          let html;
          if (item.type === 'grooming') {
            html = `
              <li>
                ${formatHebDate(item.datetime)} – ${item.service} לכלב ${item.dog} בשעה ${formatHebTime(item.datetime)}
              </li>`;
          } else {
            html = `
              <li>
                פנסיון לכלב ${item.dog} מ־${formatHebDate(item.start)} עד־${formatHebDate(item.end)}
              </li>`;
          }
          container.insertAdjacentHTML('beforeend', html);
        });
      }
      catch (err) {
        console.error('Failed to load appointments:', err);
        container.innerHTML = '<li class="error">שגיאה בטעינת היסטוריית תורים</li>';
      }
    }
        
    async function loadFutureAppointments() {
      const container = document.getElementById('Upcoming-appointments');
      container.innerHTML = '';
    
      try {
        // 1. load grooming
        const groomRes = await fetch('http://localhost:3000/profile/Upcoming/grooming', {
          credentials: 'include'
        });
        const grooming = await groomRes.json();
    
        // 2. load boarding
        const boardRes = await fetch('http://localhost:3000/profile/Upcoming/boarding', {
          credentials: 'include'
        });
        const boarding = await boardRes.json();
    
        // 3. merge
        const all = [];
    
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
        boarding.forEach(b => {
          all.push({
            type:       'boarding',
            start:      b.check_in,
            end:        b.check_out,
            dog:        b.dog_name
          });
        });
    
        // 4. sort by date
        all.sort((a, b) => {
          const dateA = new Date(a.type==='grooming' ? a.datetime : a.start);
          const dateB = new Date(b.type==='grooming' ? b.datetime : b.start);
          return dateA - dateB;
        });
    
        // 5. display
        all.forEach(item => {
          let html;
          if (item.type === 'grooming') {
            html = `
              <li>
                ${formatHebDate(item.datetime)} – ${item.service} לכלב ${item.dog} בשעה ${formatHebTime(item.datetime)}
              </li>`;
          } else {
            html = `
              <li>
                פנסיון לכלב ${item.dog} מ־${formatHebDate(item.start)} עד־${formatHebDate(item.end)}
              </li>`;
          }
          container.insertAdjacentHTML('beforeend', html);
        });
      }
      catch (err) {
        console.error('Failed to load appointments:', err);
        container.innerHTML = '<li class="error">שגיאה בטעינת היסטוריית תורים</li>';
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
      const res = await fetch('http://localhost:3000/profile/reports', { credentials: 'include' });
        console.log('Loading reports...');

        const reports = await res.json();
        
        const container = document.getElementById('reports-list');
        container.innerHTML = '';
        reports.forEach(r => {
            console.log('Abandoned report status:', r.status); // Debug line

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
                <p><strong>שליח:</strong> ${r.handler_name ? r.handler_name : 'לא נקבע'}</p>
                <p><strong>גורם סיוע:</strong> ${r.care_provider_name ? r.care_provider_name : 'לא נקבע'}</p>
                <p><strong>סטטוס:</strong> <span class="status-badge status-${r.status}">${abandonedStatusLabels[r.status] || r.status}</span></p>              </div>
              <div class="report-actions">
                <button class="btn-edit" onclick="openEditReport(${r.id})">ערוך</button>
                <button class="btn-delete" onclick="deleteReport(${r.id})">מחק</button>
              </div>
            </div>`;
          container.insertAdjacentHTML('beforeend', html);
        });
      }

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

      if (appt) {
        dateEl.innerText   = `תאריך: ${new Date(appt.date).toLocaleDateString('he-IL')}`;
        timeEl.innerText   = `שעה: ${appt.time}`;
        servEl.innerText   = `שירות: ${appt.service_type}`;
        dogEl.innerText    = `כלב: ${appt.dog_name}`;
statusEl.innerHTML = `סטטוס: <span class="status-badge status-${appt.status}">${statusLabels[appt.status] || appt.status}</span>`;
        // אופציונלי: טיפול בביטול תור
        cancelBtn.addEventListener('click', async () => {
          await fetch(`/api/customers/me/grooming/${appt.id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          // אחרי ביטול רענן את הכרטיס
          loadNextGrooming();
        });

      } else {
        // אין תור מתוזמן
        dateEl.innerText = 'אין תורים מתוזמנים';
        timeEl.style.display =
        servEl.style.display =
        dogEl.style.display =
        statusEl.style.display =
        cancelBtn.style.display = 'none';
      }

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
      cancelBtn.onclick = async () => {
        await fetch(`/api/customers/me/boarding/${data.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        loadNextBoarding();  // refresh
      };
    } else {
      // No upcoming booking
      startEl.innerText = 'אין הזמנות מתוזמנות';
      [durEl, dogEl, statusEl, cancelBtn].forEach(el => el.style.display = 'none');
    }

  } catch (err) {
    console.error('loadNextBoarding error:', err);
  }
}
  
  

