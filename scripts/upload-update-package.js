#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.');
  console.error('Required: REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Utility function to ask questions
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

// Utility function to validate version format
const isValidVersion = (version) => {
  const versionRegex = /^\d+\.\d+\.\d+$/;
  return versionRegex.test(version);
};

// Main upload process
async function uploadUpdatePackage() {
  console.log('\n🏗️ Shared Hosting Update Package Uploader');
  console.log('============================================\n');

  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    const { data, error } = await supabase.from('shared_hosting_updates').select('count').limit(1);
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
    console.log('✅ Database connection successful\n');

    // Get package file path
    const packagePath = await askQuestion('📦 Enter the path to your build ZIP file: ');
    
    if (!fs.existsSync(packagePath)) {
      throw new Error(`Package file not found: ${packagePath}`);
    }

    const packageStats = fs.statSync(packagePath);
    const packageSizeMB = (packageStats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`✅ Package found: ${path.basename(packagePath)} (${packageSizeMB} MB)\n`);

    // Get update details
    let version;
    do {
      version = await askQuestion('📋 Enter version number (e.g., 1.2.0): ');
      if (!isValidVersion(version)) {
        console.log('❌ Invalid version format. Use semantic versioning (major.minor.patch)');
      }
    } while (!isValidVersion(version));

    const title = await askQuestion('📝 Enter update title: ');
    const description = await askQuestion('📄 Enter description (optional): ') || '';
    
    console.log('\n📋 Enter release notes (one item per line, empty line to finish):');
    const releaseNotes = [];
    let note;
    do {
      note = await askQuestion('  - ');
      if (note) releaseNotes.push(`- ${note}`);
    } while (note);

    const specialInstructions = await askQuestion('\n🔧 Special cPanel instructions (optional): ') || '';
    
    const channel = await askQuestion('📢 Release channel (stable/beta/alpha) [stable]: ') || 'stable';
    
    const isCritical = (await askQuestion('🚨 Is this a critical update? (y/n) [n]: ')).toLowerCase() === 'y';

    console.log('\n📤 Upload options:');
    console.log('1. Manual upload (you handle hosting)');
    console.log('2. Help me set up cloud storage');
    
    const uploadOption = await askQuestion('Choose option (1-2) [1]: ') || '1';
    
    let packageUrl = '';
    
    if (uploadOption === '1') {
      console.log('\n📝 Manual Upload Instructions:');
      console.log('1. Upload your ZIP file to a public hosting service');
      console.log('2. Examples: AWS S3, Google Drive, Dropbox, GitHub Releases');
      console.log('3. Ensure the link is publicly accessible');
      console.log('4. Copy the direct download URL\n');
      
      packageUrl = await askQuestion('🔗 Enter the public download URL: ');
      
      if (!packageUrl.startsWith('http')) {
        throw new Error('Invalid URL. Must start with http:// or https://');
      }
    } else {
      console.log('\n🌤️ Cloud Storage Setup Guide:');
      console.log('===============================');
      console.log('For AWS S3:');
      console.log('1. Create an S3 bucket');
      console.log('2. Upload your file');
      console.log('3. Make it publicly readable');
      console.log('4. Copy the object URL');
      console.log('');
      console.log('For GitHub Releases:');
      console.log('1. Go to your repo > Releases');
      console.log('2. Create a new release');
      console.log('3. Upload your ZIP as an asset');
      console.log('4. Copy the asset download URL');
      console.log('');
      console.log('For Google Drive:');
      console.log('1. Upload file to Google Drive');
      console.log('2. Right-click > Share > Anyone with link');
      console.log('3. Change sharing URL format');
      console.log('');
      
      packageUrl = await askQuestion('🔗 Enter the public download URL: ');
    }

    // Create the update record
    console.log('\n💾 Creating update record...');
    
    const updateData = {
      version: version,
      title: title,
      description: description,
      release_notes: releaseNotes.join('\n'),
      package_url: packageUrl,
      package_size_mb: parseFloat(packageSizeMB),
      special_instructions: specialInstructions,
      channel: channel,
      is_critical: isCritical,
      is_active: true,
      created_at: new Date().toISOString()
    };

    const { data: updateRecord, error: insertError } = await supabase
      .from('shared_hosting_updates')
      .insert([updateData])
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create update record: ${insertError.message}`);
    }

    console.log('✅ Update record created successfully!');
    
    // Create notifications
    console.log('📧 Creating client notifications...');
    
    const { data: notificationResult, error: notificationError } = await supabase.rpc('create_shared_hosting_notifications', {
      p_update_id: updateRecord.id,
      p_notification_type: isCritical ? 'critical_update' : 'update_available'
    });

    if (notificationError) {
      console.log('⚠️ Warning: Failed to create notifications:', notificationError.message);
    } else {
      console.log(`✅ Notifications created for clients`);
    }

    // Summary
    console.log('\n🎉 Update Package Upload Complete!');
    console.log('===================================');
    console.log(`📦 Version: ${version}`);
    console.log(`📝 Title: ${title}`);
    console.log(`📢 Channel: ${channel}`);
    console.log(`📊 Size: ${packageSizeMB} MB`);
    console.log(`🔗 URL: ${packageUrl}`);
    console.log(`🆔 Update ID: ${updateRecord.id}`);
    console.log(`🚨 Critical: ${isCritical ? 'Yes' : 'No'}`);
    
    console.log('\n📋 Next Steps:');
    console.log('1. Clients will be notified automatically');
    console.log('2. Monitor update progress in the dashboard');
    console.log('3. Check client applications in the logs');
    
    const openDashboard = await askQuestion('\n🖥️ Open dashboard in browser? (y/n) [n]: ');
    if (openDashboard.toLowerCase() === 'y') {
      const { spawn } = require('child_process');
      const dashboardUrl = 'http://localhost:3000/dashboard'; // Adjust as needed
      
      // Open browser based on platform
      const platform = process.platform;
      const command = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
      
      spawn(command, [dashboardUrl], { detached: true, stdio: 'ignore' });
      console.log(`🌐 Opening dashboard: ${dashboardUrl}`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env file has correct Supabase credentials');
    console.log('2. Ensure the database schema is set up');
    console.log('3. Verify the package file exists and is accessible');
    console.log('4. Check that the download URL is publicly accessible');
    
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Additional utility functions
async function listUpdates() {
  console.log('\n📦 Recent Updates');
  console.log('================');
  
  try {
    const { data: updates, error } = await supabase
      .from('shared_hosting_updates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    if (updates.length === 0) {
      console.log('No updates found.');
      return;
    }

    updates.forEach((update, index) => {
      console.log(`\n${index + 1}. ${update.title} (v${update.version})`);
      console.log(`   Status: ${update.is_active ? '✅ Active' : '⏸️ Inactive'}`);
      console.log(`   Channel: ${update.channel}`);
      console.log(`   Created: ${new Date(update.created_at).toLocaleDateString()}`);
      if (update.is_critical) console.log('   🚨 CRITICAL');
    });

  } catch (error) {
    console.error('❌ Failed to list updates:', error.message);
  }
}

async function listClients() {
  console.log('\n🌐 Active Clients');
  console.log('================');
  
  try {
    const { data: clients, error } = await supabase
      .from('shared_hosting_clients')
      .select('*')
      .eq('is_active', true)
      .order('last_seen', { ascending: false });

    if (error) throw error;

    if (clients.length === 0) {
      console.log('No active clients found.');
      return;
    }

    clients.forEach((client, index) => {
      const lastSeen = new Date(client.last_seen);
      const hoursAgo = Math.floor((new Date() - lastSeen) / (1000 * 60 * 60));
      
      console.log(`\n${index + 1}. ${client.domain}`);
      console.log(`   Version: v${client.current_version}`);
      console.log(`   Last Seen: ${hoursAgo < 24 ? `${hoursAgo}h ago` : lastSeen.toLocaleDateString()}`);
      console.log(`   Hosting: ${client.hosting_provider || 'cPanel'}`);
    });

  } catch (error) {
    console.error('❌ Failed to list clients:', error.message);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--list-updates')) {
  listUpdates().then(() => process.exit(0));
} else if (args.includes('--list-clients')) {
  listClients().then(() => process.exit(0));
} else if (args.includes('--help') || args.includes('-h')) {
  console.log('\n🏗️ Shared Hosting Update Package Uploader');
  console.log('==========================================');
  console.log('\nUsage:');
  console.log('  node upload-update-package.js            # Interactive upload');
  console.log('  node upload-update-package.js --list-updates   # List recent updates');
  console.log('  node upload-update-package.js --list-clients   # List active clients');
  console.log('  node upload-update-package.js --help           # Show this help');
  console.log('\nEnvironment Variables Required:');
  console.log('  REACT_APP_SUPABASE_URL      # Your Supabase project URL');
  console.log('  SUPABASE_SERVICE_ROLE_KEY   # Your Supabase service role key');
  console.log('\nExample .env file:');
  console.log('  REACT_APP_SUPABASE_URL=https://your-project.supabase.co');
  console.log('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(0);
} else {
  // Default: interactive upload
  uploadUpdatePackage();
} 