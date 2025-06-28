console.log("Backend server is running ");    
const express = require('express');
const cors = require('cors'); // Import the cors package
const cookieParser = require('cookie-parser');
const path = require('path');
const {Client} = require('pg');
const multer = require('multer');



//log in 
//const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'MyProjectJWT!2025_Secret_Key!';


const app=express();
//app.use(cors()); // Enable CORS for all routes

app.use(cors({
    origin: 'http://localhost:3000', // Replace with your client URL
    credentials: true // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const con=new Client({
    host:'localhost',
    user:'postgres',
    port:5432 ,
    password:'aloz2053919',
    database:'joy_db'
});

con.connect().then(()=> console.log("connected"))

// ─── helper: find a free cell, robust against inverted dates ───
async function findFreeCell(startDate, endDate) {
  const sql = `
    WITH all_cells AS (
      SELECT generate_series(1,10) AS cell_number
    ), occupied AS (
      SELECT cell_number
      FROM boarding_appointments
      WHERE tsrange(
              LEAST(check_in,   check_out),
              GREATEST(check_in,check_out),
              '[]'
            )
        && tsrange(
              LEAST($1::timestamp, $2::timestamp),
              GREATEST($1::timestamp, $2::timestamp),
              '[]'
            )
    )
    SELECT cell_number
    FROM all_cells
    WHERE cell_number NOT IN (SELECT cell_number FROM occupied)
    ORDER BY cell_number
    LIMIT 1;
  `;
  const { rows } = await con.query(sql, [startDate, endDate]);
  return rows[0]?.cell_number || null;
}

// right after your other app.use()/middleware
const BOARDING_CAPACITY = 10;   // ← adjust to your real kennel capacity

app.get('/boarding-appointments/availability', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ error: 'Missing start or end date' });
  }
  
  try {
    // for each date d from start to (end - 1), count how many appointments cover d
    const sql = `
      SELECT d::date AS day,
             COUNT(a.id) AS booked
      FROM generate_series(
             $1::date,
             ($2::date - INTERVAL '1 day'),
             INTERVAL '1 day'
           ) AS d
      LEFT JOIN boarding_appointments a
        ON a.check_in  <= d
       AND a.check_out >  d
      GROUP BY d
      HAVING COUNT(a.id) >= $3
    `;
    const { rows } = await con.query(sql, [start, end, BOARDING_CAPACITY]);
    
    // if any row comes back, that day is full ⇒ not available
    const available = rows.length === 0;
    res.json({ available });
  }
  catch (err) {
    console.error('Availability-check failed:', err);
    res.status(500).json({ error: err.message });
  }
});

//-----------------------regester route----------------------------------------
app.post('/postData',(req,res)=>{
    const {id,first_name,last_name ,phone , address , email ,password ,name , breed , age,size,gender  }=req.body;
    console.log("Data received from client:", req.body);

    const cinsert_query='insert into customers (id,first_name,last_name,phone,email, address,password) values ($1,$2,$3,$4,$5,$6,$7)';
    const dinsert_query='insert into dogs ( name,breed, age,gender,customer_id,size) values ($1,$2,$3,$4,$5,$6)';
   

    con.query(cinsert_query,[id,first_name,last_name,phone,email,address,password],(err,result)=>{
        if(err){
            console.log(err);
           // res.send("Error inserting customer data");
        }else{
            console.log(result);
           // res.send("customer Data inserted successfully");
        }
    });
    console.log("customer data is inserted")
    
    con.query(dinsert_query,[name , breed , age,size,id,gender],(err,result)=>{
        if(err){
            console.log(err);
           // res.send("Error inserting dog data");
        }else{
            console.log(result);
           console.log("dog data is inserted");
           res.send("Customer and Dog data inserted successfully");

            //res.send("Dog Data inserted successfully");
        }
    });
    console.log("dog data is inserted")
   //res.send("Customer and Dog data inserted successfully");


    
})

//-----------------------login route----------------------------------------
app.post('/login', (logreq, logres) => {
  const { id, password } = logreq.body;

  // 1. מנסים קודם ב־customers
  const customerQuery = `
    SELECT id, first_name || ' ' || last_name AS name, password
    FROM customers
    WHERE id = $1
  `;
  con.query(customerQuery, [id], (err, custResult) => {
    if (err) {
      console.error('Database error (customers):', err);
      return logres.status(500).json({ message: 'Database error' });
    }

    if (custResult.rows.length > 0) {
      // לקוח נמצא
      const user = custResult.rows[0];
      if (password !== user.password) {
        return logres.status(401).json({ message: 'Invalid credentials' });
      }
      // מייצרים טוקן עם role=customer
      const token = jwt.sign(
        { userId: user.id, name: user.name, role: 'customer' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      logres.cookie('token', token, {
        httpOnly: true,
        secure: false,
        maxAge: 60 * 60 * 1000
      });
      return logres
        .status(200)
        .json({ message: 'Login successful', role: 'customer' });
    }

    // 2. אם לא ב־customers – מנסים בטבלת employees
    const employeeQuery = `
      SELECT id, password, role, full_name AS name
      FROM employees
      WHERE id = $1 
    `;
    con.query(employeeQuery, [id], (err2, empResult) => {
      if (err2) {
        console.error('Database error (employees):', err2);
        return logres.status(500).json({ message: 'Database error' });
      }

      if (empResult.rows.length > 0) {
        // עובד נמצא
        const user = empResult.rows[0];
        if (password !== user.password) {
          return logres.status(401).json({ message: 'Invalid credentials' });
        }
        // מייצרים טוקן עם role לפי שדה ה־employees.role
const token = jwt.sign(
  { userId: user.id, role: user.role , name: user.name },
  JWT_SECRET,
  { expiresIn: '1h' }
);
      logres.cookie('token', token, {
        httpOnly: true,
        secure: false,
        maxAge: 60 * 60 * 1000
      });
      return logres
        .status(200)
        .json({ message: 'Login successful', role: user.role , name: user.name });
      }

      // 3. אם לא ב־employees – מנסים בטבלת handlers
      const handlerQuery = `
        SELECT id, password
        FROM handlers
        WHERE id = $1
      `;
      con.query(handlerQuery, [id], (err3, handlerResult) => {
        if (err3) {
          console.error('Database error (handlers):', err3);
          return logres.status(500).json({ message: 'Database error' });
        }

        if (handlerResult.rows.length > 0) {
          // handler נמצא
          const user = handlerResult.rows[0];
          if (password !== user.password) {
            return logres.status(401).json({ message: 'Invalid credentials' });
          }
          // מייצרים טוקן עם role=handler
          const token = jwt.sign(
            { userId: user.id, role: 'handler' },
            JWT_SECRET,
            { expiresIn: '1h' }
          );
          logres.cookie('token', token, {
            httpOnly: true,
            secure: false,
            maxAge: 60 * 60 * 1000
          });
          return logres
            .status(200)
            .json({ message: 'Login successful', role: 'handler' });
        }

        // 4. לא נמצא בשום טבלה
        return logres.status(400).json({ message: 'User not found' });
      });
    });
  });
});
                        

// -------------- פונקציה לאימות טוקן---------------------

function authenticateToken(req, res, next) {
    let token;

    // קודם לבדוק אם יש Authorization Header
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.cookies.token) {
        //  אם אין Authorization - לבדוק בקוקי!
        token = req.cookies.token;
    }

    if (!token) {
              console.log('No token provided');

        return res.sendStatus(401); // אין טוקן בכלל
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // טוקן לא תקין
        req.user = user;
        next();
    });
}

//-------------------- מסלול לפרופיל--------------------
app.get('/profile', authenticateToken, (req, res) => {
    console.log('Authenticated user:', req.user);
    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    res.json({ user: req.user, username: req.user.name });
});

// ------------------ מסלול ליציאה-------------------
app.post('/logout', (req, res) => {
    res.clearCookie('token'); // 🔥 clear the token cookie
    res.status(200).json({ message: 'Logout successful' });
  });
  
