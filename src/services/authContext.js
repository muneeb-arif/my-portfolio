import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from './apiService';

const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  signIn: async () => ({ success: false, error: 'Not implemented' }),
  signUp: async () => ({ success: false, error: 'Not implemented' }),
  signOut: async () => ({ success: false, error: 'Not implemented' }),
  resetPassword: async () => ({ success: false, error: 'Not implemented' }),
  refreshUser: async () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state - called only once
  const initializeAuth = useCallback(async () => {
    console.log('🔑 CENTRAL AUTH: Initializing authentication state...');
    setLoading(true);
    setError(null);
    
    // Immediate timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('🔑 CENTRAL AUTH: Auth timeout - proceeding without user');
      setUser(null);
      setLoading(false);
    }, 2000); // 2 second timeout
    
    try {
      // Check if we have a stored token
      const token = localStorage.getItem('api_token');
      if (!token) {
        console.log('🔑 CENTRAL AUTH: No stored token found');
        setUser(null);
        setLoading(false);
        return;
      }

      // Set the token in apiService
      apiService.setToken(token);
      
      // Verify the token by making a request to get current user
      const response = await apiService.getCurrentUser();
      
      clearTimeout(timeoutId);
      
      if (response.success && response.user) {
        console.log('🔑 CENTRAL AUTH: Active session found for user:', response.user.email || 'null');
        setUser(response.user);
      } else {
        console.log('🔑 CENTRAL AUTH: Invalid or expired token');
        // Clear invalid token
        apiService.clearToken();
        setUser(null);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('🔑 CENTRAL AUTH: Auth initialization failed or timed out:', err.message);
      // Clear any invalid token
      apiService.clearToken();
      setUser(null);
      setError(null); // Don't show errors for timeouts
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh user data (for manual refresh scenarios)
  const refreshUser = useCallback(async () => {
    try {
      console.log('🔑 CENTRAL AUTH: Refreshing user data...');
      const response = await apiService.getCurrentUser();
      
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        console.log('🔑 CENTRAL AUTH: Session expired during refresh');
        apiService.clearToken();
        setUser(null);
        setError(null);
      }
    } catch (err) {
      console.error('🔑 CENTRAL AUTH: Error during refresh:', err);
      apiService.clearToken();
      setError(err);
      setUser(null);
    }
  }, []);

  // Sign up new user
  const signUp = useCallback(async (email, password, userData = {}) => {
    try {
      console.log('🔑 CENTRAL AUTH: Signing up user:', email);
      
      const response = await apiService.register(email, password, userData);
      
      if (response.success) {
        console.log('✅ User registered successfully');
        // Don't automatically sign in after registration
        return { success: true, user: response.user };
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('🔑 CENTRAL AUTH: Sign up error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Sign in user
  const signIn = useCallback(async (email, password) => {
    try {
      console.log('🔑 CENTRAL AUTH: Signing in user:', email);
      
      const response = await apiService.login(email, password);
      
      if (response.success && response.token) {
        // Token is automatically set in apiService.login()
        console.log('✅ User signed in successfully');
        setUser(response.user);
        return { success: true, user: response.user };
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('🔑 CENTRAL AUTH: Sign in error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Sign out user
  const signOut = useCallback(async () => {
    try {
      console.log('🔑 CENTRAL AUTH: Signing out user');
      
      // Clear token and user state
      apiService.clearToken();
      setUser(null);
      
      console.log('✅ User signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('🔑 CENTRAL AUTH: Sign out error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email) => {
    try {
      console.log('🔑 CENTRAL AUTH: Resetting password for:', email);
      
      const response = await apiService.resetPassword(email);
      
      if (response.success) {
        console.log('✅ Password reset email sent');
        return { success: true };
      } else {
        throw new Error(response.error || 'Password reset failed');
      }
    } catch (error) {
      console.error('🔑 CENTRAL AUTH: Reset password error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Set up auth state listener
  useEffect(() => {
    console.log('🔑 CENTRAL AUTH: Setting up auth state listener...');
    
    // Initialize authentication
    initializeAuth();
    
    // Listen for storage changes (for cross-tab logout)
    const handleStorageChange = (e) => {
      if (e.key === 'api_token' && !e.newValue) {
        console.log('🔑 CENTRAL AUTH: Token cleared in another tab');
        setUser(null);
        setLoading(false);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      console.log('🔑 CENTRAL AUTH: Cleaning up auth listener...');
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [initializeAuth]);

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 