import { withAuth } from '../../../../lib/auth';
import { executeQuery } from '../../../../lib/database';

async function handler(req, res) {
  const { user } = req;

  if (req.method === 'GET') {
    try {
      // Get all categories for the authenticated user
      const categories = await executeQuery(`
        SELECT * FROM categories 
        WHERE user_id = ? 
        ORDER BY name ASC
      `, [user.id]);

      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch categories'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, description, color = '#8B4513' } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Category name is required'
        });
      }

      // Check if category name already exists for this user
      const [existingCategory] = await executeQuery(`
        SELECT id FROM categories WHERE name = ? AND user_id = ?
      `, [name.trim(), user.id]);

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: 'Category name already exists'
        });
      }

      const result = await executeQuery(`
        INSERT INTO categories (user_id, name, description, color, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `, [user.id, name.trim(), description, color]);

      // Get the created category
      const [newCategory] = await executeQuery(`
        SELECT * FROM categories WHERE id = ?
      `, [result.insertId]);

      res.status(201).json({
        success: true,
        data: newCategory
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create category'
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