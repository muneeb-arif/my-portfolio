/**
 * Centralized API Configuration
 * Uses environment variable with fallback to localhost for development
 */

export const getApiBaseUrl = () => {
  // Use the environment variable (which is set correctly in .env)
  return process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
};

export const API_BASE = getApiBaseUrl(); 