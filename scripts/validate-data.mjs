#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

// Helper function to validate HTTPS URLs
function isHttpsUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// Helper function to read and parse JSON file
function readJsonFile(filename) {
  const filepath = path.join(dataDir, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filename}`);
  }
  
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse JSON in ${filename}: ${error.message}`);
  }
}

// Validation functions
function validateDifferences(data) {
  console.log('Validating differences.json...');
  
  if (!Array.isArray(data)) {
    throw new Error('differences.json must be an array');
  }
  
  if (data.length < 15) {
    throw new Error(`differences.json must have at least 15 items, found ${data.length}`);
  }
  
  const dimensions = new Set();
  const validStatuses = ['confirmed', 'hinted', 'tba'];
  
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const prefix = `differences.json[${i}]`;
    
    // Required fields
    if (!item.dimension || typeof item.dimension !== 'string') {
      throw new Error(`${prefix}: missing or invalid 'dimension' field`);
    }
    
    if (!item.hk || typeof item.hk !== 'string') {
      throw new Error(`${prefix}: missing or invalid 'hk' field`);
    }
    
    if (!item.ss || typeof item.ss !== 'string') {
      throw new Error(`${prefix}: missing or invalid 'ss' field`);
    }
    
    // Check for duplicate dimensions
    if (dimensions.has(item.dimension)) {
      throw new Error(`${prefix}: duplicate dimension '${item.dimension}'`);
    }
    dimensions.add(item.dimension);
    
    // Validate status
    if (!validStatuses.includes(item.status)) {
      throw new Error(`${prefix}: invalid status '${item.status}', must be one of: ${validStatuses.join(', ')}`);
    }
    
    // Validate source rules
    if (item.status === 'tba') {
      if (item.source !== null) {
        throw new Error(`${prefix}: status 'tba' must have source set to null`);
      }
    } else {
      // status is 'confirmed' or 'hinted'
      if (!item.source || typeof item.source !== 'object') {
        throw new Error(`${prefix}: status '${item.status}' must have a valid source object`);
      }
      
      if (!item.source.label || typeof item.source.label !== 'string') {
        throw new Error(`${prefix}: source must have a valid 'label' field`);
      }
      
      if (!item.source.url || !isHttpsUrl(item.source.url)) {
        throw new Error(`${prefix}: source must have a valid HTTPS URL`);
      }
    }
  }
  
  console.log(`✅ differences.json: ${data.length} items validated`);
}

function validatePlatforms(data) {
  console.log('Validating platforms.json...');
  
  if (!Array.isArray(data)) {
    throw new Error('platforms.json must be an array');
  }
  
  if (data.length < 10) {
    throw new Error(`platforms.json must have at least 10 items, found ${data.length}`);
  }
  
  const validStatuses = ['confirmed', 'tba', 'unannounced'];
  const requiredPlatforms = ['Steam', 'PlayStation', 'Xbox', 'Switch', 'Game Pass'];
  const foundPlatforms = new Set();
  
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const prefix = `platforms.json[${i}]`;
    
    // Required fields
    if (!item.platform || typeof item.platform !== 'string') {
      throw new Error(`${prefix}: missing or invalid 'platform' field`);
    }
    
    // Track found platforms for requirement check
    requiredPlatforms.forEach(required => {
      if (item.platform.toLowerCase().includes(required.toLowerCase())) {
        foundPlatforms.add(required);
      }
    });
    
    // Validate status
    if (!validStatuses.includes(item.status)) {
      throw new Error(`${prefix}: invalid status '${item.status}', must be one of: ${validStatuses.join(', ')}`);
    }
    
    // Validate source rules
    if (item.status === 'confirmed') {
      if (!item.source || typeof item.source !== 'object') {
        throw new Error(`${prefix}: status 'confirmed' must have a valid source object`);
      }
      
      if (!item.source.label || typeof item.source.label !== 'string') {
        throw new Error(`${prefix}: source must have a valid 'label' field`);
      }
      
      if (!item.source.url || !isHttpsUrl(item.source.url)) {
        throw new Error(`${prefix}: source must have a valid HTTPS URL`);
      }
    }
    
    // Optional fields validation
    if (item.notes && typeof item.notes !== 'string') {
      throw new Error(`${prefix}: 'notes' field must be a string if present`);
    }
  }
  
  // Check if all required platforms are represented
  const missingPlatforms = requiredPlatforms.filter(required => !foundPlatforms.has(required));
  if (missingPlatforms.length > 0) {
    console.warn(`⚠️ Missing recommended platforms: ${missingPlatforms.join(', ')}`);
  }
  
  console.log(`✅ platforms.json: ${data.length} items validated`);
}

