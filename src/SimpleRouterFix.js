import React, { useState, useEffect } from 'react';
import Dashboard from './components/dashboard/Dashboard';
import { AuthProvider } from './services/authContext';
import { SettingsProvider } from './services/settingsContext';
import AppContent from './AppContent'; // We'll need to extract this

function SimpleRouterFix() {
  const [currentRoute, setCurrentRoute] = useState('/');
  
  useEffect(() => {
    // Check current URL and hash
    const checkRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      console.log('SimpleRouter - Path:', path, 'Hash:', hash);
      
      // Handle dashboard routes
      if (path === '/dashboard' || hash === '#/dashboard') {
        setCurrentRoute('/dashboard');
        // Clean up hash if present
        if (hash === '#/dashboard') {
          window.history.replaceState(null, '', '/dashboard');
        }
      } else {
        setCurrentRoute('/');
      }
    };
    
    // Check on load
    checkRoute();
    
    // Listen for URL changes
    window.addEventListener('popstate', checkRoute);
    
    return () => {
      window.removeEventListener('popstate', checkRoute);
    };
  }, []);
  
  return (
    <AuthProvider>
      {currentRoute === '/dashboard' ? (
        <Dashboard />
      ) : (
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      )}
    </AuthProvider>
  );
}

export default SimpleRouterFix; 