/**
 * Log API Route
 * Handles POST requests for logging performance and embed data
 */

import { NextRequest, NextResponse } from 'next/server';
import { env, logging } from '@/lib/env';
import * as fs from 'fs';
import * as path from 'path';

interface LogPayload {
  type: 'perf' | 'embed';
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  type: string;
  payload: LogPayload;
}

/**
 * Maximum allowed body size in bytes (5120 bytes = 5KB)
 */
const MAX_BODY_SIZE = 5120;

/**
 * Sensitive words that are not allowed in the payload
 */
const SENSITIVE_WORDS = ['email', 'useragent', 'user_agent', 'ua'];

/**
 * Validates if the log type is allowed
 */
function isValidLogType(type: any): type is 'perf' | 'embed' {
  return type === 'perf' || type === 'embed';
}

/**
 * Checks if payload contains sensitive words (case-insensitive)
 * Searches through all keys and values recursively
 */
function containsSensitiveWords(payload: any): boolean {
  function searchObject(obj: any): boolean {
    if (typeof obj === 'string') {
      return SENSITIVE_WORDS.some(word => obj.toLowerCase().includes(word));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      // Check object keys
      for (const key of Object.keys(obj)) {
        if (SENSITIVE_WORDS.some(word => key.toLowerCase().includes(word))) {
          return true;
        }
        // Recursively check values
        if (searchObject(obj[key])) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  return searchObject(payload);
}

/**
 * Gets the current date in YYYYMMDD format for log file naming
 */
function getCurrentDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Appends log entry to ephemeral storage (NDJSON file)
 * Uses atomic write operations for safety
 */
async function writeToEphemeralStorage(logEntry: LogEntry): Promise<void> {
  try {
    const dateString = getCurrentDateString();
    const filename = `logs-${dateString}.ndjson`;
    const logPath = path.join(process.cwd(), 'data', filename);
    
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const logLine = JSON.stringify(logEntry) + '\n';
    
    // Use atomic append operation
    fs.appendFileSync(logPath, logLine, { encoding: 'utf8', flag: 'a' });
  } catch (error) {
    console.error('Failed to write to ephemeral storage:', error);
    // Re-throw to trigger server_error response as per PRD
    throw error;
  }
}

/**
 * POST /api/log - Log performance or embed data
 * Body: JSON payload with type field and additional data
 * Constraints:
 * - Body size <= 5120 bytes
 * - type must be 'perf' or 'embed'
 * - payload must not contain sensitive words
 * - If ENABLE_LOGGING != 'true', return 204 and ignore
 * - If LOG_STORAGE_MODE = 'ephemeral', write to /data/logs-YYYYMMDD.ndjson
 */
export async function POST(request: NextRequest) {
  try {
    // Early return if logging is disabled
    if (!logging.enabled) {
      return new NextResponse(null, { status: 204 });
    }

    // Check Content-Length header first for efficiency
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: 'payload_too_large' },
        { status: 400 }
      );
    }

    // Read and validate body size
    const body = await request.text();
    const bodySize = Buffer.byteLength(body, 'utf8');
    
    if (bodySize > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: 'payload_too_large' },
        { status: 400 }
      );
    }

    // Parse JSON payload
    let payload: LogPayload;
    try {
      payload = JSON.parse(body);
    } catch (error) {
      return NextResponse.json(
        { error: 'invalid_json' },
        { status: 400 }
      );
    }

    // Validate required type field
    if (!payload.type || !isValidLogType(payload.type)) {
      return NextResponse.json(
        { error: 'invalid_type' },
        { status: 400 }
      );
    }

    // Check for sensitive words in payload
    if (containsSensitiveWords(payload)) {
      return NextResponse.json(
        { error: 'forbidden_key' },
        { status: 400 }
      );
    }

    // Process logging based on storage mode
    if (logging.storageMode === 'ephemeral') {
      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        type: payload.type,
        payload: payload
      };

      await writeToEphemeralStorage(logEntry);
    }
    // For other storage modes (persistent, file), we would implement
    // different storage strategies here, but ephemeral is the main requirement

    // Return 204 No Content on success
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('Log API error:', error);
    
    // Return proper server error as per PRD specification
    return NextResponse.json(
      { error: 'server_error' },
      { status: 500 }
    );
  }
}

/**
 * Handle unsupported methods
 */
export async function GET() {
  return NextResponse.json(
    { error: 'method_not_allowed' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'method_not_allowed' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'method_not_allowed' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'method_not_allowed' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}