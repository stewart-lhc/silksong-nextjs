#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 基于SILKSONG_RELEASE_ISO环境变量选择对应的OG图片
 * 
 * 规则：
 * - ≥30天：30plus.png
 * - 7-30天：lt30.png
 * - <7天：lt7.png
 * - 已发布：released.png
 * 
 * 如果源文件不存在，构建将失败并返回错误码
 */

const OG_SOURCE_DIR = path.join(__dirname, '..', 'public', 'og');
const OG_TARGET_PATH = path.join(OG_SOURCE_DIR, 'current.png');

// OG图片映射规则
const OG_FILE_MAP = {
  'released': 'released.png',
  'lt7': 'lt7.png',
  'lt30': 'lt30.png', 
  '30plus': '30plus.png'
};

/**
 * 计算距离发布日期的天数
 * @param {string} releaseIso - ISO格式的发布日期
 * @returns {number} 距离发布的天数，负数表示已发布
 */
function calculateDaysToRelease(releaseIso) {
  if (!releaseIso) {
    console.warn('⚠️  SILKSONG_RELEASE_ISO not set, using 30plus as default');
    return 35; // 默认使用30plus
  }

  try {
    const releaseDate = new Date(releaseIso);
    const currentDate = new Date();
    
    if (isNaN(releaseDate.getTime())) {
      throw new Error('Invalid date format');
    }

    const timeDiff = releaseDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    console.log(`📅 Release date: ${releaseDate.toISOString().split('T')[0]}`);
    console.log(`📅 Current date: ${currentDate.toISOString().split('T')[0]}`);
    console.log(`⏰ Days to release: ${daysDiff}`);
    
    return daysDiff;
  } catch (error) {
    console.error(`❌ Error parsing release date: ${error.message}`);
    console.warn('⚠️  Using 30plus as fallback');
    return 35; // 默认使用30plus
  }
}

/**
 * 根据天数选择对应的OG图片类型
 * @param {number} daysToRelease - 距离发布的天数
 * @returns {string} OG图片类型
 */
function selectOgType(daysToRelease) {
  if (daysToRelease < 0) {
    return 'released';
  } else if (daysToRelease < 7) {
    return 'lt7';
  } else if (daysToRelease < 30) {
    return 'lt30';
  } else {
    return '30plus';
  }
}

/**
 * 复制选定的OG图片到current.png
 * @param {string} ogType - OG图片类型
 */
async function copyOgImage(ogType) {
  const sourceFileName = OG_FILE_MAP[ogType];
  const sourcePath = path.join(OG_SOURCE_DIR, sourceFileName);
  
  try {
    // 检查源文件是否存在
    await fs.access(sourcePath);
    
    // 复制文件
    await fs.copyFile(sourcePath, OG_TARGET_PATH);
    
    console.log(`✅ Successfully copied ${sourceFileName} to current.png`);
    console.log(`📁 Target: ${OG_TARGET_PATH}`);
    
    // 验证复制结果
    const stats = await fs.stat(OG_TARGET_PATH);
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`❌ Source file not found: ${sourcePath}`);
      console.error('📝 Make sure to create the following OG images:');
      Object.values(OG_FILE_MAP).forEach(file => {
        console.error(`   - public/og/${file}`);
      });
    } else {
      console.error(`❌ Error copying file: ${error.message}`);
    }
    
    console.error('🚫 Build failed due to missing OG image');
    process.exit(1);
  }
}

/**
 * 确保OG目录存在
 */
async function ensureOgDirectory() {
  try {
    await fs.access(OG_SOURCE_DIR);
    console.log(`📁 OG directory exists: ${OG_SOURCE_DIR}`);
  } catch (error) {
    console.log(`📁 Creating OG directory: ${OG_SOURCE_DIR}`);
    await fs.mkdir(OG_SOURCE_DIR, { recursive: true });
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🎨 Selecting OG image based on release date...');
  console.log('================================================');
  
  try {
    // 确保目录存在
    await ensureOgDirectory();
    
    // 获取环境变量
    const releaseIso = process.env.SILKSONG_RELEASE_ISO;
    
    // 计算天数
    const daysToRelease = calculateDaysToRelease(releaseIso);
    
    // 选择OG类型
    const ogType = selectOgType(daysToRelease);
    
    console.log(`🎯 Selected OG type: ${ogType}`);
    console.log(`📷 Using image: ${OG_FILE_MAP[ogType]}`);
    
    // 复制图片
    await copyOgImage(ogType);
    
    console.log('================================================');
    console.log('🎉 OG image selection completed successfully!');
    
  } catch (error) {
    console.error('================================================');
    console.error(`❌ Fatal error: ${error.message}`);
    console.error('🚫 OG image selection failed');
    process.exit(1);
  }
}

// 如果直接运行此脚本 (Windows兼容性修复)
const isMainModule = process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`;
if (isMainModule || (process.argv[1] && process.argv[1].includes('select-og-current.mjs'))) {
  main().catch(console.error);
}

export { selectOgType, calculateDaysToRelease, copyOgImage };