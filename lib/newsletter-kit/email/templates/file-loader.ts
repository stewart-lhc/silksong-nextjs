/**
 * Newsletter Kit - File Template Loader
 * Utilities for loading HTML templates from filesystem
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import type { EmailTemplate } from '../types';

/**
 * Load an HTML template from file system
 */
export function loadHtmlTemplate(filePath: string): string {
  try {
    const fullPath = join(process.cwd(), filePath);
    return readFileSync(fullPath, 'utf-8');
  } catch (error: any) {
    console.error(`Failed to load template from ${filePath}:`, error.message);
    throw new Error(`Template file not found: ${filePath}`);
  }
}

/**
 * Enhanced template renderer that handles both {{}} and {} placeholder formats
 */
export function renderTemplateWithMixedPlaceholders(template: string, data: Record<string, unknown>): string {
  let rendered = template;

  // Replace {{variable}} format (double braces)
  Object.entries(data).forEach(([key, value]) => {
    const doubleBraceRegex = new RegExp(`\\{\\{\\s*${escapeRegex(key)}\\s*\\}\\}`, 'g');
    rendered = rendered.replace(doubleBraceRegex, String(value ?? ''));
  });

  // Replace {variable} format (single braces)
  Object.entries(data).forEach(([key, value]) => {
    const singleBraceRegex = new RegExp(`\\{\\s*${escapeRegex(key)}\\s*\\}`, 'g');
    rendered = rendered.replace(singleBraceRegex, String(value ?? ''));
  });

  return rendered;
}

/**
 * Escape special regex characters in template variable names
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract all placeholder variables from template (both formats)
 */
export function extractAllPlaceholders(template: string): string[] {
  const placeholders: string[] = [];
  
  // Extract {{variable}} placeholders
  const doubleBraceRegex = /\{\{\s*([^}]+)\s*\}\}/g;
  let match;
  while ((match = doubleBraceRegex.exec(template)) !== null) {
    const variable = match[1].trim();
    if (!placeholders.includes(variable)) {
      placeholders.push(variable);
    }
  }
  
  // Extract {variable} placeholders
  const singleBraceRegex = /\{\s*([^}]+)\s*\}/g;
  while ((match = singleBraceRegex.exec(template)) !== null) {
    const variable = match[1].trim();
    if (!placeholders.includes(variable)) {
      placeholders.push(variable);
    }
  }
  
  return placeholders;
}

/**
 * Create an EmailTemplate from an HTML file
 */
export function createTemplateFromHtmlFile(
  id: string,
  name: string,
  subject: string,
  htmlFilePath: string,
  textTemplate?: string
): EmailTemplate {
  const htmlTemplate = loadHtmlTemplate(htmlFilePath);
  const variables = extractAllPlaceholders(htmlTemplate);
  
  // Map common Silksong template variables to their types
  const variableDefinitions = variables.map(varName => ({
    name: varName,
    type: getVariableType(varName),
    required: isRequiredVariable(varName),
    description: getVariableDescription(varName),
    defaultValue: getDefaultValue(varName),
  }));

  return {
    id,
    name,
    subject,
    htmlTemplate,
    textTemplate,
    variables: variableDefinitions,
    metadata: {
      description: `Template loaded from ${htmlFilePath}`,
      category: 'file-based',
      created_at: new Date().toISOString(),
    },
  };
}

/**
 * Determine variable type based on common naming patterns
 */
function getVariableType(varName: string): 'string' | 'number' | 'boolean' | 'date' | 'url' {
  const lowerName = varName.toLowerCase();
  
  if (lowerName.includes('url') || lowerName.includes('link')) return 'url';
  if (lowerName.includes('date') || lowerName.includes('year')) return 'date';
  if (lowerName.includes('count') || lowerName.includes('days') || lowerName === 'YEAR') return 'number';
  if (lowerName.includes('enabled') || lowerName.includes('active')) return 'boolean';
  
  return 'string';
}

/**
 * Determine if a variable is required
 */
function isRequiredVariable(varName: string): boolean {
  const requiredVars = [
    'URL_HOME', 'URL_UNSUBSCRIBE', 'TRACKING_PIXEL_URL'
  ];
  return requiredVars.includes(varName);
}

/**
 * Get variable description
 */
function getVariableDescription(varName: string): string {
  const descriptions: Record<string, string> = {
    'URL_HOME': 'Base URL of the website',
    'URL_COMPARE': 'URL to the comparison page',
    'URL_TIMELINE': 'URL to the timeline page',
    'URL_EMBED': 'URL to embed tools',
    'URL_CHECKLIST': 'URL to the checklist page',
    'URL_DOCS_API': 'URL to API documentation',
    'URL_EMBED_IFRAME': 'URL for countdown iframe embed',
    'DAYS_REMAINING': 'Number of days remaining until release',
    'URL_UNSUBSCRIBE': 'Unsubscribe URL',
    'TRACKING_PIXEL_URL': 'Tracking pixel URL for analytics',
    'YEAR': 'Current year',
  };
  
  return descriptions[varName] || `Template variable: ${varName}`;
}

/**
 * Get default value for variables
 */
function getDefaultValue(varName: string): unknown {
  const defaults: Record<string, unknown> = {
    'DAYS_REMAINING': 365,
    'YEAR': new Date().getFullYear(),
  };
  
  return defaults[varName];
}