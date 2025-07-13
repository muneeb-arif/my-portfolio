import { withAuth } from '../../../../lib/auth';
import { executeQuery } from '../../../../lib/database';

async function handler(req, res) {
  const { user } = req;

  if (req.method === 'GET') {
    try {
      // Get all niches for the authenticated user
      const niches = await executeQuery(`
        SELECT * FROM niches 
        WHERE user_id = ? 
        ORDER BY sort_order ASC, created_at ASC
      `, [user.id]);

      res.status(200).json({
        success: true,
        data: niches
      });
    } catch (error) {
      console.error('Error fetching niches:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch niches'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { 
        image = 'default.jpeg', 
        title, 
        overview, 
        tools, 
        key_features, 
        sort_order = 1, 
        ai_driven = false 
      } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          error: 'Title is required'
        });
      }

      const result = await executeQuery(`
        INSERT INTO niches (
          user_id, image, title, overview, tools, key_features, 
          sort_order, ai_driven, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [user.id, image, title, overview, tools, key_features, sort_order, ai_driven]);

      // Get the created niche
      const [newNiche] = await executeQuery(`
        SELECT * FROM niches WHERE id = ?
      `, [result.insertId]);

      res.status(201).json({
        success: true,
        data: newNiche
      });
    } catch (error) {
      console.error('Error creating niche:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create niche'
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