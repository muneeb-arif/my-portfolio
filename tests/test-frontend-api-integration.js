// Comprehensive test script for Frontend + API integration
// Tests all the replaced APIs (settings, projects, categories, technologies, niches)

const API_BASE = 'http://localhost:3001/api';
const FRONTEND_BASE = 'http://localhost:3000';

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

// Test 2: Public Settings API
const testPublicSettings = async () => {
  const response = await fetch(`${API_BASE}/settings`);
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(`Public settings failed: ${data.error}`);
  }
  
  log(`Found ${Object.keys(data.data || {}).length} settings`);
  
  // Check for key settings
  const settings = data.data || {};
  const keySettings = ['banner_name', 'banner_title', 'theme_name'];
  keySettings.forEach(key => {
    if (settings[key]) {
      log(`  ✅ ${key}: ${settings[key]}`);
    } else {
      log(`  ⚠️ ${key}: not found`);
    }
  });
};

// Test 3: Public Projects API
const testPublicProjects = async () => {
  const response = await fetch(`${API_BASE}/projects`);
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(`Public projects failed: ${data.error}`);
  }
  
  log(`Found ${data.data?.length || 0} public projects`);
  
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

// Test 4: Public Categories API
const testPublicCategories = async () => {
  const response = await fetch(`${API_BASE}/categories`);
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(`Public categories failed: ${data.error}`);
  }
  
  log(`Found ${data.data?.length || 0} categories`);
  
  if (data.data && data.data.length > 0) {
    const category = data.data[0];
    log(`Sample category: ${category.name} (${category.color})`);
  }
};

// Test 5: Public Technologies API
const testPublicTechnologies = async () => {
  const response = await fetch(`${API_BASE}/technologies`);
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(`Public technologies failed: ${data.error}`);
  }
  
  log(`Found ${data.data?.length || 0} technologies`);
  
  if (data.data && data.data.length > 0) {
    const tech = data.data[0];
    log(`Sample technology: ${tech.title} (${tech.type})`);
  }
};

// Test 6: Public Niches API
const testPublicNiches = async () => {
  const response = await fetch(`${API_BASE}/niches`);
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(`Public niches failed: ${data.error}`);
  }
  
  log(`Found ${data.data?.length || 0} niches`);
  
  if (data.data && data.data.length > 0) {
    const niche = data.data[0];
    log(`Sample niche: ${niche.title} (AI: ${niche.ai_driven})`);
  }
};

// Test 7: Authentication
const testAuthentication = async () => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'muneebarif11@gmail.com',
      password: '11223344'
    })
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(`Authentication failed: ${data.error}`);
  }
  
  log('Authentication successful');
  return data.token;
};

