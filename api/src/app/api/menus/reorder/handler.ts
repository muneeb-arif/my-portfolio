import { NextRequest, NextResponse } from 'next/server';
import { MenuService } from '@/services/menuService';
import { verifyToken } from '@/utils/auth';

// POST /api/menus/reorder - Reorder menus
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const menus = body.menus || body;

    if (!Array.isArray(menus) || menus.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Menus array is required' },
        { status: 400 }
      );
    }

    const result = await MenuService.reorderMenus(decoded.id, menus);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Menus reordered successfully'
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to reorder menus' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Reorder menus error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

