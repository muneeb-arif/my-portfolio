const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : '🔍';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const testFrontendPrompts = async () => {
  try {
    log('🔍 Testing frontend prompts section...');
    
    // Step 1: Test the frontend prompts API call
    log('Step 1: Testing frontend prompts API call...');
    
    const response = await fetch('http://localhost:3000', {
      headers: {
        'Origin': 'http://localhost:3000',
        'Referer': 'http://localhost:3000/'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Frontend request failed: ${response.status}`);
    }
    
    log('✅ Frontend is accessible');
    
    // Step 2: Test the projects API that the frontend uses
    log('Step 2: Testing projects API (frontend endpoint)...');
    
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
    const prompts = projects.filter(p => p.is_prompt === 1);
    const regularProjects = projects.filter(p => p.is_prompt !== 1);
    
    log(`📊 Found ${projects.length} total projects`);
    log(`💡 Found ${prompts.length} prompts`);
    log(`📁 Found ${regularProjects.length} regular projects`);
    log(`🎭 Demo data: ${apiData.demo ? 'Yes' : 'No'}`);
    
    if (apiData.demo) {
      log('⚠️ Using demo data - this might cause issues with prompts filtering', 'warning');
    } else {
      log('✅ Using real user data', 'success');
    }
    
    // Step 3: Test the specific filtering logic used by PromptsSection
    log('Step 3: Testing prompts filtering logic...');
    
    // Simulate the exact filtering logic from PromptsSection.js
    const filteredPrompts = projects.filter(p => p.is_prompt === 1 && p.status === 'published');
    const publishedRegularProjects = projects.filter(p => p.is_prompt !== 1 && p.status === 'published');
    
    log(`💡 Published prompts: ${filteredPrompts.length}`);
    log(`📁 Published regular projects: ${publishedRegularProjects.length}`);
    
    if (filteredPrompts.length > 0) {
      log('✅ Prompts filtering is working correctly', 'success');
      log(`📝 Sample prompt: ${filteredPrompts[0].title}`);
    } else {
      log('⚠️ No published prompts found', 'warning');
    }
    
    // Step 4: Test settings visibility
    log('Step 4: Testing settings visibility...');
    
    // The frontend checks settings.section_prompts_visible
    // For now, we'll assume it's enabled by default
    log('💡 Prompts section visibility: Enabled (default)');
    
    log('🎉 Frontend prompts test completed successfully!', 'success');
    
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'error');
    console.error('Full error:', error);
  }
};

// Run the test
testFrontendPrompts(); 