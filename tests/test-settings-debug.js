// Test file to debug settings loading for prompts section

const testSettingsDebug = async () => {
  try {
    console.log('🔍 Testing settings loading for prompts section...');
    
    // Test 1: Check settings API
    console.log('Step 1: Testing settings API...');
    
    const settingsResponse = await fetch('http://localhost:3001/api/settings', {
      headers: {
        'Origin': 'http://localhost:3000',
        'Referer': 'http://localhost:3000/'
      }
    });
    
    const settingsData = await settingsResponse.json();
    
    if (!settingsData.success) {
      throw new Error(`Settings API failed: ${settingsData.error}`);
    }
    
    const settings = settingsData.data || {};
    console.log('📋 Settings loaded:', Object.keys(settings));
    console.log('💡 section_prompts_visible:', settings.section_prompts_visible);
    console.log('📁 section_portfolio_visible:', settings.section_portfolio_visible);
    console.log('🔧 section_technologies_visible:', settings.section_technologies_visible);
    
    // Test 2: Check if prompts section should be visible
    const promptsVisible = settings.section_prompts_visible !== undefined ? settings.section_prompts_visible : false;
    console.log(`💡 Prompts section visibility: ${promptsVisible ? 'VISIBLE' : 'HIDDEN'}`);
    
    if (promptsVisible) {
      console.log('✅ Prompts section should be visible on frontend');
    } else {
      console.log('❌ Prompts section is hidden - check dashboard settings');
    }
    
    // Test 3: Check projects API again to confirm prompts are there
    console.log('Step 2: Confirming prompts in projects API...');
    
    const projectsResponse = await fetch('http://localhost:3001/api/projects', {
      headers: {
        'Origin': 'http://localhost:3000',
        'Referer': 'http://localhost:3000/'
      }
    });
    
    const projectsData = await projectsResponse.json();
    const projects = projectsData.data || [];
    const prompts = projects.filter(p => p.is_prompt === 1);
    const publishedPrompts = prompts.filter(p => p.status === 'published');
    
    console.log(`📊 Total projects: ${projects.length}`);
    console.log(`💡 Total prompts: ${prompts.length}`);
    console.log(`✅ Published prompts: ${publishedPrompts.length}`);
    
    if (publishedPrompts.length > 0) {
      console.log('📝 Sample published prompt:', publishedPrompts[0].title);
    }
    
    console.log('🎉 Settings debug test completed!');
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    console.error('Full error:', error);
  }
};

testSettingsDebug(); 