#!/usr/bin/env node

require('dotenv').config();
const mysql = require('mysql2/promise');

const config = {
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    charset: 'utf8mb4'
  }
};

async function createTables() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL...');
    connection = await mysql.createConnection(config.mysql);
    
    console.log('📋 Creating tables...');
    
    // 1. Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        avatar_url TEXT,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created users table');
    
    // 2. Portfolio config table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS portfolio_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        owner_email VARCHAR(255) UNIQUE NOT NULL,
        owner_user_id VARCHAR(36),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created portfolio_config table');
    
    // 3. Categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        color VARCHAR(7) DEFAULT '#8B4513',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created categories table');
    
    // 4. Projects table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(36) PRIMARY KEY,
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created projects table');
    
    // 5. Project images table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS project_images (
        id VARCHAR(36) PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created project_images table');
    
    // 6. Domains technologies table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS domains_technologies (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        type VARCHAR(20) DEFAULT 'technology',
        title VARCHAR(255) NOT NULL,
        icon VARCHAR(500),
        image VARCHAR(500),
        sort_order INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created domains_technologies table');
    
    // 7. Tech skills table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tech_skills (
        id VARCHAR(36) PRIMARY KEY,
        tech_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        icon VARCHAR(500),
        level INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created tech_skills table');
    
    // 8. Niche table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS niche (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36),
        image VARCHAR(255) NOT NULL DEFAULT 'default.jpeg',
        title VARCHAR(255) NOT NULL,
        overview TEXT,
        tools TEXT,
        key_features TEXT,
        sort_order INT DEFAULT 1,
        ai_driven BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created niche table');
    
    // 9. Settings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        setting_key VARCHAR(100) NOT NULL,
        setting_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created settings table');
    
    // 10. Contact queries table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS contact_queries (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36),
        form_type VARCHAR(20) DEFAULT 'contact',
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        responded_at TIMESTAMP NULL
      )
    `);
    console.log('✅ Created contact_queries table');
    
    // Verify tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`\n📊 Created ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    console.log('\n🎉 All tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  createTables();
}

module.exports = { createTables }; 