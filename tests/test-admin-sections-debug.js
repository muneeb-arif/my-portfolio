const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 8889, // MAMP MySQL port
  user: 'root',
  password: 'root',
  database: 'portfolio' // updated from 'portfolio_db'
};

async function testAdminSections() {
  let connection;
  
  try {
    console.log('🔍 Testing Admin Sections Setup...\n');
    
    // Test basic connection first
    console.log('0. Testing database connection...');
    try {
      connection = await mysql.createConnection(dbConfig);
      console.log('✅ Connected to database successfully');
    } catch (connError) {
      console.error('❌ Database connection failed:', connError.message);
      console.error('   Error code:', connError.code);
      console.error('   Error errno:', connError.errno);
      return;
    }
    
    // Test if database exists
    console.log('\n0.1. Testing if database exists...');
    try {
      const [databases] = await connection.execute('SHOW DATABASES');
      const dbExists = databases.some(db => db.Database === 'portfolio');
      console.log(`   Database 'portfolio' exists: ${dbExists}`);
      if (!dbExists) {
        console.log('   Available databases:', databases.map(db => db.Database).join(', '));
        return;
      }
    } catch (error) {
      console.error('❌ Error checking databases:', error.message);
      return;
    }
    
    // Test if tables exist
    console.log('\n0.2. Testing if admin tables exist...');
    try {
      const [tables] = await connection.execute('SHOW TABLES');
      const tableNames = tables.map(t => Object.values(t)[0]);
      console.log('   Available tables:', tableNames.join(', '));
      
      const hasAdminSections = tableNames.includes('admin_sections');
      const hasAdminPermissions = tableNames.includes('admin_section_permissions');
      const hasUsers = tableNames.includes('users');
      
      console.log(`   admin_sections table exists: ${hasAdminSections}`);
      console.log(`   admin_section_permissions table exists: ${hasAdminPermissions}`);
      console.log(`   users table exists: ${hasUsers}`);
      
      if (!hasAdminSections || !hasAdminPermissions || !hasUsers) {
        console.log('❌ Required tables are missing!');
        return;
      }
    } catch (error) {
      console.error('❌ Error checking tables:', error.message);
      return;
    }
    
    console.log('\n✅ All prerequisites met, proceeding with tests...\n');
    
    // 1. Check if admin_sections table exists and has data
    console.log('1. Checking admin_sections table...');
    const [sections] = await connection.execute('SELECT * FROM admin_sections ORDER BY sort_order');
    console.log(`   Found ${sections.length} admin sections:`);
    sections.forEach(section => {
      console.log(`   - ${section.section_key}: ${section.section_name} (active: ${section.is_active})`);
    });
    console.log('');
    
    // 2. Check if admin_section_permissions table exists and has data
    console.log('2. Checking admin_section_permissions table...');
    const [permissions] = await connection.execute('SELECT * FROM admin_section_permissions');
    console.log(`   Found ${permissions.length} permission records:`);
    permissions.forEach(perm => {
      console.log(`   - User: ${perm.user_id}, Section: ${perm.section_id}, Access: ${perm.can_access}`);
    });
    console.log('');
    
    // 3. Check if the user exists and is admin
    console.log('3. Checking user admin status...');
    const [users] = await connection.execute(
      'SELECT id, email, is_admin FROM users WHERE email = ?',
      ['muneebarif11@gmail.com']
    );
    
    if (users.length === 0) {
      console.log('   ❌ User muneebarif11@gmail.com not found!');
      return;
    }
    
    const user = users[0];
    console.log(`   ✅ User found: ${user.email}`);
    console.log(`   - User ID: ${user.id}`);
    console.log(`   - Is Admin: ${user.is_admin}`);
    console.log('');
    
    // 4. Check user's admin section permissions
    console.log('4. Checking user admin section permissions...');
    const [userPermissions] = await connection.execute(`
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
    
    console.log(`   Found ${userPermissions.length} section permissions for user:`);
    userPermissions.forEach(perm => {
      console.log(`   - ${perm.section_key}: Access=${perm.can_access}, Edit=${perm.can_edit}, Delete=${perm.can_delete}`);
    });
    console.log('');
    
    // 5. Test the API endpoint
    console.log('5. Testing API endpoint...');
    try {
      // First, get a valid token by logging in
      const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'muneebarif11@gmail.com',
          password: '11223344'
        })
      });
      
      if (!loginResponse.ok) {
        console.log('   ❌ Login failed:', loginResponse.status, loginResponse.statusText);
        return;
      }
      
      const loginData = await loginResponse.json();
      console.log('   ✅ Login successful');
      
      // Test admin sections API
      const adminResponse = await fetch('http://localhost:3001/api/admin/sections', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.data.access_token}`
        }
      });
      
      if (!adminResponse.ok) {
        console.log('   ❌ Admin sections API failed:', adminResponse.status, adminResponse.statusText);
        const errorText = await adminResponse.text();
        console.log('   Error details:', errorText);
        return;
      }
      
      const adminData = await adminResponse.json();
      console.log('   ✅ Admin sections API successful');
      console.log('   Response:', JSON.stringify(adminData, null, 2));
      
    } catch (error) {
      console.log('   ❌ API test failed:', error.message);
    }
    
    // 6. Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   - Admin sections in DB: ${sections.length}`);
    console.log(`   - User permissions: ${userPermissions.filter(p => p.can_access).length} accessible`);
    console.log(`   - User is_admin: ${user.is_admin}`);
    
    if (user.is_admin && userPermissions.filter(p => p.can_access).length > 0) {
      console.log('   ✅ User should see admin sections in dashboard');
    } else {
      console.log('   ❌ User should NOT see admin sections in dashboard');
    }
    
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
testAdminSections();