import { NextRequest, NextResponse } from 'next/server';
import { withAuthAndParams, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

// PUT /api/skills/[id] - Update skill
export const PUT = withAuthAndParams(async (request: AuthenticatedRequest, params: { id: string }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { tech_id, name, level } = body;

    // Validate input
    if (!tech_id || !name) {
      return NextResponse.json(
        { success: false, error: 'Tech ID and name are required' },
        { status: 400 }
      );
    }

    // Check if skill exists and belongs to user
    const checkSkillQuery = 'SELECT * FROM tech_skills WHERE id = ? AND user_id = ?';
    const checkSkillResult = await executeQuery(checkSkillQuery, [id, request.user!.id]);
    
    if (!checkSkillResult.success || !checkSkillResult.data || (checkSkillResult.data as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Check if technology exists and belongs to user
    const checkTechQuery = 'SELECT * FROM domains_technologies WHERE id = ? AND user_id = ?';
    const checkTechResult = await executeQuery(checkTechQuery, [tech_id, request.user!.id]);
    
    if (!checkTechResult.success || !checkTechResult.data || (checkTechResult.data as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Technology/domain not found' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      UPDATE tech_skills 
      SET tech_id = ?, name = ?, level = ?, updated_at = ? 
      WHERE id = ? AND user_id = ?
    `;
    
    const result = await executeQuery(query, [
      tech_id, 
      name, 
      level || 'intermediate',
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

    // Get the updated skill with technology info
    const getQuery = `
      SELECT ts.*, dt.title as tech_title, dt.type as tech_type
      FROM tech_skills ts
      LEFT JOIN domains_technologies dt ON ts.tech_id = dt.id
      WHERE ts.id = ?
    `;
    const getResult = await executeQuery(getQuery, [id]);

    return NextResponse.json({
      success: true,
      data: (getResult.data as any[])?.[0],
      message: 'Skill updated successfully'
    });
  } catch (error) {
    console.error('Update skill error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/skills/[id] - Delete skill
export const DELETE = withAuthAndParams(async (request: AuthenticatedRequest, params: { id: string }) => {
  try {
    const { id } = params;

    // Check if skill exists and belongs to user
    const checkQuery = 'SELECT * FROM tech_skills WHERE id = ? AND user_id = ?';
    const checkResult = await executeQuery(checkQuery, [id, request.user!.id]);
    
    if (!checkResult.success || !checkResult.data || (checkResult.data as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Skill not found' },
        { status: 404 }
      );
    }

    const query = 'DELETE FROM tech_skills WHERE id = ? AND user_id = ?';
    const result = await executeQuery(query, [id, request.user!.id]);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    console.error('Delete skill error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 