function validateFaqs(data) {
  console.log('Validating faqs.json...');
  
  if (!Array.isArray(data)) {
    throw new Error('faqs.json must be an array');
  }
  
  if (data.length < 5) {
    throw new Error(`faqs.json must have at least 5 items, found ${data.length}`);
  }
  
  let hasGamePassFaq = false;
  
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const prefix = `faqs.json[${i}]`;
    
    // Required fields
    if (!item.q || typeof item.q !== 'string') {
      throw new Error(`${prefix}: missing or invalid 'q' field`);
    }
    
    if (!item.a || typeof item.a !== 'string') {
      throw new Error(`${prefix}: missing or invalid 'a' field`);
    }
    
    // Check for HTML tags (should be plain text)
    if (item.q.includes('<') || item.q.includes('>')) {
      throw new Error(`${prefix}: question contains HTML tags, should be plain text`);
    }
    
    if (item.a.includes('<') || item.a.includes('>')) {
      throw new Error(`${prefix}: answer contains HTML tags, should be plain text`);
    }
    
    // Check for Game Pass FAQ
    if (item.q.toLowerCase().includes('game pass') || item.a.toLowerCase().includes('game pass')) {
      hasGamePassFaq = true;
    }
  }
  
  if (!hasGamePassFaq) {
    throw new Error('faqs.json must include at least one Game Pass related question');
  }
  
  console.log(`✅ faqs.json: ${data.length} items validated`);
}

function validateDifferencesUnconfirmed(data) {
  console.log('Validating differences-unconfirmed.json...');
  
  if (!Array.isArray(data)) {
    throw new Error('differences-unconfirmed.json must be an array');
  }
  
  const forbiddenWords = ['confirmed', 'official', 'guaranteed'];
  
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const prefix = `differences-unconfirmed.json[${i}]`;
    
    // Required fields
    if (!item.expectation || typeof item.expectation !== 'string') {
      throw new Error(`${prefix}: missing or invalid 'expectation' field`);
    }
    
    if (!item.rationale || typeof item.rationale !== 'string') {
      throw new Error(`${prefix}: missing or invalid 'rationale' field`);
    }
    
    // Status must be 'unconfirmed'
    if (item.status !== 'unconfirmed') {
      throw new Error(`${prefix}: status must be 'unconfirmed', found '${item.status}'`);
    }
    
    // Check for forbidden words
    const fullText = (item.expectation + ' ' + item.rationale + ' ' + (item.note || '')).toLowerCase();
    for (const word of forbiddenWords) {
      if (fullText.includes(word)) {
        throw new Error(`${prefix}: contains forbidden word '${word}' - unconfirmed items must not suggest certainty`);
      }
    }
    
    // Optional note field validation
    if (item.note && typeof item.note !== 'string') {
      throw new Error(`${prefix}: 'note' field must be a string if present`);
    }
  }
  
  console.log(`✅ differences-unconfirmed.json: ${data.length} items validated`);
}

// Main validation function
function validateAllData() {
  console.log('🔍 Starting data validation...\n');
  
  try {
    // Validate differences.json
    const differences = readJsonFile('differences.json');
    validateDifferences(differences);
    console.log('');
    
    // Validate platforms.json
    const platforms = readJsonFile('platforms.json');
    validatePlatforms(platforms);
    console.log('');
    
    // Validate faqs.json
    const faqs = readJsonFile('faqs.json');
    validateFaqs(faqs);
    console.log('');
    
    // Validate differences-unconfirmed.json
    const differencesUnconfirmed = readJsonFile('differences-unconfirmed.json');
    validateDifferencesUnconfirmed(differencesUnconfirmed);
    console.log('');
    
    console.log('✅ All data files validated successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

// Run validation if this script is executed directly
if (process.argv[1] === __filename) {
  validateAllData();
}

export { validateAllData };