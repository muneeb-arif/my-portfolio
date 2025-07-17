const API_BASE = 'http://localhost:3001/api';

async function testDomainSignup() {
  console.log('🧪 Testing Domain-Based Signup Flow...\n');

  const timestamp = Date.now();
  const testUser = {
    email: `test-domain-${timestamp}@example.com`,
    password: 'testpassword123',
    fullName: 'Test Domain User',
    domain: `http://test-domain-${timestamp}.example.com`
  };

  try {
    // Test 1: Register with domain
    console.log('📝 Testing user registration with domain...');
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const registerData = await registerResponse.json();
    
    if (registerData.success) {
      console.log('✅ Registration successful');
      console.log('   User ID:', registerData.user.id);
      console.log('   Email:', registerData.user.email);
      console.log('   Token received:', !!registerData.token);
    } else {
      console.log('❌ Registration failed:', registerData.error);
      return;
    }

    // Test 2: Login with the new user
    console.log('\n🔑 Testing login with new user...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      console.log('✅ Login successful');
      const token = loginData.token;
      
      // Test 3: Verify domain lookup
      console.log('\n🌐 Testing domain lookup...');
      const domainResponse = await fetch(`${API_BASE}/domains/user?domain=${encodeURIComponent(testUser.domain)}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const domainData = await domainResponse.json();
      
      if (domainData.success) {
        console.log('✅ Domain lookup successful');
        console.log('   Domain user ID:', domainData.data.id);
        console.log('   Domain user email:', domainData.data.email);
      } else {
        console.log('❌ Domain lookup failed:', domainData.error);
      }

      // Test 4: Get user's settings (should be domain-based)
      console.log('\n⚙️ Testing domain-based settings...');
      const settingsResponse = await fetch(`${API_BASE}/settings`, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': testUser.domain,
          'Referer': testUser.domain
        }
      });

      const settingsData = await settingsResponse.json();
      
      if (settingsData.success) {
        console.log('✅ Domain-based settings loaded');
        console.log('   Banner name:', settingsData.data.banner_name);
        console.log('   Theme:', settingsData.data.theme_name);
        console.log('   Settings count:', Object.keys(settingsData.data).length);
      } else {
        console.log('❌ Settings failed:', settingsData.error);
      }

      // Test 5: Get user's projects (should be domain-based)
      console.log('\n📁 Testing domain-based projects...');
      const projectsResponse = await fetch(`${API_BASE}/projects`, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': testUser.domain,
          'Referer': testUser.domain
        }
      });

      const projectsData = await projectsResponse.json();
      
      if (projectsData.success) {
        console.log('✅ Domain-based projects loaded');
        console.log('   Projects count:', projectsData.data.length);
      } else {
        console.log('❌ Projects failed:', projectsData.error);
      }

      // Test 6: Get user's categories (should be domain-based)
      console.log('\n📂 Testing domain-based categories...');
      const categoriesResponse = await fetch(`${API_BASE}/categories`, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': testUser.domain,
          'Referer': testUser.domain
        }
      });

      const categoriesData = await categoriesResponse.json();
      
      if (categoriesData.success) {
        console.log('✅ Domain-based categories loaded');
        console.log('   Categories count:', categoriesData.data.length);
        console.log('   Default categories:', categoriesData.data.map(c => c.name).join(', '));
      } else {
        console.log('❌ Categories failed:', categoriesData.error);
      }

    } else {
      console.log('❌ Login failed:', loginData.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDomainSignup(); 