import React, { useState, useEffect, useCallback } from 'react';
import { themes, applyTheme, getCurrentTheme } from '../utils/themeUtils';

const ThemeDebugger = () => {
  const [currentTheme, setCurrentTheme] = useState(getCurrentTheme());
  const [cssVariables, setCssVariables] = useState({});

  const updateCssVariables = useCallback(() => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    const variables = {};
    const theme = themes[currentTheme];
    
    if (theme) {
      Object.keys(theme).forEach(property => {
        if (property !== 'name') {
          variables[property] = computedStyle.getPropertyValue(property).trim();
        }
      });
    }
    
    setCssVariables(variables);
  }, [currentTheme]);

  useEffect(() => {
    updateCssVariables();
  }, [currentTheme, updateCssVariables]);

  const handleThemeChange = (themeName) => {
    console.log('🧪 Debug: Changing theme to:', themeName);
    applyTheme(themeName);
    setCurrentTheme(themeName);
    
    // Update CSS variables after a short delay
    setTimeout(updateCssVariables, 100);
  };

  const testTheme = (themeName) => {
    console.log('🧪 Testing theme:', themeName);
    console.log('Theme definition:', themes[themeName]);
    
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    console.log('Applied CSS variables:');
    Object.keys(themes[themeName] || {}).forEach(property => {
      if (property !== 'name') {
        const value = computedStyle.getPropertyValue(property).trim();
        console.log(`  ${property}: ${value}`);
      }
    });
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid var(--color-primary)', 
      borderRadius: '10px',
      backgroundColor: 'var(--color-card-bg)',
      margin: '20px 0'
    }}>
      <h3 style={{ color: 'var(--color-text)' }}>🧪 Theme Debugger</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: 'var(--color-text)' }}>
          Current Theme: <strong>{themes[currentTheme]?.name || currentTheme}</strong>
        </p>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => handleThemeChange(key)}
              onDoubleClick={() => testTheme(key)}
              style={{
                padding: '8px 12px',
                backgroundColor: currentTheme === key ? 'var(--color-primary)' : 'var(--color-secondary)',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {theme.name}
            </button>
          ))}
        </div>
        
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '10px' }}>
          Single click to apply theme, double click to test in console
        </p>
      </div>

      <div>
        <h4 style={{ color: 'var(--color-text)' }}>CSS Variables Status:</h4>
        <div style={{ 
          maxHeight: '200px', 
          overflow: 'auto', 
          fontSize: '11px',
          fontFamily: 'monospace',
          backgroundColor: 'var(--color-section-bg)',
          padding: '10px',
          borderRadius: '5px'
        }}>
          {Object.entries(cssVariables).map(([property, value]) => (
            <div key={property} style={{ margin: '2px 0' }}>
              <span style={{ color: 'var(--color-primary)' }}>{property}:</span>{' '}
              <span style={{ color: value ? 'var(--color-success)' : 'var(--color-error)' }}>
                {value || 'NOT SET'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '15px' }}>
        <h4 style={{ color: 'var(--color-text)' }}>Color Preview:</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['--color-primary', '--color-secondary', '--color-success', '--color-warning', '--color-error'].map(colorVar => (
            <div
              key={colorVar}
              style={{
                width: '50px',
                height: '30px',
                backgroundColor: `var(${colorVar})`,
                border: '1px solid var(--color-text)',
                borderRadius: '3px',
                position: 'relative'
              }}
              title={colorVar}
            >
              <span style={{
                position: 'absolute',
                bottom: '-20px',
                left: '0',
                fontSize: '8px',
                color: 'var(--color-text)',
                whiteSpace: 'nowrap'
              }}>
                {colorVar.replace('--color-', '')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeDebugger; 