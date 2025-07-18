import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

// GET /api/projects/[id]/images - Get project images
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    
    console.log('📥 GET /api/projects/[id]/images - Fetching images for project:', projectId);
    
    const query = `
      SELECT * FROM project_images 
      WHERE project_id = ? 
      ORDER BY order_index ASC, created_at ASC
    `;
    
    const result = await executeQuery(query, [projectId]);
    
    if (!result.success) {
      console.error('❌ Failed to fetch project images:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    const images = result.data || [];
    console.log('📊 Retrieved project images:', (images as any[]).map((img: any) => ({
      name: img.name,
      order_index: img.order_index
    })));

    return NextResponse.json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('Get project images error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/images - Add image to project
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const pathSegments = request.nextUrl.pathname.split('/');
    const projectId = pathSegments[pathSegments.length - 2]; // /api/projects/[id]/images -> [id] is second to last
    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { url, path, name, original_name, size, type, bucket, order_index } = body;

    console.log('📥 POST /api/projects/[id]/images - Received request:', {
      projectId,
      imageName: name,
      order_index,
      url: url?.substring(0, 50) + '...'
    });

    // Validate input
    if (!url || !path || !name) {
      return NextResponse.json(
        { success: false, error: 'URL, path, and name are required' },
        { status: 400 }
      );
    }

    // Verify project belongs to user
    const projectQuery = 'SELECT id FROM projects WHERE id = ? AND user_id = ?';
    const projectResult = await executeQuery(projectQuery, [projectId, request.user!.id]);
    
    if (!projectResult.success || !projectResult.data || (projectResult.data as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    const imageId = crypto.randomUUID();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      INSERT INTO project_images (
        id, project_id, user_id, url, path, name, original_name, 
        size, type, bucket, order_index, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    console.log('💾 Inserting image with order_index:', order_index);
    
    const result = await executeQuery(query, [
      imageId,
      projectId,
      request.user!.id,
      url,
      path,
      name,
      original_name || name,
      size || null,
      type || null,
      bucket || 'images',
      order_index || 1,
      now,
      now
    ]);

    if (!result.success) {
      console.error('❌ Failed to insert image:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Get the created image
    const getQuery = 'SELECT * FROM project_images WHERE id = ?';
    const getResult = await executeQuery(getQuery, [imageId]);

    const createdImage = (getResult.data as any[])?.[0];
    console.log('✅ Image created successfully:', {
      id: createdImage?.id,
      name: createdImage?.name,
      order_index: createdImage?.order_index
    });

    return NextResponse.json({
      success: true,
      data: createdImage,
      message: 'Project image added successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Add project image error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/projects/[id]/images - Delete all project images
export const DELETE = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const pathSegments = request.nextUrl.pathname.split('/');
    const projectId = pathSegments[pathSegments.length - 2]; // /api/projects/[id]/images -> [id] is second to last
    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ DELETE /api/projects/[id]/images - Deleting all images for project:', projectId);

    // Verify project belongs to user
    const projectQuery = 'SELECT id FROM projects WHERE id = ? AND user_id = ?';
    const projectResult = await executeQuery(projectQuery, [projectId, request.user!.id]);
    
    if (!projectResult.success || !projectResult.data || (projectResult.data as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    const query = 'DELETE FROM project_images WHERE project_id = ?';
    const result = await executeQuery(query, [projectId]);

    if (!result.success) {
      console.error('❌ Failed to delete project images:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log('✅ Successfully deleted all images for project:', projectId);

    return NextResponse.json({
      success: true,
      message: 'Project images deleted successfully'
    });
  } catch (error) {
    console.error('Delete project images error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 