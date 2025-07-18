import { apiService } from './apiService';

/**
 * Shared Hosting Update Service
 * Handles theme updates for shared hosting environments (cPanel)
 * Now uses local API instead of Supabase
 */
export class SharedHostingUpdateService {
  constructor() {
    this.clientId = this.getOrCreateClientId();
    this.currentVersion = this.getCurrentVersion();
    this.checkInterval = 24 * 60 * 60 * 1000; // Check daily for shared hosting
  }

  /**
   * Get or create a unique client ID
   */
  getOrCreateClientId() {
    let clientId = localStorage.getItem('shared_hosting_client_id');
    if (!clientId) {
      clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('shared_hosting_client_id', clientId);
    }
    return clientId;
  }

  /**
   * Get current version from localStorage
   */
  getCurrentVersion() {
    return localStorage.getItem('theme_version') || '1.0.0';
  }

  /**
   * Check for available updates
   */
  async checkForUpdates() {
    try {
      console.log('🔍 Checking for shared hosting updates...');
      
      const result = await apiService.getSharedHostingUpdates({
        is_active: true,
        limit: 1,
        order: 'created_at DESC'
      });

      if (!result.success) {
        console.warn('❌ Failed to check for updates:', result.error);
        return null;
      }

      const updates = result.data || [];
      if (updates.length === 0) {
        console.log('📭 No active updates available');
        return null;
      }

      const latestUpdate = updates[0];
      const hasNewerUpdate = this.isVersionNewer(latestUpdate.version, this.currentVersion);
      
      if (hasNewerUpdate) {
        console.log('🆕 New update available:', latestUpdate.version);
        return latestUpdate;
      } else {
        console.log('✅ Already on latest version:', this.currentVersion);
        return null;
      }
    } catch (error) {
      console.error('❌ Error checking for updates:', error);
      return null;
    }
  }

  /**
   * Log update activity
   */
  async logActivity(updateId, activity, details = {}) {
    try {
      const logData = {
        update_id: updateId,
          client_id: this.clientId,
        activity: activity,
        details: {
          ...details,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      };

      // For now, just log to console
      console.log('📝 Activity logged:', logData);
      
      // TODO: Implement actual logging to database
      // await apiService.logSharedHostingActivity(logData);
      
    } catch (error) {
      console.error('❌ Failed to log activity:', error);
    }
  }

  /**
   * Apply update manually (for shared hosting)
   */
  async applyUpdate(update) {
    try {
      console.log('🚀 Applying update:', update.version);
      
      // Log the attempt
      await this.logActivity(update.id, 'update_attempted');
      
      // Show instructions to user
      const instructions = this.generateInstructions(update);
        
        // Store update info for manual application
      localStorage.setItem('pending_update', JSON.stringify(update));
      localStorage.setItem('update_instructions', instructions);

      // Return instructions for user to follow
      return {
        success: true,
        instructions: instructions,
        update: update
      };
      
    } catch (error) {
      console.error('❌ Failed to apply update:', error);
      await this.logActivity(update.id, 'update_failed', { error: error.message });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate manual update instructions
   */
  generateInstructions(update) {
    let instructions = `# Manual Update Instructions for v${update.version}\n\n`;
    
    instructions += `## Update: ${update.title}\n`;
    instructions += `${update.description}\n\n`;
    
    instructions += `## Steps to Apply:\n\n`;
    instructions += `1. **Backup your current site**\n`;
    instructions += `   - Download a backup of your current files\n`;
    instructions += `   - Export your database if applicable\n\n`;
    
    instructions += `2. **Download the update package**\n`;
    instructions += `   - Click the download link below\n`;
    instructions += `   - Save the ZIP file to your computer\n`;
    instructions += `   - Extract the ZIP file to a temporary directory\n\n`;
    
    instructions += `3. **Upload and extract**\n`;
    instructions += `   - Upload the extracted ZIP file to your hosting via cPanel File Manager\n`;
    instructions += `   - Extract the files in your public_html directory\n`;
    instructions += `   - Replace existing files when prompted\n\n`;
    
    instructions += `4. **Verify the update**\n`;
    instructions += `   - Visit your website to ensure it's working\n`;
    instructions += `   - Check that the version has been updated\n\n`;
    
    if (update.files && update.files.length > 0) {
      instructions += `## Files to Update:\n\n`;
      update.files.forEach(file => {
        instructions += `- ${file.path} (${file.type})\n`;
      });
      instructions += `\n`;
    }
    
    instructions += `## Download Link:\n`;
    instructions += `[Download Update Package](${update.package_url || '#'})\n\n`;
    
    instructions += `## Support:\n`;
    instructions += `If you encounter any issues, please contact support.\n`;
    
    return instructions;
  }

  /**
   * Compare version numbers
   */
  isVersionNewer(newVersion, currentVersion) {
    const newParts = newVersion.split('.').map(Number);
    const currentParts = currentVersion.split('.').map(Number);
    
    for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
      const newPart = newParts[i] || 0;
      const currentPart = currentParts[i] || 0;
      
      if (newPart > currentPart) return true;
      if (newPart < currentPart) return false;
    }
    
    return false; // Same version
  }

  /**
   * Get update statistics
   */
  async getUpdateStats() {
    try {
      const result = await apiService.getSharedHostingUpdates({
        is_active: true
      });

      if (!result.success) {
        return {
          totalUpdates: 0,
          activeUpdates: 0,
          latestVersion: this.currentVersion
        };
      }

      const updates = result.data || [];
      const activeUpdates = updates.filter(u => u.is_active);

      return {
        totalUpdates: updates.length,
        activeUpdates: activeUpdates.length,
        latestVersion: activeUpdates.length > 0 ? activeUpdates[0].version : this.currentVersion
      };
    } catch (error) {
      console.error('❌ Failed to get update stats:', error);
      return {
        totalUpdates: 0,
        activeUpdates: 0,
        latestVersion: this.currentVersion
      };
    }
  }
}

// Export singleton instance
export const sharedHostingUpdateService = new SharedHostingUpdateService();