/**
 * Differences API Route
 * Returns differences between Hollow Knight and Silksong with filtering and grouping capabilities
 */

import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import differencesData from '@/data/differences.json';
import differencesUnconfirmedData from '@/data/differences-unconfirmed.json';

interface DifferenceItem {
  dimension: string;
  hk: string;
  ss: string;
  status: 'confirmed' | 'hinted' | 'speculated';
  source: {
    label: string;
    url: string;
  };
  group?: string;
}

interface UnconfirmedItem {
  expectation: string;
  rationale: string;
  status: 'unconfirmed';
  note?: string;
  group?: string;
}

interface DifferencesApiResponse {
  differences: (DifferenceItem | UnconfirmedItem)[];
  updated: string;
  total: number;
  status_filter?: string[];
  format?: string;
}

interface GroupedDifferencesApiResponse {
  groups: Record<string, (DifferenceItem | UnconfirmedItem)[]>;
  updated: string;
  total: number;
  status_filter?: string[];
  format: 'grouped';
}

/**
 * Gets the maximum modification time from the two differences files
 */
function getUpdatedTimestamp(): string {
  try {
    const differencesPath = path.join(process.cwd(), 'data', 'differences.json');
    const unconfirmedPath = path.join(process.cwd(), 'data', 'differences-unconfirmed.json');
    
    const differencesStats = fs.statSync(differencesPath);
    const unconfirmedStats = fs.statSync(unconfirmedPath);
    
    const maxTime = Math.max(differencesStats.mtime.getTime(), unconfirmedStats.mtime.getTime());
    return new Date(maxTime).toISOString();
  } catch (error) {
    console.error('Error getting file modification times:', error);
    return new Date().toISOString();
  }
}

/**
 * Validates and filters status values
 */
function processStatusFilter(statusParam: string | null): string[] | null {
  if (!statusParam) return null;
  
  const validStatuses = new Set(['confirmed', 'hinted', 'speculated', 'unconfirmed']);
  const statusList = statusParam.split(',')
    .map(s => s.trim().toLowerCase())
    .filter(s => validStatuses.has(s));
  
  // Remove duplicates by converting to Set and back to Array
  return [...new Set(statusList)];
}

/**
 * Groups items by their group property, only including groups that actually appear
 */
function groupItems(items: (DifferenceItem | UnconfirmedItem)[]): Record<string, (DifferenceItem | UnconfirmedItem)[]> {
  const grouped: Record<string, (DifferenceItem | UnconfirmedItem)[]> = {};
  
  items.forEach(item => {
    const group = item.group || 'uncategorized';
    if (!grouped[group]) {
      grouped[group] = [];
    }
    grouped[group].push(item);
  });
  
  return grouped;
}

/**
 * GET /api/differences - Returns differences between HK and Silksong
 * Query parameters:
 * - status: comma-separated list of status values to filter by
 * - format: 'grouped' for grouped response format
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status');
  const formatParam = searchParams.get('format');

  try {
    // Process status filter
    const statusFilter = processStatusFilter(statusParam);

    // Combine all data
    const allDifferences = [
      ...(differencesData as DifferenceItem[]),
      ...(differencesUnconfirmedData as UnconfirmedItem[])
    ];

    // Apply status filter if provided and non-empty
    let filteredDifferences = allDifferences;
    if (statusFilter && statusFilter.length > 0) {
      filteredDifferences = allDifferences.filter(item => 
        statusFilter.includes(item.status)
      );
    }

    const updated = getUpdatedTimestamp();

    // Handle grouped format
    if (formatParam === 'grouped') {
      const grouped = groupItems(filteredDifferences);
      
      const response: GroupedDifferencesApiResponse = {
        groups: grouped,
        updated,
        total: filteredDifferences.length,
        format: 'grouped',
        ...(statusFilter && { status_filter: statusFilter })
      };

      return NextResponse.json(response, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        },
      });
    }

    // Default flat format
    const response: DifferencesApiResponse = {
      differences: filteredDifferences,
      updated,
      total: filteredDifferences.length,
      ...(statusFilter && { status_filter: statusFilter }),
      ...(formatParam && { format: formatParam })
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    });

  } catch (error) {
    console.error('Differences API error:', error);
    return NextResponse.json(
      { error: 'internal_server_error' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        }
      }
    );
  }
}