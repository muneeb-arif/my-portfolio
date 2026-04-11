import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/server/middleware/auth';
import { executeQuery } from '@/lib/database';
import {
  getPublicSettingsForHeaders,
  getUserIdByDomainLookup,
  loadSettingsObjectForUserId,
} from '@/lib/publicSiteSettings';
import crypto from 'crypto';

// GET /api/settings - Public (domain-based) or dashboard (auth)
export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;

    // Try to get user from auth header (dashboard mode)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (payload && payload.id) {
          userId = payload.id;
        }
      } catch {
        // Ignore, treat as public
      }
    }

    // If not authenticated, resolve tenant from Origin/Referer (browser) then Host (SSR/curl)
    if (!userId) {
      const origin = request.headers.get('origin') || request.headers.get('referer');
      if (origin) {
        userId = await getUserIdByDomainLookup(origin);
      }
      if (!userId) {
        const { data, demo } = await getPublicSettingsForHeaders(request.headers);
        return NextResponse.json({
          success: true,
          data,
          ...(demo ? { demo: true } : {}),
        });
      }
    }

    const settingsObj = await loadSettingsObjectForUserId(userId);
    return NextResponse.json({
      success: true,
      data: settingsObj,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update settings for authenticated user
export const PUT = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const settings = body.settings || body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Settings object is required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const userId = request.user!.id;

    // Process each setting
    for (const [key, value] of Object.entries(settings)) {
      // Convert value to JSON string
      const jsonValue = JSON.stringify(value);
      
      // Check if setting exists
      const checkQuery = 'SELECT * FROM settings WHERE user_id = ? AND setting_key = ?';
      const checkResult = await executeQuery(checkQuery, [userId, key]);
      
      if (checkResult.success && checkResult.data && (checkResult.data as any[]).length > 0) {
        // Update existing setting
        const updateQuery = 'UPDATE settings SET setting_value = ?, updated_at = ? WHERE user_id = ? AND setting_key = ?';
        await executeQuery(updateQuery, [jsonValue, now, userId, key]);
      } else {
        // Insert new setting with UUID
        const id = crypto.randomUUID();
        const insertQuery = 'INSERT INTO settings (id, user_id, setting_key, setting_value, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)';
        await executeQuery(insertQuery, [id, userId, key, jsonValue, now, now]);
      }
    }

    // Get updated settings
    const getQuery = 'SELECT * FROM settings WHERE user_id = ?';
    const getResult = await executeQuery(getQuery, [userId]);

    // Convert back to object
    const updatedSettings: Record<string, any> = {};
    (getResult.data as any[] || []).forEach(setting => {
      try {
        updatedSettings[setting.setting_key] = JSON.parse(setting.setting_value);
      } catch (error) {
        updatedSettings[setting.setting_key] = setting.setting_value;
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 