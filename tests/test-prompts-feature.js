const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : '🔍';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const testPromptsFeature = async () => {
  try {
    log('🔍 Testing prompts feature...');
    
    // Step 1: Login to get token
    log('Step 1: Logging in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'zm4717696@gmail.com',
        password: '11223344'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error(`Login failed: ${loginData.error}`);
    }
    
    const token = loginData.token;
    log('✅ Login successful');
    
    // Step 2: Create a test prompt
    log('Step 2: Creating test prompt...');
    const promptData = {
      title: 'Test AI Prompt',
      description: 'This is a test prompt for AI assistance',
      category: 'Web Development',
      status: 'published',
      is_prompt: 1
    };
    
    const createResponse = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(promptData)
    });
    
    const createData = await createResponse.json();
    if (!createData.success) {
      throw new Error(`Failed to create prompt: ${createData.error}`);
    }
    
    const promptId = createData.data.id;
    log(`✅ Prompt created with ID: ${promptId}`);
    
    // Step 3: Get all projects and verify prompt is included
    log('Step 3: Getting all projects...');
    const projectsResponse = await fetch(`${API_BASE}/dashboard/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const projectsData = await projectsResponse.json();
    if (!projectsData.success) {
      throw new Error(`Failed to get projects: ${projectsData.error}`);
    }
    
    const allProjects = projectsData.data;
    const prompts = allProjects.filter(p => p.is_prompt === 1);
    const regularProjects = allProjects.filter(p => p.is_prompt !== 1);
    
    log(`📊 Found ${allProjects.length} total projects`);
    log(`💡 Found ${prompts.length} prompts`);
    log(`📁 Found ${regularProjects.length} regular projects`);
    
    // Step 4: Verify our test prompt is in the prompts list
    const testPrompt = prompts.find(p => p.id === promptId);
    if (!testPrompt) {
      throw new Error('Test prompt not found in prompts list');
    }
    
    log('✅ Test prompt found in prompts list');
    log(`📝 Prompt title: ${testPrompt.title}`);
    log(`📝 Prompt is_prompt: ${testPrompt.is_prompt}`);
    log(`📝 Prompt status: ${testPrompt.status}`);
    
    // Step 5: Verify test prompt is NOT in regular projects list
    const testPromptInRegular = regularProjects.find(p => p.id === promptId);
    if (testPromptInRegular) {
      throw new Error('Test prompt should not be in regular projects list');
    }
    
    log('✅ Test prompt correctly excluded from regular projects');
    
    // Step 6: Test public projects endpoint (should include published prompts)
    log('Step 6: Testing public projects endpoint...');
    const publicResponse = await fetch(`${API_BASE}/projects`, {
      headers: {
        'Origin': 'http://localhost:3000',
        'Referer': 'http://localhost:3000/'
      }
    });
    
    const publicData = await publicResponse.json();
    if (!publicData.success) {
      throw new Error(`Failed to get public projects: ${publicData.error}`);
    }
    
    const publicProjects = publicData.data;
    const publicPrompts = publicProjects.filter(p => p.is_prompt === 1);
    
    log(`🌐 Found ${publicProjects.length} public projects`);
    log(`💡 Found ${publicPrompts.length} public prompts`);
    
    // Verify our test prompt is in public prompts
    const publicTestPrompt = publicPrompts.find(p => p.id === promptId);
    if (!publicTestPrompt) {
      throw new Error('Test prompt not found in public prompts');
    }
    
    log('✅ Test prompt found in public prompts');
    
    // Step 7: Clean up - delete the test prompt
    log('Step 7: Cleaning up test prompt...');
    const deleteResponse = await fetch(`${API_BASE}/projects/${promptId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const deleteData = await deleteResponse.json();
    if (!deleteData.success) {
      log(`⚠️ Failed to delete test prompt: ${deleteData.error}`, 'warning');
    } else {
      log('✅ Test prompt deleted successfully');
    }
    
    log('🎉 Prompts feature test completed successfully!', 'success');
    
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'error');
    console.error('Full error:', error);
  }
};

// Run the test
testPromptsFeature(); 