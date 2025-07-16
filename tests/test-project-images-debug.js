// Debug test for project images API endpoint
const API_BASE = 'http://localhost:3001/api';

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${emoji} [${timestamp}] ${message}`);
};

const testProjectImages = async () => {
  try {
    log('🔍 Testing project images API...');
    
    // Step 1: Login to get token
    log('Step 1: Getting authentication token...');
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
    
    // Step 2: Get user's projects
    log('Step 2: Getting user projects...');
    const projectsResponse = await fetch(`${API_BASE}/dashboard/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const projectsData = await projectsResponse.json();
    if (!projectsData.success) {
      throw new Error(`Failed to get projects: ${projectsData.error}`);
    }
    
    const projects = projectsData.data || [];
    log(`Found ${projects.length} projects`);
    
    if (projects.length === 0) {
      log('No projects found. Creating a test project...', 'warning');
      
      // Create a test project
      const createProjectResponse = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Test Project for Images',
          description: 'A test project to debug image uploads',
          category: 'Web Development',
          status: 'draft'
        })
      });
      
      const createProjectData = await createProjectResponse.json();
      if (!createProjectData.success) {
        throw new Error(`Failed to create test project: ${createProjectData.error}`);
      }
      
      projects.push(createProjectData.data);
      log(`Created test project: ${createProjectData.data.title} (ID: ${createProjectData.data.id})`);
    }
    
    const testProject = projects[0];
    log(`Using project: ${testProject.title} (ID: ${testProject.id})`);
    
    // Step 3: Test GET project images (should be empty initially)
    log('Step 3: Testing GET project images...');
    const getImagesResponse = await fetch(`${API_BASE}/projects/${testProject.id}/images`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const getImagesData = await getImagesResponse.json();
    log(`GET images response status: ${getImagesResponse.status}`);
    log(`GET images success: ${getImagesData.success}`);
    
    if (getImagesData.success) {
      log(`Found ${getImagesData.data.length} images`);
    } else {
      log(`GET images error: ${getImagesData.error}`, 'error');
    }
    
    // Step 4: Test POST project images
    log('Step 4: Testing POST project images...');
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
    
    const postImagesResponse = await fetch(`${API_BASE}/projects/${testProject.id}/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testImageData)
    });
    
    const postImagesData = await postImagesResponse.json();
    log(`POST images response status: ${postImagesResponse.status}`);
    log(`POST images success: ${postImagesData.success}`);
    
    if (postImagesData.success) {
      log('✅ Successfully added image to project');
      log(`Added image ID: ${postImagesData.data.id}`);
    } else {
      log(`❌ POST images error: ${postImagesData.error}`, 'error');
    }
    
    // Step 5: Test GET project images again (should now have 1 image)
    log('Step 5: Testing GET project images again...');
    const getImagesResponse2 = await fetch(`${API_BASE}/projects/${testProject.id}/images`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const getImagesData2 = await getImagesResponse2.json();
    log(`GET images response status: ${getImagesResponse2.status}`);
    log(`GET images success: ${getImagesData2.success}`);
    
    if (getImagesData2.success) {
      log(`Found ${getImagesData2.data.length} images after POST`);
    } else {
      log(`GET images error: ${getImagesData2.error}`, 'error');
    }
    
  } catch (error) {
    log(`Project images test failed: ${error.message}`, 'error');
  }
};

// Run the test
testProjectImages(); 