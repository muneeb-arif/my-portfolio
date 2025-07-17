// Test file to debug frontend rendering


const testFrontendDebug = async () => {
  try {
    console.log('🔍 Testing frontend rendering...');
    
    // Test 1: Get the HTML content
    console.log('Step 1: Getting frontend HTML...');
    
    const response = await fetch('http://localhost:3000');
    const html = await response.text();
    
    // Check if prompts section exists in HTML
    const hasPromptsSection = html.includes('id="prompts"');
    const hasPromptsTitle = html.includes('AI Prompts');
    const hasPromptsContent = html.includes('prompt-card') || html.includes('View Prompt');
    
    console.log('📄 HTML Analysis:');
    console.log('  - Has prompts section ID:', hasPromptsSection);
    console.log('  - Has "AI Prompts" title:', hasPromptsTitle);
    console.log('  - Has prompts content:', hasPromptsContent);
    
    // Check for any React errors or warnings
    const hasReactError = html.includes('Error Loading Prompts');
    const hasNoPrompts = html.includes('No Prompts Available');
    const hasLoading = html.includes('Loading prompts');
    
    console.log('🔍 Content Analysis:');
    console.log('  - Shows error message:', hasReactError);
    console.log('  - Shows "no prompts" message:', hasNoPrompts);
    console.log('  - Shows loading message:', hasLoading);
    
    // Check if the section is completely missing
    if (!hasPromptsSection && !hasPromptsTitle && !hasPromptsContent) {
      console.log('❌ Prompts section is completely missing from HTML');
      console.log('💡 This suggests the component is returning null');
    } else if (hasPromptsSection && hasPromptsTitle) {
      console.log('✅ Prompts section is present in HTML');
    } else {
      console.log('⚠️ Partial prompts section found');
    }
    
    // Test 2: Check if there are any console errors by looking at the JavaScript
    const hasConsoleError = html.includes('console.error') || html.includes('Error:');
    console.log('🔍 JavaScript Analysis:');
    console.log('  - Contains console.error:', hasConsoleError);
    
    console.log('🎉 Frontend debug test completed!');
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    console.error('Full error:', error);
  }
};

testFrontendDebug(); 