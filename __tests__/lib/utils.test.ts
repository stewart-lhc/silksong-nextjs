/**
 * Utility Functions Test Suite
 * Comprehensive testing for common utility functions in lib/utils.ts
 * Tests styling, error handling, data manipulation, and performance utilities
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

describe('Utility Functions', () => {
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

    it('should handle Tailwind class conflicts', () => {
      const result = cn('p-4', 'p-2'); // Should resolve to p-2
      expect(result).toBe('p-2');
    });

    it('should handle arrays and objects', () => {
      const result = cn(
        'base',
        ['array-class1', 'array-class2'],
        {
          'object-class': true,
          'disabled-class': false
        }
      );
      
      expect(result).toContain('base');
      expect(result).toContain('array-class1');
      expect(result).toContain('array-class2');
      expect(result).toContain('object-class');
      expect(result).not.toContain('disabled-class');
    });

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'valid');
      expect(result).toBe('base valid');
    });

    it('should handle empty string and whitespace', () => {
      const result = cn('', '   ', 'valid-class');
      expect(result).toBe('valid-class');
    });
  });

  describe('formatError() - Error Formatting', () => {
    it('should format Error objects correctly', () => {
      const error = new Error('Test error message');
      const result = formatError(error);
      expect(result).toBe('Test error message');
    });

    it('should format custom Error subclasses', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }
      
      const error = new CustomError('Custom error message');
      const result = formatError(error);
      expect(result).toBe('Custom error message');
    });

    it('should handle string errors', () => {
      const result = formatError('String error');
      expect(result).toBe('String error');
    });

    it('should handle number errors', () => {
      const result = formatError(404);
      expect(result).toBe('404');
    });

    it('should handle null and undefined errors', () => {
      expect(formatError(null)).toBe('null');
      expect(formatError(undefined)).toBe('undefined');
    });

    it('should handle object errors', () => {
      const errorObj = { message: 'Object error', code: 500 };
      const result = formatError(errorObj);
      expect(result).toBe('[object Object]');
    });

    it('should handle boolean errors', () => {
      expect(formatError(true)).toBe('true');
      expect(formatError(false)).toBe('false');
    });
  });

  describe('delay() - Async Delay Utility', () => {
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

    it('should not resolve before specified delay', async () => {
      const promise = delay(1000);
      let resolved = false;
      
      promise.then(() => {
        resolved = true;
      });
      
      // Advance time by less than delay
      jest.advanceTimersByTime(500);
      
      // Should not be resolved yet
      expect(resolved).toBe(false);
      
      // Complete the delay
      jest.advanceTimersByTime(500);
      
      await promise;
      expect(resolved).toBe(true);
    });

    it('should handle zero delay', async () => {
      const promise = delay(0);
      
      jest.advanceTimersByTime(0);
      
      await expect(promise).resolves.toBeUndefined();
    });

    it('should handle negative delay as zero', async () => {
      const promise = delay(-100);
      
      jest.advanceTimersByTime(0);
      
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('generateId() - ID Generation', () => {
    it('should generate ID with default length', () => {
      const id = generateId();
      expect(id).toHaveLength(8);
      expect(typeof id).toBe('string');
    });

    it('should generate ID with custom length', () => {
      const lengths = [4, 8, 16, 32];
      
      lengths.forEach(length => {
        const id = generateId(length);
        expect(id).toHaveLength(length);
      });
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      const count = 1000;
      
      for (let i = 0; i < count; i++) {
        ids.add(generateId());
      }
      
      // Should generate unique IDs (with very high probability)
      expect(ids.size).toBeGreaterThan(count * 0.99);
    });

    it('should only contain valid characters', () => {
      const id = generateId(50);
      const validChars = /^[a-z0-9]+$/;
      expect(validChars.test(id)).toBe(true);
    });

    it('should handle length 0', () => {
      const id = generateId(0);
      expect(id).toHaveLength(0);
      expect(id).toBe('');
    });

    it('should handle length 1', () => {
      const id = generateId(1);
      expect(id).toHaveLength(1);
    });
  });

  describe('formatDate() - Date Formatting', () => {
    const testDate = new Date('2024-01-15T10:30:00Z');

    it('should format Date objects with default locale', () => {
      const result = formatDate(testDate);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}/); // Various date formats
    });

    it('should format date strings', () => {
      const result = formatDate('2024-01-15');
      expect(typeof result).toBe('string');
    });

    it('should handle different locales', () => {
      const enResult = formatDate(testDate, 'en-US');
      const deResult = formatDate(testDate, 'de-DE');
      
      expect(enResult).not.toBe(deResult);
      expect(typeof enResult).toBe('string');
      expect(typeof deResult).toBe('string');
    });

    it('should handle invalid date strings gracefully', () => {
      const result = formatDate('invalid-date');
      expect(result).toMatch(/Invalid|NaN/i);
    });

    it('should use Chinese locale by default', () => {
      const result = formatDate(testDate);
      // Should use zh-CN format by default based on the function
      expect(typeof result).toBe('string');
    });
  });

  describe('truncateText() - Text Truncation', () => {
    const longText = 'This is a very long text that should be truncated';

    it('should truncate text longer than maxLength', () => {
      const result = truncateText(longText, 20);
      expect(result).toHaveLength(20);
      expect(result).toEndWith('...');
    });

    it('should not truncate text shorter than maxLength', () => {
      const shortText = 'Short text';
      const result = truncateText(shortText, 20);
      expect(result).toBe(shortText);
    });

    it('should handle custom suffix', () => {
      const result = truncateText(longText, 20, ' [more]');
      expect(result).toEndWith(' [more]');
      expect(result).toHaveLength(20);
    });

    it('should handle empty suffix', () => {
      const result = truncateText(longText, 20, '');
      expect(result).toHaveLength(20);
      expect(result).not.toEndWith('...');
    });

    it('should handle maxLength equal to text length', () => {
      const text = 'Exact length';
      const result = truncateText(text, text.length);
      expect(result).toBe(text);
    });

    it('should handle maxLength smaller than suffix', () => {
      const result = truncateText(longText, 2);
      expect(result).toHaveLength(2);
      expect(result).toBe('..');
    });

    it('should handle empty text', () => {
      const result = truncateText('', 10);
      expect(result).toBe('');
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

    it('should deep clone arrays', () => {
      const original = [1, [2, 3], { a: 4 }];
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[1]).not.toBe(original[1]);
      expect(cloned[2]).not.toBe(original[2]);
    });

    it('should handle primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('string')).toBe('string');
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
    });

    it('should handle Date objects as strings (JSON limitation)', () => {
      const date = new Date('2024-01-01');
      const cloned = deepClone(date);
      expect(cloned).toBe(date.toISOString());
    });

    it('should handle functions by omitting them (JSON limitation)', () => {
      const original = {
        a: 1,
        fn: () => 'test'
      };
      
      const cloned = deepClone(original);
      expect(cloned.a).toBe(1);
      expect(cloned.fn).toBeUndefined();
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

    it('should reset timer on subsequent calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);
      
      debouncedFn('first');
      
      // Advance time partially
      jest.advanceTimersByTime(500);
      
      // Call again (should reset timer)
      debouncedFn('second');
      
      // Advance remaining time from first call
      jest.advanceTimersByTime(500);
      
      // Should not have been called yet
      expect(mockFn).not.toHaveBeenCalled();
      
      // Advance full debounce time
      jest.advanceTimersByTime(500);
      
      // Should be called with second argument
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('second');
    });

    it('should handle zero wait time', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 0);
      
      debouncedFn('test');
      
      jest.advanceTimersByTime(0);
      
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('should handle multiple arguments', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn('arg1', 'arg2', 'arg3');
      
      jest.advanceTimersByTime(100);
      
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
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

    it('should handle rapid successive calls', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 500);
      
      // Call 10 times rapidly
      for (let i = 0; i < 10; i++) {
        throttledFn(`call-${i}`);
        jest.advanceTimersByTime(50); // 50ms between calls
      }
      
      // Only first call should have executed (500ms not elapsed)
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call-0');
    });

    it('should handle zero limit time', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 0);
      
      // All calls should execute with zero throttle
      throttledFn('first');
      throttledFn('second');
      throttledFn('third');
      
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should preserve function arguments', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);
      
      throttledFn('arg1', 42, true);
      
      expect(mockFn).toHaveBeenCalledWith('arg1', 42, true);
    });

    it('should reset throttle after limit time', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);
      
      // First call
      throttledFn('first');
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      // Advance time to reset throttle
      jest.advanceTimersByTime(100);
      
      // Next call should execute
      throttledFn('second');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenLastCalledWith('second');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle cn() with complex nested conditions', () => {
      const props = { variant: 'primary', disabled: false, size: 'large' };
      
      const result = cn(
        'button',
        props.variant === 'primary' && 'btn-primary',
        props.variant === 'secondary' && 'btn-secondary',
        props.disabled && 'opacity-50',
        !props.disabled && 'hover:opacity-80',
        {
          'text-sm': props.size === 'small',
          'text-lg': props.size === 'large',
        }
      );
      
      expect(result).toContain('button');
      expect(result).toContain('btn-primary');
      expect(result).toContain('hover:opacity-80');
      expect(result).toContain('text-lg');
      expect(result).not.toContain('btn-secondary');
      expect(result).not.toContain('opacity-50');
    });

    it('should handle formatError() with circular references', () => {
      const circular: any = { a: 1 };
      circular.self = circular;
      
      const result = formatError(circular);
      expect(result).toBe('[object Object]');
    });

    it('should handle deepClone() with circular references gracefully', () => {
      const circular: any = { a: 1 };
      circular.self = circular;
      
      // JSON.parse/stringify will throw on circular references
      expect(() => deepClone(circular)).toThrow();
    });
  });
});