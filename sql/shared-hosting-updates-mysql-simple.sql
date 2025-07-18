-- ================================================
-- SHARED HOSTING UPDATES MYSQL SCHEMA (SIMPLE)
-- For local API integration (replaces Supabase)
-- ================================================

-- Table: shared_hosting_updates
CREATE TABLE IF NOT EXISTS shared_hosting_updates (
  id VARCHAR(36) PRIMARY KEY,
  created_by VARCHAR(36) NOT NULL,
  version VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  release_notes TEXT,
  package_url TEXT,
  download_url TEXT,
  package_size_mb DECIMAL(10,2),
  special_instructions TEXT,
  is_active TINYINT(1) DEFAULT 1,
  is_critical TINYINT(1) DEFAULT 0,
  channel VARCHAR(20) DEFAULT 'stable',
  required_version VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_created_by (created_by),
  INDEX idx_version (version),
  INDEX idx_active (is_active),
  INDEX idx_channel (channel),
  INDEX idx_created_at (created_at)
);

-- Table: shared_hosting_clients
CREATE TABLE IF NOT EXISTS shared_hosting_clients (
  id VARCHAR(36) PRIMARY KEY,
  client_id VARCHAR(255) UNIQUE NOT NULL,
  domain VARCHAR(255) NOT NULL,
  current_version VARCHAR(50) DEFAULT '1.0.0',
  deployment_type VARCHAR(50) DEFAULT 'shared_hosting',
  hosting_provider VARCHAR(100),
  cpanel_info JSON,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  timezone VARCHAR(100),
  contact_email VARCHAR(255),
  notes TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_client_id (client_id),
  INDEX idx_domain (domain),
  INDEX idx_last_seen (last_seen),
  INDEX idx_active (is_active)
);

-- Table: shared_hosting_update_logs
CREATE TABLE IF NOT EXISTS shared_hosting_update_logs (
  id VARCHAR(36) PRIMARY KEY,
  update_id VARCHAR(36) NOT NULL,
  client_id VARCHAR(255) NOT NULL,
  activity VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  ip_address VARCHAR(45),
  details JSON,
  success TINYINT(1) DEFAULT 1,

  INDEX idx_update_id (update_id),
  INDEX idx_client_id (client_id),
  INDEX idx_activity (activity),
  INDEX idx_timestamp (timestamp)
);

-- Table: shared_hosting_notifications
CREATE TABLE IF NOT EXISTS shared_hosting_notifications (
  id VARCHAR(36) PRIMARY KEY,
  update_id VARCHAR(36) NOT NULL,
  client_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  notification_type VARCHAR(50) DEFAULT 'update_available',
  sent_at TIMESTAMP NULL,
  opened_at TIMESTAMP NULL,
  clicked_at TIMESTAMP NULL,
  status VARCHAR(20) DEFAULT 'pending',
  email_content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_update_id (update_id),
  INDEX idx_client_id (client_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Table: shared_hosting_update_stats
CREATE TABLE IF NOT EXISTS shared_hosting_update_stats (
  id VARCHAR(36) PRIMARY KEY,
  update_id VARCHAR(36) NOT NULL,
  total_clients INT DEFAULT 0,
  downloads_count INT DEFAULT 0,
  applications_count INT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  avg_time_to_apply INT,
  last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_update_id (update_id),
  INDEX idx_last_calculated (last_calculated)
);

-- ================================================
-- SAMPLE DATA (Optional)
-- ================================================

INSERT IGNORE INTO shared_hosting_updates (
  id, created_by, version, title, description, release_notes, 
  package_url, is_active, channel
) VALUES (
  UUID(), 
  (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1),
  '1.1.0', 
  'Performance Improvements',
  'Improved loading speed and fixed several bugs',
  '- Faster page load times\n- Fixed mobile navigation\n- Updated dependencies',
  'https://example.com/updates/v1.1.0.zip',
  1,
  'stable'
);

-- ================================================
-- COMPLETION MESSAGE
-- ================================================

SELECT '✅ Shared Hosting Updates MySQL schema created successfully!' AS message;
SELECT '📋 Tables created: shared_hosting_updates, shared_hosting_clients, shared_hosting_update_logs, shared_hosting_notifications, shared_hosting_update_stats' AS details;
SELECT '🚀 Ready for local API integration!' AS status;
