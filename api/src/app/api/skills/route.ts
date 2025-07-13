import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

// GET /api/skills - Get all skills for authenticated user
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const query = `
      SELECT ts.*, dt.title as tech_title, dt.type as tech_type
      FROM tech_skills ts
      LEFT JOIN domains_technologies dt ON ts.tech_id = dt.id
      WHERE ts.user_id = ?
      ORDER BY dt.sort_order ASC, ts.level ASC
    `;
    
    const result = await executeQuery(query, [request.user!.id]);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get skills error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/skills - Create new skill
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { tech_id, name, level } = body;

    // Validate input
    if (!tech_id || !name) {
      return NextResponse.json(
        { success: false, error: 'Tech ID and name are required' },
        { status: 400 }
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

    const skillId = crypto.randomUUID();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      INSERT INTO tech_skills (id, user_id, tech_id, name, level, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      skillId, 
      request.user!.id, 
      tech_id, 
      name, 
      level || 'intermediate',
      now,
      now
    ]);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Get the created skill with technology info
    const getQuery = `
      SELECT ts.*, dt.title as tech_title, dt.type as tech_type
      FROM tech_skills ts
      LEFT JOIN domains_technologies dt ON ts.tech_id = dt.id
      WHERE ts.id = ?
    `;
    const getResult = await executeQuery(getQuery, [skillId]);

    return NextResponse.json({
      success: true,
      data: (getResult.data as any[])?.[0],
      message: 'Skill created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Create skill error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 