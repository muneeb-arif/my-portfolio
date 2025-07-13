const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const API_BASE_URL = 'http://localhost:3001';
const SUPABASE_URL = 'https://your-project.supabase.co'; // Update with your actual Supabase URL
const SUPABASE_ANON_KEY = 'your-anon-key'; // Update with your actual anon key

// Test user credentials
const TEST_USER = {
  email: 'muneebarif11@gmail.com',
  password: '11223344'
};

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const color = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'     // Reset
  };
  console.log(`${color[type]}[${timestamp}] ${message}${color.reset}`);
};

const logTest = (testName, status, details = '') => {
  const statusColor = status === 'PASS' ? '\x1b[32m' : '\x1b[31m';
  console.log(`${statusColor}${status}\x1b[0m | ${testName}${details ? ` - ${details}` : ''}`);
};

const handleError = (error, context) => {
  if (error.response) {
    log(`API Error in ${context}: ${error.response.status} - ${error.response.statusText}`, 'error');
    if (error.response.data) {
      log(`Response data: ${JSON.stringify(error.response.data, null, 2)}`, 'error');
    }
  } else if (error.request) {
    log(`Network Error in ${context}: ${error.message}`, 'error');
  } else {
    log(`Error in ${context}: ${error.message}`, 'error');
  }
  return false;
};

// Authentication helper
let authToken = null;

const authenticate = async () => {
  try {
    log('Authenticating user...', 'info');
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      log('Authentication successful', 'success');
      return true;
    } else {
      log('Authentication failed: Invalid response format', 'error');
      return false;
    }
  } catch (error) {
    handleError(error, 'authentication');
    return false;
  }
};

// Data integrity verification
const verifyDataIntegrity = async (entity, localData, supabaseTable) => {
  try {
    log(`Verifying data integrity for ${entity}...`, 'info');
    
    // Fetch data from Supabase
    const { data: supabaseData, error } = await supabase
      .from(supabaseTable)
      .select('*')
      .eq('user_id', TEST_USER.email);
    
    if (error) {
      log(`Supabase error for ${entity}: ${error.message}`, 'error');
      return false;
    }
    
    if (!supabaseData || supabaseData.length === 0) {
      log(`No Supabase data found for ${entity}`, 'warning');
      return true; // Not necessarily an error
    }
    
    // Compare data
    const localCount = localData.length;
    const supabaseCount = supabaseData.length;
    
    log(`Local ${entity}: ${localCount} records, Supabase ${entity}: ${supabaseCount} records`, 'info');
    
    if (localCount !== supabaseCount) {
      log(`Data count mismatch for ${entity}: Local=${localCount}, Supabase=${supabaseCount}`, 'warning');
    }
    
    // Check for matching records (by name/title for most entities)
    const matchingRecords = localData.filter(localItem => {
      return supabaseData.some(supabaseItem => {
        const localKey = localItem.name || localItem.title || localItem.key;
        const supabaseKey = supabaseItem.name || supabaseItem.title || supabaseItem.key;
        return localKey === supabaseKey;
      });
    });
    
    const matchPercentage = (matchingRecords.length / localCount) * 100;
    log(`Data integrity for ${entity}: ${matchPercentage.toFixed(1)}% matching records`, 
        matchPercentage > 80 ? 'success' : 'warning');
    
    return matchPercentage > 80;
  } catch (error) {
    log(`Error verifying data integrity for ${entity}: ${error.message}`, 'error');
    return false;
  }
};

// Test functions
const testHealthCheck = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    const success = response.status === 200 && response.data.status === 'healthy';
    logTest('Health Check', success ? 'PASS' : 'FAIL', 
            success ? '' : `Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
    return success;
  } catch (error) {
    handleError(error, 'health check');
    logTest('Health Check', 'FAIL', error.message);
    return false;
  }
};

const testPublicProjects = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/projects`);
    const success = response.status === 200 && response.data && response.data.success && Array.isArray(response.data.data);
    logTest('Public Projects', success ? 'PASS' : 'FAIL', 
            success ? `Found ${response.data.data?.length ?? 0} projects` : `Status: ${response.status}`);
    return success;
  } catch (error) {
    handleError(error, 'public projects');
    logTest('Public Projects', 'FAIL', error.message);
    return false;
  }
};

const testCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/categories`);
    const success = response.status === 200 && response.data && response.data.success && Array.isArray(response.data.data);
    logTest('Categories', success ? 'PASS' : 'FAIL', 
            success ? `Found ${response.data.data?.length ?? 0} categories` : `Status: ${response.status}`);
    
    if (success) {
      await verifyDataIntegrity('categories', response.data.data, 'categories');
    }
    
    return success;
  } catch (error) {
    handleError(error, 'categories');
    logTest('Categories', 'FAIL', error.message);
    return false;
  }
};

const testTechnologies = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/technologies`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const success = response.status === 200 && response.data && response.data.success && Array.isArray(response.data.data);
    logTest('Technologies', success ? 'PASS' : 'FAIL', 
            success ? `Found ${response.data.data?.length ?? 0} technologies` : `Status: ${response.status}`);
    
    if (success) {
      await verifyDataIntegrity('technologies', response.data.data, 'technologies');
    }
    
    return success;
  } catch (error) {
    handleError(error, 'technologies');
    logTest('Technologies', 'FAIL', error.message);
    return false;
  }
};

