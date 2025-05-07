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
  //sidebar content activation
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

}
    loadBoardingData();
    loadBoardingStats();
    loadGroomingAppointments();
    loadServices();
    loadAbandonedReports()
    loadHandlersAccordion()
    loadCareProvidersAccordion()
    loadCustomersAccordion()
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
  
  //build the designed openning accordion table
  function buildAccordionFromData(data, container, headerKeys, bodyKeys, labels) {
    // אם קיבלת מחרוזת – שלוף את האלמנט
    if (typeof container === 'string') {
      container = document.getElementById(container);
    }
    if (!container) {
      console.error('Accordion container not found');
      return;
    }
  
    // נקה מה שהיה שם
    container.innerHTML = '';
  
    data.forEach(item => {
      const accordion = document.createElement('div');
      accordion.classList.add('accordion');
  
      // כותרת
      const header = document.createElement('div');
      header.classList.add('accordion-header');
      header.innerHTML = headerKeys
        .map(key => `<span>${labels[key]}: ${item[key] || ''}</span>`)
        .join('');
  
      // גוף
      const body = document.createElement('div');
      body.classList.add('accordion-body');
      body.style.display = 'none';
      body.innerHTML = bodyKeys
        .map(key => `<span data-label="${labels[key]}">${item[key] || ''}</span>`)
        .join('');
  
      // טריגר פתיחה/סגירה
      header.addEventListener('click', () => {
        const open = header.classList.toggle('open');
        body.style.display = open ? 'flex' : 'none';
      });
  
      accordion.append(header, body);
      container.append(accordion);
    });
  }
  
  
  // פונקציה גנרית שאחראית על כל ההמרה לטבלה לאקורדיון
