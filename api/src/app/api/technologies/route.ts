import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

// Demo technologies data
const demoTechnologies = [
  {
    id: 1,
    title: "Web Development",
    type: "domain",
    icon: "Code",
    sort_order: 1,
    tech_skills: [
      { id: 1, name: "React", level: 90 },
      { id: 2, name: "Node.js", level: 85 },
      { id: 3, name: "TypeScript", level: 80 },
      { id: 4, name: "MongoDB", level: 75 },
      { id: 5, name: "PostgreSQL", level: 70 }
    ]
  },
  {
    id: 2,
    title: "Mobile Development",
    type: "domain",
    icon: "Smartphone",
    sort_order: 2,
    tech_skills: [
      { id: 6, name: "React Native", level: 85 },
      { id: 7, name: "Flutter", level: 75 },
      { id: 8, name: "iOS Development", level: 70 },
      { id: 9, name: "Android Development", level: 65 }
    ]
  },
  {
    id: 3,
    title: "AI/ML",
    type: "domain",
    icon: "Cpu",
    sort_order: 3,
    tech_skills: [
      { id: 10, name: "Python", level: 90 },
      { id: 11, name: "TensorFlow", level: 80 },
      { id: 12, name: "PyTorch", level: 75 },
      { id: 13, name: "NLP", level: 70 },
      { id: 14, name: "Computer Vision", level: 65 }
    ]
  },
  {
    id: 4,
    title: "Cloud Computing",
    type: "domain",
    icon: "Cloud",
    sort_order: 4,
    tech_skills: [
      { id: 15, name: "AWS", level: 85 },
      { id: 16, name: "Docker", level: 80 },
      { id: 17, name: "Kubernetes", level: 75 },
      { id: 18, name: "Azure", level: 70 },
      { id: 19, name: "Google Cloud", level: 65 }
    ]
  }
];

// Utility to get user id by domain
async function getUserByDomain(domain: string) {
  console.log('🔍 Looking up domain for technologies (LIKE):', domain);
  
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
  console.log('🔍 Domain lookup result for technologies:', result);
  
  if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
    const domainData = result.data[0] as any;
    console.log('🔍 Found domain data for technologies:', domainData);
    
    // Check if domain is enabled (status = 1)
    if (domainData.status === 1) {
      console.log('✅ Domain is enabled for technologies, returning user ID:', domainData.id);
      return domainData.id;
    } else {
      console.log('❌ Domain is disabled for technologies (status =', domainData.status, ')');
      return null;
    }
  }
  
  console.log('❌ Domain not found in database for technologies');
  return null;
}

// GET /api/technologies - Public (domain-based or demo) or dashboard (auth)
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
      console.log('🔍 Request origin for technologies:', origin);
      
      if (origin) {
        // Extract domain from origin/referer
        const domain = origin.replace(/^https?:\/\//, '').split('/')[0];
        console.log('🔍 Extracted domain for technologies:', domain);
        userId = await getUserByDomain(domain);
      } else {
        console.log('❌ No origin or referer found in request headers for technologies');
      }
    }
    
    if (!userId) {
      console.log('🎭 No domain found or disabled, returning demo technologies');
      return NextResponse.json({
        success: true,
        data: demoTechnologies,
        demo: true
      });
    }
    const query = `
      SELECT dt.*, ts.id as skill_id, ts.name as skill_name, ts.level as skill_level
      FROM domains_technologies dt
      LEFT JOIN tech_skills ts ON dt.id = ts.tech_id
      WHERE dt.user_id = ?
      ORDER BY dt.sort_order ASC, ts.level ASC
    `;
    const result = await executeQuery(query, [userId]);
    if (!result.success) {
      console.log('❌ Failed to get user technologies, falling back to demo data');
      return NextResponse.json({
        success: true,
        data: demoTechnologies,
        demo: true
      });
    }
    // Group skills by technology/domain
    const groupedData = (result.data as any[]).reduce((acc, row) => {
      const techId = row.id;
      if (!acc[techId]) {
        acc[techId] = {
          id: row.id,
          user_id: row.user_id,
          type: row.type,
          title: row.title,
          icon: row.icon,
          sort_order: row.sort_order,
          created_at: row.created_at,
          updated_at: row.updated_at,
          tech_skills: []
        };
      }
      if (row.skill_id) {
        acc[techId].tech_skills.push({
          id: row.skill_id,
          name: row.skill_name,
          level: row.skill_level
        });
      }
      return acc;
    }, {});
    return NextResponse.json({
      success: true,
      data: Object.values(groupedData),
      demo: false
    });
  } catch (error) {
    console.error('Get technologies error:', error);
    return NextResponse.json({
      success: true,
      data: demoTechnologies,
      demo: true
    });
  }
}

// POST /api/technologies - Create new technology/domain (protected)
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { type, title, icon, sort_order } = body;

    // Validate input
    if (!title || !type) {
      return NextResponse.json(
        { success: false, error: 'Title and type are required' },
        { status: 400 }
      );
    }

    const techId = crypto.randomUUID();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      INSERT INTO domains_technologies (id, user_id, type, title, icon, sort_order, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      techId, 
      request.user!.id, 
      type, 
      title, 
      icon || null, 
      sort_order || 1,
      now,
      now
    ]);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Get the created technology/domain
    const getQuery = 'SELECT * FROM domains_technologies WHERE id = ?';
    const getResult = await executeQuery(getQuery, [techId]);

    return NextResponse.json({
      success: true,
      data: (getResult.data as any[])?.[0],
      message: 'Technology/domain created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Create technology error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 