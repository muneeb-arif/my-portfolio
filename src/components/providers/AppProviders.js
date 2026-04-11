'use client';

import React, { useEffect } from 'react';
import Swal from 'sweetalert2';
import { PublicDataProvider } from '../../services/PublicDataContext';
import { AuthProvider } from '../../services/authContext';

Swal.mixin({
  customClass: {
    container: 'swal-z-index-override',
  },
});

export function AppProviders({ children }) {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .swal-z-index-override {
        z-index: 10000 !important;
      }
      .swal2-container {
        z-index: 10000 !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <PublicDataProvider>
      <AuthProvider>{children}</AuthProvider>
    </PublicDataProvider>
  );
}
