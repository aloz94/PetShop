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

  // טיפול בסאבמיט
  document
    .getElementById('groomingpopup_form')
    .addEventListener('submit', submitGroomingAppointment);

    const openBoardingBtn = document.getElementById('openBoardingBtn');
  if (openBoardingBtn) {
    openBoardingBtn.addEventListener('click', () => {
      openPopup('addboardingpopup');
    });
  }



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

  // fill hidden customer ID
  document.getElementById('EcustomerIdInput').value = item.customer_id;

let raw = item.date;

// if it’s already “DD/MM/YYYY”, flip it
if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
  const [d, m, y] = raw.split('/');
  raw = `${y}-${m}-${d}`;
}
else {
  // parse into a Date (handles ISO+offset too)
  const dt = raw instanceof Date ? raw : new Date(raw);

  // use local date parts, not UTC
  const yyyy = dt.getFullYear();
  const mm   = String(dt.getMonth() + 1).padStart(2, '0');
  const dd   = String(dt.getDate()).padStart(2, '0');

  raw = `${yyyy}-${mm}-${dd}`;
}

  document.getElementById('EappointmentDate').value = raw;

  // time: for now just that one option
  const hourSelect = document.getElementById('EhourSelect');
const rawTime       = item.time;                   
const formattedTime = formatHebTime(rawTime);      // uses your existing formatHebTime()

hourSelect.innerHTML = `
  <option value="${formattedTime}" selected>
    ${formattedTime}
  </option>
`;

  // service: single option pre-selected
await loadServicesEdit();  
  const svcSel = document.getElementById('EserviceSelect');
  // set the existing service
  svcSel.value = item.service_id;
  // load this customer’s dogs
  const dogs = await fetch(
    `http://localhost:3000/customers/${item.customer_id}/dogs`,
    { credentials: 'include' }
  ).then(r => r.json());
  const dogSelect = document.getElementById('EdogSelect');
  dogSelect.innerHTML = dogs
    .map(d => `<option value="${d.id}" ${d.id == item.dog_id ? 'selected' : ''}>${d.name}</option>`)
    .join('');

  // notes & price
  document.getElementById('Enotes').value = item.notes || '';

  const initPrice = svcSel.selectedOptions[0]?.dataset.price || 0;
  document.getElementById('priceDisplay').textContent = `עלות – ₪${initPrice}`;

// 3) attach change-listener once (flags to avoid duplicates)
  if (!svcSel.dataset._editListener) {
    svcSel.addEventListener('change', () => {
      const price = svcSel.selectedOptions[0]?.dataset.price || 0;
      document.getElementById('priceDisplay').textContent = `עלות – ₪${price}`;
      loadAvailableHours();          // <-- use the EDIT version here
    });
    svcSel.dataset._editListener = '1';
  }

  // show the popup
  document.getElementById('editgroomingpopup').style.display = 'block';
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

async function loadAvailableHoursEdit() {
  const date = document.getElementById('EappointmentDate').value;
  const svcOpt = document.getElementById('EserviceSelect').selectedOptions[0];
  if (!date || !svcOpt || !svcOpt.dataset.duration) return;

  const duration = parseInt(svcOpt.dataset.duration);
  // שולח לבק בקו query
  try {
    const res = await fetch(
  `http://localhost:3000/grooming/appointments?date=${date}`,
  { credentials:'include' }
);

    if (!res.ok) throw new Error(res.status);
    const booked = await res.json(); // [{ start_time, duration }]
    
    // בנה רשימת שעות: 9:00–17:00 חצי שעה
    const hours = [];
    for (let h=9; h<17; h++) {
      hours.push(`${h.toString().padStart(2,'0')}:00`);
      hours.push(`${h.toString().padStart(2,'0')}:30`);
    }

    const select = document.getElementById('EhourSelect');
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
      completed:  'status-completed',
      cancelled:  'status-cancelled'
    };
    const labelMap = {
      open:    'חדש',
      inprogress: 'בטיפול',
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
        ['id','customer_name','phone','dog_size','health_status','care_provider','handler_id','statusBadge'],
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
          handler_id:       "שליח",
          care_provider: "גורם מטפל ",
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
    } catch (err) {
      console.error('Error updating status:', err);
      alert('שגיאה בעדכון סטטוס');
    }
  });
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
א
