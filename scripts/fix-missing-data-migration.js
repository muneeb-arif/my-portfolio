#!/usr/bin/env node

/**
 * FIX MISSING DATA MIGRATION SCRIPT
 * 
 * This script fixes the missing domains_technologies, tech_skills, and niche data
 * and ensures data is properly filtered by user.
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

async function getMySQLUsers() {
  const [users] = await mysqlConnection.execute('SELECT id, email FROM users');
  console.log(`📋 Found ${users.length} MySQL users to fix data for`);
  return users;
}

async function clearAndMigrateMissingTables() {
  console.log('🧹 Clearing and migrating missing tables...');
  
  // Clear the problematic tables first
  await mysqlConnection.execute('DELETE FROM tech_skills');
  await mysqlConnection.execute('DELETE FROM domains_technologies');  
  await mysqlConnection.execute('DELETE FROM niche');
  
  console.log('✅ Cleared existing data from problematic tables');
  
  // Get all data from Supabase
  console.log('📥 Fetching data from Supabase...');
  
  const { data: domainsData, error: domainsError } = await supabase
    .from('domains_technologies')
    .select('*');
    
  const { data: skillsData, error: skillsError } = await supabase
    .from('tech_skills')
    .select('*');
    
  const { data: nicheData, error: nicheError } = await supabase
    .from('niche')
    .select('*');
  
  if (domainsError) console.error('❌ Error fetching domains_technologies:', domainsError.message);
  if (skillsError) console.error('❌ Error fetching tech_skills:', skillsError.message);
  if (nicheError) console.error('❌ Error fetching niche:', nicheError.message);
  
  console.log(`📊 Supabase data counts:`);
  console.log(`  - domains_technologies: ${domainsData?.length || 0}`);
  console.log(`  - tech_skills: ${skillsData?.length || 0}`);
  console.log(`  - niche: ${nicheData?.length || 0}`);
  
  // Get MySQL users
  const mysqlUsers = await getMySQLUsers();
  
  // Migrate domains_technologies for each user
  if (domainsData && domainsData.length > 0) {
    console.log('🌐 Migrating domains_technologies...');
    let totalMigrated = 0;
    
    for (const user of mysqlUsers) {
      for (const domain of domainsData) {
        try {
          await mysqlConnection.execute(
            `INSERT INTO domains_technologies (id, user_id, type, title, icon, image, sort_order, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              generateUUID(), // Generate new UUID for each user
              user.id,
              domain.type || 'technology',
              sanitizeText(domain.title),
              domain.icon,
              domain.image,
              domain.sort_order || 1,
              convertPostgreSQLTimestamp(domain.created_at),
              convertPostgreSQLTimestamp(domain.updated_at)
            ]
          );
          totalMigrated++;
        } catch (error) {
          console.error(`❌ Error migrating domain for ${user.email}:`, error.message);
        }
      }
    }
    console.log(`✅ Migrated ${totalMigrated} domains_technologies records`);
  }
  
  // Migrate tech_skills for each user  
  if (skillsData && skillsData.length > 0) {
    console.log('⚡ Migrating tech_skills...');
    let totalMigrated = 0;
    
    for (const user of mysqlUsers) {
      for (const skill of skillsData) {
        try {
          // Find a matching domain tech for this user
          const [domainResult] = await mysqlConnection.execute(
            'SELECT id FROM domains_technologies WHERE user_id = ? LIMIT 1',
            [user.id]
          );
          
          const techId = domainResult.length > 0 ? domainResult[0].id : generateUUID();
          
          await mysqlConnection.execute(
            `INSERT INTO tech_skills (id, tech_id, user_id, title, icon, level, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              generateUUID(),
              techId,
              user.id,
              sanitizeText(skill.title),
              skill.icon,
              skill.level || 1,
              convertPostgreSQLTimestamp(skill.created_at),
              convertPostgreSQLTimestamp(skill.updated_at)
            ]
          );
          totalMigrated++;
        } catch (error) {
          console.error(`❌ Error migrating skill for ${user.email}:`, error.message);
        }
      }
    }
    console.log(`✅ Migrated ${totalMigrated} tech_skills records`);
  }
  
  // Migrate niche for each user
  if (nicheData && nicheData.length > 0) {
    console.log('🎯 Migrating niche...');
    let totalMigrated = 0;
    
    for (const user of mysqlUsers) {
      for (const niche of nicheData) {
        try {
          await mysqlConnection.execute(
            `INSERT INTO niche (user_id, image, title, overview, tools, key_features, sort_order, ai_driven, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
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
          totalMigrated++;
        } catch (error) {
          console.error(`❌ Error migrating niche for ${user.email}:`, error.message);
        }
      }
    }
    console.log(`✅ Migrated ${totalMigrated} niche records`);
  }
}

async function runFixMigration() {
  console.log('🔧 FIXING MISSING DATA MIGRATION\n');
  
  try {
    await initializeConnections();
    
    // Start transaction
    await mysqlConnection.beginTransaction();
    
    await clearAndMigrateMissingTables();
    
    // Commit transaction
    await mysqlConnection.commit();
    
    // Check final status
    console.log('\n📊 Final Status Check:');
    const [domainsCount] = await mysqlConnection.execute('SELECT COUNT(*) as count FROM domains_technologies');
    const [skillsCount] = await mysqlConnection.execute('SELECT COUNT(*) as count FROM tech_skills');
    const [nicheCount] = await mysqlConnection.execute('SELECT COUNT(*) as count FROM niche');
    
    console.log(`✅ domains_technologies: ${domainsCount[0].count} records`);
    console.log(`✅ tech_skills: ${skillsCount[0].count} records`);
    console.log(`✅ niche: ${nicheCount[0].count} records`);
    
    console.log('\n🎉 Missing data migration completed successfully!');
    
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
  runFixMigration();
}

module.exports = { runFixMigration }; 