import { API_BASE } from '../utils/apiConfig';

// Centralized portfolio config cache with promise deduplication
let configCache = {
  config: null,
  timestamp: 0,
  promise: null,
  cachedEmail: null
};

const CACHE_DURATION = 10000; // 10 seconds cache during initialization

// Get portfolio config with caching and deduplication
export const getPortfolioConfig = async () => {
  const envEmail = process.env.REACT_APP_PORTFOLIO_OWNER_EMAIL;
  const now = Date.now();
  
  // Clear cache if email changed
  if (configCache.cachedEmail && configCache.cachedEmail !== envEmail) {
    console.log('📧 PORTFOLIO CONFIG: Email changed, clearing cache');
    clearConfigCache();
  }
  
  // Return cached result if fresh and for same email
  if (configCache.config !== undefined && 
      configCache.cachedEmail === envEmail &&
      (now - configCache.timestamp) < CACHE_DURATION) {
    console.log('🔧 PORTFOLIO CONFIG: Using cached result for:', envEmail);
    return configCache.config;
  }
  
  // If there's already a pending request, wait for it
  if (configCache.promise) {
    console.log('🔧 PORTFOLIO CONFIG: Waiting for pending request...');
    return await configCache.promise;
  }
  
  // Create new request
  console.log('🔧 PORTFOLIO CONFIG: Making fresh request for:', envEmail);
  configCache.promise = (async () => {
    try {
      if (!envEmail) {
        console.log('🔧 PORTFOLIO CONFIG: No email configured');
        configCache.config = null;
        configCache.cachedEmail = envEmail;
        configCache.timestamp = now;
        return null;
      }
      
      const res = await fetch(
        `${API_BASE}/portfolio-config?owner_email=${encodeURIComponent(envEmail)}`
      );
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success || !json.data) {
        console.log('🔧 PORTFOLIO CONFIG: Config not found for email:', envEmail);
        configCache.config = null;
      } else {
        console.log('🔧 PORTFOLIO CONFIG: Config found for:', envEmail);
        configCache.config = json.data;
      }
      
      configCache.cachedEmail = envEmail;
      configCache.timestamp = now;
      return configCache.config;
      
    } catch (error) {
      console.error('🔧 PORTFOLIO CONFIG: Error fetching config:', error);
      configCache.config = null;
      configCache.cachedEmail = envEmail;
      configCache.timestamp = now;
      return null;
    } finally {
      configCache.promise = null;
    }
  })();
  
  return await configCache.promise;
};

// Get site URL with portfolio config caching
export const getSiteUrl = async () => {
  try {
    const portfolioConfig = await getPortfolioConfig();
    
    if (!portfolioConfig?.owner_user_id) {
      console.log('🔧 PORTFOLIO CONFIG: No owner_user_id, using window.location.origin');
      return window.location.origin;
    }
    
    // Get site_url from API settings
    const response = await fetch(`${API_BASE}/settings`);
    const data = await response.json();
    
    if (!data.success || !data.data) {
      console.log('🔧 PORTFOLIO CONFIG: No settings from API, using fallback');
      return window.location.origin;
    }
    
    const siteUrl = data.data.site_url;
    if (!siteUrl) {
      console.log('🔧 PORTFOLIO CONFIG: No site_url setting, using fallback');
      return window.location.origin;
    }
    
    console.log('🔧 PORTFOLIO CONFIG: Using site_url from API settings:', siteUrl);
    return siteUrl;
    
  } catch (error) {
    console.warn('🔧 PORTFOLIO CONFIG: Error getting site URL:', error);
    return window.location.origin;
  }
};

// Clear cache (called when auth state changes or config needs refresh)
export const clearConfigCache = () => {
  console.log('🔧 PORTFOLIO CONFIG: Clearing cache...');
  configCache = {
    config: null,
    timestamp: 0,
    promise: null,
    cachedEmail: null
  };
};

// Convenience function to get owner user ID
export const getOwnerUserId = async () => {
  const config = await getPortfolioConfig();
  return config?.owner_user_id || null;
};

export default {
  getPortfolioConfig,
  getSiteUrl,
  getOwnerUserId,
  clearConfigCache
}; 