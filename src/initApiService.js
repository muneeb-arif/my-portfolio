// Initialize API Service Configuration
// This file forces the app to use API services instead of Supabase

console.log('🚀 FORCING API SERVICE USAGE...');

// Set environment variables to force API service - only in Node.js environment
if (typeof process !== 'undefined' && process.env) {
  process.env.REACT_APP_USE_API_SERVICE = 'true';
  process.env.REACT_APP_ENABLE_HYBRID_MODE = 'true';
  process.env.REACT_APP_API_URL = 'http://localhost:3001/api';
}

console.log('✅ API Service Configuration Applied:', {
  USE_API_SERVICE: process.env?.REACT_APP_USE_API_SERVICE || 'true',
  ENABLE_HYBRID_MODE: process.env?.REACT_APP_ENABLE_HYBRID_MODE || 'true',
  API_URL: process.env?.REACT_APP_API_URL || 'http://localhost:3001/api'
});

export default true; 