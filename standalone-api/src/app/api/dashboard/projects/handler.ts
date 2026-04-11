import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/services/projectService';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';

// Transform projects to include image field for dashboard
function transformProjectsForDashboard(projects: any[]) {
  return projects.map(project => ({
    ...project,
    image: project.project_images?.[0]?.url || '/images/hero-bg.png'
  }));
}

// GET /api/dashboard/projects - Get user's projects (protected)
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const result = await ProjectService.getUserProjects(request.user!.id);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Transform projects to include image field
    const transformedProjects = transformProjectsForDashboard(result.data || []);

    return NextResponse.json({
      success: true,
      data: transformedProjects
    });
  } catch (error) {
    console.error('Get user projects error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 