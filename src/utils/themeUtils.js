// ===== COMPREHENSIVE THEME SWITCHING UTILITY =====
// This demonstrates how easy it is to change your entire app theme!

// Theme definitions with comprehensive color variables
export const themes = {
  sand: {
    name: 'Sand Desert',
    // Primary brand colors
    '--color-primary': '#B8936A',
    '--color-primary-light': '#E9CBA7',
    '--color-primary-dark': '#8B6F47',
    '--color-primary-subtle': '#F5E6D3',
    
    // Secondary colors
    '--color-secondary': '#C9A77D',
    '--color-secondary-light': '#F5E6D3',
    '--color-secondary-dark': '#9A7B5A',
    
    // Header and Footer
    '--color-header-bg': '#8B6F47',
    '--color-header-text': '#F5E6D3',
    '--color-footer-bg': '#8B6F47',
    '--color-footer-text': '#F5E6D3',
    
    // Buttons
    '--color-button-primary': '#B8936A',
    '--color-button-primary-hover': '#8B6F47',
    '--color-button-primary-text': '#FFFFFF',
    '--color-button-secondary': '#E9CBA7',
    '--color-button-secondary-hover': '#C9A77D',
    '--color-button-secondary-text': '#8B6F47',
    
    // Backgrounds
    '--color-background': '#FEFEFE',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#F5E6D3',
    '--color-card-bg': '#FFFFFF',
    
    // Text colors
    '--color-text': '#2D3748',
    '--color-text-light': '#4A5568',
    '--color-text-muted': '#718096',
    '--color-text-inverse': '#FFFFFF',
    
    // Navigation
    '--color-nav-active': '#B8936A',
    '--color-nav-hover': '#E9CBA7',
    '--color-nav-text': '#4A5568',
    
    // Status colors
    '--color-success': '#48BB78',
    '--color-warning': '#ED8936',
    '--color-error': '#F56565',
    '--color-info': '#4299E1'
  },
  ocean: {
    name: 'Ocean Blue',
    // Primary brand colors
    '--color-primary': '#2563EB',
    '--color-primary-light': '#60A5FA',
    '--color-primary-dark': '#1D4ED8',
    '--color-primary-subtle': '#DBEAFE',
    
    // Secondary colors
    '--color-secondary': '#0EA5E9',
    '--color-secondary-light': '#7DD3FC',
    '--color-secondary-dark': '#0284C7',
    
    // Header and Footer
    '--color-header-bg': '#1E3A8A',
    '--color-header-text': '#F0F9FF',
    '--color-footer-bg': '#1E3A8A',
    '--color-footer-text': '#F0F9FF',
    
    // Buttons
    '--color-button-primary': '#2563EB',
    '--color-button-primary-hover': '#1D4ED8',
    '--color-button-primary-text': '#FFFFFF',
    '--color-button-secondary': '#60A5FA',
    '--color-button-secondary-hover': '#3B82F6',
    '--color-button-secondary-text': '#FFFFFF',
    
    // Backgrounds
    '--color-background': '#FEFEFE',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#F0F9FF',
    '--color-card-bg': '#FFFFFF',
    
    // Text colors
    '--color-text': '#1E293B',
    '--color-text-light': '#334155',
    '--color-text-muted': '#64748B',
    '--color-text-inverse': '#FFFFFF',
    
    // Navigation
    '--color-nav-active': '#2563EB',
    '--color-nav-hover': '#DBEAFE',
    '--color-nav-text': '#334155',
    
    // Status colors
    '--color-success': '#10B981',
    '--color-warning': '#F59E0B',
    '--color-error': '#EF4444',
    '--color-info': '#06B6D4'
  },
  purple: {
    name: 'Purple Dream',
    // Primary brand colors
    '--color-primary': '#7C3AED',
    '--color-primary-light': '#A78BFA',
    '--color-primary-dark': '#5B21B6',
    '--color-primary-subtle': '#EDE9FE',
    
    // Secondary colors
    '--color-secondary': '#A855F7',
    '--color-secondary-light': '#C084FC',
    '--color-secondary-dark': '#7E22CE',
    
    // Header and Footer
    '--color-header-bg': '#581C87',
    '--color-header-text': '#FAF5FF',
    '--color-footer-bg': '#581C87',
    '--color-footer-text': '#FAF5FF',
    
    // Buttons
    '--color-button-primary': '#7C3AED',
    '--color-button-primary-hover': '#5B21B6',
    '--color-button-primary-text': '#FFFFFF',
    '--color-button-secondary': '#A78BFA',
    '--color-button-secondary-hover': '#8B5CF6',
    '--color-button-secondary-text': '#FFFFFF',
    
    // Backgrounds
    '--color-background': '#FEFEFE',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#FAF5FF',
    '--color-card-bg': '#FFFFFF',
    
    // Text colors
    '--color-text': '#1F2937',
    '--color-text-light': '#374151',
    '--color-text-muted': '#6B7280',
    '--color-text-inverse': '#FFFFFF',
    
    // Navigation
    '--color-nav-active': '#7C3AED',
    '--color-nav-hover': '#EDE9FE',
    '--color-nav-text': '#374151',
    
    // Status colors
    '--color-success': '#10B981',
    '--color-warning': '#F59E0B',
    '--color-error': '#EF4444',
    '--color-info': '#06B6D4'
  },
  nature: {
    name: 'Nature Green',
    // Primary brand colors
    '--color-primary': '#059669',
    '--color-primary-light': '#34D399',
    '--color-primary-dark': '#047857',
    '--color-primary-subtle': '#D1FAE5',
    
    // Secondary colors
    '--color-secondary': '#10B981',
    '--color-secondary-light': '#6EE7B7',
    '--color-secondary-dark': '#065F46',
    
    // Header and Footer
    '--color-header-bg': '#064E3B',
    '--color-header-text': '#ECFDF5',
    '--color-footer-bg': '#064E3B',
    '--color-footer-text': '#ECFDF5',
    
    // Buttons
    '--color-button-primary': '#059669',
    '--color-button-primary-hover': '#047857',
    '--color-button-primary-text': '#FFFFFF',
    '--color-button-secondary': '#34D399',
    '--color-button-secondary-hover': '#10B981',
    '--color-button-secondary-text': '#FFFFFF',
    
    // Backgrounds
    '--color-background': '#FEFEFE',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#F0FDF4',
    '--color-card-bg': '#FFFFFF',
    
    // Text colors
    '--color-text': '#1F2937',
    '--color-text-light': '#374151',
    '--color-text-muted': '#6B7280',
    '--color-text-inverse': '#FFFFFF',
    
    // Navigation
    '--color-nav-active': '#059669',
    '--color-nav-hover': '#D1FAE5',
    '--color-nav-text': '#374151',
    
    // Status colors
    '--color-success': '#10B981',
    '--color-warning': '#F59E0B',
    '--color-error': '#EF4444',
    '--color-info': '#06B6D4'
  },
  rose: {
    name: 'Rose Gold',
    // Primary brand colors
    '--color-primary': '#E11D48',
    '--color-primary-light': '#FB7185',
    '--color-primary-dark': '#BE123C',
    '--color-primary-subtle': '#FFE4E6',
    
    // Secondary colors
    '--color-secondary': '#F43F5E',
    '--color-secondary-light': '#FDA4AF',
    '--color-secondary-dark': '#9F1239',
    
    // Header and Footer
    '--color-header-bg': '#881337',
    '--color-header-text': '#FFF1F2',
    '--color-footer-bg': '#881337',
    '--color-footer-text': '#FFF1F2',
    
    // Buttons
    '--color-button-primary': '#E11D48',
    '--color-button-primary-hover': '#BE123C',
    '--color-button-primary-text': '#FFFFFF',
    '--color-button-secondary': '#FB7185',
    '--color-button-secondary-hover': '#F43F5E',
    '--color-button-secondary-text': '#FFFFFF',
    
    // Backgrounds
    '--color-background': '#FEFEFE',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#FFF1F2',
    '--color-card-bg': '#FFFFFF',
    
    // Text colors
    '--color-text': '#1F2937',
    '--color-text-light': '#374151',
    '--color-text-muted': '#6B7280',
    '--color-text-inverse': '#FFFFFF',
    
    // Navigation
    '--color-nav-active': '#E11D48',
    '--color-nav-hover': '#FFE4E6',
    '--color-nav-text': '#374151',
    
    // Status colors
    '--color-success': '#10B981',
    '--color-warning': '#F59E0B',
    '--color-error': '#EF4444',
    '--color-info': '#06B6D4'
  },
  // 🚀 NEW MODERN THEMES BASED ON 2024-2025 TRENDS 🚀
  cyberpunk: {
    name: 'Cyberpunk Neon',
    // Primary brand colors - Electric blues and neon pinks
    '--color-primary': '#00D4FF',
    '--color-primary-light': '#40E0FF',
    '--color-primary-dark': '#0099CC',
    '--color-primary-subtle': '#E6F9FF',
    
    // Secondary colors - Neon pink and electric purple
    '--color-secondary': '#FF007A',
    '--color-secondary-light': '#FF40A0',
    '--color-secondary-dark': '#CC0062',
    
    // Header and Footer - Dark cyberpunk colors
    '--color-header-bg': '#1B1B2A',
    '--color-header-text': '#00D4FF',
    '--color-footer-bg': '#1B1B2A',
    '--color-footer-text': '#00D4FF',
    
    // Buttons - Neon glow effects
    '--color-button-primary': '#00D4FF',
    '--color-button-primary-hover': '#FF007A',
    '--color-button-primary-text': '#1B1B2A',
    '--color-button-secondary': '#FF007A',
    '--color-button-secondary-hover': '#A700FF',
    '--color-button-secondary-text': '#FFFFFF',
    
    // Backgrounds - Dark tech aesthetic
    '--color-background': '#0A0A0F',
    '--color-surface': '#1A1A2E',
    '--color-section-bg': '#16213E',
    '--color-card-bg': '#1A1A2E',
    
    // Text colors - High contrast for readability
    '--color-text': '#FFFFFF',
    '--color-text-light': '#E0E0E0',
    '--color-text-muted': '#B0B0B0',
    '--color-text-inverse': '#1B1B2A',
    
    // Navigation - Neon accents
    '--color-nav-active': '#00D4FF',
    '--color-nav-hover': '#FF007A',
    '--color-nav-text': '#E0E0E0',
    
    // Status colors - Cyberpunk themed
    '--color-success': '#00FFB3',
    '--color-warning': '#FFD600',
    '--color-error': '#FF3D00',
    '--color-info': '#00D4FF'
  },
  cosmic: {
    name: 'Cosmic Midnight',
    // Primary brand colors - Deep space blues and cosmic purple
    '--color-primary': '#4C5578',
    '--color-primary-light': '#8A9BC4',
    '--color-primary-dark': '#2E3450',
    '--color-primary-subtle': '#F0F2FF',
    
    // Secondary colors - Cosmic purple and starlight
    '--color-secondary': '#8A2BE2',
    '--color-secondary-light': '#BA55D3',
    '--color-secondary-dark': '#6A1B9A',
    
    // Header and Footer - Deep space aesthetic
    '--color-header-bg': '#1C1B3A',
    '--color-header-text': '#E6E6FA',
    '--color-footer-bg': '#1C1B3A',
    '--color-footer-text': '#E6E6FA',
    
    // Buttons - Cosmic glow
    '--color-button-primary': '#4C5578',
    '--color-button-primary-hover': '#8A2BE2',
    '--color-button-primary-text': '#FFFFFF',
    '--color-button-secondary': '#8A9BC4',
    '--color-button-secondary-hover': '#BA55D3',
    '--color-button-secondary-text': '#FFFFFF',
    
    // Backgrounds - Midnight cosmic theme
    '--color-background': '#0F0F23',
    '--color-surface': '#1A1A3A',
    '--color-section-bg': '#2D2D5F',
    '--color-card-bg': '#1A1A3A',
    
    // Text colors - Cosmic readability
    '--color-text': '#E6E6FA',
    '--color-text-light': '#D8D8F0',
    '--color-text-muted': '#B8B8D6',
    '--color-text-inverse': '#1C1B3A',
    
    // Navigation - Starlight accents
    '--color-nav-active': '#8A2BE2',
    '--color-nav-hover': '#BA55D3',
    '--color-nav-text': '#D8D8F0',
    
    // Status colors - Space themed
    '--color-success': '#32CD32',
    '--color-warning': '#FFB347',
    '--color-error': '#FF6B6B',
    '--color-info': '#87CEEB'
  },
  cherry: {
    name: 'Cherry Blossom',
    // Primary brand colors - Cherry red and blossom pink
    '--color-primary': '#512C3A',
    '--color-primary-light': '#D2719A',
    '--color-primary-dark': '#3D1F2A',
    '--color-primary-subtle': '#FFE8ED',
    
    // Secondary colors - Soft cherry tones
    '--color-secondary': '#FF69B4',
    '--color-secondary-light': '#FFB6C1',
    '--color-secondary-dark': '#DC143C',
    
    // Header and Footer - Deep cherry
    '--color-header-bg': '#512C3A',
    '--color-header-text': '#FFE8ED',
    '--color-footer-bg': '#512C3A',
    '--color-footer-text': '#FFE8ED',
    
    // Buttons - Cherry blossom gradient
    '--color-button-primary': '#512C3A',
    '--color-button-primary-hover': '#DC143C',
    '--color-button-primary-text': '#FFFFFF',
    '--color-button-secondary': '#FF69B4',
    '--color-button-secondary-hover': '#FFB6C1',
    '--color-button-secondary-text': '#FFFFFF',
    
    // Backgrounds - Soft and warm
    '--color-background': '#FFFAFA',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#FFE8ED',
    '--color-card-bg': '#FFFFFF',
    
    // Text colors - Cherry contrast
    '--color-text': '#2D1B20',
    '--color-text-light': '#4A2F36',
    '--color-text-muted': '#8B6B73',
    '--color-text-inverse': '#FFFFFF',
    
    // Navigation - Blossom accents
    '--color-nav-active': '#512C3A',
    '--color-nav-hover': '#FFB6C1',
    '--color-nav-text': '#4A2F36',
    
    // Status colors - Cherry themed
    '--color-success': '#32CD32',
    '--color-warning': '#FFA500',
    '--color-error': '#DC143C',
    '--color-info': '#4169E1'
  },
  tropical: {
    name: 'Tropical Vibes',
    // Primary brand colors - Coral and turquoise
    '--color-primary': '#FF6F61',
    '--color-primary-light': '#FF8A7A',
    '--color-primary-dark': '#E55347',
    '--color-primary-subtle': '#FFF0EE',
    
    // Secondary colors - Mint and aqua
    '--color-secondary': '#40E0D0',
    '--color-secondary-light': '#7FFFD4',
    '--color-secondary-dark': '#20B2AA',
    
    // Header and Footer - Sunset tropical
    '--color-header-bg': '#FF4500',
    '--color-header-text': '#FFFFFF',
    '--color-footer-bg': '#FF4500',
    '--color-footer-text': '#FFFFFF',
    
    // Buttons - Tropical paradise
    '--color-button-primary': '#FF6F61',
    '--color-button-primary-hover': '#FF4500',
    '--color-button-primary-text': '#FFFFFF',
    '--color-button-secondary': '#40E0D0',
    '--color-button-secondary-hover': '#20B2AA',
    '--color-button-secondary-text': '#FFFFFF',
    
    // Backgrounds - Beach vibes
    '--color-background': '#FFFEF7',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#F0FFFF',
    '--color-card-bg': '#FFFFFF',
    
    // Text colors - Tropical contrast
    '--color-text': '#2F4F4F',
    '--color-text-light': '#556B5B',
    '--color-text-muted': '#708090',
    '--color-text-inverse': '#FFFFFF',
    
    // Navigation - Tropical accents
    '--color-nav-active': '#FF6F61',
    '--color-nav-hover': '#7FFFD4',
    '--color-nav-text': '#556B5B',
    
    // Status colors - Tropical themed
    '--color-success': '#32CD32',
    '--color-warning': '#FFD700',
    '--color-error': '#FF6347',
    '--color-info': '#00CED1'
  }
};

