const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const TEST_EMAIL = 'muneebarif11@gmail.com';
const TEST_PASSWORD = '11223344';

let authToken = null;

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

// Authentication tests
const testAuthentication = async () => {
  // Test login
  const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  });
  
  if (loginResponse.data.success) {
    authToken = loginResponse.data.token;
    log('Authentication successful');
  } else {
    throw new Error('Login failed');
  }
};

// Health check test
const testHealthCheck = async () => {
  const response = await axios.get(`${API_BASE_URL}/health`);
  if (response.data.status !== 'healthy') {
    throw new Error('Health check failed');
  }
};

// Categories tests
const testCategories = async () => {
  const headers = { Authorization: `Bearer ${authToken}` };
  
  // Test create category
  const createResponse = await axios.post(`${API_BASE_URL}/categories`, {
    name: 'Test Category',
    description: 'Test category description',
    color: '#3b82f6'
  }, { headers });
  
  if (!createResponse.data.success) {
    throw new Error('Failed to create category');
  }
  
  const categoryId = createResponse.data.data.id;
  
  // Test get categories
  const getResponse = await axios.get(`${API_BASE_URL}/categories`, { headers });
  if (!getResponse.data.success || !getResponse.data.data.length) {
    throw new Error('Failed to get categories');
  }
  
  // Test update category
  const updateResponse = await axios.put(`${API_BASE_URL}/categories/${categoryId}`, {
    name: 'Updated Test Category',
    description: 'Updated description',
    color: '#ef4444'
  }, { headers });
  
  if (!updateResponse.data.success) {
    throw new Error('Failed to update category');
  }
  
  // Test delete category
  const deleteResponse = await axios.delete(`${API_BASE_URL}/categories/${categoryId}`, { headers });
  if (!deleteResponse.data.success) {
    throw new Error('Failed to delete category');
  }
};

// Technologies tests
const testTechnologies = async () => {
  const headers = { Authorization: `Bearer ${authToken}` };
  
  // Test create technology
  const createResponse = await axios.post(`${API_BASE_URL}/technologies`, {
    type: 'technology',
    title: 'Test Technology',
    icon: 'Code',
    sort_order: 1
  }, { headers });
  
  if (!createResponse.data.success) {
    throw new Error('Failed to create technology');
  }
  
  const techId = createResponse.data.data.id;
  
  // Test get technologies
  const getResponse = await axios.get(`${API_BASE_URL}/technologies`, { headers });
  if (!getResponse.data.success || !getResponse.data.data.length) {
    throw new Error('Failed to get technologies');
  }
  
  // Test update technology
  const updateResponse = await axios.put(`${API_BASE_URL}/technologies/${techId}`, {
    type: 'technology',
    title: 'Updated Test Technology',
    icon: 'Database',
    sort_order: 2
  }, { headers });
  
  if (!updateResponse.data.success) {
    throw new Error('Failed to update technology');
  }
  
  // Test delete technology
  const deleteResponse = await axios.delete(`${API_BASE_URL}/technologies/${techId}`, { headers });
  if (!deleteResponse.data.success) {
    throw new Error('Failed to delete technology');
  }
};

// Skills tests
const testSkills = async () => {
  const headers = { Authorization: `Bearer ${authToken}` };
  
  // First create a technology to associate with
  const techResponse = await axios.post(`${API_BASE_URL}/technologies`, {
    type: 'technology',
    title: 'Test Tech for Skills',
    icon: 'Code',
    sort_order: 1
  }, { headers });
  
  const techId = techResponse.data.data.id;
  
  // Test create skill
  const createResponse = await axios.post(`${API_BASE_URL}/skills`, {
    tech_id: techId,
    name: 'Test Skill',
    level: 'advanced'
  }, { headers });
  
  if (!createResponse.data.success) {
    throw new Error('Failed to create skill');
  }
  
  const skillId = createResponse.data.data.id;
  
  // Test get skills
  const getResponse = await axios.get(`${API_BASE_URL}/skills`, { headers });
  if (!getResponse.data.success) {
    throw new Error('Failed to get skills');
  }
  
  // Test update skill
  const updateResponse = await axios.put(`${API_BASE_URL}/skills/${skillId}`, {
    tech_id: techId,
    name: 'Updated Test Skill',
    level: 'expert'
  }, { headers });
  
  if (!updateResponse.data.success) {
    throw new Error('Failed to update skill');
  }
  
  // Test delete skill
  const deleteResponse = await axios.delete(`${API_BASE_URL}/skills/${skillId}`, { headers });
  if (!deleteResponse.data.success) {
    throw new Error('Failed to delete skill');
  }
  
  // Clean up technology
  await axios.delete(`${API_BASE_URL}/technologies/${techId}`, { headers });
};

