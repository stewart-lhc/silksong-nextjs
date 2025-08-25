'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CopyIcon, CheckIcon, ExternalLinkIcon } from 'lucide-react';

// Note: Metadata is handled by the parent layout since this is a client component

interface EmbedConfig {
  theme: 'light' | 'dark';
  lang: 'en' | 'zh' | 'es' | 'fr' | 'de' | 'ja';
  showTitle: boolean;
  layout: 'horizontal' | 'vertical';
  border: boolean;
  width: string;
  height: string;
}

const parameters = [
  {
    name: 'theme',
    type: 'select',
    options: ['light', 'dark'],
    default: 'light',
    description: 'Widget color theme'
  },
  {
    name: 'lang',
    type: 'select', 
    options: ['en', 'zh', 'es', 'fr', 'de', 'ja'],
    default: 'en',
    description: 'Display language'
  },
  {
    name: 'showTitle',
    type: 'boolean',
    default: 'true',
    description: 'Show/hide the title and subtitle'
  },
  {
    name: 'layout',
    type: 'select',
    options: ['horizontal', 'vertical'],
    default: 'horizontal',
    description: 'Widget layout orientation'
  },
  {
    name: 'border',
    type: 'boolean',
    default: 'true',
    description: 'Show/hide the border around widget'
  }
];

const languageLabels = {
  en: 'English',
  zh: '中文',
  es: 'Español',
  fr: 'Français', 
  de: 'Deutsch',
  ja: '日本語'
};

