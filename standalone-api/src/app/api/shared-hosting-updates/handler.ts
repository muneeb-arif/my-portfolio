import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

// GET /api/shared-hosting-updates - Get shared hosting updates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('is_active');
    const limit = searchParams.get('limit');
    const id = searchParams.get('id');
    let order = searchParams.get('order') || 'created_at DESC';
    
    // Fix order parameter format (convert dot notation to space)
    if (order.includes('.')) {
      order = order.replace('.', ' ');
    }

    // Start with a simple query and build it up
    let query = 'SELECT * FROM shared_hosting_updates';
    const params: any[] = [];
    const conditions: string[] = [];

    if (id) {
      conditions.push('id = ?');
      params.push(id);
      conditions.push('is_active = TRUE');
    } else if (isActive !== null) {
      conditions.push('is_active = ?');
      params.push(isActive === 'true' || isActive === '1');
    } else {
      // Public list: active packages only (avoid exposing inactive rows)
      conditions.push('is_active = TRUE');
    }

    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
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
      const fallbackQuery =
        'SELECT * FROM shared_hosting_updates WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 10';
      result = await executeQuery(fallbackQuery, []);
      
      if (!result.success) {
        console.error('❌ Fallback query also failed:', result.error);
        return NextResponse.json(
          { error: 'Failed to fetch updates', details: result.error },
          { status: 500 }
        );
      }
    }

    // Transform the data to include package_url for automatic update service compatibility
    const data = result.data as any[];
    const transformedData = data.map((update: any) => {
      const fromFiles =
        update.files && Array.isArray(update.files) && update.files.length > 0 && update.files[0].url
          ? update.files[0].url
          : null;
      const packageUrl = update.package_url || fromFiles;

      return {
        ...update,
        package_url: packageUrl,
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedData
    });

  } catch (error) {
    console.error('❌ GET /api/shared-hosting-updates error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/shared-hosting-updates - Create (authenticated)
async function postSharedHostingUpdate(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const {
      version,
      title,
      description,
      files,
      release_notes,
      package_url,
      special_instructions,
      channel = 'stable',
      is_critical = false,
      is_active = true,
    } = body;

    const descText =
      description ||
      release_notes ||
      (package_url ? 'Update package' : '');

    if (!version || !title || !descText) {
      return NextResponse.json(
        { error: 'Missing required fields: version, title, and description or release_notes' },
        { status: 400 }
      );
    }

    let filesPayload = files;
    if (!filesPayload && package_url) {
      filesPayload = [{ url: package_url }];
    }

    const updateId = crypto.randomUUID();

    const insertQuery = `
      INSERT INTO shared_hosting_updates (
        id, version, title, description, files, release_notes, package_url,
        special_instructions, channel, is_critical, is_active
      )
      VALUES (?, ?, ?, ?, ?::jsonb, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(insertQuery, [
      updateId,
      version,
      title,
      descText,
      filesPayload ? JSON.stringify(filesPayload) : null,
      release_notes || null,
      package_url || null,
      special_instructions || null,
      channel,
      Boolean(is_critical),
      Boolean(is_active),
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

    // Transform the data to include package_url for automatic update service compatibility
    const updateData = getResult.data[0] as any;
    const fromFiles =
      updateData.files &&
      Array.isArray(updateData.files) &&
      updateData.files.length > 0 &&
      updateData.files[0].url
        ? updateData.files[0].url
        : null;
    const transformedData = {
      ...updateData,
      package_url: updateData.package_url || fromFiles,
    };

    return NextResponse.json({
      success: true,
      data: transformedData,
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

export const POST = withAuth(postSharedHostingUpdate);

// PUT /api/shared-hosting-updates - Update (authenticated)
async function putSharedHostingUpdate(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const {
      version,
      title,
      description,
      files,
      is_active,
      release_notes,
      package_url,
      special_instructions,
      channel,
      is_critical,
      pushed_at,
    } = body;

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
      updates.push('files = ?::jsonb');
      params.push(JSON.stringify(files));
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(Boolean(is_active));
    }
    if (release_notes !== undefined) {
      updates.push('release_notes = ?');
      params.push(release_notes);
    }
    if (package_url !== undefined) {
      updates.push('package_url = ?');
      params.push(package_url);
    }
    if (special_instructions !== undefined) {
      updates.push('special_instructions = ?');
      params.push(special_instructions);
    }
    if (channel !== undefined) {
      updates.push('channel = ?');
      params.push(channel);
    }
    if (is_critical !== undefined) {
      updates.push('is_critical = ?');
      params.push(Boolean(is_critical));
    }
    if (pushed_at !== undefined) {
      updates.push('pushed_at = ?');
      params.push(pushed_at);
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

export const PUT = withAuth(putSharedHostingUpdate);

// DELETE /api/shared-hosting-updates (authenticated)
async function deleteSharedHostingUpdate(request: AuthenticatedRequest) {
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

export const DELETE = withAuth(deleteSharedHostingUpdate);
