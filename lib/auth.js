import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'portfolio-api',
    audience: 'portfolio-client'
  });
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'portfolio-api',
      audience: 'portfolio-client'
    });
  } catch (error) {
    throw new Error(`Invalid token: ${error.message}`);
  }
}

// Hash password
export async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Compare password
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Extract token from request headers
export function extractTokenFromHeaders(headers) {
  const authHeader = headers.authorization || headers.Authorization;
  
  if (!authHeader) {
    return null;
  }
  
  // Handle "Bearer token" format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Handle direct token
  return authHeader;
}

// Middleware to verify authentication
export function requireAuth(handler) {
  return async (req, res) => {
    try {
      const token = extractTokenFromHeaders(req.headers);
      
      if (!token) {
        return res.status(401).json({ 
          error: 'No authentication token provided',
          code: 'NO_TOKEN'
        });
      }
      
      const decoded = verifyToken(token);
      req.user = decoded;
      
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ 
        error: 'Invalid authentication token',
        code: 'INVALID_TOKEN',
        details: error.message
      });
    }
  };
}

// Middleware for CORS handling
export function withCors(handler) {
  return async (req, res) => {
    // Set CORS headers
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    return handler(req, res);
  };
}

// Error handler middleware
export function withErrorHandler(handler) {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      
      // Handle specific error types
      if (error.message.includes('Database error')) {
        return res.status(500).json({
          error: 'Database connection failed',
          code: 'DATABASE_ERROR'
        });
      }
      
      if (error.message.includes('Invalid token')) {
        return res.status(401).json({
          error: 'Authentication failed',
          code: 'AUTH_ERROR'
        });
      }
      
      // Generic error response
      return res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      });
    }
  };
}

// Combine middlewares
export function createApiHandler(handler, options = {}) {
  let wrappedHandler = handler;
  
  // Apply error handling
  wrappedHandler = withErrorHandler(wrappedHandler);
  
  // Apply CORS
  wrappedHandler = withCors(wrappedHandler);
  
  // Apply authentication if required
  if (options.requireAuth) {
    wrappedHandler = requireAuth(wrappedHandler);
  }
  
  return wrappedHandler;
}

// Generate a new API key for clients
export function generateApiKey() {
  return jwt.sign(
    { 
      type: 'api_key',
      generated: Date.now()
    }, 
    JWT_SECRET,
    { expiresIn: '365d' }
  );
} 