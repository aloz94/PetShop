//============= manager features =================


  function loadManagerStats() {
    // This function can be used to load manager statistics dynamically
    // For example, you can fetch data from an API and update the chart
    console.log("Loading manager statistics...");
    // Example: Update chart data
    myChart.data.datasets[0].data = [1500, 2200, 3500, 2800];
    myChart.update();
  }

  async function loadEmployeeCount() {
  try {
    const res  = await fetch('http://localhost:3000/manager/stats/employees', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Bad response');
    const total = await res.json();
    document.getElementById('total-employees').textContent = total.employeeCount;
  } catch (err) {
    console.error('fetch employee count failed', err);
    document.getElementById('total-employees').textContent = '—';
  }
}

// لما تفتحي صفحة المدير
loadEmployeeCount();
loadDogsInBoarding();
loadLowStockCount();
loadOpenAbnd();
loadRevenueToday();


async function loadDogsInBoarding() {
  try {
    const res = await fetch('http://localhost:3000/manager/stats/dogs', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Bad response');
    const total = await res.json();
    document.getElementById('total-dogs').textContent = total.dogCount;
  } catch (err) {
    console.error('fetch dogs in boarding failed', err);
    document.getElementById('total-dogs').textContent = '—';
  }
  
}

async function loadLowStockCount() {
  try {
    const res   = await fetch('/manager/stats/low-stock', { credentials: 'include' });
    const  total  = await res.json();
    document.getElementById('low-stock-count').textContent = total.lowStockCount;
  } catch (err) {
    console.error('count error', err);
  }
}

// 2. عند الكليك نعرض اللستة بالـ Modal
/*async function openLowStockModal() {
  try {
    const res   = await fetch('/manager/stats/low-stock/list', { credentials: 'include' });
    const items = await res.json();

    const list = document.getElementById('lowStockModalList');
    list.innerHTML = '';

    /* 👇 כותרת */
   /* const header = document.createElement('li');
    header.className = 'list-header';
    header.innerHTML = `
  <span class="sku-head">מק״ט</span>
  <span class="prod-head">מוצר</span>
  <span class="qty-head">כמות</span>
    `;
    list.appendChild(header);

    /* 👇 המוצרים */
   /* items.forEach(p => {
      const li = document.createElement('li');
      if (p.stock_quantity <= 3) li.classList.add('crit');

      li.innerHTML = `
        <span class="prod">
          <i class="fas fa-box-open"></i>
          <span class="prod-id">#${p.id}</span>
          <span class="prod-name">${p.name}</span>
        </span>
        <span class="qty">${p.stock_quantity}</span>
      `;

      /* תוספת צבע לגרדיאנט לפי ספרה אחרונה */
    /*  li.querySelector('.prod-id')
        .setAttribute('data-id-last', p.id.toString().slice(-1));

      list.appendChild(li);
    });

    document.getElementById('lowStockModal').style.display = 'block';
  } catch (err) {
    console.error('list error', err);
  }
}

// 3. ربط الأحداث
document.addEventListener('DOMContentLoaded', () => {
  loadLowStockCount();

  // Use the specific ID for the low stock card
  const lowStockCard = document.getElementById('low-stock');
  if (lowStockCard) {
    lowStockCard.addEventListener('click', openLowStockModal);
  }

  // زر الإغلاق
  document.querySelector('#lowStockModal .close-btn')
          .addEventListener('click', () =>
             document.getElementById('lowStockModal').style.display = 'none'
          );
});*/

async function loadOpenAbnd() {
      try {
      // 1) Adjust the URL if needed (same‐origin vs. explicit host)
      const res = await fetch('/dashboard/abandoned/stats', {
        credentials: 'include',
        cache: 'no-cache'
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      const stats = await res.json();
      document.getElementById('open-abandoned').textContent = stats.openCount;

  } catch (err) {
    console.error('fetch open abandoned count failed', err);
    document.getElementById('open-abandoned').textContent = '—';
  }
}

async function loadRevenueToday() {
  try {
    const res   = await fetch('/manager/stats/revenue-today', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('bad response');
    const { total } = await res.json();


    document.getElementById('revenue-today').textContent =
      new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' })
        .format(total);
  } catch (err) {
    console.error('fetch revenue error', err);
    document.getElementById('revenue-today').textContent = '—';
  }
}

/*document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('incomeChart').getContext('2d');
  const incomeChart = new Chart(ctx, {
    type : 'bar',
    data : {
      labels   : ['טיפוח', 'פנסיון', 'חנות אונליין'],
      datasets : [{
        label      : 'הכנסה (₪)',
        data       : [0, 0, 0],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales    : { y: { beginAtZero: true } },
      plugins   : { legend: { display: false } }
    }
  });bar chart*/ 

let incomeChart;
let pieChart;

async function loadRevenueChart(period = 'today') {
  const res = await fetch(`/manager/stats/revenue-components?period=${period}`);
  const { grooming, boarding, store } = await res.json();

  const ctx = document.getElementById('incomeChart').getContext('2d');

  if (incomeChart) incomeChart.destroy();

  incomeChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['טיפוח', 'פנסיון', 'חנות אונליין'],
      datasets: [{
        label: 'הכנסה (₪)',
        data: [grooming, boarding, store],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

/*document.addEventListener('DOMContentLoaded', () => {
  const card      = document.querySelector('.kpi-card.purple');
  const container = document.getElementById('incomeChartContainer');
  const Scontainer = document.getElementById('DailyGroomingPieChart')
  let hideTimer;                                       // מזהה לטיימר

  if (card && container) {
    
        card.addEventListener('click', () => {
      container.style.display = 'block';
      Scontainer.style.display = 'block';
    });

    /* הצגה מיידית כשעוברים עם העכבר */
  /*  card.addEventListener('mouseenter', () => {
      clearTimeout(hideTimer);                         // מבטל טיימר קודם
      container.style.display = 'block';
            Scontainer.style.display = 'block';

    });

    /* הסתרה – 5 שניות אחרי שהעכבר יוצא */
   /* card.addEventListener('mouseleave', () => {
      hideTimer = setTimeout(() => {
        container.style.display = 'none';
      }, 5000);                                        // 5000 ms = 5 שניות
    });
  }
});*/ 



async function loadPieChartForServices(period = 'today') {
  const res = await fetch(`/manager/stats/service-counts?period=${period}`);
  const data = await res.json();
  const labels = ['רחצה וטיפוח מלא', 'תספורת קיץ', 'ניקוי שיניים'];
  const values = [data.service1, data.service2, data.service3];
  const total = values.reduce((a, b) => a + b, 0);
  const ctx = document.getElementById('GroomingPieChart').getContext('2d');

  if (pieChart) pieChart.destroy();

  pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        datalabels: {
          color: '#000',
          font: { weight: 'bold', size: 14 },
          formatter: (value) => {
            const percent = total ? ((value / total) * 100).toFixed(1) : 0;
            return `${value} (${percent}%)`;
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // טעינה ראשונית
  loadRevenueChart();
  loadPieChartForServices();

  // שינוי לפי רדיו להכנסות
  document.querySelectorAll('input[name="incomePeriod"]').forEach(radio => {
    radio.addEventListener('change', () => loadRevenueChart(radio.value));
  });

  // שינוי לפי רדיו לשירותים
  document.querySelectorAll('input[name="piePeriod"]').forEach(radio => {
    radio.addEventListener('change', () => loadPieChartForServices(radio.value));
  });
});

let topProductsChart;

/**
 * Fetches and renders the top-products chart for the given time range.
 * @param {'today'|'week'|'month'} range
 */
async function loadTopProductsChart(range = 'today') {
  try {
    console.log('🔄 [Chart] Loading top products for range:', range);
    const url = `/manager/stats/top-products?range=${range}`;
    console.log('📤 [Chart] Fetch URL:', url);

    const res  = await fetch(url, { credentials: 'include' });
    console.log('⬅️ [Chart] Response status:', res.status);
    const data = await res.json();
    console.log('📊 [Chart] Data received:', data);

    // --- convert strings to numbers ---
    const labels   = data.map(p => p.name);
    const values   = data.map(p => Number(p.total_sold)   || 0);
    const revenues = data.map(p => Number(p.total_revenue)|| 0);

    const ctx = document
      .getElementById('TopProductsChart')
      .getContext('2d');

    if (topProductsChart) {
      console.log('🗑️ [Chart] Destroying previous chart instance');
      topProductsChart.destroy();
    }

    topProductsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'כמות שנמכרה',
          data: values,
          backgroundColor: '#4dc9f6'
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        layout: { padding: { right: 20 } },
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: '5 המוצרים הנמכרים ביותר',
            align: 'end'
          },
          tooltip: {
            rtl: true,
            callbacks: {
              label: ctx => {
                const i = ctx.dataIndex;
                return `כמות: ${values[i]} | הכנסה: ₪${revenues[i].toFixed(2)}`;
              }
            }
          },
          datalabels: {
            anchor: 'end',
            align: 'center',
            font: { weight: 'bold', size: 12 },
            color: '#333',
            formatter: (_, context) =>
              context.chart.data.labels[context.dataIndex]
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            reverse: true,
            position: 'top',
            ticks: { font: { size: 12 } },
            grid: { drawOnChartArea: false }
          },
          y: {
            position: 'right',
            ticks: {
              display: false,
              font: { size: 14 },
              align: 'start',
              padding: 10
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    });

    console.log('✅ [Chart] Rendered chart for range:', range);
  } catch (err) {
    console.error('❗ [Chart] Error loading top products chart:', err);
  }
}








// When the page loads, draw the chart and wire up the radio buttons
document.addEventListener('DOMContentLoaded', () => {
  // 1) Initial draw using the checked radio
  const initialRange = document.querySelector('input[name="timeRange"]:checked').value;
  loadTopProductsChart(initialRange);

  // 2) Re-draw when the user changes the time range
  document.querySelectorAll('input[name="timeRange"]').forEach(radio => {
    radio.addEventListener('change', e => {
      if (e.target.checked) {
        loadTopProductsChart(e.target.value);
      }
    });
  });
});









//reports 

// … (any existing imports or top-of-file code) …

/**
 * Export an HTML <table> to CSV and trigger a download.
 * @param {HTMLTableElement} table 
 * @param {string} filename 
 */
function exportTableToCSV(table, filename) {
  // 1) Collect all rows
  const rows = Array.from(table.querySelectorAll('tr'));
  const csvContent = rows.map(row => {
    const cells = Array.from(row.querySelectorAll('th, td'));
    // 2) Wrap each cell in quotes, escape existing quotes, join with semicolons
    return cells
      .map(cell => `"${cell.textContent.trim().replace(/"/g, '""')}"`)
      .join(';');
  }).join('\r\n');

  // 3) Prepend UTF-8 BOM so Excel recognizes encoding
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

  // 4) Create temporary link & click to download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function loadReport(type) {
  const period = "weekly";
  const container = document.getElementById('reportContainer');
  container.innerHTML = '<p>טוען דוח...</p>';

  // helper to inject export button & wire it up after the table is rendered
  const addExport = (filename) => {
    container.insertAdjacentHTML('afterbegin',
      `<button id="exportCsvBtn" class="export-btn">📥 הורד CSV</button>`
    );
    document
      .getElementById('exportCsvBtn')
      .addEventListener('click', () => {
        const tbl = container.querySelector('table.report-table');
        exportTableToCSV(tbl, filename);
      });
  };

  switch (type) {
    case 'customers-active':
      container.innerHTML = `
        <h3>לקוחות פעילים</h3>
        <p>לקוחות שביצעו הזמנה/שירות בחודשיים האחרונים</p>
        <table class="report-table">
          <thead>
            <tr>
              <th>#</th><th>ת.ז.</th><th>שם</th><th>טלפון</th><th>אימייל</th>
            </tr>
          </thead>
          <tbody id="reportTableBody"></tbody>
        </table>`;
      addExport('customers-active.csv');
      fetch('/reports/customers-active')
        .then(r => r.json())
        .then(data => {
          const tb = document.getElementById('reportTableBody');
          tb.innerHTML = data.map((c,i) => `
            <tr>
              <td>${i+1}</td>
              <td>${c.id}</td>
              <td>${c.name}</td>
              <td>${c.phone}</td>
              <td>${c.email}</td>
            </tr>`).join('');
        });
      break;

    case 'customers-inactive':
      container.innerHTML = `
        <h3>⚠️ לקוחות לא פעילים</h3>
        <p>לקוחות שלא ביצעו הזמנה או רכישה בחודשיים האחרונים</p>
        <table class="report-table">
          <thead>
            <tr>
              <th>#</th><th>ת.ז.</th><th>שם</th><th>טלפון</th><th>אימייל</th>
            </tr>
          </thead>
          <tbody id="reportTableBody"></tbody>
        </table>`;
      addExport('customers-inactive.csv');
      fetch('/reports/customers-inactive')
        .then(r => r.json())
        .then(data => {
          const tb = document.getElementById('reportTableBody');
          tb.innerHTML = data.map((c,i) => `
            <tr>
              <td>${i+1}</td>
              <td>${c.id}</td>
              <td>${c.name}</td>
              <td>${c.phone}</td>
              <td>${c.email}</td>
            </tr>`).join('');
        })
        .catch(e => { container.innerHTML = '<p>שגיאה בטעינת הדוח.</p>'; console.error(e); });
      break;

    case 'customers-new':
      container.innerHTML = `
        <h3>✨ לקוחות חדשים</h3>
        <p>לקוחות שנרשמו למערכת בחודש האחרון</p>
        <table class="report-table">
          <thead>
            <tr>
              <th>#</th><th>ת.ז.</th><th>שם</th><th>טלפון</th><th>אימייל</th>
            </tr>
          </thead>
          <tbody id="reportTableBody"></tbody>
        </table>`;
      addExport('customers-new.csv');
      fetch('/reports/customers-new')
        .then(r => r.json())
        .then(data => {
          const tb = document.getElementById('reportTableBody');
          tb.innerHTML = data.map((c,i) => `
            <tr>
              <td>${i+1}</td>
              <td>${c.id}</td>
              <td>${c.name}</td>
              <td>${c.phone}</td>
              <td>${c.email}</td>
            </tr>`).join('');
        })
        .catch(e => { container.innerHTML = '<p>שגיאה בטעינת הדוח.</p>'; console.error(e); });
      break;

    case 'customers-returning':
      container.innerHTML = `
        <h3>♻️ לקוחות חוזרים בפנסיון</h3>
        <p>לקוחות שביצעו יותר מהזמנת פנסיון אחת</p>
        <table class="report-table">
          <thead>
            <tr>
              <th>#</th><th>ת.ז.</th><th>שם</th><th>טלפון</th><th>אימייל</th><th>סה"כ הזמנות</th>
            </tr>
          </thead>
          <tbody id="reportTableBody"></tbody>
        </table>`;
      addExport('customers-returning.csv');
      fetch('/reports/customers-returning')
        .then(r => r.json())
        .then(data => {
          const tb = document.getElementById('reportTableBody');
          tb.innerHTML = data.map((c,i) => `
            <tr>
              <td>${i+1}</td>
              <td>${c.id}</td>
              <td>${c.name}</td>
              <td>${c.phone}</td>
              <td>${c.email}</td>
              <td>${c.total_reservations}</td>
            </tr>`).join('');
        })
        .catch(e => { container.innerHTML = '<p>שגיאה בטעינת הדוח.</p>'; console.error(e); });
      break;

    case 'boarding-upcoming':
      container.innerHTML = `
        <h3>📆 הזמנות פנסיון עתידיות</h3>
        <p>רשימת הזמנות עתידיות לפנסיון מהיום והלאה</p>
        <table class="report-table">
          <thead>
            <tr>
              <th>#</th><th>ת.ז.</th><th>שם לקוח</th><th>שם כלב</th><th>כניסה</th><th>יציאה</th>
            </tr>
          </thead>
          <tbody id="reportTableBody"></tbody>
        </table>`;
      addExport('boarding-upcoming.csv');
      fetch('/reports/boarding-upcoming')
        .then(r => r.json())
        .then(data => {
          const tb = document.getElementById('reportTableBody');
          tb.innerHTML = data.map((row,i) => `
            <tr>
              <td>${i+1}</td>
              <td>${row.customer_id}</td>
              <td>${row.customer_name}</td>
              <td>${row.dog_name}</td>
              <td>${new Date(row.check_in).toLocaleDateString('he-IL')}</td>
              <td>${new Date(row.check_out).toLocaleDateString('he-IL')}</td>
            </tr>`).join('');
        })
        .catch(e => { container.innerHTML = '<p>שגיאה בטעינת הדוח.</p>'; console.error(e); });
      break;

    case 'grooming-returning':
      container.innerHTML = `
        <h3>♻️ לקוחות חוזרים בטיפוח</h3>
        <p>לקוחות שביצעו יותר מפגישת טיפוח אחת</p>
        <table class="report-table">
          <thead>
            <tr>
              <th>#</th><th>ת.ז.</th><th>שם</th><th>טלפון</th><th>אימייל</th><th>סה"כ פגישות</th>
            </tr>
          </thead>
          <tbody id="reportTableBody"></tbody>
        </table>`;
      addExport('grooming-returning.csv');
      fetch('/reports/grooming-returning')
        .then(r => r.json())
        .then(data => {
          const tb = document.getElementById('reportTableBody');
          tb.innerHTML = data.map((c,i) => `
            <tr>
              <td>${i+1}</td>
              <td>${c.customer_id}</td>
              <td>${c.name}</td>
              <td>${c.phone}</td>
              <td>${c.email}</td>
              <td>${c.total_appointments}</td>
            </tr>`).join('');
        })
        .catch(e => { container.innerHTML = '<p>שגיאה בטעינת הדוח.</p>'; console.error(e); });
      break;

    case 'grooming-upcoming':
      container.innerHTML = `
        <h3>🗓 הזמנות טיפוח עתידיות</h3>
        <p>רשימת הזמנות טיפוח החל מהיום והלאה</p>
        <table class="report-table">
          <thead>
            <tr>
              <th>#</th><th>ת.ז.</th><th>שם לקוח</th><th>שם כלב</th><th>שירות</th><th>תאריך</th><th>שעה</th>
            </tr>
          </thead>
          <tbody id="reportTableBody"></tbody>
        </table>`;
      addExport('grooming-upcoming.csv');
      fetch('/reports/grooming-upcoming')
        .then(r => r.json())
        .then(data => {
          const tb = document.getElementById('reportTableBody');
          tb.innerHTML = data.map((row,i) => `
            <tr>
              <td>${i+1}</td>
              <td>${row.customer_id}</td>
              <td>${row.customer_name}</td>
              <td>${row.dog_name}</td>
              <td>${row.service_name}</td>
              <td>${new Date(row.appointment_date).toLocaleDateString('he-IL')}</td>
              <td>${row.slot_time.slice(0,5)}</td>
            </tr>`).join('');
        })
        .catch(e => { container.innerHTML = '<p>שגיאה בטעינת הדוח.</p>'; console.error(e); });
      break;

    case 'products-sold-all':
      container.innerHTML = `
        <h3>📦 כל המוצרים שנמכרו</h3>
        <p>הכמות הכוללת שנמכרה לכל מוצר</p>
        <table class="report-table">
          <thead>
            <tr>
              <th>#</th><th>סריאלי</th><th>שם מוצר</th><th>סה״כ כמות</th>
            </tr>
          </thead>
          <tbody id="reportTableBody"></tbody>
        </table>`;
      addExport('products-sold-all.csv');
      fetch('/reports/products-sold-all')
        .then(r => r.json())
        .then(data => {
          const tb = document.getElementById('reportTableBody');
          tb.innerHTML = data.map((p,i) => `
            <tr>
              <td>${i+1}</td>
              <td>${p.product_id}</td>
              <td>${p.product_name}</td>
              <td>${p.total_sold}</td>
            </tr>`).join('');
        })
        .catch(e => { container.innerHTML = '<p>שגיאה בטעינת הדוח.</p>'; console.error(e); });
      break;

    case 'sales-by-category':
      container.innerHTML = `
        <h3>📋 מכירות לפי קטגוריות</h3>
        <p>סה״כ כמות יחידות שנמכרו בכל קטגוריה</p>
        <table class="report-table">
          <thead>
            <tr>
              <th>#</th><th>מזהה קטגוריה</th><th>שם קטגוריה</th><th>סה״כ שנמכרו</th>
            </tr>
          </thead>
          <tbody id="reportTableBody"></tbody>
        </table>`;
      addExport('sales-by-category.csv');
      fetch('/reports/sales-by-category')
        .then(r => r.json())
        .then(data => {
          const tb = document.getElementById('reportTableBody');
          tb.innerHTML = data.map((c,i) => `
            <tr>
              <td>${i+1}</td>
              <td>${c.category_id}</td>
              <td>${c.category_name}</td>
              <td>${c.total_sold}</td>
            </tr>`).join('');
        })
        .catch(e => { container.innerHTML = '<p>שגיאה בטעינת הדוח.</p>'; console.error(e); });
      break;

    case 'referrals-comparison':
      container.innerHTML = `
        <h3>📊 השוואת הפניות למאלטים / וטרינרים</h3>
        <p>מספר הפניות שהופנו לכל אחד מהגורמים המטפלים</p>
        <table class="report-table">
          <thead>
            <tr>
              <th>#</th><th>סוג יעד</th><th>סה״כ פניות</th>
            </tr>
          </thead>
          <tbody id="reportTableBody"></tbody>
        </table>`;
      addExport('referrals-comparison.csv');
      fetch('/reports/referrals-comparison')
        .then(r => r.json())
        .then(data => {
          const tb = document.getElementById('reportTableBody');
          tb.innerHTML = data.map((row,i) => `
            <tr>
              <td>${i+1}</td>
              <td>${row.destination_type === 'וטרינר' ? 'וטרינר' : 'מקלט'}</td>
              <td>${row.total_referrals}</td>
            </tr>`).join('');
        })
        .catch(e => { container.innerHTML = '<p>שגיאה בטעינת הדוח.</p>'; console.error(e); });
      break;

    case 'transport-counts':
      container.innerHTML = `
        <h3>🚗 הסעות לפי שליח</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>#</th><th>שליח</th><th>טלפון</th><th>סה"כ</th>
            </tr>
          </thead>
          <tbody id="reportTableBody"></tbody>
        </table>`;
      addExport('transport-counts.csv');
      fetch(`/reports/transport-counts?period=${period}`)
        .then(r => r.json())
        .then(data => {
          const tb = document.getElementById('reportTableBody');
          tb.innerHTML = data.map((h,i) => `
            <tr>
              <td>${i+1}</td>
              <td>${h.handler_name}</td>
              <td>${h.phone}</td>
              <td>${h.completed_transports}</td>
            </tr>`).join('');
        });
      break;

    /* you can add any other report‐types here, following the same pattern */

    default:
      container.innerHTML = '<p>דוח לא מוגדר עדיין</p>';
  }
}

// … (any remaining code in Manager.js) …




