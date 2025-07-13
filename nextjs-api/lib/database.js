const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT) || 8889,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DATABASE || 'portfolio',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

function createPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('🔧 Database pool created for:', dbConfig.database);
  }
  return pool;
}

async function query(sql, params) {
  try {
    const pool = createPool();
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Query first row only (used by auth functions)
async function queryFirst(sql, params) {
  try {
    const rows = await query(sql, params);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Database queryFirst error:', error);
    throw error;
  }
}

async function testConnection() {
  try {
    const pool = createPool();
    const [rows] = await pool.execute('SELECT 1 as test');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

module.exports = {
  createPool,
  query,
  queryFirst,
  testConnection
}; 