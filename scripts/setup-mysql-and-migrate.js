#!/usr/bin/env node

/**
 * COMPLETE MYSQL SETUP AND MIGRATION SCRIPT
 * 
 * This script:
 * 1. Reads MySQL connection parameters from .env
 * 2. Executes the corrected SQL schema to create tables
 * 3. Runs the data migration from Supabase to MySQL
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configuration from environment variables
const config = {
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    charset: 'utf8mb4',
    timezone: '+00:00',
    multipleStatements: true // Allow multiple SQL statements
  }
};

let mysqlConnection;

function validateConfig() {
  const errors = [];
  
  if (!config.mysql.host) errors.push('Missing MYSQL_HOST');
  if (!config.mysql.user) errors.push('Missing MYSQL_USER');
  if (!config.mysql.password) errors.push('Missing MYSQL_PASSWORD');
  if (!config.mysql.database) errors.push('Missing MYSQL_DATABASE');
  
  if (errors.length > 0) {
    console.error('❌ Configuration errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    console.error('\nPlease set the required environment variables and try again.');
    process.exit(1);
  }
}

async function initializeConnection() {
  console.log('🔌 Connecting to MySQL database...');
  
  try {
    mysqlConnection = await mysql.createConnection(config.mysql);
    await mysqlConnection.execute('SELECT 1');
    
    // Ensure proper character set for emojis and special characters
    await mysqlConnection.execute('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
    await mysqlConnection.execute('SET CHARACTER SET utf8mb4');
    await mysqlConnection.execute('SET character_set_connection=utf8mb4');
    
    console.log(`✅ Connected to MySQL database: ${config.mysql.database}`);
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1);
  }
}

async function executeSqlSchema() {
  console.log('📋 Reading and executing MySQL schema...');
  
  try {
    // Read the corrected schema file
    const schemaPath = path.join(__dirname, '..', 'mysql_corrected_schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ Schema file not found: ${schemaPath}`);
      process.exit(1);
    }
    
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the SQL into individual statements (removing comments and empty lines)
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      .filter(stmt => !stmt.match(/^\/\*[\s\S]*?\*\/$/)); // Remove block comments
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    let executedCount = 0;
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          // Skip DELIMITER statements as they're not needed in Node.js
          if (statement.includes('DELIMITER')) {
            continue;
          }
          
          await mysqlConnection.execute(statement);
          executedCount++;
          
          // Show progress for important statements
          if (statement.toLowerCase().includes('create table')) {
            const tableName = statement.match(/create table (?:if not exists\s+)?`?(\w+)`?/i)?.[1];
            console.log(`  ✅ Created table: ${tableName}`);
          } else if (statement.toLowerCase().includes('create function')) {
            console.log(`  ✅ Created function`);
          } else if (statement.toLowerCase().includes('create view')) {
            const viewName = statement.match(/create (?:or replace\s+)?view\s+`?(\w+)`?/i)?.[1];
            console.log(`  ✅ Created view: ${viewName}`);
          }
        } catch (error) {
          // Log non-critical errors but continue
          if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
              error.code === 'ER_DUP_KEYNAME' ||
              error.message.includes('already exists')) {
            console.log(`  ⚠️  Skipped (already exists): ${statement.substring(0, 50)}...`);
          } else {
            console.warn(`  ⚠️  Warning executing statement: ${error.message}`);
            console.warn(`     Statement: ${statement.substring(0, 100)}...`);
          }
        }
      }
    }
    
    console.log(`✅ Schema setup complete! Executed ${executedCount} statements successfully`);
    
  } catch (error) {
    console.error('❌ Error executing schema:', error.message);
    throw error;
  }
}

async function runDataMigration() {
  console.log('\n🚀 Starting data migration from Supabase to MySQL...');
  
  try {
    // Close current connection as migration script will create its own
    await mysqlConnection.end();
    
    // Import and run the migration script
    const { runMigration } = require('./migrate-to-mysql-v2.js');
    await runMigration();
    
  } catch (error) {
    console.error('❌ Data migration failed:', error.message);
    throw error;
  }
}

async function showTableStatus() {
  console.log('\n📊 Checking database status...');
  
  try {
    // Reconnect to check status
    mysqlConnection = await mysql.createConnection(config.mysql);
    
    // Get table list
    const [tables] = await mysqlConnection.execute('SHOW TABLES');
    console.log(`\n📋 Database contains ${tables.length} tables:`);
    
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      
      try {
        const [countResult] = await mysqlConnection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = countResult[0].count;
        console.log(`  - ${tableName}: ${count} records`);
      } catch (error) {
        console.log(`  - ${tableName}: Could not count records`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking database status:', error.message);
  }
}

async function main() {
  console.log('🔧 MySQL Database Setup and Migration Tool\n');
  
  try {
    // Step 1: Validate configuration
    validateConfig();
    
    // Step 2: Connect to MySQL
    await initializeConnection();
    
    // Step 3: Execute schema
    await executeSqlSchema();
    
    // Step 4: Run data migration
    await runDataMigration();
    
    // Step 5: Show final status
    await showTableStatus();
    
    console.log('\n🎉 Complete setup and migration finished successfully!');
    console.log('\nNext steps:');
    console.log('1. ✅ MySQL database schema is set up');
    console.log('2. ✅ Data migrated from Supabase');
    console.log('3. 🔄 Update your application to use MySQL');
    console.log('4. 🧪 Test all functionality with the new database');
    
  } catch (error) {
    console.error('\n❌ Setup and migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (mysqlConnection) {
      try {
        await mysqlConnection.end();
      } catch (error) {
        // Ignore connection close errors
      }
    }
  }
}

// Run the main function if called directly
if (require.main === module) {
  main();
}

module.exports = { main }; 