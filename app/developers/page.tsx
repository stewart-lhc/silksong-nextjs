/**
 * Developer Documentation Page
 * Comprehensive API documentation for Hollow Knight: Silksong developers
 */

import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { CodeBlock } from '@/components/ui/code-block';
import { APIEndpoint } from '@/components/ui/api-endpoint';
import { ResponseExample } from '@/components/ui/response-example';
import { 
  Code2, 
  Zap, 
  Shield, 
  Clock, 
  Download, 
  ExternalLink,
  Copy,
  Check,
  BookOpen,
  Users,
  MessageSquare,
  Github
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Developer API Documentation | Hollow Knight: Silksong',
  description: 'Complete API documentation for Hollow Knight: Silksong. Access game status, subscribe to updates, and integrate our RSS feed with comprehensive examples and SDKs.',
  keywords: [
    'Hollow Knight Silksong API',
    'Game API documentation',
    'REST API',
    'RSS feed',
    'Developer integration',
    'Team Cherry API'
  ],
  openGraph: {
    title: 'Silksong API Documentation',
    description: 'Integrate Hollow Knight: Silksong data into your applications with our comprehensive API.',
    type: 'website',
  },
};

const quickStartCode = `// Quick Start - Get Game Status
fetch('https://silksong-nextjs.vercel.app/api/status')
  .then(response => response.json())
  .then(data => {
    console.log('Days until release:', data.daysRemaining);
    console.log('Latest updates:', data.timelineItems.slice(0, 5));
  })
  .catch(error => console.error('Error:', error));`;

