import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

// GET /api/theme-updates - Get theme updates
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
    let query = 'SELECT * FROM theme_updates';
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

    console.log('🔍 Theme Updates Query:', { query, params, isActive, limit, order });
    
    let result = await executeQuery(query, params);

    if (!result.success) {
      console.error('❌ Theme Updates Query Failed:', { query, params, error: result.error });
      
      // Try a simpler query as fallback
      console.log('🔄 Trying fallback query...');
      const fallbackQuery = 'SELECT * FROM theme_updates ORDER BY created_at DESC LIMIT 10';
      result = await executeQuery(fallbackQuery, []);
      
      if (!result.success) {
        console.error('❌ Fallback query also failed:', result.error);
        return NextResponse.json(
          { error: 'Failed to fetch theme updates', details: result.error },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('❌ GET /api/theme-updates error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/theme-updates - Create new theme update
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { version, title, description, files, is_active = true, channel = 'stable' } = body;

    if (!version || !title) {
      return NextResponse.json(
        { error: 'Version and title are required' },
        { status: 400 }
      );
    }

    const insertQuery = `
      INSERT INTO theme_updates (version, title, description, files, is_active, channel)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const filesJson = files ? JSON.stringify(files) : null;
    const activeValue = is_active ? 1 : 0;

    const result = await executeQuery(insertQuery, [
      version,
      title,
      description || '',
      filesJson,
      activeValue,
      channel
    ]);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to create theme update', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: result.insertId, version, title, description, is_active, channel }
    });

  } catch (error) {
    console.error('❌ POST /api/theme-updates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/theme-updates - Update theme update
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Update ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates: string[] = [];
    const params: any[] = [];

    // Build update query dynamically
    if (body.version !== undefined) {
      updates.push('version = ?');
      params.push(body.version);
    }
    if (body.title !== undefined) {
      updates.push('title = ?');
      params.push(body.title);
    }
    if (body.description !== undefined) {
      updates.push('description = ?');
      params.push(body.description);
    }
    if (body.files !== undefined) {
      updates.push('files = ?');
      params.push(JSON.stringify(body.files));
    }
    if (body.is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(body.is_active ? 1 : 0);
    }
    if (body.channel !== undefined) {
      updates.push('channel = ?');
      params.push(body.channel);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    params.push(id);
    const updateQuery = `UPDATE theme_updates SET ${updates.join(', ')} WHERE id = ?`;

    const result = await executeQuery(updateQuery, params);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to update theme update', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id, updated: true }
    });

  } catch (error) {
    console.error('❌ PUT /api/theme-updates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/theme-updates - Delete theme update
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

    const result = await executeQuery('DELETE FROM theme_updates WHERE id = ?', [id]);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to delete theme update', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id, deleted: true }
    });

  } catch (error) {
    console.error('❌ DELETE /api/theme-updates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 