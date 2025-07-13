import { query } from '../../../lib/database.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Fetching public settings...');

    // Get public settings (no user authentication required)
    // We'll get settings for the first active portfolio user as default
    const sql = `
      SELECT s.setting_key, s.setting_value 
      FROM settings s
      JOIN users u ON s.user_id = u.id
      WHERE s.setting_key IN (
        'primary_color', 'secondary_color', 'accent_color',
        'site_title', 'site_description', 'site_logo',
        'theme_mode', 'color_scheme'
      )
      LIMIT 20
    `;

    const settings = await query(sql, []);

    // Convert array to object
    const settingsObject = {};
    settings.forEach(setting => {
      try {
        // Try to parse as JSON, fallback to string
        settingsObject[setting.setting_key] = JSON.parse(setting.setting_value);
      } catch (e) {
        settingsObject[setting.setting_key] = setting.setting_value;
      }
    });

    // Add default values for missing settings
    const defaultSettings = {
      primary_color: '#3b82f6',
      secondary_color: '#1e40af', 
      accent_color: '#f59e0b',
      site_title: 'Portfolio',
      site_description: 'Professional Portfolio',
      theme_mode: 'light',
      color_scheme: 'blue'
    };

    const finalSettings = { ...defaultSettings, ...settingsObject };

    res.status(200).json({
      success: true,
      data: finalSettings
    });

  } catch (error) {
    console.error('Public settings fetch error:', error);
    
    // Return default settings on error
    res.status(200).json({
      success: true,
      data: {
        primary_color: '#3b82f6',
        secondary_color: '#1e40af',
        accent_color: '#f59e0b',
        site_title: 'Portfolio',
        site_description: 'Professional Portfolio',
        theme_mode: 'light',
        color_scheme: 'blue'
      }
    });
  }
} 