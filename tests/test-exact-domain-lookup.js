const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : '🔍';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const testExactDomainLookup = async () => {
  try {
    log('🔍 Testing exact domain lookup logic...');
    
    // Test the exact domain variants that the projects endpoint tries
    const domainVariants = [
      'localhost:3000',
      'http://localhost:3000',
      'https://localhost:3000',
      'localhost',
      'http://localhost'
    ];
    
    log('🧪 Testing domain variants:');
    domainVariants.forEach(variant => {
      log(`  - ${variant}`);
    });
    
    // Test each variant with the projects endpoint
    for (const domainVariant of domainVariants) {
      log(`\n🧪 Testing variant: ${domainVariant}`);
      
      const response = await fetch(`${API_BASE}/projects`, {
        headers: {
          'Origin': `http://${domainVariant}`,
          'Referer': `http://${domainVariant}/`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        const projects = data.data || [];
        const prompts = projects.filter(p => p.is_prompt === 1);
        const regularProjects = projects.filter(p => p.is_prompt !== 1);
        
        log(`  📊 Found ${projects.length} projects`);
        log(`  💡 Found ${prompts.length} prompts`);
        log(`  📁 Found ${regularProjects.length} regular projects`);
        log(`  🎭 Demo data: ${data.demo ? 'Yes' : 'No'}`);
        
        if (!data.demo) {
          log(`  ✅ SUCCESS: Found real user data with variant: ${domainVariant}`, 'success');
          break;
        } else {
          log(`  ❌ Using demo data with variant: ${domainVariant}`, 'warning');
        }
      } else {
        log(`  ❌ Request failed: ${data.error}`, 'error');
      }
    }
    
    log('\n🎉 Domain lookup test completed!', 'success');
    
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'error');
    console.error('Full error:', error);
  }
};

// Run the test
testExactDomainLookup(); 