import { supabase } from '../config/supabase';

/**
 * Debug Logger for Automatic Updates
 */
class AutoUpdateDebugLogger {
  constructor() {
    this.logs = [];
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    this.maxLogs = 500; // Keep last 500 log entries
  }

  log(level, step, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      sessionId: this.sessionId,
      level,
      step,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : null,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.logs.push(logEntry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Store in localStorage for debugging
    try {
      localStorage.setItem('auto_update_debug_logs', JSON.stringify(this.logs));
      localStorage.setItem('auto_update_last_session', this.sessionId);
    } catch (e) {
      console.warn('Failed to store debug logs:', e);
    }

    // Console logging with better formatting
    const prefix = `[AutoUpdate:${step}]`;
    switch (level) {
      case 'info':
        console.log(`%c${prefix} ${message}`, 'color: blue', data || '');
        break;
      case 'success':
        console.log(`%c${prefix} ${message}`, 'color: green', data || '');
        break;
      case 'warn':
        console.warn(`${prefix} ${message}`, data || '');
        break;
      case 'error':
        console.error(`${prefix} ${message}`, data || '');
        break;
      default:
        console.log(`${prefix} ${message}`, data || '');
    }
  }

  getDebugReport() {
    return {
      sessionId: this.sessionId,
      totalLogs: this.logs.length,
      logs: this.logs,
      systemInfo: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        localStorage: {
          clientId: localStorage.getItem('auto_update_client_id'),
          version: localStorage.getItem('theme_version'),
          automaticUpdatesEnabled: localStorage.getItem('automatic_updates_enabled'),
          automaticUpdatesSupported: localStorage.getItem('automatic_updates_supported')
        }
      }
    };
  }

