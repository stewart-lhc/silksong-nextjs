/**
 * Server-compatible Email Validation Utilities
 * Can be used both in API routes and React components
 */

export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  error?: string;
}

export interface EmailValidationConfig {
  emailMaxLength: number;
  allowedDomains?: string[];
  blockedDomains?: string[];
  messages: {
    invalidEmail: string;
  };
}

/**
 * Enhanced validation with domain filtering
 * Server and client compatible
 */
export function validateAndSanitizeEmail(
  email: string, 
  config: EmailValidationConfig
): ValidationResult {
  const sanitized = email.trim().toLowerCase();
  
  if (!sanitized) {
    return { isValid: false, sanitized, error: config.messages.invalidEmail };
  }
  
  if (sanitized.length > config.emailMaxLength) {
    return { isValid: false, sanitized, error: 'Email is too long' };
  }
  
  // Enhanced email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(sanitized)) {
    return { isValid: false, sanitized, error: config.messages.invalidEmail };
  }
  
  // Check blocked domains
  const domain = sanitized.split('@')[1];
  if (config.blockedDomains?.includes(domain)) {
    return { isValid: false, sanitized, error: 'This email domain is not allowed' };
  }
  
  // Check allowed domains (if specified)
  if (config.allowedDomains?.length > 0 && 
      !config.allowedDomains.includes(domain)) {
    return { isValid: false, sanitized, error: 'This email domain is not allowed' };
  }
  
  return { isValid: true, sanitized };
}

/**
 * Simple email validation for basic use cases
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email.trim());
}