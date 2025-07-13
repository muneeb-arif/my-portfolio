const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '8889'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DATABASE || 'portfolio',
  multipleStatements: true // Allow multiple SQL statements
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '..', 'sql', 'mysql-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📝 Executing database schema...');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    let executedCount = 0;
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          executedCount++;
          console.log(`✅ Executed statement ${executedCount}`);
        } catch (error) {
          console.log(`⚠️ Statement ${executedCount + 1} failed (might already exist): ${error.message}`);
        }
      }
    }
    
    console.log(`\n🎉 Database setup completed! Executed ${executedCount} statements.`);
    
    // Verify tables were created
    console.log('\n📋 Verifying tables...');
    const tables = [
      'categories',
      'domains_technologies', 
      'tech_skills',
      'niche',
      'settings',
      'contact_queries',
      'portfolio_config'
    ];
    
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
        if (rows.length > 0) {
          console.log(`✅ Table '${table}' exists`);
        } else {
          console.log(`❌ Table '${table}' missing`);
        }
      } catch (error) {
        console.log(`❌ Error checking table '${table}': ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the setup
setupDatabase(); 