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
async function openLowStockModal() {
  try {
    const res   = await fetch('/manager/stats/low-stock/list', { credentials: 'include' });
    const items = await res.json();

    const list = document.getElementById('lowStockModalList');
    list.innerHTML = '';

    /* 👇 כותרת */
    const header = document.createElement('li');
    header.className = 'list-header';
    header.innerHTML = `
  <span class="sku-head">מק״ט</span>
  <span class="prod-head">מוצר</span>
  <span class="qty-head">כמות</span>
    `;
    list.appendChild(header);

    /* 👇 המוצרים */
    items.forEach(p => {
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
      li.querySelector('.prod-id')
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

  // البطاقة البرتقالية
  document.querySelector('.kpi-card.orange')
          .addEventListener('click', openLowStockModal);

  // زر الإغلاق
  document.querySelector('#lowStockModal .close-btn')
          .addEventListener('click', () =>
             document.getElementById('lowStockModal').style.display = 'none'
          );
});

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

document.addEventListener('DOMContentLoaded', () => {
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
  });

  async function loadRevenueChart() {
    try {
      const res = await fetch('/manager/stats/revenue-components-today', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Bad response');

      const { grooming, boarding, store } = await res.json();
      incomeChart.data.datasets[0].data = [grooming, boarding, store];
      incomeChart.update();
    } catch (err) {
      console.error('chart fetch error:', err);
    }
  }

  loadRevenueChart();   // הפעלה ראשונה
});

document.addEventListener('DOMContentLoaded', () => {
  const card      = document.querySelector('.kpi-card.purple');
  const container = document.getElementById('incomeChartContainer');
  const Scontainer = document.getElementById('DailyGroomingServicesChart')
  let hideTimer;                                       // מזהה לטיימר

  if (card && container) {
    
        card.addEventListener('click', () => {
      container.style.display = 'block';
      Scontainer.style.display = 'block';
    });

    /* הצגה מיידית כשעוברים עם העכבר */
    card.addEventListener('mouseenter', () => {
      clearTimeout(hideTimer);                         // מבטל טיימר קודם
      container.style.display = 'block';
            Scontainer.style.display = 'block';

    });

    /* הסתרה – 5 שניות אחרי שהעכבר יוצא */
    card.addEventListener('mouseleave', () => {
      hideTimer = setTimeout(() => {
        container.style.display = 'none';
      }, 5000);                                        // 5000 ms = 5 שניות
    });
  }
});


  async function loadPieChartForServices() {
    try {
      const res = await fetch('/manager/stats/service-counts-today');
      const data = await res.json();

      const labels = ['רחצה וטיפוח מלא', 'תספורת קיץ ', 'ניקוי שיניים '];
      const values = [data.service1, data.service2, data.service3];

      const total = values.reduce((a, b) => a + b, 0);

      const ctx = document.getElementById('GroomingPieChart').getContext('2d');

      new Chart(ctx, {
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
            legend: {
              position: 'bottom'
            },
            datalabels: {
              color: '#000',
              font: {
                weight: 'bold',
                size: 14
              },
              formatter: (value, context) => {
                const percentage = ((value / total) * 100).toFixed(1);
                return `${value} (${percentage}%)`;
              }
            },
            title: {
              display: true,
              text: 'התפלגות תורים לפי שירות'
            }
          }
        },
        plugins: [ChartDataLabels]
      });

    } catch (err) {
      console.error('Error loading pie chart:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', loadPieChartForServices);
