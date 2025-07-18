-- ================================================
-- SHARED HOSTING UPDATES MYSQL SCHEMA
-- For local API integration (replaces Supabase)
-- ================================================

-- Table: shared_hosting_updates
-- Stores update packages for manual distribution
CREATE TABLE IF NOT EXISTS shared_hosting_updates (
  id VARCHAR(36) PRIMARY KEY,
  created_by VARCHAR(36) NOT NULL,
  version VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  release_notes TEXT,
  package_url TEXT, -- URL to downloadable ZIP file
  download_url TEXT, -- Direct download link
  package_size_mb DECIMAL(10,2),
  special_instructions TEXT, -- cPanel-specific instructions
  is_active BOOLEAN DEFAULT true,
  is_critical BOOLEAN DEFAULT false,
  channel VARCHAR(20) DEFAULT 'stable', -- stable, beta, alpha
  required_version VARCHAR(50), -- minimum version required
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for better performance
  INDEX idx_created_by (created_by),
  INDEX idx_version (version),
  INDEX idx_active (is_active),
  INDEX idx_channel (channel),
  INDEX idx_created_at (created_at),
  
  -- Foreign key to users table
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: shared_hosting_clients
-- Tracks client deployments using shared hosting
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
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_client_id (client_id),
  INDEX idx_domain (domain),
  INDEX idx_last_seen (last_seen),
  INDEX idx_active (is_active)
);

-- Table: shared_hosting_update_logs
-- Tracks update activities for shared hosting clients
CREATE TABLE IF NOT EXISTS shared_hosting_update_logs (
  id VARCHAR(36) PRIMARY KEY,
  update_id VARCHAR(36) NOT NULL,
  client_id VARCHAR(255) NOT NULL,
  activity VARCHAR(100) NOT NULL, -- download_attempted, instructions_viewed, applied_successfully, etc.
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  ip_address VARCHAR(45),
  details JSON,
  success BOOLEAN DEFAULT true,
  
  -- Indexes
  INDEX idx_update_id (update_id),
  INDEX idx_client_id (client_id),
  INDEX idx_activity (activity),
  INDEX idx_timestamp (timestamp),
  
  -- Foreign keys
  FOREIGN KEY (update_id) REFERENCES shared_hosting_updates(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES shared_hosting_clients(client_id) ON DELETE CASCADE
);

-- Table: shared_hosting_notifications
-- Email notifications for clients about updates
CREATE TABLE IF NOT EXISTS shared_hosting_notifications (
  id VARCHAR(36) PRIMARY KEY,
  update_id VARCHAR(36) NOT NULL,
  client_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  notification_type VARCHAR(50) DEFAULT 'update_available', -- update_available, critical_update, reminder
  sent_at TIMESTAMP NULL,
  opened_at TIMESTAMP NULL,
  clicked_at TIMESTAMP NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, failed, opened, clicked
  email_content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_update_id (update_id),
  INDEX idx_client_id (client_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  
  -- Foreign keys
  FOREIGN KEY (update_id) REFERENCES shared_hosting_updates(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES shared_hosting_clients(client_id) ON DELETE CASCADE
);

-- Table: shared_hosting_update_stats
-- Analytics for shared hosting updates
CREATE TABLE IF NOT EXISTS shared_hosting_update_stats (
  id VARCHAR(36) PRIMARY KEY,
  update_id VARCHAR(36) NOT NULL,
  total_clients INT DEFAULT 0,
  downloads_count INT DEFAULT 0,
  applications_count INT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  avg_time_to_apply INT, -- in seconds
  last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_update_id (update_id),
  INDEX idx_last_calculated (last_calculated),
  
  -- Foreign key
  FOREIGN KEY (update_id) REFERENCES shared_hosting_updates(id) ON DELETE CASCADE
);

-- ================================================
-- SAMPLE DATA (Optional)
-- ================================================

-- Insert a sample update for testing (only if no updates exist)
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
  true,
  'stable'
);

-- ================================================
-- COMPLETION MESSAGE
-- ================================================

SELECT '✅ Shared Hosting Updates MySQL schema created successfully!' as message;
SELECT '📋 Tables created: shared_hosting_updates, shared_hosting_clients, shared_hosting_update_logs, shared_hosting_notifications, shared_hosting_update_stats' as details;
SELECT '🚀 Ready for local API integration!' as status; 