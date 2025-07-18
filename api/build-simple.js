#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config();

const { spawn } = require('child_process');

console.log('🚀 Starting build process...');
console.log('⏰ Start time:', new Date().toISOString());
console.log('💡 Note: Filtering out expected warnings (MySQL2 config, Next.js dynamic routes)');
console.log('=' .repeat(50));

let step = 0;
const totalSteps = 5;

function logStep(message) {
  step++;
  const timestamp = new Date().toLocaleTimeString();
  console.log(`⏱️  ${timestamp} - [${step}/${totalSteps}] ${message}`);
}

// Start the build process
const buildProcess = spawn('npx', ['next', 'build', '--debug'], {
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'production' }
});

buildProcess.stdout.on('data', (data) => {
  const output = data.toString();
  
  // Log key milestones
  if (output.includes('Creating an optimized production build')) {
    logStep('🔨 Creating optimized production build...');
  } else if (output.includes('Compiled successfully')) {
    logStep('✅ Compiled successfully');
  } else if (output.includes('Linting and checking validity of types')) {
    logStep('🔍 Linting and type checking...');
  } else if (output.includes('Collecting page data')) {
    logStep('📄 Collecting page data...');
  } else if (output.includes('Generating static pages')) {
    logStep('🏗️  Generating static pages...');
  } else if (output.includes('Finalizing page optimization')) {
    logStep('🎯 Finalizing optimization...');
  }
  
  // Show progress for static page generation
  const staticMatch = output.match(/Generating static pages \((\d+)\/(\d+)\)/);
  if (staticMatch) {
    const current = staticMatch[1];
    const total = staticMatch[2];
    const percentage = Math.round((current / total) * 100);
    console.log(`   📊 Progress: ${current}/${total} pages (${percentage}%)`);
  }
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
  
  // Filter out Next.js dynamic server usage warnings
  if (error.includes('Dynamic server usage') || error.includes('couldn\'t be rendered statically')) {
    // Skip these warnings - they're expected for API routes
    return;
  }
  
  console.log(`⏱️  ${timestamp} - ❌ ERROR: ${error.trim()}`);
});

buildProcess.on('close', (code) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log('=' .repeat(50));
  
  if (code === 0) {
    console.log(`⏱️  ${timestamp} - 🎉 Build completed successfully!`);
  } else {
    console.log(`⏱️  ${timestamp} - 💥 Build failed with exit code ${code}`);
  }
  
  console.log('⏰ End time:', new Date().toISOString());
  console.log('=' .repeat(50));
  
  process.exit(code);
});

buildProcess.on('error', (error) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`⏱️  ${timestamp} - 💥 Build process error: ${error.message}`);
  process.exit(1);
}); 