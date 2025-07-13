import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from './serviceAdapter';
import { getSiteUrl, clearConfigCache } from './portfolioConfigUtils';

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
      const currentUser = await authService.getCurrentUser();
      clearTimeout(timeoutId);
      
      if (currentUser) {
        console.log('🔑 CENTRAL AUTH: Active session found for user:', currentUser.email || 'null');
        setUser(currentUser);
      } else {
        console.log('🔑 CENTRAL AUTH: No active session found');
        setUser(null);
      }
      setError(null);
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('🔑 CENTRAL AUTH: Auth initialization failed or timed out:', err.message);
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
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
      } else {
        console.log('🔑 CENTRAL AUTH: Session expired during refresh');
        setUser(null);
        setError(null);
      }
    } catch (err) {
      console.error('🔑 CENTRAL AUTH: Error during refresh:', err);
      setError(err);
      setUser(null);
    }
  }, []);

  // Sign up new user
  const signUp = useCallback(async (email, password, userData = {}) => {
    try {
      const result = await authService.signUp(email, password, userData);
      
      if (result.success) {
        console.log('✅ Sign up successful for user:', email);
        return { success: true, user: result.user };
      } else {
        console.error('🔑 CENTRAL AUTH: Sign up error:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('🔑 CENTRAL AUTH: Sign up error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Sign in user
  const signIn = useCallback(async (email, password) => {
    try {
      const result = await authService.signIn(email, password);
      
      if (result.success || result.user) {
        // Update local state immediately
        setUser(result.user);
        console.log('✅ Sign in successful for user:', result.user?.email);
        return { success: true, user: result.user };
      } else {
        console.error('🔑 CENTRAL AUTH: Sign in error:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('🔑 CENTRAL AUTH: Sign in error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Sign out user
  const signOut = useCallback(async () => {
    try {
      const result = await authService.signOut();
      
      // Update local state immediately
      setUser(null);
      
      if (result.success) {
        console.log('✅ Sign out successful');
        return { success: true };
      } else {
        console.error('🔑 CENTRAL AUTH: Sign out error:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('🔑 CENTRAL AUTH: Sign out error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email) => {
    try {
      const result = await authService.resetPassword(email);
      
      if (result.success) {
        console.log('✅ Password reset email sent for:', email);
        return { success: true };
      } else {
        console.error('🔑 CENTRAL AUTH: Reset password error:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('🔑 CENTRAL AUTH: Reset password error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Set up auth state listener
  useEffect(() => {
    console.log('🔑 CENTRAL AUTH: Setting up auth state listener...');
    
    // Initialize auth state
    initializeAuth();
    
    // Set up auth state change listener through service adapter
    const unsubscribe = authService.onAuthStateChange
      ? authService.onAuthStateChange((event, session) => {
          console.log('🔑 CENTRAL AUTH: Auth state changed:', event);
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setUser(session?.user || null);
            setLoading(false);
            console.log('🔑 CENTRAL AUTH: User signed in');
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setLoading(false);
            console.log('🔑 CENTRAL AUTH: User signed out');
          }
        })
      : () => {}; // Fallback if onAuthStateChange not available

    return () => {
      console.log('🔑 CENTRAL AUTH: Cleaning up auth listener...');
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

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

export default AuthContext; 