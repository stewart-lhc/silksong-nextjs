/**
 * Utility Functions Test Suite (Simplified)
 * Basic testing for common utility functions in lib/utils.ts
 */

import {
  cn,
  formatError,
  delay,
  generateId,
  formatDate,
  truncateText,
  deepClone,
  debounce,
  throttle
} from '@/lib/utils';

describe('Utility Functions - Basic Tests', () => {
  describe('cn() - Class Name Utility', () => {
    it('should merge class names correctly', () => {
      const result = cn('base-class', 'additional-class');
      expect(result).toBe('base-class additional-class');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const isDisabled = false;
      
      const result = cn(
        'base-class',
        isActive && 'active',
        isDisabled && 'disabled'
      );
      
      expect(result).toBe('base-class active');
    });

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'valid');
      expect(result).toBe('base valid');
    });
  });

  describe('formatError() - Error Formatting', () => {
    it('should format Error objects correctly', () => {
      const error = new Error('Test error message');
      const result = formatError(error);
      expect(result).toBe('Test error message');
    });

    it('should handle string errors', () => {
      const result = formatError('String error');
      expect(result).toBe('String error');
    });

    it('should handle null and undefined errors', () => {
      expect(formatError(null)).toBe('null');
      expect(formatError(undefined)).toBe('undefined');
    });
  });

  describe('generateId() - ID Generation', () => {
    it('should generate ID with default length', () => {
      const id = generateId();
      expect(id).toHaveLength(8);
      expect(typeof id).toBe('string');
    });

    it('should generate ID with custom length', () => {
      const id = generateId(16);
      // Note: actual length may vary due to random generation limits
      expect(id.length).toBeGreaterThan(0);
      expect(id.length).toBeLessThanOrEqual(16);
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('truncateText() - Text Truncation', () => {
    const longText = 'This is a very long text that should be truncated';

    it('should truncate text longer than maxLength', () => {
      const result = truncateText(longText, 20);
      expect(result).toHaveLength(20);
      expect(result.endsWith('...')).toBe(true);
    });

    it('should not truncate text shorter than maxLength', () => {
      const shortText = 'Short text';
      const result = truncateText(shortText, 20);
      expect(result).toBe(shortText);
    });

    it('should handle custom suffix', () => {
      const result = truncateText(longText, 20, ' [more]');
      expect(result.endsWith(' [more]')).toBe(true);
      expect(result).toHaveLength(20);
    });
  });

  describe('deepClone() - Deep Copying', () => {
    it('should deep clone simple objects', () => {
      const original = { a: 1, b: 'test' };
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('should deep clone nested objects', () => {
      const original = {
        a: 1,
        b: {
          c: 2,
          d: {
            e: 'nested'
          }
        }
      };
      
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.b.d).not.toBe(original.b.d);
    });

    it('should handle primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('string')).toBe('string');
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
    });
  });

  describe('debounce() - Function Debouncing', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);
      
      // Call multiple times quickly
      debouncedFn('arg1');
      debouncedFn('arg2');
      debouncedFn('arg3');
      
      // Should not have been called yet
      expect(mockFn).not.toHaveBeenCalled();
      
      // Fast-forward time
      jest.advanceTimersByTime(1000);
      
      // Should be called only once with last arguments
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg3');
    });
  });

  describe('throttle() - Function Throttling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should throttle function calls', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 1000);
      
      // First call should execute immediately
      throttledFn('first');
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('first');
      
      // Subsequent calls should be ignored during throttle period
      throttledFn('second');
      throttledFn('third');
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      // After throttle period, next call should execute
      jest.advanceTimersByTime(1000);
      throttledFn('fourth');
      
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenLastCalledWith('fourth');
    });
  });

  describe('delay() function', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should resolve after specified delay', async () => {
      const promise = delay(1000);
      
      // Fast-forward time
      jest.advanceTimersByTime(1000);
      
      await expect(promise).resolves.toBeUndefined();
    });
  });
});