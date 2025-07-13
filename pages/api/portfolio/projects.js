import { createApiHandler } from '../../../lib/auth.js';
import { findMany, findOne } from '../../../lib/database.js';

async function projectsHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get portfolio owner email from environment
    const portfolioOwnerEmail = process.env.PORTFOLIO_OWNER_EMAIL || 'muneebarif11@gmail.com';
    
    // Get user ID for the portfolio owner
    const portfolioOwner = await findOne(
      'SELECT id FROM users WHERE email = ?',
      [portfolioOwnerEmail]
    );

    if (!portfolioOwner) {
      return res.status(404).json({ 
        error: 'Portfolio owner not found',
        code: 'OWNER_NOT_FOUND'
      });
    }

    const userId = portfolioOwner.id;

    // Get projects with their images and categories
    const projects = await findMany(`
      SELECT 
        p.*,
        c.name as category_name,
        c.color as category_color
      FROM projects p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.user_id = ? AND p.status = 'published'
      ORDER BY p.created_at DESC
    `, [userId]);

    // Get project images for each project
    const projectsWithImages = await Promise.all(
      projects.map(async (project) => {
        const images = await findMany(
          'SELECT * FROM project_images WHERE project_id = ? ORDER BY order_index ASC',
          [project.id]
        );
        
        return {
          ...project,
          images: images || []
        };
      })
    );

    // Get categories for filtering
    const categories = await findMany(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC',
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: {
        projects: projectsWithImages,
        categories: categories || [],
        totalProjects: projectsWithImages.length
      }
    });

  } catch (error) {
    console.error('Projects API error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch projects',
      code: 'PROJECTS_ERROR'
    });
  }
}

export default createApiHandler(projectsHandler); 