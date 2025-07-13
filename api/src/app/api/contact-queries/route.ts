import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

// GET /api/contact-queries - Get all contact queries for authenticated user
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const query = `
      SELECT * FROM contact_queries 
      WHERE user_id = ? 
      ORDER BY created_at DESC
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
    console.error('Get contact queries error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/contact-queries - Create new contact query
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