  exportLogs() {
    const report = this.getDebugReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auto-update-debug-${this.sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

/**
 * Automatic Update Service
 * Handles server-side automatic updates for shared hosting
 */
export class AutomaticUpdateService {
  constructor() {
    this.apiKey = 'sk_update_2024_portfolio_secure_key_255d78d54885303d0fc7564b88b70527'; // Should match PHP endpoint
    this.updateEndpoint = this.getUpdateEndpointUrl();
    this.clientId = this.getOrCreateClientId();
    this.debugLogger = new AutoUpdateDebugLogger();
    
    // Initialize debug logging
    this.debugLogger.log('info', 'init', 'AutomaticUpdateService initialized', {
      endpoint: this.updateEndpoint,
      clientId: this.clientId,
      origin: window.location.origin
    });
  }

  /**
   * Get the correct update endpoint URL
   * Handles development vs production environments
   */
  getUpdateEndpointUrl() {
    // Check for environment variable first
    if (process.env.REACT_APP_UPDATE_ENDPOINT) {
      return process.env.REACT_APP_UPDATE_ENDPOINT;
    }
    
    // Detect development environment
    // const isDevelopment = process.env.NODE_ENV === 'development' || 
    //                       window.location.port === '3000' ||
    //                       window.location.hostname === 'localhost' && window.location.port;
    
    // if (isDevelopment) {
    //   // For development, use a separate PHP server or configured endpoint
    //   return process.env.REACT_APP_DEV_UPDATE_ENDPOINT || 'http://localhost:8080/update-endpoint.php';
    // }
    
    // For production, use the same origin
    return window.location.origin + '/update-endpoint.php';
  }

  /**
   * Get or create client ID
   */
  getOrCreateClientId() {
    let clientId = localStorage.getItem('auto_update_client_id');
    if (!clientId) {
      clientId = 'auto_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('auto_update_client_id', clientId);
      this.debugLogger?.log('info', 'client_id', 'Generated new client ID', { clientId });
    } else {
      this.debugLogger?.log('info', 'client_id', 'Using existing client ID', { clientId });
    }
    return clientId;
  }

  /**
   * Check if automatic updates are supported
   */
  async checkSupport() {
    this.debugLogger.log('info', 'check_support', 'Starting support check', {
      endpoint: this.updateEndpoint,
      method: 'POST'
    });

    try {
      const requestBody = {
        api_key: this.apiKey,
        action: 'check_support'
      };

      this.debugLogger.log('info', 'check_support', 'Sending support check request', {
        requestBody: { ...requestBody, api_key: 'REDACTED' },
        headers: { 'Content-Type': 'application/json' }
      });

      const startTime = Date.now();
      const response = await fetch(this.updateEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const duration = Date.now() - startTime;
      
      this.debugLogger.log('info', 'check_support', 'Received response', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        duration: `${duration}ms`,
        url: response.url
      });

      if (response.status === 404) {
        this.debugLogger.log('warn', 'check_support', 'Endpoint not found - automatic updates not supported', {
          status: 404,
          endpoint: this.updateEndpoint
        });
        localStorage.setItem('automatic_updates_supported', 'false');
        return false;
      }

      if (!response.ok) {
        this.debugLogger.log('error', 'check_support', 'Non-OK response', {
          status: response.status,
          statusText: response.statusText
        });
        localStorage.setItem('automatic_updates_supported', 'false');
        return false;
      }

      const responseText = await response.text();
      this.debugLogger.log('info', 'check_support', 'Response body received', {
        bodyLength: responseText.length,
        bodyPreview: responseText.substring(0, 200)
      });

      let result;
      try {
        result = JSON.parse(responseText);
        this.debugLogger.log('success', 'check_support', 'JSON parsed successfully', result);
      } catch (parseError) {
        this.debugLogger.log('error', 'check_support', 'Failed to parse JSON response', {
          parseError: parseError.message,
          responseText: responseText.substring(0, 500)
        });
        localStorage.setItem('automatic_updates_supported', 'false');
        return false;
      }

      if (result.success) {
        this.debugLogger.log('success', 'check_support', 'Automatic updates supported', {
          serverInfo: result.server_info,
          phpVersion: result.php_version
        });
        localStorage.setItem('automatic_updates_supported', 'true');
        return true;
      } else {
        this.debugLogger.log('warn', 'check_support', 'Server reports no support', result);
        localStorage.setItem('automatic_updates_supported', 'false');
        return false;
      }

    } catch (error) {
      this.debugLogger.log('error', 'check_support', 'Exception during support check', {
        error: error.message,
        name: error.name,
        stack: error.stack,
        endpoint: this.updateEndpoint
      });
      localStorage.setItem('automatic_updates_supported', 'false');
      return false;
    }
  }

  /**
   * Apply automatic update
   */
  async applyUpdate(updateInfo, options = {}) {
    const updateId = updateInfo.id || 'unknown';
    const createBackup = options.createBackup !== undefined ? options.createBackup : true;
    const progressCallback = options.progressCallback || null;

    this.debugLogger.log('info', 'apply_update', 'Starting update process', {
      updateId,
      version: updateInfo.version,
      packageUrl: updateInfo.package_url,
      createBackup,
      hasProgressCallback: !!progressCallback
    });

    try {
      // Validate update info
      if (!updateInfo.package_url || !updateInfo.version) {
        const error = 'Invalid update information - missing package_url or version';
        this.debugLogger.log('error', 'apply_update', error, {
          updateInfo: {
            id: updateInfo.id,
            version: updateInfo.version,
            package_url: updateInfo.package_url ? 'PROVIDED' : 'MISSING',
            title: updateInfo.title
          }
        });
        throw new Error(error);
      }

      this.debugLogger.log('info', 'apply_update', 'Update info validated', {
        version: updateInfo.version,
        title: updateInfo.title,
        packageUrlLength: updateInfo.package_url.length
      });

      if (progressCallback) {
        progressCallback('🔍 Checking server capabilities...', 'info');
      }

      // Check if endpoint is available
      this.debugLogger.log('info', 'apply_update', 'Checking server support');
      const isSupported = await this.checkSupport();
      
      if (!isSupported) {
        const error = 'Automatic updates not supported on this server';
        this.debugLogger.log('error', 'apply_update', error);
        throw new Error(error);
      }

      this.debugLogger.log('success', 'apply_update', 'Server support confirmed');

      if (progressCallback) {
        progressCallback('📦 Initiating automatic update...', 'info');
      }

      // Log update attempt
      try {
        this.debugLogger.log('info', 'apply_update', 'Logging update attempt to database');
        await this.logActivity(updateInfo.id, 'auto_update_started');
        this.debugLogger.log('success', 'apply_update', 'Update attempt logged to database');
      } catch (logError) {
        this.debugLogger.log('warn', 'apply_update', 'Failed to log to database', {
          error: logError.message
        });
      }

      // Prepare update request
      const requestBody = {
        api_key: this.apiKey,
        download_url: updateInfo.package_url,
        version: updateInfo.version,
        create_backup: createBackup,
        client_id: this.clientId
      };

      this.debugLogger.log('info', 'apply_update', 'Preparing update request', {
        requestBody: { ...requestBody, api_key: 'REDACTED', download_url: `${updateInfo.package_url.substring(0, 50)}...` },
        endpoint: this.updateEndpoint
      });

      // Send update request to server
      if (progressCallback) {
        progressCallback('🚀 Sending update request to server...', 'info');
      }

      const updateStartTime = Date.now();
      this.debugLogger.log('info', 'apply_update', 'Sending update request');

      const response = await fetch(this.updateEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const updateDuration = Date.now() - updateStartTime;
      
      this.debugLogger.log('info', 'apply_update', 'Update request completed', {
        status: response.status,
        statusText: response.statusText,
        duration: `${updateDuration}ms`,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (progressCallback) {
        progressCallback('📄 Processing server response...', 'info');
      }

      let result;
      let responseText;
      try {
        responseText = await response.text();
        this.debugLogger.log('info', 'apply_update', 'Response body received', {
          bodyLength: responseText.length,
          bodyPreview: responseText.substring(0, 300)
        });
        
        result = JSON.parse(responseText);
        this.debugLogger.log('info', 'apply_update', 'Response parsed successfully', {
          success: result.success,
          hasError: !!result.error,
          hasMessage: !!result.message
        });
      } catch (parseError) {
        this.debugLogger.log('error', 'apply_update', 'Failed to parse server response', {
          parseError: parseError.message,
          responseStatus: response.status,
          responseText: responseText ? responseText.substring(0, 500) : 'Unable to read response body'
        });
        throw new Error(`Server response parsing failed: ${parseError.message}`);
      }

      if (!response.ok || !result.success) {
        const error = result.error || `Server error: ${response.status} ${response.statusText}`;
        this.debugLogger.log('error', 'apply_update', 'Update failed on server', {
          responseOk: response.ok,
          resultSuccess: result.success,
          error: result.error,
          serverMessage: result.message,
          fullResult: result
        });
        throw new Error(error);
      }

      this.debugLogger.log('success', 'apply_update', 'Update completed successfully', {
        version: updateInfo.version,
        filesUpdated: result.files_updated?.length || 0,
        backupCreated: !!result.backup_created,
        serverMessage: result.message
      });

      if (progressCallback) {
        progressCallback('✅ Update completed successfully!', 'success');
        progressCallback(`📁 Files updated: ${result.files_updated?.length || 0}`, 'info');
        if (result.backup_created) {
          progressCallback('💾 Backup created successfully', 'info');
        }
      }

      // Log successful update
      try {
        await this.logActivity(updateInfo.id, 'auto_update_completed', {
          files_updated: result.files_updated?.length || 0,
          backup_created: !!result.backup_created,
          duration_ms: updateDuration
        });
        this.debugLogger.log('success', 'apply_update', 'Success logged to database');
      } catch (logError) {
        this.debugLogger.log('warn', 'apply_update', 'Failed to log success to database', {
          error: logError.message
        });
      }

      // Update local version
      this.updateLocalVersion(updateInfo.version);
      this.debugLogger.log('info', 'apply_update', 'Local version updated', {
        newVersion: updateInfo.version
      });

      return {
        success: true,
        message: result.message,
        filesUpdated: result.files_updated?.length || 0,
        backupCreated: result.backup_created,
        timestamp: result.timestamp,
        duration: updateDuration
      };

    } catch (error) {
      this.debugLogger.log('error', 'apply_update', 'Update process failed', {
        error: error.message,
        name: error.name,
        stack: error.stack,
        updateId,
        version: updateInfo.version
      });
      
      // Log error
      try {
        await this.logActivity(updateInfo.id, 'auto_update_failed', {
          error: error.message,
          error_type: error.name
        });
      } catch (logError) {
        this.debugLogger.log('error', 'apply_update', 'Failed to log error to database', {
          logError: logError.message,
          originalError: error.message
        });
      }

      if (progressCallback) {
        progressCallback(`❌ Update failed: ${error.message}`, 'error');
      }

      return {
        success: false,
        error: error.message,
        debugReport: this.debugLogger.getDebugReport()
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

  /**
   * Get debug logs for troubleshooting
   */
  getDebugLogs() {
    return this.debugLogger.getDebugReport();
  }

  /**
   * Export debug logs as downloadable file
   */
  exportDebugLogs() {
    this.debugLogger.exportLogs();
  }

  /**
   * Clear debug logs
   */
  clearDebugLogs() {
    this.debugLogger.logs = [];
    localStorage.removeItem('auto_update_debug_logs');
    localStorage.removeItem('auto_update_last_session');
    this.debugLogger.log('info', 'debug', 'Debug logs cleared');
  }
}

// Create singleton instance
export const automaticUpdateService = new AutomaticUpdateService();

// Make it globally available
window.automaticUpdateService = automaticUpdateService; 