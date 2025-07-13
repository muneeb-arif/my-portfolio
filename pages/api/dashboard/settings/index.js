import { withAuth } from '../../../../lib/auth';
import { executeQuery } from '../../../../lib/database';

async function handler(req, res) {
  const { user } = req;

  if (req.method === 'GET') {
    try {
      // Get all settings for the authenticated user
      const settings = await executeQuery(`
        SELECT * FROM settings 
        WHERE user_id = ? 
        ORDER BY setting_key ASC
      `, [user.id]);

      // Convert settings array to key-value object for easier use
      const settingsObj = {};
      settings.forEach(setting => {
        try {
          // Try to parse JSON values, fallback to string if not valid JSON
          settingsObj[setting.setting_key] = JSON.parse(setting.setting_value);
        } catch {
          settingsObj[setting.setting_key] = setting.setting_value;
        }
      });

      res.status(200).json({
        success: true,
        data: settingsObj
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch settings'
      });
    }
  } else if (req.method === 'PUT') {
    try {
      const settingsData = req.body;

      if (!settingsData || typeof settingsData !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Settings data must be an object'
        });
      }

      // Update or insert settings
      for (const [key, value] of Object.entries(settingsData)) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        
        await executeQuery(`
          INSERT INTO settings (user_id, setting_key, setting_value, created_at, updated_at)
          VALUES (?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE
          setting_value = VALUES(setting_value),
          updated_at = NOW()
        `, [user.id, key, stringValue]);
      }

      // Get updated settings
      const updatedSettings = await executeQuery(`
        SELECT * FROM settings 
        WHERE user_id = ? 
        ORDER BY setting_key ASC
      `, [user.id]);

      // Convert to object format
      const settingsObj = {};
      updatedSettings.forEach(setting => {
        try {
          settingsObj[setting.setting_key] = JSON.parse(setting.setting_value);
        } catch {
          settingsObj[setting.setting_key] = setting.setting_value;
        }
      });

      res.status(200).json({
        success: true,
        data: settingsObj
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update settings'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }
}

export default withAuth(handler); 