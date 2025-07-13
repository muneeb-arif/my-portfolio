import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

// GET /api/niches - Get all niches for authenticated user
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const query = `
      SELECT * FROM niche 
      WHERE user_id = ? 
      ORDER BY sort_order ASC
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
    console.error('Get niches error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/niches - Create new niche
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { image, title, overview, tools, key_features, sort_order, ai_driven } = body;

    // Validate input
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const nicheId = crypto.randomUUID();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      INSERT INTO niche (id, user_id, image, title, overview, tools, key_features, sort_order, ai_driven, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      nicheId, 
      request.user!.id, 
      image || 'default.jpeg', 
      title, 
      overview || null, 
      tools || null, 
      key_features || null, 
      sort_order || 1, 
      ai_driven || false,
      now,
      now
    ]);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Get the created niche
    const getQuery = 'SELECT * FROM niche WHERE id = ?';
    const getResult = await executeQuery(getQuery, [nicheId]);

    return NextResponse.json({
      success: true,
      data: (getResult.data as any[])?.[0],
      message: 'Niche created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Create niche error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 