import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/userService';
import { generateToken } from '@/utils/auth';
import { AuthRequest, AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: AuthRequest = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Create user
    const createResult = await UserService.createUser(email, password);
    if (!createResult.success) {
      return NextResponse.json(
        { success: false, error: createResult.error },
        { status: 400 }
      );
    }

    const user = createResult.data!;
    const token = generateToken(user);

    const response: AuthResponse = {
      success: true,
      user,
      token
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 