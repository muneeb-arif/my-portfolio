#!/usr/bin/env node

/**
 * SIMPLE MYSQL TABLE SETUP SCRIPT
 * 
 * This script creates only the essential tables needed for the portfolio migration
 * without the problematic functions and views.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

// Configuration from environment variables
const config = {
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    charset: 'utf8mb4',
    timezone: '+00:00'
  }
};

let mysqlConnection;

const TABLE_CREATION_SQL = `
-- Set MySQL settings
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';
SET time_zone = '+00:00';

-- Users table
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
    name VARCHAR(255) NOT NULL,
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
    technologies JSON,
    features JSON,
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

-- Settings table
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
`;

async function setupTables() {
  console.log('🔧 MySQL Table Setup Tool\n');
  
  try {
    // Connect to MySQL
    console.log('🔌 Connecting to MySQL database...');
    mysqlConnection = await mysql.createConnection(config.mysql);
    await mysqlConnection.execute('SELECT 1');
    
    // Set character set
    await mysqlConnection.execute('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
    await mysqlConnection.execute('SET CHARACTER SET utf8mb4');
    await mysqlConnection.execute('SET character_set_connection=utf8mb4');
    
    console.log(`✅ Connected to MySQL database: ${config.mysql.database}`);
    
    // Execute table creation SQL
    console.log('📋 Creating database tables...');
    
    // Split into individual statements and execute
    const statements = TABLE_CREATION_SQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    let createdTables = 0;
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await mysqlConnection.execute(statement);
          
          if (statement.toLowerCase().includes('create table')) {
            const tableName = statement.match(/create table (?:if not exists\s+)?`?(\w+)`?/i)?.[1];
            console.log(`  ✅ Created table: ${tableName}`);
            createdTables++;
          }
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log(`  ⚠️  Table already exists`);
          } else {
            console.error(`  ❌ Error: ${error.message}`);
          }
        }
      }
    }
    
    // Verify tables were created
    const [tables] = await mysqlConnection.execute('SHOW TABLES');
    console.log(`\n📊 Database now contains ${tables.length} tables:`);
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      console.log(`  - ${tableName}`);
    }
    
    console.log('\n✅ Table setup completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Table setup failed:', error.message);
    throw error;
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  setupTables();
}

module.exports = { setupTables }; 