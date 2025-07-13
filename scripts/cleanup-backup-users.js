#!/usr/bin/env node

/**
 * CLEANUP BACKUP USERS SCRIPT
 * 
 * This script removes the temporary user backup files after successful migration.
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

async function cleanupBackupUsers() {
  console.log('🧹 Cleaning up temporary user backup files...');
  
  try {
    const backupDir = path.join(__dirname, 'backups');
    
    // Check if backup directory exists
    try {
      await fs.access(backupDir);
    } catch (error) {
      console.log('ℹ️  No backup directory found, nothing to clean up');
      return;
    }
    
    // Get all backup files
    const files = await fs.readdir(backupDir);
    const backupFiles = files.filter(file => file.startsWith('mysql-users-backup-') && file.endsWith('.json'));
    
    if (backupFiles.length === 0) {
      console.log('ℹ️  No backup files found to clean up');
      return;
    }
    
    // Remove backup files
    for (const file of backupFiles) {
      const filePath = path.join(backupDir, file);
      await fs.unlink(filePath);
      console.log(`🗑️  Removed: ${file}`);
    }
    
    console.log(`✅ Cleaned up ${backupFiles.length} backup files`);
    
  } catch (error) {
    console.error('❌ Error cleaning up backup files:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await cleanupBackupUsers();
    console.log('\n🎉 Cleanup completed successfully!');
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { cleanupBackupUsers }; 