// Service to dynamically update meta tags at runtime based on current domain
export const metaTagService = {
  // Cache for meta tag data
  _metaCache: null,
  _cacheTimestamp: 0,
  _cacheDuration: 5 * 60 * 1000, // 5 minutes

  // Update meta tags based on current domain
  async updateMetaTags(settings = null) {
    try {
      const currentDomain = window.location.origin;
      console.log('🔧 META TAGS: Updating for domain:', currentDomain);

      // Use provided settings or get from API
      let settingsData = settings;
      if (!settingsData) {
        settingsData = await this._getSettingsFromAPI();
        if (!settingsData) {
          console.log('🔧 META TAGS: No settings found from API');
          return;
        }
      }

      // Update meta tags
      this._updateMetaTags(settingsData, currentDomain);
      console.log('✅ META TAGS: Updated successfully');

    } catch (error) {
      console.error('❌ META TAGS: Error updating meta tags:', error);
    }
  },

  // Get settings from MySQL API
  async _getSettingsFromAPI() {
    try {
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      
      console.log('🔧 META TAGS: Fetching settings from MySQL API...');
      
      const response = await fetch(`${API_BASE}/settings`);
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('🔧 META TAGS: Settings loaded from MySQL API');
        return data.data;
      } else {
        console.log('🔧 META TAGS: No settings from MySQL API');
        return null;
      }

    } catch (error) {
      console.error('🔧 META TAGS: Error getting settings from API:', error);
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