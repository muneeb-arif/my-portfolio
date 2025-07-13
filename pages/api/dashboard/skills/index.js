import { withAuth } from '../../../../lib/auth';
import { executeQuery } from '../../../../lib/database';

async function handler(req, res) {
  const { user } = req;

  if (req.method === 'POST') {
    try {
      const { technology_id, name, level, years_experience } = req.body;

      if (!technology_id || !name || !level) {
        return res.status(400).json({
          success: false,
          error: 'Technology ID, name, and level are required'
        });
      }

      // Verify technology belongs to user
      const [technology] = await executeQuery(`
        SELECT id FROM domains_technologies WHERE id = ? AND user_id = ?
      `, [technology_id, user.id]);

      if (!technology) {
        return res.status(404).json({
          success: false,
          error: 'Technology not found'
        });
      }

      const result = await executeQuery(`
        INSERT INTO tech_skills (technology_id, name, level, years_experience, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `, [technology_id, name, level, years_experience]);

      // Get the created skill
      const [newSkill] = await executeQuery(`
        SELECT * FROM tech_skills WHERE id = ?
      `, [result.insertId]);

      res.status(201).json({
        success: true,
        data: newSkill
      });
    } catch (error) {
      console.error('Error creating skill:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create skill'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }
}

export default withAuth(handler); 