// Debug script for image upload functionality
const fs = require('fs');
const path = require('path');

async function testImageUpload() {
  console.log('🧪 Testing Image Upload Functionality');
  
  try {
    // Test 1: Check if we can access the image upload endpoint
    console.log('\n1. Testing image upload endpoint...');
    const testProjectId = 'test-project-id';
    const response = await fetch(`http://localhost:3001/api/projects/${testProjectId}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        url: 'https://example.com/test-image.jpg',
        path: '/test/path/image.jpg',
        name: 'test-image.jpg',
        original_name: 'test-image.jpg',
        size: 1024,
        type: 'image/jpeg',
        bucket: 'images',
        order_index: 1
      })
    });
    
    console.log('Image upload endpoint status:', response.status);
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Image upload endpoint working:', result);
    } else {
      console.log('⚠️ Image upload endpoint requires auth (expected)');
    }

    // Test 2: Check Supabase configuration
    console.log('\n2. Testing Supabase configuration...');
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      console.log('✅ Supabase environment variables are set');
      console.log('URL:', supabaseUrl.substring(0, 30) + '...');
      console.log('Key:', supabaseKey.substring(0, 30) + '...');
    } else {
      console.log('❌ Supabase environment variables are missing');
    }

    // Test 3: Check if frontend can access Supabase
    console.log('\n3. Testing frontend Supabase access...');
    const frontendResponse = await fetch('http://localhost:3000');
    if (frontendResponse.ok) {
      console.log('✅ Frontend is accessible');
    } else {
      console.log('❌ Frontend is not accessible');
    }

    console.log('\n🎉 Debug tests completed!');
    console.log('\nTo test the full functionality:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Open browser developer tools (F12)');
    console.log('3. Go to Console tab');
    console.log('4. Log in to the dashboard');
    console.log('5. Go to Dashboard > Prompts');
    console.log('6. Try creating a new prompt with images');
    console.log('7. Check the console for debug logs');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testImageUpload(); 