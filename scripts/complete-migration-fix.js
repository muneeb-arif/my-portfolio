#!/usr/bin/env node

/**
 * COMPLETE MIGRATION FIX SCRIPT
 * 
 * This script:
 * 1. Creates all 15 missing tables (automation & theme systems)
 * 2. Fixes the 3 empty tables that should have data
 * 3. Migrates ALL data from Supabase to MySQL properly
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');

// Correct MySQL settings
const config = {
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL,
    key: process.env.REACT_APP_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  mysql: {
    host: 'localhost',
    port: 8889,
    user: 'root',
    password: 'root',
    database: 'portfolio',
    charset: 'utf8mb4'
  }
};

let supabase;
let mysqlConnection;

// Utility functions
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function convertArrayToJSON(arr) {
  if (!arr) return null;
  if (typeof arr === 'string') {
    if (arr.startsWith('{') && arr.endsWith('}')) {
      return JSON.stringify(arr.slice(1, -1).split(',').map(item => item.trim()));
    }
    return arr;
  }
  if (Array.isArray(arr)) {
    return JSON.stringify(arr);
  }
  return JSON.stringify(arr);
}

function convertPostgreSQLTimestamp(timestamp) {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function sanitizeText(text) {
  if (!text) return null;
  if (typeof text !== 'string') return text;
  
  try {
    return text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') 
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') 
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') 
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') 
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') 
      .trim();
  } catch (error) {
    return text.replace(/[^\x00-\x7F]/g, '').trim();
  }
}

async function initializeConnections() {
  console.log('🔌 Initializing connections...');
  
  // Supabase
  const supabaseKey = config.supabase.serviceKey || config.supabase.key;
  supabase = createClient(config.supabase.url, supabaseKey);
  
  // MySQL
  mysqlConnection = await mysql.createConnection(config.mysql);
  await mysqlConnection.execute('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
  
  console.log('✅ Connections established');
}

async function createMissingTables() {
  console.log('🏗️  Creating missing tables...');
  
  const tableCreationQueries = [
    // Automatic update capabilities
    `CREATE TABLE IF NOT EXISTS automatic_update_capabilities (
      id VARCHAR(36) PRIMARY KEY,
      client_id VARCHAR(255) NOT NULL,
      domain VARCHAR(255) NOT NULL,
      supports_automatic BOOLEAN DEFAULT FALSE,
      endpoint_url VARCHAR(500) NOT NULL,
      api_key_hash VARCHAR(255),
      last_capability_check TIMESTAMP,
      php_version VARCHAR(50),
      server_info JSON,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    
    // Automatic update client performance
    `CREATE TABLE IF NOT EXISTS automatic_update_client_performance (
      client_id VARCHAR(255) PRIMARY KEY,
      domain VARCHAR(255) NOT NULL,
      supports_automatic BOOLEAN DEFAULT FALSE,
      total_attempts INT DEFAULT 0,
      successful_updates INT DEFAULT 0,
      failed_updates INT DEFAULT 0,
      success_rate INT DEFAULT 0,
      avg_execution_time_ms INT,
      last_update_attempt TIMESTAMP NULL
    )`,
    
    // Automatic update logs
    `CREATE TABLE IF NOT EXISTS automatic_update_logs (
      id VARCHAR(36) PRIMARY KEY,
      update_id VARCHAR(36),
      client_id VARCHAR(255),
      domain VARCHAR(255),
      version VARCHAR(50),
      status VARCHAR(50),
      log_message TEXT,
      execution_time_ms INT,
      error_details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Automatic update performance
    `CREATE TABLE IF NOT EXISTS automatic_update_performance (
      id VARCHAR(36) PRIMARY KEY,
      update_id VARCHAR(36),
      client_id VARCHAR(255),
      domain VARCHAR(255),
      start_time TIMESTAMP,
      end_time TIMESTAMP,
      execution_time_ms INT,
      success BOOLEAN DEFAULT FALSE,
      error_message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Recent automatic activity
    `CREATE TABLE IF NOT EXISTS recent_automatic_activity (
      id VARCHAR(36) PRIMARY KEY,
      update_id VARCHAR(36),
      version VARCHAR(50) NOT NULL,
      update_title VARCHAR(255) NOT NULL,
      client_id VARCHAR(255) NOT NULL,
      domain VARCHAR(255) NOT NULL,
      activity VARCHAR(255) NOT NULL,
      success BOOLEAN DEFAULT FALSE,
      execution_time_ms INT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      supports_automatic BOOLEAN
    )`,
    
    // Shared hosting clients
    `CREATE TABLE IF NOT EXISTS shared_hosting_clients (
      id VARCHAR(36) PRIMARY KEY,
      client_id VARCHAR(255) UNIQUE NOT NULL,
      domain VARCHAR(255) NOT NULL,
      current_version VARCHAR(50) NOT NULL,
      deployment_type VARCHAR(50) DEFAULT 'shared_hosting',
      hosting_provider VARCHAR(100),
      cpanel_info JSON,
      last_seen TIMESTAMP NOT NULL,
      user_agent TEXT,
      timezone VARCHAR(50) DEFAULT 'UTC',
      contact_email VARCHAR(255),
      notes TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    
    // Shared hosting notifications
    `CREATE TABLE IF NOT EXISTS shared_hosting_notifications (
      id VARCHAR(36) PRIMARY KEY,
      client_id VARCHAR(255),
      domain VARCHAR(255),
      notification_type VARCHAR(100),
      title VARCHAR(255),
      message TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Shared hosting update logs
    `CREATE TABLE IF NOT EXISTS shared_hosting_update_logs (
      id VARCHAR(36) PRIMARY KEY,
      update_id VARCHAR(36),
      client_id VARCHAR(255),
      domain VARCHAR(255),
      version VARCHAR(50),
      status VARCHAR(50),
      log_message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Shared hosting update stats
    `CREATE TABLE IF NOT EXISTS shared_hosting_update_stats (
      id VARCHAR(36) PRIMARY KEY,
      update_id VARCHAR(36),
      total_clients INT DEFAULT 0,
      successful_updates INT DEFAULT 0,
      failed_updates INT DEFAULT 0,
      pending_updates INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Shared hosting updates
    `CREATE TABLE IF NOT EXISTS shared_hosting_updates (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      version VARCHAR(50) NOT NULL,
      files JSON,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      pushed_at TIMESTAMP NULL
    )`,
    
    // Theme clients
    `CREATE TABLE IF NOT EXISTS theme_clients (
      id VARCHAR(36) PRIMARY KEY,
      client_id VARCHAR(255) UNIQUE NOT NULL,
      domain VARCHAR(255) NOT NULL,
      current_version VARCHAR(50) NOT NULL,
      update_channel VARCHAR(20) DEFAULT 'stable',
      last_seen TIMESTAMP NOT NULL,
      last_updated TIMESTAMP NULL,
      user_agent TEXT,
      timezone VARCHAR(50) DEFAULT 'UTC',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    
    // Theme update logs
    `CREATE TABLE IF NOT EXISTS theme_update_logs (
      id VARCHAR(36) PRIMARY KEY,
      update_id VARCHAR(36),
      client_id VARCHAR(255),
      domain VARCHAR(255),
      version VARCHAR(50),
      status VARCHAR(50),
      log_message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Theme update notifications
    `CREATE TABLE IF NOT EXISTS theme_update_notifications (
      id VARCHAR(36) PRIMARY KEY,
      update_id VARCHAR(36),
      client_id VARCHAR(255),
      domain VARCHAR(255),
      notification_type VARCHAR(100),
      title VARCHAR(255),
      message TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Theme update stats
    `CREATE TABLE IF NOT EXISTS theme_update_stats (
      id VARCHAR(36) PRIMARY KEY,
      update_id VARCHAR(36),
      total_clients INT DEFAULT 0,
      successful_updates INT DEFAULT 0,
      failed_updates INT DEFAULT 0,
      pending_updates INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Theme updates
    `CREATE TABLE IF NOT EXISTS theme_updates (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      version VARCHAR(50) NOT NULL UNIQUE,
      channel VARCHAR(20) DEFAULT 'stable',
      files JSON,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      pushed_at TIMESTAMP NULL,
      download_count INT DEFAULT 0,
      success_count INT DEFAULT 0,
      failure_count INT DEFAULT 0
    )`
  ];
  
  let createdCount = 0;
  for (const query of tableCreationQueries) {
    try {
      await mysqlConnection.execute(query);
      createdCount++;
    } catch (error) {
      console.error(`❌ Error creating table: ${error.message}`);
    }
  }
  
  console.log(`✅ Created/verified ${createdCount} tables`);
}

async function migrateTableData(tableName, userMapping = false) {
  console.log(`📦 Migrating ${tableName}...`);
  
  try {
    // Get data from Supabase
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
      
    if (error) {
      console.log(`  ❌ Error fetching from Supabase: ${error.message}`);
      return 0;
    }
    
    if (!data || data.length === 0) {
      console.log(`  ⚪ No data in Supabase`);
      return 0;
    }
    
    // Clear existing data in MySQL
    await mysqlConnection.execute(`DELETE FROM ${tableName}`);
    
    let migratedCount = 0;
    
    if (userMapping) {
      // For user-specific tables, migrate for each user
      const [users] = await mysqlConnection.execute('SELECT id, email FROM users');
      
      for (const user of users) {
        for (const row of data) {
          try {
            // Create a copy for each user with new UUID
            const newRow = { ...row };
            if (newRow.id) newRow.id = generateUUID();
            if (newRow.user_id) newRow.user_id = user.id;
            
            await insertRowIntoTable(tableName, newRow);
            migratedCount++;
          } catch (error) {
            console.error(`    ❌ Error migrating row for ${user.email}: ${error.message}`);
          }
        }
      }
    } else {
      // For system tables, migrate as-is
      for (const row of data) {
        try {
          await insertRowIntoTable(tableName, row);
          migratedCount++;
        } catch (error) {
          console.error(`    ❌ Error migrating row: ${error.message}`);
        }
      }
    }
    
    console.log(`  ✅ Migrated ${migratedCount} records`);
    return migratedCount;
    
  } catch (error) {
    console.error(`  ❌ Error migrating ${tableName}: ${error.message}`);
    return 0;
  }
}

async function insertRowIntoTable(tableName, row) {
  // Convert timestamps
  const convertedRow = {};
  for (const [key, value] of Object.entries(row)) {
    if (key.includes('_at') || key.includes('timestamp')) {
      convertedRow[key] = convertPostgreSQLTimestamp(value);
    } else if (typeof value === 'string' && key !== 'id' && key !== 'client_id') {
      convertedRow[key] = sanitizeText(value);
    } else if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      convertedRow[key] = convertArrayToJSON(value);
    } else {
      convertedRow[key] = value;
    }
  }
  
  // Build insert query
  const columns = Object.keys(convertedRow);
  const values = Object.values(convertedRow);
  const placeholders = values.map(() => '?').join(', ');
  
  const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
  
  await mysqlConnection.execute(query, values);
}

async function runCompleteMigrationFix() {
  console.log('🔧 COMPLETE MIGRATION FIX STARTING\n');
  
  try {
    await initializeConnections();
    
    // Start transaction
    await mysqlConnection.beginTransaction();
    
    // Step 1: Create missing tables
    await createMissingTables();
    
    // Step 2: Migrate user-specific tables (empty ones)
    console.log('\n📊 Migrating user-specific tables...');
    let totalUserRecords = 0;
    totalUserRecords += await migrateTableData('domains_technologies', true);
    totalUserRecords += await migrateTableData('tech_skills', true);
    totalUserRecords += await migrateTableData('niche', true);
    
    // Step 3: Migrate system tables
    console.log('\n🤖 Migrating system tables...');
    let totalSystemRecords = 0;
    
    const systemTables = [
      'automatic_update_capabilities',
      'automatic_update_client_performance',
      'automatic_update_logs',
      'automatic_update_performance',
      'recent_automatic_activity',
      'shared_hosting_clients',
      'shared_hosting_notifications',
      'shared_hosting_update_logs',
      'shared_hosting_update_stats',
      'shared_hosting_updates',
      'theme_clients',
      'theme_update_logs',
      'theme_update_notifications',
      'theme_update_stats',
      'theme_updates'
    ];
    
    for (const tableName of systemTables) {
      totalSystemRecords += await migrateTableData(tableName, false);
    }
    
    // Commit transaction
    await mysqlConnection.commit();
    
    // Final verification
    console.log('\n📊 FINAL VERIFICATION:');
    const [tables] = await mysqlConnection.execute('SHOW TABLES');
    console.log(`✅ Total tables: ${tables.length}`);
    
    let totalRecords = 0;
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      const [countResult] = await mysqlConnection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      const count = countResult[0].count;
      totalRecords += count;
      
      if (count > 0) {
        console.log(`  ✅ ${tableName}: ${count} records`);
      } else {
        console.log(`  ⚪ ${tableName}: empty`);
      }
    }
    
    console.log('\n🎉 COMPLETE MIGRATION FIX SUCCESSFUL!');
    console.log(`📊 SUMMARY:`);
    console.log(`  🗂️  Total tables: ${tables.length}`);
    console.log(`  📋 Total records: ${totalRecords}`);
    console.log(`  👥 User-specific records: ${totalUserRecords}`);
    console.log(`  🤖 System records: ${totalSystemRecords}`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    
    if (mysqlConnection) {
      await mysqlConnection.rollback();
      console.log('🔄 Transaction rolled back');
    }
    
    process.exit(1);
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  runCompleteMigrationFix();
}

module.exports = { runCompleteMigrationFix }; 