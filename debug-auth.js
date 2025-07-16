// Debug Authentication Script
// Run this in the browser console to check authentication status

console.log('🔍 DEBUGGING AUTHENTICATION STATUS');

// Check localStorage for token
const token = localStorage.getItem('api_token');
console.log('📋 Token in localStorage:', token ? `${token.substring(0, 20)}...` : 'NOT FOUND');

// Check if we're in dashboard
const isDashboard = window.location.pathname === '/dashboard';
console.log('📍 Current page:', window.location.pathname, isDashboard ? '(Dashboard)' : '(Public)');

// Check AuthContext state (if available)
if (window.AuthContext) {
  console.log('🔑 AuthContext available');
} else {
  console.log('❌ AuthContext not available');
}

// Test API call
async function testAuth() {
  try {
    console.log('🧪 Testing API authentication...');
    const response = await fetch('http://localhost:3001/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('📡 API Response:', data);
    
    if (data.success) {
      console.log('✅ Authentication successful!');
      console.log('👤 User:', data.user);
    } else {
      console.log('❌ Authentication failed:', data.error);
    }
  } catch (error) {
    console.error('🚨 API Error:', error);
  }
}

// Run the test
testAuth();

console.log('💡 To fix authentication:');
console.log('1. Go to /dashboard');
console.log('2. Log out if logged in');
console.log('3. Log back in with valid credentials');
console.log('4. Check if token is stored in localStorage'); 