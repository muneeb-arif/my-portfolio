import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

// GET /api/shared-hosting-updates - Get shared hosting updates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('is_active');
    const limit = searchParams.get('limit');
    let order = searchParams.get('order') || 'created_at DESC';
    
    // Fix order parameter format (convert dot notation to space)
    if (order.includes('.')) {
      order = order.replace('.', ' ');
    }

    // Start with a simple query and build it up
    let query = 'SELECT * FROM shared_hosting_updates';
    const params: any[] = [];

    // Add filters
    if (isActive !== null) {
      query += ' WHERE is_active = ?';
      // Ensure we're passing a proper integer
      const activeValue = isActive === 'true' ? 1 : 0;
      params.push(activeValue);
    }

    // Add ordering - use safe column names
    if (order.includes('created_at')) {
      query += ' ORDER BY created_at DESC';
    } else if (order.includes('updated_at')) {
      query += ' ORDER BY updated_at DESC';
    } else if (order.includes('version')) {
      query += ' ORDER BY version DESC';
    } else {
      query += ' ORDER BY created_at DESC'; // default
    }

    // Add limit - ensure it's a number
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        query += ' LIMIT ?';
        params.push(limitNum);
      }
    }

    console.log('🔍 Shared Hosting Updates Query:', { query, params, isActive, limit, order });
    
    let result = await executeQuery(query, params);

    if (!result.success) {
      console.error('❌ Shared Hosting Updates Query Failed:', { query, params, error: result.error });
      
      // Try a simpler query as fallback
      console.log('🔄 Trying fallback query...');
      const fallbackQuery = 'SELECT * FROM shared_hosting_updates ORDER BY created_at DESC LIMIT 10';
      result = await executeQuery(fallbackQuery, []);
      
      if (!result.success) {
        console.error('❌ Fallback query also failed:', result.error);
        return NextResponse.json(
          { error: 'Failed to fetch updates', details: result.error },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('❌ GET /api/shared-hosting-updates error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/shared-hosting-updates - Create new shared hosting update
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { version, title, description, files, is_active = true, created_by } = body;

    // Validate required fields
    if (!version || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: version, title, description' },
        { status: 400 }
      );
    }

    // Generate UUID for the update
    const updateId = crypto.randomUUID();

    // Insert the update
    const insertQuery = `
      INSERT INTO shared_hosting_updates (id, created_by, version, title, description, files, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(insertQuery, [
      updateId,
      created_by || 'system', // Use provided created_by or default to 'system'
      version,
      title,
      description,
      files ? JSON.stringify(files) : null,
      is_active ? 1 : 0
    ]);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to create update', details: result.error },
        { status: 500 }
      );
    }

    // Get the created update
    const getQuery = 'SELECT * FROM shared_hosting_updates WHERE id = ?';
    const getResult = await executeQuery(getQuery, [updateId]);

    if (!getResult.success || !getResult.data || !Array.isArray(getResult.data) || getResult.data.length === 0) {
      return NextResponse.json(
        { error: 'Failed to retrieve created update' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: getResult.data[0],
      message: 'Update created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ POST /api/shared-hosting-updates error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/shared-hosting-updates - Update existing shared hosting update
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { version, title, description, files, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Update ID is required' },
        { status: 400 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];

    if (version !== undefined) {
      updates.push('version = ?');
      params.push(version);
    }
    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (files !== undefined) {
      updates.push('files = ?');
      params.push(JSON.stringify(files));
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    params.push(id);
    const updateQuery = `UPDATE shared_hosting_updates SET ${updates.join(', ')} WHERE id = ?`;

    const result = await executeQuery(updateQuery, params);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to update', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Update modified successfully'
    });

  } catch (error) {
    console.error('❌ PUT /api/shared-hosting-updates error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/shared-hosting-updates - Delete shared hosting update
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Update ID is required' },
        { status: 400 }
      );
    }

    const result = await executeQuery('DELETE FROM shared_hosting_updates WHERE id = ?', [id]);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to delete update', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Update deleted successfully'
    });

  } catch (error) {
    console.error('❌ DELETE /api/shared-hosting-updates error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 