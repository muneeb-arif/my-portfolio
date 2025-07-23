import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { settingsService } from './settingsService';
import portfolioService from './portfolioService';
// import { portfolioConfig } from '../config/portfolio';
import { applyTheme } from '../utils/themeUtils';
import { updateManifest } from '../utils/manifestUtils';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Enhanced Settings Provider with single global loading
export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Check if we're in dashboard mode (memoized to prevent re-calculations)
  const isDashboard = useMemo(() => window.location.pathname === '/dashboard', []);

  // Enhanced default settings - single source of truth
  const defaultSettings = useMemo(() => ({
    // Core Identity
    banner_name: 'Muneeb Arif',
    banner_title: 'Principal Software Engineer',
    banner_tagline: 'I craft dreams, not projects.',
    site_name: 'Portfolio',
    site_url: 'https://your-domain.com',
    
    // Visual Assets
    logo_type: 'initials',
    logo_initials: 'MA',
    logo_image: '',
    hero_banner_image: '/images/hero-bg.png',
    hero_banner_zoom: 100,
    hero_banner_position_x: 50,
    hero_banner_position_y: 50,
    avatar_image: '/images/profile/avatar.jpeg',
    avatar_zoom: 100,
    avatar_position_x: 50,
    avatar_position_y: 50,
    whatsapp_preview_image: '', // Optimized image for WhatsApp sharing
    resume_file: '/images/profile/principal-software-engineer-muneeb.resume.pdf',
    show_resume_download: true,
    
    // Social & Contact
    social_email: 'muneeb@example.com',
    social_github: 'https://github.com/muneebarif',
    social_instagram: '',
    social_facebook: '',
    phone_number: '', // Phone number for mobile call functionality
    address: '', // Business address for footer display
    map_location_url: '', // Map location URL for footer display
    
    // Section Visibility (all sections visible by default)
    section_hero_visible: true,
    section_portfolio_visible: true,
    section_technologies_visible: true,
    section_domains_visible: true,
    section_project_cycle_visible: true,
    section_prompts_visible: false,
    
    // Styling & Theme
    theme_name: 'sand',
    theme_color: '#E9CBA7',
    
    // Legal
    copyright_text: '© 2024 Muneeb Arif. All rights reserved.',
  }), []);

  // Enhanced settings loading with retry mechanism
  const loadSettingsGlobally = useCallback(async (force = false) => {
    // For public mode, always load fresh settings from API
    // For dashboard mode, only prevent multiple loads unless forced
    if (isDashboard && initialized && !force) {
      console.log('⏭️ Dashboard: Settings already initialized, skipping load');
      return settings;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🌍 GLOBAL SETTINGS LOAD: Starting...', isDashboard ? '(Dashboard mode)' : '(Public mode)');
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Settings loading timeout after 10s')), 10000)
      );
      
      let settingsPromise;
      if (isDashboard) {
        // Dashboard mode: use authenticated settings service
        console.log('🔐 GLOBAL LOAD: Dashboard mode - Using authenticated settings');
        settingsPromise = settingsService.getSettings();
      } else {
        // Public mode: use public settings service
        console.log('🌐 GLOBAL LOAD: Public mode - Using public settings');
        settingsPromise = portfolioService.getPublicSettings();
      }
      
      const userSettings = await Promise.race([settingsPromise, timeoutPromise]);
      
      console.log('📥 GLOBAL LOAD: Raw settings loaded:', {
        settingsCount: Object.keys(userSettings || {}).length,
        hasTheme: !!userSettings.theme_name,
        hasBannerName: !!userSettings.banner_name,
        hasAvatar: !!userSettings.avatar_image,
        sectionPortfolioVisible: userSettings.section_portfolio_visible,
        sectionTechnologiesVisible: userSettings.section_technologies_visible,
        sectionDomainsVisible: userSettings.section_domains_visible,
        sectionProjectCycleVisible: userSettings.section_project_cycle_visible
      });

      // Debug: Log the exact values and their types
      console.log('🔍 SETTINGS DEBUG - Raw API Response:', {
        'section_portfolio_visible': {
          value: userSettings.section_portfolio_visible,
          type: typeof userSettings.section_portfolio_visible,
          truthy: !!userSettings.section_portfolio_visible
        },
        'section_technologies_visible': {
          value: userSettings.section_technologies_visible,
          type: typeof userSettings.section_technologies_visible,
          truthy: !!userSettings.section_technologies_visible
        },
        'section_domains_visible': {
          value: userSettings.section_domains_visible,
          type: typeof userSettings.section_domains_visible,
          truthy: !!userSettings.section_domains_visible
        },
        'section_project_cycle_visible': {
          value: userSettings.section_project_cycle_visible,
          type: typeof userSettings.section_project_cycle_visible,
          truthy: !!userSettings.section_project_cycle_visible
        }
      });
      
      const mergedSettings = { ...defaultSettings, ...userSettings };
      
      // Debug: Log the merged settings to see if defaults are overriding API values
      console.log('🔍 SETTINGS DEBUG - After Merging with Defaults:', {
        'section_portfolio_visible': {
          default: defaultSettings.section_portfolio_visible,
          api: userSettings.section_portfolio_visible,
          final: mergedSettings.section_portfolio_visible,
          type: typeof mergedSettings.section_portfolio_visible
        },
        'section_technologies_visible': {
          default: defaultSettings.section_technologies_visible,
          api: userSettings.section_technologies_visible,
          final: mergedSettings.section_technologies_visible,
          type: typeof mergedSettings.section_technologies_visible
        },
        'section_domains_visible': {
          default: defaultSettings.section_domains_visible,
          api: userSettings.section_domains_visible,
          final: mergedSettings.section_domains_visible,
          type: typeof mergedSettings.section_domains_visible
        },
        'section_project_cycle_visible': {
          default: defaultSettings.section_project_cycle_visible,
          api: userSettings.section_project_cycle_visible,
          final: mergedSettings.section_project_cycle_visible,
          type: typeof mergedSettings.section_project_cycle_visible
        }
      });
      
      // Apply theme immediately from loaded settings
      const themeName = mergedSettings.theme_name || 'sand';
      console.log('🎨 GLOBAL LOAD: Applying theme:', themeName);
      applyTheme(themeName);
      
      // Update dynamic manifest
      updateManifest(mergedSettings);
      
      // Set state
      console.log('🔍 SETTINGS DEBUG - About to set state with:', {
        sectionPortfolioVisible: mergedSettings.section_portfolio_visible,
        sectionTechnologiesVisible: mergedSettings.section_technologies_visible,
        sectionDomainsVisible: mergedSettings.section_domains_visible,
        sectionProjectCycleVisible: mergedSettings.section_project_cycle_visible
      });
      
      console.log('🔍 SETTINGS DEBUG - Current settings state before update:', {
        sectionPortfolioVisible: settings.section_portfolio_visible,
        sectionTechnologiesVisible: settings.section_technologies_visible,
        sectionDomainsVisible: settings.section_domains_visible,
        sectionProjectCycleVisible: settings.section_project_cycle_visible
      });
      
      setSettings(mergedSettings);
      setInitialized(true);
      setRetryCount(0); // Reset retry count on success
      
      console.log('✅ GLOBAL SETTINGS LOAD: Complete!', {
        finalTheme: mergedSettings.theme_name,
        finalBannerName: mergedSettings.banner_name,
        totalSettings: Object.keys(mergedSettings).length
      });
      
      return mergedSettings;
      
    } catch (error) {
      console.error('❌ GLOBAL SETTINGS LOAD: Error:', error);
      setError(error.message);
      
      // DISABLED: Retry logic - API is working fine, no need for retries
      console.log('🔄 GLOBAL LOAD: Error detected, using fallback settings immediately (no retries)');
      
      // Fallback to defaults on final failure
      console.log('🔄 GLOBAL LOAD: Using fallback settings');
      const fallbackSettings = defaultSettings;
      
      // Apply default theme
      applyTheme(fallbackSettings.theme_name);
      updateManifest(fallbackSettings);
      
      setSettings(fallbackSettings);
      setInitialized(true);
      
      return fallbackSettings;
      
    } finally {
      setLoading(false);
    }
  }, [isDashboard, defaultSettings, initialized, retryCount]);

  // Initialize settings once on mount
  useEffect(() => {
    if (!initialized) {
      loadSettingsGlobally();
    }
  }, [loadSettingsGlobally, initialized]);

  // Debug: Monitor settings state changes
  useEffect(() => {
    console.log('🔍 SETTINGS STATE CHANGED:', {
      sectionPortfolioVisible: settings.section_portfolio_visible,
      sectionTechnologiesVisible: settings.section_technologies_visible,
      sectionDomainsVisible: settings.section_domains_visible,
      sectionProjectCycleVisible: settings.section_project_cycle_visible,
      totalSettings: Object.keys(settings).length
    });
  }, [settings]);

  // Update settings (Dashboard only)
  const updateSettings = useCallback(async (newSettings) => {
    if (!isDashboard) {
      console.warn('Settings updates only allowed in dashboard mode');
      return false;
    }
    
    try {
      console.log('🔄 GLOBAL UPDATE: Updating settings...', Object.keys(newSettings));
      
      // Update database
      await settingsService.updateMultipleSettings(newSettings);
      
      // Update local state immediately
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      
      // Apply theme if it changed
      if (newSettings.theme_name && newSettings.theme_name !== settings.theme_name) {
        console.log('🎨 GLOBAL UPDATE: Theme changed to:', newSettings.theme_name);
        applyTheme(newSettings.theme_name);
      }
      
      // Update manifest if relevant settings changed
      const manifestKeys = ['banner_name', 'banner_title', 'avatar_image'];
      if (manifestKeys.some(key => newSettings[key])) {
        updateManifest(updatedSettings);
      }
      
      console.log('✅ GLOBAL UPDATE: Settings updated successfully');
      return true;
      
    } catch (error) {
      console.error('❌ GLOBAL UPDATE: Error updating settings:', error);
      setError(error.message);
      return false;
    }
  }, [isDashboard, settings]);

  // Refresh settings (force reload)
  const refreshSettings = useCallback(async () => {
    console.log('🔄 GLOBAL REFRESH: Force refreshing settings...');
    return await loadSettingsGlobally(true);
  }, [loadSettingsGlobally]);

  // Get individual setting (from loaded state, not database)
  const getSetting = useCallback((key) => {
    const value = settings[key] || defaultSettings[key] || '';
    
    // Debug: Log section visibility settings when accessed
    if (key.includes('section_') && key.includes('_visible')) {
      console.log(`🔍 GETSETTING DEBUG - ${key}:`, {
        fromSettings: settings[key],
        fromDefaults: defaultSettings[key],
        finalValue: value,
        type: typeof value,
        truthy: !!value
      });
    }
    
    return value;
  }, [settings, defaultSettings]);

  // Enhanced context value with more utilities
  const contextValue = useMemo(() => ({
    // State
    settings,
    loading,
    initialized,
    error,
    
    // Methods
    getSetting,
    updateSettings,
    refreshSettings,
    
    // Utilities
    isDashboard,
    retryCount,
    
    // Legacy aliases (for backwards compatibility)
    reloadSettings: refreshSettings,
  }), [settings, loading, initialized, error, getSetting, updateSettings, refreshSettings, isDashboard, retryCount]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}; 