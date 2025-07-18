import { NextRequest, NextResponse } from 'next/server';
import { withAuthAndParams, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

// PUT /api/niches/[id] - Update niche
export const PUT = withAuthAndParams(async (request: AuthenticatedRequest, params: { id: string }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { image, title, overview, tools, key_features, sort_order, ai_driven } = body;

    // Validate input
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    // Check if niche exists and belongs to user
    const checkQuery = 'SELECT * FROM niche WHERE id = ? AND user_id = ?';
    const checkResult = await executeQuery(checkQuery, [id, request.user!.id]);
    
    if (!checkResult.success || !checkResult.data || (checkResult.data as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Niche not found' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      UPDATE niche 
      SET image = ?, title = ?, overview = ?, tools = ?, key_features = ?, sort_order = ?, ai_driven = ?, updated_at = ? 
      WHERE id = ? AND user_id = ?
    `;
    
    const result = await executeQuery(query, [
      image || 'default.jpeg', 
      title, 
      overview || null, 
      tools || null, 
      key_features || null, 
      sort_order || 1, 
      ai_driven || false,
      now,
      id,
      request.user!.id
    ]);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Get the updated niche
    const getQuery = 'SELECT * FROM niche WHERE id = ?';
    const getResult = await executeQuery(getQuery, [id]);

    return NextResponse.json({
      success: true,
      data: (getResult.data as any[])?.[0],
      message: 'Niche updated successfully'
    });
  } catch (error) {
    console.error('Update niche error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/niches/[id] - Delete niche
export const DELETE = withAuthAndParams(async (request: AuthenticatedRequest, params: { id: string }) => {
  try {
    const { id } = params;

    // Check if niche exists and belongs to user
    const checkQuery = 'SELECT * FROM niche WHERE id = ? AND user_id = ?';
    const checkResult = await executeQuery(checkQuery, [id, request.user!.id]);
    
    if (!checkResult.success || !checkResult.data || (checkResult.data as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Niche not found' },
        { status: 404 }
      );
    }

    const query = 'DELETE FROM niche WHERE id = ? AND user_id = ?';
    const result = await executeQuery(query, [id, request.user!.id]);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Niche deleted successfully'
    });
  } catch (error) {
    console.error('Delete niche error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 