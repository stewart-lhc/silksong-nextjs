'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CodeIcon,
  CopyIcon,
  DatabaseIcon,
  ExternalLinkIcon,
  PlayIcon,
  RefreshCwIcon,
  RssIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Types for API responses
interface StatusResponse {
  releaseDate: string;
  serverTime: string;
  isReleased: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  totalSecondsRemaining: number;
  lastTimelineUpdate: string;
  timelineItems: Array<{
    id: string;
    date: string;
    title: string;
    description: string;
    type: string;
    source: string;
    category: string;
  }>;
  version: string;
  hash: string;
}

interface RSSItem {
  title: string;
  description: string;
  pubDate: string;
  link: string;
  category: string;
}

// Embed widget configuration interface
interface EmbedConfig {
  theme: 'light' | 'dark';
  lang: 'en' | 'zh' | 'es' | 'fr' | 'de' | 'ja';
  showTitle: boolean;
  layout: 'horizontal' | 'vertical';
  border: boolean;
  width: string;
  height: string;
}

const languageLabels = {
  en: 'English',
  zh: '中文',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
};

export default function ToolsPage() {
  // State for copied feedback
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});

  // State for API testing
  const [apiResponse, setApiResponse] = useState<StatusResponse | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // State for RSS feed preview
  const [rssItems, setRssItems] = useState<RSSItem[]>([]);
  const [rssLoading, setRssLoading] = useState(false);

  // State for embed configuration
  const [embedConfig, setEmbedConfig] = useState<EmbedConfig>({
    theme: 'light',
    lang: 'en',
    showTitle: true,
    layout: 'horizontal',
    border: true,
    width: '400',
    height: '300',
  });

  // State for embed preview loading
  const [embedLoading, setEmbedLoading] = useState(true);
  const [embedError, setEmbedError] = useState(false);

  // State for tool sections visibility (only one can be open at a time)
  const [expandedSections, setExpandedSections] = useState({
    embed: false,
    api: false,
    rss: false,
  });

  // Helper function to toggle sections with mutual exclusion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => {
      const newState = { embed: false, api: false, rss: false };
      newState[section] = !prev[section];
      return newState;
    });
  };

  // Copy to clipboard utility
  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [key]: true }));
      setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Test API endpoint
  const testApiEndpoint = async () => {
    setApiLoading(true);
    setApiError(null);

    try {
      const response = await fetch('/api/status');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setApiResponse(data);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to fetch');
    } finally {
      setApiLoading(false);
    }
  };

  // Load RSS preview
  const loadRssPreview = async () => {
    setRssLoading(true);

    try {
      const response = await fetch('/feed.xml');
      const text = await response.text();

      // Simple RSS parsing for preview (in production, you'd use a proper XML parser)
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      const items = Array.from(xmlDoc.querySelectorAll('item'))
        .slice(0, 5)
        .map(item => ({
          title: item.querySelector('title')?.textContent || '',
          description: item.querySelector('description')?.textContent || '',
          pubDate: item.querySelector('pubDate')?.textContent || '',
          link: item.querySelector('link')?.textContent || '',
          category: item.querySelector('category')?.textContent || 'News',
        }));

      setRssItems(items);
    } catch (error) {
      console.error('Failed to load RSS preview:', error);
    } finally {
      setRssLoading(false);
    }
  };

  // Load RSS preview on component mount
  useEffect(() => {
    loadRssPreview();
  }, []);

  // Reset loading state when embed config changes
  useEffect(() => {
    setEmbedLoading(true);
    setEmbedError(false);
  }, [embedConfig]);

  // Generate embed URL and code
  const generateEmbedUrl = () => {
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? typeof window !== 'undefined'
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL ||
            'https://hollowknightsilksong.org'
        : 'http://localhost:3000';

    const params = new URLSearchParams();

    if (embedConfig.theme !== 'light') params.set('theme', embedConfig.theme);
    if (embedConfig.lang !== 'en') params.set('lang', embedConfig.lang);
    if (!embedConfig.showTitle) params.set('showTitle', 'false');
    if (embedConfig.layout !== 'horizontal')
      params.set('layout', embedConfig.layout);
    if (!embedConfig.border) params.set('border', 'false');

    const queryString = params.toString();
    return `${baseUrl}/embed/countdown${queryString ? '?' + queryString : ''}`;
  };

  const generateEmbedCode = () => {
    const url = generateEmbedUrl();
    return `<iframe src="${url}" width="${embedConfig.width}" height="${embedConfig.height}" frameborder="0" scrolling="no" loading="lazy" title="Hollow Knight: Silksong Countdown"></iframe>`;
  };

  return (
    <div className='moss-texture container mx-auto min-h-screen max-w-7xl px-4 py-8'>
      {/* Hero Section */}
      <div className='mb-8 text-center'>
        <h1 className='fantasy-text mb-4 text-5xl font-bold'>
          Developer Tools & Integration Hub
        </h1>
        <p className='text-hornet-light mx-auto max-w-4xl text-lg'>
          Comprehensive suite of developer tools for Hollow Knight: Silksong
          integration. Create widgets, access APIs, and stay updated with the
          latest game information.
        </p>
      </div>

      {/* Tool Sections - Desktop Grid Layout */}
      <div className='space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0'>
        {/* Countdown Widget Tool Section */}
        <div>
          <Card className='card-enhanced hover:border-hornet-secondary relative transition-colors'>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <CodeIcon className='text-hornet-secondary h-5 w-5' />
                <CardTitle className='text-hornet-light'>
                  Countdown Widget
                </CardTitle>
              </div>
              <CardDescription>
                Generate customizable countdown widgets for your website with
                themes, languages, and responsive design.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-hornet-accent'>Features:</span>
                  <Badge variant='outline'>Free</Badge>
                </div>
                <ul className='text-hornet-accent space-y-1 text-sm'>
                  <li>• Multiple themes and languages</li>
                  <li>• Responsive design</li>
                  <li>• Live preview</li>
                  <li>• Copy-paste embed code</li>
                </ul>
                <Button
                  variant='outline'
                  className='btn-outline-fantasy w-full'
                  onClick={() => toggleSection('embed')}
                >
                  {expandedSections.embed ? (
                    <>
                      <ChevronDownIcon className='mr-2 h-4 w-4' />
                      Hide Widget Generator
                    </>
                  ) : (
                    <>
                      <ChevronRightIcon className='mr-2 h-4 w-4' />
                      Show Widget Generator
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Status Integration Tool Section */}
        <div>
          <Card className='card-enhanced hover:border-hornet-secondary relative transition-colors'>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <DatabaseIcon className='text-hornet-secondary h-5 w-5' />
                <CardTitle className='text-hornet-light'>
                  API Status Integration
                </CardTitle>
              </div>
              <CardDescription>
                Access live game status data via REST API. Perfect for Discord
                bots, websites, and mobile apps.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-hornet-accent'>Endpoint:</span>
                  <Badge variant='outline'>JSON API</Badge>
                </div>
                <ul className='text-hornet-accent space-y-1 text-sm'>
                  <li>• Real-time countdown data</li>
                  <li>• Timeline updates</li>
                  <li>• Release status information</li>
                  <li>• CORS enabled</li>
                </ul>
                <Button
                  variant='outline'
                  className='btn-outline-fantasy w-full'
                  onClick={() => toggleSection('api')}
                >
                  {expandedSections.api ? (
                    <>
                      <ChevronDownIcon className='mr-2 h-4 w-4' />
                      Hide API Documentation
                    </>
                  ) : (
                    <>
                      <ChevronRightIcon className='mr-2 h-4 w-4' />
                      Show API Documentation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RSS Feed Tool Section */}
        <div>
          <Card className='card-enhanced hover:border-hornet-secondary relative transition-colors'>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <RssIcon className='text-hornet-secondary h-5 w-5' />
                <CardTitle className='text-hornet-light'>
                  RSS Feed Subscription
                </CardTitle>
              </div>
              <CardDescription>
                Subscribe to the latest Silksong updates via RSS feed.
                Compatible with all RSS readers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-hornet-accent'>Format:</span>
                  <Badge variant='outline'>RSS 2.0</Badge>
                </div>
                <ul className='text-hornet-accent space-y-1 text-sm'>
                  <li>• Latest timeline updates</li>
                  <li>• Categorized entries</li>
                  <li>• Auto-updating feed</li>
                  <li>• RSS 2.0 compatible</li>
                </ul>
                <Button
                  variant='outline'
                  className='btn-outline-fantasy w-full'
                  onClick={() => toggleSection('rss')}
                >
                  {expandedSections.rss ? (
                    <>
                      <ChevronDownIcon className='mr-2 h-4 w-4' />
                      Hide RSS Information
                    </>
                  ) : (
                    <>
                      <ChevronRightIcon className='mr-2 h-4 w-4' />
                      Show RSS Information
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Expanded Sections - Full Width Container */}
      <div className='mt-8 space-y-6'>
        {/* Countdown Widget Generator Details */}
        <Collapsible open={expandedSections.embed}>
          <CollapsibleContent>
            <Card className='border-hornet-200 dark:border-hornet-700'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <CodeIcon className='h-5 w-5' />
                  Countdown Widget Generator
                </CardTitle>
                <CardDescription>
                  Configure and generate embed code for your customizable
                  countdown widget
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid gap-8 lg:grid-cols-2'>
                  {/* Configuration Panel */}
                  <div className='space-y-6'>
                    <h3 className='text-lg font-semibold'>
                      Widget Configuration
                    </h3>

                    {/* Theme Selection */}
                    <div className='space-y-2'>
                      <Label htmlFor='theme'>Theme</Label>
                      <Select
                        value={embedConfig.theme}
                        onValueChange={(value: 'light' | 'dark') =>
                          setEmbedConfig({ ...embedConfig, theme: value })
                        }
                      >
                        <SelectTrigger id='theme'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='light'>Light</SelectItem>
                          <SelectItem value='dark'>Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Language Selection */}
                    <div className='space-y-2'>
                      <Label htmlFor='language'>Language</Label>
                      <Select
                        value={embedConfig.lang}
                        onValueChange={(value: typeof embedConfig.lang) =>
                          setEmbedConfig({ ...embedConfig, lang: value })
                        }
                      >
                        <SelectTrigger id='language'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(languageLabels).map(
                            ([code, label]) => (
                              <SelectItem key={code} value={code}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Layout Selection */}
                    <div className='space-y-2'>
                      <Label htmlFor='layout'>Layout</Label>
                      <Select
                        value={embedConfig.layout}
                        onValueChange={(value: 'horizontal' | 'vertical') =>
                          setEmbedConfig({ ...embedConfig, layout: value })
                        }
                      >
                        <SelectTrigger id='layout'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='horizontal'>
                            Horizontal
                          </SelectItem>
                          <SelectItem value='vertical'>Vertical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Toggles */}
                    <div className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <Label htmlFor='show-title'>Show Title</Label>
                        <p className='text-sm text-neutral-600 dark:text-neutral-400'>
                          Display the game title and subtitle
                        </p>
                      </div>
                      <Switch
                        id='show-title'
                        checked={embedConfig.showTitle}
                        onCheckedChange={checked =>
                          setEmbedConfig({
                            ...embedConfig,
                            showTitle: checked,
                          })
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <Label htmlFor='show-border'>Show Border</Label>
                        <p className='text-sm text-neutral-600 dark:text-neutral-400'>
                          Add a border around the widget
                        </p>
                      </div>
                      <Switch
                        id='show-border'
                        checked={embedConfig.border}
                        onCheckedChange={checked =>
                          setEmbedConfig({ ...embedConfig, border: checked })
                        }
                      />
                    </div>

                    {/* Dimensions */}
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='width'>Width (px)</Label>
                        <Input
                          id='width'
                          type='number'
                          value={embedConfig.width}
                          onChange={e =>
                            setEmbedConfig({
                              ...embedConfig,
                              width: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='height'>Height (px)</Label>
                        <Input
                          id='height'
                          type='number'
                          value={embedConfig.height}
                          onChange={e =>
                            setEmbedConfig({
                              ...embedConfig,
                              height: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview and Code Generation */}
                  <div className='space-y-6'>
                    {/* Live Preview */}
                    <div>
                      <h3 className='mb-4 text-lg font-semibold'>
                        Live Preview
                      </h3>
                      <div className='border-hornet-200 dark:border-hornet-700 flex min-h-[400px] h-[50vh] items-center justify-center rounded-lg border bg-card p-4 relative'>
                        {embedLoading && (
                          <div className='absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm'>
                            <div className='text-center space-y-2'>
                              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-hornet-500 mx-auto'></div>
                              <p className='text-sm text-muted-foreground'>Loading widget preview...</p>
                            </div>
                          </div>
                        )}
                        {embedError ? (
                          <div className='text-center space-y-3'>
                            <div className='text-red-500'>
                              <svg className='w-12 h-12 mx-auto mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z' />
                              </svg>
                            </div>
                            <p className='text-sm text-red-500'>Failed to load widget preview</p>
                            <Button 
                              variant='outline' 
                              size='sm' 
                              onClick={() => {
                                setEmbedError(false);
                                setEmbedLoading(true);
                                // Force iframe reload by key change
                                const iframe = document.querySelector('[data-widget-preview]') as HTMLIFrameElement;
                                if (iframe) {
                                  iframe.src = iframe.src;
                                }
                              }}
                            >
                              Try Again
                            </Button>
                          </div>
                        ) : (
                          <iframe
                            data-widget-preview
                            src={generateEmbedUrl()}
                            width={embedConfig.width}
                            height={embedConfig.height}
                            style={{ 
                              border: 'none', 
                              maxWidth: '100%', 
                              minHeight: '300px',
                              opacity: embedLoading ? '0' : '1',
                              transition: 'opacity 0.3s ease-in-out'
                            }}
                            title='Widget Preview'
                            loading='eager'
                            onLoad={() => {
                              setEmbedLoading(false);
                              setEmbedError(false);
                            }}
                            onError={() => {
                              setEmbedLoading(false);
                              setEmbedError(true);
                            }}
                          />
                        )}
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        className='mt-2'
                        asChild
                      >
                        <a
                          href={generateEmbedUrl()}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          Open in New Tab{' '}
                          <ExternalLinkIcon className='ml-1 h-4 w-4' />
                        </a>
                      </Button>
                    </div>

                    {/* Embed Code */}
                    <div>
                      <h3 className='mb-4 text-lg font-semibold'>
                        Embed Code
                      </h3>
                      <div className='relative'>
                        <Textarea
                          readOnly
                          value={generateEmbedCode()}
                          className='resize-none bg-neutral-900 font-mono text-sm text-neutral-100 dark:bg-neutral-950 dark:text-neutral-200'
                          rows={3}
                        />
                        <Button
                          size='sm'
                          className='bg-hornet-500 hover:bg-hornet-600 dark:bg-hornet-600 dark:hover:bg-hornet-700 absolute right-2 top-2 text-white'
                          onClick={() =>
                            copyToClipboard(generateEmbedCode(), 'embed-code')
                          }
                        >
                          {copied['embed-code'] ? (
                            <>
                              <CheckIcon className='mr-1 h-4 w-4' />
                              Copied!
                            </>
                          ) : (
                            <>
                              <CopyIcon className='mr-1 h-4 w-4' />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* API Status Integration Details */}
        <Collapsible open={expandedSections.api}>
          <CollapsibleContent>
            <Card className='border-hornet-200 dark:border-hornet-700'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <DatabaseIcon className='h-5 w-5' />
                  API Status Integration
                </CardTitle>
                <CardDescription>
                  Access live game status data through our REST API endpoint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue='overview' className='space-y-6'>
                  <TabsList>
                    <TabsTrigger value='overview'>Overview</TabsTrigger>
                    <TabsTrigger value='tester'>API Tester</TabsTrigger>
                    <TabsTrigger value='examples'>Code Examples</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value='overview' className='space-y-6'>
                    <div className='grid gap-6 md:grid-cols-2'>
                      <div>
                        <h3 className='mb-3 text-lg font-semibold'>
                          API Endpoint
                        </h3>
                        <div className='rounded-lg bg-secondary/50 p-4'>
                          <div className='mb-2 flex items-center justify-between'>
                            <code className='font-mono text-sm'>
                              GET /api/status
                            </code>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() =>
                                copyToClipboard(
                                  `${typeof window !== 'undefined' ? window.location.origin : ''}/api/status`,
                                  'api-url'
                                )
                              }
                            >
                              {copied['api-url'] ? (
                                <CheckIcon className='h-4 w-4' />
                              ) : (
                                <CopyIcon className='h-4 w-4' />
                              )}
                            </Button>
                          </div>
                          <p className='text-sm text-neutral-600 dark:text-neutral-400'>
                            Returns real-time game status and timeline data in
                            JSON format
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className='mb-3 text-lg font-semibold'>
                          Response Format
                        </h3>
                        <div className='space-y-2 text-sm'>
                          <div className='flex justify-between'>
                            <span>Format:</span>
                            <Badge variant='outline'>JSON</Badge>
                          </div>
                          <div className='flex justify-between'>
                            <span>Cache:</span>
                            <Badge variant='outline'>5 minutes</Badge>
                          </div>
                          <div className='flex justify-between'>
                            <span>CORS:</span>
                            <Badge variant='outline'>Enabled</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* API Tester Tab */}
                  <TabsContent value='tester' className='space-y-6'>
                    <div className='mb-4 flex items-center gap-4'>
                      <Button
                        onClick={testApiEndpoint}
                        disabled={apiLoading}
                        className='bg-hornet-500 hover:bg-hornet-600 dark:bg-hornet-600 dark:hover:bg-hornet-700 flex items-center gap-2 text-white'
                      >
                        {apiLoading ? (
                          <RefreshCwIcon className='h-4 w-4 animate-spin' />
                        ) : (
                          <PlayIcon className='h-4 w-4' />
                        )}
                        Test API Endpoint
                      </Button>
                      {apiError && (
                        <Badge variant='destructive'>Error: {apiError}</Badge>
                      )}
                    </div>

                    {apiResponse && (
                      <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                          <h3 className='text-lg font-semibold'>
                            API Response
                          </h3>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() =>
                              copyToClipboard(
                                JSON.stringify(apiResponse, null, 2),
                                'api-response'
                              )
                            }
                          >
                            {copied['api-response'] ? (
                              <CheckIcon className='h-4 w-4' />
                            ) : (
                              <CopyIcon className='h-4 w-4' />
                            )}
                          </Button>
                        </div>
                        <Textarea
                          readOnly
                          value={JSON.stringify(apiResponse, null, 2)}
                          className='bg-neutral-900 font-mono text-xs text-neutral-100 dark:bg-neutral-950 dark:text-neutral-200'
                          rows={12}
                        />
                      </div>
                    )}
                  </TabsContent>

                  {/* Code Examples Tab */}
                  <TabsContent value='examples' className='space-y-6'>
                    <div className='relative'>
                      <Textarea
                        readOnly
                        value={`// JavaScript Example
async function getSilksongStatus() {
  try {
    const response = await fetch('/api/status');
    const data = await response.json();
    console.log('Days remaining:', data.daysRemaining);
    return data;
  } catch (error) {
    console.error('Failed to fetch:', error);
  }
}`}
                        className='bg-neutral-900 font-mono text-xs text-neutral-100 dark:bg-neutral-950 dark:text-neutral-200'
                        rows={10}
                      />
                      <Button
                        size='sm'
                        className='bg-hornet-500 hover:bg-hornet-600 absolute right-2 top-2 text-white'
                        onClick={() =>
                          copyToClipboard(
                            `// JavaScript Example
async function getSilksongStatus() {
  try {
    const response = await fetch('/api/status');
    const data = await response.json();
    console.log('Days remaining:', data.daysRemaining);
    return data;
  } catch (error) {
    console.error('Failed to fetch:', error);
  }
}`,
                            'js-example'
                          )
                        }
                      >
                        {copied['js-example'] ? (
                          <CheckIcon className='h-4 w-4' />
                        ) : (
                          <CopyIcon className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* RSS Feed Details */}
        <Collapsible open={expandedSections.rss}>
          <CollapsibleContent>
            <Card className='border-hornet-200 dark:border-hornet-700'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <RssIcon className='h-5 w-5' />
                  RSS Feed Subscription
                </CardTitle>
                <CardDescription>
                  Stay updated with the latest Silksong news through our RSS
                  feed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  <div>
                    <h3 className='mb-3 text-lg font-semibold'>
                      RSS Feed URL
                    </h3>
                    <div className='rounded-lg bg-secondary/50 p-4'>
                      <div className='mb-2 flex items-center justify-between'>
                        <code className='break-all font-mono text-sm'>
                          {typeof window !== 'undefined'
                            ? window.location.origin
                            : ''}
                          /feed.xml
                        </code>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() =>
                            copyToClipboard(
                              `${typeof window !== 'undefined' ? window.location.origin : ''}/feed.xml`,
                              'rss-url'
                            )
                          }
                        >
                          {copied['rss-url'] ? (
                            <CheckIcon className='h-4 w-4' />
                          ) : (
                            <CopyIcon className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        RSS 2.0 compatible feed with latest timeline updates
                      </p>
                    </div>
                  </div>

                  {/* RSS Preview */}
                  {rssItems.length > 0 && (
                    <div>
                      <h3 className='mb-3 text-lg font-semibold'>
                        Recent Updates Preview
                      </h3>
                      <div className='space-y-3'>
                        {rssItems.map((item, index) => (
                          <div key={index} className='rounded-lg border bg-card/50 p-3'>
                            <div className='flex items-start justify-between gap-4'>
                              <div className='min-w-0 flex-1'>
                                <h4 className='font-medium text-sm leading-tight'>
                                  {item.title}
                                </h4>
                                <p className='text-xs text-muted-foreground mt-1'>
                                  {item.description}
                                </p>
                              </div>
                              <Badge variant='secondary' className='text-xs'>
                                {item.category}
                              </Badge>
                            </div>
                            <p className='text-xs text-muted-foreground mt-2'>
                              {new Date(item.pubDate).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className='text-center'>
                    <Button variant='outline' asChild>
                      <a
                        href='/feed.xml'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        View Full RSS Feed{' '}
                        <ExternalLinkIcon className='ml-2 h-4 w-4' />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
