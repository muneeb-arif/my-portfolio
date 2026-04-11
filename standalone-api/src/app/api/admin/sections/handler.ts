import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/services/adminService';
import { verifyToken } from '@/utils/auth';

// GET /api/admin/sections - Get admin sections for the authenticated user
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

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.id;

    // Get admin sections for the user
    const result = await AdminService.getUserAdminPermissions(userId);

    if (!result) {
      return NextResponse.json({ success: false, error: 'Null result from AdminService' }, { status: 500 });
    }

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/sections - Create new admin section (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify the JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.id;

    // Check if user is admin
    const { UserService } = await import('@/services/userService');
    const userResult = await UserService.getUserById(userId);
    
    if (!userResult.success || !userResult.data?.is_admin) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { section_key, section_name, section_description, icon, route_path, is_active, sort_order } = body;

    // Validate required fields
    if (!section_key || !section_name) {
      return NextResponse.json(
        { success: false, error: 'section_key and section_name are required' },
        { status: 400 }
      );
    }

    // Create admin section
    const result = await AdminService.createAdminSection({
      section_key,
      section_name,
      section_description,
      icon,
      route_path,
      is_active: is_active ?? true,
      sort_order: sort_order ?? 1
    });

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 