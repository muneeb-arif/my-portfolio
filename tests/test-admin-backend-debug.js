const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 8889, // MAMP MySQL port
  user: 'root',
  password: 'root',
  database: 'portfolio'
};

async function testBackendAdminAPI() {
  let connection;
  
  try {
    console.log('🔍 Testing Backend Admin API...\n');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');
    
    // 1. Test login and get token
    console.log('1. Testing login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'muneebarif11@gmail.com',
        password: '11223344'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('   User ID:', loginData.user.id);
    console.log('   Is Admin:', loginData.user.is_admin);
    
    // 2. Test verifyToken function by checking the JWT
    console.log('\n2. Testing JWT token...');
    const token = loginData.token;
    
    // Decode JWT (without verification for testing)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    console.log('   JWT Payload:', JSON.stringify(payload, null, 2));
    console.log('   User ID from JWT:', payload.id);
    
    // 3. Test database queries directly
    console.log('\n3. Testing database queries...');
    
    // Check if user exists
    const [users] = await connection.execute(
      'SELECT id, email, is_admin FROM users WHERE id = ?',
      [payload.id]
    );
    
    if (users.length === 0) {
      console.log('❌ User not found in database');
      return;
    }
    
    const user = users[0];
    console.log('✅ User found in database');
    console.log('   Database User ID:', user.id);
    console.log('   Database Is Admin:', user.is_admin);
    
    // Check admin sections
    const [sections] = await connection.execute('SELECT * FROM admin_sections WHERE is_active = TRUE');
    console.log('   Admin sections in DB:', sections.length);
    
    // Check user permissions
    const [permissions] = await connection.execute(`
      SELECT 
        s.section_key,
        s.section_name,
        p.can_access,
        p.can_edit,
        p.can_delete
      FROM admin_sections s
      LEFT JOIN admin_section_permissions p ON s.id = p.section_id AND p.user_id = ?
      WHERE s.is_active = TRUE
      ORDER BY s.sort_order ASC
    `, [user.id]);
    
    console.log('   User permissions:', permissions.length);
    permissions.forEach(perm => {
      console.log(`     - ${perm.section_key}: Access=${perm.can_access}, Edit=${perm.can_edit}, Delete=${perm.can_delete}`);
    });
    
    // 4. Test admin API with detailed error logging
    console.log('\n4. Testing admin API with detailed logging...');
    const adminResponse = await fetch('http://localhost:3001/api/admin/sections', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('   Response status:', adminResponse.status);
    console.log('   Response headers:', Object.fromEntries(adminResponse.headers.entries()));
    
    const responseText = await adminResponse.text();
    console.log('   Response body:', responseText);
    
    if (!adminResponse.ok) {
      console.log('❌ Admin API failed');
      return;
    }
    
    const adminData = JSON.parse(responseText);
    console.log('✅ Admin API successful');
    console.log('   Response:', JSON.stringify(adminData, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testBackendAdminAPI(); 