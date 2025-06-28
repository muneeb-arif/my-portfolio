// Test script to check portfolio data loading in different scenarios
const https = require('https');
const fs = require('fs');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_RESULTS = {};

// Helper function to make HTTP requests
function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`\n🔍 Testing endpoint: ${endpoint}`);
    
    const request = require('http').get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    request.on('error', reject);
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Test function to analyze portfolio data
async function testPortfolioData(scenarioName) {
  console.log(`\n🧪 ===== TESTING SCENARIO: ${scenarioName} =====`);
  
  try {
    // Test main portfolio page
    const homepage = await makeRequest('/');
    
    // Check if fallback notification is present
    const hasFallbackNotification = homepage.includes('Demo Mode') || 
                                   homepage.includes('Pre-filled data');
    
    // Check if Supabase data is loaded or fallback data
    const hasSupabaseData = homepage.includes('supabase') || 
                           homepage.includes('database');
    
    // Check for specific project titles to identify data source
    const hasEcommerceProject = homepage.includes('E-Commerce Platform');
    const hasAIProject = homepage.includes('AI-Powered Chatbot');
    const hasMobileBankingProject = homepage.includes('Mobile Banking App');
    
    // Store results
    TEST_RESULTS[scenarioName] = {
      timestamp: new Date().toISOString(),
      hasFallbackNotification,
      hasSupabaseData,
      hasEcommerceProject,
      hasAIProject,
      hasMobileBankingProject,
      dataSource: hasFallbackNotification ? 'FALLBACK' : 'SUPABASE'
    };
    
    console.log(`✅ Results for ${scenarioName}:`);
    console.log(`   - Fallback Notification: ${hasFallbackNotification ? '✅' : '❌'}`);
    console.log(`   - E-Commerce Project: ${hasEcommerceProject ? '✅' : '❌'}`);
    console.log(`   - AI Project: ${hasAIProject ? '✅' : '❌'}`);
    console.log(`   - Mobile Banking Project: ${hasMobileBankingProject ? '✅' : '❌'}`);
    console.log(`   - Data Source: ${TEST_RESULTS[scenarioName].dataSource}`);
    
  } catch (error) {
    console.error(`❌ Error testing ${scenarioName}:`, error.message);
    TEST_RESULTS[scenarioName] = {
      timestamp: new Date().toISOString(),
      error: error.message,
      dataSource: 'ERROR'
    };
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Portfolio Data Loading Tests...');
  
  // Test current scenario
  await testPortfolioData('CURRENT_SCENARIO');
  
  // Save results
  const resultsFile = 'test-results.json';
  fs.writeFileSync(resultsFile, JSON.stringify(TEST_RESULTS, null, 2));
  
  console.log(`\n📊 Test results saved to: ${resultsFile}`);
  console.log('\n🎯 Test Summary:');
  console.log(JSON.stringify(TEST_RESULTS, null, 2));
}

// Run tests
runTests().catch(console.error); 