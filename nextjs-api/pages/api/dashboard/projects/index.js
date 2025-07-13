const { query, queryFirst } = require('../../../../lib/database');
const { requireAuth } = require('../../../../lib/auth');

async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return await getProjects(req, res);
    case 'POST':
      return await createProject(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Get all projects for authenticated user
async function getProjects(req, res) {
  try {
    const userId = req.user.userId;
    
    const projects = await query(`
      SELECT 
        p.id,
        p.title,
        p.description,
        p.short_description,
        p.tech_stack,
        p.live_url,
        p.github_url,
        p.featured,
        p.created_at,
        p.updated_at,
        c.name as category_name,
        GROUP_CONCAT(DISTINCT pi.image_url ORDER BY pi.order_index) as images
      FROM projects p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN project_images pi ON p.id = pi.project_id
      WHERE p.user_id = ?
      GROUP BY p.id 
      ORDER BY p.created_at DESC
    `, [userId]);

    // Process the results
    const formattedProjects = projects.map(project => ({
      ...project,
      tech_stack: project.tech_stack ? project.tech_stack.split(',').map(tech => tech.trim()) : [],
      images: project.images ? project.images.split(',') : []
    }));

    res.status(200).json({
      success: true,
      projects: formattedProjects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

// Create new project
async function createProject(req, res) {
  try {
    const userId = req.user.userId;
    const {
      title,
      description,
      short_description,
      tech_stack,
      live_url,
      github_url,
      category_id,
      featured = false
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // Convert tech_stack array to comma-separated string
    const techStackString = Array.isArray(tech_stack) ? tech_stack.join(', ') : tech_stack;

    const result = await query(`
      INSERT INTO projects (
        user_id, title, description, short_description, 
        tech_stack, live_url, github_url, category_id, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId, title, description, short_description,
      techStackString, live_url, github_url, category_id, featured
    ]);

    const newProject = await queryFirst(`
      SELECT 
        p.*,
        c.name as category_name
      FROM projects p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      project: newProject
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
}

export default requireAuth(handler); 