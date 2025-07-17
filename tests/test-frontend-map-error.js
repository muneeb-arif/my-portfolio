const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : '🔍';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const testFrontendMapError = async () => {
  try {
    log('🔍 Testing frontend map error fix...');
    
    // Step 1: Test the frontend loads without errors
    log('Step 1: Testing frontend load...');
    
    const response = await fetch('http://localhost:3000', {
      headers: {
        'Origin': 'http://localhost:3000',
        'Referer': 'http://localhost:3000/'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Frontend request failed: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Check if there are any obvious JavaScript errors in the HTML
    if (html.includes('Cannot read properties of undefined')) {
      log('❌ Found "Cannot read properties of undefined" in HTML', 'error');
    } else {
      log('✅ No obvious JavaScript errors found in HTML', 'success');
    }
    
    // Step 2: Test the projects API to ensure it returns valid data
    log('Step 2: Testing projects API data structure...');
    
    const apiResponse = await fetch('http://localhost:3001/api/projects', {
      headers: {
        'Origin': 'http://localhost:3000',
        'Referer': 'http://localhost:3000/'
      }
    });
    
    const apiData = await apiResponse.json();
    
    if (!apiData.success) {
      throw new Error(`API request failed: ${apiData.error}`);
    }
    
    const projects = apiData.data || [];
    
    // Test the exact filtering logic that might cause map errors
    log('Step 3: Testing filtering logic...');
    
    // Test getCategories logic
    const testPrompts = projects.filter(p => p.is_prompt === 1 && p.status === 'published');
    log(`💡 Found ${testPrompts.length} published prompts`);
    
    if (testPrompts.length > 0) {
      // Test the categories extraction
      const categories = [...new Set(testPrompts.map(prompt => prompt.category))];
      log(`📂 Found ${categories.length} unique categories:`, categories);
      
      if (categories.length > 0) {
        log('✅ Categories extraction working correctly', 'success');
      } else {
        log('⚠️ No categories found in prompts', 'warning');
      }
    } else {
      log('⚠️ No published prompts found', 'warning');
    }
    
    // Test getFilteredPrompts logic
    const filteredPrompts = testPrompts.filter(prompt => prompt.category === 'all' || prompt.category);
    log(`🔍 Filtered prompts: ${filteredPrompts.length}`);
    
    // Test map operations
    if (filteredPrompts.length > 0) {
      try {
        const mappedPrompts = filteredPrompts.map((prompt, index) => ({
          id: prompt.id,
          title: prompt.title,
          index
        }));
        log(`✅ Map operation successful on ${mappedPrompts.length} prompts`, 'success');
      } catch (mapError) {
        log(`❌ Map operation failed: ${mapError.message}`, 'error');
      }
    }
    
    log('🎉 Frontend map error test completed!', 'success');
    
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'error');
    console.error('Full error:', error);
  }
};

// Run the test
testFrontendMapError(); 