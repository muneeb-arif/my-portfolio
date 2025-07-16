// Test the exact frontend flow that's causing the 404 error
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${emoji} [${timestamp}] ${message}`);
};

// Simulate the apiService.makeRequest function
const makeRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('api_token') || 'test-token';
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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
};

// Simulate the imageService.saveImageMetadata function
const saveImageMetadata = async (projectId, imageData) => {
  try {
    // Simulate getCurrentUser check
    const token = localStorage.getItem('api_token');
    if (!token) {
      throw new Error('User not authenticated');
    }

    // Use local API instead of Supabase
    const response = await makeRequest(`/projects/${projectId}/images`, {
      method: 'POST',
      body: JSON.stringify({
        url: imageData.url,
        path: imageData.path,
        name: imageData.name,
        original_name: imageData.original_name,
        size: imageData.size,
        type: imageData.type,
        bucket: 'images'
      })
    });

    if (response.success) {
      return { success: true, data: response.data };
    } else {
      throw new Error(response.error || 'Failed to save image metadata');
    }
  } catch (error) {
    console.error('Error saving image metadata:', error);
    return { success: false, error: error.message };
  }
};

// Simulate the updateProjectImages function
const updateProjectImages = async (projectId, currentImages) => {
  try {
    // Simulate getCurrentUser check
    const token = localStorage.getItem('api_token');
    if (!token) {
      throw new Error('User not authenticated');
    }

    // Simulate fetching current images from DB
    const dbResult = await makeRequest(`/projects/${projectId}/images`);
    if (!dbResult.success) throw new Error(dbResult.error);
    const dbImages = dbResult.data || [];

    log(`Found ${dbImages.length} existing images in DB`);
    log(`Current images to save: ${currentImages.length}`);

    // Simulate deleting existing images
    const deleteResult = await makeRequest(`/projects/${projectId}/images`, {
      method: 'DELETE'
    });
    if (!deleteResult.success) {
      log(`Warning: Error deleting existing project images: ${deleteResult.error}`, 'warning');
    }

    // Simulate adding new images
    if (currentImages.length > 0) {
      for (let i = 0; i < currentImages.length; i++) {
        const image = currentImages[i];
        
        const imageData = {
          url: image.url,
          path: image.fullPath || image.url,
          name: image.name || image.original_name,
          original_name: image.original_name || image.name,
          size: image.size,
          type: image.type,
          bucket: 'images',
          order_index: i + 1
        };

        log(`Saving image ${i + 1}/${currentImages.length}: ${imageData.name}`);
        const result = await saveImageMetadata(projectId, imageData);
        if (!result.success) {
          log(`Error inserting project image: ${result.error}`, 'error');
          throw new Error(`Failed to save project images: ${result.error}`);
        }
      }

      log(`✅ Successfully updated ${currentImages.length} project images`);
    }

    return true;
  } catch (error) {
    log(`Error updating project images: ${error.message}`, 'error');
    throw error;
  }
};

const testFrontendFlow = async () => {
  try {
    log('🔍 Testing exact frontend flow...');
    
    // Step 1: Login and store token (simulate frontend login)
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
    
    // Simulate storing token in localStorage
    localStorage.setItem('api_token', token);
    log('Token stored in localStorage');
    
    // Step 2: Get or create a project
    log('Step 2: Getting user projects...');
    const projectsResponse = await makeRequest('/dashboard/projects');
    const projects = projectsResponse.data || [];
    log(`Found ${projects.length} projects`);
    
    let testProject;
    if (projects.length === 0) {
      log('Creating test project...', 'warning');
      const createProjectResponse = await makeRequest('/projects', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Project for Images',
          description: 'A test project to debug image uploads',
          category: 'Web Development',
          status: 'draft'
        })
      });
      testProject = createProjectResponse.data;
    } else {
      testProject = projects[0];
    }
    
    log(`Using project: ${testProject.title} (ID: ${testProject.id})`);
    
    // Step 3: Simulate the updateProjectImages call with some test images
    log('Step 3: Testing updateProjectImages function...');
    const testImages = [
      {
        url: 'https://example.com/test-image-1.jpg',
        fullPath: 'test-user/1234567890_test-image-1.jpg',
        name: 'test-image-1.jpg',
        original_name: 'test-image-1.jpg',
        size: 1024000,
        type: 'image/jpeg'
      },
      {
        url: 'https://example.com/test-image-2.jpg',
        fullPath: 'test-user/1234567890_test-image-2.jpg',
        name: 'test-image-2.jpg',
        original_name: 'test-image-2.jpg',
        size: 2048000,
        type: 'image/jpeg'
      }
    ];
    
    await updateProjectImages(testProject.id, testImages);
    log('✅ updateProjectImages completed successfully');
    
    // Step 4: Verify the images were saved
    log('Step 4: Verifying saved images...');
    const verifyResponse = await makeRequest(`/projects/${testProject.id}/images`);
    log(`Found ${verifyResponse.data.length} images after update`);
    
  } catch (error) {
    log(`Frontend flow test failed: ${error.message}`, 'error');
  }
};

// Run the test
testFrontendFlow(); 