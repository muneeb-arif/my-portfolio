// Debug test for authentication flow
const API_BASE = 'http://localhost:3001/api';

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${emoji} [${timestamp}] ${message}`);
};

const testAuthFlow = async () => {
  try {
    log('🔍 Testing authentication flow...');
    
    // Step 1: Login
    log('Step 1: Attempting login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'muneebarif11@gmail.com',
        password: '11223344'
      })
    });
    
    const loginData = await loginResponse.json();
    log(`Login response status: ${loginResponse.status}`);
    log(`Login success: ${loginData.success}`);
    
    if (!loginData.success) {
      throw new Error(`Login failed: ${loginData.error}`);
    }
    
    const token = loginData.token;
    log(`Token received: ${token ? 'Yes' : 'No'}`);
    log(`Token length: ${token?.length || 0}`);
    log(`Token preview: ${token ? token.substring(0, 50) + '...' : 'None'}`);
    
    // Step 2: Test token with settings endpoint (which works)
    log('Step 2: Testing token with settings endpoint...');
    const settingsResponse = await fetch(`${API_BASE}/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const settingsData = await settingsResponse.json();
    log(`Settings response status: ${settingsResponse.status}`);
    log(`Settings success: ${settingsData.success}`);
    
    if (!settingsData.success) {
      log(`Settings error: ${settingsData.error}`, 'warning');
    }
    
    // Step 3: Test token with dashboard projects endpoint (which fails)
    log('Step 3: Testing token with dashboard projects endpoint...');
    const projectsResponse = await fetch(`${API_BASE}/dashboard/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const projectsData = await projectsResponse.json();
    log(`Projects response status: ${projectsResponse.status}`);
    log(`Projects success: ${projectsData.success}`);
    
    if (!projectsData.success) {
      log(`Projects error: ${projectsData.error}`, 'error');
    }
    
    // Step 4: Test token with other dashboard endpoints
    log('Step 4: Testing other dashboard endpoints...');
    
    const endpoints = [
      '/categories',
      '/technologies', 
      '/niches',
      '/skills'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        log(`${endpoint}: ${response.status} - ${data.success ? 'Success' : 'Failed'}`);
        
        if (!data.success) {
          log(`  Error: ${data.error}`, 'warning');
        }
      } catch (error) {
        log(`${endpoint}: Error - ${error.message}`, 'error');
      }
    }
    
    // Step 5: Decode token manually to check payload
    log('Step 5: Decoding token payload...');
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        log(`Token payload: ${JSON.stringify(payload, null, 2)}`);
        log(`User ID: ${payload.id}`);
        log(`User Email: ${payload.email}`);
        log(`Token expiration: ${new Date(payload.exp * 1000).toISOString()}`);
      } else {
        log('Invalid token format', 'error');
      }
    } catch (error) {
      log(`Token decode error: ${error.message}`, 'error');
    }
    
  } catch (error) {
    log(`Auth flow test failed: ${error.message}`, 'error');
  }
};

// Run the test
testAuthFlow(); 