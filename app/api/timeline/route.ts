/**
 * Timeline API Route - PRD Day 3 Implementation
 * Returns timeline events as JSON array with strict UTC ISO8601 validation
 */

import { NextRequest, NextResponse } from 'next/server';
import timelineData from '@/data/timeline.json';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: string;
  source: string;
  category: string;
}

/**
 * Validates UTC ISO8601 format using exact regex from PRD specifications
 * Must match: YYYY-MM-DDTHH:mm:ss[.sss](Z|±HH:MM)
 */
function isValidUtcIso8601(dateString: string): boolean {
  const utcIso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+\-]\d{2}:\d{2})$/;
  
  if (!utcIso8601Regex.test(dateString)) {
    return false;
  }
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * GET /api/timeline - Returns timeline events as JSON array
 * Query parameters:
 * - after: UTC ISO8601 timestamp with timezone (Z or ±HH:MM), returns events before this date
 * - limit: number of events (default: 20, min: 1, max: 50, clamped without error)
 * 
 * Response: JSON array of timeline events, sorted by date descending (newest first)
 * Error: {"error": "invalid_after"} for malformed after parameter
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const afterParam = searchParams.get('after');
  const limitParam = searchParams.get('limit');

  // Process limit parameter - clamp to [1, 50] range, default 20
  let limit = 20;
  if (limitParam !== null) {
    const parsedLimit = parseInt(limitParam, 10);
    if (!isNaN(parsedLimit)) {
      limit = Math.max(1, Math.min(50, parsedLimit));
    }
  }

  // Validate after parameter if provided
  let afterDate: Date | null = null;
  if (afterParam !== null) {
    if (!isValidUtcIso8601(afterParam)) {
      return NextResponse.json(
        { error: 'invalid_after' },
        { status: 400 }
      );
    }
    afterDate = new Date(afterParam);
  }

  try {
    // Sort events by date in descending order (newest first)
    const sortedEvents = [...timelineData].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Filter events that occurred before the 'after' date if provided
    let filteredEvents = sortedEvents;
    if (afterDate) {
      filteredEvents = sortedEvents.filter(event => {
        return new Date(event.date).getTime() < afterDate!.getTime();
      });
    }

    // Apply limit and return as JSON array (not object with metadata)
    const limitedEvents = filteredEvents.slice(0, limit);

    return NextResponse.json(limitedEvents, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Timeline API error:', error);
    return NextResponse.json(
      { error: 'internal_server_error' },
      { status: 500 }
    );
  }
}