import { useEffect } from 'react';
import { useSettings } from '../services/settingsContext';

const DynamicHead = () => {
  const { getSetting, loading } = useSettings();

  useEffect(() => {
    if (loading) return;

    const bannerName = getSetting('banner_name');
    const bannerTitle = getSetting('banner_title');
    const bannerTagline = getSetting('banner_tagline');
    const avatarImage = getSetting('avatar_image');
    const siteName = getSetting('site_name') || 'Portfolio';
    const themeColor = getSetting('theme_color') || '#E9CBA7';

    // Update document title
    const newTitle = bannerName && bannerTitle 
      ? `${bannerName} - ${bannerTitle}`
      : siteName;
    
    document.title = newTitle;

    // Update theme color
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', themeColor);
    }

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        bannerTagline || `${bannerName} - ${bannerTitle} Portfolio`
      );
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', newTitle);
    } else {
      // Create og:title if it doesn't exist
      const newOgTitle = document.createElement('meta');
      newOgTitle.setAttribute('property', 'og:title');
      newOgTitle.setAttribute('content', newTitle);
      document.head.appendChild(newOgTitle);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', bannerTagline || `${bannerName} - ${bannerTitle} Portfolio`);
    } else {
      // Create og:description if it doesn't exist
      const newOgDescription = document.createElement('meta');
      newOgDescription.setAttribute('property', 'og:description');
      newOgDescription.setAttribute('content', bannerTagline || `${bannerName} - ${bannerTitle} Portfolio`);
      document.head.appendChild(newOgDescription);
    }

    // Update Open Graph site name
    const ogSiteName = document.querySelector('meta[property="og:site_name"]');
    if (ogSiteName) {
      ogSiteName.setAttribute('content', `${bannerName} Portfolio`);
    } else {
      const newOgSiteName = document.createElement('meta');
      newOgSiteName.setAttribute('property', 'og:site_name');
      newOgSiteName.setAttribute('content', `${bannerName} Portfolio`);
      document.head.appendChild(newOgSiteName);
    }

    // Update Open Graph image if avatar is available
    if (avatarImage) {
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute('content', avatarImage);
      } else {
        // Create og:image if it doesn't exist
        const newOgImage = document.createElement('meta');
        newOgImage.setAttribute('property', 'og:image');
        newOgImage.setAttribute('content', avatarImage);
        document.head.appendChild(newOgImage);
      }

      // Add og:image:alt for accessibility
      const ogImageAlt = document.querySelector('meta[property="og:image:alt"]');
      if (ogImageAlt) {
        ogImageAlt.setAttribute('content', `${bannerName} - ${bannerTitle}`);
      } else {
        const newOgImageAlt = document.createElement('meta');
        newOgImageAlt.setAttribute('property', 'og:image:alt');
        newOgImageAlt.setAttribute('content', `${bannerName} - ${bannerTitle}`);
        document.head.appendChild(newOgImageAlt);
      }
    }

    // Update Twitter Card tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', newTitle);
    } else {
      // Create twitter:title if it doesn't exist
      const newTwitterTitle = document.createElement('meta');
      newTwitterTitle.setAttribute('name', 'twitter:title');
      newTwitterTitle.setAttribute('content', newTitle);
      document.head.appendChild(newTwitterTitle);
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', bannerTagline || `${bannerName} - ${bannerTitle} Portfolio`);
    } else {
      // Create twitter:description if it doesn't exist
      const newTwitterDescription = document.createElement('meta');
      newTwitterDescription.setAttribute('name', 'twitter:description');
      newTwitterDescription.setAttribute('content', bannerTagline || `${bannerName} - ${bannerTitle} Portfolio`);
      document.head.appendChild(newTwitterDescription);
    }

    // Update Twitter image if avatar is available
    if (avatarImage) {
      const twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (twitterImage) {
        twitterImage.setAttribute('content', avatarImage);
      } else {
        // Create twitter:image if it doesn't exist
        const newTwitterImage = document.createElement('meta');
        newTwitterImage.setAttribute('name', 'twitter:image');
        newTwitterImage.setAttribute('content', avatarImage);
        document.head.appendChild(newTwitterImage);
      }

      // Add twitter:image:alt for accessibility
      const twitterImageAlt = document.querySelector('meta[name="twitter:image:alt"]');
      if (twitterImageAlt) {
        twitterImageAlt.setAttribute('content', `${bannerName} - ${bannerTitle}`);
      } else {
        const newTwitterImageAlt = document.createElement('meta');
        newTwitterImageAlt.setAttribute('name', 'twitter:image:alt');
        newTwitterImageAlt.setAttribute('content', `${bannerName} - ${bannerTitle}`);
        document.head.appendChild(newTwitterImageAlt);
      }
    }

    // Update URL meta tags with current page URL
    const currentUrl = window.location.href;
    
    // Update Open Graph URL
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', currentUrl);
    } else {
      const newOgUrl = document.createElement('meta');
      newOgUrl.setAttribute('property', 'og:url');
      newOgUrl.setAttribute('content', currentUrl);
      document.head.appendChild(newOgUrl);
    }

    // Update Twitter URL
    const twitterUrl = document.querySelector('meta[name="twitter:url"]');
    if (twitterUrl) {
      twitterUrl.setAttribute('content', currentUrl);
    } else {
      const newTwitterUrl = document.createElement('meta');
      newTwitterUrl.setAttribute('name', 'twitter:url');
      newTwitterUrl.setAttribute('content', currentUrl);
      document.head.appendChild(newTwitterUrl);
    }

    // Update Apple Touch Icon with avatar if available
    if (avatarImage) {
      const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
      if (appleTouchIcon) {
        appleTouchIcon.setAttribute('href', avatarImage);
      } else {
        const newAppleTouchIcon = document.createElement('link');
        newAppleTouchIcon.setAttribute('rel', 'apple-touch-icon');
        newAppleTouchIcon.setAttribute('href', avatarImage);
        document.head.appendChild(newAppleTouchIcon);
      }
    }

    // Add canonical URL for SEO
    const canonicalUrl = document.querySelector('link[rel="canonical"]');
    if (canonicalUrl) {
      canonicalUrl.setAttribute('href', currentUrl);
    } else {
      const newCanonical = document.createElement('link');
      newCanonical.setAttribute('rel', 'canonical');
      newCanonical.setAttribute('href', currentUrl);
      document.head.appendChild(newCanonical);
    }

      // console.log('🌐 Updated document head:', { newTitle, bannerTagline, avatarImage, currentUrl });

  }, [loading]);

  // This component doesn't render anything visible
  return null;
};

export default DynamicHead; 