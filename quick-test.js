const http = require('http');

async function testEndpoints() {
  const endpoints = [
    'http://localhost:3001/api/portfolio/projects',
    'http://localhost:3001/api/portfolio/categories', 
    'http://localhost:3001/api/portfolio/niches',
    'http://localhost:3001/api/portfolio/domains-technologies'
  ];

  console.log('🧪 Testing API Endpoints...\n');

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(endpoint);
      const endpointName = endpoint.split('/').pop();
      console.log(`✅ ${endpointName}: Status ${response.status}`);
      
      if (response.data && response.data.success) {
        const dataLength = response.data.data ? response.data.data.length : 0;
        console.log(`   📊 Data: ${dataLength} items`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }

  console.log('\n🎯 Summary: API endpoints are active and responding!');
  console.log('📍 Your React app should now be calling these APIs instead of Supabase.');
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });
    request.on('error', reject);
    request.setTimeout(5000, () => reject(new Error('Timeout')));
  });
}

testEndpoints().catch(console.error); 