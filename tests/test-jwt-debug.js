// Debug script to test JWT token from login
const API_BASE = 'http://localhost:3001/api';
const TEST_EMAIL = 'muneebarif11@gmail.com';
const TEST_PASSWORD = '11223344';

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${emoji} [${timestamp}] ${message}`);
};

const testLoginAndToken = async () => {
  try {
    log('🔍 Testing login and token...');
    
    // Step 1: Login to get token
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok || !loginData.success) {
      throw new Error(`Login failed: ${loginData.error}`);
    }
    
    const token = loginData.token;
    log(`✅ Login successful, got token: ${token.substring(0, 50)}...`);
    
    // Step 2: Test token with a simple authenticated request
    log('🔍 Testing token with settings request...');
    
    const settingsResponse = await fetch(`${API_BASE}/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const settingsData = await settingsResponse.json();
    
    log(`📊 Settings response status: ${settingsResponse.status}`);
    log(`📊 Settings response:`, settingsData);
    
    if (!settingsResponse.ok) {
      throw new Error(`Settings request failed: ${settingsData.error}`);
    }
    
    log('✅ Token is working correctly!');
    
    // Step 3: Test token format
    log('🔍 Analyzing token format...');
    const tokenParts = token.split('.');
    log(`Token has ${tokenParts.length} parts`);
    
    if (tokenParts.length === 3) {
      try {
        const header = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString());
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        
        log('Token header:', header);
        log('Token payload:', payload);
        
        const now = Math.floor(Date.now() / 1000);
        const expiresIn = payload.exp - now;
        
        log(`Token expires in ${expiresIn} seconds (${Math.floor(expiresIn / 3600)} hours)`);
        
        if (expiresIn <= 0) {
          log('⚠️ Token has expired!', 'warning');
        } else {
          log('✅ Token is still valid');
        }
      } catch (error) {
        log(`❌ Error parsing token: ${error.message}`, 'error');
      }
    } else {
      log('❌ Token format is invalid (should have 3 parts)', 'error');
    }
    
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'error');
  }
};

// Run the test
testLoginAndToken(); 