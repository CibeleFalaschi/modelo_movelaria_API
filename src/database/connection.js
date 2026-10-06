require('dotenv').config();

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'modelo_movelaria',
  waitForConnections: true,
  // Colunas DATE voltam como 'YYYY-MM-DD' (sem virar Date/UTC, o que deslocava o dia no JSON).
  dateStrings: ['DATE'],
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
