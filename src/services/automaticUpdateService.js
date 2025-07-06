import { supabase } from '../config/supabase';

/**
 * Automatic Update Service
 * Handles server-side automatic updates for shared hosting
 */
export class AutomaticUpdateService {
  constructor() {
    this.apiKey = 'sk_update_2024_portfolio_secure_key_255d78d54885303d0fc7564b88b70527'; // Should match PHP endpoint
    this.updateEndpoint = window.location.origin + '/update-endpoint.php';
    this.clientId = this.getOrCreateClientId();
  }

  /**
   * Get or create client ID
   */
  getOrCreateClientId() {
    let clientId = localStorage.getItem('auto_update_client_id');
    if (!clientId) {
      clientId = 'auto_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('auto_update_client_id', clientId);
    }
    return clientId;
  }

  /**
   * Check if automatic updates are supported
   */
  async checkSupport() {
    try {
      const response = await fetch(this.updateEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          action: 'check_support'
        })
      });

      return response.status !== 404;
    } catch (error) {
      console.log('Automatic updates not supported on this server');
      return false;
    }
  }

  /**
   * Apply automatic update
   */
  async applyUpdate(updateInfo, options = {}) {
    const createBackup = options.createBackup !== undefined ? options.createBackup : true;
    const progressCallback = options.progressCallback || null;

    try {
      // Validate update info
      if (!updateInfo.package_url || !updateInfo.version) {
        throw new Error('Invalid update information');
      }

      if (progressCallback) {
        progressCallback('🔍 Checking server capabilities...', 'info');
      }

      // Check if endpoint is available
      const isSupported = await this.checkSupport();
      if (!isSupported) {
        throw new Error('Automatic updates not supported on this server');
      }

      if (progressCallback) {
        progressCallback('📦 Initiating automatic update...', 'info');
      }

      // Log update attempt
      await this.logActivity(updateInfo.id, 'auto_update_started');

      // Send update request to server
      const response = await fetch(this.updateEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          download_url: updateInfo.package_url,
          version: updateInfo.version,
          create_backup: createBackup,
          client_id: this.clientId
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Update failed');
      }

      if (progressCallback) {
        progressCallback('✅ Update completed successfully!', 'success');
        progressCallback(`📁 Files updated: ${result.files_updated?.length || 0}`, 'info');
        if (result.backup_created) {
          progressCallback('💾 Backup created successfully', 'info');
        }
      }

      // Log successful update
      await this.logActivity(updateInfo.id, 'auto_update_completed', {
        files_updated: result.files_updated?.length || 0,
        backup_created: !!result.backup_created
      });

      // Update local version
      this.updateLocalVersion(updateInfo.version);

      return {
        success: true,
        message: result.message,
        filesUpdated: result.files_updated?.length || 0,
        backupCreated: result.backup_created,
        timestamp: result.timestamp
      };

    } catch (error) {
      console.error('Automatic update failed:', error);
      
      // Log error
      await this.logActivity(updateInfo.id, 'auto_update_failed', {
        error: error.message
      });

      if (progressCallback) {
        progressCallback(`❌ Update failed: ${error.message}`, 'error');
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update local version information
   */
  updateLocalVersion(version) {
    // Update localStorage
    localStorage.setItem('theme_version', version);
    
    // Update meta tag
    let versionMeta = document.querySelector('meta[name="theme-version"]');
    if (!versionMeta) {
      versionMeta = document.createElement('meta');
      versionMeta.setAttribute('name', 'theme-version');
      document.head.appendChild(versionMeta);
    }
    versionMeta.setAttribute('content', version);
  }

  /**
   * Log activity to database
   */
  async logActivity(updateId, activity, details = null) {
    try {
      const { error } = await supabase
        .from('automatic_update_logs')
        .insert({
          update_id: updateId,
          client_id: this.clientId,
          activity: activity,
          details: details,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          domain: window.location.hostname
        });

      if (error) {
        console.error('Failed to log activity:', error);
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  /**
   * Get update logs for this client
   */
  async getUpdateLogs(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('automatic_update_logs')
        .select('*')
        .eq('client_id', this.clientId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get update logs:', error);
      return [];
    }
  }

  /**
   * Check if automatic updates are enabled for this client
   */
  isAutomaticUpdatesEnabled() {
    return localStorage.getItem('automatic_updates_enabled') === 'true';
  }

  /**
   * Enable/disable automatic updates
   */
  setAutomaticUpdatesEnabled(enabled) {
    localStorage.setItem('automatic_updates_enabled', enabled.toString());
  }

  /**
   * Show automatic update notification
   */
  showAutomaticUpdateNotification(updateInfo) {
    // Remove existing notification
    const existingNotification = document.querySelector('.automatic-update-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'automatic-update-notification';
    notification.innerHTML = `
      <div class="auto-update-notification-content">
        <div class="update-icon">🚀</div>
        <div class="update-text">
          <strong>Automatic Update Available</strong>
          <p>Version ${updateInfo.version}: ${updateInfo.title}</p>
          <p class="update-description">One-click server-side update (no cPanel needed)</p>
        </div>
        <div class="update-actions">
          <button class="btn-auto-update" onclick="window.automaticUpdateService.triggerAutomaticUpdate('${updateInfo.id}')">
            🚀 Auto Update
          </button>
          <button class="btn-manual-fallback" onclick="window.sharedHostingUpdateService?.showInstructions('${updateInfo.id}')">
            📋 Manual Instructions
          </button>
          <button class="btn-update-later" onclick="this.parentElement.parentElement.parentElement.remove()">
            Later
          </button>
        </div>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .automatic-update-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        padding: 20px;
        max-width: 400px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        animation: slideInRight 0.3s ease-out;
      }
      
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      .auto-update-notification-content {
        display: flex;
        align-items: flex-start;
        gap: 15px;
      }
      
      .automatic-update-notification .update-icon {
        font-size: 28px;
        flex-shrink: 0;
        margin-top: 5px;
      }
      
      .automatic-update-notification .update-text {
        flex: 1;
        margin-bottom: 15px;
      }
      
      .automatic-update-notification .update-text strong {
        display: block;
        margin-bottom: 8px;
        font-size: 1.1rem;
      }
      
      .automatic-update-notification .update-text p {
        margin: 5px 0;
        opacity: 0.95;
        font-size: 0.9rem;
        line-height: 1.4;
      }
      
      .update-description {
        font-style: italic;
        opacity: 0.8;
        font-size: 0.85rem !important;
      }
      
      .automatic-update-notification .update-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
      }
      
      .btn-auto-update, .btn-manual-fallback, .btn-update-later {
        padding: 10px 16px;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
      }
      
      .btn-auto-update {
        background: #059669;
        color: white;
        border: 2px solid rgba(255,255,255,0.3);
      }
      
      .btn-auto-update:hover {
        background: #047857;
        border-color: rgba(255,255,255,0.5);
        transform: translateY(-1px);
      }
      
      .btn-manual-fallback {
        background: rgba(255,255,255,0.2);
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
      }
      
      .btn-manual-fallback:hover {
        background: rgba(255,255,255,0.3);
      }
      
      .btn-update-later {
        background: rgba(255,255,255,0.1);
        color: white;
        border: 1px solid rgba(255,255,255,0.2);
      }
      
      .btn-update-later:hover {
        background: rgba(255,255,255,0.2);
      }
      
      @media (max-width: 480px) {
        .automatic-update-notification {
          top: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }
        
        .auto-update-notification-content {
          flex-direction: column;
          text-align: center;
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Auto-hide after 2 minutes
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 120000);
  }

  /**
   * Trigger automatic update with progress display
   */
  async triggerAutomaticUpdate(updateId) {
    try {
      // Get update info
      const { data: updateInfo, error } = await supabase
        .from('shared_hosting_updates')
        .select('*')
        .eq('id', updateId)
        .single();

      if (error) throw error;

      // Create progress modal
      const modal = this.createProgressModal();
      document.body.appendChild(modal);

      const progressCallback = (message, type) => {
        this.addProgressMessage(modal, message, type);
      };

      // Remove notification
      const notification = document.querySelector('.automatic-update-notification');
      if (notification) {
        notification.remove();
      }

      progressCallback('🚀 Starting automatic update...', 'info');

      // Apply the update
      const result = await this.applyUpdate(updateInfo, {
        createBackup: true,
        progressCallback
      });

      if (result.success) {
        progressCallback('🎉 Update completed! Reloading page...', 'success');
        
        // Auto-reload page after 3 seconds
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        progressCallback(`❌ Update failed: ${result.error}`, 'error');
        progressCallback('💡 You can try manual update instead', 'info');
      }

    } catch (error) {
      console.error('Failed to trigger automatic update:', error);
      alert('❌ Failed to start automatic update: ' + error.message);
    }
  }

  /**
   * Create progress modal
   */
  createProgressModal() {
    const modal = document.createElement('div');
    modal.className = 'auto-update-progress-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>🚀 Automatic Update in Progress</h3>
        </div>
        <div class="modal-body">
          <div class="progress-messages"></div>
        </div>
        <div class="modal-footer">
          <button class="btn-close" onclick="this.parentElement.parentElement.remove()" style="display: none;">
            Close
          </button>
        </div>
      </div>
    `;

    // Add modal styles
    const modalStyle = document.createElement('style');
    modalStyle.textContent = `
      .auto-update-progress-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10002;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .auto-update-progress-modal .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
      }
      
      .auto-update-progress-modal .modal-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        max-width: 500px;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      }
      
      .auto-update-progress-modal .modal-header {
        padding: 20px;
        border-bottom: 1px solid #e5e5e5;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
      }
      
      .auto-update-progress-modal .modal-header h3 {
        margin: 0;
        font-size: 1.3rem;
      }
      
      .auto-update-progress-modal .modal-body {
        padding: 20px;
        max-height: 400px;
        overflow-y: auto;
      }
      
      .progress-messages {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .progress-message {
        padding: 10px 15px;
        border-radius: 8px;
        font-size: 0.9rem;
        line-height: 1.4;
      }
      
      .progress-message.info {
        background: #eff6ff;
        border-left: 4px solid #3b82f6;
        color: #1e40af;
      }
      
      .progress-message.success {
        background: #f0fdf4;
        border-left: 4px solid #10b981;
        color: #065f46;
      }
      
      .progress-message.error {
        background: #fef2f2;
        border-left: 4px solid #ef4444;
        color: #991b1b;
      }
      
      .auto-update-progress-modal .modal-footer {
        padding: 15px 20px;
        border-top: 1px solid #e5e5e5;
        text-align: right;
      }
      
      .auto-update-progress-modal .btn-close {
        background: #6b7280;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
      }
      
      .auto-update-progress-modal .btn-close:hover {
        background: #4b5563;
      }
    `;
    
    document.head.appendChild(modalStyle);
    return modal;
  }

  /**
   * Add progress message to modal
   */
  addProgressMessage(modal, message, type = 'info') {
    const messagesContainer = modal.querySelector('.progress-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `progress-message ${type}`;
    messageElement.textContent = message;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Show close button after completion or error
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        const closeBtn = modal.querySelector('.btn-close');
        if (closeBtn) {
          closeBtn.style.display = 'inline-block';
        }
      }, 2000);
    }
  }
}

// Create singleton instance
export const automaticUpdateService = new AutomaticUpdateService();

// Make it globally available
window.automaticUpdateService = automaticUpdateService; 