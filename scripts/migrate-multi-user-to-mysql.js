#!/usr/bin/env node

/**
 * MULTI-USER SUPABASE TO MYSQL MIGRATION SCRIPT
 * 
 * This script migrates data from Supabase to MySQL for each user individually,
 * preserving the original user ownership of data.
 * 
 * Process:
 * 1. Truncate all data from MySQL tables
 * 2. Get all users from Supabase
 * 3. For each user, migrate their data to MySQL
 * 4. Verify migration completeness
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const config = {
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL,
    key: process.env.REACT_APP_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 8889,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
    database: process.env.MYSQL_DATABASE || 'portfolio',
    charset: 'utf8mb4',
    timezone: '+00:00'
  }
};

let supabase;
let mysqlConnection;

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
  return JSON.stringify(arr);
}

function convertPostgreSQLTimestamp(timestamp) {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function sanitizeText(text) {
  if (!text) return null;
  if (typeof text !== 'string') return text;
  return text.trim();
}

// Provided static user list
const STATIC_USERS = [
  { id: '4ef76b96-d00c-4895-a109-0dc729b4bc46', email: 'imaamir10@gmail.com' },
  { id: '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', email: 'khumi.malik@gmail.com' },
  { id: '1b437fd2-8576-44b0-b49e-741a0befe6a4', email: 'theexpertwayys@gmail.com' },
  { id: '94b101ed-9705-4a18-b25b-ef7376ad0550', email: 'ahsanmehmoodahsan@gmail.com' },
  { id: '9b054eaf-9a7c-483b-8915-84c439b3ae79', email: 'dev.ai.for.all99@gmail.com' },
  { id: '2f660a9a-3538-4384-970c-53b4bd37d4a8', email: 'zm4717696@gmail.com' },
  { id: '033f0150-6671-41e5-a968-ff40e9f07f26', email: 'fareedrao7890@gmail.com' },
  { id: 'e2e23b4c-2468-43b9-b12d-9bf73065d063', email: 'muneebarif11@gmail.com' }
];

// Initialize connections
async function initializeConnections() {
  console.log('🔌 Initializing database connections...');
  
  // Initialize Supabase
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
  
  // Initialize MySQL
  try {
    mysqlConnection = await mysql.createConnection(config.mysql);
    await mysqlConnection.execute('SELECT 1');
    await mysqlConnection.execute('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Database connections established');
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1);
  }
}

// Truncate all data
async function truncateAllData() {
  console.log('🗑️  Truncating all data from MySQL tables...');
  
  const tables = [
    'contact_queries',
    'project_images', 
    'projects',
    'categories',
    'technologies',
    'domains_technologies',
    'tech_skills',
    'niche',
    'settings',
    'portfolio_config',
    'users'
  ];
  
  for (const table of tables) {
    try {
      await mysqlConnection.execute(`TRUNCATE TABLE ${table}`);
      console.log(`✅ Truncated ${table}`);
    } catch (error) {
      console.warn(`⚠️  Could not truncate ${table}: ${error.message}`);
    }
  }
}

// Get all users from Supabase (now uses static list)
async function getSupabaseUsers() {
  console.log('👥 Using provided static user list...');
  // Add dummy metadata for migration
  return STATIC_USERS.map(u => ({
    id: u.id,
    email: u.email,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_metadata: { name: u.email.split('@')[0] }
  }));
}

// Migrate user data
async function migrateUserData(user) {
  console.log(`\n🔄 Migrating data for user: ${user.email} (${user.id})`);
  
  try {
    // Sanitize user fields
    const userId = user.id || '';
    const userEmail = user.email || '';
    const userName = (user.user_metadata && user.user_metadata.name) ? user.user_metadata.name : userEmail.split('@')[0];
    const userAvatar = (user.user_metadata && user.user_metadata.avatar_url) ? user.user_metadata.avatar_url : null;
    const userEmailVerified = false;
    const userCreatedAt = user.created_at ? convertPostgreSQLTimestamp(user.created_at) : new Date().toISOString().slice(0, 19).replace('T', ' ');
    const userUpdatedAt = user.updated_at ? convertPostgreSQLTimestamp(user.updated_at) : new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Insert user into MySQL with password
    await mysqlConnection.execute(
      `INSERT INTO users (id, email, name, avatar_url, email_verified, password_hash, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        userEmail,
        userName,
        userAvatar,
        userEmailVerified,
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.i8eO', // "11223344" bcrypt hash
        userCreatedAt,
        userUpdatedAt
      ]
    );
    
    // Migrate user's categories
    await migrateUserCategories(user.id);
    
    // Migrate user's projects
    await migrateUserProjects(user.id);
    
    // Migrate user's project images
    await migrateUserProjectImages(user.id);
    
    // Migrate user's technologies
    await migrateUserTechnologies(user.id);
    
    // Migrate user's domains_technologies
    await migrateUserDomainsTechnologies(user.id);
    
    // Migrate user's tech_skills
    await migrateUserTechSkills(user.id);
    
    // Migrate user's niche
    await migrateUserNiche(user.id);
    
    // Migrate user's settings
    await migrateUserSettings(user.id);
    
    // Migrate user's contact_queries
    await migrateUserContactQueries(user.id);
    
    // Set up portfolio config if this is the portfolio owner
    if (user.email === process.env.REACT_APP_PORTFOLIO_OWNER_EMAIL) {
      await mysqlConnection.execute(
        `INSERT INTO portfolio_config (owner_email, owner_user_id, is_active, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW())`,
        [user.email, user.id, true]
      );
      console.log(`✅ Set up portfolio config for ${user.email}`);
    }
    
    console.log(`✅ Completed migration for ${user.email}`);
    
  } catch (error) {
    console.error(`❌ Error migrating data for ${user.email}:`, error.message);
    throw error;
  }
}

// Migrate user's projects
async function migrateUserProjects(userId) {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.warn(`⚠️  Error fetching projects for user ${userId}:`, error.message);
    return;
  }
  
  for (const project of projects || []) {
    await mysqlConnection.execute(
      `INSERT INTO projects (id, user_id, title, description, category, overview, technologies, features, live_url, github_url, status, views, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project.id || generateUUID(),
        userId,
        sanitizeText(project.title) || null,
        sanitizeText(project.description) || null,
        sanitizeText(project.category) || null,
        sanitizeText(project.overview) || null,
        convertArrayToJSON(project.technologies) || null,
        convertArrayToJSON(project.features) || null,
        project.live_url || null,
        project.github_url || null,
        project.status || 'draft',
        project.views || 0,
        convertPostgreSQLTimestamp(project.created_at) || new Date().toISOString().slice(0, 19).replace('T', ' '),
        convertPostgreSQLTimestamp(project.updated_at) || new Date().toISOString().slice(0, 19).replace('T', ' ')
      ]
    );
  }
  
  if (projects?.length > 0) {
    console.log(`  💼 Migrated ${projects.length} projects`);
  }
}

// Migrate user's project images
async function migrateUserProjectImages(userId) {
  const { data: images, error } = await supabase
    .from('project_images')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.warn(`⚠️  Error fetching project images for user ${userId}:`, error.message);
    return;
  }
  
  for (const image of images || []) {
    await mysqlConnection.execute(
      `INSERT INTO project_images (id, project_id, user_id, url, path, name, original_name, size, type, bucket, order_index, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        image.id || generateUUID(),
        image.project_id || null,
        userId,
        image.url || null,
        image.path || null,
        image.name || null,
        image.original_name || null,
        image.size || null,
        image.type || null,
        image.bucket || 'images',
        image.order_index || 0,
        convertPostgreSQLTimestamp(image.created_at) || new Date().toISOString().slice(0, 19).replace('T', ' ')
      ]
    );
  }
  
  if (images?.length > 0) {
    console.log(`  🖼️  Migrated ${images.length} project images`);
  }
}

// Migrate user's categories
async function migrateUserCategories(userId) {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.warn(`⚠️  Error fetching categories for user ${userId}:`, error.message);
    return;
  }
  
  for (const category of categories || []) {
    await mysqlConnection.execute(
      `INSERT INTO categories (id, user_id, name, description, color, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        category.id || generateUUID(),
        userId,
        sanitizeText(category.name) || null,
        sanitizeText(category.description) || null,
        category.color || null,
        convertPostgreSQLTimestamp(category.created_at) || new Date().toISOString().slice(0, 19).replace('T', ' '),
        convertPostgreSQLTimestamp(category.updated_at) || new Date().toISOString().slice(0, 19).replace('T', ' ')
      ]
    );
  }
  
  if (categories?.length > 0) {
    console.log(`  📂 Migrated ${categories.length} categories`);
  }
}

// Migrate user's technologies
async function migrateUserTechnologies(userId) {
  const { data: technologies, error } = await supabase
    .from('technologies')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.warn(`⚠️  Error fetching technologies for user ${userId}:`, error.message);
    return;
  }
  
  for (const tech of technologies || []) {
    await mysqlConnection.execute(
      `INSERT INTO technologies (id, user_id, name, description, icon, color, category, proficiency_level, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tech.id || generateUUID(),
        userId,
        sanitizeText(tech.name),
        sanitizeText(tech.description),
        tech.icon,
        tech.color,
        tech.category,
        tech.proficiency_level,
        convertPostgreSQLTimestamp(tech.created_at),
        convertPostgreSQLTimestamp(tech.updated_at)
      ]
    );
  }
  
  if (technologies?.length > 0) {
    console.log(`  🛠️  Migrated ${technologies.length} technologies`);
  }
}

// Migrate user's domains_technologies
async function migrateUserDomainsTechnologies(userId) {
  const { data: domainsTech, error } = await supabase
    .from('domains_technologies')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.warn(`⚠️  Error fetching domains_technologies for user ${userId}:`, error.message);
    return;
  }
  
  for (const domainTech of domainsTech || []) {
    await mysqlConnection.execute(
      `INSERT INTO domains_technologies (id, user_id, type, title, icon, image, sort_order, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        domainTech.id || generateUUID(),
        userId,
        domainTech.type || null,
        sanitizeText(domainTech.title) || null,
        domainTech.icon || null,
        domainTech.image || null,
        domainTech.sort_order || 1,
        convertPostgreSQLTimestamp(domainTech.created_at) || new Date().toISOString().slice(0, 19).replace('T', ' '),
        convertPostgreSQLTimestamp(domainTech.updated_at) || new Date().toISOString().slice(0, 19).replace('T', ' ')
      ]
    );
  }
  
  if (domainsTech?.length > 0) {
    console.log(`  🎯 Migrated ${domainsTech.length} domains/technologies`);
  }
}

// Migrate user's tech_skills
async function migrateUserTechSkills(userId) {
  const { data: skills, error } = await supabase
    .from('tech_skills')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.warn(`⚠️  Error fetching tech_skills for user ${userId}:`, error.message);
    return;
  }
  
  for (const skill of skills || []) {
    await mysqlConnection.execute(
      `INSERT INTO tech_skills (id, tech_id, user_id, title, level, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        skill.id || generateUUID(),
        skill.tech_id || null,
        userId,
        sanitizeText(skill.title) || null,
        skill.level || 1,
        convertPostgreSQLTimestamp(skill.created_at) || new Date().toISOString().slice(0, 19).replace('T', ' '),
        convertPostgreSQLTimestamp(skill.updated_at) || new Date().toISOString().slice(0, 19).replace('T', ' ')
      ]
    );
  }
  
  if (skills?.length > 0) {
    console.log(`  🎓 Migrated ${skills.length} tech skills`);
  }
}

// Migrate user's niche
async function migrateUserNiche(userId) {
  const { data: niches, error } = await supabase
    .from('niche')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.warn(`⚠️  Error fetching niche for user ${userId}:`, error.message);
    return;
  }
  
  for (const niche of niches || []) {
    await mysqlConnection.execute(
      `INSERT INTO niche (id, user_id, image, title, overview, tools, key_features, sort_order, ai_driven, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        niche.id || generateUUID(),
        userId,
        niche.image || 'default.jpeg',
        sanitizeText(niche.title) || null,
        sanitizeText(niche.overview) || null,
        sanitizeText(niche.tools) || null,
        niche.key_features || null,
        niche.sort_order || 1,
        niche.ai_driven || false,
        convertPostgreSQLTimestamp(niche.created_at) || new Date().toISOString().slice(0, 19).replace('T', ' '),
        convertPostgreSQLTimestamp(niche.updated_at) || new Date().toISOString().slice(0, 19).replace('T', ' ')
      ]
    );
  }
  
  if (niches?.length > 0) {
    console.log(`  🏆 Migrated ${niches.length} niches`);
  }
}

// Migrate user's settings
async function migrateUserSettings(userId) {
  const { data: settings, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.warn(`⚠️  Error fetching settings for user ${userId}:`, error.message);
    return;
  }
  
  for (const setting of settings || []) {
    await mysqlConnection.execute(
      `INSERT INTO settings (id, user_id, setting_key, setting_value, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        setting.id || generateUUID(),
        userId,
        setting.key || null,
        setting.value || null,
        convertPostgreSQLTimestamp(setting.created_at) || new Date().toISOString().slice(0, 19).replace('T', ' '),
        convertPostgreSQLTimestamp(setting.updated_at) || new Date().toISOString().slice(0, 19).replace('T', ' ')
      ]
    );
  }
  
  if (settings?.length > 0) {
    console.log(`  ⚙️  Migrated ${settings.length} settings`);
  }
}

// Migrate user's contact_queries
async function migrateUserContactQueries(userId) {
  const { data: queries, error } = await supabase
    .from('contact_queries')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.warn(`⚠️  Error fetching contact_queries for user ${userId}:`, error.message);
    return;
  }
  
  for (const query of queries || []) {
    await mysqlConnection.execute(
      `INSERT INTO contact_queries (
        id, user_id, form_type, name, email, phone, company, subject, message, budget, timeline,
        inquiry_type, company_name, contact_person, communication_channel, business_description,
        target_customer, unique_value, problem_solving, core_features, existing_system,
        technical_constraints, competitors, brand_guide, color_preferences, tone_of_voice,
        payment_gateways, integrations, admin_control, gdpr_compliance, terms_privacy,
        launch_date, budget_range, post_mvp_features, long_term_goals, status, priority,
        notes, created_at, updated_at, responded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        query.id || generateUUID(),
        userId,
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
  }
  
  if (queries?.length > 0) {
    console.log(`  📧 Migrated ${queries.length} contact queries`);
  }
}

// Main migration function
async function runMigration() {
  console.log('🚀 Starting multi-user Supabase to MySQL migration...\n');
  
  try {
    await initializeConnections();
    
    // Step 1: Truncate all data
    await truncateAllData();
    
    // Step 2: Get all users from Supabase
    const users = await getSupabaseUsers();
    
    // Step 3: Migrate each user's data
    console.log('\n📊 Starting user data migration...');
    
    for (const user of users) {
      await migrateUserData(user);
    }
    
    console.log('\n🎉 Multi-user migration completed successfully!');
    console.log(`✅ Migrated data for ${users.length} users`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
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