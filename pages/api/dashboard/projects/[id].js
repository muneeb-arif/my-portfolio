import { withAuth } from '../../../../lib/auth';
import { executeQuery } from '../../../../lib/database';

async function handler(req, res) {
  const { user } = req;
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // Get single project with images
      const [project] = await executeQuery(`
        SELECT * FROM projects WHERE id = ? AND user_id = ?
      `, [id, user.id]);

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      // Get project images
      const images = await executeQuery(`
        SELECT * FROM project_images 
        WHERE project_id = ? 
        ORDER BY order_index ASC, created_at ASC
      `, [id]);

      res.status(200).json({
        success: true,
        data: {
          ...project,
          technologies: JSON.parse(project.technologies || '[]'),
          features: JSON.parse(project.features || '[]'),
          project_images: images
        }
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch project'
      });
    }
  } else if (req.method === 'PUT') {
    try {
      const {
        title,
        description,
        overview,
        category,
        status,
        technologies = [],
        features = [],
        live_url,
        github_url
      } = req.body;

      // Verify project belongs to user
      const [existingProject] = await executeQuery(`
        SELECT id FROM projects WHERE id = ? AND user_id = ?
      `, [id, user.id]);

      if (!existingProject) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      // Update project
      await executeQuery(`
        UPDATE projects SET
          title = ?, description = ?, overview = ?, category = ?, status = ?,
          technologies = ?, features = ?, live_url = ?, github_url = ?, updated_at = NOW()
        WHERE id = ? AND user_id = ?
      `, [
        title,
        description,
        overview,
        category,
        status,
        JSON.stringify(technologies),
        JSON.stringify(features),
        live_url,
        github_url,
        id,
        user.id
      ]);

      // Get updated project with images
      const [updatedProject] = await executeQuery(`
        SELECT * FROM projects WHERE id = ?
      `, [id]);

      const images = await executeQuery(`
        SELECT * FROM project_images 
        WHERE project_id = ? 
        ORDER BY order_index ASC, created_at ASC
      `, [id]);

      res.status(200).json({
        success: true,
        data: {
          ...updatedProject,
          technologies: JSON.parse(updatedProject.technologies || '[]'),
          features: JSON.parse(updatedProject.features || '[]'),
          project_images: images
        }
      });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update project'
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Verify project belongs to user
      const [project] = await executeQuery(`
        SELECT id FROM projects WHERE id = ? AND user_id = ?
      `, [id, user.id]);

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      // Delete project images first (foreign key constraint)
      await executeQuery(`
        DELETE FROM project_images WHERE project_id = ?
      `, [id]);

      // Delete project
      await executeQuery(`
        DELETE FROM projects WHERE id = ? AND user_id = ?
      `, [id, user.id]);

      res.status(200).json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete project'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }
}

export default withAuth(handler); 