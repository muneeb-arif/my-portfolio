const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : '🔍';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const testDomainLookup = async () => {
  try {
    log('🔍 Testing domain lookup...');
    
    // Step 1: Login to get token
    log('Step 1: Logging in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'zm4717696@gmail.com',
        password: '11223344'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error(`Login failed: ${loginData.error}`);
    }
    
    const token = loginData.token;
    log('✅ Login successful');
    
    // Step 2: Get user's domains
    log('Step 2: Getting user domains...');
    const domainsResponse = await fetch(`${API_BASE}/domains/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const domainsData = await domainsResponse.json();
    if (!domainsData.success) {
      throw new Error(`Failed to get domains: ${domainsData.error}`);
    }
    
    const domains = domainsData.data || [];
    log(`📊 Found ${domains.length} domains for user`);
    
    domains.forEach(domain => {
      log(`🌐 Domain: ${domain.name}, Status: ${domain.status}, User ID: ${domain.user_id}`);
    });
    
    // Step 3: Test public projects endpoint with different domain headers
    log('Step 3: Testing public projects with domain headers...');
    
    if (domains.length > 0) {
      const testDomain = domains[0];
      log(`🧪 Testing with domain: ${testDomain.name}`);
      
      const publicResponse = await fetch(`${API_BASE}/projects`, {
        headers: {
          'Origin': `http://${testDomain.name}`,
          'Referer': `http://${testDomain.name}/`
        }
      });
      
      const publicData = await publicResponse.json();
      if (!publicData.success) {
        throw new Error(`Failed to get public projects: ${publicData.error}`);
      }
      
      const publicProjects = publicData.data || [];
      const prompts = publicProjects.filter(p => p.is_prompt === 1);
      const regularProjects = publicProjects.filter(p => p.is_prompt !== 1);
      
      log(`🌐 Found ${publicProjects.length} public projects`);
      log(`💡 Found ${prompts.length} prompts`);
      log(`📁 Found ${regularProjects.length} regular projects`);
      log(`🎭 Demo data: ${publicData.demo ? 'Yes' : 'No'}`);
      
      if (publicData.demo) {
        log('⚠️ Using demo data - domain lookup failed', 'warning');
      } else {
        log('✅ Using real user data - domain lookup successful', 'success');
      }
    } else {
      log('⚠️ No domains found for user', 'warning');
      
      // Test with localhost
      log('🧪 Testing with localhost...');
      const publicResponse = await fetch(`${API_BASE}/projects`, {
        headers: {
          'Origin': 'http://localhost:3000',
          'Referer': 'http://localhost:3000/'
        }
      });
      
      const publicData = await publicResponse.json();
      if (!publicData.success) {
        throw new Error(`Failed to get public projects: ${publicData.error}`);
      }
      
      log(`🌐 Found ${publicData.data?.length || 0} public projects`);
      log(`🎭 Demo data: ${publicData.demo ? 'Yes' : 'No'}`);
      
      if (publicData.demo) {
        log('⚠️ Using demo data - no domain configured for localhost', 'warning');
      } else {
        log('✅ Using real user data - localhost domain lookup successful', 'success');
      }
    }
    
    log('🎉 Domain lookup test completed!', 'success');
    
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'error');
    console.error('Full error:', error);
  }
};

// Run the test
testDomainLookup(); 