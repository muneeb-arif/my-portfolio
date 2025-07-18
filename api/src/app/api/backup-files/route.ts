import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/backup-files - Get all backup files for the current user
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const user = request.user!;

    const query = `
      SELECT 
        id,
        file_name,
        file_size,
        file_type,
        storage_path,
        public_url,
        upload_date,
        description,
        is_active,
        created_at,
        updated_at
      FROM backup_files 
      WHERE user_id = ? AND is_active = 1
      ORDER BY upload_date DESC
    `;

    const result = await executeQuery(query, [user.id]);

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch backup files' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error fetching backup files:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
});

// POST /api/backup-files - Create a new backup file entry
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const user = request.user!;
    const body = await request.json();
    const { 
      file_name, 
      file_size, 
      file_type, 
      storage_path, 
      public_url, 
      description 
    } = body;

    // Validate required fields
    if (!file_name || !file_size || !storage_path || !public_url) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const backupId = uuidv4();
    const query = `
      INSERT INTO backup_files (
        id,
        user_id, 
        file_name, 
        file_size, 
        file_type, 
        storage_path, 
        public_url, 
        description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(query, [
      backupId,
      user.id,
      file_name,
      file_size,
      file_type || null,
      storage_path,
      public_url,
      description || null
    ]);

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create backup file entry' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Backup file entry created successfully',
      data: { id: backupId }
    });

  } catch (error) {
    console.error('Error creating backup file entry:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
});

// DELETE /api/backup-files - Soft delete a backup file entry
export const DELETE = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const user = request.user!;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Backup file ID is required' 
      }, { status: 400 });
    }

    const query = `
      UPDATE backup_files 
      SET is_active = 0, updated_at = NOW()
      WHERE id = ? AND user_id = ?
    `;

    const result = await executeQuery(query, [id, user.id]);

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete backup file entry' 
      }, { status: 500 });
    }

    // Check if any rows were affected
    const affectedRows = Array.isArray(result.data) ? result.data.length : 0;
    if (affectedRows === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Backup file not found or access denied' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Backup file entry deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting backup file entry:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}); 