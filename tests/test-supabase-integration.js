// Comprehensive test script for API + Supabase integration
// This will help identify where the "fetch failed" errors are coming from

const API_BASE = 'http://localhost:3001/api';
const TEST_EMAIL = 'muneebarif11@gmail.com';
const TEST_PASSWORD = '11223344';

// Test utilities
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${emoji} [${timestamp}] ${message}`);
};

const testApi = async (name, testFn) => {
  try {
    log(`Testing ${name}...`);
    await testFn();
    log(`${name} passed`, 'success');
    return true;
  } catch (error) {
    log(`${name} failed: ${error.message}`, 'error');
    return false;
  }
};

// Test 1: API Health Check
const testApiHealth = async () => {
  const response = await fetch(`${API_BASE}/health`);
  const data = await response.json();
  
  if (!response.ok || data.status !== 'healthy') {
    throw new Error(`Health check failed: ${data.status}`);
  }
};

// Test 2: Supabase Connectivity via API
const testSupabaseViaApi = async () => {
  const response = await fetch(`${API_BASE}/supabase-test`);
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(`Supabase test failed: ${data.error}`);
  }
  
  log(`Supabase details: ${JSON.stringify(data.details, null, 2)}`);
};

// Test 3: Public Projects (API only)
const testPublicProjects = async () => {
  const response = await fetch(`${API_BASE}/projects`);
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(`Public projects failed: ${data.error}`);
  }
  
  log(`Found ${data.data?.length || 0} public projects`);
  
  // Check if projects have images
  if (data.data && data.data.length > 0) {
    const project = data.data[0];
    log(`Sample project: ${project.title} (${project.project_images?.length || 0} images)`);
    
    if (project.project_images && project.project_images.length > 0) {
      const image = project.project_images[0];
      log(`Sample image URL: ${image.url}`);
      
      // Test if image URL is accessible
      try {
        const imageResponse = await fetch(image.url, { method: 'HEAD' });
        if (imageResponse.ok) {
          log('Image URL is accessible', 'success');
        } else {
          log(`Image URL returned status: ${imageResponse.status}`, 'warning');
        }
      } catch (imageError) {
        log(`Image URL fetch failed: ${imageError.message}`, 'error');
      }
    }
  }
};

// Test 4: Authentication
const testAuthentication = async () => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    })
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(`Authentication failed: ${data.error}`);
  }
  
  log('Authentication successful');
  return data.token;
};

// Test 5: Protected Endpoints
const testProtectedEndpoints = async (token) => {
  const headers = { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  // Test categories
  const categoriesResponse = await fetch(`${API_BASE}/categories`, { headers });
  const categoriesData = await categoriesResponse.json();
  
  if (!categoriesResponse.ok || !categoriesData.success) {
    throw new Error(`Categories failed: ${categoriesData.error}`);
  }
  
  log(`Found ${categoriesData.data?.length || 0} categories`);
  
  // Test technologies
  const technologiesResponse = await fetch(`${API_BASE}/technologies`, { headers });
  const technologiesData = await technologiesResponse.json();
  
  if (!technologiesResponse.ok || !technologiesData.success) {
    throw new Error(`Technologies failed: ${technologiesData.error}`);
  }
  
  log(`Found ${technologiesData.data?.length || 0} technologies`);
  
  // Test skills
  const skillsResponse = await fetch(`${API_BASE}/skills`, { headers });
  const skillsData = await skillsResponse.json();
  
  if (!skillsResponse.ok || !skillsData.success) {
    throw new Error(`Skills failed: ${skillsData.error}`);
  }
  
  log(`Found ${skillsData.data?.length || 0} skills`);
  
  // Test niches
  const nichesResponse = await fetch(`${API_BASE}/niches`, { headers });
  const nichesData = await nichesResponse.json();
  
  if (!nichesResponse.ok || !nichesData.success) {
    throw new Error(`Niches failed: ${nichesData.error}`);
  }
  
  log(`Found ${nichesData.data?.length || 0} niches`);
  
  // Test contact queries
  const queriesResponse = await fetch(`${API_BASE}/contact-queries`, { headers });
  const queriesData = await queriesResponse.json();
  
  if (!queriesResponse.ok || !queriesData.success) {
    throw new Error(`Contact queries failed: ${queriesData.error}`);
  }
  
  log(`Found ${queriesData.data?.length || 0} contact queries`);
  
  // Test settings
  const settingsResponse = await fetch(`${API_BASE}/settings`, { headers });
  const settingsData = await settingsResponse.json();
  
  if (!settingsResponse.ok || !settingsData.success) {
    throw new Error(`Settings failed: ${settingsData.error}`);
  }
  
  log(`Found ${Object.keys(settingsData.data || {}).length} settings`);
};

// Test 6: Direct Supabase Test (if running in browser environment)
const testDirectSupabase = async () => {
  // This would only work in a browser environment with Supabase client
  log('Direct Supabase test skipped (requires browser environment)', 'warning');
};

// Main test function
const runAllTests = async () => {
  console.log('🚀 Starting Comprehensive API + Supabase Integration Tests...\n');
  
  const results = {
    apiHealth: false,
    supabaseViaApi: false,
    publicProjects: false,
    authentication: false,
    protectedEndpoints: false,
    directSupabase: false
  };
  
  try {
    // Test 1: API Health
    results.apiHealth = await testApi('API Health Check', testApiHealth);
    
    // Test 2: Supabase via API
    results.supabaseViaApi = await testApi('Supabase via API', testSupabaseViaApi);
    
    // Test 3: Public Projects
    results.publicProjects = await testApi('Public Projects', testPublicProjects);
    
    // Test 4: Authentication
    const token = await testApi('Authentication', testAuthentication);
    results.authentication = !!token;
    
    // Test 5: Protected Endpoints
    if (token) {
      results.protectedEndpoints = await testApi('Protected Endpoints', () => testProtectedEndpoints(token));
    }
    
    // Test 6: Direct Supabase (skipped)
    results.directSupabase = await testApi('Direct Supabase', testDirectSupabase);
    
  } catch (error) {
    log(`Test suite failed: ${error.message}`, 'error');
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} ${test}`);
  });
  
  const passedCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log('\n' + '='.repeat(60));
  console.log(`🎯 OVERALL: ${passedCount}/${totalCount} tests passed`);
  
  if (passedCount === totalCount) {
    console.log('🎉 All tests passed! Your API + Supabase integration is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the details above for specific issues.');
    
    if (!results.supabaseViaApi) {
      console.log('\n🔧 SUPABASE ISSUES DETECTED:');
      console.log('   - Check your Supabase environment variables');
      console.log('   - Verify your Supabase project is active');
      console.log('   - Ensure your API has network access to Supabase');
    }
    
    if (!results.apiHealth) {
      console.log('\n🔧 API ISSUES DETECTED:');
      console.log('   - Make sure your API server is running on port 3001');
      console.log('   - Check your MySQL database connection');
    }
  }
  
  console.log('='.repeat(60));
};

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  runAllTests().catch(console.error);
} else {
  // Browser environment
  window.runSupabaseTests = runAllTests;
  console.log('🌐 Browser environment detected. Run window.runSupabaseTests() to start tests.');
}

module.exports = {
  runAllTests,
  testApiHealth,
  testSupabaseViaApi,
  testPublicProjects,
  testAuthentication,
  testProtectedEndpoints
}; 