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
      console.warn('⚠️ No portfolio owner configured, returning empty niches');
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const sql = `
      SELECT 
        id,
        image,
        title,
        overview,
        tools,
        key_features,
        sort_order,
        ai_driven,
        created_at,
        updated_at
      FROM niche 
      WHERE user_id = ?
      ORDER BY sort_order ASC, title ASC
    `;

    console.log('Executing niches query for portfolio owner:', portfolioOwnerUserId);
    const niches = await query(sql, [portfolioOwnerUserId]);

    res.status(200).json({
      success: true,
      data: niches
    });

  } catch (error) {
    console.error('Niches fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch niches',
      details: error.message
    });
  }
} 