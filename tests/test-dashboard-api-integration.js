const puppeteer = require('puppeteer');

async function testDashboardApiIntegration() {
  console.log('🔍 Testing Dashboard API Integration...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Enable request interception to monitor API calls
  await page.setRequestInterception(true);
  
  const apiCalls = [];
  const supabaseCalls = [];
  
  page.on('request', request => {
    const url = request.url();
    
    // Monitor API calls
    if (url.includes('localhost:3001/api') || url.includes('/api/')) {
      apiCalls.push({
        method: request.method(),
        url,
        timestamp: new Date().toISOString()
      });
      console.log(`🔗 API Call: ${request.method()} ${url}`);
    }
    
    // Monitor Supabase calls (should be minimal)
    if (url.includes('supabase.co/rest/v1')) {
      supabaseCalls.push({
        method: request.method(),
        url,
        timestamp: new Date().toISOString()
      });
      console.log(`⚠️ Supabase Call: ${request.method()} ${url}`);
    }
    
    request.continue();
  });
  
  try {
    // Navigate to dashboard
    console.log('📱 Navigating to dashboard...');
    await page.goto('http://localhost:3000/dashboard', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for dashboard to load
    console.log('⏳ Waiting for dashboard to load...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Analyze the API calls
    console.log('\n📊 Dashboard API Integration Analysis:');
    console.log('=====================================');
    
    // Group API calls by endpoint
    const apiEndpoints = apiCalls.reduce((acc, call) => {
      const endpoint = call.url.split('/api/')[1]?.split('?')[0] || 'unknown';
      if (!acc[endpoint]) {
        acc[endpoint] = {
          endpoint,
          count: 0,
          calls: []
        };
      }
      acc[endpoint].count++;
      acc[endpoint].calls.push(call);
      return acc;
    }, {});
    
    console.log('\n🔗 API Endpoints Called:');
    Object.values(apiEndpoints).forEach(endpoint => {
      console.log(`   ${endpoint.endpoint}: ${endpoint.count} calls`);
    });
    
    // Check for expected API calls
    const expectedEndpoints = [
      'projects',
      'technologies', 
      'niches',
      'categories',
      'settings',
      'shared-hosting-updates'
    ];
    
    console.log('\n✅ Expected API Endpoints:');
    expectedEndpoints.forEach(endpoint => {
      const found = apiEndpoints[endpoint];
      if (found) {
        console.log(`   ✅ ${endpoint}: ${found.count} calls`);
      } else {
        console.log(`   ❌ ${endpoint}: Not called`);
      }
    });
    
    // Check Supabase calls
    console.log('\n⚠️ Supabase REST Calls (should be minimal):');
    if (supabaseCalls.length === 0) {
      console.log('   ✅ No direct Supabase REST calls detected!');
    } else {
      supabaseCalls.forEach(call => {
        console.log(`   ⚠️ ${call.method} ${call.url}`);
      });
    }
    
    // Summary
    console.log('\n📈 Summary:');
    console.log('===========');
    console.log(`Total API calls: ${apiCalls.length}`);
    console.log(`Total Supabase REST calls: ${supabaseCalls.length}`);
    console.log(`API endpoints used: ${Object.keys(apiEndpoints).length}`);
    
    if (supabaseCalls.length === 0) {
      console.log('\n🎉 SUCCESS: Dashboard is fully using the API!');
    } else {
      console.log('\n⚠️ WARNING: Some direct Supabase calls still detected');
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testDashboardApiIntegration().catch(console.error); 