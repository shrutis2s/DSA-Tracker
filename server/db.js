// const mysql= require('mysql2');
// const db=mysql.createConnection({
//     host:'localhost',
//     user:'root',
//     password:'shruti5R*',
//     database:'dsa_tracker'
// });

// db.connect((err)=>{
//     if(err){
//         console.error('Error connecting to MySQL:', err);
//         return;
//     }
//     console.log('Connected to MySQL database');
// });

// module.exports=db;

//TELLS THE CODE TO USE SSL->REQUIRED FOR CLOUD SECURITY
const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false // This is required for TiDB Cloud connections
    }
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to Cloud Database successfully!');
});

module.exports = db;