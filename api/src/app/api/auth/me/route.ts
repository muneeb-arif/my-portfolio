import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../utils/auth';
import { UserService } from '../../../../services/userService';

export async function GET(request: NextRequest) {
  try {
    // Verify the JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user information
    const userResult = await UserService.getUserById(decoded.id);
    
    if (!userResult.success || !userResult.data) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.data;
    
    // Return user data without sensitive information
    const userData = {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Error in /auth/me:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 