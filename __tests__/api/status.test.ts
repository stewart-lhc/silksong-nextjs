/**
 * API Route Tests: /api/status
 * Comprehensive testing for game status endpoint
 * Tests timeline data, caching, ETag handling, and time calculations
 */

import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE, PATCH } from '@/app/api/status/route';
import { promises as fs } from 'fs';

// Mock dependencies
jest.mock('fs', () => ({
  promises: {
    stat: jest.fn(),
    readFile: jest.fn()
  }
}));

const mockFs = fs as jest.Mocked<typeof fs>;

// Mock timeline data
const mockTimelineData = [
  {
    id: '1',
    date: '2024-12-01T00:00:00.000Z',
    title: 'Latest Update',
    description: 'Recent development update',
    type: 'announcement',
    source: 'official',
    category: 'development'
  },
  {
    id: '2',
    date: '2024-11-15T00:00:00.000Z',
    title: 'Previous Update',
    description: 'Earlier development update',
    type: 'news',
    source: 'official',
    category: 'news'
  }
];

// Test utilities
const createMockRequest = (headers: Record<string, string> = {}): NextRequest => {
  const request = {
    headers: new Map(Object.entries(headers)),
    url: 'http://localhost:3000/api/status'
  } as any;
  return request as NextRequest;
};

// Mock date for consistent testing
const MOCK_CURRENT_DATE = '2025-01-01T12:00:00.000Z';
const MOCK_RELEASE_DATE = '2025-09-04T14:00:00.000Z';

