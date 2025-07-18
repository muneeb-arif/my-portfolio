#!/usr/bin/env node

/**
 * Test script for Shared Hosting Updates API
 * Tests the MySQL-based API endpoints
 */

const API_BASE = 'http://localhost:3001/api';

// Test data
const testUpdate = {
  version: '1.2.0',
  title: 'Test Update - Performance Improvements',
  description: 'This is a test update for the shared hosting system',
  release_notes: '- Fixed navigation bug\n- Improved mobile responsiveness\n- Updated dependencies',
  package_url: 'https://example.com/updates/v1.2.0.zip',
  special_instructions: 'Please backup your site before applying this update',
  channel: 'stable',
  is_critical: false
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAuth() {
  log('\n🔐 Testing authentication...', 'blue');
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'muneebarif11@gmail.com',
        password: '11223344'
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.token) {
      log('✅ Authentication successful', 'green');
      return data.token;
    } else {
      log(`❌ Authentication failed: ${data.error}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Authentication error: ${error.message}`, 'red');
    return null;
  }
}

async function testCreateUpdate(token) {
  log('\n📦 Testing create update...', 'blue');
  
  try {
    const response = await fetch(`${API_BASE}/shared-hosting-updates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testUpdate)
    });
    
    const data = await response.json();
    
    if (data.success && data.data) {
      log('✅ Update created successfully', 'green');
      log(`📋 Update ID: ${data.data.id}`, 'yellow');
      return data.data.id;
    } else {
      log(`❌ Create update failed: ${data.error}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Create update error: ${error.message}`, 'red');
    return null;
  }
}

async function testGetUpdates(token) {
  log('\n📋 Testing get updates...', 'blue');
  
  try {
    const response = await fetch(`${API_BASE}/shared-hosting-updates`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success && Array.isArray(data.data)) {
      log(`✅ Retrieved ${data.data.length} updates`, 'green');
      data.data.forEach(update => {
        log(`  - ${update.title} (v${update.version}) - ${update.is_active ? 'Active' : 'Inactive'}`, 'yellow');
      });
      return data.data;
    } else {
      log(`❌ Get updates failed: ${data.error}`, 'red');
      return [];
    }
  } catch (error) {
    log(`❌ Get updates error: ${error.message}`, 'red');
    return [];
  }
}

async function testUpdateStatus(token, updateId) {
  log('\n🔄 Testing update status toggle...', 'blue');
  
  try {
    const response = await fetch(`${API_BASE}/shared-hosting-updates?id=${updateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ is_active: false })
    });
    
    const data = await response.json();
    
    if (data.success) {
      log('✅ Update status changed successfully', 'green');
      return true;
    } else {
      log(`❌ Update status change failed: ${data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Update status error: ${error.message}`, 'red');
    return false;
  }
}

async function testDeleteUpdate(token, updateId) {
  log('\n🗑️ Testing delete update...', 'blue');
  
  try {
    const response = await fetch(`${API_BASE}/shared-hosting-updates?id=${updateId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      log('✅ Update deleted successfully', 'green');
      return true;
    } else {
      log(`❌ Delete update failed: ${data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Delete update error: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('🚀 Starting Shared Hosting Updates API Tests', 'blue');
  log('============================================', 'blue');
  
  // Test 1: Authentication
  const token = await testAuth();
  if (!token) {
    log('\n❌ Cannot proceed without authentication', 'red');
    return;
  }
  
  // Test 2: Create update
  const updateId = await testCreateUpdate(token);
  if (!updateId) {
    log('\n❌ Cannot proceed without creating an update', 'red');
    return;
  }
  
  // Test 3: Get updates
  await testGetUpdates(token);
  
  // Test 4: Update status
  await testUpdateStatus(token, updateId);
  
  // Test 5: Delete update
  await testDeleteUpdate(token, updateId);
  
  log('\n🎉 All tests completed!', 'green');
  log('============================================', 'blue');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    log(`\n💥 Test suite failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  testAuth,
  testCreateUpdate,
  testGetUpdates,
  testUpdateStatus,
  testDeleteUpdate,
  runTests
}; 