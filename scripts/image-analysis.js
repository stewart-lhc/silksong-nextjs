#!/usr/bin/env node

/**
 * Image Analysis and Manual Optimization Guide
 * 
 * This script analyzes image files in the pressKit directory and provides
 * optimization recommendations when automated tools aren't available.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PRESS_KIT_DIR = path.join(__dirname, '..', 'public', 'pressKit');
const CHARACTER_ART_DIR = path.join(PRESS_KIT_DIR, 'character promotional art');

class ImageAnalyzer {
  constructor() {
    this.totalSize = 0;
    this.fileCount = 0;
    this.largeFiles = [];
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
   * Analyze a single image file
   */
  analyzeFile(filePath, category = 'general') {
    const size = this.getFileSize(filePath);
    const fileName = path.basename(filePath);
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    
    this.totalSize += size;
    this.fileCount++;

    const fileInfo = {
      name: fileName,
      path: relativePath,
      size,
      sizeFormatted: this.formatBytes(size),
      category,
      recommendations: this.getRecommendations(size, fileName)
    };

    if (size > 1024 * 1024) { // Files > 1MB
      this.largeFiles.push(fileInfo);
    }

    return fileInfo;
  }

  /**
   * Get optimization recommendations based on file size and type
   */
  getRecommendations(size, fileName) {
    const recommendations = [];
    
    if (size > 5 * 1024 * 1024) { // > 5MB
      recommendations.push({
        priority: 'CRITICAL',
        action: 'Convert to WebP with 80% quality',
        expectedReduction: '85-90%',
        tools: ['squoosh.app', 'tinypng.com', 'imagecompressor.com']
      });
      recommendations.push({
        priority: 'HIGH',
        action: 'Generate responsive sizes (400w, 800w, 1200w, 1600w)',
        expectedReduction: 'Varies by usage',
        tools: ['Next.js Image component', 'squoosh.app']
      });
      recommendations.push({
        priority: 'HIGH', 
        action: 'Create AVIF version for modern browsers',
        expectedReduction: '90-95%',
        tools: ['squoosh.app', 'avif.io']
      });
    } else if (size > 1 * 1024 * 1024) { // 1-5MB
      recommendations.push({
        priority: 'HIGH',
        action: 'Convert to WebP with 85% quality',
        expectedReduction: '70-80%',
        tools: ['squoosh.app', 'tinypng.com']
      });
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Optimize PNG with lossless compression',
        expectedReduction: '20-30%',
        tools: ['tinypng.com', 'pngcrush']
      });
    } else if (size > 500 * 1024) { // 500KB-1MB
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Convert to WebP with 90% quality',
        expectedReduction: '60-70%',
        tools: ['squoosh.app', 'convertio.co']
      });
    }

    return recommendations;
  }

  /**
   * Scan directory for image files
   */
  scanDirectory(directory, category = 'general') {
    const files = [];
    
    try {
      const items = fs.readdirSync(directory);
      
      for (const item of items) {
        const fullPath = path.join(directory, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isFile() && item.toLowerCase().endsWith('.png')) {
          files.push(this.analyzeFile(fullPath, category));
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${directory}:`, error.message);
    }

    return files;
  }

  /**
   * Generate optimization recommendations report
   */
  generateReport() {
    console.log('🖼️  Press Kit Image Analysis Report\n' + '='.repeat(50));
    
    // Scan main pressKit directory
    const mainFiles = this.scanDirectory(PRESS_KIT_DIR, 'promotional');
    
    // Scan character art directory
    const characterFiles = this.scanDirectory(CHARACTER_ART_DIR, 'character-art');
    
    const allFiles = [...mainFiles, ...characterFiles];

    console.log(`\n📊 Summary:`);
    console.log(`Total files analyzed: ${this.fileCount}`);
    console.log(`Total size: ${this.formatBytes(this.totalSize)}`);
    console.log(`Large files (>1MB): ${this.largeFiles.length}`);

    // Show large files with critical issues
    if (this.largeFiles.length > 0) {
      console.log(`\n🚨 Critical Files Requiring Immediate Attention:\n`);
      
      this.largeFiles
        .sort((a, b) => b.size - a.size)
        .forEach((file, index) => {
          console.log(`${index + 1}. ${file.name}`);
          console.log(`   Size: ${file.sizeFormatted}`);
          console.log(`   Path: ${file.path}`);
          
          const criticalRecs = file.recommendations.filter(r => r.priority === 'CRITICAL');
          if (criticalRecs.length > 0) {
            console.log(`   Critical Actions:`);
            criticalRecs.forEach(rec => {
              console.log(`     • ${rec.action} (${rec.expectedReduction} reduction)`);
            });
          }
          console.log('');
        });
    }

    // Show optimization potential
    const potentialSavings = this.calculatePotentialSavings();
    console.log(`💡 Optimization Potential:`);
    console.log(`Estimated space savings: ${this.formatBytes(potentialSavings.totalSavings)}`);
    console.log(`Percentage reduction: ${potentialSavings.percentageReduction}%`);
    console.log(`Performance impact: ${potentialSavings.performanceImpact}`);

    // Show recommended tools and next steps
    this.showRecommendedTools();
    this.showNextSteps();

    return allFiles;
  }

  /**
   * Calculate potential space savings
   */
  calculatePotentialSavings() {
    let totalSavings = 0;
    
    this.largeFiles.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        // Large files can be reduced by ~85%
        totalSavings += file.size * 0.85;
      } else if (file.size > 1 * 1024 * 1024) {
        // Medium files can be reduced by ~70%
        totalSavings += file.size * 0.70;
      } else if (file.size > 500 * 1024) {
        // Smaller files can be reduced by ~60%
        totalSavings += file.size * 0.60;
      }
    });

    const percentageReduction = Math.round((totalSavings / this.totalSize) * 100);
    
    let performanceImpact = 'Significant';
    if (totalSavings > 20 * 1024 * 1024) {
      performanceImpact = 'Critical - Major LCP improvement expected';
    } else if (totalSavings > 10 * 1024 * 1024) {
      performanceImpact = 'High - Noticeable loading speed improvement';
    } else if (totalSavings > 5 * 1024 * 1024) {
      performanceImpact = 'Moderate - Better mobile experience';
    }

    return { totalSavings, percentageReduction, performanceImpact };
  }

  /**
   * Show recommended optimization tools
   */
  showRecommendedTools() {
    console.log(`\n🛠️  Recommended Optimization Tools:\n`);
    
    const tools = [
      {
        name: 'Squoosh.app',
        url: 'https://squoosh.app',
        features: 'WebP, AVIF conversion with quality control',
        best: 'All-in-one browser-based optimization'
      },
      {
        name: 'TinyPNG',
        url: 'https://tinypng.com',
        features: 'PNG & JPEG lossless compression',
        best: 'Quick PNG optimization'
      },
      {
        name: 'ImageCompressor',
        url: 'https://imagecompressor.com',
        features: 'Batch processing, multiple formats',
        best: 'Bulk optimization'
      },
      {
        name: 'AVIF.io',
        url: 'https://avif.io',
        features: 'AVIF conversion',
        best: 'Modern format support'
      }
    ];

    tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name} (${tool.url})`);
      console.log(`   Features: ${tool.features}`);
      console.log(`   Best for: ${tool.best}`);
      console.log('');
    });
  }

  /**
   * Show next steps for manual optimization
   */
  showNextSteps() {
    console.log(`📋 Manual Optimization Steps:\n`);
    
    const steps = [
      'Upload large PNG files to squoosh.app',
      'Convert to WebP with 80-85% quality',
      'Create AVIF versions for modern browsers',
      'Generate responsive sizes (400w, 800w, 1200w, 1600w)',
      'Update image references to use Next.js Image component',
      'Implement responsive images with proper sizes attribute',
      'Test image quality across different devices',
      'Measure performance impact with Lighthouse'
    ];

    steps.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`);
    });

    console.log(`\n🔧 Implementation Guide:`);
    console.log('After optimizing images manually, run:');
    console.log('npm run build && npm run start');
    console.log('Then test with Lighthouse for Core Web Vitals improvements');
  }

  /**
   * Generate script to update image references
   */
  generateUpdateScript() {
    const scriptPath = path.join(__dirname, 'update-image-references.js');
    const script = `#!/usr/bin/env node

/**
 * Update image references to use optimized versions
 * Run this after manually optimizing images
 */

const fs = require('fs');
const path = require('path');

const replacements = [
  {
    from: '/pressKit/Silksong_Promo_02.png',
    to: '/pressKit/Silksong_Promo_02.webp',
    fallback: '/pressKit/Silksong_Promo_02.png'
  },
  {
    from: '/pressKit/Hornet_mid_shot.png',
    to: '/pressKit/Hornet_mid_shot.webp',
    fallback: '/pressKit/Hornet_mid_shot.png'
  }
];

// Implementation would go here...
console.log('Update script template created');
`;

    fs.writeFileSync(scriptPath, script);
    console.log(`\n📝 Update script template created: ${scriptPath}`);
  }
}

// Run the analyzer
if (require.main === module) {
  const analyzer = new ImageAnalyzer();
  const results = analyzer.generateReport();
  analyzer.generateUpdateScript();
}

module.exports = ImageAnalyzer;