describe('/api/status API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock current date
    jest.useFakeTimers();
    jest.setSystemTime(new Date(MOCK_CURRENT_DATE));
    
    // Setup default successful file system mocks
    mockFs.stat.mockResolvedValue({
      mtime: new Date('2024-12-01T00:00:00.000Z')
    } as any);
    
    mockFs.readFile.mockResolvedValue(JSON.stringify(mockTimelineData));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('GET /api/status', () => {
    describe('Successful Responses', () => {
      it('should return complete status information', async () => {
        const response = await GET(createMockRequest());
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.releaseDate).toBe(MOCK_RELEASE_DATE);
        expect(data.serverTime).toBe(MOCK_CURRENT_DATE);
        expect(data.isReleased).toBe(false);
        expect(data.timelineItems).toHaveLength(2);
        expect(data.timelineItems).toEqual(mockTimelineData);
        expect(data.version).toBe('1.0.0');
        expect(data.hash).toBeDefined();
        expect(data.lastTimelineUpdate).toBe('2024-12-01T00:00:00.000Z');
      });

      it('should calculate time remaining correctly before release', async () => {
        const response = await GET(createMockRequest());
        const data = await response.json();

        // From 2025-01-01T12:00:00Z to 2025-09-04T14:00:00Z
        const expectedDays = Math.floor((new Date(MOCK_RELEASE_DATE).getTime() - new Date(MOCK_CURRENT_DATE).getTime()) / (1000 * 60 * 60 * 24));
        
        expect(data.isReleased).toBe(false);
        expect(data.daysRemaining).toBe(expectedDays);
        expect(data.totalSecondsRemaining).toBeGreaterThan(0);
        expect(typeof data.hoursRemaining).toBe('number');
      });

      it('should handle released game scenario', async () => {
        // Set system time to after release
        jest.setSystemTime(new Date('2025-12-01T00:00:00.000Z'));

        const response = await GET(createMockRequest());
        const data = await response.json();

        expect(data.isReleased).toBe(true);
        expect(data.daysRemaining).toBe(0);
        expect(data.hoursRemaining).toBe(0);
        expect(data.totalSecondsRemaining).toBe(0);
      });

      it('should set proper response headers', async () => {
        const response = await GET(createMockRequest());

        expect(response.headers.get('Content-Type')).toBe('application/json');
        expect(response.headers.get('Cache-Control')).toBe('public, max-age=300, stale-while-revalidate=600');
        expect(response.headers.get('ETag')).toBeDefined();
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
        expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET');
      });
    });

    describe('Timeline Data Handling', () => {
      it('should sort timeline items by date (newest first)', async () => {
        const unsortedTimeline = [
          {
            id: '1',
            date: '2024-11-15T00:00:00.000Z',
            title: 'Older Update',
            description: 'Older update',
            type: 'news',
            source: 'official',
            category: 'news'
          },
          {
            id: '2',
            date: '2024-12-01T00:00:00.000Z',
            title: 'Newer Update',
            description: 'Newer update',
            type: 'announcement',
            source: 'official',
            category: 'development'
          }
        ];

        mockFs.readFile.mockResolvedValue(JSON.stringify(unsortedTimeline));

        const response = await GET(createMockRequest());
        const data = await response.json();

        expect(data.lastTimelineUpdate).toBe('2024-12-01T00:00:00.000Z'); // Should be the newest
        expect(data.timelineItems[0].title).toBe('Older Update'); // Original order preserved
        expect(data.timelineItems[1].title).toBe('Newer Update');
      });

      it('should handle empty timeline data', async () => {
        mockFs.readFile.mockResolvedValue('[]');

        const response = await GET(createMockRequest());
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Timeline data not available');
      });

      it('should handle malformed timeline JSON', async () => {
        mockFs.readFile.mockResolvedValue('invalid json');

        const response = await GET(createMockRequest());
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Timeline data not available');
      });
    });

    describe('Caching and ETag Handling', () => {
      it('should return 304 Not Modified when ETag matches', async () => {
        // First request to get ETag
        const firstResponse = await GET(createMockRequest());
        const etag = firstResponse.headers.get('ETag');
        
        expect(etag).toBeDefined();
        expect(etag).toMatch(/^"[a-f0-9]+"$/);

        // Second request with ETag
        const secondResponse = await GET(createMockRequest({
          'if-none-match': etag!
        }));

        expect(secondResponse.status).toBe(304);
        const body = await secondResponse.text();
        expect(body).toBe('');
      });

      it('should return full response when ETag does not match', async () => {
        const response = await GET(createMockRequest({
          'if-none-match': '"different-etag"'
        }));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.timelineItems).toBeDefined();
        expect(data.releaseDate).toBe(MOCK_RELEASE_DATE);
      });

      it('should generate consistent ETags for same content', async () => {
        const firstResponse = await GET(createMockRequest());
        const firstEtag = firstResponse.headers.get('ETag');

        const secondResponse = await GET(createMockRequest());
        const secondEtag = secondResponse.headers.get('ETag');

        expect(firstEtag).toBe(secondEtag);
      });

      it('should generate different ETags when content changes', async () => {
        const firstResponse = await GET(createMockRequest());
        const firstEtag = firstResponse.headers.get('ETag');

        // Change timeline data
        mockFs.readFile.mockResolvedValue(JSON.stringify([
          ...mockTimelineData,
          {
            id: '3',
            date: '2024-12-15T00:00:00.000Z',
            title: 'New Update',
            description: 'Brand new update',
            type: 'announcement',
            source: 'official',
            category: 'development'
          }
        ]));

        const secondResponse = await GET(createMockRequest());
        const secondEtag = secondResponse.headers.get('ETag');

        expect(firstEtag).not.toBe(secondEtag);
      });
    });

    describe('File System Error Handling', () => {
      it('should handle file read errors', async () => {
        mockFs.readFile.mockRejectedValue(new Error('File not found'));

        const response = await GET(createMockRequest());
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Timeline data not available');
      });

      it('should handle file stat errors', async () => {
        mockFs.stat.mockRejectedValue(new Error('Permission denied'));

        const response = await GET(createMockRequest());
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Timeline data not available');
      });

      it('should handle general unexpected errors', async () => {
        mockFs.stat.mockImplementation(() => {
          throw new Error('Unexpected system error');
        });

        const response = await GET(createMockRequest());
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Internal server error');
      });
    });

    describe('Content Hash Generation', () => {
      it('should generate consistent content hash', async () => {
        const firstResponse = await GET(createMockRequest());
        const firstData = await firstResponse.json();

        const secondResponse = await GET(createMockRequest());
        const secondData = await secondResponse.json();

        expect(firstData.hash).toBe(secondData.hash);
        expect(firstData.hash).toMatch(/^[a-f0-9]{8}$/);
      });

      it('should change hash when timeline content changes', async () => {
        const firstResponse = await GET(createMockRequest());
        const firstData = await firstResponse.json();

        // Change the timeline data
        const modifiedTimeline = [
          ...mockTimelineData,
          {
            id: '3',
            date: '2024-12-20T00:00:00.000Z',
            title: 'Hash Test Update',
            description: 'This should change the hash',
            type: 'announcement',
            source: 'official',
            category: 'development'
          }
        ];

        mockFs.readFile.mockResolvedValue(JSON.stringify(modifiedTimeline));

        const secondResponse = await GET(createMockRequest());
        const secondData = await secondResponse.json();

        expect(firstData.hash).not.toBe(secondData.hash);
      });
    });

    describe('Time Calculations', () => {
      it('should handle edge case of exact release time', async () => {
        jest.setSystemTime(new Date(MOCK_RELEASE_DATE));

        const response = await GET(createMockRequest());
        const data = await response.json();

        expect(data.isReleased).toBe(true);
        expect(data.daysRemaining).toBe(0);
        expect(data.hoursRemaining).toBe(0);
        expect(data.totalSecondsRemaining).toBe(0);
      });

      it('should handle fractional days correctly', async () => {
        // Set time to exactly 1.5 days before release
        const releaseTime = new Date(MOCK_RELEASE_DATE).getTime();
        const testTime = releaseTime - (1.5 * 24 * 60 * 60 * 1000);
        jest.setSystemTime(new Date(testTime));

        const response = await GET(createMockRequest());
        const data = await response.json();

        expect(data.daysRemaining).toBe(1); // Should floor to 1 day
        expect(data.hoursRemaining).toBe(12); // Should be 12 hours remaining
        expect(data.totalSecondsRemaining).toBe(1.5 * 24 * 60 * 60); // 1.5 days in seconds
      });
    });
  });

  describe('HTTP Method Restrictions', () => {
    it('should reject POST requests', async () => {
      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error).toBe('Method not allowed');
      expect(response.headers.get('Allow')).toBe('GET');
    });

    it('should reject PUT requests', async () => {
      const response = await PUT();
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error).toBe('Method not allowed');
      expect(response.headers.get('Allow')).toBe('GET');
    });

    it('should reject DELETE requests', async () => {
      const response = await DELETE();
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error).toBe('Method not allowed');
      expect(response.headers.get('Allow')).toBe('GET');
    });

    it('should reject PATCH requests', async () => {
      const response = await PATCH();
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error).toBe('Method not allowed');
      expect(response.headers.get('Allow')).toBe('GET');
    });
  });

  describe('Response Consistency', () => {
    it('should maintain consistent response structure', async () => {
      const response = await GET(createMockRequest());
      const data = await response.json();

      // Check all required fields are present
      const requiredFields = [
        'releaseDate',
        'serverTime',
        'isReleased',
        'daysRemaining',
        'hoursRemaining',
        'totalSecondsRemaining',
        'lastTimelineUpdate',
        'timelineItems',
        'version',
        'hash'
      ];

      requiredFields.forEach(field => {
        expect(data).toHaveProperty(field);
      });

      // Check data types
      expect(typeof data.releaseDate).toBe('string');
      expect(typeof data.serverTime).toBe('string');
      expect(typeof data.isReleased).toBe('boolean');
      expect(typeof data.daysRemaining).toBe('number');
      expect(typeof data.hoursRemaining).toBe('number');
      expect(typeof data.totalSecondsRemaining).toBe('number');
      expect(typeof data.lastTimelineUpdate).toBe('string');
      expect(Array.isArray(data.timelineItems)).toBe(true);
      expect(typeof data.version).toBe('string');
      expect(typeof data.hash).toBe('string');
    });

    it('should have valid ISO timestamps', async () => {
      const response = await GET(createMockRequest());
      const data = await response.json();

      // Check ISO format
      expect(data.releaseDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(data.serverTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(data.lastTimelineUpdate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      // Check dates are valid
      expect(new Date(data.releaseDate)).toBeInstanceOf(Date);
      expect(new Date(data.serverTime)).toBeInstanceOf(Date);
      expect(new Date(data.lastTimelineUpdate)).toBeInstanceOf(Date);
    });
  });
});
