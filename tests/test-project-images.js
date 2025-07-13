const https = require('https');
const http = require('http');

// Simple HTTP request function
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: jsonData,
            status: res.statusCode
          });
        } catch (error) {
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: data,
            status: res.statusCode
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testProjectImages() {
  console.log('🧪 Testing Project Images API Endpoints...\n');
  
  const baseUrl = 'http://localhost:3001/api';

  try {
    // First, let's get a project to work with
    console.log('1. Getting projects...');
    const projectsResponse = await makeRequest(`${baseUrl}/projects`);
    
    if (!projectsResponse.success || !projectsResponse.data.data || projectsResponse.data.data.length === 0) {
      console.log('❌ No projects found. Please create a project first.');
      return;
    }

    const project = projectsResponse.data.data[0];
    console.log(`✅ Found project: ${project.title} (ID: ${project.id})`);

    // Test getting project images (should be empty initially)
    console.log('\n2. Getting project images...');
    const getImagesResponse = await makeRequest(`${baseUrl}/projects/${project.id}/images`);
    
    if (getImagesResponse.success) {
      console.log(`✅ Project images retrieved: ${getImagesResponse.data.data.length} images`);
      console.log('Images:', getImagesResponse.data.data);
    } else {
      console.log('❌ Failed to get project images:', getImagesResponse.data.error);
    }

    // Test adding a sample image metadata
    console.log('\n3. Adding sample image metadata...');
    const sampleImage = {
      url: 'https://example.com/test-image.jpg',
      path: 'test-user/1234567890_test-image.jpg',
      name: 'test-image.jpg',
      original_name: 'test-image.jpg',
      size: 1024000,
      type: 'image/jpeg',
      bucket: 'images',
      order_index: 1
    };

    const addImageResponse = await makeRequest(`${baseUrl}/projects/${project.id}/images`, {
      method: 'POST',
      body: JSON.stringify(sampleImage)
    });

    if (addImageResponse.success) {
      console.log('✅ Sample image metadata added successfully');
      console.log('Added image:', addImageResponse.data.data);
    } else {
      console.log('❌ Failed to add image metadata:', addImageResponse.data.error);
    }

    // Test getting project images again (should now have 1 image)
    console.log('\n4. Getting project images again...');
    const getImagesResponse2 = await makeRequest(`${baseUrl}/projects/${project.id}/images`);
    
    if (getImagesResponse2.success) {
      console.log(`✅ Project images retrieved: ${getImagesResponse2.data.data.length} images`);
      console.log('Images:', getImagesResponse2.data.data);
    } else {
      console.log('❌ Failed to get project images:', getImagesResponse2.data.error);
    }

    // Test deleting all project images
    console.log('\n5. Deleting all project images...');
    const deleteImagesResponse = await makeRequest(`${baseUrl}/projects/${project.id}/images`, {
      method: 'DELETE'
    });

    if (deleteImagesResponse.success) {
      console.log('✅ All project images deleted successfully');
    } else {
      console.log('❌ Failed to delete project images:', deleteImagesResponse.data.error);
    }

    // Test getting project images one more time (should be empty)
    console.log('\n6. Getting project images after deletion...');
    const getImagesResponse3 = await makeRequest(`${baseUrl}/projects/${project.id}/images`);
    
    if (getImagesResponse3.success) {
      console.log(`✅ Project images retrieved: ${getImagesResponse3.data.data.length} images`);
      console.log('Images:', getImagesResponse3.data.data);
    } else {
      console.log('❌ Failed to get project images:', getImagesResponse3.data.error);
    }

    console.log('\n🎉 Project Images API test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProjectImages(); 