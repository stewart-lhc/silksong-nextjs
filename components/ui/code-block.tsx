/**
 * CodeBlock Component
 * Displays syntax-highlighted code with copy functionality
 */

'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
  className?: string;
  showLineNumbers?: boolean;
}

const languageLabels: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  bash: 'Bash',
  json: 'JSON',
  xml: 'XML',
  html: 'HTML',
  css: 'CSS',
  sql: 'SQL',
};

const languageClasses: Record<string, string> = {
  javascript: 'text-hornet-warning-600',
  typescript: 'text-hornet-info-600',
  python: 'text-hornet-success-600',
  bash: 'text-hornet-neutral-600',
  json: 'text-hornet-warning-600',
  xml: 'text-hornet-auxiliary-600',
  html: 'text-hornet-error-600',
  css: 'text-hornet-info-500',
  sql: 'text-hornet-secondary-600',
};

export function CodeBlock({ 
  code, 
  language, 
  title, 
  className,
  showLineNumbers = false 
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const lines = code.split('\n');
  const languageLabel = languageLabels[language] || language;
  const languageClass = languageClasses[language] || 'text-hornet-neutral-600';

  return (
    <div className={cn("relative group", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-hornet-neutral-200 dark:bg-hornet-neutral-800 rounded-t-lg border-b border-hornet-neutral-300 dark:border-hornet-neutral-700">
        <div className="flex items-center gap-2">
          {title && (
            <span className="text-sm font-medium text-hornet-neutral-900 dark:text-hornet-neutral-100">
              {title}
            </span>
          )}
          <span className={cn("text-xs font-mono px-2 py-1 rounded", languageClass, "bg-white dark:bg-hornet-neutral-900")}>
            {languageLabel}
          </span>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="h-7 w-7 p-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <Check className="h-3 w-3 text-hornet-success-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Code Content */}
      <div className="relative">
        <pre className="overflow-x-auto bg-hornet-neutral-900 dark:bg-hornet-neutral-950 rounded-b-lg p-4 text-sm">
          <code className="font-mono text-hornet-neutral-200">
            {showLineNumbers ? (
              <div className="table w-full">
                {lines.map((line, index) => (
                  <div key={index} className="table-row">
                    <span className="table-cell pr-4 text-hornet-neutral-400 select-none text-right w-8">
                      {index + 1}
                    </span>
                    <span className="table-cell">{line}</span>
                  </div>
                ))}
              </div>
            ) : (
              code
            )}
          </code>
        </pre>
        
        {/* Copy overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCopy}
            className="h-7 px-2 text-xs"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}