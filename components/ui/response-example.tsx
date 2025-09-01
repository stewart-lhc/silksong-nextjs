/**
 * ResponseExample Component
 * Displays formatted API response examples with syntax highlighting
 */

'use client';

import React from 'react';
import { CodeBlock } from '@/components/ui/code-block';

interface ResponseExampleProps {
  data: unknown;
  status: number;
  className?: string;
}

export function ResponseExample({ data, status, className }: ResponseExampleProps) {
  if (!data) {
    return (
      <div className="text-muted-foreground text-sm italic">
        No response body
      </div>
    );
  }

  // Format the response data
  const formattedData = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const language = typeof data === 'string' && data.startsWith('<?xml') ? 'xml' : 'json';
  
  return (
    <div className={className}>
      <CodeBlock
        code={formattedData}
        language={language}
        title={`Response (${status})`}
        showLineNumbers={false}
      />
    </div>
  );
}