/**
 * Apply a theme by updating CSS variables
 */
export const applyTheme = (themeName) => {
  const theme = themes[themeName];
  if (!theme) return;
  
  const root = document.documentElement;
  
  Object.entries(theme).forEach(([property, value]) => {
    if (property !== 'name') {
      root.style.setProperty(property, value);
    }
  });
  
  localStorage.setItem('selectedTheme', themeName);
};

/**
 * Apply custom colors
 */
export const applyCustomTheme = (customColors) => {
  const root = document.documentElement;
  
  Object.entries(customColors).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
  
  localStorage.setItem('selectedTheme', 'custom');
  localStorage.setItem('customTheme', JSON.stringify(customColors));
};

/**
 * Load saved theme from localStorage (fallback)
 */
export const loadSavedTheme = () => {
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme && savedTheme !== 'custom' && themes[savedTheme]) {
    applyTheme(savedTheme);
  } else if (savedTheme === 'custom') {
    const customTheme = localStorage.getItem('customTheme');
    if (customTheme) {
      applyCustomTheme(JSON.parse(customTheme));
    }
  }
};

/**
 * Load theme from settings service (database)
 */
export const loadThemeFromSettings = async (settingsService) => {
  try {
    if (!settingsService) return false;
    
    const savedTheme = await settingsService.getSetting('theme_name');
    
    if (savedTheme && themes[savedTheme]) {
      applyTheme(savedTheme);
      return savedTheme;
    }
    
    // Fallback to localStorage if no database theme
    loadSavedTheme();
    return getCurrentTheme();
  } catch (error) {
    // console.error('Error loading theme from settings:', error);
    // Fallback to localStorage
    loadSavedTheme();
    return getCurrentTheme();
  }
};

