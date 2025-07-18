#!/usr/bin/env node

/**
 * Setup script for Shared Hosting Updates MySQL Schema
 * Creates the necessary tables for the shared hosting update system
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 8889,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DATABASE || 'portfolio',
  multipleStatements: true
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function setupDatabase() {
  log('🚀 Setting up Shared Hosting Updates MySQL Schema', 'blue');
  log('================================================', 'blue');
  
  let connection;
  
  try {
    // Connect to database
    log('\n🔌 Connecting to MySQL database...', 'yellow');
    connection = await mysql.createConnection(dbConfig);
    log('✅ Connected to MySQL database', 'green');
    
    // Read SQL schema file
    const schemaPath = path.join(__dirname, '..', 'sql', 'shared-hosting-updates-mysql-simple.sql');
    log('\n📖 Reading schema file...', 'yellow');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    log('✅ Schema file loaded', 'green');
    
    // Execute schema
    log('\n🔧 Executing schema...', 'yellow');
    await connection.execute(schema);
    log('✅ Schema executed successfully', 'green');
    
    // Verify tables were created
    log('\n🔍 Verifying tables...', 'yellow');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN (
        'shared_hosting_updates',
        'shared_hosting_clients', 
        'shared_hosting_update_logs',
        'shared_hosting_notifications',
        'shared_hosting_update_stats'
      )
    `, [dbConfig.database]);
    
    log(`✅ Found ${tables.length} tables:`, 'green');
    tables.forEach(table => {
      log(`  - ${table.TABLE_NAME}`, 'yellow');
    });
    
    // Test insert a sample update
    log('\n🧪 Testing sample data insertion...', 'yellow');
    const [users] = await connection.execute('SELECT id FROM users WHERE email = ? LIMIT 1', ['muneebarif11@gmail.com']);
    
    if (users.length > 0) {
      const userId = users[0].id;
      const sampleUpdate = {
        id: require('crypto').randomUUID(),
        created_by: userId,
        version: '1.0.0',
        title: 'Initial Setup',
        description: 'Initial setup of the shared hosting update system',
        package_url: 'https://example.com/updates/v1.0.0.zip',
        is_active: true,
        channel: 'stable'
      };
      
      await connection.execute(`
        INSERT INTO shared_hosting_updates (id, created_by, version, title, description, package_url, is_active, channel)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [sampleUpdate.id, sampleUpdate.created_by, sampleUpdate.version, sampleUpdate.title, 
           sampleUpdate.description, sampleUpdate.package_url, sampleUpdate.is_active, sampleUpdate.channel]);
      
      log('✅ Sample update created successfully', 'green');
    } else {
      log('⚠️ No user found for sample data, skipping...', 'yellow');
    }
    
    log('\n🎉 Shared Hosting Updates MySQL setup completed successfully!', 'green');
    log('================================================', 'blue');
    log('\n📋 Next steps:', 'blue');
    log('1. Start your Next.js API server: npm run dev (in api directory)', 'yellow');
    log('2. Test the API endpoints using the test script', 'yellow');
    log('3. Access the dashboard to create and manage updates', 'yellow');
    
  } catch (error) {
    log(`\n❌ Setup failed: ${error.message}`, 'red');
    log('\n🔧 Troubleshooting:', 'blue');
    log('- Check your MySQL connection settings in .env', 'yellow');
    log('- Ensure MySQL server is running', 'yellow');
    log('- Verify database exists and user has permissions', 'yellow');
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      log('\n🔌 Database connection closed', 'yellow');
    }
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase().catch(error => {
    log(`\n💥 Setup failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { setupDatabase }; 