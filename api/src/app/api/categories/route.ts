import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

// Utility to get portfolio owner user id
async function getPortfolioOwnerUserId() {
  const ownerEmail = process.env.REACT_APP_PORTFOLIO_OWNER_EMAIL;
  console.log('Portfolio owner email from env:', ownerEmail);
  if (!ownerEmail) return null;
  const userResult = await executeQuery('SELECT id FROM users WHERE email = ?', [ownerEmail]);
  const userRows = userResult.success && Array.isArray(userResult.data) ? userResult.data as any[] : [];
  if (userRows.length > 0) {
    console.log('Portfolio owner user ID found:', userRows[0].id);
    return userRows[0].id;
  }
  console.log('Portfolio owner user ID not found for email:', ownerEmail);
  return null;
}

// GET /api/categories - Get all categories for public (portfolio owner)
export async function GET(request: NextRequest) {
  try {
    const ownerUserId = await getPortfolioOwnerUserId();
    if (!ownerUserId) {
      return NextResponse.json(
        { success: false, error: 'Portfolio owner not configured or not found' },
        { status: 500 }
      );
    }
    const query = `
      SELECT * FROM categories 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    const result = await executeQuery(query, [ownerUserId]);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
    const dataRows = Array.isArray(result.data) ? result.data as any[] : [];
    console.log('a returned for user ID', ownerUserId, ':', dataRows.length);
    return NextResponse.json({
      success: true,
      data: dataRows
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create new category (protected)
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { name, description, color } = body;

    // Validate input
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    const categoryId = crypto.randomUUID();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      INSERT INTO categories (id, user_id, name, description, color, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      categoryId, 
      request.user!.id, 
      name, 
      description || null, 
      color || '#8B4513',
      now,
      now
    ]);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Get the created category
    const getQuery = 'SELECT * FROM categories WHERE id = ?';
    const getResult = await executeQuery(getQuery, [categoryId]);
    const getRows = Array.isArray(getResult.data) ? getResult.data as any[] : [];
    return NextResponse.json({
      success: true,
      data: getRows[0],
      message: 'Category created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 