import { useEffect, useMemo, useRef } from 'react';
import { useSettings } from '../services/settingsContext';

const DynamicHead = () => {
  const { settings, loading } = useSettings();
  const lastAppliedValues = useRef({});

  // Memoize all the settings values to prevent unnecessary re-calculations
  const settingsValues = useMemo(() => ({
    bannerName: settings.banner_name || '',
    bannerTitle: settings.banner_title || '',
    bannerTagline: settings.banner_tagline || '',
    // Prioritize WhatsApp-optimized image for social sharing
    avatarImage: settings.whatsapp_preview_image || settings.avatar_image || '',
    siteName: settings.site_name || 'Portfolio',
    themeColor: settings.theme_color || '#E9CBA7',
    currentUrl: typeof window !== 'undefined' ? window.location.href : ''
  }), [
    settings.banner_name,
    settings.banner_title, 
    settings.banner_tagline,
    settings.whatsapp_preview_image,
    settings.avatar_image,
    settings.site_name,
    settings.theme_color
  ]);

  useEffect(() => {
    if (loading) return;

    const {
      bannerName,
      bannerTitle,
      bannerTagline,
      avatarImage,
      siteName,
      themeColor,
      currentUrl
    } = settingsValues;

    // Create a hash of current values to check if anything changed
    const currentHash = JSON.stringify(settingsValues);
    if (lastAppliedValues.current.hash === currentHash) {
      // console.log('🔄 DynamicHead: No changes detected, skipping update');
      return;
    }

    // console.log('🌐 DynamicHead: Updating meta tags...', settingsValues);

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

      // Add required Open Graph image properties for WhatsApp
      // og:image:width
      let ogImageWidth = document.querySelector('meta[property="og:image:width"]');
      if (ogImageWidth) {
        ogImageWidth.setAttribute('content', '400');
      } else {
        ogImageWidth = document.createElement('meta');
        ogImageWidth.setAttribute('property', 'og:image:width');
        ogImageWidth.setAttribute('content', '400');
        document.head.appendChild(ogImageWidth);
      }

      // og:image:height
      let ogImageHeight = document.querySelector('meta[property="og:image:height"]');
      if (ogImageHeight) {
        ogImageHeight.setAttribute('content', '400');
      } else {
        ogImageHeight = document.createElement('meta');
        ogImageHeight.setAttribute('property', 'og:image:height');
        ogImageHeight.setAttribute('content', '400');
        document.head.appendChild(ogImageHeight);
      }

      // og:image:type
      let ogImageType = document.querySelector('meta[property="og:image:type"]');
      if (ogImageType) {
        ogImageType.setAttribute('content', 'image/jpeg');
      } else {
        ogImageType = document.createElement('meta');
        ogImageType.setAttribute('property', 'og:image:type');
        ogImageType.setAttribute('content', 'image/jpeg');
        document.head.appendChild(ogImageType);
      }

      // og:image:secure_url (if HTTPS)
      if (avatarImage.startsWith('https')) {
        let ogImageSecureUrl = document.querySelector('meta[property="og:image:secure_url"]');
        if (ogImageSecureUrl) {
          ogImageSecureUrl.setAttribute('content', avatarImage);
        } else {
          ogImageSecureUrl = document.createElement('meta');
          ogImageSecureUrl.setAttribute('property', 'og:image:secure_url');
          ogImageSecureUrl.setAttribute('content', avatarImage);
          document.head.appendChild(ogImageSecureUrl);
        }
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

    // Update URL meta tags with current page URL (currentUrl is from settingsValues)
    
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

    // Mark this set of values as applied to prevent unnecessary updates
    lastAppliedValues.current = { hash: currentHash, ...settingsValues };

      // console.log('🌐 Updated document head:', { newTitle, bannerTagline, avatarImage, currentUrl });

  }, [loading, settingsValues]);

  // This component doesn't render anything visible
  return null;
};

export default DynamicHead; 