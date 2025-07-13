import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Swal from 'sweetalert2';
import { PublicDataProvider } from './services/PublicDataContext';

// Configure SweetAlert2 globally to appear above mobile nav
Swal.mixin({
  customClass: {
    container: 'swal-z-index-override'
  }
});

// Add global SweetAlert2 z-index override
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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PublicDataProvider>
      <App />
    </PublicDataProvider>
  </React.StrictMode>
); 