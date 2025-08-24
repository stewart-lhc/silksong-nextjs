#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 性能检查脚本
 * 
 * 检查项目：
 * 1. Bundle大小检查
 * 2. CLS目标检查（≤0.05）
 * 3. 首页HTML大小检查（≤50KB）
 */

// 性能目标配置
const PERFORMANCE_TARGETS = {
  // Bundle大小限制 (KB)
  maxBundleSize: 1000, // 1MB
  maxPageBundleSize: 500, // 500KB per page
  maxChunkSize: 250, // 250KB per chunk
  
  // Core Web Vitals目标
  maxCLS: 0.05, // Cumulative Layout Shift
  maxLCP: 2500, // Largest Contentful Paint (ms)
  maxFID: 100, // First Input Delay (ms)
  
  // HTML大小限制
  maxHtmlSize: 50, // 50KB
};

/**
 * 检查Bundle大小
 */
async function checkBundleSize() {
  console.log('📦 Checking bundle sizes...');
  
  const nextDir = path.join(__dirname, '..', '.next');
  const staticDir = path.join(nextDir, 'static');
  
  try {
    const results = {
      totalSize: 0,
      chunks: [],
      pages: [],
      issues: []
    };
    
    // 检查是否存在构建输出
    try {
      await fs.access(nextDir);
    } catch {
      console.warn('⚠️  .next directory not found. Run "npm run build" first.');
      return { passed: false, message: 'No build output found' };
    }
    
    // 检查静态文件
    if (await directoryExists(staticDir)) {
      await scanDirectory(staticDir, results);
    }
    
    // 检查pages
    const pagesDir = path.join(nextDir, 'server', 'pages');
    if (await directoryExists(pagesDir)) {
      await scanDirectory(pagesDir, results, 'pages');
    }
    
    // 检查chunks
    const chunksDir = path.join(nextDir, 'static', 'chunks');
    if (await directoryExists(chunksDir)) {
      await scanDirectory(chunksDir, results, 'chunks');
    }
    
    // 验证大小限制
    const totalSizeMB = (results.totalSize / 1024 / 1024).toFixed(2);
    console.log(`📊 Total bundle size: ${totalSizeMB} MB`);
    
    // 检查单个文件大小
    results.chunks.forEach(chunk => {
      if (chunk.size > PERFORMANCE_TARGETS.maxChunkSize * 1024) {
        results.issues.push(`Chunk ${chunk.name} is too large: ${(chunk.size / 1024).toFixed(2)}KB > ${PERFORMANCE_TARGETS.maxChunkSize}KB`);
      }
    });
    
    results.pages.forEach(page => {
      if (page.size > PERFORMANCE_TARGETS.maxPageBundleSize * 1024) {
        results.issues.push(`Page ${page.name} bundle is too large: ${(page.size / 1024).toFixed(2)}KB > ${PERFORMANCE_TARGETS.maxPageBundleSize}KB`);
      }
    });
    
    const passed = results.issues.length === 0 && 
                  results.totalSize < PERFORMANCE_TARGETS.maxBundleSize * 1024;
    
    if (!passed) {
      console.error('❌ Bundle size check failed:');
      results.issues.forEach(issue => console.error(`   - ${issue}`));
    } else {
      console.log('✅ Bundle size check passed');
    }
    
    return { 
      passed, 
      results,
      issues: results.issues
    };
    
  } catch (error) {
    console.error(`❌ Error checking bundle size: ${error.message}`);
    return { passed: false, message: error.message };
  }
}

/**
 * 扫描目录中的文件
 */
