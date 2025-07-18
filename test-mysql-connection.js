const mysql = require('mysql2/promise');

// Test different MySQL connection scenarios
const connectionConfigs = [
  {
    name: 'Direct connection to server IP (standard)',
    config: {
      host: '144.76.16.24',
      port: 3306,
      user: 'theexpe2_portfolio',
      password: 'ay+LtE2C*Fu5',
      database: 'theexpe2_portfolio',
      connectTimeout: 15000,
    }
  },
  {
    name: 'Connection with server hostname',
    config: {
      host: 'h40.eu.core.hostnext.net',
      port: 3306,
      user: 'theexpe2_portfolio',
      password: 'ay+LtE2C*Fu5',
      database: 'theexpe2_portfolio',
      connectTimeout: 15000,
    }
  },
  {
    name: 'Connection with SSL disabled',
    config: {
      host: '144.76.16.24',
      port: 3306,
      user: 'theexpe2_portfolio',
      password: 'ay+LtE2C*Fu5',
      database: 'theexpe2_portfolio',
      connectTimeout: 15000,
      ssl: false,
    }
  },
  {
    name: 'Connection with different port (3307)',
    config: {
      host: '144.76.16.24',
      port: 3307,
      user: 'theexpe2_portfolio',
      password: 'ay+LtE2C*Fu5',
      database: 'theexpe2_portfolio',
      connectTimeout: 15000,
    }
  },
  {
    name: 'Connection with port 33060 (MySQL X Protocol)',
    config: {
      host: '144.76.16.24',
      port: 33060,
      user: 'theexpe2_portfolio',
      password: 'ay+LtE2C*Fu5',
      database: 'theexpe2_portfolio',
      connectTimeout: 15000,
    }
  },
  {
    name: 'Connection with port 3308 (alternative)',
    config: {
      host: '144.76.16.24',
      port: 3308,
      user: 'theexpe2_portfolio',
      password: 'ay+LtE2C*Fu5',
      database: 'theexpe2_portfolio',
      connectTimeout: 15000,
    }
  },
  {
    name: 'Connection with port 3309 (alternative)',
    config: {
      host: '144.76.16.24',
      port: 3309,
      user: 'theexpe2_portfolio',
      password: 'ay+LtE2C*Fu5',
      database: 'theexpe2_portfolio',
      connectTimeout: 15000,
    }
  },
  {
    name: 'Connection with server name cl20-chx',
    config: {
      host: 'cl20-chx',
      port: 3306,
      user: 'theexpe2_portfolio',
      password: 'ay+LtE2C*Fu5',
      database: 'theexpe2_portfolio',
      connectTimeout: 15000,
    }
  }
];

async function testConnection(config, name) {
  let connection;
  
  try {
    console.log(`\n🔗 Testing: ${name}`);
    console.log(`Host: ${config.host}:${config.port}`);
    console.log(`Database: ${config.database}`);
    console.log(`User: ${config.user}`);
    
    // Create connection
    connection = await mysql.createConnection(config);
    
    console.log('✅ MySQL connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test successful:', rows);
    
    // Get MySQL version
    const [version] = await connection.execute('SELECT VERSION() as version');
    console.log('✅ MySQL version:', version[0].version);
    
    return { success: true, config };
    
  } catch (error) {
    console.error(`❌ Connection failed: ${error.message}`);
    console.error('Error code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Server refused connection - MySQL might not be running or port blocked');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('💡 Connection timeout - Check firewall or network settings');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Access denied - Check username/password');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Database does not exist');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Hostname not found - DNS resolution issue');
    }
    
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connection closed');
    }
  }
}

async function runAllTests() {
  console.log('🚀 Testing MySQL connection configurations...\n');
  
  const results = [];
  
  for (const { name, config } of connectionConfigs) {
    const result = await testConnection(config, name);
    results.push({ name, ...result });
  }
  
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length > 0) {
    console.log(`✅ ${successful.length} successful connection(s):`);
    successful.forEach(r => {
      console.log(`   - ${r.name}: ${r.config.host}:${r.config.port}`);
    });
  }
  
  if (failed.length > 0) {
    console.log(`❌ ${failed.length} failed connection(s):`);
    failed.forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
  }
  
  console.log('\n💡 Recommendations:');
  if (successful.length === 0) {
    console.log('1. Contact your hosting provider - they may not allow external MySQL connections');
    console.log('2. Ask for the specific MySQL connection details they provide');
    console.log('3. Check if they offer a different port for remote access');
    console.log('4. Consider using an SSH tunnel if you have SSH access');
    console.log('5. Look for alternative connection methods in your hosting control panel');
  } else {
    console.log('✅ Use the successful configuration for your application!');
  }
}

// Run all tests
runAllTests(); 