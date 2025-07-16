// Utility functions for handling fallback data
import { supabase } from '../config/supabase';

let fallbackNotificationShown = false;

export const fallbackUtils = {
  // Check if we're using fallback data and show notification
  showFallbackNotification() {
    if (!fallbackNotificationShown) {
      // Create a notification element
      const notification = document.createElement('div');
      notification.className = 'fallback-notification';
      notification.innerHTML = `
        <div class="fallback-notification-content">
          <div class="fallback-notification-icon">⚠️</div>
          <div class="fallback-notification-text">
            <strong>Demo Mode</strong>
            <p>Pre-filled data is loading from JSON, update .env to connect supabase and load dynamic data from dashboard</p>
          </div>
          <button class="fallback-notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
      `;
      
      // Add styles
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 8px;
        padding: 16px;
        z-index: 9999;
        max-width: 350px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease-out;
      `;
      
      // Add animation styles
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .fallback-notification-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .fallback-notification-icon {
          font-size: 20px;
          flex-shrink: 0;
        }
        .fallback-notification-text {
          flex: 1;
        }
        .fallback-notification-text strong {
          display: block;
          color: #92400e;
          margin-bottom: 4px;
        }
        .fallback-notification-text p {
          margin: 0;
          color: #92400e;
          font-size: 14px;
        }
        .fallback-notification-close {
          background: none;
          border: none;
          font-size: 20px;
          color: #92400e;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        .fallback-notification-close:hover {
          background: rgba(245, 158, 11, 0.1);
        }
      `;
      
      document.head.appendChild(style);
      document.body.appendChild(notification);
      
      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 10000);
      
      fallbackNotificationShown = true;
    }
  },

  // Reset fallback notification flag
  resetFallbackNotification() {
    fallbackNotificationShown = false;
  },

  // Check if API is available
  async checkApiConnection() {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/health`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }
};

export default fallbackUtils; 