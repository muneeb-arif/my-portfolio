-- =====================================================
-- 🚀 CREATE DYNAMIC SECTIONS TABLE
-- =====================================================
-- This script creates the dynamic_sections table to handle
-- user-created content sections with various types and configurations

-- =====================================================
-- 1. CREATE DYNAMIC SECTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS dynamic_sections (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  section_type ENUM('title', 'subtitle', 'image_text', 'text_image', 'image_only', 'video_only', 'text_only', 'accordion', 'social_embed', 'map_embed', 'form', 'code_snippet', 'custom_html') NOT NULL,
  title TEXT,
  subtitle TEXT,
  content TEXT,
  image_url VARCHAR(500),
  video_url VARCHAR(500),
  alignment ENUM('left', 'right', 'center') DEFAULT 'center',
  position_after VARCHAR(100), -- section key to position after (e.g., 'hero', 'portfolio', or another dynamic section id)
  is_visible BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 1,
  -- Enhanced features
  section_id VARCHAR(100), -- Custom ID for anchor links (e.g., 'about-me', 'services')
  background_color VARCHAR(7), -- Hex color code (e.g., '#F5F1EB')
  background_image_url VARCHAR(500), -- Background image URL
  padding_top INT DEFAULT 80, -- Padding top in pixels (default: 80px = py-20)
  padding_bottom INT DEFAULT 80, -- Padding bottom in pixels (default: 80px = py-20)
  cta_button_text VARCHAR(255), -- CTA button text
  cta_button_link VARCHAR(500), -- CTA button link (URL or anchor)
  cta_button_target ENUM('_self', '_blank') DEFAULT '_self', -- CTA button target
  cta_button_style ENUM('primary', 'secondary', 'outline') DEFAULT 'primary', -- CTA button style
  -- Social media and embed fields
  embed_type ENUM('facebook_post', 'facebook_video', 'instagram_post', 'instagram_reel', 'twitter', 'tiktok', 'linkedin', 'pinterest', 'youtube', 'vimeo', 'spotify', 'soundcloud', 'calendly', 'google_maps', 'custom') NULL,
  embed_url VARCHAR(500), -- URL for social media embed or iframe src
  embed_code TEXT, -- Custom embed code (for custom_html type or advanced embeds)
  -- Accordion specific
  accordion_items JSON, -- JSON array of {title: string, content: string} for accordion sections
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_section_type (section_type),
  INDEX idx_is_visible (is_visible),
  INDEX idx_sort_order (sort_order),
  INDEX idx_position_after (position_after),
  INDEX idx_section_id (section_id)
);

