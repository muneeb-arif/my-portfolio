import { supabase } from '../config/supabase';

// Service to dynamically update meta tags at runtime based on current domain
export const metaTagService = {
  // Cache for meta tag data
  _metaCache: null,
  _cacheTimestamp: 0,
  _cacheDuration: 5 * 60 * 1000, // 5 minutes

  // Update meta tags based on current domain
  async updateMetaTags() {
    try {
      const currentDomain = window.location.origin;
      console.log('🔧 META TAGS: Updating for domain:', currentDomain);

      // Get portfolio config for current domain
      const portfolioConfig = await this._getPortfolioConfigForDomain(currentDomain);
      if (!portfolioConfig) {
        console.log('🔧 META TAGS: No portfolio config found for domain:', currentDomain);
        return;
      }

      // Get settings for the portfolio owner
      const settings = await this._getSettingsForUser(portfolioConfig.owner_user_id);
      if (!settings) {
        console.log('🔧 META TAGS: No settings found for user:', portfolioConfig.owner_user_id);
        return;
      }

      // Update meta tags
      this._updateMetaTags(settings, currentDomain);
      console.log('✅ META TAGS: Updated successfully');

    } catch (error) {
      console.error('❌ META TAGS: Error updating meta tags:', error);
    }
  },

  // Get portfolio config for current domain
  async _getPortfolioConfigForDomain(domain) {
    try {
      // First try to find by site_url in settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('user_id')
        .eq('key', 'site_url')
        .eq('value', domain)
        .single();

      if (settingsData) {
        // Get portfolio config for this user
        const { data: configData, error: configError } = await supabase
          .from('portfolio_config')
          .select('*')
          .eq('owner_user_id', settingsData.user_id)
          .eq('is_active', true)
          .single();

        if (configData) {
          return configData;
        }
      }

      // Fallback: get first active portfolio config
      const { data: fallbackConfig, error: fallbackError } = await supabase
        .from('portfolio_config')
        .select('*')
        .eq('is_active', true)
        .single();

      return fallbackConfig;

    } catch (error) {
      console.error('🔧 META TAGS: Error getting portfolio config:', error);
      return null;
    }
  },

  // Get settings for a specific user
  async _getSettingsForUser(userId) {
    try {
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId);

      if (settingsError || !settingsData) {
        return null;
      }

      // Convert settings array to object
      const settings = {};
      settingsData.forEach(setting => {
        try {
          // Try to parse JSON values
          settings[setting.key] = JSON.parse(setting.value);
        } catch {
          // If not JSON, use raw value
          settings[setting.key] = setting.value;
        }
      });

      return settings;

    } catch (error) {
      console.error('🔧 META TAGS: Error getting settings:', error);
      return null;
    }
  },

  // Update meta tags in the DOM
  _updateMetaTags(settings, domain) {
    // Extract values from settings
    const bannerName = settings.banner_name || 'Portfolio Owner';
    const bannerTitle = settings.banner_title || 'Professional Portfolio';
    const bannerTagline = settings.banner_tagline || 'Welcome to my professional portfolio';
    const avatarImage = settings.whatsapp_preview_image || settings.avatar_image || '/images/profile/avatar.jpeg';

    // Create meta tag values
    const pageTitle = `${bannerName} - ${bannerTitle}`;
    const pageDescription = bannerTagline;

    // Handle image URL generation
    let imageUrl;
    const rawAvatarImage = String(avatarImage).trim();
    
    if (rawAvatarImage.startsWith('http')) {
      // Already a full URL (from Supabase storage)
      imageUrl = rawAvatarImage;
    } else if (rawAvatarImage.startsWith('%PUBLIC_URL%')) {
      // Replace %PUBLIC_URL% with domain
      imageUrl = rawAvatarImage.replace('%PUBLIC_URL%', domain);
    } else if (rawAvatarImage.startsWith('/')) {
      // Relative path starting with /
      imageUrl = `${domain}${rawAvatarImage}`;
    } else {
      // Fallback
      imageUrl = `${domain}/${rawAvatarImage}`;
    }

    // Update document title
    document.title = pageTitle;

    // Update meta description
    this._updateMetaTag('name', 'description', pageDescription);

    // Update Open Graph tags
    this._updateMetaTag('property', 'og:title', pageTitle);
    this._updateMetaTag('property', 'og:description', pageDescription);
    this._updateMetaTag('property', 'og:image', imageUrl);
    this._updateMetaTag('property', 'og:url', domain);

    // Update Twitter tags
    this._updateMetaTag('property', 'twitter:title', pageTitle);
    this._updateMetaTag('property', 'twitter:description', pageDescription);
    this._updateMetaTag('property', 'twitter:image', imageUrl);
    this._updateMetaTag('property', 'twitter:url', domain);

    // Add/Update Open Graph image properties
    this._updateMetaTag('property', 'og:image:width', '400');
    this._updateMetaTag('property', 'og:image:height', '400');
    this._updateMetaTag('property', 'og:image:type', 'image/jpeg');
    
    if (imageUrl.startsWith('https')) {
      this._updateMetaTag('property', 'og:image:secure_url', imageUrl);
    }
  },

  // Helper function to update or create meta tags
  _updateMetaTag(attribute, value, content) {
    let metaTag = document.querySelector(`meta[${attribute}="${value}"]`);
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute(attribute, value);
      document.head.appendChild(metaTag);
    }
    
    metaTag.setAttribute('content', content);
  },

  // Initialize meta tags when the app loads
  async initialize() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.updateMetaTags();
      });
    } else {
      this.updateMetaTags();
    }
  },

  // Clear cache
  clearCache() {
    this._metaCache = null;
    this._cacheTimestamp = 0;
  }
};

export default metaTagService; 