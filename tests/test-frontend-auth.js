// Test frontend authentication flow
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${emoji} [${timestamp}] ${message}`);
};

const testFrontendAuth = async () => {
  try {
    log('🔍 Testing frontend authentication flow...');
    
    // Step 1: Simulate frontend login
    log('Step 1: Simulating frontend login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'muneebarif11@gmail.com',
        password: '11223344'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error(`Login failed: ${loginData.error}`);
    }
    
    const token = loginData.token;
    log(`Token received: ${token ? 'Yes' : 'No'}`);
    
    // Step 2: Simulate storing token in localStorage (like frontend does)
    log('Step 2: Simulating token storage...');
    // In a real browser, this would be: localStorage.setItem('api_token', token);
    log(`Token would be stored in localStorage as: ${token.substring(0, 50)}...`);
    
    // Step 3: Test the exact request that's failing
    log('Step 3: Testing the failing request...');
    const projectId = '07815290-0990-4e3a-acf3-6384d53dbdd0';
    const testImageData = {
      url: 'https://example.com/test-image.jpg',
      path: 'test-user/1234567890_test-image.jpg',
      name: 'test-image.jpg',
      original_name: 'test-image.jpg',
      size: 1024000,
      type: 'image/jpeg',
      bucket: 'images',
      order_index: 1
    };
    
    log(`Making POST request to: ${API_BASE}/projects/${projectId}/images`);
    log(`Request headers: Authorization: Bearer ${token.substring(0, 50)}...`);
    log(`Request body: ${JSON.stringify(testImageData, null, 2)}`);
    
    const postResponse = await fetch(`${API_BASE}/projects/${projectId}/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testImageData)
    });
    
    log(`Response status: ${postResponse.status}`);
    log(`Response headers: ${JSON.stringify(Object.fromEntries(postResponse.headers.entries()), null, 2)}`);
    
    const postData = await postResponse.json();
    log(`Response body: ${JSON.stringify(postData, null, 2)}`);
    
    if (postResponse.ok) {
      log('✅ Request succeeded!', 'success');
    } else {
      log(`❌ Request failed with status ${postResponse.status}`, 'error');
    }
    
    // Step 4: Test with different project ID to see if it's project-specific
    log('Step 4: Testing with a different project...');
    const projectsResponse = await fetch(`${API_BASE}/dashboard/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const projectsData = await projectsResponse.json();
    if (projectsData.success && projectsData.data.length > 1) {
      const differentProjectId = projectsData.data[1].id;
      log(`Testing with different project ID: ${differentProjectId}`);
      
      const postResponse2 = await fetch(`${API_BASE}/projects/${differentProjectId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testImageData)
      });
      
      log(`Different project response status: ${postResponse2.status}`);
      const postData2 = await postResponse2.json();
      log(`Different project response: ${JSON.stringify(postData2, null, 2)}`);
    }
    
  } catch (error) {
    log(`Frontend auth test failed: ${error.message}`, 'error');
  }
};

// Run the test
testFrontendAuth(); 