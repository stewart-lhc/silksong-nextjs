'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function OGTestPage() {
  const [lang, setLang] = useState<'en' | 'zh'>('en');
  const [releaseDate, setReleaseDate] = useState('2025-12-31');
  const [ogUrl, setOgUrl] = useState('');

  const generateOGUrl = () => {
    const params = new URLSearchParams();
    params.set('lang', lang);
    if (releaseDate) params.set('releaseDate', releaseDate);
    
    const url = `/api/og?${params.toString()}`;
    setOgUrl(url);
  };

  const testUrls = [
    { label: 'Default (English)', url: '/api/og' },
    { label: 'Chinese', url: '/api/og?lang=zh' },
    { label: 'Custom Date (English)', url: '/api/og?releaseDate=2024-12-25' },
    { label: 'Custom Date (Chinese)', url: '/api/og?lang=zh&releaseDate=2024-12-25' },
    { label: 'Released Status', url: '/api/og?releaseDate=2024-01-01' },
    { label: 'Urgent (7 days)', url: '/api/og?releaseDate=2024-12-31' },
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">OG Image Generator Test</h1>
        <p className="text-muted-foreground">
          Test the dynamic OG image generation API with different parameters.
        </p>
      </div>

      {/* Custom Generator */}
      <Card>
        <CardHeader>
          <CardTitle>Custom OG Image Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lang">Language</Label>
              <Select value={lang} onValueChange={(value: 'en' | 'zh') => setLang(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="releaseDate">Release Date</Label>
              <Input
                id="releaseDate"
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>
          </div>
          
          <Button onClick={generateOGUrl} className="w-full">
            Generate OG URL
          </Button>
          
          {ogUrl && (
            <div className="space-y-2">
              <Label>Generated URL:</Label>
              <div className="p-2 bg-muted rounded font-mono text-sm">
                {ogUrl}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => window.open(ogUrl, '_blank')}
                >
                  Open Image
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigator.clipboard.writeText(window.location.origin + ogUrl)}
                >
                  Copy Full URL
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preset Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Preset Test URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {testUrls.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h3 className="font-medium">{test.label}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{test.url}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(test.url, '_blank')}
                  >
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(window.location.origin + test.url)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Endpoint</h3>
            <code className="text-sm bg-muted p-1 rounded">GET /api/og</code>
          </div>
          
          <div>
            <h3 className="font-semibold">Parameters</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code>lang</code> - Language (en|zh), default: en</li>
              <li><code>releaseDate</code> - Release date (YYYY-MM-DD), default: 2025-12-31</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold">Response</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Content-Type: image/png</li>
              <li>Size: 1200x630 pixels</li>
              <li>Cache-Control: public, max-age=3600, stale-while-revalidate=300</li>
              <li>ETag: 16-character hex string</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold">Variants</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>released</strong> - Game is already released (date ≤ today)</li>
              <li><strong>lt7</strong> - Less than 7 days remaining (urgent red background)</li>
              <li><strong>lt30</strong> - Less than 30 days remaining</li>
              <li><strong>30plus</strong> - More than 30 days remaining</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold">Font Configuration</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Primary: <code>OG_FONT_PRIMARY</code> environment variable</li>
              <li>Fallback: <code>OG_FONT_FALLBACK</code> environment variable</li>
              <li>Missing fonts: Set <code>FAIL_ON_OG_FONT_MISSING=false</code> to redirect to static images</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}