const testSkills = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/skills`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const success = response.status === 200 && response.data && response.data.success && Array.isArray(response.data.data);
    logTest('Skills', success ? 'PASS' : 'FAIL', 
            success ? `Found ${response.data.data?.length ?? 0} skills` : `Status: ${response.status}`);
    
    if (success) {
      await verifyDataIntegrity('skills', response.data.data, 'skills');
    }
    
    return success;
  } catch (error) {
    handleError(error, 'skills');
    logTest('Skills', 'FAIL', error.message);
    return false;
  }
};

const testNiches = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/niches`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const success = response.status === 200 && response.data && response.data.success && Array.isArray(response.data.data);
    logTest('Niches', success ? 'PASS' : 'FAIL', 
            success ? `Found ${response.data.data?.length ?? 0} niches` : `Status: ${response.status}`);
    
    if (success) {
      await verifyDataIntegrity('niches', response.data.data, 'niches');
    }
    
    return success;
  } catch (error) {
    handleError(error, 'niches');
    logTest('Niches', 'FAIL', error.message);
    return false;
  }
};

const testSettings = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/settings`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    // Settings should be an object, not an array
    const isObject = response.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data) && response.data.data !== null;
    const success = response.status === 200 && response.data && response.data.success && isObject;
    logTest('Settings', success ? 'PASS' : 'FAIL', 
            success ? `Found ${Object.keys(response.data.data || {}).length} settings` : `Status: ${response.status}`);
    
    if (success) {
      // Optionally, verifyDataIntegrity could be skipped or adapted for object
    }
    
    return success;
  } catch (error) {
    handleError(error, 'settings');
    logTest('Settings', 'FAIL', error.message);
    return false;
  }
};

const testContactQueries = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/contact-queries`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const success = response.status === 200 && response.data && response.data.success && Array.isArray(response.data.data);
    logTest('Contact Queries', success ? 'PASS' : 'FAIL', 
            success ? `Found ${response.data.data?.length ?? 0} queries` : `Status: ${response.status}`);
    
    if (success) {
      await verifyDataIntegrity('contact queries', response.data.data, 'contact_queries');
    }
    
    return success;
  } catch (error) {
    handleError(error, 'contact queries');
    logTest('Contact Queries', 'FAIL', error.message);
    return false;
  }
};

const testProtectedProjects = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/projects`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const success = response.status === 200 && response.data && response.data.success && Array.isArray(response.data.data);
    logTest('Protected Projects', success ? 'PASS' : 'FAIL', 
            success ? `Found ${response.data.data?.length ?? 0} projects` : `Status: ${response.status}`);
    
    if (success) {
      await verifyDataIntegrity('projects', response.data.data, 'projects');
    }
    
    return success;
  } catch (error) {
    handleError(error, 'protected projects');
    logTest('Protected Projects', 'FAIL', error.message);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  log('🚀 Starting Comprehensive API Tests', 'info');
  log('=====================================', 'info');
  
  const results = [];
  
  // Test 1: Health Check
  results.push(await testHealthCheck());
  
  // Test 2: Public Projects
  results.push(await testPublicProjects());
  
  // Test 3: Authentication
  const authSuccess = await authenticate();
  results.push(authSuccess);
  logTest('Authentication', authSuccess ? 'PASS' : 'FAIL');
  
  if (!authSuccess) {
    log('❌ Authentication failed. Skipping protected endpoint tests.', 'error');
    log('=====================================', 'info');
    log(`📊 Test Results: ${results.filter(Boolean).length}/${results.length} passed`, 
        results.filter(Boolean).length === results.length ? 'success' : 'error');
    return;
  }
  
  // Protected endpoint tests
  results.push(await testCategories());
  results.push(await testTechnologies());
  results.push(await testSkills());
  results.push(await testNiches());
  results.push(await testSettings());
  results.push(await testContactQueries());
  results.push(await testProtectedProjects());
  
  // Summary
  log('=====================================', 'info');
  const passed = results.filter(Boolean).length;
  const total = results.length;
  const percentage = (passed / total) * 100;
  
  log(`📊 Test Results: ${passed}/${total} passed (${percentage.toFixed(1)}%)`, 
      percentage >= 80 ? 'success' : percentage >= 60 ? 'warning' : 'error');
  
  if (passed === total) {
    log('🎉 All tests passed! API is working correctly.', 'success');
  } else {
    log(`⚠️  ${total - passed} test(s) failed. Check the logs above for details.`, 'warning');
  }
  
  log('=====================================', 'info');
};

// Run tests
runTests().catch(error => {
  log(`Fatal error running tests: ${error.message}`, 'error');
  process.exit(1);
}); 