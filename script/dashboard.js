// =================== LOGIN & LOGOUT ===================
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
// =================== POPUP HANDLERS ===================
function openPopup(popupId) {
    document.getElementById(popupId).style.display = "flex";
}

function closePopup(popupId) {
    document.getElementById(popupId).style.display = "none";
}
// =================== DOM READY & INITIAL LOADS ===================
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
  loadAvailableHours();

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
await loadBoardingData();
await loadBoardingStats();
await loadGroomingAppointments();
await loadServices();
await loadServicesEdit();
await loadAbandonedReports();
await loadHandlersAccordion();
await loadCareProvidersAccordion();
await loadCustomersAccordion();
await loadKpiData();
 

  // טען את כלבים של לקוח לפי ת"ז
  /*
    document
    .getElementById('customerIdInput')
    .addEventListener('change', loadCustomerDogsById);*/
document.getElementById('customerIdInput')
  .addEventListener('change', () => loadCustomerDogsById('customerIdInput', 'dogSelect'));
  
document.getElementById('BcustomerIdInput')
  .addEventListener('change', () => loadCustomerDogsById('BcustomerIdInput', 'BboardingDogSelect'));
document
  .getElementById('appointmentDate')
  .addEventListener('change', loadAvailableHours);

  document.getElementById('customerIdInput').addEventListener('input', function() {
  this.value = this.value.replace(/\D/g, '');

  const eHour = document.getElementById('EhourSelect');
  eHour.addEventListener('focus', loadAvailableHoursEdit);




});
    document.getElementById('openProductBtn').addEventListener('click', () => {
    loadCategories(); // ← נטען את רשימת הקטגוריות (רק אם עוד לא נטענה)
    openPopup('addProductPopup'); // ← מציג את הפופאפ
  });

  // טיפול בלחיצה על כפתור הוספת תור לפנסיון
  document.getElementById('openBoardingBtn').addEventListener('click', () => {
    openPopup('addboardingpopup');
    // טען את רשימת הלקוחות
    loadCustomersForBoarding();
    // טען את רשימת הכלבים של הלקוח הראשון
    loadCustomerDogsById('BcustomerIdInput', 'BboardingDogSelect');
  }
  );
  const input = document.getElementById('BcustomerIdInput');

input.addEventListener('keypress', function (e) {
  if (!/[0-9]/.test(e.key)) {
    e.preventDefault(); // block non-digit characters
  }
});

input.addEventListener('paste', function (e) {
  const pasted = e.clipboardData.getData('text');
  if (!/^\d+$/.test(pasted)) {
    e.preventDefault(); // block pasted non-digits
  }
});


  // טיפול בסאבמיט
  /*  document
    .getElementById('groomingpopup_form')
    .addEventListener('submit', submitGroomingAppointment);

    const openBoardingBtn = document.getElementById('openBoardingBtn');
  if (openBoardingBtn) {
    openBoardingBtn.addEventListener('click', () => {
      openPopup('addboardingpopup');
    });
  }*/



  });//end of DOMContentLoaded
  
  // =================== SIDEBAR SECTION SWITCHING ===================
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
  
// =================== ACCORDION BUILDERS ===================
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
        .map(key =>
          (key === 'statusBadge' || key === 'editHtml')
            ? `<span>${labels[key]} ${item[key] || ''}</span>`
            : `<span>${labels[key]}: ${item[key] || ''}</span>`
        )
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
// =================== TABLE TO ACCORDION TRANSFORMER ===================
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

// =================== BOARDING DATA ===================
// 0) גלובליים
let _boardingDataCache = [];
let editingBoardingId  = null;
// 1) טען את כל התורים ובנה אקורדיון
async function loadBoardingData() {
  try {
    const res   = await fetch('http://localhost:3000/boardings', { credentials: 'include' });
    if (!res.ok) throw new Error('Network error');
    const items = await res.json();
    _boardingDataCache = items; // שמור

    // מיפוי צבעים ותוויות
    const classMap = {
      pending:    'status-pending',
      inprogress: 'status-inprogress',
      completed:  'status-completed',
      cancelled:  'status-cancelled'
    };
    const labelMap = {
      pending:    'ממתין',
      inprogress: 'בתהליך',
      completed:  'הושלם',
      cancelled:  'בוטל'
    };

    // הכנת מערך להצגה
    const data = items.map(item => ({
      ...item,
      statusBadge: `
        <span class="status-badge ${classMap[item.status] || ''}">
          ${labelMap[item.status] || item.status}
        </span>`,
      statusSelect: `
        <select class="status-select" data-id="${item.id}">
          <option value="pending"    ${item.status==='pending'    ? 'selected' : ''}>ממתין</option>
          <option value="inprogress" ${item.status==='inprogress' ? 'selected' : ''}>בתהליך</option>
          <option value="completed"  ${item.status==='completed'  ? 'selected' : ''}>הושלם</option>
          <option value="cancelled"  ${item.status==='cancelled'  ? 'selected' : ''}>בוטל</option>
        </select>`,
      editHtml: `<button class="action-btn btn-edit" data-id="${item.id}">
  <i class="fa fa-edit"></i>
</button>`
    }));

    // הסתרת הטבלה המקורית
    const table = document.getElementById('boarding-posts');
    if (table) table.style.display = 'none';

    // בניית האקורדיון
    buildAccordionFromData(
      data,
      'accordion-boarding',
      ['id','check_in','check_out','dog_name','statusBadge','editHtml'],
      ['customer_name','phone','notes','statusSelect'],
      {
        id:            "מס' ",
        check_in:      "תאריך כניסה",
        check_out:     "תאריך יציאה",
        dog_name:      "שם כלב",
        customer_name: "שם לקוח",
        phone:         "טלפון",
        notes:         "הערות",
        statusBadge:   " ",
        statusSelect:  "עדכן סטטוס",
        editHtml:      ""
      }
    );
  } catch (err) {
    console.error(err);
    alert('שגיאה בטעינת הפנסיון');
  }
}
// 2) חיפוש לפי קטגוריה
function applyBoardingFilter() {
  const catSel = document.getElementById('boardingSearchCategory');
  const txtIn  = document.getElementById('boardingSearchText');
  const stSel  = document.getElementById('boardingSearchStatusSelect');
  const c      = catSel.value;
  const txt    = txtIn.value.trim();
  const st     = stSel.value;

  // Filter the cache
  const filtered = _boardingDataCache.filter(item => {
    if (c === 'status') {
      return st === '' || item.status === st;
    }
    if (c === 'check_in' || c === 'check_out') {
      return item[c] === txt;
    }
    return String(item[c] || '').includes(txt);
  });

  // Map to add HTML fields (just like in loadBoardingData)
  const classMap = {
    pending:    'status-pending',
    inprogress: 'status-inprogress',
    completed:  'status-completed',
    cancelled:  'status-cancelled'
  };
  const labelMap = {
    pending:    'ממתין',
    inprogress: 'בתהליך',
    completed:  'הושלם',
    cancelled:  'בוטל'
  };

  const data = filtered.map(item => ({
    ...item,
    statusBadge: `
      <span class="status-badge ${classMap[item.status] || ''}">
        ${labelMap[item.status] || item.status}
      </span>`,
    statusSelect: `
      <select class="status-select" data-id="${item.id}">
        <option value="pending"    ${item.status==='pending'    ? 'selected' : ''}>ממתין</option>
        <option value="inprogress" ${item.status==='inprogress' ? 'selected' : ''}>בתהליך</option>
        <option value="completed"  ${item.status==='completed'  ? 'selected' : ''}>הושלם</option>
        <option value="cancelled"  ${item.status==='cancelled'  ? 'selected' : ''}>בוטל</option>
      </select>`,
editHtml: `<button class="action-btn btn-edit" data-id="${item.id}">
  <i class="fa fa-edit"></i>
</button>`  }));

  buildAccordionFromData(
    data,
    'accordion-boarding',
    ['id','check_in','check_out','dog_name','statusBadge','editHtml'],
    ['customer_name','phone','notes','statusSelect'],
    {
      id:            "מס' תור",
      check_in:      "תאריך כניסה",
      check_out:     "תאריך יציאה",
      dog_name:      "שם כלב",
      customer_name: "שם לקוח",
      phone:         "טלפון",
      notes:         "הערות",
      statusBadge:   " ",
      statusSelect:  "עדכן סטטוס",
      editHtml:      ""
    }
  );
}
// 3) התקשרות לאירועים אחרי הטעינה
document.addEventListener('DOMContentLoaded', () => {
  
  loadBoardingData();

  const catSel = document.getElementById('boardingSearchCategory');
  const txtIn  = document.getElementById('boardingSearchText');
  const stSel  = document.getElementById('boardingSearchStatusSelect');
  const btn    = document.getElementById('boardingSearchBtn');

  // כשהקטגוריה משתנה – החלף בין input ל־status-select
  catSel.addEventListener('change', () => {
    if (catSel.value === 'status') {
      txtIn.style.display = 'none';
      stSel.style.display = 'inline-block';
    } else {
      stSel.style.display   = 'none';
      txtIn.style.display   = 'inline-block';

      // Set input type to date for check_in/check_out, otherwise text
      if (catSel.value === 'check_in' || catSel.value === 'check_out') {
        txtIn.type = 'date';
      } else {
        txtIn.type = 'text';
      }

      // עדכון placeholder
      const phMap = {
        id:            "מס' תור",
        customer_id:   "מס' לקוח (ID)",
        customer_name: "שם לקוח",
        dog_id:        "מס' כלב (ID)",
        dog_name:      "שם כלב",
        check_in:      "YYYY-MM-DD",
        check_out:     "YYYY-MM-DD"
      };
      txtIn.placeholder = phMap[catSel.value] || 'חפש...';
    }
    // נקה שדה טקסט
    txtIn.value = '';
    stSel.value = '';
  });

  // כפתור חיפוש
  btn.addEventListener('click', applyBoardingFilter);

  // חיפוש בלחיצה על Enter
  txtIn.addEventListener('keyup', e => {
    if (e.key === 'Enter') applyBoardingFilter();
  });
  document.getElementById('boardingClearBtn')
  .addEventListener('click', () => {
    // מאפסים את השדות
    document.getElementById('boardingSearchCategory').value = 'id';
    document.getElementById('boardingSearchText').value = '';
    const statusSel = document.getElementById('boardingSearchStatusSelect');
    statusSel.value = '';
    statusSel.style.display = 'none';

    // מחזירים את הטבלה המלאה
    loadBoardingData();
  });

});

