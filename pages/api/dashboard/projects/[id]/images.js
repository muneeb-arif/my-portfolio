import { withAuth } from '../../../../../lib/auth';
import { executeQuery } from '../../../../../lib/database';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

// Disable Next.js body parsing to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  const { user } = req;
  const { id } = req.query;

  if (req.method === 'POST') {
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

      // Parse form data with formidable
      const form = formidable({
        uploadDir: './public/images/projects',
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB limit
      });

      const [fields, files] = await form.parse(req);
      
      if (!files.images) {
        return res.status(400).json({
          success: false,
          error: 'No images provided'
        });
      }

      const imageFiles = Array.isArray(files.images) ? files.images : [files.images];
      const uploadedImages = [];

      // Get current highest order_index for this project
      const [maxOrder] = await executeQuery(`
        SELECT COALESCE(MAX(order_index), 0) as max_order 
        FROM project_images 
        WHERE project_id = ?
      `, [id]);

      let currentOrder = maxOrder.max_order;

      for (const file of imageFiles) {
        const originalName = file.originalFilename;
        const tempPath = file.filepath;
        
        // Generate unique filename
        const ext = path.extname(originalName);
        const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
        const finalPath = path.join('./public/images/projects', filename);
        
        // Move file to final location
        fs.renameSync(tempPath, finalPath);
        
        // Save image metadata to database
        currentOrder++;
        const result = await executeQuery(`
          INSERT INTO project_images (project_id, image_url, original_name, order_index, created_at, updated_at)
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `, [id, `/images/projects/${filename}`, originalName, currentOrder]);

        const [newImage] = await executeQuery(`
          SELECT * FROM project_images WHERE id = ?
        `, [result.insertId]);

        uploadedImages.push(newImage);
      }

      res.status(201).json({
        success: true,
        data: uploadedImages
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload images'
      });
    }
  } else if (req.method === 'GET') {
    try {
      // Get all images for the project
      const images = await executeQuery(`
        SELECT * FROM project_images 
        WHERE project_id = ? 
        ORDER BY order_index ASC, created_at ASC
      `, [id]);

      res.status(200).json({
        success: true,
        data: images
      });
    } catch (error) {
      console.error('Error fetching project images:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch project images'
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