-- Fix MySQL UTF-8 encoding issues for migration
-- This script converts all text columns to utf8mb4 to support emojis and special characters

-- Set database character set
ALTER DATABASE portfolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix users table
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix projects table
ALTER TABLE projects CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix categories table
ALTER TABLE categories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix domains_technologies table
ALTER TABLE domains_technologies CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix tech_skills table
ALTER TABLE tech_skills CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix niche table
ALTER TABLE niche CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix settings table
ALTER TABLE settings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix contact_queries table
ALTER TABLE contact_queries CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix project_images table
ALTER TABLE project_images CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix portfolio_config table
ALTER TABLE portfolio_config CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verify the changes
SELECT 
    TABLE_NAME,
    TABLE_COLLATION
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'portfolio' 
ORDER BY TABLE_NAME; 