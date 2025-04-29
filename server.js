console.log("Backend server is running ");    
const express = require('express');
const cors = require('cors'); // Import the cors package
const cookieParser = require('cookie-parser');
const path = require('path');
const {Client} = require('pg');

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


        app.post('/login', (logreq, logres) => {
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
                        });
                        

// Middleware לבדוק טוקן
/*function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401); // אין טוקן

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // טוקן לא תקין או פג
        req.user = user;
        next();
    });
}
*/

function authenticateToken(req, res, next) {
    let token;

    // קודם לבדוק אם יש Authorization Header
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.cookies.token) {
        // 🔥 אם אין Authorization - לבדוק בקוקי!
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


// 🔥 קבלת רשימת כלבים של הלקוח הנוכחי
app.get('/my-dogs', authenticateToken, async (req, res) => {
    const userId = req.user.userId; // מזהים את הלקוח מתוך הטוקן

    try {
        const result = await con.query('SELECT id, name FROM dogs WHERE customer_id = $1', [userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching dogs:', error);
        res.status(500).json({ message: 'שגיאה בקבלת כלבים' });
    }
});


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
  

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});


