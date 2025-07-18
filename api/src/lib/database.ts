import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DATABASE || 'portfolio',
  waitForConnections: true,
  connectionLimit: 20, // Maximum number of connections in the pool
  queueLimit: 10, // Maximum number of connection requests queued
  // MySQL2 compatible timeout settings
  acquireTimeout: 60000, // Timeout for getting a connection from the pool
  timeout: 60000, // Query timeout
  // Connection pool settings
  idleTimeout: 30000, // Close idle connections after 30 seconds
  // Remove invalid options that cause warnings
  // acquireTimeoutMillis: 60000,  // Invalid for mysql2
  // connectionTimeoutMillis: 60000, // Invalid for mysql2
  // maxIdle: 10, // Invalid for mysql2
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Execute query with error handling
export async function executeQuery(query: string, params: any[] = []) {
  let connection;
  try {
    // Get connection from pool
    connection = await pool.getConnection();
    
    // Log connection status for debugging
    console.log(`🔗 DB Connection - Executing query: ${query.substring(0, 50)}...`);
    
    const [rows] = await connection.execute(query, params);
    return { success: true, data: rows };
  } catch (error) {
    console.error('Database query error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  } finally {
    // Always release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
}

// Execute transaction
export async function executeTransaction(queries: { query: string; params?: any[] }[]) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params = [] } of queries) {
      const [rows] = await connection.execute(query, params);
      results.push(rows);
    }
    
    await connection.commit();
    return { success: true, data: results };
  } catch (error) {
    await connection.rollback();
    console.error('Transaction error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Transaction failed' };
  } finally {
    connection.release();
  }
}

// Monitor connection pool status
export function getPoolStatus() {
  return {
    config: {
      connectionLimit: dbConfig.connectionLimit,
      queueLimit: dbConfig.queueLimit
    }
  };
}

// Log pool status every 30 seconds for debugging
// setInterval(() => {
//   const status = getPoolStatus();
//   // console.log('📊 DB Pool Status:', status);
// }, 30000);

export default pool; 