-- Backup Files Tracking Table for MySQL
-- This table tracks backup files uploaded to Supabase storage

CREATE TABLE IF NOT EXISTS backup_files (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(50),
  storage_path VARCHAR(500) NOT NULL,
  public_url VARCHAR(500) NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id),
  INDEX idx_upload_date (upload_date),
  INDEX idx_is_active (is_active)
);

-- Optional: Sample Insert
-- Replace 'your-user-id-here' and 'your-id-here' with actual UUIDs

-- INSERT INTO backup_files (
--   id, user_id, file_name, file_size, file_type,
--   storage_path, public_url, description
-- ) VALUES (
--   'your-id-here',
--   'your-user-id-here',
--   'backup-2025-07-17T23-50-51-747Z-build.zip',
--   52428800,
--   'application/zip',
--   'updates/backup-2025-07-17T23-50-51-747Z-build.zip',
--   'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/updates/backup-2025-07-17T23-50-51-747Z-build.zip',
--   'Build backup created on 2025-07-17'
-- );
