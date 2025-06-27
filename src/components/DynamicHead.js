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
    const socialGithub = getSetting('social_github');
    const socialEmail = getSetting('social_email');

    // Update document title
    const newTitle = bannerName && bannerTitle 
      ? `${bannerName} - ${bannerTitle}`
      : 'Portfolio';
    
    document.title = newTitle;

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
    }

    // Add structured data (JSON-LD)
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": bannerName,
      "jobTitle": bannerTitle,
      "description": bannerTagline,
      "url": window.location.origin,
      "image": avatarImage,
      "sameAs": [
        socialGithub,
        "https://linkedin.com/in/muneebarif"
      ].filter(Boolean),
      "email": socialEmail,
      "knowsAbout": [
        "React.js",
        "Node.js",
        "JavaScript",
        "TypeScript",
        "Full-stack Development",
        "Web Development",
        "Software Engineering"
      ],
      "worksFor": {
        "@type": "Organization",
        "name": "Freelance"
      },
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "US"
      }
    };

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    console.log('🌐 Updated document head:', { newTitle, bannerTagline, avatarImage });

  }, [loading]);

  // This component doesn't render anything visible
  return null;
};

export default DynamicHead; 