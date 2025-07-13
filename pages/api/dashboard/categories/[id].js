import { withAuth } from '../../../../lib/auth';
import { executeQuery } from '../../../../lib/database';

async function handler(req, res) {
  const { user } = req;
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { name, description, color } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Category name is required'
        });
      }

      // Verify category belongs to user
      const [existingCategory] = await executeQuery(`
        SELECT id FROM categories WHERE id = ? AND user_id = ?
      `, [id, user.id]);

      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      // Check if category name already exists for this user (excluding current category)
      const [duplicateCategory] = await executeQuery(`
        SELECT id FROM categories WHERE name = ? AND user_id = ? AND id != ?
      `, [name.trim(), user.id, id]);

      if (duplicateCategory) {
        return res.status(400).json({
          success: false,
          error: 'Category name already exists'
        });
      }

      // Update category
      await executeQuery(`
        UPDATE categories SET
          name = ?, description = ?, color = ?, updated_at = NOW()
        WHERE id = ? AND user_id = ?
      `, [name.trim(), description, color, id, user.id]);

      // Get updated category
      const [updatedCategory] = await executeQuery(`
        SELECT * FROM categories WHERE id = ?
      `, [id]);

      res.status(200).json({
        success: true,
        data: updatedCategory
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update category'
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Verify category belongs to user
      const [category] = await executeQuery(`
        SELECT id, name FROM categories WHERE id = ? AND user_id = ?
      `, [id, user.id]);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      // Check if category is being used by any projects
      const [projectCount] = await executeQuery(`
        SELECT COUNT(*) as count FROM projects 
        WHERE category = ? AND user_id = ?
      `, [category.name, user.id]);

      if (projectCount.count > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot delete category "${category.name}" as it is being used by ${projectCount.count} project(s)`
        });
      }

      // Delete category
      await executeQuery(`
        DELETE FROM categories WHERE id = ? AND user_id = ?
      `, [id, user.id]);

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete category'
      });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }
}

export default withAuth(handler); 