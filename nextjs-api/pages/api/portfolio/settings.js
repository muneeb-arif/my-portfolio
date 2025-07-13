const { query } = require('../../../lib/database');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get all settings for the user
    const settings = await query(
      'SELECT setting_key, setting_value FROM portfolio_settings WHERE user_id = ?',
      [userId]
    );

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

    // Get categories and domains for this user
    const [categories, domains] = await Promise.all([
      query('SELECT * FROM categories WHERE user_id = ? ORDER BY name', [userId]),
      query('SELECT * FROM domains_technologies WHERE user_id = ? ORDER BY name', [userId])
    ]);

    res.status(200).json({
      success: true,
      settings: settingsObject,
      categories,
      domains
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch settings' 
    });
  }
} 