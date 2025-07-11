#!/usr/bin/env node

/**
 * SUPABASE TO MYSQL DATA MIGRATION SCRIPT V2
 * 
 * Updated version that properly migrates all user data based on actual
 * Supabase table structures and corrected MySQL schema.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');

// Configuration from environment variables
const config = {
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL,
    key: process.env.REACT_APP_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    charset: 'utf8mb4',
    timezone: '+00:00'
  },
  portfolio_owner_email: process.env.REACT_APP_PORTFOLIO_OWNER_EMAIL
};

// Initialize connections
let supabase;
let mysqlConnection;

function validateConfig() {
  const errors = [];
  
  if (!config.supabase.url) errors.push('Missing REACT_APP_SUPABASE_URL');
  if (!config.supabase.key && !config.supabase.serviceKey) {
    errors.push('Missing REACT_APP_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY');
  }
  if (!config.mysql.host) errors.push('Missing MYSQL_HOST');
  if (!config.mysql.user) errors.push('Missing MYSQL_USER');
  if (!config.mysql.password) errors.push('Missing MYSQL_PASSWORD');
  if (!config.mysql.database) errors.push('Missing MYSQL_DATABASE');
  
  if (errors.length > 0) {
    console.error('❌ Configuration errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }
}

async function initializeConnections() {
  console.log('🔌 Initializing database connections...');
  
  // Initialize Supabase client
  const supabaseKey = config.supabase.serviceKey || config.supabase.key;
  supabase = createClient(config.supabase.url, supabaseKey);
  
  // Test Supabase connection
  const { data: supabaseTest, error: supabaseError } = await supabase
    .from('projects')
    .select('count', { count: 'exact', head: true });
    
  if (supabaseError) {
    console.error('❌ Supabase connection failed:', supabaseError.message);
    process.exit(1);
  }
  
  // Initialize MySQL connection
  try {
    mysqlConnection = await mysql.createConnection(config.mysql);
    await mysqlConnection.execute('SELECT 1');
    
    // Ensure proper character set for emojis and special characters
    await mysqlConnection.execute('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
    await mysqlConnection.execute('SET CHARACTER SET utf8mb4');
    await mysqlConnection.execute('SET character_set_connection=utf8mb4');
    
    console.log('✅ Database connections established');
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1);
  }
}

// Utility functions
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function convertArrayToJSON(arr) {
  if (!arr) return null;
  if (typeof arr === 'string') {
    if (arr.startsWith('{') && arr.endsWith('}')) {
      return JSON.stringify(arr.slice(1, -1).split(',').map(item => item.trim()));
    }
    return arr;
  }
  if (Array.isArray(arr)) {
    return JSON.stringify(arr);
  }
  return JSON.stringify(arr);
}

function convertPostgreSQLTimestamp(timestamp) {
  if (!timestamp) return null;
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    console.warn(`⚠️  Invalid timestamp: ${timestamp}, using current time`);
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
  
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function sanitizeText(text) {
  if (!text) return null;
  if (typeof text !== 'string') return text;
  
  try {
    // Remove problematic 4-byte Unicode characters if needed
    return text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Regional indicators
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
      .trim();
  } catch (error) {
    console.warn(`⚠️  Error sanitizing text: ${error.message}`);
    return text.replace(/[^\x00-\x7F]/g, '').trim();
  }
}

function handleUndefined(value) {
  return value === undefined ? null : value;
}

async function safeTableExists(tableName) {
  try {
    await mysqlConnection.execute(`SELECT 1 FROM ${tableName} LIMIT 1`);
    return true;
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.warn(`⚠️  ${tableName} table does not exist in MySQL, skipping...`);
      return false;
    }
    throw error;
  }
}

// Migration functions
async function migrateUsers() {
  console.log('👥 Migrating users...');
  
  try {
    const { data: authUsers, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.warn('⚠️  Could not fetch auth users (normal with anon key). Creating portfolio owner user...');
      
      if (config.portfolio_owner_email) {
        const userId = generateUUID();
        await mysqlConnection.execute(
          `INSERT INTO users (id, email, name, email_verified, created_at, updated_at) 
           VALUES (?, ?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE email = VALUES(email)`,
          [userId, config.portfolio_owner_email, 'Portfolio Owner', true]
        );
        
        // Set up portfolio config
        await mysqlConnection.execute(
          `INSERT INTO portfolio_config (owner_email, owner_user_id, is_active, created_at, updated_at)
           VALUES (?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE owner_user_id = VALUES(owner_user_id), is_active = VALUES(is_active)`,
          [config.portfolio_owner_email, userId, true]
        );
        
        console.log(`✅ Created portfolio owner user: ${config.portfolio_owner_email}`);
        return userId;
      }
    } else {
      let insertedCount = 0;
      let portfolioOwnerUserId = null;
      
      for (const user of authUsers.users) {
        const userId = user.id;
        await mysqlConnection.execute(
          `INSERT INTO users (id, email, name, avatar_url, email_verified, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           email = VALUES(email), 
           name = VALUES(name), 
           avatar_url = VALUES(avatar_url)`,
          [
            userId,
            user.email,
            user.user_metadata?.name || user.email.split('@')[0],
            user.user_metadata?.avatar_url,
            user.email_confirmed_at ? true : false,
            convertPostgreSQLTimestamp(user.created_at),
            convertPostgreSQLTimestamp(user.updated_at)
          ]
        );
        
        if (user.email === config.portfolio_owner_email) {
          portfolioOwnerUserId = userId;
          await mysqlConnection.execute(
            `INSERT INTO portfolio_config (owner_email, owner_user_id, is_active, created_at, updated_at)
             VALUES (?, ?, ?, NOW(), NOW())
             ON DUPLICATE KEY UPDATE owner_user_id = VALUES(owner_user_id), is_active = VALUES(is_active)`,
            [user.email, userId, true]
          );
        }
        
        insertedCount++;
      }
      
      console.log(`✅ Migrated ${insertedCount} users`);
      return portfolioOwnerUserId;
    }
  } catch (error) {
    console.error('❌ Error migrating users:', error.message);
    return null;
  }
}

async function migrateTable(tableName, portfolioOwnerUserId, migrationLogic) {
  console.log(`📋 Migrating ${tableName}...`);
  
  if (!(await safeTableExists(tableName))) {
    return;
  }
  
  const { data, error } = await supabase
    .from(tableName)
    .select('*');
    
  if (error) {
    console.error(`❌ Error fetching ${tableName}:`, error.message);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log(`✅ ${tableName} is empty, nothing to migrate`);
    return;
  }
  
  let insertedCount = 0;
  for (const row of data) {
    try {
      await migrationLogic(row, portfolioOwnerUserId);
      insertedCount++;
    } catch (err) {
      console.error(`❌ Error migrating row in ${tableName}:`, err.message);
      console.error('Row data:', row);
    }
  }
  
  console.log(`✅ Migrated ${insertedCount} ${tableName} records`);
}

// Specific migration logic for each table
const migrationStrategies = {
  categories: async (row, portfolioOwnerUserId) => {
    await mysqlConnection.execute(
      `INSERT INTO categories (id, user_id, name, description, color, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       name = VALUES(name), description = VALUES(description), color = VALUES(color)`,
      [
        row.id || generateUUID(),
        portfolioOwnerUserId,
        sanitizeText(row.name),
        sanitizeText(row.description),
        row.color,
        convertPostgreSQLTimestamp(row.created_at),
        convertPostgreSQLTimestamp(row.updated_at)
      ]
    );
  },

  projects: async (row, portfolioOwnerUserId) => {
    await mysqlConnection.execute(
      `INSERT INTO projects (id, user_id, title, description, category, overview, technologies, features, live_url, github_url, status, views, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       title = VALUES(title), description = VALUES(description), category = VALUES(category), 
       overview = VALUES(overview), technologies = VALUES(technologies), features = VALUES(features),
       live_url = VALUES(live_url), github_url = VALUES(github_url), status = VALUES(status), views = VALUES(views)`,
      [
        row.id || generateUUID(),
        portfolioOwnerUserId,
        sanitizeText(row.title),
        sanitizeText(row.description),
        sanitizeText(row.category),
        sanitizeText(row.overview),
        convertArrayToJSON(row.technologies),
        convertArrayToJSON(row.features),
        row.live_url,
        row.github_url,
        row.status,
        row.views || 0,
        convertPostgreSQLTimestamp(row.created_at),
        convertPostgreSQLTimestamp(row.updated_at)
      ]
    );
  },

  project_images: async (row, portfolioOwnerUserId) => {
    await mysqlConnection.execute(
      `INSERT INTO project_images (id, project_id, user_id, url, path, name, original_name, size, type, bucket, order_index, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE url = VALUES(url), path = VALUES(path), name = VALUES(name), order_index = VALUES(order_index)`,
      [
        row.id || generateUUID(),
        row.project_id,
        portfolioOwnerUserId,
        row.url,
        row.path,
        row.name,
        row.original_name,
        row.size,
        row.type,
        row.bucket || 'images',
        row.order_index || 0,
        convertPostgreSQLTimestamp(row.created_at)
      ]
    );
  },

  domains_technologies: async (row, portfolioOwnerUserId) => {
    await mysqlConnection.execute(
      `INSERT INTO domains_technologies (id, user_id, type, title, icon, image, sort_order, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE type = VALUES(type), title = VALUES(title), icon = VALUES(icon), image = VALUES(image), sort_order = VALUES(sort_order)`,
      [
        row.id || generateUUID(),
        portfolioOwnerUserId,
        row.type || 'technology',
        sanitizeText(row.title),
        row.icon,
        row.image,
        row.sort_order || 1,
        convertPostgreSQLTimestamp(row.created_at),
        convertPostgreSQLTimestamp(row.updated_at)
      ]
    );
  },

  tech_skills: async (row, portfolioOwnerUserId) => {
    await mysqlConnection.execute(
      `INSERT INTO tech_skills (id, tech_id, user_id, title, icon, level, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE title = VALUES(title), level = VALUES(level)`,
      [
        row.id || generateUUID(),
        row.tech_id,
        portfolioOwnerUserId,
        sanitizeText(row.title),
        row.icon,
        row.level || 1,
        convertPostgreSQLTimestamp(row.created_at),
        convertPostgreSQLTimestamp(row.updated_at)
      ]
    );
  },

  niche: async (row, portfolioOwnerUserId) => {
    await mysqlConnection.execute(
      `INSERT INTO niche (id, user_id, image, title, overview, tools, key_features, sort_order, ai_driven, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE image = VALUES(image), title = VALUES(title), overview = VALUES(overview),
       tools = VALUES(tools), key_features = VALUES(key_features), sort_order = VALUES(sort_order), ai_driven = VALUES(ai_driven)`,
      [
        row.id,
        portfolioOwnerUserId,
        row.image || 'default.jpeg',
        sanitizeText(row.title),
        sanitizeText(row.overview) || '',
        sanitizeText(row.tools) || '',
        sanitizeText(row.key_features),
        row.sort_order || 1,
        row.ai_driven || false,
        convertPostgreSQLTimestamp(row.created_at),
        convertPostgreSQLTimestamp(row.updated_at)
      ]
    );
  },

  settings: async (row, portfolioOwnerUserId) => {
    // Map all Supabase user_ids to the single portfolio owner in MySQL
    const effectiveUserId = portfolioOwnerUserId;
    
    await mysqlConnection.execute(
      `INSERT INTO settings (id, user_id, setting_key, setting_value, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [
        row.id || generateUUID(),
        effectiveUserId, // Use portfolio owner ID for all settings
        row.key, // Note: 'key' in Supabase becomes 'setting_key' in MySQL
        row.value,
        convertPostgreSQLTimestamp(row.created_at),
        convertPostgreSQLTimestamp(row.updated_at)
      ]
    );
  },

  contact_queries: async (row, portfolioOwnerUserId) => {
    await mysqlConnection.execute(
      `INSERT INTO contact_queries (
        id, user_id, form_type, name, email, phone, company, subject, message, budget, timeline,
        inquiry_type, company_name, contact_person, communication_channel, business_description,
        target_customer, unique_value, problem_solving, core_features, existing_system,
        technical_constraints, competitors, brand_guide, color_preferences, tone_of_voice,
        payment_gateways, integrations, admin_control, gdpr_compliance, terms_privacy,
        launch_date, budget_range, post_mvp_features, long_term_goals, status, priority,
        notes, created_at, updated_at, responded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), priority = VALUES(priority), notes = VALUES(notes)`,
      [
        row.id,
        portfolioOwnerUserId,
        row.form_type,
        row.name,
        row.email,
        row.phone,
        row.company,
        row.subject,
        row.message,
        row.budget,
        row.timeline,
        row.inquiry_type,
        row.company_name,
        row.contact_person,
        row.communication_channel,
        row.business_description,
        row.target_customer,
        row.unique_value,
        row.problem_solving,
        row.core_features,
        row.existing_system,
        row.technical_constraints,
        row.competitors,
        row.brand_guide,
        row.color_preferences,
        row.tone_of_voice,
        row.payment_gateways,
        row.integrations,
        row.admin_control,
        row.gdpr_compliance || false,
        row.terms_privacy || false,
        row.launch_date,
        row.budget_range,
        row.post_mvp_features,
        row.long_term_goals,
        row.status || 'new',
        row.priority || 'medium',
        row.notes,
        convertPostgreSQLTimestamp(row.created_at),
        convertPostgreSQLTimestamp(row.updated_at),
        convertPostgreSQLTimestamp(row.responded_at)
      ]
    );
  }
};

async function runMigration() {
  console.log('🚀 Starting Supabase to MySQL migration v2...\n');
  
  try {
    validateConfig();
    await initializeConnections();
    
    // Start transaction
    await mysqlConnection.beginTransaction();
    
    console.log('\n📊 Starting data migration...');
    
    // Migrate users first
    const portfolioOwnerUserId = await migrateUsers();
    
    // Migrate all tables
    const coreTables = ['categories', 'projects', 'project_images', 'domains_technologies', 'tech_skills', 'niche', 'settings', 'contact_queries'];
    
    for (const tableName of coreTables) {
      if (migrationStrategies[tableName]) {
        await migrateTable(tableName, portfolioOwnerUserId, migrationStrategies[tableName]);
      } else {
        console.warn(`⚠️  No migration strategy for ${tableName}`);
      }
    }
    
    // Commit transaction
    await mysqlConnection.commit();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify data in MySQL database');
    console.log('2. Update your application to use MySQL instead of Supabase');
    console.log('3. Test all functionality with the new database');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    
    if (mysqlConnection) {
      await mysqlConnection.rollback();
      console.log('🔄 Transaction rolled back');
    }
    
    process.exit(1);
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration }; 