// 4) טיפול ב־click ו־change על האקורדיון (עריכה ושינוי סטטוס)
const acc = document.getElementById('accordion-boarding');
acc.addEventListener('click', async e => {
  const editBtn = e.target.closest('button.btn-edit');
  if (editBtn) {
    openEditPopup(editBtn.dataset.id);
  }
});
acc.addEventListener('change', async e => {
  if (!e.target.matches('select.status-select')) return;
  const id     = e.target.dataset.id;
  const status = e.target.value;
  await fetch(`http://localhost:3000/boarding-appointments/${id}/status`, {
    method:      'PUT',
    credentials: 'include',
    headers:     { 'Content-Type':'application/json' },
    body:        JSON.stringify({ status })
  });
  loadBoardingData();
  loadBoardingStats();
});
// =================== BOARDING EDIT POPUP ===================
// 6) פונקציית פתיחת הפופאפ לעריכה
function openEditPopup(id) {
  const item = _boardingDataCache.find(i => String(i.id) === String(id));
  if (!item) return alert('לא נמצא פרטי תור');
  editingBoardingId = id;
  
  // מלא את השדות בפופאפ
  document.getElementById('checkinDate').value   = item.check_in;
  document.getElementById('checkoutDate').value  = item.check_out;
  document.getElementById('boardingNotes').value = item.notes || '';

 
  // בנה רשימת כלבים (אם טרם נבנתה)
  const dogSel = document.getElementById('boardingDogSelect');
  if (dogSel.options.length <= 1) {
    const seen = new Set();                // <-- כאן
    _boardingDataCache
      .filter(i => i.dog_id != null)       // רק תורים שבהם dog_id יש
      .forEach(i => {
        if (!seen.has(i.dog_id)) {
          seen.add(i.dog_id);
          const opt = document.createElement('option');
          opt.value = i.dog_id;
          opt.textContent = i.dog_name;
          dogSel.appendChild(opt);
        }
      });
  }
  dogSel.value = item.dog_id;

  openPopup('boardingpopup');
}
// 7) בשורת ה־submit של הפופאפ תבדוק editingBoardingId ותשלח PUT במקום POST:
document.getElementById('editboardingpopup_form')
  .addEventListener('submit', async function(e) {
    e.preventDefault();
    const body = {
      check_in:  document.getElementById('checkinDate').value,
      check_out: document.getElementById('checkoutDate').value,
      dog_id:    +document.getElementById('boardingDogSelect').value,
      notes:     document.getElementById('boardingNotes').value
    };
    const url    = editingBoardingId
                  ? `http://localhost:3000/boarding-appointments/${editingBoardingId}`
                  : 'http://localhost:3000/boarding-appointments';
    const method = editingBoardingId ? 'PUT' : 'POST';

    const todayStr        = new Date().toISOString().split('T')[0];  
              // e.g. "2025-05-31"
    if (!body.check_in || !body.check_out || !body.dog_id) {  
      alert('נא למלא את כל השדות');
      return;
    }
    if (body.check_in < todayStr) {
      alert('נא לבחור תאריך כניסה שהוא היום או תאריך עתידי');
      return;
    }
    if (body.check_in >= body.check_out) {
      alert('נא לבחור תאריך יציאה מאוחר יותר מתאריך הכניסה');
      return;
    }
    // שלח את הבקשה
    try {
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers:     { 'Content-Type':'application/json' },
        body:        JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Error saving');
      closePopup('boardingpopup');
      editingBoardingId = null;
      this.reset();
      loadBoardingData();
    } catch (err) {
      console.error(err);
      alert('שגיאה בשמירת תור');
    }
  });
  // =================== KPI & STATS LOADERS ===================
  // פונקציה לטעינת סטטיסטיקות פנסיון
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
      const { checkins, checkouts , cancelled} = await res.json();
  
      document.getElementById('checkins-today').textContent = ` ${checkins}`;
     document.getElementById('checkouts-today').textContent = `${checkouts}`;
     document.getElementById('cancelled-today').textContent = `${cancelled}`;
    }
    catch (err) {
      console.error('Failed to load boarding stats:', err);
    }
  }
// קריאה ל־API שמחזיר את שלושת המדדים בבת אחת
// פונקציה לטעינת KPI
async function loadKpiData() {
  try {
    const res = await fetch('/api/abandoned-dogs/kpi', { credentials: 'include' });
    const { inProgress, unassignedCourier, unassignedCare } = await res.json();

    document.getElementById('in-progress-count').textContent   = inProgress;
    document.getElementById('unassigned-courier').textContent = unassignedCourier;
    document.getElementById('unassigned-care').textContent    = unassignedCare;
  } catch (err) {
    console.error('Error loading KPI data', err);
  }
}
const courierList = [
  { id: 1, name: 'שליח א׳' },
  { id: 2, name: 'שליח ב׳' },
];
const careList = [
  { id: 10, name: 'גורם סיוע א׳' },
  { id: 11, name: 'גורם סיוע ב׳' },
];

const dropdown = document.getElementById('kpi-dropdown');
const selectEl = document.getElementById('kpi-select');

// open dropdown under the clicked sub-value
function openDropdown(type, anchor) {
  // populate options
  const list = type === 'courier' ? courierList : careList;
  selectEl.innerHTML = list
    .map(item => `<option value="${item.id}">${item.name}</option>`)
    .join('');

  // position (if you want it centered under the card, CSS above handles it)
  dropdown.style.display = 'block';
  dropdown.setAttribute('aria-hidden', 'false');
}

