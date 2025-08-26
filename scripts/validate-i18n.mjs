#!/usr/bin/env node

/**
 * I18n Translation Validation Script (PRD Day3)
 * 
 * This script validates i18n translation files according to PRD Day3 requirements:
 * 
 * 1. Base File: Uses en.json as the reference for all required keys
 * 2. Missing Check: zh.json missing any en.json key → build fails
 * 3. Extra Check: zh.json has keys not in en.json → console warn (no failure)
 * 4. Empty Value Check: empty string values → build fails (no placeholders allowed)
 * 5. Nested Support: supports recursive validation of nested object structures
 * 
 * Technical Requirements:
 * - ES Module (.mjs)
 * - Supports nested object structures
 * - Detailed error reporting (shows specific missing key paths)
 * - Exit codes: success 0, failure 1
 * - Integrated into package.json scripts
 * 
 * Usage: npm run validate:i18n
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const i18nDir = path.join(rootDir, 'i18n');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function getAllKeys(obj, prefix = '') {
  const keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

function getEmptyValues(obj, prefix = '') {
  const emptyKeys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      emptyKeys.push(...getEmptyValues(value, fullKey));
    } else if (typeof value === 'string' && value.trim() === '') {
      emptyKeys.push(fullKey);
    }
  }
  
  return emptyKeys;
}

function getMissingKeys(baseKeys, targetKeys) {
  return baseKeys.filter(key => !targetKeys.includes(key));
}

function getExtraKeys(baseKeys, targetKeys) {
  return targetKeys.filter(key => !baseKeys.includes(key));
}

async function loadTranslationFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load ${filePath}: ${error.message}`);
  }
}

async function validateTranslations() {
  console.log(colorize('✓ Loading language files...', 'green'));
  
  try {
    // Load base translation (English)
    const baseFile = path.join(i18nDir, 'en.json');
    const baseTranslations = await loadTranslationFile(baseFile);
    const baseKeys = getAllKeys(baseTranslations).sort();
    
    // Get all translation files
    const files = await fs.readdir(i18nDir);
    const translationFiles = files.filter(file => 
      file.endsWith('.json') && file !== 'en.json'
    );
    
    if (translationFiles.length === 0) {
      console.log(colorize('⚠️  No additional translation files found', 'yellow'));
      return true;
    }
    
    let allValid = true;
    let totalMissingKeys = 0;
    let totalEmptyValues = 0;
    
    // Validate each translation file
    for (const file of translationFiles) {
      const locale = path.basename(file, '.json');
      const filePath = path.join(i18nDir, file);
      
      console.log(colorize(`✓ Validating ${file} against en.json...`, 'green'));
      
      try {
        const translations = await loadTranslationFile(filePath);
        const keys = getAllKeys(translations).sort();
        const emptyKeys = getEmptyValues(translations);
        
        const missingKeys = getMissingKeys(baseKeys, keys);
        const extraKeys = getExtraKeys(baseKeys, keys);
        
        // Check for missing keys
        if (missingKeys.length > 0) {
          console.log(colorize(`✗ Missing keys in ${file}:`, 'red'));
          missingKeys.forEach(key => {
            console.log(colorize(`  - ${key}`, 'red'));
          });
          allValid = false;
          totalMissingKeys += missingKeys.length;
        }
        
        // Check for empty values
        if (emptyKeys.length > 0) {
          console.log(colorize(`✗ Empty values in ${file}:`, 'red'));
          emptyKeys.forEach(key => {
            console.log(colorize(`  - ${key}`, 'red'));
          });
          allValid = false;
          totalEmptyValues += emptyKeys.length;
        }
        
        // Warn about extra keys (non-failing)
        if (extraKeys.length > 0) {
          console.log(colorize(`✓ Found extra keys in ${file} (warnings):`, 'yellow'));
          extraKeys.forEach(key => {
            console.log(colorize(`  - ${key}`, 'yellow'));
          });
        }
        
      } catch (error) {
        console.log(colorize(`✗ ${file}: Error - ${error.message}`, 'red'));
        allValid = false;
      }
    }
    
    // Final validation result
    if (allValid) {
      console.log(colorize('✓ All translations are valid!', 'green'));
    } else {
      let errorMessage = `✗ Validation failed with ${totalMissingKeys} missing keys`;
      if (totalEmptyValues > 0) {
        errorMessage += ` and ${totalEmptyValues} empty values`;
      }
      console.log(colorize(errorMessage, 'red'));
    }
    
    return allValid;
    
  } catch (error) {
    console.log(colorize(`✗ Loading failed: ${error.message}`, 'red'));
    return false;
  }
}

// Run if called directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const isValid = await validateTranslations();
  process.exit(isValid ? 0 : 1);
}

export { validateTranslations };