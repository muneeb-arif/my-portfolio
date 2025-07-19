// WhatsApp Preview Image Debug Script
// Run this in the browser console to debug WhatsApp preview issues

console.log('🔍 WhatsApp Preview Image Debug Script');
console.log('=====================================');

// Function to check meta tags
function checkMetaTags() {
  console.log('\n📋 Current Meta Tags:');
  
  const metaTags = document.querySelectorAll('meta');
  const relevantTags = [];
  
  metaTags.forEach(tag => {
    const property = tag.getAttribute('property') || tag.getAttribute('name');
    const content = tag.getAttribute('content');
    
    if (property && (property.includes('og:') || property.includes('twitter:') || property === 'description')) {
      relevantTags.push({ property, content });
      console.log(`  ${property}: ${content}`);
    }
  });
  
  return relevantTags;
}

// Function to check image accessibility
async function checkImageAccessibility(imageUrl) {
  console.log(`\n🖼️ Checking image accessibility: ${imageUrl}`);
  
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    console.log(`  Status: ${response.status}`);
    console.log(`  Content-Type: ${response.headers.get('content-type')}`);
    console.log(`  Content-Length: ${response.headers.get('content-length')} bytes`);
    console.log(`  Accessible: ${response.ok ? '✅ Yes' : '❌ No'}`);
    
    if (response.ok) {
      const size = parseInt(response.headers.get('content-length') || '0');
      const sizeKB = (size / 1024).toFixed(2);
      console.log(`  Size: ${sizeKB} KB`);
      console.log(`  WhatsApp Compatible (< 600KB): ${size < 600000 ? '✅ Yes' : '❌ No'}`);
    }
    
    return response.ok;
  } catch (error) {
    console.log(`  ❌ Error checking image: ${error.message}`);
    return false;
  }
}

// Function to test WhatsApp preview
function testWhatsAppPreview() {
  console.log('\n📱 WhatsApp Preview Test:');
  
  const ogImage = document.querySelector('meta[property="og:image"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogUrl = document.querySelector('meta[property="og:url"]');
  
  if (ogImage) {
    const imageUrl = ogImage.getAttribute('content');
    console.log(`  Image URL: ${imageUrl}`);
    
    // Check if image is accessible
    checkImageAccessibility(imageUrl);
    
    // Test WhatsApp preview URL
    const whatsappTestUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `${ogTitle?.getAttribute('content') || 'Check out this portfolio'}\n\n${ogDescription?.getAttribute('content') || ''}\n\n${ogUrl?.getAttribute('content') || window.location.href}`
    )}`;
    
    console.log(`\n  📱 WhatsApp Test URL:`);
    console.log(`  ${whatsappTestUrl}`);
    console.log(`\n  💡 To test WhatsApp preview:`);
    console.log(`  1. Copy the WhatsApp Test URL above`);
    console.log(`  2. Open it in a new tab`);
    console.log(`  3. Check if the preview shows correctly`);
    
  } else {
    console.log('  ❌ No og:image meta tag found');
  }
}

// Function to check current settings
async function checkCurrentSettings() {
  console.log('\n⚙️ Current Settings:');
  
  try {
    const response = await fetch('/api/settings');
    const data = await response.json();
    
    if (data.success && data.data) {
      const settings = data.data;
      console.log(`  Banner Name: ${settings.banner_name || 'Not set'}`);
      console.log(`  Banner Title: ${settings.banner_title || 'Not set'}`);
      console.log(`  Banner Tagline: ${settings.banner_tagline || 'Not set'}`);
      console.log(`  Avatar Image: ${settings.avatar_image || 'Not set'}`);
      console.log(`  WhatsApp Preview Image: ${settings.whatsapp_preview_image || 'Not set'}`);
      console.log(`  Site URL: ${settings.site_url || 'Not set'}`);
      
      return settings;
    } else {
      console.log('  ❌ Failed to load settings');
      return null;
    }
  } catch (error) {
    console.log(`  ❌ Error loading settings: ${error.message}`);
    return null;
  }
}

// Function to force refresh meta tags
async function forceRefreshMetaTags() {
  console.log('\n🔄 Force refreshing meta tags...');
  
  try {
    // Clear any cached meta tags
    const metaTagService = window.metaTagService;
    if (metaTagService && metaTagService.clearCache) {
      metaTagService.clearCache();
    }
    
    // Force update meta tags
    if (metaTagService && metaTagService.updateMetaTags) {
      await metaTagService.updateMetaTags();
      console.log('  ✅ Meta tags refreshed');
    } else {
      console.log('  ❌ Meta tag service not available');
    }
  } catch (error) {
    console.log(`  ❌ Error refreshing meta tags: ${error.message}`);
  }
}

// Main debug function
async function debugWhatsAppPreview() {
  console.log('🚀 Starting WhatsApp Preview Debug...');
  
  // Check current settings
  const settings = await checkCurrentSettings();
  
  // Check meta tags
  const metaTags = checkMetaTags();
  
  // Test WhatsApp preview
  testWhatsAppPreview();
  
  // Force refresh meta tags
  await forceRefreshMetaTags();
  
  console.log('\n📋 Debug Summary:');
  console.log('================');
  console.log('1. Check if WhatsApp Preview Image is set in settings');
  console.log('2. Verify the image URL is accessible and under 600KB');
  console.log('3. Ensure all required meta tags are present');
  console.log('4. Test with WhatsApp Test URL above');
  console.log('5. Clear WhatsApp cache by sharing to a new chat');
  console.log('6. Wait 24-48 hours for WhatsApp to refresh cache');
  
  console.log('\n🔧 Common Issues:');
  console.log('- Image file size > 600KB');
  console.log('- Image not accessible (CORS issues)');
  console.log('- Missing og:image meta tag');
  console.log('- WhatsApp cache (takes 24-48 hours to refresh)');
  console.log('- Image dimensions not optimal (should be 1200x630)');
}

// Run the debug
debugWhatsAppPreview(); 