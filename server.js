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
      SELECT id, password, role
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
  { userId: user.id, role: user.role },
  JWT_SECRET,
  { expiresIn: '1h' }
);        logres.cookie('token', token, {
          httpOnly: true,
          secure: false,
          maxAge: 60 * 60 * 1000
        });
        return logres
          .status(200)
          .json({ message: 'Login successful', role: user.role });
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
    res.json({ user: req.user });
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

    // 2) Insert the new booking
    const insertRes = await con.query(
      `INSERT INTO boarding_appointments
         (customer_id, dog_id, check_in, check_out, notes, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [realCustomerId, dog_id, check_in, check_out, notes]
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
        r.image_path
      FROM abandoned_dog_reports r
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

//module.exports = router;
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
