-- Add Image Position Fields to Settings Table
-- This migration adds position fields for hero banner and avatar images

-- =====================================================
-- ADD NEW POSITION FIELDS
-- =====================================================

-- For MySQL (if using MySQL)
-- Note: These settings will be automatically created when users first access the dashboard
-- The application will handle creating these settings with default values

-- For Supabase/PostgreSQL
-- Note: These settings will be automatically created when users first access the dashboard
-- The application will handle creating these settings with default values

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Check if position settings exist for any user
-- SELECT 
--   user_id,
--   key,
--   value,
--   created_at
-- FROM settings 
-- WHERE key IN (
--   'hero_banner_position_x',
--   'hero_banner_position_y', 
--   'avatar_position_x',
--   'avatar_position_y'
-- )
-- ORDER BY user_id, key;

-- =====================================================
-- MANUAL INSERT EXAMPLE (if needed)
-- =====================================================

-- If you need to manually insert these settings for existing users:

/*
INSERT INTO settings (id, user_id, key, value, created_at, updated_at)
SELECT 
  UUID() as id,
  user_id,
  'hero_banner_position_x' as key,
  '50' as value,
  NOW() as created_at,
  NOW() as updated_at
FROM settings 
WHERE key = 'hero_banner_image'
AND user_id NOT IN (
  SELECT user_id FROM settings WHERE key = 'hero_banner_position_x'
);

INSERT INTO settings (id, user_id, key, value, created_at, updated_at)
SELECT 
  UUID() as id,
  user_id,
  'hero_banner_position_y' as key,
  '50' as value,
  NOW() as created_at,
  NOW() as updated_at
FROM settings 
WHERE key = 'hero_banner_image'
AND user_id NOT IN (
  SELECT user_id FROM settings WHERE key = 'hero_banner_position_y'
);

INSERT INTO settings (id, user_id, key, value, created_at, updated_at)
SELECT 
  UUID() as id,
  user_id,
  'avatar_position_x' as key,
  '50' as value,
  NOW() as created_at,
  NOW() as updated_at
FROM settings 
WHERE key = 'avatar_image'
AND user_id NOT IN (
  SELECT user_id FROM settings WHERE key = 'avatar_position_x'
);

INSERT INTO settings (id, user_id, key, value, created_at, updated_at)
SELECT 
  UUID() as id,
  user_id,
  'avatar_position_y' as key,
  '50' as value,
  NOW() as created_at,
  NOW() as updated_at
FROM settings 
WHERE key = 'avatar_image'
AND user_id NOT IN (
  SELECT user_id FROM settings WHERE key = 'avatar_position_y'
);
*/

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- The new position fields will be automatically created by the application
-- when users access the dashboard appearance settings for the first time.
-- Default values: 50% for both X and Y positions (center) 