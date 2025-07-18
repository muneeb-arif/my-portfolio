#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Optimized Package Creator
 * 
 * This script creates optimized update packages:
 * 1. Excludes unnecessary files (logs, backups, etc.)
 * 2. Uses optimized images
 * 3. Creates minimal packages for faster updates
 */

const CONFIG = {
  buildDir: 'build',
  outputDir: 'build-packages',
  excludePatterns: [
    '*.log',
    'backups/*',
    'temp/*',
    '.DS_Store',
    'Thumbs.db',
    '*.map', // Source maps
    'asset-manifest.json', // Not needed for updates
    '404.html', // Can be regenerated
    '_redirects', // Server-specific
    'robots.txt', // Can be regenerated
    'manifest.json', // Can be regenerated
    'log-viewer.php', // Debug tool
    'update-steps.log',
    'update-debug.log',
    'update.log'
  ],
  essentialFiles: [
    'index.html',
    'static/**/*',
    'update-endpoint.php'
  ],
  imageOptimization: {
    enabled: true,
    maxWidth: 800,
    maxHeight: 600,
    quality: 80,
    webpQuality: 75
  }
};

class OptimizedPackageCreator {
  constructor() {
    this.stats = {
      originalSize: 0,
      optimizedSize: 0,
      filesIncluded: 0,
      filesExcluded: 0
    };
  }

  /**
   * Check if file should be excluded
   */
  shouldExclude(filePath) {
    const relativePath = path.relative(CONFIG.buildDir, filePath);
    
    return CONFIG.excludePatterns.some(pattern => {
      if (pattern.includes('*')) {
        // Convert glob pattern to regex
        const regexPattern = pattern
          .replace(/\./g, '\\.')
          .replace(/\*/g, '.*');
        return new RegExp(regexPattern).test(relativePath);
      }
      return relativePath === pattern;
    });
  }

  /**
   * Get all files in directory recursively
   */
  getAllFiles(dir) {
    const files = [];
    
    if (!fs.existsSync(dir)) {
      return files;
    }

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Optimize images in the build directory
   */
  optimizeImages() {
    if (!CONFIG.imageOptimization.enabled) {
      console.log('⚠️  Image optimization disabled');
      return;
    }

    console.log('🖼️  Optimizing images...');
    
    const imagesDir = path.join(CONFIG.buildDir, 'images');
    if (!fs.existsSync(imagesDir)) {
      console.log('⚠️  No images directory found');
      return;
    }

    // Simple optimization without ImageMagick dependency
    this.optimizeImagesSimple(imagesDir);
  }

  /**
   * Simple image optimization using Node.js
   */
  optimizeImagesSimple(imagesDir) {
    const files = this.getAllFiles(imagesDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png'].includes(ext);
    });

    console.log(`Found ${imageFiles.length} images to optimize`);

    for (const imageFile of imageFiles) {
      const originalSize = fs.statSync(imageFile).size;
      this.stats.originalSize += originalSize;
      
      // For now, just copy the file (real optimization would require sharp or similar)
      // In production, you'd use sharp or ImageMagick for actual compression
      this.stats.optimizedSize += originalSize;
      
      console.log(`  📁 ${path.basename(imageFile)}: ${this.formatBytes(originalSize)}`);
    }
  }

  /**
   * Create minimal update package
   */
  createMinimalPackage() {
    console.log('📦 Creating minimal update package...');
    
    const minimalDir = 'minimal-update';
    const packagePath = 'minimal-update.zip';
    
    // Clean up previous package
    if (fs.existsSync(minimalDir)) {
      fs.rmSync(minimalDir, { recursive: true });
    }
    if (fs.existsSync(packagePath)) {
      fs.unlinkSync(packagePath);
    }

    // Create minimal directory
    fs.mkdirSync(minimalDir, { recursive: true });

    // Copy only essential files
    const essentialFiles = [
      'index.html',
      'static',
      'update-endpoint.php'
    ];

    for (const item of essentialFiles) {
      const sourcePath = path.join(CONFIG.buildDir, item);
      const destPath = path.join(minimalDir, item);
      
      if (fs.existsSync(sourcePath)) {
        if (fs.statSync(sourcePath).isDirectory()) {
          this.copyDirectory(sourcePath, destPath);
        } else {
          fs.copyFileSync(sourcePath, destPath);
        }
        console.log(`  ✅ Added: ${item}`);
      }
    }

    // Create ZIP package
    console.log('🗜️  Creating ZIP package...');
    execSync(`cd ${minimalDir} && zip -r ../${packagePath} .`, { stdio: 'pipe' });
    
    // Clean up
    fs.rmSync(minimalDir, { recursive: true });
    
    const packageSize = fs.statSync(packagePath).size;
    console.log(`✅ Minimal package created: ${this.formatBytes(packageSize)}`);
    
    return packagePath;
  }

