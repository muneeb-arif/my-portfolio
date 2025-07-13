import { apiService } from './apiService';
import { clearConfigCache } from './portfolioConfigUtils';

// Simple auth utilities with short-term caching to prevent repeated API calls
// during app initialization while working with the centralized AuthContext

// Cache for short-term storage during initialization
let authCache = {
  user: null,
  timestamp: 0,
  promise: null // Store pending promise to avoid multiple simultaneous calls
};

const CACHE_DURATION = 5000; // 5 seconds cache for initialization period

// Get current user with short-term caching
export const getCurrentUser = async () => {
  const now = Date.now();
  
  // Return cached result if fresh
  if (authCache.user !== undefined && (now - authCache.timestamp) < CACHE_DURATION) {
    console.log('🔑 AUTH UTILS: Using cached result:', authCache.user?.email || 'null');
    return authCache.user;
  }
  
  // If there's already a pending request, wait for it
  if (authCache.promise) {
    console.log('🔑 AUTH UTILS: Waiting for pending auth request...');
    return await authCache.promise;
  }
  
  // Create new request
  console.log('🔑 AUTH UTILS: Making fresh auth request...');
  authCache.promise = (async () => {
    try {
      // Check if we have a token
      const token = localStorage.getItem('api_token');
      if (!token) {
        console.log('🔑 AUTH UTILS: No token found');
        authCache.user = null;
        authCache.timestamp = now;
        return null;
      }

      // Set token in apiService
      apiService.setToken(token);
      
      // Get current user from API
      const response = await apiService.getCurrentUser();
      
      if (response.success && response.user) {
        console.log('🔑 AUTH UTILS: User found:', response.user.email || 'null');
        authCache.user = response.user;
      } else {
        console.log('🔑 AUTH UTILS: No active session');
        // Clear invalid token
        apiService.clearToken();
        authCache.user = null;
      }
      
      authCache.timestamp = now;
      return authCache.user;
    } catch (error) {
      console.error('🔑 AUTH UTILS: Error fetching user:', error);
      // Clear any invalid token
      apiService.clearToken();
      authCache.user = null;
      authCache.timestamp = now;
      return null;
    } finally {
      authCache.promise = null; // Clear pending promise
    }
  })();
  
  return await authCache.promise;
};

// Clear auth cache (useful for logout scenarios)
export const clearAuthCache = () => {
  authCache = {
    user: null,
    timestamp: 0,
    promise: null
  };
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};

// Get user ID (for backward compatibility)
export const getCurrentUserId = async () => {
  const user = await getCurrentUser();
  return user?.id || null;
};

export default {
  getCurrentUser,
  getCurrentUserId,
  isAuthenticated,
  clearAuthCache
}; 