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
    
  const categorySelect = document.getElementById('abndSearchCategory');
  if (!categorySelect) {
    console.error('Element with ID abndSearchCategory not found!');
    return;
  }

  categorySelect.addEventListener('change', () => {
    const txt   = document.getElementById('abndSearchText');
    const stSel = document.getElementById('abndSearchStatusSelect');

    if (categorySelect.value === 'status') {
      txt.style.display   = 'none';
      stSel.style.display = 'inline-block';
    } else {
      stSel.style.display = 'none';
      txt.style.display   = 'inline-block';
    }
  });
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

  // ================== search abandoned reports ===================

document.getElementById('abndSearchBtn').addEventListener('click', () => {
  const category = document.getElementById('abndSearchCategory').value;
  const text = document.getElementById('abndSearchText').value.toLowerCase();
  const status = document.getElementById('abndSearchStatusSelect').value;

  let filtered = [..._AbnDataCache];

  if (category === 'status') {
    if (status) {
      filtered = filtered.filter(item => item.status === status);
    }
  } else if (category && text) {
    filtered = filtered.filter(item => {
      const fieldValue = (item[category] ?? '').toString().toLowerCase();
      return fieldValue.includes(text);
    });
  }

  // עדכון תצוגה מחדש
  const dataM = filtered.map(item => ({
    ...item,
    statusBadge: `<span class="status-badge ${classMap[item.status] || ''}">
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

  const formatted = dataM.map(item => ({
    ...item,
    handler_id: item.handler_id ?? 'לא שובץ',
    care_provider: item.care_provider ?? 'לא שובץ',
    image_path: `<img src="/uploads/${item.image_path}" alt="תמונה" style="max-width:100px;">`
  }));

  buildAccordionFromData(
    formatted,
    'accordion-abandoned',
    ['id','customer_name','phone','dog_size','health_status','care_provider_name','statusBadge'],
    ['address','notes','image_path','report_date','statusSelect'],
    {
      id: "מס' דוח",
      customer_name: "שם לקוח",
      phone: "טלפון",
      dog_size: "גודל כלב",
      health_status: "מצב בריאות",
      report_date: "תאריך דיווח",
      address: "כתובת",
      notes: "הערות",
      care_provider_name: "גורם מטפל",
      image_path: "תמונה",
      statusBadge: " ",
      statusSelect: "עדכן סטטוס"
    }
  );
});

// ניקוי
document.getElementById('abndClearBtn').addEventListener('click', () => {
  document.getElementById('abndSearchText').value = '';
  document.getElementById('abndSearchStatusSelect').value = '';
  document.getElementById('abndSearchCategory').value = '';
  loadAbandonedReports(); // טען הכל מחדש
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
    const classMap = {
  pending:     'status-pending',
  inprogress:  'status-inprogress',
  accepted:    'status-accepted',
  rejected:    'status-rejected',
  ontheway:    'status-ontheway',
  completed:   'status-completed',
  cancelled:   'status-cancelled'
};

const labelMap = {
  pending:     'ממתין',
  inprogress:  'בטיפול',
  accepted:    'התקבלה',
  rejected:    'נדחתה',
  ontheway:    '<i class="fa fa-car"></i>',
  completed:   'הושלם',
  cancelled:   'בוטל'
};

async function loadAbandonedReports() {
  console.log('calling loadAbandonedReports…');
console.log('running loadAbandonedReports');
console.log('tbody:', document.getElementById('accordion-body'));
  try {
    // 1. Fetch
    const res = await fetch('http://localhost:3000/handler/reports', {
      credentials: 'include',
      cache: 'no-cache'
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Server error ${res.status}: ${err}`);
    }
    const raw = await res.json();

    // 2. Hide static table if data exists (optional)

    // 3. Prepare records
    const records = raw.map(item => ({
      id:            item.id,
      customer_name: item.customer_name,
      phone:         item.phone,
      dog_size:      item.dog_size,
      health_status: item.health_status,
      care_provider: item.care_provider_name || 'לא שובץ',
      statusBadge:   `<span class="status-badge ${classMap[item.status]||''}">
                        ${labelMap[item.status]||item.status}
                     </span>`,
      statusSelect: `<select class="status-select" data-id="${item.id}">
                       <option value="">בחר סטטוס</option>
                       <option value="accepted"   ${item.status==='accepted'  ?'selected':''}>התקבלה</option>
                       <option value="rejected"   ${item.status==='rejected'  ?'selected':''}>נדחתה</option>
                       <option value="ontheway"   ${item.status==='ontheway'  ?'selected':''}>בדרך</option>
                       <option value="completed"  ${item.status==='completed'?'selected':''}>הושלם</option>
                       <option value="cancelled"  ${item.status==='cancelled'?'selected':''}>בוטל</option>
                     </select>`,
      address:     item.address,
      notes:       item.notes,
      image_path:  item.image_path
                    ? `<img src="/uploads/${item.image_path}" style="max-width:80px;">`
                    : 'אין תמונה',
      report_date: new Date(item.report_date).toLocaleDateString('he-IL')
    }));

    // 4. Render into <tbody>
    const tbody = document.getElementById('accordion-body');
    tbody.innerHTML = '';

    records.forEach(rec => {
      // --- summary row ---
      const trSum = document.createElement('tr');
      trSum.classList.add('accordion-summary');
      trSum.innerHTML = `
        <td>▶</td>
        <td>${rec.id}</td>
        <td>${rec.customer_name}</td>
        <td>${rec.phone}</td>
        <td>${rec.dog_size}</td>
        <td>${rec.health_status}</td>
        <td>${rec.care_provider}</td>
        <td>${rec.statusBadge}</td>
      `;
      tbody.appendChild(trSum);

      // --- detail row ---
      const trDet = document.createElement('tr');
      trDet.classList.add('accordion-detail');
      trDet.style.display = 'none'; // initially hidden
      trDet.innerHTML = `
        <td colspan="8">
          <strong>כתובת:</strong> ${rec.address}<br>
          <strong>הערות:</strong> ${rec.notes}<br>
          <strong>תמונה:</strong> ${rec.image_path}<br>
          <strong>תאריך דיווח:</strong> ${rec.report_date}<br>
          ${rec.statusSelect}
        </td>
      `;
      tbody.appendChild(trDet);
const select = trDet.querySelector('.status-select');
select.addEventListener('change', async e => {
  const newStatus = e.target.value;
  const reportId  = e.target.dataset.id;

  // 1) Optimistically update the badge in the summary row
  const badgeCell = trSum.children[7]; // the 8th <td> is your statusBadge
  badgeCell.innerHTML = `
    <span class="status-badge ${newStatus}">
      ${labelMap[newStatus] || newStatus}
    </span>
  `;

  // 2) (Optional) send update to server
  try {
    const resp = await fetch(`/api/abandonedReports/${reportId}/status`, {
  method: 'PATCH',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ status: newStatus }),
  credentials: 'include'
});
loadAbandonedReports(); // Reload reports to reflect changes
loadKpiData();
  loadAbandonedStats();
  if (!resp.ok) throw new Error(await resp.text());
  } catch (err) {
    console.error('Failed to save status:', err);
    alert('לא ניתן לשמור את הסטטוס'); 
    
    // revert in case of error
    const prev = rec.status; 
    e.target.value = prev;
    badgeCell.innerHTML = rec.statusBadge;
  }
});

      
      // toggle on click
      trSum.addEventListener('click', () => {
        const open = trDet.style.display === '';
        trDet.style.display = open ? 'none' : '';
        trSum.querySelector('td:first-child').textContent = open ? '▶' : '▼';
      });
    });

  } catch (err) {
    console.error(err);
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
    // 1) fetch all care providers from your working route
    const res = await fetch('http://localhost:3000/care-providers', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    const data = await res.json();

    // 2) grab & clear the container
    const container = document.getElementById('accordion-support');
    container.innerHTML = '';

    // 3) static header row
    const hdr = document.createElement('div');
    hdr.classList.add('accordion-header', 'accordion-header--static');
    hdr.innerHTML = `
      <span>מס' גורם</span>
      <span>שם</span>
      <span>סוג</span>
      <span>כתובת</span>
      <span>טלפון</span>
    `;
    container.appendChild(hdr);

    // 4) build each provider panel
    data.forEach(item => {
      const panel = document.createElement('div');
      panel.classList.add('accordion');

      // header
      const head = document.createElement('div');
      head.classList.add('accordion-header');
      head.innerHTML = `
        <span>${item.id}</span>
        <span>${item.name}</span>
        <span>${item.type || '—'}</span>
        <span>${item.address || '—'}</span>
        <span>${item.phone || '—'}</span>
      `;
      panel.appendChild(head);

      // body
      const body = document.createElement('div');
      body.classList.add('accordion-body');
      body.style.display = 'none';
      body.innerHTML = `
        <p><strong>כתובת:</strong> ${item.address || '—'}</p>
        <p><strong>טלפון:</strong> ${item.phone || '—'}</p>
        <p><strong>טלפון נוסף:</strong> ${item.additional_phone || '—'}</p>
        <p><strong>סוג:</strong> ${item.type || '—'}</p>
      `;
      panel.appendChild(body);

      // toggle
      head.addEventListener('click', () => {
        const open = head.classList.toggle('open');
        body.style.display = open ? 'block' : 'none';
      });

      container.appendChild(panel);
    });

  } catch (err) {
    console.error('Error loading care providers:', err);
    alert('שגיאה בטעינת גורמי הסיוע');
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
        <td>${job.id}</td>
        <td>${job.dog_size}</td>
        <td>${job.health_status}</td>
        <td>${job.address}</td>
        <td>${new Date(job.report_date).toLocaleDateString()}</td>
        <td>${job.care_provider_name}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error('Error loading profile:', err);
  }
}

