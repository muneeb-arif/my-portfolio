import { withAuth } from '../../../../lib/auth';
import { executeQuery } from '../../../../lib/database';

async function handler(req, res) {
  const { user } = req;
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { 
        image, 
        title, 
        overview, 
        tools, 
        key_features, 
        sort_order, 
        ai_driven 
      } = req.body;

      // Verify niche belongs to user
      const [existingNiche] = await executeQuery(`
        SELECT id FROM niches WHERE id = ? AND user_id = ?
      `, [id, user.id]);

      if (!existingNiche) {
        return res.status(404).json({
          success: false,
          error: 'Niche not found'
        });
      }

      // Update niche
      await executeQuery(`
        UPDATE niches SET
          image = ?, title = ?, overview = ?, tools = ?, key_features = ?,
          sort_order = ?, ai_driven = ?, updated_at = NOW()
        WHERE id = ? AND user_id = ?
      `, [image, title, overview, tools, key_features, sort_order, ai_driven, id, user.id]);

      // Get updated niche
      const [updatedNiche] = await executeQuery(`
        SELECT * FROM niches WHERE id = ?
      `, [id]);

      res.status(200).json({
        success: true,
        data: updatedNiche
      });
    } catch (error) {
      console.error('Error updating niche:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update niche'
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Verify niche belongs to user
      const [niche] = await executeQuery(`
        SELECT id, title FROM niches WHERE id = ? AND user_id = ?
      `, [id, user.id]);

      if (!niche) {
        return res.status(404).json({
          success: false,
          error: 'Niche not found'
        });
      }

      // Delete niche
      await executeQuery(`
        DELETE FROM niches WHERE id = ? AND user_id = ?
      `, [id, user.id]);

      res.status(200).json({
        success: true,
        message: 'Niche deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting niche:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete niche'
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