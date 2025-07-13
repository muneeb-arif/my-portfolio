// Comprehensive test script for React + API integration
// This will test all the new API-based services in the React frontend

const API_BASE = 'http://localhost:3001/api';
const FRONTEND_BASE = 'http://localhost:3000';
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
    const result = await testFn();
    log(`${name} passed`, 'success');
    return result; // Return the actual result instead of always true
  } catch (error) {
    log(`${name} failed: ${error.message}`, 'error');
    return false;
  }
};

// Test 1: Frontend Health Check
const testFrontendHealth = async () => {
  const response = await fetch(FRONTEND_BASE);
  if (!response.ok) {
    throw new Error(`Frontend returned status: ${response.status}`);
  }
};

// Test 2: API Health Check
const testApiHealth = async () => {
  const response = await fetch(`${API_BASE}/health`);
  const data = await response.json();
  
  if (!response.ok || data.status !== 'healthy') {
    throw new Error(`Health check failed: ${data.status}`);
  }
};

// Test 3: Authentication
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

// Test 4: Settings API
const testSettingsAPI = async (token) => {
  const headers = { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  // Test get settings
  const getResponse = await fetch(`${API_BASE}/settings`, { headers });
  const getData = await getResponse.json();
  
  if (!getResponse.ok || !getData.success) {
    throw new Error(`Get settings failed: ${getData.error}`);
  }
  
  log(`Found ${Object.keys(getData.data || {}).length} settings`);
  
  // Test update settings
  const testSettings = {
    test_setting: 'test_value',
    test_number: 123,
    test_boolean: true
  };
  
  const updateResponse = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(testSettings)
  });
  
  const updateData = await updateResponse.json();
  
  if (!updateResponse.ok || !updateData.success) {
    throw new Error(`Update settings failed: ${updateData.error}`);
  }
  
  log('Settings updated successfully');
};

// Test 5: Projects API
const testProjectsAPI = async (token) => {
  const headers = { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  // Test get user projects
  const userProjectsResponse = await fetch(`${API_BASE}/dashboard/projects`, { headers });
  const userProjectsData = await userProjectsResponse.json();
  
  if (!userProjectsResponse.ok || !userProjectsData.success) {
    throw new Error(`Get user projects failed: ${userProjectsData.error}`);
  }
  
  log(`Found ${userProjectsData.data?.length || 0} user projects`);
  
  // Test get public projects
  const publicProjectsResponse = await fetch(`${API_BASE}/projects`);
  const publicProjectsData = await publicProjectsResponse.json();
  
  if (!publicProjectsResponse.ok || !publicProjectsData.success) {
    throw new Error(`Get public projects failed: ${publicProjectsData.error}`);
  }
  
  log(`Found ${publicProjectsData.data?.length || 0} public projects`);
  
  // Test create project
  const testProject = {
    title: 'Test Project',
    description: 'This is a test project',
    category: 'Web Development',
    status: 'draft'
  };
  
  const createResponse = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers,
    body: JSON.stringify(testProject)
  });
  
  const createData = await createResponse.json();
  
  if (!createResponse.ok || !createData.success) {
    throw new Error(`Create project failed: ${createData.error}`);
  }
  
  const projectId = createData.data.id;
  log(`Created test project with ID: ${projectId}`);
  
  // Test update project
  const updateProject = {
    title: 'Updated Test Project',
    description: 'This is an updated test project'
  };
  
  const updateResponse = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updateProject)
  });
  
  const updateData = await updateResponse.json();
  
  if (!updateResponse.ok || !updateData.success) {
    throw new Error(`Update project failed: ${updateData.error}`);
  }
  
  log('Project updated successfully');
  
  // Test delete project
  const deleteResponse = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'DELETE',
    headers
  });
  
  const deleteData = await deleteResponse.json();
  
  if (!deleteResponse.ok || !deleteData.success) {
    throw new Error(`Delete project failed: ${deleteData.error}`);
  }
  
  log('Project deleted successfully');
};

