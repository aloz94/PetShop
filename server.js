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

//regester route
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

      /*  app.post('/login', (logreq, logres) => {
            const { id, password } = logreq.body;
            const login_query = 'SELECT * FROM customers WHERE id = $1 AND password = $2';
        
            con.query(login_query, [id,password], (err, loginresult) => {
                if (err) {
                    console.error('Database error:', err);
                    return logres.status(500).json({ message: 'Database error' });
                }
        
                if (loginresult.rows.length === 0) {
                    return logres.status(400).json({ message: 'User not found' });
                }
        
                const user = loginresult.rows[0];
        
                if (password !== user.password) {
                    return logres.status(401).json({ message: 'Invalid credentials' });
                }
        
                //const token = `${user.id}-${Date.now()}`;

                const token = jwt.sign(
                   { userId: user.id, name: user.name }, // המידע ששומרים בטוקן
                     JWT_SECRET, // הסיסמה שלך
                     { expiresIn: '1h' } // 🔥 הוספת תוקף של שעה
                );
        
                logres.cookie('token', token, {
                    httpOnly: true,
                    secure: false,   // Set true only if you have HTTPS
                    maxAge: 60 * 60 * 1000 // 1 hour
                })
                logres.status(200) .json({ message: 'Login successful', name: user.name });
                            });
                        }); */

                        app.post('/login', (logreq, logres) => {
                          const { id, password } = logreq.body;
                        
                          // 1. מנסים קודם ב־customers
                          const customerQuery = 'SELECT id, first_name || \' \' || last_name AS name, password FROM customers WHERE id = $1';
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
                            const employeeQuery = 'SELECT id, password, role FROM employees WHERE id = $1';
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
                                );
                                logres.cookie('token', token, {
                                  httpOnly: true,
                                  secure: false,
                                  maxAge: 60 * 60 * 1000
                                });
                                return logres
                                  .status(200)
                                  .json({ message: 'Login successful', role: user.role });
                              }
                        
                              // 3. לא נמצא בשתי הטבלאות
                              return logres.status(400).json({ message: 'User not found' });
                            });
                          });
                        });
                        
                        

//  פונקציה לאימות טוקן

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

// מסלול לפרופיל
app.get('/profile', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

app.post('/logout', (req, res) => {
    res.clearCookie('token'); // 🔥 clear the token cookie
    res.status(200).json({ message: 'Logout successful' });
  });
  

  app.get('/services', async (req, res) => {
    try {
        const result = await con.query('SELECT * FROM services');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching services:', err);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});
// server.js
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


// 🔥 קבלת רשימת כלבים של הלקוח הנוכחי
/*app.get('/my-dogs', authenticateToken, async (req, res) => {
    const userId = req.user.userId; // מזהים את הלקוח מתוך הטוקן

    try {
        const result = await con.query('SELECT id, name FROM dogs WHERE customer_id = $1', [userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching dogs:', error);
        res.status(500).json({ message: 'שגיאה בקבלת כלבים' });
    }
});*/



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
  
  app.post('/grooming-appointments', authenticateToken, async (req, res) => {
    const { appointment_date, slot_time, service_id, dog_id, notes } = req.body;
    const customer_id = req.user.userId;
  
    try {
      await con.query(
        `INSERT INTO grooming_appointments (appointment_date, slot_time, service_id, dog_id, customer_id, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [appointment_date, slot_time, service_id, dog_id, customer_id, notes]
      );
  
      res.status(200).json({ message: 'התור נשמר בהצלחה!' });
    } catch (err) {
      console.error('שגיאה בהוספת תור:', err);
      res.status(500).json({ message: 'שגיאה בשמירת התור' });
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


app.post('/report-dog', authenticateToken, upload.single('image'), async (req, res) => {
    const { size, health, address, notes } = req.body;
    const customer_id = req.user.userId;
    const image_path = req.file ? req.file.filename : null;
  
    try {
      await con.query(
        `INSERT INTO abandoned_dog_reports (customer_id, dog_size, health_status, address, notes, image_path)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [customer_id, size, health, address, notes, image_path]
      );
  
      res.status(200).json({ message: 'הפנייה התקבלה בהצלחה!' });
    } catch (err) {
      console.error('שגיאה בשליחת פנייה:', err);
      res.status(500).json({ message: 'שגיאה בשמירת הפנייה' });
    }
    
  });
    
  
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

  app.post('/boarding-appointments', authenticateToken, async (req, res) => {
    const { check_in, check_out, dog_id, notes } = req.body;
    const customer_id = req.user.userId;
  
    try {
      const result = await con.query(
        `SELECT COUNT(*) FROM boarding_appointments
         WHERE ($1, $2) OVERLAPS (check_in, check_out)`,
        [check_in, check_out]
      );
  
      const activeCount = parseInt(result.rows[0].count);
      const MAX_CAPACITY = 10;
  
      if (activeCount >= MAX_CAPACITY) {
        return res.status(400).json({ message: 'אין מקום פנוי בפנסיון בתאריכים שנבחרו' });
      }
  
      await con.query(
        `INSERT INTO boarding_appointments (customer_id, dog_id, check_in, check_out, notes, status)
         VALUES ($1, $2, $3, $4, $5, 'פתוחה')`,
        [customer_id, dog_id, check_in, check_out, notes]
      );
  
      res.status(200).json({ message: 'התור נשמר בהצלחה!' });
    } catch (err) {
      console.error('שגיאה בשמירת תור:', err);
      res.status(500).json({ message: 'שגיאה בשמירת התור' });
    }
  });

// Express (server.js) – add this route:
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

// DELETE dog
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

// GET abandoned reports for current user
/*app.get('/profile/reports', authenticateToken, async (req, res) => {
  console.log("FEtching reports")
  const customer_id = req.user.userId;
  try {
    const query = `
      SELECT 
        id,
        report_date,
        dog_size   AS size,
        health_status AS health,
        address,
        notes,
        image_path
      FROM abandoned_dog_reports
      WHERE customer_id = $1
      ORDER BY report_date DESC
    `;
    const { rows } = await con.query(query, [customer_id]);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching abandoned reports:', err);
    res.status(500).json({ message: 'שגיאה בשליפת דיווחים' });
  }
});
*/
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

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});



