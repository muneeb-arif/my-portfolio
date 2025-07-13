import { withAuth } from '../../../../lib/auth';
import { executeQuery } from '../../../../lib/database';

async function handler(req, res) {
  const { user } = req;
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required'
        });
      }

      if (!['new', 'in_progress', 'completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Status must be one of: new, in_progress, completed'
        });
      }

      // Verify query belongs to user
      const [existingQuery] = await executeQuery(`
        SELECT id FROM contact_queries WHERE id = ? AND user_id = ?
      `, [id, user.id]);

      if (!existingQuery) {
        return res.status(404).json({
          success: false,
          error: 'Query not found'
        });
      }

      // Update query status
      await executeQuery(`
        UPDATE contact_queries SET
          status = ?, notes = ?, updated_at = NOW()
        WHERE id = ? AND user_id = ?
      `, [status, notes, id, user.id]);

      // Get updated query
      const [updatedQuery] = await executeQuery(`
        SELECT * FROM contact_queries WHERE id = ?
      `, [id]);

      res.status(200).json({
        success: true,
        data: updatedQuery
      });
    } catch (error) {
      console.error('Error updating query:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update query'
      });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }
}

export default withAuth(handler); 