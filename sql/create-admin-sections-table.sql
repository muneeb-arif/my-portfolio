-- =====================================================
-- 🚀 CREATE ADMIN SECTIONS TABLE
-- =====================================================
-- This script creates the admin_sections table to handle
-- admin-only dashboard sections and their permissions

-- =====================================================
-- 1. CREATE ADMIN SECTIONS TABLE
-- =====================================================

-- Create admin_sections table
CREATE TABLE IF NOT EXISTS admin_sections (
  id VARCHAR(36) PRIMARY KEY,
  section_key VARCHAR(100) NOT NULL UNIQUE,
  section_name VARCHAR(255) NOT NULL,
  section_description TEXT,
  icon VARCHAR(100),
  route_path VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_section_key (section_key),
  INDEX idx_is_active (is_active),
  INDEX idx_sort_order (sort_order)
);

-- =====================================================
-- 2. INSERT ADMIN SECTIONS
-- =====================================================

-- Insert the admin-only dashboard sections
INSERT IGNORE INTO admin_sections (id, section_key, section_name, section_description, icon, route_path, sort_order) VALUES 
  (UUID(), 'backup_files', 'Backup Files', 'Manage and download backup files of the system', 'Archive', '/admin/backup-files', 1),
  (UUID(), 'theme_updates', 'Theme Updates', 'Manage theme updates and customizations', 'Palette', '/admin/theme-updates', 2),
  (UUID(), 'import_export', 'Import Export', 'Import and export data between systems', 'Exchange', '/admin/import-export', 3),
  (UUID(), 'debug_sync', 'Debug / Sync', 'Debug tools and synchronization utilities', 'Bug', '/admin/debug-sync', 4);

-- =====================================================
-- 3. CREATE ADMIN SECTION PERMISSIONS TABLE
-- =====================================================

-- Create admin_section_permissions table to link users to sections
CREATE TABLE IF NOT EXISTS admin_section_permissions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  section_id VARCHAR(36) NOT NULL,
  can_access BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_section (user_id, section_id),
  INDEX idx_user_id (user_id),
  INDEX idx_section_id (section_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (section_id) REFERENCES admin_sections(id) ON DELETE CASCADE
);

-- =====================================================
-- 4. SET UP ADMIN PERMISSIONS
-- =====================================================

-- Grant full permissions to the admin user for all sections
INSERT IGNORE INTO admin_section_permissions (id, user_id, section_id, can_access, can_edit, can_delete)
SELECT 
  UUID(),
  u.id as user_id,
  s.id as section_id,
  TRUE as can_access,
  TRUE as can_edit,
  TRUE as can_delete
FROM users u
CROSS JOIN admin_sections s
WHERE u.email = 'muneebarif11@gmail.com';

-- =====================================================
-- 5. VERIFICATION QUERIES
-- =====================================================

-- Show all admin sections
SELECT 'Admin Sections:' as info;
SELECT id, section_key, section_name, section_description, icon, route_path, is_active, sort_order 
FROM admin_sections 
ORDER BY sort_order;

-- Show admin permissions
SELECT 'Admin Permissions:' as info;
SELECT 
  u.email,
  u.name,
  s.section_name,
  p.can_access,
  p.can_edit,
  p.can_delete
FROM admin_section_permissions p
JOIN users u ON p.user_id = u.id
JOIN admin_sections s ON p.section_id = s.id
WHERE u.email = 'muneebarif11@gmail.com'
ORDER BY s.sort_order;

-- Show all users with their admin status and section access
SELECT 'All Users Admin Status:' as info;
SELECT 
  u.email,
  u.name,
  CASE WHEN u.is_admin = 1 THEN 'ADMIN' ELSE 'USER' END as role,
  COUNT(p.id) as sections_with_access
FROM users u
LEFT JOIN admin_section_permissions p ON u.id = p.user_id AND p.can_access = TRUE
GROUP BY u.id, u.email, u.name, u.is_admin
ORDER BY u.is_admin DESC, u.created_at DESC; 