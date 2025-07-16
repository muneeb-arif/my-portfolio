// Using built-in fetch (available in Node.js 18+)

async function testApiEndpoints() {
  console.log('🔍 Testing API Endpoints...');
  
  const API_BASE = 'http://localhost:3001/api';
  const endpoints = [
    'health',
    'projects',
    'technologies',
    'niches',
    'categories',
    'settings',
    'shared-hosting-updates'
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔗 Testing ${endpoint}...`);
      const response = await fetch(`${API_BASE}/${endpoint}`);
      const data = await response.json();
      
      results[endpoint] = {
        status: response.status,
        success: response.ok,
        data: data
      };
      
      if (response.ok) {
        console.log(`   ✅ ${endpoint}: ${response.status} - Success`);
        if (data.data && Array.isArray(data.data)) {
          console.log(`      Data count: ${data.data.length}`);
        }
      } else {
        console.log(`   ❌ ${endpoint}: ${response.status} - ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint}: Error - ${error.message}`);
      results[endpoint] = {
        status: 'error',
        success: false,
        error: error.message
      };
    }
  }
  
  console.log('\n📊 API Endpoints Summary:');
  console.log('========================');
  
  Object.entries(results).forEach(([endpoint, result]) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${endpoint}: ${result.status}`);
  });
  
  const workingEndpoints = Object.values(results).filter(r => r.success).length;
  const totalEndpoints = endpoints.length;
  
  console.log(`\n📈 Summary: ${workingEndpoints}/${totalEndpoints} endpoints working`);
  
  if (workingEndpoints === totalEndpoints) {
    console.log('🎉 All API endpoints are working!');
  } else {
    console.log('⚠️ Some API endpoints are not working');
  }
}

// Run the test
testApiEndpoints().catch(console.error); 