#!/usr/bin/env node

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

// Expected tables based on the Supabase schema
const EXPECTED_TABLES = [
  // Core portfolio tables
  'users',
  'portfolio_config', 
  'categories',
  'projects',
  'project_images',
  'domains_technologies',
  'tech_skills',
  'niche',
  'settings',
  'contact_queries',
  
  // Automatic update system tables
  'automatic_update_capabilities',
  'automatic_update_client_performance',
  'automatic_update_logs',
  'automatic_update_performance', 
  'recent_automatic_activity',
  
  // Shared hosting system tables
  'shared_hosting_clients',
  'shared_hosting_notifications',
  'shared_hosting_update_logs',
  'shared_hosting_update_stats',
  'shared_hosting_updates',
  
  // Theme update system tables
  'theme_clients',
  'theme_update_logs',
  'theme_update_notifications',
  'theme_update_stats',
  'theme_updates'
];

async function checkMissingTables() {
  let mysqlConnection;
  let supabase;
  
  try {
    console.log('🔍 CHECKING MISSING TABLES\n');
    
    // Connect to MySQL
    console.log('🔌 Connecting to MySQL...');
    mysqlConnection = await mysql.createConnection(config.mysql);
    
    // Connect to Supabase  
    const supabaseKey = config.supabase.serviceKey || config.supabase.key;
    supabase = createClient(config.supabase.url, supabaseKey);
    
    // Get existing MySQL tables
    const [mysqlTablesResult] = await mysqlConnection.execute('SHOW TABLES');
    const existingTables = mysqlTablesResult.map(row => Object.values(row)[0]);
    
    console.log(`📋 MySQL has ${existingTables.length} tables:`);
    existingTables.sort().forEach(table => {
      console.log(`  ✅ ${table}`);
    });
    
    // Check what's missing
    const missingTables = EXPECTED_TABLES.filter(table => !existingTables.includes(table));
    
    console.log(`\n❌ MISSING ${missingTables.length} TABLES:`);
    missingTables.forEach(table => {
      console.log(`  🔴 ${table}`);
    });
    
    // Check what tables exist in Supabase
    console.log('\n🔍 Checking Supabase for missing tables...');
    
    for (const tableName of missingTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`  ❌ ${tableName}: Does not exist in Supabase`);
        } else {
          // Get count
          const { data: countData, error: countError } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
            
          if (!countError) {
            console.log(`  ✅ ${tableName}: EXISTS in Supabase with data`);
          } else {
            console.log(`  ⚠️  ${tableName}: EXISTS in Supabase (count unknown)`);
          }
        }
      } catch (error) {
        console.log(`  ❌ ${tableName}: Error checking - ${error.message}`);
      }
    }
    
    // Also check data counts for existing tables that might be empty
    console.log('\n📊 CHECKING DATA IN EXISTING TABLES:');
    
    for (const tableName of existingTables) {
      try {
        const [countResult] = await mysqlConnection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = countResult[0].count;
        
        if (count === 0) {
          // Check if Supabase has data for this table
          try {
            const { data, error } = await supabase
              .from(tableName)
              .select('*')
              .limit(1);
              
            if (!error && data && data.length > 0) {
              console.log(`  🔴 ${tableName}: EMPTY in MySQL but has data in Supabase`);
            } else {
              console.log(`  ⚪ ${tableName}: EMPTY in both MySQL and Supabase`);
            }
          } catch (error) {
            console.log(`  ⚪ ${tableName}: EMPTY in MySQL, cannot check Supabase`);
          }
        } else {
          console.log(`  ✅ ${tableName}: ${count} records in MySQL`);
        }
      } catch (error) {
        console.log(`  ❌ ${tableName}: Error checking count`);
      }
    }
    
    console.log('\n📋 SUMMARY:');
    console.log(`  📊 Total expected tables: ${EXPECTED_TABLES.length}`);
    console.log(`  ✅ Tables that exist: ${existingTables.length}`);
    console.log(`  ❌ Tables missing: ${missingTables.length}`);
    
    if (missingTables.length > 0) {
      console.log('\n🔧 NEXT STEPS:');
      console.log('1. Create the missing table schemas');
      console.log('2. Migrate data from Supabase for existing tables');
      console.log('3. Verify all data is properly migrated');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
    }
  }
}

if (require.main === module) {
  checkMissingTables();
}

module.exports = { checkMissingTables }; 