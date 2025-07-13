import { createApiHandler } from '../../../lib/auth.js';
import { findMany, findOne } from '../../../lib/database.js';

async function settingsHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get portfolio owner email from environment
    const portfolioOwnerEmail = process.env.PORTFOLIO_OWNER_EMAIL || 'muneebarif11@gmail.com';
    
    // Get user ID for the portfolio owner
    const portfolioOwner = await findOne(
      'SELECT id FROM users WHERE email = ?',
      [portfolioOwnerEmail]
    );

    if (!portfolioOwner) {
      return res.status(404).json({ 
        error: 'Portfolio owner not found',
        code: 'OWNER_NOT_FOUND'
      });
    }

    const userId = portfolioOwner.id;

    // Get all settings for the user
    const settingsRows = await findMany(
      'SELECT setting_key, setting_value FROM settings WHERE user_id = ?',
      [userId]
    );

    // Convert settings array to object
    const settings = {};
    settingsRows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    // Default settings in case some are missing
    const defaultSettings = {
      banner_name: 'Muneeb Arif',
      banner_title: 'Principal Software Engineer',
      banner_tagline: 'I craft dreams, not projects.',
      site_name: 'Portfolio',
      site_url: 'https://your-domain.com',
      
      // Visual Assets
      logo_type: 'initials',
      logo_initials: 'MA',
      logo_image: '',
      hero_banner_image: '/images/hero-bg.png',
      hero_banner_zoom: '100',
      avatar_image: '/images/profile/avatar.jpeg',
      avatar_zoom: '100',
      resume_file: '/images/profile/principal-software-engineer-muneeb.resume.pdf',
      show_resume_download: 'true',
      
      // Social & Contact
      social_email: 'muneeb@example.com',
      social_github: 'https://github.com/muneebarif',
      social_instagram: '',
      social_facebook: '',
      
      // Section Visibility
      section_hero_visible: 'true',
      section_portfolio_visible: 'true',
      section_technologies_visible: 'true',
      section_domains_visible: 'true',
      section_project_cycle_visible: 'true',
      
      // Styling & Theme
      theme_name: 'sand',
      theme_color: '#E9CBA7',
      
      // Legal
      copyright_text: '© 2024 Muneeb Arif. All rights reserved.'
    };

    // Merge with defaults
    const finalSettings = { ...defaultSettings, ...settings };

    // Convert string booleans to actual booleans for certain settings
    const booleanSettings = [
      'show_resume_download',
      'section_hero_visible',
      'section_portfolio_visible', 
      'section_technologies_visible',
      'section_domains_visible',
      'section_project_cycle_visible'
    ];

    booleanSettings.forEach(key => {
      if (finalSettings[key] === 'true' || finalSettings[key] === true) {
        finalSettings[key] = true;
      } else if (finalSettings[key] === 'false' || finalSettings[key] === false) {
        finalSettings[key] = false;
      }
    });

    // Convert numeric settings
    const numericSettings = ['hero_banner_zoom', 'avatar_zoom'];
    numericSettings.forEach(key => {
      if (finalSettings[key]) {
        finalSettings[key] = parseInt(finalSettings[key]) || 100;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        settings: finalSettings,
        user: {
          id: portfolioOwner.id,
          email: portfolioOwnerEmail
        }
      }
    });

  } catch (error) {
    console.error('Settings API error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch settings',
      code: 'SETTINGS_ERROR'
    });
  }
}

export default createApiHandler(settingsHandler); 