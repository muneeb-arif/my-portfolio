-- =====================================================
-- 🚀 CREATE MENUS TABLE
-- =====================================================
-- This script creates the menus table to handle
-- user-created menu items for Header, Footer, and Mobile navigation

-- =====================================================
-- 1. CREATE MENUS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS menus (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  menu_type ENUM('section', 'contact', 'start_project', 'call', 'social_facebook', 'social_linkedin', 'social_github', 'social_instagram') NOT NULL,
  section_id VARCHAR(100), -- For section types, references section (hero, portfolio, etc.) or dynamic section ID
  label VARCHAR(255) NOT NULL, -- Display label for the menu item
  icon VARCHAR(100), -- Icon identifier (optional)
  link_url VARCHAR(500), -- For social links or custom links
  sort_order INT DEFAULT 1, -- For ordering menu items
  is_visible BOOLEAN DEFAULT TRUE, -- Individual visibility toggle
  show_in_header BOOLEAN DEFAULT FALSE, -- Show in header
  show_in_footer BOOLEAN DEFAULT FALSE, -- Show in footer
  show_in_mobile BOOLEAN DEFAULT FALSE, -- Show in mobile nav
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_menu_type (menu_type),
  INDEX idx_is_visible (is_visible),
  INDEX idx_sort_order (sort_order),
  INDEX idx_show_in_header (show_in_header),
  INDEX idx_show_in_footer (show_in_footer),
  INDEX idx_show_in_mobile (show_in_mobile)
);

