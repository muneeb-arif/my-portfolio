#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config();

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting detailed build process...');
console.log('📁 Current directory:', process.cwd());
console.log('⏰ Start time:', new Date().toISOString());
console.log('💡 Note: Filtering out expected warnings (MySQL2 config, Next.js dynamic routes)');
console.log('=' .repeat(60));

// Check if .next directory exists and clean it
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  console.log('🧹 Cleaning previous build...');
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('✅ Previous build cleaned');
}

// Check environment variables
console.log('🔧 Environment check:');
console.log('  - NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('  - MYSQL_HOST:', process.env.MYSQL_HOST ? 'set' : 'not set');
console.log('  - SUPABASE_URL:', process.env.SUPABASE_URL ? 'set' : 'not set');
console.log('  - JWT_SECRET:', process.env.JWT_SECRET ? 'set' : 'not set');

console.log('=' .repeat(60));

// Start the build process
const buildProcess = spawn('npx', ['next', 'build', '--debug'], {
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'production' }
});

let buildOutput = '';

buildProcess.stdout.on('data', (data) => {
  const output = data.toString();
  buildOutput += output;
  
  // Parse and format the output for better readability
  const lines = output.split('\n');
  lines.forEach(line => {
    if (line.trim()) {
      // Add timestamps and format different types of messages
      const timestamp = new Date().toLocaleTimeString();
      
      if (line.includes('Creating an optimized production build')) {
        console.log(`⏱️  ${timestamp} - 🔨 Creating optimized production build...`);
      } else if (line.includes('Compiled successfully')) {
        console.log(`⏱️  ${timestamp} - ✅ Compiled successfully`);
      } else if (line.includes('Linting and checking validity of types')) {
        console.log(`⏱️  ${timestamp} - 🔍 Linting and type checking...`);
      } else if (line.includes('Collecting page data')) {
        console.log(`⏱️  ${timestamp} - 📄 Collecting page data...`);
      } else if (line.includes('Generating static pages')) {
        console.log(`⏱️  ${timestamp} - 🏗️  Generating static pages...`);
      } else if (line.includes('Finalizing page optimization')) {
        console.log(`⏱️  ${timestamp} - 🎯 Finalizing optimization...`);
      } else if (line.includes('Route (app)') || line.includes('Route (pages)')) {
        console.log(`⏱️  ${timestamp} - 📊 ${line.trim()}`);
      } else if (line.includes('Error') || line.includes('Failed')) {
        // Filter out known warnings that are not actual errors
        if (line.includes('Ignoring invalid configuration option passed to Connection') ||
            line.includes('DeprecationWarning') ||
            line.includes('DEP0040') ||
            line.includes('Supabase environment variables missing') ||
            line.includes('Dynamic server usage') ||
            line.includes('couldn\'t be rendered statically')) {
          // Skip these warnings
          return;
        }
        console.log(`⏱️  ${timestamp} - ❌ ${line.trim()}`);
      } else if (line.includes('Warning') || line.includes('⚠️')) {
        // Filter out known warnings
        if (line.includes('Ignoring invalid configuration option passed to Connection') ||
            line.includes('DeprecationWarning') ||
            line.includes('DEP0040') ||
            line.includes('Supabase environment variables missing') ||
            line.includes('Dynamic server usage') ||
            line.includes('couldn\'t be rendered statically')) {
          // Skip these warnings
          return;
        }
        console.log(`⏱️  ${timestamp} - ⚠️  ${line.trim()}`);
      } else if (line.includes('🔗 DB Connection') || line.includes('🔍 Testing')) {
        console.log(`⏱️  ${timestamp} - ${line.trim()}`);
      }
    }
  });
});

buildProcess.stderr.on('data', (data) => {
  const error = data.toString();
  const timestamp = new Date().toLocaleTimeString();
  
  // Filter out MySQL2 configuration warnings
  if (error.includes('Ignoring invalid configuration option passed to Connection')) {
    // Skip these warnings - they're not actual errors
    return;
  }
  
  // Filter out deprecation warnings
  if (error.includes('DeprecationWarning') || error.includes('DEP0040')) {
    // Skip deprecation warnings
    return;
  }
  
  console.log(`⏱️  ${timestamp} - ❌ ERROR: ${error.trim()}`);
});

buildProcess.on('close', (code) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log('=' .repeat(60));
  
  if (code === 0) {
    console.log(`⏱️  ${timestamp} - 🎉 Build completed successfully!`);
    
    // Check build output
    const buildDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(buildDir)) {
      const stats = fs.statSync(buildDir);
      console.log(`📁 Build directory size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    }
    
    // Show build summary
    const routeMatches = buildOutput.match(/Route \(.*?\)/g);
    if (routeMatches) {
      console.log(`📊 Total routes built: ${routeMatches.length}`);
    }
    
  } else {
    console.log(`⏱️  ${timestamp} - 💥 Build failed with exit code ${code}`);
  }
  
  console.log('⏰ End time:', new Date().toISOString());
  console.log('=' .repeat(60));
  
  process.exit(code);
});

buildProcess.on('error', (error) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`⏱️  ${timestamp} - 💥 Build process error: ${error.message}`);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Build interrupted by user');
  buildProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Build terminated');
  buildProcess.kill('SIGTERM');
}); 