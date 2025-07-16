const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 8889,
  user: 'root',
  password: 'root',
  database: 'portfolio'
};

async function updateUserPasswords() {
  let connection;
  
  try {
    console.log('🔐 Starting password update process...');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Hash the new password
    const newPassword = '11223344';
    const saltRounds = 12; // Same as in your API configuration
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    console.log('🔒 Password hashed successfully');
    
    // Get all users first
    const [users] = await connection.execute('SELECT id, email FROM users');
    console.log(`📊 Found ${users.length} users in database`);
    
    if (users.length === 0) {
      console.log('⚠️ No users found in database');
      return;
    }
    
    // Update all users' passwords
    const updateQuery = 'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?';
    
    for (const user of users) {
      await connection.execute(updateQuery, [hashedPassword, user.id]);
      console.log(`✅ Updated password for user: ${user.email} (${user.id})`);
    }
    
    console.log('\n🎉 Password update completed successfully!');
    console.log(`📝 Updated ${users.length} users with password: ${newPassword}`);
    console.log('\n📋 Updated users:');
    users.forEach(user => {
      console.log(`   - ${user.email}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating passwords:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the script
if (require.main === module) {
  updateUserPasswords()
    .then(() => {
      console.log('\n✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { updateUserPasswords }; 