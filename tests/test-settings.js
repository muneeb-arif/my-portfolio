// Test script for settings functionality
const { createClient } = require('@supabase/supabase-js');

// You'll need to add your Supabase credentials here for testing
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing Supabase credentials. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSettings() {
  try {
    console.log('🧪 Testing Supabase connection...');
    
    // Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.log('❌ Auth error:', authError.message);
      return;
    }
    
    if (!user) {
      console.log('❌ No authenticated user found');
      return;
    }
    
    console.log('✅ User authenticated:', user.id);
    
    // Test settings table
    console.log('🧪 Testing settings table...');
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', user.id);
    
    if (settingsError) {
      console.log('❌ Settings table error:', settingsError.message);
      return;
    }
    
    console.log('✅ Settings table accessible');
    console.log('📊 Current settings:', settings);
    
    // Test inserting a setting
    console.log('🧪 Testing setting insertion...');
    const { error: insertError } = await supabase
      .from('settings')
      .upsert({
        user_id: user.id,
        key: 'test_setting',
        value: 'test_value'
      });
    
    if (insertError) {
      console.log('❌ Insert error:', insertError.message);
      return;
    }
    
    console.log('✅ Setting insertion successful');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSettings(); 