// close on outside click
document.addEventListener('click', e => {
  if (!dropdown.contains(e.target) && !e.target.closest('.kpi-sub-value')) {
    dropdown.style.display = 'none';
    dropdown.setAttribute('aria-hidden', 'true');
  }
});

// attach click handlers
document.querySelectorAll('.kpi-sub-value.clickable')
  .forEach(el => {
    el.addEventListener('click', e => {
      const type = el.dataset.type;  // "courier" or "care"
      openDropdown(type, el);
    });
  });
  

// תקרא לפונקציה אחרי שה־DOM נטען
document.addEventListener('DOMContentLoaded', loadKpiData);

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

async function loadGroomingStats(date) {
  try {
    const today = date || new Date().toISOString().split('T')[0];
    const res = await fetch(`http://localhost:3000/grooming/stats?date=${today}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) throw new Error('Network response was not OK');

    const {
      appointmentsToday,
      cancelledToday,
      currentAppointment,
      nextAppointment
    } = await res.json();

    // תורים להיום
    document.getElementById('grooming-today').textContent = `${appointmentsToday}`;
    document.getElementById('grooming-cancelled-today').textContent = `${cancelledToday}`;

    // תור נוכחי
    if (currentAppointment) {
      document.getElementById('grooming-current').innerHTML =
        `#${currentAppointment.id}<br>` +
        `${formatHebTime(currentAppointment.slot_time)} | ${currentAppointment.dog_name}<br>` +
        `${currentAppointment.service_name}`;
    } else {
      document.getElementById('grooming-current').textContent = 'אין תור כרגע';
    }

    // תור הבא
    if (nextAppointment) {
  document.getElementById('grooming-next').innerHTML =
    `#${nextAppointment.id}<br>` +
    `${formatHebTime(nextAppointment.slot_time)} | ${nextAppointment.dog_name}<br>` +
    `${nextAppointment.service_name}`;
} else {
  document.getElementById('grooming-next').textContent = 'אין תור נוסף';
}


  } catch (err) {
    console.error('Failed to load grooming stats:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadGroomingStats();
});


// =================== GROOMING APPOINTMENTS ===================

// ───────── Grooming Search & Render ─────────
let _groomingDataCache = [];
let editingGroomingId  = null;

// 1) Load + cache + initial render
async function loadGroomingAppointments() {
  try {
    const res = await fetch('http://localhost:3000/grooming/appointments', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    _groomingDataCache = data;         // <- cache the raw items
    renderGroomingAccordion(data);     // <- render full list
  } catch (err) {
    console.error(err);
    alert('שגיאה בטעינת תורי טיפוח');
  }
}

// 2) Shared render function
function renderGroomingAccordion(items) {
  // statuses lookup
  const statuses = [
    { value: 'scheduled',    label: 'נקבע'       },
    { value: 'arrived',      label: 'הגיע'       },
    { value: 'in_treatment', label: 'בטיפול'     },
    { value: 'waiting_pick', label: 'ממתין לאיסוף' },
    { value: 'completed',    label: 'הושלם'      },
    { value: 'cancelled',    label: 'בוטל'       }
  ];
  const classMap = Object.fromEntries(statuses.map(s => [s.value, `status-${s.value}`]));
  const labelMap = Object.fromEntries(statuses.map(s => [s.value, s.label]));

  // transform for display
  const formatted = items.map(item => ({
    ...item,
    date: formatHebDate(item.date),
    time: formatHebTime(item.time),
    statusBadge: `<span class="status-badge ${classMap[item.status]}">${labelMap[item.status]}</span>`,
    statusSelect: `
      <select class="status-select" data-id="${item.id}">
        ${statuses.map(s => `
          <option value="${s.value}" ${s.value===item.status?'selected':''}>${s.label}</option>
        `).join('')}
      </select>`,
editHtml: `<button class="action-btn btn-edit" data-id="${item.id}">
  <i class="fa fa-edit"></i>
</button>`  }));

  // hide static table
  const table = document.getElementById('grooming-posts');
  if (table) table.style.display = 'none';

  // build accordion
  buildAccordionFromData(
    formatted,
    'accordion-grooming',
    ['id','date','time','service','statusBadge','editHtml'],
    ['customer_name','phone','dog_name','statusSelect'],
    {
      id:            "מס' ",
      date:          "תאריך",
      time:          "שעה",
      service:       "שירות",
      statusBadge:   " ",
      statusSelect:  "עדכן סטטוס",
      customer_name: "שם לקוח",
      phone:         "טלפון",
      dog_name:      "שם כלב",
      editHtml:      ""
    }
  );
}
// 3) Category-change handler
const cat   = document.getElementById('groomingSearchCategory');
const txt   = document.getElementById('groomingSearchText');
const stSel = document.getElementById('groomingSearchStatusSelect');
const svSel = document.getElementById('groomingServiceSelect');

cat.addEventListener('change', () => {
  const val = cat.value;

  // הסתר את כולם תחילה
  txt.style.display = 'none';
  stSel.style.display = 'none';
  svSel.style.display = 'none';
  stSel.classList.remove('search-select--active');
  svSel.classList.remove('search-select--active');


  // הצג רק את הרלוונטי
  if (val === 'status') {
    stSel.style.display = 'inline-block';
    stSel.classList.add('search-select--active'); // <--- ADD HERE
  } else if (val === 'service_id') {
    svSel.style.display = 'inline-block';
    svSel.classList.add('search-select--active'); // <--- (optional, for service select)
  } else {
    txt.style.display = 'inline-block';
    txt.type = (val === 'date') ? 'date' : (val === 'time') ? 'time' : 'text';
  }

  // איפוס ערכים
  txt.value = '';
  stSel.value = '';
  svSel.value = '';
});

// 4) Filter + re-render
function applyGroomingFilter() {
  const c  = cat.value;
  const v1 = txt.value.trim();
  const v2 = stSel.value;
  const v3 = svSel.value;

  const filtered = _groomingDataCache.filter(item => {
    if (c === 'status') {
      return v2 === '' || item.status === v2;
    }
    if (c === 'service_id') {
      return v3 === '' || String(item.service_id) === v3;
    }
    if (c === 'date') {
      return formatHebDate(item.date) === v1;
    }
    if (c === 'time') {
      return formatHebTime(item.time) === v1;
    }
    // fallback to generic property
    return String(item[c] || '').includes(v1);
  });

  renderGroomingAccordion(filtered);
}

// 5) Wire up buttons & Enter key
document.getElementById('groomingSearchBtn')
  .addEventListener('click', applyGroomingFilter);
document.getElementById('groomingSearchText')
  .addEventListener('keyup', e => e.key === 'Enter' && applyGroomingFilter());
document.getElementById('groomingClearBtn')
  .addEventListener('click', () => {
    cat.value = '';
    txt.value = '';
    stSel.value = '';
    svSel.value = '';
    stSel.style.display = 'none';
    svSel.style.display = 'none';
    txt.style.display = 'inline-block';
    txt.type = 'text';
    loadGroomingAppointments();
  });

// 6) On load, call original loader
document.addEventListener('DOMContentLoaded', () => {
  loadGroomingAppointments();
  const groomAcc = document.getElementById('accordion-grooming');
  if (groomAcc) {
    // 1) Status changes
    groomAcc.addEventListener('change', async e => {
      const sel = e.target.closest('select.status-select');
      if (!sel) return;
      const appointmentId = sel.dataset.id;
      const newStatus     = sel.value;
      try {
        await fetch(
          `http://localhost:3000/grooming-appointments/${appointmentId}/status`,
          {
            method:      'PUT',
            credentials: 'include',
            headers:     { 'Content-Type':'application/json' },
            body:        JSON.stringify({ status: newStatus })
          }
        );
        loadGroomingAppointments();
        loadGroomingStats();  // refresh stats too
      } catch (err) {
        console.error('Error updating grooming status:', err);
        alert('שגיאה בעדכון סטטוס');
      }
    }); // <-- closes the change-listener

    // 2) Edit-button clicks
    groomAcc.addEventListener('click', async e => {
      const btn = e.target.closest('button.btn-edit');
      if (!btn) return;
      const appointmentId = btn.dataset.id;
      await openGroomingEditPopup(appointmentId);
    }); // <-- closes the click-listener

  } // <-- closes if (groomAcc)
}); // <-- closes DOMContentLoaded

async function openGroomingEditPopup(appointmentId) {
  editingGroomingId = appointmentId;
  const item = _groomingDataCache.find(i => i.id == appointmentId);
  if (!item) return alert('תור לא נמצא בזיכרון');

  // 1) Fill hidden customer ID
  document.getElementById('EcustomerIdInput').value = item.customer_id;

  // 2) Normalize date to YYYY-MM-DD
  let raw = item.date;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [d, m, y] = raw.split('/');
    raw = `${y}-${m}-${d}`;
  } else {
    const dt = raw instanceof Date ? raw : new Date(raw);
    const yyyy = dt.getFullYear();
    const mm   = String(dt.getMonth()+1).padStart(2,'0');
    const dd   = String(dt.getDate()).padStart(2,'0');
    raw = `${yyyy}-${mm}-${dd}`;
  }

  // 3) Set EappointmentDate and attach listener
  const dateInput = document.getElementById('EappointmentDate');
  dateInput.value = raw;
  if (!dateInput.dataset._editListener) {
    dateInput.addEventListener('change', loadAvailableHoursEdit);
    dateInput.dataset._editListener = '1';
  }

  // 4) Insert existing appointment's time
  const hourSelect = document.getElementById('EhourSelect');
  const rawTime       = item.time;               
  const formattedTime = formatHebTime(rawTime);  
  currentEditOriginalSlot = formattedTime;
  hourSelect.innerHTML = `
    <option value="${formattedTime}" selected>
      ${formattedTime}
    </option>
  `;


  // 6) Attach focus listener to reload if dropdown is reopened
  if (!hourSelect.dataset._editListener) {
    hourSelect.addEventListener('focus', loadAvailableHoursEdit);
    hourSelect.dataset._editListener = '1';
  }

  // 7) Load and pre-select service
  await loadServicesEdit();
  const svcSel = document.getElementById('EserviceSelect');
  svcSel.value = item.service_id;
        loadAvailableHoursEdit();

  if (!svcSel.dataset._editListener) {
    svcSel.addEventListener('change', () => {
      const price = svcSel.selectedOptions[0]?.dataset.price || 0;
      document.getElementById('priceDisplay').textContent = `עלות – ₪${price}`;
    });
    svcSel.dataset._editListener = '1';
  }

  // 8) Load this customer's dogs and pre-select
  const dogs = await fetch(
    `http://localhost:3000/customers/${item.customer_id}/dogs`,
    { credentials: 'include' }
  ).then(r => r.json());
  const dogSelect = document.getElementById('EdogSelect');
  dogSelect.innerHTML = dogs
    .map(d => `<option value="${d.id}" ${d.id == item.dog_id ? 'selected' : ''}>${d.name}</option>`)
    .join('');

  // 9) Notes & price
  document.getElementById('Enotes').value = item.notes || '';
  const initPrice = svcSel.selectedOptions[0]?.dataset.price || 0;
  document.getElementById('priceDisplay').textContent = `עלות – ₪${initPrice}`;

  // 10) Show the edit popup
  document.getElementById('editgroomingpopup').style.display = 'flex';
}








// b) Close helper (you already have this in your inline onclick)
function closePopup(id) {
  document.getElementById(id).style.display = 'none';
}

// c) Submit handler
document
  .getElementById('editgroomingpopup_form')
  .addEventListener('submit', async e => {
    e.preventDefault();

    const body = {
      appointment_date: document.getElementById('EappointmentDate').value,
      slot_time:        document.getElementById('EhourSelect').value,
      service_id:       document.getElementById('EserviceSelect').value,
      dog_id:           document.getElementById('EdogSelect').value,
      notes:            document.getElementById('Enotes').value
    };

    try {
      const res = await fetch(
        `http://localhost:3000/grooming/appointments/${editingGroomingId}`,
        {
          method:      'PUT',
          credentials: 'include',
          headers:     { 'Content-Type': 'application/json' },
          body:        JSON.stringify(body)
        }
      );
      if (!res.ok) throw new Error(res.status);
      closePopup('editgroomingpopup');
      loadGroomingAppointments();  // refresh the list
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert('שגיאה בעדכון התור');
    }
  });

// —————————————— Open Edit Popup ——————————————
/*async function openGroomingEditPopup(id) {
  // 1) find the appointment in your cache
  const item = _groomingDataCache.find(i => String(i.id) === String(id));
  if (!item) {
    alert('Appointment not found');
    return;
  }
  editingGroomingId = id;

  // 2) copy all <option>s from the main serviceSelect into the edit form
  const mainSvc = document.getElementById('serviceSelect');
  const editSvc = document.getElementById('EserviceSelect');
  editSvc.innerHTML = mainSvc.innerHTML;
  editSvc.value     = item.service_id;

  // 3) fetch this appointment’s customer’s dogs
  const dogSel = document.getElementById('EdogSelect');
  dogSel.innerHTML = '<option value="">טוען כלבים…</option>';
  try {
    const res = await fetch(
      `http://localhost:3000/customers/${item.customer_id}/dogs`,
      { credentials: 'include' }
    );
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const dogs = await res.json();

    // build the <option>s
    dogSel.innerHTML = '<option value="">בחר כלב</option>';
    dogs.forEach(d => {
      const o = document.createElement('option');
      o.value       = d.id;
      o.textContent = d.name;
      dogSel.appendChild(o);
    });
    dogSel.value = item.dog_id;
  } catch (err) {
    console.error('Error loading dogs:', err);
    alert('לא הצלחנו לטעון את רשימת הכלבים');
  }

  // 4) fill date & notes
  document.getElementById('EappointmentDate').value = item.date || '';
  //document.getElementById('Enotes').value           = item.notes             || '';

  // 5) populate & select the correct time slot
  await loadAvailableHoursEdit(
    item.date,
    item.service_id,
    'EhourSelect'
  );
  document.getElementById('EhourSelect').value = item.time;

  // 6) finally show the popup
  openPopup('editgroomingpopup');
}

    // —————————————— Load Available Hours for Edit ——————————————
    async function loadAvailableHoursEdit(date, serviceId, selectId) {
      if (!date || !serviceId) return;
      const opt = document.querySelector(
        `#EserviceSelect option[value="${serviceId}"]`
      );
      const duration = parseInt(opt?.dataset.duration) || 0;

      const res = await fetch(`http://localhost:3000/appointments?date=${date}`, {
        credentials: 'include'
      });
      const booked = res.ok ? await res.json() : [];

      const sel = document.getElementById(selectId);
      sel.innerHTML = '<option value="">בחר שעה</option>';
      for (let h = 9; h < 17; h++) {
        ['00','30'].forEach(mm => {
          const slot = `${String(h).padStart(2,'0')}:${mm}`;
          const start = new Date(`1970-01-01T${slot}:00`);
          const end   = new Date(start.getTime() + duration * 60000);
          const endStr = end.toTimeString().slice(0,5);
          const overlap = booked.some(ap =>
            !(endStr <= ap.start_time || slot >= ap.end_time)
          );
          if (!overlap) {
            const o = document.createElement('option');
            o.value = o.textContent = slot;
            sel.appendChild(o);
          }
        });
      }
    }

  } // ← closes if (groomAcc) 

}); // ← closes DOMContentLoaded*/

// — end of loadAvailableHoursEdit —
/*function openEditPopup(id) {
  const item = _boardingDataCache.find(i => String(i.id) === String(id));
  if (!item) return alert('לא נמצא פרטי תור');
  editingBoardingId = id;

  // מלא את השדות בפופאפ
  document.getElementById('checkinDate').value   = item.check_in;
  document.getElementById('checkoutDate').value  = item.check_out;
  document.getElementById('boardingNotes').value = item.notes || '';

  // בנה רשימת כלבים (אם טרם נבנתה)
  const dogSel = document.getElementById('boardingDogSelect');
  if (dogSel.options.length <= 1) {
    const seen = new Set();                // <-- כאן
    _boardingDataCache
      .filter(i => i.dog_id != null)       // רק תורים שבהם dog_id יש
      .forEach(i => {
        if (!seen.has(i.dog_id)) {
          seen.add(i.dog_id);
          const opt = document.createElement('option');
          opt.value = i.dog_id;
          opt.textContent = i.dog_name;
          dogSel.appendChild(opt);
        }
      });
  }
  dogSel.value = item.dog_id;

  openPopup('boardingpopup');
}*/
// =================== CUSTOMER DOGS ===================
  async function loadCustomerDogsById(inputId , selectId ) {
  const customerId = document.getElementById(inputId).value.trim();
  if (!customerId) return;

  try {
    const res = await fetch(`http://localhost:3000/customers/${customerId}/dogs`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to load dogs');

    const dogs = await res.json();
    const dogSelect = document.getElementById(selectId);
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

// =================== SERVICES ===================
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

//-------------loadservicesEdit----------------
async function loadServicesEdit() {
  const sel = document.getElementById('EserviceSelect');
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
      o.dataset.price    = s.price;
      sel.appendChild(o);
    });
  } catch(err) {
    console.error('Error loading services:', err);
    sel.innerHTML = `<option value="">שגיאה בטעינת שירותים</option>`;
  }
}

/*document.getElementById('EserviceSelect')
  .addEventListener('change', function() {
    const price = this.selectedOptions[0]?.dataset.price || 0;
    document.getElementById('priceDisplay').textContent = `עלות – ₪${price}`;
    loadAvailableHoursEdit(); // נריץ חיפוש שעות בכל בחירה
  });*/

// 5. כאשר בוחרים תאריך או שירות – טען שעות
document.getElementById('appointmentDate')
  .addEventListener('change', loadAvailableHours);

async function loadAvailableHours() {
  const date   = document.getElementById('appointmentDate').value;
  const svcOpt = document.getElementById('serviceSelect').selectedOptions[0];
  if (!date || !svcOpt?.dataset.duration) {
    document.getElementById('hourSelect').innerHTML =
      '<option value="">בחר תחילה תאריך ושירות</option>';
    return;
  }

  const duration = parseInt(svcOpt.dataset.duration, 10);
  try {
    console.log('▶ loading availability for', date, 'duration', duration);

    const res = await fetch(
      `http://localhost:3000/appointments?date=${date}`,
      { credentials: 'include' }
    );
    if (!res.ok) throw new Error(res.status);
    const booked = await res.json();
    console.log('▶ booked slots:', booked);

    // Build all half-hour slots 09:00–16:30
    const slots = [];
    for (let h = 9; h < 17; h++) {
      slots.push(`${String(h).padStart(2,'0')}:00`);
      slots.push(`${String(h).padStart(2,'0')}:30`);
    }

    const select = document.getElementById('hourSelect');
    select.innerHTML = '<option value="">בחר שעה</option>';

    slots.forEach(slot => {
      const startMs = new Date(`1970-01-01T${slot}:00`).getTime();
      const endMs   = startMs + duration * 60000;
      const endStr  = new Date(endMs).toTimeString().substring(0, 5);

      const conflict = booked.some(ap => {
        // **** HERE: use ap.slot_time, not ap.start_time ****
        const apStart = ap.slot_time.substring(0, 5); // "HH:MM"
        const apEndMs = new Date(`1970-01-01T${apStart}:00`).getTime()
                      + ap.duration * 60000;
        const apEnd = new Date(apEndMs).toTimeString().substring(0, 5);
        return !(endStr <= apStart || slot >= apEnd);
      });

      if (!conflict) {
        const o = document.createElement('option');
        o.value = slot;
        o.textContent = slot;
        select.appendChild(o);
      }
    });
  } catch (err) {
    console.error('Error loading hours:', err);
    document.getElementById('hourSelect').innerHTML =
      '<option value="">שגיאה בטעינת שעות</option>';
  }
}

// Global to hold the original slot when editing
let currentEditOriginalSlot = null;

// ────────────────────────────────────────────────────────────────────────────────
// Helper: load available slots for the edit popup, pre-selecting the original hour
async function loadAvailableHoursEdit() {
  const dateInput = document.getElementById('EappointmentDate');
  const svcSel    = document.getElementById('EserviceSelect');
  const slotSelect = document.getElementById('EhourSelect');

  const date   = dateInput.value;
  const svcOpt = svcSel.selectedOptions[0];
  console.log('▶ loadAvailableHoursEdit: date=', date, 'serviceDuration=', svcOpt?.dataset.duration);

  // If date or service-duration missing, clear and bail
  if (!date || !svcOpt?.dataset.duration) {
    slotSelect.innerHTML = '<option value="">בחר תחילה תאריך ושירות</option>';
    return;
  }

  const duration = parseInt(svcOpt.dataset.duration, 10);

  try {
    // Fetch booked slots from the correct endpoint
    const url = `http://localhost:3000/appointments?date=${encodeURIComponent(date)}`;
    console.log('▶ fetching booked slots from', url);
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) {
      console.warn('⚠️ Received non-OK from /appointments:', res.status);
      slotSelect.innerHTML = '<option value="">שגיאה בטעינת תורים</option>';
      return;
    }
    const booked = await res.json();
    console.log('▶ booked array:', booked);
    // booked items look like: { slot_time: "09:30:00", service_id: 1, duration: 60 }

    // Build all half-hour slots 09:00–16:30
    const allSlots = [];
    for (let h = 9; h < 17; h++) {
      allSlots.push(`${String(h).padStart(2,'0')}:00`);
      allSlots.push(`${String(h).padStart(2,'0')}:30`);
    }

    // Clear and populate the select
    slotSelect.innerHTML = '<option value="">בחר שעה</option>';

    allSlots.forEach(slot => {
      // Compute endStr = slot + duration
      const startMs = new Date(`1970-01-01T${slot}:00`).getTime();
      const endMs   = startMs + duration * 60000;
      const endStr  = new Date(endMs).toTimeString().substring(0,5);

      // Check conflict, but ignore the original appointment's slot
      const conflict = booked.some(ap => {
        const apStartFull = ap.slot_time;       // e.g. "09:30:00"
        const apStart = apStartFull.substring(0,5); // "09:30"
        // If this matches the original slot, skip conflict for this ap
        if (apStart === currentEditOriginalSlot) return false;

        const apEndMs = new Date(`1970-01-01T${apStart}:00`).getTime()
                      + ap.duration * 60000;
        const apEnd = new Date(apEndMs).toTimeString().substring(0,5);
        return !(endStr <= apStart || slot >= apEnd);
      });

      if (!conflict) {
        const o = document.createElement('option');
        o.value = slot;
        o.textContent = slot;
        // Pre-select the original slot
        if (slot === currentEditOriginalSlot) {
          o.selected = true;
        }
        slotSelect.appendChild(o);
      }
    });
  } catch(err) {
    console.error('Error loading hours for edit:', err);
    slotSelect.innerHTML = '<option value="">שגיאה בטעינת שעות</option>';
  }
}



