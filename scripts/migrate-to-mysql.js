#!/usr/bin/env node

/**
 * SUPABASE TO MYSQL DATA MIGRATION SCRIPT
 * 
 * This script migrates all data from your Supabase PostgreSQL database
 * to a MySQL database, handling data type conversions and transformations.
 * 
 * Prerequisites:
 * 1. Install dependencies: npm install mysql2 @supabase/supabase-js dotenv
 * 2. Set environment variables for both Supabase and MySQL connections
 * 3. Ensure MySQL database exists and schema is already created
 * 
 * Usage:
 * node scripts/migrate-to-mysql.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');

// Configuration from environment variables
const config = {
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL,
    key: process.env.REACT_APP_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY // Better for data access
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

// Validate configuration
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
    console.error('\nPlease set the required environment variables and try again.');
    process.exit(1);
  }
}

// Initialize connections
let supabase;
let mysqlConnection;

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
    
    // Ensure proper character set and collation
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
    // Handle PostgreSQL array format: {item1,item2,item3}
    if (arr.startsWith('{') && arr.endsWith('}')) {
      return JSON.stringify(arr.slice(1, -1).split(',').map(item => item.trim()));
    }
    return arr;
  }
  return JSON.stringify(arr);
}

function convertJSONBToJSON(jsonb) {
  if (!jsonb) return null;
  if (typeof jsonb === 'object') return JSON.stringify(jsonb);
  return jsonb;
}

function convertPostgreSQLTimestamp(timestamp) {
  if (!timestamp) return null;
  
  // Convert PostgreSQL timestamp to MySQL datetime format
  // PostgreSQL: '2025-07-05T23:24:25.652635+00:00'
  // MySQL: '2025-07-05 23:24:25'
  
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
    // Remove or replace problematic 4-byte Unicode characters (emojis, etc.)
    // This is a fallback for databases that don't properly support utf8mb4
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
    // Fallback: remove all non-ASCII characters
    return text.replace(/[^\x00-\x7F]/g, '').trim();
  }
}

function handleUndefined(value) {
  // Convert undefined to null for MySQL compatibility
  return value === undefined ? null : value;
}

async function checkTableExists(tableName) {
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

// Migration functions for each table
async function migrateUsers() {
  console.log('👥 Migrating users...');
  
  // Get users from Supabase auth (this might require service role key)
  try {
    const { data: authUsers, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.warn('⚠️  Could not fetch auth users (normal with anon key). Creating portfolio owner user...');
      
      // Create a default user for the portfolio owner
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
        
        // Check if this is the portfolio owner
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

async function migrateCategories(portfolioOwnerUserId) {
  console.log('📂 Migrating categories...');
  
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*');
    
  if (error) {
    console.error('❌ Error fetching categories:', error.message);
    return;
  }
  
  let insertedCount = 0;
  for (const category of categories) {
    await mysqlConnection.execute(
      `INSERT INTO categories (id, user_id, name, description, color, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       name = VALUES(name), 
       description = VALUES(description), 
       color = VALUES(color)`,
      [
        category.id || generateUUID(),
        portfolioOwnerUserId,
        sanitizeText(category.name),
        sanitizeText(category.description),
        category.color,
        convertPostgreSQLTimestamp(category.created_at),
        convertPostgreSQLTimestamp(category.updated_at)
      ]
    );
    insertedCount++;
  }
  
  console.log(`✅ Migrated ${insertedCount} categories`);
}

async function migrateProjects(portfolioOwnerUserId) {
  console.log('💼 Migrating projects...');
  
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*');
    
  if (error) {
    console.error('❌ Error fetching projects:', error.message);
    return;
  }
  
  let insertedCount = 0;
  for (const project of projects) {
    await mysqlConnection.execute(
      `INSERT INTO projects (id, user_id, title, description, category, overview, technologies, features, live_url, github_url, status, views, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       title = VALUES(title), 
       description = VALUES(description), 
       category = VALUES(category), 
       overview = VALUES(overview),
       technologies = VALUES(technologies),
       features = VALUES(features),
       live_url = VALUES(live_url),
       github_url = VALUES(github_url),
       status = VALUES(status),
       views = VALUES(views)`,
      [
        project.id || generateUUID(),
        portfolioOwnerUserId,
        sanitizeText(project.title),
        sanitizeText(project.description),
        sanitizeText(project.category),
        sanitizeText(project.overview),
        convertArrayToJSON(project.technologies),
        convertArrayToJSON(project.features),
        project.live_url,
        project.github_url,
        project.status,
        project.views || 0,
        convertPostgreSQLTimestamp(project.created_at),
        convertPostgreSQLTimestamp(project.updated_at)
      ]
    );
    insertedCount++;
  }
  
  console.log(`✅ Migrated ${insertedCount} projects`);
}

async function migrateProjectImages(portfolioOwnerUserId) {
  console.log('🖼️  Migrating project images...');
  
  const { data: images, error } = await supabase
    .from('project_images')
    .select('*');
    
  if (error) {
    console.error('❌ Error fetching project images:', error.message);
    return;
  }
  
  let insertedCount = 0;
  for (const image of images) {
    await mysqlConnection.execute(
      `INSERT INTO project_images (id, project_id, user_id, url, path, name, original_name, size, type, bucket, order_index, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       url = VALUES(url), 
       path = VALUES(path), 
       name = VALUES(name),
       order_index = VALUES(order_index)`,
      [
        image.id || generateUUID(),
        image.project_id,
        portfolioOwnerUserId,
        image.url,
        image.path,
        image.name,
        image.original_name,
        image.size,
        image.type,
        image.bucket || 'images',
        image.order_index || 0,
        convertPostgreSQLTimestamp(image.created_at)
      ]
    );
    insertedCount++;
  }
  
  console.log(`✅ Migrated ${insertedCount} project images`);
}

async function migrateTechnologies(portfolioOwnerUserId) {
  console.log('🔧 Migrating technologies...');
  
  const { data: technologies, error } = await supabase
    .from('technologies')
    .select('*');
    
  if (error) {
    console.warn('⚠️  Technologies table does not exist, skipping...');
    return;
  }
  
  let insertedCount = 0;
  for (const tech of technologies) {
    await mysqlConnection.execute(
      `INSERT INTO technologies (id, user_id, name, description, icon, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       name = VALUES(name), 
       description = VALUES(description), 
       icon = VALUES(icon)`,
      [
        tech.id || generateUUID(),
        portfolioOwnerUserId,
        sanitizeText(tech.name),
        sanitizeText(tech.description),
        tech.icon,
        convertPostgreSQLTimestamp(tech.created_at)
      ]
    );
    insertedCount++;
  }
  
  console.log(`✅ Migrated ${insertedCount} technologies`);
}

async function migrateDomainsTechnologies(portfolioOwnerUserId) {
  console.log('🌐 Migrating domains_technologies...');
  
  if (!(await checkTableExists('domains_technologies'))) {
    return;
  }
  
  const { data: domainsTech, error } = await supabase
    .from('domains_technologies')
    .select('*');
    
  if (error) {
    console.error('❌ Error fetching domains_technologies:', error.message);
    return;
  }
  
  let insertedCount = 0;
  for (const item of domainsTech) {
    await mysqlConnection.execute(
      `INSERT INTO domains_technologies (id, user_id, type, title, icon, image, sort_order, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       type = VALUES(type), 
       title = VALUES(title), 
       icon = VALUES(icon),
       image = VALUES(image),
       sort_order = VALUES(sort_order)`,
      [
        handleUndefined(item.id) || generateUUID(),
        portfolioOwnerUserId,
        handleUndefined(item.type) || 'technology',
        handleUndefined(sanitizeText(item.title)),
        handleUndefined(item.icon),
        handleUndefined(item.image),
        handleUndefined(item.sort_order) || 1,
        convertPostgreSQLTimestamp(item.created_at),
        convertPostgreSQLTimestamp(item.updated_at)
      ]
    );
    insertedCount++;
  }
  
  console.log(`✅ Migrated ${insertedCount} domains_technologies`);
}

async function migrateTechSkills(portfolioOwnerUserId) {
  console.log('⚡ Migrating tech_skills...');
  
  if (!(await checkTableExists('tech_skills'))) {
    return;
  }
  
  const { data: techSkills, error } = await supabase
    .from('tech_skills')
    .select('*');
    
  if (error) {
    console.error('❌ Error fetching tech_skills:', error.message);
    return;
  }
  
  let insertedCount = 0;
  for (const skill of techSkills) {
    await mysqlConnection.execute(
      `INSERT INTO tech_skills (id, tech_id, user_id, title, level, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       title = VALUES(title), 
       level = VALUES(level)`,
      [
        skill.id || generateUUID(),
        skill.tech_id,
        portfolioOwnerUserId,
        skill.title,
        skill.level || 1,
        convertPostgreSQLTimestamp(skill.created_at),
        convertPostgreSQLTimestamp(skill.updated_at)
      ]
    );
    insertedCount++;
  }
  
  console.log(`✅ Migrated ${insertedCount} tech_skills`);
}

async function migrateNiche(portfolioOwnerUserId) {
  console.log('🎯 Migrating niche...');
  
  if (!(await checkTableExists('niche'))) {
    return;
  }
  
  const { data: niches, error } = await supabase
    .from('niche')
    .select('*');
    
  if (error) {
    console.error('❌ Error fetching niche:', error.message);
    return;
  }
  
  let insertedCount = 0;
  for (const niche of niches) {
    await mysqlConnection.execute(
      `INSERT INTO niche (id, user_id, image, title, overview, tools, key_features, sort_order, ai_driven, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       image = VALUES(image), 
       title = VALUES(title), 
       overview = VALUES(overview),
       tools = VALUES(tools),
       key_features = VALUES(key_features),
       sort_order = VALUES(sort_order),
       ai_driven = VALUES(ai_driven)`,
      [
        niche.id,
        portfolioOwnerUserId,
        niche.image || 'default.jpeg',
        niche.title,
        niche.overview || '',
        niche.tools || '',
        niche.key_features,
        niche.sort_order || 1,
        niche.ai_driven || false,
        convertPostgreSQLTimestamp(niche.created_at),
        convertPostgreSQLTimestamp(niche.updated_at)
      ]
    );
    insertedCount++;
  }
  
  console.log(`✅ Migrated ${insertedCount} niche records`);
}

async function migrateSettings(portfolioOwnerUserId) {
  console.log('⚙️  Migrating settings...');
  
  if (!(await checkTableExists('settings'))) {
    return;
  }
  
  const { data: settings, error } = await supabase
    .from('settings')
    .select('*');
    
  if (error) {
    console.error('❌ Error fetching settings:', error.message);
    return;
  }
  
  let insertedCount = 0;
  for (const setting of settings) {
    await mysqlConnection.execute(
      `INSERT INTO settings (id, user_id, setting_key, setting_value, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       setting_value = VALUES(setting_value)`,
      [
        setting.id || generateUUID(),
        portfolioOwnerUserId,
        setting.key, // Note: 'key' in PostgreSQL becomes 'setting_key' in MySQL
        setting.value,
        convertPostgreSQLTimestamp(setting.created_at),
        convertPostgreSQLTimestamp(setting.updated_at)
      ]
    );
    insertedCount++;
  }
  
  console.log(`✅ Migrated ${insertedCount} settings`);
}

async function migrateContactQueries(portfolioOwnerUserId) {
  console.log('📧 Migrating contact_queries...');
  
  if (!(await checkTableExists('contact_queries'))) {
    return;
  }
  
  const { data: queries, error } = await supabase
    .from('contact_queries')
    .select('*');
    
  if (error) {
    console.error('❌ Error fetching contact_queries:', error.message);
    return;
  }
  
  let insertedCount = 0;
  for (const query of queries) {
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
       ON DUPLICATE KEY UPDATE 
       status = VALUES(status), 
       priority = VALUES(priority), 
       notes = VALUES(notes)`,
      [
        query.id,
        portfolioOwnerUserId,
        query.form_type,
        query.name,
        query.email,
        query.phone,
        query.company,
        query.subject,
        query.message,
        query.budget,
        query.timeline,
        query.inquiry_type,
        query.company_name,
        query.contact_person,
        query.communication_channel,
        query.business_description,
        query.target_customer,
        query.unique_value,
        query.problem_solving,
        query.core_features,
        query.existing_system,
        query.technical_constraints,
        query.competitors,
        query.brand_guide,
        query.color_preferences,
        query.tone_of_voice,
        query.payment_gateways,
        query.integrations,
        query.admin_control,
        query.gdpr_compliance || false,
        query.terms_privacy || false,
        query.launch_date,
        query.budget_range,
        query.post_mvp_features,
        query.long_term_goals,
        query.status || 'new',
        query.priority || 'medium',
        query.notes,
        convertPostgreSQLTimestamp(query.created_at),
        convertPostgreSQLTimestamp(query.updated_at),
        convertPostgreSQLTimestamp(query.responded_at)
      ]
    );
    insertedCount++;
  }
  
  console.log(`✅ Migrated ${insertedCount} contact queries`);
}

// Main migration function
async function runMigration() {
  console.log('🚀 Starting Supabase to MySQL migration...\n');
  
  try {
    validateConfig();
    await initializeConnections();
    
    // Start transaction
    await mysqlConnection.beginTransaction();
    
    console.log('\n📊 Starting data migration...');
    
    // Migrate in order (respecting foreign key dependencies)
    const portfolioOwnerUserId = await migrateUsers();
    await migrateCategories(portfolioOwnerUserId);
    await migrateProjects(portfolioOwnerUserId);
    await migrateProjectImages(portfolioOwnerUserId);
    await migrateTechnologies(portfolioOwnerUserId);
    await migrateDomainsTechnologies(portfolioOwnerUserId);
    await migrateTechSkills(portfolioOwnerUserId);
    await migrateNiche(portfolioOwnerUserId);
    await migrateSettings(portfolioOwnerUserId);
    await migrateContactQueries(portfolioOwnerUserId);
    
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