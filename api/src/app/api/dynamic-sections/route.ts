import { NextRequest, NextResponse } from 'next/server';
import { DynamicSectionService } from '@/services/dynamicSectionService';
import { verifyToken } from '@/utils/auth';
import { executeQuery } from '@/lib/database';

// Utility to get user id by domain (similar to gallery route)
async function getUserByDomain(domain: string) {
  const query = `
    SELECT u.id, d.status, d.name
    FROM users u
    INNER JOIN domains d ON u.id = d.user_id
    WHERE d.name LIKE ?
    AND d.status = 1
    LIMIT 1
  `;
  
  const pattern = `%${domain}%`;
  const result = await executeQuery(query, [pattern]);
  
  if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
    const domainData = result.data[0] as any;
    if (domainData.status === 1) {
      return domainData.id;
    }
  }
  
  return null;
}

// GET /api/dynamic-sections - Get all visible sections (public domain-based or dashboard auth)
export async function GET(request: NextRequest) {
  try {
    let userId = null;
    
    // Try to get user from auth header (dashboard mode)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = verifyToken(token);
        if (decoded && decoded.id) {
          userId = decoded.id;
        }
      } catch (e) {
        // Ignore, treat as public
      }
    }
    
    // If not authenticated, try to get user by domain
    if (!userId) {
      const origin = request.headers.get('origin') || request.headers.get('referer');
      if (origin) {
        const domain = origin.replace(/^https?:\/\//, '').split('/')[0];
        const domainVariants = [
          domain,
          `http://${domain}`,
          `https://${domain}`,
          domain.replace(':3000', ''),
          `http://${domain.replace(':3000', '')}`
        ];
        
        for (const domainVariant of domainVariants) {
          userId = await getUserByDomain(domainVariant);
          if (userId) break;
        }
      }
    }
    
    if (!userId) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Get all sections for user (only visible ones for public, all for dashboard)
    const result = await DynamicSectionService.getAllSections(userId);
    
    if (result.success && result.data) {
      // For public requests, filter to only visible sections
      const isPublic = !authHeader || !authHeader.startsWith('Bearer ');
      const sections = isPublic 
        ? result.data.filter(s => s.is_visible)
        : result.data;
      
      return NextResponse.json({
        success: true,
        data: sections
      });
    }
    
    return NextResponse.json({
      success: false,
      error: result.error || 'Failed to fetch sections'
    }, { status: 500 });
  } catch (error) {
    console.error('Get dynamic sections error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// POST /api/dynamic-sections - Create new section (authenticated only)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.id;
    const body = await request.json();

    const result = await DynamicSectionService.createSection(userId, body);

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Create dynamic section error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/dynamic-sections - Update section (authenticated only)
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.id;
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Section ID is required' },
        { status: 400 }
      );
    }

    const result = await DynamicSectionService.updateSection(id, userId, updates);

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Update dynamic section error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/dynamic-sections - Delete section (authenticated only)
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Section ID is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ DELETE: Attempting to delete section ${id} for user ${userId}`);
    
    const result = await DynamicSectionService.deleteSection(id, userId);

    if (result.success) {
      console.log(`✅ DELETE: Successfully deleted section ${id}`);
      return NextResponse.json({ success: true });
    } else {
      console.error(`❌ DELETE: Failed to delete section ${id}:`, result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to delete section' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Delete dynamic section error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