// 6. הגשת הטופס – שליחת POST
document.getElementById('groomingpopup_form')
  .addEventListener('submit', async function(e) {
    e.preventDefault();

 // Gather values
    const customerId      = document.getElementById('customerIdInput').value.trim();
    const dogId           = document.getElementById('dogSelect').value;
    const serviceId       = document.getElementById('serviceSelect').value;
    const appointmentDate = document.getElementById('appointmentDate').value;
    const slotTime        = document.getElementById('hourSelect').value;
    const notes           = document.getElementById('notes').value;

    // --- Logic Checks ---
    // 1. Required fields
    if (!customerId || !dogId || !serviceId || !appointmentDate || !slotTime) {
      alert('נא למלא את כל השדות');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (appointmentDate < todayStr) {
      alert('יש לבחור תאריך עתידי או היום');
      return;
    }
    if (notes.length > 500) {
      alert('ההערות ארוכות מדי (עד 500 תווים)');
      return;
    }

    const body = {
  customerId:      +document.getElementById('customerIdInput').value,
  dog_id:          +document.getElementById('dogSelect').value,
  service_id:      +document.getElementById('serviceSelect').value,
  appointment_date: document.getElementById('appointmentDate').value,
  slot_time:       document.getElementById('hourSelect').value,
  notes:           document.getElementById('notes').value,
};

    try {
      const res = await fetch('http://localhost:3000/addgrooming-appointments', {
        method: 'post',
        credentials: 'include',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(body)
      });

         


      const msg = await res.json();
      if (res.ok) {
        alert('התור נקבע בהצלחה');
         loadGroomingAppointments(); // רענן את רשימת התורים
loadGroomingStats();    // רענן את הסטטיסטיקות
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

  /* async function submitGroomingAppointment(e) {
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
await fetch(`addgrooming-appointments`, {
  method: 'PUT',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerId,         // <-- must match an existing customers.id
    appointment_date,
    slot_time,
    service_id,
    dog_id,
    notes
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
}*/

// =================== ABANDONED DOGS REPORTS ===================
_AbnDataCache = [];
let editingAbnId  = null;

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
      _AbnDataCache = data; // <- cache the raw items for later use

          const classMap = {
      open:    'status-open',
      inprogress: 'status-inprogress',
      accepted:   'status-accepted',
      rejected:   'status-rejected',
      ontheway:  'status-ontheway',
      completed:  'status-completed',
      cancelled:  'status-cancelled'
    };
    const labelMap = {
      open:    'חדש',
      inprogress: 'בטיפול',
      accepted:   'התקבלה',
      rejected:   'נדחתה',
      ontheway:  '<i class="fa fa-car"></i>',
      completed:  'הושלם',
      cancelled:  'בוטל'
    };

        // הכנת מערך להצגה
    const dataM = data.map(item => ({
      ...item,
      statusBadge: `
        <span class="status-badge ${classMap[item.status] || ''}">
          ${labelMap[item.status] || item.status}
        </span>`,
      statusSelect: `
        <select class="status-select" data-id="${item.id}">
          <option value="open"    ${item.status==='open'    ? 'selected' : ''}>חדש</option>
          <option value="inprogress" ${item.status==='inprogress' ? 'selected' : ''}>בטיפול</option>
          <option value="completed"  ${item.status==='completed'  ? 'selected' : ''}>הושלם</option>
          <option value="cancelled"  ${item.status==='cancelled'  ? 'selected' : ''}>בוטל</option>
        </select>`,
      editHtml: `<button class="action-btn btn-edit" data-id="${item.id}">ערוך/שבץ</button>`
    }));


      // 2. הסתר את הטבלה הסטטית
      const table = document.getElementById('abandoned-posts');
      if (data.length > 0) {
        table.style.display = 'none';
      } else {
        table.style.display = ''; // השאר אותה גלויה
      }
      
      // 3. בנה אקורדיון מתוך ה־JSON
      const formatted = dataM.map(item => ({
        ...item,
        handler_id:    item.handler_id    ?? 'לא שובץ',

        care_provider: item.care_provider ?? 'לא שובץ',
      
        image_path: `<img src="/uploads/${item.image_path}" alt="תמונה" style="max-width:100px;">`
      }));
  
      buildAccordionFromData(
        formatted,
        'accordion-abandoned',
        ['id','customer_name','phone','dog_size','health_status','care_provider_name','handler_name','statusBadge'],
        ['address','notes','status','image_path','report_date','statusSelect','editHtml'],
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
          handler_name:       "שליח",
          care_provider_name: "גורם מטפל ",
          image_path:     "תמונה",
         statusBadge:   " ",
        statusSelect:  "עדכן סטטוס",
        editHtml:      "ערוך/שבץ"

        }
      );
    
    } catch (err) {
      console.error('Error loading abandoned reports:', err);
      alert('שגיאה בטעינת פניות לכלבים נטושים');
    }
  }

  const abandonedAcc = document.getElementById('accordion-abandoned');
if (abandonedAcc) {
  abandonedAcc.addEventListener('change', async e => {
    const sel = e.target.closest('select.status-select');
    if (!sel) return;
    const reportId = sel.dataset.id;
    const newStatus = sel.value;
    try {
      await fetch(
        `http://localhost:3000/abandoned-reports/${reportId}/status`,
        {
          method:      'PUT',
          credentials: 'include',
          headers:     { 'Content-Type':'application/json' },
          body:        JSON.stringify({ status: newStatus })
        }
      );
      // Update local cache
      const item = _AbnDataCache.find(i => String(i.id) === String(reportId));
      if (item) item.status = newStatus;
      // Re-render the accordion
      loadAbandonedReports();
      loadAbandonedStats();

    } catch (err) {
      console.error('Error updating status:', err);
      alert('שגיאה בעדכון סטטוס');
    }
  });
}
  
  async function loadAbandonedStats() {
    try {
      // 1) Adjust the URL if needed (same‐origin vs. explicit host)
      const res = await fetch('/dashboard/abandoned/stats', {
        credentials: 'include',
        cache: 'no-cache'
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      const stats = await res.json();
      // Expected JSON shape:
      // {
      //   todayCount:  <int>,  // פניות (דיווחים) שהוגשו היום
      //   openCount:   <int>,  // פניות במצב 'open'
      //   inProgressCount:             <int>, 
      //   inProgressUnassignedHandler: <int>,  // inprogress & handler_id IS NULL
      //   inProgressUnassignedCare:    <int>   // inprogress & care_provider IS NULL
      // }

      // 2) Inject into the “new reports today” card
      document.getElementById('new_today').textContent = stats.todayCount;

      // 3) Inject into the “open reports” card
      document.getElementById('open_reports').textContent = stats.openCount;

      // 4) If you added a main in-progress count inside the #kpi-in-progress card:
      const inProgEl = document.getElementById('in-progress-count');
      if (inProgEl) {
        inProgEl.textContent = stats.inProgressCount;
      }

      // 5) Fill the two sub-values (“still no handler” and “still no care provider”)
      document.getElementById('in_progress_reports').textContent = stats.inProgressCount;
      document.getElementById('unassigned-courier').textContent = stats.inProgressUnassignedHandler;
      document.getElementById('unassigned-care').textContent    = stats.inProgressUnassignedCare;
    }
    catch (err) {
      console.error('Error loading abandoned-reports stats:', err);
    }
  }

  // Run as soon as DOM is ready:

document.addEventListener('DOMContentLoaded', () => {
  // מצא את התיבה “לא משויך שליח” וצרף לה מאזין ל-click
  const courierBox = document.getElementById('sub-courier');
  if (courierBox) {
    courierBox.addEventListener('click', showCourierPopup);
  }

   const careBox = document.getElementById('sub-care');
  if (careBox) careBox.addEventListener('click', showCarePopup);

  // אם תרצו להוסיף בעתיד גם טיפול ב-“sub-care”:
  // const careBox = document.getElementById('sub-care');
  // if (careBox) {
  //   careBox.addEventListener('click', showCarePopup);
  // }
  loadAbandonedStats();

});


// ────────────────────────────────────────────────────────────────────────────
// 2) הפונקציה שמוציאה לפועל את הפופ-אפ עבור “לא משויך שליח”
async function showCourierPopup() {
  try {
    // 2.1 – שליפת כל הדוחות
    const reportsRes = await fetch('/dashboard/reports', {
      credentials: 'include',
      cache: 'no-cache'
    });
    if (!reportsRes.ok) throw new Error(`Server returned ${reportsRes.status}`);
    const allReports = await reportsRes.json();

    // 2.2 – סינון: רק אותם עם status='inprogress' ו־handler_id ריק / null
    const filtered = allReports.filter(item =>
      item.status === 'inprogress' &&
      (item.handler_id === null || item.handler_id === '' || item.handler_id === 'לא שובץ')
    );

    // 2.3 – שליפת רשימת השליחים (couriers)
    const couriersRes = await fetch('/dashboard/couriers', {
      credentials: 'include',
      cache: 'no-cache'
    });
    if (!couriersRes.ok) throw new Error(`Server returned ${couriersRes.status} for couriers`);
    const courierList = await couriersRes.json();
    // courierList צריך להיות מערך כמו [{ id: 1, name: "שליח א׳" }, …]

    // 2.4 – בניית ותצוגת הפופ-אפ
    buildAndShowCourierPopup(filtered, courierList);

  } catch (err) {
    console.error('Error loading reports or couriers:', err);
    alert('שגיאה בטעינת פניות/שליחים להצגה');
  }
}


// ────────────────────────────────────────────────────────────────────────────
// 3) בניית ה-popup (HTML) והצגתו על המסך
function buildAndShowCourierPopup(reportsArray, courierList) {
  // אם overlay ישן עדיין קיים – נסיר
  const existing = document.getElementById('popup-courier-overlay');
  if (existing) existing.remove();

  // 3.1 – צור את overlay (חצי-שקוף על כל המסך)
  const overlay = document.createElement('div');
  overlay.id = 'popup-courier-overlay';
  overlay.className = 'popup-overlay';

  // 3.2 – צור את modal container הלבן
  const modal = document.createElement('div');
  modal.className = 'popup-modal';

  // 3.3 – צור header: כותרת + כפתור סגירה
  const header = document.createElement('header');
  const title = document.createElement('h2');
  title.textContent = 'פניות בטיפול ללא שליח';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => overlay.remove());
  header.appendChild(title);
  header.appendChild(closeBtn);
  modal.appendChild(header);

  // 3.4 – צור את הטבלה שבתוך הפופ-אפ
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  // הגדרת עמודות (במיוחד עמודת השיבוץ)
  const columns = [
    { key: 'id',            label: "מס׳ דו\"ח" },
    { key: 'customer_name', label: 'שם לקוח' },
    { key: 'phone',         label: 'טלפון' },
    { key: 'dog_size',      label: 'גודל כלב' },
    { key: 'health_status', label: 'מצב בריאות' },
    { key: 'address',       label: 'כתובת' },
    { key: 'report_date',   label: 'תאריך דיווח' },
    { key: 'assign',        label: 'שיבוץ שליח', isAssignCol: true }
  ];

  // בנה שורת כותרת (thead)
  const headerRow = document.createElement('tr');
  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col.label;
    if (col.isAssignCol) th.classList.add('assign-col');
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // בנה את גוף הטבלה (tbody)
  reportsArray.forEach(item => {
    const row = document.createElement('tr');

    columns.forEach(col => {
      const td = document.createElement('td');

      if (col.isAssignCol) {
        // 3.4.1 – אימפלמנטציית עמודת “שיבוץ שליח”
        const select = document.createElement('select');
        select.className = 'courier-select';
        select.innerHTML =
          `<option value="">בחר שליח…</option>` +
          courierList.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

        const btn = document.createElement('button');
        btn.className = 'assign-btn';
        btn.textContent = 'שמור';
        btn.disabled = true; // יופעל רק לאחר שבוחרים שליח ב-select

        // מאזין על שינוי ב־select: אם יש ערך – הפוך את הכפתור לאפשרי
        select.addEventListener('change', () => {
          btn.disabled = (select.value === '');
        });

        // לחיצה על “שמור” מבצעת קריאת PUT ל־route שהגדרנו ב-server.js
        btn.addEventListener('click', async () => {
          const courierId = select.value;
          if (!courierId) return;

          btn.disabled = true;
          btn.textContent = 'שומר…';

          try {
            const assignRes = await fetch(
              `/dashboard/reports/${item.id}/assign-handler`,
              {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ handler_id: courierId })
              }
            );
            if (!assignRes.ok) {
              const text = await assignRes.text();
              throw new Error(`Server returned ${assignRes.status}: ${text}`);
            }

            // אם הצליח – הורד את השורה מהטבלה
            row.remove();

            // וגם עדכן את הכרטיס: הורד ב-1 את הכמות ב־“לא משויך שליח”
            const elUnassignedCourier = document.getElementById('unassigned-courier');
            const prevCount = parseInt(elUnassignedCourier.textContent, 10) || 0;
            elUnassignedCourier.textContent = Math.max(prevCount - 1, 0);

          } catch (err) {
            console.error('Error assigning courier:', err);
            alert('שגיאה בשיבוץ השליח. נסה שוב.');
            btn.disabled = false;
            btn.textContent = 'שמור';
          }
        });

        // עטוף את ה־select והכפתור יחדיו
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '4px';
        wrapper.appendChild(select);
        wrapper.appendChild(btn);

        td.appendChild(wrapper);
        td.classList.add('assign-col');
      }
      else {
        // 3.4.2 – עמודות רגילות (ללא שיבוץ)
        let text = item[col.key] ?? '';
        if (col.key === 'report_date' && typeof text === 'string') {
          text = text.slice(0, 19).replace('T', ' ');
        }
        td.textContent = text;
      }

      row.appendChild(td);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  modal.appendChild(table);

  // 3.5 – הוספת המודאל ל-overlay, והכל ל-document.body
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

async function showCarePopup() {
  try {
    // 2.1 – Fetch all “abandoned reports”
    const reportsRes = await fetch('/dashboard/reports', {
      credentials: 'include',
      cache: 'no-cache'
    });
    if (!reportsRes.ok) {
      throw new Error(`Server returned ${reportsRes.status}`);
    }
    const allReports = await reportsRes.json();

    // 2.2 – Filter only “inprogress” with care_provider == NULL (or empty string)
    const filtered = allReports.filter(item =>
      item.status === 'inprogress' &&
      (item.care_provider === null || item.care_provider === '' || item.care_provider === 'לא שובץ')
    );

    // 2.3 – Fetch list of care providers
    const careRes = await fetch('/dashboard/care-providers', {
      credentials: 'include',
      cache: 'no-cache'
    });
    if (!careRes.ok) {
      throw new Error(`Server returned ${careRes.status} for care providers`);
    }
    const careList = await careRes.json();
    // careList must be an array like: [{ id: 10, name: "גורם א׳" }, …]

    // 2.4 – Build & show the popup
    buildAndShowCarePopup(filtered, careList);

  } catch (err) {
    console.error('Error loading care‐provider popup data:', err);
    alert('שגיאה בטעינת פניות/גורמי סיוע להצגה');
  }
}


function buildAndShowCarePopup(reportsArray, careList) {
  // If a previous overlay exists, remove it
  const existing = document.getElementById('popup-care-overlay');
  if (existing) existing.remove();

  // 2.4.1 – Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'popup-care-overlay';
  overlay.className = 'popup-overlay';

  // 2.4.2 – Create modal container
  const modal = document.createElement('div');
  modal.className = 'popup-modal';

  // 2.4.3 – Header: title + close button
  const header = document.createElement('header');
  const title = document.createElement('h2');
  title.textContent = 'פניות בטיפול ללא גורם סיוע';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => overlay.remove());
  header.appendChild(title);
  header.appendChild(closeBtn);
  modal.appendChild(header);

  // 2.4.4 – Build the table
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  // Define columns, including an “Assign Care” column
  const columns = [
    { key: 'id',            label: "מס׳ דו\"ח" },
    { key: 'customer_name', label: 'שם לקוח' },
    { key: 'phone',         label: 'טלפון' },
    { key: 'dog_size',      label: 'גודל כלב' },
    { key: 'health_status', label: 'מצב בריאות' },
    { key: 'address',       label: 'כתובת' },
    { key: 'report_date',   label: 'תאריך דיווח' },
    { key: 'assignCare',    label: 'שיבוץ גורם סיוע', isAssignCol: true }
  ];

  // Build <thead>
  const headerRow = document.createElement('tr');
  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col.label;
    if (col.isAssignCol) th.classList.add('assign-col');
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Build <tbody> rows
  reportsArray.forEach(item => {
    const row = document.createElement('tr');

    columns.forEach(col => {
      const td = document.createElement('td');

      if (col.isAssignCol) {
        // (A) Create a <select> of care providers + a “שמור” button
        const select = document.createElement('select');
        select.className = 'care-select';
        select.innerHTML =
          `<option value="">בחר גורם סיוע…</option>` +
          careList.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

        const btn = document.createElement('button');
        btn.className = 'assign-care-btn';
        btn.textContent = 'שמור';
        btn.disabled = true; // only enable once a provider is chosen

        // Enable “שמור” once a care provider is selected
        select.addEventListener('change', () => {
          btn.disabled = (select.value === '');
        });

        // On click, send PUT /dashboard/reports/:id/assign-care
        btn.addEventListener('click', async () => {
          const careId = select.value;
          if (!careId) return;

          btn.disabled = true;
          btn.textContent = 'שומר…';

          try {
            const assignRes = await fetch(
              `/dashboard/reports/${item.id}/assign-care`,
              {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ care_provider: careId })
              }
            );
            if (!assignRes.ok) {
              const text = await assignRes.text();
              throw new Error(`Server returned ${assignRes.status}: ${text}`);
            }

            // Success! Remove the row from the table
            row.remove();

            // Also decrement the “unassigned-care” KPI by 1
            const elUnassignedCare = document.getElementById('unassigned-care');
            const prevCount = parseInt(elUnassignedCare.textContent, 10) || 0;
            elUnassignedCare.textContent = Math.max(prevCount - 1, 0);

          } catch (err) {
            console.error('Error assigning care provider:', err);
            alert('שגיאה בשיבוץ גורם הסיוע. נסה שוב.');
            btn.disabled = false;
            btn.textContent = 'שמור';
          }
        });

        // Wrap select + button together
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '4px';
        wrapper.appendChild(select);
        wrapper.appendChild(btn);

        td.appendChild(wrapper);
        td.classList.add('assign-col');
      }
      else {
        // Regular columns (id, customer_name, phone, etc.)
        let text = item[col.key] ?? '';
        if (col.key === 'report_date' && typeof text === 'string') {
          text = text.slice(0, 19).replace('T', ' ');
        }
        td.textContent = text;
      }

      row.appendChild(td);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  modal.appendChild(table);

  // 2.4.5 – Show the overlay + modal
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}



// =================== HANDLERS ACCORDION ===================
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
        ['id','name','phone','vehicle_type'],                        // שדות בכותרת
        ['address','email'], // שדות בגוף
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
  
// =================== CARE PROVIDERS ACCORDION ===================
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
        ['id','name','type'],                         // כותרת
        ['address','phone','additional_phone'], // גוף
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
// =================== CUSTOMERS ACCORDION ===================
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
          body.style.display = open ? 'flex' : 'none';
        });
  
        accordion.append(header, body);
        container.append(accordion);
      });
  
    } catch (err) {
      console.error('Error loading customers:', err);
      alert('שגיאה בטעינת לקוחות');
    }
  }



  
  // ─── “Add Boarding” form submission ───
const addForm = document.getElementById('addboardingpopup_form');
if (addForm) {
  addForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // gather values
    const body = {
      customer_id: +document.getElementById('BcustomerIdInput').value.trim(),
      check_in:    document.getElementById('BcheckinDate').value,
      check_out:   document.getElementById('BcheckoutDate').value,
      dog_id:      +document.getElementById('BboardingDogSelect').value,
      notes:       document.getElementById('BboardingNotes').value.trim()
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const inDate  = new Date(body.check_in);
    const outDate = new Date(body.check_out);
    const stayDays = (outDate - inDate) / (1000 * 60 * 60 * 24);

    // 1. Required fields
    if (!body.customer_id || !body.check_in || !body.check_out || !body.dog_id) {
      alert('נא למלא את כל השדות');
      return;
    }

    // 2. Dates must be today or future
    if (body.check_in < todayStr || body.check_out < todayStr) {
      alert('יש לבחור תאריכים שהם היום או תאריכים עתידיים');
      return;
    }

    // 3. check_out > check_in
    if (stayDays < 1) {
      alert('יש לבחור תאריך יציאה מאוחר יותר מתאריך הכניסה');
      return;
    }

    // 4. Optional: limit maximum stay (e.g. 30 days)
    const maxStay = 30;
    if (stayDays > maxStay) {
      alert(`משך השהייה מוגבל ל־${maxStay} ימים`);
      return;
    }

    // 5. Optional: notes length
    if (body.notes.length > 500) {
      alert('ההערות ארוכות מדי (עד 500 תווים)');
      return;
    }

    // 6. Optional: check availability via your API
    async function isAvailable(start, end) {
      const res = await fetch(
        `http://localhost:3000/boarding-appointments/availability?start=${start}&end=${end}`,
        { credentials: 'include' }
      );
      if (!res.ok) return false;
      const { available } = await res.json();
      return available;
    }

    if (!await isAvailable(body.check_in, body.check_out)) {
      alert('אין מקום פנוי בתאריכים שבחרת');
      return;
    }

    // submit
    try {
      const res = await fetch('http://localhost:3000/boarding-appointments', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify(body)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || res.status);

      alert('תור פנסיון נוסף בהצלחה');
      closePopup('addboardingpopup');
      addForm.reset();
      if (typeof loadBoardingData === 'function')    loadBoardingData();
      if (typeof loadBoardingStats === 'function')   loadBoardingStats();
    } catch(err) {
      console.error('Error creating boarding appointment:', err);
      alert('שגיאה בהוספת תור פנסיון: ' + (err.message || ''));
    }
  });
}

