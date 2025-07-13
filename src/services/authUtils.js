import { authService } from './serviceAdapter';
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
      const user = await authService.getCurrentUser();
      
      if (user) {
        console.log('🔑 AUTH UTILS: User found:', user?.email || 'null');
        authCache.user = user;
      } else {
        console.log('🔑 AUTH UTILS: No active session');
        authCache.user = null;
      }
      
      authCache.timestamp = now;
      return authCache.user;
    } catch (error) {
      console.error('🔑 AUTH UTILS: Error fetching user:', error);
      authCache.user = null;
      authCache.timestamp = now;
      return null;
    } finally {
      authCache.promise = null; // Clear pending promise
    }
  })();
  
  return await authCache.promise;
};

// Clear the auth cache (useful when auth state changes)
export const clearAuthCache = () => {
  console.log('🔑 AUTH UTILS: Clearing auth cache');
  authCache = {
    user: null,
    timestamp: 0,
    promise: null
  };
};

// Helper to check if user is authenticated
export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};

// Helper to get user email
export const getUserEmail = async () => {
  const user = await getCurrentUser();
  return user?.email || null;
};

// Helper to get user ID
export const getUserId = async () => {
  const user = await getCurrentUser();
  return user?.id || null;
}; 