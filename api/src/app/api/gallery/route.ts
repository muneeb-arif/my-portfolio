import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { getSupabaseByDomain, extractDomainFromOrigin, BUCKETS } from '@/lib/supabaseByDomain';

// Utility to get user id by domain
async function getUserByDomain(domain: string) {
  console.log('🔍 Looking up domain for gallery (LIKE):', domain);
  
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
  console.log('🔍 Domain lookup result for gallery:', result);
  
  if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
    const domainData = result.data[0] as any;
    console.log('🔍 Found domain data for gallery:', domainData);
    
    // Check if domain is enabled (status = 1)
    if (domainData.status === 1) {
      console.log('✅ Domain is enabled for gallery, returning user ID:', domainData.id);
      return domainData.id;
    } else {
      console.log('❌ Domain is disabled for gallery (status =', domainData.status, ')');
      return null;
    }
  }
  
  console.log('❌ Domain not found in database for gallery');
  return null;
}

// GET /api/gallery - Get gallery images (public domain-based or dashboard auth)
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
      console.log('🔍 Request origin for gallery:', origin);
      
      if (origin) {
        // Extract domain from origin/referer
        const domain = origin.replace(/^https?:\/\//, '').split('/')[0];
        console.log('🔍 Extracted domain for gallery:', domain);
        
        // Try multiple domain formats for lookup
        const domainVariants = [
          domain, // localhost:3000
          `http://${domain}`, // http://localhost:3000
          `https://${domain}`, // https://localhost:3000
          domain.replace(':3000', ''), // localhost
          `http://${domain.replace(':3000', '')}` // http://localhost
        ];
        
        console.log('🔍 Trying domain variants for gallery:', domainVariants);
        
        for (const domainVariant of domainVariants) {
          userId = await getUserByDomain(domainVariant);
          if (userId) {
            console.log('✅ Found user with domain variant for gallery:', domainVariant);
            break;
          }
        }
        
        if (!userId) {
          console.log('❌ No user found with any domain variant for gallery');
        }
      } else {
        console.log('❌ No origin or referer found in request headers for gallery');
      }
    }
    
    if (!userId) {
      console.log('🎭 No domain found or disabled, returning empty gallery');
      return NextResponse.json({
        success: true,
        data: [],
        demo: false
      });
    }

    // Get domain-specific Supabase client
    const origin = request.headers.get('origin') || request.headers.get('referer');
    const domain = extractDomainFromOrigin(origin);
    const supabase = await getSupabaseByDomain(domain);

    // List images from Supabase storage for this user
    console.log('📥 Fetching gallery images for user:', userId, 'from domain:', domain);
    const { data, error } = await supabase.storage
      .from(BUCKETS.IMAGES)
      .list(userId, {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('❌ Error listing gallery images from Supabase:', error);
      return NextResponse.json({
        success: true,
        data: [],
        demo: false
      });
    }

    // Filter to only show images (not other file types) and build response
    const imageFiles = (data || [])
      .filter(file => 
        file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) && 
        !file.name.startsWith('.')
      )
      .map(file => {
        const fullPath = `${userId}/${file.name}`;
        const { data: urlData } = supabase.storage
          .from(BUCKETS.IMAGES)
          .getPublicUrl(fullPath);
        
        return {
          ...file,
          fullPath,
          url: urlData.publicUrl,
          id: file.id || fullPath
        };
      });

    console.log('✅ Retrieved gallery images:', imageFiles.length);
    return NextResponse.json({
      success: true,
      data: imageFiles,
      demo: false
    });
  } catch (error) {
    console.error('Get gallery images error:', error);
    return NextResponse.json({
      success: true,
      data: [],
      demo: false
    });
  }
}

