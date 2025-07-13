import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/services/projectService';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { getPortfolioOwnerEmail } from '@/utils/auth';
import { CreateProjectRequest } from '@/types';

// GET /api/projects - Get published projects (public)
export async function GET(request: NextRequest) {
  try {
    const ownerEmail = getPortfolioOwnerEmail();
    if (!ownerEmail) {
      return NextResponse.json(
        { success: false, error: 'Portfolio owner not configured' },
        { status: 500 }
      );
    }

    const result = await ProjectService.getPublishedProjects(ownerEmail);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project (protected)
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body: CreateProjectRequest = await request.json();
    const { title, description, category, overview, technologies, features, live_url, github_url, status } = body;

    // Validate input
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const projectData: CreateProjectRequest = {
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

    const result = await ProjectService.createProject(projectData, request.user!.id);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Project created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 