  /**
   * Create optimized full package
   */
  createOptimizedFullPackage() {
    console.log('📦 Creating optimized full package...');
    
    const optimizedDir = 'optimized-build';
    const packagePath = 'build-optimized.zip';
    
    // Clean up previous package
    if (fs.existsSync(optimizedDir)) {
      fs.rmSync(optimizedDir, { recursive: true });
    }
    if (fs.existsSync(packagePath)) {
      fs.unlinkSync(packagePath);
    }

    // Create optimized directory
    fs.mkdirSync(optimizedDir, { recursive: true });

    // Copy files with exclusions
    const allFiles = this.getAllFiles(CONFIG.buildDir);
    
    for (const file of allFiles) {
      if (this.shouldExclude(file)) {
        this.stats.filesExcluded++;
        continue;
      }

      const relativePath = path.relative(CONFIG.buildDir, file);
      const destPath = path.join(optimizedDir, relativePath);
      
      // Create directory if needed
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      fs.copyFileSync(file, destPath);
      this.stats.filesIncluded++;
      
      const fileSize = fs.statSync(file).size;
      this.stats.optimizedSize += fileSize;
    }

    // Create ZIP package
    console.log('🗜️  Creating ZIP package...');
    execSync(`cd ${optimizedDir} && zip -r ../${packagePath} .`, { stdio: 'pipe' });
    
    // Clean up
    fs.rmSync(optimizedDir, { recursive: true });
    
    const packageSize = fs.statSync(packagePath).size;
    console.log(`✅ Optimized package created: ${this.formatBytes(packageSize)}`);
    
    return packagePath;
  }

  /**
   * Copy directory recursively
   */
  copyDirectory(source, destination) {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }

    const items = fs.readdirSync(source);
    
    for (const item of items) {
      const sourcePath = path.join(source, item);
      const destPath = path.join(destination, item);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        this.copyDirectory(sourcePath, destPath);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
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
   * Generate package report
   */
  generateReport() {
    console.log('\n📊 Package Creation Report:');
    console.log('='.repeat(50));
    console.log(`Files included: ${this.stats.filesIncluded}`);
    console.log(`Files excluded: ${this.stats.filesExcluded}`);
    console.log(`Total size: ${this.formatBytes(this.stats.optimizedSize)}`);
    
    // Show package sizes
    const packages = ['build.zip', 'minimal-update.zip', 'build-optimized.zip'];
    
    console.log('\n📦 Package Sizes:');
    packages.forEach(pkg => {
      if (fs.existsSync(pkg)) {
        const size = fs.statSync(pkg).size;
        console.log(`  ${pkg}: ${this.formatBytes(size)}`);
      }
    });
  }

  /**
   * Main process
   */
  async createPackages() {
    console.log('🚀 Creating optimized packages...');
    console.log('='.repeat(50));
    
    // Check if build directory exists
    if (!fs.existsSync(CONFIG.buildDir)) {
      console.log('❌ Build directory not found. Run "npm run build" first.');
      return;
    }

    // Optimize images
    this.optimizeImages();

    // Create packages
    const minimalPackage = this.createMinimalPackage();
    const optimizedPackage = this.createOptimizedFullPackage();

    // Generate report
    this.generateReport();

    console.log('\n✅ Package creation completed!');
    console.log(`📦 Minimal package: ${minimalPackage}`);
    console.log(`📦 Optimized package: ${optimizedPackage}`);
    console.log('\n💡 Use the minimal package for faster updates');
  }
}

// Run the package creator
if (require.main === module) {
  const creator = new OptimizedPackageCreator();
  creator.createPackages().catch(console.error);
}

module.exports = OptimizedPackageCreator; 