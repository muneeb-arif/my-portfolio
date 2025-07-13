import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT) || 8889,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DATABASE || 'portfolio',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  charset: 'utf8mb4'
};

// Create connection pool
let pool = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// Execute query with error handling
export async function executeQuery(query, params = []) {
  const connection = getPool();
  
  try {
    const [rows] = await connection.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error(`Database error: ${error.message}`);
  }
}

// Get single record
export async function findOne(query, params = []) {
  const rows = await executeQuery(query, params);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

// Get multiple records
export async function findMany(query, params = []) {
  const rows = await executeQuery(query, params);
  return Array.isArray(rows) ? rows : [];
}

// Insert record and return inserted ID
export async function insertRecord(table, data) {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = values.map(() => '?').join(', ');
  
  const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
  const result = await executeQuery(query, values);
  
  return result.insertId;
}

// Update record
export async function updateRecord(table, data, whereClause, whereParams = []) {
  const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = Object.values(data);
  
  const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  const result = await executeQuery(query, [...values, ...whereParams]);
  
  return result.affectedRows;
}

// Delete record
export async function deleteRecord(table, whereClause, whereParams = []) {
  const query = `DELETE FROM ${table} WHERE ${whereClause}`;
  const result = await executeQuery(query, whereParams);
  
  return result.affectedRows;
}

// Test database connection
export async function testConnection() {
  try {
    const connection = getPool();
    await connection.execute('SELECT 1');
    return { success: true, message: 'Database connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Get database status
export async function getDatabaseStatus() {
  try {
    const tables = [
      'users', 'projects', 'categories', 'settings', 
      'domains_technologies', 'tech_skills', 'niche',
      'automatic_update_capabilities', 'theme_clients'
    ];
    
    const status = {};
    
    for (const table of tables) {
      try {
        const result = await executeQuery(`SELECT COUNT(*) as count FROM ${table}`);
        status[table] = result[0]?.count || 0;
      } catch (error) {
        status[table] = `Error: ${error.message}`;
      }
    }
    
    return status;
  } catch (error) {
    throw new Error(`Failed to get database status: ${error.message}`);
  }
}

// Close pool connection
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
} 