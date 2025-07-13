-- =====================================================
-- 🚀 MYSQL SCHEMA FOR PORTFOLIO API
-- =====================================================
-- This script creates all necessary tables for the Next.js API

-- =====================================================
-- 1. CREATE CORE TABLES
-- =====================================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#8B4513',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_name (name)
);

-- Domains and Technologies table
CREATE TABLE IF NOT EXISTS domains_technologies (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('domain', 'technology') DEFAULT 'technology',
  title VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  image VARCHAR(255),
  sort_order INT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_sort_order (sort_order)
);

-- Technology Skills table
CREATE TABLE IF NOT EXISTS tech_skills (
  id VARCHAR(36) PRIMARY KEY,
  tech_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tech_id (tech_id),
  INDEX idx_user_id (user_id),
  FOREIGN KEY (tech_id) REFERENCES domains_technologies(id) ON DELETE CASCADE
);

-- Niche table
CREATE TABLE IF NOT EXISTS niche (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  image VARCHAR(255) DEFAULT 'default.jpeg',
  title VARCHAR(255) NOT NULL,
  overview TEXT,
  tools TEXT,
  key_features TEXT,
  sort_order INT DEFAULT 1,
  ai_driven BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_sort_order (sort_order)
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  `key` VARCHAR(255) NOT NULL,
  value TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_key (user_id, `key`),
  INDEX idx_user_id (user_id)
);

-- Contact queries table
CREATE TABLE IF NOT EXISTS contact_queries (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  form_type VARCHAR(50) DEFAULT 'contact',
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  budget VARCHAR(100),
  timeline VARCHAR(100),
  inquiry_type VARCHAR(100) DEFAULT 'General Inquiry',
  status ENUM('new', 'in_progress', 'completed', 'cancelled') DEFAULT 'new',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_created_at (created_at)
);

-- =====================================================
-- 2. INSERT DEFAULT DATA
-- =====================================================

-- Insert default categories (these will be associated with the portfolio owner)
INSERT IGNORE INTO categories (id, user_id, name, description, color) VALUES 
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'Web Development', 'Full-stack web applications and websites', '#3b82f6'),
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'UI/UX Design', 'User interface and user experience design', '#8b5cf6'),
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'Backend', 'Server-side applications and APIs', '#ef4444'),
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'Mobile App', 'iOS and Android mobile applications', '#10b981'),
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'DevOps', 'Infrastructure and deployment automation', '#f59e0b'),
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'Data Science', 'Machine learning and data analysis', '#6b7280'),
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'Blockchain', 'Cryptocurrency and smart contracts', '#8B4513'),
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'Cloud Computing', 'AWS, Azure, and Google Cloud services', '#ec4899'),
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'Cybersecurity', 'Security and penetration testing', '#14b8a6'),
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'AI/ML', 'Artificial intelligence and machine learning', '#f97316');

-- Insert default domains and technologies
INSERT IGNORE INTO domains_technologies (id, user_id, type, title, icon, sort_order) VALUES 
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'domain', 'Frontend Development', 'Code', 1),
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'domain', 'Backend Development', 'Server', 2),
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'domain', 'Database Management', 'Database', 3),
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'domain', 'DevOps & Cloud', 'Cloud', 4),
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'technology', 'React.js', 'Code', 1),
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'technology', 'Node.js', 'Server', 2),
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'technology', 'MySQL', 'Database', 3),
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'technology', 'AWS', 'Cloud', 4);

-- Insert default niches
INSERT IGNORE INTO niche (id, user_id, title, overview, tools, key_features, sort_order, ai_driven) VALUES 
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'Web Development', 'Full-stack web applications with modern technologies', 'React, Node.js, MySQL, AWS', 'Responsive design, SEO optimization, Performance tuning', 1, FALSE),
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'Mobile Development', 'Cross-platform mobile applications', 'React Native, Flutter, Firebase', 'Native performance, Offline support, Push notifications', 2, FALSE),
  (UUID(), (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'AI & Machine Learning', 'Intelligent applications and data analysis', 'Python, TensorFlow, Scikit-learn', 'Predictive analytics, Computer vision, NLP', 3, TRUE);

-- =====================================================
-- 3. CREATE PORTFOLIO CONFIGURATION
-- =====================================================

-- Create portfolio configuration table if it doesn't exist
CREATE TABLE IF NOT EXISTS portfolio_config (
  id VARCHAR(36) PRIMARY KEY,
  owner_email VARCHAR(255) NOT NULL UNIQUE,
  owner_user_id VARCHAR(36),
  site_title VARCHAR(255) DEFAULT 'Portfolio',
  site_description TEXT,
  theme VARCHAR(50) DEFAULT 'default',
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_owner_email (owner_email),
  INDEX idx_owner_user_id (owner_user_id)
);

-- Insert portfolio configuration for the owner
INSERT IGNORE INTO portfolio_config (id, owner_email, owner_user_id, site_title, site_description) VALUES 
  (UUID(), 'muneebarif11@gmail.com', (SELECT id FROM users WHERE email = 'muneebarif11@gmail.com' LIMIT 1), 'Muneeb Arif - Portfolio', 'Full-stack developer specializing in modern web technologies'); 