// 1) אחרי שנטענו את כל הדיווחים והנחתם ב-#completedJobsTable tbody:
async function initCompletedJobsSearch() {
  const catSel   = document.getElementById('completedJobsSearchCategory');
  const txtInput = document.getElementById('completedJobsSearchText');
  const provSel  = document.getElementById('completedJobsProviderSelect');
  const dateInp  = document.getElementById('completedJobsDateInput');
  const tbody    = document.querySelector('#completedJobsTable tbody');
  const healthSel = document.getElementById('completedJobsHealthSelect');

  // 2) מלא את provSel בערכי גורם מטפל ייחודיים
  try {
    const res = await fetch('http://localhost:3000/care-providers', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error(res.statusText);
    const providers = await res.json();
    providers.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.name;
      opt.textContent = p.name;
      provSel.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load care providers for filter:', err);
  }

  // 3) כשמשנים קטגוריה
  catSel.addEventListener('change', () => {
    const v = catSel.value;
    // הסתר את כל השדות:
    [txtInput, provSel, healthSel, dateInp].forEach(el => el.style.display = 'none');

    // הפעל לפי קטגוריה:
    if (v === 'provider') {
      provSel.style.display = '';
    } else if (v === 'date') {
      dateInp.style.display = '';
    } else if (v === 'health') {            // NEW case
      healthSel.style.display = '';
    } else if (v) {
      txtInput.style.display = '';
    }
    // reset values:
    txtInput.value  = '';
    provSel.value   = '';
    healthSel.value = '';
    dateInp.value   = '';

    filterCompletedJobs();  // סינון מחדש
  });

  // 4) מאזינים לשינויי ערך
  txtInput.addEventListener('input',    filterCompletedJobs);
  provSel .addEventListener('change',   filterCompletedJobs);
  dateInp .addEventListener('change',   filterCompletedJobs);
}

// הפונקציה שמסננת בפועל
function filterCompletedJobs() {
  const cat = document.getElementById('completedJobsSearchCategory').value;
  const txt = document.getElementById('completedJobsSearchText').value.trim().toLowerCase();
  const prov= document.getElementById('completedJobsProviderSelect').value;
  const dt  = document.getElementById('completedJobsDateInput').value;  // YYYY-MM-DD

  document
    .querySelectorAll('#completedJobsTable tbody tr')
    .forEach(tr => {
      let keep = true;
      if (cat === 'id') {
        keep = tr.cells[0].textContent.trim().toLowerCase().includes(txt);
      } else if (cat === 'size') {
        keep = tr.cells[1].textContent.trim().toLowerCase().includes(txt);
      } else if (cat === 'health') {
        keep = tr.cells[2].textContent.trim().toLowerCase().includes(txt);
      } else if (cat === 'address') {
        keep = tr.cells[3].textContent.trim().toLowerCase().includes(txt);
      } else if (cat === 'date') {
        // תאריך בתא בפורמט ישראלי? אם כן, תתאים השוואה פשוטה
        keep = tr.cells[4].querySelector('time')
                ? tr.cells[4].querySelector('time').getAttribute('datetime') === dt
                : tr.cells[4].textContent.trim().includes(dt);
      } else if (cat === 'provider') {
        keep = prov === '' || tr.cells[5].textContent.trim() === prov;
      }
      tr.style.display = keep ? '' : 'none';
    });
}

// קריאה ראשונית: מיד אחרי שהטבלה נטענה
initCompletedJobsSearch();
