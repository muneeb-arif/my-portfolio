import { withAuth } from '../../../../lib/auth';
import { executeQuery } from '../../../../lib/database';

async function handler(req, res) {
  const { user } = req;

  if (req.method === 'GET') {
    try {
      // Get all projects for the authenticated user with their images
      const projects = await executeQuery(`
        SELECT 
          p.*,
          GROUP_CONCAT(
            JSON_OBJECT(
              'id', pi.id,
              'image_url', pi.image_url,
              'original_name', pi.original_name,
              'order_index', pi.order_index
            )
          ) as project_images_json
        FROM projects p
        LEFT JOIN project_images pi ON p.id = pi.project_id
        WHERE p.user_id = ?
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `, [user.id]);

      // Parse the project images JSON
      const formattedProjects = projects.map(project => ({
        ...project,
        technologies: project.technologies ? JSON.parse(project.technologies) : [],
        features: project.features ? JSON.parse(project.features) : [],
        project_images: project.project_images_json 
          ? JSON.parse(`[${project.project_images_json}]`).filter(img => img.id)
          : []
      }));

      res.status(200).json({
        success: true,
        data: formattedProjects
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch projects'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        title,
        description,
        overview,
        category,
        status = 'draft',
        technologies = [],
        features = [],
        live_url,
        github_url
      } = req.body;

      if (!title || !description) {
        return res.status(400).json({
          success: false,
          error: 'Title and description are required'
        });
      }

      const result = await executeQuery(`
        INSERT INTO projects (
          user_id, title, description, overview, category, status,
          technologies, features, live_url, github_url, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        user.id,
        title,
        description,
        overview,
        category,
        status,
        JSON.stringify(technologies),
        JSON.stringify(features),
        live_url,
        github_url
      ]);

      // Get the created project
      const [newProject] = await executeQuery(`
        SELECT * FROM projects WHERE id = ?
      `, [result.insertId]);

      res.status(201).json({
        success: true,
        data: {
          ...newProject,
          technologies: JSON.parse(newProject.technologies || '[]'),
          features: JSON.parse(newProject.features || '[]'),
          project_images: []
        }
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create project'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }
}

export default withAuth(handler); 