import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Utils', () => {
  describe('cn function', () => {
    it('merges class names correctly', () => {
      const result = cn('btn', 'btn-primary');
      expect(result).toBe('btn btn-primary');
    });

    it('handles conditional classes', () => {
      const isActive = true;
      const isDisabled = false;
      
      const result = cn(
        'btn',
        isActive && 'active',
        isDisabled && 'disabled'
      );
      
      expect(result).toBe('btn active');
    });

    it('handles undefined and null values', () => {
      const result = cn('btn', null, undefined, 'primary');
      expect(result).toBe('btn primary');
    });

    it('handles empty strings', () => {
      const result = cn('btn', '', 'primary');
      expect(result).toBe('btn primary');
    });

    it('handles array of classes', () => {
      const result = cn(['btn', 'btn-large'], 'primary');
      expect(result).toBe('btn btn-large primary');
    });

    it('handles object notation', () => {
      const result = cn({
        'btn': true,
        'btn-primary': true,
        'disabled': false
      });
      expect(result).toBe('btn btn-primary');
    });

    it('handles complex combinations', () => {
      const isActive = true;
      const size = 'large';
      
      const result = cn(
        'btn',
        {
          'btn-active': isActive,
          'btn-disabled': false
        },
        size && `btn-${size}`,
        ['rounded', 'shadow']
      );
      
      expect(result).toBe('btn btn-active btn-large rounded shadow');
    });

    it('resolves Tailwind conflicts correctly', () => {
      // The cn function should resolve conflicts between similar Tailwind classes
      const result = cn('px-4 px-6', 'py-2 py-4');
      // Should keep the last conflicting class
      expect(result).toContain('px-6');
      expect(result).toContain('py-4');
      expect(result).not.toContain('px-4');
      expect(result).not.toContain('py-2');
    });

    it('handles no arguments', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('handles single argument', () => {
      const result = cn('btn');
      expect(result).toBe('btn');
    });

    it('trims extra whitespace', () => {
      const result = cn('  btn  ', '  primary  ');
      expect(result).toBe('btn primary');
    });

    it('handles nested arrays', () => {
      const result = cn(['btn', ['primary', 'large']], 'rounded');
      expect(result).toBe('btn primary large rounded');
    });

    it('handles boolean expressions in arrays', () => {
      const isActive = true;
      const isDisabled = false;
      
      const result = cn([
        'btn',
        isActive && 'active',
        isDisabled && 'disabled'
      ]);
      
      expect(result).toBe('btn active');
    });

    it('handles mixed types correctly', () => {
      const result = cn(
        'btn',
        true && 'active',
        false && 'disabled',
        { 'primary': true, 'secondary': false },
        ['rounded', 'shadow'],
        ''
      );
      
      expect(result).toBe('btn active primary rounded shadow');
    });
  });
});