import { NextRequest, NextResponse } from 'next/server';
import { generateToken, verifyToken, extractToken } from '@/utils/auth';
import { UserService } from '@/services/userService';

// GET /api/auth/test-token - Test JWT token generation and verification
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing JWT token generation and verification...');
    
    // Test 1: Generate a token for the test user
    const testUser = {
      id: 'test-user-id',
      email: 'muneebarif11@gmail.com',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    console.log('📝 Generating token for user:', testUser);
    const token = generateToken(testUser);
    console.log('✅ Token generated:', token.substring(0, 50) + '...');
    
    // Test 2: Verify the token
    console.log('🔍 Verifying token...');
    const decoded = verifyToken(token);
    console.log('✅ Token verified:', decoded);
    
    // Test 3: Test token extraction from header
    const testHeader = `Bearer ${token}`;
    console.log('🔍 Testing token extraction from header...');
    const extractedToken = extractToken(testHeader);
    console.log('✅ Token extracted:', extractedToken ? 'Success' : 'Failed');
    
    // Test 4: Verify extracted token
    if (extractedToken) {
      const extractedDecoded = verifyToken(extractedToken);
      console.log('✅ Extracted token verified:', extractedDecoded);
    }
    
    // Test 5: Check environment variables
    console.log('🔍 Checking JWT environment variables...');
    console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
    console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);
    
    return NextResponse.json({
      success: true,
      message: 'JWT token test completed',
      details: {
        tokenGenerated: !!token,
        tokenVerified: !!decoded,
        tokenExtracted: !!extractedToken,
        decodedUser: decoded,
        jwtSecretLength: process.env.JWT_SECRET?.length || 0,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN
      }
    });
    
  } catch (error) {
    console.error('❌ JWT test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'JWT test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 