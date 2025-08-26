/**
 * Silksong Status API Route
 * Provides game release status information including countdown and timeline data
 * Implements ETag caching and proper error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Types for the status response
interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  type: string;
  source: string;
  category: string;
}

interface StatusResponse {
  releaseDate: string;
  serverTime: string;
  isReleased: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  totalSecondsRemaining: number;
  lastTimelineUpdate: string;
  timelineItems: TimelineItem[];
  version: string;
  hash: string;
}

// Cache for timeline data to avoid repeated file reads
let timelineCache: {
  data: TimelineItem[];
  lastModified: number;
  etag: string;
} | null = null;

/**
 * Load and cache timeline data
 */
async function loadTimelineData(): Promise<{ data: TimelineItem[]; etag: string }> {
  try {
    const timelineFilePath = path.join(process.cwd(), 'data', 'timeline.json');
    const stats = await fs.stat(timelineFilePath);
    const lastModified = stats.mtime.getTime();

    // Check if cache is still valid
    if (timelineCache && timelineCache.lastModified >= lastModified) {
      return {
        data: timelineCache.data,
        etag: timelineCache.etag,
      };
    }

    // Load fresh data
    const timelineContent = await fs.readFile(timelineFilePath, 'utf-8');
    const timelineData = JSON.parse(timelineContent) as TimelineItem[];

    // Generate ETag based on content and modification time
    const etag = crypto
      .createHash('md5')
      .update(`${timelineContent}-${lastModified}`)
      .digest('hex');

    // Update cache
    timelineCache = {
      data: timelineData,
      lastModified,
      etag,
    };

    return { data: timelineData, etag };
  } catch (error) {
    throw new Error('Failed to load timeline data');
  }
}

/**
 * Calculate time remaining until release
 */
function calculateTimeRemaining(releaseDate: Date, currentTime: Date) {
  const timeDifference = releaseDate.getTime() - currentTime.getTime();
  
  if (timeDifference <= 0) {
    return {
      isReleased: true,
      daysRemaining: 0,
      hoursRemaining: 0,
      totalSecondsRemaining: 0,
    };
  }

  const totalSecondsRemaining = Math.floor(timeDifference / 1000);
  const daysRemaining = Math.floor(totalSecondsRemaining / (24 * 60 * 60));
  const hoursRemaining = Math.floor((totalSecondsRemaining % (24 * 60 * 60)) / (60 * 60));

  return {
    isReleased: false,
    daysRemaining,
    hoursRemaining,
    totalSecondsRemaining,
  };
}

/**
 * GET /api/status - Get game release status
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Load timeline data with caching
    const { data: timelineItems, etag } = await loadTimelineData();

    // Check if timeline data exists
    if (!timelineItems || timelineItems.length === 0) {
      return NextResponse.json(
        { error: 'Timeline data not available' },
        { status: 500 }
      );
    }

    // Check ETag for client caching
    const clientETag = request.headers.get('if-none-match');
    if (clientETag === `"${etag}"`) {
      return new NextResponse(null, { status: 304 });
    }

    // Configuration for release date (September 4, 2025 at 14:00:00 UTC)
    const releaseDate = new Date('2025-09-04T14:00:00Z');
    const serverTime = new Date();

    // Calculate time remaining
    const timeCalculation = calculateTimeRemaining(releaseDate, serverTime);

    // Find the most recent timeline update
    const sortedTimeline = timelineItems
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastTimelineUpdate = sortedTimeline[0]?.date || serverTime.toISOString();

    // Generate content hash for versioning
    const contentHash = crypto
      .createHash('md5')
      .update(JSON.stringify({
        timelineItems: timelineItems.length,
        releaseDate: releaseDate.toISOString(),
        lastUpdate: lastTimelineUpdate,
      }))
      .digest('hex')
      .substring(0, 8);

    // Build response
    const statusResponse: StatusResponse = {
      releaseDate: releaseDate.toISOString(),
      serverTime: serverTime.toISOString(),
      isReleased: timeCalculation.isReleased,
      daysRemaining: timeCalculation.daysRemaining,
      hoursRemaining: timeCalculation.hoursRemaining,
      totalSecondsRemaining: timeCalculation.totalSecondsRemaining,
      lastTimelineUpdate,
      timelineItems,
      version: '1.0.0',
      hash: contentHash,
    };

    return NextResponse.json(statusResponse, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'ETag': `"${etag}"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/status:', error);

    // Return specific error for timeline issues
    if (error instanceof Error && error.message.includes('timeline')) {
      return NextResponse.json(
        { error: 'Timeline data not available' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle other HTTP methods with 405 Method Not Allowed
 */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        'Allow': 'GET',
      },
    }
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        'Allow': 'GET',
      },
    }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        'Allow': 'GET',
      },
    }
  );
}

export async function PATCH(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        'Allow': 'GET',
      },
    }
  );
}