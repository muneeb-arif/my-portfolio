// API Configuration Override
// This file forces the app to use API services instead of Supabase

export const API_CONFIG = {
  // Force API service usage
  USE_API_SERVICE: true,
  ENABLE_HYBRID_MODE: true,
  API_URL: 'http://localhost:3001/api',
  
  // API settings
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  
  // Debug settings
  DEBUG_API: true,
  ENVIRONMENT: 'development'
};

// Override environment variables for API service
if (typeof window !== 'undefined') {
  // Client-side override - only set window properties, not process.env
  window.REACT_APP_USE_API_SERVICE = 'true';
  window.REACT_APP_ENABLE_HYBRID_MODE = 'true';
  window.REACT_APP_API_URL = API_CONFIG.API_URL;
}

// Node.js environment override - only in Node.js environment
if (typeof process !== 'undefined' && process.env) {
  process.env.REACT_APP_USE_API_SERVICE = 'true';
  process.env.REACT_APP_ENABLE_HYBRID_MODE = 'true';
  process.env.REACT_APP_API_URL = API_CONFIG.API_URL;
}

console.log('🔧 API Configuration Override Applied:', {
  USE_API_SERVICE: true,
  ENABLE_HYBRID_MODE: true,
  API_URL: API_CONFIG.API_URL
});

export default API_CONFIG; 