import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/services/projectService';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';

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

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get user projects error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 