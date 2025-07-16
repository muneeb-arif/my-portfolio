import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DATABASE || 'portfolio',
  waitForConnections: true,
  connectionLimit: 20, // Increased from 10
  queueLimit: 10, // Added queue limit
  // MySQL2 compatible timeout settings
  acquireTimeoutMillis: 60000,
  connectionTimeoutMillis: 60000,
  // Connection pool settings
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  maxIdle: 10, // Maximum number of idle connections
  // Remove invalid options
  // acquireTimeout: 60000,  // Invalid for mysql2
  // timeout: 60000,         // Invalid for mysql2  
  // reconnect: true,        // Invalid for mysql2
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
    console.log(`🔗 DB Connection - Active: ${pool.pool._allConnections.length}, Idle: ${pool.pool._freeConnections.length}, Pending: ${pool.pool._connectionQueue.length}`);
    
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
    allConnections: pool.pool._allConnections.length,
    freeConnections: pool.pool._freeConnections.length,
    pendingConnections: pool.pool._connectionQueue.length,
    config: {
      connectionLimit: dbConfig.connectionLimit,
      queueLimit: dbConfig.queueLimit
    }
  };
}

// Log pool status every 30 seconds for debugging
setInterval(() => {
  const status = getPoolStatus();
  console.log('📊 DB Pool Status:', status);
}, 30000);

export default pool; 