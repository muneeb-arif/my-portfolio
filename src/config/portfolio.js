// Portfolio Configuration
// This file handles user data loading logic for the portfolio

export const portfolioConfig = {
  // Get the portfolio owner's email from environment variables
  // This user's data will be displayed on the public portfolio
  ownerEmail: process.env.REACT_APP_PORTFOLIO_OWNER_EMAIL || null,
  
  // Default settings for when no specific user is configured
  defaultSettings: {
    siteName: 'Portfolio',
    tagline: 'Welcome to my portfolio',
    bannerName: 'Developer',
    bannerTitle: 'Full Stack Developer'
  }
};

export default portfolioConfig; 