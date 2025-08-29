/**
 * Newsletter Kit - Class Name Utility
 * Conditional class name utility function
 * 
 * @version 1.0.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to conditionally apply CSS classes
 * Combines clsx for conditional classes with tailwind-merge for Tailwind CSS conflicts
 * 
 * @param inputs - Class values (strings, objects, arrays)
 * @returns Merged class string
 * 
 * @example
 * ```tsx
 * cn('base-class', { 'active': isActive }, 'text-red-500')
 * // Returns: 'base-class active text-red-500' (if isActive is true)
 * 
 * cn('text-red-500', 'text-blue-500')
 * // Returns: 'text-blue-500' (tailwind-merge resolves conflicts)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}