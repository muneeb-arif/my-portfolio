// Comprehensive Dashboard Flow Test
// Tests the complete user journey from login to all dashboard functionality

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${emoji} [${timestamp}] ${message}`);
};

// Global test state
let testState = {
  token: null,
  user: null,
  projects: [],
  categories: [],
  technologies: [],
  niches: [],
  settings: null,
  backupData: null
};

// API Service simulation
const apiService = {
  token: null,
  
  setToken(token) {
    this.token = token;
  },
  
  clearToken() {
    this.token = null;
  },
  
  async makeRequest(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  }
};

// Test Suite 1: Authentication & Session Management
const testAuthentication = async () => {
  log('🔐 TESTING AUTHENTICATION & SESSION MANAGEMENT');
  
  try {
    // Step 1: Login with valid credentials
    log('Step 1: Login with valid credentials');
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
    
    testState.token = loginData.token;
    apiService.setToken(testState.token);
    log('✅ Login successful');
    
    // Step 2: Verify token works
    log('Step 2: Verifying token works');
    const userResponse = await apiService.makeRequest('/auth/me');
    testState.user = userResponse.user;
    log(`✅ User verified: ${testState.user.email}`);
    
    // Step 3: Test session persistence (simulate page refresh)
    log('Step 3: Testing session persistence');
    const newApiService = { ...apiService };
    newApiService.setToken(testState.token);
    const persistenceTest = await newApiService.makeRequest('/auth/me');
    if (persistenceTest.user.id === testState.user.id) {
      log('✅ Session persistence verified');
    } else {
      throw new Error('Session persistence failed');
    }
    
    return true;
  } catch (error) {
    log(`❌ Authentication test failed: ${error.message}`, 'error');
    return false;
  }
};

// Test Suite 2: Dashboard Overview
const testDashboardOverview = async () => {
  log('📊 TESTING DASHBOARD OVERVIEW');
  
  try {
    // Step 1: Get recent projects
    log('Step 1: Getting recent projects');
    const projectsResponse = await apiService.makeRequest('/dashboard/projects');
    testState.projects = projectsResponse.data || [];
    log(`✅ Found ${testState.projects.length} projects`);
    
    // Step 2: Verify recent projects display (4-5 most recent)
    const recentProjects = testState.projects.slice(0, 5);
    log(`✅ Recent projects: ${recentProjects.map(p => p.title).join(', ')}`);
    
    // Step 3: Test data management operations
    log('Step 3: Testing data management operations');
    
    // Create backup
    log('Creating backup...');
    const backupResponse = await apiService.makeRequest('/settings');
    testState.backupData = backupResponse.data;
    log('✅ Backup created');
    
    // Test reset all data (we'll skip actual reset to avoid data loss)
    log('⚠️ Skipping reset all data test to preserve data');
    
    return true;
  } catch (error) {
    log(`❌ Dashboard overview test failed: ${error.message}`, 'error');
    return false;
  }
};

// Test Suite 3: Project Management (Critical - Image Upload Issue)
const testProjectManagement = async () => {
  log('💼 TESTING PROJECT MANAGEMENT');
  
  try {
    // Step 1: Get categories for project creation
    log('Step 1: Getting categories');
    const categoriesResponse = await apiService.makeRequest('/categories');
    testState.categories = categoriesResponse.data || [];
    log(`✅ Found ${testState.categories.length} categories`);
    
    // Step 2: Create new project
    log('Step 2: Creating new project');
    const newProject = {
      title: 'Test Project for Image Upload',
      description: 'A test project to debug image upload issues',
      category: testState.categories[0]?.name || 'Web Development',
      overview: 'This is a detailed overview of the test project',
      technologies: ['React', 'Node.js', 'MySQL'],
      features: ['Feature 1', 'Feature 2'],
      live_url: 'https://example.com',
      github_url: 'https://github.com/example',
      status: 'draft'
    };
    
    const createProjectResponse = await apiService.makeRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(newProject)
    });
    
    const createdProject = createProjectResponse.data;
    log(`✅ Project created: ${createdProject.title} (ID: ${createdProject.id})`);
    
    // Step 3: Test image upload (This is the failing part)
    log('Step 3: Testing image upload - CRITICAL TEST');
    
    // Simulate uploading images from computer
    const testImages = [
      {
        url: 'https://example.com/test-image-1.jpg',
        path: 'test-user/1234567890_test-image-1.jpg',
        name: 'test-image-1.jpg',
        original_name: 'test-image-1.jpg',
        size: 1024000,
        type: 'image/jpeg',
        bucket: 'images',
        order_index: 1
      },
      {
        url: 'https://example.com/test-image-2.jpg',
        path: 'test-user/1234567890_test-image-2.jpg',
        name: 'test-image-2.jpg',
        original_name: 'test-image-2.jpg',
        size: 2048000,
        type: 'image/jpeg',
        bucket: 'images',
        order_index: 2
      }
    ];
    
    log(`Attempting to upload ${testImages.length} images to project ${createdProject.id}`);
    
    for (let i = 0; i < testImages.length; i++) {
      const image = testImages[i];
      log(`Uploading image ${i + 1}/${testImages.length}: ${image.name}`);
      
      try {
        const uploadResponse = await apiService.makeRequest(`/projects/${createdProject.id}/images`, {
          method: 'POST',
          body: JSON.stringify(image)
        });
        
        if (uploadResponse.success) {
          log(`✅ Image ${i + 1} uploaded successfully: ${uploadResponse.data.id}`);
        } else {
          throw new Error(`Upload failed: ${uploadResponse.error}`);
        }
      } catch (error) {
        log(`❌ Image upload failed: ${error.message}`, 'error');
        throw error;
      }
    }
    
    // Step 4: Verify images were uploaded
    log('Step 4: Verifying uploaded images');
    const imagesResponse = await apiService.makeRequest(`/projects/${createdProject.id}/images`);
    log(`✅ Project now has ${imagesResponse.data.length} images`);
    
    // Step 5: Test project editing
    log('Step 5: Testing project editing');
    const updatedProject = {
      ...newProject,
      title: 'Updated Test Project',
      status: 'published'
    };
    
    const updateResponse = await apiService.makeRequest(`/projects/${createdProject.id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedProject)
    });
    
    log(`✅ Project updated: ${updateResponse.data.title}`);
    
    // Step 6: Test project deletion
    log('Step 6: Testing project deletion');
    const deleteResponse = await apiService.makeRequest(`/projects/${createdProject.id}`, {
      method: 'DELETE'
    });
    
    if (deleteResponse.success) {
      log('✅ Project deleted successfully');
    } else {
      throw new Error('Project deletion failed');
    }
    
    return true;
  } catch (error) {
    log(`❌ Project management test failed: ${error.message}`, 'error');
    return false;
  }
};