const features = [
  {
    icon: Zap,
    title: 'Real-time Status',
    description: 'Get live countdown data and game release information'
  },
  {
    icon: Shield,
    title: 'Rate Limited',
    description: 'Built-in protection with clear usage guidelines'
  },
  {
    icon: Clock,
    title: 'Cached Responses',
    description: 'ETag caching for optimal performance'
  },
  {
    icon: Code2,
    title: 'Developer-First',
    description: 'RESTful design with comprehensive documentation'
  }
];

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-hornet-neutral-900 via-hornet-secondary-900 to-hornet-auxiliary-900 dark:from-hornet-neutral-950 dark:via-hornet-secondary-950 dark:to-hornet-auxiliary-950">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-hornet-100 dark:bg-hornet-900 rounded-full">
              <Code2 className="h-12 w-12 text-hornet-600 dark:text-hornet-400" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-hornet-600 via-hornet-auxiliary-600 to-hornet-secondary-600 bg-clip-text text-transparent mb-6">
            Silksong Developer APIs
          </h1>
          
          <p className="text-xl text-hornet-neutral-700 dark:text-hornet-neutral-300 max-w-3xl mx-auto mb-8">
            Integrate Hollow Knight: Silksong data into your applications with our comprehensive REST API. 
            Get real-time game status, manage subscriptions, and access timeline data.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link href="#quick-start">
                <Zap className="mr-2 h-4 w-4" />
                Quick Start
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#endpoints">
                <BookOpen className="mr-2 h-4 w-4" />
                API Reference
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="https://github.com" target="_blank">
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
                <ExternalLink className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center border-hornet-200 dark:border-hornet-700 shadow-lg bg-white/95 dark:bg-hornet-neutral-900/80 backdrop-blur">
                <CardHeader>
                  <div className="mx-auto p-3 bg-hornet-100 dark:bg-hornet-900 rounded-full w-fit">
                    <Icon className="h-6 w-6 text-hornet-600 dark:text-hornet-400" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-hornet-neutral-600 dark:text-hornet-neutral-400">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Start Section */}
        <section id="quick-start" className="mb-16">
          <Card className="border-hornet-200 dark:border-hornet-700 shadow-xl bg-white/95 dark:bg-hornet-neutral-900/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Zap className="h-6 w-6 text-hornet-600" />
                Quick Start
              </CardTitle>
              <CardDescription>
                Get up and running in under 5 minutes. No authentication required for public endpoints.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">1. Make Your First Request</h3>
                  <CodeBlock 
                    code={quickStartCode}
                    language="javascript"
                    title="Quick Start Example"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">2. Explore the Response</h3>
                  <div className="bg-hornet-neutral-700 dark:bg-hornet-neutral-800 rounded-lg p-4">
                    <p className="text-sm text-hornet-neutral-200 mb-3">
                      You'll get a comprehensive response with:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-hornet-success-500" />
                        Release countdown data
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-hornet-success-500" />
                        Latest timeline updates
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-hornet-success-500" />
                        Caching headers for optimization
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-hornet-success-500" />
                        CORS enabled for web apps
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Base URL and Authentication */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-hornet-200 dark:border-hornet-700 shadow-lg bg-white/95 dark:bg-hornet-neutral-900/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Base URL</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-hornet-neutral-700 dark:bg-hornet-neutral-800 rounded-lg p-4 font-mono text-sm text-hornet-neutral-200">
                  https://silksong-nextjs.vercel.app
                </div>
                <p className="text-sm text-hornet-neutral-200 mt-2">
                  All API endpoints are relative to this base URL.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-hornet-200 dark:border-hornet-700 shadow-lg bg-white/95 dark:bg-hornet-neutral-900/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-hornet-success-500" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="mb-2">Public APIs</Badge>
                <p className="text-sm text-hornet-neutral-200">
                  Currently, all endpoints are public and don't require authentication. 
                  Rate limits apply to ensure fair usage.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* API Endpoints */}
        <section id="endpoints" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">API Reference</h2>
            <p className="text-lg text-hornet-neutral-200">
              Complete documentation for all available endpoints
            </p>
          </div>

          <Tabs defaultValue="status" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="status">Status API</TabsTrigger>
              <TabsTrigger value="subscribe">Subscription API</TabsTrigger>
              <TabsTrigger value="rss">RSS Feed</TabsTrigger>
            </TabsList>

            {/* Status API Tab */}
            <TabsContent value="status">
              <APIEndpoint
                method="GET"
                endpoint="/api/status"
                title="Get Game Status"
                description="Returns comprehensive game release status including countdown data and timeline updates"
                parameters={[]}
                headers={[
                  { name: 'If-None-Match', description: 'ETag for caching', required: false, example: '"abc123"' }
                ]}
                responses={[
                  {
                    status: 200,
                    description: 'Success - Returns game status data',
                    example: {
                      releaseDate: "2025-09-04T00:00:00.000Z",
                      serverTime: "2024-08-24T10:30:45.123Z", 
                      isReleased: false,
                      daysRemaining: 376,
                      hoursRemaining: 13,
                      totalSecondsRemaining: 32493523,
                      lastTimelineUpdate: "2024-06-11T00:00:00.000Z",
                      timelineItems: [
                        {
                          id: "1",
                          date: "2019-02-14",
                          title: "Hollow Knight: Silksong Revealed",
                          description: "Team Cherry officially announced the sequel...",
                          type: "Official",
                          source: "https://www.teamcherry.com.au/blog/hollow-knight-silksong-revealed",
                          category: "announcement"
                        }
                      ],
                      version: "1.0.0",
                      hash: "abc12345"
                    }
                  },
                  {
                    status: 304,
                    description: 'Not Modified - Content hasn\'t changed (when using ETag)',
                    example: null
                  },
                  {
                    status: 500,
                    description: 'Server Error',
                    example: { error: 'Internal server error' }
                  }
                ]}
                codeExamples={[
                  {
                    language: 'javascript',
                    title: 'Fetch API',
                    code: `// Basic request
fetch('https://silksong-nextjs.vercel.app/api/status')
  .then(response => response.json())
  .then(data => console.log(data));

// With caching support
const headers = {};
if (localStorage.getItem('status-etag')) {
  headers['If-None-Match'] = localStorage.getItem('status-etag');
}

fetch('https://silksong-nextjs.vercel.app/api/status', { headers })
  .then(response => {
    if (response.status === 304) {
      // Use cached data
      return JSON.parse(localStorage.getItem('status-data'));
    }
    // Store new ETag
    localStorage.setItem('status-etag', response.headers.get('ETag'));
    return response.json();
  })
  .then(data => {
    localStorage.setItem('status-data', JSON.stringify(data));
    console.log(data);
  });`
                  },
                  {
                    language: 'python',
                    title: 'Python Requests',
                    code: `import requests
import json

# Basic request
response = requests.get('https://silksong-nextjs.vercel.app/api/status')
data = response.json()

print(f"Days remaining: {data['daysRemaining']}")
print(f"Timeline items: {len(data['timelineItems'])}")

# With caching
headers = {}
if 'status_etag' in locals():
    headers['If-None-Match'] = status_etag

response = requests.get(
    'https://silksong-nextjs.vercel.app/api/status',
    headers=headers
)

if response.status_code == 304:
    print("Using cached data")
else:
    status_etag = response.headers.get('ETag')
    data = response.json()
    print(f"New data received: {data['hash']}")`
                  },
                  {
                    language: 'bash',
                    title: 'cURL',
                    code: `# Basic request
curl -X GET "https://silksong-nextjs.vercel.app/api/status" \\
  -H "Accept: application/json"

# With ETag caching
curl -X GET "https://silksong-nextjs.vercel.app/api/status" \\
  -H "Accept: application/json" \\
  -H "If-None-Match: \\"abc123\\""

# Save response and extract specific data
curl -s "https://silksong-nextjs.vercel.app/api/status" | \\
  jq '.daysRemaining, .timelineItems[0].title'`
                  }
                ]}
              />
            </TabsContent>

            {/* Subscribe API Tab */}
            <TabsContent value="subscribe">
              <APIEndpoint
                method="POST"
                endpoint="/api/subscribe"
                title="Subscribe to Updates"
                description="Subscribe an email address to receive game updates and announcements"
                parameters={[
                  { name: 'email', type: 'string', description: 'Valid email address', required: true, example: 'user@example.com' },
                  { name: 'source', type: 'string', description: 'Source of subscription', required: false, example: 'web' }
                ]}
                headers={[
                  { name: 'Content-Type', description: 'Must be application/json', required: true, example: 'application/json' }
                ]}
                responses={[
                  {
                    status: 201,
                    description: 'Success - Email subscribed',
                    example: {
                      success: true,
                      message: 'Successfully subscribed!',
                      subscription: {
                        id: 'uuid-here',
                        email: 'user@example.com',
                        subscribed_at: '2024-08-24T10:30:45.123Z'
                      }
                    }
                  },
                  {
                    status: 400,
                    description: 'Bad Request - Invalid email',
                    example: { error: 'Please enter a valid email address' }
                  },
                  {
                    status: 409,
                    description: 'Conflict - Email already subscribed',
                    example: { 
                      error: 'Email already subscribed',
                      code: 'ALREADY_SUBSCRIBED'
                    }
                  },
                  {
                    status: 429,
                    description: 'Rate Limit Exceeded',
                    example: { 
                      error: 'Rate limit exceeded. Please wait before subscribing again.',
                      resetTime: 1692877845123
                    }
                  }
                ]}
                codeExamples={[
                  {
                    language: 'javascript',
                    title: 'Fetch API',
                    code: `// Subscribe to updates
async function subscribeToUpdates(email) {
  try {
    const response = await fetch('https://silksong-nextjs.vercel.app/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Subscribed successfully!', data.subscription);
      return { success: true, data };
    } else {
      console.error('❌ Subscription failed:', data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Network error:', error);
    return { success: false, error: 'Network error' };
  }
}

// Usage
subscribeToUpdates('user@example.com');`
                  },
                  {
                    language: 'python',
                    title: 'Python Requests',
                    code: `import requests
import json

def subscribe_to_updates(email):
    url = 'https://silksong-nextjs.vercel.app/api/subscribe'
    headers = {'Content-Type': 'application/json'}
    data = {'email': email}
    
    try:
        response = requests.post(url, headers=headers, json=data)
        result = response.json()
        
        if response.status_code == 201:
            print(f"✅ Subscribed successfully! ID: {result['subscription']['id']}")
            return True
        elif response.status_code == 409:
            print("⚠️ Email already subscribed")
            return False
        elif response.status_code == 429:
            print("⏰ Rate limited. Try again later.")
            return False
        else:
            print(f"❌ Error: {result.get('error', 'Unknown error')}")
            return False
            
    except requests.RequestException as e:
        print(f"Network error: {e}")
        return False

# Usage
subscribe_to_updates('user@example.com')`
                  },
                  {
                    language: 'bash',
                    title: 'cURL',
                    code: `# Subscribe to updates
curl -X POST "https://silksong-nextjs.vercel.app/api/subscribe" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com"}'

# With source tracking
curl -X POST "https://silksong-nextjs.vercel.app/api/subscribe" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "source": "api-docs"}'

# Handle response and check status
curl -X POST "https://silksong-nextjs.vercel.app/api/subscribe" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com"}' \\
  -w "HTTP Status: %{http_code}\\n" \\
  -s | jq '.'`
                  }
                ]}
              />
            </TabsContent>

            {/* RSS Feed Tab */}
            <TabsContent value="rss">
              <APIEndpoint
                method="GET"
                endpoint="/feed.xml"
                title="RSS Feed"
                description="Standard RSS 2.0 feed containing the latest 30 timeline entries and game updates"
                parameters={[]}
                headers={[
                  { name: 'If-None-Match', description: 'ETag for caching', required: false, example: '"rss-abc123"' }
                ]}
                responses={[
                  {
                    status: 200,
                    description: 'Success - Returns RSS XML feed',
                    example: `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hollow Knight: Silksong - News &amp; Updates</title>
    <description>Latest news, updates, and timeline entries for Hollow Knight: Silksong by Team Cherry</description>
    <link>https://silksong-nextjs.vercel.app</link>
    <atom:link href="https://silksong-nextjs.vercel.app/feed.xml" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>Sat, 24 Aug 2024 10:30:45 GMT</lastBuildDate>
    <item>
      <title><![CDATA[Hollow Knight: Silksong Revealed]]></title>
      <description><![CDATA[Team Cherry officially announced the sequel to Hollow Knight...]]></description>
      <link>https://www.teamcherry.com.au/blog/hollow-knight-silksong-revealed</link>
      <pubDate>Thu, 14 Feb 2019 00:00:00 GMT</pubDate>
      <category>Announcements</category>
    </item>
  </channel>
</rss>`
                  },
                  {
                    status: 304,
                    description: 'Not Modified - Feed hasn\'t changed',
                    example: null
                  }
                ]}
                codeExamples={[
                  {
                    language: 'javascript',
                    title: 'Fetch and Parse RSS',
                    code: `// Fetch RSS feed
async function fetchSilksongFeed() {
  try {
    const response = await fetch('https://silksong-nextjs.vercel.app/feed.xml');
    const xmlText = await response.text();
    
    // Parse with DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Extract items
    const items = Array.from(xmlDoc.querySelectorAll('item')).map(item => ({
      title: item.querySelector('title')?.textContent,
      description: item.querySelector('description')?.textContent,
      link: item.querySelector('link')?.textContent,
      pubDate: new Date(item.querySelector('pubDate')?.textContent),
      category: item.querySelector('category')?.textContent
    }));
    
    console.log('Latest updates:', items.slice(0, 5));
    return items;
  } catch (error) {
    console.error('Error fetching RSS:', error);
  }
}

fetchSilksongFeed();`
                  },
                  {
                    language: 'python',
                    title: 'Python with feedparser',
                    code: `import feedparser
import requests

# Using feedparser library (pip install feedparser)
def fetch_silksong_feed():
    url = 'https://silksong-nextjs.vercel.app/feed.xml'
    
    try:
        feed = feedparser.parse(url)
        
        print(f"Feed title: {feed.feed.title}")
        print(f"Last updated: {feed.feed.updated}")
        print(f"Total entries: {len(feed.entries)}")
        
        # Display latest 5 entries
        for entry in feed.entries[:5]:
            print(f"\\n📰 {entry.title}")
            print(f"📅 {entry.published}")
            print(f"🔗 {entry.link}")
            print(f"📝 {entry.description[:100]}...")
            
        return feed.entries
        
    except Exception as e:
        print(f"Error fetching RSS feed: {e}")
        return []

# Usage
entries = fetch_silksong_feed()`
                  },
                  {
                    language: 'bash',
                    title: 'cURL and Processing',
                    code: `# Fetch RSS feed
curl -s "https://silksong-nextjs.vercel.app/feed.xml"

# Get feed with caching
curl -s "https://silksong-nextjs.vercel.app/feed.xml" \\
  -H "If-None-Match: \\"cached-etag\\""

# Extract titles using xmllint
curl -s "https://silksong-nextjs.vercel.app/feed.xml" | \\
  xmllint --xpath "//item/title/text()" - | head -5

# Monitor feed changes
#!/bin/bash
ETAG_FILE="silksong_feed.etag"
FEED_URL="https://silksong-nextjs.vercel.app/feed.xml"

if [ -f "$ETAG_FILE" ]; then
  ETAG=$(cat "$ETAG_FILE")
  RESPONSE=$(curl -s -w "%{http_code}" -H "If-None-Match: $ETAG" "$FEED_URL")
  
  if [[ "$RESPONSE" == *"304" ]]; then
    echo "Feed unchanged"
  else
    echo "Feed updated! New content available."
  fi
fi`
                  }
                ]}
              />
            </TabsContent>
          </Tabs>
        </section>

        {/* Rate Limiting Section */}
        <section className="mb-16">
          <Card className="border-hornet-200 dark:border-hornet-700 shadow-xl bg-white/95 dark:bg-hornet-neutral-900/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Clock className="h-6 w-6 text-hornet-warning-500" />
                Rate Limiting
              </CardTitle>
              <CardDescription>
                Usage guidelines and limits to ensure fair access for all developers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-hornet-warning-50 dark:bg-hornet-warning-950 rounded-lg">
                  <div className="text-2xl font-bold text-hornet-warning-600">100</div>
                  <div className="text-sm text-hornet-neutral-200">Requests per 15min</div>
                </div>
                <div className="text-center p-4 bg-hornet-info-50 dark:bg-hornet-info-950 rounded-lg">
                  <div className="text-2xl font-bold text-hornet-info-600">1</div>
                  <div className="text-sm text-hornet-neutral-200">Subscription per minute</div>
                </div>
                <div className="text-center p-4 bg-hornet-success-50 dark:bg-hornet-success-950 rounded-lg">
                  <div className="text-2xl font-bold text-hornet-success-600">∞</div>
                  <div className="text-sm text-hornet-neutral-200">Cached responses</div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">Response Headers</h3>
                <div className="bg-hornet-neutral-700 dark:bg-hornet-neutral-800 rounded-lg p-4 font-mono text-sm space-y-1 text-hornet-neutral-200">
                  <div><strong>X-RateLimit-Limit:</strong> 100</div>
                  <div><strong>X-RateLimit-Remaining:</strong> 95</div>
                  <div><strong>X-RateLimit-Reset:</strong> 1692877845</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Best Practices</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-hornet-success-500 mt-0.5" />
                    <span>Use ETag headers for caching to avoid unnecessary requests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-hornet-success-500 mt-0.5" />
                    <span>Implement exponential backoff for rate limit errors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-hornet-success-500 mt-0.5" />
                    <span>Cache responses locally to reduce API calls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-hornet-success-500 mt-0.5" />
                    <span>Monitor rate limit headers in your applications</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Error Handling Section */}
        <section className="mb-16">
          <Card className="border-hornet-200 dark:border-hornet-700 shadow-xl bg-white/95 dark:bg-hornet-neutral-900/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl">Error Handling</CardTitle>
              <CardDescription>
                Common error scenarios and how to handle them gracefully
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">HTTP Status Codes</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-hornet-success-50 dark:bg-hornet-success-950 rounded-lg">
                      <div>
                        <Badge variant="secondary" className="mr-2">200</Badge>
                        <strong>Success</strong>
                      </div>
                      <span className="text-sm text-hornet-neutral-200">Request completed successfully</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-hornet-info-50 dark:bg-hornet-info-950 rounded-lg">
                      <div>
                        <Badge variant="secondary" className="mr-2">201</Badge>
                        <strong>Created</strong>
                      </div>
                      <span className="text-sm text-hornet-neutral-200">Resource created (subscription)</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-hornet-neutral-50 dark:bg-hornet-neutral-950 rounded-lg">
                      <div>
                        <Badge variant="secondary" className="mr-2">304</Badge>
                        <strong>Not Modified</strong>
                      </div>
                      <span className="text-sm text-hornet-neutral-200">Use cached version</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-hornet-error-50 dark:bg-hornet-error-950 rounded-lg">
                      <div>
                        <Badge variant="secondary" className="mr-2">400</Badge>
                        <strong>Bad Request</strong>
                      </div>
                      <span className="text-sm text-hornet-neutral-200">Invalid request data</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-hornet-warning-50 dark:bg-hornet-warning-950 rounded-lg">
                      <div>
                        <Badge variant="secondary" className="mr-2">429</Badge>
                        <strong>Rate Limited</strong>
                      </div>
                      <span className="text-sm text-hornet-neutral-200">Too many requests</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-hornet-error-50 dark:bg-hornet-error-950 rounded-lg">
                      <div>
                        <Badge variant="secondary" className="mr-2">500</Badge>
                        <strong>Server Error</strong>
                      </div>
                      <span className="text-sm text-hornet-neutral-200">Internal server error</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Error Response Format</h3>
                  <CodeBlock
                    language="json"
                    code={`{
  "error": "Please enter a valid email address",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "email",
    "provided": "invalid-email"
  },
  "timestamp": "2024-08-24T10:30:45.123Z",
  "path": "/api/subscribe"
}`}
                    title="Error Response Example"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Handling Errors in Code</h3>
                  <CodeBlock
                    language="javascript"
                    code={`async function handleApiCall(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    // Handle rate limiting
    if (response.status === 429) {
      const resetTime = response.headers.get('X-RateLimit-Reset');
      const waitTime = (resetTime * 1000) - Date.now();
      console.log(\`Rate limited. Retry after \${Math.ceil(waitTime / 1000)} seconds\`);
      
      // Implement exponential backoff
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return handleApiCall(url, options); // Retry
    }
    
    // Handle not modified (use cache)
    if (response.status === 304) {
      return getCachedData(url);
    }
    
    // Parse response
    const data = await response.json();
    
    // Handle errors
    if (!response.ok) {
      throw new Error(\`API Error (\${response.status}): \${data.error}\`);
    }
    
    // Cache successful response
    setCachedData(url, data, response.headers.get('ETag'));
    return data;
    
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}`}
                    title="Robust Error Handling"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Community and Support */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Community & Support</h2>
            <p className="text-lg text-hornet-neutral-200">
              Join the developer community and get help when you need it
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-hornet-200 dark:border-hornet-700 shadow-lg bg-hornet-neutral-800/90 dark:bg-hornet-neutral-900/80 backdrop-blur text-center">
              <CardHeader>
                <div className="mx-auto p-3 bg-hornet-secondary-100 dark:bg-hornet-secondary-900 rounded-full w-fit">
                  <Github className="h-6 w-6 text-hornet-secondary-600 dark:text-hornet-secondary-400" />
                </div>
                <CardTitle>GitHub</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-hornet-neutral-200 mb-4">
                  Contribute, report issues, and view source code
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="https://github.com" target="_blank">
                    View Repository
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-hornet-200 dark:border-hornet-700 shadow-lg bg-hornet-neutral-800/90 dark:bg-hornet-neutral-900/80 backdrop-blur text-center">
              <CardHeader>
                <div className="mx-auto p-3 bg-hornet-auxiliary-100 dark:bg-hornet-auxiliary-900 rounded-full w-fit">
                  <MessageSquare className="h-6 w-6 text-hornet-auxiliary-600 dark:text-hornet-auxiliary-400" />
                </div>
                <CardTitle>Discord</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-hornet-neutral-200 mb-4">
                  Join the developer community chat
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="https://discord.gg/hollowknight" target="_blank">
                    Join Server
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-hornet-200 dark:border-hornet-700 shadow-lg bg-hornet-neutral-800/90 dark:bg-hornet-neutral-900/80 backdrop-blur text-center">
              <CardHeader>
                <div className="mx-auto p-3 bg-hornet-success-100 dark:bg-hornet-success-900 rounded-full w-fit">
                  <Users className="h-6 w-6 text-hornet-success-600 dark:text-hornet-success-400" />
                </div>
                <CardTitle>Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-hornet-neutral-200 mb-4">
                  Community-built integrations and examples
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/examples">
                    Browse Examples
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-hornet-200 dark:border-hornet-700 shadow-lg bg-hornet-neutral-800/90 dark:bg-hornet-neutral-900/80 backdrop-blur text-center">
              <CardHeader>
                <div className="mx-auto p-3 bg-hornet-warning-100 dark:bg-hornet-warning-900 rounded-full w-fit">
                  <Download className="h-6 w-6 text-hornet-warning-600 dark:text-hornet-warning-400" />
                </div>
                <CardTitle>SDKs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-hornet-neutral-200 mb-4">
                  Official and community SDK libraries
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="#sdks">
                    View SDKs
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SDKs and Libraries */}
        <section id="sdks" className="mb-16">
          <Card className="border-hornet-200 dark:border-hornet-700 shadow-xl bg-white/95 dark:bg-hornet-neutral-900/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Download className="h-6 w-6 text-hornet-success-500" />
                SDKs & Libraries
              </CardTitle>
              <CardDescription>
                Official and community-maintained libraries to get you started quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">JavaScript/TypeScript</h3>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">silksong-api</h4>
                        <Badge variant="secondary">Official</Badge>
                      </div>
                      <p className="text-sm text-hornet-neutral-200 mb-3">
                        Official TypeScript SDK with full type safety and caching support.
                      </p>
                      <CodeBlock
                        language="bash"
                        code="npm install silksong-api"
                        title=""
                      />
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">@silksong/react-hooks</h4>
                        <Badge variant="outline">Community</Badge>
                      </div>
                      <p className="text-sm text-hornet-neutral-200 mb-3">
                        React hooks for easy integration in React applications.
                      </p>
                      <CodeBlock
                        language="bash"
                        code="npm install @silksong/react-hooks"
                        title=""
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Python</h3>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">silksong-python</h4>
                        <Badge variant="secondary">Official</Badge>
                      </div>
                      <p className="text-sm text-hornet-neutral-200 mb-3">
                        Official Python SDK with async support and automatic retry logic.
                      </p>
                      <CodeBlock
                        language="bash"
                        code="pip install silksong-api"
                        title=""
                      />
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">silksong-cli</h4>
                        <Badge variant="outline">Community</Badge>
                      </div>
                      <p className="text-sm text-hornet-neutral-200 mb-3">
                        Command-line tool for monitoring and notifications.
                      </p>
                      <CodeBlock
                        language="bash"
                        code="pip install silksong-cli"
                        title=""
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="text-lg font-semibold mb-4">Quick SDK Example</h3>
                <CodeBlock
                  language="javascript"
                  code={`import { SilksongAPI } from 'silksong-api';

// Initialize client
const api = new SilksongAPI({
  baseUrl: 'https://silksong-nextjs.vercel.app',
  cache: true, // Enable automatic caching
  retries: 3   // Automatic retry on failures
});

// Get game status with full TypeScript support
const status = await api.getStatus();
console.log(\`\${status.daysRemaining} days remaining!\`);

// Subscribe to updates with validation
try {
  const result = await api.subscribe('user@example.com');
  console.log('Subscribed successfully!', result.subscription.id);
} catch (error) {
  if (error.code === 'ALREADY_SUBSCRIBED') {
    console.log('Email already subscribed');
  }
}

// Get RSS feed as structured data
const feed = await api.getRSSFeed();
console.log('Latest updates:', feed.items.slice(0, 5));`}
                  title="Official SDK Usage"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center py-12 border-t border-border">
          <p className="text-hornet-neutral-200 mb-4">
            Built with ❤️ for the Hollow Knight community
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <Link href="/developers" className="hover:underline">API Docs</Link>
            <Link href="/timeline" className="hover:underline">Timeline</Link>
            <Link href="/status" className="hover:underline">Status</Link>
            <Link href="https://github.com" className="hover:underline">GitHub</Link>
          </div>
        </div>
      </div>
    </div>
  );
}