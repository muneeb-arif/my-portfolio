/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Theme colors using CSS variables
        'primary': 'var(--color-primary)',
        'primary-light': 'var(--color-primary-light)',
        'primary-dark': 'var(--color-primary-dark)',
        'primary-subtle': 'var(--color-primary-subtle)',
        'secondary': 'var(--color-secondary)',
        'secondary-light': 'var(--color-secondary-light)',
        'secondary-dark': 'var(--color-secondary-dark)',
        
        // Header and Footer
        'header-bg': 'var(--color-header-bg)',
        'header-text': 'var(--color-header-text)',
        'footer-bg': 'var(--color-footer-bg)',
        'footer-text': 'var(--color-footer-text)',
        
        // Buttons
        'button-primary': 'var(--color-button-primary)',
        'button-primary-hover': 'var(--color-button-primary-hover)',
        'button-primary-text': 'var(--color-button-primary-text)',
        'button-secondary': 'var(--color-button-secondary)',
        'button-secondary-hover': 'var(--color-button-secondary-hover)',
        'button-secondary-text': 'var(--color-button-secondary-text)',
        
        // Backgrounds
        'surface': 'var(--color-surface)',
        'section-bg': 'var(--color-section-bg)',
        'card-bg': 'var(--color-card-bg)',
        
        // Text colors
        'text': 'var(--color-text)',
        'text-light': 'var(--color-text-light)',
        'text-muted': 'var(--color-text-muted)',
        'text-inverse': 'var(--color-text-inverse)',
        
        // Navigation
        'nav-active': 'var(--color-nav-active)',
        'nav-hover': 'var(--color-nav-hover)',
        'nav-text': 'var(--color-nav-text)',
        
        // Legacy sand colors (now mapped to CSS variables)
        'desert-sand': 'var(--color-primary-light)',
        'wet-sand': 'var(--color-primary)',
        'sand-dark': 'var(--color-primary-dark)',
        'sand-light': 'var(--color-primary-subtle)',
        
        // Status colors
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
        'error': 'var(--color-error)',
        'info': 'var(--color-info)',
      },
      fontFamily: {
        'sans': ['Open Sans', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        'desert-gradient': 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%)',
        'hero-gradient': 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary-light) 90%, transparent) 0%, color-mix(in srgb, var(--color-primary) 80%, transparent) 100%)',
        'theme-gradient': 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 50%, var(--color-primary-dark) 100%)',
        'button-gradient': 'linear-gradient(135deg, var(--color-button-primary) 0%, var(--color-button-primary-hover) 100%)',
        
        // Specific theme gradients for variety
        'cyberpunk-glow': 'linear-gradient(135deg, #00D4FF 0%, #FF007A 50%, #A700FF 100%)',
        'cosmic-nebula': 'linear-gradient(135deg, #4C5578 0%, #8A2BE2 50%, #BA55D3 100%)',
        'cherry-blossom': 'linear-gradient(135deg, #FF69B4 0%, #512C3A 50%, #DC143C 100%)',
        'tropical-sunset': 'linear-gradient(135deg, #FF6F61 0%, #40E0D0 50%, #FFD700 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        }
      }
    },
  },
  plugins: [],
} 