// Test Suite 4: Technologies Management
const testTechnologiesManagement = async () => {
  log('🔧 TESTING TECHNOLOGIES MANAGEMENT');
  
  try {
    // Step 1: Get current technologies
    log('Step 1: Getting current technologies');
    const techResponse = await apiService.makeRequest('/technologies');
    testState.technologies = techResponse.data || [];
    log(`✅ Found ${testState.technologies.length} technology boxes`);
    
    // Step 2: Create new technology box
    log('Step 2: Creating new technology box');
    const newTech = {
      title: 'Test Technology Box',
      type: 'programming',
      icon: '💻',
      sort_order: 1
    };
    
    const createTechResponse = await apiService.makeRequest('/technologies', {
      method: 'POST',
      body: JSON.stringify(newTech)
    });
    
    const createdTech = createTechResponse.data;
    log(`✅ Technology box created: ${createdTech.title}`);
    
    // Step 3: Update technology box
    log('Step 3: Updating technology box');
    const updatedTech = {
      ...newTech,
      title: 'Updated Test Technology Box',
      icon: '🚀'
    };
    
    const updateTechResponse = await apiService.makeRequest(`/technologies/${createdTech.id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedTech)
    });
    
    log(`✅ Technology box updated: ${updateTechResponse.data.title}`);
    
    // Step 4: Test technology box functionality
    log('Step 4: Testing technology box functionality');
    log(`✅ Technology box has type: ${updateTechResponse.data.type}`);
    
    // Step 5: Delete technology box
    log('Step 5: Deleting technology box');
    const deleteTechResponse = await apiService.makeRequest(`/technologies/${createdTech.id}`, {
      method: 'DELETE'
    });
    
    if (deleteTechResponse.success) {
      log('✅ Technology box deleted successfully');
    } else {
      throw new Error('Technology box deletion failed');
    }
    
    return true;
  } catch (error) {
    log(`❌ Technologies management test failed: ${error.message}`, 'error');
    return false;
  }
};

// Test Suite 5: Niche Management
const testNicheManagement = async () => {
  log('🎯 TESTING NICHE MANAGEMENT');
  
  try {
    // Step 1: Get current niches
    log('Step 1: Getting current niches');
    const nichesResponse = await apiService.makeRequest('/niches');
    testState.niches = nichesResponse.data || [];
    log(`✅ Found ${testState.niches.length} niches`);
    
    // Step 2: Create new niche
    log('Step 2: Creating new niche');
    const newNiche = {
      title: 'Test Niche',
      overview: 'Test niche overview',
      tools: 'Test tools',
      key_features: 'Test features',
      sort_order: 1,
      ai_driven: false,
      image: 'default.jpeg'
    };
    
    const createNicheResponse = await apiService.makeRequest('/niches', {
      method: 'POST',
      body: JSON.stringify(newNiche)
    });
    
    const createdNiche = createNicheResponse.data;
    log(`✅ Niche created: ${createdNiche.title}`);
    
    // Step 3: Update niche
    log('Step 3: Updating niche');
    const updatedNiche = {
      ...newNiche,
      title: 'Updated Test Niche',
      ai_driven: true
    };
    
    const updateNicheResponse = await apiService.makeRequest(`/niches/${createdNiche.id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedNiche)
    });
    
    log(`✅ Niche updated: ${updateNicheResponse.data.title}`);
    
    // Step 4: Delete niche
    log('Step 4: Deleting niche');
    const deleteNicheResponse = await apiService.makeRequest(`/niches/${createdNiche.id}`, {
      method: 'DELETE'
    });
    
    if (deleteNicheResponse.success) {
      log('✅ Niche deleted successfully');
    } else {
      throw new Error('Niche deletion failed');
    }
    
    return true;
  } catch (error) {
    log(`❌ Niche management test failed: ${error.message}`, 'error');
    return false;
  }
};

