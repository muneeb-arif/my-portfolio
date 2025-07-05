import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
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
    try {
      console.log('🔑 CENTRAL AUTH: Initializing authentication state...');
      setLoading(true);
      setError(null);
      
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.log('🔑 CENTRAL AUTH: No active session found');
        setUser(null);
        setError(null); // Don't treat missing session as error
      } else {
        console.log('🔑 CENTRAL AUTH: Active session found for user:', user?.email);
        setUser(user);
      }
    } catch (err) {
      console.error('🔑 CENTRAL AUTH: Error during initialization:', err);
      setError(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh user data (for manual refresh scenarios)
  const refreshUser = useCallback(async () => {
    try {
      console.log('🔑 CENTRAL AUTH: Refreshing user data...');
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.log('🔑 CENTRAL AUTH: Session expired during refresh');
        setUser(null);
        setError(null);
      } else {
        setUser(user);
      }
    } catch (err) {
      console.error('🔑 CENTRAL AUTH: Error during refresh:', err);
      setError(err);
      setUser(null);
    }
  }, []);

  // Helper function to get site URL from database settings
  const getSiteUrlFromSettings = async () => {
    return await getSiteUrl();
  };

  // Sign up new user
  const signUp = useCallback(async (email, password, userData = {}) => {
    try {
      const siteUrl = await getSiteUrlFromSettings();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${siteUrl}/dashboard?verified=true`
        }
      });
      
      if (error) throw error;
      
      // Auto-configure portfolio for new user
      if (data.user && data.user.id) {
        try {
          console.log('🔄 Auto-configuring portfolio for new user:', email);
          const { error: configError } = await supabase
            .from('portfolio_config')
            .insert({
              owner_email: email,
              owner_user_id: data.user.id,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (configError) {
            console.warn('⚠️ Failed to auto-configure portfolio:', configError.message);
          } else {
            console.log('✅ Portfolio automatically configured for new user');
          }
        } catch (configError) {
          console.warn('⚠️ Error during portfolio auto-configuration:', configError);
        }
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('🔑 CENTRAL AUTH: Sign up error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Sign in user
  const signIn = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Update local state immediately
      setUser(data.user);
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('🔑 CENTRAL AUTH: Sign in error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Sign out user
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Update local state immediately
      setUser(null);
      
      return { success: true };
    } catch (error) {
      console.error('🔑 CENTRAL AUTH: Sign out error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email) => {
    try {
      const siteUrl = await getSiteUrlFromSettings();
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/dashboard?reset=true`
      });
      if (error) throw error;
      return { success: true };
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
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔑 CENTRAL AUTH: Auth state changed:', event);
        
        // Clear caches when auth state changes
        try {
          // Import here to avoid circular dependencies
          const { publicPortfolioService, portfolioConfigService } = await import('./supabaseService');
          const { clearAuthCache } = await import('./authUtils');
          
          publicPortfolioService.clearCache();
          portfolioConfigService.clearCache();
          clearAuthCache(); // Clear auth utils cache (also clears portfolio config cache)
          clearConfigCache(); // Clear portfolio config cache directly
          console.log('🔑 CENTRAL AUTH: All caches cleared');
        } catch (error) {
          console.warn('🔑 CENTRAL AUTH: Could not clear caches:', error);
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null);
          console.log('🔑 CENTRAL AUTH: User signed in');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          console.log('🔑 CENTRAL AUTH: User signed out');
        }
      }
    );

    return () => {
      console.log('🔑 CENTRAL AUTH: Cleaning up auth listener...');
      subscription.unsubscribe();
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

export default AuthContext; 