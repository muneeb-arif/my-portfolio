import React, { useState, useEffect } from 'react';
import { authService } from '../../services/supabaseService';
import Login from './Login';
import DashboardLayout from './DashboardLayout';
import './Dashboard.css';
import { SettingsProvider } from '../../services/settingsContext';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    checkAuthState();
    
    // Check for verification or reset success in URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === 'true') {
      setSuccessMessage('✅ Email verified successfully! Welcome to your dashboard.');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('reset') === 'true') {
      setSuccessMessage('✅ Password reset successful! You can now access your dashboard.');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkAuthState = async () => {
    try {
      // console.log('🔍 Checking authentication state...');
      const { data: { user }, error } = await authService.getCurrentUser();
      
      // console.log('Auth result:', { user, error });
      
      if (error) {
      // console.error('Auth check error:', error);
        // Don't set error for auth session missing - that's normal when not logged in
        if (error.message !== 'Auth session missing!') {
          setError(`Authentication error: ${error.message}`);
        }
      } else {
      // console.log('✅ Authentication check successful');
        setUser(user);
      }
    } catch (err) {
      // console.error('Auth check error:', err);
      // Only set error for actual network/connection issues
      if (err.name === 'TypeError' || err.message.includes('fetch')) {
        setError(`Connection error: ${err.message}`);
      } else {
      // console.log('Non-critical auth error, proceeding to login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuthChange = (newUser) => {
    setUser(newUser);
    setError('');
    setSuccessMessage('');
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const result = await authService.signOut();
      if (result.success) {
        setUser(null);
      } else {
        setError('Failed to sign out');
      }
    } catch (err) {
      // console.error('Sign out error:', err);
      setError('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Error state - only for critical errors
  if (error && error.includes('Connection error')) {
    return (
      <div className="dashboard-error">
        <div className="error-card">
          <h2>Connection Issue</h2>
          <p>{error}</p>
          <p>Check your internet connection and Supabase configuration.</p>
          <button onClick={checkAuthState} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show login if no user (this is the normal flow)
  if (!user) {
    return <Login onAuthChange={handleAuthChange} />;
  }

  // Show dashboard if user is authenticated
  return (
    <SettingsProvider>
      <DashboardLayout 
        user={user} 
        onSignOut={handleSignOut}
        successMessage={successMessage}
        onClearSuccess={() => setSuccessMessage('')}
      />
    </SettingsProvider>
  );
};

export default Dashboard; 