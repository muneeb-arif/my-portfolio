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
      console.warn('⚠️ No portfolio owner configured, returning empty domains-technologies');
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const sql = `
      SELECT 
        id,
        type,
        title,
        icon,
        image,
        sort_order,
        created_at,
        updated_at
      FROM domains_technologies 
      WHERE user_id = ?
      ORDER BY sort_order ASC, title ASC
    `;

    console.log('Executing domains-technologies query for portfolio owner:', portfolioOwnerUserId);
    const domainsTech = await query(sql, [portfolioOwnerUserId]);

    res.status(200).json({
      success: true,
      data: domainsTech
    });

  } catch (error) {
    console.error('Domains-technologies fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch domains and technologies',
      details: error.message
    });
  }
} 