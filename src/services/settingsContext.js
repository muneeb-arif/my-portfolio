import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { settingsService } from './supabaseService';

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
    copyright_text: '© 2024 Muneeb Arif. All rights reserved.'
  }), []);

  useEffect(() => {
    // Only load settings once on mount
    let isMounted = true;
    
    const loadSettingsOnce = async () => {
      try {
        setLoading(true);
        console.log('🔄 Loading settings from database...');
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Settings loading timeout')), 10000)
        );
        
        const settingsPromise = settingsService.getSettings();
        const userSettings = await Promise.race([settingsPromise, timeoutPromise]);
        
        if (isMounted) {
          console.log('📥 User settings from database:', userSettings);
          const mergedSettings = { ...defaultSettings, ...userSettings };
          console.log('🔧 Merged settings:', mergedSettings);
          setSettings(mergedSettings);
        }
      } catch (error) {
        console.error('❌ Error loading settings:', error);
        if (isMounted) {
          console.log('🔄 Falling back to default settings');
          setSettings(defaultSettings);
        }
      } finally {
        if (isMounted) {
          console.log('✅ Settings loading complete');
          setLoading(false);
        }
      }
    };

    loadSettingsOnce();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading settings from database...');
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Settings loading timeout')), 10000)
      );
      
      const settingsPromise = settingsService.getSettings();
      const userSettings = await Promise.race([settingsPromise, timeoutPromise]);
      
      console.log('📥 User settings from database:', userSettings);
      const mergedSettings = { ...defaultSettings, ...userSettings };
      console.log('🔧 Merged settings:', mergedSettings);
      setSettings(mergedSettings);
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      console.log('🔄 Falling back to default settings');
      setSettings(defaultSettings);
    } finally {
      console.log('✅ Settings loading complete');
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings) => {
    try {
      await settingsService.updateMultipleSettings(newSettings);
      setSettings(prev => ({ ...prev, ...newSettings }));
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  const getSetting = useCallback((key) => {
    return settings[key] || defaultSettings[key] || '';
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