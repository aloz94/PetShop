//web.js
/*async function loadAvailableHours(selectedDate, selectedDuration) {
    console.log('נכנסתי ל-loadAvailableHours');
    console.log('תאריך שנבחר:', selectedDate);
    console.log('משך שירות:', selectedDuration);

    if (!selectedDate) {
        console.error('שגיאה: לא נבחר תאריך');
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/appointments?date=${selectedDate}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            },
            credentials: 'include' // 🔥 אם את צריכה לשלוח קוקיז
          });
          

        const results = await response.json();
        console.log('תורים קיימים באותו יום:', results);

        if (!Array.isArray(results)) {
            console.error('שגיאה: appointments לא מערך', results);
            return;
          }

          const appointments = results;


        const workingHours = generateWorkingHours();
        console.log('שעות עבודה בסיסיות:', workingHours);
        const availableHours = [];

        workingHours.forEach(hour => {
            const startDateTime = new Date(`${selectedDate}T${hour}:00`);
            const endDateTime = new Date(startDateTime.getTime() + selectedDuration * 60000);
      
            const start = startDateTime.toTimeString().substring(0, 5);
            const end = endDateTime.toTimeString().substring(0, 5);
      
            const overlaps = appointments.some(app =>{
             return !(end <= app.start_time || start >= app.end_time)
        });
      
            if (!overlaps) {
              availableHours.push(hour);
            }
          });

        console.log('שעות זמינות שנמצאו:', availableHours);

        const hourSelect = document.getElementById('hourSelect');
        hourSelect.innerHTML = '<option value="">בחר שעה</option>';

        availableHours.forEach(hour => {
            const option = document.createElement('option');
            option.value = hour;
            option.textContent = hour;
            hourSelect.appendChild(option);
        });

    } catch (error) {
        console.error('שגיאה בטעינת שעות:', error);
    }
}

  function triggerHourLoad() {
    const selectedDate = document.getElementById('appointmentDate').value;
    const serviceSelect = document.getElementById('serviceSelect');
    const selectedOption = serviceSelect.selectedOptions[0];
    console.log('משך מתוך data-duration:', selectedOption?.dataset?.duration);


    if (!selectedDate) {
        console.warn('לא נבחר תאריך');
        return;
      }
    

    if (!selectedOption || !selectedOption.dataset.duration) {
      console.warn('לא נבחר שירות עם משך');
      return;
    }
  
    const selectedDuration = parseInt(selectedOption.dataset.duration);
    loadAvailableHours(selectedDate, selectedDuration);
  }
  
  document.getElementById('appointmentDate').addEventListener('change', () => {
    triggerHourLoad();
  });
  
  document.getElementById('serviceSelect').addEventListener('change', () => {
    triggerHourLoad();
  });


function generateWorkingHours() {
    const hours = [];
    const startHour = 9;
    const endHour = 17;
  
    for (let hour = startHour; hour < endHour; hour++) {
      hours.push(`${hour.toString().padStart(2, '0')}:00`);
      hours.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  
    return hours; // לדוגמה: ['09:00', '09:30', '10:00', ... '16:30']
  }
  
//-------------------------------------------------------------------
//server.js

// ✨ קבלת תור טיפוח חדש
app.post('/grooming-appointments', authenticateToken, async (req, res) => {
    const { appointment_date, start_time, service_id, dog_id, notes } = req.body;

    try {
        // 1. מביאים את זמן השירות מהטבלה services
        const serviceResult = await con.query('SELECT duration FROM services WHERE id = $1', [service_id]);
        if (serviceResult.rows.length === 0) {
            return res.status(400).json({ message: 'שירות לא נמצא' });
        }
        const duration = serviceResult.rows[0].duration; // משך הזמן בדקות

        // 2. חישוב end_time לפי start_time + משך השירות
        const [startHours, startMinutes] = start_time.split(':').map(Number);
        const startDate = new Date(`1970-01-01T${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}:00`);
        const endDate = new Date(startDate.getTime() + duration * 60000);

        const endHours = endDate.getHours().toString().padStart(2, '0');
        const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
        const end_time = `${endHours}:${endMinutes}`;

        // 3. הכנסת ההזמנה למסד הנתונים
        await con.query(`
            INSERT INTO grooming_appointments (dog_id, service_id, appointment_date, start_time, end_time, notes, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        `, [dog_id, service_id, appointment_date, start_time, end_time, notes || '']);

        res.status(200).json({ message: 'התור נקבע בהצלחה!' });
    } catch (error) {
        console.error('Error saving grooming appointment:', error);
        res.status(500).json({ message: 'שגיאה בשמירת התור' });
    }
});

// 🔥 החזרת כל התורים ליום מסוים
app.get('/appointments', authenticateToken, async (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ message: 'חסר פרמטר תאריך' });
    }

    try {
        const result = await con.query(

            `SELECT (start_time, end_time) FROM grooming_appointments WHERE grooming_appointments.appointment_date = $1`,
            [date]

        );
        console.log('appointments result:', result.rows);

      //  res.status(200).json(result.rows || []);
      res.status(200).json(Array.isArray(result.rows) ? result.rows : []);

    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'שגיאה בקבלת תורים' });
    }
});
*/

