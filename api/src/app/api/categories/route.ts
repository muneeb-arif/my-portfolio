import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

// Demo categories data
const demoCategories = [
  { id: 1, name: "Web Development", description: "Full-stack web applications", color: "#8B4513" },
  { id: 2, name: "AI/ML", description: "Artificial Intelligence and Machine Learning", color: "#FF6B35" },
  { id: 3, name: "Mobile Development", description: "Mobile applications for iOS and Android", color: "#4ECDC4" },
  { id: 4, name: "Cloud Computing", description: "Cloud infrastructure and services", color: "#45B7D1" },
  { id: 5, name: "Blockchain", description: "Blockchain and cryptocurrency projects", color: "#96CEB4" },
  { id: 6, name: "Cybersecurity", description: "Security and privacy solutions", color: "#FFEAA7" }
];

// Utility to get user id by domain
async function getUserByDomain(domain: string) {
  console.log('🔍 Looking up domain for categories (LIKE):', domain);
  
  const query = `
    SELECT u.id, d.status, d.name
    FROM users u
    INNER JOIN domains d ON u.id = d.user_id
    WHERE d.name LIKE ?
    AND d.status = 1
    LIMIT 1
  `;
  
  const pattern = `%${domain}%`;
  const result = await executeQuery(query, [pattern]);
  console.log('🔍 Domain lookup result for categories:', result);
  
  if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
    const domainData = result.data[0] as any;
    console.log('🔍 Found domain data for categories:', domainData);
    
    // Check if domain is enabled (status = 1)
    if (domainData.status === 1) {
      console.log('✅ Domain is enabled for categories, returning user ID:', domainData.id);
      return domainData.id;
    } else {
      console.log('❌ Domain is disabled for categories (status =', domainData.status, ')');
      return null;
    }
  }
  
  console.log('❌ Domain not found in database for categories');
  return null;
}

// GET /api/categories - Get all categories for public (domain-based or demo)
export async function GET(request: NextRequest) {
  try {
    let userId = null;
    
    // Try to get user from auth header (dashboard mode)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        // Try to decode JWT and extract user id
        const token = authHeader.replace('Bearer ', '');
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (payload && payload.id) {
          userId = payload.id;
        }
      } catch (e) {
        // Ignore, treat as public
      }
    }
    
    // If not authenticated, try to get user by domain
    if (!userId) {
      const origin = request.headers.get('origin') || request.headers.get('referer');
      console.log('🔍 Request origin for categories:', origin);
      
      if (origin) {
        // Extract domain from origin/referer
        const domain = origin.replace(/^https?:\/\//, '').split('/')[0];
        console.log('🔍 Extracted domain for categories:', domain);
        userId = await getUserByDomain(domain);
      } else {
        console.log('❌ No origin or referer found in request headers for categories');
      }
    }
    
    if (!userId) {
      console.log('🎭 No domain found or disabled, returning demo categories');
      return NextResponse.json({
        success: true,
        data: demoCategories,
        demo: true
      });
    }

    const query = `
      SELECT * FROM categories 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    const result = await executeQuery(query, [userId]);
    if (!result.success) {
      console.log('❌ Failed to get user categories, falling back to demo data');
      return NextResponse.json({
        success: true,
        data: demoCategories,
        demo: true
      });
    }
    const dataRows = Array.isArray(result.data) ? result.data as any[] : [];
    console.log('Categories returned for user ID', userId, ':', dataRows.length);
    return NextResponse.json({
      success: true,
      data: dataRows,
      demo: false
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({
      success: true,
      data: demoCategories,
      demo: true
    });
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