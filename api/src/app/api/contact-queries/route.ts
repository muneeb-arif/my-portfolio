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

// GET /api/contact-queries - Public (portfolio owner) or dashboard (auth)
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
      SELECT * FROM contact_queries 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    const result = await executeQuery(query, [userId]);
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
    console.error('Get contact queries error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/contact-queries - Create new contact query (protected)
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { 
      form_type, 
      name, 
      email, 
      phone, 
      company, 
      subject, 
      message, 
      budget, 
      timeline, 
      inquiry_type, 
      status, 
      priority 
    } = body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, subject, and message are required' },
        { status: 400 }
      );
    }

    const queryId = crypto.randomUUID();
    // Ensure queryId is a valid 36-character UUID string
    if (!queryId || typeof queryId !== 'string' || queryId.length !== 36) {
      throw new Error('Generated id is not a valid UUID');
    }
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      INSERT INTO contact_queries (
        id, user_id, form_type, name, email, phone, company, subject, message, 
        budget, timeline, inquiry_type, status, priority, created_at, updated_at
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      queryId, 
      request.user!.id, 
      form_type || 'contact', 
      name, 
      email, 
      phone || null, 
      company || null, 
      subject, 
      message, 
      budget || null, 
      timeline || null, 
      inquiry_type || 'General Inquiry', 
      // Ensure status and priority are valid ENUM values for MySQL
      ['new', 'in_progress', 'completed', 'cancelled'].includes(status) ? status : 'new',
      ['low', 'medium', 'high', 'urgent'].includes(priority) ? priority : 'medium',
      now,
      now
    ]);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Get the created query
    const getQuery = 'SELECT * FROM contact_queries WHERE id = ?';
    const getResult = await executeQuery(getQuery, [queryId]);

    return NextResponse.json({
      success: true,
      data: (getResult.data as any[])?.[0],
      message: 'Contact query created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Create contact query error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 