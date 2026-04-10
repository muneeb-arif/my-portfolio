import { NextRequest, NextResponse } from 'next/server';
import { DynamicSectionService } from '@/services/dynamicSectionService';
import { verifyToken } from '@/utils/auth';

// POST /api/dynamic-sections/reorder - Reorder sections (authenticated only)
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
    const { sections } = body;

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { success: false, error: 'Sections array is required' },
        { status: 400 }
      );
    }

    const result = await DynamicSectionService.reorderSections(userId, sections);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Reorder dynamic sections error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


