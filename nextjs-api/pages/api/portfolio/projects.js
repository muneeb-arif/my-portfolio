import { query } from '../../../lib/database.js';
import { getPortfolioOwnerUserId } from '../../../lib/portfolioOwner.js';

// Helper function to safely parse JSON
function safeJsonParse(jsonString, fallback = []) {
  // Handle null, undefined, or empty values
  if (!jsonString) {
    return fallback;
  }
  
  // If it's already an object/array, return it
  if (typeof jsonString === 'object') {
    return jsonString;
  }
  
  // Convert to string and check if it's empty
  const stringValue = String(jsonString).trim();
  if (stringValue === '') {
    return fallback;
  }
  
  try {
    return JSON.parse(stringValue);
  } catch (error) {
    console.warn('Failed to parse JSON:', stringValue, error);
    return fallback;
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { category, search, featured, limit } = req.query;

    // Get portfolio owner user ID for public display
    const portfolioOwnerUserId = await getPortfolioOwnerUserId();
    
    if (!portfolioOwnerUserId) {
      console.warn('⚠️ No portfolio owner configured, returning empty projects');
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    let sql = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.overview,
        p.category,
        p.technologies,
        p.features,
        p.live_url,
        p.github_url,
        p.status,
        p.views,
        p.created_at,
        p.updated_at,
        GROUP_CONCAT(DISTINCT pi.url ORDER BY pi.order_index) as images
      FROM projects p
      LEFT JOIN project_images pi ON p.id = pi.project_id
      WHERE p.status = 'published' AND p.user_id = ?
    `;

    const params = [portfolioOwnerUserId];

    if (category && category !== 'all') {
      sql += ' AND p.category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (p.title LIKE ? OR p.description LIKE ? OR p.overview LIKE ? OR p.category LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    sql += ' GROUP BY p.id ORDER BY p.created_at DESC';

    if (limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    console.log('Executing projects query for portfolio owner:', portfolioOwnerUserId);
    console.log('SQL:', sql);
    const projects = await query(sql, params);

    // Format projects with safe JSON parsing
    const formattedProjects = projects.map(project => ({
      ...project,
      technologies: safeJsonParse(project.technologies, []),
      features: safeJsonParse(project.features, []),
      images: project.images ? project.images.split(',') : [],
      // Map status to featured for frontend compatibility
      featured: project.status === 'published',
      category_name: project.category // For frontend compatibility
    }));

    res.status(200).json({
      success: true,
      data: formattedProjects
    });

  } catch (error) {
    console.error('Projects fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects',
      details: error.message
    });
  }
} 