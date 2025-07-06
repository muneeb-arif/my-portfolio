#!/usr/bin/env node

/**
 * Theme Update Creation Script
 * Automates the process of creating and deploying theme updates
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env file
require('dotenv').config();

// Configuration
const CONFIG = {
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
  supabaseKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
  buildDir: 'build',
  tempDir: 'temp-update',
  packageFile: 'package.json',
  supportedFileTypes: ['css', 'js', 'json', 'html']
};

// Validate environment variables
if (!CONFIG.supabaseUrl || !CONFIG.supabaseKey) {
  console.error('❌ Missing required environment variables!');
  console.error('');
  console.error('Please make sure your .env file contains:');
  console.error('REACT_APP_SUPABASE_URL=your-supabase-url');
  console.error('REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key');
  console.error('');
  console.error('Current values:');
  console.error(`REACT_APP_SUPABASE_URL: ${CONFIG.supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.error(`REACT_APP_SUPABASE_ANON_KEY: ${CONFIG.supabaseKey ? '✅ Set' : '❌ Missing'}`);
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);

class ThemeUpdateCreator {
  constructor() {
    this.currentVersion = this.getCurrentVersion();
    this.newVersion = null;
    this.updateFiles = [];
    this.updateTitle = '';
    this.updateDescription = '';
    this.updateChannel = 'stable';
  }

  /**
   * Get current version from package.json
   */
  getCurrentVersion() {
    try {
      const packageJson = JSON.parse(fs.readFileSync(CONFIG.packageFile, 'utf8'));
      return packageJson.version;
    } catch (error) {
      console.error('❌ Error reading package.json:', error.message);
      return '1.0.0';
    }
  }

  /**
   * Bump version number
   */
  bumpVersion(type = 'patch') {
    const [major, minor, patch] = this.currentVersion.split('.').map(Number);
    
    let newMajor = major;
    let newMinor = minor;
    let newPatch = patch;
    
    switch (type) {
      case 'major':
        newMajor++;
        newMinor = 0;
        newPatch = 0;
        break;
      case 'minor':
        newMinor++;
        newPatch = 0;
        break;
      case 'patch':
      default:
        newPatch++;
        break;
    }
    
    this.newVersion = `${newMajor}.${newMinor}.${newPatch}`;
    
    // Update package.json
    const packageJson = JSON.parse(fs.readFileSync(CONFIG.packageFile, 'utf8'));
    packageJson.version = this.newVersion;
    fs.writeFileSync(CONFIG.packageFile, JSON.stringify(packageJson, null, 2));
    
    console.log(`📦 Version bumped: ${this.currentVersion} → ${this.newVersion}`);
    return this.newVersion;
  }

  /**
   * Build the project
   */
  build() {
    console.log('🏗️ Building project...');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Build completed successfully');
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Create update files list
   */
  createUpdateFilesList() {
    console.log('📁 Creating update files list...');
    
    const buildPath = path.join(process.cwd(), CONFIG.buildDir);
    const files = this.getAllFiles(buildPath);
    
    this.updateFiles = files
      .filter(file => {
        const ext = path.extname(file).slice(1);
        return CONFIG.supportedFileTypes.includes(ext);
      })
      .map(file => {
        const relativePath = path.relative(buildPath, file);
        const fileSize = fs.statSync(file).size;
        const fileType = path.extname(file).slice(1);
        
        return {
          path: relativePath,
          fullPath: file,
          size: fileSize,
          type: fileType,
          url: null // Will be populated when uploaded
        };
      });
    
    console.log(`📋 Found ${this.updateFiles.length} update files`);
    return this.updateFiles;
  }

  /**
   * Get all files recursively
   */
  getAllFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Upload files to storage (simplified for now)
   */
  async uploadFiles() {
    console.log('☁️ Preparing file metadata...');
    
    // For now, we'll just store file metadata without actual upload
    // In production, you would upload to your CDN/storage service
    const updatedFiles = this.updateFiles.map(file => {
      // Store relative paths and metadata
      return {
        path: file.path,
        size: file.size,
        type: file.type,
        // Note: In production, upload file and store the actual URL here
        url: null, 
        checksum: null // In production, calculate file checksum
      };
    });
    
    this.updateFiles = updatedFiles;
    console.log(`✅ Prepared ${this.updateFiles.length} file entries`);
    console.log('📝 Note: File uploads are disabled in this version. Files are tracked by path only.');
    return this.updateFiles;
  }

  /**
   * Create update in database
   */
  async createUpdate() {
    console.log('📝 Creating update in database...');
    
    try {
      console.log('📋 Update data:', {
        title: this.updateTitle,
        description: this.updateDescription || 'No description provided',
        version: this.newVersion,
        channel: this.updateChannel,
        filesCount: this.updateFiles.length
      });

      const { data, error } = await supabase
        .from('theme_updates')
        .insert({
          title: this.updateTitle,
          description: this.updateDescription || 'No description provided',
          version: this.newVersion,
          channel: this.updateChannel,
          files: this.updateFiles,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('📊 Supabase error details:', error);
        throw error;
      }

      console.log('✅ Update created successfully:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Failed to create update:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
  }

  /**
   * Create git commit and tag
   */
  createGitTag() {
    console.log('🏷️ Creating git tag...');
    
    try {
      // Add all changes
      execSync('git add -A', { stdio: 'inherit' });
      
      // Commit changes
      execSync(`git commit -m "Release v${this.newVersion}: ${this.updateTitle}"`, { stdio: 'inherit' });
      
      // Create tag
      execSync(`git tag -a v${this.newVersion} -m "Release v${this.newVersion}"`, { stdio: 'inherit' });
      
      console.log(`✅ Git tag created: v${this.newVersion}`);
    } catch (error) {
      console.warn('⚠️ Git operations failed:', error.message);
      console.warn('Make sure you have git initialized and changes to commit');
    }
  }

  /**
   * Generate release notes
   */
  generateReleaseNotes() {
    const releaseNotes = `
# Release v${this.newVersion}

## ${this.updateTitle}

${this.updateDescription}

## Files Changed
${this.updateFiles.map(file => `- ${file.path} (${file.type})`).join('\n')}

## Installation
This update will be automatically distributed to all client deployments.

## Rollback
If issues occur, you can deactivate this update through the dashboard.

---
Generated on ${new Date().toISOString()}
`;

    fs.writeFileSync(`RELEASE_NOTES_v${this.newVersion}.md`, releaseNotes);
    console.log(`📄 Release notes generated: RELEASE_NOTES_v${this.newVersion}.md`);
  }

  /**
   * Interactive prompts
   */
  async promptUser() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise((resolve) => {
      rl.question(prompt, resolve);
    });

    try {
      console.log('\n🚀 Theme Update Creator');
      console.log('========================\n');
      
      console.log(`Current version: ${this.currentVersion}`);
      const versionType = await question('Version bump type (patch/minor/major): ');
      this.bumpVersion(versionType.toLowerCase() || 'patch');
      
      this.updateTitle = await question('Update title: ');
      this.updateDescription = await question('Update description: ');
      
      const channel = await question('Release channel (stable/beta/alpha): ');
      this.updateChannel = channel.toLowerCase() || 'stable';
      
      console.log('\n📋 Update Summary:');
      console.log(`Version: ${this.currentVersion} → ${this.newVersion}`);
      console.log(`Title: ${this.updateTitle}`);
      console.log(`Description: ${this.updateDescription}`);
      console.log(`Channel: ${this.updateChannel}`);
      
      const confirm = await question('\nProceed with update creation? (y/N): ');
      if (confirm.toLowerCase() !== 'y') {
        console.log('❌ Update creation cancelled');
        process.exit(0);
      }
      
    } finally {
      rl.close();
    }
  }

  /**
   * Test Supabase connection and setup
   */
  async testConnection() {
    console.log('🔌 Testing Supabase connection...');
    
    // First test basic connection
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession();
      console.log('✅ Basic Supabase connection successful');
    } catch (error) {
      console.error('❌ Basic Supabase connection failed:', error.message);
      console.error('Check your REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
      return false;
    }

    // Test if theme_updates table exists
    try {
      console.log('🔍 Checking if theme_updates table exists...');
      const { data, error } = await supabase
        .from('theme_updates')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === '42P01') { // Table does not exist
          console.error('❌ theme_updates table does not exist!');
          console.error('');
          console.error('🔧 Setup required:');
          console.error('1. Open your Supabase SQL Editor');
          console.error('2. Copy and run the contents of sql/theme-update-system.sql');
          console.error('3. Try running this script again');
          console.error('');
          console.error('The SQL file creates all necessary tables for the theme update system.');
          return false;
        }
        throw error;
      }
      
      console.log('✅ theme_updates table found');
      return true;
    } catch (error) {
      console.error('❌ Database setup check failed:', error.message);
      console.error('');
      console.error('Possible issues:');
      console.error('1. Run sql/theme-update-system.sql in Supabase SQL Editor');
      console.error('2. Check Row Level Security policies');
      console.error('3. Verify your API key has the right permissions');
      return false;
    }
  }

  /**
   * Main execution flow
   */
  async run() {
    try {
      // Test connection first
      const connectionOk = await this.testConnection();
      if (!connectionOk) {
        process.exit(1);
      }

      // Interactive prompts
      await this.promptUser();
      
      // Build process
      this.build();
      
      // Create update files list
      this.createUpdateFilesList();
      
      // Upload files
      await this.uploadFiles();
      
      // Create update in database
      const update = await this.createUpdate();
      
      // Create git tag
      this.createGitTag();
      
      // Generate release notes
      this.generateReleaseNotes();
      
      console.log('\n🎉 Update created successfully!');
      console.log(`📦 Version: ${this.newVersion}`);
      console.log(`🆔 Update ID: ${update.id}`);
      console.log(`📊 Files: ${this.updateFiles.length}`);
      console.log(`🎯 Channel: ${this.updateChannel}`);
      console.log('\n💡 Next steps:');
      console.log('1. Test the update on a staging environment');
      console.log('2. Push the update through the dashboard');
      console.log('3. Monitor update application across clients');
      
    } catch (error) {
      console.error('\n❌ Update creation failed:', error.message);
      process.exit(1);
    }
  }
}

// CLI Usage
if (require.main === module) {
  const creator = new ThemeUpdateCreator();
  creator.run();
}

module.exports = ThemeUpdateCreator; 