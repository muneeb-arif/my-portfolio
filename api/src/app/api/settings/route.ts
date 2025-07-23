import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';
import crypto from 'crypto';

// Utility to get user id by domain
async function getUserByDomain(domain: string) {
  console.log('🔍 Looking up domain for settings (LIKE):', domain);
  
  const query = `
    SELECT u.id, d.status, d.name
    FROM users u
    INNER JOIN domains d ON u.id = d.user_id
    WHERE d.name LIKE ?
    AND d.status = 1
    LIMIT 1
  `;

  console.log('🔍 query:', query);
  console.log('==============================================')
  
  const pattern = `%${domain}%`;
  const result = await executeQuery(query, [pattern]);
  console.log('🔍 Domain lookup result for settings:', result);
  
  if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
    const domainData = result.data[0] as any;
    console.log('🔍 Found domain data for settings:', domainData);
    
    // Check if domain is enabled (status = 1)
    if (domainData.status === 1) {
      console.log('✅ Domain is enabled for settings, returning user ID:', domainData.id);
      return domainData.id;
    } else {
      console.log('❌ Domain is disabled for settings (status =', domainData.status, ')');
      return null;
    }
  }
  
  console.log('❌ Domain not found in database for settings');
  return null;
}



// GET /api/settings - Public (domain-based) or dashboard (auth)
export async function GET(request: NextRequest) {
  try {
    let userId = null;
    
    // Try to get user from auth header (dashboard mode)
    const authHeader = request.headers.get('authorization');
    let isAuthenticated = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        // Try to decode JWT and extract user id
        const token = authHeader.replace('Bearer ', '');
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (payload && payload.id) {
          userId = payload.id;
          isAuthenticated = true;
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
        console.log('=====================')
        console.log('🔍 origin:', origin);
        console.log('=====================')

        userId = await getUserByDomain(origin);
      }
    }
    
    // Fallback to portfolio owner if domain not found - REMOVED
    // No longer using PORTFOLIO_OWNER_EMAIL fallback
    
    if (!userId) {
      // Return demo settings instead of error for development/production
      console.log('⚠️ No user/domain found, returning demo settings');
      const demoSettings = {
        banner_name: 'Muneeb Arif',
        banner_title: 'Full Stack Developer',
        banner_tagline: 'Building modern web applications with passion and precision',
        theme_name: 'sand',
        avatar_image: '/images/profile/avatar.jpeg',
        hero_image: '/images/hero-bg.png',
        section_hero_visible: true,
        section_portfolio_visible: true,
        section_technologies_visible: true,
        section_domains_visible: true,
        section_project_cycle_visible: true,
        section_prompts_visible: false,
        show_resume_download: true,
        logo_type: 'initials',
        site_url: 'https://my-portfolio-apis.vercel.app'
      };
      
      return NextResponse.json({
        success: true,
        data: demoSettings,
        demo: true
      });
    }
    
    const query = `
      SELECT * FROM settings 
      WHERE user_id = ?
    `;
    const result = await executeQuery(query, [userId]);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
    // Convert array to object for easier access
    const settingsObj: Record<string, any> = {};
    (result.data as any[] || []).forEach(setting => {
      try {
        settingsObj[setting.setting_key] = JSON.parse(setting.setting_value);
      } catch (error) {
        settingsObj[setting.setting_key] = setting.setting_value;
      }
    });
    return NextResponse.json({
      success: true,
      data: settingsObj
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