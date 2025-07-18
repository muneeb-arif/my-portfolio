import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting image order fix via API...\n');
    
    // Step 1: Show current state
    console.log('📊 Step 1: Current image order in database');
    console.log('=' .repeat(50));
    
    const currentResult = await executeQuery(`
      SELECT 
        project_id,
        name,
        order_index,
        created_at
      FROM project_images 
      ORDER BY project_id, created_at
    `);
    
    if (!currentResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch current images' },
        { status: 500 }
      );
    }
    
    const currentRows = currentResult.data as any[];
    
    if (currentRows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No project images found in database',
        data: { current: [], fixed: [] }
      });
    }
    
    console.log(`Found ${currentRows.length} images across ${new Set(currentRows.map((row: any) => row.project_id)).size} projects:\n`);
    
    // Group by project for better display
    const projects: { [key: string]: any[] } = {};
    currentRows.forEach((row: any) => {
      if (!projects[row.project_id]) {
        projects[row.project_id] = [];
      }
      projects[row.project_id].push(row);
    });
    
    Object.keys(projects).forEach(projectId => {
      console.log(`Project ID: ${projectId}`);
      projects[projectId].forEach((img, index) => {
        console.log(`  ${index + 1}. ${img.name} (order_index: ${img.order_index}, created: ${img.created_at})`);
      });
      console.log('');
    });
    
    // Step 2: Check if fix is needed
    console.log('🔍 Step 2: Checking if fix is needed');
    console.log('=' .repeat(50));
    
    const needsFix = currentRows.some((row: any) => row.order_index === 1 || row.order_index === null);
    
    if (!needsFix) {
      console.log('✅ All images already have proper order_index values');
      return NextResponse.json({
        success: true,
        message: 'All images already have proper order_index values',
        data: { current: currentRows, fixed: currentRows }
      });
    }
    
    console.log('❌ Found images with incorrect order_index values');
    console.log('🔄 Proceeding with fix...\n');
    
    // Step 3: Apply the fix
    console.log('🔧 Step 3: Applying order_index fix');
    console.log('=' .repeat(50));
    
    // Get all projects that need fixing
    const projectsToFix = new Set(currentRows.map((row: any) => row.project_id));
    
    let totalUpdated = 0;
    
    for (const projectId of projectsToFix) {
      // Get images for this project ordered by created_at
      const projectImagesResult = await executeQuery(`
        SELECT id, name, created_at
        FROM project_images 
        WHERE project_id = ?
        ORDER BY created_at
      `, [projectId]);
      
      if (!projectImagesResult.success) {
        console.log(`❌ Failed to get images for project ${projectId}`);
        continue;
      }
      
      const projectImages = projectImagesResult.data as any[];
      
      // Update each image with sequential order_index
      for (let i = 0; i < projectImages.length; i++) {
        const image = projectImages[i];
        const newOrderIndex = i + 1;
        
        const updateResult = await executeQuery(`
          UPDATE project_images 
          SET order_index = ?
          WHERE id = ?
        `, [newOrderIndex, image.id]);
        
        if (updateResult.success) {
          totalUpdated++;
          console.log(`  ✅ Updated ${image.name} to order_index ${newOrderIndex}`);
        } else {
          console.log(`  ❌ Failed to update ${image.name}`);
        }
      }
    }
    
    console.log(`\n✅ Updated ${totalUpdated} images total\n`);
    
    // Step 4: Show the fix results
    console.log('📊 Step 4: Results after fix');
    console.log('=' .repeat(50));
    
    const fixedResult = await executeQuery(`
      SELECT 
        project_id,
        name,
        order_index,
        created_at
      FROM project_images 
      ORDER BY project_id, order_index
    `);
    
    if (!fixedResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch fixed images' },
        { status: 500 }
      );
    }
    
    const fixedRows = fixedResult.data as any[];
    
    // Group by project for better display
    const fixedProjects: { [key: string]: any[] } = {};
    fixedRows.forEach((row: any) => {
      if (!fixedProjects[row.project_id]) {
        fixedProjects[row.project_id] = [];
      }
      fixedProjects[row.project_id].push(row);
    });
    
    Object.keys(fixedProjects).forEach(projectId => {
      console.log(`Project ID: ${projectId}`);
      fixedProjects[projectId].forEach((img, index) => {
        console.log(`  ${index + 1}. ${img.name} (order_index: ${img.order_index}, created: ${img.created_at})`);
      });
      console.log('');
    });
    
    // Step 5: Summary
    console.log('📋 Step 5: Summary');
    console.log('=' .repeat(50));
    console.log(`✅ Successfully fixed order_index for images`);
    console.log(`📁 Total projects with images: ${Object.keys(fixedProjects).length}`);
    console.log(`🖼️  Total images processed: ${fixedRows.length}`);
    console.log('\n🎉 Image order fix completed successfully!');
    console.log('💡 You can now test image reordering in the dashboard');
    
    return NextResponse.json({
      success: true,
      message: 'Image order fix completed successfully',
      data: {
        current: currentRows,
        fixed: fixedRows,
        summary: {
          totalImages: fixedRows.length,
          totalProjects: Object.keys(fixedProjects).length,
          needsFix: needsFix
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error during image order fix:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 