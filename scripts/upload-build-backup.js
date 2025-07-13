#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials in .env file');
  console.log('Required environment variables:');
  console.log('- REACT_APP_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY (or REACT_APP_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadBuildBackup() {
  const buildZipPath = path.join(process.cwd(), 'build.zip');
  
  console.log('🔍 Checking for build.zip...');
  
  // Check if build.zip exists
  if (!fs.existsSync(buildZipPath)) {
    console.error('❌ build.zip not found in project root');
    console.log('�� Run "npm run build-no-backup" first to create build.zip');
    process.exit(1);
  }

  try {
    // Get file stats
    const stats = fs.statSync(buildZipPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`📦 Found build.zip (${fileSizeInMB} MB)`);
    console.log('🚀 Uploading to Supabase updates bucket...');

    // Create unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `portfolio-build-${timestamp}.zip`;

    // Read the file
    const fileBuffer = fs.readFileSync(buildZipPath);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('updates')
      .upload(fileName, fileBuffer, {
        contentType: 'application/zip',
        upsert: false
      });

    if (error) {
      console.error('❌ Upload failed:', error.message);
      
      // Try to create bucket if it doesn't exist
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        console.log('🔧 Attempting to create "updates" bucket...');
        
        const { error: bucketError } = await supabase.storage
          .createBucket('updates', {
            public: true,
            allowedMimeTypes: ['application/zip', 'application/x-zip-compressed'],
            fileSizeLimit: 50 * 1024 * 1024 // 50MB limit
          });

        if (bucketError) {
          console.error('❌ Failed to create bucket:', bucketError.message);
          console.log('');
          console.log('💡 Please create the bucket manually:');
          console.log('   1. Go to Supabase Dashboard → Storage');
          console.log('   2. Click "Create bucket"');
          console.log('   3. Name: updates');
          console.log('   4. Public: ✅ YES (checked)');
          console.log('   5. File size limit: 50MB');
          console.log('   6. MIME types: application/zip, application/x-zip-compressed');
          console.log('   7. Click "Create bucket"');
          console.log('');
          process.exit(1);
        }

        console.log('✅ Created "updates" bucket');
        
        // Retry upload
        const { data: retryData, error: retryError } = await supabase.storage
          .from('updates')
          .upload(fileName, fileBuffer, {
            contentType: 'application/zip',
            upsert: false
          });

        if (retryError) {
          console.error('❌ Retry upload failed:', retryError.message);
          console.log('');
          console.log('💡 Try creating the bucket manually:');
          console.log('   1. Go to Supabase Dashboard → Storage');
          console.log('   2. Click "Create bucket"');
          console.log('   3. Name: updates');
          console.log('   4. Public: ✅ YES (checked)');
          console.log('   5. File size limit: 50MB');
          console.log('   6. MIME types: application/zip, application/x-zip-compressed');
          console.log('');
          process.exit(1);
        }

        data = retryData;
      } else if (error.message.includes('policy') || error.message.includes('permission')) {
        console.log('');
        console.log('💡 This appears to be a permissions issue.');
        console.log('   Please create the "updates" bucket manually:');
        console.log('   1. Go to Supabase Dashboard → Storage');
        console.log('   2. Click "Create bucket"');
        console.log('   3. Name: updates');
        console.log('   4. Public: ✅ YES (checked)');
        console.log('   5. File size limit: 50MB');
        console.log('   6. MIME types: application/zip, application/x-zip-compressed');
        console.log('');
        process.exit(1);
      } else {
        console.log('');
        console.log('💡 If this persists, create the bucket manually:');
        console.log('   File: sql/setup-storage-buckets.sql (see MANUAL SETUP section)');
        console.log('');
        process.exit(1);
      }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('updates')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    console.log('');
    console.log('🎉 Build backup uploaded successfully!');
    console.log('');
    console.log('📋 Backup Details:');
    console.log(`   • File: ${fileName}`);
    console.log(`   • Size: ${fileSizeInMB} MB`);
    console.log(`   • Bucket: updates`);
    console.log(`   • Uploaded: ${new Date().toLocaleString()}`);
    console.log('');
    console.log('🔗 Public Access URL:');
    console.log(`   ${publicUrl}`);
    console.log('');
    console.log('💡 This URL can be used to download the build backup from anywhere');
    console.log('💡 Share this URL with team members or save for deployment');
    console.log('');

    // Also save URL to a local file for reference
    const urlsFile = path.join(process.cwd(), 'backup-urls.txt');
    const urlEntry = `${new Date().toISOString()} - ${fileName}\n${publicUrl}\n\n`;
    
    fs.appendFileSync(urlsFile, urlEntry);
    console.log(`📝 URL saved to: backup-urls.txt`);

    return {
      success: true,
      fileName,
      publicUrl,
      fileSize: fileSizeInMB
    };

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('');
    console.log('💡 If this is a permissions issue, create the bucket manually:');
    console.log('   1. Go to Supabase Dashboard → Storage');
    console.log('   2. Click "Create bucket"');
    console.log('   3. Name: updates');
    console.log('   4. Public: ✅ YES (checked)');
    console.log('   5. File size limit: 50MB');
    console.log('   6. MIME types: application/zip, application/x-zip-compressed');
    console.log('');
    process.exit(1);
  }
}

// Run the upload if this script is executed directly
if (require.main === module) {
  uploadBuildBackup();
}

module.exports = { uploadBuildBackup }; 