/**
 * Save theme to settings service (database)
 */
export const saveThemeToSettings = async (themeName, settingsService) => {
  try {
    if (!settingsService) {
      // Fallback to localStorage only
      localStorage.setItem('selectedTheme', themeName);
      return false;
    }
    
    await settingsService.updateSetting('theme_name', themeName);
    // Also update localStorage for immediate access
    localStorage.setItem('selectedTheme', themeName);
    return true;
  } catch (error) {
    // console.error('Error saving theme to settings:', error);
    // Fallback to localStorage only
    localStorage.setItem('selectedTheme', themeName);
    return false;
  }
};

/**
 * Get current theme
 */
export const getCurrentTheme = () => {
  return localStorage.getItem('selectedTheme') || 'sand';
};

/**
 * Load theme from public settings (for non-authenticated users)
 */
export const loadThemeFromPublicSettings = (settings) => {
  try {
    const savedTheme = settings?.theme_name;
    
    if (savedTheme && themes[savedTheme]) {
      applyTheme(savedTheme);
      return savedTheme;
    }
    
    // Default to sand theme
    applyTheme('sand');
    return 'sand';
  } catch (error) {
    // console.error('Error loading theme from public settings:', error);
    // Default to sand theme
    applyTheme('sand');
    return 'sand';
  }
};
