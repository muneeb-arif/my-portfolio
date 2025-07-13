import { createApiHandler, generateToken, comparePassword } from '../../../lib/auth.js';
import { findOne } from '../../../lib/database.js';

async function loginHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password are required',
      code: 'MISSING_CREDENTIALS'
    });
  }

  try {
    // Find user by email
    const user = await findOne(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if user account is active
    if (user.status && user.status !== 'active') {
      return res.status(401).json({ 
        error: 'Account is not active',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role || 'user'
    });

    // Update last login timestamp
    await executeQuery(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Return success response (exclude password)
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
}

export default createApiHandler(loginHandler); 