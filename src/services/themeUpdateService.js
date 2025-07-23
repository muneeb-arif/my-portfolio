import { supabase } from '../config/supabase';
import { portfolioConfigService } from './supabaseService';

/**
 * Theme Update Service
 * Handles centralized theme updates and distribution
 */
export class ThemeUpdateService {
  constructor() {
    this.currentVersion = '1.0.0';
    this.updateChannel = 'stable'; // 'stable', 'beta', 'alpha'
    this.clientId = null;
    this.isUpdateAvailable = false;
    this.lastCheckTime = null;
    this.updateCheckInterval = 6 * 60 * 60 * 1000; // 6 hours
  }

  /**
   * Initialize the update service
   */
  async initialize() {
    try {
      // Generate or retrieve client ID
      this.clientId = this.getOrCreateClientId();
      
      // Get current version from package.json or local storage
      this.currentVersion = await this.getCurrentVersion();
      
      // Register this client instance
      await this.registerClient();
      
      // Set up periodic update checking
      this.setupUpdateChecking();
      
      console.log('🔄 Theme Update Service initialized:', {
        clientId: this.clientId,
        currentVersion: this.currentVersion,
        updateChannel: this.updateChannel
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to initialize Theme Update Service:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get or create unique client ID
   */
  getOrCreateClientId() {
    let clientId = localStorage.getItem('theme_client_id');
    if (!clientId) {
      clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('theme_client_id', clientId);
    }
    return clientId;
  }

  /**
   * Get current theme version
   */
  async getCurrentVersion() {
    const storedVersion = localStorage.getItem('theme_version');
    if (storedVersion) {
      return storedVersion;
    }
    
    // Try to get from package.json or default
    try {
      const packageJson = await fetch('/package.json');
      if (packageJson.ok) {
        const pkg = await packageJson.json();
        return pkg.version || '1.0.0';
      }
    } catch (error) {
      console.log('📦 Using default version');
    }
    
    return '1.0.0';
  }

  /**
   * Register client with the central service
   */
  async registerClient() {
    try {
      const { data, error } = await supabase
        .from('theme_clients')
        .upsert({
          client_id: this.clientId,
          domain: window.location.hostname,
          current_version: this.currentVersion,
          update_channel: this.updateChannel,
          last_seen: new Date().toISOString(),
          user_agent: navigator.userAgent,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }, {
          onConflict: 'client_id'
        });

      if (error) throw error;
      
      console.log('✅ Client registered successfully');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Failed to register client:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check for theme updates
   */
  async checkForUpdates(force = false) {
    try {
      const now = Date.now();
      
      // Skip if recently checked (unless forced)
      if (!force && this.lastCheckTime && (now - this.lastCheckTime) < this.updateCheckInterval) {
        console.log('⏭️ Update check skipped (recently checked)');
        return { success: true, hasUpdate: this.isUpdateAvailable };
      }

      console.log('🔍 Checking for theme updates...');
      
      const { data: updateInfo, error } = await supabase
        .from('theme_updates')
        .select('*')
        .eq('channel', this.updateChannel)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      this.lastCheckTime = now;
      localStorage.setItem('theme_last_check', now.toString());

      if (!updateInfo || updateInfo.length === 0) {
        console.log('✅ No updates available');
        this.isUpdateAvailable = false;
        return { success: true, hasUpdate: false };
      }

      const latestUpdate = updateInfo[0];
      const hasUpdate = this.isVersionNewer(latestUpdate.version, this.currentVersion);
      
      this.isUpdateAvailable = hasUpdate;
      
      if (hasUpdate) {
        console.log('🆕 Update available:', {
          current: this.currentVersion,
          latest: latestUpdate.version,
          title: latestUpdate.title
        });
        
        // Show notification to user
        this.showUpdateNotification(latestUpdate);
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
   * Show update notification
   */
  showUpdateNotification(updateInfo) {
    // Create a non-intrusive notification
    const notification = document.createElement('div');
    notification.className = 'theme-update-notification';
    notification.innerHTML = `
      <div class="update-notification-content">
        <div class="update-icon">🆕</div>
        <div class="update-text">
          <strong>Theme Update Available</strong>
          <p>Version ${updateInfo.version}: ${updateInfo.title}</p>
        </div>
        <div class="update-actions">
          <button class="btn-update-now" onclick="window.themeUpdateService.applyUpdate('${updateInfo.id}')">
            Update Now
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
      .theme-update-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 1px solid #e5e5e5;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        padding: 16px;
        max-width: 350px;
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
        align-items: center;
        gap: 12px;
      }
      
      .update-icon {
        font-size: 24px;
        flex-shrink: 0;
      }
      
      .update-text {
        flex: 1;
        font-size: 14px;
      }
      
      .update-text strong {
        color: #333;
        margin-bottom: 4px;
        display: block;
      }
      
      .update-text p {
        color: #666;
        margin: 0;
        font-size: 12px;
      }
      
      .update-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .btn-update-now, .btn-update-later {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-update-now {
        background: #007bff;
        color: white;
      }
      
      .btn-update-now:hover {
        background: #0056b3;
      }
      
      .btn-update-later {
        background: #f8f9fa;
        color: #666;
      }
      
      .btn-update-later:hover {
        background: #e9ecef;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Auto-hide after 30 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 30000);
  }

  /**
   * Apply theme update
   */
  async applyUpdate(updateId) {
    try {
      console.log('🔄 Applying theme update...');
      
      // Show loading state
      this.showUpdateProgress('Downloading update...');
      
      // Get update details
      const { data: updateInfo, error: fetchError } = await supabase
        .from('theme_updates')
        .select('*')
        .eq('id', updateId)
        .single();

      if (fetchError) throw fetchError;

      // Download update files
      const updateFiles = await this.downloadUpdateFiles(updateInfo);
      
      this.showUpdateProgress('Applying updates...');
      
      // Apply updates
      await this.applyUpdateFiles(updateFiles);
      
      // Update version
      this.currentVersion = updateInfo.version;
      localStorage.setItem('theme_version', this.currentVersion);
      
      // Update client record
      await this.updateClientVersion(updateInfo.version);
      
      // Log successful update
      await this.logUpdateApplication(updateId, 'success');
      
      this.showUpdateProgress('Update complete! Clearing data and logging out...', true);
      
      // Clear all data and logout
      setTimeout(() => {
        // Clear all localStorage data
        localStorage.clear();
        
        // Clear session storage
        sessionStorage.clear();
        
        // Clear cookies
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // Redirect to main site
        if (window.location.pathname.includes('/dashboard')) {
          window.location.replace('/');
        } else {
          window.location.reload();
        }
      }, 2000);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to apply update:', error);
      
      // Log failed update
      await this.logUpdateApplication(updateId, 'failed', error.message);
      
      this.showUpdateProgress('Update failed. Please try again.', false, true);
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Download update files
   */
  async downloadUpdateFiles(updateInfo) {
    const updateFiles = [];
    
    if (updateInfo.files && updateInfo.files.length > 0) {
      for (const file of updateInfo.files) {
        const response = await fetch(file.url);
        if (!response.ok) throw new Error(`Failed to download ${file.path}`);
        
        const content = await response.text();
        updateFiles.push({
          path: file.path,
          content: content,
          type: file.type || 'text'
        });
      }
    }
    
    return updateFiles;
  }

  /**
   * Apply update files
   */
  async applyUpdateFiles(updateFiles) {
    // Note: In a real implementation, you'd need a more sophisticated
    // file update mechanism. This is a simplified version.
    
    for (const file of updateFiles) {
      switch (file.type) {
        case 'css':
          await this.updateStylesheet(file.path, file.content);
          break;
        case 'js':
          await this.updateScript(file.path, file.content);
          break;
        case 'config':
          await this.updateConfig(file.path, file.content);
          break;
        default:
          console.log(`⚠️ Unknown file type: ${file.type}`);
      }
    }
  }

  /**
   * Update stylesheet
   */
  async updateStylesheet(path, content) {
    // Remove existing stylesheet
    const existingStyle = document.querySelector(`style[data-update-path="${path}"]`);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Add new stylesheet
    const style = document.createElement('style');
    style.setAttribute('data-update-path', path);
    style.textContent = content;
    document.head.appendChild(style);
  }

  /**
   * Update script
   */
  async updateScript(path, content) {
    // For security reasons, we'll store the script and require reload
    localStorage.setItem(`theme_update_script_${path}`, content);
    console.log(`📝 Script update queued: ${path}`);
  }

  /**
   * Update configuration
   */
  async updateConfig(path, content) {
    try {
      const config = JSON.parse(content);
      localStorage.setItem(`theme_config_${path}`, JSON.stringify(config));
      console.log(`⚙️ Config updated: ${path}`);
    } catch (error) {
      console.error(`❌ Failed to update config ${path}:`, error);
    }
  }

  /**
   * Show update progress
   */
  showUpdateProgress(message, isComplete = false, isError = false) {
    let progressDiv = document.querySelector('.theme-update-progress');
    
    if (!progressDiv) {
      progressDiv = document.createElement('div');
      progressDiv.className = 'theme-update-progress';
      document.body.appendChild(progressDiv);
    }
    
    progressDiv.innerHTML = `
      <div class="progress-content">
        <div class="progress-icon">
          ${isError ? '❌' : isComplete ? '✅' : '🔄'}
        </div>
        <div class="progress-message">${message}</div>
        ${!isComplete && !isError ? '<div class="progress-spinner"></div>' : ''}
      </div>
    `;
    
    // Add styles if not present
    if (!document.querySelector('.theme-update-progress-styles')) {
      const style = document.createElement('style');
      style.className = 'theme-update-progress-styles';
      style.textContent = `
        .theme-update-progress {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          padding: 24px;
          z-index: 10001;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .progress-content {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 300px;
        }
        
        .progress-icon {
          font-size: 24px;
          flex-shrink: 0;
        }
        
        .progress-message {
          flex: 1;
          font-size: 14px;
          color: #333;
        }
        
        .progress-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Auto-hide if complete or error
    if (isComplete || isError) {
      setTimeout(() => {
        if (progressDiv.parentElement) {
          progressDiv.remove();
        }
      }, isError ? 5000 : 2000);
    }
  }

  /**
   * Update client version record
   */
  async updateClientVersion(version) {
    try {
      const { error } = await supabase
        .from('theme_clients')
        .update({
          current_version: version,
          last_updated: new Date().toISOString()
        })
        .eq('client_id', this.clientId);

      if (error) throw error;
      
      console.log('✅ Client version updated:', version);
    } catch (error) {
      console.error('❌ Failed to update client version:', error);
    }
  }

  /**
   * Log update application
   */
  async logUpdateApplication(updateId, status, errorMessage = null) {
    try {
      const { error } = await supabase
        .from('theme_update_logs')
        .insert({
          update_id: updateId,
          client_id: this.clientId,
          status: status,
          error_message: errorMessage,
          applied_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('❌ Failed to log update:', error);
    }
  }

  /**
   * Setup periodic update checking
   */
  setupUpdateChecking() {
    // Check immediately
    this.checkForUpdates();
    
    // Set up interval
    setInterval(() => {
      this.checkForUpdates();
    }, this.updateCheckInterval);
    
    // Check when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdates();
      }
    });
  }

  /**
   * Manual update check (for dashboard)
   */
  async forceUpdateCheck() {
    return await this.checkForUpdates(true);
  }

  /**
   * Get update statistics
   */
  async getUpdateStats() {
    try {
      const { data: stats, error } = await supabase
        .from('theme_update_stats')
        .select('*')
        .eq('client_id', this.clientId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      return { success: true, stats: stats || [] };
    } catch (error) {
      console.error('❌ Failed to get update stats:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
export const themeUpdateService = new ThemeUpdateService();

// Make it globally available for update notifications
window.themeUpdateService = themeUpdateService;

// Auto-initialize on import
if (typeof window !== 'undefined') {
  themeUpdateService.initialize();
} 