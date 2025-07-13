#!/usr/bin/env node

/**
 * BACKUP MYSQL USERS SCRIPT
 * 
 * This script backs up all users from the current MySQL database
 * before running the multi-user migration.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const config = {
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

let mysqlConnection;

async function initializeConnection() {
  console.log('🔌 Initializing MySQL connection...');
  
  try {
    mysqlConnection = await mysql.createConnection(config.mysql);
    await mysqlConnection.execute('SELECT 1');
    console.log('✅ MySQL connection established');
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1);
  }
}

async function backupUsers() {
  console.log('📦 Backing up current MySQL users...');
  
  try {
    // Initialize connection if not already done
    if (!mysqlConnection) {
      await initializeConnection();
    }
    
    // Get all users
    const [users] = await mysqlConnection.execute(
      'SELECT id, email, name, full_name, avatar_url, email_verified, created_at, updated_at FROM users'
    );
    
    // Get portfolio configs
    const [portfolioConfigs] = await mysqlConnection.execute(
      'SELECT * FROM portfolio_config'
    );
    
    const backup = {
      timestamp: new Date().toISOString(),
      users: users,
      portfolio_configs: portfolioConfigs,
      total_users: users.length
    };
    
    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, 'backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    // Save backup file
    const backupFile = path.join(backupDir, `mysql-users-backup-${Date.now()}.json`);
    await fs.writeFile(backupFile, JSON.stringify(backup, null, 2));
    
    console.log(`✅ Backed up ${users.length} users to: ${backupFile}`);
    console.log('📋 Users backed up:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.id})`);
    });
    
    return backupFile;
    
  } catch (error) {
    console.error('❌ Error backing up users:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await initializeConnection();
    const backupFile = await backupUsers();
    
    console.log('\n🎉 User backup completed successfully!');
    console.log(`📁 Backup file: ${backupFile}`);
    console.log('\nNext steps:');
    console.log('1. Run the multi-user migration script');
    console.log('2. Verify data migration');
    console.log('3. Clean up backup if migration is successful');
    
  } catch (error) {
    console.error('\n❌ Backup failed:', error.message);
    process.exit(1);
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { backupUsers }; 