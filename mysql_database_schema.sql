-- =====================================================
-- MYSQL DATABASE SCHEMA FOR PORTFOLIO PROJECT
-- =====================================================
-- Complete MySQL conversion from Supabase/PostgreSQL schema
-- This script creates all necessary tables, indexes, and triggers

-- Set MySQL settings for better compatibility
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';
SET time_zone = '+00:00';

-- =====================================================
-- 1. USER MANAGEMENT (replaces auth.users)
-- =====================================================

-- Users table (replaces Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_created_at (created_at)
);

-- =====================================================
-- 2. PORTFOLIO CONFIGURATION
-- =====================================================

-- Portfolio configuration table
CREATE TABLE IF NOT EXISTS portfolio_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_email VARCHAR(255) UNIQUE NOT NULL,
    owner_user_id VARCHAR(36),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_portfolio_config_owner (owner_user_id),
    INDEX idx_portfolio_config_active (is_active),
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- 3. CORE PORTFOLIO TABLES
-- =====================================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#8B4513',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_categories_name (name),
    INDEX idx_categories_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    overview TEXT,
    technologies JSON, -- Converted from TEXT[]
    features JSON, -- Converted from TEXT[]
    live_url TEXT,
    github_url TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_projects_user (user_id),
    INDEX idx_projects_status (status),
    INDEX idx_projects_category (category),
    INDEX idx_projects_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Project images table
