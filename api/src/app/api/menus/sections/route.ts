import { NextRequest, NextResponse } from 'next/server';
import { MenuService } from '@/services/menuService';
import { verifyToken } from '@/utils/auth';
import { executeQuery } from '@/lib/database';

// Utility to get user id by domain
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

// GET /api/menus/sections - Get sections for menu dropdown
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

    const result = await MenuService.getSectionsForMenu(userId);
    
    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        data: result.data
      });
    }
    
    return NextResponse.json(
      { success: false, error: result.error || 'Failed to fetch sections' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Get sections for menu error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

