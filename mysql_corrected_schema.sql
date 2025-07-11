-- =====================================================
-- MYSQL DATABASE SCHEMA FOR PORTFOLIO PROJECT  
-- =====================================================
-- Corrected version based on Supabase schema analysis
-- Date: 2025-07-11

SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';
SET time_zone = '+00:00';

-- =====================================================
-- 1. USER MANAGEMENT 
-- =====================================================

-- Users table (for portfolio authentication)
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
-- 2. CORE PORTFOLIO TABLES
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
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
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
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255),
    overview TEXT,
    technologies JSON, -- Array from Supabase
    features JSON, -- Array from Supabase  
    live_url VARCHAR(500),
    github_url VARCHAR(500),
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
    url VARCHAR(500) NOT NULL,
    path VARCHAR(500) NOT NULL,
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    size INT,
    type VARCHAR(100),
    bucket VARCHAR(50) DEFAULT 'images',
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_project_images_project (project_id),
    INDEX idx_project_images_user (user_id),
    INDEX idx_project_images_order (project_id, order_index),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Domains and Technologies table
CREATE TABLE IF NOT EXISTS domains_technologies (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    type ENUM('domain', 'technology') DEFAULT 'technology',
    title VARCHAR(255) NOT NULL,
    icon VARCHAR(500),
    image VARCHAR(500),
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
    title VARCHAR(255) NOT NULL,
    icon VARCHAR(500),
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
    setting_key VARCHAR(100) NOT NULL, -- 'key' is reserved word in MySQL
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_key (user_id, setting_key),
    INDEX idx_settings_user (user_id),
    INDEX idx_settings_key (setting_key),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Contact queries table (comprehensive form handling)
CREATE TABLE IF NOT EXISTS contact_queries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36),
    form_type ENUM('contact', 'onboarding') NOT NULL DEFAULT 'contact',
    
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- 3. AUTOMATION & UPDATE SYSTEM TABLES
-- =====================================================

-- Automatic update capabilities
CREATE TABLE IF NOT EXISTS automatic_update_capabilities (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_id VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    supports_automatic BOOLEAN DEFAULT FALSE,
    endpoint_url VARCHAR(500) NOT NULL,
    api_key_hash VARCHAR(255),
    last_capability_check TIMESTAMP NOT NULL,
    php_version VARCHAR(50),
    server_info JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_automatic_update_capabilities_client (client_id),
    INDEX idx_automatic_update_capabilities_domain (domain)
);

-- Automatic update client performance
CREATE TABLE IF NOT EXISTS automatic_update_client_performance (
    client_id VARCHAR(255) PRIMARY KEY,
    domain VARCHAR(255) NOT NULL,
    supports_automatic BOOLEAN DEFAULT FALSE,
    total_attempts INT DEFAULT 0,
    successful_updates INT DEFAULT 0,
    failed_updates INT DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_execution_time_ms INT,
    last_update_attempt TIMESTAMP NULL,
    
    INDEX idx_automatic_update_client_performance_domain (domain)
);

-- Recent automatic activity
CREATE TABLE IF NOT EXISTS recent_automatic_activity (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    update_id VARCHAR(36),
    version VARCHAR(50) NOT NULL,
    update_title VARCHAR(255) NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    activity VARCHAR(255) NOT NULL,
    success BOOLEAN DEFAULT FALSE,
    execution_time_ms INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    supports_automatic BOOLEAN,
    
    INDEX idx_recent_automatic_activity_client (client_id),
    INDEX idx_recent_automatic_activity_domain (domain),
    INDEX idx_recent_automatic_activity_timestamp (timestamp DESC)
);

-- =====================================================
-- 4. SHARED HOSTING SYSTEM TABLES
-- =====================================================

-- Shared hosting clients
CREATE TABLE IF NOT EXISTS shared_hosting_clients (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_id VARCHAR(255) UNIQUE NOT NULL,
    domain VARCHAR(255) NOT NULL,
    current_version VARCHAR(50) NOT NULL,
    deployment_type VARCHAR(50) DEFAULT 'shared_hosting',
    hosting_provider VARCHAR(100),
    cpanel_info JSON,
    last_seen TIMESTAMP NOT NULL,
    user_agent TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    contact_email VARCHAR(255),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_shared_hosting_clients_client (client_id),
    INDEX idx_shared_hosting_clients_domain (domain),
    INDEX idx_shared_hosting_clients_last_seen (last_seen DESC)
);

-- =====================================================
-- 5. THEME UPDATE SYSTEM TABLES  
-- =====================================================

-- Theme clients
CREATE TABLE IF NOT EXISTS theme_clients (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_id VARCHAR(255) UNIQUE NOT NULL,
    domain VARCHAR(255) NOT NULL,
    current_version VARCHAR(50) NOT NULL,
    update_channel ENUM('stable', 'beta', 'alpha') DEFAULT 'stable',
    last_seen TIMESTAMP NOT NULL,
    last_updated TIMESTAMP NULL,
    user_agent TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_theme_clients_client (client_id),
    INDEX idx_theme_clients_domain (domain),
    INDEX idx_theme_clients_channel (update_channel),
    INDEX idx_theme_clients_last_seen (last_seen DESC)
);

-- Theme updates
CREATE TABLE IF NOT EXISTS theme_updates (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) NOT NULL UNIQUE,
    channel ENUM('stable', 'beta', 'alpha') DEFAULT 'stable',
    files JSON, -- Array of update files
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    pushed_at TIMESTAMP NULL,
    download_count INT DEFAULT 0,
    success_count INT DEFAULT 0,
    failure_count INT DEFAULT 0,
    
    INDEX idx_theme_updates_version (version),
    INDEX idx_theme_updates_channel (channel),
    INDEX idx_theme_updates_created_at (created_at DESC)
);

-- =====================================================
-- 6. FUNCTIONS AND VIEWS
-- =====================================================

-- Function to get portfolio owner ID
DELIMITER $$
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
END$$
DELIMITER ;

-- View for published projects with images
CREATE OR REPLACE VIEW published_projects_with_images AS
SELECT 
    p.id,
    p.title,
    p.description,
    p.category,
    p.overview,
    p.technologies,
    p.features,
    p.live_url,
    p.github_url,
    p.status,
    p.views,
    p.created_at,
    p.updated_at,
    GROUP_CONCAT(pi.url ORDER BY pi.order_index) as image_urls
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
    pc.is_active as portfolio_active
FROM users u
JOIN portfolio_config pc ON u.id = pc.owner_user_id
WHERE pc.is_active = TRUE; 