export default function EmbedToolsPage() {
  const [config, setConfig] = useState<EmbedConfig>({
    theme: 'light',
    lang: 'en',
    showTitle: true,
    layout: 'horizontal',
    border: true,
    width: '400',
    height: '300'
  });

  const [copied, setCopied] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState(false);

  // Reset loading state when config changes
  useEffect(() => {
    setPreviewLoading(true);
    setPreviewError(false);
  }, [config]);

  const generateEmbedUrl = () => {
    // Force localhost in development, regardless of window.location
    const baseUrl = process.env.NODE_ENV === 'production'
      ? (typeof window !== 'undefined' 
          ? window.location.origin 
          : process.env.NEXT_PUBLIC_SITE_URL || 'https://hollowknightsilksong.org')
      : 'http://localhost:3000';
    
    // Debug logging (only in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔧 generateEmbedUrl Debug:', {
        NODE_ENV: process.env.NODE_ENV,
        windowOrigin: typeof window !== 'undefined' ? window.location.origin : 'undefined',
        baseUrl,
        finalUrl: `${baseUrl}/embed/countdown`
      });
    }
    
    const params = new URLSearchParams();
    
    if (config.theme !== 'light') params.set('theme', config.theme);
    if (config.lang !== 'en') params.set('lang', config.lang);
    if (!config.showTitle) params.set('showTitle', 'false');
    if (config.layout !== 'horizontal') params.set('layout', config.layout);
    if (!config.border) params.set('border', 'false');
    
    const queryString = params.toString();
    return `${baseUrl}/embed/countdown${queryString ? '?' + queryString : ''}`;
  };

  const generateEmbedCode = () => {
    const url = generateEmbedUrl();
    return `<iframe src="${url}" width="${config.width}" height="${config.height}" frameborder="0" scrolling="no" loading="lazy" title="Hollow Knight: Silksong Countdown"></iframe>`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 fantasy-text text-foreground">
              Embed Code Generator
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Create a customizable countdown widget for Hollow Knight: Silksong to embed on your website, 
              blog, or social media. Fully responsive and lightweight.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>Widget Configuration</CardTitle>
            <CardDescription>Customize your countdown widget appearance and behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={config.theme} onValueChange={(value: 'light' | 'dark') => setConfig({...config, theme: value})}>
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={config.lang} onValueChange={(value: typeof config.lang) => setConfig({...config, lang: value})}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languageLabels).map(([code, label]) => (
                    <SelectItem key={code} value={code}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Layout */}
            <div className="space-y-2">
              <Label htmlFor="layout">Layout</Label>
              <Select value={config.layout} onValueChange={(value: 'horizontal' | 'vertical') => setConfig({...config, layout: value})}>
                <SelectTrigger id="layout">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                  <SelectItem value="vertical">Vertical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Show Title */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-title">Show Title</Label>
                <p className="text-sm text-muted-foreground">Display the game title and subtitle</p>
              </div>
              <Switch
                id="show-title"
                checked={config.showTitle}
                onCheckedChange={(checked) => setConfig({...config, showTitle: checked})}
              />
            </div>

            {/* Show Border */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-border">Show Border</Label>
                <p className="text-sm text-muted-foreground">Add a border around the widget</p>
              </div>
              <Switch
                id="show-border"
                checked={config.border}
                onCheckedChange={(checked) => setConfig({...config, border: checked})}
              />
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={config.width}
                  onChange={(e) => setConfig({...config, width: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={config.height}
                  onChange={(e) => setConfig({...config, height: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview & Code */}
        <div className="space-y-6">
          {/* Preview */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>See how your widget will look</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-muted/20 min-h-[600px] h-[70vh] flex items-center justify-center relative">
                {previewLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm rounded-lg">
                    <div className="text-center space-y-3">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground">Loading preview...</p>
                    </div>
                  </div>
                )}
                {previewError ? (
                  <div className="text-center space-y-4">
                    <div className="text-destructive">
                      <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-destructive mb-2">Failed to load preview</p>
                      <p className="text-sm text-muted-foreground mb-4">The widget preview couldn't be loaded. This might be due to a network issue or server error.</p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setPreviewError(false);
                          setPreviewLoading(true);
                          // Force iframe reload
                          const iframe = document.querySelector('[data-embed-preview]') as HTMLIFrameElement;
                          if (iframe) {
                            iframe.src = iframe.src;
                          }
                        }}
                      >
                        Retry Preview
                      </Button>
                    </div>
                  </div>
                ) : (
                  <iframe
                    data-embed-preview
                    src={generateEmbedUrl()}
                    width={config.width}
                    height={config.height}
                    title="Widget Preview"
                    loading="eager"
                    onLoad={() => {
                      setPreviewLoading(false);
                      setPreviewError(false);
                    }}
                    onError={() => {
                      setPreviewLoading(false);
                      setPreviewError(true);
                    }}
                    style={{
                      border: 'none',
                      maxWidth: '100%',
                      minHeight: '500px',
                      opacity: previewLoading ? '0' : '1',
                      transition: 'opacity 0.3s ease-in-out'
                    }}
                  />
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" asChild className="btn-outline-fantasy">
                  <a href={generateEmbedUrl()} target="_blank" rel="noopener noreferrer">
                    Open in New Tab <ExternalLinkIcon className="w-4 h-4 ml-1" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Embed Code */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
              <CardDescription>Copy this code to your website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Textarea
                  readOnly
                  value={generateEmbedCode()}
                  className="font-mono text-sm resize-none"
                  rows={2}
                />
                <Button
                  size="sm"
                  className="absolute top-2 right-2 btn-fantasy"
                  onClick={() => copyToClipboard(generateEmbedCode())}
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Parameter Reference */}
      <Card className="mt-8 card-enhanced">
        <CardHeader>
          <CardTitle>Parameter Reference</CardTitle>
          <CardDescription>
            Complete list of available URL parameters for the embed widget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              All parameters are optional. Default values will be used if not specified.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Options/Default</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parameters.map((param, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">{param.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{param.type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {param.options ? (
                      <>
                        {param.options.join(', ')}
                        <br />
                        <span className="text-muted-foreground">default: {param.default}</span>
                      </>
                    ) : (
                      `default: ${param.default}`
                    )}
                  </TableCell>
                  <TableCell>{param.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card className="mt-8 card-enhanced">
        <CardHeader>
          <CardTitle>Usage Guidelines</CardTitle>
          <CardDescription>Best practices for embedding the countdown widget</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Performance</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• The widget is lightweight (~8KB) and loads asynchronously</li>
              <li>• Uses native JavaScript with no external dependencies</li>
              <li>• Updates every second with minimal performance impact</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Responsive Design</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Widget adapts to container width automatically</li>
              <li>• Vertical layout recommended for narrow containers (≤300px)</li>
              <li>• Horizontal layout works best for wider spaces (≥350px)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Accessibility</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Includes proper ARIA labels and semantic HTML</li>
              <li>• High contrast ratios in both light and dark themes</li>
              <li>• Screen reader friendly with meaningful text updates</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}