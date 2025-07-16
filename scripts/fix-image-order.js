const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root', // From database.ts configuration
  database: 'portfolio' // From database.ts configuration
};

async function fixImageOrder() {
  let connection;
  
  try {
    console.log('🔧 Starting image order fix...\n');
    
    // Connect to database
    console.log('📡 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');
    
    // Step 1: Show current state
    console.log('📊 Step 1: Current image order in database');
    console.log('=' .repeat(50));
    
    const [currentRows] = await connection.execute(`
      SELECT 
        project_id,
        name,
        order_index,
        created_at
      FROM project_images 
      ORDER BY project_id, created_at
    `);
    
    if (currentRows.length === 0) {
      console.log('ℹ️  No project images found in database');
      return;
    }
    
    console.log(`Found ${currentRows.length} images across ${new Set(currentRows.map(row => row.project_id)).size} projects:\n`);
    
    // Group by project for better display
    const projects = {};
    currentRows.forEach(row => {
      if (!projects[row.project_id]) {
        projects[row.project_id] = [];
      }
      projects[row.project_id].push(row);
    });
    
    Object.keys(projects).forEach(projectId => {
      console.log(`Project ID: ${projectId}`);
      projects[projectId].forEach((img, index) => {
        console.log(`  ${index + 1}. ${img.name} (order_index: ${img.order_index}, created: ${img.created_at})`);
      });
      console.log('');
    });
    
    // Step 2: Check if fix is needed
    console.log('🔍 Step 2: Checking if fix is needed');
    console.log('=' .repeat(50));
    
    const needsFix = currentRows.some(row => row.order_index === 1 || row.order_index === null);
    
    if (!needsFix) {
      console.log('✅ All images already have proper order_index values');
      return;
    }
    
    console.log('❌ Found images with incorrect order_index values');
    console.log('🔄 Proceeding with fix...\n');
    
    // Step 3: Apply the fix
    console.log('🔧 Step 3: Applying order_index fix');
    console.log('=' .repeat(50));
    
    const [updateResult] = await connection.execute(`
      UPDATE project_images 
      SET order_index = (
        SELECT row_number 
        FROM (
          SELECT 
            id,
            ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at) as row_number
          FROM project_images
        ) as subquery
        WHERE subquery.id = project_images.id
      )
    `);
    
    console.log(`✅ Updated ${updateResult.affectedRows} images\n`);
    
    // Step 4: Show the fix results
    console.log('📊 Step 4: Results after fix');
    console.log('=' .repeat(50));
    
    const [fixedRows] = await connection.execute(`
      SELECT 
        project_id,
        name,
        order_index,
        created_at
      FROM project_images 
      ORDER BY project_id, order_index
    `);
    
    // Group by project for better display
    const fixedProjects = {};
    fixedRows.forEach(row => {
      if (!fixedProjects[row.project_id]) {
        fixedProjects[row.project_id] = [];
      }
      fixedProjects[row.project_id].push(row);
    });
    
    Object.keys(fixedProjects).forEach(projectId => {
      console.log(`Project ID: ${projectId}`);
      fixedProjects[projectId].forEach((img, index) => {
        console.log(`  ${index + 1}. ${img.name} (order_index: ${img.order_index}, created: ${img.created_at})`);
      });
      console.log('');
    });
    
    // Step 5: Summary
    console.log('📋 Step 5: Summary');
    console.log('=' .repeat(50));
    console.log(`✅ Successfully fixed order_index for ${updateResult.affectedRows} images`);
    console.log(`📁 Total projects with images: ${Object.keys(fixedProjects).length}`);
    console.log(`🖼️  Total images processed: ${fixedRows.length}`);
    console.log('\n🎉 Image order fix completed successfully!');
    console.log('💡 You can now test image reordering in the dashboard');
    
  } catch (error) {
    console.error('❌ Error during image order fix:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the fix
fixImageOrder().catch(console.error); 