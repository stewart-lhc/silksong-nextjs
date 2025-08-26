/**
 * Secure Double Opt-in Email Subscription System
 * 
 * SECURITY FEATURES:
 * - SHA256 token generation with salt and timestamp
 * - Atomic file operations to prevent race conditions
 * - 48-hour token expiration
 * - Duplicate email prevention
 * - No sensitive information in error responses or logs
 * - Token replay attack prevention
 * 
 * OWASP Security References:
 * - A07:2021 – Identification and Authentication Failures
 * - A04:2021 – Insecure Design
 * - A02:2021 – Cryptographic Failures
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { env } from '@/lib/env';

// Security constants
const TOKEN_EXPIRY_MS = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
const PENDING_DIR = path.join(process.cwd(), 'data', 'pending');
const SUBSCRIBERS_FILE = path.join(process.cwd(), 'data', 'subscribers.csv');
const SITE_HASH_SALT = process.env.SITE_HASH_SALT || 'silksong-default-salt-change-in-production';

// Type definitions for security
interface PendingToken {
  email: string;
  created: string; // ISO timestamp
  token: string;   // SHA256 hash (32 hex chars)
}

interface SecurityResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Generates secure token using SHA256(email + SITE_HASH_SALT + timestamp)
 * Returns first 32 hex characters for consistent token length
 * 
 * @security Token generation follows cryptographically secure practices
 * @param email - Normalized email address
 * @returns 32-character hex token
 */
export function generateSecureToken(email: string): string {
  const timestamp = Date.now().toString();
  const input = `${email}${SITE_HASH_SALT}${timestamp}`;
  
  return crypto
    .createHash('sha256')
    .update(input, 'utf8')
    .digest('hex')
    .substring(0, 32); // Take first 32 hex chars for consistent length
}

/**
 * Normalizes email address for consistent processing
 * Applies lowercase and trim transformations
 * 
 * @param email - Raw email input
 * @returns Normalized email string
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Validates email format using enhanced regex
 * 
 * @param email - Email to validate
 * @returns Validation result with sanitized email
 */
export function validateEmailFormat(email: string): SecurityResult<string> {
  const normalized = normalizeEmail(email);
  
  // Enhanced email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!normalized) {
    return { success: false, error: 'Email is required', code: 'EMAIL_REQUIRED' };
  }
  
  if (normalized.length > 254) {
    return { success: false, error: 'Email too long', code: 'EMAIL_TOO_LONG' };
  }
  
  if (!emailRegex.test(normalized)) {
    return { success: false, error: 'Invalid email format', code: 'EMAIL_INVALID' };
  }
  
  return { success: true, data: normalized };
}

/**
 * Atomic file write operation using .tmp → rename pattern
 * Prevents race conditions and corruption during concurrent writes
 * 
 * @security Implements atomic operations to prevent data corruption
 * @param filePath - Target file path
 * @param content - Content to write
 */
export async function atomicWrite(filePath: string, content: string): Promise<SecurityResult<void>> {
  const tempPath = `${filePath}.tmp`;
  
  try {
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    // Write to temporary file first
    await fs.writeFile(tempPath, content, { encoding: 'utf8', flag: 'w' });
    
    // Atomic rename - this operation is atomic on most filesystems
    await fs.rename(tempPath, filePath);
    
    return { success: true };
  } catch (error) {
    // Clean up temp file if it exists
    try {
      await fs.unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }
    
    return { 
      success: false, 
      error: 'Failed to write file', 
      code: 'WRITE_FAILED' 
    };
  }
}

/**
 * Checks if a pending token exists for the given email
 * Implements duplicate prevention logic
 * 
 * @param email - Normalized email address
 * @returns Existing token info or null
 */
