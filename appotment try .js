//web.js
async function loadAvailableHours(selectedDate, selectedDuration) {
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
