#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Domain Image Replacement Script
 * 
 * This script replaces all domain image references with hero-bg.png
 * to significantly reduce build size.
 */

const CONFIG = {
  heroImage: '/images/hero-bg.png',
  filesToUpdate: [
    'src/components/Modal.js',
    'src/components/Technologies.js',
    'src/components/DomainCard.js',
    'src/components/DomainsNiche.js',
    'src/components/DomainModal.js',
    'src/services/portfolioService.js',
    'src/services/hybridService.js',
    'src/services/fallbackDataService.js',
    'src/components/dashboard/PromptsManager.js',
    'src/components/dashboard/NicheManager.js',
    'src/components/PromptsSection.js',
    'api/src/app/api/dashboard/projects/route.ts',
    'api/src/app/api/projects/route.ts'
  ]
};

class DomainImageReplacer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      replacements: 0,
      errors: 0
    };
  }

  /**
   * Replace domain image references in a file
   */
  replaceInFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return false;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      let fileReplacements = 0;

      // Replace various domain image patterns
      const patterns = [
        // Replace specific domain images
        /\/images\/domains\/[^"'\s)]+/g,
        // Replace default.jpeg references
        /\/images\/domains\/default\.jpeg/g,
        // Replace any remaining domain image references
        /\/images\/domains\/[^"'\s)]+\.(jpeg|jpg|png|webp)/g
      ];

      patterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          content = content.replace(pattern, CONFIG.heroImage);
          fileReplacements += matches.length;
        }
      });

      // Write back if changes were made
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${filePath}: ${fileReplacements} replacements`);
        this.stats.replacements += fileReplacements;
        return true;
      } else {
        console.log(`⏭️  ${filePath}: No changes needed`);
        return true;
      }

    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Remove the domains folder
   */
  removeDomainsFolder() {
    const domainsPath = 'public/images/domains';
    const buildDomainsPath = 'build/images/domains';
    
    try {
      if (fs.existsSync(domainsPath)) {
        fs.rmSync(domainsPath, { recursive: true });
        console.log(`🗑️  Removed: ${domainsPath}`);
      }
      
      if (fs.existsSync(buildDomainsPath)) {
        fs.rmSync(buildDomainsPath, { recursive: true });
        console.log(`🗑️  Removed: ${buildDomainsPath}`);
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Error removing domains folder:`, error.message);
      return false;
    }
  }

  /**
   * Update the quick-optimize script
   */
  updateOptimizeScript() {
    const scriptPath = 'scripts/quick-optimize-images.js';
    
    try {
      let content = fs.readFileSync(scriptPath, 'utf8');
      
      // Update the source directory to use hero-bg.png instead
      content = content.replace(
        /sourceDir: 'public\/images\/domains'/g,
        "sourceDir: 'public/images'"
      );
      content = content.replace(
        /targetDir: 'public\/images\/domains-optimized'/g,
        "targetDir: 'public/images-optimized'"
      );
      
      fs.writeFileSync(scriptPath, content, 'utf8');
      console.log(`✅ Updated: ${scriptPath}`);
      
    } catch (error) {
      console.error(`❌ Error updating optimize script:`, error.message);
    }
  }

  /**
   * Main replacement process
   */
  async replaceAll() {
    console.log('🔄 Replacing domain images with hero-bg.png...');
    console.log('='.repeat(60));
    
    // Process each file
    for (const filePath of CONFIG.filesToUpdate) {
      if (this.replaceInFile(filePath)) {
        this.stats.filesProcessed++;
      }
    }

    // Remove domains folder
    this.removeDomainsFolder();

    // Update optimize script
    this.updateOptimizeScript();

    // Generate report
    this.generateReport();

    console.log('\n✅ Domain image replacement completed!');
    console.log('💡 Next steps:');
    console.log('1. Test your application to ensure images display correctly');
    console.log('2. Run: npm run build-optimized');
    console.log('3. Check the new package sizes');
  }

  /**
   * Generate replacement report
   */
  generateReport() {
    console.log('\n📊 Replacement Report:');
    console.log('='.repeat(50));
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Total replacements: ${this.stats.replacements}`);
    console.log(`Errors: ${this.stats.errors}`);
    
    // Calculate size savings
    const domainsPath = 'public/images/domains';
    if (fs.existsSync(domainsPath)) {
      const stats = fs.statSync(domainsPath);
      console.log(`Domains folder size: ${this.formatBytes(stats.size)}`);
    } else {
      console.log('Domains folder: Removed');
    }
    
    const heroPath = 'public/images/hero-bg.png';
    if (fs.existsSync(heroPath)) {
      const stats = fs.statSync(heroPath);
      console.log(`Hero image size: ${this.formatBytes(stats.size)}`);
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
}

// Run the replacer
if (require.main === module) {
  const replacer = new DomainImageReplacer();
  replacer.replaceAll().catch(console.error);
}

module.exports = DomainImageReplacer; 