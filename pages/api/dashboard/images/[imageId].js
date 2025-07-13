import { withAuth } from '../../../../lib/auth';
import { executeQuery } from '../../../../lib/database';
import fs from 'fs';
import path from 'path';

async function handler(req, res) {
  const { user } = req;
  const { imageId } = req.query;

  if (req.method === 'DELETE') {
    try {
      // Verify image belongs to user (through project)
      const [image] = await executeQuery(`
        SELECT pi.*, p.user_id 
        FROM project_images pi
        JOIN projects p ON pi.project_id = p.id
        WHERE pi.id = ? AND p.user_id = ?
      `, [imageId, user.id]);

      if (!image) {
        return res.status(404).json({
          success: false,
          error: 'Image not found'
        });
      }

      // Delete physical file
      const imagePath = path.join('./public', image.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      // Delete database record
      await executeQuery(`
        DELETE FROM project_images WHERE id = ?
      `, [imageId]);

      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete image'
      });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }
}

export default withAuth(handler); 