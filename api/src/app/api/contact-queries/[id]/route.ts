import { NextRequest, NextResponse } from 'next/server';
import { withAuthAndParams, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

// PUT /api/contact-queries/[id] - Update contact query
export const PUT = withAuthAndParams(async (request: AuthenticatedRequest, params: { id: string }) => {
  try {
    const { id } = params;
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

    // Check if query exists and belongs to user
    const checkQuery = 'SELECT * FROM contact_queries WHERE id = ? AND user_id = ?';
    const checkResult = await executeQuery(checkQuery, [id, request.user!.id]);
    
    if (!checkResult.success || !checkResult.data || (checkResult.data as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contact query not found' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      UPDATE contact_queries 
      SET form_type = ?, name = ?, email = ?, phone = ?, company = ?, subject = ?, 
          message = ?, budget = ?, timeline = ?, inquiry_type = ?, status = ?, priority = ?, updated_at = ? 
      WHERE id = ? AND user_id = ?
    `;
    
    const result = await executeQuery(query, [
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
      status || 'new', 
      priority || 'medium',
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

    // Get the updated query
    const getQuery = 'SELECT * FROM contact_queries WHERE id = ?';
    const getResult = await executeQuery(getQuery, [id]);

    return NextResponse.json({
      success: true,
      data: (getResult.data as any[])?.[0],
      message: 'Contact query updated successfully'
    });
  } catch (error) {
    console.error('Update contact query error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/contact-queries/[id] - Delete contact query
export const DELETE = withAuthAndParams(async (request: AuthenticatedRequest, params: { id: string }) => {
  try {
    const { id } = params;

    // Check if query exists and belongs to user
    const checkQuery = 'SELECT * FROM contact_queries WHERE id = ? AND user_id = ?';
    const checkResult = await executeQuery(checkQuery, [id, request.user!.id]);
    
    if (!checkResult.success || !checkResult.data || (checkResult.data as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contact query not found' },
        { status: 404 }
      );
    }

    const query = 'DELETE FROM contact_queries WHERE id = ? AND user_id = ?';
    const result = await executeQuery(query, [id, request.user!.id]);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact query deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact query error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 