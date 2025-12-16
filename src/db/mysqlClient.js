const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'M1a2d3h@',
  database: 'financial_ledger',
  waitForConnections: true,
  connectionLimit: 10
});

async function getConnection() {
  return pool.getConnection();
}

module.exports = {
  pool,
  getConnection
};
