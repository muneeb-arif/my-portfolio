-- =====================================================
-- 🚀 ADD ADMIN COLUMN TO USERS TABLE
-- =====================================================
-- This script adds an is_admin column to the users table
-- and sets muneebarif11@gmail.com as the admin user

-- =====================================================
-- 1. ADD IS_ADMIN COLUMN
-- =====================================================

-- Add is_admin column to users table
ALTER TABLE users 
ADD COLUMN is_admin TINYINT DEFAULT 0;

-- =====================================================
-- 2. SET ADMIN USER
-- =====================================================

-- Set muneebarif11@gmail.com as admin
UPDATE users 
SET is_admin = 1 
WHERE email = 'muneebarif11@gmail.com';

-- =====================================================
-- 3. VERIFICATION QUERY
-- =====================================================

-- Verify the admin user was set correctly
SELECT id, email, name, full_name, is_admin, created_at 
FROM users 
WHERE email = 'muneebarif11@gmail.com';

-- Show all users with their admin status
SELECT id, email, name, full_name, is_admin, created_at 
FROM users 
ORDER BY created_at DESC; 