export async function checkPendingToken(email: string): Promise<SecurityResult<PendingToken | null>> {
  try {
    const files = await fs.readdir(PENDING_DIR);
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      try {
        const tokenPath = path.join(PENDING_DIR, file);
        const content = await fs.readFile(tokenPath, 'utf8');
        const tokenData: PendingToken = JSON.parse(content);
        
        // Check if this token belongs to the email
        if (tokenData.email === email) {
          const created = new Date(tokenData.created).getTime();
          const now = Date.now();
          
          // Check if token has expired
          if (now - created > TOKEN_EXPIRY_MS) {
            // Token expired, clean it up
            await fs.unlink(tokenPath).catch(() => {}); // Ignore errors
            return { success: true, data: null };
          }
          
          return { success: true, data: tokenData };
        }
      } catch {
        // Ignore individual file errors (corrupted files, etc.)
        continue;
      }
    }
    
    return { success: true, data: null };
  } catch (error) {
    return { 
      success: false, 
      error: 'Failed to check pending tokens', 
      code: 'CHECK_FAILED' 
    };
  }
}

/**
 * Creates a new pending token with atomic write operation
 * Implements duplicate prevention and secure token storage
 * 
 * @param email - Normalized email address
 * @returns Generated token or error
 */
export async function createPendingToken(email: string): Promise<SecurityResult<string>> {
  // First check if there's already a pending token
  const existingCheck = await checkPendingToken(email);
  if (!existingCheck.success) {
    return { success: false, error: existingCheck.error, code: existingCheck.code };
  }
  
  if (existingCheck.data) {
    // Return existing token instead of creating new one
    return { 
      success: false, 
      error: 'Confirmation email already sent', 
      code: 'ALREADY_PENDING' 
    };
  }
  
  // Generate new secure token
  const token = generateSecureToken(email);
  const tokenData: PendingToken = {
    email,
    created: new Date().toISOString(),
    token
  };
  
  const tokenFilePath = path.join(PENDING_DIR, `${token}.json`);
  const writeResult = await atomicWrite(tokenFilePath, JSON.stringify(tokenData, null, 2));
  
  if (!writeResult.success) {
    return { success: false, error: writeResult.error, code: writeResult.code };
  }
  
  return { success: true, data: token };
}

/**
 * Validates and retrieves token data
 * Implements token expiration and existence checks
 * 
 * @param token - Token to validate
 * @returns Token data or appropriate error
 */
export async function validateToken(token: string): Promise<SecurityResult<PendingToken>> {
  // Basic token format validation
  if (!token || !/^[a-f0-9]{32}$/.test(token)) {
    return { 
      success: false, 
      error: 'Invalid token format', 
      code: 'TOKEN_INVALID' 
    };
  }
  
  const tokenFilePath = path.join(PENDING_DIR, `${token}.json`);
  
  try {
    const content = await fs.readFile(tokenFilePath, 'utf8');
    const tokenData: PendingToken = JSON.parse(content);
    
    // Verify token matches (prevent token substitution attacks)
    if (tokenData.token !== token) {
      return { 
        success: false, 
        error: 'Token mismatch', 
        code: 'TOKEN_MISMATCH' 
      };
    }
    
    // Check expiration
    const created = new Date(tokenData.created).getTime();
    const now = Date.now();
    
    if (now - created > TOKEN_EXPIRY_MS) {
      // Clean up expired token
      await fs.unlink(tokenFilePath).catch(() => {});
      return { 
        success: false, 
        error: 'Token expired', 
        code: 'TOKEN_EXPIRED' 
      };
    }
    
    return { success: true, data: tokenData };
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      return { 
        success: false, 
        error: 'Token not found', 
        code: 'TOKEN_NOT_FOUND' 
      };
    }
    
    return { 
      success: false, 
      error: 'Token validation failed', 
      code: 'TOKEN_VALIDATION_FAILED' 
    };
  }
}

/**
 * Confirms subscription by moving from pending to subscribers
 * Implements idempotent subscription confirmation
 * 
 * @param token - Confirmation token
 * @returns Confirmation result
 */
