import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/services/adminService';
import { verifyToken } from '@/utils/auth';

// GET /api/admin/sections/[sectionKey]/access - Check if user has access to specific admin section
export async function GET(
  request: NextRequest,
  { params }: { params: { sectionKey: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const userId = authResult.userId;
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