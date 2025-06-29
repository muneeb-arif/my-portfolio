const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const http = require('http');
require('dotenv').config();

// Supabase setup
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const portfolioOwnerEmail = process.env.REACT_APP_PORTFOLIO_OWNER_EMAIL;

if (!supabaseUrl || !supabaseAnonKey || !portfolioOwnerEmail) {
  console.error('❌ Missing required environment variables');
  console.log('Required variables:');
  console.log('- REACT_APP_SUPABASE_URL');
  console.log('- REACT_APP_SUPABASE_ANON_KEY'); 
  console.log('- REACT_APP_PORTFOLIO_OWNER_EMAIL');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to check image file size for WhatsApp compliance
async function checkImageSize(imageUrl) {
  return new Promise((resolve) => {
    try {
      const protocol = imageUrl.startsWith('https:') ? https : http;
      const req = protocol.request(imageUrl, { method: 'HEAD' }, (res) => {
        const contentLength = parseInt(res.headers['content-length'] || '0');
        const contentType = res.headers['content-type'] || '';
        
        resolve({
          size: contentLength,
          sizeFormatted: formatBytes(contentLength),
          contentType,
          isValidForWhatsApp: contentLength <= 600000, // 600KB limit
          statusCode: res.statusCode
        });
      });
      
      req.on('error', () => {
        resolve({
          size: 0,
          sizeFormatted: 'Unknown',
          contentType: 'unknown',
          isValidForWhatsApp: false,
          statusCode: 0
        });
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        resolve({
          size: 0,
          sizeFormatted: 'Timeout',
          contentType: 'unknown',
          isValidForWhatsApp: false,
          statusCode: 0
        });
      });
      
      req.end();
    } catch (error) {
      resolve({
        size: 0,
        sizeFormatted: 'Error',
        contentType: 'unknown',
        isValidForWhatsApp: false,
        statusCode: 0
      });
    }
  });
}

// Function to format bytes to human readable format
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function updateMetaTags() {
  try {
    console.log('🔄 Fetching settings from database...');
    
    // First get the portfolio config to find the user_id
    const { data: portfolioConfig, error: configError } = await supabase
      .from('portfolio_config')
      .select('owner_user_id')
      .eq('owner_email', portfolioOwnerEmail)
      .eq('is_active', true)
      .single();

    if (configError || !portfolioConfig) {
      console.error('❌ Error fetching portfolio config:', configError?.message || 'No portfolio config found');
      console.log('💡 Tip: Make sure the email in REACT_APP_PORTFOLIO_OWNER_EMAIL exists in portfolio_config with is_active=true');
      return;
    }

    // Get settings using the user_id
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', portfolioConfig.owner_user_id);

    if (settingsError) {
      console.error('❌ Error fetching settings:', settingsError.message);
      return;
    }

    // Convert settings array to object
    const settings = {};
    (settingsData || []).forEach(setting => {
      settings[setting.key] = setting.value;
    });

    console.log('✅ Settings fetched successfully');

    // Read the current index.html
    const indexPath = path.join(__dirname, '..', 'public', 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');

    // Extract values from settings
    const bannerName = settings.banner_name || 'Portfolio Owner';
    const bannerTitle = settings.banner_title || 'Professional Portfolio';
    const bannerTagline = settings.banner_tagline || 'Welcome to my professional portfolio';
    
    // Prioritize WhatsApp-optimized image, fallback to avatar
    const avatarImage = settings.whatsapp_preview_image || settings.avatar_image || '/images/profile/avatar.jpeg';
    const currentDomain = settings.site_url || 'https://farid.theexpertways.com';

    // Create meta tag values
    const pageTitle = `${bannerName} - ${bannerTitle}`;
    const pageDescription = bannerTagline;
    
    // Handle image URL generation properly
    let imageUrl;
    if (avatarImage.startsWith('http')) {
      // Already a full URL (from Supabase storage)
      imageUrl = avatarImage;
    } else if (avatarImage.startsWith('%PUBLIC_URL%')) {
      // Replace %PUBLIC_URL% with domain
      imageUrl = avatarImage.replace('%PUBLIC_URL%', currentDomain);
    } else if (avatarImage.startsWith('/')) {
      // Relative path starting with /
      imageUrl = `${currentDomain}${avatarImage}`;
    } else {
      // Fallback
      imageUrl = `${currentDomain}/${avatarImage}`;
    }

    console.log('📝 Updating meta tags with:');
    console.log(`   Title: ${pageTitle}`);
    console.log(`   Description: ${pageDescription}`);
    console.log(`   Image: ${imageUrl}`);

    // Check image compliance for WhatsApp
    console.log('\n🔍 Checking WhatsApp image compliance...');
    const imageCheck = await checkImageSize(imageUrl);
    console.log(`   Image Size: ${imageCheck.sizeFormatted}`);
    console.log(`   Content Type: ${imageCheck.contentType}`);
    console.log(`   WhatsApp Compatible: ${imageCheck.isValidForWhatsApp ? '✅ Yes' : '❌ No'}`);
    
    if (!imageCheck.isValidForWhatsApp) {
      console.log('\n⚠️  WARNING: Image does not meet WhatsApp requirements!');
      console.log('   WhatsApp requires images to be under 600KB');
      console.log('   Current image size:', imageCheck.sizeFormatted);
      console.log('   Recommended actions:');
      console.log('   1. Compress the image using tools like TinyPNG');
      console.log('   2. Resize the image to 1200x630px or smaller');
      console.log('   3. Use JPEG format for better compression');
      console.log('   4. Upload a new optimized image via dashboard');
      console.log('\n   Image will show on Slack/other platforms but NOT on WhatsApp\n');
    } else {
      console.log('   ✅ Image meets WhatsApp requirements!\n');
    }

    // Get image dimensions for proper meta tags
    const imageWidth = 400; // Default fallback
    const imageHeight = 400; // Default fallback
    
    // For WhatsApp compliance, we'll use standard dimensions

    // Update document title
    html = html.replace(
      /<title>.*?<\/title>/i,
      `<title>${pageTitle}</title>`
    );

    // Update meta description
    html = html.replace(
      /<meta name="description" content=".*?" \/>/i,
      `<meta name="description" content="${pageDescription}" />`
    );

    // Update Open Graph title
    html = html.replace(
      /<meta property="og:title" content=".*?" \/>/i,
      `<meta property="og:title" content="${pageTitle}" />`
    );

    // Update Open Graph description
    html = html.replace(
      /<meta property="og:description" content=".*?" \/>/i,
      `<meta property="og:description" content="${pageDescription}" />`
    );

    // Update Open Graph image
    html = html.replace(
      /<meta property="og:image" content=".*?" \/>/i,
      `<meta property="og:image" content="${imageUrl}" />`
    );

    // Add/Update Open Graph image properties required for WhatsApp
    // Remove existing og:image:* tags and add new ones
    html = html.replace(/<meta property="og:image:(width|height|type|secure_url)" content=".*?" \/>\s*/gi, '');
    
    // Add required image meta tags after og:image
    const ogImageTag = html.match(/<meta property="og:image" content=".*?" \/>/i);
    if (ogImageTag) {
      const imageMetaTags = `
    <meta property="og:image:width" content="400" />
    <meta property="og:image:height" content="400" />
    <meta property="og:image:type" content="image/jpeg" />`;
      
      // Add secure_url if it's HTTPS
      const secureUrlTag = imageUrl.startsWith('https') ? 
        `\n    <meta property="og:image:secure_url" content="${imageUrl}" />` : '';
      
      html = html.replace(
        ogImageTag[0],
        `${ogImageTag[0]}${imageMetaTags}${secureUrlTag}`
      );
    }

    // Update Open Graph URL
    html = html.replace(
      /<meta property="og:url" content=".*?" \/>/i,
      `<meta property="og:url" content="${currentDomain}/" />`
    );

    // Update Twitter title
    html = html.replace(
      /<meta property="twitter:title" content=".*?" \/>/i,
      `<meta property="twitter:title" content="${pageTitle}" />`
    );

    // Update Twitter description
    html = html.replace(
      /<meta property="twitter:description" content=".*?" \/>/i,
      `<meta property="twitter:description" content="${pageDescription}" />`
    );

    // Update Twitter image
    html = html.replace(
      /<meta property="twitter:image" content=".*?" \/>/i,
      `<meta property="twitter:image" content="${imageUrl}" />`
    );

    // Update Twitter URL
    html = html.replace(
      /<meta property="twitter:url" content=".*?" \/>/i,
      `<meta property="twitter:url" content="${currentDomain}/" />`
    );

    // Write the updated HTML back to the file
    fs.writeFileSync(indexPath, html, 'utf8');

    console.log('✅ Meta tags updated successfully in public/index.html');
    console.log('🚀 Your social media links will now show the correct title, description, and image!');
    
  } catch (error) {
    console.error('❌ Error updating meta tags:', error.message);
  }
}

updateMetaTags(); 