#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Test configuration files
console.log('🔍 Testing Current Setup Status...\n');

// Check if we're in React project mode or Next.js mode
function detectProjectMode() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const isNextJs = packageJson.dependencies && packageJson.dependencies.next;
  const isReact = packageJson.dependencies && (packageJson.dependencies.react || packageJson.dependencies['react-scripts']);
  
  if (isNextJs && !isReact) {
    return 'nextjs-only';
  } else if (isNextJs && isReact) {
    return 'hybrid';
  } else if (isReact) {
    return 'react-only';
  } else {
    return 'unknown';
  }
}

// Check environment configuration
function checkEnvironmentConfig() {
  console.log('📋 Environment Configuration:');
  
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    console.log('✅ .env file found');
    
    // Check key environment variables
    const envLines = envContent.split('\n');
    const envVars = {};
    envLines.forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        envVars[key.trim()] = value.trim();
      }
    });
    
    // Check API service flags
    const useApiService = envVars['REACT_APP_USE_API_SERVICE'];
    const hybridMode = envVars['REACT_APP_ENABLE_HYBRID_MODE'];
    const apiUrl = envVars['REACT_APP_API_URL'];
    
    console.log(`   - REACT_APP_USE_API_SERVICE: ${useApiService || 'not set'}`);
    console.log(`   - REACT_APP_ENABLE_HYBRID_MODE: ${hybridMode || 'not set'}`);
    console.log(`   - REACT_APP_API_URL: ${apiUrl || 'not set'}`);
    
    return { useApiService, hybridMode, apiUrl };
  } else {
    console.log('❌ .env file not found');
    return {};
  }
}

// Check directory structure
function checkDirectoryStructure() {
  console.log('\n📁 Directory Structure:');
  
  const requiredDirs = [
    'src/',
    'src/services/',
    'src/components/',
    'nextjs-api/',
    'nextjs-api/pages/api/',
    'public/'
  ];
  
  requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`✅ ${dir} exists`);
    } else {
      console.log(`❌ ${dir} missing`);
    }
  });
}

// Check service files
function checkServiceFiles() {
  console.log('\n🔧 Service Files:');
  
  const serviceFiles = [
    'src/services/supabaseService.js',
    'src/services/serviceAdapter.js',
    'src/services/apiAuthService.js',
    'src/services/apiProjectService.js',
    'src/services/apiDashboardService.js',
    'src/services/apiPortfolioService.js'
  ];
  
  serviceFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      const size = Math.round(stats.size / 1024);
      console.log(`✅ ${file} (${size}KB)`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  });
}

// Check Next.js API files
function checkNextJsApiFiles() {
  console.log('\n🚀 Next.js API Files:');
  
  if (!fs.existsSync('nextjs-api/')) {
    console.log('❌ nextjs-api directory not found');
    return;
  }
  
  const apiFiles = [
    'nextjs-api/pages/api/auth/login.js',
    'nextjs-api/pages/api/portfolio/projects.js',
    'nextjs-api/pages/api/portfolio/settings.js',
    'nextjs-api/pages/api/dashboard/projects/index.js',
    'nextjs-api/lib/database.js',
    'nextjs-api/lib/auth.js'
  ];
  
  apiFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  });
}

// Main test function
function runTests() {
  console.log('Portfolio Setup Status Report');
  console.log('==================================\n');
  
  const projectMode = detectProjectMode();
  console.log(`🏗️  Project Mode: ${projectMode}\n`);
  
  const envConfig = checkEnvironmentConfig();
  checkDirectoryStructure();
  checkServiceFiles();
  checkNextJsApiFiles();
  
  console.log('\n📊 Summary:');
  
  if (projectMode === 'react-only') {
    console.log('📱 Current Status: Pure React application');
    console.log('🔄 Next Steps: Ready for hybrid setup');
  } else if (projectMode === 'hybrid') {
    console.log('🔄 Current Status: Hybrid React + Next.js setup');
    
    if (envConfig.useApiService === 'true') {
      console.log('🎯 Service Mode: Using Next.js API');
    } else {
      console.log('🎯 Service Mode: Using Supabase (fallback ready)');
    }
  } else if (projectMode === 'nextjs-only') {
    console.log('⚠️  Current Status: Next.js only (React components missing)');
  }
  
  console.log('\n✅ Test completed successfully!');
}

// Run the tests
try {
  runTests();
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
} 