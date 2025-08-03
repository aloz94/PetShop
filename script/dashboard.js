// =================== LOGIN & LOGOUT ===================
async function checkLogin() {
    try {
        // Fetch user profile data
        const res = await fetch('/profile', { credentials: 'include' });
        const data = await res.json();

        // Check if the response is OK and contains a username
        if (res.ok && data.username) {
            const userNameElement = document.getElementById('loggedInUserName');
            if (userNameElement) {
                userNameElement.textContent = `ברוך הבא, ${data.username}`;
            }
        } else {
            console.warn('Failed to fetch username or user is not authenticated.');
            const userNameElement = document.getElementById('loggedInUserName');
            if (userNameElement) {
                userNameElement.textContent = 'Guest';
            }
        }
    } catch (err) {
        console.error('Error fetching user profile:', err);
        const userNameElement = document.getElementById('loggedInUserName');
        if (userNameElement) {
            userNameElement.textContent = 'Guest';
        }
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
    // 1. deactivate all links + contents
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('main .content').forEach(sec => sec.classList.remove('content--active'));
    // 2. activate the clicked link + matching section
    link.classList.add('active');
    const id = link.dataset.target;
    const section = document.getElementById(id);
    if (section) section.classList.add('content--active');
    // 3. special hook for boarding reload
    if (id === 'boarding') loadBoardingData();
  });
});
  
// =================== ACCORDION BUILDERS ===================
function renderAccordionHeaderRow(container, headerKeys, labels) {
    const row = document.createElement('div');

  // إذا فيه صف قديم – نشيله
  const oldHeaderRow = container.querySelector('.accordion-header-row');
  if (oldHeaderRow) oldHeaderRow.remove();

  const headerRow = document.createElement('div');
  headerRow.classList.add('accordion-header-row');

  headerKeys.forEach(key => {
    const span = document.createElement('span');
    span.textContent = labels[key] || key;
    headerRow.appendChild(span);
  });

  /* نضيفه قبل الأكورديونات */
  container.prepend(headerRow);
}

