'use client';

import React, { useEffect } from 'react';
import { SettingsProvider } from '../services/settingsContext';
import { AppContent } from '../App';

function HashToDashboardRedirect() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#/dashboard') {
      window.location.replace('/dashboard');
    }
  }, []);
  return null;
}

export function PortfolioHomeClient() {
  return (
    <SettingsProvider>
      <HashToDashboardRedirect />
      <AppContent />
    </SettingsProvider>
  );
}
