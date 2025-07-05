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
  hyperpop: {
    name: 'Hyperpop Dream',
    // Primary brand colors - Bright neon with pastels
    '--color-primary': '#FF69B4',
    '--color-primary-light': '#FFB6DA',
    '--color-primary-dark': '#E1559E',
    '--color-primary-subtle': '#FFF0F8',
    
    // Secondary colors - Electric green and purple
    '--color-secondary': '#00FF7F',
    '--color-secondary-light': '#7FFF9F',
    '--color-secondary-dark': '#00CC65',
    
    // Header and Footer - Neon pink
    '--color-header-bg': '#FF1493',
    '--color-header-text': '#FFFFFF',
    '--color-footer-bg': '#FF1493',
    '--color-footer-text': '#FFFFFF',
    
    // Buttons - Hyperpop vibes
    '--color-button-primary': '#FF69B4',
    '--color-button-primary-hover': '#00FF7F',
    '--color-button-primary-text': '#FFFFFF',
    '--color-button-secondary': '#00FF7F',
    '--color-button-secondary-hover': '#FF69B4',
    '--color-button-secondary-text': '#FFFFFF',
    
    // Backgrounds - Clean and bright
    '--color-background': '#FEFEFE',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#F8F0FF',
    '--color-card-bg': '#FFFFFF',
    
    // Text colors - High contrast
    '--color-text': '#1A1A1A',
    '--color-text-light': '#2D2D2D',
    '--color-text-muted': '#666666',
    '--color-text-inverse': '#FFFFFF',
    
    // Navigation - Neon accents
    '--color-nav-active': '#FF69B4',
    '--color-nav-hover': '#FFB6DA',
    '--color-nav-text': '#2D2D2D',
    
    // Status colors - Hyperpop themed
    '--color-success': '#00FF7F',
    '--color-warning': '#FFFF00',
    '--color-error': '#FF1493',
    '--color-info': '#00BFFF'
  },
  celestial: {
    name: 'Celestial Gold',
    // Primary brand colors - Golden yellow inspired
    '--color-primary': '#EDEAB1',
    '--color-primary-light': '#F5F2D0',
    '--color-primary-dark': '#D4CE7F',
    '--color-primary-subtle': '#FFFEF5',
    
    // Secondary colors - Warm golds and amber
    '--color-secondary': '#FFD700',
    '--color-secondary-light': '#FFED4E',
    '--color-secondary-dark': '#DAA520',
    
    // Header and Footer - Deep gold
    '--color-header-bg': '#B8860B',
    '--color-header-text': '#FFFFFF',
    '--color-footer-bg': '#B8860B',
    '--color-footer-text': '#FFFFFF',
    
    // Buttons - Golden shine
    '--color-button-primary': '#EDEAB1',
    '--color-button-primary-hover': '#FFD700',
    '--color-button-primary-text': '#2D2D2D',
    '--color-button-secondary': '#FFD700',
    '--color-button-secondary-hover': '#EDEAB1',
    '--color-button-secondary-text': '#2D2D2D',
    
    // Backgrounds - Warm celestial
    '--color-background': '#FFFEF7',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#FFF9E6',
    '--color-card-bg': '#FFFFFF',
    
    // Text colors - Rich contrast
    '--color-text': '#2D2D2D',
    '--color-text-light': '#4A4A4A',
    '--color-text-muted': '#777777',
    '--color-text-inverse': '#FFFFFF',
    
    // Navigation - Golden accents
    '--color-nav-active': '#EDEAB1',
    '--color-nav-hover': '#F5F2D0',
    '--color-nav-text': '#4A4A4A',
    
    // Status colors - Celestial themed
    '--color-success': '#32CD32',
    '--color-warning': '#FF8C00',
    '--color-error': '#DC143C',
    '--color-info': '#4169E1'
  },
  retroblue: {
    name: 'Retro Blue',
    // Primary brand colors - Classic retro blue
    '--color-primary': '#71ADBA',
    '--color-primary-light': '#A3C9D3',
    '--color-primary-dark': '#5A8A95',
    '--color-primary-subtle': '#E8F4F6',
    
    // Secondary colors - Vintage orange and cream
    '--color-secondary': '#FF8C42',
    '--color-secondary-light': '#FFB380',
    '--color-secondary-dark': '#E07A3B',
    
    // Header and Footer - Deep retro blue
    '--color-header-bg': '#2E5C6E',
    '--color-header-text': '#FFFFFF',
    '--color-footer-bg': '#2E5C6E',
    '--color-footer-text': '#FFFFFF',
    
    // Buttons - Retro vibes
    '--color-button-primary': '#71ADBA',
    '--color-button-primary-hover': '#FF8C42',
    '--color-button-primary-text': '#FFFFFF',
    '--color-button-secondary': '#FF8C42',
    '--color-button-secondary-hover': '#71ADBA',
    '--color-button-secondary-text': '#FFFFFF',
    
    // Backgrounds - Vintage warmth
    '--color-background': '#FEFEFE',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#F7F9FA',
    '--color-card-bg': '#FFFFFF',
    
    // Text colors - Retro readability
    '--color-text': '#2D3748',
    '--color-text-light': '#4A5568',
    '--color-text-muted': '#718096',
    '--color-text-inverse': '#FFFFFF',
    
    // Navigation - Retro accents
    '--color-nav-active': '#71ADBA',
    '--color-nav-hover': '#A3C9D3',
    '--color-nav-text': '#4A5568',
    
    // Status colors - Retro themed
    '--color-success': '#38A169',
    '--color-warning': '#DD6B20',
    '--color-error': '#E53E3E',
    '--color-info': '#3182CE'
  },
  flamingo: {
    name: 'Electric Flamingo',
    // Primary brand colors - Hot pink and electric yellow
    '--color-primary': '#FF654F',
    '--color-primary-light': '#FF8A75',
    '--color-primary-dark': '#E55347',
    '--color-primary-subtle': '#FFF0EE',
    
    // Secondary colors - Bright yellow and magenta
    '--color-secondary': '#FFFF00',
    '--color-secondary-light': '#FFFF66',
    '--color-secondary-dark': '#CCCC00',
    
    // Header and Footer - Electric pink
    '--color-header-bg': '#FF1493',
    '--color-header-text': '#FFFFFF',
    '--color-footer-bg': '#FF1493',
    '--color-footer-text': '#FFFFFF',
    
    // Buttons - Electric energy
    '--color-button-primary': '#FF654F',
    '--color-button-primary-hover': '#FFFF00',
    '--color-button-primary-text': '#000000',
    '--color-button-secondary': '#FFFF00',
    '--color-button-secondary-hover': '#FF654F',
    '--color-button-secondary-text': '#000000',
    
    // Backgrounds - Clean electric
    '--color-background': '#FEFEFE',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#FFFACD',
    '--color-card-bg': '#FFFFFF',
    
    // Text colors - High contrast
    '--color-text': '#1A1A1A',
    '--color-text-light': '#2D2D2D',
    '--color-text-muted': '#666666',
    '--color-text-inverse': '#FFFFFF',
    
    // Navigation - Electric accents
    '--color-nav-active': '#FF654F',
    '--color-nav-hover': '#FFFF66',
    '--color-nav-text': '#2D2D2D',
    
    // Status colors - Electric themed
    '--color-success': '#00FF00',
    '--color-warning': '#FF8C00',
    '--color-error': '#FF1493',
    '--color-info': '#00BFFF'
  },
  riverbed: {
    name: 'Two-Tone Riverbed',
    // Primary brand colors - Aquatic blue and coffee brown
    '--color-primary': '#4682B4',
    '--color-primary-light': '#87CEEB',
    '--color-primary-dark': '#2F4F4F',
    '--color-primary-subtle': '#E0F6FF',
    
    // Secondary colors - Coffee and earth tones
    '--color-secondary': '#8B4513',
    '--color-secondary-light': '#CD853F',
    '--color-secondary-dark': '#654321',
    
    // Header and Footer - Deep water
    '--color-header-bg': '#2F4F4F',
    '--color-header-text': '#E0F6FF',
    '--color-footer-bg': '#2F4F4F',
    '--color-footer-text': '#E0F6FF',
    
    // Buttons - Natural flow
    '--color-button-primary': '#4682B4',
    '--color-button-primary-hover': '#8B4513',
    '--color-button-primary-text': '#FFFFFF',
    '--color-button-secondary': '#8B4513',
    '--color-button-secondary-hover': '#4682B4',
    '--color-button-secondary-text': '#FFFFFF',
    
    // Backgrounds - River stones
    '--color-background': '#F8F8FF',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#F0F8FF',
    '--color-card-bg': '#FFFFFF',
    
    // Text colors - Natural contrast
    '--color-text': '#2F4F4F',
    '--color-text-light': '#4682B4',
    '--color-text-muted': '#708090',
    '--color-text-inverse': '#FFFFFF',
    
    // Navigation - River flow
    '--color-nav-active': '#4682B4',
    '--color-nav-hover': '#87CEEB',
    '--color-nav-text': '#4682B4',
    
    // Status colors - Natural themed
    '--color-success': '#228B22',
    '--color-warning': '#DAA520',
    '--color-error': '#B22222',
    '--color-info': '#4682B4'
  },
  mocha: {
    name: 'Mocha Elegance',
    // Primary brand colors - Rich coffee and cream
    '--color-primary': '#8B4513',
    '--color-primary-light': '#D2B48C',
    '--color-primary-dark': '#654321',
    '--color-primary-subtle': '#FFF8DC',
    
    // Secondary colors - Warm earth tones
    '--color-secondary': '#DEB887',
    '--color-secondary-light': '#F5DEB3',
    '--color-secondary-dark': '#BC9A6A',
    
    // Header and Footer - Rich mocha
    '--color-header-bg': '#654321',
    '--color-header-text': '#FFF8DC',
    '--color-footer-bg': '#654321',
    '--color-footer-text': '#FFF8DC',
    
    // Buttons - Coffee warmth
    '--color-button-primary': '#8B4513',
    '--color-button-primary-hover': '#654321',
    '--color-button-primary-text': '#FFFFFF',
    '--color-button-secondary': '#DEB887',
    '--color-button-secondary-hover': '#BC9A6A',
    '--color-button-secondary-text': '#654321',
    
    // Backgrounds - Cream and warmth
    '--color-background': '#FFFEF7',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#FFF8DC',
    '--color-card-bg': '#FFFFFF',
    
    // Text colors - Coffee contrast
    '--color-text': '#3D2914',
    '--color-text-light': '#654321',
    '--color-text-muted': '#8B7355',
    '--color-text-inverse': '#FFFFFF',
    
    // Navigation - Mocha accents
    '--color-nav-active': '#8B4513',
    '--color-nav-hover': '#D2B48C',
    '--color-nav-text': '#654321',
    
    // Status colors - Warm themed
    '--color-success': '#9ACD32',
    '--color-warning': '#FF8C00',
    '--color-error': '#CD5C5C',
    '--color-info': '#4682B4'
  },
  citrus: {
    name: 'Citrus Burst',
    // Primary brand colors - Orange zest and lime
    '--color-primary': '#FF8C00',
    '--color-primary-light': '#FFB347',
    '--color-primary-dark': '#FF7F00',
    '--color-primary-subtle': '#FFF8E1',
    
    // Secondary colors - Lime green and grapefruit
    '--color-secondary': '#32CD32',
    '--color-secondary-light': '#90EE90',
    '--color-secondary-dark': '#228B22',
    
    // Header and Footer - Orange zest
    '--color-header-bg': '#FF7F00',
    '--color-header-text': '#FFFFFF',
    '--color-footer-bg': '#FF7F00',
    '--color-footer-text': '#FFFFFF',
    
    // Buttons - Citrus energy
    '--color-button-primary': '#FF8C00',
    '--color-button-primary-hover': '#32CD32',
    '--color-button-primary-text': '#FFFFFF',
    '--color-button-secondary': '#32CD32',
    '--color-button-secondary-hover': '#FF8C00',
    '--color-button-secondary-text': '#FFFFFF',
    
    // Backgrounds - Fresh and bright
    '--color-background': '#FFFEF7',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#F0FFF0',
    '--color-card-bg': '#FFFFFF',
    
    // Text colors - Fresh contrast
    '--color-text': '#2D4A2D',
    '--color-text-light': '#4A6B4A',
    '--color-text-muted': '#6B8E6B',
    '--color-text-inverse': '#FFFFFF',
    
    // Navigation - Citrus fresh
    '--color-nav-active': '#FF8C00',
    '--color-nav-hover': '#90EE90',
    '--color-nav-text': '#4A6B4A',
    
    // Status colors - Fresh themed
    '--color-success': '#32CD32',
    '--color-warning': '#FF8C00',
    '--color-error': '#FF6347',
    '--color-info': '#00BFFF'
  },
  midnight: {
    name: 'Midnight Luxury',
    // Primary brand colors - Luxury dark with gold accents
    '--color-primary': '#1C1C1C',
    '--color-primary-light': '#4A4A4A',
    '--color-primary-dark': '#0A0A0A',
    '--color-primary-subtle': '#F5F5F5',
    
    // Secondary colors - Gold and bronze
    '--color-secondary': '#FFD700',
    '--color-secondary-light': '#FFED4E',
    '--color-secondary-dark': '#DAA520',
    
    // Header and Footer - Pure black luxury
    '--color-header-bg': '#000000',
    '--color-header-text': '#FFD700',
    '--color-footer-bg': '#000000',
    '--color-footer-text': '#FFD700',
    
    // Buttons - Luxury gold
    '--color-button-primary': '#FFD700',
    '--color-button-primary-hover': '#FFA500',
    '--color-button-primary-text': '#000000',
    '--color-button-secondary': '#1C1C1C',
    '--color-button-secondary-hover': '#4A4A4A',
    '--color-button-secondary-text': '#FFD700',
    
    // Backgrounds - Midnight elegance
    '--color-background': '#0A0A0A',
    '--color-surface': '#1C1C1C',
    '--color-section-bg': '#2A2A2A',
    '--color-card-bg': '#1C1C1C',
    
    // Text colors - Luxury contrast
    '--color-text': '#FFFFFF',
    '--color-text-light': '#E0E0E0',
    '--color-text-muted': '#B0B0B0',
    '--color-text-inverse': '#000000',
    
    // Navigation - Gold luxury
    '--color-nav-active': '#FFD700',
    '--color-nav-hover': '#FFED4E',
    '--color-nav-text': '#E0E0E0',
    
    // Status colors - Luxury themed
    '--color-success': '#50C878',
    '--color-warning': '#FFD700',
    '--color-error': '#FF6B6B',
    '--color-info': '#87CEEB'
  },
  forest: {
    name: 'Dark Forest',
    // Primary brand colors - Deep forest greens
    '--color-primary': '#2F4F2F',
    '--color-primary-light': '#8FBC8F',
    '--color-primary-dark': '#1C3A1C',
    '--color-primary-subtle': '#F0FFF0',
    
    // Secondary colors - Mossy and earthy
    '--color-secondary': '#6B8E23',
    '--color-secondary-light': '#9ACD32',
    '--color-secondary-dark': '#556B2F',
    
    // Header and Footer - Deep forest
    '--color-header-bg': '#1C3A1C',
    '--color-header-text': '#F0FFF0',
    '--color-footer-bg': '#1C3A1C',
    '--color-footer-text': '#F0FFF0',
    
    // Buttons - Forest growth
    '--color-button-primary': '#2F4F2F',
    '--color-button-primary-hover': '#6B8E23',
    '--color-button-primary-text': '#FFFFFF',
    '--color-button-secondary': '#6B8E23',
    '--color-button-secondary-hover': '#2F4F2F',
    '--color-button-secondary-text': '#FFFFFF',
    
    // Backgrounds - Natural earth
    '--color-background': '#FAFFF0',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#F0FFF0',
    '--color-card-bg': '#FFFFFF',
    
    // Text colors - Forest contrast
    '--color-text': '#1C3A1C',
    '--color-text-light': '#2F4F2F',
    '--color-text-muted': '#556B2F',
    '--color-text-inverse': '#FFFFFF',
    
    // Navigation - Forest path
    '--color-nav-active': '#2F4F2F',
    '--color-nav-hover': '#8FBC8F',
    '--color-nav-text': '#2F4F2F',
    
    // Status colors - Nature themed
    '--color-success': '#32CD32',
    '--color-warning': '#DAA520',
    '--color-error': '#B22222',
    '--color-info': '#4682B4'
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
  },
  aurora: {
    name: 'Aurora Light',
    '--color-primary': '#50C9C3',
    '--color-primary-light': '#A1E3E0',
    '--color-primary-dark': '#329B96',
    '--color-primary-subtle': '#E6FAF9',
    '--color-secondary': '#FFD700',
    '--color-secondary-light': '#FFF59D',
    '--color-secondary-dark': '#E6BE00',
    '--color-header-bg': '#329B96',
    '--color-header-text': '#FFFFFF',
    '--color-footer-bg': '#329B96',
    '--color-footer-text': '#FFFFFF',
    '--color-button-primary': '#50C9C3',
    '--color-button-primary-hover': '#FFD700',
    '--color-button-primary-text': '#000000',
    '--color-button-secondary': '#FFD700',
    '--color-button-secondary-hover': '#50C9C3',
    '--color-button-secondary-text': '#000000',
    '--color-background': '#FEFEFE',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#E6FAF9',
    '--color-card-bg': '#FFFFFF',
    '--color-text': '#1A1A1A',
    '--color-text-light': '#2D2D2D',
    '--color-text-muted': '#6B7280',
    '--color-text-inverse': '#FFFFFF',
    '--color-nav-active': '#50C9C3',
    '--color-nav-hover': '#FFD700',
    '--color-nav-text': '#2D2D2D',
    '--color-success': '#10B981',
    '--color-warning': '#F59E0B',
    '--color-error': '#EF4444',
    '--color-info': '#06B6D4'
  },

  lava: {
    name: 'Lava Flow',
    '--color-primary': '#D7263D',
    '--color-primary-light': '#F7697D',
    '--color-primary-dark': '#A11D31',
    '--color-primary-subtle': '#FFF1F2',
    '--color-secondary': '#1B1B1E',
    '--color-secondary-light': '#38383D',
    '--color-secondary-dark': '#000000',
    '--color-header-bg': '#1B1B1E',
    '--color-header-text': '#F7697D',
    '--color-footer-bg': '#1B1B1E',
    '--color-footer-text': '#F7697D',
    '--color-button-primary': '#D7263D',
    '--color-button-primary-hover': '#A11D31',
    '--color-button-primary-text': '#FFFFFF',
    '--color-button-secondary': '#38383D',
    '--color-button-secondary-hover': '#D7263D',
    '--color-button-secondary-text': '#FFFFFF',
    '--color-background': '#0D0D0D',
    '--color-surface': '#1C1C1C',
    '--color-section-bg': '#121212',
    '--color-card-bg': '#1C1C1C',
    '--color-text': '#F9F9F9',
    '--color-text-light': '#D1D1D1',
    '--color-text-muted': '#AAAAAA',
    '--color-text-inverse': '#000000',
    '--color-nav-active': '#D7263D',
    '--color-nav-hover': '#38383D',
    '--color-nav-text': '#D1D1D1',
    '--color-success': '#39FF14',
    '--color-warning': '#FFD700',
    '--color-error': '#FF2400',
    '--color-info': '#1E90FF'
  },

  pastelMint: {
    name: 'Pastel Mint',
    '--color-primary': '#98DDCA',
    '--color-primary-light': '#D5F3ED',
    '--color-primary-dark': '#77CBB9',
    '--color-primary-subtle': '#F0FAF7',
    '--color-secondary': '#D291BC',
    '--color-secondary-light': '#EFC7E6',
    '--color-secondary-dark': '#B26AA2',
    '--color-header-bg': '#77CBB9',
    '--color-header-text': '#FFFFFF',
    '--color-footer-bg': '#77CBB9',
    '--color-footer-text': '#FFFFFF',
    '--color-button-primary': '#98DDCA',
    '--color-button-primary-hover': '#D291BC',
    '--color-button-primary-text': '#2D2D2D',
    '--color-button-secondary': '#D291BC',
    '--color-button-secondary-hover': '#98DDCA',
    '--color-button-secondary-text': '#2D2D2D',
    '--color-background': '#FEFEFE',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#F0FAF7',
    '--color-card-bg': '#FFFFFF',
    '--color-text': '#333333',
    '--color-text-light': '#555555',
    '--color-text-muted': '#888888',
    '--color-text-inverse': '#FFFFFF',
    '--color-nav-active': '#98DDCA',
    '--color-nav-hover': '#EFC7E6',
    '--color-nav-text': '#555555',
    '--color-success': '#34D399',
    '--color-warning': '#FB923C',
    '--color-error': '#EF4444',
    '--color-info': '#38BDF8'
  },

  twilight: {
    name: 'Twilight Dusk',
    '--color-primary': '#3B3B98',
    '--color-primary-light': '#7878D1',
    '--color-primary-dark': '#2A2A6B',
    '--color-primary-subtle': '#EFEFFF',
    '--color-secondary': '#D980FA',
    '--color-secondary-light': '#F3C5FF',
    '--color-secondary-dark': '#B05FD0',
    '--color-header-bg': '#2A2A6B',
    '--color-header-text': '#FFFFFF',
    '--color-footer-bg': '#2A2A6B',
    '--color-footer-text': '#FFFFFF',
    '--color-button-primary': '#3B3B98',
    '--color-button-primary-hover': '#D980FA',
    '--color-button-primary-text': '#FFFFFF',
    '--color-button-secondary': '#D980FA',
    '--color-button-secondary-hover': '#3B3B98',
    '--color-button-secondary-text': '#FFFFFF',
    '--color-background': '#F5F5FF',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#EFEFFF',
    '--color-card-bg': '#FFFFFF',
    '--color-text': '#1F2937',
    '--color-text-light': '#374151',
    '--color-text-muted': '#6B7280',
    '--color-text-inverse': '#FFFFFF',
    '--color-nav-active': '#3B3B98',
    '--color-nav-hover': '#D980FA',
    '--color-nav-text': '#374151',
    '--color-success': '#22C55E',
    '--color-warning': '#EAB308',
    '--color-error': '#DC2626',
    '--color-info': '#0EA5E9'
  },

  iceberg: {
    name: 'Frozen Iceberg',
    '--color-primary': '#A0E7E5',
    '--color-primary-light': '#CAF7F5',
    '--color-primary-dark': '#71C3C1',
    '--color-primary-subtle': '#F3FBFB',
    '--color-secondary': '#B4F8C8',
    '--color-secondary-light': '#D7FFE8',
    '--color-secondary-dark': '#80D89C',
    '--color-header-bg': '#71C3C1',
    '--color-header-text': '#FFFFFF',
    '--color-footer-bg': '#71C3C1',
    '--color-footer-text': '#FFFFFF',
    '--color-button-primary': '#A0E7E5',
    '--color-button-primary-hover': '#B4F8C8',
    '--color-button-primary-text': '#000000',
    '--color-button-secondary': '#B4F8C8',
    '--color-button-secondary-hover': '#A0E7E5',
    '--color-button-secondary-text': '#000000',
    '--color-background': '#FEFFFF',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#F3FBFB',
    '--color-card-bg': '#FFFFFF',
    '--color-text': '#2D3748',
    '--color-text-light': '#4A5568',
    '--color-text-muted': '#718096',
    '--color-text-inverse': '#FFFFFF',
    '--color-nav-active': '#A0E7E5',
    '--color-nav-hover': '#CAF7F5',
    '--color-nav-text': '#4A5568',
    '--color-success': '#38B2AC',
    '--color-warning': '#ECC94B',
    '--color-error': '#F56565',
    '--color-info': '#63B3ED'
  },
  sunrise: {
    name: 'Golden Sunrise',
    '--color-primary': '#FDB813',
    '--color-primary-light': '#FFE082',
    '--color-primary-dark': '#F57C00',
    '--color-primary-subtle': '#FFF8E1',
    '--color-secondary': '#FF6F61',
    '--color-secondary-light': '#FFB4A2',
    '--color-secondary-dark': '#E64A19',
    '--color-header-bg': '#F57C00',
    '--color-header-text': '#FFFFFF',
    '--color-footer-bg': '#F57C00',
    '--color-footer-text': '#FFFFFF',
    '--color-button-primary': '#FDB813',
    '--color-button-primary-hover': '#FF6F61',
    '--color-button-primary-text': '#000000',
    '--color-button-secondary': '#FF6F61',
    '--color-button-secondary-hover': '#FDB813',
    '--color-button-secondary-text': '#000000',
    '--color-background': '#FFFEF7',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#FFF8E1',
    '--color-card-bg': '#FFFFFF',
    '--color-text': '#2D2D2D',
    '--color-text-light': '#4A4A4A',
    '--color-text-muted': '#777777',
    '--color-text-inverse': '#FFFFFF',
    '--color-nav-active': '#FDB813',
    '--color-nav-hover': '#FFB4A2',
    '--color-nav-text': '#4A4A4A',
    '--color-success': '#32CD32',
    '--color-warning': '#FFA500',
    '--color-error': '#D32F2F',
    '--color-info': '#03A9F4'
  },

  denim: {
    name: 'Denim Depths',
    '--color-primary': '#1E3A8A',
    '--color-primary-light': '#3B82F6',
    '--color-primary-dark': '#1E40AF',
    '--color-primary-subtle': '#E0E7FF',
    '--color-secondary': '#64748B',
    '--color-secondary-light': '#CBD5E1',
    '--color-secondary-dark': '#334155',
    '--color-header-bg': '#1E3A8A',
    '--color-header-text': '#FFFFFF',
    '--color-footer-bg': '#1E3A8A',
    '--color-footer-text': '#FFFFFF',
    '--color-button-primary': '#3B82F6',
    '--color-button-primary-hover': '#1E40AF',
    '--color-button-primary-text': '#FFFFFF',
    '--color-button-secondary': '#CBD5E1',
    '--color-button-secondary-hover': '#64748B',
    '--color-button-secondary-text': '#1E3A8A',
    '--color-background': '#F8FAFC',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#E0E7FF',
    '--color-card-bg': '#FFFFFF',
    '--color-text': '#1E293B',
    '--color-text-light': '#334155',
    '--color-text-muted': '#64748B',
    '--color-text-inverse': '#FFFFFF',
    '--color-nav-active': '#3B82F6',
    '--color-nav-hover': '#CBD5E1',
    '--color-nav-text': '#334155',
    '--color-success': '#22C55E',
    '--color-warning': '#EAB308',
    '--color-error': '#DC2626',
    '--color-info': '#0EA5E9'
  },

  blush: {
    name: 'Modern Blush',
    '--color-primary': '#FCA5A5',
    '--color-primary-light': '#FCDCDC',
    '--color-primary-dark': '#F87171',
    '--color-primary-subtle': '#FFF5F5',
    '--color-secondary': '#C084FC',
    '--color-secondary-light': '#E9D5FF',
    '--color-secondary-dark': '#A855F7',
    '--color-header-bg': '#F87171',
    '--color-header-text': '#FFFFFF',
    '--color-footer-bg': '#F87171',
    '--color-footer-text': '#FFFFFF',
    '--color-button-primary': '#FCA5A5',
    '--color-button-primary-hover': '#C084FC',
    '--color-button-primary-text': '#000000',
    '--color-button-secondary': '#C084FC',
    '--color-button-secondary-hover': '#FCA5A5',
    '--color-button-secondary-text': '#000000',
    '--color-background': '#FFFEFE',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#FFF5F5',
    '--color-card-bg': '#FFFFFF',
    '--color-text': '#2D2D2D',
    '--color-text-light': '#4A4A4A',
    '--color-text-muted': '#888888',
    '--color-text-inverse': '#FFFFFF',
    '--color-nav-active': '#FCA5A5',
    '--color-nav-hover': '#E9D5FF',
    '--color-nav-text': '#4A4A4A',
    '--color-success': '#16A34A',
    '--color-warning': '#F97316',
    '--color-error': '#DC2626',
    '--color-info': '#3B82F6'
  },

  graphite: {
    name: 'Graphite Contrast',
    '--color-primary': '#111827',
    '--color-primary-light': '#374151',
    '--color-primary-dark': '#0F172A',
    '--color-primary-subtle': '#F8FAFC',
    '--color-secondary': '#FACC15',
    '--color-secondary-light': '#FDE68A',
    '--color-secondary-dark': '#CA8A04',
    '--color-header-bg': '#0F172A',
    '--color-header-text': '#FACC15',
    '--color-footer-bg': '#0F172A',
    '--color-footer-text': '#FACC15',
    '--color-button-primary': '#111827',
    '--color-button-primary-hover': '#CA8A04',
    '--color-button-primary-text': '#FACC15',
    '--color-button-secondary': '#FACC15',
    '--color-button-secondary-hover': '#111827',
    '--color-button-secondary-text': '#111827',
    '--color-background': '#F9FAFB',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#F3F4F6',
    '--color-card-bg': '#FFFFFF',
    '--color-text': '#111827',
    '--color-text-light': '#374151',
    '--color-text-muted': '#6B7280',
    '--color-text-inverse': '#FACC15',
    '--color-nav-active': '#FACC15',
    '--color-nav-hover': '#FDE68A',
    '--color-nav-text': '#374151',
    '--color-success': '#22C55E',
    '--color-warning': '#F59E0B',
    '--color-error': '#EF4444',
    '--color-info': '#0EA5E9'
  },

  terracotta: {
    name: 'Modern Terracotta',
    '--color-primary': '#E2725B',
    '--color-primary-light': '#F2A89A',
    '--color-primary-dark': '#C64D3A',
    '--color-primary-subtle': '#FFF5F2',
    '--color-secondary': '#A26769',
    '--color-secondary-light': '#CDA3A6',
    '--color-secondary-dark': '#814B4D',
    '--color-header-bg': '#C64D3A',
    '--color-header-text': '#FFFFFF',
    '--color-footer-bg': '#C64D3A',
    '--color-footer-text': '#FFFFFF',
    '--color-button-primary': '#E2725B',
    '--color-button-primary-hover': '#A26769',
    '--color-button-primary-text': '#FFFFFF',
    '--color-button-secondary': '#A26769',
    '--color-button-secondary-hover': '#E2725B',
    '--color-button-secondary-text': '#FFFFFF',
    '--color-background': '#FEFEFE',
    '--color-surface': '#FFFFFF',
    '--color-section-bg': '#FFF5F2',
    '--color-card-bg': '#FFFFFF',
    '--color-text': '#3B1F1F',
    '--color-text-light': '#5E3B3B',
    '--color-text-muted': '#927878',
    '--color-text-inverse': '#FFFFFF',
    '--color-nav-active': '#E2725B',
    '--color-nav-hover': '#F2A89A',
    '--color-nav-text': '#5E3B3B',
    '--color-success': '#22C55E',
    '--color-warning': '#F59E0B',
    '--color-error': '#DC2626',
    '--color-info': '#0EA5E9'
  },
};

