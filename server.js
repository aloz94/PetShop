console.log("Backend server is running ");    
const {Client} = require('pg');
const express = require('express');
const cors = require('cors'); // Import the cors package

//log in 
//const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'MyProjectJWT!2025_Secret_Key!';


const app=express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());


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
        
                logres.status(200).json({
                    message: 'Login successful',
                    token: token,
                    name: user.name
                });
            });
        });
        

// Middleware לבדוק טוקן
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401); // אין טוקן

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // טוקן לא תקין או פג
        req.user = user;
        next();
    });
}

// מסלול לפרופיל
app.get('/profile', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});


app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});



//login route first version
/*app.post('/login',(logreq,logres)=>{
    const {id,password}=logreq.body;
    const login_query = 'SELECT * FROM customers WHERE id = $1 AND password = $2';
    
    con.query(login_query,[id,password],(err, loginresult) => {
        if (err) {
            console.error('Database error:', err);
            logres.status(500).json({ message: 'Error login data' });
        }
        if(loginresult.rows.length === 0) {
            return logres.status(400).json({ message: 'user not found' });//500
        }

        const user = loginresult.rows[0];
        if (password !== user.password) {
            return logres.status(401).json({ message: 'Invalid credentials' });//400
        }
       // logres.send("login successfully");//was here
       const token = `${user.id}-${Date.now()}`;
        
       logres.status(200).json({
        message: 'Login successful',
        token: token,
        name: user.name // תחזירי גם את שם המשתמש אם יש עמודה כזו
    });
});
});

       
        } else {
            console.log(loginresult);
            logres.send("login successfully");
        }*///retreave this 