import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/services/projectService';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

// Utility to get user id by domain
async function getUserByDomain(domain: string) {
  const query = `
    SELECT u.id 
    FROM users u
    INNER JOIN domains d ON u.id = d.user_id
    WHERE d.name = ? AND d.status = 1
    LIMIT 1
  `;
  
  const result = await executeQuery(query, [domain]);
  if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
    return (result.data[0] as any).id;
  }
  return null;
}

// Utility to get portfolio owner user id (fallback)
async function getPortfolioOwnerUserId() {
  const ownerEmail = process.env.PORTFOLIO_OWNER_EMAIL;
  if (!ownerEmail) return null;
  const userResult = await executeQuery('SELECT id FROM users WHERE email = ?', [ownerEmail]);
  const userRows = userResult.success && Array.isArray(userResult.data) ? userResult.data as any[] : [];
  if (userRows.length > 0) {
    return userRows[0].id;
  }
  return null;
}

// GET /api/projects - Get published projects (public domain-based or dashboard auth)
export async function GET(request: NextRequest) {
  try {
    let userId = null;
    
    // Try to get user from auth header (dashboard mode)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        // Try to decode JWT and extract user id
        const token = authHeader.replace('Bearer ', '');
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (payload && payload.id) {
          userId = payload.id;
        }
      } catch (e) {
        // Ignore, treat as public
      }
    }
    
    // If not authenticated, try to get user by domain
    if (!userId) {
      const origin = request.headers.get('origin') || request.headers.get('referer');
      if (origin) {
        // Extract domain from origin/referer
        const domain = origin.replace(/^https?:\/\//, '').split('/')[0];
        userId = await getUserByDomain(domain);
      }
    }
    
    // Fallback to portfolio owner if domain not found
    if (!userId) {
      userId = await getPortfolioOwnerUserId();
    }
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Domain not found or portfolio owner not configured' },
        { status: 404 }
      );
    }

    // Get user's published projects
    const result = await ProjectService.getUserProjects(userId);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Filter to only published projects for public access
    const projects = result.data || [];
    const publishedProjects = projects.filter(project => project.status === 'published');

    return NextResponse.json({
      success: true,
      data: publishedProjects
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
    const body = await request.json();
    const { title, description, category, overview, technologies, features, live_url, github_url, status } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const projectData = {
      title,
      description,
      category,
      overview,
      technologies,
      features,
      live_url,
      github_url,
      status: status || 'draft'
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
    });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 