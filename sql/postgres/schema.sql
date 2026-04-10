-- Portfolio schema for Vercel Postgres (migrated from MySQL)
-- Apply: psql "$DATABASE_URL" -f sql/postgres/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Core
-- ---------------------------------------------------------------------------

CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  full_name VARCHAR(255),
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE domains (
  id INTEGER PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status SMALLINT DEFAULT 1,
  supabase_url VARCHAR(500),
  supabase_anon_key VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_domains_user_id ON domains(user_id);
CREATE INDEX idx_domains_name ON domains(name);

CREATE TABLE categories (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#8B4513',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE domains_technologies (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) DEFAULT 'technology',
  title VARCHAR(255) NOT NULL,
  icon VARCHAR(500),
  image VARCHAR(500),
  sort_order INT DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tech_skills (
  id VARCHAR(36) PRIMARY KEY,
  tech_id VARCHAR(36) NOT NULL REFERENCES domains_technologies(id) ON DELETE CASCADE,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(500),
  level INT DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE niche (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  image VARCHAR(500) NOT NULL DEFAULT 'default.jpeg',
  title VARCHAR(255) NOT NULL,
  overview TEXT,
  tools TEXT,
  key_features TEXT,
  sort_order INT DEFAULT 1,
  ai_driven BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE settings (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, setting_key)
);

CREATE TABLE portfolio_config (
  id VARCHAR(36) PRIMARY KEY,
  owner_email VARCHAR(255) NOT NULL UNIQUE,
  owner_user_id VARCHAR(36),
  site_title VARCHAR(255) DEFAULT 'Portfolio',
  site_description TEXT,
  theme VARCHAR(50) DEFAULT 'default',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE contact_queries (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
  form_type VARCHAR(50) DEFAULT 'contact',
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  subject VARCHAR(500),
  message TEXT,
  budget VARCHAR(100),
  timeline VARCHAR(100),
  inquiry_type VARCHAR(100),
  company_name VARCHAR(255),
  contact_person VARCHAR(255),
  communication_channel VARCHAR(100),
  business_description TEXT,
  target_customer TEXT,
  unique_value TEXT,
  problem_solving TEXT,
  core_features TEXT,
  existing_system TEXT,
  technical_constraints TEXT,
  competitors TEXT,
  brand_guide TEXT,
  color_preferences TEXT,
  tone_of_voice VARCHAR(100),
  payment_gateways TEXT,
  integrations TEXT,
  admin_control TEXT,
  gdpr_compliance BOOLEAN DEFAULT FALSE,
  terms_privacy BOOLEAN DEFAULT FALSE,
  launch_date DATE,
  budget_range VARCHAR(100),
  post_mvp_features TEXT,
  long_term_goals TEXT,
  status VARCHAR(20) DEFAULT 'new',
  priority VARCHAR(20) DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

CREATE TABLE projects (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(255),
  overview TEXT,
  technologies JSONB,
  features JSONB,
  live_url VARCHAR(500),
  github_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'draft',
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_prompt SMALLINT DEFAULT 0
);

CREATE TABLE project_images (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url VARCHAR(2000) NOT NULL,
  path VARCHAR(2000) NOT NULL,
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  size INT,
  type VARCHAR(100),
  bucket VARCHAR(50) DEFAULT 'images',
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE dynamic_sections (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  section_type VARCHAR(50) NOT NULL,
  title TEXT,
  subtitle TEXT,
  content TEXT,
  image_url VARCHAR(500),
  video_url VARCHAR(500),
  alignment VARCHAR(20) DEFAULT 'center',
  position_after VARCHAR(100),
  is_visible BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 1,
  section_id VARCHAR(100),
  background_color VARCHAR(7),
  background_image_url VARCHAR(500),
  padding_top INT DEFAULT 80,
  padding_bottom INT DEFAULT 80,
  cta_button_text VARCHAR(255),
  cta_button_link VARCHAR(500),
  cta_button_target VARCHAR(20) DEFAULT '_self',
  cta_button_style VARCHAR(20) DEFAULT 'primary',
  embed_type VARCHAR(50),
  embed_url VARCHAR(500),
  embed_code TEXT,
  accordion_items JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE menus (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  menu_type VARCHAR(50) NOT NULL,
  section_id VARCHAR(100),
  label VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  link_url VARCHAR(500),
  sort_order INT DEFAULT 1,
  is_visible BOOLEAN DEFAULT TRUE,
  show_in_header BOOLEAN DEFAULT FALSE,
  show_in_footer BOOLEAN DEFAULT FALSE,
  show_in_mobile BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_sections (
  id VARCHAR(36) PRIMARY KEY,
  section_key VARCHAR(100) NOT NULL UNIQUE,
  section_name VARCHAR(255) NOT NULL,
  section_description TEXT,
  icon VARCHAR(100),
  route_path VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_section_permissions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  section_id VARCHAR(36) NOT NULL REFERENCES admin_sections(id) ON DELETE CASCADE,
  can_access BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, section_id)
);

CREATE TABLE backup_files (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(50),
  storage_path VARCHAR(500) NOT NULL,
  public_url VARCHAR(500) NOT NULL,
  upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Automatic / shared hosting / theme
-- ---------------------------------------------------------------------------

CREATE TABLE automatic_update_capabilities (
  id VARCHAR(36) PRIMARY KEY,
  client_id VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  supports_automatic BOOLEAN DEFAULT FALSE,
  endpoint_url VARCHAR(500) NOT NULL,
  api_key_hash VARCHAR(255),
  last_capability_check TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  php_version VARCHAR(50),
  server_info JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE automatic_update_client_performance (
  client_id VARCHAR(255) PRIMARY KEY,
  domain VARCHAR(255) NOT NULL,
  supports_automatic BOOLEAN DEFAULT FALSE,
  total_attempts INT,
  successful_updates INT DEFAULT 0,
  failed_updates INT DEFAULT 0,
  success_rate INT DEFAULT 0,
  avg_execution_time_ms INT,
  last_update_attempt TIMESTAMPTZ
);

-- API-aligned log table (replaces legacy MySQL shape if present)
CREATE TABLE automatic_update_logs (
  id VARCHAR(36) PRIMARY KEY,
  update_id VARCHAR(36),
  client_id VARCHAR(255),
  activity VARCHAR(255) NOT NULL,
  details TEXT,
  user_agent TEXT,
  domain VARCHAR(255),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recent_automatic_activity (
  id VARCHAR(36) PRIMARY KEY,
  update_id VARCHAR(36),
  version VARCHAR(50) NOT NULL,
  update_title VARCHAR(255) NOT NULL,
  client_id VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  activity VARCHAR(255) NOT NULL,
  success BOOLEAN DEFAULT FALSE,
  execution_time_ms INT,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  supports_automatic BOOLEAN
);

CREATE TABLE shared_hosting_clients (
  id VARCHAR(36) PRIMARY KEY,
  client_id VARCHAR(255) NOT NULL UNIQUE,
  domain VARCHAR(255) NOT NULL,
  current_version VARCHAR(50) NOT NULL,
  deployment_type VARCHAR(50) DEFAULT 'shared_hosting',
  hosting_provider VARCHAR(100),
  cpanel_info JSONB,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  contact_email VARCHAR(255),
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE shared_hosting_notifications (
  id VARCHAR(36) PRIMARY KEY,
  client_id VARCHAR(255),
  domain VARCHAR(255),
  notification_type VARCHAR(100),
  title VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE shared_hosting_updates (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(50) NOT NULL,
  files JSONB,
  release_notes TEXT,
  package_url TEXT,
  special_instructions TEXT,
  channel VARCHAR(20) DEFAULT 'stable',
  is_critical BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pushed_at TIMESTAMPTZ
);

CREATE TABLE shared_hosting_update_logs (
  id VARCHAR(36) PRIMARY KEY,
  update_id VARCHAR(36),
  client_id VARCHAR(255),
  domain VARCHAR(255),
  version VARCHAR(50),
  status VARCHAR(50),
  log_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE shared_hosting_update_stats (
  id VARCHAR(36) PRIMARY KEY,
  update_id VARCHAR(36),
  total_clients INT DEFAULT 0,
  successful_updates INT DEFAULT 0,
  failed_updates INT DEFAULT 0,
  pending_updates INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE theme_clients (
  id VARCHAR(36) PRIMARY KEY,
  client_id VARCHAR(255) NOT NULL UNIQUE,
  domain VARCHAR(255) NOT NULL,
  current_version VARCHAR(50) NOT NULL,
  update_channel VARCHAR(20) DEFAULT 'stable',
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated TIMESTAMPTZ,
  user_agent TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE theme_updates (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(50) NOT NULL,
  channel VARCHAR(20) DEFAULT 'stable',
  files JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pushed_at TIMESTAMPTZ,
  download_count INT DEFAULT 0,
  success_count INT DEFAULT 0,
  failure_count INT DEFAULT 0
);

CREATE TABLE theme_update_logs (
  id VARCHAR(36) PRIMARY KEY,
  update_id VARCHAR(36),
  client_id VARCHAR(255),
  domain VARCHAR(255),
  version VARCHAR(50),
  status VARCHAR(50),
  log_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE theme_update_notifications (
  id VARCHAR(36) PRIMARY KEY,
  update_id VARCHAR(36),
  client_id VARCHAR(255),
  domain VARCHAR(255),
  notification_type VARCHAR(100),
  title VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE theme_update_stats (
  id VARCHAR(36) PRIMARY KEY,
  update_id VARCHAR(36),
  total_clients INT DEFAULT 0,
  successful_updates INT DEFAULT 0,
  failed_updates INT DEFAULT 0,
  pending_updates INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
