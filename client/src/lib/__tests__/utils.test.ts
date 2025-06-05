import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility function', () => {
  it('combines multiple class names', () => {
    const result = cn('class1', 'class2', 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('handles conditional classes', () => {
    const result = cn('base', true && 'conditional', false && 'hidden');
    expect(result).toBe('base conditional');
  });

  it('merges tailwind classes correctly', () => {
    // tailwind-merge should merge conflicting classes, keeping the last one
    const result = cn('px-2 px-4');
    expect(result).toBe('px-4');
  });

  it('handles arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('handles objects with conditional classes', () => {
    const result = cn({
      'base-class': true,
      'active': true,
      'hidden': false
    });
    expect(result).toBe('base-class active');
  });

  it('handles empty and undefined inputs', () => {
    const result = cn('', undefined, null, 'valid-class');
    expect(result).toBe('valid-class');
  });

  it('handles complex tailwind merging', () => {
    // Should merge conflicting utility classes
    const result = cn('bg-red-500 bg-blue-500 text-white');
    expect(result).toBe('bg-blue-500 text-white');
  });

  it('preserves non-conflicting classes', () => {
    const result = cn('flex items-center justify-between bg-white text-black');
    expect(result).toBe('flex items-center justify-between bg-white text-black');
  });
});