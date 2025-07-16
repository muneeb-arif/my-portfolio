const puppeteer = require('puppeteer');

async function testDashboardApiCalls() {
  console.log('🔍 Testing Dashboard API Calls...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Enable request interception to monitor API calls
  await page.setRequestInterception(true);
  
  const apiCalls = [];
  
  page.on('request', request => {
    const url = request.url();
    
    // Monitor Supabase API calls
    if (url.includes('supabase.co') || url.includes('api.supabase.com')) {
      const method = request.method();
      const resource = url.split('/').pop().split('?')[0];
      
      apiCalls.push({
        method,
        url,
        resource,
        timestamp: new Date().toISOString()
      });
      
      console.log(`🔗 Supabase API Call: ${method} ${resource}`);
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
    
    // Take a screenshot to see what's on the page
    await page.screenshot({ path: 'dashboard-screenshot.png' });
    console.log('📸 Screenshot saved as dashboard-screenshot.png');
    
    // Check page content
    const pageContent = await page.content();
    console.log('📄 Page title:', await page.title());
    console.log('📄 Page URL:', page.url());
    
    // Wait for any element to appear
    console.log('⏳ Waiting for page to load...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Try to find dashboard elements
    const dashboardElements = await page.$$('.dashboard-section, .dashboard, [class*="dashboard"]');
    console.log(`🔍 Found ${dashboardElements.length} dashboard-related elements`);
    
    // Wait a bit more for any additional API calls
    console.log('⏳ Waiting for additional API calls...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Analyze the API calls
    console.log('\n📊 Dashboard API Calls Analysis:');
    console.log('================================');
    
    if (apiCalls.length === 0) {
      console.log('❌ No Supabase API calls detected');
      console.log('This could mean:');
      console.log('1. The dashboard is not loading properly');
      console.log('2. The user is not authenticated');
      console.log('3. The app is using fallback data');
      console.log('4. The API calls are going to your own API instead of Supabase');
      
      // Check if there are any other API calls
      const allRequests = [];
      page.on('request', request => {
        allRequests.push({
          method: request.method(),
          url: request.url()
        });
      });
      
      console.log('\n🔍 All API calls detected:');
      allRequests.forEach(req => {
        if (req.url.includes('localhost:3001') || req.url.includes('api')) {
          console.log(`   ${req.method} ${req.url}`);
        }
      });
      
      return;
    }
    
    const uniqueCalls = apiCalls.reduce((acc, call) => {
      const key = `${call.method} ${call.resource}`;
      if (!acc[key]) {
        acc[key] = {
          method: call.method,
          resource: call.resource,
          count: 0,
          urls: []
        };
      }
      acc[key].count++;
      acc[key].urls.push(call.url);
      return acc;
    }, {});
    
    Object.values(uniqueCalls).forEach(call => {
      console.log(`\n🔗 ${call.method} ${call.resource} (${call.count} calls)`);
      call.urls.forEach(url => {
        console.log(`   ${url}`);
      });
    });
    
    // Check if we can identify what each call is for
    console.log('\n🔍 API Call Analysis:');
    console.log('====================');
    
    const callAnalysis = {
      'GET projects': 'Fetching user projects for dashboard overview',
      'GET settings': 'Loading user settings for dashboard',
      'GET auth/v1/user': 'Checking current user authentication',
      'GET rpc/get_database_status': 'Checking database status for sync functionality',
      'POST auth/v1/token': 'Token refresh or validation',
      'GET storage/v1/object': 'Loading images or files',
      'POST storage/v1/object': 'Uploading files',
      'DELETE storage/v1/object': 'Deleting files'
    };
    
    Object.values(uniqueCalls).forEach(call => {
      const key = `${call.method} ${call.resource}`;
      const description = callAnalysis[key] || 'Unknown purpose';
      console.log(`\n📋 ${key}:`);
      console.log(`   Purpose: ${description}`);
      console.log(`   Count: ${call.count}`);
      console.log(`   Can be replaced: ${key.includes('auth/v1') ? '❌ (Auth)' : '✅ (Data)'}`);
    });
    
    // Summary
    console.log('\n📈 Summary:');
    console.log('===========');
    console.log(`Total Supabase API calls: ${apiCalls.length}`);
    console.log(`Unique API endpoints: ${Object.keys(uniqueCalls).length}`);
    
    const authCalls = apiCalls.filter(call => call.url.includes('auth/v1'));
    const dataCalls = apiCalls.filter(call => !call.url.includes('auth/v1'));
    
    console.log(`Authentication calls: ${authCalls.length}`);
    console.log(`Data calls: ${dataCalls.length}`);
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testDashboardApiCalls().catch(console.error); 