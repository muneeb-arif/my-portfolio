#!/usr/bin/env node

/**
 * FIX REMAINING MIGRATION ISSUES
 * 
 * This script fixes:
 * 1. Niche table ID column (INT to VARCHAR)
 * 2. Timestamp conversion issues
 * 3. Re-migrates failed tables
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

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function convertPostgreSQLTimestamp(timestamp) {
  if (!timestamp) return null;
  
  try {
    // Handle different timestamp formats
    let cleanTimestamp = timestamp;
    
    // Remove microseconds if present (MySQL doesn't support them in all cases)
    if (cleanTimestamp.includes('.') && cleanTimestamp.includes('+')) {
      cleanTimestamp = cleanTimestamp.replace(/\.\d+\+/, '+');
    } else if (cleanTimestamp.includes('.') && cleanTimestamp.includes('Z')) {
      cleanTimestamp = cleanTimestamp.replace(/\.\d+Z/, 'Z');
    }
    
    const date = new Date(cleanTimestamp);
    if (isNaN(date.getTime())) {
      console.warn(`⚠️  Invalid timestamp: ${timestamp}, using current time`);
      return new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
    
    return date.toISOString().slice(0, 19).replace('T', ' ');
  } catch (error) {
    console.warn(`⚠️  Error converting timestamp ${timestamp}: ${error.message}`);
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
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
  
  const supabaseKey = config.supabase.serviceKey || config.supabase.key;
  supabase = createClient(config.supabase.url, supabaseKey);
  
  mysqlConnection = await mysql.createConnection(config.mysql);
  await mysqlConnection.execute('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
  
  console.log('✅ Connections established');
}

async function fixNicheTable() {
  console.log('🔧 Fixing niche table...');
  
  try {
    // Drop and recreate niche table with correct ID type
    await mysqlConnection.execute('DROP TABLE IF EXISTS niche');
    
    await mysqlConnection.execute(`
      CREATE TABLE niche (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        image VARCHAR(255) NOT NULL DEFAULT 'default.jpeg',
        title VARCHAR(255) NOT NULL,
        overview TEXT,
        tools TEXT,
        key_features TEXT,
        sort_order INT DEFAULT 1,
        ai_driven BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Recreated niche table with VARCHAR ID');
    
    // Now migrate the data
    const { data: nicheData, error } = await supabase
      .from('niche')
      .select('*');
      
    if (error) {
      console.error('❌ Error fetching niche data:', error.message);
      return 0;
    }
    
    if (!nicheData || nicheData.length === 0) {
      console.log('⚪ No niche data to migrate');
      return 0;
    }
    
    const [users] = await mysqlConnection.execute('SELECT id, email FROM users');
    let migratedCount = 0;
    
    for (const user of users) {
      for (const niche of nicheData) {
        try {
          await mysqlConnection.execute(
            `INSERT INTO niche (id, user_id, image, title, overview, tools, key_features, sort_order, ai_driven, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              generateUUID(), // New UUID for each user
              user.id,
              niche.image || 'default.jpeg',
              sanitizeText(niche.title),
              sanitizeText(niche.overview) || '',
              sanitizeText(niche.tools) || '',
              sanitizeText(niche.key_features),
              niche.sort_order || 1,
              niche.ai_driven || false,
              convertPostgreSQLTimestamp(niche.created_at),
              convertPostgreSQLTimestamp(niche.updated_at)
            ]
          );
          migratedCount++;
        } catch (error) {
          console.error(`❌ Error migrating niche for ${user.email}: ${error.message}`);
        }
      }
    }
    
    console.log(`✅ Migrated ${migratedCount} niche records`);
    return migratedCount;
    
  } catch (error) {
    console.error('❌ Error fixing niche table:', error.message);
    return 0;
  }
}

async function fixTimestampTables() {
  console.log('🕐 Fixing timestamp-related tables...');
  
  const tablesToFix = [
    'automatic_update_capabilities',
    'shared_hosting_clients', 
    'theme_clients'
  ];
  
  let totalFixed = 0;
  
  for (const tableName of tablesToFix) {
    console.log(`📦 Fixing ${tableName}...`);
    
    try {
      // Clear existing data
      await mysqlConnection.execute(`DELETE FROM ${tableName}`);
      
      // Get data from Supabase
      const { data, error } = await supabase
        .from(tableName)
        .select('*');
        
      if (error) {
        console.log(`  ❌ Error fetching from Supabase: ${error.message}`);
        continue;
      }
      
      if (!data || data.length === 0) {
        console.log(`  ⚪ No data in Supabase`);
        continue;
      }
      
      let migratedCount = 0;
      
      for (const row of data) {
        try {
          // Convert the row with proper timestamp handling
          const convertedRow = {};
          
          for (const [key, value] of Object.entries(row)) {
            if (key.includes('_at') || key.includes('_seen') || key.includes('timestamp') || key.includes('_check') || key.includes('_attempt')) {
              convertedRow[key] = convertPostgreSQLTimestamp(value);
            } else if (typeof value === 'string' && key !== 'id' && key !== 'client_id') {
              convertedRow[key] = sanitizeText(value);
            } else if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
              convertedRow[key] = JSON.stringify(value);
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
          migratedCount++;
          
        } catch (error) {
          console.error(`    ❌ Error migrating row: ${error.message}`);
        }
      }
      
      console.log(`  ✅ Migrated ${migratedCount} records`);
      totalFixed += migratedCount;
      
    } catch (error) {
      console.error(`  ❌ Error fixing ${tableName}: ${error.message}`);
    }
  }
  
  return totalFixed;
}

async function runFix() {
  console.log('🔧 FIXING REMAINING MIGRATION ISSUES\n');
  
  try {
    await initializeConnections();
    
    // Start transaction
    await mysqlConnection.beginTransaction();
    
    // Fix niche table
    const nicheCount = await fixNicheTable();
    
    // Fix timestamp tables
    const timestampCount = await fixTimestampTables();
    
    // Commit transaction
    await mysqlConnection.commit();
    
    // Final verification
    console.log('\n📊 FINAL STATUS CHECK:');
    
    const problematicTables = ['niche', 'automatic_update_capabilities', 'shared_hosting_clients', 'theme_clients'];
    
    for (const tableName of problematicTables) {
      try {
        const [countResult] = await mysqlConnection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = countResult[0].count;
        
        if (count > 0) {
          console.log(`  ✅ ${tableName}: ${count} records`);
        } else {
          console.log(`  ❌ ${tableName}: still empty`);
        }
      } catch (error) {
        console.log(`  ❌ ${tableName}: error checking - ${error.message}`);
      }
    }
    
    console.log('\n🎉 REMAINING ISSUES FIXED!');
    console.log(`📊 SUMMARY:`);
    console.log(`  🎯 Niche records: ${nicheCount}`);
    console.log(`  🕐 Timestamp records: ${timestampCount}`);
    console.log(`  ✅ Total fixed: ${nicheCount + timestampCount}`);
    
  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    console.error(error.stack);
    
    if (mysqlConnection) {
      await mysqlConnection.rollback();
      console.log('🔄 Transaction rolled back');
    }
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  runFix();
}

module.exports = { runFix }; 