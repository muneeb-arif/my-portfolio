-- =====================================================
-- MYSQL DATABASE SCHEMA FOR PORTFOLIO PROJECT  
-- =====================================================
-- Generated from Supabase schema analysis
-- Date: 2025-07-11T15:34:00.159Z

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

-- categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    color VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id VARCHAR(36) NOT NULL,
    INDEX idx_categories_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- contact_queries table
CREATE TABLE IF NOT EXISTS contact_queries (

);

-- domains_technologies table
CREATE TABLE IF NOT EXISTS domains_technologies (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    type VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    icon TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    sort_order INT NOT NULL,
    INDEX idx_domains_technologies_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- niche table
CREATE TABLE IF NOT EXISTS niche (
    id INT,
    image VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    overview VARCHAR(255) NOT NULL,
    tools VARCHAR(255) NOT NULL,
    key_features VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL,
    ai_driven BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id VARCHAR(36) NOT NULL,
    INDEX idx_niche_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- portfolio_config table
CREATE TABLE IF NOT EXISTS portfolio_config (
    id INT,
    owner_email VARCHAR(255) NOT NULL,
    owner_user_id VARCHAR(36) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_portfolio_config_owner_user (owner_user_id)
);

-- project_images table
CREATE TABLE IF NOT EXISTS project_images (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    url VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    size INT NOT NULL,
    type VARCHAR(255) NOT NULL,
    bucket VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    order_index INT NOT NULL,
    INDEX idx_project_images_project (project_id),
    INDEX idx_project_images_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- projects table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    overview TEXT NOT NULL,
    technologies JSON NOT NULL,
    features JSON NOT NULL,
    live_url VARCHAR(255) NOT NULL,
    github_url VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    views INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_projects_user (user_id),
    INDEX idx_projects_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- settings table
CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    key VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_settings_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- tech_skills table
CREATE TABLE IF NOT EXISTS tech_skills (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tech_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    icon TEXT,
    level INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tech_skills_tech (tech_id),
    INDEX idx_tech_skills_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- automatic_update_capabilities table
CREATE TABLE IF NOT EXISTS automatic_update_capabilities (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_id VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    supports_automatic BOOLEAN DEFAULT FALSE,
    endpoint_url VARCHAR(255) NOT NULL,
    api_key_hash TEXT,
    last_capability_check TIMESTAMP NOT NULL,
    php_version TEXT,
    server_info JSON NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_automatic_update_capabilities_client (client_id)
);

-- automatic_update_client_performance table
CREATE TABLE IF NOT EXISTS automatic_update_client_performance (
    client_id VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    supports_automatic BOOLEAN DEFAULT FALSE,
    total_attempts INT NOT NULL,
    successful_updates INT NOT NULL,
    failed_updates INT NOT NULL,
    success_rate INT NOT NULL,
    avg_execution_time_ms TEXT,
    last_update_attempt TEXT,
    INDEX idx_automatic_update_client_performance_client (client_id)
);

-- automatic_update_logs table
CREATE TABLE IF NOT EXISTS automatic_update_logs (

);

-- automatic_update_performance table
CREATE TABLE IF NOT EXISTS automatic_update_performance (

);

-- recent_automatic_activity table
CREATE TABLE IF NOT EXISTS recent_automatic_activity (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    update_id VARCHAR(36) NOT NULL,
    version VARCHAR(255) NOT NULL,
    update_title VARCHAR(255) NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    activity VARCHAR(255) NOT NULL,
    success BOOLEAN DEFAULT FALSE,
    execution_time_ms TEXT,
    timestamp TIMESTAMP NOT NULL,
    supports_automatic TEXT,
    INDEX idx_recent_automatic_activity_update (update_id),
    INDEX idx_recent_automatic_activity_client (client_id)
);

-- shared_hosting_clients table
CREATE TABLE IF NOT EXISTS shared_hosting_clients (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_id VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    current_version VARCHAR(255) NOT NULL,
    deployment_type VARCHAR(255) NOT NULL,
    hosting_provider TEXT,
    cpanel_info TEXT,
    last_seen TIMESTAMP NOT NULL,
    user_agent VARCHAR(255) NOT NULL,
    timezone VARCHAR(255) NOT NULL,
    contact_email TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_shared_hosting_clients_client (client_id)
);

-- shared_hosting_notifications table
CREATE TABLE IF NOT EXISTS shared_hosting_notifications (

);

-- shared_hosting_update_logs table
CREATE TABLE IF NOT EXISTS shared_hosting_update_logs (

);

-- shared_hosting_update_stats table
CREATE TABLE IF NOT EXISTS shared_hosting_update_stats (

);

-- shared_hosting_updates table
CREATE TABLE IF NOT EXISTS shared_hosting_updates (

);

-- theme_clients table
CREATE TABLE IF NOT EXISTS theme_clients (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_id VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    current_version VARCHAR(255) NOT NULL,
    update_channel VARCHAR(255) NOT NULL,
    last_seen TIMESTAMP NOT NULL,
    last_updated TEXT,
    user_agent VARCHAR(255) NOT NULL,
    timezone VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_theme_clients_client (client_id)
);

-- theme_update_logs table
CREATE TABLE IF NOT EXISTS theme_update_logs (

);

-- theme_update_notifications table
CREATE TABLE IF NOT EXISTS theme_update_notifications (

);

-- theme_update_stats table
CREATE TABLE IF NOT EXISTS theme_update_stats (

);

-- theme_updates table
CREATE TABLE IF NOT EXISTS theme_updates (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    version VARCHAR(255) NOT NULL,
    channel VARCHAR(255) NOT NULL,
    files JSON NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    pushed_at TEXT,
    download_count INT NOT NULL,
    success_count INT NOT NULL,
    failure_count INT NOT NULL
);