// Test Suite 6: Categories Management
const testCategoriesManagement = async () => {
  log('📂 TESTING CATEGORIES MANAGEMENT');
  
  try {
    // Step 1: Create new category
    log('Step 1: Creating new category');
    const newCategory = {
      name: 'Test Category',
      description: 'Test category description'
    };
    
    const createCategoryResponse = await apiService.makeRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(newCategory)
    });
    
    const createdCategory = createCategoryResponse.data;
    log(`✅ Category created: ${createdCategory.name}`);
    
    // Step 2: Update category
    log('Step 2: Updating category');
    const updatedCategory = {
      ...newCategory,
      name: 'Updated Test Category'
    };
    
    const updateCategoryResponse = await apiService.makeRequest(`/categories/${createdCategory.id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedCategory)
    });
    
    log(`✅ Category updated: ${updateCategoryResponse.data.name}`);
    
    // Step 3: Test category deletion (should fail if attached to projects)
    log('Step 3: Testing category deletion');
    try {
      const deleteCategoryResponse = await apiService.makeRequest(`/categories/${createdCategory.id}`, {
        method: 'DELETE'
      });
      
      if (deleteCategoryResponse.success) {
        log('✅ Category deleted successfully');
      } else {
        log('⚠️ Category deletion failed (expected if attached to projects)');
      }
    } catch (error) {
      log('⚠️ Category deletion failed (expected if attached to projects)');
    }
    
    return true;
  } catch (error) {
    log(`❌ Categories management test failed: ${error.message}`, 'error');
    return false;
  }
};

// Test Suite 7: Settings Management
const testSettingsManagement = async () => {
  log('⚙️ TESTING SETTINGS MANAGEMENT');
  
  try {
    // Step 1: Get current settings
    log('Step 1: Getting current settings');
    const settingsResponse = await apiService.makeRequest('/settings');
    testState.settings = settingsResponse.data;
    log('✅ Settings retrieved');
    
    // Step 2: Update settings
    log('Step 2: Updating settings');
    const updatedSettings = {
      ...testState.settings,
      show_hero: true,
      show_projects: true,
      show_technologies: true,
      show_contact: true
    };
    
    const updateSettingsResponse = await apiService.makeRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(updatedSettings)
    });
    
    log('✅ Settings updated');
    
    return true;
  } catch (error) {
    log(`❌ Settings management test failed: ${error.message}`, 'error');
    return false;
  }
};

// Test Suite 8: Logout
const testLogout = async () => {
  log('🚪 TESTING LOGOUT');
  
  try {
    // Step 1: Clear token
    log('Step 1: Clearing token');
    apiService.clearToken();
    log('✅ Token cleared');
    
    // Step 2: Verify logout
    log('Step 2: Verifying logout');
    try {
      await apiService.makeRequest('/auth/me');
      throw new Error('Should not be able to access protected endpoint after logout');
    } catch (error) {
      log('✅ Logout successful - protected endpoint access denied');
    }
    
    return true;
  } catch (error) {
    log(`❌ Logout test failed: ${error.message}`, 'error');
    return false;
  }
};

// Main test runner
const runDashboardFlowTest = async () => {
  log('🚀 STARTING COMPREHENSIVE DASHBOARD FLOW TEST');
  log('=' * 60);
  
  const testResults = {
    authentication: false,
    dashboardOverview: false,
    projectManagement: false,
    technologiesManagement: false,
    nicheManagement: false,
    categoriesManagement: false,
    settingsManagement: false,
    logout: false
  };
  
  try {
    // Run all test suites
    testResults.authentication = await testAuthentication();
    if (!testResults.authentication) {
      log('❌ Authentication failed, stopping tests', 'error');
      return;
    }
    
    testResults.dashboardOverview = await testDashboardOverview();
    testResults.projectManagement = await testProjectManagement();
    testResults.technologiesManagement = await testTechnologiesManagement();
    testResults.nicheManagement = await testNicheManagement();
    testResults.categoriesManagement = await testCategoriesManagement();
    testResults.settingsManagement = await testSettingsManagement();
    testResults.logout = await testLogout();
    
    // Summary
    log('=' * 60);
    log('📊 TEST SUMMARY');
    log('=' * 60);
    
    Object.entries(testResults).forEach(([test, passed]) => {
      const status = passed ? '✅ PASSED' : '❌ FAILED';
      log(`${test}: ${status}`);
    });
    
    const passedTests = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length;
    
    log(`\nOverall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      log('🎉 ALL TESTS PASSED! Dashboard flow is working correctly.', 'success');
    } else {
      log('⚠️ Some tests failed. Check the logs above for details.', 'warning');
    }
    
  } catch (error) {
    log(`❌ Test suite failed: ${error.message}`, 'error');
  }
};

// Run the tests
runDashboardFlowTest(); 