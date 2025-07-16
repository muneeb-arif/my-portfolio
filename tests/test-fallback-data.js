const puppeteer = require('puppeteer');

async function testFallbackData() {
  console.log('🔍 Testing Fallback Data Loading...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Enable request interception to monitor API calls
  await page.setRequestInterception(true);
  
  const apiCalls = [];
  const fallbackNotifications = [];
  
  page.on('request', request => {
    const url = request.url();
    
    // Monitor API calls
    if (url.includes('localhost:3001/api') || url.includes('/api/')) {
      apiCalls.push({
        method: request.method(),
        url,
        timestamp: new Date().toISOString()
      });
    }
    
    request.continue();
  });
  
  // Monitor console logs for fallback messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('using fallback data')) {
      fallbackNotifications.push(text);
      console.log('📊 Fallback triggered:', text);
    }
  });
  
  try {
    // Navigate to the homepage
    console.log('🌐 Navigating to homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Wait for page to load
    console.log('⏳ Waiting for page to load...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if fallback notification appears
    const fallbackNotification = await page.$('.fallback-notification');
    if (fallbackNotification) {
      console.log('✅ Fallback notification found!');
    } else {
      console.log('❌ No fallback notification found');
    }
    
    // Check if projects section has content
    const projectsSection = await page.$('[id="portfolio"]');
    if (projectsSection) {
      const projectCards = await page.$$('.project-card, [class*="project"], [class*="card"]');
      console.log(`📊 Found ${projectCards.length} project cards`);
      
      if (projectCards.length > 0) {
        console.log('✅ Projects section has content (likely fallback data)');
      } else {
        console.log('❌ Projects section is empty');
      }
    }
    
    // Check if technologies section has content
    const technologiesSection = await page.$('[id="technologies"]');
    if (technologiesSection) {
      const techItems = await page.$$('[class*="technology"], [class*="tech"], [class*="skill"]');
      console.log(`🎯 Found ${techItems.length} technology items`);
      
      if (techItems.length > 0) {
        console.log('✅ Technologies section has content (likely fallback data)');
      } else {
        console.log('❌ Technologies section is empty');
      }
    }
    
    // Check if domains/niche section has content
    const domainsSection = await page.$('[id="domains"]');
    if (domainsSection) {
      const domainItems = await page.$$('[class*="domain"], [class*="niche"]');
      console.log(`🏆 Found ${domainItems.length} domain/niche items`);
      
      if (domainItems.length > 0) {
        console.log('✅ Domains section has content (likely fallback data)');
      } else {
        console.log('❌ Domains section is empty');
      }
    }
    
    // Summary
    console.log('\n📋 Test Summary:');
    console.log(`API Calls: ${apiCalls.length}`);
    console.log(`Fallback Notifications: ${fallbackNotifications.length}`);
    
    if (fallbackNotifications.length > 0) {
      console.log('✅ Fallback data is working correctly!');
    } else {
      console.log('❌ Fallback data not triggered - check API responses');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testFallbackData().catch(console.error); 