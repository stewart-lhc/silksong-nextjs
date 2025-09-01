/**
 * APIEndpoint Component
 * Displays comprehensive API endpoint documentation with examples
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeBlock } from '@/components/ui/code-block';
import { ResponseExample } from '@/components/ui/response-example';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronDown, 
  ChevronRight, 
  Code, 
  Play, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Parameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  example?: string;
}

interface Header {
  name: string;
  description: string;
  required: boolean;
  example?: string;
}

interface Response {
  status: number;
  description: string;
  example: unknown;
}

interface CodeExample {
  language: string;
  title: string;
  code: string;
}

interface APIEndpointProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  title: string;
  description: string;
  parameters?: Parameter[];
  headers?: Header[];
  responses: Response[];
  codeExamples: CodeExample[];
  className?: string;
}

const methodColors: Record<string, string> = {
  GET: 'bg-hornet-success-100 text-hornet-success-800 dark:bg-hornet-success-900 dark:text-hornet-success-200',
  POST: 'bg-hornet-info-100 text-hornet-info-800 dark:bg-hornet-info-900 dark:text-hornet-info-200',
  PUT: 'bg-hornet-warning-100 text-hornet-warning-800 dark:bg-hornet-warning-900 dark:text-hornet-warning-200',
  DELETE: 'bg-hornet-error-100 text-hornet-error-800 dark:bg-hornet-error-900 dark:text-hornet-error-200',
  PATCH: 'bg-hornet-auxiliary-100 text-hornet-auxiliary-800 dark:bg-hornet-auxiliary-900 dark:text-hornet-auxiliary-200',
};

const statusColors: Record<number, string> = {
  200: 'text-hornet-success-600',
  201: 'text-hornet-success-600',
  304: 'text-hornet-info-600',
  400: 'text-hornet-error-600',
  404: 'text-hornet-error-600',
  409: 'text-hornet-warning-600',
  429: 'text-hornet-warning-600',
  500: 'text-hornet-error-600',
};

export function APIEndpoint({
  method,
  endpoint,
  title,
  description,
  parameters = [],
  headers = [],
  responses,
  codeExamples,
  className
}: APIEndpointProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [copiedUrl, setCopiedUrl] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const copyEndpointUrl = async () => {
    const fullUrl = `https://silksong-nextjs.vercel.app${endpoint}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const tryItOut = () => {
    const fullUrl = `https://silksong-nextjs.vercel.app${endpoint}`;
    window.open(fullUrl, '_blank');
  };

  return (
    <Card className={cn("border-hornet-200 dark:border-hornet-700 shadow-xl bg-white/80 dark:bg-hornet-neutral-900/80 backdrop-blur", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge className={methodColors[method]}>
                {method}
              </Badge>
              <code className="text-lg font-mono bg-hornet-neutral-100 dark:bg-hornet-neutral-800 px-3 py-1 rounded">
                {endpoint}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyEndpointUrl}
                className="h-7 w-7 p-0"
              >
                {copiedUrl ? (
                  <Check className="h-3 w-3 text-hornet-success-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="text-base mt-1">
              {description}
            </CardDescription>
          </div>
          
          {method === 'GET' && (
            <Button onClick={tryItOut} variant="outline">
              <Play className="mr-2 h-4 w-4" />
              Try it
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Parameters Section */}
        {parameters.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('parameters')}
              className="flex items-center gap-2 text-lg font-semibold mb-3 hover:text-hornet-600 transition-colors"
            >
              {expandedSections.has('parameters') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Parameters
            </button>
            
            {expandedSections.has('parameters') && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-hornet-neutral-50 dark:bg-hornet-neutral-800 px-4 py-2 border-b">
                  <div className="grid grid-cols-5 gap-4 text-sm font-medium">
                    <div>Name</div>
                    <div>Type</div>
                    <div>Required</div>
                    <div className="col-span-2">Description</div>
                  </div>
                </div>
                <div className="divide-y">
                  {parameters.map((param, index) => (
                    <div key={index} className="px-4 py-3 grid grid-cols-5 gap-4 text-sm">
                      <div className="font-mono font-semibold">{param.name}</div>
                      <div>
                        <Badge variant="outline" className="text-xs">
                          {param.type}
                        </Badge>
                      </div>
                      <div>
                        {param.required ? (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Optional</Badge>
                        )}
                      </div>
                      <div className="col-span-2">
                        <div>{param.description}</div>
                        {param.example && (
                          <div className="text-muted-foreground mt-1">
                            Example: <code className="text-xs bg-hornet-neutral-100 dark:bg-hornet-neutral-800 px-1 rounded">{param.example}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Headers Section */}
        {headers.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('headers')}
              className="flex items-center gap-2 text-lg font-semibold mb-3 hover:text-hornet-600 transition-colors"
            >
              {expandedSections.has('headers') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Headers
            </button>
            
            {expandedSections.has('headers') && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-hornet-neutral-50 dark:bg-hornet-neutral-800 px-4 py-2 border-b">
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium">
                    <div>Name</div>
                    <div>Required</div>
                    <div className="col-span-2">Description</div>
                  </div>
                </div>
                <div className="divide-y">
                  {headers.map((header, index) => (
                    <div key={index} className="px-4 py-3 grid grid-cols-4 gap-4 text-sm">
                      <div className="font-mono font-semibold">{header.name}</div>
                      <div>
                        {header.required ? (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Optional</Badge>
                        )}
                      </div>
                      <div className="col-span-2">
                        <div>{header.description}</div>
                        {header.example && (
                          <div className="text-muted-foreground mt-1">
                            Example: <code className="text-xs bg-hornet-neutral-100 dark:bg-hornet-neutral-800 px-1 rounded">{header.example}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Responses Section */}
        <div>
          <button
            onClick={() => toggleSection('responses')}
            className="flex items-center gap-2 text-lg font-semibold mb-3 hover:text-blue-600 transition-colors"
          >
            {expandedSections.has('responses') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Responses
          </button>
          
          {expandedSections.has('responses') && (
            <div className="space-y-4">
              {responses.map((response, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="outline"
                      className={cn("font-mono", statusColors[response.status] || 'text-hornet-neutral-600')}
                    >
                      {response.status}
                    </Badge>
                    <span className="font-semibold">{response.description}</span>
                  </div>
                  {response.example !== undefined && (
                    <ResponseExample 
                      data={response.example}
                      status={response.status}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Code Examples Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Examples
          </h3>
          
          <Tabs defaultValue={codeExamples[0]?.language} className="w-full">
            <TabsList className="mb-4">
              {codeExamples.map((example, index) => (
                <TabsTrigger key={index} value={example.language}>
                  {example.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {codeExamples.map((example, index) => (
              <TabsContent key={index} value={example.language}>
                <CodeBlock
                  code={example.code}
                  language={example.language}
                  title={example.title}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}