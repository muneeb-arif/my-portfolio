import { withAuth } from '../../../../lib/auth';
import { executeQuery } from '../../../../lib/database';

async function handler(req, res) {
  const { user } = req;
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { name, level, years_experience } = req.body;

      // Verify skill belongs to user (through technology)
      const [skill] = await executeQuery(`
        SELECT ts.id, ts.technology_id 
        FROM tech_skills ts
        JOIN domains_technologies dt ON ts.technology_id = dt.id
        WHERE ts.id = ? AND dt.user_id = ?
      `, [id, user.id]);

      if (!skill) {
        return res.status(404).json({
          success: false,
          error: 'Skill not found'
        });
      }

      // Update skill
      await executeQuery(`
        UPDATE tech_skills SET
          name = ?, level = ?, years_experience = ?, updated_at = NOW()
        WHERE id = ?
      `, [name, level, years_experience, id]);

      // Get updated skill
      const [updatedSkill] = await executeQuery(`
        SELECT * FROM tech_skills WHERE id = ?
      `, [id]);

      res.status(200).json({
        success: true,
        data: updatedSkill
      });
    } catch (error) {
      console.error('Error updating skill:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update skill'
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Verify skill belongs to user (through technology)
      const [skill] = await executeQuery(`
        SELECT ts.id 
        FROM tech_skills ts
        JOIN domains_technologies dt ON ts.technology_id = dt.id
        WHERE ts.id = ? AND dt.user_id = ?
      `, [id, user.id]);

      if (!skill) {
        return res.status(404).json({
          success: false,
          error: 'Skill not found'
        });
      }

      // Delete skill
      await executeQuery(`
        DELETE FROM tech_skills WHERE id = ?
      `, [id]);

      res.status(200).json({
        success: true,
        message: 'Skill deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting skill:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete skill'
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