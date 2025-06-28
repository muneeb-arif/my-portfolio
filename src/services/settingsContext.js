import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { settingsService } from './supabaseService';
import portfolioService from './portfolioService';
import { portfolioConfig } from '../config/portfolio';
import { loadThemeFromPublicSettings, loadThemeFromSettings } from '../utils/themeUtils';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Check if we're in dashboard mode (memoized to prevent re-calculations)
  const isDashboard = useMemo(() => window.location.pathname === '/dashboard', []);

  const defaultSettings = useMemo(() => ({
    logo_type: 'initials',
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
    copyright_text: '© 2024 Muneeb Arif. All rights reserved.',
    theme_name: 'sand', // Add default theme
    ...portfolioConfig.defaultSettings
  }), []);

  useEffect(() => {
    // Prevent loading if already initialized
    if (initialized) {
      return;
    }

    let isMounted = true;
    
    const loadSettingsOnce = async () => {
      try {
        setLoading(true);
        console.log('🔄 SettingsContext: Loading settings ONCE...', isDashboard ? '(Dashboard mode)' : '(Public mode)');
        
        // ===== DEBUG INFO (only once) =====
        console.log('🌐 Environment Variables:');
        console.log('  - REACT_APP_PORTFOLIO_OWNER_EMAIL:', process.env.REACT_APP_PORTFOLIO_OWNER_EMAIL);
        console.log('  - REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? 'SET' : 'NOT SET');
        console.log('  - REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
        
        console.log('📋 Portfolio Config:');
        console.log('  - ownerEmail:', portfolioConfig.ownerEmail);
        console.log('  - defaultSettings:', portfolioConfig.defaultSettings);
        
        console.log('🎯 Mode:', isDashboard ? 'Dashboard (authenticated)' : 'Public (non-authenticated)');
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Settings loading timeout')), 10000)
        );
        
        let settingsPromise;
        if (isDashboard) {
          // Dashboard mode: use authenticated settings service
          console.log('🔐 Dashboard mode: Using settingsService.getSettings()');
          settingsPromise = settingsService.getSettings();
        } else {
          // Public mode: use public settings service
          console.log('🌐 Public mode: Using portfolioService.getPublicSettings()');
          settingsPromise = portfolioService.getPublicSettings();
        }
        
        const userSettings = await Promise.race([settingsPromise, timeoutPromise]);
        
        if (isMounted) {
          console.log('📥 Raw user settings loaded:');
          console.log('  - Settings object:', userSettings);
          console.log('  - theme_name:', userSettings.theme_name);
          console.log('  - banner_name:', userSettings.banner_name);
          console.log('  - banner_title:', userSettings.banner_title);
          console.log('  - Total settings keys:', Object.keys(userSettings || {}).length);
          
          const mergedSettings = { ...defaultSettings, ...userSettings };
          console.log('🔧 Merged settings:');
          console.log('  - Final theme_name:', mergedSettings.theme_name);
          console.log('  - Final banner_name:', mergedSettings.banner_name);
          console.log('  - Final banner_title:', mergedSettings.banner_title);
          
          setSettings(mergedSettings);
          setInitialized(true); // Mark as initialized to prevent re-loading
          
          // Load and apply theme from settings
          console.log('🎨 Loading theme from settings...');
          if (isDashboard) {
            // Dashboard mode: load theme from authenticated settings
            console.log('🔐 Dashboard mode: Loading theme from authenticated settings');
            try {
              const appliedTheme = await loadThemeFromSettings(settingsService);
              console.log('✅ Theme loaded from authenticated settings:', appliedTheme);
            } catch (error) {
              console.error('❌ Error loading theme from authenticated settings:', error);
            }
          } else {
            // Public mode: load theme from public settings
            console.log('🌐 Public mode: Loading theme from public settings');
            console.log('  - userSettings for theme loading:', userSettings);
            const appliedTheme = loadThemeFromPublicSettings(userSettings);
            console.log('✅ Theme loaded from public settings:', appliedTheme);
          }
        }
      } catch (error) {
        console.error('❌ Error loading settings:', error);
        console.log('🔄 SettingsContext: Falling back to default settings');
        console.log('  - Default banner_name:', defaultSettings.banner_name);
        console.log('  - Default banner_title:', defaultSettings.banner_title);
        console.log('  - Default banner_tagline:', defaultSettings.banner_tagline);
        
        if (isMounted) {
          setSettings(defaultSettings);
          setInitialized(true); // Mark as initialized even on error
          
          // Apply default theme on error
          console.log('🎨 Applying default theme on error');
          loadThemeFromPublicSettings(defaultSettings);
        }
      } finally {
        if (isMounted) {
          console.log('✅ SettingsContext: Settings loading complete');
          setLoading(false);
        }
      }
    };

    loadSettingsOnce();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      // Get current mode
      const currentIsDashboard = window.location.pathname === '/dashboard';
      console.log('🔄 SettingsContext: Manual reload - Loading settings...', currentIsDashboard ? '(Dashboard mode)' : '(Public mode)');
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Settings loading timeout')), 10000)
      );
      
      let settingsPromise;
      if (currentIsDashboard) {
        // Dashboard mode: use authenticated settings service
        settingsPromise = settingsService.getSettings();
      } else {
        // Public mode: use public settings service
        settingsPromise = portfolioService.getPublicSettings();
      }
      
      const userSettings = await Promise.race([settingsPromise, timeoutPromise]);
      
      console.log('📥 SettingsContext: Manual reload - User settings loaded:', userSettings);
      const mergedSettings = { ...defaultSettings, ...userSettings };
      console.log('🔧 SettingsContext: Manual reload - Merged settings:', mergedSettings);
      setSettings(mergedSettings);
      
      // Load and apply theme from settings
      console.log('🎨 Loading theme from settings...');
      if (currentIsDashboard) {
        // Dashboard mode: load theme from authenticated settings
        console.log('🔐 Dashboard mode: Loading theme from authenticated settings');
        try {
          const appliedTheme = await loadThemeFromSettings(settingsService);
          console.log('✅ Theme loaded from authenticated settings:', appliedTheme);
        } catch (error) {
          console.error('❌ Error loading theme from authenticated settings:', error);
        }
      } else {
        // Public mode: load theme from public settings
        console.log('🌐 Public mode: Loading theme from public settings');
        console.log('  - userSettings for theme loading:', userSettings);
        const appliedTheme = loadThemeFromPublicSettings(userSettings);
        console.log('✅ Theme loaded from public settings:', appliedTheme);
      }
    } catch (error) {
      console.error('❌ SettingsContext: Manual reload - Error loading settings:', error);
      console.log('🔄 SettingsContext: Manual reload - Falling back to default settings');
      setSettings(defaultSettings);
      
      // Apply default theme on error
      console.log('🎨 Applying default theme on error');
      loadThemeFromPublicSettings(defaultSettings);
    } finally {
      console.log('✅ SettingsContext: Manual reload - Settings loading complete');
      setLoading(false);
    }
  }, [defaultSettings]); // Only depend on defaultSettings

  const updateSettings = useCallback(async (newSettings) => {
    // Only allow updates in dashboard mode
    const currentIsDashboard = window.location.pathname === '/dashboard';
    if (!currentIsDashboard) {
      console.warn('Settings updates are only allowed in dashboard mode');
      return false;
    }
    
    try {
      await settingsService.updateMultipleSettings(newSettings);
      setSettings(prev => ({ ...prev, ...newSettings }));
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  }, []); // Remove dependencies to prevent re-creation

  const refreshSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  const getSetting = useCallback((key) => {
    const value = settings[key] || defaultSettings[key] || '';
    // Only log once per unique key to reduce console noise
    if (!getSetting._loggedKeys) getSetting._loggedKeys = new Set();
    if (!getSetting._loggedKeys.has(key)) {
      console.log(`🔍 getSetting('${key}') = "${value}"`);
      getSetting._loggedKeys.add(key);
    }
    return value;
  }, [settings, defaultSettings]);

  const value = useMemo(() => ({
    settings,
    loading,
    updateSettings,
    getSetting,
    reloadSettings: loadSettings,
    refreshSettings
  }), [settings, loading, updateSettings, getSetting, loadSettings, refreshSettings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}; 