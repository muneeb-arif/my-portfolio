// Test the frontend admin service
const testFrontendAdminService = async () => {
  console.log('🔍 Testing Frontend Admin Service...\n');
  
  try {
    // Test login first
    console.log('1. Testing login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'muneebarif11@gmail.com',
        password: '11223344'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('   Full response:', JSON.stringify(loginData, null, 2));
    
    // Get the token from the correct location
    const token = loginData.token;
    if (!token) {
      console.log('❌ No token found in response');
      return;
    }
    
    console.log('   Token found:', token.substring(0, 20) + '...');
    console.log('   User is_admin:', loginData.user?.is_admin);
    
    // Test admin sections API
    console.log('\n2. Testing admin sections API...');
    const adminResponse = await fetch('http://localhost:3001/api/admin/sections', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('   Response status:', adminResponse.status);
    
    if (!adminResponse.ok) {
      const errorText = await adminResponse.text();
      console.log('❌ Admin API failed:', errorText);
      return;
    }
    
    const adminData = await adminResponse.json();
    console.log('✅ Admin API successful');
    console.log('   Response:', JSON.stringify(adminData, null, 2));
    
    // Test with non-admin user
    console.log('\n3. Testing with non-admin user...');
    const loginResponse2 = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ahsanmehmoodahsan@gmail.com',
        password: '11223344'
      })
    });
    
    if (!loginResponse2.ok) {
      console.log('❌ Non-admin login failed:', loginResponse2.status);
      return;
    }
    
    const loginData2 = await loginResponse2.json();
    console.log('✅ Non-admin login successful');
    console.log('   Non-admin user is_admin:', loginData2.user?.is_admin);
    
    const token2 = loginData2.token;
    if (!token2) {
      console.log('❌ No token found for non-admin user');
      return;
    }
    
    const adminResponse2 = await fetch('http://localhost:3001/api/admin/sections', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token2}`
      }
    });
    
    console.log('   Non-admin response status:', adminResponse2.status);
    
    if (!adminResponse2.ok) {
      const errorText2 = await adminResponse2.text();
      console.log('   Non-admin response:', errorText2);
    } else {
      const adminData2 = await adminResponse2.json();
      console.log('   Non-admin response:', JSON.stringify(adminData2, null, 2));
    }
    
    console.log('\n📊 SUMMARY:');
    console.log('   - Admin user should see admin sections in dashboard');
    console.log('   - Non-admin user should NOT see admin sections in dashboard');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testFrontendAdminService(); 