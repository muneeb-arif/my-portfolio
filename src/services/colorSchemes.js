// Predefined color schemes for the portfolio
export const colorSchemes = {
  desert: {
    name: 'Desert Sands',
    description: 'Warm desert tones with sand and earth colors',
    colors: {
      primary: '#E9CBA7',      // Sand light
      secondary: '#C9A77D',    // Wet sand
      accent: '#B8936A',       // Sand dark
      background: '#F5E6D3',   // Sand background
      text: '#4A5568',         // Dark gray text
      textLight: '#718096',    // Light gray text
      white: '#FFFFFF',
      black: '#1A202C',
      success: '#48BB78',
      warning: '#ED8936',
      error: '#F56565',
      info: '#4299E1'
    },
    rgb: {
      primary: '233, 203, 167',
      secondary: '201, 167, 125',
      accent: '184, 147, 106',
      background: '245, 230, 211',
      text: '74, 85, 104',
      textLight: '113, 128, 150',
      white: '255, 255, 255',
      black: '26, 32, 44'
    }
  },
  ocean: {
    name: 'Ocean Blue',
    description: 'Cool ocean tones with blue and teal colors',
    colors: {
      primary: '#63B3ED',      // Blue light
      secondary: '#4299E1',    // Blue medium
      accent: '#3182CE',       // Blue dark
      background: '#EBF8FF',   // Blue background
      text: '#2D3748',         // Dark text
      textLight: '#4A5568',    // Light text
      white: '#FFFFFF',
      black: '#1A202C',
      success: '#48BB78',
      warning: '#ED8936',
      error: '#F56565',
      info: '#4299E1'
    },
    rgb: {
      primary: '99, 179, 237',
      secondary: '66, 153, 225',
      accent: '49, 130, 206',
      background: '235, 248, 255',
      text: '45, 55, 72',
      textLight: '74, 85, 104',
      white: '255, 255, 255',
      black: '26, 32, 44'
    }
  },
  forest: {
    name: 'Forest Green',
    description: 'Natural forest tones with green and brown colors',
    colors: {
      primary: '#68D391',      // Green light
      secondary: '#48BB78',    // Green medium
      accent: '#38A169',       // Green dark
      background: '#F0FFF4',   // Green background
      text: '#2D3748',         // Dark text
      textLight: '#4A5568',    // Light text
      white: '#FFFFFF',
      black: '#1A202C',
      success: '#48BB78',
      warning: '#ED8936',
      error: '#F56565',
      info: '#4299E1'
    },
    rgb: {
      primary: '104, 211, 145',
      secondary: '72, 187, 120',
      accent: '56, 161, 105',
      background: '240, 255, 244',
      text: '45, 55, 72',
      textLight: '74, 85, 104',
      white: '255, 255, 255',
      black: '26, 32, 44'
    }
  },
  sunset: {
    name: 'Sunset Orange',
    description: 'Warm sunset tones with orange and purple colors',
    colors: {
      primary: '#F6AD55',      // Orange light
      secondary: '#ED8936',    // Orange medium
      accent: '#DD6B20',       // Orange dark
      background: '#FFFBEB',   // Orange background
      text: '#2D3748',         // Dark text
      textLight: '#4A5568',    // Light text
      white: '#FFFFFF',
      black: '#1A202C',
      success: '#48BB78',
      warning: '#ED8936',
      error: '#F56565',
      info: '#4299E1'
    },
    rgb: {
      primary: '246, 173, 85',
      secondary: '237, 137, 54',
      accent: '221, 107, 32',
      background: '255, 251, 235',
      text: '45, 55, 72',
      textLight: '74, 85, 104',
      white: '255, 255, 255',
      black: '26, 32, 44'
    }
  },
  midnight: {
    name: 'Midnight Dark',
    description: 'Dark theme with deep blues and grays',
    colors: {
      primary: '#4A5568',      // Gray light
      secondary: '#2D3748',    // Gray medium
      accent: '#1A202C',       // Gray dark
      background: '#171923',   // Dark background
      text: '#E2E8F0',         // Light text
      textLight: '#A0AEC0',    // Light gray text
      white: '#FFFFFF',
      black: '#000000',
      success: '#48BB78',
      warning: '#ED8936',
      error: '#F56565',
      info: '#4299E1'
    },
    rgb: {
      primary: '74, 85, 104',
      secondary: '45, 55, 72',
      accent: '26, 32, 44',
      background: '23, 25, 35',
      text: '226, 232, 240',
      textLight: '160, 174, 192',
      white: '255, 255, 255',
      black: '0, 0, 0'
    }
  },
  lavender: {
    name: 'Lavender Purple',
    description: 'Soft lavender tones with purple and pink colors',
    colors: {
      primary: '#B794F4',      // Purple light
      secondary: '#9F7AEA',    // Purple medium
      accent: '#805AD5',       // Purple dark
      background: '#FAF5FF',   // Purple background
      text: '#2D3748',         // Dark text
      textLight: '#4A5568',    // Light text
      white: '#FFFFFF',
      black: '#1A202C',
      success: '#48BB78',
      warning: '#ED8936',
      error: '#F56565',
      info: '#4299E1'
    },
    rgb: {
      primary: '183, 148, 244',
      secondary: '159, 122, 234',
      accent: '128, 90, 213',
      background: '250, 245, 255',
      text: '45, 55, 72',
      textLight: '74, 85, 104',
      white: '255, 255, 255',
      black: '26, 32, 44'
    }
  }
};

// Get a specific color scheme
export const getColorScheme = (schemeName) => {
  return colorSchemes[schemeName] || colorSchemes.desert;
};

// Get all available color schemes
export const getAvailableColorSchemes = () => {
  return Object.keys(colorSchemes).map(key => ({
    id: key,
    ...colorSchemes[key]
  }));
};

// Apply color scheme to CSS custom properties
export const applyColorScheme = (schemeName) => {
  const scheme = getColorScheme(schemeName);
  const root = document.documentElement;
  
  // Set hex color variables
  Object.entries(scheme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  // Set RGB color variables
  Object.entries(scheme.rgb).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}-rgb`, value);
  });
  
  // Also set legacy CSS variables for backward compatibility
  root.style.setProperty('--sand-light', scheme.colors.primary);
  root.style.setProperty('--wet-sand', scheme.colors.secondary);
  root.style.setProperty('--sand-dark', scheme.colors.accent);
  root.style.setProperty('--warm-brown', scheme.colors.text);
  root.style.setProperty('--desert-sand', scheme.colors.primary);
  
      // console.log(`🎨 Applied color scheme: ${scheme.name}`);
}; 