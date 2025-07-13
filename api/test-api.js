const API_BASE = 'http://localhost:3001/api';

// Test functions
async function testConnection() {
  console.log('🔍 Testing API connection...');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'muneebarif11@gmail.com', password: '11223344' })
    });
    
    if (response.ok) {
      console.log('✅ API is running and responding');
    } else {
      console.log('⚠️ API is running but login failed (expected)');
    }
    return true;
  } catch (error) {
    console.log('❌ API connection failed:', error.message);
    return false;
  }
}

async function testPublicProjects() {
  console.log('\n📊 Testing public projects endpoint...');
  try {
    const response = await fetch(`${API_BASE}/projects`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Public projects endpoint working');
      console.log(`📈 Found ${data.data?.length || 0} published projects`);
    } else {
      console.log('❌ Public projects endpoint failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Public projects test failed:', error.message);
  }
}

async function testPasswordUpdate() {
  console.log('\n🔑 Testing password update flow...');
  
  // First, try to register with the new password
  try {
    console.log('📝 Attempting to register with password: 11223344');
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'muneebarif11@gmail.com', 
        password: '11223344' 
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('📋 Register response:', registerData);
    
    if (registerData.success) {
      console.log('✅ User registered successfully with new password');
      return true;
    } else if (registerData.error && registerData.error.includes('already exists')) {
      console.log('⚠️ User already exists, attempting to update password...');
      
      // Try to update the password using the new endpoint
      try {
        console.log('🔄 Updating password via API endpoint...');
        const updateResponse = await fetch(`${API_BASE}/auth/update-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: 'muneebarif11@gmail.com', 
            newPassword: '11223344' 
          })
        });
        
        const updateData = await updateResponse.json();
        console.log('📋 Password update response:', updateData);
        
        if (updateData.success) {
          console.log('✅ Password updated successfully!');
          return true;
        } else {
          console.log('❌ Password update failed:', updateData.error);
          return false;
        }
      } catch (updateError) {
        console.log('❌ Password update request failed:', updateError.message);
        return false;
      }
    } else {
      console.log('❌ Register failed:', registerData.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Register test failed:', error.message);
    return false;
  }
}

async function testAuthEndpoints() {
  console.log('\n🔐 Testing authentication endpoints...');
  
  // Test login with current credentials
  console.log('🔑 Testing login with password: 11223344');
  try {
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'muneebarif11@gmail.com', 
        password: '11223344' 
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('📋 Login response:', loginData);
    
    if (loginData.success) {
      console.log('✅ Login successful!');
      console.log('🎫 Token received:', loginData.token ? 'Yes' : 'No');
      return loginData.token;
    } else {
      console.log('❌ Login failed:', loginData.error);
      
      // Try with different password variations
      console.log('🔄 Testing alternative password formats...');
      
      const testPasswords = ['11223344', '11223344!', '11223344@', '11223344#'];
      
      for (const password of testPasswords) {
        try {
          console.log(`🔑 Trying password: ${password}`);
          const altResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: 'muneebarif11@gmail.com', 
              password: password 
            })
          });
          
          const altData = await altResponse.json();
          if (altData.success) {
            console.log(`✅ Login successful with password: ${password}`);
            return altData.token;
          }
        } catch (error) {
          console.log(`❌ Failed with password ${password}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.log('❌ Login test failed:', error.message);
  }
  
  return null;
}

async function testProtectedEndpoints(token) {
  if (!token) {
    console.log('\n⚠️ Skipping protected endpoints test (no token)');
    return;
  }
  
  console.log('\n🔒 Testing protected endpoints...');
  
  // Test dashboard projects
  try {
    const response = await fetch(`${API_BASE}/dashboard/projects`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('✅ Dashboard projects endpoint working');
      console.log(`📈 Found ${data.data?.length || 0} user projects`);
    } else {
      console.log('❌ Dashboard projects failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Dashboard projects test failed:', error.message);
  }
}

async function testAuthFlow() {
  console.log('\n🔄 Testing complete authentication flow...');
  
  // Step 1: Test password update
  const passwordUpdated = await testPasswordUpdate();
  
  // Step 2: Test login
  const token = await testAuthEndpoints();
  
  // Step 3: Test protected endpoints
  await testProtectedEndpoints(token);
  
  // Summary
  console.log('\n📊 Authentication Flow Summary:');
  console.log(`   Password Update: ${passwordUpdated ? '✅ Success' : '❌ Failed'}`);
  console.log(`   Login: ${token ? '✅ Success' : '❌ Failed'}`);
  console.log(`   Protected Access: ${token ? '✅ Available' : '❌ Not Available'}`);
  
  return token;
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Enhanced API Tests...\n');
  
  const isConnected = await testConnection();
  if (!isConnected) {
    console.log('\n❌ Cannot connect to API. Make sure it\'s running on port 3001');
    return;
  }
  
  await testPublicProjects();
  const token = await testAuthFlow();
  
  console.log('\n✅ Enhanced API tests completed!');
  
  if (token) {
    console.log('🎉 Authentication flow is working correctly!');
  } else {
    console.log('⚠️ Authentication flow needs attention - check database password hash');
  }
}

// Run tests
runTests().catch(console.error); 