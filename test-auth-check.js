// Test script to check authentication for image uploads
const fetch = require('node-fetch');

async function testAuthCheck() {
  console.log('🔐 Testing Authentication for Image Uploads');
  
  try {
    // Test 1: Check if we can access the auth endpoint
    console.log('\n1. Testing auth endpoint...');
    const authResponse = await fetch('http://localhost:3001/api/auth/me');
    console.log('Auth endpoint status:', authResponse.status);
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Auth endpoint working:', authData);
    } else {
      console.log('⚠️ Auth endpoint requires login (expected)');
    }

    // Test 2: Check if we can create a project (requires auth)
    console.log('\n2. Testing project creation (requires auth)...');
    const projectData = {
      title: 'Test Project',
      description: 'Test description',
      category: 'Web Development',
      status: 'draft',
      is_prompt: 1
    };

    const createResponse = await fetch('http://localhost:3001/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will fail
      },
      body: JSON.stringify(projectData)
    });

    console.log('Project creation status:', createResponse.status);
    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('✅ Project creation working:', result);
    } else {
      console.log('⚠️ Project creation requires valid auth token (expected)');
    }

    console.log('\n🎉 Auth tests completed!');
    console.log('\nTo test image uploads:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Log in to the dashboard (you need to be authenticated)');
    console.log('3. Go to Dashboard > Prompts');
    console.log('4. Try creating a new prompt with images');
    console.log('5. Check browser console for any errors');
    console.log('\nKey points:');
    console.log('- User must be logged in for image uploads to work');
    console.log('- Check browser console for authentication errors');
    console.log('- Make sure you have a valid session/token');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAuthCheck(); 