//================products.js========================
async function loadProductsAccordion() {
  try {
    const res = await fetch('http://localhost:3000/products', { credentials: 'include' });
    if (!res.ok) throw new Error('שגיאה בטעינת מוצרים');
    const products = await res.json();

    // Format for accordion
    const formatted = products.map(prod => ({
      ...prod,
            image: prod.img_path
        ? `<img src="/uploads/${prod.img_path}" alt="${prod.name}" style="max-width:70px;max-height:70px;border-radius:6px;">`
        : '', // If no image, leave empty or use a placeholder

      low_stock_badge: prod.low_stock
        ? '<span class="status-badge status-cancelled">מלאי נמוך</span>'
        : '',
      price: `₪${prod.price}`,
    }));

    // Build accordion
    buildAccordionFromData(
      formatted,
      'products-accordion',
      ['image', 'name', 'category', 'price', 'stock_quantity', 'low_stock_badge'],
      ['description', 'min_quantity'],
      {
        image: 'תמונה',
        name: 'שם מוצר',
        category: 'קטגוריה',
        price: 'מחיר',
        stock_quantity: 'כמות במלאי',
        min_quantity: 'מינימום מלאי',
        description: 'תיאור',
        low_stock_badge: ''
      }
    );
  } catch (err) {
    console.error('Error loading products:', err);
    alert('שגיאה בטעינת מוצרים');
  }
}

// קרא לפונקציה אחרי טעינת הדף
document.addEventListener('DOMContentLoaded', loadProductsAccordion);

// =================== ADD PRODUCT FORM SUBMISSION ===================
async function loadCategories() {
  const res = await fetch('/categories');
  const data = await res.json();
  const select = document.getElementById('categorySelect');

  data.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.name;
    select.appendChild(opt);
  });
}

// שליחת מוצר לשרת
document.getElementById('addProductForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  try {
    const res = await fetch('/products/add', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      alert('✅ מוצר נוסף בהצלחה');
      closePopup('addProductPopup');
      form.reset();
    } else {
      const text = await res.text();
      throw new Error(text);
    }
  } catch (err) {
    alert('❌ שגיאה בהוספת מוצר: ' + err.message);
  }
});
