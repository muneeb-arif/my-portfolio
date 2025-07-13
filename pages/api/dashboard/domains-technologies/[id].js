import { withAuth } from '../../../../lib/auth';
import { executeQuery } from '../../../../lib/database';

async function handler(req, res) {
  const { user } = req;
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { type, title, icon, sort_order } = req.body;

      // Verify item belongs to user
      const [existingItem] = await executeQuery(`
        SELECT id FROM domains_technologies WHERE id = ? AND user_id = ?
      `, [id, user.id]);

      if (!existingItem) {
        return res.status(404).json({
          success: false,
          error: 'Domain/Technology not found'
        });
      }

      // Update item
      await executeQuery(`
        UPDATE domains_technologies SET
          type = ?, title = ?, icon = ?, sort_order = ?, updated_at = NOW()
        WHERE id = ? AND user_id = ?
      `, [type, title, icon, sort_order, id, user.id]);

      // Get updated item with skills
      const [updatedItem] = await executeQuery(`
        SELECT * FROM domains_technologies WHERE id = ?
      `, [id]);

      const skills = await executeQuery(`
        SELECT * FROM tech_skills WHERE technology_id = ?
      `, [id]);

      res.status(200).json({
        success: true,
        data: {
          ...updatedItem,
          tech_skills: skills
        }
      });
    } catch (error) {
      console.error('Error updating domain/technology:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update domain/technology'
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Verify item belongs to user
      const [item] = await executeQuery(`
        SELECT id FROM domains_technologies WHERE id = ? AND user_id = ?
      `, [id, user.id]);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Domain/Technology not found'
        });
      }

      // Delete associated skills first (foreign key constraint)
      await executeQuery(`
        DELETE FROM tech_skills WHERE technology_id = ?
      `, [id]);

      // Delete domain/technology
      await executeQuery(`
        DELETE FROM domains_technologies WHERE id = ? AND user_id = ?
      `, [id, user.id]);

      res.status(200).json({
        success: true,
        message: 'Domain/Technology deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting domain/technology:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete domain/technology'
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