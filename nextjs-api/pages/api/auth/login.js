const { authenticateUser, generateToken } = require('../../../lib/auth');

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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Authenticate user
    const user = await authenticateUser(email, password);
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      fullName: user.full_name
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ 
      error: error.message || 'Authentication failed' 
    });
  }
} 