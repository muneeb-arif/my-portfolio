import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking project images in database...');
    
    // Check if table exists
    const tableCheck = await executeQuery(`
      SHOW TABLES LIKE 'project_images'
    `);
    
    if (!tableCheck.success || (tableCheck.data as any[]).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'project_images table does not exist'
      });
    }
    
    // Check table structure
    const structureCheck = await executeQuery(`
      DESCRIBE project_images
    `);
    
    // Get all images
    const imagesResult = await executeQuery(`
      SELECT 
        id,
        project_id,
        name,
        order_index,
        created_at
      FROM project_images 
      ORDER BY project_id, created_at
    `);
    
    if (!imagesResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch images'
      });
    }
    
    const images = imagesResult.data as any[];
    
    return NextResponse.json({
      success: true,
      data: {
        tableExists: true,
        structure: structureCheck.data,
        images: images,
        totalImages: images.length,
        projects: new Set(images.map(img => img.project_id)).size
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking images:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 