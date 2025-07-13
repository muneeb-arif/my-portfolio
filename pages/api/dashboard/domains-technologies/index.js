import { withAuth } from '../../../../lib/auth';
import { executeQuery } from '../../../../lib/database';

async function handler(req, res) {
  const { user } = req;

  if (req.method === 'GET') {
    try {
      // Get all domains and technologies for the authenticated user with their skills
      const items = await executeQuery(`
        SELECT 
          dt.*,
          GROUP_CONCAT(
            JSON_OBJECT(
              'id', ts.id,
              'name', ts.name,
              'level', ts.level,
              'years_experience', ts.years_experience
            )
          ) as tech_skills_json
        FROM domains_technologies dt
        LEFT JOIN tech_skills ts ON dt.id = ts.technology_id
        WHERE dt.user_id = ?
        GROUP BY dt.id
        ORDER BY dt.sort_order ASC, dt.created_at ASC
      `, [user.id]);

      // Parse the tech skills JSON
      const formattedItems = items.map(item => ({
        ...item,
        tech_skills: item.tech_skills_json 
          ? JSON.parse(`[${item.tech_skills_json}]`).filter(skill => skill.id)
          : []
      }));

      res.status(200).json({
        success: true,
        data: formattedItems
      });
    } catch (error) {
      console.error('Error fetching domains/technologies:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch domains and technologies'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { type, title, icon, sort_order = 1 } = req.body;

      if (!type || !title) {
        return res.status(400).json({
          success: false,
          error: 'Type and title are required'
        });
      }

      if (!['domain', 'technology'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Type must be either "domain" or "technology"'
        });
      }

      const result = await executeQuery(`
        INSERT INTO domains_technologies (user_id, type, title, icon, sort_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, [user.id, type, title, icon, sort_order]);

      // Get the created item
      const [newItem] = await executeQuery(`
        SELECT * FROM domains_technologies WHERE id = ?
      `, [result.insertId]);

      res.status(201).json({
        success: true,
        data: {
          ...newItem,
          tech_skills: []
        }
      });
    } catch (error) {
      console.error('Error creating domain/technology:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create domain/technology'
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