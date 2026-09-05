const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'meditrack',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  timezone: '+08:00'
});

const promisePool = pool.promise();

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL Connection Error:', err.message);
  } else {
    console.log('✅ Connected to MySQL MediTrack Database successfully.');
    connection.release();
  }
});

module.exports = promisePool;