function buildAccordionFromData(data, container, headerKeys, bodyKeys, labels) {
  if (typeof container === 'string') container = document.getElementById(container);
  if (!container) return console.error('Accordion container not found');

  container.innerHTML = ''; // ننظّف

  // 🔥 نحطّ سطر العناوين
  renderAccordionHeaderRow(container, headerKeys, labels);

  data.forEach(item => {
    const accordion = document.createElement('div');
    accordion.classList.add('accordion');

    // === header (قيم فقط) ===
    const header = document.createElement('div');
    header.classList.add('accordion-header');
    header.innerHTML = headerKeys
      .map(key => `<span>${item[key] || ''}</span>`)   // ❗ بدون label
      .join('');

    // === body ===
    const body = document.createElement('div');
    body.classList.add('accordion-body');
    body.style.display = 'none';
    body.innerHTML = bodyKeys
      .map(key => `<span data-label="${labels[key]}">${item[key] || ''}</span>`)
      .join('');

    // toggle
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
    const res   = await fetch('/boardings', { credentials: 'include' });
    if (!res.ok) throw new Error('Network error');
    const items = await res.json();
    _boardingDataCache = items; // שמור
//boarding status
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
        statusBadge:   " סטטוס",
        statusSelect:  "עדכן סטטוס",
        editHtml:      "ערוך"
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
      statusBadge:   "סטטוס",
      statusSelect:  "עדכן סטטוס",
      editHtml:      "ערוך"
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
  await fetch(`/boarding-appointments/${id}/status`, {
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
                  ? `/boarding-appointments/${editingBoardingId}`
                  : '/boarding-appointments';
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
     const res = await fetch('/boarding/stats?date=${today}', {
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
    const res = await fetch(`/grooming/stats?date=${today}`, {
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

document.getElementById('grooming_today').addEventListener('click', async () => {
  console.log("clicked");
  try {
    const res = await fetch('/manager/grooming/today', { credentials: 'include' });
    const appointments = await res.json();

    const tbody = document.querySelector('#groomingTodayTable tbody');
tbody.innerHTML = '';


    if (appointments.length === 0) {
      tbody.innerHTML = '<li>אין תורים להיום</li>';
    } else {
appointments.forEach(app => {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${app.id}</td>
  <td>${formatHebTime(app.slot_time)}</td>
    <td>${app.dog_name}</td>
    <td>${app.customer_name}</td>
    <td>${app.customer_phone}</td>
    <td>${app.service_name}</td>
  `;
  tbody.appendChild(row);
});
    }

    document.getElementById('groomingTodayModal').style.display = 'block';
  } catch (err) {
    console.error('Error fetching grooming appointments:', err);
  }
});

function closeGroomingModal() {
  document.getElementById('groomingTodayModal').style.display = 'none';
}


document.getElementById('grooming_cancelled').addEventListener('click', async () => {
  try {
    const res = await fetch('/manager/grooming/cancelled-today', { credentials: 'include' });
    const data = await res.json();

    const tbody = document.getElementById('cancelledGroomingTableBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">אין תורים מבוטלים להיום</td></tr>';
    } else {
      data.forEach(app => {
        const row = document.createElement('tr');
        const dateOnly = new Date(app.appointment_date).toLocaleDateString('he-IL');
        row.innerHTML = `
          <td>${app.id}</td>
                    <td>${dateOnly}</td>

          <td>${formatHebTime(app.slot_time)}</td>
          <td>${app.dog_name}</td>
          <td>${app.customer_name}</td>
          <td>${app.phone}</td>
        `;
        tbody.appendChild(row);
      });
    }

    document.getElementById('cancelledGroomingModal').style.display = 'block';
  } catch (err) {
    console.error('Error loading cancelled grooming appointments:', err);
  }
});

function closeCancelledGroomingModal() {
  document.getElementById('cancelledGroomingModal').style.display = 'none';
}


//boardig stats table
//in
document.getElementById('checkin_today').addEventListener('click', async () => {
  try {
    const res = await fetch('/manager/boarding/checkins-today', { credentials: 'include' });
    const checkins = await res.json();

    const tbody = document.querySelector('#boardingCheckinsTable tbody');
    tbody.innerHTML = '';

    if (checkins.length === 0) {
tbody.innerHTML = '<tr><td colspan="3" class="centered-cell">אין כניסות  להיום</td></tr>';    } else {
      checkins.forEach(c => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${c.id}</td>
          <td>${c.dog_name}</td>
          <td>${c.customer_name}</td>
          <td>${c.phone}</td>
        `;
        tbody.appendChild(row);
      });
    }

    document.getElementById('boardingCheckinsModal').style.display = 'block';
  } catch (err) {
    console.error('Error fetching check-in data:', err);
  }
});

function closeCheckinsModal() {
  document.getElementById('boardingCheckinsModal').style.display = 'none';
  
}



//out

document.getElementById('chekcout_todaynun').addEventListener('click', async () => {
  try {
    const res = await fetch('/manager/boarding/checkouts-today', { credentials: 'include' });
    const checkouts = await res.json();

    const tbody = document.querySelector('#boardingCheckoutsTable tbody');
    tbody.innerHTML = '';

    if (checkouts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3">אין יציאות היום</td></tr>';
    } else {
      checkouts.forEach(c => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${c.id}</td>
          <td>${c.dog_name}</td>
          <td>${c.customer_name}</td>
          <td>${c.phone}</td>
        `;
        tbody.appendChild(row);
      });
    }

    document.getElementById('boardingCheckoutsModal').style.display = 'block';
  } catch (err) {
    console.error('Error fetching check-out data:', err);
  }
});

function closeCheckoutsModal() {
  document.getElementById('boardingCheckoutsModal').style.display = 'none';
}

//deleted 
document.getElementById('cancelled-Ap').addEventListener('click', async () => {
  try {
    const res = await fetch('/manager/boarding/cancelled-today', { credentials: 'include' });
    const cancelled = await res.json();

    const tbody = document.querySelector('#cancelledAppointmentsTable tbody');
    tbody.innerHTML = '';

    if (cancelled.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">אין תורים שבוטלו היום</td></tr>';
    } else {
      cancelled.forEach(c => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${c.id}</td>
          <td>${c.dog_name}</td>
          <td>${c.customer_name}</td>
          <td>${c.phone}</td>
<td>${new Date(c.check_in).toLocaleDateString('he-IL')}</td>
<td>${new Date(c.check_out).toLocaleDateString('he-IL')}</td>
        `;
        tbody.appendChild(row);
      });
    }

    document.getElementById('cancelledAppointmentsModal').style.display = 'block';
  } catch (err) {
    console.error('Error fetching cancelled appointments:', err);
  }
});

function closeCancelledModal() {
  document.getElementById('cancelledAppointmentsModal').style.display = 'none';
}



// =================== GROOMING APPOINTMENTS ===================

// ───────── Grooming Search & Render ─────────
let _groomingDataCache = [];
let editingGroomingId  = null;

// 1) Load + cache + initial render
async function loadGroomingAppointments() {
  try {
    const res = await fetch('/grooming/appointments', {
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
  // grooming status
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
      statusBadge:   "סטטוס",
      statusSelect:  "עדכן סטטוס",
      customer_name: "שם לקוח",
      phone:         "טלפון",
      dog_name:      "שם כלב",
      editHtml:      "ערוך"
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
          `/grooming-appointments/${appointmentId}/status`,
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
    const opt   = svcSel.selectedOptions[0];
    const price = opt?.dataset.price ?? 0;
    document.getElementById('priceDisplay')
            .textContent = `עלות – ₪${price}`;
  });
    svcSel.dataset._editListener = '1';
  }
  svcSel.value = item.service_id;
svcSel.dispatchEvent(new Event('change'));

console.log(
  Array.from(svcSel.options).map(o => o.dataset.price)
);

  // 8) Load this customer's dogs and pre-select
  const dogs = await fetch(
    `/customers/${item.customer_id}/dogs`,
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
        `/grooming/appointments/${editingGroomingId}`,
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
    const res = await fetch(`/customers/${customerId}/dogs`, {
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
    const res = await fetch('/services', {
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
      const res = await fetch(`/customers/${cid}/dogs`, {
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
    const res = await fetch('/services', {
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
        if (sel.value) {
      sel.dispatchEvent(new Event('change'));
    }

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
      `/appointments?date=${date}`,
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
    const url = `/appointments?date=${encodeURIComponent(date)}`;
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
      const res = await fetch('/addgrooming-appointments', {
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
      const res = await fetch('/dashboard/reports', {
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
      editHtml: `<button class="action-btn btn-edit" data-id="${item.id}">
  <i class="fa fa-edit"></i>
</button>`
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
          report_date: item.report_date ? formatHebDate(item.report_date) : '',

      
        image_path: `<img src="/uploads/${item.image_path}" alt="תמונה" style="max-width:100px;">`
      }));
  
      buildAccordionFromData(
        formatted,
        'accordion-abandoned',
        ['id','dog_size','health_status','care_provider_name','handler_name','statusBadge','editHtml'],
        ['image_path','customer_name','phone','address','notes','report_date','statusSelect'],
        {
          id:             "מס' סידורי",
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
          image_path:     "",
         statusBadge:   "סטטוס",
        statusSelect:  "עדכן סטטוס",
        editHtml:      "ערוך"

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
        `/abandoned-reports/${reportId}/status`,
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

// 1) Bind click על כרטיס ה-KPI הירוק
document.getElementById('newTodayCard')
        .addEventListener('click', openTodayInquiries);

// 2) פונקציה לפתיחת ה-Modal וטעינת הנתונים
async function openTodayInquiries() {
  // בונים תאריך Today בפורמט YYYY-MM-DD
  const today = new Date().toLocaleDateString('en-CA');

  try {
    const res = await fetch(
      `/dashboard/abnd/reports/today`,
      { credentials: 'include' }
    );
    if (!res.ok) throw new Error(res.statusText);

    const data = await res.json();  // מצפים למערך של אובייקטים עם שדות {id, report_date, customer_name, dog_size, health_status, status}

    // בונים את ה-tbody
    const tbody = document
      .getElementById('todayInquiriesTable')
      .querySelector('tbody');
    tbody.innerHTML = data.map(item => `
      <tr>
        <td>${item.id}</td>
        <td>${item.customer_name || '-'}</td>
        <td>${item.phone || '-'}</td>
        <td>${item.address || '-'}</td>
        <td>${item.dog_size || '-'}</td>
        <td>${item.health_status || '-'}</td>
      </tr>
    `).join('');

    // אם אין נתונים – אפשר לשים שורה אחת עם “אין פניות”
    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">אין פניות חדשות היום</td>
        </tr>`;
    }

    // מציגים את ה-Modal
    const modal = document.getElementById('todayInquiriesModal');
    modal.style.display = 'block';

  } catch (err) {
    console.error('Error loading today inquiries:', err);
    alert('שגיאה בטעינת הפניות של היום');
  }
}

// bind click על כרטיס KPI
document
  .getElementById('openReportsCard')
  .addEventListener('click', openOpenReports);

async function openOpenReports() {
  try {
    // מביאים את כל הפניות בסטטוס open
    const res = await fetch('/dashboard/abnd/reports/open', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json(); 
    // מצפים לשדות:
    // { id, customer_name, phone, address, dog_size, health_status, report_date }

    const tbody = document
      .getElementById('openReportsTable')
      .querySelector('tbody');

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:1rem;">
            אין פניות פתוחות
          </td>
        </tr>`;
    } else {
      tbody.innerHTML = data.map(r => `
        <tr>
          <td>${r.id}</td>
          <td>${r.customer_name || '-'}</td>
          <td>${r.phone || '-'}</td>
          <td>${r.address || '-'}</td>
          <td>${r.dog_size || '-'}</td>
          <td>${r.health_status || '-'}</td>
          <td>${new Date(r.report_date).toLocaleDateString('he-IL')}</td>
        </tr>
      `).join('');
    }

    // הפעלת המודאל
    const modal = document.getElementById('openReportsModal');
    modal.style.display = 'block';
  } catch (err) {
    console.error('Error loading open reports:', err);
    alert('שגיאה בטעינת הפניות הפתוחות');
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

// Function to load all handlers and populate the dropdown
async function loadHandlersDropdown() {
  const handlerSelect = document.getElementById('abndHandlerSelect');
  handlerSelect.innerHTML = '<option value="">טוען שליחים...</option>'; // Loading state

  try {
    const res = await fetch('/dashboard/couriers', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load handlers');
    const handlers = await res.json();

    // Populate the dropdown
    handlerSelect.innerHTML = '<option value="">בחר שליח...</option>';
    handlers.forEach(handler => {
      const option = document.createElement('option');
      option.value = handler.id;
      option.textContent = handler.name;
      handlerSelect.appendChild(option);
    });
  } catch (err) {
    console.error('Error loading handlers:', err);
    handlerSelect.innerHTML = '<option value="">שגיאה בטעינת שליחים</option>';
  }
}

async function loadCareProvidersDropdown() {
  const careProviderSelect = document.getElementById('abndCareProviderSelect');
  careProviderSelect.innerHTML = '<option value="">טוען גורמי סיוע...</option>'; // Loading state

  try {
    const res = await fetch('/dashboard/care-providers', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load care providers');
    const careProviders = await res.json();

    // Populate the dropdown
    careProviderSelect.innerHTML = '<option value="">בחר גורם סיוע...</option>';
    careProviders.forEach(provider => {
      const option = document.createElement('option');
      option.value = provider.id;
      option.textContent = provider.name;
      careProviderSelect.appendChild(option);
    });
  } catch (err) {
    console.error('Error loading care providers:', err);
    careProviderSelect.innerHTML = '<option value="">שגיאה בטעינת גורמי סיוע</option>';
  }
}

document.getElementById('Abandoned_cancelled').addEventListener('click', async () => {
  try {
    const res = await fetch('/manager/abandoned/cancelled-today', { credentials: 'include' });
    const reports = await res.json();

    const tbody = document.querySelector('#abandonedCancelledTable tbody');
    tbody.innerHTML = '';

    if (reports.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">אין פניות מבוטלות להיום</td></tr>';
    } else {
      reports.forEach(r => {
        const row = document.createElement('tr');
row.innerHTML = `
  <td>${r.id}</td>
  <td>${r.customer_name}</td>
  <td>${r.phone}</td>
  <td>${r.report_date.split('T')[0]}</td>
`;
        tbody.appendChild(row);
      });
    }

    document.getElementById('abandonedCancelledModal').style.display = 'block';
  } catch (err) {
    console.error('Error fetching cancelled abandoned reports:', err);
  }
});

// כפתור סגירה
function closeAbandonedCancelledModal() {
  document.getElementById('abandonedCancelledModal').style.display = 'none';
}

async function loadAbandonedCancelledCount() {
  try {
    const res = await fetch('/manager/abandoned/cancelled-today', { credentials: 'include' });
    const data = await res.json();
    document.getElementById('Abandoned-cancelled-today').textContent = data.length;
  } catch (err) {
    console.error('Error loading abandoned cancelled count:', err);
  }
}

// קריאה בעת הטעינה
loadAbandonedCancelledCount();


async function updateHandlerReportCounts() {
  const statuses = ['accepted', 'ontheway', 'rejected'];
  let sumofCounts = 0;
  for (const status of statuses) {
    try {
      const res = await fetch(`/manager/reports/by-status/${status}`, { credentials: 'include' });
      const data = await res.json();

      if (status === 'accepted') {
        document.getElementById('Hacceptedcount').textContent = data.length;
        sumofCounts+=data.length;
      } else if (status === 'ontheway') {
        document.getElementById('Honthewaycount').textContent = data.length;
        sumofCounts+=data.length;
      } else if (status === 'rejected') {
        document.getElementById('Hrejectedcount').textContent = data.length;
        sumofCounts+=data.length;
      }
      document.getElementById('Htotalcount').textContent = sumofCounts;
    } catch (err) {
      console.error(`Failed to load count for ${status}:`, err);
    }
  }
}

document.addEventListener('DOMContentLoaded', updateHandlerReportCounts);

const statusMap = {
  'sub-accepted': 'accepted',
  'sub-ontheway': 'ontheway',
  'sub-rejected': 'rejected'
};

Object.entries(statusMap).forEach(([divId, status]) => {
  document.getElementById(divId).addEventListener('click', async () => {
    try {
      const res = await fetch(`/manager/reports/by-status/${status}`, { credentials: 'include' });
      const reports = await res.json();

      const tbody = document.querySelector('#handlerReportsTable tbody');
      tbody.innerHTML = '';
        switch (status) {
          case 'accepted':
            document.getElementById('handlerReportsModalHeader').textContent = 'פניות שהתקבלו';
            break;
          case 'ontheway':
            document.getElementById('handlerReportsModalHeader').textContent = 'פניות בדרך';
            break;
          default:
            document.getElementById('handlerReportsModalHeader').textContent = 'פניות שנדחו';
            

        }

      if (reports.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">אין פניות   </td></tr>`;
      } else {
        reports.forEach(r => {
          const row = document.createElement('tr');
row.innerHTML = `
  <td>${r.id}</td>
  <td>${r.customer_name}</td>
  <td>${r.customer_phone}</td>
  <td>${r.handler_name || '—'}</td>
  <td>${r.handler_phone || '—'}</td>
  <td>${r.report_date.split('T')[0]}</td>
`;
          tbody.appendChild(row);
        });
      }

      document.getElementById('handlerReportsModal').style.display = 'block';
    } catch (err) {
      console.error('Error loading reports for status:', err);
    }
  });
});

function closeHandlerReportsModal() {
  document.getElementById('handlerReportsModal').style.display = 'none';
}





// Function to apply search filters for abandoned reports
function applyAbandonedSearch() {
  const category = document.getElementById('abdnSearchCategory').value;
  const searchText = document.getElementById('abndSearchText').value.trim().toLowerCase();
  const handlerId = document.getElementById('abndHandlerSelect').value;
  const careProviderId = document.getElementById('abndCareProviderSelect').value;
  const status = document.getElementById('abndStatusSelect').value;

  const filteredReports = _AbnDataCache.filter(report => {
    if (category === 'handler') {
      return handlerId === '' || String(report.handler_id) === handlerId;
    }
    if (category === 'care_provider') {
      return careProviderId === '' || String(report.care_provider_id) === careProviderId;
    }
    if (category === 'status') {
      return status === '' || report.status === status;
    }
    if (category) {
      return report[category]?.toString().toLowerCase().includes(searchText);
    }
    return true; // Show all reports if no category is selected
  });

  renderAbandonedReports(filteredReports); // Render filtered reports
}

// Event listener for category change
document.getElementById('abdnSearchCategory').addEventListener('change', () => {
  const category = document.getElementById('abdnSearchCategory').value;
  const textInput = document.getElementById('abndSearchText');
  const handlerSelect = document.getElementById('abndHandlerSelect');
  const careProviderSelect = document.getElementById('abndCareProviderSelect');
  const statusSelect = document.getElementById('abndStatusSelect');

  // Reset visibility of all inputs
  textInput.style.display = 'none';
  handlerSelect.style.display = 'none';
  careProviderSelect.style.display = 'none';
  statusSelect.style.display = 'none';

  // Show the relevant input based on the selected category
  if (category === 'handler') {
    handlerSelect.style.display = 'inline-block';
    loadHandlersDropdown(); // Load handlers dynamically
  } else if (category === 'care_provider') {
    careProviderSelect.style.display = 'inline-block';
    loadCareProvidersDropdown(); // Load care providers dynamically
  } else if (category === 'status') {
    statusSelect.style.display = 'inline-block';
  } else {
    textInput.style.display = 'inline-block';
  }

  // Reset values
  textInput.value = '';
  handlerSelect.value = '';
  careProviderSelect.value = '';
  statusSelect.value = '';
});

// Event listeners for search functionality
document.getElementById('abndSearchBtn').addEventListener('click', applyAbandonedSearch);
document.getElementById('abndClearBtn').addEventListener('click', () => {
  document.getElementById('abdnSearchCategory').value = '';
  document.getElementById('abndSearchText').value = '';
  document.getElementById('abndHandlerSelect').value = '';
  document.getElementById('abndCareProviderSelect').value = '';
  
  document.getElementById('abndHandlerSelect').style.display = 'none';
  document.getElementById('abndCareProviderSelect').style.display = 'none';
    document.getElementById('abndStatusSelect').style.display = 'none';

  document.getElementById('abndSearchText').style.display = 'inline-block';
  renderAbandonedReports(_AbnDataCache); // Reset to show all reports
});

function renderAbandonedReports(reports) {
  const container = document.getElementById('accordion-abandoned');
  container.innerHTML = ''; // Clear existing content

  // Define classMap and labelMap for status badges
  const classMap = {
    open: 'status-open',
    inprogress: 'status-inprogress',
    accepted: 'status-accepted',
    rejected: 'status-rejected',
    ontheway: 'status-ontheway',
    completed: 'status-completed',
    cancelled: 'status-cancelled'
  };

  const labelMap = {
    open: 'חדש',
    inprogress: 'בטיפול',
    accepted: 'התקבלה',
    rejected: 'נדחתה',
    ontheway: '<i class="fa fa-car"></i>',
    completed: 'הושלם',
    cancelled: 'בוטל'
  };

  const formatted = reports.map(report => ({
    ...report,
    statusBadge: `
      <span class="status-badge ${classMap[report.status] || ''}">
        ${labelMap[report.status] || report.status}
      </span>`
  }));

  buildAccordionFromData(
    formatted,
    'accordion-abandoned',
    ['id', 'customer_name', 'phone', 'dog_size', 'health_status', 'statusBadge'],
    ['address', 'notes', 'image_path', 'report_date'],
    {
      id: "מס' דוח",
      customer_name: "שם לקוח",
      phone: "טלפון",
      dog_size: "גודל כלב",
      health_status: "מצב בריאות",
      report_date: "תאריך דיווח",
      address: "כתובת",
      notes: "הערות",
      statusBadge: "סטטוס"
    }
  );
}
function showImgModal(src) {
  const modal     = document.getElementById('img-modal');
  const modalImg  = document.getElementById('img-modal-img');

  modalImg.src = src;
  modal.classList.add('open');   // <-- يفعّل ال-CSS الجديد
  modal.style.display = 'flex';
}

function closeImgModal() {
  const modal = document.getElementById('img-modal');
  modal.classList.remove('open');
  modal.style.display = 'none';
  document.getElementById('img-modal-img').src = '';
}

// Example: Add event listener for image clicks
document.addEventListener('click', function(e) {
  if (e.target.closest('#accordion-abandoned img')) {
    const img = e.target;
    showImgModal(img.src); // Show the modal with the clicked image
  }
});

document.getElementById('openabndBtn').addEventListener('click', async () => {
  document.getElementById('abandentpopup').style.display = 'block';
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
  title.style.textAlign = 'center'; // מרכז את הטקסט
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

let _handlersDataCache = [];

  async function loadHandlersAccordion() {
    try {
      const res = await fetch('/handlers', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      // Cache the data
      _handlersDataCache = data;

      // הסתרת הטבלה
      const table = document.getElementById('handlers-posts');
      if (table) table.style.display = 'none';
  
          const formatted = data.map(h => ({
      ...h,
      editHtml: `<button class="action-btn btn-edit" data-id="${h.id}">
  <i class="fa fa-edit"></i>
</button>`
    }));

      // בניית אקורדיון
      buildAccordionFromData(
        formatted,
        'accordion-handlers',
        ['id','name','phone','vehicle_type', 'editHtml'],                        // שדות בכותרת
        ['address','email'], // שדות בגוף
        {
          id:            "מס' שליח",
          name:          "שם",
          phone:         "טלפון",
          address:       "כתובת",
          vehicle_type:  "גודל רכב",
          editHtml:       "ערוך",
          email:         "אימייל"
        }
      );
  
    } catch (err) {
      console.error('Error loading handlers:', err);
      alert('שגיאה בטעינת שליחים');
    }
  }
document.getElementById('delivrySearchCategory').addEventListener('change', () => {
  const category = document.getElementById('delivrySearchCategory').value;
  const textInput = document.getElementById('delivrySearchText');
  const vehicleTypeSelect = document.getElementById('vehicleTypeSelect');

  // Reset visibility of all inputs
  textInput.style.display = 'none';
  vehicleTypeSelect.style.display = 'none';

  // Show the relevant input based on the selected category
  if (category === 'vehicle_type') {
    vehicleTypeSelect.style.display = 'inline-block';
  } else {
    textInput.style.display = 'inline-block';
  }

  // Reset values
  textInput.value = '';
  vehicleTypeSelect.value = '';
});

// Update the search function to handle vehicle type
function applyDelivrySearch() {
  const category = document.getElementById('delivrySearchCategory').value;
  const searchText = document.getElementById('delivrySearchText').value.trim().toLowerCase();
  const vehicleType = document.getElementById('vehicleTypeSelect').value;

  const filteredHandlers = _handlersDataCache.filter(handler => {
    if (category === 'vehicle_type') {
      return vehicleType === '' || handler.vehicle_type === vehicleType;
    }
    if (category) {
      return handler[category]?.toString().toLowerCase().includes(searchText);
    }
    return true; // Show all handlers if no category is selected
  });

  renderHandlers(filteredHandlers); // Render filtered handlers
}

// Event listeners for search functionality
document.getElementById('delivrySearchBtn').addEventListener('click', applyDelivrySearch);
document.getElementById('delivryClearBtn').addEventListener('click', () => {
  document.getElementById('delivrySearchCategory').value = '';
  document.getElementById('delivrySearchText').value = '';
  document.getElementById('vehicleTypeSelect').value = '';
  document.getElementById('vehicleTypeSelect').style.display = 'none';
  document.getElementById('delivrySearchText').style.display = 'inline-block';
  renderHandlers(_handlersDataCache); // Reset to show all handlers
});

function renderHandlers(handlers) {
  const container = document.getElementById('accordion-handlers');
  container.innerHTML = ''; // Clear existing content

  // Format handlers data for rendering
  const formattedHandlers = handlers.map(handler => ({
    ...handler,
    vehicle_type: handler.vehicle_type || 'לא צוין',
    email: handler.email || 'לא צוין',
    address: handler.address || 'לא צוין',
    editHtml: `<button class="action-btn btn-edit" data-id="${handler.id}">
  <i class="fa fa-edit"></i>
</button>`
    }));


  // Build accordion from formatted data
  buildAccordionFromData(
    formattedHandlers,
    'accordion-handlers',
    ['id', 'name', 'phone', 'vehicle_type', 'editHtml'], // Header keys
    ['address', 'email'], // Body keys
    {
      id: 'מס\' שליח',
      name: 'שם',
      phone: 'טלפון',
      vehicle_type: 'גדול רכב',
      address: 'כתובת',
      editHtml: 'ערוך',
      email: 'אימייל'
    }
  );
}

document.getElementById('addHandlerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const body = {
    id: document.getElementById('handlerId').value.trim(),
    name: document.getElementById('handlerName').value.trim(),
    phone: document.getElementById('handlerPhone').value.trim(),
    address: document.getElementById('handlerAddress').value.trim(),
    vehicle_type: document.getElementById('handlerVehicleType').value.trim(),
    email: document.getElementById('handlerEmail').value.trim(),
  };

  try {
    const res = await fetch('/handlers/add', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert('✅ שליח נוסף בהצלחה');
      closePopup('addHandlerPopup');
      document.getElementById('addHandlerForm').reset();
      loadHandlersAccordion(); // Refresh the handlers list
    } else {
      const error = await res.json();
      alert('❌ שגיאה בהוספת שליח: ' + (error.message || res.status));
    }
  } catch (err) {
    console.error('Error adding handler:', err);
    alert('❌ שגיאה בהוספת שליח');
  }
});

// Open the popup when the button is clicked
document.getElementById('openHandlerBtn').addEventListener('click', () => {
  openPopup('addHandlerPopup');
});
  
// =================== CARE PROVIDERS ACCORDION ===================
  async function loadCareProvidersAccordion() {
    try {
      const res = await fetch('/care-providers', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
  
      // הסתרת הטבלה
      const table = document.getElementById('support-posts');
      if (table) table.style.display = 'none';
  
          const formattedProviders = data.map(cp => ({
      ...cp,
      address:          cp.address          || 'לא צוין',
      phone:            cp.phone            || 'לא צוין',
      additional_phone: cp.additional_phone || 'לא צוין',
      // this string will be injected verbatim into your accordion
      editHtml: `<button class="action-btn btn-edit" data-id="${cp.id}">
                   <i class="fa fa-edit"></i>
                 </button>`
    }));


      // בניית אקורדיון
    buildAccordionFromData(
      formattedProviders,
      'accordion-support',
      // header keys: id, name, type, and finally your raw HTML
      ['id','name','type','phone','editHtml'],
      // body keys remain the same
      ['address','additional_phone'],
      // human‑readable labels (you can leave editHtml’s label blank)
      {
        id:               "מס' גורם",
        name:             "שם",
        type:             "סוג",
        editHtml:         "ערוך",              // no label, just the button
        address:          "כתובת",
        phone:            "טלפון",
        additional_phone: "טלפון נוסף"
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
    const res = await fetch('/dashboard/customers', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    const data = await res.json();

    // הסתרת הטבלה הקיימת
    const table = document.getElementById('customers-posts');
    if (table) table.style.display = 'none';

    // הכנה של הקונטיינר
    const container = document.getElementById('accordion-customers');
    container.innerHTML = '';

    // 1) הוספת שורת כותרת אחודה
    const hdrRow = document.createElement('div');
    hdrRow.classList.add('accordion-header', 'accordion-header--static');
    hdrRow.innerHTML = `
      <span>מס' לקוח</span>
      <span>שם</span>
      <span>טלפון</span>
      <span>ערוך</span>
    `;
    container.append(hdrRow);

    // 2) כל לקוח – בניית אקורדיון
    data.forEach(cust => {
      const acc = document.createElement('div');
      acc.classList.add('accordion');

      // הכותרת הדינמית
      const header = document.createElement('div');
      header.classList.add('accordion-header');
      header.innerHTML = `
        <span>${cust.id}</span>
        <span>${cust.customer_name}</span>
        <span>${cust.phone || '—'}</span>
        <button class="edit-btn" title="ערוך לקוח" 
                onclick="openEditCustomer(${cust.id})"
                style="border:none;background:#ffc107;cursor:pointer;color:#2563eb; max-width: 60px; margin-right: 120px;">
            <i class="fa fa-edit"></i>

        </button>
      `;

      // גוף האקורדיון
      const body = document.createElement('div');
      body.classList.add('accordion-body');
      body.style.display = 'none';
      body.innerHTML = `
        <div class="cust-info">
          <div>📧 אימייל: ${cust.email || '—'}</div>
          <div>📍 כתובת: ${cust.address || '—'}</div>
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

      // פתיחה/סגירה
      header.addEventListener('click', () => {
        const open = header.classList.toggle('open');
        body.style.display = open ? 'block' : 'none';
      });

      acc.append(header, body);
      container.append(acc);
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
    if (body.check_out <= body.check_in) {
      alert('יש לבחור תאריך יציאה מאוחר יותר מתאריך הכניסה');
      return;
    }
    // שלח את הבקשה
    try {
      const res = await fetch('/boarding-appointments', {
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
let _productDataCache = [];

// Function to load all products and cache them
async function loadProducts() {
  try {
    const res = await fetch('/products', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load products');
    const products = await res.json();
    _productDataCache = products; // Cache the products
    renderProducts(products); // Render all products initially
  } catch (err) {
    console.error('Error loading products:', err);
    alert('שגיאה בטעינת מוצרים');
  }
}

// Function to render products (e.g., in a table or accordion)
function renderProducts(products) {
  const container = document.getElementById('products-accordion');
  container.innerHTML = ''; // Clear existing content

  const formatted = products.map(prod => ({
    ...prod,
    image: prod.img_path
      ? `<img src="/uploads/${prod.img_path}" alt="${prod.name}" style="max-width:70px;max-height:70px;border-radius:6px;">`
      : '',
    stock_badge: prod.stock_quantity === 0
      ? '<span class="status-badge status-out">אזל מהמלאי</span>'
      : (prod.stock_quantity <= prod.min_quantity
        ? '<span class="status-badge status-low">מלאי נמוך</span>'
        : ''),
    price: `₪${prod.price}`,
    // ← new actions column
    actions: `<button class="edit-btn" data-id="${prod.id}">ערוך</button>`
  }));

  buildAccordionFromData(
    formatted,
    'products-accordion',
    // ← include 'actions' as the last column
    ['id','image', 'name',  'price', 'stock_badge', 'actions'],
    ['name','category','description', 'min_quantity', 'stock_quantity'],
    {
      id: 'מספר מוצר',
      image: 'תמונה',
      name: 'שם מוצר',
      category: 'קטגוריה',
      price: 'מחיר',
      stock_quantity: 'כמות במלאי',
      min_quantity: 'מינימום מלאי',
      description: 'תיאור',
      stock_badge: '',
      actions: ''        // header for the Edit button column (can leave empty or put 'פעולות')
    }
  );
}
// 1) After building the accordion, attach listeners

// 2) Placeholder for your edit‐modal logic
function openEditModal(productId) {
  // TODO: fetch product data by ID and populate your edit form/modal
  console.log('Opening edit modal for product ID:', productId);
  // e.g. 
  // fetch(`/api/products/${productId}`)
  //   .then(res => res.json())
  //   .then(data => populateForm(data));
}

// 3) Integrate into renderProducts
function renderProducts(products) {
  const container = document.getElementById('products-accordion');
  container.innerHTML = '';

  const formatted = products.map(prod => ({
    ...prod,
    image: prod.img_path
      ? `<img src="/uploads/${prod.img_path}" alt="${prod.name}" style="max-width:70px;max-height:70px;border-radius:6px;">`
      : '',
    stock_badge: prod.stock_quantity === 0
      ? '<span class="status-badge status-out">אזל מהמלאי</span>'
      : (prod.stock_quantity <= prod.min_quantity
        ? '<span class="status-badge status-low">מלאי נמוך</span>'
        : ''),
    price: `₪${prod.price}`,
    actions: `<button class="edit-btn" data-id="${prod.id}">  <i class="fa fa-edit"></i>
</button>`
  }));

  buildAccordionFromData(
    formatted,
    'products-accordion',
    ['id','image', 'name',  'price', 'stock_badge', 'actions'],
    ['name','category','description', 'min_quantity', 'stock_quantity'],
    {
      id: 'מס\' מוצר',
      image: 'תמונה',
      name: 'שם מוצר',
      category: 'קטגוריה',
      price: 'מחיר',
      stock_quantity: 'כמות במלאי',
      min_quantity: 'מינימום מלאי',
      description: 'תיאור',
      stock_badge: 'מצב מלאי',
      actions: ' ערוך'
    }
  );

  // Call this after the accordion is rendered
  attachEditListeners();
  
}

// 1) Fetch categories for the <select>
async function fetchCategories() {
  try {
    const res = await fetch('categories', { credentials: 'include' });
    if (!res.ok) throw new Error(res.status);
    return await res.json();             // [{id, name},…]
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
}

// 2) Open & populate Edit modal
async function openEditModal(productId) {
  openModal('editProductModal');

  // populate category <select>
  const select = document.getElementById('edit-category');
  const cats   = await fetchCategories();
  select.innerHTML = '<option value="">בחר קטגוריה…</option>' +
    cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  // fetch the product itself
  try {
    const res  = await fetch(`/api/products/${productId}`, { credentials: 'include' });
    if (!res.ok) throw new Error(res.status);
    const prod = await res.json();

    // fill inputs
    document.getElementById('edit-id').value       = prod.id;
    document.getElementById('edit-name').value     = prod.name;
    select.value                                  = prod.category_id;
    document.getElementById('edit-price').value    = prod.price;
    document.getElementById('edit-stock').value    = prod.stock_quantity;
    document.getElementById('edit-min').value      = prod.min_quantity;
    document.getElementById('edit-desc').value     = prod.description || '';
  } catch (err) {
    console.error('Error loading product:', err);
  }
}

// 3) Handle the form submission
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('editProductForm');
  console.log('⚙️ edit form found?', form);

  if (!form) return console.error('❌ editProductForm not in DOM!');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    console.log('✉️ editProductForm submit fired');

    const id = document.getElementById('edit-id').value;
    const payload = {
      name:           document.getElementById('edit-name').value,
      category_id:    parseInt(document.getElementById('edit-category').value, 10),
      price:          parseFloat(document.getElementById('edit-price').value),
      stock_quantity: parseInt(document.getElementById('edit-stock').value, 10),
      min_quantity:   parseInt(document.getElementById('edit-min').value, 10),
      description:    document.getElementById('edit-desc').value
    };
    console.log('📤 payload:', payload);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method:      'PUT',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify(payload)
      });
      console.log('🔄 PUT response:', res.status);
      if (!res.ok) throw new Error(res.status);

      closeModal('editProductModal');
      const products = await fetchAllProducts();
      renderProducts(products);
    } catch (err) {
      console.error('❗Error saving product:', err);
    }
  });
});

// 4) Ensure your attachEditListeners calls openEditModal
function attachEditListeners() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openEditModal(btn.dataset.id);
    });
  });
}
// Function to apply search filters
function applyProductSearch() {
  const category = document.getElementById('productSearchCategory').value;
  const searchText = document.getElementById('productSearchText').value.trim().toLowerCase();

  const filteredProducts = _productDataCache.filter(product => {
    const matchesCategory = !category || product[category]?.toString().toLowerCase().includes(searchText);
    const matchesText = !searchText || Object.values(product).some(value =>
      value?.toString().toLowerCase().includes(searchText)
    );
    return matchesCategory && matchesText;
  });

  renderProducts(filteredProducts); // Render filtered products
}

// Event listeners for search functionality
document.getElementById('productSearchBtn').addEventListener('click', applyProductSearch);
document.getElementById('productClearBtn').addEventListener('click', () => {
  document.getElementById('productSearchCategory').value = '';
  document.getElementById('productSearchText').value = '';
  renderProducts(_productDataCache); // Reset to show all products
});

// Load products on page load
document.addEventListener('DOMContentLoaded', loadProducts);
// קרא לפונקציה אחרי טעינת הדף
  async function loadStockKPIs() {
    try {
      const res = await fetch('/api/products/stock-counts', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const { low, out } = await res.json();

      document.getElementById('low_stock_pro').textContent = low;
      document.getElementById('out_stock_pro').textContent = out;
    } catch (err) {
      console.error('Failed to load stock KPIs:', err);
    }
  }

  // when the page is ready
  document.addEventListener('DOMContentLoaded', loadStockKPIs);
  // 2) fetch & render full product list under the cards
  // helper to open/close modal
// Grab elements
async function fetchLowStockProducts() {
  try {
    const res = await fetch('/api/products/low-stock', {
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error(`Server responded with ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('Error fetching low-stock products:', err);
    return [];
  }
}

async function fetchOutOfStockProducts() {
  try {
    const res = await fetch('/api/products/out-of-stock', {
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error(`Server responded with ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('Error fetching out-of-stock products:', err);
    return [];
  }
}

// --- Helpers to open/close any modal by ID ---
function openModal(id) {
  document.getElementById(id).style.display = 'flex';
}
function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

// Attach close handlers to × spans
document.querySelectorAll('.modal-close').forEach(el => {
  el.addEventListener('click', _=> closeModal(el.dataset.target));
});

// Also close when clicking outside content
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal(modal.id);
  });
});

// --- Button listeners ---
document.getElementById('low_stock')
  .addEventListener('click', showLowStockModal);

document.getElementById('out_stock')
  .addEventListener('click', showOutOfStockModal);

// --- Render table helper ---
function renderTable(bodyEl, products) {
  if (!products.length) {
    bodyEl.innerHTML = '<p>אין מוצרים להצגה.</p>';
    return;
  }
  let html = `
    <table>
      <thead>
        <tr><th>מספר מוצר</th><th>שם</th><th>כמות במלאי</th></tr>
      </thead>
      <tbody>
  `;
  products.forEach(p => {
    html += `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.stock_quantity}</td>
      </tr>
    `;
  });
  html += `</tbody></table>`;
  bodyEl.innerHTML = html;
}

// --- Modal functions ---
async function showLowStockModal() {
  openModal('lowStockModal');
  const body = document.getElementById('lowStockModalBody');
  body.innerHTML = '<p>טוען…</p>';
  const products = await fetchLowStockProducts();
  renderTable(body, products);
}

async function showOutOfStockModal() {
  openModal('outOfStockModal');
  const body = document.getElementById('outOfStockModalBody');
  body.innerHTML = '<p>טוען…</p>';
  const products = await fetchOutOfStockProducts();
  renderTable(body, products);
}

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


//============ timeline------------
// grooming-timeline.js

document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('GselectedDate');
  const prevBtn = document.getElementById('GprevDay');
  const nextBtn = document.getElementById('GnextDay');
  const serviceFilter = document.getElementById('serviceFilter');

  const today = new Date();
  dateInput.value = today.toISOString().split('T')[0];

  // Load initial data
  fetchAppointments(dateInput.value);

  prevBtn.addEventListener('click', () => {
    const date = new Date(dateInput.value);
    date.setDate(date.getDate() - 1);
    dateInput.value = date.toISOString().split('T')[0];
    fetchAppointments(dateInput.value);
  });

  nextBtn.addEventListener('click', () => {
    const date = new Date(dateInput.value);
    date.setDate(date.getDate() + 1);
    dateInput.value = date.toISOString().split('T')[0];
    fetchAppointments(dateInput.value);
  });

  dateInput.addEventListener('change', () => {
    fetchAppointments(dateInput.value);
  });

  serviceFilter.addEventListener('change', () => {
    fetchAppointments(dateInput.value);
  });

  async function fetchAppointments(date) {
    try {
      const res = await fetch(`/grooming-appointments/by-date?date=${date}`, {
        credentials: 'include'
      });
      let appointments = await res.json();

      // Fill service filter if needed
      populateServiceFilter(appointments);

      const selectedService = serviceFilter.value;
      if (selectedService) {
        appointments = appointments.filter(a => a.service_name === selectedService);
      }

      renderTimeline(appointments);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    }
  }

  function populateServiceFilter(appointments) {
    const services = [...new Set(appointments.map(a => a.service_name))];
    serviceFilter.innerHTML = '<option value="">כל השירותים</option>';
    services.forEach(service => {
      const opt = document.createElement('option');
      opt.value = service;
      opt.textContent = service;
      serviceFilter.appendChild(opt);
    });
  }

// “HH:MM:SS” → decimal hours
function timeToDecimal(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h + m/60;
}

// decimal hours → “HH:MM”
function formatHour(decimalHour) {
  const hour = Math.floor(decimalHour);
  const minutes = Math.round((decimalHour - hour) * 60);
  return `${hour.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;
}

function renderTimeline(appointments) {
  const labels = document.getElementById('timelineLabels');
  const grid   = document.getElementById('timelineGrid');
  labels.innerHTML = '';
  grid.innerHTML   = '';

  const startHour    = 9;
  const endHour      = 16.5;
  const unitHeight   = 35;             // px per 15min
  const pxPerMinute  = unitHeight/15;  // = 2px/min
  const labelHeight  = unitHeight * 2; // 60px per 30min

  // 1) build time‐labels every 30min
  for (let h = startHour; h <= endHour; h += 0.5) {
    const lbl = document.createElement('div');
    lbl.className    = 'time-label';
    lbl.textContent  = formatHour(h);
    lbl.style.height = `${labelHeight}px`;
    labels.appendChild(lbl);
  }

  // 2) match grid height to labels
  grid.style.height = `${labels.getBoundingClientRect().height}px`;

  // 3) place appointments
  appointments.forEach(app => {
    const [h, m]           = app.slot_time.split(':').map(Number);
    const minutesFromStart = (h - startHour)*60 + m;
    const top              = minutesFromStart * pxPerMinute;
    const height           = parseInt(app.duration, 10) * (pxPerMinute);

    const block = document.createElement('div');
    block.className    = `appointment-block status-${app.status}`;
    block.style.top    = `${top}px`;
    block.style.height = `${height}px`;
    block.innerHTML    = `
      <strong>${app.dog_name}</strong><br>
      ${app.service_name}
    `;
    grid.appendChild(block);
  });
}

  });
const labels = document.getElementById('timelineLabels');
const grid   = document.getElementById('timelineGrid');

// Whenever the grid scrolls, adjust the labels to match:
grid.addEventListener('scroll', () => {
  labels.scrollTop = grid.scrollTop;
});

// helper to format "YYYY-MM-DD" → "DD/MM"
function formatDate(iso) {
  const d = new Date(iso);
  return [
    String(d.getDate()).padStart(2, '0'),
    String(d.getMonth()+1).padStart(2, '0'),
    d.getFullYear()
  ].join('/');
}

async function loadBoardingGrid(date) {
  const res = await fetch(`/api/boarding-cells/status?date=${date}`, {
    credentials: 'include'
  });
  const cells = await res.json();
  const container = document.getElementById('boardingGrid');
  container.innerHTML = '';

  cells.forEach(c => {
    const div = document.createElement('div');
    div.className = 'boarding-cell ' + (c.available ? 'available' : 'booked');

    // show number + details if booked
      div.innerHTML = `
  <div class="cell-number">תא ${c.cell_number}</div>
  ${!c.available ? `
    <div class="appointment-id">#${c.appointmentId}</div>
    <div class="dog-name">${c.dog_name}</div>
    <div class="date-range">
      ${formatDate(c.check_in)}  ${formatDate(c.check_out)}
    </div>
  ` : ''}
`;


    // only add click for booked cells
  if (!c.available && c.appointmentId) {
    div.addEventListener('click', () => {
      console.log('clicked cell', c.cell_number, 'apptId', c.appointmentId);
      showBookingDetails(c.appointmentId);
          console.log('BOARDING CELLS:', cells);

    });
    }

    container.appendChild(div);

  });
}

document.addEventListener('DOMContentLoaded', () => {
  // … your existing init code …

  const grid = document.getElementById('boardingGrid');
  grid.addEventListener('click', e => {
    const cell = e.target.closest('.boarding-cell.booked');
    if (!cell) return;                      // clicked outside a booked cell
    const apptId = cell.dataset.apptId;
    if (!apptId) return;                    // no booking on that cell
    console.log('🖱️ delegated click for apptId', apptId);
    showBookingDetails(apptId);
  });
});


/**
 * Fetches full booking info and displays it in the #bookingModal.
 * @param {number|string} appointmentId
 */
async function showBookingDetails(appointmentId) {
  try {
    // 1) Fetch the appointment details
    const res = await fetch(`/api/boarding-appointments/${appointmentId}`, {
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data = await res.json();

    // 2) Populate the modal content
    const body = document.getElementById('modalBody');
    body.innerHTML = `
      <p><strong>כלב:</strong> ${data.dog_name}</p>
      <p><strong>בעלים:</strong> ${data.customer_name}</p>
      <p><strong>טלפון:</strong> ${data.customer_phone}</p>
      <p><strong>כניסה:</strong> ${new Date(data.check_in).toLocaleDateString()}</p>
      <p><strong>יציאה:</strong> ${new Date(data.check_out).toLocaleDateString()}</p>
      <p><strong>הערות:</strong> ${data.notes || '—'}</p>
    `;

    // 3) Show the modal
    const modal = document.getElementById('bookingModal');
    modal.classList.add('is-open');

  } catch (err) {
    console.error('Failed to load booking details:', err);
    alert('שגיאה בטעינת פרטי ההזמנה. נסה שנית.');
  }
}

// 4) Close button listener (run once on page init)
document.getElementById('modalClose').addEventListener('click', () => {
  document.getElementById('bookingModal').classList.remove('is-open');
});


// UTC‐based parse & format
function parseYMD(str) {
  const [y, m, d] = str.split('-').map(Number);
  // construct as UTC midnight
  return new Date(Date.UTC(y, m - 1, d));
}
function formatYMD(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('selectedDate');
  const prevDay   = document.getElementById('prevDay');
  const nextDay   = document.getElementById('nextDay');

  // initialize to today (UTC)
  const now = new Date();
  // use today's UTC date components
  const initDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  dateInput.value = formatYMD(initDate);
  loadBoardingGrid(dateInput.value);

  dateInput.addEventListener('change', () => {
    loadBoardingGrid(dateInput.value);
  });

prevDay.addEventListener('click', () => {
  const d = parseYMD(dateInput.value);
  d.setUTCDate(d.getUTCDate() - 1);     // ← go back one day
  dateInput.value = formatYMD(d);
  loadBoardingGrid(dateInput.value);
});

nextDay.addEventListener('click', () => {
  const d = parseYMD(dateInput.value);
  d.setUTCDate(d.getUTCDate() + 1);     // ← advance one day
  dateInput.value = formatYMD(d);
  loadBoardingGrid(dateInput.value);
});
});


//orders 
/**
 * Fetch all orders and render them as an accordion using your
 * buildAccordionFromData utility.
 */
async function loadOrdersAccordion() {
  try {
    const res = await fetch('/api/orders', { credentials: 'include' });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();

    // Hide any existing table
    const tbl = document.getElementById('ordersTable');
    if (tbl) tbl.style.display = 'none';

    // Build the accordion
    buildAccordionFromData(
      data,
      'ordersAccordion',                    // container ID
      ['id','customer_name','date','total'],// header fields
      ['status'],                           // body fields
      {                                     // labels for each field
        id:             'מספר הזמנה',
        customer_name:  'לקוח',
        date:           ' תאריך הזמנה',
        total:          'סה״כ',
        status:         'סטטוס'
      }
    );
  } catch (err) {
    console.error('Error loading orders:', err);
    alert('שגיאה בטעינת ההזמנות');
  }
}

/**
 * Fetch all orders (summary) and render them as an accordion.
 * When the user expands a panel, fetch full details and render them.
 */
document.addEventListener('DOMContentLoaded', () => {
  loadOrdersAccordion();
});
let ordersCache = [];

async function loadOrdersAccordion() {
  try {
    // 1) Fetch the order summaries
    const res = await fetch('/api/orders', { credentials: 'include' });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const orders = await res.json();
    ordersCache = orders; // cache for edit functionality

    // 2) Grab (or create) the container
    const containerId = 'ordersAccordion';
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }
    container.innerHTML = '';

    // 2a) Render the fixed header row
    renderAccordionHeaderRow(
      container,                                          // pass the element itself
      ['id','customer_name','date','total','status','edit'],     // keys, in display order
      {                                                   // your Hebrew labels
        id:             'מס׳ הזמנה',
        customer_name:  'לקוח',
        date:           'תאריך',
        total:          'סה״כ',
        status:         'סטטוס',
        edit:          'ערוך'
      }
    );

    // 3) Map status→Hebrew for badges
    const statusLabels = {
      new:        'חדש',
      pending:    'בהמתנה',
      on_the_way: 'בדרך',
      cancelled:  'מבוטל',
      completed:  'הושלם'
    };

    // 4) Build an accordion‐panel per order
    orders.forEach(order => {
      const panel = document.createElement('div');
      panel.className = 'accordion';

      // -- HEADER
      const hdr = document.createElement('div');
      hdr.className = 'accordion-header';
      hdr.innerHTML = `
        <span>#${order.id}</span>
        <span>${order.customer_name}</span>
        
        <span>${order.date}</span>
        <span>₪${Number(order.total).toFixed(2)}</span>
        <span class="status-badge status-${order.status}">
          ${statusLabels[order.status] || order.status}
        </span>
        
                <button 
          class="edit-btn" 
          onclick="openEditOrder(${order.id})" 
          title="ערוך הזמנה"
          style=" max-width: 60px; border:none; cursor:pointer;margin-right: 115px;"
        >
            <i class="fa fa-edit"></i>

        </button>

      `;
      panel.appendChild(hdr);

      // -- BODY placeholder
      const body = document.createElement('div');
      body.className = 'accordion-body';
      body.style.display = 'none';
      body.innerHTML = `<div class="spinner">טוען פרטים…</div>`;
      panel.appendChild(body);

      // -- TOGGLE & LAZY LOAD
hdr.addEventListener('click', async e => {
          if (e.target.closest('.edit-btn')) return;

        const open = hdr.classList.toggle('open');
        body.style.display = open ? 'block' : 'none';

        if (open && !panel.dataset.loaded) {
          try {
            const detailsRes = await fetch(
              `/api/orders/${order.id}/full`,
              { credentials: 'include' }
            );
            if (!detailsRes.ok) throw new Error(detailsRes.status);
            const detail = await detailsRes.json();
            renderOrderDetails(body, detail);
            panel.dataset.loaded = 'true';
          } catch (err) {
            body.innerHTML = `<div class="error">שגיאה בטעינת הפרטים</div>`;
            console.error(err);
          }
        }
      });

      container.appendChild(panel);
    });

  } catch (err) {
    console.error('Error loading orders:', err);
    alert('שגיאה בטעינת ההזמנות');
  }
}

//edit orders 
// 1) Utility to recalc the total display
// 1) Recalculate total whenever quantities change
function recalcEditTotal() {
  let sum = 0;
  document.querySelectorAll('#editOrderProducts tr').forEach(tr => {
    const qty   = parseInt(tr.querySelector('.item-qty').value,10) || 0;
    const price = parseFloat(tr.querySelector('.item-price').dataset.price) || 0;
    const line  = qty * price;
    tr.querySelector('.item-line').textContent = '₪' + line.toFixed(2);
    sum += line;
  });
  document.getElementById('editOrderTotal').textContent = '₪' + sum.toFixed(2);
}

// 2) Open modal and populate
async function openEditOrder(orderId) {
  try {
    const res = await fetch(`/api/orders/${orderId}/full`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
    const order = await res.json();

    // 2a) Fill order ID
    document.getElementById('editOrderId').value = order.id;

    // 2b) Fill address fields (only city, street, house_number)
    const addr = order.address || {};
    document.getElementById('editCity').value        = addr.city || '';
    document.getElementById('editStreet').value      = addr.street || '';
    document.getElementById('editHouseNumber').value = addr.house_number || '';

    // 2c) Build products table
    const tbody = document.getElementById('editOrderProducts');
    tbody.innerHTML = '';
    order.items.forEach(item => {
      // null-safe price
      const price = Number(item.unit_price) || 0;

      const tr = document.createElement('tr');
      tr.dataset.productId = item.product_id;
      tr.innerHTML = `
        <td>${item.product_name}
          <input type="hidden" class="edit-item-id" value="${item.product_id}">
        </td>
        <td><input type="number" class="item-qty"
                   value="${item.quantity}" min="0" style="width:4rem;"></td>
        <td data-price="${price}" class="item-price">₪${price.toFixed(2)}</td>
        <td class="item-line">₪0.00</td>
        <td><button type="button" class="delete-item-btn">✖️</button></td>
      `;
      // attach events
      tr.querySelector('.item-qty')
        .addEventListener('input', recalcEditTotal);
      tr.querySelector('.delete-item-btn')
        .addEventListener('click', () => {
          tr.remove();
          recalcEditTotal();
        });
      tbody.appendChild(tr);
    });

    // initial total
    recalcEditTotal();

    // show modal
    const m = document.getElementById('editOrderModal');
    m.hidden = false;
    m.style.display = 'flex';

  } catch (err) {
    console.error('openEditOrder error:', err);
    alert('שגיאה בטעינת פרטי ההזמנה');
  }
}

// 3) Close modal
function closeEditOrderModal() {
  const m = document.getElementById('editOrderModal');
  m.hidden = true;
  m.style.display = 'none';
  document.getElementById('editOrderProducts').innerHTML = '';
}

// 4) Submit handler
document.getElementById('editOrderForm')
  .addEventListener('submit', async e => {
    e.preventDefault();
    const orderId = +document.getElementById('editOrderId').value;

    // gather updated items
    const items = Array.from(
      document.querySelectorAll('#editOrderProducts tr')
    ).map(tr => ({
      product_id: +tr.querySelector('.edit-item-id').value,
      quantity:   +tr.querySelector('.item-qty').value
    }));

    // gather address fields
    const address = {
      city:         document.getElementById('editCity').value,
      street:       document.getElementById('editStreet').value,
      house_number: document.getElementById('editHouseNumber').value
    };

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method:      'PUT',
        credentials: 'include',
        headers:     {'Content-Type':'application/json'},
        body:        JSON.stringify({ address, items })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || res.statusText);
      }
      closeEditOrderModal();
      await loadOrdersAccordion();
    } catch (err) {
      console.error('Error saving order:', err);
      alert('שגיאה בשמירת השינויים: ' + err.message);
    }
  });


/**
 * Given a container <div> and a full order object (from /api/orders/:id/full),
 * injects all the detail HTML and hooks up status‐change logic.
 */
function renderOrderDetails(container, order) {
  // 1️⃣ Build the status dropdown
   
// 1️⃣ Build the status dropdown

const statusLabels = {
  new:        'חדש',
  pending:    'בהמתנה',
  on_the_way: 'בדרך',
  cancelled:  'מבוטל',
  completed:  'הושלם'
};

let statuses = [
  { val: 'new',         label: 'חדש'     },
  { val: 'pending',     label: 'בהמתנה'  },
  { val: 'on_the_way',  label: 'בדרך'    },
  { val: 'cancelled',   label: 'מבוטל'   },
  { val: 'completed',   label: 'הושלם'   },
];

// Add current status if not in the list
if (!statuses.some(s => s.val === order.status)) {
  let label = statusLabels[order.status];
  if (!label) {
    label = order.status && typeof order.status === 'string'
      ? order.status
      : 'עדכן סטטוס ';
  }
  statuses.unshift({ val: order.status || '', label });
}

const optionsHtml = statuses.map(s => `
  <option value="${s.val}" ${order.status === s.val ? 'selected' : ''}>
    ${s.label}
  </option>
`).join('');
  // 2️⃣ Inject the full details layout
  container.innerHTML = `
    <div class="order-info">
      <p><strong>סטטוס:</strong>
        <select id="statusSelect-${order.id}" class="status-select">
          ${optionsHtml}
        </select>
      </p>
      <p><strong>נוצר ב:</strong> ${order.created_at}</p>
      <p><strong>שיטת תשלום:</strong> ${order.payment_method}</p>
    </div>

    <div class="order-customer">
      <h4>פרטי לקוח</h4>
      <p><strong>שם:</strong> ${order.customer_name}</p>
      <p><strong>ת.ז.:</strong> ${order.customer_id}</p>
      <p><strong>טלפון:</strong> ${order.customer_phone}</p>
      <p><strong>אימייל:</strong> ${order.customer_email}</p>
    </div>

    <div class="order-address">
      <h4>כתובת למשלוח</h4>
      <p>
    ${(() => {
      const a = order.address || {};
      return `${a.street || ''} ${a.house_number || ''}, ${a.city || ''}`.trim();
    })()}
      </p>
    </div>

    <table class="order-items">
      <thead>
        <tr>
          <th>מוצר</th>
          <th>כמות</th>
          <th>יחידה</th>
          <th>סה"כ</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map(item => `
          <tr>
            <td>${item.product_name}</td>
            <td>${item.quantity}</td>
            <td>₪${item.unit_price.toFixed(2)}</td>
            <td>₪${item.line_total.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // 3️⃣ Wire up the status‐change handler
  const select = document.getElementById(`statusSelect-${order.id}`);
  select.addEventListener('change', async () => {
    const newStatus = select.value;
    try {
      const resp = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!resp.ok) throw new Error(`Status ${resp.status}`);
      // quick UI feedback
      select.disabled = true;
      setTimeout(() => select.disabled = false, 600);
      order.status = newStatus;
      refreshStatusCards();
    }

    catch (err) {
      console.error('Failed to update status:', err);
      alert('שגיאה בעדכון סטטוס ההזמנה');
      // revert selection
      select.value = order.status;
    }
          loadOrdersAccordion(); // Refresh the accordion to reflect changes

  });

}

let productsCache = [];
let categoriesCache = [];

// 2.1) פוקנציה לטעינת קטגוריות
async function loadCategories() {
  const res = await fetch('/api/categories', { credentials:'include' });
  categoriesCache = await res.json();
  const catSel = document.getElementById('productCategoryFilter');
  categoriesCache.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    catSel.appendChild(opt);
  });
}

// 2.2) פוקנציה למילוי רשימת מוצרים לפי סינון
function populateProductSelect(filterName = '') {
  const sel = document.getElementById('newProductSelect');
  sel.innerHTML = '<option value="">בחר מוצר להוספה…</option>';

  productsCache.forEach(p => {
    // אם filterName ריק – כל המוצרים, אחרת רק אלו שהתווית שלהם תואמת
    if (!filterName || p.category === filterName) {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} — ₪${Number(p.price).toFixed(2)}`;
      sel.appendChild(opt);
    }
  });
}

// 2.3) פוקנציה לטעינת מוצרים + התחברות לסינון
async function loadAllProducts() {
  try {
    const res = await fetch('/products', { credentials:'include' });
    if (!res.ok) throw new Error(res.statusText);
    productsCache = await res.json();
    // אחרי שיש שני caches נתונים, מלא את המודל ברשימות
    populateProductSelect();  
  } catch(err) {
    console.error('Failed to load products:', err);
  }
}

loadCategories();

// 2.4) אירוע על שינוי קטגוריה
document
  .getElementById('productCategoryFilter')
  .addEventListener('change', e => {
    const catId = e.target.value;
    // מצא את המחרוזת שהמשתמש בחר
    const cat = categoriesCache.find(c => String(c.id) === String(catId));
    const name = cat ? cat.name : '';
    console.log('Filtering products to category name:', name);
    populateProductSelect(name);
  });

  
// 2.5) קריאה ראשונית
window.addEventListener('DOMContentLoaded', () => {
  loadAllProducts();
  populateProductSelect(); // initial population
    const addBtn = document.getElementById('addProductBtn');
  console.log('addProductBtnelem=', addBtn);
  addBtn.addEventListener('click', handleAddProduct);
});

// 2.6) הוספת מוצר חדש
function recalcEditOrderTotal() {
  const tbody = document.getElementById('editOrderProducts');
  let sum = 0;
  tbody.querySelectorAll('tr').forEach(tr => {
    const lineTotalCell = tr.querySelector('.line-total');
    // הורידו ש"ח וסבילו למספר
    const value = parseFloat(lineTotalCell.textContent.replace(/[^0-9.-]+/g,"")) || 0;
    sum += value;
  });
  // עדכון התצוגה
  document.getElementById('editOrderTotal').textContent =
    `₪${sum.toFixed(2)}`;
}

// 2) הפונקציה שמטפלת בלחיצה על "הוסף מוצר"
function handleAddProduct() {
  const sel   = document.getElementById('newProductSelect');
  const qtyIn = document.getElementById('newProductQty');
  const pid   = Number(sel.value);
  const qty   = Math.max(1, Number(qtyIn.value) || 1);

  if (!pid) {
    return alert('בחר מוצר לפני הוספה.');
  }

  // מצא את אובייקט המוצר
  const prod = productsCache.find(p => p.id === pid);
  if (!prod) {
    return console.error('Product not found in cache:', pid);
  }

  // חשב מחיר שורה
  const unitPrice = Number(prod.price);
  const lineTotal = unitPrice * qty;

  // בניית <tr>
  const tr = document.createElement('tr');
  tr.setAttribute('data-product-id', pid);
  tr.style.backgroundColor = '#F0FFFF'; // light gray for new rows
  tr.innerHTML = `
    <td>${prod.name}</td>
    <td>
      <input type="number"
             class="item-qty"
             value="${qty}"
             min="1"
             style="width:4rem;"/>
    </td>
    <td>₪${unitPrice.toFixed(2)}</td>
    <td class="line-total">₪${lineTotal.toFixed(2)}</td>
    <td>
        <button type="button" class="remove-line-btn">✖️</button>
    </td>
  `;
  

  const tbody = document.getElementById('editOrderProducts');
  tbody.appendChild(tr);

  // 2a) מאזין לשינוי כמות בשורה
  tr.querySelector('.item-qty').addEventListener('input', e => {
    const newQty = Math.max(1, Number(e.target.value) || 1);
    e.target.value = newQty;
    const newTotal = unitPrice * newQty;
    tr.querySelector('.line-total').textContent = `₪${newTotal.toFixed(2)}`;
    recalcEditOrderTotal();
  });

  // 2b) מאזין לכפתור הסרה
document
  .getElementById('editOrderProducts')
  .addEventListener('click', function(e) {
    const btn = e.target.closest('button.remove-line-btn');
    if (!btn) return;
    const row = btn.closest('tr');
    if (row) {
      row.remove();
      recalcEditOrderTotal();
    }
  });
}

// 4) רישום המאזין בלחיצה (מקפיד שזה קורה אחרי קיום ה-HTML במודאל)
const addBtn = document.getElementById('addProductBtn');
if (addBtn) {
  addBtn.addEventListener('click', handleAddProduct);
} else {
  console.error('addProductBtn not found in DOM');
}



async function refreshStatusCards() {
  try {
    const res = await fetch('/api/orders/status-counts', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error(res.status);
    const { new_count, pending_count, on_the_way_count,cancelled_count } = await res.json();

    document.getElementById('new_orders_count').textContent            = new_count;
    document.getElementById('pending_orders_count').textContent = pending_count;
    document.getElementById('ontheway_orders_count').textContent = on_the_way_count;
    document.getElementById('cancelled_orders_count').textContent = cancelled_count;
  } catch (err) {
    console.error('Failed to load status counts:', err);
  }
}

// call it on page load (and whenever you need to refresh)
document.addEventListener('DOMContentLoaded', () => {
  refreshStatusCards();
});

const statusLabels = {
  new:        'הזמנות חדשות',
  pending:    'הזמנות בטיפול',
  on_the_way: 'הזמנות בדרך',
  cancelled:  'הזמנות בוטלו',
  completed:  'הזמנות הושלמו'
};

async function showStatusOrders(status) {
  try {
    const res = await fetch(`/api/orders/by-status?status=${status}`, { credentials:'include' });
    if (!res.ok) throw new Error(res.status);
    const orders = await res.json();

    document.getElementById('ordersStatusModalTitle').textContent =
      statusLabels[status] || 'הזמנות';

    const body = document.getElementById('ordersStatusModalBody');
    if (orders.length === 0) {
      body.innerHTML = `<p>אין הזמנות במצב "${statusLabels[status]}"</p>`;
    } else {
      let html = `
        <table class="orders-table">
          <thead>
            <tr>
              <th>מס׳ הזמנה</th>
              <th>לקוח</th>
              <th>תאריך</th>
              <th>סה״כ</th>
            </tr>
          </thead>
          <tbody>
      `;
      orders.forEach(o => {
        html += `
          <tr>
            <td>#${o.id}</td>
            <td>${o.customer_name}</td>
            <td>${o.date}</td>
            <td>₪${Number(o.total).toFixed(2)}</td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
      body.innerHTML = html;
    }

    const modal = document.getElementById('ordersStatusModal');
    modal.classList.remove('hidden');
    modal.classList.add('is-open');
  } catch (err) {
    console.error('Failed to load orders for status', status, err);
    alert('שגיאה בטעינת ההזמנות');
  }
}

// Close button
document.getElementById('ordersStatusModalClose')
  .addEventListener('click', () => {
    const modal = document.getElementById('ordersStatusModal');
    modal.classList.remove('is-open');
    modal.classList.add('hidden');
  });

// KPI clicks
document.getElementById('new_orders')
  .addEventListener('click', () => showStatusOrders('new'));
document.getElementById('pending_orders')
  .addEventListener('click', () => showStatusOrders('pending'));
document.getElementById('ontheway_orders')
  .addEventListener('click', () => showStatusOrders('on_the_way'));
document.getElementById('cancelled_orders')
  .addEventListener('click', () => showStatusOrders('cancelled'));

    async function loadEmployeesAccordion() {
      console.log('Loading employees accordion…');
        const roleLabels = {
    manager:    'מנהל',
    groomingE:  'טיפוח',
    boardingE:  'פנסיון',
    abandonedE: 'נטושים',
    storeE:     'חנות',
    handlerE:   'שליח'
  };

    try {
      // 1) Fetch all employees
      const res = await fetch('/api/employees', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const employees = await res.json();

      // 2) Hide any existing table
      const table = document.getElementById('employees-table');
      if (table) table.style.display = 'none';

      // 3) Prepare the accordion container
      const container = document.getElementById('employee-accordion');
      container.innerHTML = '';

      // 4) Static header row
      const hdr = document.createElement('div');
      hdr.classList.add('accordion-header', 'accordion-header--static');
      hdr.innerHTML = `
        <span>מס' עובד</span>
        <span>שם מלא</span>
        <span>טלפון</span>
        <span>תפקיד</span>
        <span>ערוך</span>
      `;
      container.append(hdr);

      // 5) One panel per employee
      employees.forEach(emp => {
        const panel = document.createElement('div');
        panel.classList.add('accordion');
      const roleLabel = roleLabels[emp.role] || emp.role;

        // — Header
        const header = document.createElement('div');
        header.classList.add('accordion-header');
        header.innerHTML = `
          <span>${emp.id}</span>
          <span>${emp.full_name}</span>
          <span>${emp.phone || '—'}</span>
          <span>${roleLabel || '—'}</span>
          <button
            class="edit-btn"
            title="ערוך עובד"
            onclick="openEditEmployee('${emp.id}')"
            style="border:none;background:#ffc107;color:#2563eb;cursor:pointer;max-width:60px;margin-right:120px;"
          >
            <i class="fa fa-edit"></i>
          </button>
        `;

        // — Body (hidden by default)
        const body = document.createElement('div');
        body.classList.add('accordion-body');
        body.style.display = 'none';
        body.innerHTML = `
          <p><strong>אימייל:</strong> ${emp.email || '—'}</p>
          <p><strong>כתובת:</strong> ${emp.address || '—'}</p>
        `;

        // — Toggle open/closed
        header.addEventListener('click', e => {
          // If click on the edit button, skip the toggle
          if (e.target.closest('.edit-btn')) return;
          const isOpen = header.classList.toggle('open');
          body.style.display = isOpen ? 'block' : 'none';
        });


        panel.append(header, body);
        container.append(panel);
      });

    } catch (err) {
      console.error('Error loading employees:', err);
      alert('שגיאה בטעינת העובדים');
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    loadEmployeesAccordion();
  });
document
  .getElementById('openEmployeeBtn')
  .addEventListener('click', () => openPopup('addEmployeePopup'));


// 3) Handle the form submission
document
  .getElementById('addEmployeeForm')
  .addEventListener('submit', async e => {
    e.preventDefault();
    const id        = document.getElementById('employeeId').value;
    const full_name = document.getElementById('employeeFullName').value.trim();
    const role      = document.getElementById('employeeRole').value.trim();
    const phone     = document.getElementById('employeePhone').value.trim();
    const email     = document.getElementById('employeeEmail').value.trim();
    const address   = document.getElementById('employeeAddress').value.trim();
    const password  = document.getElementById('employeePassword').value;

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id, full_name, role, phone, email, address, password })
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      // success!
      closePopup('addEmployeePopup');
      // clear the form:
      e.target.reset();
      // reload the list:
      loadEmployeesAccordion();
    } catch (err) {
      console.error('Failed to add employee:', err);
      alert('שגיאה בהוספת עובד');
    }
  });

// 1) Open & populate the Edit popup
function openEditEmployee(id) {
  const popup = document.getElementById('editEmployeePopup');
  const form  = document.getElementById('editEmployeeForm');
  const passchange = document.getElementById('togglePasswordBtn');
  const passinput = document.getElementById('editPasswordFields');
passchange.addEventListener('click', () => {
  passinput.style.display = passinput.style.display === 'none' ? 'block' : 'none';
});
  // fetch the employee data
  fetch(`/api/employees/${id}`, { credentials: 'include' })
    .then(r => r.json())
    .then(emp => {
      document.getElementById('editEmployeeId').value      = emp.id;
      document.getElementById('editEmployeeName').value    = emp.full_name;
      document.getElementById('editEmployeeRole').value    = emp.role;
      document.getElementById('editEmployeePhone').value   = emp.phone;
      document.getElementById('editEmployeeEmail').value   = emp.email;
      document.getElementById('editEmployeeAddress').value = emp.address;
      document.getElementById('editEmployeePassword').value= '';
      popup.removeAttribute('hidden');
      popup.style.display = 'flex';
    })
    .catch(err => {
      console.error('Failed to load employee:', err);
      alert('שגיאה בטעינת פרטי העובד');
    });
}

// 2) Close helper
function closeEditEmployee() {
  document.getElementById('editEmployeePopup').setAttribute('hidden', '');
  document.getElementById('editEmployeePopup').style.display = 'none';
}

// 3) Handle form submission (PUT)
document.getElementById('editEmployeeForm').addEventListener('submit', async e => {
  e.preventDefault();

  const id       = document.getElementById('editEmployeeId').value;
  const full_name= document.getElementById('editEmployeeName').value.trim();
  const role     = document.getElementById('editEmployeeRole').value;
  const phone    = document.getElementById('editEmployeePhone').value.trim();
  const email    = document.getElementById('editEmployeeEmail').value.trim();
  const address  = document.getElementById('editEmployeeAddress').value.trim();
  const password = document.getElementById('editEmployeePassword').value;

  // build payload
  const payload = { full_name, role, phone, email, address };
  if (password) payload.password = password;

  try {
    const resp = await fetch(`/api/employees/${encodeURIComponent(id)}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) throw new Error(`Status ${resp.status}`);

    closeEditEmployee();
    loadEmployeesAccordion(); // re-load the list
  } catch (err) {
    console.error('Error saving employee:', err);
    alert('שגיאה בעדכון פרטי העובד');
  }
});
