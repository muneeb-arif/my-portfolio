import { query } from '../../../lib/database.js';
import { getPortfolioOwnerUserId } from '../../../lib/portfolioOwner.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get portfolio owner user ID for public display
    const portfolioOwnerUserId = await getPortfolioOwnerUserId();
    
    if (!portfolioOwnerUserId) {
      console.warn('⚠️ No portfolio owner configured, returning empty categories');
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const sql = `
      SELECT DISTINCT category as name
      FROM projects 
      WHERE status = 'published' AND category IS NOT NULL AND category != '' AND user_id = ?
      ORDER BY category
    `;

    console.log('Executing categories query for portfolio owner:', portfolioOwnerUserId);
    const categories = await query(sql, [portfolioOwnerUserId]);

    // Format categories for frontend
    const formattedCategories = categories.map(cat => ({
      id: cat.name,
      name: cat.name
    }));

    res.status(200).json({
      success: true,
      data: formattedCategories
    });

  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      details: error.message
    });
  }
} 