import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// GET /api/domains/user - Get user by domain
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    
    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Domain parameter is required' },
        { status: 400 }
      );
    }

    // Query to get user by domain
    const query = `
      SELECT u.id, u.email, u.name, u.full_name, u.avatar_url, u.email_verified
      FROM users u
      INNER JOIN domains d ON u.id = d.user_id
      WHERE d.name = ? AND d.status = 1
      LIMIT 1
    `;
    
    const result = await executeQuery(query, [domain]);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    const users = result.data as any[];
    
    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Domain not found or inactive' },
        { status: 404 }
      );
    }

    const user = users[0];
    
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        email_verified: user.email_verified
      }
    });
  } catch (error) {
    console.error('Get user by domain error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 