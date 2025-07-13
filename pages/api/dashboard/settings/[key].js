import { withAuth } from '../../../../lib/auth';
import { executeQuery } from '../../../../lib/database';

async function handler(req, res) {
  const { user } = req;
  const { key } = req.query;

  if (req.method === 'GET') {
    try {
      // Get specific setting for the authenticated user
      const [setting] = await executeQuery(`
        SELECT * FROM settings 
        WHERE user_id = ? AND setting_key = ?
      `, [user.id, key]);

      if (!setting) {
        return res.status(404).json({
          success: false,
          error: 'Setting not found'
        });
      }

      let value;
      try {
        value = JSON.parse(setting.setting_value);
      } catch {
        value = setting.setting_value;
      }

      res.status(200).json({
        success: true,
        data: {
          key: setting.setting_key,
          value: value
        }
      });
    } catch (error) {
      console.error('Error fetching setting:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch setting'
      });
    }
  } else if (req.method === 'PUT') {
    try {
      const { value } = req.body;

      if (value === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Value is required'
        });
      }

      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

      // Update or insert the setting
      await executeQuery(`
        INSERT INTO settings (user_id, setting_key, setting_value, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
        setting_value = VALUES(setting_value),
        updated_at = NOW()
      `, [user.id, key, stringValue]);

      res.status(200).json({
        success: true,
        data: {
          key: key,
          value: value
        }
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update setting'
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Verify setting belongs to user
      const [setting] = await executeQuery(`
        SELECT id FROM settings WHERE user_id = ? AND setting_key = ?
      `, [user.id, key]);

      if (!setting) {
        return res.status(404).json({
          success: false,
          error: 'Setting not found'
        });
      }

      // Delete setting
      await executeQuery(`
        DELETE FROM settings WHERE user_id = ? AND setting_key = ?
      `, [user.id, key]);

      res.status(200).json({
        success: true,
        message: 'Setting deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting setting:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete setting'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }
}

export default withAuth(handler); 