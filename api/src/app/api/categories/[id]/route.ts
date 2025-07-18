import { NextRequest, NextResponse } from 'next/server';
import { withAuthAndParams, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

// PUT /api/categories/[id] - Update category
export const PUT = withAuthAndParams(async (request: AuthenticatedRequest, params: { id: string }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, color } = body;

    // Validate input
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category exists and belongs to user
    const checkQuery = 'SELECT * FROM categories WHERE id = ? AND user_id = ?';
    const checkResult = await executeQuery(checkQuery, [id, request.user!.id]);
    
    if (!checkResult.success || !checkResult.data || (checkResult.data as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      UPDATE categories 
      SET name = ?, description = ?, color = ?, updated_at = ? 
      WHERE id = ? AND user_id = ?
    `;
    
    const result = await executeQuery(query, [
      name, 
      description || null, 
      color || '#8B4513',
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

    // Get the updated category
    const getQuery = 'SELECT * FROM categories WHERE id = ?';
    const getResult = await executeQuery(getQuery, [id]);

    return NextResponse.json({
      success: true,
      data: (getResult.data as any[])?.[0],
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/categories/[id] - Delete category
export const DELETE = withAuthAndParams(async (request: AuthenticatedRequest, params: { id: string }) => {
  try {
    const { id } = params;

    // Check if category exists and belongs to user
    const checkQuery = 'SELECT * FROM categories WHERE id = ? AND user_id = ?';
    const checkResult = await executeQuery(checkQuery, [id, request.user!.id]);
    
    if (!checkResult.success || !checkResult.data || (checkResult.data as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    const query = 'DELETE FROM categories WHERE id = ? AND user_id = ?';
    const result = await executeQuery(query, [id, request.user!.id]);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 