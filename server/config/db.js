
const mysql = require("mysql2/promise");
const fs = require("fs");
require("dotenv").config();

const sslCaPath = process.env.DB_SSL_CA_PATH;

if (!sslCaPath) {
  throw new Error("DB_SSL_CA_PATH is missing.");
}

if (!fs.existsSync(sslCaPath)) {
  throw new Error("Database CA certificate not found.");
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Secure Aiven connection
  ssl: {
    ca: fs.readFileSync(sslCaPath),
    rejectUnauthorized: true,
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  connectTimeout: 20000,
});

async function testConnection() {
  const connection = await pool.getConnection();

  try {
    await connection.query("SELECT 1");
    console.log("ScrollTheory MySQL Connected!");
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  testConnection,
};
