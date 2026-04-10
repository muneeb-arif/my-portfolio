import { NextRequest, NextResponse } from 'next/server';
import { MenuService } from '@/services/menuService';
import { verifyToken } from '@/utils/auth';

// PUT /api/menus/[id] - Update menu
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const menuId = params.id;
    const body = await request.json();
    const menuData = { ...body.menu || body, id: menuId };

    const result = await MenuService.updateMenu(decoded.id, menuId, menuData);
    
    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Menu updated successfully'
      });
    }
    
    return NextResponse.json(
      { success: false, error: result.error || 'Failed to update menu' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Update menu error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/menus/[id] - Delete menu
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const menuId = params.id;
    const result = await MenuService.deleteMenu(decoded.id, menuId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Menu deleted successfully'
      });
    }
    
    return NextResponse.json(
      { success: false, error: result.error || 'Failed to delete menu' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Delete menu error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

