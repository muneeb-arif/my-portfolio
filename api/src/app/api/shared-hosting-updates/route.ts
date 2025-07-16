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

// GET /api/shared-hosting-updates - Get shared hosting updates (commented out for later use)
/*
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('is_active');
    const limit = searchParams.get('limit');
    const orderBy = searchParams.get('order') || 'created_at.desc';

    let query = 'SELECT * FROM shared_hosting_updates WHERE user_id = ?';
    const params = [userId];

    // Add filters
    if (isActive !== null) {
      query += ' AND is_active = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }

    // Add ordering
    if (orderBy === 'created_at.desc') {
      query += ' ORDER BY created_at DESC';
    } else if (orderBy === 'created_at.asc') {
      query += ' ORDER BY created_at ASC';
    }

    // Add limit
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const result = await executeQuery(query, params);
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
    console.error('Get shared hosting updates error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/shared-hosting-updates - Create new shared hosting update (protected)
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { 
      version, 
      title, 
      description, 
      release_notes, 
      package_url, 
      special_instructions, 
      channel, 
      is_critical 
    } = body;

    // Validate input
    if (!title || !version) {
      return NextResponse.json(
        { success: false, error: 'Title and version are required' },
        { status: 400 }
      );
    }

    const updateId = crypto.randomUUID();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      INSERT INTO shared_hosting_updates (
        id, user_id, version, title, description, release_notes, 
        package_url, special_instructions, channel, is_critical, 
        is_active, created_at, updated_at
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      updateId, 
      request.user!.id, 
      version, 
      title, 
      description || null, 
      release_notes || null, 
      package_url || null, 
      special_instructions || null, 
      channel || 'stable', 
      is_critical || false,
      true, // is_active defaults to true
      now,
      now
    ]);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Get the created update
    const getQuery = 'SELECT * FROM shared_hosting_updates WHERE id = ?';
    const getResult = await executeQuery(getQuery, [updateId]);

    return NextResponse.json({
      success: true,
      data: (getResult.data as any[])?.[0],
      message: 'Shared hosting update created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Create shared hosting update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
*/

// Placeholder response for now
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: [],
    message: 'Shared hosting updates API is commented out for later use'
  });
} 