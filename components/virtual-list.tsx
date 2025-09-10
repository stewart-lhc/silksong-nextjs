'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  threshold?: number; // Minimum items to enable virtualization
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  threshold = 20
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  
  // If items are below threshold, render normally for better UX
  const shouldVirtualize = items.length > threshold;
  
  // Calculate visible range with optimized algorithm
  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    if (!shouldVirtualize) {
      return {
        startIndex: 0,
        endIndex: items.length - 1,
        totalHeight: items.length * itemHeight
      };
    }
    
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2);
    
    return {
      startIndex: start,
      endIndex: end,
      totalHeight: items.length * itemHeight
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan, shouldVirtualize]);
  
  // Get visible items with memoization
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1);
  }, [items, startIndex, endIndex]);
  
  // Scroll handler with optimized throttling
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    // Use requestAnimationFrame for smooth scrolling
    requestAnimationFrame(() => {
      setScrollTop(target.scrollTop);
    });
  }, []);
  
  // Auto-scroll to top when items change significantly
  useEffect(() => {
    if (scrollElementRef.current && items.length === 0) {
      scrollElementRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [items.length]);
  
  // Non-virtualized rendering for small lists
  if (!shouldVirtualize) {
    return (
      <ScrollArea className={`h-full ${className}`} ref={scrollElementRef}>
        <div className="space-y-0">
          {items.map((item, index) => (
            <div key={index}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  }
  
  // Virtualized rendering for large lists
  return (
    <ScrollArea 
      className={`h-full ${className}`} 
      ref={scrollElementRef}
      onScrollCapture={handleScroll}
    >
      <div 
        style={{ height: totalHeight, position: 'relative' }}
        role="list"
        aria-label={`Virtual list with ${items.length} items`}
      >
        <div
          style={{
            transform: `translateY(${startIndex * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              role="listitem"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}

// Hook for dynamic height calculation based on view mode
export function useItemHeight(viewMode: 'compact' | 'detailed') {
  return useMemo(() => {
    return viewMode === 'compact' ? 120 : 280; // Optimized heights
  }, [viewMode]);
}

// High-performance list item wrapper
export const ListItemWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={`${className}`}>
    {children}
  </div>
);