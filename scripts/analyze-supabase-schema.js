#!/usr/bin/env node

/**
 * SUPABASE SCHEMA ANALYZER
 * 
 * This script connects to Supabase and analyzes the actual table structures
 * to generate a proper MySQL schema that matches exactly.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL,
    key: process.env.REACT_APP_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  }
};

// Initialize Supabase client
const supabase = createClient(
  config.supabase.url, 
  config.supabase.serviceKey || config.supabase.key
);

// Core portfolio tables (from the image)
const CORE_TABLES = [
  'categories',
  'contact_queries', 
  'domains_technologies',
  'niche',
  'portfolio_config',
  'project_images',
  'projects',
  'settings',
  'tech_skills'
];

// System/automation tables (from the image)
const SYSTEM_TABLES = [
  'automatic_update_capabilities',
  'automatic_update_client_performance',
  'automatic_update_logs', 
  'automatic_update_performance',
  'recent_automatic_activity',
  'shared_hosting_clients',
  'shared_hosting_notifications',
  'shared_hosting_update_logs',
  'shared_hosting_update_stats',
  'shared_hosting_updates',
  'theme_clients',
  'theme_update_logs',
  'theme_update_notifications', 
  'theme_update_stats',
  'theme_updates'
];

const ALL_TABLES = [...CORE_TABLES, ...SYSTEM_TABLES];

async function getTableSchema(tableName) {
  console.log(`📋 Analyzing table: ${tableName}`);
  
  try {
    // Get a sample row to understand the structure
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.warn(`⚠️  Could not access table ${tableName}: ${error.message}`);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.warn(`⚠️  Table ${tableName} is empty, cannot analyze structure`);
      // Try to get structure by selecting with limit 0
      const { data: emptyData, error: emptyError } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);
        
      if (emptyError) {
        return null;
      }
      return { tableName, columns: {}, isEmpty: true };
    }
    
    const sampleRow = data[0];
    const columns = {};
    
    // Analyze each column
    for (const [columnName, value] of Object.entries(sampleRow)) {
      columns[columnName] = {
        type: analyzeType(value),
        nullable: value === null,
        sample: value
      };
    }
    
    return { tableName, columns, isEmpty: false };
    
  } catch (error) {
    console.error(`❌ Error analyzing table ${tableName}:`, error.message);
    return null;
  }
}

function analyzeType(value) {
  if (value === null) return 'UNKNOWN';
  
  const type = typeof value;
  
  switch (type) {
    case 'string':
      // Check if it's a UUID
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
        return 'UUID';
      }
      // Check if it's a timestamp
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return 'TIMESTAMP';
      }
      // Check if it's a date
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return 'DATE';
      }
      return value.length > 255 ? 'TEXT' : 'VARCHAR';
      
    case 'number':
      return Number.isInteger(value) ? 'INTEGER' : 'DECIMAL';
      
    case 'boolean':
      return 'BOOLEAN';
      
    case 'object':
      if (Array.isArray(value)) {
        return 'JSON_ARRAY';
      }
      return 'JSON';
      
    default:
      return 'UNKNOWN';
  }
}

function generateMySQLSchema(tableSchemas) {
  let sql = `-- =====================================================
-- MYSQL DATABASE SCHEMA FOR PORTFOLIO PROJECT  
-- =====================================================
-- Generated from Supabase schema analysis
-- Date: ${new Date().toISOString()}

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

`;

  // Generate table creation SQL for each analyzed table
  for (const schema of tableSchemas) {
    if (!schema) continue;
    
    sql += `-- ${schema.tableName} table\n`;
    sql += `CREATE TABLE IF NOT EXISTS ${schema.tableName} (\n`;
    
    const columns = [];
    const indexes = [];
    const foreignKeys = [];
    
    // Add columns
    for (const [columnName, columnInfo] of Object.entries(schema.columns)) {
      let columnDef = `    ${columnName} `;
      
      // Map types
      switch (columnInfo.type) {
        case 'UUID':
          columnDef += `VARCHAR(36)`;
          if (columnName === 'id') {
            columnDef += ` PRIMARY KEY DEFAULT (UUID())`;
          }
          break;
        case 'VARCHAR':
          columnDef += `VARCHAR(255)`;
          break;
        case 'TEXT':
          columnDef += `TEXT`;
          break;
        case 'INTEGER':
          if (columnName === 'id' && columnInfo.sample > 1000000) {
            columnDef += `BIGINT AUTO_INCREMENT PRIMARY KEY`;
          } else {
            columnDef += `INT`;
          }
          break;
        case 'DECIMAL':
          columnDef += `DECIMAL(10,2)`;
          break;
        case 'BOOLEAN':
          columnDef += `BOOLEAN DEFAULT FALSE`;
          break;
        case 'TIMESTAMP':
          columnDef += `TIMESTAMP`;
          if (columnName === 'created_at') {
            columnDef += ` DEFAULT CURRENT_TIMESTAMP`;
          } else if (columnName === 'updated_at') {
            columnDef += ` DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`;
          }
          break;
        case 'DATE':
          columnDef += `DATE`;
          break;
        case 'JSON':
        case 'JSON_ARRAY':
          columnDef += `JSON`;
          break;
        default:
          columnDef += `TEXT`;
      }
      
      // Add NOT NULL for required fields
      if (!columnInfo.nullable && !columnDef.includes('PRIMARY KEY') && !columnDef.includes('DEFAULT')) {
        if (columnName !== 'id') {
          columnDef += ` NOT NULL`;
        }
      }
      
      columns.push(columnDef);
      
      // Add indexes for common patterns
      if (columnName.endsWith('_id') || columnName === 'email' || columnName === 'status') {
        indexes.push(`    INDEX idx_${schema.tableName}_${columnName.replace('_id', '')} (${columnName})`);
      }
      
      // Add foreign key constraints
      if (columnName === 'user_id') {
        foreignKeys.push(`    FOREIGN KEY (${columnName}) REFERENCES users(id) ON DELETE CASCADE`);
      }
    }
    
    // Combine all parts
    const allParts = [...columns, ...indexes, ...foreignKeys];
    sql += allParts.join(',\n') + '\n';
    sql += `);\n\n`;
  }
  
  return sql;
}

async function analyzeSupabaseSchema() {
  console.log('🔍 Starting Supabase schema analysis...\n');
  
  const tableSchemas = [];
  
  for (const tableName of ALL_TABLES) {
    const schema = await getTableSchema(tableName);
    if (schema) {
      tableSchemas.push(schema);
      console.log(`✅ Successfully analyzed: ${tableName}`);
    } else {
      console.log(`❌ Failed to analyze: ${tableName}`);
    }
  }
  
  console.log(`\n📊 Analysis complete. Analyzed ${tableSchemas.length} tables.`);
  
  // Generate MySQL schema
  console.log('\n🔧 Generating MySQL schema...');
  const mysqlSchema = generateMySQLSchema(tableSchemas);
  
  // Write to file
  const outputPath = path.join(__dirname, '..', 'mysql_supabase_schema.sql');
  fs.writeFileSync(outputPath, mysqlSchema);
  
  console.log(`✅ MySQL schema written to: ${outputPath}`);
  
  // Also output summary
  console.log('\n📋 Table Analysis Summary:');
  for (const schema of tableSchemas) {
    console.log(`\n${schema.tableName}:`);
    for (const [columnName, columnInfo] of Object.entries(schema.columns)) {
      console.log(`  - ${columnName}: ${columnInfo.type} ${columnInfo.nullable ? '(nullable)' : '(required)'}`);
    }
  }
}

// Run analysis if called directly
if (require.main === module) {
  analyzeSupabaseSchema().catch(console.error);
}

module.exports = { analyzeSupabaseSchema }; 