//calendar.js TRY

document.addEventListener('DOMContentLoaded', async function() {
  const calendarEl = document.getElementById('manager-calendar');

  // 1) Fetch all boarding appointments from your server:
  //    Each appointment has check_in, check_out (ISO dates), plus dog info if needed.
  let events = [];
  try {
    const res = await fetch('http://localhost:3000/manager/appointments', {
      credentials: 'include'
    });
    
    // assuming your server returns: 
    // [{id, dog_id, dog_name, check_in:"2025-05-02", check_out:"2025-05-07"}, …]
    const data = await res.json();

    // 2) Convert each booking into a FullCalendar “event”
    data.forEach(b => {
      events.push({
        id: b.id,
        title: `פנסיון: ${b.dog_name}`,    // show dog’s name
        start: b.check_in,                 // fullcalendar understands ISO YYYY-MM-DD
        end: moment(b.check_out).add(1,'days').format('YYYY-MM-DD'), 
          /* FullCalendar’s end date is exclusive, so add 1 day */
        allDay: true,
        backgroundColor: '#e74c3c',        // red for busy
        borderColor: '#c0392b'
      });
    });
  }
  catch(err) {
    console.error('Error loading bookings:', err);
  }

  // 3) Instantiate the calendar
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'he',                       // Hebrew locale (RTL)
    firstDay: 0,                        // Sunday = 0
    height: 'auto',
    headerToolbar: {
      left:   'prev,next today',
      center: 'title',
      right:  'dayGridMonth,listWeek'
    },
    events,                             // the array we built
    eventDidMount: function(info) {
      // optional: add a tooltip with the booking details
      const tooltipText = `${info.event.title}\nמ־${moment(info.event.start).format('DD/MM/YYYY')} עד־${moment(info.event.end).subtract(1,'days').format('DD/MM/YYYY')}`;
      info.el.setAttribute('title', tooltipText);
    },
    dateClick: function(info) {
      // optional: click on a day shows availability or create new booking
      if (info.dayEl.classList.contains('fc-day-disabled')) return;
      alert(`לחצת על תאריך ${moment(info.date).format('DD/MM/YYYY')}`);
    },
    dayCellDidMount: function(arg) {
      // color all free days green
      if (!arg.el.classList.contains('fc-day-disabled')) {
        if (!arg.el.querySelector('.fc-daygrid-day-events').children.length) {
          arg.el.style.backgroundColor = '#e9f8f1';
        }
      }
    }
  });

  calendar.render();
});

document.addEventListener('DOMContentLoaded', async function() {
  const calendarEl = document.getElementById('manager-calendar');

  let events = [];
  try {
    // 1) Fetch combined appointments
    const res = await fetch('http://localhost:3000/manager/appointments', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Network response was not OK');

    const data = await res.json();
    // data = [
    //   { start_date:"2025-05-02", end_date:"2025-05-07", type:"boarding", dog_name:"Dog3" },
    //   { start_date:"2025-05-15", start_time:"11:30", type:"grooming", dog_name:"Ausky", service_name:"…"},
    //   …
    // ]

    // 2) Convert each booking into a FullCalendar event
    data.forEach(b => {
      if (b.type === 'boarding') {
        events.push({
          title: `פנסיון: ${b.dog_name}`,
          start: b.start_date,
          end:   moment(b.end_date).add(1,'days').format('YYYY-MM-DD'),
          allDay: true,
          backgroundColor: '#c0392b'
        });
      } else {
        // for grooming, we’ll treat it as a single-day event (all day),
        // or you can set start_time/end_time if you prefer timeGrid view
        events.push({
          title: `טיפוח: ${b.dog_name}`,
          start: b.start_date,
          allDay: true,
          backgroundColor: '#2980b9'
        });
      }
    });
  }
  catch(err) {
    console.error('Error loading bookings:', err);
  }

  // 3) Render FullCalendar
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'he',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,listWeek'
    },
    events,
    dateClick(info) {
      alert(`You clicked on ${moment(info.date).format('DD/MM/YYYY')}`);
    }
  });

  calendar.render();
});
