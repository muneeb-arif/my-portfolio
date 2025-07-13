import { withAuth } from '../../../../lib/auth';
import { executeQuery } from '../../../../lib/database';

async function handler(req, res) {
  const { user } = req;

  if (req.method === 'GET') {
    try {
      // Get all contact queries for the authenticated user
      const queries = await executeQuery(`
        SELECT * FROM contact_queries 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `, [user.id]);

      res.status(200).json({
        success: true,
        data: queries
      });
    } catch (error) {
      console.error('Error fetching queries:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch contact queries'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }
}

export default withAuth(handler); 