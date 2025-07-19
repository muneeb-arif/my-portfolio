import { API_BASE } from './apiConfig';

// Domain utilities for portfolio identification

/**
 * Get the current domain from the browser
 * @returns {string} The current domain (e.g., "localhost:3000", "muneeb.theexpertways.com")
 */
export const getCurrentDomain = () => {
  if (typeof window === 'undefined') {
    return null; // Server-side rendering
  }
  
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  if (port && port !== '80' && port !== '443') {
    return `${hostname}:${port}`;
  }
  
  return hostname;
};

/**
 * Get the full current URL
 * @returns {string} The current URL
 */
export const getCurrentUrl = () => {
  if (typeof window === 'undefined') {
    return null; // Server-side rendering
  }
  
  return window.location.href;
};

/**
 * Get the current origin (protocol + domain)
 * @returns {string} The current origin
 */
export const getCurrentOrigin = () => {
  if (typeof window === 'undefined') {
    return null; // Server-side rendering
  }
  
  return window.location.origin;
};

/**
 * Check if we're running on localhost
 * @returns {boolean} True if running on localhost
 */
export const isLocalhost = () => {
  const domain = getCurrentDomain();
  return domain && (domain.includes('localhost') || domain.includes('127.0.0.1'));
};

/**
 * Get user information by domain
 * @param {string} domain - The domain to look up
 * @returns {Promise<Object>} User information
 */
export const getUserByDomain = async (domain) => {
  try {
    const response = await fetch(`${API_BASE}/domains/user?domain=${encodeURIComponent(domain)}`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      console.warn('Domain not found:', domain, data.error);
      return null;
    }
  } catch (error) {
    console.error('Error getting user by domain:', error);
    return null;
  }
};

/**
 * Get current user by domain
 * @returns {Promise<Object>} Current user information
 */
export const getCurrentUserByDomain = async () => {
  const origin = getCurrentOrigin();
  if (!origin) {
    return null;
  }
  
  // Add trailing slash to match database format
  const domain = origin.endsWith('/') ? origin : `${origin}/`;
  
  return await getUserByDomain(domain);
}; 