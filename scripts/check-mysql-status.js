#!/usr/bin/env node

require('dotenv').config();
const mysql = require('mysql2/promise');

// Use the correct MySQL settings
const config = {
  mysql: {
    host: 'localhost',
    port: 8889,
    user: 'root',
    password: 'root',
    database: 'portfolio',
    charset: 'utf8mb4'
  }
};

async function checkDatabaseStatus() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL (localhost:8889)...');
    connection = await mysql.createConnection(config.mysql);
    
    console.log('✅ Connected to MySQL database: portfolio');
    
    // Check what tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`\n📋 Found ${tables.length} tables:`);
    
    // Check row counts for each table
    console.log('\n📊 Table Row Counts:');
    console.log('┌─────────────────────────┬───────────┐');
    console.log('│ Table Name              │ Row Count │');
    console.log('├─────────────────────────┼───────────┤');
    
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      try {
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = countResult[0].count;
        const paddedName = tableName.padEnd(23);
        const paddedCount = count.toString().padStart(9);
        console.log(`│ ${paddedName} │ ${paddedCount} │`);
      } catch (error) {
        console.log(`│ ${tableName.padEnd(23)} │    ERROR  │`);
      }
    }
    console.log('└─────────────────────────┴───────────┘');
    
    // Check users specifically
    console.log('\n👥 Users in database:');
    const [users] = await connection.execute('SELECT id, email, name FROM users');
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (ID: ${user.id})`);
      });
    } else {
      console.log('  No users found!');
    }
    
    // Check specific empty tables
    console.log('\n🔍 Checking problematic tables:');
    
    const problematicTables = ['domains_technologies', 'tech_skills', 'niche'];
    for (const tableName of problematicTables) {
      try {
        const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = result[0].count;
        if (count === 0) {
          console.log(`  ❌ ${tableName}: EMPTY (should have data)`);
        } else {
          console.log(`  ✅ ${tableName}: ${count} records`);
        }
      } catch (error) {
        console.log(`  ❌ ${tableName}: ERROR - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  checkDatabaseStatus();
}

module.exports = { checkDatabaseStatus }; 