function transformTableToAccordion(cfg) {
  const { tableId, containerId, headerKeys, bodyKeys, labels } = cfg;
  const table     = document.getElementById(tableId);
  const container = document.getElementById(containerId);
  const rows      = Array.from(table.tBodies[0].rows);

  const data = rows.map(row => {
    const cells = row.cells;
    const obj = {};
    Object.keys(labels).forEach((key, i) => {
      obj[key] = cells[i]?.innerText.trim() || '';
    });
    return obj;
  });

  table.style.display = 'none';
  buildAccordionFromData(data, container, headerKeys, bodyKeys, labels);
}

  // טעינת נתוני פנסיון
  async function loadBoardingData() {
    try {
      const res  = await fetch('http://localhost:3000/boardings', { credentials: 'include' });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
  
      

       const table = document.getElementById('boarding-posts');
 if (table) table.style.display = 'none';

 // וכאן—קרא לבניית האקורדיון מתוך ה־JSON
 buildAccordionFromData(
   data,
   'accordion-boarding',
   ['check_in','check_out','dog_name'],   // כותרת
   ['id','customer_name','phone'],        // גוף
   {                                      // תוויות
     id: "מס' תור",
     check_in: "תאריך כניסה",
     check_out: "תאריך יציאה",
     dog_name: "שם כלב",
     customer_name: "שם לקוח",
     phone: "טלפון"
   }
 );

  
    } catch (err) {
      console.error(err);
      alert('שגיאה בטעינת הפנסיון');
    }
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

  
  // פונקציה להמרת תאריך ושעה לפורמט עברי  
  function formatHebTime(timeString) {
    // אם זה כבר במשפט HH:mm או HH:mm:ss
    const m = timeString.match(/^(\d{2}):(\d{2})/);
    if (m) {
      // תחזיר "HH:mm"
      return `${m[1]}:${m[2]}`;
    }
    // אחרת תנסה לפרש בתור תאריך מלא
    const d = new Date(timeString);
    if (isNaN(d)) return timeString; 
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

  async function loadGroomingAppointments() {
    try {
      const res = await fetch('http://localhost:3000/grooming/appointments', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
  
      // 1. פורמט תאריך ושעה בעברית
      const formatted = data.map(item => ({
        ...item,
        date: formatHebDate(item.date),      // e.g. "07/05/2025"
        time: formatHebTime(item.time)       // e.g. "14:30"
      }));
  
      // 2. הסתר את הטבלה הסטטית (tbody כבר לא בשימוש)
      const table = document.getElementById('grooming-posts');
      if (table) table.style.display = 'none';
  
      // 3. תבנה אקורדיון מתוך המערך שהמירנו
      buildAccordionFromData(
        formatted,
        'accordion-grooming',             // id של הקונטיינר
        ['date','time','service'],         // HEADER keys
        ['id','customer_name','phone','dog_name'], // BODY keys
        {
          id:            "מס' תור",
          date:          "תאריך",
          time:          "שעה",
          service:       "שירות",
          customer_name: "שם לקוח",
          phone:         "טלפון",
          dog_name:      "שם כלב"
        }
      );
  
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


  async function loadAbandonedReports() {
    console.log('calling loadAbandonedReports…');
  
    try {
      // 1. קבל נתונים מהשרת
      const res = await fetch('http://localhost:3000/dashboard/reports', {
        credentials: 'include',
        cache: 'no-cache'     // <-- always force a fresh cop
        
      });
     
      if (!res.ok) {
        // pull the text (or JSON) for debugging
        const errText = await res.text();
        throw new Error(`Server error ${res.status}: ${errText}`);
      }
      const data = await res.json();
      console.log('abandoned data:', data);

      // 2. הסתר את הטבלה הסטטית
      const table = document.getElementById('abandoned-posts');
      if (data.length > 0) {
        table.style.display = 'none';
      } else {
        table.style.display = ''; // השאר אותה גלויה
      }
      
      // 3. בנה אקורדיון מתוך ה־JSON
      const formatted = data.map(item => ({
        ...item,
        handler_id:    item.handler_id    ?? 'לא שובץ',

        care_provider: item.care_provider ?? 'לא שובץ',
      
        image_path: `<img src="/uploads/${item.image_path}" alt="תמונה" style="max-width:100px;">`
      }));
  
      buildAccordionFromData(
        formatted,
        'accordion-abandoned',
        ['id','customer_name','phone','dog_size','health_status','care_provider','handler_id'],
        ['address','notes','status','image_path','report_date'],
        {
          id:             "מס' דוח",
          customer_name:  "שם לקוח",
          phone:          "טלפון",
          dog_size:       "גודל כלב",
          health_status:  "מצב בריאות",
          report_date:    "תאריך דיווח",
          address:        "כתובת",
          notes:          "הערות",
          status:         "סטטוס",
          handler_id:       "שליח",
          care_provider: "גורם מטפל ",
          image_path:     "תמונה"
        }
      );
    
    } catch (err) {
      console.error('Error loading abandoned reports:', err);
      alert('שגיאה בטעינת פניות לכלבים נטושים');
    }
  }
  
  async function loadHandlersAccordion() {
    try {
      const res = await fetch('http://localhost:3000/handlers', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
  
      // הסתרת הטבלה
      const table = document.getElementById('handlers-posts');
      if (table) table.style.display = 'none';
  
      // בניית אקורדיון
      buildAccordionFromData(
        data,
        'accordion-handlers',
        ['name','phone','vehicle_type'],                        // שדות בכותרת
        ['id','address','email'], // שדות בגוף
        {
          id:            "מס' שליח",
          name:          "שם",
          phone:         "טלפון",
          address:       "כתובת",
          vehicle_type:  "סוג רכב",
          email:         "אימייל"
        }
      );
  
    } catch (err) {
      console.error('Error loading handlers:', err);
      alert('שגיאה בטעינת שליחים');
    }
  }
  

  async function loadCareProvidersAccordion() {
    try {
      const res = await fetch('http://localhost:3000/care-providers', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
  
      // הסתרת הטבלה
      const table = document.getElementById('support-posts');
      if (table) table.style.display = 'none';
  
      // בניית אקורדיון
      buildAccordionFromData(
        data,
        'accordion-support',
        ['id','name'],                         // כותרת
        ['address','phone','additional_phone','type'], // גוף
        {
          id:               "מס' גורם",
          name:             "שם",
          address:          "כתובת",
          phone:            "טלפון",
          additional_phone: "טלפון נוסף",
          type:             "סוג"
        }
      );
  
    } catch (err) {
      console.error('Error loading care providers:', err);
      alert('שגיאה בטעינת גורמי סיוע');
    }
  }
  
  async function loadCustomersAccordion() {
    try {
      const res = await fetch('http://localhost:3000/dashboard/customers', {
        credentials: 'include'
      });
      console.log('res:', res);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
  
      // נסתרת הטבלה
      const table = document.getElementById('customers-posts');
      if (table) table.style.display = 'none';
  
      // בונים אקורדיון
      const container = document.getElementById('accordion-customers');
      container.innerHTML = ''; 
  
      data.forEach(cust => {
        const accordion = document.createElement('div');
        accordion.classList.add('accordion');
  
        // כותרת
        const header = document.createElement('div');
        header.classList.add('accordion-header');
        header.innerHTML = `
          <span>מס' לקוח: ${cust.id}</span>
          <span>שם: ${cust.customer_name}</span>
          <span>טלפון: ${cust.phone}</span>
        `;
  
        // גוף
        const body = document.createElement('div');
        body.classList.add('accordion-body');
        body.style.display = 'none';
  
        // פרטי לקוח
        let html = `
          <div class="cust-info">
          <div class="email">📧 אימייל: ${cust.email}</div>
         <div class="address">📍 כתובת: ${cust.address}</div>
        </div>
          <h4>🐶 כלבים:</h4>
  <div class="dog-cards">
    ${cust.dogs.map(d => `
      <div class="dog-card">
        <h5>${d.name}</h5>
        <div>גזע: ${d.breed}</div>
        <div>גיל: ${d.age}</div>
        <div>מין: ${d.gender}</div>
        <div>גודל: ${d.size}</div>
      </div>
    `).join('')}
  </div>
`;
        html += '</ul>';
        body.innerHTML = html;
  
        header.addEventListener('click', () => {
          const open = header.classList.toggle('open');
          body.style.display = open ? 'block' : 'none';
        });
  
        accordion.append(header, body);
        container.append(accordion);
      });
  
    } catch (err) {
      console.error('Error loading customers:', err);
      alert('שגיאה בטעינת לקוחות');
    }
  }
  
  