// Test 6: Categories API
const testCategoriesAPI = async (token) => {
  const headers = { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  // Test get categories
  const getResponse = await fetch(`${API_BASE}/categories`, { headers });
  const getData = await getResponse.json();
  
  if (!getResponse.ok || !getData.success) {
    throw new Error(`Get categories failed: ${getData.error}`);
  }
  
  log(`Found ${getData.data?.length || 0} categories`);
  
  // Test create category
  const testCategory = {
    name: 'Test Category',
    description: 'This is a test category',
    color: '#3b82f6'
  };
  
  const createResponse = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers,
    body: JSON.stringify(testCategory)
  });
  
  const createData = await createResponse.json();
  
  if (!createResponse.ok || !createData.success) {
    throw new Error(`Create category failed: ${createData.error}`);
  }
  
  const categoryId = createData.data.id;
  log(`Created test category with ID: ${categoryId}`);
  
  // Test update category
  const updateCategory = {
    name: 'Updated Test Category',
    description: 'This is an updated test category'
  };
  
  const updateResponse = await fetch(`${API_BASE}/categories/${categoryId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updateCategory)
  });
  
  const updateData = await updateResponse.json();
  
  if (!updateResponse.ok || !updateData.success) {
    throw new Error(`Update category failed: ${updateData.error}`);
  }
  
  log('Category updated successfully');
  
  // Test delete category
  const deleteResponse = await fetch(`${API_BASE}/categories/${categoryId}`, {
    method: 'DELETE',
    headers
  });
  
  const deleteData = await deleteResponse.json();
  
  if (!deleteResponse.ok || !deleteData.success) {
    throw new Error(`Delete category failed: ${deleteData.error}`);
  }
  
  log('Category deleted successfully');
};

// Test 7: Technologies API
const testTechnologiesAPI = async (token) => {
  const headers = { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  // Test get technologies
  const getResponse = await fetch(`${API_BASE}/technologies`, { headers });
  const getData = await getResponse.json();
  
  if (!getResponse.ok || !getData.success) {
    throw new Error(`Get technologies failed: ${getData.error}`);
  }
  
  log(`Found ${getData.data?.length || 0} technologies`);
  
  // Test create technology
  const testTechnology = {
    type: 'technology',
    title: 'Test Technology',
    icon: 'Code',
    sort_order: 1
  };
  
  const createResponse = await fetch(`${API_BASE}/technologies`, {
    method: 'POST',
    headers,
    body: JSON.stringify(testTechnology)
  });
  
  const createData = await createResponse.json();
  
  if (!createResponse.ok || !createData.success) {
    throw new Error(`Create technology failed: ${createData.error}`);
  }
  
  const techId = createData.data.id;
  log(`Created test technology with ID: ${techId}`);
  
  // Test update technology
  const updateTechnology = {
    type: 'technology',
    title: 'Updated Test Technology',
    icon: 'Database'
  };
  
  const updateResponse = await fetch(`${API_BASE}/technologies/${techId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updateTechnology)
  });
  
  const updateData = await updateResponse.json();
  
  if (!updateResponse.ok || !updateData.success) {
    throw new Error(`Update technology failed: ${updateData.error}`);
  }
  
  log('Technology updated successfully');
  
  // Test delete technology
  const deleteResponse = await fetch(`${API_BASE}/technologies/${techId}`, {
    method: 'DELETE',
    headers
  });
  
  const deleteData = await deleteResponse.json();
  
  if (!deleteResponse.ok || !deleteData.success) {
    throw new Error(`Delete technology failed: ${deleteData.error}`);
  }
  
  log('Technology deleted successfully');
};

