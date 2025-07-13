import { apiService } from './apiService';
import { getCurrentUser } from './authUtils';

// ================ SETTINGS OPERATIONS ================

export const settingsService = {
  // Get all settings for a user
  async getSettings() {
    try {
      console.log('🔍 Getting user from auth...');
      const user = await getCurrentUser();
      if (!user) {
        console.log('❌ No authenticated user found');
        throw new Error('Not authenticated');
      }
      console.log('✅ User authenticated:', user.id);

      console.log('🔍 Fetching settings from API...');
      const response = await apiService.getSettings();
      
      if (!response.success) {
        console.error('❌ API error:', response.error);
        throw new Error(response.error || 'Failed to fetch settings');
      }
      
      const settingsData = response.data || {};
      console.log('📊 Raw settings data:', settingsData);
      
      // The API returns settings as an object, so no conversion needed
      console.log('🔧 Processed settings object:', settingsData);
      return settingsData;
    } catch (error) {
      console.error('❌ Error in getSettings:', error);
      return {};
    }
  },

  // Get a specific setting
  async getSetting(key) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await apiService.getSettings();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch settings');
      }
      
      const settings = response.data || {};
      return settings[key] || null;
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return null;
    }
  },

  // Update or create a setting
  async updateSetting(key, value) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await apiService.updateSettings({ [key]: value });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update setting');
      }
      
      return true;
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      throw error;
    }
  },

  // Update multiple settings at once
  async updateMultipleSettings(settings) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await apiService.updateSettings(settings);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update settings');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating multiple settings:', error);
      throw error;
    }
  },

  // Delete a setting (not supported by API, but keeping for compatibility)
  async deleteSetting(key) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // Set the setting to null to effectively delete it
      const response = await apiService.updateSettings({ [key]: null });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete setting');
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting setting ${key}:`, error);
      throw error;
    }
  },

  // Get default appearance settings
  getDefaultAppearanceSettings() {
    return {
      logo_type: 'initials', // 'initials' or 'image'
      logo_initials: 'MA',
      logo_image: '',
      hero_banner_image: '/images/hero-bg.png',
      avatar_image: '/images/profile/avatar.jpeg',
      banner_name: 'Muneeb Arif',
      banner_title: 'Principal Software Engineer',
      banner_tagline: 'I craft dreams, not projects.',
      resume_file: '/images/profile/principal-software-engineer-muneeb.resume.pdf',
      social_email: 'muneeb@example.com',
      social_github: 'https://github.com/muneebarif',
      social_instagram: '',
      social_facebook: '',
      copyright_text: '© 2024 Muneeb Arif. All rights reserved.'
    };
  }
}; 