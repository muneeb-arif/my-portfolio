import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/services/projectService';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

// Demo data for when no domain is found
const demoProjects = [
  {
    id: 1,
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce solution with modern UI/UX",
    category: "Web Development",
    overview: "Built a comprehensive e-commerce platform with React frontend and Node.js backend, featuring user authentication, payment processing, and admin dashboard.",
    technologies: ["React", "Node.js", "MongoDB", "Stripe"],
    features: [
      "User authentication and authorization",
      "Product catalog with search and filtering",
      "Shopping cart and checkout process",
      "Payment integration with Stripe",
      "Admin dashboard for inventory management",
      "Responsive design for mobile devices"
    ],
    live_url: "https://example-ecommerce.com",
    github_url: "https://github.com/username/ecommerce-platform",
    status: "published",
    views: 1250,
    project_images: [
      {
        id: 1,
        url: "/images/domains/web-development.jpeg",
        caption: "E-Commerce Platform Preview"
      }
    ],
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    title: "AI-Powered Chatbot",
    description: "Intelligent chatbot using machine learning",
    category: "AI/ML",
    overview: "Developed an AI-powered chatbot using natural language processing and machine learning algorithms for customer support automation.",
    technologies: ["Python", "TensorFlow", "NLP", "FastAPI"],
    features: [
      "Natural language understanding",
      "Context-aware conversations",
      "Multi-language support",
      "Integration with CRM systems",
      "Analytics and reporting dashboard",
      "Continuous learning capabilities"
    ],
    live_url: "https://ai-chatbot-demo.com",
    github_url: "https://github.com/username/ai-chatbot",
    status: "published",
    views: 890,
    project_images: [
      {
        id: 2,
        url: "/images/domains/ai-ml.jpeg",
        caption: "AI Chatbot Preview"
      }
    ],
    created_at: "2024-02-20T14:30:00Z"
  },
  {
    id: 3,
    title: "Mobile Banking App",
    description: "Secure mobile banking application",
    category: "Mobile Development",
    overview: "Created a secure mobile banking application with biometric authentication, real-time transactions, and comprehensive financial management features.",
    technologies: ["React Native", "Firebase", "Biometrics", "Redux"],
    features: [
      "Biometric authentication (fingerprint/face ID)",
      "Real-time transaction monitoring",
      "Bill payments and transfers",
      "Investment portfolio tracking",
      "Push notifications for alerts",
      "Offline transaction queuing"
    ],
    live_url: "https://mobile-banking-app.com",
    github_url: "https://github.com/username/mobile-banking",
    status: "published",
    views: 2100,
    project_images: [
      {
        id: 3,
        url: "/images/domains/mobile-development.jpeg",
        caption: "Mobile Banking App Preview"
      }
    ],
    created_at: "2024-03-10T09:15:00Z"
  }
];

// Utility to get user id by domain
async function getUserByDomain(domain: string) {
  console.log('🔍 Looking up domain (LIKE):', domain);
  
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
  console.log('🔍 Domain lookup result:', result);
  
  if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
    const domainData = result.data[0] as any;
    console.log('🔍 Found domain data:', domainData);
    
    // Check if domain is enabled (status = 1)
    if (domainData.status === 1) {
      console.log('✅ Domain is enabled, returning user ID:', domainData.id);
      return domainData.id;
    } else {
      console.log('❌ Domain is disabled (status =', domainData.status, ')');
      return null;
    }
  }
  
  console.log('❌ Domain not found in database');
  return null;
}

// Utility to get portfolio owner user id (fallback) - DISABLED
async function getPortfolioOwnerUserId() {
  // Fallback disabled - only domain-based access allowed
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
      console.log('🔍 Request origin:', origin);
      console.log('🔍 Request referer:', request.headers.get('referer'));
      
      if (origin) {
        // Extract domain from origin/referer
        const domain = origin.replace(/^https?:\/\//, '').split('/')[0];
        console.log('🔍 Extracted domain:', domain);
        
        // Try multiple domain formats for lookup
        const domainVariants = [
          domain, // localhost:3000
          `http://${domain}`, // http://localhost:3000
          `https://${domain}`, // https://localhost:3000
          domain.replace(':3000', ''), // localhost
          `http://${domain.replace(':3000', '')}` // http://localhost
        ];
        
        console.log('🔍 Trying domain variants:', domainVariants);
        
        for (const domainVariant of domainVariants) {
          userId = await getUserByDomain(domainVariant);
          if (userId) {
            console.log('✅ Found user with domain variant:', domainVariant);
            break;
          }
        }
        
        if (!userId) {
          console.log('❌ No user found with any domain variant');
        }
      } else {
        console.log('❌ No origin or referer found in request headers');
      }
    }
    
    // Fallback to portfolio owner if domain not found
    if (!userId) {
      console.log('❌ No user ID found from domain lookup, attempting fallback...');
      userId = await getPortfolioOwnerUserId();
      if (!userId) {
        console.log('❌ Fallback also failed - no portfolio owner configured');
      }
    }
    
    if (!userId) {
      console.log('🎭 No domain found or disabled, returning demo projects');
      return NextResponse.json({
        success: true,
        data: demoProjects,
        demo: true
      });
    }

    // Get user's published projects
    const result = await ProjectService.getUserProjects(userId);
    
    if (!result.success) {
      console.log('❌ Failed to get user projects, falling back to demo data');
      return NextResponse.json({
        success: true,
        data: demoProjects,
        demo: true
      });
    }

    // Filter to only published projects for public access
    const projects = result.data || [];
    const publishedProjects = projects.filter(project => project.status === 'published');

    return NextResponse.json({
      success: true,
      data: publishedProjects,
      demo: false
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