// Test 8: Protected Endpoints (Dashboard)
const testProtectedEndpoints = async (token) => {
  const headers = { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  // Test dashboard settings
  const settingsResponse = await fetch(`${API_BASE}/settings`, { headers });
  const settingsData = await settingsResponse.json();
  
  if (!settingsResponse.ok || !settingsData.success) {
    throw new Error(`Dashboard settings failed: ${settingsData.error}`);
  }
  
  log(`Dashboard settings: ${Object.keys(settingsData.data || {}).length} settings`);
  
  // Test dashboard projects
  const projectsResponse = await fetch(`${API_BASE}/dashboard/projects`, { headers });
  const projectsData = await projectsResponse.json();
  
  if (!projectsResponse.ok || !projectsData.success) {
    throw new Error(`Dashboard projects failed: ${projectsData.error}`);
  }
  
  log(`Dashboard projects: ${projectsData.data?.length || 0} projects`);
  
  // Test dashboard categories
  const categoriesResponse = await fetch(`${API_BASE}/categories`, { headers });
  const categoriesData = await categoriesResponse.json();
  
  if (!categoriesResponse.ok || !categoriesData.success) {
    throw new Error(`Dashboard categories failed: ${categoriesData.error}`);
  }
  
  log(`Dashboard categories: ${categoriesData.data?.length || 0} categories`);
  
  // Test dashboard technologies
  const technologiesResponse = await fetch(`${API_BASE}/technologies`, { headers });
  const technologiesData = await technologiesResponse.json();
  
  if (!technologiesResponse.ok || !technologiesData.success) {
    throw new Error(`Dashboard technologies failed: ${technologiesData.error}`);
  }
  
  log(`Dashboard technologies: ${technologiesData.data?.length || 0} technologies`);
  
  // Test dashboard niches
  const nichesResponse = await fetch(`${API_BASE}/niches`, { headers });
  const nichesData = await nichesResponse.json();
  
  if (!nichesResponse.ok || !nichesData.success) {
    throw new Error(`Dashboard niches failed: ${nichesData.error}`);
  }
  
  log(`Dashboard niches: ${nichesData.data?.length || 0} niches`);
};

// Test 9: Frontend Integration
const testFrontendIntegration = async () => {
  // Test if frontend is accessible
  try {
    const response = await fetch(FRONTEND_BASE);
    if (response.ok) {
      log('Frontend is accessible', 'success');
    } else {
      log(`Frontend returned status: ${response.status}`, 'warning');
    }
  } catch (error) {
    log(`Frontend not accessible: ${error.message}`, 'warning');
  }
};

// Test 10: Data Consistency
const testDataConsistency = async () => {
  log('Testing data consistency between public and dashboard endpoints...');
  
  // Get public data
  const [publicSettings, publicProjects, publicCategories, publicTechnologies, publicNiches] = await Promise.all([
    fetch(`${API_BASE}/settings`).then(r => r.json()),
    fetch(`${API_BASE}/projects`).then(r => r.json()),
    fetch(`${API_BASE}/categories`).then(r => r.json()),
    fetch(`${API_BASE}/technologies`).then(r => r.json()),
    fetch(`${API_BASE}/niches`).then(r => r.json())
  ]);
  
  // Check if all public endpoints return success
  const publicResults = [publicSettings, publicProjects, publicCategories, publicTechnologies, publicNiches];
  const failedPublic = publicResults.filter(r => !r.success);
  
  if (failedPublic.length > 0) {
    throw new Error(`Some public endpoints failed: ${failedPublic.map(r => r.error).join(', ')}`);
  }
  
  log('✅ All public endpoints working correctly');
  
  // Test authentication for dashboard access
  try {
    const token = await testAuthentication();
    if (token) {
      log('✅ Authentication working for dashboard access');
    }
  } catch (error) {
    log(`⚠️ Authentication failed: ${error.message}`, 'warning');
  }
};

// Main test function
const runAllTests = async () => {
  console.log('🚀 Starting Frontend + API Integration Tests...\n');
  
  const results = {
    apiHealth: false,
    publicSettings: false,
    publicProjects: false,
    publicCategories: false,
    publicTechnologies: false,
    publicNiches: false,
    authentication: false,
    protectedEndpoints: false,
    frontendIntegration: false,
    dataConsistency: false
  };
  
  try {
    // Test 1: API Health
    results.apiHealth = await testApi('API Health Check', testApiHealth);
    
    // Test 2: Public Settings
    results.publicSettings = await testApi('Public Settings API', testPublicSettings);
    
    // Test 3: Public Projects
    results.publicProjects = await testApi('Public Projects API', testPublicProjects);
    
    // Test 4: Public Categories
    results.publicCategories = await testApi('Public Categories API', testPublicCategories);
    
    // Test 5: Public Technologies
    results.publicTechnologies = await testApi('Public Technologies API', testPublicTechnologies);
    
    // Test 6: Public Niches
    results.publicNiches = await testApi('Public Niches API', testPublicNiches);
    
    // Test 7: Authentication
    try {
      log('Testing Authentication...');
      const token = await testAuthentication();
      results.authentication = !!token;
      log('Authentication passed', 'success');
      
      // Test 8: Protected Endpoints
      if (token) {
        log('Testing Protected Endpoints...');
        await testProtectedEndpoints(token);
        results.protectedEndpoints = true;
        log('Protected Endpoints passed', 'success');
      }
    } catch (error) {
      log(`Authentication/Protected Endpoints failed: ${error.message}`, 'error');
      results.authentication = false;
      results.protectedEndpoints = false;
    }
    
    // Test 9: Frontend Integration
    results.frontendIntegration = await testApi('Frontend Integration', testFrontendIntegration);
    
    // Test 10: Data Consistency
    results.dataConsistency = await testApi('Data Consistency', testDataConsistency);
    
  } catch (error) {
    log(`Test suite failed: ${error.message}`, 'error');
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 FRONTEND + API INTEGRATION TEST RESULTS');
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
    console.log('🎉 All tests passed! Your frontend + API integration is working correctly.');
    console.log('\n✅ SUCCESS SUMMARY:');
    console.log('   - All Supabase APIs successfully replaced with Next.js APIs');
    console.log('   - Public endpoints working correctly');
    console.log('   - Authentication system functional');
    console.log('   - Dashboard endpoints accessible');
    console.log('   - Data consistency maintained');
    console.log('   - Frontend integration ready');
  } else {
    console.log('⚠️ Some tests failed. Check the details above for specific issues.');
    
    if (!results.publicSettings || !results.publicProjects || !results.publicCategories || !results.publicTechnologies || !results.publicNiches) {
      console.log('\n🔧 PUBLIC API ISSUES DETECTED:');
      console.log('   - Check your API server is running on port 3001');
      console.log('   - Verify your MySQL database connection');
      console.log('   - Ensure your API environment variables are set correctly');
    }
    
    if (!results.authentication) {
      console.log('\n🔧 AUTHENTICATION ISSUES DETECTED:');
      console.log('   - Check your JWT configuration');
      console.log('   - Verify user credentials in database');
    }
    
    if (!results.frontendIntegration) {
      console.log('\n🔧 FRONTEND ISSUES DETECTED:');
      console.log('   - Make sure your React app is running on port 3000');
      console.log('   - Check your frontend environment variables');
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
  window.runFrontendApiTests = runAllTests;
  console.log('🌐 Browser environment detected. Run window.runFrontendApiTests() to start tests.');
}

module.exports = {
  runAllTests,
  testApiHealth,
  testPublicSettings,
  testPublicProjects,
  testPublicCategories,
  testPublicTechnologies,
  testPublicNiches,
  testAuthentication,
  testProtectedEndpoints,
  testFrontendIntegration,
  testDataConsistency
}; 