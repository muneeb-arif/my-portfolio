#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Image Optimization Script
 * 
 * This script optimizes images to reduce build size:
 * 1. Compresses JPEG/PNG images
 * 2. Converts to WebP format for better compression
 * 3. Creates optimized versions for web use
 */

const CONFIG = {
  sourceDir: 'public/images',
  buildDir: 'build/images',
  quality: 80, // JPEG quality
  webpQuality: 75, // WebP quality
  maxWidth: 800, // Max width for images
  maxHeight: 600, // Max height for images
  formats: ['jpeg', 'png', 'webp']
};

class ImageOptimizer {
  constructor() {
    this.originalSizes = {};
    this.optimizedSizes = {};
    this.totalSaved = 0;
  }

  /**
   * Check if ImageMagick is available
   */
  checkImageMagick() {
    try {
      execSync('convert --version', { stdio: 'pipe' });
      return true;
    } catch (error) {
      console.log('⚠️  ImageMagick not found. Install it for better image optimization:');
      console.log('   macOS: brew install imagemagick');
      console.log('   Ubuntu: sudo apt-get install imagemagick');
      console.log('   Windows: Download from https://imagemagick.org/');
      return false;
    }
  }

  /**
   * Get file size in human readable format
   */
  getFileSize(filePath) {
    const stats = fs.statSync(filePath);
    return stats.size;
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Optimize a single image
   */
  optimizeImage(sourcePath, destPath, options = {}) {
    const {
      quality = CONFIG.quality,
      format = 'jpeg',
      width = CONFIG.maxWidth,
      height = CONFIG.maxHeight
    } = options;

    try {
      // Create destination directory if it doesn't exist
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Get original file size
      const originalSize = this.getFileSize(sourcePath);
      this.originalSizes[sourcePath] = originalSize;

      // Use ImageMagick for optimization if available
      if (this.checkImageMagick()) {
        const formatFlag = format === 'webp' ? 'webp' : format;
        const qualityFlag = format === 'webp' ? CONFIG.webpQuality : quality;
        
        const command = `convert "${sourcePath}" -resize ${width}x${height}> -quality ${qualityFlag} "${destPath}"`;
        execSync(command, { stdio: 'pipe' });
      } else {
        // Fallback: just copy the file
        fs.copyFileSync(sourcePath, destPath);
      }

      // Get optimized file size
      const optimizedSize = this.getFileSize(destPath);
      this.optimizedSizes[destPath] = optimizedSize;

      const saved = originalSize - optimizedSize;
      this.totalSaved += saved;

      const savedPercent = ((saved / originalSize) * 100).toFixed(1);
      
      console.log(`✅ ${path.basename(sourcePath)}: ${this.formatBytes(originalSize)} → ${this.formatBytes(optimizedSize)} (${savedPercent}% saved)`);

      return true;
    } catch (error) {
      console.error(`❌ Failed to optimize ${sourcePath}:`, error.message);
      return false;
    }
  }

  /**
   * Process all images in a directory
   */
  processDirectory(sourceDir, destDir, options = {}) {
    if (!fs.existsSync(sourceDir)) {
      console.log(`⚠️  Source directory not found: ${sourceDir}`);
      return;
    }

    const items = fs.readdirSync(sourceDir);
    
    for (const item of items) {
      const sourcePath = path.join(sourceDir, item);
      const destPath = path.join(destDir, item);
      const stat = fs.statSync(sourcePath);

      if (stat.isDirectory()) {
        // Recursively process subdirectories
        this.processDirectory(sourcePath, destPath, options);
      } else if (this.isImageFile(item)) {
        // Process image files
        this.optimizeImage(sourcePath, destPath, options);
      } else {
        // Copy non-image files
        if (!fs.existsSync(path.dirname(destPath))) {
          fs.mkdirSync(path.dirname(destPath), { recursive: true });
        }
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  }

  /**
   * Check if file is an image
   */
  isImageFile(filename) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
  }

  /**
   * Create WebP versions of images
   */
  createWebPVersions(sourceDir, destDir) {
    if (!this.checkImageMagick()) {
      console.log('⚠️  Skipping WebP conversion - ImageMagick not available');
      return;
    }

    console.log('\n🔄 Creating WebP versions...');
    
    const items = fs.readdirSync(sourceDir);
    
    for (const item of items) {
      const sourcePath = path.join(sourceDir, item);
      const stat = fs.statSync(sourcePath);

      if (stat.isDirectory()) {
        // Recursively process subdirectories
        this.createWebPVersions(sourcePath, path.join(destDir, item));
      } else if (this.isImageFile(item)) {
        // Create WebP version
        const ext = path.extname(item);
        const nameWithoutExt = path.basename(item, ext);
        const webpPath = path.join(destDir, `${nameWithoutExt}.webp`);
        
        if (!fs.existsSync(path.dirname(webpPath))) {
          fs.mkdirSync(path.dirname(webpPath), { recursive: true });
        }

        try {
          const command = `convert "${sourcePath}" -quality ${CONFIG.webpQuality} "${webpPath}"`;
          execSync(command, { stdio: 'pipe' });
          
          const originalSize = this.getFileSize(sourcePath);
          const webpSize = this.getFileSize(webpPath);
          const saved = originalSize - webpSize;
          const savedPercent = ((saved / originalSize) * 100).toFixed(1);
          
          console.log(`✅ ${nameWithoutExt}.webp: ${this.formatBytes(originalSize)} → ${this.formatBytes(webpSize)} (${savedPercent}% saved)`);
        } catch (error) {
          console.error(`❌ Failed to create WebP for ${item}:`, error.message);
        }
      }
    }
  }

  /**
   * Generate optimization report
   */
  generateReport() {
    console.log('\n📊 Optimization Report:');
    console.log('='.repeat(50));
    
    const totalOriginal = Object.values(this.originalSizes).reduce((a, b) => a + b, 0);
    const totalOptimized = Object.values(this.optimizedSizes).reduce((a, b) => a + b, 0);
    
    console.log(`Total original size: ${this.formatBytes(totalOriginal)}`);
    console.log(`Total optimized size: ${this.formatBytes(totalOptimized)}`);
    console.log(`Total space saved: ${this.formatBytes(this.totalSaved)}`);
    console.log(`Compression ratio: ${((this.totalSaved / totalOriginal) * 100).toFixed(1)}%`);
    
    console.log('\n📁 File breakdown:');
    Object.keys(this.originalSizes).forEach(sourcePath => {
      const destPath = sourcePath.replace('public/images', 'build/images');
      if (this.optimizedSizes[destPath]) {
        const original = this.originalSizes[sourcePath];
        const optimized = this.optimizedSizes[destPath];
        const saved = original - optimized;
        const savedPercent = ((saved / original) * 100).toFixed(1);
        
        console.log(`  ${path.basename(sourcePath)}: ${this.formatBytes(original)} → ${this.formatBytes(optimized)} (${savedPercent}% saved)`);
      }
    });
  }

  /**
   * Main optimization process
   */
  async optimize() {
    console.log('🖼️  Starting image optimization...');
    console.log('='.repeat(50));
    
    // Check if build directory exists
    if (!fs.existsSync('build')) {
      console.log('❌ Build directory not found. Run "npm run build" first.');
      return;
    }

    // Process images with optimization
    console.log('\n🔄 Optimizing images...');
    this.processDirectory(CONFIG.sourceDir, CONFIG.buildDir, {
      quality: CONFIG.quality,
      width: CONFIG.maxWidth,
      height: CONFIG.maxHeight
    });

    // Create WebP versions
    this.createWebPVersions(CONFIG.buildDir, CONFIG.buildDir);

    // Generate report
    this.generateReport();

    console.log('\n✅ Image optimization completed!');
    console.log('💡 Tip: Consider using WebP images in your HTML for better performance');
  }
}

// Run the optimizer
if (require.main === module) {
  const optimizer = new ImageOptimizer();
  optimizer.optimize().catch(console.error);
}

module.exports = ImageOptimizer; 