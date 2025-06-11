// public/js/thanks.js  (מודול ES6)
const params   = new URLSearchParams(location.search);
const orderId  = params.get('id');

if (!orderId) {
  document.body.innerHTML = '<h2>מספר הזמנה חסר</h2>';
  throw new Error('Missing order id');
}

try {
  const res   = await fetch(`/orders/${orderId}`, { credentials:'include' });
  if (!res.ok) throw new Error('Failed to fetch order');
  const data  = await res.json();

  // כותרת ומספר
  document.getElementById('orderNumber').textContent = `מס' הזמנה: ${data.id}`;

  // כתובת
  const addr = `${data.street} ${data.house_number}, ${data.city}, ${data.postal_code}`;
  document.getElementById('addressBox').textContent = addr;

  // פריטים
  const tbody = document.querySelector('#itemsTable tbody');
  data.items.forEach(it => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${it.name}</td>
      <td>${it.quantity}</td>
    <td>₪${Number(it.unit_price).toFixed(2)}</td> <!-- Convert to number -->
    <td>₪${(it.quantity * Number(it.unit_price)).toFixed(2)}</td>`
    tbody.appendChild(tr);
  });
  document.getElementById('orderTotal').textContent = `₪${Number(data.total).toFixed(2)}`;  

} catch (err) {
  console.error(err);
  document.body.innerHTML = '<h2>שגיאה בטעינת פרטי ההזמנה</h2>';
}
