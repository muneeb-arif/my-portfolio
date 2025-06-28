/**
 * Utility functions for dynamically updating the web app manifest
 */

/**
 * Updates the web app manifest with dynamic values from settings
 * @param {Object} settings - The settings object containing dynamic values
 */
export const updateManifest = (settings) => {
  try {
    const bannerName = settings.banner_name || 'Portfolio Owner';
    const bannerTitle = settings.banner_title || 'Principal Software Engineer';
    
    // Create a dynamic manifest object
    const dynamicManifest = {
      short_name: `${bannerName.split(' ')[0]} Portfolio`,
      name: `${bannerName} - ${bannerTitle} Portfolio`,
      icons: [
        {
          src: "favicon.ico",
          sizes: "64x64 32x32 24x24 16x16",
          type: "image/x-icon"
        }
      ],
      start_url: ".",
      display: "standalone",
      theme_color: "#E9CBA7",
      background_color: "#F5E6D3"
    };

    // Update the manifest link in the document head
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      // Create a blob URL for the dynamic manifest
      const manifestBlob = new Blob([JSON.stringify(dynamicManifest)], {
        type: 'application/json'
      });
      
      // Revoke the previous blob URL if it exists
      if (manifestLink.dataset.blobUrl) {
        URL.revokeObjectURL(manifestLink.dataset.blobUrl);
      }
      
      const manifestUrl = URL.createObjectURL(manifestBlob);
      manifestLink.href = manifestUrl;
      manifestLink.dataset.blobUrl = manifestUrl;
      
      console.log('📱 Dynamic manifest updated:', {
        shortName: dynamicManifest.short_name,
        name: dynamicManifest.name
      });
    } else {
      // Create a new manifest link if it doesn't exist
      const newManifestLink = document.createElement('link');
      newManifestLink.rel = 'manifest';
      
      const manifestBlob = new Blob([JSON.stringify(dynamicManifest)], {
        type: 'application/json'
      });
      
      const manifestUrl = URL.createObjectURL(manifestBlob);
      newManifestLink.href = manifestUrl;
      newManifestLink.dataset.blobUrl = manifestUrl;
      
      document.head.appendChild(newManifestLink);
      
      console.log('📱 Dynamic manifest created:', {
        shortName: dynamicManifest.short_name,
        name: dynamicManifest.name
      });
    }
  } catch (error) {
    console.error('❌ Error updating manifest:', error);
  }
};

/**
 * Cleanup function to revoke blob URLs when component unmounts
 */
export const cleanupManifest = () => {
  try {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink && manifestLink.dataset.blobUrl) {
      URL.revokeObjectURL(manifestLink.dataset.blobUrl);
      delete manifestLink.dataset.blobUrl;
      console.log('🧹 Manifest blob URL cleanup completed');
    }
  } catch (error) {
    console.error('❌ Error cleaning up manifest:', error);
  }
}; 