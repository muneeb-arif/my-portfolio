const bcrypt = require('bcryptjs');
const { query } = require('../../../lib/database');
const { generateToken } = require('../../../lib/auth');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, userData = {} } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUsers = await query(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate UUID for new user
    const userId = require('crypto').randomUUID();

    // Insert new user with explicit UUID
    await query(
      'INSERT INTO users (id, email, password_hash, name, full_name, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [userId, email, hashedPassword, userData.full_name || email.split('@')[0], userData.full_name || '', true]
    );

    // Auto-configure portfolio for new user
    try {
      await query(
        'INSERT INTO portfolio_config (owner_email, owner_user_id, is_active, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        [email, userId, true]
      );
      console.log('✅ Portfolio automatically configured for new user:', email);
    } catch (configError) {
      console.warn('⚠️ Failed to auto-configure portfolio:', configError.message);
      // Continue with successful signup even if portfolio config fails
    }

    // Generate token for immediate sign-in
    const token = generateToken({
      userId: userId,
      email: email,
      fullName: userData.full_name || ''
    });

    const newUser = {
      id: userId,
      email: email,
      fullName: userData.full_name || ''
    };

    console.log('✅ User registered successfully:', email);

    res.status(201).json({
      success: true,
      token,
      user: newUser,
      message: 'Account created successfully!'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Failed to create account: ' + error.message
    });
  }
} 