// ------------------ מסלול לקבלת כל השירותים-------------------
  app.get('/services', async (req, res) => {
    try {
        const result = await con.query('SELECT * FROM services');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching services:', err);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// ----------------קבלת כלבים של לקוח---------------
app.get('/my-dogs', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    // נוסיף גם breed, size, gender
    const result = await con.query(
      `SELECT id,
              name,
              breed,
              age,
              size,
              gender
       FROM dogs
       WHERE customer_id = $1`,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching dogs:', error);
    res.status(500).json({ message: 'שגיאה בקבלת כלבים' });
  }
});
// ------------------ מסלול להוספת כלב-------------------
app.post('/add-dog', authenticateToken, async (req, res) => {
  const customer_id = req.user.userId;
  const { name, breed, age, size, gender } = req.body;

  // בודקים שהערכים באמת הגיעו
  if (!name || !breed || !age || !size || !gender) {
    return res.status(400).json({ message: 'שדות חובה חסרים' });
  }

  try {
    const insertQuery = `
      INSERT INTO dogs (name, breed, age, size, gender, customer_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `;
    const values = [name, breed, age, size, gender, customer_id];
    const result = await con.query(insertQuery, values);

    res.status(201).json({
      message: 'כלב נוסף בהצלחה',
      dogId: result.rows[0].id
    });
  } catch (err) {
    console.error('שגיאה בשרת בהוספת כלב:', err);
    res.status(500).json({ message: 'שגיאה בהוספת כלב' });
  }
});
// GET /api/customers/me/grooming/next
app.get('/api/customers/me/grooming/next', authenticateToken, async (req, res) => {
  const customerId = req.user.userId;          // ← use userId
  try {
    const { rows } = await con.query(`
      SELECT
        ga.id,
        ga.appointment_date   AS date,
        ga.slot_time          AS time,
        s.name                AS service_type,
        d.name                AS dog_name,
        ga.status
      FROM grooming_appointments ga
      LEFT JOIN services s ON ga.service_id = s.id
      LEFT JOIN dogs     d ON ga.dog_id     = d.id
      WHERE ga.customer_id = $1
        AND ga.appointment_date >= CURRENT_DATE
      ORDER BY ga.appointment_date, ga.slot_time
      LIMIT 1
    `, [customerId]);

    return res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/customers/me/abandoned-reports
app.get('/api/customers/me/abandoned-reports', authenticateToken, async (req, res) => {
  const customerId = req.user.userId;  // use userId from your JWT
  try {
    const { rows } = await con.query(
      `
SELECT
  adr.id,
  adr.report_date         AS report_date,
  adr.status              AS status,

  -- handler info
  adr.handler_id          AS handler_id,
  h.name                  AS handler_name,

  -- care-provider info
  adr.care_provider       AS care_provider_id,
  cp.name                 AS care_provider_name,

  adr.dog_size            AS dog_size,
  adr.health_status       AS health_status,
  adr.address             AS address,
  adr.notes               AS notes,
  adr.image_path          AS image_path,
  adr.status_updated_at   AS status_updated_at
FROM abandoned_dog_reports adr
LEFT JOIN handlers h
  ON adr.handler_id = h.id
LEFT JOIN care_provider cp
  ON adr.care_provider = cp.id
WHERE adr.customer_id = $1
ORDER BY adr.report_date DESC
LIMIT 1;
      `,
      [customerId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching abandoned reports:', err);
    res.status(500).json({ error: err.message });
  }
});


// ------------------ מסלול להוספת תור לטיפוח-------------------?????
app.get('/appointments', authenticateToken, async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'חסר תאריך' });
  
    try {
      const query = `
        SELECT 
          ga.slot_time,
          ga.service_id,
          s.duration
        FROM grooming_appointments ga
        JOIN services s ON ga.service_id = s.id
        WHERE ga.appointment_date = $1
      `;
  
      const result = await con.query(query, [date]);
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('שגיאה בקבלת תורים:', err);
      res.status(500).json({ message: 'שגיאה בקבלת תורים' });
    }
  });
  // ------------------ מסלול להוספת תור לטיפוח-------------------
  app.post('/grooming-appointments', authenticateToken, async (req, res) => {
    const { appointment_date, slot_time, service_id, dog_id, notes } = req.body;

      // If the user is an employee and customer_id is provided, use it. Otherwise, use the logged-in user's id.
    const realCustomerId = (req.user.role === 'employee' && customer_id) ? customer_id : req.user.userId;
  
    try {
      await con.query(
      `INSERT INTO grooming_appointments (appointment_date, slot_time, service_id, dog_id, customer_id, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'scheduled')`,
        [appointment_date, slot_time, service_id, dog_id, realCustomerId, notes]
      );
  
      res.status(200).json({ message: 'התור נשמר בהצלחה!' });
    } catch (err) {
      console.error('שגיאה בהוספת תור:', err);
      res.status(500).json({ message: 'שגיאה בשמירת התור' });
    }
  });

//dashboard grooming appointments
/*app.post('/ADDgrooming-appointments', authenticateToken, async (req, res) => {
  const { appointment_date, slot_time, service_id, dog_id, notes, customer_id } = req.body;
  const realCustomerId = (req.user.role === 'employee' && customer_id) ? customer_id : req.user.userId;

  try {
    await con.query(
      `INSERT INTO grooming_appointments (appointment_date, slot_time, service_id, dog_id, customer_id, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'scheduled')`,
      [appointment_date, slot_time, service_id, dog_id, realCustomerId, notes]
    );
    res.status(200).json({ message: 'התור נשמר בהצלחה!' });
  } catch (err) {
    console.error('שגיאה בהוספת תור:', err);
    res.status(500).json({ message: 'שגיאה בשמירת התור' });
  }
});*/

// new route for adding grooming from dashboard 
app.post(
  '/addgrooming-appointments',
  authenticateToken,  // if you want to require a logged-in user to create an appointment
  async (req, res) => {
    const {
      customerId,
      appointment_date,
      slot_time,
      service_id,
      dog_id,
      notes
    } = req.body;

    // 1) Basic validation: all required fields must be present
    if (
      !customerId ||
      !appointment_date ||
      !slot_time ||
      !service_id ||
      !dog_id
    ) {
      return res
        .status(400)
        .json({ message: 'Missing one of: customerId, date, time, service_id, or dog_id' });
    }

    try {
      // 2) (Optional) Verify that the given customer actually exists
      const customerCheck = await con.query(
        `SELECT 1 FROM customers WHERE id = $1`,
        [customerId]
      );
      if (customerCheck.rowCount === 0) {
        return res
          .status(400)
          .json({ message: `Customer ID ${customerId} does not exist` });
      }

      // 3) (Optional) Verify that the given service exists
      const serviceCheck = await con.query(
        `SELECT 1 FROM services WHERE id = $1`,
        [service_id]
      );
      if (serviceCheck.rowCount === 0) {
        return res
          .status(400)
          .json({ message: `Service ID ${service_id} does not exist` });
      }

      // 4) (Optional) Verify that the given dog exists
      const dogCheck = await con.query(
        `SELECT 1 FROM dogs WHERE id = $1`,
        [dog_id]
      );
      if (dogCheck.rowCount === 0) {
        return res
          .status(400)
          .json({ message: `Dog ID ${dog_id} does not exist` });
      }

      // 5) Now insert the new appointment
      //    We’ll set “status” to 'scheduled' by default, and status_updated_at to NOW()
      const insertQuery = `
  INSERT INTO grooming_appointments
    (customer_id, appointment_date, slot_time, service_id, dog_id, notes, status, status_updated_at)
  VALUES
    ($1, $2, $3, $4, $5, $6, 'scheduled', NOW())
  RETURNING *
`;

      const { rows } = await con.query(insertQuery, [
        customerId,
        appointment_date,
        slot_time,
        service_id,
        dog_id,
        notes || '' // notes can be empty string if none provided
      ]);

      // 6) Return the newly‐created row’s data as JSON, with HTTP 201
      return res.status(201).json(rows[0]);
    } catch (err) {
      console.error('Error inserting grooming appointment:', err);
      return res
        .status(500)
        .json({ message: 'שגיאה ביצירת תור פנסיון' });
    }
  }
);


  // 3) UPDATE one grooming appointment
app.put('/grooming-appointments/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  const {
    appointment_date,
    slot_time,
    service_id,
    dog_id,
    notes
  } = req.body;

  try {
    const result = await con.query(
      `UPDATE grooming_appointments
         SET appointment_date = $1,
             slot_time        = $2,
             service_id       = $3,
             dog_id           = $4,
             notes            = $5
       WHERE id = $6
       RETURNING *`,
      [appointment_date, slot_time, service_id, dog_id, notes, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'תור לא נמצא' });
    }
    res.json({ message: 'התור עודכן בהצלחה', appointment: result.rows[0] });
  } catch (err) {
    console.error('Error updating grooming appointment:', err);
    res.status(500).json({ message: 'שגיאה בעדכון התור' });
  }
});



// הגדרת מיקום שמירת קבצים
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // ודאי שיש תיקייה בשם uploads
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const safeName = baseName.replace(/[^\w\-]/g, ''); // מסיר תווים בעייתיים כולל עברית
    const uniqueName = Date.now() + '-' + safeName + ext;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// מסלול לדיווח על כלב נטוש
app.post('/report-dog', authenticateToken, upload.single('image'), async (req, res) => {
    const { size, health, address, notes } = req.body;
    const customer_id = req.user.userId;
    const image_path = req.file ? req.file.filename : null;
     const status = 'open'; // Set status to 'open'

    try {
      await con.query(
        `INSERT INTO abandoned_dog_reports (customer_id, dog_size, health_status, address, notes, image_path, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [customer_id, size, health, address, notes, image_path, status]
      );
  
      res.status(200).json({ message: 'הפנייה התקבלה בהצלחה!' });
    } catch (err) {
      console.error('שגיאה בשליחת פנייה:', err);
      res.status(500).json({ message: 'שגיאה בשמירת הפנייה' });
    }
    
  });
    
  //
  app.get('/boarding-availability', authenticateToken, async (req, res) => {
    const { start_date, end_date } = req.query;
    if (!start_date || !end_date) {
      return res.status(400).json({ message: 'יש לספק תאריכי התחלה וסיום' });
    }
  
    try {
      const query = `
        SELECT check_in AS appointment_date, COUNT(*) as count
        FROM boarding_appointments
        WHERE check_in BETWEEN $1 AND $2
        GROUP BY check_in


      `;
      const result = await con.query(query, [start_date, end_date]);
  
      const unavailableDates = result.rows
        .filter(row => parseInt(row.count) >= 10)
        .map(row => row.appointment_date);
  
      if (unavailableDates.length > 0) {
        res.status(200).json({ available: false, unavailableDates });
      } else {
        res.status(200).json({ available: true });
      }
    } catch (err) {
      console.error('שגיאה בבדיקת זמינות:', err);
      res.status(500).json({ message: 'שגיאה בבדיקת זמינות' });
    }
  });

// -------------מסלול להוספת תור לפנסיון-----------
  app.post('/boarding-appointments', authenticateToken, async (req, res) => {
  // Destructure incoming fields, including optional customer_id
  const {
    check_in,
    check_out,
    dog_id,
    notes,
    customer_id: bodyCustomerId
  } = req.body;

  // If the client supplied a valid customer_id, use it; otherwise use the logged-in user
  const realCustomerId = 
    (bodyCustomerId && !isNaN(Number(bodyCustomerId)))
      ? Number(bodyCustomerId)
      : req.user.userId;

  try {
    // 1) Capacity check: no more than 10 overlapping bookings
    const capRes = await con.query(
      `SELECT COUNT(*) AS cnt
         FROM boarding_appointments
        WHERE ($1, $2) OVERLAPS (check_in, check_out)`,
      [check_in, check_out]
    );
    if (parseInt(capRes.rows[0].cnt, 10) >= 10) {
      return res
        .status(400)
        .json({ message: 'אין מקום פנוי בפנסיון בתאריכים שנבחרו' });
    }

      if (new Date(check_in) > new Date(check_out)) {
    return res
      .status(400)
      .json({ message: 'תאריך התחלה חייב להיות לפני תאריך סיום.' });
  }

  // 2) pick a free cell
  let cell;
  try {
    cell = await findFreeCell(check_in, check_out);
  } catch (err) {
    console.error('findFreeCell error', err);
    return res.status(500).json({ message: 'שגיאה בבדיקת תאים פנויים' });
  }
  if (!cell) {
    return res
      .status(409)
      .json({ message: 'אין תאים פנויים לטווח התאריכים שבחרת' });
  }

  // 3) insert including the assigned cell_number
  const insertRes = await con.query(
    `INSERT INTO boarding_appointments
       (customer_id, dog_id, check_in, check_out, notes, status, cell_number)
     VALUES ($1, $2, $3, $4, $5, 'pending', $6)
     RETURNING *`,
    [realCustomerId, dog_id, check_in, check_out, notes, cell]
  );

    // 3) Return the newly created booking
    res.status(201).json({
      message: 'התור נשמר בהצלחה!',
      booking: insertRes.rows[0]
    });

  } catch (err) {
    console.error('Error saving boarding appointment:', err);
    res.status(500).json({ message: 'שגיאה בשמירת התור' });
  }
});

/**
 * GET /api/boarding-cells/status?date=YYYY-MM-DD
 * Returns for each cell 1–10:
 *   - available: true
 *   - if booked: available: false and the appointment ID
 */
app.get('/api/boarding-cells/status', authenticateToken, async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Missing date query parameter' });
  }

  try {
    // 1) find any overlapping appointment per cell
const sql = `
WITH cells AS (
  SELECT generate_series(1,10) AS cell_number
), bookings AS (
  SELECT
    cell_number,
    id             AS appointment_id,
    dog_id,
    customer_id,
    check_in,
    check_out
  FROM boarding_appointments
  WHERE
    status <> 'cancelled'                          -- ← skip cancelled
    AND tsrange(
      check_in,
      check_out + INTERVAL '1 day',
      '[)'
    )
    &&
    tsrange(
      $1::date,
      ($1::date + INTERVAL '1 day'),
      '[)'
    )
)
SELECT
  c.cell_number,
  b.appointment_id,
  b.check_in,
  b.check_out,
  d.name               AS dog_name,
  (cu.first_name || ' ' || cu.last_name) AS customer_name,
  cu.phone             AS customer_phone
FROM cells c
LEFT JOIN bookings b
  ON c.cell_number = b.cell_number
LEFT JOIN dogs d
  ON d.id = b.dog_id
LEFT JOIN customers cu
  ON cu.id = b.customer_id
ORDER BY c.cell_number;

`;
    
    const { rows } = await con.query(sql, [date]);
    // Map to our desired shape
const status = rows.map(r => ({
  cell_number:    r.cell_number,
  available:      r.appointment_id == null,
  appointmentId: r.appointment_id,
  dog_name:       r.dog_name,
  check_in:       r.check_in,
  check_out:      r.check_out,
  customer_name:  r.customer_name,
  customer_phone: r.customer_phone
}));
res.json(status);

  } catch (err) {
    console.error('Error fetching cell status', err);
    res.status(500).json({ error: 'Server error fetching cell status' });
  }
});

app.get('/api/boarding-appointments/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const sql = `
SELECT
  a.*,
  d.name  AS dog_name,
  (cu.first_name || ' ' || cu.last_name) AS customer_name,
  cu.phone AS customer_phone
FROM boarding_appointments a
JOIN dogs d
  ON d.id = a.dog_id
JOIN customers cu
  ON cu.id = a.customer_id
WHERE a.id = $1;
  `;
  const { rows } = await con.query(sql, [id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});


app.get('/manager/boarding/checkins-today', async (req, res) => {
  try {
    const result = await con.query(`
SELECT 
  ba.id, 
  d.name AS dog_name, 
  ba.check_in, 
  ba.status,
  c.first_name || ' ' || c.last_name AS customer_name,
  c.phone
FROM boarding_appointments ba
JOIN dogs d ON ba.dog_id = d.id
JOIN customers c ON d.customer_id = c.id
WHERE DATE(ba.check_in) = CURRENT_DATE
  AND ba.status = 'pending';
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/manager/boarding/checkouts-today', async (req, res) => {
  try {
    const result = await con.query(`
SELECT 
  ba.id, 
  d.name AS dog_name, 
  ba.check_out, 
  ba.status,
  c.first_name || ' ' || c.last_name AS customer_name,
  c.phone
FROM boarding_appointments ba
JOIN dogs d ON ba.dog_id = d.id
JOIN customers c ON d.customer_id = c.id
WHERE DATE(ba.check_out) = CURRENT_DATE
  AND ba.status = 'inprogress';
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/manager/boarding/cancelled-today', async (req, res) => {
  try {
    const result = await con.query(`
SELECT 
  ga.id,
  d.name AS dog_name,
  c.phone,
  c.first_name || ' ' || c.last_name AS customer_name,
  ga.check_in

FROM boarding_appointments ga
JOIN dogs d ON ga.dog_id = d.id
JOIN customers c ON d.customer_id = c.id
WHERE DATE(ga.status_updated_at) = CURRENT_DATE
  AND ga.status = 'cancelled'
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


// ------------------ מסלול לקבלת פרטי פרופיל-------------------
app.get('/profile/details', authenticateToken, async (req, res) => {
  try {
    // req.user.userId was set by authenticateToken
    const userId = req.user.userId;
    const result = await con.query(
      `SELECT id, first_name || ' ' || last_name AS name, email, phone, address
       FROM customers
       WHERE id = $1`,
      [userId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
 
  
// UPDATE dog details
app.put('/dogs/:id', authenticateToken, async (req, res) => {
  const dogId = req.params.id;
  const { name, breed, age, size, gender } = req.body;

  if (!name || !breed || !age || !size || !gender) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const result = await con.query(
      `UPDATE dogs
         SET name = $1,
             breed = $2,
             age = $3,
             size = $4,
             gender = $5
       WHERE id = $6
       RETURNING *`,
      [name, breed, age, size, gender, dogId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    res.json({ message: 'Dog updated', dog: result.rows[0] });
  } catch (err) {
    console.error('Error updating dog:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE dog + cascade manually
app.delete('/dogs/:id', authenticateToken, async (req, res) => {
  const dogId = req.params.id;
  try {
    // 1. מחיקת כל תורים לטיפוח שלו
    await con.query('DELETE FROM grooming_appointments WHERE dog_id = $1', [dogId]);
    await con.query('DELETE FROM boarding_appointments WHERE dog_id = $1', [dogId]);


    // 2. (אם יש טבלאות נוספות עם foreign key, גם אותן יש למחוק כאן)

    // 3. מחיקת הכלב
    const result = await con.query(
      'DELETE FROM dogs WHERE id = $1 RETURNING *',
      [dogId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Dog not found' });
    }
    res.json({ message: 'Dog and its appointments deleted', dog: result.rows[0] });
  } catch (err) {
    console.error('Error deleting dog:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET תורי טיפוח מתוך פרופיל המשתמש
app.get('/profile/grooming', authenticateToken, async (req, res) => {
  const customerId = req.user.userId;

  try {
    const query = `
      SELECT 
        ga.id,
        d.name           AS dog_name,
        s.name           AS service_name,
        ga.appointment_date,
        ga.slot_time
      FROM grooming_appointments ga
      JOIN dogs    d ON ga.dog_id     = d.id
      JOIN services s ON ga.service_id = s.id
      WHERE ga.customer_id = $1
      AND ga.status <> 'cancelled'  -- exclude cancelled appointments
      AND ga.appointment_date < CURRENT_DATE  -- only past appointments
      ORDER BY ga.appointment_date, ga.slot_time;
    `;
    const { rows } = await con.query(query, [customerId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching grooming appointments:', err);
    res.status(500).json({ message: 'שגיאה בשליפת תורי טיפוח' });
  }
});

app.get('/profile/Upcoming/grooming', authenticateToken, async (req, res) => {
  const customerId = req.user.userId;

  try {
    const query = `
      SELECT 
        ga.id,
        d.name           AS dog_name,
        s.name           AS service_name,
        ga.appointment_date,
        ga.slot_time
      FROM grooming_appointments ga
      JOIN dogs    d ON ga.dog_id     = d.id
      JOIN services s ON ga.service_id = s.id
      WHERE ga.customer_id = $1
      AND ga.status <> 'cancelled'  -- exclude cancelled appointments
      AND ga.appointment_date >= CURRENT_DATE  -- only Upcoming appointments
      ORDER BY ga.appointment_date, ga.slot_time;
    `;
    const { rows } = await con.query(query, [customerId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching grooming appointments:', err);
    res.status(500).json({ message: 'שגיאה בשליפת תורי טיפוח' });
  }
});


// GET boarding appointments for current user
app.get('/profile/boarding', authenticateToken, async (req, res) => {
  const customerId = req.user.userId;
  try {
    const query = `
      SELECT
        ba.id,
        d.name       AS dog_name,
        ba.check_in  AS check_in,
        ba.check_out AS check_out
      FROM boarding_appointments ba
      JOIN dogs d ON ba.dog_id = d.id
      WHERE ba.customer_id = $1
      AND ba.status <> 'cancelled'  -- exclude cancelled appointments
      AND ba.check_in < CURRENT_DATE  -- only past appointments
      ORDER BY ba.check_in;
    `;
    const result = await con.query(query, [customerId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching boarding appointments:', err);
    res.status(500).json({ message: 'שגיאה בשליפת תורי פנסיון' });
  }
});

app.get('/profile/Upcoming/boarding', authenticateToken, async (req, res) => {
  const customerId = req.user.userId;
  try {
    const query = `
      SELECT
        ba.id,
        d.name       AS dog_name,
        ba.check_in  AS check_in,
        ba.check_out AS check_out
      FROM boarding_appointments ba
      JOIN dogs d ON ba.dog_id = d.id
      WHERE ba.customer_id = $1
      AND ba.status <> 'cancelled'  -- exclude cancelled appointments
      AND ba.check_in >= CURRENT_DATE  -- only Upcoming appointments
      ORDER BY ba.check_in;
    `;
    const result = await con.query(query, [customerId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching boarding appointments:', err);
    res.status(500).json({ message: 'שגיאה בשליפת תורי פנסיון' });
  }
});

// GET abandent dog reports for current user
app.get('/profile/reports', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const query = `
      SELECT 
  r.id,
  r.dog_size,
  r.health_status,
  r.address,
  r.notes,
  r.status,
  r.image_path,
  r.care_provider       AS care_provider_id,
  cp.name               AS care_provider_name,
  r.handler_id          AS handler_id,
  h.name                AS handler_name
FROM abandoned_dog_reports r
LEFT JOIN care_provider cp
  ON r.care_provider = cp.id
LEFT JOIN handlers h
  ON r.handler_id = h.id
WHERE r.customer_id = $1
ORDER BY r.id DESC;

    `;
    const { rows } = await con.query(query, [userId]);
    // console.log(rows);  // DEBUG: בדוק שהשורות מגיעות עם כל השדות
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching reports:', err);
    return res.status(500).json({ message: 'שגיאה בשליפת דיווחים' });
  }
});

// 1) list all boardings
app.get('/boardings', async (req, res) => {
  try {
    const q = `
      SELECT 
        ba.id,
        to_char(ba.check_in,  'YYYY-MM-DD') AS check_in,
        to_char(ba.check_out, 'YYYY-MM-DD') AS check_out,
        ba.status                          AS status,

        c.id                                AS customer_id,
        d.id                                AS dog_id,            -- <–– הוספנו כאן

        c.first_name || ' ' || c.last_name   AS customer_name,
        c.phone                              AS phone,
        d.name                               AS dog_name
      FROM boarding_appointments ba
      JOIN customers c ON ba.customer_id = c.id
      JOIN dogs      d ON ba.dog_id      = d.id
      ORDER BY ba.check_in;
    `;
    const result = await con.query(q);
    res.json(result.rows);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'DB error fetching boardings' });
  }
});

// 2)  change a single booking’s status
app.put( '/boarding-appointments/:id/status',
  authenticateToken,
  async (req, res) => {
    const { id }     = req.params;
    const { status } = req.body;
    try {
      const upd = await con.query(
        `UPDATE boarding_appointments
           SET status = $1,
               status_updated_at = NOW()   -- Add this line to update the timestamp
         WHERE id = $2
         RETURNING *`,
        [status, id]
      );
      if (upd.rowCount === 0) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      res.json(upd.rows[0]);
    } catch (err) {
      console.error('Error updating boarding status:', err);
      res.status(500).json({ message: 'שגיאה בעדכון סטטוס' });
    }
  }
);



// אחרי ה־POST ל־boarding-appointments, הוסף:
app.put('/boarding-appointments/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  const { check_in, check_out, dog_id, notes } = req.body;
  try {
    const result = await con.query(
      `UPDATE boarding_appointments
         SET check_in  = $1,
             check_out = $2,
             dog_id    = $3,
             notes     = $4
       WHERE id = $5`,
      [check_in, check_out, dog_id, notes, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment updated' });
  } catch (err) {
    console.error('Error updating boarding appointment:', err);
    res.status(500).json({ message: 'שגיאה בעדכון התור' });
  }
});


// 3) your boarding stats route
app.get('/boarding/stats', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const date  = req.query.date || today;

    const inRes  = await con.query(
      `SELECT COUNT(*) AS cnt FROM boarding_appointments WHERE check_in = $1`,
      [date]
    );
    const outRes = await con.query(
      `SELECT COUNT(*) AS cnt FROM boarding_appointments WHERE check_out = $1`,
      [date]
    );
    const cancelRes = await con.query(
      `SELECT COUNT(*) AS cnt
         FROM boarding_appointments
        WHERE status = 'cancelled'
          AND DATE(status_updated_at) = $1`,   // or whatever date field makes sense
      [date]
    );


    res.json({
      date,
      checkins:  parseInt(inRes.rows[0].cnt, 10),
      checkouts: parseInt(outRes.rows[0].cnt, 10),
      cancelled:  parseInt(cancelRes.rows[0].cnt, 10)

    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching boarding stats' });
  }
});


// מטפל בבקשה להחזרת תורים לטיפוח
/*app.get('/grooming/appointments', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT
        ga.id,
        ga.appointment_date AS date,
        ga.slot_time       AS time,
        ga.status,
        ga.service_id,
        s.name             AS service,
        ga.customer_id,
        c.first_name || ' ' || c.last_name AS customer_name,
        c.phone,
        ga.dog_id,
        d.name             AS dog_name,
        ga.notes,
        s.price
      FROM grooming_appointments ga
        JOIN services  s ON ga.service_id  = s.id
        JOIN customers c ON ga.customer_id = c.id
        JOIN dogs      d ON ga.dog_id      = d.id
      ORDER BY
        ga.appointment_date,
        ga.slot_time;
    `;
    const result = await con.query(query);
    return res.status(200).json(result.rows);
  }
  catch(err) {
    console.error('Error fetching grooming appointments:', err);
    return res.status(500).json({ message: 'שגיאה בטעינת תורים' });
  }
});*/

app.get('/grooming/appointments', authenticateToken, async (req, res) => {
  try {
    let baseQuery = `
      SELECT
        ga.id,
        ga.appointment_date AS date,
        ga.slot_time       AS time,
        ga.status,
        ga.service_id,
        s.name             AS service,
        ga.customer_id,
        c.first_name || ' ' || c.last_name AS customer_name,
        c.phone,
        ga.dog_id,
        d.name             AS dog_name,
        ga.notes,
        s.price
      FROM grooming_appointments ga
        JOIN services  s ON ga.service_id  = s.id
        JOIN customers c ON ga.customer_id = c.id
        JOIN dogs      d ON ga.dog_id      = d.id
    `;
    const params = [];
    if (req.query.date) {
      baseQuery += ` WHERE ga.appointment_date = $1`;
      params.push(req.query.date);
    }
    baseQuery += ` ORDER BY ga.appointment_date, ga.slot_time`;
    const { rows } = await con.query(baseQuery, params);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'שגיאה בטעינת תורים' });
  }
});

app.post('/ADDgrooming-appointments', authenticateToken, async (req, res) => {
  const { customerId, appointment_date, slot_time, service_id, dog_id, notes } = req.body;
  try {
    await con.query(
      `INSERT INTO grooming_appointments (customer_id, appointment_date, slot_time, service_id, dog_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [customerId, appointment_date, slot_time, service_id, dog_id, notes]
    );
    res.status(201).json({ message: 'Grooming appointment added' });
  } catch (err) {
    console.error('Error adding grooming appointment:', err);
    res.status(500).json({ message: 'Error adding grooming appointment' });
  }
});

app.put('/grooming/appointments/:id', authenticateToken, async (req, res) => {
  const { appointment_date, slot_time, service_id, dog_id, notes } = req.body;
  const id = req.params.id;
  try {
    const query = `
      UPDATE grooming_appointments
      SET 
        appointment_date = $1,
        slot_time        = $2,
        service_id       = $3,
        dog_id           = $4,
        notes            = $5
      WHERE id = $6
    `;
    await con.query(query, [appointment_date, slot_time, service_id, dog_id, notes, id]);
    return res.sendStatus(204);
  } catch (err) {
    console.error('Error updating grooming appointment:', err);
    return res.status(500).json({ message: 'שגיאה בעדכון התור' });
  }
});



// ייפתח לעדכון סטטוס
app.put('/grooming-appointments/:id/status', authenticateToken, async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  try {
    await con.query(
      `UPDATE grooming_appointments
       SET status = $1,
           status_updated_at = NOW()
       WHERE id = $2`,
      [status, id]
    );
    
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error('Error updating grooming status:', err);
    res.status(500).json({ message: 'שגיאה בעדכון סטטוס' });
  }
});


app.get('/grooming/stats', authenticateToken, async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const date = req.query.date || todayStr;

    // תורים להיום
    const todayRes = await con.query(
      `SELECT COUNT(*) AS cnt FROM grooming_appointments WHERE  appointment_date = CURRENT_DATE
      AND status = 'scheduled'`,
      
    );

    // תורים שבוטלו היום
    const cancelledRes = await con.query(
      `SELECT COUNT(*) AS cnt
       FROM grooming_appointments
       WHERE status = 'cancelled'
         AND DATE(status_updated_at) = CURRENT_DATE`,
      
    );

    // תור נוכחי
    const currentRes = await con.query(`
      SELECT g.id, g.slot_time, g.appointment_date,
       d.name AS dog_name,
       s.name AS service_name
FROM grooming_appointments g
JOIN dogs d ON g.dog_id = d.id
JOIN services s ON g.service_id = s.id
WHERE g.appointment_date = CURRENT_DATE
  AND CURRENT_TIME BETWEEN g.slot_time AND g.slot_time + INTERVAL '30 minutes'
ORDER BY g.slot_time ASC
LIMIT 1


    `, );

    // תור הבא
    const nextRes = await con.query(`
SELECT
  g.id,
  g.slot_time,
  g.appointment_date,
  d.name AS dog_name,
  s.name AS service_name
FROM grooming_appointments g
JOIN dogs d
  ON g.dog_id = d.id
JOIN services s
  ON g.service_id = s.id
WHERE
  g.status = 'scheduled'
  AND (
    g.appointment_date > CURRENT_DATE
    OR (
      g.appointment_date = CURRENT_DATE
      AND g.slot_time > CURRENT_TIME
    )
  )
ORDER BY
  g.appointment_date ASC,
  g.slot_time ASC
LIMIT 1;
    `, );

    res.json({
      date: todayStr,
      appointmentsToday: parseInt(todayRes.rows[0].cnt, 10),
      cancelledToday: parseInt(cancelledRes.rows[0].cnt, 10),
      currentAppointment: currentRes.rows[0] || null,
      nextAppointment: nextRes.rows[0] || null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching grooming stats' });
  }
});

app.get('/manager/grooming/today', async (req, res) => {
  try {
    const result = await con.query(`
      SELECT ga.id, d.name AS dog_name, s.name AS service_name, ga.slot_time
      FROM grooming_appointments ga
      JOIN dogs d ON ga.dog_id = d.id
      JOIN services s ON ga.service_id = s.id
      WHERE DATE(ga.appointment_date) = CURRENT_DATE
        AND ga.status = 'scheduled'
      ORDER BY ga.slot_time ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/manager/grooming/cancelled-today', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        ga.id,
        d.name AS dog_name,
        c.first_name || ' ' || c.last_name AS customer_name,
        c.phone,
        ga.appointment_date
      FROM grooming_appointments ga
      JOIN dogs d ON ga.dog_id = d.id
      JOIN customers c ON d.customer_id = c.id
      WHERE DATE(ga.status_updated_at) = CURRENT_DATE
        AND ga.status = 'cancelled'
      ORDER BY ga.appointment_date
    `;
    const result = await con.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cancelled grooming appointments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// מחזיר את רשימת הכלבים של לקוח לפי ת"ז
app.get('/customers/:id/dogs', authenticateToken, async (req, res) => {
  const customerId = req.params.id;
  try {
    const query = `
      SELECT id, name 
      FROM dogs 
      WHERE customer_id = $1
    `;
    const { rows } = await con.query(query, [customerId]);
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching customer dogs:', err);
    return res.status(500).json({ message: 'שגיאה בטעינת כלבי הלקוח' });
  }
});

app.use('/styles', express.static(path.join(__dirname, 'styles'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css'); //Set the correct header for css files
    }
  }
}));

// רק עובדים מורשים לקרוא את הדיווחים
app.get('/dashboard/reports', authenticateToken, async (req, res) => {
  try {
        const handlerId = req.user.userId;

      ({ rows } = await con.query(`
              SELECT
        r.id,
        r.dog_size,
        r.health_status,
        r.address,
        r.notes,
        r.status,
        r.image_path,
        r.report_date,
        r.handler_id,
        COALESCE(h.name, 'לא שובץ') AS handler_name,
                r.care_provider,
        COALESCE(p.name, 'לא שובץ') AS care_provider_name,

        -- pull in full customer name & phone:
        c.first_name || ' ' || c.last_name AS customer_name,
        c.phone
      FROM abandoned_dog_reports AS r
      JOIN customers AS c
        ON r.customer_id = c.id
        LEFT JOIN handlers AS h
        ON r.handler_id = h.id
        LEFT JOIN care_provider AS p
        ON r.care_provider = p.id

      ORDER BY r.id DESC
      `


      ));
    
    res.json(rows);
      }
   catch (err) {
    console.error('Error fetching dashboard reports:', err);
    res.status(500).json({ message: 'שגיאה בשליפת פניות לכלבים נטושים' });
  }
});
app.put('/abandoned-reports/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await con.query(
  'UPDATE abandoned_dog_reports SET status = $1, status_updated_at = NOW() WHERE id = $2',
      
      [status, id]
    );
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error('Error updating abandoned report status:', err);
    res.status(500).json({ message: 'Error updating status' });
  }
});

app.get('/handler/reports', authenticateToken, async (req, res) => {
  try {
        const handlerId = req.user.userId;

      ({ rows } = await con.query(`
              SELECT
        r.id,
        r.dog_size,
        r.health_status,
        r.address,
        r.notes,
        r.status,
        r.image_path,
        r.report_date,
        r.handler_id,
        COALESCE(h.name, 'לא שובץ') AS handler_name,
                r.care_provider,
        COALESCE(p.name, 'לא שובץ') AS care_provider_name,

        -- pull in full customer name & phone:
        c.first_name || ' ' || c.last_name AS customer_name,
        c.phone
      FROM abandoned_dog_reports AS r
      JOIN customers AS c
        ON r.customer_id = c.id
        LEFT JOIN handlers AS h
        ON r.handler_id = h.id
        LEFT JOIN care_provider AS p
        ON r.care_provider = p.id
      WHERE r.handler_id = $1
      ORDER BY r.id DESC
      `, [handlerId]


      ));
    
    res.json(rows);
      }
   catch (err) {
    console.error('Error fetching dashboard reports:', err);
    res.status(500).json({ message: 'שגיאה בשליפת פניות לכלבים נטושים' });
  }
});
app.put('/abandoned-reports/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await con.query(
  'UPDATE abandoned_dog_reports SET status = $1, status_updated_at = NOW() WHERE id = $2',
      
      [status, id]
    );
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error('Error updating abandoned report status:', err);
    res.status(500).json({ message: 'Error updating status' });
  }
});


app.get('/handler/abandoned/stats', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Jerusalem'
    });
            const handlerId = req.user.userId;


    const queries = {
      inProgress:    `SELECT COUNT(*) FROM abandoned_dog_reports WHERE (status = 'accepted' OR status = 'ontheway') AND handler_id = $1`,
      accepted:      `SELECT COUNT(*) FROM abandoned_dog_reports WHERE status = 'accepted' and handler_id = $1`, 
      ontheway:      `SELECT COUNT(*) FROM abandoned_dog_reports WHERE status = 'ontheway' aND handler_id = $1`,
      cancelledToday:`SELECT COUNT(*) FROM abandoned_dog_reports WHERE status = 'cancelled' AND DATE(status_updated_at) = $1 AND handler_id = $2`,
      pending:       `SELECT COUNT(*) FROM abandoned_dog_reports WHERE status = 'inprogress' AND handler_id = $1`,
    };

const [inProgress, accepted, ontheway, cancelledToday,pending] = await Promise.all([
  con.query(queries.inProgress, [handlerId]),
  con.query(queries.accepted, [handlerId]),
  con.query(queries.ontheway, [handlerId]),
  con.query(queries.cancelledToday, [today, handlerId]),
  con.query(queries.pending, [handlerId])
]);

    res.json({
      inProgress:    parseInt(inProgress.rows[0].count, 10),
      accepted:      parseInt(accepted.rows[0].count, 10),
      ontheway:      parseInt(ontheway.rows[0].count, 10),
      cancelledToday:parseInt(cancelledToday.rows[0].count, 10),
      pending:       parseInt(pending.rows[0].count, 10) 
    });
  } catch (err) {
    res.status(500).json({ message: 'Error loading KPI data' });
  }
});

app.get('/dashboard/abandoned/stats', authenticateToken, async (req, res) => {
  try {
    // 1. count where report_date = today
    const todayRes = await con.query(`
      SELECT COUNT(*) AS cnt
      FROM abandoned_dog_reports
WHERE report_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jerusalem')::date
      AND status = 'open'
        
    `);
    const countToday = parseInt(todayRes.rows[0].cnt, 10);

    // 2. count where status = 'open'
    const openRes = await con.query(`
      SELECT COUNT(*) AS cnt
      FROM abandoned_dog_reports
      WHERE status = 'open'
    `);
    const countOpen = parseInt(openRes.rows[0].cnt, 10);

    // 3. count where status = 'inprogress'
    const inProgRes = await con.query(`
      SELECT COUNT(*) AS cnt
      FROM abandoned_dog_reports
      WHERE status = 'inprogress'
    `);
    const countInProgress = parseInt(inProgRes.rows[0].cnt, 10);

    // 4. count where status = 'inprogress' AND handler_id IS NULL
    const unassignedHandlerRes = await con.query(`
      SELECT COUNT(*) AS cnt
      FROM abandoned_dog_reports
      WHERE status = 'inprogress'
        AND handler_id IS NULL
    `);
    const countInProgUnassignedHandler = parseInt(unassignedHandlerRes.rows[0].cnt, 10);

    // 5. count where status = 'inprogress' AND care_provider IS NULL
    const unassignedCareRes = await con.query(`
      SELECT COUNT(*) AS cnt
      FROM abandoned_dog_reports
      WHERE status = 'inprogress'
        AND care_provider IS NULL
    `);
    const countInProgUnassignedCare = parseInt(unassignedCareRes.rows[0].cnt, 10);

    // מחזירים JSON עם כל חמשת התוצאות
    return res.json({
      todayCount:               countToday,
      openCount:                countOpen,
      inProgressCount:          countInProgress,
      inProgressUnassignedHandler: countInProgUnassignedHandler,
      inProgressUnassignedCare:     countInProgUnassignedCare
    });
  } catch (err) {
    console.error('Error fetching abandoned-dog stats:', err);
    return res.status(500).json({ message: 'שגיאה בטעינת הסטטיסטיקות' });
  }
});

app.get('/manager/abandoned/cancelled-today', authenticateToken, async (req, res) => {
  try {
    const query = `
SELECT 
  ar.id,
  ar.report_date,
  ar.status,
  c.first_name || ' ' || c.last_name AS customer_name,
  c.phone
FROM abandoned_dog_reports ar
JOIN customers c ON ar.customer_id = c.id
WHERE ar.status = 'cancelled'
  AND DATE(ar.status_updated_at) = CURRENT_DATE
ORDER BY ar.report_date DESC;
    `;

    const result = await con.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cancelled abandoned reports:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/manager/reports/by-status/:status', authenticateToken, async (req, res) => {
  const status = req.params.status;

  try {
    const query = `
SELECT 
  ar.id,
  ar.report_date,
  c.first_name || ' ' || c.last_name AS customer_name,
  c.phone AS customer_phone,
  h.name AS handler_name,
  h.phone AS handler_phone
FROM abandoned_dog_reports ar
JOIN customers c ON ar.customer_id = c.id
LEFT JOIN handlers h ON ar.handler_id = h.id
WHERE ar.status = $1
ORDER BY ar.report_date DESC;
    `;

    const result = await con.query(query, [status]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching reports by status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/api/handler/abandoned-dogs/kpi', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const queries = {
      inProgress:    `SELECT COUNT(*) FROM abandoned_dog_reports WHERE status = 'inprogress'`,
      accepted:      `SELECT COUNT(*) FROM abandoned_dog_reports WHERE status = 'accepted'`,
      ontheway:      `SELECT COUNT(*) FROM abandoned_dog_reports WHERE status = 'ontheway'`,
      cancelledToday:`SELECT COUNT(*) FROM abandoned_dog_reports WHERE status = 'cancelled' AND DATE(status_updated_at) = $1`
    };

    const [inProgress, accepted, ontheway, cancelledToday] = await Promise.all([
      con.query(queries.inProgress),
      con.query(queries.accepted),
      con.query(queries.ontheway),
      con.query(queries.cancelledToday, [today])
    ]);

    res.json({
      inProgress:    parseInt(inProgress.rows[0].count, 10),
      accepted:      parseInt(accepted.rows[0].count, 10),
      ontheway:      parseInt(ontheway.rows[0].count, 10),
      cancelledToday:parseInt(cancelledToday.rows[0].count, 10)
    });
  } catch (err) {
    res.status(500).json({ message: 'Error loading KPI data' });
  }
});

// ─── (A) GET /dashboard/couriers ───────────────────────────────────────────────
// This route returns a JSON array of all couriers: [{ id, name }, …].
app.get(
  '/dashboard/couriers',
  authenticateToken, 
  async (req, res) => {
    try {
      // Replace “couriers” and “name” with your actual table/column if different
      const { rows } = await con.query(`
        SELECT id, name
        FROM handlers
        ORDER BY name
      `);
      return res.json(rows);
    } catch (err) {
      console.error('Error fetching couriers:', err);
      return res.status(500).json({ message: 'שגיאה בטעינת רשימת השליחים' });
    }
  }
);


// ─── (B) PUT /dashboard/reports/:reportId/assign-handler ─────────────────────────
// This route expects `{ handler_id: <courierId> }` in req.body and updates that field.
app.put(
  '/dashboard/reports/:reportId/assign-handler',
  authenticateToken,
  async (req, res) => {
    const { reportId } = req.params;
    const { handler_id } = req.body;

    if (!handler_id) {
      return res.status(400).json({ message: 'handler_id חסר בבקשה' });
    }

    try {
      await con.query(
        `UPDATE abandoned_dog_reports
           SET handler_id = $1
         WHERE id = $2`,
        [handler_id, reportId]
      );
      return res.sendStatus(200);
    } catch (err) {
      console.error('Error assigning handler in abandoned_dog_reports:', err);
      return res.status(500).json({ message: 'שגיאה בשיבוץ השליח' });
    }
  }
);

// Returns a list of all care providers: [{ id, name }, …]
app.get(
  '/dashboard/care-providers',
  authenticateToken,
  async (req, res) => {
    try {
      // If your table is named differently (e.g. “care_providers”), adjust accordingly:
      const { rows } = await con.query(`
        SELECT id, name
        FROM care_provider
        ORDER BY name
      `);
      return res.json(rows);
    } catch (err) {
      console.error('Error fetching care providers:', err);
      return res.status(500).json({ message: 'שגיאה בטעינת רשימת גורמי הסיוע' });
    }
  }
);


// ─── (B) PUT /dashboard/reports/:reportId/assign-care ────────────────────────────────
// Assigns a care provider to the given report (by setting care_provider = <providerId>)
app.put(
  '/dashboard/reports/:reportId/assign-care',
  authenticateToken,
  async (req, res) => {
    const { reportId } = req.params;
    const { care_provider } = req.body;

    if (!care_provider) {
      return res.status(400).json({ message: 'care_provider חסר בבקשה' });
    }

    try {
      await con.query(
        `UPDATE abandoned_dog_reports
           SET care_provider = $1
         WHERE id = $2`,
        [care_provider, reportId]
      );
      return res.sendStatus(200);
    } catch (err) {
      console.error('Error assigning care provider in abandoned_dog_reports:', err);
      return res.status(500).json({ message: 'שגיאה בשיבוץ גורם הסיוע' });
    }
  }
);



// רק משתמשים מורשים
app.get('/handlers', authenticateToken, async (req, res) => {
  try {
    const result = await con.query(`
      SELECT
        id,
        name,
        phone,
        address,
        vehicle_type,
        email
      FROM handlers
      ORDER BY id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching handlers:', err);
    res.status(500).json({ message: 'שגיאה בטעינת השליחים' });
  }
});

app.post('/handlers/add', authenticateToken, async (req, res) => {
  const {id, name, phone, address, vehicle_type, email } = req.body;

  if (!id || !name || !phone || !address || !vehicle_type || !email) {
    return res.status(400).json({ message: 'שדות חובה חסרים' });
  }

  try {
    const query = `
      INSERT INTO handlers (id, name, phone, address, vehicle_type, email)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [id, name, phone, address, vehicle_type, email];
    const result = await con.query(query, values);

    res.status(201).json({
      message: 'שליח נוסף בהצלחה',
      handler: result.rows[0],
    });
  } catch (err) {
    console.error('Error adding handler:', err);
    res.status(500).json({ message: 'שגיאה בהוספת שליח' });
  }
});

// מחזיר את רשימת גורמי הסיוע
app.get('/care-providers', authenticateToken, async (req, res) => {
  try {
    const result = await con.query(`
      SELECT
        id,
        name,
        address,
        phone,
        additional_phone,
        type
      FROM care_provider
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching care providers:', err);
    res.status(500).json({ message: 'שגיאה בשליפת גורמי סיוע' });
  }
});


// רשימת לקוחות עם כל הכלבים שלהם
app.get('/dashboard/customers', authenticateToken, async (req, res) => {
  // רק עובדים יכולים לקרוא

  try {
    const { rows } = await con.query(`
      SELECT 
        c.id,
        c.first_name || ' ' || c.last_name AS customer_name,
        c.phone,
        c.email,
        c.address,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id',        d.id,
              'name',      d.name,
              'breed',     d.breed,
              'age',       d.age,
              'gender',    d.gender,
              'size',      d.size
            )
          ) FILTER (WHERE d.id IS NOT NULL)
        , '[]') AS dogs
      FROM customers c
      LEFT JOIN dogs d
        ON d.customer_id = c.id
      GROUP BY c.id
      ORDER BY c.id;
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ message: 'שגיאה בשליפת לקוחות' });
  }
});





/*
//trying calendar and appointments stuff
// server.js (Express)


//add appoitment to calendar

app.get('/manager/appointments', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    // grooming query
    const groomQ = `
      SELECT 
        ga.appointment_date AS start_date,
        ga.slot_time       AS start_time,
        /* compute end_time here if needed 
        'grooming'         AS type,
        d.name             AS dog_name,
        s.name             AS service_name
      FROM grooming_appointments ga
      JOIN dogs d    ON ga.dog_id     = d.id
      JOIN services s ON ga.service_id = s.id
      WHERE ga.customer_id = $1
    `;

    // boarding query
    const boardQ = `
      SELECT 
        ba.check_in  AS start_date,
        ba.check_out AS end_date,
        'boarding'   AS type,
        d.name       AS dog_name
      FROM boarding_appointments ba
      JOIN dogs d ON ba.dog_id = d.id
      WHERE ba.customer_id = $1
    `;

    const groomR = await con.query(groomQ, [userId]);
    const boardR = await con.query(boardQ, [userId]);

    // combine & sort by start_date (+ optional time)
    const all = [
      ...groomR.rows.map(r => ({ ...r, end_date: r.start_date, /* you can compute real end_time  })),
      ...boardR.rows
    ];
    all.sort((a,b) => new Date(a.start_date) - new Date(b.start_date));

    return res.json(all);
  }
  catch(err) {
    console.error(err);
    return res.status(500).json({ message: 'Cannot fetch appointments' });
  }
});
*/

//calenar and appointments stuff - Template for manager

//===================================================HANDLERDASH.JS========================================================


app.get('/handler-profile', authenticateToken, async (req, res) => {
  const handlerId = req.user.userId; // Get handler ID from the authenticated user

  try {
    // Get handler profile
    const handlerRes = await con.query('SELECT * FROM handlers WHERE id = $1', [handlerId]);
    // Get completed jobs for this handler
    const jobsRes = await con.query(
      `SELECT 
      adr.id,       
  adr.dog_size,
  adr.health_status,
  adr.address,
  adr.report_date,
  COALESCE(cp.name, 'לא משויך') AS care_provider_name
FROM abandoned_dog_reports adr
LEFT JOIN care_provider cp ON adr.care_provider = cp.id
WHERE adr.handler_id = $1 AND adr.status = 'completed'
ORDER BY adr.report_date DESC
`,
      [handlerId]
    );

    res.json({
      handler: handlerRes.rows[0],
      completedJobs: jobsRes.rows
    });
  } catch (err) {
    console.error('Error in /handler-profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
//============== production build =========================
app.get('/products',  async (req, res) => {
  try {
    const query = `
      SELECT 
  p.id,
  p.name,
  c.name AS category,
  p.price,
  p.stock_quantity,
  p.min_quantity,
  p.description,
  p.img_path,
  (p.stock_quantity < p.min_quantity) AS low_stock,
  (p.stock_quantity = 0) AS unavailable
FROM products p
JOIN categories c ON p.category_id = c.id
ORDER BY p.name;

    `;
    const { rows } = await con.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error loading products:', err);
    res.status(500).json({ message: 'שגיאה בטעינת מוצרים' });
  }
});

app.get(
  '/api/products/stock-counts',
  authenticateToken,
  async (req, res) => {
    try {
      const [{ count: low }] = await con.query(
        `SELECT COUNT(*) AS count
         FROM products
         WHERE stock_quantity > 0
           AND stock_quantity <= min_quantity`,
      ).then(r => r.rows);

      const [{ count: out }] = await con.query(
        `SELECT COUNT(*) AS count
         FROM products
         WHERE stock_quantity = 0`
      ).then(r => r.rows);

      res.json({ low: +low, out: +out });
    } catch (err) {
      console.error('Error fetching stock counts', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// 2) list of low-stock products
app.get(
  '/api/products/low-stock',
  authenticateToken,
  async (req, res) => {
    try {
      const result = await con.query(
        `SELECT id, name, stock_quantity
         FROM products
         WHERE stock_quantity > 0
           AND stock_quantity <= min_quantity
         ORDER BY stock_quantity ASC`,
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching low-stock list', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// 3) list of out-of-stock products
app.get(
  '/api/products/out-of-stock',
  authenticateToken,
  async (req, res) => {
    try {
      const result = await con.query(
        `SELECT id, name, stock_quantity
         FROM products
         WHERE stock_quantity = 0`
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching out-of-stock list', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// 1 product by ID
// GET a single product by ID (including its category name)
app.get(
  '/api/products/:id',
  authenticateToken,
  async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      const result = await con.query(
        `SELECT
           p.id,
           p.name,
           p.price,
           p.stock_quantity,
           p.min_quantity,
           p.description,
           p.img_path,
           p.category_id,
           c.name AS category
         FROM products p
         LEFT JOIN categories c
           ON p.category_id = c.id
         WHERE p.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching product by ID', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// 4) update a product by ID
app.put(
  '/api/products/:id',
  authenticateToken,
  async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const {
      name,
      category_id,    // make sure your form sends the category’s ID, not its name
      price,
      stock_quantity,
      min_quantity,
      description
    } = req.body;

    try {
      const result = await con.query(
        `UPDATE products
         SET name           = $1,
             category_id    = $2,
             price          = $3,
             stock_quantity = $4,
             min_quantity   = $5,
             description    = $6
         WHERE id = $7
         RETURNING *`,
        [name, category_id, price, stock_quantity, min_quantity, description, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error updating product', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);



app.get('/products/toys',  async (req, res) => {
  try {
    const query = `
SELECT 
  p.id,
  p.name,
  c.name AS category_name,
  p.price,
  p.stock_quantity,
  p.min_quantity,
  p.description,
  p.img_path,
  (p.stock_quantity = 0) AS unavailable, -- Mark products as unavailable
  (p.stock_quantity < p.min_quantity) AS low_stock
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.name = 'צעצועים'
ORDER BY p.name;
    `;
    const { rows } = await con.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error loading products:', err);
    res.status(500).json({ message: 'שגיאה בטעינת מוצרים' });
  }
});

app.get('/products/food',  async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.name,
        c.name AS category_name,
        p.price,
        p.stock_quantity,
        p.min_quantity,
        p.description,
        p.img_path,
          (p.stock_quantity = 0) AS unavailable, -- Mark products as unavailable

        (p.stock_quantity < p.min_quantity) AS low_stock
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE c.name = 'מזון'
      ORDER BY name;
    `;
    const { rows } = await con.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error loading products:', err);
    res.status(500).json({ message: 'שגיאה בטעינת מוצרים' });
  }
});

app.get('/products/collars',  async (req, res) => {
  try {
    const query = `
      SELECT 
  p.id,
  p.name,
  c.name AS category_name,
  p.price,
  p.stock_quantity,
  p.min_quantity,
  p.description,
  p.img_path,
    (p.stock_quantity = 0) AS unavailable, -- Mark products as unavailable

  (p.stock_quantity < p.min_quantity) AS low_stock
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.name = 'קולרים'
ORDER BY p.name;

    `;
    const { rows } = await con.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error loading products:', err);
    res.status(500).json({ message: 'שגיאה בטעינת מוצרים' });
  }
});

app.get('/products/grooming',  async (req, res) => {
  try {
    const query = `
SELECT 
  p.id,
  p.name,
  c.name AS category_name,
  p.price,
  p.stock_quantity,
  p.min_quantity,
  p.description,
  p.img_path,
    (p.stock_quantity = 0) AS unavailable, -- Mark products as unavailable

  (p.stock_quantity < p.min_quantity) AS low_stock
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.name = 'טיפוח'
ORDER BY p.name;
    `;
    const { rows } = await con.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error loading products:', err);
    res.status(500).json({ message: 'שגיאה בטעינת מוצרים' });
  }
});

// add a new product
app.post('/products/add', upload.single('img'), async (req, res) => {
  try {
    const { name, category_id, price, stock_quantity, description, min_quantity } = req.body;
    const img_path = req.file.filename;

    await con.query(`
      INSERT INTO products (name, category_id, price, stock_quantity, description, min_quantity, img_path)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [name, category_id, price, stock_quantity, description, min_quantity, img_path]);

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/categories', async (req, res) => {
  try {
    const result = await con.query('SELECT id, name FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Error loading categories:', err);
    res.status(500).json({ message: 'שגיאה בטעינת קטגוריות' });
  }
});




// === order ==========

app.post('/orders/create', authenticateToken, async (req, res) => {
    console.log('Incoming request body:', req.body);

  try {
    const { address_id, payment_method, cart } = req.body;
    const customer_id = req.user.userId; // from JWT

    if (!customer_id) {
      return res.status(400).json({ message: 'Customer ID is missing' });
    }

    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    await con.query('BEGIN'); // Start transaction

    const { rows: [{ id: orderId }] } = await con.query(`
      INSERT INTO orders (customer_id, address_id, payment_method, total)
      VALUES ($1, $2, $3, $4) RETURNING id`,
      [customer_id, address_id, payment_method, total]
    );

    for (const it of cart) {
      await con.query(`
        INSERT INTO order_items (order_id, product_id, quantity, unit_price)
        VALUES ($1, $2, $3, $4)`,
        [orderId, it.id, it.quantity, it.price]
      );

      await con.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [it.quantity, it.id]
      );
    }

    await con.query('COMMIT'); // Commit transaction
    res.json({ orderId });
  } catch (err) {
    await con.query('ROLLBACK'); // Rollback transaction on error
    console.error(err);
    res.status(500).send('Order failed');
  }
});

app.get('/orders/:id', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { rows: orderRows } = await con.query(`
      SELECT o.id, o.total, o.payment_method, o.created_at,
             a.city, a.street, a.house_number
      FROM orders o
      JOIN addresses a ON o.address_id = a.id
      WHERE o.id = $1 AND o.customer_id = $2`,
      [orderId, req.user.userId]);

    if (!orderRows.length) return res.status(404).send('Order not found');

    const { rows: items } = await con.query(`
      SELECT p.name, oi.quantity, oi.unit_price
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1`,
      [orderId]);

    res.json({ ...orderRows[0], items });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch order');
  }
});



app.get('/home/addresses', authenticateToken, async (req, res) => {
  try {
    const customer_id = req.user.userId; // from JWT
    const { rows } = await con.query(
      `SELECT id, label, city, street, house_number, zip
       FROM   addresses
       WHERE  customer_id = $1
       ORDER  BY id DESC`,
      [customer_id]
    );
    res.json(rows);                    // 200 OK
  } catch (err) {
    console.error('Error loading addresses:', err);
    res.status(500).json({ message: 'שגיאה בטעינת כתובות' });
  }
});
app.post('/set/addresses', authenticateToken, async (req, res) => {
  const { city, street, house_number } = req.body;
  if (!city || !street || !house_number)
    return res.status(400).json({ message: 'חסרים שדות' });

  try {
    const customer_id = req.user.userId;  // ‏האיידי מגיע מה-JWT
    const { rows } = await con.query(
      `INSERT INTO addresses (customer_id, city, street, house_number)
       VALUES ($1, $2, $3, $4)
       RETURNING id, city, street, house_number`,
      [customer_id, city, street, house_number]
    );
    res.json(rows[0]);               // מחזיר את הכתובת החדשה
  } catch (err) {
    console.error('Error saving address:', err);
    res.status(500).json({ message: 'שגיאה בשמירת כתובת' });
  }
});

// Manager dashboard 

app.get('/manager/stats/employees', authenticateToken, async (req, res) => {
  try {
    const rows = await con.query('SELECT COUNT(*) AS total FROM employees');
    const employeeCount = parseInt(rows.rows[0].total, 10);
    res.json({ employeeCount });    
  } catch (err) {
    console.error('DB - employee count error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.get('/manager/stats/dogs', authenticateToken, async (req, res) => {
  try {
    const rows = await con.query('SELECT COUNT(*) AS total FROM boarding_appointments WHERE status = \'inprogress\' AND CURRENT_DATE BETWEEN check_in AND check_out');
    const dogCount = parseInt(rows.rows[0].total, 10);
    res.json({ dogCount });
  } catch (err) {
    console.error('DB - dog count error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.get('/manager/stats/low-stock', authenticateToken, async (req, res) => {
  try {

    const rows = await con.query(`
      SELECT COUNT(*) AS total
      FROM products
      WHERE stock_quantity > 0
        AND stock_quantity <= min_quantity
    `);
    const lowStockCount = parseInt(rows.rows[0].total, 10);
    res.json({ lowStockCount }); // Ensure this returns an object
  } catch (err) {
    console.error('DB - low stock count error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.get('/manager/stats/low-stock/list', authenticateToken, async (req, res) => {
  try {
    const { rows } = await con.query(`
      SELECT id, name, stock_quantity
      FROM products
      WHERE stock_quantity > 0
        AND stock_quantity < min_quantity
      ORDER BY stock_quantity ASC
    `);
    res.json(rows);                // بيرجع Array
  } catch (err) {
    console.error('DB - low stock list error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});


app.get('/manager/stats/revenue-today', authenticateToken, async (req, res) => {
  const pricePerNight = 100;              // עלות לילה בפנסיון
  const sql = `
    WITH
    grooming_income AS (
      SELECT COALESCE(SUM(s.price), 0) AS total
      FROM grooming_appointments ga
      JOIN services s ON s.id = ga.service_id
      WHERE ga.appointment_date = CURRENT_DATE
        AND ga.status = 'completed' 
        
    ),
    boarding_income AS (
      SELECT COUNT(*) * $1::numeric AS total
      FROM boarding_appointments ba
      WHERE CURRENT_DATE BETWEEN ba.check_in AND ba.check_out
      AND ba.status != 'cancelled'  -- Exclude cancelled bookings
    ),
    store_income AS (
      SELECT COALESCE(SUM(o.total), 0) AS total
      FROM orders o
      WHERE o.created_at::date = CURRENT_DATE
    )
    SELECT
      (SELECT total FROM grooming_income) +
      (SELECT total FROM boarding_income) +
      (SELECT total FROM store_income)     AS revenue_today;
  `;

  try {
    const { rows } = await con.query(sql, [pricePerNight]);
    res.json({ total: Number(rows[0].revenue_today) });
  } catch (err) {
    console.error('DB – revenue today error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// routes/dashboard.js
app.get(
  '/manager/stats/revenue-components-today',
  authenticateToken,
  async (req, res) => {
    const pricePerNight = 100;   // עלות לילה בפנסיון

    const sql = `
      WITH
      grooming_income AS (
        SELECT COALESCE(SUM(s.price), 0) AS total
        FROM grooming_appointments ga
        JOIN services s ON s.id = ga.service_id
        WHERE ga.appointment_date = CURRENT_DATE
          AND ga.status = 'completed'
      ),
      boarding_income AS (
        SELECT COUNT(*) * $1::numeric AS total
        FROM boarding_appointments ba
        WHERE CURRENT_DATE BETWEEN ba.check_in AND ba.check_out
      ),
      store_income AS (
        SELECT COALESCE(SUM(o.total), 0) AS total
        FROM orders o
        WHERE o.created_at::date = CURRENT_DATE
      )
      SELECT
        g.total AS grooming,
        b.total AS boarding,
        s.total AS store
      FROM grooming_income g, boarding_income b, store_income s;
    `;

    try {
      const { rows } = await con.query(sql, [pricePerNight]);
      res.json(rows[0]);            // { grooming, boarding, store }
    } catch (err) {
      console.error('revenue-components error:', err);
      res.status(500).json({ error: 'DB error' });
    }
  }
);

app.get('/manager/stats/service-counts-today', async (req, res) => {
  try {
    const q1 = `
      SELECT COUNT(*) AS count
      FROM grooming_appointments
      WHERE appointment_date = CURRENT_DATE AND service_id = 1
    `;

    const q2 = `
      SELECT COUNT(*) AS count
      FROM grooming_appointments
      WHERE appointment_date = CURRENT_DATE AND service_id = 2
    `;

    const q3 = `
      SELECT COUNT(*) AS count
      FROM grooming_appointments
      WHERE appointment_date = CURRENT_DATE AND service_id = 3
    `;

    const [s1, s2, s3] = await Promise.all([
      con.query(q1),
      con.query(q2),
      con.query(q3)
    ]);

    res.json({
      service1: parseInt(s1.rows[0].count),
      service2: parseInt(s2.rows[0].count),
      service3: parseInt(s3.rows[0].count)
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching service counts');
  }
});

app.get('/manager/stats/revenue-components', authenticateToken, async (req, res) => {
  const period = req.query.period || 'today';
  const pricePerNight = 100;

  let groomingCondition = '';
  let boardingCondition = '';
  let storeCondition = '';

  switch (period) {
    case 'week':
      groomingCondition = `ga.appointment_date >= CURRENT_DATE - INTERVAL '7 days'`;
      boardingCondition = `CURRENT_DATE BETWEEN ba.check_in AND ba.check_out`; // נשאר קבוע
      storeCondition = `o.created_at::date >= CURRENT_DATE - INTERVAL '7 days'`;
      break;
    case 'month':
      groomingCondition = `ga.appointment_date >= CURRENT_DATE - INTERVAL '1 month'`;
      boardingCondition = `CURRENT_DATE BETWEEN ba.check_in AND ba.check_out`;
      storeCondition = `o.created_at::date >= CURRENT_DATE - INTERVAL '1 month'`;
      break;
    default:
      groomingCondition = `ga.appointment_date = CURRENT_DATE`;
      boardingCondition = `CURRENT_DATE BETWEEN ba.check_in AND ba.check_out`;
      storeCondition = `o.created_at::date = CURRENT_DATE`;
  }

  const sql = `
    WITH
    grooming_income AS (
      SELECT COALESCE(SUM(s.price), 0) AS total
      FROM grooming_appointments ga
      JOIN services s ON s.id = ga.service_id
      WHERE ${groomingCondition} AND ga.status = 'completed'
    ),
    boarding_income AS (
      SELECT COUNT(*) * $1::numeric AS total
      FROM boarding_appointments ba
      WHERE ${boardingCondition}
    ),
    store_income AS (
      SELECT COALESCE(SUM(o.total), 0) AS total
      FROM orders o
      WHERE ${storeCondition}
    )
    SELECT
      g.total AS grooming,
      b.total AS boarding,
      s.total AS store
    FROM grooming_income g, boarding_income b, store_income s;
  `;

  try {
    const { rows } = await con.query(sql, [pricePerNight]);
    res.json(rows[0]);
  } catch (err) {
    console.error('revenue-components error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.get('/manager/stats/service-counts', authenticateToken, async (req, res) => {
  const period = req.query.period || 'today';

  let condition = '';
  switch (period) {
    case 'week':
      condition = `appointment_date >= CURRENT_DATE - INTERVAL '7 days'`;
      break;
    case 'month':
      condition = `appointment_date >= CURRENT_DATE - INTERVAL '1 month'`;
      break;
    default:
      condition = `appointment_date = CURRENT_DATE`;
  }

  try {
    const sql = `
      SELECT service_id, COUNT(*) AS count
      FROM grooming_appointments
      WHERE ${condition}
      GROUP BY service_id
    `;

    const result = await con.query(sql);

    const counts = { service1: 0, service2: 0, service3: 0 };
    result.rows.forEach(row => {
      if (row.service_id === 1) counts.service1 = parseInt(row.count);
      if (row.service_id === 2) counts.service2 = parseInt(row.count);
      if (row.service_id === 3) counts.service3 = parseInt(row.count);
    });

    res.json(counts);
  } catch (err) {
    console.error('service-counts error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.get('/manager/stats/top-products', authenticateToken, async (req, res) => {
  try {
    const sql = `
      SELECT p.name, SUM(oi.quantity) AS total_sold
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      GROUP BY p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `;

    const result = await con.query(sql);
    res.json(result.rows); // [{ name: 'Product A', total_sold: 120 }, ...]
  } catch (err) {
    console.error('Error fetching top products:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// GET top 5 products sold, filtered by today/week/month
// GET top 5 products by quantity sold & revenue, filtered by today/week/month
// GET top 5 products by quantity sold & revenue, filtered by today/week/month (Israel TZ)
app.get(
  '/manager/stats/top-products',
  authenticateToken,
  async (req, res) => {
    const range = req.query.range || 'today';

    try {
      // 1) ensure all date functions use Israel time
      await con.query(`SET TIME ZONE 'Asia/Jerusalem'`);

      // 2) build a WHERE on the DATE part of created_at
      let filterSQL;
      switch (range) {
        case 'today':
          // only orders whose local-date = today
          filterSQL = `o.created_at::date = CURRENT_DATE`;
          break;
        case 'week':
          // last 7 calendar days (including today)
          filterSQL = `o.created_at::date >= CURRENT_DATE - INTERVAL '6 days'`;
          break;
        case 'month':
          // last 30 calendar days
          filterSQL = `o.created_at::date >= CURRENT_DATE - INTERVAL '29 days'`;
          break;
        default:
          filterSQL = 'TRUE';
      }

      console.log(
        `📊 [route] top-products range="${range}", filter=" ${filterSQL} "`
      );

      // 3) run the aggregate
      const { rows } = await con.query(
        `
        SELECT
          p.name,
          SUM(oi.quantity)                 AS total_sold,
          SUM(oi.quantity * oi.unit_price) AS total_revenue
        FROM order_items oi
        JOIN orders o   ON oi.order_id   = o.id
        JOIN products p ON p.id          = oi.product_id
        WHERE ${filterSQL}
        GROUP BY p.name
        ORDER BY total_sold DESC
        LIMIT 5
        `
      );

      console.log(`✅ returned ${rows.length} rows`);
      res.json(rows);
    } catch (err) {
      console.error('❗ [route] Error fetching top products', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

app.get('/reports/customers-active', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT c.id, c.first_name || ' ' || c.last_name AS name, c.phone, c.email
FROM customers c
WHERE c.id IN (
  SELECT customer_id FROM grooming_appointments
  WHERE appointment_date >= CURRENT_DATE - INTERVAL '2 months'
  UNION
  SELECT customer_id FROM boarding_appointments
  WHERE check_in >= CURRENT_DATE - INTERVAL '2 months'
  UNION
  SELECT o.customer_id FROM orders o
  WHERE o.created_at >= CURRENT_DATE - INTERVAL '2 months'
)
ORDER BY name;

    `;

    const result = await con.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching active customers report:', err);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

app.get('/reports/customers-inactive', async (req, res) => {
  try {
    const query = `
      SELECT c.id, c.first_name || ' ' || c.last_name AS name, c.phone, c.email
      FROM customers c
      WHERE c.id NOT IN (
        SELECT customer_id FROM grooming_appointments
        WHERE appointment_date >= CURRENT_DATE - INTERVAL '2 months'
        UNION
        SELECT customer_id FROM boarding_appointments
        WHERE check_in >= CURRENT_DATE - INTERVAL '2 months'
        UNION
        SELECT customer_id FROM orders
        WHERE created_at >= CURRENT_DATE - INTERVAL '2 months'
      )
      ORDER BY name;
    `;

    const result = await con.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error loading inactive customers report:', err);
    res.status(500).json({ error: 'Failed to load report' });
  }
});

app.get('/reports/customers-new', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT c.id, c.first_name || ' ' || c.last_name AS name, c.phone, c.email
      FROM customers c
      WHERE c.id IN (
        SELECT customer_id
        FROM grooming_appointments
        WHERE appointment_date >= CURRENT_DATE - INTERVAL '1 month'
        AND customer_id NOT IN (
          SELECT customer_id
          FROM grooming_appointments
          WHERE appointment_date < CURRENT_DATE - INTERVAL '1 month'
        )
        UNION
        SELECT customer_id
        FROM boarding_appointments
        WHERE check_in >= CURRENT_DATE - INTERVAL '1 month'
        AND customer_id NOT IN (
          SELECT customer_id
          FROM boarding_appointments
          WHERE check_in < CURRENT_DATE - INTERVAL '1 month'
        )
        UNION
        SELECT o.customer_id
        FROM orders o
        WHERE o.created_at >= CURRENT_DATE - INTERVAL '1 month'
        AND o.customer_id NOT IN (
          SELECT customer_id FROM orders
          WHERE created_at < CURRENT_DATE - INTERVAL '1 month'
        )
      )
      ORDER BY name;
    `;
    const result = await con.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error loading new customers:', err);
    res.status(500).json({ error: 'Failed to load report' });
  }
});

app.get('/reports/customers-returning', async (req, res) => {
  try {
    const query = `
      SELECT c.id, c.first_name || ' ' || c.last_name AS name, c.phone, c.email,
             COUNT(*) AS total_reservations
      FROM customers c
      JOIN boarding_appointments b ON c.id = b.customer_id
      GROUP BY c.id, name, c.phone, c.email
      HAVING COUNT(*) > 1
      ORDER BY total_reservations DESC;
    `;
    const result = await con.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error loading returning boarding customers:', err);
    res.status(500).json({ error: 'Failed to load report' });
  }
});

app.get('/reports/boarding-upcoming', async (req, res) => {
  try {
    const query = `
      SELECT b.id, c.id AS customer_id,
             c.first_name || ' ' || c.last_name AS customer_name,
             d.name AS dog_name,
             b.check_in, b.check_out
      FROM boarding_appointments b
      JOIN customers c ON b.customer_id = c.id
      JOIN dogs d ON b.dog_id = d.id
      WHERE b.check_in >= CURRENT_DATE
      ORDER BY b.check_in ASC;
    `;
    const result = await con.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error loading upcoming boarding appointments:', err);
    res.status(500).json({ error: 'Failed to load report' });
  }
});

app.get('/reports/grooming-returning', async (req, res) => {
  try {
    const query = `
      SELECT c.id AS customer_id,
             c.first_name || ' ' || c.last_name AS name,
             c.phone,
             c.email,
             COUNT(*) AS total_appointments
      FROM customers c
      JOIN grooming_appointments g ON c.id = g.customer_id
      GROUP BY c.id, name, c.phone, c.email
      HAVING COUNT(*) > 1
      ORDER BY total_appointments DESC;
    `;
    const result = await con.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error loading grooming returning customers:', err);
    res.status(500).json({ error: 'Failed to load report' });
  }
});

app.get('/reports/grooming-upcoming', async (req, res) => {
  try {
    const query = `
      SELECT 
        g.id AS appointment_id,
        c.id AS customer_id,
        c.first_name || ' ' || c.last_name AS customer_name,
        d.name AS dog_name,
        s.name AS service_name,
        g.appointment_date,
        g.slot_time
      FROM grooming_appointments g
      JOIN customers c ON g.customer_id = c.id
      JOIN dogs d ON g.dog_id = d.id
      JOIN services s ON g.service_id = s.id
      WHERE g.appointment_date >= CURRENT_DATE
      ORDER BY g.appointment_date ASC, g.slot_time ASC;
    `;
    const result = await con.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error loading upcoming grooming appointments:', err);
    res.status(500).json({ error: 'Failed to load report' });
  }
});


app.get('/reports/products-sold-all', async (req, res) => {
  try {
    const query = `
SELECT 
  p.id AS product_id,
  p.name AS product_name,
  SUM(oi.quantity) AS total_sold
FROM order_items oi
JOIN products p ON p.id = oi.product_id
GROUP BY p.id, p.name
ORDER BY total_sold DESC;
    `;
    const result = await con.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error loading product sales (all):', err);
    res.status(500).json({ error: 'Failed to load report' });
  }
});

app.get('/reports/sales-by-category', async (req, res) => {
  try {
    const query = `
      SELECT cat.id AS category_id, cat.name AS category_name, SUM(oi.quantity) AS total_sold
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN categories cat ON cat.id = p.category_id
      GROUP BY cat.id, cat.name
      ORDER BY total_sold DESC;
    `;
    const result = await con.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error loading sales by category:', err);
    res.status(500).json({ error: 'Failed to load report' });
  }
});


app.get('/reports/referrals-comparison', async (req, res) => {
  try {
    const query = `
      SELECT cp.type AS destination_type, COUNT(*) AS total_referrals
      FROM abandoned_dog_reports r
      JOIN care_provider cp ON cp.id = r.care_provider
      GROUP BY cp.type;
    `;
    const result = await con.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error loading referrals comparison report:', err);
    res.status(500).json({ error: 'Failed to load report' });
  }
});

/*app.get('/reports/transport-counts', async (req, res) => {
  try {
    const query = `
      SELECT 
        h.id AS handler_id,
        h.name AS handler_name,
        h.phone,
        COUNT(*) AS completed_transports
      FROM abandoned_dog_reports r
      JOIN handlers h ON h.id = r.handler_id
      WHERE r.status = 'completed'
      GROUP BY h.id, h.name, h.phone
      ORDER BY completed_transports DESC;
    `;
    const result = await con.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error loading handler transport counts:', err);
    res.status(500).json({ error: 'Failed to load report' });
  }
});
*/

app.get('/reports/transport-counts', async (req, res) => {
  const period = req.query.period || 'all';

  let timeCondition = 'TRUE';
  if (period === 'today') {
    timeCondition = `r.status_updated_at::date = CURRENT_DATE`;
  } else if (period === 'week') {
    timeCondition = `r.status_updated_at >= CURRENT_DATE - INTERVAL '7 days'`;
  } else if (period === 'month') {
    timeCondition = `r.status_updated_at >= date_trunc('month', CURRENT_DATE)`;
  }

  const query = `
    SELECT h.id AS handler_id, h.name AS handler_name, h.phone,
           COUNT(*) AS completed_transports
    FROM abandoned_dog_reports r
    JOIN handlers h ON h.id = r.handler_id
    WHERE r.status = 'completed' AND ${timeCondition}
    GROUP BY h.id, h.name, h.phone
    ORDER BY completed_transports DESC;
  `;

  try {
    const result = await con.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error loading report:', err);
    res.status(500).json({ error: 'DB error' });
  }
});






app.post('/api/tours', async (req, res) => {
  const { name, phone, email } = req.body;

  try {
    const result = await con.query(
      `INSERT INTO boarding_tours (name, phone, email) VALUES ($1, $2, $3) RETURNING *`,
      [name, phone, email]
    );

    res.status(201).json({ success: true, tour: result.rows[0] });
  } catch (err) {
    console.error('Error saving tour request:', err);
    res.status(500).json({ success: false, message: 'שגיאה בשמירת הטופס' });
  }
});





//=========================TImeLine==============================

app.get('/grooming-appointments/by-date', authenticateToken, async (req, res) => {
  const selectedDate = req.query.date; // Expected format: YYYY-MM-DD

  if (!selectedDate) {
    return res.status(400).json({ message: 'Missing date parameter' });
  }

  try {
    const query = `
      SELECT 
        ga.id,
        ga.appointment_date,
        ga.slot_time,
        ga.status,
        s.name AS service_name,
        s.duration,
        d.name AS dog_name
      FROM grooming_appointments ga
      JOIN services s ON ga.service_id = s.id
      JOIN dogs d ON ga.dog_id = d.id
      WHERE ga.appointment_date = $1
      ORDER BY ga.slot_time ASC
    `;

    const result = await con.query(query, [selectedDate]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching grooming appointments:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


//orders 
/*app.get('/api/orders/by-date', authenticateToken, async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Missing date parameter' });
  }

  try {
    const sql = `
      SELECT 
        o.id,
        (c.first_name || ' ' || c.last_name) AS customer_name,
        to_char(o.order_date::date, 'YYYY-MM-DD') AS date,
        ROUND(SUM(oi.quantity * oi.unit_price)::numeric, 2) AS total
      FROM orders o
      JOIN customers c   ON c.id = o.customer_id
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.order_date::date = $1::date
      GROUP BY o.id, customer_name, o.order_date
      ORDER BY o.order_date DESC;
    `;
    const { rows } = await con.query(sql, [date]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching orders summary:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2) GET /api/orders/:id/items
//    returns an array of { product_id, product_name, quantity, unit_price }
app.get('/api/orders/:id/items', authenticateToken, async (req, res) => {
  const orderId = req.params.id;
  try {
    const sql = `
      SELECT 
        oi.product_id,
        p.name       AS product_name,
        oi.quantity,
        oi.unit_price
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.id;
    `;
    const { rows } = await con.query(sql, [orderId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching order items:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// (Optional) 3) GET /api/orders/stats?date=YYYY-MM-DD
//    returns { total, pending, completed, cancelled, revenue }
app.get('/api/orders/stats', authenticateToken, async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Missing date parameter' });

  try {
    const statsSql = `
      SELECT
        COUNT(*) FILTER (WHERE o.status = 'pending')   AS pending,
        COUNT(*) FILTER (WHERE o.status = 'completed') AS completed,
        COUNT(*) FILTER (WHERE o.status = 'cancelled') AS cancelled,
        COUNT(*)                                       AS total,
        COALESCE(SUM(oi.quantity * oi.unit_price),0)   AS revenue
      FROM orders o
      LEFT JOIN order_items oi 
        ON oi.order_id = o.id
      WHERE o.order_date::date = $1::date;
    `;
    const { rows } = await con.query(statsSql, [date]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching order stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});*/
// GET /api/orders
// server.js (or wherever your routes live)

app.get('/api/orders/:id/full', authenticateToken, async (req, res) => {
  const orderId = req.params.id;
  try {
    const sql = `
      SELECT
        o.id,
        to_char(o.created_at,       'YYYY-MM-DD HH24:MI') AS created_at,
        o.payment_method,
        o.total,
        
        /* customer */
        c.first_name  || ' ' || c.last_name AS customer_name,
        c.phone AS customer_phone,
        c.email AS customer_email,
        
        /* shipping address */
        a.label      AS address_label,
        a.city,
        a.street,
        a.house_number,
        a.zip,
        
        /* line-items as JSON array */
        json_agg(
          json_build_object(
            'product_id',   oi.product_id,
            'product_name', p.name,
            'quantity',     oi.quantity,
            'unit_price',   oi.unit_price,
            'line_total',   ROUND(oi.quantity * oi.unit_price::numeric, 2)
          )
        ) FILTER (WHERE oi.id IS NOT NULL) AS items

      FROM orders o
      JOIN customers c   ON c.id = o.customer_id
      JOIN addresses a   ON a.id = o.address_id
      LEFT JOIN order_items oi
        ON oi.order_id = o.id
      LEFT JOIN products p
        ON p.id = oi.product_id

      WHERE o.id = $1
      GROUP BY
        o.id, o.created_at, o.payment_method, o.total,
        c.first_name, c.last_name, c.phone, c.email,
        a.label, a.city, a.street, a.house_number, a.zip;
    `;
    const { rows } = await con.query(sql, [orderId]);
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching full order:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/orders
// — returns [{ id, date, status, customer_name, total }, …]
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const sql = `
      SELECT
        o.id,
        to_char(o.created_at::date, 'YYYY-MM-DD') AS date,
        o.status,
        (c.first_name || ' ' || c.last_name) AS customer_name,
        ROUND(SUM(oi.quantity * oi.unit_price)::numeric, 2) AS total
      FROM orders o
      JOIN customers c     ON c.id = o.customer_id
      LEFT JOIN order_items oi
        ON oi.order_id = o.id
      GROUP BY o.id, o.created_at, o.status, c.first_name, c.last_name
      ORDER BY o.created_at DESC, o.id;
    `;
    const { rows } = await con.query(sql);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

// PATCH /api/orders/:id/status
// Body JSON: { status: "pending" }
app.patch('/api/orders/:id/status', authenticateToken, async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  const allowed = ['new','pending','on_the_way','cancelled','completed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    await con.query(
      'UPDATE orders SET status = $1 WHERE id = $2',
      [status, orderId]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to update status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// in server.js, alongside your other /api/orders routes:
app.get('/api/orders/status-counts', authenticateToken, async (req, res) => {
  try {
    const sql = `
      SELECT
        COALESCE(SUM(CASE WHEN status = 'new'         THEN 1 ELSE 0 END), 0)::int AS new_count,
        COALESCE(SUM(CASE WHEN status = 'pending'     THEN 1 ELSE 0 END), 0)::int AS pending_count,
        COALESCE(SUM(CASE WHEN status = 'on_the_way'  THEN 1 ELSE 0 END), 0)::int AS on_the_way_count,
        COALESCE(SUM(CASE WHEN status = 'cancelled'   THEN 1 ELSE 0 END), 0)::int AS cancelled_count
      FROM orders;
    `;
    const { rows } = await con.query(sql);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching status counts:', err);
    res.status(500).json({ error: 'Server error fetching counts' });
  }
});

// GET /api/orders/by-status?status=...
app.get('/api/orders/by-status', authenticateToken, async (req, res) => {
  const { status } = req.query;
  if (!status) {
    return res.status(400).json({ error: 'Missing status query parameter' });
  }

  // Only allow your five statuses
  const allowed = ['new','pending','on_the_way','cancelled','completed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const sql = `
      SELECT
        o.id,
        to_char(o.created_at::date, 'YYYY-MM-DD') AS date,
        o.status,
        (c.first_name || ' ' || c.last_name) AS customer_name,
        ROUND(SUM(oi.quantity * oi.unit_price)::numeric, 2) AS total
      FROM orders o
      JOIN customers c     ON c.id = o.customer_id
      LEFT JOIN order_items oi
        ON oi.order_id = o.id
      WHERE o.status = $1
      GROUP BY o.id, o.created_at, o.status, c.first_name, c.last_name
      ORDER BY o.created_at DESC, o.id;
    `;
    const { rows } = await con.query(sql, [status]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching orders by status:', err);
    res.status(500).json({ error: 'Server error fetching filtered orders' });
  }
});

// GET /api/customers/me/boarding/next
app.get('/api/customers/me/boarding/next', authenticateToken, async (req, res) => {
  const customerId = req.user.userId;     
  try {
    const { rows } = await con.query(`
      SELECT
        br.id,
        br.check_in       AS startDate,
        (br.check_out - br.check_in) AS durationDays,
        d.name              AS dogName,
        br.status
      FROM boarding_appointments br
      LEFT JOIN dogs d ON br.dog_id = d.id
      WHERE br.customer_id = $1
        AND br.check_in >= CURRENT_DATE
        AND br.status != 'cancelled'
      ORDER BY br.check_in
      LIMIT 1
    `, [customerId]);

    res.json(rows[0] || null);
  } catch (err) {
    console.error('Error fetching next boarding:', err);
    res.status(500).json({ error: err.message });
  }
});


//module.exports = router;
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