// Niches tests
const testNiches = async () => {
  const headers = { Authorization: `Bearer ${authToken}` };
  
  // Test create niche
  const createResponse = await axios.post(`${API_BASE_URL}/niches`, {
    title: 'Test Niche',
    overview: 'Test niche overview',
    tools: 'Test tools',
    key_features: 'Test features',
    sort_order: 1,
    ai_driven: false
  }, { headers });
  
  if (!createResponse.data.success) {
    throw new Error('Failed to create niche');
  }
  
  const nicheId = createResponse.data.data.id;
  
  // Test get niches
  const getResponse = await axios.get(`${API_BASE_URL}/niches`, { headers });
  if (!getResponse.data.success || !getResponse.data.data.length) {
    throw new Error('Failed to get niches');
  }
  
  // Test update niche
  const updateResponse = await axios.put(`${API_BASE_URL}/niches/${nicheId}`, {
    title: 'Updated Test Niche',
    overview: 'Updated overview',
    tools: 'Updated tools',
    key_features: 'Updated features',
    sort_order: 2,
    ai_driven: true
  }, { headers });
  
  if (!updateResponse.data.success) {
    throw new Error('Failed to update niche');
  }
  
  // Test delete niche
  const deleteResponse = await axios.delete(`${API_BASE_URL}/niches/${nicheId}`, { headers });
  if (!deleteResponse.data.success) {
    throw new Error('Failed to delete niche');
  }
};

// Settings tests
const testSettings = async () => {
  const headers = { Authorization: `Bearer ${authToken}` };
  
  // Test get settings
  const getResponse = await axios.get(`${API_BASE_URL}/settings`, { headers });
  if (!getResponse.data.success) {
    throw new Error('Failed to get settings');
  }
  
  // Test update settings
  const testSettings = {
    theme: 'dark',
    language: 'en',
    notifications: true,
    custom_setting: { nested: 'value' }
  };
  
  const updateResponse = await axios.put(`${API_BASE_URL}/settings`, {
    settings: testSettings
  }, { headers });
  
  if (!updateResponse.data.success) {
    throw new Error('Failed to update settings');
  }
  
  // Verify settings were updated
  const verifyResponse = await axios.get(`${API_BASE_URL}/settings`, { headers });
  if (!verifyResponse.data.success || !verifyResponse.data.data.theme) {
    throw new Error('Settings were not properly updated');
  }
};

// Contact queries tests
const testContactQueries = async () => {
  const headers = { Authorization: `Bearer ${authToken}` };
  
  // Test create contact query
  const createResponse = await axios.post(`${API_BASE_URL}/contact-queries`, {
    form_type: 'contact',
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    company: 'Test Company',
    subject: 'Test Subject',
    message: 'Test message content',
    budget: '5000-10000',
    timeline: '1-3 months',
    inquiry_type: 'Project Inquiry',
    status: 'new',
    priority: 'medium'
  }, { headers });
  
  if (!createResponse.data.success) {
    throw new Error('Failed to create contact query');
  }
  
  const queryId = createResponse.data.data.id;
  
  // Test get contact queries
  const getResponse = await axios.get(`${API_BASE_URL}/contact-queries`, { headers });
  if (!getResponse.data.success || !getResponse.data.data.length) {
    throw new Error('Failed to get contact queries');
  }
  
  // Test update contact query
  const updateResponse = await axios.put(`${API_BASE_URL}/contact-queries/${queryId}`, {
    form_type: 'contact',
    name: 'Updated Test User',
    email: 'updated@example.com',
    phone: '+1234567890',
    company: 'Updated Test Company',
    subject: 'Updated Test Subject',
    message: 'Updated test message content',
    budget: '10000-20000',
    timeline: '3-6 months',
    inquiry_type: 'Consultation',
    status: 'in_progress',
    priority: 'high'
  }, { headers });
  
  if (!updateResponse.data.success) {
    throw new Error('Failed to update contact query');
  }
  
  // Test delete contact query
  const deleteResponse = await axios.delete(`${API_BASE_URL}/contact-queries/${queryId}`, { headers });
  if (!deleteResponse.data.success) {
    throw new Error('Failed to delete contact query');
  }
};

// Main test runner
const runAllTests = async () => {
  log('🚀 Starting comprehensive API tests...');
  
  const tests = [
    () => testHealthCheck(),
    () => testAuthentication(),
    () => testCategories(),
    () => testTechnologies(),
    () => testSkills(),
    () => testNiches(),
    () => testSettings(),
    () => testContactQueries()
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const success = await testApi(test.name, test);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }
  
  log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    log('🎉 All tests passed!', 'success');
  } else {
    log('⚠️ Some tests failed', 'warning');
    process.exit(1);
  }
};

// Run tests
runAllTests().catch(error => {
  log(`Test runner failed: ${error.message}`, 'error');
  process.exit(1);
}); 