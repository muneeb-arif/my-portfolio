#!/usr/bin/env node

/**
 * DATABASE CONNECTION TEST SCRIPT
 * 
 * This script tests connections to both Supabase and MySQL databases
 * to ensure everything is configured correctly before running the migration.
 * 
 * Usage:
 * node scripts/test-connections.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');

// Configuration from environment variables
const config = {
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL,
    key: process.env.REACT_APP_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    charset: 'utf8mb4',
    timezone: '+00:00'
  }
};

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  if (!config.supabase.url || (!config.supabase.key && !config.supabase.serviceKey)) {
    console.error('❌ Supabase configuration missing');
    return false;
  }
  
  try {
    const supabaseKey = config.supabase.serviceKey || config.supabase.key;
    const supabase = createClient(config.supabase.url, supabaseKey);
    
    // Test basic query
    const { data, error } = await supabase
      .from('projects')
      .select('count', { count: 'exact', head: true });
      
    if (error) {
      console.error('❌ Supabase query failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    console.log(`   📊 Found ${data?.length || 0} projects in database`);
    
    // Test table access
    const tables = ['projects', 'categories', 'project_images', 'settings'];
    for (const table of tables) {
      const { data: tableData, error: tableError } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
        
      if (tableError) {
        console.warn(`   ⚠️  Warning: Cannot access table '${table}': ${tableError.message}`);
      } else {
        console.log(`   ✅ Table '${table}' accessible`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error.message);
    return false;
  }
}

async function testMySQLConnection() {
  console.log('\n🔍 Testing MySQL connection...');
  
  if (!config.mysql.host || !config.mysql.user || !config.mysql.password || !config.mysql.database) {
    console.error('❌ MySQL configuration incomplete');
    console.error('   Required: MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE');
    return false;
  }
  
  let connection;
  try {
    connection = await mysql.createConnection(config.mysql);
    
    // Test basic connection
    await connection.execute('SELECT 1 as test');
    console.log('✅ MySQL connection successful');
    
    // Test database exists
    const [rows] = await connection.execute(
      'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
      [config.mysql.database]
    );
    
    if (rows.length === 0) {
      console.error(`❌ Database '${config.mysql.database}' does not exist`);
      return false;
    }
    
    console.log(`✅ Database '${config.mysql.database}' exists`);
    
    // Test required tables exist
    const requiredTables = [
      'users', 'portfolio_config', 'projects', 'categories', 
      'project_images', 'settings', 'technologies'
    ];
    
    for (const table of requiredTables) {
      const [tableRows] = await connection.execute(
        'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
        [config.mysql.database, table]
      );
      
      if (tableRows.length === 0) {
        console.error(`❌ Required table '${table}' does not exist`);
        console.error('   Please run the MySQL schema script first: mysql_database_schema.sql');
        return false;
      } else {
        console.log(`   ✅ Table '${table}' exists`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ MySQL connection error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   💡 Make sure MySQL server is running');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   💡 Check your MySQL username and password');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   💡 Database does not exist, create it first');
    }
    
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function runTests() {
  console.log('🧪 Database Connection Tests\n');
  console.log('Configuration:');
  console.log(`   Supabase URL: ${config.supabase.url || 'NOT SET'}`);
  console.log(`   Supabase Key: ${config.supabase.key ? 'SET' : 'NOT SET'}`);
  console.log(`   Supabase Service Key: ${config.supabase.serviceKey ? 'SET' : 'NOT SET'}`);
  console.log(`   MySQL Host: ${config.mysql.host}:${config.mysql.port}`);
  console.log(`   MySQL Database: ${config.mysql.database || 'NOT SET'}`);
  console.log(`   MySQL User: ${config.mysql.user || 'NOT SET'}`);
  console.log(`   MySQL Password: ${config.mysql.password ? 'SET' : 'NOT SET'}\n`);
  
  const supabaseOk = await testSupabaseConnection();
  const mysqlOk = await testMySQLConnection();
  
  console.log('\n📋 Test Results:');
  console.log(`   Supabase: ${supabaseOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   MySQL: ${mysqlOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (supabaseOk && mysqlOk) {
    console.log('\n🎉 All tests passed! You can now run the migration:');
    console.log('   npm run migrate');
  } else {
    console.log('\n❌ Some tests failed. Please fix the issues above before running migration.');
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testSupabaseConnection, testMySQLConnection }; 