import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/services/projectService';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UpdateProjectRequest } from '@/types';

// GET /api/projects/[id] - Get project by ID (protected)
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const projectId = request.nextUrl.pathname.split('/').pop();
    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const result = await ProjectService.getProjectById(projectId, request.user!.id);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PUT /api/projects/[id] - Update project (protected)
export const PUT = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const projectId = request.nextUrl.pathname.split('/').pop();
    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const body: UpdateProjectRequest = await request.json();
    const { title, description, category, overview, technologies, features, live_url, github_url, status } = body;

    const projectData: UpdateProjectRequest = {
      id: projectId,
      title,
      description,
      category,
      overview,
      technologies,
      features,
      live_url,
      github_url,
      status
    };

    const result = await ProjectService.updateProject(projectData, request.user!.id);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/projects/[id] - Delete project (protected)
export const DELETE = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const projectId = request.nextUrl.pathname.split('/').pop();
    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const result = await ProjectService.deleteProject(projectId, request.user!.id);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete project' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 