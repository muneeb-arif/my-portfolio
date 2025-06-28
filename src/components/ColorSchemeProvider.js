import { useEffect, useRef } from 'react';
import { useSettings } from '../services/settingsContext';
import { applyColorScheme } from '../services/colorSchemes';

const ColorSchemeProvider = () => {
  const { settings, loading } = useSettings();
  const lastAppliedScheme = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only run once when settings are loaded
    if (loading || isInitialized.current) return;

    const colorScheme = settings?.color_scheme || 'desert';
    
    if (colorScheme !== lastAppliedScheme.current) {
      // console.log('🎨 Applying color scheme:', colorScheme);
      applyColorScheme(colorScheme);
      lastAppliedScheme.current = colorScheme;
      isInitialized.current = true;
    }
  }, [loading, settings?.color_scheme]);

  // This component doesn't render anything visible
  return null;
};

export default ColorSchemeProvider; 