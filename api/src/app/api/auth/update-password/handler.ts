import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/userService';
import { hashPassword } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;

    // Validate input
    if (!email || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email and new password are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userResult = await UserService.getUserByEmail(email);
    if (!userResult.success) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the password in the database
    const updateResult = await UserService.updatePassword(email, hashedPassword);
    if (!updateResult.success) {
      return NextResponse.json(
        { success: false, error: updateResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 