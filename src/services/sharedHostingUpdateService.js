import { supabase } from '../config/supabase';
import { automaticUpdateService } from './automaticUpdateService';

/**
 * Shared Hosting Update Service
 * Handles theme updates for shared hosting environments (cPanel)
 */
export class SharedHostingUpdateService {
  constructor() {
    this.clientId = this.getOrCreateClientId();
    this.currentVersion = this.getCurrentVersion();
    this.checkInterval = 24 * 60 * 60 * 1000; // Check daily for shared hosting
  }

  /**
   * Initialize the service for shared hosting
   */
  async initialize() {
    try {
      console.log('🌐 Initializing Shared Hosting Update Service...');
      
      // Register this client
      await this.registerClient();
      
      // Check automatic update capabilities
      await this.checkAutomaticCapabilities();
      
      // Check for updates
      await this.checkForUpdates();
      
      // Set up periodic checking (less frequent for shared hosting)
      this.setupUpdateChecking();
      
      console.log('✅ Shared Hosting Update Service initialized');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to initialize update service:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get or create client ID for this deployment
   */
  getOrCreateClientId() {
    let clientId = localStorage.getItem('shared_hosting_client_id');
    if (!clientId) {
      clientId = 'shared_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('shared_hosting_client_id', clientId);
    }
    return clientId;
  }

  /**
   * Get current version from meta tag or localStorage
   */
  getCurrentVersion() {
    // Try to get version from meta tag first
    const versionMeta = document.querySelector('meta[name="theme-version"]');
    if (versionMeta) {
      return versionMeta.getAttribute('content');
    }
    
    // Fallback to localStorage
    const storedVersion = localStorage.getItem('theme_version');
    return storedVersion || '1.0.0';
  }

  /**
   * Check automatic update capabilities
   */
  async checkAutomaticCapabilities() {
    try {
      // Check if automatic updates are supported
      const isSupported = await automaticUpdateService.checkSupport();
      
      // Register capability in database
      const { data, error } = await supabase.rpc('register_automatic_capability', {
        p_client_id: this.clientId,
        p_domain: window.location.hostname,
        p_supports_automatic: isSupported,
        p_endpoint_url: isSupported ? automaticUpdateService.updateEndpoint : null,
        p_php_version: null, // Could be detected server-side
        p_server_info: {
          user_agent: navigator.userAgent,
          screen_resolution: typeof window !== 'undefined' && window.screen 
            ? `${window.screen.width}x${window.screen.height}` 
            : 'unknown',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });

      if (error) {
        console.warn('Failed to register automatic capability:', error);
      } else {
        console.log(isSupported ? '🚀 Automatic updates supported' : '📋 Manual updates only');
      }

      // Store capability locally
      localStorage.setItem('automatic_updates_supported', isSupported.toString());
      
      return isSupported;
    } catch (error) {
      console.warn('Failed to check automatic capabilities:', error);
      localStorage.setItem('automatic_updates_supported', 'false');
      return false;
    }
  }

  /**
   * Register this client deployment
   */
  async registerClient() {
    try {
      const { data, error } = await supabase
        .from('shared_hosting_clients')
        .upsert({
          client_id: this.clientId,
          domain: window.location.hostname,
          current_version: this.currentVersion,
          deployment_type: 'shared_hosting',
          last_seen: new Date().toISOString(),
          user_agent: navigator.userAgent,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }, {
          onConflict: 'client_id'
        });

      if (error) throw error;
      
      console.log('✅ Client registered for shared hosting updates');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to register client:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check for available updates
   */
  async checkForUpdates() {
    try {
      const { data: updates, error } = await supabase
        .from('shared_hosting_updates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!updates || updates.length === 0) {
        console.log('✅ No updates available');
        return { success: true, hasUpdate: false };
      }

      const latestUpdate = updates[0];
      const hasUpdate = this.isVersionNewer(latestUpdate.version, this.currentVersion);
      
      if (hasUpdate) {
        console.log('🆕 Update available:', latestUpdate.version);
        this.showUpdateNotification(latestUpdate);
        
        // Store update info for manual application
        localStorage.setItem('pending_update', JSON.stringify(latestUpdate));
      }

      return {
        success: true,
        hasUpdate,
        updateInfo: hasUpdate ? latestUpdate : null
      };
    } catch (error) {
      console.error('❌ Failed to check for updates:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Compare version numbers
   */
  isVersionNewer(newVersion, currentVersion) {
    const parseVersion = (version) => {
      return version.split('.').map(part => parseInt(part, 10));
    };
    
    const newV = parseVersion(newVersion);
    const currentV = parseVersion(currentVersion);
    
    for (let i = 0; i < Math.max(newV.length, currentV.length); i++) {
      const newPart = newV[i] || 0;
      const currentPart = currentV[i] || 0;
      
      if (newPart > currentPart) return true;
      if (newPart < currentPart) return false;
    }
    
    return false;
  }

  /**
   * Show update notification for shared hosting
   */
  showUpdateNotification(updateInfo) {
    // Check if automatic updates are supported
    const automaticSupported = localStorage.getItem('automatic_updates_supported') === 'true';
    
    if (automaticSupported) {
      // Show automatic update notification
      automaticUpdateService.showAutomaticUpdateNotification(updateInfo);
      return;
    }
    
    // Fallback to manual update notification
    // Remove existing notification
    const existingNotification = document.querySelector('.shared-hosting-update-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'shared-hosting-update-notification';
    notification.innerHTML = `
      <div class="update-notification-content">
        <div class="update-icon">📦</div>
        <div class="update-text">
          <strong>Website Update Available</strong>
          <p>Version ${updateInfo.version}: ${updateInfo.title}</p>
          <p class="update-instructions">Download the update package and upload to your cPanel</p>
        </div>
        <div class="update-actions">
          <button class="btn-download-update" onclick="window.sharedHostingUpdateService.downloadUpdate('${updateInfo.id}')">
            📥 Download Update
          </button>
          <button class="btn-view-instructions" onclick="window.sharedHostingUpdateService.showInstructions('${updateInfo.id}')">
            📋 Instructions
          </button>
          <button class="btn-update-later" onclick="this.parentElement.parentElement.parentElement.remove()">
            Later
          </button>
        </div>
      </div>
    `;
    
    // Add comprehensive styles
    const style = document.createElement('style');
    style.textContent = `
      .shared-hosting-update-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        padding: 20px;
        max-width: 400px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        animation: slideIn 0.3s ease-out;
      }
      
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      .update-notification-content {
        display: flex;
        align-items: flex-start;
        gap: 15px;
      }
      
      .update-icon {
        font-size: 28px;
        flex-shrink: 0;
        margin-top: 5px;
      }
      
      .update-text {
        flex: 1;
        margin-bottom: 15px;
      }
      
      .update-text strong {
        display: block;
        margin-bottom: 8px;
        font-size: 1.1rem;
      }
      
      .update-text p {
        margin: 5px 0;
        opacity: 0.95;
        font-size: 0.9rem;
        line-height: 1.4;
      }
      
      .update-instructions {
        font-style: italic;
        opacity: 0.8;
        font-size: 0.85rem !important;
      }
      
      .update-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
      }
      
      .btn-download-update, .btn-view-instructions, .btn-update-later {
        padding: 10px 16px;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
      }
      
      .btn-download-update {
        background: #28a745;
        color: white;
      }
      
      .btn-download-update:hover {
        background: #218838;
        transform: translateY(-1px);
      }
      
      .btn-view-instructions {
        background: #17a2b8;
        color: white;
      }
      
      .btn-view-instructions:hover {
        background: #138496;
        transform: translateY(-1px);
      }
      
      .btn-update-later {
        background: rgba(255,255,255,0.2);
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
      }
      
      .btn-update-later:hover {
        background: rgba(255,255,255,0.3);
      }
      
      @media (max-width: 480px) {
        .shared-hosting-update-notification {
          top: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }
        
        .update-notification-content {
          flex-direction: column;
          text-align: center;
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Auto-hide after 60 seconds for shared hosting (longer than automated)
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 60000);
  }

  /**
   * Download update package
   */
  async downloadUpdate(updateId) {
    try {
      console.log('📥 Preparing update download...');
      
      // Get update details
      const { data: updateInfo, error } = await supabase
        .from('shared_hosting_updates')
        .select('*')
        .eq('id', updateId)
        .single();

      if (error) throw error;

      // Create download link for the build package
      const downloadUrl = updateInfo.download_url || updateInfo.package_url;
      
      if (downloadUrl) {
        // Direct download
        window.open(downloadUrl, '_blank');
      } else {
        // Fallback: show manual download instructions
        this.showManualDownloadInstructions(updateInfo);
      }
      
      // Log download attempt
      await this.logUpdateActivity(updateId, 'download_attempted');
      
    } catch (error) {
      console.error('❌ Failed to download update:', error);
      alert('❌ Failed to download update. Please try again or contact support.');
    }
  }

  /**
   * Show update instructions
   */
  async showInstructions(updateId) {
    try {
      // Get update details
      const { data: updateInfo, error } = await supabase
        .from('shared_hosting_updates')
        .select('*')
        .eq('id', updateId)
        .single();

      if (error) throw error;

      const modal = document.createElement('div');
      modal.className = 'update-instructions-modal';
      modal.innerHTML = `
        <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>📋 Update Instructions</h3>
            <button class="modal-close" onclick="this.parentElement.parentElement.remove()">✕</button>
          </div>
          <div class="modal-body">
            <div class="update-info">
              <h4>Update: ${updateInfo.title}</h4>
              <p><strong>Version:</strong> ${updateInfo.version}</p>
              <p><strong>Description:</strong> ${updateInfo.description}</p>
            </div>
            
            <div class="instructions-section">
              <h4>🔧 Installation Steps:</h4>
              <ol>
                <li><strong>Download</strong> the update package by clicking "📥 Download Update"</li>
                <li><strong>Login</strong> to your cPanel File Manager</li>
                <li><strong>Navigate</strong> to your website's public_html folder</li>
                <li><strong>Backup</strong> your current files (recommended)</li>
                <li><strong>Upload</strong> the downloaded ZIP file</li>
                <li><strong>Extract</strong> the ZIP file in the public_html folder</li>
                <li><strong>Overwrite</strong> existing files when prompted</li>
                <li><strong>Delete</strong> the ZIP file after extraction</li>
                <li><strong>Test</strong> your website to ensure everything works</li>
              </ol>
            </div>
            
            <div class="important-notes">
              <h4>⚠️ Important Notes:</h4>
              <ul>
                <li>Always backup your website before applying updates</li>
                <li>Test on a staging site first if possible</li>
                <li>Contact support if you encounter any issues</li>
                <li>The update will preserve your content and settings</li>
              </ul>
            </div>
            
            ${updateInfo.special_instructions ? `
              <div class="special-instructions">
                <h4>📝 Special Instructions for this Update:</h4>
                <div class="special-content">${updateInfo.special_instructions}</div>
              </div>
            ` : ''}
          </div>
          <div class="modal-footer">
            <button class="btn-download" onclick="window.sharedHostingUpdateService.downloadUpdate('${updateId}')">
              📥 Download Update
            </button>
            <button class="btn-close" onclick="this.parentElement.parentElement.remove()">
              Close
            </button>
          </div>
        </div>
      `;
      
      // Add modal styles
      const modalStyle = document.createElement('style');
      modalStyle.textContent = `
        .update-instructions-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10001;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.7);
        }
        
        .modal-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 12px;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e5e5e5;
        }
        
        .modal-header h3 {
          margin: 0;
          color: #333;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          padding: 5px;
        }
        
        .modal-body {
          padding: 20px;
        }
        
        .update-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .update-info h4 {
          margin: 0 0 10px 0;
          color: #333;
        }
        
        .update-info p {
          margin: 5px 0;
          color: #666;
        }
        
        .instructions-section, .important-notes, .special-instructions {
          margin-bottom: 20px;
        }
        
        .instructions-section h4, .important-notes h4, .special-instructions h4 {
          color: #333;
          margin-bottom: 10px;
        }
        
        .instructions-section ol {
          padding-left: 20px;
        }
        
        .instructions-section li, .important-notes li {
          margin-bottom: 8px;
          line-height: 1.5;
        }
        
        .important-notes {
          background: #fff3cd;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #ffc107;
        }
        
        .special-instructions {
          background: #e3f2fd;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #2196f3;
        }
        
        .modal-footer {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          padding: 20px;
          border-top: 1px solid #e5e5e5;
        }
        
        .btn-download, .btn-close {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        
        .btn-download {
          background: #28a745;
          color: white;
        }
        
        .btn-download:hover {
          background: #218838;
        }
        
        .btn-close {
          background: #6c757d;
          color: white;
        }
        
        .btn-close:hover {
          background: #545b62;
        }
        
        @media (max-width: 640px) {
          .modal-content {
            margin: 20px;
            max-width: none;
            width: calc(100% - 40px);
          }
        }
      `;
      
      document.head.appendChild(modalStyle);
      document.body.appendChild(modal);
      
      // Log instruction view
      await this.logUpdateActivity(updateId, 'instructions_viewed');
      
    } catch (error) {
      console.error('❌ Failed to show instructions:', error);
      alert('❌ Failed to load instructions. Please try again.');
    }
  }

  /**
   * Mark update as applied (when user visits after update)
   */
  async markUpdateApplied(version) {
    try {
      // Update client version
      this.currentVersion = version;
      localStorage.setItem('theme_version', version);
      
      // Update version meta tag
      let versionMeta = document.querySelector('meta[name="theme-version"]');
      if (!versionMeta) {
        versionMeta = document.createElement('meta');
        versionMeta.setAttribute('name', 'theme-version');
        document.head.appendChild(versionMeta);
      }
      versionMeta.setAttribute('content', version);
      
      // Update client record
      await this.registerClient();
      
      // Log successful update
      const pendingUpdate = localStorage.getItem('pending_update');
      if (pendingUpdate) {
        const updateInfo = JSON.parse(pendingUpdate);
        await this.logUpdateActivity(updateInfo.id, 'applied_successfully');
        localStorage.removeItem('pending_update');
      }
      
      console.log('✅ Update marked as applied:', version);
      
    } catch (error) {
      console.error('❌ Failed to mark update as applied:', error);
    }
  }

  /**
   * Log update activity
   */
  async logUpdateActivity(updateId, activity) {
    try {
      const { error } = await supabase
        .from('shared_hosting_update_logs')
        .insert({
          update_id: updateId,
          client_id: this.clientId,
          activity: activity,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        });

      if (error) throw error;
      
    } catch (error) {
      console.error('❌ Failed to log activity:', error);
    }
  }

  /**
   * Setup periodic update checking
   */
  setupUpdateChecking() {
    // Check on page load
    this.checkForUpdates();
    
    // Check daily (less frequent for shared hosting)
    setInterval(() => {
      this.checkForUpdates();
    }, this.checkInterval);
    
    // Check when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdates();
      }
    });
  }

  /**
   * Show manual download instructions
   */
  showManualDownloadInstructions(updateInfo) {
    alert(`
📦 Manual Download Required

Update: ${updateInfo.title}
Version: ${updateInfo.version}

Please contact your website administrator to get the update package.

Instructions:
1. Request the update package for version ${updateInfo.version}
2. Download the ZIP file when provided
3. Upload to your cPanel File Manager
4. Extract in your public_html folder
5. Test your website

Contact support if you need assistance.
    `);
  }
}

// Create singleton instance
export const sharedHostingUpdateService = new SharedHostingUpdateService();

// Make it globally available
window.sharedHostingUpdateService = sharedHostingUpdateService;

// Auto-initialize on import
if (typeof window !== 'undefined') {
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      sharedHostingUpdateService.initialize();
    });
  } else {
    sharedHostingUpdateService.initialize();
  }
} 