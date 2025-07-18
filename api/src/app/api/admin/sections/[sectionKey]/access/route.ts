import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/services/adminService';
import { verifyToken, extractToken } from '@/utils/auth';

// GET /api/admin/sections/[sectionKey]/access - Check if user has access to specific admin section
export async function GET(
  request: NextRequest,
  { params }: { params: { sectionKey: string } }
) {
  try {
    // Verify authentication
    const token = extractToken(request.headers.get('authorization') || undefined);
    if (!token) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;
    const { sectionKey } = params;

    // Check if user has access to the section
    const result = await AdminService.hasSectionAccess(userId, sectionKey);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        data: { 
          hasAccess: result.data,
          sectionKey 
        } 
      });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Error checking section access:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 