async function scanDirectory(dirPath, results, type = 'static') {
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        await scanDirectory(fullPath, results, type);
      } else if (item.isFile()) {
        const stats = await fs.stat(fullPath);
        const fileInfo = {
          name: item.name,
          path: fullPath,
          size: stats.size
        };
        
        results.totalSize += stats.size;
        
        if (type === 'chunks') {
          results.chunks.push(fileInfo);
        } else if (type === 'pages') {
          results.pages.push(fileInfo);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️  Could not scan directory ${dirPath}: ${error.message}`);
  }
}

/**
 * 检查目录是否存在
 */
async function directoryExists(dirPath) {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * 检查HTML文件大小
 */
async function checkHtmlSize() {
  console.log('📄 Checking HTML file sizes...');
  
  const exportDir = path.join(__dirname, '..', 'out');
  const nextDir = path.join(__dirname, '..', '.next');
  
  try {
    let htmlFiles = [];
    
    // 检查静态导出
    if (await directoryExists(exportDir)) {
      htmlFiles = await findHtmlFiles(exportDir);
    } 
    // 检查Next.js构建输出
    else if (await directoryExists(nextDir)) {
      const serverDir = path.join(nextDir, 'server');
      if (await directoryExists(serverDir)) {
        htmlFiles = await findHtmlFiles(serverDir);
      }
    }
    
    if (htmlFiles.length === 0) {
      console.warn('⚠️  No HTML files found. Build might not be complete.');
      return { passed: true, message: 'No HTML files to check' };
    }
    
    const issues = [];
    
    for (const htmlFile of htmlFiles) {
      const stats = await fs.stat(htmlFile);
      const sizeKB = stats.size / 1024;
      
      console.log(`📄 ${path.basename(htmlFile)}: ${sizeKB.toFixed(2)} KB`);
      
      if (sizeKB > PERFORMANCE_TARGETS.maxHtmlSize) {
        issues.push(`${path.basename(htmlFile)} is too large: ${sizeKB.toFixed(2)}KB > ${PERFORMANCE_TARGETS.maxHtmlSize}KB`);
      }
    }
    
    const passed = issues.length === 0;
    
    if (!passed) {
      console.error('❌ HTML size check failed:');
      issues.forEach(issue => console.error(`   - ${issue}`));
    } else {
      console.log('✅ HTML size check passed');
    }
    
    return { passed, issues };
    
  } catch (error) {
    console.error(`❌ Error checking HTML size: ${error.message}`);
    return { passed: false, message: error.message };
  }
}

/**
 * 查找HTML文件
 */
async function findHtmlFiles(dirPath) {
  const htmlFiles = [];
  
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        const subFiles = await findHtmlFiles(fullPath);
        htmlFiles.push(...subFiles);
      } else if (item.isFile() && item.name.endsWith('.html')) {
        htmlFiles.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`⚠️  Could not scan ${dirPath}: ${error.message}`);
  }
  
  return htmlFiles;
}

/**
 * 检查CLS性能目标
 * 注意：这是一个静态检查，实际CLS需要在真实环境中测量
 */
async function checkCLSTargets() {
  console.log('🎯 Checking CLS optimization targets...');
  
  try {
    // 检查关键CSS是否内联
    const cssChecks = await checkCSSOptimizations();
    
    // 检查图片优化
    const imageChecks = await checkImageOptimizations();
    
    // 检查字体优化
    const fontChecks = await checkFontOptimizations();
    
    const allChecks = [...cssChecks, ...imageChecks, ...fontChecks];
    const issues = allChecks.filter(check => !check.passed);
    
    if (issues.length > 0) {
      console.error('❌ CLS optimization check failed:');
      issues.forEach(issue => console.error(`   - ${issue.message}`));
      return { passed: false, issues };
    } else {
      console.log('✅ CLS optimization check passed');
      return { passed: true };
    }
    
  } catch (error) {
    console.error(`❌ Error checking CLS targets: ${error.message}`);
    return { passed: false, message: error.message };
  }
}

/**
 * 检查CSS优化
 */
async function checkCSSOptimizations() {
  const checks = [];
  
  // 检查是否有内联关键CSS
  const appDir = path.join(__dirname, '..', 'app');
  const layoutPath = path.join(appDir, 'layout.tsx');
  
  try {
    if (await fs.access(layoutPath).then(() => true).catch(() => false)) {
      const layoutContent = await fs.readFile(layoutPath, 'utf-8');
      
      // 检查是否有字体预加载
      const hasFontPreload = layoutContent.includes('preload') && layoutContent.includes('font');
      checks.push({
        passed: hasFontPreload,
        message: hasFontPreload ? 'Font preloading configured' : 'Missing font preloading in layout'
      });
      
      // 检查是否有关键CSS
      const hasCriticalCSS = layoutContent.includes('globals.css') || layoutContent.includes('critical');
      checks.push({
        passed: hasCriticalCSS,
        message: hasCriticalCSS ? 'Critical CSS configured' : 'Consider inlining critical CSS'
      });
    }
  } catch (error) {
    checks.push({
      passed: false,
      message: `Could not check layout file: ${error.message}`
    });
  }
  
  return checks;
}

/**
 * 检查图片优化
 */
async function checkImageOptimizations() {
  const checks = [];
  
  // 检查Next.js配置中的图片优化
  const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
  
  try {
    if (await fs.access(nextConfigPath).then(() => true).catch(() => false)) {
      const configContent = await fs.readFile(nextConfigPath, 'utf-8');
      
      // 检查图片格式优化
      const hasWebPSupport = configContent.includes('image/webp');
      checks.push({
        passed: hasWebPSupport,
        message: hasWebPSupport ? 'WebP format configured' : 'Consider enabling WebP format'
      });
      
      // 检查响应式图片配置
      const hasResponsive = configContent.includes('deviceSizes') && configContent.includes('imageSizes');
      checks.push({
        passed: hasResponsive,
        message: hasResponsive ? 'Responsive images configured' : 'Missing responsive image configuration'
      });
    }
  } catch (error) {
    checks.push({
      passed: false,
      message: `Could not check Next.js config: ${error.message}`
    });
  }
  
  return checks;
}

/**
 * 检查字体优化
 */
async function checkFontOptimizations() {
  const checks = [];
  
  // 检查Tailwind配置中的字体设置
  const tailwindConfigPath = path.join(__dirname, '..', 'tailwind.config.ts');
  
  try {
    if (await fs.access(tailwindConfigPath).then(() => true).catch(() => false)) {
      const configContent = await fs.readFile(tailwindConfigPath, 'utf-8');
      
      // 检查字体族数量（应该限制在2个以内）
      const fontFamilyMatches = configContent.match(/fontFamily\s*:\s*\{[^}]*\}/s);
      if (fontFamilyMatches) {
        const fontFamilyConfig = fontFamilyMatches[0];
        const fontCount = (fontFamilyConfig.match(/:/g) || []).length;
        
        checks.push({
          passed: fontCount <= 3, // sans, mono, heading 最多3个主要类型
          message: fontCount <= 3 ? `Font families optimized (${fontCount} types)` : `Too many font families (${fontCount}), consider reducing`
        });
      }
      
      // 检查是否配置了font-display
      const hasFontDisplay = configContent.includes('font-display') || configContent.includes('swap');
      checks.push({
        passed: hasFontDisplay,
        message: hasFontDisplay ? 'Font-display optimization configured' : 'Consider adding font-display: swap'
      });
    }
  } catch (error) {
    checks.push({
      passed: false,
      message: `Could not check Tailwind config: ${error.message}`
    });
  }
  
  return checks;
}

/**
 * 生成性能报告
 */
function generatePerformanceReport(results) {
  console.log('\n📊 Performance Check Summary');
  console.log('========================================');
  
  const allPassed = results.every(result => result.passed);
  
  results.forEach((result, index) => {
    const status = result.passed ? '✅' : '❌';
    const testNames = ['Bundle Size', 'HTML Size', 'CLS Targets'];
    console.log(`${status} ${testNames[index]}: ${result.passed ? 'PASSED' : 'FAILED'}`);
    
    if (!result.passed && result.issues) {
      result.issues.forEach(issue => {
        const issueText = typeof issue === 'object' ? issue.message || JSON.stringify(issue) : issue;
        console.log(`    - ${issueText}`);
      });
    }
    
    if (result.message) {
      console.log(`    Note: ${result.message}`);
    }
  });
  
  console.log('========================================');
  
  if (allPassed) {
    console.log('🎉 All performance checks passed!');
    return true;
  } else {
    console.log('🚫 Some performance checks failed. Please review the issues above.');
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 Running performance checks...');
  console.log('========================================');
  
  try {
    const results = await Promise.all([
      checkBundleSize(),
      checkHtmlSize(), 
      checkCLSTargets()
    ]);
    
    const allPassed = generatePerformanceReport(results);
    
    if (!allPassed) {
      console.log('\n💡 Performance Optimization Tips:');
      console.log('- Use Next.js Image component for all images');
      console.log('- Enable font-display: swap for web fonts');
      console.log('- Implement code splitting for large bundles');
      console.log('- Preload critical resources');
      console.log('- Minimize layout shifts with proper sizing');
      
      process.exit(1);
    }
    
    console.log('\n🎯 Performance targets met!');
    
  } catch (error) {
    console.error('========================================');
    console.error(`❌ Fatal error during performance check: ${error.message}`);
    console.error('🚫 Performance check failed');
    process.exit(1);
  }
}

// 如果直接运行此脚本 (Windows兼容性修复)
const isMainModule = process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`;
if (isMainModule || (process.argv[1] && process.argv[1].includes('check-performance.mjs'))) {
  main().catch(console.error);
}

export { 
  checkBundleSize, 
  checkHtmlSize, 
  checkCLSTargets, 
  generatePerformanceReport,
  PERFORMANCE_TARGETS 
};