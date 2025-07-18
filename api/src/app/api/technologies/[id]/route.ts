import { NextRequest, NextResponse } from 'next/server';
import { withAuthAndParams, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

// PUT /api/technologies/[id] - Update technology/domain
export const PUT = withAuthAndParams(async (request: AuthenticatedRequest, params: { id: string }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { type, title, icon, sort_order } = body;

    // Validate input - only require title and type if they are being updated
    if (title !== undefined && !title) {
      return NextResponse.json(
        { success: false, error: 'Title cannot be empty' },
        { status: 400 }
      );
    }
    
    if (type !== undefined && !type) {
      return NextResponse.json(
        { success: false, error: 'Type cannot be empty' },
        { status: 400 }
      );
    }

    // Check if technology exists and belongs to user
    const checkQuery = 'SELECT * FROM domains_technologies WHERE id = ? AND user_id = ?';
    const checkResult = await executeQuery(checkQuery, [id, request.user!.id]);
    
    if (!checkResult.success || !checkResult.data || (checkResult.data as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Technology/domain not found' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Build dynamic query for partial updates
    const updateFields = [];
    const updateValues = [];
    
    if (type !== undefined) {
      updateFields.push('type = ?');
      updateValues.push(type);
    }
    
    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    
    if (icon !== undefined) {
      updateFields.push('icon = ?');
      updateValues.push(icon || null);
    }
    
    if (sort_order !== undefined) {
      updateFields.push('sort_order = ?');
      updateValues.push(sort_order || 1);
    }
    
    // Always update the updated_at timestamp
    updateFields.push('updated_at = ?');
    updateValues.push(now);
    
    // Add WHERE clause values
    updateValues.push(id, request.user!.id);
    
    const query = `
      UPDATE domains_technologies 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND user_id = ?
    `;
    
    const result = await executeQuery(query, updateValues);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Get the updated technology/domain
    const getQuery = 'SELECT * FROM domains_technologies WHERE id = ?';
    const getResult = await executeQuery(getQuery, [id]);

    return NextResponse.json({
      success: true,
      data: (getResult.data as any[])?.[0],
      message: 'Technology/domain updated successfully'
    });
  } catch (error) {
    console.error('Update technology error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/technologies/[id] - Delete technology/domain
export const DELETE = withAuthAndParams(async (request: AuthenticatedRequest, params: { id: string }) => {
  try {
    const { id } = params;

    // Check if technology exists and belongs to user
    const checkQuery = 'SELECT * FROM domains_technologies WHERE id = ? AND user_id = ?';
    const checkResult = await executeQuery(checkQuery, [id, request.user!.id]);
    
    if (!checkResult.success || !checkResult.data || (checkResult.data as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Technology/domain not found' },
        { status: 404 }
      );
    }

    // Delete associated skills first
    const deleteSkillsQuery = 'DELETE FROM tech_skills WHERE tech_id = ?';
    await executeQuery(deleteSkillsQuery, [id]);

    // Delete the technology/domain
    const query = 'DELETE FROM domains_technologies WHERE id = ? AND user_id = ?';
    const result = await executeQuery(query, [id, request.user!.id]);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Technology/domain deleted successfully'
    });
  } catch (error) {
    console.error('Delete technology error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 