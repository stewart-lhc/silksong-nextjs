/**
 * Newsletter Kit - Email Templates
 * Template system for newsletter emails
 */

export * from './default-templates';
export * from './file-loader';

import type { EmailTemplate, EmailTemplateData, RenderedTemplate } from '../types';
import { renderTemplateWithMixedPlaceholders } from './file-loader';

// ========================= TEMPLATE UTILITIES =========================
export function validateTemplate(template: EmailTemplate): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!template.id) errors.push('Template ID is required');
  if (!template.name) errors.push('Template name is required');
  if (!template.subject) errors.push('Template subject is required');
  if (!template.htmlTemplate) errors.push('Template HTML is required');

  // Validate variables
  template.variables.forEach((variable, index) => {
    if (!variable.name) errors.push(`Variable ${index} is missing name`);
    if (!variable.type) errors.push(`Variable ${index} is missing type`);
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function extractTemplateVariables(htmlTemplate: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(htmlTemplate)) !== null) {
    const variable = match[1].trim();
    if (!variables.includes(variable)) {
      variables.push(variable);
    }
  }

  return variables;
}

export function previewTemplate(template: EmailTemplate, sampleData?: EmailTemplateData): string {
  const defaultData = template.variables.reduce((acc, variable) => {
    acc[variable.name] = variable.defaultValue || `[${variable.name}]`;
    return acc;
  }, {} as EmailTemplateData);

  const data = { ...defaultData, ...sampleData };
  
  return renderTemplate(template.htmlTemplate, data);
}

export function renderTemplate(template: string, data: EmailTemplateData): string {
  // Use enhanced renderer that handles both {{}} and {} placeholder formats
  return renderTemplateWithMixedPlaceholders(template, data);
}