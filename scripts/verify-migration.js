#!/usr/bin/env node

/**
 * VERIFY MIGRATION SCRIPT
 * 
 * This script compares data between Supabase and MySQL to verify
 * that the migration was completed correctly.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const config = {
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL,
    key: process.env.REACT_APP_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 8889,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
    database: process.env.MYSQL_DATABASE || 'portfolio',
    charset: 'utf8mb4',
    timezone: '+00:00'
  }
};

let supabase;
let mysqlConnection;

// Initialize connections
async function initializeConnections() {
  console.log('🔌 Initializing database connections...');
  
  // Initialize Supabase
  const supabaseKey = config.supabase.serviceKey || config.supabase.key;
  supabase = createClient(config.supabase.url, supabaseKey);
  
  // Initialize MySQL
  try {
    mysqlConnection = await mysql.createConnection(config.mysql);
    await mysqlConnection.execute('SELECT 1');
    console.log('✅ Database connections established');
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1);
  }
}

// Compare table counts
async function compareTableCounts() {
  console.log('\n📊 Comparing table counts...');
  
  const tables = [
    'users',
    'projects',
    'categories',
    'technologies',
    'domains_technologies',
    'tech_skills',
    'niche',
    'settings',
    'contact_queries',
    'project_images',
    'portfolio_config'
  ];
  
  const results = [];
  
  for (const table of tables) {
    try {
      // Get Supabase count
      const { count: supabaseCount, error: supabaseError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (supabaseError) {
        console.warn(`⚠️  Could not get Supabase count for ${table}: ${supabaseError.message}`);
        continue;
      }
      
      // Get MySQL count
      const [mysqlResult] = await mysqlConnection.execute(`SELECT COUNT(*) as count FROM ${table}`);
      const mysqlCount = mysqlResult[0].count;
      
      const match = supabaseCount === mysqlCount;
      results.push({
        table,
        supabase: supabaseCount,
        mysql: mysqlCount,
        match
      });
      
      const status = match ? '✅' : '❌';
      console.log(`${status} ${table}: Supabase=${supabaseCount}, MySQL=${mysqlCount}`);
      
    } catch (error) {
      console.warn(`⚠️  Error comparing ${table}: ${error.message}`);
    }
  }
  
  return results;
}

// Compare user data
async function compareUserData() {
  console.log('\n👥 Comparing user data...');
  
  try {
    // Get Supabase users
    const { data: supabaseUsers, error: supabaseError } = await supabase.auth.admin.listUsers();
    
    if (supabaseError) {
      console.error('❌ Error fetching Supabase users:', supabaseError.message);
      return;
    }
    
    // Get MySQL users
    const [mysqlUsers] = await mysqlConnection.execute('SELECT id, email, name, email_verified FROM users');
    
    console.log(`📋 Supabase users: ${supabaseUsers.users.length}`);
    console.log(`📋 MySQL users: ${mysqlUsers.length}`);
    
    // Compare each user
    for (const supabaseUser of supabaseUsers.users) {
      const mysqlUser = mysqlUsers.find(u => u.id === supabaseUser.id);
      
      if (mysqlUser) {
        const emailMatch = supabaseUser.email === mysqlUser.email;
        const nameMatch = (supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0]) === mysqlUser.name;
        const verifiedMatch = (supabaseUser.email_confirmed_at ? true : false) === mysqlUser.email_verified;
        
        const status = emailMatch && nameMatch && verifiedMatch ? '✅' : '❌';
        console.log(`${status} ${supabaseUser.email}: ${emailMatch ? 'email✓' : 'email✗'} ${nameMatch ? 'name✓' : 'name✗'} ${verifiedMatch ? 'verified✓' : 'verified✗'}`);
      } else {
        console.log(`❌ User not found in MySQL: ${supabaseUser.email}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error comparing user data:', error.message);
  }
}

// Compare specific user's data
async function compareUserSpecificData(userEmail) {
  console.log(`\n🔍 Comparing data for user: ${userEmail}`);
  
  try {
    // Get user ID from MySQL
    const [mysqlUser] = await mysqlConnection.execute(
      'SELECT id FROM users WHERE email = ?',
      [userEmail]
    );
    
    if (mysqlUser.length === 0) {
      console.log(`❌ User not found in MySQL: ${userEmail}`);
      return;
    }
    
    const userId = mysqlUser[0].id;
    
    // Compare projects
    const { count: supabaseProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    const [mysqlProjects] = await mysqlConnection.execute(
      'SELECT COUNT(*) as count FROM projects WHERE user_id = ?',
      [userId]
    );
    
    console.log(`📁 Projects: Supabase=${supabaseProjects}, MySQL=${mysqlProjects[0].count}`);
    
    // Compare categories
    const { count: supabaseCategories } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    const [mysqlCategories] = await mysqlConnection.execute(
      'SELECT COUNT(*) as count FROM categories WHERE user_id = ?',
      [userId]
    );
    
    console.log(`📂 Categories: Supabase=${supabaseCategories}, MySQL=${mysqlCategories[0].count}`);
    
    // Compare niches
    const { count: supabaseNiches } = await supabase
      .from('niche')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    const [mysqlNiches] = await mysqlConnection.execute(
      'SELECT COUNT(*) as count FROM niche WHERE user_id = ?',
      [userId]
    );
    
    console.log(`🏆 Niches: Supabase=${supabaseNiches}, MySQL=${mysqlNiches[0].count}`);
    
  } catch (error) {
    console.error(`❌ Error comparing data for ${userEmail}:`, error.message);
  }
}

// Main verification function
async function runVerification() {
  console.log('🔍 Starting migration verification...\n');
  
  try {
    await initializeConnections();
    
    // Compare overall table counts
    const tableResults = await compareTableCounts();
    
    // Compare user data
    await compareUserData();
    
    // Compare specific user data
    await compareUserSpecificData('muneebarif11@gmail.com');
    await compareUserSpecificData('fareedrao7890@gmail.com');
    
    // Summary
    console.log('\n📊 Verification Summary:');
    const matchingTables = tableResults.filter(r => r.match).length;
    const totalTables = tableResults.length;
    
    console.log(`✅ Matching tables: ${matchingTables}/${totalTables}`);
    
    if (matchingTables === totalTables) {
      console.log('\n🎉 All tables match! Migration appears successful.');
    } else {
      console.log('\n⚠️  Some tables have mismatched counts. Please review the migration.');
    }
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
    }
  }
}

// Run verification if called directly
if (require.main === module) {
  runVerification();
}

module.exports = { runVerification }; 