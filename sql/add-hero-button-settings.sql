-- =====================================================
-- 🚀 ADD HERO BUTTON SETTINGS MIGRATION
-- =====================================================
-- This script adds new settings for controlling hero buttons

-- Add new settings for hero button controls
INSERT IGNORE INTO settings (id, user_id, `setting_key`, setting_value, created_at, updated_at) 
SELECT 
  UUID() as id,
  user_id,
  'show_view_work_button' as `setting_key`,
  'true' as setting_value,
  NOW() as created_at,
  NOW() as updated_at
FROM settings 
WHERE `setting_key` = 'show_resume_download'
GROUP BY user_id;

-- Add custom button settings
INSERT IGNORE INTO settings (id, user_id, `setting_key`, setting_value, created_at, updated_at) 
SELECT 
  UUID() as id,
  user_id,
  'custom_button_title' as `setting_key`,
  '' as setting_value,
  NOW() as created_at,
  NOW() as updated_at
FROM settings 
WHERE `setting_key` = 'show_resume_download'
GROUP BY user_id;

INSERT IGNORE INTO settings (id, user_id, `setting_key`, setting_value, created_at, updated_at) 
SELECT 
  UUID() as id,
  user_id,
  'custom_button_link' as `setting_key`,
  '' as setting_value,
  NOW() as created_at,
  NOW() as updated_at
FROM settings 
WHERE `setting_key` = 'show_resume_download'
GROUP BY user_id;

INSERT IGNORE INTO settings (id, user_id, `setting_key`, setting_value, created_at, updated_at) 
SELECT 
  UUID() as id,
  user_id,
  'custom_button_target' as `setting_key`,
  '_self' as setting_value,
  NOW() as created_at,
  NOW() as updated_at
FROM settings 
WHERE `setting_key` = 'show_resume_download'
GROUP BY user_id;

-- Verify the migration
SELECT 
  user_id,
  `setting_key`,
  setting_value,
  created_at
FROM settings 
WHERE `setting_key` IN ('show_view_work_button', 'custom_button_title', 'custom_button_link', 'custom_button_target')
ORDER BY user_id, `setting_key`; 