// Test 8: Niches API
const testNichesAPI = async (token) => {
  const headers = { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  // Test get niches
  const getResponse = await fetch(`${API_BASE}/niches`, { headers });
  const getData = await getResponse.json();
  
  if (!getResponse.ok || !getData.success) {
    throw new Error(`Get niches failed: ${getData.error}`);
  }
  
  log(`Found ${getData.data?.length || 0} niches`);
  
  // Test create niche
  const testNiche = {
    title: 'Test Niche',
    overview: 'This is a test niche',
    tools: 'Test tools',
    key_features: 'Test features',
    sort_order: 1,
    ai_driven: false
  };
  
  const createResponse = await fetch(`${API_BASE}/niches`, {
    method: 'POST',
    headers,
    body: JSON.stringify(testNiche)
  });
  
  const createData = await createResponse.json();
  
  if (!createResponse.ok || !createData.success) {
    throw new Error(`Create niche failed: ${createData.error}`);
  }
  
  const nicheId = createData.data.id;
  log(`Created test niche with ID: ${nicheId}`);
  
  // Test update niche
  const updateNiche = {
    title: 'Updated Test Niche',
    overview: 'This is an updated test niche'
  };
  
  const updateResponse = await fetch(`${API_BASE}/niches/${nicheId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updateNiche)
  });
  
  const updateData = await updateResponse.json();
  
  if (!updateResponse.ok || !updateData.success) {
    throw new Error(`Update niche failed: ${updateData.error}`);
  }
  
  log('Niche updated successfully');
  
  // Test delete niche
  const deleteResponse = await fetch(`${API_BASE}/niches/${nicheId}`, {
    method: 'DELETE',
    headers
  });
  
  const deleteData = await deleteResponse.json();
  
  if (!deleteResponse.ok || !deleteData.success) {
    throw new Error(`Delete niche failed: ${deleteData.error}`);
  }
  
  log('Niche deleted successfully');
};

// Main test function
const runAllTests = async () => {
  console.log('🚀 Starting React + API Integration Tests...\n');
  
  const results = {
    frontendHealth: false,
    apiHealth: false,
    authentication: false,
    settingsAPI: false,
    projectsAPI: false,
    categoriesAPI: false,
    technologiesAPI: false,
    nichesAPI: false
  };
  
  try {
    // Test 1: Frontend Health
    results.frontendHealth = await testApi('Frontend Health Check', testFrontendHealth);
    
    // Test 2: API Health
    results.apiHealth = await testApi('API Health Check', testApiHealth);
    
    // Test 3: Authentication
    const token = await testApi('Authentication', testAuthentication);
    results.authentication = !!token;
    
    if (token) {
      // Test 4: Settings API
      results.settingsAPI = await testApi('Settings API', () => testSettingsAPI(token));
      
      // Test 5: Projects API
      results.projectsAPI = await testApi('Projects API', () => testProjectsAPI(token));
      
      // Test 6: Categories API
      results.categoriesAPI = await testApi('Categories API', () => testCategoriesAPI(token));
      
      // Test 7: Technologies API
      results.technologiesAPI = await testApi('Technologies API', () => testTechnologiesAPI(token));
      
      // Test 8: Niches API
      results.nichesAPI = await testApi('Niches API', () => testNichesAPI(token));
    }
    
  } catch (error) {
    log(`Test suite failed: ${error.message}`, 'error');
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 REACT + API INTEGRATION TEST RESULTS');
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
    console.log('🎉 All tests passed! Your React + API integration is working correctly.');
    console.log('\n✅ INTEGRATION SUMMARY:');
    console.log('   - Frontend is accessible');
    console.log('   - API is healthy and responding');
    console.log('   - Authentication is working');
    console.log('   - All CRUD operations are functional');
    console.log('   - Settings management is working');
    console.log('   - Projects management is working');
    console.log('   - Categories management is working');
    console.log('   - Technologies management is working');
    console.log('   - Niches management is working');
  } else {
    console.log('⚠️ Some tests failed. Check the details above for specific issues.');
    
    if (!results.frontendHealth) {
      console.log('\n🔧 FRONTEND ISSUES:');
      console.log('   - Make sure your React app is running on port 3000');
      console.log('   - Check if the frontend server is accessible');
    }
    
    if (!results.apiHealth) {
      console.log('\n🔧 API ISSUES:');
      console.log('   - Make sure your API server is running on port 3001');
      console.log('   - Check your MySQL database connection');
    }
    
    if (!results.authentication) {
      console.log('\n🔧 AUTHENTICATION ISSUES:');
      console.log('   - Check your database user credentials');
      console.log('   - Verify JWT configuration');
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
  window.runReactApiTests = runAllTests;
  console.log('🌐 Browser environment detected. Run window.runReactApiTests() to start tests.');
}

module.exports = {
  runAllTests,
  testFrontendHealth,
  testApiHealth,
  testAuthentication,
  testSettingsAPI,
  testProjectsAPI,
  testCategoriesAPI,
  testTechnologiesAPI,
  testNichesAPI
}; 