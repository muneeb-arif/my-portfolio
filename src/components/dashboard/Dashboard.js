import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import Login from './Login';
import DashboardLayout from './DashboardLayout';
import './Dashboard.css';
import { SettingsProvider } from '../../services/settingsContext';

const Dashboard = () => {
  const { user, loading, error, signOut } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');

  // Check for verification or reset success in URL params
  useEffect(() => {
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

  const handleSignOut = async () => {
    const result = await signOut();
    if (!result.success) {
      console.error('Sign out failed:', result.error);
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
  if (error && error.message?.includes('Connection error')) {
    return (
      <div className="dashboard-error">
        <div className="error-card">
          <h2>Connection Issue</h2>
          <p>{error.message}</p>
          <p>Check your internet connection and Supabase configuration.</p>
        </div>
      </div>
    );
  }

  // Show login if no user (this is the normal flow)
  if (!user) {
    return <Login />;
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