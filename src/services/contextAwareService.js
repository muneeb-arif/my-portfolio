// Context-aware service that provides centralized access to user and config data
// This eliminates duplicate API calls by using cached context data

import { supabase } from '../config/supabase';

let authContext = null;
let portfolioConfigContext = null;

// Register contexts (called from App.js)
export const registerContexts = (auth, portfolioConfig) => {
  authContext = auth;
  portfolioConfigContext = portfolioConfig;
};

// Get current user from context (no API call)
export const getCurrentUser = () => {
  if (!authContext) {
    console.warn('⚠️ AuthContext not registered. Using direct API call as fallback.');
    return null;
  }
  return authContext.user;
};

// Get current user ID from context (no API call)
export const getCurrentUserId = () => {
  const user = getCurrentUser();
  return user?.id || null;
};

// Get portfolio config from context (no API call)
export const getPortfolioConfig = () => {
  if (!portfolioConfigContext) {
    console.warn('⚠️ PortfolioConfigContext not registered. Using direct API call as fallback.');
    return null;
  }
  return portfolioConfigContext.config;
};

// Get portfolio owner user ID from context (no API call)
export const getPortfolioOwnerUserId = () => {
  const config = getPortfolioConfig();
  return config?.owner_user_id || null;
};

// Check if user is authenticated (no API call)
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

// Check if contexts are ready
export const areContextsReady = () => {
  return authContext && portfolioConfigContext;
};

// Fallback functions that still make API calls (for when contexts aren't available)
export const fallbackGetCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const fallbackGetPortfolioConfig = async () => {
  try {
    const envEmail = process.env.REACT_APP_PORTFOLIO_OWNER_EMAIL;
    
    if (envEmail) {
      const { data, error } = await supabase
        .from('portfolio_config')
        .select('*')
        .eq('owner_email', envEmail)
        .eq('is_active', true)
        .single();
      
      if (!error && data) {
        return data;
      }
    }

    // Fallback to any active portfolio config
    const { data, error } = await supabase
      .from('portfolio_config')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting portfolio config:', error);
    return null;
  }
};

// Smart functions that use context first, then fallback to API
export const getUser = async () => {
  const contextUser = getCurrentUser();
  if (contextUser) {
    return contextUser;
  }
  
  console.warn('⚠️ Using fallback API call for user data');
  return await fallbackGetCurrentUser();
};

export const getUserId = async () => {
  const user = await getUser();
  return user?.id || null;
}; 