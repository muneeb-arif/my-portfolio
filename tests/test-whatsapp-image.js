// Simple WhatsApp Image Test
// Run this in browser console on your portfolio site

console.log('📱 WhatsApp Image Test');

// Get current meta tags
const ogImage = document.querySelector('meta[property="og:image"]');
const ogTitle = document.querySelector('meta[property="og:title"]');
const ogDescription = document.querySelector('meta[property="og:description"]');

if (ogImage) {
  const imageUrl = ogImage.getAttribute('content');
  console.log('Current og:image:', imageUrl);
  
  // Create WhatsApp test link
  const testText = `${ogTitle?.getAttribute('content') || 'Check out this portfolio'}\n\n${ogDescription?.getAttribute('content') || ''}\n\n${window.location.href}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(testText)}`;
  
  console.log('\n📱 WhatsApp Test Link:');
  console.log(whatsappUrl);
  
  // Open test link
  console.log('\n🔗 Opening WhatsApp test link...');
  window.open(whatsappUrl, '_blank');
  
} else {
  console.log('❌ No og:image meta tag found');
}

// Check image accessibility
if (ogImage) {
  const imageUrl = ogImage.getAttribute('content');
  fetch(imageUrl, { method: 'HEAD' })
    .then(response => {
      console.log('\n🖼️ Image Status:', response.status);
      console.log('Content-Type:', response.headers.get('content-type'));
      console.log('Size:', response.headers.get('content-length'), 'bytes');
    })
    .catch(error => {
      console.log('❌ Image not accessible:', error.message);
    });
} 