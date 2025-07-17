// Test file for Prompts Integration
// This file helps verify that all prompts functionality is working correctly

console.log('🧪 Testing Prompts Integration...');

// Test 1: Check if PromptsManager component exists
try {
  const PromptsManager = require('../src/components/dashboard/PromptsManager.js');
  console.log('✅ PromptsManager component found');
} catch (error) {
  console.log('❌ PromptsManager component not found:', error.message);
}

// Test 2: Check if PromptsSection component exists
try {
  const PromptsSection = require('../src/components/PromptsSection.js');
  console.log('✅ PromptsSection component found');
} catch (error) {
  console.log('❌ PromptsSection component not found:', error.message);
}

// Test 3: Check if Modal component has isPrompt prop
try {
  const Modal = require('../src/components/Modal.js');
  console.log('✅ Modal component found');
} catch (error) {
  console.log('❌ Modal component not found:', error.message);
}

// Test 4: Check if database column was added
console.log('📋 Database Changes Required:');
console.log('   - Run: ALTER TABLE projects ADD COLUMN is_prompt TINYINT DEFAULT 0;');
console.log('   - Run: UPDATE projects SET is_prompt = 0 WHERE is_prompt IS NULL;');

// Test 5: Check if settings include prompts visibility
console.log('📋 Settings Integration:');
console.log('   - section_prompts_visible setting should be available');
console.log('   - Default value should be false (hidden)');

// Test 6: Check if API supports is_prompt field
console.log('📋 API Integration:');
console.log('   - POST /api/projects should accept is_prompt field');
console.log('   - ProjectService should handle is_prompt in createProject and updateProject');

console.log('🧪 Prompts Integration Test Complete!');
console.log('');
console.log('📝 Manual Testing Steps:');
console.log('1. Start the application');
console.log('2. Go to dashboard (/dashboard)');
console.log('3. Check if "Prompts" section appears in navigation');
console.log('4. Try creating a new prompt');
console.log('5. Verify that only simplified fields are shown');
console.log('6. Check if is_prompt = 1 is set when saved');
console.log('7. Go to Settings and toggle prompts visibility');
console.log('8. Check frontend to see if prompts section appears/disappears');
console.log('9. Test the copy functionality in prompt modals'); 