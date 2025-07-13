import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

// Utility to get portfolio owner user id
async function getPortfolioOwnerUserId() {
  const ownerEmail = process.env.PORTFOLIO_OWNER_EMAIL;
  if (!ownerEmail) return null;
  const userResult = await executeQuery('SELECT id FROM users WHERE email = ?', [ownerEmail]);
  const userRows = userResult.success && Array.isArray(userResult.data) ? userResult.data as any[] : [];
  if (userRows.length > 0) {
    return userRows[0].id;
  }
  return null;
}

// GET /api/technologies - Public (portfolio owner) or dashboard (auth)
export async function GET(request: NextRequest) {
  try {
    let userId = null;
    // Try to get user from auth header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (payload && payload.id) {
          userId = payload.id;
        }
      } catch (e) {}
    }
    if (!userId) {
      userId = await getPortfolioOwnerUserId();
    }
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Portfolio owner not configured or not found' },
        { status: 500 }
      );
    }
    const query = `
      SELECT dt.*, ts.id as skill_id, ts.name as skill_name, ts.level as skill_level
      FROM domains_technologies dt
      LEFT JOIN tech_skills ts ON dt.id = ts.tech_id
      WHERE dt.user_id = ?
      ORDER BY dt.sort_order ASC, ts.level ASC
    `;
    const result = await executeQuery(query, [userId]);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
    // Group skills by technology/domain
    const groupedData = (result.data as any[]).reduce((acc, row) => {
      const techId = row.id;
      if (!acc[techId]) {
        acc[techId] = {
          id: row.id,
          user_id: row.user_id,
          type: row.type,
          title: row.title,
          icon: row.icon,
          sort_order: row.sort_order,
          created_at: row.created_at,
          updated_at: row.updated_at,
          tech_skills: []
        };
      }
      if (row.skill_id) {
        acc[techId].tech_skills.push({
          id: row.skill_id,
          name: row.skill_name,
          level: row.skill_level
        });
      }
      return acc;
    }, {});
    return NextResponse.json({
      success: true,
      data: Object.values(groupedData)
    });
  } catch (error) {
    console.error('Get technologies error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/technologies - Create new technology/domain (protected)
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { type, title, icon, sort_order } = body;

    // Validate input
    if (!title || !type) {
      return NextResponse.json(
        { success: false, error: 'Title and type are required' },
        { status: 400 }
      );
    }

    const techId = crypto.randomUUID();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      INSERT INTO domains_technologies (id, user_id, type, title, icon, sort_order, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      techId, 
      request.user!.id, 
      type, 
      title, 
      icon || null, 
      sort_order || 1,
      now,
      now
    ]);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Get the created technology/domain
    const getQuery = 'SELECT * FROM domains_technologies WHERE id = ?';
    const getResult = await executeQuery(getQuery, [techId]);

    return NextResponse.json({
      success: true,
      data: (getResult.data as any[])?.[0],
      message: 'Technology/domain created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Create technology error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 