async function checkLogin() {
    try {
        const res = await fetch('http://localhost:3000/profile', { credentials: 'include' });
        if (!res.ok) throw new Error('Not authenticated');
    } catch (err) {
        window.location.href = '/index.html'; // Redirect to login if not authenticated
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
//window.onload = checkLogin;



document.addEventListener('DOMContentLoaded', async() => {
    await checkLogin(); // <--- Add this line

    // בוחרים את כל הלינקים בסיידבר
    const links = document.querySelectorAll('.sidebar ul li a');
    // וגם את כל המקטעים בתוכן
    const sections = document.querySelectorAll('main .content');

    const openGroomBtn = document.getElementById('openGroomingBtn');
if (openGroomBtn) {
  openGroomBtn.addEventListener('click', () => {
    openPopup('groomingpopup');
  });
}

    loadBoardingData();
    loadBoardingStats();
    loadGroomingAppointments();
    loadServices();




    links.forEach(link => {
      link.addEventListener('click', ev => {
        ev.preventDefault();
  
        // 1. איזה section נבחר
        const targetId = link.getAttribute('data-target');
  
        // 2. מסירים את המחלקה .content--active מכל המקטעים
        sections.forEach(sec => sec.classList.remove('content--active'));
  
        // 3. מסמנים את המקטע המתאים כפעיל
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.classList.add('content--active');
        }
  
        // 4. אופציונלי – מסמנים גם את הלינק הפעיל בסיידבר
        links.forEach(l => l.classList.remove('active-link'));
        link.classList.add('active-link');
      });
    });


    document
    .getElementById('customerIdInput')
    .addEventListener('change', loadCustomerDogsById);
  
  // טיפול בסאבמיט
  document
    .getElementById('groomingpopup_form')
    .addEventListener('submit', submitGroomingAppointment);



  });//end of DOMContentLoaded
  
  // מעבר בין סקשנים
document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(link.dataset.target).classList.add('active');
      if (link.dataset.target === 'boarding') loadBoardingData();
    });
  });
  
  
  // טעינת נתוני פנסיון
  async function loadBoardingData() {
    try {
      const res  = await fetch('http://localhost:3000/boardings', { credentials: 'include' });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
  
      const table = document.getElementById('posts');
      // Optionally hide the table itself:
      table.style.display = 'none';
  
      // בנה את האקורדיון על סמך response JSON
      buildAccordionFromData(data);
  
    } catch (err) {
      console.error(err);
      alert('שגיאה בטעינת הפנסיון');
    }
  }
  
  function buildAccordionFromData(data) {
    const table = document.getElementById('posts');
    const accordion = document.createElement('div');
    accordion.classList.add('accordion');
  
    data.forEach(item => {
      const { id, check_in, check_out, customer_name, phone, dog_name } = item;
  
      const header = document.createElement('div');
      header.classList.add('accordion-header');
      header.innerHTML = `
        <span>כניסה: ${check_in}</span>
        <span>יציאה: ${check_out}</span>
        <p> ${dog_name}</p>

      `;
  
      const body = document.createElement('div');
      body.classList.add('accordion-body');
      body.style.display = 'none';
      body.innerHTML = `
        <span>מס' תור - ${id}</span>
         <span>שם לקוח - ${customer_name}</span>
         <span>טלפון -  ${phone}</span>
      `;
  
      header.addEventListener('click', () => {
        const open = header.classList.toggle('open');
        body.style.display = open ? 'block' : 'none';
      });
  
      accordion.append(header, body);
    });
  
    table.insertAdjacentElement('afterend', accordion);
  }
   

  async function loadBoardingStats(date) {
    try {
      const today = date || new Date().toISOString().split('T')[0];
     const res = await fetch('http://localhost:3000/boarding/stats?date=${today}', {
        method: 'GET',
        credentials: 'include',      // <=== חובה
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error('Network response was not OK');
      const { checkins, checkouts } = await res.json();
  
      document.getElementById('checkins-today').textContent = `כניסה היום: ${checkins}`;
     document.getElementById('checkouts-today').textContent = `יציאה היום:${checkouts}`;
    }
    catch (err) {
      console.error('Failed to load boarding stats:', err);
    }
  }

  

  function formatHebTime(isoString) {
    const d = new Date(isoString);
    if (isNaN(d)) return isoString; // אם לא תקין, תחזיר כמו שהוא
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


  /*async function loadGroomingAppointments() {
    try {
      const res = await fetch('http://localhost:3000/grooming/appointments', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
  
      console.log(data); // כדי לוודא שוב
  
      if (!Array.isArray(data)) 
        throw new Error('Invalid response, expected an array');
  
      const tbody = document.querySelector('#grooming-posts tbody');
      tbody.innerHTML = '';  // נקה קודם

      

      data.forEach(item => {
        /*const dt = new Date(item.date + 'T' + item.time);

        // מפיקים תאריך ושעה בפורמט עברי
        const hebDate = dt.toLocaleDateString('he-IL', {
          year : 'numeric',
          month: '2-digit',
          day  : '2-digit'
        }); // => "07.05.2025"
        item.date = hebDate; // עדכון התאריך בפורמט עברי
        
      
        const hebTime = dt.toLocaleTimeString('he-IL', {
          hour  : '2-digit',
          minute: '2-digit'
        }); // => "14:30"
      item.time = hebTime; // עדכון השעה בפורמט עברי
      -----------------------
        const tr = document.createElement('tr');
      
        tr.innerHTML = `
          <td data-label="מס' תור">${item.id}</td>
          <td data-label="תאריך">${item.date}</td>
          <td data-label="שעה">${item.time}</td>
          <td data-label="שירות">${item.service}</td>
          <td data-label="שם לקוח">${item.customer_name}</td>
          <td data-label="טלפון">${item.phone}</td>
          <td data-label="שם כלב">${item.dog_name}</td>   <!-- ה-TD החדש -->
        `;
      
        tbody.appendChild(tr);
      });
        
    } catch (err) {
      console.error('Error loading grooming appointments:', err);
      alert('שגיאה בטעינת תורי טיפוח');
    }
  }
    */
  
  async function loadGroomingAppointments() {
    try {
      const res = await fetch('http://localhost:3000/grooming/appointments', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
  
      const tbody = document.querySelector('#grooming-posts tbody');
      tbody.innerHTML = '';  // נקה קודם
  
      data.forEach(item => {
        // הפורמט של date ו־time מגיע כ־ISO. בוא נמיר כל אחד בנפרד:
        const formattedDate = formatHebDate(item.date);    // "dd/MM/yyyy"
        const formattedTime = item.time.slice(0, 5);    // "HH:mm"
  
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td data-label="מס' תור">${item.id}</td>
          <td data-label="תאריך">${formattedDate}</td>
          <td data-label="שעה">${formattedTime}</td>
          <td data-label="שירות">${item.service}</td>
          <td data-label="שם לקוח">${item.customer_name}</td>
          <td data-label="טלפון">${item.phone}</td>
          <td data-label="שם כלב">${item.dog_name}</td>
        `;
        tbody.appendChild(tr);
      });
  
    } catch (err) {
      console.error('Error loading grooming appointments:', err);
      alert('שגיאה בטעינת תורי טיפוח');
    }
  }


  async function loadCustomerDogsById() {
    const customerId = document.getElementById('customerIdInput').value.trim();
    if (!customerId) return;
  
    try {
      // מניח שיש endpoint שמחזיר את רשימת הכלבים של לקוח לפי ת"ז
      const res = await fetch(`http://localhost:3000/customers/${customerId}/dogs`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to load dogs');
  
      const dogs = await res.json();
      const dogSelect = document.getElementById('dogSelect');
      dogSelect.innerHTML = '<option value="">בחר כלב</option>';
  
      dogs.forEach(dog => {
        const opt = document.createElement('option');
        opt.value = dog.id;
        opt.textContent = dog.name;
        dogSelect.appendChild(opt);
      });
  
    } catch(err) {
      console.error(err);
      alert('לא הצלחנו לטעון את רשימת הכלבים');
    }
  }

  async function submitGroomingAppointment(e) {
  e.preventDefault();
  const customerId = document.getElementById('customerIdInput').value.trim();
  const appointment_date = document.getElementById('appointmentDate').value;
  const slot_time        = document.getElementById('hourSelect').value;
  const service_id       = document.getElementById('serviceSelect').value;
  const dog_id           = document.getElementById('dogSelect').value;
  const notes            = document.getElementById('notes').value;

  if (!customerId) {
    alert('יש להזין ת.ז. של לקוח');
    return;
  }
  // בדיקות נוספות לפי הצורך...

  try {
    const res = await fetch('http://localhost:3000/grooming-appointments', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: customerId,
        appointment_date, slot_time, service_id, dog_id, notes
      })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Error');
    alert('התור נקבע בהצלחה');
    closePopup('groomingpopup');
    // אופציונלי: ריענון לוח תורים
    loadGroomingAppointments();
  } catch (err) {
    console.error(err);
    alert('שגיאה בשמירת התור');
  }
}

// 1. פתח/סגור פופאפ
function openPopup(id) {
  document.getElementById(id).style.display = 'flex';
}
function closePopup(id) {
  document.getElementById(id).style.display = 'none';
}

// 2. אתחול: טעינת שירותים פעם אחת
async function loadServices() {
  const sel = document.getElementById('serviceSelect');
  sel.innerHTML = `<option value="">טוען שירותים…</option>`;
  try {
    const res = await fetch('http://localhost:3000/services', {
      credentials: 'include'
    });
    const services = await res.json();
    sel.innerHTML = `<option value="">בחר שירות</option>`;
    services.forEach(s => {
      const o = document.createElement('option');
      o.value = s.id;
      o.textContent = `${s.name} – ₪${s.price}`;
      o.dataset.duration = s.duration; 
      o.dataset.price = s.price;
      sel.appendChild(o);
    });
  } catch(err) {
    console.error('Error loading services:', err);
    sel.innerHTML = `<option value="">שגיאה בטעינת שירותים</option>`;
  }
}

// 3. כאשר מזינים ת.ז. – טען כלבים
document.getElementById('customerIdInput')
  .addEventListener('change', async function() {
    const cid = this.value.trim();
    const dogSel = document.getElementById('dogSelect');
    dogSel.innerHTML = `<option value="">טוען כלבים…</option>`;
    if (!cid) {
      return dogSel.innerHTML = `<option value="">ראשית הזיני ת.ז.</option>`;
    }
    try {
      const res = await fetch(`http://localhost:3000/customers/${cid}/dogs`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error(res.status);
      const dogs = await res.json();
      dogSel.innerHTML = `<option value="">בחר כלב</option>`;
      dogs.forEach(d => {
        const o = document.createElement('option');
        o.value = d.id;
        o.textContent = d.name;
        dogSel.appendChild(o);
      });
    } catch (err) {
      console.error('Error loading dogs:', err);
      dogSel.innerHTML = `<option value="">שגיאה בטעינת כלבים</option>`;
    }
  });

// 4. כאשר בוחרים שירות – עדכן מחיר
document.getElementById('serviceSelect')
  .addEventListener('change', function() {
    const price = this.selectedOptions[0]?.dataset.price || 0;
    document.getElementById('priceDisplay').textContent = `עלות – ₪${price}`;
    loadAvailableHours(); // נריץ חיפוש שעות בכל בחירה
  });

// 5. כאשר בוחרים תאריך או שירות – טען שעות
document.getElementById('appointmentDate')
  .addEventListener('change', loadAvailableHours);

async function loadAvailableHours() {
  const date = document.getElementById('appointmentDate').value;
  const svcOpt = document.getElementById('serviceSelect').selectedOptions[0];
  if (!date || !svcOpt || !svcOpt.dataset.duration) return;

  const duration = parseInt(svcOpt.dataset.duration);
  // שולח לבק בקו query
  try {
    const res = await fetch(
      `http://localhost:3000/appointments?date=${date}`,
      { credentials: 'include' }
    );
    if (!res.ok) throw new Error(res.status);
    const booked = await res.json(); // [{ start_time, duration }]
    
    // בנה רשימת שעות: 9:00–17:00 חצי שעה
    const hours = [];
    for (let h=9; h<17; h++) {
      hours.push(`${h.toString().padStart(2,'0')}:00`);
      hours.push(`${h.toString().padStart(2,'0')}:30`);
    }

    const select = document.getElementById('hourSelect');
    select.innerHTML = `<option value="">בחר שעה</option>`;

    hours.forEach(slot => {
      // חשב end = slot + duration
      const [hh, mm] = slot.split(':').map(Number);
      const start = new Date(`1970-01-01T${slot}:00`);
      const end = new Date(start.getTime() + duration*60000);
      const endStr = end.toTimeString().substring(0,5);

      // בדוק חפיפה עם תורים ב־booked
      const conflict = booked.some(ap => {
        return !(endStr <= ap.start_time || slot >= ap.end_time);
      });
      if (!conflict) {
        const o = document.createElement('option');
        o.value = slot;
        o.textContent = slot;
        select.appendChild(o);
      }
    });
  } catch(err) {
    console.error('Error loading hours:', err);
  }
}

// 6. הגשת הטופס – שליחת POST
document.getElementById('groomingpopup_form')
  .addEventListener('submit', async function(e) {
    e.preventDefault();
    const body = {
      customer_id    : +document.getElementById('customerIdInput').value,
      dog_id         : +document.getElementById('dogSelect').value,
      service_id     : +document.getElementById('serviceSelect').value,
      appointment_date: document.getElementById('appointmentDate').value,
      slot_time      : document.getElementById('hourSelect').value,
      notes          : document.getElementById('notes').value,
    };
    try {
      const res = await fetch('http://localhost:3000/grooming-appointments', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(body)
      });
      const msg = await res.json();
      if (res.ok) {
        alert('התור נקבע בהצלחה');
        closePopup('groomingpopup');
        this.reset();
      } else {
        throw new Error(msg.message || res.status);
      }
    } catch(err) {
      console.error('Error submitting form:', err);
      alert('שגיאה בשמירת תור');
    }
  });