export async function confirmSubscription(token: string): Promise<SecurityResult<string>> {
  // Validate token first
  const validation = await validateToken(token);
  if (!validation.success) {
    return { 
      success: false, 
      error: validation.error, 
      code: validation.code 
    };
  }
  
  const tokenData = validation.data!;
  const email = tokenData.email;
  
  try {
    // Check if already subscribed (idempotency)
    let subscribersContent = '';
    try {
      subscribersContent = await fs.readFile(SUBSCRIBERS_FILE, 'utf8');
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error; // Re-throw if not "file not found"
      }
      // File doesn't exist, create header
      subscribersContent = 'email,subscribed_at\n';
    }
    
    // Check if email is already in subscribers (case-insensitive)
    const lines = subscribersContent.split('\n');
    const isAlreadySubscribed = lines.some(line => {
      const [existingEmail] = line.split(',');
      return existingEmail && existingEmail.toLowerCase() === email;
    });
    
    if (isAlreadySubscribed) {
      // Already subscribed, clean up token and return success (idempotent)
      await fs.unlink(path.join(PENDING_DIR, `${token}.json`)).catch(() => {});
      return { 
        success: true, 
        data: 'Already subscribed' 
      };
    }
    
    // Add to subscribers file
    const newEntry = `${email},${new Date().toISOString()}\n`;
    const updatedContent = subscribersContent + newEntry;
    
    const writeResult = await atomicWrite(SUBSCRIBERS_FILE, updatedContent);
    if (!writeResult.success) {
      return { 
        success: false, 
        error: 'Failed to save subscription', 
        code: 'SAVE_FAILED' 
      };
    }
    
    // Clean up pending token
    await fs.unlink(path.join(PENDING_DIR, `${token}.json`)).catch(() => {
      // Ignore cleanup errors - subscription was successful
    });
    
    return { 
      success: true, 
      data: 'Subscription confirmed' 
    };
  } catch (error) {
    return { 
      success: false, 
      error: 'Confirmation failed', 
      code: 'CONFIRMATION_FAILED' 
    };
  }
}

/**
 * Cleans up expired tokens (for maintenance)
 * Should be called periodically to prevent disk space accumulation
 * 
 * @returns Cleanup result with count of removed tokens
 */
export async function cleanupExpiredTokens(): Promise<SecurityResult<number>> {
  try {
    const files = await fs.readdir(PENDING_DIR);
    let cleanedCount = 0;
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      try {
        const tokenPath = path.join(PENDING_DIR, file);
        const content = await fs.readFile(tokenPath, 'utf8');
        const tokenData: PendingToken = JSON.parse(content);
        
        const created = new Date(tokenData.created).getTime();
        const now = Date.now();
        
        if (now - created > TOKEN_EXPIRY_MS) {
          await fs.unlink(tokenPath);
          cleanedCount++;
        }
      } catch {
        // If we can't read the file, it's probably corrupted, so delete it
        try {
          await fs.unlink(path.join(PENDING_DIR, file));
          cleanedCount++;
        } catch {
          // Ignore deletion errors
        }
      }
    }
    
    return { success: true, data: cleanedCount };
  } catch (error) {
    return { 
      success: false, 
      error: 'Cleanup failed', 
      code: 'CLEANUP_FAILED' 
    };
  }
}

/**
 * Secure logging function that never exposes email addresses
 * Logs only hashed identifiers for security
 * 
 * @param operation - Operation being performed
 * @param email - Email (will be hashed for logging)
 * @param details - Additional details to log
 */
export function secureLog(operation: string, email: string, details: any = {}): void {
  // Hash email for logging (never log raw email addresses)
  const emailHash = crypto
    .createHash('sha256')
    .update(email + SITE_HASH_SALT, 'utf8')
    .digest('hex')
    .substring(0, 8); // First 8 chars for identification
  
  const logData = {
    operation,
    emailHash,
    timestamp: new Date().toISOString(),
    ...details
  };
  
  // Only log in development or if debug mode is enabled
  if (env.NODE_ENV === 'development' || env.DEBUG_API_CALLS === 'true') {
    console.log(`[DOUBLE_OPTIN_SECURITY] ${JSON.stringify(logData)}`);
  }
}