const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query, queryFirst } = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Hash password
async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Compare password
async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Authenticate user
async function authenticateUser(email, password) {
  try {
    const user = await queryFirst(
      'SELECT id, email, password_hash, full_name FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // Remove password from return data
    delete user.password_hash;
    
    return user;
  } catch (error) {
    throw new Error('Authentication failed: ' + error.message);
  }
}

// Middleware to verify JWT token in API routes
function requireAuth(handler) {
  return async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      // Add user info to request
      req.user = decoded;
      
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

// Get current user info
async function getCurrentUser(userId) {
  return await queryFirst(
    'SELECT id, email, full_name, created_at FROM users WHERE id = ?',
    [userId]
  );
}

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  authenticateUser,
  requireAuth,
  getCurrentUser
}; 