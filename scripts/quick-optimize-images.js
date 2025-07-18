#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Quick Image Optimizer
 * 
 * This script quickly optimizes images using basic techniques:
 * 1. Removes unnecessary metadata
 * 2. Uses basic compression
 * 3. Creates smaller versions for web
 */

const CONFIG = {
  sourceDir: 'public/images',
  targetDir: 'public/images-optimized',
  maxWidth: 800,
  maxHeight: 600,
  quality: 75
};

class QuickImageOptimizer {
  constructor() {
    this.stats = {
      originalSize: 0,
      optimizedSize: 0,
      filesProcessed: 0
    };
  }

  /**
   * Check if ImageMagick is available
   */
  checkImageMagick() {
    try {
      execSync('convert --version', { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
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
  optimizeImage(sourcePath, destPath) {
    try {
      // Get original file size
      const originalSize = fs.statSync(sourcePath).size;
      this.stats.originalSize += originalSize;

      // Create destination directory
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Use ImageMagick if available
      if (this.checkImageMagick()) {
        const command = `convert "${sourcePath}" -resize ${CONFIG.maxWidth}x${CONFIG.maxHeight}> -quality ${CONFIG.quality} -strip "${destPath}"`;
        execSync(command, { stdio: 'pipe' });
      } else {
        // Fallback: just copy the file
        fs.copyFileSync(sourcePath, destPath);
      }

      // Get optimized file size
      const optimizedSize = fs.statSync(destPath).size;
      this.stats.optimizedSize += optimizedSize;
      this.stats.filesProcessed++;

      const saved = originalSize - optimizedSize;
      const savedPercent = ((saved / originalSize) * 100).toFixed(1);
      
      console.log(`✅ ${path.basename(sourcePath)}: ${this.formatBytes(originalSize)} → ${this.formatBytes(optimizedSize)} (${savedPercent}% saved)`);

      return true;
    } catch (error) {
      console.error(`❌ Failed to optimize ${sourcePath}:`, error.message);
      return false;
    }
  }

  /**
   * Process all images in the domains directory
   */
  processImages() {
    console.log('🖼️  Quick image optimization...');
    console.log('='.repeat(50));

    if (!fs.existsSync(CONFIG.sourceDir)) {
      console.log(`❌ Source directory not found: ${CONFIG.sourceDir}`);
      return;
    }

    // Create target directory
    if (!fs.existsSync(CONFIG.targetDir)) {
      fs.mkdirSync(CONFIG.targetDir, { recursive: true });
    }

    // Get all image files
    const files = fs.readdirSync(CONFIG.sourceDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png'].includes(ext);
    });

    console.log(`Found ${imageFiles.length} images to optimize`);
    console.log('');

    // Process each image
    for (const file of imageFiles) {
      const sourcePath = path.join(CONFIG.sourceDir, file);
      const destPath = path.join(CONFIG.targetDir, file);
      this.optimizeImage(sourcePath, destPath);
    }

    // Generate report
    this.generateReport();

    // Instructions for replacement
    console.log('\n📋 Next Steps:');
    console.log('1. Review the optimized images in:', CONFIG.targetDir);
    console.log('2. If satisfied, replace the original images:');
    console.log(`   rm -rf ${CONFIG.sourceDir}`);
    console.log(`   mv ${CONFIG.targetDir} ${CONFIG.sourceDir}`);
    console.log('3. Rebuild your project: npm run build-optimized');
  }

  /**
   * Generate optimization report
   */
  generateReport() {
    console.log('\n📊 Optimization Report:');
    console.log('='.repeat(50));
    
    const totalSaved = this.stats.originalSize - this.stats.optimizedSize;
    const savedPercent = ((totalSaved / this.stats.originalSize) * 100).toFixed(1);
    
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Total original size: ${this.formatBytes(this.stats.originalSize)}`);
    console.log(`Total optimized size: ${this.formatBytes(this.stats.optimizedSize)}`);
    console.log(`Total space saved: ${this.formatBytes(totalSaved)}`);
    console.log(`Compression ratio: ${savedPercent}%`);
  }
}

// Run the optimizer
if (require.main === module) {
  const optimizer = new QuickImageOptimizer();
  optimizer.processImages();
}

module.exports = QuickImageOptimizer; 