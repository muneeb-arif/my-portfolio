#!/usr/bin/env node

/**
 * COMPLETE MIGRATION ORCHESTRATOR
 * 
 * This script orchestrates the complete multi-user migration process:
 * 1. Backup current MySQL users
 * 2. Run multi-user migration
 * 3. Clean up backup files
 * 4. Verify migration
 */

require('dotenv').config();
const { backupUsers } = require('./backup-mysql-users');
const { runMigration } = require('./migrate-multi-user-to-mysql');
const { cleanupBackupUsers } = require('./cleanup-backup-users');
const { runVerification } = require('./verify-migration');

async function runCompleteMigration() {
  console.log('🚀 Starting Complete Multi-User Migration Process\n');
  console.log('This process will:');
  console.log('1. 📦 Backup current MySQL users');
  console.log('2. 🔄 Migrate all users from Supabase to MySQL');
  console.log('3. 🧹 Clean up temporary backup files');
  console.log('4. 🔍 Verify migration accuracy');
  console.log('');
  
  const startTime = Date.now();
  
  try {
    // Step 1: Backup current MySQL users
    console.log('='.repeat(60));
    console.log('STEP 1: BACKING UP CURRENT MYSQL USERS');
    console.log('='.repeat(60));
    const backupFile = await backupUsers();
    
    // Step 2: Run multi-user migration
    console.log('\n' + '='.repeat(60));
    console.log('STEP 2: RUNNING MULTI-USER MIGRATION');
    console.log('='.repeat(60));
    await runMigration();
    
    // Step 3: Clean up backup files
    console.log('\n' + '='.repeat(60));
    console.log('STEP 3: CLEANING UP BACKUP FILES');
    console.log('='.repeat(60));
    await cleanupBackupUsers();
    
    // Step 4: Verify migration
    console.log('\n' + '='.repeat(60));
    console.log('STEP 4: VERIFYING MIGRATION');
    console.log('='.repeat(60));
    await runVerification();
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 COMPLETE MIGRATION SUCCESSFUL!');
    console.log('='.repeat(60));
    console.log(`⏱️  Total duration: ${duration} seconds`);
    console.log('✅ All users migrated successfully');
    console.log('✅ Data integrity verified');
    console.log('✅ Backup files cleaned up');
    console.log('\nYour portfolio is now ready with all user data properly migrated!');
    
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ MIGRATION FAILED');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    console.error('\nThe backup file may still be available for recovery.');
    console.error('Please check the error and try again.');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runCompleteMigration();
}

module.exports = { runCompleteMigration }; 