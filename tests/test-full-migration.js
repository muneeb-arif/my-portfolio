#!/usr/bin/env node

/**
 * Full Migration Test Script
 * Tests the complete migration from Supabase to local API
 * Only image operations should remain on Supabase
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123'
};

const testProject = {
  title: 'Test Project',
  description: 'Test project description',
  category: 'Web Development',
  status: 'draft',
  technologies: ['React', 'Node.js'],
  features: ['Feature 1', 'Feature 2'],
  live_url: 'https://example.com',
  github_url: 'https://github.com/example'
};

const testCategory = {
  name: 'Test Category',
  description: 'Test category description',
  color: '#3b82f6'
};

const testTechnology = {
  title: 'Test Technology',
  type: 'Backend',
  icon: '🔧',
  sort_order: 1
};

const testNiche = {
  title: 'Test Niche',
  overview: 'Test niche overview',
  tools: 'Test tools',
  key_features: 'Test features',
  sort_order: 1,
  ai_driven: false
};

// Helper functions
async function makeRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  
  return data;
}

async function testWithAuth(endpoint, options = {}, token) {
  return makeRequest(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
}

// Test functions
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...');
  
  try {
    // Test registration
    console.log('  📝 Testing user registration...');
    const registerResponse = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(testUser)
    });
    
    if (registerResponse.success) {
      console.log('  ✅ Registration successful');
    } else {
      console.log('  ⚠️ Registration failed (user might already exist):', registerResponse.error);
    }
    
    // Test login
    console.log('  🔑 Testing user login...');
    const loginResponse = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(testUser)
    });
    
    if (loginResponse.success && loginResponse.token) {
      console.log('  ✅ Login successful');
      return loginResponse.token;
    } else {
      throw new Error('Login failed: ' + loginResponse.error);
    }
  } catch (error) {
    // If registration failed due to user existing, try login directly
    if (error.message.includes('already exists')) {
      console.log('  🔄 User exists, trying login directly...');
      try {
        const loginResponse = await makeRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify(testUser)
        });
        
        if (loginResponse.success && loginResponse.token) {
          console.log('  ✅ Login successful');
          return loginResponse.token;
        } else {
          throw new Error('Login failed: ' + loginResponse.error);
        }
      } catch (loginError) {
        console.error('  ❌ Login failed:', loginError.message);
        throw loginError;
      }
    } else {
      console.error('  ❌ Authentication test failed:', error.message);
      throw error;
    }
  }
}

async function testCurrentUser(token) {
  console.log('\n👤 Testing Current User...');
  
  try {
    const response = await testWithAuth('/auth/me', {}, token);
    
    if (response.success && response.user) {
      console.log('  ✅ Current user retrieved successfully');
      console.log('  📧 User email:', response.user.email);
      return response.user;
    } else {
      throw new Error('Failed to get current user');
    }
  } catch (error) {
    console.error('  ❌ Current user test failed:', error.message);
    throw error;
  }
}

async function testProjects(token) {
  console.log('\n💼 Testing Projects...');
  
  try {
    // Test create project
    console.log('  ➕ Testing project creation...');
    const createResponse = await testWithAuth('/projects', {
      method: 'POST',
      body: JSON.stringify(testProject)
    }, token);
    
    if (createResponse.success && createResponse.data) {
      console.log('  ✅ Project created successfully');
      const projectId = createResponse.data.id;
      
      // Test get user projects
      console.log('  📋 Testing get user projects...');
      const listResponse = await testWithAuth('/dashboard/projects', {}, token);
      
      if (listResponse.success && Array.isArray(listResponse.data)) {
        console.log('  ✅ User projects retrieved successfully');
        console.log('  📊 Projects count:', listResponse.data.length);
      } else {
        throw new Error('Failed to get user projects');
      }
      
      // Test update project
      console.log('  ✏️ Testing project update...');
      const updateData = { ...testProject, title: 'Updated Test Project' };
      const updateResponse = await testWithAuth(`/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      }, token);
      
      if (updateResponse.success) {
        console.log('  ✅ Project updated successfully');
      } else {
        throw new Error('Failed to update project');
      }
      
      // Test get single project
      console.log('  🔍 Testing get single project...');
      const getResponse = await testWithAuth(`/projects/${projectId}`, {}, token);
      
      if (getResponse.success && getResponse.data) {
        console.log('  ✅ Single project retrieved successfully');
      } else {
        throw new Error('Failed to get single project');
      }
      
      // Test delete project
      console.log('  🗑️ Testing project deletion...');
      const deleteResponse = await testWithAuth(`/projects/${projectId}`, {
        method: 'DELETE'
      }, token);
      
      if (deleteResponse.success) {
        console.log('  ✅ Project deleted successfully');
      } else {
        throw new Error('Failed to delete project');
      }
      
    } else {
      throw new Error('Failed to create project');
    }
  } catch (error) {
    console.error('  ❌ Projects test failed:', error.message);
    throw error;
  }
}

async function testCategories(token) {
  console.log('\n📁 Testing Categories...');
  
  try {
    // Test create category
    console.log('  ➕ Testing category creation...');
    const createResponse = await testWithAuth('/categories', {
      method: 'POST',
      body: JSON.stringify(testCategory)
    }, token);
    
    if (createResponse.success && createResponse.data) {
      console.log('  ✅ Category created successfully');
      const categoryId = createResponse.data.id;
      
      // Test get categories
      console.log('  📋 Testing get categories...');
      const listResponse = await testWithAuth('/categories', {}, token);
      
      if (listResponse.success && Array.isArray(listResponse.data)) {
        console.log('  ✅ Categories retrieved successfully');
        console.log('  📊 Categories count:', listResponse.data.length);
      } else {
        throw new Error('Failed to get categories');
      }
      
      // Test update category
      console.log('  ✏️ Testing category update...');
      const updateData = { ...testCategory, name: 'Updated Test Category' };
      const updateResponse = await testWithAuth(`/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      }, token);
      
      if (updateResponse.success) {
        console.log('  ✅ Category updated successfully');
      } else {
        throw new Error('Failed to update category');
      }
      
      // Test delete category
      console.log('  🗑️ Testing category deletion...');
      const deleteResponse = await testWithAuth(`/categories/${categoryId}`, {
        method: 'DELETE'
      }, token);
      
      if (deleteResponse.success) {
        console.log('  ✅ Category deleted successfully');
      } else {
        throw new Error('Failed to delete category');
      }
      
    } else {
      throw new Error('Failed to create category');
    }
  } catch (error) {
    console.error('  ❌ Categories test failed:', error.message);
    throw error;
  }
}

async function testTechnologies(token) {
  console.log('\n🎯 Testing Technologies...');
  
  try {
    // Test create technology
    console.log('  ➕ Testing technology creation...');
    const createResponse = await testWithAuth('/technologies', {
      method: 'POST',
      body: JSON.stringify(testTechnology)
    }, token);
    
    if (createResponse.success && createResponse.data) {
      console.log('  ✅ Technology created successfully');
      const techId = createResponse.data.id;
      
      // Test get technologies
      console.log('  📋 Testing get technologies...');
      const listResponse = await testWithAuth('/technologies', {}, token);
      
      if (listResponse.success && Array.isArray(listResponse.data)) {
        console.log('  ✅ Technologies retrieved successfully');
        console.log('  📊 Technologies count:', listResponse.data.length);
      } else {
        throw new Error('Failed to get technologies');
      }
      
      // Test update technology
      console.log('  ✏️ Testing technology update...');
      const updateData = { ...testTechnology, title: 'Updated Test Technology' };
      const updateResponse = await testWithAuth(`/technologies/${techId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      }, token);
      
      if (updateResponse.success) {
        console.log('  ✅ Technology updated successfully');
      } else {
        throw new Error('Failed to update technology');
      }
      
      // Test delete technology
      console.log('  🗑️ Testing technology deletion...');
      const deleteResponse = await testWithAuth(`/technologies/${techId}`, {
        method: 'DELETE'
      }, token);
      
      if (deleteResponse.success) {
        console.log('  ✅ Technology deleted successfully');
      } else {
        throw new Error('Failed to delete technology');
      }
      
    } else {
      throw new Error('Failed to create technology');
    }
  } catch (error) {
    console.error('  ❌ Technologies test failed:', error.message);
    throw error;
  }
}

async function testNiches(token) {
  console.log('\n🏆 Testing Niches...');
  
  try {
    // Test create niche
    console.log('  ➕ Testing niche creation...');
    const createResponse = await testWithAuth('/niches', {
      method: 'POST',
      body: JSON.stringify(testNiche)
    }, token);
    
    if (createResponse.success && createResponse.data) {
      console.log('  ✅ Niche created successfully');
      const nicheId = createResponse.data.id;
      
      // Test get niches
      console.log('  📋 Testing get niches...');
      const listResponse = await testWithAuth('/niches', {}, token);
      
      if (listResponse.success && Array.isArray(listResponse.data)) {
        console.log('  ✅ Niches retrieved successfully');
        console.log('  📊 Niches count:', listResponse.data.length);
      } else {
        throw new Error('Failed to get niches');
      }
      
      // Test update niche
      console.log('  ✏️ Testing niche update...');
      const updateData = { ...testNiche, title: 'Updated Test Niche' };
      const updateResponse = await testWithAuth(`/niches/${nicheId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      }, token);
      
      if (updateResponse.success) {
        console.log('  ✅ Niche updated successfully');
      } else {
        throw new Error('Failed to update niche');
      }
      
      // Test delete niche
      console.log('  🗑️ Testing niche deletion...');
      const deleteResponse = await testWithAuth(`/niches/${nicheId}`, {
        method: 'DELETE'
      }, token);
      
      if (deleteResponse.success) {
        console.log('  ✅ Niche deleted successfully');
      } else {
        throw new Error('Failed to delete niche');
      }
      
    } else {
      throw new Error('Failed to create niche');
    }
  } catch (error) {
    console.error('  ❌ Niches test failed:', error.message);
    throw error;
  }
}

async function testPublicEndpoints() {
  console.log('\n🌐 Testing Public Endpoints...');
  
  try {
    // Test public projects
    console.log('  📋 Testing public projects...');
    const projectsResponse = await makeRequest('/projects');
    if (projectsResponse.success) {
      console.log('  ✅ Public projects retrieved successfully');
      console.log('  📊 Public projects count:', projectsResponse.data?.length || 0);
    } else {
      throw new Error('Failed to get public projects');
    }
    
    // Test public categories
    console.log('  📁 Testing public categories...');
    const categoriesResponse = await makeRequest('/categories');
    if (categoriesResponse.success) {
      console.log('  ✅ Public categories retrieved successfully');
      console.log('  📊 Public categories count:', categoriesResponse.data?.length || 0);
    } else {
      throw new Error('Failed to get public categories');
    }
    
    // Test public technologies
    console.log('  🎯 Testing public technologies...');
    const technologiesResponse = await makeRequest('/technologies');
    if (technologiesResponse.success) {
      console.log('  ✅ Public technologies retrieved successfully');
      console.log('  📊 Public technologies count:', technologiesResponse.data?.length || 0);
    } else {
      throw new Error('Failed to get public technologies');
    }
    
    // Test public niches
    console.log('  🏆 Testing public niches...');
    const nichesResponse = await makeRequest('/niches');
    if (nichesResponse.success) {
      console.log('  ✅ Public niches retrieved successfully');
      console.log('  📊 Public niches count:', nichesResponse.data?.length || 0);
    } else {
      throw new Error('Failed to get public niches');
    }
    
  } catch (error) {
    console.error('  ❌ Public endpoints test failed:', error.message);
    throw error;
  }
}

async function testSettings(token) {
  console.log('\n⚙️ Testing Settings...');
  
  try {
    // Test get settings
    console.log('  📋 Testing get settings...');
    const getResponse = await testWithAuth('/settings', {}, token);
    
    if (getResponse.success) {
      console.log('  ✅ Settings retrieved successfully');
      console.log('  📊 Settings count:', Object.keys(getResponse.data || {}).length);
    } else {
      throw new Error('Failed to get settings');
    }
    
    // Test update settings
    console.log('  ✏️ Testing settings update...');
    const testSettings = {
      banner_name: 'Test User',
      banner_title: 'Test Title',
      banner_tagline: 'Test tagline'
    };
    
    const updateResponse = await testWithAuth('/settings', {
      method: 'PUT',
      body: JSON.stringify(testSettings)
    }, token);
    
    if (updateResponse.success) {
      console.log('  ✅ Settings updated successfully');
    } else {
      throw new Error('Failed to update settings');
    }
    
  } catch (error) {
    console.error('  ❌ Settings test failed:', error.message);
    throw error;
  }
}

async function testContactQueries(token) {
  console.log('\n📨 Testing Contact Queries...');
  
  try {
    // Test create contact query
    console.log('  ➕ Testing contact query creation...');
    const testQuery = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'Test message content',
      inquiry_type: 'General Inquiry'
    };
    
    const createResponse = await testWithAuth('/contact-queries', {
      method: 'POST',
      body: JSON.stringify(testQuery)
    }, token);
    
    if (createResponse.success && createResponse.data) {
      console.log('  ✅ Contact query created successfully');
      const queryId = createResponse.data.id;
      
      // Test get contact queries
      console.log('  📋 Testing get contact queries...');
      const listResponse = await testWithAuth('/contact-queries', {}, token);
      
      if (listResponse.success && Array.isArray(listResponse.data)) {
        console.log('  ✅ Contact queries retrieved successfully');
        console.log('  📊 Contact queries count:', listResponse.data.length);
      } else {
        throw new Error('Failed to get contact queries');
      }
      
      // Test update contact query
      console.log('  ✏️ Testing contact query update...');
      const updateData = { status: 'in_progress', notes: 'Test notes' };
      const updateResponse = await testWithAuth(`/contact-queries/${queryId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      }, token);
      
      if (updateResponse.success) {
        console.log('  ✅ Contact query updated successfully');
      } else {
        throw new Error('Failed to update contact query');
      }
      
      // Test delete contact query
      console.log('  🗑️ Testing contact query deletion...');
      const deleteResponse = await testWithAuth(`/contact-queries/${queryId}`, {
        method: 'DELETE'
      }, token);
      
      if (deleteResponse.success) {
        console.log('  ✅ Contact query deleted successfully');
      } else {
        throw new Error('Failed to delete contact query');
      }
      
    } else {
      throw new Error('Failed to create contact query');
    }
  } catch (error) {
    console.error('  ❌ Contact queries test failed:', error.message);
    throw error;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Full Migration Test Suite...');
  console.log('📍 API Base URL:', API_BASE);
  
  let token = null;
  let user = null;
  
  try {
    // Test authentication
    token = await testAuthentication();
    user = await testCurrentUser(token);
    
    // Test all data operations
    await testProjects(token);
    await testCategories(token);
    await testTechnologies(token);
    await testNiches(token);
    await testSettings(token);
    await testContactQueries(token);
    
    // Test public endpoints
    await testPublicEndpoints();
    
    console.log('\n🎉 All tests passed! Full migration is working correctly.');
    console.log('✅ Authentication: Using local API');
    console.log('✅ Data Operations: Using local API');
    console.log('✅ Public Endpoints: Using local API');
    console.log('✅ Image Operations: Still using Supabase (as intended)');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error('🔍 Check your API server and database connection');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testAuthentication,
  testCurrentUser,
  testProjects,
  testCategories,
  testTechnologies,
  testNiches,
  testSettings,
  testContactQueries,
  testPublicEndpoints
}; 