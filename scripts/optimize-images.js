#!/usr/bin/env node

/**
 * Image Optimization Script for Press Kit Images
 * 
 * This script optimizes large PNG images in the pressKit directory by:
 * 1. Compressing PNG files using lossless optimization
 * 2. Converting to WebP format with optimal quality
 * 3. Generating multiple responsive sizes
 * 4. Creating AVIF versions for modern browsers
 * 
 * Expected size reduction: 20-25MB total
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const PRESS_KIT_DIR = path.join(__dirname, '..', 'public', 'pressKit');
const CHARACTER_ART_DIR = path.join(PRESS_KIT_DIR, 'character promotional art');

// Quality settings for different formats
const QUALITY_SETTINGS = {
  webp: 85,
  webpLossy: 80,  // For very large images
  avif: 65,
  png: 9,  // Compression level 0-9
  jpeg: 85
};

// Responsive sizes to generate
const RESPONSIVE_SIZES = [400, 800, 1200, 1600, 2400];

// Large files that need aggressive optimization (>1MB)
const LARGE_FILES = [
  'Silksong_Promo_02.png',      // 9.7MB -> expect 1-2MB
  'Hornet_mid_shot.png',        // 5.1MB -> expect 500KB-1MB
  'Silksong_Promo_02_2400.png', // 1.5MB -> expect 300-400KB
];

// Character art files that need moderate optimization
const CHARACTER_FILES = [
  'char_hornet_large.png',
  'promo.png',
  'boss_hunter_queen_carmelita.png',
  'npc_forge_daughter.png',
  'npc_garmond_and_zaza.png',
  'npc_shakra.png',
  'npc_sherma.png',
  'npc_trobbio.png',
  'boss_lace.png',
  'boss_steel_assassin_sharpe.png',
  'promo(1).png',
];

class ImageOptimizer {
  constructor() {
    this.results = {
      originalSize: 0,
      optimizedSize: 0,
      filesProcessed: 0,
      timeStarted: Date.now()
    };
  }

  /**
   * Get file size in bytes
   */
  getFileSize(filePath) {
    try {
      return fs.statSync(filePath).size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Backup original file before optimization
   */
  async backupOriginal(filePath) {
    const backupPath = filePath.replace(/\.png$/, '.original.png');
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath);
      console.log(`✓ Backed up: ${path.basename(backupPath)}`);
    }
  }

  /**
   * Optimize a single PNG file
   */
  async optimizePNG(filePath, aggressive = false) {
    try {
      const originalSize = this.getFileSize(filePath);
      this.results.originalSize += originalSize;

      console.log(`\n📸 Optimizing: ${path.basename(filePath)}`);
      console.log(`   Original size: ${this.formatBytes(originalSize)}`);

      // Backup original file
      await this.backupOriginal(filePath);

      const image = sharp(filePath);
      const metadata = await image.metadata();
      
      console.log(`   Dimensions: ${metadata.width}x${metadata.height}`);

      // Optimize PNG with lossless compression
      const pngBuffer = await image
        .png({ 
          compressionLevel: QUALITY_SETTINGS.png,
          progressive: true,
          effort: 10  // Maximum compression effort
        })
        .toBuffer();

      // Write optimized PNG
      fs.writeFileSync(filePath, pngBuffer);
      const newPngSize = this.getFileSize(filePath);
      this.results.optimizedSize += newPngSize;

      console.log(`   PNG optimized: ${this.formatBytes(newPngSize)} (${Math.round((1 - newPngSize/originalSize) * 100)}% reduction)`);

      return { originalSize, newPngSize, metadata };
    } catch (error) {
      console.error(`❌ Error optimizing PNG ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Generate WebP version
   */
  async generateWebP(filePath, metadata, aggressive = false) {
    try {
      const webpPath = filePath.replace(/\.png$/, '.webp');
      const quality = aggressive ? QUALITY_SETTINGS.webpLossy : QUALITY_SETTINGS.webp;
      
      const webpBuffer = await sharp(filePath)
        .webp({ 
          quality,
          effort: 6,  // Good balance of compression vs speed
          nearLossless: !aggressive  // Use near-lossless for smaller files
        })
        .toBuffer();

      fs.writeFileSync(webpPath, webpBuffer);
      const webpSize = this.getFileSize(webpPath);
      
      console.log(`   WebP created: ${this.formatBytes(webpSize)} (${Math.round((1 - webpSize/this.getFileSize(filePath)) * 100)}% smaller than PNG)`);
      
      return webpSize;
    } catch (error) {
      console.error(`❌ Error generating WebP for ${filePath}:`, error.message);
      return 0;
    }
  }

  /**
   * Generate AVIF version
   */
  async generateAVIF(filePath, metadata) {
    try {
      const avifPath = filePath.replace(/\.png$/, '.avif');
      
      const avifBuffer = await sharp(filePath)
        .avif({ 
          quality: QUALITY_SETTINGS.avif,
          effort: 9  // Maximum compression effort
        })
        .toBuffer();

      fs.writeFileSync(avifPath, avifBuffer);
      const avifSize = this.getFileSize(avifPath);
      
      console.log(`   AVIF created: ${this.formatBytes(avifSize)} (${Math.round((1 - avifSize/this.getFileSize(filePath)) * 100)}% smaller than PNG)`);
      
      return avifSize;
    } catch (error) {
      console.error(`❌ Error generating AVIF for ${filePath}:`, error.message);
      return 0;
    }
  }

  /**
   * Generate responsive sizes for large promotional images
   */
  async generateResponsiveSizes(filePath, metadata) {
    if (!LARGE_FILES.includes(path.basename(filePath))) {
      return;
    }

    console.log(`   Generating responsive sizes...`);
    
    for (const width of RESPONSIVE_SIZES) {
      if (width >= metadata.width) continue; // Skip if larger than original
      
      try {
        const baseName = path.basename(filePath, '.png');
        const dir = path.dirname(filePath);
        
        // Generate WebP responsive version
        const responsiveWebpPath = path.join(dir, `${baseName}_${width}w.webp`);
        const webpBuffer = await sharp(filePath)
          .resize(width, null, { 
            withoutEnlargement: true,
            fastShrinkOnLoad: false 
          })
          .webp({ quality: QUALITY_SETTINGS.webp, effort: 6 })
          .toBuffer();
        
        fs.writeFileSync(responsiveWebpPath, webpBuffer);
        
        // Generate AVIF responsive version
        const responsiveAvifPath = path.join(dir, `${baseName}_${width}w.avif`);
        const avifBuffer = await sharp(filePath)
          .resize(width, null, { 
            withoutEnlargement: true,
            fastShrinkOnLoad: false 
          })
          .avif({ quality: QUALITY_SETTINGS.avif, effort: 6 })
          .toBuffer();
        
        fs.writeFileSync(responsiveAvifPath, avifBuffer);
        
        console.log(`     ${width}w versions created`);
      } catch (error) {
        console.error(`❌ Error generating ${width}w version:`, error.message);
      }
    }
  }

  /**
   * Process large promotional images with aggressive optimization
   */
  async processLargeImages() {
    console.log('\n🚀 Processing Large Promotional Images (Aggressive Optimization)\n' + '='.repeat(60));
    
    for (const fileName of LARGE_FILES) {
      const filePath = path.join(PRESS_KIT_DIR, fileName);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${fileName}`);
        continue;
      }

      const result = await this.optimizePNG(filePath, true);
      if (result) {
        await this.generateWebP(filePath, result.metadata, true);
        await this.generateAVIF(filePath, result.metadata);
        await this.generateResponsiveSizes(filePath, result.metadata);
        this.results.filesProcessed++;
      }
    }
  }

  /**
   * Process character art images with moderate optimization
   */
  async processCharacterArt() {
    console.log('\n🎨 Processing Character Art Images (Moderate Optimization)\n' + '='.repeat(60));
    
    for (const fileName of CHARACTER_FILES) {
      const filePath = path.join(CHARACTER_ART_DIR, fileName);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${fileName}`);
        continue;
      }

      const result = await this.optimizePNG(filePath, false);
      if (result) {
        await this.generateWebP(filePath, result.metadata, false);
        await this.generateAVIF(filePath, result.metadata);
        this.results.filesProcessed++;
      }
    }
  }

  /**
   * Print final optimization results
   */
  printResults() {
    const totalTime = (Date.now() - this.results.timeStarted) / 1000;
    const totalReduction = this.results.originalSize - this.results.optimizedSize;
    const reductionPercent = Math.round((totalReduction / this.results.originalSize) * 100);
    
    console.log('\n🎉 Image Optimization Complete!\n' + '='.repeat(40));
    console.log(`Files processed: ${this.results.filesProcessed}`);
    console.log(`Original size: ${this.formatBytes(this.results.originalSize)}`);
    console.log(`Optimized size: ${this.formatBytes(this.results.optimizedSize)}`);
    console.log(`Space saved: ${this.formatBytes(totalReduction)} (${reductionPercent}% reduction)`);
    console.log(`Time taken: ${totalTime.toFixed(1)} seconds`);
    console.log('\n📋 Next Steps:');
    console.log('1. Test image quality in browsers');
    console.log('2. Update image references to use WebP/AVIF with PNG fallback');
    console.log('3. Implement responsive images with Next.js Image component');
    console.log('4. Remove .original.png backup files after verification');
  }

  /**
   * Run the complete optimization process
   */
  async run() {
    console.log('🖼️  Starting Image Optimization for Press Kit\n' + '='.repeat(50));
    console.log('This process will:');
    console.log('• Compress PNG files with lossless optimization');
    console.log('• Generate WebP versions with optimal quality');  
    console.log('• Create AVIF versions for modern browsers');
    console.log('• Generate responsive sizes for large images');
    console.log('• Backup original files as .original.png');
    
    try {
      await this.processLargeImages();
      await this.processCharacterArt();
      this.printResults();
    } catch (error) {
      console.error('❌ Error during optimization:', error);
      process.exit(1);
    }
  }
}

// Run the optimizer
if (require.main === module) {
  const optimizer = new ImageOptimizer();
  optimizer.run().catch(console.error);
}

module.exports = ImageOptimizer;