CREATE TABLE IF NOT EXISTS project_images (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    url TEXT NOT NULL,
    path TEXT NOT NULL,
    name TEXT NOT NULL,
    original_name TEXT,
    size INT,
    type TEXT,
    bucket VARCHAR(50) DEFAULT 'images',
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_project_images_project (project_id),
    INDEX idx_project_images_user (user_id),
    INDEX idx_project_images_order (project_id, order_index),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Technologies table
CREATE TABLE IF NOT EXISTS technologies (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_technologies_user (user_id),
    INDEX idx_technologies_name (name(100)),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Domains and Technologies table
CREATE TABLE IF NOT EXISTS domains_technologies (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    type ENUM('domain', 'technology') DEFAULT 'technology',
    title TEXT NOT NULL,
    icon TEXT,
    image TEXT,
    sort_order INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_domains_technologies_user (user_id),
    INDEX idx_domains_technologies_type (type),
    INDEX idx_domains_technologies_sort (sort_order),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Technology Skills table
CREATE TABLE IF NOT EXISTS tech_skills (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tech_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    title TEXT NOT NULL,
    level INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_tech_skills_tech (tech_id),
    INDEX idx_tech_skills_user (user_id),
    FOREIGN KEY (tech_id) REFERENCES domains_technologies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Niche table
CREATE TABLE IF NOT EXISTS niche (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36),
    image VARCHAR(255) NOT NULL DEFAULT 'default.jpeg',
    title VARCHAR(255) NOT NULL,
    overview TEXT DEFAULT '',
    tools TEXT DEFAULT '',
    key_features TEXT,
    sort_order INT DEFAULT 1,
    ai_driven BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_niche_sort (sort_order),
    INDEX idx_niche_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Settings table (key-value store)
CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_key (user_id, setting_key),
    INDEX idx_settings_user (user_id),
    INDEX idx_settings_key (setting_key),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Contact queries table
CREATE TABLE IF NOT EXISTS contact_queries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36),
    form_type ENUM('contact', 'onboarding') NOT NULL,
    
    -- Common fields
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    subject VARCHAR(500),
    message TEXT,
    budget VARCHAR(100),
    timeline VARCHAR(100),
    
    -- Contact form specific
    inquiry_type VARCHAR(100),
    
    -- Onboarding form specific fields
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
    
    -- Metadata
    status ENUM('new', 'in_progress', 'completed', 'archived') DEFAULT 'new',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    
    INDEX idx_contact_queries_user (user_id),
    INDEX idx_contact_queries_form_type (form_type),
    INDEX idx_contact_queries_status (status),
    INDEX idx_contact_queries_created_at (created_at DESC),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 4. THEME UPDATE SYSTEM TABLES
-- =====================================================

-- Theme clients table
CREATE TABLE IF NOT EXISTS theme_clients (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_id VARCHAR(255) UNIQUE NOT NULL,
    domain VARCHAR(255) NOT NULL,
    current_version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    update_channel ENUM('stable', 'beta', 'alpha') DEFAULT 'stable',
    last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP NULL,
    user_agent TEXT,
    timezone VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_theme_clients_client_id (client_id),
    INDEX idx_theme_clients_domain (domain),
    INDEX idx_theme_clients_channel (update_channel),
    INDEX idx_theme_clients_last_seen (last_seen)
);

-- Theme updates table
CREATE TABLE IF NOT EXISTS theme_updates (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) NOT NULL,
    channel ENUM('stable', 'beta', 'alpha') DEFAULT 'stable',
    files JSON, -- Converted from JSONB
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    pushed_at TIMESTAMP NULL,
    download_count INT DEFAULT 0,
    success_count INT DEFAULT 0,
    failure_count INT DEFAULT 0,
    
    INDEX idx_theme_updates_version (version),
    INDEX idx_theme_updates_channel (channel),
    INDEX idx_theme_updates_active (is_active),
    INDEX idx_theme_updates_created (created_at)
);

-- Theme update logs table
CREATE TABLE IF NOT EXISTS theme_update_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    update_id VARCHAR(36) NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    error_message TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    download_time INT, -- in milliseconds
    apply_time INT, -- in milliseconds
    retry_count INT DEFAULT 0,
    client_version_before VARCHAR(50),
    client_version_after VARCHAR(50),
    
    INDEX idx_theme_update_logs_update_id (update_id),
    INDEX idx_theme_update_logs_client_id (client_id),
    INDEX idx_theme_update_logs_status (status),
    INDEX idx_theme_update_logs_applied_at (applied_at),
    FOREIGN KEY (update_id) REFERENCES theme_updates(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES theme_clients(client_id) ON DELETE CASCADE
);

-- Theme update notifications table
CREATE TABLE IF NOT EXISTS theme_update_notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    update_id VARCHAR(36) NOT NULL,
    client_id VARCHAR(255),
    notification_type VARCHAR(50) NOT NULL DEFAULT 'update_available',
    title VARCHAR(255) NOT NULL,
    message TEXT,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    
    INDEX idx_theme_update_notifications_update_id (update_id),
    INDEX idx_theme_update_notifications_client_id (client_id),
    INDEX idx_theme_update_notifications_read (is_read),
    INDEX idx_theme_update_notifications_dismissed (is_dismissed),
    INDEX idx_theme_update_notifications_created (created_at),
    FOREIGN KEY (update_id) REFERENCES theme_updates(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES theme_clients(client_id) ON DELETE CASCADE
);

-- =====================================================
-- 5. SHARED HOSTING UPDATE SYSTEM TABLES
-- =====================================================

-- Shared hosting clients table
CREATE TABLE IF NOT EXISTS shared_hosting_clients (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_id VARCHAR(255) UNIQUE NOT NULL,
    domain VARCHAR(255) NOT NULL,
    current_version VARCHAR(50) DEFAULT '1.0.0',
    deployment_type VARCHAR(50) DEFAULT 'shared_hosting',
    hosting_provider VARCHAR(100),
    cpanel_info JSON, -- Converted from JSONB
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    timezone VARCHAR(100),
    contact_email VARCHAR(255),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_shared_hosting_clients_domain (domain),
    INDEX idx_shared_hosting_clients_last_seen (last_seen),
    INDEX idx_shared_hosting_clients_version (current_version),
    INDEX idx_shared_hosting_clients_active (is_active)
);

-- Shared hosting updates table
CREATE TABLE IF NOT EXISTS shared_hosting_updates (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    version VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    release_notes TEXT,
    package_url TEXT,
    download_url TEXT,
    package_size_mb DECIMAL(10,2),
    special_instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_critical BOOLEAN DEFAULT FALSE,
    channel ENUM('stable', 'beta', 'alpha') DEFAULT 'stable',
    required_version VARCHAR(50),
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_shared_hosting_updates_version (version),
    INDEX idx_shared_hosting_updates_active (is_active),
    INDEX idx_shared_hosting_updates_channel (channel),
    INDEX idx_shared_hosting_updates_created (created_at),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Shared hosting update logs table
CREATE TABLE IF NOT EXISTS shared_hosting_update_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    update_id VARCHAR(36) NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    activity VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    ip_address VARCHAR(45), -- Supports both IPv4 and IPv6
    details JSON, -- Converted from JSONB
    success BOOLEAN DEFAULT TRUE,
    
    INDEX idx_shared_hosting_logs_update (update_id),
    INDEX idx_shared_hosting_logs_client (client_id),
    INDEX idx_shared_hosting_logs_activity (activity),
    INDEX idx_shared_hosting_logs_timestamp (timestamp),
    FOREIGN KEY (update_id) REFERENCES shared_hosting_updates(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES shared_hosting_clients(client_id) ON DELETE CASCADE
);

-- Shared hosting notifications table
CREATE TABLE IF NOT EXISTS shared_hosting_notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    update_id VARCHAR(36) NOT NULL,
    client_id VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    notification_type ENUM('update_available', 'critical_update', 'reminder') DEFAULT 'update_available',
    sent_at TIMESTAMP NULL,
    opened_at TIMESTAMP NULL,
    clicked_at TIMESTAMP NULL,
    status ENUM('pending', 'sent', 'delivered', 'failed', 'opened', 'clicked') DEFAULT 'pending',
    email_content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_shared_hosting_notifications_update (update_id),
    INDEX idx_shared_hosting_notifications_client (client_id),
    INDEX idx_shared_hosting_notifications_status (status),
    FOREIGN KEY (update_id) REFERENCES shared_hosting_updates(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES shared_hosting_clients(client_id) ON DELETE CASCADE
);

-- =====================================================
-- 6. AUTOMATIC UPDATE SYSTEM TABLES
-- =====================================================

-- Automatic update logs table
CREATE TABLE IF NOT EXISTS automatic_update_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    update_id VARCHAR(36),
    client_id VARCHAR(255) NOT NULL,
    activity VARCHAR(100) NOT NULL,
    details JSON, -- Converted from JSONB
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    domain VARCHAR(255),
    ip_address VARCHAR(45),
    execution_time_ms INT,
    success BOOLEAN DEFAULT TRUE,
    
    INDEX idx_automatic_logs_update (update_id),
    INDEX idx_automatic_logs_client (client_id),
    INDEX idx_automatic_logs_activity (activity),
    INDEX idx_automatic_logs_timestamp (timestamp),
    INDEX idx_automatic_logs_domain (domain),
    FOREIGN KEY (update_id) REFERENCES shared_hosting_updates(id) ON DELETE CASCADE
);

-- Automatic update capabilities table
CREATE TABLE IF NOT EXISTS automatic_update_capabilities (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_id VARCHAR(255) UNIQUE NOT NULL,
    domain VARCHAR(255) NOT NULL,
    supports_automatic BOOLEAN DEFAULT FALSE,
    endpoint_url TEXT,
    api_key_hash VARCHAR(255),
    last_capability_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    php_version VARCHAR(20),
    server_info JSON, -- Converted from JSONB
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_automatic_capabilities_client (client_id),
    INDEX idx_automatic_capabilities_domain (domain),
    INDEX idx_automatic_capabilities_active (is_active),
    INDEX idx_automatic_capabilities_supports (supports_automatic)
);

-- Automatic update performance table
CREATE TABLE IF NOT EXISTS automatic_update_performance (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    update_id VARCHAR(36),
    client_id VARCHAR(255) NOT NULL,
    download_time_ms INT,
    extraction_time_ms INT,
    application_time_ms INT,
    total_time_ms INT,
    files_processed INT,
    download_size_mb DECIMAL(10,3),
    server_load_avg DECIMAL(5,2),
    memory_usage_mb INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_automatic_performance_update (update_id),
    INDEX idx_automatic_performance_client (client_id),
    INDEX idx_automatic_performance_timestamp (timestamp),
    FOREIGN KEY (update_id) REFERENCES shared_hosting_updates(id) ON DELETE CASCADE
);

-- =====================================================
-- 7. UTILITY FUNCTIONS AND PROCEDURES
-- =====================================================

-- Function to get portfolio owner user ID
DELIMITER //
CREATE FUNCTION get_portfolio_owner_id() 
RETURNS VARCHAR(36)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE owner_id VARCHAR(36);
    
    SELECT owner_user_id INTO owner_id
    FROM portfolio_config
    WHERE is_active = TRUE
    LIMIT 1;
    
    RETURN owner_id;
END //
DELIMITER ;

-- Function to check if user is portfolio owner
DELIMITER //
CREATE FUNCTION is_portfolio_owner(check_user_id VARCHAR(36)) 
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE owner_id VARCHAR(36);
    
    SELECT get_portfolio_owner_id() INTO owner_id;
    
    RETURN (owner_id IS NULL OR check_user_id = owner_id);
END //
DELIMITER ;

-- =====================================================
-- 8. INSERT DEFAULT DATA
-- =====================================================

-- Insert default categories
INSERT INTO categories (name, description, color) VALUES 
    ('Web Development', 'Full-stack web applications and websites', '#3b82f6'),
    ('UI/UX Design', 'User interface and user experience design', '#8b5cf6'),
    ('Backend', 'Server-side applications and APIs', '#ef4444'),
    ('Mobile App', 'iOS and Android mobile applications', '#10b981'),
    ('Data Science', 'Machine learning and data analysis projects', '#f59e0b'),
    ('DevOps', 'Infrastructure and deployment automation', '#6b7280')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =====================================================
-- 9. VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for published projects with images
CREATE OR REPLACE VIEW published_projects_with_images AS
SELECT 
    p.*,
    GROUP_CONCAT(
        JSON_OBJECT(
            'id', pi.id,
            'url', pi.url,
            'name', pi.name,
            'order_index', pi.order_index
        ) 
        ORDER BY pi.order_index
    ) as images
FROM projects p
LEFT JOIN project_images pi ON p.id = pi.project_id
WHERE p.status = 'published'
GROUP BY p.id;

-- View for portfolio owner data
CREATE OR REPLACE VIEW portfolio_owner_data AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.avatar_url,
    pc.is_active as is_portfolio_owner
FROM users u
LEFT JOIN portfolio_config pc ON u.id = pc.owner_user_id
WHERE pc.is_active = TRUE;

-- =====================================================
-- ✅ MYSQL SCHEMA COMPLETE!
-- =====================================================

-- Setup Instructions:
-- 1. Create a MySQL database
-- 2. Run this script to create all tables
-- 3. Insert your user data and portfolio configuration
-- 4. Migrate your existing data from PostgreSQL
-- 5. Update your application to use MySQL instead of Supabase 