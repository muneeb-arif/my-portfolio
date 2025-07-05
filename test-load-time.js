const puppeteer = require('puppeteer');

async function testLoadTime() {
  console.log('🚀 Testing actual React app load time...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Track performance
  const startTime = Date.now();
  
  try {
    console.log('⏱️  Loading page...');
    
    // Navigate to the app
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    
    console.log('⏱️  Waiting for RainLoader to disappear...');
    
    // Wait for RainLoader to disappear (this is our key metric)
    await page.waitForSelector('.rain-loader-container', { hidden: true, timeout: 20000 });
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    console.log(`✅ Total Load Time: ${loadTime}ms (${(loadTime/1000).toFixed(2)}s)`);
    console.log(`✅ RainLoader disappeared after: ${(loadTime/1000).toFixed(2)}s`);
    
    // Check if first fold content is loaded
    const hasContent = await page.evaluate(() => {
      const hero = document.querySelector('#hero');
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      const hasSettings = document.querySelector('[data-settings-loaded]');
      
      return {
        hero: !!hero,
        header: !!header,
        footer: !!footer,
        hasSettings: !!hasSettings
      };
    });
    
    console.log(`✅ First fold content loaded:`);
    console.log(`  - Hero section: ${hasContent.hero ? 'Yes' : 'No'}`);
    console.log(`  - Header: ${hasContent.header ? 'Yes' : 'No'}`);
    console.log(`  - Footer: ${hasContent.footer ? 'Yes' : 'No'}`);
    console.log(`  - Settings loaded: ${hasContent.hasSettings ? 'Yes' : 'No'}`);
    
    // Check for API calls performance
    const apiCalls = await page.evaluate(() => {
      return window.performance.getEntriesByType('resource')
        .filter(r => r.name.includes('supabase') || r.name.includes('api'))
        .map(r => ({ url: r.name, duration: r.duration }));
    });
    
    console.log(`✅ API calls made: ${apiCalls.length}`);
    if (apiCalls.length > 0) {
      console.log(`  - Average API response time: ${(apiCalls.reduce((a, b) => a + b.duration, 0) / apiCalls.length).toFixed(2)}ms`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('❌ RainLoader did not disappear within 20 seconds');
    
    // Get current page state for debugging
    const currentState = await page.evaluate(() => {
      const rainLoader = document.querySelector('.rain-loader-container');
      const hero = document.querySelector('#hero');
      const header = document.querySelector('header');
      
      return {
        rainLoaderVisible: !!rainLoader,
        heroVisible: !!hero,
        headerVisible: !!header,
        bodyClasses: document.body.className,
        title: document.title
      };
    });
    
    console.log('Current page state:', currentState);
  } finally {
    await browser.close();
  }
}

testLoadTime().catch(console.error);
