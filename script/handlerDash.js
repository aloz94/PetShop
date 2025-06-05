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

  // =================== SIDEBAR SECTION SWITCHING ===================
  // מעבר בין סקשנים

  document.addEventListener('DOMContentLoaded', async() => {
    await checkLogin(); // <--- Add this line
    // בוחרים את כל הלינקים בסיידבר
    const links = document.querySelectorAll('.sidebar ul li a');
    // וגם את כל המקטעים בתוכן
    const sections = document.querySelectorAll('main .content');

  
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
  loadAbandonedReports(); // <-- Load abandoned reports on page load
  loadKpiData();
  loadAbandonedStats(); // <-- Load abandoned reports stats on page load
  loadCareProvidersAccordion() // <-- Load care providers accordion on page load
  loadHandlerProfile();
    

});


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

// Enlarge image on click in accordion-abandoned
document.addEventListener('click', function(e) {
  // Only handle clicks on images inside accordion-abandoned
  if (e.target.closest('#accordion-abandoned img')) {
    const img = e.target;
    const modal = document.getElementById('img-modal');
    const modalImg = document.getElementById('img-modal-img');
    modalImg.src = img.src;
    modal.style.display = 'flex';
  }
  // Close modal when clicking outside the image
  if (e.target.id === 'img-modal') {
    e.target.style.display = 'none';
    document.getElementById('img-modal-img').src = '';
  }
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

// =================== KPI DATA LOADER ===================
async function loadKpiData() {
  try {
    const res = await fetch('/api/handler/abandoned-dogs/kpi', { credentials: 'include' });
    const { inProgress, accepted, ontheway, cancelledToday } = await res.json();

    document.getElementById('in-progress-report').textContent   = inProgress;
    document.getElementById('accepted-report').textContent       = accepted;
    document.getElementById('ontheway-report').textContent       = ontheway;
    document.getElementById('cancelledtoday-report').textContent = cancelledToday;
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
  
// =================== ABANDONED REPORTS STATS LOADER ===================
async function loadAbandonedStats() {
  try {
    const res = await fetch('/handler/abandoned/stats', {
      credentials: 'include',
      cache: 'no-cache'
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);

    const stats = await res.json();
    // stats: { inProgress, accepted, ontheway, cancelledToday }

    // Update your KPI cards or elements with the new values
    document.getElementById('in_progress_reports').textContent   = stats.inProgress;
    document.getElementById('acceptedcount').textContent       = stats.accepted;
    document.getElementById('onthewaycount').textContent       = stats.ontheway;
    document.getElementById('cancelled-today-report').textContent = stats.cancelledToday;
    document.getElementById('inprogres_reports').textContent = stats.pending;
  } catch (err) {
    console.error('Error loading abandoned-reports stats:', err);
  }
}
// =================== ABANDONED REPORTS HANDLER ===================
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
     inprogress: 'status-inprogress',//בטיפול
      accepted:   'status-accepted',
      rejected:   'status-rejected',
      ontheway:  'status-ontheway',
      completed:  'status-completed',
      cancelled:  'status-cancelled'
    };
    const labelMap = {
    inprogress: 'ממתין',// בטיפול
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
          <option value="">בחר סטטוס</option>
          <option value="accepted" ${item.status === 'accepted' ? 'selected' : ''}>התקבלה</option>
          <option value="rejected" ${item.status === 'rejected' ? 'selected' : ''}>נדחתה</option>
          <option value="ontheway" ${item.status === 'ontheway' ? 'selected' : ''}>בדרך</option>
          <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>הושלם</option>
          <option value="cancelled" ${item.status === 'cancelled' ? 'selected' : ''}>בוטל</option>
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
        ['id','customer_name','phone','dog_size','health_status','care_provider_name','statusBadge'],
        ['address','notes','image_path','report_date','statusSelect'],
        {
          id:             "מס' דוח",
          customer_name:  "שם לקוח",
          phone:          "טלפון",
          dog_size:       "גודל כלב",
          health_status:  "מצב בריאות",
          report_date:    "תאריך דיווח",
          address:        "כתובת",
          notes:          "הערות",
        //  status:         "סטטוס",
        //  handler_name:       "שליח",
          care_provider_name: "גורם מטפל ",
          image_path:     "תמונה",
         statusBadge:   " ",
        statusSelect:  "עדכן סטטוס",
       // editHtml:      "ערוך/שבץ"

        }
      );
    
    } catch (err) {
      console.error('Error loading abandoned reports:', err);
      alert('שגיאה בטעינת פניות לכלבים נטושים');
    }
  }

  // =================== STATUS UPDATE HANDLER ===================
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
 //----------HANDLER PROFILE -------------------
async function loadHandlerProfile() {
  try {
    const res = await fetch('/handler-profile', { credentials: 'include' });
    const data = await res.json();

    document.getElementById('handlerName').textContent = data.handler.name;
    document.getElementById('handlerPhone').textContent = data.handler.phone;
    document.getElementById('handlerEmail').textContent = data.handler.email;
    document.getElementById('handlerVehicle').textContent = data.handler.vehicle_type;
    document.getElementById('handlerAddress').textContent = data.handler.address;

    const tableBody = document.querySelector('#completedJobsTable tbody');
    tableBody.innerHTML = '';

    data.completedJobs.forEach(job => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${job.dog_size}</td>
        <td>${job.health_status}</td>
        <td>${job.address}</td>
        <td>${new Date(job.report_date).toLocaleDateString()}</td>
        <td>${job.care_provider}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error('Error loading profile:', err);
  }
}