/**
 * RSS Feed API Route
 * Generates RSS 2.0 feed based on timeline.json data
 * Provides latest game updates and news in RSS format
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Types for timeline data
interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  type: string;
  source: string;
  category: string;
}

// Cache for timeline data
let feedCache: {
  xml: string;
  lastModified: number;
  etag: string;
} | null = null;

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Format date for RSS (RFC 822 format)
 */
function formatRssDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toUTCString();
}

/**
 * Convert timeline item category to RSS category
 */
function mapCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'announcement': 'Announcements',
    'gameplay': 'Gameplay',
    'development': 'Development',
    'release_date': 'Release Updates',
    'expectation': 'Community',
    'media': 'Media Coverage',
  };
  return categoryMap[category] || 'News';
}

/**
 * Generate RSS item from timeline item
 */
function generateRssItem(item: TimelineItem): string {
  const pubDate = formatRssDate(item.date);
  const category = mapCategory(item.category);
  const siteUrl = process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_SITE_URL || 'https://hollowknightsilksong.org'
    : 'http://localhost:3000';
  const guid = `${siteUrl}/timeline#${item.id}`;
  const link = item.source.startsWith('http') ? item.source : guid;
  
  return `    <item>
      <title><![CDATA[${escapeXml(item.title)}]]></title>
      <description><![CDATA[${escapeXml(item.description)}]]></description>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(guid)}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(category)}</category>
      <source url="${escapeXml(item.source)}">${escapeXml(item.type)}</source>
    </item>`;
}

/**
 * Generate complete RSS feed
 */
function generateRssFeed(timelineItems: TimelineItem[]): string {
  const now = new Date();
  const buildDate = now.toUTCString();
  const siteUrl = process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_SITE_URL || 'https://hollowknightsilksong.org'
    : 'http://localhost:3000';
  
  // Sort timeline by date descending and take top 30 items
  const sortedItems = timelineItems
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 30);
  
  const lastBuildDate = sortedItems.length > 0 
    ? formatRssDate(sortedItems[0].date)
    : buildDate;
  
  const rssItems = sortedItems
    .map(item => generateRssItem(item))
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hollow Knight: Silksong - News &amp; Updates</title>
    <description>Latest news, updates, and timeline entries for Hollow Knight: Silksong by Team Cherry</description>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <copyright>Copyright © Team Cherry</copyright>
    <managingEditor>contact@teamcherry.com.au (Team Cherry)</managingEditor>
    <webMaster>contact@teamcherry.com.au (Team Cherry)</webMaster>
    <pubDate>${buildDate}</pubDate>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <category>Gaming</category>
    <category>Indie Games</category>
    <category>Hollow Knight</category>
    <generator>Silksong Timeline RSS Generator</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <ttl>60</ttl>
    <image>
      <url>${siteUrl}/assets/silksong-logo.png</url>
      <title>Hollow Knight: Silksong</title>
      <link>${siteUrl}</link>
      <width>144</width>
      <height>144</height>
      <description>Hollow Knight: Silksong Logo</description>
    </image>
${rssItems}
  </channel>
</rss>`;
}

/**
 * Load timeline data and generate RSS feed with caching
 */
async function generateCachedFeed(): Promise<{ xml: string; etag: string }> {
  try {
    const timelineFilePath = path.join(process.cwd(), 'data', 'timeline.json');
    const stats = await fs.stat(timelineFilePath);
    const lastModified = stats.mtime.getTime();

    // Check if cache is still valid
    if (feedCache && feedCache.lastModified >= lastModified) {
      return {
        xml: feedCache.xml,
        etag: feedCache.etag,
      };
    }

    // Load fresh data
    const timelineContent = await fs.readFile(timelineFilePath, 'utf-8');
    const timelineData = JSON.parse(timelineContent) as TimelineItem[];

    // Generate RSS feed
    const rssXml = generateRssFeed(timelineData);

    // Generate ETag based on content and modification time
    const etag = Buffer.from(`${lastModified}-${rssXml.length}`).toString('base64');

    // Update cache
    feedCache = {
      xml: rssXml,
      lastModified,
      etag,
    };

    return { xml: rssXml, etag };
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    throw new Error('Failed to generate RSS feed');
  }
}

/**
 * GET /feed.xml - RSS Feed
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Generate RSS feed with caching
    const { xml, etag } = await generateCachedFeed();

    // Check ETag for client caching
    const clientETag = request.headers.get('if-none-match');
    if (clientETag === `"${etag}"`) {
      return new NextResponse(null, { status: 304 });
    }

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200', // Cache for 1 hour
        'ETag': `"${etag}"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
      },
    });
  } catch (error) {
    console.error('Error in GET /feed.xml:', error);
    
    // Return a basic error RSS feed
    const errorFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Hollow Knight: Silksong - Feed Error</title>
    <description>RSS feed temporarily unavailable</description>
    <link>${siteUrl}</link>
    <item>
      <title>Feed Temporarily Unavailable</title>
      <description>The RSS feed is temporarily unavailable. Please try again later.</description>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
  </channel>
</rss>`;

    const siteUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_SITE_URL || 'https://hollowknightsilksong.org'
      : 'http://localhost:3000';
    
    const updatedErrorFeed = errorFeed.replace('https://silksong-nextjs.vercel.app', siteUrl);
    
    return new NextResponse(updatedErrorFeed, {
      status: 500,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}

/**
 * Handle other HTTP methods with 405 Method Not Allowed
 */
export async function POST(): Promise<NextResponse> {
  return new NextResponse('Method not allowed', { 
    status: 405,
    headers: {
      'Allow': 'GET',
      'Content-Type': 'text/plain',
    },
  });
}

export async function PUT(): Promise<NextResponse> {
  return new NextResponse('Method not allowed', { 
    status: 405,
    headers: {
      'Allow': 'GET',
      'Content-Type': 'text/plain',
    },
  });
}

export async function DELETE(): Promise<NextResponse> {
  return new NextResponse('Method not allowed', { 
    status: 405,
    headers: {
      'Allow': 'GET',
      'Content-Type': 'text/plain',
    },
  });
}

export async function PATCH(): Promise<NextResponse> {
  return new NextResponse('Method not allowed', { 
    status: 405,
    headers: {
      'Allow': 'GET',
      'Content-Type': 'text/plain',
    },
  });
}