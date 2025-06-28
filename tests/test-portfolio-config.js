// Test script to verify portfolio configuration
// Run with: node test-portfolio-config.js

require('dotenv').config();

      // console.log('🧪 Portfolio Configuration Test');
      // console.log('================================');

      // console.log('\n📋 Environment Variables:');
      // console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? '✅ Set' : '❌ Missing');
      // console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
      // console.log('REACT_APP_PORTFOLIO_OWNER_EMAIL:', process.env.REACT_APP_PORTFOLIO_OWNER_EMAIL || '❌ Missing');

      // console.log('\n🔍 Configuration Status:');
if (process.env.REACT_APP_PORTFOLIO_OWNER_EMAIL) {
      // console.log('✅ Portfolio owner email configured');
      // console.log('📧 Email:', process.env.REACT_APP_PORTFOLIO_OWNER_EMAIL);
} else {
      // console.log('❌ Portfolio owner email not configured');
      // console.log('   Please set REACT_APP_PORTFOLIO_OWNER_EMAIL in your .env file');
}

      // console.log('\n📝 Next Steps:');
if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
      // console.log('1. ❌ Complete your .env file with Supabase credentials');
} else {
      // console.log('1. ✅ Environment file configured');
}

      // console.log('2. 🗄️  Run the SQL script in Supabase SQL Editor');
      // console.log('3. 🚀 Start the app with: npm start');
      // console.log('4. 🧪 Test both dashboard and public views');

      // console.log('\n🔗 Useful Links:');
      // console.log('📖 Setup Guide: PORTFOLIO_CONFIGURATION.md');
      // console.log('🗄️  SQL Script: public-access-policies.sql');
      // console.log('📄 Env Template: env.example'); 