/**
 * Apply a theme by updating CSS variables
 */
export const applyTheme = (themeName) => {
  const theme = themes[themeName];
  if (!theme) {
    console.error('❌ Theme not found:', themeName);
    console.log('Available themes:', Object.keys(themes));
    return;
  }
  
  console.log('🎨 Applying theme:', themeName, '→', theme.name);
  
  const root = document.documentElement;
  let appliedCount = 0;
  
  Object.entries(theme).forEach(([property, value]) => {
    if (property !== 'name') {
      root.style.setProperty(property, value);
      appliedCount++;
      console.log(`  ✓ ${property}: ${value}`);
    }
  });
  
  localStorage.setItem('selectedTheme', themeName);
  
  console.log(`✅ Theme applied: ${theme.name} (${appliedCount} variables)`);
  
  // Verify a few key variables were actually set
  const computedStyle = getComputedStyle(root);
  const primaryColor = computedStyle.getPropertyValue('--color-primary').trim();
  const backgroundColor = computedStyle.getPropertyValue('--color-background').trim();
  
  console.log('🔍 Verification:');
  console.log(`  --color-primary: ${primaryColor}`);
  console.log(`  --color-background: ${backgroundColor}`);
  
  if (!primaryColor || !backgroundColor) {
    console.warn('⚠️ Some CSS variables may not have been applied correctly!');
  }
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
 * Load theme from global settings (NO DATABASE CALLS)
 * This function should only be used for initial theme loading
 * All theme changes should go through the global settings context
 */
export const loadThemeFromGlobalSettings = (settings) => {
  try {
    const savedTheme = settings?.theme_name;
    
    if (savedTheme && themes[savedTheme]) {
      applyTheme(savedTheme);
      return savedTheme;
    }
    
    // Fallback to localStorage if no global theme
    loadSavedTheme();
    return getCurrentTheme();
  } catch (error) {
    // console.error('Error loading theme from global settings:', error);
    // Fallback to localStorage
    loadSavedTheme();
    return getCurrentTheme();
  }
};

/**
 * Apply theme immediately (used by global settings context)
 * This is for immediate theme application without database calls
 */
export const applyThemeFromSettings = (themeName) => {
  try {
    if (themeName && themes[themeName]) {
      applyTheme(themeName);
      // Also update localStorage for persistence
      localStorage.setItem('selectedTheme', themeName);
      return true;
    }
    return false;
  } catch (error) {
    // console.error('Error applying theme:', error);
    return false;
  }
};

/**
 * DEPRECATED: Use global settings context instead
 * Legacy function kept for backwards compatibility
 */
export const loadThemeFromSettings = async (settingsService) => {
  console.warn('⚠️ loadThemeFromSettings is deprecated. Use global settings context instead.');
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
 * DEPRECATED: Use global settings context updateSettings instead
 * Legacy function kept for backwards compatibility
 */
export const saveThemeToSettings = async (themeName, settingsService) => {
  console.warn('⚠️ saveThemeToSettings is deprecated. Use global settings context updateSettings instead.');
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
