import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

// Demo niches data
const demoNiches = [
  {
    id: 1,
    title: "E-Commerce Solutions",
    overview: "Comprehensive e-commerce platforms with modern UI/UX and secure payment processing",
    tools: "React, Node.js, Stripe, MongoDB",
    key_features: "User authentication\nShopping cart\nPayment processing\nAdmin dashboard\nInventory management",
    image: "e-commerce.jpeg",
    sort_order: 1,
    ai_driven: false
  },
  {
    id: 2,
    title: "AI-Powered Analytics",
    overview: "Intelligent analytics platforms using machine learning for business insights",
    tools: "Python, TensorFlow, FastAPI, PostgreSQL",
    key_features: "Data visualization\nPredictive analytics\nReal-time monitoring\nCustom dashboards\nAutomated reporting",
    image: "ai-analytics.jpeg",
    sort_order: 2,
    ai_driven: true
  },
  {
    id: 3,
    title: "Mobile Banking Apps",
    overview: "Secure mobile banking applications with biometric authentication",
    tools: "React Native, Firebase, Biometrics, Redux",
    key_features: "Biometric authentication\nReal-time transactions\nBill payments\nInvestment tracking\nPush notifications",
    image: "mobile-banking.jpeg",
    sort_order: 3,
    ai_driven: false
  },
  {
    id: 4,
    title: "Cloud Infrastructure",
    overview: "Scalable cloud infrastructure solutions for modern applications",
    tools: "AWS, Docker, Kubernetes, Terraform",
    key_features: "Auto-scaling\nLoad balancing\nMonitoring\nSecurity compliance\nCost optimization",
    image: "cloud-infrastructure.jpeg",
    sort_order: 4,
    ai_driven: false
  }
];

// Utility to get user id by domain
async function getUserByDomain(domain: string) {
  console.log('🔍 Looking up domain for niches (LIKE):', domain);
  
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
  console.log('🔍 Domain lookup result for niches:', result);
  
  if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
    const domainData = result.data[0] as any;
    console.log('🔍 Found domain data for niches:', domainData);
    
    // Check if domain is enabled (status = 1)
    if (domainData.status === 1) {
      console.log('✅ Domain is enabled for niches, returning user ID:', domainData.id);
      return domainData.id;
    } else {
      console.log('❌ Domain is disabled for niches (status =', domainData.status, ')');
      return null;
    }
  }
  
  console.log('❌ Domain not found in database for niches');
  return null;
}

// GET /api/niches - Public (domain-based or demo) or dashboard (auth)
export async function GET(request: NextRequest) {
  try {
    let userId = null;
    // Try to get user from auth header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (payload && payload.id) {
          userId = payload.id;
        }
      } catch (e) {}
    }
    
    // If not authenticated, try to get user by domain
    if (!userId) {
      const origin = request.headers.get('origin') || request.headers.get('referer');
      console.log('🔍 Request origin for niches:', origin);
      
      if (origin) {
        // Extract domain from origin/referer
        const domain = origin.replace(/^https?:\/\//, '').split('/')[0];
        console.log('🔍 Extracted domain for niches:', domain);
        userId = await getUserByDomain(domain);
      } else {
        console.log('❌ No origin or referer found in request headers for niches');
      }
    }
    
    if (!userId) {
      console.log('🎭 No domain found or disabled, returning demo niches');
      return NextResponse.json({
        success: true,
        data: demoNiches,
        demo: true
      });
    }
    const query = `
      SELECT * FROM niche 
      WHERE user_id = ? 
      ORDER BY sort_order ASC
    `;
    const result = await executeQuery(query, [userId]);
    if (!result.success) {
      console.log('❌ Failed to get user niches, falling back to demo data');
      return NextResponse.json({
        success: true,
        data: demoNiches,
        demo: true
      });
    }
    return NextResponse.json({
      success: true,
      data: result.data,
      demo: false
    });
  } catch (error) {
    console.error('Get niches error:', error);
    return NextResponse.json({
      success: true,
      data: demoNiches,
      demo: true
    });
  }
}

// POST /api/niches - Create new niche (protected)
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { image, title, overview, tools, key_features, sort_order, ai_driven } = body;

    // Validate input
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const nicheId = crypto.randomUUID();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      INSERT INTO niche (id, user_id, image, title, overview, tools, key_features, sort_order, ai_driven, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      nicheId, 
      request.user!.id, 
      image || 'default.jpeg', 
      title, 
      overview || null, 
      tools || null, 
      key_features || null, 
      sort_order || 1, 
      ai_driven || false,
      now,
      now
    ]);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Get the created niche
    const getQuery = 'SELECT * FROM niche WHERE id = ?';
    const getResult = await executeQuery(getQuery, [nicheId]);

    return NextResponse.json({
      success: true,
      data: (getResult.data as any[])?.[0],
      message: 'Niche created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Create niche error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 