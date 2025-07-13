const { query, queryFirst } = require('./database');

// Get portfolio owner user ID from environment configuration
async function getPortfolioOwnerUserId() {
  try {
    const portfolioOwnerEmail = process.env.REACT_APP_PORTFOLIO_OWNER_EMAIL;
    
    if (!portfolioOwnerEmail) {
      console.warn('⚠️ REACT_APP_PORTFOLIO_OWNER_EMAIL not set in environment');
      return null;
    }

    console.log('📧 Looking for portfolio owner:', portfolioOwnerEmail);

    // Get portfolio config for this email
    const portfolioConfig = await queryFirst(
      'SELECT owner_user_id FROM portfolio_config WHERE owner_email = ? AND is_active = ?',
      [portfolioOwnerEmail, true]
    );

    if (!portfolioConfig) {
      console.warn('⚠️ No active portfolio config found for:', portfolioOwnerEmail);
      return null;
    }

    console.log('✅ Portfolio owner user ID:', portfolioConfig.owner_user_id);
    return portfolioConfig.owner_user_id;

  } catch (error) {
    console.error('❌ Error getting portfolio owner user ID:', error);
    return null;
  }
}

// Get portfolio owner user info
async function getPortfolioOwnerInfo() {
  try {
    const userId = await getPortfolioOwnerUserId();
    
    if (!userId) {
      return null;
    }

    const user = await queryFirst(
      'SELECT id, email, name, full_name FROM users WHERE id = ?',
      [userId]
    );

    return user;

  } catch (error) {
    console.error('❌ Error getting portfolio owner info:', error);
    return null;
  }
}

module.exports = {
  getPortfolioOwnerUserId,
  getPortfolioOwnerInfo
}; 