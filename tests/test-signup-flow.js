const API_BASE = 'http://localhost:3001';

async function testSignupFlow() {
  console.log('🚀 Testing Signup Flow...\n');
  
  try {
    // Test 1: Register new user with subdomain
    console.log('Step 1: Testing user registration with subdomain...');
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    const testSubdomain = `test${Date.now()}`;
    
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        subdomain: testSubdomain
      })
    });
    
    const registerData = await registerResponse.json();
    
    if (!registerResponse.ok || !registerData.success) {
      throw new Error(`Registration failed: ${registerData.error}`);
    }
    
    console.log('✅ User registered successfully');
    console.log('   User ID:', registerData.user.id);
    console.log('   Email:', registerData.user.email);
    console.log('   Token received:', !!registerData.token);
    
    const token = registerData.token;
    
    // Test 2: Update color theme
    console.log('\nStep 2: Testing color theme update...');
    const themeResponse = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        theme_name: 'ocean',
        theme_color: '#63B3ED'
      })
    });
    
    const themeData = await themeResponse.json();
    
    if (!themeResponse.ok || !themeData.success) {
      throw new Error(`Theme update failed: ${themeData.error}`);
    }
    
    console.log('✅ Color theme updated successfully');
    
    // Test 3: Update site settings
    console.log('\nStep 3: Testing site settings update...');
    const siteSettingsResponse = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        site_name: 'My Portfolio',
        banner_name: 'John Doe',
        banner_tagline: 'Full-stack developer passionate about creating amazing web experiences'
      })
    });
    
    const siteSettingsData = await siteSettingsResponse.json();
    
    if (!siteSettingsResponse.ok || !siteSettingsData.success) {
      throw new Error(`Site settings update failed: ${siteSettingsData.error}`);
    }
    
    console.log('✅ Site settings updated successfully');
    
    // Test 4: Update homepage sections
    console.log('\nStep 4: Testing homepage sections update...');
    const sectionsResponse = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        section_hero_visible: true,
        section_portfolio_visible: true,
        section_technologies_visible: true,
        section_domains_visible: true,
        section_project_cycle_visible: true,
        section_prompts_visible: false
      })
    });
    
    const sectionsData = await sectionsResponse.json();
    
    if (!sectionsResponse.ok || !sectionsData.success) {
      throw new Error(`Sections update failed: ${sectionsData.error}`);
    }
    
    console.log('✅ Homepage sections updated successfully');
    
    // Test 5: Verify domain was created
    console.log('\nStep 5: Verifying domain creation...');
    const domainResponse = await fetch(`${API_BASE}/domains/user?domain=${encodeURIComponent(`https://${testSubdomain}.theexpertways.com/`)}`);
    
    const domainData = await domainResponse.json();
    
    if (!domainResponse.ok || !domainData.success) {
      throw new Error(`Domain verification failed: ${domainData.error}`);
    }
    
    console.log('✅ Domain verified successfully');
    console.log('   Domain user ID:', domainData.data.id);
    console.log('   Domain user email:', domainData.data.email);
    
    // Test 6: Get final settings
    console.log('\nStep 6: Getting final settings...');
    const finalSettingsResponse = await fetch(`${API_BASE}/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const finalSettingsData = await finalSettingsResponse.json();
    
    if (!finalSettingsResponse.ok || !finalSettingsData.success) {
      throw new Error(`Get settings failed: ${finalSettingsData.error}`);
    }
    
    console.log('✅ Final settings retrieved successfully');
    console.log('   Theme:', finalSettingsData.data.theme_name);
    console.log('   Banner name:', finalSettingsData.data.banner_name);
    console.log('   Hero visible:', finalSettingsData.data.section_hero_visible);
    
    console.log('\n🎉 All signup flow tests passed!');
    console.log(`📝 Test subdomain: https://${testSubdomain}.theexpertways.com/`);
    console.log(`📧 Test email: ${testEmail}`);
    
  } catch (error) {
    console.error('❌ Signup flow test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testSignupFlow(); 