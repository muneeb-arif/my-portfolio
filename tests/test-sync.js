// Test script to debug categories sync issue
import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'https://bpniquvjzwxjimeczjuf.supabase.co';
const supabaseKey = 'your-anon-key'; // You'll need to add your actual anon key

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCategoriesSync() {
      // console.log('🧪 Testing categories sync...');
  
  try {
    // Test 1: Check current categories
      // console.log('\n📋 Test 1: Check current categories');
    const { data: currentCategories, error: selectError } = await supabase
      .from('categories')
      .select('*');
    
    if (selectError) {
      // console.error('❌ Error selecting categories:', selectError);
      return;
    }
    
      // console.log('Current categories:', currentCategories?.length || 0);
    currentCategories?.forEach(cat => console.log(`- ${cat.name}`));
    
    // Test 2: Try to delete a specific category
      // console.log('\n🗑️ Test 2: Try to delete a specific category');
    const { data: deleteResult, error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('name', 'Web Development');
    
    if (deleteError) {
      // console.error('❌ Error deleting category:', deleteError);
    } else {
      // console.log('✅ Delete result:', deleteResult);
    }
    
    // Test 3: Try to insert a new category
      // console.log('\n➕ Test 3: Try to insert a new category');
    const { data: insertResult, error: insertError } = await supabase
      .from('categories')
      .insert({
        name: 'Test Category',
        description: 'Test Description',
        color: '#ff0000'
      })
      .select();
    
    if (insertError) {
      // console.error('❌ Error inserting category:', insertError);
    } else {
      // console.log('✅ Insert result:', insertResult);
    }
    
    // Test 4: Check RLS policies
      // console.log('\n🔒 Test 4: Check RLS policies');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'categories' });
    
    if (policiesError) {
      // console.log('⚠️ Could not check policies:', policiesError.message);
    } else {
      // console.log('Policies:', policies);
    }
    
  } catch (error) {
      // console.error('❌ Test failed:', error);
  }
}

// Run the test
testCategoriesSync(); 