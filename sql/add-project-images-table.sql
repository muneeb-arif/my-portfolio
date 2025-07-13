-- Add project_images table to local MySQL database
-- This table stores metadata for project images

CREATE TABLE IF NOT EXISTS project_images (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  size INT,
  type VARCHAR(100),
  bucket VARCHAR(100) DEFAULT 'images',
  order_index INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_project_id (project_id),
  INDEX idx_user_id (user_id),
  INDEX idx_order_index (order_index)
);

-- Add order_index column to existing project_images table if it doesn't exist
ALTER TABLE project_images 
ADD COLUMN IF NOT EXISTS order_index INT DEFAULT 1 AFTER bucket;

-- Add updated_at column to existing project_images table if it doesn't exist
ALTER TABLE project_images 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at; 