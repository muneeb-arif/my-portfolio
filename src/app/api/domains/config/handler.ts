import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// GET /api/domains/config - Get Supabase configuration for a domain
export async function GET(request: NextRequest) {
  try {
    const domain = request.nextUrl.searchParams.get('domain');
    
    if (!domain) {
      return NextResponse.json({
        success: false,
        error: 'Domain parameter required'
      }, { status: 400 });
    }
    
    console.log('🔍 Getting Supabase config for domain:', domain);
    
    const query = `
      SELECT supabase_url, supabase_anon_key
      FROM domains
      WHERE name LIKE ?
      AND status = 1
      LIMIT 1
    `;
    
    const pattern = `%${domain}%`;
    const result = await executeQuery(query, [pattern]);
    
    if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
      const domainData = result.data[0] as any;
      
      // If domain has custom Supabase config (both URL and key are NOT NULL), return it
      if (domainData.supabase_url != null && 
          domainData.supabase_anon_key != null && 
          domainData.supabase_url.trim() !== '' && 
          domainData.supabase_anon_key.trim() !== '') {
        console.log('✅ Found custom Supabase config for domain:', domain);
        return NextResponse.json({
          success: true,
          supabase_url: domainData.supabase_url,
          supabase_anon_key: domainData.supabase_anon_key,
          is_custom: true
        });
      } else {
        console.log('📦 Domain found but has NULL Supabase config, returning default for:', domain);
      }
    }
    
    // Return default (null means use env vars on frontend)
    console.log('📦 Using default Supabase for domain:', domain);
    return NextResponse.json({
      success: true,
      supabase_url: null,
      supabase_anon_key: null,
      is_custom: false
    });
  } catch (error) {
    console.error('Error getting domain config:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

